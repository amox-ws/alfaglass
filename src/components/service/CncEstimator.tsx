"use client";

import { useEffect, useRef, useState } from "react";
import { MachineBlueprint } from "@/components/kit/MachineBlueprint";
import { Units } from "@/components/kit/Units";
import { contact, enquiryHref } from "@/lib/contact";
import { t, type Lang } from "@/lib/i18n";
import { BED, MATERIALS, STOCKED, formatArea, formatMm, type MaterialKey } from "@/lib/machine";
import { MAX_MAILTO, MAX_NOTE, MAX_ROWS, buildList, newRow, parseThickness, pieceState, totals, validPieces, type Row, type Valid } from "./estimator-logic";

const STOCK_KEYS = MATERIALS.filter((k) => STOCKED[k]);
const OTHER_KEYS = MATERIALS.filter((k) => !STOCKED[k] && k !== "other");
const isMaterial = (v: string | null): v is MaterialKey => v !== null && (MATERIALS as readonly string[]).includes(v);

const fmt = (n: number) => String(n).replace(".", ",");

/** "Πάχος (mm)" inside an uppercase label: the unit keeps its SI case ("MM" would be mega-metres). */
const unitize = (text: string) => text.split(/(mm)/).map((part, i) => (part === "mm" ? <span key={i} className="unit">mm</span> : part));

function Icon({ kind }: { kind: "ok" | "warn" | "plus" | "x" | "copy" }) {
  const paths = {
    ok: <path d="M3 8.5 6.5 12 13 4.5" />,
    warn: (
      <>
        <path d="M8 3v6" />
        <path d="M8 12v.5" />
      </>
    ),
    plus: <path d="M8 3v10M3 8h10" />,
    x: <path d="m4 4 8 8M12 4l-8 8" />,
    copy: (
      <>
        <rect x="5.5" y="5.5" width="8" height="8" />
        <path d="M10.5 5.5v-3h-8v8h3" />
      </>
    ),
  } as const;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden className="shrink-0">
      {paths[kind]}
    </svg>
  );
}

/**
 * "Έλεγχος & αίτημα κοπής": the estimator of the cutting service. A real form, no backend: it checks the geometry against the machine's
 * working area (2.100 × 6.050 mm) and writes the email, and the buyer's mail program (or the phone) does the rest. No prices, no
 * delivery dates, no nesting, no files, nothing stored, nothing sent from here. The page's only client component, below the fold.
 */
