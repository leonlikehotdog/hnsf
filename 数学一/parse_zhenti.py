"""
考研数学一 真题解析器 v4
========================
用大标题分块 + 块内找题号
"""
import json
import re
from pathlib import Path
from datetime import datetime

PAPERS_DIR = Path(__file__).parent / "zhenti_github" / "papers"
OUTPUT = Path(__file__).parent / "zhenti_github" / "zhenti_parsed.json"

SOURCES = {
    2025: "2025年数学一真题.md",
    2024: "2024年数学(一)真题及参考答案.md",
    2023: "2023年考研数学(一)真题.md",
    2022: "2022年考研数学(一)真题.md",
    2021: "2021年考研数学(一)真题.md",
    2020: "2020年考研数学(一)真题.md",
    2019: "2019年考研数学(一)真题.md",
    2018: "2018年考研数学(一)真题.md",
    2017: "2017年考研数学(一)真题.md",
    2016: "2016年考研数学(一)真题.md",
    2015: "2015年考研数学(一)真题.md",
    2014: "2014年考研数学(一)真题.md",
    2013: "2013年考研数学(一)真题.md",
    2012: "2012年考研数学(一)真题.md",
    2011: "2011年考研数学(一)真题.md",
    2010: "2010年考研数学(一)真题.md",
    2009: "2009年考研数学(一)真题.md",
}

KNOWLEDGE_KEYWORDS = {
    "GS.1.1": ["数列", "敛散", "单调", "柯西列"],
    "GS.1.2": ["\\lim", "无穷小", "洛必达", "等价无穷小"],
    "GS.1.3": ["极限", "常数", "=", "参数"],
    "GS.1.4": ["无穷小", "高阶", "同阶", "等价"],
    "GS.1.5": ["连续", "间断", "可去", "跳跃"],
    "GS.2.1": ["导数定义", "可导", "导函数"],
    "GS.2.2": ["求导", "链式法则"],
    "GS.2.3": ["切线", "法线", "切平面"],
    "GS.2.4": ["单调", "极值", "最值", "驻点"],
    "GS.2.5": ["凹凸", "拐点", "渐近线"],
    "GS.2.6": ["方程根", "零点", "实根个数"],
    "GS.2.7": ["不等式", "≥", "≤"],
    "GS.2.8": ["拉格朗日", "罗尔", "中值定理", "柯西"],
    "GS.2.9": ["泰勒", "麦克劳林", "展开"],
    "GS.3.1": ["不定积分", "原函数"],
    "GS.3.2": ["定积分", "积分上限"],
    "GS.3.3": ["定积分", "∫_"],
    "GS.3.4": ["变限", "上限函数"],
    "GS.3.5": ["反常积分", "瑕积分"],
    "GS.3.6": ["面积", "体积", "旋转", "弧长"],
    "GS.4.1": ["向量", "方向余弦", "点乘", "叉乘"],
    "GS.5.1": ["偏导", "偏导数"],
    "GS.5.2": ["全微分", "可微"],
    "GS.5.3": ["切平面", "梯度", "曲面"],
    "GS.5.4": ["方向导数", "梯度"],
    "GS.5.5": ["极值", "条件极值", "拉格朗日乘数"],
    "GS.6.1": ["二重积分", "三重积分"],
    "GS.6.2": ["交换积分", "积分次序", "极坐标"],
    "GS.6.3": ["重积分"],
    "GS.6.4": ["质心", "形心", "转动惯量"],
    "GS.6.5": ["第一类曲线积分"],
    "GS.6.6": ["第二类曲线积分", "对坐标的曲线积分"],
    "GS.6.7": ["第一类曲面积分", "对面积的曲面积分"],
    "GS.6.8": ["第二类曲面积分", "对坐标的曲面积分"],
    "GS.6.9": ["旋度", "rot"],
    "GS.7.1": ["级数", "∑_{n=1}", "敛散", "交错级数"],
    "GS.7.2": ["幂级数", "收敛半径", "收敛域"],
    "GS.7.3": ["幂级数", "和函数"],
    "GS.7.4": ["傅里叶", "Fourier"],
    "GS.8.1": ["微分方程", "y'", "一阶"],
    "GS.8.2": ["微分方程", "二阶", "特解", "通解"],
    "GS.8.3": ["微分方程", "应用", "增长率"],
    "XD.9.1": ["行列式", "|A|", "det", "代数余子式"],
    "XD.10.1": ["矩阵", "乘法", "AB"],
    "XD.10.2": ["伴随", "A^{-1}", "可逆"],
    "XD.10.3": ["秩", "r(A)"],
    "XD.10.4": ["初等变换", "初等矩阵"],
    "XD.11.1": ["线性相关", "线性无关", "极大线性"],
    "XD.11.2": ["线性表示", "可由"],
    "XD.11.3": ["内积", "正交", "Schmidt"],
    "XD.12.1": ["方程组", "Ax=b", "无穷多解"],
    "XD.12.2": ["通解", "基础解系", "Ax=0"],
    "XD.12.3": ["同解", "公共解"],
    "XD.13.1": ["特征值", "特征向量", "E-A"],
    "XD.13.2": ["相似", "对角化", "P^{-1}AP"],
    "XD.13.3": ["对称", "正交", "实对称"],
    "XD.14.1": ["二次型", "标准形", "规范形"],
    "XD.14.2": ["正定", "正惯性"],
    "XD.14.3": ["合同", "合同变换"],
    "GL.15.1": ["事件", "A∩B", "A∪B", "A-B", "对立事件"],
    "GL.15.2": ["概率", "P(A)", "P(B)"],
    "GL.16.1": ["分布律", "二项", "泊松"],
    "GL.16.2": ["密度", "f(x)", "正态", "指数", "均匀"],
    "GL.16.3": ["分布函数", "F(x)", "正态分布", "N(0,1)"],
    "GL.17.1": ["二维", "联合", "(X,Y)", "f(x,y)"],
    "GL.17.2": ["边缘", "条件", "f_{X|Y}"],
    "GL.17.3": ["独立", "X与Y独立"],
    "GL.17.4": ["Z=", "X+Y", "max", "min", "X^2"],
    "GL.18.1": ["E(X)", "D(X)", "期望", "方差"],
    "GL.18.2": ["Cov", "相关系数", "ρ"],
    "GL.18.3": ["协方差矩阵", "二阶矩"],
    "GL.19.1": ["切比雪夫", "Chebyshev"],
    "GL.19.2": ["中心极限定理", "棣莫弗"],
    "GL.20.1": ["统计量", "样本均值", "S^2"],
    "GL.20.2": ["估计", "估计量", "无偏估计", "矩估计", "最大似然"],
    "GL.20.3": ["假设检验", "H_0", "H_1", "显著性"],
}


