/**
 * 考研数学一 ·「母题 22 炼」题库
 * =================================================
 * 以近 5 年（2021-2025）真题的 22 个题位为骨架：
 *   选择题 1-4 高数 / 5-7 线代 / 8-10 概率
 *   填空题 11-14 高数 / 15 线代 / 16 概率
 *   解答题 17-19 高数 / 20 高数（2025 起概率）/ 21 线代 / 22 概率
 * 每道母题衍生 4 道变式（维度固定：概念 / 计算 / 公式 / 创新）。
 *
 * 数据结构（分批填充时严格对齐）：
 * window.MUTI_DATA = {
 *   meta: { title, desc, total: 22, ready, refYears, updatedAt },
 *   slots: [
 *     {
 *       id: 'm01',          // 母题 ID（唯一）
 *       slot: 1,            // 对应真题题位 1-22
 *       type: '选择题',      // 选择题 / 填空题 / 解答题
 *       score: 5,           // 分值（选择/填空 5，解答 10/12）
 *       part: '高数',        // 高数 / 线代 / 概率
 *       topic: '母题主题',
 *       difficulty: 3,      // 1-5，对标近5年真题难度
 *       kpIds: ['GS.1.3'],  // 关联知识点 ID（跳转章节用）
 *       kpNames: ['变限积分'],
 *       chapter: 'ch01',    // 对应章节 id（跳转目标）
 *       question: '题干（LaTeX，\\\\( \\\\) 行内 / \\\\[ \\\\] 行间）',
 *       options: ['A. ...', 'B. ...'],   // 选择题必填；填空/解答为空数组
 *       answer: '参考答案',
 *       concepts: [          // 零跳步前置知识：本题涉及的概念/公式（UI 会先列出）
 *         { name: '概念名', note: '定义/公式说明（LaTeX）' }
 *       ],
 *       solution: [{ step: 1, title: '...', content: '零跳步推导（每步含完整代数变形）' }],
 *       source: { rank: 1, label: '真题', detail: '出处依据' },
 *       variants: [          // 恰好 4 个，dimension 顺序：概念/计算/公式/创新
 *         { id: 'm01v1', dimension: '概念', question, options, answer,
 *           concepts, solution, difficulty, kpIds, kpNames, source }
 *         // v2 计算 / v3 公式 / v4 创新 结构同上
 *       ]
 *     }
 *   ]
 * };
 *
 * 来源规范（source 字段，rank 三选一，必填）：
 *   rank 1 真题      —— label '真题'，detail = 年份+题号+原题/改编说明
 *   rank 2 名师模拟卷 —— label '名师模拟'，detail = 老师+卷名+套数+题号（须联网核实）
 *   rank 3 AI 创新   —— label 'AI创新'，detail = 知识点说明+难度对标
 *
 * 书写约定（零跳步解析）：
 * - 用普通单引号字符串 + 双反斜杠转义 LaTeX（V8 会吞掉 \<未识别字符> 的反斜杠）
 * - solution 必须「不跳步」：每一步给出完整代数变形（换元/求导/展开逐项写出），
 *   并注明所依据的概念/公式；题目涉及的概念一律在 concepts 中先列出。
 * - 难度对标近 5 年真题（2021-2025，多数为 difficulty=3，2023 年难度跨度最大）
 */
