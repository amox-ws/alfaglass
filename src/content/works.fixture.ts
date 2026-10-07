import type { Work } from "./works";

/**
 * QA fixture: six clearly fake works built from existing photographs ("Δοκιμαστικό έργο 1…6"), so that the list, the filters, the case study and
 * the home teaser can be seen and checked before real jobs exist. Used only when NEXT_PUBLIC_WORKS_FIXTURE=1 at build time (`works.ts` is the
 * only importer, and drops the import otherwise); every page rendered from it shows a full-width banner "ΔΟΚΙΜΑΣΤΙΚΑ ΔΕΔΟΜΕΝΑ, ΟΧΙ ΠΡΑΓΜΑΤΙΚΑ ΕΡΓΑ".
 * Never commit a build or a screenshot of it as a baseline.
 *
 *   NEXT_PUBLIC_WORKS_FIXTURE=1 npm run qa -- --pages /erga,/erga/dokimastiko-ergo-1 --label works-fixture
 */
const test = "Δοκιμαστικό κείμενο, όχι πραγματικό έργο.";

export const works: Work[] = [
  {
    slug: "dokimastiko-ergo-1",
    title: "Δοκιμαστικό έργο 1",
    year: 2026,
    materials: ["acrylic"],
    applications: ["signage"],
    operations: ["cut", "engrave", "letters"],
    products: ["akrylika-fylla-xt-extruded", "akrylika-fylla-chyta-cast"],
    thickness: [10],
    place: "Δοκιμαστική τοποθεσία",
    summary: `${test} Γράμματα και επιγραφή από ακρυλικό, για να φανεί η διάταξη της σελίδας.`,
    body: `${test} Το κείμενο της ιστορίας του έργου ακολουθεί το μέγεθος του lead και δεν ξεπερνά τους 68 χαρακτήρες ανά γραμμή.\n\nΜια δεύτερη παράγραφος δείχνει πώς διαβάζεται ένα κείμενο με περισσότερες από μία παραγράφους, μέσα στο ίδιο πλέγμα.`,
    cover: { src: "/media/b44ac9fde4.jpg", alt: "Δοκιμαστική φωτογραφία εξωφύλλου, όχι πραγματικό έργο", focal: "50% 50%" },
    gallery: [
      { src: "/media/5da8d4d927.jpg", alt: "Δοκιμαστική φωτογραφία 1", caption: "Λεπτομέρεια, δοκιμαστικό δεδομένο" },
      { src: "/media/a847610a5f.jpg", alt: "Δοκιμαστική φωτογραφία 2" },
      { src: "/media/e8402bd5c0.jpg", alt: "Δοκιμαστική φωτογραφία 3", caption: "Γενική άποψη, δοκιμαστικό δεδομένο" },
      { src: "/media/2865f7a276.jpg", alt: "Δοκιμαστική φωτογραφία 4" },
      { src: "/media/009101b3fe.jpg", alt: "Δοκιμαστική φωτογραφία 5" },
      { src: "/media/3363b4f027.jpg", alt: "Δοκιμαστική φωτογραφία 6" },
      { src: "/media/b44ac9fde4.jpg", alt: "Δοκιμαστική φωτογραφία 7" },
    ],
  },
  {
    slug: "dokimastiko-ergo-2",
    title: "Δοκιμαστικό έργο 2",
    year: 2026,
    materials: ["acm"],
    applications: ["facade"],
    operations: ["cut", "vgroove", "drill"],
    products: ["bond-panel-alouminiou-ktirion"],
    thickness: [4],
    client: "Δοκιμαστικός πελάτης",
    summary: `${test} Κασέτες πρόσοψης από σύνθετο πάνελ αλουμινίου.`,
    cover: { src: "/media/94c898e00f.jpg", alt: "Δοκιμαστική φωτογραφία εξωφύλλου, όχι πραγματικό έργο" },
    gallery: [
      { src: "/media/c9d556c64e.jpg", alt: "Δοκιμαστική φωτογραφία 1" },
      { src: "/media/26f0c7b821.jpg", alt: "Δοκιμαστική φωτογραφία 2" },
      { src: "/media/dd51dc7acd.jpg", alt: "Δοκιμαστική φωτογραφία 3" },
    ],
  },
  {
    slug: "dokimastiko-ergo-3",
    title: "Δοκιμαστικό έργο με πολύ μεγάλο τίτλο που πιάνει αρκετές γραμμές",
    year: 2025,
    materials: ["pvcFoam", "pet"],
    applications: ["displays", "shopfit"],
    operations: ["cut", "route"],
    products: ["pvc-afrodes-foam", "pet-g"],
    thickness: [3, 5],
    place: "Δοκιμαστική πόλη",
    summary: `${test} Display και εξοπλισμός καταστήματος.`,
    cover: { src: "/media/5a4ac254a6.jpg", alt: "Δοκιμαστική φωτογραφία εξωφύλλου, όχι πραγματικό έργο" },
    gallery: [{ src: "/media/dd51dc7acd.jpg", alt: "Δοκιμαστική φωτογραφία 1" }],
  },
  {
    slug: "dokimastiko-ergo-4",
    title: "Δοκιμαστικό έργο 4",
    year: 2025,
    materials: ["glass"],
    applications: ["glazing"],
    summary: `${test} Υαλώσεις.`,
    cover: { src: "/media/c9d556c64e.jpg", alt: "Δοκιμαστική φωτογραφία εξωφύλλου, όχι πραγματικό έργο" },
    gallery: [],
  },
  {
    slug: "dokimastiko-ergo-5",
    title: "Δοκιμαστικό έργο 5",
    year: 2024,
    materials: ["acrylic", "polycarbonate"],
    applications: ["interior", "displays"],
    operations: ["cut", "pocket"],
    products: ["polykarvonika-masif-fylla"],
    thickness: [6, 8],
    summary: `${test} Έπιπλο και εσωτερικός χώρος, με εξώφυλλο κατακόρυφης φωτογραφίας.`,
    cover: { src: "/media/f2eb075dab.jpg", alt: "Δοκιμαστική κατακόρυφη φωτογραφία εξωφύλλου, όχι πραγματικό έργο" },
    gallery: [
      { src: "/media/13e0df56dc.jpg", alt: "Δοκιμαστική φωτογραφία 1" },
      { src: "/media/8aa178f2e4.jpg", alt: "Δοκιμαστική φωτογραφία 2" },
    ],
  },
  {
    slug: "dokimastiko-ergo-6",
    title: "Δοκιμαστικό έργο 6",
    year: 2024,
    materials: ["wood", "aluminium"],
    applications: ["shopfit", "interior"],
    operations: ["route", "drill"],
    summary: `${test} Εξοπλισμός καταστήματος από ξύλο και αλουμίνιο.`,
    cover: { src: "/media/3363b4f027.jpg", alt: "Δοκιμαστική φωτογραφία εξωφύλλου, όχι πραγματικό έργο" },
    gallery: [{ src: "/media/e8402bd5c0.jpg", alt: "Δοκιμαστική φωτογραφία 1" }],
  },
];
