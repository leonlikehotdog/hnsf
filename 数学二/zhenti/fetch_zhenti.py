# -*- coding: utf-8 -*-
"""
302 数学二 · 历年真题抓取脚本
================================
来源仓库：https://github.com/zhaokaifengcom/kysx2-zt
  「荒原之梦考研数学」整理的 1987–2026 逐年真题 + 解析（Markdown）。

产出（默认下载到脚本同目录下的 kysx2-zt/）：
  kysx2-zt/刷题版/YYYY-2.md         1987–2026，逐年一份，含题面+答案+解析
  kysx2-zt/知识点版/*.md            2020–2026，按知识点整理版
  kysx2-zt/2026难度对比版/*.md      2026 vs 2024/2025 难度分析

用法：
  python fetch_zhenti.py              # 首次 clone 或增量 git pull
  python fetch_zhenti.py --zip        # 不用 git，直接下 zip 解压（无 git 环境时）
  python fetch_zhenti.py --years 15   # 额外打印「最近 15 年」清单
"""
import argparse, os, re, shutil, subprocess, sys, urllib.request, zipfile, io
from pathlib import Path

# Windows 控制台默认 GBK，避免 ✓ 等字符报 UnicodeEncodeError
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

REPO = "zhaokaifengcom/kysx2-zt"
GIT_URL = f"https://github.com/{REPO}.git"
ZIP_URL = f"https://github.com/{REPO}/archive/refs/heads/main.zip"

HERE = Path(__file__).resolve().parent
DEST = HERE / "kysx2-zt"


def log(*a):
    print(*a, flush=True)


def have_git() -> bool:
    try:
        subprocess.run(["git", "--version"], capture_output=True, check=True)
        return True
    except Exception:
        return False


def via_git() -> None:
    if (DEST / ".git").exists():
        log(f"[·] 已存在，执行 git pull 更新：{DEST}")
        subprocess.run(["git", "-C", str(DEST), "pull", "--ff-only"], check=False)
    else:
        if DEST.exists():
            shutil.rmtree(DEST)
        DEST.parent.mkdir(parents=True, exist_ok=True)
        log(f"[·] git clone --depth 1 → {DEST}")
        subprocess.run(["git", "clone", "--depth", "1", GIT_URL, str(DEST)], check=True)


def via_zip() -> None:
    log(f"[·] 下载 {ZIP_URL}")
    req = urllib.request.Request(ZIP_URL, headers={"User-Agent": "Mozilla/5.0"})
    data = urllib.request.urlopen(req, timeout=120).read()
    log(f"    收到 {len(data)/1024:.0f} KB，解压中…")
    if DEST.exists():
        shutil.rmtree(DEST)
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        tmp = HERE / "_zt_tmp"
        if tmp.exists():
            shutil.rmtree(tmp)
        z.extractall(tmp)
    inner = next(tmp.iterdir())
    inner.rename(DEST)
    shutil.rmtree(tmp, ignore_errors=True)


def _force_rmtree(p: Path) -> None:
    """Windows 上 git 对象文件是只读的，rmtree 需先清只读位。"""
    import stat
    def onerr(func, path, exc):
        try:
            os.chmod(path, stat.S_IWRITE)
            func(path)
        except Exception:
            pass
    shutil.rmtree(p, onerror=onerr)


def normalize() -> None:
    """去掉带 ※ 的装饰目录名，去掉外来 .git，便于本仓库跟踪。"""
    if (DEST / ".git").exists():
        _force_rmtree(DEST / ".git")
    ren = {
        "考研数二真题-※-刷题版": "刷题版",
        "考研数二真题-※※-知识点版": "知识点版",
        "考研数二真题-※-2026难度对比版": "2026难度对比版",
    }
    for old, new in ren.items():
        src, dst = DEST / old, DEST / new
        if src.exists() and not dst.exists():
            src.rename(dst)


def report(show_years: int) -> None:
    shuati = DEST / "刷题版"
    files = sorted(shuati.glob("*.md"), key=lambda p: int(re.search(r"(\d+)", p.name).group(1)))
    years = [int(re.search(r"(\d+)", f.name).group(1)) for f in files]
    log(f"\n[✓] 刷题版：{len(files)} 个年份文件  {years[0]}–{years[-1]}")
    if show_years:
        recent = years[-show_years:]
        log(f"[✓] 最近 {len(recent)} 年：{recent[0]}–{recent[-1]}")
        for y in recent:
            f = shuati / f"{y}-2.md"
            n = len(re.findall(r"(?m)^###\s*[（(]?\d+", f.read_text(encoding="utf-8", errors="replace")))
            log(f"      {y}: {n} 题  ({f.stat().st_size//1024} KB)")
    other = [p.name for p in DEST.iterdir() if p.is_dir() and p.name != "刷题版"]
    if other:
        log(f"[✓] 其他目录：{', '.join(other)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--zip", action="store_true", help="不用 git，直接下 zip")
    ap.add_argument("--years", type=int, default=15, help="打印最近 N 年清单（默认 15）")
    args = ap.parse_args()

    if args.zip or not have_git():
        if not args.zip:
            log("[!] 未检测到 git，自动改用 zip 方式")
        via_zip()
    else:
        via_git()
    normalize()
    report(args.years)


if __name__ == "__main__":
    main()
