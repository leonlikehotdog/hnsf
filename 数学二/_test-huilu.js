/* 回炉分段逻辑的纯逻辑测试：用 localStorage shim 在 node 里跑，不碰真实存档
 * 跑法：node _test-huilu.js   （期望：全部通过） */
'use strict';
var mem = {};
global.localStorage = {
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
  setItem: function (k, v) { mem[k] = String(v); },
  removeItem: function (k) { delete mem[k]; }
};
global.window = {};
require('./js/data-nodes.js');
require('./js/achievements.js');
require('./js/store.js');
var Store = global.window.HNSF829.Store;

var pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label + (extra != null ? '  → ' + JSON.stringify(extra) : '')); }
}
function day(ms) { return new Date(ms).toISOString().replace('T', ' ').slice(0, 16); }

Store.reset();
console.log('\n【1】答错 → 建立错题，记下「当时选了什么」');
Store.recordAnswer('gs-lim-fn', 'lf-1', false, 1);
var w = Store.raw().wrong['lf-1'];
ok(!!w, '错题已入库');
ok(w.picked === 1, 'picked 记为 1（诊断屏要用）', w.picked);
ok(w.resolved === false, '未销账');
var s1 = Store.hlState('lf-1');
ok(s1.stage === 0, 'stage = 0');
ok(s1.ready === true, '立刻可回炉（第一段不用等）');
console.log('    队列: ready=' + Store.hlQueue().ready.length + ' pending=' + Store.hlQueue().pending.length);

console.log('\n【2】原题答对 → 不再自动销账（练 ≠ 验）');
Store.recordAnswer('gs-lim-fn', 'lf-1', true);
ok(Store.raw().wrong['lf-1'].resolved === false, '答对原题后仍未销账');
ok(Store.hlState('lf-1').stage === 0, 'stage 仍是 0');

console.log('\n【3】回炉第一段：做对变式 → stage 1，且要求隔天');
var r1 = Store.hlAdvance('lf-1', true, 0);
ok(r1.stage === 1, 'stage 1');
ok(r1.graduated !== true, '还没出炉');
ok(r1.due > Date.now(), 'due 排到未来');
console.log('    due = ' + day(r1.due) + '（下一个凌晨 4 点）');
ok(Store.hlState('lf-1').ready === false, '现在不可再验');
ok(Store.hlQueue().ready.length === 0 && Store.hlQueue().pending.length === 1, '队列里转到 pending');

console.log('\n【4】当天硬来 → 不给进度（真·隔天的落点）');
var r2 = Store.hlAdvance('lf-1', true, 1);
ok(r2.gated === true, '被间隔挡住');
ok(Store.hlState('lf-1').stage === 1, 'stage 没动');

console.log('\n【5】把时间推到次日 → 第二段答对 = 出炉');
Store.raw().wrong['lf-1'].due = Date.now() - 1;
var r3 = Store.hlAdvance('lf-1', true, 1);
ok(r3.graduated === true, '出炉');
ok(Store.raw().wrong['lf-1'].resolved === true, 'resolved = true');
ok(Store.wrongCount() === 0, '错题本已清空该题');
ok(Store.hlState('lf-1').usedVariants.join(',') === '0,1', '记录用过的变式，避免重复', Store.hlState('lf-1').usedVariants);

console.log('\n【6】信任度：错题未消化 → 待验证；消化后 → 已坐实');
Store.reset();
Store.raw().cleared['gs-lim-fn'] = { best: 0.95, times: 1, ts: Date.now(), perfect: false };
Store.raw().zt['gs-lim-fn'] = { answered: 5, correct: 4, cleared: true, perfect: false, times: 1, best: 0.8, ts: Date.now() };
Store.recordAnswer('gs-lim-fn', 'lf-1', false, 1);
ok(Store.trust('gs-lim-fn').state === 'claimed', '有未消化错题 → 待验证', Store.trust('gs-lim-fn').state);
Store.raw().wrong['lf-1'].stage = 1; Store.raw().wrong['lf-1'].due = Date.now() - 1;
Store.hlAdvance('lf-1', true, 0);
ok(Store.trust('gs-lim-fn').state === 'verified', '错题出炉 + 真题通 → 已坐实', Store.trust('gs-lim-fn').state);
var f = Store.scoreForecast();
ok(f.fake < 0.05, '虚分归零', f.fake);
console.log('    预计 ' + f.expected + ' / 150 · 纸面 ' + f.paper + ' · 虚分 ' + f.fake);

console.log('\n【7】连错 2 次 → 撤出自动队列（防挫败堆积）');
Store.reset();
Store.recordAnswer('gs-cont', 'ct-1', false, 2);
ok(Store.hlQueue().ready.length === 1, '先进入队列');
var f1 = Store.hlAdvance('ct-1', false);
ok(f1.stuck !== true, '第 1 次答错还不撤');
var f2 = Store.hlAdvance('ct-1', false);
ok(f2.stuck === true, '第 2 次答错 → 撤下');
ok(Store.hlQueue().ready.length === 0, '不再自动出现');
ok(Store.hlSummary().stuck === 1, '统计里能看到');
var f3 = Store.hlAdvance('ct-1', true);
ok(Store.raw().wrong['ct-1'].stuck === false, '答对后重新入队');

console.log('\n【8】旧档兼容：缺 stage/due 的错题按新错处理');
mem = {};
Store.reset();
Store.raw().wrong['old-1'] = { node: 'gs-lim-fn', ts: Date.now(), resolved: false, times: 3 };
ok(Store.hlState('old-1').stage === 0, '缺字段 → stage 0');
ok(Store.hlState('old-1').ready === true, '可直接回炉');
ok(Store.scoreForecast().expected >= 0, '预测不报错');

console.log('\n================ ' + (fail === 0 ? '全部通过' : fail + ' 项失败') + '（' + pass + ' 通过 / ' + fail + ' 失败） ================\n');
process.exit(fail === 0 ? 0 : 1);
