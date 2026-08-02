CREATE TABLE IF NOT EXISTS "sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payment_orders" (
  "id" text PRIMARY KEY NOT NULL,
  "razorpay_order_id" text NOT NULL UNIQUE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "amount_paise" integer NOT NULL,
  "currency" text NOT NULL,
  "items" jsonb NOT NULL,
  "status" text DEFAULT 'created' NOT NULL,
  "razorpay_payment_id" text UNIQUE,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "rate_limits" (
  "key" text PRIMARY KEY NOT NULL,
  "count" integer NOT NULL,
  "reset_at" timestamp NOT NULL
);
