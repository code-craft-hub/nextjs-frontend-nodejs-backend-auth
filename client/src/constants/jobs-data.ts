import { CgFileDocument } from "react-icons/cg";
import { IoSettingsOutline, IoBriefcaseOutline } from "react-icons/io5";
import { LayoutDashboard, LogOut, Database } from "lucide-react";
export const sidebarLinks = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/dashboard",
    label: "Home",
  },
  {
    imgURL: "/assets/icons/wallpaper.svg",
    route: "/dashboard/resume",
    label: "Resume",
  },
  {
    imgURL: "/assets/icons/people.svg",
    route: "/dashboard/letter",
    label: "Cover Letter",
  },
  {
    imgURL: "/assets/icons/bookmark.svg",
    route: "/dashboard/question",
    label: "Interview Question",
  },

  {
    imgURL: "/assets/icons/gallery-add.svg",
    route: "/dashboard/credit",
    label: "Credit",
  },
  {
    imgURL: "/assets/icons/gallery-add.svg",
    route: "/dashboard/account",
    label: "Account",
  },
  {
    imgURL: "/assets/icons/bookmark.svg",
    route: "/dashboard/profile",
    label: "Profile",
  },
];

export const plans = [
  {
    _id: 1,
    name: "Free",
    icon: "/assets/icons/free-plan.svg",
    price: 10,
    credits: 5,
    duration: "",
    row1: "Free",
    row2: "5 Credits",
    row3: "Resume builder",
    row4: "Cover Letter Generator",
    inclusions: [
      {
        label: "5 Credits",
        isIncluded: true,
      },
    ],
  },
  {
    _id: 2,
    name: "Daily Package",
    icon: "/assets/icons/free-plan.svg",
    price: 1000,
    credits: 10,
    duration: "day",
    plan: "basic",
    row1: "Resume builder",
    row2: "Cover Letter Generator",
    row3: "Interview Question Generator",
    row4: "Unlimited Access for a day",
    inclusions: [
      {
        label: "10 Credits",
        isIncluded: true,
      },
    ],
  },
  {
    _id: 3,
    name: "Weekly Package",
    icon: "/assets/icons/free-plan.svg",
    price: 5000,
    credits: 25,
    duration: "week",
    plan: "pro",
    row1: "Resume builder",
    row2: "Cover Letter Generator",
    row3: "Interview Question Generator",
    row4: "Unlimited Access for a week",
    inclusions: [
      {
        label: "25 Credits",
        isIncluded: true,
      },
    ],
  },
  {
    _id: 4,
    name: "Monthy Package",
    icon: "/assets/icons/free-plan.svg",
    price: 15000,
    credits: 50,
    duration: "month",
    plan: "enterprise",
    row1: "Resume builder",
    row2: "Cover Letter Generator",
    row3: "Interview Question Generator",
    row4: "Unlimited Access for a month",
    inclusions: [
      {
        label: "50 Credits",
        isIncluded: true,
      },
    ],
  },
];
export const navigation = [
  {
    name: "How it works",
    href: "howitworks",
  },
  {
    name: "Services",
    href: "services",
    icon: true,
  },
  {
    name: "Pricing",
    href: "pricing",
  },
  {
    name: "Templates",
    href: "template",
    icon: true,
  },
];

export const initialData: NewResumeTemplate = {
  resumeSample: "",
  uniqueUserObjects: [],
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  address: "",
  website: "",
  Profile: "",
  portfolio: "",
  cvJobTitle: "",
  educations: [],
  questions: [],
  coverLetterHistory: [],
  resumeHistory: [],
  skills: [],
  workExperiences: [],
};

export const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    // [{ font: [] }],
    // [{ size: [] }],
    ["bold", "italic", "underline"],
    [
      // { list: "ordered" },
      // { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    // ["link"],
  ],
};

export const dashboardCardsInfo = [
  {
    title: "RESUME | CV",
    img: "/assets/undraw/cv1.svg",
    id: 1,
    generated: 0,
  },
  {
    title: "COVER LETTER",
    img: "/assets/undraw/cover-letter.png",
    id: 2,
    generated: 0,
  },
  {
    title: "INTERVIEW QUESTION",
    img: "/assets/undraw/research.png",
    id: 3,
    generated: 0,
  },
];

