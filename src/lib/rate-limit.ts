import { db } from "@/db";
import { sql } from "drizzle-orm";

function clientAddress(request: Request) {
  if (process.env.TRUST_PROXY === "true") {
    return (
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    );
  }
  return "shared";
}

export async function isRateLimited(
  request: Request,
  scope: string,
  limit = 10,
  windowMs = 60_000
) {
  const key = `${scope}:${clientAddress(request)}`;
  const resetAt = new Date(Date.now() + windowMs);

  const result = await db.execute(sql`
    INSERT INTO rate_limits (key, count, reset_at)
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT (key)
    DO UPDATE SET
      count = CASE
        WHEN rate_limits.reset_at <= NOW() THEN 1
        ELSE rate_limits.count + 1
      END,
      reset_at = CASE
        WHEN rate_limits.reset_at <= NOW() THEN ${resetAt}
        ELSE rate_limits.reset_at
      END
    RETURNING count;
  `);

  const row = result.rows[0] as { count: number } | undefined;
  return !row || Number(row.count) > limit;
}