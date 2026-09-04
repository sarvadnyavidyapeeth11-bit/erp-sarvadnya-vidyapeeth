import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Calendar,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Users,
  KeyRound,
} from "lucide-react";

import AdminDashboardPage from "./AdminDashboardPage";
import AdminDepartmentsPage from "./AdminDepartmentsPage";
import AdminCoursesPage from "./AdminCoursesPage";
import AdminBatchesPage from "./AdminBatchesPage";
import AdminStudentRosterPage from "./AdminStudentRosterPage";
import AdminStaffUsersPage from "./AdminStaffUsersPage";
import { adminProfile } from "../../hooks/adminData";
import { getBatches } from "../../hooks/academicMasterData";

const sidebarMenu = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin-dashboard",
  },
  {
    id: "departments",
    label: "Departments",
    icon: Building2,
    path: "/admin-dashboard/departments",
  },
  {
    id: "courses",
    label: "Courses & Programs",
    icon: GraduationCap,
    path: "/admin-dashboard/courses",
  },
  {
    id: "batches",
    label: "Batches & Sections",
    icon: Calendar,
    path: "/admin-dashboard/batches",
  },
  {
    id: "students",
    label: "Student Roster & Directory",
    icon: Users,
    path: "/admin-dashboard/students",
  },
  {
    id: "staff",
    label: "Staff & User Access",
    icon: KeyRound,
    path: "/admin-dashboard/staff",
  },
];

export default function AdminERPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(() => getBatches().find((batch) => batch.status === "Active")?.academicSession || "");

  useEffect(() => {
    const reloadSession = () => setActiveSession(getBatches().find((batch) => batch.status === "Active")?.academicSession || "");
    window.addEventListener("academicDataUpdated", reloadSession);
    window.addEventListener("storage", reloadSession);
    return () => {
      window.removeEventListener("academicDataUpdated", reloadSession);
      window.removeEventListener("storage", reloadSession);
    };
  }, []);

  const handleLogout = () => navigate("/admin-login");

  return (
    <div className="h-screen bg-gray-100 flex font-sans overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Fixed Light / White Sidebar - Matching Student Portal */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-[270px] h-screen bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out overflow-y-auto sidebar-scroll shadow-sm ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Sidebar Header - Fixed h-[64px] height matching Top Header Bar */}
          <div className="h-[64px] flex items-center gap-3 px-4 bg-white border-b border-gray-200 shrink-0">
            <img
              src="/images/Logo/logo.webp"
              alt="Logo"
              className="w-9 h-9 rounded-full bg-purple-50 p-0.5 object-contain border border-purple-200"
              onError={(e) => { e.target.src = "/sarvadnya_logo.jpg"; }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-sm font-black leading-tight truncate">
                Sarvadnya Vidyapeeth
              </p>
              <p className="text-purple-700 text-[10px] font-extrabold uppercase tracking-wider">
                Admin Panel
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
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
            {sidebarMenu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-md shadow-purple-200 font-black"
                      : "text-slate-700 hover:bg-purple-50 hover:text-purple-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-purple-600"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin User Card */}
        <div className="p-4 border-t border-gray-200 bg-slate-50/70 space-y-3 shrink-0">
          <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
              AD
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">{adminProfile.name}</p>
              <p className="text-[10px] font-bold text-purple-700 truncate">{adminProfile.designation}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-gray-200 hover:border-rose-200 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" /> Logout Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Navigation Bar */}
        <header className="h-[64px] bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                Academic Master Administration Desk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Session: {activeSession || "Not created"}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 bg-slate-50/50">
          <Routes>
            <Route index element={<AdminDashboardPage />} />
            <Route path="departments" element={<AdminDepartmentsPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="batches" element={<AdminBatchesPage />} />
            <Route path="students" element={<AdminStudentRosterPage />} />
            <Route path="staff" element={<AdminStaffUsersPage />} />
            <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-6 py-3 text-center mt-auto shrink-0">
          <p className="text-[10px] text-gray-500 font-semibold">
            Copyright {new Date().getFullYear()} Sarvadnya Vidyapeeth | Academic Master Admin Portal
          </p>
        </footer>
      </div>
    </div>
  );
}
