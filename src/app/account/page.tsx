// ====================
// Account 页面：编辑 display_name / bio / avatar_url
// 必须在登录态下访问
// ====================

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AccountForm } from "@/components/client/auth/AccountForm";

export default async function AccountPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-card-head">
          <span className="auth-eyebrow">ACCOUNT / 账号</span>
        </div>
        <h1 className="auth-title">个人资料</h1>
        <p className="auth-subtitle">邮箱：{user.email}</p>
        <AccountForm
          initialDisplayName={profile?.display_name ?? ""}
          initialBio={profile?.bio ?? ""}
          initialAvatarUrl={profile?.avatar_url ?? ""}
        />
      </div>
    </div>
  );
}
