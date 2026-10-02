/* ============================================================
 * 302 数学二 · 龙珠立绘系统
 * ------------------------------------------------------------
 * 素材：assets/dbz/ 下 62 张黑白漫画风全身立绘（纯黑底 PNG）。
 *       黑底图用 mix-blend-mode: screen 自动扣底，融进紫电主题。
 *
 * 章节即剧情：高数 6 章按龙珠剧情推进——
 *   c1 函数极限连续 = 少年篇开局（小悟空/乌龙/普尔…）
 *   c2 一元微分学   = 武道会与师傅们（程龙/天津饭/猫仙人…）
 *   c3 一元积分学   = 那美克星大战（全员战士上阵，章 BOSS 弗利萨）
 *   c4 多元微分学   = 人造人篇（16/17/18/20/8 号正好 5 节点）
 *   c5 二重积分     = 沙鲁游戏（沙鲁一家三形态 + 超二悟饭）
 *   c6 常微分方程   = 魔人布欧篇（巴比迪→达布拉→恶魔布欧→小布欧）
 * 线代 6 章 = 强敌叩关 → 换身之术（矩阵变换）→ 不可替代者（向量组）→
 *   求解之路（布罗利/古拉压轴）→ 照见本色（特征值）→ 二次型归位（圆滚滚 = 对称矩阵）。
 *
 * ⚠️ 高数线是**严格按龙珠正传顺序**排的；线代线是按**数学属性**选的角
 *    （分块 = 战队分工、秩 = 全书枢纽、对称 = 与父同貌），所以线代的章节标题
 *    刻意**不点名任何具体队伍** —— 否则会出现"基纽特战队里半数不是特战队"的穿帮。
 *    同理，高数第 3 章混进的未来特兰克斯/悟天/比迪丽，用章节引子里
 *    "至于从未来赶来的那几位"一句话圆成设定。
 *
 * tier 对应角色分量：
 *   1 基础层 = 轻量配角；2 综合层 = 中坚战士；3 拓展层 = 章内大反派。
 *
 * 69 个节点 62 张图：9 个节点复用同章/同系角色（见 ASSIGN 中 * 标记）。
 * 错题本重练固定用雅木茶——躺地上的男人，错题之王。
 * ============================================================ */
