"use client";

import { useState, useRef, useEffect } from "react";
// import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IoTrashOutline } from "react-icons/io5";
import { FaRegSave } from "react-icons/fa";
import { NewResumeTemplate } from "@/types";
import { toast } from "sonner";
import { useDataSource, useGetCurrentUser } from "@/lib/queries";
import { initialData, modules } from "@/constants/jobs-data";
import { formatString } from "@/lib/utils/helpers";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export const ProfileId = () => {
  const { user:dbUser } = useAuth();
  const parser = new DOMParser();
  const docsRef = useRef("");
  const { mutateAsync: DataSource } = useDataSource();
  const dataRef = useRef<NewResumeTemplate>(initialData);
  const { id: slug } = useParams();
  const TitleProfile = useRef("");
  const [pTitle, setPTitle] = useState("");
  //   TODO replace useLocation
  //   const location = useLocation();
  const router = useRouter();
  const [valueQuill, setValueQuill] = useState("");
  const [allData, setAllData] = useState<{
    data?: string | undefined;
    genTableId?: string;
    key?: string;
    linkedin?: string;
    portfolio?: string;
  }>({
    data: "",
    genTableId: "",
    key: "",
    linkedin: "",
    portfolio: "",
  });

  useEffect(() => {
    if (dbUser) {
      dataRef.current = dbUser as NewResumeTemplate;
    }

    if (location.state?.data) {
      docsRef.current = location?.state?.data;
    } else {
      if (dbUser?.dataSource && slug) {
        const matchedSlug = dbUser?.dataSource?.find(
          (item: any) => formatString(item.genTableId) == slug
        );
        setAllData(matchedSlug);
        const sValue = matchedSlug?.key?.toLowerCase();
        TitleProfile.current = formatString(sValue);
        setPTitle(formatString(sValue));
        if (matchedSlug) {
          setValueQuill(matchedSlug?.data);
          const doc = parser.parseFromString(matchedSlug?.data, "text/html");
          if (doc.body.textContent) {
            docsRef.current = doc.body.textContent;
          }
        }
      }
    }
  }, [dbUser]);

  const deletePro = async (id: number | string) => {
    setDeleteDialog(false);
    setAlertDialog(true);
    try {
      const filtered = dbUser?.dataSource?.filter(
        (cletter: any) => cletter.genTableId !== id
      );
      toast.success(`${allData?.key} deleted.`);
      await DataSource(filtered);
      setAlertDialog(false);
      router.push(`/dashboard/profile`);
    } catch (error) {
      console.error(error);
      setAlertDialog(false);
      setDeleteDialog(false);
    }
  };
  const onSubmit = async () => {
    setAILoading(true);
    const dataID = dbUser?.dataSource?.findIndex(
      (item: any) => formatString(item?.genTableId) === slug
    );

    dataRef.current.dataSource[dataID] = allData;
    await DataSource(dataRef.current.dataSource);
    toast.success(
      `${dataRef.current.dataSource[dataID]?.key} successfully updated!`
    );
    setAILoading(false);
  };

  const [deleteDialog, setDeleteDialog] = useState(false);
  const handleDeleteDialog = () => {
    setDeleteDialog(!deleteDialog);
  };
  const [alertDialog, setAlertDialog] = useState(false);
  const handleAlertDialog = () => {
    setAlertDialog(!alertDialog);
  };

  const [AILoading, setAILoading] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:px-8 px-4 gap-4 sm:gap-8 mb-8">
        <Card className="max-w-screen-lg mb-8">
          <CardHeader className="flex justify-between flex-row space-y-0 items-center ">
            <CardTitle className="">Edit Profile</CardTitle>
            <div className="flex gap-2">
              <Button
                className="p-2"
                variant={"outline"}
                onClick={async () => onSubmit && (await onSubmit())}
              >
                {AILoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <FaRegSave className="w-5 h-5" />
                )}
              </Button>
              <AlertDialog
                open={deleteDialog}
                onOpenChange={handleDeleteDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="p-2">
                    {AILoading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <IoTrashOutline className="w-5 h-5" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete{" "}
                      <span className="font-bold text-black">
                        <q>{allData?.key!}</q>
                      </span>{" "}
                      profile from our database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        deletePro && deletePro(allData?.genTableId!)
                      }
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="">
            <form className="gap-4 flex flex-col">
              <div className="grid w-full items-center gap-4">
                <div className="flex gap-2 flex-col sm:flex-row ">
                  <div className="sm:w-1/2">
                    <Label htmlFor="profile">Profile Title</Label>
                    <Input
                      id="profile"
                      placeholder="profile"
                      value={allData?.key}
                      onChange={(e) =>
                        setAllData &&
                        setAllData((prev) => ({
                          ...prev,
                          key: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="sm:w-1/2">
                    <Label htmlFor="portfolio">Website</Label>
                    <Input
                      id="portfolio"
                      placeholder="Website"
                      value={allData?.portfolio}
                      onChange={(e) =>
                        setAllData &&
                        setAllData((prev) => ({
                          ...prev,
                          portfolio: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="grid w-full items-center gap-4">
                <div className="flex gap-2 flex-col sm:flex-row ">
                  <div className="w-full">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      placeholder="linkedin"
                      value={allData?.linkedin}
                      onChange={(e) =>
                        setAllData &&
                        setAllData((prev) => ({
                          ...prev,
                          linkedin: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* <ReactQuill
                theme="snow"
                value={valueQuill}
                onChange={(e) => {
                  setValueQuill && setValueQuill(e);
                  setAllData &&
                    setAllData((prev) => ({
                      ...prev,
                      data: e,
                    }));
                }}
                modules={modules}
                className="!border-none rounded-2xl w-full mt-4"
              /> */}
            </form>

            <AlertDialog open={alertDialog} onOpenChange={handleAlertDialog}>
              <AlertDialogContent>
                {AILoading && (
                  <div className=" right-4 top-4 absolute h-8 w-8 ml-auto">
                    <Loader className="animate-spin h-8 w-8 " />
                  </div>
                )}
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-center flex items-center mb-6 justify-center">
                    <img src="/assets/icons/BigCheckCircle.svg" />
                  </AlertDialogTitle>
                  <div>
                    <div className="text-green-500 text-[22px] text-center mb-2">
                      Action Successful!
                    </div>
                    <div className="text-center mt-4">
                      profile deleted successfully.
                    </div>
                  </div>
                </AlertDialogHeader>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
