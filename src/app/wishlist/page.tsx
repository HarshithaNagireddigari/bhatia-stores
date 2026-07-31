import Link from "next/link";

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Your favourites</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Wishlist</h1>
      <p className="mx-auto mt-3 max-w-md text-gray-500 dark:text-gray-400">Save the tiles and sanitaryware designs you want to compare or discuss with our team.</p>
      <Link href="/shop" className="mt-7 inline-block rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">Browse products</Link>
    </div>
  );
}
