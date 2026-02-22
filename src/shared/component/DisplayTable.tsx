import React from "react";

export default function DisplayTable({ job }: { job: any }) {
  const title: string = job?.title ?? "Untitled role";
  const company: string = job?.company ?? job?.organization ?? "Unknown";
  const location: string = job?.location ?? job?.city ?? "Remote";
  const postedAt = job?.postedAt ?? job?.createdAt ?? null;
  const snippet: string = job?.description
    ? String(job.description).slice(0, 180)
    : "";

  const href = `/dashboard/jobs/${job?.id}?referrer=dashboard&title=${encodeURIComponent(
    title,
  )}`;

  return (
    <article className="w-full border rounded-lg p-4 hover:shadow transition-shadow bg-white">
      {/* Desktop row layout */}
      <a href={href} className="hidden lg:flex gap-4 items-center">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="text-sm text-muted-foreground">
            {company} • {location}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {snippet}
            {snippet.length === 180 ? "..." : ""}
          </p>
        </div>
        <div className="w-40 text-right text-sm text-muted-foreground">
          {postedAt ? new Date(postedAt).toLocaleDateString() : ""}
        </div>
      </a>

      {/* Mobile card layout */}
      <a href={href} className="lg:hidden block">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-medium">{title}</h3>
              <div className="text-sm text-muted-foreground">{company}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {postedAt ? new Date(postedAt).toLocaleDateString() : ""}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">{location}</div>
          <p className="text-sm text-muted-foreground">
            {snippet}
            {snippet.length === 180 ? "..." : ""}
          </p>
        </div>
      </a>
    </article>
  );
}
