import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuid } from "uuid";
import { useGetCurrentUser } from "@/lib/queries";
import { moreJobInfo, userDocDefaultInfo } from "@/constants/jobs-data";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";

const descSchema = z.object({
  desc: z.string().min(2, {
    message: "Job Description is required",
  }),
});

const SelectJobDescription = () => {
  const {user:dbUser} = useAuth();
  const router = useRouter();
  const [jobDialog, setJobDialog] = useState(false);
  const [_moreDialog, setMoreDialog] = useState(false);

  const [updateTitle, setUpdateTitle] = useState("");
  const [docTitle, setDocTitle] = useState<"resume" | "question" | "letter">(
    "resume"
  );
  const descForm = useForm<z.infer<typeof descSchema>>({
    resolver: zodResolver(descSchema),
    defaultValues: {
      desc: "",
    },
  });

  function descOnSubmit({ desc }: z.infer<typeof descSchema>) {
    const dataSrc = dbUser?.dataSource?.[0]?.data;
    localStorage?.removeItem("hasResumeAPICalled");
    localStorage?.removeItem("hasLetterAPICalled");
    localStorage?.removeItem("hasQuestionAPICalled");
    const docID = uuid();
    router.push(
      `/dashboard/${docTitle}/${docID}`
      // TODO: PASS DATA WHILE NAVIGATING
      //   {
      //   state: {
      //     jobDesc: desc,
      //     dataSrc: dataSrc || "",
      //     gemininGpt: "gpt35turbo",
      //     docID,
      //   },
      //   replace: true,
      // }
    );
  }

  const [careerDoc, _setCareerDoc] = useState([
    "Sample Resume",
    "Sample Interview Question",
    "Sample Cover Letter",
  ]);

  const colors = ["#BB2C2C", "#689A51", "#F0811A", "#E72FAD"];
  const [position, setPosition] = useState(moreJobInfo[0].title);

  const handleValueChanged = (value: any) => {
    const docType =
      value === "Sample Resume"
        ? "resume"
        : value === "Sample Cover Letter"
        ? "letter"
        : "question";
    setDocTitle(docType);
  };
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      container.scrollBy({
        left: e.deltaX > 0 ? 150 : -150,
        behavior: "smooth",
      });
    };

    let isPointerDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      startX = e.clientX;
      scrollLeft = container.scrollLeft;
      container.style.scrollBehavior = "auto";
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDown) return;
      const deltaX = e.clientX - startX;
      container.scrollLeft = scrollLeft - deltaX;
    };

    const handlePointerUp = () => {
      isPointerDown = false; // Reset pointer state
      container.style.scrollBehavior = "smooth"; // Re-enable smooth scrolling
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointerleave", handlePointerUp);

    // Clean up event listeners on unmount
    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointerleave", handlePointerUp);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (container) {
      container.dataset.startX = String(e.touches[0].clientX);
      container.dataset.scrollLeft = String(container.scrollLeft);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (container) {
      const startX = parseFloat(container.dataset.startX || "0");
      const deltaX = e.touches[0].clientX - startX;
      const scrollLeft = parseFloat(container.dataset.scrollLeft || "0");
      container.scrollLeft = scrollLeft - deltaX;
    }
  };

  const changeTitle = (title: string, id: number) => {
    const moreInfo = moreJobInfo.find((item) => item.id === id);
    const userInfo = userDocDefaultInfo.find((item) => item.id === id);
    if (moreInfo) {
      descForm.setValue("desc", moreInfo?.jobdescription);
      setUpdateTitle(title);
    }
    if (userInfo) {
      descForm.setValue("desc", userInfo?.jobdescription);
      setUpdateTitle(title);
    }
  };

  return (
    <div className="flex flex-col max-sm:space-y-2 sm:flex-row">
      <div className="flex max-sm:mt-4 justify-center items-center px-2 ">
        <Select onValueChange={handleValueChanged}>
          <SelectTrigger className="w-[180px] sm:rounded-full border-[1px] border-blue-100 transition-transform hover:cursor-pointer text-left max-sm:h-[26px] max-sm:text-[14px]">
            <SelectValue placeholder="Sample Resume" />
          </SelectTrigger>
          <SelectContent className="!w-[220px] rounded-xl">
            {careerDoc?.map((item, index) => {
              return (
                <SelectItem
                  key={index}
                  value={item}
                  className="p-0 py-2 px-4 rounded-lg"
                >
                  <span className="ml-2">{item}</span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="flex md:justify-center mx-auto">
        <div
          // ref={containerRef}
          // onTouchStart={handleTouchStart}
          // onTouchMove={handleTouchMove}
          className="flex p-2 sm:p-4 space-x-4  overflow-hidden  list-none"
        >
          {userDocDefaultInfo.map((item, idx) => (
            <li
              key={idx}
              className="relative rounded-full border-[1px] border-blue-100 flex-shrink-0 px-2 sm:px-8 sm:py-2 hover:cursor-pointer hover:scale-110 duration-500 transition-transform"
              style={{
                border: `1px solid ${colors[idx % colors.length]}`,
              }}
            >
              <Dialog
                open={jobDialog}
                onOpenChange={(value) => {
                  if (value === false) {
                    setMoreDialog(false);
                  }
                  setJobDialog(!jobDialog);
                }}
              >
                <DialogTrigger asChild>
                  <button
                    className="relative z-20 text-black font-medium text-[12px] sm:text-sm flex gap-2 items-center justify-center"
                    onClick={() => {
                      changeTitle(item.title, idx);
                    }}
                  >
                    <img src={item.icon} alt="" className="size-4" />{" "}
                    {item.title}
                  </button>
                </DialogTrigger>
                <DialogContent className="!rounded-3xl w-full shrink">
                  <DialogHeader>
                    <DialogTitle className="mt-4">
                      Sample Job Description: {updateTitle}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="">
                    <Form {...descForm}>
                      <form
                        onSubmit={descForm.handleSubmit(descOnSubmit)}
                        className="space-y-8"
                      >
                        <FormField
                          control={descForm.control}
                          name="desc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={10}
                                  placeholder={`Tell us a little bit about ${updateTitle}`}
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="flex justify-self-end sm:px-8"
                        >
                          Next
                        </Button>
                      </form>
                    </Form>
                  </div>
                </DialogContent>
              </Dialog>
            </li>
          ))}
          <div className="">
            <DropdownMenu onOpenChange={() => setMoreDialog(true)}>
              <DropdownMenuTrigger
                asChild
                className="relative rounded-full border-[1px] border-blue-100 flex-shrink-0 px-2 sm:px-8 sm:py-2 hover:cursor-pointer hover:scale-110 duration-500 transition-transform"
              >
                <button className="relative z-20 text-black font-medium text-[12px] sm:text-sm flex gap-2 items-center justify-center">
                  More
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[95vw] mt-2 mr-4 sm:mr-8">
                <DropdownMenuRadioGroup
                  value={position}
                  onValueChange={setPosition}
                >
                  {moreJobInfo?.map((item, index) => {
                    return (
                      <div key={index}>
                        <DropdownMenuRadioItem
                          value={item.title}
                          onClick={() => {
                            setJobDialog(true);
                            changeTitle(item.title, item.id);
                          }}
                        >
                          {item.title}
                        </DropdownMenuRadioItem>
                      </div>
                    );
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SelectJobDescription;
