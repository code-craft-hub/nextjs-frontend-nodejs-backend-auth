import { requireOnboarding } from '@/lib/server-auth';
import {DashboardClient} from './dashboard-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Next.js Firebase Auth',
  description: 'User dashboard',
};

export default async function DashboardPage() {
  const session = await requireOnboarding();
    return (
    <DashboardClient 
      initialUser={{
        uid: session.uid,
        email: session.email,
        emailVerified: session.emailVerified,
        onboardingComplete: session.onboardingComplete,
      }}
    />
  );
}