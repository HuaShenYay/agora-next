// ====================
// EPUB 文本提取（jszip + fast-xml-parser）
// ====================

import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

export interface EpubParseResult {
  text: string;
  chapters: string[]; // 按 spine 顺序的章节文本
}

export async function parseEpub(data: Uint8Array): Promise<EpubParseResult> {
  const zip = await JSZip.loadAsync(data);
  const parser = new XMLParser({ ignoreAttributes: false });

  // 1. 找到 container.xml → OPF 文件路径
  const containerXml = await zip.file("META-INF/container.xml")?.async("string");
  if (!containerXml) {
    throw new Error("无效的 EPUB 文件：缺少 META-INF/container.xml");
  }

  const containerDoc = parser.parse(containerXml);
  const rootfile = containerDoc?.container?.rootfiles?.rootfile;
  const opfPath: string = rootfile?.["@_full-path"] ?? "";
  if (!opfPath) {
    throw new Error("无效的 EPUB 文件：无法找到 OPF 文件路径");
  }

  // 2. 解析 OPF 文件 → 获取 manifest 和 spine
  const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";
  const opfXml = await zip.file(opfPath)?.async("string");
  if (!opfXml) {
    throw new Error("无效的 EPUB 文件：无法读取 OPF 文件");
  }

  const opfDoc = parser.parse(opfXml);
  const packageDoc = opfDoc?.package ?? opfDoc;

  // Manifest: id → href 映射
  const manifestItems: Record<string, string> = {};
  const manifest = packageDoc?.manifest?.item;
  const manifestArr = Array.isArray(manifest) ? manifest : manifest ? [manifest] : [];
  for (const item of manifestArr) {
    if (item["@_id"] && item["@_href"]) {
      manifestItems[item["@_id"]] = item["@_href"];
    }
  }

  // Spine: 阅读顺序
  const spine = packageDoc?.spine?.itemref;
  const spineArr = Array.isArray(spine) ? spine : spine ? [spine] : [];
  const spineIds = spineArr.map((item: Record<string, string>) => item["@_idref"]).filter(Boolean);

  // 3. 按 spine 顺序读取 XHTML 文件，提取纯文本
  const chapters: string[] = [];

  for (const itemId of spineIds) {
    const href = manifestItems[itemId];
    if (!href) continue;

    const filePath = opfDir + href;
    const xhtml = await zip.file(filePath)?.async("string");
    if (!xhtml) continue;

    // 去除 HTML 标签，提取纯文本
    const text = stripHtml(xhtml);
    if (text.trim().length > 0) {
      chapters.push(text.trim());
    }
  }

  if (chapters.length === 0) {
    throw new Error("EPUB 文件中未提取到有效文本内容");
  }

  const fullText = chapters.join("\n\n---\n\n");
  return { text: fullText, chapters };
}

// ====================
// HTML 标签剥离
// ====================

function stripHtml(html: string): string {
  // 移除 <script>, <style> 标签及其内容
  let text = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  // 移除所有 HTML 标签
  text = text.replace(/<[^>]+>/g, " ");
  // 解码常见 HTML 实体
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec)));
  // 合并多余空白
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\s*\n\s*\n+/g, "\n\n");
  return text.trim();
}
