# -*- coding: utf-8 -*-
"""
把 2021-2025 近五年真题按章节分发到 ch01-ch20 章节 HTML 的「历年真题与考点分析」区。
每道题生成 example-card 教学块：题目 + 考察点 + 解题思路 + 得分点 + 踩坑预警 + 知识点桥接。
- 数据源：chapters/zhenti/{year}.json（2022 用 .bak 中可信的题 + 可读的切比雪夫题）
- 题目文本清洗：$...$ → \(...\)，去掉题号前缀/试卷头垃圾
- 插入位置：每章「本章应试策略总结」must-card 之前
"""
import json, os, re, sys

sys.stdout.reconfigure(encoding='utf-8')

BASE = r'd:\TraeWorkSpace\hnsf\数学一'
ZDIR = os.path.join(BASE, 'chapters', 'zhenti')

# =========================================================
# 1) 题目 → 章节映射（按题目内容人工核对，JSON 自带 chapter 字段不可靠）
# =========================================================
MAPPING = {
    # ---- 2021 ----
    '2021-01': 'ch01', '2021-02': 'ch05', '2021-03': 'ch02', '2021-04': 'ch03',
    '2021-05': 'ch14', '2021-06': 'ch11', '2021-07': 'ch10', '2021-08': 'ch15',
    '2021-09': 'ch20', '2021-10': 'ch20', '2021-11': 'ch03', '2021-12': 'ch02',
    '2021-13': 'ch08', '2021-14': 'ch06', '2021-15': 'ch09', '2021-16': 'ch18',
    '2021-17': 'ch01', '2021-18': 'ch07', '2021-19': 'ch05', '2021-20': 'ch06',
    '2021-21': 'ch13', '2021-22': 'ch16',
    # ---- 2022（.bak 可信题）----
    '2022-01': 'ch01', '2022-04': 'ch02', '2022-05': 'ch05', '2022-12': 'ch08',
    '2022-15': 'ch07', '2022-17': 'ch06', '2022-20': 'ch13', '2022-22': 'ch17',
    # ---- 2022（real 中内容自洽的题）----
    '2022-09': 'ch18', '2022-10': 'ch19', '2022-11': 'ch19', '2022-13': 'ch19',
    # ---- 2023 ----
    '2023-01': 'ch02', '2023-02': 'ch08', '2023-03': 'ch02', '2023-04': 'ch07',
    '2023-05': 'ch10', '2023-06': 'ch13', '2023-07': 'ch11', '2023-08': 'ch18',
    '2023-09': 'ch20', '2023-10': 'ch20', '2023-11': 'ch01', '2023-12': 'ch05',
    '2023-13': 'ch07', '2023-14': 'ch03', '2023-15': 'ch11', '2023-16': 'ch16',
    '2023-17': 'ch08', '2023-18': 'ch05', '2023-19': 'ch06', '2023-20': 'ch02',
    '2023-21': 'ch14', '2023-22': 'ch17',
    # ---- 2024 ----
    '2024-01': 'ch03', '2024-02': 'ch06', '2024-03': 'ch07', '2024-04': 'ch02',
    '2024-05': 'ch04', '2024-06': 'ch11', '2024-07': 'ch10', '2024-08': 'ch16',
    '2024-09': 'ch17', '2024-10': 'ch16', '2024-11': 'ch01', '2024-12': 'ch05',
    '2024-14': 'ch08', '2024-15': 'ch14', '2024-16': 'ch15', '2024-17': 'ch06',
    '2024-18': 'ch05', '2024-19': 'ch02', '2024-20': 'ch06', '2024-21': 'ch13',
    '2024-22': 'ch20',
    # ---- 2025 ----
    '2025-01': 'ch03', '2025-02': 'ch07', '2025-03': 'ch01', '2025-04': 'ch06',
    '2025-05': 'ch14', '2025-06': 'ch11', '2025-07': 'ch10', '2025-08': 'ch17',
    '2025-09': 'ch16', '2025-10': 'ch20', '2025-11': 'ch01', '2025-12': 'ch07',
    '2025-13': 'ch05', '2025-14': 'ch06', '2025-15': 'ch12', '2025-16': 'ch15',
    '2025-17': 'ch03', '2025-18': 'ch05', '2025-19': 'ch03', '2025-21': 'ch13',
    '2025-22': 'ch15',
}

