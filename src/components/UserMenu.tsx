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
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";

export const UserMenu = () => {
  const { logout } = useAuth();
  const { data: user } = useQuery(userQueries.detail());
  const router = useRouter();

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
          <DropdownMenuItem onClick={() => logout()}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
