import Link from "next/link";
import { getPR } from "@/lib/db/prs";
import DiffViewer from "@/components/client/pr/DiffViewer";

export default async function PRDetailPage({ params, searchParams }: { params: Promise<{ prId: string }>; searchParams: Promise<{ bookId?: string }> }) {
  const { prId } = await params;
  const { bookId = "" } = await searchParams;

  let pr = null;
  if (bookId) { try { pr = await getPR(bookId, prId); } catch {} }

  if (!pr) {
    return <div className="page-container"><div className="page-error"><h2>PR 不存在</h2><Link href="/books" className="btn btn-outline">返回书库</Link></div></div>;
  }

  const statusLabels: Record<string, string> = { open: "开放", reviewing: "评审中", merged: "已合并", closed: "已关闭", rejected: "已拒绝" };

  return (
    <div className="page-container pr-detail-page">
      <div className="pr-header">
        <div className="pr-header-top">
          <h1>{pr.title}</h1>
          <span className={`pr-status-badge status-${pr.status}`}>{statusLabels[pr.status] ?? pr.status}</span>
        </div>
        {pr.description && <p className="pr-description">{pr.description}</p>}
        <div className="pr-meta">
          <span>创建时间：{new Date(pr.createdAt).toLocaleString()}</span>
          {pr.mergedAt && <span>合并时间：{new Date(pr.mergedAt).toLocaleString()}</span>}
          <span>涉及 {pr.chapterIds.length} 个章节</span>
        </div>
      </div>
      <div className="pr-diff-section"><h3>变更对比</h3><DiffViewer diffSnapshot={pr.diffSnapshot} /></div>
      {pr.reviewComments.length > 0 && (
        <div className="pr-comments">
          <h3>评审评论 ({pr.reviewComments.length})</h3>
          {pr.reviewComments.map((comment: { id: string; content: string; createdAt: string }) => (
            <div key={comment.id} className="pr-comment"><p>{comment.content}</p><span className="comment-time">{new Date(comment.createdAt).toLocaleString()}</span></div>
          ))}
        </div>
      )}
      <div className="pr-actions"><Link href={`/books/${bookId}`} className="btn btn-outline">返回书籍</Link></div>
    </div>
  );
}
