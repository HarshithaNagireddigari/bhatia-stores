"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Your favourites</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Wishlist</h1>
        <p className="mx-auto mt-3 max-w-md text-gray-500 dark:text-gray-400">Save the tiles and sanitaryware designs you want to compare or discuss with our team.</p>
      </div>

      {items.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-gray-500 dark:text-gray-400">Your wishlist is empty.</p>
          <Link href="/shop" className="mt-7 inline-block rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Browse products</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.productId} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <Link href={`/product/${item.productId}`} className="block">
                <div className="flex h-36 items-center justify-center rounded-xl bg-gray-50 text-6xl dark:bg-gray-900">{item.image}</div>
                <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">{item.name}</h2>
                <p className="mt-1 font-bold text-indigo-600">₹{item.price.toFixed(2)}</p>
              </Link>
              <div className="mt-5 flex gap-3">
                <button onClick={() => addItem({ ...item, quantity: 1 })} className="flex-1 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Add to cart</button>
                <button onClick={() => removeItem(item.productId)} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Remove</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
