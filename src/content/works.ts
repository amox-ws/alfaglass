import type { Loop } from "@/lib/media-slots";
import type { ApplicationKey, MaterialKey, OperationKey } from "@/lib/machine";

/**
 * Έργα: finished jobs, photographed for ALFA GLASS (with the client's written permission when a client is named).
 * Nothing here is invented: until real jobs exist the list is empty and the pages show their empty state.
 */
export type Work = {
  slug: string;
  title: string;
  year: number;
  materials: ("glass" | MaterialKey)[];
  applications: ApplicationKey[];
  operations?: OperationKey[];
  /** Product slugs of the materials used. */
  products?: string[];
  thickness?: number[];
  place?: string;
  /** Only with the client's written permission. */
  client?: string;
  /** Greek, plain text. */
  summary: string;
  /** Greek, plain text or simple HTML. */
  body?: string;
  cover: { src: string; alt: string; focal?: string };
  coverLoop?: Loop;
  gallery: { src: string; alt: string; caption?: string }[];
  film?: Loop;
};

/**
 * The real works. QA builds (`NEXT_PUBLIC_WORKS_FIXTURE=1`) read the fixture instead; a production build never imports it
 * (the branch is removed when the variable is inlined).
 */
export const works: Work[] =
  process.env.NEXT_PUBLIC_WORKS_FIXTURE === "1"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require("./works.fixture") as { works: Work[] }).works
    : [];
