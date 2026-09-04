import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  GraduationCap,
  Briefcase,
  BookOpen,
  Clock,
  CheckCircle2,
  ShieldCheck,
  RotateCw,
  Home,
  Bus,
  Trophy,
  MessageSquare,
  FileCheck,
  Bot,
  Settings as SettingsIcon,
  Award,
  Sparkles,
  IndianRupee,
  User,
  LayoutDashboard,
} from "lucide-react";

// Module Roadmap Definitions based on pathname
const moduleConfigs = {
  academics: {
    section: "Academics",
    title: "Academic Portal & LMS",
    icon: GraduationCap,
    gradient: "from-blue-600 to-indigo-700",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    features: [
      { title: "Real-Time Attendance Tracking", desc: "Detailed subject-wise breakdown & monthly percentage reports." },
      { title: "Smart Class Timetable", desc: "Interactive weekly lecture schedules & classroom locations." },
      { title: "Course Registration & LMS", desc: "Syllabus, recorded lectures & course material access." },
      { title: "Assignments & Quizzes Portal", desc: "Online assignment submission with instant plagiarism check." },
    ],
  },
  attendance: {
    section: "Attendance",
    title: "Smart Attendance Tracker",
    icon: GraduationCap,
    gradient: "from-blue-600 to-indigo-700",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    features: [
      { title: "Subject-wise Attendance", desc: "Real-time lecture attendance with percentage analytics." },
      { title: "Monthly Attendance Reports", desc: "Downloadable attendance ledger for academic compliance." },
      { title: "Shortage Alerts & Medical Leave", desc: "Automated SMS/Email notification for minimum attendance criteria." },
      { title: "Biometric & RFID Sync", desc: "Direct integration with classroom RFID and biometric scanners." },
    ],
  },
  timetable: {
    section: "Timetable",
    title: "Interactive Class Timetable",
    icon: GraduationCap,
    gradient: "from-indigo-600 to-purple-700",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    features: [
      { title: "Weekly Lecture Schedule", desc: "Complete period-by-period class timetable with faculty info." },
      { title: "Classroom & Lab Locations", desc: "Room numbers and floor mapping for lectures and practicals." },
      { title: "Live Substitute Notifications", desc: "Instant updates when lectures are rescheduled or substituted." },
      { title: "Sync to Google Calendar", desc: "One-click synchronization with your personal smartphone calendar." },
    ],
  },
  examination: {
    section: "Examination",
    title: "Examination & Assessment Portal",
    icon: Award,
    gradient: "from-amber-600 to-orange-700",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    features: [
      { title: "Digital Admit Card / Hall Ticket", desc: "Instant downloadable hall ticket with QR verification." },
      { title: "Online Exam Form Submission", desc: "Automated paper selection and semester registration." },
      { title: "Internal Marks & Grade Cards", desc: "SGPA / CGPA scorecards with verified digital signature." },
      { title: "Revaluation & Scrutiny Portal", desc: "Paper re-checking request with online fee payment." },
    ],
  },
  results: {
    section: "Examination",
    title: "Exam Results & Marksheets",
    icon: Award,
    gradient: "from-amber-600 to-orange-700",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    features: [
      { title: "Semester Grade Cards", desc: "Download official SGPA/CGPA grade sheets." },
      { title: "Detailed Subject Breakdown", desc: "Theory, practical, and internal score breakdown." },
      { title: "Official Transcript Request", desc: "Order stamped university transcripts online." },
      { title: "Rank & Percentile Analytics", desc: "Batch ranking and percentile visualization." },
    ],
  },
  placement: {
    section: "Placement & Career",
    title: "Placement & Career Development",
    icon: Briefcase,
    gradient: "from-purple-600 to-indigo-700",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    features: [
      { title: "Live Campus Recruitment Drives", desc: "Direct applications to visiting MNCs, startups & IT giants." },
      { title: "AI-Powered Resume Builder", desc: "TPO-approved ATS-friendly resume creation & scoring." },
      { title: "Internship & Apprenticeship Hub", desc: "Paid summer internships & stipend management." },
      { title: "Mock Technical & HR Interviews", desc: "Automated practice sessions with alumni & faculty mentors." },
    ],
  },
  placements: {
    section: "Placement & Career",
    title: "Placement Drives & Companies",
    icon: Briefcase,
    gradient: "from-purple-600 to-indigo-700",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    features: [
      { title: "Visiting Recruiter Directory", desc: "List of participating top-tier companies and eligibility criteria." },
      { title: "Online Aptitude Tests", desc: "Integrated test platform for recruitment rounds." },
      { title: "Offer Letter Repository", desc: "Secure digital storage of offer letters and contracts." },
      { title: "Alumni Career Mentorship", desc: "Connect with placed alumni for guidance and referrals." },
    ],
  },
  resume: {
    section: "Placement & Career",
    title: "Resume Builder & AI Review",
    icon: Briefcase,
    gradient: "from-purple-600 to-indigo-700",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    features: [
      { title: "ATS-Compliant Templates", desc: "Industry-standard resume formats tailored for campus drives." },
      { title: "AI Score & Feedback", desc: "Automated keyword and formatting enhancement tips." },
      { title: "Single-Click PDF Export", desc: "Generate print-ready PDFs with one click." },
      { title: "Direct TPO Verification", desc: "Faculty review and verification of credentials." },
    ],
  },
  library: {
    section: "Central Library",
    title: "Digital Library & Book Catalog",
    icon: BookOpen,
    gradient: "from-emerald-600 to-teal-700",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    features: [
      { title: "Online Book Catalog Search", desc: "Search 50,000+ physical and digital titles with availability." },
      { title: "Issued Books Ledger", desc: "Track currently borrowed books, due dates & renewal options." },
      { title: "Previous Year Question Papers", desc: "Download AKU Patna question banks & solutions." },
      { title: "E-Journals & IEEE Access", desc: "Direct access to international scientific journals." },
    ],
  },
  hostel: {
    section: "Hostel & Housing",
    title: "Hostel & Mess Management",
    icon: Home,
    gradient: "from-rose-600 to-pink-700",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    features: [
      { title: "Digital Room Allocation", desc: "Room details, roommate profiles & inventory ledger." },
      { title: "Weekly Mess Menu & Ratings", desc: "Daily nutritious meal plans with feedback and ratings." },
      { title: "Digital Outing & Leave Pass", desc: "Parent-approved online night gate passes." },
      { title: "Hostel Maintenance & Grievances", desc: "Fast-track ticket system for electrical, plumbing & Wi-Fi." },
    ],
  },
  transport: {
    section: "Campus Transport",
    title: "Transport & Bus Pass Services",
    icon: Bus,
    gradient: "from-cyan-600 to-blue-700",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    features: [
      { title: "Digital QR Bus Pass", desc: "Instant smartphone bus pass with QR code validator." },
      { title: "Live GPS Bus Tracking", desc: "Real-time location of college buses on map with ETA." },
      { title: "Route & Stop Information", desc: "Complete route schedules, timings and driver contact info." },
      { title: "Transport Fee Receipts", desc: "Online pass renewal and instant digital payment slips." },
    ],
  },
  activities: {
    section: "Student Activities",
    title: "Clubs, Sports & Events Hub",
    icon: Trophy,
    gradient: "from-amber-500 to-red-600",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    features: [
      { title: "Cultural & Tech Fest Events", desc: "Register for intra & inter-college competitions." },
      { title: "Clubs & Societies Directory", desc: "Join Robotics, Coding, Drama, Music and Literary clubs." },
      { title: "Sports & Athletics Booking", desc: "Ground reservations, tournaments and sports kits." },
      { title: "E-Certificates Repository", desc: "Verifiable certificates for extracurricular accomplishments." },
    ],
  },
  communication: {
    section: "Communication Hub",
    title: "Notices, Faculty & Mentor Connect",
    icon: MessageSquare,
    gradient: "from-violet-600 to-indigo-700",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
    features: [
      { title: "Official Notice Board", desc: "Instant circulars from registrar, examination & HODs." },
      { title: "Direct Chat with Faculty", desc: "Subject query resolution with your respective professors." },
      { title: "1-on-1 Mentor Guidance", desc: "Schedule counseling and academic mentoring meetings." },
      { title: "Campus Help Desk", desc: "24/7 student grievance support with tracking ticket ID." },
    ],
  },
  documents: {
    section: "Digital Documents",
    title: "Document Vault & DigiLocker",
    icon: FileCheck,
    gradient: "from-teal-600 to-emerald-700",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    features: [
      { title: "Government DigiLocker Integration", desc: "Pull verified Aadhaar, 10th, 12th & caste certificates." },
      { title: "Online Bonafide & NOC Request", desc: "Instant generation of college bonafide & recommendation letters." },
      { title: "Academic Document Vault", desc: "Secure encrypted storage for admission proofs and ID cards." },
      { title: "One-Click PDF Download", desc: "Authorized institutional stamps on verified documents." },
    ],
  },
  "ai-hub": {
    section: "AI Learning Hub",
    title: "AI Study Planner & Doubt Solver",
    icon: Bot,
    gradient: "from-fuchsia-600 to-purple-700",
    badgeColor: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    features: [
      { title: "24/7 AI Academic Doubt Solver", desc: "Instant conceptual explanations and formula walkthroughs." },
      { title: "Personalized AI Study Timetable", desc: "Adaptive revision schedules based on your exam syllabus." },
      { title: "Smart Lecture Notes Summarizer", desc: "Transform long PPTs and textbook chapters into revision notes." },
      { title: "Mock Exam Quiz Generator", desc: "AI generated multiple choice and subjective practice papers." },
    ],
  },
  settings: {
    section: "Account Settings",
    title: "Profile & Security Settings",
    icon: SettingsIcon,
    gradient: "from-slate-700 to-slate-900",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    features: [
      { title: "Password & Credential Management", desc: "Update login password and linked mobile verification." },
      { title: "Two-Factor Authentication (2FA)", desc: "Enhanced account security via SMS OTP or Google Authenticator." },
      { title: "Notification Preferences", desc: "Choose SMS, WhatsApp or Email notification alerts." },
      { title: "UI Theme & Accessibility", desc: "Dark mode, high contrast and regional language options." },
    ],
  },
};