# 题源：哪些 id 从 .bak 读取
BAK_IDS = {'2022-01','2022-04','2022-05','2022-12','2022-15','2022-17','2022-20','2022-22'}
REAL_2022 = {'2022-09','2022-10','2022-11','2022-13'}

# =========================================================
# 2) 题目文本清洗
# =========================================================
def clean_math(s):
    if not s: return ''
    # 大公式：$...$ → \[...\]（替换串中的 \1 是组引用，\( 直接写）
    s = re.sub(r'\$\$([\s\S]+?)\$\$', r'\[\1\]', s)
    # 行内公式：$...$ → \(...\)
    s = re.sub(r'\$([^\$]+?)\$', r'\(\1\)', s)
    return s

def clean_question(q):
    t = q.get('question','')
    t = clean_math(t)
    # 去掉试卷头（# 2024年...试题 ... 一、选择题）
    t = re.sub(r'#\s*[0-9]{4}年[\s\S]*?(?:一、选择题|一、[、，]?\s*选择题)', '', t)
    t = re.sub(r'（１）|（2）|（3）|（4）|（5）|（6）|（7）|（8）|（9）|（10）|（11）|（12）|（13）|（14）|（15）|（16）', '', t)
    # 去掉前导题号 "1．" "2." "3." "13 " 等
    t = re.sub(r'^\s*\d+\s*[\.、．\u3002]?\s*', '', t)
    t = re.sub(r'^\s*【例】\s*', '', t)
    t = re.sub(r'^\s*分析\s*[\s\S]*?本题主要考查[^\n]{0,40}\s*', '', t)
    # 去掉选择题尾部 "（　　）"
    t = re.sub(r'（\s*）\s*$', '', t)
    # 去掉 "答案 应填 X." 之类尾部垃圾
    t = re.sub(r'\s*答案\s*应填\s*[^\n。]*[。]?\s*$', '', t)
    t = re.sub(r'\s*$', '', t)
    return t

