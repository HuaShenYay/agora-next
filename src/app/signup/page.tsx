// ====================
// 注册页
// ====================

import Link from "next/link";
import { SignupForm } from "@/components/client/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-head">
          <span className="auth-eyebrow">SIGN UP / 注册</span>
        </div>
        <h1 className="auth-title">加入集市</h1>
        <p className="auth-subtitle">3 秒钟搞定 · 用邮箱即可</p>
        <SignupForm />
        <p className="auth-foot">
          已有账号？<Link href="/login" className="auth-link">去登录 →</Link>
        </p>
      </div>
    </div>
  );
}
