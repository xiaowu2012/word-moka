const app = getApp()

Page({
  data: {
    textbooks: [],
    units: [
      { id: 'Unit1', name: 'Teenagers today', icon: '🎭' },
      { id: 'Unit2', name: 'On the money', icon: '💰' },
      { id: 'Unit3', name: 'Putting the pieces together', icon: '🧩' },
      { id: 'Unit4', name: 'Past passing by', icon: '⏳' },
      { id: 'Unit5', name: 'A fine balance', icon: '⚖️' },
      { id: 'Unit6', name: 'Live green', icon: '🌿' }
    ],
    showUnits: false
  },

  onLoad() {
    this.setData({ 
      textbooks: [
        { id: '9a-2026q', name: '外研版2026秋季版 九（上）', cover: '📘', wordCount: 189, available: true },
        { id: '8b-2026c', name: '外研版2026春季版 八（下）', cover: '📙', wordCount: 0, available: false }
      ]
    })
  },

  onTapBook(e) {
    this.setData({ showUnits: true })
  },

  onBack() {
    this.setData({ showUnits: false })
  },

  onReadText(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/text/text?unit=${id}` })
  }
})
