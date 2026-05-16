const app = getApp()

Page({
  data: {
    textbooks: [],
    units: [
      { id: 'Unit1', name: 'Unit 1 · Teenagers today', icon: '🎭', available: true },
      { id: 'Unit2', name: 'Unit 2 · On the money', icon: '💰', available: false },
      { id: 'Unit3', name: 'Unit 3 · Putting the pieces together', icon: '🧩', available: false },
      { id: 'Unit4', name: 'Unit 4 · Past passing by', icon: '⏳', available: false },
      { id: 'Unit5', name: 'Unit 5 · A fine balance', icon: '⚖️', available: false },
      { id: 'Unit6', name: 'Unit 6 · Live green', icon: '🌿', available: false }
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
