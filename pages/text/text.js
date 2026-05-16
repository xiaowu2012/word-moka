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

/* 从 data/texts.json 自动生成 - 25句, 与PDF核对一致 */

// ===== 数据 =====
const TIMESTAMPS_FAST = {
  "totalSentences": 25,
  "audioDuration": 109.04,
  "sentences": [
    {
      "index": 0,
      "en": "Good evening, ladies and gentlemen. I'm Zhan Haojing, a high school student.",
      "cn": "晚上好，女士们先生们。我是詹昊晶，一名高中生。",
      "start": 0,
      "end": 0,
      "vocab": [
        "gentleman",
        "lady"
      ]
    },
    {
      "index": 1,
      "en": "I'm also a puppet performer.",
      "cn": "我还是一名木偶表演者。",
      "start": 0,
      "end": 0,
      "vocab": [
        "performer"
      ]
    },
    {
      "index": 2,
      "en": "Look at this puppet. If I move my fingers, it will come to life!",
      "cn": "看看这个木偶。如果我动动手指，它就会活过来！",
      "start": 0,
      "end": 0,
      "vocab": [
        "finger"
      ]
    },
    {
      "index": 3,
      "en": "I was born into a family of Minnan puppet performers.",
      "cn": "我出生在闽南的一个木偶戏表演世家。",
      "start": 0,
      "end": 0,
      "vocab": [
        "performer"
      ]
    },
    {
      "index": 4,
      "en": "My grandpa and my mum are both among the best.",
      "cn": "我的外公和我的母亲都是这行中的佼佼者。",
      "start": 0,
      "end": 0,
      "vocab": []
    },
    {
      "index": 5,
      "en": "When I was little, I loved the amazing stories they told with their hands.",
      "cn": "小的时候，我喜欢他们用手讲述的精彩故事。",
      "start": 0,
      "end": 0,
      "vocab": []
    },
    {
      "index": 6,
      "en": "However, things changed when I became a teenager.",
      "cn": "然而，当我成为一名青少年时，情况发生了变化。",
      "start": 0,
      "end": 0,
      "vocab": [
        "teenager"
      ]
    },
    {
      "index": 7,
      "en": "I felt less close to the art because people thought puppets were too old-fashioned.",
      "cn": "我觉得与这门艺术不那么亲近了，因为人们认为木偶太老式了。",
      "start": 0,
      "end": 0,
      "vocab": [
        "old-fashioned"
      ]
    },
    {
      "index": 8,
      "en": "I didn't want to be part of puppetry unless I was asked to.",
      "cn": "除非有人要求，否则我不想参与木偶表演。",
      "start": 0,
      "end": 0,
      "vocab": [
        "unless"
      ]
    },
    {
      "index": 9,
      "en": "One day my mum showed me a performance by my grandpa's teacher.",
      "cn": "一天，妈妈给我看了外公老师的一场表演。",
      "start": 0,
      "end": 0,
      "vocab": [
        "performance"
      ]
    },
    {
      "index": 10,
      "en": "The finely made puppets and their exciting movements brought back childhood memories.",
      "cn": "精致的木偶和它们激动人心的动作带回了童年的记忆。",
      "start": 0,
      "end": 0,
      "vocab": []
    },
    {
      "index": 11,
      "en": "Then and there, my love for puppetry started to grow again.",
      "cn": "就在那时，我对木偶表演的热爱重新燃起。",
      "start": 0,
      "end": 0,
      "vocab": []
    },
    {
      "index": 12,
      "en": "I posted my doubts about the future of puppetry online.",
      "cn": "我在网上发布了关于木偶表演未来的困惑。",
      "start": 0,
      "end": 0,
      "vocab": []
    },
    {
      "index": 13,
      "en": "To my surprise, the post was flooded with comments expressing warm feelings.",
      "cn": "令我惊讶的是，帖子被表达温暖情感的评论淹没了。",
      "start": 0,
      "end": 0,
      "vocab": []
    },
    {
      "index": 14,
      "en": "Many people showed their love for the art of puppetry and encouraged me to hold on.",
      "cn": "许多人表达了对木偶表演艺术的热爱，并鼓励我坚持。",
      "start": 0,
      "end": 0,
      "vocab": []
    },
    {
      "index": 15,
      "en": "A truth hit me - it was my duty to keep the art alive because puppetry was in my blood.",
      "cn": "一个真相击中了我——让这门艺术保持活力是我的责任，因为木偶表演在我的血液里。",
      "start": 0,
      "end": 0,
      "vocab": [
        "blood"
      ]
    },
    {
      "index": 16,
      "en": "The art will be popular again if young people are interested in it.",
      "cn": "如果年轻人对它感兴趣，这门艺术就会再次流行起来。",
      "start": 0,
      "end": 0,
      "vocab": []
    },
    {
      "index": 17,
      "en": "So I held a puppet show at school.",
      "cn": "于是我在学校举办了一场木偶表演。",
      "start": 0,
      "end": 0,
      "vocab": []
    },
    {
      "index": 18,
      "en": "When I finished performing, I looked up and saw a surprising picture: the students were on the edge of their seats.",
      "cn": "当我表演完，抬头看到一幅令人惊讶的画面：学生们都聚精会神地看着。",
      "start": 0,
      "end": 0,
      "vocab": [
        "perform"
      ]
    },
    {
      "index": 19,
      "en": "Their eyes were glued to the puppets.",
      "cn": "他们的眼睛紧盯着木偶。",
      "start": 0,
      "end": 0,
      "vocab": []
    },
    {
      "index": 20,
      "en": "After a warm cheer, they came to ask where they could see a full performance.",
      "cn": "在热烈的欢呼之后，他们来询问在哪里能看到完整的表演。",
      "start": 0,
      "end": 0,
      "vocab": [
        "performance"
      ]
    },
    {
      "index": 21,
      "en": "The positive reply from the young viewers gave me more courage.",
      "cn": "年轻观众们的积极回应给了我更多勇气。",
      "start": 0,
      "end": 0,
      "vocab": [
        "viewer"
      ]
    },
    {
      "index": 22,
      "en": "Since then, my puppet shows have drawn more attention both from home and abroad.",
      "cn": "从此，我的木偶表演在国内外都引起了更多的关注。",
      "start": 0,
      "end": 0,
      "vocab": []
    },
    {
      "index": 23,
      "en": "The old art is getting more interest and new stories.",
      "cn": "这门古老的艺术正在获得更多的兴趣和新故事。",
      "start": 0,
      "end": 0,
      "vocab": []
    },
    {
      "index": 24,
      "en": "With more and more people joining in, I believe the special magic of this traditional art will last forever!",
      "cn": "随着越来越多的人加入，我相信这门传统艺术的特殊魔力将永远持续下去！",
      "start": 0,
      "end": 0,
      "vocab": []
    }
  ],
  "paragraphs": [
    {
      "sentenceIndices": [
        0,
        1,
        2
      ],
      "start": 0,
      "end": 0
    },
    {
      "sentenceIndices": [
        3,
        4,
        5
      ],
      "start": 0,
      "end": 0
    },
    {
      "sentenceIndices": [
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15
      ],
      "start": 0,
      "end": 0
    },
    {
      "sentenceIndices": [
        16,
        17,
        18,
        19,
        20
      ],
      "start": 0,
      "end": 0
    },
    {
      "sentenceIndices": [
        21,
        22,
        23,
        24
      ],
      "start": 0,
      "end": 0
    }
  ]
}
const SCALE = 1 / 0.86
const TIMESTAMPS_SLOW = {
  "totalSentences": 25,
  "audioDuration": +(109.04 * SCALE).toFixed(2),
  "sentences": TIMESTAMPS_FAST.sentences.map(s => ({ ...s, start: +(s.start * SCALE).toFixed(3), end: +(s.end * SCALE).toFixed(3) })),
  "paragraphs": TIMESTAMPS_FAST.paragraphs.map(p => ({ ...p, start: +(p.start * SCALE).toFixed(3), end: +(p.end * SCALE).toFixed(3) }))
}

