#!/bin/bash
# 用 macOS say 命令生成单词魔卡音频（128kbps mp3）
# 用法: bash generate-audio.sh [单词key]
# 不传参数则生成全部10词

WORD_MOKA_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$WORD_MOKA_DIR/audio_new"

generate_word_audio() {
  local key="$1"
  local word="$2"
  local example="$3"
  local extra="$4"

  echo "▶ $key ($word)"

  # 1) 单词发音
  local tmp_wav="/tmp/moka_${key}_word.wav"
  local out_mp3="${OUTPUT_DIR}/${key}_word.mp3"
  say -o "$tmp_wav" --data-format=LEI16@22050 "$word"
  ffmpeg -y -i "$tmp_wav" -b:a 128k -ar 22050 -ac 1 "$out_mp3" 2>/dev/null

  # 2) 课本例句
  if [ -n "$example" ]; then
    local tmp_wav2="/tmp/moka_${key}_example.wav"
    local out_mp32="${OUTPUT_DIR}/${key}_example.mp3"
    say -o "$tmp_wav2" --data-format=LEI16@22050 "$example"
    ffmpeg -y -i "$tmp_wav2" -b:a 128k -ar 22050 -ac 1 "$out_mp32" 2>/dev/null
  fi

  # 3) 拓展例句
  if [ -n "$extra" ]; then
    local tmp_wav3="/tmp/moka_${key}_extra.wav"
    local out_mp33="${OUTPUT_DIR}/${key}_extra.mp3"
    say -o "$tmp_wav3" --data-format=LEI16@22050 "$extra"
    ffmpeg -y -i "$tmp_wav3" -b:a 128k -ar 22050 -ac 1 "$out_mp33" 2>/dev/null
  fi

  echo "  ✅ 完成"
}

mkdir -p "$OUTPUT_DIR"

if [ -n "$1" ]; then
  # 指定单词
  node -e "
    const words = require('$WORD_MOKA_DIR/data/words.js');
    const card = words['$1'];
    if (!card) { console.log('NOT_FOUND: $1'); process.exit(1); }
    console.log(card.word);
    console.log((card.examples && card.examples[0]) ? card.examples[0].sentence : '');
    console.log(card.extraExample || '');
  " | while IFS= read -r line; do
    lines+=("$line")
  done
  # Actually let me use a simpler approach
  eval $(node -e "
    const words = require('$WORD_MOKA_DIR/data/words.js');
    const card = words['$1'];
    if (!card) { process.exit(1); }
    const ex = (card.examples && card.examples[0]) ? card.examples[0].sentence : '';
    console.log('WORD=' + JSON.stringify(card.word));
    console.log('EXAMPLE=' + JSON.stringify(ex));
    console.log('EXTRA=' + JSON.stringify(card.extraExample || ''));
  ")
  generate_word_audio "$1" "$WORD" "$EXAMPLE" "$EXTRA"
else
  # 生成全部
  node -e "
    const words = require('$WORD_MOKA_DIR/data/words.js');
    for (const [key, card] of Object.entries(words)) {
      const ex = (card.examples && card.examples[0]) ? card.examples[0].sentence : '';
      console.log(key + '|' + card.word + '|' + ex + '|' + (card.extraExample || ''));
    }
  " | while IFS='|' read -r key word example extra; do
    generate_word_audio "$key" "$word" "$example" "$extra"
  done
fi

echo ""
echo "🎉 全部生成完毕！在 $OUTPUT_DIR"
