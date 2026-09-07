# 百草博客 — Ubuntu 部署步骤

## 1. 服务器环境

```bash
# Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# MySQL、Nginx、PM2
sudo apt install -y mysql-server nginx
sudo npm install -g pm2
```

## 2. 数据库

```bash
sudo mysql -e "CREATE DATABASE baicao_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'baicao'@'localhost' IDENTIFIED BY '你的密码';"
sudo mysql -e "GRANT ALL ON baicao_blog.* TO 'baicao'@'localhost';"
```

## 3. 部署项目

```bash
cd /var/www
git clone git@github.com:LinMumullj/baicao-blog-client.git
cd baicao-blog-client
cp .env.production.example .env.production
# 编辑 .env.production 填入真实配置

pnpm install
pnpm db:push
pnpm db:seed
pnpm build

# 复制静态资源到 standalone
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

pm2 start ecosystem.config.cjs
pm2 save
```

## 4. Nginx + SSL

```bash
sudo cp deploy/nginx.baicao.conf.example /etc/nginx/sites-available/baicao
sudo ln -s /etc/nginx/sites-available/baicao /etc/nginx/sites-enabled/
sudo certbot --nginx -d mybaicao.com
sudo nginx -t && sudo systemctl reload nginx
```

## 5. DNS

将 `mybaicao.com` A 记录指向服务器公网 IP。

## 6. 验收

- 访问 https://mybaicao.com
- 注册、登录、发帖、点赞、评论全流程
