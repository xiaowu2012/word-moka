App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloudbase-d2gs4fpbhca51e19f',
        traceUser: true
      })
    }
    this.initData()
  },

  globalData: {
    words: {},
    units: [
      { id: 'Unit1', name: 'Teenagers today', icon: '🎭' },
      { id: 'Unit2', name: 'On the money', icon: '💰' },
      { id: 'Unit3', name: 'Putting the pieces together', icon: '🧩' },
      { id: 'Unit4', name: 'Past passing by', icon: '⏳' },
      { id: 'Unit5', name: 'A fine balance', icon: '⚖️' },
      { id: 'Unit6', name: 'Live green', icon: '🌿' }
    ],
    textbooks: [
      {
        id: '9a-2026q',
        name: '外研版2026秋季版 九（上）',
        subtitle: '',
        units: ['Unit1', 'Unit2', 'Unit3', 'Unit4', 'Unit5', 'Unit6'],
        wordCount: 189,
        available: true,
        cover: '📘'
      },
      {
        id: '8b-2026c',
        name: '外研版2026春季版 八（下）',
        subtitle: '',
        units: [],
        wordCount: 0,
        available: false,
        comingSoon: true,
        cover: '📙'
      }
    ],
    userProgress: {}
  },

  initData() {
    const words = require('./data/words.js')
    this.globalData.words = words
  }
})
