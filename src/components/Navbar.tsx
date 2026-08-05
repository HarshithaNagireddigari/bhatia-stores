"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCart } from "./CartContext";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { itemCount } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
    setMobileOpen(false);
  }

  const linkClass = "text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400";

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral/20 bg-white/80 backdrop-blur dark:border-neutral-dark/20 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-primary dark:text-primary-light">
          Bhatia Stores
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <form onSubmit={submitSearch} className="relative">
            <Search
              aria-hidden
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tiles..."
              className="w-48 rounded-full border border-neutral bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-500 dark:border-neutral-dark dark:bg-gray-800"
            />
          </form>
          <Link href="/shop" className={linkClass}>Shop</Link>
          <Link href="/wishlist" aria-label="Wishlist" className="relative rounded-full p-2 text-gray-600 hover:text-primary">
            ♡
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative rounded-full p-2 text-gray-600 hover:text-primary">
            🛒
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <Link href="/orders" className={linkClass}>My Orders</Link>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/login');
              router.refresh();
            }}
            className={linkClass}
          >
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded p-1 text-gray-600"
            aria-label="Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-neutral px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            <form onSubmit={submitSearch} className="relative">
              <Search aria-hidden size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tiles..."
                className="w-full rounded-xl border border-neutral bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary-500 dark:border-neutral-dark dark:bg-gray-800"
              />
            </form>
            <Link href="/shop" className={linkClass} onClick={() => setMobileOpen(false)}>Shop</Link>
            <Link href="/wishlist" className={linkClass} onClick={() => setMobileOpen(false)}>♡ Wishlist</Link>
            <Link href="/cart" className={linkClass} onClick={() => setMobileOpen(false)}>🛒 Cart ({itemCount})</Link>
            <Link href="/orders" className={linkClass} onClick={() => setMobileOpen(false)}>My Orders</Link>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/login');
              router.refresh();
            }}
            className={linkClass}
          >
            Logout
          </button>
          </div>
        </div>
      )}
    </nav>
  );
}
