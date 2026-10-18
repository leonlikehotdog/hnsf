/* ============================================================
 * 302 数学二 · 背包 / 秘籍 / 公式速查
 * ------------------------------------------------------------
 * 规则：每打赢一个守关人，就从他的「SUMMARY」里夺走一本秘籍。
 *   秘籍内容优先给「难题套路」，其次才是定义与公式 —— 背公式是为了
 *   上手做题，不是背字典。
 * 入口：右上角 🎒 按钮，或按 B 键；Esc / B 关闭。
 * 注意：本文件必须在 data-summary.js、store.js、engine.js 之后加载。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var NODES = (NS.NODES && NS.NODES.nodes) || [];
  var Store = NS.Store;
  var mask = null, listEl = null, detailEl = null;
  var lootMask = null, lootTitle = null, lootSub = null;
  var filter = 'all', currentId = null, currentCheat = 0;
  var newSet = {}, queue = [], lootShowing = false, lootTimer = null;

  /* ============================================================
   * 公式速查：给「难知识点」准备的短卡片，全部用 Unicode 数学符号，
   * 不依赖 KaTeX，扫一眼就能回忆。
   * ============================================================ */
  var CHEATS = [
    {
      name: '求导公式', tag: '高数',
      groups: [
        { h: '基本表', rows: [
          ['(C)′', '0'],
          ['(xⁿ)′', 'n·xⁿ⁻¹'],
          ['(eˣ)′', 'eˣ'], ['(aˣ)′', 'aˣ·ln a'],
          ['(ln x)′', '1/x'], ['(logₐx)′', '1/(x·ln a)'],
          ['(sin x)′', 'cos x'], ['(cos x)′', '−sin x'],
          ['(tan x)′', '1/cos²x'], ['(cot x)′', '−1/sin²x'],
          ['(arcsin x)′', '1/√(1−x²)'], ['(arctan x)′', '1/(1+x²)']
        ] },
        { h: '运算法则', rows: [
          ['(uv)′', 'u′v + uv′'],
          ['(u/v)′', '(u′v − uv′)/v²'],
          ['复合 y=f(u), u=g(x)', 'y′ = f′(u)·g′(x)'],
          ['参数方程', 'dy/dx = y′ₜ/x′ₜ'],
          ['参数方程二阶', 'd²y/dx² = (y″ₜx′ₜ − y′ₜx″ₜ)/(x′ₜ)³'],
          ['反函数', 'dx/dy = 1/(dy/dx)']
        ] }
      ]
    },
    {
      name: '积分公式', tag: '高数',
      groups: [
        { h: '基本表', rows: [
          ['∫xⁿdx', 'xⁿ⁺¹/(n+1) + C　(n≠−1)'],
          ['∫dx/x', 'ln|x| + C'],
          ['∫eˣdx', 'eˣ + C'], ['∫aˣdx', 'aˣ/ln a + C'],
          ['∫sin x dx', '−cos x + C'], ['∫cos x dx', 'sin x + C'],
          ['∫dx/cos²x', 'tan x + C'], ['∫dx/(1+x²)', 'arctan x + C'],
          ['∫dx/√(1−x²)', 'arcsin x + C']
        ] },
        { h: '三大手法', rows: [
          ['分部', '∫u dv = uv − ∫v du'],
          ['选 u 口诀', '反对幂指三（谁在后面谁当 v）'],
          ['换元', '∫f(φ(x))φ′(x)dx = ∫f(u)du'],
          ['变限求导', 'd/dx∫ₐ₍ₓ₎ᵇ⁽ˣ⁾f(t)dt = f(b)b′ − f(a)a′'],
          ['对称区间', '奇函数 = 0；偶函数 = 2∫₀ᵃf']
        ] }
      ]
    },
    {
      name: '泰勒展开', tag: '高数',
      groups: [
        { h: 'x → 0（背到三阶就够绝大多数题）', rows: [
          ['eˣ', '1 + x + x²/2! + x³/3! + o(x³)'],
          ['sin x', 'x − x³/3! + x⁵/5! + o(x⁵)'],
          ['cos x', '1 − x²/2! + x⁴/4! + o(x⁴)'],
          ['ln(1+x)', 'x − x²/2 + x³/3 + o(x³)'],
          ['(1+x)^α', '1 + αx + α(α−1)x²/2! + o(x²)'],
          ['1/(1−x)', '1 + x + x² + x³ + o(x³)'],
          ['tan x', 'x + x³/3 + o(x³)'],
          ['arctan x', 'x − x³/3 + o(x³)']
        ] },
        { h: '用法', rows: [
          ['求极限', '上下同阶展开，分母到几阶，分子就展开到几阶'],
          ['判阶', '最低非零次幂 = 无穷小的阶'],
          ['不等式', '带拉格朗日余项，用余项符号定方向']
        ] }
      ]
    },
    {
      name: '极值 · 拐点', tag: '高数',
      groups: [
        { h: '判定流程', rows: [
          ['嫌疑点', 'f′=0 或 f′ 不存在的点'],
          ['一阶判别', 'f′ 左正右负 → 极大；左负右正 → 极小'],
          ['不变号', 'f′ 两侧同号 → 不是极值'],
          ['二阶判别', 'f′=0 且 f″<0 → 极大；f″>0 → 极小'],
          ['失效情形', 'f″=0 时回到一阶判别，别直接下结论'],
          ['拐点嫌疑', 'f″=0 或 f″ 不存在的点'],
          ['拐点确认', 'f″ 在 x₀ 两侧变号才是拐点']
        ] },
        { h: '最值与渐近线', rows: [
          ['闭区间最值', '驻点 + 不可导点 + 端点，全部代进去比'],
          ['水平渐近', 'lim f(x) = b'],
          ['垂直渐近', 'lim f(x) = ∞'],
          ['斜渐近', 'k = lim f/x，b = lim(f − kx)']
        ] }
      ]
    },
    {
      name: '等价无穷小', tag: '高数',
      groups: [
        { h: 'x → 0', rows: [
          ['一阶', 'sin x ~ tan x ~ arcsin x ~ arctan x ~ x'],
          ['二阶', '1 − cos x ~ x²/2'],
          ['指数对数', 'eˣ − 1 ~ x；ln(1+x) ~ x'],
          ['幂型', '(1+x)^α − 1 ~ αx'],
          ['三阶', 'x − sin x ~ x³/6；tan x − x ~ x³/3']
        ] },
        { h: '红线', rows: [
          ['只能乘除替换', '加减里直接替换十有八九出错'],
          ['加减怎么办', '先通分、提公因式、有理化，再替换'],
          ['阶数不匹配', '分子分母展开到同阶再约分']
        ] }
      ]
    },
    {
      name: '中值定理', tag: '高数',
      groups: [
        { h: '三个定理', rows: [
          ['罗尔', '闭连续 + 开可导 + f(a)=f(b) → ∃ξ, f′(ξ)=0'],
          ['拉格朗日', 'f(b) − f(a) = f′(ξ)(b − a)'],
          ['柯西', '[f(b)−f(a)]/[g(b)−g(a)] = f′(ξ)/g′(ξ)'],
          ['积分中值', '∃ξ∈[a,b]，∫ₐᵇf = f(ξ)(b−a)']
        ] },
        { h: '构造套路（看到就套）', rows: [
          ['f′ + kf', '乘 e^{kx} 构造辅助函数'],
          ['ξf′ + f', '乘 x（就是 (xf)′）'],
          ['f′/f', '先取 ln 再求导'],
          ['要证两个点', '先在子区间用一次，再整体用一次']
        ] }
      ]
    },
    {
      name: '线代核心', tag: '线代',
      groups: [
        { h: '行列式与秩', rows: [
          ['转置 / 数乘', '|Aᵀ|=|A|；|kA|=kⁿ|A|'],
          ['乘法', '|AB|=|A||B|；但 |A+B|≠|A|+|B|'],
          ['逆', '|A⁻¹|=1/|A|'],
          ['秩', 'r(A)=r(Aᵀ)=r(AᵀA)'],
          ['秩不等式', 'r(AB) ≤ min{r(A), r(B)}'],
          ['可逆', '|A|≠0 ⇔ r(A)=n ⇔ Ax=0 只有零解']
        ] },
        { h: '方程组与特征值', rows: [
          ['Ax=b', 'r(A)=r(A|b) 有解；= n 唯一；< n 无穷多'],
          ['特征值之和', 'Σλᵢ = tr A'],
          ['特征值之积', 'Πλᵢ = |A|'],
          ['可对角化', '有 n 个线性无关特征向量'],
          ['实对称', '一定可以正交对角化'],
          ['正定', '顺序主子式全 >0 ⇔ 特征值全 >0']
        ] }
      ]
    },
    {
      name: '二重积分 · 微分方程', tag: '高数',
      groups: [
        { h: '二重积分', rows: [
          ['极坐标', 'dxdy = r dr dθ；x=r cosθ, y=r sinθ'],
          ['交换次序', '先画区域，再重新定内外限'],
          ['对称性', '关于 x 轴对称：看 y 的奇偶'],
          ['轮换对称', '区域关于 y=x 对称时，可互换 x、y']
        ] },
        { h: '常微分方程', rows: [
          ['可分离', '∫dy/g(y) = ∫f(x)dx'],
          ['一阶线性', 'y′+P(x)y=Q(x)'],
          ['通解', 'y = e^{−∫P}(∫Q e^{∫P}dx + C)'],
          ['二阶齐次', 'r²+pr+q=0：两实根 / 重根 / 共轭复根'],
          ['二阶非齐次', '特解形式按右端 f(x) 的类型设']
        ] }
      ]
    }
  ];

  /* ============================================================
   * 数据：从 SUMMARY 生成一本秘籍
   * ============================================================ */
  function chapterOf(id) {
    var list = (NS.NODES && NS.NODES.meta.chapters) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function charNameOf(n) {
    var m = NS.Monsters && NS.Monsters.forNode ? NS.Monsters.forNode(n.id) : null;
    return (m && m.name) || '';
  }

  function tierName(t) {
    return t === 3 ? '创新 · 神兵' : t === 2 ? '综合 · 长剑' : '基础 · 短兵';
  }

  function manualFor(n) {
    var S = (NS.SUMMARY || {})[n.id] || {};
    return {
      id: n.id,
      node: n,
      name: n.name,
      tier: n.tier,
      chapter: chapterOf(n.chap),
      char: charNameOf(n),
      intro: S.intro || n.desc || '',
      must: (S.must || n.points || []).slice(0, 4),
      formulas: (S.formulas || []).slice(0, 4),
      patterns: (S.patterns || []).slice(0, 4),
      pitfalls: (S.pitfalls || []).slice(0, 3)
    };
  }

  function collected() {
    return NODES.filter(function (n) { return Store.isCleared(n.id); }).map(manualFor);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ============================================================
   * 背包渲染
   * ============================================================ */
  function render() {
    if (!listEl || !detailEl) return;
    if (filter === 'cheat') { renderCheats(); return; }
    var items = collected().filter(function (m) {
      return filter === 'all' || m.node.module === filter;
    });
    if (!items.length) {
      listEl.innerHTML = '<div class="bag-empty">背包里还没有秘籍。<br>去世界里挑一个人，打赢他。</div>';
      detailEl.innerHTML = '<div class="bag-detail-empty">🗡️ 每本秘籍都记着一个考点的破题套路与易错点。</div>';
      return;
    }
    if (!items.some(function (m) { return m.id === currentId; })) currentId = items[0].id;
    listEl.innerHTML = '<div class="bag-count">共 ' + items.length + ' 本</div>' +
      items.map(function (m) {
        var isNew = !!newSet[m.id];
        return '<button class="bag-item t' + m.tier + (m.id === currentId ? ' active' : '') + '" data-book="' + m.id + '">' +
          '<span class="bag-book">📖</span>' +
          '<span class="bag-item-body">' +
            '<b>' + esc(m.name) + '</b>' +
            '<em>' + (m.chapter ? '第 ' + m.chapter.no + ' 章 · ' + esc(m.chapter.name) : '') + '</em>' +
          '</span>' +
          (isNew ? '<span class="bag-new">NEW</span>' : '') +
        '</button>';
      }).join('');
    detailEl.innerHTML = manualHtml(items.filter(function (m) { return m.id === currentId; })[0]);
    renderMath(detailEl);
  }

  function manualHtml(m) {
    var out = '<div class="book-head t' + m.tier + '">' +
      '<div class="book-kicker">' + (m.char ? esc(m.char) + ' 的秘籍' : '秘籍') + ' · ' + tierName(m.tier) + '</div>' +
      '<div class="book-title">《' + esc(m.name) + '》</div>' +
      '<div class="book-sub">' + (m.chapter ? '第 ' + m.chapter.no + ' 章 · ' + esc(m.chapter.name) : '') + '</div>' +
    '</div>';
    if (m.intro) out += '<div class="book-intro">' + esc(m.intro) + '</div>';

    // 先给套路：这才是「难题怎么下手」的部分
    if (m.patterns && m.patterns.length) {
      out += '<div class="book-sec"><div class="book-h">🧭 破题套路</div>' +
        m.patterns.map(function (p) {
          return '<div class="book-pat"><b>' + esc(p.q) + '</b><span>' + esc(p.how) + '</span></div>';
        }).join('') + '</div>';
    }
    if (m.formulas && m.formulas.length) {
      out += '<div class="book-sec"><div class="book-h">📐 必背公式</div><ul>' +
        m.formulas.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></div>';
    }
    if (m.must && m.must.length) {
      out += '<div class="book-sec"><div class="book-h">📌 知识要点</div><ul>' +
        m.must.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    }
    if (m.pitfalls && m.pitfalls.length) {
      out += '<div class="book-sec"><div class="book-h">⚠️ 高频易错</div><ul>' +
        m.pitfalls.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    }
    out += '<div class="book-foot">已收入背包 · 随时回看</div>';
    return out;
  }

  function renderCheats() {
    listEl.innerHTML = '<div class="bag-count">公式速查</div>' + CHEATS.map(function (c, i) {
      return '<button class="bag-item cheat' + (i === currentCheat ? ' active' : '') + '" data-cheat="' + i + '">' +
        '<span class="bag-book">📜</span>' +
        '<span class="bag-item-body"><b>' + esc(c.name) + '</b><em>' + esc(c.tag) + ' · 速查</em></span>' +
      '</button>';
    }).join('');
    var c = CHEATS[currentCheat] || CHEATS[0];
    detailEl.innerHTML = '<div class="book-head cheat-head">' +
      '<div class="book-kicker">公式速查</div>' +
      '<div class="book-title">' + esc(c.name) + '</div>' +
      '<div class="book-sub">考场上想起来就够用的版本</div>' +
    '</div>' + c.groups.map(function (g) {
      return '<div class="book-sec"><div class="book-h">' + esc(g.h) + '</div><div class="cheat-rows">' +
        g.rows.map(function (r) {
          return '<div class="cheat-row"><span class="cheat-k">' + esc(r[0]) + '</span><span class="cheat-v">' + esc(r[1]) + '</span></div>';
        }).join('') + '</div></div>';
    }).join('');
  }

  function renderMath(el) {
    if (NS.Engine && NS.Engine.renderMath) {
      try { NS.Engine.renderMath(el); } catch (e) { /* 公式渲染失败就保留原文 */ }
    }
  }

  /* ============================================================
   * 开关
   * ============================================================ */
  function open(nodeId) {
    mask.classList.add('show');
    mask.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    if (nodeId) {
      currentId = nodeId;
      delete newSet[nodeId];
    } else if (!currentId) {
      var all = collected();
      if (all.length) currentId = all[0].id;
    }
    if (!Store.isCleared(currentId)) {
      var all2 = collected();
      currentId = all2.length ? all2[0].id : null;
    }
    filter = currentId ? (filter === 'cheat' ? 'all' : filter) : filter;
    syncTabs();
    render();
  }

  function close() {
    if (!mask) return;
    mask.classList.remove('show');
    mask.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function isOpen() { return !!(mask && mask.classList.contains('show')); }

  function syncTabs() {
    var tabs = document.querySelectorAll('.bag-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].dataset.bag === filter);
    }
  }

  /* ============================================================
   * 获得秘籍：战斗结算后弹一张「战利品」卡
   * ============================================================ */
  function award(node) {
    if (!node || !Store.isCleared(node.id)) return;
    newSet[node.id] = true;
    if (queue.indexOf(node.id) < 0) queue.push(node.id);
    refreshBadge();
    scheduleLoot();
  }

  function uiBusy() {
    var ids = ['battleMask', 'nodeDetail', 'storyMask', 'masterMask', 'hlMask', 'panel', 'bagMask'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.classList.contains('show')) return true;
    }
    return false;
  }

  function scheduleLoot() {
    if (lootTimer) return;
    var tries = 0;
    lootTimer = setInterval(function () {
      tries++;
      if (!queue.length || lootShowing) { clearInterval(lootTimer); lootTimer = null; return; }
      if (uiBusy()) {
        if (tries > 200) { clearInterval(lootTimer); lootTimer = null; }
        return;
      }
      clearInterval(lootTimer); lootTimer = null;
      showLoot();
    }, 600);
  }

  function showLoot() {
    if (!queue.length || !lootMask) return;
    var id = queue[0];
    var n = Store.nodeById(id);
    if (!n) { queue.shift(); showLoot(); return; }
    lootShowing = true;
    delete newSet[id];
    lootTitle.textContent = '《' + n.name + '》';
    var ch = chapterOf(n.chap);
    var who = charNameOf(n);
    lootSub.textContent = (who ? who + ' 的压箱底' : '') +
      (ch ? '　·　第 ' + ch.no + ' 章' : '');
    lootMask.classList.add('show');
    lootMask.setAttribute('aria-hidden', 'false');
    lootMask.dataset.node = id;
    render();
  }

  function closeLoot(openBag) {
    if (!lootMask) return;
    var id = lootMask.dataset.node;
    lootMask.classList.remove('show');
    lootMask.setAttribute('aria-hidden', 'true');
    lootShowing = false;
    queue.shift();
    if (openBag && id) {
      open(id);
    } else if (queue.length) {
      setTimeout(showLoot, 450);
    }
  }

  function refreshBadge() {
    var el = document.getElementById('hudBag');
    if (el) el.textContent = collected().length;
  }

  /* ============================================================
   * 初始化
   * ============================================================ */
  function init() {
    mask = document.getElementById('bagMask');
    listEl = document.getElementById('bagList');
    detailEl = document.getElementById('bagDetail');
    lootMask = document.getElementById('lootMask');
    lootTitle = document.getElementById('lootTitle');
    lootSub = document.getElementById('lootSub');
    if (!mask || !Store) return;

    document.getElementById('bagClose').addEventListener('click', close);
    document.getElementById('btnBag').addEventListener('click', function () {
      if (isOpen()) close(); else open();
    });
    mask.addEventListener('click', function (e) {
      if (e.target === mask) close();
    });
    document.getElementById('lootOk').addEventListener('click', function () { closeLoot(false); });
    document.getElementById('lootOpen').addEventListener('click', function () { closeLoot(true); });

    Array.prototype.forEach.call(document.querySelectorAll('.bag-tab'), function (tab) {
      tab.addEventListener('click', function () {
        filter = tab.dataset.bag;
        syncTabs();
        render();
      });
    });
    listEl.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-book],[data-cheat]') : null;
      if (!b) return;
      if (b.dataset.cheat != null) {
        currentCheat = parseInt(b.dataset.cheat, 10) || 0;
      } else {
        currentId = b.dataset.book;
        delete newSet[currentId];
      }
      render();
    });

    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;
      var k = (e.key || '').toLowerCase();
      if (k === 'escape' && isOpen()) { close(); return; }
      if (k !== 'b' || e.repeat) return;
      if (isOpen()) { close(); e.preventDefault(); return; }
      var busy = document.querySelector('#battleMask.show, #storyMask.show, #masterMask.show, #hlMask.show, #lootMask.show, #nodeDetail.show, #panel.show, #gearMask.show');
      if (busy) return;
      open();
      e.preventDefault();
    });

    // 初次进入：把已有存档记为「已知」，不给旧进度补弹窗
    var known = {};
    var cleared = (Store.raw() && Store.raw().cleared) || {};
    Object.keys(cleared).forEach(function (id) { known[id] = true; });
    Store.subscribe(function () {
      var cur = (Store.raw() && Store.raw().cleared) || {};
      Object.keys(cur).forEach(function (id) {
        if (!known[id]) {
          known[id] = true;
          var n = Store.nodeById(id);
          if (n) award(n);
        }
      });
      refreshBadge();
    });
    refreshBadge();
  }

  NS.BAG = {
    init: init,
    open: open,
    close: close,
    award: award,
    refreshBadge: refreshBadge,
    manualFor: manualFor
  };
})(window.HNSF829);
