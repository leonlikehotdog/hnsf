/* 真题库静态校验：结构 / 归类 / 答案形态 / 反斜杠奇偶 / 节点覆盖
 * 用法：node 数学二/zhenti/check_zhenti.js
 * 只校验 js/data-zhenti.js；与 _check-bank.js（考点题库）互不影响。
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'js');
global.window = global;
require(path.join(DIR, 'data-nodes.js'));
require(path.join(DIR, 'data-zhenti.js'));

const Z = window.HNSF829_ZT;
const NODES = window.HNSF829_NODES.nodes;
const nodeIds = new Set(NODES.map(n => n.id));
const TYPES = ['choice', 'blank', 'calc'];

const err = [], warn = [];
const seen = new Set();
const qById = {};

if (!Z || !Array.isArray(Z.qs)) { console.log('✗ window.HNSF829_ZT 未定义'); process.exit(1); }

Z.qs.forEach(function (q) {
  const at = q.id || '(无 id)';
  if (!q.id) return err.push(at + ': 缺 id');
  if (seen.has(q.id)) return err.push(at + ': id 重复');
  seen.add(q.id);
  qById[q.id] = q;
  if (!(q.year >= 2011 && q.year <= 2026)) err.push(at + ': year 越界 -> ' + q.year);
  if (TYPES.indexOf(q.type) < 0) err.push(at + ': type 非法 -> ' + q.type);
  if ([1, 2, 3].indexOf(q.level) < 0) err.push(at + ': level 非法 -> ' + q.level);
  if (q.diff !== 'exam') warn.push(at + ': diff 应为 exam');
  if (typeof q.score !== 'number' || q.score <= 0) err.push(at + ': score 非法');
  if (!q.stem) err.push(at + ': 缺 stem');
  if (!q.source) err.push(at + ': 缺 source');
  if (!Array.isArray(q.zt) || !q.zt.length) err.push(at + ': 缺归属 zt');
  (q.zt || []).forEach(function (n) { if (!nodeIds.has(n)) err.push(at + ': zt 指向不存在考点 -> ' + n); });

  if (q.type === 'choice') {
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4) err.push(at + ': 选项数异常 -> ' + (q.options || []).length);
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= (q.options || []).length) err.push(at + ': 选择题 answer 非合法下标 -> ' + q.answer);
  } else if (q.type === 'blank') {
    if (!Array.isArray(q.answer) || !q.answer.length) err.push(at + ': 填空题 answer 应为非空数组');
  } else {
    if (!q.analysis) err.push(at + ': 解答题缺 analysis（自评要看解析）');
    if (typeof q.answer !== 'string' || !q.answer) err.push(at + ': 解答题 answer 应为提示串');
  }

  // LaTeX 反斜杠奇偶：行尾出现**奇数**个「\」才是真问题（偶数 = 矩阵换行 \\）
  if (/(^|[^\\])(?:\\\\)*\\\n/m.test(q.stem)) warn.push(at + ': stem 出现孤立行尾反斜杠');
});

// byNode 索引一致性
const byNode = Z.byNode || {};
let members = 0;
Object.keys(byNode).forEach(function (zid) {
  const n = (Z.nodes || []).filter(function (x) { return x.id === zid; })[0];
  if (!n) return err.push('byNode: 未知真题节点 -> ' + zid);
  (byNode[zid] || []).forEach(function (qid) {
    members++;
    if (!qById[qid]) err.push('byNode[' + zid + ']: 指向不存在的题 -> ' + qid);
    else if ((qById[qid].zt || []).indexOf(n.parent) < 0) err.push('byNode[' + zid + '] 与题的 zt 不一致 -> ' + qid);
  });
});
(Z.nodes || []).forEach(function (n) {
  if (!nodeIds.has(n.parent)) err.push('真题节点 ' + n.id + ' 的母考点不存在 -> ' + n.parent);
  const ids = byNode[n.id] || [];
  if (!ids.length) err.push('真题节点 ' + n.id + ' 没有题');
  else if (ids.length !== n.count) err.push(n.id + ': count(' + n.count + ') 与实际题数(' + ids.length + ') 不符');
});

// 覆盖：69 个考点每个都要有真题关
const parents = new Set((Z.nodes || []).map(function (n) { return n.parent; }));
NODES.forEach(function (n) {
  if (!parents.has(n.id)) err.push('考点缺真题关 -> ' + n.id);
});

const t = { choice: 0, blank: 0, calc: 0 };
Z.qs.forEach(function (q) { t[q.type]++; });
console.log('真题 ' + Z.qs.length + ' 道 · 真题关 ' + (Z.nodes || []).length + ' 个 · 归属关系 ' + members + ' 条');
console.log('题型：选择 ' + t.choice + ' / 填空 ' + t.blank + ' / 解答 ' + t.calc);
console.log('年份：' + Z.years[0] + '–' + Z.years[Z.years.length - 1]);
console.log('考点覆盖：' + parents.size + ' / ' + NODES.length);
console.log('节点间最多题数：' + Math.max.apply(null, (Z.nodes || []).map(function (n) { return n.count; })));
console.log('警告 ' + warn.length + ' 条，错误 ' + err.length + ' 条');
warn.slice(0, 10).forEach(function (w) { console.log('  ! ' + w); });
err.slice(0, 20).forEach(function (e) { console.log('  ✗ ' + e); });
process.exit(err.length ? 1 : 0);
