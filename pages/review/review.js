const app = getApp()

const INTERVALS = [1, 3, 7, 14, 30]
const MAX_STAGE = 5
const PASS_CORRECT = 3
const MIN_GAP = 5  // 两题之间的最小间隔词数

const CLOUD_BASE = 'cloud://cloudbase-d2gs4fpbhca51e19f.636c-cloudbase-d2gs4fpbhca51e19f-1433289257'

function getWordAudioSrc(wordKey, wordData) {
  if (wordData.pronounceFile) return wordData.pronounceFile
  if (wordKey.startsWith('r4_')) return `${CLOUD_BASE}/audio/r4/${wordKey}.mp3`
  return ''
}

const MASTER_MESSAGES = [
  '🎉 拿下！{word} 已掌握',
  '⚡ 漂亮！{word} 过关了',
  '🌟 稳！{word} 记住了',
  '💪 可以啊，{word} 通过',
  '✨ 不错！{word} 已收入囊中',
  '🎯 精准！{word} 搞定',
]

const MILESTONES = {
  1: { icon: '🎉', text: '第一个掌握！好的开始！' },
  5: { icon: '🔥', text: '连过5个！状态不错！' },
  10: { icon: '⭐', text: '10个词稳了！厉害了！' },
  20: { icon: '💎', text: '20个词！太强了！' },
}

// 教材→词前缀映射（用于按教材筛选复习）
const TEXTBOOK_PREFIX = {
  'r4-2024q': 'r4_',
  '9a-2026q': '',
  '8b-2026c': '8b_'
}

