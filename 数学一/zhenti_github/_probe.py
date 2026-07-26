from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={'width': 1600, 'height': 1000})
    page = ctx.new_page()
    page.on('console', lambda m: print('CON:', m.type, m.text[:300]))
    page.on('pageerror', lambda e: print('PAGE:', e))
    page.goto('http://localhost:8765/index.html', wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(3000)
    info = page.evaluate("""
        async () => {
            const r = await fetch('js/zhenti.js?v=6');
            const t = await r.text();
            (0, eval)(t);
            return {
                initType: typeof window.initZhentiModule,
                zhentiType: typeof window.__zhenti,
                stateQs: window.__zhenti?.state?.questions?.length || 0,
            };
        }
    """)
    print('info:', info)
    browser.close()
