# 🐄 百草博客 (Baicao Blog) — 完整搭建方案

## 一、项目概览

| 项目 | 内容 |
|------|------|
| 名称 | 百草博客 (Baicao Blog) |
| 域名 | mybaicao.com |
| 定位 | 私人社交博客，邀请制社区 |
| 风格 | 纯黑白 + 奶牛猫吉祥物 |
| 内容形式 | 朋友圈式动态（短文+九宫格图/视频），可选长文模式 |

## 二、技术栈

| 层 | 选型 | 理由 |
|---|------|------|
| 框架 | **Next.js 15**（App Router） | 稳定版，SSR + RSC |
| UI 组件 | **shadcn/ui** + **Tailwind CSS v4** | 完全可定制，RSC 友好 |
| 数据库 | **PostgreSQL** | 帖子、用户、评论的关系型存储 |
| ORM | **Prisma** | 类型安全，迁移管理方便 |
| 认证 | **Auth.js (NextAuth v5)** | 统一用户系统，Credentials Provider |
| 媒体存储 | **阿里云 OSS** | 图片/视频存储 + CDN |
| 包管理器 | **pnpm** | 快速，磁盘占用小 |
| 部署 | **Ubuntu + PM2 + Nginx** | 直接部署，Nginx 反向代理 |

## 三、数据模型

```
┌─────────────┐       ┌─────────────┐
│    User      │       │    Post      │
├─────────────┤       ├─────────────┤
│ id (PK)      │       │ id (PK)      │
│ username     │──┐    │ authorId (FK)│←─┐
│ password     │  │    │ content      │  │
│ avatar?      │  │    │ title?       │  │(只有 admin 能发)
│ role         │  │    │ isLongPost   │  │
│ createdAt    │  │    │ mediaType    │  │(image|video|none)
└─────────────┘  │    │ tags         │  │
                  │    │ createdAt    │  │
                  │    └─────────────┘  │
                  │           │         │
                  │    ┌──────┴──────┐  │
                  │    │   Media      │  │
                  │    ├─────────────┤  │
                  │    │ id (PK)      │  │
                  │    │ postId (FK)  │  │
                  │    │ url (OSS)    │  │
                  │    │ type         │  │
                  │    │ order        │  │
                  │    └─────────────┘  │
                  │                     │
                  │    ┌─────────────┐  │
                  ├───→│  Comment     │  │
                  │    ├─────────────┤  │
                  │    │ id (PK)      │  │
                  │    │ postId (FK)  │──┘
                  │    │ authorId(FK) │←─┘
                  │    │ content      │
                  │    │ createdAt    │
                  │    └─────────────┘
                  │
                  │    ┌─────────────┐
                  └───→│   Like       │
                       ├─────────────┤
                       │ userId (FK)  │
                       │ postId (FK)  │
                       │ createdAt    │
                       └─────────────┘
                       (userId+postId 联合唯一)
```

## 四、页面路由结构

```
app/
├── (public)/                   # 公开布局组（访客可见）
│   ├── layout.tsx              # 黑白主题公开布局 + 导航栏
│   ├── page.tsx                # 🏠 首页（奶牛猫封面 + 动态 feed）
│   ├── post/[id]/page.tsx      # 📄 动态详情页（评论区）
│   ├── login/page.tsx          # 🔐 登录页
│   └── register/page.tsx       # 📝 注册页（需邀请码）
│
├── (admin)/                    # 管理员布局组（需 admin 角色）
│   ├── layout.tsx              # 管理后台布局
│   ├── admin/page.tsx          # 📊 管理面板首页
│   ├── admin/create/page.tsx   # ✏️ 发布动态（文本框+上传）
│   └── admin/posts/page.tsx    # 📋 管理动态列表（编辑/删除）
│
├── api/                        # API Routes
│   ├── auth/[...nextauth]/     # Auth.js 认证端点
│   ├── posts/                  # 动态 CRUD
│   ├── comments/               # 评论 CRUD
│   ├── likes/                  # 点赞切换
│   └── upload/                 # OSS 上传签名
│
├── layout.tsx                  # 根布局（字体、全局样式）
└── globals.css                 # Tailwind + shadcn 主题变量
```

## 五、核心功能流程

### 5.1 首页 Feed

```
访客/成员 → 首页 → 看到奶牛猫封面背景
                   ↓ 向下滚动
              动态 feed（按时间倒序）
              每条：文字 + 九宫格图/视频 + 标签 + 点赞数 + 评论数
              ↓ 点击标签
              按标签筛选
              ↓ 无限滚动加载更多
```

### 5.2 发布动态（管理员）

