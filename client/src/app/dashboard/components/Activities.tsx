import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiMoreHorizontal } from "react-icons/fi";
import { formatDistanceToNowStrict } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isEmpty } from "lodash";
import { stripeSpecialCharacters } from "@/lib/utils/helpers";
import { useRouter } from "next/navigation";
type docT = {
  imgIcon: string;
  createdAt: string;
  key: string;
  category: string;
  genTableId: string;
};
const Activities = ({
  allDocuments,
  isLoading,
}: {
  allDocuments: docT[];
  isLoading: boolean;
}) => {
  const router = useRouter();
  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row px-2 sm:px-6">
          <Skeleton className="w-64 h-14" />
        </div>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 space-y-4">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="flex gap-4 items-center">
              <Skeleton className="size-16 rounded-full shrink-0" />
              <Skeleton className="w-full h-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-white rounded-xl  p-4 sm:p-8  overflow-x-hidden w-full">
      <p className="mb-1 font-bold text-[20px] max-sm:text-center">
        Recent Activities
      </p>
      {allDocuments
        ?.slice(0, 5)
        ?.map(
          (
            { imgIcon, createdAt, key, category, genTableId },
            index: number
          ) => {
            return (
              <div
                key={index}
                className="flex justify-between items-start py-1"
              >
                <div className="w-16 h-16 items-start justify-start flex">
                  <img src={imgIcon} alt="" className="w-16  h-16" />
                </div>
                <div className="pl-4 pt-2 flex flex-col w-full items-center justify-center">
                  <div className="w-full h-full">
                    <p className=" text-sm break-all line-clamp-1 font-semibold">
                      {stripeSpecialCharacters(key)}
                    </p>
                    <p className="text-left text-sm break-all line-clamp-1">
                      updated {formatDistanceToNowStrict(new Date(createdAt))}
                    </p>
                  </div>
                </div>
                <div className="justify-center items-center flex pt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button title="click"className="hover:cursor-pointer hover:scale-125 duration-1000 transition-all">
                        <FiMoreHorizontal />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white ">
                      <DropdownMenuItem
                        className="hover:cursor-pointer hover:!bg-muted"
                        onClick={() => {
                          if (category === "resume") {
                            router.push(
                              `/dashboard/${category}/${genTableId}/edit`
                            );
                          } else {
                            router.push(`/dashboard/${category}/${genTableId}`);
                          }
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className=" bg-gray-200" />
                      <DropdownMenuItem
                        className="hover:cursor-pointer hover:!bg-muted"
                        onClick={() => {
                          router.push(`/dashboard/${category}/${genTableId}`);
                        }}
                      >
                        Preview
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          }
        )}

      {isEmpty(allDocuments) && (
        <div>
          <div className="flex justify-center mt-4">
            <div className="size-44">
              <img src="/assets/undraw/empty.svg" alt="" />
            </div>
          </div>
          <h1 className="my-4 text-gray-300 text-center text-[11px] leading-3 max-w-64 mx-auto">
            You don't have any recent activities yet.
          </h1>
        </div>
      )}
    </Card>
  );
};

export default Activities;
