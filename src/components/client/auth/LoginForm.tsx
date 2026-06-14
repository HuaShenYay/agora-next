// ====================
// LoginForm (client)
// ====================

"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/login/actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await loginAction(fd);
      if (!r.ok && r.error) setError(r.error);
    });
  };

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <div className="form-group">
        <label>邮箱</label>
        <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
      </div>
      <div className="form-group">
        <label>密码</label>
        <input type="password" name="password" required autoComplete="current-password" placeholder="••••••••" />
      </div>
      {error && <div className="upload-error">{error}</div>}
      <button type="submit" className="upload-submit" disabled={isPending}>
        {isPending ? "登录中…" : "登录"}
      </button>
    </form>
  );
}
