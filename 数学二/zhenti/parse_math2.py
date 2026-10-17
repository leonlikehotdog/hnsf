# -*- coding: utf-8 -*-
"""
302 数学二 · 历年真题解析器 v2
==============================
把 zhenti/kysx2-zt/刷题版/YYYY-2.md 解析成结构化 JSON。

各年排版混乱，v2 的处理策略：
  · 题目层级「动态识别」：哪个标题级别出现最多「题号式标题」，哪一级就是题目层。
      普通年份  ## 一、选择题  →  ### 1 / ### （1） / ### 第 1 题
      2020 年   ## 一、试题    →  ### 1. 选择题 → #### （1）
  · 题型 = 该题之前最近的、含「选择/填空/解答」的标题。
  · 题块 = 从本题标题到「下一道题标题」，中间的 (1)(2) 小题标题算在本题里（2023 的坑）。
  · 2020 答案不写在题里，而在「二、参考答案速查 / 三、简明解析」两节 → 第二遍解析后按 (题型,题号) 合并。

用法：python parse_math2.py [起年 止年]
"""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "kysx2-zt" / "刷题版"
OUT = HERE / "zhenti_parsed.json"

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

# 题号式标题（数字开头）：'1' / '1.' / '1. 极限计算' / '第 1 题' / '17（本题满分 10 分）'
QNUM_A = re.compile(r"^\s*(?:第\s*)?(\d{1,2})\s*(?:题|[.．、])?\s*(.*)$")
# 题号式标题（括号数字开头）：'（1）' / '（15）（本题满分 10 分）'
#  —— 2023 的 '（1）求曲线方程' 不算（那是小题，括号号后跟中文）
QNUM_B = re.compile(r"^\s*[（(]\s*(\d{1,2})\s*[)）]\s*(?:[（(][^）)]{0,30}[)）])?\s*$")
ANS_SEC = ("答案", "解析", "速查", "详解")
TYPE_ONLY = re.compile(r"^(选择|填空|解答|计算|证明|应用)题?$")


def qnum_of(title):
    m = QNUM_B.match(title)
    if m:
        return int(m.group(1))
    m = QNUM_A.match(title)
    if m:
        tail = m.group(2).strip()
        if TYPE_ONLY.match(tail) or len(tail) > 40:
            return None
        return int(m.group(1))
    return None


def type_of(title):
    for k in ("选择", "填空", "解答", "计算", "证明", "应用"):
        if k in title:
            return "解答题" if k in ("解答", "计算", "证明", "应用") else (k + "题")
    return None


def strip_md(s):
    if not s:
        return ""
    s = s.replace("\\(", "$").replace("\\)", "$").replace("\\[", "$$").replace("\\]", "$$")
    s = re.sub(r"\*\*(.+?)\*\*", r"\1", s)
    return s.strip()


def headings(text):
    """所有 #### 及以上的标题：[(pos_start, pos_end, level, title)]"""
    out = []
    for m in re.finditer(r"(?m)^(#{2,6})\s+(.*)$", text):
        out.append((m.start(), m.end(), len(m.group(1)), m.group(2).strip()))
    return out


def parse_block(body):
    m_ans = re.search(r"\*\*答案[：:]\*\*\s*(.*?)(?=\n\s*\n|\*\*解析|\*\*知识点|$)", body, re.S)
    m_ana = re.search(r"\*\*解析[：:]\*\*\s*([\s\S]*)$", body)
    m_kp = re.search(r"\*\*知识点[：:]\*\*\s*([\s\S]*?)(?=\*\*解析|\*\*答案|$)", body)

    answer = strip_md(m_ans.group(1)) if m_ans else ""
    analysis = strip_md(m_ana.group(1)) if m_ana else ""
    kp = ""
    if m_kp:
        kp = "; ".join(strip_md(x) for x in re.findall(r"(?m)^\s*[-*]\s*(.+)$", m_kp.group(1)))
        kp = kp or strip_md(m_kp.group(1))

    cut = min([m.start() for m in (m_ans, m_ana, m_kp) if m] + [len(body)])
    head = body[:cut]

    opts, stem_lines = [], []
    for ln in head.split("\n"):
        mo = re.match(r"^\s*(?:[-*]\s*)?(?:\*\*)?[（(]?\s*([A-D])\s*[.、)）]\s*(?:\*\*)?\s*(.*)$", ln)
        if mo and len(ln.strip()) < 400:
            opts.append(f"{mo.group(1)}. " + strip_md(mo.group(2)))
        else:
            stem_lines.append(ln)
    stem = re.sub(r"\n{3,}", "\n\n", strip_md("\n".join(stem_lines)))
    stem = re.sub(r"(?m)^\s*-{3,}\s*$", "", stem).strip()
    return stem, opts, answer, analysis, kp


