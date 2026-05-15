const app = getApp()

const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }
const FREQ_LABEL = { 5: '极高频', 4: '高频', 3: '中等', 2: '低频', 1: '极少' }

Page({
  data: {
    word: {},
    key: '',
    imageSrc: '',
    fromContinue: false,
    stars: '',
    freqLabel: '',
    example: null,
    exampleCn: '',
    extraExample: '',
    extraCn: '',
    tip: '',
    playing: '',
    todayLearned: 0,
    dailyGoal: 5,
    audioCtx: null
  },

  onLoad(options) {
    const wordKey = options.wordKey
    const fromContinue = options.from === 'continue'

    if (!wordKey) return

    const words = app.globalData.words
    const card = words[wordKey]
    if (!card) {
      wx.showToast({ title: '单词不存在', icon: 'none' })
      return
    }

    let example = null
    let exampleCn = ''
    if (card.examples && card.examples.length > 0) {
      example = card.examples[0]
      exampleCn = card.exampleCn || ''
    }

    this.setData({
      key: wordKey,
      word: card,
      imageSrc: `/images/${wordKey}_card.jpg`,
      fromContinue,
      stars: STAR_MAP[card.examFrequency] || '★★★☆☆',
      freqLabel: FREQ_LABEL[card.examFrequency] || '',
      example,
      exampleCn,
      extraExample: card.extraExample || '',
      extraCn: card.extraCn || '',
      tip: card.tip || '',
      audioCtx: wx.createInnerAudioContext()
    })

    this.loadProgress()
  },

  onUnload() {
    if (this.data.audioCtx) {
      this.data.audioCtx.destroy()
    }
  },

  loadProgress() {
    const dailyGoal = wx.getStorageSync('dailyGoal') || 5
    const today = new Date().toISOString().slice(0, 10)

    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}

      let todayLearned = 0
      const schedule = p.schedule || {}
      for (const s of Object.values(schedule)) {
        if (s.stage === 0 && s.dueDate === today) todayLearned++
      }

      this.setData({
        todayLearned,
        dailyGoal
      })
    }).catch(() => {})
  },

  onPlayWord() {
    this.playAudio('word')
  },

  onPlayExample() {
    this.playAudio('example')
  },

  onPlayExtra() {
    this.playAudio('extra')
  },

  playAudio(type) {
    const { audioCtx, key } = this.data
    if (!audioCtx) return

    audioCtx.stop()
    this.setData({ playing: type })

    audioCtx.src = `/audio/${key}_${type}.mp3`
    audioCtx.play()

    audioCtx.onEnded(() => {
      this.setData({ playing: '' })
    })
    audioCtx.onError(() => {
      this.setData({ playing: '' })
    })
  },

  onImageError() {
    this.setData({ imageSrc: '' })
  },

  onGoNext() {
    const words = app.globalData.words
    const today = new Date().toISOString().slice(0, 10)

    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}
      const dailyGoal = wx.getStorageSync('dailyGoal') || 5

      // 计算今日已学
      let todayLearned = 0
      for (const s of Object.values(schedule)) {
        if (s.stage === 0 && s.dueDate === today) todayLearned++
      }

      if (todayLearned >= dailyGoal) {
        wx.showToast({ title: '今日目标完成，去复习吧 🎉', icon: 'none' })
        setTimeout(() => {
          wx.navigateTo({ url: '/pages/review/review' })
        }, 800)
        return
      }

      for (const key of Object.keys(words)) {
        if (!mastered.includes(key) && !schedule[key]) {
          wx.cloud.callFunction({
            name: 'updateProgress',
            data: {
              field: 'schedule',
              key,
              add: true,
              value: { stage: 0, dueDate: today }
            }
          }).then(() => {
            wx.redirectTo({
              url: `/pages/detail/detail?wordKey=${key}&from=continue`
            })
          }).catch(() => {})
          return
        }
      }

      wx.showToast({ title: '全部学完啦 🎉', icon: 'none' })
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  }
})
