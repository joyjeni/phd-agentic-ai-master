/** Official MSRUAS / FET research-proposal identity for Jenisha T. */
export const COLLEGE = {
  university: "M. S. Ramaiah University of Applied Sciences",
  universityShort: "MSRUAS",
  faculty: "FET (Faculty of Engineering and Technology)",
  facultyHeader: "Faculty of Engineering and Technology",
  facultyLine: "Faculty of Engineering and Technology, MSRUAS",
  department: "Computer Science and Engineering",
  departmentLine: "Department of Computer Science and Engineering",
  campus: "Bangalore",
  programme: "Ph.D. in Computer Science and Engineering",
  mode: "Part Time",
  scholar: "Jenisha T",
  registerNo: "24ETRP720001",
  supervisor: "Dr. Jyothi A P",
  registrationDate: "04-Sept-2024",
  email: "jenisha.t@msruas.ac.in",
  address: "#123, MSR Nagar, Bangalore. Phone: +91-XXXXXXXXXX",
  researchTopic: "Adaptive Context Reasoning System (ACRS)",
  kicker: "RESEARCH PROPOSAL",
  title:
    "Adaptive Context Reasoning System (ACRS): A Structural Orchestration Layer for Multi-Agent LLM Ecosystems",
  shortTitle: "Adaptive Context Reasoning System (ACRS)",
  subtitle: "A Structural Orchestration Layer for Multi-Agent LLM Ecosystems",
  maroon: "7C1D2E",
  gold: "C4A35A",
  cream: "FFFAF3",
  ink: "1A1214",
  muted: "5C4A4E",
  accent: "6B4C9A",
} as const;

export const PPTX_FILENAME = "ACRS_PhD_Proposal_JenishaT_24ETRP720001.pptx";
/** Copy named after the PRP template the scholar asked to reuse. */
export const PPTX_TEMPLATE_COPY = "Gowrishankar_PPT_PRP2_ACRS_JenishaT.pptx";
export const MD_FILENAME = "ACRS_PhD_Proposal_JenishaT_24ETRP720001.md";

export const STUDENT_DETAILS: { field: string; record: string }[] = [
  { field: "Full Name", record: COLLEGE.scholar },
  { field: "Registration Number", record: COLLEGE.registerNo },
  { field: "Date of Registration", record: COLLEGE.registrationDate },
  { field: "Department", record: COLLEGE.department },
  { field: "Faculty/School", record: COLLEGE.faculty },
  { field: "Course Type", record: COLLEGE.mode },
  { field: "Contact Address", record: COLLEGE.address },
  { field: "Email Address", record: COLLEGE.email },
  { field: "Research Topic", record: COLLEGE.researchTopic },
  { field: "Supervisor", record: COLLEGE.supervisor },
];
