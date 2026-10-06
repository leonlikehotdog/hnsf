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
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  // 与 store.js / diary.js 里的 key 保持一致（那两处是私有的，这里只能重写一遍）
  var SAVE_KEY = 'hnsf302_save_v1';
  var DIARY_KEY = 'hnsf302_diary_v1';
  var SYNC_KEY = 'hnsf302_sync_v1';          // { code, ts } —— 只存同步码与最后同步时间

  // Supabase 项目（anon_key 公开在前端是设计如此：它的权限被 RLS 与函数授限卡死）
  var URL_BASE = 'https://yucploakclaznlmfpdkk.supabase.co';
  var ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3Bsb2FrY2xhem5sbWZwZGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNjAyNDQsImV4cCI6MjA5OTczNjI0NH0.-VpUDJgIR0KlEReUM5LzSShIwog2YiJgH28QJAj6GHI';

  var MIN_CODE = 12;                         // 与 SQL 里的长度校验一致
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // 去掉 I/O/0/1 等易混字符

  var busy = false;                          // 防连点（上传/下载同时只跑一个）

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
  function rpc(fn, args) {
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

  /** 打包本机存档（含疑问日记，日记是学习资产，一起同步） */
  function collect() {
    var save = null, diary = null;
    try { save = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) {}
    try { diary = JSON.parse(localStorage.getItem(DIARY_KEY) || 'null'); } catch (e) {}
    return { app: 'hnsf302', v: 1, at: Date.now(), save: save, diary: diary };
  }

  /** 用云端 payload 覆盖本机（含存档与日记） */
  function applyPayload(p) {
    if (p && p.save) {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(p.save)); } catch (e) {}
      if (NS.Store && NS.Store.replace) NS.Store.replace(p.save);
    }
    if (p && p.diary) {
      try { localStorage.setItem(DIARY_KEY, JSON.stringify(p.diary)); } catch (e) {}
      if (NS.Diary && NS.Diary.refresh) NS.Diary.refresh();
    }
  }

  /**
   * 上传：本机 → 云端
   * done(ok, info)；info 成功时为 { at: 毫秒时间戳 }
   */
  function push(done) {
    var c = code();
    if (!codeOk(c)) { done(false, { message: '同步码至少要 ' + MIN_CODE + ' 位' }); return; }
    if (busy) return;
    busy = true;
    rpc('math2_push', { p_code: c, p_payload: collect() }).then(function (ts) {
      busy = false;
      touchSync();
      done(true, { at: ts ? Date.parse(ts) || Date.now() : Date.now() });
    }, function (e) {
      busy = false;
      done(false, { message: e.message || '上传失败' });
    });
  }

  /**
   * 下载：云端 → 本机（**整份覆盖**）
   * done(ok, info)；info 成功时为 { empty:true }（该码云端没有数据）或 { at, save, diary }
   */
  function pull(done) {
    var c = code();
    if (!codeOk(c)) { done(false, { message: '同步码至少要 ' + MIN_CODE + ' 位' }); return; }
    if (busy) return;
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
  }

  NS.Cloud = {
    code: code,
    setCode: setCode,
    genCode: genCode,
    codeOk: codeOk,
    lastSync: lastSync,
    minCode: MIN_CODE,
    push: push,
    pull: pull,
    busy: function () { return busy; }
  };
})(window.HNSF829);
