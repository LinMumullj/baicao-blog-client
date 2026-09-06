# 05 — 标签 & 筛选

**What to build:** 管理员发布动态时可以选择一个或多个标签（从已有标签中选或创建新标签）。动态在 feed 卡片和详情页中展示所属标签。首页增加标签筛选功能：用户点击某个标签（或通过 URL 参数 `?tag=日常`），feed 只显示带有该标签的动态，同时保持无限滚动和时间排序。

**Blocked by:** #03 — 发布动态 + 图片上传 + 首页 Feed

**Status:** ready-for-agent

- [ ] 发帖页面增加标签选择组件：可从已有标签列表中多选，也可输入创建新标签
- [ ] `/api/posts` POST 支持 tags 字段，创建时关联 Tag 和 PostTag 记录
- [ ] `/api/tags` GET Route Handler：返回所有已有标签列表
- [ ] Feed 卡片展示标签（黑白 badge 样式），标签可点击触发筛选
- [ ] 首页增加标签筛选栏（显示热门标签），选中后 feed 过滤为匹配动态
- [ ] `/api/posts` GET 支持 `tag` query parameter 过滤
- [ ] 详情页展示动态标签
- [ ] Tests：带标签创建动态、按标签筛选返回正确结果、无标签筛选返回全部
