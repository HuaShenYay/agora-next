// ====================
// 智能章节切分
// ====================

export interface ParsedChapter {
  index: number;
  title: string;
  content: string; // Markdown 格式
  wordCount: number;
}

// 常见章节标题模式
const CHAPTER_PATTERNS = [
  // 中文：第一章、第1章、第一回 等
  /^第[零一二三四五六七八九十百千\d]+[章节回部篇卷集]\s*[:：]?\s*(.*)$/m,
  // 英文：Chapter 1, CHAPTER I, Part 2 等
  /^(?:chapter|part|section|book|volume)\s+[\divxlcIVXLC\da-z]+\s*[:：.]?\s*(.*)$/im,
  // 纯数字标题：1. xxx, 01 xxx
  /^\d{1,3}[.、)\s]\s*(.+)$/m,
  // Markdown 标题
  /^#{1,3}\s+(.+)$/m,
];

const TARGET_CHAPTER_LENGTH = 5000; // 目标每章约 5000 字
const MIN_CHAPTER_LENGTH = 200;

/**
 * 将纯文本智能切分为章节
 * 1. 尝试正则匹配章节标题
 * 2. 若无明显标题，按固定字数切分
 */
export function splitChapters(text: string): ParsedChapter[] {
  // 先尝试按标题模式切分
  const patternChapters = splitByPattern(text);

  if (patternChapters.length >= 2) {
    return patternChapters;
  }

  // Fallback: 按字数切分
  return splitByLength(text);
}

function splitByPattern(text: string): ParsedChapter[] {
  const lines = text.split("\n");
  const chapters: ParsedChapter[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isChapterTitle = CHAPTER_PATTERNS.some((p) => p.test(trimmed));

    if (isChapterTitle && currentLines.length > 0) {
      // 保存上一章节
      const content = currentLines.join("\n").trim();
      if (content.length >= MIN_CHAPTER_LENGTH) {
        chapters.push({
          index: chapters.length,
          title: currentTitle || `第 ${chapters.length + 1} 章`,
          content: formatAsMarkdown(currentTitle, content),
          wordCount: content.length,
        });
      }
      currentTitle = trimmed;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // 最后一章
  const lastContent = currentLines.join("\n").trim();
  if (lastContent.length >= MIN_CHAPTER_LENGTH) {
    chapters.push({
      index: chapters.length,
      title: currentTitle || `第 ${chapters.length + 1} 章`,
      content: formatAsMarkdown(currentTitle, lastContent),
      wordCount: lastContent.length,
    });
  }

  // 重新编号
  return chapters.map((ch, i) => ({ ...ch, index: i }));
}

function splitByLength(text: string): ParsedChapter[] {
  const chapters: ParsedChapter[] = [];
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  let currentLines: string[] = [];
  let currentLength = 0;

  for (const para of paragraphs) {
    currentLines.push(para);
    currentLength += para.length;

    if (currentLength >= TARGET_CHAPTER_LENGTH) {
      const content = currentLines.join("\n\n").trim();
      chapters.push({
        index: chapters.length,
        title: `第 ${chapters.length + 1} 章`,
        content: formatAsMarkdown("", content),
        wordCount: content.length,
      });
      currentLines = [];
      currentLength = 0;
    }
  }

  // 剩余内容
  if (currentLines.length > 0) {
    const content = currentLines.join("\n\n").trim();
    if (content.length >= MIN_CHAPTER_LENGTH) {
      chapters.push({
        index: chapters.length,
        title: `第 ${chapters.length + 1} 章`,
        content: formatAsMarkdown("", content),
        wordCount: content.length,
      });
    } else if (chapters.length > 0) {
      // 太短，合并到最后一章
      const last = chapters[chapters.length - 1];
      last.content += "\n\n" + content;
      last.wordCount += content.length;
    }
  }

  // 如果只切出了一个章节，返回整文
  if (chapters.length === 0) {
    chapters.push({
      index: 0,
      title: "全文",
      content: formatAsMarkdown("", text.trim()),
      wordCount: text.trim().length,
    });
  }

  return chapters;
}

function formatAsMarkdown(title: string, content: string): string {
  if (title) {
    return `## ${title}\n\n${content}`;
  }
  return content;
}
