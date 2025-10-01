import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <Button
      variant="outline"
      onClick={() => {
        if (theme === "light") {
          setTheme("dark");
        } else {
          setTheme("light");
        }
      }}
      className="rounded-full size-10 !p-0"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}



export const ThemeToggle = () => {
  const FormSchema = z.object({
    theme: z.boolean().default(false).optional(),
  });

  const { theme, setTheme } = useTheme();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      theme: theme === "dark" ? true : false,
    },
  });

  return <Form {...form}>
  <FormField
    control={form.control}
    name="theme"
    render={({ field }) => (
      <FormItem className="flex flex-row items-center w-full gap-0 p-1 -ml-1">
        <FormLabel className="pr-4">
          {field.value ? (
            <div className="flex items-center gap-1">
              <Sun />
              <p className="">Light</p>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Moon />
              <p className="">Dark</p>
            </div>
          )}
        </FormLabel>
        <FormControl>
          <Switch
            checked={field.value}
            onCheckedChange={(value) => {
              field.onChange(value);
              setTheme(value ? "dark" : "light");
            }}
          />
        </FormControl>
      </FormItem>
    )}
  />
</Form>
}