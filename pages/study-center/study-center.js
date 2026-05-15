const app = getApp()

Page({
  data: {
    textbook: null,
    totalWords: 0,
    learnedCount: 0,
    dueCount: 0,
    studiedToday: false
  },

  onBack() {
    wx.navigateBack()
  },

  onLoad(options) {
    const textbookId = options.textbookId || 'waiyan8b'
    const textbook = app.globalData.textbooks.find(t => t.id === textbookId)
    const words = app.globalData.words
    const total = Object.keys(words).length

    this.setData({
      textbook,
      totalWords: total
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

      // 今天到期的复习：schedule 中 dueDate <= today 且不在 mastered 中的
      let dueCount = 0
      for (const [key, s] of Object.entries(schedule)) {
        if (!mastered.includes(key) && s.dueDate <= today) {
          dueCount++
        }
      }

      // 今天是否学过（有今天添加的 schedule 记录）
      const studiedToday = Object.values(schedule).some(s => s.dueDate === today && s.stage === 0)

      this.setData({
        learnedCount: mastered.length,
        dueCount,
        studiedToday
      })
    }).catch(() => {})
  },

  onContinueLearning() {
    // 跳到第一个未掌握、未在学习的词
    const words = app.globalData.words
    const { learnedCount, textbook } = this.data

    if (learnedCount >= Object.keys(words).length) {
      wx.showToast({ title: '全部学完啦 🎉', icon: 'none' })
      return
    }

    wx.navigateTo({
      url: `/pages/wordlist/wordlist?textbookId=${textbook.id}`
    })
  },

  onStartReview() {
    wx.navigateTo({
      url: '/pages/review/review'
    })
  },

  onViewWordList() {
    wx.navigateTo({
      url: `/pages/wordlist/wordlist?textbookId=${this.data.textbook.id}`
    })
  }
})
