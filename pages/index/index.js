const app = getApp()

// 单元列表固定写死（不依赖任何数据加载）
const UNIT_LIST = [
  { id: 'Unit1', name: 'Teenagers today', icon: '🎭' },
  { id: 'Unit2', name: 'On the money', icon: '💰' },
  { id: 'Unit3', name: 'Putting the pieces together', icon: '🧩' },
  { id: 'Unit4', name: 'Past passing by', icon: '⏳' },
  { id: 'Unit5', name: 'A fine balance', icon: '⚖️' },
  { id: 'Unit6', name: 'Live green', icon: '🌿' }
]

Page({
  data: {
    textbooks: [],
    units: UNIT_LIST,
    selectedTextbook: null,
    showUnits: false
  },

  onLoad() {
    this.setData({ textbooks: app.globalData.textbooks })
  },

  onTapBook(e) {
    const id = e.currentTarget.dataset.id
    const book = app.globalData.textbooks.find(t => t.id === id)
    if (!book || book.comingSoon) {
      wx.showToast({ title: '即将推出', icon: 'none' })
      return
    }
    this.setData({ selectedTextbook: book, showUnits: true })
  },

  onBack() {
    this.setData({ selectedTextbook: null, showUnits: false })
  },

  onReadText(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/text/text?unit=${id}` })
  }
})
