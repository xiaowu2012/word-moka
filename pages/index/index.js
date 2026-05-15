const app = getApp()

Page({
  data: {
    textbooks: [],
    units: [],
    totalWords: 0,
    progressMap: {}
  },

  onLoad() {
    this.setData({ 
      textbooks: app.globalData.textbooks,
      units: this.buildUnits()
    })
    this.loadProgress()
  },

  onShow() {
    this.loadProgress()
  },

  buildUnits() {
    const words = app.globalData.words
    const textUnits = app.globalData.textbooks[0].units
    const unitDefs = app.globalData.units

    return textUnits.map(id => {
      const def = unitDefs.find(u => u.id === id)
      const unitWords = Object.values(words).filter(w => w.module === id)
      return {
        id,
        name: def ? def.name : id,
        icon: def ? def.icon : '📖',
        wordCount: unitWords.length,
        progress: 0
      }
    })
  },

  loadProgress() {
    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}
      const words = app.globalData.words

      const units = this.buildUnits().map(u => {
        const unitWords = Object.values(words).filter(w => w.module === u.id)
        let learned = 0
        for (const w of unitWords) {
          const key = w.word.toLowerCase()
          if (mastered.includes(key) || schedule[key]) learned++
        }
        return { ...u, progress: learned }
      })

      this.setData({ units })
    }).catch(() => {})
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
    wx.navigateTo({ url: '/pages/wordlist/wordlist' })
  }
})
