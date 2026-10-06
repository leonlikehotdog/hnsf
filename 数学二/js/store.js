/* ============================================================
 * 829 闯关系统 · 存档与激励核心（localStorage 持久化）
 * 负责：经验值 / 等级 / 节点解锁 / 错题本 / 成就 / 订阅通知
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  // ⚠️ 这个 key 必须和 829 的不是同一个！
  //    两个应用部署在同一域名下（/829/ 与 /数学二/），localStorage 是同源的，
  //    共用 key 会让「数学二」读到 829 的通关记录，导致解锁状态与掌握度全乱。
  var KEY = 'hnsf302_save_v1';

  // 存档结构版本。节点树从 21 个粗节点重构成 69 个细节点后，
  // 旧存档里的节点 id 全部失效，必须迁移一次，否则已通关记录会凭空消失。
  var VERSION = 2;

  var DEFAULTS = {
    v: VERSION,
    xp: 0,
    cleared: {},        // nodeId -> { best: 正确率(0-1), times: 通关次数, ts: 时间戳, perfect: 是否满星 }
    stats: { answered: 0, correct: 0, maxCombo: 0, perfectCount: 0 },
    streak: 0,          // 当前连续答对题数（跨关卡、跨会话累计，答错即清零）
    wrong: {},          // qid -> { node, ts, resolved: bool, times: 错次 }
    achievements: {},   // id -> 获得时间戳
    wrongCleanedFlag: false,
    nodeStats: {},      // nodeId -> { answered, correct } 累计作答，用于「考点掌握度热力图」
    bestRunRate: 0,     // 单局最高正确率
    bestRunCombo: 0,    // 单局最高连击
    loot: { opened: 0, tiers: {} },  // 通关宝箱：累计开箱次数 + 各稀有度命中数（id -> 次数）
    story: { intro: {}, outro: {} }, // 章节剧情卡：看过哪几章的入关/出关（chapId -> 时间戳），保证每章只弹一次
    lastNodeId: ''      // 最近一次打的关卡（结算页可一键再来）
  };

  var state = null;          // 真正的初始化放在 load()/save() 定义之后（迁移表要先就位）
  var listeners = [];

  /* ---------------- 存档迁移：21 个粗节点 → 69 个细节点 ----------------
   * 旧节点（如「函数、极限与连续」整章一个球）被拆细后 id 不再存在。
   * 若直接丢弃，玩家已通关的考点会全部变灰、掌握度清零，观感像「存档被删」。
   * 所以按「粗节点 → 最接近的细节点」做一次性映射，并把同一新节点的数据合并。
   * ⚠️ 这是历史包袱，等各章题库都铺完、老存档自然淘汰后可以整段删掉。
   */
  var LEGACY_NODE_MAP = {
    'gs-lim': 'gs-lim-fn',          // 函数极限与连续 → 函数极限
    'gs-cont': 'gs-cont',           // 连续性与间断点（id 保留）
    'gs-deriv': 'gs-deriv-rule',    // 导数计算 → 求导法则与高阶导数
    'gs-deriv-app': 'gs-mono',      // 微分学应用 → 单调性与极值
    'gs-taylor': 'gs-taylor',       // 泰勒公式（id 保留）
    'gs-int-basic': 'gs-int-sub',   // 不定积分与基本积分法 → 换元积分法
    'gs-int-def': 'gs-int-nl',      // 定积分计算 → 定积分的计算
    'gs-int-app': 'gs-int-app',     // 定积分应用（id 保留）
    'gs-multi': 'gs-multi-partial', // 多元微分学 → 偏导数与全微分
    'gs-double': 'gs-dbl-rect',     // 二重积分 → 直角坐标计算
    'gs-ode': 'gs-ode-first',       // 常微分方程 → 一阶微分方程
    'gs-proof': 'gs-mvt',           // 中值定理证明综合 → 微分中值定理
    'xd-det': 'xd-det-calc',        // 行列式 → 性质与计算
    'xd-mat': 'xd-mat-op',          // 矩阵运算 → 矩阵运算与运算律
    'xd-rank': 'xd-mat-rank',       // 矩阵的秩与逆 → 矩阵的秩
    'xd-vec': 'xd-vec-comb',        // 向量组相关性 → 线性组合与线性表示
    'xd-solve': 'xd-solve-homo',    // 方程组解的结构 → 齐次方程组
    'xd-eig': 'xd-eig-calc',        // 特征值与对角化 → 特征值计算
    'xd-quad': 'xd-qf-mat',         // 二次型与正定性 → 二次型的矩阵表示
    'xd-abstract': 'xd-mat-rankineq' // 抽象矩阵与秩的不等式 → 秩的不等式
    // 'boss-math2'（压轴综合）在新树里没有对应节点，直接丢弃
  };

  function nodeExists(id) {
    var list = (NS.NODES && NS.NODES.nodes) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return true;
    return false;
  }

  function migrate(st) {
    var remap = function (old) {
      var nw = LEGACY_NODE_MAP[old] || old;
      return nodeExists(nw) ? nw : null;
    };

    // 1) 通关记录（同一新节点可能由多个旧节点合并而来，取最好成绩、次数累加）
    var cl = {};
    Object.keys(st.cleared || {}).forEach(function (old) {
      var nw = remap(old);
      if (!nw) return;
      var a = st.cleared[old], b = cl[nw];
      cl[nw] = b ? {
        best: Math.max(a.best || 0, b.best || 0),
        times: (a.times || 0) + (b.times || 0),
        ts: Math.max(a.ts || 0, b.ts || 0),
        perfect: !!(a.perfect || b.perfect)
      } : { best: a.best, times: a.times, ts: a.ts, perfect: a.perfect };
    });
    st.cleared = cl;

    // 2) 掌握度累计（answered / correct 直接相加）
    var ns = {};
    Object.keys(st.nodeStats || {}).forEach(function (old) {
      var nw = remap(old);
      if (!nw) return;
      var a = st.nodeStats[old];
      var b = ns[nw] || { answered: 0, correct: 0 };
      b.answered += a.answered || 0;
      b.correct += a.correct || 0;
      ns[nw] = b;
    });
    st.nodeStats = ns;

    // 3) 错题本：题目本身还在题库里，只需把归属节点换成新的
    Object.keys(st.wrong || {}).forEach(function (qid) {
      var w = st.wrong[qid];
      if (!w || !w.node) return;
      var nw = remap(w.node);
      if (nw) w.node = nw;
    });

    if (st.lastNodeId) {
      var nw = remap(st.lastNodeId);
      st.lastNodeId = nw || '';
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
      var obj = JSON.parse(raw);
      var fromV = obj.v || 1;
      var st = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), obj);
      if (fromV < VERSION) {
        migrate(st);
        st.v = VERSION;
        try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e2) { /* 隐私模式忽略 */ }
      }
      return st;
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULTS));
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 隐私模式下静默失败 */ }
  }

  // 迁移表与 load() 都已就位，现在才真正读取存档
  state = load();

  /* ---------------- 等级曲线 ---------------- */
  // 升到 L+1 需要 100 + (L-1)*70 点经验
  function levelInfo(xp) {
    xp = xp || 0;
    var level = 1, acc = 0, need = 100;
    while (xp >= acc + need) { acc += need; level++; need = 100 + (level - 1) * 70; }
    return { level: level, cur: xp - acc, need: need, floor: acc };
  }

  /* ---------------- 节点状态 ---------------- */
  function nodes() { return (NS.NODES && NS.NODES.nodes) || []; }
  function nodeById(id) { return nodes().filter(function (n) { return n.id === id; })[0]; }
  function isCleared(id) { return !!state.cleared[id]; }

  function unlocked(node) {
    var info = levelInfo(state.xp);
    if (node.reqLevel && info.level < node.reqLevel) {
      return { ok: false, reason: '需要等级 Lv.' + node.reqLevel + '（当前 Lv.' + info.level + '）' };
    }
    var reqs = node.req || [];
    for (var i = 0; i < reqs.length; i++) {
      if (!isCleared(reqs[i])) {
        var pre = nodeById(reqs[i]);
        return { ok: false, reason: '需先通关前置节点「' + (pre ? pre.name : reqs[i]) + '」' };
      }
    }
    return { ok: true, reason: '' };
  }

  /* ---------------- 答题记录 ---------------- */
  // 返回 { achievements: 新解锁成就, streak: 当前全局连击数 }
  function recordAnswer(nodeId, qid, correct) {
    state.stats.answered++;
    if (correct) {
      state.stats.correct++;
      state.streak = (state.streak || 0) + 1;
      if (state.streak > state.stats.maxCombo) state.stats.maxCombo = state.streak;
    } else {
      state.streak = 0;                       // 答错即断连
    }
    if (qid) {
      if (correct) {
        if (state.wrong[qid]) state.wrong[qid].resolved = true;
      } else {
        var w = state.wrong[qid] || { node: nodeId, ts: Date.now(), resolved: false, times: 0 };
        w.node = nodeId; w.times = (w.times || 0) + 1; w.ts = Date.now();
        state.wrong[qid] = w;
      }
    }
    // 按考点累计，供掌握度热力图使用（累计正确率比「单次最佳」更能反映真实掌握程度）
    if (nodeId) {
      state.nodeStats = state.nodeStats || {};
      var ns = state.nodeStats[nodeId] || { answered: 0, correct: 0 };
      ns.answered++;
      if (correct) ns.correct++;
      state.nodeStats[nodeId] = ns;
    }
    if (nodeId) state.lastNodeId = nodeId;
    var gained = checkAchievements();
    save();
    emit();
    return { achievements: gained, streak: state.streak || 0 };
  }

  function streak() { return state.streak || 0; }

  /* ---------------- 考点掌握度（热力图） ---------------- */
  /**
   * 掌握度等级：
   *   0 = 还没碰过这个考点
   *   1 = 薄弱  （累计正确率 < 60%）
   *   2 = 一般  （60% ~ 85%）
   *   3 = 扎实  （>= 85%）
   * 用「累计正确率」而不是「单次最佳」：一次运气好刷个 100% 不代表掌握，
   * 累计值才是真实水平，也更适合用来指导该复习哪里。
   */
  function mastery(nodeId) {
    var ns = state.nodeStats && state.nodeStats[nodeId];
    if (!ns || !ns.answered) return { answered: 0, correct: 0, rate: null, level: 0 };
    var rate = ns.correct / ns.answered;
    return {
      answered: ns.answered,
      correct: ns.correct,
      rate: rate,
      level: rate >= 0.85 ? 3 : rate >= 0.6 ? 2 : 1
    };
  }

  /** 全部考点掌握度：{ nodeId: {answered, correct, rate, level} } */
  function masteryAll() {
    var out = {};
    nodes().forEach(function (n) { out[n.id] = mastery(n.id); });
    return out;
  }

  /** 掌握度分布统计：用于 HUD 与面板概览 */
  function masterySummary() {
    var all = masteryAll(), c = { 0: 0, 1: 0, 2: 0, 3: 0 };
    Object.keys(all).forEach(function (k) { c[all[k].level]++; });
    return { untouched: c[0], weak: c[1], ok: c[2], solid: c[3], total: Object.keys(all).length };
  }

  /** 最该补的考点：已做过但正确率最低的几个（未做过的优先靠前？不，未做过单独提示） */
  function weakestNodes(n) {
    return nodes()
      .map(function (nd) { return { node: nd, m: mastery(nd.id) }; })
      .filter(function (x) { return x.m.answered > 0; })
      .sort(function (a, b) { return a.m.rate - b.m.rate; })
      .slice(0, n || 3);
  }

  /** 单局纪录（用于结算页「新纪录」提示） */
  function records() {
    return {
      bestRunRate: state.bestRunRate || 0,
      bestRunCombo: state.bestRunCombo || 0,
      maxCombo: state.stats.maxCombo || 0
    };
  }

  /* ---------------- 通关结算 ---------------- */
  // 通关线：正确率 >= 60%
  var PASS_RATE = 0.6;

  function finishNode(nodeId, result) {
    var total = result.total || 0;
    var correct = result.correct || 0;
    var rate = total ? correct / total : 0;
    var pass = rate >= PASS_RATE;
    var perfect = total > 0 && correct === total;
    var firstClear = pass && !state.cleared[nodeId];
    var firstPerfect = perfect && !(state.cleared[nodeId] && state.cleared[nodeId].perfect);

    // 先记下「本节点历史最佳」，后面 rec.best 会被这局刷新，必须提前取
    var prevBest = (state.cleared[nodeId] && state.cleared[nodeId].best) || 0;
    var runCombo = result.maxCombo || 0;
    var newRecord = {};
    if (total > 0 && rate > (state.bestRunRate || 0)) {
      newRecord.rate = { now: rate, prev: state.bestRunRate || 0 };
      state.bestRunRate = rate;
    }
    if (runCombo > (state.bestRunCombo || 0)) {
      newRecord.combo = { now: runCombo, prev: state.bestRunCombo || 0 };
      state.bestRunCombo = runCombo;
    }

    var bonus = 0;
    if (pass) {
      bonus += 60;                                   // 通关基础奖励
      if (firstClear) bonus += 40;                    // 首通额外奖励
      if (firstPerfect) bonus += 30;                  // 满星奖励（每个节点只给一次）
    }

    if (pass) {
      var rec = state.cleared[nodeId] || { best: 0, times: 0 };
      rec.times++;
      rec.best = Math.max(rec.best, rate);
      rec.ts = Date.now();
      if (perfect) rec.perfect = true;
      state.cleared[nodeId] = rec;
    }

    // 满星关卡数 = 已通关节点中拿到过 100% 的节点数（去重）
    state.stats.perfectCount = Object.keys(state.cleared).filter(function (k) {
      return state.cleared[k].perfect;
    }).length;

    if (rate < PASS_RATE) state.wrongCleanedFlag = false;

    var before = levelInfo(state.xp).level;
    state.xp += bonus;
    save();

    var newAch = checkAchievements();
    var after = levelInfo(state.xp);
    emit();

    return {
      pass: pass, perfect: perfect, firstClear: firstClear,
      rate: rate, bonus: bonus, leveledUp: after.level > before, level: after.level,
      newAchievements: newAch,
      prevBest: prevBest, runCombo: runCombo, newRecord: newRecord,
      bestRunRate: state.bestRunRate || 0, bestRunCombo: state.bestRunCombo || 0
    };
  }

  function addXp(n) {
    if (!n) return { leveledUp: false, level: levelInfo(state.xp).level, newAchievements: [] };
    var before = levelInfo(state.xp).level;
    state.xp += n;
    var after = levelInfo(state.xp);
    var gained = checkAchievements();
    save(); emit();
    return { leveledUp: after.level > before, level: after.level, newAchievements: gained };
  }

  /* ---------------- 通关宝箱（不确定结算） ----------------
   * 设计要点：奖励**必须绑定真实进步**（只有通关才给，不给"打开 App"），
   * 而且**必须先摇再揭晓**——多巴胺来自"结果揭晓前的那段不确定"，直接显示结果就失效了。
   * 首通奖池明显好于重复通关，保证"推新关卡"比"刷旧关卡"更划算。
   * first / repeat 是权重（不是百分比，脚本里会归一化）。
   */
  var LOOT_TIERS = [
    { id: 'n',  name: '普通', icon: '⚪', color: '#c9d6ea', mult: 1.2, first: 40, repeat: 62 },
    { id: 'g',  name: '优秀', icon: '🟢', color: '#5ee08a', mult: 1.5, first: 26, repeat: 26 },
    { id: 'b',  name: '稀有', icon: '🔵', color: '#5ab7ff', mult: 2.0, first: 18, repeat:  9 },
    { id: 'p',  name: '史诗', icon: '🟣', color: '#c084fc', mult: 3.0, first: 11, repeat:  3 },
    { id: 'l',  name: '传说', icon: '🟡', color: '#ffd24a', mult: 4.0, first:  5, repeat:  0 }
  ];

  function rollLoot(firstClear) {
    var total = 0, acc = [];
    LOOT_TIERS.forEach(function (t) {
      var w = firstClear ? t.first : t.repeat;
      if (w > 0) { total += w; acc.push({ t: t, upTo: total }); }
    });
    if (!total) return LOOT_TIERS[0];
    var r = Math.random() * total;
    for (var i = 0; i < acc.length; i++) if (r < acc[i].upTo) return acc[i].t;
    return acc[acc.length - 1].t;
  }

  /** 开箱：baseXp = 本局基础通关奖励；返回 { tier, gain, leveledUp, level, newAchievements } */
  function openLoot(baseXp, firstClear) {
    var tier = rollLoot(firstClear);
    var gain = Math.round((baseXp || 0) * (tier.mult - 1));
    if (gain < 1) gain = 1;
    if (!state.loot) state.loot = { opened: 0, tiers: {} };
    state.loot.opened++;
    state.loot.tiers[tier.id] = (state.loot.tiers[tier.id] || 0) + 1;
    save();
    var res = addXp(gain);
    return {
      tier: tier, gain: gain,
      leveledUp: res.leveledUp, level: res.level,
      newAchievements: res.newAchievements || []
    };
  }

  function lootStats() {
    var l = state.loot || { opened: 0, tiers: {} };
    // 最稀有的那一档（用于统计面板展示"最好战绩"）
    var best = null;
    LOOT_TIERS.forEach(function (t) { if ((l.tiers[t.id] || 0) > 0) best = t; });
    return { opened: l.opened, tiers: l.tiers, best: best };
  }

  /* ---------------- 章节剧情卡：每章只弹一次 ---------------- */
  // 老存档没有 story 字段（load 的 Object.assign 会把 DEFAULTS 补上），
  // 但嵌套对象可能缺某一层，所以取值一律走兜底。
  function storySeen(kind, chapId) {
    var s = state.story || {};
    var m = s[kind] || {};
    return !!m[chapId];
  }

  function markStory(kind, chapId) {
    if (!kind || !chapId) return;
    state.story = state.story || { intro: {}, outro: {} };
    state.story[kind] = state.story[kind] || {};
    state.story[kind][chapId] = Date.now();
    save();
  }

  /* ---------------- 错题本 ---------------- */
  function wrongList() {
    return Object.keys(state.wrong)
      .filter(function (qid) { return !state.wrong[qid].resolved; })
      .map(function (qid) {
        var w = state.wrong[qid];
        return { qid: qid, node: w.node, times: w.times, ts: w.ts };
      })
      .sort(function (a, b) { return b.ts - a.ts; });
  }

  function wrongCount() { return wrongList().length; }

  function resolveWrong(qid, resolved) {
    if (!state.wrong[qid]) return;
    state.wrong[qid].resolved = resolved !== false;
    save(); checkAchievements(); emit();
  }

  function cleanAllWrong() {
    var list = wrongList();
    if (!list.length) return 0;
    list.forEach(function (it) { state.wrong[it.qid].resolved = true; });
    state.wrongCleanedFlag = true;
    save(); checkAchievements(); emit();
    return list.length;
  }

  /* ---------------- 成就 ---------------- */
  function snapshot() {
    var t = NS.NODES.tiers.map(function () { return true; });
    var tierCleared = {}, moduleCleared = {};
    var _ms = masterySummary();
    // 错题本里单题最高错次（隐藏成就「屡败屡战」用）
    var _maxWrongTimes = 0;
    Object.keys(state.wrong).forEach(function (k) {
      var n = state.wrong[k].times || 0;
      if (n > _maxWrongTimes) _maxWrongTimes = n;
    });
    NS.NODES.tiers.forEach(function (ti) {
      var all = nodes().filter(function (n) { return n.tier === ti.id; });
      tierCleared[ti.id] = all.length > 0 && all.every(function (n) { return isCleared(n.id); });
    });
    NS.NODES.meta.modules.forEach(function (m) {
      var all = nodes().filter(function (n) { return n.module === m.id; });
      moduleCleared[m.id] = all.length > 0 && all.every(function (n) { return isCleared(n.id); });
    });
    return {
      totalAnswered: state.stats.answered,
      totalCorrect: state.stats.correct,
      maxCombo: state.stats.maxCombo,
      streak: state.streak || 0,
      perfectCount: state.stats.perfectCount,
      clearedCount: Object.keys(state.cleared).length,
      tierCleared: tierCleared,
      moduleCleared: moduleCleared,
      wrongCleaned: state.wrongCleanedFlag,
      level: levelInfo(state.xp).level,
      // 掌握度相关（供成就判定）
      solidNodes: _ms.solid,
      weakNodes: _ms.weak,
      bestRunRate: state.bestRunRate || 0,
      bestRunCombo: state.bestRunCombo || 0,
      maxWrongTimes: _maxWrongTimes
    };
  }

  function checkAchievements() {
    var ctx = snapshot(), gained = [];
    NS.ACHIEVEMENTS.forEach(function (a) {
      if (state.achievements[a.id]) return;
      var ok = false;
      try { ok = a.check(ctx); } catch (e) { ok = false; }
      if (ok) { state.achievements[a.id] = Date.now(); gained.push(a); }
    });
    if (gained.length) save();
    return gained;
  }

  function achievements() {
    return NS.ACHIEVEMENTS.map(function (a) {
      return Object.assign({}, a, { got: !!state.achievements[a.id], ts: state.achievements[a.id] || 0 });
    });
  }

  /* ---------------- 订阅 / 重置 ---------------- */
  function subscribe(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(function (fn) { try { fn(state); } catch (e) {} }); }

  function reset() {
    state = JSON.parse(JSON.stringify(DEFAULTS));
    save(); emit();
  }

  /** 用外部数据整体替换存档（云端同步「下载」用）：先与 DEFAULTS 合并，避免缺字段 */
  function replace(obj) {
    var st = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), obj || {});
    st.v = VERSION;
    state = st;
    save(); emit();
  }

  function raw() { return state; }

  NS.Store = {
    levelInfo: levelInfo,
    unlocked: unlocked,
    isCleared: isCleared,
    nodeById: nodeById,
    recordAnswer: recordAnswer,
    streak: streak,
    mastery: mastery,
    masteryAll: masteryAll,
    masterySummary: masterySummary,
    weakestNodes: weakestNodes,
    records: records,
    finishNode: finishNode,
    addXp: addXp,
    openLoot: openLoot,
    lootStats: lootStats,
    storySeen: storySeen,
    markStory: markStory,
    wrongList: wrongList,
    wrongCount: wrongCount,
    resolveWrong: resolveWrong,
    cleanAllWrong: cleanAllWrong,
    achievements: achievements,
    checkAchievements: checkAchievements,
    snapshot: snapshot,
    subscribe: subscribe,
    reset: reset,
    replace: replace,
    raw: raw,
    PASS_RATE: PASS_RATE
  };
})(window.HNSF829);
