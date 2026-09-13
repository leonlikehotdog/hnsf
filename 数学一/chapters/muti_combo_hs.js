/**
 * 考研数学一 ·「母题 22 炼」· 综合母题（高数）
 * 跨章节大题级综合训练，2027 命题预测视角
 */
window.MUTI_COMBO = window.MUTI_COMBO || { meta: { title: '综合母题 12 炼', updatedAt: '2026-09-13' }, combos: [] };
window.MUTI_COMBO.combos.push(

    /* ==================================================================
     * m23 · 高数/解答题 · 幂级数与数项级数综合
     * 母题来源：改编自 2021 年数学一第 18 题（收敛域 + 和函数）
     * ================================================================== */
    {
        id: 'm23',
        part: '高数',
        type: '解答题',
        score: 12,
        topic: '幂级数与数项级数综合（收敛域 · 和函数 · 求和）',
        difficulty: 4,
        chapter: 'ch07',
        chapters: ['ch07'],
        chain: '幂级数收敛半径 → 逐项求导/积分求通项 → 和函数 → 代入特殊点求数项级数',
        kpIds: ['GS.7.2', 'GS.7.3'],
        kpNames: ['幂级数的收敛域', '幂级数的和函数'],
        predict: {
            heat: 5,
            trend: '近 11 年有 5 年考到级数，基本锁定解答题压轴位，且常与微分方程/数列结合',
            years: [2025, 2021, 2020, 2016],
            advice: '先求 R 再单独判端点；求和时逐项求导凑等比、再积分还原，注意常数用初始值定'
        },
        question: '设幂级数 \\(\\displaystyle S(x)=\\sum_{n=1}^{\\infty}\\dfrac{x^{n}}{n\\cdot 2^{n}}\\)。<br>（I）求该幂级数的收敛半径 \\(R\\) 与收敛域；<br>（II）在其收敛区间内求其和函数 \\(S(x)\\)；<br>（III）由此求数项级数 \\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n-1}}{n}\\) 的和。',
        options: [],
        answer: '（I）\\(R=2\\)，收敛域为 \\([-2,\\,2)\\)；<br>（II）\\(S(x)=\\ln\\dfrac{2}{2-x}\\)，\\(x\\in(-2,\\,2)\\)；<br>（III）\\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n-1}}{n}=\\ln 2\\)。',
        concepts: [
            { name: '收敛半径公式', note: '\\(a_n=\\dfrac{1}{n\\cdot 2^{n}}\\) 时，\\(R=\\displaystyle\\lim_{n\\to\\infty}\\left|\\dfrac{a_n}{a_{n+1}}\\right|\\)（比值法）。' },
            { name: '端点判别法', note: '代入 \\(x=\\pm R\\) 化为数项级数：\\(p\\) 级数 \\(\\sum\\dfrac{1}{n^{p}}\\) 在 \\(p>1\\) 收敛、\\(p\\le1\\) 发散；交错级数用莱布尼茨判别法（\\(u_n\\) 单调递减且 \\(u_n\\to0\\)）。' },
            { name: '逐项求导定理', note: '幂级数在收敛区间 \\((-R,R)\\) 内可逐项求导，收敛半径不变：\\(S\'(x)=\\sum_{n=1}^{\\infty}n a_n x^{n-1}\\)。' },
            { name: '逐项积分定理', note: '在 \\((-R,R)\\) 内可逐项积分，收敛半径不变：\\(\\displaystyle\\int_0^x S(t)\\,\\mathrm{d}t=\\sum_{n=1}^{\\infty}\\dfrac{a_n}{n+1}x^{n+1}\\)。' },
            { name: '几何级数', note: '\\(\\displaystyle\\sum_{n=0}^{\\infty}q^{n}=\\dfrac{1}{1-q}\\ (|q|<1)\\)，\\(q\\) 为公比。' },
            { name: '阿贝尔定理（端点处）', note: '若幂级数在端点 \\(x=R\\)（或 \\(x=-R\\)）收敛，则和函数在该端单侧连续，可用 \\(\\displaystyle\\lim_{x\\to R^{-}}S(x)\\)（或 \\(\\lim_{x\\to-R^{+}}S(x)\\)）求端点处级数的和。' }
        ],
        solution: [
            { step: 1, title: '写出系数并求收敛半径 \\(R\\)', content: '通项系数 \\(a_n=\\dfrac{1}{n\\cdot 2^{n}}\\)，则 \\(a_{n+1}=\\dfrac{1}{(n+1)\\cdot 2^{n+1}}\\)。由比值公式：<br>\\[R=\\lim_{n\\to\\infty}\\left|\\dfrac{a_n}{a_{n+1}}\\right|=\\lim_{n\\to\\infty}\\dfrac{(n+1)\\cdot 2^{n+1}}{n\\cdot 2^{n}}=\\lim_{n\\to\\infty}\\dfrac{2(n+1)}{n}=2\\lim_{n\\to\\infty}\\left(1+\\dfrac{1}{n}\\right)=2\\]<br>其中 \\(2^{n+1}/2^{n}=2\\)，\\(\\lim_{n\\to\\infty}\\dfrac{1}{n}=0\\)。故收敛半径 \\(R=2\\)。' },
            { step: 2, title: '判端点 \\(x=2\\)', content: '把 \\(x=2\\) 代入：\\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{2^{n}}{n\\cdot 2^{n}}=\\sum_{n=1}^{\\infty}\\dfrac{1}{n}\\)。这是 \\(p=1\\) 的 \\(p\\) 级数（调和级数），\\(p\\le1\\) 故发散。所以 \\(x=2\\) 处发散。' },
            { step: 3, title: '判端点 \\(x=-2\\)', content: '把 \\(x=-2\\) 代入：\\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-2)^{n}}{n\\cdot 2^{n}}=\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n}}{n}\\)。这是交错级数，记 \\(u_n=\\dfrac{1}{n}\\)，满足 \\(u_{n+1}=\\dfrac{1}{n+1}<\\dfrac{1}{n}=u_n\\)（单调递减）且 \\(\\displaystyle\\lim_{n\\to\\infty}u_n=0\\)，由莱布尼茨判别法收敛。所以 \\(x=-2\\) 处收敛。' },
            { step: 4, title: '写出收敛域，并在 \\((-2,2)\\) 内逐项求导', content: '由步骤 2、3，收敛域为 \\([-2,\\,2)\\)。<br>在 \\(x\\in(-2,2)\\) 内逐项求导（依据“逐项求导定理”）：<br>\\[S\'(x)=\\sum_{n=1}^{\\infty}\\dfrac{n\\,x^{n-1}}{n\\cdot 2^{n}}=\\sum_{n=1}^{\\infty}\\dfrac{x^{n-1}}{2^{n}}\\]<br>注意分子分母中的 \\(n\\) 约去。' },
            { step: 5, title: '把 \\(S\'(x)\\) 凑成等比级数求和', content: '提取公因子 \\(\\dfrac{1}{2}\\)：\\(\\dfrac{x^{n-1}}{2^{n}}=\\dfrac{1}{2}\\cdot\\dfrac{x^{n-1}}{2^{n-1}}=\\dfrac{1}{2}\\left(\\dfrac{x}{2}\\right)^{n-1}\\)。于是<br>\\[S\'(x)=\\dfrac{1}{2}\\sum_{n=1}^{\\infty}\\left(\\dfrac{x}{2}\\right)^{n-1}=\\dfrac{1}{2}\\cdot\\dfrac{1}{1-\\dfrac{x}{2}}=\\dfrac{1}{2-x}\\]<br>其中用了几何级数 \\(\\sum_{n=1}^{\\infty}q^{n-1}=\\dfrac{1}{1-q}\\)，公比 \\(q=\\dfrac{x}{2}\\) 满足 \\(|q|<1\\iff|x|<2\\)。' },
            { step: 6, title: '逐项积分还原 \\(S(x)\\)（用初始值定常数）', content: '由“逐项积分定理”，对 \\(S\'(t)=\\dfrac{1}{2-t}\\) 从 0 到 \\(x\\) 积分：<br>\\[S(x)-S(0)=\\int_0^x\\dfrac{\\mathrm{d}t}{2-t}=\\big[-\\ln(2-t)\\big]_0^x=-\\ln(2-x)+\\ln 2=\\ln\\dfrac{2}{2-x}\\]<br>又 \\(S(0)=\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{0}{n\\cdot 2^{n}}=0\\)，故<br>\\[S(x)=\\ln\\dfrac{2}{2-x},\\quad x\\in(-2,\\,2)\\]' },
            { step: 7, title: '用阿贝尔定理求数项级数之和', content: '数项级数 \\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n-1}}{n}=-\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n}}{n}\\)。而 \\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n}}{n}\\) 恰是幂级数在端点 \\(x=-2\\) 的值，它在 \\(x=-2\\) 收敛，由阿贝尔定理：<br>\\[\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n}}{n}=\\lim_{x\\to-2^{+}}S(x)=\\lim_{x\\to-2^{+}}\\ln\\dfrac{2}{2-x}=\\ln\\dfrac{2}{2-(-2)}=\\ln\\dfrac{1}{2}=-\\ln 2\\]<br>所以 \\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n-1}}{n}=-(-\\ln 2)=\\ln 2\\)。' }
        ],
        tips: [
            '看到通项含 \\(\\dfrac{x^{n}}{n}\\) 就“逐项求导”把分母的 \\(n\\) 约掉；看到含 \\(\\dfrac{x^{n}}{n+1}\\) 就“逐项积分”。',
            '端点求和别硬算，用阿贝尔定理：端点收敛时直接取和函数在该端点的单侧极限。'
        ],
        mistakes: [
            '把收敛区间 \\((-2,2)\\) 直接当收敛域，漏判两个端点 \\(x=\\pm2\\)。',
            '积分还原时忘记用 \\(S(0)=0\\) 定常数，导致和函数多出一个待定常数 \\(C\\)。',
            '在端点 \\(x=-2\\) 处直接对幂级数逐项求导（该点已超出收敛区间内部），须改用阿贝尔定理取极限。'
        ],
        source: { rank: 1, label: '真题', detail: '改编自 2021 年数学一第 18 题（幂级数收敛域 + 和函数）' },
        variants: [
            {
                id: 'm23v1', dimension: '综合计算',
                difficulty: 4,
                chapter: 'ch07', chapters: ['ch07'],
                kpIds: ['GS.7.2'], kpNames: ['幂级数的收敛域'],
                question: '求幂级数 \\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(x-1)^{n}}{n\\cdot 3^{n}}\\) 的收敛半径与收敛域。',
                options: [],
                answer: '收敛半径 \\(R=3\\)，收敛域为 \\([-2,\\,4)\\)。',
                concepts: [
                    { name: '收敛半径公式', note: '\\(a_n=\\dfrac{1}{n\\cdot3^{n}}\\)，\\(R=\\displaystyle\\lim_{n\\to\\infty}\\left|\\dfrac{a_n}{a_{n+1}}\\right|\\)。' },
                    { name: '平移型幂级数', note: '令 \\(t=x-1\\)，化为 \\(\\sum a_n t^{n}\\)，其收敛区间为 \\(|t|<R\\)，即 \\(|x-1|<R\\)。' },
                    { name: '端点判别', note: '\\(p=1\\) 的调和级数发散；交错级数 \\(\\sum\\dfrac{(-1)^{n}}{n}\\) 由莱布尼茨判别法收敛。' }
                ],
                solution: [
                    { step: 1, title: '求收敛半径', content: '\\(a_n=\\dfrac{1}{n\\cdot3^{n}}\\)，\\(a_{n+1}=\\dfrac{1}{(n+1)\\cdot3^{n+1}}\\)：<br>\\[R=\\lim_{n\\to\\infty}\\dfrac{(n+1)\\cdot3^{n+1}}{n\\cdot3^{n}}=\\lim_{n\\to\\infty}\\dfrac{3(n+1)}{n}=3\\]' },
                    { step: 2, title: '写出开区间', content: '级数中心在 \\(x=1\\)，收敛条件 \\(|x-1|<3\\)，即 \\(-2<x<4\\)。' },
                    { step: 3, title: '判左端点 \\(x=-2\\)', content: '代入 \\(x-1=-3\\)：\\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-3)^{n}}{n\\cdot3^{n}}=\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n}}{n}\\)，由莱布尼茨判别法收敛。' },
                    { step: 4, title: '判右端点 \\(x=4\\)', content: '代入 \\(x-1=3\\)：\\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{3^{n}}{n\\cdot3^{n}}=\\sum_{n=1}^{\\infty}\\dfrac{1}{n}\\)，调和级数发散。<br>故收敛域为 \\([-2,\\,4)\\)。' }
                ],
                tips: ['先定位中心 \\(x_0=1\\)，再按 \\(|x-x_0|<R\\) 展开成区间，可避免左右端点写反。'],
                mistakes: ['把 \\(R=3\\) 误当成区间端点坐标（正确端点是 \\(x=1\\pm3\\)，即 \\(-2\\) 与 \\(4\\)）。'],
                source: { rank: 1, label: '真题', detail: '改编自 2016 年数学一第 16 题（幂级数收敛域）' }
            },
            {
                id: 'm23v2', dimension: '综合创新',
                difficulty: 5,
                chapter: 'ch07', chapters: ['ch07'],
                kpIds: ['GS.7.3'], kpNames: ['幂级数的和函数'],
                question: '（I）利用几何级数的逐项求导证明 \\(\\displaystyle\\sum_{n=1}^{\\infty}n x^{n-1}=\\dfrac{1}{(1-x)^{2}}\\ (|x|<1)\\)；<br>（II）求数项级数 \\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n+2}{2^{n}}\\) 的和。',
                options: [],
                answer: '（I）证明见解析；（II）和为 \\(4\\)。',
                concepts: [
                    { name: '几何级数', note: '\\(\\displaystyle\\sum_{n=0}^{\\infty}x^{n}=\\dfrac{1}{1-x}\\ (|x|<1)\\)。' },
                    { name: '逐项求导定理', note: '收敛区间内可逐项求导，半径不变：\\(\\dfrac{\\mathrm{d}}{\\mathrm{d}x}\\sum x^{n}=\\sum n x^{n-1}\\)。' },
                    { name: '数项级数拆分', note: '\\(\\dfrac{n+2}{2^{n}}=\\dfrac{n}{2^{n}}+\\dfrac{2}{2^{n}}\\)，拆成两个已知和的级数分别求和。' }
                ],
                solution: [
                    { step: 1, title: '对几何级数逐项求导', content: '当 \\(|x|<1\\) 时 \\(\\displaystyle\\sum_{n=0}^{\\infty}x^{n}=\\dfrac{1}{1-x}\\)。两边对 \\(x\\) 逐项求导：<br>\\[\\sum_{n=1}^{\\infty}n x^{n-1}=\\dfrac{\\mathrm{d}}{\\mathrm{d}x}\\left(\\dfrac{1}{1-x}\\right)=\\dfrac{1}{(1-x)^{2}}\\]<br>其中由链式法则 \\(\\dfrac{\\mathrm{d}}{\\mathrm{d}x}(1-x)^{-1}=-(1-x)^{-2}\\cdot(-1)=(1-x)^{-2}\\)。' },
                    { step: 2, title: '得到 \\(\\sum n x^{n}\\) 的公式', content: '两边同乘 \\(x\\)：\\(\\displaystyle\\sum_{n=1}^{\\infty}n x^{n}=\\dfrac{x}{(1-x)^{2}}\\ (|x|<1)\\)。' },
                    { step: 3, title: '代入 \\(x=\\dfrac{1}{2}\\) 求第一段', content: '\\[\\sum_{n=1}^{\\infty}\\dfrac{n}{2^{n}}=\\dfrac{\\dfrac{1}{2}}{\\left(1-\\dfrac{1}{2}\\right)^{2}}=\\dfrac{\\dfrac{1}{2}}{\\dfrac{1}{4}}=2\\]' },
                    { step: 4, title: '求第二段 \\(\\sum\\dfrac{2}{2^{n}}\\)', content: '\\[\\sum_{n=1}^{\\infty}\\dfrac{2}{2^{n}}=2\\sum_{n=1}^{\\infty}\\left(\\dfrac{1}{2}\\right)^{n}=2\\cdot\\dfrac{\\dfrac{1}{2}}{1-\\dfrac{1}{2}}=2\\cdot1=2\\]<br>其中用了首项 \\(a_1=\\dfrac{1}{2}\\)、公比 \\(q=\\dfrac{1}{2}\\) 的几何级数求和公式 \\(\\dfrac{a_1}{1-q}\\)。' },
                    { step: 5, title: '合并', content: '\\[\\sum_{n=1}^{\\infty}\\dfrac{n+2}{2^{n}}=\\sum_{n=1}^{\\infty}\\dfrac{n}{2^{n}}+\\sum_{n=1}^{\\infty}\\dfrac{2}{2^{n}}=2+2=4\\]' }
                ],
                tips: ['凡含因子 \\(n\\) 的系数求和，优先想“几何级数逐项求导”，一次求导即可把 \\(n\\) 提到前面。'],
                mistakes: ['对 \\(\\sum x^{n}\\) 求导得到的是 \\(\\sum n x^{n-1}\\)，须再乘 \\(x\\) 才得到 \\(\\sum n x^{n}\\)，两步不要混。'],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：几何级数逐项求导 + 数项级数拆分求和，考核“和函数反求数项级数”，难度对标 2020 年数一第 17 题（略高）' }
            }
        ]
    },

    /* ==================================================================
     * m24 · 高数/解答题 · 曲线积分与格林公式综合
     * 母题来源：改编自 2024 年数学一第 18 题（格林公式 + 路径无关）
     * ================================================================== */
    {
        id: 'm24',
        part: '高数',
        type: '解答题',
        score: 12,
        topic: '曲线积分与格林公式综合（路径无关 · 挖洞 · 全微分）',
        difficulty: 5,
        chapter: 'ch06',
        chapters: ['ch06'],
        chain: '判闭曲线/单连通 → 用格林公式或路径无关 → 遇奇点挖洞 → 求原函数（全微分）',
        kpIds: ['GS.6.6', 'GS.6.7'],
        kpNames: ['格林公式', '曲线积分与路径无关'],
        predict: {
            heat: 5,
            trend: '曲线积分几乎年年出现，2020/2024/2026 均以解答题形式考格林或路径无关',
            years: [2026, 2024, 2020, 2017, 2016],
            advice: '先判是否闭合、是否路径无关；不闭合就补线，有奇点就挖洞'
        },
        question: '记 \\(P(x,y)=\\dfrac{-y}{x^{2}+y^{2}},\\quad Q(x,y)=\\dfrac{x}{x^{2}+y^{2}}\\)（均在 \\((x,y)\\ne(0,0)\\) 处定义）。<br>（I）证明在除原点外的区域上恒有 \\(\\dfrac{\\partial P}{\\partial y}=\\dfrac{\\partial Q}{\\partial x}\\)，并求 \\(P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y\\) 在右半平面 \\(x>0\\) 上的一个原函数；<br>（II）设 \\(L_1\\) 为圆周 \\((x-2)^{2}+y^{2}=1\\) 取正向，计算 \\(\\displaystyle\\oint_{L_1}P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y\\)；<br>（III）设 \\(L_2\\) 为单位圆周 \\(x^{2}+y^{2}=1\\) 取正向，计算 \\(\\displaystyle\\oint_{L_2}P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y\\)。',
        options: [],
        answer: '（I）\\(\\dfrac{\\partial P}{\\partial y}=\\dfrac{\\partial Q}{\\partial x}=\\dfrac{y^{2}-x^{2}}{(x^{2}+y^{2})^{2}}\\)，一个原函数为 \\(u(x,y)=\\arctan\\dfrac{y}{x}\\ (x>0)\\)（即极角）；<br>（II）\\(0\\)；<br>（III）\\(2\\pi\\)。',
        concepts: [
            { name: '格林公式', note: '若 \\(L\\) 为区域 \\(D\\) 的正向边界、\\(P,Q\\) 在 \\(D\\) 上有连续偏导，则 \\(\\displaystyle\\oint_L P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y=\\iint_D\\left(\\dfrac{\\partial Q}{\\partial x}-\\dfrac{\\partial P}{\\partial y}\\right)\\mathrm{d}x\\,\\mathrm{d}y\\)。' },
            { name: '路径无关条件', note: '在单连通区域上，\\(\\dfrac{\\partial P}{\\partial y}=\\dfrac{\\partial Q}{\\partial x}\\) 等价于曲线积分与路径无关，也等价于存在原函数 \\(u\\) 使 \\(\\mathrm{d}u=P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y\\)。' },
            { name: '全微分与原函数', note: '若 \\(\\mathrm{d}u=P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y\\)，则沿任意路径 \\(\\displaystyle\\int_{A}^{B}P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y=u(B)-u(A)\\)。' },
            { name: '奇点与不单连通域', note: '\\(P,Q\\) 在原点无定义，含原点的区域不是单连通域，“路径无关”与“格林公式”都不能直接用，需绕开原点（挖洞）或直接参数化计算。' },
            { name: '挖洞法', note: '若两条闭曲线都正向绕原点一周且都不经过原点，则它们上的积分相等（用格林公式作用于两曲线之间的“环带”区域，得两积分之差为 0）。' },
            { name: '极坐标参数化', note: '单位圆上取 \\(x=\\cos t,\\ y=\\sin t,\\ t\\in[0,2\\pi]\\)，则 \\(\\mathrm{d}x=-\\sin t\\,\\mathrm{d}t,\\ \\mathrm{d}y=\\cos t\\,\\mathrm{d}t\\)。' }
        ],
        solution: [
            { step: 1, title: '计算 \\(\\dfrac{\\partial P}{\\partial y}\\)', content: '记 \\(P=-y\\cdot(x^{2}+y^{2})^{-1}\\)，对 \\(y\\) 用商法则：<br>\\[\\dfrac{\\partial P}{\\partial y}=\\dfrac{(-1)(x^{2}+y^{2})-(-y)\\cdot 2y}{(x^{2}+y^{2})^{2}}=\\dfrac{-x^{2}-y^{2}+2y^{2}}{(x^{2}+y^{2})^{2}}=\\dfrac{y^{2}-x^{2}}{(x^{2}+y^{2})^{2}}\\]' },
            { step: 2, title: '计算 \\(\\dfrac{\\partial Q}{\\partial x}\\) 并与上比较', content: '\\[\\dfrac{\\partial Q}{\\partial x}=\\dfrac{1\\cdot(x^{2}+y^{2})-x\\cdot 2x}{(x^{2}+y^{2})^{2}}=\\dfrac{x^{2}+y^{2}-2x^{2}}{(x^{2}+y^{2})^{2}}=\\dfrac{y^{2}-x^{2}}{(x^{2}+y^{2})^{2}}\\]<br>与步骤 1 的结果相同，故在 \\((x,y)\\ne(0,0)\\) 上恒有 \\(\\dfrac{\\partial P}{\\partial y}=\\dfrac{\\partial Q}{\\partial x}\\)。' },
            { step: 3, title: '求原函数（验证 \\(\\arctan\\dfrac{y}{x}\\) 的全微分）', content: '取 \\(u(x,y)=\\arctan\\dfrac{y}{x}\\ (x>0)\\)。先算 \\(\\dfrac{\\partial u}{\\partial x}\\)：令 \\(v=\\dfrac{y}{x}\\)，由 \\((\\arctan v)\'=\\dfrac{1}{1+v^{2}}\\) 与 \\(\\dfrac{\\partial v}{\\partial x}=-\\dfrac{y}{x^{2}}\\)：<br>\\[\\dfrac{\\partial u}{\\partial x}=\\dfrac{1}{1+\\dfrac{y^{2}}{x^{2}}}\\cdot\\left(-\\dfrac{y}{x^{2}}\\right)=\\dfrac{x^{2}}{x^{2}+y^{2}}\\cdot\\left(-\\dfrac{y}{x^{2}}\\right)=\\dfrac{-y}{x^{2}+y^{2}}=P\\]<br>再算 \\(\\dfrac{\\partial u}{\\partial y}=\\dfrac{1}{1+\\dfrac{y^{2}}{x^{2}}}\\cdot\\dfrac{1}{x}=\\dfrac{x^{2}}{x^{2}+y^{2}}\\cdot\\dfrac{1}{x}=\\dfrac{x}{x^{2}+y^{2}}=Q\\)。<br>故 \\(\\mathrm{d}u=P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y\\)，即 \\(u=\\arctan\\dfrac{y}{x}\\) 是一个原函数。' },
            { step: 4, title: '分析 \\(L_1\\) 所围区域，用格林公式', content: '\\(L_1\\) 为圆 \\((x-2)^{2}+y^{2}=1\\)，它所围闭区域满足 \\(x\\ge1>0\\)，完全落在右半平面内，是单连通区域且不含原点，\\(P,Q\\) 在其上有连续偏导。由格林公式：<br>\\[\\oint_{L_1}P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y=\\iint_{D_1}\\left(\\dfrac{\\partial Q}{\\partial x}-\\dfrac{\\partial P}{\\partial y}\\right)\\mathrm{d}x\\,\\mathrm{d}y=\\iint_{D_1}0\\,\\mathrm{d}x\\,\\mathrm{d}y=0\\]' },
            { step: 5, title: '处理 \\(L_2\\)：判断不能直接用格林公式', content: '\\(L_2\\) 为单位圆，其内部含原点，而原点处 \\(P,Q\\) 无定义、无连续偏导，格林公式与路径无关均不能直接在含原点的区域上使用。故改用参数化直接计算。' },
            { step: 6, title: '参数化计算 \\(\\displaystyle\\oint_{L_2}\\)', content: '取 \\(x=\\cos t,\\ y=\\sin t,\\ t:0\\to2\\pi\\)（正向逆时针），则 \\(\\mathrm{d}x=-\\sin t\\,\\mathrm{d}t,\\ \\mathrm{d}y=\\cos t\\,\\mathrm{d}t\\)，且 \\(x^{2}+y^{2}=1\\)：<br>\\[P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y=\\dfrac{-y\\,\\mathrm{d}x+x\\,\\mathrm{d}y}{x^{2}+y^{2}}=\\dfrac{(-\\sin t)(-\\sin t)+(\\cos t)(\\cos t)}{1}\\,\\mathrm{d}t=(\\sin^{2}t+\\cos^{2}t)\\,\\mathrm{d}t=\\mathrm{d}t\\]' },
            { step: 7, title: '积分并得结论', content: '\\[\\oint_{L_2}P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y=\\int_0^{2\\pi}\\mathrm{d}t=2\\pi\\]<br>结论：不绕原点的闭曲线积分为 \\(0\\)，绕原点一周的闭曲线积分为 \\(2\\pi\\)——差异完全由原点这个奇点造成（等价于挖洞后取小圆周，积分同样是 \\(2\\pi\\)）。' }
        ],
        tips: [
            '丘式口诀：“先看闭合否，再判路径否；不闭合补线，有洞就挖洞”。',
            '遇到 \\(\\dfrac{x\\,\\mathrm{d}y-y\\,\\mathrm{d}x}{x^{2}+y^{2}}\\) 立刻反应：这是极角的微分 \\(\\mathrm{d}\\theta\\)，绕原点一周积分必为 \\(2\\pi\\)。'
        ],
        mistakes: [
            '看到 \\(P_y=Q_x\\) 就断定任意闭曲线积分都为 0，忽略了含原点时区域不单连通。',
            '对含原点的区域套用格林公式，把 \\(L_2\\) 上的积分也算成 0。',
            '补线时方向取反（补线应与原路径构成正向闭曲线，通常补线要取反向）。'
        ],
        source: { rank: 1, label: '真题', detail: '改编自 2024 年数学一第 18 题（格林公式 + 路径无关 + 奇点）' },
        variants: [
            {
                id: 'm24v1', dimension: '综合计算',
                difficulty: 4,
                chapter: 'ch06', chapters: ['ch06'],
                kpIds: ['GS.6.6'], kpNames: ['格林公式'],
                question: '计算 \\(\\displaystyle\\oint_{L}(2x-y+4)\\,\\mathrm{d}x+(5y+3x-6)\\,\\mathrm{d}y\\)，其中 \\(L\\) 为以 \\((0,0),(3,0),(0,2)\\) 为顶点的三角形取正向的边界。',
                options: [],
                answer: '\\(12\\)。',
                concepts: [
                    { name: '格林公式', note: '\\(\\displaystyle\\oint_L P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y=\\iint_D\\left(\\dfrac{\\partial Q}{\\partial x}-\\dfrac{\\partial P}{\\partial y}\\right)\\mathrm{d}x\\,\\mathrm{d}y\\)，\\(L\\) 取正向。' },
                    { name: '被积函数为常数时的二重积分', note: '若 \\(\\dfrac{\\partial Q}{\\partial x}-\\dfrac{\\partial P}{\\partial y}=c\\) 为常数，则积分 \\(=c\\cdot(\\text{区域面积})\\)。' },
                    { name: '三角形面积', note: '直角边长分别为 \\(3,2\\) 的三角形面积 \\(=\\dfrac{1}{2}\\times3\\times2=3\\)。' }
                ],
                solution: [
                    { step: 1, title: '写 \\(P,Q\\) 并求偏导之差', content: '\\(P=2x-y+4,\\ Q=5y+3x-6\\)。<br>\\(\\dfrac{\\partial Q}{\\partial x}=3\\)，\\(\\dfrac{\\partial P}{\\partial y}=-1\\)，故 \\(\\dfrac{\\partial Q}{\\partial x}-\\dfrac{\\partial P}{\\partial y}=3-(-1)=4\\)。' },
                    { step: 2, title: '求区域面积', content: '三角形顶点 \\((0,0),(3,0),(0,2)\\)，两直角边长为 \\(3\\) 与 \\(2\\)：面积 \\(=|D|=\\dfrac{1}{2}\\cdot3\\cdot2=3\\)。' },
                    { step: 3, title: '套格林公式', content: '\\[\\oint_L P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y=\\iint_D 4\\,\\mathrm{d}x\\,\\mathrm{d}y=4|D|=4\\times3=12\\]' }
                ],
                tips: ['格林公式把“边界上的曲线积分”降维成“区域上的二重积分”，遇到被积函数是线性式时偏导之积为常数，秒算成 \\(c\\times\\) 面积。'],
                mistakes: ['把正向边界的方向搞反，导致结果差一个负号（正向区域在左侧行走）。'],
                source: { rank: 1, label: '真题', detail: '改编自 2017 年数学一第 18 题（格林公式）' }
            },
            {
                id: 'm24v2', dimension: '综合创新',
                difficulty: 5,
                chapter: 'ch06', chapters: ['ch06'],
                kpIds: ['GS.6.7'], kpNames: ['曲线积分与路径无关', '全微分求原函数'],
                question: '（I）验证 \\((2xy+y^{2})\\,\\mathrm{d}x+(x^{2}+2xy)\\,\\mathrm{d}y\\) 是某个二元函数的全微分，并求出该函数；<br>（II）计算 \\(\\displaystyle\\int_{(0,0)}^{(1,1)}(2xy+y^{2})\\,\\mathrm{d}x+(x^{2}+2xy)\\,\\mathrm{d}y\\)。',
                options: [],
                answer: '（I）\\(u(x,y)=x^{2}y+xy^{2}+C\\)；（II）\\(2\\)。',
                concepts: [
                    { name: '全微分判别', note: '在单连通区域上，\\(P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y\\) 为全微分 \\(\\iff\\dfrac{\\partial P}{\\partial y}=\\dfrac{\\partial Q}{\\partial x}\\)。' },
                    { name: '求原函数的凑微分法', note: '由 \\(\\dfrac{\\partial u}{\\partial x}=P\\) 对 \\(x\\) 积分得 \\(u=\\int P\\,\\mathrm{d}x+\\varphi(y)\\)，再用 \\(\\dfrac{\\partial u}{\\partial y}=Q\\) 定出 \\(\\varphi(y)\\)。' },
                    { name: '牛顿-莱布尼茨公式', note: '全微分的路径积分 \\(=u(\\text{终点})-u(\\text{起点})\\)。' }
                ],
                solution: [
                    { step: 1, title: '验证全微分条件', content: '\\(P=2xy+y^{2}\\)，\\(Q=x^{2}+2xy\\)。<br>\\(\\dfrac{\\partial P}{\\partial y}=2x+2y\\)，\\(\\dfrac{\\partial Q}{\\partial x}=2x+2y\\)，两者相等，且平面是单连通区域，故为某函数的全微分。' },
                    { step: 2, title: '对 \\(x\\) 积分求 \\(u\\)', content: '设 \\(\\dfrac{\\partial u}{\\partial x}=2xy+y^{2}\\)，对 \\(x\\) 积分（把 \\(y\\) 当作常数）：<br>\\[u=\\int(2xy+y^{2})\\,\\mathrm{d}x=x^{2}y+xy^{2}+\\varphi(y)\\]<br>其中 \\(\\varphi(y)\\) 是待定的关于 \\(y\\) 的函数。' },
                    { step: 3, title: '用 \\(\\dfrac{\\partial u}{\\partial y}=Q\\) 定 \\(\\varphi(y)\\)', content: '\\[\\dfrac{\\partial u}{\\partial y}=x^{2}+2xy+\\varphi\'(y)\\]<br>要求它等于 \\(Q=x^{2}+2xy\\)，故 \\(\\varphi\'(y)=0\\)，即 \\(\\varphi(y)=C\\)（常数）。<br>所以 \\(u(x,y)=x^{2}y+xy^{2}+C\\)。' },
                    { step: 4, title: '用原函数求路径积分', content: '\\[\\int_{(0,0)}^{(1,1)}P\\,\\mathrm{d}x+Q\\,\\mathrm{d}y=u(1,1)-u(0,0)=(1^{2}\\cdot1+1\\cdot1^{2}+C)-(0+C)=2\\]' }
                ],
                tips: ['判出全微分后，直接“凑”原函数（如 \\(2xy\\,\\mathrm{d}x+x^{2}\\,\\mathrm{d}y=\\mathrm{d}(x^{2}y)\\)）往往比积分更快：本题 \\((2xy+y^{2})\\mathrm{d}x+(x^{2}+2xy)\\mathrm{d}y=\\mathrm{d}(x^{2}y)+\\mathrm{d}(xy^{2})\\)。'],
                mistakes: ['定 \\(\\varphi(y)\\) 时误把常数写成关于 \\(x\\) 的函数，导致原函数不唯一且积分结果出错。'],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：路径无关 + 全微分求原函数（综合创新维度），考核点对标 2020 年数一第 18 题，难度略高' }
            }
        ]
    },

    /* ==================================================================
     * m25 · 高数/解答题 · 定积分几何应用与反常积分敛散性
     * 母题来源：改编自 2018 年数学一第 17 题（旋转体体积 + 反常积分）
     * ================================================================== */
    {
        id: 'm25',
        part: '高数',
        type: '解答题',
        score: 12,
        topic: '定积分几何应用与反常积分敛散性（旋转体 · 面积 · 比较判别）',
        difficulty: 4,
        chapter: 'ch03',
        chapters: ['ch03'],
        chain: '画图定限 → 面积/旋转体体积/侧面积化定积分 → 反常积分取极限 → 比较判别定敛散',
        kpIds: ['GS.3.4', 'GS.3.5'],
        kpNames: ['定积分的几何应用', '反常积分的敛散性'],
        predict: {
            heat: 4,
            trend: '定积分几何应用与反常积分在 2016-2019 连年出现，近年转为与极限、级数混考',
            years: [2019, 2018, 2017, 2016],
            advice: '几何应用先画图定积分限；反常积分在瑕点附近用等价无穷小定阶'
        },
        question: '设 \\(D\\) 为曲线 \\(y=\\dfrac{1}{x}\\ (x\\ge1)\\)、直线 \\(x=1\\) 与 \\(x\\) 轴所围成的无界区域。<br>（I）讨论 \\(D\\) 的面积 \\(A\\)（即反常积分 \\(\\displaystyle\\int_1^{+\\infty}\\dfrac{1}{x}\\,\\mathrm{d}x\\)）是否有限；<br>（II）求 \\(D\\) 绕 \\(x\\) 轴旋转所得旋转体的体积 \\(V\\)；<br>（III）求该旋转体的侧面积 \\(S\\)，并讨论其是否有限。',
        options: [],
        answer: '（I）\\(A\\) 发散（面积为 \\(+\\infty\\)，无限大）；<br>（II）\\(V=\\pi\\)（有限）；<br>（III）\\(S\\) 发散（侧面积为 \\(+\\infty\\)）。',
        concepts: [
            { name: '反常积分定义', note: '\\(\\displaystyle\\int_1^{+\\infty}f(x)\\,\\mathrm{d}x=\\lim_{b\\to+\\infty}\\int_1^{b}f(x)\\,\\mathrm{d}x\\)，极限存在则收敛，否则发散。' },
            { name: '\\(p\\) 积分', note: '\\(\\displaystyle\\int_1^{+\\infty}\\dfrac{1}{x^{p}}\\,\\mathrm{d}x\\) 在 \\(p>1\\) 时收敛、在 \\(p\\le1\\) 时发散。' },
            { name: '比较判别法', note: '若 \\(0\\le g(x)\\le f(x)\\)，则 \\(\\int f\\) 发散 \\(\\Rightarrow\\int g\\) 发散；\\(\\int g\\) 收敛 \\(\\Rightarrow\\int f\\) 收敛。' },
            { name: '旋转体体积（绕 \\(x\\) 轴）', note: '\\(V=\\pi\\displaystyle\\int_a^{b}y^{2}\\,\\mathrm{d}x\\)（微元为半径 \\(y\\) 的薄圆盘）。' },
            { name: '旋转体侧面积（绕 \\(x\\) 轴）', note: '\\(S=2\\pi\\displaystyle\\int_a^{b}y\\sqrt{1+(y\')^{2}}\\,\\mathrm{d}x\\)（微元为弧长 \\(\\mathrm{d}s\\) 扫出的圆台侧面）。' }
        ],
        solution: [
            { step: 1, title: '面积：化为反常积分', content: '区域 \\(D\\) 在 \\(x\\in[1,+\\infty)\\) 上，高度为 \\(y=\\dfrac{1}{x}\\)，面积 \\(\\displaystyle A=\\int_1^{+\\infty}\\dfrac{1}{x}\\,\\mathrm{d}x\\)。' },
            { step: 2, title: '按定义计算并判敛', content: '\\[A=\\lim_{b\\to+\\infty}\\int_1^{b}\\dfrac{1}{x}\\,\\mathrm{d}x=\\lim_{b\\to+\\infty}\\big[\\ln x\\big]_1^{b}=\\lim_{b\\to+\\infty}\\ln b=+\\infty\\]<br>这是 \\(p=1\\) 的 \\(p\\) 积分，\\(p\\le1\\) 发散，故面积无限大。' },
            { step: 3, title: '体积：化为反常积分', content: '绕 \\(x\\) 轴旋转，微元是半径 \\(y=\\dfrac{1}{x}\\) 的圆盘，\\(\\mathrm{d}V=\\pi y^{2}\\,\\mathrm{d}x=\\pi\\dfrac{1}{x^{2}}\\,\\mathrm{d}x\\)：<br>\\[V=\\pi\\int_1^{+\\infty}\\dfrac{1}{x^{2}}\\,\\mathrm{d}x\\]' },
            { step: 4, title: '计算体积', content: '\\[V=\\pi\\lim_{b\\to+\\infty}\\int_1^{b}x^{-2}\\,\\mathrm{d}x=\\pi\\lim_{b\\to+\\infty}\\big[-x^{-1}\\big]_1^{b}=\\pi\\lim_{b\\to+\\infty}\\left(-\\dfrac{1}{b}+1\\right)=\\pi\\]<br>这是 \\(p=2>1\\) 的 \\(p\\) 积分，收敛，故体积有限（托里拆利小号）。' },
            { step: 5, title: '侧面积：先求弧长微元', content: '\\(y=\\dfrac{1}{x}\\)，\\(y\'=-\\dfrac{1}{x^{2}}\\)，故<br>\\[\\sqrt{1+(y\')^{2}}=\\sqrt{1+\\dfrac{1}{x^{4}}},\\qquad S=2\\pi\\int_1^{+\\infty}\\dfrac{1}{x}\\sqrt{1+\\dfrac{1}{x^{4}}}\\,\\mathrm{d}x\\]' },
            { step: 6, title: '用比较判别法判侧面积敛散', content: '当 \\(x\\ge1\\) 时 \\(0<\\dfrac{1}{x^{4}}\\le1\\)，故 \\(1\\le\\sqrt{1+\\dfrac{1}{x^{4}}}\\le\\sqrt{2}\\)，从而<br>\\[\\dfrac{1}{x}\\le\\dfrac{1}{x}\\sqrt{1+\\dfrac{1}{x^{4}}}\\le\\dfrac{\\sqrt{2}}{x}\\]<br>即被积函数不小于 \\(\\dfrac{1}{x}\\)。而 \\(\\displaystyle\\int_1^{+\\infty}\\dfrac{1}{x}\\,\\mathrm{d}x\\) 发散（步骤 2），由比较判别法，\\(\\displaystyle\\int_1^{+\\infty}\\dfrac{1}{x}\\sqrt{1+\\dfrac{1}{x^{4}}}\\,\\mathrm{d}x\\) 也发散，故 \\(S=+\\infty\\)。' },
            { step: 7, title: '结论', content: '同一区域：面积发散、体积 \\(=\\pi\\) 有限、侧面积发散。面积与侧面积发散，体积却有限，正是“托里拆利小号”的特征。' }
        ],
        tips: [
            '几何应用先画图：绕 \\(x\\) 轴旋转用圆盘法 \\(V=\\pi\\int y^{2}\\,\\mathrm{d}x\\)（竖直切片），绕 \\(y\\) 轴用柱壳法 \\(V=2\\pi\\int x y\\,\\mathrm{d}x\\)。',
            '判反常积分敛散，先看被积函数在无穷远处的主阶，抓“谁大谁小”套比较判别法。'
        ],
        mistakes: [
            '把侧面积公式记成 \\(2\\pi\\int y\\,\\mathrm{d}x\\)，漏掉弧长因子 \\(\\sqrt{1+(y\')^{2}}\\)。',
            '对无界区域直接说“面积无限则旋转体体积也无限”，误以为二者同敛散。',
            '比较判别时把不等式方向写反（要保证被积函数有“发散的下界”或“收敛的上界”）。'
        ],
        source: { rank: 1, label: '真题', detail: '改编自 2018 年数学一第 17 题（旋转体体积 + 反常积分敛散性）' },
        variants: [
            {
                id: 'm25v1', dimension: '综合计算',
                difficulty: 4,
                chapter: 'ch03', chapters: ['ch03'],
                kpIds: ['GS.3.4'], kpNames: ['定积分的几何应用'],
                question: '设区域 \\(D\\) 由曲线 \\(y=\\mathrm{e}^{-x}\\ (x\\ge0)\\) 与两坐标轴围成。<br>（I）求 \\(D\\) 的面积 \\(A\\)；<br>（II）求 \\(D\\) 绕 \\(x\\) 轴旋转所得旋转体的体积 \\(V\\)。',
                options: [],
                answer: '（I）\\(A=1\\)；（II）\\(V=\\dfrac{\\pi}{2}\\)。',
                concepts: [
                    { name: '无界区域面积', note: '\\(A=\\int_0^{+\\infty}\\mathrm{e}^{-x}\\,\\mathrm{d}x\\)，按反常积分定义取极限。' },
                    { name: '旋转体体积', note: '\\(V=\\pi\\int_0^{+\\infty}y^{2}\\,\\mathrm{d}x=\\pi\\int_0^{+\\infty}\\mathrm{e}^{-2x}\\,\\mathrm{d}x\\)。' }
                ],
                solution: [
                    { step: 1, title: '求面积', content: '\\[A=\\int_0^{+\\infty}\\mathrm{e}^{-x}\\,\\mathrm{d}x=\\lim_{b\\to+\\infty}\\big[-\\mathrm{e}^{-x}\\big]_0^{b}=\\lim_{b\\to+\\infty}(-\\mathrm{e}^{-b}+1)=1\\]' },
                    { step: 2, title: '写出体积积分', content: '\\(y=\\mathrm{e}^{-x}\\)，\\(y^{2}=\\mathrm{e}^{-2x}\\)，\\[V=\\pi\\int_0^{+\\infty}\\mathrm{e}^{-2x}\\,\\mathrm{d}x\\]' },
                    { step: 3, title: '计算体积', content: '\\[V=\\pi\\lim_{b\\to+\\infty}\\left[-\\dfrac{1}{2}\\mathrm{e}^{-2x}\\right]_0^{b}=\\pi\\left(0+\\dfrac{1}{2}\\right)=\\dfrac{\\pi}{2}\\]' }
                ],
                tips: ['\\(\\int_0^{+\\infty}\\mathrm{e}^{-ax}\\,\\mathrm{d}x=\\dfrac{1}{a}\\)（\\(a>0\\)）可直接记住，本题 \\(a=1\\) 与 \\(a=2\\)。'],
                mistakes: ['对 \\(\\mathrm{e}^{-2x}\\) 积分时漏乘 \\(\\dfrac{1}{2}\\)（链式法则反用）。'],
                source: { rank: 1, label: '真题', detail: '改编自 2017 年数学一第 17 题（旋转体体积与反常积分）' }
            },
            {
                id: 'm25v2', dimension: '综合创新',
                difficulty: 5,
                chapter: 'ch03', chapters: ['ch03'],
                kpIds: ['GS.3.5'], kpNames: ['反常积分的敛散性'],
                question: '判断反常积分 \\(\\displaystyle\\int_1^{+\\infty}\\dfrac{x+1}{x^{3}+1}\\,\\mathrm{d}x\\) 的敛散性；若收敛，求其值。',
                options: [],
                answer: '收敛，其值为 \\(\\dfrac{2\\pi}{3\\sqrt{3}}=\\dfrac{2\\sqrt{3}\\,\\pi}{9}\\)。',
                concepts: [
                    { name: '比较判别法（无穷限）', note: '当 \\(x\\to+\\infty\\) 时若被积函数与 \\(\\dfrac{1}{x^{p}}\\) 同阶，则 \\(p>1\\) 收敛、\\(p\\le1\\) 发散。' },
                    { name: '立方和分解', note: '\\(x^{3}+1=(x+1)(x^{2}-x+1)\\)，可约去分子中的因子 \\(x+1\\)。' },
                    { name: '配方与标准积分', note: '\\(x^{2}-x+1=\\left(x-\\dfrac{1}{2}\\right)^{2}+\\left(\\dfrac{\\sqrt{3}}{2}\\right)^{2}\\)，\\(\\displaystyle\\int\\dfrac{\\mathrm{d}u}{u^{2}+a^{2}}=\\dfrac{1}{a}\\arctan\\dfrac{u}{a}+C\\)。' }
                ],
                solution: [
                    { step: 1, title: '先判敛散', content: '当 \\(x\\to+\\infty\\) 时 \\(\\dfrac{x+1}{x^{3}+1}\\sim\\dfrac{x}{x^{3}}=\\dfrac{1}{x^{2}}\\)。由比较判别法，\\(\\displaystyle\\int_1^{+\\infty}\\dfrac{1}{x^{2}}\\,\\mathrm{d}x\\)（\\(p=2>1\\)）收敛，故原积分收敛。' },
                    { step: 2, title: '因式分解并约分', content: '\\[\\dfrac{x+1}{x^{3}+1}=\\dfrac{x+1}{(x+1)(x^{2}-x+1)}=\\dfrac{1}{x^{2}-x+1}\\]' },
                    { step: 3, title: '配方', content: '\\[x^{2}-x+1=\\left(x-\\dfrac{1}{2}\\right)^{2}+\\left(\\dfrac{\\sqrt{3}}{2}\\right)^{2}\\]' },
                    { step: 4, title: '求原函数并代入上下限', content: '\\[\\int\\dfrac{\\mathrm{d}x}{x^{2}-x+1}=\\dfrac{2}{\\sqrt{3}}\\arctan\\dfrac{2x-1}{\\sqrt{3}}+C\\]<br>于是<br>\\[\\int_1^{+\\infty}\\dfrac{\\mathrm{d}x}{x^{2}-x+1}=\\dfrac{2}{\\sqrt{3}}\\left[\\dfrac{\\pi}{2}-\\arctan\\dfrac{1}{\\sqrt{3}}\\right]=\\dfrac{2}{\\sqrt{3}}\\left[\\dfrac{\\pi}{2}-\\dfrac{\\pi}{6}\\right]=\\dfrac{2}{\\sqrt{3}}\\cdot\\dfrac{\\pi}{3}=\\dfrac{2\\pi}{3\\sqrt{3}}\\]<br>即 \\(\\dfrac{2\\sqrt{3}\\,\\pi}{9}\\)。' }
                ],
                tips: ['有理函数分母含 \\(x^{3}\\pm1\\) 时先因式分解约分，再配方成 \\(\\arctan\\) 标准型，能一步到位。'],
                mistakes: ['直接对 \\(\\dfrac{x+1}{x^{3}+1}\\) 部分分式拆项，比先约分麻烦且易错。'],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：反常积分敛散性 + 有理函数因式分解配方求值（综合创新维度），考核点对标 2016 年数一第 16 题，难度略高' }
            }
        ]
    },

    /* ==================================================================
     * m26 · 高数/解答题 · 数列极限与级数收敛证明
     * 母题来源：改编自 2020 年数学一第 19 题（数列极限 + 级数）
     * ================================================================== */
    {
        id: 'm26',
        part: '高数',
        type: '解答题',
        score: 12,
        topic: '数列极限与级数收敛证明（单调有界 · 压缩 · 望远镜求和）',
        difficulty: 4,
        chapter: 'ch01',
        chapters: ['ch01', 'ch07'],
        chain: '均值不等式证有界 → 作差证单调 → 单调有界准则得极限 → 对递推取极限 → 级数部分和望远镜求值',
        kpIds: ['GS.1.3', 'GS.7.1'],
        kpNames: ['单调有界准则', '常数项级数的敛散性'],
        predict: {
            heat: 5,
            trend: '证明题连年不断（2023-2026 未缺席），数列+级数是最常见的复合证明型',
            years: [2026, 2025, 2024, 2023, 2020, 2019, 2018, 2016],
            advice: '先证有界再证单调；遇到 x_{n+1}=f(x_n) 优先用拉格朗日中值定理压缩'
        },
        question: '设数列 \\(\\{x_n\\}\\) 由 \\(x_1=2\\)，\\(x_{n+1}=\\dfrac{1}{2}\\left(x_n+\\dfrac{2}{x_n}\\right)\\ (n=1,2,\\cdots)\\) 确定。<br>（I）证明对一切正整数 \\(n\\) 有 \\(x_n\\ge\\sqrt{2}\\)；<br>（II）证明 \\(\\{x_n\\}\\) 单调递减，并求 \\(\\displaystyle\\lim_{n\\to\\infty}x_n\\)；<br>（III）讨论数项级数 \\(\\displaystyle\\sum_{n=1}^{\\infty}(x_n-x_{n+1})\\) 的敛散性，若收敛求其和。',
        options: [],
        answer: '（I）证明见解析，\\(x_n\\ge\\sqrt{2}\\)；（II）\\(\\{x_n\\}\\) 单调递减，\\(\\displaystyle\\lim_{n\\to\\infty}x_n=\\sqrt{2}\\)；（III）级数收敛，其和为 \\(2-\\sqrt{2}\\)。',
        concepts: [
            { name: '均值不等式', note: '对 \\(a,b>0\\) 有 \\(a+b\\ge2\\sqrt{ab}\\)，即 \\(\\dfrac{a+b}{2}\\ge\\sqrt{ab}\\)。' },
            { name: '单调有界准则', note: '单调递增且有上界（或单调递减且有下界）的数列必收敛。' },
            { name: '递推数列求极限', note: '若已知 \\(\\{x_n\\}\\) 收敛，可对递推式两边取极限得关于 \\(L\\) 的方程，解出 \\(L\\)。' },
            { name: '级数收敛的定义', note: '\\(\\displaystyle\\sum_{n=1}^{\\infty}a_n\\) 收敛 \\(\\iff\\) 部分和数列 \\(S_N=\\sum_{n=1}^{N}a_n\\) 收敛，其和 \\(=\\lim_{N\\to\\infty}S_N\\)。' },
            { name: '望远镜（裂项）求和', note: '\\(\\displaystyle\\sum_{n=1}^{N}(x_n-x_{n+1})=(x_1-x_2)+(x_2-x_3)+\\cdots+(x_N-x_{N+1})=x_1-x_{N+1}\\)，中间项两两抵消。' }
        ],
        solution: [
            { step: 1, title: '（I）用均值不等式证有界', content: '对 \\(x_{n+1}=\\dfrac{1}{2}\\left(x_n+\\dfrac{2}{x_n}\\right)\\)，由均值不等式（\\(a=x_n>0\\)，\\(b=\\dfrac{2}{x_n}>0\\)）：<br>\\[x_{n+1}=\\dfrac{1}{2}\\left(x_n+\\dfrac{2}{x_n}\\right)\\ge\\sqrt{x_n\\cdot\\dfrac{2}{x_n}}=\\sqrt{2}\\]<br>这对一切 \\(n\\) 成立（前提 \\(x_n>0\\)，由 \\(x_1=2>0\\) 及递推式显然归正）。又 \\(x_1=2\\ge\\sqrt{2}\\)，故对一切正整数 \\(n\\) 有 \\(x_n\\ge\\sqrt{2}\\)。' },
            { step: 2, title: '（II）作差证单调递减', content: '\\[x_{n+1}-x_n=\\dfrac{1}{2}\\left(x_n+\\dfrac{2}{x_n}\\right)-x_n=\\dfrac{2}{2x_n}-\\dfrac{x_n}{2}=\\dfrac{2-x_n^{2}}{2x_n}\\]<br>由步骤 1，\\(x_n^{2}\\ge2\\)，故分子 \\(2-x_n^{2}\\le0\\)，分母 \\(2x_n>0\\)，于是 \\(x_{n+1}-x_n\\le0\\)，即 \\(\\{x_n\\}\\) 单调递减。' },
            { step: 3, title: '用单调有界准则判定收敛', content: '\\(\\{x_n\\}\\) 单调递减且有下界 \\(\\sqrt{2}\\)（步骤 1），由单调有界准则，\\(\\{x_n\\}\\) 收敛。设 \\(\\displaystyle\\lim_{n\\to\\infty}x_n=L\\)，则 \\(L\\ge\\sqrt{2}>0\\)。' },
            { step: 4, title: '对递推式取极限求 \\(L\\)', content: '在 \\(x_{n+1}=\\dfrac{1}{2}\\left(x_n+\\dfrac{2}{x_n}\\right)\\) 两边令 \\(n\\to\\infty\\)（注意 \\(x_n\\to L\\)，且 \\(L\\ne0\\) 使 \\(\\dfrac{2}{x_n}\\to\\dfrac{2}{L}\\)）：<br>\\[L=\\dfrac{1}{2}\\left(L+\\dfrac{2}{L}\\right)\\]<br>两边乘 \\(2\\)：\\(2L=L+\\dfrac{2}{L}\\)，移项得 \\(L=\\dfrac{2}{L}\\)，即 \\(L^{2}=2\\)。结合 \\(L>0\\) 得 \\(L=\\sqrt{2}\\)。' },
            { step: 5, title: '（III）写部分和', content: '记 \\(S_N=\\displaystyle\\sum_{n=1}^{N}(x_n-x_{n+1})\\)。把它逐项展开：<br>\\[S_N=(x_1-x_2)+(x_2-x_3)+\\cdots+(x_N-x_{N+1})\\]<br>每个 \\(-x_{n+1}\\) 与下一个 \\(+x_{n+1}\\) 相消（望远镜求和），只剩首尾。' },
            { step: 6, title: '化简并取极限', content: '\\[S_N=x_1-x_{N+1}=2-x_{N+1}\\]<br>由步骤 4，\\(\\displaystyle\\lim_{N\\to\\infty}x_{N+1}=\\sqrt{2}\\)，故<br>\\[\\sum_{n=1}^{\\infty}(x_n-x_{n+1})=\\lim_{N\\to\\infty}S_N=2-\\sqrt{2}\\]<br>极限存在，故该数项级数收敛，其和为 \\(2-\\sqrt{2}\\)。' }
        ],
        tips: [
            '递推数列证明题的固定套路：先均值不等式“造下界”，再作差“定单调”，最后取极限“解方程”。',
            '遇到 \\(\\sum(x_n-x_{n+1})\\) 这类含相邻差的级数，直接想望远镜：部分和 \\(=x_1-x_{N+1}\\)。'
        ],
        mistakes: [
            '只证了 \\(x_n\\ge\\sqrt{2}\\) 就下结论“有下界故收敛”，漏证单调性（单调有界准则需要“单调 + 有界”两条件）。',
            '对递推式取极限时忽略 \\(L\\ne0\\) 的前提，导致 \\(2/L\\) 无意义或漏根。',
            '取极限解方程得到 \\(L^{2}=2\\) 后未舍去负根 \\(-\\sqrt{2}\\)。'
        ],
        source: { rank: 1, label: '真题', detail: '改编自 2020 年数学一第 19 题（数列极限证明 + 级数收敛）' },
        variants: [
            {
                id: 'm26v1', dimension: '综合计算',
                difficulty: 4,
                chapter: 'ch01', chapters: ['ch01'],
                kpIds: ['GS.1.3'], kpNames: ['单调有界准则'],
                question: '设 \\(x_1=1\\)，\\(x_{n+1}=\\sqrt{2+x_n}\\ (n\\ge1)\\)。证明 \\(\\{x_n\\}\\) 收敛并求其极限。',
                options: [],
                answer: '极限为 \\(2\\)。',
                concepts: [
                    { name: '数学归纳法证有界', note: '若 \\(1\\le x_n<2\\)，则 \\(1\\le\\sqrt{2}\\le\\sqrt{2+x_n}<2\\)，即 \\(1\\le x_{n+1}<2\\)。' },
                    { name: '作差有理化', note: '\\(\\sqrt{2+x_n}-x_n=\\dfrac{(2+x_n)-x_n^{2}}{\\sqrt{2+x_n}+x_n}=\\dfrac{-(x_n-2)(x_n+1)}{\\sqrt{2+x_n}+x_n}\\)。' },
                    { name: '单调有界准则', note: '单调递增且有上界的数列必收敛。' }
                ],
                solution: [
                    { step: 1, title: '归纳证明有界：\\(1\\le x_n<2\\)', content: '\\(x_1=1\\) 满足。若 \\(1\\le x_n<2\\)，则 \\(2+x_n\\in[3,4)\\)，开方得 \\(\\sqrt{3}\\le x_{n+1}<2\\)，显然仍有 \\(1\\le x_{n+1}<2\\)。故对一切 \\(n\\)，\\(1\\le x_n<2\\)，即 \\(\\{x_n\\}\\) 有上界 \\(2\\)。' },
                    { step: 2, title: '作差判单调（有理化）', content: '\\[x_{n+1}-x_n=\\sqrt{2+x_n}-x_n=\\dfrac{(2+x_n)-x_n^{2}}{\\sqrt{2+x_n}+x_n}=\\dfrac{-(x_n-2)(x_n+1)}{\\sqrt{2+x_n}+x_n}\\]<br>因 \\(1\\le x_n<2\\)，有 \\(x_n-2<0\\)、\\(x_n+1>0\\)、分母 \\(>0\\)，故分子 \\(>0\\)，从而 \\(x_{n+1}-x_n>0\\)，即 \\(\\{x_n\\}\\) 单调递增。' },
                    { step: 3, title: '由准则判定收敛', content: '\\(\\{x_n\\}\\) 单调递增且有上界 \\(2\\)，由单调有界准则收敛。设 \\(\\displaystyle\\lim_{n\\to\\infty}x_n=L\\)，则 \\(1\\le L\\le2\\)。' },
                    { step: 4, title: '取极限求 \\(L\\)', content: '在 \\(x_{n+1}=\\sqrt{2+x_n}\\) 两边令 \\(n\\to\\infty\\)：<br>\\[L=\\sqrt{2+L}\\]<br>两边平方：\\(L^{2}=2+L\\)，即 \\(L^{2}-L-2=0\\)，因式分解 \\((L-2)(L+1)=0\\)，得 \\(L=2\\)（舍去 \\(L=-1\\)）。' }
                ],
                tips: ['无理递推常见套路：归纳证有界（上界往往是极限值），有理化作差证单调，最后平方解方程。'],
                mistakes: ['平方去根号时忘记 \\(L\\ge0\\) 的限制，保留了不合理的负根。'],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：无理递推数列的单调有界证明（计算维度），考核点对标 2019 年数一第 19 题，难度相当' }
            },
            {
                id: 'm26v2', dimension: '综合创新',
                difficulty: 5,
                chapter: 'ch01', chapters: ['ch01', 'ch07'],
                kpIds: ['GS.7.1'], kpNames: ['常数项级数的敛散性'],
                question: '设 \\(a_n=\\left(1+\\dfrac{1}{n}\\right)^{n}\\)。<br>（I）证明 \\(\\{a_n\\}\\) 单调递增且有上界，从而收敛（记其极限为 \\(\\mathrm{e}\\)）；<br>（II）判断数项级数 \\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{a_n}\\) 的敛散性。',
                options: [],
                answer: '（I）证明见解析，\\(\\displaystyle\\lim_{n\\to\\infty}a_n=\\mathrm{e}\\)；（II）发散（因通项 \\(\\dfrac{1}{a_n}\\to\\dfrac{1}{\\mathrm{e}}\\ne0\\)，违反收敛的必要条件）。',
                concepts: [
                    { name: '二项式展开', note: '\\((1+u)^{n}=\\displaystyle\\sum_{k=0}^{n}\\mathrm{C}_n^{k}u^{k}\\)，\\(\\mathrm{C}_n^{k}=\\dfrac{n(n-1)\\cdots(n-k+1)}{k!}\\)。' },
                    { name: '单调有界准则', note: '单调递增且有上界的数列必收敛。' },
                    { name: '级数收敛的必要条件', note: '若 \\(\\displaystyle\\sum_{n=1}^{\\infty}b_n\\) 收敛，则必有 \\(\\displaystyle\\lim_{n\\to\\infty}b_n=0\\)；逆否命题用于判发散。' }
                ],
                solution: [
                    { step: 1, title: '把 \\(a_n\\) 用二项式展开改写', content: '\\[a_n=\\left(1+\\dfrac{1}{n}\\right)^{n}=\\sum_{k=0}^{n}\\mathrm{C}_n^{k}\\dfrac{1}{n^{k}}=\\sum_{k=0}^{n}\\dfrac{1}{k!}\\cdot\\dfrac{n(n-1)\\cdots(n-k+1)}{n^{k}}\\]<br>而 \\(\\dfrac{n(n-1)\\cdots(n-k+1)}{n^{k}}=\\prod_{j=0}^{k-1}\\dfrac{n-j}{n}=\\prod_{j=1}^{k-1}\\left(1-\\dfrac{j}{n}\\right)\\)（\\(j=0\\) 的因子为 1），故<br>\\[a_n=\\sum_{k=0}^{n}\\dfrac{1}{k!}\\prod_{j=1}^{k-1}\\left(1-\\dfrac{j}{n}\\right)\\]' },
                    { step: 2, title: '证单调递增', content: '\\(a_{n+1}\\) 的第 \\(k\\) 个加项含因子 \\(1-\\dfrac{j}{n+1}\\)，而 \\(a_n\\) 的第 \\(k\\) 个加项含因子 \\(1-\\dfrac{j}{n}\\)。因 \\(\\dfrac{j}{n+1}<\\dfrac{j}{n}\\)，故 \\(1-\\dfrac{j}{n+1}>1-\\dfrac{j}{n}\\ge0\\)，逐项比较得 \\(a_{n+1}\\) 的每一项不小于 \\(a_n\\) 的对应项；且 \\(a_{n+1}\\) 还多出正的末项 \\(k=n+1\\)。故 \\(a_{n+1}>a_n\\)，\\(\\{a_n\\}\\) 单调递增。' },
                    { step: 3, title: '证有上界', content: '因 \\(1-\\dfrac{j}{n}<1\\)，每个因子都小于 1，故 \\(a_n<\\displaystyle\\sum_{k=0}^{n}\\dfrac{1}{k!}\\)。又当 \\(k\\ge1\\) 时 \\(k!=1\\cdot2\\cdots k\\ge2^{k-1}\\)（如 \\(3!=6\\ge2^{2}=4\\)），所以<br>\\[a_n<\\sum_{k=0}^{n}\\dfrac{1}{k!}\\le1+\\sum_{k=1}^{\\infty}\\dfrac{1}{2^{k-1}}=1+\\dfrac{1}{1-\\dfrac{1}{2}}=1+2=3\\]<br>即 \\(\\{a_n\\}\\) 有上界 \\(3\\)。' },
                    { step: 4, title: '由准则得收敛及极限', content: '\\(\\{a_n\\}\\) 单调递增且有上界，由单调有界准则收敛；这个极限就是 \\(\\mathrm{e}\\)（\\(2<\\mathrm{e}<3\\)，与步骤 3 的上界一致）。即 \\(\\displaystyle\\lim_{n\\to\\infty}a_n=\\mathrm{e}\\)。' },
                    { step: 5, title: '判断级数敛散', content: '级数 \\(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{a_n}\\) 的通项 \\(\\dfrac{1}{a_n}\\to\\dfrac{1}{\\mathrm{e}}\\approx0.368\\ne0\\)。级数收敛的必要条件是通项趋于 0，此条件不满足，故级数发散。' }
                ],
                tips: ['判级数发散最快的一招：先看通项是否趋于 0。通项不趋 0（如此题 \\(\\to1/\\mathrm{e}\\)）直接判发散，无需比较判别。'],
                mistakes: [
                    '把“通项趋于 0”当成级数收敛的充分条件（它只是必要条件）。',
                    '证 \\((1+1/n)^n\\) 单调时只看首项，忽略了每一项的因子都在变大且多出末项。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：\\(\\mathrm{e}\\) 的单调有界证明 + 级数收敛必要条件判发散（综合创新维度），对标 2023 年数一证明题，难度略高' }
            }
        ]
    },

    /* ==================================================================
     * m27 · 高数/解答题 · 二重积分综合
     * 母题来源：改编自 2018 年数学一第 16 题（换序 + 极坐标 + 对称性）
     * ================================================================== */
    {
        id: 'm27',
        part: '高数',
        type: '解答题',
        score: 12,
        topic: '二重积分综合（交换次序 · 极坐标 · 对称性）',
        difficulty: 4,
        chapter: 'ch06',
        chapters: ['ch06'],
        chain: '画区域图 → 直接积不出就换序 → 圆域用极坐标 → 对称区域先剔奇项',
        kpIds: ['GS.6.2', 'GS.6.3'],
        kpNames: ['二重积分的计算（直角坐标）', '二重积分的计算（极坐标）'],
        predict: {
            heat: 5,
            trend: '二重积分换序是填空题常客，解答题常升级为极坐标+对称性综合',
            years: [2019, 2018, 2017, 2016],
            advice: '先画区域图；换序就是换扫描方向；对称区域先剔奇函数项'
        },
        question: '（I）将二重积分 \\(\\displaystyle I=\\int_0^1\\mathrm{d}x\\int_{x}^{1}\\mathrm{e}^{-y^{2}}\\,\\mathrm{d}y\\) 交换积分次序，并求出 \\(I\\) 的值；<br>（II）设 \\(D=\\{(x,y)\\mid x^{2}+y^{2}\\le 2x\\}\\)，利用对称性求 \\(\\displaystyle\\iint_D x\\,\\mathrm{d}x\\,\\mathrm{d}y\\)；<br>（III）计算 \\(\\displaystyle\\iint_{D_1}(x^{2}+y^{2})\\,\\mathrm{d}x\\,\\mathrm{d}y\\)，其中 \\(D_1=\\{(x,y)\\mid x^{2}+y^{2}\\le1,\\ x\\ge0,\\ y\\ge0\\}\\)。',
        options: [],
        answer: '（I）\\(I=\\dfrac{1}{2}\\left(1-\\dfrac{1}{\\mathrm{e}}\\right)\\)；<br>（II）\\(\\pi\\)；<br>（III）\\(\\dfrac{\\pi}{8}\\)。',
        concepts: [
            { name: '交换积分次序', note: '把“先 \\(y\\) 后 \\(x\\)”（\\(X\\) 型）改写为“先 \\(x\\) 后 \\(y\\)”（\\(Y\\) 型）：对固定 \\(y\\)，读出 \\(x\\) 的上下限。' },
            { name: '不可积函数的换序动机', note: '\\(\\mathrm{e}^{-y^{2}}\\)、\\(\\dfrac{\\sin y}{y}\\) 都无初等原函数，须换序后先对另一变量积分。' },
            { name: '对称性（奇函数剔除）', note: '若区域关于直线 \\(x=a\\) 对称，则 \\(\\displaystyle\\iint_D (x-a)\\,\\mathrm{d}x\\,\\mathrm{d}y=0\\)。' },
            { name: '形心公式', note: '\\(\\displaystyle\\iint_D x\\,\\mathrm{d}x\\,\\mathrm{d}y=\\bar{x}\\cdot|D|\\)，\\(\\bar{x}\\) 为形心的横坐标。' },
            { name: '极坐标变换', note: '\\(x=r\\cos\\theta,\\ y=r\\sin\\theta\\)，\\(x^{2}+y^{2}=r^{2}\\)，\\(\\mathrm{d}x\\,\\mathrm{d}y=r\\,\\mathrm{d}r\\,\\mathrm{d}\\theta\\)。' }
        ],
        solution: [
            { step: 1, title: '（I）画区域并写成不等式', content: '原积分区域 \\(D\\) 为：\\(0\\le x\\le1\\)，\\(x\\le y\\le1\\)。它是由 \\(y=x\\)、\\(y=1\\)、\\(x=0\\) 围成的三角形，顶点为 \\((0,0),(1,1),(0,1)\\)。' },
            { step: 2, title: '交换积分次序', content: '改按 \\(y\\) 扫描：\\(y\\in[0,1]\\)，对固定 \\(y\\)，\\(x\\) 从 0 到 \\(y\\)。故<br>\\[I=\\int_0^1\\mathrm{d}y\\int_0^{y}\\mathrm{e}^{-y^{2}}\\,\\mathrm{d}x\\]' },
            { step: 3, title: '先对 \\(x\\) 积分', content: '\\(\\mathrm{e}^{-y^{2}}\\) 与 \\(x\\) 无关，是常数：<br>\\[\\int_0^{y}\\mathrm{e}^{-y^{2}}\\,\\mathrm{d}x=\\mathrm{e}^{-y^{2}}\\cdot(y-0)=y\\,\\mathrm{e}^{-y^{2}}\\]' },
            { step: 4, title: '再对 \\(y\\) 积分（换元）', content: '令 \\(u=y^{2}\\)，则 \\(\\mathrm{d}u=2y\\,\\mathrm{d}y\\)，即 \\(y\\,\\mathrm{d}y=\\dfrac{1}{2}\\mathrm{d}u\\)，且 \\(y:0\\to1\\) 对应 \\(u:0\\to1\\)：<br>\\[I=\\int_0^1 y\\,\\mathrm{e}^{-y^{2}}\\,\\mathrm{d}y=\\dfrac{1}{2}\\int_0^{1}\\mathrm{e}^{-u}\\,\\mathrm{d}u=\\dfrac{1}{2}\\big[-\\mathrm{e}^{-u}\\big]_0^{1}=\\dfrac{1}{2}(1-\\mathrm{e}^{-1})\\]' },
            { step: 5, title: '（II）利用对称性', content: '\\(D\\) 即 \\((x-1)^{2}+y^{2}\\le1\\)，是以 \\((1,0)\\) 为圆心、半径 1 的圆盘，关于直线 \\(x=1\\) 对称。对区域中每一点 \\((x,y)\\)，点 \\((2-x,y)\\) 也在 \\(D\\) 中，且两点处 \\((x-1)\\) 与 \\((2-x)-1=-(x-1)\\) 互为相反数，故<br>\\[\\iint_D (x-1)\\,\\mathrm{d}x\\,\\mathrm{d}y=0\\]' },
            { step: 6, title: '（II）分离出面积', content: '\\[\\iint_D x\\,\\mathrm{d}x\\,\\mathrm{d}y=\\iint_D (x-1)\\,\\mathrm{d}x\\,\\mathrm{d}y+\\iint_D 1\\,\\mathrm{d}x\\,\\mathrm{d}y=0+|D|\\]<br>而 \\(D\\) 是半径为 1 的圆盘，\\(|D|=\\pi\\cdot1^{2}=\\pi\\)，故 \\(\\displaystyle\\iint_D x\\,\\mathrm{d}x\\,\\mathrm{d}y=\\pi\\)。' },
            { step: 7, title: '（III）极坐标计算', content: '\\(D_1\\) 为第一象限内的单位扇形（四分之一圆）：\\(0\\le\\theta\\le\\dfrac{\\pi}{2}\\)，\\(0\\le r\\le1\\)，且 \\(x^{2}+y^{2}=r^{2}\\)，\\(\\mathrm{d}x\\,\\mathrm{d}y=r\\,\\mathrm{d}r\\,\\mathrm{d}\\theta\\)：<br>\\[\\iint_{D_1}(x^{2}+y^{2})\\,\\mathrm{d}x\\,\\mathrm{d}y=\\int_0^{\\pi/2}\\mathrm{d}\\theta\\int_0^{1}r^{2}\\cdot r\\,\\mathrm{d}r=\\dfrac{\\pi}{2}\\cdot\\left[\\dfrac{r^{4}}{4}\\right]_0^{1}=\\dfrac{\\pi}{2}\\cdot\\dfrac{1}{4}=\\dfrac{\\pi}{8}\\]' }
        ],
        tips: [
            '画图定序号：把区域图画出，横着扫是 \\(X\\) 型、竖着扫是 \\(Y\\) 型，“换序”就是换扫描方向、重读上下限。',
            '圆域（或圆的一部分）优先极坐标；区域关于某直线对称时，先把 \\((x-a)\\) 这类奇项剔除，只剩面积，能省一大半计算。'
        ],
        mistakes: [
            '换序时把上下限照抄成 \\(0\\) 到 \\(y\\) 的反向（应对固定 \\(y\\) 重新读图，而不是机械对调数字）。',
            '极坐标下漏乘雅可比因子 \\(r\\)，把 \\(\\mathrm{d}x\\,\\mathrm{d}y\\) 直接当 \\(\\mathrm{d}r\\,\\mathrm{d}\\theta\\)。',
            '对 \\(\\mathrm{e}^{-y^{2}}\\) 硬找原函数（它没有初等原函数），忘了换序是为了先对 \\(x\\) 积分。'
        ],
        source: { rank: 1, label: '真题', detail: '改编自 2018 年数学一第 16 题（二重积分换序与极坐标）' },
        variants: [
            {
                id: 'm27v1', dimension: '综合计算',
                difficulty: 4,
                chapter: 'ch06', chapters: ['ch06'],
                kpIds: ['GS.6.2'], kpNames: ['二重积分的计算（直角坐标）'],
                question: '计算 \\(\\displaystyle\\int_0^1\\mathrm{d}x\\int_{x}^{1}\\dfrac{\\sin y}{y}\\,\\mathrm{d}y\\)。',
                options: [],
                answer: '\\(1-\\cos 1\\)。',
                concepts: [
                    { name: '交换积分次序', note: '\\(\\dfrac{\\sin y}{y}\\) 无初等原函数，须换序先对 \\(x\\) 积分。' },
                    { name: '区域描述', note: '原区域为 \\(0\\le x\\le1,\\ x\\le y\\le1\\)；换序后 \\(0\\le y\\le1,\\ 0\\le x\\le y\\)。' }
                ],
                solution: [
                    { step: 1, title: '画区域', content: '区域由 \\(y=x\\)、\\(y=1\\)、\\(x=0\\) 围成，顶点 \\((0,0),(1,1),(0,1)\\)。' },
                    { step: 2, title: '换序', content: '\\[\\int_0^1\\mathrm{d}x\\int_{x}^{1}\\dfrac{\\sin y}{y}\\,\\mathrm{d}y=\\int_0^1\\mathrm{d}y\\int_0^{y}\\dfrac{\\sin y}{y}\\,\\mathrm{d}x\\]' },
                    { step: 3, title: '先对 \\(x\\) 积分', content: '\\(\\dfrac{\\sin y}{y}\\) 与 \\(x\\) 无关：\\(\\displaystyle\\int_0^{y}\\dfrac{\\sin y}{y}\\,\\mathrm{d}x=\\dfrac{\\sin y}{y}\\cdot y=\\sin y\\)。' },
                    { step: 4, title: '再对 \\(y\\) 积分', content: '\\[\\int_0^1\\sin y\\,\\mathrm{d}y=\\big[-\\cos y\\big]_0^{1}=1-\\cos 1\\]' }
                ],
                tips: ['凡被积函数形如 \\(\\dfrac{\\sin y}{y}\\)、\\(\\mathrm{e}^{-y^{2}}\\)、\\(\\dfrac{1}{\\ln y}\\)，都提示“本题必须换序”。'],
                mistakes: ['换序后忘了内层积分的上下限要写成 \\(0\\) 到 \\(y\\)，误写成 \\(0\\) 到 1，导致结果错。'],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：不可直接积出的 \\(\\dfrac{\\sin y}{y}\\) 通过换序处理（综合计算维度），考核点对标 2017 年数一填空题，难度相当' }
            },
            {
                id: 'm27v2', dimension: '综合创新',
                difficulty: 5,
                chapter: 'ch06', chapters: ['ch06'],
                kpIds: ['GS.6.3'], kpNames: ['二重积分的计算（极坐标）'],
                question: '计算 \\(\\displaystyle\\iint_D (x^{2}+y^{2})\\,\\mathrm{d}x\\,\\mathrm{d}y\\)，其中 \\(D=\\{(x,y)\\mid x^{2}+y^{2}\\le 2x\\}\\)。',
                options: [],
                answer: '\\(\\dfrac{3\\pi}{2}\\)。',
                concepts: [
                    { name: '圆的极坐标化', note: '\\(x^{2}+y^{2}=2x\\) 在极坐标下为 \\(r^{2}=2r\\cos\\theta\\)，即 \\(r=2\\cos\\theta\\)；由 \\(r\\ge0\\) 得 \\(\\theta\\in\\left[-\\dfrac{\\pi}{2},\\dfrac{\\pi}{2}\\right]\\)。' },
                    { name: '极坐标面积元', note: '\\(\\mathrm{d}x\\,\\mathrm{d}y=r\\,\\mathrm{d}r\\,\\mathrm{d}\\theta\\)，被积函数 \\(x^{2}+y^{2}=r^{2}\\)。' },
                    { name: '偶函数在对称区间的积分（华里士公式）', note: '\\(\\displaystyle\\int_0^{\\pi/2}\\cos^{4}\\theta\\,\\mathrm{d}\\theta=\\dfrac{3}{4}\\cdot\\dfrac{1}{2}\\cdot\\dfrac{\\pi}{2}=\\dfrac{3\\pi}{16}\\)。' }
                ],
                solution: [
                    { step: 1, title: '化为极坐标区域', content: '\\(x^{2}+y^{2}\\le2x\\iff r^{2}\\le2r\\cos\\theta\\iff r\\le2\\cos\\theta\\)（\\(r\\ge0\\)），\\(\\theta\\in\\left[-\\dfrac{\\pi}{2},\\dfrac{\\pi}{2}\\right]\\)。' },
                    { step: 2, title: '写出极坐标累次积分', content: '\\[\\iint_D(x^{2}+y^{2})\\,\\mathrm{d}x\\,\\mathrm{d}y=\\int_{-\\pi/2}^{\\pi/2}\\mathrm{d}\\theta\\int_0^{2\\cos\\theta}r^{2}\\cdot r\\,\\mathrm{d}r\\]' },
                    { step: 3, title: '对 \\(r\\) 积分', content: '\\[\\int_0^{2\\cos\\theta}r^{3}\\,\\mathrm{d}r=\\dfrac{(2\\cos\\theta)^{4}}{4}=\\dfrac{16\\cos^{4}\\theta}{4}=4\\cos^{4}\\theta\\]' },
                    { step: 4, title: '对 \\(\\theta\\) 积分（用偶函数性）', content: '\\(4\\cos^{4}\\theta\\) 是偶函数，故<br>\\[\\int_{-\\pi/2}^{\\pi/2}4\\cos^{4}\\theta\\,\\mathrm{d}\\theta=2\\int_0^{\\pi/2}4\\cos^{4}\\theta\\,\\mathrm{d}\\theta=8\\cdot\\dfrac{3\\pi}{16}=\\dfrac{3\\pi}{2}\\]<br>其中用华里士公式 \\(\\displaystyle\\int_0^{\\pi/2}\\cos^{4}\\theta\\,\\mathrm{d}\\theta=\\dfrac{3}{4}\\cdot\\dfrac{1}{2}\\cdot\\dfrac{\\pi}{2}=\\dfrac{3\\pi}{16}\\)。' }
                ],
                tips: ['圆 \\(x^{2}+y^{2}=2ax\\) 极坐标直接得 \\(r=2a\\cos\\theta\\)；\\(x^{2}+y^{2}=2ay\\) 则得 \\(r=2a\\sin\\theta\\)，记牢可省去推导。'],
                mistakes: ['把 \\(\\theta\\) 的取值范围写成 \\([0,2\\pi]\\)，忽略了 \\(r=2\\cos\\theta\\ge0\\) 只在 \\(\\left[-\\dfrac{\\pi}{2},\\dfrac{\\pi}{2}\\right]\\) 成立（否则会多算）。'],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：极坐标 + 偶函数对称性 + 华里士公式综合（综合创新维度），考核点对标 2019 年数一第 17 题，难度略高' }
            }
        ]
    },

    /* ==================================================================
     * m28 · 高数/解答题 · 多元微分综合
     * 母题来源：改编自 2019 年数学一第 18 题（多元微分 + 几何应用）
     * ================================================================== */
    {
        id: 'm28',
        part: '高数',
        type: '解答题',
        score: 12,
        topic: '多元微分综合（切平面法线 · 方向导数与梯度 · 有界闭域最值）',
        difficulty: 4,
        chapter: 'ch05',
        chapters: ['ch05'],
        chain: '曲面梯度求法向量 → 切平面/法线 → 方向导数=梯度点乘单位向量 → 有界闭域最值=内部驻点+边界',
        kpIds: ['GS.5.2', 'GS.5.3', 'GS.5.5'],
        kpNames: ['方向导数与梯度', '空间曲面的切平面与法线', '多元函数的极值与最值'],
        predict: {
            heat: 5,
            trend: '多元极值几乎年年一道大题，2024/2026 走的是「多元微分 + 几何应用」的复合路线',
            years: [2026, 2024, 2023, 2021, 2019, 2017],
            advice: '有约束用拉格朗日乘数法；有界闭区域最值必须比较「内部驻点 + 边界」'
        },
        question: '设曲面 \\(\\Sigma\\) 为 \\(z=x^{2}+2y^{2}\\)，函数 \\(f(x,y)=x^{2}+2y^{2}\\)。<br>（I）求曲面 \\(\\Sigma\\) 在点 \\(P(1,1,3)\\) 处的切平面方程与法线方程；<br>（II）求 \\(f\\) 在点 \\(M(1,1)\\) 处沿方向 \\(\\vec{l}=\\dfrac{1}{\\sqrt{2}}(1,1)\\) 的方向导数，并求 \\(f\\) 在 \\(M(1,1)\\) 处方向导数的最大值及取得最大值的方向；<br>（III）求 \\(f(x,y)\\) 在闭区域 \\(D=\\{(x,y)\\mid x^{2}+y^{2}\\le1\\}\\) 上的最大值与最小值。',
        options: [],
        answer: '（I）切平面 \\(2x+4y-z=3\\)，法线 \\(\\dfrac{x-1}{2}=\\dfrac{y-1}{4}=\\dfrac{z-3}{-1}\\)；<br>（II）沿 \\(\\vec{l}\\) 的方向导数为 \\(3\\sqrt{2}\\)，最大方向导数为 \\(2\\sqrt{5}\\)，取得最大值的方向为 \\(\\dfrac{1}{\\sqrt{5}}(1,2)\\)；<br>（III）最小值 \\(0\\)（在 \\((0,0)\\) 取得），最大值 \\(2\\)（在 \\((0,\\pm1)\\) 取得）。',
        concepts: [
            { name: '曲面 \\(F(x,y,z)=0\\) 的法向量', note: '法向量为梯度 \\(\\nabla F=(F_x,F_y,F_z)\\)，在点 \\(P\\) 处代入即得该点法向量。' },
            { name: '切平面与法线', note: '过 \\(P(x_0,y_0,z_0)\\)、法向量 \\((A,B,C)\\)：切平面 \\(A(x-x_0)+B(y-y_0)+C(z-z_0)=0\\)；法线 \\(\\dfrac{x-x_0}{A}=\\dfrac{y-y_0}{B}=\\dfrac{z-z_0}{C}\\)。' },
            { name: '方向导数', note: '\\(\\dfrac{\\partial f}{\\partial \\vec{l}}=\\nabla f\\cdot\\vec{e}_l=f_x\\cos\\alpha+f_y\\cos\\beta\\)，\\(\\vec{e}_l\\) 为与 \\(\\vec{l}\\) 同向的单位向量。' },
            { name: '梯度与最大方向导数', note: '\\(\\dfrac{\\partial f}{\\partial \\vec{l}}\\) 的最大值 \\(=|\\nabla f|\\)，且当 \\(\\vec{e}_l\\) 与 \\(\\nabla f\\) 同向时取得。' },
            { name: '有界闭域最值求法', note: '先求区域内部的驻点（\\(f_x=f_y=0\\)），再求函数在边界上的最值，最后把所有候选值比较取最大、最小。' }
        ],
        solution: [
            { step: 1, title: '（I）设辅助函数求法向量', content: '令 \\(F(x,y,z)=x^{2}+2y^{2}-z\\)，则 \\(\\Sigma:F=0\\)。偏导：\\(F_x=2x,\\ F_y=4y,\\ F_z=-1\\)。在 \\(P(1,1,3)\\) 处代入得法向量<br>\\[\\nabla F\\big|_P=(2,\\ 4,\\ -1)\\]' },
            { step: 2, title: '（I）写切平面方程', content: '以 \\((2,4,-1)\\) 为法向量、过 \\(P(1,1,3)\\)：<br>\\[2(x-1)+4(y-1)-1\\cdot(z-3)=0\\]<br>展开：\\(2x-2+4y-4-z+3=0\\)，即 \\(2x+4y-z-3=0\\)，也就是 \\(2x+4y-z=3\\)。代回 \\(P\\)：\\(2+4-3=3\\) 成立。' },
            { step: 3, title: '（I）写法线方程', content: '\\[\\dfrac{x-1}{2}=\\dfrac{y-1}{4}=\\dfrac{z-3}{-1}\\]' },
            { step: 4, title: '（II）求梯度与单位方向向量', content: '\\(f_x=2x,\\ f_y=4y\\)，在 \\(M(1,1)\\) 处 \\(\\nabla f\\big|_M=(2,\\ 4)\\)。<br>与 \\(\\vec{l}=(1,1)\\) 同向的单位向量为 \\(\\vec{e}_l=\\dfrac{1}{\\sqrt{2}}(1,1)=\\left(\\dfrac{1}{\\sqrt{2}},\\dfrac{1}{\\sqrt{2}}\\right)\\)。' },
            { step: 5, title: '（II）计算方向导数', content: '\\[\\dfrac{\\partial f}{\\partial \\vec{l}}=\\nabla f\\cdot\\vec{e}_l=2\\cdot\\dfrac{1}{\\sqrt{2}}+4\\cdot\\dfrac{1}{\\sqrt{2}}=\\dfrac{6}{\\sqrt{2}}=3\\sqrt{2}\\]' },
            { step: 6, title: '（II）求最大方向导数及方向', content: '最大方向导数为<br>\\[|\\nabla f\\big|_M|=\\sqrt{2^{2}+4^{2}}=\\sqrt{20}=2\\sqrt{5}\\]<br>取得最大值的方向为梯度方向 \\(\\dfrac{\\nabla f}{|\\nabla f|}=\\dfrac{1}{2\\sqrt{5}}(2,4)=\\dfrac{1}{\\sqrt{5}}(1,2)\\)。' },
            { step: 7, title: '（III）内部驻点', content: '令 \\(f_x=2x=0,\\ f_y=4y=0\\)，解得唯一驻点 \\((0,0)\\)，此点在 \\(D\\) 内部，\\(f(0,0)=0\\)。' },
            { step: 8, title: '（III）边界上的最值', content: '边界 \\(x^{2}+y^{2}=1\\) 上，\\(y^{2}=1-x^{2}\\)，代入：<br>\\[f=x^{2}+2y^{2}=x^{2}+2(1-x^{2})=2-x^{2},\\quad x\\in[-1,1]\\]<br>它在 \\(x^{2}=1\\) 时取最小 \\(2-1=1\\)（点 \\((\\pm1,0)\\)），在 \\(x=0\\) 时取最大 \\(2-0=2\\)（点 \\((0,\\pm1)\\)）。' },
            { step: 9, title: '（III）比较得最值', content: '候选值为：内部 \\(f=0\\)；边界最小 \\(1\\)、最大 \\(2\\)。故<br>\\[\\min_{D}f=0\\ (\\text{在}(0,0)\\text{取得}),\\qquad \\max_{D}f=2\\ (\\text{在}(0,\\pm1)\\text{取得})\\]' }
        ],
        tips: [
            '方向导数先化单位方向向量再点乘梯度；问“最大方向导数”，答案就是 \\(|\\nabla f|\\)，方向就是梯度方向。',
            '有界闭域求最值别忘“两步走”：内部驻点 + 边界最值，全部候选值放一起比大小。'
        ],
        mistakes: [
            '用 \\(\\vec{l}=(1,1)\\) 直接点乘梯度，忘记先单位化（导致结果多乘了 \\(\\sqrt{2}\\)）。',
            '求闭域最值时只算了内部驻点 \\((0,0)\\)（得 0），漏掉边界，误把 0 当最小值结论仍对但漏掉最大值 2。',
            '写切平面时把 \\(F_z=-1\\) 丢掉，法向量写成 \\((2,4,0)\\) 或不带负号，导致法线方向错。'
        ],
        source: { rank: 1, label: '真题', detail: '改编自 2019 年数学一第 18 题（多元函数切平面、方向导数与最值）' },
        variants: [
            {
                id: 'm28v1', dimension: '综合计算',
                difficulty: 4,
                chapter: 'ch05', chapters: ['ch05'],
                kpIds: ['GS.5.5'], kpNames: ['条件极值'],
                question: '求函数 \\(f(x,y)=x+2y\\) 在约束条件 \\(x^{2}+y^{2}=5\\) 下的最大值与最小值。',
                options: [],
                answer: '最大值 \\(5\\)（在 \\((1,2)\\) 取得），最小值 \\(-5\\)（在 \\((-1,-2)\\) 取得）。',
                concepts: [
                    { name: '拉格朗日乘数法', note: '求 \\(f\\) 在约束 \\(\\varphi=0\\) 下的极值，构造 \\(L=f+\\lambda\\varphi\\)，令 \\(L_x=L_y=L_{\\lambda}=0\\)。' },
                    { name: '有界闭曲线上的连续函数', note: '\\(x^{2}+y^{2}=5\\) 是封闭有界曲线，连续函数必取到最大值与最小值。' }
                ],
                solution: [
                    { step: 1, title: '构造拉格朗日函数并列方程', content: '令 \\(L(x,y,\\lambda)=x+2y+\\lambda(x^{2}+y^{2}-5)\\)，令各偏导为零：<br>\\[\\dfrac{\\partial L}{\\partial x}=1+2\\lambda x=0,\\quad\\dfrac{\\partial L}{\\partial y}=2+2\\lambda y=0,\\quad\\dfrac{\\partial L}{\\partial \\lambda}=x^{2}+y^{2}-5=0\\]' },
                    { step: 2, title: '消去 \\(\\lambda\\) 求关系', content: '由前两式得 \\(2\\lambda x=-1\\)、\\(2\\lambda y=-2\\)，两式相除：\\(\\dfrac{x}{y}=\\dfrac{1}{2}\\)，即 \\(y=2x\\)。' },
                    { step: 3, title: '代入约束求驻点', content: '\\[x^{2}+(2x)^{2}=5\\Rightarrow5x^{2}=5\\Rightarrow x=\\pm1\\]<br>对应 \\(y=\\pm2\\)，得两点 \\((1,2)\\)、\\((-1,-2)\\)。' },
                    { step: 4, title: '比较函数值', content: '\\(f(1,2)=1+4=5\\)，\\(f(-1,-2)=-1-4=-5\\)。故最大值为 \\(5\\)，最小值为 \\(-5\\)。' }
                ],
                tips: ['拉格朗日方程组消 \\(\\lambda\\) 时把 \\(\\lambda\\) 解出再相除、相乘，可快速得到坐标之间的比例关系。'],
                mistakes: ['由 \\(2\\lambda x=-1\\)、\\(2\\lambda y=-2\\) 直接令 \\(\\lambda=0\\) 求解（\\(\\lambda=0\\) 与方程矛盾）。'],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：拉格朗日乘数法求条件极值（综合计算维度），考核点对标 2017 年数一第 18 题，难度相当' }
            },
            {
                id: 'm28v2', dimension: '综合创新',
                difficulty: 5,
                chapter: 'ch05', chapters: ['ch05'],
                kpIds: ['GS.5.5'], kpNames: ['有界闭域上的最值'],
                question: '求函数 \\(u=x^{2}+2y^{2}-2x-4y\\) 在闭区域 \\(D=\\{x\\ge0,\\ y\\ge0,\\ x+y\\le3\\}\\) 上的最大值与最小值。',
                options: [],
                answer: '最大值 \\(6\\)（在点 \\((0,3)\\) 取得），最小值 \\(-3\\)（在点 \\((1,1)\\) 取得）。',
                concepts: [
                    { name: '有界闭域最值（两步法）', note: '求区域内部驻点，再求函数在每条边界上的最值，全部候选值比较取最大、最小。' },
                    { name: '二次函数的配方', note: '\\(u=x^{2}-2x+2y^{2}-4y=(x-1)^{2}+2(y-1)^{2}-3\\)，配方式便于观察内部极值。' }
                ],
                solution: [
                    { step: 1, title: '内部驻点', content: '\\(u_x=2x-2,\\ u_y=4y-4\\)，令其为 0 得 \\(x=1,\\ y=1\\)。点 \\((1,1)\\) 满足 \\(x\\ge0,y\\ge0,x+y=2\\le3\\)，位于区域内。<br>配方：\\(u=(x-1)^{2}+2(y-1)^{2}-3\\)，故 \\(u(1,1)=-3\\)。' },
                    { step: 2, title: '边界一：\\(x=0,\\ 0\\le y\\le3\\)', content: '\\(u=2y^{2}-4y=2(y-1)^{2}-2\\)，在 \\(y=1\\) 取最小 \\(-2\\)，在 \\(y=3\\) 取最大 \\(18-12=6\\)。' },
                    { step: 3, title: '边界二：\\(y=0,\\ 0\\le x\\le3\\)', content: '\\(u=x^{2}-2x=(x-1)^{2}-1\\)，在 \\(x=1\\) 取最小 \\(-1\\)，在 \\(x=3\\) 取最大 \\(9-6=3\\)。' },
                    { step: 4, title: '边界三：\\(x+y=3,\\ x,y\\ge0\\)', content: '令 \\(y=3-x\\)（\\(0\\le x\\le3\\)），代入：<br>\\[u=x^{2}+2(3-x)^{2}-2x-4(3-x)=x^{2}+2(9-6x+x^{2})-2x-12+4x=3x^{2}-10x+6\\]<br>这是开口向上的抛物线，顶点 \\(x=\\dfrac{10}{2\\times3}=\\dfrac{5}{3}\\) 处取最小值<br>\\[u\\left(\\dfrac{5}{3}\\right)=3\\cdot\\dfrac{25}{9}-10\\cdot\\dfrac{5}{3}+6=\\dfrac{25}{3}-\\dfrac{50}{3}+6=-\\dfrac{25}{3}+\\dfrac{18}{3}=-\\dfrac{7}{3}\\]<br>端点：\\(u(0)=6\\)（即点 \\((0,3)\\)），\\(u(3)=27-30+6=3\\)（即点 \\((3,0)\\)）。' },
                    { step: 5, title: '汇总比较', content: '所有候选值：内部 \\(-3\\)；边界上出现 \\(-2,6,-1,3,-\\dfrac{7}{3},6\\)。最大值为 \\(6\\)（点 \\((0,3)\\)），最小值为 \\(-3\\)（点 \\((1,1)\\)）。' }
                ],
                tips: ['配方式 \\((x-a)^{2}+\\cdots\\) 能一眼看出内部取极值的位置与符号；含 \\(x+y=3\\) 这类斜边界时，代入消元化为一元二次函数最省事。'],
                mistakes: [
                    '只在边界上找最值，漏掉内部驻点 \\((1,1)\\)（它恰是最小值点）。',
                    '把线性边界的最值只算在顶点（应同时看抛物线顶点 \\(x=5/3\\)）。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：有界闭域上的最值（内部驻点 + 三条边界），考核点对标 2024 年数一多元极值大题，难度略高' }
            }
        ]
    }

);
