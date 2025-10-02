import { InitialUser } from "@/types";
import Overview from "./Overview";

export const Jobs = ({ initialUser }: InitialUser) => {
  console.log(initialUser);

  return (
    <div className="p-4 sm:p-8">
      <Overview />
    </div>
  );
};
