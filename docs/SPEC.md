# 百草博客 — 全栈社交博客平台 Spec

## Problem Statement

用户想要一个私人社交博客平台，能像发朋友圈一样轻松发布带图片/视频的动态，偶尔写长文。受邀好友可以注册、浏览、点赞和评论。当前没有任何现成平台能同时满足：朋友圈式的轻量发布体验 + 个人品牌化的黑白奶牛猫视觉风格 + 邀请制私密社区。

## Solution

构建一个基于 Next.js 15 的全栈社交博客，单项目包含前端和后端。管理员通过后台发布"动态"（短文+九宫格图片或单个视频），可选开启长文模式。成员通过固定邀请码注册，获得点赞和评论权限。访客可浏览但不可互动。全站纯黑白配色，奶牛猫作为品牌吉祥物贯穿导航栏、404 页、页脚等处。

## User Stories

### 访客（Visitor）

1. As a visitor, I want to see a full-screen cow cat hero image on the homepage, so that I immediately sense the blog's brand identity.
2. As a visitor, I want to browse the post feed in reverse chronological order without logging in, so that I can discover content before deciding to register.
3. As a visitor, I want to see each post's text, media grid, tags, like count, and comment count in the feed, so that I can quickly scan what's interesting.
4. As a visitor, I want to click into a post detail page to read the full content and comments, so that I can engage deeper with interesting posts.
5. As a visitor, I want to filter posts by tag, so that I can find content in a specific category.
6. As a visitor, I want to scroll infinitely through the feed, so that I don't have to click pagination buttons.
7. As a visitor, I want to be prompted to log in when I try to like or comment, so that I understand registration is needed for interaction.
8. As a visitor, I want to register with a username, password, and invite code (`baicaofamily`), so that I can join the community.
9. As a visitor, I want to be rejected if I enter the wrong invite code, so that only invited people can register.
10. As a visitor, I want the cow cat logo in the navbar to link to the homepage, so that I can always navigate back.

### 成员（Member）

11. As a member, I want to log in with my username and password, so that I can access interactive features.
12. As a member, I want to like a post (toggle), so that I can show appreciation or retract it.
13. As a member, I want to see whether I've already liked a post, so that I know my current state.
14. As a member, I want to comment on a post with text, so that I can engage in discussion.
15. As a member, I want to see all comments on a post in chronological order, so that I can follow the conversation.
16. As a member, I want to upload an avatar, so that my identity is visually recognizable in comments.
17. As a member, I want to log out, so that I can end my session on shared devices.

### 管理员（Admin）

18. As an admin, I want to create a short post with text (up to a few paragraphs), so that I can share a quick thought.
19. As an admin, I want to attach up to 9 images to a post, so that I can share photos in a grid layout.
20. As an admin, I want to attach 1 video to a post instead of images (mutually exclusive), so that I can share video content.
21. As an admin, I want images and videos to upload to Alibaba Cloud OSS, so that media is stored reliably and served via CDN.
22. As an admin, I want to enable "long post mode" which adds a title field, so that I can write longer content when needed.
23. As an admin, I want to add one or more tags to a post, so that content is organized.
24. As an admin, I want to see a management dashboard listing all my posts, so that I can overview my content.
25. As an admin, I want to edit an existing post's text, title, and tags, so that I can fix mistakes.
26. As an admin, I want to delete a post (and its associated media, comments, likes), so that I can remove unwanted content.
27. As an admin, I want the admin panel to be accessible only to users with the admin role, so that regular members cannot access it.

### 视觉与品牌

28. As any user, I want the entire site to use a pure black and white color scheme, so that the visual identity is consistent and striking.
29. As any user, I want to see the cow cat mascot in the navbar, 404 page, loading placeholders, and footer, so that the brand is present throughout the experience.
30. As any user, I want the site to be responsive on mobile devices, so that I can use it on my phone.

## Implementation Decisions

### Framework & Architecture

- **Single Next.js 15 project** (App Router) serves both frontend and backend. No separate backend service.
- **React Server Components** for data fetching on public pages (feed, post detail). Client Components only where interactivity is needed (like button, comment form, image upload).
- **Route Handlers** (`app/api/`) for all mutation endpoints (create post, register, login, comment, like, upload).
- **Server Actions** may be used for form submissions where appropriate, but Route Handlers are the primary API surface and the testing seam.

### UI & Styling

- **shadcn/ui** components copied into `src/components/ui/`, fully customized for black & white theme.
- **Tailwind CSS v4** for utility styling. Theme variables in `globals.css` set to pure black/white/gray palette — no color hues.
- Nine-grid (九宫格) media layout as a custom component, handling 1-9 images with responsive grid logic.

### Database

