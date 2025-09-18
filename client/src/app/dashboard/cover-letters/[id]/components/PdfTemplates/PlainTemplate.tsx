import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Custom font (optional)
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
    flexDirection: "row",
  },
  leftColumn: {
    width: "50%",
    paddingRight: 10,
    borderRight:"1px solid gray"
  },
  rightColumn: {
    width: "50%",
    paddingLeft: 10,
  },
  section: {
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  text: {
    marginBottom: 3,
  },
  contact: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000",
    borderBottom: "1px solid #ccc",
  },
  skills: {
    marginBottom: 20,
  },
  strengths: {
    marginBottom: 20,
  },
  languages: {
    marginBottom: 20,
  },
});

const PlainTemplate = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.leftColumn}>
        <View style={styles.section}>
          <Text style={styles.header}>John Aarts</Text>
          <Text>Customer Success Manager</Text>
        </View>

        <View style={styles.contact}>
          <Text style={styles.text}>📞 +1-952-140-6600</Text>
          <Text style={styles.text}>✉️ john.xander@gmail.com</Text>
          <Text style={styles.text}>🌍 Amsterdam, Netherlands</Text>
          <Text style={styles.text}>🔗 linkedin.com/@_XanderAarts__</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUMMARY</Text>
          <Text>
            Enthusiastic Customer Success Manager with seven years of
            experienceLorem, ipsum dolor sit amet consectetur adipisicing elit.
            Nemo dignissimos est perferendis tempore aspernatur. Velit unde
            consectetur, nobis tempora natus minus quibusdam deserunt sequi
            exercitationem nam ex enim atque ab?
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPERIENCE</Text>
          <Text style={styles.subHeader}>Senior Customer Success Manager</Text>
          <Text style={styles.text}>Blanchette</Text>
          <Text style={styles.text}>
            2017 - Ongoing | Amsterdam, Netherlands
          </Text>
          <Text style={styles.text}>
            - Achieved an average 115% Net Retention Rate (NRR)Lorem, ipsum
            dolor sit amet consectetur adipisicing elit. Nemo dignissimos est
            perferendis tempore aspernatur. Velit unde consectetur, nobis
            tempora natus minus quibusdam deserunt sequi exercitationem nam ex
            enim atque ab?
          </Text>
          <Text style={styles.text}>
            - Developed an end-user training curriculumLorem, ipsum dolor sit
            amet consectetur adipisicing elit. Nemo dignissimos est perferendis
            tempore aspernatur. Velit unde consectetur, nobis tempora natus
            minus quibusdam deserunt sequi exercitationem nam ex enim atque ab?
          </Text>
          <Text style={styles.text}>
            - Partnered with AE to grow book of business 25% YoYLorem, ipsum
            dolor sit amet consectetur adipisicing elit. Nemo dignissimos est
            perferendis tempore aspernatur. Velit unde consectetur, nobis
            tempora natus minus quibusdam deserunt sequi exercitationem nam ex
            enim atque ab?
          </Text>
          <Text style={styles.text}>
            - Managed an EMEA book of business of USD $2-2.5MLorem, ipsum dolor
            sit amet consectetur adipisicing elit. Nemo dignissimos est
            perferendis tempore aspernatur. Velit unde consectetur, nobis
            tempora natus minus quibusdam deserunt sequi exercitationem nam ex
            enim atque ab?
          </Text>

          <Text style={styles.subHeader}>Customer Success Manager</Text>
          <Text style={styles.text}>Dufour</Text>
          <Text style={styles.text}>2015 - 2017 | Amsterdam, Netherlands</Text>
          <Text style={styles.text}>
            - Achieved 100% retention rate and restored relationshipsLorem,
            ipsum dolor sit amet consectetur adipisicing elit. Nemo dignissimos
            est perferendis tempore aspernatur. Velit unde consectetur, nobis
            tempora natus minus quibusdam deserunt sequi exercitationem nam ex
            enim atque ab?
          </Text>
          <Text style={styles.text}>
            - Proactively managed customer relationshipsLorem, ipsum dolor sit
            amet consectetur adipisicing elit. Nemo dignissimos est perferendis
            tempore aspernatur. Velit unde consectetur, nobis tempora natus
            minus quibusdam deserunt sequi exercitationem nam ex enim atque ab?
          </Text>

          <Text style={styles.subHeader}>Sr. Customer Success Manager</Text>
          <Text style={styles.text}>Bernier</Text>
          <Text style={styles.text}>2011 - 2015 | Amsterdam, Netherlands</Text>
          <Text style={styles.text}>
            - Joined the company as employee #7Lorem, ipsum dolor sit amet
            consectetur adipisicing elit. Nemo dignissimos est perferendis
            tempore aspernatur. Velit unde consectetur, nobis tempora natus
            minus quibusdam deserunt sequi exercitationem nam ex enim atque ab?
          </Text>
          <Text style={styles.text}>
            - Managed book of business with 250 clientsLorem, ipsum dolor sit
            amet consectetur adipisicing elit. Nemo dignissimos est perferendis
            tempore aspernatur. Velit unde consectetur, nobis tempora natus
            minus quibusdam deserunt sequi exercitationem nam ex enim atque ab?
          </Text>
        </View>
      </View>

      <View style={styles.rightColumn}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EDUCATION</Text>
          <Text style={styles.subHeader}>Master of Sociology</Text>
          <Text style={styles.text}>University of Amsterdam</Text>
          <Text style={styles.text}>2013 - 2014 | Amsterdam</Text>

          <Text style={styles.subHeader}>Bachelor of Economics</Text>
          <Text style={styles.text}>University of Amsterdam</Text>
          <Text style={styles.text}>2009 - 2012 | Amsterdam</Text>
        </View>

        <View style={styles.skills}>
          <Text style={styles.sectionTitle}>SKILLS</Text>
          <Text style={styles.text}>CRM, Salesforce, NetSuite</Text>
          <Text style={styles.text}>MS Excel, Hubspot, Mailchimp</Text>
          <Text style={styles.text}>CI Tools, SimilarWeb</Text>
        </View>

        <View style={styles.strengths}>
          <Text style={styles.sectionTitle}>STRENGTHS</Text>
          <Text style={styles.subHeader}>Negotiation and presentation</Text>
          <Text style={styles.text}>
            Understanding negotiation dynamicsLorem, ipsum dolor sit amet
            consectetur adipisicing elit. Nemo dignissimos est perferendis
            tempore aspernatur. Velit unde consectetur, nobis tempora natus
            minus quibusdam deserunt sequi exercitationem nam ex enim atque ab?
          </Text>
          <Text style={styles.subHeader}>Research</Text>
          <Text style={styles.text}>
            Always prepared for the customerLorem, ipsum dolor sit amet
            consectetur adipisicing elit. Nemo dignissimos est perferendis
            tempore aspernatur. Velit unde consectetur, nobis tempora natus
            minus quibusdam deserunt sequi exercitationem nam ex enim atque ab?
          </Text>
          <Text style={styles.subHeader}>Customer Relationship</Text>
          <Text style={styles.text}>
            Always providing support to bothLorem, ipsum dolor sit amet
            consectetur adipisicing elit. Nemo dignissimos est perferendis
            tempore aspernatur. Velit unde consectetur, nobis tempora natus
            minus quibusdam deserunt sequi exercitationem nam ex enim atque ab?
          </Text>
        </View>

        <View style={styles.languages}>
          <Text style={styles.sectionTitle}>LANGUAGES</Text>
          <Text style={styles.subHeader}>English</Text>
          <Text style={styles.text}>Native</Text>
          <Text style={styles.subHeader}>Dutch</Text>
          <Text style={styles.text}>Proficient</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default PlainTemplate;
