import { Card } from "@/components/ui/card";
import { monthYear, normalizeToString } from "@/lib/utils/helpers";
import { DBUserT } from "@/types";
export default function CV2Template({
  profileTitle,
  userDataDB,
}: {
  userDataDB?: DBUserT;
  profileTitle?: string;
}) {
  return (
    <Card className="max-w-screen-lg  p-6 sm:px-10 text-gray-800 font-ebGaramond py-20">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-ebGaramond">
          {userDataDB?.firstName} {userDataDB?.lastName}
        </h1>
        <p className="text-lg text-gray-600 font-ebGaramond">
          {[
            userDataDB?.email,
            userDataDB?.phoneNumber,
            userDataDB?.address,
            userDataDB?.portfolio,
          ]
            ?.filter(Boolean)
            ?.join(" | ")}
        </p>
      </header>
      <section className="mb-8">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-ebGaramond">
          Summary
        </h2>
        <p className="leading-relaxed font-ebGaramond">
          {normalizeToString(profileTitle)}
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-ebGaramond">
          Work Experience
        </h2>
        {Array.isArray(userDataDB?.workExperiences) &&
          userDataDB?.workExperiences?.map((work, index) => {
            const reg = /,/;
            let checkResp: string | string[] = work?.responsibilities!;
            if (typeof checkResp === "string" && reg.test(checkResp!)) {
              checkResp = checkResp?.split(",");
            }

            return (
              <div key={index} className="mb-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">
                    {work?.jobTitle} - {work?.companyName}
                  </h3>
                  <span className="text-sm text-gray-500 font-ebGaramond">
                    {monthYear(work?.jobStart)} - {monthYear(work?.jobEnd)}
                  </span>
                </div>
                <p className="text-gray-600 font-ebGaramond">
                  {work?.location}
                </p>
                <ul className="list-inside text-sm mt-2 space-y-1">
                  {Array.isArray(checkResp) ? (
                    checkResp?.map((point: any, idx: number) => (
                      <li className="list-disc font-ebGaramond" key={idx}>
                        {point}
                      </li>
                    ))
                  ) : (
                    <li className="list-disc font-ebGaramond">{checkResp}</li>
                  )}
                </ul>
              </div>
            );
          })}
      </section>
      <section className="mb-8">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-ebGaramond">
          Education
        </h2>

        {Array.isArray(userDataDB?.educations) &&
          userDataDB?.educations?.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between">
                <p className="font-bold font-ebGaramond">{edu?.fieldOfStudy}</p>
                <span className="text-sm text-gray-500 font-ebGaramond">
                  {monthYear(edu?.educationStart)} -{" "}
                  {monthYear(edu?.educationEnd)}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-ebGaramond">
                {edu.degree} - {edu?.schoolLocation}
              </p>
            </div>
          ))}
      </section>

      <section>
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-ebGaramond">
          Skills
        </h2>
        <div className="flex flex-wrap gap-2 text-sm mb-4">
          {Array.isArray(userDataDB?.softSkills) &&
            userDataDB?.softSkills?.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 rounded font-ebGaramond"
              >
                {skill?.label}
              </span>
            ))}
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {Array.isArray(userDataDB?.hardSkills) &&
            userDataDB?.hardSkills?.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 rounded font-ebGaramond"
              >
                {skill?.label}
              </span>
            ))}
        </div>
      </section>
    </Card>
  );
}
