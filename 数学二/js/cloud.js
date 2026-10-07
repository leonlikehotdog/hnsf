/* ============================================================
 * 302 数学二 闯关系统 · ☁️ 云端进度同步（Supabase）
 * ------------------------------------------------------------
 * 解决的问题：进度存在 localStorage，**按 origin 隔离** —— 手机 / 电脑天然两套，
 * 换域名（每次部署的快照域名都不同）也会看成"新玩家"。这里把存档搬到云端。
 *
 * 安全模型 = 「同步码即口令」：
 *   · 前端只能通过两个 RPC 读写（math2_push / math2_pull），表本身对 anon 零权限；
 *   · 两个函数都必须**精确给出同步码**才命中一行 → 拿 anon_key 也拉不走全表；
 *   · 代价：同步码丢了就找不回来（没有找回渠道，这是知识库式口令）。
 *
 * 语义：**整份覆盖**，不做字段级合并 —— 合并最容易出错，先简单可靠。
 *   上传 = 用本机覆盖云端；下载 = 用云端覆盖本机（会丢本机进度，UI 上有二次确认）。
 *
 * 自动同步（单人自用，默认开启）：
 *   · 内置固定同步码 DEFAULT_CODE —— 换设备 / 清缓存 / 换域名后，打开即自动拉回进度；
 *   · 打开时比对「本机最后保存时间」与「云端 updated_at」，新的一方整份胜出；
 *   · 本机有改动 → 防抖 6 秒自动上传；页面隐藏 / 关闭前补传一次；
 *   · **本机为空时一律以云端为准**（这就是"进度失而复得"的路径）；
 *     反过来，本机为空时**绝不自动上传**，避免重置存档把云端备份冲掉（要冲请手动上传）。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  // 与 store.js / diary.js 里的 key 保持一致（那两处是私有的，这里只能重写一遍）
  var SAVE_KEY = 'hnsf302_save_v1';
  var DIARY_KEY = 'hnsf302_diary_v1';
  var SYNC_KEY = 'hnsf302_sync_v1';          // { code, ts } —— 只存同步码与最后同步时间
  var TS_KEY = 'hnsf302_autots_v1';          // 本机最近一次保存时间（毫秒），用于和云端比新旧

  // 单人自用：内置固定同步码。首次运行会写进本机；用户可在设置里改成自己的码。
  var DEFAULT_CODE = 'HNSF-MATH2-SAVE-0726';

  // Supabase 项目（anon_key 公开在前端是设计如此：它的权限被 RLS 与函数授限卡死）
  var URL_BASE = 'https://yucploakclaznlmfpdkk.supabase.co';
  var ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3Bsb2FrY2xhem5sbWZwZGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNjAyNDQsImV4cCI6MjA5OTczNjI0NH0.-VpUDJgIR0KlEReUM5LzSShIwog2YiJgH28QJAj6GHI';

  var MIN_CODE = 12;                         // 与 SQL 里的长度校验一致
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // 去掉 I/O/0/1 等易混字符

  var busy = false;                          // 防连点（上传/下载同时只跑一个）
  var suppress = false;                      // 正在应用云端数据：期间本机保存事件不上传
  var autoReady = false;                     // 首次拉取对照完成前，禁止自动上传（防空存档覆盖云端）
  var pushTimer = null;                      // 自动上传的防抖计时器

  /* ---------------- 同步码存取 ---------------- */
  function meta() {
    try { return JSON.parse(localStorage.getItem(SYNC_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeMeta(m) {
    try { localStorage.setItem(SYNC_KEY, JSON.stringify(m)); } catch (e) { /* 隐私模式忽略 */ }
  }
  function code() { return meta().code || ''; }
  function setCode(c) {
    var m = meta();
    m.code = String(c == null ? '' : c).trim();
    writeMeta(m);
    return m.code;
  }
  function lastSync() { return meta().ts || 0; }
  function touchSync() { var m = meta(); m.ts = Date.now(); writeMeta(m); }
  function codeOk(c) { return String(c || '').trim().length >= MIN_CODE; }

  function genCode() {
    var out = [];
    for (var g = 0; g < 4; g++) {
      var seg = '';
      for (var i = 0; i < 4; i++) seg += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
      out.push(seg);
    }
    return out.join('-');                    // 形如 XXXX-XXXX-XXXX-XXXX（共 19 位）
  }

  /* ---------------- 与 Supabase 通信 ---------------- */
  function rpc(fn, args, keepalive) {
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 15000) : null;
    return fetch(URL_BASE + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': 'Bearer ' + ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args || {}),
      keepalive: !!keepalive,                // 页面关闭前的补传也能发出去
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      if (timer) clearTimeout(timer);
      return r.text().then(function (t) {
        var body = null;
        try { body = t ? JSON.parse(t) : null; } catch (e) { body = t; }
        if (!r.ok) {
          var msg = (body && (body.message || body.hint || body.error)) || ('HTTP ' + r.status);
          throw new Error(String(msg));
        }
        return body;
      });
    }, function (e) {
      if (timer) clearTimeout(timer);
      throw new Error(e && e.name === 'AbortError' ? '请求超时（网络不通？）' : '网络错误');
    });
  }

  /* ---------------- 存档打包 / 落盘 ---------------- */
  /** 打包本机存档（含疑问日记，日记是学习资产，一起同步） */
  function collect() {
    var save = null, diary = null;
    try { save = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) {}
    try { diary = JSON.parse(localStorage.getItem(DIARY_KEY) || 'null'); } catch (e) {}
    return { app: 'hnsf302', v: 1, at: Date.now(), save: save, diary: diary };
  }

  /** 用云端 payload 覆盖本机（含存档与日记）。期间的本机保存事件不上传，防止立刻回写。 */
  function applyPayload(p) {
    suppress = true;
    try {
      if (p && p.save) {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(p.save)); } catch (e) {}
        if (NS.Store && NS.Store.replace) NS.Store.replace(p.save);
      }
      if (p && p.diary) {
        try { localStorage.setItem(DIARY_KEY, JSON.stringify(p.diary)); } catch (e) {}
        if (NS.Diary && NS.Diary.refresh) NS.Diary.refresh();
      }
    } finally { suppress = false; }
  }

  /** 本机是否"没有任何进度"（新设备/清缓存/刚重置都算空）*/
  function isLocalEmpty() {
    var s = null, d = null;
    try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) {}
    try { d = JSON.parse(localStorage.getItem(DIARY_KEY) || 'null'); } catch (e) {}
    var hasSave = !!(s && ((s.xp || 0) > 0 ||
      (s.cleared && Object.keys(s.cleared).length) ||
      (s.wrong && Object.keys(s.wrong).length) ||
      (s.achievements && Object.keys(s.achievements).length) ||
      (s.nodeStats && Object.keys(s.nodeStats).length) ||
      (s.stats && (s.stats.answered || 0) > 0)));
    var hasDiary = !!(d && d.items && d.items.length);
    return !hasSave && !hasDiary;
  }

  function localTs() {
    var v = 0;
    try { v = parseInt(localStorage.getItem(TS_KEY) || '0', 10) || 0; } catch (e) {}
    return v;
  }

  /** 忙时排队：手动上传/下载不丢，等自动上传跑完再执行 */
  function runWhenFree(fn) {
    if (!busy) { fn(); return; }
    setTimeout(function () { runWhenFree(fn); }, 250);
  }

  /**
   * 手动上传：本机 → 云端
   * done(ok, info)；info 成功时为 { at: 毫秒时间戳 }
   */
  function push(done) {
    var c = code();
    if (!codeOk(c)) { done(false, { message: '同步码至少要 ' + MIN_CODE + ' 位' }); return; }
    runWhenFree(function () {
      busy = true;
      rpc('math2_push', { p_code: c, p_payload: collect() }).then(function (ts) {
        busy = false;
        touchSync();
        done(true, { at: ts ? Date.parse(ts) || Date.now() : Date.now() });
      }, function (e) {
        busy = false;
        done(false, { message: e.message || '上传失败' });
      });
    });
  }

  /**
   * 手动下载：云端 → 本机（**整份覆盖**）
   * done(ok, info)；info 成功时为 { empty:true }（该码云端没有数据）或 { at, save, diary }
   */
  function pull(done) {
    var c = code();
    if (!codeOk(c)) { done(false, { message: '同步码至少要 ' + MIN_CODE + ' 位' }); return; }
    runWhenFree(function () {
      busy = true;
      rpc('math2_pull', { p_code: c }).then(function (rows) {
        busy = false;
        if (!rows || !rows.length) { done(true, { empty: true }); return; }
        var row = rows[0];
        applyPayload(row.payload);
        touchSync();
        done(true, { at: Date.parse(row.updated_at) || Date.now(), save: row.payload && row.payload.save });
      }, function (e) {
        busy = false;
        done(false, { message: e.message || '下载失败' });
      });
    });
  }

  /* ---------------- 自动同步 ---------------- */

  /** store.js 每次 save() 都会调它：记下本机改动时间，并安排一次防抖上传 */
  function onLocalSave() {
    try { localStorage.setItem(TS_KEY, String(Date.now())); } catch (e) {}
    if (!suppress) schedulePush();
  }

  function schedulePush() {
    if (!autoReady || pushTimer) return;
    pushTimer = setTimeout(function () { pushTimer = null; autoPush(false); }, 6000);
  }

  /** 静默上传：失败不打扰用户（手动入口仍在）。空存档不上传，保护云端备份。 */
  function autoPush(flush) {
    var c = code();
    if (!autoReady || !codeOk(c) || busy) return;
    if (isLocalEmpty()) return;
    busy = true;
    rpc('math2_push', { p_code: c, p_payload: collect() }, flush).then(function () {
      busy = false;
      touchSync();
    }, function () { busy = false; });
  }

  /** 打开时的一次对照：本机为空 or 云端更新 → 拉云端；否则把本机推上去 */
  function autoInit() {
    var c = code();
    if (!codeOk(c)) { autoReady = true; return; }
    rpc('math2_pull', { p_code: c }).then(function (rows) {
      var row = (rows && rows.length) ? rows[0] : null;
      var cloudAt = row ? (Date.parse(row.updated_at) || 0) : 0;
      var empty = isLocalEmpty();
      var lt = localTs();
      // 「首次运行保护」：刚升级到自动同步的设备还没有本机时间戳（lt=0），
      // 此时只要本机有进度，就以本机为准 —— 否则会被云端旧副本盖掉真实进度。
      var useCloud = !!(row && (empty || (lt > 0 && cloudAt > lt)));
      autoReady = true;
      if (useCloud) {
        applyPayload(row.payload);
        touchSync();
        try {
          if (NS.Engine && NS.Engine.toast) {
            NS.Engine.toast(empty ? '☁️ 已从云端恢复进度' : '☁️ 云端进度较新，已同步到本机');
          }
        } catch (e) {}
      } else if (!empty) {
        autoPush(true);                      // 本机较新 → 静默上传
      }
    }, function () {
      autoReady = true;                      // 拉取失败（离线）也放行，避免卡住后续自动上传
    });
  }

  function boot() {
    try {
      if (!code()) setCode(DEFAULT_CODE);    // 首次运行：写入内置同步码 → 免配置
      autoInit();
    } catch (e) {}
  }

  NS.Cloud = {
    code: code,
    setCode: setCode,
    genCode: genCode,
    codeOk: codeOk,
    lastSync: lastSync,
    minCode: MIN_CODE,
    defaultCode: DEFAULT_CODE,
    push: push,
    pull: pull,
    onLocalSave: onLocalSave,                // store.js 的存档钩子
    isLocalEmpty: isLocalEmpty,
    busy: function () { return busy; }
  };

  // 启动：等 DOM 就绪再延迟一点，确保 app.js 已经订阅 Store（拉回存档后能刷新界面）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 60); });
  } else {
    setTimeout(boot, 60);
  }
  // 页面隐藏 / 关闭前补传一次，减少"刚打完就关掉"造成的丢档
  window.addEventListener('pagehide', function () { if (autoReady) autoPush(true); });
})(window.HNSF829);
