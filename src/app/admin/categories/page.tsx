import Link from "next/link";
import { getCurrentUserServer } from "@/lib/auth/auth";
import { getAllCategories } from "@/lib/db/categories";
import AdminCategoriesClient from "./client";

export default async function CategoriesPage() {
  const user = await getCurrentUserServer();
  if (!user || user.role !== "admin") {
    return <div className="page-container"><div className="page-error"><h2>需要管理员权限</h2><Link href="/books" className="btn btn-outline">返回书库</Link></div></div>;
  }

  let categories: Awaited<ReturnType<typeof getAllCategories>> = [];
  try { categories = await getAllCategories(); } catch {}

  return <AdminCategoriesClient categories={categories} />;
}
