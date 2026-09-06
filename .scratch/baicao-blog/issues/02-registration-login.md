# 02 — 用户注册 & 登录

**What to build:** 访客在 `/register` 页面输入用户名、密码和邀请码，提交后校验邀请码是否为 `baicaofamily`（从环境变量读取），正确则创建 MEMBER 角色用户并自动登录跳转首页；错误则提示"邀请码无效"。成员在 `/login` 页面用用户名+密码登录，登录后 navbar 显示用户名和登出按钮。未登录访客访问 `/admin/*` 被 middleware 重定向到登录页；已登录但非 admin 角色的成员访问 `/admin/*` 被重定向到首页。

**Blocked by:** #01 — 项目脚手架 + 数据库 + 主题外壳

**Status:** ready-for-agent

- [ ] Auth.js (NextAuth v5) 安装并配置 Credentials Provider，密码用 bcrypt 哈希，session 策略为 JWT
- [ ] `/api/auth/[...nextauth]` Route Handler 就绪
- [ ] `/api/auth/register` Route Handler：校验邀请码、检查用户名唯一性、创建 MEMBER 用户
- [ ] `/register` 页面：用户名、密码、邀请码三个输入框 + 提交按钮，错误提示，成功后自动登录跳转
- [ ] `/login` 页面：用户名、密码输入框 + 提交按钮，错误提示，成功后跳转首页
- [ ] Navbar 根据登录状态显示：未登录→"登录/注册"链接；已登录→用户名+登出按钮
- [ ] Middleware 保护 `/admin/*` 路由：未登录重定向 `/login`，非 admin 重定向 `/`
- [ ] Tests：正确邀请码注册 201、错误邀请码 403、重复用户名 409、登录成功、admin 路由保护
