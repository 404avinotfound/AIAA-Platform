"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  User as UserIcon,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Megaphone,
  Bell,
  MessageCircle,
} from "lucide-react";
import { navLinks } from "../data/content";
import { useAuth } from "../lib/AuthContext";
import { api, mediaUrl } from "../lib/api";

// Polls the unread-message count for the bell icon. A simple interval is
// enough here - the count also refreshes whenever the person opens a
// conversation (the backend marks those messages read at that point).
function useUnreadCount(user) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }
    let cancelled = false;
    function load() {
      api
        .get("/social/unread-count")
        .then(({ data }) => {
          if (!cancelled) setCount(data.count || 0);
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  return count;
}

function NotificationBell({ user }) {
  const router = useRouter();
  const count = useUnreadCount(user);

  return (
    <button
      onClick={() => router.push("/messages")}
      aria-label="Messages"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-cream hover:bg-navy-light"
    >
      <Bell size={16} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

function AccountMenu({ user, member, logout }) {
  const [open, setOpen] = useState(false);
  const isAdmin = ["admin", "super_admin"].includes(user.role);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1.5 text-sm text-cream hover:bg-navy-light"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(user.avatarUrl)} alt="" className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <UserIcon size={16} className="text-gold" />
        )}
        {user.fullName?.split(" ")[0] || "Profile"}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-52 rounded-lg border border-ink/10 bg-white py-2 text-sm text-ink shadow-card"
          onMouseLeave={() => setOpen(false)}
        >
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-navy/5" onClick={() => setOpen(false)}>
            <LayoutDashboard size={15} /> Dashboard
          </Link>
          <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-navy/5" onClick={() => setOpen(false)}>
            <UserIcon size={15} /> Edit Profile
          </Link>
          <Link href="/messages" className="flex items-center gap-2 px-4 py-2 hover:bg-navy/5" onClick={() => setOpen(false)}>
            <MessageCircle size={15} /> Messages
          </Link>
          {member?.status === "active" && (
            <Link href="/membership/hub" className="flex items-center gap-2 px-4 py-2 hover:bg-navy/5" onClick={() => setOpen(false)}>
              <Megaphone size={15} /> Membership Hub
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-navy/5" onClick={() => setOpen(false)}>
              <ShieldCheck size={15} /> Admin Panel
            </Link>
          )}
          {member?.status !== "active" && (
            <Link href="/membership" className="flex items-center gap-2 px-4 py-2 font-semibold text-gold-dim hover:bg-navy/5" onClick={() => setOpen(false)}>
              Become a Member
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-maroon hover:bg-maroon/5"
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, member, loading, logout } = useAuth();

  function handleSearch(e) {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="hidden bg-navy-deep text-cream/80 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-xs">
          <p className="tracking-wide">
            <span className="text-gold">यतो धर्मस्ततो जयः</span> &nbsp;·&nbsp; Equality · Liberty · Justice
          </p>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Facebook" className="hover:text-gold"><Facebook size={14} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-gold"><Twitter size={14} /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-gold"><Linkedin size={14} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-gold"><Instagram size={14} /></a>
          </div>
        </div>
      </div>

      {/* Main banner: logo, name, search, auth actions */}
      <div className="bg-navy-gradient border-b border-gold/30">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/images/logo-white.jpg"
              alt="AIAA emblem"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
              priority
            />
            <div>
              <p className="font-serif text-lg font-bold leading-tight text-gold sm:text-2xl">
                All India Advocates Associations
              </p>
              <p className="hidden text-xs tracking-[0.2em] text-cream/70 sm:block">
                EQUALITY &nbsp;·&nbsp; LIBERTY &nbsp;·&nbsp; JUSTICE
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 rounded-full border border-gold/40 bg-navy/40 px-3 py-1.5"
            >
              <button type="submit" aria-label="Search" className="text-gold/80 hover:text-gold">
                <Search size={15} />
              </button>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search the Members and Users"
                className="w-48 bg-transparent text-sm text-cream placeholder:text-cream/50 focus:outline-none"
              />
            </form>

            {!loading && user && <NotificationBell user={user} />}

            {!loading && user ? (
              <AccountMenu user={user} member={member} logout={logout} />
            ) : !loading ? (
              <>
                <Link href="/auth/login" className="rounded-full border border-gold/50 px-4 py-1.5 text-sm font-medium text-cream hover:bg-navy-light">
                  Login
                </Link>
                <Link href="/membership" className="btn-gold rounded-full px-4 py-1.5 text-sm">
                  Become a Member
                </Link>
              </>
            ) : (
              <div className="h-8 w-24" />
            )}
          </div>

          <button
            className="text-cream lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Primary navigation */}
      <nav className="hidden bg-navy lg:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 px-6 text-sm font-medium text-cream/90">
          <li><Link href="/" className="block px-3 py-3 hover:text-gold">Home</Link></li>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="block px-3 py-3 hover:text-gold">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gold/30 bg-navy-deep px-6 py-4 lg:hidden">
          <form
            onSubmit={(e) => {
              handleSearch(e);
              setMenuOpen(false);
            }}
            className="mb-4 flex items-center gap-2 rounded-full border border-gold/40 bg-navy/40 px-3 py-1.5"
          >
            <Search size={15} className="text-gold/80" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search the Members and Users"
              className="w-full bg-transparent text-sm text-cream placeholder:text-cream/50 focus:outline-none"
            />
          </form>

          <ul className="flex flex-col gap-1 text-sm text-cream/90">
            <li><Link href="/" onClick={() => setMenuOpen(false)} className="block py-2">Home</Link></li>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setMenuOpen(false)} className="block py-2">
                  {link.label}
                </Link>
              </li>
            ))}
            {user && (
              <li>
                <Link href="/messages" onClick={() => setMenuOpen(false)} className="block py-2">
                  Messages
                </Link>
              </li>
            )}
            <li className="mt-2 flex gap-3 pt-2">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="rounded-full border border-gold/50 px-4 py-1.5 text-sm">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="rounded-full border border-maroon/50 px-4 py-1.5 text-sm text-maroon"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="rounded-full border border-gold/50 px-4 py-1.5 text-sm">Login</Link>
                  <Link href="/membership" onClick={() => setMenuOpen(false)} className="btn-gold rounded-full px-4 py-1.5 text-sm">Become a Member</Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
