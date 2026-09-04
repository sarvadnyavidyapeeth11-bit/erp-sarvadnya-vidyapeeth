import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  Award,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sparkles,
  Building2,
  UserCheck
} from "lucide-react";

import { getActiveHODProfile } from "../../hooks/academicMasterData";
import ComingSoonSection from "../../components/comingSoon/ComingSoonSection";

const sidebarMenu = [
  {
    id: "dashboard",
    label: "HOD Dashboard",
    icon: LayoutDashboard,
    path: "/hod-dashboard",
  },
  {
    id: "allocations",
    label: "Faculty & Subject Workload",
    icon: BookOpen,
    path: "/hod-dashboard/allocations",
  },
  {
    id: "timetable",
    label: "Department Timetable",
    icon: Calendar,
    path: "/hod-dashboard/timetable",
  },
  {
    id: "leaves",
    label: "Faculty Leave Approvals",
    icon: Clock,
    path: "/hod-dashboard/leaves",
  },
  {
    id: "attendance-monitor",
    label: "Attendance Shortage (<75%)",
    icon: AlertCircle,
    path: "/hod-dashboard/attendance-monitor",
  },
  {
    id: "marks-verification",
    label: "Internal Marks Locking",
    icon: Award,
    path: "/hod-dashboard/marks-verification",
  },
];

const HODComingSoon = ({ title, section }) => (
  <ComingSoonSection
    title={title}
    section={section}
    subtitle="Sarvadnya Vidyapeeth HOD Portal"
  />
);

export default function HODERPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(() => getActiveHODProfile());

  useEffect(() => {
    const reloadProfile = () => setProfile(getActiveHODProfile());
    window.addEventListener("academicDataUpdated", reloadProfile);
    window.addEventListener("storage", reloadProfile);
    return () => {
      window.removeEventListener("academicDataUpdated", reloadProfile);
      window.removeEventListener("storage", reloadProfile);
    };
  }, []);

  const handleLogout = () => navigate("/hod-login");

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

      {/* Fixed White Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-[270px] h-screen bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out overflow-y-auto sidebar-scroll shadow-sm ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Sidebar Header */}
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
                HOD Department Suite
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Department Badge */}
          <div className="px-4 py-2.5 bg-purple-50/70 border-b border-purple-100 flex items-center gap-2 text-xs">
            <Building2 className="w-4 h-4 text-purple-700 shrink-0" />
            <span className="font-extrabold text-purple-900 truncate">{profile.department || "No department assigned"}</span>
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
                  end={item.path === "/hod-dashboard"}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-md shadow-purple-200 font-black"
                      : "text-slate-700 hover:bg-purple-50 hover:text-purple-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-purple-600"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80 shrink-0" />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer HOD User Card */}
        <div className="p-4 border-t border-gray-200 bg-slate-50/80 space-y-3 shrink-0">
          {(() => {
            const initials = profile.name
              .split(" ")
              .map(n => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "HD";

            return (
              <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-200 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-sm">
                  {initials}
                </div>
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">{profile.name}</p>
                  <p className="text-[10px] font-bold text-purple-700 truncate">{profile.designation}</p>
                </div>
              </div>
            );
          })()}

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-gray-200 hover:border-rose-200 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" /> Logout HOD Desk
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header Bar */}
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
                HOD Department Academic Governance Suite
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Academic Term: {profile.academicYear || "Not assigned"}
            </div>
          </div>
        </header>

        {/* Dynamic Content Pages */}
        <main className="flex-1 p-4 sm:p-6 bg-slate-50/50">
          <Routes>
            <Route index element={<HODComingSoon title="HOD Dashboard" section="HOD Department Suite" />} />
            <Route path="dashboard" element={<HODComingSoon title="HOD Dashboard" section="HOD Department Suite" />} />
            <Route path="allocations" element={<HODComingSoon title="Faculty & Subject Workload" section="HOD Department Suite" />} />
            <Route path="faculty-allocation" element={<HODComingSoon title="Faculty & Subject Workload" section="HOD Department Suite" />} />
            <Route path="timetable" element={<HODComingSoon title="Department Timetable" section="HOD Department Suite" />} />
            <Route path="leaves" element={<HODComingSoon title="Faculty Leave Approvals" section="HOD Department Suite" />} />
            <Route path="attendance-monitor" element={<HODComingSoon title="Attendance Shortage Monitor" section="HOD Department Suite" />} />
            <Route path="attendance-shortage" element={<HODComingSoon title="Attendance Shortage Monitor" section="HOD Department Suite" />} />
            <Route path="marks-verification" element={<HODComingSoon title="Internal Marks Locking" section="HOD Department Suite" />} />
            <Route path="marks" element={<HODComingSoon title="Internal Marks Locking" section="HOD Department Suite" />} />
            <Route path="nodues" element={<Navigate to="/fee-officer-dashboard/no-dues" replace />} />
            <Route path="no-dues" element={<Navigate to="/fee-officer-dashboard/no-dues" replace />} />
            <Route path="*" element={<Navigate to="/hod-dashboard" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-6 py-3 text-center mt-auto shrink-0">
          <p className="text-[10px] text-gray-500 font-semibold">
            Copyright {new Date().getFullYear()} Sarvadnya Vidyapeeth | Head of Department (HOD) Suite
          </p>
        </footer>
      </div>
    </div>
  );
}
