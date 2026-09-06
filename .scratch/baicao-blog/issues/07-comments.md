# 07 — 评论

**What to build:** 已登录成员在 `/post/[id]` 详情页底部的评论框中输入文字并提交评论。评论列表在详情页按时间正序（最早在上）平铺展示，每条显示评论者用户名、内容和时间。Feed 卡片底部显示每条动态的评论数。未登录用户看到评论列表但评论框提示"登录后评论"。

**Blocked by:** #02 — 用户注册 & 登录, #03 — 发布动态 + 图片上传 + 首页 Feed

**Status:** ready-for-agent

- [ ] `/api/comments` POST Route Handler：创建评论，关联 postId 和 authorId，需要认证
- [ ] `/api/comments?postId=xxx` GET Route Handler：返回指定动态的评论列表，按 createdAt 正序
- [ ] 详情页底部评论区：评论列表 + 评论输入框 + 提交按钮
- [ ] 每条评论展示：用户名 + 内容 + 时间
- [ ] 未登录用户：评论框替换为"登录后评论"提示 + 登录链接
- [ ] Feed 卡片底部显示评论数（commentCount）
- [ ] `/api/posts` GET 返回每条动态的 commentCount
- [ ] Tests：发评论 201、未登录 401、评论列表按时间正序、评论数正确