const VOCAB_DATA = {
  "lady": {
    "word": "lady",
    "cn": "女士，女子",
    "ph": "/'lerdi/"
  },
  "gentleman": {
    "word": "gentleman",
    "cn": "先生",
    "ph": "/'dsentlman/"
  },
  "performer": {
    "word": "performer",
    "cn": "表演者",
    "ph": "/pe 'fo:ma/"
  },
  "finger": {
    "word": "finger",
    "cn": "手指",
    "ph": "/'fuga/"
  },
  "teenager": {
    "word": "teenager",
    "cn": "青少年",
    "ph": "/'tinerdga/"
  },
  "unless": {
    "word": "unless",
    "cn": "除非•.",
    "ph": "/an'les/"
  },
  "performance": {
    "word": "performance",
    "cn": "表演",
    "ph": "/pa 'fo:mans/"
  },
  "blood": {
    "word": "blood",
    "cn": "血，血液",
    "ph": "/bld/"
  },
  "perform": {
    "word": "perform",
    "cn": "表演，演出",
    "ph": "/pe 'fo:m/"
  },
  "viewer": {
    "word": "viewer",
    "cn": "观看者",
    "ph": "/'vjua/"
  },
  "creativity": {
    "word": "creativity",
    "cn": "独创性",
    "ph": "/，kri:er'tvsti/"
  },
  "artist": {
    "word": "artist",
    "cn": "艺术家",
    "ph": "/'a:tust/"
  },
  "group": {
    "word": "group",
    "cn": "组，群；团体",
    "ph": "/grup/"
  },
  "creator": {
    "word": "creator",
    "cn": "创作者；创造者",
    "ph": "/kri'eite/"
  },
  "kill": {
    "word": "kill",
    "cn": "弄死，杀死",
    "ph": "/kal/"
  },
  "youth": {
    "word": "youth",
    "cn": "青年，年轻人",
    "ph": "/ju:6/"
  },
  "wealthy": {
    "word": "wealthy",
    "cn": "富有的；富",
    "ph": "/'welfi/"
  },
  "hidden": {
    "word": "hidden",
    "cn": "隐藏的，隐秘的",
    "ph": "/'hrcdn/"
  },
  "wildly": {
    "word": "wildly",
    "cn": "激动地",
    "ph": "/'warldli/"
  },
  "scare": {
    "word": "scare",
    "cn": "使惊恐，吓唬",
    "ph": "/skea/"
  },
  "wing": {
    "word": "wing",
    "cn": "翅膀，翼",
    "ph": "/wu/"
  },
  "eagle": {
    "word": "eagle",
    "cn": "鹰",
    "ph": ""
  },
  "lie": {
    "word": "lie",
    "cn": "躺；说谎",
    "ph": ""
  },
  "old-fashioned": {
    "word": "old-fashioned",
    "cn": "老式的，过时的",
    "ph": ""
  }
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
    sentenceTokens: [],
    selectedVocab: null,
    playingSentenceIdx: -1,
    showCn: true,
    isPlaying: false,
    isSlow: false,
    // 预格式化好的时间显示
    progressTime: '0s',
    totalTime: '0s',

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
    const totalTime = this._fmtSec(ts.audioDuration)

    // 分词：每句拆成 token 数组
    const sentenceTokens = ts.sentences.map(s => this._tokenize(s.en, s.vocab))

    this.setData({
      unitId: ts.unit || this._unitId,
      title: ts.title,
      totalSentences: ts.totalSentences,
      audioDuration: ts.audioDuration,
      paragraphs: ts.paragraphs,
      sentences: ts.sentences,
      sentenceTokens,
      totalTime,
      // 关掉行内卡片
      selectedVocab: null,
    })
  },

  // 秒数 -> 友好时间格式: 23s / 1m49s
  _fmtSec(n) {
    if (typeof n !== 'number') return '0s'
    const s = Math.round(n)
    if (s < 60) return s + 's'
    const m = Math.floor(s / 60)
    const sec = s % 60
    return sec > 0 ? m + 'm' + sec + 's' : m + 'm'
  },
  _formatTime(idx) {
    const s = this._ts && this._ts.sentences
    if (s && s[idx]) return this._fmtSec(s[idx].end)
    return '0s'
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

  // ===== 重点词分词 + 行内卡片 =====

  // 检查单词是否匹配某个重点词（处理变形）
  _matchVocab(word, vocabList) {
    if (!vocabList || vocabList.length === 0) return null
    const w = word.toLowerCase().replace(/[^a-z]/g, '')
    if (!w) return null

    // 直接匹配
    if (vocabList.includes(w)) return w

    // 规则suffix: +s, +es, +ed, +ing, +er, +ers, +tion, +sions
    const suffixes = ['s', 'es', 'ed', 'ing', 'er', 'ers', 'tion', 'tions', 'sion', 'sions', 'ance', 'ances']
    for (const suf of suffixes) {
      if (w.endsWith(suf)) {
        const base = w.slice(0, -suf.length)
        if (vocabList.includes(base)) return base
      }
    }

    // y → ies
    if (w.endsWith('ies')) {
      const base = w.slice(0, -3) + 'y'
      if (vocabList.includes(base)) return base
    }

    // man → men
    if (w.endsWith('men')) {
      const base = w.slice(0, -3) + 'man'
      if (vocabList.includes(base)) return base
    }

    return null
  },

  // 把句子拆成 tokens，标记重点词
  _tokenize(en, vocabList) {
    const tokens = []
    // 按单词和标点拆分
    const parts = en.match(/\w+(?:'\w+)?(?:-\w+)*|[^\w\s]+/g) || []
    for (const part of parts) {
      const matched = this._matchVocab(part, vocabList)
      tokens.push({
        text: part,
        isVocab: !!matched,
        wordKey: matched || '',
      })
    }
    return tokens
  },

  // 行内卡片点击
  onTapWord(e) {
    const wordKey = e.currentTarget.dataset.word
    // 非重点词（wordKey空字符串）→ 忽略
    if (!wordKey || !VOCAB_DATA[wordKey]) return

    const info = VOCAB_DATA[wordKey]
    if (this.data.selectedVocab && this.data.selectedVocab.word === info.word) {
      // 点同一个词 → 关掉
      this.setData({ selectedVocab: null })
    } else {
      this.setData({ selectedVocab: info })
    }
  },

  // 点击空白区域关卡片
  onDismissCard() {
    this.setData({ selectedVocab: null })
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
