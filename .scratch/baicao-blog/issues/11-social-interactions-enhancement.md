# 11 — 社交互动增强（动态卡片、点赞者、作者筛选、拖拽上传、Emoji）

**What to build:** 六项社交体验优化：动态卡片（Post Overlay）、点赞者可见、作者筛选与作者页、图片拖拽上传、Emoji 快捷输入、点赞动效。分批交付，每项独立 commit。

**Blocked by:** #03 — 发布动态 + 图片上传 + 首页 Feed, #05 — 标签筛选, #06 — 点赞, #07 — 评论

**Status:** ready-for-agent

## Problem Statement

成员和访客在浏览动态时，无法在不离开信息流的情况下查看完整动态、评论和点赞详情；点赞只显示数字，不知道谁赞过；首页只能按标签筛选，无法按作者浏览；上传图片只能点击选择文件；发帖和评论输入框没有 emoji 快捷入口；点赞交互缺乏视觉反馈。

## Solution

引入 Intercepting Routes 驱动的动态卡片（Post Overlay），在首页和作者页点击动态时以居中 Dialog 展示完整内容与互动区，URL 同步为 `/post/[id]`。新增点赞者列表 API 与 UI（头像堆叠 + 展开列表，全员可见）。扩展首页筛选为标签 + 作者 AND 叠加，并新增作者页。为所有图片上传入口添加拖拽。为发帖与评论添加轻量 emoji 面板。为点赞按钮添加轻量 CSS 动效。

## User Stories

1. As a 成员, I want to click a 动态 in the feed and see it in a Post Overlay, so that I can read, like, and comment without losing my scroll position on the homepage.
2. As a 访客, I want to open a 动态 via shared URL `/post/[id]`, so that I can read the full 动态 on a dedicated page.
3. As a 成员, I want the browser back button to close the Post Overlay, so that I return to where I was browsing.
4. As a 访客, I want to see who liked a 动态, so that I know which 成员 appreciated the content.
5. As a 成员, I want to see who liked a 动态, so that I can discover active community members.
6. As a 成员, I want to see a preview of recent 点赞者 avatars on the 动态 detail, so that I get a quick social signal before expanding the full list.
7. As a 成员, I want to click the like count to expand the full 点赞者 list, so that I can browse everyone who liked.
8. As a 成员, I want a subtle animation when I like a 动态, so that the action feels responsive and satisfying.
9. As a 成员, I want to filter the homepage feed by 作者, so that I can focus on one admin's 动态.
10. As a 成员, I want to combine 标签 and 作者 filters, so that I can find e.g. one admin's 技术 动态.
11. As a 成员, I want to click an 作者 name to visit their Author Feed, so that I can see all their 动态.
12. As a 成员, I want clicking 作者 inside a Post Overlay to close the overlay and navigate to the Author Feed, so that navigation feels natural.
13. As an 管理员, I want to drag and drop images when creating a 动态, so that uploading is faster than clicking file picker.
14. As a 成员, I want to drag and drop an image when changing my avatar, so that avatar upload is convenient.
15. As a 管理员, I want an emoji picker when writing a 动态, so that I can express tone without switching apps.
16. As a 成员, I want an emoji picker when writing a 评论, so that I can react expressively.
17. As a 成员, I want to open a 动态 from an Author Feed in a Post Overlay, so that the experience matches the homepage.
18. As a 访客, I want to browse 动态 on an Author Feed without logging in, so that I can explore content freely.

## Implementation Decisions

### Testing Seams

Primary seam: **HTTP API Route Handlers** — consistent with existing likes/posts/tags tests. One seam covers author filtering, likers list, and authors list contracts.

UI behavior (Overlay, drag-drop, emoji insertion, animations) validated via manual acceptance; no new component test harness.

### Delivery

Five independent commits in dependency order:

1. Post Overlay (Intercepting Routes + Dialog + shared PostDetailView)
2. 点赞者 list + like animation
3. 作者筛选 + Author Feed page
4. MediaDropZone drag upload
5. Emoji picker

### Post Overlay

- Root layout exposes `@modal` parallel slot; `@modal/default.tsx` returns null.
- Intercept route at same app level as `post/[id]` using `(.)post/[id]` convention; post detail route moved to top-level `post/[id]` for reliable intercept matching.
- Centered Dialog (`max-w-2xl`, scrollable content); direct URL access renders full page with back link (existing behavior preserved via shared PostDetailView).
- PostDetailView shared between full page and overlay; includes 作者, 正文, 九宫格, 标签, LikeButton, 评论 count, PostCommentsSection.
- PostCard keeps `<Link href="/post/{id}">` for SEO and soft navigation.

### 点赞者

- New `GET` endpoint on post likers sub-resource: paginated `{ likers: [{ id, username, avatar }], nextCursor }`; no auth required.
- LikeAvatarsPreview shows up to 5 avatars + overflow indicator; click opens full list panel.
- LikeButton gains CSS scale-bounce on like; unlike reverts color only.

### 作者筛选

- `GET /api/posts` accepts optional `author` (username) query param; AND-combined with existing `tag` param.
- New `GET /api/authors` returns admins who have at least one post: `{ username, avatar, postCount }`.
- AuthorFilter UI mirrors TagFilter pattern (badge/dropdown selection).
- Author Feed at `/user/[username]` with PostFeed filtered by author; intercepting overlay works from this page too.
- 作者 links on PostCard and PostDetailView navigate to `/user/[username]`.

### Upload

- Shared MediaDropZone component with dragenter/dragleave/drop handling and dashed border feedback.
- Applied to create-post media area and avatar upload area; existing click-to-select preserved.

### Emoji

- Built-in grid of ~40 common Unicode emoji; zero new dependencies.
- Trigger button adjacent to Textarea in create-post and comment forms; inserts at cursor position.

### Schema

No schema changes required; existing Like, Post, User models sufficient.

## Testing Decisions

- **GET likers endpoint:** test 200 with likers array, pagination cursor, empty list, 404 for missing post. Prior art: `likes/route.test.ts`.
- **GET posts with author param:** test author filter, tag+author AND combination. Prior art: `posts/route.test.ts`.
- Tests assert external HTTP contract (status, JSON shape) not internal module calls beyond existing mock patterns.
- UI commits (overlay, dropzone, emoji, animation): no automated tests per scope decision.

## Out of Scope

- HEIC/iOS format conversion
- Edit-post media upload
- Rich text / Markdown
- Like notifications
- Video drag-drop (image upload places only)
- New npm dependencies for emoji or animation

## Further Notes

- Domain glossary updated in CONTEXT.md: 点赞者, 动态卡片, 作者页, 作者筛选, Emoji 快捷输入.
- Grilling session decisions (2026-09-09) are authoritative for ambiguous UX choices.
