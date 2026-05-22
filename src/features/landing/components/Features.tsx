import { useRouter } from "next/navigation";

const Features = () => {
  const router = useRouter();

  return (
    <section
      id="services"
      className="px-4 sm:px-8 w-full max-w-screen-xl mx-auto py-8 sm:py-16 overflow-hidden"
    >
      <h1 className="font-bold text-2xl sm:text-4xl text-center w-full">
        Results from CverAI
      </h1>
      <p className="text-center text-xl">
        Your Ultimate AI-Powered Career Launchpad.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 py-16 bg-sone-300">
        <div className="sm:w-1/2 flex flex-col ">
          <div className="">
            <h1 className="font-bold text-xl sm:text-3xl max-w-[400px]">
              Effortless, Professional Resumes
            </h1>
            <p className="max-w-[600px] mt-4 ">
              Easily create a tailored, professional resume with our AI Resume
              Builder. Just enter your details, and our AI crafts a polished,
              ATS-friendly resume designed to help you land your next job!
            </p>
            <button
              className="text-blue-500 mt-8"
              onClick={() => router.push("/dashboard/home")}
            >
              Try it Now!
            </button>
          </div>
        </div>
        <div className="sm:w-1/2">
          <img className="" src="/assets/images/adobecv.png" alt="" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 py-16">
        <div className="sm:w-1/2 order-2 sm:order-1">
          <img className="" src="/assets/images/coverletter.png" alt="" />
        </div>
        <div className="sm:w-1/2 order-1 sm:order-2">
          <h1 className="font-bold text-xl sm:text-3xl max-w-[400px]">
            Tailor your Cover Letters to Specific Jobs Effortlessly
          </h1>
          <p className="max-w-[600px] mt-4 ">
            Craft a personalized, professional cover letter with our AI. Simply
            provide your details, and our AI generates a custom cover letter
            that aligns perfectly with the job you&#39;re applying for, helping
            you make a great first impression!
          </p>
          <button
            className="text-blue-500 mt-8"
            onClick={() => router.push("/dashboard/home")}
          >
            Try it Now!
          </button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 py-16">
        <div className="sm:w-1/2 flex flex-col items-end">
          <div className="">
            <h1 className="font-bold text-xl sm:text-3xl max-w-[400px]">
              Practice with Tailored Questions
            </h1>
            <p className=" mt-4 ">
              Prepare for your next interview with our AI-powered Generator. Get
              personalized, role-specific questions to help you practice and
              feel confident for any job interview!
            </p>
            <button
              className="text-blue-500 mt-8 "
              onClick={() => router.push("/dashboard/home")}
            >
              Try it Now!
            </button>
          </div>
        </div>
        <div className="sm:w-1/2">
          <img className="" src="/assets/images/questions.png" alt="" />
        </div>
      </div>
      <div className="flex flex-col gap-8 my-8">
        <h1 className="font-bold text-2xl sm:text-4xl text-center w-full pb-">
          Why choose our AI?
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 ">
          <div className="sm:w-1/2">
            <div className="flex gap-2">
              <div className="icon">
                <img className="" src="/assets/images/star.png" alt="" />
              </div>
              <h1 className="text-blue-500 font-bold text-xl">
                AI Powered Personalization
              </h1>
            </div>
            <p className="mt-2">
              Our tool analyzes your experience and automatically suggests
              content to highlight your strengths.
            </p>
          </div>
          <div className="sm:w-1/2">
            <div className="flex gap-2">
              <div className="icon">
                <img className="" src="/assets/images/layout.png" alt="" />
              </div>
              <h1 className="text-blue-500 font-bold text-xl">
                Customizable Templates
              </h1>
            </div>
            <p className="mt-2">
              Choose from a wide rangfe of professional templates that fit any
              industry or career level.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 ">
          <div className="sm:w-1/2">
            <div className="flex gap-2">
              <div className="icon">
                <img className="" src="/assets/images/thunder.png" alt="" />
              </div>
              <h1 className="text-blue-500 font-bold text-xl">
                Instant Feedback
              </h1>
            </div>
            <p className="mt-2">
              Receive tips to improve your resume and cover letter, ensuring you
              make the best impression.
            </p>
          </div>
          <div className="sm:w-1/2">
            <div className="flex gap-2">
              <div className="icon">
                <img className="" src="/assets/images/arrow.png" alt="" />
              </div>
              <h1 className="text-blue-500 font-bold text-xl">
                Export & Share Easily
              </h1>
            </div>
            <p className="mt-2">
              Download your documents in various formats and shared them
              directly from our platform.
            </p>
          </div>
        </div>
      </div>
      <div className="py-16">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="sm:w-1/2">
            <div className="py-4">
              <h1 className="font-bold text-3xl">How It Works</h1>
              <p className="text-gray-900/50 text-sm">
                3 Simple Steps to Stand Out
              </p>
            </div>
            <div className="py-4">
              <h1 className="font-bold text-2xl">Sign Up</h1>
              <p className="">
                Create a free account to access our resume and cover letter
                builder.
              </p>
            </div>
            <div className="py-4">
              <h1 className="font-bold text-2xl">Customize Your Documents</h1>
              <p className="">
                Create a free account to access our resume and cover letter
                builder.
              </p>
            </div>
            <div className="">
              <h1 className="font-bold text-2xl">Download and Apply</h1>
              <p className="">
                Create a free account to access our resume and cover letter
                builder.
              </p>
            </div>
            <button
              className="text-blue-500 mt-8 "
              onClick={() => router.push("/dashboard/home")}
            >
              Get Started for Free!
            </button>
          </div>
          <div className="sm:w-1/2">
            <img className="" src="/assets/images/Container.png" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
