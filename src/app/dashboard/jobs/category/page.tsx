import { Category } from "./CategoryClient";

const CategoryPage = async ({ searchParams }: any) => {
  const tab = (await searchParams)?.tab;

  return (
    <div className="p-4 sm:p-8">
      <Category tab={tab} />
    </div>
  );
};

export default CategoryPage;
