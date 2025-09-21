"use client";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CLPdfTemplate } from "./PdfTemplates/CLPdfTemplate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiDownload } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LetterType } from "@/types";
import { Loader } from "lucide-react";
import { useConfettiStore } from "@/hooks/useConfetti-store";
import { useCoverLetter, useGetCurrentUser, useSubstract } from "@/lib/queries";
import { useParams, useRouter } from "next/navigation";
import {
  AIGeneration,
  createdAt,
  formatString,
  geminiCall,
  geminiCallStream,
  NoneAIGenerationStream,
  stripeSpecialCharacters,
  TodayDate,
} from "@/lib/utils/helpers";
import { getContent } from "@/lib/firebase/api.firebase";
import { CLTWordTemplate1 } from "./wordTemplates/CLTWordTemplate1";
import { LetterEditComponent } from "./LetterEditComponent";
import { CL1Template } from "./PdfTemplates/CL1Template";
import { useAuth } from "@/hooks/use-auth";

export const EditCoverLetterId = () => {
  const { user:dbUser } = useAuth();
  const confetti = useConfettiStore();
  const { mutateAsync: subtractCredit } = useSubstract();
  const email = dbUser?.email;
  const { mutateAsync: updateCoverLetter, isPending } = useCoverLetter();
  const { id: slug } = useParams();
  const [AILoading, setAILoading] = useState(false);
  const TitleProfile = useRef("");
  const [pTitle, setPTitle] = useState<string | undefined>("");
  const [allData, setAllData] = useState<LetterType>();
  //   TODO : location
  //   const location = useLocation();
  const router = useRouter();
  let [valueQuill, setValueQuill] = useState("");
  const [pageMount, setPageMount] = useState(true);

  const regexGPT = /^gpt/;
  const regexGemini = /^gemini/;
  let gptModel: string;
  let geminiModel: string;
  useEffect(() => {
    const hasLetterAPICalled = localStorage.getItem("hasLetterAPICalled");

    if (location.state?.jobDesc && pageMount == true && !hasLetterAPICalled) {
      // setAILoading(true);
      const jobDesc = location?.state?.jobDesc;
      const dataSrc = location?.state?.dataSrc;
      const gemininGpt = location?.state?.gemininGpt;
      const docID = location?.state?.docID;
      const dataSrcObject = location?.state?.dataSrcObject;
      setSelectedValue({ title: location?.state?.keyTitle, link: slug });
      setPTitle("cverai...");

      const gptFetch = async (gptModel: string) => {
        const stream = await AIGeneration(
          "You are a professional Cover Letter generator",
          `Please generate a concise, well-written cover letter tailored for the a job title position at a company not more than 700 words. you'll get the value of job title and company name for the job description that will be passed in dynamically here: ${jobDesc}. The letter should focus on relevant skills, experiences, and achievements that align with the job description from here:${jobDesc} and here is also personal information uploaded by the candidate you can also use to customize the cover letter:${dataSrc}. Avoid including any greetings, salutations, headings, or placeholders like '[Company]' and '[Date]'. Start directly with the main content, addressing why the candidate is a strong fit for the role and the company. Be specific and professional, yet engaging in the tone. Avoid using any brackets or placeholders—assume all details have already been provided dynamically. please don't return any salutation in the generation, I'll handle that one by hard coding it. Exclude and omit these Sincerely, [Your Name], warm regards, dear hiring manager|team`,
          `Generate a professional cover letter from here: ${jobDesc} and please don't return any salutation in the generation, I'll handle that one by hard coding it. Exclude and omit these Sincerely, [Your Name], warm regards, dear hiring manager|team`,
          gptModel
        );
        for await (const part of stream!) {
          const content = part?.choices[0]?.delta?.content || "";
          valueQuill += content;
          setValueQuill(valueQuill);
        }
        const jobTitleAI = await NoneAIGenerationStream(
          "You are a professional Job Title generator",
          `Based on the following details, generate a suitable and professional title for this document: ${jobDesc},it should be less than 3 words, and don't add any introductory text to it, because I don't have enough space to display a long text. Here is the source of your information: ${jobDesc}`,
          `Generate a professional Title from here: ${jobDesc}`,
          gptModel
        );
        setAILoading(false);
        setPTitle(formatString(jobTitleAI!));
        const dataFromAI = {
          key: jobTitleAI!,
          data: valueQuill,
          firstName: dbUser?.firstName || "",
          lastName: dbUser?.lastName || "",
          email: email!,
          country: dbUser?.country.name || "",
          state: dbUser?.state || "",
          phoneNumber: dbUser?.phoneNumber || "",
          address: dbUser?.address || "",
          website: dataSrcObject?.portfolio || dbUser?.portfolio || "",
          portfolio: dataSrcObject?.linkedin || dbUser?.linkedin || "",
          category: "letter",
          letterID: docID,
          genTableId: docID,
          salutation: "Dear Hiring manager",
          closing: "Sincerely",
          imgIcon: "/assets/undraw/cover-letter.svg",
          createdAt: createdAt(),
          createdDateTime: TodayDate(),
          statue: "created",
          aiModel: gptModel,
        };
        setAllData(dataFromAI);
        setSelectedValue({
          title: jobTitleAI,
          link: slug,
        });
        dbUser?.coverLetterHistory?.unshift(dataFromAI);
        confetti?.onOpen();
        toast.success(`${jobTitleAI} Cover letter created successfully ✔😀`);
        await updateCoverLetter(dbUser?.coverLetterHistory);
        subtractCredit();
        localStorage.setItem("hasLetterAPICalled", "true");
      };

      const geminiFetch = async (geminiModel: string) => {
        const result = await geminiCallStream(
          `Please generate a concise, well-written cover letter tailored for the a job title position at a company not more than 700 words. you'll get the value of job title and company name for the job description that will be passed in dynamically here: ${jobDesc}. The letter should focus on relevant skills, experiences, and achievements that align with the job description from here:${jobDesc} and here is also personal information uploaded by the candidate you can also use to customize the cover letter:${dataSrc}. Avoid including any greetings, salutations, headings, or placeholders like '[Company]' and '[Date]'. Start directly with the main content, addressing why the candidate is a strong fit for the role and the company. Be specific and professional, yet engaging in the tone. Avoid using any brackets or placeholders—assume all details have already been provided dynamically. please don't return any salutation in the generation, I'll handle that one by hard coding it. Exclude and omit these Sincerely, [Your Name], warm regards, dear hiring manager|team`,
          geminiModel
        );
        for await (const chunk of result.stream) {
          const chunkText = chunk?.text();
          // let content = part.choices[0]?.delta?.content || "";
          valueQuill += chunkText;
          setValueQuill((prev) => prev + chunkText);
          // setValueQuill(valueQuill);
        }
        const jobTitleAI = await geminiCall(
          `Based on the following details, generate a suitable and professional title for this document: ${jobDesc},it should be less than 3 words, and don't add any introductory text to it, because I don't have enough space to display a long text. Here is the source of your information: ${jobDesc}`,
          geminiModel
        );
        setAILoading(false);
        setPTitle(formatString(jobTitleAI!));
        const dataFromAI = {
          key: jobTitleAI!,
          data: valueQuill,
          firstName: dbUser?.firstName || "",
          lastName: dbUser?.lastName || "",
          email: email!,
          country: dbUser?.country.name || "",
          state: dbUser?.state || "",
          phoneNumber: dbUser?.phoneNumber || "",
          address: dbUser?.address || "",
          website: dataSrcObject?.portfolio || dbUser?.portfolio || "",
          portfolio: dataSrcObject?.linkedin || dbUser?.linkedin || "",
          category: "letter",
          letterID: docID,
          genTableId: docID,
          salutation: "Dear Hiring manager",
          closing: "Sincerely",
          imgIcon: "/assets/undraw/cover-letter.svg",
          createdAt: createdAt(),
          createdDateTime: TodayDate(),
          statue: "created",
          aiModel: geminiModel,
        };
        setAllData(dataFromAI);
        setSelectedValue({
          title: jobTitleAI,
          link: slug,
        });
        dbUser?.coverLetterHistory?.unshift(dataFromAI);
        confetti.onOpen();
        toast.success(`${jobTitleAI} Cover letter created successfully ✔😀`);
        await updateCoverLetter(dbUser?.coverLetterHistory);
        subtractCredit();
        localStorage.setItem("hasLetterAPICalled", "true");
      };

      if (regexGPT.test(gemininGpt)) {
        if (gemininGpt === "gpt35turbo") {
          gptModel = "gpt-3.5-turbo";
        } else if (gemininGpt === "gpt4omini") {
          gptModel = "gpt-4o-mini";
        } else if (gemininGpt === "gpt4oandgpt4") {
          gptModel = "gpt-4-turbo";
        } else if (gemininGpt === "gpt4o") {
          gptModel = "gpt-4o";
        }

        // return;
        gptFetch(gptModel);
      }

      if (regexGemini.test(gemininGpt)) {
        if (gemininGpt === "gemini15pro") {
          geminiModel = "gemini-1.5-pro";
        } else if (gemininGpt === "gemini15flash8b") {
          geminiModel = "gemini-1.5-flash-8b";
        } else if (gemininGpt === "gemini15flash") {
          geminiModel = "gemini-1.5-flash";
        }
        // return;
        geminiFetch(geminiModel);
      }

      setPageMount(false);
    }
  }, []);
  useEffect(() => {
    if (dbUser?.coverLetterHistory && slug) {
      const matchedSlug = dbUser?.coverLetterHistory?.find(
        (item: any) => formatString(item.genTableId) == slug
      );
      setAllData(matchedSlug);
      setValueQuill(matchedSlug?.data);
      const sValue = matchedSlug?.key?.toLowerCase();
      const genTableId = matchedSlug?.genTableId;
      TitleProfile.current = formatString(sValue);
      setPTitle(stripeSpecialCharacters(sValue));
      setSelectedValue({ title: formatString(sValue), link: genTableId });
      setValueQuill(matchedSlug?.data);
    }
  }, [dbUser]);
  const [selectedValue, setSelectedValue] = useState<any>();
  const handleValueChange = async (link: any) => {
    const index = dbUser?.coverLetterHistory?.findIndex(
      (item: any) => item?.genTableId == link
    );
    const selected = dbUser?.coverLetterHistory?.find(
      (item: any) => item?.genTableId == link
    );
    const data = await getContent();
    const content = data?.coverLetterHistory;
    setValueQuill(content[index].data);
    router.push(`/dashboard/letter/${link}`);
    setSelectedValue({
      title: dbUser?.coverLetterHistory[index]?.key,
      link: dbUser?.coverLetterHistory[index]?.genTableId,
    });
    TitleProfile.current = dbUser?.coverLetterHistory[index]?.key;
    setPTitle(dbUser?.coverLetterHistory[index]?.key);
    setAllData(selected);
    setValueQuill(selected?.data);
  };
  const onSubmit = async () => {
    setAILoading(true);
    const idx = dbUser?.coverLetterHistory?.findIndex(
      (item: any) => formatString(item?.genTableId) === slug
    );
    if (dbUser) dbUser.coverLetterHistory[idx] = allData;
    await updateCoverLetter(dbUser?.coverLetterHistory);
    setAILoading(false);
    return toast.success(
      `${dbUser?.coverLetterHistory[idx]?.key} successfully updated!`
    );
  };
  const [deleteDialog, setDeleteDialog] = useState(false);
  const handleDeleteDialog = () => {
    setDeleteDialog(!deleteDialog);
  };
  const [alertDialog, setAlertDialog] = useState(false);
  const handleAlertDialog = () => {
    setAlertDialog(!alertDialog);
  };
  const deletePro = async (id: number | string) => {
    setDeleteDialog(false);
    setAlertDialog(true);
    setDeleteDialog(false);
    try {
      const filtered = dbUser?.coverLetterHistory?.filter(
        (cletter: any) => cletter.genTableId !== id
      );
      await updateCoverLetter(filtered);
      setAlertDialog(false);
      router.push(`/dashboard/letter`);
      toast.success(`${allData?.key} deleted.`);
    } catch (error) {
      console.error(error);
    } finally {
      setAlertDialog(false);
      setDeleteDialog(false);
    }
  };
  // add geminin key to vercel
  return (
    <>
      <div className="flex flex-col sm:px-8 px-4 gap-4 sm:gap-8  ">
        <Tabs
          defaultValue="preview"
          className="flex flex-col gap-4 relative pb-4"
        >
          <div className="flex justify-between">
            <Select
              value={selectedValue?.link}
              onValueChange={handleValueChange}
            >
              <SelectTrigger className="max-w-[200px] text-start">
                <SelectValue placeholder="Select a Profile" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectLabel>My Cover Letter</SelectLabel>
                  {dbUser?.coverLetterHistory?.map(
                    (item: any, index: number) => {
                      return (
                        <SelectItem key={index} value={item?.genTableId}>
                          {stripeSpecialCharacters(item.key)}
                        </SelectItem>
                      );
                    }
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex ">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex place-items-center p-1 mx-2 rounded-md bg-slate-100">
                    {AILoading ? (
                      <Loader className="w-5 h-5 animate-spin text-blueColor" />
                    ) : (
                      <FiDownload className=" h-6 w-6" />
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel className="flex hover:scale-95 hover:cursor-pointer hover:bg-gray-200 rounded-md transition-all duration-1000">
                    <PDFDownloadLink
                      document={<CLPdfTemplate allData={allData} />}
                      fileName={`${allData?.key}`}
                    >
                      {() => (
                        <>
                          <button className="max-w-28 text-start sm:max-w-60 line-clamp-1">
                            {allData?.key}
                          </button>
                        </>
                      )}
                    </PDFDownloadLink>
                    <div className="text-blue-500">.pdf</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-300" />
                  <CLTWordTemplate1 allData={allData}>
                    <DropdownMenuLabel className="flex hover:scale-95 hover:cursor-pointer hover:bg-gray-200 rounded-md transition-all duration-1000">
                      <div className="max-w-28 text-start sm:max-w-60 line-clamp-1">
                        {allData?.key}
                      </div>
                      <div className="text-blue-500">.docx</div>
                    </DropdownMenuLabel>
                  </CLTWordTemplate1>
                </DropdownMenuContent>
              </DropdownMenu>

              <TabsList className="px-2 rounded-lg">
                <TabsTrigger value="preview" className="w-1/2 rounded-md">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="edit" className="w-1/2 rounded-md">
                  Edit
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="preview" className="">
            <CL1Template
              AILoading={AILoading}
              allData={allData}
              data={valueQuill}
            />
          </TabsContent>
          <TabsContent value="edit">
            <LetterEditComponent
              setAllData={setAllData}
              AILoading={AILoading}
              allData={allData}
              onSubmit={onSubmit}
              setValueQuill={setValueQuill}
              valueQuill={valueQuill}
              isPending={isPending}
              deletePro={deletePro}
              handleAlertDialog={handleAlertDialog}
              alertDialog={alertDialog}
              handleDeleteDialog={handleDeleteDialog}
              deleteDialog={deleteDialog}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
