import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Receipt,
  RotateCcw,
  ExternalLink,
  Layers,
} from "lucide-react";

export default function ERPPortalPage() {
  const handleResetLocalCache = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("erp_master_departments");
      localStorage.removeItem("erp_master_courses");
      localStorage.removeItem("erp_master_batches");
      localStorage.removeItem("erp_master_subjects");
      localStorage.removeItem("erp_admin_verifications");
      localStorage.removeItem("erp_student_ledger_entries");
      localStorage.removeItem("erp_bank_challans");
      localStorage.removeItem("erp_scholarship_applications");
      localStorage.removeItem("erp_drcc_applications");
      localStorage.removeItem("erp_concession_requests");
      localStorage.removeItem("erp_fee_refunds");
      localStorage.removeItem("erp_fee_details");
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const portals = [
    {
      id: "student",
      title: "Student Portal",
      badge: "For Students & Parents",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      description:
        "Access academic profile, semester fee passbook, online payment receipts, and exam hall tickets.",
      icon: GraduationCap,
      iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-200",
      link: "/student-login",
      btnText: "Student Login",
      btnClass:
        "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-600/25",
      isPrimary: true,
      features: ["Fee Status & Dues", "Online Payments & Receipts", "Academic Passbook"],
    },
    {
      id: "admission",
      title: "Admissions Desk",
      badge: "Admissions Cell",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      description:
        "Batch-wise student enrollment, document verification, application scrutiny, and profile approvals.",
      icon: UserPlus,
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-200",
      link: "/admission-login",
      btnText: "Admission Login",
      btnClass:
        "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-600/25",
      isPrimary: false,
      features: ["Application Processing", "Document Verification", "Batch Allotment"],
    },
    {
      id: "fee-officer",
      title: "Fee Accounts Desk",
      badge: "Finance & Accounts",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description:
        "Offline bank challan reconciliation, fee head levying, cash collection counter, and student ledgers.",
      icon: Receipt,
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200",
      link: "/fee-officer-login",
      btnText: "Fee Officer Login",
      btnClass:
        "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25",
      isPrimary: false,
      features: ["Bank Challan Clearance", "Fee Levying & Concessions", "Accounts Ledger"],
    },
    {
      id: "admin",
      title: "Academic Admin",
      badge: "Institute Control",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      description:
        "Master academic configuration for departments, affiliated degree programs, classes, and roster control.",
      icon: ShieldCheck,
      iconBg: "bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-slate-200",
      link: "/admin-login",
      btnText: "Admin Login",
      btnClass:
        "bg-gradient-to-r from-slate-800 to-slate-950 hover:from-slate-900 hover:to-black text-white shadow-lg shadow-slate-800/20",
      isPrimary: false,
      features: ["Departments & Courses", "Cohort Batches Master", "Directory Control"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative overflow-hidden flex flex-col justify-between selection:bg-purple-600 selection:text-white">
      {/* Signature Ambient Glows Matching ERP Theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-purple-200/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="/images/Logo/logo.webp"
            alt="Sarvadnya Vidyapeeth Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white p-0.5 object-contain shadow-md shadow-purple-500/10 border border-purple-100"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/sarvadnya_logo.jpg";
            }}
          />
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight font-heading">
              Sarvadnya Vidyapeeth
            </h1>
            <p className="text-[10px] sm:text-[11px] font-bold text-purple-700 uppercase tracking-widest">
              Integrated Campus ERP Portal • Affiliated to AKU, Patna
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ERP System Active
          </div>
          <Link
            to="/student-login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all shadow-sm"
          >
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Direct</span> Student Login
          </Link>
        </div>
      </header>

      {/* Hero & Entrance Cards */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 flex flex-col items-center justify-center space-y-10">
        {/* Hero Title */}
        <div className="text-center space-y-3.5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-purple-200 text-purple-800 text-xs font-extrabold shadow-sm shadow-purple-500/5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Official Academic Management Gateway</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 font-heading">
            Sarvadnya Vidyapeeth <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">ERP Portal</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm sm:leading-relaxed max-w-2xl mx-auto font-medium">
            Unified digital campus infrastructure for students, administrative officers, admissions desk, and finance reconciliations.
          </p>
        </div>

        {/* 4 Balanced Role Portal Cards (HOD Removed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <motion.div
                key={portal.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-all bg-white border shadow-xl shadow-purple-900/5 ${
                  portal.isPrimary
                    ? "border-purple-300 ring-2 ring-purple-500/20"
                    : "border-slate-200/90 hover:border-purple-200"
                }`}
              >
                {/* Decorative Accent Glow */}
                <div
                  className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-40 pointer-events-none ${
                    portal.isPrimary ? "bg-purple-400" : "bg-slate-200"
                  }`}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-md ${portal.iconBg}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${portal.badgeColor}`}
                    >
                      {portal.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 font-heading">
                      {portal.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  {/* Bullet points */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {portal.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-[11px] font-semibold text-slate-600"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100">
                  <Link
                    to={portal.link}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 group ${portal.btnClass}`}
                  >
                    <span>{portal.btnText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Institution Info & Direct Access Strip */}
        <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">
                Direct Student Login Link
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Add <code className="text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">/student</code> on your main website navbar button for instant student login access.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/student-login"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5"
            >
              <span>Go to Student Login</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="relative z-10 py-4 border-t border-slate-200/80 bg-white/70 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between px-6 text-slate-500 text-[11px] font-medium gap-2">
        <div>
          © {new Date().getFullYear()} Sarvadnya Vidyapeeth Campus ERP • Affiliated to Aryabhatta Knowledge University (AKU), Patna
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleResetLocalCache}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-purple-700 transition-colors cursor-pointer text-[11px] font-bold"
            title="Clean local cache and re-sync freshly from database"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Flush Local Cache</span>
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400">
            Powered by{" "}
            <span className="text-purple-700 font-bold">TexWeb Solution</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
