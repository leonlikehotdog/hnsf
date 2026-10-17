# 真题关（2011–2026）· 数据流水线

给地图上 **69 个考点** 各配一个「真题卫星」。母考点通关后才能点，进度独立统计。
全部数据由脚本生成，不要手改 `js/data-zhenti.js`。

## 一、目录里的东西

| 文件 | 作用 |
| --- | --- |
| `fetch_zhenti.py` | 拉取上游真题 Markdown 到 `kysx2-zt/`（1987–2026） |
| `parse_math2.py` | 解析「刷题版」→ `zhenti_parsed.json`（755 题 / 40 年） |
| `parse_kp.py` | 解析「知识点版」的知识点 → `zhenti_kp.json`（仅 2020–2026 有） |
| `make_digest.py` → `digest.txt` | 生成人工归类用的紧凑题面清单 |
| `assign.txt` | **人工归类的唯一事实来源**：`YYYY-N 考点id`，`@` 前缀 = 次要归属 |
| `apply_assign.py` | 校验 `assign.txt` 并打印每个考点的题量分布 |
| `build_zhenti_js.py` | 汇总 → `../js/data-zhenti.js` |
| `check_zhenti.js` | 真题库静态校验（结构 / 归属 / 答案形态 / 覆盖） |
| `classify.py` · `zhenti_classified.json` | 关键词首轮归类，**已废弃**（综合题不准），仅留档 |
| `nodes_extract.json` | 从 `../js/data-nodes.js` 抽出的 69 考点元信息 |

## 二、怎么重跑

```powershell
cd 数学二\zhenti
$env:PYTHONIOENCODING = "utf-8"     # Windows 控制台是 GBK，不设会乱码/报错
python fetch_zhenti.py              # 可选：重新抓源文件
python parse_math2.py               # 期望：755 题 / 40 年，2011–2026 各年 22~23 题
python parse_kp.py
python apply_assign.py              # 期望：主归属 362 · 次要归属 8 · 异常 0
python build_zhenti_js.py           # 期望：362 题 / 69 关 / 0 告警
node check_zhenti.js                # 期望：错误 0
```

## 三、设计约定（改动前先读）

- **一年一题块**：真题=2011–2026 共 16 年。选择/填空自动判分；**解答题源文件只有解析、
  没有独立「答案」行**，所以走「看解析自评」。
- **一题一主归属**（362 条），8 条 `@` 次要归属给方法型/概念型考点（拉格朗日、洛必达、
  分部积分…）——同一道题可以同时挂在两个真题关里。
- **卫星形态**：母考点球右上角一颗小「真」球 + 一条虚线短牵引；不改三层列布局。
- **解锁门槛**：`Store.isCleared(母考点)`。没通关只给 toast 提示，不跳转。
- **独立统计**：真题通关记录写进 `state.zt`（`Store.ztRecord / ztFinish / ztCleared`），
  **不写 `state.cleared`**——否则 `snapshot().clearedCount` 会撑破 69，七龙珠 / 满星数 / 章节全清
  会全部算错。掌握度、最弱考点、考试面板都只遍历 `NS.NODES`，天然不含 `zt-*`。
- **题目字段**：`{id:'zt-YYYY-N', year, num, zt:[母考点…], type, level, score, diff:'exam',
  stem, options, answer, analysis, source}`；`diff:'exam'` 复用题库的「真题」标签，
  `year` 让战斗卡多显示一个「20XX 真题」标签。
- **数学定界符**：`engine.fmt()` 只认 `\(…\)` / `\[…\]` / `$$…$$`，**不认单个 `$`**。
  构建脚本会把源文件的 `$…$` 统一转成 `\(…\)`，`$$…$$` 转成 `\[…\]`。
- **源里的 Markdown 残留**已清理：小节标题（`### 2. 填空题`）、`> 本题共…`、`[文字](链接)`、
  行首 `- `/`* `、反引号、`---` 分隔线；`#### （1）…` 这类小标题转成 `◆ （1）…`。

## 四、已知取舍

- **知识点只在 2020–2026 有**（2022 整年没有，2023 只有 16 条），所以「本题考点」这句
  只有在少数年份会显示。
- **填空题答案**存三种写法：原 LaTeX、去括号纯文本、带括号纯文本；三种都不匹配就落到
  「未能匹配到标准答案写法，请对照参考答案自行判定」（自评），不会误判。
- 源仓库 `zhaokaifengcom/kysx2-zt` **没有 License**，仅限个人学习使用，不要分发。