def clean_latex(s):
    if not s:
        return s
    s = re.sub(r"\\\\([a-zA-Z]+)", r"\\\1", s)
    s = re.sub(r"\\\\\(", r"\\(", s)
    s = re.sub(r"\\\\\)", r"\\)", s)
    return s


def match_knowledge(text, options):
    if not text:
        return []
    full = text + " " + " ".join(options or [])
    full = clean_latex(full)
    scores = {}
    for kid, kws in KNOWLEDGE_KEYWORDS.items():
        s = sum(1 for kw in kws if kw in full)
        if s > 0:
            scores[kid] = s
    sorted_kids = sorted(scores.items(), key=lambda x: -x[1])
    return [k for k, _ in sorted_kids[:2]]


def determine_part(kids):
    if not kids:
        return "高数"
    p = kids[0]
    if p.startswith("GS"):
        return "高数"
    if p.startswith("XD"):
        return "线代"
    if p.startswith("GL"):
        return "概率"
    return "高数"


def kid_to_chapter(kids):
    if not kids:
        return None
    k = kids[0]
    m = {
        "GS.1": "ch01", "GS.2": "ch02", "GS.3": "ch03",
        "GS.4": "ch04", "GS.5": "ch05", "GS.6": "ch06",
        "GS.7": "ch07", "GS.8": "ch08",
        "XD.9": "ch09", "XD.10": "ch10", "XD.11": "ch11",
        "XD.12": "ch12", "XD.13": "ch13", "XD.14": "ch14",
        "GL.15": "ch15", "GL.16": "ch16", "GL.17": "ch17",
        "GL.18": "ch18", "GL.19": "ch19", "GL.20": "ch20",
    }
    return m.get(".".join(k.split(".")[:2]), None)


def split_sections(text):
    """按 # 一/二/三/xxx 标题分块"""
    section_pat = re.compile(r"^#\s*[一二三四五六七八九十]、\s*(选择|填空|解答)", re.MULTILINE)
    spans = []
    for m in section_pat.finditer(text):
        spans.append((m.start(), m.end(), m.group(1)))
    # 排序
    spans.sort()
    # 切块
    blocks = []
    for i, (s, e, kind) in enumerate(spans):
        end = spans[i+1][0] if i+1 < len(spans) else len(text)
        blocks.append((kind, text[s:end]))
    return blocks