window.MUTI_DATA = {
    meta: {
        title: '考研数学一 · 母题 22 炼',
        desc: '以近5年真题题位为骨架：22 道母题 × 每道 4 道变式（概念/计算/公式/创新），共约 110 题',
        total: 22,
        ready: 17,
        refYears: '2021-2025',
        updatedAt: '2026-08-11'
    },
    slots: [

        /* ==================================================================
         * m01 · 题位 1 · 高数/选择题 · 变限积分的性质（奇偶性）
         * 母题来源：2024 年数一第 1 题（原题）
         * ================================================================== */
        {
            id: 'm01',
            slot: 1,
            type: '选择题',
            score: 5,
            part: '高数',
            topic: '变限积分的性质（奇偶性）',
            difficulty: 3,
            kpIds: ['GS.1.3'],
            kpNames: ['变限积分', '极限'],
            chapter: 'ch01',
            question: '已知函数 \\(f(x)=\\int_0^x \\mathrm{e}^{\\cos t}\\,\\mathrm{d}t\\)，\\(g(x)=\\int_0^{\\sin x} \\mathrm{e}^{t^2}\\,\\mathrm{d}t\\)，则',
            options: [
                'A. \\(f(x)\\) 为奇函数，\\(g(x)\\) 为偶函数',
                'B. \\(f(x)\\) 为偶函数，\\(g(x)\\) 为奇函数',
                'C. \\(f(x)\\) 与 \\(g(x)\\) 均为奇函数',
                'D. \\(f(x)\\) 与 \\(g(x)\\) 均为周期函数'
            ],
            answer: 'C',
            concepts: [
                { name: '奇偶函数定义', note: '奇：\\(f(-x)=-f(x)\\)；偶：\\(f(-x)=f(x)\\)。判断奇偶性只需算 \\(f(-x)\\)。' },
                { name: '偶函数复合', note: '\\(\\cos t\\) 是偶函数（\\(\\cos(-t)=\\cos t\\)），故 \\(\\mathrm{e}^{\\cos t}\\) 是偶函数（偶函数与任意函数复合仍偶）。' },
                { name: '变上限积分换元', note: '令 \\(t=-u\\)：\\(\\int_0^{-x}\\varphi(t)\\,\\mathrm{d}t=\\int_0^x\\varphi(-u)(-\\mathrm{d}u)=-\\int_0^x\\varphi(-u)\\,\\mathrm{d}u\\)。' },
                { name: '奇偶函数复合', note: '奇函数复合奇函数仍为奇函数：\\(F\\) 奇、\\(\\sin x\\) 奇 \\(\\Rightarrow F(\\sin(-x))=F(-\\sin x)=-F(\\sin x)\\)。' }
            ],
            solution: [
                { step: 1, title: '判断 \\(f(x)\\)：写出 \\(f(-x)\\)', content: '由定义 \\(f(-x)=\\int_0^{-x}\\mathrm{e}^{\\cos t}\\,\\mathrm{d}t\\)。要判断奇偶性，关键是把它化成与 \\(f(x)\\) 有关的形式。' },
                { step: 2, title: '换元 \\(t=-u\\)（零跳步）', content: '令 \\(t=-u\\)，则 \\(\\mathrm{d}t=-\\mathrm{d}u\\)，且 \\(t=0\\to u=0\\)、\\(t=-x\\to u=x\\)。代入：<br>\\(f(-x)=\\int_0^{-x}\\mathrm{e}^{\\cos t}\\,\\mathrm{d}t=\\int_0^{x}\\mathrm{e}^{\\cos(-u)}(-\\mathrm{d}u)=-\\int_0^{x}\\mathrm{e}^{\\cos u}\\,\\mathrm{d}u\\)<br>其中用到了 \\(\\cos(-u)=\\cos u\\)，所以 \\(\\mathrm{e}^{\\cos(-u)}=\\mathrm{e}^{\\cos u}\\)；把负号提到积分号外。' },
                { step: 3, title: '由定义判定 \\(f\\) 为奇函数', content: '步骤 2 的结果正好是 <br>\\(f(-x)=-\\int_0^x\\mathrm{e}^{\\cos u}\\,\\mathrm{d}u=-f(x)\\)<br>满足奇函数定义 \\(f(-x)=-f(x)\\)，故 \\(f\\) 为奇函数。' },
                { step: 4, title: '判断 \\(g(x)\\)：先令 \\(F(u)=\\int_0^u\\mathrm{e}^{t^2}\\,\\mathrm{d}t\\)', content: '被积函数 \\(\\mathrm{e}^{t^2}\\) 中 \\(t^2\\) 是偶函数（\\((-t)^2=t^2\\)），故 \\(\\mathrm{e}^{t^2}\\) 为偶函数。与步骤 1-3 完全同理（偶函数作 0 到 \\(u\\) 的变上限积分得奇函数）：<br>\\(F(-u)=\\int_0^{-u}\\mathrm{e}^{t^2}\\,\\mathrm{d}t\\xlongequal{t=-s}-\\int_0^u\\mathrm{e}^{s^2}\\,\\mathrm{d}s=-F(u)\\)<br>即 \\(F\\) 为奇函数。' },
                { step: 5, title: '复合得到 \\(g\\) 的奇偶性', content: '\\(g(x)=\\int_0^{\\sin x}\\mathrm{e}^{t^2}\\,\\mathrm{d}t=F(\\sin x)\\)。\\(F\\) 是奇函数、\\(\\sin x\\) 是奇函数，奇函数复合奇函数仍为奇函数：<br>\\(g(-x)=F(\\sin(-x))=F(-\\sin x)=-F(\\sin x)=-g(x)\\)<br>故 \\(g\\) 为奇函数。' },
                { step: 6, title: '结论', content: '\\(f\\) 与 \\(g\\) 均为奇函数，只能选 C。' }
            ],
            source: { rank: 1, label: '真题', detail: '2024 年数学一第 1 题（原题）' },
            variants: [
                {
                    id: 'm01v1', dimension: '概念',
                    kpIds: ['GS.1.3'], kpNames: ['变限积分'],
                    chapter: 'ch01',
                    difficulty: 3,
                    question: '设 \\(f(x)=\\int_0^x t\\,\\mathrm{e}^{t^2}\\,\\mathrm{d}t\\)，\\(g(x)=\\int_0^{\\cos x}\\mathrm{e}^{t^2}\\,\\mathrm{d}t\\)，则下列结论正确的是',
                    options: [
                        'A. \\(f(x)\\) 为偶函数，\\(g(x)\\) 为偶函数',
                        'B. \\(f(x)\\) 为奇函数，\\(g(x)\\) 为偶函数',
                        'C. \\(f(x)\\) 为偶函数，\\(g(x)\\) 为奇函数',
                        'D. \\(f(x)\\) 与 \\(g(x)\\) 均为周期函数'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '奇函数 × 偶函数', note: '奇函数乘以偶函数仍是奇函数：\\(t\\) 奇、\\(\\mathrm{e}^{t^2}\\) 偶 \\(\\Rightarrow t\\mathrm{e}^{t^2}\\) 奇。' },
                        { name: '奇偶函数作变限积分的规律', note: '被积函数为奇函数，作 0 到 \\(x\\) 的变上限积分得偶函数；被积函数为偶函数则得奇函数（可用换元 \\(t=-u\\) 验证）。' },
                        { name: '偶函数复合', note: '奇函数复合偶函数为偶函数：\\(g(x)=F(\\cos x)\\)，\\(F\\) 奇、\\(\\cos x\\) 偶 \\(\\Rightarrow g(-x)=F(\\cos(-x))=F(\\cos x)=g(x)\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '判断 \\(f(x)\\)：写出 \\(f(-x)\\) 并换元', content: '被积函数 \\(t\\mathrm{e}^{t^2}\\) 中 \\(t\\) 是奇函数、\\(\\mathrm{e}^{t^2}\\) 是偶函数，所以 \\(t\\mathrm{e}^{t^2}\\) 是奇函数。计算（令 \\(t=-u\\)）：<br>\\(f(-x)=\\int_0^{-x}t\\mathrm{e}^{t^2}\\,\\mathrm{d}t=\\int_0^{x}(-u)\\mathrm{e}^{u^2}(-\\mathrm{d}u)=\\int_0^{x}u\\mathrm{e}^{u^2}\\,\\mathrm{d}u=f(x)\\)<br>注意：被积函数中的 \\((-u)\\) 与换元产生的 \\((-\\mathrm{d}u)\\) 两个负号相乘抵消，故 \\(f(-x)=f(x)\\)，\\(f\\) 为偶函数。' },
                        { step: 2, title: '判断 \\(g(x)\\)：先看内层 \\(F(u)\\)', content: '令 \\(F(u)=\\int_0^u\\mathrm{e}^{t^2}\\,\\mathrm{d}t\\)。\\(\\mathrm{e}^{t^2}\\) 是偶函数，故 \\(F\\) 为奇函数（由母题步骤 4 的换元验证）。' },
                        { step: 3, title: '复合得到 \\(g\\) 的奇偶性', content: '\\(g(x)=F(\\cos x)\\)。\\(\\cos x\\) 是偶函数：<br>\\(g(-x)=F(\\cos(-x))=F(\\cos x)=g(x)\\)<br>故 \\(g\\) 为偶函数。' },
                        { step: 4, title: '结论', content: '\\(f\\) 为偶函数、\\(g\\) 为偶函数，选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：换被积函数与复合函数，考核“奇偶函数作变限积分”概念，难度对标 2024 年数一第 1 题' }
                },
                {
                    id: 'm01v2', dimension: '计算',
                    kpIds: ['GS.1.3'], kpNames: ['变限积分', '极限'],
                    chapter: 'ch01',
                    difficulty: 3,
                    question: '求极限 \\(\\displaystyle\\lim_{x\\to0}\\dfrac{\\int_0^{\\sin x}\\mathrm{e}^{t^2}\\,\\mathrm{d}t}{x}\\)',
                    options: [],
                    answer: '1',
                    concepts: [
                        { name: '0/0 型未定式', note: '\\(x\\to0\\) 时分子、分母都趋于 0，可考虑洛必达法则。' },
                        { name: '变上限积分求导公式', note: '\\(\\dfrac{\\mathrm{d}}{\\mathrm{d}x}\\int_0^{u(x)}\\varphi(t)\\,\\mathrm{d}t=\\varphi(u(x))\\cdot u\'(x)\\)（先代上限，再乘上限的导数）。' },
                        { name: '复合函数求导', note: '\\((\\sin x)\'=\\cos x\\)，\\(\\mathrm{e}^{(\\sin x)^2}=\\mathrm{e}^{\\sin^2 x}\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '判型', content: '当 \\(x\\to0\\) 时，积分区间 \\([0,\\sin x]\\) 缩为一点，分子 \\(\\int_0^{\\sin x}\\mathrm{e}^{t^2}\\,\\mathrm{d}t\\to0\\)；分母 \\(x\\to0\\)。是 0/0 型未定式，且分子、分母在 0 的邻域内可导、分母导数 \\(=1\\ne0\\)，满足洛必达条件。' },
                        { step: 2, title: '分子求导（套公式）', content: '视 \\(u(x)=\\sin x\\)、\\(\\varphi(t)=\\mathrm{e}^{t^2}\\)：<br>\\(\\dfrac{\\mathrm{d}}{\\mathrm{d}x}\\int_0^{\\sin x}\\mathrm{e}^{t^2}\\,\\mathrm{d}t=\\mathrm{e}^{(\\sin x)^2}\\cdot(\\sin x)\'=\\mathrm{e}^{\\sin^2 x}\\cdot\\cos x\\)' },
                        { step: 3, title: '分母求导', content: '\\(\\dfrac{\\mathrm{d}}{\\mathrm{d}x}x=1\\)。' },
                        { step: 4, title: '代回并求极限', content: '<br>\\(\\displaystyle\\lim_{x\\to0}\\frac{\\int_0^{\\sin x}\\mathrm{e}^{t^2}\\,\\mathrm{d}t}{x}=\\lim_{x\\to0}\\frac{\\mathrm{e}^{\\sin^2 x}\\cos x}{1}=\\mathrm{e}^{0}\\cdot1=1\\)' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：变限积分求极限（计算维度），难度对标 2024 年数一第 1 题' }
                },
                {
                    id: 'm01v3', dimension: '公式',
                    kpIds: ['GS.1.3'], kpNames: ['变限积分'],
                    chapter: 'ch01',
                    difficulty: 2,
                    question: '设 \\(F(x)=\\int_0^{x^2}\\sin(t^2)\\,\\mathrm{d}t\\)，则 \\(F\'(x)\\) 等于',
                    options: [
                        'A. \\(2x\\sin(x^4)\\)',
                        'B. \\(\\sin(x^4)\\)',
                        'C. \\(2x\\sin(x^2)\\)',
                        'D. \\(x^2\\sin(x^4)\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '变上限积分求导公式', note: '\\(\\dfrac{\\mathrm{d}}{\\mathrm{d}x}\\int_0^{u(x)}\\varphi(t)\\,\\mathrm{d}t=\\varphi(u(x))\\cdot u\'(x)\\)。' },
                        { name: '幂函数求导', note: '\\((x^2)\'=2x\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '识别公式中的 \\(u(x)\\) 与 \\(\\varphi(t)\\)', content: '上限 \\(u(x)=x^2\\)，被积函数 \\(\\varphi(t)=\\sin(t^2)\\)。' },
                        { step: 2, title: '套变上限积分求导公式', content: '<br>\\(F\'(x)=\\varphi(u(x))\\cdot u\'(x)=\\sin\\big((x^2)^2\\big)\\cdot(x^2)\'\\)' },
                        { step: 3, title: '代入化简', content: '\\((x^2)^2=x^4\\)，\\((x^2)\'=2x\\)，所以<br>\\(F\'(x)=\\sin(x^4)\\cdot2x=2x\\sin(x^4)\\)' },
                        { step: 4, title: '结论', content: '选 A。注意不要漏乘 \\(u\'(x)=2x\\)，也不要写成 \\(\\sin(x^2)\\)（上限是 \\(x^2\\)，代进去是 \\((x^2)^2=x^4\\)）。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：变限积分求导公式直接应用（公式维度），难度偏低，对标 2023 年数一第 12 题水平' }
                },
                {
                    id: 'm01v4', dimension: '创新',
                    kpIds: ['GS.1.3', 'GS.2.5', 'GS.2.6'], kpNames: ['变限积分', '极值', '拐点'],
                    chapter: 'ch02',
                    difficulty: 4,
                    question: '设 \\(h(x)=\\int_0^x(\\mathrm{e}^t-1-t)\\,\\mathrm{d}t\\)，则下列结论正确的是',
                    options: [
                        'A. \\(x=0\\) 是 \\(h(x)\\) 的极小值点',
                        'B. \\(x=0\\) 是 \\(h(x)\\) 的极大值点',
                        'C. \\((0,h(0))\\) 是曲线 \\(y=h(x)\\) 的拐点，且 \\(x=0\\) 不是极值点',
                        'D. \\(x=0\\) 既是极值点也是拐点'
                    ],
                    answer: 'C',
                    concepts: [
                        { name: '变上限积分求导', note: '\\(h\'(x)=\\mathrm{e}^x-1-x\\)（直接代上限）。' },
                        { name: '极值判定', note: '若 \\(f\'\\) 在 \\(x_0\\) 两侧变号则 \\(x_0\\) 是极值点；若 \\(f\'\\) 在 \\(x_0\\) 两侧同号则不是极值点。' },
                        { name: '拐点判定', note: '若 \\(f\'\'\\) 在 \\(x_0\\) 两侧变号（凹凸性改变），则 \\((x_0,f(x_0))\\) 是拐点。' },
                        { name: '指数不等式', note: '\\(\\mathrm{e}^x\\ge1+x\\) 恒成立，等号仅在 \\(x=0\\) 取得（\\(\\varphi(x)=\\mathrm{e}^x-1-x\\) 在 0 处取最小值）。' }
                    ],
                    solution: [
                        { step: 1, title: '求一阶导', content: '由变上限积分求导公式：<br>\\(h\'(x)=\\mathrm{e}^x-1-x\\)' },
                        { step: 2, title: '研究 \\(h\'(x)\\) 的符号（先令 \\(\\varphi(x)=\\mathrm{e}^x-1-x\\)）', content: '\\(\\varphi\'(x)=\\mathrm{e}^x-1\\)。当 \\(x<0\\) 时 \\(\\mathrm{e}^x<1\\)，\\(\\varphi\'(x)<0\\)，\\(\\varphi\\) 递减；当 \\(x>0\\) 时 \\(\\varphi\'(x)>0\\)，\\(\\varphi\\) 递增。又 \\(\\varphi(0)=0\\)，故 \\(\\varphi(x)\\ge0\\)，且仅在 \\(x=0\\) 取等。' },
                        { step: 3, title: '判断极值', content: '\\(h\'(x)=\\varphi(x)\\ge0\\) 恒成立，只在 \\(x=0\\) 处 \\(h\'(0)=0\\)。一阶导在 \\(x=0\\) 的两侧符号相同（都为非负），不改变符号，所以 \\(x=0\\) 不是极值点。' },
                        { step: 4, title: '求二阶导并判断拐点', content: '\\(h\'\'(x)=\\mathrm{e}^x-1\\)。\\(x<0\\) 时 \\(h\'\'(x)<0\\)（曲线凸），\\(x>0\\) 时 \\(h\'\'(x)>0\\)（曲线凹），凹凸性在 \\(x=0\\) 处改变，故 \\((0,h(0))\\) 是拐点。' },
                        { step: 5, title: '结论', content: '不是极值、是拐点，选 C。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：串联变限积分 + 极值拐点判定（创新维度，跨 ch01/ch02），难度对标 2025 年数一第 1 题' }
                }
            ]
        },

        /* ==================================================================
         * m04 · 题位 4 · 高数/选择题 · 极值点与拐点判定
         * 母题来源：2025 年数一第 1 题（原题）
         * ================================================================== */
        {
            id: 'm04',
            slot: 4,
            type: '选择题',
            score: 5,
            part: '高数',
            topic: '极值点与拐点判定（变限积分型函数）',
            difficulty: 3,
            kpIds: ['GS.2.5', 'GS.2.6'],
            kpNames: ['极值', '拐点'],
            chapter: 'ch02',
            question: '已知 \\(f(x)=\\int_0^x\\mathrm{e}^{t^2}\\sin t\\,\\mathrm{d}t\\)，\\(g(x)=\\left(\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t\\right)\\cdot\\sin^2 x\\)，则',
            options: [
                'A. \\(x=0\\) 是 \\(f(x)\\) 的极值点，也是 \\(g(x)\\) 的极值点',
                'B. \\(x=0\\) 是 \\(f(x)\\) 的极值点，\\((0,0)\\) 是曲线 \\(y=g(x)\\) 的拐点',
                'C. \\(x=0\\) 是 \\(f(x)\\) 的极值点，\\((0,0)\\) 是曲线 \\(y=f(x)\\) 的拐点',
                'D. \\((0,0)\\) 是曲线 \\(y=f(x)\\) 的拐点，\\((0,0)\\) 也是曲线 \\(y=g(x)\\) 的拐点'
            ],
            answer: 'B',
            concepts: [
                { name: '变上限积分求导', note: '\\(\\dfrac{\\mathrm{d}}{\\mathrm{d}x}\\int_0^x\\varphi(t)\\,\\mathrm{d}t=\\varphi(x)\\)。' },
                { name: '极值点判定', note: '若 \\(f\'(x_0)=0\\) 且 \\(f\'\\) 在 \\(x_0\\) 两侧变号（左负右正为极小、左正右负为极大），则 \\(x_0\\) 是极值点。' },
                { name: '拐点判定', note: '若 \\(f\'\'(x_0)=0\\) 且 \\(f\'\'\\) 在 \\(x_0\\) 两侧变号，则 \\((x_0,f(x_0))\\) 是拐点。' },
                { name: '等价无穷小/泰勒展开', note: '\\(x\\to0\\) 时 \\(\\sin x\\sim x\\)、\\(\\sin^2 x=x^2+o(x^3)\\)、\\(\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t=x+\\dfrac{x^3}{3}+o(x^3)\\)（因 \\(\\mathrm{e}^{t^2}=1+t^2+o(t^2)\\) 逐项积分）。' }
            ],
            solution: [
                { step: 1, title: '先看 \\(f(x)\\)：求 \\(f\'(x)\\)', content: '由变上限积分求导：<br>\\(f\'(x)=\\mathrm{e}^{x^2}\\sin x\\)' },
                { step: 2, title: '判断 \\(x=0\\) 是否为 \\(f\\) 的极值点', content: '当 \\(x\\to0\\) 时，\\(\\mathrm{e}^{x^2}\\to1\\)、\\(\\sin x\\sim x\\)，故 \\(f\'(x)\\sim x\\)。因此：\\(x<0\\) 时 \\(f\'(x)<0\\)、\\(x>0\\) 时 \\(f\'(x)>0\\)，一阶导在 0 两侧变号（左负右正）→ \\(x=0\\) 是 \\(f(x)\\) 的极小值点。' },
                { step: 3, title: '再分析 \\(g(x)\\)：局部展开（零跳步）', content: '记 \\(A(x)=\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t\\)。由 \\(\\mathrm{e}^{t^2}=1+t^2+\\dfrac{t^4}{2}+\\cdots\\) 逐项积分得 <br>\\(A(x)=x+\\dfrac{x^3}{3}+o(x^3)\\)<br>而 \\(\\sin^2 x=\\left(x-\\dfrac{x^3}{6}+o(x^3)\\right)^2=x^2+o(x^3)\\)。<br>相乘：<br>\\(g(x)=\\left(x+\\dfrac{x^3}{3}+o(x^3)\\right)\\left(x^2+o(x^3)\\right)=x^3+o(x^3)\\)，即 \\(g(x)\\sim x^3\\)。' },
                { step: 4, title: '由 \\(g(x)\\sim x^3\\) 判断极值与拐点', content: '对 \\(g(x)\\sim x^3\\) 求导：\\(g\'(x)\\sim3x^2\\ge0\\)，在 0 两侧同号 → \\(0\\) 不是 \\(g\\) 的极值点；再求导 \\(g\'\'(x)\\sim6x\\)，在 0 两侧变号 → \\((0,0)\\) 是曲线 \\(y=g(x)\\) 的拐点。' },
                { step: 5, title: '结论', content: '\\(x=0\\) 是 \\(f\\) 的极值点、(0,0) 是 \\(y=g\\) 的拐点，选 B。' }
            ],
            source: { rank: 1, label: '真题', detail: '2025 年数学一第 1 题（原题）' },
            variants: [
                {
                    id: 'm04v1', dimension: '概念',
                    kpIds: ['GS.2.5', 'GS.2.6'], kpNames: ['极值', '拐点'],
                    chapter: 'ch02',
                    difficulty: 3,
                    question: '设 \\(f(x)\\) 在 \\(x=1\\) 的某邻域内三阶可导，且 \\(f\'(1)=f\'\'(1)=0\\)，\\(f\'\'\'(1)=3>0\\)，则',
                    options: [
                        'A. \\(x=1\\) 是 \\(f\\) 的极大值点',
                        'B. \\(x=1\\) 是 \\(f\\) 的极小值点',
                        'C. \\((1,f(1))\\) 是曲线 \\(y=f(x)\\) 的拐点，且 \\(x=1\\) 不是极值点',
                        'D. 无法判断'
                    ],
                    answer: 'C',
                    concepts: [
                        { name: '泰勒展开的一阶近似', note: '\\(f\'\'(x)\\approx f\'\'(1)+f\'\'\'(1)(x-1)=3(x-1)\\)；\\(f\'(x)\\approx f\'(1)+f\'\'(1)(x-1)+\\dfrac{f\'\'\'(1)}{2}(x-1)^2\\)。' },
                        { name: '拐点判定', note: '\\(f\'\'\'\\) 在 \\(x_0\\) 处不为 0 且 \\(f\'\'(x_0)=0\\) \\(\\Rightarrow\\) \\(f\'\'\\) 在 \\(x_0\\) 两侧变号 \\(\\Rightarrow\\) 拐点。' },
                        { name: '极值判定', note: '若 \\(f\'(x_0)=0\\) 但 \\(f\'\\) 在 \\(x_0\\) 两侧同号（如恒非负），则不是极值点。' }
                    ],
                    solution: [
                        { step: 1, title: '回忆局部的泰勒近似公式', content: '在 \\(x=1\\) 附近：<br>\\(f\'(x)\\approx f\'(1)+f\'\'(1)(x-1)+\\dfrac{f\'\'\'(1)}{2}(x-1)^2\\)<br>\\(f\'\'(x)\\approx f\'\'(1)+f\'\'\'(1)(x-1)\\)<br>题设 \\(f\'(1)=f\'\'(1)=0\\)、\\(f\'\'\'(1)=3\\)。' },
                        { step: 2, title: '由二阶导变号判断拐点', content: '代入得 \\(f\'\'(x)\\approx0+3(x-1)=3(x-1)\\)。于是 \\(x<1\\) 时 \\(f\'\'(x)<0\\)（曲线凸）、\\(x>1\\) 时 \\(f\'\'(x)>0\\)（曲线凹），凹凸性在 \\(x=1\\) 处改变 → \\((1,f(1))\\) 是拐点。' },
                        { step: 3, title: '由一阶导符号判断是否极值', content: '代入得一阶导近似：<br>\\(f\'(x)\\approx0+0\\cdot(x-1)+\\dfrac{3}{2}(x-1)^2=\\dfrac{3}{2}(x-1)^2\\ge0\\)<br>一阶导在 \\(x=1\\) 的两侧都是非负（同号），不改变符号 → \\(x=1\\) 不是极值点。' },
                        { step: 4, title: '结论', content: '是拐点、非极值，选 C。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：用三阶导信息判断极值/拐点（概念维度），难度对标 2025 年数一第 1 题' }
                },
                {
                    id: 'm04v2', dimension: '计算',
                    kpIds: ['GS.2.5', 'GS.2.6'], kpNames: ['极值', '拐点'],
                    chapter: 'ch02',
                    difficulty: 3,
                    question: '设 \\(f(x)=(x-1)^3(x+2)\\)，则下列说法正确的是',
                    options: [
                        'A. \\(f\\) 有极大值，无极小值',
                        'B. \\(f\\) 在 \\(x=-\\frac{5}{4}\\) 处取极小值，拐点横坐标为 \\(-\\frac{1}{2}\\) 和 1',
                        'C. \\(f\\) 在 \\(x=1\\) 处取极小值',
                        'D. \\(f\\) 无极值'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '乘积求导法则', note: '\\((uv)\'=u\'v+uv\'\\). 本题 \\(u=(x-1)^3\\)，\\(v=x+2\\)。' },
                        { name: '极值点判定', note: '驻点处若 \\(f\'\\) 变号则为极值点；偶重因子（如 \\((x-1)^2\\)）不改变符号 → 对应点不是极值点。' },
                        { name: '拐点判定', note: '令 \\(f\'\'(x)=0\\)，若 \\(f\'\'\\) 在两侧变号则是拐点横坐标。' }
                    ],
                    solution: [
                        { step: 1, title: '求一阶导（展开中间步骤）', content: '\\(f\'(x)=3(x-1)^2(x+2)+(x-1)^3\\cdot1\\)<br>提出公因子 \\((x-1)^2\\)：<br>\\(f\'(x)=(x-1)^2\\left[3(x+2)+(x-1)\\right]=(x-1)^2(3x+6+x-1)=(x-1)^2(4x+5)\\)' },
                        { step: 2, title: '求驻点', content: '令 \\(f\'(x)=0\\)：\\((x-1)^2=0\\) 得 \\(x=1\\)（偶重根）；\\(4x+5=0\\) 得 \\(x=-\\dfrac{5}{4}\\)（单根）。' },
                        { step: 3, title: '判断极值', content: '对单根 \\(x=-\\frac54\\)：\\(x<-\\frac54\\) 时 \\(4x+5<0\\)，\\(f\'<0\\)；\\(x>-\\frac54\\) 时 \\(f\'>0\\)，一阶导变号（左负右正）→ \\(x=-\\frac54\\) 是极小值点。<br>对偶重根 \\(x=1\\)：\\((x-1)^2\\ge0\\) 不改变符号，\\(x=1\\) 处 \\(f\'\\) 两侧同号 → 不是极值点。' },
                        { step: 4, title: '求二阶导（展开中间步骤）', content: '<br>\\(f\'\'(x)=\\left[(x-1)^2(4x+5)\\right]\'=2(x-1)(4x+5)+(x-1)^2\\cdot4\\)<br>提出 \\((x-1)\\)：\\(f\'\'(x)=(x-1)\\left[2(4x+5)+4(x-1)\\right]=(x-1)(8x+10+4x-4)=(x-1)(12x+6)=6(x-1)(2x+1)\\)' },
                        { step: 5, title: '判断拐点', content: '令 \\(f\'\'(x)=0\\)：\\(x=1\\) 或 \\(x=-\\dfrac12\\)。\\((x-1)\\) 与 \\((2x+1)\\) 都是单因子，在 \\(x=1\\)、\\(x=-\\frac12\\) 两侧 \\(f\'\'\\) 均变号 → 拐点横坐标为 \\(-\\frac12\\) 和 1。' },
                        { step: 6, title: '结论', content: '\\(x=-\\frac54\\) 取极小值、拐点横坐标为 \\(-\\frac12\\) 和 1，选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：具体多项式函数求极值与拐点（计算维度），难度对标 2023 年数一第 3 题' }
                },
                {
                    id: 'm04v3', dimension: '公式',
                    kpIds: ['GS.2.8'], kpNames: ['泰勒公式', '极值', '拐点'],
                    chapter: 'ch02',
                    difficulty: 3,
                    question: '设 \\(f(x)\\) 在 \\(x=0\\) 的某邻域内三阶连续可导，且 \\(f(x)=1+x^3+o(x^3)\\)，则',
                    options: [
                        'A. \\(f(0)=1\\) 是 \\(f\\) 的极小值',
                        'B. \\(f(0)=1\\) 是 \\(f\\) 的极大值',
                        'C. \\((0,1)\\) 是曲线 \\(y=f(x)\\) 的拐点，且 \\(x=0\\) 不是极值点',
                        'D. 无法确定'
                    ],
                    answer: 'C',
                    concepts: [
                        { name: '泰勒展开', note: '\\(f(x)=f(0)+f\'(0)x+\\dfrac{f\'\'(0)}{2!}x^2+\\dfrac{f\'\'\'(0)}{3!}x^3+o(x^3)\\)。' },
                        { name: '系数对应', note: '题干给出 \\(f(x)=1+x^3+o(x^3)\\)，逐项对应系数即可反推各阶导数。' },
                        { name: '极值/拐点判定', note: '由 \\(f\'(x)\\) 是否变号判极值、由 \\(f\'\'(x)\\) 是否变号判拐点。' }
                    ],
                    solution: [
                        { step: 1, title: '逐项对应泰勒系数', content: '对比 <br>\\(f(x)=f(0)+f\'(0)x+\\dfrac{f\'\'(0)}{2!}x^2+\\dfrac{f\'\'\'(0)}{3!}x^3+o(x^3)\\) 与 \\(f(x)=1+x^3+o(x^3)\\)：<br>\\(f(0)=1\\)，\\(f\'(0)=0\\)，\\(f\'\'(0)=0\\)，\\(\\dfrac{f\'\'\'(0)}{3!}=1\\ \\Rightarrow\\ f\'\'\'(0)=6\\)。' },
                        { step: 2, title: '判断极值', content: '由展开式对 \\(x\\) 求导：\\(f\'(x)=3x^2+o(x^2)\\)。在 0 的两侧 \\(f\'(x)\\ge0\\)（同号），不改变符号 → \\(x=0\\) 不是极值点。' },
                        { step: 3, title: '判断拐点', content: '再求导：\\(f\'\'(x)=6x+o(x)\\)。\\(x<0\\) 时 \\(f\'\'(x)<0\\)、\\(x>0\\) 时 \\(f\'\'(x)>0\\)，二阶导变号 → \\((0,f(0))=(0,1)\\) 是拐点。' },
                        { step: 4, title: '结论', content: '选 C。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：用泰勒展开系数反推极值/拐点（公式维度），难度对标 2023 年数一第 20 题（泰勒证明）的判定部分' }
                },
                {
                    id: 'm04v4', dimension: '创新',
                    kpIds: ['GS.2.5', 'GS.2.6', 'GS.1.3'], kpNames: ['极值', '拐点', '变限积分'],
                    chapter: 'ch02',
                    difficulty: 4,
                    question: '设 \\(F(x)=\\int_0^x(t^2-1)\\mathrm{e}^{-t^2}\\,\\mathrm{d}t\\)，则下列说法正确的是',
                    options: [
                        'A. \\(F\\) 在 \\(x=1\\) 处取极小值，在 \\(x=-1\\) 处取极大值',
                        'B. \\(F\\) 在 \\(x=1\\) 处取极大值，在 \\(x=-1\\) 处取极小值',
                        'C. \\(F\\) 在 \\(x=\\pm1\\) 处均取极小值',
                        'D. \\(F\\) 无极值点'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '变上限积分求导', note: '\\(F\'(x)=(x^2-1)\\mathrm{e}^{-x^2}\\)。' },
                        { name: '乘积求导', note: '\\(\\left[(x^2-1)\\mathrm{e}^{-x^2}\\right]\'=2x\\mathrm{e}^{-x^2}+(x^2-1)(-2x)\\mathrm{e}^{-x^2}\\)。' },
                        { name: '极值二阶判定', note: '若 \\(f\'(x_0)=0\\) 且 \\(f\'\'(x_0)>0\\) 则极小值；\\(f\'\'(x_0)<0\\) 则极大值。' }
                    ],
                    solution: [
                        { step: 1, title: '求一阶导', content: '由变上限积分求导：<br>\\(F\'(x)=(x^2-1)\\mathrm{e}^{-x^2}\\)。因 \\(\\mathrm{e}^{-x^2}>0\\) 恒成立，驻点为 \\(x^2-1=0\\)，即 \\(x=\\pm1\\)。' },
                        { step: 2, title: '求二阶导（零跳步）', content: '<br>\\(F\'\'(x)=\\left[(x^2-1)\\mathrm{e}^{-x^2}\\right]\'=2x\\mathrm{e}^{-x^2}+(x^2-1)(-2x)\\mathrm{e}^{-x^2}\\)<br>提出公因子 \\(2x\\mathrm{e}^{-x^2}\\)：<br>\\(F\'\'(x)=2x\\mathrm{e}^{-x^2}\\left[1-(x^2-1)\\right]=2x(2-x^2)\\mathrm{e}^{-x^2}\\)' },
                        { step: 3, title: '在驻点处用二阶判定', content: '<br>\\(F\'\'(1)=2\\cdot1\\cdot(2-1)\\cdot\\mathrm{e}^{-1}=\\dfrac{2}{\\mathrm{e}}>0\\) → \\(x=1\\) 处取极小值。<br>\\(F\'\'(-1)=2\\cdot(-1)\\cdot(2-1)\\cdot\\mathrm{e}^{-1}=-\\dfrac{2}{\\mathrm{e}}<0\\) → \\(x=-1\\) 处取极大值。' },
                        { step: 4, title: '结论', content: '选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：变限积分型函数 + 极值判定（创新维度，跨 ch01/ch02），难度对标 2025 年数一第 1 题' }
                }
            ]
        },

        /* ==================================================================
         * m06 · 题位 6 · 线代/选择题 · 相似对角化判定
         * 母题来源：2022 年数一第 5 题（原题，真实题面）
         * ================================================================== */
        {
            id: 'm06',
            slot: 6,
            type: '选择题',
            score: 5,
            part: '线代',
            topic: '矩阵可相似对角化的条件辨析',
            difficulty: 3,
            kpIds: ['XD.13.1', 'XD.13.2'],
            kpNames: ['特征值', '相似对角化'],
            chapter: 'ch13',
            question: '下列 4 个条件中，3 阶矩阵 \\(\\mathbf{A}\\) 可相似对角化的一个充分非必要条件是',
            options: [
                'A. \\(A\\) 有 3 个不同的特征值',
                'B. \\(A\\) 有 3 个线性无关的特征向量',
                'C. \\(A\\) 有 3 个两两线性无关的特征向量',
                'D. \\(A\\) 的属于不同特征值的特征向量相互正交'
            ],
            answer: 'A',
            concepts: [
                { name: '可对角化充要条件', note: '\\(n\\) 阶矩阵可对角化 \\(\\iff\\) 有 \\(n\\) 个线性无关的特征向量 \\(\\iff\\) 每个特征值的几何重数 = 代数重数。' },
                { name: '不同特征值的特征向量', note: '属于不同特征值的特征向量必线性无关。' },
                { name: '正交性适用范围', note: '不同特征值的特征向量相互正交只对实对称矩阵成立，一般矩阵未必。' }
            ],
            solution: [
                { step: 1, title: '回顾可对角化的充要条件', content: '可对角化 \\(\\iff\\) 存在 \\(n\\) 个线性无关的特征向量（等价说法：每个特征值 \\(\\lambda\\) 的几何重数 \\(n-\\mathrm{rank}(A-\\lambda I)\\) 等于代数重数）。这是下面逐项判断的标尺。' },
                { step: 2, title: '逐项判断 A：3 个互异特征值', content: '充分性：属于 3 个互异特征值的特征向量线性无关，正好 3 个 → \\(A\\) 可对角化。<br>非必要性：可对角化并不要求特征值互异。反例：单位阵 \\(E\\) 特征值全为 1，但 \\(E\\) 显然可对角化。<br>所以 A 是充分非必要条件，满足题意。' },
                { step: 3, title: '逐项判断 B、C', content: 'B：\\(A\\) 有 3 个线性无关特征向量，这正是可对角化的充要条件，不是“充分非必要”。<br>C：3 个“两两线性无关”等价于 3 个线性无关，与 B 相同，也是充要条件。' },
                { step: 4, title: '逐项判断 D', content: 'D：不同特征值对应的特征向量相互正交只在实对称矩阵下才成立；对一般矩阵，它们仅线性无关、未必正交。故 D 既非充分也非必要。' },
                { step: 5, title: '结论', content: '选 A。' }
            ],
            source: { rank: 1, label: '真题', detail: '2022 年数学一第 5 题（原题）' },
            variants: [
                {
                    id: 'm06v1', dimension: '概念',
                    kpIds: ['XD.13.1', 'XD.13.2'], kpNames: ['特征值', '相似对角化'],
                    chapter: 'ch13',
                    difficulty: 3,
                    question: '设 \\(A\\) 为 3 阶矩阵，则下列结论正确的是',
                    options: [
                        'A. 若 \\(A\\) 可对角化，则 \\(A\\) 必有 3 个互异的特征值',
                        'B. \\(A\\) 有 3 个线性无关的特征向量是 \\(A\\) 可对角化的充要条件',
                        'C. 若 \\(A\\) 的特征值全相等，则 \\(A\\) 一定不可对角化',
                        'D. 若 \\(A\\) 有 3 个互异的特征值，则 \\(A\\) 不可对角化'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '可对角化充要条件', note: '有 \\(n\\) 个线性无关特征向量 \\(\\iff\\) 可对角化。' },
                        { name: '反例法', note: '数量矩阵 \\(\\lambda E\\) 特征值全相等但已是对角阵（可对角化）；互异特征值必可对角化。' }
                    ],
                    solution: [
                        { step: 1, title: '判断 A', content: '可对角化不要求特征值互异。反例：\\(A=E\\)（特征值全 1）可对角化。A 错。' },
                        { step: 2, title: '判断 B', content: '\\(n\\) 个线性无关特征向量 \\(\\iff\\) 可对角化，这是充要条件本身。B 对。' },
                        { step: 3, title: '判断 C、D', content: 'C 错：\\(\\lambda E\\) 特征值全相等但可对角化。D 错：互异特征值 → 特征向量线性无关 → 必可对角化。' },
                        { step: 4, title: '结论', content: '选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：对角化条件的概念辨析（概念维度），难度对标 2022 年数一第 5 题' }
                },
                {
                    id: 'm06v2', dimension: '计算',
                    kpIds: ['XD.13.1', 'XD.13.2'], kpNames: ['特征值', '相似对角化'],
                    chapter: 'ch13',
                    difficulty: 3,
                    question: '设 \\(A=\\begin{pmatrix}2&0&0\\\\0&2&1\\\\0&0&2\\end{pmatrix}\\)，则下列说法正确的是',
                    options: [
                        'A. \\(A\\) 可相似对角化',
                        'B. \\(A\\) 不可相似对角化，且唯一特征值为 2',
                        'C. \\(A\\) 是正交矩阵',
                        'D. \\(A\\) 可对角化且相似于 \\(\\mathrm{diag}(2,2,2)\\)'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '上三角矩阵的特征值', note: '上（下）三角矩阵的特征值就是主对角元素。' },
                        { name: '几何重数', note: '特征值 \\(\\lambda\\) 的几何重数 \\(=\\dim\\ker(A-\\lambda I)=n-\\mathrm{rank}(A-\\lambda I)\\)。' },
                        { name: '对角化判定', note: '几何重数 = 代数重数（对每个特征值）才可对角化；否则不可。' }
                    ],
                    solution: [
                        { step: 1, title: '求特征值', content: '\\(A\\) 是上三角矩阵，特征值为主对角元：\\(\\lambda=2,2,2\\)，代数重数为 3。' },
                        { step: 2, title: '算 \\(A-2I\\)', content: '<br>\\(A-2I=\\begin{pmatrix}0&0&0\\\\0&0&1\\\\0&0&0\\end{pmatrix}\\)<br>非零行只有 1 行（第 2 行），故 \\(\\mathrm{rank}(A-2I)=1\\)。' },
                        { step: 3, title: '求几何重数', content: '几何重数 \\(=n-\\mathrm{rank}(A-2I)=3-1=2\\)。' },
                        { step: 4, title: '比较重数', content: '几何重数 2 \\(\\ne\\) 代数重数 3 → \\(A\\) 不可相似对角化。唯一特征值为 2，选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：具体若当块矩阵判定（计算维度），难度对标 2023 年数一第 6 题' }
                },
                {
                    id: 'm06v3', dimension: '公式',
                    kpIds: ['XD.13.2'], kpNames: ['相似对角化'],
                    chapter: 'ch13',
                    difficulty: 3,
                    question: '设 \\(A\\) 为 \\(n\\) 阶矩阵，则下列说法正确的是',
                    options: [
                        'A. 若 \\(A\\) 可对角化，则 \\(A\\) 必有 \\(n\\) 个互异的特征值',
                        'B. 若 \\(A\\) 有 \\(n\\) 个互异的特征值，则 \\(A\\) 可对角化',
                        'C. 若 \\(A\\) 的每个特征值的几何重数都等于 1，则 \\(A\\) 可对角化',
                        'D. 若 \\(A=\\lambda E\\)（\\(\\lambda\\ne0\\)），则 \\(A\\) 不可对角化'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '对角化判定公式', note: '可对角化 \\(\\iff\\) 对每个特征值 \\(\\lambda\\)，几何重数 \\(n-\\mathrm{rank}(A-\\lambda I)\\) 等于代数重数。' },
                        { name: '互异特征值推论', note: '\\(n\\) 个互异特征值 \\(\\Rightarrow\\) \\(n\\) 个线性无关特征向量 \\(\\Rightarrow\\) 可对角化。' },
                        { name: '反例：若当块', note: '2 阶若当块 \\(\\begin{pmatrix}\\lambda&1\\\\0&\\lambda\\end{pmatrix}\\) 特征值重数为 2、几何重数为 1，不可对角化。' }
                    ],
                    solution: [
                        { step: 1, title: '回顾判定公式', content: '可对角化 \\(\\iff\\) 每个特征值的几何重数等于代数重数，即 \\(n-\\mathrm{rank}(A-\\lambda I)=\\) 重数。' },
                        { step: 2, title: '判断 B', content: '\\(n\\) 个互异特征值 → 属于不同特征值的特征向量线性无关，共 \\(n\\) 个 → 可对角化。B 对。' },
                        { step: 3, title: '判断 A、C、D', content: 'A 错：可对角化不要求互异（反例 \\(E\\)）。C 错：几何重数都等于 1 但某个代数重数大于 1 时仍不可对角化（如 2 阶若当块：几何重数 1、代数重数 2）。D 错：\\(\\lambda E\\) 本身已是对角阵，显然可对角化。' },
                        { step: 4, title: '结论', content: '选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：对角化判定公式应用（公式维度），难度对标 2022 年数一第 5 题' }
                },
                {
                    id: 'm06v4', dimension: '创新',
                    kpIds: ['XD.13.1', 'XD.13.2', 'XD.10.3'], kpNames: ['特征值', '相似对角化', '矩阵的秩'],
                    chapter: 'ch13',
                    difficulty: 4,
                    question: '设 \\(A\\) 为 3 阶实对称矩阵，\\(r(A)=1\\)，\\(\\mathrm{tr}(A)=2\\)，则下列说法正确的是',
                    options: [
                        'A. \\(A\\) 可对角化，且特征值为 \\(2,0,0\\)',
                        'B. \\(A\\) 不可对角化',
                        'C. \\(A\\) 的特征值为 \\(1,1,0\\)',
                        'D. \\(A\\) 与 \\(\\mathrm{diag}(1,1,0)\\) 相似'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '实对称矩阵必可对角化', note: '实对称矩阵必可正交对角化，故必然可对角化。' },
                        { name: '特征值与秩', note: '矩阵的秩 = 非零特征值的个数（对可对角化矩阵）。' },
                        { name: '特征值与迹', note: '特征值之和等于矩阵的迹 \\(\\mathrm{tr}(A)\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '实对称 → 必可对角化', content: '实对称矩阵必可正交对角化，所以 \\(A\\) 一定可对角化，排除 B。' },
                        { step: 2, title: '由秩确定非零特征值的个数', content: '对可对角化矩阵，\\(r(A)=\\) 非零特征值的个数。\\(r(A)=1\\)，故 \\(A\\) 恰有 1 个非零特征值，设为 \\(\\lambda\\)，其余两个为 0。' },
                        { step: 3, title: '由迹确定该非零特征值', content: '特征值之和等于迹：<br>\\(\\lambda+0+0=\\mathrm{tr}(A)=2\\ \\Rightarrow\\ \\lambda=2\\)' },
                        { step: 4, title: '写出特征值与相似关系', content: '特征值为 \\(2,0,0\\)，故 \\(A\\) 与 \\(\\mathrm{diag}(2,0,0)\\) 相似。选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：串联实对称矩阵、秩、迹与特征值（创新维度，跨 ch10/ch13），难度对标 2024 年数一第 7 题' }
                }
            ]
        },

        /* ==================================================================
         * m09 · 题位 9 · 概率/选择题 · 二维正态分布数字特征
         * 母题来源：2025 年数一第 8 题（原题）
         * ================================================================== */
        {
            id: 'm09',
            slot: 9,
            type: '选择题',
            score: 5,
            part: '概率',
            topic: '二维正态分布与方差性质',
            difficulty: 3,
            kpIds: ['GL.18.2', 'GL.17.1'],
            kpNames: ['方差', '二维正态分布'],
            chapter: 'ch18',
            question: '设二维随机变量 \\((X,Y)\\) 服从正态分布 \\(N(0,0;1,1;\\rho)\\)，其中 \\(\\rho\\in(-1,1)\\)。若 \\(a,b\\) 为满足 \\(a^2+b^2=1\\) 的任意实数，则 \\(D(aX+bY)\\) 的最大值为',
            options: [
                'A. 1',
                'B. 2',
                'C. \\(1+|\\rho|\\)',
                'D. \\(1+\\rho^2\\)'
            ],
            answer: 'C',
            concepts: [
                { name: '二维正态分布的参数', note: '\\(N(\\mu_1,\\mu_2;\\sigma_1^2,\\sigma_2^2;\\rho)\\)：\\(D(X)=\\sigma_1^2\\)，\\(D(Y)=\\sigma_2^2\\)，\\(\\mathrm{Cov}(X,Y)=\\rho\\sigma_1\\sigma_2\\)。本题 \\(\\sigma_1^2=\\sigma_2^2=1\\)，故 \\(\\mathrm{Cov}(X,Y)=\\rho\\)。' },
                { name: '方差线性组合公式', note: '\\(D(aX+bY)=a^2D(X)+b^2D(Y)+2ab\\,\\mathrm{Cov}(X,Y)\\)。' },
                { name: '均值不等式', note: '\\(|ab|\\le\\dfrac{a^2+b^2}{2}\\)（\\(ab\\le\\dfrac{a^2+b^2}{2}\\)，等号当 \\(a=b\\) 时取得）。' }
            ],
            solution: [
                { step: 1, title: '读参数', content: '由 \\(N(0,0;1,1;\\rho)\\)：\\(D(X)=1\\)，\\(D(Y)=1\\)，\\(\\mathrm{Cov}(X,Y)=\\rho\\sigma_1\\sigma_2=\\rho\\)。' },
                { step: 2, title: '套方差线性组合公式', content: '<br>\\(D(aX+bY)=a^2D(X)+b^2D(Y)+2ab\\,\\mathrm{Cov}(X,Y)=a^2\\cdot1+b^2\\cdot1+2ab\\rho=a^2+b^2+2ab\\rho\\)' },
                { step: 3, title: '代入 \\(a^2+b^2=1\\)', content: '\\(D(aX+bY)=1+2ab\\rho\\)。要使它最大，需让 \\(ab\\rho\\) 尽量大。' },
                { step: 4, title: '用均值不等式求 \\(ab\\) 的范围', content: '由 \\(a^2+b^2=1\\)：\\(|ab|\\le\\dfrac{a^2+b^2}{2}=\\dfrac12\\)。<br>当 \\(\\rho>0\\) 时取 \\(ab=\\dfrac12\\)（如 \\(a=b=\\dfrac{1}{\\sqrt2}\\)）；当 \\(\\rho<0\\) 时取 \\(ab=-\\dfrac12\\)。两种情况下 \\(2ab\\rho=2\\cdot\\dfrac12\\cdot|\\rho|=|\\rho|\\)。' },
                { step: 5, title: '结论', content: '最大值为 \\(1+|\\rho|\\)，选 C。' }
            ],
            source: { rank: 1, label: '真题', detail: '2025 年数学一第 8 题（原题）' },
            variants: [
                {
                    id: 'm09v1', dimension: '概念',
                    kpIds: ['GL.17.1', 'GL.18.2'], kpNames: ['二维正态分布', '独立性'],
                    chapter: 'ch18',
                    difficulty: 3,
                    question: '设 \\((X,Y)\\) 服从二维正态分布 \\(N(\\mu_1,\\mu_2;\\sigma_1^2,\\sigma_2^2;\\rho)\\)，则下列命题正确的是',
                    options: [
                        'A. \\(X\\) 与 \\(Y\\) 相互独立当且仅当 \\(\\rho=0\\)',
                        'B. \\(X\\) 与 \\(Y\\) 一定不相关',
                        'C. 若 \\(\\rho=0\\)，则 \\(X\\) 与 \\(Y\\) 必相关',
                        'D. 相关系数 \\(\\rho=\\sigma_1/\\sigma_2\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '二维正态的独立与不相关', note: '在二维正态分布中，“独立”\\(\\iff\\)“不相关”\\(\\iff\\) \\(\\rho=0\\)。这是二维正态独有的特殊性质。' },
                        { name: '相关系数公式', note: '\\(\\rho(X,Y)=\\dfrac{\\mathrm{Cov}(X,Y)}{\\sigma_1\\sigma_2}\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '二维正态的特殊性质', content: '对二维正态分布，\\(X,Y\\) 独立 \\(\\iff\\) \\(\\rho=0\\) \\(\\iff\\) 不相关（此时联合密度可分解为两个边缘密度之积）。A 对。' },
                        { step: 2, title: '排除 B、C', content: 'B 错：只有 \\(\\rho=0\\) 才不相关，一般 \\(\\rho\\ne0\\) 时 \\(X,Y\\) 是相关的。C 错：\\(\\rho=0\\) 时独立，独立必不相关，而不是“必相关”。' },
                        { step: 3, title: '排除 D', content: '相关系数定义：\\(\\rho(X,Y)=\\dfrac{\\mathrm{Cov}(X,Y)}{\\sigma_1\\sigma_2}\\)，并非 \\(\\sigma_1/\\sigma_2\\)。D 错。' },
                        { step: 4, title: '结论', content: '选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：二维正态独立性与相关系数概念（概念维度），难度对标 2025 年数一第 8 题' }
                },
                {
                    id: 'm09v2', dimension: '计算',
                    kpIds: ['GL.18.2'], kpNames: ['方差', '协方差矩阵'],
                    chapter: 'ch18',
                    difficulty: 3,
                    question: '设 \\((X,Y)\\) 的协方差矩阵为 \\(\\begin{pmatrix}4&-1\\\\-1&9\\end{pmatrix}\\)，则 \\(D(3X-2Y)\\) 等于',
                    options: [
                        'A. 36',
                        'B. 52',
                        'C. 70',
                        'D. 84'
                    ],
                    answer: 'D',
                    concepts: [
                        { name: '协方差矩阵', note: '主对角元是方差，次对角元是协方差：\\(\\begin{pmatrix}D(X)&\\mathrm{Cov}(X,Y)\\\\ \\mathrm{Cov}(X,Y)&D(Y)\\end{pmatrix}\\)。' },
                        { name: '方差线性组合公式', note: '\\(D(aX+bY)=a^2D(X)+b^2D(Y)+2ab\\,\\mathrm{Cov}(X,Y)\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '从协方差矩阵读参数', content: '主对角元是方差：\\(D(X)=4\\)，\\(D(Y)=9\\)；次对角元是协方差：\\(\\mathrm{Cov}(X,Y)=-1\\)。' },
                        { step: 2, title: '写出方差公式并代入', content: '方差线性组合公式 \\(D(aX+bY)=a^2D(X)+b^2D(Y)+2ab\\,\\mathrm{Cov}(X,Y)\\)，这里 \\(a=3\\)、\\(b=-2\\)：<br>\\(D(3X-2Y)=3^2\\cdot4+(-2)^2\\cdot9+2\\cdot3\\cdot(-2)\\cdot(-1)\\)' },
                        { step: 3, title: '逐项计算（注意符号）', content: '<br>\\(=9\\times4+4\\times9+12=36+36+12=84\\)<br>关键点：\\(b=-2\\) 时 \\(b^2=4\\)；交叉项 \\(2ab\\,\\mathrm{Cov}=2\\cdot3\\cdot(-2)\\cdot(-1)=+12\\)（\\(b\\) 的负号与 \\(\\mathrm{Cov}=-1\\) 的负号相乘为正）。' },
                        { step: 4, title: '结论', content: '选 D。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：由协方差矩阵计算线性组合方差（计算维度），难度对标 2024 年数一第 9 题' }
                },
                {
                    id: 'm09v3', dimension: '公式',
                    kpIds: ['GL.18.2', 'GL.18.1'], kpNames: ['方差', '期望'],
                    chapter: 'ch18',
                    difficulty: 2,
                    question: '设随机变量 \\(X\\) 与 \\(Y\\) 相互独立，\\(D(X)=2\\)，\\(D(Y)=3\\)，则 \\(D(2X-Y+1)\\) 等于',
                    options: [
                        'A. 11',
                        'B. 7',
                        'C. 12',
                        'D. 8'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '方差与常数', note: '加常数对方差无影响：\\(D(X+c)=D(X)\\)。' },
                        { name: '独立 ⇒ 协方差为 0', note: '若 \\(X\\) 与 \\(Y\\) 独立，则 \\(\\mathrm{Cov}(X,Y)=0\\)。' },
                        { name: '方差公式', note: '\\(D(aX+bY)=a^2D(X)+b^2D(Y)\\)（独立时）。' }
                    ],
                    solution: [
                        { step: 1, title: '去掉常数', content: '方差与位置参数无关：\\(D(2X-Y+1)=D(2X-Y)\\)（常数 1 平移不影响波动大小）。' },
                        { step: 2, title: '利用独立消去协方差', content: '\\(X,Y\\) 独立 \\(\\Rightarrow \\mathrm{Cov}(X,Y)=0\\)，于是方差公式中交叉项消失：<br>\\(D(2X-Y)=2^2D(X)+(-1)^2D(Y)\\)' },
                        { step: 3, title: '代入数值计算', content: '<br>\\(D(2X-Y)=4\\times2+1\\times3=8+3=11\\)' },
                        { step: 4, title: '结论', content: '选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：方差性质公式直接应用（公式维度），难度偏低，对标 2021 年数一第 16 题' }
                },
                {
                    id: 'm09v4', dimension: '创新',
                    kpIds: ['GL.18.2', 'GL.18.3'], kpNames: ['方差', '相关系数'],
                    chapter: 'ch18',
                    difficulty: 3,
                    question: '设随机变量 \\(X,Y\\) 满足 \\(D(X)=9\\)，\\(D(Y)=4\\)，\\(D(X+Y)=7\\)，则 \\(X\\) 与 \\(Y\\) 的相关系数 \\(\\rho(X,Y)\\) 等于',
                    options: [
                        'A. \\(\\dfrac{1}{2}\\)',
                        'B. \\(-\\dfrac{1}{2}\\)',
                        'C. \\(-\\dfrac{3}{4}\\)',
                        'D. \\(\\dfrac{3}{4}\\)'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '\\(D(X\\pm Y)\\) 公式', note: '\\(D(X+Y)=D(X)+D(Y)+2\\mathrm{Cov}(X,Y)\\)。' },
                        { name: '相关系数公式', note: '\\(\\rho(X,Y)=\\dfrac{\\mathrm{Cov}(X,Y)}{\\sqrt{D(X)}\\sqrt{D(Y)}}\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '写出 \\(D(X+Y)\\) 的展开公式', content: '<br>\\(D(X+Y)=D(X)+D(Y)+2\\mathrm{Cov}(X,Y)\\)<br>这是由 \\(D(X+Y)=E[(X+Y)^2]-[E(X+Y)]^2\\) 展开得到的常用公式。' },
                        { step: 2, title: '代入已知值解出协方差', content: '<br>\\(7=9+4+2\\mathrm{Cov}(X,Y)\\)<br>\\(\\Rightarrow 2\\mathrm{Cov}(X,Y)=7-13=-6\\ \\Rightarrow\\ \\mathrm{Cov}(X,Y)=-3\\)' },
                        { step: 3, title: '套相关系数公式', content: '<br>\\(\\rho(X,Y)=\\dfrac{\\mathrm{Cov}(X,Y)}{\\sqrt{D(X)}\\sqrt{D(Y)}}=\\dfrac{-3}{\\sqrt9\\sqrt4}=\\dfrac{-3}{3\\times2}=-\\dfrac12\\)' },
                        { step: 4, title: '结论', content: '选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：方差与相关系数互推（创新维度），难度对标 2022 年数一第 10 题' }
                }
            ]
        },

        /* ==================================================================
         * m13 · 题位 13 · 高数/填空题 · 二重积分交换次序
         * 母题来源：2025 年数一第 4 题（交换积分次序，原为选择题，改编为填空题形式）
         * ================================================================== */
        {
            id: 'm13',
            slot: 13,
            type: '填空题',
            score: 5,
            part: '高数',
            topic: '二重积分交换积分次序',
            difficulty: 3,
            kpIds: ['GS.6.2', 'GS.6.3'],
            kpNames: ['二重积分', '积分次序'],
            chapter: 'ch06',
            question: '设函数 \\(f(x,y)\\) 连续，将二次积分 \\(\\int_{-2}^{2}\\mathrm{d}x\\int_{4-x^2}^{4}f(x,y)\\,\\mathrm{d}y\\) 交换积分次序，结果为 \\_\\_\\_\\_\\_\\_\\_\\_。',
            options: [],
            answer: '\\(\\displaystyle\\int_0^4\\mathrm{d}y\\left[\\int_{-2}^{-\\sqrt{4-y}}f(x,y)\\,\\mathrm{d}x+\\int_{\\sqrt{4-y}}^{2}f(x,y)\\,\\mathrm{d}x\\right]\\)',
            concepts: [
                { name: '化累次积分为区域', note: '\\(\\int_a^b\\mathrm{d}x\\int_{g_1(x)}^{g_2(x)}f\\,\\mathrm{d}y\\) 对应区域 \\(D=\\{(x,y)\\mid a\\le x\\le b,\\ g_1(x)\\le y\\le g_2(x)\\}\\)。' },
                { name: '交换次序的步骤', note: '① 画出区域（或由不等式推区域）→ ② 固定另一变量，反解变量的范围 → ③ 确定新变量的变化区间。' },
                { name: '抛物线求反函数', note: '由 \\(y=4-x^2\\) 反解：\\(x^2=4-y\\)，\\(x=\\pm\\sqrt{4-y}\\)（需 \\(y\\le4\\)）。' }
            ],
            solution: [
                { step: 1, title: '由积分限读出区域', content: '由 \\(-2\\le x\\le2\\)、\\(4-x^2\\le y\\le4\\) 得区域<br>\\(D=\\{(x,y)\\mid -2\\le x\\le2,\\ 4-x^2\\le y\\le4\\}\\)<br>即抛物线 \\(y=4-x^2\\) 上方、直线 \\(y=4\\) 下方的区域（抛物线顶点 \\((0,4)\\)，与 \\(x\\) 轴交于 \\((\\pm2,0)\\)）。' },
                { step: 2, title: '固定 \\(y\\)，由不等式反解 \\(x\\)', content: '区域在抛物线上方，即 \\(y\\ge4-x^2\\)，移项得 \\(x^2\\ge4-y\\)，开方得 \\(|x|\\ge\\sqrt{4-y}\\)（两段：\\(x\\le-\\sqrt{4-y}\\) 或 \\(x\\ge\\sqrt{4-y}\\)）。' },
                { step: 3, title: '确定 \\(y\\) 的范围与 \\(x\\) 的最终区间', content: '由 \\(4-y\\ge0\\) 得 \\(0\\le y\\le4\\)（\\(y\\) 的最大值 4 来自上边界直线 \\(y=4\\)）。再结合 \\(|x|\\le2\\)，对固定的 \\(y\\in[0,4]\\)：<br>\\(-2\\le x\\le-\\sqrt{4-y}\\) 或 \\(\\sqrt{4-y}\\le x\\le2\\)' },
                { step: 4, title: '写出换序后的积分', content: '两段 \\(x\\) 区间分别积分后相加：<br>\\(\\displaystyle\\int_0^4\\mathrm{d}y\\left[\\int_{-2}^{-\\sqrt{4-y}}f(x,y)\\,\\mathrm{d}x+\\int_{\\sqrt{4-y}}^{2}f(x,y)\\,\\mathrm{d}x\\right]\\)' }
            ],
            source: { rank: 1, label: '真题', detail: '改编自 2025 年数学一第 4 题（原为选择题，改为填空题形式）' },
            variants: [
                {
                    id: 'm13v1', dimension: '概念',
                    kpIds: ['GS.6.2'], kpNames: ['二重积分'],
                    chapter: 'ch06',
                    difficulty: 3,
                    question: '设 \\(D\\) 由曲线 \\(y=x^2\\) 与直线 \\(y=x\\) 围成，将 \\(\\iint_D f(x,y)\\,\\mathrm{d}\\sigma\\) 先对 \\(x\\) 后对 \\(y\\) 积分（交换次序后）应为',
                    options: [
                        'A. \\(\\displaystyle\\int_0^1\\mathrm{d}y\\int_{y}^{\\sqrt{y}}f(x,y)\\,\\mathrm{d}x\\)',
                        'B. \\(\\displaystyle\\int_0^1\\mathrm{d}y\\int_{\\sqrt{y}}^{y}f(x,y)\\,\\mathrm{d}x\\)',
                        'C. \\(\\displaystyle\\int_0^1\\mathrm{d}y\\int_{y}^{y^2}f(x,y)\\,\\mathrm{d}x\\)',
                        'D. \\(\\displaystyle\\int_0^1\\mathrm{d}y\\int_{0}^{y}f(x,y)\\,\\mathrm{d}x\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '区域描述', note: '由 \\(y=x^2\\) 与 \\(y=x\\) 围成的区域可写成 \\(0\\le x\\le1\\)，\\(x^2\\le y\\le x\\)。' },
                        { name: '反解不等式', note: '固定 \\(y\\) 时：\\(y\\le x\\) 得 \\(x\\ge y\\)；\\(x^2\\le y\\) 得 \\(x\\le\\sqrt{y}\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '求交点并写出原区域', content: '联立 \\(y=x^2\\) 与 \\(y=x\\)：\\(x^2=x\\Rightarrow x(x-1)=0\\Rightarrow x=0,1\\)，交点 \\((0,0),(1,1)\\)。区域<br>\\(D=\\{(x,y)\\mid 0\\le x\\le1,\\ x^2\\le y\\le x\\}\\)' },
                        { step: 2, title: '固定 \\(y\\)，由 \\(x^2\\le y\\) 反解上限', content: '由 \\(x^2\\le y\\) 得 \\(|x|\\le\\sqrt{y}\\)，结合 \\(x\\ge0\\) 得 \\(x\\le\\sqrt{y}\\)（这是 \\(x\\) 的上限）。' },
                        { step: 3, title: '由 \\(y\\le x\\) 反解下限，并定 \\(y\\) 的范围', content: '由 \\(y\\le x\\) 得 \\(x\\ge y\\)（这是 \\(x\\) 的下限）。两曲线纵坐标的公共范围为 \\(0\\le y\\le1\\)。故对固定的 \\(y\\)：\\(y\\le x\\le\\sqrt{y}\\)。' },
                        { step: 4, title: '写出换序后的积分', content: '<br>\\(\\displaystyle\\int_0^1\\mathrm{d}y\\int_y^{\\sqrt{y}}f(x,y)\\,\\mathrm{d}x\\)<br>选 A（B 把上下限写反了）。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：二次函数与直线围成区域的换序（概念维度），难度对标 2025 年数一第 4 题' }
                },
                {
                    id: 'm13v2', dimension: '计算',
                    kpIds: ['GS.6.2'], kpNames: ['二重积分'],
                    chapter: 'ch06',
                    difficulty: 3,
                    question: '计算 \\(\\displaystyle\\iint_D x\\,\\mathrm{d}\\sigma\\)，其中 \\(D\\) 由曲线 \\(y=x^2\\) 与直线 \\(y=x\\) 围成。',
                    options: [],
                    answer: '\\(\\dfrac{1}{12}\\)',
                    concepts: [
                        { name: '化二重积分为累次积分', note: '\\(\\iint_D f(x,y)\\,\\mathrm{d}\\sigma=\\int_a^b\\mathrm{d}x\\int_{g_1(x)}^{g_2(x)}f(x,y)\\,\\mathrm{d}y\\)。' },
                        { name: '定积分计算', note: '\\(\\int(x^2-x^3)\\,\\mathrm{d}x=\\dfrac{x^3}{3}-\\dfrac{x^4}{4}+C\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '定区域', content: '交点：\\(x^2=x\\Rightarrow x=0,1\\)。区域 \\(D=\\{(x,y)\\mid0\\le x\\le1,\\ x^2\\le y\\le x\\}\\)。' },
                        { step: 2, title: '化为累次积分（先对 y）', content: '<br>\\(\\displaystyle\\iint_D x\\,\\mathrm{d}\\sigma=\\int_0^1\\mathrm{d}x\\int_{x^2}^{x}x\\,\\mathrm{d}y\\)' },
                        { step: 3, title: '计算内层积分（视 \\(x\\) 为常数）', content: '<br>\\(\\displaystyle\\int_{x^2}^{x}x\\,\\mathrm{d}y=x\\cdot y\\Big|_{y=x^2}^{y=x}=x(x-x^2)=x^2-x^3\\)<br>注意：对 \\(y\\) 积分时 \\(x\\) 是常数，\\(\\int x\\,\\mathrm{d}y=xy\\)。' },
                        { step: 4, title: '再对 \\(x\\) 积分', content: '<br>\\(\\displaystyle\\int_0^1(x^2-x^3)\\,\\mathrm{d}x=\\left.\\left(\\dfrac{x^3}{3}-\\dfrac{x^4}{4}\\right)\\right|_0^1=\\dfrac13-\\dfrac14=\\dfrac{1}{12}\\)' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：具体二重积分计算（计算维度），难度对标 2024 年数一第 17 题（二重积分计算）' }
                },
                {
                    id: 'm13v3', dimension: '公式',
                    kpIds: ['GS.6.2', 'GS.6.3'], kpNames: ['二重积分', '极坐标'],
                    chapter: 'ch06',
                    difficulty: 3,
                    question: '利用极坐标换元计算 \\(\\displaystyle\\iint_D\\sqrt{x^2+y^2}\\,\\mathrm{d}\\sigma\\)，其中 \\(D\\) 为圆域 \\(x^2+y^2\\le4\\) 在第一象限的部分。',
                    options: [],
                    answer: '\\(\\dfrac{4\\pi}{3}\\)',
                    concepts: [
                        { name: '极坐标换元公式', note: '\\(\\iint_D f(x,y)\\,\\mathrm{d}\\sigma=\\iint_{D\'}f(r\\cos\\theta,r\\sin\\theta)\\cdot r\\,\\mathrm{d}r\\mathrm{d}\\theta\\)，雅可比行列式为 \\(r\\)。' },
                        { name: '圆的极坐标方程', note: '\\(x^2+y^2=r^2\\le4\\) 即 \\(0\\le r\\le2\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '转化区域与被积函数', content: '第一象限四分之一圆：\\(0\\le\\theta\\le\\dfrac{\\pi}{2}\\)，\\(0\\le r\\le2\\)。<br>被积函数 \\(\\sqrt{x^2+y^2}=\\sqrt{r^2}=r\\)（因 \\(r\\ge0\\)），面积元 \\(\\mathrm{d}\\sigma=r\\,\\mathrm{d}r\\mathrm{d}\\theta\\)。' },
                        { step: 2, title: '代入极坐标换元公式', content: '<br>\\(\\displaystyle\\iint_D\\sqrt{x^2+y^2}\\,\\mathrm{d}\\sigma=\\int_0^{\\frac{\\pi}{2}}\\mathrm{d}\\theta\\int_0^{2}r\\cdot r\\,\\mathrm{d}r\\)<br>两个 \\(r\\)：一个来自 \\(\\sqrt{x^2+y^2}=r\\)，一个来自面积元 \\(\\mathrm{d}\\sigma=r\\,\\mathrm{d}r\\mathrm{d}\\theta\\)，故被积函数是 \\(r^2\\)。' },
                        { step: 3, title: '分离变量', content: '被积函数 \\(r^2\\) 与 \\(\\theta\\) 无关，积分可分离：<br>\\(=\\left(\\int_0^{\\frac{\\pi}{2}}\\mathrm{d}\\theta\\right)\\left(\\int_0^{2}r^2\\,\\mathrm{d}r\\right)=\\dfrac{\\pi}{2}\\cdot\\left.\\dfrac{r^3}{3}\\right|_0^{2}\\)' },
                        { step: 4, title: '算出结果', content: '<br>\\(\\dfrac{\\pi}{2}\\cdot\\dfrac{2^3}{3}=\\dfrac{\\pi}{2}\\cdot\\dfrac{8}{3}=\\dfrac{4\\pi}{3}\\)' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：极坐标换元公式应用（公式维度），难度对标 2022 年数一第 13 题（二重积分）' }
                },
                {
                    id: 'm13v4', dimension: '创新',
                    kpIds: ['GS.6.2', 'GS.6.1'], kpNames: ['二重积分', '对称性'],
                    chapter: 'ch06',
                    difficulty: 3,
                    question: '设 \\(D\\) 为圆域 \\(x^2+y^2\\le1\\) 在第一象限的部分，利用极坐标与对称性计算 \\(\\displaystyle\\iint_D xy\\,\\mathrm{d}\\sigma\\)，其值为',
                    options: [
                        'A. \\(\\dfrac{1}{8}\\)',
                        'B. \\(\\dfrac{1}{4}\\)',
                        'C. \\(\\dfrac{1}{16}\\)',
                        'D. \\(\\dfrac{1}{2}\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '极坐标下的 \\(x,y\\)', note: '\\(x=r\\cos\\theta\\)，\\(y=r\\sin\\theta\\)，故 \\(xy=r^2\\cos\\theta\\sin\\theta\\)。' },
                        { name: '积分的变量分离', note: '若被积函数可写成 \\(g(\\theta)\\cdot h(r)\\)，则 \\(\\iint=\\left(\\int g\\,\\mathrm{d}\\theta\\right)\\left(\\int h\\,\\mathrm{d}r\\right)\\)。' },
                        { name: '基本积分', note: '\\(\\int\\cos\\theta\\sin\\theta\\,\\mathrm{d}\\theta=\\dfrac{\\sin^2\\theta}{2}+C\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '极坐标转化', content: '\\(D\\)：\\(0\\le\\theta\\le\\dfrac{\\pi}{2}\\)，\\(0\\le r\\le1\\)。代入 \\(x=r\\cos\\theta\\)、\\(y=r\\sin\\theta\\)、\\(\\mathrm{d}\\sigma=r\\,\\mathrm{d}r\\mathrm{d}\\theta\\)：<br>\\(xy\\,\\mathrm{d}\\sigma=r^2\\cos\\theta\\sin\\theta\\cdot r\\,\\mathrm{d}r\\mathrm{d}\\theta=r^3\\cos\\theta\\sin\\theta\\,\\mathrm{d}r\\mathrm{d}\\theta\\)' },
                        { step: 2, title: '分离变量为两个单积分', content: '被积函数 \\(r^3\\cos\\theta\\sin\\theta\\) 可写成 \\((\\cos\\theta\\sin\\theta)\\cdot r^3\\)，故<br>\\(\\displaystyle\\iint_D xy\\,\\mathrm{d}\\sigma=\\int_0^{\\frac{\\pi}{2}}\\cos\\theta\\sin\\theta\\,\\mathrm{d}\\theta\\cdot\\int_0^{1}r^3\\,\\mathrm{d}r\\)' },
                        { step: 3, title: '分别计算两个积分', content: '① 对 \\(\\theta\\)：\\(\\int\\cos\\theta\\sin\\theta\\,\\mathrm{d}\\theta=\\dfrac{\\sin^2\\theta}{2}\\)，故<br>\\(\\left[\\dfrac{\\sin^2\\theta}{2}\\right]_0^{\\frac{\\pi}{2}}=\\dfrac12-0=\\dfrac12\\)<br>② 对 \\(r\\)：\\(\\left.\\dfrac{r^4}{4}\\right|_0^{1}=\\dfrac14\\)' },
                        { step: 4, title: '相乘得结果', content: '原式 \\(=\\dfrac12\\times\\dfrac14=\\dfrac18\\)，选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：极坐标 + 变量分离 + 对称性综合（创新维度），难度对标 2022 年数一第 13 题' }
                }
            ]
        },

        /* ==================================================================
         * m17 · 题位 17 · 高数/解答题 · 极限计算（洛必达/泰勒）
         * 母题来源：2021 年数一第 17 题（原题）
         * ================================================================== */
        {
            id: 'm17',
            slot: 17,
            type: '解答题',
            score: 12,
            part: '高数',
            topic: '极限计算：通分 + 变限积分 + 泰勒/等价无穷小',
            difficulty: 3,
            kpIds: ['GS.1.3'],
            kpNames: ['极限', '洛必达', '泰勒公式'],
            chapter: 'ch01',
            question: '求极限 \\(\\displaystyle\\lim_{x\\to0}\\left(\\frac{1+\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t}{\\mathrm{e}^x-1}-\\frac{1}{\\sin x}\\right)\\)',
            options: [],
            answer: '\\(\\dfrac{1}{2}\\)',
            concepts: [
                { name: '通分', note: '两分数相减先化为一个分数：\\(\\dfrac{A}{B}-\\dfrac{C}{D}=\\dfrac{AD-BC}{BD}\\)。' },
                { name: '等价无穷小', note: '\\(x\\to0\\) 时 \\(\\mathrm{e}^x-1\\sim x\\)、\\(\\sin x\\sim x\\)（只用于乘除因子）。' },
                { name: '泰勒展开', note: '\\(\\mathrm{e}^x=1+x+\\dfrac{x^2}{2}+\\dfrac{x^3}{6}+o(x^3)\\)；\\(\\sin x=x-\\dfrac{x^3}{6}+o(x^3)\\)。' },
                { name: '变上限积分逐项积分', note: '由 \\(\\mathrm{e}^{t^2}=1+t^2+o(t^2)\\) 得 \\(\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t=x+\\dfrac{x^3}{3}+o(x^3)\\)。' }
            ],
            solution: [
                { step: 1, title: '通分合并成一个分式', content: '<br>\\(\\displaystyle\\frac{1+\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t}{\\mathrm{e}^x-1}-\\frac{1}{\\sin x}=\\frac{\\left(1+\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t\\right)\\sin x-(\\mathrm{e}^x-1)}{(\\mathrm{e}^x-1)\\sin x}\\)' },
                { step: 2, title: '分母用等价无穷小', content: '当 \\(x\\to0\\)：\\(\\mathrm{e}^x-1\\sim x\\)，\\(\\sin x\\sim x\\)，故分母 \\(\\sim x\\cdot x=x^2\\)。' },
                { step: 3, title: '分子展开：三个关键展开（零跳步）', content: '① \\(\\displaystyle\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t=\\int_0^x(1+t^2+o(t^2))\\,\\mathrm{d}t=x+\\dfrac{x^3}{3}+o(x^3)\\)<br>② \\(\\mathrm{e}^x-1=x+\\dfrac{x^2}{2}+\\dfrac{x^3}{6}+o(x^3)\\)<br>③ \\(\\sin x=x-\\dfrac{x^3}{6}+o(x^3)\\)' },
                { step: 4, title: '代入并保留到 \\(x^3\\)（关键一步）', content: '先算 \\(\\left(1+\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t\\right)\\sin x\\)：<br>\\(=\\left(1+x+\\dfrac{x^3}{3}+o(x^3)\\right)\\left(x-\\dfrac{x^3}{6}+o(x^3)\\right)\\)<br>\\(=x-\\dfrac{x^3}{6}+x^2+o(x^3)+\\dfrac{x^3}{3}+o(x^3)\\)<br>\\(=x+x^2+\\left(-\\dfrac16+\\dfrac13\\right)x^3+o(x^3)=x+x^2+\\dfrac{x^3}{6}+o(x^3)\\)<br>再减去 \\(\\mathrm{e}^x-1=x+\\dfrac{x^2}{2}+\\dfrac{x^3}{6}+o(x^3)\\)：<br>分子 \\(=\\left(x+x^2+\\dfrac{x^3}{6}\\right)-\\left(x+\\dfrac{x^2}{2}+\\dfrac{x^3}{6}\\right)+o(x^3)=\\dfrac{x^2}{2}+o(x^3)\\)' },
                { step: 5, title: '取极限', content: '<br>\\(\\displaystyle\\lim_{x\\to0}\\frac{\\dfrac{x^2}{2}+o(x^3)}{x^2}=\\dfrac12\\)' }
            ],
            source: { rank: 1, label: '真题', detail: '2021 年数学一第 17 题（原题）' },
            variants: [
                {
                    id: 'm17v1', dimension: '概念',
                    kpIds: ['GS.1.3'], kpNames: ['极限', '等价无穷小'],
                    chapter: 'ch01',
                    difficulty: 3,
                    question: '关于等价无穷小替换，下列做法正确的是',
                    options: [
                        'A. \\(\\displaystyle\\lim_{x\\to0}\\frac{\\ln(1+x)-x}{x^2}=\\lim_{x\\to0}\\frac{x-x}{x^2}=0\\)',
                        'B. \\(\\displaystyle\\lim_{x\\to0}\\frac{\\sin x-x}{x^3}\\) 不满足洛必达法则条件，不能用洛必达',
                        'C. 等价无穷小替换只能在乘除因子中进行，加减法中的替换可能出错',
                        'D. \\(\\mathrm{e}^x-1\\sim x\\) 对任意实数 \\(x\\) 恒成立'
                    ],
                    answer: 'C',
                    concepts: [
                        { name: '等价无穷小替换原则', note: '等价无穷小只能在“乘除因子”中替换；在加减法中直接替换会丢失高阶项，导致错误。' },
                        { name: '洛必达法则条件', note: '0/0 型（或 ∞/∞），且在去心邻域内分子分母可导、分母导数不为 0。' }
                    ],
                    solution: [
                        { step: 1, title: '分析 A（加减法替换的错误示范）', content: '\\(\\ln(1+x)\\sim x\\)，在 \\(\\ln(1+x)-x\\) 这种“和差”中直接替换会丢失 \\(-\\frac{x^2}{2}\\) 这一主项。真实结果：\\(\\lim\\dfrac{\\ln(1+x)-x}{x^2}=-\\dfrac12\\ne0\\)。A 错。' },
                        { step: 2, title: '分析 B', content: '\\(\\sin x-x\\) 与 \\(x^3\\) 在 \\(x=0\\) 处均为 0，是 0/0 型，满足洛必达条件，可以用（结果 \\(-\\frac16\\)）。B 错。' },
                        { step: 3, title: '分析 C、D', content: 'C 对：替换须针对整个乘除因子，加减法中替换常出错。D 错：\\(\\mathrm{e}^x-1\\sim x\\) 仅在 \\(x\\to0\\) 时成立。' },
                        { step: 4, title: '结论', content: '选 C。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：等价无穷小替换原则辨析（概念维度），难度对标 2025 年数一第 11 题' }
                },
                {
                    id: 'm17v2', dimension: '计算',
                    kpIds: ['GS.1.3'], kpNames: ['极限', '变限积分'],
                    chapter: 'ch01',
                    difficulty: 3,
                    question: '求极限 \\(\\displaystyle\\lim_{x\\to0}\\frac{\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t-x}{x^3}\\)',
                    options: [],
                    answer: '\\(\\dfrac{1}{3}\\)',
                    concepts: [
                        { name: '先变形再判断', note: '\\(\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t-x=\\int_0^x(\\mathrm{e}^{t^2}-1)\\,\\mathrm{d}t\\)（把 \\(x\\) 移进积分号）。' },
                        { name: '等价无穷小 + 积分', note: '被积函数 \\(\\mathrm{e}^{t^2}-1\\sim t^2\\) 可替换后再积分，或用洛必达。' }
                    ],
                    solution: [
                        { step: 1, title: '变形（把常数 \\(x\\) 写进积分号）', content: '原式分子 \\(\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t-x=\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t-\\int_0^x1\\,\\mathrm{d}t=\\int_0^x(\\mathrm{e}^{t^2}-1)\\,\\mathrm{d}t\\)。' },
                        { step: 2, title: '方法一：对被积函数用等价无穷小', content: '当 \\(t\\to0\\) 时 \\(\\mathrm{e}^{t^2}-1\\sim t^2\\)，替换后：<br>\\(\\displaystyle\\int_0^x(\\mathrm{e}^{t^2}-1)\\,\\mathrm{d}t\\sim\\int_0^x t^2\\,\\mathrm{d}t\\)' },
                        { step: 3, title: '积分并求极限', content: '<br>\\(\\displaystyle\\int_0^x t^2\\,\\mathrm{d}t=\\left.\\dfrac{t^3}{3}\\right|_0^x=\\dfrac{x^3}{3}\\)<br>故原式 \\(=\\dfrac{x^3/3}{x^3}=\\dfrac13\\)。' },
                        { step: 4, title: '方法二（验证）：洛必达', content: '0/0 型，对分子、分母求导：<br>\\(\\lim_{x\\to0}\\dfrac{\\mathrm{e}^{x^2}-1}{3x^2}=\\lim_{x\\to0}\\dfrac{x^2}{3x^2}=\\dfrac13\\)<br>两种方法结果一致。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：变限积分型极限计算（计算维度），难度对标 2021 年数一第 17 题' }
                },
                {
                    id: 'm17v3', dimension: '公式',
                    kpIds: ['GS.1.3', 'GS.2.8'], kpNames: ['极限', '泰勒公式'],
                    chapter: 'ch01',
                    difficulty: 3,
                    question: '利用泰勒展开求极限 \\(\\displaystyle\\lim_{x\\to0}\\frac{\\tan x-x}{x^3}\\)，其值为',
                    options: [
                        'A. \\(\\dfrac{1}{3}\\)',
                        'B. \\(\\dfrac{1}{2}\\)',
                        'C. 1',
                        'D. 0'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: 'tan 的泰勒展开', note: '\\(\\tan x=x+\\dfrac{x^3}{3}+\\dfrac{2x^5}{15}+o(x^5)\\)。' },
                        { name: '泰勒展开求极限', note: '展开到分子分母能约去的最低阶，再取极限。' }
                    ],
                    solution: [
                        { step: 1, title: '回忆并写出 \\(\\tan x\\) 的泰勒展开', content: '<br>\\(\\tan x=x+\\dfrac{x^3}{3}+\\dfrac{2x^5}{15}+o(x^5)\\)<br>（由 \\(\\tan x\\) 在 0 处展开，奇数项系数：\\(1,\\frac13,\\frac{2}{15},\\cdots\\)）' },
                        { step: 2, title: '相减并取主项', content: '<br>\\(\\tan x-x=\\left(x+\\dfrac{x^3}{3}+o(x^3)\\right)-x=\\dfrac{x^3}{3}+o(x^3)\\)<br>常数项 \\(x\\) 与 \\(-x\\) 抵消，最低阶保留项为 \\(\\dfrac{x^3}{3}\\)。' },
                        { step: 3, title: '代入极限并化简', content: '<br>\\(\\displaystyle\\lim_{x\\to0}\\frac{\\tan x-x}{x^3}=\\lim_{x\\to0}\\frac{\\dfrac{x^3}{3}+o(x^3)}{x^3}=\\dfrac13\\)' },
                        { step: 4, title: '结论', content: '选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：泰勒公式求极限（公式维度），难度对标 2023 年数一第 20 题（泰勒证明）的基础部分' }
                },
                {
                    id: 'm17v4', dimension: '创新',
                    kpIds: ['GS.1.3', 'GS.2.1'], kpNames: ['极限', '导数定义'],
                    chapter: 'ch01',
                    difficulty: 4,
                    question: '设 \\(f(x)\\) 在 \\(x=0\\) 处连续，且 \\(\\displaystyle\\lim_{x\\to0}\\frac{f(x)}{x}=1\\)，则 \\(\\displaystyle\\lim_{x\\to0}\\frac{\\int_0^x f(t)\\,\\mathrm{d}t}{x^2}\\) 等于',
                    options: [
                        'A. \\(\\dfrac{1}{2}\\)',
                        'B. 1',
                        'C. \\(\\dfrac{1}{3}\\)',
                        'D. 不存在'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '导数定义', note: '\\(\\lim\\limits_{x\\to0}\\dfrac{f(x)-f(0)}{x-0}=f\'(0)\\)。由 \\(\\lim\\frac{f(x)}{x}=1\\) 且连续，得 \\(f(0)=0\\)、\\(f\'(0)=1\\)，即 \\(f(x)=x+o(x)\\)。' },
                        { name: '洛必达法则', note: '0/0 型：\\(\\lim\\dfrac{\\int_0^x f(t)\\,\\mathrm{d}t}{x^2}=\\lim\\dfrac{f(x)}{2x}\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '由连续性推出 \\(f(0)=0\\)', content: '由 \\(\\lim_{x\\to0}\\dfrac{f(x)}{x}=1\\) 存在且有限：分母 \\(x\\to0\\)，分子必须 \\(f(x)\\to0\\)；又 \\(f\\) 在 0 处连续，故 \\(f(0)=0\\)。' },
                        { step: 2, title: '由极限值推出 \\(f\'(0)=1\\)', content: '导数定义：<br>\\(f\'(0)=\\lim_{x\\to0}\\dfrac{f(x)-f(0)}{x}=\\lim_{x\\to0}\\dfrac{f(x)}{x}=1\\)<br>即 \\(f(x)=x+o(x)\\)。' },
                        { step: 3, title: '洛必达', content: '分子 \\(\\int_0^x f(t)\\,\\mathrm{d}t\\to0\\)、分母 \\(x^2\\to0\\)，是 0/0 型：<br>\\(\\displaystyle\\lim_{x\\to0}\\frac{\\int_0^x f(t)\\,\\mathrm{d}t}{x^2}=\\lim_{x\\to0}\\frac{f(x)}{2x}\\)<br>（分子对 \\(x\\) 求导：变上限积分求导得 \\(f(x)\\)；分母求导得 \\(2x\\)。）' },
                        { step: 4, title: '代入已知极限', content: '<br>\\(=\\dfrac12\\lim_{x\\to0}\\dfrac{f(x)}{x}=\\dfrac12\\cdot1=\\dfrac12\\)<br>选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：串联导数定义与变限积分极限（创新维度，跨 ch01/ch02），难度对标 2024 年数一第 4 题' }
                }
            ]
        },
        /* ==================================================================
         * m02 · 题位 2 · 高数/选择题 · 导数定义与可导性
         * 母题来源：2024 年数一第 4 题（原题）
         * ================================================================== */
        {
            id: 'm02',
            slot: 2,
            type: '选择题',
            score: 5,
            part: '高数',
            topic: '导数定义与可导性',
            difficulty: 3,
            kpIds: ['GS.2.1'],
            kpNames: ['导数定义'],
            chapter: 'ch02',
            question: '设函数 \\(f(x)\\) 在区间 \\((-1,1)\\) 内有定义，\\(\\displaystyle\\lim_{x\\to0}f(x)=0\\)，则',
            options: [
                'A. 当 \\(\\displaystyle\\lim_{x\\to0}\\frac{f(x)}{x}=m\\) 时，\\(f\'(0)=m\\)',
                'B. 当 \\(f\'(0)=m\\) 时，\\(\\displaystyle\\lim_{x\\to0}\\frac{f(x)}{x}=m\\)',
                'C. 当 \\(\\displaystyle\\lim_{x\\to0}f\'(x)=m\\) 时，\\(f\'(0)=m\\)',
                'D. 当 \\(f\'(0)=m\\) 时，\\(\\displaystyle\\lim_{x\\to0}f\'(x)=m\\)'
            ],
            answer: 'B',
            concepts: [
                { name: '导数定义（极限形式）', note: '\\(f\'(x_0)=\\lim\\limits_{x\\to x_0}\\dfrac{f(x)-f(x_0)}{x-x_0}\\)，等价形式 \\(f\'(x_0)=\\lim\\limits_{h\\to0}\\dfrac{f(x_0+h)-f(x_0)}{h}\\)。' },
                { name: '可导与连续', note: '\\(f\\) 在 \\(x_0\\) 可导 \\(\\Rightarrow\\) \\(f\\) 在 \\(x_0\\) 连续（极限存在 \\(\\Rightarrow\\) \\(f(x_0)=\\lim f(x)\\)）。' },
                { name: '导函数极限与导数', note: '\\(\\lim f\'(x)\\) 存在与 \\(f\'(x_0)\\) 存在是两回事，导数未必连续（如 \\(x^2\\sin\\frac1x\\)）。' }
            ],
            solution: [
                { step: 1, title: '先抓住题设的关键信息', content: '题设只给 \\(\\lim_{x\\to0}f(x)=0\\)，并没有直接说 \\(f(0)=0\\)。但由导数定义 \\(f\'(0)=\\lim_{x\\to0}\\dfrac{f(x)-f(0)}{x}\\)，若 \\(f\'(0)\\) 存在，则 \\(f\\) 在 0 处连续，此时 \\(f(0)=\\lim_{x\\to0}f(x)=0\\)。' },
                { step: 2, title: '证明 B 正确', content: '若 \\(f\'(0)=m\\)，则可导 \\(\\Rightarrow\\) 连续 \\(\\Rightarrow f(0)=0\\)。于是<br>\\(m=f\'(0)=\\lim_{x\\to0}\\dfrac{f(x)-f(0)}{x}=\\lim_{x\\to0}\\dfrac{f(x)}{x}\\)<br>即 B 成立。' },
                { step: 3, title: '说明 A 错', content: 'A 把条件反过来：只知道 \\(\\lim\\frac{f(x)}{x}=m\\) 存在，只能推出 \\(f(x)\\to0\\)（即 \\(f(0)=0\\) 需由连续性保证），但 \\(f\\) 在 0 处不一定连续，故不一定有 \\(f\'(0)\\)。反例：\\(f(x)=|x|\\) 在 0 处不可导，但 \\(\\lim\\frac{f(x)}{x}\\) 不存在……更直接的反例：\\(f(x)=\\begin{cases}x,&x\\ne0\\\\1,&x=0\\end{cases}\\)，则 \\(\\lim\\frac{f(x)}{x}=1\\) 存在，但 \\(f\\) 在 0 处不连续、不可导。A 错。' },
                { step: 4, title: '说明 C、D 错', content: 'C：\\(\\lim_{x\\to0}f\'(x)=m\\) 是“导函数在 0 处的极限”，与 \\(f\'(0)\\) 无必然关系（\\(f\'(x)\\) 在 0 处可以无定义，如 \\(f(x)=x^2\\sin\\frac1x\\) 的导函数在 0 处极限不存在但 \\(f\'(0)=0\\)）。D：\\(f\'(0)\\) 存在也不保证 \\(f\'\\) 在 0 处有极限（导数不必连续）。故 C、D 均错。' },
                { step: 5, title: '结论', content: '选 B。' }
            ],
            source: { rank: 1, label: '真题', detail: '2024 年数学一第 4 题（原题）' },
            variants: [
                {
                    id: 'm02v1', dimension: '概念',
                    kpIds: ['GS.2.1'], kpNames: ['导数定义'],
                    chapter: 'ch02',
                    difficulty: 3,
                    question: '设 \\(f(x)\\) 在 \\(x=0\\) 的某邻域内有定义，则“\\(f\\) 在 \\(x=0\\) 处可导”的一个充分必要条件是',
                    options: [
                        'A. \\(\\displaystyle\\lim_{h\\to0}\\frac{f(h)-f(-h)}{2h}\\) 存在',
                        'B. \\(\\displaystyle\\lim_{h\\to0}\\frac{f(2h)-f(h)}{h}\\) 存在',
                        'C. \\(\\displaystyle\\lim_{h\\to0}\\frac{f(h)-f(0)}{h}\\) 存在',
                        'D. \\(\\displaystyle\\lim_{h\\to0}\\frac{f(h^2)}{h^2}\\) 存在'
                    ],
                    answer: 'C',
                    concepts: [
                        { name: '导数定义', note: '\\(f\'(x_0)=\\lim\\limits_{h\\to0}\\dfrac{f(x_0+h)-f(x_0)}{h}\\)。' },
                        { name: '反例：\\(|x|\\)', note: '\\(f(x)=|x|\\) 在 0 处不可导，但对称差商 \\(\\dfrac{|h|-|-h|}{2h}=0\\) 存在——说明 A 类“对称差商”不充分。' }
                    ],
                    solution: [
                        { step: 1, title: '对照导数定义', content: '可导的充要条件正是极限 \\(\\lim_{h\\to0}\\dfrac{f(0+h)-f(0)}{h}=\\lim_{h\\to0}\\dfrac{f(h)-f(0)}{h}\\) 存在。C 正是导数定义本身。' },
                        { step: 2, title: '说明 A 错（对称差商的陷阱）', content: '反例 \\(f(x)=|x|\\)：\\(f\\) 在 0 处不可导，但 <br>\\(\\lim_{h\\to0}\\frac{f(h)-f(-h)}{2h}=\\lim_{h\\to0}\\frac{|h|-|h|}{2h}=0\\) 存在。A 只刻画“左右对称增量”，不充分。' },
                        { step: 3, title: '说明 B、D 错', content: 'B：\\(f(2h)-f(h)\\) 是两点之间的差商，与 \\(f(0)\\) 无关，即使存在也不能推出可导。D：令 \\(h^2\\to0\\) 只从 \\(h>0\\) 方向逼近 0，且要求 \\(f(0)=0\\) 才有意义，条件不完整。' },
                        { step: 4, title: '结论', content: '选 C。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：导数定义等价形式辨析（概念维度），难度对标 2024 年数一第 4 题' }
                },
                {
                    id: 'm02v2', dimension: '计算',
                    kpIds: ['GS.2.1'], kpNames: ['导数定义'],
                    chapter: 'ch02',
                    difficulty: 3,
                    question: '设 \\(f\'(0)=2\\)，则 \\(\\displaystyle\\lim_{x\\to0}\\frac{f(x)-f(2x)}{x}\\) 等于',
                    options: [
                        'A. 2',
                        'B. -2',
                        'C. 4',
                        'D. -4'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '导数定义的增量形式', note: '\\(f(x)=f(0)+f\'(0)x+o(x)\\)，故 \\(f(x)-f(0)\\sim f\'(0)x\\)。' },
                        { name: '线性主部', note: '\\(f(2x)-f(0)\\sim f\'(0)\\cdot2x\\)（把 2x 看成自变量增量）。' }
                    ],
                    solution: [
                        { step: 1, title: '用导数定义改写分子', content: '由 \\(f\'(0)=2\\) 知 \\(f(x)=f(0)+2x+o(x)\\)，故<br>\\(f(x)-f(0)\\sim2x\\)，\\(f(2x)-f(0)\\sim2\\cdot(2x)=4x\\)' },
                        { step: 2, title: '代入原极限', content: '<br>\\(\\displaystyle\\lim_{x\\to0}\\frac{f(x)-f(2x)}{x}=\\lim_{x\\to0}\\frac{[f(x)-f(0)]-[f(2x)-f(0)]}{x}\\)<br>\\(=\\lim_{x\\to0}\\frac{2x-4x+o(x)}{x}\\)' },
                        { step: 3, title: '约去 x 并取极限', content: '<br>\\(=\\lim_{x\\to0}\\left(-2+\\dfrac{o(x)}{x}\\right)=-2\\)<br>（\\(\\dfrac{o(x)}{x}\\to0\\)。）' },
                        { step: 4, title: '结论', content: '选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：用导数定义计算函数值差商（计算维度），难度对标 2024 年数一第 4 题' }
                },
                {
                    id: 'm02v3', dimension: '公式',
                    kpIds: ['GS.2.1'], kpNames: ['导数定义'],
                    chapter: 'ch02',
                    difficulty: 3,
                    question: '设 \\(f\'(a)\\) 存在，则 \\(\\displaystyle\\lim_{h\\to0}\\frac{f(a+3h)-f(a-2h)}{h}\\) 等于',
                    options: [
                        'A. \\(f\'(a)\\)',
                        'B. \\(2f\'(a)\\)',
                        'C. \\(5f\'(a)\\)',
                        'D. \\(-5f\'(a)\\)'
                    ],
                    answer: 'C',
                    concepts: [
                        { name: '导数定义推广形式', note: '\\(\\lim\\limits_{h\\to0}\\dfrac{f(a+kh)-f(a)}{kh}=f\'(a)\\)，即 \\(\\lim\\limits_{h\\to0}\\dfrac{f(a+kh)-f(a)}{h}=kf\'(a)\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '回忆导数定义的推广公式', content: '导数定义 \\(\\lim\\limits_{h\\to0}\\dfrac{f(a+h)-f(a)}{h}=f\'(a)\\) 可推广为：<br>\\(\\lim_{h\\to0}\\dfrac{f(a+kh)-f(a)}{h}=kf\'(a)\\)（\\(k\\) 为常数）。' },
                        { step: 2, title: '拆分分子', content: '<br>\\(f(a+3h)-f(a-2h)=[f(a+3h)-f(a)]-[f(a-2h)-f(a)]\\)' },
                        { step: 3, title: '分别套推广公式', content: '<br>\\(\\lim_{h\\to0}\\frac{f(a+3h)-f(a)}{h}=3f\'(a)\\)<br>\\(\\lim_{h\\to0}\\frac{f(a-2h)-f(a)}{h}=-2f\'(a)\\)' },
                        { step: 4, title: '相减得结果', content: '<br>\\(\\displaystyle\\lim_{h\\to0}\\frac{f(a+3h)-f(a-2h)}{h}=3f\'(a)-(-2f\'(a))=5f\'(a)\\)<br>选 C。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：导数定义推广公式应用（公式维度），难度对标 2023 年数一第 3 题' }
                },
                {
                    id: 'm02v4', dimension: '创新',
                    kpIds: ['GS.2.1', 'GS.1.3'], kpNames: ['导数定义', '极限'],
                    chapter: 'ch02',
                    difficulty: 4,
                    question: '设 \\(f(x)=\\begin{cases}x^2\\sin\\dfrac{1}{x},&x\\ne0\\\\0,&x=0\\end{cases}\\)，则下列说法正确的是',
                    options: [
                        'A. \\(f\\) 在 \\(x=0\\) 处不可导',
                        'B. \\(f\'(0)=0\\)，且 \\(f\'(x)\\) 在 0 处连续',
                        'C. \\(f\'(0)=0\\)，但 \\(f\'(x)\\) 在 0 处极限不存在',
                        'D. \\(f\\) 在 0 处不连续'
                    ],
                    answer: 'C',
                    concepts: [
                        { name: '分段点处可导性', note: '必须用定义：\\(f\'(0)=\\lim\\limits_{x\\to0}\\dfrac{f(x)-f(0)}{x}\\)。' },
                        { name: '夹逼准则', note: '\\(|x^2\\sin\\frac1x|\\le x^2\\to0\\)。' },
                        { name: '导函数与导数', note: '可导不保证导函数连续；\\(\\lim f\'(x)\\) 可以不存在。' }
                    ],
                    solution: [
                        { step: 1, title: '按定义求 \\(f\'(0)\\)', content: '<br>\\(f\'(0)=\\lim_{x\\to0}\\frac{f(x)-f(0)}{x}=\\lim_{x\\to0}\\frac{x^2\\sin\\frac1x}{x}=\\lim_{x\\to0}x\\sin\\frac1x\\)<br>因 \\(|x\\sin\\frac1x|\\le|x|\\to0\\)（夹逼），故 \\(f\'(0)=0\\)，排除 A。' },
                        { step: 2, title: '求 \\(x\\ne0\\) 时的导函数', content: '<br>\\(f\'(x)=\\left(x^2\\sin\\frac1x\\right)\'=2x\\sin\\frac1x+x^2\\cos\\frac1x\\cdot\\left(-\\frac1{x^2}\\right)=2x\\sin\\frac1x-\\cos\\frac1x\\)' },
                        { step: 3, title: '考察 \\(\\lim_{x\\to0}f\'(x)\\)', content: '<br>\\(\\lim_{x\\to0}f\'(x)=\\lim_{x\\to0}\\left(2x\\sin\\frac1x-\\cos\\frac1x\\right)\\)<br>其中 \\(2x\\sin\\frac1x\\to0\\)，但 \\(\\cos\\frac1x\\) 在 0 处极限不存在（振荡）→ \\(\\lim f\'(x)\\) 不存在。' },
                        { step: 4, title: '结论', content: '\\(f\'(0)=0\\) 但导函数在 0 处极限不存在，选 C。这说明“可导”与“导函数连续/极限存在”是两回事。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：分段函数可导性与导函数（创新维度，跨 ch01/ch02），难度对标 2024 年数一第 4 题' }
                }
            ]
        },

        /* ==================================================================
         * m03 · 题位 3 · 高数/选择题 · 定积分比较大小
         * 母题来源：2022 年数一第 4 题（原题）
         * ================================================================== */
        {
            id: 'm03',
            slot: 3,
            type: '选择题',
            score: 5,
            part: '高数',
            topic: '定积分比较大小',
            difficulty: 3,
            kpIds: ['GS.3.2'],
            kpNames: ['定积分', '不等式'],
            chapter: 'ch03',
            question: '设 \\(I_1=\\displaystyle\\int_0^1\\frac{x}{2(1+\\cos x)}\\,\\mathrm{d}x\\)，\\(I_2=\\displaystyle\\int_0^1\\frac{\\ln(1+x)}{1+\\cos x}\\,\\mathrm{d}x\\)，\\(I_3=\\displaystyle\\int_0^1\\frac{2x}{1+\\sin x}\\,\\mathrm{d}x\\)，则',
            options: [
                'A. \\(I_1<I_2<I_3\\)',
                'B. \\(I_2<I_1<I_3\\)',
                'C. \\(I_1<I_3<I_2\\)',
                'D. \\(I_3<I_2<I_1\\)'
            ],
            answer: 'A',
            concepts: [
                { name: '定积分保序性', note: '积分区间相同，被积函数大的积分大：若 \\(f(x)\\ge g(x)\\) 于 \\([a,b]\\)，则 \\(\\int_a^b f\\ge\\int_a^b g\\)。' },
                { name: '常用不等式', note: '在 \\((0,1)\\) 上：\\(\\ln(1+x)<x\\)，且 \\(\\ln(1+x)>\\dfrac{x}{2}\\)（\\(\\varphi(x)=\\ln(1+x)-\\frac x2\\) 单调递增）。' },
                { name: '三角不等式', note: '在 \\((0,1)\\) 上 \\(0<\\sin x<1\\)、\\(0<\\cos x<1\\)，故 \\(1<1+\\sin x<2\\)、\\(1+\\cos x>1\\)。' }
            ],
            solution: [
                { step: 1, title: '先比较 \\(I_1\\) 与 \\(I_2\\)', content: '积分区间相同 \\([0,1]\\)，分母都有 \\(1+\\cos x\\)：\\(I_1\\) 的被积 \\(\\dfrac{x/2}{1+\\cos x}\\)，\\(I_2\\) 的被积 \\(\\dfrac{\\ln(1+x)}{1+\\cos x}\\)。只需比较 \\(\\ln(1+x)\\) 与 \\(\\dfrac{x}{2}\\)。' },
                { step: 2, title: '证明 \\(\\ln(1+x)>\\dfrac{x}{2}\\)', content: '令 \\(\\varphi(x)=\\ln(1+x)-\\dfrac{x}{2}\\)，则 \\(\\varphi(0)=0\\)，且<br>\\(\\varphi\'(x)=\\dfrac{1}{1+x}-\\dfrac12=\\dfrac{1-x}{2(1+x)}>0\\quad(0<x<1)\\)<br>故 \\(\\varphi\\) 在 \\((0,1)\\) 递增，\\(\\varphi(x)>0\\)，即 \\(\\ln(1+x)>\\dfrac{x}{2}\\) → \\(I_2>I_1\\)。' },
                { step: 3, title: '再比较 \\(I_2\\) 与 \\(I_3\\)：先证 \\(I_2\\) 的被积 < \\(x\\)', content: '由 \\(\\ln(1+x)<x\\) 且 \\(1+\\cos x>1\\)：<br>\\(\\dfrac{\\ln(1+x)}{1+\\cos x}<\\dfrac{x}{1+\\cos x}<x\\)' },
                { step: 4, title: '再证 \\(I_3\\) 的被积 > \\(x\\)', content: '由 \\(1<1+\\sin x<2\\)（在 \\((0,1)\\) 内 \\(0<\\sin x<1\\)）：<br>\\(\\dfrac{2x}{1+\\sin x}>\\dfrac{2x}{2}=x\\)<br>于是 \\(\\dfrac{2x}{1+\\sin x}>x>\\dfrac{\\ln(1+x)}{1+\\cos x}\\) → \\(I_3>I_2\\)。' },
                { step: 5, title: '结论', content: '\\(I_1<I_2<I_3\\)，选 A。' }
            ],
            source: { rank: 1, label: '真题', detail: '2022 年数学一第 4 题（原题，定积分比较大小）' },
            variants: [
                {
                    id: 'm03v1', dimension: '概念',
                    kpIds: ['GS.3.2'], kpNames: ['定积分', '保序性'],
                    chapter: 'ch03',
                    difficulty: 2,
                    question: '设 \\(I=\\displaystyle\\int_0^1 x\\,\\mathrm{d}x\\)，\\(J=\\displaystyle\\int_0^1 x^2\\,\\mathrm{d}x\\)，\\(K=\\displaystyle\\int_0^1\\sqrt{x}\\,\\mathrm{d}x\\)，则它们的大小关系是',
                    options: [
                        'A. \\(I<J<K\\)',
                        'B. \\(J<I<K\\)',
                        'C. \\(K<I<J\\)',
                        'D. \\(K>I>J\\)'
                    ],
                    answer: 'D',
                    concepts: [
                        { name: '定积分保序性', note: '积分区间相同，被积函数大的积分大。' },
                        { name: '幂函数比较', note: '在 \\((0,1)\\) 上：指数越大函数值越小，\\(\\sqrt{x}>x>x^2\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '回忆定积分保序性', content: '若在 \\([a,b]\\) 上 \\(f(x)\\ge g(x)\\)，则 \\(\\int_a^b f(x)\\,\\mathrm{d}x\\ge\\int_a^b g(x)\\,\\mathrm{d}x\\)。' },
                        { step: 2, title: '比较被积函数', content: '在 \\((0,1)\\) 内：\\(\\sqrt{x}>x\\)（如 \\(x=\\frac14\\)：\\(\\frac12>\\frac14\\)）；\\(x>x^2\\)（\\(0<x<1\\) 时幂指数越大值越小）。故 \\(\\sqrt{x}>x>x^2\\)。' },
                        { step: 3, title: '由保序性得积分大小', content: '积分区间都是 \\([0,1]\\)，被积函数处处更大则积分更大：<br>\\(K>I>J\\)' },
                        { step: 4, title: '结论', content: '选 D。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：保序性概念直接应用（概念维度），难度偏低，对标 2022 年数一第 4 题' }
                },
                {
                    id: 'm03v2', dimension: '计算',
                    kpIds: ['GS.3.2'], kpNames: ['定积分', '不等式'],
                    chapter: 'ch03',
                    difficulty: 3,
                    question: '比较 \\(I=\\displaystyle\\int_0^1\\frac{x}{1+x}\\,\\mathrm{d}x\\) 与 \\(J=\\displaystyle\\int_0^1\\ln(1+x)\\,\\mathrm{d}x\\) 的大小，则',
                    options: [
                        'A. \\(I>J\\)',
                        'B. \\(I<J\\)',
                        'C. \\(I=J\\)',
                        'D. 无法比较'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '构造差函数比大小', note: '令 \\(g(x)=\\ln(1+x)-\\dfrac{x}{1+x}\\)，看 \\(g\\) 在 \\((0,1)\\) 的符号。' },
                        { name: '导数判断单调性', note: '\\(g\'(x)=\\dfrac{x}{(1+x)^2}>0\\)，\\(g(0)=0\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '构造差函数', content: '被积区间相同，只需比较被积函数：令 <br>\\(g(x)=\\ln(1+x)-\\dfrac{x}{1+x}\\)，则 \\(g(0)=0\\)。' },
                        { step: 2, title: '求导判断符号', content: '<br>\\(g\'(x)=\\dfrac{1}{1+x}-\\dfrac{1}{(1+x)^2}=\\dfrac{x}{(1+x)^2}>0\\quad(0<x<1)\\)<br>故 \\(g\\) 在 \\((0,1)\\) 递增，\\(g(x)>g(0)=0\\)，即 \\(\\ln(1+x)>\\dfrac{x}{1+x}\\)。' },
                        { step: 3, title: '方法二（验证）：直接计算两个积分', content: '<br>\\(I=\\int_0^1\\frac{x}{1+x}\\,\\mathrm{d}x=\\int_0^1\\left(1-\\frac{1}{1+x}\\right)\\mathrm{d}x=\\left[x-\\ln(1+x)\\right]_0^1=1-\\ln2\\)<br>\\(J=\\int_0^1\\ln(1+x)\\,\\mathrm{d}x=\\left[(1+x)\\ln(1+x)-(1+x)\\right]_0^1=(2\\ln2-2)-(-1)=2\\ln2-1\\)<br>比较：\\(J-I=(2\\ln2-1)-(1-\\ln2)=3\\ln2-2\\approx0.079>0\\)，故 \\(J>I\\)，与方法一结论一致。' },
                        { step: 4, title: '结论', content: '被积函数 \\(\\ln(1+x)\\) 更大，故 \\(J>I\\)，选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：构造差函数比较积分（计算维度），难度对标 2022 年数一第 4 题' }
                },
                {
                    id: 'm03v3', dimension: '公式',
                    kpIds: ['GS.3.2', 'GS.3.4'], kpNames: ['定积分', '估值定理'],
                    chapter: 'ch03',
                    difficulty: 2,
                    question: '设 \\(f(x)\\) 在 \\([a,b]\\) 上连续，且 \\(m\\le f(x)\\le M\\)，则下列由定积分估值定理得到的结论正确的是',
                    options: [
                        'A. \\(m(b-a)\\le\\displaystyle\\int_a^b f(x)\\,\\mathrm{d}x\\le M(b-a)\\)',
                        'B. \\(\\displaystyle\\int_a^b f(x)\\,\\mathrm{d}x\\le m(b-a)\\)',
                        'C. \\(\\displaystyle\\int_a^b f(x)\\,\\mathrm{d}x\\ge M(b-a)\\)',
                        'D. \\(\\displaystyle\\int_a^b f(x)\\,\\mathrm{d}x=m+M\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '定积分估值定理', note: '若 \\(m\\le f(x)\\le M\\) 于 \\([a,b]\\)，则 \\(m(b-a)\\le\\int_a^b f\\,\\mathrm{d}x\\le M(b-a)\\)。' },
                        { name: '几何意义', note: '\\(\\int_a^b f\\,\\mathrm{d}x\\) 是曲边梯形面积，夹在两个矩形面积之间。' }
                    ],
                    solution: [
                        { step: 1, title: '回忆估值定理', content: '在 \\([a,b]\\) 上对 \\(m\\le f(x)\\le M\\) 两边同时积分：<br>\\(\\int_a^b m\\,\\mathrm{d}x\\le\\int_a^b f(x)\\,\\mathrm{d}x\\le\\int_a^b M\\,\\mathrm{d}x\\)' },
                        { step: 2, title: '计算常数的积分', content: '\\(\\int_a^b m\\,\\mathrm{d}x=m(b-a)\\)，\\(\\int_a^b M\\,\\mathrm{d}x=M(b-a)\\)。故<br>\\(m(b-a)\\le\\int_a^b f(x)\\,\\mathrm{d}x\\le M(b-a)\\)' },
                        { step: 3, title: '几何意义与易错提醒', content: '几何意义：\\(\\int_a^b f(x)\\,\\mathrm{d}x\\) 是曲边梯形面积，被夹在以 \\(m\\)、\\(M\\) 为高、底为 \\(b-a\\) 的两个矩形面积之间。易错：① 估值定理要求 \\(m\\le f(x)\\le M\\) 在 \\([a,b]\\) 上处处成立；② 下界是 \\(m(b-a)\\)、上界是 \\(M(b-a)\\)，不要写反；③ \\(f\\) 在个别点取到边界值不影响结论。' },
                        { step: 4, title: '结论', content: '选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：定积分估值定理公式应用（公式维度），难度偏低，对标 2022 年数一第 4 题' }
                },
                {
                    id: 'm03v4', dimension: '创新',
                    kpIds: ['GS.3.2', 'GS.1.3'], kpNames: ['定积分', '变限积分'],
                    chapter: 'ch03',
                    difficulty: 4,
                    question: '设 \\(F(x)=\\displaystyle\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t\\)，\\(G(x)=\\displaystyle\\int_0^x(1+t^2)\\,\\mathrm{d}t\\)，则对一切 \\(x>0\\) 有',
                    options: [
                        'A. \\(F(x)>G(x)\\)',
                        'B. \\(F(x)<G(x)\\)',
                        'C. \\(F(x)=G(x)\\)',
                        'D. 大小关系与 \\(x\\) 有关'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '被积函数比较 → 积分比较', note: '若 \\(f(t)\\ge g(t)\\) 于 \\([0,x]\\)，则 \\(\\int_0^x f\\ge\\int_0^x g\\)。' },
                        { name: '指数函数泰勒展开', note: '\\(\\mathrm{e}^{t^2}=1+t^2+\\dfrac{t^4}{2}+\\cdots>1+t^2\\)（\\(t\\ne0\\)）。' }
                    ],
                    solution: [
                        { step: 1, title: '比较被积函数', content: '由 \\(\\mathrm{e}^{t^2}=1+t^2+\\dfrac{t^4}{2!}+\\cdots\\)，对 \\(t\\ne0\\) 有 \\(\\mathrm{e}^{t^2}>1+t^2\\)。' },
                        { step: 2, title: '由保序性比较积分', content: '积分区间同为 \\([0,x]\\)（\\(x>0\\)），被积函数处处更大（除端点外）：<br>\\(F(x)=\\int_0^x\\mathrm{e}^{t^2}\\,\\mathrm{d}t>\\int_0^x(1+t^2)\\,\\mathrm{d}t=G(x)\\)' },
                        { step: 3, title: '说明严格性与数值验证', content: '因 \\(\\mathrm{e}^{t^2}=1+t^2+\\dfrac{t^4}{2}+\\cdots\\) 中 \\(t\\ne0\\) 时 \\(\\dfrac{t^4}{2}>0\\)，故 \\(\\mathrm{e}^{t^2}>1+t^2\\) 在 \\((0,x]\\) 上处处成立（仅 \\(t=0\\) 处取等，单点不影响积分值），所以不等式是严格的。数值验证：取 \\(x=1\\)，\\(G(1)=1+\\dfrac{1}{3}=\\dfrac{4}{3}\\approx1.333\\)，\\(F(1)=\\int_0^1\\mathrm{e}^{t^2}\\,\\mathrm{d}t\\approx1.463\\)，确实 \\(F(1)>G(1)\\)。' },
                        { step: 4, title: '结论', content: '选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：串联泰勒展开与积分保序性（创新维度，跨 ch01/ch03），难度对标 2022 年数一第 4 题' }
                }
            ]
        },
        /* ==================================================================
         * m05 · 题位 5 · 线代/选择题 · 二次型正惯性指数
         * 母题来源：2025 年数一第 5 题（原题，实际考查内容）
         * ================================================================== */
        {
            id: 'm05',
            slot: 5,
            type: '选择题',
            score: 5,
            part: '线代',
            topic: '二次型的正惯性指数',
            difficulty: 3,
            kpIds: ['XD.14.1', 'XD.14.2'],
            kpNames: ['二次型', '惯性指数'],
            chapter: 'ch14',
            question: '二次型 \\(f(x_1,x_2,x_3)=x_1^2+2x_1x_2+2x_1x_3\\) 的正惯性指数为',
            options: [
                'A. 0',
                'B. 1',
                'C. 2',
                'D. 3'
            ],
            answer: 'B',
            concepts: [
                { name: '正惯性指数', note: '二次型经可逆线性变换（合同变换）化为标准形后，正平方项的个数叫正惯性指数（惯性定理：与变换无关）。' },
                { name: '配方法', note: '把含 \\(x_1\\) 的项凑成完全平方：\\(x_1^2+2x_1(x_2+x_3)=(x_1+x_2+x_3)^2-(x_2+x_3)^2\\)。' }
            ],
            solution: [
                { step: 1, title: '配方（把含 \\(x_1\\) 的项凑完全平方）', content: '<br>\\(f=x_1^2+2x_1x_2+2x_1x_3=x_1^2+2x_1(x_2+x_3)\\)<br>\\(=(x_1+x_2+x_3)^2-(x_2+x_3)^2\\)<br>（第一步：\\(a^2+2ab=(a+b)^2-b^2\\)，其中 \\(a=x_1\\)、\\(b=x_2+x_3\\)。）' },
                { step: 2, title: '读出标准形的符号', content: '令 \\(y_1=x_1+x_2+x_3\\)，\\(y_2=x_2+x_3\\)，则<br>\\(f=y_1^2-y_2^2+0\\cdot y_3^2\\)<br>一个正平方项、一个负平方项、一个零项。' },
                { step: 3, title: '方法二（验证）：特征值法', content: '对应矩阵 \\(A=\\begin{pmatrix}1&1&1\\\\1&0&0\\\\1&0&0\\end{pmatrix}\\)。特征多项式：<br>\\(\\det(\\lambda I-A)=\\begin{vmatrix}\\lambda-1&-1&-1\\\\-1&\\lambda&0\\\\-1&0&\\lambda\\end{vmatrix}=(\\lambda-1)\\lambda^2-\\lambda-\\lambda\\)<br>\\(=\\lambda^3-\\lambda^2-2\\lambda=\\lambda(\\lambda-2)(\\lambda+1)\\)<br>特征值 \\(2,-1,0\\)，正特征值恰 1 个 \\(\\Rightarrow\\) 正惯性指数为 1，与配方法一致。' },
                { step: 4, title: '结论', content: '正惯性指数 = 正平方项个数 = 1，选 B。' }
            ],
            source: { rank: 1, label: '真题', detail: '2025 年数学一第 5 题（原题，二次型惯性指数）' },
            variants: [
                {
                    id: 'm05v1', dimension: '概念',
                    kpIds: ['XD.14.3'], kpNames: ['正定二次型'],
                    chapter: 'ch14',
                    difficulty: 3,
                    question: '下列二次型中，正定的是',
                    options: [
                        'A. \\(x_1^2-x_2^2\\)',
                        'B. \\(x_1^2-2x_1x_2+x_2^2\\)',
                        'C. \\(2x_1^2+2x_1x_2+x_2^2\\)',
                        'D. \\(x_1^2+2x_1x_2+x_2^2\\)'
                    ],
                    answer: 'C',
                    concepts: [
                        { name: '正定二次型', note: '对任意非零向量 \\(x\\) 都有 \\(f(x)>0\\)；等价判定：顺序主子式全大于 0。' },
                        { name: '半正定与不定', note: '\\((x_1-x_2)^2\\ge0\\) 是半正定；\\(x_1^2-x_2^2\\) 可正可负是不定。' }
                    ],
                    solution: [
                        { step: 1, title: '用顺序主子式判定 C', content: '\\(f=2x_1^2+2x_1x_2+x_2^2\\) 对应矩阵 \\(A=\\begin{pmatrix}2&1\\\\1&1\\end{pmatrix}\\)。<br>一阶顺序主子式 \\(2>0\\)；二阶 \\(\\det A=2\\cdot1-1\\cdot1=1>0\\) → 正定。C 对。' },
                        { step: 2, title: '排除其余', content: 'A：\\(x_1^2-x_2^2\\) 可正可负（如 \\((1,0)\\) 取正、\\((0,1)\\) 取负），不定。B：\\(=(x_1-x_2)^2\\) 半正定（取零向量外可为零）。D：\\(=(x_1+x_2)^2\\) 半正定。' },
                        { step: 3, title: '易错提醒（正定与半正定的区分）', content: '正定要求"对任意非零向量 \\(x\\)，\\(f(x)>0\\)"。B：\\((x_1-x_2)^2\\) 在非零向量 \\((1,1)\\) 处取 0，只是半正定；D：\\((x_1+x_2)^2\\) 同理。不要看到"平方和"就认为正定——必须检查是否存在非零向量使 \\(f=0\\)。C 的矩阵 \\(\\begin{pmatrix}2&1\\\\1&1\\end{pmatrix}\\) 一阶顺序主子式 \\(2>0\\)、二阶 \\(\\det A=2\\times1-1\\times1=1>0\\)，全部顺序主子式为正，才是严格正定。' },
                        { step: 4, title: '结论', content: '选 C。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：正定二次型判定（概念维度），难度对标 2025 年数一第 5 题' }
                },
                {
                    id: 'm05v2', dimension: '计算',
                    kpIds: ['XD.14.1'], kpNames: ['二次型'],
                    chapter: 'ch14',
                    difficulty: 3,
                    question: '二次型 \\(f=2x_1^2+5x_2^2+5x_3^2+4x_1x_2-4x_1x_3-8x_2x_3\\) 的正惯性指数为',
                    options: [
                        'A. 1',
                        'B. 2',
                        'C. 3',
                        'D. 0'
                    ],
                    answer: 'C',
                    concepts: [
                        { name: '配方法（多变量）', note: '先凑含 \\(x_1\\) 的项，再凑剩余项中的 \\(x_2\\)，直到只剩 \\(x_3^2\\)。' },
                        { name: '完全平方展开', note: '\\(a(x_1+b)^2=a x_1^2+2ab x_1+ab^2\\)，逆向用来配方。' }
                    ],
                    solution: [
                        { step: 1, title: '配方第一步：凑含 \\(x_1\\) 的项', content: '<br>\\(f=2x_1^2+4x_1x_2-4x_1x_3+\\cdots=2\\left(x_1+x_2-x_3\\right)^2+\\cdots\\)<br>因为 \\(2(x_1+x_2-x_3)^2=2x_1^2+4x_1x_2-4x_1x_3+2x_2^2+2x_3^2-4x_2x_3\\)，用 \\(f\\) 减去它剩余 <br>\\(3x_2^2+3x_3^2-4x_2x_3\\)。' },
                        { step: 2, title: '配方第二步：凑含 \\(x_2\\) 的项', content: '<br>\\(3x_2^2-4x_2x_3+3x_3^2=3\\left(x_2-\\frac{2}{3}x_3\\right)^2+\\left(3-\\frac{4}{3}\\right)x_3^2\\)<br>\\(=3\\left(x_2-\\frac{2}{3}x_3\\right)^2+\\frac{5}{3}x_3^2\\)' },
                        { step: 3, title: '合并写出标准形', content: '<br>\\(f=2(x_1+x_2-x_3)^2+3\\left(x_2-\\frac{2}{3}x_3\\right)^2+\\frac{5}{3}x_3^2\\)<br>三个平方项的系数 \\(2,3,\\frac53\\) 全为正 → 正惯性指数 3。' },
                        { step: 4, title: '结论', content: '选 C。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：多变量配方求正惯性指数（计算维度），难度对标 2021 年数一第 5 题' }
                },
                {
                    id: 'm05v3', dimension: '公式',
                    kpIds: ['XD.14.2'], kpNames: ['合同变换', '惯性定理'],
                    chapter: 'ch14',
                    difficulty: 3,
                    question: '下列矩阵中与 \\(\\mathrm{diag}(1,1,-1)\\) 合同的是',
                    options: [
                        'A. \\(\\mathrm{diag}(1,2,3)\\)',
                        'B. \\(\\mathrm{diag}(1,1,1)\\)',
                        'C. \\(\\mathrm{diag}(1,-1,-1)\\)',
                        'D. \\(\\mathrm{diag}(2,2,-2)\\)'
                    ],
                    answer: 'D',
                    concepts: [
                        { name: '合同与惯性定理', note: '实对称矩阵合同的充要条件：正惯性指数与负惯性指数分别相等。' },
                        { name: '对角阵的惯性指数', note: '\\(\\mathrm{diag}(\\lambda_1,\\ldots,\\lambda_n)\\) 正惯性指数 = 正对角元个数，负惯性指数 = 负对角元个数。' }
                    ],
                    solution: [
                        { step: 1, title: '读出 \\(\\mathrm{diag}(1,1,-1)\\) 的惯性指数', content: '正惯性指数 2（两个 1），负惯性指数 1（一个 -1）。' },
                        { step: 2, title: '逐一核对选项', content: 'A：\\(\\mathrm{diag}(1,2,3)\\) 正 3 负 0，不合同。B：\\(\\mathrm{diag}(1,1,1)\\) 正 3 负 0。C：\\(\\mathrm{diag}(1,-1,-1)\\) 正 1 负 2。D：\\(\\mathrm{diag}(2,2,-2)\\) 正 2 负 1，与目标相同 → 合同。' },
                        { step: 3, title: '易错提醒（合同判定与惯性定理）', content: '① 合同判定用惯性定理：两实对称矩阵合同 \\(\\iff\\) 正、负惯性指数分别相等；它与"相似"（要求特征值对应相等）不是一回事。② \\(\\mathrm{diag}(2,2,-2)\\) 与 \\(\\mathrm{diag}(1,1,-1)\\) 只差一个整体正因子 2，不改变正负号个数，故合同。③ 惯性定理针对实对称矩阵，本题目标矩阵与各选项均为对角阵（实对称），满足适用条件。' },
                        { step: 4, title: '结论', content: '选 D。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：惯性定理与合同判定（公式维度），难度对标 2021 年数一第 5 题' }
                },
                {
                    id: 'm05v4', dimension: '创新',
                    kpIds: ['XD.14.2', 'XD.10.3'], kpNames: ['合同', '矩阵的秩'],
                    chapter: 'ch14',
                    difficulty: 4,
                    question: '设 \\(A\\) 为 3 阶实对称矩阵，正惯性指数为 2，秩为 3，则 \\(A\\) 与下列哪个矩阵合同',
                    options: [
                        'A. \\(\\mathrm{diag}(1,1,-1)\\)',
                        'B. \\(\\mathrm{diag}(1,0,0)\\)',
                        'C. \\(\\mathrm{diag}(1,1,1)\\)',
                        'D. \\(\\mathrm{diag}(1,-1,-1)\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '秩与惯性指数', note: '秩 = 正惯性指数 + 负惯性指数（零项不贡献秩）。' },
                        { name: '实对称矩阵的标准形', note: '实对称矩阵必合同于 \\(\\mathrm{diag}(1,\\cdots,1,-1,\\cdots,-1,0,\\cdots,0)\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '由秩与正惯性指数求负惯性指数', content: '秩 3 = 正惯性 2 + 负惯性 ？ → 负惯性指数 = 1。' },
                        { step: 2, title: '写出合同的规范形', content: '实对称矩阵合同于 \\(\\mathrm{diag}(1,1,-1)\\)（2 个正 1、1 个负 1、0 个零项）。' },
                        { step: 3, title: '逐一核对选项（秩与惯性指数双重匹配）', content: 'A：\\(\\mathrm{diag}(1,1,-1)\\) 正惯性 2、负惯性 1、秩 3，与 \\(A\\) 完全一致 → 合同。B：\\(\\mathrm{diag}(1,0,0)\\) 秩 1 \\(\\ne3\\)，不符。C：\\(\\mathrm{diag}(1,1,1)\\) 负惯性指数 0 \\(\\ne1\\)，不符。D：\\(\\mathrm{diag}(1,-1,-1)\\) 正惯性指数 1 \\(\\ne2\\)，不符。只有 A 同时满足正惯性、负惯性、秩三个条件。' },
                        { step: 4, title: '结论', content: '选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：串联秩、惯性指数与合同规范形（创新维度，跨 ch10/ch14），难度对标 2025 年数一第 5 题' }
                }
            ]
        },

        /* ==================================================================
         * m07 · 题位 7 · 线代/选择题 · 向量组线性相关
         * 母题来源：2024 年数一第 6 题（原题）
         * ================================================================== */
        {
            id: 'm07',
            slot: 7,
            type: '选择题',
            score: 5,
            part: '线代',
            topic: '向量组线性相关与线性无关',
            difficulty: 3,
            kpIds: ['XD.11.1'],
            kpNames: ['线性相关', '向量组'],
            chapter: 'ch11',
            question: '设向量 \\(\\alpha_1=\\begin{pmatrix}a\\\\1\\\\-1\\\\1\\end{pmatrix}\\)，\\(\\alpha_2=\\begin{pmatrix}1\\\\1\\\\b\\\\a\\end{pmatrix}\\)，\\(\\alpha_3=\\begin{pmatrix}1\\\\a\\\\-1\\\\1\\end{pmatrix}\\)，若 \\(\\alpha_1,\\alpha_2,\\alpha_3\\) 线性相关，且其中任意两个向量均线性无关，则',
            options: [
                'A. \\(a=1,\\ b\\ne-1\\)',
                'B. \\(a=1,\\ b=-1\\)',
                'C. \\(a\\ne-2,\\ b=2\\)',
                'D. \\(a=-2,\\ b=2\\)'
            ],
            answer: 'D',
            concepts: [
                { name: '线性相关定义', note: '存在不全为 0 的 \\(k_i\\) 使 \\(k_1\\alpha_1+k_2\\alpha_2+k_3\\alpha_3=0\\)。' },
                { name: '任意两个线性无关', note: '排除 \\(\\alpha_i=\\alpha_j\\)（成比例）的情况，即任意两个不能成比例。' },
                { name: '行列式判线性相关', note: '三个 \\(n\\) 维向量（\\(n\\ge3\\)）线性相关 \\(\\iff\\) 由它们前 3 个分量构成的行列式为 0（当其余分量固定时）。' }
            ],
            solution: [
                { step: 1, title: '用“任意两个线性无关”先排除 A、B', content: '若 \\(a=1\\)，则 \\(\\alpha_1=(1,1,-1,1)^T\\)，\\(\\alpha_3=(1,1,-1,1)^T\\)，两向量完全相同 → \\(\\alpha_1,\\alpha_3\\) 线性相关，违反“任意两个都无关”。故 A、B 排除。' },
                { step: 2, title: '剩余 C、D 都要求 \\(b=2\\)，代入行列式', content: '取前 3 个分量组成矩阵（线性相关 \\(\\Rightarrow\\) 任一 3 阶子式行列式为 0）：<br>\\(\\begin{vmatrix}a&1&1\\\\1&1&a\\\\-1&2&-1\\end{vmatrix}=a(1\\cdot(-1)-2\\cdot a)-1(1\\cdot(-1)-(-1)\\cdot a)+1(1\\cdot2-1\\cdot(-1))\\)<br>\\(=a(-1-2a)-1(-1+a)+(2+1)=-2a^2-2a+4=-2(a+2)(a-1)\\)' },
                { step: 3, title: '线性相关 ⇒ 行列式 = 0', content: '<br>\\(-2(a+2)(a-1)=0\\ \\Rightarrow\\ a=-2\\) 或 \\(a=1\\)。\\(a=1\\) 已被排除，故 \\(a=-2\\)。' },
                { step: 4, title: '结论', content: '\\(a=-2,\\ b=2\\)，选 D。' }
            ],
            source: { rank: 1, label: '真题', detail: '2024 年数学一第 6 题（原题）' },
            variants: [
                {
                    id: 'm07v1', dimension: '概念',
                    kpIds: ['XD.11.1'], kpNames: ['线性相关'],
                    chapter: 'ch11',
                    difficulty: 3,
                    question: '设 \\(\\alpha_1,\\alpha_2,\\alpha_3\\) 线性无关，则下列向量组线性相关的是',
                    options: [
                        'A. \\(\\alpha_1+\\alpha_2,\\ \\alpha_2+\\alpha_3,\\ \\alpha_3+\\alpha_1\\)',
                        'B. \\(\\alpha_1-\\alpha_2,\\ \\alpha_2-\\alpha_3,\\ \\alpha_3-\\alpha_1\\)',
                        'C. \\(\\alpha_1,\\ \\alpha_2,\\ \\alpha_3+\\alpha_1\\)',
                        'D. \\(2\\alpha_1,\\ 3\\alpha_2,\\ \\alpha_3\\)'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '线性相关的判定', note: '存在不全为 0 的组合系数使线性组合为零向量。' },
                        { name: '和为 0 的构造', note: '\\((\\alpha_1-\\alpha_2)+(\\alpha_2-\\alpha_3)+(\\alpha_3-\\alpha_1)=0\\) 是非零组合。' }
                    ],
                    solution: [
                        { step: 1, title: '分析 B', content: '<br>\\((\\alpha_1-\\alpha_2)+(\\alpha_2-\\alpha_3)+(\\alpha_3-\\alpha_1)=0\\)<br>系数 \\(1,1,1\\) 不全为 0，故 \\(\\alpha_1-\\alpha_2,\\ \\alpha_2-\\alpha_3,\\ \\alpha_3-\\alpha_1\\) 线性相关。' },
                        { step: 2, title: '分析 A（线性无关）', content: '设 \\(k_1(\\alpha_1+\\alpha_2)+k_2(\\alpha_2+\\alpha_3)+k_3(\\alpha_3+\\alpha_1)=0\\)，整理得<br>\\((k_1+k_3)\\alpha_1+(k_1+k_2)\\alpha_2+(k_2+k_3)\\alpha_3=0\\)<br>由 \\(\\alpha\\) 线性无关：\\(k_1+k_3=k_1+k_2=k_2+k_3=0\\)，解得 \\(k_1=k_2=k_3=0\\) → 线性无关。' },
                        { step: 3, title: '分析 C、D', content: 'C、D 都是“无关组加进新向量/倍乘”，保持无关（\\(\\alpha_3+\\alpha_1\\) 不在 \\(\\alpha_1,\\alpha_2\\) 张成空间中，2\\(\\alpha_1\\) 等仍线性无关）。' },
                        { step: 4, title: '结论', content: '选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：无关组线性组合的相关性判断（概念维度），难度对标 2024 年数一第 6 题' }
                },
                {
                    id: 'm07v2', dimension: '计算',
                    kpIds: ['XD.11.1'], kpNames: ['线性相关'],
                    chapter: 'ch11',
                    difficulty: 3,
                    question: '下列向量组中，线性相关的是',
                    options: [
                        'A. \\((1,0,0),(0,1,0),(0,0,1)\\)',
                        'B. \\((1,2,3),(2,4,6),(1,0,1)\\)',
                        'C. \\((1,1,0),(0,1,1),(1,0,1)\\)',
                        'D. \\((1,2),(2,3)\\)'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '成比例即相关', note: '一个向量是另一个向量的倍数时，向量组线性相关。' },
                        { name: '行列式判相关性', note: '3 个 3 维向量线性相关 \\(\\iff\\) 行列式为 0。' }
                    ],
                    solution: [
                        { step: 1, title: '分析 B：观察比例关系', content: '\\((2,4,6)=2\\cdot(1,2,3)\\)，即 \\(\\alpha_2=2\\alpha_1\\)，存在非零组合 \\(2\\alpha_1-\\alpha_2+0\\cdot\\alpha_3=0\\) → 线性相关。' },
                        { step: 2, title: '核对 A、C 的无关性', content: 'A 是标准基，行列式 \\(=1\\ne0\\)，无关。C 的行列式：<br>\\(\\begin{vmatrix}1&0&1\\\\1&1&0\\\\0&1&1\\end{vmatrix}=1\\cdot(1\\cdot1-0\\cdot1)-0+1\\cdot(1\\cdot1-1\\cdot0)=1+1=2\\ne0\\)，无关。' },
                        { step: 3, title: '核对 D', content: 'D 两个向量 \\((1,2),(2,3)\\) 不成比例 → 无关。' },
                        { step: 4, title: '结论', content: '选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：具体向量组相关性判断（计算维度），难度对标 2023 年数一第 7 题' }
                },
                {
                    id: 'm07v3', dimension: '公式',
                    kpIds: ['XD.11.1', 'XD.9.1'], kpNames: ['线性无关', '行列式'],
                    chapter: 'ch11',
                    difficulty: 3,
                    question: '设 \\(\\alpha_1=(1,a,0)^T\\)，\\(\\alpha_2=(a,1,0)^T\\)，\\(\\alpha_3=(0,0,1)^T\\)，则 \\(\\alpha_1,\\alpha_2,\\alpha_3\\) 线性无关的充要条件是',
                    options: [
                        'A. \\(a\\ne0\\)',
                        'B. \\(a\\ne\\pm1\\)',
                        'C. \\(a\\ne1\\)',
                        'D. \\(a\\) 任意'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '3 个 3 维向量线性无关 ⇔ 行列式不为 0', note: '把向量按列排成矩阵，行列式非零则线性无关。' },
                        { name: '行列式按行（列）展开', note: '第三行只有第 3 个元素 1，可对第 3 行展开。' }
                    ],
                    solution: [
                        { step: 1, title: '排成行列式', content: '<br>\\(\\det(\\alpha_1,\\alpha_2,\\alpha_3)=\\begin{vmatrix}1&a&0\\\\a&1&0\\\\0&0&1\\end{vmatrix}\\)' },
                        { step: 2, title: '按第 3 行展开计算', content: '<br>\\(=(+1)\\cdot\\begin{vmatrix}1&a\\\\a&1\\end{vmatrix}=1-a^2\\)' },
                        { step: 3, title: '边界值检验（\\(a=\\pm1\\) 必相关）', content: '当 \\(a=1\\) 时：\\(\\alpha_1=(1,1,0)^T\\)，\\(\\alpha_2=(1,1,0)^T\\)，\\(\\alpha_1=\\alpha_2\\)，线性相关；当 \\(a=-1\\) 时：\\(\\alpha_1=(1,-1,0)^T\\)，\\(\\alpha_2=(-1,1,0)^T\\)，\\(\\alpha_1=-\\alpha_2\\)，线性相关。可见 \\(a=\\pm1\\) 必须排除，与行列式条件 \\(1-a^2\\ne0\\) 完全吻合。' },
                        { step: 4, title: '结论', content: '线性无关 \\(\\iff 1-a^2\\ne0\\ \\iff\\ a\\ne\\pm1\\)，选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：行列式判别线性无关（公式维度），难度对标 2024 年数一第 6 题' }
                },
                {
                    id: 'm07v4', dimension: '创新',
                    kpIds: ['XD.11.1', 'XD.11.2'], kpNames: ['线性相关', '线性表示'],
                    chapter: 'ch11',
                    difficulty: 4,
                    question: '设 \\(\\alpha_1,\\alpha_2,\\alpha_3\\) 线性相关，且 \\(\\alpha_1,\\alpha_2\\) 线性无关，则下列说法正确的是',
                    options: [
                        'A. \\(\\alpha_3\\) 可由 \\(\\alpha_1,\\alpha_2\\) 线性表示，且表示唯一',
                        'B. \\(\\alpha_3\\) 不能由 \\(\\alpha_1,\\alpha_2\\) 线性表示',
                        'C. \\(\\alpha_1\\) 可由 \\(\\alpha_2,\\alpha_3\\) 线性表示',
                        'D. \\(\\alpha_1,\\alpha_2,\\alpha_3\\) 中任意两个都线性相关'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '秩的关系', note: '线性相关 \\(\\Rightarrow\\) 秩 \\(<3\\)；\\(\\alpha_1,\\alpha_2\\) 无关 \\(\\Rightarrow\\) 秩 \\(\\ge2\\)，故秩 \\(=2\\)。' },
                        { name: '唯一表示', note: '向量可由一组线性无关的向量表示时，表示法唯一。' }
                    ],
                    solution: [
                        { step: 1, title: '确定向量组的秩', content: '\\(\\alpha_1,\\alpha_2\\) 线性无关 → 秩至少 2；三向量线性相关 → 秩至多 2。故秩 \\(r=2\\)，且 \\(\\alpha_1,\\alpha_2\\) 是一组极大无关组。' },
                        { step: 2, title: '说明 \\(\\alpha_3\\) 可表示且唯一', content: '秩 \\(=2\\) 且 \\(\\alpha_1,\\alpha_2\\) 无关 → \\(\\alpha_3\\in\\mathrm{span}(\\alpha_1,\\alpha_2)\\)，即 \\(\\alpha_3=k_1\\alpha_1+k_2\\alpha_2\\)。又 \\(\\alpha_1,\\alpha_2\\) 线性无关，故系数 \\(k_1,k_2\\) 唯一。A 对。' },
                        { step: 3, title: '排除其余', content: 'B 与 A 矛盾。C：\\(\\alpha_1\\) 不一定能由 \\(\\alpha_2,\\alpha_3\\) 表示（\\(\\alpha_2,\\alpha_3\\) 可能相关）。D：\\(\\alpha_1,\\alpha_2\\) 已经线性无关，与“任意两个相关”矛盾。' },
                        { step: 4, title: '结论', content: '选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：串联线性相关、秩与唯一表示（创新维度），难度对标 2022 年数一第 7 题' }
                }
            ]
        },

        /* ==================================================================
         * m08 · 题位 8 · 概率/选择题 · 正态分布线性组合
         * 母题来源：2024 年数一第 8 题（原题，实际考查内容）
         * ================================================================== */
        {
            id: 'm08',
            slot: 8,
            type: '选择题',
            score: 5,
            part: '概率',
            topic: '正态分布线性组合与概率计算',
            difficulty: 3,
            kpIds: ['GL.16.3', 'GL.18.2'],
            kpNames: ['正态分布', '数字特征'],
            chapter: 'ch16',
            question: '设随机变量 \\(X\\) 与 \\(Y\\) 独立，\\(X\\sim N(0,2)\\)，\\(Y\\sim N(-2,2)\\)，若 \\(P\\{2X+Y<a\\}=P\\{X>Y\\}\\)，则 \\(a=\\)',
            options: [
                'A. \\(-2-\\sqrt{10}\\)',
                'B. \\(-2+\\sqrt{10}\\)',
                'C. \\(-2-\\sqrt{6}\\)',
                'D. \\(-2+\\sqrt{6}\\)'
            ],
            answer: 'B',
            concepts: [
                { name: '独立正态变量的线性组合', note: '若 \\(X,Y\\) 独立且都服从正态分布，则 \\(aX+bY+c\\) 仍服从正态分布，且 \\(E=aE(X)+bE(Y)+c\\)，\\(D=a^2D(X)+b^2D(Y)\\)。' },
                { name: '正态标准化', note: '\\(X\\sim N(\\mu,\\sigma^2)\\)，则 \\(\\dfrac{X-\\mu}{\\sigma}\\sim N(0,1)\\)，\\(P\\{X\\le x\\}=\\Phi\\left(\\dfrac{x-\\mu}{\\sigma}\\right)\\)。' },
                { name: 'Φ 的单调性与分位点', note: '\\(\\Phi\\) 严格递增，\\(\\Phi(u)=\\Phi(v)\\Rightarrow u=v\\)。' }
            ],
            solution: [
                { step: 1, title: '求 \\(2X+Y\\) 的分布', content: '独立正态线性组合仍正态：<br>\\(U=2X+Y\\)，\\(E(U)=2\\cdot0+(-2)=-2\\)，\\(D(U)=2^2\\cdot2+2=10\\)<br>故 \\(U\\sim N(-2,10)\\)。' },
                { step: 2, title: '把左边概率标准化', content: '<br>\\(P\\{2X+Y<a\\}=P\\{U<a\\}=\\Phi\\left(\\dfrac{a-(-2)}{\\sqrt{10}}\\right)=\\Phi\\left(\\dfrac{a+2}{\\sqrt{10}}\\right)\\)' },
                { step: 3, title: '求 \\(X-Y\\) 的分布并化简右边概率', content: '令 \\(V=X-Y\\)：\\(E(V)=0-(-2)=2\\)，\\(D(V)=2+2=4\\)，\\(V\\sim N(2,4)\\)。<br>\\(P\\{X>Y\\}=P\\{V>0\\}=P\\left\\{\\dfrac{V-2}{2}>\\dfrac{0-2}{2}\\right\\}=P\\{Z>-1\\}=\\Phi(1)\\)' },
                { step: 4, title: '比较分位点解出 \\(a\\)', content: '由 \\(\\Phi\\left(\\dfrac{a+2}{\\sqrt{10}}\\right)=\\Phi(1)\\) 及 \\(\\Phi\\) 严格递增：<br>\\(\\dfrac{a+2}{\\sqrt{10}}=1\\ \\Rightarrow\\ a=-2+\\sqrt{10}\\)<br>选 B。' }
            ],
            source: { rank: 1, label: '真题', detail: '2024 年数学一第 8 题（原题，正态分布线性组合）' },
            variants: [
                {
                    id: 'm08v1', dimension: '概念',
                    kpIds: ['GL.16.3'], kpNames: ['正态分布'],
                    chapter: 'ch16',
                    difficulty: 3,
                    question: '设 \\(X\\sim N(1,4)\\)，\\(Y\\sim N(2,9)\\)，且 \\(X\\) 与 \\(Y\\) 相互独立，则 \\(3X-2Y\\) 服从',
                    options: [
                        'A. \\(N(-1,72)\\)',
                        'B. \\(N(-1,45)\\)',
                        'C. \\(N(-1,54)\\)',
                        'D. \\(N(7,72)\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '独立正态线性组合', note: '\\(3X-2Y\\sim N(3\\mu_X-2\\mu_Y,\\ 3^2\\sigma_X^2+(-2)^2\\sigma_Y^2)\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '求期望', content: '<br>\\(E(3X-2Y)=3E(X)-2E(Y)=3\\cdot1-2\\cdot2=-1\\)' },
                        { step: 2, title: '求方差（独立时协方差为 0）', content: '<br>\\(D(3X-2Y)=3^2D(X)+(-2)^2D(Y)=9\\cdot4+4\\cdot9=36+36=72\\)' },
                        { step: 3, title: '说明为什么仍是正态分布', content: '独立正态随机变量的任意线性组合仍服从正态分布（正态分布族的线性封闭性），故只要确定 \\(E(3X-2Y)=-1\\) 与 \\(D(3X-2Y)=72\\)，分布就被唯一确定。另外注意：\\(X,Y\\) 独立 \\(\\Rightarrow \\mathrm{Cov}(X,Y)=0\\)，所以方差中不出现交叉项 \\(2\\cdot3\\cdot(-2)\\mathrm{Cov}(X,Y)\\)。' },
                        { step: 4, title: '结论', content: '\\(3X-2Y\\sim N(-1,72)\\)，选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：独立正态线性组合分布（概念维度），难度对标 2024 年数一第 8 题' }
                },
                {
                    id: 'm08v2', dimension: '计算',
                    kpIds: ['GL.16.3'], kpNames: ['正态分布'],
                    chapter: 'ch16',
                    difficulty: 3,
                    question: '设 \\(X\\sim N(1,4)\\)，则 \\(P\\{|X-1|<4\\}\\) 等于',
                    options: [
                        'A. \\(2\\Phi(2)-1\\)',
                        'B. \\(2\\Phi(1)-1\\)',
                        'C. \\(\\Phi(2)\\)',
                        'D. \\(2\\Phi(4)\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '正态标准化', note: '\\(\\dfrac{X-1}{2}\\sim N(0,1)\\)。' },
                        { name: 'Φ 的对称性', note: '\\(\\Phi(-u)=1-\\Phi(u)\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '标准化', content: '\\(X\\sim N(1,4)\\)，即 \\(\\sigma=2\\)，令 \\(Z=\\dfrac{X-1}{2}\\sim N(0,1)\\)。' },
                        { step: 2, title: '改写概率', content: '<br>\\(P\\{|X-1|<4\\}=P\\{-4<X-1<4\\}=P\\{-2<Z<2\\}\\)' },
                        { step: 3, title: '端点处理与易错提醒', content: '本题 \\(X\\) 是连续型随机变量，取单点概率为 0，故 \\(|X-1|<4\\) 与 \\(|X-1|\\le4\\) 的概率相同，写成 \\(-4<X-1<4\\) 没有问题。关键易错点：\\(X\\sim N(1,4)\\) 中 4 是方差，标准差 \\(\\sigma=\\sqrt4=2\\)，标准化要除以 2——若误除以 4 会得到 \\(P\\{-1<Z<1\\}=2\\Phi(1)-1\\)，这正是干扰项 B。' },
                        { step: 4, title: '结论', content: '<br>\\(P\\{-2<Z<2\\}=\\Phi(2)-\\Phi(-2)=\\Phi(2)-[1-\\Phi(2)]=2\\Phi(2)-1\\)，选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：正态标准化概率计算（计算维度），难度对标 2025 年数一第 8 题' }
                },
                {
                    id: 'm08v3', dimension: '公式',
                    kpIds: ['GL.16.3'], kpNames: ['正态分布'],
                    chapter: 'ch16',
                    difficulty: 2,
                    question: '设 \\(X\\sim N(2,9)\\)，则 \\(P\\{1<X<5\\}\\) 等于',
                    options: [
                        'A. \\(\\Phi(1)+\\Phi\\left(\\dfrac{1}{3}\\right)-1\\)',
                        'B. \\(2\\Phi(1)-1\\)',
                        'C. \\(\\Phi(3)\\)',
                        'D. \\(\\Phi(1)-\\Phi\\left(\\dfrac{1}{3}\\right)\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '标准化公式', note: '\\(Z=\\dfrac{X-2}{3}\\sim N(0,1)\\)。' },
                        { name: 'Φ 的对称性', note: '\\(\\Phi\\left(-\\dfrac{1}{3}\\right)=1-\\Phi\\left(\\dfrac{1}{3}\\right)\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '标准化', content: '\\(\\sigma=3\\)，令 \\(Z=\\dfrac{X-2}{3}\\sim N(0,1)\\)。' },
                        { step: 2, title: '改写并展开', content: '<br>\\(P\\{1<X<5\\}=P\\left\\{\\dfrac{1-2}{3}<Z<\\dfrac{5-2}{3}\\right\\}=P\\left\\{-\\dfrac{1}{3}<Z<1\\right\\}\\)<br>\\(=\\Phi(1)-\\Phi\\left(-\\dfrac{1}{3}\\right)\\)' },
                        { step: 3, title: '数值验证', content: '查表：\\(\\Phi(1)\\approx0.8413\\)，\\(\\Phi\\left(\\dfrac{1}{3}\\right)\\approx0.6293\\)，代入得 <br>\\(P\\{1<X<5\\}\\approx0.8413+0.6293-1=0.4706\\)<br>合理性检验：\\(X\\sim N(2,9)\\) 的 \\(1\\sigma\\) 区间 \\((2-3,2+3)=(-1,5)\\) 概率约为 0.6827，本题区间 \\((1,5)\\) 是它的子区间，概率应小于 0.6827，\\(0.4706\\) 合理。' },
                        { step: 4, title: '结论', content: '<br>\\(P\\{1<X<5\\}=\\Phi(1)+\\Phi\\left(\\dfrac{1}{3}\\right)-1\\)，选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：正态标准化公式应用（公式维度），难度偏低，对标 2021 年数一第 8 题' }
                },
                {
                    id: 'm08v4', dimension: '创新',
                    kpIds: ['GL.16.3', 'GL.18.2'], kpNames: ['正态分布', '数字特征'],
                    chapter: 'ch16',
                    difficulty: 3,
                    question: '设 \\(X,Y\\) 相互独立，\\(X\\sim N(0,1)\\)，\\(Y\\sim N(1,4)\\)，则 \\(D(2X-3Y)\\) 等于',
                    options: [
                        'A. 13',
                        'B. 40',
                        'C. 30',
                        'D. 22'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '独立变量的线性组合方差', note: '\\(D(2X-3Y)=2^2D(X)+(-3)^2D(Y)\\)（独立 → 协方差为 0）。' }
                    ],
                    solution: [
                        { step: 1, title: '写出方差公式', content: '由独立性 \\(\\mathrm{Cov}(X,Y)=0\\)：<br>\\(D(2X-3Y)=2^2D(X)+(-3)^2D(Y)\\)' },
                        { step: 2, title: '代入数值', content: '<br>\\(=4\\cdot1+9\\cdot4=4+36=40\\)' },
                        { step: 3, title: '易错提醒（系数平方与交叉项）', content: '① 线性组合的方差中系数要平方：\\(2^2D(X)+(-3)^2D(Y)\\)，若直接用系数本身会得到 \\(2\\times1+(-3)\\times4=-10\\)（错误）。② 交叉项 \\(2\\cdot2\\cdot(-3)\\mathrm{Cov}(X,Y)\\) 因 \\(X,Y\\) 独立而为零；若题目未给独立性，则必须保留该项：\\(D(2X-3Y)=4D(X)+9D(Y)-12\\mathrm{Cov}(X,Y)\\)。③ 本题给出的是正态分布，但求解只用方差性质即可，正态性并不影响答案——这是命题常见的干扰设计。' },
                        { step: 4, title: '结论', content: '选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：串联正态分布与方差性质（创新维度），难度对标 2024 年数一第 9 题' }
                }
            ]
        },

        /* ==================================================================
         * m10 · 题位 10 · 概率/选择题 · 无偏估计
         * 母题来源：2023 年数一第 10 题（原题）
         * ================================================================== */
        {
            id: 'm10',
            slot: 10,
            type: '选择题',
            score: 5,
            part: '概率',
            topic: '无偏估计与正态分布绝对值期望',
            difficulty: 3,
            kpIds: ['GL.20.1'],
            kpNames: ['无偏估计', '正态分布'],
            chapter: 'ch20',
            question: '设 \\(X_1,X_2\\) 为来自总体 \\(N(\\mu,\\sigma^2)\\) 的简单随机样本，其中 \\(\\sigma(\\sigma>0)\\) 是未知参数。若 \\(\\hat{\\sigma}=a|X_1-X_2|\\) 为 \\(\\sigma\\) 的无偏估计，则 \\(a=\\)',
            options: [
                'A. \\(\\dfrac{\\sqrt{\\pi}}{2}\\)',
                'B. \\(\\dfrac{\\sqrt{2\\pi}}{2}\\)',
                'C. \\(\\sqrt{\\pi}\\)',
                'D. \\(\\sqrt{2\\pi}\\)'
            ],
            answer: 'A',
            concepts: [
                { name: '无偏估计的定义', note: '\\(\\hat{\\theta}\\) 是 \\(\\theta\\) 的无偏估计 \\(\\iff E(\\hat{\\theta})=\\theta\\)。' },
                { name: '独立正态变量之差', note: '\\(Y=X_1-X_2\\sim N(0,2\\sigma^2)\\)（期望相减为 0，方差相加）。' },
                { name: '正态绝对值期望', note: '\\(X\\sim N(\\mu,\\sigma^2)\\)，则 \\(E|X-\\mu|=\\sqrt{\\dfrac{2}{\\pi}}\\sigma\\)。' }
            ],
            solution: [
                { step: 1, title: '求 \\(Y=X_1-X_2\\) 的分布', content: '独立同分布 \\(N(\\mu,\\sigma^2)\\)：<br>\\(E(Y)=\\mu-\\mu=0\\)，\\(D(Y)=\\sigma^2+\\sigma^2=2\\sigma^2\\)<br>故 \\(Y\\sim N(0,2\\sigma^2)\\)，标准差 \\(\\sqrt{2}\\sigma\\)。' },
                { step: 2, title: '套正态绝对值期望公式', content: '由 \\(E|Z-\\mu|=\\sqrt{\\frac{2}{\\pi}}\\sigma_Z\\)：<br>\\(E|Y|=\\sqrt{\\dfrac{2}{\\pi}}\\cdot\\sqrt{2}\\sigma=\\dfrac{2\\sigma}{\\sqrt{\\pi}}\\)' },
                { step: 3, title: '补充：绝对值期望公式的推导（零跳步）', content: '对标准正态 \\(Z\\sim N(0,1)\\)：<br>\\(E|Z|=\\int_{-\\infty}^{+\\infty}|z|\\dfrac{1}{\\sqrt{2\\pi}}\\mathrm{e}^{-z^2/2}\\,\\mathrm{d}z=2\\int_0^{+\\infty}z\\dfrac{1}{\\sqrt{2\\pi}}\\mathrm{e}^{-z^2/2}\\,\\mathrm{d}z\\)<br>令 \\(u=\\dfrac{z^2}{2}\\)（\\(\\mathrm{d}u=z\\,\\mathrm{d}z\\)）：<br>\\(=\\dfrac{2}{\\sqrt{2\\pi}}\\int_0^{+\\infty}\\mathrm{e}^{-u}\\,\\mathrm{d}u=\\dfrac{2}{\\sqrt{2\\pi}}\\cdot1=\\sqrt{\\dfrac{2}{\\pi}}\\)<br>于是由 \\(\\dfrac{Y}{\\sqrt2\\sigma}\\sim N(0,1)\\) 得 \\(E|Y|=\\sqrt{2}\\sigma\\cdot\\sqrt{\\dfrac{2}{\\pi}}=\\dfrac{2\\sigma}{\\sqrt{\\pi}}\\)，与步骤 2 一致。' },
                { step: 4, title: '结论', content: '<br>\\(E(\\hat{\\sigma})=aE|Y|=a\\cdot\\dfrac{2\\sigma}{\\sqrt{\\pi}}=\\sigma\\ \\Rightarrow\\ a=\\dfrac{\\sqrt{\\pi}}{2}\\)，选 A。' }
            ],
            source: { rank: 1, label: '真题', detail: '2023 年数学一第 10 题（原题）' },
            variants: [
                {
                    id: 'm10v1', dimension: '概念',
                    kpIds: ['GL.20.1'], kpNames: ['无偏估计'],
                    chapter: 'ch20',
                    difficulty: 3,
                    question: '设 \\(\\hat{\\theta}_1\\)，\\(\\hat{\\theta}_2\\) 都是参数 \\(\\theta\\) 的无偏估计，则下列估计量中仍为 \\(\\theta\\) 的无偏估计的是',
                    options: [
                        'A. \\(\\hat{\\theta}_1+\\hat{\\theta}_2\\)',
                        'B. \\(2\\hat{\\theta}_1-\\hat{\\theta}_2\\)',
                        'C. \\(\\hat{\\theta}_1\\hat{\\theta}_2\\)',
                        'D. \\(\\dfrac{\\hat{\\theta}_1}{2}\\)'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '无偏性对线性运算', note: '\\(E(c_1\\hat\\theta_1+c_2\\hat\\theta_2)=c_1E(\\hat\\theta_1)+c_2E(\\hat\\theta_2)\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '用期望的线性性逐项检查', content: '已知 \\(E(\\hat\\theta_1)=E(\\hat\\theta_2)=\\theta\\)。<br>A：\\(E(\\hat\\theta_1+\\hat\\theta_2)=2\\theta\\ne\\theta\\)。B：<br>\\(E(2\\hat\\theta_1-\\hat\\theta_2)=2\\theta-\\theta=\\theta\\) ✓' },
                        { step: 2, title: '检查 C、D', content: 'C：\\(E(\\hat\\theta_1\\hat\\theta_2)\\) 一般不等于 \\(\\theta^2\\)（更不等于 \\(\\theta\\)）。D：\\(E\\left(\\dfrac{\\hat\\theta_1}{2}\\right)=\\dfrac{\\theta}{2}\\ne\\theta\\)。' },
                        { step: 3, title: '补充：C 为何一般不成立（反例）', content: '\\(E(\\hat\\theta_1\\hat\\theta_2)=E(\\hat\\theta_1)E(\\hat\\theta_2)\\) 仅在两个估计量独立时成立，而 \\(\\hat\\theta_1,\\hat\\theta_2\\) 通常由同一组样本构造、并不独立。反例：设 \\(\\hat\\theta_1=\\hat\\theta_2=X\\)（\\(E(X)=\\theta\\)），则 \\(E(\\hat\\theta_1\\hat\\theta_2)=E(X^2)=D(X)+\\theta^2\\)，一般不等于 \\(\\theta\\)（除非退化情形 \\(D(X)=0\\) 且 \\(\\theta=\\theta^2\\)）。故 C 不能保证无偏。' },
                        { step: 4, title: '结论', content: '选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：无偏估计的线性组合（概念维度），难度对标 2023 年数一第 10 题' }
                },
                {
                    id: 'm10v2', dimension: '计算',
                    kpIds: ['GL.20.1'], kpNames: ['无偏估计', '样本方差'],
                    chapter: 'ch20',
                    difficulty: 3,
                    question: '设 \\(X_1,\\cdots,X_n\\) 为来自总体 \\(N(\\mu,\\sigma^2)\\) 的简单随机样本，\\(\\bar{X}\\) 为样本均值，则 \\(\\hat{\\sigma}^2=\\dfrac{1}{n}\\sum_{i=1}^n(X_i-\\bar{X})^2\\) 的期望 \\(E(\\hat{\\sigma}^2)\\) 为',
                    options: [
                        'A. \\(\\sigma^2\\)',
                        'B. \\(\\dfrac{n-1}{n}\\sigma^2\\)',
                        'C. \\(\\dfrac{n}{n-1}\\sigma^2\\)',
                        'D. \\(\\dfrac{1}{n}\\sigma^2\\)'
                    ],
                    answer: 'B',
                    concepts: [
                        { name: '样本方差的期望', note: '\\(S^2=\\dfrac{1}{n-1}\\sum(X_i-\\bar{X})^2\\) 是 \\(\\sigma^2\\) 的无偏估计，即 \\(E(S^2)=\\sigma^2\\)。' },
                        { name: '无偏与有偏的关系', note: '\\(\\dfrac{1}{n}\\sum(X_i-\\bar{X})^2=\\dfrac{n-1}{n}S^2\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '改写为样本方差', content: '记 \\(S^2=\\dfrac{1}{n-1}\\sum_{i=1}^n(X_i-\\bar{X})^2\\)，则 <br>\\(\\hat{\\sigma}^2=\\dfrac{1}{n}\\sum(X_i-\\bar{X})^2=\\dfrac{n-1}{n}S^2\\)' },
                        { step: 2, title: '利用 \\(E(S^2)=\\sigma^2\\)', content: '<br>\\(E(\\hat{\\sigma}^2)=\\dfrac{n-1}{n}E(S^2)=\\dfrac{n-1}{n}\\sigma^2\\)<br>即 \\(\\hat{\\sigma}^2\\) 是 \\(\\sigma^2\\) 的有偏估计（偏小）。' },
                        { step: 3, title: '补充：\\(E(S^2)=\\sigma^2\\) 的推导（零跳步）', content: '关键恒等式 \\(\\sum_{i=1}^n(X_i-\\bar X)^2=\\sum_{i=1}^n X_i^2-n\\bar X^2\\)。两边取期望：<br>\\(E\\left[\\sum(X_i-\\bar X)^2\\right]=\\sum E(X_i^2)-nE(\\bar X^2)\\)<br>其中 \\(E(X_i^2)=D(X_i)+[E(X_i)]^2=\\sigma^2+\\mu^2\\)，<br>\\(E(\\bar X^2)=D(\\bar X)+[E(\\bar X)]^2=\\dfrac{\\sigma^2}{n}+\\mu^2\\)。<br>代入：\\(=n(\\sigma^2+\\mu^2)-n\\left(\\dfrac{\\sigma^2}{n}+\\mu^2\\right)=(n-1)\\sigma^2\\)<br>故 \\(E(S^2)=\\dfrac{1}{n-1}(n-1)\\sigma^2=\\sigma^2\\)，即 \\(S^2\\) 是 \\(\\sigma^2\\) 的无偏估计。' },
                        { step: 4, title: '结论', content: '选 B。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：样本方差期望计算（计算维度），难度对标 2021 年数一第 9 题' }
                },
                {
                    id: 'm10v3', dimension: '公式',
                    kpIds: ['GL.20.2', 'GL.18.2'], kpNames: ['样本均值', '方差'],
                    chapter: 'ch20',
                    difficulty: 2,
                    question: '设 \\(X_1,\\cdots,X_n\\) 为来自总体 \\(X\\) 的简单随机样本，\\(D(X)=\\sigma^2\\)，\\(\\bar{X}\\) 为样本均值，则 \\(D(\\bar{X})\\) 等于',
                    options: [
                        'A. \\(\\sigma^2\\)',
                        'B. \\(n\\sigma^2\\)',
                        'C. \\(\\dfrac{\\sigma^2}{n}\\)',
                        'D. \\(\\dfrac{\\sigma^2}{n^2}\\)'
                    ],
                    answer: 'C',
                    concepts: [
                        { name: '样本均值的方差', note: '\\(D(\\bar{X})=D\\left(\\dfrac{X_1+\\cdots+X_n}{n}\\right)=\\dfrac{1}{n^2}\\sum D(X_i)=\\dfrac{\\sigma^2}{n}\\)（独立同分布）。' }
                    ],
                    solution: [
                        { step: 1, title: '把 \\(\\bar{X}\\) 写成线性组合', content: '<br>\\(\\bar{X}=\\dfrac{X_1+X_2+\\cdots+X_n}{n}=\\sum_{i=1}^n\\dfrac{1}{n}X_i\\)' },
                        { step: 2, title: '套方差性质（独立）', content: '<br>\\(D(\\bar{X})=\\sum_{i=1}^n\\left(\\dfrac{1}{n}\\right)^2D(X_i)=n\\cdot\\dfrac{1}{n^2}\\sigma^2=\\dfrac{\\sigma^2}{n}\\)' },
                        { step: 3, title: '易错提醒（为什么交叉项消失）', content: '若把方差展开完整写出来：<br>\\(D(\\bar X)=D\\left(\\sum_{i=1}^n\\frac{X_i}{n}\\right)=\\sum_{i=1}^n\\frac{D(X_i)}{n^2}+2\\sum_{1\\le i<j\\le n}\\frac{\\mathrm{Cov}(X_i,X_j)}{n^2}\\)<br>因 \\(X_1,\\cdots,X_n\\) 是简单随机样本（相互独立），\\(\\mathrm{Cov}(X_i,X_j)=0\\)，交叉项全部为 0，只剩第一项 \\(n\\cdot\\dfrac{\\sigma^2}{n^2}=\\dfrac{\\sigma^2}{n}\\)。若题目改为样本不独立，则必须保留协方差项。' },
                        { step: 4, title: '结论', content: '选 C。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：样本均值方差公式（公式维度），难度偏低，对标 2021 年数一第 16 题' }
                },
                {
                    id: 'm10v4', dimension: '创新',
                    kpIds: ['GL.20.1', 'GL.16.1'], kpNames: ['无偏估计', '均匀分布'],
                    chapter: 'ch20',
                    difficulty: 4,
                    question: '设总体 \\(X\\sim U(0,\\theta)\\)（\\(\\theta>0\\) 未知），\\(X_1,\\cdots,X_n\\) 为简单随机样本，\\(\\bar{X}\\) 为样本均值，则关于 \\(\\hat{\\theta}=2\\bar{X}\\) 的说法正确的是',
                    options: [
                        'A. \\(\\hat{\\theta}\\) 是 \\(\\theta\\) 的无偏估计',
                        'B. \\(\\hat{\\theta}\\) 不是 \\(\\theta\\) 的无偏估计',
                        'C. \\(E(\\hat{\\theta})=\\theta/2\\)',
                        'D. \\(\\hat{\\theta}\\) 的期望不存在'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '均匀分布的期望', note: '\\(U(0,\\theta)\\) 的期望 \\(E(X)=\\dfrac{\\theta}{2}\\)。' },
                        { name: '期望的线性性', note: '\\(E(2\\bar{X})=2E(\\bar{X})=2\\cdot\\dfrac{1}{n}\\sum E(X_i)\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '求 \\(E(X)\\)', content: '均匀分布 \\(U(0,\\theta)\\) 的期望 <br>\\(E(X)=\\dfrac{0+\\theta}{2}=\\dfrac{\\theta}{2}\\)' },
                        { step: 2, title: '求 \\(E(\\bar{X})\\) 与 \\(E(\\hat\\theta)\\)', content: '<br>\\(E(\\bar{X})=\\dfrac{1}{n}\\sum_{i=1}^nE(X_i)=\\dfrac{\\theta}{2}\\)<br>\\(E(\\hat\\theta)=E(2\\bar{X})=2\\cdot\\dfrac{\\theta}{2}=\\theta\\)<br>满足无偏定义 \\(E(\\hat\\theta)=\\theta\\)。' },
                        { step: 3, title: '补充：无偏性的含义与易错点', content: '"无偏"指估计量的期望等于被估参数：\\(E(\\hat\\theta)=\\theta\\)，并不要求某一次抽样值恰等于 \\(\\theta\\)（那不可能保证）。注意 \\(E(\\bar X)=\\theta/2\\) 来自期望线性性且与 \\(n\\) 无关，故 \\(E(2\\bar X)=\\theta\\) 恒成立。若误把 \\(\\bar X\\) 当作 \\(\\theta\\) 的无偏估计则错——\\(\\bar X\\) 是 \\(\\theta/2\\) 的无偏估计，这正是系数要取 2 的原因。' },
                        { step: 4, title: '结论', content: '\\(\\hat\\theta=2\\bar{X}\\) 是 \\(\\theta\\) 的无偏估计，选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：串联均匀分布期望与无偏估计（创新维度），难度对标 2023 年数一第 10 题' }
                }
            ]
        },
        /* ==================================================================
         * m11 · 题位 11 · 高数/填空题 · 极限与等价无穷小
         * 母题来源：2025 年数一第 11 题（原题）
         * ================================================================== */
        {
            id: 'm11',
            slot: 11,
            type: '填空题',
            score: 5,
            part: '高数',
            topic: '幂指函数极限与等价无穷小',
            difficulty: 3,
            kpIds: ['GS.1.3'],
            kpNames: ['极限', '等价无穷小'],
            chapter: 'ch01',
            question: '\\(\\displaystyle\\lim_{x\\to0^+}\\frac{x^x-1}{\\ln x\\cdot\\ln(1-x)}=\\underline{\\qquad}\\)',
            options: [],
            answer: '-1',
            concepts: [
                { name: '幂指函数化指数', note: '\\(x^x=\\mathrm{e}^{x\\ln x}\\)（恒等变形，\\(x>0\\)）。' },
                { name: '等价无穷小', note: '当 \\(u\\to0\\) 时 \\(\\mathrm{e}^u-1\\sim u\\)；当 \\(x\\to0\\) 时 \\(\\ln(1-x)\\sim -x\\)。' },
                { name: '\\(x\\ln x\\) 的极限', note: '\\(x\\to0^+\\) 时 \\(x\\ln x\\to0\\)（常用结论，可用洛必达验证）。' }
            ],
            solution: [
                { step: 1, title: '化幂指函数为指数形式', content: '<br>\\(x^x=\\mathrm{e}^{x\\ln x}\\)<br>当 \\(x\\to0^+\\) 时 \\(x\\ln x\\to0\\)，所以 <br>\\(x^x-1=\\mathrm{e}^{x\\ln x}-1\\sim x\\ln x\\)（套等价无穷小 \\(\\mathrm{e}^u-1\\sim u\\)）。' },
                { step: 2, title: '化简分母', content: '当 \\(x\\to0\\) 时 \\(\\ln(1-x)\\sim -x\\)，故<br>\\(\\ln x\\cdot\\ln(1-x)\\sim\\ln x\\cdot(-x)=-x\\ln x\\)' },
                { step: 3, title: '易错提醒（哪些地方可替换、哪些不能）', content: '分母中 \\(\\ln x\\to-\\infty\\)，它本身不是无穷小，绝不能做等价替换；但 \\(\\ln(1-x)\\sim-x\\) 是无穷小且作为"乘除因子"出现，替换合法。分子 \\(x^x-1=\\mathrm{e}^{x\\ln x}-1\\sim x\\ln x\\) 同样是乘除因子替换。若误把 \\(x^x-1\\) 用 \\(x-1\\) 之类的式子替换会得到错误结果——本题陷阱就在于此。' },
                { step: 4, title: '代入求极限', content: '<br>\\(\\displaystyle\\lim_{x\\to0^+}\\frac{x^x-1}{\\ln x\\cdot\\ln(1-x)}=\\lim_{x\\to0^+}\\frac{x\\ln x}{-x\\ln x}=-1\\)<br>（分子分母中的 \\(x\\ln x\\) 约去，故填 \\(-1\\)。）' }
            ],
            source: { rank: 1, label: '真题', detail: '2025 年数学一第 11 题（原题）' },
            variants: [
                {
                    id: 'm11v1', dimension: '概念',
                    kpIds: ['GS.1.3'], kpNames: ['等价无穷小'],
                    chapter: 'ch01',
                    difficulty: 3,
                    question: '设 \\(\\alpha(x)\\sim\\beta(x)\\)（\\(x\\to0\\)，\\(\\alpha,\\beta\\to0\\)），则下列说法正确的是',
                    options: [
                        'A. \\(\\alpha(x)-\\beta(x)\\) 必是比 \\(\\alpha(x)\\) 高阶的无穷小',
                        'B. \\(\\alpha(x)-\\beta(x)\\) 必是 \\(\\alpha(x)\\) 的同阶无穷小',
                        'C. \\(\\alpha(x)-\\beta(x)\\) 一定是无穷小，但阶数无法保证',
                        'D. \\(\\alpha(x)-\\beta(x)\\) 不一定是无穷小'
                    ],
                    answer: 'C',
                    concepts: [
                        { name: '等价无穷小定义', note: '\\(\\alpha\\sim\\beta\\) \\(\\iff\\) \\(\\lim\\dfrac{\\alpha}{\\beta}=1\\)，此时 \\(\\alpha-\\beta=o(\\alpha)\\)（比 \\(\\alpha\\) 高阶）是对的定义……但注意 \\(\\alpha=\\beta\\) 时差为 0。' }
                    ],
                    solution: [
                        { step: 1, title: '分析 \\(\\alpha-\\beta\\)', content: '由 \\(\\lim\\dfrac{\\alpha}{\\beta}=1\\) 得 \\(\\alpha=\\beta+o(\\beta)\\)，故 \\(\\alpha-\\beta=o(\\beta)=o(\\alpha)\\)，确实是无穷小且比 \\(\\alpha\\) 高阶。' },
                        { step: 2, title: '说明 C 的合理性', content: '但“高阶”的阶数不确定：若 \\(\\alpha=x,\\ \\beta=x+x^2\\)，则 \\(\\alpha-\\beta=-x^2\\) 是 2 阶；若 \\(\\alpha=\\beta\\)（如都是 \\(x\\)），则 \\(\\alpha-\\beta=0\\) 可视为任意高阶。故只能说“是无穷小，阶数无法保证”，选 C。' },
                        { step: 3, title: '补充：具体实例展示阶数不确定', content: '例 1：\\(\\alpha=x\\)、\\(\\beta=\\sin x\\)，\\(\\alpha\\sim\\beta\\)，\\(\\alpha-\\beta=x-\\sin x\\sim\\dfrac{x^3}{6}\\)（3 阶无穷小）。例 2：\\(\\alpha=x^2\\)、\\(\\beta=x^2-x^3\\)，\\(\\alpha\\sim\\beta\\)，\\(\\alpha-\\beta=x^3\\)（且 \\(\\dfrac{x^3}{x^2}=x\\to0\\)，即 \\(x^3=o(x^2)\\)）。两例中 \\(\\alpha-\\beta\\) 都是比 \\(\\alpha\\) 高阶的无穷小，但阶数各不相同，无法统一保证——这正是 C 的表述。' },
                        { step: 4, title: '排除其余并结论', content: 'A 错：“必是更高阶”的表述在 \\(\\alpha=\\beta\\) 时 \\(\\alpha-\\beta=0\\) 不严谨（0 只能视为任意高阶）；B 错：\\(\\alpha-\\beta\\) 未必与 \\(\\alpha\\) 同阶（例 2 中 \\(x^3\\) 比 \\(x^2\\) 高阶）；D 错：由 \\(\\alpha-\\beta=o(\\alpha)\\to0\\)，差一定是无穷小。选 C。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：等价无穷小的差的性质（概念维度），难度对标 2023 年数一第 11 题' }
                },
                {
                    id: 'm11v2', dimension: '计算',
                    kpIds: ['GS.1.3'], kpNames: ['极限'],
                    chapter: 'ch01',
                    difficulty: 3,
                    question: '\\(\\displaystyle\\lim_{x\\to0}\\frac{x-\\sin x}{x^3}=\\underline{\\qquad}\\)',
                    options: [],
                    answer: '\\(\\dfrac{1}{6}\\)',
                    concepts: [
                        { name: '泰勒展开', note: '\\(\\sin x=x-\\dfrac{x^3}{6}+o(x^3)\\)。' },
                        { name: '洛必达法则', note: '0/0 型可连用三次洛必达。' }
                    ],
                    solution: [
                        { step: 1, title: '判型与思路', content: '当 \\(x\\to0\\) 时分子 \\(x-\\sin x\\to0\\)、分母 \\(x^3\\to0\\)，是 0/0 型未定式。注意：若把 \\(\\sin x\\sim x\\) 直接用于"加减法"内部，会得到 \\(x-x=0\\)（错误），这正说明加减法中不能随意替换，应改用泰勒展开或洛必达。' },
                        { step: 2, title: '方法一：泰勒展开', content: '<br>\\(\\sin x=x-\\dfrac{x^3}{6}+o(x^3)\\ \\Rightarrow\\ x-\\sin x=\\dfrac{x^3}{6}+o(x^3)\\)<br>故原式 \\(=\\dfrac{x^3/6}{x^3}=\\dfrac{1}{6}\\)。' },
                        { step: 3, title: '方法二（验证）：连用洛必达', content: '<br>\\(\\lim_{x\\to0}\\dfrac{x-\\sin x}{x^3}=\\lim_{x\\to0}\\dfrac{1-\\cos x}{3x^2}=\\lim_{x\\to0}\\dfrac{\\sin x}{6x}=\\dfrac16\\)<br>（\\(\\lim\\dfrac{\\sin x}{x}=1\\)。）' },
                        { step: 4, title: '结论', content: '两种方法结果一致：\\(\\displaystyle\\lim_{x\\to0}\\frac{x-\\sin x}{x^3}=\\dfrac16\\)，故填 \\(\\dfrac16\\)。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：\\(x-\\sin x\\) 型极限（计算维度），难度对标 2025 年数一第 11 题' }
                },
                {
                    id: 'm11v3', dimension: '公式',
                    kpIds: ['GS.1.3'], kpNames: ['等价无穷小'],
                    chapter: 'ch01',
                    difficulty: 2,
                    question: '\\(\\displaystyle\\lim_{x\\to0}\\frac{1-\\cos x}{x^2}=\\underline{\\qquad}\\)',
                    options: [],
                    answer: '\\(\\dfrac{1}{2}\\)',
                    concepts: [
                        { name: '等价无穷小', note: '\\(x\\to0\\) 时 \\(1-\\cos x\\sim\\dfrac{x^2}{2}\\)（由倍角公式 \\(1-\\cos x=2\\sin^2\\dfrac x2\\)）。' }
                    ],
                    solution: [
                        { step: 1, title: '判型与公式准备', content: '当 \\(x\\to0\\) 时分子 \\(1-\\cos x\\to0\\)、分母 \\(x^2\\to0\\)，是 0/0 型。由倍角公式 \\(\\cos x=1-2\\sin^2\\dfrac{x}{2}\\)，得 <br>\\(1-\\cos x=2\\sin^2\\dfrac{x}{2}\\)<br>这是后续等价替换的依据。' },
                        { step: 2, title: '写出等价无穷小', content: '<br>\\(1-\\cos x=2\\sin^2\\dfrac{x}{2}\\sim2\\cdot\\left(\\dfrac{x}{2}\\right)^2=\\dfrac{x^2}{2}\\)<br>（用到了 \\(\\sin\\dfrac{x}{2}\\sim\\dfrac{x}{2}\\)。）' },
                        { step: 3, title: '代入求极限', content: '<br>\\(\\displaystyle\\lim_{x\\to0}\\frac{1-\\cos x}{x^2}=\\lim_{x\\to0}\\frac{\\dfrac{x^2}{2}}{x^2}=\\dfrac12\\)' },
                        { step: 4, title: '方法二（验证）：洛必达并结论', content: '0/0 型用洛必达：<br>\\(\\lim_{x\\to0}\\dfrac{1-\\cos x}{x^2}=\\lim_{x\\to0}\\dfrac{\\sin x}{2x}=\\dfrac12\\)<br>（\\(\\lim\\dfrac{\\sin x}{x}=1\\)。）与等价无穷小法结果一致，故填 \\(\\dfrac12\\)。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：\\(1-\\cos x\\) 等价无穷小应用（公式维度），难度偏低，对标 2023 年数一第 11 题' }
                },
                {
                    id: 'm11v4', dimension: '创新',
                    kpIds: ['GS.1.3'], kpNames: ['极限', '幂指函数'],
                    chapter: 'ch01',
                    difficulty: 4,
                    question: '\\(\\displaystyle\\lim_{x\\to0^+}x^x=\\underline{\\qquad}\\)',
                    options: [],
                    answer: '1',
                    concepts: [
                        { name: '幂指函数极限', note: '\\(x^x=\\mathrm{e}^{x\\ln x}\\)，故 \\(\\lim x^x=\\mathrm{e}^{\\lim x\\ln x}\\)。' },
                        { name: '\\(x\\ln x\\to0\\)', note: '令 \\(x=\\dfrac1t\\)：\\(x\\ln x=-\\dfrac{\\ln t}{t}\\to0\\)（\\(t\\to+\\infty\\)，洛必达）。' }
                    ],
                    solution: [
                        { step: 1, title: '恒等变形', content: '<br>\\(x^x=\\mathrm{e}^{x\\ln x}\\)<br>由指数函数连续性，\\(\\lim x^x=\\mathrm{e}^{\\lim x\\ln x}\\)。' },
                        { step: 2, title: '求 \\(\\lim_{x\\to0^+}x\\ln x\\)', content: '令 \\(x=\\dfrac1t\\)（\\(t\\to+\\infty\\)）：<br>\\(x\\ln x=\\dfrac{1}{t}\\ln\\dfrac1t=-\\dfrac{\\ln t}{t}\\)<br>由洛必达：\\(\\lim_{t\\to+\\infty}\\dfrac{\\ln t}{t}=0\\)，故 \\(\\lim x\\ln x=0\\)。' },
                        { step: 3, title: '补充：洛必达的具体计算（零跳步）', content: '<br>\\(\\lim_{t\\to+\\infty}\\frac{\\ln t}{t}\\xlongequal{\\text{洛必达}}\\lim_{t\\to+\\infty}\\frac{1/t}{1}=\\lim_{t\\to+\\infty}\\frac{1}{t}=0\\)<br>所以 \\(x\\ln x=-\\dfrac{\\ln t}{t}\\to0\\)。直觉验证：取 \\(x=10^{-k}\\)，则 \\(x\\ln x=-k\\ln10\\cdot10^{-k}\\to0\\)（指数衰减快于线性增长）。' },
                        { step: 4, title: '结论', content: '<br>\\(\\lim_{x\\to0^+}x^x=\\mathrm{e}^{\\lim x\\ln x}=\\mathrm{e}^0=1\\)，故填 1。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：幂指函数极限（创新维度），难度对标 2025 年数一第 11 题' }
                }
            ]
        },

        /* ==================================================================
         * m12 · 题位 12 · 高数/填空题 · 复合函数二阶导
         * 母题来源：2024 年数一第 12 题（原题）
         * ================================================================== */
        {
            id: 'm12',
            slot: 12,
            type: '填空题',
            score: 5,
            part: '高数',
            topic: '多元复合函数求二阶导（全微分定偏导）',
            difficulty: 3,
            kpIds: ['GS.5.1', 'GS.5.2'],
            kpNames: ['复合函数求导', '全微分'],
            chapter: 'ch05',
            question: '设 \\(z=f(u,v)\\) 有二阶连续偏导数，\\(\\mathrm{d}f\\big|_{(1,1)}=3\\,\\mathrm{d}u+4\\,\\mathrm{d}v\\)，\\(y=f(\\cos x,\\ 1+x^2)\\)，则 \\(\\dfrac{\\mathrm{d}^2y}{\\mathrm{d}x^2}\\Bigg|_{x=0}=\\underline{\\qquad}\\)',
            options: [],
            answer: '5',
            concepts: [
                { name: '全微分与一阶偏导', note: '\\(\\mathrm{d}f=f_u\\,\\mathrm{d}u+f_v\\,\\mathrm{d}v\\)，由 \\(\\mathrm{d}f\\big|_{(1,1)}=3\\,\\mathrm{d}u+4\\,\\mathrm{d}v\\) 得 \\(f_u(1,1)=3\\)，\\(f_v(1,1)=4\\)。' },
                { name: '多元链式法则（二阶）', note: '\\(y\'\'=f_{uu}(u\')^2+2f_{uv}u\'v\'+f_{vv}(v\')^2+f_u u\'\'+f_v v\'\'\\)。' },
                { name: '在特殊点化简', note: '\\(x=0\\) 时 \\(u=1,v=1\\) 且 \\(u\'(0)=v\'(0)=0\\)，含 \\(u\'v\'\\) 的项全部为 0。' }
            ],
            solution: [
                { step: 1, title: '由全微分读出一阶偏导', content: '由 \\(\\mathrm{d}f\\big|_{(1,1)}=3\\,\\mathrm{d}u+4\\,\\mathrm{d}v\\) 对照全微分 \\(\\mathrm{d}f=f_u\\,\\mathrm{d}u+f_v\\,\\mathrm{d}v\\)：<br>\\(f_u(1,1)=3\\)，\\(f_v(1,1)=4\\)。' },
                { step: 2, title: '设中间变量并求导', content: '令 \\(u=\\cos x\\)，\\(v=1+x^2\\)。则<br>\\(u\'=-\\sin x\\)，\\(u\'\'=-\\cos x\\)；\\(v\'=2x\\)，\\(v\'\'=2\\)。<br>在 \\(x=0\\) 处：\\(u=1,\\ v=1\\)，\\(u\'(0)=0\\)，\\(v\'(0)=0\\)，\\(u\'\'(0)=-1\\)，\\(v\'\'(0)=2\\)。' },
                { step: 3, title: '写二阶链式法则', content: '<br>\\(y\'\'(x)=f_{uu}(u\')^2+2f_{uv}u\'v\'+f_{vv}(v\')^2+f_u u\'\'+f_v v\'\'\\)' },
                { step: 4, title: '代入 \\(x=0\\) 化简求值', content: '因 \\(u\'(0)=v\'(0)=0\\)，含 \\((u\')^2,\\ u\'v\',\\ (v\')^2\\) 的项都为 0，只剩：<br>\\(y\'\'(0)=f_u(1,1)u\'\'(0)+f_v(1,1)v\'\'(0)=3\\cdot(-1)+4\\cdot2=-3+8=5\\)<br>故填 \\(5\\)。' }
            ],
            source: { rank: 1, label: '真题', detail: '2024 年数学一第 12 题（原题）' },
            variants: [
                {
                    id: 'm12v1', dimension: '概念',
                    kpIds: ['GS.5.1'], kpNames: ['链式法则'],
                    chapter: 'ch05',
                    difficulty: 3,
                    question: '设 \\(z=f(u,v)\\)，\\(u=g(x,y)\\)，\\(v=h(x,y)\\)，则 \\(\\dfrac{\\partial z}{\\partial x}\\) 等于',
                    options: [
                        'A. \\(f_u\\cdot g_x+f_v\\cdot h_x\\)',
                        'B. \\(f_u\\cdot g_x+f_v\\cdot h_y\\)',
                        'C. \\(f_u\\cdot g_y+f_v\\cdot h_x\\)',
                        'D. \\(f_u\\cdot f_x+f_v\\cdot f_y\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '多元链式法则', note: '\\(z\\) 经 \\(u,v\\) 依赖 \\(x,y\\)，对 \\(x\\) 求偏导时两条路径都要走：\\(\\dfrac{\\partial z}{\\partial x}=f_u\\dfrac{\\partial u}{\\partial x}+f_v\\dfrac{\\partial v}{\\partial x}\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '明确复合关系与记号', content: '\\(z=f(u,v)\\)，其中 \\(u=g(x,y)\\)、\\(v=h(x,y)\\)。求 \\(\\partial z/\\partial x\\) 时把 \\(y\\) 视为常数；\\(z\\) 不直接含 \\(x\\)，\\(x\\) 只能通过中间变量 \\(u,v\\) 影响 \\(z\\)，所以要对两条路径分别求偏导再相加。' },
                        { step: 2, title: '画依赖关系', content: '\\(z\\to u,v\\)，\\(u,v\\to x\\)。对 \\(x\\) 求偏导，路径有两条：\\(z\\to u\\to x\\) 和 \\(z\\to v\\to x\\)。' },
                        { step: 3, title: '写链式法则', content: '<br>\\(\\dfrac{\\partial z}{\\partial x}=\\dfrac{\\partial z}{\\partial u}\\cdot\\dfrac{\\partial u}{\\partial x}+\\dfrac{\\partial z}{\\partial v}\\cdot\\dfrac{\\partial v}{\\partial x}=f_u\\cdot g_x+f_v\\cdot h_x\\)' },
                        { step: 4, title: '排除干扰项并结论', content: 'B 把第二项写成 \\(f_v\\cdot h_y\\)，是对 \\(y\\) 求偏导，与"对 \\(x\\) 求偏导"不符；C 写成 \\(f_u\\cdot g_y+f_v\\cdot h_x\\)，第一项也错；D 把 \\(g,h\\) 误写成 \\(f_x,f_y\\)，混淆了函数 \\(f\\) 与中间变量 \\(g,h\\)。只有 A 正确，选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：多元复合链式法则（概念维度），难度对标 2024 年数一第 12 题' }
                },
                {
                    id: 'm12v2', dimension: '计算',
                    kpIds: ['GS.5.1'], kpNames: ['复合函数求导'],
                    chapter: 'ch05',
                    difficulty: 3,
                    question: '设 \\(z=f(x^2,\\sin x)\\)，\\(f\\) 可微，则 \\(\\dfrac{\\mathrm{d}z}{\\mathrm{d}x}\\) 等于',
                    options: [
                        'A. \\(2x f_u+\\cos x\\, f_v\\)',
                        'B. \\(x^2 f_u+\\sin x\\, f_v\\)',
                        'C. \\(2x f_u-\\cos x\\, f_v\\)',
                        'D. \\(2x f_u\\cdot\\cos x\\, f_v\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '一元复合（链式）', note: '\\(\\dfrac{\\mathrm{d}z}{\\mathrm{d}x}=f_u\\cdot\\dfrac{\\mathrm{d}u}{\\mathrm{d}x}+f_v\\cdot\\dfrac{\\mathrm{d}v}{\\mathrm{d}x}\\)，其中 \\(u=x^2\\)、\\(v=\\sin x\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '明确复合结构', content: '\\(z=f(u,v)\\)，其中 \\(u=x^2\\)、\\(v=\\sin x\\) 都是一元函数。\\(z\\) 通过 \\(u,v\\) 依赖唯一的自变量 \\(x\\)，用全导数公式（一元情形下的链式法则）：<br>\\(\\dfrac{\\mathrm{d}z}{\\mathrm{d}x}=\\dfrac{\\partial z}{\\partial u}\\cdot\\dfrac{\\mathrm{d}u}{\\mathrm{d}x}+\\dfrac{\\partial z}{\\partial v}\\cdot\\dfrac{\\mathrm{d}v}{\\mathrm{d}x}\\)' },
                        { step: 2, title: '识别中间变量', content: '令 \\(u=x^2\\)、\\(v=\\sin x\\)，\\(z=f(u,v)\\)。' },
                        { step: 3, title: '套链式法则', content: '<br>\\(\\dfrac{\\mathrm{d}z}{\\mathrm{d}x}=f_u\\cdot\\dfrac{\\mathrm{d}u}{\\mathrm{d}x}+f_v\\cdot\\dfrac{\\mathrm{d}v}{\\mathrm{d}x}=f_u\\cdot2x+f_v\\cdot\\cos x\\)<br>（\\(\\dfrac{\\mathrm{d}}{\\mathrm{d}x}x^2=2x\\)，\\(\\dfrac{\\mathrm{d}}{\\mathrm{d}x}\\sin x=\\cos x\\)。）' },
                        { step: 4, title: '排除干扰项并结论', content: 'B 把 \\(\\mathrm{d}u/\\mathrm{d}x\\) 错写成 \\(u\\) 本身（用 \\(x^2\\) 而非 \\(2x\\)）；C 中 \\(\\cos x\\) 前符号错误（应为 \\(+f_v\\cos x\\)）；D 把两条路径的导数相乘而不是相加。只有 A 正确，选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：一元复合函数链式求导（计算维度），难度对标 2021 年数一第 2 题' }
                },
                {
                    id: 'm12v3', dimension: '公式',
                    kpIds: ['GS.5.2'], kpNames: ['全微分'],
                    chapter: 'ch05',
                    difficulty: 3,
                    question: '设 \\(z=f(u,v)\\) 可微，且 \\(\\mathrm{d}z=2\\,\\mathrm{d}u+3\\,\\mathrm{d}v\\) 在 \\((1,2)\\) 处成立，则 \\(f_u(1,2)\\) 与 \\(f_v(1,2)\\) 分别为',
                    options: [
                        'A. \\(2\\) 和 \\(3\\)',
                        'B. \\(3\\) 和 \\(2\\)',
                        'C. \\(2\\) 和 \\(2\\)',
                        'D. \\(3\\) 和 \\(3\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '全微分公式', note: '\\(\\mathrm{d}z=f_u\\,\\mathrm{d}u+f_v\\,\\mathrm{d}v\\)，系数即偏导数。' }
                    ],
                    solution: [
                        { step: 1, title: '写出全微分公式', content: '\\(z=f(u,v)\\) 在 \\((1,2)\\) 可微，则 <br>\\(\\mathrm{d}z\\big|_{(1,2)}=f_u(1,2)\\,\\mathrm{d}u+f_v(1,2)\\,\\mathrm{d}v\\)<br>全微分表达式中 \\(\\mathrm{d}u\\)、\\(\\mathrm{d}v\\) 的系数正是两个一阶偏导数。' },
                        { step: 2, title: '对照全微分公式', content: '<br>\\(\\mathrm{d}z=f_u(1,2)\\,\\mathrm{d}u+f_v(1,2)\\,\\mathrm{d}v=2\\,\\mathrm{d}u+3\\,\\mathrm{d}v\\)' },
                        { step: 3, title: '对比系数', content: '<br>\\(f_u(1,2)=2\\)，\\(f_v(1,2)=3\\)' },
                        { step: 4, title: '易错提醒并结论', content: '常见错误：把 \\(f_u\\) 与 \\(f_v\\) 的值记反（得到 3、2）。记住"\\(\\mathrm{d}u\\) 的系数是 \\(f_u\\)、\\(\\mathrm{d}v\\) 的系数是 \\(f_v\\)"，与自变量的书写顺序一一对应即可。故 \\(f_u(1,2)=2\\)、\\(f_v(1,2)=3\\)，选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：由全微分读偏导数（公式维度），难度对标 2024 年数一第 12 题' }
                },
                {
                    id: 'm12v4', dimension: '创新',
                    kpIds: ['GS.5.1', 'GS.2.2'], kpNames: ['复合求导', '一元二阶导'],
                    chapter: 'ch05',
                    difficulty: 4,
                    question: '设 \\(y=f(\\cos x)\\)，且 \\(f\'(1)=2\\)，\\(f\'\'(1)=1\\)，则 \\(y\'\'(0)\\) 等于',
                    options: [
                        'A. -2',
                        'B. 2',
                        'C. -1',
                        'D. 1'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '一元复合二阶导', note: '\\(y\'\'=f\'\'(u)(u\')^2+f\'(u)u\'\'\\)，其中 \\(u=\\cos x\\)。' },
                        { name: '特殊点取值', note: '\\(x=0\\) 时 \\(u=1\\)，\\(u\'(0)=0\\)，\\(u\'\'(0)=-1\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '写一元复合二阶导公式', content: '令 \\(u=\\cos x\\)：<br>\\(y\'(x)=f\'(u)\\cdot u\'=f\'(\\cos x)(-\\sin x)\\)<br>\\(y\'\'(x)=f\'\'(u)(u\')^2+f\'(u)u\'\'=f\'\'(\\cos x)\\sin^2x+f\'(\\cos x)(-\\cos x)\\)' },
                        { step: 2, title: '代入 \\(x=0\\)', content: '\\(x=0\\) 时 \\(\\cos x=1\\)、\\(\\sin x=0\\)：<br>\\(y\'\'(0)=f\'\'(1)\\cdot0+f\'(1)\\cdot(-1)=2\\cdot(-1)=-2\\)' },
                        { step: 3, title: '易错提醒（二阶导的两项来源）', content: '复合函数二阶导 \\(y\'\'=f\'\'(u)(u\')^2+f\'(u)u\'\'\\) 有两项：第一项来自 \\(f\'(u)\\) 对 \\(x\\) 的链式求导，第二项来自内层 \\(u\'\\) 对 \\(x\\) 的求导。本题 \\(u\'(0)=-\\sin0=0\\) 使第一项为 0，真正起作用的是第二项 \\(f\'(1)u\'\'(0)=2\\cdot(-1)=-2\\)。若只写第一项会得到 0，漏算第二项是常见错误。' },
                        { step: 4, title: '结论', content: '\\(y\'\'(0)=-2\\)，选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：串联一元与多元复合求导（创新维度，跨 ch02/ch05），难度对标 2024 年数一第 12 题' }
                }
            ]
        },

        /* ==================================================================
         * m14 · 题位 14 · 高数/填空题 · 欧拉方程
         * 母题来源：2021 年数一第 13 题（原题）
         * ================================================================== */
        {
            id: 'm14',
            slot: 14,
            type: '填空题',
            score: 5,
            part: '高数',
            topic: '欧拉方程求解',
            difficulty: 3,
            kpIds: ['GS.8.2'],
            kpNames: ['欧拉方程', '常微分方程'],
            chapter: 'ch08',
            question: '方程 \\(x^2y\'\'+xy\'-4y=0\\) 满足条件 \\(y(1)=1,\\ y\'(1)=2\\) 的解为 \\(y=\\underline{\\qquad}\\)',
            options: [],
            answer: '\\(x^2\\)',
            concepts: [
                { name: '欧拉方程变换', note: '令 \\(x=\\mathrm{e}^t\\)（或 \\(t=\\ln x\\)），记 \\(D=\\dfrac{\\mathrm{d}}{\\mathrm{d}t}\\)，则 \\(xy\'=Dy\\)，\\(x^2y\'\'=D(D-1)y\\)。' },
                { name: '二阶常系数线性齐次方程', note: '特征方程 \\(r^2+pr+q=0\\)，两不等实根 \\(r_1,r_2\\) 时通解 \\(y=C_1\\mathrm{e}^{r_1t}+C_2\\mathrm{e}^{r_2t}\\)。' },
                { name: '还原自变量', note: '\\(\\mathrm{e}^{rt}=\\mathrm{e}^{r\\ln x}=x^r\\)。' }
            ],
            solution: [
                { step: 1, title: '令 \\(x=\\mathrm{e}^t\\) 化为常系数方程', content: '由欧拉变换公式 \\(xy\'=Dy\\)、\\(x^2y\'\'=D(D-1)y\\)（\\(D=\\dfrac{\\mathrm{d}}{\\mathrm{d}t}\\)）：<br>\\(D(D-1)y+Dy-4y=0\\)<br>\\(\\Rightarrow (D^2-D+D-4)y=0\\ \\Rightarrow\\ y\'\'_t-4y=0\\)' },
                { step: 2, title: '解常系数方程', content: '特征方程 \\(r^2-4=0\\)，\\(r=\\pm2\\)，故 <br>\\(y=C_1\\mathrm{e}^{2t}+C_2\\mathrm{e}^{-2t}\\)' },
                { step: 3, title: '还原为 \\(x\\)', content: '由 \\(t=\\ln x\\)：\\(\\mathrm{e}^{2t}=x^2\\)、\\(\\mathrm{e}^{-2t}=x^{-2}\\)，故<br>\\(y=C_1x^2+C_2x^{-2}\\)' },
                { step: 4, title: '代入初始条件定常数', content: '<br>\\(y(1)=1\\ \\Rightarrow\\ C_1+C_2=1\\)<br>\\(y\'(x)=2C_1x-2C_2x^{-3}\\)，\\(y\'(1)=2\\ \\Rightarrow\\ 2C_1-2C_2=2\\ \\Rightarrow\\ C_1-C_2=1\\)<br>联立得 \\(C_1=1,\\ C_2=0\\)，故 \\(y=x^2\\)。' }
            ],
            source: { rank: 1, label: '真题', detail: '2021 年数学一第 13 题（原题，欧拉方程）' },
            variants: [
                {
                    id: 'm14v1', dimension: '概念',
                    kpIds: ['GS.8.2'], kpNames: ['欧拉方程'],
                    chapter: 'ch08',
                    difficulty: 3,
                    question: '设欧拉方程 \\(x^2y\'\'-xy\'+y=0\\)，令 \\(x=\\mathrm{e}^t\\)，\\(D=\\dfrac{\\mathrm{d}}{\\mathrm{d}t}\\)，则它化为',
                    options: [
                        'A. \\(y\'\'_t-2y\'_t+y=0\\)',
                        'B. \\(y\'\'_t+2y\'_t+y=0\\)',
                        'C. \\(y\'\'_t-y\'_t+y=0\\)',
                        'D. \\(y\'\'_t+y=0\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '欧拉变换公式', note: '\\(xy\'=Dy\\)、\\(x^2y\'\'=D(D-1)y=D^2y-Dy\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '写出欧拉变换公式（含推导）', content: '令 \\(x=\\mathrm{e}^t\\)（\\(t=\\ln x\\)），记 \\(D=\\dfrac{\\mathrm{d}}{\\mathrm{d}t}\\)。由 \\(\\dfrac{\\mathrm{d}t}{\\mathrm{d}x}=\\dfrac{1}{x}\\)：<br>\\(xy\'=x\\cdot\\dfrac{\\mathrm{d}y}{\\mathrm{d}x}=x\\cdot\\dfrac{\\mathrm{d}y}{\\mathrm{d}t}\\cdot\\dfrac{1}{x}=\\dfrac{\\mathrm{d}y}{\\mathrm{d}t}=Dy\\)<br>\\(x^2y\'\'=x^2\\cdot\\dfrac{\\mathrm{d}}{\\mathrm{d}x}\\left(\\dfrac{\\mathrm{d}y}{\\mathrm{d}x}\\right)=\\dfrac{\\mathrm{d}^2y}{\\mathrm{d}t^2}-\\dfrac{\\mathrm{d}y}{\\mathrm{d}t}=D^2y-Dy=D(D-1)y\\)' },
                        { step: 2, title: '代入变换公式', content: '<br>\\(x^2y\'\'-xy\'+y=D(D-1)y-Dy+y=(D^2-D-D+1)y=(D^2-2D+1)y=0\\)' },
                        { step: 3, title: '结论', content: '即 \\(y\'\'_t-2y\'_t+y=0\\)，选 A。' },
                        { step: 4, title: '验证（\\(y=x^r\\) 代入检验）', content: '欧拉方程有形如 \\(y=x^r\\) 的解：代入 \\(x^2y\'\'-xy\'+y=0\\) 得 <br>\\(r(r-1)-r+1=r^2-2r+1=(r-1)^2=0\\)<br>特征根 \\(r=1\\)（二重），对应变换后方程 \\(y\'\'_t-2y\'_t+y=0\\) 的特征方程 \\((r-1)^2=0\\)，二者一致，验证正确。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：欧拉方程变换（概念维度），难度对标 2021 年数一第 13 题' }
                },
                {
                    id: 'm14v2', dimension: '计算',
                    kpIds: ['GS.8.2'], kpNames: ['欧拉方程'],
                    chapter: 'ch08',
                    difficulty: 3,
                    question: '欧拉方程 \\(x^2y\'\'+xy\'=0\\) 的通解为',
                    options: [],
                    answer: '\\(C_1\\ln x+C_2\\)',
                    concepts: [
                        { name: '变换与特征根', note: '\\(D(D-1)y+Dy=D^2y=0\\)，特征方程 \\(r^2=0\\)，二重根 \\(r=0\\)。' },
                        { name: '二重根的通解', note: '\\(y=(C_1+C_2t)\\mathrm{e}^{0\\cdot t}=C_1+C_2t\\)，还原 \\(t=\\ln x\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '变换', content: '<br>\\(x^2y\'\'+xy\'=D(D-1)y+Dy=(D^2-D+D)y=D^2y=0\\)<br>即 \\(y\'\'_t=0\\)。' },
                        { step: 2, title: '解方程', content: '<br>\\(y\'\'_t=0\\ \\Rightarrow\\ y=C_1+C_2t\\)' },
                        { step: 3, title: '还原', content: '由 \\(t=\\ln x\\)：<br>\\(y=C_1+C_2\\ln x\\)' },
                        { step: 4, title: '验证（代入原方程检验）', content: '对 \\(y=C_1+C_2\\ln x\\)：\\(y\'=\\dfrac{C_2}{x}\\)，\\(y\'\'=-\\dfrac{C_2}{x^2}\\)。代入原方程：<br>\\(x^2y\'\'+xy\'=x^2\\cdot\\left(-\\dfrac{C_2}{x^2}\\right)+x\\cdot\\dfrac{C_2}{x}=-C_2+C_2=0\\)<br>恒成立，且通解含两个任意常数（方程是二阶的），故 \\(y=C_1+C_2\\ln x\\) 是通解。易错：二重根 \\(r=0\\) 对应的两个线性无关解是 \\(1\\) 与 \\(t=\\ln x\\)，不要写成 \\(C_1+C_2x\\)。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：欧拉方程计算（计算维度），难度对标 2021 年数一第 13 题' }
                },
                {
                    id: 'm14v3', dimension: '公式',
                    kpIds: ['GS.8.1'], kpNames: ['常系数线性方程'],
                    chapter: 'ch08',
                    difficulty: 3,
                    question: '二阶常系数齐次方程 \\(y\'\'-3y\'+2y=0\\) 的通解为',
                    options: [
                        'A. \\(C_1\\mathrm{e}^{x}+C_2\\mathrm{e}^{2x}\\)',
                        'B. \\(C_1\\mathrm{e}^{-x}+C_2\\mathrm{e}^{-2x}\\)',
                        'C. \\((C_1+C_2x)\\mathrm{e}^{x}\\)',
                        'D. \\(C_1\\cos x+C_2\\sin x\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '特征方程法', note: '设 \\(y=\\mathrm{e}^{rx}\\)，代入得特征方程 \\(r^2-3r+2=0\\)。' },
                        { name: '两不等实根通解', note: '\\(y=C_1\\mathrm{e}^{r_1x}+C_2\\mathrm{e}^{r_2x}\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '判型与解法概述', content: '这是二阶常系数线性齐次方程 \\(y\'\'+py\'+qy=0\\)，其中 \\(p=-3\\)、\\(q=2\\)。标准解法：设 \\(y=\\mathrm{e}^{rx}\\)（则 \\(y\'=r\\mathrm{e}^{rx}\\)、\\(y\'\'=r^2\\mathrm{e}^{rx}\\)），代入方程得特征方程 \\(r^2+pr+q=0\\)，再按特征根的类型写通解。' },
                        { step: 2, title: '写特征方程并求解', content: '特征方程 <br>\\(r^2-3r+2=0\\ \\Rightarrow\\ (r-1)(r-2)=0\\ \\Rightarrow\\ r=1,2\\)' },
                        { step: 3, title: '写通解', content: '两不等实根 \\(r_1=1\\)、\\(r_2=2\\)：<br>\\(y=C_1\\mathrm{e}^{1\\cdot x}+C_2\\mathrm{e}^{2x}=C_1\\mathrm{e}^{x}+C_2\\mathrm{e}^{2x}\\)' },
                        { step: 4, title: '验证并结论', content: '检验：\\(y=\\mathrm{e}^x\\) 代入得 \\(1-3+2=0\\) ✓；\\(y=\\mathrm{e}^{2x}\\) 代入得 \\(4-6+2=0\\) ✓。易错：特征根 \\(r=1,2\\) 对应 \\(\\mathrm{e}^{x}\\) 与 \\(\\mathrm{e}^{2x}\\)，不是 \\(\\mathrm{e}^{-x}\\)、\\(\\mathrm{e}^{-2x}\\)（后者对应特征根 \\(r=-1,-2\\)，即选项 B）。选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：常系数齐次方程通解（公式维度），难度对标 2022 年数一第 12 题' }
                },
                {
                    id: 'm14v4', dimension: '创新',
                    kpIds: ['GS.8.2'], kpNames: ['欧拉方程'],
                    chapter: 'ch08',
                    difficulty: 4,
                    question: '欧拉方程 \\(x^2y\'\'+xy\'-y=0\\) 满足 \\(y(1)=0\\)，\\(y\'(1)=1\\) 的特解为',
                    options: [],
                    answer: '\\(\\dfrac{1}{2}\\left(x-\\dfrac{1}{x}\\right)\\)',
                    concepts: [
                        { name: '变换与特征根', note: '\\(D(D-1)y+Dy-y=(D^2-1)y=0\\)，特征根 \\(r=\\pm1\\)。' },
                        { name: '还原与初值', note: '\\(y=C_1x+C_2x^{-1}\\)，代入初值定 \\(C_1,C_2\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '变换并解', content: '<br>\\(D(D-1)y+Dy-y=(D^2-1)y=0\\ \\Rightarrow\\ y\'\'_t-y=0\\)<br>特征 \\(r^2-1=0\\Rightarrow r=\\pm1\\)，通解 \\(y=C_1\\mathrm{e}^t+C_2\\mathrm{e}^{-t}=C_1x+C_2x^{-1}\\)。' },
                        { step: 2, title: '代入初始条件', content: '<br>\\(y(1)=0\\ \\Rightarrow\\ C_1+C_2=0\\)<br>\\(y\'=C_1-C_2x^{-2}\\)，\\(y\'(1)=1\\ \\Rightarrow\\ C_1-C_2=1\\)<br>解得 \\(C_1=\\dfrac12\\)，\\(C_2=-\\dfrac12\\)。' },
                        { step: 3, title: '验证（代入初值检验）', content: '检验特解 \\(y=\\dfrac12\\left(x-x^{-1}\\right)\\)：<br>\\(y(1)=\\dfrac12(1-1)=0\\) ✓<br>\\(y\'(x)=\\dfrac12(1+x^{-2})\\)，\\(y\'(1)=\\dfrac12(1+1)=1\\) ✓<br>且 \\(y\\) 出自通解（系数由初值唯一确定），两个初始条件均满足，故确为所求特解。' },
                        { step: 4, title: '结论', content: '<br>\\(y=\\dfrac12\\left(x-\\dfrac{1}{x}\\right)\\)，故填 \\(\\dfrac12\\left(x-\\dfrac{1}{x}\\right)\\)。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：欧拉方程带初值求特解（创新维度），难度对标 2021 年数一第 13 题' }
                }
            ]
        },

        /* ==================================================================
         * m15 · 题位 15 · 线代/填空题 · 代数余子式
         * 母题来源：2021 年数一第 15 题（原题）
         * ================================================================== */
        {
            id: 'm15',
            slot: 15,
            type: '填空题',
            score: 5,
            part: '线代',
            topic: '代数余子式求和',
            difficulty: 3,
            kpIds: ['XD.9.1'],
            kpNames: ['行列式', '代数余子式'],
            chapter: 'ch09',
            question: '\\(\\mathbf{A}=(a_{ij})\\) 为 3 阶矩阵，\\(A_{ij}\\) 为代数余子式，若 \\(\\mathbf{A}\\) 的每行元素之和均为 2，且 \\(|\\mathbf{A}|=3\\)，则 \\(A_{11}+A_{21}+A_{31}=\\underline{\\qquad}\\)',
            options: [],
            answer: '\\(\\dfrac{3}{2}\\)',
            concepts: [
                { name: '代数余子式求和', note: '\\(A_{11}+A_{21}+A_{31}=\\begin{vmatrix}1&a_{12}&a_{13}\\\\1&a_{22}&a_{23}\\\\1&a_{32}&a_{33}\\end{vmatrix}\\)（把第 1 列换成全 1 后的行列式）。' },
                { name: '行列式按列展开', note: '对替换后的矩阵按第 1 列展开，恰好得到 \\(A_{11}+A_{21}+A_{31}\\)。' },
                { name: '行列式提公因子', note: '某行（列）有公因子可提出：每行和为 2 \\(\\Rightarrow\\) 提出 2。' }
            ],
            solution: [
                { step: 1, title: '把求和写成行列式', content: '由按列展开定理的推广：<br>\\(A_{11}+A_{21}+A_{31}=\\begin{vmatrix}1&a_{12}&a_{13}\\\\1&a_{22}&a_{23}\\\\1&a_{32}&a_{33}\\end{vmatrix}\\)<br>（把 \\(\\mathbf{A}\\) 的第一列换成全 1 列，再按第一列展开。）' },
                { step: 2, title: '利用“每行和为 2”变形', content: '原行列式 \\(|\\mathbf{A}|=\\begin{vmatrix}a_{11}&a_{12}&a_{13}\\\\a_{21}&a_{22}&a_{23}\\\\a_{31}&a_{32}&a_{33}\\end{vmatrix}\\)。<br>把第 2、3 列都加到第 1 列（行列式值不变）：<br>第 1 列变为 \\((a_{11}+a_{12}+a_{13},\\cdots)^T=(2,2,2)^T\\)（每行和为 2）。' },
                { step: 3, title: '提出公因子并对照', content: '<br>\\(|\\mathbf{A}|=\\begin{vmatrix}2&a_{12}&a_{13}\\\\2&a_{22}&a_{23}\\\\2&a_{32}&a_{33}\\end{vmatrix}=2\\begin{vmatrix}1&a_{12}&a_{13}\\\\1&a_{22}&a_{23}\\\\1&a_{32}&a_{33}\\end{vmatrix}=2(A_{11}+A_{21}+A_{31})\\)' },
                { step: 4, title: '解出答案', content: '已知 \\(|\\mathbf{A}|=3\\)，故 <br>\\(3=2(A_{11}+A_{21}+A_{31})\\ \\Rightarrow\\ A_{11}+A_{21}+A_{31}=\\dfrac{3}{2}\\)' }
            ],
            source: { rank: 1, label: '真题', detail: '2021 年数学一第 15 题（原题）' },
            variants: [
                {
                    id: 'm15v1', dimension: '概念',
                    kpIds: ['XD.9.1'], kpNames: ['代数余子式'],
                    chapter: 'ch09',
                    difficulty: 3,
                    question: '设 \\(\\mathbf{A}\\) 为 3 阶矩阵，\\(A_{ij}\\) 为 \\(a_{ij}\\) 的代数余子式，则 \\(A_{11}+A_{21}+A_{31}\\) 等于',
                    options: [
                        'A. \\(\\begin{vmatrix}1&a_{12}&a_{13}\\\\1&a_{22}&a_{23}\\\\1&a_{32}&a_{33}\\end{vmatrix}\\)',
                        'B. \\(\\begin{vmatrix}1&1&1\\\\a_{21}&a_{22}&a_{23}\\\\a_{31}&a_{32}&a_{33}\\end{vmatrix}\\)',
                        'C. \\(\\begin{vmatrix}a_{11}&a_{12}&a_{13}\\\\1&a_{22}&a_{23}\\\\1&a_{32}&a_{33}\\end{vmatrix}\\)',
                        'D. \\(|\\mathbf{A}|\\)'
                    ],
                    answer: 'A',
                    concepts: [
                        { name: '按列展开定理', note: '\\(|\\mathbf{A}|=a_{11}A_{11}+a_{21}A_{21}+a_{31}A_{31}\\)。把第 1 列元素换成 1、1、1 后按第一列展开即得 \\(A_{11}+A_{21}+A_{31}\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '回忆按列展开', content: '行列式按第 1 列展开：\\(|\\mathbf{A}|=a_{11}A_{11}+a_{21}A_{21}+a_{31}A_{31}\\)。' },
                        { step: 2, title: '替换第 1 列', content: '若把第 1 列换成 \\((1,1,1)^T\\)，新行列式按第 1 列展开：<br>\\(=1\\cdot A_{11}+1\\cdot A_{21}+1\\cdot A_{31}\\)<br>（代数余子式不变，因为删去第 1 列后与 \\(\\mathbf{A}\\) 的代数余子式相同。）' },
                        { step: 3, title: '易错提醒（为什么代数余子式不变）', content: '代数余子式 \\(A_{i1}=(-1)^{i+1}M_{i1}\\) 只由删去第 1 列后剩下的 2 阶子式决定，与原矩阵第 1 列元素无关——所以把第 1 列换成 \\((1,1,1)^T\\) 后 \\(A_{11},A_{21},A_{31}\\) 保持不变，这正是"换列写和"的依据。推广：把第 1 列换成 \\((c_1,c_2,c_3)^T\\) 可得 \\(c_1A_{11}+c_2A_{21}+c_3A_{31}\\)。' },
                        { step: 4, title: '结论', content: '选 A。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：代数余子式求和的行列式表示（概念维度），难度对标 2021 年数一第 15 题' }
                },
                {
                    id: 'm15v2', dimension: '计算',
                    kpIds: ['XD.9.1'], kpNames: ['代数余子式'],
                    chapter: 'ch09',
                    difficulty: 3,
                    question: '设 \\(\\mathbf{A}=\\begin{pmatrix}1&2&3\\\\4&5&6\\\\7&8&9\\end{pmatrix}\\)，则 \\(A_{11}+A_{21}+A_{31}=\\underline{\\qquad}\\)',
                    options: [],
                    answer: '0',
                    concepts: [
                        { name: '代数余子式计算', note: '\\(A_{ij}=(-1)^{i+j}M_{ij}\\)，\\(M_{ij}\\) 为余子式。' },
                        { name: '两行成比例的推论', note: '原矩阵第 1 列 \\((1,4,7)\\) 与 \\((1,1,1)\\) 无关，但可算出行列式本身为 0。' }
                    ],
                    solution: [
                        { step: 1, title: '写出替换后的行列式', content: '<br>\\(A_{11}+A_{21}+A_{31}=\\begin{vmatrix}1&2&3\\\\1&5&6\\\\1&8&9\\end{vmatrix}\\)' },
                        { step: 2, title: '计算行列式', content: '按第 1 列展开：<br>\\(=1\\cdot\\begin{vmatrix}5&6\\\\8&9\\end{vmatrix}-1\\cdot\\begin{vmatrix}2&3\\\\8&9\\end{vmatrix}+1\\cdot\\begin{vmatrix}2&3\\\\5&6\\end{vmatrix}\\)<br>\\(=(45-48)-(18-24)+(12-15)=-3+6-3=0\\)' },
                        { step: 3, title: '方法二（验证）：观察行之间的线性关系', content: '替换后的矩阵 <br>\\(B=\\begin{pmatrix}1&2&3\\\\1&5&6\\\\1&8&9\\end{pmatrix}\\)<br>第 2 行 \\(-\\) 第 1 行 \\(=(0,3,3)\\)，第 3 行 \\(-\\) 第 1 行 \\(=(0,6,6)=2(0,3,3)\\)，故第 3 行 \\(=2\\times\\)第 2 行 \\(-\\) 第 1 行，三行线性相关 \\(\\Rightarrow\\ \\det B=0\\)，与方法一结果一致。' },
                        { step: 4, title: '结论', content: '填 0。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：具体矩阵代数余子式求和（计算维度），难度对标 2021 年数一第 15 题' }
                },
                {
                    id: 'm15v3', dimension: '公式',
                    kpIds: ['XD.9.1'], kpNames: ['按行展开'],
                    chapter: 'ch09',
                    difficulty: 2,
                    question: '设 \\(\\mathbf{A}\\) 为 3 阶矩阵，\\(|\\mathbf{A}|=5\\)，则 \\(a_{11}A_{11}+a_{12}A_{12}+a_{13}A_{13}=\\underline{\\qquad}\\)',
                    options: [],
                    answer: '5',
                    concepts: [
                        { name: '按行展开定理', note: '行列式等于任一行元素与其代数余子式的乘积和：\\(|\\mathbf{A}|=\\sum_j a_{ij}A_{ij}\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '回忆按行展开定理', content: '对 \\(n\\) 阶行列式，任一行元素与其代数余子式的乘积和等于行列式本身：<br>\\(|\\mathbf{A}|=\\sum_{j=1}^n a_{ij}A_{ij}\\)<br>本题取第 1 行（\\(i=1\\)，\\(n=3\\)），即 \\(|\\mathbf{A}|=a_{11}A_{11}+a_{12}A_{12}+a_{13}A_{13}\\)。' },
                        { step: 2, title: '套按行展开定理', content: '行列式按第 1 行展开：<br>\\(|\\mathbf{A}|=a_{11}A_{11}+a_{12}A_{12}+a_{13}A_{13}\\)' },
                        { step: 3, title: '代入已知', content: '由 \\(|\\mathbf{A}|=5\\)，故 <br>\\(a_{11}A_{11}+a_{12}A_{12}+a_{13}A_{13}=5\\)' },
                        { step: 4, title: '易错提醒并结论', content: '若"错位展开"——用第 1 行的元素乘第 2 行的代数余子式——结果必为 0（行列式有两行相同时为 0），只有"本行元素 \\(\\times\\) 本行代数余子式"才等于行列式。本题按第 1 行自身展开，恰为 \\(|\\mathbf{A}|=5\\)，故填 5。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：按行展开定理应用（公式维度），难度偏低，对标 2021 年数一第 15 题' }
                },
                {
                    id: 'm15v4', dimension: '创新',
                    kpIds: ['XD.9.1', 'XD.10.2'], kpNames: ['代数余子式', '伴随矩阵'],
                    chapter: 'ch09',
                    difficulty: 4,
                    question: '设 \\(\\mathbf{A}\\) 为 3 阶矩阵，\\(|\\mathbf{A}|=2\\)，\\(\\mathbf{A}^*\\) 为伴随矩阵，则 \\(|\\mathbf{A}^*|=\\underline{\\qquad}\\)',
                    options: [],
                    answer: '4',
                    concepts: [
                        { name: '伴随矩阵', note: '\\(\\mathbf{A}^*\\) 是代数余子式转置组成的矩阵。' },
                        { name: '伴随矩阵的行列式', note: '对 \\(n\\) 阶方阵：\\(|\\mathbf{A}^*|=|\\mathbf{A}|^{n-1}\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '写出关键恒等式', content: '由伴随矩阵定义：\\(\\mathbf{A}\\mathbf{A}^*=\\mathbf{A}^*\\mathbf{A}=|\\mathbf{A}|\\mathbf{E}\\)。这是推导 \\(|\\mathbf{A}^*|\\) 公式的出发点。' },
                        { step: 2, title: '两边取行列式推导公式', content: '对 \\(\\mathbf{A}\\mathbf{A}^*=|\\mathbf{A}|\\mathbf{E}\\) 两边取行列式：<br>\\(|\\mathbf{A}||\\mathbf{A}^*|=||\\mathbf{A}|\\mathbf{E}|=|\\mathbf{A}|^n\\)<br>（\\(n\\) 阶数量阵 \\(|\\mathbf{A}|\\mathbf{E}\\) 的行列式等于对角元 \\(|\\mathbf{A}|\\) 的 \\(n\\) 次幂。）\\(|\\mathbf{A}|\\ne0\\) 时两边约去 \\(|\\mathbf{A}|\\)，得 <br>\\(|\\mathbf{A}^*|=|\\mathbf{A}|^{n-1}\\)' },
                        { step: 3, title: '代入 \\(n=3\\)', content: '<br>\\(|\\mathbf{A}^*|=|\\mathbf{A}|^{3-1}=2^2=4\\)' },
                        { step: 4, title: '验证与易错提醒', content: '验证：令 \\(\\mathbf{A}=2\\mathbf{E}\\)，则 \\(\\mathbf{A}^*=4\\mathbf{E}\\)，\\(|\\mathbf{A}^*|=64\\)，而 \\(|\\mathbf{A}|^{3-1}=8^2=64\\) ✓。易错：指数是 \\(n-1\\)（本题 \\(n=3\\) 应为平方 \\(2^2\\)，不是立方 \\(2^3=8\\)）；且公式在 \\(|\\mathbf{A}|=0\\) 时不适用（本题 \\(|\\mathbf{A}|=2\\ne0\\) 满足条件）。故填 4。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：串联代数余子式与伴随矩阵行列式（创新维度，跨 ch09/ch10），难度对标 2023 年数一第 15 题' }
                }
            ]
        },

        /* ==================================================================
         * m16 · 题位 16 · 概率/填空题 · 二项分布
         * 母题来源：2023 年数一第 16 题（原题）
         * ================================================================== */
        {
            id: 'm16',
            slot: 16,
            type: '填空题',
            score: 5,
            part: '概率',
            topic: '二项分布与独立事件概率',
            difficulty: 2,
            kpIds: ['GL.16.2'],
            kpNames: ['二项分布', '独立性'],
            chapter: 'ch16',
            question: '设随机变量 \\(X\\) 与 \\(Y\\) 相互独立，且 \\(X\\sim B\\left(1,\\dfrac{1}{3}\\right)\\)，\\(Y\\sim B\\left(2,\\dfrac{1}{2}\\right)\\)，则 \\(P\\{X=Y\\}=\\underline{\\qquad}\\)',
            options: [],
            answer: '\\(\\dfrac{1}{3}\\)',
            concepts: [
                { name: '二项分布概率公式', note: '\\(P\\{X=k\\}=C_n^k p^k(1-p)^{n-k}\\)。' },
                { name: '独立事件的乘法', note: '\\(X,Y\\) 独立 \\(\\Rightarrow P\\{X=k,Y=k\\}=P\\{X=k\\}P\\{Y=k\\}\\)。' },
                { name: '互斥事件加法', note: '\\(P\\{X=Y\\}=P\\{X=0,Y=0\\}+P\\{X=1,Y=1\\}\\)（两事件互斥）。' }
            ],
            solution: [
                { step: 1, title: '确定取值与交集', content: '\\(X\\sim B(1,\\frac13)\\) 取值 \\(\\{0,1\\}\\)；\\(Y\\sim B(2,\\frac12)\\) 取值 \\(\\{0,1,2\\}\\)。\\(X=Y\\) 只可能是 \\(X=Y=0\\) 或 \\(X=Y=1\\)（交集 \\(\\{0,1\\}\\)）。' },
                { step: 2, title: '分别算四个概率', content: '对 \\(X\\)：\\(P\\{X=0\\}=1-\\dfrac13=\\dfrac23\\)，\\(P\\{X=1\\}=\\dfrac13\\)。<br>对 \\(Y\\)：<br>\\(P\\{Y=0\\}=C_2^0\\left(\\dfrac12\\right)^0\\left(\\dfrac12\\right)^2=\\dfrac14\\)<br>\\(P\\{Y=1\\}=C_2^1\\left(\\dfrac12\\right)^1\\left(\\dfrac12\\right)^1=\\dfrac12\\)' },
                { step: 3, title: '易错提醒（取值交集与互斥性）', content: '关键点：\\(X\\) 取值 \\(\\{0,1\\}\\)、\\(Y\\) 取值 \\(\\{0,1,2\\}\\)，二者交集为 \\(\\{0,1\\}\\)，所以 \\(X=Y\\) 只有两种情形；\\(Y=2\\) 的情形不可能与 \\(X\\) 相等，无需计算。另一个易错点：\\(X=Y=0\\) 与 \\(X=Y=1\\) 两事件互斥（不可能同时发生），概率直接相加合法；而 \\(P\\{X=k,Y=k\\}=P\\{X=k\\}P\\{Y=k\\}\\) 拆分必须依赖 \\(X,Y\\) 独立（题设已给）。' },
                { step: 4, title: '用独立性与互斥性相加', content: '<br>\\(P\\{X=Y\\}=P\\{X=0\\}P\\{Y=0\\}+P\\{X=1\\}P\\{Y=1\\}\\)<br>\\(=\\dfrac23\\cdot\\dfrac14+\\dfrac13\\cdot\\dfrac12=\\dfrac16+\\dfrac16=\\dfrac13\\)<br>故填 \\(\\dfrac13\\)。' }
            ],
            source: { rank: 1, label: '真题', detail: '2023 年数学一第 16 题（原题）' },
            variants: [
                {
                    id: 'm16v1', dimension: '概念',
                    kpIds: ['GL.16.2'], kpNames: ['二项分布'],
                    chapter: 'ch16',
                    difficulty: 2,
                    question: '设 \\(X\\sim B\\left(4,\\dfrac12\\right)\\)，则 \\(P\\{X=2\\}=\\underline{\\qquad}\\)',
                    options: [],
                    answer: '\\(\\dfrac{3}{8}\\)',
                    concepts: [
                        { name: '二项分布概率公式', note: '\\(P\\{X=k\\}=C_n^k p^k(1-p)^{n-k}\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '写出公式并明确参数', content: '二项分布概率公式：<br>\\(P\\{X=k\\}=C_n^k p^k(1-p)^{n-k}\\)<br>本题 \\(n=4\\)、\\(p=\\dfrac12\\)、\\(k=2\\)。先算组合数 \\(C_4^2=\\dfrac{4!}{2!\\,2!}=6\\)。' },
                        { step: 2, title: '套公式', content: '<br>\\(P\\{X=2\\}=C_4^2\\left(\\dfrac12\\right)^2\\left(1-\\dfrac12\\right)^{4-2}=6\\cdot\\left(\\dfrac12\\right)^4\\)' },
                        { step: 3, title: '计算', content: '<br>\\(=6\\cdot\\dfrac{1}{16}=\\dfrac{3}{8}\\)' },
                        { step: 4, title: '验证并结论', content: '\\(B\\left(4,\\dfrac12\\right)\\) 的分布列为 \\(\\dfrac{1}{16},\\dfrac{4}{16},\\dfrac{6}{16},\\dfrac{4}{16},\\dfrac{1}{16}\\)（关于 \\(k=2\\) 对称），和为 1 ✓，其中 \\(k=2\\) 的概率 \\(\\dfrac{6}{16}=\\dfrac38\\) 最大，符合 \\(p=\\dfrac12\\) 时的规律。故填 \\(\\dfrac38\\)。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：二项分布概率直接计算（概念维度），难度偏低，对标 2023 年数一第 16 题' }
                },
                {
                    id: 'm16v2', dimension: '计算',
                    kpIds: ['GL.16.2'], kpNames: ['二项分布'],
                    chapter: 'ch16',
                    difficulty: 3,
                    question: '设 \\(X\\) 与 \\(Y\\) 独立且都服从 \\(B\\left(2,\\dfrac12\\right)\\)，则 \\(P\\{X=Y\\}=\\underline{\\qquad}\\)',
                    options: [],
                    answer: '\\(\\dfrac{3}{8}\\)',
                    concepts: [
                        { name: '独立同分布', note: '\\(P\\{X=k,Y=k\\}=P\\{X=k\\}^2\\)。' },
                        { name: '分布列', note: '对 \\(B(2,\\frac12)\\)：\\(P_0=\\frac14\\)，\\(P_1=\\frac12\\)，\\(P_2=\\frac14\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '用公式计算分布列', content: '\\(X\\sim B\\left(2,\\dfrac12\\right)\\)，\\(P\\{X=k\\}=C_2^k\\left(\\dfrac12\\right)^k\\left(\\dfrac12\\right)^{2-k}\\)，故<br>\\(P\\{X=0\\}=\\left(\\dfrac12\\right)^2=\\dfrac14\\)，\\(P\\{X=1\\}=C_2^1\\cdot\\dfrac14=\\dfrac12\\)，\\(P\\{X=2\\}=\\left(\\dfrac12\\right)^2=\\dfrac14\\)<br>核对：\\(\\dfrac14+\\dfrac12+\\dfrac14=1\\) ✓。' },
                        { step: 2, title: '分解事件 \\(X=Y\\)', content: '\\(X,Y\\) 均取值 \\(\\{0,1,2\\}\\)，\\(X=Y\\) 分解为三个互斥事件：<br>\\(P\\{X=Y\\}=\\sum_{k=0}^{2}P\\{X=k,Y=k\\}\\)<br>由 \\(X,Y\\) 独立且同分布：\\(P\\{X=k,Y=k\\}=P\\{X=k\\}P\\{Y=k\\}=P\\{X=k\\}^2\\)。' },
                        { step: 3, title: '利用独立求和', content: '<br>\\(P\\{X=Y\\}=\\sum_{k=0}^{2}P\\{X=k\\}^2=\\left(\\dfrac14\\right)^2+\\left(\\dfrac12\\right)^2+\\left(\\dfrac14\\right)^2\\)<br>\\(=\\dfrac{1}{16}+\\dfrac14+\\dfrac{1}{16}=\\dfrac{3}{8}\\)' },
                        { step: 4, title: '结论', content: '故 \\(P\\{X=Y\\}=\\dfrac38\\)。易错：不要漏掉 \\(k=2\\) 的项 \\(\\left(\\dfrac14\\right)^2=\\dfrac1{16}\\)（漏掉会得到 \\(\\dfrac{5}{16}\\)，错误）。填 \\(\\dfrac38\\)。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：独立同分布变量相等概率（计算维度），难度对标 2023 年数一第 16 题' }
                },
                {
                    id: 'm16v3', dimension: '公式',
                    kpIds: ['GL.18.1'], kpNames: ['期望', '方差'],
                    chapter: 'ch16',
                    difficulty: 2,
                    question: '设 \\(X\\sim B(100,0.2)\\)，则 \\(E(X)=\\underline{\\qquad}\\)，\\(D(X)=\\underline{\\qquad}\\)',
                    options: [],
                    answer: '\\(E(X)=20\\)，\\(D(X)=16\\)',
                    concepts: [
                        { name: '二项分布的数字特征', note: '\\(E(X)=np\\)，\\(D(X)=np(1-p)\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '写出公式并识别参数', content: '二项分布 \\(B(n,p)\\) 的数字特征：<br>\\(E(X)=np\\)，\\(D(X)=np(1-p)\\)<br>本题 \\(n=100\\)、\\(p=0.2\\)，故 \\(1-p=0.8\\)。' },
                        { step: 2, title: '计算期望', content: '<br>\\(E(X)=np=100\\times0.2=20\\)' },
                        { step: 3, title: '计算方差', content: '<br>\\(D(X)=np(1-p)=100\\times0.2\\times0.8=20\\times0.8=16\\)' },
                        { step: 4, title: '验证并结论', content: '核对：方差公式 \\(D(X)=np(1-p)\\) 中要乘 \\(1-p=0.8\\)，若误用 \\(p=0.2\\) 会得到 \\(D(X)=4\\)（错误）；也可用定义式 \\(D(X)=E(X^2)-[E(X)]^2\\) 交叉验证。故 \\(E(X)=20\\)、\\(D(X)=16\\)。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：二项分布期望方差公式（公式维度），难度偏低，对标 2023 年数一第 16 题' }
                },
                {
                    id: 'm16v4', dimension: '创新',
                    kpIds: ['GL.16.2', 'GL.16.3'], kpNames: ['二项分布', '泊松近似'],
                    chapter: 'ch16',
                    difficulty: 4,
                    question: '设 \\(X\\sim B(100,0.05)\\)，利用泊松分布近似（\\(\\lambda=np=5\\)），则 \\(P\\{X=0\\}\\approx\\underline{\\qquad}\\)',
                    options: [],
                    answer: '\\(\\mathrm{e}^{-5}\\)',
                    concepts: [
                        { name: '泊松近似', note: '当 \\(n\\) 大、\\(p\\) 小（\\(np\\) 适中）时，\\(B(n,p)\\) 可用 \\(P(\\lambda=np)\\) 近似。' },
                        { name: '泊松分布的概率', note: '\\(P\\{X=k\\}=\\dfrac{\\lambda^k\\mathrm{e}^{-\\lambda}}{k!}\\)。' }
                    ],
                    solution: [
                        { step: 1, title: '说明泊松近似的适用条件', content: '当 \\(n\\) 很大、\\(p\\) 很小且 \\(np\\) 大小适中时，\\(B(n,p)\\) 可用泊松分布 \\(P(\\lambda=np)\\) 近似（"小概率事件"原理）。本题 \\(n=100\\)、\\(p=0.05\\)，\\(np=5\\)，满足近似条件。' },
                        { step: 2, title: '确定近似参数', content: '<br>\\(\\lambda=np=100\\times0.05=5\\)<br>用 \\(P(5)\\) 近似 \\(B(100,0.05)\\)。' },
                        { step: 3, title: '套泊松概率公式', content: '<br>\\(P\\{X=0\\}\\approx\\dfrac{5^0\\mathrm{e}^{-5}}{0!}=\\mathrm{e}^{-5}\\)<br>（注意 \\(0!=1\\)、\\(5^0=1\\)。）' },
                        { step: 4, title: '验证并结论', content: '精确值核对：\\(P\\{X=0\\}=0.95^{100}\\approx0.0059\\)，近似值 \\(\\mathrm{e}^{-5}\\approx0.0067\\)，两者接近，说明近似合理。易错：\\(\\lambda=np=5\\)（不是 \\(np(1-p)=4.75\\)，那是方差）。故填 \\(\\mathrm{e}^{-5}\\)。' }
                    ],
                    source: { rank: 3, label: 'AI创新', detail: 'AI创新题：串联二项分布与泊松近似（创新维度），难度对标 2025 年数一第 9 题' }
                }
            ]
        },
    ]
};
