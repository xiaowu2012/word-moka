const app = getApp()

// 微信云存储文件ID基础路径（上传到云存储后资源ID部分可能变化，如不对请替换）
const CLOUD_BASE = 'cloud://cloudbase-d2gs4fpbhca51e19f.636c-cloudbase-d2gs4fpbhca51e19f-1433289257'

const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }
const FREQ_LABEL = { 5: '极高频', 4: '高频', 3: '中等', 2: '低频', 1: '极少' }

Page({
  data: {
    word: {},
    key: '',
    imageSrc: '',
    fromContinue: false,
    isBrowse: false,
    showTranslation: false,
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
    const unitFilter = options.unit || ''

    const words = app.globalData.words

    // 如果有 unit 过滤，只显示该单元的单词
    let wordKeyList = Object.keys(words)
    if (unitFilter) {
      wordKeyList = wordKeyList.filter(k => words[k] && words[k].module === unitFilter)
    }

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
    // 兼容两种数据格式：八下 examples[] 数组 / 九上 example 字符串
    if (card.example) {
      example = { sentence: card.example }
      exampleCn = card.exampleCn || ''
    } else if (card.examples && card.examples.length > 0) {
      example = card.examples[0]
      exampleCn = card.exampleCn || ''
    }

    this.setData({
      key: wordKey,
      word: card,
      imageSrc: wordKey.startsWith('r4_') ? `${CLOUD_BASE}/images/r4/${wordKey}.jpg` : `/images/${wordKey}_card.jpg`,
      fromContinue: fromContinue || false,
      isBrowse: isBrowse || false,
      showTranslation: true,
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

    if (isBrowse) {
      // 翻页时自动播放单词发音
      setTimeout(() => this.onPlayWord(), 200)
      // 翻页时自动标记已学（加入记忆队列）
      setTimeout(() => this.autoAddToSchedule(wordKey), 500)
    }
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
    const { audioCtx, key, word } = this.data
    if (!audioCtx) return

    audioCtx.stop()
    this.setData({ playing: type })

    // 单词音频优先使用 pronounceFile 字段
    if (type === 'word' && word.pronounceFile) {
      audioCtx.src = word.pronounceFile
    } else if (key.startsWith('r4_')) {
      // 人教4上单词：音频在 audio/r4/ 目录下
      audioCtx.src = key.startsWith('r4_') ? `${CLOUD_BASE}/audio/r4/${key}.mp3` : `/audio/r4/${key}.mp3`
    } else {
      audioCtx.src = `/audio/${key}_${type}.mp3`
    }
    audioCtx.play()

    audioCtx.onEnded(() => {
      this.setData({ playing: '' })
    })
    audioCtx.onError(() => {
      this.setData({ playing: '' })
    })
  },

  onTapCard() {
    this.onNextWord()
  },

  autoAddToSchedule(key) {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}

      if (!mastered.includes(key) && !schedule[key]) {
        wx.cloud.callFunction({
          name: 'updateProgress',
          data: {
            field: 'schedule',
            key,
            add: true,
            value: { stage: 0, dueDate: tomorrow }
          }
        }).catch(() => {})
      }
    }).catch(() => {})
  },

  onImageError() {
    this.setData({ imageSrc: '' })
  },

  // ===== 滑动翻页 =====
  touchStartX: 0,

  onTouchStart(e) {
    this.touchStartX = e.touches[0].clientX
  },

  onTouchEnd(e) {
    if (this.touchStartX === 0) return
    const endX = e.changedTouches[0].clientX
    const diff = endX - this.touchStartX
    this.touchStartX = 0

    // 水平滑动 > 60px，且是浏览模式才翻页
    if (Math.abs(diff) < 60 || !this.data.isBrowse) return

    if (diff > 0) {
      this.onPrevWord()
    } else {
      this.onNextWord()
    }
  },

  playPageFlip() {
    const ctx = wx.createInnerAudioContext()
    ctx.src = '/audio/pageflip.mp3'
    ctx.volume = 0.5
    ctx.play()
    ctx.onEnded(() => ctx.destroy())
  },

  onPrevWord() {
    if (this.wordKeyList.length === 0) return
    const idx = this.data.browseIndex - 1
    if (idx < 0) {
      wx.showToast({ title: '已经是第一个了', icon: 'none' })
      return
    }
    const key = this.wordKeyList[idx]
    this.playPageFlip()
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
    this.playPageFlip()
    this.loadWord(key, idx, false, true)
  },

  onGoNext() {
    const words = app.globalData.words
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}

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
