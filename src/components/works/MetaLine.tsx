import { Fragment } from "react";
import { Units } from "@/components/kit/Units";
import type { Work } from "@/content/works";
import type { Lang } from "@/lib/i18n";
import { workMetaParts } from "./meta";

/**
 * The mono line of a work ("ΑΚΡΥΛΙΚΟ 10 mm · ΓΡΑΜΜΑΤΑ & ΕΠΙΓΡΑΦΕΣ · 2026"): each part stays whole, and when the line is too long it breaks between parts,
 * with the dot at the end of the line before the break (never a line that starts with "·"). Units keep their SI case.
 */
export function MetaLine({ lang, work }: { lang: Lang; work: Work }) {
  const parts = workMetaParts(lang, work);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={part}>
          {i > 0 && " "}
          <span className="whitespace-nowrap">
            <Units>{part}</Units>
            {i < parts.length - 1 && " ·"}
          </span>
        </Fragment>
      ))}
    </>
  );
}
