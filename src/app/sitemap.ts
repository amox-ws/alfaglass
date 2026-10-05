import type { MetadataRoute } from "next";
import { LANGS } from "@/lib/i18n";
import { alternatesFor, resolve, staticSegments } from "@/lib/routes";

const BASE = "https://alfaglass.gr";
const abs = (p: string) => `${BASE}${p === "/" ? "" : p}`;

export default function sitemap(): MetadataRoute.Sitemap {
  return LANGS.flatMap((lang) =>
    staticSegments(lang).map((segments) => {
      const route = resolve(lang, segments)!;
      const alt = alternatesFor(route);
      return {
        url: abs(alt[lang]),
        changeFrequency: "monthly" as const,
        priority: route.kind === "home" ? 1 : 0.7,
        alternates: { languages: { el: abs(alt.el), en: abs(alt.en) } },
      };
    })
  );
}
