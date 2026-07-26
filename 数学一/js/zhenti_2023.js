/*
 * 2023 真题闯关 - 模拟考试模式
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'zx23_state';
    const BESTSCORE_KEY = 'zx23_bestscore';

    let state = {
        inExam: false,
        startTime: 0,
        endTime: 0,
        answers: {},         // qid -> user answer
        questions: [],       // 22 题数据
        score: null,
    };

    /* ===== 数据加载 ===== */
    async function loadQuestions() {
        const resp = await fetch('chapters/zhenti/2023.json?v=2');
        const data = await resp.json();
        // 按 qnum 排序并编号
        data.sort((a, b) => a.qnum - b.qnum);
        return data;
    }

    /* ===== DOM 引用 ===== */
    let els = {};
    function initEls() {
        els.launch = document.getElementById('zx23Launch');
        els.exam = document.getElementById('zx23Exam');
        els.result = document.getElementById('zx23Result');
        els.review = document.getElementById('zx23Review');
        els.mistakes = document.getElementById('zx23Mistakes');
        els.startBtn = document.getElementById('zx23StartBtn');
        els.resetBtn = document.getElementById('zx23ResetBtn');
        els.mistakeBtn = document.getElementById('zx23MistakeBtn');
        els.mistakeBtn2 = document.getElementById('zx23MistakeBtn2');
        els.submitBtn = document.getElementById('zx23SubmitBtn');
        els.retryBtn = document.getElementById('zx23RetryBtn');
        els.reviewBtn = document.getElementById('zx23ReviewBtn');
        els.timer = document.getElementById('zx23Timer');
        els.answered = document.getElementById('zx23Answered');
        els.usedTime = document.getElementById('zx23UsedTime');
        els.bestScore = document.getElementById('zx23BestScore');
        els.mistakeCount = document.getElementById('zx23MistakeCount');
        els.scoreBig = document.getElementById('zx23ScoreBig');
        els.scoreDetail = document.getElementById('zx23ScoreDetail');
        els.scoreBar = document.getElementById('zx23ScoreBar');
        els.choiceList = document.getElementById('zx23ChoiceList');
        els.fillList = document.getElementById('zx23FillList');
        els.solveList = document.getElementById('zx23SolveList');
        els.reviewList = document.getElementById('zx23ReviewList');
        els.mistakeList = document.getElementById('zx23MistakeList');
        els.mistakesEmpty = document.getElementById('zx23MistakesEmpty');
    }

    /* ===== 启动 ===== */
    let initialized = false;
    async function start() {
        // 检查 DOM
        let attempts = 0;
        while (!document.getElementById('zx23Launch') && attempts < 30) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }
        if (!document.getElementById('zx23Launch')) {
            console.warn('zx23: launch div 未找到，60s 后重试');
            return;
        }
        if (initialized) return;
        initialized = true;

        initEls();
        try {
            state.questions = await loadQuestions();
            console.log('zx23 加载题目:', state.questions.length);
        } catch (e) {
            console.warn('zx23 加载题目失败:', e);
            return;
        }

        // 显示历史
        const mistakes = loadMistakes();
        if (mistakes.length > 0) {
            els.mistakeBtn.style.display = '';
            els.mistakeCount.textContent = mistakes.length;
        } else {
            els.mistakeBtn.style.display = 'none';
        }

        const best = localStorage.getItem(BESTSCORE_KEY);
        els.bestScore.textContent = best !== null ? `${best} 分` : '—';

        // 默认显示启动页
        els.launch.style.display = '';
        els.exam.style.display = 'none';
        els.result.style.display = 'none';
        els.review.style.display = 'none';
        els.mistakes.style.display = 'none';

        bindEvents();
    }

    /* ===== 事件绑定 ===== */
    function bindEvents() {
        els.startBtn.addEventListener('click', beginExam);
        els.resetBtn.addEventListener('click', clearAll);
        els.mistakeBtn.addEventListener('click', showMistakes);
        els.mistakeBtn2.addEventListener('click', showMistakes);
        els.submitBtn.addEventListener('click', submitExam);
        els.retryBtn.addEventListener('click', () => {
            clearState();
            els.result.style.display = 'none';
            els.launch.style.display = '';
        });
        els.reviewBtn.addEventListener('click', showReview);
    }

    /* ===== 持久化 ===== */
    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }
    function clearState() {
        localStorage.removeItem(STORAGE_KEY);
    }
    function clearAll() {
        if (!confirm('确定要重置所有 2023 进度、错题本和最高分吗？')) return;
        clearState();
        localStorage.removeItem(BESTSCORE_KEY);
        localStorage.removeItem('zx23_mistakes');
        location.reload();
    }

    /* ===== 开始考试 ===== */
    function beginExam() {
        state = {
            inExam: true,
            startTime: Date.now(),
            endTime: 0,
            answers: {},
            questions: state.questions,
            score: null,
        };
        saveState();
        // 确保数据已加载
        if (!state.questions || state.questions.length === 0) {
            loadQuestions().then(qs => {
                state.questions = qs;
                renderExam();
            });
        } else {
            renderExam();
        }
    }

    function continueExam() {
        state.inExam = true;
        state.questions = state.questions || (loadQuestions ? null : null);
        if (!state.questions || !state.questions.length) {
            loadQuestions().then(qs => {
                state.questions = qs;
                renderExam();
            });
        } else {
            renderExam();
        }
    }

    /* ===== 渲染考试界面 ===== */
    function renderExam() {
        els.launch.style.display = 'none';
        els.exam.style.display = '';
        els.result.style.display = 'none';
        els.review.style.display = 'none';

        const choices = state.questions.filter(q => q.type === '选择题');
        const fills = state.questions.filter(q => q.type === '填空题');
        const solves = state.questions.filter(q => q.type === '解答题');

        renderChoiceList(choices, els.choiceList);
        renderFillList(fills, els.fillList);
        renderSolveList(solves, els.solveList);

        bindAnswerEvents();
        startTimer();
        updateAnswered();
    }

    function renderChoiceList(choices, container) {
        container.innerHTML = choices.map(q => `
            <div class="zx23-q" data-qid="${q.id}" data-correct="${escapeAttr(q.answer)}">
                <div class="zx23-q-head">
                    <span class="zx23-q-num">${q.num}</span>
                    <span class="zx23-q-score">${q.score}分</span>
                </div>
                <div class="zx23-q-body">${renderMath(q.question)}</div>
                <div class="zx23-q-options">
                    ${q.options.map((opt, i) => `
                        <label class="zx23-q-opt">
                            <input type="radio" name="${q.id}" value="${escapeAttr(opt)}">
                            <span>${renderMath(opt)}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="zx23-true-answer" style="display:none;"></div>
            </div>
        `).join('');
    }

    function renderFillList(fills, container) {
        container.innerHTML = fills.map(q => `
            <div class="zx23-q" data-qid="${q.id}" data-correct="${escapeAttr(q.answer)}">
                <div class="zx23-q-head">
                    <span class="zx23-q-num">${q.num}</span>
                    <span class="zx23-q-score">${q.score}分</span>
                </div>
                <div class="zx23-q-body">${renderMath(q.question)}</div>
                <input type="text" class="zx23-q-fill-input" name="${q.id}" placeholder="在此填入答案（支持 LaTeX，例如 \\dfrac{1}{2}）">
                <div class="zx23-true-answer" style="display:none;"></div>
            </div>
        `).join('');
    }

    function renderSolveList(solves, container) {
        container.innerHTML = solves.map(q => `
            <div class="zx23-q" data-qid="${q.id}" data-qscore="${q.score}" data-correct="${escapeAttr(q.answer)}">
                <div class="zx23-q-head">
                    <span class="zx23-q-num">${q.num}</span>
                    <span class="zx23-q-score">${q.score}分</span>
                </div>
                <div class="zx23-q-body">${renderMath(q.question)}</div>
                <textarea class="zx23-q-solve-textarea" name="${q.id}" placeholder="请写出你的完整解答（手打或粘贴 LaTeX，例如 \\int_0^1 x^2 dx = 1/3）"></textarea>
                <div class="zx23-true-answer" style="display:none;"></div>
            </div>
        `).join('');
    }

    function bindAnswerEvents() {
        // 选择题
        document.querySelectorAll('#zx23Exam .zx23-q-opt input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const qid = e.target.name;
                state.answers[qid] = e.target.value;
                // 更新可选高亮
                e.target.closest('.zx23-q').querySelectorAll('.zx23-q-opt').forEach(opt => opt.classList.remove('zx23-selected'));
                e.target.closest('.zx23-q-opt').classList.add('zx23-selected');
                saveState();
                updateAnswered();
            });
        });
        // 填空题
        document.querySelectorAll('#zx23Exam .zx23-q-fill-input').forEach(input => {
            input.addEventListener('input', (e) => {
                state.answers[e.target.name] = e.target.value.trim();
                saveState();
                updateAnswered();
            });
        });
        // 解答题
        document.querySelectorAll('#zx23Exam .zx23-q-solve-textarea').forEach(area => {
            area.addEventListener('input', (e) => {
                state.answers[e.target.name] = e.target.value;
                saveState();
                updateAnswered();
            });
        });
    }

    /* ===== 计时器 ===== */
    let timerInterval = null;
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            const ms = Date.now() - state.startTime;
            const h = Math.floor(ms / 3600000);
            const m = Math.floor((ms % 3600000) / 60000);
            const s = Math.floor((ms % 60000) / 1000);
            els.timer.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
        }, 1000);
    }
    function pad(n) { return n < 10 ? '0' + n : n; }

    function updateAnswered() {
        if (!els.answered) return;
        const answered = Object.keys(state.answers).filter(k => {
            const v = state.answers[k];
            if (typeof v === 'string') return v.trim().length > 0;
            return v !== undefined && v !== null;
        }).length;
        els.answered.textContent = answered;
    }

    /* ===== 提交批改 ===== */
    function submitExam() {
        if (!confirm('确定提交吗？提交后将进入批改。')) return;
        if (timerInterval) clearInterval(timerInterval);

        state.inExam = false;
        state.endTime = Date.now();

        // 客观题自动批改：选择题 + 填空题
        let score = 0;
        const mistakes = [];
        const detail = { choice: 0, fill: 0, solve: 0 };

        state.questions.forEach(q => {
            const userAns = state.answers[q.id];
            const correctAns = q.answer;

            if (q.type === '选择题') {
                detail.choice += q.score;
                if (isAnswerMatch(userAns, correctAns, q)) {
                    score += q.score;
                } else {
                    mistakes.push({ qid: q.id, userAns, correctAns });
                }
            } else if (q.type === '填空题') {
                detail.fill += q.score;
                if (isAnswerMatch(userAns, correctAns, q)) {
                    score += q.score;
                } else {
                    mistakes.push({ qid: q.id, userAns, correctAns });
                }
            } else {
                // 解答题：默认给 0 分（需人工评分）
                detail.solve += q.score;
                // 解答题没答案也算"错误"
                if (!userAns || userAns.trim().length === 0) {
                    mistakes.push({ qid: q.id, userAns: '', correctAns });
                }
            }
        });

        state.score = score;

        // 写入错题本
        saveMistakes(state.questions, mistakes);

        // 保存最高分
        const prevBest = parseInt(localStorage.getItem(BESTSCORE_KEY) || '0', 10);
        const objective = score; // 客观题得分
        const finalScore = objective; // 这次先只算客观题，解答题手动评分后再更新
        if (finalScore > prevBest) {
            localStorage.setItem(BESTSCORE_KEY, finalScore);
            els.bestScore.textContent = `${finalScore} 分`;
        }

        // 显示结果
        showResult(score, detail, mistakes, finalScore);
    }

    function isAnswerMatch(user, correct, q) {
        if (!user) return false;
        const u = String(user).trim();
        const c = String(correct || '').trim();
        if (!u) return false;
        // 完全相等
        if (u === c) return true;
        // 提取字母 (A/B/C/D)
        const uLetter = u.match(/^[A-Da-d]/);
        const cLetter = c.match(/^[A-Da-d]/);
        if (uLetter && cLetter && uLetter[0].toUpperCase() === cLetter[0].toUpperCase()) return true;
        // 在长文本里搜索字母
        const uL = u.match(/[A-Da-d]/g);
        const cL = c.match(/[A-Da-d]/g);
        if (uL && cL && uL[0].toUpperCase() === cL[0].toUpperCase()) return true;
        // 表达式相似（填空题答案：去 LaTeX 后比较子串）
        if (q && q.type !== '选择题') {
            const un = normalize(u);
            const cn = normalize(c);
            if (un === cn) return true;
            // 数字题答案有 ±1 误差视为正确
            if (un && cn) {
                try {
                    const unum = eval(un.replace(/[^0-9eE.\-+*/]/g, ''));
                    const cnum = eval(cn.replace(/[^0-9eE.\-+*/]/g, ''));
                    if (Math.abs(unum - cnum) < 1e-2) return true;
                } catch (e) { /* ignore */ }
            }
        }
        return false;
    }

    function normalize(s) {
        if (!s) return '';
        return s.toString()
            .replace(/\$+/g, '')
            .replace(/\\\(|\\\[|\\\]|\\\)/g, '')
            .replace(/\s+/g, '')
            .replace(/\\dfrac|\\frac/g, '/')
            .replace(/\\pi/gi, 'π')
            .replace(/\\sqrt/gi, '√')
            .replace(/\\[a-zA-Z]+/g, '')
            .replace(/[（(](\d)/g, '$1')
            .replace(/[）)]/g, '')
            .replace(/[，。；]/g, ',')
            .replace(/^([A-Da-d])[\.．]/, '$1')
            .toLowerCase()
            .trim();
    }

    function showResult(score, detail, mistakes, objective) {
        els.exam.style.display = 'none';
        els.result.style.display = '';

        els.scoreBig.textContent = `${objective} / 150`;

        const elapsed = Math.floor((state.endTime - state.startTime) / 60000);
        els.scoreDetail.innerHTML = `
            已答客观题得分（选择 + 填空）：<strong style="color:#10b981;">${score} 分</strong><br>
            解答题（共 70 分）：需对照解析人工评分<br>
            用时：${elapsed} 分钟｜错题数：<strong style="color:#ef4444;">${mistakes.length}</strong><br>
            <small style="color:#94a3b8;">💡 客观题自动评分，解答题对照解析后告诉我你的得分，我帮你算出总分</small>
        `;

        const percent = (objective / 150 * 100).toFixed(0);
        els.scoreBar.style.width = percent + '%';

        // 在 result 区域渲染每题简评（不重复渲染完整题目）
        let summaryHtml = '<div class="zx23-result-list">';
        state.questions.forEach((q, idx) => {
            const userAns = state.answers[q.id];
            const isCorrect = (q.type !== '解答题') && isAnswerMatch(userAns, q.answer, q);
            let mark, cls;
            if (q.type === '解答题') {
                mark = '需人工评分';
                cls = userAns && userAns.trim().length > 0 ? 'solved' : 'unsolved';
            } else if (isCorrect) {
                mark = '✓ 正确';
                cls = 'correct';
            } else {
                mark = '✗ 错误';
                cls = 'wrong';
            }
            summaryHtml += `
                <div class="zx23-result-item zx23-${cls}">
                    <span class="zx23-result-num">${q.num}</span>
                    <span class="zx23-result-q">${q.question.substring(0, 60)}${q.question.length > 60 ? '...' : ''}</span>
                    <span class="zx23-result-mark">${mark}</span>
                </div>
            `;
        });
        summaryHtml += '</div>';
        // 渲染到 result 中（按钮之上）
        let existing = els.result.querySelector('.zx23-result-list');
        if (existing) existing.remove();
        els.result.insertAdjacentHTML('beforeend', summaryHtml);
    }

    /* ===== 解析展示 ===== */
    function showReview() {
        els.result.style.display = 'none';
        els.review.style.display = '';

        // 在 review 区域也添加错题本入口
        let existing = els.review.querySelector('.zx23-review-actions');
        if (!existing) {
            const actions = document.createElement('div');
            actions.className = 'zx23-actions zx23-review-actions';
            actions.innerHTML = `<button class="zx23-btn" id="zx23ReviewMistakeBtn">📕 查看错题本</button><button class="zx23-btn" id="zx23ReviewBackBtn">↩️ 返回成绩</button>`;
            els.review.insertBefore(actions, els.reviewList);
            document.getElementById('zx23ReviewMistakeBtn').addEventListener('click', showMistakes);
            document.getElementById('zx23ReviewBackBtn').addEventListener('click', () => {
                els.review.style.display = 'none';
                els.result.style.display = '';
            });
        }

        els.reviewList.innerHTML = state.questions.map(q => {
            const userAns = state.answers[q.id];
            const isCorrect = (q.type !== '解答题') && isAnswerMatch(userAns, q.answer);
            let mark = '';
            if (q.type === '解答题') {
                mark = '<span class="zx23-result-mark zx23-mark-wrong">解答题</span>';
            } else if (isCorrect) {
                mark = '<span class="zx23-result-mark zx23-mark-correct">✓ 答对</span>';
            } else {
                mark = '<span class="zx23-result-mark zx23-mark-wrong">✗ 答错</span>';
            }
            const solution = q.solution && q.solution.length > 0
                ? q.solution.map(s => `<li><strong>第${s.step}步 ${s.title}：</strong>${renderMath(s.content)}</li>`).join('')
                : '<li>暂无详细步骤，请参考真题解析</li>';
            const errors = q.commonErrors && q.commonErrors.length > 0
                ? `<p>⚠️ <strong>易错点：</strong>${q.commonErrors.map(e => escapeHtml(e)).join('；')}</p>`
                : '';
            return `
                <div class="zx23-q ${isCorrect ? 'zx23-correct' : 'zx23-wrong'}">
                    <div class="zx23-q-head">
                        <span class="zx23-q-num">${q.num}</span>
                        <span class="zx23-q-score">${q.score}分</span>
                        ${mark}
                    </div>
                    <div class="zx23-q-body">${renderMath(q.question)}</div>
                    ${q.options && q.options.length ? `<div class="zx23-q-options">${q.options.map(o => `<label class="zx23-q-opt">${renderMath(o)}</label>`).join('')}</div>` : ''}
                    <p>📌 <strong>你的答案：</strong>${userAns ? renderMath(userAns) : '<em>未作答</em>'}</p>
                    <p>✅ <strong>正确答案：</strong>${renderMath(q.answer || '见解析')}</p>
                    <details><summary>📋 解题骨架</summary><ol>${solution}</ol></details>
                    ${errors ? `<p style="color:#dc2626;">${errors}</p>` : ''}
                </div>
            `;
        }).join('');
    }

    /* ===== 错题本 ===== */
    function showMistakes() {
        els.launch.style.display = 'none';
        els.exam.style.display = 'none';
        els.result.style.display = 'none';
        els.review.style.display = 'none';
        els.mistakes.style.display = '';

        const mistakes = loadMistakes();
        if (!mistakes.length) {
            els.mistakesEmpty.style.display = '';
            els.mistakeList.innerHTML = '';
            return;
        }
        els.mistakesEmpty.style.display = 'none';

        const qmap = {};
        state.questions.forEach(q => qmap[q.id] = q);
        els.mistakeList.innerHTML = mistakes.map(m => {
            const q = qmap[m.qid];
            if (!q) return '';
            return `
                <div class="zx23-q zx23-wrong">
                    <div class="zx23-q-head">
                        <span class="zx23-q-num">${q.num}</span>
                        <span class="zx23-q-score">${q.score}分</span>
                        <span class="zx23-result-mark zx23-mark-wrong">错题</span>
                    </div>
                    <div class="zx23-q-body">${renderMath(q.question)}</div>
                    <p>📌 <strong>你的答案：</strong>${m.userAns ? renderMath(m.userAns) : '<em>未作答</em>'}</p>
                    <p>✅ <strong>正确答案：</strong>${renderMath(q.answer || '见解析')}</p>
                    ${q.solution && q.solution.length ? `<details><summary>📋 解题骨架</summary><ol>${q.solution.map(s => `<li><strong>${s.title}：</strong>${renderMath(s.content)}</li>`).join('')}</ol></details>` : ''}
                </div>
            `;
        }).join('');
    }

    /* ===== 错题本存储 ===== */
    function saveMistakes(questions, newMistakes) {
        const existing = loadMistakes();
        const existingMap = {};
        existing.forEach(m => existingMap[m.qid] = true);
        // 只追加新的错题（去重）
        newMistakes.forEach(m => {
            if (!existingMap[m.qid]) {
                existing.push(m);
            }
        });
        // 限制上限（每题 1 次，去重后）
        const deduped = [];
        const seen = new Set();
        for (let i = existing.length - 1; i >= 0; i--) {
            if (!seen.has(existing[i].qid)) {
                seen.add(existing[i].qid);
                deduped.unshift(existing[i]);
            }
        }
        localStorage.setItem('zx23_mistakes', JSON.stringify(deduped));
    }
    function loadMistakes() {
        try {
            const raw = localStorage.getItem('zx23_mistakes');
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    /* ===== 工具 ===== */
    function escapeHtml(s) {
        if (s == null) return '';
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function escapeAttr(s) {
        if (s == null) return '';
        return String(s).replace(/"/g, '&quot;').replace(/\n/g, ' ');
    }
    function renderMath(html) {
        if (!html) return '';
        if (typeof window.renderMathInElement !== 'undefined') {
            try {
                const div = document.createElement('div');
                div.innerHTML = html;
                window.renderMathInElement(div, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true },
                    ],
                    throwOnError: false,
                });
                return div.innerHTML;
            } catch (e) { return html; }
        }
        return html;
    }

    /* ===== 启动 ===== */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    // 暴露调试接口
    window.__zx23 = { state, loadState, saveState, clearState };
})()