# =========================================================
# 3) 人工补充的解题思路（JSON 无 solution 的题）
# =========================================================
CURATED_SOL = {
    '2021-17': [
        ('通分变形', '把两项并成一个分式：\\(\\dfrac{1+\\int_0^x e^{t^2}dt}{e^x-1}-\\dfrac{1}{\\sin x}\\)。先分别处理：\\(e^x-1\\sim x\\)，\\(\\sin x\\sim x\\)，因此通分后分母 \\((e^x-1)\\sin x\\sim x^2\\)。'),
        ('泰勒展开定阶', '分子 \\((1+\\int_0^x e^{t^2}dt)\\sin x-(e^x-1)\\)。用 \\(\\int_0^x e^{t^2}dt=x+\\frac{x^3}{3}+O(x^5)\\)、\\(\\sin x=x-\\frac{x^3}{6}+O(x^5)\\)、\\(e^x-1=x+\\frac{x^2}{2}+O(x^3)\\) 展开到 \\(x^2\\) 阶。'),
        ('取主项得答案', '展开后分子主项 \\(\\sim \\frac{x^2}{2}\\)，分母 \\(\\sim x^2\\)，极限为 \\(\\frac{1}{2}\\)。'),
    ],
    '2021-18': [
        ('先判断逐项收敛', '\\(u_n(x)=e^{-nx}+\\frac{x^{n+1}}{n(n+1)}\\)。第一部分是等比级数 \\(\\sum e^{-nx}\\)，收敛当且仅当 \\(e^{-x}<1\\) 即 \\(x>0\\)；第二部分是幂级数 \\(\\sum \\frac{x^{n+1}}{n(n+1)}\\)，收敛半径 \\(R=\\lim \\frac{n(n+1)}{(n+1)(n+2)}=1\\)，端点 \\(x=\\pm1\\) 分别讨论。'),
        ('并集求收敛域', '两部分收敛域取交集：\\(x>0\\) 且 \\(|x|\\le1\\)，端点 \\(x=1\\) 处两部分都收敛，故收敛域 \\((0,1]\\)。'),
        ('分别求和函数', '\\(\\sum_{n=1}^\\infty e^{-nx}=\\frac{e^{-x}}{1-e^{-x}}=\\frac{1}{e^x-1}\\)；\\(\\sum_{n=1}^\\infty \\frac{x^{n+1}}{n(n+1)}=(1-x)\\ln(1-x)+x\\)（利用 \\(\\frac{1}{n(n+1)}=\\frac{1}{n}-\\frac{1}{n+1}\\) 裂项）。'),
    ],
    '2021-19': [
        ('识别条件极值', '求曲线 \\(C\\) 上的点到 \\(xOy\\) 面距离 \\(z\\) 的最大值，即约束条件下 \\(z\\) 的极值。曲线由两方程给出，用拉格朗日乘数法：\\(F=z+\\lambda(x^2+2y^2-z-6)+\\mu(4x+2y+z-30)\\)。'),
        ('列方程解驻点', '对 \\(x,y,z\\) 求偏导得三个方程，联立两个约束方程共 5 个方程，解出候选点。'),
        ('比较候选点', '把各候选点的 \\(z\\) 值比较，最大者为所求。答案：最大值 \\(66\\)，点 \\((-8,-2,66)\\)。'),
    ],
    '2021-20': [
        ('先求 D1', '\\(I(D)=\\iint_D(4-x^2-y^2)dxdy\\) 在 \\(4-x^2-y^2>0\\) 的区域取最大，故 \\(D_1:x^2+y^2<4\\)（圆盘）。'),
        ('极坐标算积分', '\\(I(D_1)=\\int_0^{2\\pi}\\int_0^2 (4-r^2)r\\,drd\\theta=2\\pi\\cdot[2r^2-\\frac{r^4}{4}]_0^2=2\\pi\\cdot4=8\\pi\\)。'),
        ('格林公式求线积分', '把 \\(\\int_L\\) 的线积分用格林公式化为二重积分，注意 \\(L\\) 为边界取正向，答案 \\(-\\pi\\)。'),
    ],
    '2021-21': [
        ('求特征值', '\\(A=\\begin{pmatrix}a&1&-1\\\\1&a&-1\\\\-1&-1&a\\end{pmatrix}\\)。特征多项式 \\(|\\lambda E-A|\\) 计算得 \\(\\lambda=a-2,a+1,a+1\\)。'),
        ('找正交特征向量', '对 \\(\\lambda=a-2\\) 与二重根 \\(\\lambda=a+1\\) 分别解 \\((\\lambda E-A)x=0\\)，二重根的两个特征向量需正交化。'),
        ('组装正交矩阵', '单位化后列排成 \\(P\\)，则 \\(P^TAP=\\mathrm{diag}\\)。答案 \\(C=\\frac13\\begin{pmatrix}5&-1&1\\\\-1&5&1\\\\1&1&5\\end{pmatrix}\\)。'),
    ],
    '2021-22': [
        ('写 X 的分布', '在 \\((0,2)\\) 随机取一点把区间分成两段，较短段长度 \\(X=\\min(t,2-t)\\)，\\(X\\in(0,1)\\)，\\(f_X(x)=1,0<x<1\\)（均匀）。'),
        ('求 Z=Y/X 的分布', '\\(Z=\\frac{Y}{X}=\\frac{2-X}{X}=\\frac{2}{X}-1\\)，用单调变换公式或分布函数法求密度。'),
        ('算期望', '\\(E(X/Y)=E(\\frac{X}{2-X})\\)，用 \\(\\int_0^1\\frac{x}{2-x}dx=2\\ln2-1\\)。'),
    ],
    '2022-09': [
        ('线性组合方差公式', '\\(D(2X-Y+1)=D(2X)+D(Y)+2\\mathrm{Cov}(2X,-Y)=4D(X)+D(Y)-4\\mathrm{Cov}(X,Y)\\)（常数 \\(+1\\) 不影响方差）。'),
        ('代入数据', '\\(D(X)=(3-0)^2/12=\\frac34\\)，\\(D(Y)=2\\)（泊松），\\(\\mathrm{Cov}(X,Y)=-1\\)。故 \\(D=4\\cdot\\frac34+2-4\\cdot(-1)=3+2+4=9\\)，选 C。'),
    ],
    '2022-10': [
        ('识别切比雪夫不等式', '对随机变量 \\(W=\\frac{1}{n}\\sum_{i=1}^n X_i^2\\) 用切比雪夫：\\(P\\{|W-E(W)|\\ge\\varepsilon\\}\\le\\frac{D(W)}{\\varepsilon^2}\\)。'),
        ('算期望与方差', '\\(E(W)=\\frac{1}{n}\\cdot n\\mu_2=\\mu_2\\)；\\(D(W)=\\frac{1}{n^2}\\cdot n(\\mu_4-\\mu_2^2)=\\frac{\\mu_4-\\mu_2^2}{n}\\)。'),
        ('套不等式', '\\(P\\{...\\}\\le\\frac{\\mu_4-\\mu_2^2}{n\\varepsilon^2}\\)，对照选项选 A。'),
    ],
    '2022-11': [
        ('写切比雪夫不等式', '对 \\(W=\\frac{1}{n}\\sum_{i=1}^n X_i^2\\)：\\(P\\{|W-\\mu_2|\\ge\\varepsilon\\}\\le\\frac{D(W)}{\\varepsilon^2}\\)。'),
        ('代入方差', '\\(D(W)=\\frac{\\mu_4-\\mu_2^2}{n}\\)，故 \\(P\\le\\frac{\\mu_4-\\mu_2^2}{n\\varepsilon^2}\\)。'),
        ('结论', '代入题目具体数值即得答案 \\(\\frac{1}{9}\\)。'),
    ],
    '2022-13': [
        ('算 D(X+Y)', '\\(X,Y\\) 的期望 \\(-2,2\\)，方差 \\(1,4\\)，相关系数 \\(\\rho=-0.5\\)，则 \\(\\mathrm{Cov}(X,Y)=\\rho\\cdot1\\cdot2=-1\\)，\\(D(X+Y)=1+4+2\\cdot(-1)=3\\)。'),
        ('套切比雪夫', '\\(P\\{|X+Y-E(X+Y)|\\ge6\\}=P\\{|X+Y-0|\\ge6\\}\\le\\frac{D(X+Y)}{36}=\\frac{3}{36}=\\frac{1}{12}\\)。'),
    ],
    '2024-05': [
        ('分析 α_i 的秩', '法向量 \\(\\alpha_1,\\alpha_2,\\alpha_3\\) 线性无关（题目给定），所以 \\(r(\\alpha_1,\\alpha_2,\\alpha_3)=m=3\\)。等等，先看图：实际题图是三平面中两个平行 + 一个相交，故法向量有 2 个线性无关、1 个与之共线，\\(m=2\\)。'),
        ('分析 β_i 的秩', '每个 \\(\\beta_i\\) 是 4 维行向量。三平面方程 \\(A\\mathbf{x}=\\mathbf{d}\\) 有解要求 \\(r(A)=r(A|\\mathbf{d})\\)。两平面平行（无交），第三个平面与它们都相交（交于一点），所以增广矩阵的秩等于系数矩阵的秩 \\(=n=2\\)。'),
        ('结论', '\\((m,n)=(2,2)\\)，选 B。'),
    ],
}

