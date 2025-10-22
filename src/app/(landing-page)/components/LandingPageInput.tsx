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
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  jobDescription: z.string().optional(),
});

export const LandingPageInput = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit({ jobDescription }: z.infer<typeof formSchema>) {
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
              <FormItem className="shadow-blue-500 p-1 relative border-2 border-[#747474]/20 rounded-xl [box-shadow:0px_6.24689px_49.9751px_-6.24689px_rgba(99,140,243,0.32)]">
                <FormControl>
                  <textarea
                    placeholder="Let's get started"
                    {...field}
                    className="w-full h-32 border p-2 font-geist resize-none rounded-2xl pl-4 pt-2  placeholder:text-[#5B738B]  focus:outline-none focus:ring-offset-0 border-none"
                  ></textarea>
                </FormControl>
                <FormMessage />
                <div className="flex justify-between p-1">
                  <button
                    className="border-blue-500 border-2 w-fit rounded-full p-1 hover:cursor-pointer bg-[#bbcffc]/30"
                    type="submit"
                  >
                    <Plus className=" text-blue-400 size-4" />
                  </button>
                  <button
                    type="submit"
                    className="border-blue-500 border-2 w-fit bg-[#bbcffc]/30 rounded-full p-1 hover:cursor-pointer "
                  >
                    <ArrowUp className=" text-blue-400 size-4 " />
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
