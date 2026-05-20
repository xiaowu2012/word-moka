const app = getApp()

// 获取本地日期（YYYY-MM-DD），避免 .toISOString() 的 UTC 时区问题
function getLocalDate(d) {
  const date = d || new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

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

    // 复习提醒弹框（汇总多教材）
    showReviewReminder: false,
    reminderBooks: []
  },

  onLoad() {
    this.refreshTextbooks()
  },

  onShow() {
    this.refreshTextbooks().then(() => {
      this.checkReviewAll()
    })
  },

  // 加载教材列表（含各书待复习数）
  refreshTextbooks() {
    const self = this
    const words = app.globalData.words || {}

    const textbooks = [
      { id: 'r4-2024q', name: '人教版2024版 四（上）', cover: '📗', wordCount: 110, unitCount: 6, available: true, hasTextReading: false },
      { id: '9a-2026q', name: '外研版2026秋季版 九（上）', cover: '📘', wordCount: 189, unitCount: 6, available: true, hasTextReading: true },
      { id: '8b-2026c', name: '外研版2026春季版 八（下）', cover: '📙', wordCount: 0, unitCount: 0, available: false, hasTextReading: false }
    ]

    // 加载进度，计算每本书的待复习数
    return wx.cloud.callFunction({ name: 'getProgress' }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}
      const today = getLocalDate()

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

      self.setData({ textbooks: textbooksWithReview })
    }).catch(() => {
      self.setData({ textbooks })
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

  // ---- 复习提醒弹框（汇总多教材） ----

  checkReviewAll() {
    // 今天点过"今天算了"就不再弹
    const skipDate = wx.getStorageSync('reviewSkipAll')
    if (skipDate === getLocalDate()) return

    const dueBooks = this.data.textbooks.filter(b => b.reviewCount > 0)
    if (dueBooks.length === 0) return

    this.setData({
      showReviewReminder: true,
      reminderBooks: dueBooks.map(b => ({
        id: b.id,
        name: b.name,
        cover: b.cover,
        reviewCount: b.reviewCount
      }))
    })
  },

  onReminderReview(e) {
    const bookId = e.currentTarget.dataset.id
    this.setData({ showReviewReminder: false })
    wx.navigateTo({ url: `/pages/review/review?textbook=${bookId}` })
  },

  onReminderSkipAll() {
    wx.setStorageSync('reviewSkipAll', getLocalDate())
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

    // 进入书本时也检查复习提醒
    this.checkReviewAll()
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
