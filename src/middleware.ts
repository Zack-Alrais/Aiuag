import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory rate limiter store (resets on server restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

interface AdminToken {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

function getAdminToken(request: NextRequest): AdminToken | null {
  const adminToken = request.cookies.get("admin_token")?.value;
  if (!adminToken) return null;
  try {
    const parsed = JSON.parse(adminToken);
    if (parsed && parsed.email && parsed.role) return parsed;
    return null;
  } catch {
    return null;
  }
}

function checkAdminAuth(request: NextRequest): boolean {
  return getAdminToken(request) !== null;
}

const PAGE_TO_PERM: Record<string, string> = {
  "notifications": "notifications",
  "news": "news",
  "events": "events",
  "members": "members",
  "cards": "cards",
  "projects": "projects",
  "gallery": "gallery",
  "board": "board",
  "committees": "committees",
  "partners": "partners",
  "faqs": "faqs",
  "contacts": "contacts",
  "donations": "donations",
  "backup": "backup",
  "settings": "settings",
  "graduates": "graduates",
  "activity": "settings",
  "permissions": "permissions",
  "membership-card": "members",
};

function hasPagePermission(token: AdminToken, page: string): boolean {
  if (token.email.toLowerCase() === "pen@cube.com") return true;
  if (token.role === "admin") return true;
  const required = PAGE_TO_PERM[page];
  if (!required) return true;
  return token.permissions.includes(required);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Skip middleware entirely for NextAuth internal routes
  if (pathname.startsWith("/api/auth/")) {
    return response;
  }

  // === SECURITY HEADERS (HTML pages only, not API routes) ===
  if (!pathname.startsWith("/api/")) {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    response.headers.delete("X-Powered-By");
  }

  // === RATE LIMITING ===
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";

  // Login: 10 attempts per minute
  if (pathname === "/api/auth/callback/credentials" && request.method === "POST") {
    const key = `login:${ip}`;
    if (!getRateLimit(key, 10, 60000)) {
      return NextResponse.json(
        { error: "تم حظر تسجيل الدخول مؤقتاً." },
        { status: 429 }
      );
    }
  }

  // Admin login: 5 attempts per minute
  if (pathname === "/api/admin/auth/login" && request.method === "POST") {
    const key = `admin-login:${ip}`;
    if (!getRateLimit(key, 5, 60000)) {
      return NextResponse.json(
        { error: "تم حظر تسجيل الدخول مؤقتاً." },
        { status: 429 }
      );
    }
  }

  // File upload: 20 per minute
  if (pathname === "/api/upload" && request.method === "POST") {
    const key = `upload:${ip}`;
    if (!getRateLimit(key, 20, 60000)) {
      return NextResponse.json(
        { error: "تم تجاوز الحد المسموح للتحميل." },
        { status: 429 }
      );
    }
  }

  // Only rate-limit custom auth endpoints, NOT NextAuth internal routes
  if (pathname === "/api/auth/register" && request.method === "POST") {
    const key = `register:${ip}`;
    if (!getRateLimit(key, 3, 600000)) {
      return NextResponse.json(
        { error: "تم تجاوز الحد المسموح لعمليات التسجيل." },
        { status: 429 }
      );
    }
  }

  if (pathname === "/api/auth/forgot-password" && request.method === "POST") {
    const key = `forgot:${ip}`;
    if (!getRateLimit(key, 3, 300000)) {
      return NextResponse.json(
        { error: "تم تجاوز الحد المسموح. يرجى المحاولة بعد 5 دقائق." },
        { status: 429 }
      );
    }
  }

  if (pathname === "/api/auth/verify-email" && request.method === "POST") {
    const key = `verify:${ip}`;
    if (!getRateLimit(key, 5, 60000)) {
      return NextResponse.json(
        { error: "تم تجاوز الحد المسموح لمحاولات التحقق." },
        { status: 429 }
      );
    }
  }

  // === ADMIN API PROTECTION ===
  if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/auth/")) {
    const token = getAdminToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "غير مصرح. يرجى تسجيل الدخول كمدير." },
        { status: 401 }
      );
    }
    // Check page-level permissions for admin API routes
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length >= 3) {
      const apiPage = pathParts[2];
      if (!hasPagePermission(token, apiPage)) {
        return NextResponse.json(
          { error: "ليس لديك صلاحية الوصول لهذا المورد." },
          { status: 403 }
        );
      }
    }
  }

  // === ADMIN PAGES PROTECTION (server-side redirect) ===
  if (pathname.startsWith("/ai.admin") && !pathname.startsWith("/ai.admin/login")) {
    const token = getAdminToken(request);
    if (!token) {
      return NextResponse.redirect(new URL("/ai.admin/login", request.url));
    }
    // Check page-level permissions
    const pathParts = pathname.replace("/ai.admin", "").split("/").filter(Boolean);
    const page = pathParts[0] || "dashboard";
    if (page !== "login" && !hasPagePermission(token, page)) {
      return NextResponse.redirect(new URL("/ai.admin?access=denied", request.url));
    }
  }

  // === MEMBER PAGE PROTECTION ===
  // Protected pages that require member login
  const memberPaths = ["/media/posts", "/profile", "/dashboard", "/membership/manage"];
  const isMemberProtected = memberPaths.some(p => {
    const pattern = new RegExp(`^/(ar|en)${p}`); // Match /ar/media/posts, /en/media/posts
    return pattern.test(pathname);
  });
  if (isMemberProtected && !pathname.startsWith("/api/") && !pathname.startsWith("/ai.")) {
    const sessionToken = request.cookies.get("next-auth.session-token")?.value
      || request.cookies.get("__Secure-next-auth.session-token")?.value
      || request.cookies.get("authjs.session-token")?.value
      || request.cookies.get("__Secure-authjs.session-token")?.value;
    if (!sessionToken) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // === PERFORMANCE HEADERS ===
  // Cache static assets aggressively
  if (pathname.startsWith("/_next/static/") || pathname.startsWith("/images/") || pathname.endsWith(".ico")) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return response;
  }

  // Cache public API routes
  if (pathname.startsWith("/api/public/")) {
    response.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
