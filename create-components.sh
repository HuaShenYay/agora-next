#!/bin/bash
set -e
BASE="/Users/hsy/Work/mvp/agora-next/src/components/client"

# 1. NavBar
cat > "$BASE/shared/NavBar.tsx" << 'EOF'
"use client";
import { useEffect, useState } from "react";

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
        <a href="/books" className="nav-brand">
          <span className="nav-logo-mark">集</span>
          <span className="nav-logo-text">集市 AGORA</span>
        </a>
        <div className="nav-links">
          <a href="/books" className="nav-link">书库</a>
          <a href="/books/upload" className="nav-link">上传</a>
          {user?.role === "admin" && (
            <a href="/admin" className="nav-link nav-link--admin">管理</a>
          )}
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
EOF

# 2. Modal
cat > "$BASE/shared/Modal.tsx" << 'EOF'
"use client";
import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  if (!isOpen) return null;
  const sizeClass = { sm: "modal-sm", md: "modal-md", lg: "modal-lg" }[size];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${sizeClass}`} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="modal-close" onClick={onClose} aria-label="关闭">&times;</button>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
EOF

# 3. Pagination
cat > "$BASE/shared/Pagination.tsx" << 'EOF'
"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages: (number | string)[] = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return (
    <nav className="pagination" aria-label="分页导航">
      <button className="pagination-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>&lsaquo; 上一页</button>
      <div className="pagination-pages">
        {pages.map((page, idx) =>
          typeof page === "string"
            ? <span key={`ellipsis-${idx}`} className="pagination-ellipsis">&hellip;</span>
            : <button key={page} className={`pagination-btn ${page === currentPage ? "active" : ""}`} onClick={() => onPageChange(page as number)}>{page}</button>
        )}
      </div>
      <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>下一页 &rsaquo;</button>
    </nav>
  );
}
EOF

# 4. Toast
cat > "$BASE/shared/Toast.tsx" << 'EOF'
"use client";
import { useState, useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";
interface ToastItem { id: number; message: string; type: ToastType; }

let toastId = 0;
const listeners: Array<(toast: ToastItem) => void> = [];

export function showToast(message: string, type: ToastType = "info") {
  const toast: ToastItem = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(toast));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => {
    const handler = (toast: ToastItem) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), 4000);
    };
    listeners.push(handler);
    return () => { const idx = listeners.indexOf(handler); if (idx >= 0) listeners.splice(idx, 1); };
  }, []);
  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>&times;</button>
        </div>
      ))}
    </div>
  );
}
EOF

echo "shared components done"
