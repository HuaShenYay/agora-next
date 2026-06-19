// ====================
// Markdown 工具：章节提取 + id 生成
// id 规则与 marked 的 heading renderer 共享，保证 TOC 与正文锚点一致
// ====================

export interface Chapter {
  id: string;
  level: 1 | 2 | 3;
  title: string;
}

/**
 * 生成稳定且唯一的标题 id。
 * 不使用跨调用缓存——缓存会让「两个同名标题」拿到同一个 id，
 * 导致 DOM id 冲突、IntersectionObserver 与 getElementById 失效。
 * 用 index 兜底保证唯一，slug 部分保证可读。
 */
export function headingId(title: string, index: number): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]+/gu, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
  const safe = base || `sec`;
  return `ch-${index}-${safe}`.slice(0, 80);
}

/** 解析 markdown 中的 # / ## / ### 标题 */
export function extractChapters(markdown: string): Chapter[] {
  const out: Chapter[] = [];
  const re = /^(#{1,3})\s+(.+?)\s*$/gm;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(markdown)) !== null) {
    const level = m[1]!.length as 1 | 2 | 3;
    const title = m[2]!.replace(/[*_`]+/g, "").trim();
    if (!title) continue;
    out.push({ id: headingId(title, i), level, title });
    i++;
  }
  return out;
}

/**
 * 段落归并：修复 PDF 提取导致的"每物理行独立段落"。
 * 对正文区（标题/代码块/列表之外）做处理：连续的非空行合并为一段（空格连接），
 * 空行才作为段落分隔。标题行、列表项、代码围栏、引用块保持原样。
 *
 * 仅对"看起来被拆碎"的文本生效——如果原文段落本就用空行分隔，行为不变。
 */
export function normalizeMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let buf: string[] = []; // 当前正 accumulating 的正文行
  let inCodeFence = false;

  const flush = () => {
    if (buf.length > 0) {
      out.push(buf.join(" "));
      buf = [];
    }
  };

  for (const raw of lines) {
    const line = raw;
    const trimmed = line.trim();

    // 代码围栏开关
    if (/^```/.test(trimmed)) {
      flush();
      inCodeFence = !inCodeFence;
      out.push(line);
      continue;
    }
    // 代码块内原样保留
    if (inCodeFence) {
      out.push(line);
      continue;
    }
    // 空行 → 段落边界
    if (trimmed === "") {
      flush();
      out.push("");
      continue;
    }
    // 标题 / 列表 / 引用 / 表格 / 分隔线 / HTML → 边界，先 flush 再原样
    if (/^(#{1,6}\s|>\s|[-*+]\s|\d+\.\s|\||---|<)/.test(trimmed)) {
      flush();
      out.push(line);
      continue;
    }
    // 普通正文行：accumulate
    buf.push(trimmed);
  }
  flush();

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * 面向 TOC 展示的章节清洗：
 *   1. 合并断词标题（如"前"+"言"→"前言"、"目"+"录"→"目录"）
 *   2. 合并"第N章"+紧跟的副标题（如"第一章"+"故事材质"→"第一章　故事材质"）
 *   3. 保留有意义的单字标题（序/跋/引/前言/后记等），过滤纯噪声
 *
 * 返回的 Chapter.id 指向**合并组里第一个**原始标题的 id，
 * 保证点击 TOC 项能跳到正文对应位置（正文 DOM 的 id 由 extractChapters 决定，保持稳定）。
 */
const CHAPTER_PATTERN_RE = /^(第[一二三四五六七八九十百千零0-9]+[章卷节回篇部]|chapter\s+\d+|[\d]+[.、])/i;
// 有意义的短标题（不当作噪声过滤）
const MEANINGFUL_SHORT = /^(序|跋|引|前言|后记|楔子|引子|尾声|绪论|导论|结语|附录|参考文献|索引|目录|contents?)$/i;

export interface TocChapter extends Chapter {
  /** 合并了几个原始标题（用于决定是否展开子项） */
  childCount: number;
  /** 本 TOC 项涵盖的所有原始标题 id（含首位）；用于 active 高亮映射 */
  rawIds: string[];
}

export function extractChaptersForToc(markdown: string): TocChapter[] {
  const raw = extractChapters(markdown);
  if (raw.length === 0) return [];

  const merged: TocChapter[] = [];
  let i = 0;
  while (i < raw.length) {
    const cur = raw[i]!;
    const title = cur.title;
    // 规则 2：第N章/章卷节 模式 + 紧跟一个非模式短标题 → 合并为"第N章 副标题"
    if (CHAPTER_PATTERN_RE.test(title) && i + 1 < raw.length) {
      const next = raw[i + 1]!;
      const nextTitle = next.title;
      if (
        !CHAPTER_PATTERN_RE.test(nextTitle) &&
        nextTitle.length <= 12 &&
        next.level === cur.level
      ) {
        merged.push({
          id: cur.id,
          level: cur.level,
          title: `${title}　${nextTitle}`,
          childCount: 2,
          rawIds: [cur.id, next.id],
        });
        i += 2;
        continue;
      }
    }
    // 规则 1：断词合并——当前是极短标题（1 个 CJK 字），且下一个也是极短标题，逐步合并直到非短
    const cjkLen = [...title].filter((c) => /\p{Script=Han}|\p{Letter}/u.test(c)).length;
    if (cjkLen === 1 && !MEANINGFUL_SHORT.test(title) && i + 1 < raw.length) {
      const combine = [title];
      const ids = [cur.id];
      let j = i + 1;
      let lastLevel = cur.level;
      while (j < raw.length) {
        const nj = raw[j]!;
        const njCjk = [...nj.title].filter((c) => /\p{Script=Han}|\p{Letter}/u.test(c)).length;
        if (njCjk === 1 && !MEANINGFUL_SHORT.test(nj.title) && nj.level === cur.level) {
          combine.push(nj.title);
          ids.push(nj.id);
          lastLevel = nj.level;
          j++;
        } else {
          break;
        }
      }
      if (combine.length > 1) {
        merged.push({
          id: cur.id,
          level: lastLevel,
          title: combine.join(""),
          childCount: combine.length,
          rawIds: ids,
        });
        i = j;
        continue;
      }
    }
    // 规则 3：过滤无意义噪声标题（单字且非白名单）——不放入 TOC，但保留正文
    if (cjkLen === 1 && !MEANINGFUL_SHORT.test(title)) {
      i++;
      continue;
    }
    merged.push({ ...cur, childCount: 1, rawIds: [cur.id] });
    i++;
  }
  return merged;
}
