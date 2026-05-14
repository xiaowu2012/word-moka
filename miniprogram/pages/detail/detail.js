const app = getApp()
const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }
const FREQ_LABEL = { 5: '极高频', 4: '高频', 3: '中等', 2: '低频', 1: '极少' }

Page({
  data: {
    key: '',
    word: {},
    isFav: false,
    isMastered: false,
    stars: '',
    freqLabel: '',
    example: null,
    exampleCn: '',
    extraExample: '',
    extraCn: '',
    tip: '',
    playing: ''
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
      isFav: app.getProgress('favorites').includes(wordKey),
      isMastered: app.getProgress('mastered').includes(wordKey)
    })
  },

  onPlayWord() { this.playAudio('word') },
  onPlayExample() { this.playAudio('example') },
  onPlayExtra() { this.playAudio('extra') },

  playAudio(type) {
    const { key } = this.data
    const audioCtx = wx.createInnerAudioContext()

    audioCtx.src = `/audio/${key}_${type}.m4a`
    this.setData({ playing: type })

    audioCtx.play()
    audioCtx.onEnded(() => {
      this.setData({ playing: '' })
      audioCtx.destroy()
    })
    audioCtx.onError(() => {
      this.setData({ playing: '' })
      audioCtx.destroy()
    })
  },

  onToggleFav() {
    const newVal = app.toggleProgress('favorites', this.data.key)
    this.setData({ isFav: newVal })
  },

  onToggleMaster() {
    const newVal = app.toggleProgress('mastered', this.data.key)
    this.setData({ isMastered: newVal })
  }
})
