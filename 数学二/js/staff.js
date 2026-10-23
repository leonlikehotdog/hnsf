/* ============================================================
 * 302 数学二 · 如意金箍棒（考点总览）
 * ------------------------------------------------------------
 * 按 H 召唤：
 *   Tab1 考点地图 —— 按章节分卡片；每个考点左边是守关人的像素小人，
 *        已通关 = 原色，未通关 = 灰度。
 *   Tab2 题库总览 —— 左侧章节/考点树，右侧只读题目与选项；
 *        每题右上角可收藏、可标记「已掌握」，下方是本题笔记（与存档同步）。
 *
 * 数据全部来自现有模块：NS.NODES / NS.Q / NS.HNSF829_ZT / NS.Store / NS.World。
 * 不复制题库、不改存档结构，只增加 fav / mastered 两个标记。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var PAGE = 24;

  var el = {};
  var tab = 'map';
  var scope = { type: 'chap', id: '' };
  var shown = PAGE;
  var filter = { note: false, mas: false };  // Tab2 筛选：有笔记 / 已掌握
  var openChaps = {};                        // 章节是否展开（默认全部展开）

  var NODES = [], CHAPS = [], MODULES = [], BANK = [], ZT = { qs: [] };
  var nodeById = {}, chapById = {}, nodesByChap = {}, qByNode = {}, ztByNode = {};
  var noteTimer = 0;

  /* ---------------- 小工具 ---------------- */
  function $(s) { return document.querySelector(s); }
  function store() { return NS.Store; }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function txt(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------------- 数据索引 ---------------- */
  function buildIndex() {
    NODES = (NS.NODES && NS.NODES.nodes) || [];
    CHAPS = (NS.NODES && NS.NODES.meta && NS.NODES.meta.chapters) || [];
    MODULES = (NS.NODES && NS.NODES.meta && NS.NODES.meta.modules) || [];
    BANK = NS.Q || window.HNSF829_Q || [];
    ZT = window.HNSF829_ZT || { qs: [] };

    nodeById = {}; chapById = {}; nodesByChap = {}; qByNode = {}; ztByNode = {};
    NODES.forEach(function (n) {
      nodeById[n.id] = n;
      (nodesByChap[n.chap] = nodesByChap[n.chap] || []).push(n);
    });
    CHAPS.forEach(function (c) { chapById[c.id] = c; });
    BANK.forEach(function (q) {
      if (q && q.node) (qByNode[q.node] = qByNode[q.node] || []).push(q);
    });
    (ZT.qs || []).forEach(function (q) {
      (q.zt || []).forEach(function (pid) {
        (ztByNode[pid] = ztByNode[pid] || []).push(q);
      });
    });
  }

  function qsOfNode(id) {
    return (qByNode[id] || []).concat(ztByNode[id] || []);
  }

  function qsOfChap(id) {
    var out = [], seen = {};
    (nodesByChap[id] || []).forEach(function (n) {
      qsOfNode(n.id).forEach(function (q) {
        if (!q || !q.id || seen[q.id]) return;
        seen[q.id] = 1;
        out.push(q);
      });
    });
    return out;
  }

  function scopeQs() {
    return scope.type === 'node' ? qsOfNode(scope.id) : qsOfChap(scope.id);
  }

  /* ---------------- Tab2 筛选 ---------------- */
  function filterOn() { return filter.note || filter.mas; }
  function passFilter(q) {
    if (filter.note && !store().noteGet(q.id)) return false;
    if (filter.mas && !store().isMastered(q.id)) return false;
    return true;
  }
  function matchCount(list) { return list.filter(passFilter).length; }

  function qNodeName(q) {
    var nid = q.node || (q.zt && q.zt[0]);
    var n = nodeById[nid];
    return n ? n.name : '';
  }

  /* ---------------- 像素头像 ---------------- */
  function drawAvatars(root) {
    var list = root.querySelectorAll('canvas[data-node], canvas[data-ava]');
    for (var i = 0; i < list.length; i++) {
      var cv = list[i];
      var nid = cv.dataset.node || cv.dataset.ava;
      var spec = NS.World && NS.World.nodeSpec ? NS.World.nodeSpec(nid) : null;
      if (!spec || !NS.World.previewSprite) continue;
      var img = NS.World.previewSprite(spec, 'down');
      var W = cv.clientWidth || 38, H = cv.clientHeight || 48;
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      var g = cv.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      g.imageSmoothingEnabled = false;
      var lw = img.width / 2, lh = img.height / 2;
      var s = Math.min(W / lw, H / lh);
      g.drawImage(img, (W - lw * s) / 2, H - lh * s, lw * s, lh * s);
    }
  }

  /* ---------------- Tab1：考点地图 ---------------- */
  function mapHtml() {
    var total = NODES.filter(function (n) { return !n.wip; }).length;
    var cleared = NODES.filter(function (n) { return store().isCleared(n.id); }).length;
    var pct = total ? Math.round(cleared / total * 100) : 0;
    var head = '<div class="st-sum">' +
      '<div class="st-sum-main"><b>' + cleared + '</b><span>/ ' + total + ' 考点已通关</span></div>' +
      '<div class="st-sum-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="st-sum-chips">' +
        '<span>⭐ 收藏 ' + store().favCount() + '</span>' +
        '<span>✓ 已掌握 ' + store().masteredCount() + '</span>' +
        '<span>📒 笔记 ' + store().noteCount() + '</span>' +
      '</div></div>';

    var body = MODULES.map(function (m) {
      var chs = CHAPS.filter(function (c) { return c.module === m.id; });
      if (!chs.length) return '';
      return '<div class="st-mod">' +
        '<div class="st-mod-h"><i style="background:' + m.color + '"></i>' + esc(m.name) +
          '<span>' + esc(m.share || '') + '</span></div>' +
        '<div class="st-chaps">' + chs.map(chapCard).join('') + '</div>' +
      '</div>';
    }).join('');

    return '<div class="st-map">' + head + body + '</div>';
  }

  function chapCard(c) {
    var nodes = nodesByChap[c.id] || [];
    var done = nodes.filter(function (n) { return store().isCleared(n.id); }).length;
    var pct = nodes.length ? Math.round(done / nodes.length * 100) : 0;
    return '<section class="st-chap">' +
      '<header class="st-chap-h"><b>第 ' + c.no + ' 章 · ' + esc(c.name) + '</b>' +
        '<span>' + done + ' / ' + nodes.length + '</span></header>' +
      '<div class="st-chap-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="st-nodes">' + nodes.map(nodeRow).join('') + '</div>' +
    '</section>';
  }

  function nodeRow(n) {
    var cleared = store().isCleared(n.id);
    var qn = qsOfNode(n.id).length;
    return '<button class="st-node' + (cleared ? ' ok' : '') + (n.wip ? ' wip' : '') + '" ' +
      'data-jump="' + n.id + '" type="button" title="查看该考点的题目">' +
      '<canvas class="st-ava" data-node="' + n.id + '"></canvas>' +
      '<span class="st-node-b"><b>' + esc(n.name) + '</b><i>' +
        (n.wip ? '题库建设中' : (cleared ? '已通关' : '未通关')) + ' · ' + qn + ' 题</i></span>' +
    '</button>';
  }

  /* ---------------- Tab2：题库总览 ---------------- */
  function quizHtml() {
    return '<div class="st-quiz">' +
      '<aside class="st-tree" id="stTree">' + treeHtml() + '</aside>' +
      '<div class="st-qcol">' +
        '<div class="st-filters" id="stFilters"></div>' +
        '<section class="st-qwrap" id="stQwrap"></section>' +
      '</div>' +
    '</div>';
  }

  function filtersHtml() {
    var all = scopeQs();
    var nNote = all.filter(function (q) { return !!store().noteGet(q.id); }).length;
    var nMas = all.filter(function (q) { return store().isMastered(q.id); }).length;
    return '<span class="st-f-lbl">筛选</span>' +
      '<button class="st-chip' + (filter.note ? ' on' : '') + '" data-filter="note" type="button">' +
        '📒 有笔记<em>' + nNote + '</em></button>' +
      '<button class="st-chip' + (filter.mas ? ' on' : '') + '" data-filter="mas" type="button">' +
        '✓ 已掌握<em>' + nMas + '</em></button>' +
      (filterOn() ? '<button class="st-chip clear" data-filter="clear" type="button">清除筛选</button>'
        : '<span class="st-f-tip">可多选，同时开启取交集</span>');
  }

  function treeHtml() {
    return CHAPS.map(function (c) {
      var nodes = nodesByChap[c.id] || [];
      var open = openChaps[c.id] !== false;
      var onChap = scope.type === 'chap' && scope.id === c.id;
      var all = qsOfChap(c.id);
      var cntChap = filterOn() ? matchCount(all) : all.length;

      return '<div class="st-tchap' + (open ? ' open' : '') + '">' +
        '<button class="st-trow chap' + (onChap ? ' on' : '') + '" data-chap="' + c.id + '" type="button">' +
          '<i data-fold="' + c.id + '">▸</i><b>第' + c.no + '章 ' + esc(c.name) + '</b>' +
          '<em>' + cntChap + (filterOn() ? '/' + all.length : '') + '</em></button>' +
        '<div class="st-tnodes">' + nodes.map(nodeTreeRow).join('') + '</div>' +
      '</div>';
    }).join('');
  }

  function nodeTreeRow(n) {
    var cleared = store().isCleared(n.id);
    var list = qsOfNode(n.id);
    var cnt = filterOn() ? matchCount(list) : list.length;
    var dim = filterOn() && cnt === 0;
    var on = scope.type === 'node' && scope.id === n.id;
    // ⚠️ 类名别用 node：地图上的 .node 是绝对定位的球，会把这行吸到屏幕外
    return '<button class="st-trow nd' + (on ? ' on' : '') + (cleared ? ' ok' : '') +
      (dim ? ' dim' : '') + '" data-node="' + n.id + '" type="button" ' +
      'title="' + esc(n.name) + ' · ' + list.length + ' 题">' +
      '<canvas class="st-tava" data-ava="' + n.id + '"></canvas>' +
      '<b>' + esc(n.name) + '</b><em>' + cnt + '</em></button>';
  }

  function qCard(q) {
    var fav = store().isFav(q.id);
    var mas = store().isMastered(q.id);
    var note = store().noteGet(q.id) || '';
    var opts = (q.options || []).map(function (o, i) {
      return '<div class="st-opt"><b>' + 'ABCD'[i] + '.</b><span>' + NS.Engine.fmt(o) + '</span></div>';
    }).join('');

    var tags = [];
    if (q.year) tags.push('<i class="y">' + q.year + ' 真题</i>');
    if (q.type) tags.push('<i>' + esc(NS.Engine.TYPE_LABEL[q.type] || q.type) + '</i>');
    if (q.level) tags.push('<i>' + esc(NS.Engine.LEVEL_LABEL[q.level] || ('Lv' + q.level)) + '</i>');
    var nn = qNodeName(q);
    if (nn && scope.type === 'chap') tags.push('<i class="n">' + esc(nn) + '</i>');

    return '<article class="st-q" data-q="' + esc(q.id) + '">' +
      '<div class="st-q-top">' +
        '<div class="st-q-tags">' + tags.join('') + '</div>' +
        '<div class="st-q-acts">' +
          '<button class="st-fav' + (fav ? ' on' : '') + '" data-fav="' + esc(q.id) + '" type="button" ' +
            'title="收藏">' + (fav ? '★' : '☆') + '</button>' +
          '<button class="st-mas' + (mas ? ' on' : '') + '" data-mas="' + esc(q.id) + '" type="button">' +
            (mas ? '✓ 已掌握' : '标记掌握') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="st-stem">' + NS.Engine.fmt(q.stem || '') + '</div>' +
      (opts ? '<div class="st-opts">' + opts + '</div>' : '') +
      '<div class="st-note">' +
        '<div class="st-note-h">📒 本题笔记<span>与考点同步 · 自动保存</span></div>' +
        '<textarea class="st-note-input" data-note="' + esc(q.id) + '" rows="2" ' +
          'placeholder="记下这题的坑、关键一步…">' + txt(note) + '</textarea>' +
      '</div>' +
    '</article>';
  }

  function renderQList(keepScroll) {
    var box = document.getElementById('stQwrap');
    if (!box) return;
    var all = scopeQs();
    var list = filterOn() ? all.filter(passFilter) : all;
    var st = keepScroll ? box.scrollTop : 0;
    var c = chapById[scope.id];
    var n = nodeById[scope.id];
    var title = scope.type === 'node' ? (n ? n.name : '') :
      (c ? ('第 ' + c.no + ' 章 · ' + c.name) : '');

    var html = '<div class="st-qhead"><b>' + esc(title) + '</b>' +
      '<span>' + (filterOn() ? ('筛选 ' + list.length + ' / ' + all.length + ' 题') : (all.length + ' 题')) + '</span>' +
      '<i>只展示题干与选项；收藏 / 掌握 / 笔记都会跟着存档同步</i></div>';

    if (!list.length) {
      box.innerHTML = html + '<div class="st-empty">' +
        (filterOn() ? '当前筛选下没有题目。' : '这个范围还没有题目。') + '</div>';
      return;
    }
    html += '<div class="st-qlist">' + list.slice(0, shown).map(qCard).join('') + '</div>';
    if (list.length > shown) {
      html += '<button class="st-more" id="stMore" type="button">加载更多（还有 ' +
        (list.length - shown) + ' 题）</button>';
    }
    box.innerHTML = html;
    if (keepScroll) box.scrollTop = st;
    if (NS.Engine && NS.Engine.renderMath) NS.Engine.renderMath(box);

    var more = document.getElementById('stMore');
    if (more) more.addEventListener('click', function () { shown += PAGE; renderQList(true); });
  }

  /* ---------------- 渲染 ---------------- */
  function render() {
    var body = el.body;
    if (!body) return;
    document.querySelectorAll('.staff-tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.stab === tab);
    });
    if (tab === 'map') {
      body.innerHTML = mapHtml();
      drawAvatars(body);
    } else {
      var oldTree = document.getElementById('stTree');
      var tst = oldTree ? oldTree.scrollTop : 0;
      body.innerHTML = quizHtml();
      var fbox = document.getElementById('stFilters');
      if (fbox) fbox.innerHTML = filtersHtml();
      drawAvatars(body);
      renderQList();
      var newTree = document.getElementById('stTree');
      if (newTree) newTree.scrollTop = tst;
    }
  }

  /* ---------------- 事件 ---------------- */
  function bind() {
    el.mask = document.getElementById('staffMask');
    el.body = document.getElementById('staffBody');
    if (!el.mask) return;

    var btn = document.getElementById('btnStaff');
    if (btn) btn.addEventListener('click', toggle);
    var closeB = document.getElementById('staffClose');
    if (closeB) closeB.addEventListener('click', close);
    el.mask.addEventListener('click', function (e) { if (e.target === el.mask) close(); });

    document.querySelectorAll('.staff-tab').forEach(function (b) {
      b.addEventListener('click', function () {
        tab = b.dataset.stab;
        render();
      });
    });

    el.body.addEventListener('click', function (e) {
      var t = e.target;
      var tabB = t.closest ? t.closest('[data-stab]') : null;
      if (tabB) { tab = tabB.dataset.stab; render(); return; }

      var fB = t.closest ? t.closest('[data-filter]') : null;
      if (fB) {
        var k = fB.dataset.filter;
        if (k === 'clear') { filter.note = false; filter.mas = false; }
        else filter[k] = !filter[k];
        shown = PAGE;
        render();
        return;
      }

      var foldB = t.closest ? t.closest('[data-fold]') : null;
      if (foldB) {
        var cid = foldB.dataset.fold;
        openChaps[cid] = !(openChaps[cid] !== false);
        render();
        return;
      }

      var jump = t.closest ? t.closest('[data-jump]') : null;
      if (jump) {
        tab = 'quiz';
        scope = { type: 'node', id: jump.dataset.jump };
        var jn = nodeById[jump.dataset.jump];
        if (jn) openChaps[jn.chap] = true;
        shown = PAGE;
        render();
        return;
      }
      var chapB = t.closest ? t.closest('[data-chap]') : null;
      if (chapB) {
        var cid2 = chapB.dataset.chap;
        openChaps[cid2] = true;
        scope = { type: 'chap', id: cid2 };
        shown = PAGE;
        render();
        return;
      }
      var nodeB = t.closest ? t.closest('.st-trow.nd') : null;
      if (nodeB) {
        scope = { type: 'node', id: nodeB.dataset.node };
        shown = PAGE;
        render();
        return;
      }
      var favB = t.closest ? t.closest('[data-fav]') : null;
      if (favB) {
        var qid = favB.dataset.fav;
        var on = store().toggleFav(qid);
        favB.classList.toggle('on', on);
        favB.textContent = on ? '★' : '☆';
        return;
      }
      var masB = t.closest ? t.closest('[data-mas]') : null;
      if (masB) {
        var qid2 = masB.dataset.mas;
        var on2 = store().setMastered(qid2, !store().isMastered(qid2));
        if (filter.mas) { render(); return; }   // 筛选开着时，取消掌握就该从列表里消失
        masB.classList.toggle('on', on2);
        masB.textContent = on2 ? '✓ 已掌握' : '标记掌握';
        return;
      }
    });

    // 笔记：输入 0.5 秒后自动落盘；失焦立即落盘
    function saveNote(ta) {
      var before = !!store().noteGet(ta.dataset.note);
      store().noteSet(ta.dataset.note, ta.value);
      // 筛选「有笔记」时清空笔记，这张卡应即时消失
      if (filter.note && before && !ta.value.trim()) render();
    }
    el.body.addEventListener('input', function (e) {
      var ta = e.target;
      if (!ta || !ta.dataset || !ta.dataset.note) return;
      if (noteTimer) clearTimeout(noteTimer);
      noteTimer = setTimeout(function () {
        noteTimer = 0;
        store().noteSet(ta.dataset.note, ta.value);
      }, 500);
    });
    el.body.addEventListener('focusout', function (e) {
      var ta = e.target;
      if (!ta || !ta.dataset || !ta.dataset.note) return;
      if (noteTimer) { clearTimeout(noteTimer); noteTimer = 0; }
      saveNote(ta);
    });

    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === 'h' || e.key === 'H') {
        var battle = document.getElementById('battleMask');
        if (battle && battle.classList.contains('show')) return;
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape' && el.mask.classList.contains('show')) {
        close();
      }
    });
  }

  /* ---------------- 打开 / 关闭 ---------------- */
  function open() {
    if (!el.mask) return;
    buildIndex();
    if (!scope.id) {
      var first = CHAPS[0];
      scope = { type: 'chap', id: first ? first.id : '' };
    }
    el.mask.classList.add('show');
    el.mask.setAttribute('aria-hidden', 'false');
    shown = PAGE;
    render();
  }

  function close() {
    if (!el.mask) return;
    el.mask.classList.remove('show');
    el.mask.setAttribute('aria-hidden', 'true');
  }

  function toggle() {
    if (!el.mask) return;
    if (el.mask.classList.contains('show')) close();
    else open();
  }

  NS.Staff = { open: open, close: close, toggle: toggle };

  function init() { bind(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window.HNSF829);
