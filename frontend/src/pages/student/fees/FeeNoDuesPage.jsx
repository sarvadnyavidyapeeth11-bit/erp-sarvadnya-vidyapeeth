import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  FileCheck,
  Printer,
  QrCode,
  ShieldCheck,
  Send,
  IndianRupee,
  GraduationCap,
  Info,
  Layers,
  X,
  Sparkles
} from "lucide-react";
import FeeNavigationHeader from "./FeeNavigationHeader";
import {
  getFeeDetails,
  getStudentNoDues,
  studentProfile,
  submitStudentNoDuesRequest
} from "../../../hooks/studentPortalData";

const semesterOptions = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8"
];

const getStoredNoDuesRows = () => {
  if (typeof window === "undefined") return [];
  try {
    const rows = JSON.parse(localStorage.getItem("erp_student_no_dues") || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default function FeeNoDuesPage() {
  const [showNocModal, setShowNocModal] = useState(false);
  const [feesState, setFeesState] = useState(() => ({ ...getFeeDetails() }));
  const [requests, setRequests] = useState(() => getStoredNoDuesRows());
  const [semester, setSemester] = useState(studentProfile.semester || "Semester 1");
  const [session, setSession] = useState(studentProfile.session || studentProfile.academicSession || "2025-2026");
  const [notice, setNotice] = useState("");
  const institutionName = studentProfile.collegeName || "Sarvadnya Vidyapeeth Institute of Technology";

  const roll = studentProfile.rollNumber || studentProfile.scholarNo || "";
  const currentRequest = getStudentNoDues(roll, semester, session);
  const feeCleared = (Number(feesState.totalFees) || 0) > 0 && (Number(feesState.totalPending) || 0) === 0;
  const accountsCleared = Boolean(currentRequest.accountsCleared || currentRequest.feeCleared || feeCleared);
  const nocApproved = String(currentRequest.requestStatus || "").includes("Approved") || accountsCleared;
  const hasRequested = currentRequest.requestStatus && currentRequest.requestStatus !== "Not Requested";

  const myRequests = useMemo(() => requests.filter((row) => (
    String(row.rollNumber || "") === String(roll || "") ||
    String(row.scholarNo || "") === String(studentProfile.scholarNo || "")
  )), [requests, roll]);

  const reloadData = () => {
    setFeesState({ ...getFeeDetails() });
    setRequests(getStoredNoDuesRows());
    setSession(studentProfile.session || studentProfile.academicSession || "");
  };

  useEffect(() => {
    reloadData();
    window.addEventListener("noDuesUpdated", reloadData);
    window.addEventListener("feeDataUpdated", reloadData);
    window.addEventListener("storage", reloadData);
    return () => {
      window.removeEventListener("noDuesUpdated", reloadData);
      window.removeEventListener("feeDataUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  const handleSubmitRequest = (event) => {
    event.preventDefault();
    const result = submitStudentNoDuesRequest({ semester, session, purpose: "Semester NOC" });
    if (!result) {
      window.alert("Semester aur session select karke request submit karein.");
      return;
    }
    setNotice(`${semester} (${session}) ke liye NOC clearance request submit ho gaya.`);
    reloadData();
    setTimeout(() => setNotice(""), 4500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
      <FeeNavigationHeader
        title="No Dues Clearance Certificate (NOC)"
        description="Apply for semester-wise accounts and fee clearance for exam form approvals and official semester progression."
        badge="NOC Clearance Desk"
      />

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {notice}
          </span>
          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
            Submitted
          </span>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Selected Term</p>
            <p className="text-lg font-black text-slate-900 truncate mt-0.5">{semester}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
            accountsCleared ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
          }`}>
            <IndianRupee className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Accounts Desk</p>
            <p className={`text-lg font-black truncate mt-0.5 ${accountsCleared ? "text-emerald-700" : "text-rose-700 font-mono"}`}>
              {accountsCleared ? "Fee Cleared" : `Due Rs.${(feesState.totalPending || 0).toLocaleString("en-IN")}`}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
            nocApproved ? "bg-purple-50 border-purple-100 text-purple-600" : "bg-slate-100 border-slate-200 text-slate-500"
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">NOC Clearance</p>
            <p className={`text-lg font-black truncate mt-0.5 ${nocApproved ? "text-purple-700" : "text-slate-800"}`}>
              {nocApproved ? "Ready To Print" : hasRequested ? "In Verification" : "Not Requested"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
              <Send className="w-5 h-5 text-purple-600" />
              Apply for Semester NOC
            </h3>
            <span className="text-[11px] font-extrabold uppercase text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Clearance Form
            </span>
          </div>

          {/* Student Profile Info Pill Bar */}
          <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Student Name</p>
              <p className="font-extrabold text-slate-900 truncate">{studentProfile.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Scholar / Roll</p>
              <p className="font-extrabold text-slate-900 font-mono truncate">{studentProfile.scholarNo || studentProfile.rollNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Course</p>
              <p className="font-extrabold text-slate-900 truncate">{studentProfile.course || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Current Pending</p>
              <p className="font-mono font-black text-rose-700 truncate">Rs.{(feesState.totalPending || 0).toLocaleString("en-IN")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-800 mb-1.5">
                Target Semester <span className="text-rose-500">*</span>
              </label>
              <select
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold text-slate-900 text-sm transition-all"
              >
                {semesterOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-extrabold text-slate-800 mb-1.5">
                Academic Session <span className="text-rose-500">*</span>
              </label>
              <input
                required
                readOnly
                value={session}
                placeholder="Auto fetched from student profile"
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm cursor-not-allowed"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200/80 text-[11px] text-purple-950 font-semibold flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span>NOC certificate generation accounts and fee clearance ke basis par hoga. Fee Officer verification ke baad printable certificate unlock hoga.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Send className="w-4 h-4" /> Submit NOC Clearance Request
            </button>
          </form>
        </div>

        {/* Right Requests List Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
              <FileCheck className="w-5 h-5 text-purple-600" />
              My Semester NOC Requests
            </h3>
            <span className="text-[11px] font-mono font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {myRequests.length} Requests
            </span>
          </div>

          <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
            {myRequests.length === 0 ? (
              <div className="py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">No semester NOC requests submitted yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  Submit a request for your active semester to initiate accounts and fee clearance.
                </p>
              </div>
            ) : (
              myRequests.map((request) => {
                const ready = String(request.requestStatus || "").includes("Approved") || Boolean(request.accountsCleared || request.feeCleared);

                return (
                  <div
                    key={request.id || `${request.rollNumber}-${request.semester}-${request.session}`}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition-all text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black text-slate-900 text-sm">{request.semester} - {request.session}</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black ${
                          ready
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {ready ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {ready ? "Approved & Ready" : request.requestStatus || "Pending Clearance"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-slate-500">Accounts</p>
                        <p className={`font-bold ${request.accountsCleared ? "text-emerald-700" : "text-amber-700"}`}>
                          {request.accountsCleared ? "Cleared" : "Pending"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-slate-500">Requested Date</p>
                        <p className="font-bold text-slate-800 font-mono">{request.requestedDate || "N/A"}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!ready}
                      onClick={() => setShowNocModal(true)}
                      className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        ready
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      <Printer className="w-4 h-4" /> View & Print Official NOC Certificate
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Official NOC Certificate Modal */}
      <AnimatePresence>
        {showNocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92dvh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Official Semester NOC Certificate
                </span>
                <button
                  onClick={() => setShowNocModal(false)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div id="noc-certificate-print" className="p-7 border-2 border-purple-900/20 rounded-2xl bg-white space-y-5 shadow-xs">
                <div className="text-center space-y-1.5 border-b-2 border-purple-900/20 pb-5">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2 font-black text-xl">
                    SV
                  </div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">{institutionName}</h2>
                  <p className="text-xs font-bold text-slate-600">Official Semester No-Dues Clearance Certificate</p>
                  <p className="text-xs font-mono text-purple-700 font-extrabold">
                    NOC-{studentProfile.scholarNo || studentProfile.rollNumber || "VERIFIED"}-{semester} - {session}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
                  <div>
                    <span className="text-slate-500">Student:</span> <strong className="text-slate-900">{studentProfile.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Scholar No:</span> <strong className="text-slate-900">{studentProfile.scholarNo || studentProfile.rollNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Course:</span> <strong className="text-slate-900">{studentProfile.course}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Semester:</span> <strong className="text-slate-900">{semester} ({session})</strong>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Clearance Wing</th>
                        <th className="p-3">Clearance Status</th>
                        <th className="p-3 text-right">Verification Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3 font-bold text-slate-900">Accounts & Fee Clearance</td>
                        <td className="p-3 text-emerald-700 font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cleared (Zero Balance)
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-500">ACC-OK-2026</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-12 h-12 text-purple-900" />
                    <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase">Digitally Authenticated</p>
                      <p className="text-[10px] text-slate-500">Valid for selected examination & session only</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-10 h-10 text-emerald-600" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-200 transition-all"
                >
                  <Printer className="w-4 h-4" /> Print Certificate
                </button>
                <button
                  onClick={() => setShowNocModal(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
