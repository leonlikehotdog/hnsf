"""
Verify 2022 真题 questions render correctly.

Steps:
1. Navigate to http://127.0.0.1:8080/#zhenti and wait for data load.
2. Click the "近5年真题精练" link (URL hash #zhenti should already trigger it; verify).
3. Click the "2022" filter pill.
4. Verify 22 questions render.
5. Click first 2022 question -> verify text starts with "lim_{x→1} f(x)/ln(x) = 1".
6. Click sixth 2022 question -> verify matrix rank / 分块矩阵 content.
7. Click 11th question (填空题) -> verify answer "1/9" is shown in the answer panel.
8. Take screenshot -> 2022-fixed.png.
"""

from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8080/#zhenti"
SCREENSHOT = "2022-fixed.png"


def norm(s):
    return " ".join(s.split())


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
        page.goto(URL, wait_until="domcontentloaded")
        page.wait_for_load_state("networkidle")
        # Allow time for data load + KaTeX
        page.wait_for_timeout(5000)

        # If zhenti not yet loaded, click the link
        zhenti_link = page.locator('a[data-target="zhenti"]').first
        if zhenti_link.count() and not page.locator("#zhentiContentArea").count():
            zhenti_link.click()
            page.wait_for_timeout(2000)

        # Wait for content area and year filter pills to render
        page.wait_for_selector("#zhentiContentArea", timeout=15000)
        page.wait_for_selector("#filterYear .filter-pill", timeout=15000)
        # Wait for the 2022 pill to actually appear (data load)
        page.wait_for_selector("#filterYear .filter-pill[data-year='2022']", timeout=15000)
        # Wait for at least one question card to render after filter
        page.wait_for_timeout(8000)

        # ---- Step 3: click "2022" filter pill ----
        pill_2022 = page.locator("#filterYear .filter-pill[data-year='2022']").first
        pill_count_before = page.locator("#filterYear .filter-pill").count()
        print(f"FILTER_PILLS_TOTAL={pill_count_before}")
        pill_text = norm(pill_2022.inner_text())
        print(f"PILL_2022_TEXT={pill_text!r}")
        pill_2022.click()
        page.wait_for_timeout(8000)  # wait for re-render

        # ---- Step 4: count questions ----
        stats_locator = page.locator(".zhenti-stats").first
        stats_text = norm(stats_locator.inner_text()) if stats_locator.count() else ""
        print(f"STATS_TEXT={stats_text!r}")

        cards = page.locator(".question-card")
        total_cards = cards.count()
        print(f"QUESTION_CARDS_COUNT={total_cards}")

        # Collect qnum for each card
        qnums = []
        for i in range(total_cards):
            txt = norm(cards.nth(i).inner_text())
            # Extract qnum like "一(1)" or "二(11)"
            import re
            m = re.search(r"([一二三])\((\d+)\)", txt)
            qnum = m.group(0) if m else f"?{i}"
            qnums.append(qnum)
        print(f"QNums={qnums}")

        # ---- Step 5: click FIRST 2022 question, verify content ----
        print("\n--- Step 5: First question ---")
        cards.nth(0).click()
        page.wait_for_timeout(1500)
        modal = page.locator("#questionModal")
        print(f"MODAL_OPEN={not modal.get_attribute('hidden') == 'true' if modal.count() else False}")
        modal_title = norm(page.locator("#questionModalTitle").inner_text())
        modal_body = page.locator("#questionModalBody")
        body_text = norm(modal_body.inner_text()) if modal_body.count() else ""
        print(f"MODAL_TITLE={modal_title!r}")
        # first 250 chars
        print(f"Q1_BODY_HEAD={body_text[:400]!r}")

        # Check first question starts with the expected content
        q1_ok = False
        # The KaTeX may render formula. Look for raw or rendered text.
        for marker in ["lim_{x", "limx", "lnx", "ln x", "lim", "f(x)", "f x"]:
            if marker in body_text:
                q1_ok = True
                break
        # Also check raw HTML in modal body for the LaTeX text
        modal_html = modal_body.inner_html() if modal_body.count() else ""
        q1_raw_ok = "\\\\frac" in modal_html or "\\frac" in modal_html or "lim_{x" in modal_html
        print(f"Q1_TEXT_RENDERED_OK={q1_ok}  Q1_HTML_HAS_LATEX={q1_raw_ok}")

        # close modal
        page.locator("#questionModalClose").click()
        page.wait_for_timeout(800)

        # ---- Step 6: click SIXTH 2022 question, verify 分块矩阵 ----
        print("\n--- Step 6: Sixth question ---")
        cards.nth(5).click()
        page.wait_for_timeout(1500)
        modal_body = page.locator("#questionModalBody")
        body_text = norm(modal_body.inner_text()) if modal_body.count() else ""
        print(f"Q6_BODY_HEAD={body_text[:400]!r}")

        # Check for 分块矩阵 or matrix content
        q6_ok = ("分块矩阵" in body_text or "block matrix" in body_text.lower()
                 or "\\begin{array}" in (modal_body.inner_html() if modal_body.count() else "")
                 or "A & O" in body_text or "A B" in body_text or "E & A" in body_text
                 or "AB & B" in body_text)
        # Also check that there's a tag for block matrix (we know it from data)
        tags_text = ""
        kp_tag = page.locator("#questionModalBody .kp-badge")
        if kp_tag.count():
            tags_text = " ".join(norm(kp_tag.nth(i).inner_text()) for i in range(kp_tag.count()))
            print(f"Q6_KP_BADGES={tags_text}")
        q6_ok2 = "分块矩阵" in tags_text
        print(f"Q6_TEXT_HAS_MATRIX={q6_ok}  Q6_KP_HAS_BLOCK_MATRIX={q6_ok2}")

        # close modal
        page.locator("#questionModalClose").click()
        page.wait_for_timeout(800)

        # ---- Step 7: click 11th question, verify answer "1/9" ----
        print("\n--- Step 7: Eleventh question ---")
        # 11th question is index 10
        cards.nth(10).click()
        page.wait_for_timeout(1500)
        modal_body = page.locator("#questionModalBody")
        # Expand the 【答案】 details
        answer_details = page.locator("#questionModalBody details.q-collapse-answer")
        if answer_details.count():
            details_summary = answer_details.locator("summary").first
            # check if already open
            is_open = answer_details.first.evaluate("e => e.open")
            print(f"ANSWER_OPEN_INITIAL={is_open}")
            if not is_open:
                details_summary.click()
                page.wait_for_timeout(500)
            is_open2 = answer_details.first.evaluate("e => e.open")
            print(f"ANSWER_OPEN_AFTER_CLICK={is_open2}")
            answer_text = norm(answer_details.first.inner_text())
            print(f"ANSWER_TEXT={answer_text!r}")
        else:
            answer_text = ""
            print("ANSWER_NOT_FOUND")

        # Check for 1/9
        answer_ok = ("1/9" in answer_text or "frac{1}{9}" in answer_text
                     or "1 / 9" in answer_text or "\\frac{1}{9}" in answer_text)
        # Also verify it's a 填空题 (fill-in question)
        modal_title = norm(page.locator("#questionModalTitle").inner_text())
        print(f"Q11_MODAL_TITLE={modal_title!r}")
        is_fill = "填空题" in modal_title
        print(f"Q11_IS_FILL_BLANK={is_fill}  ANSWER_1_OVER_9={answer_ok}")

        # ---- Step 9: take screenshot ----
        page.locator("#questionModalClose").click()
        page.wait_for_timeout(500)
        page.screenshot(path=SCREENSHOT, full_page=True)
        print(f"\nSCREENSHOT_SAVED={SCREENSHOT}")

        browser.close()


if __name__ == "__main__":
    main()
