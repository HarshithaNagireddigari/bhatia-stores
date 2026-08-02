import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import Hero from "@/components/Hero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latestProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(4);

  return (
    <main>
      <Hero />

      {/* Latest Products */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            New Launches
          </h2>

          <Link
            href="/shop"
            className="font-semibold text-indigo-600"
          >
            View All →
          </Link>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {latestProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="overflow-hidden rounded-2xl border bg-white shadow transition hover:-translate-y-2"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-60 w-full object-cover"
              />

              <div className="p-5">
                <h3 className="font-semibold">{product.name}</h3>

                <p className="mt-2 text-2xl font-bold">
                  ₹{Number(product.price).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-100 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <div className="text-5xl">🚚</div>
            <h3 className="mt-4 text-xl font-bold">
              Fast Delivery
            </h3>
            <p className="mt-2 text-gray-600">
              Delivery across the region with trusted logistics.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <div className="text-5xl">🛡️</div>
            <h3 className="mt-4 text-xl font-bold">
              Secure Payments
            </h3>
            <p className="mt-2 text-gray-600">
              COD and Razorpay supported.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <div className="text-5xl">⭐</div>
            <h3 className="mt-4 text-xl font-bold">
              Premium Quality
            </h3>
            <p className="mt-2 text-gray-600">
              Genuine branded tiles and sanitaryware.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-20 text-center text-white">
        <h2 className="text-4xl font-bold">
          Ready to Upgrade Your Home?
        </h2>

        <p className="mt-4 text-lg">
          Discover hundreds of premium products today.
        </p>

        <Link
          href="/shop"
          className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-bold text-indigo-700"
        >
          Explore Products
        </Link>
      </section>
    </main>
  );
}
