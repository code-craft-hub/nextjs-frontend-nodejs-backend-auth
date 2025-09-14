'use client';

import { useAuth } from '@/hooks/use-auth';

interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
}

interface DashboardClientProps {
  initialUser: User;
}

export default function DashboardClient({ initialUser }: DashboardClientProps) {
  const { user, logout, isLogoutLoading } = useAuth();

  // Use server data as fallback
  const currentUser = user || initialUser;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
 

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {currentUser.email}!</p>
      <p>UID: {currentUser.uid}</p>
      <p>Email Verified: {currentUser.emailVerified ? 'Yes' : 'No'}</p>
      <button onClick={handleLogout} disabled={isLogoutLoading}>
        {isLogoutLoading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}