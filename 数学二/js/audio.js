/* ============================================================
 * 829 闯关系统 · 热血音效引擎（Web Audio 原创合成）
 * ------------------------------------------------------------
 * 全部音频由代码实时合成，不加载任何外部音频文件：
 *   · BGM：两首原创曲目，均为 16 小节「A 段 + B 段」结构，避免短循环听腻
 *       map    ：106 BPM 燃向进行曲（A 小调），循环 ≈ 36 秒
 *       battle ：122 BPM 热血战斗曲（E 小调，做题页专用）——与地图曲同属
 *                热血摇滚，但调式、和声进行、鼓组与旋律全部另写，风格
 *                相似而不会听混；循环 ≈ 31 秒
 *   · 场景切换采用「每首歌一条独立总线 + 交叉淡出」，旧曲 0.35s 内淡出后再
 *     释放，彻底避免两首曲子叠在一起
 *   · 音效：会心一击、被打中、连击、升级、通关、成就、神龙
 * 这样既零版权风险，也能离线运行。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  var ctx = null, master = null, musicBus = null, sfxBus = null;
  var analyser = null, levelBuf = null;   // 音乐总线响度探针（诊断：用来证明"切场景后真的静音了"）
  var voiceBus = null;               // 当前正在播放的歌曲总线（每首歌一条，便于交叉淡出）
  var retiredCount = 0;              // 已淡出释放的旧曲总线计数（诊断用）
  var musicInBattle = true;          // 做题时是否播放 BGM（默认 true：做题播放独立战斗曲，可在设置里切成静音）
  var scheduled = 0;                 // 已排出的音符总数（诊断用）
  var MUSIC_FADE = 0.5;              // 场景切换时音乐的淡出/淡入时长（秒）
  var DELAY_TIME = 0.3, DELAY_FB = 0.24, DELAY_WET = 0.28;
  var noiseBuf = null, shaperCurve = null;
  var musicOn = true, sfxOn = true, volume = 0.55;
  var songKey = null, timer = null, step = 0, nextTime = 0, started = false;
  var LOOKAHEAD = 0.18, TICK_MS = 25;
  var STEPS_PER_BAR = 16, BARS = 16, TOTAL = STEPS_PER_BAR * BARS;   // 16 小节 = A段8 + B段8
  var MUSIC_LEVEL = 0.5;

  /* ---------------- 基础工具 ---------------- */
  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  function makeNoise() {
    var len = Math.floor(ctx.sampleRate * 1.2);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function makeCurve(amount) {
    var n = 1024, curve = new Float32Array(n), k = amount || 8;
    for (var i = 0; i < n; i++) {
      var x = (i * 2) / n - 1;
      curve[i] = ((3 + k) * x * 20 * Math.PI / 180) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  function ensure() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 24; comp.ratio.value = 6;

    master = ctx.createGain(); master.gain.value = volume;
    musicBus = ctx.createGain(); musicBus.gain.value = MUSIC_LEVEL;
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.85;

    // 音乐总线的响度探针。经一个 0 增益的出口接到 master，
    // 既保证分析器被音频图正常驱动，又不会产生任何可听声音。
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    var probeSink = ctx.createGain(); probeSink.gain.value = 0;
    analyser.connect(probeSink); probeSink.connect(master);

    musicBus.connect(master); sfxBus.connect(master);
    musicBus.connect(analyser);
    master.connect(comp); comp.connect(ctx.destination);

    noiseBuf = makeNoise();
    shaperCurve = makeCurve(8);
    return ctx;
  }

  /** 这个场景是否应该有 BGM */
  function wantMusic(key) {
    if (!key) return false;
    if (key === 'battle') return musicInBattle;   // 做题默认播放，可在设置里静音
    return true;
  }

  /** 浏览器要求用户手势后才能出声 */
  function resume() {
    ensure();
    if (!ctx) return;
    var go = function () {
      if (musicOn && songKey && !started && wantMusic(songKey)) startSong(songKey);
    };
    if (ctx.state === 'suspended') {
      ctx.resume().then(go).catch(function () {});
    } else {
      go();
    }
  }

  /* ---------------- 歌曲总线（每首歌一套，含自己的延迟网络） ---------------- */
  /**
   * 为什么延迟网络必须跟着歌走（这是"两首音乐重合"的根因）：
   * 之前所有歌共用一条全局延迟，而且它的湿声是直接接到 master 的。
   * 于是切歌时，虽然旧歌的总线被淡出了，但**卡在延迟线里的旧歌回声**
   * 仍会从 master 继续响了约 2 秒，正好灌进新歌里。
   * 现在每首歌自带延迟网络、湿声汇入本歌自己的总线，
   * 淡出时连回声尾巴一起消失，不可能再有残留。
   */
  function newBus() {
    var g = ctx.createGain();
    g.gain.value = 0.0001;
    g.connect(musicBus);

    var send = ctx.createGain(); send.gain.value = 1;
    var d = ctx.createDelay(0.6); d.delayTime.value = DELAY_TIME;
    var fb = ctx.createGain(); fb.gain.value = DELAY_FB;
    var wet = ctx.createGain(); wet.gain.value = DELAY_WET;
    send.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(g);

    g.__send = send;
    g.__chain = [send, d, fb, wet];
    return g;
  }

  function fadeOutBus(bus, time) {
    if (!bus) return;
    var t = ctx.currentTime;
    try {
      bus.gain.cancelScheduledValues(t);
      bus.gain.setValueAtTime(Math.max(0.0001, bus.gain.value), t);
      bus.gain.linearRampToValueAtTime(0.0001, t + time);
    } catch (e) {}
    // 等最长的 pad 尾音（约 2.5s）彻底走完再断开，避免爆音；
    // retiredCount 记的是"真正物理断开"的数量，可用它确认没有总线泄漏
    setTimeout(function () {
      try {
        if (bus.__chain) bus.__chain.forEach(function (n) { try { n.disconnect(); } catch (e) {} });
        bus.disconnect();
        retiredCount++;
      } catch (e) {}
    }, time * 1000 + 2600);
  }

  /** 所有音色的输出目标：当前歌曲总线 */
  function out() { return voiceBus || musicBus; }

  /* ---------------- 音色 ---------------- */
  function env(node, t, a, d, peak) {
    var g = node.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(0.0001, t);
    g.linearRampToValueAtTime(peak, t + a);
    g.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  function kick(t, gain) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.14);
    env(g, t, 0.004, 0.26, (gain || 1) * 1.05);
    o.connect(g); g.connect(out());
    o.start(t); o.stop(t + 0.34);
  }

  function snare(t, gain) {
    var n = ctx.createBufferSource(); n.buffer = noiseBuf;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 0.9;
    var g = ctx.createGain();
    env(g, t, 0.002, 0.16, (gain || 1) * 0.6);
    n.connect(bp); bp.connect(g); g.connect(out());
    n.start(t); n.stop(t + 0.22);

    var o = ctx.createOscillator(), og = ctx.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(210, t);
    env(og, t, 0.002, 0.1, (gain || 1) * 0.35);
    o.connect(og); og.connect(out());
    o.start(t); o.stop(t + 0.16);
  }

  function hat(t, open, gain) {
    var n = ctx.createBufferSource(); n.buffer = noiseBuf;
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7200;
    var g = ctx.createGain();
    env(g, t, 0.001, open ? 0.16 : 0.045, (gain || 1) * 0.24);
    n.connect(hp); hp.connect(g); g.connect(out());
    n.start(t); n.stop(t + (open ? 0.24 : 0.09));
  }

  function bass(t, freq, dur, peak) {
    var o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(freq, t);
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(420, t);
    lp.frequency.exponentialRampToValueAtTime(180, t + dur);
    env(g, t, 0.006, dur, peak || 0.5);
    o.connect(lp); lp.connect(g); g.connect(out());
    o.start(t); o.stop(t + dur + 0.08);
  }

  function powerChord(t, freq, dur, peak) {
    var sh = ctx.createWaveShaper(); sh.curve = shaperCurve; sh.oversample = '2x';
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    var g = ctx.createGain();
    env(g, t, 0.01, dur, peak || 0.16);
    [0, -12, 7].forEach(function (iv, i) {
      var o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq * Math.pow(2, iv / 12);
      o.detune.value = (i - 1) * 9;
      o.connect(sh);
      o.start(t); o.stop(t + dur + 0.1);
    });
    sh.connect(lp); lp.connect(g); g.connect(out());
  }

  function lead(t, freq, dur, peak) {
    var g = ctx.createGain();
    env(g, t, 0.012, dur, peak || 0.19);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3400;
    [0, 4].forEach(function (dt) {
      var o = ctx.createOscillator();
      o.type = 'square'; o.frequency.value = freq; o.detune.value = dt;
      o.connect(lp); o.start(t); o.stop(t + dur + 0.12);
    });
    lp.connect(g); g.connect(out());
    // 主旋律额外送一份进本歌自己的延迟（空间感），随本歌一起淡出；
    // 回声量收到 0.45，避免连绵旋律的回声叠成一层"雾"
    if (voiceBus && voiceBus.__send) {
      var sg = ctx.createGain(); sg.gain.value = 0.45;
      g.connect(sg); sg.connect(voiceBus.__send);
    }
  }

  function pad(t, freqs, dur, peak) {
    var g = ctx.createGain();
    env(g, t, dur * 0.35, dur * 0.7, peak || 0.07);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500;
    freqs.forEach(function (f, i) {
      [0, 7].forEach(function (dt) {
        var o = ctx.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = dt + i * 4;
        o.connect(lp); o.start(t); o.stop(t + dur + 0.3);
      });
    });
    lp.connect(g); g.connect(out());
  }

  /** 琶音点缀（只用在战斗曲 B 段，增加推进感） */
  function arp(t, freq, peak) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    env(g, t, 0.003, 0.09, peak || 0.05);
    o.connect(g); g.connect(out());
    o.start(t); o.stop(t + 0.14);
  }

  /* ---------------- 曲目数据（原创） ---------------- */
  /* 8 小节和声进行：Am → F → C → G → Am → F → Dm → E
     E 大调属和弦带来强解决感，让 16 小节的大循环回到 Am 时更有"回主歌"的推力 */
  var PROG = [
    { root: 45, notes: [57, 60, 64] },   // Am
    { root: 41, notes: [53, 57, 60] },   // F
    { root: 48, notes: [55, 60, 64] },   // C
    { root: 43, notes: [55, 59, 62] },   // G
    { root: 45, notes: [57, 60, 64] },   // Am
    { root: 41, notes: [53, 57, 60] },   // F
    { root: 50, notes: [57, 62, 65] },   // Dm
    { root: 40, notes: [56, 59, 64] }    // E
  ];

  /* 做题曲专用进行：E 小调 Em→C→G→D→Em→C→Am→B。
     与地图曲的 Am 系完全不同调式，末小节用 B 大三和弦（和声小调属和声）
     收束，回到 Em 时推进感更冲，是「相似风格、不同曲子」的核心区分点 */
  var PROG_EM = [
    { root: 40, notes: [52, 55, 59] },   // Em
    { root: 36, notes: [48, 52, 55] },   // C
    { root: 43, notes: [50, 55, 59] },   // G
    { root: 38, notes: [50, 54, 57] },   // D
    { root: 40, notes: [52, 55, 59] },   // Em
    { root: 36, notes: [48, 52, 55] },   // C
    { root: 45, notes: [52, 57, 60] },   // Am
    { root: 47, notes: [51, 54, 59] }    // B
  ];

  var SONGS = {
    /* ============ 地图页：106 BPM 燃向进行曲 ============ */
    map: {
      bpm: 106,
      pad: 0.055, arp: 0,
      drumsA: { kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.' },
      drumsB: { kick: 'x.....x.x.......', snare: '....x.......x..x', hat: '..x.x.x...x.x.x.' },
      fill:   'x.x.xxx.x.xxxxxx',
      bassA: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      bassB: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
      leadA: [
        [{ s: 0, n: 69, d: 0.5 }, { s: 6, n: 72, d: 0.35 }, { s: 10, n: 71, d: 0.35 }, { s: 16, n: 69, d: 0.5 }, { s: 22, n: 67, d: 0.5 }, { s: 28, n: 65, d: 0.5 }],
        [{ s: 0, n: 72, d: 0.5 }, { s: 6, n: 74, d: 0.35 }, { s: 10, n: 76, d: 0.4 }, { s: 16, n: 74, d: 0.5 }, { s: 22, n: 72, d: 0.45 }, { s: 28, n: 69, d: 0.6 }],
        [{ s: 0, n: 76, d: 0.5 }, { s: 5, n: 74, d: 0.3 }, { s: 8, n: 72, d: 0.4 }, { s: 16, n: 69, d: 0.5 }, { s: 24, n: 72, d: 0.35 }, { s: 27, n: 74, d: 0.5 }],
        [{ s: 0, n: 74, d: 0.5 }, { s: 6, n: 72, d: 0.35 }, { s: 10, n: 71, d: 0.35 }, { s: 16, n: 68, d: 0.5 }, { s: 22, n: 71, d: 0.45 }, { s: 28, n: 69, d: 0.7 }]
      ],
      leadB: [
        [{ s: 0, n: 81, d: 0.4 }, { s: 4, n: 79, d: 0.3 }, { s: 8, n: 76, d: 0.4 }, { s: 12, n: 74, d: 0.3 }, { s: 16, n: 76, d: 0.45 }, { s: 24, n: 72, d: 0.5 }],
        [{ s: 0, n: 79, d: 0.4 }, { s: 4, n: 76, d: 0.3 }, { s: 8, n: 74, d: 0.4 }, { s: 12, n: 72, d: 0.3 }, { s: 16, n: 69, d: 0.45 }, { s: 22, n: 72, d: 0.3 }, { s: 26, n: 74, d: 0.5 }],
        [{ s: 0, n: 84, d: 0.45 }, { s: 6, n: 81, d: 0.3 }, { s: 10, n: 79, d: 0.4 }, { s: 16, n: 76, d: 0.5 }, { s: 22, n: 74, d: 0.35 }, { s: 26, n: 72, d: 0.5 }],
        [{ s: 0, n: 74, d: 0.4 }, { s: 4, n: 76, d: 0.35 }, { s: 8, n: 77, d: 0.35 }, { s: 12, n: 76, d: 0.35 }, { s: 16, n: 74, d: 0.5 }, { s: 24, n: 71, d: 0.45 }, { s: 28, n: 69, d: 0.8 }]
      ]
    },

    /* ============ 做题页：122 BPM 热血战斗曲（E 小调，独立和声进行） ============ */
    battle: {
      bpm: 122,
      prog: PROG_EM,
      pad: 0.05, arp: 0.045,
      drumsA: { kick: 'x.......x.x.....', snare: '....x.......x...', hat: '..x...x...x...x.' },
      drumsB: { kick: 'x...x...x..x....', snare: '....x.......x...', hat: '..x...x...x...x.' },
      fill:   'x.x.x.x.x.xx.x..',
      bassA: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      bassB: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
      leadA: [
        [{ s: 0, n: 64, d: 0.5 }, { s: 2, n: 67, d: 0.5 }, { s: 4, n: 71, d: 0.5 }, { s: 6, n: 67, d: 0.5 }, { s: 8, n: 64, d: 0.5 }, { s: 10, n: 67, d: 0.5 }, { s: 12, n: 69, d: 0.5 }, { s: 14, n: 67, d: 0.5 }, { s: 16, n: 67, d: 0.5 }, { s: 18, n: 72, d: 0.5 }, { s: 20, n: 76, d: 0.5 }, { s: 22, n: 72, d: 0.5 }, { s: 24, n: 71, d: 0.5 }, { s: 26, n: 69, d: 0.5 }, { s: 28, n: 67, d: 0.5 }, { s: 30, n: 64, d: 0.6 }],
        [{ s: 0, n: 74, d: 0.5 }, { s: 2, n: 71, d: 0.5 }, { s: 4, n: 67, d: 0.5 }, { s: 6, n: 71, d: 0.5 }, { s: 8, n: 74, d: 0.5 }, { s: 10, n: 76, d: 0.5 }, { s: 12, n: 74, d: 0.5 }, { s: 14, n: 71, d: 0.5 }, { s: 16, n: 74, d: 0.5 }, { s: 18, n: 78, d: 0.5 }, { s: 20, n: 81, d: 0.5 }, { s: 22, n: 78, d: 0.5 }, { s: 24, n: 74, d: 0.5 }, { s: 26, n: 76, d: 0.5 }, { s: 28, n: 74, d: 0.5 }, { s: 30, n: 71, d: 0.6 }],
        [{ s: 0, n: 76, d: 0.5 }, { s: 2, n: 74, d: 0.5 }, { s: 4, n: 71, d: 0.5 }, { s: 6, n: 74, d: 0.5 }, { s: 8, n: 76, d: 0.5 }, { s: 10, n: 79, d: 0.5 }, { s: 12, n: 76, d: 0.5 }, { s: 14, n: 74, d: 0.5 }, { s: 16, n: 72, d: 0.5 }, { s: 18, n: 76, d: 0.5 }, { s: 20, n: 79, d: 0.5 }, { s: 22, n: 76, d: 0.5 }, { s: 24, n: 74, d: 0.5 }, { s: 26, n: 71, d: 0.5 }, { s: 28, n: 69, d: 0.5 }, { s: 30, n: 67, d: 0.6 }],
        [{ s: 0, n: 69, d: 0.5 }, { s: 2, n: 72, d: 0.5 }, { s: 4, n: 76, d: 0.5 }, { s: 6, n: 72, d: 0.5 }, { s: 8, n: 69, d: 0.5 }, { s: 10, n: 72, d: 0.5 }, { s: 12, n: 74, d: 0.5 }, { s: 14, n: 76, d: 0.5 }, { s: 16, n: 71, d: 0.5 }, { s: 18, n: 75, d: 0.5 }, { s: 20, n: 78, d: 0.5 }, { s: 22, n: 75, d: 0.5 }, { s: 24, n: 71, d: 0.5 }, { s: 26, n: 75, d: 0.5 }, { s: 28, n: 78, d: 0.5 }, { s: 30, n: 76, d: 0.6 }]
      ],
      leadB: [
        [{ s: 0, n: 88, d: 0.5 }, { s: 2, n: 86, d: 0.5 }, { s: 4, n: 83, d: 0.5 }, { s: 6, n: 86, d: 0.5 }, { s: 8, n: 79, d: 0.5 }, { s: 10, n: 83, d: 0.5 }, { s: 12, n: 86, d: 0.5 }, { s: 14, n: 83, d: 0.5 }, { s: 16, n: 84, d: 0.5 }, { s: 18, n: 79, d: 0.5 }, { s: 20, n: 76, d: 0.5 }, { s: 22, n: 79, d: 0.5 }, { s: 24, n: 84, d: 0.5 }, { s: 26, n: 83, d: 0.5 }, { s: 28, n: 79, d: 0.5 }, { s: 30, n: 76, d: 0.6 }],
        [{ s: 0, n: 83, d: 0.5 }, { s: 2, n: 79, d: 0.5 }, { s: 4, n: 74, d: 0.5 }, { s: 6, n: 79, d: 0.5 }, { s: 8, n: 83, d: 0.5 }, { s: 10, n: 86, d: 0.5 }, { s: 12, n: 83, d: 0.5 }, { s: 14, n: 79, d: 0.5 }, { s: 16, n: 86, d: 0.5 }, { s: 18, n: 81, d: 0.5 }, { s: 20, n: 78, d: 0.5 }, { s: 22, n: 81, d: 0.5 }, { s: 24, n: 86, d: 0.5 }, { s: 26, n: 84, d: 0.5 }, { s: 28, n: 81, d: 0.5 }, { s: 30, n: 78, d: 0.6 }],
        [{ s: 0, n: 88, d: 0.5 }, { s: 2, n: 83, d: 0.5 }, { s: 4, n: 86, d: 0.5 }, { s: 6, n: 83, d: 0.5 }, { s: 8, n: 79, d: 0.5 }, { s: 10, n: 83, d: 0.5 }, { s: 12, n: 86, d: 0.5 }, { s: 14, n: 88, d: 0.5 }, { s: 16, n: 84, d: 0.5 }, { s: 18, n: 88, d: 0.5 }, { s: 20, n: 84, d: 0.5 }, { s: 22, n: 79, d: 0.5 }, { s: 24, n: 76, d: 0.5 }, { s: 26, n: 79, d: 0.5 }, { s: 28, n: 83, d: 0.5 }, { s: 30, n: 79, d: 0.6 }],
        [{ s: 0, n: 81, d: 0.5 }, { s: 2, n: 84, d: 0.5 }, { s: 4, n: 88, d: 0.5 }, { s: 6, n: 84, d: 0.5 }, { s: 8, n: 81, d: 0.5 }, { s: 10, n: 84, d: 0.5 }, { s: 12, n: 86, d: 0.5 }, { s: 14, n: 88, d: 0.5 }, { s: 16, n: 87, d: 0.5 }, { s: 18, n: 83, d: 0.5 }, { s: 20, n: 78, d: 0.5 }, { s: 22, n: 83, d: 0.5 }, { s: 24, n: 87, d: 0.5 }, { s: 26, n: 83, d: 0.5 }, { s: 28, n: 78, d: 0.9 }, { s: 30, n: 76, d: 1.2 }]
      ]
    }
  };

  /* ---------------- 调度器 ---------------- */
  function stepDur(song) { return (60 / song.bpm) / 4; }

  function scheduleStep(song, s, t) {
    scheduled++;                                    // 诊断：已排出的音符数（用于确认停播后不再产生音符）
    var bar = Math.floor(s / STEPS_PER_BAR);        // 0..15
    var bi = bar % 8;                               // 和声进行索引 0..7
    var section = Math.floor(bar / 8) % 2;          // 0=A段 1=B段
    var i = s % STEPS_PER_BAR;
    var sd = stepDur(song);
    var drums = section ? song.drumsB : song.drumsA;

    // 鼓：每个 8 小节乐句的最后一小节打 fill
    if (bar % 8 === 7 && i >= 8) {
      if (song.fill[i] === 'x') { if (i % 2) snare(t, 0.85); else kick(t, 1); }
    } else {
      if (drums.kick[i] === 'x') kick(t, 1);
      if (drums.snare[i] === 'x') snare(t, 0.9);
      if (drums.hat[i] === 'x') hat(t, i % 8 === 6, 0.9);
    }

    // 贝斯：跟随每小节的根音，第 15 步偶尔上跳八度
    var prog = song.prog || PROG;                   // 每首歌可用自己的和声进行（做题曲用 PROG_EM）
    var bp = section ? song.bassB : song.bassA;
    if (bp[i]) bass(t, midi(prog[bi].root + (i === 14 ? 12 : 0)), sd * 1.7, 0.42);

    // 铺底和弦 + 失真强力和弦（每小节单击一次：两层失真叠在一起会把中频糊掉）
    if (i === 0) {
      pad(t, prog[bi].notes.map(midi), sd * STEPS_PER_BAR * 0.98, song.pad);
      powerChord(t, midi(prog[bi].root + 12), sd * 1.6, songKey === 'battle' ? 0.11 : 0.07);
    }

    // 战斗曲 B 段加琶音铺底（隔步触发：每步都弹会碎得听不清主旋律）
    if (song.arp && section === 1 && i % 2 === 0) {
      arp(t, midi(prog[bi].notes[i % 3] + 12), song.arp);
    }

    // 主旋律：每 32 步（2 小节）一张表，一个 8 小节乐句轮换 4 张表
    var tables = section ? song.leadB : song.leadA;
    var tbl = tables[Math.floor((s % 128) / 32)];
    var pos = s % 32;
    for (var k = 0; k < tbl.length; k++) {
      var n = tbl[k];
      if (n.s === pos) lead(t, midi(n.n), sd * n.d * 4 * 0.72, n.n >= 84 ? 0.12 : 0.19);
    }
  }

  function tick() {
    if (!ctx || !songKey || !started) return;     // started=false 时不再排新音符，避免淡出后仍有残留
    var song = SONGS[songKey];
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      scheduleStep(song, step, nextTime);
      nextTime += stepDur(song);
      step = (step + 1) % TOTAL;
    }
  }

  function startSong(key) {
    if (!ensure()) return;
    if (!SONGS[key]) return;
    // 先记下曲目：即使当前 AudioContext 还没被用户手势解锁，
    // resume() 之后也能自动续上，不会出现"首次进入没音乐"
    songKey = key;
    if (ctx.state === 'suspended') return;

    // 关键：先把上一首歌整条总线淡出，再开新总线，避免两首曲子叠在一起
    if (voiceBus) { fadeOutBus(voiceBus, 0.35); voiceBus = null; }
    voiceBus = newBus();
    var t0 = ctx.currentTime;
    voiceBus.gain.cancelScheduledValues(t0);
    voiceBus.gain.setValueAtTime(0.0001, t0);
    voiceBus.gain.linearRampToValueAtTime(1, t0 + 0.55);

    started = true; step = 0;
    nextTime = ctx.currentTime + 0.06;

    if (musicOn) { if (!timer) timer = setInterval(tick, TICK_MS); }
    else if (timer) { clearInterval(timer); timer = null; }
  }

  function stopSong(time) {
    started = false;
    if (voiceBus) { fadeOutBus(voiceBus, time || 0.35); voiceBus = null; }
    if (timer) { clearInterval(timer); timer = null; }
  }

  /** 切换 BGM 场景：'map' | 'battle' | null（全静音） */
  function setScene(key) {
    if (!ensure()) { songKey = key; return; }     // 环境不支持 Web Audio 时只记录场景，不播
    if (key === songKey && started) return;
    if (!key) { stopSong(MUSIC_FADE); songKey = null; return; }
    // 做题时不放 BGM（默认行为）：进关卡直接把地图曲淡出并停掉调度，
    // 这样从根上不存在"两首曲子前后叠在一起"的可能，只留打击音效
    if (!wantMusic(key)) {
      stopSong(MUSIC_FADE);
      songKey = key;
      return;
    }
    startSong(key);
  }

  /* ---------------- 音效 ---------------- */
  function sfx(name, opt) {
    if (!sfxOn || !ensure() || ctx.state === 'suspended') return;
    var t = ctx.currentTime + 0.01, i;
    switch (name) {
      case 'click':     // 选答：拔刀出鞘——金属上扫 + 反向小扫 + 锐利噪声 + 低频闷击
        sweep(t, 430, 1800, 0.1, 'sawtooth', 0.10);
        sweep(t + 0.015, 1600, 520, 0.09, 'square', 0.06);
        noiseHit(t, 0.07, 3000, 0.22);
        tone(t, midi(43), 0.11, 'sine', 0.18, sfxBus);
        break;
      case 'open':
        [69, 76].forEach(function (n, k) { tone(t + k * 0.06, midi(n), 0.16, 'triangle', 0.1, sfxBus); });
        break;
      case 'correct':   // 会心一击：上行双音 + 气爆
        tone(t, midi(76), 0.12, 'square', 0.14, sfxBus);
        tone(t + 0.07, midi(83), 0.22, 'square', 0.13, sfxBus);
        tone(t + 0.07, midi(88), 0.24, 'triangle', 0.07, sfxBus);
        noiseHit(t, 0.18, 2600, 0.16);
        break;
      case 'wrong':     // 被打中：下行 + 闷响
        tone(t, midi(57), 0.18, 'sawtooth', 0.12, sfxBus);
        tone(t + 0.09, midi(48), 0.3, 'sawtooth', 0.12, sfxBus);
        noiseHit(t, 0.22, 400, 0.2);
        break;
      case 'combo':     // 连击：金属高音，随连击数升高
        var c = Math.min(12, opt || 3);
        tone(t, midi(81 + c), 0.1, 'square', 0.12, sfxBus);
        tone(t + 0.05, midi(85 + c), 0.14, 'triangle', 0.1, sfxBus);
        break;
      case 'levelup':   // 升级：上行琶音 + 长和弦
        [72, 76, 79, 84, 88].forEach(function (n, k) {
          tone(t + k * 0.075, midi(n), 0.3, 'square', 0.13, sfxBus);
        });
        [72, 76, 79].forEach(function (n) { tone(t + 0.45, midi(n), 0.9, 'triangle', 0.09, sfxBus); });
        noiseHit(t, 0.5, 3000, 0.1);
        break;
      case 'clear':     // 通关小凯歌
        [76, 79, 81, 84].forEach(function (n, k) {
          tone(t + k * 0.12, midi(n), 0.28, 'square', 0.13, sfxBus);
        });
        [69, 72, 76, 81].forEach(function (n) { tone(t + 0.52, midi(n), 1.3, 'triangle', 0.08, sfxBus); });
        break;
      case 'ach':
        [88, 92, 95].forEach(function (n, k) { tone(t + k * 0.09, midi(n), 0.5, 'triangle', 0.11, sfxBus); });
        break;
      case 'dragon':    // 神龙降临：低频轰鸣 + 长啸
        for (i = 0; i < 5; i++) {
          tone(t + i * 0.12, midi(45 + i * 5), 1.1, 'sawtooth', 0.1, sfxBus);
        }
        noiseHit(t, 1.2, 900, 0.16);
        [76, 81, 84, 88, 93].forEach(function (n, k) {
          tone(t + 0.7 + k * 0.1, midi(n), 0.7, 'square', 0.11, sfxBus);
        });
        break;
      case 'collect':   // 龙珠收集
        [79, 84].forEach(function (n, k) { tone(t + k * 0.07, midi(n), 0.4, 'triangle', 0.12, sfxBus); });
        break;
    }
  }

  function tone(t, freq, dur, type, peak, dest) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    env(g, t, 0.008, dur, peak);
    o.connect(g); g.connect(dest || sfxBus);
    o.start(t); o.stop(t + dur + 0.1);
  }

  /** 扫频音：频率从 f1 指数滑到 f2，用于「拔刀 / 破空」的唰感 */
  function sweep(t, f1, f2, dur, type, peak, dest) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sawtooth';
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    env(g, t, 0.005, dur, peak);
    o.connect(g); g.connect(dest || sfxBus);
    o.start(t); o.stop(t + dur + 0.06);
  }

  function noiseHit(t, decay, freq, peak) {
    var n = ctx.createBufferSource(); n.buffer = noiseBuf;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 0.7;
    var g = ctx.createGain();
    env(g, t, 0.002, decay, peak);
    n.connect(bp); bp.connect(g); g.connect(sfxBus);
    n.start(t); n.stop(t + decay + 0.1);
  }

  /* ---------------- 开关 ---------------- */
  function isMusicOn() { return musicOn; }
  function isSfxOn() { return sfxOn; }

  function setMusic(on) {
    musicOn = !!on;
    if (!ensure()) return;
    if (musicOn) {
      // 当前场景本来就该有音乐时才续播（做题且开关为关时不该突然响起）
      if (songKey && wantMusic(songKey)) {
        // 手机首次进页面时 ctx 是 suspended，而 startSong 遇到 suspended 会直接返回
        // （表现就是「点了 🔊 没反应」）。点按钮本身是一次真实手势，正好借它解锁。
        if (ctx.state === 'suspended') {
          // 同一个手势里 document 的解锁监听可能已经把曲子起播了，
          // 这里再判一次 started，避免「解锁 + 按钮」两条路各起一次造成重播
          ctx.resume().then(function () { if (!started) startSong(songKey); }).catch(function () {});
        } else {
          startSong(songKey);
        }
      }
    } else {
      stopSong(0.3);                              // 保留 songKey，方便再开时续上
    }
    savePref();
  }

  /** 做题（关卡内）是否播放 BGM。默认开：做题播放独立的 E 小调战斗曲，可在设置里静音 */
  function setMusicInBattle(on) {
    musicInBattle = !!on;
    if (!ensure()) { savePref(); return; }
    if (songKey === 'battle') {
      if (musicInBattle && musicOn) startSong('battle');
      else stopSong(MUSIC_FADE);
    }
    savePref();
  }

  function isMusicInBattle() { return musicInBattle; }

  /** 当前音乐总线的实际响度（RMS 0~1）。诊断用：验证切场景后是否真的静音 */
  function musicLevel() {
    if (!ctx || !analyser) return 0;
    var n = analyser.fftSize;
    if (!levelBuf || levelBuf.length !== n) levelBuf = new Float32Array(n);
    analyser.getFloatTimeDomainData(levelBuf);
    var sum = 0;
    for (var i = 0; i < n; i++) sum += levelBuf[i] * levelBuf[i];
    return Math.sqrt(sum / n);
  }

  function setSfx(on) {
    sfxOn = !!on;
    if (ctx) sfxBus.gain.value = sfxOn ? 0.85 : 0;
    savePref();
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (master) master.gain.value = volume;
    savePref();
  }

  function getVolume() { return volume; }

  /* 偏好持久化（与游戏存档分离，避免重置进度时丢设置）。
     v2：做题 BGM 默认改为播放。v1 里 musicInBattle:false 只是旧版默认值
     （当时做题从不放 BGM），不代表用户主动选择，故迁移时只带通用偏好，
     musicInBattle 用 v2 新默认，用户之后仍可随时在设置里改 */
  var PREF_KEY = 'hnsf829_audio_v2';
  function savePref() {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({
        music: musicOn, sfx: sfxOn, volume: volume, musicInBattle: musicInBattle
      }));
    } catch (e) {}
  }
  function loadPref() {
    try {
      var raw = localStorage.getItem(PREF_KEY);
      if (!raw) {
        var old = JSON.parse(localStorage.getItem('hnsf829_audio_v1') || '{}');
        if (typeof old.music === 'boolean') musicOn = old.music;
        if (typeof old.sfx === 'boolean') sfxOn = old.sfx;
        if (typeof old.volume === 'number') volume = old.volume;
        return;
      }
      var p = JSON.parse(raw);
      if (typeof p.music === 'boolean') musicOn = p.music;
      if (typeof p.sfx === 'boolean') sfxOn = p.sfx;
      if (typeof p.volume === 'number') volume = p.volume;
      if (typeof p.musicInBattle === 'boolean') musicInBattle = p.musicInBattle;
    } catch (e) {}
  }
  loadPref();

  /* 首次用户手势后唤醒音频。
   * 手机端（尤其 iOS Safari / 微信内置浏览器）比桌面严得多，旧实现只挂 pointerdown
   * + 只调 resume()，在这三类场景下会「点了也没声」：
   *   ① 部分 WebView 首击不派发 pointerdown → 补 touchend / click 作为兜底手势；
   *   ② 必须在手势回调里「同步播放一个音频节点」才算真正解锁，仅有 ctx.resume()
   *      在 WKWebView 里会静默失败 → 播一个 1 采样的静音 buffer 顶上去；
   *   ③ 切到后台再回来 AudioContext 会被挂起 → 用 visibilitychange 补一次 resume。
   * 以上对桌面端无害：桌面本来就能出声，只是多走一次 resume。 */
  function unlockFromGesture() {
    ensure();
    if (!ctx) return;
    try {
      var s = ctx.createBufferSource();
      s.buffer = ctx.createBuffer(1, 1, 22050);
      s.connect(ctx.destination);
      s.start(0);
    } catch (e) { /* 极老浏览器不支持 BufferSource 时忽略 */ }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    resume();
  }

  function armGesture() {
    var events = ['pointerdown', 'touchend', 'click', 'keydown'];
    var kick = function () {
      unlockFromGesture();
      // 确认真的出声后再解绑；否则保留监听，等下一次手势继续尝试
      if (ctx && ctx.state === 'running' && started) {
        events.forEach(function (ev) { document.removeEventListener(ev, kick, true); });
      }
    };
    events.forEach(function (ev) { document.addEventListener(ev, kick, true); });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && ctx && ctx.state === 'suspended') resume();
    });
  }
  armGesture();

  NS.Audio = {
    setScene: setScene,
    sfx: sfx,
    resume: resume,
    setMusic: setMusic,
    setSfx: setSfx,
    setVolume: setVolume,
    getVolume: getVolume,
    isMusicOn: isMusicOn,
    isSfxOn: isSfxOn,
    setMusicInBattle: setMusicInBattle,
    isMusicInBattle: isMusicInBattle,
    /** 音乐总线当前实际响度（RMS），用于验证切场景后真的静音了 */
    musicLevel: musicLevel,
    /** 诊断用：返回音频底层与当前曲目信息 */
    state: function () {
      return ctx ? ctx.state : 'none';
    },
    info: function () {
      var song = songKey ? SONGS[songKey] : null;
      return {
        scene: songKey,
        playing: started,
        wantMusic: wantMusic(songKey),
        musicInBattle: musicInBattle,
        activeBuses: voiceBus ? 1 : 0,
        retiredBuses: retiredCount,      // 已真正 disconnect 释放的旧曲总线数（约滞后 3 秒）
        level: Math.round(musicLevel() * 10000) / 10000,   // 音乐总线实际响度（RMS）
        scheduled: scheduled,                              // 已排出音符总数（停播后应不再增长）
        bars: BARS,
        loopSeconds: song ? Math.round(BARS * STEPS_PER_BAR * stepDur(song) * 10) / 10 : 0
      };
    }
  };
})(window.HNSF829);
