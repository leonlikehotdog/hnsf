"""
考研数学真题 RPA 爬虫 — kmath.cn
=================================
按「知识点」或「试卷」分类下载考研数学真题。

本站是 ASP.NET WebForms，用 __doPostBack 切换内容。
Playwright 以真实浏览器驱动，能正确处理 postback。

用法：
  1. 先改 CONFIG 块的 HEADLESS=False 调试点
  2. 看浏览器确认选择器正确
  3. 改 HEADLESS=True 批量跑

依赖：
  pip install playwright
  python -m playwright install chromium
"""

import os, json, asyncio, re
from pathlib import Path
from datetime import datetime
from playwright.async_api import async_playwright, Page, Browser, TimeoutError as PWTimeout

# ============== 配置 ==============
BASE_URL = "https://kmath.cn/dx"
OUTPUT_DIR = Path(__file__).parent / "kmath_downloads"
PROGRESS_FILE = OUTPUT_DIR / "_progress.json"

HEADLESS = False             # 调试时 False
SLOW_MO = 100
VIEWPORT = {"width": 1400, "height": 900}

# ——— 模式选择 ———
# "paper"  = 按试卷刷题（历年真题 → 数学一 → 选年份卷子）
# "point"  = 按知识点刷题（数学一 → 选章节 → 刷题）
MODE = "point"

# ——— 按知识点 ———
KNOWLEDGE_POINTS = [
    # 高等数学
    "01.函数、极限、连续",
    "02.中值定理证明",
    "03.导数与微分",
    "04.定积分与不定积分",
    "05.空间向量与空间曲线",
    "06.多元函数微分学",
    "07.多元函数积分学",
    "08.无穷级数",
    "09.微分方程",
    # 线性代数
    "01.行列式",
    "02.矩阵",
    "03.线性相关与向量空间",
    "04.线性方程组",
    "05.特征值与特征向量",
    "06.线性空间",
    "07.二次型与正定型",
    # 概率论与数理统计
    "01.随机事件极其概率",
    "02.一维随机变量及其分布",
    "03.二维随机变量及其分布",
    "04.数字特征",
    "05.大数定律与中心极限定理",
    "06.数理统计",
    "07.参数估计",
    "08.假设检验",
]

# ——— 按试卷 ———
# Step1: "历年真题" 或 "模拟试卷"
PAPER_TYPE = "历年真题"
SUBJECT = "考研数学一"
# 具体年份试卷 (填 Exam_By_Paper.aspx 页面的 dropdown 选项文本)
PAPER_YEARS = []   # 空 = 自动列出所有可选年份

