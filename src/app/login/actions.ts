// ====================
// Auth server actions：登录 / 注册 / 退出
// ====================

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { ok: false, error: "请输入邮箱和密码" };
  }
  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/", "layout");
  redirect("/books");
}

export async function signupAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim() || email.split("@")[0];
  if (!email || !password) {
    return { ok: false, error: "请输入邮箱和密码" };
  }
  if (password.length < 6) {
    return { ok: false, error: "密码至少 6 位" };
  }
  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  // 演示模式：邮箱验证关闭时，supabase 会直接返回 session；
  // 若开启邮箱验证，profile trigger 仍会在首次登录时建好
  revalidatePath("/", "layout");
  redirect("/books");
}

export async function logoutAction(): Promise<void> {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
