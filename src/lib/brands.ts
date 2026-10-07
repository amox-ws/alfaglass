/**
 * The glass manufacturers of the useful-links page. `site.links` lists them by logo only (the same files in both
 * languages), so their names are kept here, by logo file: a name never depends on the order of the list.
 * `height` is the logo's height in px on a wide screen, chosen by eye so that a heavy mark (AGC) and a thin one
 * (Saint-Gobain, Şişecam) weigh the same once they share one tone.
 */
const BRANDS: Record<string, { name: string; height: number }> = {
  "/media/558188fa9b.jpg": { name: "AGC", height: 36 },
  "/media/5d8667cfbb.jpg": { name: "Guardian Glass", height: 28 },
  "/media/a3fb7efaf4.png": { name: "Pilkington", height: 28 },
  "/media/368afa40ae.png": { name: "Saint-Gobain", height: 44 },
  "/media/a11f7ef9a9.jpg": { name: "Şişecam", height: 36 },
};

export type Brand = { logo: string; name: string; height: number };

/** The entries of `site.links` whose logo is known, in the order of the page. */
export function brandsOf(links: { logo: string }[]): Brand[] {
  return links.flatMap(({ logo }) => (BRANDS[logo] ? [{ logo, ...BRANDS[logo] }] : []));
}
