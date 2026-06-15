"use client";
import { useState } from "react";

export default function UploadGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 通过 API 验证密码（不暴露密码到客户端）
    const res = await fetch("/api/upload-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      // 密码验证成功，存储到 sessionStorage 供上传表单使用
      sessionStorage.setItem("upload_password", password);
      setUnlocked(true);
      setError("");
    } else {
      setError("密码错误");
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="upload-gate">
      <form className="upload-gate-form" onSubmit={handleSubmit}>
        <div className="upload-gate-icon">🔒</div>
        <h2 className="upload-gate-title">上传权限</h2>
        <p className="upload-gate-desc">
          当前为邀请制上传阶段。<br />
          请通过交流群获取上传密码。
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          placeholder="输入上传密码"
          className="upload-gate-input"
          autoFocus
        />
        {error && <p className="upload-gate-error">{error}</p>}
        <button type="submit" className="upload-gate-btn">验证</button>
      </form>
    </div>
  );
}
