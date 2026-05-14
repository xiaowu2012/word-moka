/**
 * 更新用户学习进度
 * field: mastered | favorites | reviewed
 * key: 单词key
 * add: true=添加 false=移除
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { field, key, add } = event
  const { OPENID } = cloud.getWXContext()

  if (!field || !key) {
    return { success: false, error: '参数不完整' }
  }

  try {
    const res = await db.collection('user_progress').where({
      _openid: OPENID
    }).get()

    if (res.data.length > 0) {
      const record = res.data[0]
      const arr = record[field] || []

      let newArr
      if (add) {
        if (!arr.includes(key)) {
          newArr = [...arr, key]
        } else {
          newArr = arr
        }
      } else {
        newArr = arr.filter(k => k !== key)
      }

      await db.collection('user_progress').doc(record._id).update({
        data: {
          [field]: newArr,
          lastStudyDate: db.serverDate()
        }
      })
    } else {
      await db.collection('user_progress').add({
        data: {
          _openid: OPENID,
          [field]: [key],
          mastered: [],
          favorites: [],
          reviewed: [],
          lastStudyDate: db.serverDate()
        }
      })
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
