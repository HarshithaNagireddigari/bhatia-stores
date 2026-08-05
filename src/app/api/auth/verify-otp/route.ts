import { NextResponse } from "next/server";
import { getUserByEmail, setSessionCookie } from "@/lib/auth";
import { verifyOtpAnswer } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
    }
    const valid = await verifyOtpAnswer(email, otp);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Log the user in by creating a session cookie.
    await setSessionCookie(user.id);
    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
