/* ============================================================
 * 302 数学二 闯关系统 · 「请教师傅」
 * ------------------------------------------------------------
 * 玩法：答题时点一下关卡角色（题卡上方的头像）→ 弹出对话框。
 *   他是这一关的出题人（友方＝引路人，反派＝挑战者），
 *   你可以问他这题怎么做，但他**不会直接把答案给你**：
 *     · 「给我一点提示」三级递进：L1 思路 → L2 关键步骤 → L3 接近完整解法
 *     · 也可以自由打字追问，但系统提示词里写死了"不许报答案"
 *
 * 为什么这么设计：免费档小模型对"别给答案"的服从度不稳，
 *   所以前两级提示的提示词由我们自己拼（给不给答案我们说了算），
 *   只有自由追问才完全交给模型 —— 把不可控面收窄。
 *
 * 上下文：**每题独立**。翻到下一题即清空重来，避免跨题串味与 token 膨胀。
 *   同一题从"作答前"升到"作答后"保留上下文（还是同一道题）。
 *
 * 语音：只用浏览器原生 SpeechRecognition（Chrome/Edge 有，微信/Firefox 没有）。
 *   检测不到就把麦克风按钮整个藏起来，绝不留一个点了没反应的按钮。
 *
 * 密钥与平台配置：完全复用 js/ai.js（同一份 localStorage 配置），
 *   这里的 ⚙️ 只是把设置表单搬到了对话框里，不再占用侧栏一个 Tab。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var els = {}, inited = false, bound = false;
  var ctx = null;          // 当前题的上下文
  var busy = false;        // 正在流式生成
  var listening = false;   // 语音识别中
  var recog = null;        // SpeechRecognition 实例
  var speechOK = false;    // 浏览器是否支持原生语音识别

  /* ---------------- 提示分级 ---------------- */
  var HINTS = [
    {
      n: 1, name: '思路',
      ask: '我卡住了，请只做两件事：① 用一句话点明这道题考的是哪个知识点、在考纲里什么位置；' +
        '② 告诉我**第一步**该从哪想起（用哪个概念或公式切入）。' +
        '不要写第二步，不要给答案，120 字以内。'
    },
    {
      n: 2, name: '关键步骤',
      ask: '我还是不会。请把思路拆成 2~3 个关键步骤，说清**每一步为什么这么变形**；' +
        '但不要给出最终结果 —— 最后一步故意留白，让我自己算。200 字以内。'
    },
    {
      n: 3, name: '接近完整解法',
      ask: '我卡了很久了。请给出接近完整的解法，每一步写清楚；' +
        '但**最后一步（得数/结论那一步）必须留给我**，只提示我"你自己把这一步算完"。300 字以内。'
    }
  ];

  var GREET_ALLY = '这题不会？先别急着要答案 —— 说说你打算从哪下手，我看着。';
  var GREET_FOE = '想过我这关？先说说你打算怎么下手。别指望我直接把答案念给你听。';

  /* ---------------- 小工具 ---------------- */
  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function scrollBottom() {
    if (els.log) els.log.scrollTop = els.log.scrollHeight;
  }

  /** 师傅是不是这一关的反派（决定开场白与口气） */
  function isFoe() { return !!(ctx && ctx.char && ctx.char.side === 'foe'); }

  function masterName() {
    if (ctx && ctx.char && ctx.char.name) return ctx.char.name;
    return isFoe() ? '挑战者' : '师傅';
  }

  /* ---------------- 系统提示词：师傅人格 ---------------- */
  /**
   * 人格 + 题目一起放进 system：题目（含是否已作答）是我们自己拼的，
   * 让模型不用在对话里"猜"现在讲的是哪道题。
   */
  function sysPrompt() {
    var foe = isFoe();
    var who = masterName();
    var role = foe ? '一位冷峻的对手（你是这一关的出题人，学生正在闯你守的关）'
      : '一位耐心的陪练师傅（学生是你在带的师弟）';
    var tone = foe
      ? '口吻：像动漫里那种带点挑衅和不屑的强敌，短句、有压迫感，但你是**认真的**——该给的方向一定给真东西，你只想看他能不能自己迈过去。'
      : '口吻：像动漫里那种话不多但靠得住的师兄/师父，可以用"小子""同学"称呼他，多鼓励、少废话。';

    var head = '你是' + who + '，' + role + '。学生正在备考考研 302「数学二」（考纲：高等数学 + 线性代数；' +
      '**不考** 概率论与数理统计、无穷级数、向量代数与空间解析几何、三重积分、曲线曲面积分，别把数学一的内容当考点讲）。\n\n' +
      '【铁律，必须遵守】\n' +
      '① 你是**教练，不是答案机**：绝不直接说出最终答案、得数，也不要说"选 B""答案是 x"这类结论。\n' +
      '② 循序渐进：一次只推进一步，先反问"你打算从哪下手"，再给方向；他做对了就确认，做错了只指出**错在哪一步**。\n' +
      '③ 他如果直接问"答案是多少"，不要报答案，改成把最后一步留给他："你把这步算完就知道了。"\n' +
      '④ 中文口语，像真人说话：不要小标题、不要客套、不要说"作为AI"，一次 150 字以内。\n' +
      '⑤ 所有数学符号一律用 LaTeX：行内写 \\( ... \\)，独立公式写 \\[ ... \\]。\n' +
      '⑥ 不确定就说不确定，不要编造真题年份、题号或教材原文。\n\n' + tone;

    // 题目（作答前不带答案；作答后才带上答案与他的作答，好让师傅判断对错）
    var brief = '';
    if (ctx && ctx.q && NS.AI && NS.AI.questionText) {
      try { brief = NS.AI.questionText(ctx); } catch (e) { brief = ''; }
    }
    if (brief) {
      head += '\n\n【现在这道题】\n' + brief +
        (ctx.phase === 'after'
          ? '\n\n（他已作答。上面的标准答案**只给你判断用**，别主动报给他，先引导他自己复盘。）'
          : '\n\n（他还没作答。）');
    }
    return head;
  }

  /** 拼一次请求：system 带题目 + 本对话的历史 + 这一次的提问 */
  function buildMessages(ask) {
    var msgs = [{ role: 'system', content: sysPrompt() }];
    var hist = (ctx && ctx.msgs) || [];
    var start = Math.max(0, hist.length - 8);           // 只带最近 4 轮，控 token
    for (var i = start; i < hist.length; i++) msgs.push(hist[i]);
    msgs.push({ role: 'user', content: ask });
    return msgs;
  }

  /* ---------------- 气泡 ---------------- */
  /** @returns {object} { row, body } —— body 是气泡里可写入内容的容器 */
  function addBubble(who, text) {
    var row = document.createElement('div');
    row.className = 'master-msg ' + (who === 'me' ? 'is-me' : 'is-master');
    row.innerHTML =
      '<div class="master-msg-face">' + (who === 'me' ? '🙋' : '🥋') + '</div>' +
      '<div class="master-bubble">' +
        '<div class="master-say"></div>' +
        '<div class="master-tail"></div>' +
      '</div>';
    var say = row.querySelector('.master-say');
    if (text != null) say.innerHTML = text;
    els.log.appendChild(row);
    scrollBottom();
    return { row: row, say: say, tail: row.querySelector('.master-tail') };
  }

  /** 师傅的本地开场白（不消耗 token，进题就能看到他还"在"） */
  function greet() {
    els.log.innerHTML = '';
    addBubble('master', esc(isFoe() ? GREET_FOE : GREET_ALLY));
  }

  /** 作答之后的一句本地反应（同样不花 token） */
  function react(ok) {
    if (isFoe()) {
      addBubble('master', ok ? '……哼，这题算你过了。下一问可没这么便宜。' : '就这？我出的题，你还差得远。再想。');
    } else {
      addBubble('master', ok ? '对，就是这个路子。下一题。' : '别急，错在哪我陪你捋——要我提示就说一声。');
    }
  }

  /* ---------------- 三级提示 ---------------- */
  function syncHint() {
    if (!els.hintBtn) return;
    var lv = (ctx && ctx.hintLevel) || 0;
    if (lv >= HINTS.length) {
      els.hintBtn.disabled = true;
      els.hintBtn.textContent = '💡 已经讲到最细啦';
      els.hintBtn.classList.add('used');
    } else {
      els.hintBtn.disabled = false;
      els.hintBtn.classList.remove('used');
      els.hintBtn.textContent = lv === 0 ? '💡 给我一点提示' : '💡 再给一点提示';
    }
    if (els.hintNote) {
      els.hintNote.textContent = lv === 0 ? '（他会先讲思路，不直接给答案）'
        : '已给到 L' + lv + ' · ' + HINTS[lv - 1].name;
    }
  }

  function askHint() {
    if (busy || !ctx) return;
    var lv = ctx.hintLevel || 0;
    if (lv >= HINTS.length) return;
    ctx.hintLevel = lv + 1;
    var h = HINTS[lv];
    addBubble('me', '给我一点提示（L' + h.n + ' ' + h.name + '）');
    syncHint();
    send(h.ask);
  }

  /* ---------------- 自由追问 ---------------- */
  function submitText() {
    if (busy || !ctx || !els.input) return;
    var v = (els.input.value || '').trim();
    if (!v) return;
    els.input.value = '';
    addBubble('me', esc(v));
    send(v);
  }

  /* ---------------- 请求 ---------------- */
  function send(ask) {
    if (!NS.AI) return;
    if (!NS.AI.ready()) {
      addBubble('master', '我还没被你"请"出来 —— 先点右上角的 ⚙️，随便挑一家的免费模型填上密钥。');
      openCfg(true);
      return;
    }
    var mine = ctx;                                  // 流回来时可能已翻到下一题，收尾只认自己这份
    var b = addBubble('master', null);
    b.say.innerHTML = '<div class="ai-status">正在想…<button class="ai-stop" type="button">停止</button></div>';
    var textEl = document.createElement('div');
    textEl.className = 'ai-text';
    b.say.appendChild(textEl);

    busy = true;
    syncUI();

    var buf = '';
    var end = function (msg, isErr) {
      busy = false;
      var st = b.say.querySelector('.ai-status');
      if (st) st.remove();
      if (isErr) {
        b.tail.innerHTML = '<div class="ai-err">⚠️ ' + esc(msg) + '</div>';
      } else if (!buf) {
        b.tail.innerHTML = '<div class="ai-err">接口没有返回内容，可能模型名不对或额度用尽。</div>';
      } else {
        b.tail.innerHTML = '<div class="ai-done">✅ 由 AI 扮演，可能说错，请以教材与真题为准</div>';
        mine.msgs.push({ role: 'user', content: ask });
        mine.msgs.push({ role: 'assistant', content: buf });
        if (mine.msgs.length > 8) mine.msgs.splice(0, mine.msgs.length - 8);
      }
      // 流式结束后一次性渲染公式（流到一半就渲染必然出乱码）
      if (NS.Engine && NS.Engine.renderMath) {
        try { NS.Engine.renderMath(b.say); } catch (e) { /* 渲染失败就保留原文 */ }
      }
      scrollBottom();
      syncUI();
    };

    NS.AI.stream(buildMessages(ask), {
      onDelta: function (t) {
        buf += t;
        textEl.innerHTML = NS.AI.mdLite(buf);
        scrollBottom();
      },
      onDone: function () { end(); },
      onError: function (m) { end(m, true); }
    });

    // 中途点了停止：stream 内部会 abort，onDone/onError 都不触发，这里兜底收尾
    b.say.__stop = function () {
      if (!busy) return;
      NS.AI.stop();
      end();
    };
  }

  /** 生成中：输入与提示按钮都锁住，避免并发请求 */
  function syncUI() {
    var lock = busy || !ctx;
    if (els.input) els.input.disabled = lock;
    if (els.send) els.send.disabled = lock;
    if (els.hintBtn) els.hintBtn.disabled = lock || ((ctx && ctx.hintLevel) || 0) >= HINTS.length;
    if (busy) {
      var btn = els.log && els.log.querySelector('.ai-stop');
      if (btn && !btn.__bound) {
        btn.__bound = true;
        btn.addEventListener('click', function () {
          var say = btn.closest('.master-say');
          if (say && say.__stop) say.__stop();
        });
      }
    }
  }

  /* ---------------- 语音输入（浏览器原生） ---------------- */
  function initSpeech() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !els.mic) return;
    speechOK = true;
    els.mic.hidden = false;
    recog = new SR();
    recog.lang = 'zh-CN';
    recog.interimResults = true;
    recog.continuous = false;

    recog.onresult = function (e) {
      var txt = '';
      for (var i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      if (els.input) els.input.value = txt;
    };
    recog.onerror = function (e) {
      stopSpeech();
      var m = (e && e.error) || '';
      if (m === 'not-allowed' || m === 'service-not-allowed') {
        note('麦克风被拒绝了 —— 想用语音请在地址栏允许麦克风权限，或者直接打字。');
      } else if (m === 'no-speech') {
        note('没听到声音，再试一次？');
      } else {
        note('语音识别不可用（' + m + '），先打字吧。');
      }
    };
    recog.onend = function () { stopSpeech(); };
  }

  function startSpeech() {
    if (!speechOK || !recog || busy) return;
    try {
      listening = true;
      els.mic.classList.add('on');
      els.mic.textContent = '⏺';
      note('正在听…说完停一下就会自动结束');
      recog.start();
    } catch (e) { stopSpeech(); }
  }

  function stopSpeech() {
    if (!listening) return;
    listening = false;
    if (els.mic) { els.mic.classList.remove('on'); els.mic.textContent = '🎤'; }
    try { recog && recog.stop(); } catch (e) { /* 已停止 */ }
    if (els.input && (els.input.value || '').trim()) {
      note('听到了，确认一下再点发送（或直接按回车）');
      els.input.focus();
    }
  }

  var noteTimer = null;
  function note(msg) {
    if (!els.hintNote) return;
    els.hintNote.textContent = msg;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(syncHint, 4000);
  }

  /* ---------------- 模型设置（复用 NS.AI 的本机配置） ---------------- */
  function cfgHtml() {
    var AI = NS.AI;
    if (!AI) return '';
    var cfg = AI.getCfg(), P = AI.PRESETS;
    var p = P[cfg.provider] || P.zhipu;
    var a = esc;                                     // 属性转义与文本转义在这里同形
    var opts = Object.keys(P).map(function (k) {
      return '<option value="' + k + '"' + (cfg.provider === k ? ' selected' : '') + '>' + esc(P[k].label) + '</option>';
    }).join('');
    return '<div class="ai-cfg">' +
      '<div class="ai-cfg-row"><span class="ai-cfg-label">平台</span><span class="ai-cfg-field">' +
        '<select id="mProvider" class="ai-field">' + opts + '</select></span></div>' +
      '<div class="ai-cfg-row"><span class="ai-cfg-label">接口地址</span><span class="ai-cfg-field">' +
        '<input id="mBase" class="ai-field" type="text" placeholder="' + a(p.base) + '" value="' + a(cfg.base) + '"></span></div>' +
      '<div class="ai-cfg-row"><span class="ai-cfg-label">模型名</span><span class="ai-cfg-field">' +
        '<input id="mModel" class="ai-field" type="text" list="mModelList" placeholder="' + a(p.model || '点「拉取模型列表」选一个') + '" value="' + a(cfg.model) + '">' +
        '<datalist id="mModelList"></datalist></span></div>' +
      '<div class="ai-cfg-row"><span class="ai-cfg-label">API 密钥</span><span class="ai-cfg-field">' +
        '<input id="mKey" class="ai-field" type="password" autocomplete="off" placeholder="' +
          a(AI.hasKey() ? '已保存：' + AI.maskKey(cfg.key) + '（留空＝不修改）' : '粘贴你的密钥') + '" value="">' +
        '<button class="ai-mini" data-m="eye" type="button">👁 显示</button></span></div>' +
      '<div class="ai-cfg-row"><span class="ai-cfg-label">服务端代理</span><span class="ai-cfg-field">' +
        '<label class="ai-check"><input id="mProxy" type="checkbox"' + (cfg.proxy ? ' checked' : '') + '>启用</label>' +
        '<input id="mProxyUrl" class="ai-field" type="text" placeholder="' + a(AI.defaultProxyUrl()) + '" value="' + a(cfg.proxyUrl) + '"></span></div>' +
      '</div>' +
      '<div class="ai-actions2">' +
        '<button class="btn btn-primary" data-m="save" type="button">💾 保存并测试</button>' +
        '<button class="btn btn-ghost" data-m="list" type="button">📋 拉取模型列表</button>' +
        '<button class="btn btn-ghost danger" data-m="clear" type="button">🗑 清除密钥</button>' +
        '<button class="btn btn-ghost" data-m="back" type="button">← 回到对话</button>' +
      '</div>' +
      '<div class="ai-cfg-status" id="mCfgStatus">' + cfgStatus() + '</div>' +
      '<div class="audio-tip">🔐 密钥只存在你自己的浏览器里（localStorage），不会写进代码、不会随仓库公开。' +
      '想要质量最好的免费模型选 Google Gemini（需挂节点或勾选上面的代理）；不想挂节点就选阿里云百炼或火山豆包（每天自动送额度）。</div>';
  }

  function cfgStatus() {
    var AI = NS.AI;
    if (!AI) return '';
    var c = AI.resolved();
    if (c.key && c.model && c.base) {
      return '✅ 已配置：' + esc((AI.PRESETS[c.provider] || {}).label) + '　·　模型 <code class="inline-code">' + esc(c.model) + '</code>';
    }
    if (c.key) return '⚠️ 密钥已填，但还缺模型名 —— 点「📋 拉取模型列表」选一个';
    return 'ℹ️ 还没配置。填一个免费平台的密钥就能请动师傅（不影响正常刷题）。';
  }

  function openCfg(on) {
    if (!els.cfg) return;
    if (on && !els.cfg.innerHTML) els.cfg.innerHTML = cfgHtml();
    els.cfg.hidden = !on;
    els.log.hidden = !!on;
    if (els.foot) els.foot.hidden = !!on;
    if (on) setStatus(cfgStatus(), '');
  }

  function setStatus(html, cls) {
    var st = $('mCfgStatus');
    if (!st) return;
    st.innerHTML = html;
    st.className = 'ai-cfg-status' + (cls ? ' ' + cls : '');
  }

  function readCfg() {
    var AI = NS.AI;
    var patch = {
      provider: $('mProvider').value,
      base: $('mBase').value.trim(),
      model: $('mModel').value.trim(),
      proxy: !!($('mProxy') && $('mProxy').checked),
      proxyUrl: $('mProxyUrl') ? $('mProxyUrl').value.trim() : ''
    };
    var k = $('mKey');
    if (k && k.value.trim()) patch.key = k.value.trim();
    AI.setCfg(patch);
    if (k) k.value = '';
    return AI.resolved();
  }

  function testCfg() {
    var AI = NS.AI;
    var r = readCfg();
    if (!r.key) { setStatus('⚠️ 请先粘贴 API 密钥', 'bad'); return; }
    if (!r.model) { setStatus('⚠️ 请先填模型名（可点「📋 拉取模型列表」）', 'bad'); return; }
    setStatus('⏳ 正在连接 ' + esc(r.model) + ' 测试中…', 'busy');
    AI.listModels().then(function (ids) {
      var dl = $('mModelList');
      if (dl) dl.innerHTML = ids.map(function (m) { return '<option value="' + esc(m) + '">'; }).join('');
      setStatus('✅ 连接成功！该平台共 ' + ids.length + ' 个模型可选。当前使用：<code class="inline-code">' + esc(r.model) + '</code>', 'ok');
    }).catch(function (err) {
      // 个别平台没有 /models，退回发一条极短对话来验证
      var done = false;
      AI.stream([{ role: 'user', content: '回复"ok"两个字即可' }], {
        onDelta: function () { done = true; },
        onDone: function () {
          if (done) setStatus('✅ 连接成功，模型能正常回答。当前使用：<code class="inline-code">' + esc(r.model) + '</code>', 'ok');
          else setStatus('❌ 模型没有返回内容，模型名可能不对。', 'bad');
        },
        onError: function (m) { setStatus('❌ 失败：' + esc(m), 'bad'); }
      });
    });
  }

  function listCfgModels() {
    var AI = NS.AI;
    var r = readCfg();
    if (!r.key) { setStatus('⚠️ 请先粘贴 API 密钥', 'bad'); return; }
    setStatus('⏳ 拉取中…', 'busy');
    AI.listModels().then(function (ids) {
      if (!ids.length) { setStatus('⚠️ 平台返回了空列表', 'bad'); return; }
      var dl = $('mModelList');
      if (dl) dl.innerHTML = ids.map(function (m) { return '<option value="' + esc(m) + '">'; }).join('');
      setStatus('✅ 拉到 ' + ids.length + ' 个模型，点模型名输入框可下拉选择。', 'ok');
    }).catch(function (err) {
      setStatus('❌ 拉取失败：' + esc(err && err.message ? err.message : err) +
        '<br>该平台可能没有 /models 接口，直接点「💾 保存并测试」用对话方式验证即可。', 'bad');
    });
  }

  /* ---------------- 开关 ---------------- */
  function open() {
    if (!els.mask || !ctx) return;
    els.mask.classList.add('show');
    els.mask.setAttribute('aria-hidden', 'false');
    if (els.input) setTimeout(function () { els.input.focus(); }, 60);
    scrollBottom();
  }

  function close() {
    if (!els.mask) return;
    if (listening) stopSpeech();
    // 生成中关掉：请求要掐断，busy 也要复位，否则下次进来输入框是死的
    if (busy) { if (NS.AI) NS.AI.stop(); busy = false; syncUI(); }
    els.mask.classList.remove('show');
    els.mask.setAttribute('aria-hidden', 'true');
    openCfg(false);
  }

  function isOpen() {
    return !!(els.mask && els.mask.classList.contains('show'));
  }

  function toggle() { isOpen() ? close() : open(); }

  /** App 的全局 Esc 会先问这里：开着就由这里关掉，不继续关别的层 */
  function handleEsc() {
    if (!isOpen()) return false;
    if (els.cfg && !els.cfg.hidden) { openCfg(false); return true; }
    close();
    return true;
  }

  /* ---------------- 对外：跟题目走 ---------------- */
  /** 换到一道新题：上下文清空、提示归零、师傅重新开口 */
  function reset(meta) {
    if (!inited) init();
    ctx = {
      nodeName: (meta && meta.nodeName) || '',
      q: meta && meta.q,
      chosen: undefined,
      phase: 'before',
      char: (meta && meta.char) || null,
      msgs: [],
      hintLevel: 0,
      reacted: false
    };
    if (els.name) els.name.textContent = masterName();
    setFace();
    greet();
    syncHint();
    syncUI();
    if (els.sub) els.sub.textContent = (ctx.nodeName ? ctx.nodeName + '　·　' : '') + '每题一条新对话';
  }

  /** 同一道题的状态变化（如：作答了）—— 保留上下文，只更新已知信息 */
  function update(meta) {
    if (!ctx) { reset(meta || {}); return; }
    meta = meta || {};
    if (meta.q) ctx.q = meta.q;
    if ('chosen' in meta) ctx.chosen = meta.chosen;
    if (meta.phase === 'after') ctx.phase = 'after';
    // 只有他真的给出判定（答对/答错）才说那句本地反应，且每题只说一次
    if (ctx.phase === 'after' && !ctx.reacted && typeof meta.ok === 'boolean') {
      ctx.reacted = true;
      react(meta.ok);
    }
    // 作答后 hintLevel 不清零：他已经看过的提示不该"收回"
  }

  function setFace() {
    var m = ctx && ctx.char;
    if (els.faceEmoji) els.faceEmoji.textContent = '🥋';
    if (els.avatar) els.avatar.hidden = true;
    if (!m || !NS.Monsters) return;
    if (els.faceEmoji) els.faceEmoji.textContent = isFoe() ? '👹' : '🥋';
    var url = (NS.Monsters.dir || 'assets/dbz/') + m.file;
    if (!url || !m.file) return;
    els.avatar.onload = function () { els.avatar.hidden = false; };
    els.avatar.onerror = function () { els.avatar.hidden = true; };
    els.avatar.src = url;
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    if (inited) return;
    inited = true;
    els = {
      mask: $('masterMask'),
      avatar: $('masterAvatar'), faceEmoji: $('masterFace'),
      name: $('masterName'), sub: $('masterSub'),
      log: $('masterLog'), cfg: $('masterCfg'),
      foot: document.querySelector('.master-foot'),
      hintBtn: $('masterHintBtn'), hintNote: $('masterHintNote'),
      input: $('masterIn'), send: $('masterSend'), mic: $('masterMic')
    };
    if (!els.mask) return;
    initSpeech();
    bind();
  }

  function bind() {
    if (bound) return;
    bound = true;

    $('masterClose').addEventListener('click', close);
    $('masterCfgBtn').addEventListener('click', function () {
      openCfg(els.cfg.hidden);
    });
    // 点遮罩空白处关闭（点对话框内部不关）
    els.mask.addEventListener('click', function (e) {
      if (e.target === els.mask) close();
    });

    els.hintBtn.addEventListener('click', askHint);
    els.send.addEventListener('click', submitText);
    els.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submitText(); }
    });
    els.mic.addEventListener('click', function () { listening ? stopSpeech() : startSpeech(); });

    // 设置区（事件委托，表单是点 ⚙️ 时才渲染的）
    els.cfg.addEventListener('click', function (e) {
      var b = e.target.closest('[data-m]');
      if (!b) return;
      var act = b.dataset.m;
      if (act === 'eye') {
        var k = $('mKey');
        k.type = k.type === 'password' ? 'text' : 'password';
        b.textContent = k.type === 'password' ? '👁 显示' : '🙈 隐藏';
      } else if (act === 'save') testCfg();
      else if (act === 'list') listCfgModels();
      else if (act === 'back') openCfg(false);
      else if (act === 'clear') {
        NS.AI.clearCfg();
        els.cfg.innerHTML = '';          // 强制用默认值重渲染
        openCfg(true);
        setStatus('已清除本机保存的密钥与设置。', 'ok');
      }
    });
    els.cfg.addEventListener('change', function (e) {
      if (e.target.id !== 'mProvider') return;
      var p = NS.AI.PRESETS[e.target.value] || NS.AI.PRESETS.zhipu;
      var base = $('mBase'), model = $('mModel');
      if (base) { base.value = ''; base.placeholder = p.base; }
      if (model) { model.value = ''; model.placeholder = p.model || '点「拉取模型列表」选择'; }
    });
  }

  NS.Master = {
    init: init,
    reset: reset,
    update: update,
    open: open,
    close: close,
    toggle: toggle,
    isOpen: isOpen,
    handleEsc: handleEsc,
    /** 诊断用：语音是否可用 / 当前提示级数 */
    info: function () {
      return {
        speech: speechOK,
        hintLevel: (ctx && ctx.hintLevel) || 0,
        rounds: (ctx && ctx.msgs.length) || 0,
        phase: ctx && ctx.phase,
        open: isOpen()
      };
    }
  };
})(window.HNSF829);
