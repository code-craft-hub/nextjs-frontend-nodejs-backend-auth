
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute 
      requiredPermissions={['admin:read']}
      fallback={<div>Admin access required to view this page.</div>}
    >
      <div>
        <h1>Admin Panel</h1>
        <p>This is the admin panel - only accessible to administrators.</p>
        
        <div>
          <h2>User Management</h2>
          <p>Manage users here</p>
        </div>
        
        <div>
          <h2>System Settings</h2>
          <p>Configure system settings</p>
        </div>
        
        <div>
          <h2>Audit Logs</h2>
          <p>View system audit logs</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
