/**
 * The columns (of 12, at lg) of the cards of a list of `n` works, in the rhythm of the case studies: rows of 7 + 5, then 5 + 7, and so on,
 * with the last row always complete (three left: 4 + 4 + 4; two left: 6 + 6), so a filtered list never ends in a gap.
 * A module of its own, with no imports: the filters (a client component) use it, and must not pull the site's content into the browser.
 */
export function rhythm(n: number): number[] {
  const spans: number[] = [];
  let left = n;
  let flip = false;
  while (left > 0) {
    if (left === 1) {
      spans.push(8);
      left = 0;
    } else if (left === 2) {
      spans.push(6, 6);
      left = 0;
    } else if (left === 3) {
      spans.push(4, 4, 4);
      left = 0;
    } else {
      spans.push(...(flip ? [5, 7] : [7, 5]));
      flip = !flip;
      left -= 2;
    }
  }
  return spans;
}
