"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ─── Schema ────────────────────────────────────────────────────────────────

const searchSchema = z.object({
  search: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

// ─── BlogSearchForm ────────────────────────────────────────────────────────

interface BlogSearchFormProps {
  onSubmit: (search: string) => void;
}

export function BlogSearchForm({ onSubmit }: BlogSearchFormProps) {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
    },
  });

  const handleSubmit = (values: SearchFormValues) => {
    onSubmit(values.search ?? "");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col sm:flex-row gap-3"
      >
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    {...field}
                    type="search"
                    placeholder="Search posts…"
                    className="pl-9 pr-4"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 whitespace-nowrap"
        >
          Search
        </Button>
      </form>
    </Form>
  );
}
