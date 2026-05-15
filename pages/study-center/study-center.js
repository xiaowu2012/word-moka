const app = getApp()
const DEFAULT_GOAL = 5
const GOALS = [3, 5, 10, 15, 20]

Page({
  data: {
    textbook: null,
    totalWords: 0,
    learnedCount: 0,
    dueCount: 0,
    dailyGoal: DEFAULT_GOAL,
    todayLearned: 0,
    goalOptions: GOALS,
    showGoalPicker: false
  },

  onLoad(options) {
    const textbookId = options.textbookId || 'waiyan8b'
    const textbook = app.globalData.textbooks.find(t => t.id === textbookId)
    const total = Object.keys(app.globalData.words).length
    const savedGoal = wx.getStorageSync('dailyGoal') || DEFAULT_GOAL

    this.setData({
      textbook,
      totalWords: total,
      dailyGoal: savedGoal
    })

    this.loadProgress()
  },

  onShow() {
    this.loadProgress()
  },

  loadProgress() {
    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}
      const today = new Date().toISOString().slice(0, 10)

      // 今日已学新词（stage=0, dueDate=today）
      let todayLearned = 0
      for (const s of Object.values(schedule)) {
        if (s.stage === 0) todayLearned++
      }

      // 今日待复习（stage>=1, dueDate<=today, 没掌握）
      let dueCount = 0
      for (const [key, s] of Object.entries(schedule)) {
        if (!mastered.includes(key) && s.dueDate <= today && s.stage >= 1) {
          dueCount++
        }
      }

      // 已学习 = 已掌握 + 在学习（schedule中的都算）
      const scheduleKeys = Object.keys(schedule)
      const learnedCount = mastered.length + scheduleKeys.filter(k => !mastered.includes(k)).length

      this.setData({
        learnedCount,
        dueCount,
        todayLearned
      })
    }).catch(() => {})
  },

  onContinueLearning() {
    const { todayLearned, dailyGoal } = this.data
    if (todayLearned >= dailyGoal) {
      wx.navigateTo({ url: '/pages/daily-summary/daily-summary' })
      return
    }

    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}
      const words = app.globalData.words
      const today = new Date().toISOString().slice(0, 10)
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

      for (const key of Object.keys(words)) {
        if (!mastered.includes(key) && !schedule[key]) {
          // 自动加入学习计划
          wx.cloud.callFunction({
            name: 'updateProgress',
            data: {
              field: 'schedule',
              key,
              add: true,
              value: { stage: 0, dueDate: tomorrow }
            }
          }).then(() => {
            this.loadProgress()
            wx.navigateTo({
              url: `/pages/detail/detail?wordKey=${key}&from=continue`
            })
          }).catch(() => {})
          return
        }
      }

      wx.showToast({ title: '全部单词已学完 🎉', icon: 'none' })
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  onStartReview() {
    // 先加载进度判断是否有待复习单词
    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}
      const today = new Date().toISOString().slice(0, 10)
      let dueCount = 0
      for (const [key, s] of Object.entries(schedule)) {
        if (!mastered.includes(key) && s.dueDate <= today && s.stage >= 1) {
          dueCount++
        }
      }
      if (dueCount === 0) {
        wx.navigateTo({ url: '/pages/daily-summary/daily-summary' })
      } else {
        wx.navigateTo({ url: '/pages/review/review' })
      }
    }).catch(() => {
      wx.navigateTo({ url: '/pages/review/review' })
    })
  },

  onViewWordList() {
    wx.navigateTo({
      url: `/pages/wordlist/wordlist?textbookId=${this.data.textbook.id}`
    })
  },

  onGoalTap() {
    this.setData({ showGoalPicker: true })
  },

  onGoalSelect(e) {
    const goal = parseInt(e.currentTarget.dataset.goal)
    wx.setStorageSync('dailyGoal', goal)
    this.setData({ dailyGoal: goal, showGoalPicker: false })
  },

  onGoalPickerClose() {
    this.setData({ showGoalPicker: false })
  }
})
