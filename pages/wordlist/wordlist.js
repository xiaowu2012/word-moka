const app = getApp()

const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }

Page({
  data: {
    moduleTitle: '外研版 八年级下册 · Module1',
    wordList: [],
    filteredList: [],
    currentFilter: 'all',
    showFavorites: false,
    userProgress: {}
  },

  onLoad(options) {
    const textbookId = options.textbookId || 'waiyan8b'
    const showFavorites = options.favorites === 'true'

    this.setData({ showFavorites })

    this.buildWordList()
    this.loadProgress()
  },

  onShow() {
    this.loadProgress()
  },

  buildWordList() {
    const words = app.globalData.words
    const list = []

    for (const [key, card] of Object.entries(words)) {
      list.push({
        key,
        word: card.word,
        phonetic: card.phonetic,
        cnMeaning: card.cnMeaning,
        stars: STAR_MAP[card.examFrequency] || '★★★☆☆',
        module: card.module
      })
    }

    this.setData({ wordList: list }, () => {
      this.applyFilter()
    })
  },

  loadProgress() {
    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const progress = res.result || {}
      const masteredSet = new Set(progress.mastered || [])
      const favoriteSet = new Set(progress.favorites || [])
      const schedule = progress.schedule || {}

      const updated = this.data.wordList.map(item => {
        const isMastered = masteredSet.has(item.key)
        const inSchedule = !!schedule[item.key]
        let status = 'new'
        if (isMastered) status = 'mastered'
        else if (inSchedule) status = 'learning'

        return {
          ...item,
          mastered: isMastered,
          favorite: favoriteSet.has(item.key),
          status
        }
      })

      this.setData({ wordList: updated, userProgress: progress }, () => {
        this.applyFilter()
      })
    }).catch(() => {})
  },

  onFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter }, () => {
      this.applyFilter()
    })
  },

  applyFilter() {
    const { wordList, currentFilter, showFavorites } = this.data
    let filtered = wordList

    if (showFavorites || currentFilter === 'favorites') {
      filtered = wordList.filter(w => w.favorite)
    } else if (currentFilter === 'mastered') {
      filtered = wordList.filter(w => w.mastered)
    } else if (currentFilter === 'learning') {
      filtered = wordList.filter(w => w.status === 'learning')
    }

    if (showFavorites) {
      this.setData({ 
        filteredList: filtered,
        moduleTitle: '我的收藏'
      })
    } else {
      this.setData({ filteredList: filtered })
    }
  },

  onTapWord(e) {
    const key = e.currentTarget.dataset.key
    wx.navigateTo({
      url: `/pages/detail/detail?wordKey=${key}`
    })
  }
})
