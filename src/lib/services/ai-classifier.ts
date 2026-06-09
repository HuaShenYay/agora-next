// ====================
// AI 学科分类服务（Google Gemini API）
// ====================

import { getBook, saveBook, updateBooksIndexSummary } from "@/lib/db/books";
import { getChapterContent } from "@/lib/db/chapters";
import type { AIClassification } from "@/lib/utils/types";
import { DEFAULT_CATEGORIES } from "@/lib/utils/constants";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const CATEGORY_LIST = DEFAULT_CATEGORIES.map((c) => `${c.name}（${c.description}）`).join("\n");

function buildPrompt(title: string, author: string, language: string, text: string): string {
  return `你是一位学术文献分类专家。请分析以下学术书籍的内容片段，判断其所属学科分类。

学科分类体系：
${CATEGORY_LIST}

书籍信息：
标题：${title}
作者：${author}
语言：${language}

内容片段：
${text}

请严格以 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "primary": "主分类ID（从以下选择：${DEFAULT_CATEGORIES.map((c) => c.id).join(", ")}）",
  "confidence": 0.0到1.0之间的数字,
  "suggested": ["建议分类ID1", "建议分类ID2"],
  "tags": ["关键词标签1", "关键词标签2", "关键词标签3"],
  "summary": "50字以内的中文内容摘要"
}`;
}

export async function classifyBook(bookId: string): Promise<AIClassification | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY 未配置，跳过 AI 分类");
    return null;
  }

  const book = await getBook(bookId);
  if (!book) return null;

  // 标记为处理中
  book.classificationStatus = "processing";
  await saveBook(book);

  try {
    // 提取前 3 章内容（最多 5000 字）
    let textSample = "";
    const maxChapters = Math.min(3, book.chapterCount);
    for (let i = 0; i < maxChapters; i++) {
      const content = await getChapterContent(bookId, i);
      if (content) {
        textSample += content + "\n\n";
        if (textSample.length >= 5000) {
          textSample = textSample.slice(0, 5000);
          break;
        }
      }
    }

    if (textSample.length < 100) {
      book.classificationStatus = "failed";
      await saveBook(book);
      return null;
    }

    const prompt = buildPrompt(book.title, book.author, book.language, textSample);

    // 调用 Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      book.classificationStatus = "failed";
      await saveBook(book);
      return null;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // 解析 JSON 响应
    let classification: AIClassification;
    try {
      // 清理可能的 markdown 代码块
      const cleaned = rawText.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
      classification = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Gemini response:", rawText);
      book.classificationStatus = "failed";
      await saveBook(book);
      return null;
    }

    // 更新书籍
    book.aiClassification = classification;
    book.categories = [
      classification.primary,
      ...(classification.suggested || []),
    ].filter(Boolean);
    book.tags = [...new Set([...book.tags, ...(classification.tags || [])])];
    book.classificationStatus = "done";
    await saveBook(book);

    // 更新索引
    await updateBooksIndexSummary(bookId, {
      categories: book.categories,
      tags: book.tags,
      classificationStatus: "done",
      aiClassification: classification,
    });

    return classification;
  } catch (err) {
    console.error("Classification error:", err);
    book.classificationStatus = "failed";
    await saveBook(book);
    return null;
  }
}
