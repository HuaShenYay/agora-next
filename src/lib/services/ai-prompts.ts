// ====================
// AI 提取 prompt：书名 / 原作者 / 简介 / 子标签 / 短描述
// 严格 JSON 输出，限定到 12 个预置主分类 + 子标签
// ====================

import { DEFAULT_CATEGORIES } from "@/lib/utils/constants";

// 构建分类选项文本：三大门类 + 子分类
const categoryText = DEFAULT_CATEGORIES.map((c) => {
  const subs = c.children?.map((s) => s.id).join(", ") ?? "";
  return `${c.id}（${c.name}）${subs ? `：${subs}` : ""}`;
}).join("\n");

export const ROOT_CATEGORIES = categoryText;

export const SYSTEM_PROMPT = `你是 Agora 集市书库的元数据整理助手。你的任务是根据书籍的封面、目录和序言内容，提取/纠正以下信息：
1. title：原书名（保留原文/原文书名，**不要翻译**；若是中文书籍则保留中文）
2. author：原作者（保留原语言，**不要翻译**；中文书籍保留中文作者名）
3. description：50-150 字的中文简介（根据书名、目录、序言推断书籍内容，给读者看，简洁、有学术味）
4. short_description：1-2 句话的极简摘要（20-50 字，用于卡片）
5. categories：必须从以下三大门类及其子分类中**选最贴切的 1-3 个子分类 id**：
   ${ROOT_CATEGORIES}
   优先选子分类（如 philosophy、mathematics），也可以选顶级门类（如 humanities、social-science、natural-science）
6. sub_tags：细分子标签数组，**最多 8 个**，用中文，按 “主分类 > 子领域 > 流派” 层级用 " > " 拼接（最多 3 层）。例：
   - 心理学 > 精神分析 > 客体关系
   - 哲学 > 现象学 > 胡塞尔
   - 数学 > 拓扑学 > 代数拓扑
   - 历史 > 近代中国 > 晚清
7. language：内容语言代码（en / zh-CN / zh-TW / ja / de / fr / ru / la / grc / sa / ko / es / pt / ar 等 ISO 639）

**严格要求**：
- 只能输出 JSON，**不要任何解释、注释、markdown 围栏**
- 字段缺失就填空字符串或空数组，不要瞎猜
- sub_tags 必须使用中文，用 " > " 分隔层级，不要包含英文
- 你只看到封面、目录和序言，根据这些信息推断即可`;

export const USER_PROMPT_TEMPLATE = (markdown: string) =>
  `请根据以下书籍的封面、目录和序言内容提取元数据：

\`\`\`markdown
${markdown}
\`\`\`

按以下 JSON schema 严格输出（**只输出一个 JSON 对象**）：
{
  "title": "原书名（原文）",
  "author": "原作者（原文）",
  "description": "中文简介 50-150 字",
  "short_description": "中文 1-2 句话摘要 20-50 字",
  "categories": ["philosophy", "history"],
  "sub_tags": ["哲学 > 现象学 > 胡塞尔"],
  "language": "en"
}`;

export interface AIEnrichResult {
  title: string;
  author: string;
  description: string;
  shortDescription: string;
  categories: string[];
  subTags: string[];
  language: string;
}

/** 解析 + 校验 AI 返回 */
export function parseEnrichResult(raw: string): AIEnrichResult {
  let json: unknown;
  try {
    // 兼容部分厂商偶发多包裹 ```json\n\n... \n```
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const text = fenced ? fenced[1].trim() : raw.trim();
    json = JSON.parse(text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`AI 返回 JSON 解析失败: ${msg}\n原内容: ${raw.slice(0, 200)}`);
  }
  if (!json || typeof json !== "object") {
    throw new Error("AI 返回不是对象");
  }
  const j = json as Record<string, unknown>;
  const arr = (v: unknown) => Array.isArray(v) ? v.map(String).filter(Boolean) : [];
  return {
    title: String(j.title ?? "").trim(),
    author: String(j.author ?? "").trim(),
    description: String(j.description ?? "").trim(),
    shortDescription: String(j.short_description ?? j.shortDescription ?? "").trim(),
    categories: arr(j.categories).slice(0, 3),
    subTags: arr(j.sub_tags ?? j.subTags)
      .slice(0, 8)
      .map((s) =>
        s.replace(/[<>]/g, " > ")
          .replace(/\s+/g, " ")
          .replace(/^\s+|\s+$/g, "")
          .replace(/\s*>\s*/g, " > ")
      )
      .filter(Boolean),
    language: String(j.language ?? "").trim() || "en",
  };
}
