"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      setError("Terjadi kesalahan. Coba lagi.");
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center p-6 border border-border rounded-xl space-y-3">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-green-600 text-2xl">✓</span>
        </div>
        <h3 className="font-semibold">Cek email kamu!</h3>
        <p className="text-sm text-muted-foreground">
          Kami telah mengirimkan link reset password ke <strong>{email}</strong>.
        </p>
        <a href="/auth/login" className="text-sm underline hover:text-foreground block">
          Kembali ke halaman masuk
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          className="mt-1.5"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Mengirim..." : "Kirim Link Reset Password"}
      </Button>
      <div className="text-center">
        <a href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground underline">
          Kembali ke halaman masuk
        </a>
      </div>
    </form>
  );
}
