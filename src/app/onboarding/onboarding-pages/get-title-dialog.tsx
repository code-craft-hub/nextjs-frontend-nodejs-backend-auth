import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { resumeApi } from "@/lib/api/resume.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function AutoGenerateTitleDialog({
  onNext,
  children,
}: {
  onNext?: () => void;
  children?: React.ReactNode;
}) {
  const titleSchema = z.object({
    title: z
      .string()
      .min(2, { message: "Title must be at least 2 characters." }),
  });

  const form = useForm({
    resolver: zodResolver(titleSchema),
    defaultValues: {
      title: "",
    },
  });

  const onSubmit = async ({ title }: z.infer<typeof titleSchema>) => {
    toast.success(`Auto-generating your resume title: ${title}`);
    onNext?.();
    await resumeApi.autoNewResume(title);
  };

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Enter Job Title</DialogTitle>
          <DialogDescription>
            Cver AI will use this to create a personalized resume for you.
            Remember to edit it later to get the best results!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
          <DialogFooter className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DialogClose asChild>
              <Button variant="outline" className="w-full max-sm:order-2">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="w-full max-sm:order-1">Generate My Resume!</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
