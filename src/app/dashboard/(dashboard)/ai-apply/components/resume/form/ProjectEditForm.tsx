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
import { ProjectFormData, projectSchema } from "@/lib/schema-validations/resume.schema";
import { Textarea } from "@/components/ui/textarea";
import { ArrayInputField } from "./ArrayInputField";


interface ProjectEditFormProps {
  initialData?: ProjectFormData[];
  onSave: (data: ProjectFormData[]) => void;
  onCancel: () => void;
}

export const ProjectEditForm: React.FC<ProjectEditFormProps> = ({
  initialData = [],
  onSave,
  onCancel,
}) => {
  const form = useForm<{ project: ProjectFormData[] }>({
    // resolver: zodResolver(z.object({ project: z.array(projectSchema) })),
    defaultValues: { project: initialData },
  });

  const handleSubmit = (data: { project: ProjectFormData[] }) => {
    onSave(data.project);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ScrollArea className="h-[500px] pr-4">
          <DynamicFieldArray
            form={form}
            name="project"
            label="Project Entry"
            defaultValue={{
              projectId: crypto.randomUUID(),
              name: "",
              description: "",
              techStack: [""],
              role: "",
            }}
            renderFields={(index) => (
              <>
                <FormField
                  control={form.control}
                  name={`project.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="E-Commerce Platform" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`project.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Role</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Lead Developer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`project.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Project description..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ArrayInputField
                  form={form}
                  name={`project.${index}.techStack`}
                  label="Tech Stack"
                  placeholder="Technology or framework..."
                />
              </>
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
