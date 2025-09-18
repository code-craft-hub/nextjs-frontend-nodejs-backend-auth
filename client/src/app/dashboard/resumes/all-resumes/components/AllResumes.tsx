"use client";
import { useState, useEffect, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import isEmpty from "lodash/isEmpty";
import { TableDataT } from "@/types";
import { z } from "zod";
import { v4 as uuid } from "uuid";
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
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCurrentUser, UseUpdateCV } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { stripeSpecialCharacters } from "@/lib/utils/helpers";
import InsufficientCreditsModal from "@/components/shared/InsufficientCreditsModal";
import { useAuth } from "@/hooks/use-auth";

const FormSchema = z.object({
  profileDescription: z
    .string()
    .min(10, "Job Description must be at least 10 characters"),
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
          onClick={() => changeLocation(row?.original?.genTableId)}
          className="line-clamp-1 hover:cursor-pointer "
        >
          Resume for {stripeSpecialCharacters(row?.getValue("key"))}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-nowrap">DATE CREATED</div>,
    cell: ({ row }) => {
      const dateObject = convertDateToWords(
        row.original.createdDateTime.currentDate
      );
      return (
        <div
          onClick={() => changeLocation(row?.original?.genTableId)}
          className="capitalize text-nowrap hover:cursor-pointer"
        >
          {dateObject}
        </div>
      );
    },
  },
  // {
  //   accessorKey: "category",
  //   header: () => <div className="text-nowrap">LAST UPDATED</div>,
  //   cell: ({ row }) => {
  //     const now = new Date();

  //     if (
  //       row.original.createdDateTime &&
  //       typeof row.original.createdDateTime.currentTime === "string"
  //     ) {
  //       const [hours, minutes, seconds] =
  //         row.original.createdDateTime.currentTime.split(":").map(Number);

  //       if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
  //         const date = new Date(now);
  //         date.setHours(hours, minutes, seconds);
  //         return (
  //           <div
  //             onClick={() => changeLocation(row?.original?.genTableId)}
  //             className="capitalize text-nowrap hover:cursor-pointer"
  //           >
  //             {formatDistanceToNow(date, { addSuffix: true })}
  //           </div>
  //         );
  //       }
  //     }
  //     return <div className="capitalize">Invalid time</div>;
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
                <p className="hover:cursor-pointer text-red-500">Delete</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function AllResume() {
  const { user:dbUser } = useAuth();
  const [creditAlert, setCreditAlert] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const handleDeleteDialog = () => {
    setDeleteDialog(!deleteDialog);
  };
  const [alertDialog, setAlertDialog] = useState(false);
  const handleAlertDialog = () => {
    setAlertDialog(!alertDialog);
  };
  const { mutateAsync: CVMutuation, isPending } = UseUpdateCV();

  const [DataToDelete, setDataToDelete] = useState<any>();

  const [selectedValue, setSelectedValue] = useState<any>();
  const selectedProfileRef = useRef<String>("");
  const dataSrcRef = useRef<any>(undefined);
  const [imgDialog, setImgDialog] = useState(false);
  const handleImgDialog = () => {
    setImgDialog(!imgDialog);
  };
  const parser = new DOMParser();

  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
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
      setTableData(dbUser?.CV);
    }
  }, [dbUser]);

  useEffect(() => {
    if (userData) {
      const doc = parser.parseFromString(
        dbUser?.dataSource[0]?.data,
        "text/html"
      );
      const userValue = doc?.body?.textContent!;
      selectedProfileRef.current = userValue.substring(0, 2000);
      dataSrcRef.current = dbUser?.dataSource[0];
      setSelectedValue({
        title: dbUser?.dataSource[0]?.key,
        link: dbUser?.dataSource[0]?.genTableId,
      });
    }
  }, [userData]);

  const changeLocation = async (changeLink: any) => {
    return router.push(`/dashboard/resume/${changeLink}`, { replace: true });
  };
  const sendDeleteNotice = async (row: any) => {
    setDataToDelete(row);
    setDeleteDialog(true);
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
  });

  const deleteMany = table?.getSelectedRowModel().rows.length;
  const deletePro = async () => {
    let idsToDelete: string[];
    if (deleteMany) {
      const selectedRows = table?.getSelectedRowModel()?.rows;
      idsToDelete = selectedRows?.map((row) => row?.original?.genTableId!);
    }
    setDeleteDialog(false);
    if (!DataToDelete) return;
    setAlertDialog(true);

    try {
      let filtered;
      if (deleteMany) {
        filtered = tableData.filter(
          (tableData) => !idsToDelete.includes(tableData?.genTableId!)
        );
      } else {
        filtered = tableData.filter(
          (tableData) => tableData.genTableId !== DataToDelete.genTableId
        );
      }
      await CVMutuation(filtered);
      setTableData(filtered);
      setAlertDialog(false);
      toast.success(`${DataToDelete?.key} deleted.`);
    } catch (error) {
      console.error(error);
      setAlertDialog(false);
    } finally {
      setAlertDialog(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (data: FormSchemaType) => {
    localStorage.removeItem("hasResumeAPICalled");
    if (dbUser?.credit === 0 || dbUser?.credit <= 0) {
      setImgDialog(false);
      setCreditAlert(true);
      toast.error("You've used up your create. Top up here.");
      setTimeout(() => {
        router.push("/dashboard/credit", { replace: true });
      }, 4000);
      return;
    }
    const regex = /^(.)\1*$/;

    if (regex.test(getValues("profileDescription")))
      return toast.error(
        "characters entered can't be consecutive. E.g ssssssssssssssss"
      );

    let dataSrc = selectedProfileRef.current;
    let dataSrcObject = dataSrcRef.current;
    if (
      dataSrc == undefined ||
      dataSrc == "undefined" ||
      dataSrc == "" ||
      dataSrc == " "
    ) {
      return toast.error(
        "Please go to the profile page, and comeback to this page."
      );
    }
    const jobDesc = data.profileDescription.substring(0, 2000);
    setImgDialog(false);
    const resumeTitle = selectedValue?.title;
    const docID = uuid();
    reset();
    router.push(`/dashboard/resume/${docID}`, {
      state: { jobDesc, dataSrc, resumeTitle, dataSrcObject, docID },
      replace: true,
    });
  };

  return (
    <>
      <div className="flex flex-col sm:px-8 px-4 gap-4 sm:gap-8 ">
        <AlertDialog open={deleteDialog} onOpenChange={handleDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete{" "}
                <span className="font-bold text-black">
                  <q>
                    {stripeSpecialCharacters(
                      DataToDelete?.key ? DataToDelete?.key : ""
                    )}
                  </q>
                </span>{" "}
                resume from our database.
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
              <AlertDialogTitle className="text-center flex items-center my-6 justify-center">
                <img src="/assets/icons/BigCheckCircle.svg" />
              </AlertDialogTitle>
              <div>
                <div className="text-green-500 text-[22px] text-center mb-2">
                  {deleteMany
                    ? `${deleteMany} will be deleted`
                    : "Action Successful!"}
                  {/* Action Successful! */}
                </div>
                <div className="text-center mt-4">
                  {deleteMany
                    ? `Deleting ${deleteMany} resumes`
                    : "resume deleted successfully."}
                </div>
              </div>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
        <div className="">
          <span className="text-3xl font-bold break-all line-clamp-1">
            Hello {dbUser?.firstName || dbUser?.lastName}!
          </span>
          <p className="sm:text-xl ">Create your cover letter</p>
        </div>
        <div className="flex justify-between gap-2 items-center">
          <div className="flex items-center w-full gap-2 border-2 rounded-md px-2 max-w-[300px]">
            <IoIosSearch />
            <input
              className="border-1 outline-none ring-0 focus:border-none focus:outline-none focus:ring-none focus:ring-offset-0 bg-blind flex-1 h-10 py-4  w-full"
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
                  Create Resume
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[600px] bg-white overflow-hidden p-">
              <DialogHeader>
                <DialogTitle className="text-center">
                  Create Resume | CV
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
                        <div>
                          <Label htmlFor="name" className="">
                            Profile
                          </Label>
                          <Select
                            value={selectedValue?.link}
                            onValueChange={(value) => {
                              const index = dbUser?.dataSource?.findIndex(
                                (item: any) => item?.genTableId == value
                              );

                              const doc = parser.parseFromString(
                                dbUser?.dataSource[index]?.data,
                                "text/html"
                              );
                              const userValue = doc?.body?.textContent!;
                              selectedProfileRef.current = userValue.substring(
                                0,
                                2000
                              );
                              dataSrcRef.current = dbUser?.dataSource[index];
                              setSelectedValue({
                                title: dbUser?.dataSource[index]?.key,
                                link: dbUser?.dataSource[index]?.genTableId,
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a Profile" />
                            </SelectTrigger>
                            <SelectContent className="bg-white w-full">
                              <SelectGroup>
                                <SelectLabel>My Profiles</SelectLabel>
                                {dbUser?.dataSource?.map(
                                  (item: any, index: number) => {
                                    return (
                                      <SelectItem
                                        key={index}
                                        value={item?.genTableId}
                                      >
                                        {stripeSpecialCharacters(item.key)}
                                      </SelectItem>
                                    );
                                  }
                                )}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="name" className="pb-4">
                        Job Description
                      </Label>
                      <textarea
                        rows={10}
                        placeholder="Enter your job description here."
                        className="flex max-h-[311px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-accent dark:ring-offset-accent dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 resize-none"
                        {...register("profileDescription")}
                      ></textarea>
                    </div>

                    {errors.profileDescription && (
                      <p className="text-red-500 pt-2">
                        {errors.profileDescription.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-center items-center my-4 pt-4">
                  <Button type="submit" className="px-8">
                    Continue
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className=" border-t border-b max-sm:mt-4 grid grid-cols-1">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
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
              ))}
            </TableHeader>
            <TableBody>
              {!isEmpty(userData?.CV) ? (
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
                        No Resumes.
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {userData?.CV?.length > 0 && (
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
      {creditAlert ? <InsufficientCreditsModal /> : ""}
    </>
  );
}
