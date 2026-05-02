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
        position: "fixed",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: -200,
      }}
    />
  );
}
