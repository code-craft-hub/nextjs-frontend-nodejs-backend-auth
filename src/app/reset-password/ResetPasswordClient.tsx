"use client";
import { useState } from "react";
import { PasswordResetVerifyEmail } from "./PasswordResetVerifyEmail";
import { ResetPassword } from "./ResetPassword";

const ResetPasswordClient = ({ email }: { email: string }) => {
  const [displayComponent, setDisplayComponent] = useState(true);
  const handleStateChange = (value: any) => {
    setDisplayComponent(value);
  };
  return (
    <div>
      {displayComponent ? (
        <PasswordResetVerifyEmail
          email={email}
          handleStateChange={handleStateChange}
        />
      ) : (
        <ResetPassword email={email} />
      )}
    </div>
  );
};

export default ResetPasswordClient;
