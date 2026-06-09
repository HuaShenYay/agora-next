// ====================
// 演示数据种子
// 改用 PostgreSQL + Supabase Storage
// ====================

import type { Book, Chapter, Translation } from "@/lib/utils/types";
import { DEFAULT_CATEGORIES } from "@/lib/utils/constants";
import { saveBook } from "@/lib/db/books";
import { saveChapterMeta, saveChapterContent } from "@/lib/db/chapters";
import { saveTranslation, saveTranslationChapterContent } from "@/lib/db/translations";
import { saveCategory } from "@/lib/db/categories";
import { getBookCount } from "@/lib/db/books";

// ====================
// 演示数据
// ====================

interface SeedBook {
  book: Book;
  chapters: Array<{ chapter: Chapter; content: string }>;
  translations?: Array<{
    translation: Translation;
    chapters: Array<{ chapterIndex: number; content: string }>;
  }>;
}

const DEMO_BOOKS: SeedBook[] = [
  {
    book: {
      id: "demo-principia",
      title: "自然哲学的数学原理",
      titleOriginal: "Philosophiæ Naturalis Principia Mathematica",
      author: "Isaac Newton",
      description: "牛顿的《自然哲学的数学原理》是科学史上最重要的著作之一，奠定了经典力学的基础。",
      format: "markdown",
      language: "la",
      categories: ["physics", "mathematics"],
      tags: ["经典力学", "物理学", "数学"],
      chapterCount: 2,
      uploaderId: "demo-admin",
      forkCount: 2,
      prCount: 0,
      mergedPrCount: 0,
      status: "active",
      classificationStatus: "done",
      aiClassification: {
        primary: "physics",
        confidence: 0.98,
        suggested: ["physics", "mathematics"],
        tags: ["经典力学", "物理学"],
        summary: "经典力学奠基之作，包含三大运动定律和万有引力定律。",
      },
      createdAt: new Date("2024-01-15").toISOString(),
      updatedAt: new Date("2024-02-20").toISOString(),
    },
    chapters: [
      {
        chapter: {
          id: "demo-principia-ch-0",
          bookId: "demo-principia",
          index: 0,
          title: "论物体的运动（定义）",
          wordCount: 180,
        },
        content: `# 定义

## 定义一
物质的量是物质的度量，可由其密度和体积共同求出。

## 定义二
运动的量是运动的度量，可由速度和物质的量共同求出。

## 定义三
物质的固有力（vis insita）是物质的一种倾向性，它使任何物体除非受到外力作用，否则保持其静止或匀速直线运动状态。

## 定义四
外力是对物体施加的作用，以改变其运动或静止状态。`,
      },
      {
        chapter: {
          id: "demo-principia-ch-1",
          bookId: "demo-principia",
          index: 1,
          title: "运动的基本定律",
          wordCount: 150,
        },
        content: `# 运动的基本定律

## 定律一
每个物体都保持其静止或匀速直线运动的状态，除非有外力作用于其上迫使它改变那个状态。

## 定律二
运动的变化与所加的动力成正比，并且发生在力所加的那条直线方向上。

## 定律三
对于每一个作用，总有一个等量反向的反作用；或者说，两个物体彼此之间的相互作用大小相等、方向相反。`,
      },
    ],
    translations: [
      {
        translation: {
          id: "tr-principia-zh-001",
          bookId: "demo-principia",
          forkedBy: "demo-translator",
          targetLanguage: "zh-CN",
          name: "自然哲学的数学原理（中文译本）",
          description: "经典力学奠基之作的中文翻译",
          status: "active",
          progress: 50,
          createdAt: new Date("2024-02-01").toISOString(),
          updatedAt: new Date("2024-02-10").toISOString(),
        },
        chapters: [
          {
            chapterIndex: 0,
            content: `# 定义

## 定义一
物质的量是物质的度量，可由其密度和体积共同求出。

> 译者注：此处"物质的量"即现代物理学中的"质量"概念。

## 定义二
运动的量是运动的度量，可由速度和物质的量共同求出。

> 译者注：即现代所谓的"动量"，p = mv。`,
          },
        ],
      },
    ],
  },
  {
    book: {
      id: "demo-republic",
      title: "理想国",
      titleOriginal: "Πολιτεία",
      author: "Plato",
      description: "柏拉图的《理想国》探讨了正义、理想政治制度、灵魂的本质等核心哲学问题。",
      format: "markdown",
      language: "grc",
      categories: ["philosophy"],
      tags: ["古希腊哲学", "政治哲学", "伦理学"],
      chapterCount: 2,
      uploaderId: "demo-admin",
      forkCount: 0,
      prCount: 0,
      mergedPrCount: 0,
      status: "active",
      classificationStatus: "done",
      aiClassification: {
        primary: "philosophy",
        confidence: 0.99,
        suggested: ["philosophy"],
        tags: ["古希腊哲学", "政治哲学"],
        summary: "柏拉图最重要的哲学对话录，探讨正义与理想政治。",
      },
      createdAt: new Date("2024-01-20").toISOString(),
      updatedAt: new Date("2024-03-01").toISOString(),
    },
    chapters: [
      {
        chapter: {
          id: "demo-republic-ch-0",
          bookId: "demo-republic",
          index: 0,
          title: "第一卷：什么是正义",
          wordCount: 200,
        },
        content: `# 第一卷

我昨天和阿里斯同的儿子格劳孔一起下到比雷埃夫斯港，向女神祈祷，同时也想看看他们将如何举办节日。

当我们到达后，我们先去了女神的庙宇，进行了祈祷。然后，克法洛斯的儿子波勒马库斯从远处看见我们，派他的仆人跑来请我们留下。

苏格拉底，你们要往哪里去？他说。
我说：我们要回城里去。
波勒马库斯说：你们看见我们有多少人吗？你们要么留下来，要么就得证明你们比我们更强。`,
      },
      {
        chapter: {
          id: "demo-republic-ch-1",
          bookId: "demo-republic",
          index: 1,
          title: "第二卷：正义的起源",
          wordCount: 250,
        },
        content: `# 第二卷

格劳孔和阿德曼图斯接着提出了更深入的问题。

格劳孔说：苏格拉底，你真的相信正义在任何情况下都比不正义好吗？还是你只是表面上这么说？

我说：我确实相信正义本身是最好的，但我承认这个问题值得更深入的探讨。

那么让我来为你讲述正义的起源，格劳孔说。人们说，做不正义的事自然是好的，但遭受不正义是坏的。当人们既做过不正义又受过不正义的苦之后，他们发现最好的办法是达成协议，既不做不正义的事，也不受不正义的害。`,
      },
    ],
    translations: [
      {
        translation: {
          id: "tr-republic-zh-001",
          bookId: "demo-republic",
          forkedBy: "demo-admin",
          targetLanguage: "zh-CN",
          name: "理想国（中文译本）",
          description: "柏拉图《理想国》中文翻译项目",
          status: "active",
          progress: 0,
          createdAt: new Date("2024-03-01").toISOString(),
          updatedAt: new Date("2024-03-01").toISOString(),
        },
        chapters: [],
      },
    ],
  },
];

