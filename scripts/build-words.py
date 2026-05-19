#!/usr/bin/env python3
"""将 textbook-sentences.json 转换为小程序 data/words.json 和 words.js"""
import json, os

SRC = os.path.expanduser("~/.openclaw/workspace/skills/english-word-channel/references/textbook-sentences.json")
DST_JSON = os.path.expanduser("~/.openclaw/workspace/projects/word-moka/data/words.json")
DST_JS = os.path.expanduser("~/.openclaw/workspace/projects/word-moka/data/words.js")

# 中考频次映射
FREQ_LABEL = {5: "极高频", 4: "高频", 3: "中等", 2: "低频", 1: "极少"}

with open(SRC) as f:
    src = json.load(f)

result = {}
for key, card in src.items():
    result[key] = {
        "word": card["word"],
        "phonetic": card["phonetic"],
        "cnMeaning": card["cnMeaning"],
        "enMeaning": card.get("enMeaning", ""),
        "examples": card.get("examples", []),
        "exampleCn": card.get("exampleCn", ""),
        "extraExample": card.get("extraExample", ""),
        "extraCn": card.get("extraCn", ""),
        "examFrequency": card.get("examFrequency", 3),
        "tip": card.get("tip", ""),
        "module": card["module"],
        "origin": card.get("origin", "外研版八年级下册")
    }

# 写入 JSON
with open(DST_JSON, 'w') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

# 写入 JS (module.exports)
with open(DST_JS, 'w') as f:
    f.write("const words = ")
    json.dump(result, f, ensure_ascii=False, indent=2)
    f.write(";\nmodule.exports = words;\n")

print(f"✅ words.json: {len(result)} 词")
print(f"✅ words.js: {len(result)} 词")
modules = {}
for k, v in result.items():
    m = v["module"]
    modules.setdefault(m, []).append(v["word"])
for m in sorted(modules):
    print(f"   {m}: {len(modules[m])} 词")
