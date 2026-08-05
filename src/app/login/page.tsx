"use client";

import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Login</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sign in to your Bhatia Stores account
        </p>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            Register
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/forgot-password" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}
