import ProtectedRoute from "@/components/ProtectedRoute";



export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to your secure dashboard!</p>
        <p>User profile</p>
      </div>
    </ProtectedRoute>
  );
}
