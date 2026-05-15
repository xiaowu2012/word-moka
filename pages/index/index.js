const app = getApp()

Page({
  data: {
    textbooks: [],
    units: [],
    totalWords: 0,
    selectedTextbook: null,
    showUnits: false
  },

  onLoad() {
    this.setData({ textbooks: app.globalData.textbooks })
    this.loadProgress()
  },

  onShow() {
    if (this.data.showUnits) this.loadProgress()
  },

  loadProgress() {
    // 只统计已选课本的进度
    const { selectedTextbook } = this.data
    if (!selectedTextbook) return

    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}
      const words = app.globalData.words
      const unitDefs = app.globalData.units

      const units = selectedTextbook.units.map(id => {
        const def = unitDefs.find(u => u.id === id)
        const unitWords = Object.values(words).filter(w => w.module === id)
        let learned = 0
        for (const w of unitWords) {
          const key = w.word
          if (mastered.includes(key) || schedule[key]) learned++
        }
        return {
          id, learned, total: unitWords.length,
          name: def ? def.name : id,
          icon: def ? def.icon : '📖'
        }
      })

      this.setData({ units })
    }).catch(() => {})
  },

  onTapBook(e) {
    const id = e.currentTarget.dataset.id
    const book = app.globalData.textbooks.find(t => t.id === id)

    if (book.comingSoon) {
      wx.showToast({ title: '即将推出', icon: 'none' })
      return
    }

    if (!book.available) return

    // 显示该课本的单元列表
    this.setData({ selectedTextbook: book, showUnits: true, totalWords: book.wordCount }, () => {
      this.loadProgress()
    })
  },

  onBackToBooks() {
    this.setData({ selectedTextbook: null, showUnits: false })
  },

  onTapUnit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/wordlist/wordlist?module=${id}`
    })
  },

  onReview() {
    wx.navigateTo({ url: '/pages/review/review' })
  },

  onAllWords() {
    const { selectedTextbook } = this.data
    if (selectedTextbook) {
      wx.navigateTo({
        url: `/pages/wordlist/wordlist?textbook=${selectedTextbook.id}`
      })
    }
  }
})
