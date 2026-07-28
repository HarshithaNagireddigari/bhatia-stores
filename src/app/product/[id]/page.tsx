"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-4 h-64 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">Product not found.</p>
        <Link href="/shop" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
      >
        ← Back to Shop
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Product image */}
        <div className="flex items-center justify-center rounded-2xl bg-gray-100 p-12 dark:bg-gray-800">
          <span className="text-[120px]">{product.image}</span>
        </div>

        {/* Product info */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            ₹{parseFloat(product.price).toFixed(2)}
          </p>
          <p className="mt-6 leading-relaxed text-gray-600 dark:text-gray-300">
            {product.description}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                product.stock > 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-lg font-medium text-gray-600 dark:text-gray-300"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center font-medium text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-3 py-2 text-lg font-medium text-gray-600 dark:text-gray-300"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => {
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    image: product.image,
                    quantity,
                  });
                  toast.success(`Added ${quantity} to cart!`);
                }}
                className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
