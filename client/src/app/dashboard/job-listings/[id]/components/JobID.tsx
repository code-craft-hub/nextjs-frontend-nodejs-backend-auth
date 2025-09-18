"use client"
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { v4 as uuid } from "uuid";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { safeFormatDistanceToNow } from "@/lib/utils/helpers";
import { useAuth } from "@/hooks/use-auth";

const JobListingId = () => {
  const { user: dbUser } = useAuth();
  const router = useRouter();
  const state = {
    job: {
      title: "Software Engineer",
      companyName: "Tech Corp",
      companyLogo: "https://via.placeholder.com/150",
      applyUrl: "https://techcorp.com/careers/apply",
    },
  };
  const [docTitle, setDocTitle] = useState("resume");

  const [description, _setDescription] = useState(
    state?.job?.description_html || state?.job?.descriptionText
  );

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [description]);

  const generateDoc = (value: string) => {
    const docID = uuid();
    const dataSrc = dbUser?.dataSource?.[0]?.data;
    localStorage.removeItem("hasResumeAPICalled");
    localStorage.removeItem("hasLetterAPICalled");
    localStorage.removeItem("hasQuestionAPICalled");
    router.push(`/dashboard/${value}/${docID}`, {
      state: {
        jobDesc: description,
        dataSrc: dataSrc || "",
        gemininGpt: "gpt35turbo",
        docID,
      },
      replace: true,
    });
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-8 p-4 sm:p-8  max-w-screen-xl w-full  mx-auto">
        <div className="space-y-4 sm:space-y-8">
          <div className="flex justify-between flex-wrap gap-4">
            <h1 className="font-bold text-2xl md:text-4xl">Job Title</h1>
            <div className="flex flex-wrap gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="text-[12px] max-xss:w-full"
                    variant={"outline"}
                  >
                    Generate Resume / Cover Letter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuRadioGroup
                    value={docTitle}
                    onValueChange={(value) => {
                      setDocTitle(value);
                      generateDoc(value);
                    }}
                  >
                    <DropdownMenuRadioItem value="resume">
                      Resume | CV
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="letter">
                      Cover Letter
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="question">
                      Interview Question
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="text-[12px] max-xss:w-full">
                <a
                  href={state?.job?.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply Now{" "}
                </a>
              </Button>
            </div>
          </div>
          <div className={`flex flex-col gap-4 sm:gap-8 `}>
            <div className="border w-full bg-white p-4 sm:p-8 space-y-4">
              <div className="flex max-sm:flex-wrap gap-4">
                <div className="size-12 overflow-hidden rounded-md shrink-0">
                  <img
                    src={
                      state?.job?.companyLogo ??
                      "/assets/images/placeholder.jpg"
                    }
                    className="size-full"
                    alt=""
                  />
                </div>
                <div className="">
                  <h1 className="font-bold text-lg">{state?.job?.title}</h1>
                  <p className="-mt-1">{state?.job?.companyName}</p>
                </div>
              </div>
              <div className="">
                Posted {safeFormatDistanceToNow(state?.job?.postedAt)}
              </div>
            </div>

            <div className="border w-full bg-white p-4 sm:p-8 space-y-4 ">
              <div className="space-y-4 w-full">
                <h1 className="font-bold text-lg">Role Description</h1>
                <div
                  className="prose max-w-none w-full prose-p:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:m-0 [&_ol]:m-0 [&_ol]:list-decimal [&_ol]:pl-16 [&_li::marker]:text-blue-300 
                      [&_blockquote]:border-l-4 [&_blockquote]:border-blue-200 [&_blockquote]:pl-4 "
                  dangerouslySetInnerHTML={{
                    __html: description || state?.description_html || "",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobListingId;
