"use client";
import { usePathname, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Define your route mapping
const routeMap: Record<string, string> = {
  "/dashboard/home": "Home",
  "/dashboard/job-listings": "Job Listings",
  "/dashboard/resumes": "Resumes",
  "/dashboard/cover-letters": "Cover Letters",
  "/dashboard/interview-questions": "Interview Questions",
  "/dashboard/profile": "Profile",
};

export const DynamicBreadcrumb = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const router = useRouter();

  const handleNavigate = (href: string) => {
    if (href === "/dashboard") return router.push("/dashboard/home");
    router.push(href);
  };
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const href = "/" + pathSegments.slice(0, index + 1).join("/");
          const title =
            routeMap[href] ||
            segment.charAt(0).toUpperCase() + segment.slice(1);
          const isLast = index === pathSegments.length - 1;
          return (
            <div key={href} className="flex items-center hover:cursor-pointer">
              <BreadcrumbItem className={index > 0 ? "hidden md:block" : ""}>
                {isLast ? (
                  <BreadcrumbPage>{title?.replace(/-/ig, " ")}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink onClick={() => handleNavigate(href)}>
                    {title?.replace(/-/ig, " ")}
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
