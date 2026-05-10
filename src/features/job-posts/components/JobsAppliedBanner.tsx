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
          <button
            className="
              flex size-10 items-center justify-center
              rounded-full
              border border-[hsl(0,0%,87%)]
              bg-white
            "
            aria-label="Notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6"
            >
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V4a2 2 0 1 0-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
              <path d="M9 17a3 3 0 0 0 6 0" />
            </svg>
          </button>
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
