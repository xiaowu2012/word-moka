#!/usr/bin/env python3
"""
单词魔卡音频生成器
用 macOS say 命令生成高音质音频，输出 128kbps mp3
"""
import json, os, subprocess, sys

WORDS_PATH = os.path.expanduser("~/.openclaw/workspace/projects/word-moka/data/words.json")
OUTPUT_DIR = os.path.expanduser("~/.openclaw/workspace/projects/word-moka/audio_new")


def load_words():
    with open(WORDS_PATH) as f:
        return json.load(f)


def generate_audio(word_key):
    words = load_words()
    if word_key and word_key not in words:
        print(f"⚠ 找不到单词: {word_key}")
        return False

    targets = {word_key: words[word_key]} if word_key else words

    for key, card in targets.items():
        word = card["word"]
        examples = card.get("examples", [])
        example_sent = examples[0]["sentence"] if examples else ""
        extra = card.get("extraExample", "")

        print(f"▶ {key} ({word})")

        # 1) 单词发音
        _say_encode(key, "word", word)

        # 2) 课本例句
        if example_sent:
            _say_encode(key, "example", example_sent)
        else:
            print(f"   ⚠ 无例句，跳过")

        # 3) 拓展例句
        if extra:
            _say_encode(key, "extra", extra)
        else:
            print(f"   ⚠ 无拓展例句，跳过")

        print(f"   ✅")

    return True


def _say_encode(key, suffix, text):
    """调用 macOS say => WAV => ffmpeg 转 128k mp3"""
    wav_path = f"/tmp/moka_{key}_{suffix}.wav"
    mp3_path = f"{OUTPUT_DIR}/{key}_{suffix}.mp3"

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # say → WAV
    subprocess.run(
        ["say", "-o", wav_path, "--data-format=LEI16@22050", text],
        check=True, capture_output=True
    )

    # ffmpeg → 128k mp3
    subprocess.run(
        ["ffmpeg", "-y", "-i", wav_path,
         "-b:a", "128k", "-ar", "22050", "-ac", "1",
         "-write_xing", "0",  # 避免播放器提前结束
         mp3_path],
        check=True, capture_output=True
    )

    # 清理 wav
    os.remove(wav_path)


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None
    print(f"🎧 生成音频 -> {OUTPUT_DIR}")
    success = generate_audio(target)
    print(f"\n{'🎉 全部完成!' if success else '❌ 失败'}")
