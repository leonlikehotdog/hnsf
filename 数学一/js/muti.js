/*
 * 考研数学一 ·「母题 22 炼」板块主逻辑
 * =================================================
 * - 数据源：window.MUTI_DATA（chapters/muti_data.js）
 * - 卡片内 1/2/3/4/5 按钮切换：母题 / 概念 / 计算 / 公式 / 创新
 * - 掌握度 / 笔记：复用 app.js 暴露的 __mastery / __notes 绑定逻辑
 * - 知识点跳转：window.__navigateTo + 自动切到练习 Tab
 * - 数学渲染：window.renderMathWhenReady
 */

(function() {
    'use strict';

    const DATA = (window.MUTI_DATA && Array.isArray(window.MUTI_DATA.slots)) ? window.MUTI_DATA.slots : null;
    const META = window.MUTI_DATA ? (window.MUTI_DATA.meta || {}) : { total: 22, ready: 0 };
    const DIM_NAMES = ['母题', '概念', '计算', '公式', '创新'];

    /* ===== 22 个题位规划（未收录槽位的路线图，分批补齐对齐此表）===== */
    const SLOT_PLAN = [
        { slot: 1,  part: '高数', type: '选择题', topic: '极限与连续（变限积分）' },
        { slot: 2,  part: '高数', type: '选择题', topic: '导数定义与可导性' },
        { slot: 3,  part: '高数', type: '选择题', topic: '定积分与反常积分' },
        { slot: 4,  part: '高数', type: '选择题', topic: '极值、拐点与函数性态' },
        { slot: 5,  part: '线代', type: '选择题', topic: '行列式与二次型' },
        { slot: 6,  part: '线代', type: '选择题', topic: '相似对角化判定' },
        { slot: 7,  part: '线代', type: '选择题', topic: '向量组与矩阵的秩' },
        { slot: 8,  part: '概率', type: '选择题', topic: '随机变量与常见分布' },
        { slot: 9,  part: '概率', type: '选择题', topic: '数字特征（期望/方差/相关）' },
        { slot: 10, part: '概率', type: '选择题', topic: '统计量分布与估计' },
        { slot: 11, part: '高数', type: '填空题', topic: '极限与等价无穷小' },
        { slot: 12, part: '高数', type: '填空题', topic: '导数与微分' },
        { slot: 13, part: '高数', type: '填空题', topic: '二重积分与换序' },
        { slot: 14, part: '高数', type: '填空题', topic: '级数与微分方程' },
        { slot: 15, part: '线代', type: '填空题', topic: '行列式/方程组/二次型' },
        { slot: 16, part: '概率', type: '填空题', topic: '分布的概率计算' },
        { slot: 17, part: '高数', type: '解答题', topic: '极限与积分计算' },
        { slot: 18, part: '高数', type: '解答题', topic: '多元微分与最值' },
        { slot: 19, part: '高数', type: '解答题', topic: '中值定理与证明' },
        { slot: 20, part: '高数', type: '解答题', topic: '曲线曲面积分（格林/高斯）' },
        { slot: 21, part: '线代', type: '解答题', topic: '二次型/对角化/矩阵幂' },
        { slot: 22, part: '概率', type: '解答题', topic: '随机变量函数分布/参数估计' }
    ];

    const PART_CNT = { '高数': 0, '线代': 0, '概率': 0 };
    SLOT_PLAN.forEach(s => { PART_CNT[s.part] = (PART_CNT[s.part] || 0) + 1; });

    let els = {};
    let state = { part: 'all', type: 'all', dim: 0, mastery: 'all' };

    /* ===== 工具 ===== */
    function esc(s) {
        if (s === null || s === undefined) return '';
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function byId(id) { return document.getElementById(id); }
    function slotDataByNum(slotNum) {
        if (!DATA) return null;
        for (var i = 0; i < DATA.length; i++) {
            if (DATA[i].slot === slotNum) return DATA[i];
        }
        return null;
    }
    function sourceBadge(source) {
        var s = source || { rank: 3, label: 'AI创新', detail: '' };
        var rankCls = 'rank-' + (s.rank || 3);
        return '<span class="muti-source-badge ' + rankCls + '">' + esc(s.label || '来源') + '</span>'
            + '<details class="muti-source-toggle"><summary>📄 来源依据</summary>'
            + '<div class="muti-source-detail">' + esc(s.detail || '') + '</div></details>';
    }
    function starText(d) {
        var n = Math.max(1, Math.min(5, parseInt(d, 10) || 2));
        return '★'.repeat(n);
    }
    function kpRow(item) {
        var tags = (item.kpNames || []).map(function(n) {
            return '<span class="muti-kp-tag">' + esc(n) + '</span>';
        }).join('');
        var ch = item.chapter || '';
        var jump = ch
            ? '<button type="button" class="muti-kp-jump" data-chapter="' + esc(ch) + '">📚 去该知识点刷题 →</button>'
            : '';
        return '<div class="muti-kp-row"><span class="muti-kp-label">知识点串联：</span>' + tags + jump + '</div>';
    }

    /* ===== 掌握度 / 笔记小部件 HTML（复用 app.js 的 pc-* 类，由 __mastery/__notes 绑定）===== */
    function masteryToggleHTML(ch, idx) {
        return '<button type="button" class="pc-mastery-toggle" data-role="mastery-toggle" '
            + 'data-chapter="' + ch + '" data-pindex="' + idx + '" title="点击展开掌握程度记录">'
            + '<span class="pc-mastery-icon">📊</span>'
            + '<span class="pc-mastery-text" data-role="latest">未记录</span>'
            + '<span class="pc-mastery-arrow">▾</span></button>';
    }
    function masteryPanelHTML(ch, idx) {
        var d = new Date();
        var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
        var today = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
        return '<div class="pc-mastery-panel" data-chapter="' + ch + '" data-pindex="' + idx + '" '
            + 'data-role="mastery-panel" hidden>'
            + '<div class="pc-mastery-form">'
            + '<div class="pc-mastery-row"><label>掌握度</label>'
            + '<input type="range" class="pc-mastery-range" min="0" max="100" step="5" value="50">'
            + '<span class="pc-mastery-value" data-role="value">50%</span></div>'
            + '<div class="pc-mastery-row"><label>日期</label>'
            + '<input type="date" class="pc-mastery-date" value="' + today + '"></div>'
            + '<div class="pc-mastery-row"><label>备注</label>'
            + '<input type="text" class="pc-mastery-note" placeholder="可选：第几次复习、错在哪、记忆口诀..."></div>'
            + '<div class="pc-mastery-actions">'
            + '<button type="button" class="pc-mastery-save" data-role="save">💾 保存</button>'
            + '<button type="button" class="pc-mastery-close" data-role="close">收起 ▲</button></div></div>'
            + '<div class="pc-mastery-history"><div class="pc-history-title">📜 历史记录（按日期倒序）</div>'
            + '<ul class="pc-history-list" data-role="history"><li class="pc-history-empty">加载中...</li></ul></div></div>';
    }
    function notesButtonHTML(ch, idx) {
        return '<button type="button" class="pc-notes-toggle" data-role="notes-toggle" '
            + 'data-chapter="' + ch + '" data-pindex="' + idx + '" title="点击记录本题思考过程（自动保存到浏览器）">'
            + '<span class="pc-notes-icon">📝</span>'
            + '<span class="pc-notes-text" data-role="notes-status">无笔记</span></button>';
    }

    /* ===== 单个题目（item）渲染：idx 0=母题，1-4=变式 ===== */
    function renderItem(slotData, idx) {
        var item = idx === 0 ? slotData : (slotData.variants[idx - 1]);
        if (!item) return '';
        var dimName = DIM_NAMES[idx];
        var dimCls = idx === 0 ? '母题' : (item.dimension || dimName);
        var ch = 'muti-' + slotData.id;   // 如 muti-m01
        var isChoice = slotData.type === '选择题';

        // 选项（选择题才渲染；不标注答案，避免剧透）
        var optsHtml = '';
        if (isChoice && item.options && item.options.length) {
            optsHtml = '<div class="muti-options">' + item.options.map(function(o) {
                return '<div class="muti-opt">' + o + '</div>';
            }).join('') + '</div>';
        }

        // 涉及概念（零跳步前置知识）
        var concepts = item.concepts || [];
        var conceptsHtml = '';
        if (concepts.length) {
            conceptsHtml = '<div class="muti-concepts">'
                + '<div class="mc-title">🧭 涉及概念与公式</div>'
                + concepts.map(function(c) {
                    return '<div class="mc-item"><span class="mc-name">' + esc(c.name) + '</span>'
                        + (c.note ? '<span class="mc-note">' + c.note + '</span>' : '') + '</div>';
                }).join('')
                + '</div>';
        }

        // 解析：答案 + 零跳步分步解析
        var steps = item.solution || [];
        var stepsHtml = steps.map(function(s) {
            return '<div class="muti-sol-step">'
                + '<span class="ms-step-num">第 ' + s.step + ' 步</span>'
                + '<div class="ms-step-title">' + (s.title || '') + '</div>'
                + '<div class="ms-step-content">' + (s.content || '') + '</div></div>';
        }).join('');
        var answerHtml = item.answer
            ? '<div class="muti-answer-box"><strong>答案：</strong>' + item.answer + '</div>'
            : '';
        var collapseHtml = '<details class="muti-collapse"><summary>📖 查看答案与分步解析（零跳步）</summary><div class="collapse-body">'
            + conceptsHtml + answerHtml + stepsHtml + '</div></details>';

        var sourceHtml = '<div class="muti-source-row">' + sourceBadge(item.source) + '</div>';

        var footerHtml = '<div class="muti-item-footer">'
            + masteryToggleHTML(ch, idx) + notesButtonHTML(ch, idx)
            + '<span class="filter-hint">每题独立记录掌握度；不会的题先点「去该知识点刷题」复习再回来。</span></div>'
            + masteryPanelHTML(ch, idx);

        var itemActive = (idx === state.dim) ? ' active' : '';
        return '<div class="muti-item' + itemActive + '" data-dim="' + idx + '">'
            + '<div class="muti-item-head">'
            +   '<span class="muti-item-dim ' + dimCls + '">' + dimCls + '</span>'
            +   '<span class="muti-item-label">' + (idx === 0 ? '母题 · 真题/来源题' : (idx + 1) + ' 号变式 · ' + dimCls + '维度') + '</span>'
            + '</div>'
            + '<div class="muti-item-question">' + (item.question || '') + '</div>'
            + optsHtml
            + collapseHtml
            + kpRow(item)
            + sourceHtml
            + footerHtml
            + '</div>';
    }

    /* ===== 卡片渲染（含 1/2/3/4/5 切换按钮）===== */
    function renderCard(slotData) {
        var tabsHtml = DIM_NAMES.map(function(n, i) {
            var active = (state.dim === i) ? ' active' : '';
            return '<button type="button" class="muti-dim-tab' + active + '" data-dim="' + i + '" data-card="' + slotData.id + '">'
                + (i + 1) + ' ' + n + '</button>';
        }).join('');

        var itemsHtml = DIM_NAMES.map(function(_, i) {
            return renderItem(slotData, i);
        }).join('');

        return '<div class="muti-card" id="card-' + slotData.id + '" data-slot="' + slotData.slot + '" '
            + 'data-part="' + esc(slotData.part) + '" data-type="' + esc(slotData.type) + '">'
            + '<div class="muti-card-head">'
            +   '<div class="muti-card-top">'
            +     '<div class="muti-slot-badge">' + slotData.id + '</div>'
            +     '<div class="muti-card-title">'
            +       '<div class="muti-topic">' + esc(slotData.topic) + '</div>'
            +       '<div class="muti-meta">'
            +         '<span class="chip part-' + esc(slotData.part) + '">' + esc(slotData.part) + '</span>'
            +         '<span class="chip">' + esc(slotData.type) + '</span>'
            +         '<span class="chip">' + esc(slotData.score) + '分</span>'
            +         '<span class="chip diff">' + starText(slotData.difficulty) + '</span>'
            +         '<span class="chip slot-chip">真题题位 #' + slotData.slot + '</span>'
            +       '</div>'
            +     '</div>'
            +   '</div>'
            +   '<div class="muti-kp-row"><span class="muti-kp-label">母题知识点：</span>'
            +     (slotData.kpNames || []).map(function(n) { return '<span class="muti-kp-tag">' + esc(n) + '</span>'; }).join('')
            +     (slotData.chapter
                ? '<button type="button" class="muti-kp-jump" data-chapter="' + esc(slotData.chapter) + '">📚 去该知识点刷题 →</button>'
                : '')
            +   '</div>'
            + '</div>'
            + '<div class="muti-dim-tabs">' + tabsHtml + '</div>'
            + '<div class="muti-items">' + itemsHtml + '</div>'
            + '</div>';
    }

    /* ===== 待收录占位卡片 ===== */
    function renderPending(plan) {
        return '<div class="muti-pending-card" data-slot="' + plan.slot + '">'
            + '<div class="mp-num">#' + plan.slot + '</div>'
            + '<div class="mp-info">'
            +   '<div class="mp-topic">🚧 ' + esc(plan.part + ' · ' + plan.type + ' · ' + plan.topic) + '（规划中）</div>'
            +   '<div class="mp-hint">下一批补齐 · 结构占位保持 22 题位完整路线图</div>'
            + '</div></div>';
    }

    /* ===== 统计条 ===== */
    function renderStats() {
        var ready = DATA ? DATA.length : 0;
        var totalItems = ready * 5;
        var partStr = ['高数', '线代', '概率'].map(function(p) {
            var cnt = 0;
            if (DATA) DATA.forEach(function(s) { if (s.part === p) cnt++; });
            return p + ' ' + cnt + '/' + PART_CNT[p];
        }).join(' · ');
        els.stats.innerHTML =
            '<div class="muti-stat-card"><div class="muti-stat-label">已收录母题</div>'
            + '<div class="muti-stat-value">' + ready + ' / ' + META.total + '</div>'
            + '<div class="muti-stat-sub">每道配 4 变式（概念/计算/公式/创新）</div></div>'
            + '<div class="muti-stat-card"><div class="muti-stat-label">题目总量</div>'
            + '<div class="muti-stat-value">' + totalItems + '</div>'
            + '<div class="muti-stat-sub">母题 + 变式</div></div>'
            + '<div class="muti-stat-card"><div class="muti-stat-label">板块进度</div>'
            + '<div class="muti-stat-value" style="font-size:15px;">' + partStr + '</div>'
            + '<div class="muti-stat-sub">按真题题位分布：高数13 · 线代5 · 概率4</div></div>';
    }

    /* ===== 题位网格 ===== */
    function renderGrid() {
        var cells = SLOT_PLAN.map(function(plan) {
            var sd = slotDataByNum(plan.slot);
            if (sd) {
                var cls = 'ready-part-' + esc(sd.part);
                return '<div class="muti-grid-cell ' + cls + '" data-slot="' + sd.slot + '" data-card="' + sd.id + '">'
                    + '<span class="mc-num">' + sd.slot + '</span><span class="mc-part">' + esc(sd.part) + '</span></div>';
            }
            return '<div class="muti-grid-cell pending" data-slot="' + plan.slot + '">'
                + '<span class="mc-num">' + plan.slot + '</span><span class="mc-part">待</span></div>';
        }).join('');
        els.grid.innerHTML = cells;
        if (els.gridReady) els.gridReady.textContent = DATA ? DATA.length : 0;
        if (els.gridTotal) els.gridTotal.textContent = META.total;
        // 绑定点击：已收录 → 滚动到卡片
        els.grid.querySelectorAll('.muti-grid-cell[data-card]').forEach(function(cell) {
            cell.addEventListener('click', function() {
                var card = byId('card-' + cell.getAttribute('data-card'));
                if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /* ===== 卡片列表 + 筛选 ===== */
    function currentMasteryLevel(slotData) {
        // 以母题（idx 0）最近一次记录为卡片级掌握度
        try {
            var all = JSON.parse(localStorage.getItem('mastery:all') || '[]');
            var recs = all.filter(function(r) {
                return r.chapter_id === ('muti-' + slotData.id) && r.problem_index === 0;
            });
            if (!recs.length) return null;
            recs.sort(function(a, b) { return a.record_date < b.record_date ? 1 : -1; });
            return recs[0].mastery_level;
        } catch (e) { return null; }
    }
    function cardVisible(slotData) {
        if (state.part !== 'all' && slotData.part !== state.part) return false;
        if (state.type !== 'all' && slotData.type !== state.type) return false;
        if (state.mastery !== 'all') {
            var lv = currentMasteryLevel(slotData);
            if (state.mastery === 'unmastered') { if (lv === null || lv >= 50) return false; }
            else if (state.mastery === 'strong') { if (lv === null || lv < 80) return false; }
        }
        return true;
    }
    function renderList() {
        if (!DATA || !DATA.length) {
            els.list.innerHTML = '<div class="muti-empty">母题数据尚未收录。请确认 chapters/muti_data.js 已正确加载。</div>';
            return;
        }
        var html = '';
        SLOT_PLAN.forEach(function(plan) {
            var sd = slotDataByNum(plan.slot);
            if (sd) {
                if (cardVisible(sd)) html += renderCard(sd);
            } else {
                html += renderPending(plan);
            }
        });
        els.list.innerHTML = html;

        // 渲染数学公式
        if (window.renderMathWhenReady) {
            window.renderMathWhenReady(els.list);
        }
        // 绑定掌握度 / 笔记（复用 app.js 逻辑）
        if (window.__mastery && window.__mastery.initAll) window.__mastery.initAll(els.list);
        if (window.__notes && window.__notes.initAll) window.__notes.initAll(els.list);

        bindCardEvents();
    }

    /* ===== 卡片事件：1/2/3/4/5 切换 + 知识点跳转 ===== */
    function bindCardEvents() {
        els.list.querySelectorAll('.muti-dim-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var card = btn.getAttribute('data-card');
                var dim = btn.getAttribute('data-dim');
                // 本卡片的 tab 高亮 + item 切换
                els.list.querySelectorAll('.muti-dim-tab[data-card="' + card + '"]').forEach(function(b) {
                    b.classList.toggle('active', b === btn);
                });
                els.list.querySelectorAll('#card-' + card + ' .muti-item').forEach(function(it) {
                    it.classList.toggle('active', it.getAttribute('data-dim') === dim);
                });
            });
        });

        els.list.querySelectorAll('.muti-kp-jump').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var ch = btn.getAttribute('data-chapter');
                if (!ch) return;
                // 导航到章节后自动切到「练习」Tab
                window.__gotoPractice = ch;
                if (window.__navigateTo) window.__navigateTo(ch);
            });
        });
    }

    /* ===== 筛选 ===== */
    function bindPills(containerId, key) {
        var container = byId(containerId);
        if (!container) return;
        container.addEventListener('click', function(e) {
            var btn = e.target.closest('.filter-pill');
            if (!btn) return;
            container.querySelectorAll('.filter-pill').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            state[key] = btn.getAttribute('data-' + key);
            if (key === 'dim') {
                // 维度筛选 = 切换所有卡片默认打开的维度
                state.dim = parseInt(state.dim, 10) || 0;
                els.list.querySelectorAll('.muti-card').forEach(function(card) {
                    var cid = card.getAttribute('id').replace('card-', '');
                    card.querySelectorAll('.muti-dim-tab').forEach(function(b) {
                        var on = b.getAttribute('data-dim') === String(state.dim);
                        b.classList.toggle('active', on);
                    });
                    card.querySelectorAll('.muti-item').forEach(function(it) {
                        it.classList.toggle('active', it.getAttribute('data-dim') === String(state.dim));
                    });
                });
            } else {
                renderList();
            }
        });
    }

    /* ===== 右侧「题位导航」scroll-spy：22 个小方格，滚动跟随高亮 ===== */
    function renderSpyNav() {
        var panel = byId('outlinePanel');
        if (!panel) return;
        var nav = byId('mutiSpyNav');
        if (!nav) {
            nav = document.createElement('div');
            nav.className = 'muti-spy-nav';
            nav.id = 'mutiSpyNav';
            var cells = SLOT_PLAN.map(function(plan) {
                var sd = slotDataByNum(plan.slot);
                var cls = sd ? 'ready part-' + esc(sd.part) : 'pending';
                var tip = sd ? ('题位 #' + plan.slot + ' · ' + sd.topic) : ('题位 #' + plan.slot + ' · 待收录');
                return '<div class="muti-spy-cell ' + cls + '" data-slot="' + plan.slot + '" title="' + esc(tip) + '">'
                    + plan.slot + '</div>';
            }).join('');
            nav.innerHTML = '<div class="muti-spy-title">🗺️ 题位导航 <span class="muti-spy-sub">'
                + (DATA ? DATA.length : 0) + '/' + META.total + ' 已收录</span></div>'
                + '<div class="muti-spy-grid">' + cells + '</div>'
                + '<div class="muti-spy-current" id="mutiSpyCurrent"><div class="msp-empty">浏览中...</div></div>';
            var listEl = byId('outlineList');
            if (listEl) panel.insertBefore(nav, listEl);
            else panel.appendChild(nav);

            // 点击已收录方格 → 滚动到对应卡片
            nav.querySelectorAll('.muti-spy-cell.ready').forEach(function(cell) {
                cell.addEventListener('click', function() {
                    var sd = slotDataByNum(parseInt(cell.getAttribute('data-slot'), 10));
                    if (!sd) return;
                    var card = byId('card-' + sd.id);
                    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });
        }
        // 每次进入母题页都刷新一次高亮（解决「切回后静止不刷新」）
        updateSpy();
    }

    /* 当前题位的考点卡片（随滚动动态更新） */
    function renderCurrentKP(sd) {
        var kps = (sd.kpNames || []).map(function(n) {
            return '<span class="msp-kp-tag">' + esc(n) + '</span>';
        }).join('');
        return '<div class="msp-slot">题位 #' + sd.slot + ' · ' + esc(sd.topic) + '</div>'
            + '<div class="msp-kps">考点：' + (kps || '<span class="msp-kp-tag">待补充</span>') + '</div>'
            + '<div class="msp-meta">' + esc(sd.part) + ' · ' + esc(sd.type) + ' · '
            + starText(sd.difficulty) + ' · ' + esc(sd.score) + '分</div>';
    }

    function updateSpy() {
        var nav = byId('mutiSpyNav');
        if (!nav) return;
        // 取「最后一个顶部 <= 阈值」的题位块：是已收录卡则显示考点，是占位卡则提示待收录
        var current = null;
        var currentPending = null;
        var blocks = document.querySelectorAll('.muti-card[data-slot], .muti-pending-card[data-slot]');
        var last = null;
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i].getBoundingClientRect().top <= 150) last = blocks[i];
        }
        if (last) {
            if (last.classList.contains('muti-card')) current = last.getAttribute('data-slot');
            else currentPending = last.getAttribute('data-slot');
        }
        // 页面顶部（还没滚到第一张卡）时默认高亮第一张已收录卡
        if (!last && window.scrollY < 300) {
            var first = document.querySelector('.muti-card[data-slot]');
            if (first) current = first.getAttribute('data-slot');
        }
        // 高亮方格
        nav.querySelectorAll('.muti-spy-cell').forEach(function(cell) {
            cell.classList.toggle('active', current !== null && cell.getAttribute('data-slot') === current);
        });
        // 动态更新「当前考点」
        var curEl = byId('mutiSpyCurrent');
        if (!curEl) return;
        if (current) {
            var sd = slotDataByNum(parseInt(current, 10));
            curEl.innerHTML = sd ? renderCurrentKP(sd) : '<div class="msp-empty">🚧 正在浏览待收录题位</div>';
        } else if (currentPending) {
            curEl.innerHTML = '<div class="msp-empty">🚧 题位 #' + currentPending + ' 待收录，敬请期待</div>';
        } else {
            curEl.innerHTML = '<div class="msp-empty">浏览中...</div>';
        }
    }

    /* ===== 初始化 =====
     * 用 mutiList 上的 dataset 标记代替 initialized 常量：
     * app.js 每次切换章节都会重建 contentWrap DOM（含新的 #mutiList），
     * 标记随 DOM 重建而消失，从而支持「切走再切回」时重新渲染；
     * 同一 DOM 上的重复调用（自启动 + app.js 触发）则被标记拦截。
     */
    function init() {
        var listEl = byId('mutiList');
        if (!byId('mutiStats') || !listEl || !byId('mutiGrid')) return;
        if (listEl.dataset.mutiReady === '1') return;
        listEl.dataset.mutiReady = '1';

        els.stats = byId('mutiStats');
        els.grid = byId('mutiGrid');
        els.list = listEl;
        els.gridReady = byId('mutiGridReady');
        els.gridTotal = byId('mutiGridTotal');

        bindPills('mutiFilterPart', 'part');
        bindPills('mutiFilterType', 'type');
        bindPills('mutiFilterDim', 'dim');
        bindPills('mutiFilterMastery', 'mastery');

        renderStats();
        renderGrid();
        renderList();
        renderSpyNav();

        // scroll-spy：全局只绑定一次（updateSpy 内部判断 nav 是否存在）
        if (!window.__mutiSpyBound) {
            window.__mutiSpyBound = true;
            var ticking = false;
            window.addEventListener('scroll', function() {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(function() { updateSpy(); ticking = false; });
            }, { passive: true });
            window.addEventListener('resize', updateSpy);
        }
    }

    window.initMutiModule = init;

    // 自启动：与 zhenti.js 相同的 MutationObserver 兜底
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { init(); });
    } else {
        setTimeout(init, 50);
    }
    if (typeof MutationObserver !== 'undefined') {
        var obs = new MutationObserver(function() {
            if (byId('muti') && !(byId('mutiList') && byId('mutiList').dataset.mutiReady === '1')) init();
        });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(function() { obs.disconnect(); }, 30000);
    }

    window.__muti = { DATA: DATA, SLOT_PLAN: SLOT_PLAN, state: state };
})();
