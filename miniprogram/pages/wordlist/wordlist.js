const app = getApp()
const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }

Page({
  data: {
    moduleTitle: '外研版 八年级下册 · Module1',
    wordList: [],
    filteredList: [],
    currentFilter: 'all',
    showFavorites: false
  },

  onLoad(options) {
    const showFavorites = options.favorites === 'true'
    this.setData({ showFavorites })
    this.buildWordList()
  },

  onShow() {
    this.loadProgress()
  },

  buildWordList() {
    const words = app.globalData.words
    const mastered = app.getProgress('mastered')
    const favorites = app.getProgress('favorites')
    const list = []

    for (const [key, card] of Object.entries(words)) {
      list.push({
        key,
        word: card.word,
        phonetic: card.phonetic,
        cnMeaning: card.cnMeaning,
        stars: STAR_MAP[card.examFrequency] || '★★★☆☆',
        module: card.module,
        mastered: mastered.includes(key),
        favorite: favorites.includes(key)
      })
    }

    this.setData({ wordList: list }, () => this.applyFilter())
  },

  loadProgress() {
    const mastered = app.getProgress('mastered')
    const favorites = app.getProgress('favorites')
    const updated = this.data.wordList.map(item => ({
      ...item,
      mastered: mastered.includes(item.key),
      favorite: favorites.includes(item.key)
    }))
    this.setData({ wordList: updated }, () => this.applyFilter())
  },

  onFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter }, () => this.applyFilter())
  },

  applyFilter() {
    const { wordList, currentFilter, showFavorites } = this.data
    let filtered = wordList
    if (showFavorites || currentFilter === 'favorites') {
      filtered = wordList.filter(w => w.favorite)
    } else if (currentFilter === 'mastered') {
      filtered = wordList.filter(w => w.mastered)
    }
    if (showFavorites) {
      this.setData({ filteredList: filtered, moduleTitle: '我的收藏' })
    } else {
      this.setData({ filteredList: filtered })
    }
  },

  onTapWord(e) {
    const key = e.currentTarget.dataset.key
    wx.navigateTo({ url: `/pages/detail/detail?wordKey=${key}` })
  }
})
