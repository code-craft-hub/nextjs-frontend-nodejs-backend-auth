import { DBUserT } from "@/types";

const CV3Template = ({
  profileTitle,
  userDataDB,
}: {
  userDataDB?: DBUserT;
  profileTitle?: string;
}) => {
  return (
    <div className="max-w-screen-lg p-4 bg-white shadow-xl border-t-4 rounded-lg font-ebGaramond">
      <div className="text-center mb-8 mt-12">
        <h1 className="text-2xl sm:text-5xl text-gray-800 font-bold font-ebGaramond tracking-[6px]">
          {userDataDB?.firstName}, {userDataDB?.lastName}
        </h1>
        <p className="text-sm sm:text-xl text-gray-500 mt-2 tracking-widest uppercase line-clamp-1 font-ebGaramond">
          {userDataDB?.cvJobTitle}{" "}
        </p>
        <div className="flex justify-center flex-wrap mt-4 text-gray-600 border-t-2 border-b-2 py-4 ">
          <p className="mx-2 flex gap-1 place-items-center font-ebGaramond">
            {[
              userDataDB?.email,
              userDataDB?.phoneNumber,
              userDataDB?.address,
              userDataDB?.portfolio,
            ]
              ?.filter(Boolean)
              ?.join(" | ")}
          </p>
        </div>
      </div>

      {/* Professional Summary */}
      <section className="p-4 sm:px-8">
        <h2 className="text-xl tracking-widest uppercase font-semibold text-gray-800 pb-2 mb-4 font-ebGaramond">
          Professional Summary
        </h2>
        <p className="text-gray-700 font-ebGaramond">{profileTitle}</p>
      </section>

      {/* Work Experience */}
      <section className="p-4 sm:p-8">
        <h2 className="text-xl tracking-widest uppercase font-semibold text-gray-800 border-b-2 pb-2 mb-4 font-ebGaramond">
          Work Experience
        </h2>
        {userDataDB?.workExperiences?.map((work, index: number) => {
          const reg = /,/;
          const checkResp = work?.responsibilities;
          if (checkResp === "string" && reg.test(checkResp!)) {
            return checkResp?.split(",");
          }

          return (
            <div key={index} className={`${index == 0 && "mb-6"} font-ebGaramond`}>
              <div className="">
                <h3 className="font-bold text-lg text-gray-600 py-2 font-ebGaramond">
                  {work?.jobTitle}
                </h3>
                <p className=" text-gray-500 font-ebGaramond">
                  {work?.companyName}, {work?.location},{" "}
                  {String(new Date(work?.jobStart)).substring(4, 15)}{" "}
                  <span className="px-2">~</span>
                  {String(new Date(work?.jobEnd)).substring(4, 15)}
                </p>
                <h3 className="text-sm underline text-gray-600 mt-4 font-ebGaramond">
                  Responsibilities :
                </h3>
                <p className="mt-2 text-gray-600 leading-relaxed font-ebGaramond">
                  {work?.workDescription}
                </p>
                {Array.isArray(checkResp) ? (
                  checkResp?.map((resp, index: number) => {
                    return (
                      <ul
                        key={index}
                        className="list-disc list-inside mt-2 text-gray-600 leading-relaxed"
                      >
                        <li className="list-disc">{resp}</li>
                      </ul>
                    );
                  })
                ) : (
                  <li className="list-disc">{checkResp}</li>
                )}
               
              </div>
            </div>
          );
        })}
      </section>

      {/* Education */}
      <section className="p-4 sm:px-8 font-ebGaramond">
        <h2 className="text-xl tracking-widest uppercase font-semibold text-gray-800 border-b-2 pb-2 mb-4 font-ebGaramond">
          Education
        </h2>
        <div className="flex flex-col sm:flex-row flex-wrap w-full">
          {userDataDB?.educations?.map((edu, index: number) => {
            return (
              <div key={index} className="p-4 w-1/2 font-ebGaramond">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-gray-600 font-ebGaramond">{edu?.degree}</h3>
                  <p className="text-gray-500 font-ebGaramond">{edu?.fieldOfStudy}</p>
                  <p className="text-gray-500 font-ebGaramond">{edu?.schoolLocation}</p>
                  <p className="text-gray-500 font-ebGaramond flex">
                    {String(new Date(edu?.educationStart)).substring(4, 15)}{" "}
                    <span className="px-2">~</span>
                    {String(new Date(edu?.educationEnd)).substring(4, 15)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Skills */}
      <section className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row flex-wrap w-full">
          <div className="mb-8 sm:w-1/2">
            <h2 className="text-xl tracking-widest font-ebGaramond uppercase font-semibold text-gray-800 border-b-2 pb-2 mb-4">
              Soft Skills
            </h2>
            {userDataDB?.softSkills?.map((skills, index: number) => {
              return (
                <ul
                  key={index}
                  className="list-disctext-gray-600 leading-relaxed py-2 px-8"
                >
                  <li className="list-disc">{skills?.label}</li>
                </ul>
              );
            })}
          </div>
          <div className="mb-8 sm:w-1/2">
            <h2 className="text-xl tracking-widest uppercase font-ebGaramond font-semibold text-gray-800 border-b-2 pb-2 mb-4">
              Hard Skills
            </h2>
            {userDataDB?.hardSkills?.map((skills, index: number) => {
              return (
                <ul
                  key={index}
                  className="list-disc text-gray-600 leading-relaxed py-2 px-8"
                >
                  <li className="list-disc">{skills?.label}</li>
                </ul>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CV3Template;
