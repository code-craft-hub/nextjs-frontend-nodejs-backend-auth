import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { previousData } from "@/constants";
import { Link } from "react-router-dom";
export default function ListPopover() {
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">More...</Button>
      </PopoverTrigger>
      <PopoverContent className="w-70 bg-white">
        <div className="grid gap-6 hover:cursor-pointer">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Data Sources</h4>
            <p className="text-sm text-muted-foreground">
              Select 1 from the list.
            </p>
          </div>
          {/* {previousData.map((item: any) => (
            <div className=" hover:text-black text-gray-500">
              {item && item.substring(0, 20)}
              {item && item.length > 20 && "..."}
            </div>
          ))} */}
          <Link to={"/dashboard/profile"}>
            <Button>Create New Profile</Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
