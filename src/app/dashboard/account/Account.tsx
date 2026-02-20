"use client";
import { useEffect, useState } from "react";
import { UserProfileForm } from "./user-profile-update";
import { PasswordUpdateForm } from "./user-password-update";
import { cn } from "@/lib/utils";
import { Billing } from "./billing/Billing";
import { CreditCard, Shield, User2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@module/user";
import { sendGTMEvent } from "@next/third-parties/google";
import { useFireworksConfetti } from "@/components/ui/confetti";
import { Button } from "@/components/ui/button";
import { CompletedPaymentModal } from "@/components/shared/CompletedPaymentModal";
import { useDeleteAccountMutation } from "@module/auth";


export const AccountClient = ({
  tab,
  event,
  reference,
}: {
  tab: string;
  event: string;
  reference: string;
}) => {
  const [currentTab, setCurrentTab] = useState(tab || "account");
  const { data: user } = useQuery(userQueries.detail());
  const [open, setOpen] = useState(false);

  const { start: startConfetti } = useFireworksConfetti();

 

  const isDevMode = process.env.NODE_ENV === "development";
  const deleteAccount = useDeleteAccountMutation();

  useEffect(() => {
    if (user?.firstName) {
      sendGTMEvent({
        event: "Accounts Page",
        value: `${user.firstName} viewed Accounts Page`,
      });
    }
  }, [user?.firstName]);

  useEffect(() => {
    if (event === "subscription_success") {
      startConfetti();
      setOpen(true);
    }
  }, [event]);

  const tabs = [
    { id: "account", label: "Account Settings", icon: <User2 /> },
    { id: "billing", label: "Billing & Subscription", icon: <CreditCard /> },
    { id: "security", label: "Security Settings", icon: <Shield /> },
  ];

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex justify-center items-center w-full bg-white shadow-2xl rounded-full p-1 px-1.5 max-w-5xl mx-auto font-roboto">
        {tabs.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2 rounded-[15px] text-center w-full",
              t.id === currentTab ? "bg-background" : "hover:cursor-pointer",
            )}
            onClick={() => setCurrentTab(t.id)}
          >
            <span className="text-[14px] font-medium text-[#0C111D] hidden md:flex">
              {t.label}
            </span>
            <span className="text-[14px] font-medium text-[#0C111D] md:hidden">
              {t.icon}
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

      {isDevMode && (
        <Button
          onClick={() => deleteAccount.mutate()}
          disabled={deleteAccount.isPending}
          variant="destructive"
        >
          Delete Account
        </Button>
      )}

      <CompletedPaymentModal open={open} onOpenChange={setOpen} />
    </div>
  );
};
