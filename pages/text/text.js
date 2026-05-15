const TEXT_DATA = {
  "Unit1": {
    "title": "Art in safe hands",
    "paragraphs": [
      {"sentences": [
        {"en": "I was born into a family of Minnan puppet performers.", "cn": "我出生在闽南的一个木偶戏表演世家。", "vocab": ["performer"]},
        {"en": "My grandpa and my mum are both among the best.", "cn": "我的外公和我的母亲都是这行中的佼佼者。", "vocab": []},
        {"en": "They tell stories with their hands.", "cn": "他们用手讲述故事。", "vocab": []},
        {"en": "I loved the stories my grandpa and my mum told with their hands.", "cn": "我喜欢外公和妈妈用手讲述的故事。", "vocab": []}
      ]},
      {"sentences": [
        {"en": "However, things changed when I became a teenager.", "cn": "然而，当我成为一名青少年时，情况发生了变化。", "vocab": ["teenager"]},
        {"en": "I felt less close to the art because people thought puppets were too old-fashioned.", "cn": "我觉得与这门艺术不那么亲近了，因为人们认为木偶太老式了。", "vocab": ["old-fashioned"]},
        {"en": "I didn't want to be part of puppetry unless I was asked to.", "cn": "除非有人要求，否则我不想参与木偶表演。", "vocab": ["puppetry", "unless"]},
        {"en": "One day my mum showed me a performance by my grandpa's teacher.", "cn": "一天，妈妈给我看了外公老师的一场表演。", "vocab": ["performance"]},
        {"en": "The finely made puppets and their exciting movements brought back childhood memories.", "cn": "精致的木偶和激动人心的动作带回了童年的记忆。", "vocab": []},
        {"en": "Then and there, my love for puppetry started to grow again.", "cn": "就在那时，我对木偶表演的热爱重新燃起。", "vocab": []},
        {"en": "I posted my doubts about the future of puppetry online.", "cn": "我在网上发布了关于木偶表演未来的困惑。", "vocab": []},
        {"en": "To my surprise, the post was flooded with comments expressing warm feelings.", "cn": "令我惊讶的是，帖子被表达温暖情感的评论淹没了。", "vocab": []},
        {"en": "Many people showed their love for the art of puppetry and encouraged me to hold on.", "cn": "许多人表达了对木偶表演艺术的热爱，并鼓励我坚持。", "vocab": []},
        {"en": "A truth hit me - it was my duty to keep the art alive because puppetry was in my blood.", "cn": "一个真相击中了我——让这门艺术保持活力是我的责任，因为木偶表演在我的血液里。", "vocab": ["blood"]}
      ]},
      {"sentences": [
        {"en": "The art will be popular again if young people are interested in it.", "cn": "如果年轻人对它感兴趣，这门艺术就会再次流行起来。", "vocab": []},
        {"en": "So I held a puppet show at school.", "cn": "于是我在学校举办了一场木偶表演。", "vocab": ["perform"]},
        {"en": "When I finished performing, I looked up and saw a surprising picture: the students were on the edge of their seats.", "cn": "当我表演完，抬头看到一幅令人惊讶的画面：学生们都聚精会神地看着。", "vocab": ["edge"]},
        {"en": "Their eyes were glued to the puppets.", "cn": "他们的眼睛紧盯着木偶。", "vocab": []},
        {"en": "After a warm cheer, they came to ask where they could see a full performance.", "cn": "在热烈的欢呼之后，他们来询问在哪里能看到完整的表演。", "vocab": []}
      ]},
      {"sentences": [
        {"en": "The positive reply from the young viewers gave me more courage.", "cn": "年轻观众们的积极回应给了我更多勇气。", "vocab": ["viewer"]},
        {"en": "Since then, my puppet shows have drawn more attention both from home and abroad.", "cn": "从此，我的木偶表演在国内外都引起了更多的关注。", "vocab": []},
        {"en": "The old art is getting more interest and new stories.", "cn": "这门古老的艺术正在获得更多的兴趣和新故事。", "vocab": []},
        {"en": "With more and more people joining in, I believe the special magic of this traditional art will last forever!", "cn": "随着越来越多的人加入，我相信这门传统艺术的特殊魔力将永远持续下去！", "vocab": ["inspire"]}
      ]}
    ]
  }
}

