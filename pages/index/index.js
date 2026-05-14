const app = getApp()

Page({
  data: {
    textbooks: [],
    totalWords: 10,
    masteredCount: 0,
    favoriteCount: 0
  },

  onLoad() {
    this.setData({
      textbooks: app.globalData.textbooks
    })
    this.loadProgress()
  },

  onShow() {
    this.loadProgress()
  },

  loadProgress() {
    const db = wx.cloud.database()
    const userId = wx.getStorageSync('userId') || wx.cloud.CloudID
    db.collection('user_progress').where({
      _openid: '{openid}'
    }).get().then(res => {
      if (res.data && res.data.length > 0) {
        const progress = res.data[0]
        this.setData({
          masteredCount: progress.mastered?.length || 0,
          favoriteCount: progress.favorites?.length || 0
        })
      }
    }).catch(() => {
      // 首次使用，无数据
    })
  },

  onTapTextbook(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/wordlist/wordlist?textbookId=${id}`
    })
  },

  onStartReview() {
    wx.navigateTo({
      url: '/pages/review/review'
    })
  },

  onViewFavorites() {
    wx.navigateTo({
      url: '/pages/wordlist/wordlist?favorites=true'
    })
  }
})
