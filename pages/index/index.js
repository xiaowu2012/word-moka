Page({
  data: {
    showUnits: false
  },

  onTapBook() {
    this.setData({ showUnits: true })
  },

  onBack() {
    this.setData({ showUnits: false })
  },

  onReadText() {
    wx.navigateTo({ url: '/pages/text/text?unit=Unit1' })
  }
})
