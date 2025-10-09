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
import { EducationFormData, educationSchema } from "@/lib/schema-validations/resume.schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DynamicFieldArray } from "./DynamicFieldArray";
import { DialogFooter } from "@/components/ui/dialog";



interface EducationEditFormProps {
  initialData?: EducationFormData[];
  onSave: (data: EducationFormData[]) => void;
  onCancel: () => void;
}

export const EducationEditForm: React.FC<EducationEditFormProps> = ({
  initialData = [],
  onSave,
  onCancel,
}) => {
  const form = useForm<{ education: EducationFormData[] }>({
    resolver: zodResolver(z.object({ education: z.array(educationSchema) })),
    defaultValues: { education: initialData },
  });

  const handleSubmit = (data: { education: EducationFormData[] }) => {
    onSave(data.education);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ScrollArea className="h-[500px] pr-4">
          <DynamicFieldArray
            form={form}
            name="education"
            label="Education Entry"
            defaultValue={{
              educationId: crypto.randomUUID(),
              degree: "",
              fieldOfStudy: "",
              schoolName: "",
              educationStart: "",
              educationEnd: "",
              schoolLocation: "",
            }}
            renderFields={(index) => (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`education.${index}.degree`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Bachelor of Science" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`education.${index}.fieldOfStudy`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field of Study</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Computer Science" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`education.${index}.schoolName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="University Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`education.${index}.schoolLocation`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City, State" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`education.${index}.educationStart`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="month" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`education.${index}.educationEnd`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="month" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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