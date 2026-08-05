"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function doLogout() {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    }
    doLogout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600 dark:text-gray-300">Logging out…</p>
    </div>
  );
}
