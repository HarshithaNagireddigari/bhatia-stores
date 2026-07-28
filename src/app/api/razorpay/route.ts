import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR" } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    // If Razorpay keys are not configured, return a demo order
    if (!keyId || !keySecret) {
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
