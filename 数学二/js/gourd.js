/* ============================================================
 * 302 数学二 · 葫芦法宝（每日复盘）
 * ------------------------------------------------------------
 * 设计（已与用户确认）：
 *   · 每天成熟一炉；错题优先，不足 5 题从「掌握度最低的考点」补题。
 *   · 完成一炉给皮肤碎片：全对 3 片，否则 2 片；每天最多一炉。
 *   · 复盘只更新掌握度 / 错题本，不动通关记录与 XP，所以不会刷分。
 * 入口：世界里的葫芦（点击）或按 R。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var Store = NS.Store;
  var BANK = NS.Q || window.HNSF829_Q || [];
  var NODES = (NS.NODES && NS.NODES.nodes) || [];
  var QN = 5;                                  // 一炉题量
  var qById = {};
  BANK.forEach(function (q) { qById[q.id] = q; });

  function nodeOf(id) {
    for (var i = 0; i < NODES.length; i++) if (NODES[i].id === id) return NODES[i];
    return null;
  }

  function isReady() { return !!(Store && Store.gourdMature()); }

  function fragments() { return Store.gear().fragments; }

  function statusText() {
    if (!Store) return '';
    var g = Store.gourd();
    if (isReady()) return g.total ? '今日可炼 · 已炼 ' + g.total + ' 炉' : '今日可炼 · 第一炉';
    return '今日已炼 · 明日再来';
  }

  /** 组一炉题：到期错题优先，其次最弱考点，最后从已解锁考点兜底 */
  function buildQuestions() {
    var picked = [], seen = {};
    function add(q) {
      if (!q || picked.length >= QN || seen[q.id]) return;
      seen[q.id] = 1;
      picked.push(q);
    }

    // 1) 今天到期的错题
    var ready = Store.hlQueue(8).ready || [];
    for (var i = 0; i < ready.length && picked.length < QN; i++) {
      add(qById[ready[i]]);
    }

    // 2) 最弱考点补题（每个考点最多 2 题，优先低正确率）
    var weak = Store.weakestNodes(24);
    for (var w = 0; w < weak.length && picked.length < QN; w++) {
      var pool = BANK.filter(function (q) { return q.node === weak[w].node.id; });
      for (var p = 0; p < pool.length && p < 2 && picked.length < QN; p++) add(pool[p]);
    }

    // 3) 兜底：已解锁考点（基础层优先），保证第一次打开葫芦也有题
    if (picked.length < QN) {
      var open = NODES.filter(function (n) {
        return !n.wip && Store.unlocked(n).ok;
      }).sort(function (a, b) {
        if (a.tier !== b.tier) return a.tier - b.tier;
        return b.weight - a.weight;
      });
      for (var o = 0; o < open.length && picked.length < QN; o++) {
        var pool2 = BANK.filter(function (q) { return q.node === open[o].id; });
        for (var k = 0; k < pool2.length && picked.length < QN; k++) add(pool2[k]);
      }
    }

    // 4) 再兜底：题库里的任意题（极少走到）
    for (var b = 0; b < BANK.length && picked.length < QN; b++) add(BANK[b]);
    return picked;
  }

  function open() {
    if (!Store) return;
    if (!isReady()) {
      if (NS.Engine) NS.Engine.toast('🍐 葫芦还没熟：今天已经炼过一炉，明天再来');
      return;
    }
    var qs = buildQuestions();
    if (!qs.length) {
      if (NS.Engine) NS.Engine.toast('题库还没有可复盘的题');
      return;
    }
    var firstNode = qs[0] && qs[0].node ? nodeOf(qs[0].node) : null;
    var gourdNode = {
      id: 'gourd',
      name: '葫芦复盘 · 今日一炉',
      icon: '🍐',
      chap: firstNode ? firstNode.chap : '',
      module: firstNode ? firstNode.module : 'gs',
      tier: 1,
      weight: 0
    };
    NS.Engine.open({
      node: gourdNode,
      questions: qs,
      mode: 'gourd',
      onExit: function () {
        if (NS.World) NS.World.refresh();
      }
    });
  }

  function init() {
    // 状态全部实时从 Store 读，无需额外初始化
  }

  NS.Gourd = {
    init: init,
    open: open,
    isReady: isReady,
    statusText: statusText,
    fragments: fragments,
    buildQuestions: buildQuestions
  };
})(window.HNSF829);
