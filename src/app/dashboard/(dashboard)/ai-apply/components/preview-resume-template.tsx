import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { monthYear, normalizeToString } from "@/lib/utils/helpers";
import { IUser } from "@/types";

export const PreviewResume = ({ data }: { data?: IUser }) => {
    const {user} = useAuth()
  return (
    <Card className="max-w-screen-lg  p-6 sm:px-10 text-gray-800 font-merriweather py-20">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-merriweather">
          {data?.firstName || user?.firstName} {data?.lastName || user?.lastName}
        </h1>
        <p className="text-lg text-gray-600 font-merriweather">
          {[data?.email || user?.email, data?.phoneNumber || user?.phoneNumber, data?.address, data?.portfolio]
            ?.filter(Boolean)
            ?.join(" | ")}
        </p>
      </header>
      <section className="mb-8">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
          Summary
        </h2>
        <p className="leading-relaxed font-merriweather">
          {normalizeToString(data?.profile)}
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
          Work Experience
        </h2>
        {Array.isArray(data?.workExperiences) &&
          data?.workExperiences?.map((work, index) => {
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
                  <span className="text-sm text-gray-500 font-merriweather">
                    {monthYear(work?.jobStart)} - {monthYear(work?.jobEnd)}
                  </span>
                </div>
                <p className="text-gray-600 font-merriweather">
                  {work?.location}
                </p>
                <ul className="list-inside text-sm mt-2 space-y-1">
                  {Array.isArray(checkResp) ? (
                    checkResp?.map((point: any, idx: number) => (
                      <li className="list-disc font-merriweather" key={idx}>
                        {point}
                      </li>
                    ))
                  ) : (
                    <li className="list-disc font-merriweather">{checkResp}</li>
                  )}
                </ul>
              </div>
            );
          })}
      </section>
      <section className="mb-8">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
          Education
        </h2>

        {Array.isArray(data?.educations) &&
          data?.educations?.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between">
                <p className="font-bold font-merriweather">{edu?.fieldOfStudy}</p>
                <span className="text-sm text-gray-500 font-merriweather">
                  {monthYear(edu?.educationStart)} -{" "}
                  {monthYear(edu?.educationEnd)}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-merriweather">
                {edu.degree} - {edu?.schoolLocation}
              </p>
              <p className="text-sm text-gray-600 font-merriweather">
                {edu.academicAchievements}
              </p>
            </div>
          ))}
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b border-gray-300 pb-1 mb-2">
          Certifications
        </h2>
        <div className="list-disc list-inside text-sm space-y-4">
          {Array.isArray(data?.certifications) &&
            data?.certifications?.map((cert, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between">
                  <p className="font-bold">{cert?.title}</p>
                  <p className="">{cert?.issueDate}</p>
                </div>
                <div className="font-light">{cert?.issuer}</div>
                <div className="">{cert?.description}</div>
              </div>
            ))}
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b border-gray-300 pb-1 mb-2">
          Projects
        </h2>
        <div className="list-disc list-inside text-sm space-y-4">
          {Array.isArray(data?.projects) &&
            data?.projects?.map((cert, index) => (
              <div key={index} className="space-y-1">
                <div className="">
                  <p className="font-bold">{cert?.name}</p>
                  <p className="">{cert?.description}</p>
                </div>
                <div className="font-light">{cert?.issuer}</div>
                <div className="">{cert?.description}</div>
              </div>
            ))}
        </div>
      </section>
      <section>
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
          Skills
        </h2>
        <div className="flex flex-wrap gap-2 text-sm mb-4">
          {Array.isArray(data?.softSkills) &&
            data?.softSkills?.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 rounded font-merriweather"
              >
                {skill?.label}
              </span>
            ))}
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {Array.isArray(data?.hardSkills) &&
            data?.hardSkills?.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 rounded font-merriweather"
              >
                {skill?.label}
              </span>
            ))}
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {Array.isArray(data?.allSkills) &&
            data?.allSkills?.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 rounded font-merriweather"
              >
                {skill?.label}
              </span>
            ))}
        </div>
      </section>
    </Card>
  );
};
