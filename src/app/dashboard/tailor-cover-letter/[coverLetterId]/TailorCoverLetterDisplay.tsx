import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiService, useAuth } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";
import { CoverLetter, IUser } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EditIcon, Loader } from "lucide-react";
import { useRouter } from "next/navigation";

// Validation schema
const coverLetterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  coverLetter: z
    .string()
    .min(10, "Cover letter must be at least 10 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  salutation: z.string().min(1, "Salutation is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  recruiterEmail: z.email("Invalid email address").optional(),
});

type CoverLetterFormData = z.infer<typeof coverLetterSchema>;

const TailorCoverLetterDisplay = ({
  data,
  user,
  recruiterEmail,
}: {
  data: CoverLetter | undefined;
  user: Partial<IUser> | undefined;
  recruiterEmail?: string;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { useCareerDoc } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: coverLetterData } = useCareerDoc<CoverLetter>(
    data?.id || "",
    COLLECTIONS.COVER_LETTER
  );

  // Use fresh data from query or fallback to props
  const currentData = coverLetterData || data;

  // Mutation for updating cover letter
  const updateMutation = useMutation({
    mutationFn: async (formData: CoverLetterFormData) => {
      if (!currentData?.id) throw new Error("No document ID");
      return apiService.updateCareerDoc(
        currentData.id,
        COLLECTIONS.COVER_LETTER,
        formData
      );
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: [
          "auth",
          "careerDoc",
          COLLECTIONS.COVER_LETTER,
          currentData?.id,
        ],
      });
    },
  });

  const form = useForm<CoverLetterFormData>({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      title: currentData?.title || "",
      coverLetter: currentData?.coverLetter || "",
      firstName: currentData?.firstName || user?.firstName || "",
      lastName: currentData?.lastName || user?.lastName || "",
      phoneNumber: currentData?.phoneNumber || user?.phoneNumber || "",
      recruiterEmail: recruiterEmail || "",
      salutation: currentData?.salutation || "",
    },
  });

  // Reset form when dialog opens with latest data
  React.useEffect(() => {
    if (isDialogOpen && currentData) {
      form.reset({
        title: currentData.title || "",
        coverLetter: currentData.coverLetter || "",
        firstName: currentData.firstName || user?.firstName || "",
        lastName: currentData.lastName || user?.lastName || "",
        phoneNumber: currentData.phoneNumber || user?.phoneNumber || "",
        recruiterEmail: recruiterEmail || "",
        salutation: currentData.salutation || "Dear Hiring Manager,",
      });
    }
  }, [isDialogOpen, currentData, user, recruiterEmail, form]);

  const handleFieldBlur = async (fieldName: keyof CoverLetterFormData) => {
    const isValid = await form.trigger(fieldName);

    if (isValid) {
      const formValues = form.getValues();

      const currentValue = formValues[fieldName];
      const originalValue = currentData?.[fieldName] || "";

      if(fieldName === "recruiterEmail" && currentValue) {
        const url = new URL(window.location.href);
        url.searchParams.set("recruiterEmail", currentValue);
        // window.history.replaceState({}, "", url.toString());

        router.replace(url.toString());
      
      }

      if (currentValue !== originalValue) {
        updateMutation.mutate(formValues);
        // toast.success(
        //   `${capitalize(fieldName)} field has be updated and saved!`
        // );
      }
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && form.formState.isDirty) {
      // Save changes when closing if there are unsaved changes
      const formValues = form.getValues();
      updateMutation.mutate(formValues);
    }
    setIsDialogOpen(open);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-slate-50 relative border-b w-full border-slate-200 shadow-md rounded-xl flex flex-col items-center justify-between">
          <div
            className="bg-white p-4 sm:p-8 overflow-y-auto w-full cursor-pointer transition-colors"
            onClick={() => setIsDialogOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsDialogOpen(true);
              }
            }}
          >
            <div className="absolute right-4 top-4 flex">
              <EditIcon className="size-4 text-gray-300" />
            </div>
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-outfit text-md flex flex-col gap-2">
              <div className="mb-4">
                <p className="text-sm text-gray-500 font-medium font-inter">
                  To:{" "}
                  {recruiterEmail ||
                    currentData?.recruiterEmail ||
                    "Not specified"}
                </p>
                <p className="text-md font-inter">
                  Subject: {currentData?.title || "Untitled"}
                </p>
              </div>
              <p className="text-sm font-bold font-inter">
                {currentData?.salutation || "Dear Hiring Manager,"}
              </p>
              <p className="text-sm">
                {currentData?.coverLetter || "No content yet"}
              </p>
              {currentData?.coverLetter && (
                <div className="mt-8">
                  <p>Sincerely</p>
                  <p>
                    {currentData?.firstName || user?.firstName}{" "}
                    {currentData?.lastName || user?.lastName}
                  </p>
                  <p>{currentData?.phoneNumber || user?.phoneNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="md:!max-w-screen-md !w-full max-h-[90vh] overflow-y-auto ">
          <DialogHeader>
            <DialogTitle>Edit Cover Letter</DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          {updateMutation.isPending && <Loader className="absolute top-4 right-4 animate-spin" />}
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="recruiterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="hiring@company.com"
                        onBlur={() => handleFieldBlur("recruiterEmail")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Application for Software Engineer Position"
                        onBlur={() => handleFieldBlur("title")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salutation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salutation</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Dear Hiring Manager,"
                        onBlur={() => handleFieldBlur("salutation")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Write your cover letter here..."
                        rows={12}
                        className="resize-y"
                        onBlur={() => handleFieldBlur("coverLetter")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John"
                          onBlur={() => handleFieldBlur("firstName")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Doe"
                          onBlur={() => handleFieldBlur("lastName")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+1 (555) 123-4567"
                        onBlur={() => handleFieldBlur("phoneNumber")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {updateMutation.isPending && (
                <p className="text-sm text-blue-600">Saving changes...</p>
              )}
              {updateMutation.isError && (
                <p className="text-sm text-red-600">
                  Failed to save. Please try again.
                </p>
              )}
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TailorCoverLetterDisplay;
