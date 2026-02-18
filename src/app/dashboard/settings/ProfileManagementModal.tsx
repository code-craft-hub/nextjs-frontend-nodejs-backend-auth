import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookmarkIcon, Loader2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";
import { ResumeAggregate } from "@/types/resume.types";
import { useUpdateResumeMutation } from "@/lib/mutations/resume.mutations";

const jobLevels = ["Entry Level", "Mid Level", "Senior Level"];
const jobTypes = ["Full Time", "Part Time", "Contract"];
const availability = ["Yes", "No"];

function getOptionsWithValue(options: string[], value: string | undefined) {
  if (value && !options.includes(value)) {
    return [value, ...options];
  }
  return options;
}

interface ProfileManagementModalProps {
  children: React.ReactNode;
  resume?: ResumeAggregate;
}

export default function ProfileManagementModal({
  children,
  resume,
}: ProfileManagementModalProps) {
  const [open, setOpen] = useState(false);

  const updateResume = useUpdateResumeMutation();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      jobLevel: jobLevels[0],
      jobType: jobTypes[0],
      remotePreference: true,
      relocationWillingness: true,
      location: "",
      salary: "",
      availabilityToStart: "",
      description: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (resume) {
      reset({
        title: resume.title || "",
        jobLevel: resume.jobLevel || jobLevels[0],
        jobType: resume.jobType || jobTypes[0],
        remotePreference: resume.remotePreference,
        relocationWillingness: resume.relocationWillingness || false,
        location: resume.location || "",
        salary: resume.salary || "",
        availabilityToStart: resume.availabilityToStart || "",
        description: resume.summary || "",
        isDefault: resume.isDefault || false,
      });
    }
  }, [resume, reset]);

  const onSubmit = (data: Record<string, unknown>) => {
    console.log("Form data to submit:", data);
    updateResume.mutate(
      { id: resume!.id, data },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success("Resume updated successfully!");
        },
        onError: (error: Error) => {
          console.error("Failed to save profile:", error);
        },
      },
    );
  };

  const handleUpdate = () => {
    handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    setOpen(false);
    if (resume) {
      reset({
        title: resume.title || "",
        jobLevel: resume.jobLevel || jobLevels[0],
        jobType: resume.jobType || jobTypes[0],
        remotePreference: resume.remotePreference || false,
        relocationWillingness: resume.relocationWillingness || false,
        location: resume.location || "",
        salary: resume.salary || "",
        availabilityToStart: resume.availabilityToStart || "",
        description: resume.summary || "",
        isDefault: resume.isDefault || false,
      });
    }
  };

  const isSubmitting = updateResume.isPending;


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle className="sr-only">Edit Profile</DialogTitle>
      <DialogContent className="h-[90svh] overflow-y-auto md:min-w-180!">
        <div className="font-inter flex items-center justify-center">
          <div className="w-full">
            <div className="relative flex flex-col mb-11 gap-y-4">
              <div className="w-12 h-12 rounded-[10px] border border-solid border-gray-200 shadow-[0px_1px_2px_#0a0d120d] flex items-center justify-center">
                <img src="/flag.svg" alt="flag" />
              </div>
              <p className="font-semibold text-[1.15rem]">Edit Profile</p>
            </div>
            <>
              <div className="flex flex-col md:grid md:grid-cols-2 gap-y-4 gap-x-8 w-full">
                <div className="space-y-1.5 md:col-span-2">
                  <h1 className="">Profile Title</h1>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <Input
                        className=""
                        placeholder="Profile title is also used for job recommendations. e.g Software Engineer, Marketing Specialist"
                        {...field}
                      />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <h1 className="font-medium">Job Level Preference</h1>
                  <Controller
                    name="jobLevel"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Job Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select Job</SelectLabel>
                            {getOptionsWithValue(jobLevels, field.value).map((job) => (
                              <SelectItem value={job} key={job}>
                                {job}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5 w-full">
                  <h1 className="">Job Type Preference</h1>
                  <Controller
                    name="jobType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Job Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select Job Type</SelectLabel>
                            {getOptionsWithValue(jobTypes, field.value).map((job) => (
                              <SelectItem value={job} key={job}>
                                {job}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* <div className="space-y-1.5 col-span-2">
                  <h1 className="">
                    Role of Interest{" "}
                    <span className="text-2xs">
                      (Avoid ambigious words)
                    </span>{" "}
                  </h1>
                  <Controller
                    name="rolesOfInterest"
                    control={control}
                    render={({ field }) => (
                      <SelectCreatable
                        placeholder="Marketing, Software Development"
                        {...field}
                      />
                    )}
                  />
                </div> */}

                <div className="space-y-1.5 ">
                  <h1 className="">Remote Work Preference</h1>
                  <Controller
                    name="remotePreference"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "Yes")
                        }
                        value={field.value ? "Yes" : "No"}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Remote Work Preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select Job</SelectLabel>
                            {availability.map((job) => (
                              <SelectItem value={job} key={job}>
                                {job}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <h1 className="">Relocation Willingness</h1>
                  <Controller
                    name="relocationWillingness"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "Yes")
                        }
                        value={field.value ? "Yes" : "No"}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Yes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Relocation Willingness</SelectLabel>
                            {availability.map((job) => (
                              <SelectItem value={job} key={job}>
                                {job}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <h1 className="">Location</h1>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Input placeholder="Lagos" {...field} />
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <h1 className="">
                    Salary Expectation (Input figure in local currency)
                  </h1>
                  <Controller
                    name="salary"
                    control={control}
                    render={({ field }) => (
                      <Input placeholder="$125,000 - $150,000" {...field} />
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <h1 className="">Availability to start</h1>
                  <Controller
                    name="availabilityToStart"
                    control={control}
                    render={({ field }) => (
                      <Input placeholder="Immediately" {...field} />
                    )}
                  />
                </div>
                {/* <div className="space-y-1.5 col-span-2">
                  <h1 className="">Description</h1>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        className=""
                        placeholder="Tell Cver AI a bit about this profile — it'll help personalize your career documents when needed."
                        {...field}
                      ></Textarea>
                    )}
                  />
                </div> */}
                <div className="absolute top-20 right-6">
                  <Controller
                    name="isDefault"
                    control={control}
                    render={({ field }) => (
                      <Toggle
                        aria-label="Toggle bookmark"
                        size="sm"
                        disabled={isSubmitting || field.value}
                        variant="outline"
                        pressed={field.value}
                        onPressedChange={(pressed) => {
                          field.onChange(pressed);
                        }}
                        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-primary data-[state=on]:*:[svg]:stroke-primary"
                      >
                        <BookmarkIcon />
                        <span className="mt-0.5 hidden md:flex">
                          Make default profile
                        </span>
                      </Toggle>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-14 w-full">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : resume ? (
                    "Update Profile"
                  ) : (
                    "Create Profile"
                  )}
                </Button>
              </div>
            </>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
