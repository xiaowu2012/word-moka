const app = getApp()

const TEXTBOOK_CONFIG = {
  '9a-2026q': {
    units: ['Unit1', 'Unit2', 'Unit3', 'Unit4', 'Unit5', 'Unit6'],
    names: {
      Unit1: 'Unit 1 · Teenagers today',
      Unit2: 'Unit 2 · On the money',
      Unit3: 'Unit 3 · Putting the pieces together',
      Unit4: 'Unit 4 · Past passing by',
      Unit5: 'Unit 5 · A fine balance',
      Unit6: 'Unit 6 · Live green'
    },
    icons: { Unit1: '🎭', Unit2: '💰', Unit3: '🧩', Unit4: '⏳', Unit5: '⚖️', Unit6: '🌿' },
    wordPrefix: '',
    hasTextReading: true
  },
  'r4-2024q': {
    units: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6'],
    names: {
      'Unit 1': 'Unit 1 · Helping at home',
      'Unit 2': 'Unit 2 · My friend',
      'Unit 3': 'Unit 3 · Places',
      'Unit 4': 'Unit 4 · Jobs',
      'Unit 5': 'Unit 5 · Weather',
      'Unit 6': 'Unit 6 · Clothes & seasons'
    },
    icons: { 'Unit 1': '🏠', 'Unit 2': '👫', 'Unit 3': '📍', 'Unit 4': '👨‍🚒', 'Unit 5': '🌤️', 'Unit 6': '👕' },
    wordPrefix: 'r4_',
    hasTextReading: false
  }
}

Page({
  data: {
    textbooks: [],
    units: [],
    pageState: 'books',
    unitMode: 'read',
    currentBook: {},
    availableUnitsStr: '',

    // 复习提醒弹框（以课本为粒度）
    showReviewReminder: false,
    reminderDueCount: 0,
    reminderBookId: ''
  },

  onLoad() {
    this.refreshTextbooks()
  },

  onShow() {
    this.refreshTextbooks()
  },

  // 加载教材列表（含各书待复习数）
  refreshTextbooks() {
    const words = app.globalData.words || {}

    const textbooks = [
      { id: 'r4-2024q', name: '人教版2024版 四（上）', cover: '📗', wordCount: 110, unitCount: 6, available: true, hasTextReading: false },
      { id: '9a-2026q', name: '外研版2026秋季版 九（上）', cover: '📘', wordCount: 189, unitCount: 6, available: true, hasTextReading: true },
      { id: '8b-2026c', name: '外研版2026春季版 八（下）', cover: '📙', wordCount: 0, unitCount: 0, available: false, hasTextReading: false }
    ]

    // 加载进度，计算每本书的待复习数
    wx.cloud.callFunction({ name: 'getProgress' }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}
      const today = new Date().toISOString().slice(0, 10)

      const textbooksWithReview = textbooks.map(book => {
        const config = TEXTBOOK_CONFIG[book.id]
        let reviewCount = 0

        if (config) {
          const prefix = config.wordPrefix
          for (const [key, s] of Object.entries(schedule)) {
            if (mastered.includes(key)) continue
            if (s.dueDate > today || s.stage < 0) continue
            if (prefix && !key.startsWith(prefix)) continue
            if (words[key]) reviewCount++
          }
        }

        return { ...book, reviewCount }
      })

      this.setData({ textbooks: textbooksWithReview })
    }).catch(() => {
      this.setData({ textbooks })
    })
  },

  getUnitsForBook(bookId) {
    const config = TEXTBOOK_CONFIG[bookId]
    if (!config) return []

    const words = app.globalData.words || {}
    const prefix = config.wordPrefix
    const unitCounts = {}

    for (const [key, card] of Object.entries(words)) {
      if (prefix && !key.startsWith(prefix)) continue
      const mod = card.module
      unitCounts[mod] = (unitCounts[mod] || 0) + 1
    }

    return config.units.map(unitId => ({
      id: unitId,
      name: config.names[unitId] || unitId,
      icon: config.icons[unitId] || '📄',
      available: true,
      wordCount: unitCounts[unitId] || 0
    }))
  },

  // ---- 复习弹框（以课本为粒度） ----

  checkReviewForBook(bookId) {
    const book = this.data.textbooks.find(t => t.id === bookId)
    if (!book || !book.reviewCount || book.reviewCount === 0) return

    // 2分钟内是否点过"稍等一会"（按书本独立key）
    const key = `reviewPostpone_${bookId}`
    const postponed = wx.getStorageSync(key)
    if (postponed && Date.now() - postponed < 2 * 60 * 1000) return

    this.setData({
      showReviewReminder: true,
      reminderDueCount: book.reviewCount,
      reminderBookId: bookId
    })
  },

  onReminderReview() {
    this.setData({ showReviewReminder: false })
    wx.navigateTo({ url: '/pages/review/review' })
  },

  onReminderLater() {
    const key = `reviewPostpone_${this.data.reminderBookId}`
    wx.setStorageSync(key, Date.now())
    this.setData({
      showReviewReminder: false,
      reminderBookId: ''
    })
  },

  onTapBook(e) {
    const bookId = e.currentTarget.dataset.id
    const book = this.data.textbooks.find(t => t.id === bookId) || {}
    const units = this.getUnitsForBook(bookId)

    this.setData({
      pageState: 'detail',
      currentBook: book,
      units
    })

    // 进入书本时弹复习提醒
    this.checkReviewForBook(bookId)
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
    const config = TEXTBOOK_CONFIG[this.data.currentBook.id]
    const prefix = config ? config.wordPrefix : ''

    const firstKey = prefix
      ? Object.keys(words).find(k => k.startsWith(prefix))
      : Object.keys(words).find(k => !k.startsWith('r4_') && !k.startsWith('8b_'))

    if (firstKey) {
      wx.navigateTo({ url: `/pages/detail/detail?wordKey=${firstKey}&mode=browse&textbook=${this.data.currentBook.id}` })
    }
  },

  onTapUnit(e) {
    const id = e.currentTarget.dataset.id
    const config = TEXTBOOK_CONFIG[this.data.currentBook.id]
    const prefix = config ? config.wordPrefix : ''

    if (this.data.unitMode === 'read' && config.hasTextReading) {
      wx.navigateTo({ url: `/pages/text/text?unit=${id}` })
    } else {
      const words = app.globalData.words
      const firstKey = Object.keys(words).find(k => {
        if (prefix && !k.startsWith(prefix)) return false
        return words[k].module === id
      })
      if (firstKey) {
        wx.navigateTo({ url: `/pages/detail/detail?wordKey=${firstKey}&mode=browse&unit=${id}&textbook=${this.data.currentBook.id}` })
      }
    }
  },

  onShareAppMessage() {
    return {
      title: '单词魔卡 - 英语单词学习',
      path: '/pages/index/index',
    }
  }
})
