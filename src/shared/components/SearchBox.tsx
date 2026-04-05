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
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const SearchBox = ({
  onSubmit,
  onLocationChange,
  onClassificationChange,
}: {
  onSubmit: (data: any) => void;
  onLocationChange?: (location: string) => void;
  onClassificationChange?: (classification: string) => void;
}) => {
  const form = useForm<any>({
    defaultValues: {
      searchValue: "",
    },
  });

  const { watch, reset } = form;
  const watched = watch("searchValue");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSubmit(watched?.trim() ?? "");
    }, 500); // debounce 500ms

    return () => clearTimeout(handler);
  }, [watched, onSubmit]);

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
                      placeholder="Job title / Company name / Location"
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

      <FilterLocation onValueChange={onLocationChange} />
      <FilterClassification onValueChange={onClassificationChange} />
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
  onValueChange,
}: {
  onValueChange?: (value: string) => void;
}) {
  return (
    <Select onValueChange={(val) => onValueChange?.(val === "all" ? "" : val)}>
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

export function FilterClassification({
  onValueChange,
}: {
  onValueChange?: (value: string) => void;
}) {
  return (
    <Select onValueChange={(val) => onValueChange?.(val === "all" ? "" : val)}>
      <SelectTrigger className="w-full sm:max-w-40 sm:border-0 sm:shadow-none">
        <SelectValue placeholder="Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Job Type</SelectLabel>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="remote">Remote</SelectItem>
          <SelectItem value="relocate">Relocate</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
