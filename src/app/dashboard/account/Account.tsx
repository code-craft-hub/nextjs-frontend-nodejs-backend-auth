"use client";
import React from "react";

import { UserProfileForm } from "./user-profile-update";
import { PasswordUpdateForm } from "./user-password-update";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { apiService } from "@/hooks/use-auth";
// import { Billing } from "./billing/Billing";

export const AccountPage = ({ tab }: any) => {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-center gap-4 border-b-2 max-w-screen-lg mx-auto mb-4 sm:mb-8 font-inter">
        <button
          onClick={() => router.push("/dashboard/account?tab=account")}
          className={cn(
            "px-4 text-center w-full hover:cursor-pointer hover:border-primary/70",
            (tab === "account" || tab === undefined) &&
              "border-b-2 border-primary"
          )}
        >
          Account Settings
        </button>
        {/* <button
          onClick={() => router.push("/dashboard/account?tab=billing")}
          className={cn(
            "px-4 text-center w-full hover:cursor-pointer hover:border-primary/70",
            tab === "billing" && "border-b-2 border-primary"
          )}
        >
          Billing and Subscription
        </button> */}
        <button
          onClick={() => router.push("/dashboard/account?tab=security")}
          className={cn(
            "px-4 text-center w-full hover:cursor-pointer hover:border-primary/70",
            tab === "security" && "border-b-2 border-primary"
          )}
        >
          Security Settings
        </button>
      </div>
      {tab === "account" ? (
        <UserProfileForm />
      ) : tab === "billing" ? (
        <PasswordUpdateForm />
      ) : (
        <PasswordUpdateForm />
      )}

      <Button
        onClick={async () => {
          await apiService.deleteUser();
        }}
        variant={"destructive"}
        className="mt-8"
      >
        Delete Account
      </Button>
    </div>
  );
};
