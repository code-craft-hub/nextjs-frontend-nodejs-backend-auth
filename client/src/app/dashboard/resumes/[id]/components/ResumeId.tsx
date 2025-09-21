"use client";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IoTrashOutline } from "react-icons/io5";
import { LuPencil } from "react-icons/lu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useConfettiStore } from "@/hooks/useConfetti-store";

import { toast } from "sonner";
import { DBUserT } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { UseCV, useGetCurrentUser, useSubstract } from "@/lib/queries";
import {
  AIGeneration,
  createdAt,
  educationArrayParsed,
  NoneAIGenerationStream,
  saveJsonParserSquareBrackets,
  stripeSpecialCharacters,
  TodayDate,
  workArrayParsed,
} from "@/lib/utils/helpers";
import Link from "next/link";
import CV1Template from "./resume-templates/CV1Template";
import CV2Template from "./resume-templates/CV2Template";
import CV3Template from "./resume-templates/CV3Template";
import InsufficientCreditsModal from "@/components/shared/InsufficientCreditsModal";
import PDFDownloadComponent from "./resume-templates/PDFDownloadComponent";
import { useAuth } from "@/hooks/use-auth";

export const ResumeId = () => {
  const { user:dbUser } = useAuth();
  const router = useRouter();
  const confetti = useConfettiStore();
  const dataRef = useRef<DBUserT>(undefined);

  const [docType, setDocType] = useState("1");
  const { id: slug } = useParams();
  const { mutateAsync: subtractCredit } = useSubstract();
  const { mutateAsync: CVMutuation, isPending } = UseCV();

  const [creditAlert, setCreditAlert] = useState(false);
  const [pageMount, setPageMount] = useState(true);
  const [AILoading, setAILoading] = useState(false);
  const [userDataDB, setUserDataDB] = useState<DBUserT | undefined>();
  let [profileTitle, setProfileTitle] = useState<string | undefined>("");
  useEffect(() => {
    const hasResumeAPICalled = localStorage.getItem("hasResumeAPICalled");

    const email = user?.email;
    setUserDataDB({
      firstName: dbUser?.firstName || "",
      lastName: dbUser?.lastName || "",
      email: email!,
      phoneNumber: dbUser?.phoneNumber || "",
      address: dbUser?.address || "",
      website: `${dbUser?.firstName}${dbUser?.lastName}.com`,
      portfolio: `Linkedin.com/${dbUser?.firstName}${dbUser?.lastName}`,
    });
    if (location.state?.jobDesc && pageMount == true && !hasResumeAPICalled) {
      if (dbUser?.credit === 0 || dbUser?.credit <= 0) {
        setCreditAlert(true);
        toast.error("You've used up your create. Top up here.");
        setTimeout(() => {
          router.push("/dashboard/credit", { replace: true });
        }, 4000);
        return;
      }
      setAILoading(true);
      const jobDesc = location?.state?.jobDesc;
      const dataSrc = location?.state?.dataSrc;
      const docID = location?.state?.docID;
      const dataSrcObject = location?.state?.dataSrcObject;
      try {
        const fetchFunction = async () => {
          const stream = await AIGeneration(
            "You are a professional Profile summarizer",
            `Using the following job description: ${jobDesc}, write a professional summary that I can use to highlight my relevant skills and experiences. Keep the summary within 1200 characters and under 120 words. Focus on aligning it with the job description by incorporating key terms and phrases. The content should create a compelling narrative that emphasizes my qualifications and the potential impact I can bring to the role. Aim to make the summary stand out and grab the recruiter's attention. Use the job description provided: ${jobDesc} and the additional data source: ${dataSrc} to guide your response. Avoid third-person language and ensure the narrative is written from my perspective.`,
            `Using the following job description: ${jobDesc}, write a professional summary that I can use to highlight my relevant skills and experiences. Keep the summary within 1200 characters and under 120 words. Focus on aligning it with the job description by incorporating key terms and phrases. The content should create a compelling narrative that emphasizes my qualifications and the potential impact I can bring to the role. Aim to make the summary stand out and grab the recruiter’s attention. Use the job description provided: ${jobDesc} and the additional data source: ${dataSrc} to guide your response. Avoid third-person language and ensure the narrative is written from my perspective.`
          );
          for await (const part of stream!) {
            const content = part.choices[0]?.delta?.content || "";
            profileTitle += content;
            setProfileTitle(profileTitle);
          }

          try {
            const [
              jobTitleAI,
              softSkillsAI,
              hardSkillsAI,
              educationsAI,
              worksAI,
            ] = await Promise.all([
              NoneAIGenerationStream(
                "You are a professional Job Title generator",
                `Generate a suitable job title from this job description: ${jobDesc}. INSTRUCTION: Don't add any introductory or ending text to it. Just return the jobtitle. e.g Nurse, Gamer, Attorney etc.`,
                `Generate a suitable job title from this job description: ${jobDesc}. INSTRUCTION: Don't add any introductory or ending text to it. Just return the jobtitle. e.g Nurse, Gamer, Attorney etc.`
              ),
              NoneAIGenerationStream(
                "You're a proficient soft skill synthesizer.",
                `Analyze the following job description and provide a JSON array listing 4 or 5 soft skills that are relevant to the job description and that increase the chances of getting hired. The output should be formatted as a JSON array where each element is an object containing a "label" and "value" field. The "label" should describe the skill category, and the "value" should be unique index from 0 upwards. Here is the job description: ${jobDesc} and data source here: ${dataSrc}. Output format: [{"value": "0","label": ""}, {"value": "0","label": ""}, ...]. Do not include any additional text before or after the JSON array.`,
                `Analyze the following job description and provide a JSON array listing 4 or 5 soft skills that are relevant to the job description and that increase the chances of getting hired. The output should be formatted as a JSON array where each element is an object containing a "label" and "value" field. The "label" should describe the skill category, and the "value" should be unique index from 0 upwards. Here is the job description: ${jobDesc} and data source here: ${dataSrc}. Output format: [{"value": "0","label": ""}, {"value": "0","label": ""}, ...]. Do not include any additional text before or after the JSON array.`
              ),
              NoneAIGenerationStream(
                "You're a proficient hard skill synthesizer.",
                `Analyze the following job description and provide a JSON array listing 4 or 5 hard skills that are relevant to the job description and that increase the chances of getting hired. The output should be formatted as a JSON array where each element is an object containing a "label" and "value" field. The "label" should describe the skill category, and the "value" should be unique index from 0 upwards. Here is the job description: ${jobDesc} and data source here: ${dataSrc}. Output format: [{"value": "0","label": ""}, {"value": "0","label": ""}, ...]. Do not include any additional text before or after the JSON array.`,
                `Analyze the following job description and provide a JSON array listing 4 or 5 hard skills that are relevant to the job description and that increase the chances of getting hired. The output should be formatted as a JSON array where each element is an object containing a "label" and "value" field. The "label" should describe the skill category, and the "value" should be unique index from 0 upwards. Here is the job description: ${jobDesc} and data source here: ${dataSrc}. Output format: [{"value": "0","label": ""}, {"value": "0","label": ""}, ...]. Do not include any additional text before or after the JSON array.`
              ),
              NoneAIGenerationStream(
                "You're a proficient educationist history generator.",
                `Generate a JSON array with the following information:
                Education details including EduID, degree,fieldOfStudy, schoolName, schoolLocation,educationStart, educationEnd. Use real world schools if you don't find a school in this prompt, you can use school name like prinston, yale and others. The EduID field must be unique with its index starting from 1 and upwards. Look for all the information that you need from this prompt, but if you don't find the required one, generate real world information. Ensure that the educationStart and educationEnd fields use the MM-DD-YYYY format, such as 08-19-2003. If the education is ongoing, use the current date in MM-DD-YYYY format as the educationEnd. Here is your source of information from the user, use it to customize the result so that it will be personal to the user, HERE IS YOUR Data source: ${dataSrc}.  Do not include any preceding or ending text, and ensure that the words 'presently' or 'currently' are not used in the JSON array.  `,
                `Generate a JSON array with the following information: Education details including EduID, degree,fieldOfStudy, schoolName, schoolLocation,educationStart, educationEnd. Use real world schools if you don't find a school in this prompt, you can use school name like prinston, yale and others. The EduID field must be unique with its index starting from 1 and upwards. Look for all the information that you need from this prompt, but if you don't find the required one, generate real world information. Ensure that the educationStart and educationEnd fields use the MM-DD-YYYY format, such as 08-19-2003. If the education is ongoing, use the current date in MM-DD-YYYY format as the educationEnd. Here is your source of information from the user, use it to customize the result so that it will be personal to the user, HERE IS YOUR Data source: ${dataSrc}. Do not include any preceding or ending text, and ensure that the words 'presently' or 'currently' are not used in the JSON array. `
              ),
              NoneAIGenerationStream(
                "You're a proficient work experience synthesizer.",
                `Generate a JSON array representing all the work experience found in the user profile provided. The information source is: ${dataSrc}. Concentrate exclusively on the work experience section of the provided user profile. For any missing details, use real-world data to amplify and enhance the entries, ensuring they are practical and realistic. Do not generate generic placeholders. Amplify the descriptions for ATS optimization using relevant keywords and detailed responsibilities.

Each work experience entry should include the following fields: 
- workID (unique identifier for each job),
- companyName,
- jobTitle,
- workDescription (highlighting the role's overall contribution and achievements),
- location,
- responsibilities (specific tasks and impact-driven responsibilities),
- jobStart (in MM-DD-YYYY format),
- jobEnd (in MM-DD-YYYY format; use the current date if ongoing).

If any experience details are incomplete or missing in the provided user profile, research or generate realistic and relevant information for the missing parts. The generated content must align with the role and industry for authenticity. Do not reorder the experiences; maintain their sequence as per the profile. Return only the JSON array as the output, without any additional text or explanations.

For example:
[
  {
    "workID": "1",
    "companyName": "Acme Corp",
    "jobTitle": "Software Engineer",
    "workDescription": "Developed high-performing software applications, optimizing system efficiency.",
    "location": "New York, NY",
    "responsibilities": [
      "Designed and implemented scalable microservices architecture.",
      "Collaborated with cross-functional teams to deliver key projects within deadlines.",
      "Improved application performance, achieving a 20% reduction in processing time."
    ],
    "jobStart": "08-15-2015",
    "jobEnd": "06-30-2020"
  }
]`
              ),
            ]);
            const { user } = useAuth();

            const email = user?.email;
            const resumeUser = {
              cvTitle: jobTitleAI!,
              key: jobTitleAI!,
              firstName: dbUser?.firstName || "",
              lastName: dbUser?.lastName || "",
              email: email!,
              country: dbUser?.country.name || "",
              state: dbUser?.state || "",
              phoneNumber: dbUser?.phoneNumber || "",
              address: dbUser?.address || "",
              website: dataSrcObject?.portfolio || dbUser?.portfolio || "",
              portfolio: dataSrcObject?.linkedin || dbUser?.linkedin || "",
              profile: profileTitle || "",
              cvJobTitle: jobTitleAI || "",
              educations: educationArrayParsed(educationsAI!),
              softSkills: saveJsonParserSquareBrackets(softSkillsAI!),
              hardSkills: saveJsonParserSquareBrackets(hardSkillsAI!),
              workExperiences: workArrayParsed(worksAI!),
              category: "resume",
              resumeID: docID,
              genTableId: docID,
              imgIcon: "/assets/undraw/cv1.svg",
              createdAt: createdAt(),
              createdDateTime: TodayDate(),
              statue: "created",
            };
            dataRef.current = resumeUser;
            setUserDataDB(resumeUser);
            dbUser?.CV?.unshift(dataRef.current);
            toast.success(
              `${dataRef.current?.firstName} ${dataRef.current?.lastName} resume created successfully ✔😀`
            );
            setAILoading(false);
            confetti.onOpen();
            await CVMutuation(dbUser?.CV!);
            await subtractCredit();
            localStorage.setItem("hasResumeAPICalled", "true");
          } catch (error) {
            console.error("Error during AI generation:", error);
          }
        };
        fetchFunction();
      } catch (error) {
        console.error(error);
      } finally {
        setPageMount(false);
      }
    }
  }, []);

  useEffect(() => {
    if (dbUser) {
      try {
        const slugPageIndex = dbUser?.CV?.findIndex(
          (item: any) => item?.genTableId === slug
        );
        if (slugPageIndex !== -1) {
          dataRef.current = dbUser?.CV[slugPageIndex];
          setUserDataDB(dataRef.current);
          setProfileTitle(dataRef.current?.profile);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, [dbUser, slug]);

  const workDelete = async () => {
    if (!dbUser?.CV) return;
    const slugPageIndex = dbUser?.CV?.findIndex(
      (item: any) => item?.genTableId === slug
    );
    if (slugPageIndex !== -1) {
      dbUser?.CV?.splice(slugPageIndex, 1);
      await CVMutuation(dbUser?.CV);
      toast.success(
        `${userDataDB?.firstName} ${userDataDB?.lastName} resume deleted!`
      );
      router.push(`/dashboard/resume/all_resumes`);
    }
  };
  const [deleteDialog, setDeleteDialog] = useState(false);
  const handleDeleteDialog = () => {
    setDeleteDialog(!deleteDialog);
  };

  return (
    <>
      <div className="flex flex-col sm:px-8 px-4 gap-4 sm:gap-8 mb-8">
        <div className="flex max-sm:my-4 max-w-screen-lg ">
          <DropdownMenu>
            <DropdownMenuTrigger className="bg-blueColor rounded-md p-2 text-white hover:scale-90 duration-1000 ">
              Change Template
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="hover:cursor-pointer"
                onClick={() => {
                  setDocType("1");
                  console.log("Combination CV (Hybrid CV)");
                }}
              >
                Combination CV (Hybrid CV)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="hover:cursor-pointer"
                onClick={() => {
                  setDocType("2");
                  console.log("Functional/Skills-based CV");
                }}
              >
                Functional/Skills-based CV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="hover:cursor-pointer"
                onClick={() => {
                  setDocType("3");
                  console.log("Chronological CV");
                }}
              >
                Chronological CV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-1 sm:gap-2 ml-auto sm:pt-0 ">
            <Link href={`/dashboard/resume/${slug}/edit`}>
              <Button
                variant="outline"
                className="!p-2 sm:!px-4 hover:scale-90"
                disabled={AILoading}
              >
                <LuPencil className="text-blueColor h-6 w-6 md:hdden" />
                <span className="text-blue-500 hidden md:flx">Edit</span>
                {AILoading && <Loader className="ml-2 animate-spin" />}
              </Button>
            </Link>

            <PDFDownloadComponent userDataDB={dataRef.current} />

            {!AILoading && (
              <Button
                variant="outline"
                className="!p-2 sm:!px-4 hover:scale-90"
                onClick={() => setDeleteDialog(true)}
                disabled={isPending || AILoading}
              >
                <IoTrashOutline className="h-6 w-6 text-red-500 " />{" "}
                <span className=" hidden md:fex">Delete</span>
                {isPending && <Loader className="ml-2 animate-spin" />}
              </Button>
            )}
          </div>
        </div>

        <AlertDialog open={deleteDialog} onOpenChange={handleDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete{" "}
                <span className="text-red-500">
                  <q>
                    {stripeSpecialCharacters(
                      userDataDB?.key ? userDataDB?.key : ""
                    )}
                  </q>
                </span>{" "}
                Resume from our database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={workDelete}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <main className="">
          <>
            {docType == "2" && (
              <CV1Template
                userDataDB={dataRef.current}
                profileTitle={profileTitle}
              />
            )}
            {docType == "1" && (
              <>
                <CV2Template
                  userDataDB={dataRef.current}
                  profileTitle={profileTitle}
                />
              </>
            )}
            {docType == "3" && (
              <CV3Template
                userDataDB={dataRef.current}
                profileTitle={profileTitle}
              />
            )}
          </>
        </main>
      </div>
      {creditAlert ? <InsufficientCreditsModal /> : ""}
    </>
  );
};
