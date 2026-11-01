(function () {
  'use strict';

  var STORAGE_KEY = 'hnsf.math2.randomMap.v3';
  var GRID_COLS = 5;
  var GRID_ROWS = 4;

  var tileKinds = [
    { key: 'quest', label: '题', color: '#38bdf8', icon: '❔', glow: '#7dd3fc' },
    { key: 'treasure', label: '宝', color: '#fbbf24', icon: '💎', glow: '#fcd34d' },
    { key: 'trap', label: '险', color: '#f87171', icon: '⚠️', glow: '#fca5a5' },
    { key: 'shop', label: '店', color: '#a78bfa', icon: '🛒', glow: '#c4b5fd' },
    { key: 'boss', label: 'Boss', color: '#fb923c', icon: '👹', glow: '#fdba74' }
  ];

  function safeParse(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }

  function getState() {
    return safeParse(localStorage.getItem(STORAGE_KEY), {
      best: 0,
      total: 0,
      history: [],
      current: null
    });
  }

  function saveState(next) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function buildQuestion() {
    var mode = randomInt(0, 3);
    if (mode === 0) {
      var a = randomInt(2, 18);
      var b = randomInt(2, 18);
      var answer = a + b;
      return {
        label: '加法挑战',
        text: a + ' + ' + b + ' = ?',
        choices: shuffle([answer, answer + 1, answer - 2, answer + 3])
      };
    }
    if (mode === 1) {
      var x = randomInt(3, 25);
      var y = randomInt(2, 12);
      var answer = x * y;
      return {
        label: '乘法挑战',
        text: x + ' × ' + y + ' = ?',
        choices: shuffle([answer, answer + 4, answer - 3, answer + 9])
      };
    }
    if (mode === 2) {
      var c = randomInt(6, 40);
      var d = randomInt(2, 8);
      var answer = Math.floor(c / d);
      return {
        label: '除法挑战',
        text: c + ' ÷ ' + d + ' = ?',
        choices: shuffle([answer, answer + 2, answer - 1, answer + 5])
      };
    }
    var m = randomInt(4, 40);
    var n = randomInt(2, 12);
    var answer = m - n;
    return {
      label: '减法挑战',
      text: m + ' - ' + n + ' = ?',
      choices: shuffle([answer, answer + 2, answer - 3, answer + 6])
    };
  }

  function calcAnswerByText(text) {
    var matches = text.match(/(\d+) \+ (\d+)/);
    if (matches) return Number(matches[1]) + Number(matches[2]);
    matches = text.match(/(\d+) - (\d+)/);
    if (matches) return Number(matches[1]) - Number(matches[2]);
    matches = text.match(/(\d+) × (\d+)/);
    if (matches) return Number(matches[1]) * Number(matches[2]);
    matches = text.match(/(\d+) ÷ (\d+)/);
    if (matches) return Math.floor(Number(matches[1]) / Number(matches[2]));
    return 0;
  }

  function formatMapName() {
    var list = ['晨风迷路', '云顶渡口', '数理森林', '星河试炼', '极限荒地', '记忆村'];
    return pick(list);
  }

  function generateCells() {
    var cells = [];
    for (var i = 0; i < GRID_COLS * GRID_ROWS; i++) {
      var row = Math.floor(i / GRID_COLS);
      var col = i % GRID_COLS;
      var kind = pick(tileKinds);
      cells.push({
        id: i,
        x: col,
        y: row,
        kind: kind.key,
        label: kind.label,
        icon: kind.icon,
        color: kind.color,
        glow: kind.glow,
        reward: randomInt(8, 32),
        danger: i === GRID_COLS * GRID_ROWS - 1 ? 2 : randomInt(0, 2)
      });
    }
    // 强制起点与终点位置
    cells[0].kind = 'quest';
    cells[0].label = '起';
    cells[0].icon = '🚩';
    cells[0].color = '#34d399';
    cells[cells.length - 1].kind = 'boss';
    cells[cells.length - 1].label = '终';
    cells[cells.length - 1].icon = '🏁';
    cells[cells.length - 1].color = '#fb923c';
    return cells;
  }

  function generateRoute() {
    return {
      id: Date.now(),
      mapName: formatMapName(),
      cells: generateCells(),
      index: 0,
      hp: 3,
      score: 0,
      rewardTotal: 0,
      started: false,
      finished: false,
      currentQuestion: null,
      note: '前往终点，答对题获得奖励，答错会失去生命值。'
    };
  }

  function ensureUi() {
    if (document.getElementById('btnRandomMap')) return;
    var root = document.querySelector('.hud-right');
    if (!root) return;
    var button = document.createElement('button');
    button.id = 'btnRandomMap';
    button.type = 'button';
    button.className = 'btn btn-ghost';
    button.title = '随机地图挑战：像素冒险地图';
    button.innerHTML = '🗺️<span class="lbl-long"> 随机地图</span><span class="lbl-short"> 地图</span>';
    var panelBtn = document.getElementById('btnPanel');
    if (panelBtn) {
      root.insertBefore(button, panelBtn.nextSibling);
    } else {
      root.appendChild(button);
    }
  }

  function ensureMask() {
    if (document.getElementById('randomMapMask')) return;
    var mask = document.createElement('div');
    mask.id = 'randomMapMask';
    mask.setAttribute('aria-hidden', 'true');
    mask.style.position = 'fixed';
    mask.style.inset = '0';
    mask.style.zIndex = '60';
    mask.style.display = 'none';
    mask.style.background = 'rgba(15, 23, 42, 0.8)';
    mask.style.alignItems = 'center';
    mask.style.justifyContent = 'center';
    mask.innerHTML = [
      '<div style="position:relative;width:min(980px,94vw);background:linear-gradient(180deg,#0f172a,#1e293b 52%,#111827);border:1px solid rgba(148,163,184,0.35);border-radius:24px;box-shadow:0 32px 90px rgba(0,0,0,0.5);padding:22px;color:#e5eefc;">',
      '  <button id="randomMapClose" type="button" style="position:absolute;right:18px;top:16px;border:none;background:rgba(148,163,184,0.12);border-radius:10px;color:#e5eefc;padding:8px 12px;cursor:pointer;">✕</button>',
      '  <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:16px;">',
      '    <div>',
      '      <div style="font-size:11px;letter-spacing:2px;color:#7dd3fc;text-transform:uppercase;">pixel adventure</div>',
      '      <h2 style="margin:6px 0 0;font-size:30px;">随机地图挑战</h2>',
      '    </div>',
      '    <div style="display:flex;gap:8px;flex-wrap:wrap;">',
      '      <button id="randomMapGenerateBtn" type="button" style="border:none;border-radius:12px;background:linear-gradient(135deg,#38bdf8,#8b5cf6);padding:10px 16px;color:#fff;font-weight:800;cursor:pointer;">新地图</button>',
      '      <button id="randomMapStartBtn" type="button" style="border:none;border-radius:12px;background:#1f2937;border:1px solid rgba(148,163,184,0.35);padding:10px 16px;color:#e5eefc;font-weight:700;cursor:pointer;">开始冒险</button>',
      '    </div>',
      '  </div>',
      '  <div id="randomMapLegend" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;"></div>',
      '  <div id="randomMapMeta" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;"></div>',
      '  <div id="randomMapBoard" style="display:grid;grid-template-columns:repeat(5,minmax(84px,1fr));gap:12px;padding:12px;border-radius:18px;background:rgba(15,23,42,0.6);border:1px solid rgba(148,163,184,0.2);min-height:280px;"></div>',
      '  <div id="randomMapQuestion" style="display:none;margin-top:18px;padding:18px;border-radius:16px;background:rgba(15,23,42,0.7);border:1px solid rgba(148,163,184,0.25);"></div>',
      '  <div style="display:flex;justify-content:flex-end;margin-top:16px;">',
      '    <button id="randomMapNextBtn" type="button" style="display:none;border:none;border-radius:12px;background:linear-gradient(135deg,#fbbf24,#f97316);padding:10px 16px;color:#1f2937;font-weight:800;cursor:pointer;">下一步</button>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(mask);

    var close = document.getElementById('randomMapClose');
    var generateBtn = document.getElementById('randomMapGenerateBtn');
    var startBtn = document.getElementById('randomMapStartBtn');
    var nextBtn = document.getElementById('randomMapNextBtn');

    close.addEventListener('click', function () { mask.style.display = 'none'; });

    generateBtn.addEventListener('click', function () {
      var state = getState();
      state.current = generateRoute();
      saveState(state);
      renderMapUi();
    });

    startBtn.addEventListener('click', function () {
      var state = getState();
      if (!state.current) state.current = generateRoute();
      state.current.started = true;
      state.current.finished = false;
      state.current.index = 0;
      state.current.hp = 3;
      state.current.score = 0;
      state.current.rewardTotal = 0;
      saveState(state);
      renderMapUi();
      renderQuestion();
    });

    nextBtn.addEventListener('click', function () {
      var state = getState();
      var route = state.current;
      if (!route || !route.started) return;
      if (route.index >= route.cells.length - 1) {
        finishRoute();
        return;
      }
      route.index += 1;
      route.rewardTotal += route.cells[route.index - 1].reward || 0;
      route.score += 10;
      saveState(state);
      renderMapUi();
      renderQuestion();
    });
  }

  function openMask() {
    ensureMask();
    var mask = document.getElementById('randomMapMask');
    if (mask) mask.style.display = 'flex';
    renderMapUi();
  }

  function renderLegend() {
    var legend = document.getElementById('randomMapLegend');
    if (!legend) return;
    legend.innerHTML = tileKinds.map(function (kind) {
      return '<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(148,163,184,0.08);border:1px solid rgba(148,163,184,0.25);color:#e5eefc;font-size:12px;">' + kind.icon + ' ' + kind.label + '</span>';
    }).join('');
  }

  function renderMeta(state) {
    var meta = document.getElementById('randomMapMeta');
    if (!meta) return;
    var route = state.current || generateRoute();
    var total = state.total || 0;
    var best = state.best || 0;
    meta.innerHTML = [
      '<span style="padding:6px 10px;border-radius:999px;background:rgba(56,189,248,.15);color:#7dd3fc;border:1px solid rgba(125,211,252,.3);">总挑战 ' + total + '</span>',
      '<span style="padding:6px 10px;border-radius:999px;background:rgba(251,191,36,.15);color:#fbbf24;border:1px solid rgba(251,191,36,.3);">最高分 ' + best + '</span>',
      '<span style="padding:6px 10px;border-radius:999px;background:rgba(52,211,153,.15);color:#6ee7b7;border:1px solid rgba(52,211,153,.3);">HP ' + (route.hp || 3) + '</span>',
      '<span style="padding:6px 10px;border-radius:999px;background:rgba(168,85,247,.15);color:#c4b5fd;border:1px solid rgba(168,85,247,.3);">分数 ' + (route.score || 0) + '</span>'
    ].join('');
  }

  function renderBoard(state) {
    var board = document.getElementById('randomMapBoard');
    if (!board) return;
    var route = state.current || generateRoute();
    var playerPos = route.started ? route.index : 0;
    board.innerHTML = route.cells.map(function (cell, idx) {
      var isPlayer = idx === playerPos && route.started && !route.finished;
      var isDone = idx < playerPos && route.started;
      var showPlayer = isPlayer ? '<div style="position:absolute;right:6px;top:6px;width:18px;height:18px;border-radius:6px;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;font-size:10px;">你</div>' : '';
      var shadow = isPlayer ? 'box-shadow:0 0 0 3px rgba(255,255,255,.9),0 0 20px rgba(59,130,246,.7)' : '';
      var border = isDone ? 'border:2px solid rgba(134,239,172,.8)' : 'border:2px solid rgba(148,163,184,.22)';
      var tileStyle = [
        'position:relative',
        'display:flex',
        'flex-direction:column',
        'align-items:center',
        'justify-content:center',
        'min-height:88px',
        'border-radius:16px',
        'background:' + cell.color,
        'color:#0f172a',
        'font-weight:900',
        border,
        'box-sizing:border-box',
        shadow,
        'padding:8px 4px'
      ].join(';');

      var mark = idx === 0 ? '起' : idx === route.cells.length - 1 ? '终' : '·';
      return '<div style="' + tileStyle + '">' + showPlayer +
        '<div style="font-size:10px;opacity:.8;">' + mark + '</div>' +
        '<div style="font-size:22px;line-height:1;">' + cell.icon + '</div>' +
        '<div style="font-size:11px;">' + cell.label + '</div>' +
        '<div style="font-size:10px;opacity:.8;">+' + cell.reward + '</div>' +
      '</div>';
    }).join('');
  }

  function renderMapUi() {
    var state = getState();
    if (!state.current) {
      state.current = generateRoute();
      saveState(state);
    }
    renderLegend();
    renderMeta(state);
    renderBoard(state);

    var questionBox = document.getElementById('randomMapQuestion');
    var nextBtn = document.getElementById('randomMapNextBtn');
    if (!state.current.started || state.current.finished) {
      if (questionBox) questionBox.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    }
  }

  function renderQuestion() {
    var state = getState();
    var route = state.current;
    var questionBox = document.getElementById('randomMapQuestion');
    var nextBtn = document.getElementById('randomMapNextBtn');
    if (!route || !route.started || route.finished) {
      if (questionBox) questionBox.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      return;
    }

    var cell = route.cells[route.index] || route.cells[route.cells.length - 1];
    var q = buildQuestion();
    route.currentQuestion = q;
    saveState(state);

    questionBox.innerHTML = [
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;">',
      '  <div style="font-size:12px;letter-spacing:2px;color:#c4b5fd;">' + route.mapName + ' · 当前格子：' + cell.label + '</div>',
      '  <div style="font-size:12px;color:#fbbf24;">' + cell.icon + ' ' + cell.kind + '</div>',
      '</div>',
      '<div style="font-size:28px;font-weight:900;margin-bottom:10px;">' + q.label + '</div>',
      '<div style="font-size:42px;font-weight:900;margin-bottom:18px;">' + q.text + '</div>',
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(170px,1fr));gap:12px;">',
      q.choices.map(function (choice) {
        return '<button type="button" class="random-choice-btn" style="padding:12px 10px;border-radius:12px;border:1px solid rgba(148,163,184,0.35);background:rgba(15,23,42,0.92);color:#e5eefc;font-size:20px;font-weight:800;cursor:pointer;">' + choice + '</button>';
      }).join(''),
      '</div>'
    ].join('');

    questionBox.style.display = 'block';
    if (nextBtn) nextBtn.style.display = 'none';

    questionBox.querySelectorAll('.random-choice-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var selected = Number(btn.textContent.trim());
        var answer = calcAnswerByText(q.text);
        var state2 = getState();
        var route2 = state2.current;
        var cell2 = route2.cells[route2.index] || route2.cells[route2.cells.length - 1];

        if (selected === answer) {
          route2.score += 25;
          route2.rewardTotal += cell2.reward;
          route2.index += 1;
          route2.note = '答对了，继续前进。';

          if (route2.index >= route2.cells.length) {
            finishRoute();
            return;
          }

          saveState(state2);
          renderMapUi();
          renderQuestion();
        } else {
          route2.hp = Math.max(0, (route2.hp || 1) - 1);
          route2.note = '答案错误，HP -1。';
          saveState(state2);
          renderMapUi();

          if (route2.hp <= 0) {
            route2.started = false;
            route2.finished = true;
            state2.total = (state2.total || 0) + 1;
            saveState(state2);
            questionBox.innerHTML = '<div style="font-size:24px;font-weight:800;color:#fca5a5;">冒险失败，地图已重置。</div>';
            renderMapUi();
          } else {
            btn.style.borderColor = '#f87171';
            btn.style.boxShadow = '0 0 0 2px rgba(248,113,113,0.8)';
            setTimeout(function () {
              btn.style.borderColor = 'rgba(148,163,184,0.35)';
              btn.style.boxShadow = 'none';
            }, 450);
          }
        }
      });
    });
  }

  function finishRoute() {
    var state = getState();
    var route = state.current;
    if (!route) return;

    route.started = false;
    route.finished = true;
    route.note = '地图已通关，奖励已结算。';
    state.total = (state.total || 0) + 1;
    state.best = Math.max(state.best || 0, route.score || 0);
    state.history.unshift({
      time: new Date().toLocaleString(),
      name: route.mapName,
      score: route.score || 0,
      reward: route.rewardTotal || 0
    });
    state.history = state.history.slice(0, 5);
    saveState(state);

    var questionBox = document.getElementById('randomMapQuestion');
    if (questionBox) {
      questionBox.innerHTML = [
        '<div style="font-size:30px;font-weight:900;color:#86efac;">地图通关！</div>',
        '<div style="margin-top:12px;font-size:20px;">' + route.mapName + ' · 获得 ' + (route.rewardTotal || 0) + ' 奖励 · 总分 ' + (route.score || 0) + '</div>'
      ].join('');
      questionBox.style.display = 'block';
    }

    var nextBtn = document.getElementById('randomMapNextBtn');
    if (nextBtn) nextBtn.style.display = 'none';
    renderMapUi();
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureUi();
    var button = document.getElementById('btnRandomMap');
    if (button) {
      button.addEventListener('click', function () { openMask(); });
    }
  });
})();
