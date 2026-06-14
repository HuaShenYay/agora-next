// ====================
// 用户 Profile 数据库操作
// ====================

import { getSupabase } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  createdAt: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!userId || userId === "anonymous") return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, created_at")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return {
    id: data.id as string,
    displayName: (data.display_name as string) ?? "Anonymous",
    avatarUrl: (data.avatar_url as string | null) ?? null,
    bio: (data.bio as string) ?? "",
    createdAt: (data.created_at as string) ?? new Date().toISOString(),
  };
}

export async function getBooksCountByUploader(userId: string): Promise<number> {
  if (!userId || userId === "anonymous") return 0;
  const supabase = getSupabase();
  const { count } = await supabase
    .from("books")
    .select("id", { count: "exact", head: true })
    .eq("uploader_id", userId)
    .eq("status", "active");
  return count ?? 0;
}
