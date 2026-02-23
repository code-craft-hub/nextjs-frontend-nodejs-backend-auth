import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadMoreButtonProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  label?: string;
}

/**
 * Renders a "Load More" button only when there is a next page.
 * Returns null when `hasNextPage` is false so callers don't need to guard.
 */
export function LoadMoreButton({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  label = "Load More",
}: LoadMoreButtonProps) {
  if (!hasNextPage) return null;

  return (
    <div className="mt-4 flex justify-center">
      <Button onClick={onLoadMore} disabled={isFetchingNextPage} variant="outline">
        {isFetchingNextPage ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading more…
          </>
        ) : (
          label
        )}
      </Button>
    </div>
  );
}
