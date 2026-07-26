from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={'width': 1600, 'height': 1000})
    page = ctx.new_page()
    rc = page.goto('http://localhost:8765/chapters/zhenti.html', wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(1000)
    info = page.evaluate("""
        async () => {
            try {
                const r = await fetch('js/zhenti.js');
                const t = await r.text();
                // 尝试用 new Function 解析
                new Function(t);
                return {ok: true, len: t.length};
            } catch (e) {
                return {ok: false, err: e.message + ' | ' + (e.stack || '').substring(0, 500)};
            }
        }
    """)
    print('zhenti.js parse test:', info)
    browser.close()
