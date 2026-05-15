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
    modules: [
      { id: 'Module1', name: 'Feelings and impressions', title: '感觉与印象', icon: '😊' },
      { id: 'Module2', name: 'Experiences', title: '经历', icon: '🌍' },
      { id: 'Module3', name: 'Journey to space', title: '太空之旅', icon: '🚀' },
      { id: 'Module4', name: 'Seeing the doctor', title: '看医生', icon: '🏥' },
      { id: 'Module5', name: 'Cartoons', title: '卡通', icon: '🎬' },
      { id: 'Module6', name: 'Hobbies', title: '爱好', icon: '🎨' },
      { id: 'Module7', name: 'Summer in Los Angeles', title: '洛杉矶的夏天', icon: '🏖️' },
      { id: 'Module8', name: 'Time off', title: '休假', icon: '🌴' },
      { id: 'Module9', name: 'Friendship', title: '友谊', icon: '🤝' },
      { id: 'Module10', name: 'On the radio', title: '在电台', icon: '📻' }
    ],
    textbooks: [
      {
        id: 'waiyan8b',
        name: '外研版 八年级下册',
        cover: '📘',
        modules: ['Module1', 'Module2', 'Module3', 'Module4', 'Module5', 'Module6', 'Module7', 'Module8', 'Module9', 'Module10'],
        wordCount: 87,
        available: true,
        free: true
      },
      {
        id: 'renjiao8b',
        name: '人教版 八年级下册',
        cover: '📙',
        modules: [],
        wordCount: 0,
        available: false,
        comingSoon: true
      }
    ],
    userProgress: {}
  },

  initData() {
    const words = require('./data/words.js')
    this.globalData.words = words
  }
})
