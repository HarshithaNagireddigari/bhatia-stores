import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { sql } from "drizzle-orm";

function clientAddress(request: Request) {
  // Only a reverse proxy that strips client-supplied headers may enable this.
  if (process.env.TRUST_PROXY === "true") {
    return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
  }
  return "shared";
}

export async function isRateLimited(request: Request, scope: string, limit = 10, windowMs = 60_000) {
  const key = `${scope}:${clientAddress(request)}`;
  const resetAt = new Date(Date.now() + windowMs);
  const result = await db.execute(sql`
    INSERT INTO ${rateLimits} (${rateLimits.key}, ${rateLimits.count}, ${rateLimits.resetAt})
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT (${rateLimits.key}) DO UPDATE
    SET count = CASE
      WHEN ${rateLimits.resetAt} <= NOW() THEN 1
      ELSE ${rateLimits.count} + 1
    END,
    reset_at = CASE
      WHEN ${rateLimits.resetAt} <= NOW() THEN ${resetAt}
      ELSE ${rateLimits.resetAt}
    END
    RETURNING ${rateLimits.count} AS count
  `);
  const row = result.rows[0] as { count: number } | undefined;
  return !row || Number(row.count) > limit;
}
