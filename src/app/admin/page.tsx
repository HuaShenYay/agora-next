import Link from "next/link";
import { getCurrentUserServer } from "@/lib/auth/auth";
import { getBookCount } from "@/lib/db/books";
import { getAllCategories } from "@/lib/db/categories";

export default async function AdminPage() {
  const user = await getCurrentUserServer();
  if (!user || user.role !== "admin") {
    return <div className="page-container"><div className="page-error"><h2>需要管理员权限</h2><p>请以管理员身份登录后访问</p><Link href="/books" className="btn btn-outline">返回书库</Link></div></div>;
  }

  let totalBooks = 0, totalCategories = 0;
  try { const [count, cats] = await Promise.all([getBookCount(), getAllCategories()]); totalBooks = count; totalCategories = cats.length; } catch {}

  return (
    <div className="page-container admin-page">
      <div className="page-header"><h1>管理后台</h1><p>官方管理员控制面板</p></div>
      <div className="admin-stats">
        <div className="admin-stat-card"><span className="stat-value">{totalBooks}</span><span className="stat-label">书籍总数</span></div>
        <div className="admin-stat-card"><span className="stat-value">{totalCategories}</span><span className="stat-label">学科分类</span></div>
      </div>
      <div className="admin-nav">
        <Link href="/admin/categories" className="admin-nav-card"><h3>分类管理</h3><p>管理学科分类体系，设置推荐分类</p></Link>
        <Link href="/books" className="admin-nav-card"><h3>书库管理</h3><p>浏览和管理所有书籍</p></Link>
      </div>
    </div>
  );
}
