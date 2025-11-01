import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Card } from "@/components/ui/card";
import { useState } from "react";

const formSchema = z.object({
  searchValue: z.string(),
});

export const SearchBar = ({
  sendDataToParent,
  allJobs,
}: {
  sendDataToParent?: (data: any) => void;
  allJobs: any[];
}) => {
  console.log(allJobs);
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      searchValue: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    sendDataToParent && sendDataToParent(values);
    const data = {
      searchValue: values.searchValue,
      ...(location && { location }),
      ...(employmentType && { employmentType }),
    };
    console.log(data);
  }

  const [location, setLocation] = useState(allJobs?.[0]?.location || "");
  const [employmentType, setEmploymentType] = useState(
    allJobs?.[0]?.employmentType || ""
  );

  return (
    <div className="relative w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full grid grid-cols-1"
        >
          <Card className="w-full grid grid-cols-1 lg:grid lg:grid-cols-4 justify-between flex-row lg:items-center gap-2 px-4 py-4">
            <div className="relative p-1 lg:border-r-[1px] lg:border-black/40 mr-1">
              <FormField
                control={form.control}
                name="searchValue"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <input
                        {...field}
                        type="text"
                        placeholder="Job title / company name"
                        className="w-full outline-none pl-3 placeholder:text-xs"
                      />
                    </FormControl>
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
            <div className="flex gap-1 items-center py-2 lg:border-r-[1px] lg:border-black/40 pr-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full text-start text-black/60 border-none focus:border-none focus:outline-none flex text-xs line-clamp-1 text-nowrap overflow-hidden truncate">
                  <img src="/map.svg" className="size-4 mr-1" alt="" />
                  {location || "Location"}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Select your location</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={location}
                    onValueChange={setLocation}
                  >
                    {[...new Set(allJobs.map((job) => job.location))].map(
                      (location) => (
                        <DropdownMenuRadioItem key={location} value={location}>
                          {location}
                        </DropdownMenuRadioItem>
                      )
                    )}
                    {/* {allJobs.map((job) => (
                        <DropdownMenuRadioItem
                          key={job.id}
                          value={job.location}
                        >
                          {job.location}
                        </DropdownMenuRadioItem>
                      ))} */}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex  gap-1 items-center py-2 ">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full focus:outline-none">
                  <div className="flex flex-row gap-1 items-center w-full text-black/50">
                    <img src="/search-location.svg" className="size-4" alt="" />
                    <span className="text-black/50 text-xs">
                      {employmentType}
                    </span>
                    <img src="/chevron-down.svg" className="size-2 text-gray-300" alt="chevron" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Select Job type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={employmentType}
                    onValueChange={setEmploymentType}
                  >
                    {[...new Set(allJobs.map((job) => job.employmentType))].map(
                      (jobType) => (
                        <DropdownMenuRadioItem key={jobType} value={jobType}>
                          {jobType}
                        </DropdownMenuRadioItem>
                      )
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button type="submit" className="text">
              Search
            </Button>
          </Card>
        </form>
      </Form>
    </div>
  );
};
