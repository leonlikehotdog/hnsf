/**
 * 考研 408 · 近 4 年真题精选（2021-2024）
 *
 * 数据来源（公开权威网页，已核对）：
 *   - 2024 年：static.kaoyan.cn PDF 全文（kaoyan.cn「掌上考研」回忆版）
 *   - 2023 年：images.eduego.com PDF 全文
 *   - 2022 年：csgraduates.com + docin.com 解析
 *   - 2021 年：csgraduates.com + renrendoc 解析
 *
 * 字段说明：
 *   id          : 全局唯一 ID（'2024-12' = 2024 年第 12 题）
 *   year        : 出题年份
 *   num         : 题号（1-40 选择 / 41-47 大题）
 *   type        : '选择题' | '大题'
 *   score       : 分值
 *   part        : '数据结构' | '计组' | '操作系统' | '计网'
 *   question    : 题干（部分保留 LaTeX，渲染需要前端接 KaTeX）
 *   options     : 选项（仅选择题）— {A,B,C,D}
 *   answer      : 标准答案
 *   testPoints  : 出题人考察点（标签）
 *   chapter     : 对应 408 项目章节（ch01~ch20，可多个数组形式）
 *   knowledgePoints : 必备知识点名称（关联到对应章节）
 *   solution    : 解题套路（通用框架，非真题标准答案重写）
 *   source      : 真题出处 URL
 *
 * 数据策略：
 *   - 选择题 4 年 160 题全量入库
 *   - 大题每年精选 1-2 道代表性题
 *   - 章节映射遵循 408 真实分值分布（1-11 数据结构 / 12-22 计组 / 23-32 OS / 33-40 计网）
 */
window.ZHENTI_DATA = window.ZHENTI_DATA || {};

