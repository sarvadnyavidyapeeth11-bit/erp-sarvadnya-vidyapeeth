import React, { useState, useRef, useEffect, useCallback } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  ClipboardList,
  FileText,
  IndianRupee,
  CreditCard,
  Receipt,
  BookMarked,
  User,
  CalendarDays,
  Bell,
  Phone,
  Briefcase,
  FileUp,
  Info,
  BookOpenCheck,
  BookCopy,
  Scale,
  MessageSquare,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Settings as SettingsIcon,
  BarChart3,
  CheckCheck,
  Trash2,
  Megaphone,
  CalendarCheck,
  Clock as ClockIcon,
  Home,
  Utensils,
  Bus,
  Trophy,
  ShieldCheck,
  Sparkles,
  Bot,
  Layers,
  Building,
  RotateCcw,
  Compass,
  LifeBuoy,
  Percent
} from "lucide-react";

import StudentDashboardPage from "./dashboard/StudentDashboardPage";
import FeeDetailsPage from "./fees/FeeDetailsPage";
import ProfilePage from "./profile/ProfilePage";
import ComingSoonSection from "../../components/comingSoon/ComingSoonSection";

import { getActiveStudentProfile } from "../../hooks/studentPortalData";
import { getStudentVerifications } from "../../hooks/adminData";
import { NotificationProvider, useNotifications } from "../../components/common/NotificationContext";

