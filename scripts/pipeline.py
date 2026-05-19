#!/usr/bin/env python3
"""
课本数据提取流水线 —— 从扫描版PDF提取单词 + 课文

用法:
  python3 pipeline.py /path/to/textbook.pdf
  
流程:
  1. 提取单词表页 → macOS Vision OCR → 解析 → words.json
  2. 提取课文页 → macOS Vision OCR → 解析 → texts.json
  3. 输出到小程序 data/ 目录

依赖:
  - macOS (Vision framework OCR via Swift)
  - Python3 + PyMuPDF + Pillow
  - 编译好的 /tmp/ocr_swift 工具
"""

import json, os, sys, re, subprocess, shutil
from PIL import Image, ImageEnhance

# ============================================================
# 配置区 —— 每本课本需要改这里
# ============================================================
CONFIG = {
    # 课本名称 (用于 words.json 中的 origin 字段)
    "name": "外研版九年级上册",
    
    # 单词表页码范围 (书上的页码，不是 PDF 页码)
    # 每个条目: (起始页码, 结束页码, 默认Unit)
    # 混合页用 None，在 special 中处理
    "wordlist_pages": (138, 143),
    
    # PDF页码偏移量 (书上页码 + offset = PDF页码索引, 0-based)
    # 因为课本正文通常从第4页开始，所以 offset = 4 - 1 = 3
    "page_offset": 3,
    
    # 混合页的特殊规则
    # key = 书上页码, value = 规则对象
    "special_rules": {
        139: {"unit1_words": ["bud", "vast", "grand"]},   # 前3词Unit1, 其余Unit2
        140: {"unit4_words": ["fearless", "bravely"]},     # 这两个词Unit4, 其余Unit3
        141: {"unit5_start": ["drop"]},                    # 从drop起Unit5, 前面Unit4
        142: {"unit6_start": ["cheap"]},                   # 从cheap起Unit6, 前面Unit5
    },
    
    # OCR 质量：越高越慢但也越准 (200-400)
    "ocr_dpi": 300,
    
    # 输出目录
    "output_dir": "data"
}


def extract_page(doc, page_idx, dpi):
    """提取一页 PDF 为预处理过的图片"""
    page = doc[page_idx]
    pix = page.get_pixmap(dpi=dpi)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    # 灰度 + 增强对比度 + 二值化
    gray = img.convert('L')
    enhanced = ImageEnhance.Contrast(gray).enhance(1.8)
    bw = enhanced.point(lambda x: 0 if x < 200 else 255)
    return bw


def ocr_page(img, temp_dir, page_label):
    """OCR 一张图片，返回文本"""
    path = f"{temp_dir}/{page_label}.jpg"
    img.save(path, "JPEG", quality=92)
    
    result = subprocess.run(
        ["/tmp/ocr_swift", path],
        capture_output=True, text=True, timeout=120
    )
    return result.stdout


def parse_wordlist(text, page_num, config):
    """解析一页 OCR 文本，返回单词列表"""
    words = []
    current_unit = None
    rules = config["special_rules"].get(page_num, {})
    
    # 混合页逻辑
    is_unit6_section = False
    
    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue
        
        # 检测 Unit 标题
        m = re.match(r'Unit\s+(\d)', line)
        if m:
            current_unit = int(m.group(1))
            continue
        
        if line in ['Words and expressions', '']:
            continue
        if re.match(r'^\d+$', line):
            continue
        
        # 匹配: word /phonetic/ ... 中文
        m = re.match(r'^([a-zA-Z][a-zA-Z\-\' ]+?)\s*(/[^/]+/)\s*(.*)', line)
        if not m:
            continue
        
        word = m.group(1).strip().split()[0].lower()
        if len(word) <= 1:
            continue
        
        # 确定 unit
        unit = current_unit
        
        # 混合页规则
        if "unit1_words" in rules and word in rules["unit1_words"]:
            unit = 1
        elif "unit4_words" in rules and word in rules["unit4_words"]:
            unit = 4
        elif "unit6_start" in rules and word in rules["unit6_start"]:
            is_unit6_section = True
            unit = 6
        elif "unit5_start" in rules and word in rules["unit5_start"]:
            is_unit6_section = True
            unit = 5
        
        if is_unit6_section and unit is None:
            unit = 6
        elif unit is None:
            unit = config["wordlist_pages"][2] if len(config["wordlist_pages"]) > 2 else current_unit
        
        if unit is None:
            continue
        
        phonetic = m.group(2).strip()
        rest = m.group(3).strip()
        meaning = re.sub(r'^[a-z]+\.\s*', '', rest)
        meaning = re.sub(r'\s+\d+\s*$', '', meaning).strip()
        
        if not meaning:
            continue
        
        words.append({
            "word": word,
            "phonetic": phonetic,
            "cnMeaning": meaning,
            "module": f"Unit{unit}",
            "origin": config["name"]
        })
    
    return words


def run(pdf_path):
    """主流程"""
    import fitz
    
    temp_dir = f"/tmp/textbook_pipeline_{os.getpid()}"
    os.makedirs(temp_dir, exist_ok=True)
    
    config = CONFIG
    doc = fitz.open(pdf_path)
    offset = config["page_offset"]
    
    print(f"📖 打开: {pdf_path} ({doc.page_count}页)")
    
    # === 1. 提取单词表 ===
    all_words = []
    start_page, end_page = config["wordlist_pages"]
    
    print(f"🔍 OCR 单词表: 书上第{start_page}-{end_page}页...")
    
    for book_page in range(start_page, end_page + 1):
        pdf_idx = book_page + offset - 1
        if pdf_idx >= doc.page_count:
            break
        
        print(f"  第{book_page}页 (PDF索引{pdf_idx})...", end=" ")
        img = extract_page(doc, pdf_idx, config["ocr_dpi"])
        text = ocr_page(img, temp_dir, f"wl_{book_page}")
        
        page_words = parse_wordlist(text, book_page, config)
        all_words.extend(page_words)
        print(f"{len(page_words)} 个词")
    
    # 去重
    seen = set()
    unique = []
    for w in all_words:
        key = (w["word"], w["module"])
        if key not in seen:
            seen.add(key)
            unique.append(w)
    
    print(f"\n📊 单词表: {len(all_words)} → 去重后 {len(unique)} 个词")
    for u in range(1, 9):
        us = [w for w in unique if w["module"] == f"Unit{u}"]
        if us:
            print(f"  Unit {u}: {len(us)} 词")
    
    # === 2. 输出 ===
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", config["output_dir"])
    word_dict = {w["word"]: w for w in unique}
    
    json_path = os.path.join(out_dir, "words.json")
    with open(json_path, 'w') as f:
        json.dump(word_dict, f, ensure_ascii=False, indent=2)
    
    js_path = os.path.join(out_dir, "words.js")
    with open(js_path, 'w') as f:
        f.write("const words = ")
        json.dump(word_dict, f, ensure_ascii=False, indent=2)
        f.write(";\nmodule.exports = words;\n")
    
    print(f"\n✅ 已输出到:")
    print(f"  {json_path}")
    print(f"  {js_path}")
    
    # 清理
    doc.close()
    shutil.rmtree(temp_dir, ignore_errors=True)
    
    return unique


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python3 pipeline.py <pdf文件路径>")
        sys.exit(1)
    run(sys.argv[1])
