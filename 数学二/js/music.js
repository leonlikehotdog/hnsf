/* ============================================================
 * 302 数学二 · 场景音乐（文件播放 + 交叉淡入淡出）
 * ------------------------------------------------------------
 * 现代游戏的分层：
 *   探索（每个场景一条长曲） / 做题舒缓轮播 / BOSS / 擂台 / 对话
 * 切换不是硬切：两路 <audio> 交叉淡化，地图 → 战斗 0.9s，
 * 战斗 → 地图 1.2s，对话 0.6s；对话结束自动回到当前场景曲。
 *
 * 曲目全部来自 music/ 里的洛克王国原声，优先选长曲：
 *   场景 1  集市烧烤摊        107.8s
 *   场景 2  天界·双鱼宫       116.6s
 *   场景 3  雪人谷BGM         114.1s
 *   场景 4  潮流街区·我的乐园  76.4s
 *   场景 5  英雄岛BGM          82.9s
 *   场景 6  天界·水平宫        61.7s
 *   做题    12 首舒缓曲轮播（双鱼宫 / 雪人谷 / 圣诞小屋 / 梦想广场 / 白落落村 /
 *           梦想屋 / 怀特冰山 / 彩虹仙境 / 星之法阵 / 星之泉 / 光羽圣殿 / 水平宫），
 *           每首放完自动换下一首，轮完一圈才重复
 *   BOSS    宠物战斗2BGM      359.5s
 *   擂台    宠物战斗3BGM
 *   对话    王国城堡·舞会厅     41.4s
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var TRACKS = {
    'scene:s1': { file: 'music/洛克王国 - 集市烧烤摊.mp3', name: '集市烧烤摊', vol: 0.82 },
    'scene:s2': { file: 'music/QG_草莓LOVELY炫 - 天界-双鱼宫.mp3', name: '天界 · 双鱼宫', vol: 0.80 },
    'scene:s3': { file: 'music/QG_草莓LOVELY炫 - 雪人谷BGM.mp3', name: '雪人谷', vol: 0.80 },
    'scene:s4': { file: 'music/QG_草莓LOVELY炫 - 潮流街区-我的乐园.mp3', name: '潮流街区 · 我的乐园', vol: 0.78 },
    'scene:s5': { file: 'music/QG_草莓LOVELY炫 - 英雄岛BGM.mp3', name: '英雄岛', vol: 0.80 },
    'scene:s6': { file: 'music/QG_草莓LOVELY炫 - 天界-水平宫.mp3', name: '天界 · 水平宫', vol: 0.80 },
    'scene:arena': { file: 'music/游戏原声 - 角斗场.mp3', name: '角斗场', vol: 0.82 },
    'battle': { file: 'music/QG_草莓LOVELY炫 - 宠物战斗1BGM.mp3', name: '宠物战斗 1', vol: 0.72 },
    'boss': { file: 'music/QG_草莓LOVELY炫 - 宠物战斗2BGM.mp3', name: '宠物战斗 2', vol: 0.70 },
    'arenaBattle': { file: 'music/QG_草莓LOVELY炫 - 宠物战斗3BGM.mp3', name: '宠物战斗 3', vol: 0.72 },
    'dialogue': { file: 'music/QG_草莓LOVELY炫 - 王国城堡-舞会厅.mp3', name: '王国城堡 · 舞会厅', vol: 0.62 },
    // 做题专用：普通做题不再单曲循环战斗曲，改为舒缓曲自然轮播；
    // 单独用 study: 前缀，避免覆盖场景曲的播放进度（lastSceneKey）。
    // 曲目统一挑 ≥55s 的，一首放完再换下一首，轮完一圈才重复。
    'study:1': { file: 'music/QG_草莓LOVELY炫 - 天界-双鱼宫.mp3', name: '天界 · 双鱼宫（做题）', vol: 0.50 },
    'study:2': { file: 'music/QG_草莓LOVELY炫 - 雪人谷BGM.mp3', name: '雪人谷（做题）', vol: 0.50 },
    'study:3': { file: 'music/QG_草莓LOVELY炫 - 雪人谷-圣诞小屋BGM.mp3', name: '雪人谷 · 圣诞小屋（做题）', vol: 0.50 },
    'study:4': { file: 'music/游戏原声 - 梦想广场.mp3', name: '梦想广场（做题）', vol: 0.50 },
    'study:5': { file: 'music/QG_草莓LOVELY炫 - 雪人谷-白落落村BGM.mp3', name: '雪人谷 · 白落落村（做题）', vol: 0.48 },
    'study:6': { file: 'music/游戏原声 - 梦想屋.mp3', name: '梦想屋（做题）', vol: 0.50 },
    'study:7': { file: 'music/QG_草莓LOVELY炫 - 雪人谷-怀特冰山BGM.mp3', name: '雪人谷 · 怀特冰山（做题）', vol: 0.48 },
    'study:8': { file: 'music/游戏原声 - 彩虹河流、彩虹仙境.mp3', name: '彩虹河流 · 彩虹仙境（做题）', vol: 0.50 },
    'study:9': { file: 'music/游戏原声 - 试炼者之林、朗伊尔之门、朗伊尔神庙群、星之法阵.mp3', name: '试炼者之林 · 星之法阵（做题）', vol: 0.48 },
    'study:10': { file: 'music/纯音乐 - 星之路、星之泉 (57秒片段).mp3', name: '星之路 · 星之泉（做题）', vol: 0.50 },
    'study:11': { file: 'music/游戏原声 - 光之藤、光之蔓、藤蔓之源、风铃岛、光羽圣殿.mp3', name: '光之藤 · 光羽圣殿（做题）', vol: 0.48 },
    'study:12': { file: 'music/QG_草莓LOVELY炫 - 天界-水平宫.mp3', name: '天界 · 水平宫（做题）', vol: 0.48 }
  };

  var STUDY_LIST = [
    'study:1', 'study:2', 'study:3', 'study:4', 'study:5', 'study:6',
    'study:7', 'study:8', 'study:9', 'study:10', 'study:11', 'study:12'
  ];
  var studyIdx = -1;

  var a = null, b = null, active = null;
  var currentKey = null, lastSceneKey = 'scene:s1';
  var enabled = true, battleEnabled = true, volume = 0.55;
  var fadeTimer = null, pendingKey = null, playToken = 0;
  var posMemo = {};                // 探索曲离开时的播放位置，回来能接着放

  function resolve(key) {
    if (!key) return lastSceneKey;
    if (key === 'map') return lastSceneKey;
    if (key.indexOf('scene:') === 0) { lastSceneKey = key; return key; }
    return key;
  }

  function ensureEls() {
    if (a) return;
    a = new Audio();
    b = new Audio();
    [a, b].forEach(function (el) {
      el.loop = true;
      el.preload = 'auto';
      el.volume = 0;
      // 舒缓曲不循环：放完一首自然切下一首，避免同一段旋律反复
      el.addEventListener('ended', onStudyEnded);
    });
  }

  /** 舒缓曲播完 → 自动轮换到下一首 */
  function onStudyEnded(e) {
    var el = e.currentTarget;
    if (el !== active) return;
    var k = el.dataset.key || '';
    if (k.indexOf('study:') !== 0) return;
    if (!enabled || !battleEnabled) return;
    studyIdx = (studyIdx + 1) % STUDY_LIST.length;
    playKey(STUDY_LIST[studyIdx]);
  }

  /** 普通做题：新开一局时换下一首；同一局里重复请求则保持当前这首 */
  function studyKeyForBattle() {
    var playingStudy = !!(active && !active.paused &&
      (active.dataset.key || '').indexOf('study:') === 0);
    if (!playingStudy) studyIdx = (studyIdx + 1) % STUDY_LIST.length;
    if (studyIdx < 0) studyIdx = 0;
    return STUDY_LIST[studyIdx];
  }

  function targetVol(key) {
    var t = TRACKS[key];
    return volume * (t ? t.vol : 0.7);
  }

  /** 立刻停掉并释放一个 audio 元素（可记住播放位置） */
  function killEl(el, remember) {
    if (!el) return;
    try {
      if (remember && el.dataset.key) posMemo[el.dataset.key] = el.currentTime || 0;
      el.pause();
      el.removeAttribute('src');
      el.load();
    } catch (e) {}
    el.volume = 0;
  }

  /** 第一段：旧曲淡出到 0，完全静音后才允许新曲起播 → 不存在两首同时响 */
  function fadeOut(el, ms, done) {
    if (!el) { if (done) done(); return; }
    clearInterval(fadeTimer);
    fadeTimer = null;
    var v0 = el.volume || 0;
    if (v0 <= 0.001) { killEl(el, true); if (done) done(); return; }
    var token = playToken;
    var t0 = performance.now();
    fadeTimer = setInterval(function () {
      if (token !== playToken) { clearInterval(fadeTimer); fadeTimer = null; return; }
      var k = Math.min(1, (performance.now() - t0) / ms);
      el.volume = Math.max(0, v0 * (1 - k));
      if (k >= 1) {
        clearInterval(fadeTimer);
        fadeTimer = null;
        killEl(el, true);
        if (done) done();
      }
    }, 25);
  }

  /** 第二段：新曲从 0 淡入 */
  function fadeIn(el, key, ms) {
    clearInterval(fadeTimer);
    fadeTimer = null;
    var v1 = targetVol(key);
    var token = playToken;
    var t0 = performance.now();
    el.volume = 0;
    fadeTimer = setInterval(function () {
      if (token !== playToken) { clearInterval(fadeTimer); fadeTimer = null; return; }
      var k = Math.min(1, (performance.now() - t0) / ms);
      el.volume = Math.max(0, v1 * k);
      if (k >= 1) { clearInterval(fadeTimer); fadeTimer = null; }
    }, 25);
  }

  function stop(ms) {
    playToken++;
    clearInterval(fadeTimer);
    fadeTimer = null;
    var old = active;
    active = null;
    [a, b].forEach(function (el) {
      if (!el) return;
      if (el === old) fadeOut(el, ms || 700);
      else if (!el.paused) killEl(el, true);
      else el.volume = 0;
    });
  }

  /**
   * 切到某个音乐层。key 可以是：
   *   scene:s1..s6 / scene:arena / battle / boss / arenaBattle / dialogue / map（回到当前场景）
   *
   * 切歌顺序：旧曲先淡出到 0 → 释放旧曲 → 新曲淡入。
   * 之前是交叉淡入淡出，两首长曲会在 1 秒内同时响，听感就是「两首歌叠在一起」；
   * 现在改成串行，任何时刻最多只有一首在出声。
   */
  function playKey(key) {
    ensureEls();
    key = resolve(key);
    var wantBattleLayer = (key === 'battle');
    // 普通做题不播热血战斗曲，改走 3 首舒缓曲轮播；BOSS / 擂台仍用战斗曲
    if (wantBattleLayer) key = studyKeyForBattle();
    var t = TRACKS[key];
    if (!t) return;
    currentKey = key;

    if (!enabled) { stop(500); return; }
    if ((wantBattleLayer || key === 'boss' || key === 'arenaBattle' ||
      key.indexOf('study:') === 0) && !battleEnabled) { stop(600); return; }

    // 同一首且在播：不重头开始
    if (active && active.dataset.key === key && !active.paused) return;

    playToken++;
    var token = playToken;

    // 找到当前真正在响的那一路（active 可能已被 stop 置空）
    var from = active;
    if (!from) {
      if (a && !a.paused) from = a;
      else if (b && !b.paused) from = b;
    }
    var target = (from === a) ? b : a;
    var spare = (target === a) ? b : a;

    // 清掉不该出声的残留：上一次淡出如果被打断，另一路会以旧音量一直播
    if (spare && spare !== from && !spare.paused) killEl(spare, true);
    if (target && target !== from) { target.pause(); target.volume = 0; }

    function startTarget() {
      if (token !== playToken) return;
      target.dataset.key = key;
      target.src = encodeURI(t.file);
      target.volume = 0;
      // 舒缓曲不循环：放完由 ended 事件接下一首
      target.loop = key.indexOf('study:') !== 0;
      try {
        // 探索曲回到原场景时接着上次的位置放；战斗/对话曲每次从头开始
        var memo = (key.indexOf('scene:') === 0) ? posMemo[key] : 0;
        target.currentTime = (memo && memo > 2) ? memo : 0;
      } catch (e) {}
      var p = target.play();
      if (p && p.catch) {
        p.catch(function () {
          // 自动播放被拦截：记下请求，等第一次用户手势重试
          pendingKey = key;
          document.addEventListener('pointerdown', unlockOnce, { once: true });
        });
      }
      active = target;
      // 旧曲已经静音，这里只是新曲淡入：场景 0.65s / 战斗 0.42s / 对话 0.38s
      var ms = key === 'dialogue' ? 380
        : (key === 'battle' || key === 'boss' || key === 'arenaBattle') ? 420 : 650;
      fadeIn(target, key, ms);
    }

    if (from && !from.paused) {
      fadeOut(from, 260, startTarget);
    } else {
      if (from) killEl(from, true);
      startTarget();
    }
  }

  function unlockOnce() {
    if (pendingKey) {
      var k = pendingKey;
      pendingKey = null;
      playKey(k);
    } else if (currentKey) {
      playKey(currentKey);
    }
  }

  function setEnabled(on) {
    enabled = !!on;
    if (enabled) {
      playKey(currentKey || lastSceneKey);
    } else {
      stop(500);
    }
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (active && !fadeTimer) active.volume = Math.max(0, volume * ((TRACKS[active.dataset.key] || {}).vol || 0.7));
  }

  function setBattleEnabled(on) {
    battleEnabled = !!on;
    if (!battleEnabled && active && (
      active.dataset.key === 'battle' || active.dataset.key === 'boss' ||
      active.dataset.key === 'arenaBattle' ||
      (active.dataset.key || '').indexOf('study:') === 0)) {
      stop(600);
    }
  }

  function resume() {
    if (!currentKey) return;
    if (!active || active.paused) playKey(currentKey);
  }

  /** 场景面板/标题用：当前场景曲名 */
  function sceneTrackName(sceneId) {
    var t = TRACKS['scene:' + sceneId];
    return t ? t.name : '';
  }

  /** 诊断 / 设置面板用：当前音乐层与播放状态 */
  function status() {
    function elInfo(el) {
      if (!el) return null;
      return {
        key: el.dataset.key || '',
        paused: el.paused,
        volume: +el.volume.toFixed(3),
        time: +el.currentTime.toFixed(2),
        src: (el.currentSrc || el.src || '').split('/').pop()
      };
    }
    var els = [elInfo(a), elInfo(b)].filter(Boolean);
    return {
      key: currentKey,
      sceneKey: lastSceneKey,
      enabled: enabled,
      battleEnabled: battleEnabled,
      playing: !!(active && !active.paused && active.volume > 0),
      src: active ? (active.currentSrc || active.src) : '',
      volume: active ? +active.volume.toFixed(3) : 0,
      time: active ? +active.currentTime.toFixed(2) : 0,
      audible: els.filter(function (x) { return !x.paused && x.volume > 0.01; }).length,
      els: els
    };
  }

  NS.Music = {
    playKey: playKey,
    setEnabled: setEnabled,
    setVolume: setVolume,
    setBattleEnabled: setBattleEnabled,
    resume: resume,
    sceneTrackName: sceneTrackName,
    status: status,
    tracks: TRACKS
  };
})(window.HNSF829);
