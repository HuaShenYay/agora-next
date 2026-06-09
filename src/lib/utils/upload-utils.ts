// ====================
// 上传工具：格式探测、文件大小校验
// ====================

import { MAX_FILE_SIZE, SUPPORTED_FORMATS } from "@/lib/utils/constants";
import type { BookFormat } from "@/lib/utils/types";

const FORMAT_BY_EXT: Record<string, BookFormat> = {
  pdf: "pdf",
  epub: "epub",
  txt: "txt",
  md: "markdown",
  markdown: "markdown",
};

const MIME_BY_FORMAT: Record<BookFormat, string> = {
  pdf: "application/pdf",
  epub: "application/epub+zip",
  txt: "text/plain",
  markdown: "text/markdown",
};

export function detectFormat(mimeType: string, filename: string): BookFormat {
  // 1) 优先按 MIME 匹配
  if (mimeType && (SUPPORTED_FORMATS as Record<string, BookFormat>)[mimeType]) {
    return (SUPPORTED_FORMATS as Record<string, BookFormat>)[mimeType];
  }
  // 2) 否则按文件后缀
  const ext = getExtension(filename);
  if (ext && FORMAT_BY_EXT[ext]) return FORMAT_BY_EXT[ext];
  throw new Error(`不支持的文件类型: ${mimeType || ext}`);
}

export function validateFile(fileData: Uint8Array, format: BookFormat): void {
  if (!fileData || fileData.byteLength === 0) {
    throw new Error("文件为空");
  }
  if (fileData.byteLength > MAX_FILE_SIZE) {
    throw new Error(`文件超过最大限制 ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`);
  }
  if (!format) {
    throw new Error("无法识别文件格式");
  }
}

export function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx + 1).toLowerCase() : "";
}

export function getMimeType(format: BookFormat): string {
  return MIME_BY_FORMAT[format] ?? "application/octet-stream";
}
