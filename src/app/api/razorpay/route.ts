import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";
import { db } from "@/db";
import { products } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (isRateLimited(req, "checkout", 10, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many checkout attempts. Please try again later." }, { status: 429 });
    }
    const { items, currency = "INR" } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "A non-empty cart is required" }, { status: 400 });
    }
    const ids = items.map((item) => item?.productId).filter((id): id is string => typeof id === "string");
    if (ids.length !== items.length || new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    }
    const catalog = await db.select().from(products).where(inArray(products.id, ids));
    if (catalog.length !== items.length) return NextResponse.json({ error: "A product is no longer available" }, { status: 400 });
    const amount = items.reduce((sum, item) => {
      const product = catalog.find((entry) => entry.id === item.productId)!;
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) throw new Error("Invalid cart quantity");
      return sum + Number(product.price) * quantity;
    }, 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    // Demo payments are only permitted outside production.
    if (!keyId || !keySecret) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
      }
      const mockOrderId = `order_demo_${Date.now()}`;
      return NextResponse.json({
        orderId: mockOrderId,
        amount: Math.round(amount * 100),
        currency,
        keyId: "rzp_test_demo_key",
        demo: true,
      });
    }

    // Dynamic import to avoid build-time errors
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    console.error("Razorpay error:", error);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
