import { ProtectedRoute } from '../../components/ProtectedRoute';
import { ROUTE_PROTECTIONS } from '../../config/routes';

export default function SettingsPage() {
  return (
    <ProtectedRoute protection={ROUTE_PROTECTIONS['/settings']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
            {/* Settings content will go here */}
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500">Settings content placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}