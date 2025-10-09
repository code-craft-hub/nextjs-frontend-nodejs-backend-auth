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
import { CertificationFormData, certificationSchema } from "@/lib/schema-validations/resume.schema";
import { Textarea } from "@/components/ui/textarea";


interface CertificationEditFormProps {
  initialData?: CertificationFormData[];
  onSave: (data: CertificationFormData[]) => void;
  onCancel: () => void;
}

export const CertificationEditForm: React.FC<CertificationEditFormProps> = ({
  initialData = [],
  onSave,
  onCancel,
}) => {
  const form = useForm<{ certification: CertificationFormData[] }>({
    resolver: zodResolver(
      z.object({ certification: z.array(certificationSchema) })
    ),
    defaultValues: { certification: initialData },
  });

  const handleSubmit = (data: { certification: CertificationFormData[] }) => {
    onSave(data.certification);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ScrollArea className="h-[500px] pr-4">
          <DynamicFieldArray
            form={form}
            name="certification"
            label="Certification Entry"
            defaultValue={{
              certificationId: crypto.randomUUID(),
              title: "",
              issuer: "",
              issueDate: "",
              expiryDate: "",
              description: "",
            }}
            renderFields={(index) => (
              <>
                <FormField
                  control={form.control}
                  name={`certification.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certification Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="AWS Solutions Architect"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`certification.${index}.issuer`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issuing Organization</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Amazon Web Services" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`certification.${index}.issueDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="month" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`certification.${index}.expiryDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="month" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`certification.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Brief description..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
