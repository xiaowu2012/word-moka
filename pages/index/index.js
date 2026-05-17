const app = getApp()

Page({
  data: {
    textbooks: [],
    units: [],
    pageState: 'books',    // 'books' | 'detail' | 'units'
    unitMode: 'read',       // 'read' | 'word'
    currentBook: {},
    availableUnitsStr: ''
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

    // 可用单元名称（用于教材详情页展示）
    const availableUnits = units.filter(u => u.available).map(u => u.name.split(' · ')[0])

    this.setData({
      textbooks: [
        { id: '9a-2026q', name: '外研版2026秋季版 九（上）', cover: '📘', wordCount: 189, available: true },
        { id: '8b-2026c', name: '外研版2026春季版 八（下）', cover: '📙', wordCount: 0, available: false }
      ],
      units,
      availableUnitsStr: availableUnits.join('、')
    })
  },

  onTapBook(e) {
    const bookId = e.currentTarget.dataset.id
    const book = this.data.textbooks.find(t => t.id === bookId) || {}
    this.setData({
      pageState: 'detail',
      currentBook: book
    })
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

  onAllWords() {
    wx.navigateTo({ url: '/pages/wordlist/wordlist' })
  },

  onTapUnit(e) {
    const id = e.currentTarget.dataset.id
    if (this.data.unitMode === 'read') {
      wx.navigateTo({ url: `/pages/text/text?unit=${id}` })
    } else {
      wx.navigateTo({ url: `/pages/wordlist/wordlist?module=${id}` })
    }
  },

  onShareAppMessage() {
    return {
      title: '单词魔卡 - 初中英语单词学习',
      path: '/pages/index/index',
    }
  }
})
