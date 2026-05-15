const app = getApp()

Page({
  data: {
    unitId: '',
    title: '',
    paragraphs: [],
    words: {},
    selectedWord: null,
    showWordCard: false,
    playingIdx: null
  },

  onLoad(options) {
    const unitId = options.unit || 'Unit1'
    const texts = require('../../data/texts.js')
    const textData = texts[unitId]
    if (!textData) {
      wx.showToast({ title: '课文加载失败', icon: 'none' })
      return
    }

    const allWords = app.globalData.words

    // 预处理：标记每句中的重点词
    const paragraphs = textData.paragraphs.map(para => ({
      sentences: para.sentences.map(s => ({
        en: s.en,
        cn: s.cn,
        tokens: this.tokenize(s.en, s.vocab, allWords)
      }))
    }))

    this.setData({
      unitId,
      title: textData.title,
      paragraphs,
      words: allWords
    })
  },

  // 把句子拆成 tokens，标记哪些是重点词
  tokenize(sentence, vocabList, allWords) {
    // 按空格和标点拆分
    const tokens = []
    const parts = sentence.match(/\w+[-\w]*|[^\w\s]/g) || []
    for (const part of parts) {
      const clean = part.replace(/[^a-zA-Z\-\']/g, '').toLowerCase()
      const isVocab = vocabList.includes(clean) || (allWords[clean] && vocabList.includes(clean))
      tokens.push({
        text: part,
        isVocab,
        wordKey: isVocab ? clean : null
      })
    }
    return tokens
  },

  onPlaySentence(e) {
    const globalIdx = parseInt(e.currentTarget.dataset.globalidx)
    this.setData({ playingIdx: globalIdx })
    wx.showToast({ title: '发音待完善', icon: 'none' })
    setTimeout(() => this.setData({ playingIdx: null }), 800)
  },

  onTapWord(e) {
    const wordKey = e.currentTarget.dataset.word
    const card = this.data.words[wordKey]
    if (card) {
      this.setData({ selectedWord: card, showWordCard: true })
    }
  },

  onCloseWordCard() {
    this.setData({ showWordCard: false })
  },

  onBack() {
    wx.navigateBack()
  }
})
