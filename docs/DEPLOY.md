# 百草博客 — 部署流程

本文档描述将 `baicao-blog-client` 部署到 Ubuntu 服务器（阿里云 ECS）的完整流程。

**推荐架构**：本地/WSL 构建 → 上传 `.next` → 服务器安装依赖 → PM2 启动 → Nginx 反向代理。

> **不要在 2G 内存的服务器上执行 `pnpm build`**，容易因 OOM 被系统 kill（`SIGKILL`）。

---

## 目录

1. [架构概览](#1-架构概览)
2. [服务器一次性准备](#2-服务器一次性准备)
3. [配置 GitHub SSH](#3-配置-github-ssh)
4. [首次部署](#4-首次部署)
5. [本地构建与上传](#5-本地构建与上传)
6. [PM2 启动](#6-pm2-启动)
7. [Nginx + SSL](#7-nginx--ssl)
8. [验收清单](#8-验收清单)
9. [日常更新流程](#9-日常更新流程)
10. [常见问题](#10-常见问题)

---

## 1. 架构概览

```
┌─────────────┐    scp/rsync     ┌──────────────────────────────┐
│ Windows/WSL │  ──────────────► │ 阿里云 ECS (Ubuntu)           │
│ pnpm build  │   上传 .next     │ /var/www/baicao-blog-client  │
└─────────────┘                  │  pnpm install → pm2 start     │
                                 │  Nginx :443 → :3000          │
                                 │  MySQL (本地)                 │
                                 └──────────────────────────────┘
                                           │
                                           ▼
                                    阿里云 OSS (图片/视频)
```

| 组件 | 作用 |
|------|------|
| **Next.js** | 博客应用，监听 3000 端口 |
| **PM2** | 进程守护，开机自启 |
| **MySQL** | 用户、帖子、评论等数据 |
| **Nginx** | HTTPS、反向代理、静态资源缓存 |
| **OSS** | 媒体文件上传 |

---

## 2. 服务器一次性准备

### 2.1 安装基础软件

```bash
# Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# MySQL、Nginx
sudo apt install -y mysql-server nginx

# PM2、pnpm
sudo npm install -g pm2
corepack enable && corepack prepare pnpm@latest --activate
```

### 2.2 阿里云安全组

入方向放行：

| 端口 | 用途 |
|------|------|
| 22 | SSH / scp |
| 80 | HTTP（certbot 用） |
| 443 | HTTPS |

### 2.3 创建 MySQL 数据库

```bash
sudo mysql -e "CREATE DATABASE baicao_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'baicao'@'localhost' IDENTIFIED BY '你的密码';"
sudo mysql -e "GRANT ALL ON baicao_blog.* TO 'baicao'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

### 2.4 克隆项目

```bash
sudo mkdir -p /var/www
cd /var/www
git clone git@github.com:LinMumullj/baicao-blog-client.git
cd baicao-blog-client
```

---

## 3. 配置 GitHub SSH

在服务器上生成 SSH key 并添加到 GitHub（Settings → SSH keys）：

```bash
ssh-keygen -t ed25519 -C "你的邮箱@example.com"
# 一路 Enter（默认保存在 /root/.ssh/id_ed25519）

cat ~/.ssh/id_ed25519.pub
# 复制公钥到 GitHub

ssh -T git@github.com
# 看到 Hi xxx! 即成功
```

---

## 4. 首次部署

### 4.1 配置环境变量

```bash
cd /var/www/baicao-blog-client
cp .env.production.example .env.production
nano .env.production
```

必填项：

```env
DATABASE_URL="mysql://baicao:你的MySQL密码@localhost:3306/baicao_blog"
NEXTAUTH_SECRET="随机长字符串"          # openssl rand -base64 32
NEXTAUTH_URL="https://mybaicao.com"    # 改成你的域名
INVITE_CODE="baicaofamily"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="强密码"

OSS_REGION="oss-cn-shenzhen"
OSS_ACCESS_KEY_ID="你的Key"
OSS_ACCESS_KEY_SECRET="你的Secret"
OSS_BUCKET="mybaicao"
OSS_ENDPOINT=""
```

Prisma CLI 读取 `.env`，需额外复制一份：

```bash
cp .env.production .env
```

### 4.2 初始化数据库

```bash
cd /var/www/baicao-blog-client
pnpm install
pnpm db:push    # 创建表结构
pnpm db:seed    # 创建管理员账号
```

> 若 `pnpm install` 报 `ERR_PNPM_IGNORED_BUILDS`，确认项目根目录存在 `pnpm-workspace.yaml` 且含 `allowBuilds` 配置。

---

## 5. 本地构建与上传

**服务器不在本地**，在 **Windows** 或 **WSL** 构建，再上传到服务器。

### 5.1 Windows 本地构建

```powershell
cd E:\project\baicao-blog-client

# 若报 EPERM，先停掉 dev 并删 .next
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

pnpm build
```

### 5.2 WSL 构建（推荐，与 Linux 服务器更一致）

```bash
# 同步源码到 WSL 原生目录（不要在 /mnt/e 里 install/build）
rsync -a --delete \
  --exclude node_modules \
  --exclude .next \
  /mnt/e/project/baicao-blog-client/ \
  ~/baicao-blog-client/

cd ~/baicao-blog-client
pnpm install
pnpm build
```

> WSL 内存默认来自 Windows 物理内存，build 比 2G 服务器快且不易 OOM。

### 5.3 上传到服务器

在 WSL 或 PowerShell 中：

```bash
# WSL 示例（把 IP 换成你的服务器公网 IP）
scp -r ~/baicao-blog-client/.next root@你的服务器IP:/var/www/baicao-blog-client/
scp -r ~/baicao-blog-client/public root@你的服务器IP:/var/www/baicao-blog-client/
scp ~/baicao-blog-client/package.json \
    ~/baicao-blog-client/pnpm-lock.yaml \
    ~/baicao-blog-client/pnpm-workspace.yaml \
    ~/baicao-blog-client/ecosystem.config.cjs \
    root@你的服务器IP:/var/www/baicao-blog-client/
scp -r ~/baicao-blog-client/prisma root@你的服务器IP:/var/www/baicao-blog-client/
```

Windows PowerShell 示例：

```powershell
scp -r E:\project\baicao-blog-client\.next root@你的服务器IP:/var/www/baicao-blog-client/
scp -r E:\project\baicao-blog-client\public root@你的服务器IP:/var/www/baicao-blog-client/
```

---

## 6. PM2 启动

### 6.1 服务器安装依赖

```bash
cd /var/www/baicao-blog-client
pnpm install
cp .env.production .env

# 确认 build 产物存在
ls .next/BUILD_ID
```

### 6.2 启动应用

项目使用 `npm run start`（即 `next start`），**不使用 standalone**，避免 pnpm 下缺包问题。

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup    # 按提示执行输出的 sudo 命令，设置开机自启
```

### 6.3 验证

```bash
pm2 status
curl -I http://127.0.0.1:3000
pm2 logs baicao-blog --lines 20
```

`pm2 status` 应为 **online**，`curl` 返回 `200` 或 `307`。

---

## 7. Nginx + SSL

### 7.1 DNS

将 `mybaicao.com` 的 **A 记录** 指向服务器公网 IP。

### 7.2 配置 Nginx

```bash
cd /var/www/baicao-blog-client

# 若域名不是 mybaicao.com，先编辑 deploy/nginx.baicao.conf.example
sudo cp deploy/nginx.baicao.conf.example /etc/nginx/sites-available/baicao
sudo ln -sf /etc/nginx/sites-available/baicao /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d mybaicao.com

sudo nginx -t && sudo systemctl reload nginx
```

---

## 8. 验收清单

- [ ] `https://mybaicao.com` 可访问
- [ ] 未登录时跳转登录页
- [ ] 管理员账号可登录（`ADMIN_USERNAME` / `ADMIN_PASSWORD`）
- [ ] 邀请码注册正常
- [ ] 发帖、点赞、评论正常
- [ ] 图片/视频上传正常（OSS 配置正确）
- [ ] 服务器重启后应用自动恢复（`pm2 startup` 已配置）

---

## 9. 日常更新流程

### 本地（Windows 或 WSL）

```bash
# 1. 改代码后 build
pnpm build

# 2. 上传（WSL 示例）
scp -r .next root@服务器IP:/var/www/baicao-blog-client/
scp -r public root@服务器IP:/var/www/baicao-blog-client/
```

若 `package.json` / `prisma/schema.prisma` 有变更，同步并上传：

```bash
scp package.json pnpm-lock.yaml pnpm-workspace.yaml root@服务器IP:/var/www/baicao-blog-client/
scp -r prisma root@服务器IP:/var/www/baicao-blog-client/
```

### 服务器

```bash
cd /var/www/baicao-blog-client

# 依赖或 schema 有变时
pnpm install
pnpm db:push

# 重启
pm2 restart baicao-blog
```

---

## 10. 常见问题

### build 在服务器上失败（SIGKILL）

**原因**：2G 内存不足，OOM Killer 杀掉进程。  
**解决**：在 Windows/WSL 本地 build，上传 `.next` 到服务器。

### scp 连接超时

**原因**：阿里云安全组未放行 22 端口。  
**解决**：安全组入方向添加 TCP 22。

### `pnpm install` 报 ERR_PNPM_IGNORED_BUILDS

**原因**：pnpm 12 默认阻止未批准的安装脚本。  
**解决**：确认 `pnpm-workspace.yaml` 中有 `allowBuilds`，或执行 `pnpm approve-builds`。

### `pnpm db:push` 报 DATABASE_URL not found

**原因**：Prisma CLI 只读 `.env`，不读 `.env.production`。  
**解决**：`cp .env.production .env`

### PM2 状态 errored（styled-jsx 等 MODULE_NOT_FOUND）

**原因**：standalone + pnpm + scp 容易缺依赖。  
**解决**：改用 `npm run start`（当前 `ecosystem.config.cjs` 默认方案），在服务器执行 `pnpm install`。

### Windows 本地 build 报 EPERM (.next/trace)

**原因**：`.next` 被 dev 进程或杀毒软件占用。  
**解决**：

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .next
pnpm build
```

### WSL 里 pnpm install 报 I/O error

**原因**：在 `/mnt/e/`（Windows 磁盘）上安装依赖。  
**解决**：复制到 `~/baicao-blog-client` 再 install/build。

### 登录后跳回登录页

**原因**：`NEXTAUTH_URL` 与访问域名不一致。  
**解决**：确保 `.env.production` 中 `NEXTAUTH_URL=https://你的域名`（含 `https://`）。

### 502 Bad Gateway

```bash
pm2 logs baicao-blog --lines 30
curl -I http://127.0.0.1:3000
```

确认 PM2 为 online、3000 端口有响应，再检查 Nginx 配置。

---

## 附录：目录与职责

| 路径 | 用途 |
|------|------|
| `E:\project\baicao-blog-client` | Windows 日常开发与 build |
| `~/baicao-blog-client`（WSL） | Linux 环境 build（推荐） |
| `/var/www/baicao-blog-client` | 服务器运行目录 |
| `.env.production` | 生产环境变量（不提交 Git） |
| `.env` | Prisma CLI 与运行时读取（服务器上从 `.env.production` 复制） |

---

## 附录：磁盘参考

| 场景 | 大约占用 |
|------|----------|
| 服务器 `pnpm install`（不 build） | ~1–2 GB |
| 服务器 `pnpm build` | 峰值 4GB+，2G 机器不推荐 |
| 上传 `.next` + `public` | ~200–400 MB |
