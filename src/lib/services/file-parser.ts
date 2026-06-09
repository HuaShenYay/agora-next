// ====================
// 文件格式检测 + 解析调度
// ====================

import { parsePdf } from "@/lib/services/pdf-parser";
import { parseEpub } from "@/lib/services/epub-parser";
import { splitChapters, type ParsedChapter } from "@/lib/services/chapter-splitter";
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from "@/lib/utils/constants";

export type BookFormat = "pdf" | "epub" | "txt" | "markdown";

export interface ParseResult {
  fullText: string;
  chapters: ParsedChapter[];
  format: BookFormat;
}

export function detectFormat(
  mimeType: string,
  filename: string,
): BookFormat {
  // 先按 MIME 类型
  const formatFromMime = SUPPORTED_FORMATS[mimeType as keyof typeof SUPPORTED_FORMATS];
  if (formatFromMime) return formatFromMime as BookFormat;

  // 再按文件扩展名
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "pdf":
      return "pdf";
    case "epub":
      return "epub";
    case "md":
    case "markdown":
      return "markdown";
    case "txt":
    case "text":
      return "txt";
    default:
      return "txt"; // fallback
  }
}

export function validateFile(
  data: Uint8Array,
  format: BookFormat,
): void {
  if (data.length > MAX_FILE_SIZE) {
    throw new Error(`文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）`);
  }
  if (data.length === 0) {
    throw new Error("文件内容为空");
  }
  // PDF 文件头检查
  if (format === "pdf") {
    const header = new TextDecoder().decode(data.slice(0, 5));
    if (header !== "%PDF-") {
      throw new Error("无效的 PDF 文件");
    }
  }
}

export async function parseFile(
  data: Uint8Array,
  format: BookFormat,
): Promise<ParseResult> {
  let fullText: string;
  let preChapters: string[] | null = null;

  switch (format) {
    case "pdf": {
      const result = await parsePdf(data);
      fullText = result.text;
      break;
    }
    case "epub": {
      const result = await parseEpub(data);
      fullText = result.text;
      preChapters = result.chapters;
      break;
    }
    case "markdown":
    case "txt":
    default: {
      fullText = new TextDecoder().decode(data);
      break;
    }
  }

  // 切分章节
  const chapters = preChapters
    ? preChapters.map((text, i) => ({
        index: i,
        title: `第 ${i + 1} 章`,
        content: text,
        wordCount: text.length,
      }))
    : splitChapters(fullText);

  return { fullText, chapters, format };
}
