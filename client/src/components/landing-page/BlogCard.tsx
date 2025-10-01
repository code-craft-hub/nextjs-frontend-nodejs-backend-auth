import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { customDate } from "@/lib/utils/helpers";

interface BlogCardProps {
  items: Article;
  handleNavigate: (items: Article) => void;
  onHover?: (items: string) => void;
}

const BlogCard = ({ items, handleNavigate, onHover }: BlogCardProps) => {
  const [hasHovered, setHasHovered] = useState(false);

  const handleMouseEnter = () => {
    if (!hasHovered && onHover) {
      setHasHovered(true);
      onHover(items.id);
    }
  };

  const removeHype = (value: string | null | undefined): string => {
    return value ? value.replace(/-/ig, " ") : "";
  }
  return (
    <div
      key={items.id}
      className="h-full flex flex-col justify-between"
      onMouseEnter={handleMouseEnter}
    >
      <div className="relative mx-auto w-full aspect-auto h-64 overflow-hidden rounded-xl">
        <img
          src={items?.blog_cover || "/assets/default-thumbnail.png"}
          alt="Blog cover"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-in-out hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="space-y-4 my-4">
        <div className="flex gap-4 items-center">
          <CalendarDays className="text-muted-foreground size-4" />
          <p className="text-xs text-muted-foreground">
            {customDate({ input: items?.createdAt })}
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-blue-500 text-xl line-clamp-2 capitalize">
            {removeHype(items?.category)}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {items?.title}
          </p>
        </div>

        <Separator className="bg-gray-300" />

        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-2 items-center">
            <img
              src={items?.author_avatar || "/assets/default-avatar.png"}
              alt={items?.author_name || "Author avatar"}
              className="w-8 h-8 rounded-full object-cover"
              loading="lazy"
            />
            <p className="text-sm">{items?.author_name}</p>
          </div>

          <Button
            size="sm"
            onClick={() => handleNavigate(items)}
            className="flex gap-2 items-center"
          >
            Read More
            <img
              src="/assets/icons/blog-arrow.svg"
              className="w-4 h-4"
              alt="Arrow icon"
              loading="lazy"
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;

export const BlogCardSkeleton = () => (
  <div className="w-fit space-y-4">
    <Skeleton className="w-64 h-40 rounded-3xl" />
    <div className="space-y-2">
      <Skeleton className="w-32 h-4" />
      <Skeleton className="w-48 h-6" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-1/2 h-4" />
    </div>
    <Separator className="bg-muted" />
    <div className="flex justify-between items-center mt-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-24 h-4" />
      </div>
      <Skeleton className="w-24 h-8 rounded-md" />
    </div>
  </div>
);