# -*- coding: utf-8 -*-
"""
从「知识点版」2020–2026 抽取每题的知识点清单，用于真题归类。
输出 zhenti_kp.json : {"YYYY-NUM": "知识点1；知识点2；..."}
"""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "kysx2-zt" / "知识点版"
OUT = HERE / "zhenti_kp.json"

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

HEAD = re.compile(r"(?m)^(#{2,4})\s+(.*)$")


def main():
    out = {}
    for fp in sorted(SRC.glob("*.md")):
        m = re.match(r"(\d{4})", fp.name)
        if not m:
            continue
        year = int(m.group(1))
        text = fp.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n")
        hs = [(x.start(), x.end(), len(x.group(1)), x.group(2).strip()) for x in HEAD.finditer(text)]
        # 题号标题（兼容 '1' / '1.' / '第 1 题' / '（1）'）
        qidx = []
        for i, h in enumerate(hs):
            if re.match(r"^\s*(?:第\s*)?\d{1,2}\s*(?:题|[.．、])?\s*$", h[3]) or \
               re.match(r"^\s*[（(]\s*\d{1,2}\s*[)）]\s*$", h[3]):
                qidx.append(i)
        for k, i in enumerate(qidx):
            end = hs[qidx[k + 1]][0] if k + 1 < len(qidx) else len(text)
            body = text[hs[i][1]:end]
            num = int(re.search(r"\d+", hs[i][3]).group())
            mk = re.search(r"\*\*知识点[：:]\*\*\s*([\s\S]*?)(?=\*\*解析|\*\*答案|\*\*[^知]|$)", body)
            if not mk:
                continue
            items = re.findall(r"(?m)^\s*[-*]\s*(.+)$", mk.group(1))
            if not items:
                items = [mk.group(1).strip()]
            kp = "；".join(re.sub(r"\*+", "", s).strip().rstrip("；;") for s in items if s.strip())
            if kp:
                out[f"{year}-{num}"] = kp
        print(f"{year}: {len([1 for kk in out if kk.startswith(str(year)+'-')])} 条知识点")
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"→ {OUT} 共 {len(out)} 条")


if __name__ == "__main__":
    main()
