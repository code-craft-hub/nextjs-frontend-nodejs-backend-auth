import { useEffect, useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  // FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import {
  checkAuthStatus,
  requestAuthUrl,
  sendAuthorizationCode,
} from "./gmail-authorization-service";
import { isValidEmail } from "@/validation";
import { useAuth } from "@/hooks/use-auth";

const FormSchema = z.object({
  authorized: z.boolean().default(false).optional(),
});

const AuthorizeGoogle: React.FC<{
  checkAuth?: (checkValue: any) => Promise<void>;
}> = ({ checkAuth }) => {
  const [_isLoading, setIsLoading] = useState(false);
  // const pathname = usePathname();
  // const navigate = useNavigate();
  const router = useRouter();

  const { user } = useAuth();
  const userEmail = user?.email || "";

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");
      const state = urlParams.get("state");

      if (!code && !error) return;

      try {
        setIsLoading(true);

        if (error) throw new Error(`Authorization failed: ${error}`);
        if (!code) throw new Error("No authorization code received");

        const resolvedEmail = state || userEmail;
        if (!resolvedEmail) throw new Error("User email not found");

        const result = await sendAuthorizationCode(resolvedEmail, code);
        if (result.success) {
          toast.success("Gmail authorization successful!");
          form.setValue("authorized", true);
          router.push("/dashboard/settings");
        } else {
          throw new Error(result.message || "Authorization failed");
        }
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        // toast.error(err.message || "Unknown error");
        router.push(location.pathname);
      } finally {
        setIsLoading(false);
      }
    };

    handleOAuthCallback();
  }, [location.search, userEmail, router, location.pathname]);

  // ✅ Check Gmail Auth on Hover
  const handleCheckAuthStatus = useCallback(async () => {
    try {
      const { data } = await checkAuthStatus();
      form.setValue("authorized", data.isAuthorized);
      return data;
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  }, []);

  useEffect(() => {
    const callCheckAuthOnce = async () => {
      const checkValue = await handleCheckAuthStatus();
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
      const { success, data, message } = await requestAuthUrl();
      if (!success) return toast.error(`Error: ${message}`);

      // ✅ Start Google OAuth
      window.location.href = data.authUrl;
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

  return (
    <div onMouseEnter={handleCheckAuthStatus}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="authorized"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center ">
              <FormControl>
                <Switch
                  className="!bg-gray-300 data-[state=checked]:!bg-blue-500 h-6.5 w-12 pl-0.5"
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
