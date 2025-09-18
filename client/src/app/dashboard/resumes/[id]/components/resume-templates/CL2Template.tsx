import { FaPhoneAlt, FaLinkedin } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdAttachEmail } from "react-icons/md";
const CL2Template = () => {
  return (
    <div className="max-w-screen-lg lg:mx-auto m-4 p-4 sm:p-8 lg:px-20 lg:pb-20 bg-white shadow-xl border-t-4 rounded-lg">
      {/* Header Section */}
      <div className="text-center mb-8 mt-12 md:mt-24">
        <h1 className="text-2xl sm:text-5xl font-bold font-Times tracking-wider  flex-wrap text-wrap">
          LAYLA ROBERTS
        </h1>
        <p className="text-sm sm:text-xl text-gray-500 mt-2 tracking-widest uppercase">
          Professional Title
        </p>
        <div className="flex justify-center flex-wrap mt-4 text-gray-600 bg-gray-50 py-4">
          <p className="mx-2 flex gap-1 place-items-center">
            <FaPhoneAlt />
            555-555-1234
          </p>
          |
          <p className="mx-2 flex gap-1 place-items-center">
            <MdAttachEmail />
            name@mail.com
          </p>
          |
          <p className="mx-2 flex gap-1 place-items-center">
            <FaLinkedin />
            LinkedIn/username
          </p>
          |
          <p className="mx-2 flex gap-1 place-items-center">
            <FaLocationDot />
            San Clemente, CA
          </p>
        </div>
      </div>

      {/* Recipient Information */}
      <div className="mb-8 text-gray-800">
        <p>Simon Smith</p>
        <p>Job position</p>
        <p>Company name</p>
        <p>January 15, 2023</p>
      </div>

      {/* Body Content */}
      <div className="mb-8 text-gray-700">
        <p className="uppercase font-semibold mb-4">Dear Mr. Smith,</p>
        <p className="mb-4">
          <span className="font-semibold">Introduction -</span> In the opening
          paragraph, outline the main reason for establishing contact. Are you
          responding to an advertised vacancy? If so, where and when was the job
          advertised? Are you cold-calling and looking for job openings? Have
          you been referred by a contact?
        </p>
        <p className="mb-4">
          <span className="font-semibold">Body -</span> The second and third
          paragraphs are the body of your cover letter. Tell the recruiter what
          skills, knowledge, experience, qualifications, and personal attributes
          you can bring to the role. Why are you the best person for the job?
          What are your selling points? Showcase a few achievements that you’re
          particularly proud of. Outline why you’re interested in working for
          the company and highlight how you can contribute to the company’s
          success. Remember to tailor your cover letter to the job.
        </p>
        <p>
          <span className="font-semibold">Closing -</span> In the final
          paragraph, confirm your availability. Outline the next steps of the
          process. Don’t forget to thank the reader for taking the time to read
          and to mention the best way to reach you to arrange an interview.
        </p>
      </div>

      {/* Signature */}
      <div className="text-gray-800">
        <p className="mb-12">Best Regards,</p>
        <p className="italic font-signature text-4xl mb-1">Layla Roberts</p>
        <p>Layla Roberts</p>
      </div>
    </div>
  );
};

export default CL2Template;
