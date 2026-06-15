// ====================
// BookMetaGrid — 详情页顶部数据格
// 仿图书馆目录卡片：编号 / 学科 / 语言 / 格式 / 字数 / 状态
// ====================

import type { Book } from "@/lib/utils/types";

interface Props {
  book: Book;
  index: number;
  wordCount: number;
}

const FORMAT_LABEL: Record<string, string> = {
  pdf: "PDF",
  epub: "EPUB",
  txt: "TXT",
  markdown: "MD",
};

const STATUS_LABEL: Record<string, string> = {
  active: "在架",
  archived: "已归档",
};

export default function BookMetaGrid({ book, index, wordCount }: Props) {
  const cells: { key: string; label: string; value: string }[] = [
    { key: "no", label: "编号", value: String(index).padStart(3, "0") },
    { key: "lang", label: "语言", value: book.language.toUpperCase() },
    { key: "fmt", label: "格式", value: FORMAT_LABEL[book.format] ?? book.format.toUpperCase() },
    { key: "words", label: "字数", value: wordCount.toLocaleString() },
    { key: "status", label: "状态", value: STATUS_LABEL[book.status] ?? "在架" },
    { key: "clf", label: "分类", value: book.classificationStatus.toUpperCase() },
  ];

  return (
    <dl className="bd-meta" aria-label="书籍元数据">
      {cells.map((c) => (
        <div key={c.key} className="bd-meta-cell">
          <dt className="bd-meta-label">{c.label}</dt>
          <dd className="bd-meta-value">{c.value}</dd>
        </div>
      ))}
    </dl>
  );
}
