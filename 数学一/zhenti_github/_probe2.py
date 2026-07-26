from playwright.sync_api import sync_playwright

errors = []
console = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={'width': 1600, 'height': 1000})
    page = ctx.new_page()
    page.on('pageerror', lambda e: errors.append('PAGE: ' + str(e)))
    page.on('console', lambda m: console.append(m.type + ': ' + m.text))
    page.goto('http://localhost:8765/index.html', wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(2000)
    page.evaluate('window.location.hash = "zhenti"')
    page.wait_for_timeout(3000)
    print('--- console ---')
    for c in console[:30]:
        print(c)
    print('--- pageerrors ---')
    for e in errors[:30]:
        print(e)
    print('--- zhenti.js syntax check ---')
    # 取出 zhenti.js 直接看
    src = page.evaluate("fetch('js/zhenti.js').then(r=>r.text()).then(t=>t.length)")
    print('zhenti.js length:', src)
    browser.close()
