/**
 * 真题元数据重算：全卷年份数据（zhenti_full_*.js）在 zhenti_data.js 之后加载，
 * 因此必须在全部数据就绪后重建 章节索引 与 总题数。
 * 顺序要求：zhenti_data.js → zhenti_full_*.js → 本文件 → zhenti.js
 */
window.ZHENTI_CHAPTER_INDEX = (function() {
    var idx = {};
    Object.keys(window.ZHENTI_DATA).forEach(function(year) {
        (window.ZHENTI_DATA[year] || []).forEach(function(q) {
            (q.chapter || []).forEach(function(ch) {
                if (!idx[ch]) idx[ch] = [];
                idx[ch].push(q);
            });
        });
    });
    return idx;
})();

window.ZHENTI_TOTAL_COUNT = Object.keys(window.ZHENTI_DATA).reduce(function(acc, y) {
    return acc + window.ZHENTI_DATA[y].length;
}, 0);
