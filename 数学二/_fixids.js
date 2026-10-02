/* 一次性修复：data-q-gs-c2b.js 里 gs-concave 的 id 前缀 lc 与
 * data-q-gs-c1c.js 里 gs-lim-calc 的 lc 撞车（我写规范时的疏漏），
 * 导致 12 道凹凸性题被当重复 id 丢弃。把 c2b 的改名为 cv。
 */
const fs = require('fs');
const P = 'd:/TraeWorkSpace/hnsf/数学二/js/data-q-gs-c2b.js';
let t = fs.readFileSync(P, 'utf8');
const n = (t.match(/id: 'lc-/g) || []).length;
t = t.replace(/id: 'lc-/g, "id: 'cv-");
fs.writeFileSync(P, t, 'utf8');
console.log('重命名 id 数:', n, '（lc- → cv-）');
