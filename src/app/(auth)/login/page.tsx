import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; status?: string }>;
}) {
  const { next, status } = await searchParams;
  return (
    <div>
      <h1 className="text-2xl text-brown-900">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Log in to manage your wholesale orders.</p>
      <div className="mt-6">
        <LoginForm next={next} status={status} />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        New to CoopCart?{" "}
        <Link href="/register" className="font-semibold text-brown-700 hover:text-brown-900">
          Register your business
        </Link>
      </p>
    </div>
  );
}
