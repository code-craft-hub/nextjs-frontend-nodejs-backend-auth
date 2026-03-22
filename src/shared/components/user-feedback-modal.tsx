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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Iconify } from "@/components/iconify";
import { Textarea } from "@/components/ui/textarea";
const formSchema = z.object({
  feedbackType: z.string().min(2, {
    message: "Feedback type must be at least 2 characters.",
  }),
  note: z.string().optional(),
});

export function UserFeedbackModal() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedbackType: "",
      note: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  const feedbackTypes = [
    { value: "product-feedback", label: "Product Feedback" },
    { value: "job-quality", label: "Job Quality/Recommendation" },
    { value: "resume-cv", label: "Resume/CV Generation" },
    { value: "bug-report", label: "Bug Report" },
    { value: "crash", label: "Crash/Technical Issue" },
    { value: "other", label: "Other" },
  ];

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <Iconify
              icon="fluent-color:person-feedback-48"
              width={24}
              height={24}
            />
            <span className="text-2xs">Feedback</span>
            <div className="bg-green-500 size-1 animate-ping rounded-full" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm p-0">
          <DialogHeader className="border-b p-6">
            <DialogTitle>Share Your Feedback</DialogTitle>
            <DialogDescription className="sr-only">
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 gap-4 flex flex-col">
            <div className="">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="feedbackType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feedback Type</FormLabel>
                        <FormControl>
                          <Select>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Feedback Types</SelectLabel>
                                {feedbackTypes.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us more about your experience..."
                            {...field}
                            className="h-32"
                          ></Textarea>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </div>
          <DialogFooter className="bg-slate-100 border-t-2 p-6 rounded-ee-lg rounded-es-lg">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