export const tabs = [
  { id: "all", label: "All" },
  { id: "resume", label: "Resume" },
  { id: "coverletter", label: "Cover Letter" },
  { id: "question", label: "Interview Question" },
];
export const resumeTabs = [
  { id: "details", label: "Your Details" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
];

export const dashboardSliderContent = [
  {
    img: "/assets/icons/blueDocs.svg",
    title: "Total Resumes Generated",
    total: "0",
    link: "/dashboard/resume",
  },
  {
    img: "/assets/icons/cl.svg",
    title: "Total Cover Letter Generated",
    total: "0",
    link: "/dashboard/letter",
  },
  {
    img: "/assets/icons/questions.svg",
    title: "Total Interview Question.",
    total: "0",
    link: "/dashboard/question",
  },
];

export type IDashboardSliderContent = typeof dashboardSliderContent;

export const menuItems = [
  {
    title: "Home Page",
    icon: LayoutDashboard,
    link: "/",
  },
  {
    title: "All Resumes",
    icon: Database,
    link: "/dashboard/resume/all_resumes",
  },
  {
    title: "Job Listings",
    icon: IoBriefcaseOutline,
    link: "/dashboard/job-listings",
  },
  {
    title: "Account",
    icon: IoSettingsOutline,
    link: "/dashboard/account",
  },
  {
    title: "Profiles",
    icon: CgFileDocument,
    link: "/dashboard/profile",
  },
  {
    title: "Logout",
    icon: LogOut,
    last: true,
  },
];

export const Reviews = [
  {
    img: "/assets/images/woman.png",
    rating: "/assets/images/rating.png",
    title: "CverAI has been a game changer for me",
    des: `The AI-generated cover letters and resumes were top-notch, tailored perfectly to the job descriptions I provided. Within weeks of using it, I landed multiple interview calls. I truly believe the quality of the documents gave me an edge and helped me secure my new job. Highly recommend!`,
  },
  {
    img: "/assets/images/businesswoman.png",
    rating: "/assets/images/rating.png",
    title: "Resume | CV with ease. cverai is the best.",
    des: `I was struggling with writing a resume that stood out, but CverAI made the whole process effortless. The interview questions it generated were spot-on, and I felt completely prepared going into each interview. Thanks to this platform, I now have a job I love! It's like having a personal career coach.`,
  },
  {
    img: "/assets/images/manonsuit.png",
    rating: "/assets/images/rating.png",
    title: "Reasume creation made easy.",
    des: `Honestly, I didn't expect much from an AI tool, but CverAI completely exceeded my expectations. The CV and cover letter it created for me were professional, detailed, and exactly what recruiters are looking for. After months of job searching, I finally received an offer, and I know CverAI played a huge part in that success!`,
  },
];

export const userDocDefaultInfo = [
  {
    id: 0,
    fullName: "Mark Kings",
    icon: "assets/icons/software-engineer.svg",
    title: "Software Engineer",
    profile:
      "A Software Engineer is a skilled professional responsible for designing, developing, testing, and maintaining software applications and systems. They work with a variety of programming languages, frameworks, and tools to create efficient, scalable, and user-friendly solutions. Software engineers collaborate with cross-functional teams, including product managers, designers, and QA specialists, to ensure that software meets both functional and non-functional requirements. They are proficient in debugging, troubleshooting, and optimizing code to ensure high performance and reliability. Software engineers follow best practices in software development methodologies, such as Agile and DevOps, to improve project timelines and deliver quality results. They are also adept at documenting code and processes to ensure maintainability and future scalability. Continual learning is essential, as they must stay updated with new technologies, industry trends, and best practices to remain competitive in a rapidly evolving field.",
    jobdescription: `We are seeking a passionate and skilled Software Engineer to design, develop, and optimize software solutions. The ideal candidate holds a Bachelor's degree in Computer Science, Software Engineering, or a related field, and has 3+ years of professional experience in full-stack development. Responsibilities include writing clean, maintainable code using languages such as Python, JavaScript, or Java, designing scalable backend systems, and collaborating with cross-functional teams to deliver user-centric solutions. Proficiency with modern frameworks (React, Django, Node.js) and cloud technologies (AWS, Azure) is essential.The candidate should have a proven track record of working on complex projects, such as building e-commerce platforms or data-driven applications. Familiarity with DevOps practices, CI/CD pipelines, and agile methodologies is highly desired.Soft skills include problem-solving, strong communication, and teamwork. Passion for learning and adapting to emerging technologies will set candidates apart. Join us in delivering innovative solutions that drive impact!`,
  },
  {
    id: 1,
    fullName: "Emily Carter",
    icon: "assets/icons/financial-analyst.svg",
    title: "Financial Analyst",
    profile: `Emily Carter is a seasoned Financial Analyst with over 5 years of experience in delivering insightful financial reporting and driving strategic growth. She holds a Bachelor’s degree in Finance from the University of Chicago and is a CFA Level II candidate.

Emily specializes in building robust financial models, analyzing market trends, and providing data-backed recommendations to optimize profitability. She is proficient in financial tools such as Excel, SAP, and Power BI, and has extensive experience collaborating with teams to align budgets with company goals.

Known for her meticulous attention to detail and problem-solving skills, Emily excels at identifying opportunities for cost reduction and revenue growth. She is passionate about leveraging her financial acumen to create value for organizations and stakeholders.`,
    jobdescription: `
Job Description: Financial Analyst
We are seeking a detail-oriented and results-driven Financial Analyst to join our dynamic team. The ideal candidate will analyze financial data, prepare forecasts, and provide actionable insights to support strategic decision-making.

Key responsibilities include developing financial models, conducting variance analysis, preparing budgets, and creating detailed reports for stakeholders. The role involves working with cross-functional teams to evaluate investment opportunities, assess financial risks, and track key performance indicators (KPIs).

A Bachelor's degree in Finance, Accounting, or Economics is required, with 3-5 years of experience in financial planning, investment analysis, or similar roles. Advanced Excel skills, proficiency with financial software (e.g., SAP, QuickBooks), and knowledge of data visualization tools (e.g., Tableau, Power BI) are essential. A CFA or CPA certification is a strong advantage.

The successful candidate will possess strong analytical skills, attention to detail, and excellent communication abilities to convey complex financial data effectively.`,
  },
  {
    id: 2,
    fullName: "Sarah Mitchell",
    icon: "assets/icons/marketing.svg",
    title: "Marketing Manager",
    profile: `Sarah Mitchell is a results-driven Marketing Manager with over 8 years of experience leading high-impact campaigns and driving revenue growth. She holds a Bachelor's degree in Marketing from the University of California, Los Angeles (UCLA). Throughout her career, Sarah has spearheaded digital transformation initiatives, managed cross-functional teams, and consistently delivered measurable results.

Her expertise lies in creating data-driven strategies, optimizing digital marketing channels, and building strong brand identities. Sarah excels in team leadership, budget management, and fostering collaboration between marketing and sales teams. Passionate about innovation, she stays ahead of industry trends to deliver exceptional value. Sarah thrives in dynamic environments and is committed to achieving business excellence through strategic marketing leadership.`,
    jobdescription: `Job Description: Marketing Manager
We are seeking an experienced and innovative Marketing Manager to lead our marketing initiatives and drive brand growth. The ideal candidate will develop and implement strategic marketing plans, oversee digital campaigns, and analyze performance metrics to optimize results.

Responsibilities:

Develop and execute comprehensive marketing strategies that align with business objectives.
Lead a team of marketing professionals to execute campaigns across multiple channels, including digital, social media, email, and traditional media.
Conduct market research to identify trends, customer preferences, and competitive insights.
Manage budgets and allocate resources effectively to maximize ROI.
Collaborate with sales and product teams to ensure alignment and drive revenue growth.
Analyze campaign performance metrics and prepare reports with actionable insights.
Requirements:

Bachelor's degree in Marketing, Business Administration, or a related field.
5+ years of experience in marketing management, preferably in a leadership role.
Proven expertise in digital marketing strategies, SEO/SEM, and social media advertising.
Strong analytical skills with the ability to interpret data and make data-driven decisions.
Excellent leadership, communication, and organizational abilities.`,
  },
  {
    id: 3,
    fullName: "Sophia Mitchell",
    icon: "assets/icons/nurse.svg",
    title: "Registered Nurse",
    profile: `Sophia Mitchell is a licensed Registered Nurse with over 5 years of experience in providing exceptional patient care in both hospital and outpatient settings. She specializes in acute care and patient education, ensuring a holistic approach to treatment. Sophia is skilled in administering medications, managing complex care plans, and collaborating with interdisciplinary teams to optimize patient outcomes.

She holds a Bachelor of Science in Nursing (BSN) from the University of Illinois and is certified in Advanced Cardiac Life Support (ACLS). With a strong focus on empathy and patient advocacy, Sophia is dedicated to delivering compassionate care and improving the quality of life for her patients.`,
    jobdescription: `Job Description: Nurse

We are looking for a compassionate and dedicated Nurse to join our healthcare team. The ideal candidate will provide high-quality patient care, administer medications, and collaborate with physicians to create and implement care plans. Responsibilities include monitoring patient progress, performing routine medical procedures, educating patients and families about treatments, and maintaining accurate medical records.

The candidate should hold a Bachelor of Science in Nursing (BSN) or an Associate Degree in Nursing (ADN) with an active RN license. A minimum of 2 years of clinical experience in a hospital or healthcare setting is preferred. Proficiency in electronic health record (EHR) systems and familiarity with medical equipment are essential. Specialized certifications (e.g., ACLS, PALS) are a plus.

This role requires excellent communication, critical thinking, and interpersonal skills. A passion for patient advocacy and a commitment to ongoing professional development are essential to succeed in this role.`,
  },
];

export const moreJobInfo = [
  {
    id: 4,
    fullName: "John Doe",
    icon: "📹",
    title: "Content Creator",
    profile: `Content Creator profile description: An innovative content creator with a passion for storytelling and engaging audiences across diverse platforms. Skilled in video production, social media management, and brand communication.`,
    jobdescription: `Content Creator job description: Responsible for creating, editing, and publishing high-quality content for digital platforms. Works collaboratively with marketing and design teams to develop campaigns, optimize audience engagement, and maintain brand voice.`,
  },
  {
    id: 5,
    fullName: "Jane Smith",
    icon: "🤝",
    title: "Human Resource Manager",
    profile: `Human Resource Manager profile description:  An experienced Human Resource Manager with a proven track record of developing and implementing HR strategies to enhance organizational growth and employee satisfaction.`,
    jobdescription: `Human Resource Manager job description:  Oversees recruitment, training, employee relations, and performance management. Ensures compliance with labor laws, fosters a positive workplace culture, and aligns HR practices with business goals.`,
  },
  {
    id: 6,
    fullName: "Michael Brown",
    icon: "📋",
    title: "Project Manager",
    profile: `Project Manager profile description:  A results-driven Project Manager with expertise in leading cross-functional teams to deliver projects on time and within budget. Adept at planning, resource allocation, and risk management.`,
    jobdescription: `Project Manager job description:  Responsible for planning, executing, and delivering projects while managing resources, timelines, and stakeholder expectations. Ensures adherence to quality standards and facilitates project communication.`,
  },
  {
    id: 7,
    fullName: "Emily White",
    icon: "🏛️",
    title: "Architect",
    profile: `Architect profile description:  A creative and detail-oriented Architect with a passion for designing functional and aesthetically pleasing spaces. Proficient in CAD software, project planning, and sustainable design principles.`,
    jobdescription: `Architect job description:  Designs and oversees the construction of buildings and structures, ensuring functionality, safety, and aesthetic appeal. Collaborates with clients, engineers, and contractors to bring architectural visions to life.`,
  },
];
