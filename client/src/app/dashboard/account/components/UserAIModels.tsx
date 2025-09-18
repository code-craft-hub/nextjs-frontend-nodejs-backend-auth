import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import { Switch } from "@/components/ui/switch";
import { sendOrSaveEmailToDraft } from "@/lib/firebase/api";
import { DocumentData } from "firebase/firestore";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

const FormSchema = z.object({
  aiModel: z.boolean().default(false).optional(),
});

export function UserAIModels({
  dbUser,
}: {
  dbUser: DocumentData | null | undefined;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      aiModel: "gpt-5",
      apiKey: "",
    },
  });

  const { user } = useAuth();
  const email = user?.email;

  useEffect(() => {
    if (dbUser) form.setValue("email", dbUser?.emailOption);
  }, [dbUser]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center ">
              <div className="space-y-0.5">
                <FormLabel>Add your own AI model</FormLabel>
                <FormDescription>
                  Turn on to send email automatically to recruiters. Or turn it
                  off to have the generated emails saved to your draft for your
                  review.
                </FormDescription>
              </div>
              <Select>
                <FormControl>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Fruits</SelectLabel>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {/* <Switch
                checked={field.value}
                onCheckedChange={async (checked: boolean) => {
                  field.onChange(checked);
                  if (email) {
                    await sendOrSaveEmailToDraft({
                      email,
                      emailOption: checked,
                    });
                  }
                }}
              /> */}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
