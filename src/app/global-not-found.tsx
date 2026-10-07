import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { NotFoundPage } from "@/components/NotFoundPage";
import { Providers } from "@/components/Providers";
import { SiteShell } from "@/components/SiteShell";
import { fontVariables } from "@/lib/fonts";
import { LANG_HEADER, type Lang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "404 | ALFA GLASS",
};

/**
 * Any address that is not a page gets the designed 404 inside the site frame, in the language of its section
 * (the proxy names it in a header; Greek when it cannot tell). It bypasses the layouts, so it brings its own
 * document, fonts and styles.
 */
export default async function GlobalNotFound() {
  const lang: Lang = (await headers()).get(LANG_HEADER) === "en" ? "en" : "el";
  return (
    <html lang={lang} className={fontVariables}>
      <body>
        <Providers>
          <SiteShell lang={lang}>
            <NotFoundPage lang={lang} />
          </SiteShell>
        </Providers>
      </body>
    </html>
  );
}
