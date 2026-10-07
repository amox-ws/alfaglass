"use client";

import { MotionConfig } from "motion/react";

/** Everything animated by Motion (menus, gallery, hover previews) respects the visitor's reduced-motion setting. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
