"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Password tidak cocok."); return; }
    if (password.length < 8) { setError("Password minimal 8 karakter."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError("Terjadi kesalahan. Coba lagi atau minta link baru.");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>
      )}
      <div>
        <Label htmlFor="password">Password Baru</Label>
        <Input id="password" type="password" className="mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 8 karakter" required />
      </div>
      <div>
        <Label htmlFor="confirm">Konfirmasi Password</Label>
        <Input id="confirm" type="password" className="mt-1.5" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Ulangi password" required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan Password Baru"}
      </Button>
    </form>
  );
}
