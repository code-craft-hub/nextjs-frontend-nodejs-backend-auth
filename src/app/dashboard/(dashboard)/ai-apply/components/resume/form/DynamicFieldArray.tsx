import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

interface DynamicFieldArrayProps<T> {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  renderFields: (index: number) => React.ReactNode;
  defaultValue: T;
  minItems?: number;
}

export const DynamicFieldArray = <T,>({
  form,
  name,
  label,
  renderFields,
  defaultValue,
  minItems = 0,
}: DynamicFieldArrayProps<T>) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{label}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(defaultValue)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {label}
        </Button>
      </div>
      {fields.map((field, index) => (
        <Card key={field.id} className="p-4">
          <div className="space-y-4">
            {renderFields(index)}
            {fields.length > minItems && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
