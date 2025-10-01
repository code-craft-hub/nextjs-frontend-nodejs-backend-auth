import { AccountPage } from "./Account";

const ProfilePage = async ({ searchParams }: any) => {
  const tab = (await searchParams)?.tab;

  return (
    <div className="p-4 sm:p-8">
      <AccountPage tab={tab} />
    </div>
  );
};

export default ProfilePage;