export default function ComingSoonSection({
  title: propTitle,
  section: propSection,
  subtitle = "Sarvadnya Vidyapeeth ERP Portal",
}) {
  const location = useLocation();

  // Auto-determine section and details from URL path
  const path = location.pathname.toLowerCase();
  
  let detectedKey = Object.keys(moduleConfigs).find((key) => path.includes(key));
  if (!detectedKey) {
    if (path.includes("fee")) detectedKey = null; // fee is active
    else if (path.includes("notices") || path.includes("faculty-query")) detectedKey = "communication";
    else if (path.includes("academic-calendar")) detectedKey = "academics";
    else if (path.includes("library-ledger") || path.includes("library-rules")) detectedKey = "library";
  }

  const activeConfig = (detectedKey && moduleConfigs[detectedKey]) || {
    section: propSection || "Campus ERP Module",
    title: propTitle || "Feature Under Development",
    icon: Sparkles,
    gradient: "from-purple-600 to-indigo-700",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    features: [
      { title: "Real-Time System Synchronization", desc: "Live integration with the central Sarvadnya database." },
      { title: "Instant Notification Delivery", desc: "Direct SMS & ERP portal push notifications on updates." },
      { title: "Optimized High-Speed Experience", desc: "Fast-loading mobile and desktop optimized interface." },
      { title: "Secure & Verified Access", desc: "Role-based encryption protecting student credentials." },
    ],
  };

  const SectionIcon = activeConfig.icon;

  return (
    <div className="min-h-[84vh] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50 via-purple-50/30 to-white rounded-3xl border border-purple-100/80 shadow-sm relative overflow-hidden text-slate-800">
      {/* Background Decorative Glow Circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-200/15 via-transparent to-indigo-200/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="max-w-3xl w-full text-center space-y-6 relative z-10 my-auto"
      >
        {/*  Official Institutional Logo with Glowing Animated Rings  */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative flex items-center justify-center my-1">
            {/* Outer Circular Rotating Dash Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute -inset-5 sm:-inset-6 rounded-full border-2 border-dashed border-purple-500/50 pointer-events-none"
            />
            {/* Middle Rotating Gradient Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
              className="absolute -inset-2.5 sm:-inset-3 rounded-full border-2 border-purple-300/50 border-t-purple-600 pointer-events-none"
            />
            
            {/* Main Logo Container */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white p-2.5 border-2 border-purple-200 shadow-2xl shadow-purple-300/40 flex items-center justify-center z-10 group">
              <img
                src="/images/Logo/logo.webp"
                alt="Sarvadnya Vidyapeeth Logo"
                className="w-full h-full object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/sarvadnya_logo.jpg";
                }}
              />
            </div>

            {/* Floating Module Icon Badge */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className={`absolute -bottom-2 -right-2 w-11 h-11 rounded-2xl bg-gradient-to-br ${activeConfig.gradient} text-white flex items-center justify-center shadow-lg border-2 border-white z-20`}
            >
              <SectionIcon className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Institution Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/90 border border-purple-200/80 text-purple-900 text-xs font-bold tracking-wide shadow-xs mt-1">
            <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
            <span>Sarvadnya Vidyapeeth ERP</span>
          </div>
        </div>

        {/*  Big COMING SOON Banner with Hindi & English Clarity  */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold shadow-xs">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-600" />
            </motion.div>
            <span>Under Active Development - Upcoming Module</span>
          </div>

          {/* Big COMING SOON Heading */}
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-900 bg-clip-text text-transparent drop-shadow-xs">
            COMING SOON
          </h1>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {activeConfig.title}
          </h2>

          {/* Clear Hindi & English Explanatory Note */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 max-w-xl mx-auto text-center space-y-1 shadow-xs">
            <p className="text-sm font-bold text-amber-950 leading-relaxed">This feature is currently under active development and will be enabled in upcoming releases.</p>
            <p className="text-xs text-amber-800 font-medium">
              Please use the active modules (Dashboard, My Profile, and Fee Details) from the sidebar navigation.
            </p>
          </div>
        </div>

        {/*  Feature Roadmap Highlights  */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-md text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeConfig.gradient} text-white flex items-center justify-center shadow-md shrink-0`}>
                <SectionIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  {activeConfig.section} Features Preview
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  What will be included in this upcoming module
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${activeConfig.badgeColor}`}>
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Release: Next Update
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {activeConfig.features.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/80 hover:bg-purple-50/60 border border-slate-100 hover:border-purple-200/80 transition-all duration-200 group"
              >
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-purple-950">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5 font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*  Active Portal Action Buttons  */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/student-dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>

          <Link
            to="/student-dashboard/fees/receipts"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white text-xs font-black shadow-md hover:shadow-purple-200 transition-all active:scale-95"
          >
            <IndianRupee className="w-4 h-4" />
            <span>Open Fee Portal</span>
          </Link>

          <Link
            to="/student-dashboard/profile"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 text-xs font-black shadow-xs hover:shadow-sm transition-all active:scale-95"
          >
            <User className="w-4 h-4 text-purple-600" />
            <span>My Profile</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

