import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  ChevronRight,
  Receipt,
} from "lucide-react";
import { authenticateStaff } from "../../hooks/authData";

export default function FeeOfficerLoginPage() {
  const navigate = useNavigate();
  const [feeId, setFeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);

    const res = await authenticateStaff(feeId, password, "fee");
    if (!res.success) {
      setLoading(false);
      setSuccessMsg("");
      setError(res.message || "Invalid Fee Officer credentials.");
      return;
    }

    setSuccessMsg("Authenticating... Opening Fee Desk Portal");
    sessionStorage.setItem(
      "erp_fee_officer_auth",
      JSON.stringify({
        email: res.account.email,
        name: res.account.name,
        role: res.account.role,
        loginAt: new Date().toISOString(),
      })
    );

    setTimeout(() => {
      navigate("/fee-officer-dashboard");
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Ambient Glows Matching Student Theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/images/Logo/logo.webp"
            alt="Sarvadnya Vidyapeeth Logo"
            className="w-10 h-10 object-contain rounded-full bg-white p-0.5 shadow-md shadow-purple-500/10 border border-purple-100 group-hover:scale-105 transition-transform"
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
              Fee &amp; Accounts Desk • Affiliated to AKU, Patna
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all shadow-sm"
          >
            <span>ERP Portal Gateway</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
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
              Fee Officer Login
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
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Fee Officer ID / Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={feeId}
                  onChange={(e) => setFeeId(e.target.value)}
                  placeholder="fee@sarvadnya.erp"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 focus:bg-white transition-all"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-sm shadow-lg shadow-purple-600/20 border border-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Fee Desk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Institutional Badge */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-purple-600" />
              <span>Offline Bank Challans, Fee Heads &amp; Ledgers Desk</span>
            </p>
          </div>
        </motion.div>
      </main>

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
