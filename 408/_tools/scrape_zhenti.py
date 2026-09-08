#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
408 统考真题爬虫/解析器
数据源：https://www.csgraduates.com/study_methods/408quiz/{year}/

把某一年整卷页面解析为站点（408/index.html → zhenti 模块）可用的逐题数据：
  - 题干：保留段落 / 表格 / 代码 / 行内格式，去除站点导航等外壳
  - 附图：页面里的配图是内嵌 SVG（部分含 data:image 位图）或 data:image <img>，
    统一抽成独立文件，正文改用 <img src="imgs/zhenti/{year}/q{nn}_f{k}.svg"> 引用
  - 选项：选择题 A/B/C/D（文本来自 <span class=choice-text>）
  - 标准答案：解析自“查看答案与解析”按钮内联参数（或 correct-answer-text）
  - 解析：<div class=explanation> 内容（剥掉“正确答案：…”标题与站内链接壳）

仅用 Python 标准库。用法：
  python scrape_zhenti.py [年份 ...]      # 不传则 2024 2026
产物：
  408/chapters/zhenti_full_{year}.js
  408/imgs/zhenti/{year}/q{nn}_f{k}.svg
"""
import base64
import html as _html
import json
import os
import re
import sys
import urllib.request
from collections import Counter
from html.parser import HTMLParser

BASE_URL = "https://www.csgraduates.com/study_methods/408quiz/{year}/"
HERE = os.path.dirname(os.path.abspath(__file__))
REPO_408 = os.path.abspath(os.path.join(HERE, ".."))           # …/408
CACHE_DIR = os.path.join(HERE, "_cache")
IMG_ROOT = os.path.join(REPO_408, "imgs", "zhenti")

PART_MAP = [
    (("数据结构",), "数据结构"),
    (("计算机组成原理", "组成原理"), "计组"),
    (("操作系统",), "操作系统"),
    (("计算机网络", "计网"), "计网"),
]

KEEP_TAGS = {"p", "br", "b", "strong", "em", "u", "sub", "sup", "code",
             "pre", "ul", "ol", "li", "table", "thead", "tbody", "tr", "td",
             "th", "img", "h3", "h4", "blockquote"}
VOID_TAGS = {"br", "img", "hr"}
ATTR_KEEP = {
    "td": ("colspan", "rowspan"),
    "th": ("colspan", "rowspan"),
    "img": ("src", "class", "alt"),
}

DROP_BOX = {"form", "button", "iframe", "script", "style", "textarea",
            "svg", "figure", "nav", "aside", "template", "input", "label"}


# ---------------------------------------------------------------- 取页 ----
def fetch(year):
    os.makedirs(CACHE_DIR, exist_ok=True)
    path = os.path.join(CACHE_DIR, f"{year}.html")
    if not os.path.exists(path) or os.path.getsize(path) < 50000:
        url = BASE_URL.format(year=year)
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"})
        with urllib.request.urlopen(req, timeout=90) as r:
            data = r.read()
        with open(path, "wb") as f:
            f.write(data)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def decode_text(seg):
    seg = re.sub(r"<[^>]+>", "", seg)
    seg = _html.unescape(seg)
    seg = re.sub(r"\s+", " ", seg)
    return seg.strip()


# ------------------------------------------------------------- 定界 ----
def h4_subject_anchors(html):
    """找出正文四个科目 <h4>，返回 [(name, h4_tag_end_pos)]。"""
    anchors = []
    for m in re.finditer(r"<h4\b[^>]*>(.*?)</h4>", html, re.S | re.I):
        name = decode_text(m.group(1))
        if any(k in name for k in ("数据结构", "组成原理", "操作系统", "计算机网络")):
            anchors.append((name, m.end()))
    return anchors


def h5_positions(html, lo, hi):
    out = []
    for m in re.finditer(r"<h5\b[^>]*>", html):
        if lo <= m.start() < hi:
            out.append((m.start(), m.end()))
    return out


# ------------------------------------------------------------- 图 ----
def find_figure(html, start):
    """从 start 起寻找一张配图。返回 (start,end,内容类型,数据) 或 None。
    支持：<div class=svg-wrapper>…<svg>…</svg>…</div> 或 <img src="data:…">"""
    wrapper = re.search(r"<div\s+class=[\"']?svg-wrapper[\"']?[^>]*>", html[start:])
    if wrapper:
        w_start = start + wrapper.start()
        w_end = balanced_div_end(html, w_start)
        if w_end:
            seg = html[w_start:w_end]
            sm = re.search(r"<svg\b", seg)
            if sm:
                s_start = w_start + sm.start()
                s_end = balanced_tag_end(html, s_start, "svg")
                if s_end:
                    return w_start, s_end, "svg", html[s_start:s_end]
            return w_start, w_end, "wrap", seg
    img = re.search(r"<img\b[^>]*>", html[start:])
    if img:
        i_start = start + img.start()
        i_end = start + img.end()
        tag = html[i_start:i_end]
        msrc = re.search(r'src=["\']?(data:image/([a-zA-Z+]+);base64,([A-Za-z0-9+/=]+))["\']?', tag)
        if msrc:
            return i_start, i_end, "data:" + msrc.group(2), msrc.group(3)
    return None


def balanced_tag_end(html, start, tag):
    depth = 0
    pat = re.compile(r"<(/?)" + tag + r"\b[^>]*>", re.I)
    for m in pat.finditer(html, start):
        if m.group(1):
            depth -= 1
            if depth == 0:
                return m.end()
        else:
            depth += 1
    return None


def balanced_div_end(html, start):
    depth = 0
    for m in re.finditer(r"<(/?)div\b[^>]*>", html[start:]):
        if m.group(1):
            depth -= 1
            if depth == 0:
                return start + m.end()
        else:
            depth += 1
    return None


import xml.etree.ElementTree as ET


def _svg_ok(text):
    try:
        ET.fromstring(text)
        return True
    except Exception:
        return False


def repair_svg(payload):
    """源站 SVG 偶发样式属性里带裸双引号（font-family: "Helvetica"）导致 XML 解析失败，
    或整体以 JS 字符串转义存储（2026 部分图），逐级修复直到可被严格 XML 解析。"""
    cand = payload
    if _svg_ok(cand):
        return cand
    cand = js_unescape(payload)
    if _svg_ok(cand):
        return cand
    cand = re.sub(r'font-family:\s*"([^"]{1,60})"', r"font-family: '\1'", cand)
    if _svg_ok(cand):
        return cand
    # 其它样式里可能存在的成对裸引号
    cand = re.sub(r'(style="[^"]*?)"([^"]{1,60})"([^"]*?")', lambda m: m.group(1) + "'" + m.group(2) + "'" + m.group(3), cand)
    if _svg_ok(cand):
        return cand
    # 未转义 &
    cand = re.sub(r"&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)", "&amp;", cand)
    return cand  # 若仍不合法则保留当前最佳修复结果


def js_unescape(payload):
    """2026 若干图以 JS 字符串形式存储（\'、\"、\n 转义），先还原成浏览器最终注入的 svg 文本。"""
    cand = payload.replace("\\'", "'").replace('\\"', '"')
    cand = re.sub(r'(?<!\\)\\n', '\n', cand)
    cand = cand.replace('\\\\', '\\')
    return cand


