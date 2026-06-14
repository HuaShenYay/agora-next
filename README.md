This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 文字提取后端

支持两条链路，自动级联：

| 链路 | 覆盖格式 | 是否需要 Token | 能力 |
|------|---------|---------------|------|
| **MinerU 精准 API**（默认） | PDF / Doc(x) / Ppt(x) / Xls(x) / PNG / JPG 等 | ✅ 需 `MINERU_TOKEN` | 表格还原、公式 OCR、章节结构、跨页合并 |
| **本地提取**（降级） | PDF / EPUB / TXT / MD | ❌ | 纯文本流，无排版 |

**接入 MinerU：**
1. https://mineru.net 注册 → API 管理 → 创建 Token
2. `.env` 中填入 `MINERU_TOKEN=...`
3. 单本书超过 `MINERU_MAX_PAGES`（默认 200 页）或 `MINERU_TIMEOUT_MS`（默认 120s）未完成时，会让用户在前端选择「重试 / 用本地提取」

**EPUB / TXT / Markdown**：本地提取更可靠，不送 MinerU。
