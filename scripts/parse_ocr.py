#!/usr/bin/env python3
"""解析 macOS Vision OCR 的输出 → words.json"""
import json, os, re

# 从 OCR 文本中提取每页内容
ocr_dir = os.path.expanduser("~/Downloads/g9_ocr_v2")
pages = {}

# 已经跑完 OCR，保存结果
ocr_results = {}
for i in range(140, 146):
    # 重新 OCR 一次并保存
    import subprocess
    r = subprocess.run(["/tmp/ocr_swift", f"{ocr_dir}/page_{i}.jpg"],
                       capture_output=True, text=True, timeout=120)
    ocr_results[i] = r.stdout

# 按页解析
all_words = []
current_unit = None

for page_idx in [140, 141, 142, 143, 144, 145]:
    text = ocr_results[page_idx]
    
    # 检测 Unit 标记
    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue
        
        # 检测 Unit 标题行
        um = re.match(r'Unit\s+(\d+)', line)
        if um:
            current_unit = int(um.group(1))
            continue
        
        # 跳过无关行
        if line in ['Words and expressions', ''] or re.match(r'^\d+$', line):
            continue
        if len(line) < 4:
            continue
        
        # 匹配: word /phonetic/ pos. 中文  或  word /phonetic/ 中文
        m = re.match(r'^([a-zA-Z][a-zA-Z\-\' ]+?)\s*(/[^/]+/)\s*(.*)', line)
        if not m:
            continue
        
        word = m.group(1).strip().split()[0]
        if len(word) <= 1:
            continue
        
        phonetic = m.group(2).strip()
        rest = m.group(3).strip()
        
        # 清理: 去掉词性前缀和末尾页码
        meaning = re.sub(r'^[a-z]+\.\s*', '', rest)
        meaning = re.sub(r'\s+\d+\s*$', '', meaning).strip()
        
        if not meaning:
            continue
        
        all_words.append({
            "word": word.capitalize(),
            "phonetic": phonetic,
            "cnMeaning": meaning[:40],
            "module": f"Unit{current_unit}" if current_unit else "Unknown"
        })

# 去重
seen = set()
unique = []
for w in all_words:
    key = (w["word"].lower(), w["module"])
    if key not in seen:
        seen.add(key)
        unique.append(w)

print(f"解析结果: {len(all_words)} → 去重后 {len(unique)} 词")
for u in range(1, 7):
    ws = [w for w in unique if w["module"] == f"Unit{u}"]
    print(f"  Unit {u}: {len(ws)} 词")

# 打印前20个看看
print("\n前20个词:")
for w in unique[:20]:
    print(f"  {w['word']:20s} {w['phonetic']:20s} {w['cnMeaning']}")

# 保存
out_dir = os.path.expanduser("~/.openclaw/workspace/projects/word-moka/data")
word_dict = {w['word'].lower(): w for w in unique}
with open(f"{out_dir}/words.json", 'w') as f:
    json.dump(word_dict, f, ensure_ascii=False, indent=2)
with open(f"{out_dir}/words.js", 'w') as f:
    f.write("const words = ")
    json.dump(word_dict, f, ensure_ascii=False, indent=2)
    f.write(";\nmodule.exports = words;\n")

print(f"\n✅ 已保存 {len(unique)} 词到 data/words.json")
