const app = getApp()

const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }
const FREQ_LABEL = { 5: '极高频', 4: '高频', 3: '中等', 2: '低频', 1: '极少' }

Page({
  data: {
    word: {},
    key: '',
    imageSrc: '',
    fromContinue: false,
    isBrowse: false,
    browseIndex: 0,
    browseTotal: 0,
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
    const isBrowse = options.mode === 'browse'

    const words = app.globalData.words

    // 构建有序单词列表
    const wordKeyList = Object.keys(words)

    let targetKey = wordKey
    let targetIndex = 0

    if (isBrowse) {
      if (options.index !== undefined) {
        targetIndex = parseInt(options.index) || 0
      } else if (targetKey) {
        targetIndex = wordKeyList.indexOf(targetKey)
        if (targetIndex === -1) targetIndex = 0
      }
      targetKey = wordKeyList[targetIndex] || wordKeyList[0]
    }

    if (!targetKey || !words[targetKey]) {
      wx.showToast({ title: '单词不存在', icon: 'none' })
      return
    }

    this.wordKeyList = wordKeyList
    this.setData({ audioCtx: wx.createInnerAudioContext() })
    this.loadWord(targetKey, targetIndex, fromContinue, isBrowse)
    this.loadProgress()
  },

  loadWord(wordKey, index, fromContinue, isBrowse) {
    const words = app.globalData.words
    const card = words[wordKey]
    if (!card) return

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
      fromContinue: fromContinue || false,
      isBrowse: isBrowse || false,
      browseIndex: index,
      browseTotal: this.wordKeyList.length,
      stars: STAR_MAP[card.examFrequency] || '★★★☆☆',
      freqLabel: FREQ_LABEL[card.examFrequency] || '',
      example,
      exampleCn,
      extraExample: card.extraExample || '',
      extraCn: card.extraCn || '',
      tip: card.tip || '',
      playing: ''
    })
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
        if (s.stage === 0) todayLearned++
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

  onPrevWord() {
    if (this.wordKeyList.length === 0) return
    const idx = this.data.browseIndex - 1
    if (idx < 0) {
      wx.showToast({ title: '已经是第一个了', icon: 'none' })
      return
    }
    const key = this.wordKeyList[idx]
    this.loadWord(key, idx, false, true)
  },

  onNextWord() {
    if (this.wordKeyList.length === 0) return
    const idx = this.data.browseIndex + 1
    if (idx >= this.wordKeyList.length) {
      wx.showToast({ title: '浏览完毕 🎉', icon: 'none' })
      return
    }
    const key = this.wordKeyList[idx]
    this.loadWord(key, idx, false, true)
  },

  onGoNext() {
    const words = app.globalData.words
    const today = new Date().toISOString().slice(0, 10)
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}
      const dailyGoal = wx.getStorageSync('dailyGoal') || 5

      let todayLearned = 0
      for (const s of Object.values(schedule)) {
        if (s.stage === 0) todayLearned++
      }

      if (todayLearned >= dailyGoal) {
        wx.navigateTo({ url: '/pages/daily-summary/daily-summary' })
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
              value: { stage: 0, dueDate: tomorrow }
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
