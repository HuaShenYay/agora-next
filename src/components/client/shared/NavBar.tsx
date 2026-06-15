"use client";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { logoutAction } from "@/app/login/actions";

interface NavUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export default function NavBar() {
  const [user, setUser] = useState<NavUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }: { data: { user: { id: string; email?: string | null } | null } }) => {
      const u = data.user;
      if (!mounted) return;
      if (!u) {
        setUser(null);
        return;
      }
      // 拉 profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", u.id)
        .single();
      setUser({
        id: u.id,
        email: u.email ?? "",
        displayName: profile?.display_name ?? u.email?.split("@")[0] ?? "Anonymous",
        avatarUrl: profile?.avatar_url ?? null,
      });
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event: string, session: { user?: { id: string; email?: string | null } | null } | null) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", session.user.id)
        .single();
      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        displayName: profile?.display_name ?? session.user.email?.split("@")[0] ?? "Anonymous",
        avatarUrl: profile?.avatar_url ?? null,
      });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isHome = typeof location !== "undefined" && location.pathname === "/";
  if (isHome) return null;

  const logout = () => {
    startTransition(async () => {
      await logoutAction();
    });
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
        </div>
        <div className="nav-user">
          {user ? (
            <div className="nav-user-menu">
              <button className="nav-user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.displayName} className="nav-avatar-img" />
                ) : (
                  <span className="nav-avatar">{user.displayName.charAt(0).toUpperCase()}</span>
                )}
                <span className="nav-username">{user.displayName}</span>
              </button>
              {menuOpen && (
                <div className="nav-dropdown" onMouseLeave={() => setMenuOpen(false)}>
                  <div className="nav-dropdown-label">{user.email}</div>
                  <Link href="/account" className="nav-dropdown-item" onClick={() => setMenuOpen(false)}>
                    账号设置
                  </Link>
                  <hr className="nav-dropdown-divider" />
                  <button
                    onClick={logout}
                    className="nav-dropdown-item nav-dropdown-item--danger"
                    disabled={isPending}
                  >
                    {isPending ? "退出中…" : "退出"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-login-btns">
              <Link href="/login" className="btn btn-sm">登录</Link>
              <Link href="/signup" className="btn btn-sm btn-outline">注册</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
