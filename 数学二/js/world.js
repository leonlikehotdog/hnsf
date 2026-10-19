/* ============================================================
 * 302 数学二 · 2D 像素大世界（星露谷式）
 * ------------------------------------------------------------
 * 世界按「场景」拆分：6 个场景 × 每场景 2 章 = 12 章。
 *   · 每个场景是一张独立地图（2 块营地 + 一条路），配色、地标、
 *     植被、天气和背景音乐都按场景定做；
 *   · 69 个考点 = 站在营地里的角色，走近按空格（或点他）就能挑战；
 *   · 通关后角色头顶浮出「兵器」——内容仍是 data-summary.js 里的心法。
 *
 * 音乐：场景曲 / 战斗曲 / BOSS 曲 / 对话曲四层，由 js/music.js 交叉淡化。
 * 渲染：每张地形只在切场景时画一次到离屏 canvas，每帧只 blit 视口。
 * 移动：WASD / 方向键直走（带碰撞）+ 点击地面 A* 寻路。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  /* ---------------- 常量 ---------------- */
  var TS = 32;                       // 碰撞格 / 地形格
  var COLS = 2, ROWS = 1;            // 一个场景里并排 2 块营地
  var CELL_W = 1800, CELL_H = 1500;
  var PAD = 40;
  var MAP_S = CELL_W / 1000;         // 地图放大后，装饰/水景半径按同一比例放大
  var WALK_SPEED = 210;
  var PATH_SPEED = 235;
  var NEAR_R = 72;                   // 交互半径
  var PLAYER_SPEC = {
    key: 'player', name: '你', skin: '#f6c89a', hair: '#141821', hairStyle: 'goku',
    top: '#0ea5e9', pants: '#0f172a', belt: '#fbbf24', collar: '#fbbf24',
    armor: null, boots: '#0f172a', cape: null, eye: '#1f2937', extras: [], foe: false
  };

  /* ---------------- 运行态 ---------------- */
  var NODES = [], BY_ID = {}, CHAPS = [], CHAP_BY_ID = {};
  var store = null, hooks = {};
  var wrap = null, canvas = null, ctx = null, promptEl = null, areaEl = null, loadingEl = null;
  var mini = null, mctx = null, miniWrap = null;
  var terrain = null, tctx = null;
  var WORLD_W = 0, WORLD_H = 0, GW = 0, GH = 0;
  var sceneIdx = 0, sceneByChap = {};
  var sceneMask = null, sceneGrid = null, sceneFade = null;
  var mapTipEl = null, mapCurrentEl = null;
  var miniScale = 1, miniOx = 0, miniOy = 0;
  var blocked = null;                // Uint8Array，1 = 不可走
  var areas = [], npcs = [], npcByNode = {}, pathSamples = [];
  var ZT = window.HNSF829_ZT || { nodes: [] };
  var ztByParent = {};
  var questListEl = null, trackedId = null, pendingZt = null;
  var lastQuestHtml = '', questTimer = 0;
  /* 挑衅：只让「已解锁、未通关」的人主动来找你，带全局与单人冷却 */
  var prov = { active: null, cool: {}, nextAt: 15000, idle: 0 };
  var lastInput = 0, lastUiAt = 0, uiWasBlocked = false;
  var gourdPos = { x: 0, y: 0, init: false };
  var weather = { mode: 'petal', until: 0, drops: [], wind: 0 };
  var arenaFlags = [], arenaFlashes = [];
  var chipTimer = 0;
  var trail = [];
  var trailClock = 0;
  // 只有带“拖尾感”的气场才留残影；普通皮肤（ki）拖影反而脏
  var TRAIL_KINDS = ['trail', 'legend', 'lightning', 'time', 'heart', 'flame', 'silver', 'void'];
  function hasTrailFx(f) {
    return !!(f && TRAIL_KINDS.indexOf(f.kind) >= 0);
  }
  var player = { x: 0, y: 0, dir: 'down', walk: 0, moving: false, path: [], speed: WALK_SPEED };
  var cam = { x: 0, y: 0, z: 1 };
  var ZOOM_MIN = 0.6, ZOOM_MAX = 2.2;
  var drag = null, camFree = 0;
  var view = { w: 900, h: 620 };
  var keys = {};
  var hoverId = null, nearId = null, pendingId = null;
  var spriteCache = {};
  var started = false, rafId = 0, lastT = 0, miniT = 0;
  var lastArea = -1, lastPrompt = '';

  /* ---------------- 小工具 ---------------- */
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function $(id) { return document.getElementById(id); }
  function mk(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function pick(arr, r) { return arr[Math.floor(r * arr.length) % arr.length]; }
  function trunc(s, n) { return s.length > n ? s.slice(0, n) + '…' : s; }
  function uiBlocked() {
    var ids = ['battleMask', 'nodeDetail', 'panel', 'storyMask', 'masterMask', 'hlMask', 'bagMask', 'lootMask', 'gearMask', 'gearCg', 'sceneMask', 'arenaMask'];
    for (var i = 0; i < ids.length; i++) {
      var el = $(ids[i]);
      if (el && el.classList.contains('show')) return true;
    }
    return false;
  }
  function toast(msg) {
    if (hooks.onToast) hooks.onToast(msg);
    else if (NS.Engine && NS.Engine.toast) NS.Engine.toast(msg);
  }

  /* ---------------- 摄像机缩放 / 平移 ---------------- */
  function vw() { return view.w / cam.z; }
  function vh() { return view.h / cam.z; }
  function clampCam() {
    cam.x = clamp(cam.x, 0, Math.max(0, WORLD_W - vw()));
    cam.y = clamp(cam.y, 0, Math.max(0, WORLD_H - vh()));
  }
  function updateZoomLabel() {
    var el = $('worldZoomVal');
    if (el) el.textContent = Math.round(cam.z * 100) + '%';
  }
  /** 以画布内坐标 (px,py) 为锚点缩放，锚点下的地图内容保持不动 */
  function zoomAt(factor, px, py) {
    var wx = cam.x + px / cam.z;
    var wy = cam.y + py / cam.z;
    cam.z = clamp(cam.z * factor, ZOOM_MIN, ZOOM_MAX);
    cam.x = wx - px / cam.z;
    cam.y = wy - py / cam.z;
    clampCam();
    updateZoomLabel();
  }

  /* ============================================================
   * 1. 世界数据：场景 → 章节 → 营地
   * ------------------------------------------------------------
   * 6 个场景各配一首长曲（music.js 里的 scene:s1..s6）。
   * 场景的配色 / 植被 / 地标 / 天气都围着这首曲子的气质来定。
   * ============================================================ */
  var SCENES = [
    {
      id: 's1', name: '晨风集市', theme: 'market', track: 'scene:s1',
      trackName: '集市烧烤摊',
      chapters: ['gs-c1', 'gs-c2'],
      blurb: '烤摊的香气被晨风送过草原，是整段旅途最温柔的开场。',
      weather: 'petal', weatherLabel: '🍃 微风',
      grade: 'rgba(255,196,120,0.05)', vignette: 'rgba(30,20,8,0.32)',
      preview: ['#8ed36a', '#d8a85c']
    },
    {
      id: 's2', name: '天界双鱼宫', theme: 'celestial', track: 'scene:s2',
      trackName: '天界 · 双鱼宫',
      chapters: ['gs-c3', 'gs-c4'],
      blurb: '云海托起宫阙，星河从灵河渡口一直铺到云顶天阶。',
      weather: 'mote', weatherLabel: '✨ 流云',
      grade: 'rgba(150,220,255,0.05)', vignette: 'rgba(12,32,56,0.30)',
      preview: ['#cfe8f7', '#7fc4e8']
    },
    {
      id: 's3', name: '雪人谷', theme: 'snow', track: 'scene:s3',
      trackName: '雪人谷',
      chapters: ['gs-c5', 'gs-c6'],
      blurb: '雪落无声，冰层下埋着旧日的遗迹与未解的方程。',
      weather: 'snow', weatherLabel: '❄️ 落雪',
      grade: 'rgba(190,230,255,0.06)', vignette: 'rgba(14,32,48,0.30)',
      preview: ['#eaf6fb', '#a9cfe0']
    },
    {
      id: 's4', name: '潮流街区', theme: 'city', track: 'scene:s4',
      trackName: '潮流街区 · 我的乐园',
      chapters: ['xd-c1', 'xd-c2'],
      blurb: '霓虹与齿轮一起转动，街区尽头是永不熄灯的工坊。',
      weather: 'spark', weatherLabel: '🌃 夜灯',
      grade: 'rgba(120,180,255,0.04)', vignette: 'rgba(6,10,22,0.44)',
      preview: ['#4b5563', '#f472b6']
    },
    {
      id: 's5', name: '英雄岛', theme: 'island', track: 'scene:s5',
      trackName: '英雄岛',
      chapters: ['xd-c3', 'xd-c4'],
      blurb: '海风穿过竹林，迷宫深处传来挑战者的鼓点。',
      weather: 'firefly', weatherLabel: '🌊 海风',
      grade: 'rgba(255,220,140,0.05)', vignette: 'rgba(18,28,16,0.30)',
      preview: ['#e6cf94', '#2fa8c8']
    },
    {
      id: 's6', name: '天界水平宫', theme: 'palace', track: 'scene:s6',
      trackName: '天界 · 水平宫',
      chapters: ['xd-c5', 'xd-c6'],
      blurb: '水面倒映群星，水晶洞窟里藏着最后的答案。',
      weather: 'star', weatherLabel: '🌌 星辉',
      grade: 'rgba(120,150,255,0.06)', vignette: 'rgba(4,8,20,0.48)',
      preview: ['#22314f', '#7dd3fc']
    },
    {
      id: 'arena', name: '天下第一武道会', theme: 'arena', track: 'scene:arena',
      trackName: '角斗场', chapters: [], arena: true,
      blurb: '只打最难的真题。五轮淘汰，答错即出局，冠军留在擂台上。',
      weather: 'none', weatherLabel: '🔥 人声鼎沸',
      grade: 'rgba(255,170,80,0.04)', vignette: 'rgba(16,8,4,0.46)',
      preview: ['#b07a3a', '#5a2320']
    }
  ];

  /* 每个章节一块营地。配色全部按所属场景统一，
     所以同一场景里的两块营地看起来是一个世界，而不是拼贴。 */
  var BIOMES = {
    'gs-c1': {
      name: '集市广场', tree: 'oak',
      ground: '#6fbe55', g1: '#7ecb62', g2: '#69b64f', dark: '#3f7d34',
      road: ['#a98a5c', '#cba771', '#e2c08d'],
      plaza: ['#9d8054', '#d3b788', '#8a7048'],
      water: ['#2f6f86', '#63b4c9', '#d8f3f8'], accent: '#ffd166'
    },
    'gs-c2': {
      name: '枫林道场', tree: 'oak',
      ground: '#78b552', g1: '#8bc05f', g2: '#73ab4c', dark: '#4a702f',
      road: ['#9c8258', '#c2a570', '#d8bd8b'],
      plaza: ['#927d58', '#c9b187', '#7d6947'],
      water: ['#2f6f86', '#63b4c9', '#d8f3f8'], accent: '#f97316'
    },
    'gs-c3': {
      name: '灵河渡口', tree: 'blossom',
      ground: '#bfe3f0', g1: '#d3edf7', g2: '#b5dbea', dark: '#7fb0c6',
      road: ['#b6d2dd', '#dceef5', '#f4fbfd'],
      plaza: ['#93bcca', '#e2f2f7', '#7fa6b6'],
      water: ['#2f7fa8', '#6cc0dd', '#f0fdff'], accent: '#7dd3fc'
    },
    'gs-c4': {
      name: '云顶天阶', tree: 'blossom',
      ground: '#cfe2f2', g1: '#e2eefb', g2: '#c0d6ea', dark: '#8aa6c4',
      road: ['#c3d6e8', '#e8f1fb', '#ffffff'],
      plaza: ['#a3b8d0', '#e8f1fb', '#8ea6c0'],
      water: ['#4a7fb0', '#89c4e8', '#ffffff'], accent: '#c4b5fd'
    },
    'gs-c5': {
      name: '雪人谷', tree: 'pine',
      ground: '#e8f2f6', g1: '#f4fafc', g2: '#dbe9ef', dark: '#a9c3cf',
      road: ['#c7dde6', '#e2eef4', '#ffffff'],
      plaza: ['#b5cdd8', '#eaf5f9', '#9fb9c6'],
      water: ['#5f9fbd', '#a9d8ea', '#ffffff'], accent: '#7dd3fc'
    },
    'gs-c6': {
      name: '冰封遗迹', tree: 'pine',
      ground: '#dceaf2', g1: '#eaf5fa', g2: '#cfe1ea', dark: '#93b0c2',
      road: ['#b8d3e0', '#dcebf3', '#f6fdff'],
      plaza: ['#a6c2d2', '#ddeef6', '#90aebe'],
      water: ['#4f8fb5', '#8fd0e8', '#ffffff'], accent: '#a5f3fc'
    },
    'xd-c1': {
      name: '潮流街区', tree: 'street',
      ground: '#4b5563', g1: '#59677a', g2: '#4f5c6e', dark: '#39424f',
      road: ['#3f4a58', '#55616f', '#8b98a8'],
      plaza: ['#3b4654', '#5d6b7d', '#7c8ea3'],
      water: ['#2c3e50', '#4f7f9e', '#9fd8f0'], accent: '#f472b6'
    },
    'xd-c2': {
      name: '齿轮工坊', tree: 'street',
      ground: '#4a4f58', g1: '#5a5c63', g2: '#4f5158', dark: '#363a42',
      road: ['#3a3f47', '#525862', '#8d8f96'],
      plaza: ['#41464f', '#666b74', '#8a8f98'],
      water: ['#2c3e50', '#4f7f9e', '#9fd8f0'], accent: '#fbbf24'
    },
    'xd-c3': {
      name: '英雄岛', tree: 'palm',
      ground: '#e6cf94', g1: '#79c063', g2: '#69ad55', dark: '#a88c52',
      road: ['#cdb37f', '#e3cd9c', '#f4e4bd'],
      plaza: ['#b7a173', '#e6d3a6', '#9c855d'],
      water: ['#1f6f8e', '#4fb3cf', '#e9fbff'], accent: '#34d399'
    },
    'xd-c4': {
      name: '迷雾回廊', tree: 'bamboo',
      ground: '#cfc08a', g1: '#6fae5b', g2: '#609c4f', dark: '#3f6b3a',
      road: ['#b5a274', '#d3c194', '#e8d9ad'],
      plaza: ['#9d8f66', '#cdbd93', '#877a56'],
      water: ['#1f6f8e', '#4fb3cf', '#e9fbff'], accent: '#fbbf24'
    },
    'xd-c5': {
      name: '星象台', tree: 'crystal',
      ground: '#22314f', g1: '#2c3f62', g2: '#263757', dark: '#18233b',
      road: ['#314a6e', '#4b6d94', '#9fd8f0'],
      plaza: ['#2a3a58', '#3f577a', '#6fa8c8'],
      water: ['#123a5c', '#2f7fa8', '#bfefff'], accent: '#7dd3fc'
    },
    'xd-c6': {
      name: '水晶洞窟', tree: 'crystal',
      ground: '#241f3f', g1: '#302a52', g2: '#2a2448', dark: '#191430',
      road: ['#3a3360', '#574d86', '#b9a8ff'],
      plaza: ['#312a55', '#4a4079', '#8f7dd6'],
      water: ['#1b3a66', '#3f6fa8', '#cfeeff'], accent: '#c4b5fd'
    }
  };
  var LANDMARK = {
    'gs-c1': 'village', 'gs-c2': 'pagoda', 'gs-c3': 'torii', 'gs-c4': 'tower',
    'gs-c5': 'hut', 'gs-c6': 'ruins',
    'xd-c1': 'village', 'xd-c2': 'workshop', 'xd-c3': 'bamboo', 'xd-c4': 'maze',
    'xd-c5': 'observatory', 'xd-c6': 'crystal'
  };

  /* ============================================================
   * 2. 角色外观：按龙珠人物逐个捏
   * ------------------------------------------------------------
   * 每人一套「皮肤 / 发型 / 道服 / 护甲 / 披风 / 尾巴 / 探测器」，
   * 目的是不用看图，光看轮廓和配色就能认出是谁：
   *   悟空 = 橙道服 + 蓝内衬 + 爆炸黑发；贝吉塔 = 蓝战斗服 + 白胸甲；
   *   比克 = 绿皮肤 + 紫道服 + 白披风 + 头巾；弗利萨 = 白身紫顶；
   *   沙鲁 = 绿身 + 头冠 + 翅膀；布欧 = 粉身 + 触角 + 紫披风。
   * 没写到的配角按 id 哈希稳定生成，保证每次打开长得一样。
   * ============================================================ */
  var LOOK = {
    /* —— 赛亚人 / 主角团 —— */
    'kid-goku': { skin: '#f6c89a', hair: '#141821', hairStyle: 'goku', top: '#f97316', pants: '#f97316', belt: '#1e40af', collar: '#1e40af', extras: ['tail'] },
    'goku': { skin: '#f6c89a', hair: '#141821', hairStyle: 'goku', top: '#f97316', pants: '#f97316', belt: '#1e40af', collar: '#1e40af' },
    'gohan-namek': { skin: '#f6c89a', hair: '#141821', hairStyle: 'goku', top: '#f97316', pants: '#f97316', belt: '#1e40af', collar: '#1e40af' },
    'goten': { skin: '#f6c89a', hair: '#141821', hairStyle: 'goku', top: '#f97316', pants: '#f97316', belt: '#1e40af', collar: '#1e40af' },
    'bardock': { skin: '#f6c89a', hair: '#141821', hairStyle: 'goku', top: '#374151', pants: '#374151', belt: '#7c3aed', armor: '#9ca3af', extras: ['scouter', 'tail'] },
    'raditz': { skin: '#f6c89a', hair: '#141821', hairStyle: 'long', top: '#374151', pants: '#374151', belt: '#a16207', armor: '#a16207', extras: ['scouter', 'tail'] },
    'nappa': { skin: '#f3d0a4', hair: '#141821', hairStyle: 'bald', top: '#374151', pants: '#374151', belt: '#a16207', armor: '#a16207', extras: ['scouter'] },
    'vegeta': { skin: '#f6c89a', hair: '#141821', hairStyle: 'vegeta', top: '#1e3a8a', pants: '#1e3a8a', belt: '#f8fafc', armor: '#e5e7eb', boots: '#f8fafc' },
    'majin-vegeta': { skin: '#f3d0a4', hair: '#141821', hairStyle: 'vegeta', top: '#1e3a8a', pants: '#1e3a8a', belt: '#f8fafc', armor: '#e5e7eb', boots: '#f8fafc', eye: '#ef4444' },
    'trunks': { skin: '#f6c89a', hair: '#a78bfa', hairStyle: 'bob', top: '#111827', pants: '#111827', belt: '#a78bfa', boots: '#111827', extras: ['sword'] },
    'future-trunks': { skin: '#f6c89a', hair: '#a78bfa', hairStyle: 'bob', top: '#111827', pants: '#111827', belt: '#a78bfa', boots: '#111827', extras: ['sword'] },
    'future-trunks-super-saiyan': { skin: '#f6c89a', hair: '#fbbf24', hairStyle: 'bob', top: '#111827', pants: '#111827', belt: '#a78bfa', boots: '#111827', extras: ['sword'] },
    '2': { skin: '#f6c89a', hair: '#fbbf24', hairStyle: 'goku', top: '#f97316', pants: '#f97316', belt: '#1e40af', collar: '#1e40af' },
    'broly': { skin: '#f3d0a4', hair: '#fbbf24', hairStyle: 'goku', top: '#166534', pants: '#166534', belt: '#fbbf24', boots: '#111827' },
    'krillin': { skin: '#f6c89a', hair: '#141821', hairStyle: 'bald', top: '#f97316', pants: '#f97316', belt: '#1e40af', collar: '#1e40af', extras: ['dots'] },
    'tien-shinhan': { skin: '#f6c89a', hair: '#141821', hairStyle: 'bald', top: '#166534', pants: '#166534', belt: '#dc2626', collar: '#dc2626', extras: ['thirdEye'] },
    'chiaotzu': { skin: '#f8e3c5', hair: '#141821', hairStyle: 'bald', top: '#dc2626', pants: '#dc2626', belt: '#f8fafc' },
    'yamcha': { skin: '#f6c89a', hair: '#141821', hairStyle: 'long', top: '#f97316', pants: '#f97316', belt: '#1e40af', collar: '#1e40af' },
    'yajirobe': { skin: '#f6c89a', hair: '#141821', hairStyle: 'short', top: '#166534', pants: '#166534', belt: '#a16207' },
    'piccolo': { skin: '#65a30d', hair: '#f8fafc', hairStyle: 'turban', top: '#6d28d9', pants: '#6d28d9', belt: '#f8fafc', collar: '#a78bfa', cape: '#f8fafc' },
    'nail': { skin: '#65a30d', hair: '#141821', hairStyle: 'bald', top: '#6d28d9', pants: '#6d28d9', belt: '#f8fafc' },

    /* —— 弗利萨军团 —— */
    'frieza': { skin: '#f8fafc', hair: '#a855f7', hairStyle: 'frieza', top: '#f8fafc', pants: '#f8fafc', belt: '#a855f7', eye: '#ef4444', extras: ['tail'] },
    'cooler-final-form': { skin: '#c084fc', hair: '#7c3aed', hairStyle: 'frieza', top: '#c084fc', pants: '#c084fc', belt: '#4c1d95', eye: '#ef4444' },
    'zarbon': { skin: '#f6c89a', hair: '#22c55e', hairStyle: 'long', top: '#f8fafc', pants: '#f8fafc', belt: '#166534', armor: '#166534' },
    'ginyu': { skin: '#c084fc', hair: '#7c3aed', hairStyle: 'horns', top: '#f8fafc', pants: '#f8fafc', belt: '#fbbf24', armor: '#7c3aed', extras: ['scouter'] },
    'burter': { skin: '#38bdf8', hair: '#1e40af', hairStyle: 'helmet', top: '#1e40af', pants: '#1e40af', belt: '#38bdf8', armor: '#f8fafc' },
    'general-blue': { skin: '#f6c89a', hair: '#141821', hairStyle: 'helmet', top: '#1e40af', pants: '#1e40af', belt: '#f8fafc' },

    /* —— 人造人 / 沙鲁 —— */
    '16': { skin: '#f6c89a', hair: '#f97316', hairStyle: 'short', top: '#166534', pants: '#166534', belt: '#f97316', armor: '#22c55e' },
    '17': { skin: '#f6c89a', hair: '#141821', hairStyle: 'bob', top: '#111827', pants: '#111827', belt: '#38bdf8', boots: '#111827' },
    '18': { skin: '#f6c89a', hair: '#fbbf24', hairStyle: 'bob', top: '#111827', pants: '#111827', belt: '#fbbf24', boots: '#111827' },
    '20': { skin: '#f3d0a4', hair: '#f8fafc', hairStyle: 'bald', top: '#111827', pants: '#111827', belt: '#f8fafc', extras: ['hat'] },
    '8': { skin: '#d1d5db', hair: '#65a30d', hairStyle: 'short', top: '#1e40af', pants: '#1e40af', belt: '#e5e7eb' },
    'cell': { skin: '#4ade80', hair: '#14532d', hairStyle: 'cell', top: '#166534', pants: '#166534', belt: '#111827', eye: '#f8fafc', extras: ['wings', 'spots'] },
    'perfect-cell': { skin: '#4ade80', hair: '#14532d', hairStyle: 'cell', top: '#166534', pants: '#166534', belt: '#111827', eye: '#f8fafc', extras: ['wings', 'spots'] },
    'cell-junior': { skin: '#4ade80', hair: '#14532d', hairStyle: 'cell', top: '#166534', pants: '#166534', belt: '#111827', eye: '#f8fafc' },

    /* —— 布欧篇 —— */
    'majin-buu': { skin: '#f9a8d4', hair: '#f472b6', hairStyle: 'buu', top: '#f9a8d4', pants: '#f9a8d4', belt: '#be185d', cape: '#7c3aed', eye: '#ef4444' },
    'kid-buu': { skin: '#f9a8d4', hair: '#f472b6', hairStyle: 'buu', top: '#f9a8d4', pants: '#f9a8d4', belt: '#be185d', eye: '#ef4444' },
    'evil-buu': { skin: '#94a3b8', hair: '#64748b', hairStyle: 'buu', top: '#94a3b8', pants: '#94a3b8', belt: '#334155', eye: '#ef4444' },
    'dabura': { skin: '#dc2626', hair: '#141821', hairStyle: 'horns', top: '#111827', pants: '#111827', belt: '#dc2626', cape: '#f8fafc', eye: '#fbbf24' },
    'babidi': { skin: '#fde68a', hair: '#fde68a', hairStyle: 'bald', top: '#7c3aed', pants: '#7c3aed', belt: '#fde68a' },
    'spopovitch': { skin: '#f6c89a', hair: '#fbbf24', hairStyle: 'goku', top: '#dc2626', pants: '#dc2626', belt: '#111827' },

    /* —— 其他 —— */
    'beerus': { skin: '#c084fc', hair: '#c084fc', hairStyle: 'ears', top: '#111827', pants: '#111827', belt: '#c084fc', eye: '#fbbf24' },
    'king-kai': { skin: '#38bdf8', hair: '#141821', hairStyle: 'antenna', top: '#111827', pants: '#111827', belt: '#38bdf8' },
    'korin': { skin: '#f8fafc', hair: '#f8fafc', hairStyle: 'ears', top: '#f8fafc', pants: '#f8fafc', belt: '#38bdf8' },
    'popo': { skin: '#1f2937', hair: '#141821', hairStyle: 'bald', top: '#f8fafc', pants: '#f8fafc', belt: '#fbbf24' },
    'bulma': { skin: '#f6c89a', hair: '#22d3ee', hairStyle: 'bob', top: '#f8fafc', pants: '#374151', belt: '#22d3ee' },
    'videl': { skin: '#f6c89a', hair: '#141821', hairStyle: 'ponytail', top: '#f8fafc', pants: '#111827', belt: '#38bdf8' },
    'fortuneteller-baba': { skin: '#f4c795', hair: '#f8fafc', hairStyle: 'bob', top: '#7c3aed', pants: '#7c3aed', belt: '#fbbf24' },
    'oolong': { skin: '#f9a8d4', hair: '#f9a8d4', hairStyle: 'ears', top: '#f9a8d4', pants: '#f9a8d4', belt: '#be185d' },
    'puar': { skin: '#60a5fa', hair: '#60a5fa', hairStyle: 'ears', top: '#60a5fa', pants: '#60a5fa', belt: '#1e40af' },
    'sea-turtle': { skin: '#65a30d', hair: '#65a30d', hairStyle: 'bald', top: '#a3e635', pants: '#65a30d', belt: '#4d7c0f' },
    'farmer': { skin: '#f6c89a', hair: '#78350f', hairStyle: 'short', top: '#a16207', pants: '#374151', belt: '#f8fafc', extras: ['hat'] },
    'jackie-chun': { skin: '#f6c89a', hair: '#f8fafc', hairStyle: 'bald', top: '#f8fafc', pants: '#f8fafc', belt: '#dc2626' },
    'mighty-mask': { skin: '#f6c89a', hair: '#dc2626', hairStyle: 'helmet', top: '#dc2626', pants: '#dc2626', belt: '#fbbf24' },
    'pilaf': { skin: '#f8e3c5', hair: '#38bdf8', hairStyle: 'short', top: '#dc2626', pants: '#dc2626', belt: '#fbbf24' }
  };
  var SKINS = ['#f6c89a', '#f3d0a4', '#e8b78a', '#c08457'];
  var HAIRS = ['#141821', '#4b2e14', '#a78bfa', '#f8fafc', '#fbbf24'];
  var TOPS = ['#2563eb', '#dc2626', '#16a34a', '#7c3aed', '#f97316', '#0f766e'];
  var BELTS = ['#f8fafc', '#fbbf24', '#141821', '#38bdf8'];
  var STYLES = ['goku', 'bob', 'short', 'long', 'bald', 'ponytail', 'ears'];

  /* 身高：整数逻辑像素，直接改变腿长/画布高度 —— 绝不用小数缩放，
     否则 2px 的眼睛和描边会被采样成 1px/3px，脸就“破损”了。 */
  var HEIGHT = {
    'oolong': -3, 'puar': -3, 'sea-turtle': -3,
    'chiaotzu': -2, 'goten': -2, 'kid-goku': -2, 'krillin': -2,
    'trunks': -1, 'future-trunks': -1, 'future-trunks-super-saiyan': -1, 'beerus': -1,
    'nail': 1, 'king-kai': 1, 'dabura': 1, 'popo': 1, 'frieza': 1,
    'piccolo': 2, 'raditz': 2, 'nappa': 2, 'cell': 2, 'perfect-cell': 2,
    '16': 2, '8': 2, 'ginyu': 2, 'cooler-final-form': 2,
    'broly': 3
  };
  var FEMALE = { 'bulma': 1, 'videl': 1, '18': 1, 'fortuneteller-baba': 1 };
  var SKIRT = { 'bulma': '#dc2626', 'videl': '#111827', '18': '#111827' };

  function specForChar(cid, name, foe) {
    var o = LOOK[cid] || {};
    var h = hashStr(cid);
    var top = o.top || pick(TOPS, ((h >> 14) & 255) / 255);
    return {
      key: cid,
      name: name || '',
      foe: !!foe,
      skin: o.skin || pick(SKINS, (h & 255) / 255),
      hair: o.hair || pick(HAIRS, ((h >> 4) & 255) / 255),
      hairStyle: o.hairStyle || pick(STYLES, ((h >> 9) & 255) / 255),
      top: top,
      pants: o.pants || top,
      belt: o.belt || pick(BELTS, ((h >> 19) & 255) / 255),
      collar: o.collar || o.belt || top,
      armor: o.armor || null,
      boots: o.boots || pick(['#26303f', '#1e40af', '#7c3aed', '#111827'], ((h >> 23) & 255) / 255),
      cape: o.cape || null,
      eye: o.eye || (foe ? '#ef4444' : '#1f2937'),
      extras: o.extras || [],
      h: HEIGHT[cid] || 0,
      female: !!FEMALE[cid],
      skirt: SKIRT[cid] || null
    };
  }

  function specFor(node) {
    var m = NS.Monsters && NS.Monsters.forNode ? NS.Monsters.forNode(node.id) : null;
    return specForChar((m && m.id) || node.id, (m && m.name) || '', !!(m && m.side === 'foe'));
  }

  /** 当前玩家外观（皮肤系统会换掉整套配色） */
  function playerSpecNow() {
    return (NS.Gear && NS.Gear.playerSpec) ? NS.Gear.playerSpec() : PLAYER_SPEC;
  }
  /** 坐骑速度倍率 */
  function speedMul() {
    return (NS.Gear && NS.Gear.speed) ? NS.Gear.speed() : 1;
  }

  /* ============================================================
   * 3. 世界构建
   * ============================================================ */
  var ARENA_PAL = {
    name: '天下第一武道会', tree: 'none',
    ground: '#6b5538', g1: '#7a6444', g2: '#5f4b31', dark: '#3a2a1a',
    road: ['#5a452b', '#7b6039', '#9b7c4b'],
    plaza: ['#7a5f3c', '#a88a5c', '#5d472a'],
    water: ['#24506b', '#4d8fb5', '#dff6ff'], accent: '#f5c76a'
  };

  function currentScene() { return SCENES[sceneIdx] || SCENES[0]; }

  function build() {
    WORLD_W = PAD * 2 + COLS * CELL_W;
    WORLD_H = PAD * 2 + ROWS * CELL_H;
    GW = Math.ceil(WORLD_W / TS);
    GH = Math.ceil(WORLD_H / TS);
    blocked = new Uint8Array(GW * GH);
    pathSamples = [];

    buildAreas();
    markBorder();
    placeNpcs();
    drawTerrain();
    spawnPlayer();
    drawMini();
  }

  /** 出生点与出生通道：保证每张图从下方入口进来时不会被树/摊位堵死 */
  function spawnX() { return WORLD_W / 2; }
  function spawnY() { return WORLD_H - 132; }
  function inSpawnLane(x, y) {
    return Math.abs(x - WORLD_W / 2) < 130 && y > spawnLaneTop();
  }

  /** 出生通道的北端：一直铺到第一块营地的广场，避免大地图里被森林堵住 */
  function spawnLaneTop() {
    return (areas[0] ? areas[0].cy + 70 : WORLD_H - 330);
  }

  function buildAreas() {
    areas = [];
    var sc = currentScene();
    if (sc.arena) {
      var ach = { id: 'arena', no: '⚔', name: '天下第一武道会', module: 'arena' };
      areas.push({
        i: 0, chap: ach, cx: WORLD_W / 2, cy: PAD + CELL_H * 0.56,
        scene: sc, pal: ARENA_PAL, landmark: 'arena', nodes: [], arena: true
      });
      return;
    }
    sc.chapters.forEach(function (cid, i) {
      var ch = CHAP_BY_ID[cid];
      if (!ch) return;
      var row = Math.floor(i / COLS);
      var col = i % COLS;
      var cx = PAD + (col + 0.5) * CELL_W;
      var cy = PAD + (row + 0.5) * CELL_H;
      areas.push({
        i: i, chap: ch, cx: cx, cy: cy, scene: sc,
        pal: BIOMES[ch.id] || BIOMES['gs-c1'],
        landmark: LANDMARK[ch.id] || 'village',
        nodes: []
      });
    });
  }

  function sceneOfChap(chapId) {
    for (var i = 0; i < SCENES.length; i++) {
      if (SCENES[i].chapters.indexOf(chapId) >= 0) return i;
    }
    return 0;
  }

  function areaOfChap(chapId) {
    for (var i = 0; i < areas.length; i++) if (areas[i].chap.id === chapId) return areas[i];
    return null;
  }

  function markBorder() {
    var t = 2;
    for (var x = 0; x < GW; x++) {
      for (var y = 0; y < GH; y++) {
        if (x < t || y < t || x >= GW - t || y >= GH - t) blocked[y * GW + x] = 1;
      }
    }
  }

  function markRect(x, y, w, h) {
    var x0 = clamp(Math.floor(x / TS), 0, GW - 1), x1 = clamp(Math.floor((x + w) / TS), 0, GW - 1);
    var y0 = clamp(Math.floor(y / TS), 0, GH - 1), y1 = clamp(Math.floor((y + h) / TS), 0, GH - 1);
    for (var ty = y0; ty <= y1; ty++) for (var tx = x0; tx <= x1; tx++) blocked[ty * GW + tx] = 1;
  }

  function blockedAt(x, y) {
    var tx = Math.floor(x / TS), ty = Math.floor(y / TS);
    if (tx < 0 || ty < 0 || tx >= GW || ty >= GH) return true;
    return !!blocked[ty * GW + tx];
  }

  var ARENA_ROUNDS = [
    { id: 'krillin', name: '克林', title: '预选赛', char: 'krillin' },
    { id: 'tien', name: '天津饭', title: '八强赛', char: 'tien-shinhan' },
    { id: 'piccolo', name: '比克', title: '半决赛', char: 'piccolo' },
    { id: 'vegeta', name: '贝吉塔', title: '决赛', char: 'vegeta' },
    { id: 'buu', name: '魔人布欧', title: '卫冕战', char: 'majin-buu' }
  ];
  function arenaRounds() {
    return (NS.Arena && NS.Arena.rounds && NS.Arena.rounds.length) ? NS.Arena.rounds : ARENA_ROUNDS;
  }

  /* ============================================================
   * 守关人的「待机动作」
   * ------------------------------------------------------------
   * 每个人按性格分配一种：打坐、睡觉、踱步、说话、发呆、漂浮、跳舞。
   * 动作只在玩家没靠近、也没触发挑衅时播放，不影响战斗流程。
   * ============================================================ */
  var IDLE_BY_CHAR = {
    'piccolo': 'meditate', 'nail': 'meditate', 'tien-shinhan': 'meditate', 'king-kai': 'meditate',
    'yajirobe': 'sleep', 'korin': 'sleep', 'farmer': 'sleep', 'popo': 'sleep',
    'frieza': 'float', 'cooler-final-form': 'float', 'beerus': 'float', 'chiaotzu': 'float',
    'majin-buu': 'dance', 'kid-buu': 'dance', 'evil-buu': 'dance',
    'vegeta': 'pace', 'majin-vegeta': 'pace', 'trunks': 'pace', 'future-trunks': 'pace',
    'nappa': 'flex', 'broly': 'flex', 'raditz': 'flex', 'ginyu': 'flex',
    'bulma': 'talk', 'videl': 'talk', 'fortuneteller-baba': 'talk',
    'oolong': 'talk', 'puar': 'talk',
    'krillin': 'pace', 'yamcha': 'lookout', 'chichi': 'lookout'
  };

  var IDLE_LINES = {
    'bulma': ['这机器又坏了…', '别碰我的实验。', '科技才是力量。'],
    'krillin': ['今天也要变强。', '我可没在偷懒。'],
    'vegeta': ['哼，杂鱼。', '别用那种眼神看我。'],
    'goku': ['肚子有点饿了…', '要不要去修炼？'],
    'piccolo': ['……', '心不静，拳不稳。'],
    'majin-buu': ['布欧想玩～', '巧克力！'],
    'frieza': ['真是令人愉悦。', '你还没资格让我变身。'],
    'beerus': ['布丁还有吗？', '无聊。'],
    'yajirobe': ['zzz…', '别吵我睡觉。'],
    'default': ['……', '准备好了吗？', '别磨蹭。']
  };

  /* 能挑战但还没打赢的守关人，偶尔放一句狠话，方便玩家判断谁可以打 */
  var TAUNT_LINES = {
    'goku': ['你看起来挺强的。', '要不要打一场？'],
    'vegeta': ['哼，你也配？', '别浪费我的时间。'],
    'piccolo': ['想清楚再上来。', '我会手下留情的。'],
    'frieza': ['准备好被我碾碎了吗？', '跪下。'],
    'cell': ['成为我的养分吧。', '让我看看你的极限。'],
    'majin-buu': ['布欧要把你变成巧克力！', '陪我玩！'],
    'kid-buu': ['变成糖果吧！', '嘻嘻嘻。'],
    'raditz': ['战斗力只有 5 的渣滓。', '别浪费我的探测器。'],
    'nappa': ['让我看看你能撑几秒。', '光头也是会痛的。'],
    'krillin': ['别小看地球人！', '这次我可不会倒下。'],
    'tien-shinhan': ['三只眼都看着你呢。', '气功炮准备。'],
    'yamcha': ['这次我不会再倒下了！', '来啊！'],
    'chiaotzu': ['我会把你定住哦。', '别小看我。'],
    'yajirobe': ['别打扰我吃东西…', '想挨刀？'],
    'farmer': ['我、我可不怕你！', '别过来啊！'],
    'oolong': ['你敢来我就变身！', '我可不只会吃。'],
    'puar': ['别过来啊…', '我会飞走的。'],
    'default': ['敢接吗？', '上来试试。', '别光站着。', '怕了？']
  };

  function assignIdle(npc) {
    var cid = (npc.spec && npc.spec.key) || '';
    var base = IDLE_BY_CHAR[cid];
    if (!base) {
      if (npc.kind === 'ref') base = 'talk';
      else if (npc.arena) base = 'breathe';
      else {
        // 没有指定动作的角色也分到不同待机：踱步 / 张望 / 闲聊 / 呼吸
        var hr = hashStr(cid + '|idle') % 10;
        base = hr < 3 ? 'pace' : (hr < 6 ? 'lookout' : (hr < 8 ? 'talk' : 'breathe'));
      }
    }
    npc.idle = base;
    npc.idleT = 0;
    npc.lookT = 0;
    npc.lookDir = 'down';
    npc.paceDir = (hashStr(npc.id) % 2) ? 1 : -1;
    npc.paceMoving = false;
    npc.walk = 0;
    npc.talkT = 0;
    npc.talkGap = 3 + (hashStr(npc.id) % 50) / 10;
    npc.idleSay = '';
    npc.idleSayUntil = 0;
    npc.taunt = '';
    npc.tauntUntil = 0;
    npc.tauntT = 0;
    npc.tauntGap = 4 + (hashStr(npc.id) % 50) / 10;
  }

  function placeNpcs() {
    npcs = []; npcByNode = {};
    if (currentScene().arena) { placeArenaNpcs(); return; }
    NODES.forEach(function (n) {
      var a = areaOfChap(n.chap);
      if (a) a.nodes.push(n);
    });
    areas.forEach(function (a) {
      var list = a.nodes.slice().sort(function (p, q) {
        if (p.tier !== q.tier) return p.tier - q.tier;
        return q.weight - p.weight;
      });
      if (!list.length) return;
      // 不再排成两个同心圆：按地貌散开，三圈交错 + 黄金角，避免「一圈人围观」
      layoutSpread(a, list);
    });
  }

  /** 把守关人铺开在营地四周：三圈交错、彼此至少 64px，并避开地标与出生通道 */
  function layoutSpread(a, list) {
    var lm = landmarkFootprint(a);
    var placed = [];
    list.forEach(function (n, i) {
      var h = hashStr(n.id);
      var best = null;
      for (var k = 0; k < 40; k++) {
        var ang = -Math.PI / 2 + i * 2.399963 + k * 0.7;
        var band = i % 3;
        var rad = [240, 400, 545][band] + ((h >> 4) % 52) + (k % 4) * 7;
        var x = a.cx + Math.cos(ang) * rad;
        var y = a.cy + Math.sin(ang) * rad * 0.8;
        if (x < 80 || y < 80 || x > WORLD_W - 80 || y > WORLD_H - 120) continue;
        if (inSpawnLane(x, y)) continue;
        if (x > lm.x - 26 && x < lm.x + lm.w + 26 &&
            y > lm.y - 20 && y < lm.y + lm.h + 26) continue;
        var ok = true;
        for (var j = 0; j < placed.length; j++) {
          if (Math.hypot(placed[j].x - x, placed[j].y - y) < 96) { ok = false; break; }
        }
        if (!ok) continue;
        best = { x: x, y: y };
        break;
      }
      if (!best) {
        var a2 = -Math.PI / 2 + i * Math.PI * 2 / Math.max(list.length, 1);
        best = { x: a.cx + Math.cos(a2) * 340, y: a.cy + Math.sin(a2) * 270 };
      }
      placed.push(best);
      var npc = {
        id: n.id, node: n, area: a.i,
        x: best.x, y: best.y, home: { x: best.x, y: best.y },
        spec: specFor(n),
        phase: (hashStr(n.id) % 628) / 100
      };
      npcs.push(npc);
      assignIdle(npc);
      npcByNode[n.id] = npc;
    });
    a.nodesPlaced = true;
  }

  function placeArenaNpcs() {
    var a = areas[0];
    if (!a) return;
    var list = arenaRounds();
    var st = (NS.Arena && NS.Arena.status) ? NS.Arena.status() : { round: 0, wins: 0, champion: false };
    list.forEach(function (f, i) {
      var x = a.cx + (i - (list.length - 1) / 2) * 132;
      var y = a.cy - 118;
      var cur = !st.champion && i === st.round;
      var done = st.champion || i < st.round;
      var n = {
        id: 'arena-' + f.id, name: f.title, tier: 3, module: 'arena',
        wip: false, req: [], arena: true, charId: f.char
      };
      var npc = {
        id: n.id, node: n, area: a.i, arena: true, arenaIndex: i,
        current: cur, defeated: done,
        x: x, y: y, home: { x: x, y: y },
        spec: specForChar(f.char, f.name, true),
        phase: (hashStr(f.id) % 628) / 100,
        say: cur ? '放马过来！' : ''
      };
      npcs.push(npc);
      assignIdle(npc);
      npcByNode[n.id] = npc;
    });
    // 主持人：站在台前，点他也等于开始当前这一轮
    var rn = { id: 'arena-ref', name: '主持人', tier: 1, module: 'arena', wip: false, req: [], arena: true };
    var refNpc = {
      id: rn.id, node: rn, area: a.i, arena: true, kind: 'ref',
      x: a.cx, y: a.cy + 142, home: { x: a.cx, y: a.cy + 142 },
      spec: specForChar('yamcha', '', false),
      phase: 0, say: st.champion ? '新的冠军诞生了！' : '天下第一武道会，开始！'
    };
    npcs.push(refNpc);
    assignIdle(refNpc);
    npcByNode[rn.id] = refNpc;
  }

  function refreshArena() {
    if (!currentScene().arena) return;
    placeArenaNpcs();
    lastArea = -1;
    updateArea();
    updateQuests(true);
    updatePrompt();
  }

  function spawnPlayer() {
    // 每次进场景都从地图下方入口进入，像刚走进这张地图
    var x = spawnX(), y = spawnY();
    var t = nearestWalkable(x, y, 12);
    player.x = t.x; player.y = t.y;
    player.dir = 'up';
    player.path = [];
    player.moving = false;
    cam.x = clamp(player.x - vw() / 2, 0, Math.max(0, WORLD_W - vw()));
    cam.y = clamp(player.y - vh() / 2, 0, Math.max(0, WORLD_H - vh()));
  }

  function nearestWalkable(x, y, r) {
    // 用和角色一致的碰撞盒判断，而不是只看一个格子：
    // 只看格子中心会在「树边」选到一个身体仍压在树干上的点。
    function free(px, py) { return !hit(px, py); }
    if (free(x, y)) return { x: x, y: y };
    for (var d = 1; d <= r; d++) {
      for (var dy = -d; dy <= d; dy++) {
        for (var dx = -d; dx <= d; dx++) {
          if (Math.abs(dx) !== d && Math.abs(dy) !== d) continue;
          var nx = x + dx * TS, ny = y + dy * TS;
          if (nx < TS || ny < TS || nx > WORLD_W - TS || ny > WORLD_H - TS) continue;
          if (free(nx, ny)) return { x: nx, y: ny };
        }
      }
    }
    return { x: x, y: y };
  }

  /* ============================================================
   * 4. 地形绘制（只画一次）
   * ============================================================ */
  function drawTerrain() {
    terrain = mk(WORLD_W, WORLD_H);
    tctx = terrain.getContext('2d');
    tctx.imageSmoothingEnabled = false;
    var sc = currentScene();
    var r = rng(20261018 + sceneIdx * 7919);

    if (sc.arena) { drawArenaTerrain(r); return; }

    drawGround(sc, r);
    if (sc.theme === 'city') drawCitySkyline(r);   // 先立楼，再画营地与标题

    // 每块营地的地色（椭圆渐变 + 噪点，边界不规则）
    areas.forEach(function (a) {
      drawClearing(a, r, sc);
    });

    // 场景内的路：两块营地之间一条
    if (areas.length > 1) drawRoad(areas[0], areas[1], sc);

    // 下方入口通道：从出生点一直铺到营地，保证不会被树堵死
    drawSpawnLane(sc);

    // 每块营地中央的广场
    areas.forEach(function (a) { drawPlaza(a, sc); });

    // 水景 / 冰面 / 霓虹倒影
    areas.forEach(function (a) { drawWater(a, r, sc); });

    // 营地标题
    areas.forEach(function (a) { drawAreaLabel(a); });

    // 地标建筑（先定碰撞再画）
    areas.forEach(function (a) { a.footprint = landmarkFootprint(a); });
    areas.forEach(function (a) { markRect(a.footprint.x, a.footprint.y, a.footprint.w, a.footprint.h); });
    areas.forEach(function (a) { drawLandmark(a); });

    // 场景专属装饰
    drawDecor(r, sc);

    // 营地两侧的小地标：让每张图不只剩中央一座建筑
    drawSubLandmarks(sc);

    // 树 / 建筑：最后画，会盖住路边缘
    drawForest(r, sc);

    // 岛屿海面、城市天际线这类整张图的外框
    drawSceneFrame(sc, r);
  }

  /* ---------------- 地面 ---------------- */
  function drawGround(sc, r) {
    var pal = BIOMES[sc.chapters[0]];
    if (sc.theme === 'island') {
      // 先铺海，再落一块不规则的岛
      tctx.fillStyle = pal.water[0];
      tctx.fillRect(0, 0, WORLD_W, WORLD_H);
      tctx.fillStyle = pal.water[1];
      tctx.beginPath();
      tctx.ellipse(WORLD_W / 2, WORLD_H / 2, WORLD_W * 0.485, WORLD_H * 0.475, 0, 0, Math.PI * 2);
      tctx.fill();
      tctx.fillStyle = pal.ground;
      tctx.beginPath();
      tctx.ellipse(WORLD_W / 2, WORLD_H / 2, WORLD_W * 0.462, WORLD_H * 0.448, 0, 0, Math.PI * 2);
      tctx.fill();
      // 沙滩边缘
      tctx.strokeStyle = 'rgba(255,255,255,0.32)';
      tctx.lineWidth = 3;
      tctx.beginPath();
      tctx.ellipse(WORLD_W / 2, WORLD_H / 2, WORLD_W * 0.462, WORLD_H * 0.448, 0, 0, Math.PI * 2);
      tctx.stroke();
    } else {
      tctx.fillStyle = pal.ground;
      tctx.fillRect(0, 0, WORLD_W, WORLD_H);
    }

    // 细碎噪点：用当前场景的两档地色，避免大片死色
    var tones = [pal.g1, pal.g2, pal.dark];
    var waterTones = [pal.water[0], pal.water[1], '#2b7f9e'];
    var n = sc.theme === 'city' ? 5200 : 7600;
    for (var i = 0; i < n; i++) {
      var nx0 = Math.floor(r() * WORLD_W), ny0 = Math.floor(r() * WORLD_H);
      if (sc.theme === 'island') {
        tctx.fillStyle = onIsland(nx0, ny0) ? tones[Math.floor(r() * tones.length)] : waterTones[Math.floor(r() * waterTones.length)];
      } else {
        tctx.fillStyle = tones[Math.floor(r() * tones.length)];
      }
      var s = r() < 0.72 ? 2 : (r() < 0.85 ? 3 : 5);
      tctx.globalAlpha = sc.theme === 'city' ? 0.35 : 0.5;
      tctx.fillRect(nx0, ny0, s, s);
    }
    tctx.globalAlpha = 1;

    if (sc.theme === 'snow') drawSnowDrifts(r);
    if (sc.theme === 'celestial') drawCloudBands(r);
    if (sc.theme === 'city') drawCityGround(r);
    if (sc.theme === 'palace') drawPalaceGround(r);
    if (sc.theme === 'island') drawIslandDetails(r, pal);
  }

  function drawSnowDrifts(r) {
    for (var i = 0; i < 46; i++) {
      var x = r() * WORLD_W, y = r() * WORLD_H;
      var w = 60 + r() * 150, h = 16 + r() * 26;
      tctx.fillStyle = 'rgba(255,255,255,0.55)';
      tctx.beginPath(); tctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2); tctx.fill();
      tctx.fillStyle = 'rgba(160,200,225,0.20)';
      tctx.beginPath(); tctx.ellipse(x + 8, y + h * 0.6, w * 0.9, h * 0.5, 0, 0, Math.PI * 2); tctx.fill();
    }
    // 冰裂纹
    tctx.strokeStyle = 'rgba(150,195,220,0.35)';
    tctx.lineWidth = 1;
    for (var k = 0; k < 26; k++) {
      var x2 = r() * WORLD_W, y2 = r() * WORLD_H;
      tctx.beginPath();
      tctx.moveTo(x2, y2);
      for (var j = 0; j < 3; j++) {
        x2 += (r() - 0.5) * 70; y2 += (r() - 0.5) * 40;
        tctx.lineTo(x2, y2);
      }
      tctx.stroke();
    }
  }

  function drawCloudBands(r) {
    for (var i = 0; i < 34; i++) {
      var x = r() * WORLD_W, y = r() * WORLD_H;
      var w = 110 + r() * 200;
      tctx.fillStyle = 'rgba(255,255,255,' + (0.10 + r() * 0.14).toFixed(2) + ')';
      tctx.beginPath(); tctx.ellipse(x, y, w, 14 + r() * 14, 0, 0, Math.PI * 2); tctx.fill();
    }
  }

  function drawCityGround(r) {
    // 人行道砖缝 + 井盖 + 彩色导视线
    tctx.strokeStyle = 'rgba(255,255,255,0.045)';
    tctx.lineWidth = 1;
    for (var x = 0; x < WORLD_W; x += 48) {
      tctx.beginPath(); tctx.moveTo(x, 0); tctx.lineTo(x, WORLD_H); tctx.stroke();
    }
    for (var y = 0; y < WORLD_H; y += 48) {
      tctx.beginPath(); tctx.moveTo(0, y); tctx.lineTo(WORLD_W, y); tctx.stroke();
    }
    for (var i = 0; i < 18; i++) {
      var mx = 60 + r() * (WORLD_W - 120), my = 80 + r() * (WORLD_H - 160);
      tctx.fillStyle = 'rgba(20,24,32,0.55)';
      tctx.beginPath(); tctx.arc(mx, my, 11, 0, Math.PI * 2); tctx.fill();
      tctx.strokeStyle = 'rgba(140,150,165,0.5)';
      tctx.lineWidth = 2; tctx.stroke();
    }
    // 霓虹导视线
    var colors = ['rgba(244,114,182,0.24)', 'rgba(56,189,248,0.22)', 'rgba(251,191,36,0.18)'];
    for (var k = 0; k < 6; k++) {
      var yy = 120 + r() * (WORLD_H - 240);
      tctx.fillStyle = colors[k % colors.length];
      tctx.fillRect(0, yy, WORLD_W, 4);
    }
  }

  function drawPalaceGround(r) {
    // 深色地砖 + 发光缝 + 星点
    for (var x = 0; x < WORLD_W; x += 64) {
      for (var y = 0; y < WORLD_H; y += 64) {
        if (r() < 0.30) {
          tctx.fillStyle = 'rgba(125,211,252,0.06)';
          tctx.fillRect(x + 2, y + 2, 60, 60);
        }
      }
    }
    tctx.strokeStyle = 'rgba(125,211,252,0.09)';
    tctx.lineWidth = 1;
    for (var x2 = 0; x2 < WORLD_W; x2 += 64) {
      tctx.beginPath(); tctx.moveTo(x2, 0); tctx.lineTo(x2, WORLD_H); tctx.stroke();
    }
    for (var y2 = 0; y2 < WORLD_H; y2 += 64) {
      tctx.beginPath(); tctx.moveTo(0, y2); tctx.lineTo(WORLD_W, y2); tctx.stroke();
    }
    for (var i = 0; i < 260; i++) {
      var sx = r() * WORLD_W, sy = r() * WORLD_H;
      tctx.fillStyle = r() < 0.5 ? 'rgba(196,181,253,0.55)' : 'rgba(125,211,252,0.5)';
      tctx.fillRect(Math.floor(sx), Math.floor(sy), 2, 2);
    }
  }

  function drawIslandDetails(r, pal) {
    // 岛内草地斑块
    for (var i = 0; i < 40; i++) {
      var ang = r() * Math.PI * 2, rad = Math.sqrt(r()) * 0.9;
      var x = WORLD_W / 2 + Math.cos(ang) * rad * WORLD_W * 0.42;
      var y = WORLD_H / 2 + Math.sin(ang) * rad * WORLD_H * 0.40;
      tctx.fillStyle = r() < 0.5 ? pal.g1 : pal.g2;
      tctx.beginPath();
      tctx.ellipse(x, y, 50 + r() * 110, 24 + r() * 46, r() * 3, 0, Math.PI * 2);
      tctx.fill();
    }
    // 海浪
    tctx.strokeStyle = 'rgba(255,255,255,0.30)';
    tctx.lineWidth = 2;
    for (var k = 0; k < 60; k++) {
      var a = k / 60 * Math.PI * 2;
      var rx = WORLD_W / 2 + Math.cos(a) * WORLD_W * 0.478;
      var ry = WORLD_H / 2 + Math.sin(a) * WORLD_H * 0.468;
      tctx.beginPath();
      tctx.arc(rx, ry, 7 + r() * 8, Math.PI * 0.15, Math.PI * 0.85);
      tctx.stroke();
    }
  }

  /* ---------------- 出生通道 ---------------- */
  function drawSpawnLane(sc) {
    var pal = BIOMES[sc.chapters[0]] || ARENA_PAL;
    var cx = spawnX();
    var y0 = spawnLaneTop(), y1 = WORLD_H - 8;
    // 外圈暗色
    tctx.fillStyle = pal.road[0];
    tctx.globalAlpha = 0.5;
    for (var y = y0; y < y1; y += 16) {
      tctx.beginPath();
      tctx.arc(cx + Math.sin(y * 0.02) * 8, y, 88, 0, Math.PI * 2);
      tctx.fill();
    }
    tctx.globalAlpha = 1;
    // 内圈亮色
    tctx.fillStyle = pal.road[1];
    for (var y2 = y0 + 6; y2 < y1; y2 += 16) {
      tctx.beginPath();
      tctx.arc(cx + Math.sin(y2 * 0.02) * 8, y2, 66, 0, Math.PI * 2);
      tctx.fill();
    }
    // 碎石
    for (var k = 0; k < 70; k++) {
      var yy = y0 + Math.random() * (y1 - y0);
      tctx.fillStyle = k % 2 ? pal.road[2] : pal.road[0];
      tctx.globalAlpha = 0.6;
      tctx.fillRect(cx + (Math.random() - 0.5) * 130, yy, 3, 3);
    }
    tctx.globalAlpha = 1;
  }

  function drawClearing(a, r, sc) {
    var pal = a.pal;
    for (var i = 0; i < 1120; i++) {
      var ang = r() * Math.PI * 2;
      var rad = Math.sqrt(r()) * 540;
      var x = a.cx + Math.cos(ang) * rad;
      var y = a.cy + Math.sin(ang) * rad * 0.82;
      tctx.fillStyle = r() < 0.5 ? pal.g1 : pal.g2;
      var s = r() < 0.75 ? 4 : 6;
      tctx.fillRect(Math.floor(x), Math.floor(y), s, s);
    }
    // 外圈一圈深色草，作为营地边界
    for (var j = 0; j < 148; j++) {
      var ang2 = j / 148 * Math.PI * 2;
      var rx = a.cx + Math.cos(ang2) * 548;
      var ry = a.cy + Math.sin(ang2) * 448;
      tctx.fillStyle = pal.dark;
      tctx.globalAlpha = sc.theme === 'city' ? 0.10 : 0.18;
      tctx.fillRect(Math.floor(rx), Math.floor(ry), 8, 8);
      tctx.globalAlpha = 1;
    }
  }

  /* ---------------- 路 ---------------- */
  function roadPoint(a, b, t, bend) {
    var mx = (a.cx + b.cx) / 2, my = (a.cy + b.cy) / 2;
    var dx = b.cx - a.cx, dy = b.cy - a.cy;
    var len = Math.hypot(dx, dy) || 1;
    var cx = mx + (-dy / len) * bend, cy = my + (dx / len) * bend;
    var u = 1 - t;
    return {
      x: u * u * a.cx + 2 * u * t * cx + t * t * b.cx,
      y: u * u * a.cy + 2 * u * t * cy + t * t * b.cy
    };
  }

  function drawRoad(a, b, sc) {
    var pal = a.pal;
    var bend = ((a.i * 7 + b.i * 3) % 5 - 2) * 32;
    var pts = [];
    for (var t = 0; t <= 1.0001; t += 0.02) pts.push(roadPoint(a, b, t, bend));
    pathSamples = pathSamples.concat(pts);

    if (sc.theme === 'city') {
      // 城市：一条带白色边线与虚线的柏油路
      [[30, '#2f3742'], [24, '#3c4652'], [18, '#4a5563']].forEach(function (layer) {
        tctx.fillStyle = layer[1];
        for (var i = 0; i < pts.length; i++) {
          tctx.beginPath(); tctx.arc(pts[i].x, pts[i].y, layer[0], 0, Math.PI * 2); tctx.fill();
        }
      });
      tctx.fillStyle = 'rgba(255,255,255,0.55)';
      for (var m = 6; m < pts.length - 6; m += 4) {
        var p = pts[m];
        tctx.fillRect(Math.round(p.x - 2), Math.round(p.y - 9), 4, 18);
      }
      tctx.fillStyle = 'rgba(244,114,182,0.35)';
      for (var q = 0; q < pts.length; q += 8) {
        tctx.fillRect(Math.round(pts[q].x - 20), Math.round(pts[q].y + 20), 6, 3);
      }
      return;
    }

    // 三层：暗边 → 中色 → 中心亮色
    [[23, pal.road[0]], [18, pal.road[1]], [11, pal.road[2]]].forEach(function (layer, li) {
      tctx.fillStyle = layer[1];
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var rr = layer[0] + (li === 0 ? Math.sin(i * 1.7) * 2 : 0);
        tctx.beginPath();
        tctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
        tctx.fill();
      }
    });

    if (sc.theme === 'snow') {
      // 雪地脚印
      tctx.fillStyle = 'rgba(160,195,215,0.45)';
      for (var s2 = 4; s2 < pts.length - 4; s2 += 6) {
        var pp = pts[s2];
        tctx.fillRect(Math.round(pp.x - 4), Math.round(pp.y + 2), 3, 4);
        tctx.fillRect(Math.round(pp.x + 2), Math.round(pp.y - 1), 3, 4);
      }
      return;
    }
    if (sc.theme === 'celestial' || sc.theme === 'palace') {
      // 发光路缘
      tctx.strokeStyle = sc.theme === 'palace' ? 'rgba(125,211,252,0.35)' : 'rgba(255,255,255,0.5)';
      tctx.lineWidth = 2;
      tctx.beginPath();
      pts.forEach(function (p, i) { i ? tctx.lineTo(p.x, p.y - 15) : tctx.moveTo(p.x, p.y - 15); });
      tctx.stroke();
      tctx.beginPath();
      pts.forEach(function (p, i) { i ? tctx.lineTo(p.x, p.y + 15) : tctx.moveTo(p.x, p.y + 15); });
      tctx.stroke();
    }
    // 路面碎石
    for (var j = 0; j < pts.length; j += 2) {
      var p2 = pts[j];
      tctx.fillStyle = sc.theme === 'snow' ? 'rgba(255,255,255,0.9)' : pal.road[0];
      tctx.globalAlpha = 0.55;
      tctx.fillRect(Math.floor(p2.x + Math.sin(j) * 9), Math.floor(p2.y + Math.cos(j * 1.3) * 9), 3, 3);
      tctx.globalAlpha = 1;
    }
  }

  /* ---------------- 广场 ---------------- */
  function drawPlaza(a, sc) {
    var pal = a.pal;
    var radius = 124;
    if (sc.theme === 'city') {
      // 城市：方形拼色广场
      var x0 = a.cx - radius, y0 = a.cy - radius * 0.78;
      var w = radius * 2, h = radius * 1.56;
      tctx.fillStyle = pal.plaza[0];
      tctx.fillRect(x0 - 6, y0 - 6, w + 12, h + 12);
      for (var gx = 0; gx < 6; gx++) {
        for (var gy = 0; gy < 5; gy++) {
          tctx.fillStyle = (gx + gy) % 2 ? pal.plaza[1] : pal.plaza[0];
          tctx.fillRect(x0 + gx * (w / 6), y0 + gy * (h / 5), w / 6, h / 5);
        }
      }
      tctx.strokeStyle = 'rgba(244,114,182,0.5)';
      tctx.lineWidth = 2;
      tctx.strokeRect(x0, y0, w, h);
    } else {
      tctx.fillStyle = pal.plaza[0];
      tctx.beginPath(); tctx.ellipse(a.cx, a.cy, radius + 5, (radius + 5) * 0.78, 0, 0, Math.PI * 2); tctx.fill();
      tctx.fillStyle = pal.plaza[1];
      tctx.beginPath(); tctx.ellipse(a.cx, a.cy, radius, radius * 0.78, 0, 0, Math.PI * 2); tctx.fill();
      tctx.strokeStyle = pal.plaza[2];
      tctx.globalAlpha = 0.45;
      tctx.lineWidth = 2;
      for (var i = -radius; i <= radius; i += 26) {
        tctx.beginPath();
        tctx.moveTo(a.cx + i, a.cy - Math.sqrt(Math.max(0, 1 - (i / radius) * (i / radius))) * radius * 0.78);
        tctx.lineTo(a.cx + i, a.cy + Math.sqrt(Math.max(0, 1 - (i / radius) * (i / radius))) * radius * 0.78);
        tctx.stroke();
      }
      tctx.globalAlpha = 1;
    }

    // 广场边缘的灯柱（颜色跟场景强调色走）
    for (var k = 0; k < 4; k++) {
      var ang = Math.PI / 4 + k * Math.PI / 2;
      var lx = a.cx + Math.cos(ang) * (radius + 16);
      var ly = a.cy + Math.sin(ang) * (radius + 16) * 0.78;
      tctx.fillStyle = sc.theme === 'city' ? '#1f2937' : '#5b3a22';
      tctx.fillRect(lx - 2, ly - 22, 5, 23);
      tctx.fillStyle = pal.accent;
      tctx.fillRect(lx - 5, ly - 29, 11, 9);
      tctx.globalAlpha = 0.18;
      tctx.fillStyle = pal.accent;
      tctx.beginPath(); tctx.arc(lx, ly - 25, 17, 0, Math.PI * 2); tctx.fill();
      tctx.globalAlpha = 1;
    }
  }

  /* ---------------- 水景 ---------------- */
  function drawWater(a, r, sc) {
    var pal = a.pal;
    var n = 2 + Math.floor(r() * 2);
    for (var i = 0; i < n; i++) {
      var ang = r() * Math.PI * 2;
      var rad = (178 + r() * 100) * MAP_S;
      var x = a.cx + Math.cos(ang) * rad;
      var y = a.cy + Math.sin(ang) * rad * 0.82;
      var w = 18 + r() * 20;
      var h = w * 0.42;
      if (sc.theme === 'snow') {
        // 冰面
        tctx.fillStyle = 'rgba(150,200,225,0.35)';
        tctx.beginPath(); tctx.ellipse(x, y + 1.5, w + 3, h + 2, 0, 0, Math.PI * 2); tctx.fill();
        tctx.fillStyle = 'rgba(238,250,255,0.9)';
        tctx.beginPath(); tctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2); tctx.fill();
        tctx.strokeStyle = 'rgba(150,195,220,0.7)';
        tctx.lineWidth = 1;
        tctx.beginPath(); tctx.moveTo(x - w * 0.5, y); tctx.lineTo(x + w * 0.2, y - h * 0.4); tctx.lineTo(x + w * 0.7, y + h * 0.2); tctx.stroke();
        continue;
      }
      if (sc.theme === 'city') {
        // 霓虹倒影水洼
        tctx.fillStyle = 'rgba(12,18,28,0.55)';
        tctx.beginPath(); tctx.ellipse(x, y + 2, w + 3, h + 2, 0, 0, Math.PI * 2); tctx.fill();
        tctx.fillStyle = 'rgba(244,114,182,0.35)';
        tctx.beginPath(); tctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2); tctx.fill();
        tctx.fillStyle = 'rgba(56,189,248,0.42)';
        tctx.beginPath(); tctx.ellipse(x - w * 0.3, y - h * 0.2, w * 0.4, h * 0.4, 0, 0, Math.PI * 2); tctx.fill();
        continue;
      }
      // 普通/天界/宫殿水面
      tctx.fillStyle = 'rgba(10,22,30,0.25)';
      tctx.beginPath(); tctx.ellipse(x, y + 1.5, w + 2, h + 1.5, 0, 0, Math.PI * 2); tctx.fill();
      tctx.fillStyle = pal.water[1];
      tctx.beginPath(); tctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2); tctx.fill();
      tctx.fillStyle = pal.water[2];
      tctx.globalAlpha = 0.42;
      tctx.beginPath(); tctx.ellipse(x - w * 0.25, y - h * 0.25, w * 0.42, h * 0.34, 0, 0, Math.PI * 2); tctx.fill();
      tctx.globalAlpha = 1;
      if (sc.theme === 'celestial' || sc.theme === 'palace') {
        tctx.fillStyle = 'rgba(255,255,255,0.55)';
        tctx.fillRect(Math.round(x - w * 0.2), Math.round(y - h * 0.1), 2, 2);
        tctx.fillRect(Math.round(x + w * 0.3), Math.round(y + h * 0.1), 2, 2);
      }
    }
  }

  /* ============================================================
   * 3.6 天下第一武道会：擂台 / 观众 / 选手席
   * ============================================================ */
  function drawArenaTerrain(r) {
    arenaFlags = []; arenaFlashes = [];
    var W = WORLD_W, H = WORLD_H;

    // 沙土地面
    tctx.fillStyle = '#6b5538';
    tctx.fillRect(0, 0, W, H);
    var tones = ['#7a6444', '#5f4b31', '#826a45', '#4c3a24'];
    for (var i = 0; i < 9000; i++) {
      tctx.fillStyle = tones[Math.floor(r() * tones.length)];
      tctx.globalAlpha = 0.45;
      tctx.fillRect(Math.floor(r() * W), Math.floor(r() * H), r() < 0.75 ? 2 : 4, r() < 0.75 ? 2 : 3);
    }
    tctx.globalAlpha = 1;

    // 入口到擂台的石板路
    tctx.fillStyle = '#8a6d43';
    tctx.fillRect(W / 2 - 118, 700, 236, H - 700);
    tctx.fillStyle = '#a4865a';
    for (var py = 712; py < H; py += 34) {
      tctx.fillRect(W / 2 - 110, py, 220, 2);
    }

    drawArenaStands(r);
    drawArenaStage(r);
    drawArenaGate();

    // 观众席与外墙不可行走
    markRect(0, 0, W, 258);
    markRect(0, 258, 606, H - 258);
    markRect(W - 606, 258, 606, H - 258);
    markRect(0, H - 104, 690, 104);
    markRect(W - 690, H - 104, 690, 104);
  }

  function arenaPerson(x, y, seed) {
    var SHIRT = ['#e05252', '#3f8fbf', '#e0a13c', '#7c3aed', '#16a34a', '#f472b6', '#0ea5e9'];
    var SKIN = ['#f6c89a', '#e8b98a', '#d1a06f', '#c08a5a'];
    var HAIR = ['#141821', '#5b3a22', '#fbbf24', '#a78bfa', '#f8fafc'];
    var c = SHIRT[seed % SHIRT.length];
    var sk = SKIN[(seed >> 3) % SKIN.length];
    var hr = HAIR[(seed >> 6) % HAIR.length];
    tctx.fillStyle = 'rgba(0,0,0,0.28)';
    tctx.fillRect(x - 2, y + 8, 6, 2);
    tctx.fillStyle = c;
    tctx.fillRect(x - 2, y + 2, 5, 7);
    tctx.fillStyle = sk;
    tctx.fillRect(x - 2, y - 3, 5, 5);
    tctx.fillStyle = hr;
    tctx.fillRect(x - 2, y - 4, 5, 2);
    if ((seed >> 7) % 5 === 0) {
      tctx.fillStyle = sk;
      tctx.fillRect(x - 4, y - 1, 2, 4);
      tctx.fillRect(x + 3, y - 1, 2, 4);
    }
    if ((seed >> 9) % 23 === 0) {
      arenaFlags.push({ x: x, y: y - 10, c: c, ph: (seed % 100) / 16 });
    }
    if ((seed >> 11) % 31 === 0) {
      arenaFlashes.push({ x: x, y: y - 2, ph: (seed % 90) / 14 });
    }
  }

  function drawArenaStands(r) {
    // 上方看台：4 层
    for (var t = 0; t < 4; t++) {
      var y = 104 + t * 38;
      tctx.fillStyle = t % 2 ? '#3a2a1a' : '#453322';
      tctx.fillRect(0, y, WORLD_W, 36);
      tctx.fillStyle = 'rgba(255,220,160,0.06)';
      tctx.fillRect(0, y, WORLD_W, 2);
      for (var x = 26; x < WORLD_W - 26; x += 24) {
        if (Math.floor((x - 26) / 24) % 17 === 8) continue;   // 过道
        arenaPerson(x, y + 12, hashStr('top' + t + '-' + x));
      }
    }
    // 左右看台：各 5 列
    [28, WORLD_W - 600].forEach(function (x0, side) {
      for (var c = 0; c < 5; c++) {
        var x = x0 + 50 + c * 125;
        for (var y = 300; y < WORLD_H - 140; y += 30) {
          if (Math.floor((y - 300) / 30) % 13 === 6) continue;
          arenaPerson(x, y, hashStr('side' + side + c + '-' + y));
        }
      }
    });
    // 看台外墙压边
    tctx.fillStyle = '#2b1d12';
    tctx.fillRect(0, 96, WORLD_W, 8);
    tctx.fillRect(0, 258, 606, 8);
    tctx.fillRect(WORLD_W - 606, 258, 606, 8);
  }

  function drawArenaStage(r) {
    var cx = WORLD_W / 2, cy = PAD + CELL_H * 0.56;
    var x0 = cx - 350, y0 = cy - 206, w = 700, h = 412;

    // 台基阴影
    tctx.fillStyle = 'rgba(0,0,0,0.42)';
    tctx.fillRect(x0 - 14, y0 + 16, w + 28, h + 24);
    // 深色包边 + 金边
    tctx.fillStyle = '#3a2115';
    tctx.fillRect(x0 - 12, y0 - 12, w + 24, h + 24);
    tctx.fillStyle = '#8a6238';
    tctx.fillRect(x0 - 4, y0 - 4, w + 8, h + 8);
    tctx.strokeStyle = '#e8b45a';
    tctx.lineWidth = 4;
    tctx.strokeRect(x0 + 4, y0 + 4, w - 8, h - 8);

    // 石砖
    var tw = w / 10, th = h / 6;
    for (var gy = 0; gy < 6; gy++) {
      for (var gx = 0; gx < 10; gx++) {
        tctx.fillStyle = (gx + gy) % 2 ? '#a4865a' : '#91764c';
        tctx.fillRect(x0 + gx * tw, y0 + gy * th, tw - 1, th - 1);
      }
    }
    tctx.strokeStyle = 'rgba(60,40,20,0.35)';
    tctx.lineWidth = 1;
    for (var gx2 = 1; gx2 < 10; gx2++) {
      tctx.beginPath(); tctx.moveTo(x0 + gx2 * tw, y0); tctx.lineTo(x0 + gx2 * tw, y0 + h); tctx.stroke();
    }
    for (var gy2 = 1; gy2 < 6; gy2++) {
      tctx.beginPath(); tctx.moveTo(x0, y0 + gy2 * th); tctx.lineTo(x0 + w, y0 + gy2 * th); tctx.stroke();
    }

    // 中央「武」字徽记
    tctx.fillStyle = '#5a2a1e';
    tctx.beginPath(); tctx.arc(cx, cy, 74, 0, Math.PI * 2); tctx.fill();
    tctx.strokeStyle = '#f5c76a';
    tctx.lineWidth = 5;
    tctx.beginPath(); tctx.arc(cx, cy, 74, 0, Math.PI * 2); tctx.stroke();
    tctx.beginPath(); tctx.arc(cx, cy, 62, 0, Math.PI * 2); tctx.stroke();
    tctx.fillStyle = '#ffe7b3';
    tctx.font = 'bold 58px "Microsoft YaHei", sans-serif';
    tctx.textAlign = 'center';
    tctx.textBaseline = 'middle';
    tctx.fillText('武', cx, cy + 2);
    tctx.textAlign = 'left';
    tctx.textBaseline = 'alphabetic';
    // 四颗星
    for (var s = 0; s < 4; s++) {
      var sa = Math.PI / 4 + s * Math.PI / 2;
      tctx.fillStyle = '#f5c76a';
      tctx.fillRect(cx + Math.cos(sa) * 94 - 3, cy + Math.sin(sa) * 94 - 3, 6, 6);
    }

    // 四角石柱
    [[x0 + 42, y0 + 42], [x0 + w - 42, y0 + 42],
     [x0 + 42, y0 + h - 42], [x0 + w - 42, y0 + h - 42]].forEach(function (p) {
      tctx.fillStyle = 'rgba(0,0,0,0.35)';
      tctx.beginPath(); tctx.ellipse(p[0], p[1] + 20, 18, 6, 0, 0, Math.PI * 2); tctx.fill();
      tctx.fillStyle = '#8a6238';
      tctx.fillRect(p[0] - 12, p[1] - 46, 24, 58);
      tctx.fillStyle = '#a4865a';
      tctx.fillRect(p[0] - 12, p[1] - 46, 8, 58);
      tctx.fillStyle = '#5a3a22';
      tctx.fillRect(p[0] - 16, p[1] + 6, 32, 10);
      tctx.fillStyle = '#f5c76a';
      tctx.beginPath(); tctx.arc(p[0], p[1] - 54, 8, 0, Math.PI * 2); tctx.fill();
      tctx.globalAlpha = 0.2;
      tctx.beginPath(); tctx.arc(p[0], p[1] - 54, 20, 0, Math.PI * 2); tctx.fill();
      tctx.globalAlpha = 1;
      markRect(p[0] - 16, p[1] - 56, 32, 32);
    });

    // 正面台阶
    for (var k = 0; k < 4; k++) {
      var sw = 200 - k * 26;
      tctx.fillStyle = k % 2 ? '#a4865a' : '#8a6d43';
      tctx.fillRect(cx - sw / 2, y0 + h + k * 15, sw, 17);
      tctx.fillStyle = 'rgba(255,230,170,0.12)';
      tctx.fillRect(cx - sw / 2, y0 + h + k * 15, sw, 2);
    }

    // 两侧「武」字旗
    [[x0 + 16, y0 + 96], [x0 + w - 44, y0 + 96]].forEach(function (p) {
      tctx.fillStyle = '#5a1f1a';
      tctx.fillRect(p[0], p[1], 28, 104);
      tctx.strokeStyle = '#e8b45a';
      tctx.lineWidth = 2;
      tctx.strokeRect(p[0] + 2, p[1] + 2, 24, 100);
      tctx.fillStyle = '#ffe7b3';
      tctx.font = 'bold 17px "Microsoft YaHei", sans-serif';
      tctx.textAlign = 'center';
      tctx.fillText('武', p[0] + 14, p[1] + 30);
      tctx.fillText('道', p[0] + 14, p[1] + 56);
      tctx.fillText('会', p[0] + 14, p[1] + 82);
      tctx.textAlign = 'left';
    });

    // 前台火盆
    [[x0 + 26, y0 + h - 14], [x0 + w - 26, y0 + h - 14]].forEach(function (p) {
      tctx.fillStyle = '#3a2115';
      tctx.fillRect(p[0] - 7, p[1] - 4, 14, 16);
      tctx.fillStyle = '#f97316';
      tctx.beginPath(); tctx.arc(p[0], p[1] - 8, 7, 0, Math.PI * 2); tctx.fill();
      tctx.fillStyle = '#fde68a';
      tctx.beginPath(); tctx.arc(p[0], p[1] - 10, 3.5, 0, Math.PI * 2); tctx.fill();
      tctx.globalAlpha = 0.18;
      tctx.fillStyle = '#fbbf24';
      tctx.beginPath(); tctx.arc(p[0], p[1] - 8, 24, 0, Math.PI * 2); tctx.fill();
      tctx.globalAlpha = 1;
    });

    // 顶部横幅
    var bx = cx - 280, by = 24, bw = 560, bh = 68;
    tctx.fillStyle = '#4a1714';
    tctx.fillRect(bx, by, bw, bh);
    tctx.strokeStyle = '#e8b45a';
    tctx.lineWidth = 3;
    tctx.strokeRect(bx + 4, by + 4, bw - 8, bh - 8);
    tctx.fillStyle = '#ffe7b3';
    tctx.font = 'bold 34px "Microsoft YaHei", sans-serif';
    tctx.textAlign = 'center';
    tctx.fillText('天 下 第 一 武 道 会', cx, by + 36);
    tctx.fillStyle = 'rgba(255,231,179,0.62)';
    tctx.font = '10px "Microsoft YaHei", sans-serif';
    tctx.fillText('WORLD MARTIAL ARTS TOURNAMENT', cx, by + 54);
    tctx.textAlign = 'left';
  }

  function drawArenaGate() {
    var cx = WORLD_W / 2, y = WORLD_H - 104;
    [[cx - 188, '#8a6238'], [cx + 188, '#8a6238']].forEach(function (p) {
      tctx.fillStyle = 'rgba(0,0,0,0.3)';
      tctx.beginPath(); tctx.ellipse(p[0], y + 34, 20, 7, 0, 0, Math.PI * 2); tctx.fill();
      tctx.fillStyle = p[1];
      tctx.fillRect(p[0] - 14, y - 46, 28, 80);
      tctx.fillStyle = '#a4865a';
      tctx.fillRect(p[0] - 14, y - 46, 9, 80);
      tctx.fillStyle = '#f5c76a';
      tctx.beginPath(); tctx.arc(p[0], y - 54, 7, 0, Math.PI * 2); tctx.fill();
    });
    markRect(cx - 204, y - 60, 32, 90);
    markRect(cx + 172, y - 60, 32, 90);
  }

  function drawArenaLive(t) {
    // 观众席旗帜
    for (var i = 0; i < arenaFlags.length; i++) {
      var f = arenaFlags[i];
      var sway = Math.sin(t * 3 + f.ph) * 3;
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(f.x, f.y + 10); ctx.lineTo(f.x, f.y - 10); ctx.stroke();
      ctx.fillStyle = f.c;
      ctx.beginPath();
      ctx.moveTo(f.x, f.y - 10);
      ctx.lineTo(f.x + 12, f.y - 6 + sway);
      ctx.lineTo(f.x, f.y - 1);
      ctx.closePath(); ctx.fill();
    }
    // 观众席闪光灯
    for (var j = 0; j < arenaFlashes.length; j++) {
      var fl = arenaFlashes[j];
      var pulse = Math.sin(t * 2.1 + fl.ph);
      if (pulse > 0.985) {
        ctx.fillStyle = 'rgba(255,255,245,0.9)';
        ctx.fillRect(fl.x, fl.y, 2, 2);
        ctx.globalAlpha = 0.22;
        ctx.beginPath(); ctx.arc(fl.x + 1, fl.y + 1, 8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    // 擂台顶光
    var a = areas[0];
    if (!a) return;
    var cx = a.cx, cy = a.cy;
    var g = ctx.createRadialGradient(cx, cy - 50, 20, cx, cy - 50, 300);
    g.addColorStop(0, 'rgba(255,226,160,0.10)');
    g.addColorStop(1, 'rgba(255,226,160,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy - 50, 300, 0, Math.PI * 2); ctx.fill();
  }

  function drawAreaLabel(a) {
    var color = a.pal.accent;
    tctx.textAlign = 'center';
    tctx.textBaseline = 'middle';
    tctx.font = 'bold 22px "Microsoft YaHei", sans-serif';
    var txt = '第 ' + a.chap.no + ' 章 · ' + a.chap.name;
    var y = a.cy - 292;
    tctx.lineWidth = 5;
    tctx.strokeStyle = 'rgba(8,14,26,0.80)';
    tctx.strokeText(txt, a.cx, y);
    tctx.fillStyle = color;
    tctx.fillText(txt, a.cx, y);
    tctx.font = '12px "Microsoft YaHei", sans-serif';
    tctx.lineWidth = 4;
    tctx.strokeStyle = 'rgba(8,14,26,0.75)';
    tctx.strokeText(a.pal.name, a.cx, y + 24);
    tctx.fillStyle = 'rgba(226,236,248,0.78)';
    tctx.fillText(a.pal.name, a.cx, y + 24);
  }

  function landmarkFootprint(a) {
    var kind = a.landmark;
    var w = 150, h = 100;
    if (kind === 'torii') { w = 150; h = 60; }
    if (kind === 'stones' || kind === 'crystal') { w = 160; h = 110; }
    if (kind === 'bamboo') { w = 140; h = 70; }
    if (kind === 'maze') { w = 190; h = 120; }
    if (kind === 'observatory') { w = 170; h = 110; }
    return { x: a.cx - w / 2, y: a.cy - h / 2 - 26, w: w, h: h };
  }

  function drawLandmark(a) {
    var kind = a.landmark, x = a.cx, y = a.cy - 24, pal = a.pal;
    switch (kind) {
      case 'village': lmVillage(x, y, pal); break;
      case 'pagoda': lmPagoda(x, y, pal); break;
      case 'torii': lmTorii(x, y, pal); break;
      case 'tower': lmTower(x, y, pal); break;
      case 'ruins': lmRuins(x, y, pal); break;
      case 'hut': lmHut(x, y, pal); break;
      case 'stones': lmStones(x, y, pal); break;
      case 'workshop': lmWorkshop(x, y, pal); break;
      case 'bamboo': lmBamboo(x, y, pal); break;
      case 'maze': lmMaze(x, y, pal); break;
      case 'observatory': lmObservatory(x, y, pal); break;
      case 'crystal': lmCrystal(x, y, pal); break;
      default: lmVillage(x, y, pal);
    }
  }

  /* ---- 地标：统一用矩形块搭，保持像素感 ---- */
  function shadow(x, y, w, h) {
    tctx.fillStyle = 'rgba(18,34,20,0.18)';
    tctx.beginPath(); tctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2); tctx.fill();
  }
  function box(x, y, w, h, c) { tctx.fillStyle = c; tctx.fillRect(Math.round(x), Math.round(y), w, h); }
  function roof(x, y, w, h, c1, c2) {
    box(x, y + h * 0.55, w, h * 0.45, c1);
    box(x + w * 0.12, y + h * 0.25, w * 0.76, h * 0.34, c1);
    box(x + w * 0.26, y, w * 0.48, h * 0.28, c2);
  }
  function windowBox(x, y, w, h) {
    box(x, y, w, h, '#1b2b3f');
    box(x + 2, y + 2, w - 4, h - 4, '#ffd166');
  }

  function lmVillage(x, y, pal) {
    shadow(x, y + 34, 74, 16);
    // 左屋
    box(x - 66, y - 4, 58, 38, '#d9c29a');
    roof(x - 72, y - 34, 70, 32, '#b45309', '#d97706');
    box(x - 48, y + 8, 14, 26, '#6b4226');
    windowBox(x - 26, y + 6, 16, 14);
    // 右屋
    box(x + 6, y - 14, 54, 48, '#e2cfa8');
    roof(x, y - 50, 66, 38, '#a16207', '#ca8a04');
    box(x + 24, y + 4, 14, 30, '#6b4226');
    windowBox(x + 42, y - 2, 14, 12);
    // 篱笆
    for (var i = 0; i < 7; i++) box(x - 78 + i * 22, y + 40, 4, 12, '#8b5a2b');
  }

  function lmPagoda(x, y, pal) {
    shadow(x, y + 42, 76, 16);
    box(x - 52, y + 20, 104, 20, '#9ca3af');
    box(x - 44, y - 6, 88, 28, '#e5e7eb');
    box(x - 40, y, 8, 22, '#b45309'); box(x + 32, y, 8, 22, '#b45309');
    roof(x - 62, y - 40, 124, 38, '#b45309', '#dc2626');
    box(x - 30, y - 62, 60, 26, '#e5e7eb');
    roof(x - 46, y - 84, 92, 26, '#b45309', '#dc2626');
    box(x - 2, y - 100, 4, 16, '#fbbf24');
    // 灯笼
    box(x - 48, y + 2, 8, 12, '#dc2626');
    box(x + 40, y + 2, 8, 12, '#dc2626');
  }

  function lmTorii(x, y, pal) {
    shadow(x, y + 30, 70, 12);
    box(x - 54, y - 10, 14, 44, '#dc2626');
    box(x + 40, y - 10, 14, 44, '#dc2626');
    box(x - 74, y - 26, 148, 12, '#b91c1c');
    box(x - 84, y - 34, 168, 8, '#7f1d1d');
    box(x - 58, y - 4, 116, 8, '#b91c1c');
    box(x - 8, y - 30, 16, 26, '#fbbf24');
  }

  function lmTower(x, y, pal) {
    shadow(x, y + 46, 60, 14);
    box(x - 42, y - 20, 84, 66, '#9ca3af');
    box(x - 48, y - 34, 96, 16, '#6b7280');
    for (var i = 0; i < 4; i++) box(x - 44 + i * 24, y - 46, 14, 14, '#6b7280');
    box(x - 18, y + 12, 36, 34, '#374151');
    box(x - 12, y - 10, 10, 14, '#1b2b3f');
    box(x + 6, y - 10, 10, 14, '#1b2b3f');
    box(x - 2, y - 70, 4, 26, '#fbbf24');
    box(x + 2, y - 70, 22, 12, '#38bdf8');
  }

  function lmRuins(x, y, pal) {
    shadow(x, y + 38, 76, 14);
    box(x - 66, y + 8, 132, 18, '#c8b17a');
    // 断柱
    [[-56, -32, 20], [-20, -8, 26], [26, -22, 34], [56, 4, 14]].forEach(function (c) {
      box(x + c[0], y + c[1], 18, c[2] + 20, '#b8a06a');
      box(x + c[0] - 4, y + c[1] - 6, 26, 8, '#d4c08a');
    });
    box(x - 72, y + 26, 28, 10, '#9b8558');
    box(x + 44, y + 30, 22, 8, '#9b8558');
    // 沙尘
    tctx.fillStyle = 'rgba(224,163,74,0.18)';
    tctx.beginPath(); tctx.ellipse(x, y + 26, 96, 22, 0, 0, Math.PI * 2); tctx.fill();
  }

  function lmHut(x, y, pal) {
    shadow(x, y + 34, 62, 14);
    tctx.fillStyle = '#e8f4f6';
    tctx.beginPath(); tctx.arc(x, y, 56, Math.PI, Math.PI * 2); tctx.fill();
    tctx.fillRect(x - 56, y, 112, 34);
    box(x - 56, y + 30, 112, 8, '#b9d4d9');
    tctx.beginPath(); tctx.arc(x - 18, y - 22, 12, 0, Math.PI * 2); tctx.fillStyle = '#cfe6ea'; tctx.fill();
    box(x - 14, y + 8, 28, 28, '#6b4226');
    box(x - 8, y + 16, 16, 6, '#fbbf24');
    // 雪堆
    tctx.fillStyle = '#ffffff';
    tctx.beginPath(); tctx.arc(x - 52, y + 30, 14, 0, Math.PI * 2); tctx.fill();
    tctx.beginPath(); tctx.arc(x + 48, y + 32, 18, 0, Math.PI * 2); tctx.fill();
  }

  function lmStones(x, y, pal) {
    shadow(x, y + 34, 76, 14);
    var hs = [[-64, 46, 22], [-32, 70, 18], [0, 88, 24], [34, 58, 20], [66, 40, 16]];
    hs.forEach(function (s, i) {
      box(x + s[0] - s[2] / 2, y - s[1] + 26, s[2], s[1], i % 2 ? '#8b94a8' : '#a3adc2');
      box(x + s[0] - s[2] / 2 + 4, y - s[1] + 34, s[2] - 8, 6, '#7dd3fc');
    });
    tctx.strokeStyle = 'rgba(125,211,252,0.30)';
    tctx.lineWidth = 2;
    tctx.beginPath(); tctx.ellipse(x, y + 24, 82, 26, 0, 0, Math.PI * 2); tctx.stroke();
  }

  function gear(x, y, r, teeth) {
    tctx.fillStyle = '#8b7355';
    for (var i = 0; i < teeth; i++) {
      var a = i / teeth * Math.PI * 2;
      box(x + Math.cos(a) * r - 3, y + Math.sin(a) * r - 3, 7, 7, '#8b7355');
    }
    tctx.beginPath(); tctx.arc(x, y, r, 0, Math.PI * 2); tctx.fillStyle = '#a89070'; tctx.fill();
    tctx.beginPath(); tctx.arc(x, y, r * 0.42, 0, Math.PI * 2); tctx.fillStyle = '#6b5844'; tctx.fill();
  }

  function lmWorkshop(x, y, pal) {
    shadow(x, y + 36, 70, 14);
    box(x - 62, y - 18, 92, 54, '#c2a887');
    roof(x - 70, y - 46, 108, 32, '#7b4b2a', '#a86a3c');
    box(x - 44, y + 4, 22, 32, '#5b3a22');
    windowBox(x - 10, y + 4, 20, 16);
    box(x + 44, y - 60, 18, 62, '#8b7355');
    box(x + 40, y - 66, 26, 8, '#6b5844');
    gear(x + 22, y + 4, 20, 8);
    gear(x + 54, y - 18, 12, 6);
    // 烟
    tctx.fillStyle = 'rgba(220,220,220,0.25)';
    tctx.beginPath(); tctx.arc(x + 53, y - 80, 9, 0, Math.PI * 2); tctx.fill();
    tctx.beginPath(); tctx.arc(x + 40, y - 94, 7, 0, Math.PI * 2); tctx.fill();
  }

  function lmBamboo(x, y, pal) {
    shadow(x, y + 30, 66, 12);
    for (var i = 0; i < 7; i++) {
      var bx = x - 60 + i * 20 + (i % 2) * 5;
      var h = 80 + (i * 13) % 34;
      box(bx, y - h + 28, 8, h, i % 2 ? '#4d8b3f' : '#5aa34a');
      for (var s = 1; s < 4; s++) box(bx, y - h + 28 + s * (h / 4), 8, 3, '#3f7334');
      box(bx - 10, y - h + 36, 12, 4, '#7bc45e');
      box(bx + 8, y - h + 52, 12, 4, '#7bc45e');
    }
    box(x - 74, y + 20, 148, 10, '#8b6b45');
  }

  function lmMaze(x, y, pal) {
    shadow(x, y + 40, 94, 16);
    var hedge = '#3f7d46', hedge2 = '#4f9a54';
    box(x - 90, y - 20, 180, 16, hedge);
    box(x - 90, y - 20, 16, 60, hedge);
    box(x + 74, y - 20, 16, 60, hedge);
    box(x - 40, y + 24, 114, 16, hedge);
    box(x - 40, y - 2, 16, 42, hedge);
    box(x + 20, y + 2, 16, 38, hedge);
    box(x + 44, y + 2, 46, 14, hedge);
    // 顶部亮边
    [[-90, -20, 180, 4], [-90, 24, 180, 4], [-40, 40, 114, 4]].forEach(function (b) {
      box(x + b[0], y + b[1], b[2], b[3], hedge2);
    });
    // 中心宝箱
    box(x - 10, y + 32, 18, 12, '#a16207');
    box(x - 10, y + 32, 18, 4, '#fbbf24');
  }

  function lmObservatory(x, y, pal) {
    shadow(x, y + 38, 76, 14);
    box(x - 60, y - 4, 120, 44, '#c9d6e3');
    box(x - 60, y + 34, 120, 8, '#8fa3b8');
    tctx.fillStyle = '#dbeafe';
    tctx.beginPath(); tctx.arc(x, y - 6, 48, Math.PI, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#93c5fd';
    tctx.beginPath(); tctx.arc(x, y - 6, 48, Math.PI * 1.1, Math.PI * 1.4); tctx.fill();
    box(x - 8, y - 58, 16, 14, '#64748b');
    // 望远镜
    tctx.save();
    tctx.translate(x + 22, y - 48);
    tctx.rotate(-0.6);
    box(-26, -5, 52, 10, '#475569');
    box(24, -7, 12, 14, '#38bdf8');
    tctx.restore();
    box(x - 10, y + 12, 20, 26, '#64748b');
  }

  function lmCrystal(x, y, pal) {
    shadow(x, y + 34, 72, 14);
    var crystals = [
      [0, 96, 26, '#a78bfa'], [-34, 62, 18, '#c4b5fd'], [32, 72, 20, '#8b5cf6'],
      [-58, 40, 14, '#7c3aed'], [58, 44, 14, '#7c3aed']
    ];
    crystals.forEach(function (c) {
      var cx = x + c[0], h = c[1], w = c[2];
      tctx.fillStyle = c[3];
      tctx.beginPath();
      tctx.moveTo(cx, y - h);
      tctx.lineTo(cx + w / 2, y - h * 0.45);
      tctx.lineTo(cx + w / 2, y + 26);
      tctx.lineTo(cx - w / 2, y + 26);
      tctx.lineTo(cx - w / 2, y - h * 0.45);
      tctx.closePath();
      tctx.fill();
      tctx.fillStyle = 'rgba(255,255,255,0.35)';
      tctx.fillRect(cx - w / 4, y - h * 0.55, 4, h * 0.5);
    });
    tctx.fillStyle = 'rgba(196,181,253,0.16)';
    tctx.beginPath(); tctx.ellipse(x, y + 18, 94, 30, 0, 0, Math.PI * 2); tctx.fill();
  }

  /* ============================================================
   * 3.5 场景装饰：每个场景一套专属道具与植被
   * ============================================================ */
  function decorSpot(r, minR, maxR) {
    var a = areas[Math.floor(r() * areas.length)] || areas[0];
    if (!a) return null;
    var ang = r() * Math.PI * 2;
    var rad = (minR + r() * (maxR - minR)) * MAP_S;
    var x = a.cx + Math.cos(ang) * rad;
    var y = a.cy + Math.sin(ang) * rad * 0.82;
    return { x: x, y: y, a: a };
  }

  function decorOK(p) {
    if (!p) return false;
    if (p.x < 30 || p.y < 30 || p.x > WORLD_W - 30 || p.y > WORLD_H - 30) return false;
    if (inSpawnLane(p.x, p.y)) return false;
    if (blockedAt(p.x, p.y)) return false;
    if (distToPath(p.x, p.y) < 54) return false;
    if (nearNpc(p.x, p.y, 56)) return false;
    if (Math.hypot(p.x - p.a.cx, (p.y - p.a.cy) / 0.82) < 150) return false;
    return true;
  }

  function decorBlock(p, w, h) {
    markRect(p.x - (w || 22), p.y - (h || 16), (w || 22) * 2, (h || 16) * 2);
  }

  function drawDecor(r, sc) {
    switch (sc.theme) {
      case 'market': decorMarket(r, sc); break;
      case 'celestial': decorCelestial(r, sc); break;
      case 'snow': decorSnow(r, sc); break;
      case 'city': decorCity(r, sc); break;
      case 'island': decorIsland(r, sc); break;
      case 'palace': decorPalace(r, sc); break;
    }
  }

  /* ---- 营地两侧的小地标：水井 / 告示牌 / 拱桥 / 浮岛 / 冰拱 / 冻湖 …… ---- */
  function drawSubLandmarks(sc) {
    areas.forEach(function (a) {
      var spots = [
        { x: a.cx - 600, y: a.cy + 110, k: 0 },
        { x: a.cx + 602, y: a.cy - 40, k: 1 },
        { x: a.cx, y: a.cy + 430, k: 2 }
      ];
      spots.forEach(function (p) {
        if (!decorOK({ x: p.x, y: p.y, a: a })) return;
        switch (sc.theme) {
          case 'market': p.k === 0 ? subWell(p.x, p.y) : (p.k === 1 ? subNotice(p.x, p.y) : subCampfire(p.x, p.y)); break;
          case 'celestial': p.k === 0 ? subBridge(p.x, p.y) : (p.k === 1 ? subFloatingIsle(p.x, p.y) : subStairs(p.x, p.y)); break;
          case 'snow': p.k === 0 ? subIceArch(p.x, p.y) : (p.k === 1 ? subSnowPond(p.x, p.y) : subSled(p.x, p.y)); break;
          case 'city': p.k === 0 ? subNeon(p.x, p.y) : (p.k === 1 ? subVending(p.x, p.y) : subArcade(p.x, p.y)); break;
          case 'island': p.k === 0 ? subDock(p.x, p.y) : (p.k === 1 ? subStoneLantern(p.x, p.y) : subRowboat(p.x, p.y)); break;
          case 'palace': p.k === 0 ? subCrystalPillar(p.x, p.y) : (p.k === 1 ? subStarPool(p.x, p.y) : subFountain(p.x, p.y)); break;
        }
      });
    });
  }

  function subWell(x, y) {
    shadow(x, y + 16, 26, 9);
    box(x - 18, y - 4, 36, 22, '#8b7355');
    box(x - 13, y, 26, 12, '#2f6f86');
    box(x - 20, y - 22, 4, 20, '#8b5a2b'); box(x + 16, y - 22, 4, 20, '#8b5a2b');
    box(x - 25, y - 28, 50, 6, '#b45309');
    box(x - 2, y - 38, 4, 12, '#6b7280');
    box(x - 9, y - 44, 18, 7, '#b91c1c');
    markRect(x - 20, y - 12, 40, 34);
  }

  function subNotice(x, y) {
    shadow(x, y + 16, 24, 7);
    box(x - 2, y - 4, 4, 24, '#8b5a2b');
    box(x - 24, y - 26, 48, 26, '#b98a55');
    box(x - 21, y - 23, 42, 20, '#e2c08d');
    box(x - 16, y - 18, 14, 10, '#f8fafc');
    box(x + 3, y - 18, 12, 10, '#f8fafc');
    box(x - 14, y - 15, 10, 1, '#64748b'); box(x - 14, y - 12, 8, 1, '#64748b');
    markRect(x - 25, y - 30, 50, 48);
  }

  function subBridge(x, y) {
    shadow(x, y + 12, 48, 9);
    for (var i = 0; i < 7; i++) {
      var h = 8 + Math.round(Math.sin(i / 6 * Math.PI) * 10);
      box(x - 42 + i * 12, y - h, 12, h + 8, '#cbd5e1');
    }
    box(x - 46, y - 27, 4, 16, '#b91c1c'); box(x + 42, y - 27, 4, 16, '#b91c1c');
    box(x - 48, y - 31, 24, 4, '#f8fafc'); box(x + 24, y - 31, 24, 4, '#f8fafc');
    markRect(x - 44, y - 16, 88, 28);
  }

  function subFloatingIsle(x, y) {
    box(x - 24, y - 2, 48, 12, '#94a3b8');
    box(x - 18, y + 10, 36, 8, '#64748b');
    box(x - 10, y + 18, 20, 6, '#475569');
    box(x - 5, y - 18, 10, 18, '#a5f3fc');
    box(x - 2, y - 24, 4, 6, '#e0f2fe');
    markRect(x - 26, y - 20, 52, 42);
  }

  function subIceArch(x, y) {
    shadow(x, y + 18, 34, 9);
    box(x - 30, y - 14, 8, 34, '#bfe8f7');
    box(x + 22, y - 14, 8, 34, '#bfe8f7');
    box(x - 34, y - 30, 68, 8, '#dff4fd');
    box(x - 26, y - 36, 52, 7, '#eaf9ff');
    box(x - 2, y - 42, 4, 8, '#a5f3fc');
    markRect(x - 32, y - 16, 64, 36);
  }

  function subSnowPond(x, y) {
    tctx.fillStyle = 'rgba(180,225,245,0.55)';
    tctx.beginPath(); tctx.ellipse(x, y, 40, 18, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = 'rgba(235,250,255,0.75)';
    tctx.beginPath(); tctx.ellipse(x - 6, y - 2, 26, 10, 0, 0, Math.PI * 2); tctx.fill();
    tctx.strokeStyle = 'rgba(120,170,200,0.55)'; tctx.lineWidth = 1;
    tctx.beginPath(); tctx.moveTo(x - 30, y + 2); tctx.lineTo(x - 8, y - 1); tctx.lineTo(x + 8, y + 3); tctx.lineTo(x + 30, y); tctx.stroke();
  }

  function subNeon(x, y) {
    shadow(x, y + 18, 9, 5);
    box(x - 2, y - 34, 4, 54, '#475569');
    box(x - 18, y - 46, 36, 18, '#111827');
    box(x - 15, y - 43, 30, 12, '#f472b6');
    box(x - 11, y - 40, 22, 3, '#fdf2f8');
    box(x - 11, y - 35, 14, 2, '#fdf2f8');
    markRect(x - 8, y - 8, 16, 28);
  }

  function subVending(x, y) {
    shadow(x, y + 18, 15, 6);
    box(x - 14, y - 26, 28, 44, '#1e293b');
    box(x - 10, y - 22, 20, 24, '#38bdf8');
    for (var r = 0; r < 2; r++) for (var c = 0; c < 3; c++) box(x - 8 + c * 6, y - 19 + r * 9, 4, 6, '#f8fafc');
    box(x - 8, y + 6, 16, 7, '#0f172a');
    markRect(x - 16, y - 28, 32, 48);
  }

  function subDock(x, y) {
    tctx.fillStyle = 'rgba(150,110,70,0.35)';
    tctx.fillRect(x - 38, y - 6, 76, 26);
    for (var i = 0; i < 6; i++) box(x - 36 + i * 12, y - 8, 10, 20, '#a16207');
    box(x - 40, y + 10, 80, 4, '#8b5a2b');
    box(x - 38, y - 22, 5, 30, '#6b4226'); box(x + 33, y - 22, 5, 30, '#6b4226');
    markRect(x - 38, y - 10, 76, 26);
  }

  function subStoneLantern(x, y) {
    shadow(x, y + 15, 13, 5);
    box(x - 8, y - 2, 16, 15, '#94a3b8');
    box(x - 11, y - 10, 22, 8, '#cbd5e1');
    box(x - 8, y - 24, 16, 14, '#64748b');
    box(x - 5, y - 21, 10, 8, '#fde68a');
    box(x - 12, y - 28, 24, 5, '#94a3b8');
    markRect(x - 12, y - 26, 24, 40);
  }

  function subCrystalPillar(x, y) {
    shadow(x, y + 20, 15, 6);
    box(x - 12, y + 6, 24, 14, '#312a55');
    box(x - 7, y - 30, 14, 38, '#8f7dd6');
    box(x - 4, y - 36, 8, 10, '#c4b5fd');
    box(x - 3, y - 24, 4, 20, '#e9e2ff');
    box(x - 15, y - 2, 6, 10, '#7dd3fc');
    markRect(x - 13, y - 34, 26, 52);
  }

  function subStarPool(x, y) {
    tctx.fillStyle = 'rgba(40,70,120,0.55)';
    tctx.beginPath(); tctx.ellipse(x, y, 42, 18, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = 'rgba(125,211,252,0.25)';
    tctx.beginPath(); tctx.ellipse(x, y - 2, 30, 11, 0, 0, Math.PI * 2); tctx.fill();
    var stars = [[-26, 2], [-12, -4], [2, 3], [16, -2], [28, 4], [-4, -7], [22, 7]];
    stars.forEach(function (s) {
      tctx.fillStyle = 'rgba(224,242,254,0.9)';
      tctx.fillRect(x + s[0], y + s[1], 2, 2);
    });
  }

  function subCampfire(x, y) {
    shadow(x, y + 12, 26, 8);
    for (var i = 0; i < 8; i++) {
      var ang = i / 8 * Math.PI * 2;
      box(x + Math.cos(ang) * 22 - 3, y + Math.sin(ang) * 10 - 3, 6, 6, '#94a3b8');
    }
    box(x - 16, y - 2, 32, 6, '#8b5a2b');
    box(x - 6, y - 8, 12, 6, '#a16207');
    box(x - 6, y - 20, 12, 14, '#f97316');
    box(x - 3, y - 26, 6, 10, '#fbbf24');
    box(x - 1, y - 16, 2, 6, '#fef3c7');
    tctx.globalAlpha = 0.16;
    tctx.fillStyle = '#fbbf24';
    tctx.beginPath(); tctx.arc(x, y - 12, 34, 0, Math.PI * 2); tctx.fill();
    tctx.globalAlpha = 1;
    markRect(x - 20, y - 10, 40, 24);
  }

  function subStairs(x, y) {
    shadow(x, y + 22, 34, 8);
    for (var i = 0; i < 4; i++) {
      box(x - 34 + i * 4, y + 14 - i * 12, 68 - i * 8, 12, i % 2 ? '#e2e8f0' : '#cbd5e1');
    }
    box(x - 38, y - 34, 5, 20, '#f8fafc'); box(x + 33, y - 34, 5, 20, '#f8fafc');
    box(x - 40, y - 38, 16, 4, '#fbbf24'); box(x + 24, y - 38, 16, 4, '#fbbf24');
    markRect(x - 36, y - 18, 72, 40);
  }

  function subSled(x, y) {
    shadow(x, y + 12, 30, 7);
    box(x - 28, y - 6, 56, 6, '#8b5a2b');
    box(x - 22, y - 16, 44, 10, '#a16207');
    box(x - 30, y + 2, 60, 4, '#64748b');
    box(x - 34, y - 2, 6, 8, '#94a3b8'); box(x + 28, y - 2, 6, 8, '#94a3b8');
    box(x - 20, y - 22, 8, 8, '#e2c08d');
    markRect(x - 30, y - 18, 60, 28);
  }

  function subArcade(x, y) {
    shadow(x, y + 18, 15, 6);
    box(x - 15, y - 30, 30, 48, '#0f172a');
    box(x - 12, y - 26, 24, 20, '#111827');
    box(x - 10, y - 24, 20, 16, '#22d3ee');
    box(x - 7, y - 21, 14, 3, '#a5f3fc');
    box(x - 7, y - 15, 9, 2, '#a5f3fc');
    box(x - 10, y - 2, 20, 8, '#1e293b');
    box(x - 7, y, 4, 4, '#f472b6');
    box(x + 3, y, 4, 4, '#fbbf24');
    tctx.globalAlpha = 0.18;
    tctx.fillStyle = '#22d3ee';
    tctx.beginPath(); tctx.arc(x, y - 16, 26, 0, Math.PI * 2); tctx.fill();
    tctx.globalAlpha = 1;
    markRect(x - 16, y - 32, 32, 50);
  }

  function subRowboat(x, y) {
    shadow(x, y + 10, 32, 7);
    tctx.fillStyle = '#8b5a2b';
    tctx.beginPath();
    tctx.moveTo(x - 34, y - 4); tctx.lineTo(x + 34, y - 4);
    tctx.lineTo(x + 22, y + 10); tctx.lineTo(x - 22, y + 10);
    tctx.closePath(); tctx.fill();
    box(x - 30, y - 8, 60, 5, '#a16207');
    box(x - 26, y - 12, 52, 4, '#c8a06a');
    box(x + 26, y - 18, 4, 22, '#6b4226');
    box(x + 14, y - 22, 26, 4, '#94a3b8');
    markRect(x - 34, y - 10, 68, 24);
  }

  function subFountain(x, y) {
    shadow(x, y + 16, 34, 9);
    tctx.fillStyle = '#312a55';
    tctx.beginPath(); tctx.ellipse(x, y + 4, 40, 16, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#3f6fa8';
    tctx.beginPath(); tctx.ellipse(x, y + 2, 33, 12, 0, 0, Math.PI * 2); tctx.fill();
    box(x - 10, y - 20, 20, 22, '#8f7dd6');
    box(x - 14, y - 24, 28, 6, '#c4b5fd');
    box(x - 4, y - 34, 8, 12, '#e9e2ff');
    tctx.fillStyle = 'rgba(125,211,252,0.55)';
    tctx.fillRect(x - 2, y - 30, 4, 12);
    tctx.fillStyle = 'rgba(224,242,254,0.8)';
    tctx.fillRect(x - 12, y - 10, 3, 3); tctx.fillRect(x + 9, y - 8, 3, 3);
    tctx.globalAlpha = 0.16;
    tctx.fillStyle = '#7dd3fc';
    tctx.beginPath(); tctx.arc(x, y - 8, 38, 0, Math.PI * 2); tctx.fill();
    tctx.globalAlpha = 1;
    markRect(x - 16, y - 30, 32, 42);
  }



  function decorMarket(r, sc) {
    // 集市摊位：每个营地 3 个，沿营地外圈摆
    ['#e05252', '#3f8fbf', '#e0a13c'].forEach(function (c, k) {
      areas.forEach(function (a, ai) {
        var ang = -Math.PI * 0.82 + k * Math.PI * 0.55 + ai * 0.3;
        var x = a.cx + Math.cos(ang) * 272 * MAP_S;
        var y = a.cy + Math.sin(ang) * 272 * MAP_S * 0.82;
        var p = { x: x, y: y, a: a };
        if (!decorOK(p)) return;
        drawStall(x, y, c);
        decorBlock(p, 42, 22);
      });
    });
    // 木桶 / 板条箱 / 花圃
    for (var i = 0; i < 26; i++) {
      var p = decorSpot(r, 150, 300);
      if (!decorOK(p)) continue;
      var t = r();
      if (t < 0.34) { drawBarrel(p.x, p.y); markRect(p.x - 9, p.y - 10, 18, 18); }
      else if (t < 0.62) { drawCrate(p.x, p.y); markRect(p.x - 11, p.y - 8, 22, 16); }
      else drawFlowerBed(p.x, p.y, p.a.pal);
    }
    // 栅栏：沿营地外圈断断续续
    areas.forEach(function (a) {
      for (var k = 0; k < 14; k++) {
        var ang = -0.2 + k * 0.16;
        if (k % 5 === 4) continue;
        var x = a.cx + Math.cos(ang) * 312 * MAP_S;
        var y = a.cy + Math.sin(ang) * 312 * MAP_S * 0.82;
        if (y > WORLD_H - 130) continue;
        drawFenceBit(x, y);
        markRect(x - 12, y - 10, 24, 14);
      }
    });
  }

  function decorCelestial(r, sc) {
    // 云朵（不挡路）
    for (var i = 0; i < 26; i++) {
      var p = decorSpot(r, 120, 420);
      if (!p || p.x < 40 || p.y < 40 || p.x > WORLD_W - 40 || p.y > WORLD_H - 40) continue;
      drawCloudPuff(p.x, p.y, 0.7 + r() * 0.9);
    }
    // 白玉柱
    for (var j = 0; j < 12; j++) {
      var q = decorSpot(r, 170, 280);
      if (!decorOK(q)) continue;
      drawMarblePillar(q.x, q.y);
      decorBlock(q, 14, 14);
    }
    // 浮空石台
    for (var k = 0; k < 8; k++) {
      var s = decorSpot(r, 250, 330);
      if (!decorOK(s)) continue;
      drawFloatRock(s.x, s.y);
    }
    // 莲花灯
    for (var m = 0; m < 12; m++) {
      var f = decorSpot(r, 140, 290);
      if (!decorOK(f)) continue;
      drawGlowFlower(f.x, f.y, '#bae6fd');
    }
  }

  function decorSnow(r, sc) {
    for (var i = 0; i < 5; i++) {
      var p = decorSpot(r, 170, 270);
      if (!decorOK(p)) continue;
      drawSnowman(p.x, p.y);
      decorBlock(p, 18, 16);
    }
    for (var j = 0; j < 22; j++) {
      var q = decorSpot(r, 130, 300);
      if (!decorOK(q)) continue;
      drawIceShard(q.x, q.y, 0.6 + r() * 0.8);
    }
    for (var k = 0; k < 10; k++) {
      var s = decorSpot(r, 160, 290);
      if (!decorOK(s)) continue;
      drawSnowPile(s.x, s.y);
    }
  }

  function decorCity(r, sc) {
    // 路灯
    for (var i = 0; i < 12; i++) {
      var p = decorSpot(r, 160, 300);
      if (!decorOK(p)) continue;
      drawLampPost(p.x, p.y, i % 2 ? '#f472b6' : '#38bdf8');
      decorBlock(p, 12, 12);
    }
    // 自动售货机 / 街机
    for (var j = 0; j < 6; j++) {
      var q = decorSpot(r, 190, 300);
      if (!decorOK(q)) continue;
      if (j % 2) drawVending(q.x, q.y, '#f472b6');
      else drawVending(q.x, q.y, '#38bdf8');
      decorBlock(q, 18, 16);
    }
    // 长椅 / 花箱 / 霓虹牌
    for (var k = 0; k < 18; k++) {
      var s = decorSpot(r, 150, 320);
      if (!decorOK(s)) continue;
      if (k % 3 === 0) { drawBench(s.x, s.y); markRect(s.x - 18, s.y - 6, 36, 12); }
      else if (k % 3 === 1) drawPlanter(s.x, s.y);
      else { drawNeonBoard(s.x, s.y, k % 2 ? '#f472b6' : '#fbbf24'); markRect(s.x - 14, s.y - 5, 28, 14); }
    }
    // 井盖已经画在地面，撒一点霓虹纸屑
    for (var m = 0; m < 40; m++) {
      var n = decorSpot(r, 60, 330);
      if (!n) continue;
      tctx.fillStyle = m % 3 === 0 ? 'rgba(244,114,182,0.5)' : (m % 3 === 1 ? 'rgba(56,189,248,0.5)' : 'rgba(251,191,36,0.45)');
      tctx.fillRect(Math.floor(n.x), Math.floor(n.y), 2, 2);
    }
  }

  function decorIsland(r, sc) {
    // 礁石
    for (var i = 0; i < 18; i++) {
      var p = decorSpot(r, 200, 330);
      if (!decorOK(p)) continue;
      drawBeachRock(p.x, p.y, 0.7 + r() * 1.1);
      decorBlock(p, 16, 12);
    }
    // 海星 / 贝壳
    for (var j = 0; j < 24; j++) {
      var q = decorSpot(r, 100, 300);
      if (!decorOK(q)) continue;
      if (j % 2) drawStarfish(q.x, q.y);
      else drawShell(q.x, q.y);
    }
    // 漂木
    for (var k = 0; k < 6; k++) {
      var s = decorSpot(r, 180, 300);
      if (!decorOK(s)) continue;
      drawDriftwood(s.x, s.y);
    }
    // 草丛
    for (var m = 0; m < 70; m++) {
      var n = decorSpot(r, 90, 320);
      if (!n) continue;
      tctx.fillStyle = n.a.pal.g1;
      tctx.fillRect(Math.floor(n.x), Math.floor(n.y), 2, 5);
      tctx.fillRect(Math.floor(n.x + 3), Math.floor(n.y + 1), 2, 4);
      tctx.fillRect(Math.floor(n.x - 2), Math.floor(n.y + 2), 2, 3);
    }
  }

  function decorPalace(r, sc) {
    for (var i = 0; i < 16; i++) {
      var p = decorSpot(r, 150, 310);
      if (!decorOK(p)) continue;
      drawCrystalCluster(p.x, p.y, 0.7 + r() * 1.0, r() < 0.5 ? '#7dd3fc' : '#c4b5fd');
      decorBlock(p, 18, 14);
    }
    for (var j = 0; j < 18; j++) {
      var q = decorSpot(r, 120, 320);
      if (!decorOK(q)) continue;
      drawGlowFlower(q.x, q.y, q.a.pal.accent);
    }
    for (var k = 0; k < 8; k++) {
      var s = decorSpot(r, 190, 320);
      if (!decorOK(s)) continue;
      drawFloatLantern(s.x, s.y, k % 2 ? '#7dd3fc' : '#c4b5fd');
    }
    // 地面符文圈
    for (var m = 0; m < 4; m++) {
      var n = decorSpot(r, 210, 300);
      if (!n) continue;
      tctx.strokeStyle = 'rgba(125,211,252,0.28)';
      tctx.lineWidth = 2;
      tctx.beginPath(); tctx.arc(n.x, n.y, 26, 0, Math.PI * 2); tctx.stroke();
      tctx.beginPath(); tctx.arc(n.x, n.y, 34, 0.4, 2.2); tctx.stroke();
    }
  }

  /* ---- 场景道具 ---- */
  function drawStall(x, y, c) {
    tctx.fillStyle = 'rgba(20,16,10,0.20)';
    tctx.beginPath(); tctx.ellipse(x, y + 16, 42, 10, 0, 0, Math.PI * 2); tctx.fill();
    // 立柱
    tctx.fillStyle = '#6b4226';
    tctx.fillRect(x - 38, y - 12, 5, 28);
    tctx.fillRect(x + 33, y - 12, 5, 28);
    // 柜台
    tctx.fillStyle = '#8b5a2b'; tctx.fillRect(x - 40, y + 6, 80, 12);
    tctx.fillStyle = '#a97140'; tctx.fillRect(x - 40, y + 6, 80, 3);
    // 条纹雨棚
    for (var i = 0; i < 8; i++) {
      tctx.fillStyle = i % 2 ? '#f8f4e6' : c;
      tctx.fillRect(x - 42 + i * 11, y - 30, 11, 20);
    }
    tctx.fillStyle = 'rgba(255,255,255,0.35)';
    tctx.fillRect(x - 42, y - 30, 88, 3);
    // 摊上的货
    tctx.fillStyle = '#e8b04b'; tctx.fillRect(x - 26, y - 6, 12, 10);
    tctx.fillStyle = '#c94f4f'; tctx.fillRect(x - 8, y - 5, 10, 9);
    tctx.fillStyle = '#7bbf5a'; tctx.fillRect(x + 8, y - 4, 10, 8);
    // 吊灯
    tctx.fillStyle = '#f6d365'; tctx.fillRect(x + 20, y - 20, 7, 8);
    tctx.fillStyle = 'rgba(246,211,101,0.25)';
    tctx.beginPath(); tctx.arc(x + 23, y - 16, 12, 0, Math.PI * 2); tctx.fill();
  }

  function drawBarrel(x, y) {
    tctx.fillStyle = 'rgba(20,16,10,0.18)';
    tctx.beginPath(); tctx.ellipse(x, y + 8, 9, 4, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#8b5a2b'; tctx.fillRect(x - 8, y - 10, 16, 18);
    tctx.fillStyle = '#6b4226'; tctx.fillRect(x - 8, y - 4, 16, 2); tctx.fillRect(x - 8, y + 4, 16, 2);
    tctx.fillStyle = '#a97140'; tctx.fillRect(x - 8, y - 10, 16, 3);
  }

  function drawCrate(x, y) {
    tctx.fillStyle = 'rgba(20,16,10,0.18)';
    tctx.beginPath(); tctx.ellipse(x, y + 8, 11, 4, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#b08048'; tctx.fillRect(x - 11, y - 8, 22, 16);
    tctx.strokeStyle = '#7a5326'; tctx.lineWidth = 2;
    tctx.strokeRect(x - 11, y - 8, 22, 16);
    tctx.beginPath(); tctx.moveTo(x - 11, y - 8); tctx.lineTo(x + 11, y + 8); tctx.stroke();
  }

  function drawFlowerBed(x, y, pal) {
    tctx.fillStyle = 'rgba(60,45,25,0.35)';
    tctx.fillRect(x - 14, y - 4, 28, 9);
    var cols = ['#fbbf24', '#fb7185', '#f8fafc', '#c4b5fd'];
    for (var i = 0; i < 7; i++) {
      tctx.fillStyle = cols[i % cols.length];
      tctx.fillRect(x - 12 + i * 4, y - 8 - (i % 2) * 2, 3, 3);
    }
    tctx.fillStyle = pal.dark;
    tctx.fillRect(x - 13, y + 2, 26, 2);
  }

  function drawFenceBit(x, y) {
    tctx.fillStyle = '#8b5a2b';
    tctx.fillRect(x - 10, y - 10, 3, 14);
    tctx.fillRect(x + 7, y - 10, 3, 14);
    tctx.fillRect(x - 12, y - 5, 24, 3);
  }

  function drawCloudPuff(x, y, s) {
    tctx.fillStyle = 'rgba(255,255,255,0.55)';
    tctx.beginPath();
    tctx.ellipse(x - 16 * s, y, 20 * s, 10 * s, 0, 0, Math.PI * 2);
    tctx.ellipse(x + 10 * s, y - 4 * s, 24 * s, 12 * s, 0, 0, Math.PI * 2);
    tctx.ellipse(x, y + 3 * s, 30 * s, 11 * s, 0, 0, Math.PI * 2);
    tctx.fill();
    tctx.fillStyle = 'rgba(190,225,245,0.35)';
    tctx.beginPath(); tctx.ellipse(x, y + 8 * s, 30 * s, 7 * s, 0, 0, Math.PI * 2); tctx.fill();
  }

  function drawMarblePillar(x, y) {
    tctx.fillStyle = 'rgba(40,60,90,0.18)';
    tctx.beginPath(); tctx.ellipse(x, y + 6, 12, 5, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#e6f3fa'; tctx.fillRect(x - 8, y - 42, 16, 46);
    tctx.fillStyle = '#c6dcea'; tctx.fillRect(x - 8, y - 42, 4, 46);
    tctx.fillStyle = '#f8fdff'; tctx.fillRect(x - 11, y - 48, 22, 8);
    tctx.fillStyle = '#d6e8f2'; tctx.fillRect(x - 11, y + 1, 22, 5);
    tctx.fillStyle = 'rgba(125,211,252,0.5)';
    tctx.fillRect(x - 2, y - 40, 4, 40);
  }

  function drawFloatRock(x, y) {
    tctx.fillStyle = 'rgba(60,100,130,0.14)';
    tctx.beginPath(); tctx.ellipse(x, y + 20, 34, 8, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#7a93a8';
    tctx.beginPath();
    tctx.moveTo(x - 26, y); tctx.lineTo(x - 12, y - 14); tctx.lineTo(x + 14, y - 12);
    tctx.lineTo(x + 26, y + 2); tctx.lineTo(x + 10, y + 8); tctx.lineTo(x - 14, y + 8);
    tctx.closePath(); tctx.fill();
    tctx.fillStyle = '#5f7b91';
    tctx.beginPath();
    tctx.moveTo(x - 12, y - 14); tctx.lineTo(x + 14, y - 12); tctx.lineTo(x + 4, y - 2);
    tctx.closePath(); tctx.fill();
    tctx.fillStyle = '#7fc45a';
    tctx.fillRect(x - 18, y - 14, 16, 4);
    tctx.fillRect(x + 2, y - 13, 12, 3);
  }

  function drawGlowFlower(x, y, c) {
    tctx.fillStyle = 'rgba(0,0,0,0.15)';
    tctx.fillRect(x, y + 2, 2, 4);
    tctx.fillStyle = c;
    tctx.fillRect(x - 2, y - 2, 6, 6);
    tctx.fillStyle = 'rgba(255,255,255,0.75)';
    tctx.fillRect(x, y, 2, 2);
    tctx.globalAlpha = 0.18;
    tctx.fillStyle = c;
    tctx.beginPath(); tctx.arc(x + 1, y + 1, 9, 0, Math.PI * 2); tctx.fill();
    tctx.globalAlpha = 1;
  }

  function drawSnowman(x, y) {
    tctx.fillStyle = 'rgba(30,60,80,0.15)';
    tctx.beginPath(); tctx.ellipse(x, y + 8, 14, 5, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#f8fdff';
    tctx.beginPath(); tctx.arc(x, y + 1, 11, 0, Math.PI * 2); tctx.fill();
    tctx.beginPath(); tctx.arc(x, y - 12, 7, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#cfe4ee';
    tctx.beginPath(); tctx.arc(x + 3, y + 3, 9, 0, Math.PI); tctx.fill();
    tctx.fillStyle = '#f97316';
    tctx.fillRect(x + 1, y - 13, 6, 2);
    tctx.fillStyle = '#1f2937';
    tctx.fillRect(x - 3, y - 14, 2, 2);
    tctx.fillRect(x + 2, y - 14, 2, 2);
    // 围巾
    tctx.fillStyle = '#e05252';
    tctx.fillRect(x - 7, y - 7, 14, 3);
    tctx.fillRect(x + 4, y - 4, 3, 8);
  }

  function drawIceShard(x, y, s) {
    tctx.fillStyle = 'rgba(150,200,225,0.30)';
    tctx.beginPath(); tctx.ellipse(x, y + 3, 9 * s, 3 * s, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = 'rgba(190,230,250,0.9)';
    tctx.beginPath();
    tctx.moveTo(x, y - 20 * s); tctx.lineTo(x + 5 * s, y); tctx.lineTo(x, y + 3 * s);
    tctx.lineTo(x - 5 * s, y); tctx.closePath(); tctx.fill();
    tctx.fillStyle = 'rgba(255,255,255,0.7)';
    tctx.fillRect(x - 1, y - 14 * s, 2, 10 * s);
  }

  function drawSnowPile(x, y) {
    tctx.fillStyle = 'rgba(255,255,255,0.75)';
    tctx.beginPath(); tctx.ellipse(x, y, 22, 8, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = 'rgba(180,215,235,0.35)';
    tctx.beginPath(); tctx.ellipse(x + 4, y + 4, 18, 5, 0, 0, Math.PI * 2); tctx.fill();
  }

  function drawLampPost(x, y, c) {
    tctx.fillStyle = 'rgba(10,16,28,0.35)';
    tctx.beginPath(); tctx.ellipse(x, y + 4, 9, 4, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#243244'; tctx.fillRect(x - 2, y - 44, 5, 48);
    tctx.fillStyle = '#37485e'; tctx.fillRect(x - 8, y - 48, 17, 8);
    tctx.fillStyle = c; tctx.fillRect(x - 5, y - 46, 11, 4);
    tctx.globalAlpha = 0.20;
    tctx.fillStyle = c;
    tctx.beginPath(); tctx.arc(x, y - 44, 22, 0, Math.PI * 2); tctx.fill();
    tctx.globalAlpha = 1;
  }

  function drawVending(x, y, c) {
    tctx.fillStyle = 'rgba(10,16,28,0.35)';
    tctx.beginPath(); tctx.ellipse(x, y + 4, 14, 5, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#1f2937'; tctx.fillRect(x - 14, y - 38, 28, 42);
    tctx.fillStyle = c; tctx.fillRect(x - 11, y - 34, 22, 18);
    tctx.fillStyle = 'rgba(255,255,255,0.75)';
    for (var i = 0; i < 3; i++) for (var j = 0; j < 2; j++) tctx.fillRect(x - 8 + j * 9, y - 31 + i * 5, 5, 3);
    tctx.fillStyle = '#0f172a'; tctx.fillRect(x - 8, y - 12, 16, 8);
    tctx.fillStyle = '#94a3b8'; tctx.fillRect(x - 4, y - 3, 8, 3);
  }

  function drawBench(x, y) {
    tctx.fillStyle = 'rgba(10,16,28,0.25)';
    tctx.beginPath(); tctx.ellipse(x, y + 4, 18, 5, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#8b5a2b'; tctx.fillRect(x - 18, y - 4, 36, 5);
    tctx.fillRect(x - 18, y - 11, 36, 4);
    tctx.fillStyle = '#5b3a22'; tctx.fillRect(x - 14, y, 3, 5); tctx.fillRect(x + 11, y, 3, 5);
  }

  function drawPlanter(x, y) {
    tctx.fillStyle = '#5b3a22'; tctx.fillRect(x - 10, y - 2, 20, 8);
    tctx.fillStyle = '#6fae5b'; tctx.fillRect(x - 7, y - 12, 4, 10);
    tctx.fillRect(x - 1, y - 15, 4, 13);
    tctx.fillRect(x + 5, y - 11, 4, 9);
  }

  function drawNeonBoard(x, y, c) {
    tctx.fillStyle = 'rgba(10,16,28,0.4)';
    tctx.fillRect(x - 2, y + 4, 4, 8);
    tctx.fillStyle = '#141c2b'; tctx.fillRect(x - 16, y - 26, 32, 30);
    tctx.strokeStyle = c; tctx.lineWidth = 2;
    tctx.strokeRect(x - 13, y - 23, 26, 24);
    tctx.fillStyle = c;
    tctx.fillRect(x - 8, y - 17, 16, 3);
    tctx.fillRect(x - 8, y - 10, 10, 3);
    tctx.globalAlpha = 0.22;
    tctx.beginPath(); tctx.arc(x, y - 11, 24, 0, Math.PI * 2); tctx.fill();
    tctx.globalAlpha = 1;
  }

  function drawBeachRock(x, y, s) {
    tctx.fillStyle = 'rgba(80,70,50,0.22)';
    tctx.beginPath(); tctx.ellipse(x, y + 4, 12 * s, 4 * s, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#8d8b82';
    tctx.beginPath();
    tctx.moveTo(x - 11 * s, y + 2); tctx.lineTo(x - 5 * s, y - 9 * s);
    tctx.lineTo(x + 6 * s, y - 8 * s); tctx.lineTo(x + 12 * s, y + 2);
    tctx.closePath(); tctx.fill();
    tctx.fillStyle = '#a8a79e';
    tctx.beginPath();
    tctx.moveTo(x - 5 * s, y - 9 * s); tctx.lineTo(x + 6 * s, y - 8 * s); tctx.lineTo(x + 2 * s, y - 3 * s);
    tctx.closePath(); tctx.fill();
  }

  function drawStarfish(x, y) {
    tctx.fillStyle = '#f08a5d';
    tctx.beginPath();
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + i * Math.PI * 2 / 5;
      var a2 = a + Math.PI / 5;
      tctx.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7);
      tctx.lineTo(x + Math.cos(a2) * 3, y + Math.sin(a2) * 3);
    }
    tctx.closePath(); tctx.fill();
  }

  function drawShell(x, y) {
    tctx.fillStyle = '#f7e1c8';
    tctx.beginPath(); tctx.arc(x, y, 5, Math.PI, Math.PI * 2); tctx.fill();
    tctx.strokeStyle = '#d7b892'; tctx.lineWidth = 1;
    tctx.beginPath(); tctx.moveTo(x, y); tctx.lineTo(x - 3, y - 4); tctx.stroke();
  }

  function drawDriftwood(x, y) {
    tctx.fillStyle = '#9c7a52';
    tctx.save(); tctx.translate(x, y); tctx.rotate(-0.18);
    tctx.fillRect(-18, -3, 36, 6);
    tctx.fillStyle = '#b8956a'; tctx.fillRect(-18, -3, 36, 2);
    tctx.fillStyle = '#7a5c3c'; tctx.fillRect(8, -8, 4, 8);
    tctx.restore();
  }

  function drawCrystalCluster(x, y, s, c) {
    tctx.fillStyle = 'rgba(8,10,24,0.35)';
    tctx.beginPath(); tctx.ellipse(x, y + 4, 12 * s, 4 * s, 0, 0, Math.PI * 2); tctx.fill();
    var list = [[0, 26, 8], [-9, 16, 6], [9, 19, 6]];
    list.forEach(function (v, i) {
      var cx = x + v[0] * s, h = v[1] * s, w = v[2] * s;
      tctx.fillStyle = c;
      tctx.beginPath();
      tctx.moveTo(cx, y - h); tctx.lineTo(cx + w, y - h * 0.35);
      tctx.lineTo(cx + w * 0.7, y + 2); tctx.lineTo(cx - w * 0.7, y + 2);
      tctx.lineTo(cx - w, y - h * 0.35); tctx.closePath(); tctx.fill();
      tctx.fillStyle = 'rgba(255,255,255,0.45)';
      tctx.fillRect(cx - w * 0.2, y - h * 0.62, Math.max(1, w * 0.25), h * 0.45);
    });
    tctx.globalAlpha = 0.16;
    tctx.fillStyle = c;
    tctx.beginPath(); tctx.arc(x, y - 4, 26 * s, 0, Math.PI * 2); tctx.fill();
    tctx.globalAlpha = 1;
  }

  function drawFloatLantern(x, y, c) {
    tctx.fillStyle = 'rgba(10,16,32,0.2)';
    tctx.beginPath(); tctx.ellipse(x, y + 18, 10, 4, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#2a3a58'; tctx.fillRect(x - 5, y - 2, 10, 10);
    tctx.fillStyle = c; tctx.fillRect(x - 4, y - 1, 8, 8);
    tctx.fillStyle = 'rgba(255,255,255,0.8)'; tctx.fillRect(x - 1, y + 1, 2, 2);
    tctx.globalAlpha = 0.20;
    tctx.fillStyle = c;
    tctx.beginPath(); tctx.arc(x, y + 2, 18, 0, Math.PI * 2); tctx.fill();
    tctx.globalAlpha = 1;
  }

  /* ---- 植被与森林 ---- */
  function drawForest(r, sc) {
    var pal = BIOMES[sc.chapters[0]];
    var type = pal.tree;
    if (sc.theme === 'city') {
      // 城市不铺森林，只种少量行道树
      for (var c = 0; c < 44; c++) {
        var cp = decorSpot(r, 150, 330);
        if (!decorOK(cp)) continue;
        drawStreetTree(cp.x, cp.y, 0.9 + r() * 0.3);
        decorBlock(cp, 14, 10);
      }
      return;
    }
    var placed = 0, guard = 0;
    var want = Math.round((sc.theme === 'island' ? 90 : 180) * MAP_S * MAP_S);
    while (placed < want && guard < 12000) {
      guard++;
      var x = 40 + r() * (WORLD_W - 80);
      var y = 40 + r() * (WORLD_H - 80);
      if (inSpawnLane(x, y)) continue;
      if (nearArea(x, y, 300 * MAP_S)) continue;
      if (distToPath(x, y) < 66) continue;
      if (blockedAt(x, y)) continue;
      if (nearNpc(x, y, 64)) continue;
      if (sc.theme === 'island' && !onIsland(x, y)) continue;
      var s = 0.85 + r() * 0.45;
      if (type === 'pine') drawPine(x, y, s);
      else if (type === 'blossom') drawBlossom(x, y, s);
      else if (type === 'palm') drawPalm(x, y, s);
      else if (type === 'bamboo') drawBamboo(x, y, s);
      else if (type === 'crystal') drawCrystalTree(x, y, s);
      else drawOak(x, y, s);
      markRect(x - 12, y - 14, 24, 28);
      placed++;
    }
    // 世界边缘：树墙（岛屿除外，岛屿靠海）
    if (sc.theme === 'island') return;
    for (var x2 = 30; x2 < WORLD_W; x2 += 46) {
      drawEdgeTree(type, x2 + (r() * 10 - 5), 34 + r() * 10, 1);
      if (!inSpawnLane(x2, WORLD_H - 26)) {
        drawEdgeTree(type, x2 + (r() * 10 - 5), WORLD_H - 26 - r() * 10, 1);
      }
    }
    for (var y2 = 30; y2 < WORLD_H; y2 += 46) {
      drawEdgeTree(type, 30 + r() * 10, y2 + (r() * 10 - 5), 1);
      drawEdgeTree(type, WORLD_W - 30 - r() * 10, y2 + (r() * 10 - 5), 1);
    }
  }

  function drawEdgeTree(type, x, y, s) {
    if (type === 'pine') drawPine(x, y, s);
    else if (type === 'blossom') drawBlossom(x, y, s);
    else if (type === 'palm') drawPalm(x, y, s);
    else if (type === 'bamboo') drawBamboo(x, y, s);
    else if (type === 'crystal') drawCrystalTree(x, y, s);
    else drawOak(x, y, s);
  }

  function onIsland(x, y) {
    var nx = (x - WORLD_W / 2) / (WORLD_W * 0.452);
    var ny = (y - WORLD_H / 2) / (WORLD_H * 0.438);
    return nx * nx + ny * ny < 1;
  }

  function drawOak(x, y, s) {
    tctx.fillStyle = 'rgba(18,40,20,0.22)';
    tctx.beginPath(); tctx.ellipse(x, y + 2, 14 * s, 5 * s, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#5b3a22';
    tctx.fillRect(Math.round(x - 3), Math.round(y - 12 * s), Math.round(6), Math.round(14 * s));
    tctx.fillStyle = '#2f6b34';
    tctx.fillRect(Math.round(x - 13 * s), Math.round(y - 30 * s), Math.round(26 * s), Math.round(20 * s));
    tctx.fillStyle = '#3f8a41';
    tctx.fillRect(Math.round(x - 10 * s), Math.round(y - 36 * s), Math.round(20 * s), Math.round(16 * s));
    tctx.fillStyle = '#57a84e';
    tctx.fillRect(Math.round(x - 6 * s), Math.round(y - 39 * s), Math.round(12 * s), Math.round(8 * s));
    tctx.fillStyle = '#74b852';
    tctx.fillRect(Math.round(x - 3 * s), Math.round(y - 41 * s), Math.round(6 * s), Math.round(4 * s));
  }

  function drawBlossom(x, y, s) {
    tctx.fillStyle = 'rgba(40,50,80,0.18)';
    tctx.beginPath(); tctx.ellipse(x, y + 2, 13 * s, 5 * s, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#6b4a3a';
    tctx.fillRect(Math.round(x - 3), Math.round(y - 14 * s), Math.round(6), Math.round(16 * s));
    tctx.fillStyle = '#d98bb8';
    tctx.fillRect(Math.round(x - 13 * s), Math.round(y - 32 * s), Math.round(26 * s), Math.round(21 * s));
    tctx.fillStyle = '#f0a8cf';
    tctx.fillRect(Math.round(x - 10 * s), Math.round(y - 38 * s), Math.round(20 * s), Math.round(16 * s));
    tctx.fillStyle = '#fbd5e8';
    tctx.fillRect(Math.round(x - 6 * s), Math.round(y - 41 * s), Math.round(12 * s), Math.round(8 * s));
    tctx.fillStyle = 'rgba(255,255,255,0.55)';
    tctx.fillRect(Math.round(x + 2 * s), Math.round(y - 35 * s), 3, 3);
  }

  function drawPine(x, y, s) {
    tctx.fillStyle = 'rgba(30,50,70,0.20)';
    tctx.beginPath(); tctx.ellipse(x, y + 2, 12 * s, 4 * s, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#5b3a22';
    tctx.fillRect(Math.round(x - 2), Math.round(y - 10 * s), Math.round(5), Math.round(12 * s));
    var layers = [
      [y - 42 * s, 11 * s, '#2f5d54'],
      [y - 31 * s, 15 * s, '#356b5f'],
      [y - 19 * s, 18 * s, '#3d7a6b']
    ];
    layers.forEach(function (L) {
      tctx.fillStyle = L[2];
      tctx.beginPath();
      tctx.moveTo(x, L[0]);
      tctx.lineTo(x + L[1], L[0] + 18 * s);
      tctx.lineTo(x - L[1], L[0] + 18 * s);
      tctx.closePath(); tctx.fill();
      tctx.fillStyle = 'rgba(248,253,255,0.85)';
      tctx.fillRect(Math.round(x - L[1] * 0.55), Math.round(L[0] + 11 * s), Math.round(L[1] * 1.1), Math.max(2, 3 * s));
    });
  }

  function drawPalm(x, y, s) {
    tctx.fillStyle = 'rgba(120,100,60,0.22)';
    tctx.beginPath(); tctx.ellipse(x, y + 2, 15 * s, 5 * s, 0, 0, Math.PI * 2); tctx.fill();
    // 弯曲的树干
    for (var i = 0; i < 6; i++) {
      tctx.fillStyle = i % 2 ? '#8a6438' : '#a37a48';
      tctx.fillRect(Math.round(x - 3 + i * 1.2), Math.round(y - i * 7 * s), Math.round(6 - i * 0.4), Math.round(8 * s));
    }
    var tx = x + 7, ty = y - 42 * s;
    tctx.strokeStyle = '#3f8a41'; tctx.lineWidth = 3;
    var fronds = [-2.6, -2.1, -1.5, -0.6, 0.1, 0.7];
    fronds.forEach(function (a) {
      tctx.beginPath();
      tctx.moveTo(tx, ty);
      tctx.quadraticCurveTo(tx + Math.cos(a) * 16 * s, ty + Math.sin(a) * 10 * s,
        tx + Math.cos(a) * 28 * s, ty + Math.sin(a) * 22 * s + 6 * s);
      tctx.stroke();
    });
    tctx.fillStyle = '#5b3a22';
    tctx.fillRect(tx - 2, ty + 2, 4, 4);
  }

  function drawBamboo(x, y, s) {
    tctx.fillStyle = 'rgba(30,60,30,0.18)';
    tctx.beginPath(); tctx.ellipse(x, y + 2, 14 * s, 4 * s, 0, 0, Math.PI * 2); tctx.fill();
    var stalks = [-9, -2, 6, 11];
    stalks.forEach(function (dx, i) {
      var h = (34 + (i % 2) * 12) * s;
      tctx.fillStyle = i % 2 ? '#4f8f3d' : '#5da747';
      tctx.fillRect(Math.round(x + dx * s), Math.round(y - h), Math.round(4 * s), Math.round(h));
      tctx.fillStyle = '#3d7330';
      for (var k = 1; k < 4; k++) tctx.fillRect(Math.round(x + dx * s), Math.round(y - h + k * h / 4), Math.round(4 * s), 2);
      // 竹叶
      tctx.fillStyle = '#6fc052';
      tctx.fillRect(Math.round(x + dx * s + 4), Math.round(y - h + 5), Math.round(8 * s), Math.round(2 * s));
      tctx.fillRect(Math.round(x + dx * s - 7), Math.round(y - h + 12), Math.round(7 * s), Math.round(2 * s));
    });
  }

  function drawStreetTree(x, y, s) {
    tctx.fillStyle = 'rgba(8,14,26,0.35)';
    tctx.beginPath(); tctx.ellipse(x, y + 3, 13 * s, 4 * s, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#3d4654'; tctx.fillRect(Math.round(x - 10), Math.round(y - 3), 20, 8);
    tctx.fillStyle = '#5b3a22'; tctx.fillRect(Math.round(x - 2), Math.round(y - 13 * s), 5, Math.round(12 * s));
    tctx.fillStyle = '#2f6b45';
    tctx.fillRect(Math.round(x - 12 * s), Math.round(y - 32 * s), Math.round(24 * s), Math.round(20 * s));
    tctx.fillStyle = '#3f8a5a';
    tctx.fillRect(Math.round(x - 8 * s), Math.round(y - 37 * s), Math.round(16 * s), Math.round(13 * s));
    tctx.fillStyle = 'rgba(125,211,252,0.85)';
    tctx.fillRect(Math.round(x - 6), Math.round(y - 30 * s), 2, 2);
    tctx.fillRect(Math.round(x + 4), Math.round(y - 34 * s), 2, 2);
  }

  function drawCrystalTree(x, y, s) {
    tctx.fillStyle = 'rgba(6,10,24,0.35)';
    tctx.beginPath(); tctx.ellipse(x, y + 3, 13 * s, 4 * s, 0, 0, Math.PI * 2); tctx.fill();
    tctx.fillStyle = '#2a3560';
    tctx.fillRect(Math.round(x - 3), Math.round(y - 16 * s), Math.round(6), Math.round(18 * s));
    drawCrystalCluster(x, y + 2, 0.85 * s, '#7dd3fc');
  }

  /* ---- 城市天际线与场景外框 ---- */
  function drawSceneFrame(sc, r) {
    if (sc.theme === 'celestial' || sc.theme === 'palace') {
      // 顶部一层薄雾，增强纵深
      var g = tctx.createLinearGradient(0, 0, 0, 140);
      g.addColorStop(0, sc.theme === 'palace' ? 'rgba(6,10,26,0.55)' : 'rgba(255,255,255,0.34)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      tctx.fillStyle = g;
      tctx.fillRect(0, 0, WORLD_W, 140);
    }
    if (sc.theme === 'island') {
      // 岛的下缘一条浅滩
      tctx.strokeStyle = 'rgba(233,251,255,0.55)';
      tctx.lineWidth = 4;
      tctx.beginPath();
      tctx.ellipse(WORLD_W / 2, WORLD_H / 2 + 8, WORLD_W * 0.462, WORLD_H * 0.448, 0, 0, Math.PI * 2);
      tctx.stroke();
    }
  }

  function drawCitySkyline(r) {
    var cols = ['#1f2937', '#25324a', '#2b2540', '#20303c'];
    var x = 10;
    var i = 0;
    while (x < WORLD_W - 80) {
      var w = 90 + r() * 90;
      var h = 90 + r() * 110;
      var c = cols[i % cols.length];
      drawCityBuilding(x, 30, w, h, c, i % 2 ? '#f472b6' : '#38bdf8');
      x += w + 26;
      i++;
    }
    // 底部两侧也放两栋，留出中间入口
    drawCityBuilding(20, WORLD_H - 150, 170, 120, cols[1], '#fbbf24');
    drawCityBuilding(WORLD_W - 200, WORLD_H - 160, 180, 130, cols[2], '#38bdf8');
  }

  function drawCityBuilding(x, y, w, h, c, neon) {
    tctx.fillStyle = 'rgba(4,8,16,0.35)';
    tctx.fillRect(x + 8, y + h - 6, w, 12);
    tctx.fillStyle = c;
    tctx.fillRect(x, y, w, h);
    tctx.fillStyle = 'rgba(255,255,255,0.06)';
    tctx.fillRect(x, y, w, 8);
    // 窗户
    for (var wy = y + 18; wy < y + h - 22; wy += 22) {
      for (var wx = x + 12; wx < x + w - 16; wx += 20) {
        var lit = ((wx * 7 + wy * 13) % 11) < 6;
        tctx.fillStyle = lit ? 'rgba(251,191,36,0.75)' : 'rgba(120,150,180,0.18)';
        tctx.fillRect(wx, wy, 9, 11);
      }
    }
    // 霓虹招牌
    tctx.fillStyle = neon;
    tctx.fillRect(x + 8, y + h - 30, Math.min(w - 16, 54), 4);
    tctx.globalAlpha = 0.18;
    tctx.beginPath(); tctx.arc(x + w * 0.5, y + h * 0.5, 60, 0, Math.PI * 2); tctx.fill();
    tctx.globalAlpha = 1;
    markRect(x, y, w, h);
  }

  function nearArea(x, y, r) {
    for (var i = 0; i < areas.length; i++) {
      var a = areas[i];
      if (Math.hypot(x - a.cx, (y - a.cy) / 0.82) < r) return true;
    }
    return false;
  }
  function nearNpc(x, y, r) {
    for (var i = 0; i < npcs.length; i++) {
      if (Math.hypot(x - npcs[i].x, y - npcs[i].y) < r) return true;
    }
    return false;
  }
  function distToPath(x, y) {
    var best = 1e9;
    for (var i = 0; i < pathSamples.length; i += 2) {
      var p = pathSamples[i];
      var d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  }

  /* ============================================================
   * 5. 像素小人（程序化生成，每个角色一套）
   * ------------------------------------------------------------
   * 逻辑画布 20×26（放大 2 倍 = 40×52），比上一版多一倍像素，
   * 才放得下发型、护甲、披风、尾巴这些「认人」的关键细节。
   * ============================================================ */
  var SPR_W = 20, SPR_H = 26, SPR_S = 2;

  /* 颜色混合：给头发/衣服做高光和阴影，避免整块死色 */
  function hexRgb(h) {
    var s = (h || '#ffffff').replace('#', '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    var n = parseInt(s, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    var A = hexRgb(a), B = hexRgb(b);
    return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * t) + ',' +
      Math.round(A[1] + (B[1] - A[1]) * t) + ',' +
      Math.round(A[2] + (B[2] - A[2]) * t) + ')';
  }

  function sprite(spec, dir, frame) {
    var HH = spec.h || 0;
    var c = mk(SPR_W * SPR_S, (SPR_H + HH) * SPR_S), g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    function R(x, y, w, h, col) {
      if (w <= 0 || h <= 0) return;
      if (y < 0) { h += y; y = 0; }           // 头发超出头顶时自动裁齐，不画到画布外
      if (h <= 0) return;
      g.fillStyle = col;
      g.fillRect(Math.round(x * SPR_S), Math.round(y * SPR_S), Math.max(1, Math.round(w * SPR_S)), Math.max(1, Math.round(h * SPR_S)));
    }

    var OL = '#0d111a';
    var skin = spec.skin, hair = spec.hair, top = spec.top, pants = spec.pants;
    var belt = spec.belt, collar = spec.collar, boots = spec.boots, eye = spec.eye;
    var skinHi = mix(skin, '#ffffff', 0.25);
    var skinSh = mix(skin, '#000000', 0.22);
    var hairHi = mix(hair, '#ffffff', 0.38);
    var hairDk = mix(hair, '#000000', 0.32);
    var topHi = mix(top, '#ffffff', 0.28);
    var topDk = mix(top, '#000000', 0.28);
    var pantsDk = mix(pants, '#000000', 0.3);
    var bootHi = mix(boots, '#ffffff', 0.3);

    var step = frame === 1 ? 1 : (frame === 3 ? -1 : 0);
    var lift = (frame === 1 || frame === 3) ? 1 : 0;
    var up = dir === 'up';
    var side = dir === 'left' || dir === 'right';
    var bodyY = 12 - lift;
    var ly = 19;
    var legH = Math.max(2, 5 + HH);
    var fb = ly + legH - 1;                    // 鞋底所在行
    var ex = spec.extras;
    var hs = spec.hairStyle;

    /* ---- 背后层：披风 / 翅膀 / 尾巴 / 剑 ---- */
    if (spec.cape) {
      R(2, bodyY, 16, 11, OL);
      R(3, bodyY, 14, 10, spec.cape);
      R(3, bodyY, 3, 9, mix(spec.cape, '#ffffff', 0.16));
      R(3, bodyY + 7, 14, 2, 'rgba(0,0,0,0.18)');
      R(3, bodyY + 10, 14, 1, mix(spec.cape, '#000000', 0.25));
    }
    if (ex.indexOf('wings') >= 0) {
      R(0, bodyY + 1, 4, 10, '#14532d');
      R(16, bodyY + 1, 4, 10, '#14532d');
      R(1, bodyY + 3, 2, 6, '#166534');
      R(17, bodyY + 3, 2, 6, '#166534');
      R(1, bodyY + 2, 1, 2, '#22c55e');
      R(18, bodyY + 2, 1, 2, '#22c55e');
    }
    if (ex.indexOf('sword') >= 0) {
      R(15, bodyY - 3, 2, 6, '#78350f');
      R(14, bodyY + 3, 4, 1, '#fbbf24');
      R(15, bodyY + 4, 2, 7, '#cbd5e1');
      R(16, bodyY + 4, 1, 7, '#94a3b8');
      R(15, bodyY + 4, 1, 1, '#f8fafc');
    }
    if (ex.indexOf('tail') >= 0) {
      R(15, fb - 5, 3, 2, '#8b5a2b');
      R(17, fb - 3, 2, 3, '#8b5a2b');
      R(18, fb - 1, 1, 2, '#6b4226');
      R(16, fb - 5, 1, 1, '#b07a45');
    }

    /* ---- 腿 / 鞋 ---- */
    R(6, ly, 9, legH, OL);
    R(7, ly, 7, legH - 1, pants);
    R(7, ly, 1, legH - 1, mix(pants, '#ffffff', 0.18));
    R(13, ly, 1, legH - 1, pantsDk);
    if (frame === 1) {
      R(6, fb - 2, 3, 3, OL); R(7, fb - 1, 2, 2, boots); R(7, fb - 1, 1, 1, bootHi);
      R(11, fb - 1, 3, 2, boots); R(11, fb - 1, 1, 1, bootHi);
    } else if (frame === 3) {
      R(11, fb - 2, 3, 3, OL); R(11, fb - 1, 2, 2, boots); R(11, fb - 1, 1, 1, bootHi);
      R(6, fb - 1, 3, 2, boots); R(6, fb - 1, 1, 1, bootHi);
    } else {
      R(7, fb - 1, 2, 2, boots);
      R(11, fb - 1, 2, 2, boots);
      R(7, fb - 1, 1, 1, bootHi);
      R(11, fb - 1, 1, 1, bootHi);
    }

    /* ---- 躯干 ---- */
    var bx = spec.female ? 7 : 6;
    var bw = spec.female ? 7 : 8;
    R(bx - 1, bodyY, bw + 2, 8, OL);
    if (spec.armor) {
      // 战斗服：白胸甲 + 肩甲
      R(4, bodyY - 1, 4, 5, OL);
      R(12, bodyY - 1, 4, 5, OL);
      R(4, bodyY, 3, 4, spec.armor);
      R(13, bodyY, 3, 4, spec.armor);
      R(4, bodyY, 3, 1, mix(spec.armor, '#ffffff', 0.5));
      R(13, bodyY, 3, 1, mix(spec.armor, '#ffffff', 0.5));
      R(6, bodyY + 1, 8, 5, spec.armor);
      R(6, bodyY + 1, 8, 1, mix(spec.armor, '#ffffff', 0.4));
      R(6, bodyY + 3, 8, 1, 'rgba(0,0,0,0.22)');
      R(6, bodyY + 5, 8, 2, top);
      R(6, bodyY + 6, 8, 1, belt);
    } else {
      R(bx, bodyY + 1, bw, 6, top);
      R(bx, bodyY + 1, bw, 1, topHi);
      R(bx + bw - 2, bodyY + 2, 2, 5, topDk);
      R(8, bodyY + 1, 4, 2, collar);
      R(8, bodyY + 1, 4, 1, mix(collar, '#ffffff', 0.3));
      R(bx, bodyY + 5, bw, 2, belt);
      R(bx, bodyY + 5, bw, 1, mix(belt, '#ffffff', 0.4));
      R(9, bodyY + 6, 2, 1, mix(belt, '#ffffff', 0.6));   // 腰带扣
    }
    // 女性角色：裙装 + 收腰
    if (spec.skirt) {
      R(5, bodyY + 4, 10, 5, OL);
      R(6, bodyY + 4, 8, 3, spec.skirt);
      R(5, bodyY + 7, 10, 2, spec.skirt);
      R(6, bodyY + 4, 8, 1, belt);
      R(5, bodyY + 7, 10, 2, mix(spec.skirt, '#000000', 0.18));
    }

    /* ---- 手臂 ---- */
    var swing = step;
    R(3, bodyY + 1, 3, 6, OL);
    R(14, bodyY + 1, 3, 6, OL);
    var sleeve = spec.armor || top;
    R(4, bodyY + 1 - (swing > 0 ? 1 : 0), 2, 4, sleeve);
    R(14, bodyY + 1 + (swing > 0 ? 1 : 0), 2, 4, sleeve);
    R(4, bodyY + 1 - (swing > 0 ? 1 : 0), 1, 3, mix(sleeve, '#ffffff', 0.3));
    R(4, bodyY + 5 - (swing > 0 ? 1 : 0), 2, 2, skin);
    R(14, bodyY + 5 + (swing > 0 ? 1 : 0), 2, 2, skin);
    R(4, bodyY + 6 - (swing > 0 ? 1 : 0), 2, 1, skinSh);
    R(14, bodyY + 6 + (swing > 0 ? 1 : 0), 2, 1, skinSh);

    /* ---- 头：圆角脸型（逐行收角，不再是方块） ---- */
    var hb = 3;
    // 描边
    R(5, hb, 10, 1, OL);
    R(4, hb + 1, 12, 7, OL);
    R(5, hb + 8, 10, 1, OL);
    R(6, hb + 9, 8, 1, OL);
    // 皮肤
    R(6, hb, 8, 1, skin);
    R(5, hb + 1, 10, 7, skin);
    R(6, hb + 8, 8, 1, skin);
    R(7, hb + 9, 6, 1, skin);
    // 左亮右暗，脸颊有体积
    R(5, hb + 1, 1, 6, skinHi);
    R(14, hb + 1, 1, 6, skinSh);
    R(6, hb + 8, 8, 1, mix(skin, '#000000', 0.1));

    /* ---- 头发（每种发型都有自己的轮廓和高光） ---- */
    if (hs === 'goku') {
      R(4, hb - 2, 12, 3, hair);
      R(3, hb, 2, 3, hair);
      R(15, hb, 2, 3, hair);
      R(4, hb - 3, 3, 2, hair);
      R(8, hb - 3, 3, 2, hair);
      R(12, hb - 3, 2, 2, hair);
      R(5, hb - 2, 2, 1, hairHi);
      R(9, hb - 3, 1, 1, hairHi);
      R(13, hb - 3, 1, 1, hairHi);
      R(5, hb + 1, 2, 1, hair);
      R(11, hb + 1, 2, 1, hair);
    } else if (hs === 'vegeta') {
      R(4, hb - 2, 12, 3, hair);
      R(3, hb - 1, 3, 3, hair);
      R(14, hb - 1, 3, 3, hair);
      R(4, hb - 3, 2, 2, hair);
      R(7, hb - 3, 2, 2, hair);
      R(10, hb - 3, 2, 2, hair);
      R(13, hb - 3, 2, 2, hair);
      R(9, hb, 2, 2, hair);
      R(6, hb - 2, 2, 1, hairHi);
      R(11, hb - 2, 1, 1, hairHi);
    } else if (hs === 'bob') {
      R(4, hb - 2, 12, 3, hair);
      R(3, hb, 2, 7, hair);
      R(15, hb, 2, 7, hair);
      R(5, hb + 1, 10, 2, hair);
      R(5, hb - 1, 4, 1, hairHi);
      R(3, hb + 5, 2, 3, hairDk);
      R(15, hb + 5, 2, 3, hairDk);
    } else if (hs === 'long') {
      R(4, hb - 2, 12, 3, hair);
      R(3, hb, 2, 9, hair);
      R(15, hb, 2, 9, hair);
      R(5, hb + 1, 10, 2, hair);
      R(5, hb - 1, 4, 1, hairHi);
      R(3, hb + 6, 2, 4, hairDk);
      R(15, hb + 6, 2, 4, hairDk);
    } else if (hs === 'bald') {
      R(7, hb, 6, 1, 'rgba(255,255,255,0.45)');
      R(6, hb + 1, 2, 1, 'rgba(255,255,255,0.22)');
    } else if (hs === 'turban') {
      R(3, hb - 2, 14, 5, '#f8fafc');
      R(4, hb - 3, 12, 2, '#e2e8f0');
      R(3, hb + 2, 14, 1, '#cbd5e1');
      R(4, hb - 2, 3, 1, '#ffffff');
      R(7, hb + 3, 1, 2, '#65a30d');
      R(12, hb + 3, 1, 2, '#65a30d');
    } else if (hs === 'frieza') {
      // 圆顶头冠：比脸窄一圈，带弧度和高光
      R(5, hb - 2, 10, 1, hair);
      R(4, hb - 1, 12, 3, hair);
      R(5, hb + 2, 10, 1, hairDk);
      R(6, hb - 2, 4, 1, mix(hair, '#ffffff', 0.55));
      R(4, hb + 3, 1, 3, hairDk);
      R(15, hb + 3, 1, 3, hairDk);
    } else if (hs === 'cell') {
      R(4, hb - 2, 12, 3, '#14532d');
      R(4, hb - 3, 2, 2, '#14532d');
      R(9, hb - 3, 2, 2, '#14532d');
      R(14, hb - 3, 2, 2, '#14532d');
      R(6, hb - 1, 3, 1, '#22c55e');
    } else if (hs === 'buu') {
      R(4, hb - 1, 12, 2, skin);
      R(9, hb - 3, 2, 3, hair);
      R(8, hb - 1, 1, 1, hair);
      R(11, hb - 1, 1, 1, hair);
    } else if (hs === 'horns') {
      R(4, hb - 2, 12, 3, hair);
      R(2, hb - 1, 2, 4, '#e5e7eb');
      R(16, hb - 1, 2, 4, '#e5e7eb');
      R(2, hb - 1, 1, 3, '#ffffff');
      R(17, hb - 1, 1, 3, '#ffffff');
      R(5, hb - 1, 2, 1, hairHi);
    } else if (hs === 'ponytail') {
      R(4, hb - 2, 12, 3, hair);
      R(3, hb, 2, 5, hair);
      R(15, hb, 2, 5, hair);
      R(16, hb + 2, 3, 7, hair);
      R(17, hb + 8, 2, 3, hair);
      R(5, hb - 1, 4, 1, hairHi);
    } else if (hs === 'ears') {
      R(4, hb - 2, 12, 3, hair);
      R(2, hb - 1, 3, 4, skin);
      R(15, hb - 1, 3, 4, skin);
      R(3, hb, 1, 2, skinSh);
      R(16, hb, 1, 2, skinSh);
    } else if (hs === 'helmet') {
      R(3, hb - 2, 14, 5, '#e5e7eb');
      R(3, hb + 2, 14, 1, '#94a3b8');
      R(4, hb - 1, 5, 1, '#ffffff');
      R(4, hb + 3, 12, 1, hair);
    } else if (hs === 'antenna') {
      R(4, hb - 3, 1, 3, hair);
      R(15, hb - 3, 1, 3, hair);
      R(3, hb - 3, 2, 1, hair);
      R(15, hb - 3, 2, 1, hair);
      R(6, hb + 3, 8, 2, '#111827');
      R(7, hb + 3, 2, 2, '#38bdf8');
      R(11, hb + 3, 2, 2, '#38bdf8');
    } else {
      R(4, hb - 2, 12, 3, hair);
      R(3, hb, 1, 2, hair);
      R(16, hb, 1, 2, hair);
      R(5, hb + 1, 2, 1, hair);
      R(5, hb - 1, 3, 1, hairHi);
    }

    if (up) {
      // 背面：头发盖住整颗头（保持圆角）
      if (hs !== 'bald' && hs !== 'helmet' && hs !== 'turban') {
        R(6, hb, 8, 1, hair);
        R(5, hb + 1, 10, 7, hair);
        R(6, hb + 8, 8, 1, hair);
        R(7, hb, 3, 1, hairHi);
      }
    }

    /* ---- 脸 ---- */
    if (!up) {
      if (side) {
        R(4, hb + 3, 1, 2, skinSh);                    // 耳
        R(7, hb + 4, 2, 2, '#f8fafc');
        R(8, hb + 4, 1, 2, eye);
        R(7, hb + 3, 2, 1, hairDk);                    // 眉
        R(14, hb + 4, 1, 1, skinSh);                   // 鼻影
        R(13, hb + 6, 2, 1, spec.female ? '#be123c' : '#b4795a');
      } else {
        R(7, hb + 3, 2, 1, hairDk);
        R(11, hb + 3, 2, 1, hairDk);
        R(7, hb + 4, 2, 2, '#f8fafc');
        R(11, hb + 4, 2, 2, '#f8fafc');
        R(8, hb + 4, 1, 2, eye);
        R(12, hb + 4, 1, 2, eye);
        R(9, hb + 6, 1, 1, skinSh);                    // 鼻
        R(9, hb + 7, 2, 1, spec.female ? '#be123c' : '#b4795a');
        if (spec.female) {
          R(6, hb + 6, 1, 1, 'rgba(244,114,182,0.42)');
          R(13, hb + 6, 1, 1, 'rgba(244,114,182,0.42)');
        }
      }
    }

    /* ---- 人物小配件 ---- */
    if (ex.indexOf('scouter') >= 0) {
      R(10, hb + 3, 5, 3, '#111827');
      R(11, hb + 4, 3, 1, '#22c55e');
      R(11, hb + 4, 1, 1, '#bbf7d0');
    }
    if (ex.indexOf('dots') >= 0) {
      for (var i = 0; i < 3; i++) {
        R(6 + i * 4, hb + 1, 1, 1, '#1f2937');
        R(6 + i * 4, hb + 2, 1, 1, '#1f2937');
      }
    }
    if (ex.indexOf('thirdEye') >= 0) {
      R(9, hb + 2, 2, 1, '#f8fafc');
      R(9, hb + 2, 1, 1, '#1f2937');
    }
    if (ex.indexOf('hat') >= 0) {
      R(3, hb - 1, 14, 2, '#d9b36b');
      R(6, hb - 3, 8, 2, '#c9a25a');
      R(4, hb - 1, 4, 1, '#e8c98f');
    }
    if (ex.indexOf('spots') >= 0) {
      R(9, ly + 1, 1, 1, '#14532d');
      R(11, ly + 3, 1, 1, '#14532d');
      R(5, bodyY + 3, 1, 1, '#14532d');
      R(14, bodyY + 4, 1, 1, '#14532d');
    }
    if (ex.indexOf('earring') >= 0) {
      R(4, hb + 6, 1, 1, '#fbbf24');
      R(15, hb + 6, 1, 1, '#fbbf24');
    }

    return c;
  }

  function mirror(src) {
    var c = mk(src.width, src.height), g = c.getContext('2d');
    g.translate(src.width, 0);
    g.scale(-1, 1);
    g.drawImage(src, 0, 0);
    return c;
  }

  function getSprites(spec) {
    if (spriteCache[spec.key]) return spriteCache[spec.key];
    var set = { down: [], up: [], left: [], right: [] };
    for (var f = 0; f < 4; f++) {
      set.down.push(sprite(spec, 'down', f));
      set.up.push(sprite(spec, 'up', f));
      var r = sprite(spec, 'right', f);
      set.right.push(r);
      set.left.push(mirror(r));
    }
    spriteCache[spec.key] = set;
    return set;
  }

  /* ============================================================
   * 6. 移动与寻路
   * ============================================================ */
  function hit(x, y) {
    var w = 15, h = 11;
    var x0 = Math.floor((x - w / 2) / TS), x1 = Math.floor((x + w / 2) / TS);
    var y0 = Math.floor((y - h) / TS), y1 = Math.floor(y / TS);
    for (var ty = y0; ty <= y1; ty++) {
      for (var tx = x0; tx <= x1; tx++) {
        if (tx < 0 || ty < 0 || tx >= GW || ty >= GH) return true;
        if (blocked[ty * GW + tx]) return true;
      }
    }
    return false;
  }

  function moveBy(dx, dy) {
    var nx = player.x + dx;
    if (!hit(nx, player.y)) player.x = nx;
    var ny = player.y + dy;
    if (!hit(player.x, ny)) player.y = ny;
    player.x = clamp(player.x, 12, WORLD_W - 12);
    player.y = clamp(player.y, 20, WORLD_H - 12);
  }

  function Heap() { this.a = []; }
  Heap.prototype.push = function (n) {
    var a = this.a; a.push(n);
    var i = a.length - 1;
    while (i > 0) {
      var p = (i - 1) >> 1;
      if (a[p].f <= a[i].f) break;
      var t = a[p]; a[p] = a[i]; a[i] = t; i = p;
    }
  };
  Heap.prototype.pop = function () {
    var a = this.a;
    var top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      var i = 0;
      for (;;) {
        var l = i * 2 + 1, r = l + 1, m = i;
        if (l < a.length && a[l].f < a[m].f) m = l;
        if (r < a.length && a[r].f < a[m].f) m = r;
        if (m === i) break;
        var t = a[m]; a[m] = a[i]; a[i] = t; i = m;
      }
    }
    return top;
  };
  Heap.prototype.size = function () { return this.a.length; };

  function findPath(sx, sy, tx, ty) {
    var st = nearestWalkable(sx, sy, 3);
    var en = nearestWalkable(tx, ty, 8);
    var s = { x: clamp(Math.floor(st.x / TS), 0, GW - 1), y: clamp(Math.floor(st.y / TS), 0, GH - 1) };
    var e = { x: clamp(Math.floor(en.x / TS), 0, GW - 1), y: clamp(Math.floor(en.y / TS), 0, GH - 1) };
    var si = s.y * GW + s.x, ei = e.y * GW + e.x;
    if (si === ei) return [{ x: en.x, y: en.y }];

    var total = GW * GH;
    var gScore = new Float32Array(total);
    for (var i = 0; i < total; i++) gScore[i] = Infinity;
    var came = new Int32Array(total);
    for (var j = 0; j < total; j++) came[j] = -1;
    var closed = new Uint8Array(total);
    var open = new Heap();

    gScore[si] = 0;
    open.push({ i: si, f: 0 });
    var dirs = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
      [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];

    while (open.size()) {
      var cur = open.pop();
      if (cur.i === ei) break;
      if (closed[cur.i]) continue;
      closed[cur.i] = 1;
      var cx = cur.i % GW, cy = Math.floor(cur.i / GW);
      for (var d = 0; d < 8; d++) {
        var nx = cx + dirs[d][0], ny = cy + dirs[d][1];
        if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
        var ni = ny * GW + nx;
        if (blocked[ni] || closed[ni]) continue;
        if (d >= 4) {
          // 禁止贴角穿墙
          if (blocked[cy * GW + nx] || blocked[ny * GW + cx]) continue;
        }
        var ng = gScore[cur.i] + dirs[d][2];
        if (ng < gScore[ni]) {
          gScore[ni] = ng;
          came[ni] = cur.i;
          var hx = Math.abs(nx - e.x), hy = Math.abs(ny - e.y);
          var hcost = (hx + hy) + (1.4142 - 2) * Math.min(hx, hy);
          open.push({ i: ni, f: ng + hcost });
        }
      }
    }

    if (came[ei] === -1) return [];
    var tiles = [];
    var idx = ei;
    while (idx !== -1 && idx !== si) {
      tiles.push({ x: (idx % GW + 0.5) * TS, y: (Math.floor(idx / GW) + 0.9) * TS });
      idx = came[idx];
    }
    tiles.reverse();
    if (!tiles.length) return [];
    var last = tiles[tiles.length - 1];
    if (Math.abs(last.x - en.x) < TS * 2) last.x = en.x, last.y = en.y;
    return smoothPath(tiles);
  }

  function los(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var dist = Math.hypot(dx, dy);
    var steps = Math.max(1, Math.ceil(dist / 8));
    for (var i = 1; i <= steps; i++) {
      var t = i / steps;
      if (hit(a.x + dx * t, a.y + dy * t)) return false;
    }
    return true;
  }

  function smoothPath(pts) {
    var out = [];
    var i = 0;
    while (i < pts.length) {
      var j = pts.length - 1;
      if (j <= i) { out.push(pts[j]); break; }   // 最后一个点：直接收尾，否则 i 不前进会死循环
      for (; j > i + 1; j--) {
        if (los(pts[i], pts[j])) break;
      }
      out.push(pts[j]);
      i = j;
    }
    return out;
  }

  function walkTo(x, y) {
    var pts = findPath(player.x, player.y, x, y);
    player.path = pts;
    if (!pts.length) player.path = [{ x: x, y: y }];
    camFree = 0;
  }

  /* ============================================================
   * 6.8 场景传送：世界地图面板
   * ============================================================ */
  var SCENE_ICON = {
    market: '🏮', celestial: '🌸', snow: '❄️',
    city: '🌃', island: '🌴', palace: '💠', arena: '⚔️'
  };

  /* 6 个场景在画布地图上的落点（百分比，对齐 map.png 的地貌）：
     西北森林 = 集市，北部内海 = 双鱼宫，东北雪原 = 雪人谷，
     东部平原 = 潮流街区，南部半岛 = 英雄岛，西部海湾 = 水平宫。 */
  var SPOT_POS = {
    s1: { x: 17, y: 27 },
    s2: { x: 56, y: 18 },
    s3: { x: 86, y: 17 },
    s4: { x: 78, y: 39 },
    s5: { x: 37, y: 72 },
    s6: { x: 11, y: 57 },
    arena: { x: 49, y: 43 }
  };

  function sceneProgress(sc) {
    var total = 0, cleared = 0, unlocked = false;
    NODES.forEach(function (n) {
      if (sc.chapters.indexOf(n.chap) < 0) return;
      total++;
      if (store.isCleared(n.id)) cleared++;
      if (store.unlocked(n).ok) unlocked = true;
    });
    return { total: total, cleared: cleared, unlocked: unlocked };
  }

  function chapterRange(sc) {
    var nos = sc.chapters.map(function (cid) {
      var ch = CHAP_BY_ID[cid];
      return ch ? ch.no : null;
    }).filter(function (n) { return n != null; });
    if (!nos.length) return '特别赛事';
    return nos[0] === nos[nos.length - 1] ? ('第' + nos[0] + '章') : ('第' + nos[0] + '-' + nos[nos.length - 1] + '章');
  }

  function chapterNames(sc) {
    return sc.chapters.map(function (cid) {
      var ch = CHAP_BY_ID[cid];
      return ch ? (ch.no + '. ' + ch.name) : '';
    }).filter(Boolean).join('　');
  }

  function renderScenePanel() {
    if (!sceneGrid) return;
    var html = '';
    SCENES.forEach(function (sc, i) {
      var p = sceneProgress(sc);
      var pct = p.total ? Math.round(p.cleared / p.total * 100) : 0;
      var arena = NS.Store ? NS.Store.arena() : { best: 0, champion: 0 };
      if (sc.arena) pct = arena.champion ? 100 : Math.round((arena.best || 0) / 5 * 100);
      var locked = !sc.arena && i > 0 && !p.unlocked;
      var pos = SPOT_POS[sc.id] || { x: 50, y: 50 };
      var cls = 'wm-spot theme-' + sc.theme +
        (i === sceneIdx ? ' current' : '') + (locked ? ' locked' : '');
      var progText = sc.arena
        ? ('冠军 ' + arena.champion + ' 次')
        : (p.cleared + '/' + p.total);
      html += '<button type="button" class="' + cls + '" data-scene="' + i +
        '" data-locked="' + (locked ? '1' : '0') + '"' +
        ' style="left:' + pos.x + '%;top:' + pos.y + '%"' +
        ' aria-label="' + esc(sc.name) + '">' +
        '<span class="wm-ring"></span>' +
        '<span class="wm-pin"><i>' + (SCENE_ICON[sc.theme] || '🗺️') + '</i></span>' +
        '<span class="wm-tag"><b>' + esc(sc.name) + '</b><em>' + chapterRange(sc) +
          ' · ' + progText + '</em>' +
          '<span class="wm-bar"><i style="width:' + pct + '%"></i></span></span>' +
        (i === sceneIdx ? '<span class="wm-here">当前</span>' : '') +
        (locked ? '<span class="wm-lock">🔒</span>' : '') +
        '</button>';
    });
    sceneGrid.innerHTML = html;
    if (mapCurrentEl) mapCurrentEl.textContent = '当前：' + currentScene().name;
    showMapTip(sceneIdx, true);
  }

  function showMapTip(i, force) {
    if (!mapTipEl) return;
    var sc = SCENES[i];
    if (!sc) return;
    var p = sceneProgress(sc);
    var locked = !sc.arena && i > 0 && !p.unlocked;
    var arena = NS.Store ? NS.Store.arena() : { best: 0, champion: 0 };
    var tail = sc.arena
      ? ('最好成绩 ' + arena.best + ' / 5 轮　·　夺冠 ' + arena.champion + ' 次')
      : (chapterNames(sc) + '　·　已通关 ' + p.cleared + ' / ' + p.total);
    mapTipEl.innerHTML =
      '<b>' + esc(sc.name) + '</b>' +
      '<span class="wm-tip-track">♪ ' + esc(sc.trackName) + '</span>' +
      '<p>' + esc(sc.blurb) + '</p>' +
      '<em>' + tail + '</em>' +
      (locked ? '<span class="wm-tip-lock">🔒 先把前面的章节打通才能进入</span>' : '');
    mapTipEl.classList.toggle('locked', locked);
  }

  function bindMapSpots() {
    if (!sceneGrid) return;
    sceneGrid.addEventListener('click', function (e) {
      var card = e.target.closest ? e.target.closest('.wm-spot') : null;
      if (!card) return;
      if (card.dataset.locked === '1') {
        toast('🔒 这个区域还没解锁，先把前面的章节打通');
        return;
      }
      switchScene(parseInt(card.dataset.scene, 10));
    });
    function pick(e) {
      var s = e.target.closest ? e.target.closest('.wm-spot') : null;
      if (!s) return;
      showMapTip(parseInt(s.dataset.scene, 10));
    }
    sceneGrid.addEventListener('mouseover', pick);
    sceneGrid.addEventListener('focusin', pick);
    sceneGrid.addEventListener('mouseout', function (e) {
      var s = e.target.closest ? e.target.closest('.wm-spot') : null;
      if (!s) return;
      showMapTip(sceneIdx, true);
    });
    sceneGrid.addEventListener('focusout', function () { showMapTip(sceneIdx, true); });
  }

  function openScenePanel() {
    if (!sceneMask) return;
    renderScenePanel();
    sceneMask.classList.add('show');
    sceneMask.setAttribute('aria-hidden', 'false');
  }

  function closeScenePanel() {
    if (!sceneMask) return;
    sceneMask.classList.remove('show');
    sceneMask.setAttribute('aria-hidden', 'true');
  }

  function toggleScenePanel() {
    if (!sceneMask) return;
    if (sceneMask.classList.contains('show')) closeScenePanel();
    else openScenePanel();
  }

  function switchScene(idx, cb) {
    if (idx < 0 || idx >= SCENES.length) return;
    if (idx === sceneIdx && started) { if (cb) cb(); return; }
    closeScenePanel();
    if (sceneFade) sceneFade.classList.add('on');
    setTimeout(function () {
      sceneIdx = idx;
      lastArea = -1;
      lastQuestHtml = '';
      trackedId = null;
      pendingId = null;
      pendingZt = null;
      hoverId = null;
      nearId = null;
      prov.active = null;
      trail = [];
      build();
      cam.z = 1;
      updateZoomLabel();
      snapCam();
      setSceneWeather(currentScene());
      updateArea();
      updateQuests(true);
      updatePrompt();
      if (NS.Audio) NS.Audio.setScene(currentScene().track);
      if (cb) cb();
      setTimeout(function () {
        if (sceneFade) sceneFade.classList.remove('on');
        toast('进入「' + currentScene().name + '」· ♪ ' + currentScene().trackName);
      }, 240);
    }, 230);
  }

  /* ============================================================
   * 7. 输入
   * ============================================================ */
  function isTyping(el) {
    if (!el) return false;
    var tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
  }

  function bind() {
    document.addEventListener('pointerdown', function () { lastInput = performance.now(); }, true);
    window.addEventListener('keydown', function (e) {
      lastInput = performance.now();
      if (isTyping(e.target)) return;
      var k = (e.key || '').toLowerCase();
      if (k === ' ' || k === 'spacebar') k = ' ';
      keys[k] = true;
      if (k === 'm') {
        var am = $('arenaMask');
        if (am && am.classList.contains('show')) return;
        e.preventDefault();
        toggleScenePanel();
        return;
      }
      if (k === 'escape' && sceneMask && sceneMask.classList.contains('show')) {
        e.preventDefault();
        closeScenePanel();
        return;
      }
      if (uiBlocked()) return;
      if (k === 'r') {
        if (NS.Gourd) NS.Gourd.open();
        e.preventDefault();
        return;
      }
      if (k === ' ' || k === 'enter') {
        if (nearId) {
          e.preventDefault();
          interact(npcByNode[nearId]);
        }
      }
      if (k.indexOf('arrow') === 0 || k === ' ') e.preventDefault();
    });
    window.addEventListener('keyup', function (e) {
      var k = (e.key || '').toLowerCase();
      if (k === ' ' || k === 'spacebar') k = ' ';
      keys[k] = false;
    });
    window.addEventListener('blur', function () { keys = {}; });

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', function () {
      hoverId = null;
      if (!down || !down.dragged) canvas.style.cursor = 'default';
      if (hooks.onLeave) hooks.onLeave();
    });
    // 按住左键拖动 = 平移地图；没拖动才算点击
    var down = null;
    canvas.addEventListener('pointerdown', function (e) {
      if (uiBlocked() || (e.button !== undefined && e.button !== 0)) return;
      down = { x: e.clientX, y: e.clientY, camx: cam.x, camy: cam.y, dragged: false };
      if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!down.dragged && Math.hypot(dx, dy) > 5) {
        down.dragged = true;
        canvas.style.cursor = 'grabbing';
      }
      if (down.dragged) {
        cam.x = down.camx - dx / cam.z;
        cam.y = down.camy - dy / cam.z;
        clampCam();
        camFree = 2.0;
      }
    });
    window.addEventListener('pointerup', function (e) {
      if (!down) return;
      var wasDrag = down.dragged;
      down = null;
      canvas.style.cursor = 'crosshair';
      if (!wasDrag && !uiBlocked()) onClick(e);
    });
    canvas.addEventListener('wheel', function (e) {
      if (uiBlocked()) return;
      lastInput = performance.now();
      e.preventDefault();
      var r = canvas.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });

    var zbox = $('worldZoom');
    if (zbox) zbox.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var cx = view.w / 2, cy = view.h / 2;
      if (b.dataset.z === 'in') zoomAt(1.2, cx, cy);
      else if (b.dataset.z === 'out') zoomAt(1 / 1.2, cx, cy);
      else { cam.z = 1; snapCam(); updateZoomLabel(); }
    });

    var sbtn = $('worldSceneBtn');
    if (sbtn) sbtn.addEventListener('click', function () { openScenePanel(); });
    if (sceneMask) {
      sceneMask.addEventListener('click', function (e) {
        if (e.target === sceneMask || (e.target.closest && e.target.closest('#sceneClose'))) closeScenePanel();
      });
    }
    bindMapSpots();

    if (mini) {
      mini.addEventListener('click', function (e) {
        if (uiBlocked()) return;
        var r = mini.getBoundingClientRect();
        var cx = (e.clientX - r.left) / r.width * mini.width;
        var cy = (e.clientY - r.top) / r.height * mini.height;
        var mx = (cx - miniOx) / miniScale;
        var my = (cy - miniOy) / miniScale;
        if (mx < 0 || my < 0 || mx > WORLD_W || my > WORLD_H) return;
        var best = null, bd = 1e9;
        areas.forEach(function (a) {
          var d = Math.hypot(a.cx - mx, a.cy - my);
          if (d < bd) { bd = d; best = a; }
        });
        if (!best) return;
        var p = nearestWalkable(best.cx, best.cy + 150, 10);
        player.x = p.x; player.y = p.y;
        player.path = []; pendingId = null; pendingZt = null;
        snapCam();
        toast('传送到「第 ' + best.chap.no + ' 章 · ' + best.chap.name + '」');
      });
    }

    if (questListEl) {
      questListEl.addEventListener('click', function (e) {
        var row = e.target.closest ? e.target.closest('.q-row') : null;
        if (!row || uiBlocked()) return;
        goQuest(row.dataset.q, row.dataset.kind);
      });
    }

    window.addEventListener('resize', resize);
  }

  /* ============================================================
   * 6.5 任务：一条主线 + 两条支线，点一下就自动走过去
   * ============================================================ */
  function charNameOf(n) {
    var m = NS.Monsters && NS.Monsters.forNode ? NS.Monsters.forNode(n.id) : null;
    return (m && m.name) || '对手';
  }

  function computeQuests() {
    var main = null;
    // 主线：按章节顺序，找当前已解锁、还没通关的第一个考点
    for (var i = 0; i < CHAPS.length && !main; i++) {
      var list = NODES.filter(function (n) { return n.chap === CHAPS[i].id; })
        .sort(function (a, b) {
          if (a.tier !== b.tier) return a.tier - b.tier;
          return b.weight - a.weight;
        });
      for (var j = 0; j < list.length; j++) {
        var n = list[j];
        if (n.wip) continue;
        if (store.unlocked(n).ok && !store.isCleared(n.id)) { main = n; break; }
      }
    }

    var sides = [];
    // 支线 1：已有真题关可打
    for (var k = 0; k < NODES.length; k++) {
      var z = NODES[k];
      if (!store.isCleared(z.id)) continue;
      if (!ztByParent[z.id] || store.ztCleared(z.id)) continue;
      sides.push({ kind: 'zt', node: z });
      break;
    }
    // 支线 2：掌握度最弱的已练考点（回炉补强）
    var weak = store.weakestNodes(20).filter(function (x) {
      return x.m.rate != null && x.m.rate < 0.85 && (!main || x.node.id !== main.id);
    });
    if (weak.length) sides.push({ kind: 'weak', node: weak[0].node });
    // 支线 3：另一条线的下一个可挑战考点（避免一直卡在同一章）
    if (main) {
      var alt = null;
      for (var q = 0; q < NODES.length; q++) {
        var a = NODES[q];
        if (a.wip || a.chap === main.chap) continue;
        if (!store.unlocked(a).ok || store.isCleared(a.id)) continue;
        if (a.module === main.module) continue;
        alt = a; break;
      }
      if (alt) sides.push({ kind: 'alt', node: alt });
    }
    if (sides.length > 2) sides = sides.slice(0, 2);
    return { main: main, sides: sides };
  }

  function questHtml() {
    if (currentScene().arena) {
      var st = (NS.Arena && NS.Arena.status) ? NS.Arena.status() : { round: 0, wins: 0, champion: false, total: 5, opponent: { name: '克林', title: '预选赛' } };
      if (st.champion) {
        return '<div class="q-arena-head">🏆 <b>天下第一</b> · 五轮全胜</div>' +
          '<div class="q-arena-sub">再打一届，刷新你的最好成绩。</div>' +
          '<button class="q-row arena" data-q="arena" data-kind="arena">' +
          '<span class="q-chip">卫冕</span><span class="q-body"><b>再战一届</b><em>重新抽 5 道高难真题</em></span><span class="q-dist">▶</span></button>';
      }
      return '<div class="q-arena-head">⚔️ 第 <b>' + (st.round + 1) + ' / ' + st.total + '</b> 轮 · ' + st.opponent.title + '</div>' +
        '<div class="q-arena-sub">当前对手：<b>' + st.opponent.name + '</b> · 答错即淘汰</div>' +
        '<button class="q-row arena" data-q="arena" data-kind="arena">' +
        '<span class="q-chip">擂台</span><span class="q-body"><b>上台挑战 ' + st.opponent.name + '</b><em>最难的数学二真题 · 一题定胜负</em></span><span class="q-dist">▶</span></button>';
    }
    var q = computeQuests();
    if (!q.main && !q.sides.length) {
      return '<div class="q-done">🏆 所有考点都已通关。回炉间里再磨一磨，或翻兵器库复盘。</div>';
    }
    var out = '';
    if (q.main) {
      out += qRow('main', q.main, 'main', '主线', '挑战');
    }
    q.sides.forEach(function (s) {
      var chip = '支线';
      var act = s.kind === 'zt' ? '真题 ' + (ztByParent[s.node.id] ? ztByParent[s.node.id].count : '') + ' 题'
        : s.kind === 'weak' ? '补强 · 正确率 ' + Math.round((store.mastery(s.node.id).rate || 0) * 100) + '%'
          : '另一条线';
      out += qRow(s.kind === 'zt' ? 'zt' : 'side', s.node, s.kind, chip, act);
    });
    return out;
  }

  function qRow(cls, n, kind, chip, act) {
    var dist = '';
    var npc = npcByNode[n.id];
    if (npc) dist = Math.round(Math.hypot(player.x - npc.x, player.y - npc.y) / 10) + 'm';
    else {
      var si = sceneOfChap(n.chap);
      dist = '<span class="q-scene">' + esc(SCENES[si] ? SCENES[si].name : '') + '</span>';
    }
    return '<button class="q-row ' + cls + (trackedId === n.id ? ' tracked' : '') + '" data-q="' + n.id + '" data-kind="' + kind + '">' +
      '<span class="q-chip">' + chip + '</span>' +
      '<span class="q-body"><b>' + esc(charNameOf(n)) + '</b><em>' + esc(n.name) + ' · ' + esc(act) + '</em></span>' +
      '<span class="q-dist">' + dist + '</span>' +
      '</button>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function goQuest(id, kind) {
    if (kind === 'arena') {
      if (NS.Arena) NS.Arena.beginMatch();
      return;
    }
    var n = BY_ID[id];
    if (!n) return;
    var si = sceneOfChap(n.chap);
    if (si !== sceneIdx) {
      toast('「' + n.name + '」在 ' + SCENES[si].name + '，正在传送…');
      switchScene(si, function () {
        setTimeout(function () { goQuest(id, kind); }, 60);
      });
      return;
    }
    var npc = npcByNode[id];
    if (!npc) return;
    trackedId = id;
    if (kind === 'zt') {
      pendingZt = id;
      pendingId = null;
      walkTo(npc.x, npc.y + 30);
      toast('前往 ' + charNameOf(n) + ' 处，夺真题卷轴');
    } else {
      var u = store.unlocked(n);
      if (!u.ok) { toast('🔒 ' + u.reason); return; }
      pendingId = id;
      pendingZt = null;
      walkTo(npc.x, npc.y + 30);
      toast('前往挑战 ' + charNameOf(n) + '「' + n.name + '」');
    }
    updateQuestsNow();
  }

  function updateQuests(force) {
    if (!questListEl) return;
    var html = questHtml();
    if (!force && html === lastQuestHtml) return;
    lastQuestHtml = html;
    questListEl.innerHTML = html;
  }

  function updateQuestsNow() { updateQuests(true); }

  function worldPoint(e) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / cam.z + cam.x,
      y: (e.clientY - r.top) / cam.z + cam.y,
      cx: e.clientX,
      cy: e.clientY
    };
  }

  function npcAt(wx, wy) {
    var best = null, bd = 1e9;
    for (var i = 0; i < npcs.length; i++) {
      var n = npcs[i];
      var dx = wx - n.x, dy = wy - (n.y - 22);
      if (Math.abs(dx) <= 20 && dy >= -26 && dy <= 26) {
        var d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = n; }
      }
    }
    return best;
  }

  function onMove(e) {
    if (uiBlocked()) return;
    var p = worldPoint(e);
    if (gourdAt(p.x, p.y)) {
      if (hoverId !== null) { hoverId = null; if (hooks.onLeave) hooks.onLeave(); }
      canvas.style.cursor = 'pointer';
      return;
    }
    var z = ztAt(p.x, p.y);
    if (z) {
      if (hoverId !== null) { hoverId = null; if (hooks.onLeave) hooks.onLeave(); }
      canvas.style.cursor = 'pointer';
      return;
    }
    var npc = npcAt(p.x, p.y);
    var id = npc ? npc.id : null;
    if (id !== hoverId) {
      hoverId = id;
      if (id && hooks.onHover) hooks.onHover(id, { clientX: p.cx, clientY: p.cy });
      else if (hooks.onLeave) hooks.onLeave();
    } else if (id && hooks.onMove) {
      hooks.onMove({ clientX: p.cx, clientY: p.cy });
    }
    canvas.style.cursor = id ? 'pointer' : 'crosshair';
  }

  function onClick(e) {
    var p = worldPoint(e);
    if (gourdAt(p.x, p.y)) {
      player.path = [];
      pendingId = null;
      pendingZt = null;
      if (NS.Gourd) NS.Gourd.open();
      return;
    }
    var z = ztAt(p.x, p.y);
    if (z) {
      if (!store.isCleared(z.parent)) {
        toast('🔒 先通关「' + z.node.name + '」，才能取走它的真题卷轴');
        return;
      }
      player.path = [];
      pendingId = null;
      pendingZt = null;
      if (hooks.onZhenti) hooks.onZhenti(z.parent);
      return;
    }
    var npc = npcAt(p.x, p.y);
    if (!npc) {
      pendingId = null;
      pendingZt = null;
      walkTo(p.x, p.y);
      return;
    }
    if (distToNpc(npc) <= NEAR_R) {
      interact(npc);
      return;
    }
    pendingId = npc.id;
    pendingZt = null;
    walkTo(npc.x, npc.y + 26);
  }

  function distToNpc(npc) {
    return Math.hypot(player.x - npc.x, (player.y - npc.y) * 1.15);
  }

  function interact(npc) {
    if (!npc) return;
    if (hooks.onLeave) hooks.onLeave();
    if (npc.arena) {
      if (npc.kind === 'ref' || npc.current) {
        player.path = [];
        if (NS.Arena) NS.Arena.beginMatch();
        else toast('擂台还没准备好');
      } else if (npc.defeated) {
        toast('🏅 ' + npc.spec.name + ' 已经被你打下擂台了');
      } else {
        toast('先赢下当前对手，再挑战 ' + npc.spec.name);
      }
      return;
    }
    var n = npc.node;
    if (n.wip) { toast('🚧「' + n.name + '」题库建设中，先把已开放的考点刷透'); return; }
    var u = store.unlocked(n);
    if (!u.ok) { toast('🔒 ' + u.reason); return; }
    player.path = [];
    if (hooks.onChallenge) hooks.onChallenge(n.id);
  }

  /* ============================================================
   * 8. 更新
   * ============================================================ */
  function update(dt) {
    updateGourd(dt);
    updateWeather(dt);
    updateProvoke(dt);
    updateNpcIdle(dt);
    if (uiBlocked()) {
      keys = {};
      player.path = [];
      pendingId = null;
      player.moving = false;
      updatePrompt();
      return;
    }
    var vx = 0, vy = 0;
    if (keys['w'] || keys['arrowup']) vy--;
    if (keys['s'] || keys['arrowdown']) vy++;
    if (keys['a'] || keys['arrowleft']) vx--;
    if (keys['d'] || keys['arrowright']) vx++;

    if (vx || vy) {
      player.path = [];
      pendingId = null;
      pendingZt = null;
      camFree = 0;
      var len = Math.hypot(vx, vy) || 1;
      moveBy(vx / len * WALK_SPEED * speedMul() * dt, vy / len * WALK_SPEED * speedMul() * dt);
      player.dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up');
      player.walk += dt * 9;
      player.moving = true;
    } else if (player.path.length) {
      var wp = player.path[0];
      var dx = wp.x - player.x, dy = wp.y - player.y;
      var d = Math.hypot(dx, dy);
      if (d < 7) {
        player.path.shift();
        if (!player.path.length) {
          player.moving = false;
          if (pendingId) {
            var npc = npcByNode[pendingId];
            pendingId = null;
            if (npc && distToNpc(npc) <= NEAR_R + 26) interact(npc);
          } else if (pendingZt) {
            var zp = npcByNode[pendingZt];
            var zid = pendingZt;
            pendingZt = null;
            if (zp && distToNpc(zp) <= NEAR_R + 40 && hooks.onZhenti) {
              player.path = [];
              hooks.onZhenti(zid);
            }
          }
        }
      } else {
        var st = Math.min(d, PATH_SPEED * speedMul() * dt);
        moveBy(dx / d * st, dy / d * st);
        player.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        player.walk += dt * 10;
        player.moving = true;
      }
    } else {
      player.moving = false;
    }

    // 最近的可交互角色
    var best = null, bd = NEAR_R;
    for (var i = 0; i < npcs.length; i++) {
      var n = npcs[i];
      var dd = distToNpc(n);
      if (dd < bd) { bd = dd; best = n; }
    }
    nearId = best ? best.id : null;
    updatePrompt();
    updateArea();

    // 摄像机跟随（拖拽后的 2 秒内不抢镜头）
    if (camFree > 0) {
      camFree -= dt;
      clampCam();
    } else {
      var tx = clamp(player.x - vw() / 2, 0, Math.max(0, WORLD_W - vw()));
      var ty = clamp(player.y - vh() / 2, 0, Math.max(0, WORLD_H - vh()));
      cam.x += (tx - cam.x) * Math.min(1, dt * 7);
      cam.y += (ty - cam.y) * Math.min(1, dt * 7);
      clampCam();
    }

    questTimer += dt;
    if (questTimer > 0.6) { questTimer = 0; updateQuests(false); }
    chipTimer += dt;
    if (chipTimer > 1) { chipTimer = 0; updateChips(); }

    // 皮肤残影采样与衰减
    var fxNow = (NS.Gear && NS.Gear.fx) ? NS.Gear.fx() : null;
    for (var ti = trail.length - 1; ti >= 0; ti--) {
      trail[ti].life -= dt * 1.9;
      if (trail[ti].life <= 0) trail.splice(ti, 1);
    }
    trailClock += dt;
    if (hasTrailFx(fxNow) && player.moving && trailClock > 0.085) {
      trailClock = 0;
      trail.push({ x: player.x, y: player.y, dir: player.dir, life: 1 });
      if (trail.length > 8) trail.shift();
    }
  }

  /* ============================================================
   * 天气 / 氛围粒子：每个场景一种，和背景音乐的情绪对齐
   * ============================================================ */
  function setSceneWeather(sc) {
    weather.mode = sc.weather;
    weather.until = 0;
    weather.wind = 0;
    weather.drops = [];
    seedAmbient(weather.mode);
    updateChips();
  }

  function seedAmbient(mode) {
    var W = Math.max(640, view.w), H = Math.max(420, view.h);
    weather.drops = [];
    if (mode === 'snow') {
      for (var i = 0; i < 150; i++) {
        weather.drops.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 1 + Math.random() * 2.2, sp: 26 + Math.random() * 46,
          sw: 0.6 + Math.random() * 1.6, ph: Math.random() * 6.28
        });
      }
    } else if (mode === 'petal') {
      for (var j = 0; j < 44; j++) {
        weather.drops.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 2 + Math.random() * 2, sp: 16 + Math.random() * 26,
          sw: 12 + Math.random() * 22, ph: Math.random() * 6.28,
          c: Math.random() < 0.5 ? 'rgba(251,207,232,0.85)' : 'rgba(220,252,231,0.7)'
        });
      }
    } else if (mode === 'mote') {
      for (var k = 0; k < 58; k++) {
        weather.drops.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 1 + Math.random() * 1.8, sp: 6 + Math.random() * 16,
          sw: 8 + Math.random() * 16, ph: Math.random() * 6.28,
          c: Math.random() < 0.55 ? 'rgba(191,239,255,0.85)' : 'rgba(221,214,254,0.8)'
        });
      }
    } else if (mode === 'spark') {
      for (var m = 0; m < 46; m++) {
        weather.drops.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 1 + Math.random() * 1.6, sp: 14 + Math.random() * 30,
          sw: 6 + Math.random() * 14, ph: Math.random() * 6.28,
          c: Math.random() < 0.5 ? 'rgba(244,114,182,0.85)' : 'rgba(56,189,248,0.8)'
        });
      }
    } else if (mode === 'firefly') {
      for (var n = 0; n < 46; n++) {
        weather.drops.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 1.4 + Math.random() * 2.2, sp: 5 + Math.random() * 12,
          sw: 14 + Math.random() * 26, ph: Math.random() * 6.28,
          c: Math.random() < 0.7 ? 'rgba(253,224,71,0.95)' : 'rgba(134,239,172,0.9)'
        });
      }
    } else if (mode === 'star') {
      for (var p = 0; p < 90; p++) {
        weather.drops.push({
          x: Math.random() * W, y: Math.random() * H * 0.72,
          r: 1 + Math.random() * 1.6, sp: 0, sw: 0, ph: Math.random() * 6.28,
          c: Math.random() < 0.6 ? 'rgba(191,219,254,0.85)' : 'rgba(233,213,255,0.8)'
        });
      }
    }
  }

  function updateWeather(dt) {
    var W = Math.max(640, view.w), H = Math.max(420, view.h);
    var mode = weather.mode;
    if (mode === 'star') return;
    for (var i = 0; i < weather.drops.length; i++) {
      var d = weather.drops[i];
      if (mode === 'snow' || mode === 'petal') {
        d.y += d.sp * dt;
        d.x += Math.sin(d.ph + d.y * 0.02) * d.sw * dt;
        if (d.y > H + 12) { d.y = -12; d.x = Math.random() * W; }
        if (d.x < -20) d.x = W + 18;
        if (d.x > W + 20) d.x = -18;
      } else if (mode === 'mote' || mode === 'spark' || mode === 'firefly') {
        d.y -= d.sp * dt;
        d.x += Math.cos(d.ph + d.y * 0.015) * d.sw * dt;
        if (d.y < -14) { d.y = H + 10; d.x = Math.random() * W; }
        if (d.x < -20) d.x = W + 18;
        if (d.x > W + 20) d.x = -18;
      }
    }
  }

  function drawWeather(t) {
    var mode = weather.mode;
    if (!mode || !weather.drops.length) return;

    if (mode === 'star') {
      for (var s = 0; s < weather.drops.length; s++) {
        var st = weather.drops[s];
        var tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.4 + st.ph));
        ctx.globalAlpha = tw * 0.9;
        ctx.fillStyle = st.c;
        ctx.fillRect(st.x, st.y, st.r, st.r);
      }
      ctx.globalAlpha = 1;
      // 偶尔来一颗流星
      var cyc = (t * 0.09) % 14;
      if (cyc < 0.65) {
        var k = cyc / 0.65;
        var sx = view.w * (0.18 + 0.6 * ((t * 0.09) % 3) / 3);
        var sy = 70 + 40 * Math.sin(t);
        ctx.strokeStyle = 'rgba(191,239,255,' + (0.55 * (1 - k)).toFixed(2) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx + k * 130, sy + k * 34);
        ctx.lineTo(sx + k * 130 - 46, sy + k * 34 - 12);
        ctx.stroke();
      }
      return;
    }

    if (mode === 'snow') {
      ctx.fillStyle = 'rgba(226,244,255,0.8)';
      for (var i = 0; i < weather.drops.length; i++) {
        var d = weather.drops[i];
        ctx.globalAlpha = 0.55 + 0.4 * Math.abs(Math.sin(t + d.ph));
        ctx.fillRect(d.x, d.y, d.r, d.r);
      }
      ctx.globalAlpha = 1;
      return;
    }

    if (mode === 'petal') {
      for (var j = 0; j < weather.drops.length; j++) {
        var p = weather.drops[j];
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(p.x, p.y, p.r + 1, p.r);
      }
      ctx.globalAlpha = 1;
      return;
    }

    // 上升光点（天界 / 霓虹 / 萤火）
    for (var k = 0; k < weather.drops.length; k++) {
      var q = weather.drops[k];
      var glow = 0.5 + 0.5 * Math.abs(Math.sin(t * 1.8 + q.ph));
      ctx.globalAlpha = glow * (mode === 'firefly' ? 0.95 : 0.75);
      ctx.fillStyle = q.c;
      ctx.fillRect(q.x, q.y, q.r + 1, q.r + 1);
      if (mode === 'firefly' && glow > 0.7) {
        ctx.globalAlpha = 0.16;
        ctx.beginPath();
        ctx.arc(q.x + 1, q.y + 1, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function updateChips() {
    var sc = currentScene();
    var wEl = $('worldWeather');
    if (wEl) wEl.textContent = sc.weatherLabel;
    var mEl = $('worldMount');
    if (mEl) {
      var m = (NS.Gear && NS.Gear.equippedMount) ? NS.Gear.equippedMount() : null;
      mEl.textContent = m
        ? m.icon + ' ' + m.name + ' +' + Math.round((m.speed - 1) * 100) + '%'
        : '🏃 步行';
    }
    var nEl = $('worldSceneName');
    if (nEl) nEl.textContent = sc.name;
    var tEl = $('worldSceneTrack');
    if (tEl) tEl.textContent = '♪ ' + sc.trackName;
  }

  /* ============================================================
   * 葫芦法宝：悬空跟随，点它 / 按 R 打开每日复盘
   * ============================================================ */
  function updateGourd(dt) {
    var tx = player.x + 30, ty = player.y - 34;
    if (!gourdPos.init) {
      gourdPos.x = tx; gourdPos.y = ty; gourdPos.init = true;
    }
    gourdPos.x += (tx - gourdPos.x) * Math.min(1, dt * 7);
    gourdPos.y += (ty - gourdPos.y) * Math.min(1, dt * 7);
  }

  function gourdAt(wx, wy) {
    return Math.abs(wx - gourdPos.x) <= 18 && Math.abs(wy - (gourdPos.y - 6)) <= 22;
  }

  function drawGourd(t) {
    if (!gourdPos.init) return;
    var sx = Math.round(gourdPos.x - cam.x);
    var sy = Math.round(gourdPos.y - cam.y);
    if (sx < -40 || sx > view.w + 40 || sy < -50 || sy > view.h + 50) return;
    var ready = NS.Gourd && NS.Gourd.isReady();
    var bob = Math.sin(t * 2.4) * 2.2;
    sy += bob;

    if (ready) {
      var g = ctx.createRadialGradient(sx, sy - 8, 2, sx, sy - 8, 28);
      g.addColorStop(0, 'rgba(251,191,36,0.34)');
      g.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(sx, sy - 8, 28, 0, Math.PI * 2); ctx.fill();
    }

    ctx.save();
    if (!ready) ctx.globalAlpha = 0.72;
    // 下肚
    ctx.fillStyle = '#d97706';
    ctx.beginPath(); ctx.ellipse(sx, sy, 9, 8, 0, 0, Math.PI * 2); ctx.fill();
    // 上肚
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(sx, sy - 10, 6.5, 0, Math.PI * 2); ctx.fill();
    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.ellipse(sx - 3, sy - 3, 2, 3.5, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx - 2, sy - 12, 1.5, 2, -0.5, 0, Math.PI * 2); ctx.fill();
    // 藤蔓
    ctx.strokeStyle = '#4d7c0f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 16);
    ctx.quadraticCurveTo(sx + 6, sy - 20, sx + 10, sy - 17);
    ctx.stroke();
    // 塞子
    ctx.fillStyle = '#78350f';
    ctx.fillRect(sx - 2, sy - 18, 4, 3);
    ctx.restore();

    if (ready) {
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.arc(sx + 13, sy - 22, 7.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3b2506';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', sx + 13, sy - 21);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  }

  /* ============================================================
   * 挑衅：已解锁但没通关的人，会主动走到你面前下战书
   * ------------------------------------------------------------
   * 触发条件：你站在原地 2 秒以上、他在 420px 内、双方都没冷却。
   * 冷却：单人 180 秒，全局 20 秒 —— 不至于变成一群人围殴。
   * ============================================================ */
  function npcMove(n, dx, dy) {
    if (!hit(n.x + dx, n.y)) n.x += dx;
    if (!hit(n.x, n.y + dy)) n.y += dy;
  }

  /* 待机行为：踱步 / 说话 / 东张西望，都在 home 附近进行 */
  function updateNpcIdle(dt) {
    var now = performance.now();
    for (var i = 0; i < npcs.length; i++) {
      var n = npcs[i];
      if (!n.idle) continue;
      n.idleT += dt;
      if (n.provoked || n.approach) continue;

      // 没打赢、又能挑战的守关人，偶尔放句狠话（只在玩家附近）
      n.tauntT += dt;
      if (n.tauntT >= n.tauntGap) {
        n.tauntT = 0;
        n.tauntGap = 8 + (hashStr(n.id + Math.round(now / 1000)) % 60) / 10;
        var challengeable = !n.arena && !n.wip &&
          !store.isCleared(n.id) && store.unlocked(n.node).ok;
        if (challengeable && !n.say && nearId !== n.id && distToNpc(n) < 460) {
          var tl = TAUNT_LINES[n.spec.key] || TAUNT_LINES['default'];
          n.taunt = tl[hashStr(n.id + Math.round(now / 300)) % tl.length];
          n.tauntUntil = now + 2600;
        }
      }

      if (n.idle === 'pace') {
        var dx = n.x - n.home.x;
        if (n.paceDir > 0 && dx > 38) n.paceDir = -1;
        if (n.paceDir < 0 && dx < -38) n.paceDir = 1;
        var oldX = n.x;
        npcMove(n, n.paceDir * 26 * dt, 0);
        n.paceMoving = Math.abs(n.x - oldX) > 0.001;
        if (n.paceMoving) n.walk += dt * 5.5;
      }

      var pkey = n.spec && n.spec.key;
      var persona = (NS.PERSONAS || {})[pkey];
      var cleared = !n.arena && n.node && store.isCleared(n.id);
      // 玩家走近时主动打招呼：让「拜访」像一次相遇，而不是走到一个菜单前
      n.greetT = (n.greetT || 0) - dt;
      if (n.greetT <= 0 && !n.say && now >= (n.tauntUntil || 0) && distToNpc(n) < 100) {
        n.greetT = 16 + (hashStr(n.id) % 10);
        var gp = persona ? (cleared ? persona.after : persona.meet) : null;
        var gl = (gp && gp.length) ? gp : (IDLE_LINES[pkey] || IDLE_LINES['default']);
        n.idleSay = gl[hashStr(n.id + Math.round(now / 400)) % gl.length];
        n.idleSayUntil = now + 3000;
      }
      // 有人物志的角色都会偶尔说话：没通关说「初见」，通关后说「认可」
      if (n.idle === 'talk' || persona) {
        n.talkT += dt;
        if (n.talkT >= n.talkGap) {
          n.talkT = 0;
          n.talkGap = 9 + (hashStr(n.id + Math.round(now / 1000)) % 60) / 10;
          var pool = persona ? (cleared ? persona.after : persona.meet) : null;
          var lines = (pool && pool.length) ? pool : (IDLE_LINES[pkey] || IDLE_LINES['default']);
          // 狠话/挑衅正在显示时不抢气泡；玩家已经站在他面前时也不用重复
          if (!n.say && now >= (n.tauntUntil || 0) && nearId !== n.id && distToNpc(n) < 420) {
            n.idleSay = lines[hashStr(n.id + Math.round(now / 500)) % lines.length];
            n.idleSayUntil = now + 2600;
          }
        }
      }

      if (n.idle === 'lookout') {
        n.lookT += dt;
        if (n.lookT > 2.4) {
          n.lookT = 0;
          var dirs = ['left', 'right', 'down', 'down'];
          n.lookDir = dirs[hashStr(n.id + Math.round(now / 700)) % dirs.length];
        }
      }
    }
  }

  function updateProvoke(dt) {
    var now = performance.now();
    if (currentScene().arena) return;

    // 挑衅完的人自己走回原位
    for (var i = 0; i < npcs.length; i++) {
      var h = npcs[i];
      if (!h.provoked || h === prov.active) continue;
      var hx = h.home.x - h.x, hy = h.home.y - h.y;
      var hd = Math.hypot(hx, hy);
      if (hd > 2.5) {
        npcMove(h, hx / hd * 95 * dt, hy / hd * 95 * dt);
      } else {
        h.x = h.home.x; h.y = h.home.y;
        h.provoked = false;
      }
    }

    if (uiBlocked()) {
      prov.idle = 0;
      lastUiAt = now;
      uiWasBlocked = true;
      // 弹窗一开，正在走来的挑衅者原地作罢，免得关窗后被贴脸开战
      if (prov.active) {
        prov.active.say = '';
        prov.active.triggerAt = 0;
        prov.active.provoked = true;
        prov.active = null;
      }
      return;
    }
    if (uiWasBlocked) {
      // 从弹窗关闭的那一刻重新计时，避免「关掉就立刻换个人来敲门」
      uiWasBlocked = false;
      prov.nextAt = Math.max(prov.nextAt, now + 60000);
    }

    if (prov.active) {
      var n = prov.active;
      var d = distToNpc(n);
      if (d > 62) {
        var dx = player.x - n.x, dy = player.y - n.y;
        var len = Math.hypot(dx, dy) || 1;
        var before = d;
        npcMove(n, dx / len * 120 * dt, dy / len * 120 * dt);
        n.approach.t += dt;
        if (Math.abs(distToNpc(n) - before) < 0.25) n.approach.stuck += dt;
        else n.approach.stuck = 0;
        if (n.approach.t > 9 || n.approach.stuck > 1.4) {
          // 被树挡住 / 走不过来：放弃，回原位
          n.say = '';
          n.provoked = true;
          prov.cool[n.id] = now + 60000;
          prov.nextAt = now + 10000;
          prov.active = null;
        }
        return;
      }
      if (!n.triggerAt) {
        n.triggerAt = now + 850;
        n.say = '接招！';
        return;
      }
      if (now >= n.triggerAt) {
        n.triggerAt = 0;
        n.say = '';
        n.provoked = true;
        prov.cool[n.id] = now + 240000;
        prov.nextAt = now + 45000;
        prov.active = null;
        player.path = [];
        if (hooks.onChallenge) hooks.onChallenge(n.node.id);
      }
      return;
    }

    if (player.moving || player.path.length) { prov.idle = 0; return; }
    prov.idle += dt;
    if (prov.idle < 6 || now < prov.nextAt) return;
    if (now - lastInput < 6000 || now - lastUiAt < 3000) return;

    var best = null, bd = 420;
    for (var k = 0; k < npcs.length; k++) {
      var c = npcs[k];
      if (c.node.wip || store.isCleared(c.id)) continue;
      if (!store.unlocked(c.node).ok) continue;
      if ((prov.cool[c.id] || 0) > now) continue;
      if (nearId === c.id) continue;
      var cd = distToNpc(c);
      if (cd > 110 && cd < bd) { bd = cd; best = c; }
    }
    if (!best) return;
    prov.active = best;
    best.provoked = true;
    best.approach = { t: 0, stuck: 0 };
    best.say = '「' + best.node.name + '」敢接吗？';
    best.triggerAt = 0;
  }

  function updatePrompt() {
    if (!promptEl) return;
    var npc = nearId ? npcByNode[nearId] : null;
    if (!npc) {
      if (lastPrompt !== '') { promptEl.hidden = true; promptEl.innerHTML = ''; lastPrompt = ''; }
      return;
    }
    var n = npc.node;
    var html;
    if (npc.arena) {
      if (npc.kind === 'ref') html = '<kbd>空格</kbd> 开始比赛 · <b>天下第一武道会</b>';
      else if (npc.defeated) html = '🏅 <b>' + npc.spec.name + '</b> · 已击败';
      else if (npc.current) html = '<kbd>空格</kbd> 挑战 · <b>' + npc.spec.name + ' · ' + n.name + '</b>';
      else html = '🔒 <b>' + npc.spec.name + '</b> · 先赢下当前对手';
    } else if (n.wip) {
      html = '🚧 <b>' + n.name + '</b> · 题库建设中';
    } else if (!store.unlocked(n).ok) {
      html = '🔒 <b>' + n.name + '</b> · ' + store.unlocked(n).reason;
    } else if (store.isCleared(n.id)) {
      html = '<kbd>空格</kbd> 再战 / 查看兵器 · <b>' + n.name + '</b>';
    } else {
      html = '<kbd>空格</kbd> 挑战 · <b>' + n.name + '</b>';
    }
    if (html !== lastPrompt) { promptEl.innerHTML = html; promptEl.hidden = false; lastPrompt = html; }
  }

  function updateArea() {
    if (!areaEl) return;
    var best = -1, bd = 330;
    for (var i = 0; i < areas.length; i++) {
      var d = Math.hypot(player.x - areas[i].cx, (player.y - areas[i].cy) / 0.82);
      if (d < bd) { bd = d; best = i; }
    }
    // 没进营地时，显示最近的一章，避免左上角空着
    if (best === -1) best = lastArea < 0 ? 0 : lastArea;
    if (best === lastArea) return;
    lastArea = best;
    var a = areas[best];
    if (a.arena) {
      var st = (NS.Arena && NS.Arena.status) ? NS.Arena.status() : { round: 0, wins: 0, champion: false, total: 5, opponent: { name: '克林' } };
      var rec = NS.Store ? NS.Store.arena() : { champion: 0, best: 0 };
      areaEl.innerHTML = '<b>天下第一武道会</b>' +
        '<span>' + (st.champion ? '🏆 已夺冠' : '第 ' + (st.round + 1) + ' / ' + st.total + ' 轮 · ' + st.opponent.name) +
        '　·　冠军 ' + rec.champion + ' 次</span>';
      return;
    }
    var cleared = a.nodes.filter(function (n) { return store.isCleared(n.id); }).length;
    areaEl.innerHTML = '<b>第 ' + a.chap.no + ' 章 · ' + a.chap.name + '</b>' +
      '<span>' + a.pal.name + '　·　已通关 ' + cleared + ' / ' + a.nodes.length + '</span>';
  }

  /* ============================================================
   * 9. 渲染
   * ============================================================ */
  function draw(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr * cam.z, 0, 0, dpr * cam.z, 0, 0);
    ctx.imageSmoothingEnabled = false;

    var cx = cam.x, cy = cam.y;
    ctx.drawImage(terrain, cx, cy, vw(), vh(), 0, 0, vw(), vh());

    // 擂台观众席的旗帜 / 闪光灯 / 顶光
    if (currentScene().arena) drawArenaLive(t);

    // 点击目标标记
    if (player.path.length) {
      var dest = player.path[player.path.length - 1];
      var dx = dest.x - cam.x, dy = dest.y - cam.y;
      if (dx > -20 && dx < view.w + 20 && dy > -20 && dy < view.h + 20) {
        ctx.strokeStyle = 'rgba(125,211,252,0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dx, dy, 8 + Math.sin(t * 6) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(dx - 4, dy); ctx.lineTo(dx + 4, dy);
        ctx.moveTo(dx, dy - 4); ctx.lineTo(dx, dy + 4); ctx.stroke();
      }
    }

    // 按 y 排序，做出前后遮挡
    var order = npcs.slice();
    order.push({
      id: '__player', node: null, x: player.x, y: player.y, spec: PLAYER_SPEC,
      phase: 0, isPlayer: true
    });
    order.sort(function (a, b) { return a.y - b.y; });

    for (var i = 0; i < order.length; i++) {
      var e = order[i];
      if (e.isPlayer) drawPlayer(t);
      else drawNpc(e, t);
    }

    drawGourd(t);

    // 回到屏幕坐标，画固定大小的 UI 层
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 追踪任务的指引箭头（目标在屏幕外时贴边显示）
    if (trackedId) {
      var tn = npcByNode[trackedId];
      if (tn) {
        var ttx = (tn.x - cam.x) * cam.z, tty = (tn.y - 30 - cam.y) * cam.z;
        var mg = 74;
        if (ttx < mg || ttx > view.w - mg || tty < mg || tty > view.h - mg) {
          var ang = Math.atan2(tty - view.h / 2, ttx - view.w / 2);
          var ax = clamp(ttx, mg, view.w - mg), ayy = clamp(tty, mg, view.h - mg);
          ctx.save();
          ctx.translate(ax, ayy);
          ctx.rotate(ang);
          ctx.fillStyle = 'rgba(251,191,36,0.92)';
          ctx.beginPath();
          ctx.moveTo(14, 0); ctx.lineTo(-6, -9); ctx.lineTo(-2, 0); ctx.lineTo(-6, 9);
          ctx.closePath(); ctx.fill();
          ctx.restore();
          var d = Math.round(Math.hypot(player.x - tn.x, player.y - tn.y) / 10);
          ctx.fillStyle = 'rgba(251,191,36,0.95)';
          ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(d + 'm', ax, ayy + 20);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
        }
      }
    }

    drawWeather(t);

    // 场景色调（暖集市 / 冷雪原 / 夜街区），让整张图的情绪统一
    var sc = currentScene();
    if (sc.grade) {
      ctx.fillStyle = sc.grade;
      ctx.fillRect(0, 0, view.w, view.h);
    }

    // 暗角
    var vg = ctx.createRadialGradient(view.w / 2, view.h / 2, Math.min(view.w, view.h) * 0.42,
      view.w / 2, view.h / 2, Math.max(view.w, view.h) * 0.78);
    vg.addColorStop(0, 'rgba(6,10,20,0)');
    vg.addColorStop(1, sc.vignette || 'rgba(6,10,20,0.42)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, view.w, view.h);
  }

  function drawShadow(x, y, s) {
    s = s || 1;
    ctx.fillStyle = 'rgba(10,20,12,0.28)';
    ctx.beginPath();
    ctx.ellipse(x, y, 11 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 画像素小人：1:1 时保持硬边；只有「非半整数倍」缩放（125% DPI、120% 地图缩放等）
   * 才临时开双线性，避免最近邻采样丢掉整行整列、把脸采样成马赛克。
   */
  function blitSprite(img, x, y, w, h) {
    var eff = cam.z * (window.devicePixelRatio || 1);
    var smooth = Math.abs(eff * 2 - Math.round(eff * 2)) > 0.01;
    ctx.imageSmoothingEnabled = smooth;
    ctx.drawImage(img, x, y, w, h);
    ctx.imageSmoothingEnabled = false;
  }

  function dirToPlayer(npc) {
    var dx = player.x - npc.x, dy = player.y - npc.y;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'down' : 'up';
  }

  function drawNpc(npc, t) {
    var sx = Math.round(npc.x - cam.x);
    var sy = Math.round(npc.y - cam.y);
    if (sx < -110 || sx > vw() + 110 || sy < -160 || sy > vh() + 130) return;

    var n = npc.node;
    var cleared = !!npc.defeated || store.isCleared(n.id);
    var unlocked = !!npc.defeated || (!n.wip && store.unlocked(n).ok);
    var near = nearId === npc.id;

    // 擂台当前对手：金色聚光
    if (npc.current) {
      var spot = ctx.createRadialGradient(sx, sy - 20, 4, sx, sy - 20, 54);
      spot.addColorStop(0, 'rgba(251,191,36,0.30)');
      spot.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = spot;
      ctx.beginPath(); ctx.arc(sx, sy - 20, 54, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(251,191,36,0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 1, 25 + Math.sin(t * 4) * 2, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 三层光：BOSS / 已通关 / 可挑战
    if (n.tier === 3 && !n.wip && !npc.arena) {
      var aura = ctx.createRadialGradient(sx, sy - 18, 4, sx, sy - 18, 46);
      aura.addColorStop(0, 'rgba(251,113,133,0.20)');
      aura.addColorStop(1, 'rgba(251,113,133,0)');
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(sx, sy - 18, 46, 0, Math.PI * 2); ctx.fill();
    }
    if (near) {
      ctx.strokeStyle = 'rgba(251,191,36,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 22 + Math.sin(t * 5) * 2, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    var idle = npc.idle || 'breathe';
    var hh = npc.spec.h || 0;
    var spH = 52 + 2 * hh;
    drawShadow(sx, sy + 1, (idle === 'float' ? 0.68 : 1) + hh * 0.04);

    var set = getSprites(npc.spec);
    var dir;
    if (near || distToNpc(npc) < 150) dir = dirToPlayer(npc);
    else if (idle === 'pace' && npc.paceDir) dir = npc.paceDir > 0 ? 'right' : 'left';
    else if (idle === 'lookout' && npc.lookDir) dir = npc.lookDir;
    else dir = 'down';

    var frame = (idle === 'pace' && npc.paceMoving) ? Math.floor(npc.walk || 0) % 4 : 0;
    var bob;
    if (idle === 'sleep') bob = Math.sin(t * 1.1 + npc.phase) * 2.4;
    else if (idle === 'float') bob = -4 + Math.sin(t * 2.2 + npc.phase) * 2;
    else if (idle === 'dance') bob = -Math.abs(Math.sin(t * 4 + npc.phase)) * 4;
    else if (idle === 'flex') bob = Math.sin(t * 3 + npc.phase) * 1.8;
    else if (idle === 'meditate') bob = -2 + Math.sin(t * 1.4 + npc.phase);
    else bob = Math.sin(t * 2 + npc.phase) * 1.4;
    var sway = idle === 'dance' ? Math.sin(t * 4 + npc.phase) * 2 : 0;

    ctx.save();
    if (!unlocked || npc.defeated) ctx.globalAlpha = 0.55;
    blitSprite(set[dir][frame], sx - 20 + sway, sy - 50 - 2 * hh + bob, 40, spH);
    ctx.restore();

    // 名字牌：第一行守关人（龙珠角色），第二行考点
    var cname = npc.spec.name || '';
    var label = trunc(n.name, 9);
    var ph = cname ? 30 : 19;
    ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
    var w1 = cname ? ctx.measureText(cname).width : 0;
    ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
    var w2 = ctx.measureText(label).width;
    var pw = Math.max(58, w1 + 16, w2 + 22);
    var px = sx - pw / 2, py = sy - (50 + 2 * hh) - 8 - ph + bob;
    roundRect(px, py, pw, ph, 5);
    ctx.fillStyle = 'rgba(8,14,26,0.84)';
    ctx.fill();
    ctx.strokeStyle = n.wip ? 'rgba(120,140,170,0.45)'
      : npc.current ? 'rgba(251,191,36,0.95)'
        : cleared ? 'rgba(52,211,153,0.75)'
          : unlocked ? 'rgba(56,189,248,0.65)' : 'rgba(100,116,139,0.5)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 掌握度小圆点
    var m = store.mastery(n.id);
    var mcol = ['#475569', '#fb7185', '#f59e0b', '#34d399'][m.level] || '#475569';
    ctx.fillStyle = mcol;
    ctx.beginPath(); ctx.arc(px + 9, py + ph / 2, 3, 0, Math.PI * 2); ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (cname) {
      ctx.font = 'bold 10px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(cname, sx + 3, py + 8);
    }
    ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = cleared ? '#bbf7d0' : (unlocked ? '#dce9ff' : '#94a3b8');
    ctx.fillText(label, sx + 3, py + (cname ? 21 : 10));

    // 挑衅气泡 / 头顶状态
    if (npc.say) {
      ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
      var sw = ctx.measureText(npc.say).width + 20;
      var bx0 = sx - sw / 2, by0 = py - 30;
      roundRect(bx0, by0, sw, 22, 7);
      ctx.fillStyle = 'rgba(251,191,36,0.96)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,70,10,0.75)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(251,191,36,0.96)';
      ctx.beginPath();
      ctx.moveTo(sx - 5, by0 + 21);
      ctx.lineTo(sx + 5, by0 + 21);
      ctx.lineTo(sx, by0 + 28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3b2506';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(npc.say, sx, by0 + 11);
    } else if (npc.taunt && performance.now() < (npc.tauntUntil || 0) && !cleared) {
      // 狠话：深底红边 + 交叉剑，一眼能看出「这家伙可以打」
      ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
      var tline = '⚔ ' + npc.taunt;
      var tw = ctx.measureText(tline).width + 18;
      var tx0 = sx - tw / 2, ty0 = py - 29;
      roundRect(tx0, ty0, tw, 22, 7);
      ctx.fillStyle = 'rgba(38,14,16,0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(248,113,113,0.92)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // 气泡小尾巴
      ctx.fillStyle = 'rgba(38,14,16,0.95)';
      ctx.beginPath();
      ctx.moveTo(sx - 5, ty0 + 21);
      ctx.lineTo(sx + 5, ty0 + 21);
      ctx.lineTo(sx, ty0 + 28);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(248,113,113,0.92)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx - 5, ty0 + 21);
      ctx.lineTo(sx, ty0 + 28);
      ctx.lineTo(sx + 5, ty0 + 21);
      ctx.stroke();
      ctx.fillStyle = '#fecaca';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tline, sx, ty0 + 11);
    } else if (npc.idleSay && performance.now() < (npc.idleSayUntil || 0)) {
      // 待机闲聊：白底小气泡，和金色的挑衅气泡区分开
      ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
      var iw = ctx.measureText(npc.idleSay).width + 18;
      var ix = sx - iw / 2, iy = py - 28;
      roundRect(ix, iy, iw, 21, 7);
      ctx.fillStyle = 'rgba(232,240,252,0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(100,116,139,0.55)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(232,240,252,0.95)';
      ctx.beginPath();
      ctx.moveTo(sx - 4, iy + 20);
      ctx.lineTo(sx + 4, iy + 20);
      ctx.lineTo(sx, iy + 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(npc.idleSay, sx, iy + 10.5);
    } else if (n.wip) {
      ctx.font = '12px sans-serif';
      ctx.fillText('🚧', sx, py - 12);
    } else if (cleared) {
      drawWeapon(sx, py - 22, t);
    } else if (unlocked) {
      var pulse = 1 + Math.sin(t * 3 + npc.phase) * 0.08;
      ctx.save();
      ctx.translate(sx, py - 16);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('!', 0, 1);
      ctx.restore();
    } else {
      drawLock(sx, py - 14);
    }

    // 待机小特效：睡觉 Zzz / 打坐光环 / 漂浮气环 / 跳舞音符
    if (idle === 'sleep') {
      ctx.save();
      ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      for (var z = 0; z < 3; z++) {
        var zt = (t * 0.5 + z * 0.34) % 1;
        ctx.globalAlpha = 0.85 * (1 - zt);
        ctx.fillText('z', sx + 12 + zt * 9, sy - 54 - zt * 16);
      }
      ctx.restore();
    } else if (idle === 'meditate') {
      ctx.save();
      ctx.strokeStyle = 'rgba(56,189,248,' + (0.22 + 0.14 * Math.sin(t * 2 + npc.phase)).toFixed(2) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 2, 20, 7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#7dd3fc';
      for (var md = 0; md < 3; md++) {
        var mt2 = (t * 0.5 + md * 0.33) % 1;
        ctx.globalAlpha = 0.55 * (1 - mt2);
        ctx.fillRect(sx - 9 + md * 9, sy - 8 - mt2 * 22, 1.6, 1.6);
      }
      ctx.restore();
    } else if (idle === 'float') {
      ctx.save();
      ctx.strokeStyle = 'rgba(196,181,253,' + (0.18 + 0.12 * Math.sin(t * 2.4 + npc.phase)).toFixed(2) + ')';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 2, 17 + Math.sin(t * 2) * 2, 5.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (idle === 'dance') {
      ctx.save();
      ctx.fillStyle = '#f9a8d4';
      ctx.font = 'bold 12px "Microsoft YaHei", sans-serif';
      for (var nt = 0; nt < 2; nt++) {
        var nt2 = (t * 0.4 + nt * 0.5) % 1;
        ctx.globalAlpha = 0.8 * (1 - nt2);
        ctx.fillText(nt ? '♪' : '♫', sx + (nt ? 16 : -18) + Math.sin(nt2 * 6) * 4, sy - 46 - nt2 * 20);
      }
      ctx.restore();
    }

    if (ztByParent[n.id] && !n.wip) drawZtScroll(npc, sx, sy, cleared, t);

    if (trackedId === n.id) {
      var ay = py - 44 + Math.sin(t * 4) * 4;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(sx, ay + 10);
      ctx.lineTo(sx - 8, ay);
      ctx.lineTo(sx + 8, ay);
      ctx.closePath();
      ctx.fill();
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  /* ---- 真题卷轴：挂在通关后的角色旁边 ---- */
  function ztScrollPos(npc) {
    return { x: npc.x + 32, y: npc.y - 20 };
  }

  function drawZtScroll(npc, sx, sy, parentCleared, t) {
    var z = ztByParent[npc.id];
    if (!z) return;
    var done = store.ztCleared(npc.id);
    var x = sx + 32, y = sy - 20;
    var bob = Math.sin(t * 2.4 + npc.phase) * 1.2;
    y += bob;

    if (parentCleared) {
      var glow = ctx.createRadialGradient(x, y, 2, x, y, 22);
      glow.addColorStop(0, done ? 'rgba(52,211,153,0.28)' : 'rgba(251,191,36,0.26)');
      glow.addColorStop(1, 'rgba(251,191,36,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
    }

    ctx.save();
    if (!parentCleared) ctx.globalAlpha = 0.45;
    // 卷轴纸
    roundRect(x - 10, y - 13, 20, 26, 3);
    ctx.fillStyle = parentCleared ? '#f5e6c8' : '#cbd5e1';
    ctx.fill();
    ctx.strokeStyle = parentCleared ? '#b45309' : '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 上下轴
    ctx.fillStyle = parentCleared ? '#b45309' : '#64748b';
    ctx.fillRect(x - 12, y - 15, 24, 3);
    ctx.fillRect(x - 12, y + 12, 24, 3);
    // 真
    ctx.fillStyle = parentCleared ? '#7c2d12' : '#475569';
    ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('真', x, y - 2);
    ctx.font = 'bold 9px "Microsoft YaHei", sans-serif';
    ctx.fillText(String(z.count), x, y + 7);
    ctx.restore();
  }

  function ztAt(wx, wy) {
    for (var i = 0; i < npcs.length; i++) {
      var npc = npcs[i];
      if (!ztByParent[npc.id]) continue;
      var p = ztScrollPos(npc);
      if (Math.abs(wx - p.x) <= 14 && Math.abs(wy - p.y) <= 18) {
        return { parent: npc.id, node: npc.node, z: ztByParent[npc.id] };
      }
    }
    return null;
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawWeapon(x, y, t) {
    var bob = Math.sin(t * 2.6) * 2;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(-0.35);
    ctx.fillStyle = 'rgba(251,191,36,0.16)';
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(-1.5, -10, 3, 13);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-4.5, -8, 9, 2.5);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(-3.5, 3, 7, 2.5);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-1.5, 5.5, 3, 4);
    ctx.restore();
  }

  function drawLock(x, y) {
    ctx.fillStyle = 'rgba(148,163,184,0.9)';
    ctx.fillRect(x - 7, y - 2, 14, 10);
    ctx.strokeStyle = 'rgba(148,163,184,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - 2, 5, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 1, y + 1, 2, 4);
  }

  function drawPlayer(t) {
    var sx = Math.round(player.x - cam.x);
    var sy = Math.round(player.y - cam.y);
    var spec = playerSpecNow();
    var set = getSprites(spec);
    var f = (NS.Gear && NS.Gear.fx) ? NS.Gear.fx() : null;

    // 皮肤残影（优秀 / 传说）
    if (hasTrailFx(f) && trail.length) {
      for (var i = 0; i < trail.length; i++) {
        var p = trail[i];
        var tx = Math.round(p.x - cam.x), ty = Math.round(p.y - cam.y);
        ctx.globalAlpha = Math.max(0, p.life) * 0.22;
        blitSprite(set[p.dir][1], tx - 20, ty - 50, 40, 52);
      }
      ctx.globalAlpha = 1;
    }

    drawShadow(sx, sy + 1);

    // 骑乘姿势：摩托要坐进座位、大猿要踩在肩膀上，角色整体抬高
    var rdy = (NS.Gear && NS.Gear.riderDy) ? NS.Gear.riderDy() : 0;
    if (f && NS.Gear.drawFx) NS.Gear.drawFx(ctx, sx, sy + rdy, t);
    if (NS.Gear && NS.Gear.drawMount) NS.Gear.drawMount(ctx, sx, sy, t, player.moving);

    var frame = player.moving ? Math.floor(player.walk) % 4 : 0;
    var bob = player.moving ? Math.sin(t * 12) * 0.8 : Math.sin(t * 2) * 0.6;
    blitSprite(set[player.dir][frame], sx - 20, sy - 50 + bob + rdy, 40, 52);

    // 玩家标记（小小的青色箭头，避免和 NPC 混）
    ctx.fillStyle = 'rgba(125,211,252,0.9)';
    ctx.beginPath();
    ctx.moveTo(sx, sy - 60 + bob + rdy);
    ctx.lineTo(sx - 4, sy - 67 + bob + rdy);
    ctx.lineTo(sx + 4, sy - 67 + bob + rdy);
    ctx.closePath();
    ctx.fill();
  }

  /* ============================================================
   * 10. 小地图
   * ============================================================ */
  function drawMini() {
    if (!mini || !mctx) return;
    var w = mini.width, h = mini.height;
    mctx.clearRect(0, 0, w, h);
    mctx.fillStyle = '#0b1220';
    mctx.fillRect(0, 0, w, h);
    mctx.imageSmoothingEnabled = false;

    // 保持地图比例，留黑边，不再硬拉伸
    miniScale = Math.min(w / WORLD_W, h / WORLD_H);
    miniOx = (w - WORLD_W * miniScale) / 2;
    miniOy = (h - WORLD_H * miniScale) / 2;
    mctx.drawImage(terrain, 0, 0, WORLD_W, WORLD_H,
      miniOx, miniOy, WORLD_W * miniScale, WORLD_H * miniScale);

    // 营地标记
    areas.forEach(function (a) {
      var x = miniOx + a.cx * miniScale;
      var y = miniOy + a.cy * miniScale;
      var gs = a.chap.module === 'gs';
      mctx.fillStyle = gs ? 'rgba(56,189,248,0.9)' : 'rgba(167,139,250,0.9)';
      mctx.fillRect(Math.round(x - 3), Math.round(y - 3), 7, 7);
      mctx.strokeStyle = 'rgba(8,14,26,0.9)';
      mctx.lineWidth = 1;
      mctx.strokeRect(Math.round(x - 3) + 0.5, Math.round(y - 3) + 0.5, 7, 7);
    });

    // 已通关角色点
    npcs.forEach(function (n) {
      if (!store.isCleared(n.id)) return;
      mctx.fillStyle = 'rgba(52,211,153,0.85)';
      mctx.fillRect(Math.round(miniOx + n.x * miniScale), Math.round(miniOy + n.y * miniScale), 2, 2);
    });

    // 当前营地
    if (lastArea >= 0 && areas[lastArea]) {
      var ca = areas[lastArea];
      mctx.strokeStyle = 'rgba(251,191,36,0.75)';
      mctx.lineWidth = 2;
      mctx.beginPath();
      mctx.arc(miniOx + ca.cx * miniScale, miniOy + ca.cy * miniScale, 8, 0, Math.PI * 2);
      mctx.stroke();
    }

    // 玩家
    var px = miniOx + player.x * miniScale, py = miniOy + player.y * miniScale;
    mctx.strokeStyle = '#7dd3fc';
    mctx.lineWidth = 2;
    mctx.beginPath(); mctx.arc(px, py, 4, 0, Math.PI * 2); mctx.stroke();
    mctx.fillStyle = '#f8fafc';
    mctx.beginPath(); mctx.arc(px, py, 2, 0, Math.PI * 2); mctx.fill();
  }

  /* ============================================================
   * 11. 主循环与初始化
   * ============================================================ */
  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    if (!started) return;
    // 弹窗 / 答题 / 背包 / 世界地图打开时，世界画面被遮住，没必要继续重绘；
    // 切到后台同理。恢复时把 lastT 清零，避免积攒出一个巨大的 dt。
    if (document.hidden || uiBlocked()) { lastT = 0; return; }
    var dt = lastT ? Math.min(0.05, (ts - lastT) / 1000) : 0.016;
    lastT = ts;
    var t = ts / 1000;
    update(dt);
    draw(t);
    miniT += dt;
    if (miniT > 0.25) { miniT = 0; drawMini(); }
  }

  function resize() {
    if (!wrap || !canvas) return;
    var vh = document.documentElement.clientHeight || window.innerHeight;
    var top = wrap.offsetTop || 0;
    var h = Math.max(480, vh - top - 2);
    view.w = Math.max(320, Math.floor(wrap.clientWidth || window.innerWidth));
    view.h = Math.floor(h);
    wrap.style.height = view.h + 'px';
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(view.w * dpr);
    canvas.height = Math.floor(view.h * dpr);
    canvas.style.width = view.w + 'px';
    canvas.style.height = view.h + 'px';
    if (started) {
      clampCam();
      if (player) snapCam();
    }
    updateZoomLabel();
  }

  function snapCam() {
    cam.x = clamp(player.x - vw() / 2, 0, Math.max(0, WORLD_W - vw()));
    cam.y = clamp(player.y - vh() / 2, 0, Math.max(0, WORLD_H - vh()));
  }

  function init(opts) {
    if (started) { refresh(); return; }
    NODES = opts.nodes || [];
    CHAPS = opts.chapters || [];
    store = opts.store;
    hooks = opts.hooks || {};
    NODES.forEach(function (n) { BY_ID[n.id] = n; });
    CHAPS.forEach(function (c) { CHAP_BY_ID[c.id] = c; });
    sceneByChap = {};
    SCENES.forEach(function (sc, i) {
      sc.chapters.forEach(function (cid) { sceneByChap[cid] = i; });
    });

    // 初始落在主线所在的场景（读档后不会把玩家丢回第一张图）
    sceneIdx = 0;
    for (var si = 0; si < NODES.length; si++) {
      var sn = NODES[si];
      if (!store.isCleared(sn.id) && store.unlocked(sn).ok) {
        sceneIdx = sceneOfChap(sn.chap);
        break;
      }
    }

    wrap = $('world');
    canvas = $('worldCanvas');
    if (!wrap || !canvas) return;
    ctx = canvas.getContext('2d');
    promptEl = $('worldPrompt');
    areaEl = $('worldArea');
    questListEl = $('questList');
    loadingEl = $('worldLoading');
    sceneMask = $('sceneMask');
    sceneGrid = $('worldMapSpots');
    mapTipEl = $('worldMapTip');
    mapCurrentEl = $('worldMapCurrent');
    sceneFade = $('sceneFade');
    mini = $('worldMini');
    if (mini) mctx = mini.getContext('2d');
    (ZT.nodes || []).forEach(function (z) { if (z && z.parent) ztByParent[z.parent] = z; });

    build();
    resize();
    bind();
    setSceneWeather(currentScene());
    if (NS.Audio) NS.Audio.setScene(currentScene().track);

    started = true;
    lastT = 0;
    rafId = requestAnimationFrame(loop);
    // 首次布局时字体/图例高度可能还没稳定，稍后再校正一次视口高度
    setTimeout(resize, 260);

    if (loadingEl) {
      setTimeout(function () { loadingEl.classList.add('off'); }, 120);
    }
    updateArea();
    updateQuests(true);
    updateChips();
  }

  function refresh() {
    if (!started) return;
    drawMini();
    updateArea();
    updatePrompt();
    updateQuests(true);
  }

  NS.World = {
    init: init, refresh: refresh, resize: resize,
    refreshArena: refreshArena,
    /** 诊断：当前玩家坐标与脚下是否被挡（用于验证出生点/通道） */
    playerPos: function () {
      return { x: Math.round(player.x), y: Math.round(player.y), blocked: hit(player.x, player.y) };
    },
    /** 背包 / 装备面板的试穿预览：拿到与地图完全一致的像素小人 */
    previewSprite: function (spec, dir) { return getSprites(spec)[dir || 'down'][0]; }
  };
})(window.HNSF829);
