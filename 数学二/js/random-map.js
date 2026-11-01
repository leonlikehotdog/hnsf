(function () {
  'use strict';

  var STORAGE_KEY = 'hnsf.math2.randomMap.v2';
  var WORLD_W = 5;
  var WORLD_H = 6;

  var tileKinds = [
    { key: 'quest', label: '题', color: '#38bdf8', icon: '❔' },
    { key: 'treasure', label: '宝', color: '#fbbf24', icon: '💎' },
    { key: 'trap', label: '险', color: '#f87171', icon: '⚠️' },
    { key: 'shop', label: '店', color: '#a78bfa', icon: '🛒' },
    { key: 'boss', label: 'Boss', color: '#fb923c', icon: '👹' }
  ];

  function safeParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {}
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  }

  function buildQuestion() {
    var type = randomInt(0, 3);
    if (type === 0) {
      var a = randomInt(2, 18);
      var b = randomInt(2, 18);
      var answer = a + b;
      return {
        label: '加法挑战',
        text: a + ' + ' + b + ' = ?',
        choices: shuffle([answer, answer + 1, answer - 2, answer + 3])
      };
    }
    if (type === 1) {
      var x = randomInt(3, 25);
      var y = randomInt(2, 12);
      var prod = x * y;
      return {
        label: '乘法挑战',
        text: x + ' × ' + y + ' = ?',
        choices: shuffle([prod, prod + 4, prod - 3, prod + 9])
      };
    }
    if (type === 2) {
      var c = randomInt(6, 40);
      var d = randomInt(2, 8);
      var q = Math.floor(c / d);
      return {
        label: '除法挑战',
        text: c + ' ÷ ' + d + ' = ?',
        choices: shuffle([q, q + 2, q - 1, q + 5])
      };
    }
    var m = randomInt(4, 40);
    var n = randomInt(2, 12);
    var diff = m - n;
    return {
      label: '减法挑战',
      text: m + ' - ' + n + ' = ?',
      choices: shuffle([diff, diff + 2, diff - 3, diff + 6])
    };
  }

  function calcAnswerByText(text) {
    var add = text.match(/(\d+) \+ (\d+)/);
    if (add) return Number(add[1]) + Number(add[2]);
    var sub = text.match(/(\d+) - (\d+)/);
    if (sub) return Number(sub[1]) - Number(sub[2]);
    var mul = text.match(/(\d+) × (\d+)/);
    if (mul) return Number(mul[1]) * Number(mul[2]);
    var div = text.match(/(\d+) ÷ (\d+)/);
    if (div) return Math.floor(Number(div[1]) / Number(div[2]));
    return 0;
  }

  function formatMapName() {
    var names = ['晨风迷路', '数理森林', '云顶渡口', '极限荒地', '星河试炼', '记忆村'];
    return pick(names);
  }

  function generateGrid() {
    var cells = [];
    var sx = 0;
    var sy = 0;
    var path = [];
    for (var i = 0; i < 8; i++) {
      var kind = pick(tileKinds);
      var cell = {
        id: i,
        x: sx,
        y: sy,
        kind: kind.key,
        label: kind.label,
        icon: kind.icon,
        color: kind.color,
        reward: randomInt(10, 35),
        danger: i === 7 ? 2 : randomInt(0, 2)
      };
      path.push(cell);
      if (i < 7) {
        sx += 1;
        if (sx >= WORLD_W) {
          sx = 0;
          sy += 1;
        }
      }
    }
    return path;
  }

  function generateRoute() {
    return {
      id: Date.now(),
      mapName: formatMapName(),
      cells: generateGrid(),
      index: 0,
      hp: 3,
      score: 0,
      rewardTotal: 0,
      started: false,
      finished: false,
      currentQuestion: null,
      note: '向终点前进，答对题目可推进并获奖励。'
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
    button.title = '随机地图挑战：像素地图 + 题目冒险';
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
    mask.style.background = 'rgba(15,23,42,0.78)';
    mask.style.alignItems = 'center';
    mask.style.justifyContent = 'center';
    mask.innerHTML = [
      '<div style="width:min(960px,92vw);position:relative;background:linear-gradient(180deg,#0f172a,#1e293b 48%,#111827);border:1px solid rgba(148,163,184,0.35);border-radius:22px;box-shadow:0 28px 80px rgba(0,0,0,0.45);padding:22px;color:#e5eefc;">',
      '  <button id="randomMapClose" type="button" style="position:absolute;right:18px;top:16px;border:none;background:rgba(148,163,184,0.14);color:#e5eefc;border-radius:10px;padding:8px 12px;cursor:pointer;">✕</button>',
      '  <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:18px;">',
      '    <div>',
      '      <div style="font-size:11px;letter-spacing:2px;color:#7dd3fc;text-transform:uppercase;">pixel adventure</div>',
      '      <h2 style="margin:5px 0 0;font-size:30px;">随机地图挑战</h2>',
      '    </div>',
      '    <div style="display:flex;gap:8px;flex-wrap:wrap;">',
      '      <button id="randomMapGenerateBtn" type="button" style="border:none;border-radius:12px;background:linear-gradient(135deg,#38bdf8,#8b5cf6);padding:10px 16px;color:#fff;font-weight:800;cursor:pointer;">新地图</button>',
      '      <button id="randomMapStartBtn" type="button" style="border:none;border-radius:12px;background:#1f2937;border:1px solid rgba(148,163,184,0.35);padding:10px 16px;color:#e5eefc;font-weight:700;cursor:pointer;">开始冒险</button>',
      '    </div>',
      '  </div>',
      '  <div id="randomMapMeta" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;"></div>',
      '  <div id="randomMapBoard" style="display:grid;grid-template-columns:repeat(5,minmax(84px,1fr));gap:12px;padding:12px;border-radius:18px;background:rgba(15,23,42,0.58);border:1px solid rgba(148,163,184,0.2);min-height:260px;"></div>',
      '  <div id="randomMapQuestion" style="display:none;margin-top:20px;padding:18px;border-radius:16px;background:rgba(15,23,42,0.68);border:1px solid rgba(148,163,184,0.25);"></div>',
      '  <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">',
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
      if (!state.current) {
        state.current = generateRoute();
      }
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
      route.score += 10;
      route.rewardTotal += route.cells[route.index - 1].reward || 0;
      saveState(state);
      renderMapUi();
      renderQuestion();
    });
  }

  function openMask() {
    ensureMask();
    var mask = document.getElementById('randomMapMask');
    if (mask) {
      mask.style.display = 'flex';
    }
    renderMapUi();
  }

  function renderMeta(state) {
    var meta = document.getElementById('randomMapMeta');
    if (!meta) return;
    var best = state.best || 0;
    var total = state.total || 0;
    var route = state.current || generateRoute();
    var hp = route.hp || 3;
    var score = route.score || 0;
    meta.innerHTML = [
      '<span style="padding:6px 10px;border-radius:999px;background:rgba(56,189,248,.15);color:#7dd3fc;border:1px solid rgba(125,211,252,.3);">挑战 ' + total + '</span>',
      '<span style="padding:6px 10px;border-radius:999px;background:rgba(251,191,36,.15);color:#fbbf24;border:1px solid rgba(251,191,36,.3);">最高分 ' + best + '</span>',
      '<span style="padding:6px 10px;border-radius:999px;background:rgba(52,211,153,.15);color:#6ee7b7;border:1px solid rgba(52,211,153,.3);">HP ' + hp + '</span>',
      '<span style="padding:6px 10px;border-radius:999px;background:rgba(168,85,247,.15);color:#c4b5fd;border:1px solid rgba(168,85,247,.3);">分数 ' + score + '</span>'
    ].join('');
  }

  function renderBoard(state) {
    var board = document.getElementById('randomMapBoard');
    if (!board) return;
    var route = state.current || generateRoute();
    var playerIndex = route.started ? route.index : 0;
    board.innerHTML = route.cells.map(function (cell, idx) {
      var active = idx === playerIndex;
      var done = idx < playerIndex && route.started;
      var glow = active ? 'box-shadow:0 0 0 3px rgba(255,255,255,0.9), 0 0 24px rgba(59,130,246,0.75)' : '';
      var border = done ? 'border:2px solid rgba(134,239,172,0.7)' : 'border:2px solid rgba(148,163,184,0.2)';
      var tileStyle = 'display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:92px;border-radius:16px;background:' + cell.color + ';color:#0f172a;font-weight:900;' + border + ';' + glow + ';position:relative;';
      var mark = idx === 0 ? '起' : idx === route.cells.length - 1 ? '终' : '·';
      var player = idx === playerIndex && route.started ? '<div style="position:absolute;right:6px;top:6px;width:18px;height:18px;border-radius:6px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;">你</div>' : '';
      return '<div style="' + tileStyle + '">' + player +
        '<div style="font-size:12px;opacity:0.8;">' + mark + '</div>' +
        '<div style="font-size:20px;">' + cell.icon + '</div>' +
        '<div style="font-size:12px;">' + cell.label + '</div>' +
        '<div style="font-size:10px;opacity:0.85;">+' + cell.reward + '</div>' +
      '</div>';
    }).join('');
  }

  function renderMapUi() {
    var state = getState();
    if (!state.current) {
      state.current = generateRoute();
      saveState(state);
    }
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
      '<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px;">',
      '  <div style="font-size:12px;letter-spacing:2px;color:#c4b5fd;">' + route.mapName + ' · ' + cell.label + '</div>',
      '  <div style="font-size:12px;color:#fbbf24;">当前格子：' + cell.icon + ' ' + cell.kind + '</div>',
      '</div>',
      '<div style="font-size:30px;font-weight:900;margin-bottom:12px;">' + q.label + '</div>',
      '<div style="font-size:38px;font-weight:900;margin-bottom:18px;">' + q.text + '</div>',
      '<div style="display:grid;grid-template-columns:repeat(2,minmax(160px,1fr));gap:12px;">',
      q.choices.map(function (choice) {
        return '<button type="button" class="random-choice-btn" style="padding:12px 10px;border-radius:12px;border:1px solid rgba(148,163,184,0.35);background:rgba(15,23,42,0.9);color:#e5eefc;font-size:20px;font-weight:700;cursor:pointer;">' + choice + '</button>';
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
          if (route2.index >= route2.cells.length) {
            finishRoute();
            return;
          }
          route2.note = '答对了，继续前进，进入下一格。';
          saveState(state2);
          renderMapUi();
          renderQuestion();
        } else {
          route2.hp -= 1;
          route2.note = '答案错误，生命值 -1，先来一次重试。';
          saveState(state2);
          renderMapUi();
          if (route2.hp <= 0) {
            route2.finished = true;
            route2.started = false;
            state2.total = (state2.total || 0) + 1;
            saveState(state2);
            questionBox.innerHTML = '<div style="font-size:24px;font-weight:800;color:#fca5a5;">冒险失败，地图已重置。</div>';
            if (nextBtn) nextBtn.style.display = 'none';
            renderMapUi();
          } else {
            btn.style.borderColor = '#f87171';
            btn.style.boxShadow = '0 0 0 2px rgba(248,113,113,0.7)';
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
    route.finished = true;
    route.started = false;
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
        '<div style="margin-top:12px;font-size:20px;">' + route.mapName + ' · 获得 ' + (route.rewardTotal || 0) + ' 奖励 · 分数 ' + (route.score || 0) + '</div>'
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
      button.addEventListener('click', function () {
        openMask();
      });
    }
  });
})();
