import Settings from "./Settings";

const SettingsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ tab: string }>;
}) => {
  const { tab } = await searchParams;
  return (
    <div className="p-4 sm:p-8">
       <Settings tab={tab} />
    </div>
  );
};

export default SettingsPage;
