const app = getApp()
const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }

const INTERVALS = [1, 3, 7, 14, 30]
const MAX_STAGE = 5

Page({
  data: {
    reviewList: [],
    currentIndex: 0,
    showAnswer: false,
    currentWord: {},
    currentStars: '',
    total: 0,
    completed: false,
    progress: 0,
    loading: true,
    streakCount: 0,
    isNewStreak: false
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
    this.saveAndNext(this.data.currentWord.key, -1)
  },

  onGood() {
    this.saveAndNext(this.data.currentWord.key, 0)
  },

  onEasy() {
    this.saveAndNext(this.data.currentWord.key, 1)
  },

  saveAndNext(key, levelDelta) {
    const word = this.data.currentWord
    let newStage = (word.stage || 0) + levelDelta + 1
    newStage = Math.max(0, Math.min(MAX_STAGE, newStage))

    if (newStage >= MAX_STAGE) {
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
      this.showCompletion()
    }
  },

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
      progress: 100,
      streakCount: streak,
      isNewStreak
    })
  },

  onGoHome() {
    wx.navigateBack()
  }
})
