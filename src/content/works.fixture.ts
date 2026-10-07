import type { Work } from "./works";

/**
 * QA fixture (lane Έργα fills it): six clearly fake works built from existing photos ("Δοκιμαστικό έργο 1…6").
 * Used only when NEXT_PUBLIC_WORKS_FIXTURE=1 at build time; every page rendered from it shows a full-width banner
 * "ΔΟΚΙΜΑΣΤΙΚΑ ΔΕΔΟΜΕΝΑ, ΟΧΙ ΠΡΑΓΜΑΤΙΚΑ ΕΡΓΑ". Never commit a build or a screenshot of it as a baseline.
 */
export const works: Work[] = [];
