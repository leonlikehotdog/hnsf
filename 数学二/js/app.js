/* ============================================================
 * 302 数学二 闯关系统 · 主控（HUD / 考点节点地图 / 面板）
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var NODES = NS.NODES.nodes;
  var MODULES = NS.NODES.meta.modules;
  var Store = NS.Store;
  var Engine = NS.Engine;
  var BANK = NS.Q || window.HNSF829_Q || [];

  var resizeTimer = null;
  var lastOrbs = -1;                          // 上一颗龙珠进度，用于判定"新点亮"
  var themeOn = true;
  // 主题 / 背景图偏好故意沿用 829 的 key：两门课同域，换科目不用重设外观
  var THEME_KEY = 'hnsf829_theme_v1';
  var BG_KEY = 'hnsf829_bgimg_v1';            // 是否启用自定义背景图
  var LP_KEY = 'hnsf302_lowpower_v1';         // 低功耗模式（治手机发热；fx.js 读同一 key）
  var bgImgOn = false;
  var lpOn = false;
  // 七龙珠：把「全部考点」均分成 7 档，第 7 颗 = 全部通关
  // （节点数从 21 涨到 69，不能再写死「每 3 个一颗」，否则 23 颗龙珠都点不完）
  var ORB_TOTAL = NODES.length;
  function orbThreshold(i) { return Math.ceil(i * ORB_TOTAL / 7); }

  /** 节点对应的龙珠角色头像地址（monsters.js 未加载时返回 ''，调用方回退原 emoji） */
  function avatarUrl(nodeId) {
    var M = NS.Monsters;
    if (!M || !M.dir) return '';
    var m = M.forNode(nodeId);
    return m ? M.dir + m.file : '';
  }

  /* ================= 真题关（母考点旁的「卫星徽标」） =================
   * 设计约定（与需求一一对应）：
   *   · 形态：每个考点球右上角挂一颗小「真」球，短线相连。不动现有三层列布局。
   *   · 解锁：母考点通关（Store.isCleared(parent)）才点亮 —— 反复强调的「循序渐进」。
   *   · 统计：独立。通关记录进 state.zt，不进 state.cleared，龙珠/掌握度不受影响。
   */
  var ZT = window.HNSF829_ZT || { nodes: [], qs: [], byNode: {} };
  var ztByParent = {};                        // parentId -> 真题节点
  var ztQById = {};                           // qid -> 题目
  ZT.nodes.forEach(function (z) { ztByParent[z.parent] = z; });
  ZT.qs.forEach(function (q) { ztQById[q.id] = q; });

  function ztQuestions(zid) {
    return (ZT.byNode[zid] || []).map(function (id) { return ztQById[id]; }).filter(Boolean);
  }

  function onZtClick(parentId) {
    var n = Store.nodeById(parentId);
    var z = ztByParent[parentId];
    if (!n || !z) return;
    if (n.wip) { Engine.toast('该考点题库建设中，先刷已开放的'); return; }
    if (!Store.isCleared(parentId)) { Engine.toast('循序渐进：先通关「' + n.name + '」，才能做它的真题'); return; }
    var qs = ztQuestions(z.id);
    if (!qs.length) { Engine.toast('该考点暂无真题'); return; }
    Engine.open({
      // 复用母考点的角色与章节：地图上「练」和「验」是同一个人
      node: {
        id: z.id, ztParent: parentId, name: z.name, icon: n.icon,
        chap: n.chap, module: n.module, tier: n.tier, weight: n.weight
      },
      questions: qs, mode: 'zhenti',
      onExit: function () { renderMap(); renderHud(); }
    });
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    Engine.init({
      mask: $('#battleMask'),
      body: $('#battleBody'),
      foot: $('#battleFoot'),
      monsterIcon: $('#monsterIcon'),
      monsterEmoji: $('#monsterEmoji'),
      monsterImg: $('#monsterImg'),
      monsterAura: $('#monsterAura'),
      monsterName: $('#monsterName'),
      monster: $('#battleMask').querySelector('.monster'),
      trialBar: $('#trialBar'),
      trialFill: $('#trialFill'),
      trialText: $('#trialText'),
      bondStrip: $('#bondStrip'),
      qProgress: $('#qProgress'),
      comboBadge: $('#comboBadge'),
      fullBodyImg: $('#fullBodyImg'),
      fullBodyName: $('#fullBodyName')
    });

    themeOn = loadTheme();
    applyTheme(themeOn);
    bgImgOn = loadBgPref();
    if (NS.BG) NS.BG.setImageMode(bgImgOn);
    lpOn = NS.BG && NS.BG.lowPowerOn ? NS.BG.lowPowerOn() : false;
    applyLowPower(lpOn);                       // 同步 html.lowpower 类（fx.js 已按同一 key 初始化）
    syncAudioBtns();
    // 场景音乐由 World.init 按当前场景统一切换，避免先起 scene:s1 再切走造成两声重叠

    if (NS.Story) NS.Story.init();             // 章节剧情卡（入关 / 出关）
    if (NS.Gourd) NS.Gourd.init();             // 葫芦法宝（每日复盘）
    if (NS.Gear) NS.Gear.init();               // 坐骑 / 皮肤（C 键）
    if (NS.Arena) NS.Arena.init();             // 天下第一武道会（擂台赛）
    if (NS.BAG) NS.BAG.init();                 // 背包 / 秘籍（B 键）
    if (NS.Huilu) NS.Huilu.init({              // 回炉间（错题复盘：诊断 → 变形 → 归位）
      mask: $('#hlMask'), body: $('#hlBody'), foot: $('#hlFoot'),
      sub: $('#hlSub'), count: $('#hlCount'), bar: $('#hlBar'), close: $('#hlClose')
    });
    // 考验条上的「通关线」刻度：位置直接读 PASS_RATE 算出来，别在 CSS 里写死 60%
    var mark = $('#trialMark');
    if (mark) {
      mark.style.left = (Store.PASS_RATE * 100) + '%';
      mark.title = '通关线：正确率 ' + Math.round(Store.PASS_RATE * 100) + '%';
    }
    bindGlobal();
    renderMap();
    renderHud();
    Store.subscribe(renderHud);
    Store.checkAchievements();
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function bindGlobal() {
    $('#battleClose').addEventListener('click', function () { Engine.close(); });
    $('#btnPanel').addEventListener('click', function () { togglePanel(true); });
    $('#panelClose').addEventListener('click', function () { togglePanel(false); });
    $('#panelMask').addEventListener('click', function () { togglePanel(false); });
    $('#btnReset').addEventListener('click', function () {
      if (confirm('确定清空全部进度（等级、通关记录、错题本、成就）吗？此操作不可撤销。')) {
        Store.reset(); renderMap(); renderHud(); renderPanel(); Engine.toast('进度已重置');
      }
    });

    /* ---- 热血模式 / 音频控件 ---- */
    $('#btnTheme').addEventListener('click', function () {
      themeOn = !themeOn;
      applyTheme(themeOn);
      Engine.toast(themeOn ? '🥋 热血模式已开启' : '💤 已切换为简洁模式');
    });
    $('#btnMusic').addEventListener('click', function () {
      NS.Audio.setMusic(!NS.Audio.isMusicOn());
      syncAudioBtns();
      Engine.toast(NS.Audio.isMusicOn() ? '🔊 背景音乐已开启' : '🔇 背景音乐已关闭');
    });
    $('#btnSfx').addEventListener('click', function () {
      NS.Audio.setSfx(!NS.Audio.isSfxOn());
      syncAudioBtns();
    });
    $$('.panel-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        $$('.panel-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        $$('.panel-view').forEach(function (v) { v.classList.remove('active'); });
        $('#view-' + tab.dataset.view).classList.add('active');
        renderPanel();
      });
    });
    $('#nodeDetailClose').addEventListener('click', function () { $('#nodeDetail').classList.remove('show'); });
    // Esc：关闭关卡简报 / 侧栏面板（关卡内不响应，避免答题时误退出）
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (NS.Story && NS.Story.handleEsc()) return;      // 剧情卡在最上层，优先关它
      if (NS.Master && NS.Master.handleEsc()) return;    // 请教师傅的对话框其次
      if ($('#nodeDetail').classList.contains('show')) { $('#nodeDetail').classList.remove('show'); return; }
      if ($('#panel').classList.contains('show')) { togglePanel(false); }
    });
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (NS.World) NS.World.resize();
      }, 180);
    });
  }

  /* ---------------- 章节索引（地图与面板共用） ---------------- */
  var chapIndex = {};
  (NS.NODES.meta.chapters || []).forEach(function (c, i) { chapIndex[c.id] = i; });
  function chapterOf(id) {
    var list = NS.NODES.meta.chapters || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  /* 地图布局已迁移到 js/world.js（2D 像素大世界）。 */

  /* ---------------- 地图：2D 像素大世界 ----------------
   * 地形、角色、行走全部由 js/world.js 接管；这里只负责把「挑战 / 悬停 / 提示」
   * 三个钩子接回原来的关卡流程，保证题库、剧情、征信、结算一行都不用改。
   */
  var worldReady = false;
  function renderMap() {
    if (!NS.World) return;
    if (!worldReady) {
      worldReady = true;
      NS.World.init({
        nodes: NODES,
        chapters: NS.NODES.meta.chapters || [],
        store: Store,
        hooks: {
          onChallenge: onNodeClick,
          onZhenti: onZtClick,
          onHover: function (id, e) { showTip(id, e); },
          onMove: function (e) { moveTip(e); },
          onLeave: hideTip,
          onToast: function (msg) { Engine.toast(msg); }
        }
      });
    } else {
      NS.World.refresh();
    }
  }

  function shortName(n) {
    // 双子列交错后同行的两个球挨得近了，名字太长会互相压字，阈值收到 9
    return n.name.length > 9 ? n.name.slice(0, 9) + '…' : n.name;
  }
  function moduleColor(mid) {
    var m = MODULES.filter(function (x) { return x.id === mid; })[0];
    return m ? m.color : '#38bdf8';
  }
  function weightPct(w) {
    var total = NODES.reduce(function (s, n) { return s + n.weight; }, 0);
    return (w / total * 100).toFixed(1);
  }
  function totalQuestionsOf(nodeId) {
    return BANK.filter(function (q) { return q.node === nodeId; }).length;
  }

  /* ---------------- 悬浮提示 ---------------- */
  function showTip(id, e) {
    var n = Store.nodeById(id);
    var u = Store.unlocked(n);
    var tip = $('#tip');
    var rec = Store.raw().cleared[id];
    var ch = chapterOf(n.chap);
    var mk = NS.Monsters ? NS.Monsters.forNode(id) : null;
    var tipAv = n.wip ? '' : avatarUrl(id);
    var tipIcon = n.wip ? '🚧'
      : (tipAv ? '<img class="tip-avatar" src="' + tipAv + '" alt="">'
               : (n.icon || '●'));
    tip.innerHTML =
      '<div class="tip-title" style="color:' + moduleColor(n.module) + '">' + tipIcon + ' ' + n.name + '</div>' +
      (ch ? '<div class="tip-row tip-chap">' + (n.module === 'gs' ? '高等数学' : '线性代数') +
        ' 第 ' + ch.no + ' 章 · ' + ch.name + '</div>' : '') +
      (mk ? '<div class="tip-row">守关人 <b>' + mk.name + '</b></div>' : '') +
      '<div class="tip-row">分值占比 <b>' + weightPct(n.weight) + '%</b>　·　难度 ' + Engine.LEVEL_LABEL[n.tier] + '</div>' +
      '<div class="tip-row">题目数 <b>' + totalQuestionsOf(id) + '</b> 题' +
        (rec ? '　最高正确率 <b>' + Math.round(rec.best * 100) + '%</b>' : '') + '</div>' +
      '<div class="tip-row">' + (u.ok ? '<span class="ok">已解锁 · 点击进入</span>' : '<span class="no">🔒 ' + u.reason + '</span>') + '</div>';
    tip.classList.add('show');
    moveTip(e);
  }
  function moveTip(e) {
    var tip = $('#tip');
    tip.style.left = Math.min(e.clientX + 16, window.innerWidth - 300) + 'px';
    tip.style.top = (e.clientY + 16) + 'px';
  }
  function hideTip() { $('#tip').classList.remove('show'); }

  /* ---------------- 通关小结（通关后才解锁） ----------------
   * 内容来自 js/data-summary.js 的 window.HNSF829.SUMMARY[nodeId]。
   * 门槛是 Store.isCleared(nodeId)：没通关只显示锁定提示，通关后永久可回看。
   * 小结文本走 sumEsc 转义（里面会写 i<j 这类不等号），公式交给 Engine.renderMath 渲染。 */
  function sumEsc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function sumList(title, arr) {
    if (!arr || !arr.length) return '';
    return '<div class="sum-sec"><div class="sum-h">' + title + '</div><ul>' +
      arr.map(function (x) { return '<li>' + sumEsc(x) + '</li>'; }).join('') + '</ul></div>';
  }

  /**
   * 「心法」= 通过试炼之后的复盘。
   *
   * ⚠️ 这里刻意**不再重复 must / formulas**：那两块已经作为「过关要诀 + 核心公式」
   *    在试炼卡里给过了（进关前就能看，做题时真用得上）。心法独占的是真正值钱的两块——
   *    题型与解法套路（这类题怎么下手）、高频易错点（哪里最容易翻车），
   *    都是"自己打完才看得懂"的东西。两边零重复，小结的价值反而更硬。
   */
  function summaryBlockHtml(n) {
    var title = '<div class="nd-block-title">🗡️ 战利品 · 本关兵器（心法）</div>';
    if (!Store.isCleared(n.id)) {
      return '<div class="nd-block sum-block locked">' + title +
        '<div class="sum-lock">🔒 打赢他就能夺走这件兵器 —— 里面是<b>这类题怎么下手</b>（题型与解法套路）和<b>哪里最容易翻车</b>（高频易错点）。' +
        '要诀与公式在上面已经给过，这里只讲打完才懂的部分。</div>' +
        '</div>';
    }
    var S = (NS.SUMMARY || {})[n.id];
    if (!S) {
      return '<div class="nd-block sum-block">' + title +
        '<div class="sum-lock">✍️ 本关心法撰写中。先回看每道题解析里的「易错」与「得分要点」。</div></div>';
    }
    var h = '<div class="nd-block sum-block">' + title;
    if (S.intro) h += '<div class="sum-intro">' + sumEsc(S.intro) + '</div>';
    if (S.patterns && S.patterns.length) {
      h += '<div class="sum-sec"><div class="sum-h">🧭 题型与解法套路</div>' +
        S.patterns.map(function (p) {
          return '<div class="sum-pat"><b>' + sumEsc(p.q) + '</b><span>' + sumEsc(p.how) + '</span></div>';
        }).join('') + '</div>';
    }
    h += sumList('⚠️ 高频易错点', S.pitfalls);
    h += '<div class="sum-foot">✅ 已通过 · 可随时回看</div></div>';
    return h;
  }

  /* ---------------- 考点点击 → 过场 → 关卡简报 ----------------
   * 点考点先播一段分镜过场（页1 这一章 / 页2 本关），演完才出简报。
   * 过场每次点都播，卡上有「跳过」；它接管流程时会把开简报的动作放进回调，
   * 否则简报会在卡底下先弹出来（两层叠在一起）。
   */
  function onNodeClick(id) {
    var n = Store.nodeById(id);
    // 题库建设中的考点：结构已占位但还没出题，明确告知，而不是静默失败
    if (n.wip) {
      Engine.toast('🚧「' + n.name + '」题库建设中，先把已开放的考点刷透');
      return;
    }
    var u = Store.unlocked(n);
    if (!u.ok) { Engine.toast('🔒 ' + u.reason); return; }
    var qs = BANK.filter(function (q) { return q.node === id; });
    if (!qs.length) { Engine.toast('该节点题目正在补充中'); return; }

    var open = function () { openNodeDetail(id, n, qs); };
    if (NS.Story && NS.Story.maybeNodeIntro(id, open)) return;
    open();
  }

  function openNodeDetail(id, n, qs) {
    var rec = Store.raw().cleared[id];
    var ch = chapterOf(n.chap);
    var byType = {};
    qs.forEach(function (q) { byType[q.type] = (byType[q.type] || 0) + 1; });
    var typeStr = Object.keys(byType).map(function (t) { return (Engine.TYPE_LABEL[t] || t) + ' ' + byType[t]; }).join('　');

    // 试炼卡：这个考点由谁出题、他开口说什么、这一关要练什么。
    // 角色阵营（友方 / 反派）决定口吻与名牌配色 —— 弗利萨说"想过我这关"才自然，
    // 挂他一个"师傅"的牌子立刻出戏。
    var ndAv = avatarUrl(id);
    var mk = NS.Monsters ? NS.Monsters.forNode(id) : null;
    var side = (mk && mk.side) || 'ally';
    var charName = (mk && mk.name) || '';
    var say = (NS.TRIAL || {})[id] || '';
    var sum = (NS.SUMMARY || {})[id] || {};

    $('#nodeDetailCard').innerHTML =
      '<div class="nd-head" style="--color:' + moduleColor(n.module) + '">' +
        '<div class="nd-icon">' + (ndAv ? '<img class="nd-avatar" src="' + ndAv + '" alt="">' : (n.icon || '●')) + '</div>' +
        '<div><div class="nd-name">' + n.name + '</div>' +
        '<div class="nd-sub">' + (ch ? (n.module === 'gs' ? '高等数学' : '线性代数') + ' 第 ' + ch.no + ' 章 · ' + ch.name + '　|　' : '') +
          Engine.LEVEL_LABEL[n.tier] + '　·　真题分值占比 ' + weightPct(n.weight) + '%</div></div>' +
      '</div>' +
      (NS.Story ? NS.Story.chapterLineHtml(n.chap) : '') +
      // 试炼卡 = 过场的"文字留档"：谁出的题、他说了什么、这一关要练什么。
      // 「本关要练」原先是个独立区块，现在并进来 —— 过场里已经由他亲口说过一遍，
      // 简报里再起一个区块只会让同一件事出现两次。
      '<div class="trial-card ' + side + '">' +
        '<div class="trial-who">' + (side === 'foe' ? '⚔️ 挑战者' : '🤝 引路人') +
          (charName ? '　·　' + sumEsc(charName) : '') + '</div>' +
        '<div class="trial-say">' + sumEsc(say || ('这一关由 ' + charName + ' 出题考你。')) + '</div>' +
        (sum.intro ? '<div class="trial-goal"><b>本关要练</b>' + sumEsc(sum.intro) + '</div>' : '') +
      '</div>' +
      '<div class="nd-desc">' + n.desc + '</div>' +
      '<div class="nd-block"><div class="nd-block-title">⚔️ 过关要诀</div><ul>' +
        n.points.map(function (p) { return '<li>' + sumEsc(p) + '</li>'; }).join('') + '</ul></div>' +
      (sum.formulas && sum.formulas.length
        ? '<div class="nd-block"><div class="nd-block-title">📐 核心公式</div><ul>' +
          sum.formulas.map(function (f) { return '<li>' + sumEsc(f) + '</li>'; }).join('') + '</ul></div>'
        : '') +
      '<div class="nd-block"><div class="nd-block-title">🔗 知识点溯源</div>' +
        '<div class="nd-source">' + n.source + '</div></div>' +
      '<div class="nd-block"><div class="nd-block-title">📊 本关题量</div>' +
        '<div class="nd-source">共 ' + qs.length + ' 题　' + typeStr + '</div>' +
        '<div class="nd-source">通关线：正确率 ≥ ' + Math.round(Store.PASS_RATE * 100) + '%' +
        (rec ? '　历史最高：' + Math.round(rec.best * 100) + '%（通过 ' + rec.times + ' 次）' : '　尚未通过') + '</div></div>' +
      summaryBlockHtml(n) +
      (ztByParent[id] && !n.wip && Store.isCleared(id)
        ? '<button class="btn btn-ghost btn-block" id="btnZtNode">📜 历年真题 · ' +
          ztByParent[id].count + ' 题（' + ztByParent[id].years[0] + '–' +
          ztByParent[id].years[ztByParent[id].years.length - 1] + '）</button>'
        : '') +
      '<button class="btn btn-primary btn-block" id="btnStartNode">⚔️ 接受试炼</button>';
    $('#nodeDetail').classList.add('show');
    var ztb = $('#btnZtNode');
    if (ztb) ztb.addEventListener('click', function () {
      $('#nodeDetail').classList.remove('show');
      onZtClick(id);
    });
    // 小结里可能带 LaTeX，弹窗内容就位后渲染一次公式
    if (NS.Engine && NS.Engine.renderMath) {
      try { NS.Engine.renderMath($('#nodeDetailCard')); } catch (e) { /* 渲染失败就保留原文 */ }
    }
    // 章节"入关战书"已经并进点节点时的那段过场（页 1），所以这里直接开战，不再插卡
    $('#btnStartNode').addEventListener('click', function () {
      $('#nodeDetail').classList.remove('show');
      Engine.open({
        node: n, questions: qs, mode: 'node',
        onExit: function () {
          renderMap(); renderHud(); renderPanel();
          if (NS.Story) NS.Story.maybeOutro(n.chap);   // 这一章打完了就播出关结语
        }
      });
    });
  }

  /** 供引擎结算页跳转使用 */
  function launchNode(id) { onNodeClick(id); }

  /* ---------------- 主题 / 音频控件 ---------------- */
  function loadTheme() {
    try {
      var v = localStorage.getItem(THEME_KEY);
      return v === null ? true : v === '1';    // 默认开启热血模式
    } catch (e) { return true; }
  }

  function applyTheme(on) {
    document.body.classList.toggle('dz', !!on);
    var btn = $('#btnTheme');
    if (btn) {
      btn.textContent = on ? '🥋' : '💤';
      btn.classList.toggle('off', !on);
      btn.title = on ? '当前：热血模式（点击切回简洁模式）' : '当前：简洁模式（点击开启热血模式）';
    }
    try { localStorage.setItem(THEME_KEY, on ? '1' : '0'); } catch (e) {}
    if (NS.BG) NS.BG.resize();                 // 画布按新模式重新适配
  }

  function loadBgPref() {
    try {
      var v = localStorage.getItem(BG_KEY);
      return v === null ? true : v === '1';    // 默认开启（assets/ 下已内置两张原创背景图）
    } catch (e) { return true; }
  }

  function applyBgPref(on) {
    bgImgOn = !!on;
    if (NS.BG) NS.BG.setImageMode(bgImgOn);
    try { localStorage.setItem(BG_KEY, bgImgOn ? '1' : '0'); } catch (e) {}
  }

  /** 低功耗模式：治手机发热（停 Canvas 主循环 + 暂停视频 + 关全部 CSS 动画） */
  function applyLowPower(on) {
    lpOn = !!on;
    if (NS.BG && NS.BG.setLowPower) NS.BG.setLowPower(lpOn);
    else document.documentElement.classList.toggle('lowpower', lpOn);
    try { localStorage.setItem(LP_KEY, lpOn ? '1' : '0'); } catch (e) {}
  }

  function syncAudioBtns() {
    var m = $('#btnMusic'), s = $('#btnSfx');
    if (m) {
      m.textContent = NS.Audio.isMusicOn() ? '🔊' : '🔇';
      m.classList.toggle('off', !NS.Audio.isMusicOn());
      m.title = NS.Audio.isMusicOn() ? '背景音乐：开（点击关闭）' : '背景音乐：关（点击开启）';
    }
    if (s) {
      s.textContent = NS.Audio.isSfxOn() ? '🎵' : '🔕';
      s.classList.toggle('off', !NS.Audio.isSfxOn());
      s.title = NS.Audio.isSfxOn() ? '音效：开（点击关闭）' : '音效：关（点击开启）';
    }
  }

  /* ---------------- 七龙珠收集 ---------------- */
  function orbCount(cleared) {
    var n = 0;
    for (var i = 1; i <= 7; i++) if (cleared >= orbThreshold(i)) n = i;
    return n;
  }

  function renderDragonBalls(cleared) {
    var box = $('#dragonBalls');
    if (!box) return;
    var n = orbCount(cleared);
    var html = '<span class="dbtitle">龙珠</span>';
    for (var i = 1; i <= 7; i++) {
      html += '<div class="dball' + (i <= n ? ' got' : '') + '" title="通关 ' + orbThreshold(i) +
        ' 个考点点亮第 ' + i + ' 颗龙珠（' + i + ' 星）">' + '★'.repeat(i) + '</div>';
    }
    box.innerHTML = html;

    if (lastOrbs < 0) { lastOrbs = n; return; }   // 首次渲染不触发提示
    if (n > lastOrbs) {
      lastOrbs = n;
      if (n >= 7) summonDragon();
      else {
        if (NS.Audio) NS.Audio.sfx('collect');
        Engine.toast('🟠 点亮第 ' + n + ' 颗龙珠（' + n + ' 星）！再通关 ' +
          (orbThreshold(n + 1) - cleared) + ' 个考点获得下一颗');
      }
    } else if (n < lastOrbs) {
      lastOrbs = n;                               // 重置存档后同步
    }
  }

  function summonDragon() {
    if (NS.FX) NS.FX.dragon();
    Engine.toast('🐉 神龙现身！七颗龙珠集齐，' + ORB_TOTAL + ' 个考点全部通关，称号【龙珠学者】达成！', 'ach');
    renderPanel();
  }

  /* ---------------- 羁绊录：把「遇到的人」收集起来 ----------------
   * 「打怪」那套已经拆掉了：每个考点不是一只待宰的怪，而是一位在那儿等你的角色。
   * 通关 = 他认可了你 = 结伴。判定极简：节点通关就是结伴。
   *
   * 角色与节点是多对一（9 个节点复用同一位角色的立绘），但这里刻意**按节点**列：
   * 每个考点都是一次独立的相遇（悟空在「牛顿-莱布尼茨」和「特征值计算」都出场），
   * 这样和地图、战斗头部的遭遇条完全对得上，不会出现「这个人到底算不算遇到」的歧义。
   */
  function bondCells(chapId) {
    return NODES.filter(function (n) {
      return !n.wip && (!chapId || n.chap === chapId);
    });
  }

  function bondCellHtml(n, currentId) {
    var M = NS.Monsters;
    var m = M ? M.forNode(n.id) : null;
    var got = Store.isCleared(n.id);
    var cls = 'bond-cell' + (got ? ' got' : '') + (n.id === currentId ? ' cur' : '');
    var fb = n.icon || '●';
    var url = avatarUrl(n.id);
    return '<button type="button" class="' + cls + '" data-bond="' + n.id + '"' +
      ' style="--aura:' + ((m && m.aura) || '#8aa0c4') + '"' +
      ' title="' + escAttr(n.name + '　·　' + ((m && m.name) || '') + (got ? '（已结伴）' : '（还没通过）')) + '">' +
      // 头像在前、emoji 兜底在后：CSS 用 `.bond-img + .bond-fb` 把兜底藏起来。
      // 图片加载失败时 onerror 会移除 img，兜底 emoji 自动露出来（不会再叠在头像上）。
      (url ? '<img class="bond-img" src="' + url + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : '') +
      '<span class="bond-fb">' + fb + '</span>' +
      '</button>';
  }

  /** 战斗头部那一条：本章的遭遇录（只做进度展示，不响应点击） */
  function bondStripHtml(chapId, currentId) {
    var list = bondCells(chapId);
    if (!list.length) return '';
    var got = list.filter(function (n) { return Store.isCleared(n.id); }).length;
    return '<span class="bond-label">本章遭遇 <b>' + got + ' / ' + list.length + '</b></span>' +
      '<span class="bond-row">' + list.map(function (n) { return bondCellHtml(n, currentId); }).join('') + '</span>';
  }

  /** 侧栏「羁绊录」：按章分组，点头像直接进该考点 */
  function bondBookHtml() {
    var groups = (NS.NODES.meta.chapters || []).map(function (c) {
      var list = bondCells(c.id);
      if (!list.length) return '';
      var got = list.filter(function (n) { return Store.isCleared(n.id); }).length;
      var full = got === list.length;
      return '<div class="bond-chap' + (full ? ' full' : '') + '">' +
        '<div class="bond-chap-head"><b>' + (c.module === 'gs' ? '高数' : '线代') +
          ' 第 ' + c.no + ' 章　' + c.name + '</b>' +
          '<span>' + got + ' / ' + list.length + (full ? '　✅ 全章结伴' : '') + '</span></div>' +
        '<div class="bond-grid">' +
          list.map(function (n) { return bondCellHtml(n, ''); }).join('') +
        '</div></div>';
    }).join('');

    var all = NODES.filter(function (n) { return !n.wip; });
    var allGot = all.filter(function (n) { return Store.isCleared(n.id); }).length;
    return '<div class="bond-sum">' +
      '<div class="nd-block-title">🤝 羁绊录</div>' +
      '<div>已与 <b>' + allGot + '</b> / ' + all.length + ' 位角色结伴</div>' +
      '<div class="bond-hint">每通过一个考点，就有一位角色认可你。点头像可直接进该考点。</div>' +
      '</div>' + (groups || '<div class="empty">暂无可结伴的考点</div>');
  }

  function renderBondBook() {
    var box = $('#view-bond');
    if (box) box.innerHTML = bondBookHtml();
  }

  function bindBondBook() {
    $$('#view-bond .bond-cell').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.bond;
        if (!id) return;
        togglePanel(false);
        launchNode(id);
      });
    });
  }

  /* ---------------- HUD ---------------- */
  function renderHud() {
    var info = Store.levelInfo(Store.raw().xp);
    var snap = Store.snapshot();
    var total = NODES.length;
    $('#hudLevel').textContent = 'Lv.' + info.level;
    $('#hudXp').textContent = info.cur + ' / ' + info.need + ' XP';
    $('#hudXpFill').style.width = Math.min(100, info.cur / info.need * 100) + '%';
    $('#hudClear').textContent = snap.clearedCount + ' / ' + total;
    $('#hudScore').textContent = Store.scoreForecast().expected.toFixed(1);
    $('#hudStreak').textContent = snap.streak + (snap.streak >= 3 ? ' 🔥' : '');
    var acc = snap.totalAnswered ? Math.round(snap.totalCorrect / snap.totalAnswered * 100) : 0;
    $('#hudAcc').textContent = acc + '%';
    $('#hudWrong').textContent = Store.wrongCount();
    $('#hudAch').textContent = Store.achievements().filter(function (a) { return a.got; }).length + '/' + Store.achievements().length;
    $('#hudProgressRing').style.setProperty('--p', (snap.clearedCount / total * 360) + 'deg');
    renderDragonBalls(snap.clearedCount);
  }

  /* ---------------- 侧栏面板 ---------------- */
  function togglePanel(open) {
    $('#panel').classList.toggle('show', open);
    $('#panelMask').classList.toggle('show', open);
    if (open) renderPanel();
  }

  /** 供其他模块调用：打开面板并切到指定 Tab（如 'stats'） */
  function openPanel(view) {
    togglePanel(true);
    if (!view) return;
    var tab = document.querySelector('.panel-tab[data-view="' + view + '"]');
    if (tab && !tab.classList.contains('active')) tab.click();
  }

  function renderPanel() {
    if (!$('#panel').classList.contains('show')) return;
    renderAchievements();
    renderWrongBook();
    renderBondBook();
    renderWeaponBook();
    renderStats();
    bindBondBook();
    bindWeaponBook();
    if (NS.Diary) { NS.Diary.bind(); NS.Diary.render(); }
  }

  /* ---------------- 兵器库：通关即夺走该考点的「心法」 ---------------- */
  function weaponOf(n) {
    return (NS.SUMMARY || {})[n.id] || null;
  }

  function renderWeaponBook() {
    var box = $('#view-weapon');
    if (!box) return;
    var got = NODES.filter(function (n) { return Store.isCleared(n.id) && weaponOf(n); });
    var head = '<div class="wp-head"><b>已收入 ' + got.length + '</b> / ' + NODES.length +
      ' 件<span>每打赢一个考点，就夺走他压箱底的题型套路与易错点</span></div>';
    if (!got.length) {
      box.innerHTML = head +
        '<div class="wp-empty">🗡️ 兵器库还是空的。<br>去世界里找个还在等你的人，打赢他。</div>';
      return;
    }
    var order = { 3: 0, 2: 1, 1: 2 };
    got.sort(function (a, b) {
      var oa = order[a.tier] == null ? 9 : order[a.tier];
      var ob = order[b.tier] == null ? 9 : order[b.tier];
      if (oa !== ob) return oa - ob;
      return b.weight - a.weight;
    });
    box.innerHTML = head + '<div class="wp-list">' + got.map(function (n) {
      var W = weaponOf(n);
      var ch = chapterOf(n.chap);
      var grade = n.tier === 3 ? ['🔱', '神兵'] : n.tier === 2 ? ['⚔️', '长剑'] : ['🗡️', '短兵'];
      var np = W.patterns ? W.patterns.length : 0;
      var npi = W.pitfalls ? W.pitfalls.length : 0;
      return '<button class="wp-card t' + n.tier + '" data-wp="' + n.id + '">' +
        '<span class="wp-ico">' + grade[0] + '</span>' +
        '<span class="wp-body">' +
          '<span class="wp-name">' + sumEsc(n.name) + '<i>' + grade[1] + '</i></span>' +
          '<span class="wp-chap">' + (ch ? '第 ' + ch.no + ' 章 · ' + sumEsc(ch.name) : '') + '</span>' +
          '<span class="wp-intro">' + sumEsc(W.intro || '') + '</span>' +
          '<span class="wp-foot">套路 ' + np + ' 条　·　易错 ' + npi + ' 条</span>' +
        '</span>' +
      '</button>';
    }).join('') + '</div>';
  }

  function bindWeaponBook() {
    $$('#view-weapon .wp-card').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.wp;
        if (!id) return;
        togglePanel(false);
        launchNode(id);
      });
    });
  }

  function renderAchievements() {
    var RARITY = Engine.RARITY || {};
    var list = Store.achievements();
    var got = list.filter(function (a) { return a.got; }).length;

    // 概览：总数 + 各稀有度进度（普通成就容易拿完，稀有度才体现"还差什么"）
    var head = '<div class="ach-head">已解锁 <b>' + got + ' / ' + list.length + '</b>' +
      ['legend', 'epic', 'rare', 'common'].map(function (k) {
        var all = list.filter(function (a) { return a.rarity === k; });
        if (!all.length) return '';
        var g = all.filter(function (a) { return a.got; }).length;
        var r = RARITY[k] || { label: k, cls: '' };
        return '<span class="ach-tally ' + r.cls + '">' + r.label + ' ' + g + '/' + all.length + '</span>';
      }).join('') + '</div>';

    // 排序：传说 → 史诗 → 稀有 → 普通；同档内已解锁的排前面
    var order = { legend: 0, epic: 1, rare: 2, common: 3 };
    var sorted = list.slice().sort(function (a, b) {
      var oa = order[a.rarity] === undefined ? 9 : order[a.rarity];
      var ob = order[b.rarity] === undefined ? 9 : order[b.rarity];
      if (oa !== ob) return oa - ob;
      return (a.got === b.got) ? 0 : (a.got ? -1 : 1);
    });

    $('#view-ach').innerHTML = head + '<div class="ach-list">' + sorted.map(function (a) {
      var r = RARITY[a.rarity] || RARITY.common || { label: '普通', cls: 'r-common' };
      // 隐藏成就：没拿到之前连名字都不给看
      var secret = a.hidden && !a.got;
      return '<div class="ach ' + (a.got ? 'got' : '') + ' r-' + (a.rarity || 'common') + '">' +
        '<div class="ach-icon">' + (a.got ? a.icon : secret ? '❓' : '🔒') + '</div>' +
        '<div class="ach-body">' +
          '<div class="ach-name">' + (secret ? '？？？' : a.name) +
            ' <span class="ach-rarity ' + r.cls + '">' + r.label + '</span>' +
            (a.hidden && a.got ? ' <span class="ach-hidden-tag">隐藏</span>' : '') +
          '</div>' +
          '<div class="ach-desc">' + (secret ? '隐藏成就 · 达成后才揭晓条件' : a.desc) + '</div>' +
        '</div>' +
        (a.got ? '<div class="ach-date">' + new Date(a.ts).toLocaleDateString() + '</div>' : '') +
        '</div>';
    }).join('') + '</div>';
  }

  function renderWrongBook() {
    var list = Store.wrongList();
    var sum = Store.hlSummary();
    if (!list.length) {
      $('#view-wrong').innerHTML = '<div class="empty">🎉 错题本空空如也，继续保持！</div>';
      return;
    }
    var html = '<div class="wrong-bar"><span>共 ' + list.length + ' 道待消化' +
      (sum.ready ? '（今天可回炉 ' + sum.ready + '）' : (sum.pending ? '（' + sum.pending + ' 道等明天）' : '')) +
      '</span>' +
      '<button class="btn btn-mini btn-primary" id="btnHlOpen">🔥 回炉间</button>' +
      '<button class="btn btn-mini" id="btnWrongAll" title="原题重练：只当练习，不解账">⚔️ 原题重练</button>' +
      '<button class="btn btn-mini" id="btnWrongClean">🧹 全部消化</button></div>';
    html += list.map(function (it) {
      var q = BANK.filter(function (x) { return x.id === it.qid; })[0];
      if (!q) return '';
      var n = it.node === 'arena'
        ? { icon: '⚔️', name: '天下第一武道会' }
        : Store.nodeById(it.node);
      var seg = '<span class="wi-seg">第 ' + ((it.stage || 0) + 1) + ' / ' + (it.need || 2) + ' 段</span>';
      if (it.stuck) seg = '<span class="wi-seg stuck">待师傅讲</span>';
      else if (!it.ready) seg = '<span class="wi-seg wait">等明天</span>';
      return '<div class="wrong-item">' +
        '<div class="wi-head"><span class="wi-node">' + (n ? n.icon + ' ' + n.name : it.node) + '</span>' +
        seg + '<span class="wi-times">错 ' + it.times + ' 次</span></div>' +
        '<div class="wi-stem">' + Engine.fmt(q.stem.slice(0, 160)) + (q.stem.length > 160 ? '…' : '') + '</div>' +
        '<div class="wi-src">🔗 ' + q.source + '</div>' +
        '<div class="wi-actions">' +
          '<button class="btn btn-mini btn-primary" data-hl="' + q.id + '">🔥 回炉</button>' +
          '<button class="btn btn-mini" data-retry="' + q.id + '">原题重练</button>' +
          '<button class="btn btn-mini" data-resolve="' + q.id + '">已消化</button>' +
        '</div>' +
      '</div>';
    }).join('');
    $('#view-wrong').innerHTML = html;

    function openHl(qids) {
      togglePanel(false);
      NS.Huilu.open({
        qids: qids,
        onExit: function () { renderHud(); renderMap(); renderPanel(); }
      });
    }
    $('#btnHlOpen').addEventListener('click', function () { openHl(null); });
    $('#btnWrongAll').addEventListener('click', function () {
      var qs = list.map(function (it) { return BANK.filter(function (x) { return x.id === it.qid; })[0]; })
        .filter(Boolean);
      retryQuestions(qs);
    });
    $('#btnWrongClean').addEventListener('click', function () {
      var n = Store.cleanAllWrong();
      Engine.toast('🧹 已消化 ' + n + ' 道错题');
      renderPanel(); renderHud();
    });
    $$('#view-wrong [data-retry]').forEach(function (b) {
      b.addEventListener('click', function () {
        var q = BANK.filter(function (x) { return x.id === b.dataset.retry; })[0];
        if (q) retryQuestions([q]);
      });
    });
    $$('#view-wrong [data-hl]').forEach(function (b) {
      b.addEventListener('click', function () { openHl([b.dataset.hl]); });
    });
    $$('#view-wrong [data-resolve]').forEach(function (b) {
      b.addEventListener('click', function () {
        Store.resolveWrong(b.dataset.resolve, true);
        renderPanel(); renderHud();
      });
    });
  }

  function retryQuestions(qs) {
    if (!qs.length) return;
    var node = Store.nodeById(qs[0].node);
    togglePanel(false);
    Engine.open({
      node: node, questions: qs, mode: 'wrong',
      onExit: function () { renderMap(); renderHud(); renderPanel(); }
    });
  }

  /**
   * 考点掌握度热力图。
   * 按「模块 → 考点」分组，每个格子显示该考点的累计正确率；
   * 颜色只区分四档（未练 / 薄弱 / 一般 / 扎实），一眼看出该补哪里。
   * 点格子直接进该关卡 —— 从"发现问题"到"开始解决"零跳转。
   */
  function masteryHeatHtml() {
    var all = Store.masteryAll();
    var sum = Store.masterySummary();
    // 69 个节点平铺会糊成一片，所以先按「模块 → 章」二级分组，再列格子
    var groups = MODULES.map(function (m) {
      var chapters = (NS.NODES.meta.chapters || []).filter(function (c) { return c.module === m.id; });
      var inner = chapters.map(function (c) {
        var list = NODES.filter(function (n) { return n.chap === c.id; });
        if (!list.length) return '';
        var cells = list.map(function (n) {
          var mm = all[n.id] || { level: 0, rate: null, answered: 0, correct: 0 };
          var pct = mm.answered ? Math.round(mm.rate * 100) + '%' : '—';
          var tip = n.name + '（' + (m.id === 'gs' ? '高数' : '线代') + ' 第 ' + c.no + ' 章）' +
            (mm.answered ? '：累计答对 ' + mm.correct + ' / ' + mm.answered + ' 题，点这里去刷'
              : n.wip ? '：题库建设中' : '：还没练过这个考点，点这里开始');
          return '<button class="hm-cell m' + mm.level + (n.wip ? ' wip' : '') + '" data-hm="' + n.id +
            '" title="' + escAttr(tip) + '">' +
            '<span class="hm-name">' + shortName(n) + '</span>' +
            '<b class="hm-pct">' + pct + '</b>' +
            '</button>';
        }).join('');
        return '<div class="hm-chap"><div class="hm-chap-title">第 ' + c.no + ' 章 · ' + c.name + '</div>' +
          '<div class="hm-cells">' + cells + '</div></div>';
      }).join('');
      if (!inner) return '';
      return '<div class="hm-group">' +
        '<div class="hm-group-title"><i style="background:' + m.color + '"></i>' + m.name + '</div>' +
        inner + '</div>';
    }).join('');

    var weak = Store.weakestNodes(3);
    var weakHtml = weak.length
      ? '<div class="hm-weak">🎯 最该补：' + weak.map(function (w) {
        return '<button class="hm-link" data-hm="' + w.node.id + '">' + shortName(w.node) +
          ' ' + Math.round(w.m.rate * 100) + '%</button>';
      }).join('') + '</div>' : '';

    return '<div class="stats-block">' +
      '<div class="nd-block-title">🔥 考点掌握度热力图</div>' +
      '<div class="hm-summary">' +
        '<span class="hm-s m3">扎实 <b>' + sum.solid + '</b></span>' +
        '<span class="hm-s m2">一般 <b>' + sum.ok + '</b></span>' +
        '<span class="hm-s m1">薄弱 <b>' + sum.weak + '</b></span>' +
        '<span class="hm-s m0">未练 <b>' + sum.untouched + '</b></span>' +
        '<span class="hm-hint">按累计正确率统计 · 点格子直接去刷</span>' +
      '</div>' +
      weakHtml +
      '<div class="hm-wrap">' + groups + '</div>' +
      '</div>';
  }

  function bindHeatmap() {
    $$('#view-stats .hm-cell, #view-stats .hm-link').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.hm;
        if (!id) return;
        togglePanel(false);
        launchNode(id);
      });
    });
  }

  /* ---------------- 考场预计（复盘系统的门面） ----------------
   * 设计立场：不用奖励催你复盘，而是把你「考场上会丢的分」摆出来。
   * 虚分不会因为你不管它就消失 —— 它只能靠「验」变成实分。
   */
  function forecastHtml() {
    var f = Store.scoreForecast();
    var realPct = f.expected / f.full * 100;
    var fakePct = f.fake / f.full * 100;
    var hasFake = f.fake >= 0.05;
    var fakeRatio = f.paper > 0 ? Math.round(f.fake / f.paper * 100) : 0;

    var head = '<div class="fc-head">' +
      '<span class="fc-title">🎯 考场预计</span>' +
      '<span class="fc-cap">按本系统已覆盖内容估算 · 150 分制 · 没碰过的按 0 计</span></div>';

    var main = '<div class="fc-main">' +
      '<b class="fc-score">' + f.expected.toFixed(1) + '</b>' +
      '<span class="fc-of">/ 150</span>' +
      (hasFake ? '<span class="fc-fake">虚分 ' + f.fake.toFixed(1) + ' · 占纸面 ' + fakeRatio + '%</span>'
               : (f.touched ? '<span class="fc-fake zero">没有虚分 ✓</span>' : '')) +
      '</div>';

    var bar = '<div class="fc-bar">' +
      '<i class="fc-real" style="width:' + realPct.toFixed(2) + '%"></i>' +
      '<i class="fc-fake-i" style="width:' + fakePct.toFixed(2) + '%"></i>' +
      '</div>';

    var legend = '<div class="fc-legend">' +
      '<span><i class="d real"></i>已坐实 <b>' + f.expected.toFixed(1) + '</b></span>' +
      (hasFake ? '<span><i class="d fake"></i>虚分 <b>' + f.fake.toFixed(1) +
        '</b>（练过但没验过 · 占纸面 ' + fakeRatio + '%）</span>' : '') +
      '<span><i class="d blank"></i>还没碰 <b>' + f.blank.toFixed(1) + '</b></span>' +
      '</div>';

    var rows = f.fakeRows.slice(0, 5).map(function (r) {
      var gap = r.paperPts - r.realPts;
      // 通关但真题未验 → 点一下直接去「验」；其余回原考点刷
      var act = (r.state === 'claimed' && !Store.ztCleared(r.node.id)) ? 'zt' : 'node';
      return '<button class="fc-row" data-fc-node="' + r.node.id + '" data-fc-act="' + act + '">' +
        '<span class="fc-rn">' + r.node.icon + ' ' + shortName(r.node) + '</span>' +
        '<span class="fc-rs ' + r.state + '">' + r.label + '</span>' +
        '<span class="fc-rr">' + Math.round((r.rate || 0) * 100) + '%</span>' +
        '<span class="fc-rg">−' + gap.toFixed(1) + '</span>' +
        '</button>';
    }).join('');

    var listHtml = rows
      ? '<div class="fc-list"><div class="fc-list-title">这些分现在是虚的 · 点一下去验</div>' + rows + '</div>'
      : '';

    var note;
    if (!f.touched) {
      note = '还没开始练 —— 先把地图上开放的考点刷起来，这里才会开始有数字。';
    } else {
      note = '复盘的唯一产出是「可信度」，不是奖励。';
      if (f.claimed) {
        note += '你现在有 <b>' + f.claimed + '</b> 个考点练通了却<b>没在真题里验过</b>' +
          (f.verified ? '，只有 <b>' + f.verified + '</b> 个是坐实的' : '') +
          ' —— 那正是虚分的来源。把它们验一遍，这部分分才真的算你的。';
      } else if (hasFake) {
        note += '把虚分的考点补一遍，虚分就坐实了。';
      } else {
        note += '已覆盖的考点都验过了，继续保持；空白的那部分才是接下来要拿的分。';
      }
    }

    return '<div class="stats-block fc-box">' + head + main + bar + legend + listHtml +
      '<div class="fc-note">' + note + '</div></div>';
  }

  function bindForecast() {
    $$('#view-stats .fc-row').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.fcNode;
        if (!id) return;
        togglePanel(false);
        if (b.dataset.fcAct === 'zt') onZtClick(id); else launchNode(id);
      });
    });
  }

  function renderStats() {
    var snap = Store.snapshot();
    var totalQ = BANK.length;
    var lo = Store.lootStats();
    var zs = Store.ztSummary();
    var hls = Store.hlSummary();
    var ztot = (ZT.nodes || []).length;
    var zrate = zs.answered ? Math.round(zs.correct / zs.answered * 100) : null;
    var rows = [
      ['总题量', totalQ + ' 题'],
      ['已作答', snap.totalAnswered + ' 题'],
      ['累计答对', snap.totalCorrect + ' 题'],
      ['总体正确率', (snap.totalAnswered ? Math.round(snap.totalCorrect / snap.totalAnswered * 100) : 0) + '%'],
      ['最高连击', snap.maxCombo + ' 连'],
      ['单局最高连对', snap.bestRunCombo + ' 连'],
      ['单局最佳正确率', Math.round((snap.bestRunRate || 0) * 100) + '%'],
      ['掌握扎实的考点', Store.masterySummary().solid + ' / ' + NODES.length],
      ['通关考点', snap.clearedCount + ' / ' + NODES.length],
      ['龙珠进度', '🟠 ' + orbCount(snap.clearedCount) + ' / 7 颗'],
      // 真题关走独立统计：既不算考点，也不进龙珠
      ['真题关通关', zs.cleared + ' / ' + ztot + ' 关'],
      ['真题作答', zs.answered + ' 题' + (zrate != null ? '　正确率 ' + zrate + '%' : '')],
      ['通关宝箱', lo.opened ? '已开 ' + lo.opened + ' 箱' + (lo.best ? '　最好 ' + lo.best.icon + lo.best.name : '') : '未开启'],
      ['满分考点', snap.perfectCount + ' 个'],
      ['待消化错题', Store.wrongCount() + ' 题'],
      // 回炉账本：错题不再「答对一次就销账」，要验两段（第二段隔天）
      ['回炉 · 今天可验', hls.ready + ' 道'],
      ['回炉 · 等明天', hls.pending + ' 道'],
      ['回炉 · 已出炉', hls.out + ' 道' + (hls.stuck ? '　（待师傅讲 ' + hls.stuck + '）' : '')],
    ];
    $('#view-stats').innerHTML =
      forecastHtml() +
      '<div class="stat-grid">' + rows.map(function (r) {
      return '<div class="stat-cell"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>';
    }).join('') + '</div>' +
      masteryHeatHtml() +
      audioBoxHtml() +
      cloudBoxHtml() +
      monsterBoxHtml() +
      '<div class="play-tips"><div class="nd-block-title">🎮 玩法说明</div><ul>' +
      '<li>考点按「基础简易 → 综合应用 → 创新拓展」分层，同层内按历年真题<b>分值占比从高到低</b>排列，圆越大分值越高。</li>' +
      '<li>高等数学约占 <b>78%</b>、线性代数约占 <b>22%</b>（150 分制）；标着 🚧 的考点题库还在建设中，先把已开放的刷透。</li>' +
      '<li>选择题点击选项即刻判分；填空 / 计算 / 证明 / 应用题对照参考答案与<b>得分要点</b>后点选「我答对了 / 没答对」自评 —— 诚实自评才有效。</li>' +
      '<li>所有数学符号都用 <b>LaTeX 实时渲染</b>；解析给的是<b>完整算式与推导步骤</b>，不是只报一个答案。</li>' +
      '<li><b>每个考点都在等一位角色</b>：答对了他就认可你、考验条往前推一格；答错了只是他摇摇头。这条进度<b>只涨不跌</b>，记的是你真正答对了几题。</li>' +
      '<li>答对同时加经验，<b>连对 3 题以上触发连击加成，屏幕边缘会燃起来（连击跨考点累计，答错清零）</b>；<b>5 / 10 / 15 / 20 连各有一次大演出</b>，别断。</li>' +
      '<li>通过一个考点 = <b>他认可了你，加入「🤝 羁绊录」</b>，同时把他的<b>心法</b>（本关小结）收录进该考点的简报里，随时回看。</li>' +
      '<li>上方的<b>考点掌握度热力图</b>按「累计正确率」给 ' + NODES.length + ' 个考点上色（红=薄弱 / 黄=一般 / 绿=扎实），<b>点格子直接进该考点</b>。</li>' +
      '<li>地图上每个考点下方也标了掌握度；通关后会对比本考点历史最佳与单局纪录，破纪录有提示。</li>' +
      '<li>每个考点角色旁边挂着一只<b>真题卷轴「真」</b>：<b>该考点通关后才会点亮</b>（灰锁 = 先把它刷通），点开就是 2011–2026 的历年真题。真题关<b>进度独立统计</b>，不计入考点通关数与七龙珠 —— 「练」和「验」分开看。</li>' +
      '<li>正确率达到 ' + Math.round(Store.PASS_RATE * 100) + '% 即通关，解锁后继考点；满分通关额外奖励。</li>' +
      '<li><b>七颗龙珠把 ' + ORB_TOTAL + ' 个考点均分成 7 档</b>，每通关 ' + orbThreshold(1) + ' 个点左右点亮一颗，全通集齐七颗召唤神龙。</li>' +
      '<li>每题都标了<b>难度分级</b>（基础 / 真题 / 拔高），答错后解析里会<b>逐条批驳干扰项</b>，末尾还附<b>同类变式</b>供二刷换题。</li>' +
      '<li>所有题目均标注<b>考点溯源</b>（教材章节 / 真题出处），错题本可一键重练。</li>' +
      '<li>做错的题会进 <b>🔥 回炉间</b>：错题本里可以单题回炉，地图上跟随你的<b>葫芦法宝（按 R）</b>每天成熟一炉。' +
        '单题回炉先用<b>同类变式</b>做一遍（不是原题），再看解析诚实自评；<b>两段验证</b>才算消化，<b>第二段必须隔天</b>。' +
        '葫芦复盘则是<b>错题优先 + 最弱考点补题</b>，全对 3 片、否则 2 片皮肤碎片 —— 同一个错题连错 2 次会自动撤下队列，交给师傅讲。</li>' +
      '<li><b>练 ≠ 验</b>：考点通关只是「练会了」。上方的「考场预计」按四档信任度估算 150 分制得分 —— ' +
        '没在真题里验过、或错题没出炉的部分会算成<b>虚分</b>，虚分不会自己消失，只能靠复盘坐实。</li>' +
      '</ul></div>';

    bindAudioBox();
    bindCloudBox();
    bindHeatmap();
    bindForecast();
  }

  /* ---------------- 属性转义（题库与配置都按不可信文本处理） ---------------- */
  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function audioBoxHtml() {
    var m = NS.Audio.isMusicOn(), s = NS.Audio.isSfxOn(), v = Math.round(NS.Audio.getVolume() * 100);
    var mib = NS.Audio.isMusicInBattle();
    var tc = Engine.timerCfg ? Engine.timerCfg() : { on: false, level: 'std' };
    var TLV = { loose: '宽松', std: '标准', tight: '严格' };
    return '<div class="audio-box">' +
      '<div class="nd-block-title">🎧 音频与主题</div>' +
      '<div class="audio-row"><span>背景音乐</span>' +
        '<button class="btn ' + (m ? 'on' : '') + '" data-au="music">' + (m ? '开启' : '关闭') + '</button>' +
        '<button class="btn ' + (themeOn ? 'on' : '') + '" data-au="theme">' + (themeOn ? '热血模式' : '简洁模式') + '</button>' +
      '</div>' +
      '<div class="audio-row"><span>做题时 BGM</span>' +
        '<button class="btn ' + (mib ? 'on' : '') + '" data-au="mib">' + (mib ? '播放' : '静音') + '</button>' +
      '</div>' +
      '<div class="audio-row"><span>音效</span>' +
        '<button class="btn ' + (s ? 'on' : '') + '" data-au="sfx">' + (s ? '开启' : '关闭') + '</button>' +
      '</div>' +
      '<div class="audio-row"><span>音量</span><input type="range" min="0" max="100" value="' + v + '" data-au="vol"></div>' +
      '<div class="audio-row"><span>低功耗模式</span>' +
        '<button class="btn ' + (lpOn ? 'on' : '') + '" data-au="lowpower">' + (lpOn ? '开启' : '关闭') + '</button>' +
      '</div>' +
      '<div class="audio-row"><span>限时作答</span>' +
        '<button class="btn ' + (tc.on ? 'on' : '') + '" data-au="timer">' + (tc.on ? '开启' : '关闭') + '</button>' +
        ['loose', 'std', 'tight'].map(function (lv) {
          return '<button class="btn ' + (tc.level === lv ? 'on' : '') + '" data-au="timer-lv" data-lv="' + lv + '">' + TLV[lv] + '</button>';
        }).join('') +
      '</div>' +
      '<div class="audio-tip">🎵 背景音乐来自 <code class="inline-code">数学二/music/</code> 的洛克王国原声：场景曲 / 战斗曲 / BOSS 曲 / 对话曲四层，切歌采用「先淡出旧曲、再淡入新曲」，任何时刻只有一首在响。<br>' +
        '🎸 <b>做题时 BGM 默认播放</b>：进关卡会切到独立的战斗曲，回地图会接着上次的探索曲位置继续放。读题嫌吵就切成「静音」，只保留打击音效。<br>' +
        '浏览器规定必须与页面交互一次才能出声，若没声音请先点一下页面。</div>' +
      '<div class="audio-tip" style="margin-top:10px">⚡ <b>性能</b>：旧版悟空视频背景与全屏 Canvas 粒子已停用；主画面只由像素世界的一张离屏地形 Canvas 绘制。打开弹窗、答题界面或切到后台时，世界渲染会自动暂停。</div>' +
      '<div class="audio-tip" style="margin-top:10px">🔋 <b>低功耗模式</b>：关掉全部 CSS 常驻动画与高耗动效；桌面默认关闭，手机默认开启。它不是「降画质」，而是把不必要的持续动画停掉。</div>' +
      '<div class="audio-tip" style="margin-top:10px">⏱ <b>限时作答</b>（<b>只对选择题 / 填空题计时</b>）：计算与证明题<b>不计时</b>——数学需要思考时间，秒表只会逼出焦虑。超时按<b>答错</b>结算（断连击、进错题本、不给经验），并直接摊开答案。强度：宽松 ×1.5 / 标准 ×1 / 严格 ×0.7。切到后台会自动暂停计时。</div>' +
      '</div>';
  }

  /** 角色立绘素材区：显示每张立绘的文件名与「已放图 / 缺图 / 本机自定义」状态 */
  function monsterBoxHtml() {
    var M = NS.Monsters;
    if (!M) return '';
    var st = Engine.monsterStatus ? Engine.monsterStatus() : {};
    var got = 0, probed = 0, custom = 0, localTotal = 0;
    var rows = M.list.map(function (m) {
      var s = st[m.id];
      if (s === 'ok' || s === 'custom') { got++; probed++; }
      else if (s === 'miss') { probed++; }
      if (s === 'custom') custom++;
      if (m.local) localTotal++;
      var mark = s === 'custom' ? '🟣 本机自定义'
        : (s === 'ok' ? '✅ 已放图' : (s === 'miss' ? '⬜ 缺图' : '— 未探测'));
      return '<div class="mon-row"><span class="mon-name">' + m.name + '</span>' +
        '<code class="inline-code">' + m.file + (m.local ? ' <b class="mon-local">本机</b>' : '') + '</code>' +
        '<span class="mon-state' + (s === 'ok' || s === 'custom' ? ' ok' : '') + '">' + mark + '</span></div>';
    }).join('');
    return '<div class="audio-box monster-box">' +
      '<div class="nd-block-title">🥋 角色立绘（已确认 ' + got + ' / ' + probed + ' 有图，共 ' + M.list.length + ' 位' +
        (localTotal ? '，其中本机专属 ' + localTotal + ' 位' : '') +
        (custom ? '，已用本机图 ' + custom + ' 位' : '') + '）</div>' +
      '<div class="mon-mode-hint">每个考点<b>固定</b>对应清单里的那位角色 —— 试炼卡说谁、台上就是谁、结算与羁绊录也都是同一个。' +
        '<br>（旧的「每次随机」已移除：随机换脸会和试炼台词、羁绊录对不上。）</div>' +
      '<div class="mon-grid">' + rows + '</div>' +
      '<div class="audio-tip">' +
        '<b>两种放图位置（优先级从高到低）</b><br>' +
        '① <code class="inline-code">数学二/monsters/custom/</code> —— <b>只在本机生效</b>。该目录已写进 <code class="inline-code">.gitignore</code> 与 <code class="inline-code">.vercelignore</code>，' +
        '里面的图<b>不会提交进仓库、也不会部署到线上</b>。文件名与上表一致即可覆盖（例如放 <code class="inline-code">custom/link-goblin.png</code>，本机就显示它，状态为「🟣 本机自定义」）。<br>' +
        '② <code class="inline-code">数学二/monsters/</code> —— 随仓库发布，所以这里只能放<b>有商用授权</b>的图（自己 AI 生成的、或 Pexels / Pixabay / Unsplash / CC0 的）。<br>' +
        '<b>请留意：</b>游戏、动漫、影视的官方美术资源（例如各类网游官方的角色立绘、图鉴素材）属于他人版权作品，' +
        '放进 ② 或仓库等于公开传播，会有下架乃至法律风险；想在本机随手用就放 ①。<br>' +
        '<b>两个处理脚本，按图的特点选：</b><br>' +
        '· <code class="inline-code">process.ps1</code> —— 适合<b>背景干净</b>的图（白底线稿、纯色底、3D 渲染、抠像）。它会真的把背景抠成透明：' +
        '灰度线稿反色发光、彩色图保留原色，再裁边缩放。例：<code class="inline-code">.\\process.ps1 -In x.png -Out custom\\tree-titan.png</code><br>' +
        '· <code class="inline-code">process-illust.py</code> —— 适合<b>满幅插画/立绘卡片</b>（主体画到画面边缘、背景是平滑渐变，抠不干净）。' +
        '它不抠底，改为完整保留原画 + 柔和径向渐隐 + 边缘压暗，融进暗色战场不显硬边。' +
        '需要 python 与 pillow：<code class="inline-code">python process-illust.py -i custom\\raw -o custom</code><br>' +
        '没放图的自动回退成 emoji，不影响使用。状态按你本次实际进过的关卡更新，「未探测」= 本次会话还没进过那个关卡。' +
        '</div>' +
      '</div>';
  }

  /* ---------------- ☁️ 云端同步 ---------------- */
  function fmtTime(ts) {
    if (!ts) return '从未同步';
    var d = new Date(ts), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
      p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function cloudBoxHtml() {
    var C = NS.Cloud;
    if (!C) return '';
    var c = C.code();
    return '<div class="audio-box cloud-box">' +
      '<div class="nd-block-title">☁️ 云端同步</div>' +
      '<div class="audio-row"><span>同步码</span>' +
        '<input class="cloud-code" type="text" spellcheck="false" autocomplete="off" ' +
          'placeholder="点「随机生成」或手填 ' + C.minCode + ' 位以上" value="' + escAttr(c) + '">' +
      '</div>' +
      '<div class="audio-row"><span></span>' +
        '<button class="btn" data-cl="gen">🎲 随机生成</button>' +
        '<button class="btn" data-cl="copy">📋 复制</button>' +
        '<button class="btn" data-cl="clear">🗑 清除</button>' +
      '</div>' +
      '<div class="audio-row"><span>进度</span>' +
        '<button class="btn" data-cl="push">⬆️ 上传本机</button>' +
        '<button class="btn" data-cl="pull">⬇️ 下载云端</button>' +
      '</div>' +
      '<div class="cloud-status" data-cl="status">本机同步码：' + (C.codeOk(c) ? '已设置' : '未设置') +
        '　·　自动同步：已开启　·　最后同步：' + fmtTime(C.lastSync()) + '</div>' +
      '<div class="audio-tip"><b>实时同步已开启</b>：进度只有云端一份（Supabase），本机只是镜像 —— 打开页面自动读取云端，答题存档后 1~2 秒内自动推上去，换设备、清缓存、换域名都不用管。<br>' +
        '下面的按钮只偶尔手动用：A 机「⬆️ 上传本机」，B 机填同一个同步码点「⬇️ 下载云端」。<br>' +
        '⚠️ <b>「⬇️ 下载云端」会把云端那份直接覆盖本机</b>（含错题本、疑问日记），所以要点两下确认。<br>' +
        '⚠️ <b>同步码就是你的密码</b>：它是唯一凭证，丢了或忘了谁都找不回来。默认已内置一个固定码，若改掉它请自己记好。</div>' +
      '</div>';
  }

  var pullArmed = 0;            // 「下载」是整份覆盖本机，点两下确认（不弹系统框）

  function cloudStatus(msg, kind) {
    var el = $('#view-stats [data-cl="status"]');
    if (!el) return;
    el.textContent = msg;
    el.className = 'cloud-status' + (kind ? ' ' + kind : '');
  }
  function cloudIdle() {
    var C = NS.Cloud;
    if (!C) return;
    var c = C.code();
    cloudStatus('本机同步码：' + (C.codeOk(c) ? '已设置' : '未设置') +
      '　·　自动同步：已开启　·　最后同步：' + fmtTime(C.lastSync()), '');
  }

  function bindCloudBox() {
    var C = NS.Cloud;
    var box = $('#view-stats .cloud-box');
    if (!C || !box) return;
    var input = box.querySelector('.cloud-code');
    var genB = box.querySelector('[data-cl="gen"]');
    var copyB = box.querySelector('[data-cl="copy"]');
    var clearB = box.querySelector('[data-cl="clear"]');
    var pushB = box.querySelector('[data-cl="push"]');
    var pullB = box.querySelector('[data-cl="pull"]');
    var saveCode = function () { C.setCode(input.value); };
    var armReset = function () {
      pullArmed = 0;
      pullB.textContent = '⬇️ 下载云端';
      pullB.classList.remove('danger');
    };

    genB.addEventListener('click', function () {
      input.value = C.genCode();
      saveCode();
      cloudStatus('已生成新同步码。本机会自动把进度上传到云端（也可点「⬆️ 上传本机」立即上传）；另一台设备填同一个码即可自动恢复。', 'ok');
    });
    copyB.addEventListener('click', function () {
      saveCode();
      var v = input.value.trim();
      if (!v) { cloudStatus('还没有同步码，先点「🎲 随机生成」', 'warn'); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(v).then(function () {
          cloudStatus('同步码已复制到剪贴板', 'ok');
        }, function () {
          input.select(); cloudStatus('请手动复制选中的同步码', 'warn');
        });
      } else {
        input.select(); cloudStatus('请手动复制选中的同步码', 'warn');
      }
    });
    clearB.addEventListener('click', function () {
      input.value = '';
      C.setCode('');
      cloudStatus('已清除本机同步码（云端那份数据没有被删除，填回原码还能取到）', 'warn');
    });
    input.addEventListener('change', function () { saveCode(); cloudIdle(); });

    pushB.addEventListener('click', function () {
      saveCode();
      if (!C.codeOk(input.value)) { cloudStatus('同步码至少要 ' + C.minCode + ' 位', 'warn'); return; }
      pushB.disabled = true;
      cloudStatus('正在上传本机进度…');
      C.push(function (ok, info) {
        pushB.disabled = false;
        if (!ok) {
          cloudStatus('上传失败：' + info.message, 'err');
          Engine.toast('☁️ 上传失败：' + info.message);
          return;
        }
        cloudStatus('✅ 已上传本机进度（' + fmtTime(info.at) + '）', 'ok');
        Engine.toast('☁️ 进度已上传到云端');
      });
    });

    pullB.addEventListener('click', function () {
      saveCode();
      if (!C.codeOk(input.value)) { cloudStatus('同步码至少要 ' + C.minCode + ' 位', 'warn'); return; }
      var now = Date.now();
      if (!(pullArmed && now - pullArmed < 4000)) {          // 第一下：只是上膛
        pullArmed = now;
        pullB.textContent = '⚠️ 会覆盖本机，再点一次';
        pullB.classList.add('danger');
        cloudStatus('下载会用云端进度**覆盖本机全部进度**（错题本、疑问日记也在内）。确认请再点一次按钮。', 'warn');
        setTimeout(function () { if (Date.now() - pullArmed >= 3900) armReset(); }, 4000);
        return;
      }
      armReset();
      cloudStatus('正在下载云端进度…');
      C.pull(function (ok, info) {
        if (!ok) {
          cloudStatus('下载失败：' + info.message, 'err');
          Engine.toast('☁️ 下载失败：' + info.message);
          return;
        }
        if (info.empty) {
          cloudStatus('这个同步码在云端还没有数据 —— 先去另一台设备点「⬆️ 上传本机」。', 'warn');
          return;
        }
        cloudStatus('✅ 已用云端进度覆盖本机（云端时间 ' + fmtTime(info.at) + '）', 'ok');
        Engine.toast('☁️ 已下载云端进度，本机已更新');
        renderMap(); renderHud();                            // 解锁状态与 HUD 都要重算
      });
    });
  }

  function bindAudioBox() {
    // 用 :not 明确排除角色立绘素材区与云端同步区（它们都复用了 .audio-box 的样式）
    var box = $('#view-stats .audio-box:not(.monster-box):not(.cloud-box)');
    if (!box) return;
    var mBtn = box.querySelector('[data-au="music"]');
    var sBtn = box.querySelector('[data-au="sfx"]');
    var tBtn = box.querySelector('[data-au="theme"]');
    var lpBtn = box.querySelector('[data-au="lowpower"]');
    var mibBtn = box.querySelector('[data-au="mib"]');
    var vol = box.querySelector('[data-au="vol"]');
    var tmBtn = box.querySelector('[data-au="timer"]');
    var lvBtns = box.querySelectorAll('[data-au="timer-lv"]');

    mibBtn.addEventListener('click', function () {
      NS.Audio.setMusicInBattle(!NS.Audio.isMusicInBattle());
      var on = NS.Audio.isMusicInBattle();
      mibBtn.classList.toggle('on', on);
      mibBtn.textContent = on ? '播放' : '静音';
      Engine.toast(on ? '做题时也会播放背景音乐' : '做题时已静音背景音乐，只保留打击音效');
    });

    mBtn.addEventListener('click', function () {
      NS.Audio.setMusic(!NS.Audio.isMusicOn());
      mBtn.classList.toggle('on', NS.Audio.isMusicOn());
      mBtn.textContent = NS.Audio.isMusicOn() ? '开启' : '关闭';
      syncAudioBtns();
    });
    sBtn.addEventListener('click', function () {
      NS.Audio.setSfx(!NS.Audio.isSfxOn());
      sBtn.classList.toggle('on', NS.Audio.isSfxOn());
      sBtn.textContent = NS.Audio.isSfxOn() ? '开启' : '关闭';
      syncAudioBtns();
    });
    tBtn.addEventListener('click', function () {
      themeOn = !themeOn;
      applyTheme(themeOn);
      tBtn.classList.toggle('on', themeOn);
      tBtn.textContent = themeOn ? '热血模式' : '简洁模式';
    });
    vol.addEventListener('input', function () {
      NS.Audio.setVolume(vol.value / 100);     // 拖动时只调节音量，不重渲染面板避免滑块跳动
    });
    lpBtn.addEventListener('click', function () {
      applyLowPower(!lpOn);
      lpBtn.classList.toggle('on', lpOn);
      lpBtn.textContent = lpOn ? '开启' : '关闭';
      Engine.toast(lpOn
        ? '🔋 低功耗模式已开启：常驻动画暂停（手机更省电、不烫）'
        : '🌌 低功耗模式已关闭：界面动效恢复');
    });
    if (tmBtn) tmBtn.addEventListener('click', function () {
      var c = Engine.setTimerCfg({ on: !Engine.timerCfg().on });
      tmBtn.classList.toggle('on', c.on);
      tmBtn.textContent = c.on ? '开启' : '关闭';
      Engine.toast(c.on
        ? '⏱ 已开启限时作答：选择 / 填空开始倒计时，超时按答错结算'
        : '⏱ 已关闭限时：所有题型都不再计时');
    });
    lvBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var c = Engine.setTimerCfg({ level: b.dataset.lv });
        lvBtns.forEach(function (x) { x.classList.toggle('on', x.dataset.lv === c.level); });
        Engine.toast('⏱ 限时强度已切到「' + ({ loose: '宽松', std: '标准', tight: '严格' }[c.level]) + '」');
      });
    });
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  /** 当前龙珠进度（供剧情卡的出关结语显示） */
  function orbInfo() {
    return { count: orbCount(Store.snapshot().clearedCount), total: 7 };
  }

  NS.App = {
    launchNode: launchNode, renderMap: renderMap, openPanel: openPanel,
    closePanel: function () { togglePanel(false); },
    orbInfo: orbInfo, bondStripHtml: bondStripHtml, bondBookHtml: bondBookHtml
  };
})(window.HNSF829);
