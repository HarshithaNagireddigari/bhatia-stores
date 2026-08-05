"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadCaptcha() {
    try {
      const res = await fetch("/api/auth/captcha", { cache: "no-store" });
      const data = await res.json();
      setCaptchaQuestion(data.question || "");
      setCaptchaAnswer("");
    } catch {
      toast.error("Could not load human verification");
    }
  }

  // Load captcha on mount
  useEffect(() => {
    loadCaptcha();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaAnswer }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed");
        loadCaptcha();
        return;
      }

      toast.success("Logged in successfully!");
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/shop");
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="••••••••"
        />
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Human verification *</label>
          <button type="button" onClick={loadCaptcha} className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">New question</button>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{captchaQuestion || "Loading question..."}</p>
        <input
          type="number"
          inputMode="numeric"
          value={captchaAnswer}
          onChange={(e) => setCaptchaAnswer(e.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="Your answer"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !captchaQuestion}
        className="w-full rounded-full bg-primary-600 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
