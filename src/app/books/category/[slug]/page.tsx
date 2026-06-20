import { Metadata } from "next";
import { DEFAULT_CATEGORIES } from "@/lib/utils/constants";
import BookCategoryView from "@/components/client/books/BookCategoryView";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DEFAULT_CATEGORIES.map((cat) => ({ slug: cat.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = DEFAULT_CATEGORIES.find((c) => c.id === slug);
  const name = cat?.name ?? slug;
  return {
    title: `${name} · 书库`,
    description: `浏览集市 Agora 的${name}类经典书籍。`,
    openGraph: {
      title: `${name} · 书库 | 集市 Agora`,
      description: `浏览集市 Agora 的${name}类经典书籍。`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  return <BookCategoryView categorySlug={slug} />;
}
