/* ============================================================
 * 302 数学二 · 成就定义
 * ------------------------------------------------------------
 * check(ctx) 由 store 在「答题 / 通关」后调用，ctx 提供当前状态快照
 *
 * 字段说明：
 *   rarity  common 普通 | rare 稀有 | epic 史诗 | legend 传说
 *           —— 分层设计：普通成就几局就能拿完，稀有/传说才留得住人
 *   hidden  隐藏成就。拿到之前只显示「???」，拿到后才揭晓，制造惊喜
 *   check   判定函数，返回 true 即解锁（解锁后不再重复判定）
 *
 * 考点总数 = 69（高等数学 44 + 线性代数 25），节点从 21 涨到 69 后，
 * 下面所有「跟节点数有关」的门槛都改成按总数折算，避免 21 个时代写死的数字变成送分。
 * （题量类门槛「百题斩 / 千题斩」不受影响，不折算。）
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function () {
  'use strict';
  // data-nodes.js 在本文件之前加载，所以这里能直接读到真实节点数
  var TOTAL = (window.HNSF829.NODES && window.HNSF829.NODES.nodes.length) || 69;
  var P = function (p) { return Math.ceil(TOTAL * p / 100); };   // 按比例取门槛

  window.HNSF829_ACHIEVEMENTS = [
  /* ---------------- 普通：开局送，用来建立"我能行" ---------------- */
  { id: 'first_blood', rarity: 'common', icon: '🩸', name: '首杀', desc: '累计答对 1 道题', check: c => c.totalCorrect >= 1 },
  { id: 'first_clear', rarity: 'common', icon: '🚩', name: '破关', desc: '通关第一个考点', check: c => c.clearedCount >= 1 },
  { id: 'combo5', rarity: 'common', icon: '⚡', name: '连击·小成', desc: '连续答对 5 题', check: c => c.maxCombo >= 5 },
  { id: 'lv5', rarity: 'common', icon: '⭐', name: '五级学者', desc: '等级达到 5 级', check: c => c.level >= 5 },
  { id: 'clear5', rarity: 'common', icon: '✅', name: '五个考点', desc: '通关 5 个考点', check: c => c.clearedCount >= 5 },

  /* ---------------- 稀有 ---------------- */
  { id: 'combo10', rarity: 'rare', icon: '🔥', name: '连击·大师', desc: '连续答对 10 题', check: c => c.maxCombo >= 10 },
  { id: 'perfect', rarity: 'rare', icon: '💎', name: '满分通关', desc: '以 100% 正确率通关任意考点', check: c => c.perfectCount >= 1 },
  { id: 'lv10', rarity: 'rare', icon: '🌟', name: '十级学霸', desc: '等级达到 10 级', check: c => c.level >= 10 },
  { id: 'q100', rarity: 'rare', icon: '📚', name: '百题斩', desc: '累计作答 100 道题', check: c => c.totalAnswered >= 100 },
  { id: 'q500', rarity: 'rare', icon: '📖', name: '五百题斩', desc: '累计作答 500 道题', check: c => c.totalAnswered >= 500 },
  { id: 'wrong_clean', rarity: 'rare', icon: '🧹', name: '错题清零', desc: '在错题本中清空所有未消化错题', check: c => c.wrongCleaned },
  { id: 'half_way', rarity: 'rare', icon: '🏁', name: '半程', desc: '通关半数考点（' + P(50) + ' 个）', check: c => c.clearedCount >= P(50) },
  { id: 'tier1', rarity: 'rare', icon: '🧱', name: '基础奠基', desc: '通关「基础简易层」全部考点', check: c => c.tierCleared[1] },
  { id: 'acc90', rarity: 'rare', icon: '🎯', name: '神射手', desc: '作答满 100 题且总正确率 ≥ 90%', check: c => c.totalAnswered >= 100 && c.totalCorrect / c.totalAnswered >= 0.9 },
  { id: 'solid5', rarity: 'rare', icon: '🟢', name: '五科扎实', desc: '5 个考点的掌握度达到「扎实」', check: c => c.solidNodes >= 5 },
  { id: 'solid10', rarity: 'rare', icon: '🟩', name: '十科扎实', desc: '10 个考点的掌握度达到「扎实」', check: c => c.solidNodes >= 10 },
  { id: 'run_perfect', rarity: 'rare', icon: '🏅', name: '单局满分', desc: '某一局答题正确率 100%', check: c => c.bestRunRate >= 1 },

  /* ---------------- 史诗 ---------------- */
  { id: 'combo15', rarity: 'epic', icon: '💥', name: '连击·神话', desc: '连续答对 15 题', check: c => c.maxCombo >= 15 },
  { id: 'combo20', rarity: 'epic', icon: '🌪️', name: '连击·超凡', desc: '连续答对 20 题', check: c => c.maxCombo >= 20 },
  { id: 'q1000', rarity: 'epic', icon: '🏛️', name: '千题斩', desc: '累计作答 1000 道题', check: c => c.totalAnswered >= 1000 },
  { id: 'acc95', rarity: 'epic', icon: '🎖️', name: '神枪手', desc: '作答满 200 题且总正确率 ≥ 95%', check: c => c.totalAnswered >= 200 && c.totalCorrect / c.totalAnswered >= 0.95 },
  { id: 'run_combo10', rarity: 'epic', icon: '🎇', name: '一局十连', desc: '单局内连续答对 10 题（不跨局累计）', check: c => c.bestRunCombo >= 10 },
  { id: 'perfect5', rarity: 'epic', icon: '💠', name: '五次满分', desc: '5 个考点以 100% 正确率通关', check: c => c.perfectCount >= 5 },
  { id: 'perfect15', rarity: 'epic', icon: '🔮', name: '十五次满分', desc: '15 个考点以 100% 正确率通关', check: c => c.perfectCount >= 15 },
  { id: 'solid20', rarity: 'epic', icon: '🧿', name: '二十科扎实', desc: '20 个考点的掌握度达到「扎实」', check: c => c.solidNodes >= 20 },
  { id: 'solid40', rarity: 'epic', icon: '🟦', name: '四十科扎实', desc: P(58) + ' 个考点的掌握度达到「扎实」', check: c => c.solidNodes >= P(58) },
  { id: 'tier2', rarity: 'epic', icon: '🧠', name: '融会贯通', desc: '通关「综合应用层」全部考点', check: c => c.tierCleared[2] },
  { id: 'tier3', rarity: 'epic', icon: '⛰️', name: '登峰造极', desc: '通关「创新拓展层」全部考点（压轴题全清）', check: c => c.tierCleared[3] },
  { id: 'mod_xd', rarity: 'epic', icon: '🧮', name: '线代全通', desc: '通关「线性代数」全部 25 个考点', check: c => c.moduleCleared.xd },

  /* ---------------- 传说：只有长期坚持才拿得到 ---------------- */
  { id: 'mod_gs', rarity: 'legend', icon: '📐', name: '高数全通', desc: '通关「高等数学」全部 44 个考点', check: c => c.moduleCleared.gs },
  { id: 'allnodes', rarity: 'legend', icon: '🐉', name: '召唤神龙', desc: '集齐七颗龙珠：通关全部 ' + TOTAL + ' 个考点', check: c => c.tierCleared[1] && c.tierCleared[2] && c.tierCleared[3] },
  { id: 'all_perfect', rarity: 'legend', icon: '👑', name: '全满星', desc: '全部 ' + TOTAL + ' 个考点都以 100% 正确率通关', check: c => c.perfectCount >= TOTAL },
  { id: 'solid_all', rarity: 'legend', icon: '🏆', name: '全科扎实', desc: '全部 ' + TOTAL + ' 个考点的掌握度都达到「扎实」', check: c => c.solidNodes >= TOTAL },

  /* ---------------- 隐藏：拿到之前看不到条件 ---------------- */
  { id: 'night_owl', rarity: 'rare', hidden: true, icon: '🦉', name: '夜猫子', desc: '在凌晨 0 点到 5 点之间答对一道题', check: c => { var h = new Date().getHours(); return h >= 0 && h < 5; } },
  { id: 'early_bird', rarity: 'rare', hidden: true, icon: '🐦', name: '早起的鸟', desc: '在早上 5 点到 7 点之间答对一道题', check: c => { var h = new Date().getHours(); return h >= 5 && h < 7; } },
  { id: 'never_give_up', rarity: 'epic', hidden: true, icon: '🔁', name: '屡败屡战', desc: '同一道题错过 4 次以上仍在继续刷', check: c => c.maxWrongTimes >= 4 },
  { id: 'comeback', rarity: 'epic', hidden: true, icon: '🪃', name: '逆袭', desc: '清空过错题本，又累计答对 200 题', check: c => c.wrongCleaned && c.totalCorrect >= 200 }
  ];

  window.HNSF829.ACHIEVEMENTS = window.HNSF829_ACHIEVEMENTS;
})();
