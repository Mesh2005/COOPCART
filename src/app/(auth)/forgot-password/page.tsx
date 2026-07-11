import Link from "next/link";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-gradient-brand text-2xl font-semibold">Reset your password</h1>
      <p className="mt-1 text-sm text-muted">
        Enter your email and we’ll send a code to set a new password.
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brown-700 hover:text-brown-900">
          Log in
        </Link>
      </p>
    </div>
  );
}
