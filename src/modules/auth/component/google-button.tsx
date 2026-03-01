import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { api } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const GoogleButton = ({
  handleLoading,
}: {
  handleLoading: (loading: boolean) => void;
}) => {
  const router = useRouter();

  const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
    try {
      handleLoading(true);
      const result = await api.post<{
        data: {
          user: { onboardingComplete: boolean; emailVerified: boolean };
        };
      }>(
        "/auth/google",
        { credential: response.credential },
        { skipRefresh: true },
      );
      const user = result?.data?.user;

      if (user && !user.emailVerified) {
        router.push("/verify-email");
      } else if (user && !user.onboardingComplete) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard/home");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed. Please try again.");
    } finally {
      handleLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    // Handle Google login error
  };
  return (
    <div>
      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={handleGoogleLoginError}
        useOneTap={true}
      />
    </div>
  );
};
