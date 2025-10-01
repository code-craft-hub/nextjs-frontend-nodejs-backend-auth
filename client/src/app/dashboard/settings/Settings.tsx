"use client";
import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiApplyPreferences } from "./AiApplyPreferences";
import { User } from "lucide-react";
import { AdvancedProfileManagement } from "./AdvancedProfileManagement";
import { ProfileManagement } from "./ProfileManagement";

const Settings = () => {
  return (
    <div>
      <Tabs defaultValue="profile-management" >
        <TabsList className="bg-white w-full p-1 font-roboto gap-x-4">
          <TabsTrigger
            value="profile-management"
            className="text-md font-medium"
          >
            <User className="w-4 h-4" />
            <span className="max-sm:hidden">Profile Management</span>
          </TabsTrigger>
          <TabsTrigger
            value="ai-applypreference"
            className="text-md font-medium"
          >
            <img src="/ai-apply.svg" alt="AI apply" className="size-4" /> 
            <span className="max-sm:hidden">AI Apply Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="advanced-settings">
            <img src="/select-profile.svg" alt="AI apply" className="size-4" />
            <span className="max-sm:hidden">Advanced Settings</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile-management" className="text-md font-medium">
          <ProfileManagement />
        </TabsContent>
        <TabsContent value="ai-applypreference">
          <AiApplyPreferences />
        </TabsContent>
        <TabsContent value="advanced-settings">
          <AdvancedProfileManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
