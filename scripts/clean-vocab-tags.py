"""
清洗 texts.json 的 vocab 标注

规则：
1. 每个课文单词只匹配最长对应的生词（performer → 不匹配 perform）
2. 处理复数、进行时、过去时等变形
3. 不把 "grandpa" 当作 "grand"（完整词边界匹配）
4. 只输出在句子中实际出现的生词
"""

import json, re

PROJECT_DIR = "/Users/wang/.openclaw/workspace/projects/word-moka"
TEXTS_FILE = f"{PROJECT_DIR}/data/texts.json"
WORDS_FILE = f"{PROJECT_DIR}/data/words.json"

with open(TEXTS_FILE) as f:
    texts = json.load(f)

with open(WORDS_FILE) as f:
    all_words = json.load(f)


def generate_forms(base_word):
    """
    生成一个生词 base 的所有变形，并给每个变形标记它属于哪个 base。
    返回: { inflected_form: set_of_base_words }
    """
    w = base_word.lower().strip()
    result = set()

    # 原型本身
    result.add(w)

    # 规则复数 +s +es
    result.add(w + "s")
    if w.endswith("s") or w.endswith("sh") or w.endswith("ch") or w.endswith("x") or w.endswith("o"):
        result.add(w + "es")
    # y → ies
    if w.endswith("y") and len(w) > 2 and w[-2] not in "aeiou":
        result.add(w[:-1] + "ies")

    # 动词 -ing, -ed
    result.add(w + "ing")
    if w.endswith("e"):
        result.add(w[:-1] + "ing")    # take → taking
        result.add(w + "d")           # 直接 +d: 已经以 e 结尾
    else:
        result.add(w + "ed")
    result.add(w + "ed")

    # 派生: -er, -ers, -tion, -tions, -sion, -sions
    result.add(w + "er")
    result.add(w + "ers")
    result.add(w + "tion")
    result.add(w + "tions")
    result.add(w + "sion")
    result.add(w + "sions")

    # 特殊: perform → performance, performances
    result.add(w + "ance")
    result.add(w + "ances")

    # 不规则复数: man → men
    if w.endswith("man"):
        result.add(w[:-3] + "men")
        result.add(w[:-3] + "mens")

    # 特殊: y + ier, iest (happy → happier, happiest)
    if w.endswith("y") and len(w) > 2 and w[-2] not in "aeiou":
        result.add(w[:-1] + "ier")
        result.add(w[:-1] + "iest")
        result.add(w[:-1] + "ily")

    # 去除可能的重复（小写化）
    return {f.lower() for f in result}


# 构建: 所有变形 → 对应的 base 单词列表
# word_form -> [base_word1, base_word2, ...]
form_to_bases = {}

for key, w in all_words.items():
    if w.get("module") != "Unit1":
        continue
    base = w["word"].lower().strip()
    forms = generate_forms(base)
    cn = w.get("cnMeaning", "")
    for f in forms:
        if f not in form_to_bases:
            form_to_bases[f] = []
        form_to_bases[f].append((base, cn))


def find_vocab(sentence_en):
    """
    对一句话中的每个单词，找到它在生词表中对应的最长 base。
    返回: [base_word, ...]
    """
    # 提取所有单词（包括带连字符的）
    words_in_sent = re.findall(r"[a-zA-Z']+(?:-[a-zA-Z]+)*", sentence_en.lower())

    tagged = set()
    for word in words_in_sent:
        # 去掉可能的标点附缀
        word = word.strip("'")

        # 找这个单词匹配的所有 base（包括它本身）
        bases = form_to_bases.get(word, [])

        # 按长度降序排序（最长匹配优先）
        bases.sort(key=lambda x: -len(x[0]))

        if bases:
            # 取最长的 base
            best_base = bases[0][0]
            tagged.add(best_base)
        else:
            # 变形没匹配上，尝试 base 本身是否以完整单词出现
            # （处理不规则复数等特殊案例）
            for base, cn in form_to_bases.get(word.lower(), []):
                if re.search(r'\b' + re.escape(base) + r'\b', sentence_en.lower()):
                    tagged.add(base)

    return sorted(tagged)


# === 执行清洗 ===

for unit_id, unit in texts.items():
    print(f"\n📖 {unit_id}: {unit['title']}")
    total_old = 0
    total_new = 0

    for pi, para in enumerate(unit["paragraphs"]):
        for si, sent in enumerate(para["sentences"]):
            en = sent["en"]
            old_vocab = set(sent.get("vocab", []))
            new_vocab = find_vocab(en)

            if set(old_vocab) != set(new_vocab):
                removed = sorted(old_vocab - set(new_vocab))
                added = sorted(set(new_vocab) - old_vocab)
                if not removed and not added:
                    continue

                en_short = en[:55] + "..." if len(en) > 55 else en
                if removed:
                    print(f"  🗑  段{pi+1}句{si+1}: 去掉 {removed}")
                if added:
                    print(f"  ➕ 段{pi+1}句{si+1}: 添加 {added}")

            total_old += len(old_vocab)
            total_new += len(new_vocab)
            sent["vocab"] = new_vocab

    print(f"  标注数: {total_old} → {total_new} ({'+' if total_new > total_old else ''}{total_new - total_old})")

# 写回
with open(TEXTS_FILE, "w", encoding="utf-8") as f:
    json.dump(texts, f, ensure_ascii=False, indent=2)

print(f"\n✅ 已更新 {TEXTS_FILE}")
