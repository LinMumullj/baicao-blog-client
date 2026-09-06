# 06 — 点赞

**What to build:** 已登录成员在 feed 卡片或详情页点击点赞按钮，动态点赞数 +1，按钮变为"已赞"高亮状态；再次点击取消点赞，数量 -1，按钮恢复。每人每条动态只能点赞一次。未登录用户点击点赞按钮时提示跳转登录页。

**Blocked by:** #02 — 用户注册 & 登录, #03 — 发布动态 + 图片上传 + 首页 Feed

**Status:** ready-for-agent

- [ ] `/api/likes` POST Route Handler：toggle 逻辑——已赞则删除，未赞则创建。需要认证。
- [ ] Like 按钮组件：显示点赞数 + 当前用户是否已赞的状态
- [ ] Feed 卡片底部集成 Like 按钮
- [ ] 详情页集成 Like 按钮
- [ ] 未登录用户点击 Like 按钮 → 提示"请先登录"或跳转 `/login`
- [ ] `/api/posts` GET 返回每条动态的 likeCount 和当前用户的 isLiked 状态
- [ ] Tests：点赞 200、再次点赞取消 200、未登录 401、同一用户不能重复赞（unique constraint）
