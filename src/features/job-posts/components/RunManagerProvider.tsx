"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useRunManager, type UseRunManager } from "../hooks/useRunManager";
import { IframeStage } from "./IframeStage";
import { RunModal } from "./RunModal";

interface RunManagerContextValue {
  enqueueJob: UseRunManager["enqueueJob"];
  openRunModal: UseRunManager["openRunModal"];
  /**
   * Stable accessor for the latest runs Map. Callbacks that only need a
   * snapshot when invoked (e.g. focusExtTab) should read through this
   * instead of subscribing to `runs` as reactive state — that keeps their
   * identity stable across the ~1/sec run_update ticks below, so consumers
   * elsewhere on the page don't re-render every tick.
   */
  getRuns: () => UseRunManager["runs"];
}

const RunManagerContext = createContext<RunManagerContextValue | null>(null);

export function useRunManagerContext(): RunManagerContextValue {
  const ctx = useContext(RunManagerContext);
  if (!ctx) {
    throw new Error(
      "useRunManagerContext must be used within RunManagerProvider",
    );
  }
  return ctx;
}

/**
 * Owns the run-tracking state (bell/modal/iframe stage) so its frequent
 * run_update ticks stay contained here instead of forcing the whole page
 * (job list, search form, etc.) to re-render on every broadcast.
 *
 * `children` is unaffected by this component's re-renders: the context
 * value below never changes identity (enqueueJob/openRunModal/getRuns are
 * all stable), and `children` itself is the same element reference on every
 * tick — so React bails out of re-rendering that subtree entirely.
 */
export function RunManagerProvider({ children }: { children: ReactNode }) {
  const {
    runs,
    modalRunId,
    iframeStageRef,
    enqueueJob,
    openRunModal,
    closeRunModal,
    repositionIframe,
    stopRun,
  } = useRunManager();

  const runsRef = useRef(runs);
  runsRef.current = runs;
  const getRuns = useCallback(() => runsRef.current, []);

  const value = useMemo<RunManagerContextValue>(
    () => ({ enqueueJob, openRunModal, getRuns }),
    [enqueueJob, openRunModal, getRuns],
  );

  const modalRun = modalRunId ? (runs.get(modalRunId) ?? null) : null;

  return (
    <RunManagerContext.Provider value={value}>
      {children}

      {/* Hidden iframe stage — iframes appended here imperatively by useRunManager */}
      <IframeStage stageRef={iframeStageRef} />

      {/* Run modal overlay — renders the top bar + log panel; iframe is
          positioned by useRunManager's CSS helpers (not inside this tree) */}
      <RunModal
        run={modalRun}
        onClose={closeRunModal}
        onStop={stopRun}
        onLogsToggle={repositionIframe}
      />
    </RunManagerContext.Provider>
  );
}