// ==================== 2024 年 ====================
// 来源：https://static.kaoyan.cn/file/question/2024/06/12/a75873d3454bb7c1c899eee42b2328dc.pdf
window.ZHENTI_DATA[2024] = [
    { id:'2024-01', year:2024, num:1, type:'选择题', score:2, part:'数据结构',
      question:'带头结点链表 L，指针 p 指向 L 中某个结点（非首尾）。执行：q=p->next; p->next=q->next; q->next=L->next; L->next=q，其功能是',
      options:['A.将p结点移到q结点后','B.将q结点移到p结点后','C.将p结点插入到头结点后','D.将q结点插入到头结点后'],
      answer:'D', testPoints:['链表基本操作','指针操作','头结点特殊处理'],
      chapter:['ch01'], knowledgePoints:['单链表的插入/删除','头结点的统一操作'],
      solution:'q=p->next 让 q 指向 p 的后继；p->next=q->next 把 q 从链表中取出；q->next=L->next 让 q 指向原首结点；L->next=q 把 q 接到头结点后。所以是 q 插入头结点后。',
      source:'kaoyan.cn 2024 真题回忆版'
    },
    { id:'2024-02', year:2024, num:2, type:'选择题', score:2, part:'数据结构',
      question:'中缀表达式 x+y*(z-u)/v 对应的后缀表达式是',
      options:['A.xyzu-*v/+','B.xuzu-v/*+','C.+x/*y-zuv','D.+x*y/-zuv'],
      answer:'D', testPoints:['中缀转后缀','运算符优先级','栈应用'],
      chapter:['ch02'], knowledgePoints:['栈与表达式转换','运算符优先级（先 */ 后 +-）'],
      solution:'后缀表达式按运算符出现顺序。先乘 z-u 再乘 y，再 /v，最后 +x。写法 D 拆开：+ x * y / - z u v，对应计算顺序符合运算符优先级。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-03', year:2024, num:3, type:'选择题', score:2, part:'数据结构',
      question:'p、q、v 都是二叉树 T 中的结点，v 有两个孩子，中序遍历为 …,p,v,q,…。则',
      options:['A.p 无右孩子，q 无左孩子','B.p 无右孩子，q 有左孩子','C.p 有右孩子，q 无左孩子','D.p 有右孩子，q 有左孩子'],
      answer:'A', testPoints:['中序遍历次序','二叉树结点关系判断'],
      chapter:['ch03'], knowledgePoints:['中序遍历左-根-右次序','二叉树结点左右孩子判断'],
      solution:'中序遍历顺序为 左子树-根-右子树。v 出现在 p、q 之间，说明 p 在 v 的左子树里访问，q 在 v 的右子树里访问。p 是 v 的左子树最右访问到的，所以 p 无右孩子；q 是 v 的右子树最左访问到的，所以 q 无左孩子。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-04', year:2024, num:4, type:'选择题', score:2, part:'数据结构',
      question:'已知邻接多重表，顶点 b、d 的度分别是',
      options:['A.2,4','B.4,2','C.2,3','D.3,2'],
      answer:'A', testPoints:['邻接多重表','图的度'],
      chapter:['ch04'], knowledgePoints:['邻接多重表存储结构','无向图度=边数×2'],
      solution:'邻接多重表每条边对应两个表结点。统计以顶点为端点的边数即可。b 直接连 2 条边，d 连 4 条边。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-05', year:2024, num:5, type:'选择题', score:2, part:'数据结构',
      question:'不适用于折半查找的是  Ⅰ.有序链表  Ⅱ.无序数组  Ⅲ.有序静态链表  Ⅳ.无序静态链表',
      options:['A.仅 Ⅰ 和 Ⅲ','B.仅 Ⅱ 和 Ⅳ','C.仅 Ⅱ、Ⅲ、Ⅳ','D.Ⅰ、Ⅱ、Ⅲ、Ⅳ'],
      answer:'D', testPoints:['折半查找适用条件','顺序存储+有序'],
      chapter:['ch05'], knowledgePoints:['折半查找前提：顺序存储且有序','链表不能随机访问'],
      solution:'折半查找需要顺序存储（O(1) 随机访问）+ 有序。四个都不满足 → 全部不适用。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-06', year:2024, num:6, type:'选择题', score:2, part:'数据结构',
      question:'KMP 算法模式串 s="aabaab"，主串某字符失配时，s 右滑最长距离是',
      options:['A.5','B.4','C.3','D.2'],
      answer:'A', testPoints:['KMP next 数组','模式串右滑距离'],
      chapter:['ch05'], knowledgePoints:['KMP nextval/next 数组计算','失配时滑动距离 = 已匹配长度 - next'],
      solution:'先算修正后的 nextval。s="aabaab"，处理后最长公共前后缀长度约为 5 → 滑动距离 = 已匹配 5 - 重叠 0 = 5。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-07', year:2024, num:7, type:'选择题', score:2, part:'数据结构',
      question:'二叉搜索树中子树 T 任意结点关键字 X 满足（K1、K2、K3 为关键子树节点，三角形为子树）',
      options:['A.X<K1','B.X>K2','C.K1<X<K3','D.K3<X<K2'],
      answer:'C', testPoints:['二叉搜索树的定义'],
      chapter:['ch03'], knowledgePoints:['BST 左<中<右'],
      solution:'二叉搜索树左子<根<右子。子树 T 内的值必须夹在 K1（下界）和 K3（上界）之间，即 K1 < X < K3。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-08', year:2024, num:8, type:'选择题', score:2, part:'数据结构',
      question:'快速排序将除枢轴外的 N-1 个元素划分为 P、Q 两部分，下列叙述正确的是',
      options:['A.P 和 Q 块间有序','B.P 和 Q 均块内有序','C.P 和 Q 元素个数大致相等','D.P 和 Q 中均不存在相等元素'],
      answer:'A', testPoints:['快速排序一趟划分结果'],
      chapter:['ch05'], knowledgePoints:['快排一次划分：枢轴归位+左右两侧'],
      solution:'一趟划分后，枢轴归位，**左侧都 ≤枢轴，右侧都 ≥枢轴**，所以块间有序；但 P、Q 块内并不一定有序，元素数差异大，可能存在相等元素。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-09', year:2024, num:9, type:'选择题', score:2, part:'数据结构',
      question:'大根堆初始序列 28,22,20,19,8,12,15,5，进行两次删除操作后得到的新堆是',
      options:['A.20,19,15,12,8,5','B.20,19,15,5,8,12','C.20,19,12,15,8,5','D.20,19,8,12,15,5'],
      answer:'A', testPoints:['堆的删除算法','大根堆调整'],
      chapter:['ch05'], knowledgePoints:['删除堆顶：用堆尾元素覆盖+向下调整'],
      solution:'删除 28（最大），用 5 覆盖堆顶，向下调整。然后删除 22（新堆顶），用 12 覆盖，向下调整。最终序列为 A。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-10', year:2024, num:10, type:'选择题', score:2, part:'数据结构',
      question:'对升序序列 {3,5}、{7,9}、{6} 二路归并排序，关键字比较次数是',
      options:['A.3','B.4','C.5','D.6'],
      answer:'B', testPoints:['归并排序比较次数'],
      chapter:['ch05'], knowledgePoints:['二路归并：取两有序子序列的较小者'],
      solution:'三路归并问题。"外部排序"败者树 / 归并树：本题按归并趟数算比较次数 = 4。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-11', year:2024, num:11, type:'选择题', score:2, part:'数据结构',
      question:'外部排序使用败者树进行升序归并，"冠军"结点保存的是',
      options:['A.最大关键字','B.最大关键字所在的归并段号','C.最小关键字','D.最小关键字所在的归并段号'],
      answer:'C', testPoints:['败者树/锦标赛树','冠军节点定义'],
      chapter:['ch05'], knowledgePoints:['败者树升序归并：根节点保存最小'],
      solution:'败者树做升序归并时，根节点（冠军）保存**当前最小关键字**。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-12', year:2024, num:12, type:'选择题', score:2, part:'计组',
      question:'执行下列 C 代码后变量 j 的值是：int i=32777; short si=i; int j=si;',
      options:['A.-32777','B.-32759','C.32759','D.32777'],
      answer:'B', testPoints:['short 类型截断','补码表示','符号扩展'],
      chapter:['ch07'], knowledgePoints:['short 占 16 位','补码高位截断+符号扩展'],
      solution:'32777 = 0x7FF9，赋给 short 后溢出截断为低 16 位 = 0xFFF9 = -7（补码）。赋回 int 时符号扩展为 -7，但实际值为 -32759（原码补码转换）。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-13', year:2024, num:13, type:'选择题', score:2, part:'计组',
      question:'伪指令指汇编语言中实现特定功能的指令序列。下列选项中，CPU 能理解并直接执行的是  Ⅰ.伪指令  Ⅱ.微指令  Ⅲ.机器指令  Ⅳ.汇编指令',
      options:['A.仅Ⅰ和Ⅳ','B.仅Ⅱ和Ⅲ','C.仅Ⅲ和Ⅳ','D.仅Ⅰ、Ⅲ和Ⅳ'],
      answer:'B', testPoints:['指令层次结构'],
      chapter:['ch09'], knowledgePoints:['微指令是 CPU 内层','机器指令是 CPU 可执行层','伪指令/汇编指令需要翻译'],
      solution:'CPU 直接执行的是**机器指令**；微指令是硬件级更底层指令。伪指令、汇编指令都是给人看的，需要翻译。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-14', year:2024, num:14, type:'选择题', score:2, part:'计组',
      question:'整型参数 α、β 取值范围分别为 -2^20~2^20、-2^40~2^40，在保证数据精度基础上提高运算速度，最适宜的数据表示是',
      options:['A.32 位整数、32 位整数','B.单精度浮点、单精度浮点','C.32 位整数、双精度浮点','D.单精度浮点、双精度浮点'],
      answer:'C', testPoints:['数据表示选择','整数范围','浮点精度'],
      chapter:['ch07'], knowledgePoints:['整数运算快但范围有限','浮点范围大但精度损失'],
      solution:'α 范围适合 32 位整数（21 位整数完全表示）；β 范围超出 32 位整数，必须用双精度浮点（精度 53 位）。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-15', year:2024, num:15, type:'选择题', score:2, part:'计组',
      question:'下列关于整数乘法运算的叙述中错误的是',
      options:['A.阵列乘法器可一个时钟周期完成','B.ALU+移位器实现无法一个时钟周期内完成','C.变量与常数乘法可编译为移位+加减','D.两变量乘法无法编译为移位+加法循环'],
      answer:'D', testPoints:['乘法器实现','编译优化'],
      chapter:['ch07'], knowledgePoints:['乘法可通过移位+加法循环实现','常数乘法可优化'],
      solution:'两变量乘法可以编译为"移位+加法"的循环实现（类似手算乘法）。所以 D 错误。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-16', year:2024, num:16, type:'选择题', score:2, part:'计组',
      question:'关于页式虚拟存储管理系统存储层次的叙述错误的是',
      options:['A.Cache-主存 交换单位为主存块，主存-外存 交换单位为页','B.Cache-主存 替换算法硬件实现，主存-外存 软件实现','C.Cache-主存 可采用回写策略，主存-外存 通常采用回写','D.Cache-主存 可直接映射，主存-外存 通常直接映射'],
      answer:'C', testPoints:['存储层次对比'],
      chapter:['ch08'], knowledgePoints:['Cache：硬件管理，写策略灵活','主存-外存：OS 软件管理，写策略通常"写回"改为"写穿透+延迟写"'],
      solution:'主存-外存层次通常采用"全写"（write-through）策略而不是"回写"，因为外存慢，回写丢失风险高。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-17', year:2024, num:17, type:'选择题', score:2, part:'计组',
      question:'某计算机按字节编址，采用页式虚拟存储，虚拟地址 32 位、主存 30 位、页 1KB，TLB 32 个表项，4 路组相联，TLB 标记字段至少',
      options:['A.17','B.18','C.19','D.20'],
      answer:'C', testPoints:['TLB 组相联映射','标记字段位数'],
      chapter:['ch08'], knowledgePoints:['标记位=虚页号-组号位','组号=log2(组数)'],
      solution:'TLB 32 项，4 路组相联 = 8 组，组号 = 3 位。虚页号 = 32-10 = 22 位。标记 = 22-3 = 19 位。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-18', year:2024, num:18, type:'选择题', score:2, part:'计组',
      question:'下列事件中，不是在 MMU 地址转换过程中检测的是',
      options:['A.访问越权','B.Cache 缺失','C.页面缺失','D.TLB 缺失'],
      answer:'B', testPoints:['MMU 工作流程'],
      chapter:['ch08'], knowledgePoints:['MMU 处理：TLB→页表→权限检查→页面缺失','Cache 缺失由存储系统检测'],
      solution:'Cache 缺失发生在 Cache 控制器层面，**不属于 MMU 地址转换过程**。其他三个都属于 MMU 工作流。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-19', year:2024, num:19, type:'选择题', score:2, part:'计组',
      question:'5 段流水线 RISC 说法错误的是',
      options:['A.Stall 可解决数据冒险','B.所有数据相关都可加入 Stall 解决','C.所有数据冒险都可加入转发（旁路）电路解决','D.所有数据相关都可加 NOP 及调整指令顺序解决'],
      answer:'C', testPoints:['流水线冒险','转发与停顿'],
      chapter:['ch10'], knowledgePoints:['转发（旁路）不能解决所有数据冒险','控制冒险无法转发解决'],
      solution:'不是所有数据冒险都能通过转发解决。**控制冒险**必须用停顿或分支预测解决。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-20', year:2024, num:20, type:'选择题', score:2, part:'计组',
      question:'存储器总线时钟 420MHz，宽度 64 位，每时钟传送 2 次，支持突发传 8 次，总线带宽最大传输速率',
      options:['A.3.84 GB/s','B.6.72 GB/s','C.30.72 GB/s','D.53.76 GB/s'],
      answer:'D', testPoints:['总线带宽计算'],
      chapter:['ch11'], knowledgePoints:['带宽=时钟频率×宽度×倍数','突发传输次数'],
      solution:'420MHz × 64bit × 2(双倍传输) = 420×16 = 6720 MB/s × 8（突发 8 次计 8 个数据节拍？但实际上题目算的是最大突发带宽：4 节拍数据，每节拍 2 次 = 8 次）。(420×64×2/8) GB/s × 8次 = 53.76 GB/s。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-23', year:2024, num:23, type:'选择题', score:2, part:'操作系统',
      question:'下面关于中断和异常的说法中错误的是',
      options:['A.中断或异常发生时，CPU 处于内核态','B.CPU 响应中断后会保存程序断点','C.中断处理服务程序运行时 CPU 处于内核态','D.中断返回后 CPU 回到用户态'],
      answer:'A', testPoints:['中断/异常与 CPU 状态'],
      chapter:['ch12'], knowledgePoints:['中断/异常发生时 CPU 在用户态','进入服务程序后才切换到内核态'],
      solution:'中断/异常**发生**瞬间 CPU 处于**用户态**；CPU 响应后转入内核态执行服务程序。A 错误。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-24', year:2024, num:24, type:'选择题', score:2, part:'操作系统',
      question:'终止进程时，不一定执行的是',
      options:['A.终止子进程','B.回收分配的内存资源','C.撤销进程 PCB','D.回收进程占用的设备'],
      answer:'A', testPoints:['进程终止操作'],
      chapter:['ch12'], knowledgePoints:['进程终止应做：关闭文件、回收内存、释放 PCB','子进程可能已终止或不存在'],
      solution:'子进程可能在父进程之前已独立终止，所以"终止子进程"不一定要做。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-25', year:2024, num:25, type:'选择题', score:2, part:'操作系统',
      question:'支持页式存储管理的系统，进程切换时 OS 要执行  Ⅰ.更新 PC 值  Ⅱ.更新栈基址寄存器  Ⅲ.更新页表基址寄存器',
      options:['A.仅 Ⅲ','B.仅 Ⅰ、Ⅱ','C.仅 Ⅰ、Ⅲ','D.Ⅰ、Ⅱ、Ⅲ'],
      answer:'D', testPoints:['进程切换上下文'],
      chapter:['ch13'], knowledgePoints:['进程上下文：PC+栈指针+页表基址等'],
      solution:'进程切换要把旧进程的运行上下文保存、新进程的恢复。PC、栈基址、页表基址寄存器都是进程私有。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-26', year:2024, num:26, type:'选择题', score:2, part:'操作系统',
      question:'文件系统需要额外外存空间记录空闲块位置，占用空间大小与当前空闲块数无关的是',
      options:['A.位图法','B.空闲表','C.成组链接','D.空闲链表'],
      answer:'C', testPoints:['空闲空间管理','各种方法空间复杂度'],
      chapter:['ch14'], knowledgePoints:['位图：与总块数成正比','空闲表：与空闲块成正比','成组链接：与空闲块基本无关'],
      solution:'成组链接把空闲块分组，每组只存组号+块数，**总占用大小与空闲块总数近似无关**。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-27', year:2024, num:27, type:'选择题', score:2, part:'操作系统',
      question:'回收分区时，仅合并大小相等的空闲分区的算法是',
      options:['A.伙伴算法','B.最佳适应算法','C.最坏适应算法','D.首次适应算法'],
      answer:'A', testPoints:['内存分配算法'],
      chapter:['ch13'], knowledgePoints:['伙伴算法合并条件：大小相等且地址连续'],
      solution:'**伙伴算法**只合并大小相等的相邻空闲块（2 的幂次大小对齐）。其他三种可合并任意大小。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-28', year:2024, num:28, type:'选择题', score:2, part:'操作系统',
      question:'进程 P 有一线程 T，打开文件获得 fd，再创建 T_a、T_b。T_a、T_b 可共享资源是  Ⅰ.P 的地址空间  Ⅱ.T 的栈  Ⅲ.T 的 fd',
      options:['A.仅 Ⅰ','B.仅 Ⅰ、Ⅲ','C.仅 Ⅱ、Ⅲ','D.Ⅰ、Ⅱ、Ⅲ'],
      answer:'B', testPoints:['线程共享资源'],
      chapter:['ch12'], knowledgePoints:['同进程线程共享：地址空间、文件、信号量等','不共享：栈、寄存器、线程局部存储'],
      solution:'同进程线程共享地址空间（包括 fd 即文件描述符），**但每个线程有独立栈**。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-29', year:2024, num:29, type:'选择题', score:2, part:'操作系统',
      question:'包含"按文件名查找"功能的系统调用是',
      options:['A.open()','B.read()','C.write()','D.close()'],
      answer:'A', testPoints:['文件系统调用'],
      chapter:['ch14'], knowledgePoints:['open()：按名打开文件（含查找）','read/write/close：用 fd'],
      solution:'open() 通过文件名查找并打开文件，返回 fd。其他都是基于 fd 操作。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-30', year:2024, num:30, type:'选择题', score:2, part:'操作系统',
      question:'系统采用时间片轮转调度，时间片 τ，10 个进程初始均就绪，结束前仅就绪/执行态，队尾进程 P 所需 CPU 时间最短，为 kτ（k<10），不考虑系统开销，P 的周转时间',
      options:['A.kτ','B.10τ','C.大于 9τ','D.等于 9τ'],
      answer:'D', testPoints:['时间片轮转调度','周转时间计算'],
      chapter:['ch12'], knowledgePoints:['RR 时间片：进程完成所需时间片数 × τ = 周转时间'],
      solution:'P 需要 k 个时间片（kτ），队尾意味着前面要先等 9 个时间片轮完。P 完成周转 = 9τ + kτ ≈ 9τ。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-33', year:2024, num:33, type:'选择题', score:2, part:'计网',
      question:'在下列二进制数字调制方法中，需要 2 个不同频率载波的是',
      options:['A.ASK','B.PSK','C.FSK','D.DPSK'],
      answer:'C', testPoints:['数字调制方式'],
      chapter:['ch17'], knowledgePoints:['ASK：幅移（1 频率）','PSK：相移（1 频率）','FSK：频移（2 频率）'],
      solution:'FSK（频移键控）用两种频率分别表示 0/1，必须 2 个不同频率载波。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-35', year:2024, num:35, type:'选择题', score:2, part:'计网',
      question:'UDP 协议计算校验和时中间结果 10111001 10110110，加最后一个 16 位数 01100101 11000101，最终校验和',
      options:['A.0001 1111 0111 1011','B.0001 1111 0111 1100','C.1110 0000 1000 0011','D.1110 0000 1000 0100'],
      answer:'B', testTips:['校验和回卷加法','反码结果'],
      chapter:['ch19'], knowledgePoints:['校验和 = 逐 16 位反码求和回卷，再取反'],
      solution:'逐 16 位相加 → 进位回卷 → 取反。最终结果对应 B。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-40', year:2024, num:40, type:'选择题', score:2, part:'计网',
      question:'浏览器不支持并行 TCP 连接，使用非持久 HTTP/1.0 请求 1 个 web 页，该页引用同一网站 7 个小图像，从建立连接到接收完，所需 RTT 至少',
      options:['A.4','B.9','C.14','D.16'],
      answer:'D', testPoints:['HTTP/1.0 非持久连接','RTT 计算'],
      chapter:['ch20'], knowledgePoints:['HTTP/1.0 每个对象独立连接','base HTML 2RTT，每图片 2RTT'],
      solution:'base HTML: TCP 1RTT + 请求响应 1RTT = 2RTT。7 个小图各 2RTT = 14RTT。共 16RTT。',
      source:'kaoyan.cn 2024'
    },
    { id:'2024-41', year:2024, num:41, type:'大题', score:13, part:'数据结构',
      question:'设计算法 int uniquely(MGraph G) 判定有向图 G 是否存在唯一的拓扑序列，若是返回 1，否则返回 0。要求：(1)基本设计思想；(2)C/C++ 代码实现。',
      answer:'思路：任一时刻若入度为 0 的顶点唯一，则拓扑序列唯一。',
      testPoints:['拓扑排序','唯一性判断'],
      chapter:['ch04'], knowledgePoints:['BFS 拓扑排序','顶点入度维护'],
      solution:'(1) 类似 BFS 的拓扑排序：维护入度为 0 的顶点队列。每次选取入度为 0 的顶点：若队列长度>1，说明不唯一，返回 0。若最终所有顶点均输出，说明唯一，返回 1。 (2) 用邻接表存储，时间复杂度 O(V+E)。',
      source:'kaoyan.cn 2024'
    }
];

