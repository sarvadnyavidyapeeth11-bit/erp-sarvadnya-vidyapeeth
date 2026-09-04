import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { authenticateStudent } from "../../hooks/authData";

export default function StudentLogin() {
  const navigate = useNavigate();
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    const res = await authenticateStudent(rollNumber, password);
    if (!res.success) {
      setLoading(false);
      setSuccessMsg("");
      setError(res.message || "Invalid student ID or password.");
      return;
    }
    setSuccessMsg("Logging in to Student Dashboard...");
    sessionStorage.setItem("erp_active_student_roll", res.account.studentIdentifier || rollNumber.trim());
    sessionStorage.setItem(
      "erp_student_auth",
      JSON.stringify({
        email: res.account.email,
        name: res.account.name,
        role: res.account.role,
        studentIdentifier: res.account.studentIdentifier || rollNumber.trim(),
        loginAt: new Date().toISOString(),
      })
    );
    setTimeout(() => {
      navigate("/student-dashboard");
    }, 200);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!resetInput.trim()) return;
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setShowForgotModal(false);
      setResetInput("");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Light Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="/images/Logo/logo.webp"
            alt="Sarvadnya Vidyapeeth Logo"
            className="w-10 h-10 object-contain rounded-full bg-white p-0.5 shadow-md shadow-purple-500/10 border border-purple-100"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/sarvadnya_logo.jpg";
            }}
          />
          <div className="flex flex-col">
            <span className="text-slate-900 font-extrabold text-sm sm:text-base tracking-wider uppercase font-heading">
              Sarvadnya Vidyapeeth
            </span>
            <span className="text-purple-700 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">
              Student Portal • Affiliated to AKU, Patna
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            Student Login Desk
          </span>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
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
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full bg-white p-1"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/sarvadnya_logo.jpg";
                }}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
              Student Login
            </h1>
            <p className="text-xs text-purple-700 font-bold uppercase tracking-wider mt-1">
              Sarvadnya Vidyapeeth ERP Portal
            </p>
          </div>

          {/* Feedback Messages */}
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

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Scholar No Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Student Scholar No / Enrollment ID
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Enter Scholar No or enrollment ID"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 focus:bg-white transition-all"
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
                  className="text-[11px] font-bold text-purple-600 hover:text-purple-800 transition-colors"
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 focus:bg-white transition-all"
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
                  className="w-4 h-4 rounded border-slate-300 bg-white text-purple-600 focus:ring-purple-500"
                />
                <span>Remember Scholar No</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-sm shadow-lg shadow-purple-600/20 border border-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Student ERP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Academic Help Desk Info */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              Need assistance with your credentials? Please contact the{" "}
              <span className="font-bold text-purple-700">Academic Help Desk</span>
            </p>
          </div>
        </motion.div>
      </main>

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
                Reset Student ERP Password
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter your Scholar No to request a password reset link.
              </p>

              {resetSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Reset instructions sent! Check with the ERP Help Desk.</span>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
                      Student Scholar No
                    </label>
                    <input
                      type="text"
                      required
                      value={resetInput}
                      onChange={(e) => setResetInput(e.target.value)}
                      placeholder="Enter Scholar No"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
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
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition-colors"
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
            Copyright {new Date().getFullYear()} <span className="text-slate-900 font-semibold">Sarvadnya Vidyapeeth</span>. All rights reserved.
          </p>
          <p className="text-center sm:text-right text-[11px] text-slate-500">
            Designed &amp; Developed by{" "}
            <a
              href="https://texwebsolution.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 hover:text-purple-800 font-black tracking-wide transition-colors hover:underline"
            >
              TexWeb Solution
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
