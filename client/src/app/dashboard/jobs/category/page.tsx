import React from "react";
import { Category } from "./category";
import { requireOnboarding } from "@/lib/server-auth";

const CategoryPage = async ({searchParams}: any) => {
  const session = await requireOnboarding();
  const tab = (await searchParams)?.tab
  return (
    <div>
      <Category initialUser={session} tab={tab} />
    </div>
  );
};

export default CategoryPage;
