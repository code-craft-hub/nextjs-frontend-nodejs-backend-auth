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
import { authApi } from "@/lib/api/auth.api";

export const UserMenu = () => {
  const { data: user } = useQuery(userQueries.detail());
  const router = useRouter();

  const isAdmin = (user as any)?.role === "admin";

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
          <DropdownMenuItem onClick={() => authApi.logout()}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await authApi.logout()
                  router.push(`/login`);
                }}
              >
                Delete Account
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
