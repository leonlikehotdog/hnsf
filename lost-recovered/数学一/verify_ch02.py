"""验证 ch02 表格修复"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900})
    page = ctx.new_page()
    page.goto('http://localhost:8000/index.html', wait_until='networkidle')
    page.wait_for_timeout(1500)

    # navigate to ch02
    page.locator('a[data-target="ch02"]').click()
    page.wait_for_timeout(3000)

    # find the table near "分界点落在跑道内"
    target = page.locator('table').filter(has_text='分界点落在跑道内').first
    target.scroll_into_view_if_needed()
    page.wait_for_timeout(500)
    target.screenshot(path='d:/TraeWorkSpace/hnsf/数学一/ch02_table_fixed.png')

    # check actual rendered text in the first cell
    firstCellText = target.locator('tbody tr').first.locator('td').first.text_content()
    print('First cell text:', repr(firstCellText.strip()), flush=True)
    print('Expected: begins with \\(0 < x ≤ 1\\)', flush=True)

    # full screenshot
    page.screenshot(path='d:/TraeWorkSpace/hnsf/数学一/ch02_fixed.png', full_page=True)
    print('Screenshot saved', flush=True)
    browser.close()