- **PostgreSQL** on the same Ubuntu server.
- **Prisma** ORM for schema definition, migrations, and type-safe queries.
- Tables: `User`, `Post`, `Media`, `Comment`, `Like`, `Tag`, `PostTag` (join table).
- `User.role` enum: `ADMIN | MEMBER`.
- `Post.mediaType` enum: `IMAGE | VIDEO | NONE`.
- `Like` has a unique constraint on `(userId, postId)`.

### Authentication

- **Auth.js (NextAuth v5)** with Credentials Provider.
- Password hashed with bcrypt.
- Session strategy: JWT (stateless, no session table needed).
- Middleware protects `/admin/*` routes — only `ADMIN` role users pass.
- Registration endpoint validates invite code against environment variable `INVITE_CODE=baicaofamily`.

### Media Storage

- **Alibaba Cloud OSS** for images and videos.
- Upload flow: client requests a presigned URL from `/api/upload`, uploads directly to OSS from the browser, then sends the resulting URL(s) back when creating the post.
- Media records in database store the OSS URL, type (image/video), and display order.
- Upload limits enforced both client-side and server-side: max 9 images OR 1 video per post.

### Feed & Pagination

- Homepage feed loads posts in reverse chronological order.
- **Cursor-based pagination** (using `createdAt` + `id`) for infinite scroll, more efficient than offset-based.
- Tag filtering via query parameter: `/?tag=日常`.
- Each post in the feed shows: content (truncated if long post), media grid, tags, like count, comment count, author, timestamp.

### Routing

- `(public)` route group: homepage, post detail, login, register — public layout with navbar.
- `(admin)` route group: admin dashboard, create post, manage posts — admin layout with sidebar, protected by middleware.
- `api/` routes: auth, posts, comments, likes, upload.

### Deployment

- **Ubuntu server** with Node.js, PostgreSQL installed directly.
- **PM2** process manager for the Next.js standalone build.
- **Nginx** reverse proxy: handles SSL termination (Let's Encrypt), proxies to `:3000`.
- Domain `mybaicao.com` pointed to the server's IP.

## Testing Decisions

### Testing Seam

**Primary (and only) seam: API Route Handlers.** All business logic is tested through HTTP requests to the Route Handlers. This covers auth, authorization, CRUD operations, validation, and business rules in a single integration test surface.

### What Makes a Good Test

- Tests exercise **external behavior** through the HTTP boundary: send a request, assert the response status and body.
- Tests do NOT mock Prisma or internal modules — they hit a **real test database** (separate PostgreSQL database or schema).
- Each test suite manages its own data setup and teardown.
- Tests verify **business rules**: invite code rejection, admin-only post creation, one-like-per-user, media type exclusivity.

### Test Structure

- Test files co-located with route handlers or in a top-level `__tests__/api/` directory.
- Test runner: **Vitest** (fast, ESM-native, good Next.js integration).
- HTTP requests made with `fetch` against the Next.js dev server or using Next.js test utilities.

### Key Test Scenarios

- Register with correct invite code → 201, user created with MEMBER role.
- Register with wrong invite code → 403, no user created.
- Register with duplicate username → 409.
- Create post as admin → 201, post with media records created.
- Create post as member → 403.
- Create post with 10 images → 400 (exceeds limit).
- Create post with images AND video → 400 (mutually exclusive).
- Like a post → 200, like count incremented.
- Like same post again → 200, like removed (toggle).
- Comment as member → 201.
- Comment as visitor (no auth) → 401.
- List posts → 200, reverse chronological, cursor-based pagination.
- List posts with tag filter → 200, only matching posts.

### No Prior Art

This is a greenfield project with no existing tests. The patterns established here will serve as the template for all future tests.

## Out of Scope

- **E2E / browser tests** (Playwright) — not in MVP, can be added later.
- **UI component unit tests** — the Route Handler seam covers behavior; visual testing is deferred.
- **Rich text / Markdown editing** — posts are plain text only, no formatting engine.
- **Nested/threaded comments** — comments are flat, chronological. Threading is a future enhancement.
- **User-generated invite codes** — only the fixed invite code is supported.
- **Dark/light mode toggle** — the site is pure black & white, no theme switching.
- **Email notifications** — no email service integration.
- **Search** — no full-text search; tag filtering is the only discovery mechanism.
- **Image processing** (thumbnails, compression) — images served as-is from OSS.
- **Rate limiting** — not in MVP, but should be considered before public launch.
- **i18n** — Chinese only.
- **Mobile app** — web only.

## Further Notes

- The first user (admin) will need to be seeded into the database manually or via a setup script, since there's no admin registration flow — the registration endpoint only creates MEMBER role users.
- The invite code `baicaofamily` is stored as an environment variable, making it easy to change without code deployment.
- Cow cat visual assets (logo, hero image, 404 illustration) will use placeholders initially and be replaced with final artwork later.
- The project domain glossary is maintained in `CONTEXT.md` at the repo root. All code and documentation should use terms defined there (动态/Post, 成员/Member, 管理员/Admin, etc.).
- Architecture decisions are recorded in `docs/adr/`.
