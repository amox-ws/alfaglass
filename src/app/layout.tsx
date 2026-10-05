import type { Metadata, Viewport } from "next";
import { Sofia_Sans, Sofia_Sans_Extra_Condensed } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

const sofia = Sofia_Sans({
  subsets: ["greek", "latin"],
  variable: "--font-sofia",
  display: "swap",
});

const sofiaXC = Sofia_Sans_Extra_Condensed({
  subsets: ["greek", "latin"],
  variable: "--font-sofia-xc",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alfaglass.gr"),
  title: {
    default: "ALFA GLASS | Τα πάντα για το γυαλί",
    template: "%s | ALFA GLASS",
  },
  description:
    "Εισαγωγή και εμπορία υαλοπινάκων, πλαστικών φύλλων και συναφών προϊόντων από το 1999. 13.000 τ.μ. εγκαταστάσεις στον Ασπρόπυργο, στην έξοδο 4 της Αττικής Οδού.",
  openGraph: { locale: "el_GR", siteName: "ALFA GLASS", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#0d0b1f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="el" className={`${sofia.variable} ${sofiaXC.variable}`}>
      <body>
        <SmoothScroll />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-fg focus:px-4 focus:py-2 focus:text-ink"
        >
          Μετάβαση στο περιεχόμενο
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
