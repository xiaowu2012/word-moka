const app = getApp()

Page({
  data: {
    todayLearned: 0,
    streakCount: 0,
    words: []
  },

  onLoad() {
    this.loadData()
  },

  loadData() {
    const today = new Date().toISOString().slice(0, 10)
    const streakCount = wx.getStorageSync('streakCount') || 0

    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const schedule = p.schedule || {}
      const mastered = p.mastered || []
      const allWords = app.globalData.words

      // 取今天新学的词（stage=0）
      const todayWords = []
      for (const [key, s] of Object.entries(schedule)) {
        if (s.stage === 0) {
          const card = allWords[key]
          if (card) {
            todayWords.push({
              key,
              word: card.word,
              cnMeaning: card.cnMeaning
            })
          }
        }
      }

      this.setData({
        todayLearned: todayWords.length,
        streakCount,
        words: todayWords
      })
    }).catch(() => {})
  },

  onTapWord(e) {
    const key = e.currentTarget.dataset.key
    wx.navigateTo({
      url: `/pages/detail/detail?wordKey=${key}`
    })
  },

  onGoReview() {
    wx.navigateTo({ url: '/pages/review/review' })
  },

  onGoHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
})
