// ====================
// Supabase Storage 操作封装（二进制文件）
// ====================

import { getSupabase } from "./client";

const BUCKET = "agora-books";

export async function storageUpload(
  path: string,
  data: Uint8Array | string,
  contentType = "application/octet-stream",
  _maxSize = Infinity,
): Promise<void> {
  void _maxSize;
  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, data as unknown as ArrayBuffer, {
      contentType,
      upsert: true,
    });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
}

export async function storageDownload(path: string): Promise<Uint8Array | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  const buf = await data.arrayBuffer();
  return new Uint8Array(buf);
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

/** 生成 Supabase Storage 公共访问 URL（用于前端 iframe/object 直接读） */
export function storagePublicUrl(path: string): string {
  const supabase = getSupabase();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
