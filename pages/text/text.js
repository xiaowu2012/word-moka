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

// ===== 数据 =====


// ===== 数据 =====
const TIMESTAMPS_FAST = {
  unit: "Unit1",
  title: "Art in safe hands",
  totalSentences: 25,
  audioDuration: 109.04,
  sentences: [
    { "index": 0, "en": "Good evening, ladies and gentlemen. I'm Zhan Haojing, a high school student.", "cn": "\u665a\u4e0a\u597d\uff0c\u5973\u58eb\u4eec\u5148\u751f\u4eec\u3002\u6211\u662f\u8a79\u660a\u6676\uff0c\u4e00\u540d\u9ad8\u4e2d\u751f\u3002", "start": 0, "end": 4.11, "vocab": ["gentleman", "lady"] },
    { "index": 1, "en": "I'm also a puppet performer.", "cn": "\u6211\u8fd8\u662f\u4e00\u540d\u6728\u5076\u8868\u6f14\u8005\u3002", "start": 4.354, "end": 5.933, "vocab": ["performer"] },
    { "index": 2, "en": "Look at this puppet. If I move my fingers, it will come to life!", "cn": "\u770b\u770b\u8fd9\u4e2a\u6728\u5076\u3002\u5982\u679c\u6211\u52a8\u52a8\u624b\u6307\uff0c\u5b83\u5c31\u4f1a\u6d3b\u8fc7\u6765\uff01", "start": 6.211, "end": 10.101, "vocab": ["finger"] },
    { "index": 3, "en": "I was born into a family of Minnan puppet performers.", "cn": "\u6211\u51fa\u751f\u5728\u95fd\u5357\u7684\u4e00\u4e2a\u6728\u5076\u620f\u8868\u6f14\u4e16\u5bb6\u3002", "start": 10.542, "end": 13.653, "vocab": ["performer"] },
    { "index": 4, "en": "My grandpa and my mum are both among the best.", "cn": "\u6211\u7684\u5916\u516c\u548c\u6211\u7684\u6bcd\u4eb2\u90fd\u662f\u8fd9\u884c\u4e2d\u7684\u4f7c\u4f7c\u8005\u3002", "start": 14.036, "end": 17.02, "vocab": [] },
    { "index": 5, "en": "When I was little, I loved the amazing stories they told with their hands.", "cn": "\u5c0f\u7684\u65f6\u5019\uff0c\u6211\u559c\u6b22\u4ed6\u4eec\u7528\u624b\u8bb2\u8ff0\u7684\u7cbe\u5f69\u6545\u4e8b\u3002", "start": 17.972, "end": 22.953, "vocab": [] },
    { "index": 6, "en": "However, things changed when I became a teenager.", "cn": "\u7136\u800c\uff0c\u5f53\u6211\u6210\u4e3a\u4e00\u540d\u9752\u5c11\u5e74\u65f6\uff0c\u60c5\u51b5\u53d1\u751f\u4e86\u53d8\u5316\u3002", "start": 23.649, "end": 26.68, "vocab": ["teenager"] },
    { "index": 7, "en": "I felt less close to the art because people thought puppets were too old-fashioned.", "cn": "\u6211\u89c9\u5f97\u4e0e\u8fd9\u95e8\u827a\u672f\u4e0d\u90a3\u4e48\u4eb2\u8fd1\u4e86\uff0c\u56e0\u4e3a\u4eba\u4eec\u8ba4\u4e3a\u6728\u5076\u592a\u8001\u5f0f\u4e86\u3002", "start": 27.121, "end": 31.556, "vocab": ["old-fashioned"] },
    { "index": 8, "en": "I didn't want to be part of puppetry unless I was asked to.", "cn": "\u9664\u975e\u6709\u4eba\u8981\u6c42\uff0c\u5426\u5219\u6211\u4e0d\u60f3\u53c2\u4e0e\u6728\u5076\u8868\u6f14\u3002", "start": 31.881, "end": 34.876, "vocab": ["unless"] },
    { "index": 9, "en": "One day my mum showed me a performance by my grandpa's teacher.", "cn": "\u4e00\u5929\uff0c\u5988\u5988\u7ed9\u6211\u770b\u4e86\u5916\u516c\u8001\u5e08\u7684\u4e00\u573a\u8868\u6f14\u3002", "start": 35.318, "end": 38.754, "vocab": ["performance"] },
    { "index": 10, "en": "The finely made puppets and their exciting movements brought back childhood memories.", "cn": "\u7cbe\u81f4\u7684\u6728\u5076\u548c\u5b83\u4eec\u6fc0\u52a8\u4eba\u5fc3\u7684\u52a8\u4f5c\u5e26\u56de\u4e86\u7ae5\u5e74\u7684\u8bb0\u5fc6\u3002", "start": 39.079, "end": 43.596, "vocab": [] },
    { "index": 11, "en": "Then and there, my love for puppetry started to grow again.", "cn": "\u5c31\u5728\u90a3\u65f6\uff0c\u6211\u5bf9\u6728\u5076\u8868\u6f14\u7684\u70ed\u7231\u91cd\u65b0\u71c3\u8d77\u3002", "start": 43.921, "end": 47.799, "vocab": [] },
    { "index": 12, "en": "I posted my doubts about the future of puppetry online.", "cn": "\u6211\u5728\u7f51\u4e0a\u53d1\u5e03\u4e86\u5173\u4e8e\u6728\u5076\u8868\u6f14\u672a\u6765\u7684\u56f0\u60d1\u3002", "start": 48.31, "end": 51.549, "vocab": [] },
    { "index": 13, "en": "To my surprise, the post was flooded with comments expressing warm feelings.", "cn": "\u4ee4\u6211\u60ca\u8bb6\u7684\u662f\uff0c\u5e16\u5b50\u88ab\u8868\u8fbe\u6e29\u6696\u60c5\u611f\u7684\u8bc4\u8bba\u6df9\u6ca1\u4e86\u3002", "start": 51.874, "end": 56.309, "vocab": [] },
    { "index": 14, "en": "Many people showed their love for the art of puppetry and encouraged me to hold on.", "cn": "\u8bb8\u591a\u4eba\u8868\u8fbe\u4e86\u5bf9\u6728\u5076\u8868\u6f14\u827a\u672f\u7684\u70ed\u7231\uff0c\u5e76\u9f13\u52b1\u6211\u575a\u6301\u3002", "start": 56.75, "end": 61.406, "vocab": [] },
    { "index": 15, "en": "A truth hit me - it was my duty to keep the art alive because puppetry was in my blood.", "cn": "\u4e00\u4e2a\u771f\u76f8\u51fb\u4e2d\u4e86\u6211\u2014\u2014\u8ba9\u8fd9\u95e8\u827a\u672f\u4fdd\u6301\u6d3b\u529b\u662f\u6211\u7684\u8d23\u4efb\uff0c\u56e0\u4e3a\u6728\u5076\u8868\u6f14\u5728\u6211\u7684\u8840\u6db2\u91cc\u3002", "start": 62.01, "end": 67.652, "vocab": ["blood"] },
    { "index": 16, "en": "The art will be popular again if young people are interested in it.", "cn": "\u5982\u679c\u5e74\u8f7b\u4eba\u5bf9\u5b83\u611f\u5174\u8da3\uff0c\u8fd9\u95e8\u827a\u672f\u5c31\u4f1a\u518d\u6b21\u6d41\u884c\u8d77\u6765\u3002", "start": 68.093, "end": 71.483, "vocab": [] },
    { "index": 17, "en": "So I held a puppet show at school.", "cn": "\u4e8e\u662f\u6211\u5728\u5b66\u6821\u4e3e\u529e\u4e86\u4e00\u573a\u6728\u5076\u8868\u6f14\u3002", "start": 72.087, "end": 74.073, "vocab": [] },
    { "index": 18, "en": "When I finished performing, I looked up and saw a surprising picture: the students were on the edge of their seats.", "cn": "\u5f53\u6211\u8868\u6f14\u5b8c\uff0c\u62ac\u5934\u770b\u5230\u4e00\u5e45\u4ee4\u4eba\u60ca\u8bb6\u7684\u753b\u9762\uff1a\u5b66\u751f\u4eec\u90fd\u805a\u7cbe\u4f1a\u795e\u5730\u770b\u7740\u3002", "start": 74.456, "end": 82.142, "vocab": ["perform"] },
    { "index": 19, "en": "Their eyes were glued to the puppets.", "cn": "\u4ed6\u4eec\u7684\u773c\u775b\u7d27\u76ef\u7740\u6728\u5076\u3002", "start": 82.351, "end": 84.603, "vocab": [] },
    { "index": 20, "en": "After a warm cheer, they came to ask where they could see a full performance.", "cn": "\u5728\u70ed\u70c8\u7684\u6b22\u547c\u4e4b\u540e\uff0c\u4ed6\u4eec\u6765\u8be2\u95ee\u5728\u54ea\u91cc\u80fd\u770b\u5230\u5b8c\u6574\u7684\u8868\u6f14\u3002", "start": 84.986, "end": 89.873, "vocab": ["performance"] },
    { "index": 21, "en": "The positive reply from the young viewers gave me more courage.", "cn": "\u5e74\u8f7b\u89c2\u4f17\u4eec\u7684\u79ef\u6781\u56de\u5e94\u7ed9\u4e86\u6211\u66f4\u591a\u52c7\u6c14\u3002", "start": 90.57, "end": 94.041, "vocab": ["viewer"] },
    { "index": 22, "en": "Since then, my puppet shows have drawn more attention both from home and abroad.", "cn": "\u4ece\u6b64\uff0c\u6211\u7684\u6728\u5076\u8868\u6f14\u5728\u56fd\u5185\u5916\u90fd\u5f15\u8d77\u4e86\u66f4\u591a\u7684\u5173\u6ce8\u3002", "start": 94.645, "end": 99.672, "vocab": [] },
    { "index": 23, "en": "The old art is getting more interest and new stories.", "cn": "\u8fd9\u95e8\u53e4\u8001\u7684\u827a\u672f\u6b63\u5728\u83b7\u5f97\u66f4\u591a\u7684\u5174\u8da3\u548c\u65b0\u6545\u4e8b\u3002", "start": 99.997, "end": 102.935, "vocab": [] },
    { "index": 24, "en": "With more and more people joining in, I believe the special magic of this traditional art will last forever!", "cn": "\u968f\u7740\u8d8a\u6765\u8d8a\u591a\u7684\u4eba\u52a0\u5165\uff0c\u6211\u76f8\u4fe1\u8fd9\u95e8\u4f20\u7edf\u827a\u672f\u7684\u7279\u6b8a\u9b54\u529b\u5c06\u6c38\u8fdc\u6301\u7eed\u4e0b\u53bb\uff01", "start": 103.318, "end": 109.042, "vocab": [] }
  ],
  paragraphs: [
  {
    "sentenceIndices": [
      0,
      1,
      2
    ],
    "start": 0,
    "end": 10.101
  },
  {
    "sentenceIndices": [
      3,
      4,
      5
    ],
    "start": 10.542,
    "end": 22.953
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
    "start": 23.649,
    "end": 67.652
  },
  {
    "sentenceIndices": [
      16,
      17,
      18,
      19,
      20
    ],
    "start": 68.093,
    "end": 89.873
  },
  {
    "sentenceIndices": [
      21,
      22,
      23,
      24
    ],
    "start": 90.57,
    "end": 109.042
  }
]
};

const SCALE = 1 / 0.86
const TIMESTAMPS_SLOW = {
  unit: "Unit1",
  title: "Art in safe hands",
  totalSentences: 25,
  audioDuration: +(109.04 * SCALE).toFixed(2),
  sentences: TIMESTAMPS_FAST.sentences.map(s => ({ ...s, start: +(s.start * SCALE).toFixed(3), end: +(s.end * SCALE).toFixed(3) })),
  paragraphs: TIMESTAMPS_FAST.paragraphs.map(p => ({ ...p, start: +(p.start * SCALE).toFixed(3), end: +(p.end * SCALE).toFixed(3) }))
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
    showWordCard: false,
    selectedWord: null,
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

  // 重点词点击 → 弹出居中单词卡
  onTapWord(e) {
    const wordKey = e.currentTarget.dataset.word
    if (!wordKey || !VOCAB_DATA[wordKey]) return
    this.setData({ selectedWord: VOCAB_DATA[wordKey], showWordCard: true })
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
