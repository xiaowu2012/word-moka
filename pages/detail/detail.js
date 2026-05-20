const app = getApp()

// 微信云存储文件ID基础路径（上传到云存储后资源ID部分可能变化，如不对请替换）
const CLOUD_BASE = 'cloud://cloudbase-d2gs4fpbhca51e19f.636c-cloudbase-d2gs4fpbhca51e19f-1433289257'

const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }
const FREQ_LABEL = { 5: '极高频', 4: '高频', 3: '中等', 2: '低频', 1: '极少' }

// 获取本地日期（YYYY-MM-DD），避免 .toISOString() 的 UTC 时区问题
function getLocalDate(d) {
  const date = d || new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

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
    const textbookFilter = options.textbook || ''

    const words = app.globalData.words

    // 按教材过滤
    let wordKeyList = Object.keys(words)
    if (textbookFilter === 'r4-2024q') {
      wordKeyList = wordKeyList.filter(k => k.startsWith('r4_'))
    } else if (textbookFilter === '9a-2026q') {
      wordKeyList = wordKeyList.filter(k => !k.startsWith('r4_') && !k.startsWith('8b_'))
    }
    // 如果有 unit 过滤，进一步缩小范围
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
      // 提前预加载当前音频源，避免云存储加载延迟
      this.preloadWordAudio(wordKey)
      // 翻页时自动播放单词发音（200ms后音频已缓冲）
      setTimeout(() => this.onPlayWord(), 200)
      // 翻页时自动标记已学（加入记忆队列）
      setTimeout(() => this.autoAddToSchedule(wordKey), 500)
      // 预加载下一张卡片的音频（翻页更丝滑）
      const nextIdx = index + 1
      if (nextIdx < this.wordKeyList.length) {
        const nextKey = this.wordKeyList[nextIdx]
        this.preloadNextAudio(nextKey)
      }
    }
  },

  onUnload() {
    if (this.data.audioCtx) {
      this.data.audioCtx.destroy()
    }
  },

  loadProgress() {
    const dailyGoal = wx.getStorageSync('dailyGoal') || 5
    const today = getLocalDate()

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

  // 预加载单词音频源（设src但不播放，让音频开始缓冲）
  preloadWordAudio(wordKey) {
    const audioCtx = this.data.audioCtx
    if (!audioCtx) return
    const card = app.globalData.words[wordKey]
    if (!card) return
    let src
    if (card.pronounceFile) {
      src = card.pronounceFile
    } else if (wordKey.startsWith('r4_')) {
      src = `${CLOUD_BASE}/audio/r4/${wordKey}.mp3`
    }
    if (src) {
      audioCtx.src = src
    }
  },

  // 预加载下一张卡片的音频（独立audioCtx，不干扰当前播放）
  preloadNextAudio(nextKey) {
    const card = app.globalData.words[nextKey]
    if (!card) return
    let src
    if (card.pronounceFile) {
      src = card.pronounceFile
    } else if (nextKey.startsWith('r4_')) {
      src = `${CLOUD_BASE}/audio/r4/${nextKey}.mp3`
    }
    if (!src) return
    const preloader = wx.createInnerAudioContext()
    preloader.src = src
    preloader.volume = 0
    preloader.play()
    // 缓冲后自动清理
    preloader.onCanplay(() => {
      preloader.stop()
      preloader.destroy()
    })
    preloader.onError(() => {
      preloader.destroy()
    })
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

    this.setData({ playing: type })

    // 构建目标音频URL
    let targetSrc
    if (type === 'word' && word.pronounceFile) {
      targetSrc = word.pronounceFile
    } else if (key.startsWith('r4_')) {
      targetSrc = `${CLOUD_BASE}/audio/r4/${key}.mp3`
    } else {
      targetSrc = `/audio/${key}_${type}.mp3`
    }

    // 如果src已预加载且相同，直接play（避免stop打断缓冲）
    if (audioCtx.src === targetSrc) {
      audioCtx.play()
      return
    }

    audioCtx.stop()
    audioCtx.src = targetSrc
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
    const tomorrow = getLocalDate(new Date(Date.now() + 86400000))

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
    const tomorrow = getLocalDate(new Date(Date.now() + 86400000))

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
