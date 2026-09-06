# 01 — 项目脚手架 + 数据库 + 主题外壳

**What to build:** 一个可运行的空 Next.js 15 应用。访问首页能看到黑色背景 + 空 feed 占位状态 + 带奶牛猫占位图的 navbar + footer。shadcn/ui 组件库已配置且遵循纯黑白主题。Prisma 连接 PostgreSQL，完整 schema 已迁移（User、Post、Media、Comment、Like、Tag、PostTag），管理员种子账号已写入数据库。整个技术栈从框架到数据库到样式全部就绪，后续 tickets 可以直接在此基础上开发功能。

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Next.js 15 (App Router) + TypeScript 项目初始化，pnpm 作为包管理器
- [ ] Tailwind CSS v4 + shadcn/ui 安装并配置纯黑白主题变量（背景 #000/#FFF，文字反色，无彩色 hue）
- [ ] Prisma 安装，schema 定义全部 models（User with role enum, Post with mediaType enum, Media, Comment, Like, Tag, PostTag），运行初始迁移
- [ ] 管理员种子脚本：创建一个 admin 用户（用户名和密码从环境变量读取）
- [ ] 根布局 `layout.tsx`：全局字体、黑色背景、navbar（含奶牛猫占位 logo + 站名"百草"）、footer
- [ ] 首页 `page.tsx`：显示空 feed 占位状态（"还没有动态"）
- [ ] `.env.local.example` 模板：DATABASE_URL、NEXTAUTH_SECRET、INVITE_CODE、ADMIN_USERNAME、ADMIN_PASSWORD、OSS 相关变量
