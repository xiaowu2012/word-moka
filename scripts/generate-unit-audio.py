"""
生成 Unit 1 完整音频 + 句子时间戳
使用 ElevenLabs with-timestamps API
"""

import json
import base64
import os
import re

# ⚠️ 需要先设置环境变量 ELEVENLABS_API_KEY
API_KEY = os.environ.get("ELEVENLABS_API_KEY")
if not API_KEY:
    API_KEY = "sk_f7e402d2c7e096893456a411a7f21874ef8cc09f4567c02e"

VOICE_ID = "pNInz6obpgDQGcFmaJgB"  # Adam (free tier可用)
MODEL_ID = "eleven_multilingual_v2"

# Unit 1 数据
UNIT = "Unit1"
TITLE = "Art in safe hands"

# 所有英文句子（按显示顺序）
SENTENCES = [
    "I was born into a family of Minnan puppet performers.",
    "My grandpa and my mum are both among the best.",
    "They tell stories with their hands.",
    "I loved the stories my grandpa and my mum told with their hands.",
    "However, things changed when I became a teenager.",
    "I felt less close to the art because people thought puppets were too old-fashioned.",
    "I didn't want to be part of puppetry unless I was asked to.",
    "One day my mum showed me a performance by my grandpa's teacher.",
    "The finely made puppets and their exciting movements brought back childhood memories.",
    "Then and there, my love for puppetry started to grow again.",
    "I posted my doubts about the future of puppetry online.",
    "To my surprise, the post was flooded with comments expressing warm feelings.",
    "Many people showed their love for the art of puppetry and encouraged me to hold on.",
    "A truth hit me - it was my duty to keep the art alive because puppetry was in my blood.",
    "The art will be popular again if young people are interested in it.",
    "So I held a puppet show at school.",
    "When I finished performing, I looked up and saw a surprising picture: the students were on the edge of their seats.",
    "Their eyes were glued to the puppets.",
    "After a warm cheer, they came to ask where they could see a full performance.",
    "The positive reply from the young viewers gave me more courage.",
    "Since then, my puppet shows have drawn more attention both from home and abroad.",
    "The old art is getting more interest and new stories.",
    "With more and more people joining in, I believe the special magic of this traditional art will last forever!",
]

# 中文翻译（对应每句）
SENTENCES_CN = [
    "我出生在闽南的一个木偶戏表演世家。",
    "我的外公和我的母亲都是这行中的佼佼者。",
    "他们用手讲述故事。",
    "我喜欢外公和妈妈用手讲述的故事。",
    "然而，当我成为一名青少年时，情况发生了变化。",
    "我觉得与这门艺术不那么亲近了，因为人们认为木偶太老式了。",
    "除非有人要求，否则我不想参与木偶表演。",
    "一天，妈妈给我看了外公老师的一场表演。",
    "精致的木偶和它们激动人心的动作带回了童年的记忆。",
    "就在那时，我对木偶表演的热爱重新燃起。",
    "我在网上发布了关于木偶表演未来的困惑。",
    "令我惊讶的是，帖子被表达温暖情感的评论淹没了。",
    "许多人表达了对木偶表演艺术的热爱，并鼓励我坚持。",
    "一个真相击中了我——让这门艺术保持活力是我的责任，因为木偶表演在我的血液里。",
    "如果年轻人对它感兴趣，这门艺术就会再次流行起来。",
    "于是我在学校举办了一场木偶表演。",
    "当我表演完，抬头看到一幅令人惊讶的画面：学生们都聚精会神地看着。",
    "他们的眼睛紧盯着木偶。",
    "在热烈的欢呼之后，他们来询问在哪里能看到完整的表演。",
    "年轻观众们的积极回应给了我更多勇气。",
    "从此，我的木偶表演在国内外都引起了更多的关注。",
    "这门古老的艺术正在获得更多的兴趣和新故事。",
    "随着越来越多的人加入，我相信这门传统艺术的特殊魔力将永远持续下去！",
]


def build_char_to_sentence_index(full_text):
    """建立字符偏移 → 句子索引的映射"""
    offset = 0
    char_to_sentence = {}
    for idx, sentence in enumerate(SENTENCES):
        # 在完整文本中找到这句
        start = full_text.find(sentence, offset)
        if start == -1:
            print(f"  ⚠️ 没找到第 {idx+1} 句: {sentence[:30]}...")
            continue
        end = start + len(sentence)
        for c in range(start, end):
            char_to_sentence[c] = idx
        offset = end
    return char_to_sentence


