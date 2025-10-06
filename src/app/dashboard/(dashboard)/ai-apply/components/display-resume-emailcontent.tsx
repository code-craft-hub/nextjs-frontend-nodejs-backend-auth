import { useAuth } from "@/hooks/use-auth";
import React, { useState } from "react";
import { PreviewResume } from "./preview-resume-template";
import { DisplayGenerateEmailContent } from "./display-generated-emailcontent";

export const DisplayResumeEmailContent = ({ generatedData }: any) => {
  const { user } = useAuth();
  const [data] = useState(() => {
    if (user) {
      return {
        ...generatedData.resume,
        userId: user.uid,
        firstName: user.firstName,
        email: user.email,
        lastName: user.lastName,
        address: user.address,
        phoneNumber: user.phoneNumber,
        portfolio: user.portfolio,
        emailContent: generatedData.emailContent,
      };
    }
  });

  console.count("Render count for DisplayResumeEmailContent");
  localStorage?.setItem("generatedData", JSON.stringify(data));
  return (
    <div className="py-8 space-y-8">
      <DisplayGenerateEmailContent emailContent={data.emailContent} />      
      <PreviewResume data={data} />      
      {/* <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
        {JSON.stringify(generatedData, null, 2)}
      </pre> */}
    </div>
  );
};
