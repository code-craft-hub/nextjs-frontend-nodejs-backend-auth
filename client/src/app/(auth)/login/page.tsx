import { redirectIfAuthenticated } from '@/lib/server-auth';
import LoginClient from './login-client';

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginClient />;
}