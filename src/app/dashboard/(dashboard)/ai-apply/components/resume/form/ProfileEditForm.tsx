import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ProfileFormData, profileSchema } from "@/lib/schema-validations/resume.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";


interface ProfileEditFormProps {
  initialData: string;
  onSave: (data: string) => void;
  onCancel: () => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { profile: initialData },
  });

  const handleSubmit = (data: ProfileFormData) => {
    onSave(data.profile);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="profile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Summary</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Write a compelling professional summary..."
                  rows={6}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0} / 1000 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};