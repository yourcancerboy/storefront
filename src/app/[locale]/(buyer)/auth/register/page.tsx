import { RegisterForm } from "@/components/buyer/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Daftar" };

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Buat Akun</h1>
          <p className="text-muted-foreground text-sm mt-2">Sudah punya akun?{" "}
            <a href="/auth/login" className="underline hover:text-foreground">Masuk di sini</a>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
