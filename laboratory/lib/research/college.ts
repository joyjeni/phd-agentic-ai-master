/** Official MSRUAS / FET research-proposal identity for Jenisha T. */

export function slideDate(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${month}/${day}/${now.getFullYear()}`;
}

export const COLLEGE = {
  university: "M. S. Ramaiah University of Applied Sciences",
  universityShort: "MSRUAS",
  faculty: "FET (Faculty of Engineering and Technology)",
  facultyHeader: "Faculty of Engineering and Technology",
  facultyLine: "Faculty of Engineering and Technology, MSRUAS",
  department: "Computer Science and Engineering",
  departmentLine: "Department of Computer Science and Engineering",
  campus: "Bangalore",
  campusAddress: "Gnanagangothri Campus, New BEL Road, MSR Nagar, Bangalore – 560054",
  programme: "Ph.D. in Computer Science and Engineering",
  mode: "Part Time",
  scholar: "Jenisha T",
  registerNo: "24ETRP720001",
  supervisor: "Dr. Jyothi A P",
  registrationDate: "04-Sept-2024",
  email: "jenisha.t@msruas.ac.in",
  address: "#123, MSR Nagar, Bangalore. Phone: +91-XXXXXXXXXX",
  researchTopic: "Adaptive Context Reasoning System (ACRS)",
  kicker: "PHD Research Problem Formulation Presentation",
  presentationType: "PHD Research Problem Formulation Presentation",
  website: "WWW.MSRUAS.AC.IN",
  office: "Office of Research and Innovations",
  legalEstablished:
    "[Established as a Private University under an Act of Government of Karnataka vide Notification No. ED103UNE 2013 Dated 30 December 2013]",
  legalUgc: "Recognized by UGC U/S 2(f)of the UGC Act, 1956",
  logoSrc: "/college/ruas-logo.png",
  campusPhotoSrc: "/college/campus-about.jpg",
  campusEngineeringSrc: "/college/campus-coe-slide.jpg",
  title:
    "Adaptive Context Reasoning System (ACRS): A Structural Orchestration Layer for Multi-Agent LLM Ecosystems",
  shortTitle: "Adaptive Context Reasoning System (ACRS)",
  subtitle: "A Structural Orchestration Layer for Multi-Agent LLM Ecosystems",
  /** Gowrishankar PRP chrome: navy from the wordmark. */
  navy: "1B1464",
  /** Gowrishankar title-slide / underline / slide-number box. */
  purple: "3A1C64",
  /** Light-blue edge bars on content slides. */
  sideBar: "5B9BD5",
  rowTint: "E9EFF7",
  dateGray: "9AA3AE",
  white: "FFFFFF",
  /** Aliases used by diagrams and older table fills — same purple, not cream/maroon. */
  maroon: "3A1C64",
  gold: "C4A35A",
  cream: "FFFFFF",
  ink: "1A1A1A",
  muted: "5A5A5A",
  accent: "3A1C64",
} as const;

export const PPTX_FILENAME = "ACRS_PhD_Proposal_JenishaT_24ETRP720001.pptx";
/** Copy named after the PRP template the scholar asked to reuse. */
export const PPTX_TEMPLATE_COPY = "Gowrishankar_PPT_PRP2_ACRS_JenishaT.pptx";
export const MD_FILENAME = "ACRS_PhD_Proposal_JenishaT_24ETRP720001.md";

export const STUDENT_DETAILS: { field: string; record: string }[] = [
  { field: "Full Name", record: COLLEGE.scholar },
  { field: "Registration Number", record: COLLEGE.registerNo },
  { field: "Date of Registration", record: COLLEGE.registrationDate },
  { field: "Department of", record: COLLEGE.department },
  { field: "Faculty/School of", record: COLLEGE.faculty },
  { field: "Course Type", record: COLLEGE.mode },
  { field: "Contact Address and Phone Numbers", record: COLLEGE.address },
  { field: "Email Address", record: COLLEGE.email },
  { field: "Research Topic", record: COLLEGE.researchTopic },
  { field: "Supervisors & Advisors", record: COLLEGE.supervisor },
];