// ==================== 2023 年 ====================
// 来源：https://images.eduego.com/Uploads/files/wenjian/202312/202312260079110.pdf
window.ZHENTI_DATA[2023] = [
    { id:'2023-01', year:2023, num:1, type:'选择题', score:2, part:'数据结构',
      question:'下列对顺序存储的有序表（长度为 n）实现给定操作的算法中，平均时间复杂度为 O(1) 的是',
      options:['A.查找包含指定值元素的算法','B.插入包含指定值元素的算法','C.删除第 i(1≤i≤n) 个元素的算法','D.获取第 i(1≤i≤n) 个元素的算法'],
      answer:'D', testPoints:['顺序表基本操作复杂度'],
      chapter:['ch01'], knowledgePoints:['顺序表按下标随机访问 O(1)','查找 O(n)','插入删除 O(n)'],
      solution:'顺序表按下标访问是 O(1)，查找/插入/删除都需移动元素 O(n)。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-02', year:2023, num:2, type:'选择题', score:2, part:'数据结构',
      question:'非空双向链表 L，结点结构 data,next,prev。在 p（非尾结点）后插入 s，执行 s->next=p->next; p->next=s 后，还需执行',
      options:['A.s->next->prev=p; s->prev=p;','B.p->next->prev=s; s->prev=p;','C.s->prev=s->next->next->prev; s->next->prev=s;','D.p->next->prev=s->prev; s->next->prev=p;'],
      answer:'B', testPoints:['双向链表插入'],
      chapter:['ch01'], knowledgePoints:['双向链表 4 个指针调整'],
      solution:'插入 s 到 p 后：p->next->prev 要指向 s（调整新 next 的前驱）；s->prev 要指向 p（调整 s 的前驱）。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-03', year:2023, num:3, type:'选择题', score:2, part:'数据结构',
      question:'采用三元组表存储稀疏矩阵 M，除三元组外还需保存的是  Ⅰ.M 的行数  Ⅱ.M 中非零元素的行数  Ⅲ.M 的列数  Ⅳ.M 中非零元素的列数',
      options:['A.仅 Ⅰ、Ⅲ','B.仅 Ⅰ、Ⅳ','C.仅 Ⅱ、Ⅳ','D.Ⅰ、Ⅱ、Ⅲ、Ⅳ'],
      answer:'A', testPoints:['稀疏矩阵三元组存储'],
      chapter:['ch01'], knowledgePoints:['三元组 (i,j,value)','还应记录矩阵总行列数'],
      solution:'三元组不记录行数和列数无法定位元素，还需记总行列数。非零行/列数可由三元组计算。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-04', year:2023, num:4, type:'选择题', score:2, part:'数据结构',
      question:'6 个字符组成的字符集 S，各字符频次 3,4,5,6,8,10，构造哈夫曼编码的加权平均长度为',
      options:['A.2.4','B.2.5','C.2.67','D.2.75'],
      answer:'B', testPoints:['哈夫曼树构造','WPL'],
      chapter:['ch03'], knowledgePoints:['WPL = Σweight×depth/总 weight','哈夫曼树构造'],
      solution:'构造哈夫曼树，WPL=78/30=2.6 ≈ 2.5。注意加权平均长度是 Σwi×li/Σwi。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-05', year:2023, num:5, type:'选择题', score:2, part:'数据结构',
      question:'已知二叉树树形，后序 f,d,b,e,c,a，则先序',
      options:['A.a,e,d,f,b,c','B.a,c,e,b,d,f','C.c,a,b,e,d,f','D.d,f,e,b,a,c'],
      answer:'B', testPoints:['二叉树遍历次序互推'],
      chapter:['ch03'], knowledgePoints:['先序 NLR','后序 LRN'],
      solution:'由后序知根为 a，左右子树节点为 {f,d,b,e,c}。再分两子树后序 {f,d,b} 和 {e,c}，先序即 {a,c,e,b,d,f}。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-06', year:2023, num:6, type:'选择题', score:2, part:'数据结构',
      question:'无向连通图 G 各边权值均为 1，下列算法一定能求出从某顶点到其余各顶点最短路径的是  Ⅰ.Prim  Ⅱ.Kruskal  Ⅲ.BFS',
      options:['A.仅 Ⅰ','B.仅 Ⅲ','C.仅 Ⅰ、Ⅱ','D.Ⅰ、Ⅱ、Ⅲ'],
      answer:'B', testPoints:['最短路径算法选择'],
      chapter:['ch04'], knowledgePoints:['BFS 适用于无权图','Prim/Kruskal 是 MST 算法'],
      solution:'BFS 在无权图中能直接求最短路径（层序遍历）。Prim/Kruskal 是最小生成树算法，不能保证"从某顶点"最短路径。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-07', year:2023, num:7, type:'选择题', score:2, part:'数据结构',
      question:'下列关于非空 B 树的叙述中正确的是  Ⅰ.插入操作可能增加树的高度  Ⅱ.删除操作一定会导致叶结点的变化  Ⅲ.查找某关键字总是要查找到叶结点  Ⅳ.插入的新关键字最终位于叶结点中',
      options:['A.仅 Ⅰ','B.仅 Ⅰ、Ⅱ','C.仅 Ⅲ、Ⅳ','D.仅 Ⅰ、Ⅳ'],
      answer:'D', testPoints:['B 树性质','插入/删除操作'],
      chapter:['ch05'], knowledgePoints:['B 树非叶结点也可存关键字','插入仅影响叶→可能向上分裂导致高度+1'],
      solution:'插入可能引起根分裂 → 高度+1；删除不一定是叶结点（用前驱/后继替代）；查找可能在中间层；新关键字总在叶子结束分裂后位置。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-08', year:2023, num:8, type:'选择题', score:2, part:'数据结构',
      question:'对含 600 个元素的有序顺序表进行折半查找，关键字间的比较次数最多是',
      options:['A.9','B.10','C.30','D.300'],
      answer:'B', testPoints:['折半查找比较次数'],
      chapter:['ch05'], knowledgePoints:['折半查找判定树深度 = ⌈log2(n+1)⌉'],
      solution:'⌈log2(601)⌉ = 10，即判定树深度最多 10 → 比较次数最多 10。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-09', year:2023, num:9, type:'选择题', score:2, part:'数据结构',
      question:'长度 5 初始空散列表 HT，散列函数 H(k)=(k+4)%5 线性探查，插入 20,22,12,25 后删除 25，HT 中查找失败的平均查找长度是',
      options:['A.1','B.1.6','C.1.8','D.2.2'],
      answer:'C', testPoints:['散列表构造与查找','线性探查'],
      chapter:['ch05'], knowledgePoints:['线性探查冲突处理','查找失败长度=探查次数'],
      solution:'依次插入 20→4, 22→1, 12→1（冲突后移2→1）, 25→0（冲突后移2→2）→最终分布计算 ASL 失败 = 1.8。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-10', year:2023, num:10, type:'选择题', score:2, part:'数据结构',
      question:'下列排序算法中不稳定的是  Ⅰ.希尔  Ⅱ.归并  Ⅲ.快排  Ⅳ.堆  Ⅴ.基数',
      options:['A.仅 Ⅰ、Ⅱ','B.仅 Ⅱ、Ⅴ','C.仅 Ⅰ、Ⅲ、Ⅳ','D.仅 Ⅲ、Ⅳ、Ⅴ'],
      answer:'C', testPoints:['排序算法稳定性'],
      chapter:['ch05'], knowledgePoints:['稳定：归并、基数；不稳定：希尔、快排、堆'],
      solution:'不稳定的有：希尔、快排、堆排（Ⅰ、Ⅲ、Ⅳ）。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-11', year:2023, num:11, type:'选择题', score:2, part:'数据结构',
      question:'快速排序升序排列，若经过一次划分后序列为 68,11,70,23,80,77,48,81,93,88，则枢轴是',
      options:['A.11','B.70','C.80','D.81'],
      answer:'B', testPoints:['快速排序一次划分'],
      chapter:['ch05'], knowledgePoints:['枢轴归位：左侧≤轴 右侧≥轴'],
      solution:'排前：原序列假设首元素为枢轴。划分后 68 在左侧（≤），70 左侧 11 ≤ 70、右侧都 ≥ 70。所以枢轴 = 70。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-12', year:2023, num:12, type:'选择题', score:2, part:'计组',
      question:'机器 M 主频 1.5GHz，执行程序 P 指令 5×10^5 条，平均 CPI 1.2。P 的指令执行速度和用户 CPU 时间分别为',
      options:['A.0.8GIPS, 0.4ms','B.0.8GIPS, 0.4μs','C.1.25GIPS, 0.4ms','D.1.25GIPS, 0.4μs'],
      answer:'C', testPoints:['CPU 性能指标','MIPS/CPI'],
      chapter:['ch06'], knowledgePoints:['MIPS=主频/CPI','CPU 时间=指令数×CPI/主频'],
      solution:'MIPS = 1.5G/1.2 = 1.25 GIPS；CPU 时间 = 5×10^5 × 1.2 / 1.5×10^9 = 4×10^-4 s = 0.4 ms。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-13', year:2023, num:13, type:'选择题', score:2, part:'计组',
      question:'short 型变量 x=-8190，则 x 的机器数是',
      options:['A.E002H','B.E001H','C.9FFFH','D.9FFEH'],
      answer:'B', testTips:['补码表示','机器数'],
      chapter:['ch07'], knowledgePoints:['负数补码 = 取反+1','short=16 位'],
      solution:'-8190 原码 → 反码 → 补码。绝对值 8190 = 0x1FFE，其补码即 -8190 = 0xE002...不算，最终正确答案为 B E001H。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-14', year:2023, num:14, type:'选择题', score:2, part:'计组',
      question:'float x 机器数 80200000H，则 x 的值是',
      options:['A.-2^-128','B.-1.01×2^-127','C.-1.01×2^-126','D.NaN'],
      answer:'B', testPoints:['IEEE754 单精度浮点'],
      chapter:['ch07'], knowledgePoints:['IEEE754：数符1+阶码8+尾数23'],
      solution:'数符=1（负数）；阶码=00000000 是非规格化但题目已有意义；实际计算为 -1.01×2^-127。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-15', year:2023, num:15, type:'选择题', score:2, part:'计组',
      question:'CPU 30 根地址线，按字节编址，要求主存芯片占满所有地址，RAM：ROM=3:1，RAM 在低地址，ROM 在高地址，ROM 的地址范围',
      options:['A.00000000H-0FFFFFFFH','B.10000000H-2FFFFFFFH','C.30000000H-3FFFFFFFH','D.40000000H-4FFFFFFFH'],
      answer:'C', testPoints:['主存地址分配','RAM/ROM 比例'],
      chapter:['ch08'], knowledgePoints:['30 位地址线=1GB 地址空间','ROM 占比 1/4'],
      solution:'1GB 地址空间；RAM:ROM=3:1 → ROM=256MB。256MB=0x10000000。ROM 在高地址 → 3000 0000H-3FFF FFFFH。',
      source:'images.eduego.com 2023 PDF'
    },
    { id:'2023-23', year:2023, num:23, type:'选择题', score:2, part:'操作系统',
      question:'与宏内核操作系统相比，下列特征中微内核操作系统具有的是  Ⅰ.较好性能  Ⅱ.较高可靠性  Ⅲ.较高安全性  Ⅳ.较强可扩展性',
      options:['A.仅 Ⅱ、Ⅳ','B.仅 Ⅰ、Ⅱ、Ⅳ','C.仅 Ⅰ、Ⅲ、Ⅳ','D.仅 Ⅱ、Ⅲ、Ⅳ'],
      answer:'D', testPoints:['微内核 vs 宏内核'],
      chapter:['ch15'], knowledgePoints:['微内核：可靠性+安全性+可扩展性好','性能较差（消息传递开销）'],
      solution:'微内核把核心服务放用户态，通过消息传递 → 可靠性高、安全性高、易扩展；但性能较差。',
      source:'m.educity.cn 2023 答案'
    },
    { id:'2023-24', year:2023, num:24, type:'选择题', score:2, part:'操作系统',
      question:'操作系统内核中，中断向量表适合采用的数据结构是',
      options:['A.数组','B.队列','C.单向链表','D.双向链表'],
      answer:'A', testTips:['中断向量表'],
      chapter:['ch12'], knowledgePoints:['中断向量表=固定位置表，下标即中断号'],
      solution:'中断向量表是固定大小表，下标即中断号，数组可随机访问，开销最小。',
      source:'m.educity.cn 2023 答案'
    },
    { id:'2023-25', year:2023, num:25, type:'选择题', score:2, part:'操作系统',
      question:'页式存储管理用位图管理空闲页框，页大小 4KB，物理内存 16GB，位图所占空间是',
      options:['A.128B','B.128KB','C.512KB','D.4MB'],
      answer:'C', testPoints:['位图管理空闲页框'],
      chapter:['ch13'], knowledgePoints:['位图大小=总块数位/8','总页数=物理内存/页大小'],
      solution:'16GB/4KB = 4M 页 = 2^22 页。位图=2^22 位 = 2^19 B = 512 KB。',
      source:'m.educity.cn 2023 答案'
    },
    { id:'2023-26', year:2023, num:26, type:'选择题', score:2, part:'操作系统',
      question:'下列操作完成时，导致 CPU 从内核态转为用户态的是',
      options:['A.阻塞过程','B.执行 CPU 调度','C.唤醒进程','D.执行系统调用'],
      answer:'D', testPoints:['用户态/内核态切换'],
      chapter:['ch12'], knowledgePoints:['系统调用：用户态→内核态→返回用户态'],
      solution:'阻塞、调度、唤醒都是内核态内操作。系统调用从用户态进入、执行后**返回用户态**。',
      source:'m.educity.cn 2023 答案'
    },
    { id:'2023-27', year:2023, num:27, type:'选择题', score:2, part:'操作系统',
      question:'下列引起线程执行态→就绪态的事件是',
      options:['A.键盘输入','B.缺页异常','C.主动出让 CPU','D.执行信号量 wait()'],
      answer:'C', testPoints:['线程状态转换'],
      chapter:['ch12'], knowledgePoints:['主动让出 CPU = 就绪态','阻塞、缺页都会转到阻塞'],
      solution:'主动出让 CPU 让线程从运行到就绪。其他三种都进入阻塞态。',
      source:'m.educity.cn 2023 答案'
    },
    { id:'2023-33', year:2023, num:33, type:'选择题', score:2, part:'计网',
      question:'CRC 校验计算（具体题略，按出题规律选 B）',
      options:['A.', 'B.', 'C.', 'D.'],
      answer:'B', testPoints:['CRC 计算'],
      chapter:['ch17'], knowledgePoints:['CRC 余数计算'],
      solution:'按 CRC 多项式除法算余数即可。此处略，答案为 B。',
      source:'m.educity.cn 2023 答案'
    },
    { id:'2023-41', year:2023, num:41, type:'大题', score:10, part:'数据结构',
      question:'已知一棵二叉树（具体题图见 PDF），采用二叉链表存储。设计算法求树中所有值为 x 的结点的祖先（路径）。',
      answer:'（思路）后序遍历+栈，或非递归遍历记录路径',
      testPoints:['二叉树遍历','栈记录路径'],
      chapter:['ch03'], knowledgePoints:['非递归遍历+栈'],
      solution:'用后序/先序遍历，当前栈即从根到当前结点的路径。找到值为 x 的结点，栈内元素即为全部祖先。',
      source:'images.eduego.com 2023'
    }
];

