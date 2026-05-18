const app = getApp()

Page({
  data: {
    textbooks: [],
    units: [],
    pageState: 'books',    // 'books' | 'detail' | 'units'
    unitMode: 'read',       // 'read' | 'word'
    currentBook: {},
    availableUnitsStr: '',
    dueCount: 0,

    // 复习提醒弹框
    showReviewReminder: false,
    reminderDueCount: 0
  },

  onLoad() {
    // 计算每个单元的单词数
    const words = app.globalData.words || {}
    const unitCounts = {}
    for (const [key, card] of Object.entries(words)) {
      const mod = card.module
      unitCounts[mod] = (unitCounts[mod] || 0) + 1
    }

    const units = [
      { id: 'Unit1', name: 'Unit 1 · Teenagers today', icon: '🎭', available: true, wordCount: unitCounts.Unit1 || 0 },
      { id: 'Unit2', name: 'Unit 2 · On the money', icon: '💰', available: false, wordCount: unitCounts.Unit2 || 0 },
      { id: 'Unit3', name: 'Unit 3 · Putting the pieces together', icon: '🧩', available: false, wordCount: unitCounts.Unit3 || 0 },
      { id: 'Unit4', name: 'Unit 4 · Past passing by', icon: '⏳', available: false, wordCount: unitCounts.Unit4 || 0 },
      { id: 'Unit5', name: 'Unit 5 · A fine balance', icon: '⚖️', available: false, wordCount: unitCounts.Unit5 || 0 },
      { id: 'Unit6', name: 'Unit 6 · Live green', icon: '🌿', available: false, wordCount: unitCounts.Unit6 || 0 }
    ]

    const availableUnits = units.filter(u => u.available).map(u => u.name.split(' · ')[0])

    this.setData({
      textbooks: [
        { id: '9a-2026q', name: '外研版2026秋季版 九（上）', cover: '📘', wordCount: 189, available: true },
        { id: '8b-2026c', name: '外研版2026春季版 八（下）', cover: '📙', wordCount: 0, available: false }
      ],
      units,
      availableUnitsStr: availableUnits.join('、')
    })

    this.loadDueCount()
  },

  onShow() {
    this.loadDueCount()
  },

  loadDueCount() {
    const today = new Date().toISOString().slice(0, 10)
    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}
      let count = 0
      for (const [key, s] of Object.entries(schedule)) {
        if (!mastered.includes(key) && s.dueDate <= today && s.stage >= 1) {
          count++
        }
      }
      this.setData({ dueCount: count })

      // 选了教材后再检查复习提醒
      if (this.data.currentBook.id) {
        this.checkReviewReminder(count, today)
      }
    }).catch(() => {})
  },

  checkReviewReminder(dueCount, today) {
    if (dueCount === 0) return

    // 今天是否已点过"稍等一会"
    const postponed = wx.getStorageSync('reviewPostponeDate')
    if (postponed === today) return

    this.setData({
      showReviewReminder: true,
      reminderDueCount: dueCount
    })
  },

  onReminderReview() {
    this.setData({ showReviewReminder: false })
    wx.navigateTo({ url: '/pages/review/review' })
  },

  onReminderLater() {
    const today = new Date().toISOString().slice(0, 10)
    wx.setStorageSync('reviewPostponeDate', today)
    this.setData({ showReviewReminder: false })
  },

  onTapBook(e) {
    const bookId = e.currentTarget.dataset.id
    const book = this.data.textbooks.find(t => t.id === bookId) || {}
    this.setData({
      pageState: 'detail',
      currentBook: book
    })

    // 选了教材后检查复习提醒
    const today = new Date().toISOString().slice(0, 10)
    this.checkReviewReminder(this.data.dueCount, today)
  },

  onBack() {
    this.setData({ pageState: 'books', currentBook: {} })
  },

  onShowUnits() {
    this.setData({ pageState: 'units' })
  },

  onShowDetail() {
    this.setData({ pageState: 'detail' })
  },

  onReadText() {
    this.setData({ pageState: 'units', unitMode: 'read' })
  },

  onLearnWordsByUnit() {
    this.setData({ pageState: 'units', unitMode: 'word' })
  },

  onReview() {
    wx.navigateTo({ url: '/pages/review/review' })
  },

  onAllWords() {
    const words = app.globalData.words
    const firstKey = Object.keys(words)[0]
    if (firstKey) {
      wx.navigateTo({ url: `/pages/detail/detail?wordKey=${firstKey}&mode=browse` })
    }
  },

  onTapUnit(e) {
    const id = e.currentTarget.dataset.id
    if (this.data.unitMode === 'read') {
      wx.navigateTo({ url: `/pages/text/text?unit=${id}` })
    } else {
      // 按单元学单词 → 直接跳到第一张卡片（跟浏览模式一样，只显示该单元的词）
      const words = app.globalData.words
      const firstKey = Object.keys(words).find(k => words[k].module === id)
      if (firstKey) {
        wx.navigateTo({ url: `/pages/detail/detail?wordKey=${firstKey}&mode=browse&unit=${id}` })
      }
    }
  },

  onShareAppMessage() {
    return {
      title: '单词魔卡 - 初中英语单词学习',
      path: '/pages/index/index',
    }
  }
})
