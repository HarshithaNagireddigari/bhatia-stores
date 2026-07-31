import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "bhatia_session";

function sessionSecret() {
  const secret = process.env.SESSION_SECRET || process.env.DATABASE_URL;
  if (!secret) throw new Error("SESSION_SECRET or DATABASE_URL is required");
  return secret;
}

function signSession(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: "admin" | "customer" = "customer"
) {
  const id = uuidv4();
  const hashedPassword = await hashPassword(password);
  await db.insert(users).values({
    id,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
  });
  return { id, name, email, role };
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return result[0] || null;
}

export async function getSessionUser(): Promise<{
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
} | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return null;
  try {
    const [value, signature] = session.value.split(".");
    if (!value || !signature) return null;
    const expected = signSession(value);
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf-8"));
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);
    if (!user[0]) return null;
    return {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role as "admin" | "customer",
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  const value = Buffer.from(JSON.stringify({ id: userId })).toString("base64url");
  const token = `${value}.${signSession(value)}`;
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
