import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
// import { getJobsInDB } from "@/lib/react-query/queries";
import { FaArrowRightLong } from "react-icons/fa6";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const FeaturesJob = (dbUser: any) => {
  // const { data, isLoading } = getJobsInDB();
  const router = useRouter();

  // if (isLoading) {
  //   return (
  //     <section className="px-8 w-full max-w-screen-xl mx-auto py-8 sm:py-16 overflow-hidden space-y-8">
  //       <div className="flex justify-between">
  //         <h1 className="font-bold text-2xl sm:text-4xl">Features Jobs</h1>
  //         <Button
  //           className="flex gap-2"
  //           onClick={() => {
  //             router.push("/job-listings");
  //           }}
  //         >
  //           View all <FaArrowRightLong />
  //         </Button>
  //       </div>
  //       <div className="">
  //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  //           {[1, 2, 3, 4, 5, 6].map((index) => {
  //             return (
  //               <div key={index} className="w-full">
  //                 <Skeleton className="h-64" />
  //               </div>
  //             );
  //           })}
  //         </div>
  //       </div>
  //     </section>
  //   );
  // }
  return (
    <section className="w-full max-w-screen-xl mx-auto py-8 sm:py-16 overflow-hidden space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl sm:text-4xl">Features Jobs</h1>
        <Button
          onClick={() => {
            router.push("/job-listings");
          }}
          className="flex gap-2 rounded-full h-8"
        >
          View all <FaArrowRightLong />
        </Button>
      </div>

      <div className="">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* {data?.slice(0, 6).map((item, index) => {
            return (
              <Card
                key={index}
                className={`                
                p-4 md:p-8 space-y-4 sm:space-y-6 flex flex-col bg-slate-50`}
              >
                <div className="grid grid-cols-3 gap-2 text-center max-sm:justify-center">
                  <div className="rounded-xl p-0.5 px-2 text-[12px] border truncate">
                    {!!item.jobType ? item.jobType: "Remote"}
                  </div>
                  <div className="rounded-xl col-span-2 p-0.5 px-2 text-[12px] border truncate">
                    {item.location}
                  </div>
                </div>
                <div className="flex  ">
                  <div className="flex gap-4 items-center">
                    <div className="rounded-full overflow-hidden size-10 border shrink-0">
                      <img
                        src={item.companyLogo ?? "/assets/images/placeholder.jpg"}
                        alt=""
                        className="bg-cover bg-center"
                      />
                    </div>
                    <h1 className="font-medium">{item.title}</h1>
                  </div>
                </div>
                <h1 className="line-clamp-2">{item.descriptionText}</h1>
                
                {dbUser?.email ? (
                  <Button
                    className=" w-full rounded-full text-blue-500"
                    variant={"outline"}
                  >
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apply Now
                    </a>
                  </Button>
                ) : (
                  <Button
                    className=" w-full rounded-full text-blue-500"
                    variant={"outline"}
                    onClick={() => {
                      router.push('/dashboard')
                    }}
                  >
                    Apply Now
                  </Button>
                )}
              </Card>
            );
          })} */}
        </div>
      </div>
    </section>
  );
};

export default FeaturesJob;
