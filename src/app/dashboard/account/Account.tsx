"use client";
import React from "react";

import { UserProfileForm } from "./user-profile-update";
import { PasswordUpdateForm } from "./user-password-update";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const AccountPage = ({ tab }: any) => {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-center gap-4 border-b-2 max-w-96 mx-auto mb-4 sm:mb-8 font-inter">
        <button
          onClick={() => router.push("/dashboard/home/account?tab=account")}
          className={cn(
            "px-4 text-center w-full hover:cursor-pointer hover:border-primary/70",
            (tab === "account" || tab !== "security") &&
              "border-b-2 border-primary"
          )}
        >
          Account Settings
        </button>
        <button
          onClick={() => router.push("/dashboard/home/account?tab=security")}
          className={cn(
            "px-4 text-center w-full hover:cursor-pointer hover:border-primary/70",
            tab === "security" && "border-b-2 border-primary"
          )}
        >
          Security Settings
        </button>
      </div>
      {tab === "account" || tab !== "security" ? (
        <UserProfileForm />
      ) : (
        <PasswordUpdateForm />
      )}
    </div>
  );
};
