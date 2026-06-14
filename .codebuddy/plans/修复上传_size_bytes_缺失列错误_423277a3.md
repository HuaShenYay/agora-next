---
name: 修复上传 size_bytes 缺失列错误
overview: 补齐 books 表缺失的 size_bytes / storage_path 列，匹配 file-upload → saveBook 当前写入路径，消除 "Could not find the 'size_bytes' column of 'books' in the schema cache" 错误。
todos:
  - id: patch-schema-columns
    content: 在 supabase/schema.sql 的 books 表 CREATE TABLE 中追加 size_bytes BIGINT 与 storage_path TEXT DEFAULT '' 两列
    status: completed
  - id: add-alter-migration
    content: 在 supabase/schema.sql 末尾追加幂等 ALTER TABLE books ADD COLUMN IF NOT EXISTS 段，兼容已存在的旧 books 表
    status: completed
    dependencies:
      - patch-schema-columns
  - id: build-verify
    content: 运行 npm run build 验证 TS/CSS 无回归；提示用户在 Supabase Dashboard SQL Editor 执行 schema.sql 后再次上传文件确认 size_bytes 写入成功
    status: completed
    dependencies:
      - add-alter-migration
---

## 问题

上传 PDF/EPUB/TXT 时，`/api/upload` 调用 `processUpload` 进一步调用 `saveBook(book, { sizeBytes: fileData.byteLength })` 失败：
`saveBook failed: Could not find the 'size_bytes' column of 'books' in the schema cache`

根因：`src/lib/db/books.ts:75` 会写入 `row.size_bytes`，但 `supabase/schema.sql` 中 `books` 表的 `CREATE TABLE` 缺 `size_bytes` 列。同时还缺 `storage_path`（默认不入参所以未报错，但顺手补齐更稳）。

## 处理方向（用户已确认）

- 给 `supabase/schema.sql` 追加 `size_bytes BIGINT` 列；为对称与未来扩展顺手补 `storage_path TEXT`
- 追加幂等 `ALTER TABLE books ADD COLUMN IF NOT EXISTS ...`，让旧库迁移不报错
- 不动 `file-upload.ts` / `books.ts` 行为（保留 sizeBytes 元数据语义）
- 不新增 API 路由（用户已确认）
- 不调整上传样式（用户已确认暂不升级）

## 验收

- `npm run build` 通过，无 TS/CSS 错误
- Supabase Dashboard 跑完 `schema.sql` 后，上传 PDF/EPUB/TXT 成功落库，`content_markdown` 与 `size_bytes` 字段均写入

## 改动技术方案

### 改动点 1：`supabase/schema.sql`

在 `books` 表 `CREATE TABLE IF NOT EXISTS books (...)` 块内 `content_markdown TEXT DEFAULT ''` 之后追加两列：

- `size_bytes BIGINT`（可记录最高约 9.2 EB，远超 50MB 文件上限）
- `storage_path TEXT DEFAULT ''`（与代码可选赋值对齐，默认空串避免 NOT NULL 报错）

在文件末尾追加幂等迁移段，确保已存在 `books` 表的旧数据库也能补齐两列：

- `ALTER TABLE books ADD COLUMN IF NOT EXISTS size_bytes BIGINT;`
- `ALTER TABLE books ADD COLUMN IF NOT EXISTS storage_path TEXT DEFAULT '';`

### 改动点 2：不动

- `src/lib/services/file-upload.ts`：保留 `saveBook(book, { sizeBytes })` 调用
- `src/lib/db/books.ts`：保留 `row.size_bytes` 与 `row.storage_path` 条件写入
- `src/lib/services/text-extract.ts`、上传页面、表单组件、API 路由均不动

### 设计权衡

- `BIGINT` 而非 `INT`：选 BIGINT 仅为防御性，避免未来放开文件上限时再改 schema
- `IF NOT EXISTS` 的 ALTER 段幂等：本地/SQL Editor 重复执行不报错
- 不写 NOT NULL：旧数据无此字段，允许 NULL 更稳
- 保留可选写入语义：`if (typeof extras?.sizeBytes === 'number')` 仍是 truthy 才设列

### 执行风险与回滚

- 风险面：仅 SQL schema 修改。PostgREST schema cache 可能在 Supabase 中短暂延迟（秒级）；若仍报 column not found，在 Supabase Dashboard → API → Reload schema cache 即可
- 回滚：删两列即可，无业务依赖