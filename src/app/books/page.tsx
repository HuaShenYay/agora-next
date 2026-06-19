import { Metadata } from "next";
import BookGrid from "@/components/client/books/BookGrid";

export const metadata: Metadata = {
  title: "书库",
  description: "浏览集市 Agora 收藏的经典书籍，涵盖哲学、历史、文学、数学等领域。",
  openGraph: {
    title: "书库 | 集市 Agora",
    description: "浏览集市 Agora 收藏的经典书籍，涵盖哲学、历史、文学、数学等领域。",
  },
};

export default function BooksPage() {
  return <BookGrid />;
}
