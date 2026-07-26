// 第二轮修复：使用更宽松的正则
const fs = require('fs');
const path = require('path');

const chaptersDir = 'd:/TraeWorkSpace/hnsf/数学一/chapters';
const files = fs.readdirSync(chaptersDir).filter(f => /^ch\d+_.*\.html$/.test(f));

let totalFixed = 0;
const summary = [];

for (const file of files) {
    const fp = path.join(chaptersDir, file);
    let src = fs.readFileSync(fp, 'utf-8');
    let count = 0;

    // 策略：扫描每个 \\(...\\) 内部
    // 在 LaTeX 公式里，< 可能是 \langle 或比较符（< 或 ≤）
    // \langle 总是 \langle 形式（前面有反斜杠）
    // 比较符 < 后面跟变量或数字（如 < x、< 1）
    // 替换 LaTeX 内部的孤立 < 和 > 为 HTML 实体，但要保留 \langle 等命令
    src = src.replace(/\\\(.*?\\\)/gs, function(match) {
        let replaced = match;
        // 先标记 \langle 和 \rangle 防止被替换
        const placeholders = [];
        replaced = replaced.replace(/\\(langle|rangle|Langle|Rangle)/g, function(m) {
            placeholders.push(m);
            return '\x00' + (placeholders.length - 1) + '\x00';
        });
        // 替换孤立 < 和 >
        replaced = replaced.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // 还原 \langle 等
        placeholders.forEach((p, i) => {
            replaced = replaced.replace('\x00' + i + '\x00', p);
        });
        if (replaced !== match) count++;
        return replaced;
    });

    // \\[ ... \\]
    src = src.replace(/\\\[.*?\\\]/gs, function(match) {
        let replaced = match;
        const placeholders = [];
        replaced = replaced.replace(/\\(langle|rangle|Langle|Rangle)/g, function(m) {
            placeholders.push(m);
            return '\x00' + (placeholders.length - 1) + '\x00';
        });
        replaced = replaced.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        placeholders.forEach((p, i) => {
            replaced = replaced.replace('\x00' + i + '\x00', p);
        });
        if (replaced !== match) count++;
        return replaced;
    });

    if (count > 0) {
        fs.writeFileSync(fp, src);
        summary.push({file, count});
        totalFixed += count;
    }
}

console.log('Fixed files: ' + summary.length);
summary.forEach(s => console.log('  ' + s.file + ': ' + s.count + ' replacements'));
console.log('Total: ' + totalFixed);