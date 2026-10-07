import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { SiteShell } from "@/components/SiteShell";
import { SITE_URL } from "@/lib/content";
import { fontVariables } from "@/lib/fonts";
import { LANGS, isLang, t } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.meta.title, template: "%s | ALFA GLASS" },
    description: d.meta.description,
    openGraph: { locale: d.ogLocale, siteName: "ALFA GLASS", type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: "#f8fafd",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang} className={fontVariables}>
      <body>
        <SiteShell lang={lang}>{children}</SiteShell>
      </body>
    </html>
  );
}
