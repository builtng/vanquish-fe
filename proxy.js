import { NextResponse } from "next/server";

// Paths that bypass the maintenance check entirely (static assets, login)
const ALWAYS_BYPASS = [
  "/login",
  "/counsellor-login",
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/og-image.jpg",
];

// Paths that staff, admin, and counsellors can access even during maintenance
const STAFF_PATHS = ["/dashboard", "/counsellor-portal", "/counsellor"];

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Let assets and login pages through without any check
  if (ALWAYS_BYPASS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Fetch maintenance status from the backend
  let maintenanceActive = false;

  try {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (process.env.NODE_ENV === "production") {
      if (!apiUrl || apiUrl.includes("127.0.0.1") || apiUrl.includes("localhost")) {
        apiUrl = "https://api.vqtmanagement.com/api";
      }
    } else {
      apiUrl = apiUrl || "http://127.0.0.1:8000/api";
    }
    const res = await fetch(`${apiUrl}/maintenance`, {
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      maintenanceActive = data.maintenance_mode === true;
    }
  } catch {
    // Can't reach the backend — let everything through
    return NextResponse.next();
  }

  // ── Someone is visiting /maintenance ──────────────────────────────────────
  if (pathname.startsWith("/maintenance")) {
    if (!maintenanceActive) {
      // Maintenance is OFF → redirect them to the home page (or wherever it makes sense)
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    // Maintenance IS on → show the maintenance page
    return NextResponse.next();
  }

  // ── All other pages ───────────────────────────────────────────────────────
  if (!maintenanceActive) {
    // System is operational → allow everything
    return NextResponse.next();
  }

  // Maintenance IS active — let staff/admin/counsellor through
  if (STAFF_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Block everyone else and redirect to /maintenance (no query params)
  const url = request.nextUrl.clone();
  url.pathname = "/maintenance";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|og-image.jpg).*)",
  ],
};