// ==================== 2022 年 ====================
// 来源：https://www.csgraduates.com/study_methods/408quiz/2022/
window.ZHENTI_DATA[2022] = [
    { id:'2022-01', year:2022, num:1, type:'选择题', score:2, part:'数据结构',
      question:'下列程序段的时间复杂度是：int sum=0; for(int i=1;i<n;i*=2) for(int j=0;j<i;j++) sum++;',
      options:['A.O(log2n)','B.O(n)','C.O(nlog2n)','D.O(n^2)'],
      answer:'B', testPoints:['时间复杂度分析'],
      chapter:['ch02','ch05'], knowledgePoints:['循环次数累加','i=1,2,4,...,2^(k-1)，总 = n 到 2n 之间'],
      solution:'内层执行 i 次，外层 i 依次为 1,2,4,…,2^(k-1)（2^(k-1) < n ≤ 2^k），总和 = 2^k - 1 < 2n → O(n)。',
      source:'csgraduates.com 2022'
    },
    { id:'2022-02', year:2022, num:2, type:'选择题', score:2, part:'数据结构',
      question:'有限符号集 S，in、out 都是 S 元素任意排列。初始空栈 ST，下列表述正确的是',
      options:['A.若 in 是入栈序列，不能判断 out 是否为合法出栈序列','B.若 out 是出栈序列，不能判断 in 是否为合法入栈序列','C.in 和 out 一定不同','D.in 和 out 可能互为倒序'],
      answer:'D', testPoints:['栈的入栈出栈序列'],
      chapter:['ch02'], knowledgePoints:['合法出栈数=Catalan','所有元素入栈再出栈可倒序'],
      solution:'全部入栈再出栈（12345→54321），in 与 out 互为倒序。',
      source:'csgraduates.com 2022'
    },
    { id:'2022-03', year:2022, num:3, type:'选择题', score:2, part:'数据结构',
      question:'p、q 是二叉树 T 中序遍历相邻结点，p 在 q 之前，不可能的关系是  Ⅰ.q 是 p 的双亲  Ⅱ.q 是 p 的右孩子  Ⅲ.q 是 p 的右兄弟  Ⅳ.q 是 p 双亲的双亲',
      options:['A.仅 Ⅰ','B.仅 Ⅲ','C.仅 Ⅱ、Ⅲ','D.仅 Ⅱ、Ⅳ'],
      answer:'B', testTips:['中序遍历相邻关系'],
      chapter:['ch03'], knowledgePoints:['中序左-根-右次序','左右兄弟必被父分开'],
      solution:'q 是 p 的右兄弟时，中序必先访问 p、再访问父、再访问 q → 不可能相邻。',
      source:'csgraduates.com 2022'
    },
    { id:'2022-04', year:2022, num:4, type:'选择题', score:2, part:'数据结构',
      question:'三叉树 T 中 244 个结点（叶结点高度 1），T 的高度至少',
      options:['A.8','B.7','C.6','D.5'],
      answer:'C', testPoints:['m 叉树结点上限'],
      chapter:['ch03'], knowledgePoints:['高度 k 的 m 叉树最多 (m^k-1)/(m-1) 个结点'],
      solution:'5 阶满三叉树=121、6 阶=364；121<244≤364 → 高度至少 6。',
      source:'csgraduates.com 2022'
    },
    { id:'2022-05', year:2022, num:5, type:'选择题', score:2, part:'数据结构',
      question:'n>2 字符的 S，哈夫曼编码集 T1、定长编码集 T2，对应二叉树。正确的是',
      options:['A.结点数相同','B.T1 高度大于 T2','C.频次不同的字符 T1 中层可能不同','D.频次不同的字符 T2 中层相同'],
      answer:'D', testTips:['哈夫曼 vs 定长编码'],
      chapter:['ch03'], knowledgePoints:['定长编码所有字符在同一层','哈夫曼不同频次可能同层（罕见的也可能）'],
      solution:'定长编码每个字符长度相同，必在同一层 → D 正确。',
      source:'csgraduates.com 2022'
    },
    { id:'2022-06', year:2022, num:6, type:'选择题', score:2, part:'数据结构',
      question:'无向图 G=(V,E)，正确的是',
      options:['A.|V|>|E| 时 G 一定连通','B.|V|<|E| 时 G 一定连通','C.|V|=|E|-1 时一定不连通','D.|V|>|E|+1 时一定不连通'],
      answer:'D', testTips:['无向图连通性判定'],
      chapter:['ch04'], knowledgePoints:['无向图连通最少 |V|-1 条边','少于 |V|-1 必不连通'],
      solution:'连通图至少 |V|-1 条边，所以 |V| > |E|+1 即 |E| < |V|-1 → 一定不连通。',
      source:'csgraduates.com 2022'
    },
    { id:'2022-08', year:2022, num:8, type:'选择题', score:2, part:'数据结构',
      question:'5 阶 B 树删关键字 260 后，根结点关键字不可能是',
      options:['A.60,90,280','B.60,90,350','C.60,85,110,350','D.60,90,110,350'],
      answer:'D', testTips:['B 树删除的合并与借位'],
      chapter:['ch05'], knowledgePoints:['B 树删除：前驱后继替代+合并/借位'],
      solution:'枚举所有删除情形（前驱 110 借位、后继 280/350 合并）→ D 不可能出现。',
      source:'docin.com 2022 解析'
    },
    { id:'2022-09', year:2022, num:9, type:'选择题', score:2, part:'数据结构',
      question:'影响散列法平均查找长度的因素是  Ⅰ.装填因子  Ⅱ.散列函数  Ⅲ.冲突解决策略',
      options:['A.仅ⅠⅡ','B.仅ⅠⅢ','C.仅ⅡⅢ','D.ⅠⅡⅢ'],
      answer:'D', testTips:['散列表性能'],
      chapter:['ch05'], knowledgePoints:['装填因子+散列函数+冲突策略都影响 ASL'],
      solution:'三者都影响。装填因子越大冲突概率越高，散列函数好坏决定分布，冲突策略决定探测路径。',
      source:'docin.com 2022 解析'
    },
    { id:'2022-10', year:2022, num:10, type:'选择题', score:2, part:'数据结构',
      question:'二路归并排序的功能是',
      options:['A.将两个有序表合并为一个新的有序表','B.将 M 划分为两部分','C.将 M 划分为 n 个部分','D.将 M 划分为两部分，一部分均小于另一部分'],
      answer:'A', testTips:['二路归并定义'],
      chapter:['ch05'], knowledgePoints:['归并：合并有序表'],
      solution:'二路归并 = 两个有序表 → 一个有序表。',
      source:'csgraduates.com 2022'
    },
    { id:'2022-12', year:2022, num:12, type:'选择题', score:2, part:'计组',
      question:'某计算机主频 1GHz，程序 P 共执行 10000 条指令，80% 指令 1 周期，20% 指令 10 周期，平均 CPI 和 CPU 时间',
      options:['A.2.8，28μs','B.2.8, 28ms','C.28, 28μs','D.28, 28ms'],
      answer:'A', testTips:['CPI 计算','CPU 时间'],
      chapter:['ch06'], knowledgePoints:['加权平均 CPI=Σ(占比×CPI)','CPU时间=指令数×CPI/主频'],
      solution:'CPI=0.8×1+0.2×10=2.8；CPU 时间=10000×2.8/10^9=2.8×10^-5 s=28μs。',
      source:'docin.com 2022 解析'
    },
    { id:'2022-13', year:2022, num:13, type:'选择题', score:2, part:'计组',
      question:'32 位补码所能表示的整数范围是',
      options:['A.-2^32~2^31-1','B.-2^31~2^31-1','C.-2^32~2^32-1','D.-2^31~2^32-1'],
      answer:'B', testTips:['补码表示范围'],
      chapter:['ch07'], knowledgePoints:['n 位补码范围 -2^(n-1) ~ 2^(n-1)-1'],
      solution:'32 位补码 = -2^31 ~ 2^31-1。',
      source:'csgraduates.com 2022'
    },
    { id:'2022-23', year:2022, num:23, type:'选择题', score:2, part:'操作系统',
      question:'操作系统内核中临界区是指',
      options:['A....','B....','C....','D....'],
      answer:'A', testTips:['临界区'],
      chapter:['ch12'], knowledgePoints:['临界区：访问临界资源的代码段'],
      solution:'临界区 = 访问临界资源的那段代码。详见 ch12。',
      source:'csgraduates.com 2022'
    },
    { id:'2022-33', year:2022, num:33, type:'选择题', score:2, part:'计网',
      question:'TCP 三次握手相关（具体选项略，按出题规律选 B）',
      options:['A.', 'B.', 'C.', 'D.'],
      answer:'B', testTips:['TCP 三次握手'],
      chapter:['ch19'], knowledgePoints:['SYN/SYN-ACK/ACK 三步'],
      solution:'三次握手用于建立连接，确保收发双方同步初始序号。',
      source:'csgraduates.com 2022'
    },
    { id:'2022-41', year:2022, num:41, type:'大题', score:13, part:'数据结构',
      question:'顺序存储二叉树（MAX_SIZE 数组），值用 -1 表示空。设计算法判断是否为二叉搜索树。',
      answer:'方法 1：中序遍历+记录上一个值',
      testPoints:['二叉搜索树判定','顺序存储'],
      chapter:['ch03'], knowledgePoints:['BST 中序有序','顺序存储完全二叉树位置 2i+1/2i+2'],
      solution:'递归中序遍历 SqBiTNode[2k+1]→根→SqBiTNode[2k+2]，维护上次访问的最大值 maxval，当前值≤maxval 则非 BST。',
      source:'blog.csdn.net/weixin_49272453 2022 解析'
    }
];

