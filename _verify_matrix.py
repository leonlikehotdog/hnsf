"""Verify LaTeX matrix rendering on the zhenti page (final)."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT_DIR = Path(r"d:\TraeWorkSpace\hnsf")
SCREENSHOT_PATH = OUT_DIR / "matrix-verify.png"


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()

        # 1. Navigate, wait for page load
        page.goto("http://127.0.0.1:8080/#zhenti", wait_until="networkidle", timeout=15000)
        try:
            page.wait_for_selector("#zhentiContentArea .question-card", timeout=15000)
        except Exception as e:
            print(f"warn: {e}")
        page.wait_for_timeout(1500)

        # 2. Click 2023 year filter
        page.locator("#filterYear button.filter-pill", has_text="2023").first.click()
        page.wait_for_timeout(2500)

        card_count = page.locator("#zhentiContentArea .question-card").count()
        print(f"Question-card count after 2023 filter: {card_count}")

        # 6. Screenshot - both viewport and full page
        viewport_path = OUT_DIR / "matrix-verify.png"
        page.screenshot(path=str(viewport_path), full_page=True)
        print(f"Screenshot saved: {viewport_path}")

        # 7. Count katex mtable elements
        katex_total = page.evaluate("() => document.querySelectorAll('.katex').length")
        mtable_total = page.evaluate("() => document.querySelectorAll('.katex .mtable').length")
        # In KaTeX, matrix rows are rendered as vlists (no .mtr class)
        # We count rows by looking at .vlist-r .vlist children (each is a row)
        # and columns by looking at .col-align-c
        mtable_row_col = page.evaluate(
            """() => {
                const arr = [];
                document.querySelectorAll('.katex .mtable').forEach((m, idx) => {
                    const cols = m.querySelectorAll(':scope > .col-align-c');
                    // Each column has a vlist of rows
                    let rows = 0;
                    if (cols.length) {
                        const firstCol = cols[0];
                        // Count rows: vlist > children with style="top:..."
                        const vlist = firstCol.querySelector('.vlist');
                        if (vlist) {
                            // Rows are direct children (excluding vlist-s)
                            rows = 0;
                            vlist.childNodes.forEach(c => {
                                if (c.nodeType === 1 && c.classList && c.classList.contains('mord')) rows++;
                            });
                            // Try alternative: count rows by span with style="top:"
                            if (rows === 0) {
                                rows = Array.from(vlist.querySelectorAll(':scope > .mord, :scope > span')).filter(
                                    s => s.style && s.style.top
                                ).length;
                                // fallback: count cells with style top
                                if (rows === 0) {
                                    rows = vlist.querySelectorAll('[style*="top"]').length;
                                }
                            }
                        }
                    }
                    arr.push({ idx, cols: cols.length, rows });
                });
                return arr;
            }"""
        )
        matrices_with_rows = [m for m in mtable_row_col if m['rows'] > 1]
        matrices_with_cols = [m for m in mtable_row_col if m['cols'] > 1]
        print(f"katex_total: {katex_total}")
        print(f"mtable_total: {mtable_total}")
        print(f"matrices with >1 row: {len(matrices_with_rows)}")
        print(f"matrices with >1 col: {len(matrices_with_cols)}")
        print("Sample structures:")
        for s in mtable_row_col[:8]:
            print(f"  [{s['idx']}] cols={s['cols']} rows={s['rows']}")

        # Multi-row matrix content detail
        multi_row = page.evaluate(
            """() => {
                const results = [];
                document.querySelectorAll('.katex .mtable').forEach((m, idx) => {
                    const cols = m.querySelectorAll(':scope > .col-align-c');
                    if (cols.length < 2) return;
                    const vlist = cols[0].querySelector('.vlist');
                    if (!vlist) return;
                    // Rows are spans with style top:... except the last
                    const rowSpans = Array.from(vlist.children).filter(c => {
                        if (c.nodeType !== 1) return false;
                        const s = c.getAttribute('style') || '';
                        return s.includes('top:') || s.includes('height:');
                    });
                    // Build a row text by scanning all columns at each row index
                    const rowCount = rowSpans.length || 0;
                    const rows = [];
                    for (let i = 0; i < rowCount; i++) {
                        const rowCells = [];
                        cols.forEach(col => {
                            const vlist2 = col.querySelector('.vlist');
                            if (vlist2) {
                                const spans = Array.from(vlist2.children).filter(c => {
                                    if (c.nodeType !== 1) return false;
                                    const s = c.getAttribute('style') || '';
                                    return s.includes('top:') || s.includes('height:');
                                });
                                if (spans[i]) {
                                    // extract mexpr text
                                    const m = spans[i].querySelector('.mord');
                                    rowCells.push((m ? m.textContent : spans[i].textContent).trim());
                                }
                            }
                        });
                        rows.push(rowCells.join(' | '));
                    }
                    results.push({ idx, rows, rowCount });
                });
                return results;
            }"""
        )
        print(f"\nMulti-row matrix detail count: {len(multi_row)}")
        for mt in multi_row[:8]:
            print(f"  [{mt['idx']}] rowCount={mt['rowCount']}")
            for i, r in enumerate(mt['rows']):
                print(f"     row{i+1}: {r}")

        # 4. Verify 一(6) matrix
        # Click the 2023-06 card to open modal
        page.locator(".question-card[data-id='2023-06']").first.click()
        page.wait_for_timeout(1500)
        modal_06 = page.evaluate(
            """() => {
                const modal = document.querySelector('#questionModal');
                if (!modal) return null;
                const mt = modal.querySelectorAll('.katex .mtable');
                const results = [];
                mt.forEach((m, idx) => {
                    const cols = m.querySelectorAll(':scope > .col-align-c');
                    const vlist = cols[0]?.querySelector('.vlist');
                    const rowSpans = vlist ? Array.from(vlist.children).filter(c => {
                        if (c.nodeType !== 1) return false;
                        const s = c.getAttribute('style') || '';
                        return s.includes('top:') || s.includes('height:');
                    }) : [];
                    const rows = [];
                    for (let i = 0; i < rowSpans.length; i++) {
                        const cells = [];
                        cols.forEach(col => {
                            const vl = col.querySelector('.vlist');
                            if (vl) {
                                const sps = Array.from(vl.children).filter(c => {
                                    if (c.nodeType !== 1) return false;
                                    const s = c.getAttribute('style') || '';
                                    return s.includes('top:') || s.includes('height:');
                                });
                                if (sps[i]) {
                                    const mor = sps[i].querySelector('.mord');
                                    cells.push((mor ? mor.textContent : sps[i].textContent).trim());
                                }
                            }
                        });
                        rows.push(cells.join(' | '));
                    }
                    results.push({ idx, cols: cols.length, rows });
                });
                return { mtableCount: mt.length, detail: results };
            }"""
        )
        print("\n=== 一(6) Question Modal ===")
        print(f"Modal mtable count: {modal_06['mtableCount']}")
        for d in modal_06['detail']:
            print(f"  [{d['idx']}] cols={d['cols']}")
            for i, r in enumerate(d['rows']):
                print(f"     row{i+1}: {r}")

        # Close modal
        page.locator("#questionModalClose").click()
        page.wait_for_timeout(500)

        # 5. Verify 一(7) matrix
        page.locator(".question-card[data-id='2023-07']").first.click()
        page.wait_for_timeout(1500)
        modal_07 = page.evaluate(
            """() => {
                const modal = document.querySelector('#questionModal');
                if (!modal) return null;
                const mt = modal.querySelectorAll('.katex .mtable');
                const results = [];
                mt.forEach((m, idx) => {
                    const cols = m.querySelectorAll(':scope > .col-align-c');
                    const vlist = cols[0]?.querySelector('.vlist');
                    const rowSpans = vlist ? Array.from(vlist.children).filter(c => {
                        if (c.nodeType !== 1) return false;
                        const s = c.getAttribute('style') || '';
                        return s.includes('top:') || s.includes('height:');
                    }) : [];
                    const rows = [];
                    for (let i = 0; i < rowSpans.length; i++) {
                        const cells = [];
                        cols.forEach(col => {
                            const vl = col.querySelector('.vlist');
                            if (vl) {
                                const sps = Array.from(vl.children).filter(c => {
                                    if (c.nodeType !== 1) return false;
                                    const s = c.getAttribute('style') || '';
                                    return s.includes('top:') || s.includes('height:');
                                });
                                if (sps[i]) {
                                    const mor = sps[i].querySelector('.mord');
                                    cells.push((mor ? mor.textContent : sps[i].textContent).trim());
                                }
                            }
                        });
                        rows.push(cells.join(' | '));
                    }
                    results.push({ idx, cols: cols.length, rows });
                });
                return { mtableCount: mt.length, detail: results };
            }"""
        )
        print("\n=== 一(7) Question Modal ===")
        print(f"Modal mtable count: {modal_07['mtableCount']}")
        for d in modal_07['detail']:
            print(f"  [{d['idx']}] cols={d['cols']}")
            for i, r in enumerate(d['rows']):
                print(f"     row{i+1}: {r}")

        # Take a focused screenshot of the modal
        modal_path = OUT_DIR / "matrix-verify-modal-06.png"
        try:
            page.locator("#questionModalClose").click()
            page.wait_for_timeout(500)
        except Exception:
            pass

        # Re-open 2023-06 modal for focused screenshot
        page.locator(".question-card[data-id='2023-06']").first.click()
        page.wait_for_timeout(1500)
        page.screenshot(path=str(OUT_DIR / "matrix-verify-2023-06-modal.png"), full_page=False)
        page.locator("#questionModalClose").click()
        page.wait_for_timeout(500)

        # Re-open 2023-07 modal
        page.locator(".question-card[data-id='2023-07']").first.click()
        page.wait_for_timeout(1500)
        page.screenshot(path=str(OUT_DIR / "matrix-verify-2023-07-modal.png"), full_page=False)

        browser.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
