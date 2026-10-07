import { stripHtml } from "@/lib/content";

/** The `<p>` paragraphs of legacy html, each as it is. */
export function paragraphs(html: string): string[] {
  return html.match(/<p[^>]*>[\s\S]*?<\/p>/g) ?? [];
}

/**
 * The paragraphs of `html` that do not already appear in `other`. The legacy pages repeat each other word for word (the
 * "main business" sentence is in the company text and again in the activity text); a page shows it once.
 */
export function withoutRepeated(html: string, other: string): string[] {
  const seen = stripHtml(other);
  return paragraphs(html).filter((p) => {
    const text = stripHtml(p);
    return text !== "" && !seen.includes(text);
  });
}
