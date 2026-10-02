/**
 * 考研数学一 ·「母题 22 炼」· 综合母题（线性代数）
 * 跨章节大题级综合训练，2027 命题预测视角
 * =================================================
 * 与 muti_data.js 同模块：22 道基础母题（m01-m22）的「综合母题」扩展。
 * 每道综合母题串联 ≥2 个模型/章节，含 (I)(II)(III) 小问，衍生恰好 2 道变式
 * （维度固定：'综合计算' / '综合创新'）。
 *
 * 数据结构：
 * window.MUTI_COMBO = { meta, combos: [ { id, part, type, score, topic, difficulty,
 *   chapter, chapters, chain, kpIds, kpNames, predict, question, options, answer,
 *   concepts, solution, tips, mistakes, source, variants } ] }
 *
 * 书写约定（零跳步解析）：
 * - 普通单引号字符串 + 双反斜杠转义 LaTeX；禁止模板字符串
 * - 行内 \\( \\)，换行用 <br>，矩阵用 \\begin{pmatrix} ... \\end{pmatrix}
 * - solution 不跳步：每步给出完整代数变形并注明依据
 */
window.MUTI_COMBO = window.MUTI_COMBO || { meta: { title: '综合母题 12 炼', updatedAt: '2026-09-13' }, combos: [] };
window.MUTI_COMBO.combos.push(

    /* ==================================================================
     * m29 · 线代/解答题 · 矩阵幂与递推综合
     * 特征值/特征向量 → 相似对角化 → A^n → 向量组线性表示
     * ================================================================== */
    {
        id: 'm29',
        part: '线代',
        type: '解答题',
        score: 12,
        topic: '矩阵幂与递推综合（特征值 · 相似对角化 · A^n）',
        difficulty: 4,
        chapter: 'ch13',
        chapters: ['ch13'],
        chain: '特征值/特征向量 → 相似对角化 A=PΛP⁻¹ → 矩阵幂 → 数列递推',
        kpIds: ['XD.13.2'],
        kpNames: ['相似对角化'],
        predict: {
            heat: 5,
            trend: '近三年线代大题明显从「二次型正交变换」转向「矩阵幂 / 矩阵方程 / 向量组」，2024 考矩阵递推、2025 考 A^100',
            years: [2026, 2025, 2024, 2018, 2017, 2016],
            advice: '先解特征方程；能否对角化看线性无关特征向量个数；求幂用 A^n=PΛ^nP^{-1}'
        },
        question: '设 \\(\\pmb{A}=\\begin{pmatrix}1&1&1\\\\0&2&1\\\\0&0&3\\end{pmatrix}\\)。<br>（I）求 \\(\\pmb{A}\\) 的全部特征值与属于每个特征值的全部特征向量；<br>（II）求可逆矩阵 \\(\\pmb{P}\\) 和对角矩阵 \\(\\pmb{\\Lambda}\\)，使 \\(\\pmb{P}^{-1}\\pmb{A}\\pmb{P}=\\pmb{\\Lambda}\\)，并由此求 \\(\\pmb{A}^n\\)（\\(n\\) 为正整数）；<br>（III）设向量 \\(\\pmb{\\alpha}=(0,1,1)^{\\mathrm{T}}\\)，令 \\(\\pmb{\\beta}=\\pmb{A}^{100}\\pmb{\\alpha}\\)，求 \\(\\pmb{\\beta}\\)，并把 \\(\\pmb{\\alpha}\\) 用 \\(\\pmb{A}\\) 的特征向量线性表示。',
        options: [],
        answer: '（I）\\(\\lambda_1=1,\\lambda_2=2,\\lambda_3=3\\)，特征向量分别为 \\(k_1(1,0,0)^{\\mathrm{T}}\\)、\\(k_2(1,1,0)^{\\mathrm{T}}\\)、\\(k_3(1,1,1)^{\\mathrm{T}}\\)（\\(k_i\\ne0\\)）；（II）\\(\\pmb{P}=\\begin{pmatrix}1&1&1\\\\0&1&1\\\\0&0&1\\end{pmatrix}\\)，\\(\\pmb{\\Lambda}=\\mathrm{diag}(1,2,3)\\)，\\(\\pmb{A}^n=\\begin{pmatrix}1&2^n-1&3^n-2^n\\\\0&2^n&3^n-2^n\\\\0&0&3^n\\end{pmatrix}\\)；（III）\\(\\pmb{\\alpha}=-(1,0,0)^{\\mathrm{T}}+(1,1,1)^{\\mathrm{T}}\\)，\\(\\pmb{\\beta}=(3^{100}-1,\\,3^{100},\\,3^{100})^{\\mathrm{T}}\\)。',
        concepts: [
            { name: '特征值与特征向量', note: '若 \\(\\pmb{A}\\pmb{\\xi}=\\lambda\\pmb{\\xi}\\)（\\(\\pmb{\\xi}\\ne\\pmb{0}\\)），则 \\(\\lambda\\) 为 \\(\\pmb{A}\\) 的特征值、\\(\\pmb{\\xi}\\) 为属于 \\(\\lambda\\) 的特征向量；特征值由 \\(\\det(\\lambda\\pmb{E}-\\pmb{A})=0\\) 求出。' },
            { name: '相似对角化判定', note: 'n 阶矩阵 \\(\\pmb{A}\\) 可对角化 \\(\\iff\\) \\(\\pmb{A}\\) 有 n 个线性无关的特征向量；n 个特征值互不相同必可对角化。' },
            { name: '对角化求矩阵幂', note: '若 \\(\\pmb{P}^{-1}\\pmb{A}\\pmb{P}=\\pmb{\\Lambda}\\)，则 \\(\\pmb{A}=\\pmb{P}\\pmb{\\Lambda}\\pmb{P}^{-1}\\)，从而 \\(\\pmb{A}^n=\\pmb{P}\\pmb{\\Lambda}^n\\pmb{P}^{-1}\\)，其中 \\(\\pmb{\\Lambda}^n=\\mathrm{diag}(\\lambda_1^n,\\lambda_2^n,\\lambda_3^n)\\)。' },
            { name: '特征向量基下的作用', note: '若 \\(\\pmb{\\alpha}=c_1\\pmb{\\xi}_1+c_2\\pmb{\\xi}_2+c_3\\pmb{\\xi}_3\\)，\\(\\pmb{\\xi}_i\\) 是 \\(\\lambda_i\\) 的特征向量，则 \\(\\pmb{A}^k\\pmb{\\alpha}=c_1\\lambda_1^k\\pmb{\\xi}_1+c_2\\lambda_2^k\\pmb{\\xi}_2+c_3\\lambda_3^k\\pmb{\\xi}_3\\)。' }
        ],
        solution: [
            { step: 1, title: '由特征方程求特征值', content: '\\(\\pmb{A}\\) 是上三角矩阵，其行列式为主对角元之积，故 \\(\\det(\\lambda\\pmb{E}-\\pmb{A})=(\\lambda-1)(\\lambda-2)(\\lambda-3)\\)。令其为 0，得 \\(\\lambda_1=1,\\lambda_2=2,\\lambda_3=3\\)。（上三角矩阵的特征值就是主对角线元素。）' },
            { step: 2, title: '求 \\(\\lambda_1=1\\) 的特征向量', content: '解 \\((\\pmb{E}-\\pmb{A})\\pmb{\\xi}=\\pmb{0}\\)。\\(\\pmb{E}-\\pmb{A}=\\begin{pmatrix}0&-1&-1\\\\0&-1&-1\\\\0&0&-2\\end{pmatrix}\\)，作初等行变换化成行阶梯形：\\(\\begin{pmatrix}0&1&1\\\\0&0&1\\\\0&0&0\\end{pmatrix}\\)。<br>对应方程 \\(x_2+x_3=0\\) 与 \\(x_3=0\\)，故 \\(x_2=x_3=0\\)，\\(x_1\\) 为自由未知量。取 \\(\\pmb{\\xi}_1=(1,0,0)^{\\mathrm{T}}\\)，故全部特征向量为 \\(k_1\\pmb{\\xi}_1\\ (k_1\\ne0)\\)。' },
            { step: 3, title: '求 \\(\\lambda_2=2\\) 的特征向量', content: '解 \\((2\\pmb{E}-\\pmb{A})\\pmb{\\xi}=\\pmb{0}\\)。\\(2\\pmb{E}-\\pmb{A}=\\begin{pmatrix}1&-1&-1\\\\0&0&-1\\\\0&0&1\\end{pmatrix}\\)，行变换后 \\(\\begin{pmatrix}1&-1&-1\\\\0&0&1\\\\0&0&0\\end{pmatrix}\\)。<br>对应 \\(x_3=0\\) 与 \\(x_1-x_2-x_3=0\\)，即 \\(x_1=x_2\\)。取 \\(\\pmb{\\xi}_2=(1,1,0)^{\\mathrm{T}}\\)，全部特征向量为 \\(k_2\\pmb{\\xi}_2\\ (k_2\\ne0)\\)。' },
            { step: 4, title: '求 \\(\\lambda_3=3\\) 的特征向量', content: '解 \\((3\\pmb{E}-\\pmb{A})\\pmb{\\xi}=\\pmb{0}\\)。\\(3\\pmb{E}-\\pmb{A}=\\begin{pmatrix}2&-1&-1\\\\0&1&-1\\\\0&0&0\\end{pmatrix}\\)。<br>第二式给出 \\(x_2-x_3=0\\)，即 \\(x_2=x_3\\)；代回第一式 \\(2x_1-x_2-x_3=0\\) 得 \\(2x_1-2x_3=0\\)，即 \\(x_1=x_3\\)。取 \\(\\pmb{\\xi}_3=(1,1,1)^{\\mathrm{T}}\\)，全部特征向量为 \\(k_3\\pmb{\\xi}_3\\ (k_3\\ne0)\\)。' },
            { step: 5, title: '拼 \\(\\pmb{P}\\) 并求 \\(\\pmb{P}^{-1}\\)（零跳步）', content: '三个特征值互不相同，故 \\(\\pmb{\\xi}_1,\\pmb{\\xi}_2,\\pmb{\\xi}_3\\) 线性无关，\\(\\pmb{A}\\) 可对角化。取 \\(\\pmb{P}=(\\pmb{\\xi}_1,\\pmb{\\xi}_2,\\pmb{\\xi}_3)=\\begin{pmatrix}1&1&1\\\\0&1&1\\\\0&0&1\\end{pmatrix}\\)，则 \\(\\pmb{P}^{-1}\\pmb{A}\\pmb{P}=\\mathrm{diag}(1,2,3)\\)。<br>求逆：记 \\(\\pmb{N}=\\begin{pmatrix}0&1&1\\\\0&0&1\\\\0&0&0\\end{pmatrix}\\)，则 \\(\\pmb{P}=\\pmb{E}+\\pmb{N}\\)，且 \\(\\pmb{N}^2=\\begin{pmatrix}0&0&1\\\\0&0&0\\\\0&0&0\\end{pmatrix}\\)，\\(\\pmb{N}^3=\\pmb{O}\\)（幂零）。<br>故 \\(\\pmb{P}^{-1}=(\\pmb{E}+\\pmb{N})^{-1}=\\pmb{E}-\\pmb{N}+\\pmb{N}^2=\\begin{pmatrix}1&-1&0\\\\0&1&-1\\\\0&0&1\\end{pmatrix}\\)。' },
            { step: 6, title: '求 \\(\\pmb{A}^n\\)', content: '由 \\(\\pmb{A}^n=\\pmb{P}\\pmb{\\Lambda}^n\\pmb{P}^{-1}\\)，其中 \\(\\pmb{\\Lambda}^n=\\mathrm{diag}(1,2^n,3^n)\\)。先算 \\(\\pmb{\\Lambda}^n\\pmb{P}^{-1}\\)（左乘对角阵等于逐行乘）：<br>\\(\\pmb{\\Lambda}^n\\pmb{P}^{-1}=\\begin{pmatrix}1&-1&0\\\\0&2^n&-2^n\\\\0&0&3^n\\end{pmatrix}\\)。<br>再左乘 \\(\\pmb{P}\\)，逐行作线性组合：第 1 行 \\(=\\) 三个行向量之和 \\(=(1,\\,-1+2^n+0,\\,0-2^n+3^n)=(1,\\,2^n-1,\\,3^n-2^n)\\)；<br>第 2 行 \\(=(0,\\,2^n,\\,-2^n+3^n)=(0,\\,2^n,\\,3^n-2^n)\\)；第 3 行 \\(=(0,0,3^n)\\)。<br>故 \\(\\pmb{A}^n=\\begin{pmatrix}1&2^n-1&3^n-2^n\\\\0&2^n&3^n-2^n\\\\0&0&3^n\\end{pmatrix}\\)。（取 \\(n=1\\) 验证恰为 \\(\\pmb{A}\\)，正确。）' },
            { step: 7, title: '把 \\(\\pmb{\\alpha}\\) 用特征向量线性表示', content: '设 \\((0,1,1)^{\\mathrm{T}}=c_1(1,0,0)^{\\mathrm{T}}+c_2(1,1,0)^{\\mathrm{T}}+c_3(1,1,1)^{\\mathrm{T}}\\)，逐分量比较：<br>第 3 分量：\\(c_3=1\\)；第 2 分量：\\(c_2+c_3=1\\Rightarrow c_2=0\\)；第 1 分量：\\(c_1+c_2+c_3=0\\Rightarrow c_1=-1\\)。<br>故 \\(\\pmb{\\alpha}=-(1,0,0)^{\\mathrm{T}}+(1,1,1)^{\\mathrm{T}}=-\\pmb{\\xi}_1+\\pmb{\\xi}_3\\)。' },
            { step: 8, title: '求 \\(\\pmb{\\beta}=\\pmb{A}^{100}\\pmb{\\alpha}\\)', content: '由特征向量的性质：\\(\\pmb{A}^{100}\\pmb{\\xi}_1=1^{100}\\pmb{\\xi}_1=(1,0,0)^{\\mathrm{T}}\\)，\\(\\pmb{A}^{100}\\pmb{\\xi}_3=3^{100}\\pmb{\\xi}_3=3^{100}(1,1,1)^{\\mathrm{T}}\\)。<br>故 \\(\\pmb{\\beta}=\\pmb{A}^{100}\\pmb{\\alpha}=-\\pmb{A}^{100}\\pmb{\\xi}_1+\\pmb{A}^{100}\\pmb{\\xi}_3=-(1,0,0)^{\\mathrm{T}}+3^{100}(1,1,1)^{\\mathrm{T}}=(3^{100}-1,\\,3^{100},\\,3^{100})^{\\mathrm{T}}\\)。<br>（用（II）的公式核验：\\(\\pmb{A}^{100}\\pmb{\\alpha}\\) 等于 \\(\\pmb{A}^{100}\\) 第 2 列加第 3 列，即 \\((2^{100}-1+3^{100}-2^{100},\\,2^{100}+3^{100}-2^{100},\\,3^{100})^{\\mathrm{T}}=(3^{100}-1,3^{100},3^{100})^{\\mathrm{T}}\\)，完全一致。）' }
        ],
        tips: [
            '上三角/下三角矩阵的特征值就是主对角元，先把谱看出来能省大量时间。',
            '求 \\(\\pmb{P}^{-1}\\) 时若 \\(\\pmb{P}\\) 形如 \\(\\pmb{E}+\\pmb{N}\\)（\\(\\pmb{N}\\) 幂零），用 \\(\\pmb{P}^{-1}=\\pmb{E}-\\pmb{N}+\\pmb{N}^2-\\cdots\\) 比硬算伴随矩阵快得多。'
        ],
        mistakes: [
            '把特征向量写成单个向量：特征向量是 \\(k\\pmb{\\xi}\\ (k\\ne0)\\) 的整条一维子空间，不能漏「\\(k\\ne0\\)」。',
            '求 \\(\\pmb{A}^n\\) 时把左右乘顺序弄反；牢记中间只有 \\(\\pmb{\\Lambda}\\) 取幂，即 \\(\\pmb{A}^n=\\pmb{P}\\pmb{\\Lambda}^n\\pmb{P}^{-1}\\)。'
        ],
        source: { rank: 1, label: '真题', detail: '改编自 2025 年数学一第 21 题（矩阵幂），并融合 2024 年线代解答题「矩阵递推」结构' },
        variants: [
            {
                id: 'm29v1', dimension: '综合计算',
                difficulty: 4, chapter: 'ch13', chapters: ['ch13'],
                kpIds: ['XD.13.2'], kpNames: ['相似对角化'],
                question: '设 \\(\\pmb{A}=\\begin{pmatrix}4&-3\\\\6&-5\\end{pmatrix}\\)。<br>（I）求 \\(\\pmb{A}\\) 的特征值与特征向量；<br>（II）求 \\(\\pmb{A}^n\\)；<br>（III）设数列 \\(\\{x_n\\},\\{y_n\\}\\) 满足 \\(\\begin{pmatrix}x_{n+1}\\\\y_{n+1}\\end{pmatrix}=\\pmb{A}\\begin{pmatrix}x_n\\\\y_n\\end{pmatrix}\\)，初值 \\((x_0,y_0)=(1,0)\\)，求 \\(x_n,y_n\\)。',
                options: [],
                answer: '（I）\\(\\lambda_1=1\\) 对应 \\((1,1)^{\\mathrm{T}}\\)，\\(\\lambda_2=-2\\) 对应 \\((1,2)^{\\mathrm{T}}\\)；（II）\\(\\pmb{A}^n=\\begin{pmatrix}2-(-2)^n&(-2)^n-1\\\\2-2(-2)^n&2(-2)^n-1\\end{pmatrix}\\)；（III）\\(x_n=2-(-2)^n,\\ y_n=2-2(-2)^n\\)。',
                concepts: [
                    { name: '二阶矩阵特征方程', note: '\\(\\det(\\lambda\\pmb{E}-\\pmb{A})=\\lambda^2-(\\mathrm{tr}\\,\\pmb{A})\\lambda+\\det\\pmb{A}=0\\)，用迹与行列式两分钟出根。' },
                    { name: '二阶矩阵对角化求幂', note: '两个特征值互异必可对角化：\\(\\pmb{A}^n=\\pmb{P}\\mathrm{diag}(\\lambda_1^n,\\lambda_2^n)\\pmb{P}^{-1}\\)。' },
                    { name: '递推与矩阵幂', note: '线性递推 \\(\\pmb{z}_{n+1}=\\pmb{A}\\pmb{z}_n\\) 的通项为 \\(\\pmb{z}_n=\\pmb{A}^n\\pmb{z}_0\\)。' }
                ],
                solution: [
                    { step: 1, title: '求特征值', content: '\\(\\mathrm{tr}\\,\\pmb{A}=4+(-5)=-1\\)，\\(\\det\\pmb{A}=4\\times(-5)-(-3)\\times6=-20+18=-2\\)。<br>特征方程 \\(\\lambda^2-(\\mathrm{tr}\\,\\pmb{A})\\lambda+\\det\\pmb{A}=\\lambda^2+\\lambda-2=(\\lambda-1)(\\lambda+2)=0\\)，得 \\(\\lambda_1=1,\\lambda_2=-2\\)。' },
                    { step: 2, title: '求特征向量', content: '\\(\\lambda_1=1\\)：\\(\\pmb{A}-\\pmb{E}=\\begin{pmatrix}3&-3\\\\6&-6\\end{pmatrix}\\)，行变换得 \\(\\begin{pmatrix}1&-1\\\\0&0\\end{pmatrix}\\)，即 \\(x_1=x_2\\)，取 \\((1,1)^{\\mathrm{T}}\\)。<br>\\(\\lambda_2=-2\\)：\\(\\pmb{A}+2\\pmb{E}=\\begin{pmatrix}6&-3\\\\6&-3\\end{pmatrix}\\)，行变换得 \\(\\begin{pmatrix}2&-1\\\\0&0\\end{pmatrix}\\)，即 \\(x_2=2x_1\\)，取 \\((1,2)^{\\mathrm{T}}\\)。' },
                    { step: 3, title: '对角化求 \\(\\pmb{A}^n\\)', content: '取 \\(\\pmb{P}=\\begin{pmatrix}1&1\\\\1&2\\end{pmatrix}\\)，\\(\\det\\pmb{P}=1\\)，故 \\(\\pmb{P}^{-1}=\\begin{pmatrix}2&-1\\\\-1&1\\end{pmatrix}\\)。<br>\\(\\pmb{A}^n=\\pmb{P}\\mathrm{diag}(1,(-2)^n)\\pmb{P}^{-1}=\\begin{pmatrix}1&1\\\\1&2\\end{pmatrix}\\begin{pmatrix}1&0\\\\0&(-2)^n\\end{pmatrix}\\begin{pmatrix}2&-1\\\\-1&1\\end{pmatrix}\\)。<br>中间乘积 \\(=\\begin{pmatrix}1&(-2)^n\\\\1&2(-2)^n\\end{pmatrix}\\)，再右乘 \\(\\pmb{P}^{-1}\\)：<br>\\((1,1)\\) 元 \\(=1\\times2+(-2)^n\\times(-1)=2-(-2)^n\\)；\\((1,2)\\) 元 \\(=1\\times(-1)+(-2)^n\\times1=(-2)^n-1\\)；<br>\\((2,1)\\) 元 \\(=1\\times2+2(-2)^n\\times(-1)=2-2(-2)^n\\)；\\((2,2)\\) 元 \\(=1\\times(-1)+2(-2)^n\\times1=2(-2)^n-1\\)。' },
                    { step: 4, title: '求数列通项', content: '\\(\\begin{pmatrix}x_n\\\\y_n\\end{pmatrix}=\\pmb{A}^n\\begin{pmatrix}x_0\\\\y_0\\end{pmatrix}=\\pmb{A}^n\\begin{pmatrix}1\\\\0\\end{pmatrix}\\)，即取 \\(\\pmb{A}^n\\) 的第 1 列：<br>\\(x_n=2-(-2)^n,\\ y_n=2-2(-2)^n\\)。' }
                ],
                tips: [
                    '二阶矩阵用 \\(\\lambda^2-(\\mathrm{tr}\\pmb{A})\\lambda+\\det\\pmb{A}=0\\) 最快，避免展开二阶行列式。',
                    '求幂务必走 \\(\\pmb{A}^n=\\pmb{P}\\pmb{\\Lambda}^n\\pmb{P}^{-1}\\)，不要试图连乘 n 次找规律。'
                ],
                mistakes: [
                    '\\(\\pmb{P}\\) 的列与 \\(\\pmb{\\Lambda}\\) 的对角元顺序不对应，导致结果错乱。',
                    '算 \\(\\pmb{A}^n\\pmb{z}_0\\) 时把行列写反。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：二阶矩阵幂与一阶递推（综合计算维度），难度对标真题线代大题' }
            },
            {
                id: 'm29v2', dimension: '综合创新',
                difficulty: 4, chapter: 'ch13', chapters: ['ch13'],
                kpIds: ['XD.13.2'], kpNames: ['相似对角化'],
                question: '设 \\(\\pmb{A}=\\begin{pmatrix}1&2&2\\\\2&1&2\\\\2&2&1\\end{pmatrix}\\)。<br>（I）求正交矩阵 \\(\\pmb{Q}\\)，使 \\(\\pmb{Q}^{\\mathrm{T}}\\pmb{A}\\pmb{Q}\\) 为对角阵；<br>（II）求 \\(\\pmb{A}^n\\)；<br>（III）求 \\(\\mathrm{tr}(\\pmb{A}^{100})\\)。',
                options: [],
                answer: '（I）特征值为 \\(5,-1,-1\\)；\\(\\lambda=5\\) 对应单位向量 \\(\\dfrac1{\\sqrt3}(1,1,1)^{\\mathrm{T}}\\)，\\(\\lambda=-1\\) 对应 \\(\\dfrac1{\\sqrt2}(1,-1,0)^{\\mathrm{T}}\\) 与 \\(\\dfrac1{\\sqrt6}(1,1,-2)^{\\mathrm{T}}\\)；（II）\\(\\pmb{A}^n=\\dfrac{5^n-(-1)^n}{3}\\pmb{J}+(-1)^n\\pmb{E}\\)（\\(\\pmb{J}\\) 为全 1 矩阵）；（III）\\(\\mathrm{tr}(\\pmb{A}^{100})=5^{100}+2\\)。',
                concepts: [
                    { name: '实对称矩阵正交对角化', note: '实对称矩阵必可正交对角化；不同特征值的特征向量自动正交，同一（重）特征值的多个特征向量需先施密特正交化再单位化。' },
                    { name: '谱分解', note: '\\(\\pmb{A}=\\lambda_1\\pmb{P}_1+\\lambda_2\\pmb{P}_2+\\cdots\\)，其中 \\(\\pmb{P}_i\\) 是到特征子空间的正交投影。本题 \\(\\pmb{A}=5\\cdot\\dfrac{\\pmb{J}}{3}+(-1)\\left(\\pmb{E}-\\dfrac{\\pmb{J}}{3}\\right)\\)。' },
                    { name: '矩阵幂与迹', note: '\\(\\mathrm{tr}(\\pmb{A}^n)=\\sum_i\\lambda_i^n\\)，可直接由特征值求出，无需展开 \\(\\pmb{A}^n\\)。' }
                ],
                solution: [
                    { step: 1, title: '看结构定特征值', content: '\\(\\pmb{A}\\) 的对角元全为 1、非对角元全为 2，可写 \\(\\pmb{A}=2\\pmb{J}-\\pmb{E}\\)（\\(\\pmb{J}\\) 为全 1 矩阵）。<br>\\(\\pmb{J}\\) 的特征值为 \\(3\\)（对应 \\((1,1,1)^{\\mathrm{T}}\\)）与 \\(0\\)（二重，对应 \\(x_1+x_2+x_3=0\\)）。<br>故 \\(\\pmb{A}\\) 的特征值为 \\(2\\times3-1=5\\) 与 \\(2\\times0-1=-1\\)（二重）。' },
                    { step: 2, title: '求特征向量并单位化', content: '\\(\\lambda=5\\)：特征向量取 \\((1,1,1)^{\\mathrm{T}}\\)，模长 \\(\\sqrt3\\)，单位化 \\(\\pmb{q}_1=\\dfrac1{\\sqrt3}(1,1,1)^{\\mathrm{T}}\\)。<br>\\(\\lambda=-1\\)：解 \\(x_1+x_2+x_3=0\\)，取 \\(\\pmb{\\eta}_2=(1,-1,0)^{\\mathrm{T}}\\) 与 \\(\\pmb{\\eta}_3=(1,1,-2)^{\\mathrm{T}}\\)；二者内积 \\(1\\times1+(-1)\\times1+0\\times(-2)=0\\)，已正交。<br>单位化：\\(\\pmb{q}_2=\\dfrac1{\\sqrt2}(1,-1,0)^{\\mathrm{T}}\\)，\\(\\pmb{q}_3=\\dfrac1{\\sqrt6}(1,1,-2)^{\\mathrm{T}}\\)。' },
                    { step: 3, title: '拼 \\(\\pmb{Q}\\)', content: '\\(\\pmb{Q}=(\\pmb{q}_1,\\pmb{q}_2,\\pmb{q}_3)=\\begin{pmatrix}\\frac1{\\sqrt3}&\\frac1{\\sqrt2}&\\frac1{\\sqrt6}\\\\\\frac1{\\sqrt3}&-\\frac1{\\sqrt2}&\\frac1{\\sqrt6}\\\\\\frac1{\\sqrt3}&0&-\\frac2{\\sqrt6}\\end{pmatrix}\\)，则 \\(\\pmb{Q}^{\\mathrm{T}}\\pmb{A}\\pmb{Q}=\\mathrm{diag}(5,-1,-1)\\)。' },
                    { step: 4, title: '用谱分解求 \\(\\pmb{A}^n\\)', content: '由 \\(\\pmb{A}^n=\\pmb{Q}\\mathrm{diag}(5^n,(-1)^n,(-1)^n)\\pmb{Q}^{\\mathrm{T}}\\)。注意 \\(\\dfrac{\\pmb{J}}{3}\\) 是到 \\((1,1,1)\\) 方向的投影，\\(\\pmb{E}-\\dfrac{\\pmb{J}}{3}\\) 是到其正交补的投影，二者在特征基下对角，故<br>\\(\\pmb{A}^n=5^n\\cdot\\dfrac{\\pmb{J}}{3}+(-1)^n\\left(\\pmb{E}-\\dfrac{\\pmb{J}}{3}\\right)=\\dfrac{5^n-(-1)^n}{3}\\pmb{J}+(-1)^n\\pmb{E}\\)。<br>（即每个元素为 \\(\\dfrac{5^n-(-1)^n}{3}\\)，主对角元再额外加 \\((-1)^n\\)。）' },
                    { step: 5, title: '求迹', content: '方法一：\\(\\mathrm{tr}(\\pmb{A}^n)=\\sum_i\\lambda_i^n=5^n+(-1)^n+(-1)^n=5^n+2(-1)^n\\)，故 \\(\\mathrm{tr}(\\pmb{A}^{100})=5^{100}+2(-1)^{100}=5^{100}+2\\)。<br>方法二（核验）：由步骤 4，\\(\\mathrm{tr}\\,\\pmb{J}=3\\)、\\(\\mathrm{tr}\\,\\pmb{E}=3\\)，\\(\\mathrm{tr}(\\pmb{A}^n)=\\dfrac{5^n-(-1)^n}{3}\\times3+(-1)^n\\times3=5^n+2(-1)^n\\)，一致。' }
                ],
                tips: [
                    '遇到「对角元全同、非对角元全同」的矩阵，优先写成 \\(a\\pmb{E}+b\\pmb{J}\\)，用 \\(\\pmb{J}\\) 的两类特征值秒杀。',
                    '实对称矩阵正交对角化时，同一重特征值下的多个特征向量必须先正交化再单位化。'
                ],
                mistakes: [
                    '\\(\\lambda=-1\\) 是二重根，直接取两个只线性无关却不正交的向量拼 \\(\\pmb{Q}\\)，导致 \\(\\pmb{Q}\\) 不正交。',
                    '把 \\(\\mathrm{tr}(\\pmb{A}^{100})\\) 误算成 \\(5^{100}-1-1\\)，忽略 \\(n\\) 的奇偶。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：\\(a\\pmb{E}+b\\pmb{J}\\) 型矩阵的谱分解与幂（综合创新维度）' }
            }
        ]
    },

    /* ==================================================================
     * m30 · 线代/解答题 · 含参方程组与秩综合
     * 向量组线性表示 → 非齐次解的判定 → 基础解系与通解 → 秩的关系
     * ================================================================== */
    {
        id: 'm30',
        part: '线代',
        type: '解答题',
        score: 12,
        topic: '含参线性方程组与向量组秩综合',
        difficulty: 4,
        chapter: 'ch11',
        chapters: ['ch11', 'ch12'],
        chain: '向量组线性表示 → 非齐次方程组解的判定 → 基础解系与通解 → 秩的关系',
        kpIds: ['XD.12.1', 'XD.11.2'],
        kpNames: ['线性方程组', '线性表示'],
        predict: {
            heat: 5,
            trend: '方程组与向量组连年在选填与大题出现，2023/2024 连续考「解的结构 + 线性表示」',
            years: [2025, 2024, 2023, 2019, 2018, 2017, 2016],
            advice: '一切先化行阶梯形定秩；讨论参数时分 r(A) 与 r(A|b) 两类情况写全'
        },
        question: '设向量组 \\(\\pmb{\\alpha}_1=(1,1,a)^{\\mathrm{T}},\\pmb{\\alpha}_2=(1,a,1)^{\\mathrm{T}},\\pmb{\\alpha}_3=(a,1,1)^{\\mathrm{T}}\\)，\\(\\pmb{\\beta}=(1,1,1)^{\\mathrm{T}}\\)，记 \\(\\pmb{A}=(\\pmb{\\alpha}_1,\\pmb{\\alpha}_2,\\pmb{\\alpha}_3)\\)。<br>（I）讨论常数 \\(a\\) 取何值时，\\(\\pmb{\\beta}\\) 可由 \\(\\pmb{\\alpha}_1,\\pmb{\\alpha}_2,\\pmb{\\alpha}_3\\) 唯一线性表示、有无穷多种表示、不能表示；<br>（II）在可表示时求出线性表示式（\\(a=1\\) 时写出全部表示）；<br>（III）求 \\(\\pmb{A}\\) 的秩 \\(r(\\pmb{A})\\) 随 \\(a\\) 的取值，并说明（I）中的三种情形如何由 \\(r(\\pmb{A})\\) 与 \\(r(\\pmb{A},\\pmb{\\beta})\\) 的关系决定。',
        options: [],
        answer: '（I）当 \\(a\\ne1\\) 且 \\(a\\ne-2\\) 时唯一表示；\\(a=1\\) 时无穷多种表示；\\(a=-2\\) 时不能表示。<br>（II）唯一时 \\(\\pmb{\\beta}=\\dfrac1{a+2}(\\pmb{\\alpha}_1+\\pmb{\\alpha}_2+\\pmb{\\alpha}_3)\\)；\\(a=1\\) 时 \\(\\pmb{\\alpha}_1=\\pmb{\\alpha}_2=\\pmb{\\alpha}_3=\\pmb{\\beta}\\)，全部表示为 \\(\\pmb{\\beta}=x_1\\pmb{\\alpha}_1+x_2\\pmb{\\alpha}_2+x_3\\pmb{\\alpha}_3\\)（\\(x_1+x_2+x_3=1\\)）。<br>（III）\\(a\\ne1\\) 且 \\(a\\ne-2\\) 时 \\(r(\\pmb{A})=3\\)；\\(a=-2\\) 时 \\(r(\\pmb{A})=2\\)；\\(a=1\\) 时 \\(r(\\pmb{A})=1\\)。唯一表示 \\(\\iff r(\\pmb{A})=r(\\pmb{A},\\pmb{\\beta})=3\\)；无穷多 \\(\\iff r(\\pmb{A})=r(\\pmb{A},\\pmb{\\beta})<3\\)；不能表示 \\(\\iff r(\\pmb{A})<r(\\pmb{A},\\pmb{\\beta})\\)。',
        concepts: [
            { name: '线性表示与方程组', note: '\\(\\pmb{\\beta}\\) 可由 \\(\\pmb{\\alpha}_1,\\pmb{\\alpha}_2,\\pmb{\\alpha}_3\\) 线性表示 \\(\\iff\\) 方程组 \\(\\pmb{A}\\pmb{x}=\\pmb{\\beta}\\) 有解 \\(\\iff r(\\pmb{A})=r(\\pmb{A},\\pmb{\\beta})\\)。' },
            { name: '解的判定定理', note: '对 n 元方程组：唯一解 \\(\\iff r(\\pmb{A})=r(\\pmb{A},\\pmb{\\beta})=n\\)；无穷多解 \\(\\iff r(\\pmb{A})=r(\\pmb{A},\\pmb{\\beta})<n\\)；无解 \\(\\iff r(\\pmb{A})<r(\\pmb{A},\\pmb{\\beta})\\)。本题 n=3。' },
            { name: '行列式判满秩', note: '\\(r(\\pmb{A})=3\\iff\\det\\pmb{A}\\ne0\\)（三列线性无关）。本题 \\(\\det\\pmb{A}=-(a-1)^2(a+2)\\)。' },
            { name: '基础解系个数', note: '当 \\(r(\\pmb{A})=r\\) 时，齐次方程组 \\(\\pmb{A}\\pmb{x}=\\pmb{0}\\) 的基础解系含 \\(3-r\\) 个向量，非齐次通解 = 特解 + 齐次通解。' }
        ],
        solution: [
            { step: 1, title: '算系数矩阵的行列式', content: '\\(\\det\\pmb{A}=\\begin{vmatrix}1&1&a\\\\1&a&1\\\\a&1&1\\end{vmatrix}\\)。按第一行展开：<br>\\(=1\\cdot\\begin{vmatrix}a&1\\\\1&1\\end{vmatrix}-1\\cdot\\begin{vmatrix}1&1\\\\a&1\\end{vmatrix}+a\\cdot\\begin{vmatrix}1&a\\\\a&1\\end{vmatrix}\\)<br>\\(=(a-1)-(1-a)+a(1-a^2)=2(a-1)+a-a^3=-(a^3-3a+2)\\)。<br>因式分解 \\(a^3-3a+2=(a-1)^2(a+2)\\)，故 \\(\\det\\pmb{A}=-(a-1)^2(a+2)\\)。' },
            { step: 2, title: '分类：\\(a\\ne1,-2\\) 时唯一解', content: '\\(\\det\\pmb{A}=0\\iff a=1\\) 或 \\(a=-2\\)。<br>当 \\(a\\ne1\\) 且 \\(a\\ne-2\\) 时 \\(\\det\\pmb{A}\\ne0\\)，\\(r(\\pmb{A})=3=r(\\pmb{A},\\pmb{\\beta})\\)，方程组 \\(\\pmb{A}\\pmb{x}=\\pmb{\\beta}\\) 有唯一解，即 \\(\\pmb{\\beta}\\) 可由三列唯一线性表示。' },
            { step: 3, title: '解出唯一表示式', content: '三列地位对称，试探 \\(x_1=x_2=x_3=t\\)。代入 \\(\\pmb{A}\\pmb{x}=\\pmb{\\beta}\\)，每个方程左端都是 \\((1+1+a)t=(a+2)t\\)，右端为 1，故 \\((a+2)t=1\\)，\\(t=\\dfrac1{a+2}\\)。<br>即 \\(\\pmb{\\beta}=\\dfrac1{a+2}(\\pmb{\\alpha}_1+\\pmb{\\alpha}_2+\\pmb{\\alpha}_3)\\)。（唯一性由 \\(r(\\pmb{A})=3\\) 保证，此解即唯一解。）' },
            { step: 4, title: '\\(a=1\\) 时求全部表示', content: '\\(a=1\\) 时 \\(\\pmb{\\alpha}_1=\\pmb{\\alpha}_2=\\pmb{\\alpha}_3=\\pmb{\\beta}=(1,1,1)^{\\mathrm{T}}\\)，\\(\\pmb{A}\\) 三列相同，\\(r(\\pmb{A})=1\\)。<br>方程组 \\(\\pmb{A}\\pmb{x}=\\pmb{\\beta}\\) 化为 \\((x_1+x_2+x_3)(1,1,1)^{\\mathrm{T}}=(1,1,1)^{\\mathrm{T}}\\)，即 \\(x_1+x_2+x_3=1\\)。<br>对应齐次方程 \\(x_1+x_2+x_3=0\\) 的基础解系为 \\((-1,1,0)^{\\mathrm{T}},(-1,0,1)^{\\mathrm{T}}\\)，一个特解为 \\((1,0,0)^{\\mathrm{T}}\\)。<br>故 \\(\\pmb{x}=(1,0,0)^{\\mathrm{T}}+c_1(-1,1,0)^{\\mathrm{T}}+c_2(-1,0,1)^{\\mathrm{T}}\\)，即 \\(x_1=1-c_1-c_2,\\ x_2=c_1,\\ x_3=c_2\\)，\\(c_1,c_2\\) 任意。\\(r(\\pmb{A})=r(\\pmb{A},\\pmb{\\beta})=1<3\\)，无穷多解。' },
            { step: 5, title: '\\(a=-2\\) 时判定无解', content: '\\(a=-2\\) 时 \\(\\pmb{A}=\\begin{pmatrix}1&1&-2\\\\1&-2&1\\\\-2&1&1\\end{pmatrix}\\)，三行之和为零向量，故 \\(r(\\pmb{A})\\le2\\)；又第 1、2 行不成比例，\\(r(\\pmb{A})=2\\)。<br>考察增广矩阵 \\((\\pmb{A},\\pmb{\\beta})\\)：三行相加得 \\((0,0,0\\,|\\,3)\\)，出现矛盾方程 \\(0=3\\)，故 \\(r(\\pmb{A},\\pmb{\\beta})=3>2=r(\\pmb{A})\\)，方程组无解，\\(\\pmb{\\beta}\\) 不能表示。' },
            { step: 6, title: '汇总秩与解的关系', content: '（i）\\(a\\ne1,-2\\)：\\(r(\\pmb{A})=r(\\pmb{A},\\pmb{\\beta})=3\\)，且等于未知量个数 3，唯一解（唯一表示）；<br>（ii）\\(a=1\\)：\\(r(\\pmb{A})=r(\\pmb{A},\\pmb{\\beta})=1<3\\)，无穷多解（无穷多表示）；<br>（iii）\\(a=-2\\)：\\(r(\\pmb{A})=2<r(\\pmb{A},\\pmb{\\beta})=3\\)，无解（不能表示）。<br>这正是非齐次方程组解的判定定理的两秩比较。' }
        ],
        tips: [
            '见到「\\(\\pmb{\\beta}\\) 能否由向量组表示」立即转成 \\(\\pmb{A}\\pmb{x}=\\pmb{\\beta}\\) 的解的判定，比较 \\(r(\\pmb{A})\\) 与 \\(r(\\pmb{A},\\pmb{\\beta})\\)。',
            '本题三列地位对称，先试 \\(x_1=x_2=x_3\\) 可秒得唯一解，再补全分类讨论。'
        ],
        mistakes: [
            '只讨论 \\(\\det\\pmb{A}=0\\) 而不分类 \\(r(\\pmb{A})\\) 与 \\(r(\\pmb{A},\\pmb{\\beta})\\)，漏掉 \\(a=-2\\) 无解与 \\(a=1\\) 无穷多解的区分。',
            '\\(\\det\\pmb{A}=-(a-1)^2(a+2)\\) 中 \\((a-1)^2\\) 是二重因子，应作为一个参数值 \\(a=1\\) 处理，不要拆成两个根。'
        ],
        source: { rank: 1, label: '真题', detail: '改编自 2024 年数学一「解的结构 + 线性表示」题，参数方程组骨架取经典真题模型' },
        variants: [
            {
                id: 'm30v1', dimension: '综合计算',
                difficulty: 4, chapter: 'ch11', chapters: ['ch11', 'ch12'],
                kpIds: ['XD.12.2'], kpNames: ['齐次方程组'],
                question: '设齐次线性方程组 \\(\\begin{cases}x_1+x_2+x_3=0\\\\ x_1+2x_2+ax_3=0\\\\ x_1+4x_2+a^2x_3=0\\end{cases}\\)。<br>（I）求 \\(a\\) 取何值时方程组有非零解；<br>（II）对每个这样的 \\(a\\)，求方程组的一个基础解系；<br>（III）写出全部解。',
                options: [],
                answer: '（I）系数行列式 \\(=(a-1)(a-2)\\)，故 \\(a=1\\) 或 \\(a=2\\) 时有非零解；（II）\\(a=1\\) 时基础解系 \\(\\{(-1,0,1)^{\\mathrm{T}}\\}\\)，\\(a=2\\) 时基础解系 \\(\\{(0,-1,1)^{\\mathrm{T}}\\}\\)；（III）\\(a=1\\)：\\(\\pmb{x}=c(-1,0,1)^{\\mathrm{T}}\\)；\\(a=2\\)：\\(\\pmb{x}=c(0,-1,1)^{\\mathrm{T}}\\)（\\(c\\in\\mathbb{R}\\)）。',
                concepts: [
                    { name: '齐次方程组有非零解', note: 'n 元齐次方程组 \\(\\pmb{A}\\pmb{x}=\\pmb{0}\\) 有非零解 \\(\\iff r(\\pmb{A})<n\\)；对本题方阵 \\(\\iff\\det\\pmb{A}=0\\)。' },
                    { name: '基础解系', note: '基础解系含 \\(n-r(\\pmb{A})\\) 个线性无关解向量，全部解是它们的线性组合。' },
                    { name: 'Vandermonde 行列式', note: '\\(\\begin{vmatrix}1&1&1\\\\1&2&4\\\\1&a&a^2\\end{vmatrix}=(2-1)(a-1)(a-2)\\)。' }
                ],
                solution: [
                    { step: 1, title: '计算系数行列式', content: '系数矩阵的转置不改变行列式值：<br>\\(\\det\\pmb{A}=\\begin{vmatrix}1&1&1\\\\1&2&a\\\\1&4&a^2\\end{vmatrix}=\\begin{vmatrix}1&1&1\\\\1&2&4\\\\1&a&a^2\\end{vmatrix}\\)。<br>右式为以 \\(1,2,a\\) 为节点的 Vandermonde 行列式，故 \\(=(2-1)(a-1)(a-2)=(a-1)(a-2)\\)。' },
                    { step: 2, title: '\\(a=1\\) 的基础解系', content: '\\(a=1\\) 时方程组为 \\(x_1+x_2+x_3=0\\)，\\(x_1+2x_2+x_3=0\\)，\\(x_1+4x_2+x_3=0\\)。<br>第 2 式减第 1 式得 \\(x_2=0\\)；代回第 1 式得 \\(x_1+x_3=0\\)，即 \\(x_3=-x_1\\)。<br>故 \\(\\pmb{x}=x_1(1,0,-1)^{\\mathrm{T}}\\)，基础解系取 \\(\\{(-1,0,1)^{\\mathrm{T}}\\}\\)。' },
                    { step: 3, title: '\\(a=2\\) 的基础解系', content: '\\(a=2\\) 时方程组为 \\(x_1+x_2+x_3=0\\)，\\(x_1+2x_2+2x_3=0\\)，\\(x_1+4x_2+4x_3=0\\)。<br>第 2 式减第 1 式得 \\(x_2+x_3=0\\)，即 \\(x_2=-x_3\\)；代入第 1 式得 \\(x_1-x_3+x_3=0\\)，即 \\(x_1=0\\)。<br>故 \\(\\pmb{x}=x_3(0,-1,1)^{\\mathrm{T}}\\)，基础解系取 \\(\\{(0,-1,1)^{\\mathrm{T}}\\}\\)。' },
                    { step: 4, title: '写出全部解', content: '\\(a=1\\) 时 \\(\\pmb{x}=c(-1,0,1)^{\\mathrm{T}}\\)；\\(a=2\\) 时 \\(\\pmb{x}=c(0,-1,1)^{\\mathrm{T}}\\)，其中 \\(c\\in\\mathbb{R}\\)。' }
                ],
                tips: [
                    '含参齐次方程组先令 \\(\\det\\pmb{A}=0\\) 定参数，再逐个代入回代求解，不要一上来就做繁琐行变换。',
                    '本题系数矩阵的列恰为 \\((1,x,x^2)\\) 结构，识别为 Vandermonde 可秒算行列式。'
                ],
                mistakes: [
                    '把 Vandermonde 的节点顺序弄错，导致漏根或多根。',
                    '求出解向量后忘记注明 \\(c\\) 为任意常数（即忘记说明基础解系只含一个向量）。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：Vandermonde 结构齐次方程组的基础解系（综合计算维度）' }
            },
            {
                id: 'm30v2', dimension: '综合创新',
                difficulty: 4, chapter: 'ch12', chapters: ['ch11', 'ch12'],
                kpIds: ['XD.12.3', 'XD.11.2'], kpNames: ['非齐次', '线性表示'],
                question: '设 \\(\\pmb{\\alpha}_1,\\pmb{\\alpha}_2,\\pmb{\\alpha}_3\\) 是 3 阶矩阵 \\(\\pmb{A}\\) 的三个列向量，\\(\\pmb{\\beta}=(1,2,3)^{\\mathrm{T}}\\)。已知非齐次方程组 \\(\\pmb{A}\\pmb{x}=\\pmb{\\beta}\\) 的通解为 \\(\\pmb{x}=(1,0,0)^{\\mathrm{T}}+c(1,-1,1)^{\\mathrm{T}}\\)（\\(c\\in\\mathbb{R}\\)）。<br>（I）求 \\(r(\\pmb{A})\\) 与向量组 \\(\\pmb{\\alpha}_1,\\pmb{\\alpha}_2,\\pmb{\\alpha}_3\\) 的秩；<br>（II）用 \\(\\pmb{\\alpha}_1,\\pmb{\\alpha}_2,\\pmb{\\alpha}_3\\) 线性表示 \\(\\pmb{\\beta}\\)，并写出三者之间的一个线性关系；<br>（III）说明 \\(\\pmb{\\beta}\\) 的线性表示是否唯一，若不唯一写出一般表达式。',
                options: [],
                answer: '（I）基础解系含 1 个向量，故 \\(r(\\pmb{A})=3-1=2\\)，向量组秩也为 2；（II）\\(\\pmb{\\beta}=\\pmb{\\alpha}_1\\)，且 \\(\\pmb{\\alpha}_1-\\pmb{\\alpha}_2+\\pmb{\\alpha}_3=\\pmb{0}\\)；（III）不唯一，一般表示 \\(\\pmb{\\beta}=(1+c)\\pmb{\\alpha}_1-c\\pmb{\\alpha}_2+c\\pmb{\\alpha}_3\\)（\\(c\\in\\mathbb{R}\\)）。',
                concepts: [
                    { name: '解的结构', note: '非齐次通解 \\(=\\) 一个特解 \\(+\\) 对应齐次方程组的通解；齐次解向量满足 \\(\\pmb{A}\\pmb{\\xi}=\\pmb{0}\\)。' },
                    { name: '秩与基础解系个数', note: 'n 元方程组：基础解系含 \\(n-r(\\pmb{A})\\) 个向量。本题 \\(n=3\\)，自由参数 1 个，故 \\(r(\\pmb{A})=2\\)。' },
                    { name: '矩阵乘向量的列组合意义', note: '\\(\\pmb{A}\\pmb{x}=x_1\\pmb{\\alpha}_1+x_2\\pmb{\\alpha}_2+x_3\\pmb{\\alpha}_3\\)，即左乘 \\(\\pmb{x}\\) 是对 \\(\\pmb{A}\\) 的列向量做线性组合。' }
                ],
                solution: [
                    { step: 1, title: '由通解结构定秩', content: '通解含 1 个自由参数 \\(c\\)，说明对应齐次方程组 \\(\\pmb{A}\\pmb{x}=\\pmb{0}\\) 的基础解系只含 1 个向量。<br>由 \\(3-r(\\pmb{A})=1\\) 得 \\(r(\\pmb{A})=2\\)；而向量组 \\(\\pmb{\\alpha}_1,\\pmb{\\alpha}_2,\\pmb{\\alpha}_3\\) 的秩就是 \\(r(\\pmb{A})\\)，也为 2。' },
                    { step: 2, title: '用特解表示 \\(\\pmb{\\beta}\\)', content: '特解 \\(\\pmb{x}_0=(1,0,0)^{\\mathrm{T}}\\) 满足 \\(\\pmb{A}\\pmb{x}_0=\\pmb{\\beta}\\)。按列组合展开：<br>\\(\\pmb{\\beta}=\\pmb{A}\\begin{pmatrix}1\\\\0\\\\0\\end{pmatrix}=1\\cdot\\pmb{\\alpha}_1+0\\cdot\\pmb{\\alpha}_2+0\\cdot\\pmb{\\alpha}_3=\\pmb{\\alpha}_1\\)。' },
                    { step: 3, title: '用齐次解找线性关系', content: '齐次解 \\(\\pmb{\\xi}=(1,-1,1)^{\\mathrm{T}}\\) 满足 \\(\\pmb{A}\\pmb{\\xi}=\\pmb{0}\\)，即<br>\\(\\pmb{A}\\begin{pmatrix}1\\\\-1\\\\1\\end{pmatrix}=1\\cdot\\pmb{\\alpha}_1-1\\cdot\\pmb{\\alpha}_2+1\\cdot\\pmb{\\alpha}_3=\\pmb{0}\\)，<br>故 \\(\\pmb{\\alpha}_1-\\pmb{\\alpha}_2+\\pmb{\\alpha}_3=\\pmb{0}\\)，三列线性相关（与 \\(r(\\pmb{A})=2\\) 一致）。' },
                    { step: 4, title: '说明表示不唯一并给出通式', content: '\\(\\pmb{\\beta}\\) 的任一表示 \\(\\pmb{x}\\) 都满足 \\(\\pmb{A}\\pmb{x}=\\pmb{\\beta}\\)，故表示向量组正是通解 \\((1,0,0)^{\\mathrm{T}}+c(1,-1,1)^{\\mathrm{T}}=(1+c,-c,c)^{\\mathrm{T}}\\)。<br>故 \\(\\pmb{\\beta}=(1+c)\\pmb{\\alpha}_1-c\\pmb{\\alpha}_2+c\\pmb{\\alpha}_3\\)，\\(c\\) 任意。<br>因三列线性相关（\\(\\pmb{\\alpha}_1-\\pmb{\\alpha}_2+\\pmb{\\alpha}_3=\\pmb{0}\\)），表示不唯一。' }
                ],
                tips: [
                    '已知通解反推秩是常考的「逆向题」：自由参数个数 \\(=n-r(\\pmb{A})\\)。',
                    '特解对应 \\(\\pmb{\\beta}\\) 的一种表示，齐次解对应列向量间的一个线性关系，两者配合即得全部表示。'
                ],
                mistakes: [
                    '把非齐次通解 \\((1,0,0)^{\\mathrm{T}}+c(1,-1,1)^{\\mathrm{T}}\\) 误当成齐次通解，漏掉特解 \\((1,0,0)^{\\mathrm{T}}\\) 对应 \\(\\pmb{\\beta}=\\pmb{\\alpha}_1\\)。',
                    '由 \\(r(\\pmb{A})=2\\) 直接断言任两个列向量都线性无关；秩为 2 只说三列张成一个 2 维空间。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：由通解结构反推秩与列向量线性关系（综合创新维度）' }
            }
        ]
    },

    /* ==================================================================
     * m31 · 线代/解答题 · 二次型综合
     * 二次型矩阵 → 正交变换化标准形 → 规范形/正定 → 约束最值
     * ================================================================== */
    {
        id: 'm31',
        part: '线代',
        type: '解答题',
        score: 12,
        topic: '二次型综合（正交变换 · 规范形 · 正定 · 约束最值）',
        difficulty: 4,
        chapter: 'ch14',
        chapters: ['ch14'],
        chain: '二次型矩阵 → 特征值与特征向量 → 正交变换化标准形 → 规范形/正定性 → 约束最值',
        kpIds: ['XD.14.1', 'XD.14.2', 'XD.14.3'],
        kpNames: ['二次型', '正交变换', '正定'],
        predict: {
            heat: 5,
            trend: '二次型是线代大题的第一大户，近 11 年覆盖 9 年，常与特征值、正定性、最值捆绑',
            years: [2026, 2025, 2023, 2021, 2020, 2019, 2018, 2017, 2016],
            advice: '正交变换三步：求特征值 → 每个特征向量单位化 → 按列拼成 Q；写标准形时特征值顺序可自定，但要与 Q 的列对应'
        },
        question: '已知二次型 \\(f(x_1,x_2,x_3)=2x_1^2+2x_2^2+2x_3^2+2x_1x_2+2x_2x_3\\)。<br>（I）写出 \\(f\\) 的矩阵 \\(\\pmb{A}\\)，求 \\(\\pmb{A}\\) 的全部特征值与特征向量；<br>（II）求正交矩阵 \\(\\pmb{Q}\\)，作正交变换 \\(\\pmb{x}=\\pmb{Q}\\pmb{y}\\) 将 \\(f\\) 化为标准形，写出标准形；<br>（III）写出 \\(f\\) 的规范形，判断 \\(f\\) 是否正定，并求 \\(f\\) 在约束 \\(x_1^2+x_2^2+x_3^2=1\\) 下的最大值与最小值。',
        options: [],
        answer: '（I）\\(\\pmb{A}=\\begin{pmatrix}2&1&0\\\\1&2&1\\\\0&1&2\\end{pmatrix}\\)，特征值 \\(2+\\sqrt2,\\ 2,\\ 2-\\sqrt2\\)，特征向量分别取 \\((1,\\sqrt2,1)^{\\mathrm{T}},\\ (1,0,-1)^{\\mathrm{T}},\\ (1,-\\sqrt2,1)^{\\mathrm{T}}\\)；<br>（II）\\(\\pmb{Q}=\\begin{pmatrix}\\frac12&\\frac1{\\sqrt2}&\\frac12\\\\\\frac{\\sqrt2}{2}&0&-\\frac{\\sqrt2}{2}\\\\\\frac12&-\\frac1{\\sqrt2}&\\frac12\\end{pmatrix}\\)，标准形 \\((2+\\sqrt2)y_1^2+2y_2^2+(2-\\sqrt2)y_3^2\\)；<br>（III）规范形 \\(y_1^2+y_2^2+y_3^2\\)，\\(f\\) 正定；最大值 \\(2+\\sqrt2\\)，在 \\(\\pmb{x}=\\pm\\dfrac12(1,\\sqrt2,1)^{\\mathrm{T}}\\) 处取到，最小值 \\(2-\\sqrt2\\)，在 \\(\\pmb{x}=\\pm\\dfrac12(1,-\\sqrt2,1)^{\\mathrm{T}}\\) 处取到。',
        concepts: [
            { name: '二次型矩阵', note: '\\(f=\\pmb{x}^{\\mathrm{T}}\\pmb{A}\\pmb{x}\\)，\\(\\pmb{A}\\) 对称，\\(a_{ii}\\) 为 \\(x_i^2\\) 系数，\\(a_{ij}\\ (i\\ne j)\\) 取 \\(x_ix_j\\) 系数的一半。本题 \\(a_{12}=a_{21}=1,a_{23}=a_{32}=1,a_{13}=a_{31}=0\\)。' },
            { name: '正交变换法', note: '实对称矩阵 \\(\\pmb{A}\\) 存在正交矩阵 \\(\\pmb{Q}\\) 使 \\(\\pmb{Q}^{\\mathrm{T}}\\pmb{A}\\pmb{Q}=\\mathrm{diag}(\\lambda_1,\\lambda_2,\\lambda_3)\\)；令 \\(\\pmb{x}=\\pmb{Q}\\pmb{y}\\) 即把 \\(f\\) 化为标准形 \\(\\lambda_1y_1^2+\\lambda_2y_2^2+\\lambda_3y_3^2\\)。' },
            { name: '正定判定', note: '\\(f\\) 正定 \\(\\iff\\) \\(\\pmb{A}\\) 的所有特征值 \\(>0\\)（等价于所有顺序主子式 \\(>0\\)）；正定时规范形为 \\(y_1^2+y_2^2+y_3^2\\)。' },
            { name: '约束最值', note: '正交变换保持长度；\\(\\|\\pmb{x}\\|=1\\) 时 \\(f=\\sum\\lambda_iy_i^2\\)，\\(\\sum y_i^2=1\\)，故最大值 \\(=\\max\\lambda_i\\)、最小值 \\(=\\min\\lambda_i\\)。' }
        ],
        solution: [
            { step: 1, title: '写出二次型矩阵', content: '对角元取 \\(x_i^2\\) 的系数 \\(2,2,2\\)；交叉项 \\(2x_1x_2\\) 拆分得 \\(a_{12}=a_{21}=1\\)；\\(2x_2x_3\\) 得 \\(a_{23}=a_{32}=1\\)；无 \\(x_1x_3\\) 项故 \\(a_{13}=a_{31}=0\\)。<br>\\(\\pmb{A}=\\begin{pmatrix}2&1&0\\\\1&2&1\\\\0&1&2\\end{pmatrix}\\)。' },
            { step: 2, title: '求特征值（特征方程）', content: '\\(\\det(\\lambda\\pmb{E}-\\pmb{A})=\\begin{vmatrix}\\lambda-2&-1&0\\\\-1&\\lambda-2&-1\\\\0&-1&\\lambda-2\\end{vmatrix}\\)。按第一行展开：<br>\\(=(\\lambda-2)\\begin{vmatrix}\\lambda-2&-1\\\\-1&\\lambda-2\\end{vmatrix}-(-1)\\begin{vmatrix}-1&-1\\\\0&\\lambda-2\\end{vmatrix}\\)<br>\\(=(\\lambda-2)\\big[(\\lambda-2)^2-1\\big]+\\big[-(\\lambda-2)\\big]=(\\lambda-2)\\big[(\\lambda-2)^2-2\\big]\\)。<br>令其为 0：\\(\\lambda=2\\) 或 \\((\\lambda-2)^2=2\\)，即 \\(\\lambda=2\\pm\\sqrt2\\)。<br>故 \\(\\lambda_1=2+\\sqrt2,\\ \\lambda_2=2,\\ \\lambda_3=2-\\sqrt2\\)。' },
            { step: 3, title: '求 \\(\\lambda_1=2+\\sqrt2\\) 的特征向量', content: '设 \\(k=\\sqrt2\\)。由第 1 式 \\((2-\\lambda_1)x_1+x_2=0\\) 得 \\(x_2=(\\lambda_1-2)x_1=kx_1\\)。<br>由第 2 式 \\(x_1+(2-\\lambda_1)x_2+x_3=0\\)：\\(x_1+k\\cdot(-k)x_1+x_3=0\\)，即 \\(x_1(1-k^2)+x_3=0\\)，因 \\(k^2=2\\) 得 \\(-x_1+x_3=0\\)，故 \\(x_3=x_1\\)。<br>取 \\(\\pmb{\\xi}_1=(1,k,1)^{\\mathrm{T}}=(1,\\sqrt2,1)^{\\mathrm{T}}\\)，模长 \\(\\sqrt{1+2+1}=2\\)，单位化 \\(\\pmb{q}_1=\\dfrac12(1,\\sqrt2,1)^{\\mathrm{T}}\\)。' },
            { step: 4, title: '求 \\(\\lambda_2=2\\) 的特征向量', content: '\\(\\pmb{A}-2\\pmb{E}=\\begin{pmatrix}0&1&0\\\\1&0&1\\\\0&1&0\\end{pmatrix}\\)，对应 \\(x_2=0\\) 与 \\(x_1+x_3=0\\)，即 \\(x_2=0,x_3=-x_1\\)。<br>取 \\(\\pmb{\\xi}_2=(1,0,-1)^{\\mathrm{T}}\\)，模长 \\(\\sqrt2\\)，单位化 \\(\\pmb{q}_2=\\dfrac1{\\sqrt2}(1,0,-1)^{\\mathrm{T}}\\)。' },
            { step: 5, title: '求 \\(\\lambda_3=2-\\sqrt2\\) 的特征向量', content: '同步骤 3 的算法，此时 \\(x_2=(\\lambda_3-2)x_1=-\\sqrt2\\,x_1\\)，且 \\(x_3=x_1\\)。<br>取 \\(\\pmb{\\xi}_3=(1,-\\sqrt2,1)^{\\mathrm{T}}\\)，模长 2，单位化 \\(\\pmb{q}_3=\\dfrac12(1,-\\sqrt2,1)^{\\mathrm{T}}\\)。' },
            { step: 6, title: '验证正交性', content: '\\(\\pmb{q}_1\\cdot\\pmb{q}_2=\\dfrac1{2\\sqrt2}(1\\times1+\\sqrt2\\times0+1\\times(-1))=0\\)；<br>\\(\\pmb{q}_1\\cdot\\pmb{q}_3=\\dfrac14(1\\times1+\\sqrt2\\times(-\\sqrt2)+1\\times1)=\\dfrac14(1-2+1)=0\\)；<br>\\(\\pmb{q}_2\\cdot\\pmb{q}_3=\\dfrac1{2\\sqrt2}(1\\times1+0\\times(-\\sqrt2)+(-1)\\times1)=0\\)。<br>三者两两正交且均为单位向量（本应如此，因 \\(\\pmb{A}\\) 实对称、三特征值互异）。' },
            { step: 7, title: '拼 \\(\\pmb{Q}\\) 并写标准形', content: '\\(\\pmb{Q}=(\\pmb{q}_1,\\pmb{q}_2,\\pmb{q}_3)=\\begin{pmatrix}\\frac12&\\frac1{\\sqrt2}&\\frac12\\\\\\frac{\\sqrt2}{2}&0&-\\frac{\\sqrt2}{2}\\\\\\frac12&-\\frac1{\\sqrt2}&\\frac12\\end{pmatrix}\\)。<br>令 \\(\\pmb{x}=\\pmb{Q}\\pmb{y}\\)，则 \\(f=\\pmb{x}^{\\mathrm{T}}\\pmb{A}\\pmb{x}=\\pmb{y}^{\\mathrm{T}}\\pmb{Q}^{\\mathrm{T}}\\pmb{A}\\pmb{Q}\\pmb{y}=(2+\\sqrt2)y_1^2+2y_2^2+(2-\\sqrt2)y_3^2\\)。' },
            { step: 8, title: '规范形与正定性', content: '三个特征值满足 \\(2+\\sqrt2>2>2-\\sqrt2>0\\)，全为正，故正惯性指数为 3、负惯性指数为 0，规范形为 \\(y_1^2+y_2^2+y_3^2\\)，\\(f\\) 正定。<br>（用顺序主子式核验：\\(D_1=2>0\\)，\\(D_2=\\begin{vmatrix}2&1\\\\1&2\\end{vmatrix}=3>0\\)，\\(D_3=\\det\\pmb{A}=2\\times(4-1)-1\\times(2-0)+0=4>0\\)，与正定一致。）' },
            { step: 9, title: '求约束下的最值', content: '正交变换保持长度：\\(x_1^2+x_2^2+x_3^2=\\pmb{x}^{\\mathrm{T}}\\pmb{x}=\\pmb{y}^{\\mathrm{T}}\\pmb{Q}^{\\mathrm{T}}\\pmb{Q}\\pmb{y}=\\pmb{y}^{\\mathrm{T}}\\pmb{y}=y_1^2+y_2^2+y_3^2=1\\)。<br>于是 \\(f=(2+\\sqrt2)y_1^2+2y_2^2+(2-\\sqrt2)y_3^2\\)，在 \\(y_1^2+y_2^2+y_3^2=1\\) 下是三个特征值的加权平均：<br>取 \\(y_1=\\pm1\\)、\\(y_2=y_3=0\\)，得最大值 \\((2+\\sqrt2)\\cdot1=2+\\sqrt2\\)，对应 \\(\\pmb{x}=\\pm\\pmb{q}_1=\\pm\\dfrac12(1,\\sqrt2,1)^{\\mathrm{T}}\\)；<br>取 \\(y_3=\\pm1\\)、\\(y_1=y_2=0\\)，得最小值 \\((2-\\sqrt2)\\cdot1=2-\\sqrt2\\)，对应 \\(\\pmb{x}=\\pm\\pmb{q}_3=\\pm\\dfrac12(1,-\\sqrt2,1)^{\\mathrm{T}}\\)。' }
        ],
        tips: [
            '正交变换三步固定：求特征值 → 特征向量单位化（同一重特征值多个向量先正交化） → 按列拼 \\(\\pmb{Q}\\)。',
            '标准形中特征值的排列顺序可以自定，但必须与 \\(\\pmb{Q}\\) 的列一一对应。',
            '约束 \\(\\|\\pmb{x}\\|=1\\) 下二次型的最值就是最大/最小特征值，取值点是对应的单位特征向量。'
        ],
        mistakes: [
            '把 \\(2x_1x_2\\) 的系数直接写进 \\(a_{12}\\)（应为系数的一半，即 1），矩阵写错后特征值全错。',
            '拼 \\(\\pmb{Q}\\) 时特征向量的顺序与标准形里特征值的顺序不一致，导致答案不自洽。'
        ],
        source: { rank: 1, label: '真题', detail: '改编自 2021 年数学一第 21 题（二次型正交变换），特征值含 \\(\\pm\\sqrt2\\) 的三对角矩阵为经典模型' },
        variants: [
            {
                id: 'm31v1', dimension: '综合计算',
                difficulty: 4, chapter: 'ch14', chapters: ['ch14'],
                kpIds: ['XD.14.1', 'XD.14.2'], kpNames: ['二次型', '正交变换'],
                question: '已知二次型 \\(f(x_1,x_2,x_3)=x_1^2+x_2^2+3x_3^2+4x_1x_2\\)。<br>（I）求 \\(f\\) 的矩阵 \\(\\pmb{A}\\) 的特征值与特征向量；<br>（II）求正交变换 \\(\\pmb{x}=\\pmb{Q}\\pmb{y}\\)，将 \\(f\\) 化为标准形；<br>（III）指出 \\(f\\) 是否正定，并写出规范形。',
                options: [],
                answer: '（I）\\(\\pmb{A}=\\begin{pmatrix}1&2&0\\\\2&1&0\\\\0&0&3\\end{pmatrix}\\)，特征值 \\(3,3,-1\\)；\\(\\lambda=3\\) 对应 \\((1,1,0)^{\\mathrm{T}},(0,0,1)^{\\mathrm{T}}\\)，\\(\\lambda=-1\\) 对应 \\((1,-1,0)^{\\mathrm{T}}\\)；（II）\\(\\pmb{Q}=\\begin{pmatrix}\\frac1{\\sqrt2}&0&\\frac1{\\sqrt2}\\\\\\frac1{\\sqrt2}&0&-\\frac1{\\sqrt2}\\\\0&1&0\\end{pmatrix}\\)，标准形 \\(3y_1^2+3y_2^2-y_3^2\\)；（III）不正定，规范形 \\(y_1^2+y_2^2-y_3^2\\)。',
                concepts: [
                    { name: '分块求特征值', note: '\\(\\pmb{A}=\\mathrm{diag}(\\pmb{B},3)\\)，\\(\\pmb{B}=\\begin{pmatrix}1&2\\\\2&1\\end{pmatrix}\\) 的特征值为 \\(3,-1\\)，并上右下角的 \\(3\\)，得 \\(\\pmb{A}\\) 的特征值 \\(3,3,-1\\)。' },
                    { name: '正交变换', note: '\\(\\pmb{x}=\\pmb{Q}\\pmb{y}\\) 中 \\(\\pmb{Q}\\) 正交，则 \\(f=\\sum\\lambda_iy_i^2\\)，系数即特征值。' },
                    { name: '正定判定', note: '特征值全正才正定；本例有负特征值 \\(-1\\)，故不正定，规范形中会出现负平方项。' }
                ],
                solution: [
                    { step: 1, title: '写矩阵', content: '\\(a_{11}=1,a_{22}=1,a_{33}=3\\)；\\(4x_1x_2\\) 得 \\(a_{12}=a_{21}=2\\)；其余交叉项系数为 0。<br>故 \\(\\pmb{A}=\\begin{pmatrix}1&2&0\\\\2&1&0\\\\0&0&3\\end{pmatrix}\\)。' },
                    { step: 2, title: '分块求特征值', content: '左上 \\(2\\times2\\) 块 \\(\\pmb{B}=\\begin{pmatrix}1&2\\\\2&1\\end{pmatrix}\\) 的特征方程：\\(\\lambda^2-(\\mathrm{tr}\\pmb{B})\\lambda+\\det\\pmb{B}=\\lambda^2-2\\lambda-3=(\\lambda-3)(\\lambda+1)=0\\)，得 \\(3,-1\\)。<br>右下角单独给出 \\(\\lambda=3\\)。故 \\(\\pmb{A}\\) 的特征值为 \\(3,3,-1\\)。' },
                    { step: 3, title: '求特征向量', content: '\\(\\lambda=3\\)：\\(\\pmb{A}-3\\pmb{E}=\\begin{pmatrix}-2&2&0\\\\2&-2&0\\\\0&0&0\\end{pmatrix}\\)，得 \\(x_1=x_2\\)，\\(x_3\\) 自由，取 \\(\\pmb{\\eta}_1=(1,1,0)^{\\mathrm{T}},\\pmb{\\eta}_2=(0,0,1)^{\\mathrm{T}}\\)（二者内积为 0，已正交）。<br>\\(\\lambda=-1\\)：\\(\\pmb{A}+\\pmb{E}=\\begin{pmatrix}2&2&0\\\\2&2&0\\\\0&0&4\\end{pmatrix}\\)，得 \\(x_3=0\\) 且 \\(x_2=-x_1\\)，取 \\(\\pmb{\\eta}_3=(1,-1,0)^{\\mathrm{T}}\\)。' },
                    { step: 4, title: '单位化并拼 \\(\\pmb{Q}\\)', content: '\\(\\pmb{q}_1=\\dfrac1{\\sqrt2}(1,1,0)^{\\mathrm{T}}\\)，\\(\\pmb{q}_2=(0,0,1)^{\\mathrm{T}}\\)，\\(\\pmb{q}_3=\\dfrac1{\\sqrt2}(1,-1,0)^{\\mathrm{T}}\\)。<br>\\(\\pmb{Q}=\\begin{pmatrix}\\frac1{\\sqrt2}&0&\\frac1{\\sqrt2}\\\\\\frac1{\\sqrt2}&0&-\\frac1{\\sqrt2}\\\\0&1&0\\end{pmatrix}\\)，\\(\\pmb{Q}^{\\mathrm{T}}\\pmb{A}\\pmb{Q}=\\mathrm{diag}(3,3,-1)\\)，故标准形 \\(3y_1^2+3y_2^2-y_3^2\\)。' },
                    { step: 5, title: '规范形与正定性', content: '正惯性指数为 2、负惯性指数为 1，规范形 \\(y_1^2+y_2^2-y_3^2\\)。<br>因存在负特征值 \\(-1\\)，\\(f\\) 不是正定（也不是负定），而是不定的。' }
                ],
                tips: [
                    '二次型矩阵呈分块对角（含整块零交叉项）时按块求特征值，省去展开三阶行列式。',
                    '同一重特征值对应多个特征向量时逐个单位化，并检查两两正交。'
                ],
                mistakes: [
                    '\\(4x_1x_2\\) 误取 \\(a_{12}=4\\)，导致特征值全错。',
                    '\\(\\lambda=3\\) 是二重根，两个特征向量取了 \\((1,1,0)\\) 与 \\((1,0,1)\\) 却未正交化，\\(\\pmb{Q}\\) 不再正交。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：分块二次型的正交变换与正定性（综合计算维度）' }
            },
            {
                id: 'm31v2', dimension: '综合创新',
                difficulty: 4, chapter: 'ch14', chapters: ['ch14'],
                kpIds: ['XD.14.1', 'XD.14.3'], kpNames: ['二次型', '正定'],
                question: '设二次型 \\(f(x_1,x_2,x_3)=x_1^2+x_2^2+x_3^2+2a(x_1x_2+x_1x_3+x_2x_3)\\)，其中 \\(a\\) 为实常数。<br>（I）写出 \\(f\\) 的矩阵并求其特征值（用 \\(a\\) 表示）；<br>（II）讨论 \\(a\\) 取何值时 \\(f\\) 正定、半正定、不定；<br>（III）当 \\(a=1\\) 时求 \\(f\\) 的规范形，以及 \\(f\\) 在约束 \\(x_1^2+x_2^2+x_3^2=1\\) 下的最大值与最小值。',
                options: [],
                answer: '（I）\\(\\pmb{A}=(1-a)\\pmb{E}+a\\pmb{J}\\)，特征值为 \\(1+2a\\)（对应 \\((1,1,1)^{\\mathrm{T}}\\)）与 \\(1-a\\)（二重）；（II）\\(-\\dfrac12<a<1\\) 时正定；\\(a=1\\) 或 \\(a=-\\dfrac12\\) 时半正定（非正定）；\\(a>1\\) 或 \\(a<-\\dfrac12\\) 时不定；（III）\\(a=1\\) 时 \\(f=(x_1+x_2+x_3)^2\\)，规范形 \\(y_1^2\\)，最大值 3（在 \\(\\pmb{x}=\\pm\\dfrac1{\\sqrt3}(1,1,1)^{\\mathrm{T}}\\) 处），最小值 0（在与 \\((1,1,1)\\) 正交的单位向量处）。',
                concepts: [
                    { name: '\\(\\pmb{J}\\) 的特征结构', note: '全 1 矩阵 \\(\\pmb{J}\\) 的特征值为 \\(3\\)（对应 \\((1,1,1)^{\\mathrm{T}}\\)）与 \\(0\\)（二重，对应 \\(x_1+x_2+x_3=0\\)）。' },
                    { name: '\\(a\\pmb{E}+b\\pmb{J}\\) 型矩阵', note: '特征值为 \\(a+3b\\) 与 \\(a\\)（二重）。本题 \\(\\pmb{A}=(1-a)\\pmb{E}+a\\pmb{J}\\)。' },
                    { name: '正定与半正定', note: '正定 \\(\\iff\\) 特征值全 \\(>0\\)；半正定 \\(\\iff\\) 特征值全 \\(\\ge0\\) 且至少一个为 \\(0\\)。' }
                ],
                solution: [
                    { step: 1, title: '写矩阵', content: '对角元全为 1，非对角元全为 \\(a\\)（因交叉项系数为 \\(2a\\)，各取一半），故<br>\\(\\pmb{A}=\\begin{pmatrix}1&a&a\\\\a&1&a\\\\a&a&1\\end{pmatrix}=(1-a)\\pmb{E}+a\\pmb{J}\\)，其中 \\(\\pmb{J}\\) 为全 1 矩阵。' },
                    { step: 2, title: '求特征值', content: '由 \\(\\pmb{J}\\) 的特征值 \\(3\\) 与 \\(0\\)（二重），线性组合 \\((1-a)\\pmb{E}+a\\pmb{J}\\) 的特征值为<br>\\(\\lambda_1=(1-a)+3a=1+2a\\)，\\(\\lambda_2=\\lambda_3=(1-a)+0=1-a\\)。' },
                    { step: 3, title: '正定的参数范围', content: '\\(\\lambda_i>0\\iff 1+2a>0\\) 且 \\(1-a>0\\iff a>-\\dfrac12\\) 且 \\(a<1\\)。<br>故 \\(-\\dfrac12<a<1\\) 时 \\(f\\) 正定。' },
                    { step: 4, title: '半正定与不定', content: '\\(a=1\\) 时特征值为 \\((3,0,0)\\)，\\(a=-\\dfrac12\\) 时特征值为 \\((0,\\tfrac32,\\tfrac32)\\)，均全部 \\(\\ge0\\) 且有零，故半正定但不正定；<br>\\(a>1\\) 时 \\(1-a<0<1+2a\\)，\\(a<-\\dfrac12\\) 时 \\(1+2a<0<1-a\\)，都有正有负，故 \\(f\\) 不定。' },
                    { step: 5, title: '\\(a=1\\) 时化规范形', content: '\\(a=1\\) 时 \\(\\pmb{A}=\\pmb{J}\\)，于是<br>\\(f=x_1^2+x_2^2+x_3^2+2(x_1x_2+x_1x_3+x_2x_3)=(x_1+x_2+x_3)^2\\)，<br>特征值 \\(3,0,0\\)，正惯性指数 1、负惯性指数 0，规范形为 \\(y_1^2\\)。' },
                    { step: 6, title: '\\(a=1\\) 时求约束最值', content: '取正交变换 \\(y_1=\\dfrac{x_1+x_2+x_3}{\\sqrt3}\\)（可补全为完整正交变换），则 \\(f=3y_1^2\\)，且 \\(x_1^2+x_2^2+x_3^2=y_1^2+y_2^2+y_3^2=1\\)，故 \\(y_1^2\\le1\\)。<br>当 \\(\\pmb{x}=\\pm\\dfrac1{\\sqrt3}(1,1,1)^{\\mathrm{T}}\\) 时 \\(y_1=\\pm1\\)，\\(f_{\\max}=3\\times1=3\\)；<br>当 \\(x_1+x_2+x_3=0\\) 且 \\(\\|\\pmb{x}\\|=1\\) 时 \\(y_1=0\\)，\\(f_{\\min}=0\\)。' }
                ],
                tips: [
                    '\\(a\\pmb{E}+b\\pmb{J}\\) 型二次型直接写特征值，避免每次展开三阶行列式。',
                    '含参正定性问题要同时考虑「全正」与「取等号」的临界值，别漏掉半正定情形。'
                ],
                mistakes: [
                    '把半正定当作正定，漏掉 \\(a=1\\) 与 \\(a=-\\dfrac12\\) 两个临界值。',
                    '讨论时忘记 \\(1+2a\\) 与 \\(1-a\\) 在不同区间大小关系会改变，直接按固定顺序比较。'
                ],
                source: { rank: 3, label: 'AI创新', detail: 'AI创新题：含参 \\(a\\pmb{E}+b\\pmb{J}\\) 型二次型的正定讨论与约束最值（综合创新维度）' }
            }
        ]
    }

);
