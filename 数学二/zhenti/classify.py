# -*- coding: utf-8 -*-
"""
302 数学二 · 真题 → 考点节点 归类器
==================================
输入：zhenti_parsed.json（题干/选项/答案/解析）、zhenti_kp.json（2020–2026 知识点）、
      nodes_extract.json（69 个考点）
输出：zhenti_classified.json（每题一个主考点 + 次选 + 分数，供复核）

打分：题干+选项 命中关键词记 w；知识点文本命中记 2.5w（知识点最准）。
取最高分节点为主归属；输出「次选/分差」用于人工复核。
"""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

YEARS = range(2011, 2027)   # 近 15 年（2011–2026）

# ---------------------------------------------------------------- 关键词字典
# (正则, 权重)。权重：>=6 强特征；3–5 中；1–2 弱。
KW = {
    # ===== 高数 第1章 函数、极限与连续 =====
    "gs-lim-fn": [("左右极限", 6), ("极限存在的充要条件", 6), (r"\\varepsilon|ε-δ|ε–δ", 5),
                  (r"分段函数.{0,10}极限", 4), (r"局部保号|有界性", 3), ("极限", 1)],
    "gs-lim-seq": [("单调有界", 7), ("递推", 5), ("数列", 5), (r"x_?\{?n\}?|xₙ", 3),
                   (r"\\lim_\{n\\to|n\\to\\infty", 4), ("子列", 5), ("收敛数列", 4)],
    "gs-lim-equiv": [("等价无穷小", 7), ("高阶无穷小", 6), ("低阶无穷小", 6), ("同阶无穷小", 6),
                     ("无穷小", 5), ("主部", 4), ("阶最高", 5)],
    "gs-lim-twokey": [("第二个重要极限", 7), (r"1\^\\infty|1\^∞|\^\\infty", 4),
                      (r"\(1\+\\frac\{1\}\{x\}\)|1\+\\frac\{1\}\{x\}", 4), ("重要极限", 5)],
    "gs-cont": [("间断点", 8), ("可去间断点", 7), ("跳跃间断点", 7), ("第二类间断点", 7),
                ("振荡", 5), ("左右连续", 5), ("连续", 2)],
    "gs-lim-calc": [("未定式", 6), ("幂指", 4), ("求极限", 2), ("计算极限", 3),
                    (r"0/0|\\frac\{0\}\{0\}|\\frac\{\\infty\}\{\\infty\}", 3),
                    (r"\\infty-\\infty|∞-∞", 3)],
    "gs-lim-squeeze": [("夹逼", 8), ("n ?项和", 5), (r"定积分定义.{0,8}(求和|极限)", 5),
                       ("放缩", 4), (r"\\sum_\{i=1\}\^\{n\}|\\frac\{1\}\{n\}\\sum", 3), ("最大项", 4)],
    "gs-cont-closed": [("零点定理", 8), ("介值定理", 6), (r"至少.{0,4}根", 4),
                       ("方程的根", 4), (r"闭区间.{0,6}连续", 4), ("最值定理", 4), ("零点", 5)],
    # ===== 高数 第2章 一元函数微分学 =====
    "gs-deriv-def": [("导数定义", 8), (r"用定义求(导|偏导)", 6), (r"连续.{0,6}不可导|不可导但连续", 6),
                     ("不可导点", 6), ("可微", 2), ("可导", 2), ("微分", 2)],
    "gs-deriv-rule": [(r"n ?阶导数|高阶导数", 7), (r"f\^\{?\(n\)", 6), ("莱布尼茨", 7), ("复合函数求导", 3)],
    "gs-deriv-implicit": [("隐函数", 6), ("参数方程", 6), (r"由方程.{0,12}确定", 3),
                          ("对数求导", 5), (r"\\frac\{dy\}\{dx\}", 1)],
    "gs-lhopital": [("洛必达", 8)],
    "gs-mono": [("单调", 5), ("递增", 4), ("递减", 4), ("极值", 3), ("极大值", 3), ("极小值", 3), ("驻点", 4)],
    "gs-concave": [("拐点", 8), ("凹凸", 5), ("渐近线", 7), ("下凸", 4)],
    "gs-opt": [("最大值", 4), ("最小值", 4), ("最值", 3), ("面积最大", 7), ("造价", 7),
               ("成本", 5), ("利润", 7), ("实际意义", 3)],
    "gs-mvt": [("罗尔", 7), ("拉格朗日", 5), ("柯西中值", 7), ("中值定理", 5),
               (r"存在.{0,3}(\\xi|ξ|η)", 5), (r"f\(b\)-f\(a\)|f\(b\)−f\(a\)", 4)],
    "gs-taylor": [("泰勒", 8), ("麦克劳林", 8), ("佩亚诺", 5), ("拉格朗日余项", 5), ("展开", 2)],
    "gs-ineq-prove": [(r"证(明|).{0,4}不等式", 7), (r"不等式", 2), ("构造函数", 4), ("辅助函数", 3)],
    # ===== 高数 第3章 一元函数积分学 =====
    "gs-int-antideriv": [("原函数", 8), ("不定积分", 5)],
    "gs-int-sub": [("换元", 5), ("凑微分", 6), ("三角代换", 6), ("根式代换", 6), ("倒代换", 6),
                   (r"令.{0,3}t\s*=|令.{0,3}x\s*=", 1)],
    "gs-int-parts": [("分部积分", 8), ("反对幂指三", 7)],
    "gs-int-rat": [("有理函数", 7), ("部分分式", 7), ("真分式", 6), ("假分式", 6), ("万能代换", 6)],
    "gs-int-def": [("定积分的定义", 7), ("黎曼和", 6), ("定积分的性质", 4), ("定积分的概念", 5), ("积分中值定理", 3)],
    "gs-int-nl": [("牛顿", 6), ("莱布尼茨", 5), (r"定积分的计算|计算.{0,4}定积分", 5)],
    "gs-int-var": [("变限积分", 8), ("变上限", 7), ("变下限", 6), (r"\\int_\{?[a0]\}?\^\{?x\}?", 4), (r"F\(x\)=\\int", 5)],
    "gs-int-sym": [("对称区间", 6), ("区间再现", 7), ("奇函数", 4), ("偶函数", 4), ("周期函数", 4)],
    "gs-int-app": [("旋转体", 8), ("旋转曲面", 8), ("弧长", 8), ("平面图形的面积", 7),
                   (r"曲线.{0,4}围成", 4), ("体积", 3), ("面积", 2), ("微元", 3)],
    "gs-int-phys": [("变力做功", 8), ("做功", 6), ("静压力", 8), ("水压力", 8), ("形心", 7),
                    ("质心", 7), ("平均值", 5), ("抽水", 8)],
    "gs-int-improp": [("反常积分", 8), ("广义积分", 8), ("收敛", 2), ("发散", 2), ("敛散", 3)],
    "gs-int-mvt": [("积分中值定理", 7), ("积分不等式", 7), (r"证明.{0,8}\\int", 5), ("积分", 1)],
    # ===== 高数 第4章 多元函数微分学 =====
    "gs-multi-lim": [("二重极限", 8), (r"二元函数.{0,6}极限", 6), (r"沿.{0,4}路径", 5), ("累次极限", 7)],
    "gs-multi-partial": [("偏导数", 6), ("全微分", 6), ("可微", 3), (r"\\frac\{\\partial", 2), ("偏导", 4)],
    "gs-multi-chain": [(r"复合函数.{0,6}(偏导|求导)", 5), (r"\\frac\{\\partial z\}\{\\partial", 4),
                       (r"隐函数.{0,8}求导", 5), (r"方程组.{0,6}确定", 4)],
    "gs-multi-extrem": [(r"多元函数.{0,6}(极值|最值)", 6), (r"二元函数.{0,6}极值", 6),
                        (r"A\s*C-B|AC-B", 7), ("极大值", 2), ("极小值", 2), ("极值", 2)],
    "gs-multi-lagrange": [("拉格朗日乘", 8), ("条件极值", 6), ("约束", 5), ("乘数法", 7)],
    # ===== 高数 第5章 二重积分 =====
    "gs-dbl-rect": [("二重积分", 6), (r"X ?型|Y ?型", 4), ("二次积分", 4)],
    "gs-dbl-polar": [("极坐标", 7), (r"r\s*\\,?d?r|r\\,\\mathrm\{d\}r", 3)],
    "gs-dbl-order": [("交换次序", 8), ("交换积分", 4), ("积分次序", 6)],
    "gs-dbl-sym": [("轮换", 6), ("对称", 2)],
    # ===== 高数 第6章 常微分方程 =====
    "gs-ode-concept": [("通解", 3), ("特解", 3), (r"微分方程.{0,4}阶", 4), ("微分方程", 2)],
    "gs-ode-first": [("一阶微分", 6), ("一阶线性", 6), ("可分离变量", 7), ("齐次方程", 5), ("通解", 2)],
    "gs-ode-reduce": [("降阶", 8), (r"y''\s*=\s*f|y\\'\\'=f", 6), ("可降阶", 6)],
    "gs-ode-cc2": [("特征方程", 6), ("特征根", 5), ("二阶常系数", 7), ("非齐次", 3)],
    "gs-ode-app": [("变化率", 6), ("微分方程", 2), ("曲线", 1), ("切线", 2), ("曲率", 4)],
    # ===== 线代 第1章 行列式 =====
    "xd-det-calc": [("行列式", 5), (r"\|A\|", 2), ("计算行列式", 6)],
    "xd-det-expand": [("代数余子式", 8), ("范德蒙德", 8), (r"按(行|列)展开", 6), ("展开定理", 6)],
    "xd-det-abstract": [(r"\|kA\||k\^?n\|A\|", 7), (r"\|A\\\^\{\*\}\||\|A\^\*\|", 7),
                        (r"\|A\^\{?-?1\}?\||\|A\^\{-1\}\|", 5), (r"\\left\|A", 3)],
    # ===== 线代 第2章 矩阵 =====
    "xd-mat-op": [("转置", 4), (r"A\^T|A\^\{T\}", 4), ("矩阵的乘法", 4), ("矩阵运算", 4),
                  (r"AB\s*=\s*BA", 4), ("交换律", 4)],
    "xd-mat-inv": [("逆矩阵", 6), ("可逆", 5), ("伴随矩阵", 8), (r"A\^\{-1\}|A⁻¹", 5), (r"A\^\*|A\*", 5)],
    "xd-mat-block": [("分块", 8)],
    "xd-mat-elem": [("初等变换", 8), ("初等矩阵", 8), ("等价标准形", 6), ("行变换", 4)],
    "xd-mat-rank": [("矩阵的秩", 7), (r"r\(A\)", 5), ("满秩", 6), ("秩为", 5), ("秩", 2)],
    "xd-mat-rankineq": [(r"r\(A\+B\)|r\(AB\)", 8), ("秩的不等式", 8), (r"AB\s*=\s*O", 5), (r"A\^TA|A\^T A", 5)],
    # ===== 线代 第3章 向量组 =====
    "xd-vec-comb": [("线性表示", 8), ("线性组合", 7), (r"可由.{0,10}表示", 6)],
    "xd-vec-dep": [("线性相关", 8), ("线性无关", 8)],
    "xd-vec-max": [("极大无关组", 9), ("极大线性无关组", 9), ("向量组的秩", 6)],
    "xd-vec-equiv": [(r"向量组.{0,6}等价", 8), ("等价", 2)],
    # ===== 线代 第4章 线性方程组 =====
    "xd-solve-homo": [("齐次线性方程组", 7), ("基础解系", 7), (r"A[xX]\s*=\s*0", 5), ("齐次方程组", 6)],
    "xd-solve-nonhomo": [("非齐次线性方程组", 7), ("线性方程组", 5), (r"A[xX]\s*=\s*b", 4), ("通解", 3)],
    "xd-solve-param": [(r"含参数.{0,6}(方程组|线性)", 6), (r"参数.{0,4}讨论", 4), ("讨论", 1)],
    "xd-solve-common": [("同解", 8), ("公共解", 8)],
    # ===== 线代 第5章 特征值 =====
    "xd-eig-calc": [("特征值", 6), ("特征向量", 6), ("特征多项式", 7), (r"\\lambda E-A|λE-A", 6)],
    "xd-eig-sim": [("相似对角化", 8), ("对角化", 6), (r"P\^\{-1\}AP", 5), ("相似", 4)],
    "xd-eig-sym": [("实对称", 8), ("正交矩阵", 6), ("正交变换", 5), ("施密特", 7), ("正交对角化", 8)],
    "xd-eig-abstract": [(r"A\^2\s*=\s*A|A²=A", 7), (r"A\^2\s*=\s*E|A²=E", 7), (r"f\(A\)", 5), ("抽象", 3)],
    # ===== 线代 第6章 二次型 =====
    "xd-qf-mat": [("二次型", 5), ("二次型的矩阵", 6), ("对称矩阵", 3)],
    "xd-qf-standard": [("标准形", 7), ("配方法", 7), ("正交变换", 4)],
    "xd-qf-inertia": [("惯性指数", 7), ("惯性定理", 8), ("规范形", 8), ("合同", 6)],
    "xd-qf-positive": [("正定", 9), ("顺序主子式", 8)],
}

