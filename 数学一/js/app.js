/**
 * 考研数学一 · 小白上岸手册
 * 章节动态加载与导航逻辑
 */
(function() {
    'use strict';

    // ===== 配置 =====
    const CHAPTERS = [
        { id: 'ch01', title: '函数极限连续', part: '一', stars: '★★★★★', cls: 'high', score: '12分' },
        { id: 'ch02', title: '一元微分', part: '一', stars: '★★★★★', cls: 'high', score: '16分' },
        { id: 'ch03', title: '一元积分', part: '一', stars: '★★★★★', cls: 'high', score: '16分' },
        { id: 'ch04', title: '向量与解析几何', part: '一', stars: '★', cls: 'low', score: '4分' },
        { id: 'ch05', title: '多元微分', part: '一', stars: '★★★★', cls: 'high', score: '8分' },
        { id: 'ch06', title: '多元积分', part: '一', stars: '★★', cls: 'low', score: '12分' },
        { id: 'ch07', title: '无穷级数', part: '一', stars: '★', cls: 'drop', score: '8分', drop: true },
        { id: 'ch08', title: '常微分方程', part: '一', stars: '★★★', cls: 'high', score: '8分' },
        { id: 'ch09', title: '行列式', part: '二', stars: '★★★★', cls: 'high', score: '5分' },
        { id: 'ch10', title: '矩阵', part: '二', stars: '★★★★', cls: 'high', score: '6分' },
        { id: 'ch11', title: '向量', part: '二', stars: '★★★', cls: 'high', score: '6分' },
        { id: 'ch12', title: '线性方程组', part: '二', stars: '★★★★★', cls: 'high', score: '6分' },
        { id: 'ch13', title: '特征值与特征向量', part: '二', stars: '★★★★★', cls: 'high', score: '6分' },
        { id: 'ch14', title: '二次型', part: '二', stars: '★★★', cls: 'high', score: '4分' },
        { id: 'ch15', title: '随机事件与概率', part: '三', stars: '★★★★', cls: 'high', score: '5分' },
        { id: 'ch16', title: '随机变量及其分布', part: '三', stars: '★★★', cls: 'high', score: '6分' },
        { id: 'ch17', title: '多维随机变量', part: '三', stars: '★★', cls: 'low', score: '6分' },
        { id: 'ch18', title: '数字特征', part: '三', stars: '★★★★', cls: 'high', score: '6分' },
        { id: 'ch19', title: '大数定律与中心极限定理', part: '三', stars: '★', cls: 'drop', score: '4分', drop: true },
        { id: 'ch20', title: '数理统计基础', part: '三', stars: '★★', cls: 'low', score: '4分' }
    ];

    const PART_NAMES = {
        '一': '高等数学',
        '二': '线性代数',
        '三': '概率与统计'
    };

    const PART_SCORES = {
        '一': '约84分 · 占比56%',
        '二': '约33分 · 占比22%',
        '三': '约33分 · 占比22%'
    };

    // ===== 状态 =====
    let loadedChapters = {};      // id -> HTML content
    let currentChapterId = null;
    let isLoading = false;

    // ===== DOM 引用 =====
    const contentWrap = document.getElementById('contentWrap');
    const sidebarNav = document.getElementById('sidebarNav');
    const backToTop = document.getElementById('backToTop');

    // ===== 初始化侧边栏 =====
    function buildSidebar() {
        let parts = ['一', '二', '三'];
        let html = '';
        parts.forEach(function(p) {
            html += '<div class="nav-part">' + p + '、' + PART_NAMES[p] + '</div>';
            CHAPTERS.forEach(function(ch) {
                if (ch.part !== p) return;
                var starHtml = '<span class="priority-dot ' + ch.cls + '">' + ch.stars + '</span>';
                html += '<a href="#" data-target="' + ch.id + '"><span class="ch-num">' + ch.id.replace('ch', '') + '</span>' + ch.title + starHtml + '</a>';
            });
        });
        sidebarNav.innerHTML = html;

        // 绑定点击事件
        sidebarNav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var targetId = this.getAttribute('data-target');
                navigateTo(targetId);
            });
        });
    }

    // ===== 导航 =====
    function navigateTo(chapterId) {
        if (chapterId === currentChapterId || isLoading) return;
        currentChapterId = chapterId;

        // 更新侧边栏高亮
        sidebarNav.querySelectorAll('a').forEach(function(link) {
            link.classList.toggle('active', link.getAttribute('data-target') === chapterId);
        });

        // 如果已加载，直接显示
        if (loadedChapters[chapterId]) {
            renderChapter(chapterId);
        } else {
            loadChapter(chapterId);
        }

        // 更新 URL hash（用于刷新恢复）
        window.location.hash = chapterId;

        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===== 加载单个章节 =====
    function loadChapter(chapterId) {
        isLoading = true;
        contentWrap.innerHTML = '<div class="chapter-loading"><div class="spinner"></div><p>正在加载章节...</p></div>';

        var url = 'chapters/' + chapterId + '.html';

        fetch(url)
            .then(function(resp) {
                if (!resp.ok) throw new Error('HTTP ' + resp.status);
                return resp.text();
            })
            .then(function(html) {
                loadedChapters[chapterId] = html;
                isLoading = false;
                renderChapter(chapterId);
            })
            .catch(function(err) {
                // 如果 fetch 失败（如 file:// 协议），使用 XMLHttpRequest 重试
                console.warn('fetch failed, trying XHR:', err);
                loadChapterXHR(chapterId);
            });
    }

    // ===== XHR 回退加载 =====
    function loadChapterXHR(chapterId) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'chapters/' + chapterId + '.html', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                isLoading = false;
                if (xhr.status === 0 || xhr.status === 200) {
                    // file:// 协议下 status 可能为 0
                    loadedChapters[chapterId] = xhr.responseText;
                    renderChapter(chapterId);
                } else {
                    contentWrap.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#e74c3c;">'
                        + '<p style="font-size:18px;font-weight:600;">⚠️ 章节加载失败</p>'
                        + '<p style="margin-top:8px;">请尝试在本地服务器环境下打开此页面，或直接打开 chapters/' + chapterId + '.html 查看。</p>'
                        + '</div>';
                }
            }
        };
        xhr.onerror = function() {
            isLoading = false;
            contentWrap.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#e74c3c;">'
                + '<p style="font-size:18px;font-weight:600;">⚠️ 章节加载失败</p>'
                + '<p style="margin-top:8px;">请尝试在本地服务器环境下打开此页面，或直接打开 chapters/' + chapterId + '.html 查看。</p>'
                + '</div>';
        };
        xhr.send();
    }

    // ===== 渲染章节 =====
    function renderChapter(chapterId) {
        var html = loadedChapters[chapterId];
        if (!html) {
            contentWrap.innerHTML = '<p>章节内容为空</p>';
            return;
        }

        // 找到当前章节在数组中的索引
        var idx = -1;
        CHAPTERS.forEach(function(ch, i) {
            if (ch.id === chapterId) idx = i;
        });

        var prevId = (idx > 0) ? CHAPTERS[idx - 1].id : null;
        var nextId = (idx < CHAPTERS.length - 1) ? CHAPTERS[idx + 1].id : null;

        // 包裹导航按钮
        var navHtml = '<div class="chapter-nav">'
            + (prevId ? '<button onclick="window.__navigateTo(\'' + prevId + '\')">← 上一章</button>' : '<div></div>')
            + (nextId ? '<button onclick="window.__navigateTo(\'' + nextId + '\')">下一章 →</button>' : '<div></div>')
            + '</div>';

        contentWrap.innerHTML = html + navHtml;
        buildOutline();
    }

    // ===== 自动收集本章所有 tag-float，生成右侧要点导航 =====
    function buildOutline() {
        var list = document.getElementById('outlineList');
        if (!list) return;
        var floats = contentWrap.querySelectorAll('.tag-float');
        if (floats.length === 0) {
            list.innerHTML = '<div style="font-size:12px;color:#95a5a6;padding:6px;">本章暂无要点</div>';
            return;
        }
        var html = '';
        floats.forEach(function(el, i) {
            var titleEl = el.querySelector('.tf-title');
            var title = titleEl ? titleEl.textContent.trim() : ('要点 ' + (i + 1));
            var icon = '';
            if (el.classList.contains('t-example')) icon = '📌 ';
            else if (el.classList.contains('t-summary')) icon = '🧠 ';
            else if (el.classList.contains('t-tip')) icon = '💡 ';
            else if (el.classList.contains('t-warn')) icon = '⚠️ ';
            else if (el.classList.contains('t-formula')) icon = '📐 ';
            else if (el.classList.contains('t-strategy')) icon = '🎯 ';
            el.id = 'pt-' + i;
            html += '<a data-target="pt-' + i + '">' + icon + title + '</a>';
        });
        list.innerHTML = html;
        list.querySelectorAll('a').forEach(function(a) {
            a.addEventListener('click', function(e) {
                e.preventDefault();
                var t = document.getElementById(this.getAttribute('data-target'));
                if (t) {
                    var top = t.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            });
        });
        // 滚动联动高亮
        if (!window.__outlineScrollBound) {
            window.addEventListener('scroll', updateOutlineActive, { passive: true });
            window.__outlineScrollBound = true;
        }
        updateOutlineActive();
    }

    function updateOutlineActive() {
        var links = document.querySelectorAll('#outlineList a');
        if (!links.length) return;
        var floats = contentWrap.querySelectorAll('.tag-float');
        var current = null;
        floats.forEach(function(el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < 120) current = el.id;
        });
        links.forEach(function(a) {
            a.classList.toggle('active', a.getAttribute('data-target') === current);
        });
    }

    // ===== 预加载后续章节（提升体验） =====
    function preloadNextChapter(chapterId) {
        var idx = -1;
        CHAPTERS.forEach(function(ch, i) {
            if (ch.id === chapterId) idx = i;
        });
        var nextIdx = idx + 1;
        if (nextIdx < CHAPTERS.length) {
            var nextId = CHAPTERS[nextIdx].id;
            if (!loadedChapters[nextId]) {
                fetch('chapters/' + nextId + '.html')
                    .then(function(r) { if (r.ok) return r.text(); })
                    .then(function(html) { if (html) loadedChapters[nextId] = html; })
                    .catch(function() {});
            }
        }
    }

    // ===== Back to top =====
    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    }, { passive: true });

    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== 暴露导航函数给全局（用于按钮点击） =====
    window.__navigateTo = function(chapterId) {
        navigateTo(chapterId);
    };

    // ===== 初始化 =====
    function init() {
        buildSidebar();

        // 从 hash 恢复章节，默认加载第一章
        var hash = window.location.hash.replace('#', '');
        var startChapter = hash || 'ch01';

        // 检查 hash 是否有效
        var valid = false;
        CHAPTERS.forEach(function(ch) {
            if (ch.id === startChapter) valid = true;
        });
        if (!valid) startChapter = 'ch01';

        navigateTo(startChapter);

        // 预加载下一章
        preloadNextChapter(startChapter);
    }

    // DOM ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

})();
