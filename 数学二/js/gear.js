/* ============================================================
 * 302 数学二 · 坐骑与皮肤（C 键）
 * ------------------------------------------------------------
 * 坐骑：10 只，全部由「通关指定难点」解锁，速度倍率不同。
 * 皮肤：普通（无动效）/ 优秀（残影）/ 传说（光环 + 粒子 + 残影）。
 * 碎片：只从葫芦每日复盘产出，价格 3 / 8 / 20。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var Store = NS.Store;

  /* ---------------- 坐骑 ---------------- */
  var MOUNTS = [
    { id: 'cloud', name: '筋斗云', icon: '☁️', node: 'gs-lim-calc', speed: 1.3, desc: '悟空同款。踩着它赶路，比跑步省力。' },
    { id: 'orb', name: '占卜水晶球', icon: '🔮', node: 'gs-taylor', speed: 1.35, desc: '占卜婆婆的水晶球，悬浮前进，还能顺便预判下一题。' },
    { id: 'cape', name: '比克飞行披风', icon: '🧣', node: 'gs-ineq-prove', speed: 1.45, desc: '披风一抖就起飞，比克亲授。' },
    { id: 'turtle', name: '龟仙海龟', icon: '🐢', node: 'gs-int-mvt', speed: 1.15, desc: '慢是慢了点，但稳。龟仙人说这叫基本功。' },
    { id: 'moto', name: '布尔玛摩托', icon: '🏍️', node: 'gs-ode-app', speed: 1.4, desc: '胶囊公司出品，油门一拧就窜出去。' },
    { id: 'pod', name: '赛亚人太空舱', icon: '🚀', node: 'xd-det-abstract', speed: 1.55, desc: '从拉蒂兹手里缴获，落地时记得关舱门。' },
    { id: 'ball', name: '战斗球', icon: '🛸', node: 'xd-mat-rankineq', speed: 1.5, desc: '弗利萨军的标准单兵飞行器。' },
    { id: 'fpod', name: '弗利萨飞行舱', icon: '🟣', node: 'xd-solve-param', speed: 1.6, desc: '蛋形紫舱配碟形悬浮底座，舒适度一般，速度很诚实。' },
    { id: 'dragon', name: '神龙', icon: '🐉', node: 'xd-solve-common', speed: 1.8, desc: '集齐七颗龙珠换来的坐骑。飞得比谁都快。' },
    { id: 'ape', name: '大猿', icon: '🦍', node: 'xd-eig-abstract', speed: 1.7, desc: '满月限定。坐在肩膀上，视野极好。' }
  ];

  /* ---------------- 皮肤 ----------------
     普通：只换配色；优秀：残影；传说：光环 + 粒子 + 残影 */
  function skin(id, name, rarity, cost, desc, spec, fx) {
    return { id: id, name: name, rarity: rarity, cost: cost, desc: desc, spec: spec, fx: fx || null };
  }
  var S = function (o) {
    var base = {
      skin: '#f6c89a', hair: '#141821', hairStyle: 'goku',
      top: '#0ea5e9', pants: '#0f172a', belt: '#fbbf24', collar: '#fbbf24',
      armor: null, boots: '#0f172a', cape: null, eye: '#1f2937',
      extras: [], scale: 1, female: false
    };
    Object.keys(o || {}).forEach(function (k) { base[k] = o[k]; });
    return base;
  };

  var SKINS = [
    skin('starter', '蓝色武道服', 'common', 0, '最朴素的一套，耐看。',
      S({}), null),
    skin('turtle', '龟仙流道服', 'common', 3, '橙衣蓝衬，龟仙流弟子的标准装。',
      S({ top: '#f97316', pants: '#f97316', belt: '#1e40af', collar: '#1e40af' }),
      { kind: 'ki', color: '#fbbf24' }),
    skin('namek', '那美克战衣', 'common', 3, '紫衣白披，绿皮肤也挡不住帅气。',
      S({ top: '#6d28d9', pants: '#6d28d9', belt: '#f8fafc', collar: '#a78bfa', cape: '#f8fafc' }),
      { kind: 'ki', color: '#a78bfa' }),
    skin('saiyan', '赛亚王子', 'rare', 8, '蓝战斗服 + 白胸甲。出场自带残影。',
      S({ top: '#1e3a8a', pants: '#1e3a8a', belt: '#f8fafc', armor: '#e5e7eb', boots: '#f8fafc', hairStyle: 'vegeta' }),
      { kind: 'lightning', color: '#38bdf8' }),
    skin('future', '未来战士', 'rare', 8, '紫发、黑背心、背后一把剑。',
      S({ hair: '#a78bfa', hairStyle: 'bob', top: '#111827', pants: '#111827', belt: '#a78bfa', boots: '#111827', extras: ['sword'] }),
      { kind: 'time', color: '#a78bfa' }),
    skin('demon', '魔人战袍', 'rare', 8, '粉身紫披，笑起来有点吓人。',
      S({ skin: '#f9a8d4', hair: '#f472b6', hairStyle: 'buu', top: '#f9a8d4', pants: '#f9a8d4', belt: '#be185d', cape: '#7c3aed' }),
      { kind: 'heart', color: '#f472b6' }),
    skin('ssj', '超级赛亚人', 'legend', 20, '金发金气，走路带火星。',
      S({ hair: '#fbbf24', hairStyle: 'goku', top: '#f97316', pants: '#f97316', belt: '#1e40af', collar: '#1e40af' }),
      { kind: 'flame', color: '#fbbf24' }),
    skin('ssj4', '超级赛亚人 4', 'legend', 24, '黑发红毛，尾巴一甩，连气都是暗红色的。',
      S({ hair: '#141821', hairStyle: 'ssj4', top: '#9f1239', pants: '#1e3a8a', belt: '#7c3aed',
        collar: '#9f1239', boots: '#111827', eye: '#dc2626', extras: ['tail'], fur: '#9f1239' }),
      { kind: 'flame', color: '#ef4444' }),
    skin('ultra', '自在极意', 'legend', 20, '银发银气，动作比思考还快。',
      S({ hair: '#e5e7eb', hairStyle: 'goku', top: '#f8fafc', pants: '#334155', belt: '#94a3b8', collar: '#94a3b8' }),
      { kind: 'silver', color: '#93c5fd' }),
    skin('god', '破坏神', 'legend', 20, '紫气缠身，连地图都怕你。',
      S({ skin: '#c084fc', hair: '#c084fc', hairStyle: 'ears', top: '#111827', pants: '#111827', belt: '#c084fc', eye: '#fbbf24' }),
      { kind: 'void', color: '#c084fc' })
  ];

  /* 展示文案：皮肤 / 坐骑的「卖点」和一句背景故事，用于预览台与换装 CG */
  var SKIN_META = {
    starter: { tagline: '初出茅庐', lore: '蓝色武道服，是每个赛亚人故事的起点。' },
    turtle: { tagline: '龟仙流正统', lore: '橙衣蓝衬，龟派气功的传人。' },
    namek: { tagline: '那美克战衣', lore: '紫衣白披，绿皮肤也挡不住帅气。' },
    saiyan: { tagline: '王子的骄傲', lore: '蓝战斗服与白胸甲，出场自带蓝色雷光。' },
    future: { tagline: '来自未来的剑', lore: '紫发、黑背心，背后那把剑斩过时间线。' },
    demon: { tagline: '魔人战袍', lore: '粉身紫披，笑起来有点吓人。' },
    ssj: { tagline: '觉醒 · 超级赛亚人', lore: '金发倒竖，气焰把空气都点燃。' },
    ssj4: { tagline: '觉醒 · 超级赛亚人 4', lore: '黑发垂到腰际，红毛覆满胸口与双臂。尾巴扫过的地方，连空气都在发烫。' },
    ultra: { tagline: '自在极意功', lore: '银发银气，身体比思考先一步做出反应。' },
    god: { tagline: '破坏神', lore: '紫气缠身，连地图都怕你。' }
  };

  var MOUNT_META = {
    cloud: { tagline: '一个筋斗十万八千里', lore: '悟空同款，踩着它赶路比跑步省力。' },
    orb: { tagline: '水晶球里的星图', lore: '占卜婆婆的水晶球，悬浮前进，还能预判下一题。' },
    cape: { tagline: '披风一抖就起飞', lore: '比克亲授，飞起来的时候披风会猎猎作响。' },
    turtle: { tagline: '慢，但稳', lore: '龟仙人说，这叫基本功。' },
    moto: { tagline: '胶囊公司出品', lore: '布尔玛的摩托，油门一拧就窜出去。' },
    pod: { tagline: '赛亚人单兵舱', lore: '从拉蒂兹手里缴获，落地时记得关舱门。' },
    ball: { tagline: '弗利萨军制式', lore: '漆黑的扁球，正面一条红色观察窗，底下拖着反重力光环。' },
    fpod: { tagline: '军团长的专座', lore: '紫色蛋形舱悬在碟形底座上，座舱里还留着冷气。' },
    dragon: { tagline: '腾云驾雾，一声龙吟', lore: '集齐七颗龙珠换来的坐骑，飞得比谁都快。' },
    ape: { tagline: '满月限定', lore: '坐在大猿肩膀上，视野极好。' }
  };

  var RARITY = {
    common: { label: '普通', cls: 'c-common' },
    rare: { label: '优秀', cls: 'c-rare' },
    legend: { label: '传说', cls: 'c-legend' }
  };

  var mask = null, gridEl = null, detailEl = null, fragEl = null;
  var previewCanvas = null, pctx = null, previewTag = null, previewRAF = 0;
  var stageEl = null, heroKicker = null, heroName = null, heroTag = null, heroLore = null;
  var cgEl = null, cgCanvas = null, cgCtx = null, cgKicker = null, cgName = null;
  var cgRarity = null, cgLore = null, cgRAF = 0, cgTimer = 0, cgState = null;
  var tab = 'mount', picked = null;
  var active = null;

  function nodeOf(id) {
    var list = (NS.NODES && NS.NODES.nodes) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* 骑乘关系：dy 是角色脚底相对坐骑基线的抬高量（像素），
     sc 是坐骑本身的缩放。摩托要坐进座位，大猿要踩在肩膀上。 */
  var RIDE = {
    orb: { dy: -20 },
    moto: { dy: -4 },
    pod: { dy: -10 },
    ball: { dy: -11 },
    fpod: { dy: -9 },
    dragon: { dy: -18 },
    ape: { dy: -22, sc: 1.3 }
  };

  function riderOffset(m) {
    return (m && RIDE[m.id]) || null;
  }

  function mountById(id) {
    for (var i = 0; i < MOUNTS.length; i++) if (MOUNTS[i].id === id) return MOUNTS[i];
    return null;
  }
  function skinById(id) {
    for (var i = 0; i < SKINS.length; i++) if (SKINS[i].id === id) return SKINS[i];
    return null;
  }

  function mountUnlocked(m) { return !!(Store && Store.isCleared(m.node)); }

  function currentSkin() {
    var g = Store.gear();
    return skinById(g.skin) || SKINS[0];
  }

  function specOfSkin(sk) {
    var spec = {};
    Object.keys(sk.spec).forEach(function (k) { spec[k] = sk.spec[k]; });
    spec.key = 'skin-' + sk.id;
    spec.name = '你';
    spec.foe = false;
    return spec;
  }

  function playerSpec() {
    return specOfSkin(currentSkin());
  }

  /** 预览 / 入场 CG 用：骑摩托时换成坐姿精灵 */
  function specWithMount(sk, mt) {
    var sp = specOfSkin(sk);
    if (mt && mt.id === 'moto') {
      sp.sit = true;
      sp.key = sp.key + '-sit';
    }
    return sp;
  }

  function equippedMount() {
    var g = Store.gear();
    var m = mountById(g.mount);
    if (!m || !mountUnlocked(m)) return null;
    return m;
  }

  function speed() {
    var m = equippedMount();
    return m ? m.speed : 1;
  }

  function fx() {
    return currentSkin().fx;
  }

  /* ============================================================
   * 世界渲染：坐骑 / 皮肤光效
   * ============================================================ */
  function drawMountFor(ctx, x, y, t, moving, m, dir) {
    if (!m) return;
    ctx.save();
    var bob = Math.sin(t * 4) * 1.6;
    ctx.translate(x, y + bob);
    var cfg = RIDE[m.id];
    if (cfg && cfg.sc) ctx.scale(cfg.sc, cfg.sc);
    // 车头朝向：向左行进时整车镜像，骑手和车就不会一正一反
    if (dir === 'left') ctx.scale(-1, 1);
    switch (m.id) {
      case 'cloud':
        cloud(ctx, t);
        break;
      case 'orb':
        orb(ctx, t, '#7dd3fc');
        break;
      case 'cape':
        cape(ctx, t);
        break;
      case 'turtle':
        turtle(ctx, t);
        break;
      case 'moto':
        moto(ctx, t, moving);
        break;
      case 'pod':
        saiyanPod(ctx, t);
        break;
      case 'ball':
        battleBall(ctx, t);
        break;
      case 'fpod':
        friezaPod(ctx, t);
        break;
      case 'dragon':
        dragon(ctx, t);
        break;
      case 'ape':
        ape(ctx);
        break;
      default:
        cloud(ctx, t);
    }
    // 速度线
    if (moving) {
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1.5;
      for (var i = 0; i < 3; i++) {
        var oy = -6 + i * 5;
        ctx.beginPath();
        ctx.moveTo(-18 - i * 5, oy);
        ctx.lineTo(-30 - i * 5, oy);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /** 前景层：骑手画完之后再补的车身部件（摩托车用，遮住骑手的腿） */
  function drawMountFront(ctx, x, y, t, moving, m, dir) {
    if (!m || m.id !== 'moto') return;
    ctx.save();
    var bob = Math.sin(t * 4) * 1.6;
    ctx.translate(x, y + bob);
    var cfg = RIDE[m.id];
    if (cfg && cfg.sc) ctx.scale(cfg.sc, cfg.sc);
    if (dir === 'left') ctx.scale(-1, 1);
    motoFront(ctx, t, moving);
    ctx.restore();
  }

  function drawMount(ctx, x, y, t, moving, dir) {
    drawMountFor(ctx, x, y, t, moving, equippedMount(), dir);
  }

  /* ---------------- 通用绘制小工具 ----------------
     2D 游戏素材的通用做法：先铺一层深色描边，再填亮色，
     这样坐骑在草地、擂台、CG 暗背景上都有清晰轮廓。 */
  function outline(ctx, w) {
    ctx.strokeStyle = 'rgba(7, 12, 18, 0.9)';
    ctx.lineWidth = w == null ? 1.5 : w;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function ell(ctx, x, y, rx, ry, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2);
  }

  function cloud(ctx, t) {
    // 尾迹：三层细云丝
    ctx.save();
    for (var k = 0; k < 3; k++) {
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.30 - k * 0.07) + ')';
      ctx.lineWidth = 2 - k * 0.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-22 - k * 6, -7 + k * 4 + Math.sin(t * 4 + k) * 1.2);
      ctx.quadraticCurveTo(-30 - k * 7, -8 + k * 4, -38 - k * 8, -6 + k * 4);
      ctx.stroke();
    }
    ctx.restore();

    // 云体：先铺深色描边层，再铺白色云团（外轮廓才干净）
    var puffs = [
      [-16, -3, 10, 7], [-8, -8, 12, 9], [3, -8, 11, 8.5],
      [12, -4, 9, 6.5], [0, -1, 15, 7.5], [-10, 2, 9, 5.5], [10, 2, 8, 5]
    ];
    puffs.forEach(function (p) {
      ctx.fillStyle = 'rgba(7, 14, 24, 0.55)';
      ell(ctx, p[0], p[1], p[2] + 1.6, p[3] + 1.6);
      ctx.fill();
    });
    puffs.forEach(function (p, i) {
      var g = ctx.createLinearGradient(0, p[1] - p[3], 0, p[1] + p[3]);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.65, i % 2 ? '#f2f8ff' : '#eaf4ff');
      g.addColorStop(1, '#c7def7');
      ctx.fillStyle = g;
      ell(ctx, p[0], p[1], p[2], p[3]);
      ctx.fill();
    });

    // 云底柔影
    ctx.fillStyle = 'rgba(56,120,190,0.16)';
    ell(ctx, 0, 4, 19, 4);
    ctx.fill();

    // 金色云沿（筋斗云的标志）
    ctx.strokeStyle = 'rgba(251,191,36,0.7)';
    ctx.lineWidth = 1.3;
    ell(ctx, -1, -1, 20, 6.5);
    ctx.stroke();

    // 雷光点
    ctx.fillStyle = 'rgba(254,240,138,' + (0.55 + 0.35 * Math.sin(t * 8)).toFixed(2) + ')';
    ctx.fillRect(-12, -8, 2, 2);
    ctx.fillRect(11, -6, 2, 2);
  }

  function orb(ctx, t, c) {
    var r = 13 + Math.sin(t * 3) * 1.2;

    // 外层光晕
    var halo = ctx.createRadialGradient(0, -9, 2, 0, -9, r + 14);
    halo.addColorStop(0, 'rgba(125,211,252,0.38)');
    halo.addColorStop(0.55, 'rgba(125,211,252,0.12)');
    halo.addColorStop(1, 'rgba(125,211,252,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(0, -9, r + 14, 0, Math.PI * 2); ctx.fill();

    // 星系环（压在球后）
    ctx.strokeStyle = 'rgba(251,191,36,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -9, r + 7, (r + 7) * 0.32, -0.4, Math.PI * 0.05, Math.PI * 0.95);
    ctx.stroke();

    // 球体
    var g = ctx.createRadialGradient(-4.5, -14, 1, 0, -9, r);
    g.addColorStop(0, 'rgba(255,255,255,0.98)');
    g.addColorStop(0.35, c);
    g.addColorStop(0.8, 'rgba(40,90,150,0.98)');
    g.addColorStop(1, 'rgba(12,32,58,1)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, -9, r, 0, Math.PI * 2); ctx.fill();
    outline(ctx, 1.5);

    // 球内星图
    ctx.save();
    ctx.beginPath(); ctx.arc(0, -9, r - 1.2, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 0.8;
    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, -9, 4 + i * 3.2, t * 0.8 + i * 2, t * 0.8 + i * 2 + 2.2);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (var s = 0; s < 5; s++) {
      var a = t * 1.4 + s * 1.4;
      ctx.fillRect(Math.cos(a) * (r - 4.5), -9 + Math.sin(a) * (r - 4.5), 1.5, 1.5);
    }
    ctx.fillStyle = 'rgba(6,20,40,0.35)';
    ctx.beginPath(); ctx.ellipse(0, -4, r, 5, 0, 0, Math.PI); ctx.fill();
    ctx.restore();

    // 高光
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, -9, r - 2, Math.PI * 1.08, Math.PI * 1.42); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ell(ctx, -5, -15, 2.4, 1.6, -0.5);
    ctx.fill();

    // 金色底座环
    ctx.strokeStyle = 'rgba(251,191,36,0.75)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(0, 3, 12, 3.4, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 漂浮星点
    ctx.fillStyle = 'rgba(224,242,254,' + (0.35 + 0.3 * Math.sin(t * 3)).toFixed(2) + ')';
    ctx.fillRect(-15, -20, 1.6, 1.6);
    ctx.fillRect(14, -12, 1.4, 1.4);
    ctx.fillRect(6, -26, 1.4, 1.4);
  }

  function cape(ctx, t) {
    var flap = Math.sin(t * 5) * 2.4;

    // 风线
    ctx.strokeStyle = 'rgba(226,232,240,0.42)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    for (var k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(-22 - k * 6, -6 + k * 3);
      ctx.quadraticCurveTo(-28 - k * 6, -7 + k * 3 - flap * 0.2, -35 - k * 6, -5 + k * 3);
      ctx.stroke();
    }

    // 底部气流光
    ctx.fillStyle = 'rgba(196,181,253,0.18)';
    ell(ctx, 0, 2, 22, 5);
    ctx.fill();

    // 披风主体（铺开成飞毯状）
    var g = ctx.createLinearGradient(0, -16, 0, 6);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.55, '#e8eefb');
    g.addColorStop(1, '#b9c7e0');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-24, -7);
    ctx.quadraticCurveTo(-18, -16 - flap, -6, -12);
    ctx.quadraticCurveTo(6, -18 + flap, 18, -10);
    ctx.quadraticCurveTo(25, -7, 21, -1);
    ctx.quadraticCurveTo(12, 4 + flap * 0.6, 2, 2);
    ctx.quadraticCurveTo(-10, 5 - flap * 0.5, -20, 1);
    ctx.quadraticCurveTo(-27, -2, -24, -7);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 1.6);

    // 褶皱阴影
    ctx.strokeStyle = 'rgba(148,163,184,0.75)';
    ctx.lineWidth = 1.1;
    for (var f = 0; f < 3; f++) {
      ctx.beginPath();
      ctx.moveTo(-12 + f * 9, -10 + flap * 0.4);
      ctx.quadraticCurveTo(-8 + f * 9, -3, -11 + f * 9, 1);
      ctx.stroke();
    }

    // 金色包边
    ctx.strokeStyle = 'rgba(251,191,36,0.7)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-23, -5);
    ctx.quadraticCurveTo(-10, 3.5, 2, 1.6);
    ctx.quadraticCurveTo(12, 3.4, 20.5, -1.4);
    ctx.stroke();

    // 立领 + 金领扣（左后方，像披风被风撑起）
    ctx.fillStyle = '#dbe4f5';
    ctx.beginPath();
    ctx.moveTo(-24, -8);
    ctx.quadraticCurveTo(-27, -16 - flap * 0.5, -19, -16 - flap * 0.4);
    ctx.quadraticCurveTo(-15, -12, -15, -8);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 1.1);
    ctx.fillStyle = '#fbbf24';
    ell(ctx, -18, -12, 2.4, 2.4);
    ctx.fill();
    outline(ctx, 0.8);
    ctx.fillStyle = 'rgba(120,53,15,0.65)';
    ell(ctx, -18, -12, 0.9, 0.9);
    ctx.fill();
  }

  function turtle(ctx, t) {
    var kick = Math.sin(t * 6);

    // 水花
    ctx.strokeStyle = 'rgba(186,230,253,0.55)';
    ctx.lineWidth = 1.1;
    ctx.lineCap = 'round';
    for (var w = 0; w < 3; w++) {
      ctx.beginPath();
      ctx.moveTo(-19 + w * 17, 3.5);
      ctx.quadraticCurveTo(-15 + w * 17, -0.5, -11 + w * 17, 3.5);
      ctx.stroke();
    }

    // 四肢（先画，压在壳下面）
    [[-12, kick * 1.6, -0.35], [11, -kick * 1.6, 0.35]].forEach(function (l) {
      ctx.fillStyle = '#3f7d46';
      ell(ctx, l[0], l[1], 5.6, 3.4, l[2]);
      ctx.fill();
      outline(ctx, 1.1);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.9;
      for (var c = -1; c <= 1; c++) {
        ctx.beginPath();
        ctx.moveTo(l[0] + c * 2, l[1] + 2.4);
        ctx.lineTo(l[0] + c * 2.4, l[1] + 4.4);
        ctx.stroke();
      }
    });

    // 尾巴
    ctx.fillStyle = '#3f7d46';
    ctx.beginPath();
    ctx.moveTo(-17, -5);
    ctx.quadraticCurveTo(-23, -4, -21, -1);
    ctx.quadraticCurveTo(-19, -2, -16, -2.6);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 1);

    // 龟壳：深色外沿 → 壳面 → 顶面高光
    ctx.fillStyle = '#2f6b3a';
    ell(ctx, 0, -7, 18, 10);
    ctx.fill();
    outline(ctx, 1.5);
    ctx.fillStyle = '#4d8f4a';
    ell(ctx, 0, -8.5, 14.5, 7.4);
    ctx.fill();
    ctx.fillStyle = 'rgba(190,242,150,0.32)';
    ell(ctx, -5, -12, 6.5, 2.6, -0.25);
    ctx.fill();

    // 六边形甲片
    ctx.strokeStyle = 'rgba(22,58,30,0.72)';
    ctx.lineWidth = 0.9;
    for (var i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(i * 5.5, -15); ctx.lineTo(i * 6.5, -3.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-13, -8 + i * 3); ctx.lineTo(13, -8 + i * 3); ctx.stroke();
    }

    // 壳沿浅色环
    ctx.strokeStyle = '#86a96b';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, -2.2, 15.5, 3.6, 0, 0, Math.PI * 2); ctx.stroke();

    // 头：脖子 → 头 → 眼睛 → 嘴
    ctx.fillStyle = '#5f9e3a';
    ctx.beginPath();
    ctx.moveTo(15, -8.5);
    ctx.quadraticCurveTo(19, -10, 20, -8);
    ctx.quadraticCurveTo(19, -5.5, 15, -5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#84cc16';
    ell(ctx, 22.5, -9, 5.4, 4.4, -0.12);
    ctx.fill();
    outline(ctx, 1.2);
    ctx.fillStyle = '#f8fafc';
    ell(ctx, 24.2, -10.3, 1.7, 1.7);
    ctx.fill();
    ctx.fillStyle = '#1f2937';
    ell(ctx, 24.9, -10.3, 0.9, 1.1);
    ctx.fill();
    ctx.strokeStyle = 'rgba(22,58,30,0.8)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(24, -6.6); ctx.lineTo(26.4, -6.9); ctx.stroke();
  }

  function drawFx(ctx, x, y, t) {
    drawFxFor(ctx, x, y, t, fx());
  }

  function moto(ctx, t, moving) {
    var spin = moving ? t * 12 : 0;

    // 尾气
    if (moving) {
      for (var e = 0; e < 3; e++) {
        var ex = -24 - e * 7 - (t * 40 % 7);
        ctx.fillStyle = 'rgba(203,213,225,' + (0.30 - e * 0.08) + ')';
        ell(ctx, ex, -8 + e * 1.5, 4 - e * 0.8, 2.6 - e * 0.5);
        ctx.fill();
      }
    }

    // 车轮（先画，车身压在上面）
    function wheel(wx) {
      ctx.fillStyle = '#0f172a';
      ell(ctx, wx, -3, 7, 7);
      ctx.fill();
      outline(ctx, 1.3);
      ctx.fillStyle = '#334155';
      ell(ctx, wx, -3, 3.2, 3.2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      for (var s = 0; s < 4; s++) {
        var a = spin + s * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(a) * 1.2, -3 + Math.sin(a) * 1.2);
        ctx.lineTo(wx + Math.cos(a) * 3.4, -3 + Math.sin(a) * 3.4);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.32)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(wx, -3, 5.6, Math.PI * 0.9, Math.PI * 1.5);
      ctx.stroke();
    }
    wheel(-14);
    wheel(14);

    // 排气管 + 尾焰
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(7,12,18,0.9)';
    ctx.lineWidth = 4.4;
    ctx.beginPath(); ctx.moveTo(-2, -7); ctx.lineTo(-20, -9); ctx.stroke();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(-2, -7); ctx.lineTo(-20, -9); ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ell(ctx, -21, -9, 2.6, 1.8);
    ctx.fill();
    outline(ctx, 0.8);
    if (moving) {
      var fl = 3 + Math.abs(Math.sin(t * 14)) * 3;
      ctx.fillStyle = 'rgba(251,146,60,0.85)';
      ctx.beginPath();
      ctx.moveTo(-23, -10.2);
      ctx.lineTo(-23 - fl, -9);
      ctx.lineTo(-23, -7.8);
      ctx.closePath();
      ctx.fill();
    }

    // 发动机
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(-8, -12); ctx.lineTo(4, -12); ctx.lineTo(5, -5); ctx.lineTo(-7, -5);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 1.2);
    ctx.strokeStyle = 'rgba(15,23,42,0.6)';
    ctx.lineWidth = 0.8;
    for (var fin = 0; fin < 3; fin++) {
      ctx.beginPath();
      ctx.moveTo(-6 + fin * 3.5, -11);
      ctx.lineTo(-6 + fin * 3.5, -6);
      ctx.stroke();
    }

    // 前后挡泥板
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(-14, -3, 8.4, Math.PI * 1.05, Math.PI * 1.55); ctx.stroke();
    ctx.beginPath(); ctx.arc(14, -3, 8.4, Math.PI * 1.35, Math.PI * 1.95); ctx.stroke();
  }

  /* 摩托车的前景层：侧盖 / 油箱 / 座垫 / 车把 / 前灯。
     这些部件画在骑手之后，骑手的腿才能收在车身后面，而不是站在车上。 */
  function motoFront(ctx, t) {
    // 侧盖：挡住骑手的小腿与脚
    var sg = ctx.createLinearGradient(0, -13, 0, -2);
    sg.addColorStop(0, '#64748b');
    sg.addColorStop(1, '#1e293b');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(-9, -12);
    ctx.quadraticCurveTo(2, -14, 6.5, -10.5);
    ctx.lineTo(6.5, -3.6);
    ctx.quadraticCurveTo(-2, -2.2, -9, -5);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 1.2);
    ctx.strokeStyle = 'rgba(148,163,184,0.45)';
    ctx.lineWidth = 0.9;
    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-6 + i * 3.4, -10.4);
      ctx.lineTo(-5 + i * 3.4, -5.2);
      ctx.stroke();
    }

    // 油箱（红）
    var tank = ctx.createLinearGradient(0, -17, 0, -8);
    tank.addColorStop(0, '#f87171');
    tank.addColorStop(0.5, '#dc2626');
    tank.addColorStop(1, '#991b1b');
    ctx.fillStyle = tank;
    ctx.beginPath();
    ctx.moveTo(-5, -14.5);
    ctx.quadraticCurveTo(2, -17.5, 10, -13.5);
    ctx.lineTo(10.5, -8.5);
    ctx.quadraticCurveTo(2, -7.5, -4, -9);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 1.3);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-2, -14.5);
    ctx.quadraticCurveTo(3, -15.6, 7, -14);
    ctx.stroke();

    // 座垫
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(-14, -12.6);
    ctx.quadraticCurveTo(-7, -14.8, 0, -13.4);
    ctx.lineTo(1, -10.8);
    ctx.lineTo(-13, -10.2);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 1.1);

    // 前叉与车把
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(13.5, -3); ctx.lineTo(11, -14.5); ctx.stroke();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(11, -14.5); ctx.lineTo(16, -16.5); ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ell(ctx, 16.4, -16.6, 1.4, 1.1);
    ctx.fill();

    // 前灯 + 光锥
    ctx.fillStyle = '#fde68a';
    ell(ctx, 14, -12, 2.6, 2.1);
    ctx.fill();
    outline(ctx, 0.9);
    ctx.fillStyle = 'rgba(253,230,138,0.20)';
    ctx.beginPath();
    ctx.moveTo(16, -13);
    ctx.lineTo(34, -19);
    ctx.lineTo(34, -6);
    ctx.lineTo(16, -10.5);
    ctx.closePath();
    ctx.fill();
  }


  /* 赛亚人太空舱：白色圆球 + 大圆红窗 + 三条收起着陆腿 */
  function saiyanPod(ctx, t) {
    var pulse = 0.55 + 0.25 * Math.sin(t * 3.2);

    // 底部推进口的小尾焰
    ctx.fillStyle = 'rgba(125,211,252,' + (0.25 + pulse * 0.35).toFixed(2) + ')';
    ell(ctx, 0, 1.5, 4.6, 2.8);
    ctx.fill();

    // 三条着陆腿（折叠贴在球体下方）
    [-11, 0, 11].forEach(function (lx) {
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(lx - 1.8, -13);
      ctx.lineTo(lx + 1.8, -13);
      ctx.lineTo(lx + 3.2, -1.6);
      ctx.lineTo(lx - 3.2, -1.6);
      ctx.closePath();
      ctx.fill();
      outline(ctx, 1);
      ctx.fillStyle = '#475569';
      ell(ctx, lx, -1.2, 4, 2);
      ctx.fill();
      outline(ctx, 0.9);
    });

    // 舱体：白色球
    var bg = ctx.createRadialGradient(-6, -20, 2, 0, -13, 18);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(0.45, '#e2e8f0');
    bg.addColorStop(1, '#94a3b8');
    ctx.fillStyle = bg;
    ell(ctx, 0, -13, 15.2, 14.2);
    ctx.fill();
    outline(ctx, 1.6);

    // 舱盖接缝
    ctx.strokeStyle = 'rgba(100,116,139,0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, -13, 15.2, 14.2, 0, Math.PI * 1.04, Math.PI * 1.96);
    ctx.stroke();

    // 大圆舷窗
    var wg = ctx.createRadialGradient(-3, -19, 1, 0, -15, 11);
    wg.addColorStop(0, 'rgba(255,255,255,0.95)');
    wg.addColorStop(0.25, '#fca5a5');
    wg.addColorStop(0.7, '#dc2626');
    wg.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = wg;
    ell(ctx, 0, -15, 9.4, 8);
    ctx.fill();
    outline(ctx, 1.1);
    // 窗框
    ctx.strokeStyle = 'rgba(248,250,252,0.6)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, -15, 11, 9.6, 0, 0, Math.PI * 2);
    ctx.stroke();
    // 玻璃反光
    ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ctx.beginPath();
    ctx.ellipse(-3.4, -18.2, 3.5, 1.8, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // 铆钉
    ctx.fillStyle = 'rgba(71,85,105,0.75)';
    [[-12, -8], [12, -8], [-9, -19], [9, -19], [0, -26]].forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 1.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* 战斗球：扁平黑色球体 + 横向观察窗 + 悬浮反重力环 + 侧推进器 */
  function battleBall(ctx, t) {
    var gy = -1.5;

    // 反重力环：分段灯绕着转
    ctx.fillStyle = 'rgba(244,63,94,0.16)';
    ell(ctx, 0, gy + 1, 18, 5.4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(244,63,94,0.45)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, gy, 17, 4.8, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (var s = 0; s < 8; s++) {
      var a = t * 1.7 + s * Math.PI / 4;
      var px = Math.cos(a) * 17;
      var py = gy + Math.sin(a) * 4.8;
      ctx.fillStyle = (s % 2 ? 'rgba(251,113,133,' : 'rgba(56,189,248,') + (0.35 + 0.35 * Math.sin(t * 4 + s)).toFixed(2) + ')';
      ctx.beginPath();
      ctx.arc(px, py, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 球体（略扁）
    var bg = ctx.createRadialGradient(-6, -20, 2, 0, -12, 18);
    bg.addColorStop(0, '#4b5563');
    bg.addColorStop(0.5, '#1f2937');
    bg.addColorStop(1, '#0b1220');
    ctx.fillStyle = bg;
    ell(ctx, 0, -12, 14.8, 12.6);
    ctx.fill();
    outline(ctx, 1.6);

    // 装甲分缝
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, -12, 14.8, 12.6, 0, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-12.6, -19.5);
    ctx.lineTo(12.6, -19.5);
    ctx.stroke();

    // 横向观察窗 + 扫描线
    ctx.save();
    ell(ctx, 0, -12, 14, 5.6);
    ctx.clip();
    var wg = ctx.createLinearGradient(0, -18, 0, -6);
    wg.addColorStop(0, 'rgba(248,113,113,0.95)');
    wg.addColorStop(0.55, 'rgba(127,29,29,0.92)');
    wg.addColorStop(1, 'rgba(15,23,42,0.95)');
    ctx.fillStyle = wg;
    ctx.fillRect(-15, -20, 30, 16);
    ctx.fillStyle = 'rgba(254,226,226,0.28)';
    ctx.fillRect(-15, -19 + ((t * 9) % 12), 30, 1);
    ctx.restore();
    ctx.strokeStyle = 'rgba(248,113,113,0.8)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(0, -12, 14, 5.6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 两侧姿态推进器
    [-1, 1].forEach(function (sd) {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(sd * 12.5, -18);
      ctx.lineTo(sd * 19.5, -16.5);
      ctx.lineTo(sd * 19.5, -11);
      ctx.lineTo(sd * 12.5, -9.5);
      ctx.closePath();
      ctx.fill();
      outline(ctx, 1);
      ctx.fillStyle = 'rgba(125,211,252,0.85)';
      ell(ctx, sd * 20.2, -13.8, 1.7, 2.8);
      ctx.fill();
    });

    // 顶部传感器
    ctx.fillStyle = '#0f172a';
    ell(ctx, 0, -25, 4.2, 2.4);
    ctx.fill();
    outline(ctx, 1);
    ctx.strokeStyle = 'rgba(148,163,184,0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(0, -29);
    ctx.stroke();
    ctx.fillStyle = 'rgba(248,113,113,' + (0.45 + 0.4 * Math.sin(t * 5)).toFixed(2) + ')';
    ctx.beginPath();
    ctx.arc(0, -30, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  /* 弗利萨飞行舱：蛋形紫舱 + 大玻璃泡 + 碟形悬浮底座 + 三片尾鳍 */
  function friezaPod(ctx, t) {
    var pulse = 0.5 + 0.4 * Math.sin(t * 2.6);

    // 悬浮光晕
    var gl = ctx.createRadialGradient(0, 4, 1, 0, 4, 20);
    gl.addColorStop(0, 'rgba(168,85,247,0.32)');
    gl.addColorStop(1, 'rgba(168,85,247,0)');
    ctx.fillStyle = gl;
    ell(ctx, 0, 4, 19, 6);
    ctx.fill();

    // 底座尾鳍
    [-1, 0, 1].forEach(function (sd) {
      ctx.fillStyle = '#4c1d95';
      ctx.beginPath();
      ctx.moveTo(sd * 8 - 2, -5);
      ctx.lineTo(sd * 15, 3.4);
      ctx.lineTo(sd * 8 + 2, -3.6);
      ctx.closePath();
      ctx.fill();
      outline(ctx, 0.9);
    });

    // 碟形底座
    var dg = ctx.createLinearGradient(0, -7, 0, 4);
    dg.addColorStop(0, '#a78bfa');
    dg.addColorStop(0.6, '#6d28d9');
    dg.addColorStop(1, '#3b0764');
    ctx.fillStyle = dg;
    ell(ctx, 0, -2.4, 16, 6);
    ctx.fill();
    outline(ctx, 1.3);
    ctx.strokeStyle = 'rgba(251,191,36,0.9)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, -3.6, 15, 5.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(233,213,255,' + (0.3 + pulse * 0.4).toFixed(2) + ')';
    ell(ctx, 0, 2.2, 13, 2.4);
    ctx.fill();

    // 蛋形舱体
    var bg = ctx.createRadialGradient(-5, -21, 2, 0, -14, 20);
    bg.addColorStop(0, '#c4b5fd');
    bg.addColorStop(0.5, '#7c3aed');
    bg.addColorStop(1, '#2e1065');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(-14, -4);
    ctx.bezierCurveTo(-16, -22, -8, -27, 0, -27);
    ctx.bezierCurveTo(8, -27, 16, -22, 14, -4);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 1.6);

    // 舱体金属条
    ctx.strokeStyle = 'rgba(233,213,255,0.45)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-13.4, -8);
    ctx.bezierCurveTo(-12, -3, 12, -3, 13.4, -8);
    ctx.stroke();

    // 前舱盖
    var wg = ctx.createRadialGradient(-3, -20, 1, 0, -16, 13);
    wg.addColorStop(0, 'rgba(255,255,255,0.95)');
    wg.addColorStop(0.3, 'rgba(196,181,253,0.9)');
    wg.addColorStop(0.75, 'rgba(91,33,182,0.88)');
    wg.addColorStop(1, 'rgba(30,27,75,0.92)');
    ctx.fillStyle = wg;
    ell(ctx, 0, -16, 10.2, 9.2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(251,191,36,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, -16, 10.2, 9.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(-3.4, -20, 3.6, 1.8, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // 侧面扶手
    [-1, 1].forEach(function (sd) {
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sd * 12.4, -20);
      ctx.quadraticCurveTo(sd * 16.5, -16, sd * 12.6, -11);
      ctx.stroke();
    });

    // 顶部宝石与信号灯
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(0, -28, 2.3, 0, Math.PI * 2);
    ctx.fill();
    outline(ctx, 0.9);
    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -30.4);
    ctx.lineTo(0, -33.4);
    ctx.stroke();
    ctx.fillStyle = 'rgba(244,114,182,' + (0.4 + pulse * 0.45).toFixed(2) + ')';
    ctx.beginPath();
    ctx.arc(0, -34.4, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  function dragon(ctx, t) {
    /* 东方龙坐骑：S 形龙身 + 龙头 + 鹿角 + 金鬃 + 龙须 + 四爪 + 鞍座 */

    // 云雾尾迹
    for (var w = 0; w < 3; w++) {
      ctx.fillStyle = 'rgba(214,236,255,' + (0.16 - w * 0.04) + ')';
      ell(ctx, -31 - w * 9, -1 + w * 2, 13 - w * 2, 4.5 - w * 0.7);
      ctx.fill();
    }

    // 1. 采样龙身中心线（三次贝塞尔 + 轻微游动）
    var pts = [];
    var P0 = [-43, -2], P1 = [-23, -18], P2 = [3, 2], P3 = [25, -22];
    for (var i = 0; i <= 26; i++) {
      var u = i / 26, m = 1 - u;
      var x = m * m * m * P0[0] + 3 * m * m * u * P1[0] + 3 * m * u * u * P2[0] + u * u * u * P3[0];
      var y = m * m * m * P0[1] + 3 * m * m * u * P1[1] + 3 * m * u * u * P2[1] + u * u * u * P3[1];
      y += Math.sin(u * 7 + t * 3) * 1.4 + Math.sin(t * 2.2) * 1.5 * (1 - u);
      // 尾细、中段最粗、颈部保持厚度（颈太细会像虫子）
      var rr = u < 0.55
        ? 1.8 + 6.4 * Math.sin(Math.PI * 0.5 * (u / 0.55))
        : 8.2 - 2.6 * ((u - 0.55) / 0.45);
      pts.push([x, y, rr]);
    }

    // 2. 四爪（先画，藏在身体后面）
    function leg(lx, ly, swing) {
      var fx = lx + swing * 3, fy = ly + 9;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(7,12,18,0.9)';
      ctx.lineWidth = 5.4;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.quadraticCurveTo(lx + swing * 2, ly + 5, fx, fy);
      ctx.stroke();
      ctx.strokeStyle = '#2e9e5b';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.quadraticCurveTo(lx + swing * 2, ly + 5, fx, fy);
      ctx.stroke();
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1.1;
      for (var c = -1; c <= 1; c++) {
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + c * 2.6, fy + 2.6);
        ctx.stroke();
      }
    }
    leg(pts[8][0], pts[8][1] + pts[8][2] * 0.7, 1);
    leg(pts[16][0], pts[16][1] + pts[16][2] * 0.7, -1);
    leg(pts[22][0], pts[22][1] + pts[22][2] * 0.7, -1);

    // 3. 龙身：深色描边 → 鳞身 → 背高光 → 腹甲
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (var p = 0; p < 3; p++) {
      for (var s = 0; s < pts.length - 1; s++) {
        var a = pts[s], b = pts[s + 1];
        var rr = (a[2] + b[2]) * 0.5;
        var oy = 0;
        if (p === 0) {
          ctx.strokeStyle = 'rgba(6,16,12,0.92)';
          ctx.lineWidth = rr * 2 + 3;
        } else if (p === 1) {
          ctx.strokeStyle = s % 2 ? '#2e9e5b' : '#238a4c';
          ctx.lineWidth = rr * 2;
        } else {
          ctx.strokeStyle = 'rgba(134,239,172,0.45)';
          ctx.lineWidth = rr * 0.7;
          oy = -rr * 0.42;
        }
        ctx.beginPath();
        ctx.moveTo(a[0], a[1] + oy);
        ctx.lineTo(b[0], b[1] + oy);
        ctx.stroke();
      }
    }
    // 腹甲
    ctx.strokeStyle = 'rgba(209,250,229,0.40)';
    for (var v = 4; v < pts.length - 4; v++) {
      var q = pts[v];
      ctx.lineWidth = q[2] * 0.5;
      ctx.beginPath();
      ctx.moveTo(q[0], q[1] + q[2] * 0.45);
      ctx.lineTo(pts[v + 1][0], pts[v + 1][1] + pts[v + 1][2] * 0.45);
      ctx.stroke();
    }

    // 4. 背鳍（金色三角）
    for (var f = 2; f < 23; f += 3) {
      var q2 = pts[f];
      var top = q2[1] - q2[2];
      ctx.beginPath();
      ctx.moveTo(q2[0] - 3.1, top + 1);
      ctx.lineTo(q2[0] - 0.4, top - 5.4);
      ctx.lineTo(q2[0] + 3.1, top + 1);
      ctx.closePath();
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      outline(ctx, 0.9);
    }

    // 5. 尾尖金毛
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-43, -2);
    ctx.quadraticCurveTo(-50, -5, -46, -7);
    ctx.quadraticCurveTo(-45, -4.2, -41.5, -3.6);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 0.7);

    // 6. 鞍座（骑手站位，压住龙背）
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(-9, -20.5);
    ctx.lineTo(5, -21.5);
    ctx.lineTo(7.5, -16);
    ctx.lineTo(-7, -15.4);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 1.2);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-8, -16.8, 14.5, 1.4);
    // 肚带
    ctx.strokeStyle = 'rgba(120,53,15,0.85)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-6, -15.4); ctx.lineTo(-4.6, -3.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -16); ctx.lineTo(7.2, -4.2); ctx.stroke();

    // 7. 头：鬃毛 → 头骨 → 吻部 → 下颌 → 眼睛 → 鹿角 → 龙须
    var hx = 30, hy = -25 + Math.sin(t * 3 + 1.2) * 1.1;

    // 金鬃
    [[23.5, -29, 0.3], [21.8, -25, 0.5], [23.2, -21, -0.1]].forEach(function (mn) {
      ctx.beginPath();
      ctx.moveTo(mn[0] + 1, mn[1] + 2.6);
      ctx.quadraticCurveTo(mn[0] - 6, mn[1] + 2, mn[0] - 9, mn[1] - 2);
      ctx.quadraticCurveTo(mn[0] - 4, mn[1] + 0.2, mn[0] + 1, mn[1] - 1.6);
      ctx.closePath();
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      outline(ctx, 0.8);
    });

    // 头骨
    ctx.fillStyle = '#4fc776';
    ell(ctx, hx, hy, 8, 7, -0.16);
    ctx.fill();
    outline(ctx, 1.6);

    // 吻部
    ctx.fillStyle = '#7ee29a';
    ctx.beginPath();
    ctx.moveTo(hx + 4, hy - 4.2);
    ctx.quadraticCurveTo(hx + 13, hy - 3.2, hx + 13, hy + 0.2);
    ctx.quadraticCurveTo(hx + 13, hy + 3, hx + 5, hy + 3.8);
    ctx.lineTo(hx + 2, hy + 0.8);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 1.3);

    // 下颌（微张）
    ctx.fillStyle = '#2f7a4a';
    ctx.beginPath();
    ctx.moveTo(hx + 5, hy + 2.8);
    ctx.quadraticCurveTo(hx + 11.5, hy + 4.2, hx + 10.8, hy + 6);
    ctx.lineTo(hx + 4, hy + 5.2);
    ctx.closePath();
    ctx.fill();
    outline(ctx, 1.1);

    // 牙
    ctx.fillStyle = '#fffbe8';
    ctx.beginPath();
    ctx.moveTo(hx + 6.8, hy + 3);
    ctx.lineTo(hx + 7.8, hy + 4.8);
    ctx.lineTo(hx + 8.9, hy + 3.2);
    ctx.closePath();
    ctx.fill();

    // 眼睛
    ctx.fillStyle = '#0b1220';
    ell(ctx, hx + 2.4, hy - 2, 2.6, 2.2, -0.2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ell(ctx, hx + 2.2, hy - 2.2, 1.5, 1.3);
    ctx.fill();
    ctx.fillStyle = '#0b1220';
    ell(ctx, hx + 2.4, hy - 2.2, 0.6, 1.3);
    ctx.fill();

    // 鼻孔
    ctx.fillStyle = 'rgba(8,30,18,0.8)';
    ell(ctx, hx + 11.4, hy - 0.8, 1, 0.7);
    ctx.fill();

    // 鹿角（两支，带分叉）
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(hx - 2, hy - 6);
    ctx.quadraticCurveTo(hx - 5.5, hy - 10.5, hx - 10, hy - 11.8);
    ctx.stroke();
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(hx - 4.6, hy - 9); ctx.lineTo(hx - 8.4, hy - 7.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx - 7.8, hy - 10.6); ctx.lineTo(hx - 10.4, hy - 8.8); ctx.stroke();

    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx + 1, hy - 6.4);
    ctx.quadraticCurveTo(hx - 0.6, hy - 11.6, hx - 4.2, hy - 13.8);
    ctx.stroke();

    // 龙须（向后飘）
    ctx.strokeStyle = 'rgba(253,224,71,0.95)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(hx + 12.4, hy - 2.2);
    ctx.quadraticCurveTo(hx + 2, hy - 7, hx - 9, hy - 5.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx + 12.2, hy + 1);
    ctx.quadraticCurveTo(hx + 2, hy + 4, hx - 7.5, hy + 1);
    ctx.stroke();
  }

  function ape(ctx) {
    var breath = Math.sin(Date.now() / 420) * 1.5;

    // 地面阴影
    ctx.fillStyle = 'rgba(20,12,8,0.28)';
    ell(ctx, 0, 5, 26, 4.5);
    ctx.fill();

    // 尾巴
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(7,12,18,0.9)';
    ctx.lineWidth = 4.8;
    ctx.beginPath();
    ctx.moveTo(-16, -4);
    ctx.quadraticCurveTo(-30, -8, -27, -18);
    ctx.stroke();
    ctx.strokeStyle = '#4a2f1d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-16, -4);
    ctx.quadraticCurveTo(-30, -8, -27, -18);
    ctx.stroke();

    // 后腿
    [-9, 9].forEach(function (lx) {
      ctx.fillStyle = '#3b2414';
      ell(ctx, lx, 3, 6, 4);
      ctx.fill();
      outline(ctx, 1.2);
      ctx.fillStyle = '#2a1a0e';
      ell(ctx, lx + (lx > 0 ? 1 : -1), 6, 5, 2);
      ctx.fill();
      outline(ctx, 1);
    });

    // 手臂（先画，身体压住上臂）
    [[-16, -13, -1], [16, -12, 1]].forEach(function (a) {
      var sx = a[0], sy = a[1], d = a[2];
      ctx.strokeStyle = 'rgba(7,12,18,0.9)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + d * 4, sy + 11, sx + d * 6, sy + 19);
      ctx.stroke();
      ctx.strokeStyle = '#4a2f1d';
      ctx.lineWidth = 7.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + d * 4, sy + 11, sx + d * 6, sy + 19);
      ctx.stroke();
      ctx.fillStyle = '#3b2414';
      ell(ctx, sx + d * 6, sy + 20, 4.8, 4.2);
      ctx.fill();
      outline(ctx, 1.1);
    });

    // 身体
    var fur = ctx.createLinearGradient(0, -20, 0, 10);
    fur.addColorStop(0, '#6b4726');
    fur.addColorStop(0.55, '#523319');
    fur.addColorStop(1, '#3a2413');
    ctx.fillStyle = fur;
    ell(ctx, 0, -4 + breath * 0.3, 20.5, 13);
    ctx.fill();
    outline(ctx, 1.6);

    // 肩部（加宽轮廓，像大猿）
    ctx.fillStyle = '#5a3a21';
    ell(ctx, -13, -10, 8.5, 6.5);
    ctx.fill();
    outline(ctx, 1.2);
    ell(ctx, 13, -10, 8.5, 6.5);
    ctx.fill();
    outline(ctx, 1.2);

    // 毛发纹理
    ctx.strokeStyle = 'rgba(24,13,6,0.45)';
    ctx.lineWidth = 1;
    for (var i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 5, -16);
      ctx.quadraticCurveTo(i * 5.6, -9, i * 5.2, 1);
      ctx.stroke();
    }

    // 胸腹浅色毛
    ctx.fillStyle = '#c9a37a';
    ell(ctx, 0, -5, 10.5, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140,100,62,0.55)';
    ctx.lineWidth = 0.9;
    for (var c = -2; c <= 2; c++) {
      ctx.beginPath();
      ctx.moveTo(c * 3.6, -11);
      ctx.quadraticCurveTo(c * 4, -6, c * 3.4, 1);
      ctx.stroke();
    }

    // 头（偏右，骑手站在左肩）
    var hy = -18 + breath;
    ctx.fillStyle = '#5a3a21';
    ell(ctx, 9, hy, 9.5, 9);
    ctx.fill();
    outline(ctx, 1.4);
    // 耳朵
    ctx.fillStyle = '#7a5230';
    ell(ctx, 0.5, hy - 1, 3.2, 4);
    ctx.fill();
    outline(ctx, 0.9);
    // 脸
    ctx.fillStyle = '#d8b48c';
    ell(ctx, 12, hy + 1.5, 6.2, 5.6);
    ctx.fill();
    // 眉骨
    ctx.fillStyle = '#3a2413';
    ctx.beginPath();
    ctx.moveTo(5, hy - 4);
    ctx.lineTo(16.5, hy - 3);
    ctx.lineTo(15.5, hy - 1.2);
    ctx.lineTo(6, hy - 1.8);
    ctx.closePath();
    ctx.fill();
    // 眼睛
    ctx.fillStyle = '#fbbf24';
    ell(ctx, 8.6, hy - 2, 1.7, 1.2);
    ctx.fill();
    ctx.fillStyle = '#1f2937';
    ell(ctx, 9.1, hy - 2, 0.8, 1.1);
    ctx.fill();
    // 鼻孔
    ctx.fillStyle = 'rgba(60,35,20,0.9)';
    ell(ctx, 13, hy + 2, 0.8, 0.6);
    ctx.fill();
    // 嘴
    ctx.strokeStyle = 'rgba(60,35,20,0.9)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(8, hy + 4.5);
    ctx.quadraticCurveTo(12, hy + 6, 16, hy + 4.5);
    ctx.stroke();
    // 獠牙
    ctx.fillStyle = '#fffbe8';
    ctx.beginPath();
    ctx.moveTo(9.5, hy + 4.6);
    ctx.lineTo(10.6, hy + 7.4);
    ctx.lineTo(11.6, hy + 4.8);
    ctx.closePath();
    ctx.fill();
  }

  function drawFxFor(ctx, x, y, t, f) {
    if (!f) return;
    var kind = f.kind;
    var color = f.color || '#ffffff';
    var auraKinds = ['trail', 'legend', 'lightning', 'time', 'heart', 'flame', 'silver', 'void', 'ki'];
    if (auraKinds.indexOf(kind) < 0) return;
    var pulse = 0.55 + Math.sin(t * 3) * 0.15;
    var big = kind === 'legend' || kind === 'flame' || kind === 'silver' || kind === 'void';
    var r = big ? 36 : 27;

    // 基础气场
    var g = ctx.createRadialGradient(x, y - 20, 2, x, y - 20, r);
    g.addColorStop(0, hexA(color, 0.30 * pulse));
    g.addColorStop(1, hexA(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y - 20, r, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    if (kind === 'trail' || kind === 'legend' || kind === 'lightning' || kind === 'time' || kind === 'heart' || kind === 'ki') {
      // 环绕光点
      var n = kind === 'legend' ? 8 : 5;
      for (var i = 0; i < n; i++) {
        var a = t * 2.1 + i * Math.PI * 2 / n;
        var px = x + Math.cos(a) * (big ? 23 : 17);
        var py = y - 22 + Math.sin(a) * (big ? 13 : 10);
        ctx.fillStyle = hexA(color, 0.75);
        ctx.beginPath(); ctx.arc(px, py, 1.6, 0, Math.PI * 2); ctx.fill();
      }
    }

    if (kind === 'flame') {
      // 上升的金色火舌
      for (var fl = 0; fl < 12; fl++) {
        var fa = t * 1.5 + fl * Math.PI / 6;
        var rad = 18 + Math.sin(t * 7 + fl) * 4;
        var fx = x + Math.cos(fa) * rad;
        var fy = y - 20 + Math.sin(fa) * rad * 0.7;
        var h = 7 + Math.abs(Math.sin(t * 8 + fl)) * 12;
        var lg = ctx.createLinearGradient(fx, fy + h, fx, fy - h);
        lg.addColorStop(0, hexA(color, 0.05));
        lg.addColorStop(0.5, hexA(color, 0.55));
        lg.addColorStop(1, 'rgba(255,255,255,0.85)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.moveTo(fx - 2.2, fy + h * 0.6);
        ctx.quadraticCurveTo(fx - 1, fy - h * 0.2, fx + Math.sin(t * 9 + fl) * 3, fy - h);
        ctx.quadraticCurveTo(fx + 1.4, fy - h * 0.2, fx + 2.2, fy + h * 0.6);
        ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      for (var sp = 0; sp < 6; sp++) {
        var sa = t * 3 + sp * 1.1;
        ctx.fillRect(x + Math.cos(sa) * 26, y - 26 + Math.sin(sa) * 14, 1.6, 1.6);
      }
    }

    if (kind === 'lightning') {
      ctx.strokeStyle = hexA(color, 0.8);
      ctx.lineWidth = 1.4;
      for (var b = 0; b < 4; b++) {
        var ba = t * 1.3 + b * Math.PI / 2;
        var bx = x + Math.cos(ba) * 20;
        var by = y - 22 + Math.sin(ba) * 12;
        ctx.beginPath();
        ctx.moveTo(bx, by - 9);
        ctx.lineTo(bx + Math.sin(t * 20 + b) * 5, by);
        ctx.lineTo(bx - 2, by + 4);
        ctx.lineTo(bx + Math.cos(t * 18 + b) * 6, by + 11);
        ctx.stroke();
      }
    }

    if (kind === 'silver') {
      for (var ring = 0; ring < 3; ring++) {
        var rr = 18 + ((t * 26 + ring * 15) % 42);
        var ra = Math.max(0, 1 - rr / 46) * 0.5;
        ctx.strokeStyle = hexA(color, ra);
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(x, y - 20, rr, rr * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
      }
      for (var sv = 0; sv < 5; sv++) {
        var va = -Math.PI / 2 + (sv - 2) * 0.36;
        var len = 20 + Math.sin(t * 4 + sv) * 8;
        ctx.strokeStyle = hexA(color, 0.42);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(va) * 10, y - 20 + Math.sin(va) * 10);
        ctx.lineTo(x + Math.cos(va) * (10 + len), y - 20 + Math.sin(va) * (10 + len));
        ctx.stroke();
      }
    }

    if (kind === 'void') {
      ctx.strokeStyle = hexA(color, 0.45);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x, y - 20, 25, 11, t * 0.7, 0, Math.PI * 2); ctx.stroke();
      for (var o = 0; o < 6; o++) {
        var oa = -t * 2.2 + o * Math.PI / 3;
        var ox = x + Math.cos(oa) * 24;
        var oy = y - 20 + Math.sin(oa) * 11;
        var og = ctx.createRadialGradient(ox, oy, 0, ox, oy, 5);
        og.addColorStop(0, hexA(color, 0.9));
        og.addColorStop(1, hexA(color, 0));
        ctx.fillStyle = og;
        ctx.beginPath(); ctx.arc(ox, oy, 5, 0, Math.PI * 2); ctx.fill();
      }
    }

    if (kind === 'time') {
      ctx.strokeStyle = hexA(color, 0.55);
      ctx.lineWidth = 1.2;
      for (var arc = 0; arc < 2; arc++) {
        var ar = 20 + arc * 8;
        ctx.beginPath();
        ctx.arc(x, y - 22, ar, t * (arc ? -0.8 : 0.8), t * (arc ? -0.8 : 0.8) + 2.1);
        ctx.stroke();
      }
      ctx.fillStyle = hexA(color, 0.7);
      for (var tick = 0; tick < 6; tick++) {
        var ta = tick * Math.PI / 3 + t * 0.5;
        ctx.fillRect(x + Math.cos(ta) * 26, y - 22 + Math.sin(ta) * 12, 1.4, 1.4);
      }
    }

    if (kind === 'heart') {
      for (var hrt = 0; hrt < 4; hrt++) {
        var ha = t * 0.9 + hrt * 1.7;
        var hx = x + Math.cos(ha) * 20;
        var hy = y - 24 - ((t * 18 + hrt * 11) % 30);
        ctx.fillStyle = hexA(color, 0.65);
        ctx.beginPath();
        ctx.moveTo(hx, hy + 3);
        ctx.bezierCurveTo(hx - 5, hy - 2, hx - 3, hy - 6, hx, hy - 3);
        ctx.bezierCurveTo(hx + 3, hy - 6, hx + 5, hy - 2, hx, hy + 3);
        ctx.fill();
      }
    }

    if (kind === 'ki') {
      for (var m = 0; m < 6; m++) {
        var ma = t * 1.2 + m * 1.05;
        var mx = x + Math.cos(ma) * 18;
        var my = y - 12 - ((t * 22 + m * 7) % 26);
        ctx.fillStyle = hexA(color, 0.55);
        ctx.fillRect(mx, my, 1.6, 1.6);
      }
    }

    ctx.restore();
  }

  function hexA(hex, a) {
    var h = (hex || '#ffffff').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  /* ============================================================
   * 面板
   * ============================================================ */
  function init() {
    mask = document.getElementById('gearMask');
    gridEl = document.getElementById('gearGrid');
    detailEl = document.getElementById('gearDetail');
    fragEl = document.getElementById('gearFrag');
    previewCanvas = document.getElementById('gearPreview');
    previewTag = document.getElementById('gearPreviewTag');
    if (previewCanvas) pctx = previewCanvas.getContext('2d');
    stageEl = document.getElementById('gearStage');
    heroKicker = document.getElementById('gearHeroKicker');
    heroName = document.getElementById('gearHeroName');
    heroTag = document.getElementById('gearHeroTag');
    heroLore = document.getElementById('gearHeroLore');
    cgEl = document.getElementById('gearCg');
    cgCanvas = document.getElementById('gearCgCanvas');
    if (cgCanvas) cgCtx = cgCanvas.getContext('2d');
    cgKicker = document.getElementById('gcKicker');
    cgName = document.getElementById('gcName');
    cgRarity = document.getElementById('gcRarity');
    cgLore = document.getElementById('gcLore');
    if (!mask || !Store) return;

    document.getElementById('gearClose').addEventListener('click', close);
    mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
    Array.prototype.forEach.call(document.querySelectorAll('.gear-tab'), function (b) {
      b.addEventListener('click', function () {
        tab = b.dataset.gear;
        picked = null;
        syncTabs();
        render();
      });
    });
    document.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;
      var k = (e.key || '').toLowerCase();
      if (k === 'escape' && isOpen()) {
        // CG 在全屏时按 Esc 只关 CG，面板继续留着
        if (cgEl && cgEl.classList.contains('show')) return;
        close();
        return;
      }
      if (k !== 'c' || e.repeat) return;
      if (isOpen()) { close(); e.preventDefault(); return; }
      var busy = document.querySelector('#battleMask.show, #storyMask.show, #masterMask.show, #hlMask.show, #bagMask.show, #lootMask.show, #nodeDetail.show, #panel.show');
      if (busy) return;
      open();
      e.preventDefault();
    });
    Store.subscribe(function () {
      if (isOpen()) { updateFrag(); render(); }
    });
    window.addEventListener('resize', function () {
      if (isOpen()) sizePreview();
      if (cgEl && cgEl.classList.contains('show')) sizeCg();
    });

    // 点预览台 = 看一次换装 CG
    if (stageEl) {
      stageEl.addEventListener('click', function () {
        var id = picked || (tab === 'skin' ? Store.gear().skin : Store.gear().mount);
        showCg(tab, id);
      });
    }
    if (cgEl) {
      cgEl.addEventListener('click', function (e) {
        if (e.target === cgEl || e.target === cgCanvas) closeCg();
      });
    }
    var gcBtn = document.getElementById('gcClose');
    if (gcBtn) gcBtn.addEventListener('click', closeCg);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && cgEl && cgEl.classList.contains('show')) {
        closeCg();
        e.preventDefault();
      }
    });
  }

  function isOpen() { return !!(mask && mask.classList.contains('show')); }

  function open() {
    if (!mask) return;
    active = tab;
    picked = null;
    mask.classList.add('show');
    mask.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    updateFrag();
    syncTabs();
    render();
    startPreview();
  }

  function close() {
    mask.classList.remove('show');
    mask.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (previewRAF) { cancelAnimationFrame(previewRAF); previewRAF = 0; }
  }

  function updateFrag() {
    if (fragEl) fragEl.textContent = '🧩 ' + Store.gear().fragments + ' 碎片';
  }

  function syncTabs() {
    Array.prototype.forEach.call(document.querySelectorAll('.gear-tab'), function (b) {
      b.classList.toggle('active', b.dataset.gear === tab);
    });
  }

  /* ============================================================
   * 试穿预览：选中的皮肤 + 坐骑实时穿在角色身上
   * ============================================================ */
  function previewSkin() {
    if (tab === 'skin' && picked) return skinById(picked) || currentSkin();
    return currentSkin();
  }

  function previewMount() {
    if (tab === 'mount' && picked) return mountById(picked) || equippedMount();
    return equippedMount();
  }

  function sizePreview() {
    if (!previewCanvas) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = previewCanvas.clientWidth || 480;
    var h = previewCanvas.clientHeight || 230;
    previewCanvas.width = Math.max(320, Math.round(w * dpr));
    previewCanvas.height = Math.max(180, Math.round(h * dpr));
  }

  function updatePreviewTag() {
    if (!previewTag) return;
    var sk = previewSkin(), mt = previewMount();
    var g = Store.gear();
    var skinOwned = !!g.skins[sk.id];
    var mountOwned = !!(mt && mountUnlocked(mt));
    previewTag.innerHTML =
      '<span class="gp-line"><i>皮肤</i><b>' + sk.name + '</b>' +
        (skinOwned ? '' : '<em>未拥有</em>') + '</span>' +
      '<span class="gp-line"><i>坐骑</i><b>' + (mt ? mt.icon + ' ' + mt.name : '步行') + '</b>' +
        (mt && !mountOwned ? '<em>未解锁</em>' : '') + '</span>' +
      '<span class="gp-hint">选中左侧卡片即可试穿</span>';
  }

  function mountRarity(m) {
    return m.speed >= 1.7 ? 'legend' : m.speed >= 1.4 ? 'rare' : 'common';
  }

  function updatePreviewHero() {
    if (!stageEl) return;
    if (tab === 'mount') {
      var m = previewMount();
      var rarity = m ? mountRarity(m) : 'common';
      stageEl.className = 'gear-stage rarity-' + rarity;
      heroKicker.textContent = m ? ('坐骑 · ' + (RARITY[rarity] || RARITY.common).label) : '当前状态';
      heroName.textContent = m ? m.name : '步行';
      heroTag.textContent = m
        ? ((MOUNT_META[m.id] || {}).tagline || m.desc)
        : '还没有选择坐骑，点左侧卡片试骑。';
      if (heroLore) heroLore.textContent = m ? ((MOUNT_META[m.id] || {}).lore || '') : '';
    } else {
      var sk = previewSkin();
      stageEl.className = 'gear-stage rarity-' + sk.rarity;
      heroKicker.textContent = (RARITY[sk.rarity] || RARITY.common).label + '皮肤';
      heroName.textContent = sk.name;
      heroTag.textContent = (SKIN_META[sk.id] || {}).tagline || sk.desc;
      if (heroLore) heroLore.textContent = (SKIN_META[sk.id] || {}).lore || sk.desc;
    }
  }

  /* ============================================================
   * 换装 CG：大尺寸角色 + 光柱 + 粒子，一次性播放
   * ============================================================ */
  function sizeCg() {
    if (!cgCanvas) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = cgCanvas.clientWidth || window.innerWidth;
    var h = cgCanvas.clientHeight || window.innerHeight;
    cgCanvas.width = Math.max(320, Math.round(w * dpr));
    cgCanvas.height = Math.max(220, Math.round(h * dpr));
  }

  function showCg(kind, id) {
    if (!cgEl || !cgCtx) return;
    var sk, mt, title, rarity, lore, kicker;
    if (kind === 'mount') {
      mt = id ? mountById(id) : equippedMount();
      if (!mt) {
        if (NS.Engine) NS.Engine.toast('先选一个坐骑再看展示');
        return;
      }
      sk = currentSkin();
      title = mt.name;
      rarity = mountRarity(mt);
      lore = (MOUNT_META[mt.id] || {}).lore || mt.desc;
      kicker = 'NEW MOUNT';
    } else {
      sk = id ? skinById(id) : currentSkin();
      if (!sk) return;
      mt = equippedMount();
      title = sk.name;
      rarity = sk.rarity;
      lore = (SKIN_META[sk.id] || {}).lore || sk.desc;
      kicker = 'NEW SKIN';
    }
    cgState = { sk: sk, mt: mt, rarity: rarity, t0: performance.now(), kind: kind };
    cgKicker.textContent = kicker;
    cgName.textContent = title;
    cgRarity.textContent = (RARITY[rarity] || RARITY.common).label;
    cgRarity.className = 'gc-rarity ' + (RARITY[rarity] || RARITY.common).cls;
    cgLore.textContent = lore;
    cgEl.classList.add('show');
    cgEl.setAttribute('aria-hidden', 'false');
    sizeCg();
    if (!cgRAF) cgRAF = requestAnimationFrame(cgLoop);
    clearTimeout(cgTimer);
    cgTimer = setTimeout(closeCg, 7000);
  }

  function closeCg() {
    if (!cgEl) return;
    cgEl.classList.remove('show');
    cgEl.setAttribute('aria-hidden', 'true');
    if (cgRAF) { cancelAnimationFrame(cgRAF); cgRAF = 0; }
    clearTimeout(cgTimer);
    cgTimer = 0;
    cgState = null;
  }

  function cgLoop(ts) {
    if (!cgEl || !cgEl.classList.contains('show') || !cgState) { cgRAF = 0; return; }
    cgRAF = requestAnimationFrame(cgLoop);
    drawCg(Math.max(0, (ts - cgState.t0) / 1000));
  }

  function drawCg(t) {
    if (!cgCtx || !cgState) return;
    var dpr = cgCanvas.width / (cgCanvas.clientWidth || 1);
    var W = cgCanvas.width / dpr, H = cgCanvas.height / dpr;
    cgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cgCtx.clearRect(0, 0, W, H);

    var rarity = cgState.rarity;
    var pal = rarity === 'legend' ? ['#1a0b2e', '#6d28d9', '#fbbf24']
      : rarity === 'rare' ? ['#04121f', '#0e7490', '#7dd3fc']
        : ['#07130d', '#166534', '#fde68a'];
    var bg = cgCtx.createRadialGradient(W * 0.66, H * 0.46, 10, W * 0.66, H * 0.46, Math.max(W, H) * 0.85);
    bg.addColorStop(0, pal[1]);
    bg.addColorStop(0.45, pal[0]);
    bg.addColorStop(1, '#03060a');
    cgCtx.fillStyle = bg;
    cgCtx.fillRect(0, 0, W, H);

    var cx = W * 0.68, cy = H * 0.5;

    // 旋转光柱
    cgCtx.save();
    cgCtx.translate(cx, cy);
    cgCtx.rotate(t * 0.14);
    for (var i = 0; i < 14; i++) {
      cgCtx.rotate(Math.PI * 2 / 14);
      var wedge = cgCtx.createLinearGradient(0, 0, 0, -Math.max(W, H) * 0.72);
      wedge.addColorStop(0, 'rgba(255,255,255,0.10)');
      wedge.addColorStop(1, 'rgba(255,255,255,0)');
      cgCtx.fillStyle = wedge;
      cgCtx.beginPath();
      cgCtx.moveTo(-10, 0); cgCtx.lineTo(10, 0); cgCtx.lineTo(26, -Math.max(W, H) * 0.72);
      cgCtx.lineTo(-26, -Math.max(W, H) * 0.72); cgCtx.closePath(); cgCtx.fill();
    }
    cgCtx.restore();

    // 扩散光环
    cgCtx.save();
    cgCtx.globalCompositeOperation = 'lighter';
    for (var r = 0; r < 3; r++) {
      var rr = 60 + ((t * 160 + r * 80) % 360);
      var ra = Math.max(0, 1 - rr / 380) * 0.35;
      cgCtx.strokeStyle = hexA(pal[2], ra);
      cgCtx.lineWidth = 2;
      cgCtx.beginPath();
      cgCtx.ellipse(cx, cy + 40, rr, rr * 0.34, 0, 0, Math.PI * 2);
      cgCtx.stroke();
    }
    cgCtx.restore();

    // 上升粒子
    for (var p = 0; p < 46; p++) {
      var pa = p * 2.399 + t * 1.2;
      var pr = 40 + (p * 37 % 260);
      var px = cx + Math.cos(pa) * pr * 1.1;
      var py = H * 0.82 - ((t * 70 + p * 23) % (H * 0.62));
      cgCtx.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(t * 2 + p));
      cgCtx.fillStyle = pal[2];
      cgCtx.fillRect(px, py, 2, 2);
    }
    cgCtx.globalAlpha = 1;

    // 地面阴影
    cgCtx.fillStyle = 'rgba(0,0,0,0.35)';
    cgCtx.beginPath(); cgCtx.ellipse(cx, H * 0.79, 120, 22, 0, 0, Math.PI * 2); cgCtx.fill();

    // 角色 + 坐骑 + 气场
    var img = NS.World && NS.World.previewSprite ? NS.World.previewSprite(specWithMount(cgState.sk, cgState.mt), 'down') : null;
    var cgHp = (NS.World && NS.World.hairPad) ? NS.World.hairPad(specWithMount(cgState.sk, cgState.mt)) : 0;
    var k = Math.max(4.2, Math.min(8.2, H / 128)) * (1 + 0.05 * Math.max(0, 1 - t * 2));
    var cgRo = riderOffset(cgState.mt);
    var cgRdy = cgRo ? cgRo.dy : 0;
    cgCtx.save();
    cgCtx.translate(cx, H * 0.78);
    cgCtx.scale(k, k);
    drawMountFor(cgCtx, 0, 0, t, false, cgState.mt);
    drawFxFor(cgCtx, 0, cgRdy, t, cgState.sk.fx);
    cgCtx.imageSmoothingEnabled = false;
    if (img) cgCtx.drawImage(img, -20, -52 - 2 * cgHp + cgRdy, 40, 52 + 2 * cgHp);
    if (cgState.mt && cgState.mt.id === 'moto') motoFront(cgCtx, t);
    cgCtx.restore();

    // 开场白闪
    if (t < 0.28) {
      cgCtx.fillStyle = 'rgba(255,255,255,' + (0.65 * (1 - t / 0.28)).toFixed(2) + ')';
      cgCtx.fillRect(0, 0, W, H);
    }
  }

  function startPreview() {
    if (!pctx) return;
    sizePreview();
    if (previewRAF) return;
    previewRAF = requestAnimationFrame(previewLoop);
  }

  function previewLoop(ts) {
    if (!isOpen()) { previewRAF = 0; return; }
    previewRAF = requestAnimationFrame(previewLoop);
    drawPreview(ts / 1000);
  }

  function drawPreview(t) {
    if (!pctx || !previewCanvas || !NS.World || !NS.World.previewSprite) return;
    var dpr = previewCanvas.width / (previewCanvas.clientWidth || 1);
    var W = previewCanvas.width / dpr;
    var H = previewCanvas.height / dpr;
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.clearRect(0, 0, W, H);

    // 舞台光
    var glow = pctx.createRadialGradient(W / 2, H * 0.52, 8, W / 2, H * 0.52, W * 0.55);
    glow.addColorStop(0, 'rgba(52,211,153,0.16)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    pctx.fillStyle = glow;
    pctx.fillRect(0, 0, W, H);

    // 脚下的石台
    pctx.fillStyle = 'rgba(0,0,0,0.30)';
    pctx.beginPath(); pctx.ellipse(W / 2, H - 26, 76, 16, 0, 0, Math.PI * 2); pctx.fill();
    pctx.strokeStyle = 'rgba(214,178,106,0.30)';
    pctx.lineWidth = 1.5;
    pctx.beginPath(); pctx.ellipse(W / 2, H - 26, 76, 16, 0, 0, Math.PI * 2); pctx.stroke();

    var sk = previewSkin(), mt = previewMount();
    var img = NS.World.previewSprite(specWithMount(sk, mt), 'down');
    var hp = NS.World.hairPad ? NS.World.hairPad(specWithMount(sk, mt)) : 0;
    var ro = riderOffset(mt);
    var rdy = ro ? ro.dy : 0;
    // 骑手被抬高时整体缩小一点，保证长坐骑不被画布裁掉
    var k = Math.max(2.0, Math.min(3.8, (H - 66) / (52 + 2 * hp + Math.max(0, -rdy))));
    var bob = Math.sin(t * 2.2) * 1.5;

    pctx.save();
    pctx.translate(W / 2, H - 30 + bob);
    pctx.scale(k, k);
    drawMountFor(pctx, 0, 0, t, false, mt);
    drawFxFor(pctx, 0, rdy, t, sk.fx);
    pctx.imageSmoothingEnabled = false;
    if (img) pctx.drawImage(img, -20, -52 - 2 * hp + rdy, 40, 52 + 2 * hp);
    if (mt && mt.id === 'moto') motoFront(pctx, t);
    pctx.restore();
  }

  function render() {
    if (tab === 'mount') renderMounts(); else renderSkins();
    updatePreviewTag();
    updatePreviewHero();
  }

  function renderMounts() {
    var g = Store.gear();
    var cur = g.mount;
    gridEl.innerHTML = MOUNTS.map(function (m) {
      var unlocked = mountUnlocked(m);
      return '<button class="gear-card mount' + (cur === m.id ? ' equipped' : '') + (unlocked ? '' : ' locked') + '" data-mount="' + m.id + '">' +
        '<span class="gear-ico">' + m.icon + '</span>' +
        '<span class="gear-info"><b>' + m.name + '</b><em>' + (unlocked ? '+' + Math.round((m.speed - 1) * 100) + '% 速度' : '未解锁') + '</em></span>' +
        (cur === m.id ? '<span class="gear-flag">使用中</span>' : '') +
      '</button>';
    }).join('');
    var m = mountById(cur) || MOUNTS[0];
    detailHtml(mountDetailHtml(m));
  }

  function mountDetailHtml(m) {
    var unlocked = mountUnlocked(m);
    var node = nodeOf(m.node);
    var cur = Store.gear().mount === m.id;
    return '<div class="gear-hero"><span class="gear-hero-ico">' + m.icon + '</span>' +
      '<div><div class="gear-hero-name">' + m.name + '</div>' +
      '<div class="gear-hero-sub">移动速度 +' + Math.round((m.speed - 1) * 100) + '%</div></div></div>' +
      '<div class="gear-desc">' + m.desc + '</div>' +
      '<div class="gear-req">解锁条件：通关「' + (node ? node.name : m.node) + '」' +
        (unlocked ? '　✅ 已达成' : '　🔒 未达成') + '</div>' +
      (unlocked
        ? (cur ? '<button class="btn btn-block" disabled>已装备</button>'
          : '<button class="btn btn-primary btn-block" id="gearUse">装备坐骑</button>')
        : '<button class="btn btn-block" disabled>先去打赢他</button>');
  }

  function renderSkins() {
    var g = Store.gear();
    gridEl.innerHTML = SKINS.map(function (s) {
      var owned = !!g.skins[s.id];
      var r = RARITY[s.rarity] || RARITY.common;
      return '<button class="gear-card skin ' + r.cls + (g.skin === s.id ? ' equipped' : '') + (owned ? '' : ' locked') + '" data-skin="' + s.id + '">' +
        '<span class="gear-ico">' + (s.rarity === 'legend' ? '👑' : s.rarity === 'rare' ? '✨' : '👕') + '</span>' +
        '<span class="gear-info"><b>' + s.name + '</b><em>' + r.label + (owned ? '' : ' · 🧩 ' + s.cost) + '</em></span>' +
        (g.skin === s.id ? '<span class="gear-flag">使用中</span>' : '') +
      '</button>';
    }).join('');
    var s = skinById(g.skin) || SKINS[0];
    detailHtml(skinDetailHtml(s));
  }

  function skinDetailHtml(s) {
    var g = Store.gear();
    var owned = !!g.skins[s.id];
    var r = RARITY[s.rarity] || RARITY.common;
    var equipped = g.skin === s.id;
    return '<div class="gear-hero"><span class="gear-hero-ico">' + (s.rarity === 'legend' ? '👑' : s.rarity === 'rare' ? '✨' : '👕') + '</span>' +
      '<div><div class="gear-hero-name">' + s.name + ' <span class="skin-rarity ' + r.cls + '">' + r.label + '</span></div>' +
      '<div class="gear-hero-sub">' + (s.rarity === 'legend' ? '传说：光环 + 粒子 + 残影' :
        s.rarity === 'rare' ? '优秀：移动残影' : '普通：无额外动效') + '</div></div></div>' +
      '<div class="gear-desc">' + s.desc + '</div>' +
      '<div class="gear-req">价格：' + (s.cost ? '🧩 ' + s.cost + ' 碎片' : '初始皮肤') +
        '　·　持有 🧩 ' + g.fragments + '</div>' +
      (equipped ? '<button class="btn btn-block" disabled>已装备</button>'
        : owned ? '<button class="btn btn-primary btn-block" id="gearUse">装备皮肤</button>'
          : '<button class="btn btn-primary btn-block" id="gearBuy"' + (g.fragments < s.cost ? ' disabled' : '') + '>' +
            (g.fragments < s.cost ? '碎片不足' : '兑换并装备（🧩 ' + s.cost + '）') + '</button>');
  }

  function detailHtml(html) {
    detailEl.innerHTML = html;
    var use = document.getElementById('gearUse');
    if (use) use.addEventListener('click', usePicked);
    var buy = document.getElementById('gearBuy');
    if (buy) buy.addEventListener('click', buyPicked);
  }

  function usePicked() {
    if (!picked) return;
    if (tab === 'mount') {
      Store.equipMount(picked);
      if (NS.Engine) NS.Engine.toast('🛞 已装备「' + mountById(picked).name + '」');
      showCg('mount', picked);
    } else {
      Store.equipSkin(picked);
      if (NS.Engine) NS.Engine.toast('✨ 已换上「' + skinById(picked).name + '」');
      showCg('skin', picked);
    }
    render();
  }

  function buyPicked() {
    if (!picked) return;
    var s = skinById(picked);
    if (!s) return;
    if (Store.gear().fragments < s.cost) {
      if (NS.Engine) NS.Engine.toast('碎片不足：还差 ' + (s.cost - Store.gear().fragments) + ' 枚');
      return;
    }
    if (!Store.spendFragments(s.cost)) return;
    Store.ownSkin(s.id);
    if (NS.Engine) NS.Engine.toast('✨ 兑换成功：「' + s.name + '」已装备');
    updateFrag();
    render();
    showCg('skin', picked);
  }

  function bindGrid() {
    gridEl.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-mount],[data-skin]') : null;
      if (!b) return;
      if (b.dataset.mount) {
        picked = b.dataset.mount;
        detailHtml(mountDetailHtml(mountById(picked)));
      } else {
        picked = b.dataset.skin;
        detailHtml(skinDetailHtml(skinById(picked)));
      }
      updatePreviewTag();
      updatePreviewHero();
    });
  }

  NS.Gear = {
    init: function () { init(); if (gridEl) bindGrid(); },
    open: open,
    close: close,
    playerSpec: playerSpec,
    equippedMount: equippedMount,
    speed: speed,
    fx: fx,
    drawMount: drawMount,
    drawMountFront: drawMountFront,
    drawFx: drawFx,
    riderDy: function () { var ro = riderOffset(equippedMount()); return ro ? ro.dy : 0; },
    // ---- 联机：好友按自己的皮肤/坐骑绘制（不查本机装备与解锁状态） ----
    specOfSkinId: function (id) { return specOfSkin(skinById(id) || SKINS[0]); },
    mountById: mountById,
    riderDyOf: function (id) { var ro = riderOffset(mountById(id)); return ro ? ro.dy : 0; },
    drawMountFor: drawMountFor,
    drawMountFrontFor: drawMountFront,
    mounts: MOUNTS,
    skins: SKINS
  };
})(window.HNSF829);
