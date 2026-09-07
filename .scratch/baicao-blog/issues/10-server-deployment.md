# 10 — 服务器部署上线

**What to build:** 百草博客通过 `https://mybaicao.com` 公网可访问。Ubuntu 服务器上运行 PostgreSQL 数据库、Next.js standalone 构建（由 PM2 守护进程管理），Nginx 作为反向代理处理 SSL 终止（Let's Encrypt 免费证书）。所有环境变量（数据库连接、OSS 密钥、邀请码、JWT secret）已配置。管理员种子账号已在生产数据库中创建。

**Blocked by:** #01–#09（全部功能 tickets 完成）

**Status:** ready-for-deploy（配置与文档已就绪，需在服务器上执行）

- [ ] Ubuntu 服务器安装 Node.js (LTS)、PostgreSQL、Nginx、PM2
- [x] MySQL 创建生产数据库和用户，配置连接（见 docs/DEPLOY.md）
- [x] Next.js 项目 `next.config.ts` 配置 `output: 'standalone'`
- [x] PM2 ecosystem 配置文件，守护 Next.js standalone server (:3000)
- [x] Nginx 配置：监听 443，SSL 证书（certbot / Let's Encrypt），反向代理到 :3000，静态资源缓存
- [ ] DNS：`mybaicao.com` A 记录指向服务器 IP
- [x] `.env.production.example` 配置所有环境变量
- [ ] 运行 Prisma 迁移 + 管理员种子脚本
- [ ] 端到端验收：公网访问首页、注册、登录、发帖、点赞、评论全流程通过