Page({
  data: {
    unitId: '', title: '', paragraphs: [],
    words: {}, selectedWord: null, showWordCard: false,
    playingIdx: null, playAllMode: false, totalSentences: 0,
    showActions: false, actionSentenceIdx: -1
  },

  onLoad(options) {
    const unitId = options.unit || 'Unit1'
    const textData = TEXT_DATA[unitId]
    if (!textData) { wx.showToast({ title: '课文加载失败', icon: 'none' }); return }

    const allWords = getApp().globalData.words || {}
    let gidx = 0
    const paragraphs = textData.paragraphs.map(para => ({
      sentences: para.sentences.map(s => ({
        en: s.en, cn: s.cn, gidx: gidx++,
        tokens: this.tokenize(s.en, s.vocab, allWords)
      }))
    }))

    this.setData({
      unitId, title: textData.title, paragraphs, words: allWords,
      totalSentences: paragraphs.reduce((s, p) => s + p.sentences.length, 0)
    })
  },

  tokenize(sentence, vocabList, allWords) {
    const tokens = []
    const parts = sentence.match(/\w+[-\w]*|[^\w\s]/g) || []
    for (const part of parts) {
      const clean = part.replace(/[^a-zA-Z\-\']/g, '').toLowerCase()
      tokens.push({ text: part, isVocab: vocabList.includes(clean), wordKey: clean })
    }
    return tokens
  },

  onPlayAll() {
    this.setData({ playAllMode: true, showActions: false })
    this.playSentence(0)
  },

  onPlaySentence(e) {
    const idx = parseInt(e.currentTarget.dataset.idx)
    this.setData({ playAllMode: false, showActions: false })
    if (this._actionTimer) clearTimeout(this._actionTimer)
    this.playSentence(idx)
  },

  playSentence(idx) {
    // 停止正在播放的音频
    if (this._audioCtx) {
      this._audioCtx.stop()
      this._audioCtx.destroy()
      this._audioCtx = null
    }

    if (idx >= this.data.totalSentences) {
      this.setData({ playAllMode: false, playingIdx: null, showActions: false })
      return
    }
    this.setData({ playingIdx: idx, showActions: false })

    this._audioCtx = wx.createInnerAudioContext()
    this._audioCtx.src = `/audio/text/${this.data.unitId.toLowerCase()}_${idx}.mp3`
    this._audioCtx.play()

    this._audioCtx.onEnded(() => {
      this._audioCtx.destroy()
      this._audioCtx = null
      if (this.data.playAllMode) {
        // 句间停顿2秒
        setTimeout(() => {
          this.playSentence(idx + 1)
        }, 2000)
      } else {
        this.setData({ playingIdx: null })
        this.showActions(idx)
      }
    })
    this._audioCtx.onError(() => {
      this._audioCtx.destroy()
      this._audioCtx = null
      if (this.data.playAllMode) this.playSentence(idx + 1)
      else this.setData({ playingIdx: null })
    })
  },

  showActions(idx) {
    this.setData({ showActions: true, actionSentenceIdx: idx })
    this._actionTimer = setTimeout(() => {
      this.setData({ showActions: false })
    }, 5000)
  },

  onReplay() {
    const idx = this.data.actionSentenceIdx
    this.setData({ showActions: false })
    if (this._actionTimer) clearTimeout(this._actionTimer)
    this.playSentence(idx)
  },

  onContinueReading() {
    const idx = this.data.actionSentenceIdx + 1
    this.setData({ showActions: false, playAllMode: true })
    if (this._actionTimer) clearTimeout(this._actionTimer)
    this.playSentence(idx)
  },

  onTapWord(e) {
    const card = this.data.words[e.currentTarget.dataset.word]
    if (card) this.setData({ selectedWord: card, showWordCard: true })
  },

  onCloseWordCard() { this.setData({ showWordCard: false }) },
  onBack() { wx.navigateBack() }
})
