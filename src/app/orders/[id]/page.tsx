"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: string;
}

interface Order {
  id: string;
  status: string;
  total: string;
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  phone: string;
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  createdAt: string;
  items: OrderItem[];
}

const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          if (res.status === 401) {
            setError("Please log in to view order details.");
          } else if (res.status === 404) {
            setError("Order not found.");
          } else {
            setError("Failed to load order.");
          }
          return;
        }
        const data = await res.json();
        setOrder(data);
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">{error}</p>
        <Link href="/orders" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = order.status === "cancelled" ? -1 : statusSteps.indexOf(order.status);
  const isCashOnDelivery = order.razorpayPaymentId === "cash_on_delivery";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
      >
        ← Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          ₹{parseFloat(order.total).toFixed(2)}
        </span>
      </div>

      {/* Tracking */}
      {order.status !== "cancelled" && (
        <div className="mt-10">
          <h2 className="font-semibold text-gray-900 dark:text-white">Tracking</h2>
          <div className="mt-4 flex items-center justify-between">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      i <= currentStep
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  <span
                    className={`mt-1 text-xs capitalize ${
                      i <= currentStep
                        ? "font-medium text-indigo-600 dark:text-indigo-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${
                      i < currentStep
                        ? "bg-indigo-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {order.status === "cancelled" && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <p className="font-semibold text-red-700 dark:text-red-400">
            This order has been cancelled.
          </p>
        </div>
      )}

      {/* Items */}
      <div className="mt-10">
        <h2 className="font-semibold text-gray-900 dark:text-white">Items</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {item.productName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Info */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Address</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {order.customerName}
            <br />
            {order.address}
            {order.city && <>, {order.city}</>}
            <br />
            {order.phone}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Payment</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isCashOnDelivery ? (
              <>
                Cash on Delivery
                <br />
                Pay ₹{parseFloat(order.total).toFixed(2)} when your order is delivered
              </>
            ) : order.razorpayPaymentId ? (
              <>
                Paid via Razorpay
                <br />
                Payment ID: {order.razorpayPaymentId}
              </>
            ) : (
              "Payment pending"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
