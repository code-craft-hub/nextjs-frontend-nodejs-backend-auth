import { redirectIfAuthenticated } from '@/lib/server-auth';
// import {LoginClient} from './login-client';
import DeleteAccountPage from './delete';

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <DeleteAccountPage />;
  // return <LoginClient />;
}