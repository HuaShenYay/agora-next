// ====================
// Markdown 工具：章节提取 + slugify
// 与 marked 渲染保持兼容（heading id 由我们在解析时挂上）
// ====================

export interface Chapter {
  id: string;
  level: 1 | 2 | 3;
  title: string;
}

// slugify：英数 → 短横线；中文 → 短横线 + 行号（保证稳定）
let slugCounter = 0;
const slugCache = new Map<string, string>();

export function slugify(title: string, fallbackIndex: number): string {
  if (slugCache.has(title)) return slugCache.get(title)!;
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]+/gu, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
  const safe = base || `sec-${fallbackIndex}`;
  const id = `ch-${fallbackIndex}-${safe}`.slice(0, 80);
  slugCache.set(title, id);
  return id;
}

/** 解析 markdown 中的 # / ## / ### 标题 */
export function extractChapters(markdown: string): Chapter[] {
  const out: Chapter[] = [];
  const re = /^(#{1,3})\s+(.+?)\s*$/gm;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(markdown)) !== null) {
    const level = m[1].length as 1 | 2 | 3;
    const title = m[2].replace(/[*_`]+/g, "").trim();
    if (!title) continue;
    out.push({ id: slugify(title, i), level, title });
    i++;
  }
  return out;
}

/** 给每个标题注入 id 的 markdown（用于 marked 渲染后的目录锚点） */
export function injectHeadingIds(markdown: string, chapters: Chapter[]): string {
  if (chapters.length === 0) return markdown;
  const re = /^(#{1,3})\s+(.+?)\s*$/gm;
  let i = 0;
  return markdown.replace(re, (_full, hashes, title) => {
    const ch = chapters[i++];
    if (!ch) return `${hashes} ${title}`;
    return `${hashes} ${title} {#${ch.id}}`;
  });
}
