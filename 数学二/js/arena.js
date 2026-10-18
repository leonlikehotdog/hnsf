/* ============================================================
 * 302 数学二 · 天下第一武道会（擂台挑战赛）
 * ------------------------------------------------------------
 * 复刻龙珠天下第一武道会：观众席、擂台、五名选手、主持人。
 * 赛制：五轮淘汰，每轮 1 道「最难」的数学二真题，答错即出局。
 *
 * 题目难度不是随机的：
 *   · 只从解答题 / 填空题里选（选择题不够难）；
 *   · 年份按公开难度评价加权（2016、2018、2020、2024 公认偏难）；
 *   · 考点加权：中值定理证明、不等式、数列极限、抽象线代、极坐标等；
 *   · 题面里出现「证明 / 存在 / 任意 / 分两问」再加权。
 * 展示的「估算正确率」= 由上述分数折算，仅用于排难度，不是官方统计。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var ROUNDS = [
    {
      id: 'krillin', name: '克林', title: '预选赛', char: 'krillin', icon: '🥋', stars: 3,
      pool: 'ode', quote: '别看我个子小，这一题可不小。接得住就进八强。'
    },
    {
      id: 'tien', name: '天津饭', title: '八强赛', char: 'tien-shinhan', icon: '👁️', stars: 4,
      pool: 'integral', quote: '四妖拳也好，四则运算也好——先接住这一招。'
    },
    {
      id: 'piccolo', name: '比克', title: '半决赛', char: 'piccolo', icon: '🟢', stars: 4.5,
      pool: 'calc', quote: '让我看看你的极限在哪里。算不完，就下场。'
    },
    {
      id: 'vegeta', name: '贝吉塔', title: '决赛', char: 'vegeta', icon: '👑', stars: 5,
      pool: 'linear', quote: '区区地球人，也敢站在王子面前？'
    },
    {
      id: 'buu', name: '魔人布欧', title: '卫冕战', char: 'majin-buu', icon: '🍬', stars: 6,
      pool: 'proof', quote: '陪我玩嘛。答错的话，就把你变成巧克力。'
    }
  ];

  var YEAR_W = {
    2011: 2, 2012: 3, 2013: 4, 2014: 4, 2015: 5, 2016: 12, 2017: 6, 2018: 12,
    2019: 8, 2020: 10, 2021: 4, 2022: 6, 2023: 6, 2024: 10, 2025: 8, 2026: 7
  };

  var POOLS = {
    ode: function (t) {
      return /^gs-ode-/.test(t) || t === 'gs-opt' || t === 'gs-concave' || t === 'gs-int-app';
    },
    integral: function (t) {
      return /^gs-(dbl|multi)-/.test(t);
    },
    calc: function (t) {
      return /^gs-(lim|int)-/.test(t) && t !== 'gs-int-mvt';
    },
    linear: function (t) {
      return /^xd-/.test(t);
    },
    proof: function (t) {
      return /^(gs-mvt|gs-ineq-prove|gs-cont-closed|gs-lim-seq|gs-lim-squeeze|gs-int-mvt|xd-eig-abstract|xd-det-abstract|xd-mat-rankineq|xd-solve-param|xd-solve-common)$/.test(t);
    }
  };

  /* 每轮从该题库的高分段里取：band = [最低名次, 最高名次]（0 = 最难） */
  var BAND = { ode: [3, 9], integral: [1, 6], calc: [0, 5], linear: [0, 4], proof: [0, 3] };

  var run = null;
  var mask = null, faceEl = null, nameEl = null, quoteEl = null, metaEl = null;
  var roundEl = null, starsEl = null, startBtn = null;

  function $(id) { return document.getElementById(id); }

  function questions() {
    return (window.HNSF829_ZT && window.HNSF829_ZT.qs) || [];
  }

  function nodeName(id) {
    var list = (NS.NODES && NS.NODES.nodes) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].name;
    return id;
  }

  function difficulty(q) {
    var s = 0;
    if (q.type === 'calc') s += 18;
    else if (q.type === 'blank') s += 10;
    s += YEAR_W[q.year] || 5;
    if (q.score >= 12) s += 8;
    else if (q.score >= 10) s += 4;
    (q.zt || []).forEach(function (t) {
      if (/mvt|ineq-prove|cont-closed|lim-seq|lim-squeeze|int-mvt/.test(t)) s += 10;
      if (/abstract|rankineq|solve-param|solve-common|qf-inertia|qf-positive/.test(t)) s += 8;
      if (/dbl-polar|dbl-sym|int-var|int-phys/.test(t)) s += 5;
    });
    if (/证明/.test(q.stem)) s += 8;
    if (/（I）|\(I\)|（1）|\(1\)/.test(q.stem)) s += 4;
    if (/至少|存在|任意|恒有|对所有/.test(q.stem)) s += 4;
    return s;
  }

  /** 由难度分折算的估算正确率（只用于展示难度，不是官方数据） */
  function estRate(q) {
    var r = Math.round(66 - difficulty(q) * 0.85);
    return Math.max(10, Math.min(48, r));
  }

  function pickBand(list, band, used) {
    var pool = list.filter(function (q) { return used.indexOf(q.id) < 0; });
    if (!pool.length) pool = list.slice();
    var from = Math.min(band[0], Math.max(0, pool.length - 1));
    var to = Math.min(band[1], pool.length - 1);
    if (to < from) to = from;
    var idx = from + Math.floor(Math.random() * (to - from + 1));
    return pool[idx];
  }

  function pickQuestions() {
    var qs = questions();
    var used = [];
    return ROUNDS.map(function (r) {
      var pred = POOLS[r.pool] || function () { return true; };
      var list = qs.filter(function (q) {
        if (q.type === 'choice') return false;
        return (q.zt || []).some(pred);
      }).map(function (q) { return { q: q, s: difficulty(q) }; })
        .sort(function (a, b) { return b.s - a.s; })
        .map(function (x) { return x.q; });
      var q = pickBand(list, BAND[r.pool] || [0, 4], used);
      if (!q) {
        // 兜底：任意一道非选择题
        q = qs.filter(function (x) { return x.type !== 'choice' && used.indexOf(x.id) < 0; })[0] || qs[0];
      }
      if (q) used.push(q.id);
      return q;
    });
  }

  function newRun() {
    run = {
      round: 0, wins: 0, champion: false, failed: false,
      questions: pickQuestions(), lastIndex: 0, lastFinal: false, lastPass: false
    };
  }

  function ensureRun() {
    if (!run || run.champion) newRun();
    if (!run.questions || !run.questions.length) newRun();
    return run;
  }

  function status() {
    var r = run || { round: 0, wins: 0, champion: false };
    var idx = Math.min(r.round, ROUNDS.length - 1);
    return {
      round: idx,
      wins: r.wins || 0,
      champion: !!r.champion,
      total: ROUNDS.length,
      opponent: ROUNDS[idx]
    };
  }

  function resultInfo() {
    var r = run || { lastIndex: 0, lastFinal: false };
    var i = Math.min(r.lastIndex || 0, ROUNDS.length - 1);
    return {
      opponent: ROUNDS[i],
      round: i + 1,
      total: ROUNDS.length,
      final: !!r.lastFinal,
      pass: !!r.lastPass
    };
  }

  /* ---------------- 开赛前的对手卡 ---------------- */
  function showIntro() {
    ensureRun();
    var r = ROUNDS[run.round];
    var q = run.questions[run.round];
    if (!r || !q) { newRun(); r = ROUNDS[run.round]; q = run.questions[run.round]; }

    roundEl.textContent = '第 ' + (run.round + 1) + ' / ' + ROUNDS.length + ' 轮 · ' + r.title;
    nameEl.textContent = r.name;
    quoteEl.textContent = '「' + r.quote + '」';
    if (faceEl) {
      faceEl.hidden = false;
      faceEl.onerror = function () { faceEl.hidden = true; };
      faceEl.src = 'assets/dbz/' + r.char + '.png';
    }
    if (starsEl) {
      var full = Math.floor(r.stars);
      starsEl.textContent = '★★★★★★'.slice(0, full) + (r.stars % 1 ? '☆' : '') +
        '☆☆☆☆☆☆'.slice(0, Math.max(0, 6 - Math.ceil(r.stars)));
      starsEl.title = '难度 ' + r.stars + ' / 6';
    }

    var topics = (q.zt || []).slice(0, 2).map(nodeName).join(' / ');
    metaEl.innerHTML =
      '<div class="am-row"><span>估算正确率</span><b>约 ' + estRate(q) + '%</b></div>' +
      '<div class="am-row"><span>题目来源</span><b>' + (q.year || '') + ' 年真题 · ' +
        (q.type === 'calc' ? '解答题' : '填空题') + ' ' + (q.score || '') + ' 分</b></div>' +
      '<div class="am-row"><span>考点</span><b>' + topics + '</b></div>' +
      '<div class="am-note">难度按「年份难度系数 + 题型 + 考点 + 题面特征」综合评估；2016 / 2018 / 2020 / 2024 为公认偏难年份。</div>';

    mask.classList.add('show');
    mask.setAttribute('aria-hidden', 'false');
  }

  function closeIntro() {
    if (!mask) return;
    mask.classList.remove('show');
    mask.setAttribute('aria-hidden', 'true');
  }

  function isOpen() {
    return !!(mask && mask.classList.contains('show'));
  }

  function startFight() {
    if (!run) ensureRun();
    var r = ROUNDS[run.round];
    var q = run.questions[run.round];
    if (!r || !q) return;
    closeIntro();
    NS.Engine.open({
      node: {
        id: 'arena-' + r.id, charId: r.char, name: r.title, icon: r.icon,
        tier: 3, module: 'arena', chap: 'arena', req: []
      },
      questions: [q],
      mode: 'arena',
      onExit: function () {
        if (NS.World && NS.World.refreshArena) NS.World.refreshArena();
      }
    });
  }

  /**
   * Engine 结算时调用：记录本轮胜负、发碎片。
   * 返回的字段与普通关卡结算保持同一套形状。
   */
  function finishMatch(result) {
    if (!run) ensureRun();
    var idx = Math.min(run.round, ROUNDS.length - 1);
    var r = ROUNDS[idx];
    var final = idx === ROUNDS.length - 1;
    var pass = (result.correct || 0) >= 1;
    var frag = 0;

    run.lastIndex = idx;
    run.lastFinal = final;
    run.lastPass = pass;

    if (pass) {
      run.wins = idx + 1;
      run.failed = false;
      frag = final ? 5 : 1;
      if (final) {
        run.champion = true;
        run.round = ROUNDS.length;
      } else {
        run.round = idx + 1;
      }
    } else {
      run.failed = true;
    }

    if (frag && NS.Store) NS.Store.addFragments(frag);
    var rec = NS.Store ? NS.Store.arenaRecord({
      wins: run.wins || 0,
      champion: final && pass,
      ended: !pass || final
    }) : { newAchievements: [], best: 0, champion: 0 };

    if (NS.World && NS.World.refreshArena) {
      setTimeout(function () { NS.World.refreshArena(); }, 80);
    }

    return {
      pass: pass,
      perfect: pass,
      rate: pass ? 1 : 0,
      bonus: 0,
      firstClear: false,
      prevBest: 0,
      newRecord: {},
      newAchievements: rec.newAchievements || [],
      fragments: frag,
      champion: final && pass,
      final: final,
      opponent: r,
      round: idx + 1,
      totalRounds: ROUNDS.length,
      wins: run.wins || 0
    };
  }

  function beginMatch() {
    ensureRun();
    showIntro();
  }

  function restart() {
    newRun();
    showIntro();
  }

  function init() {
    mask = $('arenaMask');
    if (!mask) return;
    faceEl = $('arenaFace');
    nameEl = $('arenaName');
    quoteEl = $('arenaQuote');
    metaEl = $('arenaMeta');
    roundEl = $('arenaRound');
    starsEl = $('arenaStars');
    startBtn = $('arenaStart');

    if (startBtn) startBtn.addEventListener('click', startFight);
    var later = $('arenaLater');
    if (later) later.addEventListener('click', closeIntro);
    var close = $('arenaClose');
    if (close) close.addEventListener('click', closeIntro);
    mask.addEventListener('click', function (e) { if (e.target === mask) closeIntro(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { closeIntro(); e.preventDefault(); }
    });
  }

  NS.Arena = {
    init: init,
    rounds: ROUNDS,
    beginMatch: beginMatch,
    finishMatch: finishMatch,
    resultInfo: resultInfo,
    status: status,
    restart: restart,
    close: closeIntro,
    isOpen: isOpen
  };
})(window.HNSF829);
