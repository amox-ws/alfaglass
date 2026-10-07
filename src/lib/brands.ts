/**
 * The glass manufacturers of the useful-links page. `site.links` lists them by logo only (the same files in both
 * languages), so their names are kept here, by logo file: a name never depends on the order of the list.
 */
const NAMES: Record<string, string> = {
  "/media/558188fa9b.jpg": "AGC",
  "/media/5d8667cfbb.jpg": "Guardian Glass",
  "/media/a3fb7efaf4.png": "Pilkington",
  "/media/368afa40ae.png": "Saint-Gobain",
  "/media/a11f7ef9a9.jpg": "Şişecam",
};

export type Brand = { logo: string; name: string };

/** The entries of `site.links` whose logo has a known name, in the order of the page. */
export function brandsOf(links: { logo: string }[]): Brand[] {
  return links.flatMap(({ logo }) => (NAMES[logo] ? [{ logo, name: NAMES[logo] }] : []));
}
