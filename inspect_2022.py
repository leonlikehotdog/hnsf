from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:8080/#zhenti'
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    page.goto(URL, wait_until='domcontentloaded')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    print('TITLE', page.title())
    print('URL', page.url)
    print('TEXT_HEAD', page.locator('body').inner_text()[:3000])
    page.screenshot(path='initial.png', full_page=True)
    browser.close()
