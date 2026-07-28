import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 py-20 text-center text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-3xl">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur">
            🚀 Now Launching
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
            Bhatia Stores
          </h1>
          <p className="mt-4 text-xl text-white/80 md:text-2xl">
            Your premium destination for quality products. Discover amazing deals, fast delivery, and secure payments with Razorpay.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="rounded-full bg-white px-8 py-3 font-semibold text-indigo-600 shadow-lg transition hover:bg-gray-100 hover:shadow-xl"
            >
              Start Shopping
            </Link>
            <Link
              href="/login"
              className="rounded-full border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Admin Login
            </Link>
          </div>
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
