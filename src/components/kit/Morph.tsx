import * as React from "react";

/**
 * The shared element of a product photo: the same `name` on a card and on the product page makes the browser morph one into the
 * other in 380ms (CSS in motion.css, `.morph`). A bonus, never a dependency: `ViewTransition` ships with the React canary that
 * Next's App Router uses, and where it is missing, or the browser has no View Transitions, the child simply renders.
 * Only one element on a page may carry a name.
 */
const ViewTransition = (React as unknown as { ViewTransition?: React.ComponentType<{ name?: string; share?: string; default?: string; children: React.ReactNode }> })
  .ViewTransition;

export function Morph({ name, children }: { name: string; children: React.ReactNode }) {
  if (!ViewTransition) return <>{children}</>;
  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
