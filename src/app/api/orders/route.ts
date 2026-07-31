import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { inArray } from "drizzle-orm";
import { products } from "@/db/schema";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = db.select().from(orders).orderBy(orders.createdAt);

  if (user.role === "customer") {
    const all = await query;
    return NextResponse.json(all.filter((o) => o.userId === user.id));
  }

  // Admin sees all
  const all = await query;
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isRateLimited(req, "order", 10, 15 * 60_000)) {
      return NextResponse.json({ error: "Too many order attempts. Please try again later." }, { status: 429 });
    }
    const { items, customerName, customerEmail, address, city, phone, paymentMethod, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      await req.json();

    if (!Array.isArray(items) || !items.length || !customerName || !customerEmail || !address || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (paymentMethod !== "razorpay" && paymentMethod !== "cod") {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    const ids = items.map((item) => item?.productId).filter((id): id is string => typeof id === "string");
    if (ids.length !== items.length || new Set(ids).size !== ids.length) return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    const catalog = await db.select().from(products).where(inArray(products.id, ids));
    if (catalog.length !== items.length) return NextResponse.json({ error: "A product is no longer available" }, { status: 400 });
    const verifiedItems = items.map((item) => {
      const product = catalog.find((entry) => entry.id === item.productId)!;
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) throw new Error("Invalid cart quantity");
      return { product, quantity };
    });
    const total = verifiedItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (paymentMethod === "razorpay" && razorpaySecret) {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
      const expected = createHmac("sha256", razorpaySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
      if (razorpaySignature.length !== expected.length || !timingSafeEqual(Buffer.from(razorpaySignature), Buffer.from(expected))) {
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
      }
    } else if (paymentMethod === "razorpay" && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
    }

    const orderId = uuidv4();

    await db.insert(orders).values({
      id: orderId,
      userId: user.id,
      customerName,
      customerEmail,
      address,
      city: city || "",
      phone,
      status: "pending",
      total: total.toString(),
      razorpayPaymentId: paymentMethod === "cod" ? "cash_on_delivery" : razorpayPaymentId || null,
      razorpayOrderId: paymentMethod === "cod" ? null : razorpayOrderId || null,
    });

    for (const item of verifiedItems) {
      await db.insert(orderItems).values({
        id: uuidv4(),
        orderId,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      });
    }

    const created = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
