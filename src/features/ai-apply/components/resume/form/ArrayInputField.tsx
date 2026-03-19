import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

interface ArrayInputFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
}

export const ArrayInputField: React.FC<ArrayInputFieldProps> = ({
  form,
  name,
  label,
  placeholder,
}) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <FormField
              control={form.control}
              name={`${name}.${index}`}
              render={({ field }) => (
                <FormControl>
                  <Input {...field} placeholder={placeholder} />
                </FormControl>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append("")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>
    </FormItem>
  );
};
