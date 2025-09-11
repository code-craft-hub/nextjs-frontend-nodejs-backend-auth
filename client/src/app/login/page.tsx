import AuthGuard from "@/components/AuthGuard";
import LoginForm from "@/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthGuard showWhenAuthenticated={false} fallback={
      <div>
        <p>You are already logged in.</p>
        <Link href="/dashboard">Go to Dashboard</Link>
      </div>
    }>
      <div>
        <h1>Sign In</h1>
        <LoginForm />
        <p>
          Don't have an account? <Link href="/register">Create one here</Link>
        </p>
        <p>
          <Link href="/forgot-password">Forgot your password?</Link>
        </p>
      </div>
    </AuthGuard>
  );
}
