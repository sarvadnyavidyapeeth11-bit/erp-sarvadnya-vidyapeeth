import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Building2
} from "lucide-react";
import { getBatches, getDepartments } from "../../hooks/academicMasterData";

export default function HODLoginPage() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId || !password) {
      setError("Please enter your HOD Employee ID and Password.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const identifier = employeeId.trim().toLowerCase();
      const departments = getDepartments();
      const department = departments.find((dept) => {
        const code = String(dept.code || "").toLowerCase();
        const email = String(dept.hodEmail || "").toLowerCase();
        const generatedId = `hod-${code}`.toLowerCase();
        return identifier === email || identifier === generatedId || identifier === code;
      });
      if (!department) {
        setLoading(false);
        setError("No Admin-created department found for this HOD ID/email.");
        return;
      }
      const activeBatch = getBatches().find((batch) => (
        batch.status === "Active" &&
        (batch.department === department.name || batch.departmentCode === department.code)
      ));
      localStorage.setItem("erp_active_hod_session", JSON.stringify({
        id: `HOD-${department.code || department.id || "DEPT"}`,
        name: department.hodName || "Head of Department",
        employeeId,
        department: department.name || "",
        departmentCode: department.code || "",
        email: department.hodEmail || "",
        academicYear: activeBatch?.academicSession || "",
        batch: activeBatch?.batchName || ""
      }));
      setLoading(false);
      navigate("/hod-dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md z-10">
        <Link
          to="/erp"
          className="flex items-center gap-2 text-slate-300 hover:text-white text-xs font-bold transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to ERP Portal Entrance</span>
        </Link>
        <span className="text-purple-300 text-xs font-extrabold uppercase tracking-wider hidden sm:block">
          Sarvadnya Vidyapeeth ERP - HOD Department Suite
        </span>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-xl shadow-purple-900/5 relative overflow-hidden"
        >
          {/* Header Logo */}
          <div className="text-center mb-6 pb-4 border-b border-slate-100">
            <div className="inline-block p-1.5 rounded-full bg-white shadow-md shadow-purple-950/5 border-2 border-purple-200 mb-3">
              <img
                src="/images/Logo/logo.webp"
                alt="Sarvadnya Vidyapeeth Logo"
                className="w-12 h-12 object-contain rounded-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/sarvadnya_logo.jpg";
                }}
              />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight font-heading">
              Head of Department (HOD) Login
            </h1>
            <p className="text-xs font-bold text-purple-700 mt-0.5">
              Department Academic Governance Suite
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                HOD Employee ID / Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="HOD email or department code"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="------------"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span>Remember login</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-98 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating HOD Credentials...</span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  <span>Enter HOD Department Suite</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-slate-500 text-[11px] font-medium z-10">
        Copyright {new Date().getFullYear()} Sarvadnya Vidyapeeth ERP - Powered by{" "}
        <a href="https://texwebsolution.in" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-bold hover:underline">
          TexWeb Solution
        </a>
      </footer>
    </div>
  );
}