```
管理员 → /admin/create
       → 输入文字内容
       → [可选] 开启长文模式 → 显示标题输入框
       → 选择上传图片(最多9张) 或 视频(最多1个)
       → 图片/视频上传到阿里云 OSS → 返回 URL
       → 选择标签（可多选）
       → 发布 → 写入数据库
```

### 5.3 注册流程

```
访客 → /register
     → 输入用户名 + 密码 + 邀请码(baicaofamily)
     → 校验邀请码 → 创建用户(role: member)
     → 自动登录 → 跳转首页
```

## 六、视觉设计规范

| 元素 | 规范 |
|------|------|
| 背景色 | 纯黑 `#000000` 或 纯白 `#FFFFFF` |
| 文字色 | 白底黑字 / 黑底白字 |
| 强调色 | 无彩色，仅用灰度层次区分 |
| 字体 | 中文无衬线体（思源黑体 / 系统默认） |
| 奶牛猫 | LOGO 出现在导航栏；404 页面；加载占位；页脚 |
| 首页封面 | 全屏奶牛猫背景图，上叠站名"百草"和简介 |
| 卡片 | 黑色卡片白色文字（或反过来），无圆角或微圆角 |
| 九宫格 | 等间距网格，图片方形裁切 |

## 七、服务器部署架构

```
                    ┌──────────────┐
  用户 ──→ DNS ──→  │   Nginx      │ :443 (SSL/HTTPS)
  mybaicao.com      │ 反向代理      │
                    └──────┬───────┘
                           │ proxy_pass :3000
                    ┌──────┴───────┐
                    │  Next.js App  │ :3000 (PM2 守护)
                    │  (standalone) │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────┴──┐  ┌──────┴──┐  ┌─────┴──────┐
       │PostgreSQL│  │ 阿里云   │  │ 阿里云 OSS  │
       │ :5432   │  │ DNS     │  │ 图片/视频   │
       └─────────┘  └─────────┘  └────────────┘
```

## 八、项目目录结构

```
baicao-blog-client/
├── CONTEXT.md                    # 领域术语表
├── docs/adr/                     # 架构决策记录
├── public/                       # 静态资源
│   ├── cow-cat-logo.svg          # 奶牛猫 LOGO
│   ├── cow-cat-hero.webp         # 首页封面背景
│   └── default-avatar.svg        # 默认用户头像
├── prisma/
│   └── schema.prisma             # 数据库 schema
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/             # 公开页面
│   │   ├── (admin)/              # 管理后台
│   │   ├── api/                  # API 路由
│   │   ├── layout.tsx            # 根布局
│   │   └── globals.css           # 全局样式
│   ├── components/               # 组件
│   │   ├── ui/                   # shadcn/ui 组件
│   │   ├── post-card.tsx         # 动态卡片
│   │   ├── media-grid.tsx        # 九宫格组件
│   │   ├── comment-list.tsx      # 评论列表
│   │   ├── post-editor.tsx       # 发布编辑器
│   │   └── navbar.tsx            # 导航栏（含奶牛猫LOGO）
│   ├── lib/
│   │   ├── db.ts                 # Prisma client
│   │   ├── auth.ts               # Auth.js 配置
│   │   ├── oss.ts                # 阿里云 OSS 工具
│   │   └── utils.ts              # 通用工具
│   └── types/
│       └── index.ts              # 类型定义
├── .env.local                    # 环境变量（数据库URL、OSS密钥等）
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

## 九、实施步骤

| 阶段 | 内容 | 预估 |
|------|------|------|
| **Phase 1** | 项目初始化：Next.js + shadcn/ui + Tailwind + Prisma + PostgreSQL | 1 天 |
| **Phase 2** | 用户系统：注册（邀请码）+ 登录 + 角色 + Auth.js | 1 天 |
| **Phase 3** | 动态发布：编辑器 + OSS 上传 + 九宫格展示 | 2 天 |
| **Phase 4** | 首页 Feed：动态列表 + 标签筛选 + 无限滚动 | 1 天 |
| **Phase 5** | 互动功能：点赞 + 评论 | 1 天 |
| **Phase 6** | 视觉打磨：黑白主题 + 奶牛猫素材集成 + 响应式 | 1 天 |
| **Phase 7** | 部署上线：服务器环境 + Nginx + PM2 + SSL | 1 天 |

## 十、架构决策记录 (ADR)

详见 `docs/adr/` 目录：

- **ADR-0001**: 选择 shadcn/ui 而非 HeroUI 作为 UI 组件库
- **ADR-0002**: 社交动态模型而非传统博客文章模型
- **ADR-0003**: 固定邀请码注册制而非开放注册
