import { imagery } from "./content";
import { t } from "./i18n";

/**
 * The slot registry: the site's fixed places for photographs and films. Photos of finished jobs, a drone film of the 13.000 m² site
 * and films of the machine are being shot; every slot below looks finished today with what exists (a graded photo, or the
 * machine drawing) and takes the new material by changing one line of data, never a layout.
 *
 * An empty slot (`{}`) renders its designed fallback (the drawing), never an empty box or a "coming soon" label.
 * Works carry their own media in src/content/works.ts; this registry is for the fixed slots only.
 */

/** A picture. `focal` is a CSS object-position, e.g. "30% 55%". Greek alt text (a page in another language passes its own to `MediaSlot`). */
export type Still = { src: string; alt: string; focal?: string };

/** A silent loop. The poster (its first frame) is a registered image in src/content/media-sizes.json and is what paints first. */
export type Loop = {
  /** What it shows, used by the pause button ("Η μηχανή κόβει ακρυλικό"). */
  label: string;
  poster: Still;
  sources: { src: string; type: "video/webm" | "video/mp4"; media?: string }[];
};

export type Slot = { still?: Still; loop?: Loop };

export type SlotName = "warehouse" | "drone" | "building" | "machineStill" | "machineFilm";

const el = t("el");

export const slots: Record<SlotName, Slot> = {
  /** Home warehouse chapter, facilities "Inside". Later: an interior loop (desktop only, poster first). */
  warehouse: { still: { src: imagery.warehouseNight, alt: el.home.warehouseAlt } },
  /** DroneBand on facilities (and on home once a loop exists). Later: the drone film. */
  drone: { still: { src: imagery.aerialDay, alt: el.facilities.aerialAlt } },
  /** Company hero. Later: a drone orbit of the building. The logo stays in frame at 390px. */
  building: { still: { src: imagery.buildingDay, alt: el.company.buildingAlt, focal: "30% 55%" } },
  /** CNC service hero. Later: a photo of ALFA GLASS's own machine. */
  machineStill: {},
  /** End of the service bed scene. Later: the machine film. */
  machineFilm: {},
};
