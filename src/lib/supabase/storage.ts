// ====================
// Supabase Storage 操作封装
// ====================

import { getSupabase } from "./client";

const BUCKET = "agora-chapters";

export async function storageUpload(
  path: string,
  content: string,
  contentType = "text/markdown",
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, content, {
      contentType,
      upsert: true,
    });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
}

export async function storageDownload(path: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(path);
  if (error || !data) return null;
  return await data.text();
}

export async function storageDelete(path: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.storage.from(BUCKET).remove([path]);
}

export async function storageList(prefix: string): Promise<string[]> {
  const supabase = getSupabase();
  const folder = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(folder, { limit: 1000 });
  if (error || !data) return [];
  return data.map((f) => `${folder}/${f.name}`);
}
