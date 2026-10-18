# -*- coding: utf-8 -*-
"""
生成 数学二/js/data-zhenti.js
来源：zhenti_parsed.json（刷题版，2011–2026）+ zhenti_kp.json（知识点版知识点）+ assign.txt（人工归类）
输出：window.HNSF829_ZT = { years, nodes, qs, byNode }
"""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "js" / "data-zhenti.js"
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

YEARS = range(2011, 2027)

parsed = json.load(open(HERE / "zhenti_parsed.json", encoding="utf-8"))
kp = json.load(open(HERE / "zhenti_kp.json", encoding="utf-8"))
nodes = json.load(open(HERE / "nodes_extract.json", encoding="utf-8"))["nodes"]
name_of = {n["id"]: n for n in nodes}

# ---- 人工精修补丁（五段解析 + 逐选项诊断 + 踩分技巧 + 同类变式）----
# 键 = 题目 id（如 zt-2022-1）；只覆盖列出的字段，未列出的沿用原解析。
# 用 .py 而不是 .json：解析里 LaTeX 反斜杠不用双写，改起来不易出错。
# 补丁与生成脚本分开维护，重跑生成不会丢失。
# 按年份拆成 analysis_patch.py、analysis_patch_2023.py……，这里全部合并。
sys.path.insert(0, str(HERE))
patch = {}
for _f in sorted(HERE.glob("analysis_patch*.py")):
    try:
        _m = __import__(_f.stem)
        patch.update(getattr(_m, "PATCH", {}))
    except Exception as _e:
        print("！补丁加载失败：%s（%s）" % (_f.name, _e))

# ---- 读取人工归类 ----
primary, extra = {}, []
for ln in open(HERE / "assign.txt", encoding="utf-8"):
    ln = ln.strip()
    if not ln or ln.startswith("#"):
        continue
    sec = ln.startswith("@")
    p = ln.lstrip("@ ").split()
    if len(p) != 2:
        continue
    y, n = p[0].split("-")
    key = (int(y), int(n))
    (extra.append((key, p[1])) if sec else primary.setdefault(key, p[1]))

# ---- 文本清洗 ----
def latex(s):
    """$...$ / $$...$$ → \\(...\\) / \\[...\\]（engine.fmt 只认后两种）"""
    if not s:
        return ""
    s = re.sub(r"\$\$([\s\S]*?)\$\$", lambda m: "\\[" + m.group(1) + "\\]", s)
    s = re.sub(r"(?<!\$)\$([^$\n]+?)\$(?!\$)", lambda m: "\\(" + m.group(1) + "\\)", s)
    return s.replace("\r\n", "\n").strip()

_SUBST_BASE = [(r"\\left|\\right|\\!|\\,|\\;|\\ ", ""), (r"\\dfrac|\\tfrac", r"\\frac"),
               (r"\\sqrt\{([^{}]*)\}", r"sqrt(\1)"),
               (r"\^\{([^{}]*)\}", r"^\1"), (r"_\{([^{}]*)\}", r"_\1"),
               (r"\\mathrm\{([^{}]*)\}", r"\1"), (r"\\text\{([^{}]*)\}", r"\1"),
               (r"\\([A-Za-z]+)", r"\1"),
               (r"[{}$~]", ""), (r"\\", "")]

