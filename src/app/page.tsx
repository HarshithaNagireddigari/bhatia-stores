import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const newProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-6 py-20 text-center text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-3xl">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur">
            🚀 Now Launching
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
            Build spaces you&apos;ll love to come home to.
          </h1>
          <p className="mt-4 text-xl text-white/80 md:text-2xl">
            Premium tiles and sanitaryware with clear prices, expert guidance and dependable delivery.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="rounded-full bg-white px-8 py-3 font-semibold text-indigo-600 shadow-lg transition hover:bg-gray-100 hover:shadow-xl"
            >
              Explore New Arrivals
            </Link>
            <Link
              href="https://wa.me/919984979720"
              className="rounded-full border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              WhatsApp Us
            </Link>
          </div>
        </div>
      </section>

      {/* New launches */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Fresh arrivals
              </span>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                Launching New Products
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Explore the latest additions to our tile and sanitaryware collection.
              </p>
            </div>
            <Link
              href="/shop"
              className="font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400"
            >
              View all products →
            </Link>
          </div>

          {newProducts.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {product.image.startsWith("/") || product.image.startsWith("http") || product.image.startsWith("data:image/") ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl">{product.image}</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      New launch
                    </p>
                    <h3 className="mt-1 truncate font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                    <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                      ₹{Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
              New products will appear here as soon as they are added.
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Why Bhatia Stores?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                emoji: "🚚",
                title: "Fast Delivery",
                desc: "We deliver to your doorstep within 2-5 business days with real-time tracking.",
              },
              {
                emoji: "🔒",
                title: "Secure Payments",
                desc: "Powered by Razorpay — your transactions are always safe and encrypted.",
              },
              {
                emoji: "🌙",
                title: "Dark & Light Mode",
                desc: "Switch between dark and light mode with one click for your comfort.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 p-8 text-center transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="text-4xl">{f.emoji}</span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Launch Banner */}
      <section className="bg-indigo-50 py-16 dark:bg-indigo-950/30">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Grand Launch Offer
          </span>
          <h2 className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">
            Flat 20% Off on Your First Order
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Use code <strong className="text-indigo-600 dark:text-indigo-400">BHATIA20</strong> at checkout
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Explore Products
          </Link>
        </div>
      </section>
    </div>
  );
}
