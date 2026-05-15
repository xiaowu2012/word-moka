const app = getApp()
const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }

// 艾宾浩斯间隔（天）
const INTERVALS = [1, 3, 7, 14, 30]
const MAX_STAGE = 5  // stage 5 = mastered

Page({
  data: {
    reviewList: [],
    currentIndex: 0,
    showAnswer: false,
    progress: 0,
    currentWord: {},
    currentStars: '',
    total: 0,
    completed: false,
    progress: 0,
    loading: true
  },

  onLoad() {
    this.prepareReview()
  },

  prepareReview() {
    const words = app.globalData.words
    const today = new Date().toISOString().slice(0, 10)

    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}

      // 取到期复习的单词（dueDate <= today，且不在 mastered 中）
      let dueWords = []
      for (const [key, s] of Object.entries(schedule)) {
        if (!mastered.includes(key) && s.dueDate <= today) {
          if (words[key]) {
            dueWords.push({
              key,
              word: words[key].word,
              phonetic: words[key].phonetic,
              cnMeaning: words[key].cnMeaning,
              examFrequency: words[key].examFrequency,
              stage: s.stage
            })
          }
        }
      }

      // 打乱顺序
      for (let i = dueWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dueWords[i], dueWords[j]] = [dueWords[j], dueWords[i]]
      }

      if (dueWords.length > 0) {
        this.setData({
          reviewList: dueWords,
          currentIndex: 0,
          total: dueWords.length,
          showAnswer: false,
          completed: false,
          progress: 0,
          currentWord: dueWords[0],
          currentStars: STAR_MAP[dueWords[0].examFrequency] || '★★★☆☆',
          loading: false
        })
      } else {
        this.setData({
          reviewList: [],
          total: 0,
          completed: false,
          loading: false,
          currentWord: {}
        })
      }
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  onFlipCard() {
    if (!this.data.showAnswer) {
      this.setData({ showAnswer: true })
    }
  },

  onHard() {
    const word = this.data.currentWord
    this.saveAndNext(word.key, -1)
  },

  onGood() {
    const word = this.data.currentWord
    this.saveAndNext(word.key, 0)
  },

  onEasy() {
    const word = this.data.currentWord
    this.saveAndNext(word.key, 1)
  },

  saveAndNext(key, levelDelta) {
    const today = new Date().toISOString().slice(0, 10)
    const word = this.data.currentWord

    // 计算新 stage 和 dueDate
    let newStage = (word.stage || 0) + levelDelta + 1  // levelDelta 0=记住了(+1), 1=很简单(+2), -1=再想想(+0)
    newStage = Math.max(0, Math.min(MAX_STAGE, newStage))

    if (newStage >= MAX_STAGE) {
      // 到达顶级 → 移入 mastered
      wx.cloud.callFunction({
        name: 'updateProgress',
        data: {
          field: 'mastered',
          key,
          add: true
        }
      }).catch(() => {})
      // 移除 schedule
      wx.cloud.callFunction({
        name: 'updateProgress',
        data: {
          field: 'schedule',
          key,
          add: false
        }
      }).catch(() => {})
    } else {
      // 更新 schedule
      const interval = INTERVALS[newStage] || 1
      const due = new Date()
      due.setDate(due.getDate() + interval)
      const dueDate = due.toISOString().slice(0, 10)

      wx.cloud.callFunction({
        name: 'updateProgress',
        data: {
          field: 'schedule',
          key,
          add: true,
          value: { stage: newStage, dueDate }
        }
      }).catch(() => {})
    }

    this.nextCard()
  },

  nextCard() {
    const nextIndex = this.data.currentIndex + 1
    if (nextIndex < this.data.reviewList.length) {
      const nextWord = this.data.reviewList[nextIndex]
      this.setData({
        currentIndex: nextIndex,
        showAnswer: false,
        progress: Math.round((nextIndex / this.data.reviewList.length) * 100),
        currentWord: nextWord,
        currentStars: STAR_MAP[nextWord.examFrequency] || '★★★☆☆'
      })
    } else {
      this.setData({
        completed: true,
        progress: 100
      })
    }
  },

  onGoHome() {
    wx.navigateBack()
  }
})
