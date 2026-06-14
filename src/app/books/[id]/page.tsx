// ====================
// 书籍详情页 — 图书馆目录卡片 v2
// 顶部 Hero（eyebrow + 大标题 + 描述 + 数据格）
// AI 状态面板：异步显示「优化中 / 完成 / 失败可重试」
// 上传者卡片
// 左右双栏：左 = 章节预览；右 = 操作 + AI + 上传者
// ====================

import { notFound } from "next/navigation";
import { getBook, getBookAi, type AIMetadata } from "@/lib/db/books";
import { getBooksCountByUploader, getProfile } from "@/lib/db/profiles";
import { DEFAULT_CATEGORIES, SUB_CATEGORY_MAP } from "@/lib/utils/constants";
import BookMetaGrid from "@/components/client/books/BookMetaGrid";
import BookDetailActions from "@/components/client/books/BookDetailActions";
import BookUploaderCard from "@/components/client/books/BookUploaderCard";
import BookAiStatus from "@/components/client/books/BookAiStatus";

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  const ai = await getBookAi(id);
  const aiMeta: AIMetadata | null = ai?.aiMetadata ?? null;
  const aiDone = ai?.aiStatus === "done" && aiMeta;

  // AI 完成后：用 AI 提取的字段覆盖原值（fallback 到原值）
  const displayTitle = aiDone && aiMeta.title ? aiMeta.title : book.title;
  const displayAuthor = aiDone && aiMeta.author ? aiMeta.author : book.author;
  const displayDescription = aiDone && aiMeta.description ? aiMeta.description : book.description;
  const displayCategories = aiDone && aiMeta.categories?.length ? aiMeta.categories : book.categories;
  const displayTags = aiDone && aiMeta.subTags?.length ? aiMeta.subTags : book.tags;

  const canRead = !!book.contentMarkdown && book.contentMarkdown.trim().length > 0;

  // 字数
  const wordCount = canRead
    ? (book.contentMarkdown!.match(/[\u4e00-\u9fa5]/g)?.length ?? 0) +
      (book.contentMarkdown!.match(/[A-Za-z]+/g)?.length ?? 0)
    : 0;

  // 章节预览
  const chapters = canRead
    ? Array.from(book.contentMarkdown!.matchAll(/^#{1,3}\s+(.+)$/gm))
        .slice(0, 12)
        .map((m, i) => ({ id: `ch-${i}`, level: m[0].split(/\s+/)[0].length, title: m[1].trim() }))
    : [];

  // 分类显示：优先用子分类信息，回退到顶级分类
  const primaryCatId = displayCategories[0] ?? "";
  const subInfo = SUB_CATEGORY_MAP[primaryCatId];
  const topCat = subInfo
    ? DEFAULT_CATEGORIES.find((c) => c.id === subInfo.parent)
    : DEFAULT_CATEGORIES.find((c) => c.id === primaryCatId);
  const primaryCategory = topCat
    ? { emoji: topCat.emoji, name: subInfo ? `${topCat.name} · ${subInfo.name}` : topCat.name }
    : null;

  // 上传者
  const isAnonymous = book.uploaderId === "anonymous";
  const [profile, booksCount] = await Promise.all([
    isAnonymous ? Promise.resolve(null) : getProfile(book.uploaderId),
    isAnonymous ? Promise.resolve(0) : getBooksCountByUploader(book.uploaderId),
  ]);

  return (
    <article className="bd">
      {/* Hero */}
      <header className="bd-hero">
        <div className="bd-hero-top">
          <span className="bd-eyebrow">RECORD / 藏书</span>
          <span className="bd-eyebrow bd-eyebrow--right">
            {primaryCategory ? `${primaryCategory.emoji} ${primaryCategory.name}` : "—"}
          </span>
        </div>
        <h1 className="bd-title">{displayTitle}</h1>
        {book.titleOriginal && book.titleOriginal !== book.title && (
          <p className="bd-original">{book.titleOriginal}</p>
        )}
        {displayDescription && <p className="bd-desc">{displayDescription}</p>}

        <BookMetaGrid
          book={{ ...book, title: displayTitle, author: displayAuthor }}
          index={1}
          wordCount={wordCount}
        />
      </header>

      {/* 双栏 */}
      <div className="bd-body">
        <section className="bd-main" aria-label="章节预览">
          {/* AI 状态面板（始终在内容区顶部，idle 除外） */}
          {ai && ai.aiStatus !== "idle" && (
            <BookAiStatus
              bookId={book.id}
              initial={{
                status: ai.aiStatus,
                stage: ai.aiStatus === "done" ? "done" : ai.aiStatus === "failed" ? "failed" : "queued",
                message: ai.aiStatus === "done" ? "AI 优化完成" : ai.aiStatus === "failed" ? "AI 优化失败" : "AI 优化中",
                error: ai.aiError ?? undefined,
                result: aiMeta,
              }}
            />
          )}

          {/* 子标签（AI 完成后展示） */}
          {aiDone && displayTags.length > 0 && (
            <div className="bd-subtags">
              <div className="bd-subtags-head">HIERARCHICAL TAGS</div>
              <div className="bd-subtags-list">
                {displayTags.map((t) => (
                  <span key={t} className="bd-subtag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* 章节预览 */}
          <div className="bd-section-head">
            <h2 className="bd-section-title">CONTENTS</h2>
            <span className="bd-section-count">
              {chapters.length > 0 ? `${chapters.length} 章` : "—"}
            </span>
          </div>

          {chapters.length > 0 ? (
            <ol className="bd-toc" aria-label="目录">
              {chapters.map((ch, i) => (
                <li key={ch.id} className={`bd-toc-item bd-toc-item--lv${ch.level}`}>
                  <span className="bd-toc-no">{String(i + 1).padStart(2, "0")}</span>
                  <span className="bd-toc-title">{ch.title}</span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="bd-empty">
              <p className="bd-empty-title">NO PREVIEW</p>
              <p className="bd-empty-desc">
                {canRead ? "未能从正文中识别到章节标题。" : "该书籍尚未提取文字内容。"}
              </p>
            </div>
          )}
        </section>

        <aside className="bd-actions-stack" aria-label="操作与元数据">
          <BookDetailActions book={{ ...book, title: displayTitle, author: displayAuthor }} canRead={canRead} />
          <BookUploaderCard
            profile={profile}
            uploadedAt={book.createdAt}
            booksCount={booksCount}
            isAnonymous={isAnonymous}
          />
        </aside>
      </div>
    </article>
  );
}
