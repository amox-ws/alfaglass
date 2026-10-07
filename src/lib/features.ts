import { works } from "@/content/works";

/**
 * Feature flags. `works` turns on at three real jobs: a filterable gallery of one looks abandoned. While it is off there
 * is no "Έργα" in the header, the mobile menu or the footer, no section on home, no link from the service page and no
 * /erga* in the sitemap; /erga itself answers 200 with its empty state (noindex).
 *
 * `NEXT_PUBLIC_WORKS_FIXTURE=1` (read at build time, QA only) switches it on for the fixture works. The variable
 * carries the NEXT_PUBLIC_ prefix on purpose: Next inlines it at build time in server and client code alike, so a client
 * component (the header, the filters) and the server agree; a plain WORKS_FIXTURE would be `undefined` in the browser
 * and break hydration.
 */
export const features = {
  works: works.length >= 3 || process.env.NEXT_PUBLIC_WORKS_FIXTURE === "1",
};
