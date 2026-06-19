import { Metadata } from "next";
import BookUploadForm from "@/components/client/books/BookUploadForm";
import UploadGate from "@/components/client/books/UploadGate";

export const metadata: Metadata = {
  title: "上传书籍",
  description: "上传学术经典书籍到集市 Agora 书库",
};

export default function UploadPage() {
  return (
    <div className="upload-page">
      <UploadGate>
        <header className="upload-page-header">
          <h1 className="upload-page-title">
            上传<span className="upload-page-title-accent">书籍</span>
          </h1>
          <p className="upload-page-desc">
            拖入文件即可——书名、作者、简介、子分类全部由 AI 从正文自动提取。
          </p>
        </header>
        <BookUploadForm />
      </UploadGate>
    </div>
  );
}
