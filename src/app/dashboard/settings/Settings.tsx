"use client";
import React, { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiApplyPreferences } from "./AiApplyPreferences";
import { Sparkles, User } from "lucide-react";
import { ProfileManagement } from "./ProfileManagement";

const Settings = ({ tab }: { tab: string }) => {
  const [currentTab, setCurrentTab] = useState(tab ?? "ai-applypreference");

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };
  return (
    <div>
      <Tabs defaultValue={currentTab}>
        <TabsList className="bg-white w-full p-1 font-roboto gap-x-4">
          <TabsTrigger
            value="ai-applypreference"
            className="text-xs font-medium"
            onClick={() => {
              handleTabChange("ai-applypreference");
            }}
          >
            <Sparkles className="size-4 sm:hidden" />
            <img
              src="/ai-apply.svg"
              alt="AI apply"
              className="size-4 hidden sm:flex"
            />
            <span className="max-sm:hidden">AI Apply Preferences</span>
          </TabsTrigger>
          <TabsTrigger
            value="profile-management"
            className="text-xs font-medium"
            onClick={() => {
              handleTabChange("profile-management");
            }}
          >
            <User className="w-4 h-4" />
            <span className="max-sm:hidden">Profile Management</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile-management" className="text-md font-medium">
          <ProfileManagement />
        </TabsContent>
        <TabsContent value="ai-applypreference">
          <AiApplyPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
