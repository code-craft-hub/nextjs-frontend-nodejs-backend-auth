import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Calendar,
  DollarSign,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
export const jobsData = [
  {
    id: 1,
    title: "Technical Support Specialist",
    company: "Google",
    companyLogo: "bg-white border-2 border-gray-200",
    companyIcon: "text-blue-500 font-bold text-lg",
    companyText: "G",
    location: "Lagos",
    salary: "$15K-$20K",
    postedTime: "2 days ago",
    matchPercentage: "100 match",
    jobType: "Full Time",
    isBookmarked: false,
    isFilled: false,
  },
  {
    id: 2,
    title: "Technical Support Specialist",
    company: "YouTube",
    companyLogo: "bg-red-600",
    companyIcon: "text-white",
    companyText: "▶",
    location: "Lagos",
    salary: "$15K-$20K",
    postedTime: "2 days ago",
    matchPercentage: "100 match",
    jobType: "Full Time",
    isBookmarked: false,
    isFilled: false,
  },
  {
    id: 3,
    title: "Technical Support Specialist",
    company: "Reddit",
    companyLogo: "bg-orange-500",
    companyIcon: "text-white",
    companyText: "R",
    location: "Lagos",
    salary: "$15K-$20K",
    postedTime: "2 days ago",
    matchPercentage: "100 match",
    jobType: "Full Time",
    isBookmarked: true,
    isFilled: false,
  },
  {
    id: 4,
    title: "Technical Support Specialist",
    company: "Discord",
    companyLogo: "bg-blue-600",
    companyIcon: "text-white",
    companyText: "♔",
    location: "Lagos",
    salary: "$15K-$20K",
    postedTime: "2 days ago",
    matchPercentage: "100 match",
    jobType: "Full Time",
    isBookmarked: false,
    isFilled: false,
  },
  {
    id: 5,
    title: "Technical Support Specialist",
    company: "Instagram",
    companyLogo: "bg-gradient-to-br from-purple-600 to-pink-500",
    companyIcon: "text-white",
    companyText: "📷",
    location: "Lagos",
    salary: "$15K-$20K",
    postedTime: "2 days ago",
    matchPercentage: "100 match",
    jobType: "Full Time",
    isBookmarked: true,
    isFilled: false,
  },
  {
    id: 6,
    title: "Technical Support Specialist",
    company: "Slack",
    companyLogo: "bg-white border-2 border-gray-200",
    companyIcon: "text-red-500",
    companyText: "#",
    location: "Lagos",
    salary: "$15K-$20K",
    postedTime: "2 days ago",
    matchPercentage: "100 match",
    jobType: "Full Time",
    isBookmarked: false,
    isFilled: true,
  },
];
export type IJobType = {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  companyIcon: string;
  companyText: string;
  location: string;
  salary: string;
  postedTime: string;
  matchPercentage: string;
  jobType: string;
  isBookmarked: boolean;
  isFilled: boolean;
};
export const overviewColumns: ColumnDef<IJobType>[] = [
  {
    accessorKey: "company",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          company
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className=" flex items-center justify-center">
        <img src={row.original.companyText} alt={row.original.companyText} />
      </div>
    ),
  },

  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="capitalize">
        <div className="flex gap-4 items-center">
          <div className="font-medium text-xs">{row.getValue("title")}</div>
          <div className="bg-blue-50 rounde text-blue-600">
            <span className="text-2xs">{row.original.jobType}</span>
          </div>
        </div>
        <div className="flex gap-x-4 mt-1">
          <p className="flex gap-1 text-gray-400">
            <MapPin className="size-3" />
            <span className="text-2xs"> {row.original.location}</span>
          </p>
          <p className="flex gap-1 text-gray-400">
            <DollarSign className="size-3" />
            <span className="text-2xs"> {row.original.salary}</span>
          </p>
          <p className="flex gap-1 text-gray-400">
            <Calendar className="size-3" />
            <span className="text-2xs">{row.original.postedTime}</span>
          </p>
          <p className="text-2xs text-green-400">
            %{row.original.matchPercentage}
          </p>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "isBookmarked",
    header: () => <div className=""></div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          {row.original.isBookmarked ? (
            <div>
              <FaBookmark className="size-4" />
            </div>
          ) : (
            <FaRegBookmark className="size-4 text-gray-400" />
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button variant={'button'} onClick={() => console.log(row)}>Apply Now</Button>
        </div>
      );
    },
  },
];
