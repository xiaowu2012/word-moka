/**
 * 课文阅读页 - 单音频 + 时间戳高亮 + 慢/快切换
 * 
 * 逻辑：
 * 1. 加载 Unit1_full.mp3 或 Unit1_slow.mp3
 * 2. 时间戳决定句子高亮和跳转
 * 3. 播放全文 → onTimeUpdate 实时算当前时间落在哪句 → 高亮
 * 4. 点某句 → seek 到对应时间位置
 * 5. 顶部"慢/快"按钮切换语速
 */

/* 由 scripts/generate-unit-audio.py 自动生成 - 26句含引言段 */
const TIMESTAMPS_FAST = {
  audioDuration: 110.02,
  sentences: [
    { "index": 0, "en": "Good evening, ladies and gentlemen. I'm Zhan Haojing, a high school student.", "cn": "晚上好，女士们先生们。我是詹昊晶，一名高中生。", "start": 0.0, "end": 3.959 },
    { "index": 1, "en": "I'm also a puppet performer.", "cn": "我还是一名木偶表演者。", "start": 4.133, "end": 5.735 },
    { "index": 2, "en": "Look at this puppet. If I move my fingers, it will come to life!", "cn": "看看这个木偶。如果我动动手指，它就会活过来！", "start": 5.944, "end": 10.286 },
    { "index": 3, "en": "I was born into a family of Minnan puppet performers.", "cn": "我出生在闽南的一个木偶戏表演世家。", "start": 10.728, "end": 14.013 },
    { "index": 4, "en": "My grandpa and my mum are both among the best.", "cn": "我的外公和我的母亲都是这行中的佼佼者。", "start": 14.222, "end": 16.846 },
    { "index": 5, "en": "They tell stories with their hands.", "cn": "他们用手讲述故事。", "start": 17.171, "end": 19.006 },
    { "index": 6, "en": "I loved the stories my grandpa and my mum told with their hands.", "cn": "我喜欢外公和妈妈用手讲述的故事。", "start": 19.447, "end": 22.976 },
    { "index": 7, "en": "However, things changed when I became a teenager.", "cn": "然而，当我成为一名青少年时，情况发生了变化。", "start": 23.417, "end": 26.517 },
    { "index": 8, "en": "I felt less close to the art because people thought puppets were too old-fashioned.", "cn": "我觉得与这门艺术不那么亲近了，因为人们认为木偶太老式了。", "start": 26.9, "end": 31.161 },
    { "index": 9, "en": "I didn't want to be part of puppetry unless I was asked to.", "cn": "除非有人要求，否则我不想参与木偶表演。", "start": 31.672, "end": 34.482 },
    { "index": 10, "en": "One day my mum showed me a performance by my grandpa's teacher.", "cn": "一天，妈妈给我看了外公老师的一场表演。", "start": 35.434, "end": 39.323 },
    { "index": 11, "en": "The finely made puppets and their exciting movements brought back childhood memories.", "cn": "精致的木偶和它们激动人心的动作带回了童年的记忆。", "start": 39.764, "end": 44.478 },
    { "index": 12, "en": "Then and there, my love for puppetry started to grow again.", "cn": "就在那时，我对木偶表演的热爱重新燃起。", "start": 45.174, "end": 48.889 },
    { "index": 13, "en": "I posted my doubts about the future of puppetry online.", "cn": "我在网上发布了关于木偶表演未来的困惑。", "start": 49.331, "end": 52.651 },
    { "index": 14, "en": "To my surprise, the post was flooded with comments expressing warm feelings.", "cn": "令我惊讶的是，帖子被表达温暖情感的评论淹没了。", "start": 53.162, "end": 58.224 },
    { "index": 15, "en": "Many people showed their love for the art of puppetry and encouraged me to hold on.", "cn": "许多人表达了对木偶表演艺术的热爱，并鼓励我坚持。", "start": 58.92, "end": 63.855 },
    { "index": 16, "en": "A truth hit me - it was my duty to keep the art alive because puppetry was in my blood.", "cn": "一个真相击中了我——让这门艺术保持活力是我的责任，因为木偶表演在我的血液里。", "start": 64.18, "end": 70.019 },
    { "index": 17, "en": "The art will be popular again if young people are interested in it.", "cn": "如果年轻人对它感兴趣，这门艺术就会再次流行起来。", "start": 70.53, "end": 74.176 },
    { "index": 18, "en": "So I held a puppet show at school.", "cn": "于是我在学校举办了一场木偶表演。", "start": 74.686, "end": 76.66 },
    { "index": 19, "en": "When I finished performing, I looked up and saw a surprising picture: the students were on the edge of their seats.", "cn": "当我表演完，抬头看到一幅令人惊讶的画面：学生们都聚精会神地看着。", "start": 77.043, "end": 83.487 },
    { "index": 20, "en": "Their eyes were glued to the puppets.", "cn": "他们的眼睛紧盯着木偶。", "start": 83.661, "end": 86.087 },
    { "index": 21, "en": "After a warm cheer, they came to ask where they could see a full performance.", "cn": "在热烈的欢呼之后，他们来询问在哪里能看到完整的表演。", "start": 86.598, "end": 91.312 },
    { "index": 22, "en": "The positive reply from the young viewers gave me more courage.", "cn": "年轻观众们的积极回应给了我更多勇气。", "start": 91.916, "end": 95.515 },
    { "index": 23, "en": "Since then, my puppet shows have drawn more attention both from home and abroad.", "cn": "从此，我的木偶表演在国内外都引起了更多的关注。", "start": 95.898, "end": 100.461 },
    { "index": 24, "en": "The old art is getting more interest and new stories.", "cn": "这门古老的艺术正在获得更多的兴趣和新故事。", "start": 100.786, "end": 103.689 },
    { "index": 25, "en": "With more and more people joining in, I believe the special magic of this traditional art will last forever!", "cn": "随着越来越多的人加入，我相信这门传统艺术的特殊魔力将永远持续下去！", "start": 104.014, "end": 110.016 }
  ],
  paragraphs: [
    { "sentenceIndices": [0, 1, 2], "start": 0.0, "end": 10.286 },
    { "sentenceIndices": [3, 4, 5, 6], "start": 10.728, "end": 22.976 },
    { "sentenceIndices": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16], "start": 23.417, "end": 70.019 },
    { "sentenceIndices": [17, 18, 19, 20, 21], "start": 70.53, "end": 91.312 },
    { "sentenceIndices": [22, 23, 24, 25], "start": 91.916, "end": 110.016 }
  ]
};

