import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cta } from "@/components/Cta";
import { AttikiExit } from "@/components/kit/AttikiExit";
import { DroneBand } from "@/components/kit/DroneBand";
import { EdgeGauge } from "@/components/kit/EdgeGauge";
import { EdgeIndex } from "@/components/kit/EdgeIndex";
import { LightboxFrame } from "@/components/kit/LightboxBody";
import { MachineBlueprint } from "@/components/kit/MachineBlueprint";
import { Marquee } from "@/components/kit/Marquee";
import { MediaGallery, type GalleryItem } from "@/components/kit/MediaGallery";
import { MediaSlot } from "@/components/kit/MediaSlot";
import { SpecPlate } from "@/components/kit/SpecPlate";
import { SpecTable } from "@/components/kit/SpecTable";
import { SpecimenCard } from "@/components/kit/SpecimenCard";
import { SpecimenPlate } from "@/components/kit/SpecimenPlate";
import { Units } from "@/components/kit/Units";
import { PageHero } from "@/components/page";
import { cms, familyThickness, productThickness } from "@/lib/content";
import { isLang, t } from "@/lib/i18n";
import { formatArea, formatMm } from "@/lib/machine";
import { slots, type Loop, type Slot } from "@/lib/media-slots";
import { splitSpecHtml } from "@/lib/spec-table";
import { geoCaption } from "@/lib/seo";

export const metadata: Metadata = { title: "Kit", robots: { index: false, follow: false } };

/** A 4 s, 720p, silent test clip made from the warehouse photograph (public/video/README.md): delete it when the first real film lands. */
const TEST_LOOP: Loop = {
  label: "Δοκιμαστικό βίντεο: η αποθήκη",
  poster: { src: "/media/kit-test-poster.jpg", alt: "Το εσωτερικό της αποθήκης, δοκιμαστικό βίντεο" },
  sources: [{ src: "/video/kit/test-720.mp4", type: "video/mp4" }],
};

