import { MdQuestionAnswer } from "react-icons/md";
import { FaQuestionCircle } from "react-icons/fa";
const IQ1Template = ({ AILoading, allData, data }: any) => {
 
  return (
    <div
      className={`${
        AILoading && "border-4 animate-blink border-blue-300"
      } max-w-screen-l p-4 py-8 sm:py-16  bg-white shadow-xl border-t-4 rounded-lg`}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl lg:text-4xl font-bold font-Times tracking-wider  flex-wrap text-wrap">
          JOB INTERVIEW QUESTION
        </h1>
        <h2 className="text-gray-600 bg-gray-50 py-2 px-2 mt-8 font-bold ">
          Here are key questions and answers tailored for the job you're
          pursuing.
        </h2>
      </div>
      {allData?.QA ? (
        <div>
          {allData?.QA?.map(
            (item: { key: string; value: string }) =>
              Object.entries(item).map(([_key, value], index: number) => (
                <div
                  key={index}
                  className="p-4 flex flex-col sm:flex-row gap-4 items-start"
                >
                  {index % 2 === 0 ? (
                    <div className="flex place-items-center gap-2 mb-2">
                      <FaQuestionCircle className="text-stone-300" />
                      <p className="pr-3">Questions: </p>
                    </div>
                  ) : (
                    <div className="flex place-items-center gap-2 mb-2">
                      <MdQuestionAnswer className="text-green-300" />
                      <p className="pr-8">Answer: </p>
                    </div>
                  )}
                  <p>{value}</p>
                </div>
              ))
          )}
        </div>
      ) : (
        <div className="mb-8 p-4">
          {Array.isArray(data) &&
            data?.map((item, index) => {
              return (
                <div key={index} className="flex flex-col">
                  {Object.keys(item)
                    .filter((key) => key.startsWith("Q"))
                    .map((qKey, qIndex) => (
                      <div
                        key={qIndex}
                        className="flex flex-col sm:flex-row mb-2 items-start"
                      >
                        <div className="flex place-items-center gap-2 mb-2">
                          <FaQuestionCircle className="text-stone-300" />
                          <p className="pr-3">Questions: </p>
                        </div>
                        <p className="">{item[qKey]}</p>
                      </div>
                    ))}
                  {Object.keys(item)
                    .filter((key) => key.startsWith("A"))
                    .map((aKey, aIndex) => (
                      <div
                        key={aIndex}
                        className="flex flex-col sm:flex-row mb-10 items-start"
                      >
                        <div className="flex place-items-center gap-2 mb-2">
                          <MdQuestionAnswer className="text-green-300" />
                          <p className="pr-8">Answer: </p>
                        </div>
                        <p className="">{item[aKey]}</p>
                      </div>
                    ))}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default IQ1Template;
