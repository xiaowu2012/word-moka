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
      { id: 'Unit1', name: 'Unit 1', icon: '🎭' },
      { id: 'Unit2', name: 'Unit 2', icon: '💰' },
      { id: 'Unit3', name: 'Unit 3', icon: '🏛️' },
      { id: 'Unit4', name: 'Unit 4', icon: '🦸' },
      { id: 'Unit5', name: 'Unit 5', icon: '🌍' },
      { id: 'Unit6', name: 'Unit 6', icon: '💡' }
    ],
    textbooks: [
      {
        id: 'jiunianji',
        name: '九年级上册',
        subtitle: '2026秋季版',
        units: ['Unit1', 'Unit2', 'Unit3', 'Unit4', 'Unit5', 'Unit6'],
        wordCount: 128,
        available: true
      }
    ],
    userProgress: {}
  },

  initData() {
    const words = require('./data/words.js')
    this.globalData.words = words
  }
})