function Section({ id, title, theme = "frost", children }: { id: string; title: string; theme?: "frost" | "mist" | "night" | "deep"; children: React.ReactNode }) {
  return (
    <section data-theme={theme} aria-labelledby={id} className="bg-surface py-16 md:py-24">
      <div className="shell">
        <h2 id={id} className="t-h2">
          {title}
        </h2>
        <div className="mt-10 grid gap-10">{children}</div>
      </div>
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="t-label text-fg-muted">{children}</p>;
}

/**
 * The QA-only kit page: every component of the System in its states, so that the critic (and the harness) can see them while no page
 * uses them yet. It answers 404 unless the site was built with `KIT=1`, is never linked and never in the sitemap.
 * Run:  KIT=1 npm run qa -- --pages /kit --label system-kit
 */
export default async function KitPage({ params }: { params: Promise<{ lang: string }> }) {
  if (process.env.KIT !== "1") notFound();
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;
  const d = t(lang);
  // the sample data is the Greek content in both languages: the kit is a QA page, its words are not translated
  const c = cms("el");

  const glass = c.groupByKey("yalopinakes");
  const families = c.categoriesOf(glass);
  const float = c.categories["koinoi-float-yalopinakes"];
  const product = c.products["vammenoi-yalopinakes"];
  const cast = c.products["akrylika-fylla-chyta-cast"];
  const photos: GalleryItem[] = product.gallery.slice(0, 7).map((m, i) => ({ src: m.src, alt: m.caption ?? `${product.title}, εικόνα ${i + 1}`, caption: m.caption }));
  const withFilm: GalleryItem[] = [{ ...photos[0], loop: TEST_LOOP }, ...photos.slice(1, 4)];
  const gauge = productThickness("diafanoi-yalopinakes");
  const tables = splitSpecHtml(product.tabs[0].html).flatMap((b) => (b.kind === "table" ? [b.table] : []));
  const matrix = splitSpecHtml(cast.tabs[0].html).flatMap((b) => (b.kind === "table" ? [b.table] : []));
  const loopSlot: Slot = { still: { src: "/media/kit-test-poster.jpg", alt: TEST_LOOP.poster.alt }, loop: TEST_LOOP };

  const short = (table: (typeof tables)[number], rows: number) => ({ ...table, rows: table.rows.slice(0, table.headRows + rows) });

  return (
    <>
      <PageHero variant="index" lang={lang} crumbs={[{ label: "Kit" }]} title="Σύστημα" facts="Kit · QA only" lead="Κάθε στοιχείο του συστήματος σε όλες τις καταστάσεις του: τύπος, θέματα, μετρητές, πλάκες, πίνακες, μέσα και το σχέδιο της μηχανής." />

      <Section id="kit-type" title="Κλίμακα τύπου">
        <div className="grid gap-4">
          <p className="t-giga">13.000</p>
          <p className="t-mega">Mega</p>
          <p className="t-display">Display</p>
          <p className="t-h1">Heading 1 · Επικεφαλίδα</p>
          <p className="t-h2">Heading 2 · Επικεφαλίδα</p>
          <p className="t-h3">Heading 3 · Επικεφαλίδα</p>
          <p className="t-lead max-w-[60ch]">Lead: Εισαγωγή και εμπορία υαλοπινάκων και πλαστικών φύλλων, με πολύ μεγάλη γκάμα ειδών και διαστάσεων.</p>
          <p className="t-body max-w-[68ch] text-fg-muted">Body: Τα εμπορεύματα αποθηκεύονται σε κατάλληλα διαμορφωμένους χώρους και μεταφορτώνονται στα ειδικά φορτηγά.</p>
          <p className="t-small text-fg-muted">Small: λεζάντες, στοιχεία μενού, μικρά γράμματα.</p>
          <p className="t-data">Data: 2.100 × 6.050 mm · 04 mm · 1999</p>
          <p className="t-label text-fg-muted">
            Label: <Units>ΠΑΧΟΣ 2–19 mm · 22,20 m² · 9 kW</Units>
          </p>
        </div>
      </Section>

      <section aria-label="Θέματα" className="bg-surface">
        <div className="grid grid-cols-2">
          {(["frost", "mist", "night", "deep"] as const).map((theme) => (
            <div key={theme} data-theme={theme} className="bg-surface px-4 py-8 md:px-[var(--gutter)] md:py-12">
              <p className="t-label text-accent">{theme}</p>
              <p className="t-h3 mt-2">fg</p>
              <p className="t-body text-fg-muted">fg-muted</p>
              <p className="t-small text-fg-dim">fg-dim · ετικέτες</p>
              <p className="t-small text-signal">! σφάλμα με λέξεις</p>
              <div className="mt-4 bg-surface-2 p-3">
                <p className="t-small text-fg">fg σε surface-2</p>
                <p className="t-small text-fg-muted">fg-muted</p>
                <p className="t-small text-fg-dim">fg-dim</p>
                <p className="t-small text-accent">accent</p>
                <p className="t-small text-signal">! σφάλμα</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Section id="kit-gauge" title="EdgeGauge" theme="mist">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Note>sm · 2–19 mm</Note>
            <EdgeGauge values={gauge} size="sm" lang={lang} className="mt-4" />
          </div>
          <div>
            <Note>md · 2–19 mm</Note>
            <EdgeGauge values={gauge} size="md" lang={lang} className="mt-4" />
          </div>
          <div>
            <Note>μία τιμή · οικογένεια</Note>
            <EdgeGauge values={[6]} size="md" lang={lang} className="mt-4" />
            <EdgeGauge values={familyThickness(float)} size="sm" lang={lang} className="mt-4" />
          </div>
        </div>
        <EdgeGauge values={gauge} size="lg" label={d.common.availableThickness} lang={lang} />
      </Section>

      <Section id="kit-plates" title="Πλάκες δειγμάτων">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          <SpecimenPlate src={product.gallery[0].src} alt={product.title} index={1} total={5} caption="Λεζάντα" lang={lang} sizes="(min-width: 768px) 22vw, 46vw" />
          <SpecimenPlate src={product.gallery[3].src} alt={product.title} index={2} total={5} lang={lang} sizes="(min-width: 768px) 22vw, 46vw" />
          {families.slice(0, 2).map((cat, i) => (
            <SpecimenCard key={cat.slug} lang={lang} href={c.categoryHref(cat)} title={cat.title} image={cat.image} index={i + 1} values={familyThickness(cat)} sizes="(min-width: 768px) 22vw, 46vw" />
          ))}
        </div>
      </Section>

      <Section id="kit-index" title="EdgeIndex" theme="mist">
        <EdgeIndex
          lang={lang}
          rows={families.slice(0, 3).map((cat) => ({
            href: c.categoryHref(cat),
            title: cat.title,
            summary: cat.summary,
            image: cat.image,
            count: cat.products.length,
            values: familyThickness(cat),
          }))}
        />
      </Section>

      <Section id="kit-spec" title="SpecPlate και SpecTable" theme="mist">
        <SpecPlate
          items={[
            { label: "Ίδρυση", value: "1999" },
            { label: "Εγκαταστάσεις", value: "13.000", unit: "τ.μ." },
            { label: "Οικογένειες", value: "9" },
            { label: "Κωδικοί", value: String(c.productCount) },
          ]}
        />
        <SpecPlate layout="list" items={d.machine.spec.slice(0, 3).map((r) => ({ label: r.term, value: r.value }))} />
        {tables[0] && <SpecTable table={short(tables[0], 4)} label={`${product.title}: προδιαγραφές`} />}
        {matrix[0] && <SpecTable table={short(matrix[0], 4)} label={`${cast.title}: προδιαγραφές`} />}
      </Section>

      <Section id="kit-marquee" title="Marquee και AttikiExit">
        <Marquee items={d.home.plasticsMarquee} />
        <div className="max-w-3xl">
          <AttikiExit lang={lang} />
        </div>
      </Section>

      <Section id="kit-media" title="MediaSlot" theme="night">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Note>still</Note>
            <MediaSlot slot={slots.warehouse} ratio="16 / 9" ratioMd="4 / 3" sizes="(min-width: 768px) 30vw, 100vw" className="mt-4" />
          </div>
          <div>
            <Note>κενή θέση · σχέδιο ως εναλλακτική</Note>
            <MediaSlot slot={slots.machineFilm} ratio="16 / 9" ratioMd="4 / 3" fallback={<MachineBlueprint lang={lang} variant="mini" />} className="mt-4" />
          </div>
          <div>
            <Note>loop · poster πρώτα</Note>
            <MediaSlot slot={loopSlot} ratio="16 / 9" ratioMd="4 / 3" sizes="(min-width: 768px) 30vw, 100vw" lang={lang} className="mt-4" />
          </div>
        </div>
      </Section>
      <DroneBand slot={slots.drone} caption={geoCaption(lang)} lang={lang} />
      <DroneBand slot={loopSlot} caption={geoCaption(lang)} lang={lang} theme="deep" />

      <Section id="kit-gallery" title="MediaGallery και Lightbox">
        <MediaGallery items={photos} layout="strip" lang={lang} label="Γκαλερί προϊόντος" />
        <MediaGallery items={withFilm} layout="plates" lang={lang} label="Πλάκες" />
        <MediaGallery items={photos.slice(0, 4)} layout="editorial" lang={lang} label="Ύφος έργου" />
        <LightboxFrame items={photos.map((p) => ({ ...p, w: null, h: null }))} lang={lang} start={1} />
      </Section>

      <Section id="kit-blueprint" title="MachineBlueprint" theme="deep">
        <div className="grid gap-4">
          <Note>full · landscape</Note>
          <MachineBlueprint lang={lang} variant="full" />
        </div>
        <div className="grid gap-4">
          <Note>band</Note>
          <MachineBlueprint lang={lang} variant="band" />
        </div>
        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
          <div className="mx-auto grid w-full max-w-[16rem] gap-4">
            <Note>full · portrait</Note>
            <MachineBlueprint lang={lang} variant="full" orientation="portrait" />
          </div>
          <div className="grid gap-6">
            <Note>
              mini · {formatMm(600, 1200)} · {formatMm(2500, 1500)} · {formatMm(2500, 6100)}
            </Note>
            <MachineBlueprint lang={lang} variant="mini" piece={{ w: 600, h: 1200 }} id="bp-fit" />
            <MachineBlueprint lang={lang} variant="mini" piece={{ w: 2500, h: 1500 }} id="bp-rot" />
            <MachineBlueprint lang={lang} variant="mini" piece={{ w: 2500, h: 6100 }} id="bp-out" />
            <p className="t-label text-fg-muted">
              <Units>{`ΣΥΝΟΛΟ: 11 ΤΕΜΑΧΙΑ · ${formatArea(22.2)}`}</Units>
            </p>
          </div>
        </div>
        <div data-theme="mist" className="bg-surface p-6">
          <Note>mini · ανοιχτός τόνος (εκτιμητής)</Note>
          <div className="mt-4 max-w-xl">
            <MachineBlueprint lang={lang} variant="mini" tone="light" piece={{ w: 2500, h: 6100 }} id="bp-light" />
          </div>
        </div>
      </Section>

      <Cta lang={lang} variant="cnc" />
    </>
  );
}
