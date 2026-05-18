const app = getApp()

const INTERVALS = [1, 3, 7, 14, 30]
const MAX_STAGE = 5
const PASS_CORRECT = 3  // 连续答对几题才算通过

Page({
  data: {
    // 状态
    phase: 'loading',    // loading | empty | quiz | complete | feedback
    reviewWords: [],
    wordIndex: 0,
    wordStatus: {},      // { key: { consecutiveCorrect, totalQuestions, wrongCount } }

    // 当前题目
    questionType: 0,     // 1-听选词 2-看选义 3-义选词 4-听选义
    currentWord: '',
    currentPhonetic: '',
    currentMeaning: '',
    options: [],         // [{key, label}]
    correctKey: '',
    selectedKey: '',
    answered: false,
    isCorrect: false,

    // 反馈状态
    feedback: '',         // 'correct' | 'wrong' | ''
    sessionProgress: '',  // '1/3 正确' | '答错，重新开始'
    sessionBar: 0,        // 0-100
    sessionCorrectCount: 0,  // 当前词连续答对数

    // 统计
    totalAnswered: 0,
    correctCount: 0,
    wrongCount: 0,
    passingWords: 0,
    failingWords: 0,
    currentModule: '',

    // 完成
    completed: false,
    streakCount: 0,
    isNewStreak: false,
    totalToday: 0,
    audioCtx: null
  },

  onLoad() {
    this.setData({ audioCtx: wx.createInnerAudioContext() })
    this.prepareReview()
  },

  onUnload() {
    if (this.data.audioCtx) {
      this.data.audioCtx.destroy()
    }
  },

  prepareReview() {
    const words = app.globalData.words
    if (!words || Object.keys(words).length === 0) {
      this.setData({ phase: 'empty', loading: false })
      return
    }

    const today = new Date().toISOString().slice(0, 10)

    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}

      // 找出到期词
      let dueWords = []
      for (const [key, s] of Object.entries(schedule)) {
        if (!mastered.includes(key) && s.dueDate <= today && s.stage >= 0) {
          if (words[key]) {
            dueWords.push({
              key,
              word: words[key],
              stage: s.stage
            })
          }
        }
      }

      if (dueWords.length === 0) {
        this.setData({ phase: 'empty', loading: false })
        return
      }

      // 打乱
      for (let i = dueWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dueWords[i], dueWords[j]] = [dueWords[j], dueWords[i]]
      }

      this.wordKeys = dueWords.map(w => w.key)
      this.wordCache = {}
      dueWords.forEach(w => { this.wordCache[w.key] = w })

      // 初始化每个词的状态
      const wordStatus = {}
      dueWords.forEach(w => {
        wordStatus[w.key] = {
          consecutiveCorrect: 0,
          totalAnswered: 0,
          wrongCount: 0,
          passed: false
        }
      })

      this.setData({
        reviewWords: dueWords,
        wordStatus,
        wordIndex: 0,
        totalToday: dueWords.length,
        phase: 'quiz',
        completed: false
      })

      // 开始第一个词的题
      this.nextWord()
    }).catch(() => {
      this.setData({ phase: 'empty' })
    })
  },

  // ===== 题目生成 =====

  getDistractors(wordKey, wordData, count = 3) {
    const words = app.globalData.words
    const candidates = []
    for (const [k, v] of Object.entries(words)) {
      if (k === wordKey) continue
      // 优先同module，如果没有足够的再从全部里取
      if (v.module === wordData.module) {
        candidates.push({ key: k, word: v })
      }
    }
    // 同module不够，从全部补
    if (candidates.length < count) {
      for (const [k, v] of Object.entries(words)) {
        if (k === wordKey || v.module === wordData.module) continue
        if (candidates.length >= count * 2) break
        candidates.push({ key: k, word: v })
      }
    }

    // 打乱取前count个
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]]
    }
    return candidates.slice(0, count)
  },

  generateQuestion(wordKey, wordData) {
    // 确定可用题型
    const types = wordData.pronounceFile ? [1, 2, 3, 4] : [2, 3]
    // 从该词session的历史题型中排除已出过的，避免重复
    const ws = this.data.wordStatus[wordKey]
    const usedTypes = ws._usedTypes || []
    const available = types.filter(t => !usedTypes.includes(t))
    // 如果都用过了，重置（说明该词题多，但3题一般不会用完4个题型）
    const typePool = available.length > 0 ? available : types
    const type = typePool[Math.floor(Math.random() * typePool.length)]

    // 更新已用题型
    ws._usedTypes = [...(ws._usedTypes || []), type]

    const distractors = this.getDistractors(wordKey, wordData)
    const distractorKeys = distractors.map(d => d.key)

    // 构建选项
    let options = []
    let correctLabel = ''
    let correctKey = wordKey

    switch (type) {
      case 1: // 听音选词
        correctLabel = wordData.word
        options = this.shuffleOptions([
          { key: wordKey, label: wordData.word },
          ...distractors.map(d => ({ key: d.key, label: d.word.word }))
        ])
        break
      case 2: // 看词选义
        correctLabel = wordData.cnMeaning
        options = this.shuffleOptions([
          { key: wordKey, label: wordData.cnMeaning },
          ...distractors.map(d => ({ key: d.key, label: d.word.cnMeaning }))
        ])
        break
      case 3: // 看义选词
        correctLabel = wordData.word
        options = this.shuffleOptions([
          { key: wordKey, label: wordData.word },
          ...distractors.map(d => ({ key: d.key, label: d.word.word }))
        ])
        break
      case 4: // 听音选义
        correctLabel = wordData.cnMeaning
        options = this.shuffleOptions([
          { key: wordKey, label: wordData.cnMeaning },
          ...distractors.map(d => ({ key: d.key, label: d.word.cnMeaning }))
        ])
        break
    }

    return { type, correctKey, correctLabel, options, distractors }
  },

  shuffleOptions(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  },

  // ===== 流程控制 =====

  nextWord() {
    const { wordIndex, reviewWords, wordStatus } = this.data
    if (wordIndex >= reviewWords.length) {
      this.showCompletion()
      return
    }

    const wordInfo = reviewWords[wordIndex]
    const key = wordInfo.key
    const wordData = wordInfo.word

    // 重置词状态
    wordStatus[key]._usedTypes = []
    wordStatus[key].consecutiveCorrect = 0

    this.setData({
      wordStatus,
      currentModule: wordData.module || '',
      sessionCorrectCount: 0,
      sessionProgress: '',
      sessionBar: 0
    })

    this.showNextQuestion(key)
  },

  showNextQuestion(wordKey) {
    const wordInfo = this.wordCache[wordKey]
    const wordData = wordInfo.word

    const question = this.generateQuestion(wordKey, wordData)

    this.setData({
      questionType: question.type,
      currentWord: wordData.word,
      currentPhonetic: wordData.phonetic,
      currentMeaning: wordData.cnMeaning,
      options: question.options,
      correctKey: question.correctKey,
      selectedKey: '',
      answered: false,
      isCorrect: false,
      feedback: ''
    })

    // 如果是听音题型(1/4)，自动放音
    if ((question.type === 1 || question.type === 4) && wordData.pronounceFile) {
      this.playAudio(wordData.pronounceFile)
    }
  },

  playAudio(src) {
    const { audioCtx } = this.data
    if (!audioCtx || !src) return
    audioCtx.stop()
    audioCtx.src = src
    audioCtx.play()
  },

  onPlaySound() {
    const { currentWord, questionType, reviewWords, wordIndex } = this.data
    const wordInfo = reviewWords[wordIndex]
    if (!wordInfo) return
    const pronounceFile = wordInfo.word.pronounceFile
    if (pronounceFile) {
      this.playAudio(pronounceFile)
    } else {
      wx.showToast({ title: '暂无音频', icon: 'none' })
    }
  },

  // ===== 作答 =====

  onSelectOption(e) {
    if (this.data.answered) return

    const key = e.currentTarget.dataset.key
    const isCorrect = key === this.data.correctKey

    this.setData({
      selectedKey: key,
      answered: true,
      isCorrect
    })

    if (isCorrect) {
      this.onCorrect()
    } else {
      this.onWrong()
    }
  },

  onCorrect() {
    const { wordIndex, reviewWords, wordStatus } = this.data
    const info = reviewWords[wordIndex]
    const key = info.key

    wordStatus[key].consecutiveCorrect++
    wordStatus[key].totalAnswered++

    const correct = wordStatus[key].consecutiveCorrect
    const passed = correct >= PASS_CORRECT

    this.setData({
      wordStatus,
      feedback: 'correct',
      sessionCorrectCount: correct,
      sessionProgress: passed ? '🎉 通过！' : `✅ ${correct}/${PASS_CORRECT}`,
      sessionBar: Math.round((correct / PASS_CORRECT) * 100)
    })

    if (passed) {
      // 标记通过，推进间隔
      wordStatus[key].passed = true
      this.saveProgress(key, info.stage, true)
      setTimeout(() => this.afterFeedback(), 800)
    } else {
      setTimeout(() => this.afterFeedback(), 600)
    }
  },

  onWrong() {
    const { wordIndex, reviewWords, wordStatus } = this.data
    const info = reviewWords[wordIndex]
    const key = info.key

    wordStatus[key].consecutiveCorrect = 0
    wordStatus[key].totalAnswered++
    wordStatus[key].wrongCount++

    this.setData({
      wordStatus,
      feedback: 'wrong',
      sessionCorrectCount: 0,
      sessionProgress: '🔄 答错了，再来一次',
      sessionBar: 0
    })

    setTimeout(() => this.afterFeedback(), 1000)
  },

  afterFeedback() {
    const { wordIndex, reviewWords, wordStatus } = this.data
    const info = reviewWords[wordIndex]
    const key = info.key
    const ws = wordStatus[key]

    if (ws.passed) {
      // 进入下一个词
      this.setData({ wordIndex: wordIndex + 1 })
      this.nextWord()
    } else {
      // 继续出同词下一题
      this.showNextQuestion(key)
    }
  },

  // ===== 进度保存 =====

  saveProgress(key, currentStage, passed) {
    if (passed) {
      // 通过：推进间隔
      let newStage = (currentStage || 0) + 1
      if (newStage >= MAX_STAGE) {
        // 掌握
        wx.cloud.callFunction({
          name: 'updateProgress',
          data: { field: 'mastered', key, add: true }
        }).catch(() => {})
        wx.cloud.callFunction({
          name: 'updateProgress',
          data: { field: 'schedule', key, add: false }
        }).catch(() => {})
      } else {
        const interval = INTERVALS[newStage] || 1
        const due = new Date()
        due.setDate(due.getDate() + interval)
        wx.cloud.callFunction({
          name: 'updateProgress',
          data: {
            field: 'schedule',
            key,
            add: true,
            value: { stage: newStage, dueDate: due.toISOString().slice(0, 10) }
          }
        }).catch(() => {})
      }
    } else {
      // 未通过：重置到上一阶段（或保持当前stage减间隔）
      let newStage = Math.max(0, (currentStage || 0) - 1)
      const interval = INTERVALS[newStage] || 1
      const due = new Date()
      due.setDate(due.getDate() + interval)
      wx.cloud.callFunction({
        name: 'updateProgress',
        data: {
          field: 'schedule',
          key,
          add: true,
          value: { stage: newStage, dueDate: due.toISOString().slice(0, 10) }
        }
      }).catch(() => {})
    }
  },

  // ===== 完成 =====

  showCompletion() {
    const today = new Date().toISOString().slice(0, 10)
    const lastStudy = wx.getStorageSync('lastStudyDate') || ''
    let streak = 1
    let isNewStreak = true

    if (lastStudy === today) {
      streak = wx.getStorageSync('streakCount') || 1
      isNewStreak = false
    } else {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      if (lastStudy === yesterday.toISOString().slice(0, 10)) {
        streak = (wx.getStorageSync('streakCount') || 1) + 1
      }
    }

    wx.setStorageSync('lastStudyDate', today)
    wx.setStorageSync('streakCount', streak)

    // 统计
    const { wordStatus } = this.data
    let passed = 0, failed = 0, wrongTotal = 0
    for (const ws of Object.values(wordStatus)) {
      if (ws.passed) passed++
      else if (ws.totalAnswered > 0) failed++
      if (ws.wrongCount > 0) wrongTotal += ws.wrongCount
    }

    this.setData({
      completed: true,
      phase: 'complete',
      passingWords: passed,
      failingWords: failed,
      totalAnswered: Object.values(wordStatus).reduce((s, ws) => s + ws.totalAnswered, 0),
      wrongCount: wrongTotal,
      correctCount: Object.values(wordStatus).reduce((s, ws) => s + ws.totalAnswered - ws.wrongCount, 0),
      streakCount: streak,
      isNewStreak
    })
  },

  onUnload() {
    // 保存当前词的进度（无论是否通过）
    const { wordIndex, reviewWords, wordStatus } = this.data
    if (wordIndex < reviewWords.length) {
      const info = reviewWords[wordIndex]
      const ws = wordStatus[info.key]
      if (ws && ws.totalAnswered > 0 && !ws.passed && !ws._saved) {
        ws._saved = true
        // 未通过：后退一档
        this.saveProgress(info.key, info.stage, false)
      }
    }

    // 保存前面所有经过的词中未保存的
    for (let i = 0; i < wordIndex; i++) {
      const info = reviewWords[i]
      const ws = wordStatus[info.key]
      if (ws && ws.totalAnswered > 0 && ws.passed && !ws._saved) {
        ws._saved = true
        this.saveProgress(info.key, info.stage, true)
      }
    }

    if (this.data.audioCtx) {
      this.data.audioCtx.destroy()
    }
  },

  onGoHome() {
    wx.navigateBack()
  }
})
