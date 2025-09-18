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
import { Switch } from "@/components/ui/switch";
import { DocumentData } from "firebase/firestore";
import { useEffect } from "react";
import { sendOrSaveEmailToDraft } from "@/lib/firebase/api.firebase";
import { useAuth } from "@/hooks/use-auth";

const FormSchema = z.object({
  email: z.boolean().default(false).optional(),
});

export function ToggleEmailSendOrDraft({
  dbUser,
}: {
  dbUser: DocumentData | null | undefined;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: false,
    },
  });
  const { user } = useAuth();

  const email = user?.email;

  useEffect(() => {
    if (dbUser) form.setValue("email", dbUser?.emailOption);
  }, [dbUser]);

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center ">
            <div className="space-y-0.5">
              <FormLabel>Send or Save email to draft</FormLabel>
              <FormDescription>
                Turn on to send email automatically to recruiters. Or turn it
                off to have the generated emails saved to your draft for your
                review.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
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
              />
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  );
}
