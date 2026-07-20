/**
 * 408 真题刷题模块 · zhenti.js
 *
 * 依赖：window.ZHENTI_DATA, window.ZHENTI_CHAPTER_INDEX, window.ZHENTI_TOTAL_COUNT
 * 全局工具：window.__navigateTo(chapterId)
 *
 * 主要能力：
 *   - 渲染总览（按年份×板块分布）
 *   - 4 个 Tab：历年/章节/板块/题型
 *   - 多条件筛选：年份 × 板块 × 题型 × 关键词搜索
 *   - 单题详情弹窗（题干 + 选项 + 答案 + 解析 + 章节跳转）
 *
 * 数据来源（zhenti_data.js）注释：408 真题全卷每年 47 题（40 选择 + 7 大题）。
 * 当前已收录 60+ 道精选题，覆盖全部四大板块与 20 章节的典型题，后续逐年补充。
 */
(function() {
    'use strict';

    const PART_NAMES = {
        '数据结构': '数据结构（约45分）',
        '计组': '计组（约45分）',
        '操作系统': '操作系统（约35分）',
        '计网': '计网（约25分）'
    };

    const PART_COLOR = {
        '数据结构': '#5b8def',
        '计组': '#f7a046',
        '操作系统': '#5cb85c',
        '计网': '#9b59b6'
    };

    // 当前筛选状态
    let state = {
        tab: 'all',          // all / chapter / part / type
        year: 'all',
        part: 'all',
        type: 'all',
        keyword: '',
        chapterFilter: 'all' // 仅 chapter tab 用
    };

    let allQuestions = [];
    Object.keys(window.ZHENTI_DATA || {}).forEach(function(y) {
        (window.ZHENTI_DATA[y] || []).forEach(function(q) {
            allQuestions.push(q);
        });
    });
    // 按 (year desc, num asc) 排序
    allQuestions.sort(function(a, b) {
        if (a.year !== b.year) return b.year - a.year;
        return a.num - b.num;
    });

    // ============= 渲染总览卡片 =============
    function renderOverview() {
        var stats = { years: {}, parts: { '数据结构': 0, '计组': 0, '操作系统': 0, '计网': 0 } };
        allQuestions.forEach(function(q) {
            stats.years[q.year] = (stats.years[q.year] || 0) + 1;
            if (stats.parts[q.part] !== undefined) stats.parts[q.part] += 1;
        });

        var html = '<div class="zhenti-overview-cards">';
        html += '<div class="zo-card zo-total">'
            + '<div class="zo-num">' + (window.ZHENTI_TOTAL_COUNT || allQuestions.length) + '</div>'
            + '<div class="zo-label">📚 真题总数（精选）</div>'
            + '</div>';

        Object.keys(stats.parts).forEach(function(p) {
            html += '<div class="zo-card" style="border-left:4px solid ' + PART_COLOR[p] + '">'
                + '<div class="zo-num">' + stats.parts[p] + '</div>'
                + '<div class="zo-label">📘 ' + PART_NAMES[p] + '</div>'
                + '</div>';
        });

        html += '<div class="zhenti-years-row">';
        html += '<div class="zyr-title">📅 历年收录：</div>';
        Object.keys(stats.years).sort(function(a, b) { return b - a; }).forEach(function(y) {
            html += '<span class="zyr-pill">' + y + ' <span class="zyr-count">' + stats.years[y] + '</span></span>';
        });
        html += '</div>';
        html += '</div>';

        document.getElementById('zhentiOverview').innerHTML = html;
    }

    // ============= 筛选 =============
    function applyFilter() {
        var kw = (state.keyword || '').trim().toLowerCase();
        return allQuestions.filter(function(q) {
            if (state.year !== 'all' && String(q.year) !== String(state.year)) return false;
            if (state.part !== 'all' && q.part !== state.part) return false;
            if (state.type !== 'all' && q.type !== state.type) return false;
            if (state.tab === 'chapter' && state.chapterFilter !== 'all') {
                if (!(q.chapter || []).includes(state.chapterFilter)) return false;
            }
            if (kw) {
                var haystack = (q.question + ' ' + (q.testPoints || []).join(' ') + ' '
                    + (q.knowledgePoints || []).join(' ') + ' ' + (q.chapter || []).join(' ')
                    + ' ' + q.id).toLowerCase();
                if (haystack.indexOf(kw) === -1) return false;
            }
            return true;
        });
    }

    // ============= 渲染题目列表 =============
    function renderQuestionList() {
        var list = applyFilter();
        var container = document.getElementById('zhentiContentArea');
        if (list.length === 0) {
            container.innerHTML = '<div class="zhenti-empty">'
                + '<div style="font-size:48px;margin-bottom:12px;">🔍</div>'
                + '<p>当前筛选条件下没有题目，试试调整筛选条件或清空搜索</p></div>';
            return;
        }

        var groupBy = state.tab;
        var html = '';

        if (groupBy === 'chapter') {
            // 按章节分组
            var grouped = {};
            list.forEach(function(q) {
                (q.chapter || ['other']).forEach(function(ch) {
                    if (!grouped[ch]) grouped[ch] = [];
                    if (!grouped[ch].some(function(x) { return x.id === q.id; })) grouped[ch].push(q);
                });
            });
            var chapters = Object.keys(grouped).sort();
            chapters.forEach(function(ch) {
                html += '<div class="qgroup">'
                    + '<h3 class="qgroup-title">📘 ' + chapterTitle(ch) + ' <span class="qgroup-count">' + grouped[ch].length + ' 题</span></h3>'
                    + grouped[ch].map(questionCardHtml).join('')
                    + '</div>';
            });
        } else if (groupBy === 'part') {
            var grouped = {};
            list.forEach(function(q) { (grouped[q.part] = grouped[q.part] || []).push(q); });
            Object.keys(grouped).forEach(function(p) {
                html += '<div class="qgroup">'
                    + '<h3 class="qgroup-title">🔧 ' + PART_NAMES[p] + ' <span class="qgroup-count">' + grouped[p].length + ' 题</span></h3>'
                    + grouped[p].map(questionCardHtml).join('')
                    + '</div>';
            });
        } else if (groupBy === 'type') {
            var grouped = { '选择题': [], '大题': [] };
            list.forEach(function(q) { if (grouped[q.type]) grouped[q.type].push(q); });
            Object.keys(grouped).forEach(function(t) {
                if (grouped[t].length === 0) return;
                html += '<div class="qgroup">'
                    + '<h3 class="qgroup-title">📝 ' + t + ' <span class="qgroup-count">' + grouped[t].length + ' 题</span></h3>'
                    + grouped[t].map(questionCardHtml).join('')
                    + '</div>';
            });
        } else {
            // 按年份分组
            var grouped = {};
            list.forEach(function(q) { (grouped[q.year] = grouped[q.year] || []).push(q); });
            Object.keys(grouped).sort(function(a, b) { return b - a; }).forEach(function(y) {
                html += '<div class="qgroup">'
                    + '<h3 class="qgroup-title">📅 ' + y + ' 年 <span class="qgroup-count">' + grouped[y].length + ' 题</span></h3>'
                    + grouped[y].map(questionCardHtml).join('')
                    + '</div>';
            });
        }

        container.innerHTML = html || '<div class="zhenti-empty">没有题目</div>';
        bindCardClicks();
    }

    function chapterTitle(ch) {
        var titles = {
            'ch01': 'ch01 线性表', 'ch02': 'ch02 栈、队列与数组', 'ch03': 'ch03 树与二叉树',
            'ch04': 'ch04 图', 'ch05': 'ch05 查找与排序',
            'ch06': 'ch06 计算机系统概述', 'ch07': 'ch07 数据的表示与运算', 'ch08': 'ch08 存储系统',
            'ch09': 'ch09 指令系统', 'ch10': 'ch10 CPU 结构与流水线', 'ch11': 'ch11 总线与 I/O',
            'ch12': 'ch12 进程管理', 'ch13': 'ch13 内存管理', 'ch14': 'ch14 文件系统',
            'ch15': 'ch15 I/O 与操作系统概述',
            'ch16': 'ch16 网络体系结构', 'ch17': 'ch17 物理层与数据链路层',
            'ch18': 'ch18 网络层', 'ch19': 'ch19 传输层', 'ch20': 'ch20 应用层'
        };
        return titles[ch] || ch;
    }

    // 单题卡片 HTML
    function questionCardHtml(q) {
        var optsHtml = '';
        if (q.options && q.options.length) {
            optsHtml = '<ul class="q-opts">' + q.options.map(function(o) {
                var isAns = o.charAt(0) === q.answer;
                return '<li class="q-opt ' + (isAns ? 'q-opt-ans' : '') + '">' + o + '</li>';
            }).join('') + '</ul>';
        }

        var chapterTags = (q.chapter || []).map(function(ch) {
            return '<button class="q-chap-link" data-chap="' + ch + '">' + ch + '</button>';
        }).join(' ');

        return '<div class="qcard" data-qid="' + q.id + '">'
            + '<div class="qcard-head">'
            + '<div class="qnum">' + q.year + ' · ' + q.num + '</div>'
            + '<div class="qtype">' + q.type + ' · ' + q.score + '分</div>'
            + '<div class="qpart" style="background:' + PART_COLOR[q.part] + '">' + q.part + '</div>'
            + '</div>'
            + '<div class="qtext">' + q.question + '</div>'
            + (optsHtml ? '<div class="qopts-wrap">' + optsHtml + '</div>' : '')
            + '<div class="qcard-foot">'
            + '<span class="qans">✅ 答案：' + q.answer + '</span>'
            + '<span class="qchaps">📚 ' + chapterTags + '</span>'
            + '<button class="qmore">查看解析 →</button>'
            + '</div></div>';
    }

    function bindCardClicks() {
        document.querySelectorAll('#zhentiContentArea .qcard').forEach(function(card) {
            var qid = card.dataset.qid;
            card.querySelector('.qmore').addEventListener('click', function(e) {
                e.stopPropagation();
                openQuestionModal(qid);
            });
            card.addEventListener('click', function() { openQuestionModal(qid); });
        });
        document.querySelectorAll('#zhentiContentArea .q-chap-link').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var ch = this.dataset.chap;
                if (window.__navigateTo) window.__navigateTo(ch);
            });
        });
    }

    // ============= 题目详情弹窗 =============
    function openQuestionModal(qid) {
        var q = allQuestions.find(function(x) { return x.id === qid; });
        if (!q) return;
        var body = document.getElementById('questionModalBody');
        var optsHtml = '';
        if (q.options && q.options.length) {
            optsHtml = '<div class="qm-opts">' + q.options.map(function(o) {
                var isAns = o.charAt(0) === q.answer;
                return '<div class="qm-opt ' + (isAns ? 'qm-opt-ans' : '') + '">' + o + '</div>';
            }).join('') + '</div>';
        }

        var chaptersHtml = (q.chapter || []).map(function(ch) {
            return '<button class="q-chap-link" data-chap="' + ch + '">📘 ' + chapterTitle(ch) + '</button>';
        }).join(' ');

        var kpsHtml = (q.knowledgePoints || []).map(function(k) {
            return '<span class="qm-kp">' + k + '</span>';
        }).join('');

        var tpsHtml = (q.testPoints || []).map(function(t) {
            return '<span class="qm-tp">' + t + '</span>';
        }).join('');

        body.innerHTML =
            '<div class="qm-meta">'
            + '<span class="qm-year">' + q.year + ' 年 第 ' + q.num + ' 题</span>'
            + '<span class="qm-tag">' + q.type + '</span>'
            + '<span class="qm-tag">' + q.score + ' 分</span>'
            + '<span class="qm-tag" style="background:' + PART_COLOR[q.part] + '">' + q.part + '</span>'
            + '</div>'
            + '<div class="qm-question">' + q.question + '</div>'
            + (optsHtml || '')
            + '<div class="qm-answer">✅ <strong>答案：</strong><span class="qm-ans-val">' + q.answer + '</span></div>'
            + '<div class="qm-section"><strong>🎯 考察点：</strong><div class="qm-tps">' + tpsHtml + '</div></div>'
            + '<div class="qm-section"><strong>📚 必备知识点：</strong><div class="qm-kps">' + kpsHtml + '</div></div>'
            + '<div class="qm-section"><strong>🧭 解题套路：</strong><div class="qm-solution">' + q.solution + '</div></div>'
            + '<div class="qm-section"><strong>📖 关联章节：</strong><div class="qm-chapters">' + chaptersHtml + '</div></div>'
            + (q.source ? '<div class="qm-source">来源：' + q.source + '</div>' : '');

        document.getElementById('questionModalTitle').textContent = q.year + ' · 第 ' + q.num + ' 题 · 答案 ' + q.answer;
        document.getElementById('questionModal').hidden = false;

        // 弹窗内章节跳转：先关闭弹窗，再跳转
        body.querySelectorAll('.q-chap-link').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var ch = this.dataset.chap;
                closeQuestionModal();
                if (window.__navigateTo) window.__navigateTo(ch);
            });
        });
    }

    function closeQuestionModal() {
        document.getElementById('questionModal').hidden = true;
    }

    // ============= 章节筛选器（仅 chapter tab 显示） =============
    // ============= Tab 切换 =============
    function bindTabs() {
        document.querySelectorAll('#zhenti .zhenti-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('#zhenti .zhenti-tab').forEach(function(b) {
                    b.classList.toggle('active', b === btn);
                });
                state.tab = this.dataset.tab;
                updateFiltersForTab();
                renderQuestionList();
            });
        });
    }

    function updateFiltersForTab() {
        var filters = document.getElementById('zhentiFilters');
        // 移除旧的章节筛选行（如果有）
        var oldChap = filters.querySelector('.filter-chap-row');
        if (oldChap) oldChap.remove();
        if (state.tab === 'chapter') {
            var div = document.createElement('div');
            div.className = 'filter-row filter-chap-row';
            div.style.marginBottom = '0';
            div.innerHTML = '<div class="filter-group">'
                + '<label class="filter-label">📖 章节</label>'
                + '<div class="filter-pills" id="filterChapter">'
                + '<button class="filter-pill active" data-chap="all">全部</button>';
            for (var i = 1; i <= 20; i++) {
                var cid = 'ch' + (i < 10 ? '0' + i : '' + i);
                var isActive = state.chapterFilter === cid;
                div.innerHTML += '<button class="filter-pill ' + (isActive ? 'active' : '') + '" data-chap="' + cid + '">' + cid + '</button>';
            }
            div.innerHTML += '</div></div>';
            filters.appendChild(div);
            // 绑定
            div.querySelectorAll('.filter-pill').forEach(function(b) {
                b.addEventListener('click', function() {
                    div.querySelectorAll('.filter-pill').forEach(function(x) {
                        x.classList.toggle('active', x === b);
                    });
                    state.chapterFilter = this.dataset.chap;
                    renderQuestionList();
                });
            });
        }
    }

    // ============= 绑定筛选 =============
    function bindFilters() {
        document.querySelectorAll('#filterYear .filter-pill').forEach(function(b) {
            b.addEventListener('click', function() {
                document.querySelectorAll('#filterYear .filter-pill').forEach(function(x) {
                    x.classList.toggle('active', x === b);
                });
                state.year = this.dataset.year;
                renderQuestionList();
            });
        });
        document.querySelectorAll('#filterPart .filter-pill').forEach(function(b) {
            b.addEventListener('click', function() {
                document.querySelectorAll('#filterPart .filter-pill').forEach(function(x) {
                    x.classList.toggle('active', x === b);
                });
                state.part = this.dataset.part;
                renderQuestionList();
            });
        });
        document.querySelectorAll('#filterType .filter-pill').forEach(function(b) {
            b.addEventListener('click', function() {
                document.querySelectorAll('#filterType .filter-pill').forEach(function(x) {
                    x.classList.toggle('active', x === b);
                });
                state.type = this.dataset.type;
                renderQuestionList();
            });
        });
        document.getElementById('zhentiSearch').addEventListener('input', function(e) {
            state.keyword = e.target.value;
            renderQuestionList();
        });
    }

    // ============= 弹窗关闭 =============
    function bindModal() {
        document.getElementById('questionModalClose').addEventListener('click', closeQuestionModal);
        document.getElementById('questionModal').addEventListener('click', function(e) {
            if (e.target === this) closeQuestionModal();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeQuestionModal();
        });
    }

    // ============= 初始化 =============
    function init() {
        renderOverview();
        bindTabs();
        bindFilters();
        bindModal();
        renderQuestionList();
    }

    // 暴露给 app.js 加载 zhenti.html 后调用
    window.initZhentiModule = init;
})();
