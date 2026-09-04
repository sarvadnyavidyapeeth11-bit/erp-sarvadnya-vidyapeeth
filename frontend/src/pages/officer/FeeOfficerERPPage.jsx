import React, { useState } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Landmark,
  Building2,
  CreditCard,
  Receipt,
  Sliders,
  Menu,
  X,
  Bell,
  LogOut,
  IndianRupee,
  ShieldCheck,
  Layers,
  Award,
  Percent,
  RotateCcw,
  FileCheck
} from "lucide-react";

import OfficerDashboardPage from "./fees/OfficerDashboardPage";
import OfficerCashDeskPage from "./fees/OfficerCashDeskPage";
import OfficerFeeLevyingPage from "./fees/OfficerFeeLevyingPage";
import OfficerChallanVerificationPage from "./fees/OfficerChallanVerificationPage";
import OfficerDrccPage from "./fees/OfficerDrccPage";
import OfficerScholarshipPage from "./fees/OfficerScholarshipPage";
import OfficerFeeConcessionPage from "./fees/OfficerFeeConcessionPage";
import OfficerRefundsPage from "./fees/OfficerRefundsPage";
import OfficerFeeLedgerPage from "./fees/OfficerFeeLedgerPage";
import OfficerNoDuesPage from "./fees/OfficerNoDuesPage";

export default function FeeOfficerERPPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Core required modules for Accounts / Fee Officer
  const officerNavItems = [
    { label: "Financial Dashboard", path: "/fee-officer-dashboard/dashboard", icon: LayoutDashboard },
    { label: "Offline Cash & POS Desk", path: "/fee-officer-dashboard/cash-desk", icon: Landmark },
    { label: "Fee Head Applicator & Levying", path: "/fee-officer-dashboard/levy-fee", icon: Layers },
    { label: "Bank Challan Verification", path: "/fee-officer-dashboard/challans", icon: Building2 },
    { label: "Bihar Student Credit Card Desk", path: "/fee-officer-dashboard/drcc", icon: CreditCard },
    { label: "Scholarship Verification", path: "/fee-officer-dashboard/scholarships", icon: Award },
    { label: "12th Merit Concessions", path: "/fee-officer-dashboard/concessions", icon: Percent },
    { label: "No-Dues Clearance", path: "/fee-officer-dashboard/no-dues", icon: FileCheck },
    { label: "Fee Refund Claims", path: "/fee-officer-dashboard/refunds", icon: RotateCcw },
    { label: "All Student Ledgers", path: "/fee-officer-dashboard/ledger", icon: Receipt },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("erp_fee_officer_auth");
    navigate("/fee-officer-login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* ── Left Sidebar (Officer Theme) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 text-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col justify-between shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Brand Header */}
          <div className="h-[64px] border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/images/Logo/logo.webp"
                alt="Logo"
                className="w-9 h-9 rounded-full bg-purple-50 p-0.5 object-contain border border-purple-100 shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/sarvadnya_logo.jpg";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 text-sm font-black leading-tight truncate">
                  Sarvadnya Vidyapeeth
                </p>
                <p className="text-purple-700 text-[10px] font-extrabold uppercase tracking-wider">
                  Fee Officer Panel
                </p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Menu Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 sidebar-scroll">
            <p className="px-3 text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
              Accounts Officer Desk
            </p>
            {officerNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path.endsWith("/dashboard")}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-black shadow-md shadow-purple-200"
                        : "text-slate-700 hover:bg-purple-50 hover:text-purple-900"
                    }`
                  }
                >
                  <Icon className="w-[16px] h-[16px] flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Section */}
          <div className="mt-auto px-3 py-3 border-t border-gray-200 bg-slate-50/80 flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs">
                FAO
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black text-purple-700 uppercase tracking-wider block leading-none">
                  Accounts Officer
                </span>
                <p className="text-slate-900 text-xs font-black truncate leading-tight mt-1">
                  Fee Accounts Desk
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit to Main ERP</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Scrollable Content Area ── */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-[64px] sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-xs">
              <span className="font-bold text-gray-700">Financial Audit Desk</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600 font-mono">Live Accounts Counter</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shadow-md">
                FA
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-gray-800 leading-tight">Accounts Officer</p>
                <p className="text-[10px] text-gray-400 leading-tight">Sarvadnya Vidyapeeth</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OfficerDashboardPage />} />
            <Route path="cash-desk" element={<OfficerCashDeskPage />} />
            <Route path="levy-fee" element={<OfficerFeeLevyingPage />} />
            <Route path="levying" element={<OfficerFeeLevyingPage />} />
            <Route path="fee-levying" element={<OfficerFeeLevyingPage />} />
            <Route path="structure" element={<OfficerFeeLevyingPage />} />
            <Route path="challans" element={<OfficerChallanVerificationPage />} />
            <Route path="drcc" element={<OfficerDrccPage />} />
            <Route path="scholarships" element={<OfficerScholarshipPage />} />
            <Route path="concessions" element={<OfficerFeeConcessionPage />} />
            <Route path="no-dues" element={<OfficerNoDuesPage />} />
            <Route path="nodues" element={<OfficerNoDuesPage />} />
            <Route path="refunds" element={<OfficerRefundsPage />} />
            <Route path="ledger" element={<OfficerFeeLedgerPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-6 py-2.5 text-center mt-auto">
          <p className="text-[10px] text-gray-400">
            Copyright {new Date().getFullYear()} Sarvadnya Vidyapeeth ERP | Fee & Accounts Officer Management Suite
          </p>
        </footer>
      </div>
    </div>
  );
}
