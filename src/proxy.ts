import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const handleI18nRouting = createMiddleware(routing);

// Routes that require a logged-in buyer
const PROTECTED_PATTERNS = ["/checkout", "/orders", "/account"];

function isProtected(pathname: string): boolean {
  // Strip locale prefix (e.g. /en/checkout → /checkout)
  const stripped = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");
  return PROTECTED_PATTERNS.some((p) => stripped === p || stripped.startsWith(p + "/"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtected(pathname)) {
    let isAuthenticated = false;
    try {
      const response = NextResponse.next();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookies) => {
              cookies.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );
      const { data: { user } } = await supabase.auth.getUser();
      isAuthenticated = !!user;
    } catch {}

    if (!isAuthenticated) {
      const locale = pathname.split("/")[1] || "id";
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
