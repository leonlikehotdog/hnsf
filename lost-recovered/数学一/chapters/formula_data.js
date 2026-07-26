/**
 * 考研数学一 · 公式速查（精简版）
 * 每条 = 公式 + 简要证明
 * 不混入例题 / 练习题
 *
 * 字段说明：
 * - name: 公式名称
 * - formula: LaTeX 公式
 * - proof: 简要证明思路（1-3 句话）
 * - note: 关键提醒（仅当容易出错时才写）
 */
window.FORMULA_DATA = window.FORMULA_DATA || {};

// =============================================================================
// ch01 函数、极限、连续
// =============================================================================
window.FORMULA_DATA['ch01'] = {
    chapter: '函数、极限、连续',
    sections: [
        {
            title: '🎯 必背：等价无穷小（x→0）',
            importance: '★★★★★',
            items: [
                { name: '正弦类', formula: '\\(sin x \\sim x,\\ \\ tan x \\sim x,\\ \\ arcsin x \\sim x,\\ \\ arctan x \\sim x\\)', proof: '由 \\(\\lim\\frac{sin x}{x}=1\\) 及 \\(arctan\\) 与 \\(tan\\) 互为反函数' },
                { name: '对数指数', formula: '\\(ln(1+x)\\sim x,\\ \\ e^x-1\\sim x,\\ \\ a^x-1\\sim x\\,ln a\\)', proof: '由 \\(e^x\\) 在 0 处泰勒展开：\\(e^x=1+x+o(x)\\)；对 \\(ln\\) 同理' },
                { name: '幂函数', formula: '\\((1+x)^\\alpha-1\\sim\\alpha x\\)', proof: '泰勒：\\((1+x)^\\alpha=1+\\alpha x+o(x)\\)' },
                { name: '余弦差', formula: '\\(1-cos x\\sim\\frac{x^2}{2}\\)', proof: '\\(1-cos x=2sin^2\\frac{x}{2}\\sim 2(\\frac{x}{2})^2=\\frac{x^2}{2}\\)' },
                { name: '对数差', formula: '\\(ln(1+x)-x\\sim-\\frac{x^2}{2}\\)', proof: '泰勒：\\(ln(1+x)=x-\\frac{x^2}{2}+o(x^2)\\)' }
            ]
        },
        {
            title: '🎯 必背：两个重要极限',
            importance: '★★★★★',
            items: [
                { name: '第一重要极限', formula: '\\(\\lim\\limits_{x\\to 0}\\frac{sin x}{x}=1\\)', proof: '单位圆夹逼：\\(\\cos x\\le\\frac{sin x}{x}\\le 1\\)，由夹逼得 1', note: '适用前提：分子分母都→0，且形式 sin(□)/□，□→0' },
                { name: '第二重要极限', formula: '\\(\\lim\\limits_{x\\to\\infty}(1+\\frac{1}{x})^x=e\\)', proof: '取对数：\\(x\\,ln(1+\\frac{1}{x})\\to\\frac{1}{1/x}\\cdot\\frac{1}{x^2}\\cdot\\text{...}=\\text{洛必达得}1\\)，故 \\(e^1=e\\)' },
                { name: '推广形式', formula: '\\(\\lim\\limits_{\\square\\to 0}(1+\\square)^{1/\\square}=e\\)', proof: '是第二极限的等价形式' }
            ]
        },
        {
            title: '🎯 必背：洛必达法则',
            importance: '★★★★★',
            items: [
                { name: '适用条件', formula: '\\(0/0\\) 或 \\(\\infty/\\infty\\) 型，\\(\\lim\\frac{f}{g}\\) 不定，且 \\(\\lim\\frac{f\\prime}{g\\prime}\\) 存在 → \\(\\lim\\frac{f}{g}=\\lim\\frac{f\\prime}{g\\prime}\\)', proof: '由柯西中值定理：\\(\\frac{f(b)-f(a)}{g(b)-g(a)}=\\frac{f\\prime(\\xi)}{g\\prime(\\xi)}\\)，取极限即得' },
                { name: '∞−∞ 必先通分', formula: '通分后化为 \\(0/0\\) 或 \\(\\infty/\\infty\\) 再用', proof: '洛必达只对 0/0 或 ∞/∞ 有效' }
            ]
        },
        {
            title: '🎯 必背：变限积分求导',
            importance: '★★★★★',
            items: [
                { name: '基本公式', formula: '\\(\\frac{d}{dx}\\int_a^x f(t)\\,dt=f(x)\\)', proof: '微积分基本定理（FTC）：设 \\(F\\) 是 \\(f\\) 的原函数，则 \\(\\int_a^x f=F(x)-F(a)\\)，求导 \\(F\\prime(x)=f(x)\\)' },
                { name: '上限是函数', formula: '\\(\\frac{d}{dx}\\int_a^{\\varphi(x)}f(t)\\,dt=f(\\varphi(x))\\cdot\\varphi\\prime(x)\\)', proof: '复合求导：令 \\(F(x)=\\int_a^{\\varphi(x)}f\\)，则 \\(F\\prime=f(\\varphi)\\cdot\\varphi\\prime\\)' },
                { name: '上下限都变', formula: '\\(\\frac{d}{dx}\\int_{\\psi(x)}^{\\varphi(x)}f(t)\\,dt=f(\\varphi)\\varphi\\prime-f(\\psi)\\psi\\prime\\)', proof: '拆为 \\(0\\) 到 \\(\\varphi\\) 减去 \\(0\\) 到 \\(\\psi\\)，再分别用链式法则' },
                { name: '被积函数含 x', formula: '例：\\(\\int_0^x \\sqrt{x-t}\\,e^t\\,dt\\) → 令 \\(u=x-t\\) 整体代换消 x', note: 'x 同时在上限和被积函数里，不能直接套公式' }
            ]
        },
        {
            title: '🎯 必背：泰勒展开',
            importance: '★★★★★',
            items: [
                { name: 'e^x', formula: '\\(e^x=1+x+\\frac{x^2}{2!}+\\frac{x^3}{3!}+\\cdots+\\frac{x^n}{n!}+o(x^n)\\)', proof: '由 \\(e^x\\) 任意阶可导且 \\((e^x)^{(k)}=e^x\\)，在 0 处取值为 1 代入麦克劳林公式' },
                { name: 'sin x', formula: '\\(sin x=x-\\frac{x^3}{3!}+\\frac{x^5}{5!}-\\cdots\\)', proof: '\\(sin^{(k)}(0)\\) 周期为 4：1, 0, −1, 0, ... 代入麦克劳林' },
                { name: 'cos x', formula: '\\(cos x=1-\\frac{x^2}{2!}+\\frac{x^4}{4!}-\\cdots\\)', proof: '\\(cos^{(k)}(0)\\) 周期为 4：1, 0, −1, 0, ... 代入麦克劳林' },
                { name: 'ln(1+x)', formula: '\\(ln(1+x)=x-\\frac{x^2}{2}+\\frac{x^3}{3}-\\cdots\\ (-1<x\\le 1)\\)', proof: '\\(\\frac{1}{1+t}=\\sum(-t)^k\\) 在 \\((-1,1)\\) 逐项积分 \\(0\\) 到 \\(x\\)' },
                { name: '1/(1-x)', formula: '\\(\\frac{1}{1-x}=1+x+x^2+\\cdots\\ (|x|<1)\\)', proof: '几何级数求和：等比数列 \\(1, q, q^2, ...\\) 在 \\(|q|<1\\) 收敛于 \\(\\frac{1}{1-q}\\)' },
                { name: '(1+x)^α', formula: '\\((1+x)^\\alpha=1+\\alpha x+\\frac{\\alpha(\\alpha-1)}{2!}x^2+\\cdots\\)', proof: '用 Leibniz 公式求各阶导数在 0 处的值代入麦克劳林' }
            ]
        },
        {
            title: '🎯 必背：数列极限',
            importance: '★★★★',
            items: [
                { name: '夹逼定理', formula: '若 \\(a_n\\le b_n\\le c_n\\) 且 \\(lim a_n=lim c_n=L\\)，则 \\(lim b_n=L\\)', proof: '由单调有界原理：\\(\\lim a_n=L\\Rightarrow\\) 对 \\(\\varepsilon>0\\)，\\(\\exists N\\) 使 \\(n>N\\) 时 \\(L-\\varepsilon<a_n\\)；同理 \\(c_n<L+\\varepsilon\\)；夹逼 \\(b_n\\)' },
                { name: '单调有界原理', formula: '单调递增有上界 / 单调递减有下界 的数列必收敛', proof: '由确界原理：上确界存在 \\(M\\)，证 \\(x_n\\to M\\)。对 \\(\\varepsilon>0\\)，\\(M-\\varepsilon\\) 不是上界 → \\(\\exists N\\)，\\(n>N\\) 时 \\(M-\\varepsilon<x_n\\le M\\)' },
                { name: '定积分定义', formula: '\\(\\lim\\limits_{n\\to\\infty}\\sum\\limits_{i=1}^n\\frac{1}{n}f(\\frac{i}{n})=\\int_0^1 f(x)\\,dx\\)', proof: '由定积分定义：区间 \\([0,1]\\) 划分为 \\(n\\) 等分，每个子区间 \\([\\frac{i-1}{n},\\frac{i}{n}]\\) 取右端点 \\(\\frac{i}{n}\\)，求和取极限' }
            ]
        }
    ]
};

