import { useState } from "react";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";
import { requestAuthUrl } from "@/features/email-application/api/gmail-authorization.service";
import { isValidEmail } from "@/validation";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@features/user";

export function useAuthorizeGmail() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: user } = useQuery(userQueries.detail());
  const userEmail = user?.email || "";

  const authorizeGmail = async () => {
    if (!userEmail || !isValidEmail(userEmail)) {
      toast.error("Please enter a valid email.");
      return;
    }

    try {
      setIsLoading(true);
      Analytics.gmailConnectStart("toggle");
      const { success, data } = await requestAuthUrl();
      if (!success) return toast.error("Failed to get auth URL");

      const authUrl = (data as any)?.authUrl ?? data?.data?.authUrl;
      if (!authUrl) return toast.error("Failed to get auth URL");
      window.location.href = authUrl;
    } catch (err: any) {
      console.error("Authorization error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { authorizeGmail, isLoading };
}
