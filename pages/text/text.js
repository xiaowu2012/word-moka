/**
 * 课文阅读页 - 单音频 + 时间戳高亮
 * 
 * 逻辑：
 * 1. 加载 Unit1_full.mp3 整篇音频
 * 2. 时间戳数据内联在此，控制句子高亮和跳转
 * 3. 播放全文 → onTimeUpdate 实时算当前时间落在哪句 → 高亮
 * 4. 点某句 → seek 到对应时间位置
 */

// Unit1 时间戳数据（由 scripts/generate-unit-audio.py 生成）
// 内联以兼容微信小程序运行时
const UNIT_TIMESTAMPS = {
  "unit": "Unit1",
  "title": "Art in safe hands",
  "totalSentences": 23,
  "audioDuration": 101.66,
  "sentences": [
    { "index": 0, "en": "I was born into a family of Minnan puppet performers.", "cn": "我出生在闽南的一个木偶戏表演世家。", "start": 0.0, "end": 3.111 },
    { "index": 1, "en": "My grandpa and my mum are both among the best.", "cn": "我的外公和我的母亲都是这行中的佼佼者。", "start": 3.437, "end": 6.049 },
    { "index": 2, "en": "They tell stories with their hands.", "cn": "他们用手讲述故事。", "start": 6.374, "end": 8.324 },
    { "index": 3, "en": "I loved the stories my grandpa and my mum told with their hands.", "cn": "我喜欢外公和妈妈用手讲述的故事。", "start": 8.649, "end": 12.341 },
    { "index": 4, "en": "However, things changed when I became a teenager.", "cn": "然而，当我成为一名青少年时，情况发生了变化。", "start": 12.725, "end": 16.195 },
    { "index": 5, "en": "I felt less close to the art because people thought puppets were too old-fashioned.", "cn": "我觉得与这门艺术不那么亲近了，因为人们认为木偶太老式了。", "start": 16.637, "end": 20.944 },
    { "index": 6, "en": "I didn't want to be part of puppetry unless I was asked to.", "cn": "除非有人要求，否则我不想参与木偶表演。", "start": 21.269, "end": 24.38 },
    { "index": 7, "en": "One day my mum showed me a performance by my grandpa's teacher.", "cn": "一天，妈妈给我看了外公老师的一场表演。", "start": 25.077, "end": 28.722 },
    { "index": 8, "en": "The finely made puppets and their exciting movements brought back childhood memories.", "cn": "精致的木偶和它们激动人心的动作带回了童年的记忆。", "start": 29.105, "end": 33.947 },
    { "index": 9, "en": "Then and there, my love for puppetry started to grow again.", "cn": "就在那时，我对木偶表演的热爱重新燃起。", "start": 34.388, "end": 38.045 },
    { "index": 10, "en": "I posted my doubts about the future of puppetry online.", "cn": "我在网上发布了关于木偶表演未来的困惑。", "start": 38.324, "end": 41.679 },
    { "index": 11, "en": "To my surprise, the post was flooded with comments expressing warm feelings.", "cn": "令我惊讶的是，帖子被表达温暖情感的评论淹没了。", "start": 41.958, "end": 46.775 },
    { "index": 12, "en": "Many people showed their love for the art of puppetry and encouraged me to hold on.", "cn": "许多人表达了对木偶表演艺术的热爱，并鼓励我坚持。", "start": 47.217, "end": 52.22 },
    { "index": 13, "en": "A truth hit me - it was my duty to keep the art alive because puppetry was in my blood.", "cn": "一个真相击中了我——让这门艺术保持活力是我的责任，因为木偶表演在我的血液里。", "start": 52.604, "end": 58.606 },
    { "index": 14, "en": "The art will be popular again if young people are interested in it.", "cn": "如果年轻人对它感兴趣，这门艺术就会再次流行起来。", "start": 59.303, "end": 62.96 },
    { "index": 15, "en": "So I held a puppet show at school.", "cn": "于是我在学校举办了一场木偶表演。", "start": 63.401, "end": 65.305 },
    { "index": 16, "en": "When I finished performing, I looked up and saw a surprising picture: the students were on the edge of their seats.", "cn": "当我表演完，抬头看到一幅令人惊讶的画面：学生们都聚精会神地看着。", "start": 65.63, "end": 71.969 },
    { "index": 17, "en": "Their eyes were glued to the puppets.", "cn": "他们的眼睛紧盯着木偶。", "start": 72.294, "end": 74.5 },
    { "index": 18, "en": "After a warm cheer, they came to ask where they could see a full performance.", "cn": "在热烈的欢呼之后，他们来询问在哪里能看到完整的表演。", "start": 75.011, "end": 80.154 },
    { "index": 19, "en": "The positive reply from the young viewers gave me more courage.", "cn": "年轻观众们的积极回应给了我更多勇气。", "start": 80.665, "end": 84.636 },
    { "index": 20, "en": "Since then, my puppet shows have drawn more attention both from home and abroad.", "cn": "从此，我的木偶表演在国内外都引起了更多的关注。", "start": 85.332, "end": 90.963 },
    { "index": 21, "en": "The old art is getting more interest and new stories.", "cn": "这门古老的艺术正在获得更多的兴趣和新故事。", "start": 91.288, "end": 94.585 },
    { "index": 22, "en": "With more and more people joining in, I believe the special magic of this traditional art will last forever!", "cn": "随着越来越多的人加入，我相信这门传统艺术的特殊魔力将永远持续下去！", "start": 94.968, "end": 101.656 }
  ],
  "paragraphs": [
    { "sentenceIndices": [0, 1, 2, 3], "start": 0.0, "end": 12.341 },
    { "sentenceIndices": [4, 5, 6, 7, 8, 9, 10, 11, 12, 13], "start": 12.725, "end": 58.606 },
    { "sentenceIndices": [14, 15, 16, 17, 18], "start": 59.303, "end": 80.154 },
    { "sentenceIndices": [19, 20, 21, 22], "start": 80.665, "end": 101.656 }
  ]
};

let app = null

Page({
  data: {
    unitId: '',
    title: '',
    totalSentences: 0,
    audioDuration: 0,
    paragraphs: [],
    sentences: [],
    playingSentenceIdx: -1,
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

    // 加载时间戳数据
    const data = UNIT_TIMESTAMPS

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

    // 暂停/中断
    ctx.onStop(() => {
      this.setData({ isPlaying: false })
    })
    ctx.onPause(() => {
      this.setData({ isPlaying: false })
    })

    this._audioCtx = ctx
  },

  _scrollToSentence(idx) {
    if (idx < 0) return
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
