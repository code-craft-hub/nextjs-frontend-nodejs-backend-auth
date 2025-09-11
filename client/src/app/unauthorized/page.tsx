
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div>
      <h1>Access Denied</h1>
      <p>You don't have permission to access this resource.</p>
      <p>
        <Link href="/dashboard">Return to Dashboard</Link>
      </p>
    </div>
  );
}
