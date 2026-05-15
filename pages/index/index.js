const app = getApp()

Page({
  data: {
    textbooks: [],
    unlockedObj: {},
    showUnlock: false,
    unlockTextbookId: '',
    inviteCode: '',
    loading: false,
    errorMsg: ''
  },

  onLoad() {
    this.setData({ textbooks: app.globalData.textbooks })
    this.loadUnlocked()
  },

  onShow() {
    this.loadUnlocked()
  },

  loadUnlocked() {
    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const unlocked = p.unlocked || []
      const unlockedObj = {}
      unlocked.forEach(id => { unlockedObj[id] = true })
      this.setData({ unlockedObj })
    }).catch(() => {})
  },

  onTapTextbook(e) {
    const id = e.currentTarget.dataset.id
    const textbook = app.globalData.textbooks.find(t => t.id === id)

    if (!textbook.available) {
      wx.showToast({ title: '即将上线，敬请期待', icon: 'none' })
      return
    }

    if (textbook.free || this.data.unlockedObj[id]) {
      wx.navigateTo({
        url: `/pages/study-center/study-center?textbookId=${id}`
      })
    } else {
      this.setData({
        showUnlock: true,
        unlockTextbookId: id,
        inviteCode: '',
        errorMsg: ''
      })
    }
  },

  onCodeInput(e) {
    this.setData({ inviteCode: e.detail.value.toUpperCase(), errorMsg: '' })
  },

  onSubmitCode() {
    const code = this.data.inviteCode.trim()
    if (!code) {
      this.setData({ errorMsg: '请输入邀请码' })
      return
    }

    this.setData({ loading: true, errorMsg: '' })

    wx.cloud.callFunction({
      name: 'verifyInviteCode',
      data: { code, textbookId: this.data.unlockTextbookId }
    }).then(res => {
      this.setData({ loading: false })
      const result = res.result || {}
      if (result.success) {
        wx.showToast({ title: '解锁成功 🎉', icon: 'success' })
        this.setData({ showUnlock: false })
        this.loadUnlocked()
        wx.navigateTo({
          url: `/pages/study-center/study-center?textbookId=${this.data.unlockTextbookId}`
        })
      } else {
        this.setData({ errorMsg: result.error || '解锁失败' })
      }
    }).catch(() => {
      this.setData({ loading: false, errorMsg: '网络错误，请重试' })
    })
  },

  onPayUnlock() {
    wx.showToast({ title: '付费功能即将开放', icon: 'none' })
  },

  onCloseUnlock() {
    this.setData({ showUnlock: false })
  }
})
