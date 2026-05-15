/**
 * 获取用户学习进度（含艾宾浩斯计划）
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
        schedule: progress.schedule || {},
        unlocked: progress.unlocked || [],
        lastStudyDate: progress.lastStudyDate || ''
      }
    }

    return {
      mastered: [],
      favorites: [],
      reviewed: [],
      schedule: {},
      unlocked: [],
      lastStudyDate: ''
    }
  } catch (err) {
    return {
      mastered: [],
      favorites: [],
      reviewed: [],
      schedule: {},
      unlocked: [],
      lastStudyDate: '',
      error: err.message
    }
  }
}
