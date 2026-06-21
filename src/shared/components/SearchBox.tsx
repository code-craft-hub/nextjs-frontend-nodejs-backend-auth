import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

const SearchBox = ({
  onSubmit,
  onLocationChange,
  onClassificationChange,
  onWorkArrangementChange,
  initialQuery,
  country,
  classification,
  workArrangement,
}: {
  onSubmit: (data: any) => void;
  onLocationChange?: (location: string) => void;
  /** Relocation/visa-sponsorship status: "onsite" | "relocation". */
  onClassificationChange?: (classification: string) => void;
  /** Work location, independent of classification: "remote" | "hybrid" | "onsite". */
  onWorkArrangementChange?: (workArrangement: string) => void;
  /** Pre-fills the search input — used to restore state from the URL. */
  initialQuery?: string;
  /** Controls the country select — used to restore state from the URL. */
  country?: string;
  /** Controls the relocation select — used to restore state from the URL. */
  classification?: string;
  /** Controls the work-arrangement select — used to restore state from the URL. */
  workArrangement?: string;
}) => {
  const form = useForm<any>({
    defaultValues: {
      searchValue: initialQuery ?? "",
    },
  });

  const { watch, reset } = form;
  const watched = watch("searchValue");

  // Re-hydrate the input when the caller's restored value changes (e.g. on
  // back-navigation), without fighting the user's own keystrokes — only
  // applies when the field hasn't been touched away from the restored value.
  useEffect(() => {
    reset({ searchValue: initialQuery ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // Always-current mirror of `onSubmit` so the debounce timer below calls the
  // latest handler (avoids writing a request built from a stale searchParams
  // snapshot) without putting `onSubmit` in that effect's deps — onSubmit is
  // a new reference on every parent render (it closes over searchParams),
  // and including it there previously restarted the timer on every render
  // instead of only when the user typed, creating a self-sustaining loop:
  // fire → onSubmit → router.replace → new searchParams → new onSubmit →
  // effect deps change → fire again, forever.
  const onSubmitRef = useRef(onSubmit);
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSubmitRef.current(watched?.trim() ?? "");
    }, 500); // debounce 500ms

    return () => clearTimeout(handler);
  }, [watched]);

  return (
    <div className="bg-white shadow-lg px-2 grid grid-cols-1 sm:flex max-sm:pb-4 gap-4 justify-between rounded-lg items-center">
      <div className="flex items-center gap-2 w-full">
        <div className="ml-2">
          <img src="/search-icon.svg" alt="search icon" className="size-5" />
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex gap-2 w-full justify-between items-center"
          >
            <FormField
              control={form.control}
              name="searchValue"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <input
                      className="border-none focus:border-none focus:outline-none w-full bg-white! focus:bg-white! h-14"
                      placeholder="Job title / Company name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant={"ghost"}
              onClick={() => {
                reset({ searchValue: "" });
                onSubmit("");
              }}
              className={cn(
                form.getValues("searchValue") === "" ? "hidden" : "block",
              )}
            >
              <X />
            </Button>
          </form>
        </Form>
      </div>

      <FilterLocation value={country} onValueChange={onLocationChange} />
      <FilterWorkArrangement
        value={workArrangement}
        onValueChange={onWorkArrangementChange}
      />
      <FilterClassification
        value={classification}
        onValueChange={onClassificationChange}
      />
    </div>
  );
};

export default SearchBox;

// Canonical names — must match the scraper's localizedTo values exactly.
const SUPPORTED_COUNTRIES = [
  "Australia",
  "Canada",
  "Germany",
  "Ireland",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Singapore",
  "United Kingdom",
  "United States",
] as const;

export function FilterLocation({
  value,
  onValueChange,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <Select
      value={value || "all"}
      onValueChange={(val) => onValueChange?.(val === "all" ? "" : val)}
    >
      <SelectTrigger className="w-full sm:max-w-48 sm:border-0 sm:shadow-none">
        <SelectValue placeholder="Country" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Country</SelectLabel>
          <SelectItem value="all">All Countries</SelectItem>
          {SUPPORTED_COUNTRIES.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

/** Work location — independent of relocation status (see FilterClassification). */
export function FilterWorkArrangement({
  value,
  onValueChange,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <Select
      value={value || "all"}
      onValueChange={(val) => onValueChange?.(val === "all" ? "" : val)}
    >
      <SelectTrigger className="w-full sm:max-w-40 sm:border-0 sm:shadow-none">
        <SelectValue placeholder="Work Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Work Type</SelectLabel>
          <SelectItem value="all">All Work Types</SelectItem>
          <SelectItem value="remote">Remote</SelectItem>
          <SelectItem value="hybrid">Hybrid</SelectItem>
          <SelectItem value="onsite">Onsite</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

/** Relocation/visa-sponsorship status — independent of FilterWorkArrangement. */
export function FilterClassification({
  value,
  onValueChange,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <Select
      value={value || "all"}
      onValueChange={(val) => onValueChange?.(val === "all" ? "" : val)}
    >
      <SelectTrigger className="w-full sm:max-w-44 sm:border-0 sm:shadow-none">
        <SelectValue placeholder="Relocation" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Relocation</SelectLabel>
          <SelectItem value="all">Any Relocation Status</SelectItem>
          <SelectItem value="relocation">Relocation Offered</SelectItem>
          <SelectItem value="onsite">No Relocation</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
