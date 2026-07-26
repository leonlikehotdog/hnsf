/*!
 * 考研数学一 · 全局知识点分类树
 * ID 编码规则：{Major}.{Section}.{Subpoint}
 *   - GS = 高等数学（1-8 节）
 *   - XD = 线性代数（9-14 节）
 *   - GL = 概率论与数理统计（15-20 节）
 *
 * 维护在 zhenti_knowledge_map.md 与本文件保持同步。
 * 任何页面都可以通过 window.KP_TREE / window.KP_NAME 引用。
 */
window.KP_TREE = [
    {
        id: 'GS', name: '高等数学', icon: 'GS',
        children: [
            { id: 'GS.1', name: '函数、极限、连续', kps: ['GS.1.1','GS.1.2','GS.1.3','GS.1.4','GS.1.5'] },
            { id: 'GS.2', name: '一元函数微分学', kps: ['GS.2.1','GS.2.2','GS.2.3','GS.2.4','GS.2.5','GS.2.6','GS.2.7','GS.2.8','GS.2.9'] },
            { id: 'GS.3', name: '一元函数积分学', kps: ['GS.3.1','GS.3.2','GS.3.3','GS.3.4','GS.3.5','GS.3.6'] },
            { id: 'GS.4', name: '向量与空间解析几何', kps: ['GS.4.1'] },
            { id: 'GS.5', name: '多元函数微分学', kps: ['GS.5.1','GS.5.2','GS.5.3','GS.5.4','GS.5.5'] },
            { id: 'GS.6', name: '多元函数积分学', kps: ['GS.6.1','GS.6.2','GS.6.3','GS.6.4','GS.6.5','GS.6.6','GS.6.7','GS.6.8','GS.6.9'] },
            { id: 'GS.7', name: '无穷级数', kps: ['GS.7.1','GS.7.2','GS.7.3','GS.7.4'] },
            { id: 'GS.8', name: '常微分方程', kps: ['GS.8.1','GS.8.2','GS.8.3'] },
        ]
    },
    {
        id: 'XD', name: '线性代数', icon: 'XD',
        children: [
            { id: 'XD.9',  name: '行列式',           kps: ['XD.9.1'] },
            { id: 'XD.10', name: '矩阵',             kps: ['XD.10.1','XD.10.2','XD.10.3','XD.10.4'] },
            { id: 'XD.11', name: '向量',             kps: ['XD.11.1','XD.11.2','XD.11.3'] },
            { id: 'XD.12', name: '线性方程组',       kps: ['XD.12.1','XD.12.2','XD.12.3'] },
            { id: 'XD.13', name: '特征值与特征向量', kps: ['XD.13.1','XD.13.2','XD.13.3'] },
            { id: 'XD.14', name: '二次型',           kps: ['XD.14.1','XD.14.2','XD.14.3'] },
        ]
    },
    {
        id: 'GL', name: '概率论与数理统计', icon: 'GL',
        children: [
            { id: 'GL.15', name: '随机事件和概率',         kps: ['GL.15.1','GL.15.2'] },
            { id: 'GL.16', name: '随机变量及其分布',       kps: ['GL.16.1','GL.16.2','GL.16.3'] },
            { id: 'GL.17', name: '多维随机变量',           kps: ['GL.17.1','GL.17.2','GL.17.3','GL.17.4'] },
            { id: 'GL.18', name: '数字特征',               kps: ['GL.18.1','GL.18.2','GL.18.3'] },
            { id: 'GL.19', name: '大数定律与中心极限定理', kps: ['GL.19.1','GL.19.2'] },
            { id: 'GL.20', name: '数理统计',               kps: ['GL.20.1','GL.20.2','GL.20.3'] },
        ]
    },
];

// 索引：ID -> { sectionName, majorName, fullPath }
window.KP_INDEX = {};
window.KP_NAME = {};
window.KP_TREE.forEach(g => {
    g.children.forEach(c => {
        window.KP_NAME[c.id] = c.name;
        c.kps.forEach(kpId => {
            window.KP_INDEX[kpId] = {
                majorId: g.id,
                majorName: g.name,
                sectionId: c.id,
                sectionName: c.name,
                fullPath: `${g.name} › ${c.name}`
            };
        });
    });
});

// 查找 KP 所在章节 ID（用于跳转章节）
// 知识点 ID 第一节数字对应章节号: GS.1 -> ch01, GS.2 -> ch02, ..., XD.9 -> ch09 等
window.KP_TO_CHAPTER = {};
window.KP_TREE.forEach(g => {
    g.children.forEach(c => {
        const sectionNum = parseInt(c.id.split('.')[1], 10);
        const chapterId = 'ch' + String(sectionNum).padStart(2, '0');
        c.kps.forEach(kpId => {
            window.KP_TO_CHAPTER[kpId] = chapterId;
        });
    });
});