export function CncEstimator({ lang, thickness }: { lang: Lang; thickness: Record<string, number[]> }) {
  const d = t(lang);
  const e = d.estimator;
  const bed = formatMm(BED.x, BED.y, d.locale);

  const [material, setMaterial] = useState<MaterialKey | "">("");
  const [chip, setChip] = useState(""); // a stocked thickness ("5") or "other"
  const [thick, setThick] = useState(""); // the number field
  const [rows, setRows] = useState<Row[]>([newRow(1)]);
  const [active, setActive] = useState(1);
  const [note, setNote] = useState("");
  const [announce, setAnnounce] = useState("");
  const [copied, setCopied] = useState<"" | "ok" | "fail">("");
  const [copiedFor, setCopiedFor] = useState("");
  const nextId = useRef(2);

  // ?material=<key>&t=<mm> from the product pages: read once, after the first paint (the page is static, so no useSearchParams)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const q = new URLSearchParams(window.location.search);
      const m = q.get("material");
      if (!isMaterial(m)) return;
      setMaterial(m);
      const mm = parseThickness(q.get("t") ?? "");
      if (mm === null) return;
      if (thickness[m]?.includes(mm)) setChip(String(mm));
      else {
        setChip(thickness[m]?.length ? "other" : "");
        setThick(fmt(mm));
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [thickness]);

  const stocked = material !== "" && Boolean(STOCKED[material]);
  const chips = material !== "" ? (thickness[material] ?? []) : [];
  const typedThickness = stocked && chips.length && chip !== "other" ? chip : thick;
  const thicknessValue = typedThickness.trim() ? parseThickness(typedThickness) : null;
  const thicknessBad = typedThickness.trim() !== "" && thicknessValue === null;
  const thicknessText = thicknessValue === null ? "" : fmt(thicknessValue);

  const pieces = validPieces(rows);
  const sum = totals(pieces);
  const materialName = material ? d.machine.materials[material] : "";
  const list = buildList({ d: e, locale: d.locale, material: materialName, thickness: thicknessText, pieces, note });
  const href = enquiryHref({ subject: list.subject, body: list.body });
  const tooLong = href.length > MAX_MAILTO;
  const ready = material !== "" && pieces.length > 0 && !thicknessBad;

  // The piece on the drawing: the one being edited, else the largest
  const shown: Valid | undefined = pieces.find((p) => p.id === active) ?? [...pieces].sort((a, b) => b.w * b.h - a.w * a.h)[0];

  const update = (fn: (rows: Row[]) => Row[]) => {
    const next = fn(rows);
    // announce the first piece whose verdict changed (one polite message, not a stream)
    const before = new Map(validPieces(rows).map((p) => [p.id, p.fit]));
    const changed = validPieces(next).find((p) => before.get(p.id) !== p.fit);
    if (changed) setAnnounce(e.live[changed.fit](changed.n));
    setRows(next);
  };
  const patch = (id: number, fields: Partial<Row>) => update((r) => r.map((row) => (row.id === id ? { ...row, ...fields } : row)));

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return;
    const id = nextId.current++;
    update((r) => [...r, newRow(id)]);
    setActive(id);
    requestAnimationFrame(() => document.getElementById(`est-w-${id}`)?.focus());
  };
  const removeRow = (id: number, index: number) => {
    update((r) => (r.length === 1 ? [newRow(nextId.current++)] : r.filter((row) => row.id !== id)));
    const neighbour = rows[index + 1] ?? rows[index - 1];
    requestAnimationFrame(() => document.getElementById(neighbour ? `est-w-${neighbour.id}` : "est-add")?.focus());
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(list.body);
      setCopied("ok");
      setAnnounce(e.copied);
    } catch {
      setCopied("fail");
      setAnnounce(e.copyFailed);
    }
    setCopiedFor(list.body);
  };
  const copyState = copiedFor === list.body ? copied : "";

  const selectMaterial = (value: string) => {
    setMaterial(isMaterial(value) ? value : "");
    setChip("");
    setThick("");
  };

  return (
    <form className="est" onSubmit={(ev) => ev.preventDefault()} noValidate>
      <div className="est-layout">
        <div className="est-main">
          {/* 1 · material */}
          <fieldset className="est-step">
            <legend className="est-legend">
              <span className="est-no t-label">1</span>
              <span className="t-h3">{e.stepMaterial}</span>
            </legend>
            <label htmlFor="est-material" className="sr-only">
              {e.materialLabel}
            </label>
            <select id="est-material" className="est-input est-select" value={material} onChange={(ev) => selectMaterial(ev.target.value)}>
              <option value="">{e.materialPlaceholder}</option>
              <optgroup label={e.groupStock}>
                {STOCK_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {d.machine.materials[k]}
                  </option>
                ))}
              </optgroup>
              <optgroup label={e.groupOther}>
                {OTHER_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {d.machine.materials[k]}
                  </option>
                ))}
                <option value="other">{e.otherMaterial}</option>
              </optgroup>
            </select>
          </fieldset>

          {/* 2 · thickness */}
          <fieldset className="est-step">
            <legend className="est-legend">
              <span className="est-no t-label">2</span>
              <span className="t-h3">{unitize(e.stepThickness)}</span>
              <span className="t-label text-fg-muted">{e.optional}</span>
            </legend>
            {stocked && chips.length > 0 && (
              <div role="radiogroup" aria-label={e.thicknessChips} className="est-chips">
                {chips.map((mm) => (
                  <label key={mm} className="est-chip t-data">
                    <input type="radio" name="est-chip" value={String(mm)} checked={chip === String(mm)} onChange={() => setChip(String(mm))} className="sr-only" />
                    {fmt(mm)}
                  </label>
                ))}
                <label className="est-chip t-data">
                  <input type="radio" name="est-chip" value="other" checked={chip === "other"} onChange={() => setChip("other")} className="sr-only" />
                  {e.thicknessOther}
                </label>
              </div>
            )}
            {(!stocked || chips.length === 0 || chip === "other") && (
              <div className={`est-f ${stocked && chips.length > 0 ? "mt-4" : ""}`}>
                <label htmlFor="est-thickness" className="t-label text-fg-muted">
                  {unitize(e.thicknessInput)}
                </label>
                <input
                  id="est-thickness"
                  className="est-input"
                  inputMode="decimal"
                  autoComplete="off"
                  value={thick}
                  onChange={(ev) => setThick(ev.target.value)}
                  aria-invalid={thicknessBad || undefined}
                  aria-describedby={thicknessBad ? "est-thickness-err" : undefined}
                />
                {thicknessBad && (
                  <p id="est-thickness-err" className="est-status" data-fit="out">
                    <Icon kind="warn" />
                    <span>{e.thicknessInvalid}</span>
                  </p>
                )}
              </div>
            )}
          </fieldset>

          {/* 3 · pieces */}
          <fieldset className="est-step">
            <legend className="est-legend">
              <span className="est-no t-label">3</span>
              <span className="t-h3">{e.stepPieces}</span>
            </legend>
            <div className="est-head t-label text-fg-muted" aria-hidden>
              <span>#</span>
              <span>{unitize(e.width)}</span>
              <span>{unitize(e.length)}</span>
              <span>{e.qty}</span>
              <span>{e.status}</span>
              <span />
            </div>
            <ol className="est-rows">
              {rows.map((row, i) => {
                const n = i + 1;
                const state = pieceState(row);
                const showError = row.touched && (state.kind === "need-size" || state.kind === "need-qty");
                const errId = `est-err-${row.id}`;
                const sizeBad = row.touched && state.kind === "need-size";
                const mark = () => !row.touched && patch(row.id, { touched: true });
                return (
                  <li key={row.id} className="est-row" data-active={active === row.id ? "" : undefined} onFocusCapture={() => setActive(row.id)}>
                    <p className="est-n t-label">
                      <span className="est-n-word">{e.piece(n)}</span>
                      <span className="est-n-num" aria-hidden>
                        {String(n).padStart(2, "0")}
                      </span>
                    </p>
                    <div className="est-f">
                      <label htmlFor={`est-w-${row.id}`} className="est-lab t-label text-fg-muted">
                        <span className="sr-only">{e.piece(n)}: </span>
                        {unitize(e.width)}
                      </label>
                      <input
                        id={`est-w-${row.id}`}
                        className="est-input"
                        inputMode="numeric"
                        autoComplete="off"
                        value={row.w}
                        onChange={(ev) => patch(row.id, { w: ev.target.value })}
                        onBlur={mark}
                        aria-invalid={sizeBad || undefined}
                        aria-describedby={showError ? errId : `est-s-${row.id}`}
                      />
                    </div>
                    <div className="est-f">
                      <label htmlFor={`est-h-${row.id}`} className="est-lab t-label text-fg-muted">
                        <span className="sr-only">{e.piece(n)}: </span>
                        {unitize(e.length)}
                      </label>
                      <input
                        id={`est-h-${row.id}`}
                        className="est-input"
                        inputMode="numeric"
                        autoComplete="off"
                        value={row.h}
                        onChange={(ev) => patch(row.id, { h: ev.target.value })}
                        onBlur={mark}
                        aria-invalid={sizeBad || undefined}
                        aria-describedby={showError ? errId : `est-s-${row.id}`}
                      />
                    </div>
                    <div className="est-f">
                      <label htmlFor={`est-q-${row.id}`} className="est-lab t-label text-fg-muted">
                        <span className="sr-only">{e.piece(n)}: </span>
                        {e.qty}
                      </label>
                      <input
                        id={`est-q-${row.id}`}
                        className="est-input"
                        inputMode="numeric"
                        autoComplete="off"
                        value={row.q}
                        onChange={(ev) => patch(row.id, { q: ev.target.value })}
                        onBlur={mark}
                        aria-invalid={(row.touched && state.kind === "need-qty") || undefined}
                        aria-describedby={showError ? errId : `est-s-${row.id}`}
                        // Enter in the last quantity field adds the next row (it never submits the form)
                        onKeyDown={(ev) => {
                          if (ev.key !== "Enter") return;
                          ev.preventDefault();
                          if (i === rows.length - 1) addRow();
                        }}
                      />
                    </div>
                    <div className="est-state">
                      {state.kind === "ok" && (
                        <p id={`est-s-${row.id}`} className="est-status" data-fit={state.fit}>
                          <Icon kind={state.fit === "out" ? "warn" : "ok"} />
                          <span>
                            {state.fit === "fits" ? e.fits : state.fit === "rotated" ? e.rotated : e.out(bed)}
                            {state.fit === "out" && <span className="est-help">{e.outHelp}</span>}
                          </span>
                        </p>
                      )}
                      {state.kind !== "ok" && (
                        <p id={showError ? errId : `est-s-${row.id}`} className="est-status" data-fit={showError ? "out" : "idle"}>
                          {showError && (
                            <>
                              <Icon kind="warn" />
                              <span>{state.kind === "need-qty" ? e.needQty : e.needSize}</span>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    <button type="button" className="est-rm" aria-label={e.remove(n)} onClick={() => removeRow(row.id, i)}>
                      <Icon kind="x" />
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button id="est-add" type="button" className="est-btn est-btn-line est-btn-sm" onClick={addRow} disabled={rows.length >= MAX_ROWS}>
                <Icon kind="plus" />
                {e.add}
              </button>
              {rows.length >= MAX_ROWS && <p className="t-small text-fg-muted">{e.maxPieces}</p>}
            </div>
          </fieldset>

          {/* 4 · note */}
          <div className="est-step">
            <div className="est-legend">
              <span className="est-no t-label">4</span>
              <label htmlFor="est-note" className="t-h3">
                {e.stepNote}
              </label>
              <span className="t-label text-fg-muted">{e.optional}</span>
            </div>
            <textarea
              id="est-note"
              className="est-input est-note"
              rows={3}
              maxLength={MAX_NOTE}
              value={note}
              onChange={(ev) => setNote(ev.target.value)}
              aria-describedby="est-note-help"
            />
            <p id="est-note-help" className="est-note-help t-label text-fg-muted">
              <span>{e.noteHelp}</span>
              <span className="tabular">{e.noteCount(note.length, MAX_NOTE)}</span>
            </p>
          </div>
        </div>

        {/* The live summary: the piece drawn to scale, the totals, the send buttons */}
        <aside className="est-panel" aria-label={e.summary}>
          <MachineBlueprint lang={lang} variant="mini" tone="light" piece={shown ? { w: shown.w, h: shown.h } : undefined} id="bp-est" />
          {shown && (
            <p className="est-drawn t-label text-fg-muted">
              <Units>{e.drawn(shown.n, formatMm(shown.w, shown.h, d.locale))}</Units>
            </p>
          )}
          <p className="est-total t-label">
            <Units>{e.total(e.pieces(sum.count), formatArea(sum.area, d.locale))}</Units>
          </p>
          {sum.out.length > 0 && (
            <p className="est-status" data-fit="out">
              <Icon kind="warn" />
              <span>{e.outList(sum.out.join(", "))}</span>
            </p>
          )}
          <p className="t-small text-fg-muted">{e.scope}</p>

          <div className="est-send">
            {!tooLong ? (
              ready ? (
                <a href={href} className="est-btn est-btn-solid">
                  {e.send}
                </a>
              ) : (
                <button type="button" className="est-btn est-btn-solid" disabled>
                  {e.send}
                </button>
              )
            ) : (
              <p className="t-small text-fg-muted">{e.tooLong}</p>
            )}
            <button type="button" className={`est-btn ${tooLong ? "est-btn-solid" : "est-btn-line"}`} disabled={!ready} onClick={copy}>
              <Icon kind="copy" />
              {e.copy}
            </button>
            {!ready && <p className="t-small text-fg-muted">{e.needFirst}</p>}
            {ready && !tooLong && <p className="t-small text-fg-muted">{e.attach}</p>}
            {copyState === "ok" && (
              <p className="est-status" data-fit="fits">
                <Icon kind="ok" />
                <span>{e.copied}</span>
              </p>
            )}
            {copyState === "fail" && (
              <>
                <p className="est-status" data-fit="out">
                  <Icon kind="warn" />
                  <span>{e.copyFailed}</span>
                </p>
                <label htmlFor="est-list" className="sr-only">
                  {e.listLabel}
                </label>
                <textarea id="est-list" className="est-input est-note" rows={6} readOnly value={list.body} onFocus={(ev) => ev.target.select()} />
              </>
            )}
            <p className="t-small text-fg-muted">
              {e.copyHelp}{" "}
              <a href={`mailto:${contact.email}`} className="inline-link t-small font-mono text-fg">
                {contact.email}
              </a>
            </p>
            <a href={contact.phoneHref} className="est-btn est-btn-line">
              {e.call} <span className="t-data tabular">{d.contact.phone}</span>
            </a>
          </div>
        </aside>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
    </form>
  );
}

