#!/usr/bin/env node
/**
 * 生成邀请码
 * 用法: node gen-code.js [数量] [教材ID] [最大使用次数] [过期天数]
 * 示例: node gen-code.js 10 waiyan8b 100 90
 */
const crypto = require('crypto')

const AMOUNT = parseInt(process.argv[2]) || 5
const TEXTBOOK = process.argv[3] || 'waiyan8b'
const MAX_USES = parseInt(process.argv[4]) || 100
const EXPIRE_DAYS = parseInt(process.argv[5]) || 90

// 邀请码格式: 6位大写字母+数字，易读（去掉了容易混淆的0/O/1/I）
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function genCode() {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CHARS[crypto.randomInt(CHARS.length)]
  }
  // 加一个校验位（简单可读）
  return code
}

const expiresAt = new Date()
expiresAt.setDate(expiresAt.getDate() + EXPIRE_DAYS)

const codes = new Set()
while (codes.size < AMOUNT) {
  codes.add(genCode())
}

console.log(`\n📚 教材: ${TEXTBOOK}`)
console.log(`⏰ 过期: ${expiresAt.toISOString().slice(0, 10)}`)
console.log(`👥 次数: ${MAX_USES} 次/码`)
console.log(`---`)

for (const code of codes) {
  console.log(`${code}`)
}
