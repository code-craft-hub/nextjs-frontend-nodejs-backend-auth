import AuthorizeGoogle from "./AuthorizeGoogle";
import { ToggleEmailSendOrDraft } from "./ToggleEmailSendOrDraft";
import { DocumentData } from "firebase/firestore";
import { UserAIModels } from "./UserAIModels";
import { Card } from "@/components/ui/card";

const AccountIntegration = ({
  dbUser,
}: {
  dbUser: DocumentData | null | undefined;
}) => {
  return (
    <div>
      <Card className="space-y-4 pb-4">
        <div className="bg-gray-100 p-4">
          <h1 className="font-bold">Third-Party Integrations</h1>
        </div>
        <div className="px-4 space-y-4">
          <AuthorizeGoogle />
          <ToggleEmailSendOrDraft dbUser={dbUser} />
          <UserAIModels dbUser={dbUser} />
        </div>
      </Card>
    </div>
  );
};

export default AccountIntegration;
