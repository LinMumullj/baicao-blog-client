# 选择 shadcn/ui 而非 HeroUI 作为 UI 组件库

项目最初考虑使用 HeroUI（原 NextUI）+ Tailwind CSS，但最终选择 shadcn/ui + Tailwind CSS v4。主要原因：项目需要纯黑白+奶牛猫主题的深度视觉定制，shadcn/ui 的 copy-paste 模式让我们完全拥有组件源码，可以自由改造每一个细节；HeroUI 作为 npm 包，定制受限于其 theme token 系统。此外 shadcn/ui 100% 支持 React Server Components，bundle 体积比 HeroUI 小约 63%，对博客 SEO 和加载性能更有利。