def plain_math(s, paren=False):
    """把 LaTeX 答案压成用户大概率会手写的纯文本形式（用于填空题精确匹配）"""
    fr = r"(\1)/(\2)" if paren else r"\1/\2"
    rules = [(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", fr)] + _SUBST_BASE
    for a, b in rules:
        s = re.sub(a, b, s)
    return re.sub(r"\s+", "", s).strip()

OPT_PREFIX = re.compile(r"^\s*[-*>\s]*\**\s*[（(]?\s*([A-Da-d])\s*[.、)）]\**\s*")

# —— 刷题版残留的 Markdown 结构标记 ——
# 题块切到「下一题标题」为止，于是每节最后一题常把「下一节标题 + 小节说明」也吃进来
SEC_HEAD = re.compile(r"(?m)^#{2,4}\s*(?:(?:[一二三四五六七八九十]+)|\d+)\s*[、.．]?\s*"
                      r"(?:选择题|填空题|解答题|计算题|证明题|应用题|试题|参考答案|简明解析|逐题解析|解析|答案)[^\n]*$")
SEC_PRE = re.compile(r"(?m)^\s*`?\d+\s*[~～\-]\s*\d+`?\s*小题[^\n]*$")
SEC_PRE2 = re.compile(r"(?m)^\s*>?\s*本[题卷]共\s*\d+\s*小题[^\n]*$")
HEADING_MD = re.compile(r"(?m)^#{2,6}\s*(.+?)\s*$")
QUOTE_ONLY = re.compile(r"(?m)^\s*>\s*$")
MD_LINK = re.compile(r"\[([^\]]*)\]\([^)]*\)")
BULLET = re.compile(r"(?m)^\s*[-*]\s+")

def clean_md(s):
    s = SEC_HEAD.sub("", s or "")
    s = SEC_PRE.sub("", s)
    s = SEC_PRE2.sub("", s)
    s = HEADING_MD.sub(r"◆ \1", s)       # ①（1）求曲线方程 → ◆ （1）求曲线方程
    s = QUOTE_ONLY.sub("", s)
    s = MD_LINK.sub(r"\1", s)
    s = BULLET.sub("• ", s)
    s = s.replace("`", "")
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()
def clean_opt(o):
    return latex(OPT_PREFIX.sub("", o).strip())

FULLMARK = re.compile(r"^[（(]?\s*本题满分\s*`?(\d+)`?\s*分\s*[)）]?\s*")
def split_solution(stem):
    """解答题：刷题版把解析直接跟在题干后面（'解：'）。拆出解答部分。"""
    m = re.search(r"\n\s*解[：:]\s*", stem)
    if m:
        return stem[:m.start()].strip(), stem[m.end():].strip()
    return stem.strip(), ""

def get_answer_letter(a):
    m = re.search(r"([A-Da-d])", a or "")
    return "ABCD".index(m.group(1).upper()) if m else None

# ---- 组装题目 ----
qs, by_node, warns = [], {}, []
for q in parsed["questions"]:
    if q["year"] not in YEARS:
        continue
    key = (q["year"], q["num"])
    zts = [nid for nid in [primary.get(key)] + [e[1] for e in extra if e[0] == key] if nid]
    if not zts:
        continue
    t = q["type"]
    typ = "choice" if "选" in t else ("blank" if "填" in t else "calc")

    stem = (q["stem"] or "").strip()
    analysis = (q["analysis"] or "").strip()
    options, ans = [], None

    if typ == "choice":
        options = [clean_opt(o) for o in (q["options"] or [])]
        ans = get_answer_letter(q["answer"])
        if ans is None:
            m = re.search(r"答案[：:]\s*[（(]?\s*([A-D])", analysis)
            ans = "ABCD".index(m.group(1)) if m else None
        if ans is None or len(options) < 2:
            warns.append(f"{q['year']}-{q['num']} 选择题缺答案/选项，跳过")
            continue
        if len(options) > 4:
            options = options[:4]
    elif typ == "blank":
        a = (q["answer"] or "").strip()
        if not a:
            warns.append(f"{q['year']}-{q['num']} 填空题缺答案，跳过")
            continue
        alts = [a]
        for pv in (plain_math(a), plain_math(a, paren=True)):
            if pv and pv not in alts:
                alts.append(pv)
        ans = alts
    else:  # calc
        stem, tail = split_solution(stem)
        if tail and not analysis:
            analysis = tail
        ans = (q["answer"] or "").strip() or "（详见解析）"

    stem = clean_md(FULLMARK.sub("", stem))
    analysis = clean_md(re.sub(r"(?m)^\s*-{3,}\s*$", "", analysis))
    mk = re.search(r"本题满分\s*`?(\d+)`?\s*分", q["stem"] or "")
    score = int(mk.group(1)) if mk else (5 if typ in ("choice", "blank") else 10)

    kp_txt = kp.get(f"{q['year']}-{q['num']}", "")
    if kp_txt:
        analysis = (analysis + "\n\n【本题考点】" + kp_txt).strip()

    qid = "zt-%d-%d" % (q["year"], q["num"])
    rec = {
        "id": qid, "year": q["year"], "num": q["num"], "zt": zts,
        "type": typ, "level": 3 if typ == "calc" else 2, "score": score, "diff": "exam",
        "stem": latex(stem), "options": options, "answer": ans,
        "analysis": latex(analysis),
        "source": "%d 年真题 · 第 %d 题（302 数学二）" % (q["year"], q["num"]),
    }

    # ---- 应用人工精修补丁 ----
    p = patch.get(qid) or {}
    if p.get("stem"):
        rec["stem"] = latex(clean_md(p["stem"]))
    if p.get("options"):
        rec["options"] = [latex(clean_md(x)) for x in p["options"]]
    if p.get("answer") is not None:
        rec["answer"] = p["answer"]
    if p.get("analysis"):
        rec["analysis"] = latex(clean_md(p["analysis"]))
    if p.get("optionNotes"):
        rec["optionNotes"] = [latex(clean_md(x)) for x in p["optionNotes"]]
        if len(rec["optionNotes"]) != len(rec["options"]):
            warns.append("%s 选项诊断条数 %d ≠ 选项数 %d" % (
                qid, len(rec["optionNotes"]), len(rec["options"])))
    if p.get("tips"):
        rec["tips"] = latex(clean_md(p["tips"]))
    if p.get("variants"):
        rec["variants"] = [{
            "stem": latex(clean_md(v.get("stem", ""))),
            "hint": latex(clean_md(v.get("hint", ""))),
        } for v in p["variants"] if v.get("stem")]

    qs.append(rec)
    for nid in zts:
        by_node.setdefault("zt-" + nid, []).append(qid)

# ---- 组节点（按 NODES 原顺序）----
zt_nodes = []
for n in nodes:
    zid = "zt-" + n["id"]
    ids = by_node.get(zid, [])
    if not ids:
        continue
    yrs = sorted({int(i.split("-")[1]) for i in ids})
    zt_nodes.append({
        "id": zid, "parent": n["id"], "name": "真题·" + n["name"],
        "chap": n["chap"], "module": n["module"], "tier": n["tier"],
        "weight": n["weight"], "count": len(ids), "years": yrs,
    })

# ---- 输出 JS ----
js = ["/* 302 数学二 · 历年真题库（2011–2026）  由 zhenti/build_zhenti_js.py 生成，勿手改 */",
      "window.HNSF829_ZT = {"]
js.append("years: %s," % json.dumps(list(YEARS)))
js.append("nodes: [")
js.append(",\n".join("  " + json.dumps(z, ensure_ascii=False) for z in zt_nodes))
js.append("],\nqs: [")
js.append(",\n".join("  " + json.dumps(q, ensure_ascii=False) for q in qs))
js.append("],\nbyNode: " + json.dumps(by_node, ensure_ascii=False) + "\n};")
OUT.write_text("\n".join(js), encoding="utf-8")

print("题目 %d 道，真题节点 %d 个" % (len(qs), len(zt_nodes)))
print("空节点：", [n["id"] for n in nodes if not by_node.get("zt-" + n["id"])] or "无")
print("告警 %d 条：" % len(warns))
for w in warns[:20]:
    print("  !", w)
sz = OUT.stat().st_size
print("→ %s  (%.0f KB)" % (OUT, sz / 1024))
print("题型分布：choice %d / blank %d / calc %d" % (
    sum(1 for q in qs if q["type"] == "choice"),
    sum(1 for q in qs if q["type"] == "blank"),
    sum(1 for q in qs if q["type"] == "calc")))
