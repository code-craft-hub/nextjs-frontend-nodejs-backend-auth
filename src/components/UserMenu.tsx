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
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@module/user";
import { useLogoutMutation } from "@/modules/auth";

export const UserMenu = () => {
  const { data: user } = useQuery(userQueries.detail());
  const router = useRouter();

  const isAdmin = user?.role === "admin";

  const logout = useLogoutMutation();

  const handleNavigateToAdmin = () => {
    window.open("https://admin.cverai.com", "_blank");
  };

  return (
    <div className="flex px-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex hover:cursor-pointer">
            <Avatar className="size-10">
              <AvatarImage src={user?.photoURL as string} alt="@avatar" />
              <AvatarFallback>
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}{" "}
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
          <DropdownMenuItem onClick={() => logout.mutate()}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={handleNavigateToAdmin}>
              Admin
              <DropdownMenuShortcut>⇧⌘A</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
