"use client"
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { IoTrashOutline } from "react-icons/io5";
import { FaRegSave } from "react-icons/fa";
import DeleteAlert from "./DeleteAlert";
import { LetterProps } from "@/types";
import { modules } from "@/constants/jobs-data";

export const LetterEditComponent = ({
  allData,
  setAllData,
  AILoading,
  onSubmit,
  setValueQuill,
  valueQuill,
  isPending,
  deletePro,
  deleteDialog,
  handleAlertDialog,
  alertDialog,
  handleDeleteDialog,
}: LetterProps) => {
  return (
    <Card className="max-w-screen-lg mb-8">
      <CardHeader className="flex justify-between flex-row space-y-0 items-center ">
        <CardTitle className="">Edit Cover Letter</CardTitle>
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
          <DeleteAlert
            isPending={isPending}
            deletePro={deletePro}
            documentType={"cover letter"}
            allData={allData}
            handleAlertDialog={handleAlertDialog}
            alertDialog={alertDialog}
            handleDeleteDialog={handleDeleteDialog}
            deleteDialog={deleteDialog}
          >
            <Button variant="destructive" className="p-2">
              {AILoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <IoTrashOutline className="w-5 h-5" />
              )}
            </Button>
          </DeleteAlert>
        </div>
      </CardHeader>
      <CardContent className="">
        <form className="gap-4 flex flex-col">
          <div className="grid w-full items-center gap-4">
            <div className="flex gap-2 flex-col sm:flex-row ">
              <div className="sm:w-1/2">
                <Label htmlFor="FirstName">FirstName</Label>
                <Input
                  id="FirstName"
                  placeholder="FirstName"
                  value={allData?.firstName}
                  onChange={(e) =>
                    setAllData &&
                    setAllData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="sm:w-1/2">
                <Label htmlFor="LastName">LastName</Label>
                <Input
                  id="LastName"
                  placeholder="Last Name"
                  value={allData?.lastName}
                  onChange={(e) =>
                    setAllData &&
                    setAllData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="grid w-full items-center gap-4">
            <div className="flex gap-2 flex-col sm:flex-row ">
              <div className="sm:w-1/2">
                <Label htmlFor="Email">Email</Label>
                <Input
                  id="Email"
                  placeholder="Email"
                  value={allData?.email}
                  onChange={(e) =>
                    setAllData &&
                    setAllData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="sm:w-1/2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+1 932 393 3232"
                  value={allData?.phoneNumber}
                  onChange={(e) =>
                    setAllData &&
                    setAllData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="grid w-full items-center gap-4">
            <div className="flex gap-2 flex-col sm:flex-row ">
              <div className="sm:w-1/2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Lagos"
                  value={allData?.state}
                  onChange={(e) =>
                    setAllData &&
                    setAllData((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="sm:w-1/2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Nigeria"
                  value={allData?.country}
                  onChange={(e) =>
                    setAllData &&
                    setAllData((prev) => ({
                      ...prev,
                      country: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="grid w-full items-center gap-4">
            <div className="flex gap-2 flex-col sm:flex-row ">
              <div className="sm:w-1/2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Job Title"
                  value={allData?.key!}
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
                <Label htmlFor="date">Date of Application</Label>
                <Input
                  id="date"
                  type="date"
                  placeholder="15 Aug 2022"
                  value={allData?.createdDateTime?.currentDate}
                  onChange={(e) =>
                    setAllData &&
                    setAllData((prev) => ({
                      ...prev,
                      createdDateTime: {
                        ...prev?.createdDateTime,
                        currentDate: e.target.value, // TODO LOOK INTO THIS AND MAKE SURE THAT IT WORKS.
                      },
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="grid w-full items-center gap-4">
            <div className="flex gap-2 flex-col sm:flex-row ">
              <div className="sm:w-1/2">
                <Label htmlFor="saluation">Salutation </Label>
                <Input
                  id="saluation"
                  placeholder="Warm regards | Sincerely"
                  value={allData?.salutation}
                  onChange={(e) =>
                    setAllData &&
                    setAllData((prev) => ({
                      ...prev,
                      salutation: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="sm:w-1/2">
                <Label htmlFor="closing">Closing</Label>
                <Input
                  id="closing"
                  placeholder="Sincerely"
                  value={allData?.closing}
                  onChange={(e) =>
                    setAllData &&
                    setAllData((prev) => ({
                      ...prev,
                      closing: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="w-full">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="2207 Beach Avenue, Los Angeles"
              value={allData?.address}
              onChange={(e) =>
                setAllData &&
                setAllData((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
            />
          </div>

          <ReactQuill
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
          />
        </form>
      </CardContent>
    </Card>
  );
};
