import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Building2,
  ChevronRight,
  Clock,
  GraduationCap,
  ArrowLeft,
  X,
  RotateCw,
  ShieldCheck
} from "lucide-react";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanId = employeeId.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setError("Please enter your Staff Employee ID and Password.");
      return;
    }

    setError("");
    setLoading(true);

    // Verify credentials and navigate to Dashboard
    setTimeout(() => {
      setLoading(false);
      navigate("/admin-dashboard");
    }, 600);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!resetInput.trim()) return;
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setShowForgotModal(false);
      setResetInput("");
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Light Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/images/Logo/logo.webp"
            alt="Sarvadnya Vidyapeeth Logo"
            className="w-10 h-10 object-contain rounded-full bg-white p-0.5 shadow-md shadow-indigo-500/10 border border-indigo-100 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="text-slate-900 font-extrabold text-sm sm:text-base tracking-wider uppercase font-heading">
              Sarvadnya Vidyapeeth
            </span>
            <span className="text-indigo-700 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">
              Staff & Faculty ERP Portal {/* - AKU Patna */}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/student"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 hover:border-indigo-300 transition-all"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            Switch to Student Login
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all"
          >
            Main Website <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl border border-indigo-100 p-6 sm:p-8 shadow-xl shadow-indigo-900/5 relative overflow-hidden"
        >


          {/* Header Logo */}
          <div className="text-center mb-6 pb-4 border-b border-slate-100">
            <div className="inline-block p-1.5 rounded-full bg-white shadow-md shadow-indigo-950/5 border-2 border-indigo-200 mb-3">
              <img
                src="/images/Logo/logo.webp"
                alt="Sarvadnya Vidyapeeth Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full bg-white p-1"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
              Staff & Faculty Login
            </h1>
            <p className="text-xs text-indigo-700 font-bold uppercase tracking-wider mt-1">
              Sarvadnya Vidyapeeth ERP Portal
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee / Staff ID Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Faculty Employee ID / Staff Username
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter faculty employee ID"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="--------"
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember Employee ID</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 hover:from-indigo-800 hover:to-purple-800 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 border border-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Staff ERP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link to="/student" className="text-xs font-bold text-indigo-600 hover:underline flex items-center justify-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              Are you a student? Switch to Student Login to
            </Link>
          </div>
        </motion.div>
      </main>

      {/* -- COMING SOON MODAL (Triggered on Login Submit or Notice Click) -- */}
      <AnimatePresence>
        {showComingSoonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white border border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowComingSoonModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Logo with Rotating Rings */}
              <div className="flex justify-center mb-4">
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute -inset-3 rounded-full border-2 border-dashed border-indigo-500/50 pointer-events-none"
                  />
                  <div className="w-20 h-20 rounded-full bg-white p-1 border-2 border-indigo-200 shadow-md flex items-center justify-center relative z-10">
                    <img
                      src="/images/Logo/logo.webp"
                      alt="Sarvadnya Vidyapeeth Logo"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3">
                <RotateCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>Portal Under Active Development</span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight mb-1">
                COMING SOON
              </h2>
              <p className="text-xs font-extrabold text-indigo-700 uppercase tracking-widest mb-3">
                Staff & Faculty ERP Portal - Sarvadnya Vidyapeeth
              </p>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                Thank you for logging in! The dedicated <strong>Staff & Faculty ERP System</strong> is currently undergoing live server integration. Full faculty features will be enabled soon.
              </p>

              {/* Feature Highlights */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2.5 mb-6 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Smart Attendance & Student Absence Tracking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Exam Marks, SGPA Entry & Internal Assessment</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Digital Study Material & Lecture Notes Upload</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Faculty Leave Management & Payroll Slips</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowComingSoonModal(false)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  Understood & Close
                </button>
                <Link
                  to="/student"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-700 border border-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Try Student Portal</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative"
            >
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-1">
                Reset Staff ERP Password
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter your Faculty Employee ID or registered email to request password recovery.
              </p>

              {resetSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Reset instructions sent! Check with your Department Administrator.</span>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                      Faculty Employee ID / Email
                    </label>
                    <input
                      type="text"
                      required
                      value={resetInput}
                      onChange={(e) => setResetInput(e.target.value)}
                      placeholder="Enter faculty employee ID"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 transition-colors"
                    >
                      Send Reset Request
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white/90 backdrop-blur-md py-3.5 px-6 sm:px-12 w-full">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11.5px] text-slate-600">
          <p className="text-center sm:text-left font-medium">
            Copyright {new Date().getFullYear()} <span className="text-slate-900 font-semibold">Sarvadnya Vidyapeeth {/* , Affiliated to Aryabhatta Knowledge University, Patna */}</span>. All rights reserved.
          </p>
          <p className="text-center sm:text-right text-[11px] text-slate-500">
            Designed &amp; Developed by{" "}
            <a
              href="https://texwebsolution.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-700 hover:text-indigo-800 font-black tracking-wide transition-colors hover:underline"
            >
              TexWeb Solution
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

