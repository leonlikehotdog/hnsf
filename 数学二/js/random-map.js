(function () {
  const STORAGE_KEY = 'hnsf.math2.randomMap';
  const tileKinds = [
    { key: 'quiz', label: '题', color: '#38bdf8' },
    { key: 'treasure', label: '宝', color: '#fbbf24' },
    { key: 'trap', label: '险', color: '#f87171' },
    { key: 'shop', label: '店', color: '#a78bfa' },
    { key: 'boss', label: 'Boss', color: '#f97316' }
  ];

  function safeJsonParse(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }

  function getState() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEY), {
      best: 0,
      total: 0,
      history: [],
      current: null
    });
  }

  function saveState(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function buildQuestion() {
    const kind = randomInt(0, 3);
    if (kind === 0) {
      const a = randomInt(2, 18);
      const b = randomInt(2, 18);
      const answer = a + b;
      return {
        label: '加法挑战',
        text: `${a} + ${b} = ?`,
        choices: shuffle([answer, answer + 1, answer - 2, answer + 3])
      };
    }
    if (kind === 1) {
      const a = randomInt(3, 25);
      const b = randomInt(2, 12);
      const answer = a * b;
      return {
        label: '乘法挑战',
        text: `${a} × ${b} = ?`,
        choices: shuffle([answer, answer + 4, answer - 3, answer + 9])
      };
    }
    if (kind === 2) {
      const a = randomInt(6, 40);
      const b = randomInt(2, 8);
      const answer = Math.floor(a / b);
      return {
        label: '除法挑战',
        text: `${a} ÷ ${b} = ?`,
        choices: shuffle([answer, answer + 2, answer - 1, answer + 5])
      };
    }
    const a = randomInt(4, 40);
    const b = randomInt(2, 12);
    const answer = a - b;
    return {
      label: '减法挑战',
      text: `${a} - ${b} = ?`,
      choices: shuffle([answer, answer + 2, answer - 3, answer + 6])
    };
  }

  function formatMapName() {
    const names = ['晨风迷路', '星河试炼', '云顶渡口', '数理森林', '魔法试卷', '极限荒地'];
    return pick(names);
  }

  function generateRoute() {
    const cells = [];
    for (let i = 0; i < 8; i++) {
      const kind = pick(tileKinds);
      const item = {
        id: i + 1,
        kind: kind.key,
        label: kind.label,
        color: kind.color,
        name: i === 0 ? '起点' : i === 7 ? '终点' : `区块 ${i}`,
        reward: randomInt(5, 30),
        danger: i === 7 ? 2 : randomInt(0, 2)
      };
      cells.push(item);
    }
    const route = {
      id: Date.now(),
      mapName: formatMapName(),
      score: 0,
      hp: 3,
      cells,
      index: 0,
      started: false,
      finished: false,
      rewardTotal: 0
    };
    return route;
  }

  function ensureUi() {
    if (document.getElementById('btnRandomMap')) return;
    const root = document.querySelector('.hud-right');
    if (!root) return;
    const button = document.createElement('button');
    button.id = 'btnRandomMap';
    button.type = 'button';
    button.className = 'btn btn-ghost';
    button.title = '随机地图挑战：走格子、答题、拿奖励';
    button.innerHTML = '🗺️<span class="lbl-long"> 随机地图</span><span class="lbl-short"> 地图</span>';
    const panelBtn = document.getElementById('btnPanel');
    if (panelBtn) {
      root.insertBefore(button, panelBtn.nextSibling);
    } else {
      root.appendChild(button);
    }
  }

  function ensureMask() {
    if (document.getElementById('randomMapMask')) return;
    const mask = document.createElement('div');
    mask.id = 'randomMapMask';
    mask.setAttribute('aria-hidden', 'true');
    mask.style.position = 'fixed';
    mask.style.inset = '0';
    mask.style.background = 'rgba(15, 23, 42, 0.72)';
    mask.style.display = 'none';
    mask.style.alignItems = 'center';
    mask.style.justifyContent = 'center';
    mask.style.zIndex = '60';
    mask.innerHTML = `
      <div style="width:min(920px,92vw);background:linear-gradient(180deg,#101328,#1b2340 55%,#111827);border:1px solid rgba(148,163,184,.5);border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.45);padding:20px;color:#e5eefc;position:relative;">
        <button id="randomMapClose" type="button" style="position:absolute;right:18px;top:14px;border:none;background:rgba(148,163,184,.14);color:#e5eefc;border-radius:10px;cursor:pointer;padding:8px 12px;">✕</button>
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-end;margin-bottom:12px;">
          <div>
            <div style="font-size:12px;letter-spacing:2px;color:#7dd3fc;text-transform:uppercase;">challenge mode</div>
            <h2 style="margin:6px 0 0;font-size:28px;">随机地图挑战</h2>
          </div>
          <button id="randomMapGenerateBtn" type="button" style="border:none;border-radius:10px;background:linear-gradient(135deg,#38bdf8,#8b5cf6);padding:10px 18px;color:#fff;font-weight:700;cursor:pointer;">生成地图</button>
        </div>
        <div id="randomMapSummary" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;"></div>
        <div id="randomMapLayout" style="display:grid;grid-template-columns:repeat(8,minmax(52px,1fr));gap:12px;margin-bottom:18px;"></div>
        <div id="randomMapQuestion" style="display:none;background:rgba(15,23,42,.6);padding:18px;border-radius:14px;border:1px solid rgba(148,163,184,.2);"></div>
        <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
          <button id="randomMapStartBtn" type="button" style="padding:10px 16px;border-radius:10px;background:#1f2937;border:1px solid rgba(148,163,184,.4);color:#e5eefc;cursor:pointer;">开始挑战</button>
          <button id="randomMapNextBtn" type="button" style="padding:10px 16px;border-radius:10px;background:linear-gradient(135deg,#fbbf24,#f97316);border:none;color:#1f2937;font-weight:700;cursor:pointer;display:none;">下一步</button>
        </div>
      </div>
    `;
    document.body.appendChild(mask);

    const close = document.getElementById('randomMapClose');
    const generateBtn = document.getElementById('randomMapGenerateBtn');
    const startBtn = document.getElementById('randomMapStartBtn');
    const nextBtn = document.getElementById('randomMapNextBtn');

    close.addEventListener('click', () => { mask.style.display = 'none'; });
    generateBtn.addEventListener('click', () => {
      const state = getState();
      state.current = generateRoute();
      saveState(state);
      renderRandomMap();
    });
    startBtn.addEventListener('click', () => {
      const state = getState();
      if (!state.current) state.current = generateRoute();
      state.current.started = true;
      state.current.finished = false;
      state.current.index = 0;
      saveState(state);
      renderQuestion();
    });
    nextBtn.addEventListener('click', () => {
      const state = getState();
      if (!state.current) return;
      if (state.current.index >= state.current.cells.length - 1) {
        finishCurrentMap();
        return;
      }
      state.current.index += 1;
      state.current.score += 10;
      state.current.rewardTotal += state.current.cells[state.current.index - 1]?.reward || 0;
      saveState(state);
      renderQuestion();
    });
  }

  function openMask() {
    ensureMask();
    const mask = document.getElementById('randomMapMask');
    if (mask) mask.style.display = 'flex';
    renderRandomMap();
  }

  function renderSummary(state) {
    const summary = document.getElementById('randomMapSummary');
    if (!summary) return;
    const total = state.total || 0;
    const best = state.best || 0;
    summary.innerHTML = `
      <span style="padding:6px 10px;border-radius:999px;background:rgba(56,189,248,.15);color:#7dd3fc;border:1px solid rgba(125,211,252,.3);">总挑战 ${total}</span>
      <span style="padding:6px 10px;border-radius:999px;background:rgba(251,191,36,.15);color:#fbbf24;border:1px solid rgba(251,191,36,.3);">最高分 ${best}</span>
      <span style="padding:6px 10px;border-radius:999px;background:rgba(52,211,153,.15);color:#6ee7b7;border:1px solid rgba(52,211,153,.3);">奖励池 ${state.current ? state.current.rewardTotal || 0 : 0}</span>
    `;
  }

  function renderRandomMap() {
    ensureMask();
    const state = getState();
    const layout = document.getElementById('randomMapLayout');
    const questionBox = document.getElementById('randomMapQuestion');
    const startBtn = document.getElementById('randomMapStartBtn');
    const nextBtn = document.getElementById('randomMapNextBtn');
    renderSummary(state);

    if (!state.current) {
      state.current = generateRoute();
      saveState(state);
    }

    const route = state.current;
    layout.innerHTML = route.cells.map(function (cell) {
      const active = cell.id === route.index + 1;
      const done = cell.id <= route.index + 1 && route.started;
      return `
        <div style="background:${cell.color};padding:10px 8px;border-radius:12px;color:#0f172a;text-align:center;border:${active ? '3px solid #fff' : '2px solid rgba(255,255,255,.4)'};opacity:${done ? '0.95' : '0.85'};min-height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="font-size:11px;font-weight:700;">${cell.name}</div>
          <div style="font-size:18px;font-weight:800;">${cell.label}</div>
          <div style="font-size:10px;opacity:.8;">+${cell.reward}</div>
        </div>
      `;
    }).join('');

    if (!route.started || route.finished) {
      questionBox.style.display = 'none';
      startBtn.style.display = 'inline-block';
      nextBtn.style.display = 'none';
    } else {
      questionBox.style.display = 'block';
      startBtn.style.display = 'none';
      nextBtn.style.display = 'inline-block';
    }
  }

  function renderQuestion() {
    const state = getState();
    const route = state.current;
    const questionBox = document.getElementById('randomMapQuestion');
    const nextBtn = document.getElementById('randomMapNextBtn');
    if (!route || !route.started || route.finished) {
      questionBox.style.display = 'none';
      nextBtn.style.display = 'none';
      return;
    }
    const currentCell = route.cells[route.index] || route.cells[route.cells.length - 1];
    const currentQuestion = buildQuestion();
    route.currentQuestion = currentQuestion;
    saveState(state);
    questionBox.innerHTML = `
      <div style="font-size:12px;letter-spacing:2px;color:#c4b5fd;margin-bottom:10px;">${route.mapName} · ${currentCell.name}</div>
      <div style="font-size:22px;font-weight:700;margin-bottom:16px;">${currentQuestion.label}</div>
      <div style="font-size:28px;font-weight:800;margin-bottom:18px;">${currentQuestion.text}</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(160px,1fr));gap:12px;">
        ${currentQuestion.choices.map(function (choice, index) {
          return `<button type="button" data-choice="${choice}" data-index="${index}" class="random-choice-btn" style="padding:12px 10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.8);color:#e5eefc;cursor:pointer;font-size:18px;">${choice}</button>`;
        }).join('')}
      </div>
    `;
    questionBox.style.display = 'block';
    nextBtn.style.display = 'inline-block';
    questionBox.querySelectorAll('.random-choice-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        const selected = Number(button.getAttribute('data-choice'));
        const expected = currentQuestion.choices.includes(currentQuestion.choices[0]) ? currentQuestion.choices[0] : 0;
        const answer = currentQuestion.text.includes('×') ? (function () {
          const match = currentQuestion.text.match(/(\d+) × (\d+)/);
          return match ? Number(match[1]) * Number(match[2]) : 0;
        })() : currentQuestion.text.includes('÷') ? (function () {
            const match = currentQuestion.text.match(/(\d+) ÷ (\d+)/);
            return match ? Math.floor(Number(match[1]) / Number(match[2])) : 0;
          })() : currentQuestion.text.includes('+') ? (function () {
            const match = currentQuestion.text.match(/(\d+) \+ (\d+)/);
            return match ? Number(match[1]) + Number(match[2]) : 0;
          })() : (function () {
            const match = currentQuestion.text.match(/(\d+) - (\d+)/);
            return match ? Number(match[1]) - Number(match[2]) : 0;
          })();

        const isCorrect = Number(selected) === Number(answer);
        const state = getState();
        const route = state.current;
        if (isCorrect) {
          route.score += 20;
          route.rewardTotal += currentCell.reward;
          route.index = Math.min(route.index + 1, route.cells.length - 1);
          if (route.index >= route.cells.length - 1) {
            finishCurrentMap();
            return;
          }
          route.started = true;
          route.finished = false;
          state.total = (state.total || 0) + 1;
          state.best = Math.max(state.best || 0, route.score);
          saveState(state);
          renderRandomMap();
          renderQuestion();
        } else {
          route.hp = Math.max(0, route.hp - 1);
          if (route.hp <= 0) {
            route.finished = true;
            state.total = (state.total || 0) + 1;
            saveState(state);
            renderRandomMap();
            questionBox.innerHTML = '<div style="font-size:22px; font-weight:700; color:#fca5a5;">挑战失败，随机地图已重置。</div>';
            nextBtn.style.display = 'none';
          } else {
            button.style.borderColor = '#f87171';
            button.style.boxShadow = '0 0 0 1px rgba(248,113,113,.8)';
            setTimeout(function () {
              button.style.borderColor = 'rgba(148,163,184,.35)';
              button.style.boxShadow = 'none';
            }, 600);
          }
        }
      });
    });
  }

  function finishCurrentMap() {
    const state = getState();
    const route = state.current;
    if (!route) return;
    route.finished = true;
    route.started = false;
    state.total = (state.total || 0) + 1;
    state.best = Math.max(state.best || 0, route.score);
    state.history.unshift({
      time: new Date().toLocaleString(),
      name: route.mapName,
      score: route.score,
      reward: route.rewardTotal
    });
    state.history = state.history.slice(0, 5);
    saveState(state);
    const questionBox = document.getElementById('randomMapQuestion');
    if (questionBox) {
      questionBox.innerHTML = `
        <div style="font-size:22px; font-weight:700; color:#86efac;">地图通关！</div>
        <div style="margin-top:10px; font-size:18px;">${route.mapName} · +${route.rewardTotal} 奖励 · 分数 ${route.score}</div>
      `;
      questionBox.style.display = 'block';
    }
    const nextBtn = document.getElementById('randomMapNextBtn');
    if (nextBtn) nextBtn.style.display = 'none';
    const startBtn = document.getElementById('randomMapStartBtn');
    if (startBtn) startBtn.style.display = 'inline-block';
    renderRandomMap();
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureUi();
    const button = document.getElementById('btnRandomMap');
    if (button) {
      button.addEventListener('click', function () {
        openMask();
      });
    }
  });
})();
