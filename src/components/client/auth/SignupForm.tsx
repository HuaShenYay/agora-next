// ====================
// SignupForm (client)
// ====================

"use client";

import { useState, useTransition } from "react";
import { signupAction } from "@/app/login/actions";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await signupAction(fd);
      if (!r.ok && r.error) setError(r.error);
    });
  };

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <div className="form-group">
        <label>昵称（可选）</label>
        <input type="text" name="displayName" placeholder="如：柏拉图译者" autoComplete="nickname" />
      </div>
      <div className="form-group">
        <label>邮箱</label>
        <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
      </div>
      <div className="form-group">
        <label>密码（≥6 位）</label>
        <input type="password" name="password" required minLength={6} autoComplete="new-password" placeholder="••••••••" />
      </div>
      {error && <div className="upload-error">{error}</div>}
      <button type="submit" className="upload-submit" disabled={isPending}>
        {isPending ? "创建中…" : "创建账号"}
      </button>
    </form>
  );
}
