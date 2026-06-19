// ====================
// 登录页
// ====================

import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/client/auth/LoginForm";

export const metadata: Metadata = {
  title: "登录",
  description: "登录集市 Agora 账户",
};

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-head">
          <span className="auth-eyebrow">SIGN IN / 登录</span>
        </div>
        <h1 className="auth-title">回到集市</h1>
        <p className="auth-subtitle">登录后可上传书籍、追踪你的贡献。</p>
        <LoginForm />
        <p className="auth-foot">
          还没有账号？<Link href="/signup" className="auth-link">立即注册 →</Link>
        </p>
      </div>
    </div>
  );
}