// =============================================================================
// ch02 一元函数微分学
// =============================================================================
window.FORMULA_DATA['ch02'] = {
    chapter: '一元函数微分学',
    sections: [
        {
            title: '🎯 必背：基本求导公式',
            importance: '★★★★★',
            items: [
                { name: '幂函数', formula: '(x^n)\'=nx^{n-1},\\ (C)\'=0', proof: '由定义 \\(f\\prime(x)=\\lim\\frac{(x+\\Delta x)^n-x^n}{\\Delta x}\\)，用二项式展开' },
                { name: '三角函数', formula: '(sin x)\'=cos x,\\ (cos x)\'=-sin x', proof: '由定义 + 和差化积：\\(\\frac{sin(x+\\Delta x)-sin x}{\\Delta x}=\\frac{2cos(x+\\frac{\\Delta x}{2})sin\\frac{\\Delta x}{2}}{\\Delta x}\\) 取极限' },
                { name: '指数函数', formula: '(e^x)\'=e^x,\\ (a^x)\'=a^x ln a', proof: '\\((e^x)\'\\)：由 \\(e=\\lim(1+\\frac{1}{n})^n\\) 推导；\\((a^x)\'=e^{x\\,ln a}\\) 用链式' },
                { name: '对数函数', formula: '(ln x)\'=\\frac{1}{x}', proof: '由 \\((e^x)\'=e^x\\) + 反函数求导' },
                { name: '反三角', formula: '(arctan x)\'=\\frac{1}{1+x^2},\\ (arcsin x)\'=\\frac{1}{\\sqrt{1-x^2}}', proof: '由反函数求导：\\((f^{-1})\\prime(x)=\\frac{1}{f\\prime(f^{-1}(x))}\\)' }
            ]
        },
        {
            title: '🎯 必背：求导法则',
            importance: '★★★★★',
            items: [
                { name: '复合函数链式', formula: '\\((f\\circ g)\\prime(x)=f\\prime(g(x))\\cdot g\\prime(x)\\)', proof: '由极限乘法：\\(\\lim\\frac{f(g(x+\\Delta x))-f(g(x))}{\\Delta x}=\\lim\\frac{f(g+\\Delta g)-f(g)}{\\Delta g}\\cdot\\frac{\\Delta g}{\\Delta x}\\)' },
                { name: '隐函数求导', formula: 'F(x,y)=0 → 等式两边对 x 求导 → 解出 y\'', proof: 'y 是 x 的隐函数，由多元复合求导' },
                { name: '反函数求导', formula: '\\((f^{-1})\\prime(x)=\\frac{1}{f\\prime(f^{-1}(x))}\\)', proof: '由 \\(f(f^{-1}(x))=x\\) 两边求导 + 链式法则' },
                { name: '参数方程求导', formula: '\\(\\frac{dy}{dx}=\\frac{\\psi\\prime(t)}{\\varphi\\prime(t)}\\)', proof: '\\(y=\\psi(t), x=\\varphi(t)\\)；由 \\(dy=(\\frac{dy}{dt})dt\\) 和 \\(dx=(\\frac{dx}{dt})dt\\) 相比' },
                { name: 'Leibniz 公式', formula: '\\((uv)^{(n)}=\\sum\\limits_{k=0}^n\\binom{n}{k}u^{(k)}v^{(n-k)}\\)', proof: '由二项式定理 + 乘积求导归纳' }
            ]
        },
        {
            title: '🎯 必背：中值定理',
            importance: '★★★★★',
            items: [
                { name: '罗尔定理', formula: 'f∈C[a,b]，可导 (a,b)，f(a)=f(b) → ∃ξ∈(a,b)，f\\prime(ξ)=0', proof: '极值点必有 \\(f\\prime=0\\)：若 \\(f\\) 在 \\((\\xi\\in(a,b))\\) 取极值且可导，则 \\(f\\prime(\\xi)=0\\)' },
                { name: '拉格朗日中值', formula: 'f∈C[a,b]，可导 (a,b) → ∃ξ∈(a,b)，f(b)-f(a)=f\\prime(ξ)(b-a)', proof: '构造辅助函数 \\(F(x)=f(x)-[\\frac{f(b)-f(a)}{b-a}(x-a)+f(a)]\\)，则 \\(F(a)=F(b)=0\\)，由罗尔定理得 \\(F\\prime(\\xi)=0\\)' },
                { name: '柯西中值', formula: 'f,g∈C[a,b]，可导且 g\\prime≠0 → ∃ξ，\\(\\frac{f(b)-f(a)}{g(b)-g(a)}=\\frac{f\\prime(\\xi)}{g\\prime(\\xi)}\\)', proof: '辅助函数 \\(F=f-\\frac{f(b)-f(a)}{g(b)-g(a)}[g-g(a)]-f(a)\\)，\\(F(a)=F(b)=0\\) 用罗尔' }
            ]
        },
        {
            title: '🎯 必背：泰勒公式',
            importance: '★★★★★',
            items: [
                { name: '麦克劳林（皮亚诺余项）', formula: '\\(f(x)=\\sum\\limits_{k=0}^n\\frac{f^{(k)}(0)}{k!}x^k+o(x^n)\\)', proof: '由柯西中值定理反复用，或对 \\(f(x)-P_n(x)\\) 用洛必达' },
                { name: '泰勒（拉格朗日余项）', formula: '\\(f(x)=\\sum\\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k+\\frac{f^{(n+1)}(\\xi)}{(n+1)!}(x-x_0)^{n+1}\\)', proof: '构造 \\(R_n(x)\\) 用 \\(n+1\\) 次罗尔定理' }
            ]
        },
        {
            title: '🎯 必背：极值与拐点',
            importance: '★★★★',
            items: [
                { name: '极值必要条件', formula: 'f 在 \\(x_0\\) 可导且取极值 → \\(f\\prime(x_0)=0\\)', proof: '极值点导数必为 0（极值定理的逆）' },
                { name: '极值第一充分条件', formula: '\\(f\\prime(x)\\) 在 \\(x_0\\) 两侧变号 → 极值', proof: '由导数符号反映单调性：左正右负 → 先增后减 = 极大' },
                { name: '极值第二充分条件', formula: '\\(f\\prime(x_0)=0,\\ f\\prime\\prime(x_0)\\neq 0\\)：>0 极小，<0 极大', proof: '由二阶泰勒：\\(f(x)\\approx f(x_0)+\\frac{f\\prime\\prime(x_0)}{2}(x-x_0)^2\\)' },
                { name: '拐点判别', formula: '\\(\\int_0^1\\) 拐点 ⇔ \\(f\\prime\\prime\\) 变号（且 \\(f\\prime\\prime\\) 连续则 \\(f\\prime\\prime(x_0)=0\\))', proof: '凹 / 凸是 \\(f\\prime\\prime\\) 的正负决定的，符号翻转处为拐点' }
            ]
        }
    ]
};

