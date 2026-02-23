import { cn } from "@/lib/utils";
import { leftMenuItems } from "@/lib/utils/constants";
import { useRouter } from "next/navigation";

const LeftMenu = () => {
    const router = useRouter();
  return (
    <div>
      <div className="bg-white p-3 h-fit rounded-md hidden lg:flex lg:flex-col gap-1">
        {leftMenuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(item.url)}
            className={cn(
              "group flex gap-2 p-2 hover:bg-primary hover:text-white items-center justify-start rounded-md w-44 hover:shadow-sm hover:cursor-pointer",
              item.isActive && "bg-blue-500 text-white",
            )}
          >
            <div className="size-fit rounded-sm">
              <img
                src={item.icon}
                alt={item.label}
                className={cn(
                  "size-4 group-hover:brightness-0 group-hover:invert",
                  item.isActive && "brightness-0 invert",
                )}
              />
            </div>
            <p className="text-xs">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftMenu;