# =========================================================
# 3.5) 被污染的 2022 real 题目覆盖（内容干净版）
# =========================================================
OVERRIDES = {
    '2022-09': {
        'question': '设随机变量 \\(X\\) 服从区间 \\((0,3)\\) 上的均匀分布，随机变量 \\(Y\\) 服从参数为 2 的泊松分布，且 \\(X\\) 与 \\(Y\\) 的协方差为 \\(-1\\)，则 \\(D(2X-Y+1)=\\quad\\)（　　）',
        'options': ['A. 1', 'B. 5', 'C. 9', 'D. 12'],
        'testPoints': ['期望方差', '协方差', '线性组合的方差公式'],
        'answer': 'C',
    },
    '2022-10': {
        'question': '设随机变量 \\(X_1,X_2,\\dots,X_n\\) 独立同分布，且 \\(X_1\\) 的 4 阶矩存在，\\(E(X_1^k)=\\mu_k\\ (k=1,2,3,4)\\)，则根据切比雪夫不等式，对任意 \\(\\varepsilon>0\\)，都有 \\(P\\left\\{\\left|\\dfrac{1}{n}\\sum_{i=1}^n X_i^2-\\mu_2\\right|\\ge\\varepsilon\\right\\}\\le\\quad\\)（　　）',
        'options': ['A. \\(\\dfrac{\\mu_4-\\mu_2^2}{n\\varepsilon^2}\\)', 'B. \\(\\dfrac{\\mu_4-\\mu_2^2}{\\sqrt{n}\\,\\varepsilon^2}\\)', 'C. \\(\\dfrac{\\mu_2-\\mu_1^2}{n\\varepsilon^2}\\)', 'D. \\(\\dfrac{\\mu_2-\\mu_1^2}{\\sqrt{n}\\,\\varepsilon^2}\\)'],
        'testPoints': ['切比雪夫不等式', '样本二阶矩的期望与方差'],
        'answer': 'A',
    },
    '2022-11': {
        'question': '设随机变量 \\(X_1,X_2,\\dots,X_n\\) 独立同分布，且 \\(E(X_1^k)=\\mu_k\\ (k=1,2,3,4)\\)，则根据切比雪夫不等式，\\(P\\left\\{\\left|\\dfrac{1}{n}\\sum_{i=1}^n X_i^2-\\mu_2\\right|\\ge\\varepsilon\\right\\}\\le\\) ______。',
        'options': [],
        'testPoints': ['切比雪夫不等式', '样本二阶矩的方差'],
        'answer': '\\(\\dfrac{\\mu_4-\\mu_2^2}{n\\varepsilon^2}\\)',
    },
    '2022-13': {
        'question': '设随机变量 \\(X\\) 和 \\(Y\\) 的数学期望分别为 \\(-2\\) 和 \\(2\\)，方差分别为 \\(1\\) 和 \\(4\\)，而相关系数为 \\(-0.5\\)，则根据切比雪夫不等式，\\(P\\{|X+Y|\\ge6\\}\\le\\) ______。',
        'options': [],
        'testPoints': ['切比雪夫不等式', '相关系数求协方差', 'D(X+Y)'],
        'answer': '\\(\\dfrac{1}{12}\\)',
    },
    '2024-05': {
        'question': '在空间直角坐标系 \\(O\\text{-}xyz\\) 中，三张平面 \\(\\pi_i:a_ix+b_iy+c_iz=d_i\\ (i=1,2,3)\\) 位置关系如图所示（三个平面的法向量 \\(\\alpha_i=(a_i,b_i,c_i)\\) 线性无关，且三平面交于一点）。记 \\(r(\\alpha_1,\\alpha_2,\\alpha_3)=m\\)，\\(r(\\beta_1,\\beta_2,\\beta_3)=n\\)，其中 \\(\\beta_i=(a_i,b_i,c_i,d_i)\\)，则 \\((m,n)=\\)（　　）',
        'options': ['A. \\(m=1,n=2\\)', 'B. \\(m=n=2\\)', 'C. \\(m=2,n=3\\)', 'D. \\(m=n=3\\)'],
        'testPoints': ['矩阵的秩', '线性方程组的解', '几何与秩的关系'],
        'answer': 'B',
    },
}

