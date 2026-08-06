"use client";
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// export const revalidate = 0; // removed

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function OtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email") ?? "");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid OTP");
        return;
      }
      toast.success("Logged in successfully!");
      router.replace("/shop");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enter OTP</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          An OTP has been sent to the phone number associated with <strong>{email}</strong>.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="123456"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary-600 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