def call_elevenlabs_with_timestamps(full_text):
    """调用 ElevenLabs API 获取音频和时间戳"""
    import requests

    print(f"🔄 正在调用 ElevenLabs ({MODEL_ID}, 声音: {VOICE_ID})...")
    print(f"   文本长度: {len(full_text)} 字符")

    resp = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps",
        json={
            "text": full_text,
            "model_id": MODEL_ID,
        },
        headers={"Content-Type": "application/json", "xi-api-key": API_KEY},
        timeout=120,
    )

    if resp.status_code != 200:
        print(f"❌ API 调用失败: {resp.status_code}")
        print(resp.text[:500])
        return None

    data = resp.json()
    return data


def timestamps_to_sentences(full_text, alignment):
    """将字符级时间戳转换为句子级时间戳"""
    chars = alignment["characters"]
    starts = alignment["character_start_times_seconds"]
    ends = alignment["character_end_times_seconds"]

    char_to_sentence = build_char_to_sentence_index(full_text)

    # 聚合句子时间戳
    sentence_times = {}
    for i, c in enumerate(chars):
        sent_idx = char_to_sentence.get(i)
        if sent_idx is None:
            continue
        if sent_idx not in sentence_times:
            sentence_times[sent_idx] = {"start": starts[i], "end": ends[i]}
        else:
            sentence_times[sent_idx]["start"] = min(
                sentence_times[sent_idx]["start"], starts[i]
            )
            sentence_times[sent_idx]["end"] = max(
                sentence_times[sent_idx]["end"], ends[i]
            )

    # 排序输出
    result = []
    for idx in sorted(sentence_times.keys()):
        t = sentence_times[idx]
        result.append(
            {
                "index": idx,
                "en": SENTENCES[idx],
                "cn": SENTENCES_CN[idx],
                "start": round(t["start"], 3),
                "end": round(t["end"], 3),
            }
        )

    return result


def main():
    PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    AUDIO_DIR = os.path.join(PROJECT_DIR, "audio")

    full_text = " ".join(SENTENCES)
    print(f"📝 全文: {len(full_text)} 字符, {len(SENTENCES)} 句")
    print()

    # 1. 调用 API
    data = call_elevenlabs_with_timestamps(full_text)
    if not data:
        return

    audio_b64 = data["audio_base64"]
    alignment = data["alignment"]
    print(f"   ✅ 音频: {len(audio_b64)} chars base64")
    print(f"   ✅ 时间戳: {len(alignment['characters'])} 个字符")

    # 2. 转句子时间戳
    sentences = timestamps_to_sentences(full_text, alignment)
    print(f"\n📊 句子时间戳:")
    for s in sentences:
        dur = round(s["end"] - s["start"], 2)
        print(f"  #{s['index']+1:2d}  [{s['start']:.1f}s-{s['end']:.1f}s] ({dur:.1f}s)  {s['en'][:50]}...")

    # 3. 保存音频
    os.makedirs(AUDIO_DIR, exist_ok=True)
    audio_path = os.path.join(AUDIO_DIR, f"{UNIT}_full.mp3")
    audio_bytes = base64.b64decode(audio_b64)
    with open(audio_path, "wb") as f:
        f.write(audio_bytes)
    print(f"\n💾 音频已保存: {audio_path} ({len(audio_bytes)/1024:.0f}KB)")

    # 4. 保存时间戳 JSON
    timestamps_data = {
        "unit": UNIT,
        "title": TITLE,
        "totalSentences": len(sentences),
        "audioDuration": round(sentences[-1]["end"], 2) if sentences else 0,
        "sentences": sentences,
    }
    json_path = os.path.join(AUDIO_DIR, f"{UNIT}_timestamps.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(timestamps_data, f, ensure_ascii=False, indent=2)
    print(f"💾 时间戳已保存: {json_path}")

    # 5. 也生成一份微信小程序可用的 JS 模块
    js_path = os.path.join(AUDIO_DIR, f"{UNIT}_timestamps.js")
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(
            f"// Unit {UNIT} - {TITLE} 句子时间戳\n"
            f"// 由 ElevenLabs 自动生成, 共 {len(sentences)} 句\n\n"
            f"const unitTimestamps = {json.dumps(timestamps_data, ensure_ascii=False, indent=2)};\n\n"
            f"module.exports = {{ unitTimestamps }};\n"
        )
    print(f"💾 JS模块已保存: {js_path}")

    print("\n✅ 完成!")


if __name__ == "__main__":
    main()
