/* ============================================================
 * 302 数学二 · 🌐 好友联机（同屏闲逛 + 聊天）
 * ------------------------------------------------------------
 * 形态：房间码即房间，不建在线服务，全部走 Supabase。
 *   · Presence  —— 谁在线（uid / 昵称 / 角色）
 *   · Broadcast —— 位置（5Hz）、聊天、气泡（实时）
 *   · RPC       —— 聊天历史落库（mp_chat_push / mp_chat_pull）
 *
 * 进度互不影响：联机只共享位置与聊天，不碰任何人的存档。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var URL_BASE = 'https://yucploakclaznlmfpdkk.supabase.co';
  var ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Y3Bsb2FrY2xhem5sbWZwZGtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNjAyNDQsImV4cCI6MjA5OTczNjI0NH0.-VpUDJgIR0KlEReUM5LzSShIwog2YiJgH28QJAj6GHI';

  var PROFILE_KEY = 'hnsf302_mp_profile_v1';
  var ROOM_KEY = 'hnsf302_mp_room_v1';
  var MAX_PLAYERS = 4;
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  /* 可选的联机形象：复用装备系统的皮肤配色，但不要求已解锁 */
  var CHARS = [
    { id: 'starter', name: '悟空', desc: '蓝色武道服' },
    { id: 'turtle', name: '龟仙流', desc: '橙衣蓝衬' },
    { id: 'saiyan', name: '赛亚王子', desc: '蓝甲白胸' },
    { id: 'future', name: '未来战士', desc: '紫发背剑' }
  ];

  var QUICK = ['加油！', '这题好难', '等我一下', '过了！', '😂', '👍'];

  var sb = null;
  var channel = null;
  var joined = false;
  var roomCode = '';
  var members = [];
  var remoteMap = {};             // uid -> { x,y,dir,moving,skin,mount,name,bubble,bubbleAt }
  var chatSeen = {};
  var posTimer = 0;
  var lastSent = null, lastSentAt = 0;
  var pendingRoom = '';           // 资料还没建时，先记住要进的房间
  var historyWarned = false;
  var lastStatus = '', lastErr = '';
  var el = {};                    // 缓存 DOM

  /* ---------------- 小工具 ---------------- */
  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function toast(msg) {
    if (NS.Engine && NS.Engine.toast) NS.Engine.toast(msg);
  }
  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
  }
  function writeJSON(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
  }

  /* ---------------- 联机资料（昵称 + 角色） ---------------- */
  function profile() {
    var p = readJSON(PROFILE_KEY);
    if (!p || !p.uid) return null;
    if (!p.name) p.name = '无名氏';
    if (!p.skin) p.skin = 'starter';
    return p;
  }

  function saveProfile(name, skin) {
    var p = profile() || { uid: mkUid() };
    p.name = String(name || '').trim().slice(0, 8) || '无名氏';
    p.skin = skin || 'starter';
    p.ts = Date.now();
    writeJSON(PROFILE_KEY, p);
    if (NS.World && NS.World.setSelfName) NS.World.setSelfName(p.name);
    return p;
  }

  function mkUid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    return 'u' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4);
  }

  function charOf(id) {
    for (var i = 0; i < CHARS.length; i++) if (CHARS[i].id === id) return CHARS[i];
    return CHARS[0];
  }

  /* ---------------- 房间码 ---------------- */
  function genCode() {
    var segs = [];
    for (var g = 0; g < 3; g++) {
      var s = '';
      for (var i = 0; i < 4; i++) s += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
      segs.push(s);
    }
    return segs.join('-');
  }
  function normCode(c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function fmtCode(c) {
    var n = normCode(c);
    return [n.slice(0, 4), n.slice(4, 8), n.slice(8, 12)].filter(Boolean).join('-');
  }
  function codeOk(c) { var n = normCode(c); return n.length >= 8 && n.length <= 16; }

  /* ---------------- Supabase 客户端 ---------------- */
  function client() {
    if (sb) return sb;
    if (!window.supabase || !window.supabase.createClient) return null;
    sb = window.supabase.createClient(URL_BASE, ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    return sb;
  }

  function rpc(fn, args) {
    return fetch(URL_BASE + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': 'Bearer ' + ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args || {})
    }).then(function (r) {
      return r.text().then(function (t) {
        var body = null;
        try { body = t ? JSON.parse(t) : null; } catch (e) { body = t; }
        if (!r.ok) throw new Error((body && (body.message || body.hint)) || ('HTTP ' + r.status));
        return body;
      });
    });
  }

  /* ---------------- 头像预览 ---------------- */
  function drawAvatar(cv, skin) {
    if (!cv) return;
    var W = cv.clientWidth || 60, H = cv.clientHeight || 78;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    var g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    g.imageSmoothingEnabled = false;
    if (!NS.World || !NS.World.previewSprite || !NS.Gear || !NS.Gear.specOfSkinId) return;
    var spec = NS.Gear.specOfSkinId(skin);
    var img = NS.World.previewSprite(spec, 'down');
    var lw = img.width / 2, lh = img.height / 2;      // 精灵缓存是 2 倍超采样
    var s = Math.min(W / lw, H / lh);
    var dw = lw * s, dh = lh * s;
    g.drawImage(img, (W - dw) / 2, H - dh, dw, dh);
  }

  function clearAvatarCache() {
    var list = document.querySelectorAll('.mp-avatar');
    for (var i = 0; i < list.length; i++) {
      var cv = list[i];
      drawAvatar(cv, cv.dataset.skin || 'starter');
    }
  }

  /* ---------------- 资料 / 房间面板 ---------------- */
  function open() {
    if (!el.mask) return;
    el.mask.classList.add('show');
    el.mask.setAttribute('aria-hidden', 'false');
    renderPanel();
  }

  function close() {
    if (!el.mask) return;
    el.mask.classList.remove('show');
    el.mask.setAttribute('aria-hidden', 'true');
  }

  function renderPanel() {
    if (!el.body) return;
    var p = profile();
    if (!p) { el.body.innerHTML = profileHtml(); bindProfile(); return; }
    if (joined) { el.body.innerHTML = roomHtml(p); bindRoom(); return; }
    el.body.innerHTML = lobbyHtml(p);
    bindLobby();
  }

  function profileHtml() {
    return '<div class="mp-block">' +
      '<div class="mp-sub">先给自己起个名字、挑个角色 —— 好友会在地图上看到这个形象。</div>' +
      '<label class="mp-field"><span>昵称</span>' +
        '<input id="mpName" maxlength="8" placeholder="最多 8 个字" autocomplete="off" spellcheck="false"></label>' +
      '<div class="mp-chars" id="mpChars">' +
        CHARS.map(function (c, i) {
          return '<button class="mp-char' + (i === 0 ? ' on' : '') + '" data-skin="' + c.id + '" type="button">' +
            '<canvas class="mp-avatar" data-skin="' + c.id + '"></canvas>' +
            '<b>' + c.name + '</b><i>' + c.desc + '</i>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<button class="btn btn-primary mp-wide" id="mpSave" type="button">就这个角色</button>' +
      '</div>';
  }

  function bindProfile() {
    var picked = 'starter';
    var chars = document.getElementById('mpChars');
    document.querySelectorAll('.mp-char').forEach(function (b) {
      drawAvatar(b.querySelector('canvas'), b.dataset.skin);
      b.addEventListener('click', function () {
        picked = b.dataset.skin;
        document.querySelectorAll('.mp-char').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      });
    });
    var saveB = document.getElementById('mpSave');
    if (saveB) saveB.addEventListener('click', function () {
      var name = (document.getElementById('mpName') || {}).value || '';
      if (!String(name).trim()) { toast('先起个昵称'); return; }
      saveProfile(name, picked);
      toast('角色已创建');
      if (pendingRoom) { var r = pendingRoom; pendingRoom = ''; join(r); }
      else renderPanel();
    });
    // 默认选中第一个
    setTimeout(function () {
      var first = chars && chars.querySelector('.mp-char');
      if (first) first.classList.add('on');
    }, 0);
  }

  function lobbyHtml(p) {
    var c = charOf(p.skin);
    var initial = normCode(readJSON(ROOM_KEY) || '');
    return '<div class="mp-block">' +
      '<div class="mp-me">' +
        '<canvas class="mp-avatar mp-me-avatar" data-skin="' + esc(p.skin) + '"></canvas>' +
        '<div class="mp-me-info"><b>' + esc(p.name) + '</b><span>' + c.name + ' · ' + c.desc + '</span></div>' +
        '<button class="btn btn-mini" id="mpEdit" type="button">换形象</button>' +
      '</div>' +
      '<label class="mp-field"><span>房间码</span>' +
        '<input id="mpCode" maxlength="16" placeholder="填好友发你的房间码" autocomplete="off" spellcheck="false" value="' + esc(fmtCode(initial)) + '"></label>' +
      '<div class="mp-actions">' +
        '<button class="btn btn-primary" id="mpJoin" type="button">进入房间</button>' +
        '<button class="btn" id="mpCreate" type="button">生成新房间</button>' +
      '</div>' +
      '<div class="mp-hint">房间最多 4 人；把房间码或邀请链接发给好友就行。联机不影响任何人的存档。</div>' +
      '</div>';
  }

  function bindLobby() {
    drawAvatar(document.querySelector('.mp-me-avatar'), (profile() || {}).skin);
    var edit = document.getElementById('mpEdit');
    if (edit) edit.addEventListener('click', function () {
      var p = profile();
      el.body.innerHTML = profileHtml();
      var nameI = document.getElementById('mpName');
      if (nameI) nameI.value = p ? p.name : '';
      bindProfile();
    });
    var joinB = document.getElementById('mpJoin');
    if (joinB) joinB.addEventListener('click', function () {
      var v = (document.getElementById('mpCode') || {}).value || '';
      if (!codeOk(v)) { toast('房间码不够 12 位'); return; }
      join(v);
    });
    var createB = document.getElementById('mpCreate');
    if (createB) createB.addEventListener('click', function () { join(genCode()); });
  }

  function roomHtml(p) {
    return '<div class="mp-block">' +
      '<div class="mp-roomcode">' +
        '<span>房间码</span><b id="mpRoomCode">' + esc(fmtCode(roomCode)) + '</b>' +
      '</div>' +
      '<div class="mp-actions">' +
        '<button class="btn btn-mini" id="mpCopy" type="button">复制房间码</button>' +
        '<button class="btn btn-mini" id="mpCopyLink" type="button">复制邀请链接</button>' +
      '</div>' +
      '<div class="mp-members" id="mpMembers"></div>' +
      '<div class="mp-hint" id="mpConn"></div>' +
      '<div class="mp-hint">好友在地图上会出现（带名字）；左下角聊天框可以说话，气泡会飘在头顶。</div>' +
      '<button class="btn danger mp-wide" id="mpLeave" type="button">离开房间</button>' +
      '</div>';
  }

  function bindRoom() {
    renderMembers();
    var copy = document.getElementById('mpCopy');
    if (copy) copy.addEventListener('click', function () {
      copyText(normCode(roomCode), '房间码已复制');
    });
    var link = document.getElementById('mpCopyLink');
    if (link) link.addEventListener('click', function () {
      var u = location.origin + location.pathname + '?room=' + normCode(roomCode);
      copyText(u, '邀请链接已复制');
    });
    var leaveB = document.getElementById('mpLeave');
    if (leaveB) leaveB.addEventListener('click', leave);
  }

  function copyText(t, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { toast(okMsg); }, function () { toast('复制失败，请手动选中'); });
    } else {
      toast(t);
    }
  }

  function renderMembers() {
    var box = document.getElementById('mpMembers');
    if (!box) return;
    var list = members.slice(0, MAX_PLAYERS);
    var p = profile() || {};
    while (list.length < MAX_PLAYERS) list.push(null);
    box.innerHTML = list.map(function (m, i) {
      if (!m) return '<div class="mp-member empty"><span class="mp-dot"></span>空位</div>';
      var me = m.uid === p.uid;
      return '<div class="mp-member' + (me ? ' me' : '') + '">' +
        '<span class="mp-dot on"></span>' +
        '<span class="mp-mname">' + esc(m.name || '好友') + (me ? '（你）' : '') + '</span>' +
        '<i>' + esc(charOf(m.skin).name) + '</i>' +
      '</div>';
    }).join('');
    var count = document.getElementById('mpChatCount');
    if (count) count.textContent = members.length + '/' + MAX_PLAYERS;
    var online = document.getElementById('mpOnline');
    if (online) online.textContent = members.length + '/' + MAX_PLAYERS;
  }

  /* ---------------- 进房 / 离房 ---------------- */
  function join(code) {
    var p = profile();
    if (!p) { pendingRoom = code; open(); return; }
    var cli = client();
    if (!cli) { toast('联机组件没加载成功，刷新再试'); return; }
    if (joined) leave();

    roomCode = normCode(code);
    writeJSON(ROOM_KEY, roomCode);
    joined = true;
    members = [];
    remoteMap = {};
    chatSeen = {};
    historyWarned = false;
    lastSent = null;
    lastStatus = '';
    lastErr = '';

    if (NS.World && NS.World.setSelfSkin) NS.World.setSelfSkin(p.skin);
    if (NS.World && NS.World.clearRemotes) NS.World.clearRemotes();

    channel = cli.channel('hnsf302:room:' + roomCode, {
      config: {
        presence: { key: p.uid },
        broadcast: { self: false, ack: false }
      }
    });

    channel.on('presence', { event: 'sync' }, function () {
      var st = channel.presenceState();
      var list = [];
      Object.keys(st).forEach(function (k) {
        (st[k] || []).forEach(function (m) { if (m && m.uid) list.push(m); });
      });
      members = list;
      // 有人离开：立刻把他从地图上撤掉（别等 15 秒超时）
      var alive = {};
      list.forEach(function (m) { alive[m.uid] = 1; });
      Object.keys(remoteMap).forEach(function (uid) {
        if (!alive[uid]) delete remoteMap[uid];
      });
      pushRemotes();
      renderMembers();
      if (list.length > MAX_PLAYERS) {
        leave();
        toast('房间满了（最多 ' + MAX_PLAYERS + ' 人）');
      }
    });

    channel.on('broadcast', { event: 'pos' }, function (msg) {
      var d = msg && msg.payload;
      if (!d || !d.uid || d.uid === p.uid) return;
      remoteMap[d.uid] = {
        uid: d.uid, name: d.name || '好友', skin: d.skin || 'starter',
        mount: d.mount || '', x: +d.x || 0, y: +d.y || 0,
        dir: d.dir || 'down', moving: !!d.moving,
        bubble: (remoteMap[d.uid] || {}).bubble || '',
        bubbleAt: (remoteMap[d.uid] || {}).bubbleAt || 0
      };
      pushRemotes();
    });

    channel.on('broadcast', { event: 'chat' }, function (msg) {
      var d = msg && msg.payload;
      if (!d || !d.text) return;
      addChat({ uid: d.uid, name: d.name || '好友', text: d.text, kind: d.kind || 'text', ts: +d.ts || Date.now() });
      if (d.uid) {
        var r = remoteMap[d.uid];
        if (r) { r.bubble = d.text; r.bubbleAt = Date.now(); pushRemotes(); }
      }
    });

    channel.subscribe(function (status, err) {
      lastStatus = status;
      if (err) lastErr = 'subscribe:' + (err.message || err);
      if (status === 'SUBSCRIBED') {
        var tp = channel.track({
          uid: p.uid, name: p.name, skin: p.skin,
          level: NS.Store ? NS.Store.levelInfo(NS.Store.raw().xp).level : 1
        });
        if (tp && tp.catch) tp.catch(function (e2) { lastErr = 'track:' + (e2.message || e2); });
        startPosLoop();
        pullHistory();
        showDock();
        toast('已进入房间 ' + fmtCode(roomCode));
        renderPanel();
        var err = document.getElementById('mpConn');
        if (err) err.textContent = '';
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        var e2 = document.getElementById('mpConn');
        if (e2) e2.textContent = '连接不稳定，正在重连…';
      }
    });

    renderPanel();
  }

  function leave() {
    if (posTimer) { clearInterval(posTimer); posTimer = 0; }
    if (channel && sb) {
      try { channel.unsubscribe(); } catch (e) {}
      try { sb.removeChannel(channel); } catch (e) {}
    }
    channel = null;
    joined = false;
    members = [];
    remoteMap = {};
    if (NS.World) {
      if (NS.World.clearRemotes) NS.World.clearRemotes();
      if (NS.World.setSelfSkin) NS.World.setSelfSkin('');
    }
    hideDock();
    if (el.mask && el.mask.classList.contains('show')) renderPanel();
  }

  /* ---------------- 位置广播 ---------------- */
  function startPosLoop() {
    if (posTimer) clearInterval(posTimer);
    posTimer = setInterval(tickPos, 200);        // 5Hz，省消息额度
  }

  function tickPos() {
    if (!joined || !channel || document.hidden) return;
    var p = profile();
    if (!p || !NS.World || !NS.World.playerState) return;
    var st = NS.World.playerState();
    var mount = (NS.Gear && NS.Gear.equippedMount) ? NS.Gear.equippedMount() : null;
    var d = {
      uid: p.uid, name: p.name, skin: p.skin,
      x: Math.round(st.x), y: Math.round(st.y),
      dir: st.dir, moving: !!st.moving,
      mount: mount ? mount.id : ''
    };
    var now = Date.now();
    var moved = !lastSent || Math.abs(d.x - lastSent.x) > 1 || Math.abs(d.y - lastSent.y) > 1 ||
      d.dir !== lastSent.dir || d.moving !== lastSent.moving || d.skin !== lastSent.skin ||
      d.mount !== lastSent.mount;
    if (!moved && now - lastSentAt < 2000) return;
    lastSent = d;
    lastSentAt = now;
    try { channel.send({ type: 'broadcast', event: 'pos', payload: d }); } catch (e) {}
  }

  function pushRemotes() {
    if (!NS.World || !NS.World.setRemotes) return;
    var list = [];
    Object.keys(remoteMap).forEach(function (k) { list.push(remoteMap[k]); });
    NS.World.setRemotes(list);
  }

  /* ---------------- 聊天 ---------------- */
  function say(text) {
    var p = profile();
    var t = String(text || '').trim().slice(0, 120);
    if (!p || !joined || !t) return;
    var msg = { uid: p.uid, name: p.name, text: t, kind: 'text', ts: Date.now() };
    try { channel.send({ type: 'broadcast', event: 'chat', payload: msg }); } catch (e) {}
    addChat(msg);
    rpc('mp_chat_push', {
      p_code: roomCode, p_uid: p.uid, p_name: p.name, p_kind: 'text', p_body: t
    }).catch(function () {
      if (!historyWarned) {
        historyWarned = true;
        addChat({ uid: '', name: '系统', text: '聊天历史暂时存不上（表还没建？），但实时聊天不受影响。', kind: 'sys', ts: Date.now() });
      }
    });
  }

  function addChat(m) {
    var key = (m.uid || '') + '|' + (m.text || '') + '|' + Math.floor((m.ts || Date.now()) / 5000);
    if (chatSeen[key]) return;
    chatSeen[key] = 1;
    var log = document.getElementById('mpChatLog');
    if (!log) return;
    var p = profile() || {};
    var row = document.createElement('div');
    row.className = 'mp-msg' + (m.uid && m.uid === p.uid ? ' me' : '') + (m.kind === 'sys' ? ' sys' : '');
    if (m.kind === 'sys') {
      row.textContent = m.text;
    } else {
      row.innerHTML = '<b>' + esc(m.name) + '</b><span>' + esc(m.text) + '</span>';
    }
    log.appendChild(row);
    while (log.children.length > 200) log.removeChild(log.firstChild);
    log.scrollTop = log.scrollHeight;
  }

  function pullHistory() {
    rpc('mp_chat_pull', { p_code: roomCode, p_limit: 50 }).then(function (rows) {
      (rows || []).forEach(function (r) {
        addChat({
          uid: r.uid, name: r.name, text: r.body,
          kind: r.kind || 'text',
          ts: Date.parse(r.created_at) || Date.now()
        });
      });
    }, function () {
      if (!historyWarned) {
        historyWarned = true;
        addChat({ uid: '', name: '系统', text: '聊天历史读不到（表还没建？），实时聊天不受影响。', kind: 'sys', ts: Date.now() });
      }
    });
  }

  /* ---------------- 聊天侧栏 ---------------- */
  function showDock() {
    if (!el.chat) return;
    el.chat.hidden = false;
    el.chat.classList.remove('folded');
    var c = document.getElementById('mpChatCode');
    if (c) c.textContent = fmtCode(roomCode);
    var count = document.getElementById('mpChatCount');
    if (count) count.textContent = members.length + '/' + MAX_PLAYERS;
  }
  function hideDock() {
    if (!el.chat) return;
    el.chat.hidden = true;
    var log = document.getElementById('mpChatLog');
    if (log) log.innerHTML = '';
    chatSeen = {};
  }

  function bindDock() {
    if (!el.chat) return;
    // 聊天框里的按键不要传给地图（否则打字会让人物乱跑）
    el.chat.addEventListener('keydown', function (e) { e.stopPropagation(); });
    var sendB = document.getElementById('mpChatSend');
    var input = document.getElementById('mpChatInput');
    if (sendB) sendB.addEventListener('click', function () {
      say(input ? input.value : '');
      if (input) input.value = '';
    });
    if (input) input.addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        say(input.value);
        input.value = '';
      }
    });
    var fold = document.getElementById('mpChatFold');
    if (fold) fold.addEventListener('click', function () {
      el.chat.classList.toggle('folded');
      fold.textContent = el.chat.classList.contains('folded') ? '▴' : '▾';
    });
    var quick = document.getElementById('mpQuick');
    if (quick) {
      quick.innerHTML = QUICK.map(function (q) {
        return '<button type="button" data-q="' + esc(q) + '">' + esc(q) + '</button>';
      }).join('');
      quick.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('[data-q]') : null;
        if (b) say(b.dataset.q);
      });
    }
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    el.mask = document.getElementById('mpMask');
    el.body = document.getElementById('mpBody');
    el.chat = document.getElementById('mpChat');
    if (!el.mask) return;

    var btn = document.getElementById('btnMp');
    if (btn) btn.addEventListener('click', open);
    var closeB = document.getElementById('mpClose');
    if (closeB) closeB.addEventListener('click', close);
    el.mask.addEventListener('click', function (e) {
      if (e.target === el.mask) close();
    });

    bindDock();

    // 邀请链接：?room=XXXX-XXXX-XXXX
    var m = /[?&]room=([^&]+)/.exec(location.search);
    if (m) {
      var c = normCode(decodeURIComponent(m[1]));
      if (codeOk(c)) {
        writeJSON(ROOM_KEY, c);
        if (profile()) open();
        else { pendingRoom = c; open(); }        // 先建角色，建完自动进这个房间
      }
    }
  }

  NS.MP = {
    init: init,
    open: open,
    close: close,
    join: join,
    leave: leave,
    inRoom: function () { return joined; },
    code: function () { return roomCode; },
    profile: profile,
    say: say,
    characters: CHARS,
    debug: function () {
      return { joined: joined, code: roomCode, members: members, remotes: Object.keys(remoteMap),
        status: lastStatus, err: lastErr,
        presence: channel && channel.presenceState ? Object.keys(channel.presenceState()) : [] };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window.HNSF829);
