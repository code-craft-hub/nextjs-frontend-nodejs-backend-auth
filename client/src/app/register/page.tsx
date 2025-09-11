
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import RegisterForm from '../../components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthGuard showWhenAuthenticated={false} fallback={
      <div>
        <p>You are already logged in.</p>
        <Link href="/dashboard">Go to Dashboard</Link>
      </div>
    }>
      <div>
        <h1>Create Account</h1>
        <RegisterForm />
        <p>
          Already have an account? <Link href="/login">Sign in here</Link>
        </p>
      </div>
    </AuthGuard>
  );
}
