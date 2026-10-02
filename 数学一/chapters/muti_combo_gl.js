/**
 * 考研数学一 ·「母题 22 炼」· 综合母题（概率论与数理统计）
 * 跨章节大题级综合训练，2027 命题预测视角
 */
window.MUTI_COMBO = window.MUTI_COMBO || { meta: { title: '综合母题 12 炼', updatedAt: '2026-09-13' }, combos: [] };
window.MUTI_COMBO.combos.push(
    /* ==================================================================
     * m32 · 综合母题 · 概率/解答题 · 参数估计综合（矩估计 · 最大似然 · 无偏性）
     * 综合来源：均匀分布最大似然（2016 型）+ 无偏估计（2024 型）
     * ================================================================== */
    {
        id: 'm32',
        part: '概率',
        type: '解答题',
        score: 12,
        topic: '参数估计综合（矩估计 · 最大似然 · 无偏性）',
        difficulty: 4,
        chapter: 'ch20',
        chapters: ['ch20'],
        chain: '一阶矩/二阶矩 → 矩估计 → 似然函数 → 最大似然估计 → 无偏性与方差',
        kpIds: ['GL.20.1'],
        kpNames: ['矩估计', '最大似然估计', '无偏估计'],
        predict: {
            heat: 5,
            trend: '参数估计是概率大题的第一大户：2016-2020 连续五年、2023/2024/2026 均出现，几乎年年必考',
            years: [2026, 2024, 2023, 2020, 2019, 2018, 2017, 2016],
            advice: '矩估计就是「令样本矩=总体矩」解方程；最大似然先写似然函数再取对数求导，注意参数取值范围对分段点的限制'
        },
        question: '设总体 \\(X\\) 的概率密度为 \\[f(x;\\theta)=\\begin{cases}\\dfrac{1}{\\theta},&0<x<\\theta\\\\0,&\\text{其他}\\end{cases}\\] 其中 \\(\\theta>0\\) 为未知参数，\\(X_1,X_2,\\cdots,X_n\\) 是来自总体 \\(X\\) 的简单随机样本。<br>（I）求 \\(\\theta\\) 的矩估计量 \\(\\hat{\\theta}_1\\)，并判断它是否为 \\(\\theta\\) 的无偏估计；<br>（II）求 \\(\\theta\\) 的最大似然估计量 \\(\\hat{\\theta}_2\\)；<br>（III）判断 \\(\\hat{\\theta}_2\\) 的无偏性；若有偏，求常数 \\(c\\) 使 \\(c\\hat{\\theta}_2\\) 为 \\(\\theta\\) 的无偏估计，并求 \\(D(\\hat{\\theta}_1)\\)。',
        options: [],
        answer: '（I）\\(\\hat{\\theta}_1=2\\bar{X}\\)，是 \\(\\theta\\) 的无偏估计；（II）\\(\\hat{\\theta}_2=\\max\\{X_1,\\cdots,X_n\\}=X_{(n)}\\)；（III）\\(\\hat{\\theta}_2\\) 有偏，\\(c=\\dfrac{n+1}{n}\\)，\\(D(\\hat{\\theta}_1)=\\dfrac{\\theta^2}{3n}\\)。',
        concepts: [
            { name: '矩估计法', note: '令样本 \\(k\\) 阶原点矩等于总体 \\(k\\) 阶原点矩：\\(\\dfrac{1}{n}\\sum_{i=1}^n X_i^k=E(X^k)\\)，解出未知参数。' },
            { name: '均匀分布 \\(U(0,\\theta)\\) 的数字特征', note: '\\(E(X)=\\dfrac{\\theta}{2}\\)，\\(E(X^2)=\\dfrac{\\theta^2}{3}\\)，\\(D(X)=\\dfrac{\\theta^2}{12}\\)。' },
            { name: '最大似然估计', note: '似然函数 \\(L(\\theta)=\\prod_{i=1}^n f(x_i;\\theta)\\)，在 \\(\\theta\\) 的允许范围内取最大。若 \\(L\\) 关于 \\(\\theta\\) 单调，则最优值取在支撑边界（不能盲目求导）。' },
            { name: '最大值 \\(X_{(n)}\\) 的分布', note: '记 \\(M=X_{(n)}\\)，则 \\(F_M(t)=[F(t)]^n\\)，密度 \\(f_M(t)=n[F(t)]^{n-1}f(t)\\)。' }
        ],
        solution: [
            { step: 1, title: '求总体一阶矩', content: '均匀分布 \\(U(0,\\theta)\\) 的密度在 \\((0,\\theta)\\) 上恒为 \\(\\dfrac{1}{\\theta}\\)，故<br>\\[E(X)=\\int_0^{\\theta}x\\cdot\\dfrac{1}{\\theta}\\,\\mathrm{d}x=\\dfrac{1}{\\theta}\\cdot\\dfrac{x^2}{2}\\Big|_0^{\\theta}=\\dfrac{1}{\\theta}\\cdot\\dfrac{\\theta^2}{2}=\\dfrac{\\theta}{2}.\\]' },
            { step: 2, title: '列矩法方程求矩估计量', content: '令样本一阶矩（样本均值）等于总体一阶矩：<br>\\(\\bar{X}=\\dfrac{\\theta}{2}\\ \\Rightarrow\\ \\hat{\\theta}_1=2\\bar{X}\\)。' },
            { step: 3, title: '判断 \\(\\hat{\\theta}_1\\) 的无偏性', content: '\\(E(\\hat{\\theta}_1)=E(2\\bar{X})=2E(\\bar{X})=2\\cdot\\dfrac{1}{n}\\sum_{i=1}^n E(X_i)=2\\cdot\\dfrac{1}{n}\\cdot n\\cdot\\dfrac{\\theta}{2}=\\theta\\)，故 \\(\\hat{\\theta}_1\\) 是 \\(\\theta\\) 的无偏估计。' },
            { step: 4, title: '写似然函数（注意支撑）', content: '似然函数为<br>\\[L(\\theta)=\\prod_{i=1}^n\\dfrac{1}{\\theta}=\\theta^{-n},\\quad \\theta>\\max\\{x_1,\\cdots,x_n\\}.\\] 关键：只有当 \\(\\theta\\) 大于所有观测值时 \\(L\\) 才非零，即 \\(\\theta\\) 的允许范围是 \\(\\theta>\\max_i x_i\\)（此即分段支撑对参数的约束）。' },
            { step: 5, title: '求最大似然估计量（边界取极值）', content: '在范围 \\(\\theta>\\max_i x_i\\) 上，\\(L(\\theta)=\\theta^{-n}\\)，其导数 \\(\\dfrac{\\mathrm{d}L}{\\mathrm{d}\\theta}=-n\\theta^{-n-1}<0\\)，故 \\(L\\) 关于 \\(\\theta\\) 严格单调递减，在允许范围的最小端点取得最大：<br>\\[\\hat{\\theta}_2=\\max\\{X_1,\\cdots,X_n\\}=X_{(n)}.\\] 注：若盲目对 \\(\\ln L=-n\\ln\\theta\\) 求导得 \\(-\\dfrac{n}{\\theta}=0\\) 无解，正说明极值在边界，必须直接比较端点。' },
            { step: 6, title: '求 \\(X_{(n)}\\) 的分布', content: '记 \\(M=X_{(n)}\\)。对 \\(0<t<\\theta\\)：样本各值不超过 \\(t\\) 等价于 \\(M\\le t\\)，由独立性<br>\\[F_M(t)=P(M\\le t)=P(X_1\\le t,\\cdots,X_n\\le t)=\\prod_{i=1}^n P(X_i\\le t)=\\left(\\dfrac{t}{\\theta}\\right)^n.\\] 对 \\(t\\) 求导得密度 \\(f_M(t)=F_M\'(t)=\\dfrac{n\\,t^{\\,n-1}}{\\theta^{\\,n}}\\)（\\(0<t<\\theta\\)），其余为 0。' },
            { step: 7, title: '判断 \\(\\hat{\\theta}_2\\) 无偏性并求修正系数 \\(c\\)', content: '\\[E(M)=\\int_0^{\\theta}t\\cdot\\dfrac{n\\,t^{\\,n-1}}{\\theta^{\\,n}}\\,\\mathrm{d}t=\\dfrac{n}{\\theta^{\\,n}}\\int_0^{\\theta}t^{\\,n}\\,\\mathrm{d}t=\\dfrac{n}{\\theta^{\\,n}}\\cdot\\dfrac{\\theta^{\\,n+1}}{n+1}=\\dfrac{n\\theta}{n+1}.\\] 因 \\(\\dfrac{n\\theta}{n+1}\\ne\\theta\\)，故 \\(\\hat{\\theta}_2\\) 是 \\(\\theta\\) 的有偏估计。令 \\(E(c\\hat{\\theta}_2)=c\\cdot\\dfrac{n\\theta}{n+1}=\\theta\\)，解得 \\(c=\\dfrac{n+1}{n}\\)。' },
            { step: 8, title: '求 \\(D(\\hat{\\theta}_1)\\)', content: '\\(D(\\hat{\\theta}_1)=D(2\\bar{X})=4D(\\bar{X})=4\\cdot\\dfrac{D(X)}{n}=4\\cdot\\dfrac{\\theta^2/12}{n}=\\dfrac{\\theta^2}{3n}\\)。' }
        ],
        tips: [
            '看到「均匀分布 \\(U(0,\\theta)\\)」求最大似然估计，答案必是样本最大值 \\(X_{(n)}\\)，切勿求导。',
            '判断无偏一律算 \\(E(\\hat{\\theta})\\)，与 \\(\\theta\\) 相等才无偏；有偏时用线性系数 \\(c\\) 修正，是常规套路。'
        ],
        mistakes: [
            '对含参数支撑的似然函数盲目取对数求导，得到 \\(-n/\\theta=0\\) 无解却不知极值在边界，是本节最高频错误。',
            '把矩估计与最大似然估计混为一谈：本题二者结果不同（\\(2\\bar{X}\\) 与 \\(X_{(n)}\\)），必须分别按定义求。'
        ],
        source: { rank: 1, label: '真题', detail: '改编自 2016 年数学一第 22 题（均匀分布的最大似然估计）与 2024 年数学一第 22 题（无偏估计）' },
        variants: [
            {
                id: 'm32v1', dimension: '综合计算',
                difficulty: 4, chapter: 'ch20', chapters: ['ch20'],
                kpIds: ['GL.20.1'], kpNames: ['矩估计', '最大似然估计'],
                question: '设总体 \\(X\\) 的概率密度为 \\(f(x;\\theta)=\\theta x^{\\theta-1},\\ 0<x<1\\)，其中 \\(\\theta>0\\) 未知，\\(X_1,X_2,\\cdots,X_n\\) 为简单随机样本。<br>（I）求 \\(\\theta\\) 的矩估计量 \\(\\hat{\\theta}_1\\)；<br>（II）求 \\(\\theta\\) 的最大似然估计量 \\(\\hat{\\theta}_2\\)。',
                options: [],
                answer: '（I）\\(\\hat{\\theta}_1=\\dfrac{\\bar{X}}{1-\\bar{X}}\\)；（II）\\(\\hat{\\theta}_2=-\\dfrac{n}{\\sum_{i=1}^n\\ln X_i}\\)。',
                concepts: [
                    { name: '总体一阶矩', note: '\\(E(X)=\\int_0^1 x\\cdot\\theta x^{\\theta-1}\\,\\mathrm{d}x=\\theta\\int_0^1 x^{\\theta}\\,\\mathrm{d}x=\\dfrac{\\theta}{\\theta+1}\\)。' },
                    { name: '对数似然求导', note: '\\(\\ln L(\\theta)=n\\ln\\theta+(\\theta-1)\\sum_{i=1}^n\\ln x_i\\)，令 \\(\\dfrac{\\mathrm{d}\\ln L}{\\mathrm{d}\\theta}=0\\) 求解。' }
                ],
                solution: [
                    { step: 1, title: '求 \\(E(X)\\)', content: '\\(E(X)=\\theta\\int_0^1 x^{\\theta}\\,\\mathrm{d}x=\\theta\\cdot\\dfrac{x^{\\theta+1}}{\\theta+1}\\Big|_0^1=\\theta\\cdot\\dfrac{1}{\\theta+1}=\\dfrac{\\theta}{\\theta+1}\\)。' },
                    { step: 2, title: '列矩法方程并解出 \\(\\hat{\\theta}_1\\)', content: '\\(\\bar{X}=\\dfrac{\\theta}{\\theta+1}\\Rightarrow\\bar{X}(\\theta+1)=\\theta\\Rightarrow\\bar{X}=\\theta-\\bar{X}\\theta=\\theta(1-\\bar{X})\\Rightarrow\\hat{\\theta}_1=\\dfrac{\\bar{X}}{1-\\bar{X}}\\)。' },
                    { step: 3, title: '写似然函数并取对数', content: '\\(L(\\theta)=\\prod_{i=1}^n\\theta x_i^{\\theta-1}=\\theta^{\\,n}\\left(\\prod_{i=1}^n x_i\\right)^{\\theta-1}\\)，取对数<br>\\(\\ln L(\\theta)=n\\ln\\theta+(\\theta-1)\\sum_{i=1}^n\\ln x_i\\)。' },
                    { step: 4, title: '求导定点得 \\(\\hat{\\theta}_2\\)', content: '\\(\\dfrac{\\mathrm{d}\\ln L}{\\mathrm{d}\\theta}=\\dfrac{n}{\\theta}+\\sum_{i=1}^n\\ln x_i=0\\Rightarrow\\hat{\\theta}_2=-\\dfrac{n}{\\sum_{i=1}^n\\ln X_i}\\)。因 \\(0<X_i<1\\)，\\(\\ln X_i<0\\)，\\(\\sum\\ln X_i<0\\)，故 \\(\\hat{\\theta}_2>0\\)，结果合理。' }
                ],
                tips: [
                    '本题 \\(E(X)\\) 含参数在分母，解矩法方程时先交叉相乘再分离 \\(\\theta\\)。',
                    '\\(0<X_i<1\\) 保证 \\(\\sum\\ln X_i<0\\)，最大似然估计自动为正，可用来检验答案合理性。'
                ],
                mistakes: [
                    '矩法方程解错：\\(\\bar{X}=\\dfrac{\\theta}{\\theta+1}\\) 应化为 \\(\\theta=\\dfrac{\\bar{X}}{1-\\bar{X}}\\)，不要漏掉分母 \\(1-\\bar{X}\\)。',
                    '把 \\(\\ln L\\) 中 \\((\\theta-1)\\sum\\ln x_i\\) 求导后误乘上 \\(n\\)，实际上对 \\(\\theta\\) 求导只留下 \\(\\sum\\ln x_i\\)。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：幂函数密度下的矩估计与最大似然（综合计算维度），难度对标 2018 年数一第 22 题' }
            },
            {
                id: 'm32v2', dimension: '综合创新',
                difficulty: 4, chapter: 'ch20', chapters: ['ch20'],
                kpIds: ['GL.20.1'], kpNames: ['无偏估计', '次序统计量', '有效性'],
                question: '设总体 \\(X\\sim U(0,\\theta)\\)（\\(\\theta>0\\) 未知），\\(X_1,\\cdots,X_n\\) 为简单随机样本，\\(\\bar{X}\\) 为样本均值，\\(X_{(n)}=\\max\\{X_1,\\cdots,X_n\\}\\)。定义两个估计量 \\(\\hat{\\theta}_1=2\\bar{X}\\)，\\(\\hat{\\theta}_2=\\dfrac{n+1}{n}X_{(n)}\\)。<br>（I）证明 \\(\\hat{\\theta}_1\\) 与 \\(\\hat{\\theta}_2\\) 都是 \\(\\theta\\) 的无偏估计；<br>（II）分别求 \\(D(\\hat{\\theta}_1)\\) 与 \\(D(\\hat{\\theta}_2)\\)，并判断 \\(n>1\\) 时哪个估计量更有效。',
                options: [],
                answer: '（I）\\(E(\\hat{\\theta}_1)=\\theta\\)，\\(E(\\hat{\\theta}_2)=\\theta\\)；（II）\\(D(\\hat{\\theta}_1)=\\dfrac{\\theta^2}{3n}\\)，\\(D(\\hat{\\theta}_2)=\\dfrac{\\theta^2}{n(n+2)}\\)，\\(n>1\\) 时 \\(\\hat{\\theta}_2\\) 更有效。',
                concepts: [
                    { name: '均匀分布数字特征', note: '\\(X\\sim U(0,\\theta)\\Rightarrow E(X)=\\dfrac{\\theta}{2}\\)，\\(D(X)=\\dfrac{\\theta^2}{12}\\)。' },
                    { name: '最大次序统计量的矩', note: '\\(X_{(n)}\\) 的密度 \\(f(t)=\\dfrac{n\\,t^{\\,n-1}}{\\theta^{\\,n}}\\)（\\(0<t<\\theta\\)），\\(E(X_{(n)})=\\dfrac{n\\theta}{n+1}\\)，\\(E(X_{(n)}^2)=\\dfrac{n\\theta^2}{n+2}\\)。' },
                    { name: '估计量的有效性', note: '同为无偏估计时，方差越小越有效，方差最小者为最有效估计量。' }
                ],
                solution: [
                    { step: 1, title: '证 \\(\\hat{\\theta}_1\\) 无偏', content: '\\(E(\\hat{\\theta}_1)=E(2\\bar{X})=2E(\\bar{X})=2\\cdot\\dfrac{1}{n}\\cdot n\\cdot\\dfrac{\\theta}{2}=\\theta\\)，故 \\(\\hat{\\theta}_1\\) 无偏。' },
                    { step: 2, title: '证 \\(\\hat{\\theta}_2\\) 无偏', content: '由母题步骤 7 已得 \\(E(X_{(n)})=\\dfrac{n\\theta}{n+1}\\)，故 \\(E(\\hat{\\theta}_2)=\\dfrac{n+1}{n}\\cdot\\dfrac{n\\theta}{n+1}=\\theta\\)，即 \\(\\hat{\\theta}_2\\) 无偏。' },
                    { step: 3, title: '求 \\(D(\\hat{\\theta}_1)\\)', content: '\\(D(\\hat{\\theta}_1)=4D(\\bar{X})=4\\cdot\\dfrac{D(X)}{n}=4\\cdot\\dfrac{\\theta^2/12}{n}=\\dfrac{\\theta^2}{3n}\\)。' },
                    { step: 4, title: '求 \\(D(X_{(n)})\\) 与 \\(D(\\hat{\\theta}_2)\\)，并比较', content: '先算二阶矩：\\(E(X_{(n)}^2)=\\int_0^{\\theta}t^2\\cdot\\dfrac{n\\,t^{\\,n-1}}{\\theta^{\\,n}}\\,\\mathrm{d}t=\\dfrac{n}{\\theta^{\\,n}}\\cdot\\dfrac{\\theta^{\\,n+2}}{n+2}=\\dfrac{n\\theta^2}{n+2}\\)，于是<br>\\[D(X_{(n)})=\\dfrac{n\\theta^2}{n+2}-\\left(\\dfrac{n\\theta}{n+1}\\right)^2=\\dfrac{n\\theta^2[(n+1)^2-n(n+2)]}{(n+2)(n+1)^2}=\\dfrac{n\\theta^2}{(n+2)(n+1)^2}.\\] 故 \\(D(\\hat{\\theta}_2)=\\left(\\dfrac{n+1}{n}\\right)^2D(X_{(n)})=\\dfrac{(n+1)^2}{n^2}\\cdot\\dfrac{n\\theta^2}{(n+2)(n+1)^2}=\\dfrac{\\theta^2}{n(n+2)}\\)。<br>比较：\\(\\dfrac{D(\\hat{\\theta}_1)}{D(\\hat{\\theta}_2)}=\\dfrac{\\theta^2/(3n)}{\\theta^2/[n(n+2)]}=\\dfrac{n+2}{3}>1\\)（当 \\(n>1\\)），故 \\(D(\\hat{\\theta}_2)<D(\\hat{\\theta}_1)\\)，\\(n>1\\) 时 \\(\\hat{\\theta}_2\\) 更有效。' }
                ],
                tips: [
                    '两个无偏估计比优劣看方差，方差小者更有效。',
                    '\\(D(X_{(n)})\\) 的推导要写全 \\(E(X_{(n)}^2)-(EX_{(n)})^2\\)，并通分合并（分子 \\((n+1)^2-n(n+2)=1\\)）。'
                ],
                mistakes: [
                    '忘记 \\(\\hat{\\theta}_2\\) 前的系数 \\((n+1)/n\\) 要平方后再乘进方差。',
                    '化简 \\(\\left(\\dfrac{n+1}{n}\\right)^2\\cdot\\dfrac{n\\theta^2}{(n+2)(n+1)^2}\\) 时漏掉 \\((n+1)^2\\) 的相消，得不到 \\(\\dfrac{\\theta^2}{n(n+2)}\\)。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：均匀分布两个估计量的无偏性与有效性比较（综合创新维度），难度对标 2020 年数一第 22 题' }
            }
        ]
    },
    /* ==================================================================
     * m33 · 综合母题 · 概率/解答题 · 二维随机变量综合
     * 综合来源：二维随机变量（2023 型）+ 数字特征/相关系数（2020 型）
     * ================================================================== */
    {
        id: 'm33',
        part: '概率',
        type: '解答题',
        score: 12,
        topic: '二维随机变量综合（边缘密度 · 独立性 · 函数分布 · 相关系数）',
        difficulty: 4,
        chapter: 'ch17',
        chapters: ['ch17', 'ch18'],
        chain: '联合密度 → 边缘密度 → 独立性 → 函数分布 → 协方差/相关系数',
        kpIds: ['GL.17.1', 'GL.17.2', 'GL.17.4', 'GL.18.3'],
        kpNames: ['联合密度', '边缘密度', '独立性', '函数分布', '协方差', '相关系数'],
        predict: {
            heat: 5,
            trend: '二维随机变量与数字特征捆绑命题，是概率解答题的另一主力（与参数估计轮换）',
            years: [2025, 2023, 2020, 2016],
            advice: '先画支撑区域图，所有积分都在区域内做；判独立看 f(x,y)=f_X(x)f_Y(y) 是否恒成立；求函数分布一律用分布函数法 F_Z(z)=P{g(X,Y)≤z}'
        },
        question: '设二维随机变量 \\((X,Y)\\) 在区域 \\(D=\\{(x,y)\\mid x\\ge0,\\ y\\ge0,\\ x+y\\le1\\}\\) 上服从均匀分布。<br>（I）求边缘密度 \\(f_X(x)\\) 与 \\(f_Y(y)\\)；<br>（II）判断 \\(X\\) 与 \\(Y\\) 是否相互独立，并说明理由；<br>（III）求 \\(Z=X+Y\\) 的概率密度 \\(f_Z(z)\\)；<br>（IV）求 \\(\\mathrm{Cov}(X,Y)\\) 与相关系数 \\(\\rho_{XY}\\)。',
        options: [],
        answer: '（I）\\(f_X(x)=2(1-x)\\ (0<x<1)\\)，\\(f_Y(y)=2(1-y)\\ (0<y<1)\\)，其余为 0；（II）不相互独立（\\(f_X(x)f_Y(y)\\ne f(x,y)\\)）；（III）\\(f_Z(z)=2z\\ (0<z<1)\\)；（IV）\\(\\mathrm{Cov}(X,Y)=-\\dfrac{1}{36}\\)，\\(\\rho_{XY}=-\\dfrac{1}{2}\\)。',
        concepts: [
            { name: '区域面积与均匀密度', note: '\\(D\\) 是直角边为 1 的等腰直角三角形，面积 \\(S=\\dfrac{1}{2}\\)，故在 \\(D\\) 内 \\(f(x,y)=\\dfrac{1}{S}=2\\)，其余为 0。' },
            { name: '边缘密度', note: '\\(f_X(x)=\\int_{-\\infty}^{+\\infty}f(x,y)\\,\\mathrm{d}y\\)，本题 \\(y\\) 从 0 积到 \\(1-x\\)。' },
            { name: '独立性判别', note: '\\(X,Y\\) 独立 \\(\\iff f(x,y)=f_X(x)f_Y(y)\\) 对一切 \\((x,y)\\) 成立；区域外两侧同时为 0 自动相等，关键是区域内是否恒等。' },
            { name: '协方差与相关系数', note: '\\(\\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)\\)，\\(\\rho_{XY}=\\dfrac{\\mathrm{Cov}(X,Y)}{\\sqrt{D(X)}\\sqrt{D(Y)}}\\)。' }
        ],
        solution: [
            { step: 1, title: '确定联合密度', content: '\\(D\\) 的面积 \\(S=\\int_0^1(1-x)\\,\\mathrm{d}x=\\left(x-\\dfrac{x^2}{2}\\right)\\Big|_0^1=\\dfrac{1}{2}\\)，故二维均匀分布的联合密度为 \\(f(x,y)=2\\)（\\((x,y)\\in D\\)），其余为 0。' },
            { step: 2, title: '求 \\(f_X(x)\\)', content: '当 \\(0<x<1\\) 时，使 \\((x,y)\\in D\\) 的 \\(y\\) 满足 \\(0\\le y\\le 1-x\\)，故<br>\\[f_X(x)=\\int_0^{1-x}2\\,\\mathrm{d}y=2(1-x).\\] 当 \\(x\\notin(0,1)\\) 时 \\(f_X(x)=0\\)。' },
            { step: 3, title: '求 \\(f_Y(y)\\)', content: '区域 \\(D\\) 关于直线 \\(y=x\\) 对称，故 \\(X,Y\\) 地位相同，同理<br>\\[f_Y(y)=\\int_0^{1-y}2\\,\\mathrm{d}x=2(1-y),\\quad 0<y<1.\\]' },
            { step: 4, title: '独立性判别', content: '若独立须有 \\(f_X(x)f_Y(y)=2(1-x)\\cdot2(1-y)=4(1-x)(1-y)\\)。取区域内一点 \\((x,y)=(0.5,0.2)\\)：\\(f(0.5,0.2)=2\\)，而 \\(f_X(0.5)f_Y(0.2)=4\\times0.5\\times0.8=1.6\\ne2\\)，二者不等，故 \\(X\\) 与 \\(Y\\) 不独立。本质原因：\\(D\\) 不是矩形区域，支撑耦合导致不独立。' },
            { step: 5, title: '求 \\(Z=X+Y\\) 的分布函数', content: '对 \\(0<z<1\\)，事件 \\(\\{X+Y\\le z\\}\\) 对应 \\(D\\) 内直线 \\(x+y=z\\) 下方的三角形，其面积 \\(=\\dfrac{1}{2}z^2\\)，故<br>\\[F_Z(z)=P(X+Y\\le z)=2\\cdot\\dfrac{1}{2}z^2=z^2,\\quad 0<z<1.\\] 当 \\(z\\le0\\) 时 \\(F_Z(z)=0\\)；当 \\(z\\ge1\\) 时 \\(F_Z(z)=1\\)。' },
            { step: 6, title: '求 \\(f_Z(z)\\)', content: '对 \\(F_Z(z)=z^2\\) 求导：\\(f_Z(z)=F_Z\'(z)=2z\\)（\\(0<z<1\\)），其余为 0。' },
            { step: 7, title: '求 \\(E(X),E(X^2)\\) 与 \\(D(X)\\)', content: '\\(E(X)=\\int_0^1 x\\cdot2(1-x)\\,\\mathrm{d}x=2\\int_0^1(x-x^2)\\,\\mathrm{d}x=2\\left(\\dfrac{1}{2}-\\dfrac{1}{3}\\right)=\\dfrac{1}{3}\\)；<br>\\(E(X^2)=\\int_0^1 x^2\\cdot2(1-x)\\,\\mathrm{d}x=2\\int_0^1(x^2-x^3)\\,\\mathrm{d}x=2\\left(\\dfrac{1}{3}-\\dfrac{1}{4}\\right)=\\dfrac{1}{6}\\)，故 \\(D(X)=\\dfrac{1}{6}-\\left(\\dfrac{1}{3}\\right)^2=\\dfrac{1}{6}-\\dfrac{1}{9}=\\dfrac{1}{18}\\)；由对称性 \\(E(Y)=\\dfrac{1}{3}\\)，\\(D(Y)=\\dfrac{1}{18}\\)。' },
            { step: 8, title: '求 \\(E(XY)\\)', content: '\\[E(XY)=\\iint_D xy\\cdot2\\,\\mathrm{d}x\\mathrm{d}y=2\\int_0^1 x\\left(\\int_0^{1-x}y\\,\\mathrm{d}y\\right)\\mathrm{d}x=2\\int_0^1 x\\cdot\\dfrac{(1-x)^2}{2}\\,\\mathrm{d}x=\\int_0^1 x(1-x)^2\\,\\mathrm{d}x.\\] 展开 \\(x(1-x)^2=x-2x^2+x^3\\)，逐项积分：\\(\\int_0^1(x-2x^2+x^3)\\,\\mathrm{d}x=\\dfrac{1}{2}-\\dfrac{2}{3}+\\dfrac{1}{4}=\\dfrac{6-8+3}{12}=\\dfrac{1}{12}\\)。' },
            { step: 9, title: '求协方差与相关系数', content: '\\(\\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)=\\dfrac{1}{12}-\\dfrac{1}{3}\\cdot\\dfrac{1}{3}=\\dfrac{1}{12}-\\dfrac{1}{9}=\\dfrac{3-4}{36}=-\\dfrac{1}{36}\\)。<br>\\[\\rho_{XY}=\\dfrac{\\mathrm{Cov}(X,Y)}{\\sqrt{D(X)}\\sqrt{D(Y)}}=\\dfrac{-1/36}{\\sqrt{1/18}\\cdot\\sqrt{1/18}}=\\dfrac{-1/36}{1/18}=-\\dfrac{1}{2}.\\]' }
        ],
        tips: [
            '拿到二维密度先画支撑区域：本题是三角形，边缘密度与各种积分的上下限全靠它确定。',
            '判断独立性不能只看「密度能否写成只含 x 与只含 y 的乘积」的表面形式，要在区域内实测 \\(f_Xf_Y\\) 是否恒等于 \\(f\\)。'
        ],
        mistakes: [
            '把区域外 \\(f_Xf_Y=0=f\\) 当作独立的依据：区域外二者同时为 0，判断要看区域内是否恒等。',
            '求 \\(E(XY)\\) 时把积分区域当成矩形 \\([0,1]\\times[0,1]\\)，漏掉 \\(x+y\\le1\\) 的约束导致上限写错。'
        ],
        source: { rank: 1, label: '真题', detail: '改编自 2023 年数学一第 22 题（二维随机变量）与 2020 年数学一第 22 题（相关系数）' },
        variants: [
            {
                id: 'm33v1', dimension: '综合计算',
                difficulty: 4, chapter: 'ch17', chapters: ['ch17', 'ch18'],
                kpIds: ['GL.17.1', 'GL.18.3'], kpNames: ['边缘密度', '相关系数'],
                question: '设二维随机变量 \\((X,Y)\\) 在区域 \\(D=\\{(x,y)\\mid 0<x<y<1\\}\\) 上服从均匀分布。<br>（I）求边缘密度 \\(f_X(x)\\) 与 \\(f_Y(y)\\)；<br>（II）判断 \\(X\\) 与 \\(Y\\) 是否独立；<br>（III）求 \\(\\mathrm{Cov}(X,Y)\\) 与 \\(\\rho_{XY}\\)。',
                options: [],
                answer: '（I）\\(f_X(x)=2(1-x)\\ (0<x<1)\\)，\\(f_Y(y)=2y\\ (0<y<1)\\)；（II）不独立；（III）\\(\\mathrm{Cov}(X,Y)=\\dfrac{1}{36}\\)，\\(\\rho_{XY}=\\dfrac{1}{2}\\)。',
                concepts: [
                    { name: '区域面积', note: '\\(D=\\{0<x<y<1\\}\\) 是上三角区域，面积 \\(=\\dfrac{1}{2}\\)，故 \\(f(x,y)=2\\)。' },
                    { name: '边缘密度积分限', note: '\\(f_X(x)=\\int_x^1 2\\,\\mathrm{d}y\\)，\\(f_Y(y)=\\int_0^y 2\\,\\mathrm{d}x\\)。' }
                ],
                solution: [
                    { step: 1, title: '求 \\(f_X(x)\\)', content: '固定 \\(0<x<1\\)，\\((x,y)\\in D\\) 要求 \\(x<y<1\\)，故 \\(f_X(x)=\\int_x^1 2\\,\\mathrm{d}y=2(1-x)\\)。' },
                    { step: 2, title: '求 \\(f_Y(y)\\)', content: '固定 \\(0<y<1\\)，\\((x,y)\\in D\\) 要求 \\(0<x<y\\)，故 \\(f_Y(y)=\\int_0^y 2\\,\\mathrm{d}x=2y\\)。' },
                    { step: 3, title: '独立性判别', content: '\\(f_X(x)f_Y(y)=2(1-x)\\cdot2y=4(1-x)y\\)。取区域内点 \\((0.2,0.5)\\)：\\(f(0.2,0.5)=2\\)，而 \\(f_X(0.2)f_Y(0.5)=4\\times0.8\\times0.5=1.6\\ne2\\)，故不独立。' },
                    { step: 4, title: '求 \\(E(X),E(X^2),D(X)\\)', content: '\\(E(X)=\\int_0^1 x\\cdot2(1-x)\\,\\mathrm{d}x=2\\left(\\dfrac{1}{2}-\\dfrac{1}{3}\\right)=\\dfrac{1}{3}\\)；\\(E(X^2)=\\int_0^1 x^2\\cdot2(1-x)\\,\\mathrm{d}x=2\\left(\\dfrac{1}{3}-\\dfrac{1}{4}\\right)=\\dfrac{1}{6}\\)；\\(D(X)=\\dfrac{1}{6}-\\dfrac{1}{9}=\\dfrac{1}{18}\\)。' },
                    { step: 5, title: '求 \\(E(Y),E(Y^2),D(Y)\\)', content: '\\(E(Y)=\\int_0^1 y\\cdot2y\\,\\mathrm{d}y=2\\int_0^1 y^2\\,\\mathrm{d}y=\\dfrac{2}{3}\\)；\\(E(Y^2)=\\int_0^1 y^2\\cdot2y\\,\\mathrm{d}y=2\\int_0^1 y^3\\,\\mathrm{d}y=\\dfrac{1}{2}\\)；\\(D(Y)=\\dfrac{1}{2}-\\left(\\dfrac{2}{3}\\right)^2=\\dfrac{1}{2}-\\dfrac{4}{9}=\\dfrac{9-8}{18}=\\dfrac{1}{18}\\)。' },
                    { step: 6, title: '求 \\(E(XY)\\)', content: '\\(E(XY)=\\iint_D 2xy\\,\\mathrm{d}x\\mathrm{d}y=2\\int_0^1 y\\left(\\int_0^y x\\,\\mathrm{d}x\\right)\\mathrm{d}y=2\\int_0^1 y\\cdot\\dfrac{y^2}{2}\\,\\mathrm{d}y=\\int_0^1 y^3\\,\\mathrm{d}y=\\dfrac{1}{4}\\)。' },
                    { step: 7, title: '求协方差与相关系数', content: '\\(\\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)=\\dfrac{1}{4}-\\dfrac{1}{3}\\cdot\\dfrac{2}{3}=\\dfrac{9-8}{36}=\\dfrac{1}{36}\\)；\\(\\rho_{XY}=\\dfrac{1/36}{\\sqrt{1/18}\\cdot\\sqrt{1/18}}=\\dfrac{1/36}{1/18}=\\dfrac{1}{2}\\)。' }
                ],
                tips: [
                    '不同区域的积分限是本题全部难点，先画图（上三角）再写限。',
                    '相关系数只由 \\(\\mathrm{Cov}\\) 与两方差决定，本题两方差相同可直接约简。'
                ],
                mistakes: [
                    '\\(f_X\\) 的积分下限误写成 0（应是 \\(x\\)，因为区域要求 \\(y>x\\)）。',
                    '求 \\(E(Y)\\) 时把 \\(f_Y(y)=2y\\) 的权重漏掉，直接按区间长度积分。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：三角形区域上的边缘密度与相关系数（综合计算维度），难度对标 2020 年数一第 22 题' }
            },
            {
                id: 'm33v2', dimension: '综合创新',
                difficulty: 4, chapter: 'ch17', chapters: ['ch17', 'ch18'],
                kpIds: ['GL.17.4', 'GL.18.2'], kpNames: ['函数分布', '方差'],
                question: '设 \\((X,Y)\\) 在区域 \\(D=\\{x\\ge0,\\ y\\ge0,\\ x+y\\le1\\}\\) 上服从均匀分布，令 \\(Z=X-Y\\)。<br>（I）求 \\(Z\\) 的概率密度 \\(f_Z(z)\\)；<br>（II）求 \\(E(Z)\\) 与 \\(D(Z)\\)。',
                options: [],
                answer: '（I）\\(f_Z(z)=1-|z|\\ (-1<z<1)\\)，其余为 0；（II）\\(E(Z)=0\\)，\\(D(Z)=\\dfrac{1}{6}\\)。',
                concepts: [
                    { name: '分布函数法', note: '\\(F_Z(z)=P(X-Y\\le z)\\)，化为 \\(D\\) 内满足 \\(y\\ge x-z\\) 的区域面积乘 2（\\(f=2\\)）。' },
                    { name: '两个随机变量和的方差', note: '\\(D(X\\pm Y)=D(X)+D(Y)\\pm2\\mathrm{Cov}(X,Y)\\)。' }
                ],
                solution: [
                    { step: 1, title: '分情形求 \\(F_Z(z)\\)（\\(-1<z<0\\)）', content: '条件 \\(x-y\\le z\\) 即 \\(y\\ge x-z\\)（\\(z<0\\) 时右端大于 \\(x\\)）。直线 \\(y=x-z\\) 在 \\(D\\) 内从 \\(x=0\\) 到与斜边交点 \\(x=\\dfrac{1+z}{2}\\)（由 \\(x-z=1-x\\) 解出）。满足条件的面积<br>\\[=\\int_0^{(1+z)/2}[(1-x)-(x-z)]\\,\\mathrm{d}x=\\int_0^{(1+z)/2}(1+z-2x)\\,\\mathrm{d}x=\\dfrac{(1+z)^2}{4}.\\] 故 \\(F_Z(z)=2\\cdot\\dfrac{(1+z)^2}{4}=\\dfrac{(1+z)^2}{2}\\)。' },
                    { step: 2, title: '分情形求 \\(F_Z(z)\\)（\\(0<z<1\\)）', content: '当 \\(x\\le z\\) 时 \\(x-z\\le0\\)，整个竖条 \\(0\\le y\\le1-x\\) 都满足；当 \\(x>z\\) 时需 \\(y\\ge x-z\\) 且 \\(x<\\dfrac{1+z}{2}\\)。面积<br>\\[=\\int_0^{z}(1-x)\\,\\mathrm{d}x+\\int_z^{(1+z)/2}(1+z-2x)\\,\\mathrm{d}x=\\left(z-\\dfrac{z^2}{2}\\right)+\\left[\\dfrac{(1+z)^2}{4}-z\\right]=\\dfrac{1+2z-z^2}{4}.\\] 故 \\(F_Z(z)=2\\cdot\\dfrac{1+2z-z^2}{4}=\\dfrac{1+2z-z^2}{2}\\)。' },
                    { step: 3, title: '求导合并得 \\(f_Z(z)\\)', content: '\\(-1<z<0\\) 时 \\(f_Z(z)=\\dfrac{\\mathrm{d}}{\\mathrm{d}z}\\dfrac{(1+z)^2}{2}=1+z\\)；\\(0<z<1\\) 时 \\(f_Z(z)=\\dfrac{\\mathrm{d}}{\\mathrm{d}z}\\dfrac{1+2z-z^2}{2}=1-z\\)。合并即 \\(f_Z(z)=1-|z|\\ (-1<z<1)\\)，其余为 0。' },
                    { step: 4, title: '求 \\(E(Z)\\)', content: '\\(E(Z)=E(X-Y)=E(X)-E(Y)=\\dfrac{1}{3}-\\dfrac{1}{3}=0\\)（母题步骤 7）。亦可直接 \\(E(Z)=\\int_{-1}^{1}z(1-|z|)\\,\\mathrm{d}z=0\\)，因被积函数为奇函数。' },
                    { step: 5, title: '求 \\(D(Z)\\)', content: '\\(D(Z)=D(X-Y)=D(X)+D(Y)-2\\mathrm{Cov}(X,Y)=\\dfrac{1}{18}+\\dfrac{1}{18}-2\\left(-\\dfrac{1}{36}\\right)=\\dfrac{1}{9}+\\dfrac{1}{18}=\\dfrac{3}{18}=\\dfrac{1}{6}\\)。' }
                ],
                tips: [
                    '函数分布一律先写分布函数 \\(F_Z(z)=P\\{g(X,Y)\\le z\\}\\)，再按 \\(z\\) 分段讨论并求导。',
                    '\\(Z=X-Y\\) 的取值范围由 \\(X,Y\\) 的支撑决定：本题 \\(-1<z<1\\)，分段点必须覆盖整个支撑区间。'
                ],
                mistakes: [
                    '分段讨论漏掉 \\(z\\in(-1,0)\\) 或 \\(z\\in(0,1)\\) 其中一段，导致密度只写一半。',
                    '误用 \\(D(X-Y)=D(X)-D(Y)\\)（正确为 \\(D(X)+D(Y)-2\\mathrm{Cov}(X,Y)\\)）。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：二维均匀分布下差的函数分布（综合创新维度），难度对标 2025 年数一第 22 题' }
            }
        ]
    },
    /* ==================================================================
     * m34 · 综合母题 · 概率/解答题 · 抽样分布与区间估计/假设检验
     * 综合来源：三大抽样分布构造（2021 型）+ 置信区间与假设检验（2016 型）
     * ================================================================== */
    {
        id: 'm34',
        part: '概率',
        type: '解答题',
        score: 12,
        topic: '抽样分布与假设检验/区间估计综合',
        difficulty: 4,
        chapter: 'ch20',
        chapters: ['ch19', 'ch20'],
        chain: '正态总体统计量分布（χ²/t）→ 置信区间 → 假设检验拒绝域 → 两类错误',
        kpIds: ['GL.20.2', 'GL.20.3', 'GL.19.2'],
        kpNames: ['χ²分布', 't分布', '置信区间', '假设检验', '两类错误', '中心极限定理'],
        predict: {
            heat: 4,
            trend: '统计量的分布与区间估计/假设检验在选填稳定出现，偶尔升级为大题，是易被忽视的得分点',
            years: [2025, 2023, 2021, 2016],
            advice: '背熟三大抽样分布构造：(n-1)S²/σ²~χ²(n-1)、(X̄-μ)/(S/√n)~t(n-1)；区间估计就是「解不等式」；假设检验先写拒绝域再代值'
        },
        question: '设总体 \\(X\\sim N(\\mu,\\sigma^2)\\)，\\(X_1,X_2,\\cdots,X_n\\) 为简单随机样本，\\(\\bar{X}=\\dfrac{1}{n}\\sum_{i=1}^n X_i\\)，\\(S^2=\\dfrac{1}{n-1}\\sum_{i=1}^n(X_i-\\bar{X})^2\\)。<br>（I）写出 \\(\\dfrac{(n-1)S^2}{\\sigma^2}\\) 的分布，并求 \\(\\sigma^2\\) 的置信水平为 \\(1-\\alpha\\) 的置信区间；<br>（II）设 \\(\\sigma^2\\) 未知，检验 \\(H_0:\\mu=\\mu_0\\)，\\(H_1:\\mu\\ne\\mu_0\\)，写出显著性水平为 \\(\\alpha\\) 的拒绝域；<br>（III）说明该检验犯第一类错误的概率恰为 \\(\\alpha\\)，并讨论样本容量 \\(n\\) 增大时第二类错误概率 \\(\\beta\\) 的变化趋势。',
        options: [],
        answer: '（I）\\(\\dfrac{(n-1)S^2}{\\sigma^2}\\sim\\chi^2(n-1)\\)，\\(\\sigma^2\\) 的置信区间为 \\(\\left[\\dfrac{(n-1)S^2}{\\chi^2_{\\alpha/2}(n-1)},\\ \\dfrac{(n-1)S^2}{\\chi^2_{1-\\alpha/2}(n-1)}\\right]\\)；（II）拒绝域为 \\(|\\bar{X}-\\mu_0|\\ge t_{\\alpha/2}(n-1)\\dfrac{S}{\\sqrt{n}}\\)；（III）第一类错误概率为 \\(\\alpha\\)，\\(n\\) 增大时 \\(\\beta\\) 减小。',
        concepts: [
            { name: '三大抽样分布构造', note: '\\(\\dfrac{(n-1)S^2}{\\sigma^2}\\sim\\chi^2(n-1)\\)；\\(\\dfrac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}}\\sim N(0,1)\\)；\\(\\dfrac{\\bar{X}-\\mu}{S/\\sqrt{n}}\\sim t(n-1)\\)。' },
            { name: '置信区间「解不等式」', note: '由枢轴量 \\(T\\) 满足 \\(P(a\\le T\\le b)=1-\\alpha\\)，把 \\(T\\) 换成含待估参数的表达式，解不等式得参数的取值区间。' },
            { name: '假设检验基本框架', note: '在 \\(H_0\\) 成立下构造检验统计量并确定其分布，按「小概率事件在一次试验中几乎不发生」划出拒绝域，使 \\(P(\\text{拒绝}H_0\\mid H_0\\text{真})=\\alpha\\)。' },
            { name: '两类错误', note: '第一类错误「弃真」：\\(H_0\\) 真却拒绝，概率 \\(\\alpha\\)；第二类错误「取伪」：\\(H_0\\) 假却接受，概率 \\(\\beta\\)。' }
        ],
        solution: [
            { step: 1, title: '陈述 χ² 构造', content: '由正态总体抽样分布定理：\\(\\dfrac{(n-1)S^2}{\\sigma^2}\\sim\\chi^2(n-1)\\)（\\(\\bar{X}\\) 与 \\(S^2\\) 相互独立，\\(S^2\\) 对应自由度 \\(n-1\\)）。' },
            { step: 2, title: '写分位点概率等式', content: '设 \\(\\chi^2_{1-\\alpha/2}(n-1)\\) 与 \\(\\chi^2_{\\alpha/2}(n-1)\\) 分别为 \\(\\chi^2(n-1)\\) 的上 \\((1-\\alpha/2)\\)、上 \\(\\alpha/2\\) 分位点（前者较小），则<br>\\[P\\!\\left(\\chi^2_{1-\\alpha/2}(n-1)\\le\\dfrac{(n-1)S^2}{\\sigma^2}\\le\\chi^2_{\\alpha/2}(n-1)\\right)=1-\\alpha.\\]' },
            { step: 3, title: '解不等式得置信区间', content: '由左端 \\(\\chi^2_{1-\\alpha/2}\\le\\dfrac{(n-1)S^2}{\\sigma^2}\\Rightarrow\\sigma^2\\le\\dfrac{(n-1)S^2}{\\chi^2_{1-\\alpha/2}}\\)；由右端 \\(\\dfrac{(n-1)S^2}{\\sigma^2}\\le\\chi^2_{\\alpha/2}\\Rightarrow\\sigma^2\\ge\\dfrac{(n-1)S^2}{\\chi^2_{\\alpha/2}}\\)。合并得<br>\\[\\sigma^2\\in\\left[\\dfrac{(n-1)S^2}{\\chi^2_{\\alpha/2}(n-1)},\\ \\dfrac{(n-1)S^2}{\\chi^2_{1-\\alpha/2}(n-1)}\\right].\\]' },
            { step: 4, title: '构造 t 检验统计量', content: '\\(\\sigma\\) 未知，用 \\(S\\) 代替 \\(\\sigma\\)。在 \\(H_0:\\mu=\\mu_0\\) 成立下<br>\\[t=\\dfrac{\\bar{X}-\\mu_0}{S/\\sqrt{n}}\\sim t(n-1).\\]' },
            { step: 5, title: '写出拒绝域', content: '双侧检验取 \\(|t|\\ge t_{\\alpha/2}(n-1)\\) 为拒绝域，其中 \\(t_{\\alpha/2}(n-1)\\) 为 \\(t(n-1)\\) 的上 \\(\\alpha/2\\) 分位点。等价地：<br>\\[|\\bar{X}-\\mu_0|\\ge t_{\\alpha/2}(n-1)\\dfrac{S}{\\sqrt{n}}\\ \\Rightarrow\\ \\text{拒绝}H_0.\\]' },
            { step: 6, title: '说明第一类错误概率恰为 \\(\\alpha\\)', content: '当 \\(H_0\\) 为真时 \\(t\\sim t(n-1)\\)，故<br>\\[P(\\text{拒绝}H_0\\mid H_0\\text{真})=P(|t|\\ge t_{\\alpha/2}(n-1))=\\alpha.\\] 即恰好以显著性水平 \\(\\alpha\\) 犯「弃真」错误。' },
            { step: 7, title: '讨论第二类错误随 \\(n\\) 的变化', content: '设真实均值 \\(\\mu_1\\ne\\mu_0\\)，则 \\(t=\\dfrac{\\bar{X}-\\mu_0}{S/\\sqrt{n}}=\\dfrac{\\bar{X}-\\mu_1}{S/\\sqrt{n}}+\\dfrac{\\mu_1-\\mu_0}{S/\\sqrt{n}}\\)，近似服从非中心 \\(t\\) 分布，非中心参数 \\(\\delta=\\dfrac{\\sqrt{n}(\\mu_1-\\mu_0)}{\\sigma}\\)。当 \\(n\\to\\infty\\) 时 \\(\\delta\\to\\infty\\)，统计量远离 0，落入接受域 \\(|t|<t_{\\alpha/2}\\) 的概率 \\(\\beta=P(\\text{接受}H_0\\mid \\mu_1)\\to0\\)。故 \\(n\\) 增大时 \\(\\beta\\) 单调下降，检验功效 \\(1-\\beta\\) 增大。' },
            { step: 8, title: '补充（中心极限定理视角）', content: '当 \\(n\\) 较大时，由中心极限定理 \\(\\dfrac{\\sqrt{n}(\\bar{X}-\\mu)}{S}\\xrightarrow{d}N(0,1)\\)，故拒绝域中的分位点 \\(t_{\\alpha/2}(n-1)\\) 可用标准正态分位点 \\(z_{\\alpha/2}\\) 近似，这解释了 \\(t\\) 分位点当 \\(n\\to\\infty\\) 时趋于 \\(z_{\\alpha/2}\\)。' }
        ],
        tips: [
            '区间估计通用流程：找枢轴量 → 写出概率为 \\(1-\\alpha\\) 的分位点区间 → 解不等式把待估参数孤立出来。',
            '假设检验先写「在 \\(H_0\\) 成立下检验统计量的分布」，拒绝域阈值来自该分布的分位点；\\(\\sigma\\) 未知用 \\(t\\)，\\(\\sigma\\) 已知用 \\(z\\)。'
        ],
        mistakes: [
            '\\(\\sigma\\) 已知却用 \\(t\\) 分位点（应为 \\(z\\)），\\(\\sigma\\) 未知却用正态分位点（应为 \\(t\\)），是本节最常见的分布误用。',
            '置信区间上下限把分位点顺序写反：上 \\(\\alpha/2\\) 分位点（大）对应区间下界，上 \\(1-\\alpha/2\\) 分位点（小）对应区间上界，不要颠倒。'
        ],
        source: { rank: 1, label: '真题', detail: '改编自 2016 年数学一第 23 题（置信区间与假设检验）与 2021 年数学一第 9 题（t 分布）' },
        variants: [
            {
                id: 'm34v1', dimension: '综合计算',
                difficulty: 4, chapter: 'ch20', chapters: ['ch19', 'ch20'],
                kpIds: ['GL.20.2', 'GL.20.3'], kpNames: ['置信区间', '假设检验', '正态分布'],
                question: '设总体 \\(X\\sim N(\\mu,9)\\)，\\(\\sigma=3\\) 已知，抽取容量 \\(n=16\\) 的样本，测得样本均值 \\(\\bar{X}=10\\)。<br>（I）求 \\(\\mu\\) 的置信水平为 \\(0.95\\) 的置信区间（已知 \\(z_{0.025}=1.96\\)）；<br>（II）检验 \\(H_0:\\mu=8\\)，\\(H_1:\\mu\\ne8\\)，取 \\(\\alpha=0.05\\)，写出拒绝域并给出结论。',
                options: [],
                answer: '（I）\\([8.53,\\ 11.47]\\)；（II）拒绝域 \\(|z|\\ge1.96\\)，实算 \\(|z|=2.67>1.96\\)，故拒绝 \\(H_0\\)。',
                concepts: [
                    { name: '枢轴量（\\(\\sigma\\) 已知）', note: '\\(\\dfrac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}}\\sim N(0,1)\\)。' },
                    { name: '置信区间公式', note: '\\(\\mu\\) 的 \\(1-\\alpha\\) 置信区间为 \\(\\bar{X}\\pm z_{\\alpha/2}\\dfrac{\\sigma}{\\sqrt{n}}\\)。' }
                ],
                solution: [
                    { step: 1, title: '写分位点概率等式', content: '\\(\\sigma\\) 已知，\\(\\dfrac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}}\\sim N(0,1)\\)，故 \\(P\\!\\left(-1.96\\le\\dfrac{\\bar{X}-\\mu}{3/\\sqrt{16}}\\le1.96\\right)=0.95\\)。' },
                    { step: 2, title: '解出置信区间', content: '\\(\\dfrac{3}{\\sqrt{16}}=0.75\\)，解不等式得 \\(\\mu\\in\\left[\\bar{X}-1.96\\times0.75,\\ \\bar{X}+1.96\\times0.75\\right]=[10-1.47,\\ 10+1.47]=[8.53,\\ 11.47]\\)。' },
                    { step: 3, title: '计算检验统计量并写拒绝域', content: '\\(z=\\dfrac{\\bar{X}-8}{3/\\sqrt{16}}=\\dfrac{10-8}{0.75}=\\dfrac{2}{0.75}=2.67\\)；双侧检验拒绝域为 \\(|z|\\ge z_{0.025}=1.96\\)。' },
                    { step: 4, title: '下结论', content: '\\(2.67>1.96\\)，样本落入拒绝域，故在 \\(\\alpha=0.05\\) 下拒绝 \\(H_0:\\mu=8\\)。这与区间估计一致：\\(\\mu=8\\) 不在 95% 置信区间 \\([8.53,11.47]\\) 内。' }
                ],
                tips: [
                    '\\(\\sigma\\) 已知用 \\(z\\)，\\(\\sigma\\) 未知用 \\(t\\)，先判类型再套公式。',
                    '区间估计与双侧假设检验可互推：\\(\\mu_0\\) 落在 \\(1-\\alpha\\) 置信区间内 \\(\\iff\\) 不拒绝 \\(H_0\\)。'
                ],
                mistakes: [
                    '标准误误写成 \\(\\sigma\\sqrt{n}\\) 或 \\(\\sigma/n\\)（应为 \\(\\sigma/\\sqrt{n}\\)）。',
                    '双尾检验分位点错用 \\(z_{0.05}=1.645\\)（应取 \\(z_{0.025}=1.96\\)）。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：正态均值区间估计与 z 检验（综合计算维度），难度对标 2021 年数一第 9 题' }
            },
            {
                id: 'm34v2', dimension: '综合创新',
                difficulty: 4, chapter: 'ch20', chapters: ['ch19', 'ch20'],
                kpIds: ['GL.20.3'], kpNames: ['F分布', '假设检验', 'χ²分布'],
                question: '设 \\(X_1,\\cdots,X_{n_1}\\) 是来自 \\(N(\\mu_1,\\sigma_1^2)\\) 的样本，\\(Y_1,\\cdots,Y_{n_2}\\) 是来自 \\(N(\\mu_2,\\sigma_2^2)\\) 的样本，两样本相互独立，\\(S_1^2,S_2^2\\) 为两样本方差。<br>（I）写出 \\(\\dfrac{S_1^2/\\sigma_1^2}{S_2^2/\\sigma_2^2}\\) 的分布；<br>（II）在 \\(\\mu_1,\\mu_2,\\sigma_1^2,\\sigma_2^2\\) 均未知、两样本独立时，检验 \\(H_0:\\sigma_1^2=\\sigma_2^2\\)，\\(H_1:\\sigma_1^2\\ne\\sigma_2^2\\)，写出 \\(\\alpha\\) 水平的拒绝域。',
                options: [],
                answer: '（I）\\(\\dfrac{S_1^2/\\sigma_1^2}{S_2^2/\\sigma_2^2}\\sim F(n_1-1,n_2-1)\\)；（II）拒绝域为 \\(F\\ge F_{\\alpha/2}(n_1-1,n_2-1)\\) 或 \\(F\\le F_{1-\\alpha/2}(n_1-1,n_2-1)\\)，其中 \\(F=\\dfrac{S_1^2}{S_2^2}\\)。',
                concepts: [
                    { name: 'F 分布构造', note: '\\(\\dfrac{(n_1-1)S_1^2}{\\sigma_1^2}\\sim\\chi^2(n_1-1)\\)，\\(\\dfrac{(n_2-1)S_2^2}{\\sigma_2^2}\\sim\\chi^2(n_2-1)\\)，二者独立，分别除以自由度后作比服从 \\(F\\) 分布。' },
                    { name: 'F 分布的倒置', note: '\\(F\\sim F(m,n)\\Rightarrow\\dfrac{1}{F}\\sim F(n,m)\\)，故 \\(F_{1-\\alpha/2}(m,n)=\\dfrac{1}{F_{\\alpha/2}(n,m)}\\)。' }
                ],
                solution: [
                    { step: 1, title: '写出两个 χ² 统计量', content: '由正态总体抽样分布定理：\\(U=\\dfrac{(n_1-1)S_1^2}{\\sigma_1^2}\\sim\\chi^2(n_1-1)\\)，\\(V=\\dfrac{(n_2-1)S_2^2}{\\sigma_2^2}\\sim\\chi^2(n_2-1)\\)，且因两样本独立，\\(U\\) 与 \\(V\\) 相互独立。' },
                    { step: 2, title: '构造 F 统计量', content: '两个相互独立的 \\(\\chi^2\\) 变量分别除以各自自由度后作比即得 \\(F\\) 分布：<br>\\[\\dfrac{U/(n_1-1)}{V/(n_2-1)}=\\dfrac{S_1^2/\\sigma_1^2}{S_2^2/\\sigma_2^2}\\sim F(n_1-1,n_2-1).\\]' },
                    { step: 3, title: '在 \\(H_0\\) 下化简统计量', content: '在 \\(H_0:\\sigma_1^2=\\sigma_2^2\\) 成立下，\\(\\sigma_1^2=\\sigma_2^2\\) 在比值中约去，检验统计量简化为 \\(F=\\dfrac{S_1^2}{S_2^2}\\sim F(n_1-1,n_2-1)\\)。' },
                    { step: 4, title: '写出双侧拒绝域', content: '取两侧各 \\(\\alpha/2\\)：\\(F\\ge F_{\\alpha/2}(n_1-1,n_2-1)\\) 或 \\(F\\le F_{1-\\alpha/2}(n_1-1,n_2-1)\\) 时拒绝 \\(H_0\\)。若表只给上分位点，用 \\(F_{1-\\alpha/2}(n_1-1,n_2-1)=\\dfrac{1}{F_{\\alpha/2}(n_2-1,n_1-1)}\\) 换算。' }
                ],
                tips: [
                    '两方差比检验用 \\(F\\) 检验，自由度分别是 \\(n_1-1\\) 与 \\(n_2-1\\)，顺序与分子分母一一对应。',
                    '查表若只给上分位点，用倒数关系 \\(F_{1-\\alpha/2}(m,n)=1/F_{\\alpha/2}(n,m)\\) 换算下分位点。'
                ],
                mistakes: [
                    '把自由度写成样本容量 \\(n_1,n_2\\)（应为 \\(n_1-1,n_2-1\\)）。',
                    '分子分母自由度写反，导致分位点查错、拒绝域判断相反。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：两正态总体方差比的 F 检验（综合创新维度），难度对标 2023 年数一第 9 题' }
            }
        ]
    }
);
