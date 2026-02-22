import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { SearchIcon } from "lucide-react";
import { useForm } from "react-hook-form";

const SearchBox = () => {
  const form = useForm<any>({
    defaultValues: {
      searchValue: "",
    },
  });
  return (
    <div>
      <div className="bg-white shadow-lg px-2 flex gap-4 justify-between rounded-lg">
        <div className="flex items-center gap-2 w-full">
          <SearchIcon className="size-4 " />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex gap-2 w-full  justify-between items-center "
            >
              <FormField
                control={form.control}
                name="searchValue"
                render={({ field }) => (
                  <FormItem className=" w-full">
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
              <Button type="submit" disabled={hasNoResults || isSearching}>
                Search
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
