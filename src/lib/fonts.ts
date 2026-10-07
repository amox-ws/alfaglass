import { Sofia_Sans, Sofia_Sans_Extra_Condensed } from "next/font/google";

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

/** Class names of the <html> element: they define the two font variables used by globals.css. */
export const fontVariables = `${sofia.variable} ${sofiaXC.variable}`;