def parse_file(fp: Path, year: int):
    text = fp.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n")
    hs = headings(text)
    if not hs:
        return []
    # 1) 全部候选题号标题
    cand = [(i, h) for i, h in enumerate(hs) if qnum_of(h[3]) is not None]
    if not cand:
        return []
    # 2) 题目层 = 出现候选最多的级别
    from collections import Counter
    lvl = Counter(h[2] for _, h in cand).most_common(1)[0][0]
    cand = [(i, h) for i, h in cand if h[2] == lvl]

    # 3) top(##) 标题（用于判断是不是「答案/解析」节）
    def top_title(i):
        t = ""
        for j in range(i, -1, -1):
            if hs[j][2] == 2:
                t = hs[j][3]
                break
        return t

    def type_before(i):
        t = None
        for j in range(i, -1, -1):
            ty = type_of(hs[j][3])
            if ty:
                t = ty
                break
        return t or "解答题"

    # 4) 主解析
    items, key2idx = [], {}
    for k, (hi, h) in enumerate(cand):
        nxt = cand[k + 1][0] if k + 1 < len(cand) else len(hs)
        start = h[1]
        end = hs[nxt][0] if k + 1 < len(cand) else len(text)
        body = text[start:end]
        top = top_title(hi)
        if any(x in top for x in ANS_SEC):        # 答案/解析节，第二遍再要
            continue
        num = qnum_of(h[3])
        qt = type_before(hi)
        stem, opts, ans, ana, kp = parse_block(body)
        if not stem:
            continue
        it = {"year": year, "num": num, "type": qt, "stem": stem, "options": opts,
              "answer": ans, "analysis": ana, "knowledge": kp}
        key2idx[(qt, num)] = len(items)
        items.append(it)

    # 5) 合并「答案/解析」节（2020 的答案不在题里）
    for k, (hi, h) in enumerate(cand):
        top = top_title(hi)
        if not any(x in top for x in ANS_SEC):
            continue
        nxt = cand[k + 1][0] if k + 1 < len(cand) else len(hs)
        end = hs[nxt][0] if k + 1 < len(cand) else len(text)
        body = text[h[1]:end]
        num = qnum_of(h[3])
        qt = type_before(hi)
        _, _, ans, ana, _ = parse_block(body)
        idx = key2idx.get((qt, num))
        if idx is None:
            continue
        if ans and not items[idx]["answer"]:
            items[idx]["answer"] = ans
        if ana and not items[idx]["analysis"]:
            items[idx]["analysis"] = ana
    return items


def main():
    args = [int(a) for a in sys.argv[1:] if re.fullmatch(r"\d{4}", a)]
    lo, hi = (min(args), max(args)) if len(args) >= 2 else (0, 9999)
    files = sorted(SRC.glob("*-2.md"), key=lambda p: int(re.search(r"(\d+)", p.name).group(1)))
    allq, by_year = [], {}
    for fp in files:
        yr = int(re.search(r"(\d+)", fp.name).group(1))
        if not (lo <= yr <= hi):
            continue
        items = parse_file(fp, yr)
        by_year[yr] = len(items)
        allq.extend(items)
        miss = sum(1 for x in items if not x["answer"])
        print(f"  {yr}: {len(items):>3} 题" + (f"  ⚠ 缺答案 {miss}" if miss else ""))
    print(f"\n合计 {len(allq)} 题 / {len(by_year)} 年")
    OUT.write_text(json.dumps({"meta": {"total": len(allq), "by_year": by_year}, "questions": allq},
                              ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"→ {OUT}")


if __name__ == "__main__":
    main()
