/* 全库静态校验：字段完整性 / 结构合法性 / LaTeX 反斜杠奇偶 / 节点 id 存在性 / id 唯一性
 * 用法：node 数学二/_check-bank.js
 * 自动发现 js/data-q-*.js，新增题库文件后不用改这里
 */
const fs = require('fs');
const path = require('path');

/** 当前打开的节点页（地图上彩色可点）应以这些为准，脚本会核对它们是否真有题 */
const DIR = path.join(__dirname, 'js');

global.window = global;
require(path.join(DIR, 'data-nodes.js'));
require(path.join(DIR, 'achievements.js'));

const qFiles = fs.readdirSync(DIR).filter(f => /^data-q-.*\.js$/.test(f)).sort();
qFiles.forEach(f => require(path.join(DIR, f)));

const NODES = window.HNSF829_NODES.nodes;
const nodeIds = new Set(NODES.map(n => n.id));
const Q = window.HNSF829_Q;
const TYPES = ['choice', 'blank', 'calc', 'proof', 'app'];
const DIFFS = ['basic', 'exam', 'hard'];

const err = [], warn = [];
const ids = new Map();          // id -> 首次出现的文件
const byNode = {};
const dupHits = [];

Q.forEach(function (q, i) {
  const at = q.id || ('#' + i);
  if (!q.id) { err.push(at + ': 缺 id'); return; }
  if (ids.has(q.id)) { dupHits.push(q.id); err.push(at + ': id 重复'); return; }
  ids.set(q.id, i);
  if (!nodeIds.has(q.node)) { err.push(at + ': node 不存在 -> ' + q.node); return; }
  byNode[q.node] = (byNode[q.node] || 0) + 1;
  if (TYPES.indexOf(q.type) < 0) err.push(at + ': type 非法 -> ' + q.type);
  if ([1, 2, 3].indexOf(q.level) < 0) err.push(at + ': level 非法 -> ' + q.level);
  if (!DIFFS.includes(q.diff)) warn.push(at + ': 未按新标准标注 diff');
  if (typeof q.score !== 'number') err.push(at + ': score 缺失');
  if (!q.stem) err.push(at + ': 缺 stem');
  if (!q.analysis) err.push(at + ': 缺 analysis');
  if (!q.source) err.push(at + ': 缺 source');
  if (!q.tips) warn.push(at + ': 缺 tips');

  if (q.type === 'choice') {
    if (!Array.isArray(q.options) || q.options.length < 2) err.push(at + ': options 非法');
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= (q.options || []).length) {
      err.push(at + ': answer 下标越界 -> ' + q.answer);
    }
    if (!Array.isArray(q.optionNotes) || q.optionNotes.length !== (q.options || []).length) {
      warn.push(at + ': 未按新标准写 optionNotes');
    }
  } else if (q.type === 'blank') {
    if (!Array.isArray(q.answer) || q.answer.length < 1) err.push(at + ': blank answer 应为数组');
  } else {
    if (!q.answer) err.push(at + ': 缺 answer');
    if (!Array.isArray(q.keys) || q.keys.length < 1) warn.push(at + ': 缺 keys');
  }
  if (q.variants !== undefined) {
    if (!Array.isArray(q.variants)) err.push(at + ': variants 应为数组');
    else q.variants.forEach(function (v, k) {
      if (!v || !v.stem) err.push(at + ': variants[' + k + '] 缺 stem');
    });
  }
});

// LaTeX 定界符配对（扫源码文本，不看解析值）
// 用 split 数出现次数，不用 RegExp —— 反斜杠在正则里要再转义一层，极易写错
const srcAll = qFiles.map(f => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
function count(str, needle) { return str.split(needle).length - 1; }
const pairs = [
  ['\\(', '\\)', '行内公式'],
  ['\\[', '\\]', '独立公式'],
  ['\\begin{pmatrix}', '\\end{pmatrix}', 'pmatrix'],
  ['\\begin{cases}', '\\end{cases}', 'cases'],
  ['\\begin{vmatrix}', '\\end{vmatrix}', 'vmatrix'],
  ['\\begin{matrix}', '\\end{matrix}', 'matrix'],
  ['\\begin{aligned}', '\\end{aligned}', 'aligned']
];
pairs.forEach(function (p) {
  const a = count(srcAll, p[0]);
  const b = count(srcAll, p[1]);
  if (a !== b) err.push('源码 ' + p[2] + ' 不配对: ' + a + ' / ' + b);
});

// 每个节点的题量
console.log('题库文件 ' + qFiles.length + ' 个 | 题目总数 ' + Q.length + ' | 节点 ' + NODES.length + ' 个');
console.log('其中已开放(wip=false) ' + NODES.filter(n => !n.wip).length + ' 个，建设中 ' + NODES.filter(n => n.wip).length + ' 个');

const withQ = NODES.filter(n => byNode[n.id]);
const withoutQ = NODES.filter(n => !byNode[n.id]);
console.log('\n--- 有题的节点 ' + withQ.length + ' 个 ---');
withQ.sort((a, b) => (a.chap + a.id).localeCompare(b.chap + b.id)).forEach(function (n) {
  console.log('  ' + String(byNode[n.id]).padStart(3) + ' 题  ' + (n.wip ? '[建设中] ' : '[已开放] ') + n.id.padEnd(18) + n.name);
});
if (withoutQ.length) {
  console.log('\n--- 还没有题的节点 ' + withoutQ.length + ' 个 ---');
  withoutQ.forEach(n => console.log('  ' + n.chap.padEnd(7) + n.id.padEnd(18) + n.name));
}

// 新标准完成度
const full = Q.filter(q => q.diff && q.tips && (q.type !== 'choice' || (q.optionNotes || []).length === q.options.length));
const withVar = Q.filter(q => Array.isArray(q.variants) && q.variants.length);
console.log('\n--- 新标准完成度 ---');
console.log('  五字段齐全: ' + full.length + ' / ' + Q.length + '   带同类变式: ' + withVar.length);
console.log('  难度 ' + DIFFS.map(d => d + '=' + Q.filter(q => q.diff === d).length).join('  '));

// 已开放但没题的节点（点了会弹"补充中"，属体验缺陷）
const openedEmpty = NODES.filter(n => !n.wip && !byNode[n.id]);
if (openedEmpty.length) warn.push('已开放但 0 题的节点: ' + openedEmpty.map(n => n.id).join(', '));

console.log('\n错误 ' + err.length + ' | 提醒 ' + warn.length);
err.slice(0, 40).forEach(e => console.log('  ✗ ' + e));
if (err.length > 40) console.log('  ... 还有 ' + (err.length - 40) + ' 条错误');
const seen = {};
warn.forEach(function (w) { const k = w.replace(/^[^:]+: /, ''); seen[k] = (seen[k] || 0) + 1; });
Object.keys(seen).forEach(k => console.log('  · ' + k + ' × ' + seen[k]));
process.exit(err.length ? 1 : 0);
