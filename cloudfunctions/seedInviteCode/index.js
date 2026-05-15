/**
 * 创建测试邀请码（仅供开发测试）
 * code: 邀请码（不传则自动生成）
 * textbook: 教材ID
 * maxUses: 最大使用次数
 * expiresInDays: 过期天数
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomCode() {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

exports.main = async (event) => {
  const code = event.code || randomCode()
  const textbook = event.textbook || 'renjiao8b'
  const maxUses = event.maxUses || 100
  const expiresInDays = event.expiresInDays || 365

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  await db.collection('invite_codes').add({
    data: {
      code,
      textbook,
      maxUses,
      usedBy: [],
      expiresAt: expiresAt.toISOString(),
      createdAt: db.serverDate()
    }
  })

  return { success: true, code, textbook, maxUses, expiresAt: expiresAt.toISOString().slice(0, 10) }
}
