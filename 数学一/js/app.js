/**
 * 考研数学一 · 小白上岸手册
 * 章节动态加载与导航逻辑
 */
(function() {
    'use strict';

    // ===== Supabase 客户端（题目掌握记录存储）=====
    const SUPABASE_URL = 'https://yucploakclaznlmfpdkk.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3Bsb2FrY2xhem5sbWZwZGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNjAyNDQsImV4cCI6MjA5OTczNjI0NH0.-VpUDJgIR0KlEReUM5LzSShIwog2YiJgH28QJAj6GHI';
    let db = null;
    if (typeof window.supabase !== 'undefined') {
        try {
            db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: { persistSession: false }
            });
        } catch (e) {
            console.warn('Supabase 初始化失败（将使用本地存储兜底）:', e);
        }
    }

    // ===== 配置 =====
    const CHAPTERS = [
        { id: 'zhenti', file: 'zhenti.html', title: '近5年真题精练', part: '专题', stars: '★★★★★', cls: 'high', score: '40题', special: true },
        { id: 'ch01', file: 'ch01_第一章_函数、极限、连续.html', title: '函数极限连续', part: '一', stars: '★★★★★', cls: 'high', score: '12分' },
        { id: 'ch02', file: 'ch02_第二章_一元函数微分学.html', title: '一元微分', part: '一', stars: '★★★★★', cls: 'high', score: '16分' },
        { id: 'ch03', file: 'ch03_第三章_一元函数积分学.html', title: '一元积分', part: '一', stars: '★★★★★', cls: 'high', score: '16分' },
        { id: 'ch04', file: 'ch04_第四章_向量代数和空间解析几何.html', title: '向量与解析几何', part: '一', stars: '★', cls: 'low', score: '4分' },
        { id: 'ch05', file: 'ch05_第五章_多元函数微分学.html', title: '多元微分', part: '一', stars: '★★★★', cls: 'high', score: '8分' },
        { id: 'ch06', file: 'ch06_第六章_多元函数积分学.html', title: '多元积分', part: '一', stars: '★★', cls: 'low', score: '12分' },
        { id: 'ch07', file: 'ch07_第七章_无穷级数.html', title: '无穷级数', part: '一', stars: '★', cls: 'drop', score: '8分', drop: true },
        { id: 'ch08', file: 'ch08_第八章_常微分方程.html', title: '常微分方程', part: '一', stars: '★★★', cls: 'high', score: '8分' },
        { id: 'ch09', file: 'ch09_第九章_行列式.html', title: '行列式', part: '二', stars: '★★★★', cls: 'high', score: '5分' },
        { id: 'ch10', file: 'ch10_第十章_矩阵.html', title: '矩阵', part: '二', stars: '★★★★', cls: 'high', score: '6分' },
        { id: 'ch11', file: 'ch11_第十一章_向量.html', title: '向量', part: '二', stars: '★★★', cls: 'high', score: '6分' },
        { id: 'ch12', file: 'ch12_第十二章_线性方程组.html', title: '线性方程组', part: '二', stars: '★★★★★', cls: 'high', score: '6分' },
        { id: 'ch13', file: 'ch13_第十三章_特征值与特征向量.html', title: '特征值与特征向量', part: '二', stars: '★★★★★', cls: 'high', score: '6分' },
        { id: 'ch14', file: 'ch14_第十四章_二次型.html', title: '二次型', part: '二', stars: '★★★', cls: 'high', score: '4分' },
        { id: 'ch15', file: 'ch15_第十五章_随机事件和概率.html', title: '随机事件与概率', part: '三', stars: '★★★★', cls: 'high', score: '5分' },
        { id: 'ch16', file: 'ch16_第十六章_随机变量及其分布.html', title: '随机变量及其分布', part: '三', stars: '★★★', cls: 'high', score: '6分' },
        { id: 'ch17', file: 'ch17_第十七章_多维随机变量及其分布.html', title: '多维随机变量', part: '三', stars: '★★', cls: 'low', score: '6分' },
        { id: 'ch18', file: 'ch18_第十八章_随机变量的数字特征.html', title: '数字特征', part: '三', stars: '★★★★', cls: 'high', score: '6分' },
        { id: 'ch19', file: 'ch19_第十九章_大数定律和中心极限定理.html', title: '大数定律与中心极限定理', part: '三', stars: '★', cls: 'drop', score: '4分', drop: true },
        { id: 'ch20', file: 'ch20_第二十章_数理统计的基本概念.html', title: '数理统计基础', part: '三', stars: '★★', cls: 'low', score: '4分' }
    ];

    // 根据 id 查找对应的章节对象
    function findChapter(id) {
        for (var i = 0; i < CHAPTERS.length; i++) {
            if (CHAPTERS[i].id === id) return CHAPTERS[i];
        }
        return null;
    }

    // 根据 id 取文件名（用于 fetch / XHR）
    function chapterFile(id) {
        var ch = findChapter(id);
        return ch ? ch.file : (id + '.html');
    }

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

        // 专题区（真题等特殊模块置顶）
        html += '<div class="nav-part nav-part-special">🎯 真题专题</div>';
        CHAPTERS.forEach(function(ch) {
            if (!ch.special) return;
            var starHtml = '<span class="priority-dot ' + ch.cls + '">' + ch.stars + '</span>';
            html += '<a href="#" data-target="' + ch.id + '" class="nav-special-item"><span class="ch-num">🎯</span>' + ch.title + starHtml + '</a>';
        });

        // 三大板块
        parts.forEach(function(p) {
            html += '<div class="nav-part">' + p + '、' + PART_NAMES[p] + '</div>';
            CHAPTERS.forEach(function(ch) {
                if (ch.part !== p) return;
                var starHtml = '<span class="priority-dot ' + ch.cls + '">' + ch.stars + '</span>';
                html += '<a href="#" data-target="' + ch.id + '"><span class="ch-num">' + ch.id.replace('ch', '') + '</span>' + ch.title + starHtml + '</a>';
            });
        });
        if (sidebarNav) sidebarNav.innerHTML = html;

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

        var url = 'chapters/' + chapterFile(chapterId);

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
        xhr.open('GET', 'chapters/' + chapterFile(chapterId), true);
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
                        + '<p style="margin-top:8px;">请尝试在本地服务器环境下打开此页面，或直接打开 chapters/' + chapterFile(chapterId) + ' 查看。</p>'
                        + '</div>';
                }
            }
        };
        xhr.onerror = function() {
            isLoading = false;
            contentWrap.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#e74c3c;">'
                + '<p style="font-size:18px;font-weight:600;">⚠️ 章节加载失败</p>'
                + '<p style="margin-top:8px;">请尝试在本地服务器环境下打开此页面，或直接打开 chapters/' + chapterFile(chapterId) + ' 查看。</p>'
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
        // 章节内容是动态加载的，KaTeX auto-render 不会自动处理这里
        renderMathWhenReady(contentWrap);
        initChapterTabs(chapterId);

        // 特殊模块：真题精练初始化
        if (chapterId === 'zhenti' && typeof window.initZhentiModule === 'function') {
            window.initZhentiModule();
        }
    }

    // ===== 考研倒计时 =====
    // 默认：2026 年考研（2026-12-19 周六 08:30 开考）
    const DEFAULT_EXAM_DATE = '2026-12-19T08:30:00';
    const EXAM_DATE_KEY = 'kaoyan_exam_date';

    function getExamDate() {
        try {
            const stored = localStorage.getItem(EXAM_DATE_KEY);
            if (stored) return new Date(stored);
        } catch (e) { /* ignore */ }
        return new Date(DEFAULT_EXAM_DATE);
    }

    function setExamDate(iso) {
        try { localStorage.setItem(EXAM_DATE_KEY, iso); } catch (e) { /* ignore */ }
    }

    function pad2(n) { return n < 10 ? '0' + n : '' + n; }

    function updateCountdown() {
        var bar = document.getElementById('countdownBar');
        if (!bar) return;
        var now = new Date();
        var exam = getExamDate();
        var diff = exam - now;

        // 颜色 + 文案状态
        bar.classList.remove('urgent', 'warning', 'critical', 'exam-day', 'exam-over');
        var days = Math.floor(diff / 86400000);

        if (diff < 0) {
            bar.classList.add('exam-over');
            document.getElementById('cbIcon').textContent = '🎉';
            document.getElementById('cbYear').textContent = exam.getFullYear();
            document.getElementById('cdDays').textContent = '完';
            document.getElementById('cdHours').textContent = '成';
            document.getElementById('cdMins').textContent = '！';
            document.getElementById('cdSecs').textContent = '🎓';
            var dateText = exam.getFullYear() + '-' + pad2(exam.getMonth() + 1) + '-' + pad2(exam.getDate()) + ' 已考完';
            document.getElementById('cbDateText').textContent = dateText;
            document.getElementById('cbProgressFill').style.width = '100%';
            document.getElementById('cbProgressText').textContent = '100%';
            return;
        }

        // 显示倒计时
        var totalSec = Math.floor(diff / 1000);
        var d = Math.floor(totalSec / 86400);
        var h = Math.floor((totalSec % 86400) / 3600);
        var m = Math.floor((totalSec % 3600) / 60);
        var s = totalSec % 60;
        document.getElementById('cdDays').textContent = d;
        document.getElementById('cdHours').textContent = pad2(h);
        document.getElementById('cdMins').textContent = pad2(m);
        document.getElementById('cdSecs').textContent = pad2(s);
        document.getElementById('cbYear').textContent = exam.getFullYear();

        var weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        var examDateText = exam.getFullYear() + '-' + pad2(exam.getMonth() + 1) + '-' + pad2(exam.getDate())
            + '（周' + weekDays[exam.getDay()] + '）' + pad2(exam.getHours()) + ':' + pad2(exam.getMinutes()) + ' 开考';
        document.getElementById('cbDateText').textContent = examDateText;

        // 进度条：按「今年 1 月 1 日 → 考试日」作为时间跨度
        var yearStart = new Date(exam.getFullYear(), 0, 1);
        var totalSpan = exam - yearStart;
        var elapsed = now - yearStart;
        var pct = totalSpan > 0 ? Math.max(0, Math.min(100, (elapsed / totalSpan) * 100)) : 0;
        document.getElementById('cbProgressFill').style.width = pct.toFixed(1) + '%';
        document.getElementById('cbProgressText').textContent = pct.toFixed(0) + '%';

        // 颜色状态
        if (d === 0 && h < 24) {
            bar.classList.add('exam-day');
            document.getElementById('cbIcon').textContent = '🚨';
        } else if (d <= 7) {
            bar.classList.add('critical');
            document.getElementById('cbIcon').textContent = '🔥';
        } else if (d <= 30) {
            bar.classList.add('urgent');
            document.getElementById('cbIcon').textContent = '⚠️';
        } else if (d <= 90) {
            bar.classList.add('warning');
            document.getElementById('cbIcon').textContent = '⏰';
        } else {
            document.getElementById('cbIcon').textContent = '⏰';
        }
    }

    function initCountdown() {
        updateCountdown();
        // 每秒更新
        if (window.__countdownTimer) clearInterval(window.__countdownTimer);
        window.__countdownTimer = setInterval(updateCountdown, 1000);
        // 设置按钮
        var btn = document.getElementById('cbSettings');
        if (btn) {
            btn.addEventListener('click', function() {
                var current = getExamDate();
                var defaultStr = current.toISOString().slice(0, 16);
                var input = prompt(
                    '设置考研日期时间（格式：YYYY-MM-DDTHH:mm）\n\n' +
                    '考研通常是 12 月的最后一个周六\n' +
                    '• 2026 考研：2026-12-19\n' +
                    '• 2027 考研：2027-12-18\n' +
                    '• 2028 考研：2028-12-23',
                    defaultStr
                );
                if (input === null) return;
                var d = new Date(input);
                if (isNaN(d.getTime())) {
                    alert('❌ 日期格式不对，请按 YYYY-MM-DDTHH:mm 格式输入');
                    return;
                }
                setExamDate(d.toISOString());
                updateCountdown();
                alert('✅ 已更新考试日期：' + d.toLocaleString('zh-CN'));
            });
        }
    }

    // ===== 章节 Tab 切换（笔记 / 练习）=====
    // 通用做法：所有章节都加 tab，缺数据时练习 tab 显示「暂无练习」
    function initChapterTabs(chapterId) {
        var chContent = contentWrap.querySelector('.ch-content');
        if (!chContent) return;

        // 防止重复插入（切回笔记 tab 后再切章不会重复）
        var oldTabs = chContent.querySelector(':scope > .ch-tabs');
        if (oldTabs) oldTabs.remove();
        var oldPractice = chContent.querySelector(':scope > .ch-practice');
        if (oldPractice) oldPractice.remove();
        var oldFormulas = chContent.querySelector(':scope > .ch-formulas');
        if (oldFormulas) oldFormulas.remove();

        // 注入 tab 栏（放在 ch-content 最前面）
        var tabs = document.createElement('div');
        tabs.className = 'ch-tabs';
        tabs.innerHTML =
            '<button class="ch-tab active" data-mode="notes">📖 笔记</button>' +
            '<button class="ch-tab" data-mode="practice">🎯 练习</button>' +
            '<button class="ch-tab" data-mode="formulas">📐 公式</button>';
        chContent.insertBefore(tabs, chContent.firstChild);

        // 预渲染练习区（隐藏），切到练习 tab 时显示
        var practiceArea = document.createElement('div');
        practiceArea.className = 'ch-practice';
        practiceArea.innerHTML = renderPracticeHTML(chapterId);
        chContent.appendChild(practiceArea);

        // 预渲染公式区（隐藏）
        var formulasArea = document.createElement('div');
        formulasArea.className = 'ch-formulas';
        formulasArea.innerHTML = renderFormulasHTML(chapterId);
        chContent.appendChild(formulasArea);
        // 立即触发渲染（不等用户点击 tab，避免公式区可见时显示原始 LaTeX）
        renderMathWhenReady(formulasArea);

        // tab 切换逻辑
        tabs.querySelectorAll('.ch-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var mode = btn.dataset.mode;
                tabs.querySelectorAll('.ch-tab').forEach(function(b) {
                    b.classList.toggle('active', b === btn);
                });
                chContent.classList.remove('practice-mode', 'formulas-mode');
                if (mode === 'practice') {
                    chContent.classList.add('practice-mode');
                    renderMathWhenReady(practiceArea);
                    initAllMasteryWidgets(practiceArea);
                    initAllNotesWidgets(practiceArea);
                    ensureNotesModal();
                } else if (mode === 'formulas') {
                    chContent.classList.add('formulas-mode');
                    renderMathWhenReady(formulasArea);
                }
                // 滚到章节顶部
                window.scrollTo({ top: chContent.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
            });
        });
    }

    function renderPracticeHTML(chapterId) {
        var problems = (window.PRACTICE_DATA && window.PRACTICE_DATA[chapterId]) || [];
        if (problems.length === 0) {
            return '<div class="practice-header">📝 本章暂无练习题，<strong>预计后续补充</strong>。</div>';
        }
        var header = '<div class="practice-header">'
            + '📝 共 <strong>' + problems.length + '</strong> 道题，涵盖本章高频题型。'
            + '点击「💡 查看提示」按顺序揭示思考过程，<strong>不要直接看最后一步</strong>，先自己做一遍。'
            + '每题右上角有「📊 掌握度」按钮，点击展开记录面板。'
            + '</div>';
        var cards = problems.map(function(p, i) {
            var stars = p.difficulty || '★★';
            var hintsHtml = '<details class="pc-hints"><summary>查看提示（共 ' + p.hints.length + ' 条）</summary><ol>'
                + p.hints.map(function(h) { return '<li>' + h + '</li>'; }).join('')
                + '</ol></details>';
            var toggleHtml = buildMasteryToggleHTML(chapterId, i);
            var panelHtml = buildMasteryPanelHTML(chapterId, i);
            var notesHtml = buildNotesButtonHTML(chapterId, i);
            return '<div class="problem-card">'
                + '<div class="pc-head">'
                + '<div class="pc-num">' + (i + 1) + '</div>'
                + '<div class="pc-type">' + p.type + ' · ' + stars + '</div>'
                + notesHtml
                + toggleHtml
                + '</div>'
                + '<div class="pc-question">' + p.question + '</div>'
                + hintsHtml
                + panelHtml
                + '</div>';
        }).join('');
        return header + cards;
    }

    // ===== 公式速查渲染（精简版：公式 + 证明）=====
    function renderFormulasHTML(chapterId) {
        var data = (window.FORMULA_DATA && window.FORMULA_DATA[chapterId]) || null;
        if (!data || !data.sections || data.sections.length === 0) {
            return '<div class="formulas-header">📐 本章公式速查'
                + '<div class="formulas-empty">该章节公式正在整理中，<strong>先用 ch01 的公式集</strong>'
                + '（<a href="#ch01">点此跳到 ch01</a>）</div></div>';
        }
        var totalItems = data.sections.reduce(function(s, sec) {
            return s + (sec.items ? sec.items.length : 0);
        }, 0);
        var header = '<div class="formulas-header">'
            + '<div class="formulas-title">📐 公式速查 · ' + data.chapter + '</div>'
            + '<div class="formulas-subtitle">共 <strong>' + data.sections.length + '</strong> 个板块 · '
            + '<strong>' + totalItems + '</strong> 个公式。每条 = 公式 + 简要证明</div>'
            + '<div class="formulas-toc">';
        data.sections.forEach(function(sec, idx) {
            header += '<a href="#formula-' + chapterId + '-' + idx + '" class="formulas-toc-item">'
                + sec.title.replace(/^[^\w]+/, '') + '</a>';
        });
        header += '</div></div>';

        var body = data.sections.map(function(sec, idx) {
            var itemsHtml = (sec.items || []).map(function(item) {
                return '<div class="formula-item">'
                    + '<div class="formula-item-head">'
                    +   '<span class="formula-name">' + escapeHtml(item.name) + '</span>'
                    + '</div>'
                    + '<div class="formula-formula">' + item.formula + '</div>'
                    + (item.proof ? '<div class="formula-proof"><span class="proof-tag">证</span>' + item.proof + '</div>' : '')
                    + (item.note ? '<div class="formula-note">⚠ ' + escapeHtml(item.note) + '</div>' : '')
                    + '</div>';
            }).join('');
            return '<div class="formula-section" id="formula-' + chapterId + '-' + idx + '">'
                + '<h3 class="formula-section-title">'
                +   sec.title
                +   (sec.importance ? '<span class="formula-importance">' + sec.importance + '</span>' : '')
                + '</h3>'
                + itemsHtml
                + '</div>';
        }).join('');

        return header + body;
    }

    // ===== 掌握程度追踪（Supabase 持久化 + 本地存储兜底）=====
    function todayStr() {
        var d = new Date();
        var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    // 顶部紧凑按钮（题目右侧，常驻显示）
    function buildMasteryToggleHTML(chapterId, problemIndex) {
        return '<button type="button" class="pc-mastery-toggle" '
            + 'data-role="mastery-toggle" '
            + 'data-chapter="' + chapterId + '" data-pindex="' + problemIndex + '" '
            + 'title="点击展开掌握程度记录">'
            + '<span class="pc-mastery-icon">📊</span>'
            + '<span class="pc-mastery-text" data-role="latest">未记录</span>'
            + '<span class="pc-mastery-arrow">▾</span>'
            + '</button>';
    }

    // 折叠面板（默认隐藏，点击按钮展开）
    function buildMasteryPanelHTML(chapterId, problemIndex) {
        return '<div class="pc-mastery-panel" '
            + 'data-chapter="' + chapterId + '" data-pindex="' + problemIndex + '" '
            + 'data-role="mastery-panel" hidden>'
            + '<div class="pc-mastery-form">'
            + '<div class="pc-mastery-row">'
            +   '<label>掌握度</label>'
            +   '<input type="range" class="pc-mastery-range" min="0" max="100" step="5" value="50">'
            +   '<span class="pc-mastery-value" data-role="value">50%</span>'
            + '</div>'
            + '<div class="pc-mastery-row">'
            +   '<label>日期</label>'
            +   '<input type="date" class="pc-mastery-date" value="' + todayStr() + '">'
            + '</div>'
            + '<div class="pc-mastery-row">'
            +   '<label>备注</label>'
            +   '<input type="text" class="pc-mastery-note" placeholder="可选：第几次复习、错在哪、记忆口诀...">'
            + '</div>'
            + '<div class="pc-mastery-actions">'
            +   '<button type="button" class="pc-mastery-save" data-role="save">💾 保存</button>'
            +   '<button type="button" class="pc-mastery-close" data-role="close">收起 ▲</button>'
            + '</div>'
            + '</div>'
            + '<div class="pc-mastery-history">'
            +   '<div class="pc-history-title">📜 历史记录（按日期倒序）</div>'
            +   '<ul class="pc-history-list" data-role="history">'
            +     '<li class="pc-history-empty">加载中...</li>'
            +   '</ul>'
            + '</div>'
            + '</div>';
    }

    function masteryLevelClass(pct) {
        if (pct >= 80) return 'strong';
        if (pct < 50) return 'weak';
        return '';
    }

    function renderHistoryList(records) {
        if (!records || records.length === 0) {
            return '<li class="pc-history-empty">还没有记录。做完一道题就保存一下，掌握度会跟着日期积累 📈</li>';
        }
        // 按日期倒序排
        var sorted = records.slice().sort(function(a, b) {
            if (a.record_date !== b.record_date) return a.record_date < b.record_date ? 1 : -1;
            return (b.created_at || '') < (a.created_at || '') ? -1 : 1;
        });
        return sorted.map(function(r) {
            var pct = r.mastery_level;
            var color = pct >= 80 ? '#27ae60' : (pct < 50 ? '#e74c3c' : '#f39c12');
            var noteHtml = r.note ? '<span class="hi-note" title="' + escapeAttr(r.note) + '">' + escapeHtml(r.note) + '</span>' : '';
            return '<li class="pc-history-item" data-id="' + r.id + '">'
                + '<span class="hi-date">' + r.record_date + '</span>'
                + '<div class="hi-bar"><div class="hi-bar-fill" style="width:' + pct + '%; background:' + color + '"></div></div>'
                + '<span class="hi-pct" style="color:' + color + '">' + pct + '%</span>'
                + noteHtml
                + '<button class="hi-delete" data-role="del" data-id="' + r.id + '" title="删除此记录">✕</button>'
                + '</li>';
        }).join('');
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function(c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function escapeAttr(s) { return escapeHtml(s); }

    function showMasteryToast(msg, type) {
        var existing = document.querySelector('.pc-mastery-toast');
        if (existing) existing.remove();
        var t = document.createElement('div');
        t.className = 'pc-mastery-toast' + (type === 'error' ? ' error' : type === 'info' ? ' info' : '');
        t.textContent = msg;
        document.body.appendChild(t);
        // 强制重排再加 show
        setTimeout(function() { t.classList.add('show'); }, 10);
        setTimeout(function() {
            t.classList.remove('show');
            setTimeout(function() { t.remove(); }, 300);
        }, 2200);
    }

    // ===== 数据层（Supabase 优先，localStorage 兜底）=====
    function localKey(chapterId, idx) { return 'mastery:' + chapterId + ':' + idx; }
    function localAllKey() { return 'mastery:all'; }

    function loadRecordsLocal(chapterId, problemIndex) {
        try {
            var all = JSON.parse(localStorage.getItem(localAllKey()) || '[]');
            return all.filter(function(r) {
                return r.chapter_id === chapterId && r.problem_index === problemIndex;
            });
        } catch (e) { return []; }
    }
    function saveRecordLocal(rec) {
        try {
            var all = JSON.parse(localStorage.getItem(localAllKey()) || '[]');
            // 用时间戳当 id（仅本地用）
            rec.id = rec.id || ('local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7));
            rec.created_at = rec.created_at || new Date().toISOString();
            all.push(rec);
            localStorage.setItem(localAllKey(), JSON.stringify(all));
            return rec;
        } catch (e) { return null; }
    }
    function deleteRecordLocal(id) {
        try {
            var all = JSON.parse(localStorage.getItem(localAllKey()) || '[]');
            all = all.filter(function(r) { return String(r.id) !== String(id); });
            localStorage.setItem(localAllKey(), JSON.stringify(all));
            return true;
        } catch (e) { return false; }
    }

    async function fetchMasteryRecords(chapterId, problemIndex) {
        if (db) {
            try {
                var res = await db.from('problem_mastery')
                    .select('*')
                    .eq('chapter_id', chapterId)
                    .eq('problem_index', problemIndex);
                if (!res.error && res.data) return res.data;
            } catch (e) { /* fallback */ }
        }
        return loadRecordsLocal(chapterId, problemIndex);
    }

    async function saveMasteryRecord(chapterId, problemIndex, level, dateStr, note) {
        var payload = {
            chapter_id: chapterId,
            problem_index: problemIndex,
            mastery_level: level,
            record_date: dateStr,
            note: note || null
        };
        if (db) {
            try {
                var res = await db.from('problem_mastery').insert(payload).select();
                if (!res.error && res.data && res.data[0]) return res.data[0];
            } catch (e) { /* fallback */ }
        }
        return saveRecordLocal(payload);
    }

    async function deleteMasteryRecordById(id) {
        if (db && String(id).indexOf('local-') !== 0) {
            try {
                var res = await db.from('problem_mastery').delete().eq('id', id);
                if (!res.error) return true;
            } catch (e) { /* fallback */ }
        }
        return deleteRecordLocal(id);
    }

    // ===== 绑定单个 widget 的事件（按 chapter + pindex 配对 toggle 与 panel）=====
    async function initMasteryWidget(chapterId, pIndex) {
        var toggle = document.querySelector(
            '.pc-mastery-toggle[data-chapter="' + chapterId + '"][data-pindex="' + pIndex + '"]'
        );
        var panel = document.querySelector(
            '.pc-mastery-panel[data-chapter="' + chapterId + '"][data-pindex="' + pIndex + '"]'
        );
        if (!toggle || !panel) return;

        var range = panel.querySelector('.pc-mastery-range');
        var valueEl = panel.querySelector('[data-role="value"]');
        var dateEl = panel.querySelector('.pc-mastery-date');
        var noteEl = panel.querySelector('.pc-mastery-note');
        var saveBtn = panel.querySelector('[data-role="save"]');
        var closeBtn = panel.querySelector('[data-role="close"]');
        var arrowEl = toggle.querySelector('.pc-mastery-arrow');
        var latestEl = toggle.querySelector('[data-role="latest"]');
        var historyEl = panel.querySelector('[data-role="history"]');

        // 点击按钮展开/收起
        toggle.addEventListener('click', function() {
            var willOpen = panel.hidden;
            panel.hidden = !willOpen;
            toggle.classList.toggle('open', willOpen);
            if (arrowEl) arrowEl.textContent = willOpen ? '▴' : '▾';
            if (willOpen) {
                // 平滑滚动到面板
                setTimeout(function() {
                    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 50);
            }
        });

        // 关闭按钮
        closeBtn.addEventListener('click', function() {
            panel.hidden = true;
            toggle.classList.remove('open');
            if (arrowEl) arrowEl.textContent = '▾';
        });

        // 实时同步滑块显示
        range.addEventListener('input', function() {
            valueEl.textContent = range.value + '%';
            valueEl.style.color = range.value >= 80 ? '#27ae60' : (range.value < 50 ? '#e74c3c' : '#1a3a5c');
        });

        // 加载历史
        async function reload() {
            historyEl.innerHTML = '<li class="pc-history-empty">加载中...</li>';
            var records = await fetchMasteryRecords(chapterId, pIndex);
            historyEl.innerHTML = renderHistoryList(records);
            // 更新顶部按钮显示
            if (records && records.length > 0) {
                var sorted = records.slice().sort(function(a, b) {
                    return a.record_date < b.record_date ? 1 : -1;
                });
                var latest = sorted[0];
                var cls = masteryLevelClass(latest.mastery_level);
                toggle.className = 'pc-mastery-toggle ' + cls;
                latestEl.textContent = latest.mastery_level + '% · ' + latest.record_date.substring(5); // MM-DD
            } else {
                toggle.className = 'pc-mastery-toggle';
                latestEl.textContent = '未记录';
            }
            // 给删除按钮绑事件
            historyEl.querySelectorAll('[data-role="del"]').forEach(function(btn) {
                btn.addEventListener('click', async function() {
                    var id = btn.getAttribute('data-id');
                    if (!confirm('确定删除这条记录？删除后无法恢复。')) return;
                    btn.disabled = true;
                    var ok = await deleteMasteryRecordById(id);
                    if (ok) {
                        showMasteryToast('✅ 记录已删除');
                        reload();
                    } else {
                        showMasteryToast('❌ 删除失败，请重试', 'error');
                        btn.disabled = false;
                    }
                });
            });
        }
        await reload();

        // 保存
        saveBtn.addEventListener('click', async function() {
            saveBtn.disabled = true;
            var origText = saveBtn.textContent;
            saveBtn.textContent = '保存中...';
            var level = parseInt(range.value, 10);
            var dateStr = dateEl.value || todayStr();
            var note = noteEl.value.trim();
            if (level < 0 || level > 100) {
                showMasteryToast('❌ 掌握度必须在 0-100', 'error');
                saveBtn.disabled = false;
                saveBtn.textContent = origText;
                return;
            }
            var rec = await saveMasteryRecord(chapterId, pIndex, level, dateStr, note);
            if (rec) {
                showMasteryToast('✅ 已保存：' + dateStr + ' · ' + level + '%');
                noteEl.value = '';
                range.value = 50;
                valueEl.textContent = '50%';
                dateEl.value = todayStr();
                await reload();
                // 保存后保持展开状态，方便看新记录
            } else {
                showMasteryToast('❌ 保存失败，请重试', 'error');
            }
            saveBtn.disabled = false;
            saveBtn.textContent = origText;
        });
    }

    // 批量初始化所有 widget（练习 tab 切换后调用）
    function initAllMasteryWidgets(area) {
        if (!area) return;
        var panels = area.querySelectorAll('.pc-mastery-panel');
        panels.forEach(function(panel) {
            var ch = panel.getAttribute('data-chapter');
            var pi = parseInt(panel.getAttribute('data-pindex'), 10);
            initMasteryWidget(ch, pi);
        });
    }

    // ===== 我的笔记（每题隔壁弹窗，localStorage 持久化）=====
    function buildNotesButtonHTML(chapterId, problemIndex) {
        return '<button type="button" class="pc-notes-toggle" '
            + 'data-role="notes-toggle" '
            + 'data-chapter="' + chapterId + '" data-pindex="' + problemIndex + '" '
            + 'title="点击记录本题思考过程（自动保存到浏览器）">'
            + '<span class="pc-notes-icon">📝</span>'
            + '<span class="pc-notes-text" data-role="notes-status">无笔记</span>'
            + '</button>';
    }

    function noteKey(chapterId, problemIndex) {
        return 'note:' + chapterId + ':' + problemIndex;
    }
    function noteSavedAtKey(chapterId, problemIndex) {
        return 'note:' + chapterId + ':' + problemIndex + ':savedAt';
    }
    function loadNote(chapterId, problemIndex) {
        try { return localStorage.getItem(noteKey(chapterId, problemIndex)) || ''; }
        catch (e) { return ''; }
    }
    function saveNote(chapterId, problemIndex, content) {
        try {
            localStorage.setItem(noteKey(chapterId, problemIndex), content);
            localStorage.setItem(noteSavedAtKey(chapterId, problemIndex), new Date().toISOString());
            // 异步同步到云端（不阻塞 UI）
            syncNoteToCloud(chapterId, problemIndex, content);
            return true;
        } catch (e) {
            console.warn('保存笔记失败：', e);
            return false;
        }
    }
    function clearNote(chapterId, problemIndex) {
        try {
            localStorage.removeItem(noteKey(chapterId, problemIndex));
            localStorage.removeItem(noteSavedAtKey(chapterId, problemIndex));
            // 异步删除云端笔记
            deleteNoteFromCloud(chapterId, problemIndex);
            return true;
        } catch (e) { return false; }
    }

    // ===== 笔记云端同步（Supabase）=====
    // 保存笔记到云端（upsert：有则更新，无则插入）
    async function syncNoteToCloud(chapterId, problemIndex, content) {
        if (!db) return;
        try {
            await db.from('problem_notes').upsert({
                chapter_id: chapterId,
                problem_index: problemIndex,
                content: content,
                saved_at: new Date().toISOString()
            }, { onConflict: 'chapter_id, problem_index' });
        } catch (e) { /* 静默失败，localStorage 已有数据，不打扰用户 */ }
    }

    // 从云端删除笔记
    async function deleteNoteFromCloud(chapterId, problemIndex) {
        if (!db) return;
        try {
            await db.from('problem_notes').delete()
                .eq('chapter_id', chapterId)
                .eq('problem_index', problemIndex);
        } catch (e) { /* 静默失败 */ }
    }

    // 全量拉取云端笔记到 localStorage（开机时调用）
    async function syncNotesFromCloud() {
        if (!db) return;
        try {
            var res = await db.from('problem_notes').select('*');
            if (!res.error && res.data && res.data.length > 0) {
                res.data.forEach(function(r) {
                    var localKey = noteKey(r.chapter_id, r.problem_index);
                    var savedAtKey = noteSavedAtKey(r.chapter_id, r.problem_index);
                    var localSavedAt = localStorage.getItem(savedAtKey);
                    // 云端保存时间更新，则覆盖本地
                    if (!localSavedAt || new Date(r.saved_at) > new Date(localSavedAt)) {
                        localStorage.setItem(localKey, r.content || '');
                        localStorage.setItem(savedAtKey, r.saved_at || new Date().toISOString());
                    }
                });
            }
        } catch (e) { /* 静默失败，继续用本地数据 */ }
    }

    // 将 localStorage 里的旧笔记一次推到云端（仅首次运行）
    async function migrateLocalNotesToCloud() {
        if (!db) return;
        var migrationKey = 'notes_migration_done_v1';
        if (localStorage.getItem(migrationKey)) return;
        try {
            var notes = [];
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key && key.indexOf('note:') === 0 && key.indexOf(':savedAt') === -1) {
                    var parts = key.split(':');
                    if (parts.length === 3) {
                        var ch = parts[1];
                        var pi = parseInt(parts[2], 10);
                        var content = localStorage.getItem(key);
                        var savedAt = localStorage.getItem(key + ':savedAt') || new Date().toISOString();
                        if (content) notes.push({ chapter_id: ch, problem_index: pi, content: content, saved_at: savedAt });
                    }
                }
            }
            if (notes.length === 0) { localStorage.setItem(migrationKey, '1'); return; }
            // 逐条 upsert
            for (var j = 0; j < notes.length; j++) {
                await db.from('problem_notes').upsert(notes[j], { onConflict: 'chapter_id, problem_index' });
            }
            localStorage.setItem(migrationKey, '1');
            console.log('🔄 笔记迁移完成：' + notes.length + ' 条本地笔记已同步到云端');
        } catch (e) {
            console.warn('笔记迁移未完成（下次会重试）:', e);
        }
    }

    // 全局弹窗（只渲染一次）
    function ensureNotesModal() {
        if (document.getElementById('pcNotesModal')) return;
        var modalHtml = '<div class="pc-notes-modal" id="pcNotesModal" hidden>'
            + '<div class="pc-notes-modal-overlay" data-role="close-overlay"></div>'
            + '<div class="pc-notes-modal-card" role="dialog" aria-modal="true">'
            +   '<div class="pc-notes-modal-header">'
            +     '<span class="pc-notes-modal-title">📝 记录思考过程 · <span data-role="modal-pnum"></span></span>'
            +     '<button type="button" class="pc-notes-modal-close" data-role="close" title="关闭">×</button>'
            +   '</div>'
            +   '<div class="pc-notes-modal-body">'
            +     '<div class="pc-notes-prompt">📌 建议记录：① 第一眼看到题目怎么想的？② 卡在哪一步？③ 看了答案后哪个地方"原来如此"？④ 下次再遇到类似题怎么做？</div>'
            +     '<textarea class="pc-notes-textarea" data-role="textarea" placeholder="在这里记录你的思考过程、卡壳点、记忆口诀..."></textarea>'
            +     '<div class="pc-notes-meta">字数: <strong data-role="char-count">0</strong> · 上次保存: <span data-role="last-saved">未保存</span></div>'
            +   '</div>'
            +   '<div class="pc-notes-modal-footer">'
            +     '<button type="button" class="pc-notes-btn-clear" data-role="clear">🗑 清空</button>'
            +     '<button type="button" class="pc-notes-btn-cancel" data-role="close">取消</button>'
            +     '<button type="button" class="pc-notes-btn-save" data-role="save">💾 保存</button>'
            +   '</div>'
            + '</div>'
            + '</div>';
        var wrap = document.createElement('div');
        wrap.innerHTML = modalHtml;
        document.body.appendChild(wrap.firstChild);
        bindNotesModalEvents();
    }

    function bindNotesModalEvents() {
        var modal = document.getElementById('pcNotesModal');
        if (!modal || modal.dataset.bound === '1') return;
        modal.dataset.bound = '1';

        // 关闭按钮 / 遮罩
        modal.querySelectorAll('[data-role="close"], [data-role="close-overlay"]').forEach(function(el) {
            el.addEventListener('click', closeNotesModal);
        });

        // 保存
        modal.querySelector('[data-role="save"]').addEventListener('click', function() {
            var textarea = modal.querySelector('[data-role="textarea"]');
            var content = textarea.value;
            if (saveNote(_notesCurChapter, _notesCurProblem, content)) {
                updateNotesButton(_notesCurChapter, _notesCurProblem);
                var lastSaved = modal.querySelector('[data-role="last-saved"]');
                lastSaved.textContent = new Date().toLocaleString('zh-CN');
                flashSaveTip('✅ 已保存到浏览器');
                closeNotesModal();
            } else {
                flashSaveTip('❌ 保存失败（可能浏览器存储已满）');
            }
        });

        // 清空
        modal.querySelector('[data-role="clear"]').addEventListener('click', function() {
            if (!confirm('确定清空这道题的笔记吗？')) return;
            clearNote(_notesCurChapter, _notesCurProblem);
            var textarea = modal.querySelector('[data-role="textarea"]');
            textarea.value = '';
            updateNotesButton(_notesCurChapter, _notesCurProblem);
            updateCharCount();
            var lastSaved = modal.querySelector('[data-role="last-saved"]');
            lastSaved.textContent = '未保存';
            flashSaveTip('🗑 已清空');
        });

        // 实时字数
        modal.querySelector('[data-role="textarea"]').addEventListener('input', updateCharCount);

        // ESC 关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modal.hidden) closeNotesModal();
        });
    }

    var _notesCurChapter = null;
    var _notesCurProblem = null;

    function updateCharCount() {
        var modal = document.getElementById('pcNotesModal');
        if (!modal) return;
        var textarea = modal.querySelector('[data-role="textarea"]');
        var counter = modal.querySelector('[data-role="char-count"]');
        if (textarea && counter) counter.textContent = textarea.value.length;
    }

    function openNotesModal(chapterId, problemIndex) {
        ensureNotesModal();
        var modal = document.getElementById('pcNotesModal');
        if (!modal) return;
        _notesCurChapter = chapterId;
        _notesCurProblem = problemIndex;

        var content = loadNote(chapterId, problemIndex);
        var textarea = modal.querySelector('[data-role="textarea"]');
        var pnum = modal.querySelector('[data-role="modal-pnum"]');
        var lastSaved = modal.querySelector('[data-role="last-saved"]');
        var charCount = modal.querySelector('[data-role="char-count"]');

        textarea.value = content;
        pnum.textContent = '第 ' + (problemIndex + 1) + ' 题';
        charCount.textContent = content.length;

        var savedAt = localStorage.getItem(noteSavedAtKey(chapterId, problemIndex));
        if (savedAt) {
            lastSaved.textContent = new Date(savedAt).toLocaleString('zh-CN');
        } else {
            lastSaved.textContent = '未保存';
        }

        modal.hidden = false;
        // 锁定 body 滚动
        document.body.style.overflow = 'hidden';
        setTimeout(function() { textarea.focus(); }, 100);
    }

    function closeNotesModal() {
        var modal = document.getElementById('pcNotesModal');
        if (modal) {
            modal.hidden = true;
            document.body.style.overflow = '';
        }
    }

    function flashSaveTip(msg) {
        var tip = document.createElement('div');
        tip.className = 'pc-notes-tip';
        tip.textContent = msg;
        document.body.appendChild(tip);
        setTimeout(function() { tip.classList.add('pc-notes-tip-show'); }, 10);
        setTimeout(function() {
            tip.classList.remove('pc-notes-tip-show');
            setTimeout(function() { tip.remove(); }, 300);
        }, 1800);
    }

    function updateNotesButton(chapterId, problemIndex) {
        var btn = document.querySelector('.pc-notes-toggle[data-chapter="' + chapterId + '"][data-pindex="' + problemIndex + '"]');
        if (!btn) return;
        var content = loadNote(chapterId, problemIndex);
        var statusEl = btn.querySelector('[data-role="notes-status"]');
        if (content && content.length > 0) {
            statusEl.textContent = '有笔记 ✓';
            btn.classList.add('has-notes');
        } else {
            statusEl.textContent = '无笔记';
            btn.classList.remove('has-notes');
        }
    }

    function initAllNotesWidgets(area) {
        if (!area) return;
        var toggles = area.querySelectorAll('.pc-notes-toggle');
        toggles.forEach(function(btn) {
            var ch = btn.getAttribute('data-chapter');
            var pi = parseInt(btn.getAttribute('data-pindex'), 10);
            // 更新状态
            updateNotesButton(ch, pi);
            // 点击打开
            btn.addEventListener('click', function() {
                openNotesModal(ch, pi);
            });
        });
    }

    // ===== KaTeX 数学公式渲染（直接调 katex.render，避免 auto-render 时序坑）=====
    // 关键：用 [\s\S] 跨行匹配 display mode（\[...\]、$$...$$），解决公式被换行拆成多 text node 时渲染失败的问题
    var MATH_PATTERN = /\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$|\$([^\$]+?)\$/g;
    // ⚠️ 关键修复：MATH_PATTERN 带 g 标志时 .test() 是有状态的（lastIndex 不重置），
    //    连续调用会让后续文本节点检测失败。给 TreeWalker 用一个独立的、非全局的检测正则。
    var MATH_DETECT = /\\\(|\\\[|\$\$|\$/;

    function renderMath(target) {
        if (typeof target === 'undefined' || !target) return;
        if (typeof katex === 'undefined' || typeof katex.renderToString !== 'function') return;

        // 先合并 target 内相邻的 text node（解决 \[\n...\n\] 被拆成 3 个 text node 的问题）
        if (typeof target.normalize === 'function') target.normalize();

        // 优先尝试 auto-render 的 renderMathInElement（更稳健，处理了所有边界情况）
        if (typeof renderMathInElement === 'function') {
            try {
                renderMathInElement(target, {
                    delimiters: [
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true },
                        { left: '$$',   right: '$$',   display: true },
                        { left: '$',    right: '$',    display: false }
                    ],
                    throwOnError: false,
                    strict: false,
                    trust: false
                });
                return;
            } catch (e) {
                console.warn('[renderMath] renderMathInElement 失败，回退到手动渲染:', e);
            }
        }

        // 回退：手动 TreeWalker 渲染
        var walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
                // 只跳过 <script> 和 <style> 里的文本；<code> 里的公式也要渲染
                var p = node.parentNode;
                while (p && p !== target) {
                    var tag = p.tagName;
                    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    p = p.parentNode;
                }
                return MATH_DETECT.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        var nodes = [];
        var n;
        while ((n = walker.nextNode())) nodes.push(n);

        nodes.forEach(function(textNode) {
            var html = textNode.nodeValue;
            html = html.replace(MATH_PATTERN, function(match, g1, g2, g3, g4) {
                try {
                    if (g1 !== undefined) {
                        return katex.renderToString(g1, { displayMode: false, throwOnError: false });
                    } else if (g2 !== undefined) {
                        return katex.renderToString(g2, { displayMode: true,  throwOnError: false });
                    } else if (g3 !== undefined) {
                        return katex.renderToString(g3, { displayMode: true,  throwOnError: false });
                    } else if (g4 !== undefined) {
                        return katex.renderToString(g4, { displayMode: false, throwOnError: false });
                    }
                } catch (e) { /* 保留原文 */ }
                return match;
            });
            // 用 span 包裹新的 HTML，逐个插入到原文本节点位置
            var span = document.createElement('span');
            span.innerHTML = html;
            var parent = textNode.parentNode;
            while (span.firstChild) parent.insertBefore(span.firstChild, textNode);
            parent.removeChild(textNode);
        });
    }

    function renderMathWhenReady(target, tries) {
        tries = tries || 0;
        if (typeof katex !== 'undefined') {
            try { renderMath(target); } catch (e) { console.warn('KaTeX render err:', e); }
        } else if (tries < 60) {  // 最多等 ~6 秒
            setTimeout(function() { renderMathWhenReady(target, tries + 1); }, 100);
        } else {
            console.warn('KaTeX 未在 6s 内加载完成');
        }
    }

    // 暴露到 window，供外部模块（如 zhenti.js）复用 KaTeX 渲染逻辑
    window.renderMathWhenReady = renderMathWhenReady;
    window.renderMath = renderMath;
    window.MATH_PATTERN = MATH_PATTERN;
    window.MATH_DETECT = MATH_DETECT;

    // ===== 自动收集本章所有 part-divider 和 tag-float，生成右侧要点导航 =====
    function buildOutline() {
        var list = document.getElementById('outlineList');
        if (!list) return;
        var parts = Array.from(contentWrap.querySelectorAll('.part-divider'));
        var floats = Array.from(contentWrap.querySelectorAll('.tag-float'));
        if (parts.length === 0 && floats.length === 0) {
            list.innerHTML = '<div style="font-size:12px;color:#95a5a6;padding:6px;">本章暂无要点</div>';
            return;
        }
        // 合并两类节点，按 DOM 顺序排序
        var items = [];
        parts.forEach(function(el) {
            var nameEl = el.querySelector('.pd-name');
            var numEl = el.querySelector('.pd-num');
            var name = nameEl ? nameEl.textContent.trim() : '';
            var num = numEl ? numEl.textContent.trim() : '';
            // 复用已有 id (part1, part2...)，没有就生成
            if (!el.id) el.id = 'part-' + num;
            items.push({
                kind: 'part',
                el: el,
                id: el.id,
                label: 'P' + num + ' · ' + name,
                sortKey: 0
            });
        });
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
            if (!el.id) el.id = 'pt-' + i;
            items.push({
                kind: 'float',
                el: el,
                id: el.id,
                label: icon + title,
                sortKey: 1
            });
        });
        // 按 DOM 顺序排序（比较两个节点在文档中的位置）
        items.sort(function(a, b) {
            var pos = a.el.compareDocumentPosition(b.el);
            if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
            if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
            return 0;
        });
        var html = '';
        items.forEach(function(it) {
            var cls = it.kind === 'part' ? ' class="outline-part"' : '';
            html += '<a' + cls + ' data-target="' + it.id + '">' + it.label + '</a>';
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
        // 收集所有带 id 的 part-divider + tag-float
        var sections = [];
        contentWrap.querySelectorAll('.part-divider[id], .tag-float[id]').forEach(function(el) {
            sections.push(el);
        });
        var current = null;
        sections.forEach(function(el) {
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
                fetch('chapters/' + chapterFile(nextId))
                    .then(function(r) { if (r.ok) return r.text(); })
                    .then(function(html) { if (html) loadedChapters[nextId] = html; })
                    .catch(function() {});
            }
        }
    }

    // ===== Back to top =====
    if (backToTop) {
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
    }

    // ===== 暴露导航函数给全局（用于按钮点击） =====
    window.__navigateTo = function(chapterId) {
        navigateTo(chapterId);
    };

    // ===== 番茄钟 =====
    const POMO_KEY = 'pomodoro_data_v1';

    const POMO_PRESETS = [
        { id: 'classic', name: '经典 25+5', icon: '🍅', work: 25, break: 5 },
        { id: 'long',    name: '深度 50+10', icon: '🎯', work: 50, break: 10 },
        { id: 'short',   name: '短时 15+3', icon: '⚡', work: 15, break: 3 },
        { id: 'pomo4',   name: '考试模拟 180', icon: '📝', work: 180, break: 0 },
        { id: 'custom',  name: '自定义', icon: '⚙️', work: 30, break: 5 }
    ];

    let pomoState = null;     // 当前会话状态
    let pomoTimer = null;     // setInterval 句柄
    let pomoData = null;      // 持久化数据
    let audioCtx = null;      // Web Audio 上下文

    function loadPomoData() {
        try {
            const raw = localStorage.getItem(POMO_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        return {
            presetId: 'classic',
            customWork: 30,
            customBreak: 5,
            settings: { autoBreak: true, autoNext: true, notify: true, sound: true, volume: 60, alarmType: 'bell' },
            history: [],          // {date, type:'work'|'break', minutes, ts}
            lastDate: null,       // 上次使用的日期
            streak: 0             // 连续天数
        };
    }

    function savePomoData() {
        try { localStorage.setItem(POMO_KEY, JSON.stringify(pomoData)); } catch (e) {}
    }

    function pad2(n) { return n < 10 ? '0' + n : '' + n; }
    function msToClock(ms) {
        if (ms < 0) ms = 0;
        var total = Math.ceil(ms / 1000);
        var m = Math.floor(total / 60);
        var s = total % 60;
        return pad2(m) + ':' + pad2(s);
    }
    function todayStr() {
        var d = new Date(), p = function(n) { return n < 10 ? '0' + n : '' + n; };
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }

    function getCurrentPreset() {
        var p = POMO_PRESETS.find(function(x) { return x.id === pomoData.presetId; });
        if (!p) return POMO_PRESETS[0];
        if (p.id === 'custom') {
            p.work = pomoData.customWork;
            p.break = pomoData.customBreak;
        }
        return p;
    }

    function startSession() {
        if (!pomoState) {
            pomoState = {
                phase: 'work',            // 'work' | 'break'
                presetId: pomoData.presetId,
                startAt: Date.now(),
                duration: getCurrentPreset().work * 60 * 1000,
                paused: false,
                pausedAt: 0,
                pausedAccum: 0
            };
        } else if (pomoState.paused) {
            pomoState.pausedAccum += Date.now() - pomoState.pausedAt;
            pomoState.paused = false;
        } else {
            // 新一轮
            pomoState.phase = pomoState.phase === 'work' ? 'break' : 'work';
            pomoState.startAt = Date.now();
            pomoState.pausedAccum = 0;
            var preset = getCurrentPreset();
            pomoState.duration = (pomoState.phase === 'work' ? preset.work : preset.break) * 60 * 1000;
        }
        savePomoData();
        if (pomoTimer) clearInterval(pomoTimer);
        pomoTimer = setInterval(tickPomo, 250);
        tickPomo();
    }

    function pauseSession() {
        if (!pomoState || pomoState.paused) return;
        pomoState.paused = true;
        pomoState.pausedAt = Date.now();
        if (pomoTimer) { clearInterval(pomoTimer); pomoTimer = null; }
        renderPomoUI();
    }

    function resumeSession() {
        if (!pomoState || !pomoState.paused) return;
        startSession();  // 复用 startSession 的 resume 逻辑
    }

    function resetSession() {
        if (pomoTimer) { clearInterval(pomoTimer); pomoTimer = null; }
        pomoState = null;
        renderPomoUI();
    }

    function skipPhase() {
        if (!pomoState) return;
        finishPhase(true);  // skip=true 跳过不计入历史
    }

    function getRemaining() {
        if (!pomoState) return 0;
        var elapsed = pomoState.paused ? (pomoState.pausedAt - pomoState.startAt - pomoState.pausedAccum) :
                                      (Date.now() - pomoState.startAt - pomoState.pausedAccum);
        return pomoState.duration - elapsed;
    }

    function tickPomo() {
        var remaining = getRemaining();
        if (remaining <= 0) {
            finishPhase(false);
            return;
        }
        // 更新 title（让用户在切 tab 时也能看到时间）
        if (pomoState) {
            document.title = msToClock(remaining) + ' · ' + (pomoState.phase === 'work' ? '🍅' : '☕') + ' | 考研数学一';
        }
        renderPomoUI();
    }

    function finishPhase(skipped) {
        if (pomoTimer) { clearInterval(pomoTimer); pomoTimer = null; }
        var wasWork = pomoState && pomoState.phase === 'work';
        var dur = pomoState ? pomoState.duration : 0;

        // 记录历史
        if (!skipped && wasWork && dur > 0) {
            var min = Math.round(dur / 60000);
            pomoData.history.push({
                date: todayStr(),
                type: 'work',
                minutes: min,
                ts: Date.now()
            });
            // 连续天数
            if (pomoData.lastDate !== todayStr()) {
                var yest = new Date(Date.now() - 86400000);
                var yestStr = yest.getFullYear() + '-' + pad2(yest.getMonth() + 1) + '-' + pad2(yest.getDate());
                if (pomoData.lastDate === yestStr || pomoData.lastDate === null) {
                    pomoData.streak = (pomoData.lastDate === yestStr) ? pomoData.streak + 1 : 1;
                } else {
                    pomoData.streak = 1;
                }
                pomoData.lastDate = todayStr();
            }
            savePomoData();
        }

        // 通知
        var shouldSound = pomoData.settings.sound && !skipped;
        var shouldNotify = pomoData.settings.notify && !skipped;
        if (shouldSound) playAlarm();
        if (shouldNotify) sendNotification(wasWork ? '🍅 专注完成！' : '☕ 休息结束！', wasWork ? '该休息一下啦' : '回到工作');
        flashScreen();

        // 自动开始下一阶段
        var preset = getCurrentPreset();
        if (wasWork && pomoData.settings.autoBreak && preset.break > 0) {
            // 进入休息
            pomoState = {
                phase: 'break',
                presetId: pomoData.presetId,
                startAt: Date.now(),
                duration: preset.break * 60 * 1000,
                paused: false,
                pausedAt: 0,
                pausedAccum: 0
            };
        } else if (!wasWork && pomoData.settings.autoNext && preset.work > 0) {
            // 休息结束，开始下一轮专注
            pomoState = {
                phase: 'work',
                presetId: pomoData.presetId,
                startAt: Date.now(),
                duration: preset.work * 60 * 1000,
                paused: false,
                pausedAt: 0,
                pausedAccum: 0
            };
        } else {
            // 不自动开始
            pomoState = null;
        }

        if (pomoState) {
            pomoTimer = setInterval(tickPomo, 250);
        }
        renderPomoUI();
    }

    function playAlarm() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') audioCtx.resume();
            var vol = (pomoData.settings.volume || 60) / 100;
            var type = pomoData.settings.alarmType || 'bell';
            var now = audioCtx.currentTime;

            if (type === 'bell') {
                // 钟声：三个柔和的钟音
                [523.25, 659.25, 783.99].forEach(function(f, i) {
                    playTone(f, now + i * 0.4, 0.8, vol * 0.4, 'sine');
                });
            } else if (type === 'chime') {
                // 风铃：高频清脆短音
                [1318.51, 1567.98, 2093.00, 2637.02].forEach(function(f, i) {
                    playTone(f, now + i * 0.15, 0.15, vol * 0.5, 'sine');
                });
            } else if (type === 'beep') {
                // 蜂鸣：强烈短促
                for (var i = 0; i < 4; i++) {
                    playTone(880, now + i * 0.25, 0.2, vol * 0.6, 'square');
                }
            } else if (type === 'melody') {
                // 旋律：5 个音
                [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach(function(f, i) {
                    playTone(f, now + i * 0.2, 0.3, vol * 0.45, 'triangle');
                });
            }
        } catch (e) { console.warn('闹钟播放失败:', e); }
    }

    function playTone(freq, when, duration, volume, type) {
        if (!audioCtx) return;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, when);
        gain.gain.linearRampToValueAtTime(volume, when + 0.02);
        gain.gain.linearRampToValueAtTime(0, when + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(when);
        osc.stop(when + duration);
    }

    function sendNotification(title, body) {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') {
            new Notification(title, { body: body, icon: '🍅' });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function(p) {
                if (p === 'granted') new Notification(title, { body: body, icon: '🍅' });
            });
        }
    }

    function flashScreen() {
        document.body.classList.add('pomo-flash');
        setTimeout(function() { document.body.classList.remove('pomo-flash'); }, 1300);
    }

    function selectPreset(presetId) {
        pomoData.presetId = presetId;
        savePomoData();
        renderPomoUI();
    }

    function renderPomoUI() {
        var floatBtn = document.getElementById('pomoFloatBtn');
        var floatTime = document.getElementById('pomoFloatTime');
        var floatIcon = document.getElementById('pomoFloatIcon');
        var ringFg = document.getElementById('pomoRingFg');
        var bigRingFg = document.getElementById('pomoBigRingFg');
        var timeDisplay = document.getElementById('pomoTimeDisplay');
        var stateDisplay = document.getElementById('pomoStateDisplay');
        var startBtn = document.getElementById('pomoStartBtn');
        var pauseBtn = document.getElementById('pomoPauseBtn');
        var resumeBtn = document.getElementById('pomoResumeBtn');
        var resetBtn = document.getElementById('pomoResetBtn');
        var skipBtn = document.getElementById('pomoSkipBtn');
        var circleWrap = document.querySelector('.pomo-circle-wrap');
        var presetsBox = document.getElementById('pomoPresets');
        var customSection = document.getElementById('pomoCustomSection');
        var todayCount = document.getElementById('pomoTodayCount');
        var todayMin = document.getElementById('pomoTodayMin');
        var streakEl = document.getElementById('pomoStreak');
        var historyEl = document.getElementById('pomoHistory');

        // 渲染预设按钮
        if (presetsBox && !presetsBox.children.length) {
            presetsBox.innerHTML = POMO_PRESETS.map(function(p) {
                return '<button class="pomo-preset" data-id="' + p.id + '"><span class="preset-icon">' + p.icon + '</span>' + p.name + '</button>';
            }).join('');
            presetsBox.querySelectorAll('.pomo-preset').forEach(function(btn) {
                btn.addEventListener('click', function() { selectPreset(btn.dataset.id); });
            });
        }
        // 高亮当前预设
        presetsBox.querySelectorAll('.pomo-preset').forEach(function(b) {
            b.classList.toggle('active', b.dataset.id === pomoData.presetId);
        });
        // 自定义面板显隐
        if (customSection) customSection.hidden = pomoData.presetId !== 'custom';
        if (customSection && customSection.hidden === false) {
            document.getElementById('pomoWorkMin').value = pomoData.customWork;
            document.getElementById('pomoBreakMin').value = pomoData.customBreak;
        }

        // 状态显示
        var remaining = pomoState ? getRemaining() : (getCurrentPreset().work * 60 * 1000);
        var isWork = !pomoState || pomoState.phase === 'work';
        var running = pomoState && !pomoState.paused;
        var paused = pomoState && pomoState.paused;

        // 圆环进度
        var total = pomoState ? pomoState.duration : (getCurrentPreset().work * 60 * 1000);
        var progress = total > 0 ? (total - remaining) / total : 0;
        var offset = 175.93 * (1 - progress);
        if (ringFg) ringFg.style.strokeDashoffset = offset;
        if (bigRingFg) bigRingFg.style.strokeDashoffset = 565.48 * (1 - progress);

        // 时间显示
        if (floatTime) floatTime.textContent = msToClock(remaining);
        if (timeDisplay) timeDisplay.textContent = msToClock(remaining);

        // 状态文字
        if (stateDisplay) {
            if (paused) stateDisplay.textContent = '⏸ 已暂停';
            else if (running) stateDisplay.textContent = isWork ? '🔥 专注中...' : '☕ 休息中...';
            else stateDisplay.textContent = '准备开始';
        }

        // 浮动按钮样式
        if (floatBtn) {
            floatBtn.classList.toggle('running', running);
            floatBtn.classList.toggle('break', !isWork && pomoState);
            floatBtn.classList.toggle('paused', paused);
        }
        if (floatIcon) {
            floatIcon.textContent = isWork ? '🍅' : '☕';
        }
        if (circleWrap) circleWrap.classList.toggle('break', !isWork && pomoState);

        // 按钮显示
        if (startBtn) startBtn.hidden = running || paused;
        if (pauseBtn) pauseBtn.hidden = !running;
        if (resumeBtn) resumeBtn.hidden = !paused;
        if (startBtn) startBtn.textContent = pomoState ? '▶ 继续' : '▶ 开始';
        // 重置和跳过只在有会话时显示
        if (resetBtn) resetBtn.hidden = !pomoState;
        if (skipBtn) skipBtn.hidden = !pomoState;

        // 今日统计
        var todayList = pomoData.history.filter(function(h) { return h.date === todayStr() && h.type === 'work'; });
        var todayMinSum = todayList.reduce(function(s, h) { return s + h.minutes; }, 0);
        if (todayCount) todayCount.textContent = todayList.length;
        if (todayMin) todayMin.textContent = todayMinSum;
        if (streakEl) streakEl.textContent = pomoData.streak || 0;

        // 历史列表
        if (historyEl) {
            var recent = pomoData.history.slice(-10).reverse();
            if (recent.length === 0) {
                historyEl.innerHTML = '<div class="pomo-history-empty">还没有完成记录，开始第一个番茄吧 🍅</div>';
            } else {
                historyEl.innerHTML = recent.map(function(h) {
                    var time = new Date(h.ts);
                    var hh = pad2(time.getHours()), mm = pad2(time.getMinutes());
                    return '<div class="pomo-history-item"><span>' + h.date + ' ' + hh + ':' + mm + '</span><span>🍅 ' + h.minutes + ' 分钟</span></div>';
                }).join('');
            }
        }

        // title 还原
        if (!pomoState) document.title = '考研数学一 · 小白上岸手册 | 目标80分';
    }

    function initPomodoro() {
        pomoData = loadPomoData();

        // 元素引用
        var floatBtn = document.getElementById('pomoFloatBtn');
        var panel = document.getElementById('pomoPanel');
        var closeBtn = document.getElementById('pomoClose');
        var startBtn = document.getElementById('pomoStartBtn');
        var pauseBtn = document.getElementById('pomoPauseBtn');
        var resumeBtn = document.getElementById('pomoResumeBtn');
        var resetBtn = document.getElementById('pomoResetBtn');
        var skipBtn = document.getElementById('pomoSkipBtn');

        // 浮动按钮：打开/关闭面板
        if (floatBtn) {
            floatBtn.addEventListener('click', function() {
                panel.hidden = !panel.hidden;
                if (!panel.hidden) {
                    renderPomoUI();
                    // 请求通知权限（首次）
                    if (pomoData.settings.notify && 'Notification' in window && Notification.permission === 'default') {
                        Notification.requestPermission();
                    }
                }
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                panel.hidden = true;
            });
        }

        // 控制按钮
        if (startBtn) startBtn.addEventListener('click', startSession);
        if (pauseBtn) pauseBtn.addEventListener('click', pauseSession);
        if (resumeBtn) resumeBtn.addEventListener('click', resumeSession);
        if (resetBtn) resetBtn.addEventListener('click', resetSession);
        if (skipBtn) skipBtn.addEventListener('click', skipPhase);

        // 保存自定义时长
        var saveCustomBtn = document.getElementById('pomoSaveCustom');
        if (saveCustomBtn) {
            saveCustomBtn.addEventListener('click', function() {
                var w = parseInt(document.getElementById('pomoWorkMin').value, 10);
                var b = parseInt(document.getElementById('pomoBreakMin').value, 10);
                if (w >= 1 && w <= 180 && b >= 0 && b <= 60) {
                    pomoData.customWork = w;
                    pomoData.customBreak = b;
                    savePomoData();
                    showPomoToast('✅ 自定义时长已保存：' + w + '+' + b + ' 分钟');
                    renderPomoUI();
                } else {
                    showPomoToast('⚠️ 专注 1-180 分钟，休息 0-60 分钟');
                }
            });
        }

        // 设置项绑定
        ['pomoAutoBreak','pomoAutoNext','pomoNotify','pomoSound'].forEach(function(id) {
            var el = document.getElementById(id);
            if (!el) return;
            var key = id.replace('pomo', '');
            key = key.charAt(0).toLowerCase() + key.slice(1);
            el.checked = pomoData.settings[key];
            el.addEventListener('change', function() {
                pomoData.settings[key] = el.checked;
                savePomoData();
            });
        });
        var volEl = document.getElementById('pomoVolume');
        if (volEl) {
            volEl.value = pomoData.settings.volume;
            volEl.addEventListener('input', function() {
                pomoData.settings.volume = parseInt(volEl.value, 10);
                savePomoData();
            });
        }
        var alarmEl = document.getElementById('pomoAlarmType');
        if (alarmEl) {
            alarmEl.value = pomoData.settings.alarmType;
            alarmEl.addEventListener('change', function() {
                pomoData.settings.alarmType = alarmEl.value;
                savePomoData();
                // 试听一下
                playAlarm();
            });
        }

        renderPomoUI();

        // 键盘快捷键：空格暂停/继续
        document.addEventListener('keydown', function(e) {
            // 在输入框/文本域中不触发
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.code === 'Space' && pomoState) {
                e.preventDefault();
                if (pomoState.paused) resumeSession(); else pauseSession();
            }
        });
    }

    function showPomoToast(msg) {
        var t = document.createElement('div');
        t.style.cssText = 'position:fixed;top:100px;right:24px;background:#27ae60;color:#fff;padding:8px 16px;border-radius:6px;font-size:13px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function() { t.remove(); }, 2200);
    }

    // ===== 初始化 =====
    function init() {
        buildSidebar();

        // 启动考研倒计时
        initCountdown();

        // 启动番茄钟
        initPomodoro();

        // 从云端恢复笔记（换端口/换电脑后确保笔记不丢）
        syncNotesFromCloud();
        migrateLocalNotesToCloud();

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
