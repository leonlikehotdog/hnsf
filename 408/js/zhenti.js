/**
 * 408 真题刷题模块 · zhenti.js
 *
 * 依赖：window.ZHENTI_DATA, window.ZHENTI_CHAPTER_INDEX, window.ZHENTI_TOTAL_COUNT
 * 全局工具：window.__navigateTo(chapterId)
 *
 * 主要能力：
 *   - 历年试卷缩略图条（点击筛选到对应年份）
 *   - 总览（按年份 × 板块分布 + 掌握程度分布）
 *   - 2 个主 Tab：题目列表 / 进度总览
 *   - 列表 Tab 内置 4 个子分组：历年/章节/板块/题型
 *   - 多条件筛选：年份 × 板块 × 题型 × 掌握程度 × 关键词搜索
 *   - 单题详情弹窗（题干 + 选项 + 答案 + 解析 + 掌握程度标注 + 章节跳转）
 *   - 进度总览：全部年份 × 全部题，一页展示，按掌握程度上色
 *   - 掌握程度：5 档（localStorage 存储）
 *   - 移动端友好：缩略图条可横滑、筛选栏可堆叠、弹窗全屏
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

    /* ===== 掌握程度定义（与数学一保持一致） ===== */
    const MASTERY_KEY = 'zhenti_mastery_408';
    const MASTERY_LEVELS = [
        { id: 'new',      label: '未开始',   icon: '⚪', color: '#94a3b8' },
        { id: 'learning', label: '学习中',   icon: '🟡', color: '#f59e0b' },
        { id: 'familiar', label: '基本掌握', icon: '🔵', color: '#3b82f6' },
        { id: 'mastered', label: '熟练掌握', icon: '🟢', color: '#10b981' },
        { id: 'expert',   label: '完全精通', icon: '🟣', color: '#a855f7' },
    ];
    const MASTERY_BY_ID = MASTERY_LEVELS.reduce(function(m, l) { m[l.id] = l; return m; }, {});
    let masteryData = {};

    function loadMastery() {
        try {
            const raw = localStorage.getItem(MASTERY_KEY);
            masteryData = raw ? JSON.parse(raw) : {};
        } catch (e) {
            masteryData = {};
        }
    }

    function saveMastery() {
        try {
            localStorage.setItem(MASTERY_KEY, JSON.stringify(masteryData));
        } catch (e) {
            console.warn('保存掌握程度失败:', e);
        }
    }

    function getMastery(qid) {
        return masteryData[qid] ? MASTERY_BY_ID[masteryData[qid].level] : MASTERY_BY_ID.new;
    }

    function setMastery(qid, levelId) {
        if (!MASTERY_BY_ID[levelId]) return;
        if (masteryData[qid] && masteryData[qid].level === levelId) {
            // 再次点击同一档 → 清除
            delete masteryData[qid];
        } else {
            masteryData[qid] = {
                level: levelId,
                updatedAt: new Date().toISOString(),
            };
        }
        saveMastery();
    }

    function masteryStats() {
        const stats = { total: allQuestions.length, byLevel: {} };
        MASTERY_LEVELS.forEach(function(l) { stats.byLevel[l.id] = 0; });
        allQuestions.forEach(function(q) {
            const lv = masteryData[q.id] ? masteryData[q.id].level : 'new';
            stats.byLevel[lv] = (stats.byLevel[lv] || 0) + 1;
        });
        return stats;
    }

    /* ===== 当前状态 ===== */
    let state = {
        mainTab: 'progress', // 默认显示「进度总览」(每题一个方块)
        subTab: 'all',       // 'all' / 'chapter' / 'part' / 'type'
        year: 'all',
        part: 'all',
        type: 'all',
        mastery: 'all',
        keyword: '',
        chapterFilter: 'all',// 仅 chapter tab 用
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

    /* ===== 年份数据分组 ===== */
    function getByYear() {
        const by = {};
        allQuestions.forEach(function(q) {
            (by[q.year] = by[q.year] || []).push(q);
        });
        return by;
    }

    /* ============= 缩略图条 ============= */
    function buildThumbStrip() {
        const byYear = getByYear();
        const years = Object.keys(byYear).map(Number).sort(function(a, b) { return b - a; });
        const html = years.map(function(y) {
            const arr = byYear[y];
            const types = { choice: 0, big: 0 };
            arr.forEach(function(q) {
                if (q.type === '选择题') types.choice++;
                else if (q.type === '大题') types.big++;
            });
            return '<div class="thumb-item" data-year="' + y + '">'
                + '<div class="thumb-year">' + y + '</div>'
                + '<div class="thumb-stat">'
                + '<span>选 ' + types.choice + '</span>'
                + '<span>大 ' + types.big + '</span>'
                + '</div>'
                + '<div class="thumb-total">' + arr.length + ' 题</div>'
                + '</div>';
        }).join('');
        document.getElementById('thumbList').innerHTML = html;

        // 绑定：点击缩略图 → 跳到题目列表 + 自动选中对应年份
        document.querySelectorAll('#thumbList .thumb-item').forEach(function(el) {
            el.addEventListener('click', function() {
                const y = String(this.dataset.year);
                setActiveTab('list');
                state.year = y;
                // 同步筛选 UI
                document.querySelectorAll('#filterYear .filter-pill').forEach(function(b) {
                    b.classList.toggle('active', b.dataset.year === y);
                });
                renderQuestionList();
                // 平滑滚到题目区
                setTimeout(function() {
                    document.getElementById('zhentiContentArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            });
        });
    }

    /* ============= 渲染总览卡片 ============= */
    function renderOverview() {
        const stats = { years: {}, parts: { '数据结构': 0, '计组': 0, '操作系统': 0, '计网': 0 } };
        allQuestions.forEach(function(q) {
            stats.years[q.year] = (stats.years[q.year] || 0) + 1;
            if (stats.parts[q.part] !== undefined) stats.parts[q.part] += 1;
        });

        const mStats = masteryStats();
        const mastered = (mStats.byLevel['mastered'] || 0) + (mStats.byLevel['expert'] || 0);
        const masteredPct = mStats.total > 0 ? Math.round((mastered / mStats.total) * 100) : 0;

        let html = '<div class="zhenti-overview-cards">';
        html += '<div class="zo-card zo-total">'
            + '<div class="zo-num">' + (window.ZHENTI_TOTAL_COUNT || allQuestions.length) + '</div>'
            + '<div class="zo-label">📚 真题总数（精选）</div>'
            + '</div>';
        html += '<div class="zo-card zo-mastered">'
            + '<div class="zo-num">' + mastered + '<span class="zo-pct"> / ' + masteredPct + '%</span></div>'
            + '<div class="zo-label">✅ 已掌握（熟练+精通）</div>'
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

    /* ============= 筛选 ============= */
    function applyFilter() {
        const kw = (state.keyword || '').trim().toLowerCase();
        return allQuestions.filter(function(q) {
            if (state.year !== 'all' && String(q.year) !== String(state.year)) return false;
            if (state.part !== 'all' && q.part !== state.part) return false;
            if (state.type !== 'all' && q.type !== state.type) return false;
            if (state.mastery !== 'all') {
                const lv = masteryData[q.id] ? masteryData[q.id].level : 'new';
                if (lv !== state.mastery) return false;
            }
            if (state.subTab === 'chapter' && state.chapterFilter !== 'all') {
                if (!(q.chapter || []).includes(state.chapterFilter)) return false;
            }
            if (kw) {
                const haystack = (q.question + ' ' + (q.testPoints || q.testTips || []).join(' ') + ' '
                    + (q.knowledgePoints || []).join(' ') + ' ' + (q.chapter || []).join(' ')
                    + ' ' + q.id).toLowerCase();
                if (haystack.indexOf(kw) === -1) return false;
            }
            return true;
        });
    }

    /* ============= 渲染题目列表 ============= */
    function renderQuestionList() {
        const list = applyFilter();
        const container = document.getElementById('zhentiContentArea');
        if (list.length === 0) {
            container.innerHTML = '<div class="zhenti-empty">'
                + '<div style="font-size:48px;margin-bottom:12px;">🔍</div>'
                + '<p>当前筛选条件下没有题目，试试调整筛选条件或清空搜索</p></div>';
            return;
        }

        const groupBy = state.subTab;
        let html = '';

        if (groupBy === 'chapter') {
            // 按章节分组
            const grouped = {};
            list.forEach(function(q) {
                (q.chapter || ['other']).forEach(function(ch) {
                    if (!grouped[ch]) grouped[ch] = [];
                    if (!grouped[ch].some(function(x) { return x.id === q.id; })) grouped[ch].push(q);
                });
            });
            const chapters = Object.keys(grouped).sort();
            chapters.forEach(function(ch) {
                html += '<div class="qgroup">'
                    + '<h3 class="qgroup-title">📘 ' + chapterTitle(ch) + ' <span class="qgroup-count">' + grouped[ch].length + ' 题</span></h3>'
                    + grouped[ch].map(questionCardHtml).join('')
                    + '</div>';
            });
        } else if (groupBy === 'part') {
            const grouped = {};
            list.forEach(function(q) { (grouped[q.part] = grouped[q.part] || []).push(q); });
            Object.keys(grouped).forEach(function(p) {
                html += '<div class="qgroup">'
                    + '<h3 class="qgroup-title">🔧 ' + PART_NAMES[p] + ' <span class="qgroup-count">' + grouped[p].length + ' 题</span></h3>'
                    + grouped[p].map(questionCardHtml).join('')
                    + '</div>';
            });
        } else if (groupBy === 'type') {
            const grouped = { '选择题': [], '大题': [] };
            list.forEach(function(q) { if (grouped[q.type]) grouped[q.type].push(q); });
            Object.keys(grouped).forEach(function(t) {
                if (grouped[t].length === 0) return;
                html += '<div class="qgroup">'
                    + '<h3 class="qgroup-title">📝 ' + t + ' <span class="qgroup-count">' + grouped[t].length + ' 题</span></h3>'
                    + grouped[t].map(questionCardHtml).join('')
                    + '</div>';
            });
        } else {
            // 按年份分组（默认）
            const grouped = {};
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
        const titles = {
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

    // 已展开答案的题目 id 集合（仅在当前会话内有效，刷新页面会重置）
    let revealedCards = new Set();
    let revealedModal = new Set();

    // 单题卡片 HTML
    function questionCardHtml(q) {
        const revealed = revealedCards.has(q.id);
        let optsHtml = '';
        if (q.options && q.options.length) {
            optsHtml = '<ul class="q-opts">' + q.options.map(function(o) {
                const isAns = o.charAt(0) === q.answer;
                return '<li class="q-opt ' + (isAns ? 'q-opt-ans' : '') + '">' + o + '</li>';
            }).join('') + '</ul>';
        }

        const chapterTags = (q.chapter || []).map(function(ch) {
            return '<button class="q-chap-link" data-chap="' + ch + '">' + ch + '</button>';
        }).join(' ');

        const lv = getMastery(q.id);
        const masteryBadge = lv.id === 'new'
            ? '<span class="q-mastery q-mastery-new">⚪ 未开始</span>'
            : '<span class="q-mastery" style="background:' + lv.color + '22;color:' + lv.color + ';border-color:' + lv.color + '55">' + lv.icon + ' ' + lv.label + '</span>';

        const ansBtn = revealed
            ? '<button class="qans-toggle qans-toggle-on" data-qid="' + q.id + '">✅ 答案：' + q.answer + '（点击隐藏）</button>'
            : '<button class="qans-toggle" data-qid="' + q.id + '">🔒 点击查看答案</button>';

        return '<div class="qcard" data-qid="' + q.id + '" data-reveal="' + (revealed ? '1' : '0') + '">'
            + '<div class="qcard-head">'
            + '<div class="qnum">' + q.year + ' · ' + q.num + '</div>'
            + '<div class="qtype">' + q.type + ' · ' + q.score + '分</div>'
            + '<div class="qpart" style="background:' + PART_COLOR[q.part] + '">' + q.part + '</div>'
            + masteryBadge
            + '</div>'
            + '<div class="qtext">' + q.question + '</div>'
            + (optsHtml ? '<div class="qopts-wrap">' + optsHtml + '</div>' : '')
            + '<div class="qcard-foot">'
            + ansBtn
            + '<span class="qchaps">📚 ' + chapterTags + '</span>'
            + '<button class="qmore">查看解析 →</button>'
            + '</div></div>';
    }

    function bindCardClicks() {
        document.querySelectorAll('#zhentiContentArea .qcard').forEach(function(card) {
            const qid = card.dataset.qid;
            card.querySelector('.qmore').addEventListener('click', function(e) {
                e.stopPropagation();
                openQuestionModal(qid);
            });
            card.addEventListener('click', function() { openQuestionModal(qid); });
            // 答案显示/隐藏
            const ansBtn = card.querySelector('.qans-toggle');
            if (ansBtn) {
                ansBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleCardAnswer(qid);
                });
            }
        });
        document.querySelectorAll('#zhentiContentArea .q-chap-link').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const ch = this.dataset.chap;
                if (window.__navigateTo) window.__navigateTo(ch);
            });
        });
    }

    function toggleCardAnswer(qid) {
        if (revealedCards.has(qid)) {
            revealedCards.delete(qid);
        } else {
            revealedCards.add(qid);
        }
        // 局部刷新：只替换该卡片
        const card = document.querySelector('#zhentiContentArea .qcard[data-qid="' + qid + '"]');
        if (card) {
            const q = allQuestions.find(function(x) { return x.id === qid; });
            if (q) {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = questionCardHtml(q);
                const newCard = wrapper.firstElementChild;
                card.replaceWith(newCard);
                // 重新绑定新卡片的点击
                newCard.querySelector('.qmore').addEventListener('click', function(e) {
                    e.stopPropagation();
                    openQuestionModal(qid);
                });
                newCard.addEventListener('click', function() { openQuestionModal(qid); });
                const ansBtn = newCard.querySelector('.qans-toggle');
                if (ansBtn) {
                    ansBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        toggleCardAnswer(qid);
                    });
                }
                newCard.querySelectorAll('.q-chap-link').forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const ch = this.dataset.chap;
                        if (window.__navigateTo) window.__navigateTo(ch);
                    });
                });
            }
        }
    }

    /* ============= 弹窗内答案切换：只改按钮文字 + 容器 data-reveal ============= */
    function toggleModalAnswer(qid) {
        const wasRevealed = revealedModal.has(qid);
        if (wasRevealed) {
            revealedModal.delete(qid);
        } else {
            revealedModal.add(qid);
        }
        const body = document.getElementById('questionModalBody');
        const optsWrap = body.querySelector('.qm-opts-wrap');
        const detailWrap = body.querySelector('.qm-detail');
        const btn = body.querySelector('.qm-answer-toggle');
        const q = allQuestions.find(function(x) { return x.id === qid; });
        if (!q) return;
        const nowRevealed = !wasRevealed;
        if (optsWrap) optsWrap.setAttribute('data-reveal', nowRevealed ? '1' : '0');
        if (detailWrap) detailWrap.setAttribute('data-reveal', nowRevealed ? '1' : '0');
        if (btn) {
            if (nowRevealed) {
                btn.classList.add('qm-answer-toggle-on');
                btn.innerHTML = '✅ 答案：<strong>' + q.answer + '</strong>（点击隐藏）';
            } else {
                btn.classList.remove('qm-answer-toggle-on');
                btn.innerHTML = '🔒 点击展开答案';
            }
        }
    }

    /* ============= 题目详情弹窗 ============= */
    function openQuestionModal(qid) {
        const q = allQuestions.find(function(x) { return x.id === qid; });
        if (!q) return;
        const body = document.getElementById('questionModalBody');
        const modalRevealed = revealedModal.has(qid);

        let optsHtml = '';
        if (q.options && q.options.length) {
            optsHtml = '<div class="qm-opts">' + q.options.map(function(o) {
                const isAns = o.charAt(0) === q.answer;
                return '<div class="qm-opt ' + (isAns ? 'qm-opt-ans' : '') + '">' + o + '</div>';
            }).join('') + '</div>';
        }

        const chaptersHtml = (q.chapter || []).map(function(ch) {
            return '<button class="q-chap-link" data-chap="' + ch + '">📘 ' + chapterTitle(ch) + '</button>';
        }).join(' ');

        const kpsHtml = (q.knowledgePoints || []).map(function(k) {
            return '<span class="qm-kp">' + k + '</span>';
        }).join('');

        const tpsHtml = (q.testPoints || q.testTips || []).map(function(t) {
            return '<span class="qm-tp">' + t + '</span>';
        }).join('');

        // 掌握程度按钮
        const currentLv = (masteryData[q.id] || {}).level || 'new';
        const masteryBtns = MASTERY_LEVELS.map(function(l) {
            const isActive = currentLv === l.id;
            return '<button type="button" class="mastery-btn ' + (isActive ? 'active' : '') + '" '
                + 'data-mastery="' + l.id + '" data-qid="' + q.id + '" '
                + 'style="--btn-color:' + l.color + '">'
                + '<span class="mastery-icon">' + l.icon + '</span>'
                + '<span class="mastery-label">' + l.label + '</span>'
                + '</button>';
        }).join('');
        const clearBtn = currentLv !== 'new'
            ? '<button type="button" class="mastery-clear-btn" data-mastery-clear="' + q.id + '">🔄 重置掌握度</button>'
            : '';

        body.innerHTML =
            '<div class="qm-meta">'
            + '<span class="qm-year">' + q.year + ' 年 第 ' + q.num + ' 题</span>'
            + '<span class="qm-tag">' + q.type + '</span>'
            + '<span class="qm-tag">' + q.score + ' 分</span>'
            + '<span class="qm-tag" style="background:' + PART_COLOR[q.part] + '">' + q.part + '</span>'
            + '</div>'
            + '<div class="qm-question">' + q.question + '</div>'
            + '<div class="qm-opts-wrap" data-reveal="' + (modalRevealed ? '1' : '0') + '">' + (optsHtml || '') + '</div>'
            + '<div class="qm-answer-toggle-wrap">'
            + (modalRevealed
                ? '<button type="button" class="qm-answer-toggle qm-answer-toggle-on" data-qid="' + q.id + '">✅ 答案：<strong>' + q.answer + '</strong>（点击隐藏）</button>'
                : '<button type="button" class="qm-answer-toggle" data-qid="' + q.id + '">🔒 点击展开答案</button>')
            + '</div>'
            + '<div class="qm-section qm-detail" data-reveal="' + (modalRevealed ? '1' : '0') + '">'
            + '<div class="qm-section-inner">'
            + '<div class="qm-section"><strong>🎯 考察点：</strong><div class="qm-tps">' + tpsHtml + '</div></div>'
            + '<div class="qm-section"><strong>📚 必备知识点：</strong><div class="qm-kps">' + kpsHtml + '</div></div>'
            + '<div class="qm-section"><strong>🧭 解题套路：</strong><div class="qm-solution">' + q.solution + '</div></div>'
            + '<div class="qm-section"><strong>📖 关联章节：</strong><div class="qm-chapters">' + chaptersHtml + '</div></div>'
            + '</div></div>'
            + '<div class="qm-section qm-mastery-section">'
            + '<strong>🎯 掌握程度（再次点击同一档可取消）：</strong>'
            + '<div class="qm-mastery-buttons">' + masteryBtns + '</div>'
            + (clearBtn ? '<div class="qm-mastery-clear">' + clearBtn + '</div>' : '')
            + '</div>'
            + (q.source ? '<div class="qm-source">来源：' + q.source + '</div>' : '');

        document.getElementById('questionModalTitle').textContent = q.year + ' · 第 ' + q.num + ' 题 · 答案 ' + q.answer;
        document.getElementById('questionModal').hidden = false;

        // 弹窗内章节跳转：先关闭弹窗，再跳转
        body.querySelectorAll('.q-chap-link').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const ch = this.dataset.chap;
                closeQuestionModal();
                if (window.__navigateTo) window.__navigateTo(ch);
            });
        });

        // 弹窗内答案展开/收起
        const qmAnsBtn = body.querySelector('.qm-answer-toggle');
        if (qmAnsBtn) {
            qmAnsBtn.addEventListener('click', function() {
                toggleModalAnswer(qid);
            });
        }

        // 弹窗内掌握程度按钮
        body.querySelectorAll('[data-mastery]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const qid = this.dataset.qid;
                const level = this.dataset.mastery;
                setMastery(qid, level);
                refreshAfterMasteryChange(qid);
            });
        });
        const clearBtnEl = body.querySelector('[data-mastery-clear]');
        if (clearBtnEl) {
            clearBtnEl.addEventListener('click', function() {
                const qid = this.dataset.masteryClear;
                delete masteryData[qid];
                saveMastery();
                refreshAfterMasteryChange(qid);
            });
        }
    }

    function refreshAfterMasteryChange(qid) {
        const lv = getMastery(qid);
        // 刷新弹窗内按钮 active 态
        const body = document.getElementById('questionModalBody');
        body.querySelectorAll('[data-mastery]').forEach(function(b) {
            const isActive = b.dataset.mastery === lv.id;
            b.classList.toggle('active', isActive);
        });
        const currentLv = (masteryData[qid] || {}).level || 'new';
        let clearEl = body.querySelector('[data-mastery-clear]');
        if (currentLv !== 'new') {
            if (!clearEl) {
                clearEl = document.createElement('button');
                clearEl.type = 'button';
                clearEl.className = 'mastery-clear-btn';
                clearEl.setAttribute('data-mastery-clear', qid);
                clearEl.textContent = '🔄 重置掌握度';
                clearEl.addEventListener('click', function() {
                    delete masteryData[qid];
                    saveMastery();
                    refreshAfterMasteryChange(qid);
                });
                const section = body.querySelector('.qm-mastery-clear');
                if (section) section.appendChild(clearEl);
                else {
                    const newSec = document.createElement('div');
                    newSec.className = 'qm-mastery-clear';
                    newSec.appendChild(clearEl);
                    body.querySelector('.qm-mastery-section').appendChild(newSec);
                }
            }
        } else if (clearEl) {
            clearEl.remove();
        }
        // 刷新卡片上的徽章
        const card = document.querySelector('#zhentiContentArea .qcard[data-qid="' + qid + '"]');
        if (card) {
            const badgeSlot = card.querySelector('.q-mastery');
            if (badgeSlot) {
                if (lv.id === 'new') {
                    badgeSlot.outerHTML = '<span class="q-mastery q-mastery-new">⚪ 未开始</span>';
                } else {
                    badgeSlot.outerHTML = '<span class="q-mastery" style="background:' + lv.color + '22;color:' + lv.color + ';border-color:' + lv.color + '55">' + lv.icon + ' ' + lv.label + '</span>';
                }
            }
        }
        // 刷新总览卡片（掌握数）
        renderOverview();
        // 刷新进度总览
        renderProgressOverview();
    }

    function closeQuestionModal() {
        document.getElementById('questionModal').hidden = true;
    }

    /* ============= 子 Tab 切换（历年/章节/板块/题型） ============= */
    function bindSubTabs() {
        // 在筛选栏之前动态注入子 Tab（仅在 list tab 显示）
        const filters = document.getElementById('zhentiFilters');
        let subBar = document.getElementById('zhentiSubTabs');
        if (!subBar) {
            subBar = document.createElement('div');
            subBar.id = 'zhentiSubTabs';
            subBar.className = 'zhenti-subtabs';
            subBar.innerHTML =
                '<button class="zhenti-subtab active" data-subtab="all">📅 历年</button>'
                + '<button class="zhenti-subtab" data-subtab="chapter">📚 章节</button>'
                + '<button class="zhenti-subtab" data-subtab="part">🔧 板块</button>'
                + '<button class="zhenti-subtab" data-subtab="type">📝 题型</button>';
            filters.parentNode.insertBefore(subBar, filters);
            subBar.querySelectorAll('.zhenti-subtab').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    subBar.querySelectorAll('.zhenti-subtab').forEach(function(b) {
                        b.classList.toggle('active', b === btn);
                    });
                    state.subTab = this.dataset.subtab;
                    updateChapterFilterRow();
                    renderQuestionList();
                });
            });
        }
    }

    function updateChapterFilterRow() {
        const filters = document.getElementById('zhentiFilters');
        const oldChap = filters.querySelector('.filter-chap-row');
        if (oldChap) oldChap.remove();
        if (state.subTab === 'chapter') {
            const div = document.createElement('div');
            div.className = 'filter-row filter-chap-row';
            div.innerHTML = '<div class="filter-group">'
                + '<label class="filter-label">📖 章节</label>'
                + '<div class="filter-pills" id="filterChapter">'
                + '<button class="filter-pill active" data-chap="all">全部</button>';
            for (let i = 1; i <= 20; i++) {
                const cid = 'ch' + (i < 10 ? '0' + i : '' + i);
                const isActive = state.chapterFilter === cid;
                div.innerHTML += '<button class="filter-pill ' + (isActive ? 'active' : '') + '" data-chap="' + cid + '">' + cid + '</button>';
            }
            div.innerHTML += '</div></div>';
            filters.insertBefore(div, filters.firstChild);
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

    /* ============= 主 Tab 切换：题目列表 / 进度总览 ============= */
    function bindMainTabs() {
        document.querySelectorAll('#zhentiTabs .zhenti-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                setActiveTab(this.dataset.tab);
            });
        });
    }

    function setActiveTab(name) {
        if (name !== 'list' && name !== 'progress') return;
        state.mainTab = name;
        const isProgress = name === 'progress';

        document.querySelectorAll('#zhentiTabs .zhenti-tab').forEach(function(b) {
            b.classList.toggle('active', b.dataset.tab === name);
        });

        // 区域可见性
        const overview = document.getElementById('zhentiOverview');
        const filters = document.getElementById('zhentiFilters');
        const subTabs = document.getElementById('zhentiSubTabs');
        const content = document.getElementById('zhentiContentArea');
        const progress = document.getElementById('zhentiProgressArea');

        if (overview) overview.hidden = isProgress;
        if (filters) filters.hidden = isProgress;
        if (subTabs) subTabs.hidden = isProgress;
        if (content) content.hidden = isProgress;
        if (progress) progress.hidden = !isProgress;

        if (isProgress) {
            renderProgressOverview();
            if (progress) progress.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /* ============= 进度总览：全部年份 × 全部题，按掌握程度上色 ============= */
    function renderProgressOverview() {
        const wrap = document.getElementById('zhentiProgressArea');
        if (!wrap) return;
        const stats = masteryStats();
        const total = stats.total;
        const mastered = (stats.byLevel['mastered'] || 0) + (stats.byLevel['expert'] || 0);
        const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;

        // 顶部图例
        const legend = MASTERY_LEVELS.map(function(l) {
            const cnt = stats.byLevel[l.id] || 0;
            const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
            return '<div class="progress-legend-item" data-level="' + l.id + '">'
                + '<span class="legend-color" style="background:' + l.color + '"></span>'
                + '<span class="legend-label">' + l.icon + ' ' + l.label + '</span>'
                + '<span class="legend-count">' + cnt + ' (' + pct + '%)</span>'
                + '</div>';
        }).join('');

        // 年份降序、年内按 num 升序
        const byYear = getByYear();
        const years = Object.keys(byYear).map(Number).sort(function(a, b) { return b - a; });
        const yearBlocks = years.map(function(y) {
            const arr = byYear[y].slice().sort(function(a, b) { return a.num - b.num; });
            const cells = arr.map(function(q) {
                const lv = getMastery(q.id);
                return '<button type="button" class="progress-cell" data-qid="' + q.id + '" '
                    + 'style="background:' + lv.color + ';color:#fff;" '
                    + 'title="' + q.year + ' · ' + q.num + ' · ' + q.part + ' · ' + (masteryData[q.id] ? lv.label : '未开始') + '">'
                    + q.num
                    + '</button>';
            }).join('');
            const masteredInYear = arr.filter(function(q) {
                const lv = masteryData[q.id] ? masteryData[q.id].level : 'new';
                return lv === 'mastered' || lv === 'expert';
            }).length;
            return '<div class="progress-year-block">'
                + '<div class="progress-year-title">'
                + '<span class="progress-year-name">' + y + ' 年</span>'
                + '<span class="progress-year-meta">' + arr.length + ' 题 · 已掌握 ' + masteredInYear + '</span>'
                + '</div>'
                + '<div class="progress-year-cells">' + cells + '</div>'
                + '</div>';
        }).join('');

        wrap.innerHTML = ''
            + '<div class="progress-summary">'
            +   '<div class="progress-summary-row">'
            +     '<div class="progress-summary-text">已掌握 <strong>' + mastered + '</strong> / ' + total + ' 题 (<strong>' + masteredPct + '%</strong>)</div>'
            +     '<div class="progress-summary-bar"><div class="progress-summary-fill" style="width:' + masteredPct + '%;background:linear-gradient(90deg,#5cb85c,#10b981)"></div></div>'
            +   '</div>'
            +   '<div class="progress-legend">' + legend + '</div>'
            + '</div>'
            + '<div class="progress-grid">' + yearBlocks + '</div>'
            + '<p class="progress-tip">💡 点击格子查看该题详情；弹窗里可直接标记掌握程度（数据保存在本地浏览器）。</p>';

        // 点击格子 → 打开弹窗
        wrap.querySelectorAll('.progress-cell').forEach(function(btn) {
            btn.addEventListener('click', function() {
                openQuestionModal(this.dataset.qid);
            });
        });
    }

    /* ============= 掌握程度筛选 ============= */
    function buildMasteryFilter() {
        const host = document.getElementById('filterMastery');
        if (!host) return;
        let html = '<button class="filter-pill active" data-mastery="all">全部</button>';
        MASTERY_LEVELS.forEach(function(l) {
            html += '<button class="filter-pill" data-mastery="' + l.id + '" style="--btn-color:' + l.color + '">' + l.icon + ' ' + l.label + '</button>';
        });
        host.innerHTML = html;
        host.addEventListener('click', function(e) {
            const btn = e.target.closest('[data-mastery]');
            if (!btn) return;
            host.querySelectorAll('[data-mastery]').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            state.mastery = btn.dataset.mastery;
            renderQuestionList();
        });
    }

    /* ============= 绑定筛选 ============= */
    function bindFilters() {
        // 年份筛选（动态渲染）
        const byYear = getByYear();
        const years = Object.keys(byYear).map(Number).sort(function(a, b) { return b - a; });
        const yearHost = document.getElementById('filterYear');
        yearHost.innerHTML = '<button class="filter-pill active" data-year="all">全部</button>' + years.map(function(y) {
            return '<button class="filter-pill" data-year="' + y + '">' + y + ' (' + byYear[y].length + ')</button>';
        }).join('');
        yearHost.addEventListener('click', function(e) {
            const btn = e.target.closest('[data-year]');
            if (!btn) return;
            yearHost.querySelectorAll('[data-year]').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            state.year = btn.dataset.year;
            renderQuestionList();
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

    /* ============= 弹窗关闭 ============= */
    function bindModal() {
        document.getElementById('questionModalClose').addEventListener('click', closeQuestionModal);
        document.getElementById('questionModal').addEventListener('click', function(e) {
            if (e.target === this) closeQuestionModal();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeQuestionModal();
        });
    }

    /* ============= 初始化 ============= */
    function init() {
        loadMastery();
        renderOverview();
        buildThumbStrip();
        bindMainTabs();
        bindSubTabs();
        bindFilters();
        buildMasteryFilter();
        bindModal();
        // 默认渲染进度总览一次（隐藏区域，提前算好数据）
        renderProgressOverview();
        renderQuestionList();
        // 设置默认 Tab 为「进度总览」（每题一个方块的主视图）
        setActiveTab('progress');
    }

    // 暴露给 app.js 加载 zhenti.html 后调用
    window.initZhentiModule = init;
})();