window.HNSF829 = window.HNSF829 || {};
(function (NS) {
  'use strict';

  /** aura：节点光色随 tier 走（1 蓝 / 2 紫 / 3 红），错题本灰 */
  var AURA = { 1: '#38bdf8', 2: '#a78bfa', 3: '#fb7185' };

  /**
   * 阵营：决定「试炼卡」用哪一档口吻，以及登场时是暖色还是血色。
   *
   * 为什么需要这个：一开始想把每个节点的角色都叫「师傅」，但弗利萨、沙鲁、布欧、
   * 布罗利这些是**反派**，挂上"师傅"牌子立刻出戏。改成「试炼」后：
   *   友方（克林/界王/猫仙人…）开口是"这关我带你"，
   *   反派（弗利萨/沙鲁/拉蒂兹…）开口是"想过我这关，先……"。
   * 知识点与公式两边都照给 —— 题目本来就是他出的，他当然说得出要求。
   *
   * ⚠️ aura 仍然按 tier 走（羁绊录的描边色依赖它），阵营只影响口吻与名牌配色。
   */
  var FOES = [
    'pilaf', 'general-blue', 'zarbon', 'frieza',
    '16', '17', '18', '20',
    'cell', 'cell-junior', 'perfect-cell',
    'babidi', 'dabura', 'spopovitch', 'evil-buu', 'kid-buu', 'majin-buu',
    'raditz', 'nappa', 'tao-pai-pai-cyborg',
    'burter', 'ginyu', 'majin-vegeta',
    'broly', 'cooler-final-form', 'beerus'
  ];

  function M(id, name, tier) {
    // blend：纯黑底 PNG，引擎对其强制 mix-blend-mode: screen 扣底
    return {
      id: id, name: name, file: id + '.png',
      side: FOES.indexOf(id) >= 0 ? 'foe' : 'ally',
      aura: AURA[tier] || '#94a3b8', blend: true
    };
  }

  /* 62 张立绘清单（id = assets/dbz/ 文件名去 .png） */
  var LIST = [
    /* —— 少年篇配角 —— */
    M('kid-goku', '小悟空', 1),
    M('oolong', '乌龙', 1),
    M('puar', '普尔', 1),
    M('sea-turtle', '海龟', 1),
    M('farmer', '过路农夫', 1),
    M('pilaf', '皮拉夫大王', 1),
    M('krillin', '克林', 2),
    M('chiaotzu', '饺子', 1),
    M('yajirobe', '亚奇洛贝', 1),
    /* —— 武道会与师傅们 —— */
    M('jackie-chun', '程龙', 1),
    M('tien-shinhan', '天津饭', 1),
    M('yamcha', '雅木茶', 1),
    M('korin', '猫仙人', 2),
    M('popo', '波波先生', 2),
    M('general-blue', '蓝将军', 2),
    M('mighty-mask', '无敌假面', 2),
    M('king-kai', '界王', 2),
    M('fortuneteller-baba', '占卜婆婆', 2),
    M('piccolo', '比克', 3),
    /* —— 那美克星篇 —— */
    M('nail', '内鲁', 1),
    M('gohan-namek', '那美克悟饭', 1),
    M('trunks', '特兰克斯', 1),
    M('bardock', '巴达克', 1),
    M('goku', '悟空', 1),
    M('future-trunks', '未来特兰克斯', 2),
    M('goten', '悟天', 2),
    M('bulma', '布尔玛', 2),
    M('future-trunks-super-saiyan', '超赛特兰克斯', 2),
    M('videl', '比迪丽', 2),
    M('zarbon', '萨博', 2),
    M('frieza', '弗利萨', 3),
    /* —— 人造人篇（数字文件名） —— */
    M('16', '人造人16号', 1),
    M('17', '人造人17号', 1),
    M('18', '人造人18号', 2),
    M('20', '人造人20号', 2),
    M('8', '人造人8号', 1),
    M('2', '超二悟饭', 3),
    /* —— 沙鲁游戏篇 —— */
    M('cell', '沙鲁', 2),
    M('cell-junior', '小沙鲁', 2),
    M('perfect-cell', '完全体沙鲁', 3),
    /* —— 魔人布欧篇 —— */
    M('babidi', '巴比迪', 1),
    M('dabura', '达布拉', 1),
    M('spopovitch', '斯波比奇', 2),
    M('evil-buu', '恶魔布欧', 3),
    M('kid-buu', '小布欧', 3),
    M('majin-buu', '魔人布欧', 2),
    /* —— 线代：赛亚人来袭 —— */
    M('raditz', '拉蒂兹', 1),
    M('nappa', '那巴', 2),
    M('tao-pai-pai-cyborg', '机械桃白白', 3),
    /* —— 线代：特战队与神界 —— */
    M('gotenks-fat', '胖悟天克斯', 1),
    M('kibito', '基比托', 1),
    M('burter', '巴特', 2),
    M('ginyu', '基纽', 2),
    M('supreme-kai', '界王神', 2),
    M('majin-vegeta', '魔人贝吉塔', 3),
    /* —— 线代：压轴客串 —— */
    M('mr-satan', '撒旦先生', 2),
    M('baba-ghost', '幽灵婆婆', 2),
    M('broly', '布罗利', 3),
    M('cooler-final-form', '最终形态古拉', 3),
    M('beerus', '破坏神比鲁斯', 3)
  ];

  /* 节点 → 立绘（69 个数学节点全覆盖；同章/同系角色允许复用） */
  var ASSIGN = {
    /* 高数 · 第 1 章 函数、极限与连续 —— 少年篇开局 */
    'gs-lim-fn': 'kid-goku',          // 开局第一考点 = 主角登场
    'gs-lim-seq': 'oolong',
    'gs-lim-equiv': 'puar',
    'gs-lim-twokey': 'sea-turtle',
    'gs-cont': 'farmer',
    'gs-lim-calc': 'krillin',         // 章内最重计算 = 克林苦练
    'gs-lim-squeeze': 'chiaotzu',
    'gs-cont-closed': 'yajirobe',

    /* 高数 · 第 2 章 一元函数微分学 —— 武道会与师傅们 */
    'gs-deriv-def': 'jackie-chun',    // 定义 = 宗师授业
    'gs-deriv-rule': 'tien-shinhan',
    'gs-deriv-implicit': 'yamcha',
    'gs-lhopital': 'korin',           // 爬塔求超神水 = 洛必达救命法宝
    'gs-mono': 'popo',
    'gs-concave': 'general-blue',
    'gs-opt': 'mighty-mask',          // 最值应用 = 假面登台表演
    'gs-mvt': 'king-kai',             // 中值定理 = 界王心法
    'gs-taylor': 'fortuneteller-baba',// 泰勒展开 = 占卜预见未来
    'gs-ineq-prove': 'piccolo',       // 章 BOSS = 证明压轴

    /* 高数 · 第 3 章 一元函数积分学 —— 那美克星大战 */
    'gs-int-antideriv': 'nail',
    'gs-int-sub': 'gohan-namek',      // 换元 = 变身
    'gs-int-parts': 'trunks',
    'gs-int-def': 'bardock',
    'gs-int-nl': 'goku',              // 牛顿-莱布尼茨 = 绝对主力
    'gs-int-var': 'future-trunks',    // 变限积分 = 时间线在变
    'gs-int-sym': 'goten',            // 对称性 = 与父同貌
    'gs-int-rat': 'bulma',            // 部分分式 = 拆解机器
    'gs-int-app': 'future-trunks-super-saiyan', // 章内重头戏
    'gs-int-phys': 'videl',           // 物理应用
    'gs-int-improp': 'zarbon',        // 反常 = 隐藏形态
    'gs-int-mvt': 'frieza',           // 章 BOSS = 积分压轴

    /* 高数 · 第 4 章 多元函数微分学 —— 人造人五人组 */
    'gs-multi-lim': '16',
    'gs-multi-partial': '17',
    'gs-multi-chain': '18',
    'gs-multi-extrem': '20',
    'gs-multi-lagrange': '8',

    /* 高数 · 第 5 章 二重积分 —— 沙鲁游戏 */
    'gs-dbl-rect': 'cell',
    'gs-dbl-polar': 'cell-junior',    // 极坐标 = 圆域绕圈
    'gs-dbl-order': 'perfect-cell',   // 交换次序 = 进化顺序
    'gs-dbl-sym': '2',                // 对称性 = 超二悟饭决战

    /* 高数 · 第 6 章 常微分方程 —— 魔人布欧篇 */
    'gs-ode-concept': 'babidi',
    'gs-ode-first': 'dabura',
    'gs-ode-reduce': 'spopovitch',
    'gs-ode-cc2': 'evil-buu',         // 二阶常系数 = 本章最大头目
    'gs-ode-app': 'kid-buu',          // 应用压轴 = 纯粹之恶

    /* 线代 · 第 1 章 行列式 —— 赛亚人来袭 */
    'xd-det-calc': 'raditz',
    'xd-det-expand': 'nappa',
    'xd-det-abstract': 'tao-pai-pai-cyborg', // 抽象 = 暗器无声

    /* 线代 · 第 2 章 矩阵及其运算 —— 特战队（变换 = 换身术） */
    'xd-mat-op': 'gotenks-fat',       // 运算律 = 融合规则
    'xd-mat-inv': 'kibito',           // 逆变换 = 治愈还原
    'xd-mat-block': 'burter',         // 分块 = 战队分工
    'xd-mat-elem': 'ginyu',           // 初等变换 = 换身术
    'xd-mat-rank': 'supreme-kai',     // 秩 = 全书枢纽
    'xd-mat-rankineq': 'majin-vegeta',// 压轴 = 王子的骄傲

    /* 线代 · 第 3 章 向量组 —— 皮拉夫三人组与冠军 */
    'xd-vec-comb': 'pilaf',           // 向量组 = 皮拉夫三人组
    'xd-vec-dep': 'chiaotzu',         // 相关 = 饺子依赖天津饭
    'xd-vec-max': 'mr-satan',         // 极大无关组 = 世界冠军
    'xd-vec-equiv': 'baba-ghost',     // 等价 = 婆婆双形态

    /* 线代 · 第 4 章 线性方程组 —— 布罗利与兄弟 */
    'xd-solve-homo': '17',            // * 复用：人造人家族
    'xd-solve-nonhomo': '18',         // * 复用
    'xd-solve-param': 'broly',        // 参数讨论 = 狂暴化
    'xd-solve-common': 'cooler-final-form', // 公共解 = 兄弟同源

    /* 线代 · 第 5 章 特征值与相似对角化 —— 神界 */
    'xd-eig-calc': 'goku',            // * 复用：战斗力探测 = 特征值
    'xd-eig-sim': 'future-trunks',    // * 复用：相似 = 平行时间线
    'xd-eig-sym': 'gohan-namek',      // * 复用：正交化 = 那美克仪式
    'xd-eig-abstract': 'beerus',      // 抽象 = 神级概念

    /* 线代 · 第 6 章 二次型 —— 胖布欧家族 */
    'xd-qf-mat': 'majin-buu',         // 圆滚滚 = 对称矩阵
    'xd-qf-standard': 'trunks',       // * 复用：拔剑斩 = 规范化
    'xd-qf-inertia': 'frieza',        // * 复用：正负惯性 = 形态切换
    'xd-qf-positive': 'goku',         // * 复用：正定 = 正气

    /* 错题本重练 = 躺地上的男人 */
    'wrong': 'yamcha'
  };

  var byId = {};
  LIST.forEach(function (m) { byId[m.id] = m; });

  /** 是否在考验条上方显示「角色名 · 关卡名」。false = 只显示关卡名 */
  var SHOW_NAME = false;

  /**
   * ⚠️ 曾经的「每次随机抽一名角色」模式已删除。
   *
   * 原因：现在每个考点有一位**固定的出题人**，他会开口说"想过我这关先……"，
   * 通关后还会出现在「羁绊录」里。一旦战斗中随机换脸，就会出现
   * 试炼卡说是拉蒂兹、战斗里站着悟空、结算说"悟空认可了你"、羁绊录又点亮拉蒂兹
   * 这种四处穿帮。角色映射必须是**一对一且固定**的。
   */

  /** 立绘探测结果：id -> 'ok' | 'miss'（图在 assets/dbz/，探测仅作兜底参考） */
  var statusMap = {};

  var DIR = 'assets/dbz/';

  var self = {
    list: LIST,
    assign: ASSIGN,
    showName: SHOW_NAME,
    customDir: '',
    dir: DIR,

    /** 取某个节点对应的角色定义 */
    forNode: function (nodeId) {
      var id = ASSIGN[nodeId] || 'goku';
      return byId[id] || byId['goku'];
    },

    byId: function (id) { return byId[id] || null; },

    /** 引擎探测到立绘后回报结果 */
    setStatus: function (id, s) { statusMap[id] = s; },
    statusMap: function () { return statusMap; },
    status: function (id) { return statusMap[id]; },

    /**
     * 立绘候选地址。图片统一在 assets/dbz/，单地址；
     * 加载失败由引擎回退 emoji，不会报错。
     */
    urls: function (m) {
      if (!m) return [];
      return [DIR + m.file];
    },

    /** 血条上方那一行显示什么 */
    label: function (monster, nodeLabel) {
      if (!monster || !SHOW_NAME) return nodeLabel || '';
      return monster.name + '　·　' + (nodeLabel || '');
    }
  };

  NS.Monsters = self;
})(window.HNSF829);
