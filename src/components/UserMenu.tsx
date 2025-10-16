"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { IUser } from "@/types";

export const UserMenu = ({ initialUser }: { initialUser: Partial<IUser> }) => {
  const { user, logout } = useAuth();
  const dbUser = { ...initialUser, ...user };
  const router = useRouter();

  return (
    <div className="flex px-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex hover:cursor-pointer">
            <Avatar className="size-10">
              <AvatarImage src={dbUser?.photoURL as string} alt="@avatar" />
              <AvatarFallback>
                {dbUser?.firstName?.charAt(0)}
                {dbUser?.lastName?.charAt(0)}{" "}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="" align="start">
          <DropdownMenuItem onClick={() => router.push(`/dashboard/account`)}>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
