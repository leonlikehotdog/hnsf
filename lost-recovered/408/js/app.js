/**
 * 408计算机考研 · 小白上岸手册
 * 章节动态加载与导航逻辑
 */
(function() {
    'use strict';

    const CHAPTERS = [
        // === 数据结构 ===
        { id: 'ch01', title: '线性表', part: '数据结构', score: '10分' },
        { id: 'ch02', title: '栈、队列与数组', part: '数据结构', score: '5分' },
        { id: 'ch03', title: '树与二叉树', part: '数据结构', score: '12分' },
        { id: 'ch04', title: '图', part: '数据结构', score: '8分' },
        { id: 'ch05', title: '查找与排序', part: '数据结构', score: '10分' },
        // === 计组 ===
        { id: 'ch06', title: '计算机系统概述', part: '计组', score: '5分' },
        { id: 'ch07', title: '数据的表示与运算', part: '计组', score: '8分' },
        { id: 'ch08', title: '存储系统', part: '计组', score: '10分' },
        { id: 'ch09', title: '指令系统', part: '计组', score: '7分' },
        { id: 'ch10', title: 'CPU结构与流水线', part: '计组', score: '8分' },
        { id: 'ch11', title: '总线与I/O', part: '计组', score: '7分' },
        // === 操作系统 ===
        { id: 'ch12', title: '进程管理', part: '操作系统', score: '10分' },
        { id: 'ch13', title: '内存管理', part: '操作系统', score: '8分' },
        { id: 'ch14', title: '文件系统', part: '操作系统', score: '8分' },
        { id: 'ch15', title: 'I/O与操作系统概述', part: '操作系统', score: '9分' },
        // === 计网 ===
        { id: 'ch16', title: '网络体系结构', part: '计网', score: '3分' },
        { id: 'ch17', title: '物理层与数据链路层', part: '计网', score: '5分' },
        { id: 'ch18', title: '网络层', part: '计网', score: '8分' },
        { id: 'ch19', title: '传输层', part: '计网', score: '5分' },
        { id: 'ch20', title: '应用层', part: '计网', score: '4分' }
    ];

    const PART_NAMES = {
        '数据结构': '数据结构（约45分）',
        '计组': '计算机组成原理（约45分）',
        '操作系统': '操作系统（约35分）',
        '计网': '计算机网络（约25分）'
    };

    let loadedChapters = {};
    let currentChapterId = null;
    let isLoading = false;

    const contentWrap = document.getElementById('contentWrap');
    const sidebarNav = document.getElementById('sidebarNav');
    const backToTop = document.getElementById('backToTop');

    function buildSidebar() {
        let parts = ['数据结构', '计组', '操作系统', '计网'];
        let html = '';
        parts.forEach(function(p) {
            html += '<div class="nav-part">' + PART_NAMES[p] + '</div>';
            CHAPTERS.forEach(function(ch) {
                if (ch.part !== p) return;
                html += '<a href="#" data-target="' + ch.id + '"><span class="ch-num">' + ch.id.replace('ch', '') + '</span>' + ch.title + '</a>';
            });
        });
        sidebarNav.innerHTML = html;
        sidebarNav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                navigateTo(this.getAttribute('data-target'));
            });
        });
    }

    function navigateTo(chapterId) {
        if (chapterId === currentChapterId || isLoading) return;
        currentChapterId = chapterId;
        sidebarNav.querySelectorAll('a').forEach(function(link) {
            link.classList.toggle('active', link.getAttribute('data-target') === chapterId);
        });
        if (loadedChapters[chapterId]) {
            renderChapter(chapterId);
        } else {
            loadChapter(chapterId);
        }
        window.location.hash = chapterId;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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
            .catch(function() { loadChapterXHR(chapterId); });
    }

    function loadChapterXHR(chapterId) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'chapters/' + chapterId + '.html', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                isLoading = false;
                if (xhr.status === 0 || xhr.status === 200) {
                    loadedChapters[chapterId] = xhr.responseText;
                    renderChapter(chapterId);
                } else {
                    contentWrap.innerHTML = '<div style="text-align:center;padding:60px;color:#e74c3c;"><p style="font-size:18px;font-weight:600;">⚠️ 章节加载失败</p><p style="margin-top:8px;">请直接在本地服务器环境下打开，或直接打开 chapters/' + chapterId + '.html 查看。</p></div>';
                }
            }
        };
        xhr.onerror = function() {
            isLoading = false;
            contentWrap.innerHTML = '<div style="text-align:center;padding:60px;color:#e74c3c;"><p style="font-size:18px;font-weight:600;">⚠️ 章节加载失败</p></div>';
        };
        xhr.send();
    }

    function renderChapter(chapterId) {
        var html = loadedChapters[chapterId];
        if (!html) { contentWrap.innerHTML = '<p>章节内容为空</p>'; return; }
        var idx = -1;
        CHAPTERS.forEach(function(ch, i) { if (ch.id === chapterId) idx = i; });
        var prevId = (idx > 0) ? CHAPTERS[idx - 1].id : null;
        var nextId = (idx < CHAPTERS.length - 1) ? CHAPTERS[idx + 1].id : null;
        var navHtml = '<div class="chapter-nav">'
            + (prevId ? '<button onclick="window.__navigateTo(\'' + prevId + '\')">← 上一章</button>' : '<div></div>')
            + (nextId ? '<button onclick="window.__navigateTo(\'' + nextId + '\')">下一章 →</button>' : '<div></div>')
            + '</div>';
        contentWrap.innerHTML = html + navHtml;
    }

    function preloadNext(chapterId) {
        var idx = -1;
        CHAPTERS.forEach(function(ch, i) { if (ch.id === chapterId) idx = i; });
        var nextIdx = idx + 1;
        if (nextIdx < CHAPTERS.length) {
            var nextId = CHAPTERS[nextIdx].id;
            if (!loadedChapters[nextId]) {
                fetch('chapters/' + nextId + '.html').then(function(r) { if (r.ok) return r.text(); }).then(function(h) { if (h) loadedChapters[nextId] = h; }).catch(function() {});
            }
        }
    }

    window.addEventListener('scroll', function() {
        backToTop.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.__navigateTo = navigateTo;

    function init() {
        buildSidebar();
        var hash = window.location.hash.replace('#', '');
        var start = 'ch01';
        CHAPTERS.forEach(function(ch) { if (ch.id === hash) start = hash; });
        navigateTo(start);
        preloadNext(start);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
