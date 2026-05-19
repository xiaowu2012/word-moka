# 课本数据提取工具

把一本扫描版 PDF 课本变成小程序可用的单词数据。

## 前置条件

```bash
# 1. 编译 OCR 工具 (一次)
swiftc -o /tmp/ocr_swift scripts/ocr.swift

# 2. 安装 Python 依赖
pip3 install pymupdf pillow

# 3. 安装 tesseract (备选)
brew install tesseract tesseract-lang
```

## 快速开始

### 提取单词表

```bash
# 配置 config.py 里的页码信息
python3 pipeline.py /path/to/textbook.pdf
```

### 配置说明

编辑 `pipeline.py` 底部的 `CONFIG`：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `name` | 课本名称 | 外研版九年级上册 |
| `wordlist_pages` | 单词表起止页码(书上) | (138, 143) |
| `page_offset` | PDF偏移量 | 3 (书上第4页=PDF第1页) |
| `special_rules` | 混合页规则 | 见注释 |
| `ocr_dpi` | OCR精度 | 300 |

### 混合页规则

课本单词表有时一页包含多个 Unit，需要特殊规则：

```python
# 第139页: bud/vast/grand 属于 Unit1, 其余属于 Unit2
139: {"unit1_words": ["bud", "vast", "grand"]}

# 第140页: fearless/bravely 属于 Unit4, 其余属于 Unit3
140: {"unit4_words": ["fearless", "bravely"]}

# 第141页: 从 drop 之后属于 Unit5, 前面属于 Unit4
141: {"unit5_start": ["drop"]}
```

## 注意事项

1. **页码确认**: 打开 PDF，看课本角落的页码（不是 PDF 阅读器页码）
2. **先 OCR 试一页**: 确认质量后再跑全量
3. **Unit 命名**: 输出固定为 `Unit1` ~ `Unit6`，需要手动改 `app.js`
4. **课文数据**: 目前 pipeline 只提取单词表，课文需单独录入
