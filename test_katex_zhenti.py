# -*- coding: utf-8 -*-
"""Playwright 脚本：测试 http://127.0.0.1:8080/#zhenti 的 KaTeX 公式渲染"""
import sys
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:8080/#zhenti'
SCREENSHOT_PAGE = r'd:\TraeWorkSpace\hnsf\katex-2023.png'
SCREENSHOT_MODAL = r'd:\TraeWorkSpace\hnsf\katex-modal.png'

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 900})

        # 1. 导航到真题页
        print(f'[1] 导航到 {URL}')
        page.goto(URL, wait_until='networkidle', timeout=20000)

        # 2. 等待页面加载完成 + 真题内容出现
        print('[2] 等待真题区域加载...')
        page.wait_for_selector('#zhentiContentArea', timeout=15000)
        # 等待数据加载完成（loading 消失）
        page.wait_for_function(
            '() => document.querySelector("#zhentiContentArea .zhenti-loading") === null',
            timeout=15000
        )
        # 额外等待 KaTeX 和 auto-render 完成
        page.wait_for_timeout(2000)

        # 3. 点击 "2023" 年份筛选 pill
        print('[3] 点击 2023 年份筛选...')
        # 找到 2023 的按钮（filterYear 区域内的 filter-pill 按钮，data-year="2023"）
        year_pill = page.locator('#filterYear button[data-year="2023"]')
        year_pill.wait_for(state='visible', timeout=5000)
        year_pill.click()

        # 4. 等待题目列表更新
        print('[4] 等待题目渲染...')
        page.wait_for_timeout(3000)
        page.wait_for_function(
            '() => document.querySelectorAll(".question-card").length > 0',
            timeout=10000
        )
        # 再给 KaTeX 渲染一点时间
        page.wait_for_timeout(2000)

        # 5. 检查 .katex 元素数量
        katex_count = page.evaluate('() => document.querySelectorAll(".katex").length')
        print(f'[5] 页面中 .katex 元素数量: {katex_count}')

        if katex_count > 50:
            print(f'   ✅ KaTeX 渲染正确（{katex_count} > 50）')
        else:
            print(f'   ⚠️  KaTeX 元素数量不足 50（实际 {katex_count}）')

        # 6. 截取页面截图
        print(f'[6] 截取页面截图 -> {SCREENSHOT_PAGE}')
        page.screenshot(path=SCREENSHOT_PAGE, full_page=True)

        # 7. 点击第一个题目卡片打开详情弹窗
        print('[7] 点击第一个题目卡片...')
        first_card = page.locator('.question-card').first
        first_card.wait_for(state='visible', timeout=5000)
        first_card.click()

        # 8. 等待弹窗出现
        print('[8] 等待弹窗...')
        page.wait_for_selector('#questionModal:not([hidden])', timeout=5000)
        page.wait_for_timeout(2000)

        # 检查弹窗内的 .katex 元素
        modal_katex_count = page.evaluate('() => {'
            'const modal = document.getElementById("questionModal");'
            'if (!modal || modal.hidden) return -1;'
            'return modal.querySelectorAll(".katex").length;'
        '}')
        print(f'[8] 弹窗中 .katex 元素数量: {modal_katex_count}')

        # 9. 截取弹窗截图
        print(f'[9] 截取弹窗截图 -> {SCREENSHOT_MODAL}')
        page.screenshot(path=SCREENSHOT_MODAL, full_page=True)

        # 10. 汇总报告
        print(f'\n{"="*50}')
        print(f'📊 KaTeX 渲染测试报告')
        print(f'{"="*50}')
        print(f'页面 .katex 数量: {katex_count}')
        print(f'弹窗 .katex 数量: {modal_katex_count}')
        print(f'页面截图: {SCREENSHOT_PAGE}')
        print(f'弹窗截图: {SCREENSHOT_MODAL}')
        print(f'{"="*50}')

        browser.close()

if __name__ == '__main__':
    main()
