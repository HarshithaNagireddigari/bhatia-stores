"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";
import { Search, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
}

function isProductImage(image: string) {
  return image.startsWith("/") || image.startsWith("http") || image.startsWith("data:image/");
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.get("search")?.trim() ?? "";
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (search) params.set("search", search);
        const url = params.size ? `/api/products?${params.toString()}` : "/api/products";
        const res = await fetch(url);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    void fetchProducts();
  }, [category, search]);

  const categories = [
    "All",
    "Tiles & Sanitaryware",
  ];

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("search") ?? "").trim();
    const params = new URLSearchParams();
    if (value) params.set("search", value);
    if (category) params.set("category", category);
    router.replace(params.size ? `/shop?${params.toString()}` : "/shop");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shop</h1>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={submitSearch} className="relative w-full sm:max-w-md">
          <Search aria-hidden size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            key={search}
            name="search"
            defaultValue={search}
            placeholder="Search by tile, collection or style"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-indigo-950"
          />
          {search && (
            <button type="button" onClick={() => router.replace(category ? `/shop?category=${encodeURIComponent(category)}` : "/shop")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X size={18} />
            </button>
          )}
        </form>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat === "All" ? "" : cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              (cat === "All" && !category) || category === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="h-48 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="mt-4 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-20 text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            No products found. {(category || search) && "Try changing your search or category."}
          </p>
          {!category && (
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              Admin users can add products from the admin panel.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <Link href={`/product/${product.id}`}>
                <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {isProductImage(product.image) ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl">
                      {product.image}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <span className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {product.category}
                </span>
                <Link
                  href={`/product/${product.id}`}
                  className="mt-1 font-semibold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                >
                  {product.name}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                  {product.description}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{parseFloat(product.price).toFixed(2)}
                  </span>
                  <button
                    onClick={() => {
                      addItem({
                        productId: product.id,
                        name: product.name,
                        price: parseFloat(product.price),
                        image: product.image,
                        quantity: 1,
                      });
                      toast.success("Added to cart!");
                    }}
                    disabled={product.stock <= 0}
                    className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
