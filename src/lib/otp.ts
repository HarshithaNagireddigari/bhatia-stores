// OTP utility – server‑only implementation
// Generates a one‑time numeric code, stores it in a signed HTTP‑only cookie,
// and provides verification logic.

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const OTP_COOKIE = "bhatia_otp";
const OTP_MAX_AGE = 5 * 60; // 5 minutes

function getSecret() {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error("OTP_SECRET is required");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

/**
 * Create an OTP challenge for the given identifier (e.g., email or phone).
 * The generated code is logged to the console – replace `sendSmsPlaceholder`
 * with a real SMS provider such as Twilio.
 */
export async function createOtpChallenge(identifier: string) {
  const code = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6‑digit code
  const payload = {
    identifier,
    code,
    expiresAt: Date.now() + OTP_MAX_AGE * 1000,
  };
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const token = `${value}.${sign(value)}`;

  const cookieStore = await cookies();
  cookieStore.set(OTP_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: OTP_MAX_AGE,
  });

  // Placeholder – in production use a real SMS provider.
  await sendSmsPlaceholder(identifier, code);
  return { success: true };
}

/** Verify the supplied OTP against the signed cookie. */
export async function verifyOtpAnswer(identifier: string, otp: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(OTP_COOKIE)?.value;
  // Delete the cookie after any verification attempt – one‑time use.
  cookieStore.delete(OTP_COOKIE);
  if (!token) return false;

  const [value, signature] = token.split(".");
  if (!value || !signature) return false;
  const expected = sign(value);
  if (signature.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as {
      identifier: string;
      code: string;
      expiresAt: number;
    };
    if (payload.identifier !== identifier) return false;
    if (payload.expiresAt <= Date.now()) return false;
    return payload.code === otp;
  } catch {
    return false;
  }
}

/** Placeholder SMS sender – replace with actual integration. */
async function sendSmsPlaceholder(to: string, code: string) {
  // In a real app you would integrate with Twilio, Vonage, etc.
  console.log(`🔔 OTP for ${to}: ${code}`);
}