// =============================================================================
// ch03 一元函数积分学
// =============================================================================
window.FORMULA_DATA['ch03'] = {
    chapter: '一元函数积分学',
    sections: [
        {
            title: '🎯 必背：基本积分公式（反求导）',
            importance: '★★★★★',
            items: [
                { name: '幂函数', formula: '\\(\\int x^\\alpha dx=\\frac{x^{\\alpha+1}}{\\alpha+1}+C\\ (\\alpha\\neq-1)\\)', proof: '由 \\((\\frac{x^{\\alpha+1}}{\\alpha+1})\\prime=x^\\alpha\\)' },
                { name: '对数函数', formula: '\\(\\int\\frac{1}{x}dx=ln|x|+C\\)', proof: '由 \\((ln|x|)^\\prime=\\frac{1}{x}\\)，x>0 直接；x<0 由复合求导' },
                { name: '指数函数', formula: '\\(\\int e^x dx=e^x+C,\\ \\int a^x dx=\\frac{a^x}{ln a}+C\\)', proof: '由 \\((e^x)\'=e^x\\)' },
                { name: '三角函数', formula: '\\(\\int sin x\\,dx=-cos x+C,\\ \\int cos x\\,dx=sin x+C\\)', proof: '由求导公式反推' }
            ]
        },
        {
            title: '🎯 必背：积分方法',
            importance: '★★★★★',
            items: [
                { name: '第一类换元（凑微分）', formula: '\\(\\int f(\\varphi(x))\\varphi\\prime(x)dx=\\int f(u)du\\)', proof: '令 \\(u=\\varphi(x)\\)：左边 \\(=\\int f(u)du\\)' },
                { name: '第二类换元', formula: '\\(\\int f(x)dx=\\int f(\\psi(t))\\psi\\prime(t)dt\\)（x=ψ(t) 单调）', proof: '单调可导函数求导非零 → 换元后定积分上下限需对应改' },
                { name: '分部积分法', formula: '\\(\\int u\\,dv=uv-\\int v\\,du\\)', proof: '由乘积求导 \\((uv)^\\prime=u\\prime v+uv\\prime\\) → \\(uv\\prime=(uv)^\\prime-u\\prime v\\) 两边积分' },
                { name: '分部顺序（反对幂三指）', formula: '指三最后选：设 \\(u\\) 顺序：反三角 > 对数 > 幂 > 三角 > 指数', proof: '经验法则：让 \\(u\\) 经求导变简单（反三角/对数变 \\(1/x^k\\)，幂变低次，指数不变）' }
            ]
        },
        {
            title: '🎯 必背：定积分',
            importance: '★★★★★',
            items: [
                { name: '牛顿-莱布尼茨', formula: '\\(\\int_a^b f(x)dx=F(b)-F(a)\\)，\\(F\\prime=f\\)', proof: '由微积分基本定理：\\(F\\) 是 \\(f\\) 的原函数' },
                { name: '变限积分求导', formula: '见 ch01 公式区', proof: '同 ch01' },
                { name: '奇偶性', formula: '奇函数：\\(\\int_{-a}^a f=0\\)；偶函数：\\(\\int_{-a}^a f=2\\int_0^a f\\)', proof: '拆分 \\(\\int_{-a}^a=\\int_{-a}^0+\\int_0^a\\)，奇函数前半 \\(=-\\) 后半' },
                { name: '周期性', formula: '\\(\\int_a^{a+T}f=\\int_0^T f\\)（T 为周期）', proof: '平移积分区间 [a,a+T] 到 [0,T]，由周期性函数值不变' },
                { name: '区间可加', formula: '\\(\\int_a^b=\\int_a^c+\\int_c^b\\)', proof: '由定积分定义：分 [a,b] 为 n 份时，c 是某分点' }
            ]
        },
        {
            title: '🎯 必背：反常积分',
            importance: '★★★',
            items: [
                { name: '无穷限', formula: '\\(\\int_a^{+\\infty}f=\\lim\\limits_{b\\to+\\infty}\\int_a^b f\\)', proof: '无穷限的极限定义' },
                { name: '无界点', formula: 'b 为瑕点：\\(\\int_a^b f=\\lim\\limits_{\\varepsilon\\to 0^+}\\int_a^{b-\\varepsilon}f\\)', proof: '瑕点处无界 → 单侧极限' },
                { name: 'p-积分审敛', formula: '\\(\\int_1^{+\\infty}\\frac{1}{x^p}dx\\)：p>1 收敛，p≤1 发散', proof: 'p≠1 时 \\(\\int x^{-p}dx=\\frac{x^{1-p}}{1-p}\\)，代入上下限得；p=1 时为 \\(ln x\\) 发散' }
            ]
        }
    ]
};

