/* ============================================================
 * 302 数学二 闯关系统 · AI 助教模块
 * ------------------------------------------------------------
 * 设计原则：
 *   1. 纯前端直连，不需要后端（已实测各平台 OPTIONS 预检通过）
 *   2. 绝不把 API Key 写进代码/仓库 —— 由使用者在页面里自行填写，
 *      只存本机浏览器 localStorage。这样公网部署也不会泄露密钥。
 *   3. 免费优先：默认智谱 GLM（官方定价 0 元、永久免费、中文最强）
 *   4. 模型名可编辑 + 可一键拉取平台模型列表，避免官方改模型名后失效
 *
 * 已实测支持「浏览器直连」的平台（OPTIONS 预检返回正确的 CORS 头）：
 *   智谱、硅基流动、OpenRouter、通义 DashScope、DeepSeek、火山引擎豆包
 *   （Groq 预检 403，浏览器无法直连，故不收录）
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  // 故意沿用 829 的 key：两门课同域，密钥与平台配置只需填一次
  var CFG_KEY = 'hnsf829_ai_v1';

  /* ---------------- 平台预设 ---------------- */
  var PRESETS = {
    dashscope: {
      label: '阿里云百炼 DashScope（首推：免费额度能用旗舰 qwen3-max）',
      base: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen3-max',
      hint: '首推。新用户每个模型各送 100 万 token（有效期 90 天），额度按模型分别计算、可叠加，' +
        '一个用完就换另一个继续蹭。qwen3-max 是通义旗舰，比各种 flash 小模型明显聪明。' +
        '想换模型点「拉取模型列表」看当前可用名（qwen3.5-plus / qwen-plus / deepseek-v3 等都能白嫖）。',
      keyUrl: 'https://bailian.console.aliyun.com/'
    },
    gemini: {
      label: 'Google Gemini（免费档质量最高，国内要挂节点）',
      base: 'https://generativelanguage.googleapis.com/v1beta/openai',
      model: 'gemini-2.5-flash',
      hint: '免费档按天重置（Gemini 2.5 Flash 每天约 250 次，额度会调整，以 AI Studio 页面为准），' +
        '模型能力明显强于国内各种 flash 小模型，是最值得换的一家。' +
        '注意：Google 在国内网络下连 TCP 都建不起来，必须挂节点——' +
        '实测它支持浏览器跨域（预检会回 Access-Control-Allow-Origin），所以挂了节点就能直连，不需要代理。' +
        '不想每次挂节点就勾选下面的「走服务端代理」（需要先部署 api/ai 函数）。' +
        '模型名迭代很快，点「拉取模型列表」确认当前可用名。',
      keyUrl: 'https://aistudio.google.com/apikey'
    },
    doubao: {
      label: '火山引擎豆包（每天 200 万 token 自动刷新，最耐用）',
      base: 'https://ark.cn-beijing.volces.com/api/v3',
      model: 'doubao-seed-2.0-pro',
      hint: '免费额度每天自动重置 200 万 token，是长期白嫖最耐用的一家，且模型能力不弱。' +
        '必须先在火山控制台「开通」想用的模型，否则会报 Model not found；' +
        '若填模型名报 404，就改成控制台里「推理接入点」的 ID（形如 ep-xxxxxxxx）。' +
        '想更省额度可把模型名换成 doubao-seed-2.0-lite。',
      keyUrl: 'https://console.volcengine.com/ark'
    },
    openrouter: {
      label: 'OpenRouter（免费档能白嫖 DeepSeek / Qwen 大模型）',
      base: 'https://openrouter.ai/api/v1',
      model: 'deepseek/deepseek-chat-v3.1:free',
      hint: '免费档约每天 50 次、每分钟 20 次，次数少但能用到真正的大模型（DeepSeek V3/R1、Qwen3 等）。' +
        '模型名必须带「:free」后缀才是免费的。要推理可用 deepseek/deepseek-r1:free。' +
        '点「拉取模型列表」看当前还有哪些 :free 模型（免费清单变动频繁）。',
      keyUrl: 'https://openrouter.ai/keys'
    },
    siliconflow: {
      label: '硅基流动（9B 以下模型永久免费不限量）',
      base: 'https://api.siliconflow.cn/v1',
      model: 'Qwen/Qwen3-8B',
      hint: '当前免费政策是 9B 以下模型永久免费、不限量（Qwen3-8B、GLM-4-9B、DeepSeek-R1-Distill-8B 等）；' +
        '新用户另送 2000 万 token，可拿去调 DeepSeek-V3 这种大模型。' +
        '注意：真正不限量的免费档都是小模型，水平跟 GLM-4.7-Flash 差不多，算不上升级。',
      keyUrl: 'https://cloud.siliconflow.cn/'
    },
    zhipu: {
      label: '智谱 GLM（永久免费不限量，但能力偏弱）',
      base: 'https://open.bigmodel.cn/api/paas/v4',
      model: 'glm-4.7-flash',
      hint: 'glm-4.7-flash / glm-4-flash 输入输出均为 0 元、永久免费、无 Token 上限，' +
        '是唯一「完全不限量」的一家，但模型偏小、长解析容易发飘，并发限制 1、单次约 15~25 秒。' +
        '它在免费档里属于「够用但不出彩」，追求解析质量建议换上面几家。',
      keyUrl: 'https://open.bigmodel.cn/'
    },
    qianfan: {
      label: '百度千帆（ERNIE-Speed 永久免费不限量）',
      base: 'https://qianfan.baidubce.com/v2',
      model: 'ernie-speed-128k',
      hint: 'ERNIE-Speed-128K / ERNIE-3.5-8K 永久免费不限量，但需先完成实名认证。' +
        '质量一般，胜在完全免费且不限量，适合当兜底。',
      keyUrl: 'https://console.bce.baidu.com/qianfan/'
    },
    deepseek: {
      label: 'DeepSeek 官方（新号送额度，之后按量付费）',
      base: 'https://api.deepseek.com',
      model: 'deepseek-flash',
      hint: '注意：旧模型名 deepseek-chat / deepseek-reasoner 已于 2026-07-24 停用，' +
        '现在必须写 deepseek-flash 或 deepseek-v4-pro。空闲时段价格是高峰的一半' +
        '（高峰＝周一至周五 9:00-12:00、14:00-18:00）。',
      keyUrl: 'https://platform.deepseek.com/'
    },
    custom: {
      label: '自定义（自己填接口地址）',
      base: '',
      model: '',
      hint: '任何兼容 OpenAI /chat/completions 格式的接口都可以。' +
        '注意：对方服务器必须允许浏览器跨域（返回 Access-Control-Allow-Origin）才连得上。' +
        '实测结论——Groq、Cloudflare Workers AI 不放跨域，浏览器直连一定失败；' +
        'Google Gemini、Mistral 是网络本身连不通（超时），不是跨域问题，除非你挂代理或加一层服务端中转。',
      keyUrl: ''
    }
  };

  /* ---------------- 配置读写（只存本机） ---------------- */
  function getCfg() {
    var d = { provider: 'dashscope', base: '', model: '', key: '', proxy: false, proxyUrl: '' };
    try {
      var o = JSON.parse(localStorage.getItem(CFG_KEY) || '{}');
      if (o.provider) d.provider = o.provider;
      if (typeof o.base === 'string') d.base = o.base;
      if (typeof o.model === 'string') d.model = o.model;
      if (typeof o.key === 'string') d.key = o.key;
      if (typeof o.proxy === 'boolean') d.proxy = o.proxy;
      if (typeof o.proxyUrl === 'string') d.proxyUrl = o.proxyUrl;
    } catch (e) {}
    return d;
  }

  function setCfg(patch) {
    var c = getCfg();
    Object.keys(patch || {}).forEach(function (k) { c[k] = patch[k]; });
    try { localStorage.setItem(CFG_KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  }

  function clearCfg() {
    try { localStorage.removeItem(CFG_KEY); } catch (e) {}
  }

  /**
   * 服务端代理的默认地址。
   * 页面挂在哪不确定（可能部署成站点根的 /数学二/，也可能把 数学二 当站点根），
   * 所以按当前路径深度反推「站点根的 /api/ai」该怎么走。
   */
  function defaultProxyUrl() {
    try {
      var segs = location.pathname.replace(/[^/]*$/, '').split('/').filter(Boolean);
      return new Array(segs.length + 1).join('../') + 'api/ai';
    } catch (e) { return 'api/ai'; }
  }

  /** 实际生效的 base / model（预设为空则回落到平台默认） */
  function resolved() {
    var c = getCfg();
    var p = PRESETS[c.provider] || PRESETS.zhipu;
    var upstream = (c.base || p.base).replace(/\/+$/, '');
    var proxyBase = '';
    if (c.proxy) proxyBase = ((c.proxyUrl || '').trim() || defaultProxyUrl()).replace(/\/+$/, '');
    return {
      provider: c.provider,
      // 开了代理就把请求发给自己的中转函数，否则直接发给上游
      base: proxyBase || upstream,
      upstream: upstream,          // 真实上游地址（代理模式下放进 x-hnsf-base 头）
      proxy: !!proxyBase,
      model: c.model || p.model,
      key: (c.key || '').trim()
    };
  }

  function ready() {
    var r = resolved();
    return !!(r.key && r.base && r.model);
  }

  function hasKey() { return !!(getCfg().key || '').trim(); }

  /** 密钥打码显示，避免截图/录屏时泄露 */
  function maskKey(k) {
    if (!k) return '';
    if (k.length <= 10) return k.slice(0, 2) + '***';
    return k.slice(0, 5) + '***' + k.slice(-4);
  }

  /* ---------------- 错误信息人性化 ---------------- */
  function explainError(status, body) {
    var raw = (body || '').toString().slice(0, 300);
    var lower = raw.toLowerCase();
    if (status === 401 || status === 403) return '密钥无效或没填对（HTTP ' + status + '）。请到面板「🤖 AI 助教」里重新粘贴密钥。';
    if (status === 402) return '账户余额不足（HTTP 402）。免费额度可能已用完，需要充值或换一个平台。';
    if (status === 404 || lower.indexOf('model') >= 0 && lower.indexOf('not') >= 0) {
      return '模型名不对（HTTP ' + status + '）。官方可能改了模型名，点「拉取模型列表」重新选一个。原文：' + raw;
    }
    if (status === 429) return '触发限流了（HTTP 429）。免费额度通常有每分钟/每天次数限制，等一会儿再试。';
    if (status >= 500) return '对方服务器出错（HTTP ' + status + '），稍后重试。原文：' + raw;
    return '请求失败（HTTP ' + status + '）。原文：' + raw;
  }

  /* ---------------- 拉取平台可用模型列表 ---------------- */
  function listModels() {
    var r = resolved();
    if (!r.key) return Promise.reject(new Error('还没填密钥'));
    if (!r.base) return Promise.reject(new Error('还没填接口地址'));
    var headers = { 'Authorization': 'Bearer ' + r.key };
    if (r.proxy) headers['x-hnsf-base'] = r.upstream;
    return fetch(r.base + '/models', { headers: headers }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) { throw new Error(explainError(res.status, t)); });
      }
      return res.json();
    }).then(function (j) {
      var arr = (j && (j.data || j.models)) || [];
      var ids = arr.map(function (m) { return m.id || m.name || m.model; }).filter(Boolean);
      ids.sort();
      return ids;
    });
  }

  /* ---------------- 上下文 → 提示词 ---------------- */
  function stripTags(s) {
    return String(s == null ? '' : s)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n').trim();
  }

  var TYPE_LABEL = { choice: '单选题', blank: '填空题', short: '简答题', sql: 'SQL 编程题', code: '代码题' };

  /** 把一道题拼成给 AI 的文本（phase='after' 时才透露答案与考生选择） */
  function questionText(ctx) {
    var q = ctx.q || {};
    var out = [];
    out.push('【所属关卡】' + (ctx.nodeName || ''));
    out.push('【题型】' + (TYPE_LABEL[q.type] || q.type || ''));
    if (q.level) out.push('【难度】' + (q.level === 1 ? '基础' : q.level === 2 ? '进阶' : '挑战'));
    out.push('【题干】\n' + stripTags(q.stem));
    if (q.type === 'choice' && q.options) {
      out.push('【选项】\n' + q.options.map(function (o, i) {
        return 'ABCD'[i] + '. ' + stripTags(o);
      }).join('\n'));
    }
    if (q.source) out.push('【官方考点溯源】' + stripTags(q.source));
    if (ctx.phase === 'after') {
      var ans;
      if (q.type === 'choice') ans = 'ABCD'[q.answer] + '. ' + stripTags(q.options[q.answer]);
      else if (Array.isArray(q.answer)) ans = q.answer.map(stripTags).join(' / ');
      else ans = stripTags(q.answer);
      out.push('【标准答案】' + ans);
      if (q.keys && q.keys.length) {
        out.push('【官方得分要点】\n- ' + q.keys.map(stripTags).join('\n- '));
      }
      if (typeof ctx.chosen === 'number' && q.options && q.options[ctx.chosen] != null) {
        out.push('【考生实际选择】' + 'ABCD'[ctx.chosen] + '. ' + stripTags(q.options[ctx.chosen]) +
          (ctx.chosen === q.answer ? '（选对了）' : '（选错了）'));
      } else if (typeof ctx.chosen === 'string' && ctx.chosen) {
        out.push('【考生实际作答】' + stripTags(ctx.chosen));
      }
    }
    return out.join('\n\n');
  }

  var SYS = '你是一位资深的考研数学辅导老师，主讲 302「数学二」（考纲：高等数学 + 线性代数；' +
    '注意数学二 **不考** 概率论与数理统计、无穷级数、向量代数与空间解析几何、三重积分、曲线曲面积分，' +
    '别把数学一的内容当考点讲）。学生正在用闯关刷题系统备考华东师范大学 085411 大数据技术与工程。要求：' +
    '① 直接给结论，不要客套话、不要重复题干、不要说"作为AI"；' +
    '② 用中文，条理清晰，善用小标题和短句；' +
    '③ **所有数学符号一律用 LaTeX**：行内写 \\( ... \\)，独立公式写 \\[ ... \\]，' +
    '矩阵写 \\begin{pmatrix}...\\end{pmatrix}。不要用纯文本凑公式（写 \\(x^2\\) 而不是 x^2）；' +
    '④ 计算题要给出**完整步骤与中间算式**，不要跳步；证明题要说清辅助函数是怎么构造出来的；' +
    '⑤ 不确定的地方明确说不确定，不要编造真题年份、题号或教材原文；' +
    '⑥ 篇幅控制在 500 字以内（出题任务除外）。';

  var ACTIONS = {
    before: [
      { id: 'hint', icon: '🤔', label: '不懂？讲讲这题考什么', tip: '不剧透答案，只讲考点与解题突破口' }
    ],
    after: [
      { id: 'explain', icon: '💡', label: '步骤剖析', tip: '每一步怎么来的、为什么这么变形' },
      { id: 'concept', icon: '📌', label: '考点归纳', tip: '这题考什么、易错点在哪' },
      { id: 'exam', icon: '📚', label: '真题考法', tip: '这个考点在数二真题里怎么考、关联哪些考点' },
      { id: 'variant', icon: '🔁', label: '出变式题', tip: '出一道同类变式题，含答案与解析' }
    ]
  };

  function buildMessages(actionId, ctx, extra) {
    var ctxText = questionText(ctx);
    var ask;
    if (extra) {
      ask = '以下是学生正在做的题目（可能已作答）：\n\n' + ctxText +
        '\n\n请回答学生的追问：' + extra;
    } else if (actionId === 'hint') {
      ask = '以下是学生正在做的题目，他暂时不会做：\n\n' + ctxText +
        '\n\n请只做两件事：① 点明这道题考的是哪个知识点、在考纲里的位置；' +
        '② 给出解题思路的第一步（应该从哪想起、用哪个概念或公式切入）。' +
        '注意：不要直接给出最终答案或指明选哪一项，让他自己动手。200 字以内。';
    } else if (actionId === 'explain') {
      ask = '以下是学生刚做完的题目：\n\n' + ctxText +
        '\n\n请逐个分析每个选项或每个要点：正确的为什么正确，错误的错在哪里（指出它混淆了哪个概念）。' +
        '最后用一句话点出这道题埋的坑。';
    } else if (actionId === 'concept') {
      ask = '以下是学生刚做完的题目：\n\n' + ctxText +
        '\n\n请归纳：① 这道题考的核心知识点（一句话）；② 属于哪类题型；' +
        '③ 3 条易错点或常见陷阱；④ 记住一句口诀或一句话总结。用短条目列出。';
    } else if (actionId === 'exam') {
      ask = '以下是学生刚做完的题目：\n\n' + ctxText +
        '\n\n请说明：① 这个考点在 302 数学二历年真题里通常以什么形式出现（选择题 / 填空题 / 解答题）；' +
        '② 大概的分值权重级别（高/中/低）；③ 与它紧邻、容易一起考的关联考点 2~3 个。' +
        '重要：不要编造具体的年份、题号或原题文字；如果只是大致印象，请说明是经验性判断。';
    } else if (actionId === 'variant') {
      ask = '以下是学生刚做完的题目：\n\n' + ctxText +
        '\n\n请仿照这道题，出 1 道考查同一知识点但换一个角度的变式题（难度相当）。' +
        '格式要求：先给题目（若是选择题请给出 ABCD 四个选项），再另起一段给「答案」与「解析」。' +
        '不要照抄原题的数字或表述。';
    } else {
      ask = '以下是学生正在做的题目：\n\n' + ctxText + '\n\n请解答。';
    }
    return [{ role: 'system', content: SYS }, { role: 'user', content: ask }];
  }

  /* ---------------- 流式调用 ---------------- */
  var current = null;   // AbortController

  /**
   * @param {Array} messages
   * @param {object} h {onDelta, onDone, onError}
   */
  function stream(messages, h) {
    var r = resolved();
    if (!r.key) { h.onError('还没填 API 密钥。请点顶部「🏅 成就」→ 切到「🤖 AI 助教」填入密钥（只存在你自己浏览器里）。'); return; }
    if (!r.base) { h.onError('还没填接口地址。'); return; }
    if (!r.model) { h.onError('还没填模型名。请在「🤖 AI 助教」里选一个或点「拉取模型列表」。'); return; }

    if (current) { try { current.abort(); } catch (e) {} }
    var ac = new AbortController();
    current = ac;
    // 无论成功、失败还是被取消，都必须把 current 复位。
    // 否则 streaming() 永远为真 → 之后 mountAi 会一直跳过 → 后面题目的 AI 区块再也不出现。
    var done = function () { if (current === ac) current = null; };

    var headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + r.key };
    // 走服务端代理时，由中转函数去联系真实上游，这里把上游地址告诉它
    if (r.proxy) headers['x-hnsf-base'] = r.upstream;
    // OpenRouter 建议带来源标识，便于它做免费额度统计
    if (/openrouter\.ai/.test(r.upstream)) {
      try {
        headers['HTTP-Referer'] = location.origin;
        headers['X-Title'] = '302 数学二 闯关刷题';
      } catch (e) {}
    }

    var chain = fetch(r.base + '/chat/completions', {
      method: 'POST',
      headers: headers,
      signal: ac.signal,
      body: JSON.stringify({ model: r.model, messages: messages, stream: true, temperature: 0.35 })
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) { throw new Error(explainError(res.status, t)); });
      }
      if (!res.body || !res.body.getReader) {
        // 个别环境不支持流式，退化成一次性返回
        return res.json().then(function (j) {
          var t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
          if (t) h.onDelta(t);
          h.onDone();
        });
      }
      var reader = res.body.getReader();
      var dec = new TextDecoder('utf-8');
      var buf = '';
      var got = false;
      function pump() {
        return reader.read().then(function (res2) {
          if (res2.done) {
            if (!got) h.onError('接口没有返回内容，可能模型名不对或额度已用尽。');
            else h.onDone();
            return;
          }
          buf += dec.decode(res2.value, { stream: true });
          var lines = buf.split('\n');
          buf = lines.pop();
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.indexOf('data:') !== 0) continue;   // 跳过空行与 SSE 注释
            var data = line.slice(5).trim();
            if (data === '[DONE]') continue;
            try {
              var j = JSON.parse(data);
              var d = j.choices && j.choices[0] && (j.choices[0].delta || j.choices[0].message);
              var piece = d && (d.content || '');
              if (piece) { got = true; h.onDelta(piece); }
            } catch (e) { /* 半截 JSON，忽略 */ }
          }
          return pump();
        });
      }
      return pump();
    }).catch(function (err) {
      if (err && err.name === 'AbortError') return;
      var msg = err && err.message ? err.message : String(err);
      if (/Failed to fetch|NetworkError|load failed/i.test(msg)) {
        msg = '连不上接口。可能原因：网络被拦截（此类接口在国内有时需要代理）、或对方服务器没开放浏览器跨域。' +
          '可以换一个平台试试（智谱 / 硅基流动 / 通义 实测都支持浏览器直连）。';
      }
      h.onError(msg);
    });

    chain.then(done, done);
  }

  function stop() { if (current) { try { current.abort(); } catch (e) {} current = null; } }

  /** 是否有请求正在进行（供外部避免在生成中重挂区块） */
  function streaming() { return !!current; }

  /* ---------------- 面板 UI ---------------- */
  /** 在答题卡片里挂载 AI 区块 */
  function mount(el, ctx) {
    if (!el) return;
    // 保留已有的 AI 输出：同一道题从"作答前"升到"作答后"时只换按钮，不冲掉已生成的内容
    var prevOut = el.querySelector('.ai-out');
    var prevHTML = prevOut ? prevOut.innerHTML : '';
    var prevHidden = prevOut ? prevOut.hidden : true;
    var prevFollow = el.querySelector('.ai-followup');
    var prevFollowHidden = prevFollow ? prevFollow.hidden : true;

    var list = ACTIONS[ctx.phase === 'after' ? 'after' : 'before'] || ACTIONS.before;
    el.innerHTML =
      '<div class="ai-head">' +
        '<span class="ai-title">🤖 AI 助教</span>' +
        (hasKey() ? '<span class="ai-src">' + (PRESETS[getCfg().provider] || {}).label + ' · ' + resolved().model + '</span>'
          : '<span class="ai-src ai-nokey">还没填密钥</span>') +
      '</div>' +
      '<div class="ai-btns">' +
        list.map(function (a) {
          return '<button class="ai-btn" data-act="' + a.id + '" title="' + a.tip + '">' +
            a.icon + ' ' + a.label + '</button>';
        }).join('') +
        '<button class="ai-btn ghost" data-act="__cfg">⚙️ 设置</button>' +
      '</div>' +
      '<div class="ai-out" hidden></div>' +
      '<div class="ai-followup" hidden>' +
        '<input class="ai-input" type="text" placeholder="继续追问，例如：为什么这一步能直接用洛必达法则？">' +
        '<button class="ai-btn" data-act="__send">发送</button>' +
      '</div>';

    var out = el.querySelector('.ai-out');
    var follow = el.querySelector('.ai-followup');
    var input = el.querySelector('.ai-input');

    if (prevHTML) {
      out.innerHTML = prevHTML;
      out.hidden = prevHidden;
      follow.hidden = prevFollowHidden;
    }

    function showOut() {
      out.hidden = false;
      follow.hidden = false;
    }

    function run(actionId, extra) {
      showOut();
      out.innerHTML = '<div class="ai-status">正在思考…（免费模型通常需要 10~25 秒，请稍候）' +
        '<button class="ai-stop" data-act="__stop">停止</button></div><div class="ai-text"></div>';
      var textEl = out.querySelector('.ai-text');
      var buf = '';
      var atBottom = true;
      var bodyEl = el.closest('.battle-body');

      function append(t) {
        buf += t;
        textEl.innerHTML = mdLite(buf);
        if (atBottom && bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;
      }

      // 用户手动往上滚时就别再自动跟到底部，避免打断阅读
      if (bodyEl && !bodyEl.__aiScrollBound) {
        bodyEl.__aiScrollBound = true;
        bodyEl.addEventListener('scroll', function () {
          atBottom = bodyEl.scrollHeight - bodyEl.scrollTop - bodyEl.clientHeight < 40;
        });
      }

      stream(buildMessages(actionId, ctx, extra), {
        onDelta: append,
        onDone: function () {
          var st = out.querySelector('.ai-status');
          if (st) st.outerHTML = '<div class="ai-done">✅ 以上内容由 AI 生成，可能有错，请以教材与真题为准</div>';
          if (!buf) out.querySelector('.ai-text').innerHTML = '<div class="ai-err">接口没有返回内容。</div>';
          // 数学二：AI 回答里的 LaTeX 在流式结束后一次性渲染。
          // 不在流式过程中渲染 —— 那时候公式定界符可能只到一半，渲染必出乱码。
          if (NS.Engine && NS.Engine.renderMath) {
            try { NS.Engine.renderMath(out); } catch (e) { /* 渲染失败就保留原文 */ }
          }
        },
        onError: function (msg) {
          var st = out.querySelector('.ai-status');
          if (st) st.outerHTML = '<div class="ai-err">⚠️ ' + mdLite(msg) + '</div>';
        }
      });
    }

    function onClick(e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var act = btn.dataset.act;
      if (act === '__cfg') { if (NS.App && NS.App.openPanel) NS.App.openPanel('ai'); return; }
      if (act === '__stop') { stop(); var st = out.querySelector('.ai-status'); if (st) st.outerHTML = '<div class="ai-done">已停止生成</div>'; return; }
      if (act === '__send') { sendFollow(); return; }
      run(act, null);
    }

    function sendFollow() {
      var v = (input.value || '').trim();
      if (!v) return;
      input.value = '';
      run(null, v);
    }

    function onKey(e) {
      if (e.target === input && e.key === 'Enter') { e.preventDefault(); sendFollow(); }
    }

    // 幂等绑监听：mount 会在同一元素上被调用多次（作答前→作答后），
    // 不先解绑会导致一次点击触发多次请求
    if (el.__aiOnClick) el.removeEventListener('click', el.__aiOnClick);
    if (el.__aiOnKey) el.removeEventListener('keydown', el.__aiOnKey);
    el.__aiOnClick = onClick;
    el.__aiOnKey = onKey;
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', onKey);
    el.__aiMounted = true;
  }

  /* ---------------- 极简 Markdown 渲染（够用即可，且必须转义 HTML） ---------------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function mdLite(src) {
    var t = esc(src);
    // 先把代码块抽成占位符，避免里面的内容被下面的标题/列表规则误改
    var blocks = [];
    t = t.replace(/```([\s\S]*?)```/g, function (m, c) {
      blocks.push(c.replace(/^\n+|\n+$/g, ''));
      return '\u0000B' + (blocks.length - 1) + '\u0000';
    });
    // 标题
    t = t.replace(/^#{1,4}\s*(.+)$/gm, '<div class="ai-h">$1</div>');
    // 行内代码
    t = t.replace(/`([^`\n]+)`/g, '<code class="ai-code">$1</code>');
    // 粗体
    t = t.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
    // 无序列表
    t = t.replace(/^\s*[-*]\s+(.+)$/gm, '<div class="ai-li">• $1</div>');
    // 有序列表
    t = t.replace(/^\s*(\d+)[.、)]\s+(.+)$/gm, '<div class="ai-li"><b>$1.</b> $2</div>');
    // 段落换行
    t = t.replace(/\n{2,}/g, '<div class="ai-gap"></div>');
    t = t.replace(/\n/g, '<br>');
    // 还原代码块
    t = t.replace(/\u0000B(\d+)\u0000/g, function (m, i) {
      return '<pre class="ai-pre">' + (blocks[+i] || '') + '</pre>';
    });
    return t;
  }

  NS.AI = {
    PRESETS: PRESETS,
    ACTIONS: ACTIONS,
    getCfg: getCfg,
    setCfg: setCfg,
    clearCfg: clearCfg,
    resolved: resolved,
    ready: ready,
    defaultProxyUrl: defaultProxyUrl,
    hasKey: hasKey,
    maskKey: maskKey,
    listModels: listModels,
    explainError: explainError,
    mount: mount,
    stop: stop,
    streaming: streaming,
    stream: stream,
    buildMessages: buildMessages,
    questionText: questionText,
    mdLite: mdLite,
    /** 诊断用 */
    info: function () {
      var r = resolved();
      return {
        provider: r.provider, base: r.base, model: r.model,
        hasKey: !!r.key, keyMasked: maskKey(r.key), ready: ready()
      };
    }
  };
})(window.HNSF829);