def svg_candidates(html, from_pos):
    """返回 from_pos 之后所有 <svg>…</svg>（含起始位置），按出现顺序。"""
    out = []
    for m in re.finditer(r"<svg\b", html[from_pos:]):
        s = from_pos + m.start()
        e = balanced_tag_end(html, s, "svg")
        if e:
            out.append((s, e, html[s:e]))
    return out


def pick_valid_svg(html, fallback_start):
    """多个 svg 候选里选第一个修复后仍可严格解析的；都不行返回 None。"""
    for s, e, raw in svg_candidates(html, fallback_start):
        fixed = repair_svg(raw)
        if _svg_ok(fixed):
            return s, e, fixed
    return None


def mask_figures(slice_html, year, qnum, counter, imgdir, inline_out=None):
    """把一段 html 里的配图处理掉：可严格解析的 SVG/base64 落盘并替换成 <img>；
    无法修复为严格 XML 的 SVG（2026 个别图是 HTML 语法）交给 inline_out 内联渲染。
    返回 (masked_html, 新计数)。"""
    out = []
    cursor = 0
    while True:
        fig = find_figure(slice_html, cursor)
        if not fig:
            break
        start, end, kind, payload = fig
        out.append(slice_html[cursor:start])
        counter += 1
        if kind.startswith("data:"):
            ext = "png" if kind in ("data:png", "data:image/png") else "gif"
            ext = {"data:png": "png", "data:jpeg": "jpg", "data:gif": "gif",
                   "data:image/png": "png", "data:image/jpeg": "jpg",
                   "data:image/gif": "gif"}.get(kind, "png")
            name = f"q{qnum:02d}_f{counter}.{ext}"
            data = base64.b64decode(payload)
            with open(os.path.join(imgdir, name), "wb") as f:
                f.write(data)
            out.append(f'<img src="imgs/zhenti/{year}/{name}" class="zt-fig" alt="">')
        else:
            repaired = repair_svg(payload)
            if _svg_ok(repaired):
                name = f"q{qnum:02d}_f{counter}.svg"
                with open(os.path.join(imgdir, name), "w", encoding="utf-8") as f:
                    f.write(repaired)
                out.append(f'<img src="imgs/zhenti/{year}/{name}" class="zt-fig" alt="">')
            else:
                # 首个 <svg> 修复后仍不合法 → 向后找本图形区可严格解析的 svg
                got = pick_valid_svg(slice_html, end)
                if got:
                    _, end, payload = got
                    name = f"q{qnum:02d}_f{counter}.svg"
                    with open(os.path.join(imgdir, name), "w", encoding="utf-8") as f:
                        f.write(payload)
                    out.append(f'<img src="imgs/zhenti/{year}/{name}" class="zt-fig" alt="">')
                else:
                    # HTML 语法的 svg（属性不带引号）：按原站做法内联渲染
                    if inline_out is not None:
                        inline_out.append(js_unescape(payload))
                        out.append("@@INLINE%d@@" % (len(inline_out) - 1))
        cursor = end
    out.append(slice_html[cursor:])
    return "".join(out), counter


