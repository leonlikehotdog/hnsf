/* ============================================================
 * 302 数学二 闯关系统 · 疑问日记本
 * ------------------------------------------------------------
 * 干什么：在「请教师傅」里问完一道题后，点「📝 一键总结」——
 *   让 AI 把这轮答疑压成一张复习卡片（疑点 / 解决思路 / 关键词标签），
 *   连同日期、关卡考点、我提的原话一起存进本机，之后按标签或关键词翻回来。
 *
 * 三条硬规矩（按用户要求）：
 *   ① **只有点了按钮才入库** —— 没有任何自动写库、没有埋点式偷存。
 *   ② 必须记日期，且时间取本机时区（显示到分钟）。
 *   ③ 标签是给人搜的，不是给 AI 炫技的：最多 4 个，尽量用数学术语。
 *
 * 存储：**独立的 localStorage key**，与游戏存档分开 ——
 *   重置存档不会连笔记一起清掉（笔记是学习资产，不是游戏进度）。
 *
 * 同一道题重复总结：**覆盖**旧卡（按 nodeId + qid 去重），老卡会被替换。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var KEY = 'hnsf302_diary_v1';
  var MAX_TAGS = 4;

  var els = {}, inited = false, bound = false;
  var filter = { kw: '', tag: '' };

  /* ---------------- 存储 ---------------- */
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (o && Object.prototype.toString.call(o.items) === '[object Array]') return o;
    } catch (e) { /* 坏数据当空处理，不炸页面 */ }
    return { v: 1, items: [] };
  }

  function write(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* 满了就算了 */ }
  }

  function all() { return load().items; }

  /** 按时间倒序（新的在前） */
  function sorted() {
    return all().slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  }

  function newId() {
    return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /** 同一题（nodeId + qid）只留最新一张 —— 覆盖，不是追加 */
  function upsert(item) {
    var d = load();
    for (var i = 0; i < d.items.length; i++) {
      var it = d.items[i];
      if (it.nodeId === item.nodeId && it.qid && it.qid === item.qid) {
        item.id = it.id;
        item.ts = item.ts || Date.now();
        d.items[i] = item;
        write(d);
        return item;
      }
    }
    d.items.push(item);
    write(d);
    return item;
  }

  function remove(id) {
    var d = load();
    d.items = d.items.filter(function (it) { return it.id !== id; });
    write(d);
  }

  /** 全部标签 + 出现次数（给标签云用） */
  function tagCloud() {
    var map = {};
    all().forEach(function (it) {
      (it.tags || []).forEach(function (t) {
        if (!t) return;
        map[t] = (map[t] || 0) + 1;
      });
    });
    return Object.keys(map).map(function (t) { return { tag: t, n: map[t] }; })
      .sort(function (a, b) { return b.n - a.n || a.tag.localeCompare(b.tag); });
  }

  function matched() {
    var kw = (filter.kw || '').toLowerCase();
    return sorted().filter(function (it) {
      if (filter.tag && (it.tags || []).indexOf(filter.tag) < 0) return false;
      if (!kw) return true;
      var hay = [it.doubt, it.fix, it.nodeName, it.chapName, (it.tags || []).join(' '),
        (it.asks || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(kw) >= 0;
    });
  }

  /* ---------------- 小工具 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /** 本机时区的「2026-10-03 14:05」 */
  function stamp(ts) {
    var d = new Date(ts || Date.now());
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /** 纯文本化题干，用于给 AI 看（去掉公式定界符之外的东西没有意义，原样保留即可） */
  function stemOf(q) {
    return String((q && q.stem) || '').replace(/\s+/g, ' ').trim();
  }

  function clean(s, max) {
    var t = String(s == null ? '' : s).replace(/\s*\n\s*/g, ' ').trim();
    return t.length > max ? t.slice(0, max) + '…' : t;
  }

  /* ---------------- AI 总结 ---------------- */
  var SYS = '你是我的学习笔记助手。下面是我做「302 数学二」题时向陪练请教的答疑记录。\n' +
    '请把它压成一张**复习用的疑问卡片**，只输出一个 JSON 对象（不要代码块围栏、不要任何解释）：\n' +
    '{ "doubt": "我当时卡在哪（一句话，具体到某个概念或某一步）",\n' +
    '  "fix": "想通它靠的是什么（1~3 句，写清关键的那一转念 / 公式 / 判定流程）",\n' +
    '  "tags": ["2~4 个关键词"] }\n' +
    '硬要求：\n' +
    '① 中文。tags 要用**数学术语或考点名**（方便我以后搜索），不要写"数学""难题"这种没用的词。\n' +
    '② doubt 不许写"基础不牢""概念不清"这类空话 —— 必须指出具体是哪一步、哪个量、哪个条件。\n' +
    '③ fix 要写"怎么想通的"，不是把题目答案抄一遍。\n' +
    '④ 只基于给定的答疑内容，不要编造我没问过的知识点。';

  function brief(meta) {
    var q = (meta && meta.q) || {};
    var out = ['【考点】' + (meta.chapName ? meta.chapName + ' · ' : '') + (meta.nodeName || '')];
    out.push('【题目】\n' + stemOf(q));
    if (q.options && q.type === 'choice') {
      out.push('【选项】\n' + q.options.map(function (o, i) { return 'ABCD'[i] + '. ' + String(o).replace(/\s+/g, ' '); }).join('\n'));
    }
    var asks = (meta.asks || []).filter(Boolean);
    if (asks.length) {
      out.push('【我提的问题】\n' + asks.map(function (a, i) { return (i + 1) + '. ' + a; }).join('\n'));
    }
    var ans = (meta.answers || []).filter(Boolean);
    if (ans.length) {
      out.push('【陪练的回答（节选）】\n' + ans.map(function (a) { return clean(a, 400); }).join('\n---\n'));
    }
    out.push('【我当时的状态】' + (meta.answered ? (meta.ok ? '已经做对了' : '做错了') : '还没作答'));
    return out.join('\n\n');
  }

  /** 模型可能套 ```json 围栏或加废话 —— 只认第一个 { 到最后一个 } */
  function parseJson(text) {
    var t = String(text || '');
    var a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a < 0 || b <= a) return null;
    try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { return null; }
  }

  function normTags(list, fallback) {
    var out = [];
    (list || []).forEach(function (t) {
      var s = String(t == null ? '' : t).trim().replace(/^#/, '');
      if (s && out.indexOf(s) < 0 && out.length < MAX_TAGS) out.push(s);
    });
    if (!out.length && fallback) out.push(fallback);
    return out;
  }

  /**
   * 总结并入库。
   * @param {object} meta {nodeId,nodeName,chapName,q,asks,answers,answered,ok}
   * @param {function} done done(ok, payload) —— ok=false 时 payload 是错误文案
   */
  function summarize(meta, done) {
    if (!NS.AI) { done(false, '大模型模块没加载'); return; }
    if (!NS.AI.ready()) { done(false, '还没配置模型，先用「手动填一张」记下来吧'); return; }
    var buf = '';
    NS.AI.stream([
      { role: 'system', content: SYS },
      { role: 'user', content: brief(meta) }
    ], {
      onDelta: function (t) { buf += t; },
      onDone: function () {
        var j = parseJson(buf) || {};
        var item = {
          id: newId(),
          ts: Date.now(),
          nodeId: meta.nodeId || '',
          nodeName: meta.nodeName || '',
          chapName: meta.chapName || '',
          qid: (meta.q && meta.q.id) || '',
          qtype: (meta.q && meta.q.type) || '',
          stem: stemOf(meta.q),
          asks: (meta.asks || []).filter(Boolean).slice(0, 8),
          doubt: clean(j.doubt, 200) || '（AI 没给出明确疑点，看解决思路）',
          fix: clean(j.fix, 500) || clean(buf, 500),
          tags: normTags(j.tags, meta.nodeName || ''),
          answered: !!meta.answered,
          ok: !!meta.ok,
          src: 'ai'
        };
        upsert(item);
        done(true, item);
      },
      onError: function (m) { done(false, m); }
    });
  }

  /** AI 不给力时的手写兜底 —— 至少别让入口变成死按钮 */
  function saveManual(meta, form) {
    var item = {
      id: newId(),
      ts: Date.now(),
      nodeId: meta.nodeId || '',
      nodeName: meta.nodeName || '',
      chapName: meta.chapName || '',
      qid: (meta.q && meta.q.id) || '',
      qtype: (meta.q && meta.q.type) || '',
      stem: stemOf(meta.q),
      asks: (meta.asks || []).filter(Boolean).slice(0, 8),
      doubt: clean(form.doubt, 200) || '（没写疑点）',
      fix: clean(form.fix, 500) || '（没写解决思路）',
      tags: normTags(String(form.tags || '').split(/[\s,，、#]+/), meta.nodeName || ''),
      answered: !!meta.answered,
      ok: !!meta.ok,
      src: 'manual'
    };
    upsert(item);
    return item;
  }

  /* ---------------- 侧栏视图 ---------------- */
  function cardHtml(it) {
    var tags = (it.tags || []).map(function (t) {
      return '<button class="diary-tag" data-tag="' + esc(t) + '" type="button">#' + esc(t) + '</button>';
    }).join('');
    var asks = (it.asks || []).map(function (a, i) {
      return '<div class="diary-ask">' + (i + 1) + '. ' + esc(a) + '</div>';
    }).join('');
    return '<div class="diary-card" data-id="' + esc(it.id) + '">' +
      '<div class="diary-head">' +
        '<span class="diary-date">📅 ' + esc(stamp(it.ts)) + '</span>' +
        '<span class="diary-node">' + esc(it.nodeName || '未记录考点') + '</span>' +
        (it.src === 'manual' ? '<span class="diary-src">手写</span>' : '') +
        '<button class="diary-del" data-del="' + esc(it.id) + '" type="button" title="删除这条">🗑</button>' +
      '</div>' +
      (it.stem ? '<div class="diary-stem">' + NS.Engine.fmt(it.stem) + '</div>' : '') +
      (asks ? '<div class="diary-asks">' + asks + '</div>' : '') +
      '<div class="diary-row"><b>卡在哪</b><span>' + esc(it.doubt) + '</span></div>' +
      '<div class="diary-row"><b>怎么想通</b><span>' + esc(it.fix) + '</span></div>' +
      '<div class="diary-foot">' + tags +
        '<button class="diary-go" data-go="' + esc(it.nodeId) + '" type="button">去看看 ▸</button>' +
      '</div>' +
    '</div>';
  }

  function html() {
    var list = matched();
    var cloud = tagCloud();
    var total = all().length;
    if (!total) {
      return '<div class="nd-block-title">📔 疑问日记本</div>' +
        '<div class="diary-empty">' +
          '还没有笔记。答题时点一下关卡里那位角色的头像，问他几句，' +
          '再点对话框底部的「📝 一键总结」—— 你的疑点就会变成一张卡片存到这里。<br>' +
          '<b>只有你亲手点那一下才会入库</b>，不会自动记录。' +
        '</div>';
    }
    return '<div class="nd-block-title">📔 疑问日记本　<span class="diary-count">共 ' + total + ' 条' +
        (list.length !== total ? '，筛出 ' + list.length + ' 条' : '') + '</span></div>' +
      '<div class="diary-search">' +
        '<input id="diaryKw" class="ai-field" type="text" placeholder="搜关键词：疑点 / 思路 / 我提的问题 / 考点名…" value="' + esc(filter.kw) + '">' +
        (filter.kw || filter.tag ? '<button class="ai-mini" data-clear="1" type="button">清空筛选</button>' : '') +
      '</div>' +
      (cloud.length ? '<div class="diary-cloud">' + cloud.map(function (c) {
        return '<button class="diary-tag' + (filter.tag === c.tag ? ' on' : '') + '" data-tag="' + esc(c.tag) + '" type="button">' +
          '#' + esc(c.tag) + '<i>' + c.n + '</i></button>';
      }).join('') + '</div>' : '') +
      (list.length ? list.map(cardHtml).join('') : '<div class="diary-empty">没有匹配的笔记，换个关键词试试。</div>');
  }

  function render() {
    var box = document.getElementById('view-diary');
    if (!box) return;
    box.innerHTML = html();
    if (NS.Engine && NS.Engine.renderMath) {
      try { NS.Engine.renderMath(box); } catch (e) { /* 渲染失败就保留原文 */ }
    }
  }

  function refresh() { if (els.box && els.box.classList.contains('active')) render(); }

  function bind() {
    if (bound) return;
    var box = document.getElementById('view-diary');
    if (!box) return;
    bound = true;
    els.box = box;

    box.addEventListener('click', function (e) {
      var del = e.target.closest('[data-del]');
      if (del) {
        var id = del.dataset.del;
        if (del.dataset.sure === '1') {
          remove(id);
          render();
          if (NS.Engine) NS.Engine.toast('🗑 已删除这条笔记');
        } else {
          del.dataset.sure = '1';
          del.textContent = '确认删?';
          del.classList.add('sure');
          setTimeout(function () {
            if (!del.isConnected) return;
            del.dataset.sure = '';
            del.textContent = '🗑';
            del.classList.remove('sure');
          }, 3000);
        }
        return;
      }
      var tag = e.target.closest('[data-tag]');
      if (tag) {
        filter.tag = filter.tag === tag.dataset.tag ? '' : tag.dataset.tag;
        render();
        return;
      }
      var go = e.target.closest('[data-go]');
      if (go && go.dataset.go) {
        if (NS.App && NS.App.closePanel) NS.App.closePanel();
        if (NS.App && NS.App.launchNode) NS.App.launchNode(go.dataset.go);
        return;
      }
      if (e.target.closest('[data-clear]')) {
        filter.kw = '';
        filter.tag = '';
        render();
      }
    });

    // 边打字边筛（笔记量小，直接重渲染最简单）
    box.addEventListener('input', function (e) {
      if (e.target.id !== 'diaryKw') return;
      filter.kw = e.target.value.trim();
      var keep = filter.kw;
      render();
      var inp = document.getElementById('diaryKw');
      if (inp) { inp.value = keep; inp.focus(); }
    });
  }

  NS.Diary = {
    summarize: summarize,
    saveManual: saveManual,
    render: render,
    refresh: refresh,
    bind: bind,
    count: function () { return all().length; },
    /** 诊断用 */
    info: function () {
      return { total: all().length, shown: matched().length, tag: filter.tag, kw: filter.kw };
    }
  };
})(window.HNSF829);
