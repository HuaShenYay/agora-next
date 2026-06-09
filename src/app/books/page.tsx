import BookGrid from "@/components/client/books/BookGrid";

export default function BooksPage() {
  return (
    <div className="page-container">
      <div className="page-header"><h1>学术书库</h1><p>开源学术经典翻译协作——浏览、Fork、翻译、提交</p></div>
      <BookGrid />
    </div>
  );
}
