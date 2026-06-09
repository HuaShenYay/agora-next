"use client";
import type { Category } from "@/lib/utils/types";

export default function AdminCategoriesClient({ categories }: { categories: Category[] }) {
  const toggleFeatured = async (categoryId: string) => {
    try {
      await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle-featured", categoryId }) });
      location.reload();
    } catch { alert("操作失败"); }
  };

  return (
    <div className="page-container admin-categories-page">
      <div className="page-header"><h1>学科分类管理</h1><p>管理分类体系和推荐栏目</p></div>
      <div className="admin-categories-list">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>名称</th><th>描述</th><th>排序</th><th>推荐</th><th>操作</th></tr></thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td><code>{cat.id}</code></td><td>{cat.name}</td><td>{cat.description}</td><td>{cat.sortOrder}</td>
                <td><span className={cat.featured ? "badge-featured" : "badge-normal"}>{cat.featured ? "推荐" : "—"}</span></td>
                <td><button className="btn btn-sm btn-outline" onClick={() => toggleFeatured(cat.id)}>{cat.featured ? "取消推荐" : "设为推荐"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a href="/admin" className="btn btn-outline">← 返回管理面板</a>
    </div>
  );
}
