import type { Work } from "@/content/works";
import type { Lang } from "@/lib/i18n";

/**
 * A finished job as a card: the cover in a frame of its own ratio, the title, a mono line (material, application, year).
 * The whole card is one link; stills only. Built by the Έργα lane: this stub has the final props and renders nothing.
 */
export type WorkCardProps = { lang: Lang; work: Work; size: "lg" | "md" | "sm"; headingLevel?: 2 | 3 | 4 };

export function WorkCard(props: WorkCardProps) {
  void props;
  return null;
}
