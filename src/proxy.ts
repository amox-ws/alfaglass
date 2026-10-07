import { NextResponse, type NextRequest } from "next/server";
import { LANG_HEADER, type Lang } from "@/lib/i18n";

/** The incoming request plus the header that names its language section. */
function inLanguage(request: NextRequest, lang: Lang) {
  const headers = new Headers(request.headers);
  headers.set(LANG_HEADER, lang);
  return { headers };
}

/**
 * Greek is the default language and lives at the root ("/etaireia"); English lives under "/en".
 * Internally every page sits under app/[lang], so Greek requests are rewritten to "/el/...".
 * Direct "/el/..." URLs redirect to their unprefixed form so each page has one address.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next({ request: inLanguage(request, "en") });

  if (pathname === "/el" || pathname.startsWith("/el/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/el${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url, { request: inLanguage(request, "el") });
}

export const config = {
  // Pages only: skip Next internals, API routes, metadata files and anything with a file extension.
  matcher: ["/((?!_next|api|media|docs|fonts|brand|icon\\.png|sitemap\\.xml|robots\\.txt|.*\\..*).*)"],
};
