import React from "react";

export interface EmptyStateProps {
  /** Path or URL to the illustration shown above the title. */
  image?: string;
  /** Alt text for the illustration. Empty string by default (decorative). */
  imageAlt?: string;
  /** Bold headline. */
  title?: string;
  /** Supporting copy under the headline. */
  description?: string;
  /** Optional extra classes applied to the outer wrapper. */
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  image = "/empty2.png",
  imageAlt = "",
  title = "No applications pending approval",
  description = "You\u2019re all caught up! New applications will appear here when they\u2019re ready for review",
  className = "",
}) => {
  return (
    <div
      className={`flex min-h-screen w-full items-start justify-center bg-white pt-30 ${className}`}
    >
      <div className="flex max-w-[520px] flex-col items-center text-center">
        <img
          src={image}
          alt={imageAlt}
          draggable={false}
          className="mb-8 h-auto w-[232px] select-none pointer-events-none"
        />

        <h2 className="m-0 text-[22px] font-medium leading-tight tracking-tight text-[#0b1220]">
          {title}
        </h2>

        <p className="mt-2.5 mb-0 max-w-[420px] text-[15px]  leading-[1.55] text-[#8a91a3]">
          {description}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
