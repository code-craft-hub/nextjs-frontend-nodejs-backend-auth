"use client";
import { MdLocationSearching } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { Separator } from "@/components/ui/separator";
import { FaChevronDown } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
// import { getJobsInDB } from "@/lib/react-query/queries";

import { useCallback, useMemo, useState } from "react";
import { debounce } from "lodash";
import { useInfiniteScroll } from "@/hooks/collection-pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { safeFormatDistanceToNow } from "@/lib/utils/helpers";

export const JobListings = () => {
  const {
    items: allJobs,
    loading,
    hasMore,
    loadMoreRef,
  } = useInfiniteScroll({
    collectionName: "jobs",
    pageSize: 5,
  });
  const searchParams = useSearchParams();
  const jobtype = searchParams.get("jobtype");
  const search = searchParams.get("search");
  const location = searchParams.get("location");
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobType, setJobType] = useState("");

  const handleSearch = useCallback(
    debounce((query: string) => {
      router.push(`/dashboard/job-listings?search=${query}`);
    }, 600),
    []
  );

  const filtededItems = useMemo(() => {
    if (!allJobs) return [];

    if (search) {
      return allJobs.filter((item) =>
        item.title?.toLowerCase().includes(search?.toLowerCase())
      );
    }
    if (location) {
      return allJobs.filter((item) => {
        return item.location?.toLowerCase().includes(location?.toLowerCase());
      });
    }
    if (jobtype) {
      return allJobs.filter((item) => {
        if (jobtype?.toLowerCase() === "sponsorships") {
          return item.jobType?.toLowerCase().includes(jobtype?.toLowerCase());
        } else {
          return !item.jobType;
        }
      });
    }
    return allJobs;
  }, [jobtype, search, location, allJobs]);
  const [_expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(
    new Set()
  );

  const toggleDescription = (index: number) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <>
     
      <div className="space-y-4 sm:space-y-8 p-4 sm:p-8  max-w-screen-xl w-full  mx-auto">
        <div className="space-y-4 sm:space-y-8">
          <h1 className="font-bold text-center text-2xl md:text-4xl">
            Find the <span className="text-blue-500">Perfect</span> Job
          </h1>
          <Card className="bg-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 py-4 max-w-screen-md mx-auto rounded-xl items-center px-2 ">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Job title / company name"
                className="w-full bg-transparent focus:outline-none pl-8"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  handleSearch(e.target.value);
                }}
              />
              <img
                src="/assets/icons/search.svg"
                className="absolute top-1/2 -translate-y-1/2 left-2 size-4"
                alt=""
              />
            </div>
            <div className="flex gap-1 items-center">
              <div className="">
                <Separator
                  className="h-8 w-[1px] bg-gray-400 mx-2"
                  orientation="vertical"
                />
              </div>
              <IoLocationOutline className="shrink-0 text-black/50" />
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full text-start text-black/50 border-none focus:border-none focus:outline-none">
                  Location
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Job Locations</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={jobLocation}
                    onValueChange={(value) => {
                      router.push(`/job-listings?location=${value}`);
                      setJobLocation(value);
                    }}
                  >
                    <DropdownMenuRadioItem value="united states">
                      United states
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="united kingdom">
                      United Kingdom
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-1 items-center">
              <div className="">
                <Separator
                  className="h-8 max-md:hidden w-[0.5px] bg-gray-400 mx-2"
                  orientation="vertical"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full focus:outline-none">
                  <div className="flex gap-2 items-center w-full text-black/50">
                    <MdLocationSearching />
                    <span className="text-black/50">Remote</span>
                    <FaChevronDown />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Job Types</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={jobType}
                    onValueChange={(value) => {
                      router.push(`/job-listings?jobtype=${value}`);
                      setJobType(value);
                    }}
                  >
                    <DropdownMenuRadioItem value="remote">
                      Remote
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="sponsorships">
                      Sponsorship
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex mr-2">
              <Button className="w-full" disabled={inputValue === ""}>
                Search
              </Button>
            </div>
          </Card>
          <div
            className={`${
              false ? "grid grid-cols-2" : "flex flex-col"
            } gap-4 sm:gap-8 transition-all duration-1000 pt-8`}
          >
            {filtededItems?.map((item, index) => (
              <Card
                key={index}
                className="border w-full rounded-lg p-4 sm:p-8 space-y-4"
              >
                <div className="flex justify-between max-xs:flex-wrap  gap-4">
                  <div className="flex gap-2">
                    <div className="size-12 overflow-hidden rounded-md shrink-0">
                      <img
                        src={item.companyLogo ?? "/assets/icons/cver.svg"}
                        className="size-full"
                        alt=""
                      />
                    </div>
                    <div className="">
                      <h1 className="font-bold ">{item.title}</h1>
                      <p className="-mt-1 text-sm">{item.companyName}</p>
                    </div>
                  </div>
                  <div>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button className="max-xs:w-full shrink-0">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Apply Now
                        </a>
                      </Button>
                      <Button
                        className="w-full "
                        variant={"outline"}
                        onClick={() => {
                          router.push(`/dashboard/job-listings/${item.id}`,
                            // TODO: fix this
                        //     {
                        //     state: { job: item },
                        //   }
                        );
                        }}
                      >
                        More
                      </Button>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => toggleDescription(index)}
                  className="cursor-pointer"
                >
                  <div className="line-clamp-3">{item?.descriptionText}</div>

                  <span
                    onClick={() => {
                      router.push(`/dashboard/job-listings/${item.id}`
                        // TODO: fix this
                    //     , {
                    //     state: { job: item },
                    //   }
                    );
                    }}
                    className="text-blue-500 text-sm cursor-pointer"
                  >
                    Read More
                  </span>
                </div>
                <div className="text-gray-400 text-sm">
                  Posted {safeFormatDistanceToNow(item.postedAt)}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="border rounded-lg p- w-fit px-3 text-[11px]">
                    {!!item.jobType ? item.jobType : "Remote"}{" "}
                  </div>
                  <div className="border rounded-lg p- w-fit px-3 text-[11px]">
                    {item.location !== "" ? item.location : "Not specified"}
                  </div>
                </div>
                <div className="text-green-900 text-sm">Profile match: 85%</div>
              </Card>
            ))}
          </div>

          <div
            ref={loadMoreRef}
            className="h-10 w-full flex justify-center items-center"
          >
            {loading && <p>Loading more...</p>}
          </div>

          {!hasMore && (
            <p className="text-center text-gray-500 mt-4">
              No more jobs to load.
            </p>
          )}
        </div>
      </div>
    </>
  );
};


