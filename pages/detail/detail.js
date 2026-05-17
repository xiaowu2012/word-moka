const app = getApp()

const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }
const FREQ_LABEL = { 5: '极高频', 4: '高频', 3: '中等', 2: '低频', 1: '极少' }

Page({
  data: {
    word: {},
    key: '',
    imageSrc: '',
    fromContinue: false,
    isStudy: false,
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
    const isStudy = options.from === 'study'

    const words = app.globalData.words

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
    this.loadWord(targetKey, targetIndex, fromContinue, isBrowse, isStudy)
    this.loadProgress()

    // 学习模式：记录当前单元的所有单词，用于下一个学习
    if (isStudy && words[targetKey]) {
      this.studyUnitId = words[targetKey].module
    }
  },

  loadWord(wordKey, index, fromContinue, isBrowse, isStudy) {
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
      imageSrc: `/images/${wordKey}_card.jpg`,
      fromContinue: fromContinue || false,
      isStudy: isStudy || false,
      isBrowse: isBrowse || false,
      showTranslation: false,
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
    const { audioCtx, key, word } = this.data
    if (!audioCtx) return

    audioCtx.stop()
    this.setData({ playing: type })

    // 单词音频优先使用 pronounceFile 字段
    if (type === 'word' && word.pronounceFile) {
      audioCtx.src = word.pronounceFile
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
    this.setData({ showTranslation: !this.data.showTranslation })
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

  onStudyNext() {
    const words = app.globalData.words
    const { key } = this.data
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    const dailyGoal = wx.getStorageSync('dailyGoal') || 5

    // 先查进度，设置当前单词
    wx.cloud.callFunction({
      name: 'getProgress'
    }).then(res => {
      const p = res.result || {}
      const mastered = p.mastered || []
      const schedule = p.schedule || {}

      // 今日已学计数
      let todayLearned = 0
      for (const s of Object.values(schedule)) {
        if (s.stage === 0) todayLearned++
      }

      if (todayLearned >= dailyGoal) {
        wx.showToast({ title: '今日目标已完成 🎉', icon: 'none' })
        return
      }

      // 当前单词加入记忆队列
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

      // 找当前单元下一个未学的词
      const unitId = this.studyUnitId
      if (!unitId) {
        wx.navigateBack()
        return
      }

      const unitWords = this.wordKeyList.filter(k =>
        words[k] && words[k].module === unitId
      )

      const currentIdx = unitWords.indexOf(key)
      let nextKey = null
      for (let i = currentIdx + 1; i < unitWords.length; i++) {
        const wk = unitWords[i]
        if (!mastered.includes(wk) && !schedule[wk]) {
          nextKey = wk
          break
        }
      }

      if (nextKey) {
        wx.redirectTo({
          url: `/pages/detail/detail?wordKey=${nextKey}&from=study`
        })
      } else {
        wx.showToast({ title: '本单元单词已全部加入学习 🎉', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
      }
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
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
