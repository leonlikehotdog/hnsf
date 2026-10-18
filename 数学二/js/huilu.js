/* ============================================================
 * 回炉间 · 错题复盘（PC 键盘流）
 * ------------------------------------------------------------
 * 三道屏：
 *   ① 诊断屏 —— 原题 + 「你当时选了什么」+ 逐选项诊断
 *                诊断文案直接取自题库里已有的 optionNotes（本来就是给干扰项写的复盘稿）
 *   ② 变形屏 —— 出同类变式（不是原题！），自己做完再看解析，诚实自评
 *   ③ 归位屏 —— 段位前进；第二段必须真·隔天，「出炉」才算消化
 *
 * 设计立场：复盘不发奖励。它唯一的产出是「可信度」——也就是分数。
 * 键盘：Space/Enter = 主操作　1 = 答对了　2 = 没答对　Esc = 退出
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var Store = NS.Store;
  var BANK = NS.Q || window.HNSF829_Q || [];
  var SESSION_LIMIT = 8;                 // 一局回炉的题量（3–5 分钟）
  var ALPHA = 'ABCDEFGH';

  var qById = {};
  BANK.forEach(function (q) { qById[q.id] = q; });

  var els = {}, sess = null, onExitCb = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmt(t) { return NS.Engine.fmt(t == null ? '' : String(t)); }
  function typeset(el) { if (el) NS.Engine.renderMath(el); }
  function nodeOf(id) {
    if (id === 'arena') return { name: '天下第一武道会', icon: '⚔️', points: [] };
    return Store.nodeById(id) || { name: id, icon: '📘', points: [] };
  }
  function qid2q(qid) { return qById[qid]; }

  function init(refs) {
    els = refs;
    if (els.close) els.close.addEventListener('click', function () { close(); });
    document.addEventListener('keydown', onKey);
  }

  function isOpen() { return !!(els.mask && els.mask.classList.contains('show')); }

  function close() {
    if (!isOpen()) return;
    els.mask.classList.remove('show');
    els.mask.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    sess = null;
    var cb = onExitCb; onExitCb = null;
    if (cb) cb();
  }

  /** 打开回炉间。opts.qids = 指定题目（错题本单题回炉）；否则取「今天到期的」队列 */
  function open(opts) {
    opts = opts || {};
    var qids = (opts.qids && opts.qids.length)
      ? opts.qids.filter(function (id) { return !!qById[id] && !!Store.hlState(id); })
      : Store.hlQueue(SESSION_LIMIT).ready.slice();
    onExitCb = opts.onExit || null;
    sess = {
      qids: qids, idx: 0, step: 'diag', phase: 'ask',
      out: 0, adv: 0, gated: 0, wrong: 0, stuck: 0,
      variant: null, last: null
    };
    els.mask.classList.add('show');
    els.mask.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    if (!qids.length) { renderEmpty(); return; }
    render();
  }

  /* ---------------- 队列信息 ---------------- */
  function pickVariant(q, used) {
    var vs = q.variants || [];
    if (!vs.length) return null;
    for (var i = 0; i < vs.length; i++) {
      if (used.indexOf(i) < 0) return { idx: i, v: vs[i] };
    }
    return { idx: 0, v: vs[0] };                  // 变式用完了就从头再来
  }

  function setHead(count) {
    var sum = Store.hlSummary();
    els.sub.textContent = '今天可验 ' + sum.ready + ' 道' +
      (sum.pending ? ' · 还有 ' + sum.pending + ' 道在等明天' : '') +
      (sum.stuck ? ' · ' + sum.stuck + ' 道待师傅讲' : '');
    els.count.textContent = count;
  }

  function setProgress(frac) {
    els.bar.style.width = Math.max(0, Math.min(100, frac * 100)) + '%';
  }

  /* ---------------- 渲染 ---------------- */
  function renderEmpty() {
    var sum = Store.hlSummary();
    setHead('0 / 0');
    setProgress(0);
    var body;
    if (!sum.total) {
      body = '<div class="hl-empty">🎉 <b>错题本是空的。</b>' +
        '<p>去考点地图上刷题 —— 做错的题会自动进回炉间，' +
        '在这里用「同类变式」验完两段（第二段要隔天）才算真消化。</p></div>';
    } else {
      body = '<div class="hl-empty">⏳ <b>今天没有到期的回炉。</b>' +
        '<p>' + sum.pending + ' 道正在等明天（间隔重复：第二次验证必须跨过凌晨 4 点）。' +
        (sum.stuck ? '<br>' + sum.stuck + ' 道连错 2 次，已撤下队列，去错题本里请师傅讲一遍。' : '') +
        '</p></div>';
    }
    els.body.innerHTML = body;
    els.foot.innerHTML = '<button class="btn btn-primary" id="hlEmptyClose">关闭</button>';
    $('hlEmptyClose').addEventListener('click', close);
  }

  function render() {
    var qid = sess.qids[sess.idx];
    var q = qid2q(qid);
    if (!q) { next(); return; }
    setHead((sess.idx + 1) + ' / ' + sess.qids.length);
    var frac = (sess.idx + (sess.step === 'diag' ? 0.15 : sess.step === 'drill' ? 0.6 : 1)) / sess.qids.length;
    setProgress(frac);
    if (sess.step === 'diag') renderDiag(q);
    else if (sess.step === 'drill') renderDrill(q);
    else if (sess.step === 'verdict') renderVerdict(q);
  }

  /** ① 诊断屏 */
  function renderDiag(q) {
    var st = Store.hlState(q.id) || { stage: 0, need: 2 };
    var n = nodeOf(q.node);
    var picked = st.picked;
    var isChoice = q.type === 'choice' && q.options && q.options.length;
    var html = '';

    html += '<div class="hl-kicker">① 诊断屏<span class="hl-dim">　先认账，不用做题</span></div>';
    html += '<div class="hl-meta">' + esc(n.icon) + ' ' + esc(n.name) +
      '<span class="hl-seg">第 ' + ((st.stage || 0) + 1) + ' / ' + (st.need || 2) + ' 段</span>' +
      (st.times ? '<span class="hl-dim">　错过 ' + st.times + ' 次</span>' : '') + '</div>';
    html += '<div class="hl-q">' + fmt(q.stem) + '</div>';

    if (isChoice) {
      if (picked != null && q.options[picked] != null) {
        html += '<div class="hl-pick bad"><span class="hl-tag">你当时选了</span>' +
          '<span class="hl-k">' + ALPHA[picked] + '</span>' +
          '<span class="hl-t">' + fmt(q.options[picked]) + '</span></div>';
        if (q.optionNotes && q.optionNotes[picked]) {
          html += '<div class="hl-note bad">💡 ' + fmt(q.optionNotes[picked]) + '</div>';
        }
      } else {
        html += '<div class="hl-note dim">这道题是旧记录，没留下你当时的选项 —— 直接看正确项为什么对。</div>';
      }
      html += '<div class="hl-pick good"><span class="hl-tag">正确答案</span>' +
        '<span class="hl-k">' + ALPHA[q.answer] + '</span>' +
        '<span class="hl-t">' + fmt(q.options[q.answer]) + '</span></div>';
      if (q.optionNotes && q.optionNotes[q.answer]) {
        html += '<div class="hl-note good">✅ ' + fmt(q.optionNotes[q.answer]) + '</div>';
      }
    } else {
      if (picked != null && String(picked).trim()) {
        html += '<div class="hl-pick bad"><span class="hl-tag">你当时写的</span>' +
          '<span class="hl-t">' + fmt(String(picked)) + '</span></div>';
      }
      html += '<div class="hl-pick good"><span class="hl-tag">参考答案</span>' +
        '<span class="hl-t">' + fmt(q.answer) + '</span></div>';
      if (q.analysis) html += '<div class="hl-note good">✅ ' + fmt(q.analysis) + '</div>';
    }

    if (n.points && n.points.length) {
      html += '<div class="hl-master">🥋 <b>师傅</b>：这个考点记住一句话 —— 「' + esc(n.points[0]) + '」</div>';
    }

    els.body.innerHTML = html;
    els.foot.innerHTML = '<button class="btn btn-primary" id="hlGo">开始回炉 →</button>' +
      '<span class="hl-keyhint"><kbd>空格</kbd> 继续　<kbd>Esc</kbd> 退出</span>';
    $('hlGo').addEventListener('click', toDrill);
    typeset(els.body);          // 题干/选项/诊断文案里都有公式，必须渲染
  }

  /** ② 变形屏 */
  function renderDrill(q) {
    var st = Store.hlState(q.id) || { stage: 0, usedVariants: [] };
    var html = '';
    if (!sess.variant) sess.variant = pickVariant(q, st.usedVariants || []);

    if (sess.variant) {
      html += '<div class="hl-kicker">② 变形屏<span class="hl-dim">　同类变式 · <b>不是原题</b></span></div>';
      html += '<div class="hl-q">' + fmt(sess.variant.v.stem) + '</div>';
      html += '<div class="hl-hintline">想好了自己先做，再按 <kbd>空格</kbd> 对解析 —— 这一步没有选项可蒙。</div>';
    } else {
      html += '<div class="hl-kicker">② 变形屏<span class="hl-warn">　该题暂无同类变式 → 原题重做</span></div>';
      html += '<div class="hl-q">' + fmt(q.stem) + '</div>';
      html += '<div class="hl-hintline">题库还没给这道题写变式（「自动换数字」在待办里）。' +
        '这次按原题重做，<b>照旧两段验证</b>。按 <kbd>空格</kbd> 对解析。</div>';
    }

    if (sess.phase === 'reveal') {
      var ans = sess.variant ? (sess.variant.v.hint || '（见解析）')
                             : (q.answer + (q.analysis ? '　' + q.analysis : ''));
      html += '<div class="hl-reveal"><div class="hl-rev-t">📖 解析</div>' +
        '<div class="hl-rev-b">' + fmt(ans) + '</div>' +
        (sess.variant && q.analysis ? '<div class="hl-rev-s">原题解析：' + fmt(q.analysis) + '</div>' : '') +
        (q.tips ? '<div class="hl-rev-s">易错：' + fmt(q.tips) + '</div>' : '') +
        '</div>';
      html += '<div class="hl-ask">对照解析，诚实自评 —— 这一题你答对了吗？</div>';
      els.body.innerHTML = html;
      els.foot.innerHTML =
        '<button class="btn btn-ok" id="hlYes"><kbd>1</kbd> ✅ 我答对了</button>' +
        '<button class="btn btn-no" id="hlNo"><kbd>2</kbd> ❌ 没答对</button>';
      $('hlYes').addEventListener('click', function () { judge(true); });
      $('hlNo').addEventListener('click', function () { judge(false); });
    } else {
      els.body.innerHTML = html;
      els.foot.innerHTML = '<button class="btn btn-primary" id="hlReveal">看解析 <kbd>空格</kbd></button>';
      $('hlReveal').addEventListener('click', reveal);
    }
    typeset(els.body);
  }

  /** ③ 归位屏 */
  function renderVerdict(q) {
    var r = sess.last || {};
    var st = Store.hlState(q.id) || { stage: 0, need: 2 };
    var n = nodeOf(q.node);
    var icon, title, note;
    if (r.graduated) {
      icon = '🔥'; title = '出炉！';
      note = '这道错题两段都验过了 —— <b>它才算真的消化</b>。' +
        '「' + esc(n.name) + '」的信任度会因此往前走一格。';
    } else if (r.stuck) {
      icon = '🧊'; title = '先从队列里撤下';
      note = '同一题连错 ' + r.fails + ' 次了。硬扛只会把信心磨掉 —— ' +
        '去错题本点「请师傅讲一遍」，弄懂了下一次答对就能重新入队。';
    } else if (r.ok === false) {
      icon = '❌'; title = '记下来了';
      note = '这一题再等下一次。别急，回炉间认的是<b>两段</b>，不是一次发挥。';
    } else if (r.gated) {
      icon = '⏳'; title = '还没到间隔';
      note = '这一段要明天才能验（第二次验证必须跨过凌晨 4 点）—— ' +
        '这不是罚你，<b>间隔本身就是记忆的一部分</b>。';
    } else {
      icon = '✅'; title = '第 ' + r.stage + ' / ' + (r.need || 2) + ' 段完成';
      note = '还差一段。明天回炉间会把它重新排给你，' +
        '<b>做完才算出炉</b>。今天先去做别的题。';
    }

    var sum = Store.hlSummary();
    els.body.innerHTML =
      '<div class="hl-verdict">' +
        '<div class="hl-v-icon">' + icon + '</div>' +
        '<div class="hl-v-title">' + title + '</div>' +
        '<div class="hl-v-note">' + note + '</div>' +
        '<div class="hl-v-seg">本局进度：出炉 <b>' + sess.out + '</b>　进阶 <b>' + sess.adv + '</b>' +
          (sess.stuck ? '　撤下 <b>' + sess.stuck + '</b>' : '') +
          '　｜　今日还剩 <b>' + sum.ready + '</b> 道</div>' +
      '</div>';
    var last = sess.idx >= sess.qids.length - 1;
    els.foot.innerHTML = '<button class="btn btn-primary" id="hlNext">' +
      (last ? '收工 →' : '下一题 →') + ' <kbd>空格</kbd></button>';
    $('hlNext').addEventListener('click', function () { last ? renderDone() : next(); });
  }

  function renderDone() {
    setProgress(1);
    var sum = Store.hlSummary();
    var f = Store.scoreForecast();
    els.body.innerHTML =
      '<div class="hl-verdict">' +
        '<div class="hl-v-icon">🧯</div>' +
        '<div class="hl-v-title">这一炉烧完了</div>' +
        '<div class="hl-v-note">本局 <b>' + sess.qids.length + '</b> 道：出炉 <b>' + sess.out + '</b>　进阶 <b>' + sess.adv + '</b>' +
          (sess.wrong ? '　没答对 <b>' + sess.wrong + '</b>' : '') +
          (sess.stuck ? '　撤下 <b>' + sess.stuck + '</b>' : '') + '。</div>' +
        '<div class="hl-v-seg">回炉账本：待验 <b>' + sum.open + '</b> 道（今天可验 ' + sum.ready + '，等明天 ' + sum.pending + '）' +
          '　｜　考场预计 <b>' + f.expected.toFixed(1) + '</b> / 150，其中虚分 <b>' + f.fake.toFixed(1) + '</b></div>' +
        '<div class="hl-v-tip">复盘不发奖励 —— 它只做一件事：把虚分变成真的分。</div>' +
      '</div>';
    els.foot.innerHTML = '<button class="btn btn-primary" id="hlDone">关闭</button>';
    $('hlDone').addEventListener('click', close);
  }

  /* ---------------- 状态流转 ---------------- */
  function toDrill() { sess.step = 'drill'; sess.phase = 'ask'; sess.variant = null; render(); }
  function reveal() { sess.phase = 'reveal'; render(); }

  function judge(ok) {
    var qid = sess.qids[sess.idx];
    var variantIdx = sess.variant ? sess.variant.idx : null;
    var r = Store.hlAdvance(qid, ok, variantIdx) || {};
    sess.last = r;
    if (r.graduated) sess.out++;
    else if (ok && r.ok) sess.adv++;
    else if (!ok) { sess.wrong++; if (r.stuck) sess.stuck++; }
    sess.step = 'verdict';
    render();
  }

  function next() {
    sess.idx++;
    sess.step = 'diag';
    sess.phase = 'ask';
    sess.variant = null;
    if (sess.idx >= sess.qids.length) { renderDone(); return; }
    render();
  }

  /* ---------------- 键盘 ---------------- */
  function onKey(e) {
    if (!isOpen()) return;
    var k = e.key;
    if (k === 'Escape') { close(); e.preventDefault(); return; }
    if (sess && sess.step === 'drill' && sess.phase === 'reveal') {
      if (k === '1' || k === 'y' || k === 'Y') { judge(true); e.preventDefault(); return; }
      if (k === '2' || k === 'n' || k === 'N') { judge(false); e.preventDefault(); return; }
    }
    if (k === ' ' || k === 'Enter') {
      var btn = els.foot.querySelector('.btn-primary') ||
                els.foot.querySelector('#hlReveal');
      if (btn) { btn.click(); e.preventDefault(); }
    }
  }

  NS.Huilu = { init: init, open: open, close: close, isOpen: isOpen, SESSION_LIMIT: SESSION_LIMIT };
})(window.HNSF829);
