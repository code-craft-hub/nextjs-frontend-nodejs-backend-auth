import { redirectIfAuthenticated } from '@/lib/server-auth';
import RegisterClient from './register-client';

export default async function RegisterPage() {
  await redirectIfAuthenticated();
  return <RegisterClient />;
}