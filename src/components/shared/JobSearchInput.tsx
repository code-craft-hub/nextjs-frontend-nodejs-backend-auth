"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";

import React, { useRef, useState } from "react";
import { SearchIcon, X } from "lucide-react";


const JobSearchInput = ({ table, handleSearchSubmit }: any) => {
//   console.count("JOB SEARCH INPUT RENDER");
  const [showClearButton, setShowClearButton] = useState(false);

  const formSchema = z.object({
    title: z.string().min(2).max(50),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      title: "",
    },
  });

  const hasValueRef = useRef(false);

  function onSubmit({ title }: z.infer<typeof formSchema>) {
    table.getColumn("title")?.setFilterValue(title);
    requestAnimationFrame(() => {
      const filteredRows = table.getFilteredRowModel().rows;
      if (filteredRows.length === 0) {
        handleSearchSubmit(title);
      }
    });
  }

  const handleClear = () => {
    form.reset();
    table.getColumn("title")?.setFilterValue(undefined);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void
  ) => {
    onChange(e);
    const hasValue = e.target.value.length > 0;

    if (hasValue !== hasValueRef.current) {
      hasValueRef.current = hasValue;
      setShowClearButton(hasValue);
    }
  };
  return (
    <div>
      <div className="bg-white shadow-lg px-2 flex gap-4 justify-between rounded-lg">
        <div className="flex items-center gap-2 w-full">
          <SearchIcon className="size-4" />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex gap-2 w-full  justify-between items-center "
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className=" w-full">
                    <FormControl>
                      <input
                        className="border-none focus:border-none focus:outline-none w-full !bg-white focus:!bg-white h-14"
                        placeholder="Job title / Company name"
                        {...field}
                        onChange={(e) => handleInputChange(e, field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 items-center">
                {showClearButton && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    className="h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button type="submit">Search</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default JobSearchInput;
