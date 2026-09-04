import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, FileText, CheckCircle2, AlertCircle, Clock, Plus, X, Sparkles } from "lucide-react";

export default function TeacherLeavePage() {
  const [leaveType, setLeaveType] = useState("Casual Leave (CL)");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [leaveHistory, setLeaveHistory] = useState([
    { id: 1, type: "Casual Leave (CL)", from: "12 May 2025", to: "13 May 2025", days: 2, reason: "Family Function", status: "Approved" },
    { id: 2, type: "Duty Leave (DL)", from: "20 Jun 2025", to: "20 Jun 2025", days: 1, reason: "University Exam Evaluation", status: "Approved" },
    { id: 3, type: "Medical Leave (ML)", from: "02 Aug 2025", to: "04 Aug 2025", days: 3, reason: "Fever & Doctor Consultation", status: "Approved" },
  ]);

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason.trim()) return;

    const newLeave = {
      id: Date.now(),
      type: leaveType,
      from: fromDate,
      to: toDate,
      days: 1,
      reason: reason,
      status: "Pending Approval",
    };

    setLeaveHistory([newLeave, ...leaveHistory]);
    setShowApplyModal(false);
    setFromDate("");
    setToDate("");
    setReason("");
    setSuccessMsg("Leave application submitted successfully for HOD/Principal review!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* ── Page Header Banner ── */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Faculty HRMS Module
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Teacher Leave Management
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Apply for casual, duty, or medical leaves and track approval status.
            </p>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Apply New Leave</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Leave Balance Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Casual Leave (CL)</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">8 / 12</p>
            <span className="text-[10px] text-gray-400 font-medium">Days Remaining</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Medical Leave (ML)</p>
            <p className="text-2xl font-black text-purple-600 mt-1">7 / 10</p>
            <span className="text-[10px] text-gray-400 font-medium">Days Remaining</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Duty Leave (DL)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">4 Used</p>
            <span className="text-[10px] text-gray-400 font-medium">Exam / Duty Calls</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Leave History Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" /> Leave Application History
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 font-bold border-b border-gray-100">
                <th className="p-3">Leave Type</th>
                <th className="p-3">From Date</th>
                <th className="p-3">To Date</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaveHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-3 font-bold text-gray-800">{item.type}</td>
                  <td className="p-3 text-gray-600">{item.from}</td>
                  <td className="p-3 text-gray-600">{item.to}</td>
                  <td className="p-3 font-semibold text-gray-700">{item.days} Day(s)</td>
                  <td className="p-3 text-gray-600 max-w-xs truncate">{item.reason}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "Approved"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Apply Leave Modal ── */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100"
            >
              <button
                onClick={() => setShowApplyModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-gray-800 mb-4">Apply Leave Request</h2>

              <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-600 block mb-1">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-800 outline-none"
                  >
                    <option>Casual Leave (CL)</option>
                    <option>Medical Leave (ML)</option>
                    <option>Duty Leave (DL)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-600 block mb-1">From Date</label>
                    <input
                      type="date"
                      required
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-600 block mb-1">To Date</label>
                    <input
                      type="date"
                      required
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-600 block mb-1">Reason for Leave</label>
                  <textarea
                    rows={3}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a valid reason for your leave..."
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md"
                >
                  Submit Application
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