// =============================================================================
// ch04 向量代数与空间解析几何
// =============================================================================
window.FORMULA_DATA['ch04'] = {
    chapter: '向量代数与空间解析几何',
    sections: [
        {
            title: '🎯 必背：向量运算',
            importance: '★★★★★',
            items: [
                { name: '数量积', formula: '\\(\\vec{a}\\cdot\\vec{b}=|\\vec{a}||\\vec{b}|cos\\theta\\)（θ 是夹角）', proof: '由投影定义：\\(\\vec{a}\\cdot\\vec{b}=|\\vec{a}|\\cdot|\\vec{b}|\\cos\\theta\\)' },
                { name: '向量积模', formula: '\\(|\\vec{a}\\times\\vec{b}|=|\\vec{a}||\\vec{b}|sin\\theta\\)', proof: '由几何意义：\\(|\\vec{a}\\times\\vec{b}|\\) = \\(a\\)、\\(b\\) 构成的平行四边形面积' },
                { name: '混合积', formula: '\\([\\vec{a},\\vec{b},\\vec{c}]=(\\vec{a}\\times\\vec{b})\\cdot\\vec{c}=\\text{6倍平行六面体体积}\\)', proof: '底面积 \\(|\\vec{a}\\times\\vec{b}|\\) 乘高 \\(=\\) 体积' },
                { name: 'Lagrange 恒等式', formula: '\\(|\\vec{a}\\times\\vec{b}|^2+(\\vec{a}\\cdot\\vec{b})^2=|\\vec{a}|^2|\\vec{b}|^2\\)', proof: '展开两边：\\(|\\vec{a}\\times\\vec{b}|^2=\\sum(a_i b_j-a_j b_i)^2\\)，合并即得' }
            ]
        },
        {
            title: '🎯 必背：平面与直线',
            importance: '★★★★★',
            items: [
                { name: '平面点法式', formula: '\\(A(x-x_0)+B(y-y_0)+C(z-z_0)=0\\)，\\((A,B,C)\\) 是法向量', proof: '法向量垂直于平面上所有向量 → \\((A,B,C)\\cdot(x-x_0, y-y_0, z-z_0)=0\\)' },
                { name: '直线对称式', formula: '\\(\\frac{x-x_0}{l}=\\frac{y-y_0}{m}=\\frac{z-z_0}{n}\\)，\\((l,m,n)\\) 是方向向量', proof: '直线上方向向量与任意方向向量平行 → 分量成比例' },
                { name: '点到平面距离', formula: '\\(d=\\frac{|Ax_0+By_0+Cz_0+D|}{\\sqrt{A^2+B^2+C^2}}\\)', proof: '\\(d=|\\vec{n}\\cdot\\vec{M_0M}|/\\vec{n}|\\)' },
                { name: '点到直线距离', formula: '\\(d=\\frac{|\\vec{s}\\times\\vec{M_0M}|}{|\\vec{s}|}\\)', proof: '\\(|\\vec{s}\\times\\vec{M_0M}|\\) 是底为 \\(|\\vec{s}|\\)、高为 \\(d\\) 的平行四边形面积' }
            ]
        },
        {
            title: '🎯 必背：常用二次曲面',
            importance: '★★★',
            items: [
                { name: '椭球面', formula: '\\(\\frac{x^2}{a^2}+\\frac{y^2}{b^2}+\\frac{z^2}{c^2}=1\\)', proof: '球面 \\(a=b=c\\)，椭圆 \(\\to\\) 三轴伸缩' },
                { name: '椭圆锥面', formula: '\\(z^2=\\frac{x^2}{a^2}+\\frac{y^2}{b^2}\\)', proof: '直线族绕 z 轴旋转' },
                { name: '椭圆抛物面', formula: '\\(z=\\frac{x^2}{a^2}+\\frac{y^2}{b^2}\\)', proof: '抛物线绕 z 轴旋转' }
            ]
        }
    ]
};

// =============================================================================
// ch05 多元函数微分学
// =============================================================================
window.FORMULA_DATA['ch05'] = {
    chapter: '多元函数微分学',
    sections: [
        {
            title: '🎯 必背：偏导与全微分',
            importance: '★★★★★',
            items: [
                { name: '偏导定义', formula: '\\(\\frac{\\partial f}{\\partial x}=\\lim\\limits_{\\Delta x\\to 0}\\frac{f(x+\\Delta x,y)-f(x,y)}{\\Delta x}\\)', proof: '一元导数定义的推广，y 当常数' },
                { name: '全微分', formula: '若 \\(df=A\\,dx+B\\,dy\\) 存在，则 \\(A=\\frac{\\partial f}{\\partial x},\\ B=\\frac{\\partial f}{\\partial y}\\)', proof: '由全增量 \\(\\Delta f=A\\Delta x+B\\Delta y+o(\\rho)\\) 两边除以 \\(\\Delta x\\) 取极限' },
                { name: '可微 ⟹ 偏导存在', formula: 'f 在 \\(x_0\\) 可微 → \\(\\frac{\\partial f}{\\partial x}(x_0)\\)、\\(\\frac{\\partial f}{\\partial y}(x_0)\\) 都存在', proof: '可微定义中 \\(A\\)、\\(B\\) 唯一存在' }
            ]
        },
        {
            title: '🎯 必背：复合函数链式',
            importance: '★★★★★',
            items: [
                { name: '一元链式', formula: 'z=f(u,v), u=u(x), v=v(x) → \\(z\\prime=f_1 u\\prime+f_2 v\\prime\\)', proof: '多元复合求导：z 是 x 的函数，逐分量求导' },
                { name: '二元链式', formula: 'z=f(u,v), u=u(x,y), v=v(x,y) → \\(\\frac{\\partial z}{\\partial x}=f_1\\frac{\\partial u}{\\partial x}+f_2\\frac{\\partial v}{\\partial x}\\)', proof: '固定 y，z 是 x 的复合函数用一元链式' },
                { name: '二阶偏导', formula: 'f_{12}=f_{21}（连续时）', proof: '混合偏导在连续条件下顺序可交换（Schwarz 定理）' }
            ]
        },
        {
            title: '🎯 必背：极值',
            importance: '★★★★',
            items: [
                { name: '无条件极值必要', formula: 'f 可微取极值 → \\(f_x=f_y=0\\)', proof: '极值点偏导为 0' },
                { name: '无条件极值充分', formula: '判别式 \\(AC-B^2>0\\)：A>0 极小，A<0 极大', proof: '二阶泰勒展开 + 二次型正定判定' },
                { name: '拉格朗日乘数法', formula: '条件极值：\\(L=f+\\lambda\\varphi\\)，解 \\(L_x=L_y=L_\\lambda=0\\)', proof: '梯度平行：\\(\\nabla f+\\lambda\\nabla\\varphi=0\\)' }
            ]
        }
    ]
};

