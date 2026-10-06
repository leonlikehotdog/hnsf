/* ============================================================
 * 302 数学二 闯关系统 · 大模型客户端
 * ------------------------------------------------------------
 * 这里只负责「把消息发给模型、把流式结果收回来」，不含任何界面与人格。
 * 界面与人格在 js/master.js（「请教师傅」），设置表单在那里也可以改。
 *
 * 设计原则：
 *   1. 纯前端直连，不需要后端（已实测各平台 OPTIONS 预检通过）
 *   2. 密钥默认由使用者在页面里自行填写、只存本机 localStorage；
 *      **本项目是单人自用**，所以另留了下面的 BUILTIN 内置默认（见第 3 条）
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

  /* ---------------- 内置默认配置（单机自用） ----------------
     用途：把平台、模型、密钥写在这里，**换设备/换浏览器打开就能直接用**，
           不必再到 ⚙️ 里重新粘一遍（手机端尤其省事）。
     生效规则：本机 localStorage 里存了密钥 → 以本机那份为准；
               没有（新设备、清过缓存）→ 用这里的。
     留空字符串 = 不启用内置，行为与以前完全一致。

     ⚠️ 两点必须知道：
       1. 本站是**公网静态站点**，写在这里的 key 任何人打开页面源码都能看到。
          只有「确认这个 key 只给自己用、且不怕被翻到」时才填。
          建议用免费档的 key（GLM / 豆包 / 百炼都有免费额度），别填绑了付费的。
       2. 提交进 git 后，key 也会留在仓库历史里，事后改代码删不掉历史记录。
          真要作废只能去平台后台把 key 停掉、重建一把。
  */
  var BUILTIN = {
    provider: 'deepseek',                  // 'dashscope' | 'gemini' | 'doubao' | 'zhipu' | ...（见下方 PRESETS）
    base: '',                              // 留空 = 用该平台预设地址 https://api.deepseek.com
    model: '',                             // 留空 = 用该平台预设模型名（deepseek 预设即 deepseek-flash）
    key: 'sk-7046b277d9c34b5092e1da9c72cf08bc',
    proxy: false,                          // 是否走服务端代理（Gemini 在国内需要）
    proxyUrl: ''                           // 留空 = 用默认 api/ai
  };
  var builtinOn = false;   // 本机是否正在使用内置配置（供界面提示）

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
      model: 'gemini-3.6-flash',
      hint: '免费档确实存在：官网定价页上 Flash 这一档的输入/输出都写着 Free of charge，但**不是"没限制"**——' +
        '每分钟请求数(RPM)、每分钟 token(TPM)、每天请求数(RPD) 三个维度都会卡；' +
        '官方从 2026-04 起已**不再公布具体数字**，只让你去 AI Studio 的 Rate limits 页看自己项目那组值（按项目算，不按 key；RPD 每天太平洋时间午夜重置）。' +
        '另外免费档有两条代价：① 你的提问会被用于改进 Google 的产品（付费档才是 No）；② Search / Maps 这类 grounding 免费档不可用。' +
        '⚠️ 2026 年起 **gemini-2.5-flash 已对「新用户」下线** —— 调用直接返回 404，提示改用 gemini-3.8-flash；' +
        '所以这里默认填了实测可用的 gemini-3.6-flash。官网文档在列的稳定名是 gemini-3.5-flash（同样免费），' +
        'gemini-3.8-flash 是官方推荐的新主力但高峰期常 503（稍后重试即可），gemini-3.5-flash-lite 也可用。' +
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

  /* ---------------- 配置读写（优先本机，其次内置默认） ---------------- */
  function getCfg() {
    var d = { provider: 'dashscope', base: '', model: '', key: '', proxy: false, proxyUrl: '' };
    var o = {};
    try { o = JSON.parse(localStorage.getItem(CFG_KEY) || '{}') || {}; } catch (e) { o = {}; }

    // 1) 本机没填过密钥 → 铺上内置默认（新设备/清缓存后即开即用）
    var localKey = (typeof o.key === 'string' ? o.key : '').trim();
    builtinOn = !localKey && !!(BUILTIN.key || '').trim();
    if (builtinOn) {
      ['provider', 'base', 'model', 'key', 'proxy', 'proxyUrl'].forEach(function (k) {
        if (BUILTIN[k]) d[k] = BUILTIN[k];
      });
    }

    // 2) 本机已存的非空项覆盖内置（留空 = 沿用内置/预设，不会被空串抹掉）
    if (o.provider) d.provider = o.provider;
    if (typeof o.base === 'string' && o.base.trim()) d.base = o.base;
    if (typeof o.model === 'string' && o.model.trim()) d.model = o.model;
    if (localKey) d.key = localKey;
    if (typeof o.proxy === 'boolean') d.proxy = o.proxy;
    if (typeof o.proxyUrl === 'string' && o.proxyUrl.trim()) d.proxyUrl = o.proxyUrl;
    return d;
  }

  function setCfg(patch) {
    var c = getCfg();
    Object.keys(patch || {}).forEach(function (k) { c[k] = patch[k]; });
    // 来自内置默认的密钥**不落盘**：本机存空串 = 「沿用内置」。
    // 否则用户只是改个平台/模型，就把内置 key 复制进了这台浏览器，
    // 以后改 ai.js 里的 BUILTIN.key 反而不会生效（本机那份旧 key 会一直赢）。
    var toStore = JSON.parse(JSON.stringify(c));
    if (BUILTIN.key && toStore.key === BUILTIN.key) toStore.key = '';
    try { localStorage.setItem(CFG_KEY, JSON.stringify(toStore)); } catch (e) {}
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
    if (status === 401 || status === 403) return '密钥无效或没填对（HTTP ' + status + '）。请到「请教师傅」对话框的 ⚙️ 里重新粘贴密钥。';
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

  var TYPE_LABEL = { choice: '选择题', blank: '填空题', calc: '计算题', proof: '证明题', app: '应用题' };

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

  /* ---------------- 流式调用 ---------------- */
  var current = null;   // AbortController

  /**
   * @param {Array} messages
   * @param {object} h {onDelta, onDone, onError}
   */
  function stream(messages, h) {
    var r = resolved();
    if (!r.key) { h.onError('还没填 API 密钥。请点「请教师傅」对话框右上角的 ⚙️ 里粘贴密钥（只存在你自己浏览器里）。'); return; }
    if (!r.base) { h.onError('还没填接口地址。'); return; }
    if (!r.model) { h.onError('还没填模型名。请在「请教师傅」的 ⚙️ 里选一个，或点「拉取模型列表」。'); return; }

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
    stop: stop,
    stream: stream,
    questionText: questionText,
    mdLite: mdLite,
    /** 当前生效的密钥是否来自代码里的内置默认（供界面提示用，避免用户疑惑"我没填怎么就能用"） */
    usingBuiltin: function () { getCfg(); return builtinOn; },
    /** 内置默认是否已配置（只看代码，不看本机） */
    hasBuiltin: function () { return !!(BUILTIN.key || '').trim(); },
    /** 诊断用 */
    info: function () {
      var r = resolved();
      return {
        provider: r.provider, base: r.base, model: r.model,
        hasKey: !!r.key, keyMasked: maskKey(r.key), ready: ready(),
        builtin: builtinOn
      };
    }
  };
})(window.HNSF829);
