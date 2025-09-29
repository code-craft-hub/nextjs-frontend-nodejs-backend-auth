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
const jobLevel = ["Entry Level", "Mid Level", "Senior Level"];
const jobTypes = ["Full Time", "Part Time", "Contract"];
const departments = [
  "Information Security",
  "Marketing",
  "Software Development",
  "Customer Support",
  "Human Resource",
  "Accounting/Audit",
];
const availability = ["Yes", "No"];
export default function ProfileManagementModal({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle className="sr-only">Dialog</DialogTitle>
      <DialogContent className="max-sm:h-[90svh] overflow-y-auto">
        <div className="font-inter flex items-center justify-center">
          <div className="">
            <div className="relative flex flex-col mb-11  gap-y-4">
              <div className="w-12 h-12 rounded-[10px] border border-solid border-gray-200 shadow-[0px_1px_2px_#0a0d120d] flex items-center justify-center">
                <img src="/flag.svg" alt="flag" />
              </div>
              {/* <X className="absolute top-2 right-2 text-gray-400" /> */}
              <p className="font-semibold  text-[1.15rem]">Edit Profile</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 w-full">
              <div className="space-y-1.5">
                <h1 className="font-medium">Job Level Preference</h1>
                <Select defaultValue={jobLevel[0]}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Job Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select Job</SelectLabel>
                      {jobLevel?.map((job) => (
                        <SelectItem value={job} key={job}>
                          {job}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <h1 className="">Job Type Preference</h1>
                <Select defaultValue={jobTypes[0]}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select Job Type</SelectLabel>
                      {jobTypes?.map((job) => (
                        <SelectItem value={job} key={job}>
                          {job}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <h1 className="">Role of Interest</h1>
                <Select defaultValue={departments[0]}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Information Security" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Role of Interest</SelectLabel>
                      {departments?.map((job) => (
                        <SelectItem value={job} key={job}>
                          {job}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <h1 className="">Remote Work Preference</h1>
                <Select defaultValue={availability[0]}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Remote Work Preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select Job</SelectLabel>
                      {availability?.map((job) => (
                        <SelectItem value={job} key={job}>
                          {job}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <h1 className="">Relocation Willingness</h1>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Yes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Relocation Willingness</SelectLabel>
                      {availability?.map((job) => (
                        <SelectItem value={job} key={job}>
                          {job}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <h1 className="">Location</h1>
                <Input placeholder="Lagos" />
              </div>
              <div className="space-y-1.5">
                <h1 className="">
                  Salary Expectation (Input figure in local currency)
                </h1>
                <Input placeholder="$125,000 - $150,00" />
              </div>
              <div className="space-y-1.5">
                <h1 className="">Availability to start</h1>
                <Input placeholder="Immediately" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-14 w-full ">
              <Button variant="outline">Cancel</Button>
              <Button>Update</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
