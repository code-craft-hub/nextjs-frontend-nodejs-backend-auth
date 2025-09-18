import Template1 from "./Template1";
import Template2 from "./Template2";
import { PDFDownloadLink } from "@react-pdf/renderer";

const data = {
  name: "cverai",
  subject: "subject",
  title: "dynamic Title",
};

const AllPdfTemplates = () => {
  return (
    <div className="flex flex-col bg-lime-300 p-8 gap-8">
      <PDFDownloadLink
        document={<Template1 data={data} />}
        fileName={`${data.name}`}
      >
        {({ loading }) =>
          loading ? "Loading document..." : "Download PDF Template1"
        }
      </PDFDownloadLink>
      <Template2 />
    </div>
  );
};

export default AllPdfTemplates;