// =============================================================================
// ch06 多元函数积分学
// =============================================================================
window.FORMULA_DATA['ch06'] = {
    chapter: '多元函数积分学',
    sections: [
        {
            title: '🎯 必背：二重积分',
            importance: '★★★★★',
            items: [
                { name: '直角坐标', formula: '\\(\\iint_D f\\,d\\sigma=\\int_a^b dx\\int_{\\varphi(x)}^{\\psi(x)}f(x,y)dy\\)', proof: '先对 y 积分（y 当常数），再对 x' },
                { name: '极坐标变换', formula: 'x=ρcosθ, y=ρsinθ, dσ=ρ\\,dρ\\,dθ', proof: '雅可比行列式 \\(|J|=\\rho\\)' },
                { name: '交换积分次序', formula: '画出区域 → 重新定上下限', proof: '由富比尼定理：二重积分可交换次序' }
            ]
        },
        {
            title: '🎯 必背：三重积分',
            importance: '★★★★',
            items: [
                { name: '柱坐标', formula: 'x=ρcosθ, y=ρsinθ, z=z, dV=ρ\\,dρ\\,dθ\\,dz', proof: '极坐标 + z 轴' },
                { name: '球坐标', formula: 'x=rsinφcosθ, y=rsinφsinθ, z=rcosφ, dV=r^2\\sinφ\\,dr\\,dφ\\,dθ', proof: '雅可比行列式 \\(|J|=r^2\\sin\\varphi\\)' }
            ]
        },
        {
            title: '🎯 必背：曲线曲面积分三大公式',
            importance: '★★★★★',
            items: [
                { name: '格林公式', formula: '\\(\\oint_L Pdx+Qdy=\\iint_D(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y})d\\sigma\\)', proof: '用二重积分化为二次积分 + 边界条件' },
                { name: '高斯公式', formula: '\\(\\oiint_\\Sigma Pdydz+Qdzdx+Rdxdy=\\iiint_\\Omega div\\vec{F}\\,dV\\)', proof: '三重积分化为三次积分 + 边界条件' },
                { name: '斯托克斯公式', formula: '\\(\\oint_\\Gamma Pd x+Qdy+Rdz=\\iint_\\Sigma rot\\vec{F}\\cdot d\\vec{S}\\)', proof: '由格林公式推广到三维边界' }
            ]
        }
    ]
};

// =============================================================================
// ch07 无穷级数
// =============================================================================
window.FORMULA_DATA['ch07'] = {
    chapter: '无穷级数',
    sections: [
        {
            title: '🎯 必背：审敛法',
            importance: '★★★★★',
            items: [
                { name: '等比级数', formula: '\\(|q|<1\\)：收敛于 \\(\\frac{a}{1-q}\\)；\\(|q|\\ge 1\\)：发散', proof: '部分和 \\(S_n=a\\frac{1-q^n}{1-q}\\)，\\(|q|<1\\) 时 \\(q^n\\to 0\\)' },
                { name: 'p-级数', formula: '\\(\\sum\\frac{1}{n^p}\\)：p>1 收敛，p≤1 发散', proof: 'p≠1 时 \\(\\int_1^\\infty x^{-p}dx=\\frac{1}{p-1}\\)（比较判别）；p=1 时 \\(\\int\\frac{1}{x}dx=\\ln x\\to\\infty\\)' },
                { name: '比较判别', formula: '\\(0\\le b_n\\le a_n\\)，\\(\\sum a_n\\) 收敛 → \\(\\sum b_n\\) 收敛', proof: '单调有界：\\(\\sum b_n\\) 部分和单调有上界（\\(\\sum a_n\\) 的部分和）' },
                { name: '比值判别', formula: '\\(\\lim\\frac{|a_{n+1}|}{|a_n|}=\\rho\\)：<1 收敛，>1 发散，=1 不定', proof: '由达朗贝尔判别：n 充分大后 \\(|a_{n+1}|\\le\\rho\\varepsilon\\cdot|a_n|\\)，几何级数收敛比较' },
                { name: '根值判别', formula: '\\(\\lim\\sqrt[n]{|a_n|}=\\rho\\)：<1 收敛，>1 发散', proof: '由柯西判别：n 充分大后 \\(|a_n|\\le\\rho^n\\)' },
                { name: 'Leibniz 判别', formula: '交错 \\(\\sum(-1)^n b_n\\)：\\(b_n\\) 单调减 + \\(\\to 0\\) → 收敛', proof: '部分和奇偶项夹逼同一极限' }
            ]
        },
        {
            title: '🎯 必背：幂级数',
            importance: '★★★★★',
            items: [
                { name: '收敛半径', formula: '\\(R=\\frac{1}{\\lim\\sqrt[n]{|a_n|}}\\) 或 \\(R=\\lim\\frac{|a_n|}{|a_{n+1}|}\\)', proof: '由根值 / 比值判别' },
                { name: '阿贝尔定理', formula: '若 \\(\\sum a_n x^n\\) 在 \\(x=R\\) 收敛，则在 \\((-R,R)\\) 绝对收敛', proof: '由比较判别 + 幂级数部分和' },
                { name: '收敛域', formula: '由 \\(R\\) 决定开区间；端点单独代入检验', proof: '端点可能条件收敛或发散' }
            ]
        },
        {
            title: '🎯 必背：常见函数展开',
            importance: '★★★★',
            items: [
                { name: 'e^x', formula: '\\(e^x=\\sum\\frac{x^n}{n!},\\ x\\in(-\\infty,+\\infty)\\)', proof: '由 \\(e^x\\) 各阶导数在 0 处 = 1 代入麦克劳林' },
                { name: 'sin x', formula: '\\(sin x=\\sum(-1)^n\\frac{x^{2n+1}}{(2n+1)!}\\)', proof: '\\(sin^{(2n)}(0)=0, sin^{(2n+1)}(0)=(-1)^n\\)' },
                { name: 'cos x', formula: '\\(cos x=\\sum(-1)^n\\frac{x^{2n}}{(2n)!}\\)', proof: '\\(cos^{(2n)}(0)=(-1)^n, cos^{(2n+1)}(0)=0\\)' },
                { name: 'ln(1+x)', formula: '\\(ln(1+x)=\\sum(-1)^{n-1}\\frac{x^n}{n},\\ x\\in(-1,1]\\)', proof: '\\(\\frac{1}{1+t}=\\sum(-t)^n\\) 逐项积分 0→x' },
                { name: '1/(1-x)', formula: '\\(\\frac{1}{1-x}=\\sum x^n,\\ |x|<1\\)', proof: '几何级数求和' },
                { name: '(1+x)^α', formula: '\\((1+x)^\\alpha=\\sum\\binom{\\alpha}{n}x^n,\\ |x|<1\\)', proof: 'Leibniz 公式求各阶导数代入' }
            ]
        }
    ]
};

