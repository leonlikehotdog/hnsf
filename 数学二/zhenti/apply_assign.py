# -*- coding: utf-8 -*-
"""校验 assign.txt 并生成按考点分组的真题库 zhenti_bank.json。"""
import json, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

parsed = json.load(open(HERE / "zhenti_parsed.json", encoding="utf-8"))
kp = json.load(open(HERE / "zhenti_kp.json", encoding="utf-8"))
nodes = json.load(open(HERE / "nodes_extract.json", encoding="utf-8"))["nodes"]
ids = {n["id"] for n in nodes}
YEARS = range(2011, 2027)

qmap = {(q["year"], q["num"]): q for q in parsed["questions"] if q["year"] in YEARS}

primary, extra, bad = {}, [], []
for ln in open(HERE / "assign.txt", encoding="utf-8"):
    ln = ln.strip()
    if not ln or ln.startswith("#"):
        continue
    sec = ln.startswith("@")
    parts = ln.lstrip("@ ").split()
    if len(parts) != 2:
        bad.append(("格式", ln)); continue
    y, n = parts[0].split("-")
    key = (int(y), int(n))
    nid = parts[1]
    if nid not in ids:
        bad.append(("未知节点", ln)); continue
    if key not in qmap:
        bad.append(("未知题号", ln)); continue
    if sec:
        extra.append((key, nid))
    else:
        primary[key] = nid

missing = [k for k in qmap if k not in primary]
if missing:
    print("⚠ 缺主归属：", sorted(missing))

# 组装：node -> [题目]
bank = {n["id"]: [] for n in nodes}
for key, nid in primary.items():
    bank[nid].append(key)
for key, nid in extra:
    if key not in bank[nid]:
        bank[nid].append(key)

dist = {k: len(v) for k, v in bank.items()}
json.dump({"dist": dist}, open(HERE / "_dist.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print(f"主归属 {len(primary)} 题，次要归属 {len(extra)} 条，异常 {len(bad)}")
for b in bad:
    print("  !", b)
print("\n各考点真题数：")
for n in nodes:
    c = dist[n["id"]]
    print(f"  {c:>3}  {n['id']:<16} {n['name']}")
empty = [n["id"] for n in nodes if dist[n["id"]] == 0]
print("\n空考点：", ", ".join(empty) if empty else "无")
