const app = getApp()

// Textbook config: id → { units, unitNames, wordPrefix, hasTextReading }
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
    wordPrefix: '',       // no prefix = all keys
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
    const words = app.globalData.words || {}

    const textbooks = [
      { id: 'r4-2024q', name: '人教版2024版 四（上）', cover: '📗', wordCount: 110, available: true, hasTextReading: false },
      { id: '9a-2026q', name: '外研版2026秋季版 九（上）', cover: '📘', wordCount: 189, available: true, hasTextReading: true },
      { id: '8b-2026c', name: '外研版2026春季版 八（下）', cover: '📙', wordCount: 0, available: false, hasTextReading: false }
    ]

    this.setData({ textbooks })

    this.loadDueCount()
  },

  onShow() {
    this.loadDueCount()
  },

  // 获取某个教材的单元列表
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

  loadDueCount(showReminder) {
    const today = new Date().toISOString().slice(0, 10)
    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}
      const words = app.globalData.words || {}
      let count = 0
      for (const [key, s] of Object.entries(schedule)) {
        if (!mastered.includes(key) && s.dueDate <= today && s.stage >= 0) {
          if (words[key]) count++
        }
      }
      this.setData({ dueCount: count })

      if (showReminder) {
        this.checkReviewReminder(count)
      }
    }).catch(() => {})
  },

  checkReviewReminder(dueCount) {
    if (dueCount === 0) return

    const postponed = wx.getStorageSync('reviewPostponeTime')
    if (postponed && Date.now() - postponed < 5 * 60 * 1000) return

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
    wx.setStorageSync('reviewPostponeTime', Date.now())
    this.setData({ showReviewReminder: false })
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

    this.loadDueCount(true)
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

    // Find first word of this textbook
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
      // 按单元学单词 → 找到该单元第一个词
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
