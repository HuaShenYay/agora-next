import BookUploadForm from "@/components/client/books/BookUploadForm";

export default function UploadPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>上传学术书籍</h1>
        <p>支持 PDF、EPUB、TXT、Markdown。原文件将保存至书库，供在线阅读或下载。</p>
      </div>
      <BookUploadForm />
    </div>
  );
}
