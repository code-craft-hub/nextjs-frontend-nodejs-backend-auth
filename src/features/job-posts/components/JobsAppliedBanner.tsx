import { RunsBellPopover } from "./RunsBellPopover";

export default function JobsAppliedBanner({
  appliedSize,
}: {
  appliedSize: number;
}) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-10">
        {/* Main pill */}
        <div
          className="
            flex p-2 flex-1 items-center justify-between
            rounded-[999px] bg-white
            shadow-[0_18px_40px_rgba(0,0,0,0.10)]
          "
        >
          {/* Center text */}
          <div className="flex-1 text-center">
            <span className="text-lg font-semibold tracking-[-0.03em] text-black">
              {appliedSize}
            </span>
            <span className="ml-4 text-lg font-normal tracking-[-0.03em] text-black">
              jobs applied.
            </span>
          </div>

          {/* Notification button */}
          <RunsBellPopover />
        </div>

        {/* Filter icon */}
        <button
          className="flex items-center justify-center"
          aria-label="Filters"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-8"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <circle cx="15" cy="6" r="2" fill="white" />

            <line x1="4" y1="12" x2="20" y2="12" />
            <circle cx="9" cy="12" r="2" fill="white" />

            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="14" cy="18" r="2" fill="white" />
          </svg>
        </button>
      </div>
    </div>
  );
}