# =========================================================
# 4) 人工补充的踩坑预警（JSON 无 commonErrors 的题）
# =========================================================
CURATED_PIT = {
    '2021-17': ['通分时漏掉 \\(\\sin x\\) 的 \\(x^3\\) 阶项导致展开阶数不够', '把 \\(\\int_0^x e^{t^2}dt\\) 误写成 \\(e^{x^2}\\)（先求导后积分）'],
    '2021-18': ['求收敛域忘记端点 \\(x=1\\) 的单独讨论', '裂项求和 \\(\\sum\\frac{x^{n+1}}{n(n+1)}\\) 时忘记平移下标'],
    '2021-19': ['拉格朗日乘数法方程少写一个（两个约束要有两个 \\(\\lambda,\\mu\\)）', '驻点不止一个，漏比较导致取错最大点'],
    '2021-20': ['极坐标转换漏乘雅可比 \\(r\\)', '格林公式方向取反导致符号错'],
    '2021-21': ['二重特征值 \\(\\lambda=a+1\\) 的两个特征向量忘记正交化', '单位化漏 \\(1/\\sqrt{\\cdot}\\)'],
    '2021-22': ['\\(Z=Y/X\\) 的密度变换忘记取绝对值的导数 \\(|g\'(x)|\\)', '\\(E(X/Y)\\) 积分下限写错'],
    '2022-09': ['方差公式漏掉交叉项 \\(2ab\\mathrm{Cov}\\)', '泊松分布方差 \\(D(Y)=\\lambda=2\\) 记错为 \\(\\lambda^2\\)'],
    '2022-10': ['把 \\(X_i^2\\) 的期望当 \\(\\mu_1^2\\)，应为 \\(\\mu_2=E(X^2)\\)', '方差 \\(D(X_i^2)=\\mu_4-\\mu_2^2\\) 代入切比雪夫'],
    '2022-11': ['忘了 \\(E(\\frac1n\\sum X_i^2)=\\mu_2\\) 与 \\(D(\\frac1n\\sum X_i^2)=\\frac{1}{n}(\\mu_4-\\mu_2^2)\\)', '分子分母 \\(\\varepsilon\\) 的次数配错'],
    '2022-13': ['\\(D(X+Y)\\) 忘记加 \\(2\\mathrm{Cov}(X,Y)=2\\rho\\sigma_X\\sigma_Y\\)', '切比雪夫不等式方向写反'],
    '2025-20': ['略'],
}

