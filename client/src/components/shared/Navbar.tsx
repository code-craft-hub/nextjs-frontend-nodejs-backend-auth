import {
  Database,
  LogOut,
  Paperclip,
  Settings,
  TimerIcon,
  User,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <div className="flex justify-between mb-6">
      <Link to={"/"}>
        <img src="/Logo.png" />
      </Link>
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <img src="/girl2.png" />
          </PopoverTrigger>
          <PopoverContent className="w-52">
            <div className="hover:cursor-pointer">
              <div className="flex gap-3 my-4 font-semibold  hover:text-black  text-gray-500 p-1 ">
                <User /> Profile
              </div>
              <Link
                to={"/data_source"}
                className="flex gap-3 my-4 font-semibold  hover:text-black  text-gray-500 p-1 "
              >
                <Database /> Data Sources
              </Link>
              <div className="flex gap-3 my-4 font-semibold  hover:text-black  text-gray-500 p-1 ">
                <Paperclip /> Resumes
              </div>
              <div className="flex gap-3 my-4 font-semibold  hover:text-black  text-gray-500 p-1 ">
                <TimerIcon /> History
              </div>
              <div className="flex gap-3 my-4 font-semibold  hover:text-black  text-gray-500 p-1 ">
                <Settings /> Settings
              </div>
              <div className="flex gap-3 my-4 font-semibold  hover:text-black  text-gray-500 p-1 ">
                <LogOut /> Logout
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default Navbar;
