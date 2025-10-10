import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DynamicFieldArray } from "./DynamicFieldArray";
import { DialogFooter } from "@/components/ui/dialog";
import {
  SkillFormData,
  skillSchema,
} from "@/lib/schema-validations/resume.schema";

interface SkillEditFormProps {
  initialData?: SkillFormData[];
  onSave: (data: SkillFormData[]) => void;
  onCancel: () => void;
  title: string;
  placeholder: string;
}

export const SkillEditForm: React.FC<SkillEditFormProps> = ({
  initialData = [],
  onSave,
  onCancel,
  title,
  placeholder,
}) => {
  const form = useForm<{ skills: SkillFormData[] }>({
    // resolver: zodResolver(z.object({ skills: z.array(skillSchema) })),
    defaultValues: { skills: initialData },
  });

  const handleSubmit = (data: { skills: SkillFormData[] }) => {
    onSave(data.skills);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ScrollArea className="h-[400px] pr-4">
          <DynamicFieldArray
            form={form}
            name="skills"
            label="Skill"
            defaultValue={{ label: "", value: "" }}
            renderFields={(index) => (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`skills.${index}.label`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill {title}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={placeholder} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`skills.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Value (slug)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="lowercase-slug" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          />
        </ScrollArea>
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
