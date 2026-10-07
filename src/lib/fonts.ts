import { JetBrains_Mono, Sofia_Sans, Sofia_Sans_Extra_Condensed } from "next/font/google";

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

/**
 * The spec voice: thicknesses, counts, years, codes, dates and phone numbers in labels. Variable (one file per
 * subset), and only the weights 400 and 500 are used. Never for running text or headings, so a font swap is harmless.
 */
const jetbrains = JetBrains_Mono({
  subsets: ["greek", "latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: true,
});

/** Class names of the <html> element: they define the three font variables used by globals.css. */
export const fontVariables = `${sofia.variable} ${sofiaXC.variable} ${jetbrains.variable}`;
