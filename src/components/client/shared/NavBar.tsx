"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserInfo {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

export default function NavBar() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/demo")
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const isHome = typeof location !== "undefined" && location.pathname === "/";
  if (isHome) return null;

  const login = async (role: string) => {
    const res = await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      setMenuOpen(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
    location.href = "/";
  };

  const roleLabels: Record<string, string> = {
    admin: "管理员",
    translator: "译者",
    viewer: "访客",
  };

  return (
    <nav className="agora-nav">
      <div className="nav-inner">
        <Link href="/books" className="nav-brand">
          <span className="nav-logo-mark">集</span>
          <span className="nav-logo-text">集市 AGORA</span>
        </Link>
        <div className="nav-links">
          <Link href="/books" className="nav-link">书库</Link>
          <Link href="/books/upload" className="nav-link">上传</Link>
        </div>
        <div className="nav-user">
          {user ? (
            <div className="nav-user-menu">
              <button className="nav-user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <span className="nav-avatar">{user.displayName.charAt(0)}</span>
                <span className="nav-username">{user.displayName}</span>
                <span className="nav-role-badge">{roleLabels[user.role] ?? user.role}</span>
              </button>
              {menuOpen && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-label">切换身份</div>
                  <button onClick={() => login("admin")} className="nav-dropdown-item">管理员</button>
                  <button onClick={() => login("translator")} className="nav-dropdown-item">译者</button>
                  <button onClick={() => login("viewer")} className="nav-dropdown-item">访客</button>
                  <hr className="nav-dropdown-divider" />
                  <button onClick={logout} className="nav-dropdown-item nav-dropdown-item--danger">退出</button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-login-btns">
              <button onClick={() => login("translator")} className="btn btn-sm">以译者进入</button>
              <button onClick={() => login("admin")} className="btn btn-sm btn-outline">管理员</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
