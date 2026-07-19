/**
 * 考研数学一 · 真题模块主逻辑
 *
 * 功能模块：
 *   1) 总览统计 (overview)
 *   2) 历年真题列表 (all) - 支持年份/板块/题型/难度/关键词筛选
 *   3) 考点分类 (kpoint) - 按考察点/必备知识点聚合
 *   4) 错题本 (wrongbook) - 自动收集掌握度 < 60% 的题
 *   5) 模考模式 (mock) - 随机抽题 + 倒计时 + 成绩报告
 *   6) 学习统计 (stats) - 各维度掌握度可视化
 *   7) 掌握度追踪（Supabase 持久化 + localStorage 兜底）
 *
 * 暴露给 app.js：
 *   window.initZhentiModule() - 在 zhenti.html 注入到 DOM 后调用
 *
 * 暴露给浏览器（HTML 内联脚本调用）：
 *   window.__zhenti - 全局状态对象（用于调试与扩展）
 */

(function() {
    'use strict';

    // ===== 状态 =====
    const state = {
        currentTab: 'all',       // all | kpoint | wrongbook | mock | stats
        filters: {
            year: 'all',
            part: 'all',
            type: 'all',
            difficulty: 'all',
            keyword: ''
        },
        masteryCache: {},         // questionId -> [{level, date, note, ...}]
        mockState: null           // 模考运行状态
    };

    // ===== DOM 引用（懒初始化） =====
    let contentArea, overviewEl, filtersEl, tabsEl;

    // ============================================================
    // 初始化入口
    // ============================================================
    function init() {
        contentArea = document.getElementById('zhentiContentArea');
        overviewEl = document.getElementById('zhentiOverview');
        filtersEl = document.getElementById('zhentiFilters');
        tabsEl = document.querySelector('.zhenti-tabs');

        if (!contentArea || !window.ZHENTI_DATA) {
            console.warn('zhenti 模块初始化失败：DOM 或数据未就绪');
            return;
        }

        bindTabEvents();
        bindFilterEvents();
        bindSearchEvent();
        renderOverview();
        renderCurrentTab();
        renderMathWhenReady(contentArea);
        renderMathWhenReady(document.querySelector('.zhenti-overview'));
        renderMathWhenReady(document.querySelector('.zhenti-intro'));

        // 异步加载历史掌握度（拿到数据后再渲染一次，让 mastery badge 显示真实数据）
        loadAllMasteryCache().then(function() {
            renderOverview();
            renderCurrentTab();
            // 二次渲染 KaTeX（重新生成的卡片里可能包含公式）
            renderMathWhenReady(contentArea);
            renderMathWhenReady(document.querySelector('.zhenti-overview'));
        });
    }

    // ============================================================
    // 总览统计卡片
    // ============================================================
    function renderOverview() {
        if (!overviewEl) return;
        var total = 0;
        var byYear = {};
        var byPart = { '高数': 0, '线代': 0, '概率': 0 };
        var byType = { '选择题': 0, '填空题': 0, '解答题': 0 };
        var masteredCount = 0;
        var weakCount = 0;

        Object.keys(window.ZHENTI_DATA).forEach(function(year) {
            var arr = window.ZHENTI_DATA[year];
            byYear[year] = arr.length;
            total += arr.length;
            arr.forEach(function(q) {
                if (byPart[q.part] !== undefined) byPart[q.part]++;
                if (byType[q.type] !== undefined) byType[q.type]++;

                // 掌握度
                var mid = q.id;
                var records = state.masteryCache[mid];
                if (records && records.length > 0) {
                    var latest = getLatestRecord(records);
                    if (latest.level >= 80) masteredCount++;
                    else if (latest.level < 60) weakCount++;
                }
            });
        });

        // 主卡片行（4 个）：总数、已掌握、薄弱题、覆盖年份
        var mainRowHtml =
            '<div class="zhenti-stat-row" style="display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap;">' +
                statCard('📚', total, '真题总数', '#3498db') +
                statCard('✅', masteredCount, '已掌握(≥80%)', '#27ae60') +
                statCard('⚠️', weakCount, '薄弱题(<60%)', '#e74c3c') +
                statCard('📅', Object.keys(byYear).length, '覆盖年份', '#9b59b6') +
            '</div>';

        // 板块分布行（3 个紧凑条）
        var partTotal = byPart['高数'] + byPart['线代'] + byPart['概率'] || 1;
        var partRowHtml =
            '<div class="zhenti-part-row" style="display:flex;align-items:center;gap:10px;background:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.06);flex-wrap:wrap;">' +
                '<div class="zrp-label" style="font-size:12px;white-space:nowrap;min-width:64px;color:#1abc9c;">📐 高数 <strong style="color:#1a3a5c;font-size:14px;">' + byPart['高数'] + '</strong></div>' +
                '<div class="zrp-bar" style="flex:1;min-width:60px;height:8px;background:#f0f4f8;border-radius:4px;overflow:hidden;"><div class="zrp-fill" style="height:100%;background:#1abc9c;border-radius:4px;transition:width 0.6s ease;width:' + (byPart['高数']/partTotal*100).toFixed(1) + '%;"></div></div>' +
                '<div class="zrp-label" style="font-size:12px;white-space:nowrap;min-width:64px;color:#f39c12;">🔢 线代 <strong style="color:#1a3a5c;font-size:14px;">' + byPart['线代'] + '</strong></div>' +
                '<div class="zrp-bar" style="flex:1;min-width:60px;height:8px;background:#f0f4f8;border-radius:4px;overflow:hidden;"><div class="zrp-fill" style="height:100%;background:#f39c12;border-radius:4px;transition:width 0.6s ease;width:' + (byPart['线代']/partTotal*100).toFixed(1) + '%;"></div></div>' +
                '<div class="zrp-label" style="font-size:12px;white-space:nowrap;min-width:64px;color:#e67e22;">🎲 概率 <strong style="color:#1a3a5c;font-size:14px;">' + byPart['概率'] + '</strong></div>' +
                '<div class="zrp-bar" style="flex:1;min-width:60px;height:8px;background:#f0f4f8;border-radius:4px;overflow:hidden;"><div class="zrp-fill" style="height:100%;background:#e67e22;border-radius:4px;transition:width 0.6s ease;width:' + (byPart['概率']/partTotal*100).toFixed(1) + '%;"></div></div>' +
            '</div>';

        overviewEl.innerHTML = mainRowHtml + partRowHtml;
    }

    function statCard(icon, num, label, color) {
        // 用 inline style 兜底，避免浏览器缓存了旧 CSS 时样式失效
        return '<div class="zhenti-stat-card" style="flex:1 1 0;min-width:0;background:#fff;border-radius:8px;padding:12px 8px;box-shadow:0 2px 6px rgba(0,0,0,0.06);text-align:center;border-top:3px solid ' + color + ';">' +
            '<div class="zs-icon" style="font-size:20px;margin-bottom:2px;">' + icon + '</div>' +
            '<div class="zs-num" style="font-size:20px;font-weight:700;color:#1a3a5c;line-height:1.2;">' + num + '</div>' +
            '<div class="zs-label" style="font-size:11px;color:#6a8fbb;margin-top:2px;">' + label + '</div>' +
            '</div>';
    }

    // ============================================================
    // Tab 切换
    // ============================================================
    function bindTabEvents() {
        if (!tabsEl) return;
        tabsEl.querySelectorAll('.zhenti-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var tab = btn.dataset.tab;
                if (tab === state.currentTab) return;
                state.currentTab = tab;
                tabsEl.querySelectorAll('.zhenti-tab').forEach(function(b) {
                    b.classList.toggle('active', b === btn);
                });
                // 切换 tab 时显示/隐藏筛选栏
                if (filtersEl) {
                    filtersEl.style.display = (tab === 'all' || tab === 'kpoint') ? '' : 'none';
                }
                renderCurrentTab();
            });
        });
    }

    function renderCurrentTab() {
        if (!contentArea) return;
        switch (state.currentTab) {
            case 'all':        renderAllQuestions(); break;
            case 'kpoint':     renderByKnowledgePoint(); break;
            case 'wrongbook':  renderWrongBook(); break;
            case 'mock':       openMockModal(); break;
            case 'stats':      renderStats(); break;
        }
        // 每次切换 tab 后统一渲染一次数学公式（覆盖 kpoint/stats 等不再单独调用的分支）
        renderMathWhenReady(contentArea);
    }

    // ============================================================
    // 筛选逻辑
    // ============================================================
    function bindFilterEvents() {
        document.querySelectorAll('#filterYear .filter-pill').forEach(function(b) {
            b.addEventListener('click', function() {
                setActive(b.parentElement, b);
                state.filters.year = b.dataset.year;
                renderCurrentTab();
            });
        });
        document.querySelectorAll('#filterPart .filter-pill').forEach(function(b) {
            b.addEventListener('click', function() {
                setActive(b.parentElement, b);
                state.filters.part = b.dataset.part;
                renderCurrentTab();
            });
        });
        document.querySelectorAll('#filterType .filter-pill').forEach(function(b) {
            b.addEventListener('click', function() {
                setActive(b.parentElement, b);
                state.filters.type = b.dataset.type;
                renderCurrentTab();
            });
        });
        document.querySelectorAll('#filterDifficulty .filter-pill').forEach(function(b) {
            b.addEventListener('click', function() {
                setActive(b.parentElement, b);
                state.filters.difficulty = b.dataset.difficulty;
                renderCurrentTab();
            });
        });
    }

    function bindSearchEvent() {
        var input = document.getElementById('zhentiSearch');
        if (!input) return;
        var debounce;
        input.addEventListener('input', function() {
            clearTimeout(debounce);
            debounce = setTimeout(function() {
                state.filters.keyword = input.value.trim().toLowerCase();
                renderCurrentTab();
            }, 200);
        });
    }

    function setActive(parent, btn) {
        parent.querySelectorAll('.filter-pill').forEach(function(b) {
            b.classList.toggle('active', b === btn);
        });
    }

    function applyFilters(questions) {
        var f = state.filters;
        return questions.filter(function(q) {
            if (f.year !== 'all' && String(q.year) !== f.year) return false;
            if (f.part !== 'all' && q.part !== f.part) return false;
            if (f.type !== 'all' && q.type !== f.type) return false;
            if (f.difficulty !== 'all' && String(q.difficulty) !== f.difficulty) return false;
            if (f.keyword) {
                var kw = f.keyword;
                var hay = (q.question + ' ' + q.num + ' ' + q.part + ' ' + q.type + ' ' +
                    (q.tags || []).join(' ') + ' ' +
                    (q.testPoints || []).join(' ') + ' ' +
                    (q.knowledgePoints || []).map(function(k) { return k.name; }).join(' ')
                ).toLowerCase();
                if (hay.indexOf(kw) === -1) return false;
            }
            return true;
        });
    }

    function getAllQuestions() {
        var all = [];
        Object.keys(window.ZHENTI_DATA).forEach(function(year) {
            (window.ZHENTI_DATA[year] || []).forEach(function(q) {
                all.push(q);
            });
        });
        // 按年份倒序 + 题号排序
        all.sort(function(a, b) {
            if (a.year !== b.year) return b.year - a.year;
            return a.num.localeCompare(b.num);
        });
        return all;
    }

    // ============================================================
    // 历年真题列表
    // ============================================================
    function renderAllQuestions() {
        var all = applyFilters(getAllQuestions());

        if (all.length === 0) {
            contentArea.innerHTML = '<div class="zhenti-empty">' +
                '<div class="empty-icon">🔍</div>' +
                '<div class="empty-text">没有符合条件的真题</div>' +
                '<div class="empty-tip">试着调整筛选条件或清空搜索关键词</div>' +
            '</div>';
            return;
        }

        var headerHtml = '<div class="zhenti-list-header">' +
            '<div class="zlh-info">共找到 <strong>' + all.length + '</strong> 道真题，按年份倒序排列</div>' +
            '<div class="zlh-actions">' +
                '<button class="zbtn zbtn-ghost" id="zhentiExpandAll">📖 全部展开</button>' +
                '<button class="zbtn zbtn-ghost" id="zhentiCollapseAll">📕 全部收起</button>' +
            '</div>' +
        '</div>';

        var listHtml = all.map(function(q) { return renderQuestionCard(q); }).join('');
        contentArea.innerHTML = headerHtml + '<div class="zhenti-question-list">' + listHtml + '</div>';

        bindCardEvents();
        bindMasteryToggles();
        renderMathWhenReady(contentArea);
    }

    // ============================================================
    // 单题卡片
    // ============================================================
    function renderQuestionCard(q) {
        var records = state.masteryCache[q.id] || [];
        var latest = getLatestRecord(records);
        var masteryHtml = renderMasteryBadge(latest);

        var difficultyStars = '';
        for (var i = 0; i < 5; i++) {
            difficultyStars += i < q.difficulty ? '★' : '☆';
        }

        var optionsHtml = '';
        if (q.options && q.options.length > 0) {
            optionsHtml = '<div class="q-options">' +
                q.options.map(function(opt) { return '<div class="q-option">' + opt + '</div>'; }).join('') +
            '</div>';
        }

        var kpHtml = '';
        if (q.knowledgePoints && q.knowledgePoints.length > 0) {
            kpHtml = '<div class="q-kpoints">' +
                '<span class="qk-label">📚 必备知识点：</span>' +
                q.knowledgePoints.map(function(kp) {
                    return '<a class="qk-chip" data-chapter="' + kp.chapter + '" ' +
                        'data-anchor="' + (kp.anchor || '') + '" ' +
                        'title="点击跳转到 ' + kp.chapter + ' 章节">' +
                        escapeHtml(kp.name) +
                    '</a>';
                }).join('') +
            '</div>';
        }

        var tpHtml = '';
        if (q.testPoints && q.testPoints.length > 0) {
            tpHtml = '<div class="q-tpoints">' +
                '<span class="qt-label">🎯 考察点：</span>' +
                q.testPoints.map(function(t) { return '<span class="qt-chip">' + escapeHtml(t) + '</span>'; }).join('') +
            '</div>';
        }

        var errHtml = '';
        if (q.commonErrors && q.commonErrors.length > 0) {
            errHtml = '<div class="q-errors">' +
                '<span class="qe-label">⚠️ 易错点：</span>' +
                '<ul>' + q.commonErrors.map(function(e) { return '<li>' + escapeHtml(e) + '</li>'; }).join('') + '</ul>' +
            '</div>';
        }

        return '<div class="zhenti-card" data-qid="' + q.id + '">' +
            '<div class="zc-head" data-role="card-head">' +
                '<div class="zc-head-left">' +
                    '<span class="zc-year">' + q.year + '</span>' +
                    '<span class="zc-num">' + q.num + '</span>' +
                    '<span class="zc-part zc-part-' + q.part + '">' + q.part + '</span>' +
                    '<span class="zc-type">' + q.type + '</span>' +
                    '<span class="zc-score">' + q.score + '分</span>' +
                    '<span class="zc-difficulty" title="难度">' + difficultyStars + '</span>' +
                '</div>' +
                '<div class="zc-head-right">' +
                    masteryHtml +
                    '<span class="zc-toggle">▾</span>' +
                '</div>' +
            '</div>' +
            '<div class="zc-body">' +
                '<div class="zc-question">' +
                    '<div class="zq-label">📝 题目</div>' +
                    '<div class="zq-text">' + q.question + '</div>' +
                    optionsHtml +
                '</div>' +
                '<div class="zc-meta">' +
                    tpHtml +
                    kpHtml +
                '</div>' +
                '<div class="zc-actions">' +
                    '<button class="zbtn zbtn-primary" data-role="view-solution">📖 查看详细解析</button>' +
                    '<button class="zbtn" data-role="view-answer">🎯 看答案</button>' +
                    '<button class="zbtn zbtn-ghost" data-role="record-mastery">📊 记录掌握度</button>' +
                '</div>' +
                '<div class="zc-solution" data-role="solution" hidden>' +
                    '<div class="zs-head">🧭 解题步骤</div>' +
                    '<ol class="zs-steps">' +
                        q.solution.map(function(s) {
                            var formulaHtml = s.formula ? '<div class="zs-formula">' + s.formula + '</div>' : '';
                            return '<li class="zs-step">' +
                                '<div class="zs-step-title">' + escapeHtml(s.title) + '</div>' +
                                '<div class="zs-step-content">' + s.content + '</div>' +
                                formulaHtml +
                            '</li>';
                        }).join('') +
                    '</ol>' +
                    '<div class="zs-answer">' +
                        '<span class="zsa-label">🎯 最终答案：</span>' +
                        '<span class="zsa-value">' + q.answer + '</span>' +
                    '</div>' +
                    errHtml +
                '</div>' +
                '<div class="zc-mastery-panel" data-role="mastery-panel" hidden>' +
                    renderMasteryPanel(q.id) +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function renderMasteryBadge(latest) {
        if (!latest) {
            return '<span class="zc-mastery none" title="还未记录掌握度">📊 未记录</span>';
        }
        var color = latest.level >= 80 ? '#27ae60' : (latest.level < 60 ? '#e74c3c' : '#f39c12');
        var cls = latest.level >= 80 ? 'strong' : (latest.level < 60 ? 'weak' : 'mid');
        return '<span class="zc-mastery ' + cls + '" style="background:' + color + ';" title="最近掌握度 ' + latest.level + '% · ' + latest.record_date + '">' +
            '📊 ' + latest.level + '% · ' + latest.record_date.substring(5) +
        '</span>';
    }

    function renderMasteryPanel(qid) {
        var records = state.masteryCache[qid] || [];
        var latest = getLatestRecord(records);
        var cur = latest ? latest.level : 50;
        return '<div class="zmp-inner">' +
            '<div class="zmp-row">' +
                '<label>掌握度</label>' +
                '<input type="range" min="0" max="100" step="5" value="' + cur + '" data-role="range">' +
                '<span class="zmp-value" data-role="value">' + cur + '%</span>' +
            '</div>' +
            '<div class="zmp-row">' +
                '<label>日期</label>' +
                '<input type="date" data-role="date" value="' + todayStr() + '">' +
            '</div>' +
            '<div class="zmp-row">' +
                '<label>备注</label>' +
                '<input type="text" data-role="note" placeholder="第几次复习、错在哪、记忆口诀...">' +
            '</div>' +
            '<div class="zmp-actions">' +
                '<button class="zbtn zbtn-primary" data-role="save">💾 保存</button>' +
                '<button class="zbtn zbtn-ghost" data-role="close">收起 ▲</button>' +
            '</div>' +
            '<div class="zmp-history" data-role="history">' + renderHistoryItems(records) + '</div>' +
        '</div>';
    }

    function renderHistoryItems(records) {
        if (!records || records.length === 0) {
            return '<div class="zmp-empty">还没有记录。做完一道题就保存一下，掌握度会跟着日期积累 📈</div>';
        }
        var sorted = records.slice().sort(function(a, b) {
            if (a.record_date !== b.record_date) return a.record_date < b.record_date ? 1 : -1;
            return (b.created_at || '') < (a.created_at || '') ? -1 : 1;
        });
        return '<div class="zmp-history-title">📜 历史记录</div>' +
            '<ul class="zmp-history-list">' +
            sorted.map(function(r) {
                var color = r.level >= 80 ? '#27ae60' : (r.level < 60 ? '#e74c3c' : '#f39c12');
                var noteHtml = r.note ? '<span class="zh-note" title="' + escapeAttr(r.note) + '">' + escapeHtml(r.note) + '</span>' : '';
                return '<li class="zmp-history-item" data-id="' + r.id + '">' +
                    '<span class="zh-date">' + r.record_date + '</span>' +
                    '<div class="zh-bar"><div class="zh-bar-fill" style="width:' + r.level + '%; background:' + color + '"></div></div>' +
                    '<span class="zh-pct" style="color:' + color + '">' + r.level + '%</span>' +
                    noteHtml +
                    '<button class="zh-delete" data-role="del" data-id="' + r.id + '">✕</button>' +
                '</li>';
            }).join('') +
            '</ul>';
    }

    function getLatestRecord(records) {
        if (!records || records.length === 0) return null;
        var sorted = records.slice().sort(function(a, b) {
            if (a.record_date !== b.record_date) return a.record_date < b.record_date ? 1 : -1;
            return (b.created_at || '') < (a.created_at || '') ? -1 : 1;
        });
        // 注意：数据库中 mastery_level 字段，在本地存储中叫 level
        var r = sorted[0];
        return {
            level: r.mastery_level !== undefined ? r.mastery_level : r.level,
            record_date: r.record_date,
            id: r.id
        };
    }

    function bindCardEvents() {
        // 折叠/展开
        contentArea.querySelectorAll('[data-role="card-head"]').forEach(function(head) {
            head.addEventListener('click', function(e) {
                if (e.target.closest('[data-role="mastery-toggle"]')) return;
                var card = head.closest('.zhenti-card');
                var body = card.querySelector('.zc-body');
                var toggle = card.querySelector('.zc-toggle');
                var isCollapsed = card.classList.toggle('collapsed');
                if (toggle) toggle.textContent = isCollapsed ? '▾' : '▴';
            });
        });

        // 查看详细解析
        contentArea.querySelectorAll('[data-role="view-solution"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var card = btn.closest('.zhenti-card');
                var sol = card.querySelector('[data-role="solution"]');
                if (sol) {
                    var willShow = sol.hidden;
                    sol.hidden = !willShow;
                    btn.textContent = willShow ? '📕 收起解析' : '📖 查看详细解析';
                    if (willShow) {
                        renderMathWhenReady(sol);
                    }
                }
            });
        });

        // 查看答案
        contentArea.querySelectorAll('[data-role="view-answer"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var card = btn.closest('.zhenti-card');
                var qid = card.dataset.qid;
                var q = findQuestionById(qid);
                if (q) showAnswerModal(q);
            });
        });

        // 知识点跳转
        contentArea.querySelectorAll('.qk-chip').forEach(function(chip) {
            chip.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var chapter = chip.dataset.chapter;
                if (chapter && window.__navigateTo) {
                    window.__navigateTo(chapter);
                    // 滚动到 anchor（如果有）
                    setTimeout(function() {
                        var anchor = chip.dataset.anchor;
                        if (anchor) {
                            var target = document.getElementById(anchor);
                            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 600);
                }
            });
        });

        // 全部展开 / 收起
        var expandAll = document.getElementById('zhentiExpandAll');
        var collapseAll = document.getElementById('zhentiCollapseAll');
        if (expandAll) expandAll.addEventListener('click', function() {
            contentArea.querySelectorAll('.zhenti-card').forEach(function(c) {
                c.classList.remove('collapsed');
                var toggle = c.querySelector('.zc-toggle');
                if (toggle) toggle.textContent = '▴';
            });
        });
        if (collapseAll) collapseAll.addEventListener('click', function() {
            contentArea.querySelectorAll('.zhenti-card').forEach(function(c) {
                c.classList.add('collapsed');
                var toggle = c.querySelector('.zc-toggle');
                if (toggle) toggle.textContent = '▾';
            });
        });
    }

    function bindMasteryToggles() {
        // 记录掌握度按钮
        contentArea.querySelectorAll('[data-role="record-mastery"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var card = btn.closest('.zhenti-card');
                var panel = card.querySelector('[data-role="mastery-panel"]');
                if (panel) {
                    panel.hidden = !panel.hidden;
                    btn.textContent = panel.hidden ? '📊 记录掌握度' : '📊 收起';
                }
            });
        });

        // 关闭按钮
        contentArea.querySelectorAll('[data-role="close"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var panel = btn.closest('[data-role="mastery-panel"]');
                if (panel) panel.hidden = true;
            });
        });

        // 滑块
        contentArea.querySelectorAll('[data-role="range"]').forEach(function(range) {
            var valueEl = range.parentElement.querySelector('[data-role="value"]');
            range.addEventListener('input', function() {
                valueEl.textContent = range.value + '%';
                valueEl.style.color = range.value >= 80 ? '#27ae60' : (range.value < 60 ? '#e74c3c' : '#1a3a5c');
            });
        });

        // 保存按钮
        contentArea.querySelectorAll('[data-role="save"]').forEach(function(btn) {
            btn.addEventListener('click', async function() {
                var panel = btn.closest('[data-role="mastery-panel"]');
                var card = btn.closest('.zhenti-card');
                var qid = card.dataset.qid;
                var range = panel.querySelector('[data-role="range"]');
                var date = panel.querySelector('[data-role="date"]');
                var note = panel.querySelector('[data-role="note"]');
                var level = parseInt(range.value, 10);
                var dateStr = date.value || todayStr();
                var noteStr = note.value.trim();

                btn.disabled = true;
                btn.textContent = '保存中...';
                var rec = await saveMastery(qid, level, dateStr, noteStr);
                if (rec) {
                    showToast('✅ 已保存：' + dateStr + ' · ' + level + '%');
                    note.value = '';
                    range.value = 50;
                    panel.querySelector('[data-role="value"]').textContent = '50%';
                    date.value = todayStr();
                    // 更新本地缓存
                    state.masteryCache[qid] = state.masteryCache[qid] || [];
                    state.masteryCache[qid].push(rec);
                    // 刷新卡片头部 + 历史
                    refreshCardMastery(card, qid);
                } else {
                    showToast('❌ 保存失败', 'error');
                }
                btn.disabled = false;
                btn.textContent = '💾 保存';
            });
        });

        // 删除按钮
        contentArea.querySelectorAll('[data-role="del"]').forEach(function(btn) {
            btn.addEventListener('click', async function() {
                var id = btn.dataset.id;
                if (!confirm('确定删除这条记录？')) return;
                btn.disabled = true;
                var ok = await deleteMasteryById(id);
                if (ok) {
                    showToast('✅ 记录已删除');
                    // 重新加载
                    state.masteryCache = await fetchAllMasteryCache();
                    var card = btn.closest('.zhenti-card');
                    var qid = card.dataset.qid;
                    var panel = card.querySelector('[data-role="mastery-panel"]');
                    if (panel) {
                        panel.querySelector('[data-role="history"]').innerHTML = renderHistoryItems(state.masteryCache[qid] || []);
                        // 重新绑定删除按钮
                        bindMasteryToggles();
                    }
                    refreshCardMastery(card, qid);
                } else {
                    showToast('❌ 删除失败', 'error');
                    btn.disabled = false;
                }
            });
        });
    }

    function refreshCardMastery(card, qid) {
        var records = state.masteryCache[qid] || [];
        var latest = getLatestRecord(records);
        var badge = card.querySelector('.zc-mastery');
        if (badge) {
            badge.outerHTML = renderMasteryBadge(latest);
        }
        var historyEl = card.querySelector('[data-role="history"]');
        if (historyEl) historyEl.innerHTML = renderHistoryItems(records);
        renderOverview();
    }

    // ============================================================
    // 考点分类视图
    // ============================================================
    function renderByKnowledgePoint() {
        var all = applyFilters(getAllQuestions());

        // 收集所有考察点 + 知识点
        var kpointMap = {};   // name -> {questions: [], freq: 0}
        var kpMap = {};       // knowledge point name -> {chapter, questions: []}

        all.forEach(function(q) {
            (q.testPoints || []).forEach(function(tp) {
                if (!kpointMap[tp]) kpointMap[tp] = { name: tp, questions: [], freq: 0 };
                kpointMap[tp].questions.push(q);
                kpointMap[tp].freq++;
            });
            (q.knowledgePoints || []).forEach(function(kp) {
                if (!kpMap[kp.name]) kpMap[kp.name] = { name: kp.name, chapter: kp.chapter, questions: [] };
                kpMap[kp.name].questions.push(q);
            });
        });

        var tpEntries = Object.values(kpointMap).sort(function(a, b) { return b.freq - a.freq; });
        var kpEntries = Object.values(kpMap).sort(function(a, b) { return b.questions.length - a.questions.length; });

        var html =
            '<div class="zhenti-kp-overview">' +
                '<div class="zkp-card">' +
                    '<div class="zkp-title">🎯 考察点分布（高频考点）</div>' +
                    '<div class="zkp-desc">汇总所有真题中出现的考察点，按出现频次排序。频次越高 = 出题人越爱考。</div>' +
                '</div>' +
            '</div>' +
            '<div class="zhenti-kp-grid">';

        // 考察点列
        html += '<div class="zkp-section"><div class="zkp-section-title">🎯 考察点 Top ' + tpEntries.length + '</div>';
        tpEntries.slice(0, 30).forEach(function(tp) {
            html += '<div class="zkp-item" data-tp="' + escapeAttr(tp.name) + '">' +
                '<span class="zkp-name">' + escapeHtml(tp.name) + '</span>' +
                '<span class="zkp-count">' + tp.freq + '次</span>' +
                '<span class="zkp-arrow">→</span>' +
            '</div>';
        });
        if (tpEntries.length > 30) {
            html += '<div class="zkp-more">... 还有 ' + (tpEntries.length - 30) + ' 个考察点（已被筛选过滤）</div>';
        }
        html += '</div>';

        // 知识点列（按章节分组）
        html += '<div class="zkp-section"><div class="zkp-section-title">📚 必备知识点（按章节）</div>';
        var byChapter = {};
        kpEntries.forEach(function(kp) {
            if (!byChapter[kp.chapter]) byChapter[kp.chapter] = [];
            byChapter[kp.chapter].push(kp);
        });
        Object.keys(byChapter).sort().forEach(function(ch) {
            html += '<div class="zkp-chapter-group">' +
                '<div class="zkp-chapter-label">📖 ' + chapterName(ch) + '（' + byChapter[ch].length + '个）</div>';
            byChapter[ch].forEach(function(kp) {
                html += '<div class="zkp-item kkp-item" data-kp="' + escapeAttr(kp.name) + '" data-chapter="' + ch + '">' +
                    '<span class="zkp-name">' + escapeHtml(kp.name) + '</span>' +
                    '<span class="zkp-count">' + kp.questions.length + '题</span>' +
                    '<span class="zkp-arrow">→</span>' +
                '</div>';
            });
            html += '</div>';
        });
        html += '</div>';

        html += '</div>';

        contentArea.innerHTML = html;

        // 绑定点击事件：筛选到对应考察点
        contentArea.querySelectorAll('.zkp-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var tp = item.dataset.tp;
                var kp = item.dataset.kp;
                if (tp) {
                    state.filters.keyword = tp;
                    document.getElementById('zhentiSearch').value = tp;
                } else if (kp) {
                    state.filters.keyword = kp;
                    document.getElementById('zhentiSearch').value = kp;
                }
                // 切回历年真题 tab
                state.currentTab = 'all';
                tabsEl.querySelectorAll('.zhenti-tab').forEach(function(b) {
                    b.classList.toggle('active', b.dataset.tab === 'all');
                });
                if (filtersEl) filtersEl.style.display = '';
                renderCurrentTab();
            });
        });
    }

    function chapterName(ch) {
        var map = {
            'ch01': '第一章 函数、极限、连续',
            'ch02': '第二章 一元函数微分学',
            'ch03': '第三章 一元函数积分学',
            'ch04': '第四章 向量代数与解析几何',
            'ch05': '第五章 多元函数微分学',
            'ch06': '第六章 多元函数积分学',
            'ch07': '第七章 无穷级数',
            'ch08': '第八章 常微分方程',
            'ch09': '第九章 行列式',
            'ch10': '第十章 矩阵',
            'ch11': '第十一章 向量',
            'ch12': '第十二章 线性方程组',
            'ch13': '第十三章 特征值与特征向量',
            'ch14': '第十四章 二次型',
            'ch15': '第十五章 随机事件与概率',
            'ch16': '第十六章 随机变量及其分布',
            'ch17': '第十七章 多维随机变量',
            'ch18': '第十八章 数字特征',
            'ch19': '第十九章 大数定律',
            'ch20': '第二十章 数理统计'
        };
        return map[ch] || ch;
    }

    // ============================================================
    // 错题本
    // ============================================================
    function renderWrongBook() {
        var weak = getAllQuestions().filter(function(q) {
            var records = state.masteryCache[q.id];
            if (!records || records.length === 0) return false;
            var latest = getLatestRecord(records);
            return latest && latest.level < 60;
        });

        var untested = getAllQuestions().filter(function(q) {
            var records = state.masteryCache[q.id];
            return !records || records.length === 0;
        });

        var html = '<div class="zhenti-wrongbook">';
        html += '<div class="zwb-header">' +
            '<div class="zwb-title">📕 错题本（自动收集）</div>' +
            '<div class="zwb-desc">系统自动收集你标记掌握度低于 60% 的真题。反复练习直到掌握度 ≥ 80%。</div>' +
        '</div>';

        html += '<div class="zwb-stats">' +
            statCard('📕', weak.length, '薄弱题 (<60%)', '#e74c3c') +
            statCard('❓', untested.length, '未做题', '#95a5a6') +
            statCard('✅', getAllQuestions().length - weak.length - untested.length, '已掌握', '#27ae60') +
        '</div>';

        if (weak.length === 0 && untested.length === 0) {
            html += '<div class="zwb-empty">' +
                '<div class="empty-icon">🎉</div>' +
                '<div class="empty-text">太棒了！暂时没有错题</div>' +
                '<div class="empty-tip">继续保持，每做完一道题都记录掌握度</div>' +
            '</div>';
        } else {
            if (weak.length > 0) {
                html += '<div class="zwb-section">' +
                    '<div class="zwb-section-title">📕 薄弱题 (' + weak.length + ')</div>' +
                    '<div class="zhenti-question-list">' +
                    weak.map(function(q) { return renderQuestionCard(q); }).join('') +
                    '</div>' +
                '</div>';
            }
            if (untested.length > 0) {
                html += '<div class="zwb-section">' +
                    '<div class="zwb-section-title">❓ 未做题 (' + untested.length + ')</div>' +
                    '<div class="zwb-hint">⚠️ 这些题你还没做过，建议尽快开始练习</div>' +
                    '<div class="zhenti-question-list">' +
                    untested.map(function(q) { return renderQuestionCard(q); }).join('') +
                    '</div>' +
                '</div>';
            }
        }

        html += '</div>';

        contentArea.innerHTML = html;
        bindCardEvents();
        bindMasteryToggles();
        renderMathWhenReady(contentArea);
    }

    // ============================================================
    // 模考模式
    // ============================================================
    function openMockModal() {
        var modal = document.getElementById('mockModal');
        if (!modal) return;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';

        // 重置显示
        document.getElementById('mockSetup').hidden = false;
        document.getElementById('mockRunning').hidden = true;
        document.getElementById('mockResult').hidden = true;

        // 绑定事件
        var closeBtn = document.getElementById('mockClose');
        var startBtn = document.getElementById('mockStartBtn');
        var submitBtn = document.getElementById('mockSubmitBtn');
        var prevBtn = document.getElementById('mockPrevBtn');
        var nextBtn = document.getElementById('mockNextBtn');
        var restartBtn = document.getElementById('mockRestartBtn');
        var backBtn = document.getElementById('mockBackBtn');

        // 移除旧监听器（克隆节点法）
        closeBtn.onclick = function() { modal.hidden = true; document.body.style.overflow = ''; };
        startBtn.onclick = startMockExam;
        submitBtn.onclick = submitMockExam;
        prevBtn.onclick = function() { moveMockQuestion(-1); };
        nextBtn.onclick = function() { moveMockQuestion(1); };
        restartBtn.onclick = function() {
            document.getElementById('mockSetup').hidden = false;
            document.getElementById('mockRunning').hidden = true;
            document.getElementById('mockResult').hidden = true;
        };
        backBtn.onclick = function() {
            modal.hidden = true;
            document.body.style.overflow = '';
        };
    }

    function startMockExam() {
        var yearRange = document.getElementById('mockYearRange').value;
        var partFilter = document.getElementById('mockPart').value;
        var count = parseInt(document.getElementById('mockCount').value, 10);
        var duration = parseInt(document.getElementById('mockTime').value, 10);

        // 收集候选题
        var candidates = getAllQuestions().filter(function(q) {
            if (yearRange === '2024-2025') {
                if (q.year < 2024) return false;
            } else if (yearRange === '2023-2025') {
                if (q.year < 2023) return false;
            } else if (yearRange === '2022-2025') {
                if (q.year < 2022) return false;
            }
            if (partFilter !== 'all' && q.part !== partFilter) return false;
            return true;
        });

        if (candidates.length < count) {
            alert('候选题不足 ' + count + ' 道，请放宽条件。当前仅 ' + candidates.length + ' 道。');
            return;
        }

        // 随机抽取
        var shuffled = candidates.slice().sort(function() { return Math.random() - 0.5; });
        var picked = shuffled.slice(0, count);

        state.mockState = {
            questions: picked,
            currentIdx: 0,
            userAnswers: new Array(picked.length).fill(''),
            startTime: Date.now(),
            duration: duration * 60 * 1000,
            timer: null,
            submitted: false
        };

        // 切换到 running
        document.getElementById('mockSetup').hidden = true;
        document.getElementById('mockRunning').hidden = false;
        document.getElementById('mockTotalNum').textContent = count;

        // 渲染题目 dots
        var dotsEl = document.getElementById('mockQuestionDots');
        dotsEl.innerHTML = picked.map(function(_, i) {
            return '<span class="mock-dot ' + (i === 0 ? 'active' : '') + '" data-idx="' + i + '">' + (i + 1) + '</span>';
        }).join('');
        dotsEl.querySelectorAll('.mock-dot').forEach(function(dot) {
            dot.addEventListener('click', function() {
                state.mockState.currentIdx = parseInt(dot.dataset.idx, 10);
                renderMockQuestion();
            });
        });

        // 启动计时器
        startMockTimer();
        renderMockQuestion();
    }

    function startMockTimer() {
        if (state.mockState.timer) clearInterval(state.mockState.timer);
        state.mockState.timer = setInterval(function() {
            var remaining = state.mockState.duration - (Date.now() - state.mockState.startTime);
            if (remaining <= 0) {
                clearInterval(state.mockState.timer);
                state.mockState.timer = null;
                submitMockExam(true);
                return;
            }
            var m = Math.floor(remaining / 60000);
            var s = Math.floor((remaining % 60000) / 1000);
            document.getElementById('mockTimer').textContent =
                (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
            // 剩余时间变红
            var timerEl = document.getElementById('mockTimer');
            timerEl.classList.toggle('urgent', remaining < 10 * 60 * 1000);
        }, 1000);
    }

    function renderMockQuestion() {
        var idx = state.mockState.currentIdx;
        var q = state.mockState.questions[idx];
        var area = document.getElementById('mockQuestionArea');
        document.getElementById('mockCurrentNum').textContent = idx + 1;

        var optionsHtml = '';
        if (q.options && q.options.length > 0) {
            optionsHtml = '<div class="mock-options">' +
                q.options.map(function(opt, i) {
                    var checked = state.mockState.userAnswers[idx] === opt ? 'checked' : '';
                    return '<label class="mock-option ' + checked + '">' +
                        '<input type="radio" name="mockOpt" value="' + escapeAttr(opt) + '" ' + checked + '>' +
                        '<span>' + opt + '</span>' +
                    '</label>';
                }).join('') +
            '</div>';
        } else {
            // 填空/解答题
            var placeholder = q.type === '填空题' ? '请输入答案（数字/字母/表达式）' : '请在此输入解答过程和最终答案';
            optionsHtml = '<div class="mock-textarea">' +
                '<textarea data-role="answer" rows="6" placeholder="' + placeholder + '">' +
                escapeHtml(state.mockState.userAnswers[idx] || '') + '</textarea>' +
            '</div>';
        }

        area.innerHTML = '<div class="mock-q-card">' +
            '<div class="mq-head">' +
                '<span class="mq-num">第 ' + (idx + 1) + ' / ' + state.mockState.questions.length + ' 题</span>' +
                '<span class="mq-meta">' + q.year + ' · ' + q.part + ' · ' + q.type + ' · ' + q.score + '分</span>' +
            '</div>' +
            '<div class="mq-question">' + q.question + '</div>' +
            optionsHtml +
        '</div>';

        // 更新 dots
        var dotsEl = document.getElementById('mockQuestionDots');
        dotsEl.querySelectorAll('.mock-dot').forEach(function(dot) {
            var di = parseInt(dot.dataset.idx, 10);
            dot.classList.toggle('active', di === idx);
            dot.classList.toggle('answered', state.mockState.userAnswers[di] !== '');
        });

        // 绑定答案变化
        area.querySelectorAll('input[name="mockOpt"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                state.mockState.userAnswers[idx] = radio.value;
                area.querySelectorAll('.mock-option').forEach(function(opt) {
                    var inp = opt.querySelector('input');
                    opt.classList.toggle('checked', inp && inp.checked);
                });
                // 更新 dot
                var dot = dotsEl.querySelector('[data-idx="' + idx + '"]');
                if (dot) dot.classList.add('answered');
            });
        });
        var textarea = area.querySelector('[data-role="answer"]');
        if (textarea) {
            textarea.addEventListener('input', function() {
                state.mockState.userAnswers[idx] = textarea.value;
                var dot = dotsEl.querySelector('[data-idx="' + idx + '"]');
                if (dot) dot.classList.toggle('answered', textarea.value.trim() !== '');
            });
        }

        renderMathWhenReady(area);
    }

    function moveMockQuestion(delta) {
        var m = state.mockState;
        var next = m.currentIdx + delta;
        if (next < 0 || next >= m.questions.length) return;
        m.currentIdx = next;
        renderMockQuestion();
    }

    function submitMockExam(autoSubmit) {
        if (!state.mockState || state.mockState.submitted) return;
        if (!autoSubmit) {
            var unanswered = state.mockState.userAnswers.filter(function(a) { return !a || !a.trim(); }).length;
            if (unanswered > 0) {
                if (!confirm('还有 ' + unanswered + ' 道题未作答，确定要交卷吗？')) return;
            }
        }
        state.mockState.submitted = true;
        if (state.mockState.timer) {
            clearInterval(state.mockState.timer);
            state.mockState.timer = null;
        }

        // 显示成绩
        document.getElementById('mockRunning').hidden = true;
        document.getElementById('mockResult').hidden = false;

        renderMockResult();
    }

    function renderMockResult() {
        var m = state.mockState;
        var total = m.questions.length;
        var correctCount = 0;
        var score = 0;

        // 简化打分逻辑：选择题/填空题根据答案字符串匹配
        m.questions.forEach(function(q, i) {
            var ua = (m.userAnswers[i] || '').trim();
            var ans = (q.answer || '').trim();
            if (!ua) return;
            // 标准化比较
            var normUser = normalizeAnswer(ua);
            var normAns = normalizeAnswer(ans);
            if (normUser === normAns) {
                correctCount++;
                score += q.score;
            }
        });

        var maxScore = m.questions.reduce(function(s, q) { return s + q.score; }, 0);
        var accuracy = total > 0 ? Math.round(correctCount / total * 100) : 0;

        // 用时
        var elapsed = Date.now() - m.startTime;
        var elapsedMin = Math.floor(elapsed / 60000);
        var elapsedSec = Math.floor((elapsed % 60000) / 1000);

        // 渲染统计
        document.getElementById('mockResultStats').innerHTML =
            '<div class="mrs-grid">' +
            statCard('🎯', score + ' / ' + maxScore, '预估得分', score / maxScore >= 0.6 ? '#27ae60' : '#e74c3c') +
            statCard('✅', correctCount + ' / ' + total, '答对题数', '#3498db') +
            statCard('📊', accuracy + '%', '正确率', accuracy >= 70 ? '#27ae60' : (accuracy >= 50 ? '#f39c12' : '#e74c3c')) +
            statCard('⏱', elapsedMin + '分' + elapsedSec + '秒', '用时', '#9b59b6') +
            '</div>';

        // 渲染详细答题情况
        var detailHtml = '<div class="mrd-title">📋 答题详情</div>';
        m.questions.forEach(function(q, i) {
            var ua = (m.userAnswers[i] || '').trim();
            var isCorrect = normalizeAnswer(ua) === normalizeAnswer(q.answer);
            var status = !ua ? 'skipped' : (isCorrect ? 'correct' : 'wrong');
            var statusText = !ua ? '⚪ 未作答' : (isCorrect ? '✅ 正确' : '❌ 错误');
            detailHtml += '<div class="mrd-item ' + status + '">' +
                '<div class="mrd-head">' +
                    '<span class="mrd-num">第 ' + (i + 1) + ' 题</span>' +
                    '<span class="mrd-status">' + statusText + '</span>' +
                '</div>' +
                '<div class="mrd-q-text">' + q.question + '</div>' +
                '<div class="mrd-answer-row">' +
                    '<span class="mrd-label">你的答案：</span>' +
                    '<span class="mrd-user">' + (ua || '<em>未作答</em>') + '</span>' +
                '</div>' +
                '<div class="mrd-answer-row">' +
                    '<span class="mrd-label">参考答案：</span>' +
                    '<span class="mrd-ans">' + q.answer + '</span>' +
                '</div>' +
            '</div>';
        });
        document.getElementById('mockResultDetail').innerHTML = detailHtml;
        renderMathWhenReady(document.getElementById('mockResultDetail'));
    }

    function normalizeAnswer(s) {
        if (!s) return '';
        return s.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/\\left/g, '')
            .replace(/\\right/g, '')
            .replace(/\\,/g, '')
            .replace(/\\\(/g, '')
            .replace(/\\\)/g, '')
            .replace(/\\\[/g, '')
            .replace(/\\\]/g, '')
            .replace(/\\/g, '')
            .replace(/dfrac/g, '')
            .replace(/frac/g, '')
            .replace(/mathrm/g, '')
            .replace(/\{/g, '')
            .replace(/\}/g, '')
            .replace(/，/g, ',')
            .replace(/。/g, '.')
            .replace(/;/g, '');
    }

    // ============================================================
    // 学习统计
    // ============================================================
    function renderStats() {
        var all = getAllQuestions();

        // 1. 总览
        var totalCount = all.length;
        var doneCount = 0;
        var masteredCount = 0;
        var weakCount = 0;
        var midCount = 0;
        var totalRecords = 0;

        all.forEach(function(q) {
            var records = state.masteryCache[q.id];
            if (records && records.length > 0) {
                doneCount++;
                totalRecords += records.length;
                var latest = getLatestRecord(records);
                if (latest.level >= 80) masteredCount++;
                else if (latest.level < 60) weakCount++;
                else midCount++;
            }
        });

        var coverage = totalCount > 0 ? Math.round(doneCount / totalCount * 100) : 0;

        // 2. 按板块统计
        var partStats = { '高数': {total:0, done:0, mastered:0, weak:0}, '线代': {total:0, done:0, mastered:0, weak:0}, '概率': {total:0, done:0, mastered:0, weak:0} };
        all.forEach(function(q) {
            if (partStats[q.part]) {
                partStats[q.part].total++;
                var records = state.masteryCache[q.id];
                if (records && records.length > 0) {
                    partStats[q.part].done++;
                    var latest = getLatestRecord(records);
                    if (latest.level >= 80) partStats[q.part].mastered++;
                    else if (latest.level < 60) partStats[q.part].weak++;
                }
            }
        });

        // 3. 按年份统计
        var yearStats = {};
        all.forEach(function(q) {
            if (!yearStats[q.year]) yearStats[q.year] = {total:0, done:0, mastered:0};
            yearStats[q.year].total++;
            var records = state.masteryCache[q.id];
            if (records && records.length > 0) {
                yearStats[q.year].done++;
                var latest = getLatestRecord(records);
                if (latest.level >= 80) yearStats[q.year].mastered++;
            }
        });

        // 4. 高频考点（掌握度低的）
        var kpWeakMap = {};
        all.forEach(function(q) {
            var records = state.masteryCache[q.id];
            if (!records) return;
            var latest = getLatestRecord(records);
            if (latest.level >= 60) return;
            (q.testPoints || []).forEach(function(tp) {
                if (!kpWeakMap[tp]) kpWeakMap[tp] = {name: tp, count: 0, totalLevel: 0};
                kpWeakMap[tp].count++;
                kpWeakMap[tp].totalLevel += latest.level;
            });
        });
        var weakKPs = Object.values(kpWeakMap).sort(function(a, b) {
            return (a.totalLevel / a.count) - (b.totalLevel / b.count);
        }).slice(0, 10);

        // 渲染
        var html = '<div class="zhenti-stats">';

        // 总览
        html += '<div class="zst-section">' +
            '<div class="zst-title">📊 总体进度</div>' +
            '<div class="zst-grid">' +
                statCard('📚', totalCount, '真题总数', '#3498db') +
                statCard('✏️', doneCount, '已做题', '#1abc9c') +
                statCard('📈', coverage + '%', '覆盖率', '#9b59b6') +
                statCard('📜', totalRecords, '总记录数', '#34495e') +
            '</div>' +
            '<div class="zst-progress">' +
                '<div class="zst-bar"><div class="zst-bar-fill mastered" style="width:' + (totalCount > 0 ? masteredCount/totalCount*100 : 0) + '%"></div></div>' +
                '<div class="zst-bar"><div class="zst-bar-fill mid" style="width:' + (totalCount > 0 ? midCount/totalCount*100 : 0) + '%"></div></div>' +
                '<div class="zst-bar"><div class="zst-bar-fill weak" style="width:' + (totalCount > 0 ? weakCount/totalCount*100 : 0) + '%"></div></div>' +
                '<div class="zst-legend">' +
                    '<span class="zl-item"><span class="zl-dot" style="background:#27ae60"></span> 已掌握 ' + masteredCount + '</span>' +
                    '<span class="zl-item"><span class="zl-dot" style="background:#f39c12"></span> 中等 ' + midCount + '</span>' +
                    '<span class="zl-item"><span class="zl-dot" style="background:#e74c3c"></span> 薄弱 ' + weakCount + '</span>' +
                '</div>' +
            '</div>' +
        '</div>';

        // 按板块
        html += '<div class="zst-section">' +
            '<div class="zst-title">📚 按板块统计</div>' +
            '<div class="zst-part-grid">';
        ['高数', '线代', '概率'].forEach(function(p) {
            var s = partStats[p];
            var cov = s.total > 0 ? Math.round(s.done / s.total * 100) : 0;
            html += '<div class="zst-part-card">' +
                '<div class="zsp-name">' + p + '</div>' +
                '<div class="zsp-numbers">' +
                    '<span>已做 <strong>' + s.done + '</strong>/' + s.total + '</span>' +
                    '<span>掌握 <strong style="color:#27ae60">' + s.mastered + '</strong></span>' +
                    '<span>薄弱 <strong style="color:#e74c3c">' + s.weak + '</strong></span>' +
                '</div>' +
                '<div class="zsp-progress"><div class="zsp-fill" style="width:' + cov + '%"></div></div>' +
                '<div class="zsp-pct">' + cov + '%</div>' +
            '</div>';
        });
        html += '</div></div>';

        // 按年份
        html += '<div class="zst-section">' +
            '<div class="zst-title">📅 按年份统计</div>' +
            '<div class="zst-year-list">';
        var years = Object.keys(yearStats).sort().reverse();
        years.forEach(function(y) {
            var s = yearStats[y];
            var cov = s.total > 0 ? Math.round(s.done / s.total * 100) : 0;
            html += '<div class="zsy-row">' +
                '<span class="zsy-year">' + y + '</span>' +
                '<div class="zsy-bar"><div class="zsy-fill" style="width:' + cov + '%"></div></div>' +
                '<span class="zsy-info">' + s.done + '/' + s.total + '</span>' +
                '<span class="zsy-pct">' + cov + '%</span>' +
            '</div>';
        });
        html += '</div></div>';

        // 薄弱考点
        if (weakKPs.length > 0) {
            html += '<div class="zst-section">' +
                '<div class="zst-title">⚠️ 薄弱考点 Top 10（需要重点复习）</div>' +
                '<div class="zst-weak-list">';
            weakKPs.forEach(function(kp) {
                var avg = Math.round(kp.totalLevel / kp.count);
                html += '<div class="zwk-item" data-tp="' + escapeAttr(kp.name) + '">' +
                    '<span class="zwk-name">' + escapeHtml(kp.name) + '</span>' +
                    '<span class="zwk-count">' + kp.count + '题</span>' +
                    '<div class="zwk-bar"><div class="zwk-fill" style="width:' + avg + '%; background:' + (avg < 40 ? '#e74c3c' : '#f39c12') + '"></div></div>' +
                    '<span class="zwk-pct">' + avg + '%</span>' +
                '</div>';
            });
            html += '</div>' +
                '<div class="zwk-hint">💡 点击考点名可以跳转到该考点的真题列表</div>' +
            '</div>';
        }

        html += '</div>';

        contentArea.innerHTML = html;

        // 绑定薄弱考点点击
        contentArea.querySelectorAll('[data-tp]').forEach(function(item) {
            item.addEventListener('click', function() {
                var tp = item.dataset.tp;
                state.filters.keyword = tp;
                document.getElementById('zhentiSearch').value = tp;
                state.currentTab = 'all';
                tabsEl.querySelectorAll('.zhenti-tab').forEach(function(b) {
                    b.classList.toggle('active', b.dataset.tab === 'all');
                });
                if (filtersEl) filtersEl.style.display = '';
                renderCurrentTab();
            });
        });
    }

    // ============================================================
    // 答案弹窗（精简版）
    // ============================================================
    function showAnswerModal(q) {
        var modal = document.getElementById('answerModal');
        document.getElementById('answerModalTitle').textContent = q.year + ' · ' + q.num + ' · ' + q.type + ' · ' + q.score + '分';
        document.getElementById('answerModalBody').innerHTML =
            '<div class="am-question">' + q.question + '</div>' +
            (q.options ? '<div class="am-options">' + q.options.map(function(o) { return '<div class="am-option">' + o + '</div>'; }).join('') + '</div>' : '') +
            '<div class="am-divider"></div>' +
            '<div class="am-answer-row"><span class="am-label">✅ 最终答案：</span><span class="am-value">' + q.answer + '</span></div>' +
            '<div class="am-actions">' +
                '<button class="zbtn zbtn-primary" data-role="view-full">📖 查看完整解析</button>' +
                '<button class="zbtn" data-role="goto-chapter">📚 跳到对应章节</button>' +
            '</div>';
        modal.hidden = false;

        document.getElementById('answerModalClose').onclick = function() {
            modal.hidden = true;
        };

        document.querySelector('#answerModalBody [data-role="view-full"]').onclick = function() {
            modal.hidden = true;
            // 触发对应卡片的"查看详细解析"
            var card = contentArea.querySelector('.zhenti-card[data-qid="' + q.id + '"]');
            if (card) {
                if (card.classList.contains('collapsed')) card.querySelector('[data-role="card-head"]').click();
                var btn = card.querySelector('[data-role="view-solution"]');
                if (btn) btn.click();
            }
        };

        document.querySelector('#answerModalBody [data-role="goto-chapter"]').onclick = function() {
            modal.hidden = true;
            if (q.knowledgePoints && q.knowledgePoints[0] && window.__navigateTo) {
                window.__navigateTo(q.knowledgePoints[0].chapter);
            }
        };

        renderMathWhenReady(document.getElementById('answerModalBody'));
    }

    // ===== 弹窗通用关闭逻辑 =====
    document.addEventListener('click', function(e) {
        // questionModal close button
        var qmClose = document.getElementById('questionModalClose');
        if (qmClose && (e.target === qmClose || qmClose.contains(e.target))) {
            document.getElementById('questionModal').hidden = true;
        }
        // 点击弹窗外部关闭
        document.querySelectorAll('.zhenti-modal').forEach(function(m) {
            if (m.hidden) return;
            if (e.target === m) {
                m.hidden = true;
            }
        });
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.zhenti-modal').forEach(function(m) {
                if (!m.hidden) m.hidden = true;
            });
        }
    });

    // ============================================================
    // 工具函数
    // ============================================================
    function findQuestionById(qid) {
        for (var y in window.ZHENTI_DATA) {
            for (var i = 0; i < window.ZHENTI_DATA[y].length; i++) {
                if (window.ZHENTI_DATA[y][i].id === qid) return window.ZHENTI_DATA[y][i];
            }
        }
        return null;
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function(c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function escapeAttr(s) { return escapeHtml(s); }

    function todayStr() {
        var d = new Date();
        var p = function(n) { return n < 10 ? '0' + n : '' + n; };
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }

    function showToast(msg, type) {
        var existing = document.querySelector('.zhenti-toast');
        if (existing) existing.remove();
        var t = document.createElement('div');
        t.className = 'zhenti-toast' + (type === 'error' ? ' error' : '');
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function() { t.classList.add('show'); }, 10);
        setTimeout(function() {
            t.classList.remove('show');
            setTimeout(function() { t.remove(); }, 300);
        }, 2200);
    }

    // ============================================================
    // 掌握度数据层（Supabase + localStorage 兜底）
    // ============================================================
    const MASTERY_TABLE = 'zhenti_mastery';
    const LOCAL_KEY = 'zhenti_mastery:all';

    function getDb() {
        if (typeof window.supabase === 'undefined') return null;
        try {
            return window.supabase.createClient(
                'https://yucploakclaznlmfpdkk.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3Bsb2FrY2xhem5sbWZwZGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNjAyNDQsImV4cCI6MjA5OTczNjI0NH0.-VpUDJgIR0KlEReUM5LzSShIwog2YiJgH28QJAj6GHI',
                { auth: { persistSession: false } }
            );
        } catch (e) { return null; }
    }

    function loadLocalAll() {
        try {
            var raw = localStorage.getItem(LOCAL_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }
    function saveLocalAll(records) {
        try { localStorage.setItem(LOCAL_KEY, JSON.stringify(records)); } catch (e) {}
    }

    async function fetchAllMasteryCache() {
        var cache = {};
        var db = getDb();
        if (db) {
            try {
                var res = await db.from(MASTERY_TABLE).select('*');
                if (!res.error && res.data) {
                    res.data.forEach(function(r) {
                        if (!cache[r.question_id]) cache[r.question_id] = [];
                        cache[r.question_id].push(r);
                    });
                    return cache;
                }
            } catch (e) { /* fallback */ }
        }
        // localStorage 兜底
        var all = loadLocalAll();
        all.forEach(function(r) {
            if (!cache[r.question_id]) cache[r.question_id] = [];
            cache[r.question_id].push(r);
        });
        return cache;
    }

    async function loadAllMasteryCache() {
        state.masteryCache = await fetchAllMasteryCache();
    }

    async function saveMastery(qid, level, dateStr, note) {
        var payload = {
            question_id: qid,
            mastery_level: level,
            record_date: dateStr,
            note: note || null
        };
        var db = getDb();
        if (db) {
            try {
                var res = await db.from(MASTERY_TABLE).insert(payload).select();
                if (!res.error && res.data && res.data[0]) return res.data[0];
            } catch (e) { /* fallback */ }
        }
        // 本地兜底
        payload.id = 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
        payload.created_at = new Date().toISOString();
        var all = loadLocalAll();
        all.push(payload);
        saveLocalAll(all);
        return payload;
    }

    async function deleteMasteryById(id) {
        var db = getDb();
        if (db && String(id).indexOf('local-') !== 0) {
            try {
                var res = await db.from(MASTERY_TABLE).delete().eq('id', id);
                if (!res.error) return true;
            } catch (e) { /* fallback */ }
        }
        var all = loadLocalAll().filter(function(r) { return String(r.id) !== String(id); });
        saveLocalAll(all);
        return true;
    }

    // ============================================================
    // 暴露给 app.js
    // ============================================================
    window.initZhentiModule = init;
    window.__zhenti = state;  // 调试用

    // KaTeX 渲染调用
    // 优先用 app.js 暴露到 window 的版本（共享正则、共享修复）。
    // 如果 window 版本不可用，本地兜底实现一份相同逻辑（与 app.js 的 renderMathWhenReady 行为一致）。
    var _FALLBACK_MATH_PATTERN = /\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$|\$([^\$]+?)\$/g;
    var _FALLBACK_MATH_DETECT = /\\\(|\\\[|\$\$|\$/;

    function _fallbackRenderMath(target) {
        if (typeof katex === 'undefined') return;
        if (typeof target.normalize === 'function') target.normalize();
        var walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
                var p = node.parentNode;
                while (p && p !== target) {
                    var tag = p.tagName;
                    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    p = p.parentNode;
                }
                return _FALLBACK_MATH_DETECT.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        var nodes = [];
        var n;
        while ((n = walker.nextNode())) nodes.push(n);
        nodes.forEach(function(textNode) {
            var html = textNode.nodeValue;
            html = html.replace(_FALLBACK_MATH_PATTERN, function(match, g1, g2, g3, g4) {
                try {
                    if (g1 !== undefined) return katex.renderToString(g1, { displayMode: false, throwOnError: false });
                    if (g2 !== undefined) return katex.renderToString(g2, { displayMode: true,  throwOnError: false });
                    if (g3 !== undefined) return katex.renderToString(g3, { displayMode: true,  throwOnError: false });
                    if (g4 !== undefined) return katex.renderToString(g4, { displayMode: false, throwOnError: false });
                } catch (e) { return match; }
            });
            var span = document.createElement('span');
            span.innerHTML = html;
            var parent = textNode.parentNode;
            while (span.firstChild) parent.insertBefore(span.firstChild, textNode);
            parent.removeChild(textNode);
        });
    }

    function _fallbackRenderMathWhenReady(target, tries) {
        tries = tries || 0;
        if (typeof katex !== 'undefined') {
            try { _fallbackRenderMath(target); } catch (e) { console.warn('KaTeX render err:', e); }
        } else if (tries < 60) {
            setTimeout(function() { _fallbackRenderMathWhenReady(target, tries + 1); }, 100);
        }
    }

    function renderMathWhenReady(target) {
        if (typeof window.renderMathWhenReady === 'function') {
            try { window.renderMathWhenReady(target); return; } catch (e) {}
        }
        if (typeof window.renderMath === 'function') {
            try { window.renderMath(target); return; } catch (e) {}
        }
        // 兜底：本地实现
        _fallbackRenderMathWhenReady(target);
    }

})();