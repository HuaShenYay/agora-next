// ====================
// AccountForm (client) — 改名 / 改 bio / 改头像
// ====================

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  initialDisplayName: string;
  initialBio: string;
  initialAvatarUrl: string;
}

export function AccountForm({ initialDisplayName, initialBio, initialAvatarUrl }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(`保存失败: ${data.error ?? res.status}`);
      } else {
        setMsg("已保存");
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setMsg(`网络错误: ${err instanceof Error ? err.message : err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <div className="form-group">
        <label>头像 URL</label>
        <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
        {avatarUrl && (
          <div style={{ marginTop: "0.6rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt="avatar preview" style={{ width: 64, height: 64, objectFit: "cover", border: "2px solid var(--text-primary)" }} />
          </div>
        )}
      </div>
      <div className="form-group">
        <label>昵称</label>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={64} />
      </div>
      <div className="form-group">
        <label>自我介绍</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={500} placeholder="研究方向 / 翻译领域 / 一句话" />
      </div>
      {msg && <div className="upload-error" style={msg === "已保存" ? { background: "rgba(180,200,150,0.15)", color: "var(--accent-olive)" } : undefined}>{msg}</div>}
      <button type="submit" className="upload-submit" disabled={saving}>
        {saving ? "保存中…" : "保存"}
      </button>
    </form>
  );
}