// =============================================================================
// ch08 常微分方程
// =============================================================================
window.FORMULA_DATA['ch08'] = {
    chapter: '常微分方程',
    sections: [
        {
            title: '🎯 必背：一阶方程',
            importance: '★★★★★',
            items: [
                { name: '可分离', formula: '\\(g(y)dy=f(x)dx\\) → 两边积分', proof: '方程变形为 \\(\\frac{dy}{g(y)}=f(x)\\)，积分即得通解' },
                { name: '齐次方程', formula: '\\(\\frac{dy}{dx}=\\varphi(\\frac{y}{x})\\)，令 \\(u=\\frac{y}{x}\\) 化为可分离', proof: '\\(y=ux\\Rightarrow y\\prime=u+xu\\prime\\)，代入原方程化为可分离' },
                { name: '一阶线性', formula: '\\(y\\prime+P(x)y=Q(x)\\) → \\(y=e^{-\\int P}(\\int Qe^{\\int P}dx+C)\\)', proof: '两边乘 \\(e^{\\int P}\\) → \\((ye^{\\int P})\\prime=Qe^{\\int P}\\)，积分得' },
                { name: '伯努利', formula: '\\(y\\prime+P(x)y=Q(x)y^n\\) → 除 \\(y^n\\)，令 \\(z=y^{1-n}\\) 化为一阶线性', proof: '除 \\(y^n\\) 后 \\(y\\prime y^{-n}+Py^{1-n}=Q\\)，由 \\((y^{1-n})\\prime=(1-n)y^{-n}y\\prime\\)' }
            ]
        },
        {
            title: '🎯 必背：高阶方程',
            importance: '★★★★★',
            items: [
                { name: '可降阶（缺 y）', formula: '\\(y\\prime\\prime=f(x)\\) → 两次积分', proof: '逐次积分：先积一次得 y\'，再积一次得 y' },
                { name: '可降阶（缺 x）', formula: '\\(y\\prime\\prime=f(y,y\\prime)\\) → 令 \\(p=y\\prime,\\ y\\prime\\prime=p\\frac{dp}{dy}\\)', proof: 'y 是 x 的函数，但 p 作为 y 的函数' },
                { name: '二阶常系数齐次', formula: '特征根法：\\(r_1\\neq r_2\\)→\\(C_1e^{r_1 x}+C_2e^{r_2 x}\\)；重根→\\((C_1+C_2 x)e^{rx}\\)', proof: '代入 \\(y=e^{rx}\\) 得特征方程 \\(r^2+pr+q=0\\)' },
                { name: '特解形式（多项式×指数）', formula: '\\(f(x)=e^{\\alpha x}P_m(x)\\)：若 \\(\\alpha\\) 不是特征根 → \\(y^*=e^{\\alpha x}Q_m(x)\\)', proof: '代入方程比较系数' }
            ]
        }
    ]
};

// =============================================================================
// ch09 行列式
// =============================================================================
window.FORMULA_DATA['ch09'] = {
    chapter: '行列式',
    sections: [
        {
            title: '🎯 必背：性质',
            importance: '★★★★★',
            items: [
                { name: '转置不变', formula: '|A^T|=|A|', proof: '展开式对称' },
                { name: '互换行变号', formula: '两行（列）互换 → 行列式变号', proof: '反称性' },
                { name: '提公因子', formula: '某行有公因子 k → 提到外面（k^n 阶）', proof: 'k 提出后该行剩 \\(\\frac{1}{k}\\) 倍' },
                { name: '成比例 = 0', formula: '两行成比例 → 行列式 = 0', proof: '提取公因子后两行相同 → 互换变 0' },
                { name: '加法不变', formula: '某行乘 k 加到另一行 → 行列式不变', proof: '拆分 + 比例 = 0' }
            ]
        },
        {
            title: '🎯 必背：重要公式',
            importance: '★★★★★',
            items: [
                { name: '范德蒙行列式', formula: '\\(\\prod\\limits_{1\\le j<i\\le n}(a_i-a_j)\\)', proof: '由递推：\\(D_n=(a_n-a_1)(a_n-a_2)\\cdots(a_n-a_{n-1})D_{n-1}\\)，归纳' },
                { name: '上三角行列式', formula: '= 主对角元之积', proof: '展开式只剩主对角元乘积' },
                { name: '克拉默法则', formula: 'Ax=b 有唯一解 ⇔ |A|≠0 → \\(x_j=|A_j|/|A|\\)', proof: '由 A 可逆 + 逆矩阵 \\(A^{-1}=\\frac{1}{|A|}A^*\\)' }
            ]
        }
    ]
};

// =============================================================================
// ch10 矩阵
// =============================================================================
window.FORMULA_DATA['ch10'] = {
    chapter: '矩阵',
    sections: [
        {
            title: '🎯 必背：基本公式',
            importance: '★★★★★',
            items: [
                { name: '(AB)^{-1}', formula: '(AB)^{-1}=B^{-1}A^{-1}', proof: '(AB)(B^{-1}A^{-1})=A(BB^{-1})A^{-1}=E' },
                { name: 'A 与 A^* 关系', formula: 'AA^*=A^*A=|A|E', proof: '由 A^* 元素是代数余子式' },
                { name: 'A^{-1}', formula: 'A^{-1}=\\frac{1}{|A|}A^*', proof: '由 AA^*=|A|E 两边除以 |A|' },
                { name: '|kA|', formula: '|kA|=k^n|A|（n 阶）', proof: '每行提 k' },
                { name: '|AB|', formula: '|AB|=|A||B|', proof: '由行列式乘法定理' },
                { name: '|A^*|', formula: '|A^*|=|A|^{n-1}', proof: '由 |A^*A|=|A^*||A|，又 |A^*A|=|A|^n' },
                { name: '(A^*)^{-1}', formula: '(A^*)^{-1}=\\frac{1}{|A|}A', proof: '由 \\(AA^*=|A|E\\) → \\(A\\cdot\\frac{A^*}{|A|}=E\\)' }
            ]
        },
        {
            title: '🎯 必背：初等变换',
            importance: '★★★★',
            items: [
                { name: '三种初等变换', formula: '① 互换两行 ② 某行乘 k≠0 ③ 某行乘 k 加到另一行', proof: '对应三种初等矩阵，左乘右乘' },
                { name: '矩阵等价', formula: 'A ~ B（只用初等变换）→ r(A)=r(B)', proof: '初等变换不改变秩' }
            ]
        }
    ]
};

// =============================================================================
// ch11 向量（线性代数）
// =============================================================================
window.FORMULA_DATA['ch11'] = {
    chapter: '向量（线性代数）',
    sections: [
        {
            title: '🎯 必背：线性相关性',
            importance: '★★★★★',
            items: [
                { name: '线性相关', formula: '∃ 不全 0 的 \\(k_1,...,k_n\\)，\\(k_1\\alpha_1+\\cdots+k_n\\alpha_n=0\\)', proof: '非零系数线性组合为零' },
                { name: '线性无关', formula: '只有全 0 解', proof: '无关 = 唯一零表示' },
                { name: '判定法', formula: '多于向量个数的向量组必相关；含零向量必相关', proof: '由维数与向量数比较' },
                { name: '极大线性无关组', formula: '部分组线性无关 + 加任一向量都相关', proof: '极大性 = 不能再扩' }
            ]
        }
    ]
};

