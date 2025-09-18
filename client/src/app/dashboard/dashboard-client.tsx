"use client";

import { useAuth } from "@/hooks/use-auth";
import { IUser } from "@/types";

interface DashboardClientProps {
  initialUser: IUser;
}

export default function DashboardClient({ initialUser }: DashboardClientProps) {
  const { user, logout, isLogoutLoading } = useAuth();

  // Use server data as fallback
  const currentUser = user || initialUser;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {currentUser.email}!</p>
      <p>UID: {currentUser.uid}</p>
      {JSON.stringify(currentUser)}
      <p>Email Verified: {currentUser.emailVerified ? "Yes" : "No"}</p>
      <button onClick={handleLogout} disabled={isLogoutLoading}>
        {isLogoutLoading ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
