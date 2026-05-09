import type { RefObject } from "react";

/**
 * A fixed, zero-size container that holds all hidden run iframes.
 *
 * Iframes are appended/styled imperatively by useRunManager — this
 * component only supplies the mount point. The stage is invisible but
 * present so Chrome doesn't throttle background-running frames.
 */
export function IframeStage({
  stageRef,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={stageRef}
      id="cverai-iframe-stage"
      aria-hidden="true"
      style={{
        // CRITICAL: no position, no z-index. Any positioned element with a
        // z-index creates a stacking context that traps child iframe z-indexes —
        // the modal backdrop (z 150) would end up visually ABOVE the iframe
        // (z 200) and intercept all clicks/render. Static positioning (default)
        // lets each iframe escape to the root stacking context.
        pointerEvents: "none",
      }}
    />
  );
}
