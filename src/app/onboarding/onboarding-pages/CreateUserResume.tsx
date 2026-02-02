import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useUpdateOnboarding } from "@/hooks/mutations";

const formSchema = z.object({
  jobTitle: z.string().min(1, "Please select a preferred job title"),
  jobDescription: z.string().min(1, "Please enter a job description"),
});

export function CreateUserResume({
  onNext,
  user,
}: {
  onNext: () => void;
  user?: any;
}) {
  const [checked, setChecked] = useState<any>(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
    },
  });
  const updateOnboarding = useUpdateOnboarding({
    customMessage: `${user?.firstName}, your resume has been created successfully!`,
    userFirstName: user?.firstName,
    onError: () => {
      toast("Skip this process", {
        action: {
          label: "Skip",
          onClick: () => onNext(),
        },
      });
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    onNext();
    updateOnboarding.mutate({
      stepNumber: 2,
      ...values,
    });
  }

  return (
    <div className=" border border-blue-100 w-full p-4 rounded-md">
      <label
        htmlFor="create-resume-checkbox"
        className="flex w-full justify-between items-center "
      >
        <p className="">Create from crash</p>
        <Checkbox
          id="create-resume-checkbox"
          checked={checked}
          onCheckedChange={setChecked}
        />
      </label>

      <Dialog open={checked} onOpenChange={setChecked}>
        <DialogContent className="sm:max-w-106.25 max-h-[80svh] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Create default resume.</DialogTitle>
                <DialogDescription>
                  {/* A new resume will be created. Ensure to made edit later */}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 my-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col gap-2">
                            <label htmlFor={field.name}>
                              <span className="inline-flex px-2">
                                Job Title
                              </span>
                            </label>
                            <Input
                              id={field.name}
                              placeholder="Marketer or Software engineer"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col gap-2">
                            <label htmlFor={field.name}>
                              <span className="inline-flex px-2">
                                Job Description
                              </span>
                            </label>
                            <Textarea
                              id={field.name}
                              placeholder="I'm an professional marketer with 8 year experience... "
                              {...field}
                            ></Textarea>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Create Resume</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
