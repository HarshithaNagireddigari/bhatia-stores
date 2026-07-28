"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Order {
  id: string;
  status: string;
  total: string;
  customerName: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchOrders();
  }, []);

  async function fetchUser() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (!data.user || data.user.role !== "admin") {
      router.push("/login");
      return;
    }
    setUser(data.user);
  }

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  }

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + parseFloat(o.total), 0);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome, {user.name}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? "..." : orders.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending Orders</p>
          <p className="mt-1 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {loading ? "..." : pendingOrders.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
          <p className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">
            {loading ? "..." : `₹${totalRevenue.toFixed(2)}`}
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/products"
          className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            📦 Manage Products
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add, edit, or remove products from the store.
          </p>
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            📋 Manage Orders
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and update order statuses.
          </p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Recent Orders
        </h2>
        {loading ? (
          <div className="mt-4 animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="mt-4 text-gray-500 dark:text-gray-400">No orders yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.customerName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    #{order.id.slice(0, 8)} &middot;{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{parseFloat(order.total).toFixed(2)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : order.status === "delivered"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
