import { stripeSpecialCharacters } from "@/lib/utils";

const CL1Template = ({ AILoading, allData, data }: any) => {
  const paragraphs = data?.split(
    /(?<=\.\s)\n|\.\s{2,}(?=\S)|(?<=\.\s)(?=[A-Z])/g
  );
  return (
    <div
      className={` ${
        AILoading && "border-4 animate-blink border-blue-300"
      } max-w-screen-lg p-4  lg:pb-20 bg-white shadow-xl border-t-4 rounded-lg mb-8 `}
    >
      {!AILoading && (
        <div className="text-center mb-8 mt-8 ">
          <h1 className="text-2xl sm:text-5xl font-bold font-Times text-gray-800 tracking-widest">
            {allData?.firstName} {allData?.lastName}
          </h1>
          <p className="text-sm sm:text-xl text-gray-500 mt-2 tracking-widest uppercase">
            {stripeSpecialCharacters(allData?.key)}
          </p>

          <div className="text-gray-700 gap-1 flex flex-wrap bg-gray-100 py-2 items-center justify-center mt-4">
            {allData?.address && allData?.address}{" "}
            {allData?.phoneNumber && <> | {allData?.phoneNumber}</>}
            {allData?.email && <> | {allData?.email}</>}
            {/* <p>{allData?.address}</p>|<p>{allData?.phoneNumber}</p>|
            <p>{allData?.email}</p> */}
          </div>
        </div>
      )}
      {!AILoading && (
        <div className="mb-4 text-gray-700  sm:px-10">
          <p>{allData?.salutation && <>{allData?.salutation},</>}</p>
        </div>
      )}
      <div className="sm:px-10">
        {paragraphs?.map((paragraph: string, index: number) => {
          if (paragraph == "undefined") return;
          return (
            <div
              className="py-2.5"
              key={index}
              dangerouslySetInnerHTML={{
                __html: `<p>${paragraph?.trim()}</p>`,
              }}
            />
          );
        })}
      </div>
      {!AILoading && (
        <div className="text-gray-700 mb-4  gap-2 mt-4 sm:px-10">
          <p>{allData?.closing && <>{allData?.closing},</>}</p>
          <p className="">
            {allData?.firstName} {allData?.lastName}
            {allData?.lastName && "."}
          </p>
        </div>
      )}
      <div className="absolute bottom-0 right-0  text-gray-300 uppercase mb-2">
        <span className="text-capitalize text-gray-300">AI Model: </span>
        {allData?.aiModel ? allData?.aiModel : "GPT-3.5-Turbo"}
      </div>
    </div>
  );
};

export default CL1Template;
