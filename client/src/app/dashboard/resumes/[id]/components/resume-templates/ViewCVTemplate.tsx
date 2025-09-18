import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { DBUserT } from "@/types";

Font.register({
  family: "Times",
  src: "/fonts/Times New Roman.ttf",
});
// Create styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 24,
    letterSpacing: 2,
    fontFamily: "Times",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 12,
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 30,
    color: "#555",
  },
  sectionHeader: {
    fontSize: 14,
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    paddingLeft: 5,
    fontWeight: "heavy",
    marginBottom: 10,
    marginTop: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#333",
  },
  divider: {
    marginBottom: 15,
    borderBottom: "1px solid #E5E5E5",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  column: {
    width: "48%",
  },
  text: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "#333",
    marginBottom: 5,
  },
  boldText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  skills: {
    fontSize: 10,
    lineHeight: 0.4,
    marginBottom: 15,
  },
  education: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  degree: {
    fontSize: 10,
    lineHeight: 1.4,
    fontWeight: "heavy",
  },
  year: {
    fontSize: 10,
    lineHeight: 1.4,
    fontStyle: "italic",
  },
  contactInfo: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 2,
    justifyContent: "center",
    fontSize: 12,
  },
  contactText: {
    marginRight: 3,
  },
});

// TODO: THIS IS THE CURRENT WORKING PDF VERSION OF CV THAT IS WORKING, DON'T COME AND BREAK IT OOOO
const ViewCVTemplate = ({ userDataDB }: { userDataDB?: DBUserT }) => (
  <Document
    title={`${userDataDB?.cvJobTitle} - cverai.com`}
    author={`${userDataDB?.firstName}, ${userDataDB?.lastName} - cverai.com`}
    subject={`${userDataDB?.cvJobTitle} - cverai.com`}
    keywords={`${userDataDB?.cvJobTitle}, Resume, Cover Letter, Interview question, CV - cverai.com`}
    creator={`cverai.com`}
    producer={`cverai.com`}
    
  >
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.header}>
          {userDataDB?.firstName}, {userDataDB?.lastName}
        </Text>
        <Text style={[styles.subHeader, { marginBottom: "20" }]}>
          {userDataDB?.cvJobTitle}
        </Text>
        <View style={styles.contactInfo}>
          <Text style={styles.contactText}>{userDataDB?.phoneNumber} | </Text>
          <Text style={styles.contactText}>{userDataDB?.email} | </Text>
          <Text style={styles.contactText}>{userDataDB?.portfolio} | </Text>
          <Text>
            {userDataDB?.address}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: "30", marginTop: "20" }}>
        <View>
          <Text style={styles.sectionHeader}>Professional Summary</Text>
          <Text style={styles.text}>{userDataDB?.profile}</Text>
        </View>

        {/* Work Experience */}
        <View style={[styles.row]}>
          <View style={{ width: "69%" }}>
            <Text style={styles.sectionHeader}>Work Experience</Text>
            {userDataDB?.workExperiences?.map((work, index: number) => {
                const reg = /,/;
                let checkResp = work?.responsibilities;
                if (checkResp === "string" && reg.test(checkResp!)) {
                  return checkResp?.split(",");
                }
               
                return (
                  <View key={index} style={{ marginTop: 5 }}>
                    <Text style={styles.boldText}>{work?.jobTitle}</Text>
                    <Text style={styles.text}>
                      {work?.companyName}, {work?.location}.
                    </Text>
                    <Text style={styles.text}>
                      {String(new Date(work?.jobStart)).substring(4, 15)} ~{" "}
                      {String(new Date(work?.jobEnd)).substring(4, 15)}
                    </Text>
                    <Text
                      style={{
                        fontSize: "10",
                        marginBottom: 5,
                        fontStyle: "italic",
                        color: "#4B5563",
                        textDecoration: "underline",
                      }}
                    >
                      Responsibilities :
                    </Text>
                    <Text style={styles.text}>{work?.workDescription}</Text>
                    {Array.isArray(checkResp) ? (
                      checkResp?.map((resp, index: number) => {
                        return (
                          <Text key={index} style={styles.text}>
                            • {resp}
                          </Text>
                        );
                      })
                    ) : (
                      <Text style={styles.text}>• {checkResp}</Text>
                    )}
                  </View>
                );
              })}
          </View>
          <View style={{ width: "2%" }} />
          {/* Skills */}

          <View style={{ width: "29%" }}>
            <View>
              <Text style={[styles.sectionHeader, { marginBottom: 10 }]}>
                Soft Skills
              </Text>

              {userDataDB?.softSkills?.map((skills, index: number) => {
                return (
                  <View
                    key={index}
                    style={[styles.skills, { flexDirection: "row" }]}
                  >
                    <Text style={{ paddingHorizontal: "1" }}>•</Text>
                    <Text>{skills?.label}</Text>
                  </View>
                );
              })}
            </View>
            <View>
              <Text style={[styles.sectionHeader, { marginVertical: 10 }]}>
                Hard Skills
              </Text>

              {userDataDB?.hardSkills?.map((skills, index: number) => {
                return (
                  <View
                    key={index}
                    style={[styles.skills, { flexDirection: "row" }]}
                  >
                    <Text style={{ paddingHorizontal: "1" }}>•</Text>
                    <Text>{skills?.label}</Text>
                  </View>
                );
              })}
            </View>

            {/* Education */}
            <View>
              <Text style={styles.sectionHeader}>Education</Text>
              {userDataDB?.educations?.map((edu, index: number) => {
                return (
                  <View key={index} style={{ marginBottom: "8" }}>
                    <Text style={[styles.degree, { flexWrap: "wrap" }]}>
                      {edu?.degree}
                    </Text>
                    <Text style={styles.education}>{edu?.fieldOfStudy}</Text>
                    <Text style={styles.education}>{edu?.schoolLocation}</Text>
                    <Text style={styles.year}>
                      {String(new Date(edu?.educationStart)).substring(4, 15)} ~{" "}
                      {String(new Date(edu?.educationEnd)).substring(4, 15)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default ViewCVTemplate;

{
  /* <PDFViewer width="100%" height="1200">
</PDFViewer> */
}