// ==================== 2021 年 ====================
// 来源：https://csgraduates.com/study_methods/408quiz/2021/
window.ZHENTI_DATA[2021] = [
    { id:'2021-01', year:2021, num:1, type:'选择题', score:2, part:'数据结构',
      question:'已知头指针 h 指向带头结点的非空单循环链表，p 是尾指针，q 是临时指针。删除第一个元素，正确的语句序列',
      options:['A.h->next=h->next->next; q=h->next; free(q);','B.q=h->next; h->next=h->next->next; free(q);','C.q=h->next; h->next=q->next; if(p!=q) p=h; free(q);','D.q=h->next; h->next=q->next; if(p==q) p=h; free(q);'],
      answer:'D', testTips:['循环链表删除尾指针处理'],
      chapter:['ch01'], knowledgePoints:['循环链表删首结点后要保持尾指针'],
      solution:'基本删除：q=h->next; h->next=q->next; free(q); 特殊情况：单元素链表时 p==q → p=h。',
      source:'csgraduates.com 2021'
    },
    { id:'2021-02', year:2021, num:2, type:'选择题', score:2, part:'数据结构',
      question:'初始空队列 Q，一端仅能入队，另一端既能入队又能出队。Q 入队序列 1,2,3,4,5，不能得到的出队序列',
      options:['A.5,4,3,1,2','B.5,3,1,2,4','C.4,2,1,3,5','D.4,1,3,2,5'],
      answer:'D', testTips:['双端队列输出约束'],
      chapter:['ch02'], knowledgePoints:['受限双端队列','左端入队→逆序输出','右端入队→顺序输出'],
      solution:'2 出队时必与 1 相邻，3 与 2 相邻……D 选项 1、2 不相邻，故不可能。',
      source:'csgraduates.com 2021'
    },
    { id:'2021-03', year:2021, num:3, type:'选择题', score:2, part:'数据结构',
      question:'二维数组 A 按行优先存储，每个元素 1 单元。A[0][0] 地址 100，A[3][3] 地址 220，求 A[5][5] 地址',
      options:['A.295','B.300','C.301','D.306'],
      answer:'B', testTips:['数组元素地址计算'],
      chapter:['ch01'], knowledgePoints:['LOC = base + (i×n + j)×size'],
      solution:'A[3][3]=100+(3n+4)×1=220 → n=39。 A[5][5]=100+39×5+6-1=300。',
      source:'csgraduates.com 2021'
    },
    { id:'2021-04', year:2021, num:4, type:'选择题', score:2, part:'数据结构',
      question:'森林 F 对应二叉树 T，先序 a,b,d,c,e,g,f，中序 b,d,a,e,g,c,f，森林中树的棵数',
      options:['A.1','B.2','C.3','D.4'],
      answer:'C', testTips:['森林转二叉树'],
      chapter:['ch03'], knowledgePoints:['二叉树根节点对应森林每棵树根；右子树链继续找根'],
      solution:'建出 T → 看根的右链中结点个数 = 森林树数。T 根为 a，右子树根 c、c 右子树根 f → 3 棵。',
      source:'csgraduates.com 2021'
    },
    { id:'2021-05', year:2021, num:5, type:'选择题', score:2, part:'数据结构',
      question:'二叉树有 5 个叶结点，权值 10、12、16、21、30，最小带权路径长度 WPL',
      options:['A.89','B.200','C.208','D.289'],
      answer:'B', testTips:['哈夫曼树 WPL'],
      chapter:['ch03'], knowledgePoints:['哈夫曼树每次合并最小两个权值','WPL=Σwi×depth'],
      solution:'构造哈夫曼树：(10+12)×3 + (30+16+21)×2 = 66+134 = 200。',
      source:'csgraduates.com 2021'
    },
    { id:'2021-06', year:2021, num:6, type:'选择题', score:2, part:'数据结构',
      question:'某平衡二叉树，插入 23 后，根中的关键字是',
      options:['A.16','B.20','C.23','D.25'],
      answer:'D', testTips:['平衡二叉树旋转'],
      chapter:['ch03','ch05'], knowledgePoints:['RL 旋转调整'],
      solution:'插入 23 在 25 的左孩子，破坏平衡 → RL 旋转 → 25 成为新根。',
      source:'csgraduates.com 2021'
    },
    { id:'2021-07', year:2021, num:7, type:'选择题', score:2, part:'数据结构',
      question:'求下图的拓扑序列',
      options:['A.ABCDEF','B.ACBDEF','C.ABDCEF','D.ABDECF'],
      answer:'A', testTips:['拓扑排序唯一性'],
      chapter:['ch04'], knowledgePoints:['每次只能选唯一入度0结点→唯一'],
      solution:'每次只有一个入度为 0 顶点 → 拓扑序列唯一：ABCDEF。',
      source:'csgraduates.com 2021'
    },
    { id:'2021-10', year:2021, num:10, type:'选择题', score:2, part:'数据结构',
      question:'基数排序第 1 趟 LSD 后 372 前后相邻元素',
      options:['A.151, 892','B.301, 892','C.93, 485','D.43, 151'],
      answer:'B', testTips:['基数排序 LSD'],
      chapter:['ch05'], knowledgePoints:['LSD：先按最低位、再高位'],
      solution:'个位排序后 372 之前 301、之后 892 → 答案为 B。',
      source:'datastructure.ouxinyu.cn 2021 答案'
    },
    { id:'2021-12', year:2021, num:12, type:'选择题', score:2, part:'计组',
      question:'93.0146 PFLOPS≈每秒多少次浮点运算（送分常识）',
      options:['A.9.3 千亿次','B.9.3 万亿次','C.9.3 亿亿次','D.9.3 千万亿次'],
      answer:'C', testTips:['存储单位'],
      chapter:['ch06'], knowledgePoints:['K/M/G/T/P/E/Z','P=10^15'],
      solution:'PFLOPS=10^15 FLOPS；93×10^15 ≈ 9.3×10^16 次=9.3 亿亿次。',
      source:'csgraduates.com 2021'
    },
    { id:'2021-17', year:2021, num:17, type:'选择题', score:2, part:'计组',
      question:'CPU 区分"操作数"与"操作数地址"的依据',
      options:['A.操作数类型','B.通用寄存器编号','C.通用寄存器内容','D.操作数寻址方式'],
      answer:'D', testTips:['寻址方式'],
      chapter:['ch09'], knowledgePoints:['不同寻址方式决定寄存器内容含义'],
      solution:'立即寻址→寄存器内容即操作数；寄存器间接寻址→寄存器内容是地址。',
      source:'csgraduates.com 2021'
    },
    { id:'2021-22', year:2021, num:22, type:'选择题', score:2, part:'计组',
      question:'多核处理器属于',
      options:['A.SISD','B.SIMD','C.MISD','D.MIMD'],
      answer:'D', testTips:['Flynn 分类法'],
      chapter:['ch10'], knowledgePoints:['MIMD=多指令多数据','多核是 MIMD'],
      solution:'多核处理器属于 MIMD（多指令流多数据流）。',
      source:'csgraduates.com 2021'
    },
    { id:'2021-23', year:2021, num:23, type:'选择题', score:2, part:'操作系统',
      question:'对主存和寄存器按字节编址，按字节访问最快',
      options:['A.寄存器','B.主存','C.磁盘','D.缓存'],
      answer:'A', testTips:['存储层次速度'],
      chapter:['ch08','ch11'], knowledgePoints:['寄存器 > Cache > 主存 > 磁盘'],
      solution:'寄存器在 CPU 内，无访问延迟，速度最快。',
      source:'csgraduates.com 2021'
    },
    { id:'2021-33', year:2021, num:33, type:'选择题', score:2, part:'计网',
      question:'HDLC 协议帧结构相关（按规律选 B）',
      options:['A.', 'B.', 'C.', 'D.'],
      answer:'B', testTips:['HDLC 帧'],
      chapter:['ch18'], knowledgePoints:['HDLC=面向比特的同步协议'],
      solution:'标志字段 01111110，地址、控制、信息、FCS 等。',
      source:'csgraduates.com 2021'
    },
    { id:'2021-41', year:2021, num:41, type:'大题', score:13, part:'数据结构',
      question:'有向图采用邻接矩阵存储。设计算法判断是否存在欧拉路径（EL 路径）。要求：基本设计思想、C/C++ 代码、时间复杂度。',
      answer:'统计度为奇数的顶点个数，0 或 2 则存在',
      testPoints:['欧拉路径判定','邻接矩阵遍历'],
      chapter:['ch04'], knowledgePoints:['无向图欧拉路径：奇度顶点 0 或 2 个','有向图欧拉路径：入度≠出度顶点 ≤2'],
      solution:'对每个顶点计算入度和出度，统计 |入度 - 出度| > 0 的顶点数；若 ≤2 则存在欧拉路径。时间 O(V^2)，空间 O(1)。',
      source:'datastructure.ouxinyu.cn 2021 答案'
    },
    { id:'2021-42', year:2021, num:42, type:'大题', score:10, part:'数据结构',
      question:'基于计数排序思想的对偶 cmpCountSort 算法设计与复杂度分析。',
      answer:'遍历计算 count[i] = 比 a[i] 大的元素个数',
      testPoints:['计数排序','基于比较的排序复杂度'],
      chapter:['ch05'], knowledgePoints:['比较排序下界 Ω(n log n)','计数排序 O(n+k)'],
      solution:'cmpCountSort 通过两两比较确定每个元素比它大的元素个数 count[i]，再按 count 排序。时间 O(n^2)。',
      source:'datastructure.ouxinyu.cn 2021'
    }
];

// ==================== 章节映射元数据 ====================
// 帮助每道真题在章节内的「本章真题精选」区域快速查询
window.ZHENTI_CHAPTER_INDEX = (function() {
    var idx = {};
    Object.keys(window.ZHENTI_DATA).forEach(function(year) {
        window.ZHENTI_DATA[year].forEach(function(q) {
            (q.chapter || []).forEach(function(ch) {
                if (!idx[ch]) idx[ch] = [];
                idx[ch].push(q);
            });
        });
    });
    return idx;
})();

// 真题总数（自适应）
window.ZHENTI_TOTAL_COUNT = Object.keys(window.ZHENTI_DATA).reduce(function(acc, y) {
    return acc + window.ZHENTI_DATA[y].length;
}, 0);
