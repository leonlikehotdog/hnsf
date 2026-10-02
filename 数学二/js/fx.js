/* ============================================================
 * 829 闯关系统 · 热血视觉特效（原创程序化背景 + 打击反馈）
 * ------------------------------------------------------------
 * NS.BG  ：Canvas 动态战场背景
 *          · 底图优先级：assets/bg.mp4 视频（默认，逐帧绘制到画布）
 *            > assets/ 下内置两张 Pexels License 静态图（bg-map.jpg / bg-battle.jpg）
 *            > 纯程序化天幕；任一环节缺失都无缝降级，不会报 404
 *          · 图层：星云 / 星海 / 上升气焰 / 环绕闪电 / 边缘火舌 /
 *                  龟裂地面 + 上浮碎石 / 蓄气冲击波
 * NS.FX  ：闪光、震屏、爆气、连击气焰、神龙降临等屏幕级反馈
 * 全部由代码绘制，不依赖任何外部图片，可离线运行。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
   * 一、动态战场背景
   * ============================================================ */
  var BG = (function () {
    var cv, cx, W = 0, H = 0, dpr = 1, raf = null, running = false, t0 = 0;
    var clouds = [], stars = [], auras = [], embers = [], debris = [], cracks = [], flames = [];
    var bolts = [], shock = null, boltTimer = 4000;

    // 场景配置：底图路径 + 能量强度 + 底色
    var SCENES = {
      map:    { img: 'assets/bg-map.jpg',    power: 1.0, sky: ['#04060f', '#0b1230', '#1a1042', '#3b0f6e'] },
      battle: { img: 'assets/bg-battle.jpg', power: 1.7, sky: ['#070313', '#150a30', '#2e1065', '#4c1d95'] }
    };
    var sceneKey = 'map';
    var baseImgs = {};                 // key -> { ok:bool, img:Image }
    var imgMode = false;               // 由界面「背景图」开关控制（默认开启，见 app.js loadBgPref）

    /* -------------------- 背景视频 --------------------
       优先级：bg.mp4 视频 > 场景静态底图 > 程序化天幕。
       视频整体铺满（cover）+ 压暗渐变，所以地图页 / 战斗页共用同一段视频。
       ⚠️ 素材有个硬要求：**首帧与末帧必须是同一画面**，这样才能用原生 loop 无缝衔接。
       当前 bg.mp4 是把原片段「正放 + 倒放」拼成的往复循环（318 帧 / 10.26s），两端天然
       同帧，所以循环点上没有任何跳变。原片是单向动作、首尾姿势差 0.095（正常帧间运动
       只有 0.015，是它的 6 倍），无论怎么截帧都接不上，只能这样处理。
       以后要换新视频：先做成往复循环再放进来；若坚持用单向片段，就得恢复
       「双视频交叉淡化」的旧实现（用叠影换掉硬跳，观感更差）。
       视频缺失 / 自动播放被拦截 → 静默降级，不会报错。 */
    var VIDEO_SRC = 'assets/bg.mp4';
    var vidEl = null;
    var vidOk = false, vidTried = false, vidRetryBound = false;

    function vReady(v) { return !!(v && v.readyState >= 2 && v.videoWidth); }

    function playEl(v) {
      if (!v) return;
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () { /* 拦截则保持降级 */ });
    }

    function probeVideo() {
      if (!imgMode || vidTried) return;
      vidTried = true;
      vidEl = document.getElementById('bgVideo');
      if (!vidEl) return;
      vidEl.muted = true;                       // 必须静音，否则自动播放会被浏览器拦截
      vidEl.loop = true;                        // 素材首尾同帧，直接交给浏览器无缝循环
      vidEl.src = VIDEO_SRC;
      vidEl.addEventListener('canplay', function () { vidOk = true; });
      vidEl.addEventListener('error', function () { vidOk = false; });
      playEl(vidEl);
    }

    /** 少数浏览器首次会拦截自动播放：等用户第一次交互补播一次 */
    function bindVideoRetry() {
      if (vidRetryBound) return;
      vidRetryBound = true;
      document.addEventListener('pointerdown', function retry() {
        document.removeEventListener('pointerdown', retry);
        if (!imgMode || !vidEl) return;
        if (!vidOk) playEl(vidEl);
        else if (vidEl.paused && !vidEl.ended) playEl(vidEl);
      });
    }

    function stopVideo() {
      if (vidEl) vidEl.pause();
    }

    /** 可用的视频帧：探测到并且拿到宽高才算就绪，否则返回 false 走降级 */
    function videoReadyNow() { return !!(imgMode && vidOk && vReady(vidEl)); }

    /* 底图/视频通用压暗层：保证前景文字始终可读 */
    function dimOverlay(a0, a1, a2) {
      var ov = cx.createLinearGradient(0, 0, 0, H);
      ov.addColorStop(0, 'rgba(3,6,14,' + a0 + ')');
      ov.addColorStop(0.5, 'rgba(6,8,18,' + a1 + ')');
      ov.addColorStop(1, 'rgba(28,8,50,' + a2 + ')');
      cx.fillStyle = ov;
      cx.fillRect(0, 0, W, H);
    }

    /* 按 cover 铺满画一帧视频（alpha 用于交叉淡化） */
    function drawCover(v, alpha) {
      var s = Math.max(W / v.videoWidth, H / v.videoHeight);
      var dw = v.videoWidth * s, dh = v.videoHeight * s;
      cx.globalAlpha = alpha;
      cx.drawImage(v, (W - dw) / 2, (H - dh) / 2, dw, dh);
      cx.globalAlpha = 1;
    }

    /**
     * 绘制视频底图；不可用时返回 false，由调用方降级到静态图/程序化背景。
     * 循环交给原生 loop（素材首尾同帧），这里只负责把当前帧贴上去。
     */
    function drawVideo() {
      if (!videoReadyNow()) return false;
      drawCover(vidEl, 1);
      if (vidEl.ended) {                          // 兜底：标签页挂起后回来停在末帧
        vidEl.currentTime = 0;
        playEl(vidEl);
      }
      return true;
    }

    /* ---------- 可选底图：开关控制，探测失败静默降级 ---------- */
    function probe(key) {
      if (!imgMode || baseImgs[key]) return;
      baseImgs[key] = { ok: false, img: null };
      var def = SCENES[key];
      if (!def || !def.img) return;
      var img = new Image();
      img.onload = function () { baseImgs[key] = { ok: true, img: img }; };
      img.onerror = function () { baseImgs[key] = { ok: false, img: null }; };
      img.src = def.img;
    }

    /** 开启/关闭自定义背景；只探测当前场景，进关卡时再按需探测战斗图 */
    function setImageMode(on) {
      imgMode = !!on;
      baseImgs = {};
      vidTried = false; vidOk = false;
      if (!imgMode) stopVideo();
      if (imgMode) { probeVideo(); bindVideoRetry(); probe(sceneKey); }
    }

    function imagesOn() { return imgMode; }

    function setScene(key) {
      if (!SCENES[key]) return;
      sceneKey = key;
      probe(key);
      // 场景能量强度不同，需按新的 intensity 重建粒子，否则视觉不一致
      if (W && H) build();
    }

    function cfg() { return SCENES[sceneKey] || SCENES.map; }
    function power() { return cfg().power; }

    /* ---------- 尺寸与粒子重建 ---------- */
    function resize() {
      if (!cv) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      var area = W * H;
      var p = power();
      var starN = Math.min(320, Math.max(90, Math.round(area / 9000)));
      var auraN = reduced ? 0 : Math.min(70, Math.round(Math.max(18, area / 34000) * p));
      var emberN = reduced ? 0 : Math.min(90, Math.round(Math.max(16, area / 26000) * p));
      var debN = reduced ? 0 : Math.min(26, Math.round(Math.max(8, area / 90000) * p));
      var flameN = reduced ? 0 : Math.min(30, Math.round(Math.max(12, area / 60000) * p));

      stars = [];
      for (var i = 0; i < starN; i++) {
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.5 + 0.35,
          lay: Math.random() < 0.34 ? 0 : (Math.random() < 0.6 ? 1 : 2),
          tw: Math.random() * Math.PI * 2,
          hue: Math.random() < 0.2 ? '196,181,253' : '200,225,255'
        });
      }

      auras = []; for (i = 0; i < auraN; i++) auras.push(newAura(true));
      embers = []; for (i = 0; i < emberN; i++) embers.push(newEmber(true));
      debris = []; for (i = 0; i < debN; i++) debris.push(newDebris(true));
      flames = []; for (i = 0; i < flameN; i++) flames.push(newFlame(i, flameN));

      clouds = [
        { x: W * 0.18, y: H * 0.26, r: Math.max(W, H) * 0.45, c: '56,132,255', a: 0.20, vx: 0.012, vy: 0.006 },
        { x: W * 0.82, y: H * 0.18, r: Math.max(W, H) * 0.38, c: '168,85,247', a: 0.16, vx: -0.01, vy: 0.008 },
        { x: W * 0.55, y: H * 0.86, r: Math.max(W, H) * 0.52, c: '124,58,237', a: 0.18, vx: 0.008, vy: -0.006 },
        { x: W * 0.08, y: H * 0.82, r: Math.max(W, H) * 0.3, c: '150,80,255', a: 0.13, vx: -0.006, vy: -0.008 }
      ];

      buildCracks();
    }

    /* ---------- 龟裂地面（战斗破坏感） ---------- */
    function buildCracks() {
      cracks = [];
      var n = Math.max(5, Math.round(W / 240));
      for (var i = 0; i < n; i++) {
        var x = (i + 0.5) / n * W + (Math.random() - 0.5) * W / n;
        var y = H * (0.72 + Math.random() * 0.26);
        var pts = [{ x: x, y: y }];
        var segs = 4 + (Math.random() * 4 | 0);
        var ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.1;
        for (var k = 0; k < segs; k++) {
          ang += (Math.random() - 0.5) * 1.3;
          var len = 26 + Math.random() * 54;
          var nx = pts[pts.length - 1].x + Math.cos(ang) * len;
          var ny = pts[pts.length - 1].y + Math.sin(ang) * len * 0.5;
          pts.push({ x: nx, y: ny });
        }
        cracks.push({ pts: pts, ph: Math.random() * Math.PI * 2, w: 1 + Math.random() * 1.8 });
      }
    }

    /* ---------- 粒子工厂 ---------- */
    function newAura(init) {
      return {
        x: Math.random() * W,
        y: init ? Math.random() * H : H + Math.random() * 60,
        r: Math.random() * 2.4 + 0.9,
        vy: -(Math.random() * 0.55 + 0.28) * power(),
        vx: (Math.random() - 0.5) * 0.28,
        life: 0, max: 180 + Math.random() * 260,
        hue: Math.random() < 0.62 ? '168,85,247' : '124,58,237',
        ph: Math.random() * Math.PI * 2
      };
    }

    function newEmber(init) {
      return {
        x: Math.random() * W,
        y: init ? Math.random() * H : H + Math.random() * 40,
        r: Math.random() * 1.3 + 0.5,
        vy: -(Math.random() * 1.7 + 0.9) * power(),
        vx: (Math.random() - 0.5) * 1.1,
        life: 0, max: 90 + Math.random() * 120,
        hue: Math.random() < 0.5 ? '196,181,253' : '124,58,237'
      };
    }

    function newDebris(init) {
      var s = 2 + Math.random() * 6;
      return {
        x: Math.random() * W,
        y: init ? Math.random() * H : H + 30,
        w: s, h: s * (0.6 + Math.random() * 0.9),
        vy: -(Math.random() * 0.5 + 0.16) * power(),
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.02,
        life: 0, max: 260 + Math.random() * 320
      };
    }

    // 屏幕四边的"气焰火舌"，随机分布在四周向内舔
    function newFlame(i, total) {
      var side = Math.random() < 0.5 ? Math.floor(Math.random() * 4) : i % 4;
      var x, y, dir;
      if (side === 0) { x = Math.random() * W; y = -10; dir = Math.PI / 2; }
      else if (side === 1) { x = W + 10; y = Math.random() * H; dir = Math.PI; }
      else if (side === 2) { x = Math.random() * W; y = H + 10; dir = -Math.PI / 2; }
      else { x = -10; y = Math.random() * H; dir = 0; }
      return {
        x: x, y: y, dir: dir,
        len: 90 + Math.random() * 190,
        w: 26 + Math.random() * 60,
        ph: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.9,
        hue: Math.random() < 0.55 ? '139,92,246' : '56,189,248'
      };
    }

    /* ---------- 闪电 ---------- */
    function makeBolt() {
      var x = W * (0.1 + Math.random() * 0.8), y = -20, segs = [], n = 7 + (Math.random() * 5 | 0);
      for (var i = 0; i < n; i++) {
        segs.push({ x: x, y: y });
        x += (Math.random() - 0.5) * 100;
        y += H * 0.36 / n * (0.7 + Math.random() * 0.6);
      }
      return { segs: segs, life: 0, max: 14 + Math.random() * 8 };
    }

    /* ---------- 主循环 ---------- */
    function frame(now) {
      if (!running) return;
      if (!t0) t0 = now;
      var dt = Math.min(50, now - t0); t0 = now;
      var k = dt / 16.67;
      var p = power();

      cx.clearRect(0, 0, W, H);

      // 1) 底图：视频（含首尾交叉淡化）> 场景静态图 > 程序化天幕
      var cur = baseImgs[sceneKey];
      var sky = cfg().sky;
      if (drawVideo()) {
        dimOverlay(0.58, 0.40, 0.55);          // 视频比静态图亮，压暗层略浅
      } else if (cur && cur.ok) {
        var img = cur.img;
        var s = Math.max(W / img.width, H / img.height);
        var dw = img.width * s, dh = img.height * s;
        cx.globalAlpha = 1;
        cx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        dimOverlay(0.72, 0.55, 0.68);
      } else {
        var g = cx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, sky[0]); g.addColorStop(0.45, sky[1]);
        g.addColorStop(0.78, sky[2]); g.addColorStop(1, sky[3]);
        cx.fillStyle = g;
        cx.fillRect(0, 0, W, H);
      }

      // 2) 星云
      clouds.forEach(function (c) {
        c.x += c.vx * k * p; c.y += c.vy * k * p;
        if (c.x < -c.r) c.x = W + c.r; if (c.x > W + c.r) c.x = -c.r;
        if (c.y < -c.r) c.y = H + c.r; if (c.y > H + c.r) c.y = -c.r;
        var rg = cx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        var ca = Math.min(0.55, c.a * (0.7 + 0.5 * p));
        rg.addColorStop(0, 'rgba(' + c.c + ',' + ca + ')');
        rg.addColorStop(0.55, 'rgba(' + c.c + ',' + (ca * 0.35) + ')');
        rg.addColorStop(1, 'rgba(' + c.c + ',0)');
        cx.fillStyle = rg;
        cx.fillRect(c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
      });

      // 3) 地面龟裂发光（战斗中更亮、带脉动）
      if (cracks.length) {
        cx.save();
        cx.globalCompositeOperation = 'lighter';
        cx.lineCap = 'round';
        cracks.forEach(function (ck) {
          var a = (0.13 + 0.1 * Math.sin(now / 900 + ck.ph)) * p;
          cx.strokeStyle = 'rgba(196,181,253,' + a + ')';
          cx.lineWidth = ck.w;
          cx.shadowColor = 'rgba(124,58,237,0.85)';
          cx.shadowBlur = 14;
          cx.beginPath();
          ck.pts.forEach(function (pt, i) { i ? cx.lineTo(pt.x, pt.y) : cx.moveTo(pt.x, pt.y); });
          cx.stroke();
        });
        cx.restore();
      }

      // 4) 星海（视差 + 闪烁）
      var drift = [0.06, 0.14, 0.26];
      stars.forEach(function (s) {
        s.x += drift[s.lay] * k;
        if (s.x > W + 3) s.x = -3;
        s.tw += 0.03 * k;
        var tw = 0.55 + 0.45 * Math.sin(s.tw);
        cx.beginPath();
        cx.fillStyle = 'rgba(' + s.hue + ',' + (tw * (s.lay === 0 ? 0.5 : 0.9)) + ')';
        cx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        cx.fill();
      });

      // 5) 上浮碎石
      cx.globalCompositeOperation = 'lighter';
      debris.forEach(function (d, i) {
        d.life += k; d.y += d.vy * k; d.rot += d.vr * k;
        var lk = Math.max(0, 1 - d.life / d.max);
        if (d.life > d.max || d.y < -40) { debris[i] = newDebris(false); return; }
        cx.save();
        cx.translate(d.x, d.y); cx.rotate(d.rot);
        cx.fillStyle = 'rgba(70,45,120,' + (0.5 * lk) + ')';
        cx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);
        cx.strokeStyle = 'rgba(139,92,246,' + (0.55 * lk) + ')';
        cx.lineWidth = 0.8;
        cx.strokeRect(-d.w / 2, -d.h / 2, d.w, d.h);
        cx.restore();
      });

      // 6) 上升气焰 + 火星
      auras.forEach(function (a, i) {
        a.life += k; a.y += a.vy * k; a.x += a.vx * k; a.ph += 0.08 * k;
        var lk = Math.max(0, 1 - a.life / a.max);
        if (a.life > a.max || a.y < -20) { auras[i] = newAura(false); return; }
        var r = a.r * (1 + Math.sin(a.ph) * 0.22);
        var rg = cx.createRadialGradient(a.x, a.y, 0, a.x, a.y, r * 5);
        rg.addColorStop(0, 'rgba(' + a.hue + ',' + (0.62 * lk) + ')');
        rg.addColorStop(1, 'rgba(' + a.hue + ',0)');
        cx.fillStyle = rg;
        cx.beginPath(); cx.arc(a.x, a.y, r * 5, 0, Math.PI * 2); cx.fill();
        cx.beginPath();
        cx.fillStyle = 'rgba(233,213,255,' + (0.75 * lk) + ')';
        cx.arc(a.x, a.y, r * 0.7, 0, Math.PI * 2); cx.fill();
      });
      embers.forEach(function (e, i) {
        e.life += k; e.y += e.vy * k; e.x += e.vx * k;
        var lk = Math.max(0, 1 - e.life / e.max);
        if (e.life > e.max || e.y < -20) { embers[i] = newEmber(false); return; }
        cx.beginPath();
        cx.fillStyle = 'rgba(' + e.hue + ',' + (0.85 * lk) + ')';
        cx.arc(e.x, e.y, e.r, 0, Math.PI * 2); cx.fill();
      });
      cx.globalCompositeOperation = 'source-over';

      // 7) 边缘气焰火舌（向内舔，战斗时更猛）
      if (flames.length) {
        cx.save();
        cx.globalCompositeOperation = 'lighter';
        flames.forEach(function (f) {
          f.ph += 0.05 * k * f.speed;
          var flick = 0.7 + 0.3 * Math.sin(f.ph) + 0.14 * Math.sin(f.ph * 3.1);
          var L = f.len * flick * (0.85 + 0.35 * p);
          var a = 0.20 * flick * (0.8 + 0.4 * p);
          var tx = f.x + Math.cos(f.dir) * L;
          var ty = f.y + Math.sin(f.dir) * L;
          var lg = cx.createLinearGradient(f.x, f.y, tx, ty);
          lg.addColorStop(0, 'rgba(' + f.hue + ',' + a + ')');
          lg.addColorStop(0.45, 'rgba(' + f.hue + ',' + (a * 0.5) + ')');
          lg.addColorStop(1, 'rgba(' + f.hue + ',0)');
          cx.strokeStyle = lg;
          cx.lineWidth = f.w * flick;
          cx.lineCap = 'round';
          cx.beginPath();
          cx.moveTo(f.x, f.y);
          cx.quadraticCurveTo(
            f.x + Math.cos(f.dir) * L * 0.5 - Math.sin(f.dir) * f.w * 0.5,
            f.y + Math.sin(f.dir) * L * 0.5 + Math.cos(f.dir) * f.w * 0.5,
            tx, ty
          );
          cx.stroke();
        });
        cx.restore();
      }

      // 8) 蓄气冲击波（由 FX.powerUp 触发）
      if (shock) {
        shock.r += shock.spd * k;
        var sa = Math.max(0, 1 - shock.r / shock.max);
        cx.save();
        cx.globalCompositeOperation = 'lighter';
        cx.strokeStyle = 'rgba(' + shock.c + ',' + (0.8 * sa) + ')';
        cx.lineWidth = 6 * sa + 1.5;
        cx.shadowColor = 'rgba(' + shock.c + ',0.9)';
        cx.shadowBlur = 30;
        cx.beginPath();
        cx.ellipse(shock.x, shock.y, shock.r, shock.r * 0.34, 0, 0, Math.PI * 2);
        cx.stroke();
        cx.restore();
        if (shock.r > shock.max) shock = null;
      }

      // 9) 闪电
      boltTimer -= dt;
      if (bolts.length < 2 && boltTimer <= 0 && !reduced) {
        bolts.push(makeBolt());
        boltTimer = (2600 + Math.random() * 5200) / p;
      }
      bolts = bolts.filter(function (b) {
        b.life += k;
        var ba = Math.max(0, 1 - b.life / b.max);
        if (ba <= 0) return false;
        cx.save();
        cx.strokeStyle = 'rgba(200,240,255,' + (0.9 * ba) + ')';
        cx.lineWidth = 2.2; cx.shadowColor = 'rgba(150,220,255,0.9)'; cx.shadowBlur = 24;
        cx.beginPath();
        b.segs.forEach(function (s, i) { i ? cx.lineTo(s.x, s.y) : cx.moveTo(s.x, s.y); });
        cx.stroke();
        cx.restore();
        return true;
      });

      raf = requestAnimationFrame(frame);
    }

    /** 蓄气爆发：地面冲击环（由升级 / 通关 / 神龙触发） */
    function charge() {
      shock = {
        x: W / 2, y: H * 0.82,
        r: 20, max: Math.max(W, H) * 0.72,
        spd: 11 + Math.random() * 4,
        c: '168,85,247'
      };
    }

    function start() {
      if (running) return;
      cv = document.getElementById('bgCanvas');
      if (!cv) return;
      cx = cv.getContext('2d');
      resize();
      running = true; t0 = 0;
      raf = requestAnimationFrame(frame);
      window.addEventListener('resize', function () { resize(); });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }
        else if (!running) { running = true; t0 = 0; raf = requestAnimationFrame(frame); }
      });
    }

    return {
      start: start, resize: resize, setScene: setScene, charge: charge,
      setImageMode: setImageMode, imagesOn: imagesOn, videoReady: videoReadyNow,
      scene: function () { return sceneKey; }
    };
  })();

  /* ============================================================
   * 二、屏幕级反馈特效
   * ============================================================ */
  var FX = (function () {
    var flashEl, comboLevel = 0;

    function ensureEl() {
      if (!flashEl) flashEl = document.getElementById('fxFlash');
      return flashEl;
    }

    /** 全屏闪光：color 为 rgb 字符串，strength 0-1 */
    function flash(color, strength) {
      var el = ensureEl();
      if (!el || reduced) return;
      el.style.background = 'radial-gradient(circle at 50% 45%, rgba(' + color + ',' + (0.55 * (strength || 1)) + '), rgba(' + color + ',0) 70%)';
      el.classList.remove('go');
      void el.offsetWidth;
      el.classList.add('go');
      // 动画结束后移除标记，避免 class 长期驻留（便于排查/检测）
      clearTimeout(el._goTimer);
      el._goTimer = setTimeout(function () { el.classList.remove('go'); }, 620);
    }

    /** 震屏 */
    function shake(level) {
      if (reduced) return;
      var body = document.body;
      body.classList.remove('shake-1', 'shake-2', 'shake-3');
      void body.offsetWidth;
      body.classList.add('shake-' + (level || 1));
      setTimeout(function () { body.classList.remove('shake-' + (level || 1)); }, 520);
    }

    /** 在指定坐标爆气（答对时用） */
    function burst(x, y, color) {
      if (reduced) return;
      var d = document.createElement('div');
      d.className = 'fx-burst';
      d.style.left = x + 'px'; d.style.top = y + 'px';
      d.style.setProperty('--c', color || '168,85,247');
      document.body.appendChild(d);
      setTimeout(function () { d.remove(); }, 720);
    }

    /** 连击气焰：连击数越高，屏幕边缘越"燃" */
    function combo(n) {
      // 六档分级：2 / 3 / 5 / 10 / 15 / 20，屏幕边缘的火焰逐档变色加剧
      var lv = n >= 20 ? 6 : n >= 15 ? 5 : n >= 10 ? 4 : n >= 5 ? 3 : n >= 3 ? 2 : n >= 2 ? 1 : 0;
      if (lv === comboLevel) return;
      comboLevel = lv;
      for (var i = 1; i <= 6; i++) document.body.classList.remove('combo-' + i);
      if (lv) document.body.classList.add('combo-' + lv);
    }

    function resetCombo() { combo(0); }

    /** 升级 / 通关：金色气浪 + 地面冲击环 */
    function powerUp(color) {
      if (reduced) return;
      flash(color || '168,85,247', 1);
      shake(2);
      BG.charge();
      var ring = document.createElement('div');
      ring.className = 'fx-ring';
      ring.style.setProperty('--c', color || '168,85,247');
      document.body.appendChild(ring);
      setTimeout(function () { ring.remove(); }, 1100);
    }

    /** 神龙降临：多重金光环 + 长时间闪光 + 连续冲击 */
    function dragon() {
      if (!reduced) {
        flash('196,181,253', 1);
        shake(3);
        BG.charge();
        for (var i = 0; i < 4; i++) {
          (function (k) {
            setTimeout(function () {
              var ring = document.createElement('div');
              ring.className = 'fx-ring';
              ring.style.setProperty('--c', k % 2 ? '139,92,246' : '216,180,254');
              document.body.appendChild(ring);
              setTimeout(function () { ring.remove(); }, 1400);
              if (k === 1 || k === 3) BG.charge();
            }, k * 260);
          })(i);
        }
      }
      NS.Audio && NS.Audio.sfx('dragon');
    }

    /** 浮动文字（会心一击 / 被打中 / 连击 × n） */
    function label(text, cls) {
      var d = document.createElement('div');
      d.className = 'fx-label ' + (cls || '');
      d.textContent = text;
      document.body.appendChild(d);
      setTimeout(function () { d.remove(); }, 1100);
    }

    return {
      flash: flash, shake: shake, burst: burst, combo: combo, resetCombo: resetCombo,
      powerUp: powerUp, dragon: dragon, label: label
    };
  })();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { BG.start(); });
  } else {
    BG.start();
  }

  NS.BG = BG;
  NS.FX = FX;
})(window.HNSF829);
