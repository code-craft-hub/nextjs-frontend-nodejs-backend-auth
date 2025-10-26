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
import {
  useCreateDataSource,
  useUpdateDataSource,
} from "@/lib/mutations/profile.mutations";
import { ProfileData } from "./ProfileManagement";
import { Option, SelectCreatable } from "@/components/shared/SelectCreatable";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";

const jobLevel = ["Entry Level", "Mid Level", "Senior Level"];
const jobTypes = ["Full Time", "Part Time", "Contract"];
const availability = ["Yes", "No"];

interface ProfileManagementModalProps {
  children: React.ReactNode;
  profile?: ProfileData;
}

export default function ProfileManagementModal({
  children,
  profile,
}: ProfileManagementModalProps) {
  const [open, setOpen] = useState(false);

  const updateDataSource = useUpdateDataSource();
  const createDataSource = useCreateDataSource();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      jobLevelPreference: jobLevel[0],
      jobTypePreference: jobTypes[0],
      roleOfInterest: [] as Option[],
      remoteWorkPreference: availability[0],
      relocationWillingness: "",
      location: "",
      salaryExpectation: "",
      availabilityToStart: "",
      description: "",
      defaultDataSource: false,
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        jobLevelPreference: profile.jobLevelPreference || jobLevel[0],
        jobTypePreference: profile.jobTypePreference || jobTypes[0],
        roleOfInterest: profile.roleOfInterest || [],
        remoteWorkPreference: profile.remoteWorkPreference || availability[0],
        relocationWillingness: profile.relocationWillingness || "",
        location: profile.location || "",
        salaryExpectation: profile.salaryExpectation || "",
        availabilityToStart: profile.availabilityToStart || "",
        description: profile.description || profile.data || "",
        defaultDataSource: profile.activeDataSource === "" && true,
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: any) => {
    const userProfile = { ...profile, ...data };

    if (profile) {
      updateDataSource.mutate(
        {
          profileData: userProfile,
        },
        {
          onSuccess: () => {
            setOpen(false);
          },
          onError: (error) => {
            console.error("Failed to update profile:", error);
          },
        }
      );
    } else {
      createDataSource.mutate(
        {
          profileData: { ...userProfile, ProfileID: crypto.randomUUID() },
        },
        {
          onSuccess: () => {
            setOpen(false);
          },
          onError: (error) => {
            console.error("Failed to create profile:", error);
          },
        }
      );
    }
  };

  const handleUpdate = () => {
    handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    setOpen(false);
    if (profile) {
      reset({
        jobLevelPreference: profile.jobLevelPreference || jobLevel[0],
        jobTypePreference: profile.jobTypePreference || jobTypes[0],
        roleOfInterest: profile.roleOfInterest || [],
        remoteWorkPreference: profile.remoteWorkPreference || availability[0],
        relocationWillingness: profile.relocationWillingness || "",
        location: profile.location || "",
        salaryExpectation: profile.salaryExpectation || "",
        availabilityToStart: profile.availabilityToStart || "",
        defaultDataSource: profile.activeDataSource === "" && true,
      });
    }
  };

  const isSubmitting = updateDataSource.isPending || createDataSource.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle className="sr-only">Edit Profile</DialogTitle>
      <DialogContent className="h-[90svh] overflow-y-auto md:!min-w-[45rem]">
        <div className="font-inter flex items-center justify-center">
          <div className="w-full">
            <div className="relative flex flex-col mb-11 gap-y-4">
              <div className="w-12 h-12 rounded-[10px] border border-solid border-gray-200 shadow-[0px_1px_2px_#0a0d120d] flex items-center justify-center">
                <img src="/flag.svg" alt="flag" />
              </div>
              <p className="font-semibold text-[1.15rem]">Edit Profile</p>
            </div>
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 w-full">
                <div className="space-y-1.5">
                  <h1 className="font-medium">Job Level Preference</h1>
                  <Controller
                    name="jobLevelPreference"
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
                            {jobLevel.map((job) => (
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
                  <h1 className="">Job Type Preference</h1>
                  <Controller
                    name="jobTypePreference"
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
                            {jobTypes.map((job) => (
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
                  <h1 className="">Role of Interest</h1>
                  <Controller
                    name="roleOfInterest"
                    control={control}
                    render={({ field }) => (
                      <SelectCreatable
                        placeholder="Marketing, Software Development"
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <h1 className="">Remote Work Preference</h1>
                  <Controller
                    name="remoteWorkPreference"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
                        onValueChange={field.onChange}
                        value={field.value}
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
                    name="salaryExpectation"
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
                <div className="space-y-1.5">
                  <h1 className="">Description</h1>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                      className="max-h-32"
                        placeholder="Tell Cverai a bit about this profile — it'll help personalize your career documents when needed."
                        {...field}
                      ></Textarea>
                    )}
                  />
                </div>
                <div className="absolute top-20 right-6">
                  <Controller
                    name="defaultDataSource"
                    control={control}
                    render={({ field }) => (
                      <Toggle
                        aria-label="Toggle bookmark"
                        size="sm"
                        variant="outline"
                        pressed={field.value}
                        onPressedChange={field.onChange}
                        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-primary data-[state=on]:*:[svg]:stroke-primary"
                      >
                        <BookmarkIcon />
                        <span className="mt-0.5">

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
                  ) : profile ? (
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
