import BookUploadForm from "@/components/client/books/BookUploadForm";

export default function UploadPage() {
  return (
    <div className="page-container">
      <div className="page-header"><h1>上传学术书籍</h1><p>上传 PDF、EPUB、TXT 或 Markdown 格式的学术经典，系统将自动解析章节并交由 AI 归类。</p></div>
      <BookUploadForm />
    </div>
  );
}