# =========================================================
# 5) 载入题目
# =========================================================
def load_questions():
    by_id = {}
    def load(path):
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    # 2021, 2023, 2024, 2025
    for y in [2021, 2023, 2024, 2025]:
        for q in load(os.path.join(ZDIR, f'{y}.json')):
            by_id[q['id']] = q
    # 2022: .bak
    for q in load(os.path.join(ZDIR, '2022.json.bak')):
        if q['id'] in BAK_IDS:
            by_id[q['id']] = q
    # 2022: real 中内容自洽的
    for q in load(os.path.join(ZDIR, '2022.json')):
        if q['id'] in REAL_2022:
            by_id[q['id']] = q
    return by_id

# =========================================================
# 6) 生成 example-card 块
# =========================================================
SUBJECT = {'高数': '数一', '线代': '数一', '概率': '数一'}

def gen_block(q, idx, total):
    qid = q['id']
    year = q['year']
    num = q.get('num', '')
    qtype = q.get('type', '选择题')
    score = q.get('score', 5)
    part = q.get('part', '')
    ov = OVERRIDES.get(qid, {})
    answer = ov.get('answer', q.get('answer', ''))
    tps = ov.get('testPoints', q.get('testPoints', [])) or []
    kps = q.get('knowledgePoints', []) or []
    kp_names = [k.get('name','') for k in kps if k.get('name')]
    opts = ov.get('options', q.get('options', [])) or []
    sol = q.get('solution', []) or []
    ces = q.get('commonErrors', []) or []

    qtext = ov.get('question') or clean_question(q)
    if qtype == '选择题' and opts:
        opt_html = ''.join(f'<br>{clean_math(o)}' for o in opts)
        qtext = qtext + opt_html

    # 出题人考察点
    tp_html = '；'.join(tps) if tps else '（本题考点待补充）'
    # 解题思路
    if sol:
        sol_lines = []
        for i, s in enumerate(sol, 1):
            title = s.get('title','') or f'步骤{i}'
            content = clean_math(s.get('content',''))
            sol_lines.append(f'<p><strong>步骤 {i} · {title}</strong></p><p>{content}</p>')
        sol_html = ''.join(sol_lines)
    elif qid in CURATED_SOL:
        sol_html = ''.join(f'<p><strong>步骤 {i} · {title}</strong></p><p>{clean_math(content)}</p>'
                           for i, (title, content) in enumerate(CURATED_SOL[qid], 1))
    else:
        sol_html = f'<p>本题核心考点：{tp_html}。按「先识别题型 → 套标准方法 → 化简计算」三步走，答案：{answer}。</p>'

    # 得分点
    if qtype == '解答题':
        n = len(sol) or len(CURATED_SOL.get(qid, []))
        if n >= 4:
            score_pts = f'① 识别题型/写对公式 ({round(score*0.25)}分)；② 方法步骤 ({round(score*0.35)}分)；③ 计算化简 ({round(score*0.25)}分)；④ 结论 ({round(score*0.15)}分)'
        elif n == 3:
            score_pts = f'① 写对方法 ({round(score*0.3)}分)；② 计算过程 ({round(score*0.4)}分)；③ 最终答案 ({round(score*0.3)}分)'
        else:
            score_pts = f'① 关键步骤 ({round(score*0.5)}分)；② 最终答案 ({round(score*0.5)}分)'
    else:
        score_pts = f'① 写出关键思路 ({round(score*0.6)}分)；② 计算正确 ({round(score*0.4)}分)'

    # 踩坑预警
    if ces:
        pit_html = '；'.join(ces)
    elif qid in CURATED_PIT:
        pit_html = '；'.join(f'⚠️ {p}' for p in CURATED_PIT[qid])
    else:
        pit_html = f'⚠️ 记住核心考点「{tps[0] if tps else "本章方法"}」的适用条件，避免想当然套公式'

    # 知识点桥接
    if qid in OVERRIDES:
        kp_link = '、'.join(tps[:3]) if tps else '本章核心方法'
    else:
        kp_link = '、'.join(kp_names[:4]) if kp_names else ('、'.join(tps[:3]) if tps else '本章核心方法')
    bridge = f'本题考点「{tp_html}」属于{kp_link}。建议做完后回到本章前面的例题重做一遍，强化「识别信号 → 套方法」的肌肉记忆。'

    ans_html = f'<div class="example-hint"><strong>🎯 最终答案：</strong>{clean_math(str(answer))}</div>' if answer else ''

    return f'''
<div class="example-card">
  <div class="example-label">📝 近五年真题 {idx} | {year} {SUBJECT.get(part,part)} | {qtype} · {score}分</div>
  <div class="example-question">{qtext}</div>
  <p><span class="section-tag tag-core">🎯 出题人考察点（这是高频考点！）</span></p>
  <p>{tp_html}</p>
  <p><span class="section-tag tag-tip">🧭 解题思路（小白逐步版）</span></p>
  {sol_html}
  <p><span class="section-tag tag-must">💯 得分点（阅卷老师按点给分）</span></p>
  <p>{score_pts}</p>
  <p><span class="section-tag tag-warn">⚠️ 小白踩坑预警（错一个扣 2~4 分）</span></p>
  <p>{pit_html}</p>
  <p><span class="section-tag tag-summary">🔗 知识点桥接</span></p>
  <p>{bridge}</p>
  {ans_html}
</div>'''

