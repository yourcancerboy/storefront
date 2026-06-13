import { LoginForm } from "@/components/buyer/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Masuk ke Akun</h1>
          <p className="text-muted-foreground text-sm mt-2">Belum punya akun?{" "}
            <a href="/auth/register" className="underline hover:text-foreground">Daftar sekarang</a>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
