import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Table } from "@tanstack/react-table";
import { JobApplication } from "@/types";

const searchSchema = z.object({
  searchValue: z.string(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export interface SearchBarRef {
  handleClear: () => void;
}

interface SearchBarProps {
  allJobs?: JobApplication[];
  table?: Table<JobApplication>;
  onSearchValueChange?: (value: string) => void;
}

/**
 * Search bar used in SavedJobs and ApplicationHistory.
 * Supports text search, location filter, and employment-type filter
 * all wired to TanStack Table's built-in column filtering.
 */
export const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(
  function SearchBar({ allJobs, table, onSearchValueChange }, ref) {
    // ── All hooks declared first ─────────────────────────────────────────────
    const [showClearButton, setShowClearButton] = useState(false);
    const [location, setLocation] = useState(allJobs?.[0]?.location ?? "");
    const [employmentType, setEmploymentType] = useState(
      allJobs?.[0]?.employmentType ?? "",
    );
    const hasValueRef = useRef(false);

    const form = useForm<SearchFormValues>({
      defaultValues: { searchValue: "" },
    });

    // ── Imperative handle (defined after hooks) ──────────────────────────────
    useImperativeHandle(ref, () => ({ handleClear }));

    // ── Handlers ─────────────────────────────────────────────────────────────
    function handleClear() {
      form.reset();
      table?.getColumn("title")?.setFilterValue(undefined);
      table?.getColumn("employmentType")?.setFilterValue(undefined);
      table?.getColumn("location")?.setFilterValue(undefined);
      setLocation("");
      setEmploymentType("");
      setShowClearButton(false);
    }

    function clearAllColumnFilters() {
      table?.getColumn("location")?.setFilterValue(undefined);
      table?.getColumn("title")?.setFilterValue(undefined);
      table?.getColumn("employmentType")?.setFilterValue(undefined);
    }

    function handleLocationChange(value: string) {
      setLocation(value);
      table?.getColumn("location")?.setFilterValue(value);
    }

    function handleEmploymentTypeChange(value: string) {
      setEmploymentType(value);
      table?.getColumn("employmentType")?.setFilterValue(value);
    }

    function handleInputChange(
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: (...event: unknown[]) => void,
    ) {
      onChange(e);
      const hasValue = e.target.value.length > 0;
      if (hasValue !== hasValueRef.current) {
        hasValueRef.current = hasValue;
        setShowClearButton(hasValue);
      }
    }

    function onSubmit(values: SearchFormValues) {
      table?.getColumn("title")?.setFilterValue(values.searchValue);
      onSearchValueChange?.(values.searchValue);
    }

    // Unique option sets derived from the current job list
    const locationOptions = [
      ...new Set(allJobs?.map((job) => job.location).filter(Boolean)),
    ];
    const employmentTypeOptions = [
      ...new Set(allJobs?.map((job) => job.employmentType).filter(Boolean)),
    ];

    // ── Render ───────────────────────────────────────────────────────────────
    return (
      <div className="relative w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full grid grid-cols-1"
          >
            <Card className="w-full grid grid-cols-1 md:grid-cols-4 justify-between flex-row lg:items-center gap-2 px-4 py-4">
              {/* Text search */}
              <div className="relative p-1 lg:border-r lg:border-black/40 mr-1">
                <FormField
                  control={form.control}
                  name="searchValue"
                  render={({ field }) => (
                    <FormItem className="flex justify-between">
                      <FormControl>
                        <input
                          {...field}
                          onChange={(e) => handleInputChange(e, field.onChange)}
                          type="text"
                          placeholder="Job title / company name"
                          className="w-full outline-none pl-3 placeholder:text-xs"
                        />
                      </FormControl>
                      {showClearButton && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleClear}
                          className="h-9 w-9 hover:cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <img
                  src="/search-icon.svg"
                  className="absolute top-1/2 -translate-y-1/2 left-0 size-3"
                  alt=""
                />
              </div>

              {/* Location filter */}
              <div className="flex gap-1 items-center py-2 lg:border-r lg:border-black/40 pr-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full text-start text-black/60 border-none focus:border-none focus:outline-none flex text-xs line-clamp-1 text-nowrap overflow-hidden truncate">
                    <img src="/map.svg" className="size-4 mr-1" alt="" />
                    {location || "Location"}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel className="flex justify-between hover:cursor-pointer">
                      Select your location
                      <HoverCard>
                        <HoverCardTrigger>
                          <X
                            className="size-4 hover:cursor-pointer"
                            onClick={clearAllColumnFilters}
                          />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-fit">
                          <p>Clear all filters</p>
                        </HoverCardContent>
                      </HoverCard>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={location}
                      onValueChange={handleLocationChange}
                    >
                      {locationOptions.map((loc) => (
                        <DropdownMenuRadioItem key={loc} value={loc!}>
                          {loc}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Employment type filter */}
              <div className="flex gap-1 items-center py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full focus:outline-none">
                    <div className="flex flex-row gap-1 items-center w-full text-black/50">
                      <img
                        src="/search-location.svg"
                        className="size-4"
                        alt=""
                      />
                      <span className="text-black/50 text-xs">
                        {employmentType || "Job type"}
                      </span>
                      <img
                        src="/chevron-down.svg"
                        className="size-2 text-gray-300"
                        alt="chevron"
                      />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel className="flex justify-between hover:cursor-pointer">
                      Select Job type
                      <HoverCard>
                        <HoverCardTrigger>
                          <X
                            className="size-4 hover:cursor-pointer"
                            onClick={clearAllColumnFilters}
                          />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-fit">
                          <p>Clear all filters</p>
                        </HoverCardContent>
                      </HoverCard>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={employmentType}
                      onValueChange={handleEmploymentTypeChange}
                    >
                      {employmentTypeOptions.map((type) => (
                        <DropdownMenuRadioItem key={type} value={type!}>
                          {type}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* {showClearButton ? (
                <X
                  className="size-4 hover:cursor-pointer"
                  onClick={clearAllColumnFilters}
                />
              ) : ( */}
                <Button type="submit">Search</Button>
              {/* )} */}
            </Card>
          </form>
        </Form>
      </div>
    );
  },
);

SearchBar.displayName = "SearchBar";
