# 03 — 发布动态 + 图片上传 + 首页 Feed

**What to build:** 管理员在 `/admin/create` 页面写一段文字，选择并上传最多 9 张图片，图片通过 presigned URL 直传阿里云 OSS，发布后动态出现在首页 feed 中。首页 feed 按时间倒序展示所有动态，每条显示文字内容、九宫格图片、发布时间。向下滚动触发无限加载（cursor-based 分页）。点击动态进入 `/post/[id]` 详情页查看完整内容和大图。这是博客的核心功能闭环：发布→展示→浏览。

**Blocked by:** #01 — 项目脚手架 + 数据库 + 主题外壳, #02 — 用户注册 & 登录

**Status:** ready-for-agent

- [ ] `/api/upload` Route Handler：接收文件类型和数量，生成阿里云 OSS presigned URL 返回给客户端
- [ ] `/api/posts` POST Route Handler：创建动态（content + media URLs），仅 admin 角色可调用，校验图片数量 ≤ 9
- [ ] `/api/posts` GET Route Handler：返回动态列表，支持 cursor-based 分页（基于 createdAt + id）
- [ ] `/admin/create` 页面：文本输入区 + 图片选择/上传组件（预览、删除、排序）+ 发布按钮
- [ ] 图片上传流程：客户端请求 presigned URL → 直传 OSS → 拿到最终 URL → 发布时提交 URLs
- [ ] 九宫格组件 `MediaGrid`：根据图片数量自适应布局（1张大图, 2张并排, 3张一行, 4张2×2, …9张3×3），图片方形裁切
- [ ] 首页 feed：动态卡片列表 + 无限滚动加载更多
- [ ] `/post/[id]` 详情页：完整文字 + 图片大图展示
- [ ] Tests：admin 创建动态 201、member 创建 403、超过 9 张图 400、动态列表分页正确
