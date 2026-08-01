/*
 * 考研数学一 · 真题专区主逻辑
 * =================================================
 * - 知识点树（左侧）点击 → 右侧题目高亮 + 筛选
 * - 缩略图条（顶部）点击 → 放大查看试卷
 * - 题目列表（中部）点击 → 详情弹窗
 * - 考点频率图（底部）→ 知识点考查频率
 *
 * 数据源：异步 fetch chapters/zhenti/{year}.json（按年份拆分维护）
 */

(function() {
    'use strict';

    /* ===== 状态 ===== */
    const state = {
        filters: {
            year: 'all',
            part: 'all',
            type: 'all',
            keyword: '',
            activeKP: null,
            mastery: 'all',
        },
        questions: [],            // 所有题（平铺）
        byYear: {},               // 按年份 → 题数组
        kpCount: {},              // 知识点频次
        loaded: false,            // 数据是否已加载
        loading: false,           // 正在加载
        manifest: null,           // 年份清单
        activeTab: 'list',        // 当前主区域 Tab：'list' | 'progress'
        progressFlatList: [],     // 进度总览的扁平题列表（供切题导航用）
    };

    /* ===== 数据加载 ===== */
    const ZHENTI_BASE = 'chapters/zhenti/';

    /* ===== 掌握程度模块 ===== */
    const MASTERY_KEY = 'zhenti_mastery';
    const SUPABASE_URL = 'https://yucploakclaznlmfpdkk.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3Bsb2FrY2xhem5sbWZwZGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNjAyNDQsImV4cCI6MjA5OTczNjI0NH0.-VpUDJgIR0KlEReUM5LzSShIwog2YiJgH28QJAj6GHI';
    const MASTERY_LEVELS = [
        { id: 'new',        label: '未开始',   icon: '⚪', color: '#94a3b8', desc: '尚未学习' },
        { id: 'learning',   label: '学习中',   icon: '🟡', color: '#f59e0b', desc: '概念模糊，需要再练习' },
        { id: 'familiar',   label: '基本掌握', icon: '🔵', color: '#3b82f6', desc: '能做对但不够熟练' },
        { id: 'mastered',   label: '熟练掌握', icon: '🟢', color: '#10b981', desc: '可以快速、准确完成' },
        { id: 'expert',     label: '完全精通', icon: '🟣', color: '#a855f7', desc: '完全掌握，能举一反三' },
    ];
    const MASTERY_BY_ID = MASTERY_LEVELS.reduce((m, l) => (m[l.id] = l, m), {});

    let masteryData = {};
    let _supabaseClient = null;

    /* ----- Supabase 客户端（lazy init）----- */
    function getSupabase() {
        if (typeof window.supabase === 'undefined') return null;
        if (!_supabaseClient) {
            try {
                _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                    auth: { persistSession: false }
                });
            } catch (e) {
                console.warn('Supabase client 初始化失败:', e);
                return null;
            }
        }
        return _supabaseClient;
    }

    /* ----- 数据加载：Supabase 优先，localStorage 兜底 ----- */
    async function loadMastery() {
        masteryData = {};
        const db = getSupabase();
        if (db) {
            try {
                const { data, error } = await db.from('zhenti_mastery').select('*');
                if (!error && data && data.length) {
                    data.forEach(row => {
                        masteryData[row.question_id] = {
                            level: row.level,
                            updatedAt: row.updated_at,
                        };
                    });
                    // 同步到本地缓存
                    try { localStorage.setItem(MASTERY_KEY, JSON.stringify(masteryData)); } catch (e) {}
                    return;
                }
            } catch (e) {
                console.warn('Supabase 加载失败，使用本地缓存:', e);
            }
        }
        // 降级：从 localStorage 加载
        try {
            const raw = localStorage.getItem(MASTERY_KEY);
            masteryData = raw ? JSON.parse(raw) : {};
        } catch (e) {
            masteryData = {};
        }
    }

    /* ----- 本地缓存（兜底）----- */
    function saveMastery() {
        try {
            localStorage.setItem(MASTERY_KEY, JSON.stringify(masteryData));
        } catch (e) {
            console.warn('保存掌握程度失败:', e);
        }
    }

    /* ----- 异步写 Supabase ----- */
    async function saveMasteryToSupabase(qid, level) {
        const db = getSupabase();
        if (!db) return;
        try {
            await db.from('zhenti_mastery').upsert(
                { question_id: qid, level: level },
                { onConflict: 'question_id' }
            );
        } catch (e) {
            console.warn('Supabase 保存失败:', e);
        }
    }

    async function deleteMasteryFromSupabase(qid) {
        const db = getSupabase();
        if (!db) return;
        try {
            await db.from('zhenti_mastery').delete().eq('question_id', qid);
        } catch (e) {
            console.warn('Supabase 删除失败:', e);
        }
    }

    function getMastery(qid) {
        return masteryData[qid] ? MASTERY_BY_ID[masteryData[qid].level] : MASTERY_BY_ID.new;
    }

    function setMastery(qid, levelId) {
        if (!MASTERY_BY_ID[levelId]) return;
        masteryData[qid] = {
            level: levelId,
            updatedAt: new Date().toISOString(),
        };
        saveMastery();
        saveMasteryToSupabase(qid, levelId);
    }

    function clearMastery(qid) {
        delete masteryData[qid];
        saveMastery();
        deleteMasteryFromSupabase(qid);
    }

    function masteryStats() {
        const stats = { total: state.questions.length, byLevel: {} };
        MASTERY_LEVELS.forEach(l => stats.byLevel[l.id] = 0);
        state.questions.forEach(q => {
            const lv = masteryData[q.id] ? masteryData[q.id].level : 'new';
            stats.byLevel[lv] = (stats.byLevel[lv] || 0) + 1;
        });
        return stats;
    }

    /* ===== 掌握程度 UI ===== */
    function renderMasteryBadge(qid) {
        const lv = getMastery(qid);
        if (lv.id === 'new') return '';
        return `<span class="mastery-badge" style="background:${lv.color}20;color:${lv.color};border:1px solid ${lv.color}40">${lv.icon} ${lv.label}</span>`;
    }

    function refreshMasteryUI(qid) {
        const currentLv = getMastery(qid);

        // 更新侧边栏状态显示
        const sidebarState = document.getElementById('masterySidebarState');
        if (sidebarState) {
            sidebarState.textContent = `${currentLv.icon} ${currentLv.label}`;
            sidebarState.style.color = currentLv.color;
        }

        // 更新详情弹窗内按钮状态
        const btn = document.querySelector(`#questionModalBody [data-mastery-clear="${qid}"]`);
        if (btn) {
            btn.style.display = currentLv.id === 'new' ? 'none' : '';
        }
        document.querySelectorAll(`#questionModalBody [data-mastery]`).forEach(b => {
            const isActive = b.dataset.mastery === currentLv.id;
            b.classList.toggle('active', isActive);
        });

        // 更新题卡片上的徽章
        const card = document.querySelector(`.question-card[data-id="${qid}"]`);
        if (card) {
            const badgeSlot = card.querySelector('.mastery-badge-slot');
            if (badgeSlot) {
                badgeSlot.innerHTML = renderMasteryBadge(qid);
            }
        }

        // 更新总览统计
        if (els.masteryStats) {
            renderMasteryStats();
        }

        // 更新进度总览（如当前在进度 Tab 或已渲染过，保持方格颜色/统计与 legend 同步）
        if (els.progressArea) {
            renderProgressOverview();
        }
    }

    function renderMasteryStats() {
        if (!els.masteryStats) return;
        const stats = masteryStats();
        const items = MASTERY_LEVELS.map(l => {
            const count = stats.byLevel[l.id] || 0;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return `<div class="mastery-stat-item" data-level="${l.id}">
                <span class="ms-icon" style="color:${l.color}">${l.icon}</span>
                <span class="ms-label">${l.label}</span>
                <span class="ms-count">${count}</span>
                <span class="ms-pct">${pct}%</span>
            </div>`;
        }).join('');
        const mastered = (stats.byLevel['mastered'] || 0) + (stats.byLevel['expert'] || 0);
        const masteredPct = stats.total > 0 ? Math.round((mastered / stats.total) * 100) : 0;
        els.masteryStats.innerHTML = `
            <div class="mastery-summary">
                <div class="ms-total">已掌握 <strong>${mastered}</strong> / ${stats.total} 题 (<strong>${masteredPct}%</strong>)</div>
                <div class="ms-progress"><div class="ms-progress-fill" style="width:${masteredPct}%"></div></div>
            </div>
            <div class="mastery-distribution">${items}</div>
        `;
    }

    /* 事件代理: 掌握程度按钮点击 */
    function bindMasteryEvents() {
        // 在弹窗内绑定
        document.getElementById('questionModalBody').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-mastery]');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                const qid = btn.dataset.qid;
                const level = btn.dataset.mastery;
                const current = (masteryData[qid] || {}).level;
                if (current === level) {
                    clearMastery(qid);
                } else {
                    setMastery(qid, level);
                }
                refreshMasteryUI(qid);
                return;
            }
            const clearBtn = e.target.closest('[data-mastery-clear]');
            if (clearBtn) {
                e.preventDefault();
                e.stopPropagation();
                const qid = clearBtn.dataset.masteryClear;
                clearMastery(qid);
                refreshMasteryUI(qid);
            }
        });
    }

    async function loadManifest() {
        const resp = await fetch(ZHENTI_BASE + 'manifest.json');
        if (!resp.ok) throw new Error('manifest.json HTTP ' + resp.status);
        return resp.json();
    }

    async function loadYear(year) {
        const resp = await fetch(ZHENTI_BASE + year + '.json');
        if (!resp.ok) throw new Error(year + '.json HTTP ' + resp.status);
        return resp.json();
    }

    async function loadAllData() {
        if (state.loaded || state.loading) return state.questions;
        state.loading = true;
        try {
            const manifest = await loadManifest();
            state.manifest = manifest;
            const years = manifest.years || [];
            // 并行加载所有年份
            const results = await Promise.all(years.map(y => loadYear(y).catch(e => {
                console.warn('加载 ' + y + ' 失败:', e);
                return [];
            })));
            // 组装 state
            state.byYear = {};
            state.questions = [];
            years.forEach((y, i) => {
                const arr = results[i] || [];
                state.byYear[y] = arr;
                state.questions.push(...arr);
            });
            state.questions.sort((a, b) => (a.year || 0) - (b.year || 0) || (a.qnum || 0) - (b.qnum || 0));
            // 知识点频次
            state.kpCount = {};
            state.questions.forEach(q => {
                (q.knowledgeIds || []).forEach(k => {
                    state.kpCount[k] = (state.kpCount[k] || 0) + 1;
                });
            });
            state.loaded = true;
            return state.questions;
        } finally {
            state.loading = false;
        }
    }

    /* ===== 知识点分类（来自全局 chapters/kp_tree.js）===== */
    const KP_TREE = window.KP_TREE || [];
    const KP_NAME = window.KP_NAME || {};
    const KP_INDEX = window.KP_INDEX || {};
    const KP_TO_CHAPTER = window.KP_TO_CHAPTER || {};

    /* ===== Init ===== */
    let els = {};
    let initialized = false;
    async function init() {
        if (initialized) return;
        // 检查必须的 DOM 是否存在 (zhenti.html 还没载入也跳过)
        if (!document.getElementById('zhentiContentArea')) return;
        initialized = true;
        els.content = document.getElementById('zhentiContentArea');
        els.tree = document.getElementById('knowledgeTree');
        els.thumbList = document.getElementById('thumbList');
        els.thumbStrip = document.getElementById('thumbStrip');
        els.filterYear = document.getElementById('filterYear');
        els.filterPart = document.getElementById('filterPart');
        els.filterType = document.getElementById('filterType');
        els.kpSearch = document.getElementById('kpSearch');
       els.searchInput = document.getElementById('zhentiSearch');
        els.kpChart = document.getElementById('kpChart');
        els.filterKPRow = document.getElementById('filterKPRow');
        els.activeKPName = document.getElementById('activeKPName');
        els.clearKP = document.getElementById('clearKP');
        els.masteryStats = document.getElementById('masteryStats');
        els.filterMastery = document.getElementById('filterMastery');
        // Tab 切换 + 进度总览相关 DOM
        els.tabs = document.getElementById('zhentiTabs');
        els.tabListBtn = els.tabs ? els.tabs.querySelector('[data-tab="list"]') : null;
        els.tabProgressBtn = els.tabs ? els.tabs.querySelector('[data-tab="progress"]') : null;
        els.progressArea = document.getElementById('zhentiProgressArea');
        els.filtersBar = document.getElementById('zhentiFilters');
        els.sidebar = document.getElementById('zhentiSidebar');
        els.chartsBottom = document.getElementById('zhentiChartsBottom');

        // 异步加载真题数据
        els.content.innerHTML = '<div class="zhenti-loading"><div class="spinner"></div><p>正在加载真题（17 个年份 · 308 题）...</p></div>';

        try {
            await loadAllData();
        } catch (e) {
            console.error('加载真题数据失败:', e);
            els.content.innerHTML = '<div class="zhenti-empty">加载真题失败，请检查 chapters/zhenti/ 目录。</div>';
            return;
        }

        if (!state.questions.length) {
            els.content.innerHTML = '<div class="zhenti-empty">暂无真题数据</div>';
            return;
        }

        buildYearFilter();
        buildKnowledgeTree();
        buildThumbStrip();
        buildCharts();
        bindEvents();
        bindMasteryEvents();
        bindTabEvents();
        await loadMastery();
        renderMasteryStats();
        buildMasteryFilter();
        renderQuestions();
        applyMasteryBadgesToCards();
        // 进度总览先预渲染一次，切换 Tab 时无需等待
        renderProgressOverview();
    }

    /* ===== 构建年份筛选 ===== */
    function buildYearFilter() {
        const years = Object.keys(state.byYear).map(Number).sort((a, b) => b - a);
        years.forEach(y => {
            const btn = document.createElement('button');
            btn.className = 'filter-pill';
            btn.dataset.year = String(y);
            const count = (state.byYear[y] || []).length;
            btn.textContent = `${y} (${count})`;
            els.filterYear.appendChild(btn);
        });
    }

    /* ===== 构建知识点树 ===== */
    function buildKnowledgeTree() {
        const html = KP_TREE.map(group => `
            <div class="kp-group" data-group="${group.id}">
                <div class="kp-group-title" data-group="${group.id}">
                    <span class="kp-icon">${group.icon}</span>
                    <span class="kp-name">${group.name}</span>
                    <span class="kp-count">${countGroup(group.id)}</span>
                </div>
                <ul class="kp-children">
                    ${group.children.map(c => `
                        <li class="kp-item" data-kp="${c.id}" data-kps='${JSON.stringify(c.kps)}'>
                            <span class="kp-item-name">${c.name}</span>
                            <span class="kp-item-count">${countKP(c.kps)}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
        els.tree.innerHTML = html;
    }

    function countGroup(groupId) {
        let sum = 0;
        KP_TREE.find(g => g.id === groupId).children.forEach(c => {
            sum += countKP(c.kps);
        });
        return sum;
    }

    function countKP(kps) {
        let sum = 0;
        (kps || []).forEach(k => sum += (state.kpCount[k] || 0));
        return sum;
    }

    /* ===== 构建缩略图条 ===== */
    function buildThumbStrip() {
        const years = Object.keys(state.byYear).map(Number).sort((a, b) => b - a);
        const html = years.map(y => {
            const types = countTypes(y);
            return `
                <div class="thumb-item" data-year="${y}">
                    <div class="thumb-year">${y}</div>
                    <div class="thumb-stat">
                        <span>选 ${types.choice}</span>
                        <span>填 ${types.fill}</span>
                        <span>解 ${types.solve}</span>
                    </div>
                    <div class="thumb-total">${(state.byYear[y] || []).length} 题</div>
                </div>
            `;
        }).join('');
        els.thumbList.innerHTML = html;
    }

    function countTypes(year) {
        const arr = state.byYear[year] || [];
        return {
            choice: arr.filter(q => q.type === '选择题').length,
            fill: arr.filter(q => q.type === '填空题').length,
            solve: arr.filter(q => q.type === '解答题').length,
        };
    }

    /* ===== 图表（考点频率） ===== */
    function buildCharts() {
        // 知识点频率 (Top 20)
        const topKP = Object.entries(state.kpCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);
        const maxKP = topKP.length ? topKP[0][1] : 1;
        els.kpChart.innerHTML = `
            <div class="bar-chart">
                ${topKP.map(([k, v]) => `
                    <div class="bar-row" data-kp="${k}">
                        <span class="bar-label">${KP_NAME[k.split('.')[0] + '.' + k.split('.')[1]] || k}</span>
                        <div class="bar-track"><div class="bar-fill" style="width:${(v/maxKP*100).toFixed(1)}%">${v}</div></div>
                    </div>
                `).join('')}
            </div>
        `;

        // 绑定图表点击 → 筛选
        els.kpChart.querySelectorAll('[data-kp]').forEach(el => {
            el.addEventListener('click', () => {
                const kp = KP_TREE.flatMap(g => g.children).find(c => c.kps.includes(el.dataset.kp));
                if (kp) setActiveKP(kp.id, kp.name);
            });
        });
    }

    /* ===== 事件绑定 ===== */
    function bindEvents() {
        // 知识点树 - 点击展开/收起 + 点击叶子节点高亮题目
        els.tree.querySelectorAll('.kp-group-title').forEach(el => {
            el.addEventListener('click', () => {
                el.parentElement.classList.toggle('open');
            });
        });
        els.tree.querySelectorAll('.kp-item').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const kp = el.dataset.kp;
                const name = el.querySelector('.kp-item-name').textContent;
                setActiveKP(kp, name);
            });
        });

        // 清除考点高亮
        els.clearKP.addEventListener('click', () => clearActiveKP());

        // 缩略图条 - 点击放大
        els.thumbList.querySelectorAll('.thumb-item').forEach(el => {
            el.addEventListener('click', () => {
                const year = parseInt(el.dataset.year);
                openThumbModal(year);
            });
        });

        // 筛选 pill
        bindFilterPills(els.filterYear, 'year');
        bindFilterPills(els.filterPart, 'part');
        bindFilterPills(els.filterType, 'type');

        // 关键词搜索
        els.searchInput.addEventListener('input', debounce(() => {
            state.filters.keyword = els.searchInput.value.trim();
            renderQuestions();
        }, 300));

        // 知识点搜索
        els.kpSearch.addEventListener('input', debounce(() => {
            const q = els.kpSearch.value.trim().toLowerCase();
            els.tree.querySelectorAll('.kp-item').forEach(el => {
                const name = el.querySelector('.kp-item-name').textContent.toLowerCase();
                el.style.display = (q === '' || name.includes(q)) ? '' : 'none';
            });
        }, 200));

        // 缩略图弹窗
        document.getElementById('thumbModalClose').addEventListener('click', () => {
            document.getElementById('thumbModal').hidden = true;
        });
        document.getElementById('questionModalClose').addEventListener('click', () => {
            document.getElementById('questionModal').hidden = true;
        });
    }

    function bindFilterPills(container, key) {
        container.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') return;
            container.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            setFilter(key, e.target.dataset[key]);
        });
    }

    function setFilter(key, value) {
        state.filters[key] = value;
        renderQuestions();
    }

    function setActiveKP(kpId, name) {
        state.filters.activeKP = kpId;
        // 高亮树
        els.tree.querySelectorAll('.kp-item').forEach(el => {
            el.classList.toggle('selected', el.dataset.kp === kpId);
        });
        els.filterKPRow.style.display = 'flex';
        els.activeKPName.textContent = name;
        renderQuestions();
    }

    function clearActiveKP() {
        state.filters.activeKP = null;
        els.tree.querySelectorAll('.kp-item').forEach(el => el.classList.remove('selected'));
        els.filterKPRow.style.display = 'none';
        renderQuestions();
    }

    /* ===== 渲染题目列表 ===== */
    function renderQuestions() {
        const { year, part, type, keyword, activeKP, mastery } = state.filters;
        let filtered = state.questions.filter(q => {
            if (year !== 'all' && String(q.year) !== String(year)) return false;
            if (part !== 'all' && q.part !== part) return false;
            if (type !== 'all' && q.type !== type) return false;
            if (activeKP) {
                const kpId = activeKP.split('.').slice(0, 2).join('.');
                if (!q.knowledgeIds || !q.knowledgeIds.some(k => k.startsWith(kpId))) return false;
            }
            if (mastery && mastery !== 'all') {
                const lv = (masteryData[q.id] || {}).level || 'new';
                if (mastery === 'unmastered') {
                    // 未掌握 = new / learning / familiar (低于 mastered)
                    if (lv === 'mastered' || lv === 'expert') return false;
                } else if (lv !== mastery) {
                    return false;
                }
            }
            if (keyword) {
                const text = (q.question || '') + ' ' + (q.num || '') + ' ' + (q.id || '') + ' ' + (q.knowledgeIds || []).join(' ');
                if (!text.toLowerCase().includes(keyword.toLowerCase())) return false;
            }
            return true;
        });

        // 按年份分组
        const groups = {};
        filtered.forEach(q => {
            if (!groups[q.year]) groups[q.year] = [];
            groups[q.year].push(q);
        });
        const years = Object.keys(groups).map(Number).sort((a, b) => b - a);

        if (!filtered.length) {
            els.content.innerHTML = '<div class="zhenti-empty">无匹配的题目</div>';
            return;
        }

        const html = `
            <div class="zhenti-stats">
                共找到 <strong>${filtered.length}</strong> 题
                ${activeKP ? `<span class="kp-tag">考点：${els.activeKPName.textContent}</span>` : ''}
            </div>
            ${years.map(y => `
                <div class="year-block">
                    <h3 class="year-title">${y} 年（${groups[y].length} 题）</h3>
                    <div class="question-list">
                        ${groups[y].map(q => renderQuestionCard(q)).join('')}
                    </div>
                </div>
            `).join('')}
        `;
        els.content.innerHTML = html;

        // 渲染后立即处理 LaTeX
        renderMath(els.content);

        // 绑定 mastery 徽章
        applyMasteryBadgesToCards();

        // 绑定题目卡片点击
        els.content.querySelectorAll('.question-card').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                const q = state.questions.find(q => q.id === id);
                if (q) openQuestionModal(q);
            });
        });
    }

    function renderQuestionCard(q) {
        const kps = (q.knowledgeIds || []).map(k => `<span class="kp-badge">${k}</span>`).join('');
        const opts = (q.options || []).slice(0, 4).map(o => `<div class="opt-line">${escapeHtml(o).substring(0, 60)}</div>`).join('');
        const keywords = (q.knowledgeIds || []).map(k => KP_NAME[k.split('.')[0] + '.' + k.split('.')[1]] || '').filter(Boolean).join(' · ');
        return `
            <div class="question-card" data-id="${q.id}">
                <div class="q-head">
                    <span class="q-year">${q.year}</span>
                    <span class="q-num">${q.num}</span>
                    <span class="q-type q-type-${q.type}">${q.type}</span>
                    <span class="q-difficulty">${'★'.repeat(q.difficulty || 2)}</span>
                    <span class="q-score">${q.score}分</span>
                </div>
                <div class="q-body">${q.question || ''}</div>
                ${opts ? `<div class="q-opts">${opts}</div>` : ''}
                <div class="q-tags">
                    <span class="q-part">${q.part}</span>
                    ${kps}
                    <span class="q-keywords">${keywords}</span>
                </div>
            </div>
        `;
    }

    /* ===== 弹窗 ===== */
    function openThumbModal(year) {
        const arr = state.byYear[year] || [];
        document.getElementById('thumbModalTitle').textContent = `${year} 年考研数学一真题`;
        document.getElementById('thumbModalBody').innerHTML = `
            <div class="thumb-modal-body">
                <div class="thumb-modal-summary">
                    <div class="thumb-modal-stat">共 <strong>${arr.length}</strong> 题</div>
                    <div class="thumb-modal-dist">
                        <span>选 ${arr.filter(q => q.type === '选择题').length}</span>
                        <span>填 ${arr.filter(q => q.type === '填空题').length}</span>
                        <span>解 ${arr.filter(q => q.type === '解答题').length}</span>
                    </div>
                    <div class="thumb-modal-tip">💡 每道题默认不显示答案，点击题目卡片展开详情</div>
                </div>
                <div class="thumb-modal-questions">
                    ${arr.map(q => renderThumbQuestionItem(q)).join('')}
                </div>
            </div>
        `;
        renderMath(document.getElementById('thumbModalBody'));
        // 每道题：默认只显示题目，点击后展开详情（含答案）
        document.querySelectorAll('#thumbModalBody .thumb-q-item').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = el.dataset.id;
                const q = state.questions.find(q => q.id === id);
                if (q) {
                    document.getElementById('thumbModal').hidden = true;
                    openQuestionModal(q);
                }
            });
        });
        document.getElementById('thumbModal').hidden = false;
    }

    /* ===== 缩略图弹窗中的题目项：默认折叠（不显示答案） ===== */
    function renderThumbQuestionItem(q) {
        const opts = (q.options || []).slice(0, 4).map(o =>
            `<div class="thumb-opt">${escapeHtml(o)}</div>`
        ).join('');
        return `
            <div class="thumb-q-item" data-id="${q.id}">
                <div class="thumb-q-head">
                    <span class="q-year">${q.year}</span>
                    <span class="q-num">${q.num}</span>
                    <span class="q-type q-type-${q.type}">${q.type}</span>
                    <span class="q-difficulty">${'★'.repeat(q.difficulty || 2)}</span>
                    <span class="q-score">${q.score}分</span>
                    <span class="thumb-q-go">点击查看详情 →</span>
                </div>
                <div class="q-body">${q.question || ''}</div>
                ${opts ? `<div class="q-opts">${opts}</div>` : ''}
            </div>
        `;
    }

    function openQuestionModal(q) {
        const title = `${q.year} ${q.num} (${q.type}, ${q.score}分)`;
        const kpBadges = (q.knowledgeIds || []).map(k => `
            <span class="kp-badge lg">${k}</span>
        `).join(' ');
        const opts = (q.options || []).map(o => `<div class="modal-opt">${escapeHtml(o)}</div>`).join('');

        document.getElementById('questionModalTitle').textContent = title;
        document.getElementById('questionModalBody').innerHTML = `
            <div class="q-modal-body">
                <div class="q-modal-main">
                    <div class="q-modal-meta">
                        <span class="q-part">${q.part}</span>
                        <span class="q-type q-type-${q.type}">${q.type}</span>
                        <span class="q-difficulty">${'★'.repeat(q.difficulty || 2)}</span>
                        <span class="q-score">${q.score}分</span>
                        ${q.chapter ? `<span class="q-chapter">章节 ${q.chapter}</span>` : ''}
                    </div>
                    ${kpBadges ? `<div class="q-modal-kps">${kpBadges}</div>` : ''}
                    <div class="q-modal-question">${q.question || ''}</div>
                    ${opts ? `<div class="q-modal-opts">${opts}</div>` : ''}

                    ${renderCollapsibleSolution(q)}
                    ${renderCollapsibleKnowledge(q)}
                    ${renderCollapsiblePractice(q)}
                </div>
                <div class="q-modal-mastery-sidebar">
                    ${renderMasterySidebar(q)}
                </div>
            </div>
            <div class="q-modal-nav">
                <button type="button" class="q-nav-btn q-nav-prev" id="qNavPrev">← 上一题</button>
                <button type="button" class="q-nav-btn q-nav-next" id="qNavNext">下一题 →</button>
            </div>
        `;
        renderMath(document.getElementById('questionModalBody'));
        bindCollapsibleToggles();
        bindNavButtons(q);
        document.getElementById('questionModal').hidden = false;
    }

    /* ===== 导航按钮：上一题 / 下一题 ===== */
    function bindNavButtons(q) {
        const flat = state.progressFlatList;
        const idx = flat.findIndex(x => x.id === q.id);
        if (idx < 0) return;
        const prevBtn = document.getElementById('qNavPrev');
        const nextBtn = document.getElementById('qNavNext');
        if (!prevBtn || !nextBtn) return;

        prevBtn.disabled = idx <= 0;
        nextBtn.disabled = idx >= flat.length - 1;

        prevBtn.onclick = () => {
            if (idx > 0) openQuestionModal(flat[idx - 1]);
        };
        nextBtn.onclick = () => {
            if (idx < flat.length - 1) openQuestionModal(flat[idx + 1]);
        };
    }

    /* ===== 折叠式：答案 + 解题骨架 + 详细步骤 ===== */
    function renderCollapsibleSolution(q) {
        const hasFullSolution = q.solution && q.solution.length > 0;
        const hasSkeleton = hasFullSolution;
        const hasCommonErrors = q.commonErrors && q.commonErrors.length > 0;
        const answerText = q.answer || '（参考解析请查阅配套解析 PDF）';
        const solveOverview = renderSolutionOverview(q, hasFullSolution);
        const reviewAdvice = renderReviewAdvice(q, hasFullSolution, hasCommonErrors);

        // 骨架：来自 solution steps 的 title 列表
        let skeletonHtml = '';
        if (hasSkeleton) {
            const items = q.solution.map(s =>
                `<li><strong>第 ${s.step} 步</strong>：${escapeHtml(s.title || '')}</li>`
            ).join('');
            skeletonHtml = `<ol class="skeleton-list">${items}</ol>`;
        } else if (q.testPoints && q.testPoints.length) {
            skeletonHtml = `<ul class="skeleton-list">${q.testPoints.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;
        } else {
            skeletonHtml = '<p class="empty-tip">本题暂无解析骨架，请参考涉及知识点章节。</p>';
        }

        // 详细步骤
        let detailedHtml = '';
        if (hasFullSolution) {
            const totalSteps = q.solution.length;
            const steps = q.solution.map((s, idx) => `
                <div class="solution-step">
                    <div class="step-num">第 ${s.step} 步 · ${getStepRoleLabel(idx, totalSteps)}</div>
                    <div class="step-title">${escapeHtml(s.title || '')}</div>
                    <div class="step-content">${s.content || ''}</div>
                </div>
            `).join('');
            detailedHtml = `
                <div class="detail-intro">
                    <p><strong>阅读顺序：</strong>先看骨架确认思路，再自己尝试推一遍，最后展开下面的步骤核对细节。</p>
                    <p><strong>本题解析状态：</strong>已配置 ${totalSteps} 步详细过程，可直接按“入口 → 推导 → 结论”的顺序复盘。</p>
                </div>
                ${steps}
            `;
        } else {
            detailedHtml = renderFallbackDetailed(q);
        }

        // 常见错误
        let errorsHtml = '';
        if (hasCommonErrors) {
            errorsHtml = `
                <div class="common-errors">
                    <div class="err-title">⚠️ 常见错误</div>
                    <ul>${q.commonErrors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
                </div>
            `;
        }

        return `
            <!-- 答案：默认折叠（防止意外看到） -->
            <details class="q-collapse q-collapse-answer">
                <summary>【答案】<span class="collapse-hint">点击展开</span></summary>
                <div class="answer-content">
                    <div class="answer-main"><strong>参考答案：</strong>${escapeHtml(answerText)}</div>
                    <div class="answer-guide">${reviewAdvice}</div>
                </div>
            </details>

            <!-- 解题骨架：默认展开 -->
            <details class="q-collapse q-collapse-skeleton" open>
                <summary>【解题骨架】<span class="collapse-hint">点击收起</span></summary>
                <div class="skeleton-content">${solveOverview}${skeletonHtml}</div>
            </details>

            <!-- 详细步骤：默认折叠 -->
            <details class="q-collapse q-collapse-detail">
                <summary>【详细步骤】<span class="collapse-hint">点击展开</span></summary>
                <div class="detail-content">${detailedHtml}${errorsHtml}</div>
            </details>
        `;
    }

    function renderSolutionOverview(q, hasFullSolution) {
        const testPoints = (q.testPoints || []).filter(Boolean);
        const kpNames = (q.knowledgePoints || []).map(k => k && k.name).filter(Boolean);
        const meta = [
            `题型：${q.type || '未标注'} / ${q.part || '未标注'}`,
            `难度：${getDifficultyLabel(q.difficulty)}`,
            hasFullSolution ? `解析：已配 ${q.solution.length} 步` : '解析：暂缺完整步骤',
            q.frequency ? `近年热度：${q.frequency} 次` : '近年热度：待补充'
        ];
        const testPointText = testPoints.length ? testPoints.join('、') : '未单独标注考点';
        const kpText = kpNames.length ? kpNames.join('、') : '未单独标注知识点名称';
        return `
            <div class="solution-overview">
                <p><strong>本题先看什么：</strong>${inferSolveEntry(q, testPoints, kpNames)}</p>
                <p><strong>核心考查：</strong>${escapeHtml(testPointText)}</p>
                <p><strong>涉及知识：</strong>${escapeHtml(kpText)}</p>
                <ul class="solution-overview-list">
                    ${meta.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    function inferSolveEntry(q, testPoints, kpNames) {
        if (testPoints.length >= 2) {
            return `先识别为“${testPoints[0]} + ${testPoints[1]}”的组合题，再顺着题目给的条件一层层往下拆。`;
        }
        if (testPoints.length === 1) {
            return `先把它看成“${testPoints[0]}”这一类题，优先套这类题最常用的判定框架或公式。`;
        }
        if (kpNames.length) {
            return `先回忆“${kpNames[0]}”对应的基本定义和常用公式，再决定是直接计算、判定还是构造辅助量。`;
        }
        if (q.type === '选择题') {
            return '先比较选项差异，再反推题目想考的核心性质，必要时可以用特值、排除或反例加速。';
        }
        if (q.type === '填空题') {
            return '先抓题目中的已知条件和目标量，优先写出定义式、通用公式或标准变形。';
        }
        return '先明确题目要求证什么、求什么，再把已知条件逐条翻成可计算的式子。';
    }

    function renderReviewAdvice(q, hasFullSolution, hasCommonErrors) {
        const tips = [];
        tips.push(hasFullSolution
            ? `建议先看“解题骨架”，自己做一遍后再展开“详细步骤”，这样更容易真正记住。`
            : '这题目前还没有完整分步过程，先看骨架和涉及知识点，再去对应章节补方法。');
        if (hasCommonErrors) {
            tips.push(`复盘时重点盯住“常见错误”部分，避免同类题在同一个地方反复失分。`);
        }
        if (q.type === '选择题') {
            tips.push('选择题先求稳：能排除先排除，最后再核对答案背后的理由。');
        } else if (q.type === '解答题') {
            tips.push('解答题复盘时尽量按“写思路 → 写步骤 → 回收结论”的顺序重做一遍。');
        }
        return `<ul class="answer-guide-list">${tips.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;
    }

    function renderFallbackDetailed(q) {
        const testPoints = (q.testPoints || []).filter(Boolean);
        const kpNames = (q.knowledgePoints || []).map(k => k && k.name).filter(Boolean);
        const lines = [
            `第 1 步先审题：圈出条件、目标和限制范围，判断它属于哪一类经典题型。`,
            `第 2 步再回忆工具：优先检查 ${testPoints[0] || kpNames[0] || '该题对应知识点'} 的定义、公式和标准套路。`,
            `第 3 步最后复盘：把自己的推导和答案对照，补齐缺的中间式与结论句。`
        ];
        return `
            <div class="detail-intro">
                <p><strong>提示：</strong>本题暂未录入完整逐步解析，先按下面这套通用复盘顺序练一遍。</p>
            </div>
            <div class="solution-step">
                <div class="step-num">复盘模板</div>
                <div class="step-title">先自己做，再对照骨架补缺口</div>
                <div class="step-content">
                    <ol class="solution-fallback-list">
                        ${lines.map(line => `<li>${escapeHtml(line)}</li>`).join('')}
                    </ol>
                </div>
            </div>
        `;
    }

    function getStepRoleLabel(index, total) {
        if (index === 0) return '入口';
        if (index === total - 1) return '结论';
        return '关键推导';
    }

    function getDifficultyLabel(level) {
        const map = {
            1: '基础',
            2: '偏基础',
            3: '中等',
            4: '偏难',
            5: '较难'
        };
        return map[level] || '未标注';
    }

    /* ===== 折叠式：涉及知识点 ===== */
    function renderCollapsibleKnowledge(q) {
        const kps = q.knowledgeIds || [];
        if (!kps.length) {
            return `
                <details class="q-collapse q-collapse-kp">
                    <summary>【涉及知识点】<span class="collapse-hint">点击展开</span></summary>
                    <p class="empty-tip">本题未标注知识点。</p>
                </details>
            `;
        }

        // 按 section 分组
        const sectionMap = {};  // sectionId -> [kpId, ...]
        kps.forEach(kp => {
            const parts = kp.split('.');
            const sectionId = parts[0] + '.' + parts[1];
            (sectionMap[sectionId] = sectionMap[sectionId] || []).push(kp);
        });

        const sections = Object.entries(sectionMap).map(([secId, kpList]) => {
            const idx = KP_INDEX[kpList[0]];
            const sectionName = idx ? idx.sectionName : secId;
            const majorName = idx ? idx.majorName : '';
            const chapterId = KP_TO_CHAPTER[kpList[0]] || '';
            const kpItems = kpList.map(kp => {
                return `<span class="kp-tag">${kp}</span>`;
            }).join(' ');
            const chapterLink = chapterId
                ? `<a href="#${chapterId}" class="kp-jump" onclick="event.preventDefault(); window.__navigateTo && window.__navigateTo('${chapterId}');">查看章节 ${chapterId} →</a>`
                : '';
            return `
                <div class="kp-section">
                    <div class="kp-section-name">${majorName} › ${sectionName}</div>
                    <div class="kp-section-items">${kpItems}</div>
                    ${chapterLink}
                </div>
            `;
        }).join('');

        return `
            <details class="q-collapse q-collapse-kp">
                <summary>【涉及知识点（${kps.length}）】<span class="collapse-hint">点击展开</span></summary>
                <div class="kp-content">${sections}</div>
            </details>
        `;
    }

    /* ===== 折叠式：相关练习（从 PRACTICE_DATA + KP_MAP 匹配） ===== */
    function renderCollapsiblePractice(q) {
        const kps = q.knowledgeIds || [];
        if (!kps.length || !window.PRACTICE_DATA) {
            return `
                <details class="q-collapse q-collapse-practice">
                    <summary>【相关练习（模拟题）】<span class="collapse-hint">点击展开</span></summary>
                    <p class="empty-tip">暂无相关练习。</p>
                </details>
            `;
        }

        // 三层匹配策略：
        // 1. 精确：practice.knowledgeIds 与 q.knowledgeIds 交集
        // 2. 关键词：practice.type 与 KP section 名称匹配
        // 3. 兜底：题目所在章节 chapter = q.chapter 的所有练习题
        const matched = [];

        Object.keys(window.PRACTICE_DATA).forEach(chId => {
            const problems = window.PRACTICE_DATA[chId] || [];
            problems.forEach((p, idx) => {
                // 1. 精确匹配（如果有 knowledgeIds）
                if (p.knowledgeIds && p.knowledgeIds.some(k => kps.includes(k))) {
                    matched.push({ chId, p, idx, matchType: 'exact', kps: p.knowledgeIds.filter(k => kps.includes(k)) });
                    return;
                }
                // 2. 关键词匹配（按 KP section 名称）
                const typeStr = (p.type || '') + ' ' + (p.source || '');
                const matchedKps = [];
                kps.forEach(kp => {
                    const idx2 = KP_INDEX[kp];
                    if (!idx2) return;
                    // section name 关键词
                    const kws = idx2.sectionName.split(/[、，,\s]+/);
                    for (const part of kws) {
                        if (part.length >= 2 && typeStr.includes(part)) {
                            matchedKps.push(kp);
                            break;
                        }
                    }
                });
                if (matchedKps.length > 0) {
                    matched.push({ chId, p, idx, matchType: 'keyword', kps: matchedKps });
                }
            });
        });

        if (!matched.length) {
            // 3. 兜底：列出同一章节的所有练习
            if (q.chapter && window.PRACTICE_DATA[q.chapter]) {
                const fallback = (window.PRACTICE_DATA[q.chapter] || []).map((p, idx) => ({
                    chId: q.chapter, p, idx, matchType: 'fallback', kps: []
                }));
                if (fallback.length > 0) {
                    matched.push(...fallback);
                }
            }
            if (!matched.length) {
                return `
                    <details class="q-collapse q-collapse-practice">
                        <summary>【相关练习（模拟题）】<span class="collapse-hint">点击展开</span></summary>
                        <p class="empty-tip">暂无匹配到相关模拟题。可先看涉及知识点 → 跳转章节练习。</p>
                    </details>
                `;
            }
        }

        // 去重 + 排序：精确 > 关键词 > 兜底
        const seen = new Set();
        const unique = matched.filter(m => {
            const key = m.chId + ':' + m.idx;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }).sort((a, b) => {
            const rank = { exact: 0, keyword: 1, fallback: 2 };
            return (rank[a.matchType] || 9) - (rank[b.matchType] || 9);
        });

        const items = unique.slice(0, 10).map(m => {
            const { chId, p, idx, matchType, kps: matchedKps } = m;
            const snippet = (p.question || '').replace(/\\\(|\\\)|\$/g, '').substring(0, 80);
            const matchLabel = matchType === 'exact'
                ? '✓ 精确匹配'
                : matchType === 'keyword'
                    ? '~ 关键词 ' + (matchedKps[0] || '')
                    : '○ 同章节';
            return `
                <div class="practice-item" data-ch="${chId}" data-idx="${idx}">
                    <div class="practice-meta">
                        <span class="practice-ch">${chId}</span>
                        <span class="practice-type">${escapeHtml(p.type || '')}</span>
                        <span class="practice-score">${escapeHtml(p.score || '')}</span>
                        <span class="practice-match">${matchLabel}</span>
                    </div>
                    <div class="practice-q">${escapeHtml(snippet)}…</div>
                </div>
            `;
        }).join('');

        return `
            <details class="q-collapse q-collapse-practice">
                <summary>【相关练习（模拟题 ${unique.length}）】<span class="collapse-hint">点击展开</span></summary>
                <div class="practice-content">${items}</div>
                <p class="practice-tip">💡 提示：先做完这些模拟题，确认掌握后再回真题区做本题。</p>
            </details>
        `;
    }

    /* ===== 折叠面板 toggle 事件绑定（同步 summary 文字）===== */
    function bindCollapsibleToggles() {
        const detailsList = document.querySelectorAll('#questionModalBody details.q-collapse');
        detailsList.forEach(d => {
            const summarySpan = d.querySelector('.collapse-hint');
            if (!summarySpan) return;
            if (d.open) {
                summarySpan.textContent = '点击收起';
            } else {
                summarySpan.textContent = '点击展开';
            }
            d.addEventListener('toggle', () => {
                summarySpan.textContent = d.open ? '点击收起' : '点击展开';
            });
        });
    }

    /* ===== 侧边栏：掌握程度（固定在题目右侧，始终可见）===== */
    function renderMasterySidebar(q) {
        const current = (masteryData[q.id] || {}).level || 'new';
        const currentLv = MASTERY_BY_ID[current];
        const btns = MASTERY_LEVELS.map(l => {
            const isActive = current === l.id;
            return `<button type="button" class="mastery-btn ${isActive ? 'active' : ''}" data-mastery="${l.id}" data-qid="${q.id}" style="--btn-color:${l.color}">
                <span class="mastery-icon">${l.icon}</span>
                <span class="mastery-label">${l.label}</span>
            </button>`;
        }).join('');
        const cleared = current !== 'new'
            ? `<button type="button" class="mastery-clear-btn" data-mastery-clear="${q.id}">重置</button>`
            : '';
        return `
            <div class="mastery-sidebar">
                <h4 class="mastery-sidebar-title">🎯 掌握程度</h4>
                <div class="mastery-sidebar-state" id="masterySidebarState" style="color:${currentLv.color}">${currentLv.icon} ${currentLv.label}</div>
                <div class="mastery-sidebar-buttons">${btns}</div>
                <div class="mastery-sidebar-footer">${cleared}</div>
                <p class="mastery-sidebar-tip">点击按钮评价本题掌握程度，再次点击取消。数据保存在本地浏览器。</p>
            </div>
        `;
    }

    /* ===== 掌握程度筛选面板 ===== */
    function buildMasteryFilter() {
        if (!els.filterMastery) return;
        const html = `
            <button class="filter-pill active" data-m-filter="all">全部</button>
            ${MASTERY_LEVELS.map(l => `
                <button class="filter-pill" data-m-filter="${l.id}" style="--btn-color:${l.color}">
                    ${l.icon} ${l.label}
                </button>
            `).join('')}
            <button class="filter-pill" data-m-filter="unmastered" style="color:#dc2626;border-color:#fca5a5;">未掌握</button>
        `;
        els.filterMastery.innerHTML = html;
        els.filterMastery.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-m-filter]');
            if (!btn) return;
            els.filterMastery.querySelectorAll('[data-m-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyMasteryFilter(btn.dataset.mFilter);
        });
    }

    function applyMasteryFilter(level) {
        state.filters.mastery = level;
        renderQuestions();
    }

    /* ===== Tab 切换：题目列表 / 进度总览 ===== */
    function bindTabEvents() {
        if (els.tabListBtn) {
            els.tabListBtn.addEventListener('click', () => setActiveTab('list'));
        }
        if (els.tabProgressBtn) {
            els.tabProgressBtn.addEventListener('click', () => setActiveTab('progress'));
        }
    }

    function setActiveTab(name) {
        if (name !== 'list' && name !== 'progress') return;
        state.activeTab = name;
        const isProgress = name === 'progress';
        document.body.dataset.zhentiTab = name;

        // Tab 按钮态
        if (els.tabListBtn) {
            const active = !isProgress;
            els.tabListBtn.classList.toggle('active', active);
            els.tabListBtn.setAttribute('aria-selected', active ? 'true' : 'false');
        }
        if (els.tabProgressBtn) {
            const active = isProgress;
            els.tabProgressBtn.classList.toggle('active', active);
            els.tabProgressBtn.setAttribute('aria-selected', active ? 'true' : 'false');
        }

        // 主区域可见性
        if (els.progressArea) els.progressArea.hidden = !isProgress;
        if (els.content) els.content.hidden = isProgress;

        // 进度总览下隐藏只服务列表的区域，列表下恢复
        const listOnly = [els.thumbStrip, els.filtersBar, els.sidebar, els.chartsBottom];
        listOnly.forEach(el => {
            if (!el) return;
            el.hidden = isProgress;
        });

        if (isProgress) renderProgressOverview();
    }

    /* ===== 进度总览渲染：全部年份 × 全部题，一页展示，按掌握程度上色 ===== */
    function renderProgressOverview() {
        if (!els.progressArea) return;
        const stats = masteryStats();
        const total = stats.total;
        const mastered = (stats.byLevel['mastered'] || 0) + (stats.byLevel['expert'] || 0);
        const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;

        // 顶部图例 + 总览（复用 masteryStats 数据）
        const legendItems = MASTERY_LEVELS.map(l => {
            const count = stats.byLevel[l.id] || 0;
            return `<div class="progress-legend-item" data-level="${l.id}">
                <span class="legend-color" style="background:${l.color}"></span>
                <span class="legend-label">${l.label}</span>
                <span class="legend-count">${count}</span>
            </div>`;
        }).join('');

        // 年份降序、年内按 qnum 升序
        const years = Object.keys(state.byYear).map(Number).sort((a, b) => b - a);
        const flatQuestions = [];
        const yearBlocks = years.map(y => {
            const arr = (state.byYear[y] || [])
                .slice()
                .sort((a, b) => (a.qnum || 0) - (b.qnum || 0));
            flatQuestions.push(...arr);
            const yMastered = arr.filter(q => {
                const lv = (masteryData[q.id] || {}).level || 'new';
                return lv === 'mastered' || lv === 'expert';
            }).length;
            const yPct = arr.length > 0 ? Math.round((yMastered / arr.length) * 100) : 0;
            const boxes = arr.map(q => {
                const lv = getMastery(q.id);
                // 优先 qnum，回退 num
                const displayNum = (q.qnum !== undefined && q.qnum !== null && q.qnum !== '')
                    ? String(q.qnum)
                    : (q.num != null ? String(q.num) : '');
                const numAttr = escapeHtml(q.num || '');
                const typeAttr = escapeHtml(q.type || '');
                const yearAttr = escapeHtml(String(q.year));
                const lvlAttr = escapeHtml(lv.label);
                const bgRgba = hexToRgba(lv.color, 0.15);
                const titleStr = `${q.year} ${q.num || q.qnum || ''} · ${q.type} · ${lv.label}`;
                const ariaStr = `${q.year}年 第${q.num || q.qnum}题 ${q.type} 掌握程度:${lv.label}`;
                return `<button type="button" class="progress-q" data-qid="${escapeHtml(q.id)}"
                    data-year="${yearAttr}" data-num="${numAttr}" data-type="${typeAttr}" data-level="${lv.id}"
                    style="--q-color:${lv.color};--q-bg:${bgRgba}"
                    title="${escapeHtml(titleStr)}"
                    aria-label="${escapeHtml(ariaStr)}">${escapeHtml(displayNum)}</button>`;
            }).join('');
            return `<div class="progress-year-block">
                <h3 class="progress-year-title">
                    <span class="progress-year-name">${y} 年</span>
                    <span class="progress-year-stats">已掌握 <strong>${yMastered}</strong> / ${arr.length} <em class="progress-year-pct">(${yPct}%)</em></span>
                </h3>
                <div class="progress-year-bar" aria-hidden="true">
                    <div class="progress-year-bar-fill" style="width:${yPct}%"></div>
                </div>
                <div class="progress-q-grid">${boxes}</div>
            </div>`;
        }).join('');

        state.progressFlatList = flatQuestions;

        els.progressArea.innerHTML = `
            <div class="progress-legend">
                <div class="progress-summary">
                    已掌握 <strong>${mastered}</strong> / ${total} 题（<strong>${masteredPct}%</strong>）
                </div>
                <div class="progress-legend-items">${legendItems}</div>
            </div>
            <div class="progress-years">${yearBlocks}</div>
        `;

        // 绑定方格点击 → 复用现有 openQuestionModal(q)
        els.progressArea.querySelectorAll('.progress-q').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.qid;
                const q = state.questions.find(x => x.id === id);
                if (q) openQuestionModal(q);
            });
        });
    }

    function hexToRgba(hex, alpha) {
        if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${alpha})`;
        let h = hex.replace('#', '').trim();
        if (h.length === 3) {
            h = h.split('').map(c => c + c).join('');
        }
        if (h.length !== 6) return hex;
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /* ===== 题卡片上挂载 mastery 徽章 ===== */
    function applyMasteryBadgesToCards() {
        document.querySelectorAll('.question-card').forEach(card => {
            const qid = card.dataset.id;
            let slot = card.querySelector('.mastery-badge-slot');
            if (!slot) {
                slot = document.createElement('div');
                slot.className = 'mastery-badge-slot';
                const meta = card.querySelector('.question-card-meta') || card.firstElementChild;
                if (meta) {
                    meta.appendChild(slot);
                } else {
                    card.appendChild(slot);
                }
            }
            slot.innerHTML = renderMasteryBadge(qid);
        });
    }

    /* ===== 工具 ===== */
    function debounce(fn, wait) {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
    }

    function escapeHtml(s) {
        if (s === null || s === undefined) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderMath(container) {
        if (!container || !window.renderMathInElement) return;
        try {
            renderMathInElement(container, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true },
                ],
                throwOnError: false,
            });
        } catch (e) { /* ignore */ }
    }

    /* ===== 启动 ===== */
    function start() {
        init().catch(e => console.error('init() error:', e));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    // 监听页面可能被动态注入 zhenti 模块（app.js 在 fetch zhenti.html 完成后会调用）
    // 使用 MutationObserver 监测关键节点出现
    if (typeof MutationObserver !== 'undefined') {
        const obs = new MutationObserver(() => {
            if (document.getElementById('zhenti') && !initialized) {
                init().catch(e => console.error('init() error:', e));
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        // 30 秒后停止观察
        setTimeout(() => obs.disconnect(), 30000);
    }

    // 暴露调试 API（兼容老版 app.js 调用）
    window.initZhentiModule = start;
    window.__zhenti = { state, KP_TREE, KP_NAME, loadAllData };
})()
