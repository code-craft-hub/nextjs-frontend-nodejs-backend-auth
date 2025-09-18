import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  src: `${window.location.origin}/fonts/Roboto-Regular.ttf`,
  fontWeight: "normal",
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    padding: 30,
    fontSize: 11,
  },
  section: {
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginBottom: 10,
  },
  text: {
    marginBottom: 3,
  },
});

export default function InterviewQuestionPdfTemplate({
  data,
  title,
}: {
  data: any;
  title: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <View style={styles.section}>
            <Text style={styles.header}>{title} Inteview Question</Text>
            <View style={{ borderBottom: "1px solid black" }}></View>
          </View>
          {data?.map((item: any, index: number) => (
            <View key={index}>
              <Text style={{ paddingTop: "12px" }}>{item}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
