# HNSF 在职考研备考系统

> 华南师范大学软件工程学硕在职备考一站式 H5 学习平台。

> 多机同步仓库：[https://github.com/leonlikehotdog/hnsf](https://github.com/leonlikehotdog/hnsf)

## 另一台电脑拉取方式

```bash
# 首次拉取（含 Windows / Mac / Linux 统一 LF 行尾，自动忽略 OS 垃圾）
git clone git@github.com:leonlikehotdog/hnsf.git
cd hnsf

# 之后每次同步只需
git pull
```

> 若另一台电脑未配 SSH key，请先在该电脑上 `ssh-keygen -t ed25519` 生成密钥，把
> `~/.ssh/id_ed25519.pub` 贴到 GitHub → Settings → SSH and GPG keys，再执行上面命令。

## 目录结构

```
hnsf/
├── 数学一/              # 数学一学习页（PC 端）
│   ├── index.html
│   └── chapters/        # 各章节详细内容
├── 408/                 # 408 专业课
│   └── index.html
└── 英语一/              # 英语一（PC + Mobile 两套）
    ├── index.html
    └── mobile/
        └── index.html
```

## 本地预览

```bash
python -m http.server 8000
```

- PC 端：http://localhost:8000/英语一/
- 移动端：http://localhost:8000/英语一/mobile/

## 数据库（Supabase）

执行 SQL：

1. `英语一/migration.sql` 建表并填充初始 30 个单词 + 5 个长难句
2. `英语一/seed.sql` 扩充 50 个高频词 + 5 个长难句
3. `英语一/fix_rls.sql` 关闭 RLS，允许匿名 Key 读写（个人学习用）

## 部署到 Vercel（24h 在线）

1. 在 Trae 对话框告诉 AI「部署到 Vercel」，AI 会调用 MCP 一键完成
2. 部署完成后拿到形如 `https://hnsf-xxx.vercel.app/英语一/mobile/` 的链接
3. 手机微信扫码即可访问，关电脑也能用

## 路线

- ✅ 数学一 + 408 框架
- ✅ 英语一单词卡片 + 长难句（PC + Mobile）
- ✅ Supabase 云端持久化
- ✅ Vercel 公网部署
- ⏳ 数学/408 章节内容按视频截图持续补充