import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import { QuestionType } from "@/types";

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    paddingVertical: 40,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
  },
  questionContainer: {
    marginBottom: 20,
  },
  question: {
    flexDirection: "row",
    marginBottom: 8,
  },
  answer: {
    flexDirection: "row",
  },
  label: {
    fontWeight: "bold",
    marginRight: 10,
    fontSize: 12,
    color: "#444",
  },
  text: {
    fontSize: 12,
    color: "#333",
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    fontStyle: "italic",
  },
});

// Main PDF Component
const IQ1PDFTemplate = ({
  allData,
}: {
  allData: QuestionType | undefined;
}) => {
  return (
    <Document>
      <Page style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>JOB INTERVIEW QUESTION</Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, {textDecoration: "underline"}]}>
          Here are key questions and answers tailored for a/an {allData?.key}.
        </Text>
        {Array.isArray(allData?.data) &&
          allData?.data.map((item, index) => (
            <View key={index} style={styles.questionContainer}>
              {/* Map Questions */}
              {Object.keys(item)
                .filter((key) => key.startsWith("Q"))
                .map((qKey) => (
                  <View key={qKey} style={styles.question}>
                    <Text style={styles.label}>Q:</Text>
                    
                    {/* <Text style={styles.text}>{item[qKey]}</Text> */}
                  </View>
                ))}

              {/* Map Answers */}
              {Object.keys(item)
                .filter((key) => key.startsWith("A"))
                .map((aKey) => (
                  <View key={aKey} style={styles.answer}>
                    <Text style={styles.label}>A:</Text>
                    {/* <Text style={styles.text}>{item[aKey]}</Text> */}
                  </View>
                ))}
            </View>
          ))}

        {/* Footer */}
      </Page>
    </Document>
  );
};
export default IQ1PDFTemplate;

// Example usage of the PDF component with a download link
// const DownloadInterviewQuestionsPDF = ({ allData }: { allData: QuestionType | undefined }) => (
//   <PDFDownloadLink
//     document={<InterviewQuestionsPDF allData={allData} />}
//     fileName={`${allData?.key}.pdf`}
//   >
//     {({ loading }) =>
//       loading ? "Loading document..." : "Download Interview Questions PDF"
//     }
//   </PDFDownloadLink>
// );

// export default DownloadInterviewQuestionsPDF;




// import { MdQuestionAnswer } from "react-icons/md";
// import { FaQuestionCircle } from "react-icons/fa";
// import { QuestionType } from "@/types";
// const IQ1PDFTemplate = ({allData}: {allData : QuestionType | undefined}) => {
//   return (
//     <div className="max-w-screen-l  m-4 p-4 sm:p-8 lg:px-20 lg:pb-20 bg-white shadow-xl border-t-4 rounded-lg">
//       <div className="text-center mb-8 ">
//         <h1 className="text-2xl sm:text-5xl font-bold font-Times tracking-wider  flex-wrap text-wrap">
//           JOB INTERVIEW QUESTION
//         </h1>
//         <h2 className="text-gray-600 bg-gray-50 py-2 px-2 mt-8 font-bold ">
//           Here are key questions and answers tailored for the job you're
//           pursuing.
//         </h2>
//       </div>
//       <div className="mb-8 p-4">
//         {Array.isArray(allData) &&
//           allData?.map((item, index) => {
//             return (
//               <div key={index} className="flex flex-col">
//                 {Object.keys(item)
//                   .filter((key) => key.startsWith("Q"))
//                   .map((qKey, qIndex) => (
//                     <div
//                       key={qIndex}
//                       className="flex flex-col sm:flex-row mb-2 items-start"
//                     >
//                       <div className="flex place-items-center gap-2 mb-2">
//                         <FaQuestionCircle className="text-stone-300" />
//                         <p className="pr-3">Questions: </p>
//                       </div>
//                       <p className="">{item[qKey]}</p>
//                     </div>
//                   ))}
//                 {Object.keys(item)
//                   .filter((key) => key.startsWith("A"))
//                   .map((aKey, aIndex) => (
//                     <div
//                       key={aIndex}
//                       className="flex flex-col sm:flex-row mb-10 items-start"
//                     >
//                       <div className="flex place-items-center gap-2 mb-2">
//                         <MdQuestionAnswer className="text-green-300" />
//                         <p className="pr-8">Answer: </p>
//                       </div>
//                       <p className="">{item[aKey]}</p>
//                     </div>
//                   ))}
//               </div>
//             );
//           })}
//       </div>
//     </div>
//   );
// };

// export default IQ1PDFTemplate;