// =============================================================================
// ch12 线性方程组
// =============================================================================
window.FORMULA_DATA['ch12'] = {
    chapter: '线性方程组',
    sections: [
        {
            title: '🎯 必背：解的判定',
            importance: '★★★★★',
            items: [
                { name: '齐次解判定', formula: 'Ax=0：r(A)=n → 只有零解；r(A)<n → 非零解', proof: '由 r(A)+解空间维数 = n' },
                { name: '非齐次解判定', formula: 'Ax=b：r(A)=r(A|b) → 有解；≠ → 无解', proof: '由线性方程组相容定理' }
            ]
        },
        {
            title: '🎯 必背：解的结构',
            importance: '★★★★★',
            items: [
                { name: '齐次通解', formula: '基础解系的线性组合（n-r 个自由变量）', proof: '基础解系是解空间基' },
                { name: '非齐次通解', formula: '一个特解 + 齐次通解', proof: '解集 = 特解 + 齐次解（平移）' },
                { name: '基础解系求法', formula: '行最简形 → 选自由变量 → 求基础解系', proof: '高斯消元法' }
            ]
        }
    ]
};

// =============================================================================
// ch13 特征值与特征向量
// =============================================================================
window.FORMULA_DATA['ch13'] = {
    chapter: '特征值与特征向量',
    sections: [
        {
            title: '🎯 必背：核心公式',
            importance: '★★★★★',
            items: [
                { name: '特征方程', formula: '|λE-A|=0 → 求 λ', proof: 'Aξ=λξ → (λE-A)ξ=0 → 行列式为 0' },
                { name: '特征向量', formula: '(λE-A)x=0 的非零解', proof: '由特征方程' },
                { name: '迹 = 特征值之和', formula: 'tr(A)=Σλ_i', proof: '特征多项式 \\(\\lambda^n-tr(A)\\lambda^{n-1}+\\cdots\\)' },
                { name: '行列式 = 特征值之积', formula: '|A|=Πλ_i', proof: '特征多项式常数项 = (-1)^n|A|' },
                { name: '凯莱-哈密顿', formula: 'f(A)=0（f 是 A 的特征多项式）', proof: '由 \\(f(\\lambda)=0\\)，代入 A（注意 A 与 λE 交换）' }
            ]
        },
        {
            title: '🎯 必背：相似对角化',
            importance: '★★★★★',
            items: [
                { name: '对角化条件', formula: 'n 阶矩阵有 n 个线性无关特征向量', proof: '由 P^{-1}AP=diag(λ) 要求 P 列线性无关' },
                { name: '实对称必可对角化', formula: '实对称矩阵存在正交矩阵 P 使 \\(P^{-1}AP=diag\\)', proof: '谱定理：实对称特征值为实，特征向量可正交化' }
            ]
        }
    ]
};

// =============================================================================
// ch14 二次型
// =============================================================================
window.FORMULA_DATA['ch14'] = {
    chapter: '二次型',
    sections: [
        {
            title: '🎯 必背：基本概念',
            importance: '★★★★★',
            items: [
                { name: '二次型矩阵', formula: 'f=x^TAx，A 对称', proof: '对称化：\\(a_{ij}x_ix_j+a_{ji}x_jx_i\\to\\) 系数平均分给两者' },
                { name: '化标准形', formula: '\\(x=Cy\\)：\\(f=\\sum\\lambda_i y_i^2\\)', proof: '由正交变换对角化' },
                { name: '惯性定理', formula: '标准形中正项数 p、负项数 q 由 f 唯一确定（p+q=rank）', proof: '由正负特征值个数不变' }
            ]
        },
        {
            title: '🎯 必背：正定判定',
            importance: '★★★★★',
            items: [
                { name: '正定定义', formula: '∀x≠0，f=x^TAx>0', proof: '正定的本质定义' },
                { name: '顺序主子式', formula: 'Δ_k=|A 左上 k 阶|>0 (k=1,...,n) → 正定', proof: '由 Sylvester 判据' }
            ]
        }
    ]
};

// =============================================================================
// ch15 随机事件与概率
// =============================================================================
window.FORMULA_DATA['ch15'] = {
    chapter: '随机事件与概率',
    sections: [
        {
            title: '🎯 必背：基本公式',
            importance: '★★★★★',
            items: [
                { name: '加法', formula: 'P(A∪B)=P(A)+P(B)-P(AB)', proof: '容斥：并集 = A 加 B 减交集' },
                { name: '条件概率', formula: 'P(A|B)=P(AB)/P(B)', proof: '在 B 发生下 A 发生的比例' },
                { name: '乘法', formula: 'P(AB)=P(A)P(B|A)', proof: '由条件概率定义' },
                { name: '全概率', formula: '\\(P(A)=\\sum P(B_i)P(A|B_i)\\)，B_i 完备事件组', proof: 'A=A∩(∪B_i)=∪(AB_i)' },
                { name: '贝叶斯', formula: '\\(P(B_j|A)=\\frac{P(B_j)P(A|B_j)}{P(A)}\\)', proof: '由条件概率 + 全概率' },
                { name: '独立', formula: 'P(AB)=P(A)P(B)', proof: '独立 = 互不影响' }
            ]
        }
    ]
};

// =============================================================================
// ch16 随机变量及其分布
// =============================================================================
window.FORMULA_DATA['ch16'] = {
    chapter: '随机变量及其分布',
    sections: [
        {
            title: '🎯 必背：离散分布',
            importance: '★★★★★',
            items: [
                { name: '0-1 分布', formula: 'P(X=1)=p, P(X=0)=1-p', proof: '伯努利试验' },
                { name: '二项 B(n,p)', formula: 'P(X=k)=C_n^k p^k(1-p)^{n-k}', proof: 'n 次独立伯努利中成功 k 次' },
                { name: '泊松 P(λ)', formula: 'P(X=k)=\\frac{λ^k}{k!}e^{-λ}', proof: '由 B(n,λ/n) 当 n→∞ 极限' },
                { name: '几何 G(p)', formula: 'P(X=k)=(1-p)^{k-1}p', proof: '前 k-1 次失败，第 k 次成功' }
            ]
        },
        {
            title: '🎯 必背：连续分布',
            importance: '★★★★★',
            items: [
                { name: '均匀 U(a,b)', formula: 'f(x)=1/(b-a), EX=(a+b)/2, DX=(b-a)^2/12', proof: '由 EX=∫x/(b-a)dx 直接算' },
                { name: '指数 E(λ)', formula: 'f(x)=λe^{-λx}, EX=1/λ, DX=1/λ²', proof: 'EX=∫xλe^{-λx}dx=1/λ（Gamma 函数）' },
                { name: '正态 N(μ,σ²)', formula: '\\(f(x)=\\frac{1}{\\sqrt{2π}σ}e^{-\\frac{(x-μ)^2}{2σ^2}}\\)', proof: '由中心极限定理（CLT 极限）' },
                { name: '标准正态 N(0,1)', formula: 'φ(x)=φ(-x), Φ(-x)=1-Φ(x)', proof: 'φ 偶函数；Φ(x)+Φ(-x)=∫φ=1' }
            ]
        }
    ]
};

