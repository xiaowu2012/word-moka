const app = getApp()

const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }

Page({
  data: {
    moduleTitle: '全部单词',
    wordList: [],
    filteredList: [],
    currentFilter: 'all',
    moduleFilter: '',
    userProgress: {}
  },

  onLoad(options) {
    const moduleFilter = options.module || ''
    this.setData({ moduleFilter })
    this.buildWordList()
    this.loadProgress()
  },

  onShow() {
    this.loadProgress()
  },

  buildWordList() {
    const words = app.globalData.words
    const { moduleFilter } = this.data
    const list = []

    let moduleTitle = '全部单词'
    if (moduleFilter) {
      const units = app.globalData.units
      const mod = units.find(u => u.id === moduleFilter)
      moduleTitle = mod ? `${mod.icon} ${mod.name}` : moduleFilter
    }

    for (const [key, card] of Object.entries(words)) {
      if (moduleFilter && card.module !== moduleFilter) continue
      list.push({
        key,
        word: card.word,
        phonetic: card.phonetic,
        cnMeaning: card.cnMeaning,
        stars: STAR_MAP[card.examFrequency] || '★★★☆☆',
        module: card.module
      })
    }

    this.setData({ wordList: list, moduleTitle }, () => {
      this.applyFilter()
    })
  },

  loadProgress() {
    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const progress = res.result || {}
      const masteredSet = new Set(progress.mastered || [])
      const schedule = progress.schedule || {}

      const updated = this.data.wordList.map(item => {
        const isMastered = masteredSet.has(item.key)
        const inSchedule = !!schedule[item.key]
        let status = 'new'
        if (isMastered) status = 'mastered'
        else if (inSchedule) status = 'learning'

        return { ...item, status }
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
    const { wordList, currentFilter } = this.data
    let filtered = wordList

    if (currentFilter === 'mastered') {
      filtered = wordList.filter(w => w.status === 'mastered')
    } else if (currentFilter === 'learning') {
      filtered = wordList.filter(w => w.status === 'learning')
    } else if (currentFilter === 'new') {
      filtered = wordList.filter(w => w.status === 'new')
    }

    this.setData({ filteredList: filtered })
  },

  onTapWord(e) {
    const key = e.currentTarget.dataset.key
    const { moduleFilter } = this.data
    // 从按单元学单词进入的，传 from=study
    const from = moduleFilter ? 'study' : ''
    wx.navigateTo({
      url: `/pages/detail/detail?wordKey=${key}${from ? '&from=' + from : ''}`
    })
  }
})
