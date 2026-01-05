"use client";
import { useEffect, useState } from "react";
import { UserProfileForm } from "./user-profile-update";
import { PasswordUpdateForm } from "./user-password-update";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { apiService } from "@/hooks/use-auth";
import { Billing } from "./billing/Billing";
import { CreditCard, Shield, User2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { sendGTMEvent } from "@next/third-parties/google";

export const AccountClient = ({ tab, reference }: any) => {
  const [currentTab, setCurrentTab] = useState(!!tab ? tab : "account");
  const { data: user } = useQuery(userQueries.detail());
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  useEffect(() => {
    if (user?.firstName)
      sendGTMEvent({
        event: `Accounts Page`,
        value: `${user?.firstName} viewed Accounts Page`,
      });
  }, [user?.firstName]);

  const tabs = [
    { id: "account", value: "Account Settings", icon: <User2 /> },
    { id: "billing", value: "Billing & Subscription", icon: <CreditCard /> },
    { id: "security", value: "Security Settings", icon: <Shield /> },
  ];

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex justify-center items-center w-full bg-white shadow-2xl rounded-full p-1 px-1.5 max-w-screen-lg mx-auto font-roboto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2 rounded-[15px] text-center w-full",
              tab.id === currentTab ? "bg-background" : "hover:cursor-pointer"
            )}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="text-[14px] font-medium text-[#0C111D] hidden md:flex">
              {tab.value}
            </span>
            <span className="text-[14px] font-medium text-[#0C111D] md:hidden">
              {tab.icon}
            </span>
          </div>
        ))}
      </div>

      {currentTab === "account" || currentTab === undefined ? (
        <UserProfileForm />
      ) : currentTab === "billing" ? (
        <Billing reference={reference} />
      ) : (
        <PasswordUpdateForm />
      )}

      <Button
        onClick={async () => {
          await apiService.deleteUser();
        }}
        variant={"destructive"}
        className=""
      >
        Delete Account
      </Button>
    </div>
  );
};
