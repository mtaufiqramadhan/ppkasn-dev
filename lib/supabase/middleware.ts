import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
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
    return NextResponse.redirect(url);
  }

  const pathname = request.nextUrl.pathname;

  // Public schedule calendars & public booking creation pages
  const isPublicSchedule =
    pathname === "/meeting-room" ||
    pathname === "/room" ||
    pathname === "/dorm";

  const isPublicAdd =
    pathname === "/meeting-room/add" ||
    pathname === "/room/add" ||
    pathname === "/dorm/add";

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/booking") ||
    pathname.startsWith("/berita") ||
    pathname.startsWith("/profil") ||
    pathname.startsWith("/pengaduan") ||
    pathname.startsWith("/program") ||
    isPublicSchedule ||
    isPublicAdd;

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/cms/dashboard";
    return NextResponse.redirect(url);
  }

  if (!user && !isPublicRoute) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/cms/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