def restore_inline(html, inline_out):
    """把 @@INLINE<i>@@ 占位符替换为内联 svg 包装（HTML 宽容解析，等同原站）。"""
    for i, raw in enumerate(inline_out or []):
        html = html.replace("@@INLINE%d@@" % i,
                            '<div class="zt-fig zt-fig-inline">' + raw + "</div>")
    return html


# ------------------------------------------------------------- 清洗 ----
class Sanitizer(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.drop = 0

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if self.drop:
            if tag in DROP_BOX:
                self.drop += 1
            return
        if tag in DROP_BOX:
            self.drop = 1
            return
        if tag in KEEP_TAGS:
            keep = ATTR_KEEP.get(tag, ())
            att = "".join(f' {k}="{_html.escape(_attr(attrs, k), quote=True)}"'
                          for k in keep if _attr(attrs, k) is not None)
            self.parts.append(f"<{tag}{att}>" if tag not in VOID_TAGS else f"<{tag}{att}/>")

    def handle_endtag(self, tag):
        tag = tag.lower()
        if self.drop:
            if tag in DROP_BOX:
                self.drop -= 1
            return
        if tag in KEEP_TAGS and tag not in VOID_TAGS:
            self.parts.append(f"</{tag}>")

    def handle_startendtag(self, tag, attrs):
        tag = tag.lower()
        if self.drop:
            return
        if tag in KEEP_TAGS:
            keep = ATTR_KEEP.get(tag, ())
            att = "".join(f' {k}="{_html.escape(_attr(attrs, k), quote=True)}"'
                          for k in keep if _attr(attrs, k) is not None)
            self.parts.append(f"<{tag}{att}/>")

    def handle_data(self, data):
        if not self.drop:
            self.parts.append(data)

    def result(self):
        return "".join(self.parts)


def _attr(attrs, name):
    for k, v in attrs:
        if k.lower() == name:
            return v
    return None


def sanitize(html_frag):
    s = Sanitizer()
    try:
        s.feed(html_frag)
        s.close()
    except Exception:
        pass
    return s.result()


def squish(text):
    text = text.replace("\u0001", "")
    text = re.sub(r"[ \t\u00a0\r\f\v]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n", text)
    text = re.sub(r" ?\n ?", "\n", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    return text.strip()


def fold_newlines_outside_pre(html):
    """<pre> 代码内的换行必须保留；其余文本里的软换行折叠掉（站点 pre-wrap 会显示它们）。"""
    parts = re.split(r"(<pre>.*?</pre>)", html, flags=re.S)
    for i, p in enumerate(parts):
        if p.startswith("<pre>"):
            continue
        parts[i] = re.sub(r"\s*\n\s*", " ", p)
    return "".join(parts).strip()


def normalize_pre(html_frag):
    """把 <pre>…高亮 code…</pre> 归一为纯文本 <pre>（保留换行，去掉高亮壳）。"""
    def repl(m):
        inner = m.group(1)
        inner = re.sub(r"<[^>]+>", "", inner)
        inner = _html.unescape(inner)
        # 去掉行首冗余缩进（通常 4 空格）
        lines = inner.split("\n")
        indents = [len(l) - len(l.lstrip()) for l in lines if l.strip()]
        if indents:
            cut = min(indents)
            lines = [l[cut:] if l.strip() else "" for l in lines]
        return "<pre>" + _html.escape("\n".join(lines)) + "</pre>"
    return re.sub(r"<pre[^>]*>(.*?)</pre>", repl, html_frag, flags=re.S | re.I)


# ------------------------------------------------------------- 单题 ----
def extract_question(year, num, part, seg, imgdir):
    # 1) 答案：按钮内联参数 / choice-container 的 data-answer
    ans = ""
    mbtn = re.search(r"checkAndToggleExplanation\([^)]*?,\s*[\"']([^\"']*)[\"']\s*,\s*[\"']([^\"']*)[\"']", seg)
    if mbtn:
        ans = (mbtn.group(2) or "").strip()
    if not ans:
        mda = re.search(r"data-answer=[\"']?([A-Za-z])[\"']?", seg)
        if mda:
            ans = mda.group(1).strip()
    if not ans:
        mc = re.search(r"<span class=correct-answer-text>([^<]+)</span>", seg)
        if mc:
            ans = mc.group(1).strip()

    # 2) 选项区（<span class=choice-text>）
    options = []
    fm = re.search(r"<form\b", seg)
    fm_end = re.search(r"</form>", seg)
    if fm and fm_end and fm.start() < fm_end.start():
        formseg = seg[fm.start():fm_end.start()]
        for m in re.finditer(r"<span class=choice-text>(.*?)</span>", formseg, re.S):
            options.append(m.group(1))

    # 3) 题干结束点：选项表单 / 知识点标签 / 操作按钮 / 解析区之前
    ends = []
    for pat in (r"<div\s+class=[\"']?choice-container[\"']?",
                r"<div\s+class=[\"']?answer-container[\"']?",
                r"<form\b",
                r"<div\s+class=[\"']?quiz-tags[\"']?",
                r"<span\s+class=[\"']?tag-icon[\"']?",
                r"class=[\"']?quiz-tag[\"']?",
                r"class=[\"']?(?:toggle|collect)-btn[\"']?",
                r"<div class=explanation\b",
                r"<div class=[\"']?solution-detail[\"']?"):
        m = re.search(pat, seg)
        if m:
            ends.append(m.start())
    stem_end = min(ends) if ends else len(seg)

    # 4) 解析区：选择题 explanation / 大题 solution-detail
    sol_start = None
    for cls in (r"<div class=explanation\b", r"<div class=[\"']?solution-detail[\"']?"):
        m = re.search(cls, seg)
        if m:
            ee = balanced_div_end(seg, m.start())
            if ee:
                sol_start, sol_end = m.start(), ee
                break

    # 5) 图落盘 + 掩码
    counter = 0
    stem_inline = []
    stem, counter = mask_figures(seg[:stem_end], year, num, counter, imgdir, stem_inline)
    stem = normalize_pre(stem)
    stem_html = squish(sanitize(stem))
    stem_html = fold_newlines_outside_pre(stem_html)
    stem_html = restore_inline(stem_html, stem_inline)

    solution = ""
    sol_inline = []
    if sol_start is not None:
        ex = seg[sol_start:sol_end]
        ex = re.sub(r"<strong>\s*正确答案\s*:.*?</strong>", "", ex, flags=re.S | re.I)
        ex, counter = mask_figures(ex, year, num, counter, imgdir, sol_inline)
        ex = normalize_pre(ex)
        ex = ex.replace("<br/>", "<br>").replace("<br />", "<br>")
        solution = squish(sanitize(ex))
        solution = fold_newlines_outside_pre(solution)
        solution = restore_inline(solution, sol_inline)

    # 6) 选项规范化：A/B/C/D 前缀
    letter = "ABCD"
    clean_opts = []
    for i, o in enumerate(options):
        o = sanitize(o)
        o = squish(o)
        if re.match(r"^[A-Da-d][.、．:：]\s*", o):
            o = re.sub(r"^[A-Da-d][.、．:：]\s*", "", o, count=1)
        clean_opts.append(letter[i] + "." + o)

    qtype = "选择题" if num <= 40 else "大题"
    return {
        "id": f"{year}-{num:02d}",
        "year": year,
        "num": num,
        "type": qtype,
        "score": 2 if qtype == "选择题" else None,
        "part": part,
        "question": stem_html,
        "options": clean_opts,
        "answer": ans,
        "solution": solution,
        "source": f"csgraduates.com 408 历年真题 · {year}",
    }


# ------------------------------------------------------------- 整年 ----
def parse_year(year, html_doc):
    anchors = h4_subject_anchors(html_doc)
    if len(anchors) < 4:
        print(f"  !! 只找到 {len(anchors)} 个科目分段，请人工检查页面结构")
    imgdir = os.path.join(IMG_ROOT, str(year))
    os.makedirs(imgdir, exist_ok=True)

    questions = []
    num = 0
    for name, h4_end in anchors:
        part = next((p for keys, p in PART_MAP if any(k in name for k in keys)), None)
        if part is None:
            continue
        nxt = min([e for _, e in anchors if e > h4_end] or [len(html_doc)])
        h5s = h5_positions(html_doc, h4_end, nxt)
        for i, (s, e) in enumerate(h5s):
            qs = qe = None
            cls = html_doc.find("</h5>", e)          # h5 标题内文本（题号）不属于题干
            qs = cls + len("</h5>") if cls != -1 else e
            qe = (h5s[i + 1][0] if i + 1 < len(h5s) else nxt)
            seg = html_doc[qs:qe]
            num += 1
            questions.append(extract_question(year, num, part, seg, imgdir))
    return questions


def write_js(year, questions, outpath):
    header = (
        "// 408 统考真题全卷数据（%d 年，共 %d 题）——由 _tools/scrape_zhenti.py 自动生成\n"
        "// 数据源：https://www.csgraduates.com/study_methods/408quiz/%d/ （学习交流用途）\n"
        "// 说明：question/solution 为 HTML；附图存放于 408/imgs/zhenti/%d/，正文以相对 img 路径引用。\n"
        "window.ZHENTI_DATA = window.ZHENTI_DATA || {};\n" % (year, len(questions), year, year)
    )
    # JSON 直接是合法 JS 对象字面量
    body = json.dumps(questions, ensure_ascii=False, indent=1)
    body = body.replace("</", "<\\/")  # 防止 </script> 提前闭合
    with open(outpath, "w", encoding="utf-8") as f:
        f.write(header + f"window.ZHENTI_DATA[{year}] = {body};\n")
    print(f"  [OK] 已写出 {outpath}")


def check_svgs(year):
    d = os.path.join(IMG_ROOT, str(year))
    bad = []
    if os.path.isdir(d):
        for fn in os.listdir(d):
            if not fn.lower().endswith(".svg"):
                continue
            with open(os.path.join(d, fn), encoding="utf-8") as f:
                if not _svg_ok(f.read()):
                    bad.append(fn)
    return bad


def main():
    years = [int(x) for x in sys.argv[1:]] or [2024, 2026]
    for year in years:
        print(f"== 解析 {year} 年 ==")
        doc = fetch(year)
        qs = parse_year(year, doc)
        if not qs:
            print(f"  [!!] {year} 解析为空，中止")
            continue
        print(f"  题数: {len(qs)}")
        print("  板块:", dict(Counter(q['part'] for q in qs)))
        print("  题型:", dict(Counter(q['type'] for q in qs)))
        no_ans = [q['num'] for q in qs if q['type'] == '选择题' and not q['answer']]
        no_opt = [q['num'] for q in qs if q['type'] == '选择题' and len(q['options']) != 4]
        empty_q = [q['num'] for q in qs if len(q['question']) < 8]
        no_sol = [q['num'] for q in qs if len(q['solution']) < 5]
        print("  选择题缺答案:", no_ans or "无")
        print("  选择题选项≠4:", no_opt or "无")
        print("  题干过短:", empty_q or "无")
        print("  解析为空:", no_sol or "无")
        figs = sum(1 for d in os.listdir(os.path.join(IMG_ROOT, str(year))))
        print(f"  图文件数: {figs}")
        bad_svg = check_svgs(year)
        print("  SVG 非法:", bad_svg or "无")
        if qs:
            s = qs[0]
            print(f"  [样题 {s['num']}] part={s['part']} 题干前80字: {s['question'][:80]!r}")
        write_js(year, qs, os.path.join(REPO_408, "chapters", f"zhenti_full_{year}.js"))


if __name__ == "__main__":
    main()
