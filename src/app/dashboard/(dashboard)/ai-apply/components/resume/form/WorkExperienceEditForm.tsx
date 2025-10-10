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
  WorkExperienceFormData,
} from "@/lib/schema-validations/resume.schema";
import { ArrayInputField } from "./ArrayInputField";
import { toValidDate } from "@/lib/toValidDate";

interface WorkExperienceEditFormProps {
  initialData?: WorkExperienceFormData[];
  onSave: (data: WorkExperienceFormData[]) => void;
  onCancel: () => void;
}

export const WorkExperienceEditForm: React.FC<WorkExperienceEditFormProps> = ({
  initialData = [],
  onSave,
  onCancel,
}) => {
  const form = useForm<{ workExperience: WorkExperienceFormData[] }>({
    // resolver: zodResolver(
    //   z.object({ workExperience: z.array(workExperienceSchema) })
    // ),
    defaultValues: {
      workExperience: initialData,
    },
  });

  const handleSubmit = (data: { workExperience: WorkExperienceFormData[] }) => {
    onSave(data.workExperience);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="p-1 rounded-xl"
      >
        <ScrollArea className="">
          <DynamicFieldArray
            form={form}
            name="workExperience"
            label="Work Experience Entry"
            defaultValue={{
              workExperienceId: crypto.randomUUID(),
              jobTitle: "",
              companyName: "",
              location: "",
              jobStart: "",
              jobEnd: "",
              responsibilities: [""],
            }}
            renderFields={(index) => (
              <>
                <div className="grid grid-cols-2 gap-4 max-sm:mt-6 mt-4">
                  <FormField
                    control={form.control}
                    name={`workExperience.${index}.jobTitle`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Software Engineer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`workExperience.${index}.companyName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Tech Company Inc." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`workExperience.${index}.location`}
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
                    name={`workExperience.${index}.jobStart`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input
                            type="month"
                            value={toValidDate(field.value, "month")}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`workExperience.${index}.jobEnd`}
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input
                              type="month"
                              value={toValidDate(field.value, "month")}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <ArrayInputField
                  form={form}
                  name={`workExperience.${index}.responsibilities`}
                  label="Responsibilities"
                  placeholder="Describe your responsibility..."
                />
              </>
            )}
          />
        </ScrollArea>
        <DialogFooter className="flex flex-row mt-3 gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
