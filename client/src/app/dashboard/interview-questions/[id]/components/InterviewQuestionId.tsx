"use client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import { useConfettiStore } from "@/hooks/useConfetti-store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewResumeTemplate, QuestionType } from "@/types";
import { toast } from "sonner";
import { useGetCurrentUser, useQuestions, useSubstract } from "@/lib/queries";
import { initialData } from "@/constants/jobs-data";
import { useParams, useRouter } from "next/navigation";
import {
  AIGeneration,
  createdAt,
  formatString,
  NoneAIGenerationStream,
  stripeSpecialCharacters,
  TodayDate,
} from "@/lib/utils/helpers";
import InsufficientCreditsModal from "@/components/shared/InsufficientCreditsModal";
import IQ1Template from "./IQ1Template";
import { getContent } from "@/lib/firebase/api.firebase";
import { useAuth } from "@/hooks/use-auth";
export const InterviewQuestionId = () => {
  const { user:dbUser } = useAuth();
  const parser = new DOMParser();
  const docsRef = useRef("");
  const { mutateAsync: QMutation } = useQuestions();
  const { mutateAsync: subtractCredit } = useSubstract();
  const confetti = useConfettiStore();
  const [allData, setAllData] = useState<QuestionType | undefined>();

  const dataRef = useRef<NewResumeTemplate>(initialData);
  const { id: slug } = useParams();
  const TitleProfile = useRef("");
  const [pTitle, setPTitle] = useState<string | undefined>("");
  //   TODO : LOCATION
  const pdfDataRef = useRef<
    | {
        [x: string]: string | number;
        id: number;
      }[]
    | string[]
  >([]);
  const router = useRouter();
  let [valueQuill, setValueQuill] = useState<string>("");
  const [pageMount, setPageMount] = useState(true);
  const [creditAlert, setCreditAlert] = useState(false);
  const [AILoading, setAILoading] = useState(false);
  let QA: string | string[];
  useEffect(() => {
    const hasQuestionAPICalled = localStorage.getItem("hasQuestionAPICalled");
    if (location.state?.jobDesc && pageMount == true && !hasQuestionAPICalled) {
      if (dbUser?.credit === 0 || dbUser?.credit <= 0) {
        setCreditAlert(true);
        toast.error("You've used up your create.");
        setTimeout(() => {
          router.push("/dashboard/credit");
        }, 4000);
        return;
      }
      const jobDesc = location?.state?.jobDesc;
      const dataSrc = location?.state?.dataSrc;
      const docID = location?.state?.docID;
      // const questionTitle = location?.state?.questionTitle;
      setSelectedValue({ title: location?.state?.keyTitle, link: slug });
      const fetch = async () => {
        setAILoading(true);
        setPTitle("Cverai ...");

        const stream = await AIGeneration(
          "You are an experienced professional recruiter with extensive expertise in crafting tailored interview questions that align with specific job descriptions and assessing candidates comprehensively.",
          `Based on my portfolio ${dataSrc}, analyze the job description provided in ${jobDesc} to generate 10 highly relevant job interview questions and answers. Use the following approach: 
          - Derive questions from the explicit and implicit requirements in the job description, emphasizing technical skills, role-specific competencies, and alignment with organizational values. 
          - Ensure a balance of technical, behavioral, and situational questions that assess both hard and soft skills.
          - Include at least 5 STAR-based questions (Situation, Task, Action, Result) to evaluate candidates' problem-solving abilities and real-world application of skills.
          - Focus on crafting questions that explore the candidate's adaptability, cultural fit, and capacity to excel in the specific role outlined. *Important instructions: - Each question must be prefixed with exactly "Q:", and each answer must be prefixed with exactly "A:". - Only use **one* prefix for each question and answer. Do not use any other prefixes or variations. - The "Q:" prefix must only be used for questions, and the "A:" prefix must only be used for answers. Remember: Use *only* "Q:" for questions and *only* "A:" for answers. Strictly follow the specified delimiters. Remember you must return questions first before answers so that the application will not break. REMEMBER DON'T ADD ANY INTRODUCTORY OR ENDING SENTENCE OR WORD, JUST THE QUESTIONS FOLLOWED BY ANWSERS.`,
          `Based on my portfolio ${dataSrc}, analyze the job description provided in ${jobDesc} to generate 10 highly relevant job interview questions and answers. Use the following approach: 
          - Derive questions from the explicit and implicit requirements in the job description, emphasizing technical skills, role-specific competencies, and alignment with organizational values. 
          - Ensure a balance of technical, behavioral, and situational questions that assess both hard and soft skills.
          - Include at least 5 STAR-based questions (Situation, Task, Action, Result) to evaluate candidates' problem-solving abilities and real-world application of skills.
          - Focus on crafting questions that explore the candidate's adaptability, cultural fit, and capacity to excel in the specific role outlined. *Important instructions: - Each question must be prefixed with exactly "Q:", and each answer must be prefixed with exactly "A:". - Only use **one* prefix for each question and answer. Do not use any other prefixes or variations. - The "Q:" prefix must only be used for questions, and the "A:" prefix must only be used for answers. Remember: Use *only* "Q:" for questions and *only* "A:" for answers. Strictly follow the specified delimiters. Remember you must return questions first before answers so that the application will not break. REMEMBER DON'T ADD ANY INTRODUCTORY OR ENDING SENTENCE OR WORD, JUST THE QUESTIONS FOLLOWED BY ANWSERS.`
        );
        for await (const part of stream!) {
          let content = part.choices[0]?.delta?.content || "";
          valueQuill += content;
          //@ts-ignore
          QA = organizeQA(
            valueQuill
              ?.split("\n")
              ?.map((line) => {
                if (!line) return "";
                return line
                  ?.trim()
                  ?.replace(/^undefined/, "")
                  ?.trim();
              })
              ?.filter((line) => line)
          );

          if (allData) allData.data = QA;
          //@ts-ignore
          setAllData((prev) => ({ ...prev, QA }));
          //@ts-ignore
          pdfDataRef.current = QA;
          //@ts-ignore
          setValueQuill(QA);
        }
        // for await (const part of stream) {
        //   let content = part.choices[0]?.delta?.content || "";
        //   valueQuill += content;
        //   setValueQuill(QARegex(valueQuill));
        //   if (allData) allData.data = QARegex(valueQuill);
        //   pdfDataRef.current = QARegex(valueQuill);
        // }
        const jobTitleAI = await NoneAIGenerationStream(
          "You are a professional Job Title generator",
          `Based on the following details, generate a suitable and professional title for this document: ${jobDesc},it should be less than 3 words, and don't add any introductory text to it, because I don't have enough space to display a long text. Here is the source of your information: ${jobDesc}`,
          `Generate a professional Title from here: ${jobDesc}`
        );
        setPTitle(stripeSpecialCharacters(jobTitleAI!));
        setAILoading(false);
        setSelectedValue({
          title: stripeSpecialCharacters(jobTitleAI!),
          link: slug,
        });
        let AIData = {
          key: stripeSpecialCharacters(jobTitleAI!),
          // data: pdfDataRef.current,
          QA,
          category: "question",
          questionID: docID,
          genTableId: docID,
          imgIcon: "/assets/undraw/research.svg",
          createdAt: createdAt(),
          createdDateTime: TodayDate(),
          statue: "created",
        };
        //@ts-ignore
        setAllData(AIData);
        dbUser?.questions?.unshift(AIData);
        subtractCredit();
        toast.success(`Interview question created ✔😀`);
        confetti.onOpen();
        await QMutation(dbUser?.questions);
        localStorage.setItem("hasQuestionAPICalled", "true");
      };
      fetch();
      setPageMount(false);
    }
  }, []);

  useEffect(() => {
    if (dbUser) {
      dataRef.current = dbUser as NewResumeTemplate;
    }
    if (dbUser?.questions && slug) {
      const matchedSlug = dbUser?.questions?.find(
        (item: any) => formatString(item.genTableId) == slug
      );
      const sValue = matchedSlug?.key?.toLowerCase();
      const genTableId = matchedSlug?.genTableId;
      TitleProfile.current = formatString(sValue);
      setPTitle(formatString(sValue));
      setSelectedValue({ title: formatString(sValue), link: genTableId });
      if (matchedSlug) {
        setAllData(matchedSlug);
        setValueQuill(matchedSlug?.data);
        pdfDataRef.current = matchedSlug?.data;
        const doc = parser.parseFromString(matchedSlug?.data, "text/html");
        if (doc.body.textContent) {
          docsRef.current = doc.body.textContent;
        }
      }
    }
  }, [dbUser, valueQuill]);

  const fullLetterFunction = async ({ link, index }: any) => {
    const data = await getContent();
    const content = data?.questions;
    setValueQuill(content[index].data);
    pdfDataRef.current = content[index].data;
    router.push(`/dashboard/question/${link}`, {
      replace: true,
    });
  };
  // const onSubmit = async () => {
  //   setAILoading(true);
  //   const idx = dbUser?.questions?.findIndex(
  //     (item: any) => formatString(item?.genTableId) === slug
  //   );
  //   if (dbUser) dbUser.questions[idx] = allData;
  //   await QMutation(dbUser?.questions);
  //   setAILoading(false);
  //   return toast.success(`Doc updated!`);
  // };

  const [selectedValue, setSelectedValue] = useState<any>();

  const handleValueChange = (link: any) => {
    const index = dbUser?.questions?.findIndex(
      (item: any) => item?.genTableId == link
    );
    fullLetterFunction({ link, index });
    setSelectedValue({
      title: dbUser?.questions[index]?.key,
      link: dbUser?.questions[index]?.genTableId,
    });
    TitleProfile.current = dbUser?.questions[index]?.key;
    setPTitle(dbUser?.questions[index]?.key);
  };
  // const [deleteDialog, setDeleteDialog] = useState(false);
  // const handleDeleteDialog = () => {
  //   setDeleteDialog(!deleteDialog);
  // };
  // const [alertDialog, setAlertDialog] = useState(false);
  // const handleAlertDialog = () => {
  //   setAlertDialog(!alertDialog);
  // };
  // const deletePro = async (id: number | string) => {
  //   setDeleteDialog(false);
  //   setAlertDialog(true);
  //   setDeleteDialog(false);
  //   try {
  //     const filtered = dbUser?.questions?.filter(
  //       (question: any) => question.genTableId !== id
  //     );
  //     await QMutation(filtered);
  //     setAlertDialog(false);
  //     router.push(`/dashboard/question`, {
  //       replace: true,
  //     });
  //     toast.success(`Data deleted.`);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setAlertDialog(false);
  //     setDeleteDialog(false);
  //   }
  // };
  return (
    <>
      <div className="flex flex-col sm:px-8 px-4 gap-4 sm:gap-8 ">
        <Tabs defaultValue="preview" className="mb-8">
          <div className="flex justify-between mb-4 sm:mb-8">
            <Select
              value={selectedValue?.link}
              onValueChange={handleValueChange}
            >
              <SelectTrigger className="max-w-[200px] text-start">
                <SelectValue placeholder="Select a Profile" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectLabel>My Interview questions</SelectLabel>
                  {dbUser?.questions?.map((item: any, index: number) => {
                    return (
                      <SelectItem key={index} value={item?.genTableId}>
                        {stripeSpecialCharacters(item.key)}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <TabsContent value="preview" className="">
            <IQ1Template
              AILoading={AILoading}
              allData={allData}
              data={valueQuill}
            />
          </TabsContent>
          <TabsContent value="edit"></TabsContent>
        </Tabs>
      </div>
      {creditAlert ? <InsufficientCreditsModal /> : ""}
    </>
  );
};
