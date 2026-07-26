from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:8080/#zhenti'

def norm(s):
    return ' '.join(s.split())

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)
    page.goto(URL, wait_until='domcontentloaded')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    # Click the specific year-filter pill, not the overview card.
    pills = page.get_by_text('2022 (22)', exact=True)
    print('YEAR_FILTER_COUNT', pills.count())
    pills.first.click()
    page.wait_for_timeout(7000)
    body = page.locator('body').inner_text()
    print('QUESTION_COUNT_TEXT', [norm(x) for x in page.locator('text=/共找到.*题/').all_inner_texts()])
    for marker in ['一(1)', '一(2)', '一(3)']:
        pos = body.rfind(marker)
        print('QUESTION', marker, norm(body[pos:pos+1400]) if pos >= 0 else 'NOT FOUND')
    print('ANSWER_MARKERS', [norm(x) for x in page.locator('text=/答案/').all_inner_texts()[:10]])
    q1 = page.get_by_text('一(1)', exact=True).last
    print('Q1_COUNT', page.get_by_text('一(1)', exact=True).count(), 'Q1_VISIBLE', q1.is_visible())
    q1.click()
    page.wait_for_timeout(1000)
    modal = page.locator('[role=dialog]:visible')
    print('DIALOG_COUNT', modal.count())
    modal_text = norm(modal.inner_text()) if modal.count() else norm(page.locator('body').inner_text()[-5000:])
    print('MODAL_BEFORE', modal_text)
    expand = page.get_by_text('点击展开', exact=True).last
    print('EXPAND_COUNT', page.get_by_text('点击展开', exact=True).count(), 'VISIBLE', expand.is_visible())
    if expand.is_visible():
        expand.click()
        page.wait_for_timeout(500)
    modal_text = norm(page.locator('body').inner_text()[-5000:])
    print('MODAL_AFTER', modal_text)
    page.screenshot(path='2022-fixed.png', full_page=True)
    browser.close()
