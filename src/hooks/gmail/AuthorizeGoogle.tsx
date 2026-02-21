import { useEffect, useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  checkAuthStatus,
  requestAuthUrl,
  sendAuthorizationCode,
} from "../../services/gmail/gmail-authorization-service";
import { isValidEmail } from "@/validation";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@module/user";

const FormSchema = z.object({
  authorized: z.boolean().default(false).optional(),
});

const AuthorizeGoogle: React.FC<{
  checkAuth?: (checkValue: any) => Promise<void>;
  hidden?: boolean;
}> = ({ checkAuth, hidden = false }) => {
  const [_isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { data: user } = useQuery(userQueries.detail());

  const userEmail = user?.email || "";

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (!code && !error) return;

      try {
        setIsLoading(true);

        if (error) throw new Error(`Authorization failed: ${error}`);
        if (!code) throw new Error("No authorization code received");

        const result = await sendAuthorizationCode(code);
        if (result.success) {
          toast.success("Gmail authorization successful!");
          form.setValue("authorized", true);
          router.push("/dashboard/settings");
        } else {
          throw new Error("Authorization failed");
        }
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        router.push(pathname);
      } finally {
        setIsLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, userEmail, router, pathname]);

  // ✅ Check Gmail Auth on Hover
  const handleCheckAuthStatus = useCallback(async () => {
    try {
      const { authorized } = await checkAuthStatus();
      form.setValue("authorized", authorized || false);
      return authorized;
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  }, []);

  useEffect(() => {
    const callCheckAuthOnce = async () => {
      const checkValue = await handleCheckAuthStatus();
      console.log("Initial Gmail auth status:", checkValue);
      if (checkAuth) {
        checkAuth(checkValue);
      }
    };
    callCheckAuthOnce();
  }, []);

  const authorizeGmail = async () => {
    if (!userEmail || !isValidEmail(userEmail)) {
      toast.error("Please enter a valid email.");
      return;
    }

    try {
      setIsLoading(true);
      const { success, data } = await requestAuthUrl();
      if (!success) return toast.error(`Failed to get auth URL`);

      // ✅ Start Google OAuth
      const authUrl = (data as any)?.authUrl ?? data?.data?.authUrl;
      if (!authUrl) return toast.error(`Failed to get auth URL`);
      window.location.href = authUrl;
    } catch (err: any) {
      // toast.error(`Error: ${err.message}`);
      console.error("Authorization error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      authorized: false,
    },
  });

  return hidden ? null : (
    <div onMouseEnter={handleCheckAuthStatus}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="authorized"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center ">
              <FormControl>
                <Switch
                  className="bg-gray-300! data-[state=checked]:bg-blue-500! h-6.5 w-12 pl-0.5"
                  thumbClassName="size-5 !bg-white data-[state=checked]:!translate-x-[calc(100%)]"
                  checked={field.value}
                  onCheckedChange={(checked: boolean) => {
                    field.onChange(checked);
                    if (checked) {
                      authorizeGmail();
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </Form>
    </div>
  );
};

export default AuthorizeGoogle;

