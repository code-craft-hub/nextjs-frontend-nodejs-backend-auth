import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";



export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to your secure dashboard!</p>
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
}
