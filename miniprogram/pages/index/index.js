const app = getApp()

Page({
  data: {
    textbooks: [],
    masteredCount: 0,
    favoriteCount: 0,
    totalWords: 10
  },

  onLoad() {
    this.setData({ textbooks: app.globalData.textbooks })
  },

  onShow() {
    const mastered = app.getProgress('mastered')
    const favorites = app.getProgress('favorites')
    this.setData({
      masteredCount: mastered.length,
      favoriteCount: favorites.length
    })
  },

  onTapTextbook(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/wordlist/wordlist?textbookId=${id}`
    })
  },

  onStartReview() {
    wx.navigateTo({ url: '/pages/review/review' })
  },

  onViewFavorites() {
    wx.navigateTo({ url: '/pages/wordlist/wordlist?favorites=true' })
  }
})
