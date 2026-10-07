"use client";

import { useMemo, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { rhythm } from "./rhythm";

export type BrowserItem = {
  slug: string;
  /** `"glass"` and the keys of `MATERIALS`. */
  materials: string[];
  /** The keys of `APPLICATIONS`. */
  applications: string[];
  /** The server-rendered `WorkCard`. */
  card: ReactNode;
};
export type FilterOption = { key: string; label: string; count: number };
export type BrowserLabels = {
  material: string;
  application: string;
  all: string;
  clear: string;
  none: string;
  filters: string;
  list: string;
  /** The live count for every possible number of works shown: counts[3] is "3 έργα" (the plural is the dictionary's, not the client's). */
  counts: string[];
};

/** `lg:col-span-*` as whole class names, so that Tailwind finds them. */
const LG: Record<number, string> = { 4: "lg:col-span-4", 5: "lg:col-span-5", 6: "lg:col-span-6", 7: "lg:col-span-7", 8: "lg:col-span-8" };

type State = { material: string; app: string };
const ALL: State = { material: "", app: "" };

/* ------------------------------------------------------------------ the address is the state */

/**
 * The filter lives in the address (`?material=acrylic&app=signage`), so the cutting service can link to `/erga?app=facade` and a filtered list
 * can be shared. It is read with `useSyncExternalStore`: the server (and the first client render) see no filter, which is the page as it
 * is in the HTML (every card, unfiltered); once hydrated the address decides. Changes are written with `history.replaceState`: no history entries.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}
const read = () => window.location.search;
const readOnServer = () => "";

function write(next: State) {
  const query = new URLSearchParams();
  if (next.material) query.set("material", next.material);
  if (next.app) query.set("app", next.app);
  const search = query.toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
  listeners.forEach((l) => l());
}

/** The cards re-flow inside a view transition (300ms, a shared name per card); instant without support or with reduced motion. */
function transition(run: () => void) {
  const root = document.documentElement;
  if (typeof document.startViewTransition !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    run();
    return;
  }
  root.dataset.vt = "filter";
  const done = () => {
    delete root.dataset.vt;
  };
  document.startViewTransition(() => flushSync(run)).finished.then(done, done);
}

/* ------------------------------------------------------------------ the component */

/**
 * The Έργα list: two filters (material, application) over the cards, which are all in the server HTML. From md the options are radio chips (at
 * least 44px tall, each with the number of works it holds); on a phone two native selects side by side. Filtering hides cards (the `hidden`
 * attribute) and re-flows the rest into the rhythm of the case studies (7 + 5, 5 + 7, 4 + 4 + 4, the last row always complete). A polite live
 * region says how many works are shown; an empty result says so and offers to clear the filters.
 */
export function WorksBrowser({
  items,
  materials,
  applications,
  labels,
}: {
  items: BrowserItem[];
  materials: FilterOption[];
  applications: FilterOption[];
  labels: BrowserLabels;
}) {
  const search = useSyncExternalStore(subscribe, read, readOnServer);
  const state = useMemo<State>(() => {
    const q = new URLSearchParams(search);
    const m = q.get("material") ?? "";
    const a = q.get("app") ?? "";
    return { material: materials.some((o) => o.key === m) ? m : "", app: applications.some((o) => o.key === a) ? a : "" };
  }, [search, materials, applications]);

  const apply = (next: State) => transition(() => write(next));

  const shown = useMemo(
    () => items.filter((it) => (!state.material || it.materials.includes(state.material)) && (!state.app || it.applications.includes(state.app))),
    [items, state],
  );
  const spans = useMemo(() => rhythm(shown.length), [shown.length]);
  const spanOf = new Map(shown.map((it, i) => [it.slug, spans[i]]));
  const filtered = state.material !== "" || state.app !== "";

  const groups = [
    { id: "material", label: labels.material, options: materials, value: state.material, set: (key: string) => apply({ ...state, material: key }) },
    { id: "app", label: labels.application, options: applications, value: state.app, set: (key: string) => apply({ ...state, app: key }) },
  ];

  return (
    <div className="works-browser">
      <div role="group" aria-label={labels.filters} className="works-filters">
        {/* from md: radio chips */}
        <div className="hidden gap-y-6 md:grid">
          {groups.map((g) => (
            <div key={g.id} role="radiogroup" aria-labelledby={`works-${g.id}-label`} className="works-chips">
              <span id={`works-${g.id}-label`} className="t-label text-fg-muted">
                {g.label}
              </span>
              <div className="works-chip-row">
                {[{ key: "", label: labels.all, count: items.length }, ...g.options].map((o) => (
                  <label key={o.key || "all"} className="works-chip">
                    <input type="radio" name={`works-${g.id}`} value={o.key} checked={g.value === o.key} onChange={() => g.set(o.key)} />
                    <span className="works-chip-face t-small">
                      {o.label}
                      <span className="works-chip-count t-label tabular">{o.count}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* on a phone: two selects side by side */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {groups.map((g) => (
            <label key={g.id} className="works-select">
              <span className="t-label text-fg-muted">{g.label}</span>
              <select value={g.value} onChange={(e) => g.set(e.target.value)} className="t-small">
                {[{ key: "", label: labels.all, count: items.length }, ...g.options].map((o) => (
                  <option key={o.key || "all"} value={o.key}>
                    {o.label} ({o.count})
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <p role="status" aria-live="polite" className="works-count t-label tabular text-fg-muted">
          {labels.counts[shown.length]}
        </p>
      </div>

      <ul aria-label={labels.list} className="works-grid mt-10 grid gap-x-8 gap-y-12 md:grid-cols-12 lg:items-end lg:gap-y-16">
        {items.map((it, i) => {
          const span = spanOf.get(it.slug);
          return (
            <li key={it.slug} hidden={span === undefined} className={`works-item md:col-span-6 ${span ? LG[span] : ""}`} style={{ "--vt": `work-${i}` } as CSSProperties}>
              {it.card}
            </li>
          );
        })}
      </ul>

      {shown.length === 0 && (
        <div className="mt-10 border-t border-line pt-10">
          <p className="t-lead">{labels.none}</p>
          {filtered && (
            <button type="button" onClick={() => apply(ALL)} className="btn-pill btn-pill-line mt-6">
              {labels.clear}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
