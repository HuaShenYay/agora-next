// ====================
// PDF 文本提取（pdfjs-dist）
// ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLib: any = null;

async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  pdfjsLib = await import("pdfjs-dist");
  // 使用 legacy build 避免 worker 依赖
  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "";
  }
  return pdfjsLib;
}

export interface PdfParseResult {
  text: string;
  pageCount: number;
  pageTexts: string[];
}

export async function parsePdf(data: Uint8Array): Promise<PdfParseResult> {
  const pdfjs = await getPdfJs();

  const loadingTask = pdfjs.getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
  });
  const doc = await loadingTask.promise;
  const pageCount = doc.numPages;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str ?? "")
      .join(" ");
    pageTexts.push(strings.trim());
  }

  await doc.destroy();

  const text = pageTexts.join("\n\n");

  // 检测是否为扫描件（文字极少）
  const avgCharsPerPage = text.length / pageCount;
  if (avgCharsPerPage < 50) {
    throw new Error(
      "此 PDF 可能为扫描件，提取到的文字极少（平均每页不足50字）。建议上传 TXT 或 Markdown 版本。",
    );
  }

  return { text, pageCount, pageTexts };
}
