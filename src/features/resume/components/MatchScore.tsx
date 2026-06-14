
interface MatchScoreProps {
  percentage: number;
  label?: string;
}

export function MatchScore({
  percentage,
  label = "GOOD MATCH",
}: MatchScoreProps) {
  const normalizedValue = Math.max(0, Math.min(100, percentage));

  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-45 ">
        <svg
          viewBox="0 0 100 100"
          className="-rotate-90 h-full w-full"
          aria-label={`${normalizedValue}% match score`}
          role="img"
        >
          {/* Background ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="4"
          />

          {/* Progress ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#match-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition:
                "stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          <defs>
            <linearGradient
              id="match-gradient"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#00F5C4" />
              <stop offset="100%" stopColor="#2BB9FF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-end  leading-none">
            <span className="text-2xl font-light tracking-tight text-white">
              {normalizedValue}
            </span>

            <span className="mb-[0.08em] text-xl  font-semibold text-white">
              %
            </span>
          </div>
        </div>
      </div>

      <h2 className="mt-4 sm:mt-6 text-center text-xl font-bold tracking-wide text-white">
        {label}
      </h2>
    </div>
  );
}