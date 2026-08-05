import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth";
import { createOtpChallenge } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const user = await getUserByEmail(email);
    if (!user) {
      // Do not reveal whether the email exists for security.
      return NextResponse.json({ success: true });
    }
    await createOtpChallenge(email);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
