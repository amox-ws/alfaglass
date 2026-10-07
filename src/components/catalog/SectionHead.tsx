import { Eyebrow } from "@/components/ui";

const TITLE_SIZE = { display: "t-display", h1: "t-h1", h2: "t-h2", h3: "t-h3" } as const;

/**
 * The section header of the catalogue and the CNC service (grid pattern P1: eyebrow and title in cols 1–7, intro and action in cols 9–12,
 * bottom-aligned), drawn as the shared `SectionHeader` draws it, but a server component whose entrance runs on a CSS scroll timeline
 * (`.rise`, `.rise-mask` in catalogue.css): the title rises out of its mask and the intro rises as they scroll into view, and nothing is
 * armed after hydration. `SectionHeader` and `Reveal` read the layout of every block they arm, which on a long page is a forced reflow each.
 */
export function SectionHead({
  id,
  index,
  eyebrow,
  title,
  as: Tag = "h2",
  size = "h1",
  intro,
  action,
  className = "",
}: {
  id?: string;
  index?: string;
  eyebrow?: React.ReactNode;
  title: string;
  as?: "h2" | "h3";
  size?: keyof typeof TITLE_SIZE;
  intro?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8 ${className}`}>
      <div className="lg:col-span-7">
        {eyebrow && <Eyebrow index={index}>{eyebrow}</Eyebrow>}
        <Tag id={id} className={`mask-lines rise-mask ${TITLE_SIZE[size]} ${eyebrow ? "mt-5" : ""}`}>
          <span className="mask-line">
            <span>{title}</span>
          </span>
        </Tag>
      </div>
      {(intro || action) && (
        <div className="lg:col-span-4 lg:col-start-9">
          {intro && <p className="rise t-body max-w-[44ch] text-fg-muted">{intro}</p>}
          {action && <div className={intro ? "mt-10" : ""}>{action}</div>}
        </div>
      )}
    </div>
  );
}
