import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Register your business" };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-gradient-brand text-2xl font-semibold">Register your business</h1>
      <p className="mt-1 text-sm text-muted">
        Create an account. We’ll review it and unlock wholesale pricing for you.
      </p>
      <div className="mt-6">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-brown-700 hover:text-brown-900">
          Log in
        </Link>
      </p>
    </div>
  );
}