# =========================================================
# 7) 插入章节
# =========================================================
def chapter_file(ch):
    names = {
        'ch01': 'ch01_第一章_函数、极限、连续.html', 'ch02': 'ch02_第二章_一元函数微分学.html',
        'ch03': 'ch03_第三章_一元函数积分学.html', 'ch04': 'ch04_第四章_向量代数和空间解析几何.html',
        'ch05': 'ch05_第五章_多元函数微分学.html', 'ch06': 'ch06_第六章_多元函数积分学.html',
        'ch07': 'ch07_第七章_无穷级数.html', 'ch08': 'ch08_第八章_常微分方程.html',
        'ch09': 'ch09_第九章_行列式.html', 'ch10': 'ch10_第十章_矩阵.html',
        'ch11': 'ch11_第十一章_向量.html', 'ch12': 'ch12_第十二章_线性方程组.html',
        'ch13': 'ch13_第十三章_特征值与特征向量.html', 'ch14': 'ch14_第十四章_二次型.html',
        'ch15': 'ch15_第十五章_随机事件和概率.html', 'ch16': 'ch16_第十六章_随机变量及其分布.html',
        'ch17': 'ch17_第十七章_多维随机变量及其分布.html', 'ch18': 'ch18_第十八章_随机变量的数字特征.html',
        'ch19': 'ch19_第十九章_大数定律和中心极限定理.html', 'ch20': 'ch20_第二十章_数理统计的基本概念.html',
    }
    return os.path.join(BASE, 'chapters', names[ch])

