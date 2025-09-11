import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1>Secure Authentication System</h1>
      <p>Welcome to our enterprise-grade authentication system.</p>
      
      <AuthGuard showWhenAuthenticated={false}>
        <div>
          <p>Please sign in to access your dashboard.</p>
          <Link href="/login">Sign In</Link>
          <br />
          <Link href="/register">Create Account</Link>
        </div>
      </AuthGuard>
      
      <AuthGuard showWhenAuthenticated={true}>
        <div>
          <p>Welcome back! Access your dashboard:</p>
          <Link href="/dashboard">Go to Dashboard</Link>
        </div>
      </AuthGuard>
    </div>
  );
}