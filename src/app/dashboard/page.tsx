import { requireOnboarding } from '@/lib/server-auth';
import type { Metadata } from 'next';
import { DashboardClient } from './new-dashboard';

export const metadata: Metadata = {
  title: 'Cverai Dashboard',
  description: 'User dashboard',
};

export default async function DashboardPage() {
  const session = await requireOnboarding();
    return (
    <DashboardClient 
      initialUser={session}
    />
  );
}