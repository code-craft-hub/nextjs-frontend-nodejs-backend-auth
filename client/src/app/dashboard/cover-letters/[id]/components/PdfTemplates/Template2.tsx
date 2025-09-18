import { Page, Text, View, Document, StyleSheet, Font, Image, PDFDownloadLink } from '@react-pdf/renderer';

// Register custom font
Font.register({
  family: 'Lato',
  src: `${window.location.origin}/fonts/Lato.woff2`,
});

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 20,
  },
  sidebar: {
    width: '35%',
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  content: {
    width: '65%',
    padding: 20,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  title: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    borderBottom: '1px solid #E5E5E5',
    paddingBottom: 5,
  },
  contactItem: {
    fontSize: 10,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBold: {
    fontWeight: 'bold',
  },
  textMuted: {
    color: '#888',
  },
  listItem: {
    marginBottom: 10,
  },
});

// Create Document Component
const MyDocument = () => (
  <Document pageMode='fullScreen'>
    <Page size="A4" style={styles.page}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <Image style={styles.image} src="path/to/your/image.jpg" />
        <Text style={styles.name}>Dani Martinez</Text>
        <Text style={styles.title}>Marketing Manager</Text>
        
        <Text style={styles.sectionHeader}>CONTACT ME</Text>
        <View style={styles.contactItem}>
          <Text>📞 +123-456-7890</Text>
        </View>
        <View style={styles.contactItem}>
          <Text>📧 hello@reallygreatsite.com</Text>
        </View>
        <View style={styles.contactItem}>
          <Text>🌐 www.reallygreatsite.com</Text>
        </View>
        <View style={styles.contactItem}>
          <Text>🏠 123 Anywhere St., Any City, ST 12345</Text>
        </View>

        <Text style={styles.sectionHeader}>EDUCATION</Text>
        <Text style={styles.listItem}>Course Studied</Text>
        <Text style={styles.textMuted}>University/College Details</Text>
        <Text style={styles.textMuted}>2006 - 2008</Text>

        <Text style={styles.sectionHeader}>SKILLS</Text>
        <Text style={styles.listItem}>UI/UX</Text>
        <Text style={styles.listItem}>Visual Design</Text>
        <Text style={styles.listItem}>Wireframes</Text>
        <Text style={styles.listItem}>Storyboards</Text>
        <Text style={styles.listItem}>User Flows</Text>
        <Text style={styles.listItem}>Process Flows</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.sectionHeader}>WORK EXPERIENCE</Text>
        <View style={styles.listItem}>
          <Text style={styles.textBold}>Job position here</Text>
          <Text style={styles.textMuted}>2019 - 2022</Text>
          <Text style={styles.textBold}>Company Name | Location</Text>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pharetra in lorem at laoreet.
            Mauris convallis, mi at mattis malesuada, neque nulla volutpat dolor, hendrerit faucibus eros nibh ut nunc.
          </Text>
        </View>

        <View style={styles.listItem}>
          <Text style={styles.textBold}>Job position here</Text>
          <Text style={styles.textMuted}>2017 - 2019</Text>
          <Text style={styles.textBold}>Company Name | Location</Text>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pharetra in lorem at laoreet.
            Mauris convallis, mi at mattis malesuada, neque nulla volutpat dolor, hendrerit faucibus eros nibh ut nunc.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>REFERENCES</Text>
        <View style={styles.listItem}>
          <Text style={styles.textBold}>Harumi Kobayashi</Text>
          <Text style={styles.textMuted}>Wardiere Inc. / CEO</Text>
          <Text>Phone: 123-456-7890</Text>
          <Text>Email: hello@reallygreatsite.com</Text>
        </View>

        <View style={styles.listItem}>
          <Text style={styles.textBold}>Bailey Dupont</Text>
          <Text style={styles.textMuted}>Wardiere Inc. / CEO</Text>
          <Text>Phone: 123-456-7890</Text>
          <Text>Email: hello@reallygreatsite.com</Text>
        </View>
      </View>
    </Page>
  </Document>
);

const Template2 = () => (
  <PDFDownloadLink document={<MyDocument />} fileName="resume.pdf">
    {({ loading }) =>
      loading ? 'Loading document...' : 'Download PDF Template2'
    }
  </PDFDownloadLink>
);

export default Template2;