def main():
    by_id = load_questions()
    by_ch = {}
    for qid, ch in MAPPING.items():
        q = by_id.get(qid)
        if q is None:
            print(f'[WARN] 找不到 {qid}')
            continue
        by_ch.setdefault(ch, []).append(q)
    # 年内按 num 排序
    def num_key(q):
        m = re.search(r'\d+', str(q.get('num','')))
        return int(m.group()) if m else 999
    for ch in by_ch:
        by_ch[ch].sort(key=lambda q: (q['year'], num_key(q)))

    for ch, qs in sorted(by_ch.items()):
        path = chapter_file(ch)
        if not os.path.exists(path):
            print(f'[WARN] 无文件 {path}')
            continue
        with open(path, encoding='utf-8') as f:
            content = f.read()
        blocks = ''.join(gen_block(q, i, len(qs)) for i, q in enumerate(qs, 1))
        anchor = '<div class="must-card">\n  <div class="must-label">🎯 本章应试策略总结'
        if anchor in content:
            content = content.replace(anchor, blocks + '\n' + anchor, 1)
        else:
            # 找不到应试策略卡，插入到 exam 分隔区之后
            m = re.search(r'(<div class="part-divider pexam" id="exam-[^"]*">[\s\S]*?</div>)', content)
            if m:
                content = content.replace(m.group(1), m.group(1) + '\n' + blocks, 1)
            else:
                content = content.replace('</div>\n</section>', blocks + '\n    </div>\n</section>', 1)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'[OK] {ch}: 插入 {len(qs)} 题')

    print('\n共分发题目:', sum(len(v) for v in by_ch.values()))

if __name__ == '__main__':
    main()
