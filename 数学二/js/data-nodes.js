/* ============================================================
 * 302 数学二 · 考点节点地图（题型级细粒度）
 * ------------------------------------------------------------
 * 粒度：69 个节点 = 69 个「可以单独出题、单独练」的题型/方法。
 *       不再是「一章一个球」，而是一章拆成 3~12 个球。
 *       例：「函数、极限与连续」拆成 数列极限 / 函数极限 / 等价无穷小 /
 *            两个重要极限 / 未定式计算 / 夹逼准则 / 连续性 / 闭区间性质。
 *
 * 三层（tier）：
 *   1 基础简易层  单一知识点与基本计算 —— 必须全对，保底线
 *   2 综合应用层  真题主战场 —— 解答题基本都从这里出
 *   3 创新拓展层  证明题 / 抽象问题 / 压轴综合 —— 拉开差距
 *
 * 章（chap）：节点按教材章归组，地图 tooltip 与关卡简报会显示「第 N 章」，
 *            方便按章推进、按章复盘。
 *
 * 解锁链：req = 前置节点 id 数组（全部通关才解锁）；reqLevel = 等级门槛。
 *         开局入口只有两个：gs-lim-fn（高数起点）、xd-det-calc（线代起点）。
 *
 * ⚠️ 大纲范围（数学二 ≠ 数学一，别混）：
 *   ✅ 考：高等数学（函数极限连续 / 一元微分学 / 一元积分学 /
 *          多元微分学 / 二重积分 / 常微分方程）+ 线性代数（前 5 章）
 *   ❌ 不考：概率论与数理统计、无穷级数、向量代数与空间解析几何、
 *          三重积分、曲线曲面积分、线性空间与线性变换
 *
 * 分值占比：高等数学 78.0% / 线性代数 22.0%（150 分制，weight 总和 300）
 *
 * wip: true 表示「题库建设中」——结构先占位，题目分批补。
 *      地图上渲染成灰色 🚧，点了给提示，不计入通关数。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
window.HNSF829_NODES = {
  meta: {
    subject: '302 数学二',
    target: '华东师范大学 085411 大数据技术与工程 · 初试科目③',
    modules: [
      { id: 'gs', name: '高等数学', color: '#38bdf8', share: '约 78%' },
      { id: 'xd', name: '线性代数', color: '#a78bfa', share: '约 22%' }
    ],
    /* 章：节点按章归组，用于显示「第 N 章」与按章统计 */
    chapters: [
      { id: 'gs-c1', no: 1, name: '函数、极限与连续', module: 'gs' },
      { id: 'gs-c2', no: 2, name: '一元函数微分学', module: 'gs' },
      { id: 'gs-c3', no: 3, name: '一元函数积分学', module: 'gs' },
      { id: 'gs-c4', no: 4, name: '多元函数微分学', module: 'gs' },
      { id: 'gs-c5', no: 5, name: '二重积分', module: 'gs' },
      { id: 'gs-c6', no: 6, name: '常微分方程', module: 'gs' },
      { id: 'xd-c1', no: 1, name: '行列式', module: 'xd' },
      { id: 'xd-c2', no: 2, name: '矩阵及其运算', module: 'xd' },
      { id: 'xd-c3', no: 3, name: '向量组的线性相关性', module: 'xd' },
      { id: 'xd-c4', no: 4, name: '线性方程组', module: 'xd' },
      { id: 'xd-c5', no: 5, name: '特征值与相似对角化', module: 'xd' },
      { id: 'xd-c6', no: 6, name: '二次型', module: 'xd' }
    ]
  },
  tiers: [
    { id: 1, name: '基础简易层', desc: '单一知识点与基本计算。这部分必须全对，是保底线。', color: '#38bdf8' },
    { id: 2, name: '综合应用层', desc: '真题主战场：解答题基本都从这里出，分值占比最高。', color: '#a78bfa' },
    { id: 3, name: '创新拓展层', desc: '证明题、抽象问题、压轴综合。拉开差距的地方。', color: '#fb7185' }
  ],
  nodes: [
    /* ============================================================
     * 高等数学 · 第 1 章 函数、极限与连续（8 个节点 / 占比 14.0%）
     * ============================================================ */
    {
      id: 'gs-lim-fn', tier: 1, module: 'gs', chap: 'gs-c1', weight: 5, icon: '📐',
      name: '函数极限与左右极限',
      desc: '极限的定义（ε-δ 语言）、左右极限、极限存在的充要条件、分段函数在分界点的极限',
      points: [
        '左右极限存在且相等才是极限存在',
        '分段函数分界点必须分左右讨论',
        '极限的局部保号性与有界性',
        'x→∞ 与 x→x₀ 两种过程的区别'
      ],
      source: '同济《高等数学》第七版 上册 第1章 · 数二开局第一考点',
      req: [], reqLevel: 1, wip: false
    },
    {
      id: 'gs-lim-seq', tier: 1, module: 'gs', chap: 'gs-c1', weight: 4, icon: '🔢',
      name: '数列极限',
      desc: '数列极限定义、单调有界准则、递推数列求极限、数列极限与函数极限的关系',
      points: [
        '单调有界准则证极限存在',
        '递推式 xₙ₊₁=f(xₙ)：先证有界再令 x=f(x) 解极限',
        'n 项和 / n 项积的极限处理',
        '海涅定理：数列极限与函数极限互推'
      ],
      source: '同济《高等数学》第七版 上册 第1章 · 数二选择填空常客',
      req: ['gs-lim-fn'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-lim-equiv', tier: 1, module: 'gs', chap: 'gs-c1', weight: 7, icon: '⚖️',
      name: '无穷小比较与等价替换',
      desc: '无穷小阶的比较、等价无穷小替换、替换的适用条件与常见失效场景',
      points: [
        '等价无穷小只在「乘除」中可整体替换',
        '加减项替换的充要条件（两阶之差不能为零）',
        '常用等价无穷小表（含 1−cosx ~ x²/2 等三阶项）',
        '无穷小的阶与主部提取'
      ],
      source: '同济《高等数学》第七版 上册 第1章 · 极限计算第一利器',
      req: ['gs-lim-fn'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-lim-twokey', tier: 1, module: 'gs', chap: 'gs-c1', weight: 4, icon: '🔑',
      name: '两个重要极限',
      desc: '第一个重要极限 sinx/x、第二个重要极限 (1+1/x)ˣ、1^∞ 型极限的标准解法',
      points: [
        'sinx/x → 1 的变形与配凑',
        '(1+1/x)ˣ → e 的三种常见外壳',
        '1^∞ 型：lim = e^(lim 底−1 × 指数)',
        '与等价无穷小配合使用'
      ],
      source: '同济《高等数学》第七版 上册 第1章 · 幂指函数极限必用',
      req: ['gs-lim-equiv'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-cont', tier: 1, module: 'gs', chap: 'gs-c1', weight: 5, icon: '〰️',
      name: '连续性与间断点分类',
      desc: '连续的定义、左右连续、间断点四分类（可去/跳跃/无穷/振荡）、分段函数的连续性',
      points: [
        '间断点四分类的判定流程',
        '可去间断点 = 极限存在但不等或没定义',
        '分段函数在分界点连续 ⇔ 左右极限 = 函数值',
        '由连续性反求参数'
      ],
      source: '同济《高等数学》第七版 上册 第1章 · 数二选择题高频',
      req: ['gs-lim-fn'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-lim-calc', tier: 2, module: 'gs', chap: 'gs-c1', weight: 8, icon: '🧮',
      name: '未定式与极限综合计算',
      desc: '七种未定式（0/0、∞/∞、∞−∞、0·∞、1^∞、0⁰、∞⁰）统一处理：通分、取对数、化倒数',
      points: [
        '先判型再选法：判错型必错',
        '∞−∞ 型：通分或根式有理化',
        '0·∞ 型：化倒数转 0/0 或 ∞/∞',
        '幂指型三兄弟：一律先取对数'
      ],
      source: '同济《高等数学》第七版 上册 第1章 · 数二解答题必考计算',
      req: ['gs-lim-twokey', 'gs-cont'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-lim-squeeze', tier: 2, module: 'gs', chap: 'gs-c1', weight: 4, icon: '🥪',
      name: '夹逼准则与极限存在性',
      desc: '夹逼准则、放缩技巧、n 项和的极限、定积分定义求 n 项和极限',
      points: [
        '放缩到同一个极限：放大与缩小都要收敛到同一值',
        'n 项和 → 定积分定义的识别（凑成 1/n · Σf(i/n)）',
        '含 n 次根号 / 最大项法的放缩',
        '有界量与无穷小的乘积'
      ],
      source: '同济《高等数学》第七版 上册 第1章 · 数二填空题常客',
      req: ['gs-lim-seq'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-cont-closed', tier: 2, module: 'gs', chap: 'gs-c1', weight: 5, icon: '🧷',
      name: '闭区间连续函数的性质',
      desc: '有界性、最值定理、介值定理、零点定理；用零点定理证明方程根的存在与个数',
      points: [
        '零点定理：两端异号 ⇒ 至少一个根',
        '证「恰有一个根」= 零点定理 + 单调性',
        '介值定理与最值定理配合证不等式',
        '含参数方程的根的存在性讨论'
      ],
      source: '同济《高等数学》第七版 上册 第1章 · 数二证明题常见入口',
      req: ['gs-cont'], reqLevel: 2, wip: false
    },

    /* ============================================================
     * 高等数学 · 第 2 章 一元函数微分学（10 个节点 / 占比 18.7%）
     * ============================================================ */
    {
      id: 'gs-deriv-def', tier: 1, module: 'gs', chap: 'gs-c2', weight: 6, icon: '📈',
      name: '导数与微分的定义',
      desc: '导数定义式、几何意义（切线斜率）、可导与连续的关系、用定义求分段点导数、微分概念',
      points: [
        '可导 ⇒ 连续，连续 ⇏ 可导（|x| 在 0 点）',
        '分段函数分界点必须用定义求导',
        '导数定义的三种等价写法与凑形式',
        '微分的定义 dy = f′(x)dx 与线性主部'
      ],
      source: '同济《高等数学》第七版 上册 第2章 · 概念题必考',
      req: ['gs-lim-fn'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-deriv-rule', tier: 1, module: 'gs', chap: 'gs-c2', weight: 7, icon: '🔗',
      name: '求导法则与高阶导数',
      desc: '四则运算、复合函数链式法则、反函数求导、高阶导数与莱布尼茨公式',
      points: [
        '链式法则逐层剥洋葱，别漏层',
        'n 阶导数的规律（1/x、eˣ、sinx 的 n 阶导）',
        '莱布尼茨公式求乘积的 n 阶导',
        '先化简再求导，能省一半功夫'
      ],
      source: '同济《高等数学》第七版 上册 第2章 · 一切计算题的地基',
      req: ['gs-deriv-def'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-deriv-implicit', tier: 1, module: 'gs', chap: 'gs-c2', weight: 5, icon: '🪢',
      name: '隐函数与参数方程求导',
      desc: '隐函数求导（两边对 x 求导）、参数方程求导 dy/dx = (dy/dt)/(dx/dt)、对数求导法',
      points: [
        '隐函数：两边求导后把 y′ 当未知数解出来',
        '参数方程二阶导 ≠ 直接对 dy/dx 再除 dx/dt 一次要小心',
        '幂指函数 f^g 一律先取对数',
        '求某点的导数值：先代点再解，比解出通式快'
      ],
      source: '同济《高等数学》第七版 上册 第2章 · 数二填空高频',
      req: ['gs-deriv-rule'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-lhopital', tier: 2, module: 'gs', chap: 'gs-c2', weight: 5, icon: '🩺',
      name: '洛必达法则',
      desc: '洛必达法则的三个条件、适用与失效场景、与等价无穷小 / 泰勒的分工',
      points: [
        '三个条件：0/0 或 ∞/∞、可导、导数之比的极限存在',
        '失效场景：求导后极限不存在但原极限存在',
        '能等价替换就先替换，能泰勒就泰勒',
        '洛必达是下策：算得动但容易越算越繁'
      ],
      source: '同济《高等数学》第七版 上册 第3章 · 数二极限计算常用',
      req: ['gs-deriv-rule'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-mono', tier: 2, module: 'gs', chap: 'gs-c2', weight: 6, icon: '📊',
      name: '单调性与极值',
      desc: '导数符号与单调性、极值的第一/第二充分条件、驻点与不可导点',
      points: [
        'f′>0 递增、f′<0 递减（区间内）',
        '极值点必是驻点或不可导点，反之不然',
        '第一充分条件看 f′ 变号，第二看 f″ 符号',
        '含参数讨论单调性：按判别式分类'
      ],
      source: '同济《高等数学》第七版 上册 第3章 · 数二解答题第一步',
      req: ['gs-deriv-rule'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-concave', tier: 2, module: 'gs', chap: 'gs-c2', weight: 5, icon: '🌊',
      name: '凹凸性、拐点与渐近线',
      desc: '凹凸性判定、拐点求法、水平/铅直/斜渐近线的求解',
      points: [
        'f″>0 凹（下凸），f″<0 凸',
        '拐点：f″ 变号点，且必须在曲线上有定义',
        '铅直渐近线：找无穷间断点',
        '斜渐近线：k = lim f(x)/x，b = lim (f(x)−kx)'
      ],
      source: '同济《高等数学》第七版 上册 第3章 · 数二填空题常客',
      req: ['gs-mono'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-opt', tier: 2, module: 'gs', chap: 'gs-c2', weight: 5, icon: '🏔️',
      name: '最值应用问题',
      desc: '闭区间最值、实际问题建模求最值（几何面积体积最大最小、经济问题）',
      points: [
        '闭区间最值 = 端点值 + 区间内驻点值 取最大最小',
        '应用题：先设变量、写目标函数、定定义域',
        '定义域是开区间时用单调性 / 唯一驻点判断',
        '别忘验证边界与实际意义'
      ],
      source: '同济《高等数学》第七版 上册 第3章 · 数二解答题经典',
      req: ['gs-mono'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-mvt', tier: 2, module: 'gs', chap: 'gs-c2', weight: 7, icon: '🏛️',
      name: '微分中值定理',
      desc: '罗尔定理、拉格朗日中值定理、柯西中值定理及三者关系',
      points: [
        '罗尔：闭区间连续、开区间可导、两端相等 ⇒ 存在 ξ 使 f′=0',
        '拉格朗日：f(b)−f(a) = f′(ξ)(b−a)',
        '柯西：两个函数的增量之比',
        '见到 f(b)−f(a) 与 b−a 就想到拉格朗日'
      ],
      source: '同济《高等数学》第七版 上册 第3章 · 数二证明题核心',
      req: ['gs-mono'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-taylor', tier: 2, module: 'gs', chap: 'gs-c2', weight: 5, icon: '🎚️',
      name: '泰勒公式与麦克劳林展开',
      desc: '带皮亚诺余项与拉格朗日余项的泰勒公式、五个常用麦克劳林展开、用泰勒求极限与估阶',
      points: [
        '五个必背展开：eˣ sinx cosx ln(1+x) (1+x)^α',
        '求极限展开到几阶：分母阶数说了算',
        '皮亚诺余项用于求极限，拉格朗日余项用于估计误差',
        '用泰勒证不等式：展开后放缩余项'
      ],
      source: '同济《高等数学》第七版 上册 第3章 · 数二极限与证明双料工具',
      req: ['gs-deriv-rule'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-ineq-prove', tier: 3, module: 'gs', chap: 'gs-c2', weight: 5, icon: '🧠',
      name: '用导数证明不等式',
      desc: '构造辅助函数证不等式、单调性法、最值法、凹凸性法、泰勒展开法',
      points: [
        '移项构造 F(x) = 左 − 右，证 F 的符号',
        '优先证 F(x₀)=0 再用单调性',
        '含 eˣ、lnx 的不等式优先试凹凸性',
        '对称式不等式可先证一侧再对称'
      ],
      source: '数二证明题（10 分）· 历年压轴常客',
      req: ['gs-mvt', 'gs-taylor'], reqLevel: 4, wip: false
    },

    /* ============================================================
     * 高等数学 · 第 3 章 一元函数积分学（12 个节点 / 占比 21.3%）
     * ============================================================ */
    {
      id: 'gs-int-antideriv', tier: 1, module: 'gs', chap: 'gs-c3', weight: 4, icon: '∫',
      name: '原函数与不定积分概念',
      desc: '原函数存在定理、不定积分的定义与性质、基本积分表、原函数族的结构',
      points: [
        '连续 ⇒ 有原函数（变限积分就是其中一个）',
        '任意两个原函数之差为常数',
        '不定积分结果必须带 + C',
        '基本积分表 15 个公式的准确记忆'
      ],
      source: '同济《高等数学》第七版 上册 第4章 · 积分地基',
      req: ['gs-deriv-rule'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-int-sub', tier: 1, module: 'gs', chap: 'gs-c3', weight: 7, icon: '🔁',
      name: '换元积分法',
      desc: '第一类换元（凑微分）与第二类换元（三角代换、根式代换、倒代换）',
      points: [
        '凑微分：把 dx 凑成 d(某个函数)',
        '三角代换：√(a²−x²) 用 sin、√(a²+x²) 用 tan、√(x²−a²) 用 sec',
        '根式代换：令 t = 整个根号，去掉根号',
        '换元后必须回代原变量'
      ],
      source: '同济《高等数学》第七版 上册 第4章 · 数二积分首要技能',
      req: ['gs-int-antideriv'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-int-parts', tier: 1, module: 'gs', chap: 'gs-c3', weight: 6, icon: '🪓',
      name: '分部积分法',
      desc: '分部积分公式、u 与 dv 的选取原则「反对幂指三」、循环型积分、递推型积分',
      points: [
        '口诀「反对幂指三」：排前面的当 u',
        '循环型：两次分部后移项解出原积分',
        '∫xⁿeˣ、∫xⁿsinx、∫lnx、∫arctanx 四类模板',
        '定积分分部要带上下限代入 uv 项'
      ],
      source: '同济《高等数学》第七版 上册 第4章 · 数二必考',
      req: ['gs-int-sub'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-int-rat', tier: 2, module: 'gs', chap: 'gs-c3', weight: 4, icon: '🧩',
      name: '有理函数与三角有理式积分',
      desc: '真分式拆分为部分分式、假分式先做除法、三角有理式的万能代换与配对技巧',
      points: [
        '假分式先长除法化真分式',
        '分母因式分解后按因式类型设部分分式',
        '万能代换 t = tan(x/2) 是保底手段但通常最慢',
        '∫sin²x、∫cos²x 用降幂公式'
      ],
      source: '同济《高等数学》第七版 上册 第4章 · 数二计算题保底技能',
      req: ['gs-int-sub', 'gs-int-parts'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-int-def', tier: 1, module: 'gs', chap: 'gs-c3', weight: 5, icon: '∫ₐᵇ',
      name: '定积分的概念与性质',
      desc: '定积分的定义（黎曼和）、几何意义、基本性质、积分中值定理的表述',
      points: [
        '定积分是一个数，不定积分是一族函数',
        '定积分与积分变量字母无关',
        '线性性质、区间可加性、比较性质',
        '定积分 ≤ 绝对值积分'
      ],
      source: '同济《高等数学》第七版 上册 第5章 · 概念辨错题高发区',
      req: ['gs-lim-fn'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-int-nl', tier: 1, module: 'gs', chap: 'gs-c3', weight: 7, icon: '🌉',
      name: '定积分的计算',
      desc: '牛顿-莱布尼茨公式、定积分换元（换限）、定积分分部、分段函数的定积分',
      points: [
        '牛顿-莱布尼茨：∫ₐᵇf = F(b) − F(a)',
        '换元必须同时换上下限，且不用回代',
        '分段函数 / 含绝对值的定积分必须拆区间',
        '被积函数有奇点时不能直接用牛顿-莱布尼茨'
      ],
      source: '同济《高等数学》第七版 上册 第5章 · 数二每年必考',
      req: ['gs-int-def', 'gs-int-antideriv'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-int-var', tier: 2, module: 'gs', chap: 'gs-c3', weight: 6, icon: '🎛️',
      name: '变限积分及其求导',
      desc: '变限积分函数的性质、求导公式（含复合与上下限都是函数）、变限积分与微分方程结合',
      points: [
        'Φ(x)=∫ₐˣf(t)dt ⇒ Φ′(x)=f(x)（f 连续）',
        '上限是 g(x)：Φ′=f(g(x))·g′(x)',
        '上下限都变：拆成两个变限积分',
        '被积函数含 x：必须先换元把 x 移出积分号'
      ],
      source: '同济《高等数学》第七版 上册 第5章 · 数二大题必用工具',
      req: ['gs-int-nl'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-int-sym', tier: 2, module: 'gs', chap: 'gs-c3', weight: 4, icon: '🪞',
      name: '对称区间与奇偶性技巧',
      desc: '对称区间上奇偶函数的积分性质、周期函数的积分、区间再现公式',
      points: [
        '奇函数在对称区间积分为 0',
        '偶函数在对称区间 = 2 倍半区间',
        '区间再现：∫₀ᵃf(x)dx = ∫₀ᵃf(a−x)dx',
        '周期函数整周期积分与起点无关'
      ],
      source: '同济《高等数学》第七版 上册 第5章 · 数二化简神器',
      req: ['gs-int-nl'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-int-app', tier: 2, module: 'gs', chap: 'gs-c3', weight: 7, icon: '📦',
      name: '定积分的几何应用',
      desc: '平面图形面积（直角坐标/参数方程/极坐标）、旋转体体积、弧长、旋转面面积',
      points: [
        '面积：先画图、定上下界、判谁在上',
        '绕 x 轴体积：V = π∫y²dx；绕 y 轴：V = 2π∫x|y|dx（柱壳法）',
        '弧长：ds = √(1+y′²)dx 与参数式、极坐标式',
        '微元法：取微元 → 写近似 → 积分'
      ],
      source: '同济《高等数学》第七版 上册 第6章 · 数二解答题头号常客',
      req: ['gs-int-nl'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-int-phys', tier: 2, module: 'gs', chap: 'gs-c3', weight: 4, icon: '⚙️',
      name: '定积分的物理应用',
      desc: '变力做功、液体静压力、形心与质心、函数平均值',
      points: [
        '变力做功 W = ∫F(x)dx，先写出 F(x)',
        '液体压力 P = ∫ρg·深度·宽度 dx',
        '函数平均值 = 1/(b−a)∫ₐᵇf(x)dx',
        '抽水做功：分层取微元，注意每层提升距离'
      ],
      source: '同济《高等数学》第七版 上册 第6章 · 数二应用题',
      req: ['gs-int-app'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-int-improp', tier: 2, module: 'gs', chap: 'gs-c3', weight: 4, icon: '♾️',
      name: '反常积分',
      desc: '无穷限反常积分、无界函数反常积分的收敛性判断与计算、p 积分判据',
      points: [
        '先判敛散再算值，两类反常积分都要化极限',
        '∫₁^∞ dx/x^p 当 p>1 收敛',
        '比较判别法：找同阶参照',
        '被积函数在区间内部也无界时要拆点'
      ],
      source: '同济《高等数学》第七版 上册 第5章 · 数二选择题高频',
      req: ['gs-int-nl'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-int-mvt', tier: 3, module: 'gs', chap: 'gs-c3', weight: 6, icon: '🧠',
      name: '积分中值定理与积分不等式',
      desc: '积分中值定理、变限积分构造辅助函数证等式、积分不等式证明',
      points: [
        '积分中值定理：∫ₐᵇf = f(ξ)(b−a)',
        '证含 ∫ₐˣ 的等式：构造 F(x)=∫ₐˣf 用罗尔',
        '积分不等式：先证被积函数不等式再积分',
        '含变限积分的双中值问题'
      ],
      source: '数二证明题（10 分）· 与中值定理并列为压轴',
      req: ['gs-int-var', 'gs-mvt'], reqLevel: 4, wip: false
    },

    /* ============================================================
     * 高等数学 · 第 4 章 多元函数微分学（5 个节点 / 占比 8.7%）
     * ============================================================ */
    {
      id: 'gs-multi-lim', tier: 1, module: 'gs', chap: 'gs-c4', weight: 3, icon: '🗺️',
      name: '多元函数的极限与连续',
      desc: '二元函数极限、路径无关性、累次极限与二重极限的区别、有界闭域上连续函数的性质',
      points: [
        '二重极限存在要求沿任意路径趋近都得同一值',
        '证明极限不存在：找两条路径结果不同',
        '累次极限存在 ⇏ 二重极限存在',
        '多元初等函数在定义区域内连续'
      ],
      source: '同济《高等数学》第七版 下册 第9章 · 数二概念题',
      req: ['gs-lim-equiv'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-multi-partial', tier: 1, module: 'gs', chap: 'gs-c4', weight: 5, icon: '∂',
      name: '偏导数与全微分',
      desc: '偏导数定义与计算、高阶偏导、全微分的定义与判定、可微的必要与充分条件',
      points: [
        '可微 ⇒ 可偏导 ⇒ 连续（反向都不成立）',
        '分段点处的偏导数必须用定义求',
        '可微的充分条件：偏导数连续',
        '全微分 dz = z′ₓdx + z′ᵧdy'
      ],
      source: '同济《高等数学》第七版 下册 第9章 · 数二选择填空必考',
      req: ['gs-deriv-rule'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-multi-chain', tier: 2, module: 'gs', chap: 'gs-c4', weight: 6, icon: '🪢',
      name: '多元复合与隐函数求导',
      desc: '全导数与链式法则、隐函数存在定理、由一个方程/方程组确定的隐函数求导',
      points: [
        '画变量关系树，有几条路径就有几项相加',
        '隐函数 F(x,y,z)=0：∂z/∂x = −Fₓ/F_z',
        '方程组确定的隐函数用克莱姆法则或对方程组求导',
        '二阶偏导要按链式再求一遍，别漏项'
      ],
      source: '同济《高等数学》第七版 下册 第9章 · 数二计算题必考',
      req: ['gs-multi-partial'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-multi-extrem', tier: 2, module: 'gs', chap: 'gs-c4', weight: 6, icon: '🎯',
      name: '多元函数的极值与最值',
      desc: '无条件极值、AC−B² 判别法、有界闭域上的最大值最小值',
      points: [
        '先解方程组 fₓ=0, fᵧ=0 求驻点',
        '判别：A=fₓₓ、B=fₓᵧ、C=fᵧᵧ；AC−B²>0 有极值，<0 无极值',
        'AC−B²>0 时 A<0 极大、A>0 极小',
        '闭域最值：内部驻点 + 边界各段分别求'
      ],
      source: '同济《高等数学》第七版 下册 第9章 · 数二解答题常客',
      req: ['gs-multi-partial', 'gs-mono'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-multi-lagrange', tier: 2, module: 'gs', chap: 'gs-c4', weight: 6, icon: '🔗',
      name: '条件极值与拉格朗日乘数法',
      desc: '拉格朗日乘数法求条件极值、构造 L 函数、多个约束条件、实际问题的最值',
      points: [
        'L = f + λφ，对每个变量与 λ 求偏导令零',
        '解方程组时先消 λ，比硬解快得多',
        '实际问题：条件极值点往往就是最值点，可省判别',
        '两个约束就引入 λ、μ 两个乘子'
      ],
      source: '同济《高等数学》第七版 下册 第9章 · 数二压轴常见',
      req: ['gs-multi-extrem'], reqLevel: 2, wip: false
    },

    /* ============================================================
     * 高等数学 · 第 5 章 二重积分（4 个节点 / 占比 6.7%）
     * ============================================================ */
    {
      id: 'gs-dbl-rect', tier: 2, module: 'gs', chap: 'gs-c5', weight: 6, icon: '⿴',
      name: '直角坐标下计算二重积分',
      desc: 'X 型与 Y 型区域、化二次积分、积分次序的初步选择、分块积分',
      points: [
        '先画区域图，再定 X 型还是 Y 型',
        'X 型：外层 dx，内层上下边界是 x 的函数',
        '边界函数需要分段时，把区域拆成几块分别积',
        '选次序的标准：内层能不能积出来'
      ],
      source: '同济《高等数学》第七版 下册 第10章 · 数二必考大题',
      req: ['gs-multi-partial', 'gs-int-nl'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-dbl-polar', tier: 2, module: 'gs', chap: 'gs-c5', weight: 5, icon: '🎯',
      name: '极坐标下计算二重积分',
      desc: '极坐标变换、面积元素 r dr dθ、圆域与圆环域的积分、何时该用极坐标',
      points: [
        '见到 x²+y²、圆域、扇形域立即想极坐标',
        '别丢 r：dσ = r dr dθ',
        'θ 的范围由区域张角决定，r 的范围从原点出发看边界',
        '圆心不在原点的圆域需先平移'
      ],
      source: '同济《高等数学》第七版 下册 第10章 · 数二必考',
      req: ['gs-dbl-rect'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-dbl-order', tier: 2, module: 'gs', chap: 'gs-c5', weight: 4, icon: '🔄',
      name: '交换积分次序',
      desc: '由二次积分还原区域、交换 dx dy 的次序、处理积不出来的内层积分',
      points: [
        '先由上下限反推出区域图形（这步是全部关键）',
        '交换次序后上下限必须重新按新次序读',
        '被积函数含 e^(−x²)、sinx/x 时必须交换次序',
        '交换后注意是否需要分块'
      ],
      source: '同济《高等数学》第七版 下册 第10章 · 数二填空高频',
      req: ['gs-dbl-rect'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-dbl-sym', tier: 2, module: 'gs', chap: 'gs-c5', weight: 5, icon: '🪞',
      name: '二重积分的对称性',
      desc: '关于坐标轴与原点对称、轮换对称性、利用对称性大幅化简',
      points: [
        '区域关于 x 轴对称 + 被积函数对 y 为奇 ⇒ 积分为 0',
        '轮换对称：把 x、y 互换区域不变，则 ∬f(x,y) = ∬f(y,x)',
        '轮换对称常用于求 ∬(x²+y²) 这类和为定值的情形',
        '用对称性前必须先确认区域确实对称'
      ],
      source: '同济《高等数学》第七版 下册 第10章 · 数二提速神器',
      req: ['gs-dbl-rect'], reqLevel: 2, wip: false
    },

    /* ============================================================
     * 高等数学 · 第 6 章 常微分方程（5 个节点 / 占比 8.7%）
     * ============================================================ */
    {
      id: 'gs-ode-concept', tier: 1, module: 'gs', chap: 'gs-c6', weight: 3, icon: '🧬',
      name: '微分方程的基本概念',
      desc: '阶、通解与特解、初始条件、积分曲线、线性与非线性方程',
      points: [
        '通解中独立任意常数的个数 = 方程的阶数',
        '特解 = 通解 + 初始条件定常数',
        '识别是否线性：y 与其各阶导数都是一次的',
        '验证某函数是否为解：代入即可'
      ],
      source: '同济《高等数学》第七版 上册 第7章 · 数二概念题',
      req: ['gs-int-antideriv'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-ode-first', tier: 1, module: 'gs', chap: 'gs-c6', weight: 7, icon: '🧪',
      name: '一阶微分方程',
      desc: '可分离变量方程、齐次方程、一阶线性方程（常数变易法）及其识别',
      points: [
        '先判类型再动手：可分离 → 齐次 → 线性',
        '齐次方程：令 u = y/x，化为可分离',
        '一阶线性通解公式 y = e^(−∫P)(∫Qe^(∫P)dx + C)',
        '识别陷阱：y′ = f(ax+by+c) 要令 u = ax+by+c'
      ],
      source: '同济《高等数学》第七版 上册 第7章 · 数二每年必考',
      req: ['gs-ode-concept'], reqLevel: 1, wip: false
    },
    {
      id: 'gs-ode-reduce', tier: 2, module: 'gs', chap: 'gs-c6', weight: 4, icon: '📉',
      name: '可降阶的高阶微分方程',
      desc: 'y⁽ⁿ⁾=f(x)、y″=f(x,y′)、y″=f(y,y′) 三种可降阶类型',
      points: [
        'y″=f(x,y′)：令 p=y′，方程降为一阶',
        'y″=f(y,y′)：令 p=y′ 并以 y 为自变量，y″ = p·dp/dy',
        '两类降阶的自变量不要搞混',
        '每降一次阶就要多一个任意常数'
      ],
      source: '同济《高等数学》第七版 上册 第7章 · 数二填空题常客',
      req: ['gs-ode-first', 'gs-int-parts'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-ode-cc2', tier: 2, module: 'gs', chap: 'gs-c6', weight: 8, icon: '⚖️',
      name: '二阶常系数线性微分方程',
      desc: '齐次方程的特征根三情形、非齐次方程特解的待定形式（含共振）',
      points: [
        '写特征方程 r²+pr+q=0，按判别式分三种情形写通解',
        '非齐次通解 = 齐次通解 + 一个特解',
        'f(x)=Pₘ(x)e^(αx)：设特解 x^kQₘ(x)e^(αx)',
        'k = α 作为特征根的重数（共振就在这一步体现）',
        'f(x)=e^(αx)(Acosβx+Bsinβx)：按 α±βi 是否为根设形式'
      ],
      source: '同济《高等数学》第七版 上册 第7章 · 数二线代之外最稳的大题',
      req: ['gs-ode-first'], reqLevel: 2, wip: false
    },
    {
      id: 'gs-ode-app', tier: 3, module: 'gs', chap: 'gs-c6', weight: 4, icon: '🚀',
      name: '微分方程的应用',
      desc: '几何应用（切线、曲率）、变化率问题、与定积分 / 极限综合的压轴题',
      points: [
        '把文字条件翻译成 y′ 与 y 的关系式',
        '几何条件：切线斜率、截距、面积都能写成微分方程',
        '含变限积分的方程先两边求导化为微分方程',
        '最后别忘用初始条件定常数并回到原问题'
      ],
      source: '数二真题压轴 · 微分方程与积分/极限交叉',
      req: ['gs-ode-cc2', 'gs-int-app'], reqLevel: 4, wip: false
    },

    /* ============================================================
     * 线性代数 · 第 1 章 行列式（3 个节点 / 占比 2.7%）
     * ============================================================ */
    {
      id: 'xd-det-calc', tier: 1, module: 'xd', chap: 'xd-c1', weight: 3, icon: '🔢',
      name: '行列式的性质与计算',
      desc: '行列式定义与七大性质、化三角形法、行列式的乘法性质',
      points: [
        '行列式转置值不变；换行变号',
        '某行乘 k，行列式乘 k（不要与矩阵的 kA 混淆）',
        '一行加到另一行，行列式不变（化零的主要手段）',
        '|AB| = |A||B|'
      ],
      source: '同济《线性代数》第六版 第1章 · 线代开局第一考点',
      req: [], reqLevel: 1, wip: false
    },
    {
      id: 'xd-det-expand', tier: 2, module: 'xd', chap: 'xd-c1', weight: 3, icon: '📖',
      name: '展开降阶与特殊行列式',
      desc: '按行（列）展开、代数余子式、范德蒙德行列式、三对角与爪型行列式',
      points: [
        '展开前先用性质化出尽可能多的零',
        '范德蒙德行列式：∏(xⱼ−xᵢ)（i<j）',
        '三对角行列式用递推法',
        '爪型行列式消去一列化为三角'
      ],
      source: '同济《线性代数》第六版 第1章 · 数二填空常客',
      req: ['xd-det-calc'], reqLevel: 2, wip: false
    },
    {
      id: 'xd-det-abstract', tier: 3, module: 'xd', chap: 'xd-c1', weight: 2, icon: '🌀',
      name: '抽象行列式',
      desc: '|kA| = kⁿ|A|、|A*| = |A|^(n−1)、|A⁻¹| = |A|⁻¹、由特征值求行列式',
      points: [
        'n 阶矩阵 |kA| = kⁿ|A|，别漏 n 次方',
        '|A*| = |A|^(n−1)',
        '|A| = 特征值之积',
        '用 AA* = |A|E 两边取行列式推结论'
      ],
      source: '同济《线性代数》第六版 第1章 · 数二选择压轴',
      req: ['xd-det-expand'], reqLevel: 4, wip: false
    },

    /* ============================================================
     * 线性代数 · 第 2 章 矩阵及其运算（6 个节点 / 占比 5.3%）
     * ============================================================ */
    {
      id: 'xd-mat-op', tier: 1, module: 'xd', chap: 'xd-c2', weight: 2, icon: '🧮',
      name: '矩阵运算与运算律',
      desc: '矩阵加减乘、转置、方幂、运算律与不成立的「律」',
      points: [
        'AB ≠ BA，乘法不满足交换律',
        'AB = O 推不出 A = O 或 B = O',
        '消去律不成立：AB = AC 推不出 B = C',
        '(AB)ᵀ = BᵀAᵀ，顺序反了就是错'
      ],
      source: '同济《线性代数》第六版 第2章 · 概念辨错题高发区',
      // 线代的入口放在这里（而不是行列式）：矩阵运算不依赖行列式，
      // 行列式那一章正在建设中，若让它当初级门槛会把整条线代线锁死。
      req: [], reqLevel: 1, wip: false
    },
    {
      id: 'xd-mat-inv', tier: 1, module: 'xd', chap: 'xd-c2', weight: 4, icon: '🔄',
      name: '逆矩阵与伴随矩阵',
      desc: '可逆的等价条件、伴随矩阵定义与性质、初等行变换求逆、矩阵方程求解',
      points: [
        'A 可逆 ⇔ |A| ≠ 0 ⇔ r(A) = n ⇔ 特征值全非零',
        'AA* = A*A = |A|E',
        'A⁻¹ = A*/|A|（二阶有速算口诀）',
        '解 AX=B：对 (A|B) 做行变换；XA=B 需转置处理'
      ],
      source: '同济《线性代数》第六版 第2章 · 数二线代必考',
      req: ['xd-mat-op'], reqLevel: 1, wip: false
    },
    {
      id: 'xd-mat-block', tier: 2, module: 'xd', chap: 'xd-c2', weight: 2, icon: '🧱',
      name: '分块矩阵',
      desc: '分块运算、分块对角矩阵的幂与逆、分块矩阵的行列式与秩',
      points: [
        '分块矩阵乘法与普通矩阵乘法规则一致',
        '分块对角阵的幂 = 各块分别求幂',
        '[[A,O],[O,B]] 的行列式 = |A||B|',
        '[[O,A],[B,O]] 的行列式 = (−1)^(mn)|A||B|'
      ],
      source: '同济《线性代数》第六版 第2章 · 数二抽象题工具',
      req: ['xd-mat-inv'], reqLevel: 2, wip: false
    },
    {
      id: 'xd-mat-elem', tier: 2, module: 'xd', chap: 'xd-c2', weight: 2, icon: '🔧',
      name: '初等变换与初等矩阵',
      desc: '三类初等变换、初等矩阵、左乘右乘的含义、等价标准形',
      points: [
        '左乘初等矩阵 = 行变换；右乘 = 列变换',
        '初等矩阵都可逆，逆还是同类初等矩阵',
        'A 等价于标准形 [[E_r, O],[O, O]]',
        '初等变换不改变矩阵的秩'
      ],
      source: '同济《线性代数》第六版 第3章 · 理解秩与可逆的钥匙',
      req: ['xd-mat-op'], reqLevel: 2, wip: false
    },
    {
      id: 'xd-mat-rank', tier: 1, module: 'xd', chap: 'xd-c2', weight: 3, icon: '🏅',
      name: '矩阵的秩',
      desc: '秩的定义（最高阶非零子式）、用初等行变换求秩、秩与方程组解的关系',
      points: [
        '化行阶梯形，非零行数就是秩',
        'r(A) = r(Aᵀ)，行秩 = 列秩',
        'r(PAQ) = r(A)（P、Q 可逆）',
        'r(A) = n ⇔ 满秩 ⇔ 可逆'
      ],
      source: '同济《线性代数》第六版 第3章 · 贯穿线代全书的枢纽',
      req: ['xd-mat-op'], reqLevel: 1, wip: false
    },
    {
      id: 'xd-mat-rankineq', tier: 3, module: 'xd', chap: 'xd-c2', weight: 3, icon: '📐',
      name: '秩的不等式',
      desc: '秩的七条常用不等式、AB = O 型结论、A 与 AᵀA 的秩',
      points: [
        'r(A+B) ≤ r(A) + r(B)',
        'r(AB) ≤ min{r(A), r(B)}',
        'AB = O ⇒ r(A) + r(B) ≤ n（n 为 A 的列数）',
        'r(A) = r(AᵀA) = r(AAᵀ)'
      ],
      source: '同济《线性代数》第六版 第3章 · 数二线代压轴',
      req: ['xd-mat-rank'], reqLevel: 4, wip: false
    },

    /* ============================================================
     * 线性代数 · 第 3 章 向量组的线性相关性（4 个节点 / 占比 3.0%）
     * ============================================================ */
    {
      id: 'xd-vec-comb', tier: 1, module: 'xd', chap: 'xd-c3', weight: 2, icon: '➡️',
      name: '线性组合与线性表示',
      desc: '线性组合的定义、向量由向量组线性表示的判定、表示系数的求法',
      points: [
        'β 可由 α₁…αₛ 表示 ⇔ 方程组 [α₁…αₛ]x = β 有解',
        '⇔ r(α₁…αₛ) = r(α₁…αₛ, β)',
        '求表示系数：解方程组，通解即全部表示法',
        '非齐次有解 ⇔ β 落在向量组张成的空间里'
      ],
      source: '同济《线性代数》第六版 第4章 · 与方程组是一回事',
      req: ['xd-mat-rank'], reqLevel: 1, wip: false
    },
    {
      id: 'xd-vec-dep', tier: 2, module: 'xd', chap: 'xd-c3', weight: 3, icon: '🪢',
      name: '线性相关与线性无关',
      desc: '线性相关/无关的定义、判定定理、常见结论与证明题套路',
      points: [
        '线性相关 ⇔ 齐次方程组有非零解 ⇔ 秩 < 个数',
        '含零向量必相关；单个非零向量必无关',
        '向量个数 > 维数必相关',
        '证明无关：设 Σkᵢαᵢ = 0 推出所有 kᵢ = 0'
      ],
      source: '同济《线性代数》第六版 第4章 · 数二证明题核心',
      req: ['xd-vec-comb'], reqLevel: 2, wip: false
    },
    {
      id: 'xd-vec-max', tier: 2, module: 'xd', chap: 'xd-c3', weight: 2, icon: '🎖️',
      name: '极大无关组与向量组的秩',
      desc: '极大线性无关组的定义与求法、向量组的秩、其余向量的表示',
      points: [
        '把向量组按列排成矩阵，化行阶梯形',
        '主元所在列对应的原向量构成极大无关组',
        '必须回到原向量取，不能用变换后的向量',
        '其余向量用极大无关组表示：继续化行最简'
      ],
      source: '同济《线性代数》第六版 第4章 · 数二计算题常客',
      req: ['xd-vec-dep'], reqLevel: 2, wip: false
    },
    {
      id: 'xd-vec-equiv', tier: 2, module: 'xd', chap: 'xd-c3', weight: 2, icon: '♻️',
      name: '向量组的等价',
      desc: '向量组等价的条件、等价与秩的关系、等价 ⇔ 互相线性表示',
      points: [
        '两向量组等价 ⇔ 可互相线性表示',
        '等价 ⇒ 秩相等；秩相等 ⇏ 等价（需同维且能互推）',
        'r(A) = r(B) = r(A|B) ⇔ A 与 B 的列向量组等价',
        '等价具有传递性'
      ],
      source: '同济《线性代数》第六版 第4章 · 数二选择题辨析',
      req: ['xd-vec-max'], reqLevel: 2, wip: false
    },

    /* ============================================================
     * 线性代数 · 第 4 章 线性方程组（4 个节点 / 占比 3.7%）
     * ============================================================ */
    {
      id: 'xd-solve-homo', tier: 2, module: 'xd', chap: 'xd-c4', weight: 3, icon: '🧩',
      name: '齐次方程组解的结构',
      desc: '齐次方程组有非零解的条件、基础解系、解空间的维数 n − r',
      points: [
        'Ax = 0 有非零解 ⇔ r(A) < n',
        '基础解系含 n − r(A) 个向量',
        '基础解系不唯一，但所含向量个数唯一',
        '任一解都是基础解系的线性组合'
      ],
      source: '同济《线性代数》第六版 第3章 · 数二必考大题',
      req: ['xd-mat-rank'], reqLevel: 2, wip: false
    },
    {
      id: 'xd-solve-nonhomo', tier: 2, module: 'xd', chap: 'xd-c4', weight: 3, icon: '🧷',
      name: '非齐次方程组解的结构',
      desc: '解的存在性判定、通解 = 特解 + 齐次通解、解的性质（两解之差是齐次解）',
      points: [
        '有解 ⇔ r(A) = r(A|b)；唯一解 ⇔ 秩 = n',
        '通解 = 一个特解 + 导出组的通解',
        'η₁ − η₂ 是 Ax = 0 的解',
        '（η₁+η₂)/2 之类组合是否为解要回代验证'
      ],
      source: '同济《线性代数》第六版 第3章 · 数二必考大题',
      req: ['xd-solve-homo'], reqLevel: 2, wip: false
    },
    {
      id: 'xd-solve-param', tier: 3, module: 'xd', chap: 'xd-c4', weight: 3, icon: '🎛️',
      name: '含参数的方程组讨论',
      desc: '带参数方程组的分类讨论、行列式为零的临界值、解的个数与参数关系',
      points: [
        '先算系数行列式 |A|，令 |A| = 0 找临界参数值',
        '|A| ≠ 0 时唯一解；|A| = 0 时再回代讨论',
        '回代时务必用原方程组，不能用化简后的',
        '讨论要穷尽，别漏参数值'
      ],
      source: '同济《线性代数》第六版 第3章 · 数二线代压轴常客',
      req: ['xd-solve-nonhomo'], reqLevel: 4, wip: false
    },
    {
      id: 'xd-solve-common', tier: 3, module: 'xd', chap: 'xd-c4', weight: 2, icon: '🔀',
      name: '同解方程组与公共解',
      desc: '两方程组同解的判定、公共解的求法、由同解反求参数',
      points: [
        'Ax = 0 与 Bx = 0 同解 ⇔ r(A) = r(B) = r([[A],[B]])',
        '同解时两者基础解系可互相表示',
        '求公共解：联立成一个大方程组解之',
        '已知同解求参数：先解一个再代入另一个'
      ],
      source: '同济《线性代数》第六版 第3章 · 数二选择压轴',
      req: ['xd-solve-nonhomo'], reqLevel: 4, wip: false
    },

    /* ============================================================
     * 线性代数 · 第 5 章 特征值与相似对角化（4 个节点 / 占比 4.3%）
     * ============================================================ */
    {
      id: 'xd-eig-calc', tier: 1, module: 'xd', chap: 'xd-c5', weight: 4, icon: '🎯',
      name: '特征值与特征向量的计算',
      desc: '特征多项式 |λE − A| = 0、特征向量求法、迹与行列式的快速校验',
      points: [
        '解 |λE − A| = 0 得全部特征值',
        '对每个 λ 解 (λE − A)x = 0 得特征向量',
        'Σλᵢ = tr(A)，∏λᵢ = |A|（算完必须校验）',
        '特征向量不能取零向量'
      ],
      source: '同济《线性代数》第六版 第5章 · 数二线代必考大题第一步',
      req: ['xd-mat-inv'], reqLevel: 1, wip: false
    },
    {
      id: 'xd-eig-sim', tier: 2, module: 'xd', chap: 'xd-c5', weight: 4, icon: '🔁',
      name: '相似与相似对角化',
      desc: '相似的判定与性质、可对角化的充要条件、相似对角化的完整步骤',
      points: [
        'A ~ B：存在可逆 P 使 P⁻¹AP = B，相似矩阵特征值相同',
        'A 可对角化 ⇔ 每个特征值的几何重数 = 代数重数',
        'n 个互异特征值 ⇒ 一定可对角化',
        '步骤：求 λ → 求特征向量 → 拼成 P'
      ],
      source: '同济《线性代数》第六版 第5章 · 数二线代固定大题',
      req: ['xd-eig-calc'], reqLevel: 2, wip: false
    },
    {
      id: 'xd-eig-sym', tier: 2, module: 'xd', chap: 'xd-c5', weight: 3, icon: '🪞',
      name: '实对称矩阵的正交对角化',
      desc: '实对称矩阵的性质、不同特征值的特征向量正交、施密特正交化与单位化',
      points: [
        '实对称矩阵的特征值全为实数，且一定可对角化',
        '不同特征值对应的特征向量必正交',
        '重根内的特征向量需施密特正交化',
        '最后必须单位化：QᵀAQ = Λ，Q 为正交矩阵'
      ],
      source: '同济《线性代数》第六版 第5章 · 数二二次型前置',
      req: ['xd-eig-sim'], reqLevel: 2, wip: false
    },
    {
      id: 'xd-eig-abstract', tier: 3, module: 'xd', chap: 'xd-c5', weight: 2, icon: '🌀',
      name: '抽象矩阵的特征值问题',
      desc: '由矩阵方程（A² = A、A² = E 等）推特征值、f(A) 的特征值、A* 与 A⁻¹ 的特征值',
      points: [
        'A² = A ⇒ λ² = λ ⇒ λ = 0 或 1',
        '若 Aα = λα，则 f(A)α = f(λ)α',
        'A⁻¹ 的特征值是 1/λ，A* 的是 |A|/λ',
        'A 与 Aᵀ 特征值相同（但特征向量一般不同）'
      ],
      source: '同济《线性代数》第六版 第5章 · 数二线代压轴',
      req: ['xd-eig-sym'], reqLevel: 4, wip: false
    },

    /* ============================================================
     * 线性代数 · 第 6 章 二次型（4 个节点 / 占比 3.0%）
     * ============================================================ */
    {
      id: 'xd-qf-mat', tier: 1, module: 'xd', chap: 'xd-c6', weight: 2, icon: '🪞',
      name: '二次型的矩阵表示',
      desc: '二次型与对称矩阵的一一对应、写二次型矩阵、矩阵的秩即二次型的秩',
      points: [
        '平方项系数写在主对角线，交叉项系数要除以 2',
        'f = xᵀAx 中的 A 必须取对称矩阵（唯一）',
        '二次型的秩 = r(A)',
        '变量替换 x = Cy 后 f = yᵀ(CᵀAC)y'
      ],
      source: '同济《线性代数》第六版 第5章 · 二次型第一问',
      req: ['xd-eig-calc'], reqLevel: 1, wip: false
    },
    {
      id: 'xd-qf-standard', tier: 2, module: 'xd', chap: 'xd-c6', weight: 3, icon: '📐',
      name: '化二次型为标准形',
      desc: '配方法、正交变换法、两者的区别与适用场景',
      points: [
        '配方法：逐个变量配方，所得变换矩阵 C 只需可逆',
        '正交变换法：先求 A 的特征值，再正交单位化',
        '标准形不唯一，但正负惯性指数唯一',
        '正交变换保持几何形状（长度不变）'
      ],
      source: '同济《线性代数》第六版 第5章 · 数二线代固定大题',
      req: ['xd-qf-mat', 'xd-eig-sym'], reqLevel: 2, wip: false
    },
    {
      id: 'xd-qf-inertia', tier: 2, module: 'xd', chap: 'xd-c6', weight: 2, icon: '⚖️',
      name: '惯性定理与合同',
      desc: '惯性定理、正负惯性指数、规范形、合同的判定',
      points: [
        '惯性定理：正、负平方项个数由二次型本身唯一决定',
        '规范形：系数只有 1 和 −1（按正负惯性指数写）',
        'A ≃ B（合同）⇔ 正负惯性指数相同',
        '合同不要求相似；相似也不一定合同'
      ],
      source: '同济《线性代数》第六版 第5章 · 数二选择辨析',
      req: ['xd-qf-standard'], reqLevel: 2, wip: false
    },
    {
      id: 'xd-qf-positive', tier: 2, module: 'xd', chap: 'xd-c6', weight: 2, icon: '✅',
      name: '正定二次型',
      desc: '正定的定义与五个等价判定、顺序主子式判别法、由正定反求参数',
      points: [
        '正定 ⇔ 特征值全为正 ⇔ 正惯性指数 = n',
        '⇔ 各阶顺序主子式全大于零',
        '⇔ 存在可逆 C 使 A = CᵀC',
        '必要条件：主对角元全大于零（可用来快速排除）'
      ],
      source: '同济《线性代数》第六版 第5章 · 数二必考题型',
      req: ['xd-qf-standard'], reqLevel: 2, wip: false
    }
  ]
};

// ⚠️ 这一行不能少：store.js / engine.js / app.js 都读 NS.NODES，
//    漏掉它会让 snapshot() 直接抛 TypeError（读不到 tiers）
window.HNSF829.NODES = window.HNSF829_NODES;