// 获取本地日期（YYYY-MM-DD），避免 .toISOString() 的 UTC 时区问题
function getLocalDate(d) {
  const date = d || new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

Page({
  data: {
    textbook: '',          // 传了则只复习该教材的词
    phase: 'loading',      // loading | empty | quiz | complete

    // 队列
    reviewQueue: [],        // [{key, correct, stage, mastered}]
    currentIndex: 0,
    totalWordCount: 0,
    passingWords: 0,
    gapSize: 0,             // 实际间隔数

    // 当前词/题
    currentWord: '',
    currentKey: '',
    currentPhonetic: '',
    currentMeaning: '',
    currentCorrect: 0,
    currentStage: 0,
    currentReviewRound: 1,
    currentModule: '',
    questionType: 0,
    options: [],
    correctKey: '',
    selectedKey: '',
    answered: false,
    isCorrect: false,
    feedback: '',

    // 统计
    totalAnswered: 0,
    correctAnswerCount: 0,
    wrongAnswerCount: 0,

    // 弹窗
    showMasterPopup: false,
    masterMessage: '',
    masterIcon: '',

    // 完成
    completed: false,
    streakCount: 0,
    isNewStreak: false,

    audioCtx: null,
    effectCtx: null,
  },

  onLoad(options) {
    const textbook = options.textbook || ''
    this.setData({ 
      textbook,
      audioCtx: wx.createInnerAudioContext(),
      effectCtx: wx.createInnerAudioContext()
    })
    this.prepareReview()
  },

  onUnload() {
    this.saveAllProgress()
    try { if (this.data.audioCtx) this.data.audioCtx.destroy() } catch (e) {}
    try { if (this.data.effectCtx) this.data.effectCtx.destroy() } catch (e) {}
  },

  // ========== 初始化 ==========

  prepareReview() {
    const words = app.globalData.words
    if (!words || Object.keys(words).length === 0) {
      this.setData({ phase: 'empty' })
      return
    }

    const today = getLocalDate()
    const prefix = TEXTBOOK_PREFIX[this.data.textbook] ?? null

    wx.cloud.callFunction({ name: 'getProgress' }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}

      let dueWords = []
      for (const [key, s] of Object.entries(schedule)) {
        if (!mastered.includes(key) && s.dueDate <= today && s.stage >= 0) {
          if (words[key]) {
            // 按教材过滤
            if (prefix === '') {
              // 无前缀教材（如九上）→ 不匹配任何前缀的词
              if (key.startsWith('r4_') || key.startsWith('8b_')) continue
            } else if (prefix !== null) {
              // 有前缀教材（如人教四上 r4_）→ 只匹配该前缀
              if (!key.startsWith(prefix)) continue
            }
            // prefix === null → 不过滤，显示所有
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

      const queue = dueWords.map(w => ({
        key: w.key,
        correct: 0,
        wrongCount: 0,
        stage: w.stage,
        mastered: false,
        skipped: false,
        _saved: false
      }))

      this.setData({
        reviewQueue: queue,
        totalWordCount: queue.length,
        passingWords: 0,
        currentIndex: 0,
        gapSize: Math.min(MIN_GAP, queue.length - 1),
        phase: 'quiz',
        completed: false,
        totalAnswered: 0,
        correctAnswerCount: 0,
        wrongAnswerCount: 0
      })

      // 先预加载第一个词的音频（提前缓冲，不管是什么题型）
      this.preloadFirstReviewAudio()

      try {
        this.startCurrentWord()
      } catch (e) {
        console.error('[复习] startCurrentWord出错:', e, e.stack)
        this.setData({ phase: 'empty' })
      }
    }).catch(e => {
      console.error('[复习] prepareReview失败:', e)
      this.setData({ phase: 'empty' })
    })
  },

  // ========== 题目生成 ==========

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
        if (candidates.length >= count + 3) break
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
    const hasAudio = !!getWordAudioSrc(wordKey, wordData)
    const types = hasAudio ? [1, 2, 3, 4] : [2, 3]
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

  // ========== 出题 ==========

  startCurrentWord() {
    const { reviewQueue, currentIndex } = this.data
    if (currentIndex >= reviewQueue.length) {
      this.showCompletion()
      return
    }

    const entry = reviewQueue[currentIndex]
    const cache = this.wordCache[entry.key]
    if (!cache) {
      this.advanceIndex()
      return
    }

    const wordData = cache.word
    const question = this.generateQuestion(entry.key, wordData)

    this.setData({
      currentWord: wordData.word,
      currentKey: entry.key,
      currentPhonetic: wordData.phonetic || '',
      currentMeaning: wordData.cnMeaning,
      currentCorrect: entry.correct,
      currentStage: entry.stage,
      currentReviewRound: entry.stage + 1,
      currentModule: wordData.module || '',
      questionType: question.type,
      options: question.options,
      correctKey: question.correctKey,
      selectedKey: '',
      answered: false,
      isCorrect: false,
      feedback: ''
    })

    // 预加载当前词的音频（设src让音频开始缓冲）
    this.preloadReviewAudio()

    if (question.type === 1 || question.type === 4) {
      this.playCurrentAudio()
      // 提前扫描下一个有音频的词，用独立context静音缓冲（不影响当前播放）
      this.preloadNextAudioInQueue()
    }

  },

  preloadReviewAudio() {
    const { reviewQueue, currentIndex, audioCtx } = this.data
    if (!audioCtx) return
    const entry = reviewQueue[currentIndex]
    if (!entry) return
    const cache = this.wordCache[entry.key]
    if (!cache) return
    const src = getWordAudioSrc(entry.key, cache.word)
    if (src && audioCtx.src !== src) {
      audioCtx.stop()
      audioCtx.src = src
    }
  },

  // 播放当前词音频
  playCurrentAudio() {
    const { audioCtx } = this.data
    if (!audioCtx) return
    audioCtx.play()
  },

  // 预加载第一个词的音频到主audioCtx
  preloadFirstReviewAudio() {
    const { reviewQueue, audioCtx } = this.data
    if (!audioCtx || reviewQueue.length === 0) return
    const entry = reviewQueue[0]
    if (!entry) return
    const cache = this.wordCache[entry.key]
    if (!cache) return
    const src = getWordAudioSrc(entry.key, cache.word)
    if (src) {
      audioCtx.src = src
    }
  },

  // 听音题出现时，用独立context提前扫描并缓冲队列中下一个有音频的词
  preloadNextAudioInQueue() {
    const { reviewQueue, currentIndex } = this.data
    for (let i = currentIndex + 1; i < reviewQueue.length; i++) {
      const entry = reviewQueue[i]
      if (!entry) continue
      const cache = this.wordCache[entry.key]
      if (!cache) continue
      const src = getWordAudioSrc(entry.key, cache.word)
      if (!src) continue
      const preloader = wx.createInnerAudioContext()
      preloader.src = src
      preloader.volume = 0
      preloader.play()
      preloader.onCanplay(() => { preloader.stop(); preloader.destroy() })
      preloader.onError(() => preloader.destroy())
      return
    }
    // 往后扫完了没有，尝试从开头扫
    for (let i = 0; i < currentIndex; i++) {
      const entry = reviewQueue[i]
      if (!entry) continue
      const cache = this.wordCache[entry.key]
      if (!cache) continue
      const src = getWordAudioSrc(entry.key, cache.word)
      if (!src) continue
      const preloader = wx.createInnerAudioContext()
      preloader.src = src
      preloader.volume = 0
      preloader.play()
      preloader.onCanplay(() => { preloader.stop(); preloader.destroy() })
      preloader.onError(() => preloader.destroy())
      return
    }
  },

  // 在答题反馈阶段扫描队列，预加载下一个有音频的词的音频到主audioCtx
  preloadNextWordAudio() {
    const { reviewQueue, currentIndex, audioCtx } = this.data
    if (!audioCtx) return
    // 从currentIndex往后扫，找第一个有音频的词
    for (let i = currentIndex; i < reviewQueue.length; i++) {
      const entry = reviewQueue[i]
      if (!entry) continue
      const cache = this.wordCache[entry.key]
      if (!cache) continue
      const src = getWordAudioSrc(entry.key, cache.word)
      if (!src) continue
      if (audioCtx.src !== src) {
        audioCtx.stop()
        audioCtx.src = src
      }
      return  // 只预加载找到的第一个
    }
    // 如果队列往后扫完了还没找到，尝试回到开头找
    for (let i = 0; i < currentIndex; i++) {
      const entry = reviewQueue[i]
      if (!entry) continue
      const cache = this.wordCache[entry.key]
      if (!cache) continue
      const src = getWordAudioSrc(entry.key, cache.word)
      if (!src) continue
      if (audioCtx.src !== src) {
        audioCtx.stop()
        audioCtx.src = src
      }
      return
    }
  },

  advanceIndex() {
    const { reviewQueue, currentIndex } = this.data
    const nextIdx = currentIndex + 1
    if (nextIdx >= reviewQueue.length) {
      this.showCompletion()
    } else {
      this.setData({ currentIndex: nextIdx })
      this.startCurrentWord()
    }
  },

  playAudio(src) {
    const { audioCtx } = this.data
    if (!audioCtx || !src) return
    if (audioCtx.src === src) {
      audioCtx.play()
      return
    }
    audioCtx.stop()
    audioCtx.src = src
    audioCtx.play()
  },

  playEffect(name) {
    const { effectCtx } = this.data
    if (!effectCtx) return
    effectCtx.stop()
    effectCtx.src = `audio/effect/${name}.mp3`
    effectCtx.play()
  },

  onPlaySound() {
    const { reviewQueue, currentIndex } = this.data
    const entry = reviewQueue[currentIndex]
    if (!entry) return
    const cache = this.wordCache[entry.key]
    const src = cache ? getWordAudioSrc(entry.key, cache.word) : ''
    if (src) {
      this.playAudio(src)
    } else {
      wx.showToast({ title: '暂无音频', icon: 'none' })
    }
  },

  // ========== 作答 ==========

  onSelectOption(e) {
    if (this.data.answered) return

    const key = e.currentTarget.dataset.key
    const isCorrect = key === this.data.correctKey

    this.setData({ selectedKey: key, answered: true, isCorrect })

    this.setData({ totalAnswered: this.data.totalAnswered + 1 })

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

    entry.correct++
    const passed = entry.correct >= PASS_CORRECT

    this.setData({ reviewQueue, feedback: 'correct' })
    this.playEffect('correct')

    if (passed) {
      this.onWordMastered(entry)
    } else {
      this.moveToGap(entry)
      setTimeout(() => {
        this.preloadNextWordAudio()
        this.afterFeedback()
      }, 500)
    }
  },

  onWrong() {
    const { reviewQueue, currentIndex } = this.data
    const entry = reviewQueue[currentIndex]
    if (!entry) return

    entry.correct = 0
    entry.wrongCount = (entry.wrongCount || 0) + 1
    this.setData({ reviewQueue, feedback: 'wrong' })
    this.playEffect('wrong')

    // 自动播放正确发音
    const cache = this.wordCache[entry.key]
    const src = cache ? getWordAudioSrc(entry.key, cache.word) : ''
    if (src) {
      this.playAudio(src)
    }

    if (entry.wrongCount >= 3) {
      this.skipWord(entry)
    } else {
      this.moveToGap(entry)
      setTimeout(() => {
        this.preloadNextWordAudio()
        this.afterFeedback()
      }, 2500)
    }
  },

  skipWord(entry) {
    // 从队列移除，stage后退一档
    const { reviewQueue, currentIndex } = this.data
    reviewQueue.splice(currentIndex, 1)
    entry.skipped = true

    // 保存进度（后退一档）
    const newStage = Math.max(0, (entry.stage || 0) - 1)
    const interval = INTERVALS[newStage] || 1
    const due = new Date(); due.setDate(due.getDate() + interval)
    wx.cloud.callFunction({
      name: 'updateProgress',
      data: { field: 'schedule', key: entry.key, add: true, value: { stage: newStage, dueDate: getLocalDate(due) } }
    }).catch(() => {})
    entry._saved = true

    // 自动播放正确发音
    const cache = this.wordCache[entry.key]
    const src = cache ? getWordAudioSrc(entry.key, cache.word) : ''
    if (src) {
      this.playAudio(src)
    }

    if (currentIndex >= reviewQueue.length) {
      this.setData({ reviewQueue, currentIndex: 0, feedback: 'skip' })
    } else {
      this.setData({ reviewQueue, feedback: 'skip' })
    }

    setTimeout(() => {
      this.preloadNextWordAudio()
      this.afterFeedback()
    }, 2500)
  },

  // ========== 关键：间隔插入 ==========

  moveToGap(entry) {
    const { reviewQueue, currentIndex, gapSize } = this.data

    // 从当前位置移出
    reviewQueue.splice(currentIndex, 1)

    // 计算插入位置：当前索引 + 间隔 + 1（跳过自身位置）
    let insertPos = currentIndex + gapSize
    if (insertPos >= reviewQueue.length) {
      // 超出末尾 → 追加到末尾
      reviewQueue.push(entry)
      // 如果当前索引还在范围内，不用动
      // 如果移出的是最后一个 → 重置到0
      if (currentIndex >= reviewQueue.length) {
        this.setData({ reviewQueue, currentIndex: 0 })
      } else {
        this.setData({ reviewQueue })
      }
    } else {
      // 插入到中间位置
      reviewQueue.splice(insertPos, 0, entry)
      // currentIndex 没变，仍然指向下一个自然词
      this.setData({ reviewQueue })
    }
  },

  // ========== 掌握 + 弹窗 ==========

  onWordMastered(entry) {
    const cache = this.wordCache[entry.key]
    const wordName = cache ? cache.word.word : entry.key

    const newProgress = this.data.passingWords + 1

    // 弹窗文案（检查里程碑）
    let message, icon
    if (MILESTONES[newProgress]) {
      message = `${MILESTONES[newProgress].icon} ${MILESTONES[newProgress].text}`
      icon = MILESTONES[newProgress].icon
    } else {
      const idx = newProgress % MASTER_MESSAGES.length
      message = MASTER_MESSAGES[idx].replace('{word}', wordName)
      icon = '🎉'
    }

    this.setData({
      passingWords: newProgress,
      showMasterPopup: true,
      masterMessage: message,
      masterIcon: icon
    })

    entry.mastered = true

    // 保存云端
    this.saveWordProgress(entry.key, entry.stage, true)
    entry._saved = true

    // 从队列移除
    const { reviewQueue, currentIndex } = this.data
    reviewQueue.splice(currentIndex, 1)
    if (currentIndex >= reviewQueue.length) {
      this.setData({ reviewQueue, currentIndex: 0, showMasterPopup: true })
    } else {
      this.setData({ reviewQueue, showMasterPopup: true })
    }

    setTimeout(() => {
      this.setData({ showMasterPopup: false })
      this.preloadNextWordAudio()
      this.afterFeedback()
    }, 1500)
  },

  afterFeedback() {
    const { reviewQueue, currentIndex } = this.data

    if (reviewQueue.length === 0) {
      this.showCompletion()
      return
    }

    // currentIndex 已在 moveToGap/onWordMastered 中处理
    // 如果 currentIndex 越界，重置到0
    let idx = this.data.currentIndex
    if (idx >= reviewQueue.length) {
      idx = 0
      this.setData({ currentIndex: 0 })
    }

    // 更新 gapSize（队列可能会缩小）
    this.setData({
      gapSize: Math.min(MIN_GAP, Math.max(0, reviewQueue.length - 1))
    })

    this.startCurrentWord()
  },

  // ========== 云端保存 ==========

  saveWordProgress(key, currentStage, passed) {
    if (passed) {
      const newStage = (currentStage || 0) + 1
      if (newStage >= MAX_STAGE) {
        wx.cloud.callFunction({ name: 'updateProgress', data: { field: 'mastered', key, add: true } }).catch(() => {})
        wx.cloud.callFunction({ name: 'updateProgress', data: { field: 'schedule', key, add: false } }).catch(() => {})
      } else {
        const interval = INTERVALS[newStage] || 1
        const due = new Date(); due.setDate(due.getDate() + interval)
        wx.cloud.callFunction({
          name: 'updateProgress',
          data: { field: 'schedule', key, add: true, value: { stage: newStage, dueDate: getLocalDate(due) } }
        }).catch(() => {})
      }
    }
  },

  saveAllProgress() {
    const { reviewQueue } = this.data
    for (const entry of reviewQueue) {
      if (entry._saved) continue
      if (entry.mastered) {
        entry._saved = true
        this.saveWordProgress(entry.key, entry.stage, true)
      }
    }
  },

  // ========== 完成页 ==========

  showCompletion() {
    const today = getLocalDate()
    const lastStudy = wx.getStorageSync('lastStudyDate') || ''
    let streak = 1, isNewStreak = true

    if (lastStudy === today) {
      streak = wx.getStorageSync('streakCount') || 1
      isNewStreak = false
    } else {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
      if (lastStudy === getLocalDate(yesterday)) {
        streak = (wx.getStorageSync('streakCount') || 1) + 1
      }
    }

    wx.setStorageSync('lastStudyDate', today)
    wx.setStorageSync('streakCount', streak)

    this.setData({
      completed: true,
      phase: 'complete',
      streakCount: streak,
      isNewStreak
    })

    // 全部通关 → 撒花弹窗
    if (this.data.passingWords >= this.data.totalWordCount) {
      this.setData({
        showMasterPopup: true,
        masterMessage: '🎊 全部通关！太棒了！🎊',
        masterIcon: '🏆'
      })
      setTimeout(() => { this.setData({ showMasterPopup: false }) }, 2500)
    }
  },

  onGoLearn() {
    // 去学新单词（跳到当前教材的第一个未学词）
    this.saveAllProgress()
    if (this.data.audioCtx) this.data.audioCtx.destroy()
    if (this.data.effectCtx) this.data.effectCtx.destroy()
    wx.redirectTo({ url: `/pages/index/index` })
  },

  onGoHome() {
    this.saveAllProgress()
    if (this.data.audioCtx) this.data.audioCtx.destroy()
    if (this.data.effectCtx) this.data.effectCtx.destroy()
    wx.navigateBack()
  }
})
