/* ============================================================
 * 302 数学二 闯关系统 · ☁️ 云端进度同步（Supabase —— 单一事实源）
 * ------------------------------------------------------------
 * 规则只有一条线，没有别的分支：
 *   1. 进度只有一份：云端 math2_saves 按「同步码」的那一行。
 *   2. 开机：拉这一行 → 有就把云端那份直接放进本机（云端 = 真相）。
 *      没有就空开局。本机 localStorage 只是开机请求落地前的镜像，
 *      不作为任何判定的依据（判定依据只用两处的时间戳做一次比较）。
 *   3. 保存：本机每次存档 → 1.2 秒内推上云端（实时）；
 *      页面隐藏 / 关闭前用 keepalive 补传，不丢最后一口。
 *   4. 唯一允许本机胜出的场景：本机有实货（不只是个空壳）且比云端新
 *      —— 直接静默推上云端，不打扰（比如在另一台设备玩过一天后回家）。
 *
 * 仍然保留的两条底线（这不是"有的没的"，是防止事故复发）：
 *   · 首次拉取完成前，绝不上传（空壳覆盖云端的口子从根上焊死）；
 *   · 空壳存档永不自动上传（isLocalEmpty，刚被清过缓存的设备推不了空档）。
 *
 * 安全模型：「同步码即口令」。前端只能走 math2_push / math2_pull 两个 RPC，
 *   表对 anon 零权限，函数要求精确给码才命中一行。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  // 与 store.js / diary.js 里的 key 保持一致（那两处是私有的，这里只能重写一遍）
  var SAVE_KEY = 'hnsf302_save_v1';
  var DIARY_KEY = 'hnsf302_diary_v1';
  var SYNC_KEY = 'hnsf302_sync_v1';          // { code, ts }
  var TS_KEY = 'hnsf302_autots_v1';          // 旧档兼容：今天以前的设备时钟存这里，只读不写

  // 单人自用：内置固定同步码 —— 所有设备共用同一条进度
  var DEFAULT_CODE = 'HNSF-MATH2-SAVE-0726';

  // Supabase 项目（anon_key 公开在前端是设计如此：权限被 RLS 与函数授限卡死）
  var URL_BASE = 'https://yucploakclaznlmfpdkk.supabase.co';
  var ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3Bsb2FrY2xhem5sbWZwZGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNjAyNDQsImV4cCI6MjA5OTczNjI0NH0.-VpUDJgIR0KlEReUM5LzSShIwog2YiJgH28QJAj6GHI';

  var MIN_CODE = 12;                         // 与 SQL 里的长度校验一致
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // 去掉 I/O/0/1 等易混字符

  var busy = false;                          // 同一时刻只允许一个请求在飞
  var suppress = false;                      // 正在应用云端/外部数据：期间本机保存不上传
  var autoReady = false;                     // 开机第一次对照完成前，禁止一切上传
  var pushTimer = null;                      // 实时上传的合流计时器（1.2s 内只发一次）

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
    return out.join('-');
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
  /** 打包本机（含疑问日记，一起同步） */
  function collect() {
    var save = null, diary = null;
    try { save = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) {}
    try { diary = JSON.parse(localStorage.getItem(DIARY_KEY) || 'null'); } catch (e) {}
    return { app: 'hnsf302', v: 1, at: Date.now(), save: save, diary: diary };
  }

  /** 用云端 payload 覆盖本机。期间的本机保存事件不上传，防止立刻回写。 */
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

  /** 本机是否「没有任何实货」（新设备 / 清缓存 / 刚重置都算空） */
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

  /** 本机时间：存档对象里的 ts（save() 随存档一起写）为准；旧档回落到独立时间键 */
  function localTs() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) {}
    if (s && s.ts) return s.ts;
    try { return parseInt(localStorage.getItem(TS_KEY) || '0', 10) || 0; } catch (e) { return 0; }
  }

  /** 忙时排队：手动上传/下载不丢，等在飞的请求结束后再跑 */
  function runWhenFree(fn) {
    if (!busy) { fn(); return; }
    setTimeout(function () { runWhenFree(fn); }, 250);
  }

  /**
   * 手动上传：本机 → 云端（面板按钮）
   * done(ok, info)；info 成功时为 { at }
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
   * 手动下载：云端 → 本机（面板按钮，UI 自带「点两下」确认）
   * done(ok, info)；info = { empty:true } 表示云端没有可用的存档
   */
  function pull(done) {
    var c = code();
    if (!codeOk(c)) { done(false, { message: '同步码至少要 ' + MIN_CODE + ' 位' }); return; }
    runWhenFree(function () {
      busy = true;
      rpc('math2_pull', { p_code: c }).then(function (rows) {
        busy = false;
        var row = (rows && rows.length) ? rows[0] : null;
        var payload = row && row.payload && row.payload.save ? row.payload : null;
        if (!payload) { done(true, { empty: true }); return; }   // 云端没有实货 → 整份覆盖无从谈起
        applyPayload(payload);
        touchSync();
        done(true, { at: Date.parse(row.updated_at) || Date.now(), save: payload.save });
      }, function (e) {
        busy = false;
        done(false, { message: e.message || '下载失败' });
      });
    });
  }

  /* ---------------- 实时自动同步 ---------------- */

  /** store.js 每次 save() 都会调它 → 1.2 秒内推上云端（合流，不每题一发） */
  function onLocalSave() {
    if (!suppress) schedulePush();
  }

  function schedulePush() {
    if (!autoReady || pushTimer) return;
    pushTimer = setTimeout(function () { pushTimer = null; autoPush(false); }, 1200);
  }

  /** 静默上传：失败不打扰（面板有手动入口重试）。空壳不上传。 */
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

  /** 开机对照：有实货的哪边新哪边赢，只比对这一次。 */
  function autoInit() {
    var c = code();
    if (!codeOk(c)) { autoReady = true; return; }
    rpc('math2_pull', { p_code: c }).then(function (rows) {
      var row = (rows && rows.length) ? rows[0] : null;
      var payload = row && row.payload && row.payload.save ? row.payload : null;
      var cloudAt = row ? (Date.parse(row.updated_at) || 0) : 0;
      var empty = isLocalEmpty();
      var lt = localTs();
      if (payload && (empty || !(lt > 0) || cloudAt > lt)) {
        applyPayload(payload);                              // 云端有实货且不比本机旧 → 云端赢
        touchSync();
      } else if (!empty) {
        autoPush(true);                                     // 本机有实货且云端没有/更旧 → 本机赢
      }
      autoReady = true;
    }, function () {
      autoReady = true;                                     // 离线也放行，别把上传卡死
    });
  }

  function boot() {
    try {
      if (!code()) setCode(DEFAULT_CODE);    // 首次运行：写入内置同步码 → 免配置
      autoInit();
    } catch (e) { autoReady = true; }
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
  // 页面隐藏 / 关闭前立即补传，减少「刚打完就关掉」造成的丢档
  window.addEventListener('pagehide', function () { if (autoReady) autoPush(true); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && autoReady) autoPush(true);
  });
})(window.HNSF829);
