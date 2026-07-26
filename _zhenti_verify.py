"""
Verify refactored zhenti page.
- Navigate to http://127.0.0.1:8080/
- Click zhenti sidebar link
- Verify counts (308 questions, 17 years, knowledge tree, thumb strip)
- Click 2023 filter, verify 22 questions
- Click 2023 一(1), verify modal answer B
- Click 2023 一(6), verify matrix display
- Capture screenshots
"""

import json
import os
import re
import sys
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8080/"
OUT_DIR = r"d:\TraeWorkSpace\hnsf"

results = {
    "console_errors": [],
    "console_warnings": [],
    "console_logs": [],
    "page_errors": [],
    "request_failures": [],
    "year_button_count": None,
    "year_buttons": [],
    "thumb_count": None,
    "knowledge_groups": [],
    "knowledge_children": 0,
    "total_questions": None,
    "year_filter_2023_questions": None,
    "first_question_text": None,
    "first_question_answer": None,
    "first_question_options": [],
    "matrix_modal_options": [],
    "matrix_modal_question": None,
    "matrix_modal_answer": None,
    "matrix_modal_has_br": False,
}


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1600, "height": 1000})
        page = context.new_page()

        # Capture console events
        def on_console(msg):
            text = msg.text
            entry = f"[{msg.type}] {text}"
            if msg.type == "error":
                results["console_errors"].append(text)
            elif msg.type == "warning":
                results["console_warnings"].append(text)
            else:
                results["console_logs"].append(text)

        page.on("console", on_console)
        page.on("pageerror", lambda err: results["page_errors"].append(str(err)))

        def on_request_failed(req):
            results["request_failures"].append({
                "url": req.url,
                "failure": req.failure,
            })

        page.on("requestfailed", on_request_failed)

        # 1. Navigate
        print(f"[step] goto {URL}")
        page.goto(URL, wait_until="networkidle", timeout=60000)
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(800)

        # 2. Click sidebar zhenti link
        print("[step] click sidebar zhenti link")
        # The sidebar item has data-target="zhenti"
        link = page.locator('a[data-target="zhenti"]').first
        link.wait_for(state="visible", timeout=10000)
        link.click()

        # 3. Wait for #zhenti module to appear and data to load
        print("[step] wait for zhenti content")
        page.wait_for_selector('#zhenti', state="attached", timeout=10000)

        # Wait for year buttons to be rendered
        page.wait_for_selector('#filterYear button[data-year="2023"]', timeout=15000)

        # 4. Wait up to 15 seconds for all data to load (check via question count or stat)
        print("[step] wait for data load")
        loaded = False
        for i in range(30):
            # Wait for content area to show stat text with the total
            stat = page.locator('.zhenti-stats').first
            try:
                if stat.is_visible(timeout=500):
                    txt = stat.inner_text()
                    m = re.search(r"(\d+)", txt)
                    if m and int(m.group(1)) > 0:
                        results["total_questions"] = int(m.group(1))
                        loaded = True
                        break
            except Exception:
                pass
            page.wait_for_timeout(500)

        # Extra delay to let everything settle
        page.wait_for_timeout(2000)

        # Also try to read state from window if exposed (best effort)
        try:
            info = page.evaluate("""() => {
                const out = {};
                try {
                    // look for the module's internal state via DOM
                    const stats = document.querySelector('.zhenti-stats');
                    out.statsText = stats ? stats.innerText : null;
                } catch (e) { out.err = String(e); }
                return out;
            }""")
            print(f"[info] stats text: {info}")
        except Exception as e:
            print(f"[warn] stats read failed: {e}")

        # If we couldn't get total from stats, count rendered question cards
        if not results["total_questions"]:
            cards = page.locator('#zhentiContentArea .question-card').count()
            results["total_questions_rendered_cards"] = cards
            print(f"[info] cards in DOM (no filter): {cards}")

        # 5a. Year buttons (should include all years 2009-2025)
        year_buttons = page.locator('#filterYear button').all()
        results["year_button_count"] = len(year_buttons)
        results["year_buttons"] = [b.get_attribute("data-year") for b in year_buttons]
        print(f"[verify] year buttons: {results['year_button_count']} {results['year_buttons']}")

        # 5b. Knowledge tree - count groups
        # KP tree groups: 高等数学/线性代数/概率论
        kt = page.locator('#knowledgeTree .kp-group, #knowledgeTree .kp-root, #knowledgeTree .tree-root, #knowledgeTree > *').all()
        # Try to find group titles
        group_titles = page.locator('#knowledgeTree .kp-group-name, #knowledgeTree .group-name, #knowledgeTree .kp-name').all()
        results["knowledge_groups"] = [el.inner_text().strip() for el in group_titles]
        if not results["knowledge_groups"]:
            # fallback - get all top-level text
            kt_all = page.locator('#knowledgeTree').first
            txt = kt_all.inner_text() if kt_all.count() else ""
            results["knowledge_tree_text"] = txt[:1000]

        # 5c. Thumb strip
        thumbs = page.locator('#thumbList .thumb-card, #thumbList .thumb-item, #thumbList > *').all()
        results["thumb_count"] = len(thumbs)

        # Take a screenshot of the initial state (before filtering)
        page.screenshot(path=os.path.join(OUT_DIR, "_zhenti_initial.png"), full_page=False)

        # 6. Click 2023 filter
        print("[step] click 2023 filter")
        btn2023 = page.locator('#filterYear button[data-year="2023"]').first
        btn2023.click()
        page.wait_for_timeout(800)

        # Count cards rendered
        cards2023 = page.locator('#zhentiContentArea .question-card').count()
        results["year_filter_2023_questions"] = cards2023
        print(f"[verify] 2023 questions: {cards2023}")

        # Read stat text
        try:
            stat_text = page.locator('.zhenti-stats').first.inner_text()
            results["year_filter_2023_stat"] = stat_text
        except Exception:
            pass

        # Take a screenshot of the full zhenti page with 2023 filtered
        page.screenshot(path=os.path.join(OUT_DIR, "zhenti-2023-final.png"), full_page=True)

        # 7. Click 2023 一(1) and verify modal opens with answer B
        print("[step] click 2023 一(1)")
        # Find the card whose number is "一(1)" and year is 2023
        # Easier: find first .question-card within the year block "2023"
        # The year block contains h3.year-title with "2023 年"
        # Within that, the first .question-card
        first_card = page.locator('.year-block:has(.year-title:text("2023")) .question-card').first
        first_card.scroll_into_view_if_needed()
        first_card.click()
        page.wait_for_selector('#questionModal:not([hidden])', timeout=5000)
        page.wait_for_timeout(1000)  # let KaTeX render

        # Read answer
        try:
            ans_el = page.locator('#questionModalBody .answer-title').first
            results["first_question_answer"] = ans_el.inner_text().strip()
        except Exception as e:
            print(f"[warn] first answer read failed: {e}")

        # Read question text and options
        try:
            qbody = page.locator('#questionModalBody .q-modal-question').first
            results["first_question_text"] = qbody.inner_text()[:200]
        except Exception as e:
            print(f"[warn] first question text read failed: {e}")

        try:
            opts = page.locator('#questionModalBody .modal-opt').all()
            results["first_question_options"] = [o.inner_text().strip() for o in opts]
        except Exception as e:
            print(f"[warn] first options read failed: {e}")

        # Read title to verify it's 一(1)
        title_text = page.locator('#questionModalTitle').first.inner_text()
        results["first_question_title"] = title_text
        print(f"[verify] first question title: {title_text}; answer: {results['first_question_answer']}")

        # Close modal
        page.locator('#questionModalClose').click()
        page.wait_for_selector('#questionModal[hidden]', timeout=3000)
        page.wait_for_timeout(300)

        # 8. Click 2023 一(6) question and verify matrix rendering
        print("[step] click 2023 一(6)")
        # Find card by data-id matching "2023-x-(1)(6)" or similar. Easier: find by q-num
        cards_all = page.locator('.year-block:has(.year-title:text("2023")) .question-card').all()
        target_card = None
        for c in cards_all:
            try:
                num_text = c.locator('.q-num').inner_text().strip()
            except Exception:
                num_text = ""
            if num_text in ("一(6)", "一（6）", "1(6)", "1.（6）", "一(6）"):
                target_card = c
                break

        if target_card is None and cards_all:
            # Fallback: try clicking 6th card
            target_card = cards_all[5] if len(cards_all) >= 6 else cards_all[-1]

        if target_card:
            target_card.scroll_into_view_if_needed()
            target_card.click()
            page.wait_for_selector('#questionModal:not([hidden])', timeout=5000)
            page.wait_for_timeout(1200)  # wait for KaTeX

            # Read question, answer, options
            try:
                ans_el = page.locator('#questionModalBody .answer-title').first
                results["matrix_modal_answer"] = ans_el.inner_text().strip()
            except Exception as e:
                print(f"[warn] matrix answer read failed: {e}")

            try:
                qbody = page.locator('#questionModalBody .q-modal-question').first
                results["matrix_modal_question"] = qbody.inner_text()[:300]
            except Exception as e:
                print(f"[warn] matrix question read failed: {e}")

            try:
                opts = page.locator('#questionModalBody .modal-opt').all()
                results["matrix_modal_options"] = [o.inner_text().strip() for o in opts]
            except Exception as e:
                print(f"[warn] matrix options read failed: {e}")

            # Check for matrix rendering (KaTeX/MathML elements)
            results["matrix_modal_math_count"] = page.locator('#questionModalBody .katex, #questionModalBody math, #questionModalBody .MathJax, #questionModalBody .mq-math, #questionModalBody span.katex-display, #questionModalBody .katex-display').count()

            # Check for <br> row breaks inside options
            results["matrix_modal_has_br"] = page.locator('#questionModalBody .modal-opt br').count()

            results["matrix_modal_title"] = page.locator('#questionModalTitle').first.inner_text()
            print(f"[verify] matrix modal title: {results['matrix_modal_title']}")
            print(f"[verify] matrix options: {results['matrix_modal_options']}")
            print(f"[verify] matrix has <br>: {results['matrix_modal_has_br']}")
            print(f"[verify] matrix math count: {results['matrix_modal_math_count']}")

            # Take screenshot
            page.screenshot(path=os.path.join(OUT_DIR, "zhenti-matrix-modal.png"), full_page=False)

        browser.close()

    # Save results
    with open(os.path.join(OUT_DIR, "_zhenti_verify_results.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("\n=== SUMMARY ===")
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()