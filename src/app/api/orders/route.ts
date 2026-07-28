import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

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
    const { items, customerName, customerEmail, address, city, phone, total, razorpayPaymentId, razorpayOrderId } =
      await req.json();

    if (!items || !items.length || !customerName || !customerEmail || !address || !phone || !total) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
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
      razorpayPaymentId: razorpayPaymentId || null,
      razorpayOrderId: razorpayOrderId || null,
    });

    for (const item of items) {
      await db.insert(orderItems).values({
        id: uuidv4(),
        orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price.toString(),
      });
    }

    const created = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
