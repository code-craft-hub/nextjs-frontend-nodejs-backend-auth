"use client";

// import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { ArrowUp, Plus } from "lucide-react";

const formSchema = z.object({
  jobDescription: z.string().optional(),
});

export const LandingPageInput = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit({ jobDescription }: z.infer<typeof formSchema>) {
    console.log(jobDescription);
    // if (!jobDescription) return;
    router.push(
      `/dashboard/home?tab=ai-apply&jobDescription=${encodeURIComponent(
        jobDescription!
      )}`
    );
  }
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="jobDescription"
            render={({ field }) => (
              <FormItem className="shadow-blue-100 p-1 relative rounded-xl shadow-xl">
                <FormControl>
                  <textarea
                    placeholder="Let's get started"
                    {...field}
                    className="w-full h-36 border p-2 resize-none rounded-2xl pl-4 pt-2  placeholder:font-medium focus:outline-none focus:ring-offset-0 border-none"
                  ></textarea>
                </FormControl>
                <FormMessage />
                <div className="flex justify-between p-1">
                  <button
                    className="border-blue-500 border-[1px] w-fit rounded-full p-1 hover:cursor-pointer"
                    type="submit"
                  >
                    <Plus className=" text-blue-400 size-3" />
                  </button>
                  <button
                    type="submit"
                    className="border-blue-500 border-[1px] w-fit rounded-full p-1 hover:cursor-pointer "
                  >
                    <ArrowUp className=" text-blue-400 size-3 " />
                  </button>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};
