// ====================
// 文本提取服务
// 两条路径：
//   1) extractViaMinerU  — PDF/Doc/PPT/Excel/图片，结构化最好（需要 MINERU_TOKEN）
//   2) extractLocal      — 任意格式，纯文本流（无结构）
// extractToMarkdown 保持向后兼容：默认直接走本地
// ====================

import type { BookFormat } from "@/lib/utils/types";
import { apply as mineruApply, isMinerUSupported, MinerUError } from "./mineru";

// ====================
// 顶层：决定走哪条路径
// ====================

export interface ExtractDecision {
  via: "mineru" | "local";
  reason: string;
}

export function decideExtractPath(format: BookFormat, sizeBytes: number): ExtractDecision {
  if (isMinerUSupported(format, sizeBytes)) {
    return { via: "mineru", reason: "MinerU 精准 API 可用（结构化最佳）" };
  }
  return { via: "local", reason: "格式/大小不在 MinerU 范围，走本地提取" };
}

// ====================
// 路径 1: MinerU
// ====================

export interface MinerUExtractOptions {
  filename: string;
  format: BookFormat;
  sizeBytes: number;
  fileData: Uint8Array;
  signal?: AbortSignal;
  onProgress?: (r: { stage: string; progress: number; message?: string }) => void;
}

export async function extractViaMinerU(opts: MinerUExtractOptions): Promise<string> {
  const { markdown } = await mineruApply({
    filename: opts.filename,
    format: opts.format,
    sizeBytes: opts.sizeBytes,
    fileData: opts.fileData,
    signal: opts.signal,
    onProgress: opts.onProgress,
  });
  if (!markdown || markdown.trim().length === 0) {
    throw new MinerUError("REMOTE", "MinerU 返回的 markdown 为空", { detail: "empty content" });
  }
  return markdown;
}

// ====================
// 路径 2: 本地（unpdf + jszip + turndown）
// ====================

export async function extractLocal(
  fileData: Uint8Array,
  format: BookFormat,
): Promise<string> {
  switch (format) {
    case "pdf":
      return extractPdf(fileData);
    case "epub":
      return extractEpub(fileData);
    case "txt":
      return extractTxt(fileData);
    case "markdown":
      return extractMarkdown(fileData);
    default:
      throw new Error(`不支持的格式: ${format}`);
  }
}

// 向后兼容：原 extractToMarkdown 仍可工作（直接走本地）
export async function extractToMarkdown(
  fileData: Uint8Array,
  format: BookFormat,
): Promise<string> {
  return extractLocal(fileData, format);
}

// ====================
// PDF 提取 (unpdf)
// ====================

async function extractPdf(fileData: Uint8Array): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");

  const pdf = await getDocumentProxy(fileData);
  const { text } = await extractText(pdf, { mergePages: true });

  if (!text || text.trim().length === 0) {
    throw new Error("PDF 文字提取为空，可能是扫描件（纯图片 PDF），本地无法 OCR。");
  }

  const lines = text.split("\n");
  const cleaned: string[] = [];
  let prevEmpty = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      if (!prevEmpty) {
        cleaned.push("");
        prevEmpty = true;
      }
    } else {
      cleaned.push(trimmed);
      prevEmpty = false;
    }
  }

  return cleaned.join("\n").trim();
}

// ====================
// EPUB 提取 (jszip + turndown)
// ====================

async function extractEpub(fileData: Uint8Array): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const TurndownService = (await import("turndown")).default;

  const zip = await JSZip.loadAsync(fileData);

  const containerXml = await zip.file("META-INF/container.xml")?.async("string");
  if (!containerXml) {
    throw new Error("无效 EPUB：缺少 META-INF/container.xml");
  }

  const opfPath = extractOpfPath(containerXml);
  if (!opfPath) {
    throw new Error("无效 EPUB：无法找到 OPF 文件路径");
  }

  const opfContent = await zip.file(opfPath)?.async("string");
  if (!opfContent) {
    throw new Error(`无效 EPUB：无法读取 OPF 文件 ${opfPath}`);
  }

  const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";
  const { spine, manifest } = parseOpf(opfContent);

  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });

  const chapters: string[] = [];

  for (const itemId of spine) {
    const href = manifest[itemId];
    if (!href) continue;

    const filePath = opfDir + href;
    const html = await zip.file(filePath)?.async("string");
    if (!html) continue;

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const content = bodyMatch ? bodyMatch[1] : html;

    const cleaned = content
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "");

    const md = turndown.turndown(cleaned).trim();
    if (md.length > 0) {
      chapters.push(md);
    }
  }

  if (chapters.length === 0) {
    throw new Error("EPUB 提取为空：未找到任何可读取的章节内容。");
  }

  return chapters.join("\n\n---\n\n");
}

function extractOpfPath(containerXml: string): string | null {
  const match = containerXml.match(/full-path=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function parseOpf(opfContent: string): {
  spine: string[];
  manifest: Record<string, string>;
} {
  const manifest: Record<string, string> = {};
  const spine: string[] = [];

  const itemRegex = /<item\s+[^>]*id=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi;
  let match;
  while ((match = itemRegex.exec(opfContent)) !== null) {
    const [, id, href] = match;
    if (/\.(x?html?|xml)$/i.test(href)) {
      manifest[id] = decodeURIComponent(href);
    }
  }

  const spineRegex = /<itemref\s+[^>]*idref=["']([^"']+)["'][^>]*\/?>/gi;
  while ((match = spineRegex.exec(opfContent)) !== null) {
    spine.push(match[1]);
  }

  return { spine, manifest };
}

// ====================
// TXT 提取
// ====================

function extractTxt(fileData: Uint8Array): string {
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(fileData);

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0);

  return paragraphs.join("\n\n");
}

// ====================
// Markdown 提取
// ====================

function extractMarkdown(fileData: Uint8Array): string {
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(fileData).trim();
}
