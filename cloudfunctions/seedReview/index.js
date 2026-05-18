/**
 * 种子数据 - 添加测试复习单词
 * 部署后在开发者工具中调用：云开发 → 云函数 → seedReview → 测试
 * 测试参数：{ "openid": "ogzZm3YV8adEJgUhV4zIswvMk1qQ" }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  // 优先用传入的 openid，否则用调用者的 openid
  const OPENID = event.openid || cloud.getWXContext().OPENID
  const today = new Date().toISOString().slice(0, 10)

  // 10个测试词：5个stage 0 + 5个stage 1
  const testWords = [
    'lady', 'gentleman', 'performer', 'finger', 'teenager',
    'unless', 'performance', 'blood', 'perform', 'viewer'
  ]

  const schedule = {}
  testWords.forEach((w, i) => {
    schedule[w] = { stage: i < 5 ? 0 : 1, dueDate: today }
  })

  try {
    const res = await db.collection('user_progress').where({ _openid: OPENID }).get()

    if (res.data.length > 0) {
      const record = res.data[0]
      const existing = record.schedule || {}
      Object.assign(existing, schedule)
      await db.collection('user_progress').doc(record._id).update({
        data: { schedule: existing, lastStudyDate: db.serverDate() }
      })
    } else {
      await db.collection('user_progress').add({
        data: {
          _openid: OPENID,
          mastered: [],
          favorites: [],
          reviewed: [],
          schedule,
          lastStudyDate: db.serverDate()
        }
      })
    }

    return { success: true, openid: OPENID, words: testWords, today }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
