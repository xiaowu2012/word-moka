"""
生成课文完整音频 + 句子时间戳
使用 ElevenLabs with-timestamps API

数据源: data/texts.json (单一事实来源)
"""

import json
import base64
import os
import requests

# ⚠️ 如需更换 API Key，设置 ELEVENLABS_API_KEY 环境变量
API_KEY = os.environ.get("ELEVENLABS_API_KEY") or "sk_f7e402d2c7e096893456a411a7f21874ef8cc09f4567c02e"
VOICE_ID = "pNInz6obpgDQGcFmaJgB"  # Adam
MODEL_ID = "eleven_multilingual_v2"

# === 从 texts.json 读取课文数据 ===
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEXTS_FILE = os.path.join(PROJECT_DIR, "data", "texts.json")

with open(TEXTS_FILE, "r", encoding="utf-8") as f:
    ALL_TEXTS = json.load(f)


def _load_unit(unit_id):
    """从 texts.json 加载一个单元的数据"""
    unit = ALL_TEXTS.get(unit_id)
    if not unit:
        raise ValueError(f"Unit {unit_id} not found in texts.json")

    sentences = []
    sentences_cn = []
    paragraph_indices = []
    gidx = 0

    for para in unit["paragraphs"]:
        indices = []
        for s in para["sentences"]:
            sentences.append(s["en"])
            sentences_cn.append(s["cn"])
            indices.append(gidx)
            gidx += 1
        paragraph_indices.append(indices)

    return {
        "title": unit["title"],
        "sentences": sentences,
        "sentences_cn": sentences_cn,
        "paragraphs": paragraph_indices,
        "vocab": [[v for v in s.get("vocab", [])] for para in unit["paragraphs"] for s in para["sentences"]],
    }


def generate(unit_id="Unit1"):
    """为指定单元生成音频和时间戳"""
    print(f"📖 加载 {unit_id}...")
    unit = _load_unit(unit_id)
    title = unit["title"]
    sentences = unit["sentences"]
    sentences_cn = unit["sentences_cn"]
    paragraphs = unit["paragraphs"]

    full_text = " ".join(sentences)
    print(f"  标题: {title}")
    print(f"  段落: {len(paragraphs)}, 句子: {len(sentences)}, 字符: {len(full_text)}")

    # === 调用 ElevenLabs ===
    print(f"\n🔄 调用 ElevenLabs ({MODEL_ID}, {VOICE_ID})...")
    resp = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps",
        json={"text": full_text, "model_id": MODEL_ID},
        headers={"Content-Type": "application/json", "xi-api-key": API_KEY},
        timeout=120,
    )

    if resp.status_code != 200:
        print(f"❌ API 调用失败: {resp.status_code}")
        print(resp.text[:500])
        return

    data = resp.json()
    alignment = data["alignment"]
    print(f"  ✅ 音频: {len(data['audio_base64']) // 1024}KB base64")
    print(f"  ✅ 时间戳: {len(alignment['characters'])} 个字符")

    # === 字符时间戳 → 句子时间戳 ===
    # 建立字符偏移到句子索引的映射
    char_to_sentence = {}
    offset = 0
    for idx, sentence in enumerate(sentences):
        start = full_text.find(sentence, offset)
        if start == -1:
            print(f"  ⚠️ 未找到第 {idx+1} 句: {sentence[:30]}...")
            continue
        end = start + len(sentence)
        for c in range(start, end):
            char_to_sentence[c] = idx
        offset = end

    chars = alignment["characters"]
    starts = alignment["character_start_times_seconds"]
    ends = alignment["character_end_times_seconds"]

    # 聚合句子时间
    sentence_times = {}
    for i in range(len(chars)):
        sent_idx = char_to_sentence.get(i)
        if sent_idx is None:
            continue
        if sent_idx not in sentence_times:
            sentence_times[sent_idx] = {"start": starts[i], "end": ends[i]}
        else:
            t = sentence_times[sent_idx]
            t["start"] = min(t["start"], starts[i])
            t["end"] = max(t["end"], ends[i])

    # 排序输出
    result_sentences = []
    for idx in sorted(sentence_times.keys()):
        t = sentence_times[idx]
        result_sentences.append({
            "index": idx,
            "en": sentences[idx],
            "cn": sentences_cn[idx],
            "start": round(t["start"], 3),
            "end": round(t["end"], 3),
        })

    # 段落结构
    result_paragraphs = []
    for indices in paragraphs:
        if not indices:
            continue
        first = result_sentences[indices[0]]
        last = result_sentences[indices[-1]]
        result_paragraphs.append({
            "sentenceIndices": indices,
            "start": first["start"],
            "end": last["end"],
        })

    # === 打印概览 ===
    print(f"\n📊 句子时间戳 ({len(result_sentences)} 句):")
    for s in result_sentences:
        dur = round(s["end"] - s["start"], 2)
        en = s["en"][:50]
        print(f"  #{s['index']+1:2d}  [{s['start']:.1f}s-{s['end']:.1f}s] ({dur:.1f}s)  {en}...")

    # === 保存文件 ===
    AUDIO_DIR = os.path.join(PROJECT_DIR, "audio")
    os.makedirs(AUDIO_DIR, exist_ok=True)

    # 音频
    audio_path = os.path.join(AUDIO_DIR, f"{unit_id}_full.mp3")
    audio_bytes = base64.b64decode(data["audio_base64"])
    with open(audio_path, "wb") as f:
        f.write(audio_bytes)
    print(f"\n💾 音频: {audio_path}  ({len(audio_bytes) // 1024}KB)")

    # 时间戳 JSON
    ts_data = {
        "unit": unit_id,
        "title": title,
        "totalSentences": len(result_sentences),
        "audioDuration": round(result_sentences[-1]["end"], 2) if result_sentences else 0,
        "sentences": result_sentences,
        "paragraphs": result_paragraphs,
    }
    json_path = os.path.join(AUDIO_DIR, f"{unit_id}_timestamps.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(ts_data, f, ensure_ascii=False, indent=2)
    print(f"💾 时间戳: {json_path}")

    # JS 模块（给 text.js 内联用）
    js_path = os.path.join(AUDIO_DIR, f"{unit_id}_timestamps.js")
    with open(js_path, "w", encoding="utf-8") as f:
        js_content = (
            f"// Unit {unit_id} - {title} 句子时间戳\n"
            f"// 由 {os.path.basename(__file__)} 从 data/texts.json 自动生成\n"
            f"// {len(result_sentences)} 句\n\n"
            f"const unitTimestamps = {json.dumps(ts_data, ensure_ascii=False, indent=2)};\n\n"
            f"module.exports = {{ unitTimestamps }};\n"
        )
        f.write(js_content)
    print(f"💾 JS模块: {js_path}")

    print(f"\n✅ {unit_id} 完成!")


if __name__ == "__main__":
    import sys
    unit = sys.argv[1] if len(sys.argv) > 1 else "Unit1"
    generate(unit)