const SCALE = 1 / 0.86
const TIMESTAMPS_SLOW = {
  audioDuration: +(110.02 * SCALE).toFixed(2),
  sentences: [
    { "index": 0, "en": "Good evening, ladies and gentlemen. I'm Zhan Haojing, a high school student.", "cn": "晚上好，女士们先生们。我是詹昊晶，一名高中生。", "start": 0.0, "end": 4.603 },
    { "index": 1, "en": "I'm also a puppet performer.", "cn": "我还是一名木偶表演者。", "start": 4.806, "end": 6.669 },
    { "index": 2, "en": "Look at this puppet. If I move my fingers, it will come to life!", "cn": "看看这个木偶。如果我动动手指，它就会活过来！", "start": 6.912, "end": 11.96 },
    { "index": 3, "en": "I was born into a family of Minnan puppet performers.", "cn": "我出生在闽南的一个木偶戏表演世家。", "start": 12.474, "end": 16.294 },
    { "index": 4, "en": "My grandpa and my mum are both among the best.", "cn": "我的外公和我的母亲都是这行中的佼佼者。", "start": 16.537, "end": 19.588 },
    { "index": 5, "en": "They tell stories with their hands.", "cn": "他们用手讲述故事。", "start": 19.966, "end": 22.1 },
    { "index": 6, "en": "I loved the stories my grandpa and my mum told with their hands.", "cn": "我喜欢外公和妈妈用手讲述的故事。", "start": 22.613, "end": 26.716 },
    { "index": 7, "en": "However, things changed when I became a teenager.", "cn": "然而，当我成为一名青少年时，情况发生了变化。", "start": 27.229, "end": 30.834 },
    { "index": 8, "en": "I felt less close to the art because people thought puppets were too old-fashioned.", "cn": "我觉得与这门艺术不那么亲近了，因为人们认为木偶太老式了。", "start": 31.279, "end": 36.234 },
    { "index": 9, "en": "I didn't want to be part of puppetry unless I was asked to.", "cn": "除非有人要求，否则我不想参与木偶表演。", "start": 36.828, "end": 40.095 },
    { "index": 10, "en": "One day my mum showed me a performance by my grandpa's teacher.", "cn": "一天，妈妈给我看了外公老师的一场表演。", "start": 41.202, "end": 45.724 },
    { "index": 11, "en": "The finely made puppets and their exciting movements brought back childhood memories.", "cn": "精致的木偶和它们激动人心的动作带回了童年的记忆。", "start": 46.237, "end": 51.719 },
    { "index": 12, "en": "Then and there, my love for puppetry started to grow again.", "cn": "就在那时，我对木偶表演的热爱重新燃起。", "start": 52.528, "end": 56.848 },
    { "index": 13, "en": "I posted my doubts about the future of puppetry online.", "cn": "我在网上发布了关于木偶表演未来的困惑。", "start": 57.362, "end": 61.222 },
    { "index": 14, "en": "To my surprise, the post was flooded with comments expressing warm feelings.", "cn": "令我惊讶的是，帖子被表达温暖情感的评论淹没了。", "start": 61.816, "end": 67.702 },
    { "index": 15, "en": "Many people showed their love for the art of puppetry and encouraged me to hold on.", "cn": "许多人表达了对木偶表演艺术的热爱，并鼓励我坚持。", "start": 68.512, "end": 74.25 },
    { "index": 16, "en": "A truth hit me - it was my duty to keep the art alive because puppetry was in my blood.", "cn": "一个真相击中了我——让这门艺术保持活力是我的责任，因为木偶表演在我的血液里。", "start": 74.628, "end": 81.417 },
    { "index": 17, "en": "The art will be popular again if young people are interested in it.", "cn": "如果年轻人对它感兴趣，这门艺术就会再次流行起来。", "start": 82.012, "end": 86.251 },
    { "index": 18, "en": "So I held a puppet show at school.", "cn": "于是我在学校举办了一场木偶表演。", "start": 86.844, "end": 89.14 },
    { "index": 19, "en": "When I finished performing, I looked up and saw a surprising picture: the students were on the edge of their seats.", "cn": "当我表演完，抬头看到一幅令人惊讶的画面：学生们都聚精会神地看着。", "start": 89.585, "end": 97.078 },
    { "index": 20, "en": "Their eyes were glued to the puppets.", "cn": "他们的眼睛紧盯着木偶。", "start": 97.28, "end": 100.101 },
    { "index": 21, "en": "After a warm cheer, they came to ask where they could see a full performance.", "cn": "在热烈的欢呼之后，他们来询问在哪里能看到完整的表演。", "start": 100.695, "end": 106.177 },
    { "index": 22, "en": "The positive reply from the young viewers gave me more courage.", "cn": "年轻观众们的积极回应给了我更多勇气。", "start": 106.879, "end": 111.064 },
    { "index": 23, "en": "Since then, my puppet shows have drawn more attention both from home and abroad.", "cn": "从此，我的木偶表演在国内外都引起了更多的关注。", "start": 111.509, "end": 116.815 },
    { "index": 24, "en": "The old art is getting more interest and new stories.", "cn": "这门古老的艺术正在获得更多的兴趣和新故事。", "start": 117.193, "end": 120.569 },
    { "index": 25, "en": "With more and more people joining in, I believe the special magic of this traditional art will last forever!", "cn": "随着越来越多的人加入，我相信这门传统艺术的特殊魔力将永远持续下去！", "start": 120.947, "end": 127.926 }
  ],
  paragraphs: [
    { "sentenceIndices": [0, 1, 2], "start": 0.0, "end": 11.96 },
    { "sentenceIndices": [3, 4, 5, 6], "start": 12.474, "end": 26.716 },
    { "sentenceIndices": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16], "start": 27.229, "end": 81.417 },
    { "sentenceIndices": [17, 18, 19, 20, 21], "start": 82.012, "end": 106.177 },
    { "sentenceIndices": [22, 23, 24, 25], "start": 106.879, "end": 127.926 }
  ]
}

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
    isSlow: false,
    // 预格式化好的时间显示，避免模板里调 .toFixed()
    progressTime: '0',
    totalTime: '102',          // 慢速模式 on/off

    // 弹窗
    showWordCard: false,
    selectedWord: null,
  },

  onLoad(options) {
    const unitId = options.unit || 'Unit1'
    app = getApp()
    this._unitId = unitId
    this._audioCtx = null

    // 加载正常版
    this._setTimestamps(TIMESTAMPS_FAST)
    this._initAudio('normal')
  },

  _setTimestamps(ts) {
    this._ts = ts
    const totalTime = this._formatNum(ts.audioDuration)
    this.setData({
      title: ts.title,
      totalSentences: ts.totalSentences,
      audioDuration: ts.audioDuration,
      paragraphs: ts.paragraphs,
      sentences: ts.sentences,
      totalTime,
    })
  },

  _formatNum(n) { return typeof n === 'number' ? Math.round(n) + '' : '0' },
  _formatTime(idx) {
    const s = this._ts && this._ts.sentences
    if (s && s[idx]) return this._formatNum(s[idx].end)
    return '0'
  },

  // 对应两个音频文件
  _audioFiles: {
    'normal': 'Unit1_full.mp3',
    'slow': 'Unit1_slow.mp3',
  },

  _initAudio(mode = 'normal') {
    // 销毁旧音频
    if (this._audioCtx) {
      this._audioCtx.stop()
      this._audioCtx.destroy()
      this._audioCtx = null
    }

    const ctx = wx.createInnerAudioContext()
    ctx.src = `/audio/${this._audioFiles[mode]}`
    ctx.autoplay = false
    ctx.obeyMuteSwitch = false

    ctx.onTimeUpdate(() => {
      const t = ctx.currentTime
      const sentences = this._ts.sentences
      let foundIdx = -1
      for (let i = 0; i < sentences.length; i++) {
        if (t >= sentences[i].start && t < sentences[i].end) {
          foundIdx = i
          break
        }
      }
      if (foundIdx !== this.data.playingSentenceIdx) {
        this.setData({
          playingSentenceIdx: foundIdx,
          progressTime: this._formatTime(foundIdx),
        })
        this._scrollToSentence(foundIdx)
      }
    })

    ctx.onEnded(() => {
      this.setData({ isPlaying: false, playingSentenceIdx: -1 })
    })

    ctx.onStop(() => { this.setData({ isPlaying: false }) })
    ctx.onPause(() => { this.setData({ isPlaying: false }) })

    this._audioCtx = ctx
  },

  // === 慢/快切换 ===
  onToggleSpeed() {
    const isSlow = !this.data.isSlow
    const mode = isSlow ? 'slow' : 'normal'
    const ts = isSlow ? TIMESTAMPS_SLOW : TIMESTAMPS_FAST
    const wasPlaying = this._audioCtx && !this._audioCtx.paused
    const currentTime = this._audioCtx ? this._audioCtx.currentTime : 0

    // 找当前句，换算到新时间线
    let seekTime = 0
    const oldTs = this._ts
    if (wasPlaying && oldTs) {
      const oldSentences = oldTs.sentences
      let curIdx = -1
      for (let i = 0; i < oldSentences.length; i++) {
        if (currentTime >= oldSentences[i].start && currentTime < oldSentences[i].end) {
          curIdx = i
          break
        }
      }
      if (curIdx >= 0 && ts.sentences[curIdx]) {
        const ratio = oldTs.audioDuration / ts.audioDuration
        seekTime = currentTime * ratio
      }
    }

    // 换音频和时间戳
    this._setTimestamps(ts)
    this._initAudio(mode)
    this.setData({ isSlow })

    if (wasPlaying && seekTime > 0) {
      this._audioCtx.seek(seekTime)
      this._audioCtx.play()
    }
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
    const sentences = this._ts.sentences
    if (idx >= sentences.length) return

    this._audioCtx.seek(sentences[idx].start)
    this._audioCtx.play()
    this.setData({
      isPlaying: true,
      playingSentenceIdx: idx,
      progressTime: this._formatTime(idx),
    })
  },

  _pause() {
    if (this._audioCtx) this._audioCtx.pause()
    this.setData({ isPlaying: false })
  },

  // === 显示控制 ===

  onToggleCn() {
    this.setData({ showCn: !this.data.showCn })
  },

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

  onBack() { wx.navigateBack() },
})
