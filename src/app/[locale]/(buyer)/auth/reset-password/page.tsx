import { ResetPasswordForm } from "@/components/buyer/auth/reset-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Buat Password Baru</h1>
          <p className="text-muted-foreground text-sm mt-2">Masukkan password baru kamu di bawah ini.</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
