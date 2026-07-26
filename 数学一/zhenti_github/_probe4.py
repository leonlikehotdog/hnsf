from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={'width': 1600, 'height': 1000})
    page = ctx.new_page()
    page.goto('http://localhost:8765/index.html', wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(2000)
    info = page.evaluate("""
        async () => {
            const r = await fetch('js/zhenti.js');
            const t = await r.text();
            return {status: r.status, len: t.length, head: t.substring(0, 200), tail: t.substring(t.length-100)};
        }
    """)
    print(info)
    browser.close()
