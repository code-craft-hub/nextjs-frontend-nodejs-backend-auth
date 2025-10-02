"use client";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

// Define your route mapping
const routeMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/job-listings": "Job Listings",
  "/dashboard/resumes": "Resumes",
  "/dashboard/cover-letters": "Cover Letters",
  "/dashboard/interview-questions": "Interview Questions",
  "/dashboard/profile": "Profile",
};

export const DynamicBreadcrumb = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
//   console.log("Current pathname:", pathname);
//   console.log("Path segments:", pathSegments);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const href = "/" + pathSegments.slice(0, index + 1).join("/");
        //   console.log("Segment href:", href);
          const title =
            routeMap[href] ||
            segment.charAt(0).toUpperCase() + segment.slice(1);

        //   console.log("Segment title:", title);
        //   console.log("routeMap[href]", routeMap[href]);
          const isLast = index === pathSegments.length - 1;
        //   console.log("isLast:", isLast);

          return (
            <div key={href} className="flex items-center">
              <BreadcrumbItem className={index > 0 ? "hidden md:block" : ""}>
                {isLast ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href} asChild>
                    <Link href={href}>{title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
