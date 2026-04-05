import type { Metadata } from "next";
import { Category } from "@/features/jobs/components/CategoryClient";

export const metadata: Metadata = {
  title: "Job Categories",
};

const CategoryPage = async ({ searchParams }: any) => {
  const tab = (await searchParams)?.tab;

  return (
    <div className="p-4 sm:p-8">
      <Category tab={tab} />
    </div>
  );
};

export default CategoryPage;