// ====================
// 种子函数
// ====================

export async function seedDemoData(): Promise<void> {
  console.log("🌱 Seeding demo data...");

  try {
    // 1. 初始化分类
    const totalBooks = await getBookCount();
    if (totalBooks === 0) {
      // 初始化默认分类
      for (const cat of DEFAULT_CATEGORIES) {
        await saveCategory({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          parentId: undefined,
          sortOrder: cat.sortOrder,
          featured: cat.id === "physics" || cat.id === "philosophy",
          createdAt: new Date().toISOString(),
        });
      }
      console.log(`✅ Seeded ${DEFAULT_CATEGORIES.length} categories`);
    }

    // 2. 初始化书籍
    for (const item of DEMO_BOOKS) {
      // 检查是否已存在
      const { getBook } = await import("./books");
      const existing = await getBook(item.book.id);
      if (existing) {
        console.log(`⏭️  Book already exists: ${item.book.title}`);
        continue;
      }

      // 保存书籍元数据
      await saveBook(item.book);

      // 保存章节元数据和内容
      for (const { chapter, content } of item.chapters) {
        await saveChapterMeta(chapter);
        await saveChapterContent(item.book.id, chapter.index, content);
      }

      // 保存翻译项目和译文内容
      if (item.translations) {
        for (const { translation, chapters } of item.translations) {
          await saveTranslation(item.book.id, translation);
          for (const ch of chapters) {
            await saveTranslationChapterContent(
              item.book.id,
              translation.id,
              ch.chapterIndex,
              ch.content,
            );
          }
        }
      }

      console.log(`✅ Seeded book: ${item.book.title}`);
    }

    console.log("🎉 Demo data seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}
