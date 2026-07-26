"""
追加 2009-2020 题目到 zhenti_data.js
保留原有 2021-2025 数据不动
"""
import json
from pathlib import Path

PARSE_JSON = Path(__file__).parent / "zhenti_parsed.json"
DATA_JS = Path(__file__).parent.parent / "chapters" / "zhenti_data.js"

# 2009-2025 全部都用 parsed 的（因为 2021-2025 原 JS 解析器解析不了）
# 解析现有数据(2021-2025)用正则扫描
import re

def extract_existing_years():
    """扫描出原 JS 里有哪几个年份"""
    text = DATA_JS.read_text(encoding="utf-8")
    years = []
    for m in re.finditer(r"window\.ZHENTI_DATA\[(\d{4})\]", text):
        years.append(int(m.group(1)))
    return sorted(set(years))


def main():
    existing = extract_existing_years()
    print(f"现有 JS 中年份: {existing}")

    parsed = json.loads(PARSE_JSON.read_text(encoding="utf-8"))
    by_year = {}
    for q in parsed["questions"]:
        by_year.setdefault(q["year"], []).append(q)

    # 准备追加内容
    text = DATA_JS.read_text(encoding="utf-8")
    # 找末尾 }; 之后插入
    end_marker = text.rfind("};")
    if end_marker == -1:
        end_marker = text.rfind("})")

    append = ["", "", "// ============ 以下为 2009-2020 自动解析数据 ============"]
    # 缺失的年份
    need = [y for y in range(2009, 2026) if y not in existing]
    print(f"需追加年份: {need}")
    for year in need:
        items = by_year.get(year, [])
        if not items:
            continue
        append.append("")
        append.append(f"// ===== {year} 年 ({len(items)} 题) =====")
        append.append(f"window.ZHENTI_DATA[{year}] = {json.dumps(items, ensure_ascii=False, indent=2)};")

    new_text = text[:end_marker+2] + "\n".join(append) + "\n" + text[end_marker+2:]
    DATA_JS.write_text(new_text, encoding="utf-8")
    print(f"✓ 已追加 → {DATA_JS}")
    print(f"  共 字节数: {len(new_text)}")


if __name__ == "__main__":
    main()
