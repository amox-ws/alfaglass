import type { Work } from "@/content/works";
import type { Lang } from "@/lib/i18n";

/**
 * Home's Έργα section: one large card and two medium ones, the three latest works. Built by the Έργα lane, placed by the Home lane
 * behind `features.works`: this stub has the final props and renders nothing.
 */
export type WorksTeaserProps = { lang: Lang; works: Work[] };

export function WorksTeaser(props: WorksTeaserProps) {
  void props;
  return null;
}
