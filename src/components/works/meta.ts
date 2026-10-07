import type { Work } from "@/content/works";
import { thicknessRange } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import type { ApplicationKey, MaterialKey } from "@/lib/machine";

/** A material of a work: glass, or one of the machine's (`MATERIALS`). */
export type WorkMaterial = "glass" | MaterialKey;

/** The name of a material, in full ("Ακρυλικό (πλεξιγκλάς)"). */
export function materialLabel(lang: Lang, key: WorkMaterial) {
  const d = t(lang);
  return key === "glass" ? d.works.glass : (d.machine.materials[key] ?? key);
}

/** The short name of a material for a mono line: the words before a bracket or a comma ("Ακρυλικό", "PVC αφρώδες"). */
export const shortMaterial = (label: string) => label.split(/\s*[(,]/)[0];

export function applicationLabel(lang: Lang, key: ApplicationKey) {
  return t(lang).machine.applications[key] ?? key;
}

/**
 * The parts of the mono line of a card and of a case study: "Ακρυλικό 10 mm", "Γράμματα & επιγραφές", "2026" (the first material with the thickness
 * range, the first application, the year). `MetaLine` sets them in capitals, with the units kept in SI case.
 */
export function workMetaParts(lang: Lang, work: Work) {
  const material = work.materials[0] ? shortMaterial(materialLabel(lang, work.materials[0])) : "";
  const thickness = work.thickness?.length ? ` ${thicknessRange(work.thickness)} mm` : "";
  return [`${material}${thickness}`.trim(), work.applications[0] ? applicationLabel(lang, work.applications[0]) : "", String(work.year)].filter(Boolean);
}
