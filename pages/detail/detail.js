const app = getApp()

const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }
const FREQ_LABEL = { 5: '极高频', 4: '高频', 3: '中等', 2: '低频', 1: '极少' }

Page({
  data: {
    word: {},
    key: '',
    imageSrc: '',
    isFav: false,
    inSchedule: false,
    scheduleStage: -1,
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
      const favorites = progress.favorites || []
      const schedule = progress.schedule || {}
      const mastered = progress.mastered || []

      const scheduleEntry = schedule[this.data.key]
      const isMastered = mastered.includes(this.data.key)

      this.setData({
        isFav: favorites.includes(this.data.key),
        inSchedule: isMastered || !!scheduleEntry,
        scheduleStage: isMastered ? 5 : (scheduleEntry ? scheduleEntry.stage : -1)
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

  onAddSchedule() {
    if (this.data.inSchedule) return

    const today = new Date().toISOString().slice(0, 10)
    wx.cloud.callFunction({
      name: 'updateProgress',
      data: {
        field: 'schedule',
        key: this.data.key,
        add: true,
        value: { stage: 0, dueDate: today }
      }
    }).then(() => {
      this.setData({
        inSchedule: true,
        scheduleStage: 0
      })
      wx.showToast({ title: '已加入学习计划', icon: 'success' })
    }).catch(() => {})
  },

  onToggleFav() {
    const newVal = !this.data.isFav
    this.setData({ isFav: newVal })
    wx.cloud.callFunction({
      name: 'updateProgress',
      data: { field: 'favorites', key: this.data.key, add: newVal }
    }).catch(() => {})
  }
})
