const app = getApp()

const INTERVALS = [1, 3, 7, 14, 30]
const MAX_STAGE = 5
const PASS_CORRECT = 3  // 连续答对几次才算通过

// 每词通过时的鼓励文案（轮换）
const MASTER_MESSAGES = [
  '🎉 拿下！{word} 已掌握',
  '⚡ 漂亮！{word} 过关了',
  '🌟 稳！{word} 记住了',
  '💪 可以啊，{word} 通过',
  '✨ 不错！{word} 已收入囊中',
  '🎯 精准！{word} 搞定',
]

// 里程碑
const MILESTONES = {
  1: { icon: '🎉', text: '第一个掌握！好的开始！' },
  5: { icon: '🔥', text: '连过5个！状态不错' },
  10: { icon: '⭐', text: '10个词稳了！厉害了' },
}

Page({
  data: {
    phase: 'loading',    // loading | empty | quiz | masterCelebration | complete

    // 队列
    reviewQueue: [],     // [ {key, correct, stage, wordData}, ... ]
    queueSize: 0,
    currentIndex: 0,     // 当前在处理 queue 中的第几个
    currentWord: '',
    currentKey: '',
    currentPhonetic: '',
    currentMeaning: '',
    currentCorrect: 0,
    currentStage: 0,

    // 题目
    questionType: 0,
    options: [],
    correctKey: '',
    selectedKey: '',
    answered: false,
    isCorrect: false,
    feedback: '',

    // 进度
    progressCount: 0,     // 已通过数
    totalWordCount: 0,    // 总词数（不含已掌握的）

    // 答题统计
    totalAnswered: 0,
    correctAnswerCount: 0,
    wrongAnswerCount: 0,
    passingWords: 0,
    finalTimes: [],

    // 弹窗
    showMasterPopup: false,
    masterMessage: '',
    masterIcon: '🎉',

    // 完成
    completed: false,
    streakCount: 0,
    isNewStreak: false,

    audioCtx: null,
  },

  onLoad() {
    this.setData({ audioCtx: wx.createInnerAudioContext() })
    this.prepareReview()
  },

  onUnload() {
    // 保存所有通过但未写回云端的词
    this.flushSavedWords()
    if (this.data.audioCtx) {
      this.data.audioCtx.destroy()
    }
  },

  // ===== 初始化 =====

  prepareReview() {
    const words = app.globalData.words
    if (!words || Object.keys(words).length === 0) {
      this.setData({ phase: 'empty' })
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
            dueWords.push({ key, word: words[key], stage: s.stage })
          }
        }
      }

      if (dueWords.length === 0) {
        this.setData({ phase: 'empty' })
        return
      }

      // 打乱
      for (let i = dueWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dueWords[i], dueWords[j]] = [dueWords[j], dueWords[i]]
      }

      this.wordCache = {}
      dueWords.forEach(w => { this.wordCache[w.key] = w })

      // 构建队列，每个元素记录正确答案计数
      const queue = dueWords.map(w => ({
        key: w.key,
        correct: 0,
        stage: w.stage,
        mastered: false,
        _saved: false
      }))

      this.setData({
        reviewQueue: queue,
        queueSize: queue.length,
        totalWordCount: queue.length,
        progressCount: 0,
        currentIndex: 0,
        phase: 'quiz',
        completed: false,
        totalAnswered: 0,
        correctAnswerCount: 0,
        wrongAnswerCount: 0,
        passingWords: 0
      })

      this.startCurrentWord()
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
      if (v.module === wordData.module) {
        candidates.push({ key: k, word: v })
      }
    }
    if (candidates.length < count) {
      for (const [k, v] of Object.entries(words)) {
        if (k === wordKey || v.module === wordData.module) continue
        if (candidates.length >= count * 2) break
        candidates.push({ key: k, word: v })
      }
    }
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]]
    }
    return candidates.slice(0, count)
  },

  generateQuestion(wordKey, wordData) {
    const types = wordData.pronounceFile ? [1, 2, 3, 4] : [2, 3]
    const type = types[Math.floor(Math.random() * types.length)]

    const distractors = this.getDistractors(wordKey, wordData)
    let options = []

    switch (type) {
      case 1:
        options = this.shuffleOptions([
          { key: wordKey, label: wordData.word },
          ...distractors.map(d => ({ key: d.key, label: d.word.word }))
        ])
        break
      case 2:
        options = this.shuffleOptions([
          { key: wordKey, label: wordData.cnMeaning },
          ...distractors.map(d => ({ key: d.key, label: d.word.cnMeaning }))
        ])
        break
      case 3:
        options = this.shuffleOptions([
          { key: wordKey, label: wordData.word },
          ...distractors.map(d => ({ key: d.key, label: d.word.word }))
        ])
        break
      case 4:
        options = this.shuffleOptions([
          { key: wordKey, label: wordData.cnMeaning },
          ...distractors.map(d => ({ key: d.key, label: d.word.cnMeaning }))
        ])
        break
    }

    return { type, correctKey: wordKey, options }
  },

  shuffleOptions(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  },

  // ===== 出题 =====

  startCurrentWord() {
    const { reviewQueue, currentIndex } = this.data
    if (currentIndex >= reviewQueue.length) {
      // 队列为空，但可能还有未通过的词（在队尾循环中）
      this.showCompletion()
      return
    }

    const entry = reviewQueue[currentIndex]
    const cache = this.wordCache[entry.key]
    if (!cache) {
      this.nextWord()
      return
    }

    const wordData = cache.word
    const question = this.generateQuestion(entry.key, wordData)

    this.setData({
      currentWord: wordData.word,
      currentKey: entry.key,
      currentPhonetic: wordData.phonetic,
      currentMeaning: wordData.cnMeaning,
      currentCorrect: entry.correct,
      currentStage: entry.stage,
      questionType: question.type,
      options: question.options,
      correctKey: question.correctKey,
      selectedKey: '',
      answered: false,
      isCorrect: false,
      feedback: '',
      currentModule: wordData.module || ''
    })

    // 听音题自动播放
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
    const { reviewQueue, currentIndex } = this.data
    const entry = reviewQueue[currentIndex]
    if (!entry) return
    const cache = this.wordCache[entry.key]
    if (cache && cache.word.pronounceFile) {
      this.playAudio(cache.word.pronounceFile)
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

    this.setData({
      totalAnswered: this.data.totalAnswered + 1
    })

    if (isCorrect) {
      this.setData({ correctAnswerCount: this.data.correctAnswerCount + 1 })
      this.onCorrect()
    } else {
      this.setData({ wrongAnswerCount: this.data.wrongAnswerCount + 1 })
      this.onWrong()
    }
  },

  onCorrect() {
    const { reviewQueue, currentIndex } = this.data
    const entry = reviewQueue[currentIndex]
    if (!entry) return

    entry.correct = (entry.correct || 0) + 1
    const passed = entry.correct >= PASS_CORRECT

    this.setData({
      reviewQueue,
      feedback: 'correct'
    })

    if (passed) {
      this.onWordMastered(entry)
    } else {
      // 答对但未满3次 → 移到队尾
      this.moveToEnd(entry)
      setTimeout(() => this.afterFeedback(), 500)
    }
  },

  onWrong() {
    const { reviewQueue, currentIndex } = this.data
    const entry = reviewQueue[currentIndex]
    if (!entry) return

    entry.correct = 0  // 归零
    this.setData({
      reviewQueue,
      feedback: 'wrong'
    })

    // 答错 → 移到队尾
    this.moveToEnd(entry)
    setTimeout(() => this.afterFeedback(), 700)
  },

  // ===== 队列操作 =====

  moveToEnd(entry) {
    const { reviewQueue, currentIndex } = this.data
    // 从当前位置移除
    reviewQueue.splice(currentIndex, 1)
    // 追加到末尾
    reviewQueue.push(entry)
    
    // 如果移除的是最后一个元素，currentIndex 指向的已是末尾之后
    // 下一轮自动回到队首
    if (currentIndex >= reviewQueue.length) {
      this.setData({ reviewQueue, currentIndex: 0 })
    } else {
      this.setData({ reviewQueue })
    }
  },

  // ===== 通过 → 弹窗庆祝 =====

  onWordMastered(entry) {
    const cache = this.wordCache[entry.key]
    const wordName = cache ? cache.word.word : entry.key

    // 构建鼓励文案（轮换）
    const msgIndex = this.data.passingWords % MASTER_MESSAGES.length
    const message = MASTER_MESSAGES[msgIndex].replace('{word}', wordName)

    const newProgress = this.data.progressCount + 1
    this.setData({
      passingWords: newProgress,
      progressCount: newProgress,
      showMasterPopup: true,
      masterMessage: message,
      masterIcon: '🎉'
    })

    // 检查里程碑
    if (MILESTONES[newProgress]) {
      // 有里程碑的话，弹窗显示里程碑文案
      this.setData({
        masterMessage: `${MILESTONES[newProgress].icon} ${MILESTONES[newProgress].text}`,
        masterIcon: MILESTONES[newProgress].icon
      })
    }

    // 标记已掌握
    entry.mastered = true

    // 保存进度到云端
    this.saveWordProgress(entry.key, entry.stage, true)

    // 从队列移除
    const { reviewQueue, currentIndex } = this.data
    reviewQueue.splice(currentIndex, 1)

    this.setData({ reviewQueue })

    // 1.5 秒后关闭弹窗，继续下一题
    setTimeout(() => {
      this.setData({ showMasterPopup: false })
      this.afterFeedback()
    }, 1500)
  },

  afterFeedback() {
    const { reviewQueue, currentIndex } = this.data
    
    if (reviewQueue.length === 0) {
      this.showCompletion()
      return
    }

    // currentIndex 已被 moveToEnd 调整好
    // 直接出下一题
    this.startCurrentWord()
  },

  // ===== 云端保存 =====

  saveWordProgress(key, currentStage, passed) {
    if (passed) {
      const newStage = (currentStage || 0) + 1
      if (newStage >= MAX_STAGE) {
        // 最终掌握
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
    }
  },

  flushSavedWords() {
    // 离开页面时，保存本轮所有已通过但未写回云端的
    const { reviewQueue } = this.data
    for (const entry of reviewQueue) {
      if (entry.mastered && !entry._saved) {
        entry._saved = true
        this.saveWordProgress(entry.key, entry.stage, true)
      }
    }
  },

  // ===== 完成页 =====

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

    this.setData({
      completed: true,
      phase: 'complete',
      streakCount: streak,
      isNewStreak,
      finalTimes: this.data.passingWords
    })

    // 全部通过时显示撒花 + 大弹窗
    if (this.data.passingWords >= this.data.totalWordCount) {
      this.setData({
        showMasterPopup: true,
        masterMessage: '🎊 全部通关！太棒了！🎊',
        masterIcon: '🏆'
      })
      setTimeout(() => {
        this.setData({ showMasterPopup: false })
      }, 2500)
    }
  },

  onGoHome() {
    this.flushSavedWords()
    if (this.data.audioCtx) {
      this.data.audioCtx.destroy()
    }
    wx.navigateBack()
  }
})
