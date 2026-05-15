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
    showGoalPicker: false,
    modules: [],
    selectedModuleId: '',
    selectedModuleName: '请选择模块',
    showModulePicker: false,
    words: {}
  },

  onLoad(options) {
    const textbookId = options.textbookId || 'waiyan8b'
    const textbook = app.globalData.textbooks.find(t => t.id === textbookId)
    const words = app.globalData.words
    const total = Object.keys(words).length

    // 组装模块列表
    const modules = app.globalData.modules
    modules.forEach(m => {
      const cnt = Object.values(words).filter(w => w.module === m.id).length
      m.wordCount = cnt
    })

    this.setData({
      textbook,
      totalWords: total,
      dailyGoal: wx.getStorageSync('dailyGoal') || DEFAULT_GOAL,
      modules,
      selectedModuleId: '',
      selectedModuleName: '请选择模块',
      words
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
      const { selectedModuleId, words } = this.data

      // 过滤函数
      const isInModule = (key) => !selectedModuleId || (words[key] && words[key].module === selectedModuleId)

      // 今日已学（stage=0）
      let todayLearned = 0
      for (const [key, s] of Object.entries(schedule)) {
        if (s.stage === 0 && isInModule(key)) todayLearned++
      }

      // 今日待复习
      let dueCount = 0
      for (const [key, s] of Object.entries(schedule)) {
        if (!mastered.includes(key) && s.dueDate <= today && s.stage >= 1 && isInModule(key)) {
          dueCount++
        }
      }

      // 已学习
      let learnedCount = 0
      const allKeys = selectedModuleId
        ? Object.keys(words).filter(k => words[k].module === selectedModuleId)
        : Object.keys(words)
      for (const key of allKeys) {
        if (mastered.includes(key) || schedule[key]) learnedCount++
      }

      this.setData({
        learnedCount,
        dueCount,
        todayLearned,
        moduleTotal: allKeys.length
      })
    }).catch(() => {})
  },

  onModuleDropdownTap() {
    this.setData({ showModulePicker: true })
  },

  onModuleSelect(e) {
    const id = e.currentTarget.dataset.id
    const modules = this.data.modules
    const mod = modules.find(m => m.id === id)
    this.setData({
      selectedModuleId: id || '',
      selectedModuleName: id ? `${mod.icon} ${mod.name}` : '请选择模块',
      showModulePicker: false
    }, () => {
      this.loadProgress()
    })
  },

  onModuleDropdownClose() {
    this.setData({ showModulePicker: false })
  },

  onContinueLearning() {
    const { todayLearned, dailyGoal, selectedModuleId, words } = this.data
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
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

      const keys = selectedModuleId
        ? Object.keys(words).filter(k => words[k].module === selectedModuleId)
        : Object.keys(words)

      for (const key of keys) {
        if (!mastered.includes(key) && !schedule[key]) {
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

      wx.showToast({ title: '该模块已学完 🎉', icon: 'none' })
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  onStartReview() {
    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}
      const today = new Date().toISOString().slice(0, 10)
      const { selectedModuleId, words } = this.data

      const isInModule = (key) => !selectedModuleId || (words[key] && words[key].module === selectedModuleId)

      let dueCount = 0
      for (const [key, s] of Object.entries(schedule)) {
        if (!mastered.includes(key) && s.dueDate <= today && s.stage >= 1 && isInModule(key)) {
          dueCount++
        }
      }

      if (dueCount === 0) {
        wx.navigateTo({ url: '/pages/daily-summary/daily-summary' })
      } else {
        wx.navigateTo({ url: `/pages/review/review?module=${selectedModuleId || ''}` })
      }
    }).catch(() => {
      wx.navigateTo({ url: '/pages/review/review' })
    })
  },

  onViewWordList() {
    const { selectedModuleId, textbook } = this.data
    wx.navigateTo({
      url: `/pages/wordlist/wordlist?textbookId=${textbook.id}&module=${selectedModuleId || ''}`
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
