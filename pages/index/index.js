const app = getApp()

Page({
  data: {
    textbooks: [],
    units: [],
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
    const { selectedTextbook } = this.data
    if (!selectedTextbook) return

    wx.cloud.callFunction({ name: 'getProgress' }).then(res => {
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
          if (mastered.includes(w.word) || schedule[w.word]) learned++
        }
        return {
          id, learned, total: unitWords.length,
          name: def ? def.name : id,
          icon: def ? def.icon : '📖'
        }
      })
      this.setData({ units })
    }).catch(() => {
      // 云函数失败时，显示默认的 unit 列表（无进度）
      const words = app.globalData.words
      const unitDefs = app.globalData.units
      const fallback = selectedTextbook.units.map(id => {
        const def = unitDefs.find(u => u.id === id)
        const unitWords = Object.values(words).filter(w => w.module === id)
        return {
          id, learned: 0, total: unitWords.length,
          name: def ? def.name : id,
          icon: def ? def.icon : '📖'
        }
      })
      this.setData({ units: fallback })
    })
  },

  onTapBook(e) {
    const id = e.currentTarget.dataset.id
    const book = app.globalData.textbooks.find(t => t.id === id)
    if (book.comingSoon) {
      wx.showToast({ title: '即将推出', icon: 'none' })
      return
    }
    if (!book.available) return
    this.setData({ selectedTextbook: book, showUnits: true }, () => {
      this.loadProgress()
    })
  },

  onBack() {
    this.setData({ selectedTextbook: null, showUnits: false })
  },

  onTapUnit(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/wordlist/wordlist?module=${id}` })
  },

  onReadText(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/text/text?unit=${id}` })
  },

  onReview() {
    wx.navigateTo({ url: '/pages/review/review' })
  }
})
