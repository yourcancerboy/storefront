import { getUser } from "@/lib/auth/get-user";
import Link from "next/link";
import { User, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function UserMenu() {
  const user = await getUser();

  if (!user) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth/login" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Masuk</span>
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/account" className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name || ""} className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
        )}
        <span className="hidden sm:inline max-w-[100px] truncate">{user.name || user.email.split("@")[0]}</span>
      </Link>
      <form action="/api/auth/logout" method="POST">
        <button type="submit" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
          <LogOut className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
