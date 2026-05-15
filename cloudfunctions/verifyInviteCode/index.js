/**
 * 验证邀请码并解锁教材
 * code: 邀请码
 * textbookId: 教材ID
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { code, textbookId } = event
  const { OPENID } = cloud.getWXContext()

  if (!code || !textbookId) {
    return { success: false, error: '参数不完整' }
  }

  try {
    // 1. 查邀请码
    const codeRes = await db.collection('invite_codes').where({
      code: code.toUpperCase().trim()
    }).get()

    if (codeRes.data.length === 0) {
      return { success: false, error: '邀请码不存在' }
    }

    const invite = codeRes.data[0]

    // 2. 过期检查
    const now = new Date()
    if (invite.expiresAt && new Date(invite.expiresAt) < now) {
      return { success: false, error: '邀请码已过期' }
    }

    // 3. 次数检查
    const usedBy = invite.usedBy || []
    if (usedBy.length >= invite.maxUses) {
      return { success: false, error: '邀请码使用次数已用完' }
    }

    // 4. 教材匹配
    if (invite.textbook !== textbookId) {
      return { success: false, error: '邀请码不适用于该教材' }
    }

    // 5. 查用户进度
    const userRes = await db.collection('user_progress').where({
      _openid: OPENID
    }).get()

    if (userRes.data.length > 0) {
      const record = userRes.data[0]
      let unlocked = record.unlocked || []
      if (unlocked.includes(textbookId)) {
        return { success: false, error: '该教材已解锁' }
      }
      unlocked.push(textbookId)
      await db.collection('user_progress').doc(record._id).update({
        data: { unlocked, lastStudyDate: db.serverDate() }
      })
    } else {
      await db.collection('user_progress').add({
        data: {
          _openid: OPENID,
          unlocked: [textbookId],
          mastered: [],
          favorites: [],
          reviewed: [],
          schedule: {},
          lastStudyDate: db.serverDate()
        }
      })
    }

    // 6. 标记邀请码已使用
    usedBy.push(OPENID)
    await db.collection('invite_codes').doc(invite._id).update({
      data: { usedBy }
    })

    return { success: true, textbookId }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
