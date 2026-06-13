import { ForgotPasswordForm } from "@/components/buyer/auth/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lupa Password" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Lupa Password</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Masukkan email kamu dan kami akan mengirimkan link reset password.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
