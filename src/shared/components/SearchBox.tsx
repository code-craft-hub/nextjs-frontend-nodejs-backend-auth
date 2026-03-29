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
}: {
  onSubmit: (data: any) => void;
  onLocationChange?: (location: string) => void;
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
    <div className="bg-white shadow-lg px-2 flex gap-4 justify-between rounded-lg items-center">
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
    </div>
  );
};

export default SearchBox;

export function FilterLocation({
  onValueChange,
}: {
  onValueChange?: (value: string) => void;
}) {
  return (
    <Select onValueChange={(val) => onValueChange?.(val === "all" ? "" : val)}>
      <SelectTrigger className="w-full max-w-48 border-0 shadow-none">
        <SelectValue placeholder="Select Location" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Select Location</SelectLabel>
          <SelectItem value="all">All Locations</SelectItem>
          <SelectItem value="nigeria">Nigeria</SelectItem>
          <SelectItem value="lagos">Lagos</SelectItem>
          <SelectItem value="abuja">Abuja</SelectItem>
          <SelectItem value="usa">USA</SelectItem>
          <SelectItem value="london">London</SelectItem>
          <SelectItem value="europe">Europe</SelectItem>
          <SelectItem value="asia">Asia</SelectItem>
          <SelectItem value="australia">Australia</SelectItem>
          <SelectItem value="remote">Remote</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
