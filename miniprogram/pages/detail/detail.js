const app = getApp()

const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }
const FREQ_LABEL = { 5: '极高频', 4: '高频', 3: '中等', 2: '低频', 1: '极少' }

Page({
  data: {
    word: {},
    key: '',
    isFav: false,
    isMastered: false,
    stars: '',
    freqLabel: '',
    example: null,
    exampleCn: '',
    extraExample: '',
    extraCn: '',
    tip: '',
    playing: '',
    audioCtx: null
  },

  onLoad(options) {
    const wordKey = options.wordKey
    if (!wordKey) return

    const words = app.globalData.words
    const card = words[wordKey]
    if (!card) {
      wx.showToast({ title: '单词不存在', icon: 'none' })
      return
    }

    // Build example object
    let example = null
    let exampleCn = ''
    if (card.examples && card.examples.length > 0) {
      example = card.examples[0]
      exampleCn = card.exampleCn || ''
    }

    this.setData({
      key: wordKey,
      word: card,
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
    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const progress = res.result || {}
      const mastered = progress.mastered || []
      const favorites = progress.favorites || []
      this.setData({
        isMastered: mastered.includes(this.data.key),
        isFav: favorites.includes(this.data.key)
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

    audioCtx.src = `/audio/${key}_${type}.m4a`
    audioCtx.play()

    audioCtx.onEnded(() => {
      this.setData({ playing: '' })
    })
    audioCtx.onError(() => {
      this.setData({ playing: '' })
      wx.showToast({ title: '播放失败', icon: 'none' })
    })
  },

  onToggleFav() {
    const newVal = !this.data.isFav
    this.setData({ isFav: newVal })
    this.syncProgress('favorites', this.data.key, newVal)
  },

  onToggleMaster() {
    const newVal = !this.data.isMastered
    this.setData({ isMastered: newVal })
    this.syncProgress('mastered', this.data.key, newVal)
  },

  syncProgress(field, key, add) {
    wx.cloud.callFunction({
      name: 'updateProgress',
      data: { field, key, add }
    }).catch(err => {
      console.error('sync error', err)
    })
  }
})