# ============== 主类 ==============
class KmathCrawler:
    def __init__(self):
        self.results: dict = {}
        self.failed:   list = []
        self.playwright = None
        self.browser: Browser = None
        self.page: Page = None
        self.question_count = 0

    async def start(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=HEADLESS, slow_mo=SLOW_MO,
            args=["--disable-blink-features=AutomationControlled"],
        )
        ctx = await self.browser.new_context(
            viewport=VIEWPORT,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
            locale="zh-CN",
        )
        self.page = await ctx.new_page()

    async def stop(self):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

    async def shot(self, name):
        try:
            p = OUTPUT_DIR / f"_debug_{name}.png"
            p.parent.mkdir(parents=True, exist_ok=True)
            await self.page.screenshot(path=str(p), full_page=True)
        except Exception:
            pass

    async def goto(self, path: str):
        url = f"{BASE_URL}/{path}"
        print(f"\n[·] 打开 {url}")
        try:
            await self.page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await self.page.wait_for_timeout(2000)
        except PWTimeout:
            print(f"  [!] 超时，继续...")
        await self.shot("page")

    async def click_link(self, text: str, label: str, timeout: int = 8000) -> bool:
        """点击包含指定文本的 <a> 或任何可点元素"""
        strategies = [
            f"a:has-text('{text}')",
            f"text='{text}'",
            f"span:has-text('{text}')",
            f"li:has-text('{text}')",
            f"div:has-text('{text}')",
        ]
        for sel in strategies:
            try:
                el = await self.page.query_selector(sel)
                if el and await el.is_visible():
                    await el.scroll_into_view_if_needed()
                    await el.click(timeout=timeout)
                    await self.page.wait_for_timeout(1500)
                    print(f"  [✓] 点击 {label}")
                    return True
            except Exception:
                continue
        print(f"  [✗] 找不到 {label} ({text})")
        return False

    async def click_subject(self, subject: str = "考研数学一"):
        """Step1: 选择科目"""
        return await self.click_link(subject, f"科目={subject}")

    async def click_point(self, point_name: str):
        """Step2: 选择知识点"""
        return await self.click_link(point_name, f"知识点={point_name}")

    async def click_start(self):
        """点击「开始刷题」按钮"""
        return await self.click_link("开始刷题", "开始刷题")

    async def extract_page_questions(self) -> list:
        """
        从当前页面提取题目。
        题目在 ASP.NET 的 postback 后以列表形式展示。
        典型结构：
          .question-item 或 table 行
          含题干、选项、答案、解析区域
        """
        questions = []
        await self.page.wait_for_timeout(2000)

        # 尝试多种选择器
        card_selectors = [
            ".question-item",
            ".exam-question",
            ".question-card",
            "table.question-table tr.question-row",
            "[class*='question']",
            "li.question",
        ]
        cards = []
        for sel in card_selectors:
            cards = await self.page.query_selector_all(sel)
            if cards:
                print(f"  [i] 找到卡片选择器: {sel}, {len(cards)} 题")
                break

        if not cards:
            # 兜底: 整页文本
            print("  [!] 没找到题目卡片，抓整页文字")
            txt = await self.page.inner_text("body")
            return [{"raw": txt[:30000]}] if txt.strip() else []

        for idx, card in enumerate(cards, 1):
            q = {"index": idx}
            try:
                q["question"] = (await card.inner_text()).strip()
            except:
                q["question"] = ""

            # 尝试分离题干/答案/解析
            for field, sel in [
                ("answer",   ".answer, .correct, .correct-answer, .answer-text"),
                ("analysis", ".analysis, .solution, .explanation, .parse, .jiexi, .detail"),
            ]:
                try:
                    el = await card.query_selector(sel)
                    if el:
                        q[field] = (await el.inner_text()).strip()
                except Exception:
                    pass

            questions.append(q)

        return questions

    async def try_next_page(self) -> bool:
        """尝试翻页 (ASP.NET 分页)"""
        for sel in [
            "a:has-text('下一页')",
            "a:has-text('下一页 ›')",
            ".pagination a.next",
            ".pager a:has-text('>')",
        ]:
            try:
                btn = await self.page.query_selector(sel)
                if btn and await btn.is_visible():
                    await btn.click()
                    await self.page.wait_for_timeout(2000)
                    return True
            except Exception:
                continue
        return False

    def save(self, name="kmath"):
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        # JSON
        path = OUTPUT_DIR / f"{name}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        print(f"  [✓] JSON: {path}")

        # Markdown 汇总
        md_path = OUTPUT_DIR / f"{name}.md"
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(f"# 考研数学真题 (kmath.cn)\n\n")
            f.write(f"下载时间: {datetime.now()}\n")
            f.write(f"模式: {MODE}\n")
            f.write(f"题目总数: {self.question_count}\n\n")
            f.write("---\n\n")
            for section_key, section in self.results.items():
                f.write(f"## {section.get('label', section_key)}\n\n")
                for sub_key, sub in section.get("items", {}).items():
                    qs = sub.get("questions", [])
                    f.write(f"### {sub.get('label', sub_key)} ({len(qs)} 题)\n\n")
                    for i, q in enumerate(qs, 1):
                        f.write(f"#### 第 {i} 题\n\n")
                        txt = q.get("question", q.get("raw", ""))
                        f.write(f"{txt}\n\n")
                        if "answer" in q:
                            f.write(f"**答案**: {q['answer']}\n\n")
                        if "analysis" in q:
                            f.write(f"**解析**: {q['analysis']}\n\n")
                        f.write("---\n\n")
        print(f"  [✓] MD: {md_path}")

    def save_progress(self):
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump({"results": self.results, "failed": self.failed}, f, ensure_ascii=False, indent=2)

    # ========= 模式: 按知识点刷题 =========
    async def run_point_mode(self):
        print("\n========== 模式: 按知识点刷题 ==========")
        await self.goto("Exam_By_Point.aspx")

        if not await self.click_subject("考研数学一"):
            self.failed.append("点击科目失败")
            return

        for pt in KNOWLEDGE_POINTS:
            print(f"\n--- 知识点: {pt} ---")
            # 重新进入页面 (ASP.NET postback 后会回到选择页)
            await self.goto("Exam_By_Point.aspx")
            await self.click_subject("考研数学一")

            if not await self.click_point(pt):
                self.failed.append(f"知识点点不到: {pt}")
                continue

            await self.shot(f"point_{pt[:8]}")
            if not await self.click_start():
                self.failed.append(f"开始刷题点不到: {pt}")
                continue

            # 提取题目 + 翻页
            all_qs = []
            while True:
                qs = await self.extract_page_questions()
                all_qs.extend(qs)
                if not await self.try_next_page():
                    break

            self.results.setdefault("by_point", {"label": "按知识点", "items": {}})
            self.results["by_point"]["items"][pt] = {
                "label": pt, "count": len(all_qs), "questions": all_qs
            }
            self.question_count += len(all_qs)
            print(f"  [i] 共 {len(all_qs)} 题")
            self.save_progress()
            self.save()

    # ========= 模式: 按试卷刷题 =========
    async def run_paper_mode(self):
        print("\n========== 模式: 按试卷刷题 ==========")
        await self.goto("Exam_By_Paper.aspx")

        # Step1: 历年真题
        await self.click_link(PAPER_TYPE, f"试卷类型={PAPER_TYPE}")
        # Step2: 科目
        await self.click_link(SUBJECT, f"科目={SUBJECT}")

        # Step3: 选试卷 — 列举下拉/列表
        paper_opts = await self.page.query_selector_all("select option, .paper-list a, [class*='paper'] a")
        if not paper_opts:
            # 可能是 dropdown，先截图
            await self.shot("paper_list")
            print("  [i] 没找到试卷列表，截图保存了")
            # 尝试抓页面所有链接
            links = await self.page.query_selector_all("a")
            paper_candidates = []
            for lnk in links:
                txt = (await lnk.inner_text()).strip()
                if re.search(r"\d{4}", txt):  # 包含年份
                    paper_candidates.append(txt)
            if paper_candidates:
                print(f"  候选试卷: {paper_candidates[:10]}")

        selected = PAPER_YEARS or ["2024"]  # 默认 2024
        for yr in selected:
            await self.click_link(yr, f"试卷={yr}")
            await self.click_start()
            qs = await self.extract_page_questions()
            self.results.setdefault("by_paper", {"label": "按试卷", "items": {}})
            self.results["by_paper"]["items"][yr] = {
                "label": f"{PAPER_TYPE}-{SUBJECT}-{yr}",
                "count": len(qs), "questions": qs
            }
            self.question_count += len(qs)
            print(f"  {yr}: {len(qs)} 题")
            self.save_progress()

    # ========= 主入口 =========
    async def run(self):
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        await self.start()
        try:
            if MODE == "point":
                await self.run_point_mode()
            else:
                await self.run_paper_mode()
        except Exception as e:
            print(f"\n[!] 致命错误: {e}")
            await self.shot("fatal")
            raise
        finally:
            await self.stop()
            self.save()
            print(f"\n[✓] 完成！共 {self.question_count} 题 → {OUTPUT_DIR}")


async def main():
    c = KmathCrawler()
    await c.run()


if __name__ == "__main__":
    asyncio.run(main())
