const app = getApp()

Page({
  data: {
    textbooks: []
  },

  onLoad() {
    this.setData({
      textbooks: app.globalData.textbooks
    })
  },

  onTapTextbook(e) {
    const id = e.currentTarget.dataset.id
    const textbook = app.globalData.textbooks.find(t => t.id === id)
    if (!textbook.available) {
      wx.showToast({ title: '即将上线，敬请期待', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: `/pages/study-center/study-center?textbookId=${id}`
    })
  }
})
