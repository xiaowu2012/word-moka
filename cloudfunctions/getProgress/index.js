/**
 * 获取用户学习进度
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  try {
    const res = await db.collection('user_progress').where({
      _openid: OPENID
    }).get()

    if (res.data.length > 0) {
      const progress = res.data[0]
      return {
        mastered: progress.mastered || [],
        favorites: progress.favorites || [],
        reviewed: progress.reviewed || [],
        lastStudyDate: progress.lastStudyDate || ''
      }
    }

    return {
      mastered: [],
      favorites: [],
      reviewed: [],
      lastStudyDate: ''
    }
  } catch (err) {
    return {
      mastered: [],
      favorites: [],
      reviewed: [],
      lastStudyDate: '',
      error: err.message
    }
  }
}
