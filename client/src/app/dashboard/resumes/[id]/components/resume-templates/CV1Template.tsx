import { DBUserT } from "@/types";

export default function CV1Template({
  profileTitle,
  userDataDB,
}: {
  userDataDB?: DBUserT;
  profileTitle?: string;
}) {
  return (
    <div className="max-w-screen-lg  bg-white shadow-xl border-t-4 rounded-lg">
      <div className="text-center mb-8 mt-12 ">
        <h1 className="text-2xl sm:text-5xl font-bold  tracking-wider flex-wrap text-wrap">
          <span className="font-light font-ebGaramond">{userDataDB?.firstName}</span>{" "}
          <span className="font-ebGaramond">{userDataDB?.lastName}</span>
        </h1>
        <p className="text-sm sm:text-xl text-gray-500 mt-2 tracking-widest uppercase line-clamp-1 font-ebGaramond">
          {userDataDB?.cvJobTitle}
        </p>
        <div className="flex justify-center flex-wrap mt-4 text-gray-600 bg-gray-100 py-4">
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

      <section className="p-4 sm:p-8">
        <div className="mb-8">
          <h2 className="text-lg font-bold tracking-wide text-gray-600 bg-gray-100 py-2 px-2 font-ebGaramond">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed p-4 font-ebGaramond">
            {profileTitle}
          </p>
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-bold tracking-wide text-gray-600 bg-gray-100 py-2 px-2 font-ebGaramond">
            WORK EXPERIENCE
          </h2>

          {userDataDB?.workExperiences?.map((work, index: number) => {
            const reg = /,/;
            let checkResp = work?.responsibilities;
            if (checkResp === "string" && reg.test(checkResp!)) {
              return checkResp?.split(",");
            }

            return (
              <div key={index} className="p-4 ">
                <div className="">
                  <h3 className="font-bold text-gray-600 py-2 font-ebGaramond">
                    {work?.jobTitle}
                  </h3>
                  <p className="text-sm text-gray-500 font-ebGaramond">
                    {work?.companyName}, {work?.location},{" "}
                    {String(new Date(work?.jobStart)).substring(4, 15)}{" "}
                    <span className="px-2">~</span>
                    {String(new Date(work?.jobEnd)).substring(4, 15)}
                  </p>
                  <h3 className="font-bold text-gray-600 font-ebGaramond mt-4">
                    Responsibilities
                  </h3>
                  <p className="mt-2 text-sm font-ebGaramond text-gray-600 leading-relaxed ">
                    {work?.workDescription}
                  </p>
                  {Array.isArray(checkResp) ? (
                    checkResp?.map((resp, index: number) => {
                      return (
                        <ul
                          key={index}
                          className="list-disc list-inside mt-2 font-ebGaramond text-sm text-gray-600 leading-relaxed"
                        >
                          <li className="list-disc font-ebGaramond">{resp}</li>
                        </ul>
                      );
                    })
                  ) : (
                    <li className="list-disc font-ebGaramond">{checkResp}</li>
                  )}
                 
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap w-full">
          <div className="mb-8 sm:w-1/2">
            <h2 className="text-lg font-bold font-ebGaramond tracking-wide text-gray-600 bg-gray-100 py-2 px-2">
              Soft SKILLS
            </h2>
            {userDataDB?.softSkills?.map((skills, index: number) => {
              return (
                <ul
                  key={index}
                  className="list-disc text-sm text-gray-600 leading-relaxed py-2 px-8"
                >
                  <li className="list-disc font-ebGaramond">{skills?.label}</li>
                </ul>
              );
            })}
          </div>
          <div className="mb-8 sm:w-1/2">
            <h2 className="text-lg font-bold font-ebGaramond tracking-wide text-gray-600 bg-gray-100 py-2 px-2">
              Hard SKILLS
            </h2>
            {userDataDB?.hardSkills?.map((skills, index: number) => {
              return (
                <ul
                  key={index}
                  className="list-disc  text-sm text-gray-600 leading-relaxed py-2 px-8"
                >
                  <li className="list-disc font-ebGaramond">{skills?.label}</li>
                </ul>
              );
            })}
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-bold font-ebGaramond tracking-wide text-gray-600 bg-gray-100 py-2 px-2 ">
            EDUCATION
          </h2>
          <div className="flex flex-col sm:flex-row flex-wrap w-full">
            {userDataDB?.educations?.map((edu, index: number) => {
              return (
                <div key={index} className="p-4 w-1/2">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-gray-600 font-ebGaramond">{edu?.degree}</h3>
                    <p className="text-sm text-gray-500 font-ebGaramond">{edu?.fieldOfStudy}</p>
                    <p className="text-sm text-gray-500 font-ebGaramond">
                      {edu?.schoolLocation}
                    </p>
                    <p className="text-sm text-gray-500 flex font-ebGaramond">
                      {String(new Date(edu?.educationStart)).substring(4, 15)}{" "}
                      <span className="px-2">~</span>
                      {String(new Date(edu?.educationEnd)).substring(4, 15)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
