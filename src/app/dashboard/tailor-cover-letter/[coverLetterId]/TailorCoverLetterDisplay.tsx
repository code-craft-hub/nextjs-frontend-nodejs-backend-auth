import { useAuth } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";
import { CoverLetter, IUser } from "@/types";

const TailorCoverLetterDisplay = ({
  data,
  user,
  destinationEmail
}: {
  data: CoverLetter | undefined;
  user: Partial<IUser> | undefined;
  destinationEmail?: string;
}) => {

  const {useCareerDoc} = useAuth();
  const {data: coverLetterData} = useCareerDoc<CoverLetter>(data?.id || "",COLLECTIONS.COVER_LETTER);
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      <div className="bg-slate-50 border-b w-full  border-slate-200 shadow-md rounded-xl flex flex-col items-center justify-between">
        <div className="bg-white p-4 sm:p-8 overflow-y-auto w-full">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-outfit text-md flex flex-col gap-2">
            <div className="mb-4">
              <p className="text-xl font-medium font-inter">
                To: {destinationEmail}
              </p>
              <p className="text-sm font-inter">Subject: {data?.title}</p>
            </div>
            <p className="text-sm font-bold font-inter">Dear Hiring Manager,</p>
            <p className="text-sm">{data?.coverLetter}</p>
            {data?.coverLetter && (
              <div className="mt-8">
                <p className="">Sincerely</p>
                <p className="">
                  {data?.firstName ?? user?.firstName}{" "}
                  {data?.lastName ?? user?.lastName}
                </p>
                <p className="">{data?.phoneNumber ?? user?.phoneNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailorCoverLetterDisplay;
