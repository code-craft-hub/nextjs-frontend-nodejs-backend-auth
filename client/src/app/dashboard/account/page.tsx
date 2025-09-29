import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfileForm } from "./user-profile-update";
import { PasswordUpdateForm } from "./user-password-update";

const ProfilePage = () => {
  return (
    <div className="grid grid-cols-1">
      <Tabs defaultValue="profile" className="p-4 sm:p-8  w-full">
        <div className="flex items-center justify-center mb-8">
          <TabsList className="w-full max-w-sm shadow-none bg-transparent hover:cursor-pointer">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-blue-500 rounded-none"
            >
              Account Settings
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-blue-500 rounded-none"
            >
              Security Settings
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="profile">
          <UserProfileForm />
        </TabsContent>
        <TabsContent value="password">
          <PasswordUpdateForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