def find_in_block(block_text, qrange):
    """在块内找题号位置"""
    found = []
    # 模式 A: "(数字)" 后必须是中文/$/（/【/空格后接中文
    for m in re.finditer(r"\((\d{1,2})\)", block_text):
        n = int(m.group(1))
        if n not in qrange:
            continue
        after = block_text[m.end():m.end()+5]
        # 后面必须是空白 + 中文/公式/英文/数字/标点
        if re.match(r"^[\s\u4e00-\u9fff$\\(\[【…]", after):
            found.append((m.start(), n))
    # 模式 B: "【数字】"  2024 格式
    for m in re.finditer(r"^【(\d{1,2})】", block_text, re.MULTILINE):
        n = int(m.group(1))
        if n in qrange:
            found.append((m.start(), n))
    # 模式 C: 行首 "数字." 或 "数字、" 2021+
    for m in re.finditer(r"(?m)^(\d{1,2})[\.、]\s+", block_text):
        n = int(m.group(1))
        if n in qrange:
            found.append((m.start(), n))

    # 去重
    found.sort()
    picked = []
    seen_pos = []
    seen_nums = set()
    for pos, n in found:
        if n in seen_nums:
            continue
        if any(abs(pos - p) < 30 for p in seen_pos):
            continue
        # 排除选项 A B C D 误中标
        before = block_text[max(0, pos - 30):pos]
        if re.search(r"\([A-D]\)\s*$", before):
            continue
        picked.append((pos, n))
        seen_pos.append(pos)
        seen_nums.add(n)
    picked.sort()
    return picked


def parse_md(filepath, year):
    text = filepath.read_text(encoding="utf-8", errors="replace")
    text = clean_latex(text)

    # 期望题号
    if year >= 2021:
        q_ranges = {"选择": set(range(1, 11)), "填空": set(range(11, 17)), "解答": set(range(17, 23))}
    else:
        q_ranges = {"选择": set(range(1, 9)), "填空": set(range(9, 15)), "解答": set(range(15, 24))}

    blocks = split_sections(text)
    items = []
    for kind, block_text in blocks:
        qrange = q_ranges.get(kind, set(range(1, 24)))
        positions = find_in_block(block_text, qrange)
        for i, (pos, num) in enumerate(positions):
            text_end = positions[i+1][0] if i+1 < len(positions) else len(block_text)
            section_text = block_text[pos:text_end].strip()
            section_text = re.sub(r"\n{3,}", "\n\n", section_text)

            qtype = {"选择": "选择题", "填空": "填空题", "解答": "解答题"}[kind]
            score = 5 if year >= 2021 else 4
            if qtype == "解答题":
                score = 12 if num >= 21 else 10

            if qtype == "选择题":
                difficulty = min(5, 2 + (num // 3))
            elif qtype == "填空题":
                difficulty = min(5, 2 + ((num - 11) // 2))
            else:
                difficulty = min(5, 3 + ((num - 17) // 2))

            q_text = section_text
            q_text = re.sub(r"^\(\d{1,2}\)\s*", "", q_text, count=1)
            q_text = re.sub(r"^【\d{1,2}】\s*", "", q_text, count=1)
            q_text = re.sub(r"^\d{1,2}[\.、]\s*", "", q_text, count=1)

            m = re.search(r"\n\s*\([A-D]\)", q_text)
            if not m:
                m = re.search(r"\n\s*\(?[A-D][\.．]\s?", q_text)
            if m:
                question_body = q_text[:m.start()].strip()
                options_text = q_text[m.start():]
            else:
                question_body = q_text
                options_text = ""

            opts = []
            for opt_m in re.finditer(r"([A-D])[\.\)]\s*([^A-D\n]{2,})", options_text):
                t = opt_m.group(2).strip()
                if len(t) > 200:
                    t = t[:200] + "..."
                opts.append(f"{opt_m.group(1)}. {t}")

            kids = match_knowledge(question_body, opts)
            part = determine_part(kids)
            chapter = kid_to_chapter(kids)

            items.append({
                "id": f"{year}-{num:02d}",
                "year": year,
                "num": f"{'一' if qtype == '选择题' else '二' if qtype == '填空题' else '三'}({num})",
                "qnum": num,
                "type": qtype,
                "score": score,
                "part": part,
                "difficulty": difficulty,
                "knowledgeIds": kids,
                "chapter": chapter,
                "question": clean_latex(question_body),
                "options": [clean_latex(o) for o in opts],
                "answer": "",
                "analysis": "",
            })

    return items


def main():
    all_questions = []
    for year, fname in sorted(SOURCES.items()):
        fp = PAPERS_DIR / fname
        if not fp.exists():
            print(f"  ! 跳过 {year}: {fname}")
            continue
        items = parse_md(fp, year)
        print(f"  {year}: {len(items)} 题")
        all_questions.extend(items)

    by_year = {}
    for q in all_questions:
        by_year[q["year"]] = by_year.get(q["year"], 0) + 1

    kp_count = {}
    for q in all_questions:
        for k in q["knowledgeIds"]:
            kp_count[k] = kp_count.get(k, 0) + 1

    output = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "total": len(all_questions),
            "by_year": by_year,
            "knowledge_count": kp_count,
        },
        "questions": all_questions,
    }

    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n✓ 共 {len(all_questions)} 题 → {OUTPUT}")
    print(f"  by_year: {by_year}")


if __name__ == "__main__":
    main()
