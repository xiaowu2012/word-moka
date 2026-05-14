const app = getApp()
const STAR_MAP = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' }

Page({
  data: {
    reviewList: [],
    currentIndex: 0,
    showAnswer: false,
    progress: 0,
    currentWord: {},
    currentStars: ''
  },

  onLoad() {
    this.prepareReview()
  },

  prepareReview() {
    const words = app.globalData.words
    const list = Object.entries(words).map(([key, card]) => ({
      key,
      word: card.word,
      phonetic: card.phonetic,
      cnMeaning: card.cnMeaning,
      examFrequency: card.examFrequency
    }))

    // Shuffle for review
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]]
    }

    if (list.length > 0) {
      this.setData({
        reviewList: list,
        currentIndex: 0,
        showAnswer: false,
        progress: 0,
        currentWord: list[0],
        currentStars: STAR_MAP[list[0].examFrequency] || '★★★☆☆'
      })
    }
  },

  onFlipCard() {
    if (!this.data.showAnswer) {
      this.setData({ showAnswer: true })
    }
  },

  onHard() {
    this.nextCard()
  },

  onGood() {
    const key = this.data.currentWord.key
    wx.cloud.callFunction({
      name: 'updateProgress',
      data: { field: 'reviewed', key, add: true }
    }).catch(() => {})
    this.nextCard()
  },

  onEasy() {
    const key = this.data.currentWord.key
    wx.cloud.callFunction({
      name: 'updateProgress',
      data: { field: 'mastered', key, add: true }
    }).catch(() => {})
    this.nextCard()
  },

  nextCard() {
    const nextIndex = this.data.currentIndex + 1
    if (nextIndex < this.data.reviewList.length) {
      const nextWord = this.data.reviewList[nextIndex]
      this.setData({
        currentIndex: nextIndex,
        showAnswer: false,
        progress: Math.round((nextIndex / this.data.reviewList.length) * 100),
        currentWord: nextWord,
        currentStars: STAR_MAP[nextWord.examFrequency] || '★★★☆☆'
      })
    } else {
      this.setData({
        currentIndex: this.data.reviewList.length,
        progress: 100
      })
    }
  },

  onGoHome() {
    wx.navigateBack()
  }
})
