# 集市 Agora

开源 AI 重译经典书籍计划。用户上传原典，用 AI 生成强译本，然后免费开源。任何人都能 Fork、修改、提交更好的翻译。

像素雅典风格设计，灵感来自帕特农神庙的大理石与蜂蜜金。

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19
- **数据库**: Supabase (PostgreSQL + Storage)
- **文字提取**: MinerU API（PDF/Doc/Office）+ unpdf/turndown（本地降级）
- **AI**: OpenAI API（元数据分类 + 子标签提取）
- **样式**: 手写 CSS（4400+ 行，已模块化拆分为 11 个文件）
- **字体**: ChillBitmap 像素字体（7px / 16px）
- **部署**: Vercel

## 快速开始

```bash
# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 环境变量

在 `.env` 或 Vercel Environment Variables 中配置：

| 变量 | 必需 | 说明 |
|------|------|------|
| `SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anon public key |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | 前端用，同 SUPABASE_URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | 前端用，同 SUPABASE_ANON_KEY |
| `SUPABASE_SERVICE_ROLE_KEY` | 推荐 | 服务端写操作（绕过 RLS）。未设置时回退到 anon key |
| `UPLOAD_PASSWORD` | ✅ | 上传功能密码门槛。不设则上传功能关闭 |
| `OPENAI_API_KEY` | ✅ | AI 元数据提取 |
| `MINERU_TOKEN` | 可选 | MinerU 精准文字提取（PDF/Doc/Office） |
| `MINERU_MAX_PAGES` | 可选 | MinerU 最大页数，默认 200 |
| `MINERU_TIMEOUT_MS` | 可选 | MinerU 超时毫秒，默认 120000 |
| `RESEND_API_KEY` | 可选 | Landing Page 邮件通知 |
| `NOTIFICATION_EMAIL` | 可选 | 通知接收邮箱 |
| `NEXT_PUBLIC_SITE_URL` | 可选 | 站点 URL（metadata 用） |
| `NEXT_PUBLIC_CONTACT_EMAIL` | 可选 | 页脚展示的联系邮箱 |

## 项目结构

```
src/
├── app/                     # Next.js App Router 页面 + API
│   ├── api/                 # Route Handlers
│   │   ├── upload/          # 文件上传（multipart + MinerU）
│   │   ├── books/           # 书籍 CRUD + AI 状态
│   │   └── greeting/        # Landing Page 邮件表单
│   ├── books/               # 书库列表 / 详情 / 阅读 / 上传
│   └── page.tsx             # 落地页
├── components/client/       # 客户端组件
│   ├── books/               # BookGrid, BookReader, BookCard 等
│   └── shared/              # 共享 UI 组件
├── lib/
│   ├── db/                  # PostgreSQL 操作（books, profiles）
│   ├── services/            # AI 富化、文字提取、文件上传
│   ├── supabase/            # Supabase 客户端（client/admin/server/browser）
│   └── utils/               # 工具函数、常量、类型
└── styles/                  # 模块化 CSS（11 个文件）
```

## 部署

1. Fork 此仓库
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置上述环境变量
4. 在 Supabase SQL Editor 执行 `supabase/schema.sql` 建表
5. 部署

## 文字提取

支持两条链路，自动级联：

| 链路 | 覆盖格式 | 需要 Token | 能力 |
|------|---------|-----------|------|
| **MinerU API**（默认） | PDF / Doc / PPT / XLS / 图片 | `MINERU_TOKEN` | 表格还原、公式 OCR、章节结构 |
| **本地提取**（降级） | PDF / EPUB / TXT / MD | 否 | 纯文本流 |

EPUB / TXT / Markdown 直接走本地提取，不送 MinerU。

## License

MIT
