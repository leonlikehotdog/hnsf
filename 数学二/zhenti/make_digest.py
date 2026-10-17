# -*- coding: utf-8 -*-
"""导出紧凑题录 digest.txt，供人工/模型逐题归类。"""
import json, re, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

def cond(s, n):
    if not s:
        return ""
    s = re.sub(r"\\left|\\right|\\!|\\,|\\;|\\ ", "", s)
    s = re.sub(r"\\mathrm\{([^}]*)\}", r"\1", s)
    s = re.sub(r"\\text\{([^}]*)\}", r"\1", s)
    s = re.sub(r"\\dfrac|\\tfrac", r"\\frac", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()[:n]

d = json.load(open(HERE / "zhenti_classified.json", encoding="utf-8"))
lines = []
for i, q in enumerate(d["questions"], 1):
    opt = " ᐸ" + " ᐧ ".join(cond(o, 34) for o in (q["options"] or [])) + "ᐳ" if q["options"] else ""
    kp = (" 〖KP:" + cond(q.get("kp", ""), 90) + "〗") if q.get("kp") else ""
    lines.append(f"{i:>3} {q['year']}-{q['num']:<2} {q['type']} | {cond(q['stem'], 165)}{opt}{kp}")
open(HERE / "digest.txt", "w", encoding="utf-8").write("\n".join(lines))
print(f"写 digest.txt，共 {len(lines)} 行")