XD_HINT = re.compile(r"行列式|矩阵|向量|特征值|特征向量|二次型|线性无关|线性相关|秩|可逆|伴随|正交|合同|惯性|齐次|方程组|初等|分块|转置|对称矩阵")
GS_HINT = re.compile(r"极限|导数|微分|积分|函数|曲线|面积|体积|极值|中值|渐近线|拐点|微分方程|无穷小")


def clean(s):
    if not s:
        return ""
    s = s.replace("\u3000", " ").replace("\\(", "$").replace("\\)", "$")
    return s


def score_node(node_id, blob, kp_blob):
    sc = 0.0
    for pat, w in KW.get(node_id, []):
        rx = re.compile(pat)
        if rx.search(blob):
            sc += w
        if kp_blob and rx.search(kp_blob):
            sc += w * 2.5
    return sc


def main():
    parsed = json.load(open(HERE / "zhenti_parsed.json", encoding="utf-8"))
    kp = json.load(open(HERE / "zhenti_kp.json", encoding="utf-8"))
    nodes = json.load(open(HERE / "nodes_extract.json", encoding="utf-8"))["nodes"]
    ids = [n["id"] for n in nodes]

    out, dist, low = [], {}, []
    for q in parsed["questions"]:
        if q["year"] not in YEARS:
            continue
        kpb = clean(kp.get(f"{q['year']}-{q['num']}", ""))
        blob = clean(q["stem"]) + " " + " ".join(q["options"] or [])
        xd = bool(XD_HINT.search(blob) or XD_HINT.search(kpb))
        gs = bool(GS_HINT.search(blob) or GS_HINT.search(kpb))

        scores = {}
        for nid in ids:
            s = score_node(nid, blob, kpb)
            if s <= 0:
                continue
            is_xd = nid.startswith("xd-")
            if is_xd and xd:
                s *= 1.25
            if (not is_xd) and gs and not xd:
                s *= 1.15
            scores[nid] = round(s, 2)

        if not scores:
            best, second, margin = None, None, 0
        else:
            order = sorted(scores.items(), key=lambda kv: (-kv[1], ids.index(kv[0])))
            best = order[0][0]
            second = order[1][0] if len(order) > 1 else None
            margin = round(order[0][1] - (order[1][1] if len(order) > 1 else 0), 2)

        rec = dict(q)
        rec["kp"] = kpb
        rec["node"] = best
        rec["score"] = scores.get(best, 0)
        rec["second"] = second
        rec["margin"] = margin
        rec["scores"] = dict(sorted(scores.items(), key=lambda kv: -kv[1])[:4])
        out.append(rec)
        if best:
            dist[best] = dist.get(best, 0) + 1
        if not best or margin < 2:
            low.append((q["year"], q["num"], q["type"], best, second, margin, clean(q["stem"])[:60]))

    json.dump({"meta": {"total": len(out), "by_node": dist}, "questions": out},
              open(HERE / "zhenti_classified.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"归类 {len(out)} 题；覆盖节点 {len(dist)}/69")
    print("\n各节点题数（0 的节点省略）：")
    for n in nodes:
        c = dist.get(n["id"], 0)
        if c:
            bar = "█" * min(c, 40)
            print(f"  {c:>3}  {n['id']:<16} {n['name']:<22} {bar}")
    empty = [n['id'] for n in nodes if not dist.get(n['id'])]
    print("\n无题目节点：", ", ".join(empty) if empty else "无")
    print(f"\n低置信度（无归属或分差<2）共 {len(low)} 题：")
    for r in low:
        print("  %d-%d [%s] %s / %s  margin=%s | %s" % r)
    print("\n→ zhenti_classified.json")


if __name__ == "__main__":
    main()
