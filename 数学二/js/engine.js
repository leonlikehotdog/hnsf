/* ============================================================
 * 829 闯关系统 · 答题引擎
 * 负责：单局战斗（题卡渲染 / 判分 / 实时反馈 / 连击 / 结算）
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var Store = null; // 延迟绑定，避免脚本顺序问题
  function store() { if (!Store) Store = NS.Store; return Store; }

  var els = {};
  var session = null;
  var onExitCb = null;

  /* ---------------- 工具：内容渲染 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * 把题干/解析里的文本转成 HTML。
   *
   * ⚠️ 数学二版特有的一步：**LaTeX 公式里的换行不能被换成 <br>**。
   * 公式一旦被 <br> 切断，KaTeX 拿到的就是半截片段，渲染必失败。
   * 所以先把 \(...\) \[...\] $$...$$ 整段"挖出来"占位，等换行处理完再放回去。
   */
  function fmt(text) {
    var blocks = [];
    var t = esc(text);
    t = t.replace(/```(\w*)\r?\n([\s\S]*?)```/g, function (m, lang, code) {
      blocks.push('<pre class="code-block"><code>' + code.replace(/\r?\n$/, '') + '</code></pre>');
      return '\u0001' + (blocks.length - 1) + '\u0001';
    });
    t = t.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

    // —— 保护公式（含跨行公式），避免被 <br> 拆断 ——
    var maths = [];
    t = t.replace(/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$/g, function (m) {
      maths.push(m);
      return '\u0002' + (maths.length - 1) + '\u0002';
    });

    t = t.replace(/\r?\n/g, '<br>');

    t = t.replace(/\u0002(\d+)\u0002/g, function (m, i) { return maths[+i]; });
    t = t.replace(/\u0001(\d+)\u0001/g, function (m, i) { return blocks[+i]; });
    return t;
  }

  /* ---------------- KaTeX 公式渲染 ---------------- */
  /**
   * 把元素里的 \(...\) \[...\] $$...$$ 渲染成真正的数学公式。
   *
   * 为什么不用现成的 auto-render 一条路走到黑：
   * fmt() 已经把换行变成了 <br>，一个跨行公式会被拆成好几个文本节点，
   * 中间夹着 <br> 元素。此时必须先把元素内相邻文本节点合并（normalize），
   * 并让匹配正则支持跨行（[\s\S]），否则渲染会静默失败。
   * 所以这里优先用 renderMathInElement（它对边界情况处理更全），
   * 拿不准时再退回手写 TreeWalker。
   */
  var MATH_PATTERN = /\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g;
  // 带 g 的正则 .test() 是有状态的（lastIndex 不重置），检测另用一个非全局正则
  var MATH_DETECT = /\\\(|\\\[|\$\$/;

  function renderMath(target) {
    if (!target) return;
    if (typeof katex === 'undefined' || typeof katex.renderToString !== 'function') return;
    if (typeof target.normalize === 'function') {
      try { target.normalize(); } catch (e) { /* 忽略 */ }
    }
    if (typeof renderMathInElement === 'function') {
      try {
        renderMathInElement(target, {
          delimiters: [
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$$', right: '$$', display: true }
          ],
          throwOnError: false,
          strict: false,
          trust: false
        });
        return;
      } catch (e) { /* 退回手动渲染 */ }
    }
    var walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentNode;
        while (p && p !== target) {
          if (p.tagName === 'SCRIPT' || p.tagName === 'STYLE' || p.tagName === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return MATH_DETECT.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (textNode) {
      var html = textNode.nodeValue.replace(MATH_PATTERN, function (match, g1, g2, g3, g4) {
        try {
          if (g1 !== undefined) return katex.renderToString(g1, { displayMode: false, throwOnError: false });
          if (g2 !== undefined) return katex.renderToString(g2, { displayMode: true, throwOnError: false });
          if (g3 !== undefined) return katex.renderToString(g3, { displayMode: true, throwOnError: false });
          if (g4 !== undefined) return katex.renderToString(g4, { displayMode: false, throwOnError: false });
        } catch (e) { /* 保留原文 */ }
        return match;
      });
      var span = document.createElement('span');
      span.innerHTML = html;
      var parent = textNode.parentNode;
      while (span.firstChild) parent.insertBefore(span.firstChild, textNode);
      parent.removeChild(textNode);
    });
  }

  /** 渲染可能包含公式的元素（KaTeX 未加载完就等一会儿，最多等 3 秒） */
  function renderMathLater(target, tries) {
    tries = tries || 0;
    if (typeof katex !== 'undefined') {
      try { renderMath(target); } catch (e) { /* 静默 */ }
    } else if (tries < 30) {
      setTimeout(function () { renderMathLater(target, tries + 1); }, 100);
    }
  }

  function norm(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[＊*×]/g, 'x')
      .replace(/²/g, '^2')
      .replace(/[（]/g, '(').replace(/[）]/g, ')')
      .replace(/[，]/g, ',')
      .replace(/[／]/g, '/');
  }

  function xpFor(q) {
    var base = { 1: 12, 2: 18, 3: 28 }[q.level] || 15;
    return base + (q.score || 3);
  }

  function analysisHtml(q) {
    if (!q.analysis) return '';
    return '<div class="fb-title">💡 解析</div><div class="fb-analysis">' + fmt(q.analysis) + '</div>';
  }

  /* ---------------- 题目质量增强字段的渲染 ----------------
   * diff         难度分级 basic 基础 / exam 真题 / hard 拔高
   * keys         得分点（每条自带分值，如「写出通解公式 （3 分）」）
   * tips         踩分技巧：算不出来时怎么写能抢过程分、什么时候该放弃
   * optionNotes  选择题专用，长度与 options 一致，逐条批驳干扰项
   * variants     同类变式，只给题干 + 提示（二刷换题做，答案自己算）
   */
  var DIFF_LABEL = { basic: '基础', exam: '真题', hard: '拔高' };

  function keysHtml(q) {
    if (!q.keys || !q.keys.length) return '';
    return '<div class="fb-title">🎯 得分点（对照给分）</div><ul class="fb-keys">' +
      q.keys.map(function (k) { return '<li>' + fmt(k) + '</li>'; }).join('') + '</ul>';
  }

  function tipsHtml(q) {
    if (!q.tips) return '';
    return '<div class="fb-tips"><b>💡 踩分技巧：</b>' + fmt(q.tips) + '</div>';
  }

  function optionNotesHtml(q) {
    if (q.type !== 'choice' || !q.optionNotes || !q.optionNotes.length) return '';
    var rows = q.options.map(function (o, i) {
      var note = q.optionNotes[i];
      if (!note) return '';
      var right = i === q.answer;
      return '<li class="' + (right ? 'on-right' : 'on-wrong') + '">' +
        '<span class="on-key">' + 'ABCD'[i] + '</span>' +
        '<span class="on-txt">' + fmt(o) + '</span>' +
        '<span class="on-why">' + (right ? '✅ ' : '❌ ') + fmt(note) + '</span></li>';
    }).join('');
    return '<div class="fb-title">🔍 干扰项逐条批驳</div><ul class="fb-opts">' + rows + '</ul>';
  }

  function variantsHtml(q) {
    if (!q.variants || !q.variants.length) return '';
    return '<div class="fb-title">🔁 同类变式（换题二刷）</div><ul class="fb-variants">' +
      q.variants.map(function (v) {
        return '<li><div class="va-stem">' + fmt(v.stem) + '</div>' +
          (v.hint ? '<div class="va-hint">💡 ' + fmt(v.hint) + '</div>' : '') + '</li>';
      }).join('') + '</ul>';
  }

  /** 作答后的完整反馈：答案 → 得分点 → 踩分技巧 → 干扰项批驳 → 解析 → 变式 → 溯源 */
  function feedbackHtml(q, withAnswer) {
    return (withAnswer ? '<div class="fb-title">正确答案</div><div class="fb-answer">' + fmt(answerText(q)) + '</div>' : '') +
      keysHtml(q) + tipsHtml(q) + optionNotesHtml(q) + analysisHtml(q) + variantsHtml(q) +
      '<div class="fb-source">🔗 考点溯源：' + fmt(q.source) + '</div>';
  }

  /* ---------------- 考点讲解外链 ---------------- */
  /**
   * 按题目的 node 取讲解链接（数据在 js/data-links.js）。
   * 具体视频会下架，所以每个考点额外配一条搜索链接兜底。
   * 这些链接都是打开新标签页，不会打断刷题进度。
   */
  function linksHtml(q) {
    var L = NS.LINKS && NS.LINKS[q.node];
    if (!L) return '';
    var chips = [];
    (L.videos || []).forEach(function (v) {
      chips.push('<a class="ql-chip" href="' + v.u + '" target="_blank" rel="noopener noreferrer"' +
        ' title="' + esc(String(v.by || '').replace(/"/g, '')) + '">📺 ' + esc(v.t) + '</a>');
    });
    if (L.biliKw) {
      chips.push('<a class="ql-chip ql-search" target="_blank" rel="noopener noreferrer"' +
        ' href="https://search.bilibili.com/all?keyword=' + encodeURIComponent(L.biliKw) + '">🔍 B站搜「' + esc(L.biliKw) + '」</a>');
    }
    if (L.csdnKw) {
      chips.push('<a class="ql-chip ql-search" target="_blank" rel="noopener noreferrer"' +
        ' href="https://so.csdn.net/so/search?q=' + encodeURIComponent(L.csdnKw) + '">📄 CSDN 讲解</a>');
    }
    if (!chips.length) return '';
    return '<div class="q-links">' +
      '<div class="q-links-head">🧭 这个考点不会？点开看讲解（新标签页打开，不影响刷题）</div>' +
      '<div class="q-links-body">' + chips.join('') + '</div>' +
      '</div>';
  }

  var TYPE_LABEL = { choice: '选择题', blank: '填空题', calc: '计算题', proof: '证明题', app: '应用题' };
  var LEVEL_LABEL = { 1: '基础简易', 2: '综合应用', 3: '创新拓展' };

  /* 成就稀有度（app.js 渲染成就墙时通过 NS.Engine.RARITY 取，避免两处写死） */
  var RARITY = {
    common: { label: '普通', cls: 'r-common' },
    rare: { label: '稀有', cls: 'r-rare' },
    epic: { label: '史诗', cls: 'r-epic' },
    legend: { label: '传说', cls: 'r-legend' }
  };

  /* ---------------- 打开 / 关闭 ---------------- */
  function init(refs) { els = refs; }

  /**
   * @param {Object} opts { node, questions, mode: 'node'|'wrong', onExit }
   */
  function open(opts) {
    var node = opts.node;
    var qs = opts.questions.slice();
    session = {
      node: node,
      mode: opts.mode || 'node',
      questions: qs,
      idx: 0,
      correct: 0,
      combo: 0,          // 全局连击（跨局累计，与存档一致）
      maxCombo: 0,
      runCombo: 0,       // 本局内的连对计数（答错清零，不跨局）
      maxRunCombo: 0,    // 本局最高连对，用于"单局纪录"类成就与结算对比
      log: [],
      locked: false,
      startTs: Date.now(),
      settled: false,
      // 开局前已可挑战的节点，用于精确计算本局「新解锁」的节点
      unlockedBefore: (NS.NODES.nodes || []).filter(function (n) {
        return store().unlocked(n).ok;
      }).map(function (n) { return n.id; })
    };
    onExitCb = opts.onExit || null;
    els.mask.classList.add('show');
    document.body.classList.add('no-scroll');
    // 热血氛围：切战斗曲 + 战斗战场背景（气焰更猛）+ 恢复屏幕边缘连击气焰
    if (NS.Audio) { NS.Audio.setScene('battle'); NS.Audio.sfx('open'); }
    if (NS.BG) NS.BG.setScene('battle');
    if (NS.FX) {
      NS.FX.resetCombo();
      var st = store().streak ? store().streak() : 0;
      if (st >= 2) NS.FX.combo(st);
    }
    // 这位「考官」是谁要记在 session 上：随机模式下每次抽的角色不同，
    // 结算页那句「XXX 认可了你」必须和本局实际站在台上的是同一个人。
    if (session.mode === 'wrong') {
      els.monsterEmoji.textContent = '🧟';
      session.char = setMonster('wrong', '错题本 · 重练');
    } else {
      els.monsterEmoji.textContent = node.icon || '🥋';
      session.char = setMonster(node.id, node.name);
    }
    resetMonster();
    // 完整亮相：从暗处浮现 + 光环炸开 + 报名号（1.5s），**每次进关卡都播**，不是只看一次。
    // 阵营决定名牌配色：友方偏蓝紫，反派偏血红。
    if (els.monster) {
      var foe = !!(session.char && session.char.side === 'foe');
      els.monster.classList.toggle('side-foe', foe);
      els.monster.classList.toggle('side-ally', !foe);
      els.monster.classList.add('enter');
      clearTimeout(els.monster._enterT);
      els.monster._enterT = setTimeout(function () { els.monster.classList.remove('enter'); }, 1500);
    }
    syncTrialInstant();
    renderBondStrip(node.id);
    renderQuestion();
  }

  /**
   * 本章遭遇录：把这一章的角色排成一条，已结伴的亮起、当前这位加金圈、还没轮到的压暗。
   * 这是**真实通关进度**（不是血条那种假条），一眼看出「这章还剩几位没见过」。
   */
  function renderBondStrip(currentId) {
    if (!els.bondStrip) return;
    var node = session && session.node;
    if (!node || session.mode === 'wrong') { els.bondStrip.innerHTML = ''; return; }
    if (!NS.App || !NS.App.bondStripHtml) { els.bondStrip.innerHTML = ''; return; }
    els.bondStrip.innerHTML = NS.App.bondStripHtml(node.chap, currentId);
  }

  /** 立绘探测结果统一存在 NS.Monsters 里（面板显示与随机模式筛选都要用） */
  function markStatus(id, s) {
    if (NS.Monsters && NS.Monsters.setStatus) NS.Monsters.setStatus(id, s);
  }

  /** 载入关卡对应的角色立绘；缺图自动回退 emoji（不会报错） */
  function setMonster(nodeId, label) {
    var M = NS.Monsters;
    if (!M) { if (els.monsterName) els.monsterName.textContent = label || ''; return null; }
    // 一对一固定映射：试炼卡说谁、台上就是谁、结算与羁绊录也都是同一个（不随机）
    var m = M.forNode(nodeId);
    if (els.monsterName) els.monsterName.textContent = M.label(m, label);
    if (!m) return null;

    // 脚下光环按角色属性染色
    if (els.monsterAura) {
      els.monsterAura.style.setProperty('--aura', hexToRgba(m.aura, 0.6));
    }

    setFullBody(m);

    if (!els.monsterImg) return m;
    var urls = M.urls ? M.urls(m) : [M.dir + m.file];
    var key = urls.join('|');
    var img = els.monsterImg;

    if (img.getAttribute('data-src') === key) {               // 同一组候选不重复请求
      var ok = img.getAttribute('data-ok') === '1';
      markStatus(m.id, img.getAttribute('data-src-ok') || (ok ? 'ok' : 'miss'));
      img.hidden = !ok;
      if (els.monsterEmoji) els.monsterEmoji.hidden = ok;
      return m;
    }
    img.setAttribute('data-src', key);
    img.setAttribute('data-ok', '0');
    img.setAttribute('data-src-ok', 'miss');
    img.hidden = true;
    if (els.monsterEmoji) els.monsterEmoji.hidden = false;

    // 依次尝试候选地址：先本机 custom/，再仓库内置图；全都失败才回退 emoji
    var idx = 0;
    function tryNext() {
      if (idx >= urls.length) {
        img.setAttribute('data-ok', '0');
        img.setAttribute('data-src-ok', 'miss');
        markStatus(m.id, 'miss');
        img.hidden = true;
        if (els.monsterEmoji) els.monsterEmoji.hidden = false;
        return;
      }
      img.src = urls[idx++];
    }
    img.onload = function () {
      var loaded = img.getAttribute('src') || '';
      var fromCustom = loaded.indexOf(('/' + M.customDir)) >= 0;
      img.setAttribute('data-ok', '1');
      img.setAttribute('data-src-ok', fromCustom ? 'custom' : 'ok');
      markStatus(m.id, fromCustom ? 'custom' : 'ok');
      img.classList.toggle('blend', m.blend === true || !/\.png$/i.test(loaded));   // 黑底素材（monsters 标记 blend）或非 PNG 用 screen 扣底
      img.hidden = false;
      if (els.monsterEmoji) els.monsterEmoji.hidden = true;
    };
    img.onerror = tryNext;
    tryNext();
    return m;
  }

  /** 战斗面板右侧的全身立绘：与角色立绘同图（浏览器只下载一次），放大铺在面板右缘外 */
  function setFullBody(m) {
    var img = els.fullBodyImg;
    if (!img) return;
    var M = NS.Monsters;
    if (!m || !M) {
      img.hidden = true;
      if (els.fullBodyName) els.fullBodyName.textContent = '';
      return;
    }
    if (els.fullBodyName) {
      els.fullBodyName.textContent = m.name || '';
      els.fullBodyName.style.color = m.aura || '';
    }
    var url = (M.dir || 'assets/dbz/') + m.file;
    if (img.getAttribute('data-src') === url) { img.hidden = false; return; }   // 同图不重复加载
    img.setAttribute('data-src', url);
    img.hidden = true;
    img.onload = function () { img.hidden = false; };        // 扣底由 CSS screen 混合负责
    img.onerror = function () {                              // 缺图 → 整块隐藏，不留破图
      img.hidden = true;
      img.removeAttribute('data-src');
    };
    img.src = url;
  }

  function hexToRgba(hex, alpha) {
    if (!hex || hex.charAt(0) !== '#') return hex || 'rgba(255,150,60,0.6)';
    var h = hex.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  /** 重置角色状态（进入关卡 / 重开时） */
  function resetMonster() {
    if (els.monster) els.monster.classList.remove('approve', 'reject', 'enter');
    if (els.trialBar) els.trialBar.classList.remove('struck');
  }

  function close() {
    els.mask.classList.remove('show');
    document.body.classList.remove('no-scroll');
    session = null;
    if (NS.Audio) NS.Audio.setScene('map');       // 回到地图曲
    if (NS.BG) NS.BG.setScene('map');             // 回到较为冷静的星空战场
    if (NS.FX) NS.FX.resetCombo();
    if (onExitCb) onExitCb();
  }

  /* ---------------- 渲染当前题 ---------------- */
  function renderQuestion() {
    var s = session, q = s.questions[s.idx];
    s.locked = false;
    updateHud();

    var optsHtml = '';
    if (q.type === 'choice') {
      optsHtml = '<div class="q-options">' + q.options.map(function (o, i) {
        return '<button class="opt" data-i="' + i + '"><span class="opt-key">' + 'ABCD'[i] + '</span><span class="opt-txt">' + fmt(o) + '</span></button>';
      }).join('') + '</div>';
    } else {
      var ph = q.type === 'blank' ? '在此输入答案（分数写 1/2，根号写 sqrt(2)，也可直接打式子）'
        : (q.type === 'proof' ? '在此书写证明过程（提交后对照参考答案自评）'
          : (q.type === 'calc' ? '在此书写解题步骤与最终结果' : '在此书写解答过程'));
      optsHtml = '<textarea class="q-input" id="qInput" rows="' + (q.type === 'blank' ? 2 : 10) + '" placeholder="' + ph + '"></textarea>';
    }

    els.body.innerHTML =
      '<div class="q-card">' +
        '<div class="q-tags">' +
          '<span class="tag tag-type">' + (TYPE_LABEL[q.type] || q.type) + '</span>' +
          '<span class="tag tag-level lv' + q.level + '">' + LEVEL_LABEL[q.level] + '</span>' +
          (q.diff ? '<span class="tag tag-diff d-' + q.diff + '">' + (DIFF_LABEL[q.diff] || q.diff) + '</span>' : '') +
          '<span class="tag tag-score">真题权重 ' + (q.score || 3) + '</span>' +
          '<span class="tag tag-xp">+' + xpFor(q) + ' XP</span>' +
        '</div>' +
        '<div class="q-stem">' + fmt(q.stem) + '</div>' +
        optsHtml +
        linksHtml(q) +
        '<div class="q-feedback" id="qFeedback"></div>' +
        // AI 区块放在 .q-card 里（不能放进 .q-feedback，因为简答题自评会整体重渲染 .q-feedback）
        '<div class="ai-block" id="aiBlock"></div>' +
      '</div>';

    renderMathLater(els.body);          // 渲染题干与选项里的公式

    if (q.type === 'choice') {
      els.body.querySelectorAll('.opt').forEach(function (btn) {
        btn.addEventListener('click', function () { submitChoice(+btn.dataset.i); });
      });
    } else {
      var input = els.body.querySelector('#qInput');
      input.focus();
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitText();
      });
    }

    els.foot.innerHTML =
      (q.type === 'choice' ? '<span class="foot-hint">点击选项直接判分</span>'
        : '<button class="btn btn-primary" id="btnSubmit">提 交</button><span class="foot-hint">Ctrl + Enter 快速提交</span>');
    if (q.type !== 'choice') {
      els.foot.querySelector('#btnSubmit').addEventListener('click', submitText);
    }
    mountAi('before');
    updateHud();
  }

  function trialPct(s) {
    return s.questions.length ? Math.max(0, s.correct / s.questions.length * 100) : 0;
  }

  function updateHud() {
    var s = session;
    if (!s) return;
    els.qProgress.textContent = '第 ' + (s.idx + 1) + ' / ' + s.questions.length + ' 题';
    // 「考验」= 已答对 / 总题数。只涨不跌，记的是真实掌握度。
    if (els.trialText) {
      // 末尾直接标出「有没有过线」—— 不然玩家看条过半了却判失败会莫名其妙
      var pct = Math.round(trialPct(s));
      els.trialText.textContent = '⚔️ 考验 ' + s.correct + ' / ' + s.questions.length +
        '　·　正确率 ' + pct + '%' + (pct >= store().PASS_RATE * 100 ? ' ✅ 已过线' : '');
    }
    if (s.combo >= 2) {
      els.comboBadge.textContent = '🔥 ' + s.combo + ' 连击';
      els.comboBadge.classList.add('show');
    } else {
      els.comboBadge.classList.remove('show');
    }
  }

  /** 考验条瞬时同步（进入关卡 / 重开时用，不做动画） */
  function syncTrialInstant() {
    var s = session;
    if (!s || !els.trialFill) return;
    els.trialFill.style.transition = 'none';
    els.trialFill.style.width = trialPct(s) + '%';
    void els.trialFill.offsetWidth;
    els.trialFill.style.transition = '';
    updateHud();
  }

  /** 答对之后考验条往前推一格 —— 这是全场唯一一个「只前进」的进度条 */
  function animateTrial() {
    var s = session;
    if (!s || !els.trialFill) return;
    els.trialFill.style.width = trialPct(s) + '%';
    if (els.trialBar) {
      els.trialBar.classList.remove('struck');
      void els.trialBar.offsetWidth;
      els.trialBar.classList.add('struck');
      setTimeout(function () { els.trialBar.classList.remove('struck'); }, 380);
    }
    updateHud();
  }

  /**
   * 角色反馈：答对 = 认可（点头 + 金光），答错 = 摇头（叹气 + 琥珀光）。
   * 不再是「你打我我打你」，而是「他在评判你答得对不对」——
   * 所以刻意不做倒地 / 暴怒 / 回血这些战斗动作。
   */
  function characterReact(kind) {
    if (!els.monster) return;
    els.monster.classList.remove('approve', 'reject');
    void els.monster.offsetWidth;
    els.monster.classList.add(kind === 'ok' ? 'approve' : 'reject');
    setTimeout(function () { els.monster.classList.remove('approve', 'reject'); }, 620);
  }

  /* ---------------- 判分与反馈 ---------------- */
  function submitChoice(i) {
    var s = session;
    if (!s || s.locked) return;
    var q = s.questions[s.idx];
    s.locked = true;
    if (NS.Audio) NS.Audio.sfx('click');
    var anchor = null;
    els.body.querySelectorAll('.opt').forEach(function (btn) {
      var bi = +btn.dataset.i;
      btn.disabled = true;
      if (bi === q.answer) btn.classList.add('right');
      if (bi === i && !ok0(q, i)) btn.classList.add('wrong');
      if (bi === i) {
        var r = btn.getBoundingClientRect();
        anchor = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
    });
    resolve(q, i === q.answer, null, false, anchor, i);
  }

  function ok0(q, i) { return i === q.answer; }

  function submitText() {
    var s = session;
    if (!s || s.locked) return;
    var q = s.questions[s.idx];
    var input = els.body.querySelector('#qInput');
    var val = input ? input.value : '';
    if (!val.trim()) { shake(input); return; }
    s.locked = true;
    if (input) input.disabled = true;

    if (q.type === 'blank') {
      var accepts = Array.isArray(q.answer) ? q.answer : [q.answer];
      var ok = accepts.some(function (a) { return norm(a) === norm(val); });
      if (!ok) {
        // 未匹配到 → 交给用户自评，避免因写法差异被误判
        selfJudge(q, val, '未能匹配到标准答案写法');
        return;
      }
      resolve(q, true, '你的答案与标准答案一致', false, null, val);
    } else {
      selfJudge(q, val, null);
    }
  }

  /** 简答/编程/SQL 题：展示参考答案 + 要点，由用户自评 */
  function selfJudge(q, val, note) {
    var fb = els.body.querySelector('#qFeedback');
    fb.innerHTML =
      '<div class="fb fb-pending">' +
        (note ? '<div class="fb-note">⚠️ ' + note + '，请对照参考答案自行判定</div>' : '') +
        '<div class="fb-title">📖 参考答案</div>' +
        '<div class="fb-answer">' + fmt(answerText(q)) + '</div>' +
        keysHtml(q) + tipsHtml(q) + optionNotesHtml(q) + analysisHtml(q) + variantsHtml(q) +
        '<div class="fb-source">🔗 考点溯源：' + fmt(q.source) + '</div>' +
        '<div class="self-judge">' +
          '<button class="btn btn-ok" id="btnSelfOk">我答对了</button>' +
          '<button class="btn btn-no" id="btnSelfNo">没答对</button>' +
        '</div>' +
      '</div>';
    fb.querySelector('#btnSelfOk').addEventListener('click', function () {
      resolve(q, true, null, true, null, val);
    });
    fb.querySelector('#btnSelfNo').addEventListener('click', function () {
      resolve(q, false, null, true, null, val);
    });
    renderMathLater(fb);                // 参考答案与要点里也有公式
    els.foot.innerHTML = '<span class="foot-hint">请对照参考答案后点选自评</span>';
    mountAi('after', val);
  }

  function resolve(q, ok, note, lockFeedback, anchor, chosen) {
    var s = session;
    s.log.push({ qid: q.id, ok: ok });

    // 先落库统计（含错题本、全局连击与成就判定），再结算经验，保证 HUD 数字与存档一致
    var rec = store().recordAnswer(s.node.id, q.id, ok) || {};
    var achGained = rec.achievements || [];
    var streak = rec.streak || 0;

    // 经验值实时结算
    var gained = 0, lvUp = null;
    if (ok) {
      s.correct++;
      s.combo = streak;                                       // 全局连击（跨关卡累计）
      if (s.combo > s.maxCombo) s.maxCombo = s.combo;
      s.runCombo = (s.runCombo || 0) + 1;                      // 本局连对（与全局连击分开算）
      if (s.runCombo > (s.maxRunCombo || 0)) s.maxRunCombo = s.runCombo;
      gained = xpFor(q) + (s.combo >= 3 ? s.combo * 2 : 0);   // 连击加成
      lvUp = store().addXp(gained);
      if (lvUp && lvUp.newAchievements) achGained = achGained.concat(lvUp.newAchievements);
      floatXp(gained, true);
      approveFeedback(anchor, s.combo, !!(lvUp && lvUp.leveledUp));
      animateTrial();
      characterReact('ok');
    } else {
      s.combo = 0;
      s.runCombo = 0;
      floatXp(0, false);
      rejectFeedback();
      characterReact('no');
    }
    achGained.forEach(function (a) {
      toast(a.icon + ' 成就解锁：' + a.name, 'ach');
      if (NS.Audio) NS.Audio.sfx('ach');
    });

    var fb = els.body.querySelector('#qFeedback');
    if (!lockFeedback) {
      fb.innerHTML =
        '<div class="fb ' + (ok ? 'fb-ok' : 'fb-no') + '">' +
          '<div class="fb-title">' + (ok ? '✅ 回答正确' : '❌ 回答错误') +
            (note ? '　<span class="fb-note-inline">' + note + '</span>' : '') + '</div>' +
          feedbackHtml(q, !ok) +
        '</div>';
    } else {
      var badge = document.createElement('div');
      badge.className = 'fb self-result ' + (ok ? 'fb-ok' : 'fb-no');
      badge.innerHTML = '<div class="fb-title">' + (ok ? '✅ 已记为答对' : '❌ 已记为答错，已加入错题本') + '</div>';
      fb.prepend(badge);
      fb.querySelectorAll('.self-judge').forEach(function (n) { n.remove(); });
    }
    renderMathLater(fb);                // 解析与正确答案里也有公式

    // 作答完毕后，把 AI 区块升级为"带答案与考生选择"的完整版
    mountAi('after', chosen);

    if (lvUp && lvUp.leveledUp) toast('🎉 升级！当前 Lv.' + lvUp.level, 'lvup');

    updateHud();
    var last = s.idx >= s.questions.length - 1;
    els.foot.innerHTML =
      '<button class="btn btn-primary" id="btnNext">' + (last ? '查看结算' : '下一题 →') + '</button>';
    var next = els.foot.querySelector('#btnNext');
    next.focus();
    next.addEventListener('click', nextQuestion);
  }

  /** 挂载/刷新 AI 助教区块（phase='before' 不剧透答案，'after' 才带上答案与考生选择） */
  function mountAi(phase, chosen) {
    var el = els.body.querySelector('#aiBlock');
    if (!el || !NS.AI) return;
    var s = session;
    if (!s) return;
    // 正在生成回答时不重挂，否则流式输出会写到已经脱离文档的节点上。
    // 注意：不能因为"已有错误提示"就跳过重挂 —— 那样作答后按钮会一直停在作答前的形态。
    if (NS.AI.streaming && NS.AI.streaming()) return;
    NS.AI.mount(el, {
      nodeName: s.node.name,
      q: s.questions[s.idx],
      chosen: chosen,
      phase: phase
    });
  }

  /**
   * 参考答案里的公式补定界符。
   *
   * 题库里的 answer 有两种写法：一种是已经带 \\( ... \\) 的，另一种是裸 LaTeX
   * （比如 `\\ln(x^2+1)+C`）—— 后者不补定界符就会被当成纯文本原样显示，
   * 考生看到的是 `\ln(x^2+1)+C` 这种原始代码，等于没给答案。
   * 只补「单行 + 含 LaTeX 命令或上下标」的情况：多行答案一般自带定界符，
   * 硬包一层 \\( \\) 会让 KaTeX 拿到跨行内容而报错。
   */
  function mathWrap(s) {
    var t = String(s == null ? '' : s);
    if (!t || /\n/.test(t)) return t;
    if (MATH_DETECT.test(t)) return t;                       // 已有定界符
    if (!/\\[a-zA-Z]|[\^_]\{/.test(t)) return t;              // 不含 LaTeX 命令或上下标，按纯文本
    return '\\( ' + t + ' \\)';
  }

  function answerText(q) {
    if (q.type === 'choice') return 'ABCD'[q.answer] + '．' + q.options[q.answer];
    // 填空题的 answer 是「多种可接受写法」的数组，全部列出，方便对照自己写的是哪一种
    if (Array.isArray(q.answer)) return q.answer.map(mathWrap).join('　或　');
    return mathWrap(q.answer);
  }

  function nextQuestion() {
    var s = session;
    if (!s) return;
    if (s.idx >= s.questions.length - 1) { settle(); return; }
    s.idx++;
    renderQuestion();
  }

  /* ---------------- 结算 ---------------- */
  function settle() {
    var s = session;
    if (s.settled) return;
    s.settled = true;

    var res = store().finishNode(s.node.id, { total: s.questions.length, correct: s.correct, maxCombo: s.maxRunCombo || 0 });

    // 结算演出：通关凯歌 + 金色气浪；失败则震屏
    if (res.pass) {
      if (NS.Audio) NS.Audio.sfx('clear');
      if (NS.FX) NS.FX.powerUp(res.perfect ? '255,228,150' : '255,205,90');
    } else {
      if (NS.Audio) NS.Audio.sfx('wrong');
      if (NS.FX) NS.FX.shake(2);
    }
    if (NS.FX) NS.FX.resetCombo();

    // 计算本局真正新解锁的节点（开局前已可挑战的不再重复提示）
    var newly = [];
    (NS.NODES.nodes).forEach(function (n) {
      if (s.unlockedBefore.indexOf(n.id) >= 0) return;
      if (store().unlocked(n).ok) newly.push(n);
    });

    // 结算时刷新遭遇条：刚通过的那位当场点亮。
    // 放在这里（而不是答对那一刻）是因为「结伴」的判定是**整个考点通关**，
    // 答对单题还只是过程分，提前点亮就是骗人。
    renderBondStrip(s.node.id);

    var elapsed = Math.round((Date.now() - s.startTs) / 1000);
    var rate = Math.round(res.rate * 100);
    var prevBestPct = Math.round((res.prevBest || 0) * 100);
    var nr = res.newRecord || {};

    // 破纪录提示：只在「真的刷新了历史最好成绩」时出现，避免每次通关都刷屏
    var recHtml = '';
    if (nr.rate && nr.rate.prev > 0) {
      recHtml += '<div class="settle-row rec">🏆 新纪录：单局正确率 ' + Math.round(nr.rate.now * 100) + '%' +
        '<span class="rec-old">原 ' + Math.round(nr.rate.prev * 100) + '%</span></div>';
    }
    if (nr.combo && nr.combo.prev > 0) {
      recHtml += '<div class="settle-row rec">🏆 新纪录：单局连击 ' + nr.combo.now +
        '<span class="rec-old">原 ' + nr.combo.prev + '</span></div>';
    }
    // 本节点历史最佳对比：给自己一个"上次比这次差"的参照
    var bestCmp = '';
    if (prevBestPct > 0) {
      bestCmp = rate > prevBestPct ? '<span class="rec-up">本局 ↑ ' + rate + '%</span>'
        : rate < prevBestPct ? '<span class="rec-down">本局 ↓ ' + rate + '%</span>'
          : '<span class="rec-eq">本局持平</span>';
    }

    els.body.innerHTML =
      '<div class="settle ' + (res.pass ? 'win' : 'lose') + '">' +
        '<div class="settle-icon">' + (res.perfect ? '💎' : res.pass ? '🏆' : '💀') + '</div>' +
        '<div class="settle-title">' + (res.perfect ? '完美通关！' : res.pass ? '通关成功' : '挑战失败') + '</div>' +
        '<div class="settle-sub">' + s.node.name + '</div>' +
        '<div class="settle-grid">' +
          '<div class="sg"><b>' + s.correct + '/' + s.questions.length + '</b><span>答对题数</span></div>' +
          '<div class="sg"><b>' + rate + '%</b><span>正确率</span></div>' +
          '<div class="sg"><b>' + (s.maxRunCombo || 0) + '</b><span>单局最高连对</span></div>' +
          '<div class="sg"><b>' + elapsed + 's</b><span>用时</span></div>' +
        '</div>' +
        recHtml +
        '<div class="settle-row"><span>本节点历史最佳</span><b>' + Math.max(prevBestPct, rate) + '%' + (bestCmp ? '　' + bestCmp : '') + '</b></div>' +
        '<div class="settle-row"><span>通关奖励</span><b>+' + res.bonus + ' XP</b></div>' +
        (res.firstClear ? '<div class="settle-row hl">🎁 首次通关额外奖励已计入</div>' : '') +
        (res.pass ? '<div class="settle-row hl">' + (s.mode === 'wrong'
          ? '🧹 这批错题已消化　·　回错题本看看还剩哪些'
          : '🤝 ' + esc((s.char && s.char.name) || '他') + ' 认可了你　·　本关心法已收录（简报里可随时回看）') +
          '</div>' : '') +
        (!res.pass ? '<div class="settle-note">正确率需达到 ' + Math.round(store().PASS_RATE * 100) + '% 才能通关，再来一次！</div>' : '') +
        (res.pass ? '<div class="loot-box" id="lootBox">' +
          '<div class="loot-head">🎁 通关宝箱</div>' +
          '<div class="loot-hint" id="lootHint">点开才知道是什么 —— ' +
            (res.firstClear ? '首通宝箱，奖池更好' : '常规宝箱') + '</div>' +
          '<button class="loot-btn" id="btnLoot">开 箱</button>' +
          '<div class="loot-result" id="lootResult"></div>' +
        '</div>' : '') +
        (newly.length ? '<div class="unlock-box"><div class="ub-title">🔓 新节点已解锁</div>' +
          newly.map(function (n) { return '<div class="ub-item">' + (n.icon || '●') + ' ' + n.name + '</div>'; }).join('') +
          '</div>' : '') +
        (res.newAchievements.length ? '<div class="ach-box"><div class="ub-title">🏅 获得成就</div>' +
          res.newAchievements.map(function (a) {
            var r = RARITY[a.rarity] || RARITY.common;
            return '<div class="ub-item">' + a.icon + ' ' + a.name +
              ' <span class="ach-rarity ' + r.cls + '">' + r.label + '</span>' +
              '　<span class="ach-desc">' + a.desc + '</span></div>';
          }).join('') +
          '</div>' : '') +
      '</div>';

    els.foot.innerHTML =
      '<button class="btn" id="btnRetry">' + (res.pass ? '再刷一次' : '重新挑战') + '</button>' +
      (res.pass && newly.length ? '<button class="btn btn-primary" id="btnGoNext">前往新节点：' + newly[0].name + '</button>' : '') +
      '<button class="btn btn-primary" id="btnBack">返回地图</button>';

    var back = els.foot.querySelector('#btnBack');
    back.addEventListener('click', close);
    els.foot.querySelector('#btnRetry').addEventListener('click', function () {
      open({ node: s.node, questions: s.questions, mode: s.mode, onExit: onExitCb });
    });
    if (res.pass && newly.length) {
      els.foot.querySelector('#btnGoNext').addEventListener('click', function () {
        var n = newly[0];
        close();
        NS.App.launchNode(n.id);
      });
    }
    // 通关宝箱：先摇动、再揭晓。s.lootOpened 保证一局只能开一次（重进结算页也不重复发奖）
    var lootBtn = els.body.querySelector('#btnLoot');
    if (lootBtn) {
      lootBtn.addEventListener('click', function () {
        if (s.lootOpened) return;
        s.lootOpened = true;
        lootBtn.disabled = true;
        lootBtn.textContent = '开启中…';
        var box = els.body.querySelector('#lootBox');
        var hint = els.body.querySelector('#lootHint');
        box.classList.add('shaking');
        if (NS.Audio) NS.Audio.sfx('open');
        hint.textContent = '会是什么呢…';
        // 620ms 的"摇"就是全部意义所在：先制造不确定，再揭晓
        setTimeout(function () {
          var r = store().openLoot(res.bonus, res.firstClear);
          var t = r.tier;
          box.classList.remove('shaking');
          box.classList.add('opened', 'tier-' + t.id);
          lootBtn.style.display = 'none';
          els.body.querySelector('#lootResult').innerHTML =
            '<div class="loot-tier" style="color:' + t.color + '">' + t.icon + ' ' + t.name + '宝箱</div>' +
            '<div class="loot-gain">经验 ×' + t.mult + '　<b>+' + r.gain + ' XP</b></div>' +
            (t.id === 'l' ? '<div class="loot-fame">🎉 欧皇时刻！传说箱是概率最低的那一档。</div>' : '') +
            (t.id === 'p' ? '<div class="loot-fame">手气不错，史诗箱！</div>' : '') +
            (r.leveledUp ? '<div class="loot-fame">⬆️ 等级提升到 Lv.' + r.level + '</div>' : '');
          hint.textContent = '本局宝箱已开启，再通关还能再开';
          // 音效随稀有度升级：普通是"收集"，史诗是"成就"，传说是"神龙降临"
          if (NS.Audio) {
            if (t.id === 'l') NS.Audio.sfx('dragon');
            else if (t.id === 'p') NS.Audio.sfx('ach');
            else NS.Audio.sfx('collect');
          }
          if (NS.FX && t.mult >= 2) NS.FX.powerUp('255,210,110');
          (r.newAchievements || []).forEach(function (a) { toast(a.icon + ' 成就解锁：' + a.name, 'ach'); });
        }, 620);
      });
    }
    // 结算阶段新解锁的成就（破关 / 连击 / 层级 / 模块等）逐个提示
    (res.newAchievements || []).forEach(function (a) { toast(a.icon + ' 成就解锁：' + a.name, 'ach'); });
    // 破纪录单独提示（金色）
    if (nr.rate && nr.rate.prev > 0) toast('🏆 新纪录！单局正确率 ' + Math.round(nr.rate.now * 100) + '%', 'rec');
    if (nr.combo && nr.combo.prev > 0) toast('🏆 新纪录！单局连击 ' + nr.combo.now, 'rec');
  }

  /* ---------------- 打击感反馈 ---------------- */
  /**
   * 连击里程碑。没有这个的话，连到 5 连之后只是数字变大，
   * 越连越麻木；每到一档来一次明显的演出，才有"再来一题"的冲动。
   */
  var COMBO_MILESTONES = {
    5:  { text: '⚡ 五连击！', color: '255,200,80', big: false },
    10: { text: '🔥 十连击！！', color: '255,150,60', big: false },
    15: { text: '💥 十五连击！！！', color: '220,130,255', big: true },
    20: { text: '🌪️ 二十连击 · 超凡！', color: '255,238,180', big: true }
  };

  /** 答对：他认可你（原「会心一击」的战斗说法已去掉，改成人对人的认可） */
  function approveFeedback(anchor, combo, leveledUp) {
    if (!NS.FX) return;
    var a = anchor;
    if (!a) {
      var r = els.body.getBoundingClientRect();
      a = { x: r.left + r.width / 2, y: r.top + Math.min(r.height * 0.35, 220) };
    }
    NS.FX.burst(a.x, a.y, '255,190,80');
    NS.FX.flash('255,190,80', 0.75);
    NS.FX.shake(1);
    NS.FX.label('认可！', 'hit');
    NS.FX.combo(combo);
    if (combo >= 3) NS.FX.label('连击 × ' + combo, 'combo');
    if (NS.Audio) {
      NS.Audio.sfx('correct');
      if (combo >= 3) NS.Audio.sfx('combo', combo);
    }
    // 里程碑：金色气浪 + 冲击环 + 提示
    var mile = COMBO_MILESTONES[combo];
    if (mile) {
      NS.FX.powerUp(mile.color);
      NS.FX.label(mile.text, 'combo');
      if (NS.Audio) {
        NS.Audio.sfx('combo', 12);          // 用最高音，和普通连击音区分开
        if (mile.big) NS.Audio.sfx('levelup');
      }
    }
    if (leveledUp) {
      if (NS.Audio) NS.Audio.sfx('levelup');
      NS.FX.powerUp('255,200,80');
    }
  }

  /** 答错：他摇了摇头。红闪/震屏改成更轻的琥珀色，因为你没被谁"打"，只是被否了 */
  function rejectFeedback() {
    if (!NS.FX) return;
    NS.FX.flash('245,158,11', 0.6);
    NS.FX.label('他摇了摇头…', 'hurt');
    NS.FX.resetCombo();
    if (NS.Audio) NS.Audio.sfx('wrong');
  }

  /* ---------------- 动效 ---------------- */
  function floatXp(n, ok) {
    var el = document.createElement('div');
    el.className = 'xp-float ' + (ok ? 'plus' : 'minus');
    el.textContent = ok ? '+' + n + ' XP' : '× 答错了，再接再厉';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1100);
  }

  function shake(el) {
    if (!el) return;
    el.classList.add('shake');
    setTimeout(function () { el.classList.remove('shake'); }, 400);
  }

  function toast(msg, type) {
    var wrap = document.getElementById('toastWrap');
    if (!wrap) return;
    var t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.innerHTML = msg;
    wrap.appendChild(t);
    setTimeout(function () { t.classList.add('in'); }, 10);
    setTimeout(function () { t.classList.remove('in'); setTimeout(function () { t.remove(); }, 300); }, 2600);
  }

  NS.Engine = {
    init: init,
    open: open,
    close: close,
    toast: toast,
    fmt: fmt,
    xpFor: xpFor,
    /** 角色立绘探测状态：id -> 'ok' | 'miss'（供面板显示素材完整度） */
    monsterStatus: function () { return (NS.Monsters && NS.Monsters.statusMap) ? NS.Monsters.statusMap() : {}; },
    TYPE_LABEL: TYPE_LABEL,
    LEVEL_LABEL: LEVEL_LABEL,
    DIFF_LABEL: DIFF_LABEL,
    RARITY: RARITY,
    renderMath: renderMath
  };
})(window.HNSF829);
