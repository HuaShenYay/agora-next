import BookUploadForm from "@/components/client/books/BookUploadForm";

export default function UploadPage() {
  return (
    <div className="upload-page">
      <header className="upload-page-header">
        <h1 className="upload-page-title">
          上传<span className="upload-page-title-accent">书籍</span>
        </h1>
        <p className="upload-page-desc">
          拖入文件即可——书名、作者、简介、子分类全部由 AI 从正文自动提取。
        </p>
      </header>
      <BookUploadForm />
    </div>
  );
}
