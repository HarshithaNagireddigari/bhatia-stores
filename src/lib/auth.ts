import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

const SESSION_COOKIE = "bhatia_session";

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
    const decoded = JSON.parse(
      Buffer.from(session.value, "base64").toString("utf-8")
    );
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
  const token = Buffer.from(JSON.stringify({ id: userId })).toString("base64");
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
