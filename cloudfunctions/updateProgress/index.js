/**
 * 更新用户学习进度
 * field: mastered | favorites | reviewed | schedule
 * key: 单词key
 * add: true=添加 false=移除
 * value: 附加数据（如 schedule 的 {stage, dueDate}）
 *
 * 示例:
 *   标记已掌握:     { field: 'mastered', key: 'smell', add: true }
 *   取消收藏:       { field: 'favorites', key: 'smell', add: false }
 *   添加复习计划:   { field: 'schedule', key: 'smell', add: true, value: { stage: 0, dueDate: '2026-05-15' } }
 *   更新复习计划:   { field: 'schedule', key: 'smell', add: true, value: { stage: 1, dueDate: '2026-05-16' } }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { field, key, add, value } = event
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

      if (field === 'schedule') {
        // schedule 是对象 { wordKey: { stage, dueDate } }
        let schedule = record.schedule || {}
        if (add) {
          schedule[key] = value || { stage: 0, dueDate: new Date().toISOString().slice(0, 10) }
        } else {
          delete schedule[key]
        }
        await db.collection('user_progress').doc(record._id).update({
          data: {
            schedule,
            lastStudyDate: db.serverDate()
          }
        })
      } else {
        // mastered / favorites / reviewed 是数组
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
      }
    } else {
      // 首次创建
      const data = {
        _openid: OPENID,
        mastered: [],
        favorites: [],
        reviewed: [],
        schedule: {},
        lastStudyDate: db.serverDate()
      }

      if (field === 'schedule') {
        data.schedule[key] = value || { stage: 0, dueDate: new Date().toISOString().slice(0, 10) }
      } else {
        data[field] = [key]
      }

      await db.collection('user_progress').add({ data })
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
