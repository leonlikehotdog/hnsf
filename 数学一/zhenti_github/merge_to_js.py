"""
合并 zhenti_parsed.json → zhenti_data.js
保留现有 2021-2025 的高质量题解，补 2009-2020 题目
"""
import json
import re
from pathlib import Path

PARSE_JSON = Path(__file__).parent / "zhenti_parsed.json"
DATA_JS = Path(__file__).parent.parent / "chapters" / "zhenti_data.js"


def parse_existing_js():
    """提取现有 zhenti_data.js 中 2021-2025 的高质量题"""
    text = DATA_JS.read_text(encoding="utf-8")
    # 找 window.ZHENTI_DATA[year] = [ ... ]; 块
    result = {}
    for m in re.finditer(r"window\.ZHENTI_DATA\[(\d{4})\]\s*=\s*\[", text):
        year = int(m.group(1))
        start = m.end()
        # 找匹配的 ]
        depth = 1
        i = start
        while i < len(text) and depth > 0:
            if text[i] == '[':
                depth += 1
            elif text[i] == ']':
                depth -= 1
            i += 1
        block = text[start:i-1]
        try:
            result[year] = json.loads("[" + block + "]")
        except Exception as e:
            print(f"  parse {year} failed: {e}")
    return result


def main():
    parsed = json.loads(PARSE_JSON.read_text(encoding="utf-8"))
    by_year = {q["year"]: [] for q in parsed["questions"]}
    for q in parsed["questions"]:
        by_year[q["year"]].append(q)

    # 现有 2021-2025 高质量题
    existing = parse_existing_js()
    print(f"现有高质量题: {sorted(existing.keys())} 共 {sum(len(v) for v in existing.values())} 题")

    # 合并：2021-2025 用现有，2009-2020 用 parsed
    merged = {}
    for year in range(2009, 2026):
        if year in existing:
            # 用现有 + parsed 中缺的（即补充题目）
            existing_ids = {q["id"] for q in existing[year]}
            extra = [q for q in by_year.get(year, []) if q["id"] not in existing_ids]
            merged[year] = existing[year] + extra
        else:
            merged[year] = by_year.get(year, [])

    # 输出新版 zhenti_data.js
    lines = [
        "/**",
        " * 考研数学一 · 真题库（2009-2025）",
        " * - 2021-2025：保留原有高质量题解（含完整 solution 步骤）",
        " * - 2009-2020、2025：自动解析版（题目 + 知识点 + 章节映射）",
        " * - 知识点 ID 体系：ch01_高数 / ch02_微分 / ... GS.1.5 / XD.10.3 / GL.16.2",
        " */",
        "",
        "window.ZHENTI_DATA = window.ZHENTI_DATA || {};",
        "",
    ]
    for year in sorted(merged.keys()):
        items = merged[year]
        if not items:
            continue
        # 计算该年的章节/难度分布
        lines.append(f"// ===== {year} 年 ({len(items)} 题) =====")
        lines.append(f"window.ZHENTI_DATA[{year}] = {json.dumps(items, ensure_ascii=False, indent=2)};")
        lines.append("")

    DATA_JS.write_text("\n".join(lines), encoding="utf-8")
    print(f"✓ 合并完成 → {DATA_JS}")
    print(f"  年份: {sorted(merged.keys())}")
    print(f"  各年题数: {[(y, len(v)) for y, v in sorted(merged.items())]}")


if __name__ == "__main__":
    main()
