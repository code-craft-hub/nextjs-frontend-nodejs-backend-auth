"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import isEmpty from "lodash/isEmpty";
import { TableDataT } from "@/types";
// import { formatDistanceToNow } from "date-fns";
import mammoth from "mammoth";
import { IoIosSearch } from "react-icons/io";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Plus, Loader } from "lucide-react";

import { v4 as uuid } from "uuid";

import * as pdfjs from "pdfjs-dist";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDataSource } from "@/lib/queries";
import { stripeSpecialCharacters, TodayDate } from "@/lib/utils/helpers";
import { useAuth } from "@/hooks/use-auth";

const FormSchema = z.object({
  profileTitle: z
    .string()
    .min(2, "Profile title must be at least 2 characters"),
  profileDescription: z
    .string()
    .min(20, "Profile Description must be at least 20 characters"),
  portfolio: z.string().optional(),
  linkedin: z.string().optional(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const createColumns = (
  sendDeleteNotice: (row: any) => void,
  changeLocation: (changeLink: any) => void
): ColumnDef<TableDataT>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "key",
    header: () => <div className="text-nowrap">TITLE</div>,
    cell: ({ row }: any) => {
      return (
        <div
          className=" line-clamp-1 hover:cursor-pointer "
          onClick={() => changeLocation(row?.original?.genTableId)}
        >
          Profile for {stripeSpecialCharacters(row?.getValue("key"))}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-nowrap">DATE CREATED</div>,
    cell: ({ row }) => {
      try {
        const dateObject = convertDateToWords(
          row?.original?.createdDateTime?.currentDate
        );
        return (
          <div
            className="capitalize text-nowrap hover:cursor-pointer "
            onClick={() => changeLocation(row?.original?.genTableId)}
          >
            {dateObject}
          </div>
        );
      } catch (error) {
        // TODO: Date error to fix later console.error(error);
      }
    },
  },
  // {
  //   accessorKey: "category",
  //   header: () => <div className="text-nowrap">LAST UPDATED</div>,
  //   cell: ({ row }) => {
  //     try {
  //       const now = new Date();
  //       const [hours, minutes, seconds] =
  //         row?.original?.createdDateTime?.currentTime?.split(":")?.map(Number);
  //       const date = new Date(now);
  //       date?.setHours(hours, minutes, seconds);
  //       return (
  //         <div
  //           className="capitalize text-nowrap line-clamp-1 hover:cursor-pointer "
  //           onClick={() => changeLocation(row?.original?.genTableId)}
  //         >
  //           {date && formatDistanceToNow(date, { addSuffix: true })}
  //         </div>
  //       );
  //     } catch (error) {
  //       // TODO: Date error to fix later console.error(error);
  //     }
  //   },
  // },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white ">
              <DropdownMenuItem
                className="hover:cursor-pointer hover:!bg-muted"
                onClick={() => changeLocation(row?.original?.genTableId)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className=" bg-gray-200" />
              <DropdownMenuItem
                className="hover:cursor-pointer hover:!bg-muted"
                onClick={() => changeLocation(row?.original?.genTableId)}
              >
                Preview
              </DropdownMenuItem>
              <DropdownMenuSeparator className=" bg-gray-200" />
              <DropdownMenuItem
                onClick={() => sendDeleteNotice(row?.original)}
                className="hover:!bg-muted"
              >
                <p className="hover:cursor-pointer text-red-500 ">Delete</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export const Profile = () => {
  const { user:dbUser } = useAuth();
  const router = useRouter();
  const [showHiddenContent, setShowHiddenContent] = useState(true);
  const { mutateAsync: DataSource, isPending } = useDataSource();
  const [imgDialog, setImgDialog] = useState(false);
  const handleImgDialog = () => {
    setImgDialog(!imgDialog);
  };
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs";
  }, []);

  const [tableData, setTableData] = useState<TableDataT[]>([
    {
      id: "",
      text: "",
      key: "",
      category: "",
      createdDateTime: {
        currentDate: "",
        currentTime: "",
      },
    },
  ]);

  useEffect(() => {
    if (dbUser) {
      setTableData(dbUser?.dataSource);
    }
  }, [dbUser]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [deleteDialog, setDeleteDialog] = useState(false);
  const handleDeleteDialog = () => {
    setDeleteDialog(!deleteDialog);
  };
  const [alertDialog, setAlertDialog] = useState(false);
  const [DataToDelete, setDataToDelete] = useState<any>();
  const handleAlertDialog = () => {
    setAlertDialog(!alertDialog);
  };

  const sendDeleteNotice = async (row: any) => {
    setDataToDelete(row);
    setDeleteDialog(true);
  };

  const deletePro = async () => {
    setDeleteDialog(false);
    if (!DataToDelete) return;
    setAlertDialog(true);
    try {
      const filtered = tableData.filter(
        (tableData) => tableData.genTableId !== DataToDelete.genTableId
      );
      await DataSource(filtered);
      setTableData(filtered);
      setAlertDialog(false);
      toast.success(`${DataToDelete?.key} deleted.`);
    } catch (error) {
      console.error(error);
    } finally {
      setAlertDialog(false);
      setDeleteDialog(false);
    }
  };

  const changeLocation = async (changeLink: any) => {
    return router.push(`/dashboard/profile/${changeLink}`);
  };

  const columns = createColumns(sendDeleteNotice, changeLocation);

  const table = useReactTable({
    data: tableData || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: { pagination: { pageSize: 5 } },
  });
  // const fileInputRef = useRef<HTMLInputElement | null>(null);
  // const handleFormClick = () => {
  //   if (fileInputRef.current) {
  //     fileInputRef.current.click();
  //   }
  // };

  const [dragOver, setDragOver] = useState(false);
  const handleDragOver = (e: any) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // const userAgent = navigator.userAgent;
  // const iosDevice = /iPad|iPhone|iPod/.test(userAgent);

  const handleDrop = async (e: any) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;

    let fileName = file.name;
    if (fileName.length >= 12) {
      let splitName = fileName.split(".");
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    if (file.type === "application/pdf") {
      const pdfText = await extractPdfText(file);
      setShowHiddenContent(false);
      setTimeout(() => {
        setValue("profileDescription", pdfText);
      }, 900);
      toast.success(`${fileName} uploaded!`);
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword"
    ) {
      const wordText = await extractWordText(file);
      setShowHiddenContent(false);
      setTimeout(() => {
        setValue("profileDescription", wordText);
      }, 900);
      toast.success(`${fileName} uploaded!`);
    } else {
      return toast.error("Unsupported file type");
    }
  };
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let fileName = file.name;
    if (fileName.length >= 12) {
      let splitName = fileName.split(".");
      fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
    }
    if (file.type === "application/pdf") {
      const pdfText = await extractPdfText(file);
      setShowHiddenContent(false);
      setTimeout(() => {
        setValue("profileDescription", pdfText);
      }, 900);
      toast.success(`${fileName} uploaded successfully.`);
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword"
    ) {
      const wordText = await extractWordText(file);
      setShowHiddenContent(false);
      setTimeout(() => {
        setValue("profileDescription", wordText);
      }, 900);
      toast.success(`${fileName} uploaded successfully.`);
    } else {
      return toast.error("Unsupported file type");
    }
  };

  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      text += strings.join(" ");
    }

    return text;
  };

  const extractWordText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
  };
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });
  const onSubmit = async (data: FormSchemaType) => {
    const dataPro = data.profileTitle;
    const dataDes = data.profileDescription;
    const uID = uuid().slice(0, 11).replace(/-/g, "");
    if (dataDes) {
      // const userInput = dataDes.substring(0, 1500);
      // const userInput = dataDes;
      const profileDataSrc = {
        key: dataPro,
        data: dataDes,
        linkedin: data.linkedin || "",
        portfolio: data.portfolio || "",
        category: "Profile",
        profileID: dbUser?.dataSource?.length + 1,
        genTableId: uID + (dbUser?.dataSource?.length + 1) + "p",
        imgIcon: "/assets/undraw/database.png",
        createdDateTime: TodayDate(),
        statue: "created",
      };
      setTableData([profileDataSrc, ...tableData]);
      dbUser?.dataSource?.unshift(profileDataSrc);
      toast.success(`successfully saved.`);
      setImgDialog(false);
      await DataSource(dbUser?.dataSource);
      setTimeout(() => {
        reset();
        setShowHiddenContent(true);
      }, 1000);
    }
  };

  // useEffect(() => {
  //   if (data.length <= 5) {
  //     table.setPageSize(data.length);
  //   } else {
  //     table.setPageSize(5);
  //   }
  // }, [data.length, table]);

  return (
    <>
      <div className="flex flex-col sm:px-8 px-4 gap-4 sm:gap-8 ">
        <div className="">
          <span className="text-3xl font-bold break-all line-clamp-1">
            Hello {dbUser?.firstName || dbUser?.lastName}!
          </span>
          <p className="sm:text-xl ">Setup Your Profile</p>
        </div>
        <div className="flex justify-between gap-2 items-center">
          <div className="flex items-center w-full gap-2 border-2 rounded-md px-2 max-w-[300px]">
            <IoIosSearch />
            <input
              className="border-1 outline-none ring-0 focus:border-none bg-blind focus:outline-none focus:ring-none focus:ring-offset-0 flex-1 h-10 py-4  w-full"
              placeholder="Search..."
              value={(table.getColumn("key")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("key")?.setFilterValue(event.target.value)
              }
            />
          </div>
          <Dialog onOpenChange={handleImgDialog} open={imgDialog}>
            <DialogTrigger asChild>
              <Button className="ml-2 xss:ml-auto text-white bg-[var(--buttonColor)]">
                <Plus className="xs:mr-2 h-4 w-4 " />{" "}
                <span className="hidden xs:block text-white">
                  Create Profile
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[700px] bg-white overflow-hidden p-">
              <DialogHeader>
                <DialogTitle className="text-center">
                  {" "}
                  Create Profile
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className=" overflow-hidden"
              >
                <div className="grid items-start gap-4 overflow-hidden">
                  <div className="p-2  overflow-hidden">
                    <div className="grid gap-4 py-4">
                      <div className="flex flex-col gap-4">
                        <Label htmlFor="name" className="">
                          Profile Name
                        </Label>
                        <Input
                          id="name"
                          {...register("profileTitle")}
                          className="col-span-3"
                        />
                        {errors.profileTitle && (
                          <p className="text-red-500">
                            {errors.profileTitle.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <AnimatePresence mode="wait">
                      {showHiddenContent && (
                        <motion.div
                          key="showHiddenContent"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          layout
                        >
                          <div
                            className={`${
                              dragOver
                                ? "border-solid border-blue-500 bg-white"
                                : "border-dashed"
                            } border-2  flex-col flex items-center rounded-md justify-center  mb-3 bg-[#F7F7F7] hover:cursor-pointer relative`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            <input
                              title="file"
                              className="block absolute h-36 w-full text-sm text-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-transparent file:text-transparent hover:file:bg-transparent cursor-pointer"
                              type="file"
                              name="file"
                              onChange={handleFileChange}
                            />
                            <div className="w-full items-center justify-center flex flex-col p-8">
                              <img
                                src="/assets/icons/upload.svg"
                                className={`${dragOver && "animate-bounce"}`}
                              />
                              <p className="text-black">Upload your CV here</p>
                              {dragOver ? (
                                "Release file to upload"
                              ) : (
                                <div className="text-gray-400">
                                  Drag and drop or{" "}
                                  <span className="text-blue-700">browser</span>{" "}
                                  files here
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.div
                      layout
                      transition={{ delay: 0.5 }}
                      style={{
                        height: showHiddenContent ? "80px" : "150px",
                        transition: "height 0.5s ease-in-out",
                      }}
                    >
                      <motion.textarea
                        layout
                        transition={{ delay: 0.8 }}
                        rows={showHiddenContent ? 3 : 7}
                        placeholder={
                          showHiddenContent
                            ? "Tell us a little bit about yourself"
                            : ""
                        }
                        className="flex max-h-[311px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-accent dark:ring-offset-accent dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 resize-none"
                        {...register("profileDescription", {
                          onChange: (e) => {
                            if (e.target.value == "" || e.target.value == " ") {
                              setShowHiddenContent(true);
                            } else {
                              setShowHiddenContent(false);
                            }
                          },
                        })}
                      ></motion.textarea>
                    </motion.div>

                    {errors.profileDescription && (
                      <p className="text-red-500">
                        {errors.profileDescription.message}
                      </p>
                    )}
                    <div className="flex flex-col md:flex-row gap-2 ">
                      <div className="w-full">
                        <label
                          htmlFor="linkedin"
                          className="block text-sm font-medium text-gray-700 mb-2 mt-4"
                        >
                          LinkedIn Profile{" "}
                          <span className="text-gray-400">(optional)</span>
                        </label>
                        <Input
                          type="text"
                          id="linkedin"
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                            errors.linkedin ? "border-red-500" : ""
                          }`}
                          placeholder="Enter link to your LinkedIn profile"
                          {...register("linkedin")}
                        />
                        {errors.linkedin && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.linkedin.message}
                          </p>
                        )}
                      </div>

                      <div className="w-full">
                        <label
                          htmlFor="portfolio"
                          className="block text-sm font-medium text-gray-700 mb-2  mt-4"
                        >
                          Portfolio{" "}
                          <span className="text-gray-400">(optional)</span>
                        </label>
                        <Input
                          type="text"
                          id="portfolio"
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                            errors.portfolio ? "border-red-500" : ""
                          }`}
                          placeholder="Enter link to your portfolio"
                          {...register("portfolio")}
                        />
                        {errors.portfolio && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.portfolio.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center items-center my-4 pt-4">
                  <Button type="submit" disabled={isPending} className="px-8">
                    Save and Continue{" "}
                    {isPending && (
                      <Loader className="animate-spin h-6 w-6 ml-2" />
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className=" border-t border-b max-sm:mt-4">
          <AlertDialog open={deleteDialog} onOpenChange={handleDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete{" "}
                  <span className="text-red-500">
                    <q>
                      {stripeSpecialCharacters(
                        DataToDelete?.key ? DataToDelete?.key : ""
                      )}
                    </q>
                  </span>{" "}
                  profile from our database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deletePro}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={alertDialog} onOpenChange={handleAlertDialog}>
            <AlertDialogContent>
              {isPending && (
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
          <div className="grid grid-cols-1 border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => {
                  return (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableHeader>
              <TableBody>
                {!isEmpty(dbUser?.dataSource) ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-[10vh] text-center"
                    >
                      <div className="w-full  ">
                        <div className="flex flex-col h-full w-full  justify-center items-center gap-4">
                          <img src="/assets/icons/empty.svg" alt="" />
                          No Profiles.
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {dbUser?.dataSource?.length > 0 && (
          <div className="flex items-center justify-end space-x-2 sm:-mt-4 mb-9">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div>
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
              )}

              <span>
                Page{" "}
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </strong>
              </span>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
