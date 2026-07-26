"""Inspect actual KaTeX output structure for matrix."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT_DIR = Path(r"d:\TraeWorkSpace\hnsf")


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()

        page.goto("http://127.0.0.1:8080/#zhenti", wait_until="networkidle", timeout=15000)
        try:
            page.wait_for_selector("#zhentiContentArea .question-card", timeout=15000)
        except Exception as e:
            print(f"warn: {e}")
        page.wait_for_timeout(1500)

        page.locator("#filterYear button.filter-pill", has_text="2023").first.click()
        page.wait_for_timeout(2500)

        # Get raw HTML of the first mtable element
        sample_html = page.evaluate(
            """() => {
                const m = document.querySelector('.katex .mtable');
                if (!m) return null;
                // Get parent and grandparent class names
                const parent = m.parentElement;
                const grand = parent ? parent.parentElement : null;
                return {
                    cls: m.className,
                    parentCls: parent?.className,
                    grandCls: grand?.className,
                    outerHTML: m.outerHTML,
                };
            }"""
        )
        print("First mtable sample:")
        if sample_html:
            print(f"  cls: {sample_html['cls']}")
            print(f"  parentCls: {sample_html['parentCls']}")
            print(f"  grandCls: {sample_html['grandCls']}")
            print(f"  outerHTML: {sample_html['outerHTML'][:1500]}")

        # Click open the question 2023-06 to see matrix in question modal
        # First find the card
        card = page.locator(".question-card[data-id='2023-06']").first
        if card.count() > 0:
            card.click()
            page.wait_for_timeout(1500)

            # Inspect the matrix in the modal
            modal_html = page.evaluate(
                """() => {
                    const modal = document.querySelector('#questionModal .q-modal-body, #questionModal .q-body, #questionModal');
                    if (!modal) return null;
                    const katex = modal.querySelectorAll('.katex');
                    const mtables = modal.querySelectorAll('.katex .mtable');
                    const arr = [];
                    mtables.forEach((m, idx) => {
                        if (idx < 3) {
                            arr.push({
                                idx,
                                outerHTML: m.outerHTML.slice(0, 2000),
                                rows: m.querySelectorAll('.mtr').length,
                            });
                        }
                    });
                    return { katexCount: katex.length, mtableCount: mtables.length, samples: arr };
                }"""
            )
            print("Modal matrix:")
            print(modal_html)

        # Also check inside the q-body of the 2023-06 card
        card_html = page.evaluate(
            """() => {
                const card = document.querySelector(".question-card[data-id='2023-06']");
                if (!card) return null;
                const body = card.querySelector('.q-body');
                return body ? body.outerHTML : null;
            }"""
        )
        print(f"2023-06 q-body HTML:")
        print(card_html)

        browser.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
