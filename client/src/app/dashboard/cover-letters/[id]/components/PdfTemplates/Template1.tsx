import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
Font.register({
  family: "NeueBlack",
  fonts: [
    {
      src: `${window.location.origin}/fonts/NeueMachina-Ultralight.ttf`,
      fontWeight: "ultralight",
    },
    {
      src: `${window.location.origin}/fonts/NeueMachina-Bold.ttf`,
      fontWeight: "bold",
    },
    {
      src: `${window.location.origin}/fonts/NeueMachina-Black.ttf`,
      fontWeight: "ultrabold",
    },
  ],
  // src: `${window.location.origin}/fonts/NeueMachina-Bold.ttf`
});
Font.register({
  family: "OpenSans",
  src: `${window.location.origin}/fonts/OpenSans-Regular.ttf`,
  fontWeight: "normal",
});
Font.register({
  family: "Roboto",
  src: `${window.location.origin}/fonts/Roboto-Regular.ttf`,
  fontWeight: "normal",
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  // header: {
  //   fontSize: 24,
  //   fontFamily: "Roboto",
  //   fontWeight: "normal",
  //   color: "#00A3A8",
  //   marginBottom: 20,
  // },
  // header: {
  //   fontSize: 24,
  //   fontFamily: "OpenSans",
  //   fontWeight: "normal",
  //   color: "#00A3A8",
  //   marginBottom: 20,
  // },
  header: {
    fontSize: 24,
    fontFamily: "NeueBlack",
    fontWeight: "ultrabold",
    color: "#00A3A8",
    marginBottom: 20,
  },
  contactInfo: {
    fontSize: 10,
    color: "gray",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "NeueBlack",
    fontWeight: "bold",
    color: "#00A3A8",
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: "NeueBlack",
    fontWeight: "ultralight",
    marginBottom: 10,
  },
  bulletPoint: {
    marginLeft: 10,
    marginBottom: 5,
  },
  bulletText: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  skillContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  skillItem: {
    fontSize: 10,
    marginRight: 10,
  },
  languageContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  languageText: {
    fontSize: 10,
  },
  progressBarContainer: {
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
    height: 10,
    marginTop: 3,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#00A3A8",
  },
});

// Create Document Component
const Template1 = ({ data }: any) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.header}>{data.title}</Text>
      <Text style={styles.contactInfo}>
        Liverpool, L1 4JA | 07912345678 | s.mcdonald@email.co.uk
      </Text>

      <Text style={styles.sectionTitle}>{data.subject}</Text>
      <Text style={styles.text}>
        Resourceful and adaptable Manager with over 11 years of experience in
        scheduling, staff training, protocol development, and process
        improvements. Meticulous team builder with expertise in employee
        engagement, customer relationship management (CRM), time management, and
        conflict resolution. Customer-focused leader seeking to leverage
        background into assistant or operations manager role with a progressive
        organization.
      </Text>

      <Text style={styles.sectionTitle}>EXPERIENCE</Text>
      <View>
        <Text style={styles.text}>09/2018 to Current</Text>
        <Text style={styles.text}>General Manager</Text>
        <Text style={styles.text}>Mamdos — Liverpool</Text>
        <View style={styles.bulletPoint}>
          <Text style={styles.bulletText}>
            • Met with each associate to establish realistic monthly sales
            goals.
          </Text>
          <Text style={styles.bulletText}>
            • Communicated store policy violations to upper management to
            prevent shrinkage and misconduct.
          </Text>
          <Text style={styles.bulletText}>
            • Enhanced data collection accuracy by preparing, authoring, and
            updating communications and policy memoranda.
          </Text>
          <Text style={styles.bulletText}>
            • Coordinated, led, and executed brand training presentations for
            trade or trend shows.
          </Text>
          <Text style={styles.bulletText}>
            • Supervised, developed, and delegated tasks to employees.
          </Text>
        </View>
      </View>

      <View>
        <Text style={styles.text}>01/2015 to 08/2018</Text>
        <Text style={styles.text}>Manager</Text>
        <Text style={styles.text}>Stone Target — Liverpool</Text>
        <View style={styles.bulletPoint}>
          <Text style={styles.bulletText}>
            • Offered constructive criticism regarding quality assurance on
            collections team phone calls.
          </Text>
          <Text style={styles.bulletText}>
            • Developed open and professional relationships with team members,
            enabling better, more effective issue resolution.
          </Text>
          <Text style={styles.bulletText}>
            • Analyzed employee workloads to meet seasonal fluctuation needs.
          </Text>
          <Text style={styles.bulletText}>
            • Implemented new team onboarding program, reducing training time
            from seven weeks to three.
          </Text>
          <Text style={styles.bulletText}>
            • Integrated process improvements continuously to increase overall
            workflow.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>EDUCATION</Text>
      <Text style={styles.text}>2012</Text>
      <Text style={styles.text}>M.Sc.: Business Management</Text>
      <Text style={styles.text}>University of Liverpool — Liverpool, UK</Text>

      <Text style={styles.sectionTitle}>SKILLS</Text>
      <View style={styles.skillContainer}>
        <Text style={styles.skillItem}>• Performance improvements</Text>
        <Text style={styles.skillItem}>• Client relations</Text>
        <Text style={styles.skillItem}>• Team oversight</Text>
        <Text style={styles.skillItem}>• Staff supervision</Text>
        <Text style={styles.skillItem}>
          • Contract development and management
        </Text>
        <Text style={styles.skillItem}>• Complex problem solving</Text>
        <Text style={styles.skillItem}>• Communication skills</Text>
        <Text style={styles.skillItem}>• Strategies and goals</Text>
        <Text style={styles.skillItem}>• Profit and loss accountability</Text>
        <Text style={styles.skillItem}>
          • Sales planning and implementation
        </Text>
      </View>

      <Text style={styles.sectionTitle}>LANGUAGES</Text>
      <View style={styles.languageContainer}>
        <View>
          <Text style={styles.languageText}>German:</Text>
          <Text style={styles.languageText}>Upper Intermediate (B2)</Text>
          <View style={styles.progressBarContainer}>
            <View style={{ ...styles.progressBar, width: "70%" }} />
          </View>
        </View>
        <View>
          <Text style={styles.languageText}>Italian:</Text>
          <Text style={styles.languageText}>Elementary (A2)</Text>
          <View style={styles.progressBarContainer}>
            <View style={{ ...styles.progressBar, width: "30%" }} />
          </View>
        </View>
      </View>
      <Text
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />

      <View
        render={({ pageNumber }) =>
          pageNumber % 2 === 0 && (
            <View style={{ backgroundColor: "red" }}>
              <Text>I'm only visible in odd pages!</Text>
            </View>
          )
        }
      />
    </Page>
  </Document>
);

// Create a component for the download link

export default Template1;
