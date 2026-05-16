/**
 * 课文阅读页 - 单音频 + 时间戳高亮
 * 
 * 逻辑：
 * 1. 加载 Unit1_full.mp3 整篇音频
 * 2. 加载 Unit1_timestamps.json 句子时间戳
 * 3. 播放全文 → onTimeUpdate 自动高亮当前句子
 * 4. 点某句 → seek 到对应时间位置
 */

// 单词数据缓存（从 app.globalData 获取）
let app = null

Page({
  data: {
    unitId: '',
    title: '',
    totalSentences: 0,
    audioDuration: 0,
    paragraphs: [],          // [{ sentenceIndices, start, end }]
    sentences: [],           // [{ index, en, cn, start, end }]
    playingSentenceIdx: -1,  // 当前正在播放的句子索引
    showCn: true,
    isPlaying: false,

    // 弹窗
    showWordCard: false,
    selectedWord: null,
  },

  onLoad(options) {
    const unitId = options.unit || 'Unit1'
    app = getApp()
    this._unitId = unitId
    this._audioCtx = null
    this._vocabTimer = null

    // 加载时间戳数据
    const tsData = require(`../../audio/${unitId}_timestamps.js`)
    const data = tsData.unitTimestamps

    this.setData({
      unitId,
      title: data.title,
      totalSentences: data.totalSentences,
      audioDuration: data.audioDuration,
      paragraphs: data.paragraphs,
      sentences: data.sentences,
    })

    // 创建音频上下文
    this._initAudio()
  },

  _initAudio() {
    const ctx = wx.createInnerAudioContext()
    ctx.src = `/audio/${this._unitId}_full.mp3`
    ctx.autoplay = false
    ctx.obeyMuteSwitch = false

    // 监听进度 → 高亮当前句子
    ctx.onTimeUpdate(() => {
      const t = ctx.currentTime
      const sentences = this.data.sentences
      let foundIdx = -1
      for (let i = 0; i < sentences.length; i++) {
        if (t >= sentences[i].start && t < sentences[i].end) {
          foundIdx = i
          break
        }
      }
      if (foundIdx !== this.data.playingSentenceIdx) {
        this.setData({ playingSentenceIdx: foundIdx })
        this._scrollToSentence(foundIdx)
      }
    })

    // 播放结束
    ctx.onEnded(() => {
      this.setData({ isPlaying: false, playingSentenceIdx: -1 })
    })

    // 播报中断
    ctx.onStop(() => {
      this.setData({ isPlaying: false })
    })

    this._audioCtx = ctx
  },

  _scrollToSentence(idx) {
    if (idx < 0) return
    // 用 querySelector 滚动到对应句子
    const query = wx.createSelectorQuery()
    query.select(`#sentence-${idx}`).boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec((res) => {
      if (res[0] && res[1]) {
        wx.pageScrollTo({
          scrollTop: res[1].scrollTop + res[0].top - 200,
          duration: 200,
        })
      }
    })
  },

  // === 播放控制 ===

  // 点某一句
  onPlaySentence(e) {
    const idx = parseInt(e.currentTarget.dataset.idx)
    if (isNaN(idx)) return
    // 如果点的是当前播放的句子，toggle 暂停/播放
    if (idx === this.data.playingSentenceIdx && this.data.isPlaying) {
      this._pause()
      return
    }
    this._playFrom(idx)
  },

  // 全文播放
  onTogglePlayAll() {
    if (this.data.isPlaying) {
      this._pause()
    } else {
      this._playFrom(this.data.playingSentenceIdx >= 0 ? this.data.playingSentenceIdx : 0)
    }
  },

  _playFrom(idx) {
    if (!this._audioCtx) return
    const sentences = this.data.sentences
    if (idx >= sentences.length) return

    this._audioCtx.seek(sentences[idx].start)
    this._audioCtx.play()
    this.setData({ isPlaying: true, playingSentenceIdx: idx })
  },

  _pause() {
    if (this._audioCtx) {
      this._audioCtx.pause()
    }
    this.setData({ isPlaying: false })
  },

  // === 显示控制 ===

  onToggleCn() {
    this.setData({ showCn: !this.data.showCn })
  },

  // === 重点词弹窗 ===

  onTapWord(e) {
    const wordKey = e.currentTarget.dataset.word
    const allWords = app && app.globalData ? app.globalData.words : {}
    const card = allWords[wordKey]
    if (card) {
      this.setData({ selectedWord: card, showWordCard: true })
    }
  },

  onCloseWordCard() {
    this.setData({ showWordCard: false })
  },

  // === 生命周期 ===

  onUnload() {
    if (this._audioCtx) {
      this._audioCtx.stop()
      this._audioCtx.destroy()
      this._audioCtx = null
    }
  },

  onBack() {
    wx.navigateBack()
  },
})