// =============================================================================
// ch17 多维随机变量
// =============================================================================
window.FORMULA_DATA['ch17'] = {
    chapter: '多维随机变量',
    sections: [
        {
            title: '🎯 必背：联合与边缘',
            importance: '★★★★★',
            items: [
                { name: '联合分布', formula: 'F(x,y)=P(X≤x,Y≤y)', proof: '二维事件概率' },
                { name: '边缘密度', formula: '\\(f_X(x)=\\int f(x,y)dy\\)', proof: '对 y 积分（事件 Y 任意）' },
                { name: '条件密度', formula: '\\(f_{X|Y}(x|y)=\\frac{f(x,y)}{f_Y(y)}\\)', proof: '由条件概率 + 密度定义' },
                { name: '独立', formula: 'f(x,y)=f_X(x)·f_Y(y) ⇔ 独立', proof: '独立 = 联合 = 边缘乘积' }
            ]
        },
        {
            title: '🎯 必背：卷积',
            importance: '★★★★',
            items: [
                { name: '独立和密度', formula: '\\(f_{X+Y}(z)=\\int f_X(x)f_Y(z-x)dx\\)', proof: 'F(z)=P(X+Y≤z)=∫∫_{x+y≤z} f(x,y)dxdy，化为积分' }
            ]
        }
    ]
};

// =============================================================================
// ch18 数字特征
// =============================================================================
window.FORMULA_DATA['ch18'] = {
    chapter: '数字特征',
    sections: [
        {
            title: '🎯 必背：期望',
            importance: '★★★★★',
            items: [
                { name: '离散期望', formula: 'EX=Σx_i p_i', proof: '加权平均' },
                { name: '连续期望', formula: 'EX=∫xf(x)dx', proof: '由密度加权积分' },
                { name: '函数期望', formula: 'Eg(X)=Σg(x_i)p_i 或 ∫g(x)f(x)dx', proof: '由 Y=g(X) 的分布' },
                { name: '线性性', formula: 'E(aX+bY)=aEX+bEY', proof: '和式 / 积分可线性' },
                { name: '独立时乘积', formula: 'X⊥Y → E(XY)=EX·EY', proof: 'f(x,y)=f_Xf_Y 拆为两个积分' }
            ]
        },
        {
            title: '🎯 必背：方差与协方差',
            importance: '★★★★★',
            items: [
                { name: '方差', formula: 'DX=E(X-EX)²=E(X²)-(EX)²', proof: '展开 (X-EX)²=X²-2X·EX+(EX)²' },
                { name: '线性变换', formula: 'D(aX+b)=a²DX', proof: 'D(aX+b)=E(aX+b)²-[E(aX+b)]²=a²EX²-a²(EX)²' },
                { name: '独立时加法', formula: 'X⊥Y → D(X+Y)=DX+DY', proof: '由方差定义 + 独立条件' },
                { name: '协方差', formula: 'Cov(X,Y)=E(XY)-EX·EY', proof: '展开 E(X-EX)(Y-EY)' },
                { name: '相关系数', formula: 'ρ_{XY}=Cov(X,Y)/(√DX·√DY)，|ρ|≤1', proof: '由 Cauchy-Schwarz 不等式' }
            ]
        }
    ]
};

// =============================================================================
// ch19 大数定律与中心极限定理
// =============================================================================
window.FORMULA_DATA['ch19'] = {
    chapter: '大数定律与中心极限定理',
    sections: [
        {
            title: '🎯 必背：大数定律',
            importance: '★★★★★',
            items: [
                { name: '切比雪夫不等式', formula: 'P(|X-EX|≥ε)≤DX/ε²', proof: 'P(|X-EX|≥ε)=∫_{|X-EX|≥ε}f dx≤∫_{|X-EX|≥ε}(X-EX)²/ε² f dx≤DX/ε²' },
                { name: '辛钦大数定律', formula: 'iid，EX=μ → \\(\\bar X \\to μ\\) 依概率', proof: '由切比雪夫 + iid' },
                { name: '伯努利大数', formula: 'n_A/n → p 依概率', proof: '伯努利分布的辛钦定律' }
            ]
        },
        {
            title: '🎯 必背：中心极限定理',
            importance: '★★★★★',
            items: [
                { name: '林德伯格-列维 CLT', formula: 'iid，EX=μ, DX=σ² → \\(\\frac{\\sum X_i - nμ}{σ\\sqrt n} \\to N(0,1)\\)', proof: '由特征函数 + iid 假设' },
                { name: '棣莫弗-拉普拉斯', formula: 'B(n,p) → N(np, np(1-p))（n 大时）', proof: 'CLT 在二项分布上的特例' }
            ]
        }
    ]
};

// =============================================================================
// ch20 数理统计
// =============================================================================
window.FORMULA_DATA['ch20'] = {
    chapter: '数理统计',
    sections: [
        {
            title: '🎯 必背：常用统计量',
            importance: '★★★★★',
            items: [
                { name: '样本均值', formula: '\\(\\bar X=\\frac{1}{n}\\sum X_i\\)', proof: '样本算术平均' },
                { name: '样本方差', formula: '\\(S^2=\\frac{1}{n-1}\\sum(X_i-\\bar X)^2\\)', proof: '除以 n-1 使 E(S²)=σ²（无偏估计）' },
                { name: 'k 阶矩', formula: '\\(A_k=\\frac{1}{n}\\sum X_i^k\\)', proof: '样本 k 阶原点矩' }
            ]
        },
        {
            title: '🎯 必背：三大抽样分布',
            importance: '★★★★★',
            items: [
                { name: 'χ² 分布', formula: '\\(\\chi^2=\\sum X_i^2\\sim\\chi^2(n)\\)，E=n, D=2n', proof: '由 \\(X_i^2\\) 是 0-1 分布与 Gamma 函数' },
                { name: 't 分布', formula: '\\(T=\\frac{X}{\\sqrt{Y/n}}\\sim t(n)\\)，n→∞ 时→N(0,1)', proof: '由 X~N(0,1), Y~χ²(n) 独立，商的分布' },
                { name: 'F 分布', formula: '\\(F=\\frac{X/n_1}{Y/n_2}\\sim F(n_1,n_2)\\)', proof: '由两个 χ² 分布独立的比' }
            ]
        },
        {
            title: '🎯 必背：估计与检验',
            importance: '★★★★',
            items: [
                { name: 'μ 置信区间（σ 已知）', formula: '\\(\\bar X\\pm z_{\\alpha/2}\\sigma/\\sqrt n\\)', proof: '由 \\(Z=(\\bar X-μ)/(\\sigma/\\sqrt n)\\sim N(0,1)\\)' },
                { name: 'μ 置信区间（σ 未知）', formula: '\\(\\bar X\\pm t_{\\alpha/2}(n-1)S/\\sqrt n\\)', proof: '由 \\(T=(\\bar X-μ)/(S/\\sqrt n)\\sim t(n-1)\\)' }
            ]
        }
    ]
};
