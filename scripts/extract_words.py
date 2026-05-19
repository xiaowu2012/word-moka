#!/usr/bin/env python3
"""
从 OCR 文本提取所有单词 → 按 Unit 分组 → 输出 words.json
"""
import json, os, re

HD = os.path.expanduser("~/Downloads/g9_ocr")

# 页码 → Unit 映射（书上的页码，不是PDF页码）
# 用户说的: 138=Unit1, 139=混合, 140=Unit3+4, 141=Unit4+5, 142=Unit5+6, 143=Unit6
# PDF页码 = 书上页码 + 3
# 所以 OCR索引 = PDF页码 - 1 = 书上页码 + 2
page_unit_map = {
    138: 1,    # 全部 Unit1
    139: None, # 混合（bud/vast/grand=1, 其余2）
    140: None, # 混合（大部分3, Fearless/bravely=4）
    141: None, # 混合（前部分4, 从drop起5）
    142: None, # 混合（前部分5, 从cheap起6）
    143: 6,    # 全部 Unit6
}

# 混合页的特殊处理
special_words = {
    # page 139: bud/vast/grand = Unit1, 其余 = Unit2
    139: {
        "unit1": ["bud", "vast", "grand"],
        "unit2_after": True  # 遇到 bud/vast/grand 后接 Unit2
    },
    # page 140: Fearless/bravely = Unit4, 其余 = Unit3
    140: {
        "unit3_default": True,
        "unit4_words": ["fearless", "bravely"]
    },
    # page 141: 从 drop 起 Unit5, 前面 Unit4
    141: {
        "unit4_before": True,
        "unit5_start": ["drop", "drown", "drought", "disease", "disaster", "damage"]
    },
    # page 142: 从 cheap 起 Unit6, 前面 Unit5
    142: {
        "unit5_before": True,
        "unit6_start": ["cheap"]
    }
}

words = []

for book_page in range(138, 144):  # 书上页码 138-143
    pdf_idx = book_page + 2  # OCR索引 = 书上页码 + 2
    file_path = f"{HD}/wordlist_hd_{pdf_idx}.txt"
    
    if not os.path.exists(file_path):
        # 试试 verify 文件
        file_path = f"{HD}/verify_{pdf_idx}.txt"
    
    if not os.path.exists(file_path):
        print(f"跳过书上第{book_page}页 (文件不存在)")
        continue
    
    with open(file_path) as f:
        text = f.read()
    
    lines = text.split('\n')
    current_unit = page_unit_map.get(book_page)
    
    for line in lines:
        line = line.strip()
        if not line or '/' not in line:
            continue
        
        # 解析: word /phonetic/ ... 中文释义
        # 格式: word /phonetic/ pos. 中文  或  word /phonetic/ 中文
        m = re.match(r'^([a-zA-Z\-\' ]+?)\s*(/[^/]+/)\s*(.*)', line)
        if not m:
            continue
        
        word = m.group(1).strip().split()[0].lower()
        phonetic = m.group(2).strip()
        rest = m.group(3).strip()
        
        # 去掉词性前缀 (n./v./adj./adv./prep./conj./pron./num./art./int.)
        meaning = re.sub(r'^[a-z]+\.\s*', '', rest)
        # 去掉末尾的数字（教材页码）
        meaning = re.sub(r'\s+\d+\s*$', '', meaning)
        
        # 确定 Unit
        unit = current_unit
        if book_page == 139:
            if word in ["bud", "vast", "grand"]:
                unit = 1
            else:
                unit = 2
        elif book_page == 140:
            if word in ["fearless", "bravely"]:
                unit = 4
            else:
                unit = 3
        elif book_page == 141:
            # 从 drop 起 Unit5
            drop_words = ["drop", "drown", "drought", "disease", "disaster", "damage"]
            if word in drop_words:
                unit = 5
            else:
                unit = 4
        elif book_page == 142:
            # 从 cheap 起 Unit6
            if word == "cheap" or (unit_already_6 and True):
                unit = 6
            else:
                unit = 5
        
        if unit is None:
            continue
        
        words.append({
            "word": word.capitalize() if len(word) > 1 else word,
            "phonetic": phonetic,
            "cnMeaning": meaning.strip(),
            "unit": unit
        })

print(f"共提取 {len(words)} 个单词")
for u in range(1, 7):
    ws = [w["word"] for w in words if w["unit"] == u]
    print(f"  Unit {u}: {len(ws)} 词 - {', '.join(ws[:5])}...")