/* -- Notification type to icon & color mapping -- */
const notifTypeConfig = {
  exam_form: { icon: FileText, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200", label: "Exam Form" },
  result: { icon: Award, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", label: "Result" },
  notice: { icon: Megaphone, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", label: "Notice" },
  fees: { icon: IndianRupee, color: "text-red-500", bg: "bg-red-50", border: "border-red-200", label: "Fees" },
  attendance: { icon: BarChart3, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", label: "Attendance" },
  placement: { icon: Briefcase, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200", label: "Placement" },
  timetable: { icon: CalendarCheck, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200", label: "Timetable" },
  library: { icon: BookOpen, color: "text-teal-500", bg: "bg-teal-50", border: "border-teal-200", label: "Library" },
};

function getTimeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/* -- Notification Bell Component -- */
function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = useCallback(
    (notif) => {
      if (!notif.read) {
        markAsRead(notif.id);
      }
      setIsOpen(false);
      navigate(notif.route);
    },
    [markAsRead, navigate]
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2 rounded-lg transition-all duration-200 ${isOpen
          ? "bg-purple-50 text-purple-600"
          : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          }`}
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? "animate-[bellSwing_2s_ease-in-out_infinite]" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center px-1 text-[10px] font-extrabold text-white bg-red-500 rounded-full shadow-lg shadow-red-200 ring-2 ring-white animate-[badgePulse_2s_ease-in-out_infinite]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-3 right-3 top-[58px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:w-[380px] max-h-[calc(100dvh-76px)] sm:max-h-[480px] bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/60 z-[100] overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-[10px] text-purple-600 font-semibold">
                      {unreadCount} unread
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-purple-600 hover:bg-purple-100 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mark all read</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      clearAll();
                      setIsOpen(false);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain" style={{ maxHeight: '380px' }}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <Bell className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-400">No notifications</p>
                </div>
              ) : (
                <div className="py-1">
                  {notifications.map((notif, index) => {
                    const config = notifTypeConfig[notif.type] || notifTypeConfig.notice;
                    const TypeIcon = config.icon;
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`group relative px-3 py-2 mx-1 my-0.5 rounded-xl cursor-pointer transition-all duration-200 ${notif.read
                          ? "hover:bg-gray-50"
                          : `${config.bg} hover:bg-opacity-80 border ${config.border}`
                          }`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${notif.read ? "bg-gray-100" : "bg-white shadow-sm"
                            }`}>
                            <TypeIcon className={`w-4 h-4 ${notif.read ? "text-gray-400" : config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse"></span>
                              )}
                              <p className={`text-[11px] font-bold leading-snug truncate ${notif.read ? "text-gray-500" : "text-gray-800"
                                }`}>
                                {notif.title}
                              </p>
                            </div>
                            <p className={`text-[10px] leading-snug mt-0.5 line-clamp-2 ${notif.read ? "text-gray-400" : "text-gray-600"
                              }`}>
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${notif.read ? "bg-gray-100 text-gray-400" : `${config.bg} ${config.color}`
                                }`}>
                                {config.label}
                              </span>
                              <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                                <ClockIcon className="w-2.5 h-2.5" />
                                {getTimeAgo(notif.timestamp)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notif.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all shrink-0 mt-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/80 shrink-0">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/student-dashboard/communication/notices");
                  }}
                  className="w-full text-center text-[11px] font-bold text-purple-600 hover:text-purple-700 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  View All Notices to
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -- Complete Sidebar Categories -- */
const sidebarMenu = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/student-dashboard" },
  { id: "profile", label: "My Profile", icon: User, path: "/student-dashboard/profile" },
  {
    id: "fees",
    label: "Fee",
    icon: IndianRupee,
    children: [
      { label: "Fee Receipts", path: "/student-dashboard/fees/receipts", icon: Receipt },
      { label: "Pay Fee Online", path: "/student-dashboard/fees/onlinePay", icon: CreditCard },
      { label: "Student Ledger", path: "/student-dashboard/fees/ledger", icon: BookMarked },
      { label: "Bihar Student Credit Card", path: "/student-dashboard/fees/drcc", icon: Building },
      { label: "Scholarships", path: "/student-dashboard/fees/scholarships", icon: Award },
      { label: "Refund Requests", path: "/student-dashboard/fees/refunds", icon: RotateCcw },
      { label: "No Dues & NOC Clearance", path: "/student-dashboard/fees/no-dues", icon: ShieldCheck },
      { label: "Offline Bank Challan Slip", path: "/student-dashboard/fees/challan", icon: Building },
      { label: "12th Merit Fee Concession", path: "/student-dashboard/fees/concessions", icon: Percent },
    ],
  },
  {
    id: "academics",
    label: "Academics",
    icon: GraduationCap,
    children: [
      { label: "Attendance Record", path: "/student-dashboard/attendance", icon: BarChart3 },
      { label: "Class Timetable", path: "/student-dashboard/timetable", icon: Calendar },
      { label: "Subjects & Faculty", path: "/student-dashboard/academics/subjects", icon: BookOpen },
      { label: "Course Registration", path: "/student-dashboard/academics/registration", icon: BookOpenCheck },
      { label: "Syllabus & Lesson Plan", path: "/student-dashboard/academics/syllabus", icon: Layers },
      { label: "Study Material & Notes", path: "/student-dashboard/academics/study-material", icon: FileText },
      { label: "Recorded Lectures & LMS", path: "/student-dashboard/academics/lectures", icon: BookOpenCheck },
      { label: "Assignments & Quizzes", path: "/student-dashboard/academics/assignments", icon: ClipboardList },
      { label: "Academic Calendar", path: "/student-dashboard/academics/calendar", icon: CalendarDays },
    ],
  },
  {
    id: "examination",
    label: "Examination",
    icon: Award,
    children: [
      { label: "Admit Card / Hall Ticket", path: "/student-dashboard/examination/hall-ticket", icon: FileText },
      { label: "Exam Form Submission", path: "/student-dashboard/examination/form", icon: CheckCheck },
      { label: "Seating Plan", path: "/student-dashboard/examination/seating", icon: Building },
      { label: "Internal Marks", path: "/student-dashboard/examination/marks", icon: BookOpen },
      { label: "Exam Results & Grade Card", path: "/student-dashboard/examination/results", icon: Award },
      { label: "Revaluation Request", path: "/student-dashboard/examination/revaluation", icon: RotateCcw },
    ],
  },
  {
    id: "placement",
    label: "Placement & Career",
    icon: Briefcase,
    children: [
      { label: "Campus Drives & Companies", path: "/student-dashboard/placement/drives", icon: Briefcase },
      { label: "Resume Builder & AI Review", path: "/student-dashboard/placement/resume", icon: FileUp },
      { label: "Internship & Applications", path: "/student-dashboard/placement/internship", icon: Briefcase },
      { label: "Aptitude & Coding Tests", path: "/student-dashboard/placement/tests", icon: BookOpenCheck },
      { label: "Mock Interviews", path: "/student-dashboard/placement/interviews", icon: Phone },
      { label: "Placement Offers", path: "/student-dashboard/placement/offers", icon: Award },
    ],
  },
  {
    id: "library",
    label: "Library",
    icon: BookOpen,
    children: [
      { label: "Search Books & Catalog", path: "/student-dashboard/library/search", icon: Search },
      { label: "Issued Books Ledger", path: "/student-dashboard/library/issued", icon: BookCopy },
      { label: "Fines & Overdue", path: "/student-dashboard/library/fines", icon: IndianRupee },
      { label: "Previous Year Papers", path: "/student-dashboard/library/pyq", icon: FileText },
      { label: "Library Rules", path: "/student-dashboard/library/rules", icon: Scale },
    ],
  },
  {
    id: "hostel",
    label: "Hostel",
    icon: Home,
    children: [
      { label: "Room Details & Info", path: "/student-dashboard/hostel/room", icon: Home },
      { label: "Mess Menu", path: "/student-dashboard/hostel/mess", icon: Utensils },
      { label: "Leave Pass Request", path: "/student-dashboard/hostel/leave", icon: FileText },
      { label: "Hostel Complaints", path: "/student-dashboard/hostel/complaints", icon: HelpCircle },
      { label: "Hostel Fees", path: "/student-dashboard/hostel/fees", icon: IndianRupee },
    ],
  },
  {
    id: "transport",
    label: "Transport",
    icon: Bus,
    children: [
      { label: "Digital Bus Pass", path: "/student-dashboard/transport/bus-pass", icon: Bus },
      { label: "Route & Bus Stops", path: "/student-dashboard/transport/route", icon: Bus },
      { label: "Live Bus Tracking", path: "/student-dashboard/transport/tracking", icon: Compass },
      { label: "Driver Details", path: "/student-dashboard/transport/driver", icon: Phone },
      { label: "Transport Fees", path: "/student-dashboard/transport/fees", icon: IndianRupee },
    ],
  },
  {
    id: "activities",
    label: "Activities",
    icon: Trophy,
    children: [
      { label: "Events & Competitions", path: "/student-dashboard/activities/events", icon: Calendar },
      { label: "Clubs & Societies", path: "/student-dashboard/activities/clubs", icon: Trophy },
      { label: "NSS & NCC Wing", path: "/student-dashboard/activities/nss-ncc", icon: ShieldCheck },
      { label: "Sports & Athletics", path: "/student-dashboard/activities/sports", icon: Trophy },
      { label: "Activity Certificates", path: "/student-dashboard/activities/certificates", icon: Award },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icon: MessageSquare,
    children: [
      { label: "Notice Board", path: "/student-dashboard/communication/notices", icon: Bell },
      { label: "Chat with Faculty", path: "/student-dashboard/communication/faculty", icon: MessageSquare },
      { label: "Chat with Mentor", path: "/student-dashboard/communication/mentor", icon: User },
      { label: "Help Desk & Grievances", path: "/student-dashboard/communication/helpdesk", icon: LifeBuoy },
    ],
  },
  {
    id: "documents",
    label: "Documents",
    icon: ShieldCheck,
    children: [
      { label: "Uploaded Documents", path: "/student-dashboard/documents/uploaded", icon: FileText },
      { label: "Download Certificates", path: "/student-dashboard/documents/certificates", icon: Award },
      { label: "DigiLocker Sync", path: "/student-dashboard/documents/digilocker", icon: ShieldCheck },
    ],
  },
  {
    id: "aihub",
    label: "AI Hub",
    icon: Bot,
    children: [
      { label: "AI Study Planner", path: "/student-dashboard/ai-hub/planner", icon: Sparkles },
      { label: "AI Doubt Solver", path: "/student-dashboard/ai-hub/doubt-solver", icon: Bot },
      { label: "AI Notes Summary", path: "/student-dashboard/ai-hub/notes-summary", icon: FileText },
      { label: "AI Quiz Generator", path: "/student-dashboard/ai-hub/quiz-generator", icon: HelpCircle },
      { label: "AI Performance Analysis", path: "/student-dashboard/ai-hub/performance", icon: BarChart3 },
      { label: "AI Career Guidance", path: "/student-dashboard/ai-hub/career-guidance", icon: Compass },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: SettingsIcon,
    children: [
      { label: "Profile Settings", path: "/student-dashboard/settings/profile", icon: User },
      { label: "Password & Security", path: "/student-dashboard/settings/password", icon: SettingsIcon },
      { label: "Two-Factor Auth (2FA)", path: "/student-dashboard/settings/2fa", icon: ShieldCheck },
      { label: "Notification Preferences", path: "/student-dashboard/settings/notifications", icon: Bell },
      { label: "Language & Theme", path: "/student-dashboard/settings/theme", icon: Sparkles },
    ],
  },
];

export default function StudentERP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(["fees"]);
  const [activeStudent, setActiveStudent] = useState(() => getActiveStudentProfile());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginIdInput, setLoginIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) => (prev.includes(menuId) ? [] : [menuId]));
  };

  const refreshProfile = () => {
    setActiveStudent(getActiveStudentProfile());
  };

  useEffect(() => {
    window.addEventListener("storage", refreshProfile);
    window.addEventListener("studentEnrollmentUpdated", refreshProfile);
    window.addEventListener("activeStudentProfileUpdated", refreshProfile);
    return () => {
      window.removeEventListener("storage", refreshProfile);
      window.removeEventListener("studentEnrollmentUpdated", refreshProfile);
      window.removeEventListener("activeStudentProfileUpdated", refreshProfile);
    };
  }, []);

  const handleRealtimeLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError("");
    const input = loginIdInput.trim();
    if (!input) {
      setLoginError("Please enter your official 6-Digit Scholar No. (e.g. 262701)");
      return;
    }

    const allStudents = getStudentVerifications();
    const matched = allStudents.find(
      (s) => s.scholarNo === input || s.loginUsername === input
    );
    const expectedPassword = matched?.loginPassword || matched?.scholarNo;

    if (matched && passwordInput === expectedPassword) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("erp_active_student_roll", matched.rollNumber || matched.scholarNo);
      }
      refreshProfile();
      setShowLoginModal(false);
      setLoginIdInput("");
      setPasswordInput("");
      alert(`Welcome back, ${matched.studentName}!\n\nSuccessfully logged into Student Portal.\nScholar No: ${matched.scholarNo}`);
    } else {
      setLoginError(`No student record found for Scholar No. "${input}". Please check your 6-Digit Scholar No. (e.g. 262701).`);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("erp_active_student_roll");
    refreshProfile();
    navigate("/student");
  };

  const currentFullUrl =
    location.pathname +
    (location.search ||
      (location.pathname === "/student-dashboard/fees" ? "?tab=receipts" : ""));
  const studentPhotoUrl = activeStudent.photoPreviews?.studentPhoto || activeStudent.photo || "";
  const hasStudentPhoto = typeof studentPhotoUrl === "string" && /^(data:|blob:|https?:\/\/)/i.test(studentPhotoUrl);

  const isActiveChild = (childPath) => {
    if (childPath.includes("?")) {
      return currentFullUrl === childPath;
    }
    return location.pathname === childPath;
  };

  return (
    <NotificationProvider>
      <div className="student-portal-shell h-dvh bg-gray-100 flex font-sans overflow-hidden">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Fixed Light / White Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-[270px] h-screen bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out overflow-y-auto sidebar-scroll shadow-sm ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
        >
          {/* Sidebar Header - Fixed h-[64px] height matching Top Header Bar */}
          <div className="h-[64px] flex items-center gap-3 px-4 bg-white border-b border-gray-200 shrink-0">
            <img
              src="/images/Logo/logo.webp"
              alt="Logo"
              className="w-9 h-9 rounded-full bg-purple-50 p-0.5 object-contain border border-purple-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-sm font-black leading-tight truncate">
                Sarvadnya Vidyapeeth
              </p>
              <p className="text-purple-700 text-[10px] font-extrabold uppercase tracking-wider">
                Student Panel
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Menu Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 sidebar-scroll">
            {sidebarMenu.map((item) => {
              if (!item.children) {
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5 rounded-xl text-[12px] font-bold transition-all duration-200 ${isActive
                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-md shadow-purple-200 font-black"
                        : "text-slate-700 hover:bg-purple-50 hover:text-purple-900"
                      }`
                    }
                  >
                    <item.icon className="w-[16px] h-[16px] flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              }

              const isExpanded = expandedMenus.includes(item.id);
              const hasActiveChild = item.children.some((c) => isActiveChild(c.path));

              return (
                <div key={item.id} className="mx-2 my-0.5">
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 ${hasActiveChild
                      ? "bg-purple-50 text-purple-950 font-black border border-purple-200/80 shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                  >
                    <item.icon className="w-[16px] h-[16px] flex-shrink-0 text-purple-600" />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 font-bold" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 py-1 space-y-0.5 border-l-2 border-purple-200 ml-4 my-1">
                          {item.children.map((child) => {
                            const active = isActiveChild(child.path);
                            return (
                              <NavLink
                                key={child.label}
                                to={child.path}
                                onClick={() => setSidebarOpen(false)}
                                className={
                                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 ${active
                                    ? "bg-purple-600 text-white font-black shadow-sm"
                                    : "text-slate-600 hover:bg-purple-50 hover:text-purple-900"
                                  }`
                                }
                              >
                                <child.icon className="w-[13px] h-[13px] flex-shrink-0" />
                                <span className="truncate">{child.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Footer Section */}
          <div className="mt-auto px-3 py-3 border-t border-gray-200 bg-slate-50/80 flex flex-col gap-2 shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Scrollable White Content Area */}
        <div className="flex-1 flex flex-col h-dvh min-w-0 overflow-y-auto overflow-x-hidden">
          {/* Top Header Bar - Fixed h-[64px] height matching Sidebar Header */}
          <header className="h-[64px] sticky top-0 z-30 bg-white border-b border-gray-200 px-3 sm:px-6 flex items-center justify-between gap-2 shadow-sm shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Student Info, Login Switcher & Notifications */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-50/70 rounded-xl border border-purple-200 text-xs">
                <span className="font-extrabold text-purple-900">
                  {activeStudent.course || "Course not assigned"}
                </span>
                <span className="text-purple-300">|</span>
                <span className="text-purple-700 font-bold">Scholar No: {activeStudent.scholarNo || "N/A"}</span>
              </div>

              <NotificationBell />

              <div className="flex items-center gap-2 pl-2 border-l border-gray-200 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shadow-md overflow-hidden border border-purple-200">
                  {hasStudentPhoto ? (
                    <img
                      src={studentPhotoUrl}
                      alt={`${activeStudent.name || "Student"} photo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (activeStudent.name || "Student").split(" ").map((n) => n[0]).join("").slice(0, 2)
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-gray-800 leading-tight">
                    {activeStudent.name || "Student Account"}
                  </p>
                  <p className="text-[10px] text-purple-700 font-mono font-bold leading-tight">
                    {activeStudent.enrollmentNo || activeStudent.rollNumber || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 overflow-x-hidden p-3 sm:p-5 lg:p-6">
            <Routes>
              {/* Active Working Pages */}
              <Route index element={<StudentDashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="fees/*" element={<FeeDetailsPage />} />

              {/* All Other Modules & Sections -> Coming Soon */}
              <Route path="academics/*" element={<ComingSoonSection />} />
              <Route path="attendance/*" element={<ComingSoonSection />} />
              <Route path="timetable/*" element={<ComingSoonSection />} />
              <Route path="examination/*" element={<ComingSoonSection />} />
              <Route path="placement/*" element={<ComingSoonSection />} />
              <Route path="library/*" element={<ComingSoonSection />} />
              <Route path="hostel/*" element={<ComingSoonSection />} />
              <Route path="transport/*" element={<ComingSoonSection />} />
              <Route path="activities/*" element={<ComingSoonSection />} />
              <Route path="communication/*" element={<ComingSoonSection />} />
              <Route path="documents/*" element={<ComingSoonSection />} />
              <Route path="ai-hub/*" element={<ComingSoonSection />} />
              <Route path="settings/*" element={<ComingSoonSection />} />

              {/* Direct Links & Fallback Routes */}
              <Route path="results" element={<ComingSoonSection />} />
              <Route path="placements" element={<ComingSoonSection />} />
              <Route path="resume" element={<ComingSoonSection />} />
              <Route path="library-ledger" element={<ComingSoonSection />} />
              <Route path="library-rules" element={<ComingSoonSection />} />
              <Route path="academic-calendar" element={<ComingSoonSection />} />
              <Route path="notices" element={<ComingSoonSection />} />
              <Route path="faculty-query" element={<ComingSoonSection />} />
              <Route path="coming-soon" element={<ComingSoonSection />} />

              {/* Catch-all */}
              <Route path="*" element={<ComingSoonSection />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 bg-white px-3 sm:px-6 py-2.5 text-center mt-auto">
            <p className="text-[10px] text-gray-400">
              Copyright {new Date().getFullYear()} Sarvadnya Vidyapeeth ERP | Powered by{" "}
              <a href="https://texwebsolution.in" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-bold hover:underline">
                TexWeb Solution
              </a>
            </p>
          </footer>
        </div>
      </div>

      {/* Realtime Student Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Student Portal Login</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Real-Time Student Authentication Desk</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleRealtimeLoginSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    6-Digit Scholar Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdInput}
                    onChange={(e) => setLoginIdInput(e.target.value)}
                    placeholder="e.g. 262701"
                    className="w-full p-3 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Student Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Default Password = 6-Digit Scholar Number"
                    className="w-full p-3 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white font-mono"
                  />
                  <p className="text-[10px] text-purple-700 font-bold mt-1">
                    * Note: Default password is your 6-Digit Scholar Number (e.g. 262701).
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-200 transition-all cursor-pointer"
                  >
                    Log In to Dashboard
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationProvider>
  );
}

