import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Sync to our User table on first login
    const dbUser = await prisma.user.upsert({
      where: { email: user.email! },
      update: { name: user.user_metadata?.full_name || user.user_metadata?.name || undefined },
      create: {
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatarUrl: user.user_metadata?.avatar_url || null,
        role: "BUYER",
      },
    });

    return { ...dbUser, supabaseId: user.id };
  } catch {
    return null;
  }
}

export async function requireUser(redirectTo = "/auth/login") {
  const user = await getUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect(redirectTo);
  }
  return user;
}
