import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { LetterType } from "@/types";
const styles = StyleSheet.create({
  page: {
    padding: 40,
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 20,
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
    color: "#666",
  },
  divider: {
    borderBottom: "1px solid #000",
    marginBottom: 20,
  },
  contactInfo: {
    textAlign: "center",
    fontSize: 10,
    marginBottom: 30,
  },
  dateAndAddress: {
    marginBottom: 20,
  },
  content: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  closing: {
    marginTop: 30,
    fontSize: 11,
  },
  signature: {
    marginTop: 10,
    fontSize: 11,
  },
});

export const CLPdfTemplate = ({allData}: {allData:LetterType|undefined}) => {
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(allData?.data!, "text/html");
  const processedData = parsedDoc.body.textContent!;
  const paragraphs = processedData.split(/(?<=\.\s)\n|\.\s{2,}(?=\S)|(?<=\.\s)(?=[A-Z])/g);
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>
          {allData?.firstName} {allData?.lastName}{" "}
        </Text>
        <Text style={styles.subheader}>{allData?.key}</Text>
        {/* <View style={styles.divider} /> */}
        <Text style={styles.contactInfo}>
          {allData?.address} | {allData?.phoneNumber} | {allData?.email} |{" "}
          {allData?.portfolio}
        </Text>
        <View style={styles.content}>
          <Text>{allData?.salutation}</Text>
          {paragraphs.map((para, index) => {
            return <Text key={index} style={{paddingVertical: "8px"}}>{para}</Text>;
          })}
        </View>
        {/* <Text style={styles.closing}>{allData?.closing},</Text> */}
        <Text style={styles.signature}>
          {allData?.firstName} {allData?.lastName}.
        </Text>
      </Page>
    </Document>
  );
};

