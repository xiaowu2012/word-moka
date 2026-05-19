#!/usr/bin/env python3
"""
提取外研版八年级下册 (2026春版) PDF 中的单词表
用法: python3 extract-words.py <pdf文件> [输出目录]
"""
import json, sys, os, re

def extract_text(pdf_path):
    """用 PyMuPDF 提取全部文本"""
    import fitz
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    doc.close()
    return text


def parse_word_list(text):
    """
    从教材 PDF 文本中解析单词表。
    教材单词表通常是这样的格式:
        word /phonetic/ n. 中文释义
    或:
        word /phonetic/ 中文释义
    或每行一个词:
        word
        /phonetic/
        中文释义
    """
    # 尝试多种格式
    entries = []
    
    # 格式1: word /phonetic/ pos. 中文
    #         word /phonetic/ 中文
    pattern1 = re.compile(
        r'^([a-zA-Z\-\.\']+)\s+'           # 单词
        r'(/[^/]+/)\s+'                     # 音标
        r'((?:\w+\.\s*)?'                   # 可选词性
        r'[^/\n]+)',                        # 中文释义
        re.MULTILINE
    )
    
    for m in pattern1.finditer(text):
        word = m.group(1).strip()
        phonetic = m.group(2).strip()
        meaning = m.group(3).strip()
        # 去掉词性前缀
        meaning = re.sub(r'^[a-z]+\.\s*', '', meaning)
        entries.append({
            'word': word,
            'phonetic': phonetic,
            'cnMeaning': meaning
        })
    
    return entries


def generate_examples(word, cn_meaning):
    """AI 生成课本风格例句 + 拓展例句 + 考点"""
    # 这个函数后续可以接入 LLM API 生成
    # 目前返回占位
    return {
        "examples": [{"sentence": "", "scene": ""}],
        "exampleCn": "",
        "extraExample": "",
        "extraCn": "",
        "examFrequency": 3,
        "tip": ""
    }


def main():
    if len(sys.argv) < 2:
        print("用法: python3 extract-words.py <pdf文件>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    out_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(__file__))
    
    print(f"📖 读取 PDF: {pdf_path}")
    text = extract_text(pdf_path)
    print(f"📄 提取了 {len(text)} 字符")
    
    # 保存原始文本方便调试
    with open(os.path.join(out_dir, "raw_text.txt"), 'w') as f:
        f.write(text)
    print(f"💾 原始文本已保存")
    
    # 解析单词表
    entries = parse_word_list(text)
    print(f"📝 解析出 {len(entries)} 个单词")
    
    if not entries:
        print("⚠️  没有解析到单词，请检查 raw_text.txt 格式")
        # 打印前1000字符帮助调试
        print(text[:1000])
        return
    
    # 构建 words.json
    words = {}
    for entry in entries:
        key = entry['word'].lower().replace(' ', '_')
        words[key] = {
            "word": entry['word'],
            "phonetic": entry['phonetic'],
            "cnMeaning": entry['cnMeaning'],
            "enMeaning": "",
            "examples": [{"sentence": "", "scene": ""}],
            "exampleCn": "",
            "extraExample": "",
            "extraCn": "",
            "examFrequency": 3,
            "tip": "",
            "module": "",
            "origin": "外研版八年级下册(2026春版)"
        }
    
    # 输出
    json_path = os.path.join(out_dir, "words.json")
    js_path = os.path.join(out_dir, "words.js")
    
    with open(json_path, 'w') as f:
        json.dump(words, f, ensure_ascii=False, indent=2)
    
    with open(js_path, 'w') as f:
        f.write("const words = ")
        json.dump(words, f, ensure_ascii=False, indent=2)
        f.write(";\nmodule.exports = words;\n")
    
    print(f"\n✅ 已生成:")
    print(f"   {json_path} ({len(words)} 词)")
    print(f"   {js_path} ({len(words)} 词)")
    
    # 打印前10个看看效果
    print(f"\n📋 前10个词预览:")
    for i, (k, v) in enumerate(list(words.items())[:10]):
        print(f"   {v['word']:20s} {v['phonetic']:15s} {v['cnMeaning']}")


if __name__ == "__main__":
    main()
