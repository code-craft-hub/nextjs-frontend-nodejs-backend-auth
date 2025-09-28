import { requireOnboarding } from '@/lib/server-auth';
// import {DashboardClient} from './dashboard-client';
import type { Metadata } from 'next';
import {DashboardClient} from './new-dashboard';

export const metadata: Metadata = {
  title: 'Dashboard - Next.js Firebase Auth',
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