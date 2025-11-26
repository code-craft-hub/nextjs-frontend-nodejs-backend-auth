import ResetPasswordClient from "./ResetPasswordClient";
// import { redirect } from "next/navigation";

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const email = (await searchParams)?.email;

  return <ResetPasswordClient email={email} />;
}
