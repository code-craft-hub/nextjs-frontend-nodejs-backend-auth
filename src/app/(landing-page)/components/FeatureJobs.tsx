import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import { featuredJobs } from "../constants";
import { JobFilters } from "@/lib/types/jobs";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { useQuery } from "@tanstack/react-query";

export const FeatureJobs = ({ filters }: { filters: JobFilters }) => {
  const { data: jobs, isLoading } = useQuery(jobsQueries.all(filters));
console.log("🚀 FeaturedJobs filters:", filters, jobs);
  return (
    <section id="feature-jobs" className="pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
          <Button variant="cveraiOutline">
            View All <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4 space-y-4"
            >
              <div className="">
                <h3 className="font-medium mb-1">{job.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-[#E7F6EA] text-[#0BA02C] uppercase text-nowrap h-fit">
                  {job.type}
                </span>
                <span className=" text-gray-400 text-xs">
                  Salary: {job.salary}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-gray-200 flex items-center justify-center text-2xl">
                  {job.logo}
                </div>
                <div className="">
                  <p className="text-gray-600 text-sm font-medium">
                    {job.company}
                  </p>
                  <div className="flex items-center text-gray-500 text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {job.location}
                  </div>
                </div>
                <div className="ml-auto">
                  <Button>Auto Apply</Button>{" "}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
