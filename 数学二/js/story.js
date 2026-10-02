/* ============================================================
 * 302 数学二 · 分镜卡（节点过场 / 出关结语）
 * ------------------------------------------------------------
 * 承担两种演出，共用同一张卡：
 *   1) **节点过场**（点考点就播，每次都播）：两页 ——
 *      页 1「这一章」由**章节关主**开口（首次进章说完整战书，之后只说一行氛围语），
 *      页 2「本关」由**本关出题人**亮相交代这一关要练什么。
 *      两个说话人是两个角色，各有各的立绘，所以是"两页"而不是"一页塞两段话"。
 *   2) **出关结语**（整章通关后一次）：单页，章节关主收尾。
 *
 * 三个刻意的设计：
 *   1) **打字机**。台词一个字一个字蹦出来，比整段砸出来更像"有人在说话"，
 *      而且给玩家一个随时跳过的出口（点一下补全、再点一下翻页/关闭）。
 *   2) **立绘取该角色本人**，和地图头像、试炼卡、羁绊录用的是同一套素材与映射，
 *      所以黑底抠图、aura 配色全部复用，零新增资源。
 *   3) **页数 > 1 时才显示「跳过」**，单页演出没必要多给一个按钮。
 *
 * ⚠️ 曾经挂在「接受试炼」上的章节入关卡已**并入本卡的第 1 页** ——
 *    否则第一次进章会连弹三张卡（节点过场 → 简报 → 入关卡），太啰嗦。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var els = {};
  var inited = false;
  var timer = null;          // 打字机定时器
  var fullText = '';         // 当前这一页的完整文本
  var pages = [];            // 本次演出的所有页
  var pi = 0;                // 当前页下标
  var afterAll = null;       // 整段演完（或跳过）后的回调

  var SPEED = 24;            // 每个字的毫秒数

  function data(chapId) {
    var S = NS.STORY || {};
    return S[chapId] || null;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------------- 章节元信息 ---------------- */
  function chapterMeta(chapId) {
    var list = (NS.NODES && NS.NODES.meta && NS.NODES.meta.chapters) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === chapId) return list[i];
    return null;
  }

  function moduleName(chapId) {
    var c = chapterMeta(chapId);
    if (!c) return '';
    var mods = (NS.NODES && NS.NODES.meta && NS.NODES.meta.modules) || [];
    for (var i = 0; i < mods.length; i++) if (mods[i].id === c.module) return mods[i].name;
    return '';
  }

  /** 这一章是否已全部通关（只看已开放的节点，建设中的不算） */
  function chapterDone(chapId) {
    var nodes = (NS.NODES && NS.NODES.nodes) || [];
    var list = nodes.filter(function (n) { return n.chap === chapId && !n.wip; });
    if (!list.length) return false;
    for (var i = 0; i < list.length; i++) if (!NS.Store.isCleared(list[i].id)) return false;
    return true;
  }

  /** 某一章的角色集合（角色 id -> true）。用来校验剧情卡关主是不是本章的人。 */
  function chapterCast(chapId) {
    var cast = {};
    var nodes = (NS.NODES && NS.NODES.nodes) || [];
    var M = NS.Monsters;
    if (!M) return cast;
    nodes.forEach(function (n) {
      if (n.chap !== chapId) return;
      var m = M.forNode(n.id);
      if (m) cast[m.id] = true;
    });
    return cast;
  }

  /**
   * 这一章的「关主」：取该章第一个已开放节点对应的角色。
   * 这是 data-story.js 里 avatar 校验失败时的兜底 ——
   * 宁可换一张脸，也不能让剧情卡上站着一位本章根本不会出场的角色。
   */
  function chapterLead(chapId) {
    var nodes = (NS.NODES && NS.NODES.nodes) || [];
    var inChap = nodes.filter(function (n) { return n.chap === chapId; });
    var pick = inChap.filter(function (n) { return !n.wip; })[0] || inChap[0];
    return pick ? pick.id : '';
  }

  /* ---------------- 关卡简报里的那一行氛围语 ---------------- */
  function chapterLineHtml(chapId) {
    var d = data(chapId);
    if (!d) return '';
    return '<div class="nd-story"><b>📖 ' + esc(d.arc) + ' · ' + esc(d.place) + '</b>' +
      '<span>' + esc(d.line) + '</span></div>';
  }

  /* ---------------- 立绘 ----------------
   * ⚠️ 这里必须用 byId（角色 id）而不是 forNode（节点 id）。
   *    data-story.js 里写的是「克林 / 弗利萨」这类**角色 id**；
   *    forNode 收到角色 id 会查不到、静默回退成悟空——所有章都会变成悟空站台。
   */
  function setFigure(chapId, charId) {
    var M = NS.Monsters;
    if (!M) { els.img.hidden = true; els.name.textContent = ''; return; }
    // 关主必须是本章出场过的角色，否则地图头像 / 试炼卡 / 羁绊录 / 剧情卡会各说各话
    if (charId && !chapterCast(chapId)[charId]) {
      charId = M.forNode(chapterLead(chapId)).id;
    }
    var m = charId ? M.byId(charId) : null;
    if (!m && charId) m = M.forNode(charId);            // 兜底：万一手滑填了节点 id
    if (!m) { els.img.hidden = true; els.name.textContent = ''; return; }
    els.card.style.setProperty('--aura', m.aura || '#c084fc');
    els.name.textContent = m.name || '';
    els.name.style.color = m.aura || '';
    var url = (M.dir || 'assets/dbz/') + m.file;
    if (els.img.getAttribute('data-src') === url) { els.img.hidden = false; return; }
    els.img.setAttribute('data-src', url);
    els.img.hidden = true;
    els.img.onload = function () { els.img.hidden = false; };
    els.img.onerror = function () { els.img.hidden = true; els.img.removeAttribute('data-src'); };
    els.img.src = url;
  }

  /* ---------------- 龙珠进度（只给出关卡用） ---------------- */
  function renderOrb(show) {
    if (!show || !NS.App || !NS.App.orbInfo) { els.orb.hidden = true; return; }
    var info = NS.App.orbInfo();
    var html = '<span class="story-orb-label">龙珠</span>';
    for (var i = 1; i <= info.total; i++) {
      html += '<i class="story-orb-dot' + (i <= info.count ? ' got' : '') + '">★</i>';
    }
    html += '<span class="story-orb-num">' + info.count + ' / ' + info.total + '</span>';
    els.orb.innerHTML = html;
    els.orb.hidden = false;
  }

  /* ---------------- 打字机 ---------------- */
  function typeText(text) {
    clearInterval(timer);
    fullText = text || '';
    var i = 0;
    els.text.textContent = '';
    els.card.classList.add('typing');
    if (!fullText) { finishTyping(); return; }
    timer = setInterval(function () {
      i++;
      els.text.textContent = fullText.slice(0, i);
      if (i >= fullText.length) finishTyping();
    }, SPEED);
  }

  function finishTyping() {
    clearInterval(timer);
    timer = null;
    els.text.textContent = fullText;
    els.card.classList.remove('typing');
  }

  function isTyping() { return timer !== null; }

  /* ---------------- 渲染当前页 ---------------- */
  function renderPage() {
    var p = pages[pi] || {};
    els.card.className = 'story-card ' + (p.cls || '');
    els.badge.textContent = p.badge || '';
    els.title.textContent = p.title || '';
    els.btn.textContent = (pi < pages.length - 1) ? '继 续 ▸' : (p.endLabel || '出 发 ▸');
    els.page.textContent = pages.length > 1 ? (pi + 1) + ' / ' + pages.length : '';
    els.skip.hidden = pages.length <= 1;
    setFigure(p.chapId, p.figure);
    renderOrb(!!p.showOrb);
    typeText(p.text);
    if (NS.Audio) NS.Audio.sfx(p.sfx || 'open');
  }

  /* ---------------- 显示 / 推进 / 关闭 ---------------- */
  function showPages(list, cb) {
    if (!list || !list.length) { if (cb) cb(); return false; }
    pages = list;
    pi = 0;
    afterAll = cb || null;
    els.mask.classList.add('show');
    els.mask.setAttribute('aria-hidden', 'false');
    renderPage();
    setTimeout(function () {
      try { els.btn.focus(); } catch (e) { /* 忽略 */ }
    }, 30);
    return true;
  }

  /** 点一下：正在打字 → 立刻补全；已打完 → 下一页；最后一页 → 关闭 */
  function advance() {
    if (!els.mask.classList.contains('show')) return;
    if (isTyping()) { finishTyping(); return; }
    if (pi < pages.length - 1) { pi++; renderPage(); return; }
    close();
  }

  function close() {
    els.mask.classList.remove('show');
    els.mask.setAttribute('aria-hidden', 'true');
    clearInterval(timer);
    timer = null;
    var cb = afterAll;
    afterAll = null;
    pages = [];
    pi = 0;
    if (cb) cb();
  }

  /* ---------------- 对外：节点过场 ---------------- */
  /**
   * 点开一个考点时播的过场（**每次都播**）。
   * 返回 true 表示"卡已经接管了流程"——调用方**必须**把原本的动作放进 cb，
   * 不然简报会在卡的底下先弹出来。
   */
  function maybeNodeIntro(nodeId, cb) {
    var nodes = (NS.NODES && NS.NODES.nodes) || [];
    var node = nodes.filter(function (n) { return n.id === nodeId; })[0];
    if (!node) { if (cb) cb(); return false; }
    var M = NS.Monsters;
    if (!M || !TRIAL(nodeId)) { if (cb) cb(); return false; }

    var d = data(node.chap) || {};
    var first = !NS.Store.storySeen('intro', node.chap);
    var list = [];

    // 页 1「这一章」：章节关主开口。首次进章说完整战书，之后只说一行氛围语
    var lead = chapterLead(node.chap);
    if (lead && (d.intro || d.line)) {
      list.push({
        badge: '📖 这一章',
        cls: 'is-chapter',
        title: (d.arc || '') + (d.place ? ' · ' + d.place : ''),
        chapId: node.chap,
        figure: M.forNode(lead).id,
        text: (first ? d.intro : d.line) || d.line || '',
        sfx: 'open'
      });
    }

    // 页 2「本关」：本关出题人亮相，说这一关要练什么
    var me = M.forNode(nodeId);
    list.push({
      badge: (me.side === 'foe' ? '⚔️ 本关' : '🤝 本关') + '　·　' + node.name,
      cls: me.side === 'foe' ? 'is-intro is-foe' : 'is-intro',
      title: me.name,
      chapId: node.chap,
      figure: me.id,
      text: TRIAL(nodeId),
      endLabel: '接 受 ▸',
      sfx: 'open'
    });

    if (first) NS.Store.markStory('intro', node.chap);   // 战书已交代过，下次只说一行
    return showPages(list, cb);
  }

  function TRIAL(nodeId) {
    var T = NS.TRIAL || {};
    return T[nodeId] || '';
  }

  /* ---------------- 对外：出关结语 ---------------- */
  /** 这一章全部通关且没看过结语 → 弹单页收尾 */
  function maybeOutro(chapId) {
    var d = data(chapId);
    if (!d || !d.outro) return false;
    if (NS.Store.storySeen('outro', chapId)) return false;
    if (!chapterDone(chapId)) return false;
    var c = chapterMeta(chapId);
    var mod = moduleName(chapId);
    var M = NS.Monsters;
    var lead = M ? M.forNode(chapterLead(chapId)).id : '';
    NS.Store.markStory('outro', chapId);
    return showPages([{
      badge: '🏁 出关 · ' + (c ? (mod + ' · 第 ' + c.no + ' 关') : mod),
      cls: 'is-outro',
      title: d.arc + ' · ' + d.place,
      chapId: chapId,
      figure: d.avatar && chapterCast(chapId)[d.avatar] ? d.avatar : lead,
      text: d.outro,
      showOrb: true,
      endLabel: '收 下 ▸',
      sfx: 'collect'
    }], null);
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    if (inited) return;
    inited = true;
    els.mask = document.getElementById('storyMask');
    els.card = document.getElementById('storyCard');
    els.badge = document.getElementById('storyBadge');
    els.title = document.getElementById('storyTitle');
    els.img = document.getElementById('storyImg');
    els.name = document.getElementById('storyName');
    els.text = document.getElementById('storyText');
    els.orb = document.getElementById('storyOrb');
    els.btn = document.getElementById('storyBtn');
    els.page = document.getElementById('storyPage');
    els.skip = document.getElementById('storySkip');
    if (!els.mask) return;

    els.btn.addEventListener('click', function (e) { e.stopPropagation(); advance(); });
    if (els.skip) els.skip.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    els.mask.addEventListener('click', advance);
  }

  /** Esc 由 app.js 的全局键盘处理统一转发过来（先关卡再剧情，避免两层同时关） */
  function handleEsc() {
    if (!els.mask || !els.mask.classList.contains('show')) return false;
    advance();
    return true;
  }

  NS.Story = {
    init: init,
    maybeNodeIntro: maybeNodeIntro,
    maybeOutro: maybeOutro,
    chapterLineHtml: chapterLineHtml,
    chapterDone: chapterDone,
    chapterCast: chapterCast,
    chapterLead: chapterLead,
    data: data,
    handleEsc: handleEsc
  };
})(window.HNSF829);
