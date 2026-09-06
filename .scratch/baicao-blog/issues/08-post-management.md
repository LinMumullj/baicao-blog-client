# 08 — 动态管理（编辑/删除）

**What to build:** 管理员在 `/admin/posts` 看到所有已发布动态的管理列表（标题/内容摘要、发布时间、标签、点赞数、评论数）。可以点击编辑进入编辑页，修改动态的文字内容、标题和标签。可以删除动态，删除时级联清除其关联的媒体记录、所有评论和所有点赞。仅 admin 角色可访问。

**Blocked by:** #03 — 发布动态 + 图片上传 + 首页 Feed, #05 — 标签 & 筛选

**Status:** ready-for-agent

- [ ] `/admin/posts` 页面：动态管理列表，显示摘要、时间、标签、互动数据，每行有"编辑"和"删除"操作
- [ ] `/admin/posts/[id]/edit` 页面：编辑表单，预填现有内容、标题、标签，可修改后保存
- [ ] `/api/posts/[id]` PUT Route Handler：更新动态的 content、title、tags，仅 admin
- [ ] `/api/posts/[id]` DELETE Route Handler：删除动态 + 级联删除 Media、Comment、Like 记录，仅 admin
- [ ] 删除前确认弹窗（"确定删除这条动态？关联的评论和点赞将一并删除"）
- [ ] Tests：编辑动态 200、删除动态级联清除 200、非 admin 编辑/删除 403
