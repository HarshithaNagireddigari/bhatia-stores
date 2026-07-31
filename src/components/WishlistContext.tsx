"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem } from "./CartContext";

type WishlistContextType = { items: CartItem[]; toggleItem: (item: CartItem) => void; hasItem: (id: string) => boolean; removeItem: (id: string) => void };
const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("bhatia_wishlist") || "[]")); } finally { setReady(true); } }, []);
  useEffect(() => { if (ready) localStorage.setItem("bhatia_wishlist", JSON.stringify(items)); }, [items, ready]);
  const toggleItem = (item: CartItem) => setItems((current) => current.some((entry) => entry.productId === item.productId) ? current.filter((entry) => entry.productId !== item.productId) : [...current, item]);
  return <WishlistContext.Provider value={{ items, toggleItem, hasItem: (id) => items.some((item) => item.productId === id), removeItem: (id) => setItems((items) => items.filter((item) => item.productId !== id)) }}>{children}</WishlistContext.Provider>;
}
export function useWishlist() { const context = useContext(WishlistContext); if (!context) throw new Error("useWishlist must be used within WishlistProvider"); return context; }
