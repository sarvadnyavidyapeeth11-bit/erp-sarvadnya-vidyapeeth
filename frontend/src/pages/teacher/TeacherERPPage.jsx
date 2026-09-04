import React, { useState } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ChevronDown,
  Bell,
  Search,
  BookOpen,
  UserCheck,
  FileCheck
} from "lucide-react";

import TeacherDashboardPage from "./TeacherDashboardPage";
import MarkAttendancePage from "./MarkAttendancePage";
import MarksEntryPage from "./MarksEntryPage";
import TeacherTimetablePage from "./TeacherTimetablePage";
import TeacherLeavePage from "./TeacherLeavePage";
import TeacherPenaltyImpositionPage from "./TeacherPenaltyImpositionPage";
import TeacherNoDuesClearancePage from "./TeacherNoDuesClearancePage";

const sidebarMenu = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/teacher-dashboard" },
  { label: "Mark Attendance", icon: CalendarCheck, path: "/teacher-dashboard/attendance" },
  { label: "Academic No-Dues Desk", icon: FileCheck, path: "/teacher-dashboard/nodues" },
  { label: "Exam & Marks Entry", icon: Award, path: "/teacher-dashboard/marks" },
  { label: "Student Fines & Discipline", icon: UserCheck, path: "/teacher-dashboard/fines" },
  { label: "My Timetable", icon: Calendar, path: "/teacher-dashboard/timetable" },
  { label: "Leave Requests", icon: FileText, path: "/teacher-dashboard/leave" },
];

export default function TeacherERPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const teacherProfile = {
    name: "Dr. Anjali Sharma",
    role: "Associate Professor & HOD",
    id: "TCH202401",
    department: "Computer Applications",
  };

  const handleLogout = () => {
    sessionStorage.removeItem("teacher_authenticated");
    navigate("/teacher");
  };

  return (
    <div className="h-screen bg-gray-100 flex font-sans overflow-hidden">
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

      {/* Dark Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-[260px] h-screen bg-slate-900 flex flex-col shrink-0 transition-transform duration-300 ease-in-out sidebar-scroll ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-4 py-4 bg-slate-950/60 border-b border-slate-700/50 shrink-0">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/30 text-white font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold leading-tight truncate">
              Sarvadnya Vidyapeeth
            </p>
            <p className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wider">
              Teacher Portal
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
          {sidebarMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/teacher-dashboard"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Profile & Logout Footer */}
        <div className="mt-auto px-3 py-3 border-t border-slate-700/60 bg-slate-950/90 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700/50 shadow-inner">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              AS
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider block leading-none">
                Faculty HOD
              </span>
              <p className="text-white text-xs font-bold truncate leading-tight mt-1">
                {teacherProfile.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition-all shadow-sm active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-bold text-indigo-900">{teacherProfile.department}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
              <Search className="w-4.5 h-4.5" />
            </button>

            <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white"></span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                AS
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-gray-800 leading-tight">
                  {teacherProfile.name}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight">
                  ID: {teacherProfile.id}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Page Routes */}
        <main className="flex-1 p-4 sm:p-6">
          <Routes>
            <Route index element={<TeacherDashboardPage />} />
            <Route path="attendance" element={<MarkAttendancePage />} />
            <Route path="nodues" element={<TeacherNoDuesClearancePage />} />
            <Route path="marks" element={<MarksEntryPage />} />
            <Route path="fines" element={<TeacherPenaltyImpositionPage />} />
            <Route path="timetable" element={<TeacherTimetablePage />} />
            <Route path="leave" element={<TeacherLeavePage />} />
            <Route path="*" element={<Navigate to="/teacher-dashboard" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-6 py-2.5 text-center mt-auto">
          <p className="text-[10px] text-gray-400">
            Copyright {new Date().getFullYear()} Sarvadnya Vidyapeeth Teacher ERP | Powered by{" "}
            <a href="https://texwebsolution.in" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">
              TexWeb Solution
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
