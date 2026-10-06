import { buildContentSecurityPolicy } from "@/lib/security/csp";
import { isCmsAdmin } from "@/lib/security/admin-policy";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const secureResponse = (response: NextResponse) => {
    response.headers.set("Content-Security-Policy", csp);
    if (response !== supabaseResponse) {
      supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie));
    }
    if (request.nextUrl.pathname.startsWith("/cms") || request.nextUrl.pathname.startsWith("/api") || request.nextUrl.pathname === "/auth") response.headers.set("Cache-Control", "private, no-store");
    return response;
  };
  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          requestHeaders.set("cookie", request.headers.get("cookie") || "");
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    request.nextUrl.pathname.startsWith("/tata-tertib") ||
    request.nextUrl.pathname.startsWith("/alur-peminjaman")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/booking";
    return secureResponse(NextResponse.redirect(url));
  }

  const pathname = request.nextUrl.pathname;

  const within = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  const isPublicPage = pathname === "/" || pathname === "/auth" ||
    ["/booking", "/berita", "/profil", "/pengaduan", "/program"].some(within) ||
    ["/meeting-room", "/room", "/dorm", "/meeting-room/add", "/room/add", "/dorm/add"].includes(pathname);
  const isPublicApi = (request.method === "GET" && (pathname === "/api/news" || pathname === "/api/public/bookings" || /^\/api\/public\/content\/(landing|profile|programs|complaints)$/.test(pathname))) ||
    (request.method === "POST" && ["/api/public/complaints", "/api/public/complaints/track", "/api/public/registrations", "/api/public/bookings"].includes(pathname));
  const isPublicAsset = ["GET", "HEAD"].includes(request.method) && !within("/cms") && !within("/api") && /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|pdf)$/.test(pathname);
  const isPublicRoute = isPublicPage || isPublicApi || isPublicAsset;

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/cms/dashboard";
    return secureResponse(NextResponse.redirect(url));
  }

  if ((!user || !isCmsAdmin(user)) && !isPublicRoute) {
    if (pathname.startsWith("/api/")) {
      return secureResponse(NextResponse.json(
        { error: user ? "Forbidden" : "Unauthorized" },
        { status: user ? 403 : 401, headers: { "Cache-Control": "no-store" } }
      ));
    }
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return secureResponse(NextResponse.redirect(url));
  }

  if (isCmsAdmin(user) && pathname === "/auth") {
    const url = request.nextUrl.clone();
    url.pathname = "/cms/dashboard";
    return secureResponse(NextResponse.redirect(url));
  }

  return secureResponse(supabaseResponse);
}
