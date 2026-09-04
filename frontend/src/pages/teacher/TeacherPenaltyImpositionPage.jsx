import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  IndianRupee,
  ShieldAlert,
  Users,
  Calendar,
  Layers,
  FileText
} from "lucide-react";
import { feeDetails } from "../../hooks/studentPortalData";

export default function TeacherPenaltyImpositionPage() {
  const [selectedCourse, setSelectedCourse] = useState("BCA");
  const [selectedSemester, setSelectedSemester] = useState("Semester VI");
  const [selectedStudentRoll, setSelectedStudentRoll] = useState("BC20240101");
  const [penaltyType, setPenaltyType] = useState("Attendance Shortage (<75%)");
  const [amount, setAmount] = useState("1000");
  const [reason, setReason] = useState("Attendance fell to 62.4% during semester review. Condonation penalty applied.");
  const [actionOption, setActionOption] = useState("Add to Fee Ledger & Hold Admit Card");
  const [successMsg, setSuccessMsg] = useState("");

  const [studentsRoster] = useState([
    { roll: "BC20240101", name: "Rahul Sharma", course: "BCA", sem: "Semester VI", attendance: 62.4 },
    { roll: "BC20240114", name: "Rohit Verma", course: "BCA", sem: "Semester VI", attendance: 68.0 },
    { roll: "BC20240122", name: "Sneha Patel", course: "BCA", sem: "Semester VI", attendance: 88.5 },
    { roll: "BB20240205", name: "Pooja Kumari", course: "BBA", sem: "Semester IV", attendance: 58.2 },
    { roll: "BT20240312", name: "Aman Gupta", course: "B.Tech", sem: "Semester VI", attendance: 71.5 },
    { roll: "MC20240409", name: "Priya Sen", course: "MCA", sem: "Semester II", attendance: 64.0 },
  ]);

  const [imposedFines, setImposedFines] = useState([
    {
      id: "FIN-2026-081",
      studentRoll: "BC20240101",
      studentName: "Rahul Sharma",
      course: "BCA Sem VI",
      type: "Attendance Shortage (<75%)",
      amount: 1000,
      reason: "62.4% aggregate attendance recorded before mid-term exams.",
      imposedBy: "Dr. Anjali Sharma (HOD / BCA)",
      date: "22-Aug-2026",
      status: "Pending Collection",
    },
    {
      id: "FIN-2026-079",
      studentRoll: "BC20240114",
      studentName: "Rohit Verma",
      course: "BCA Sem VI",
      type: "Lab Equipment Breakage / Damage",
      amount: 500,
      reason: "Microcontroller Board & Sensor damage in IoT Lab #2.",
      imposedBy: "Prof. Rajesh Kumar (Lab Incharge)",
      date: "18-Aug-2026",
      status: "Paid at Cash Desk",
    },
    {
      id: "FIN-2026-072",
      studentRoll: "BB20240205",
      studentName: "Pooja Kumari",
      course: "BBA Sem IV",
      type: "Late Project / Assignment Delay Fine",
      amount: 300,
      reason: "Case Study presentation submitted 5 days post deadline.",
      imposedBy: "Dr. Sunita Mehta (Faculty)",
      date: "10-Aug-2026",
      status: "Pending Collection",
    },
  ]);

  const penaltyPresets = [
    { type: "Attendance Shortage (<75%)", defaultAmt: "1000", defaultReason: "Attendance fell below mandatory 75% threshold." },
    { type: "Lab Equipment Breakage / Damage", defaultAmt: "750", defaultReason: "Lab apparatus/hardware damaged during practical session." },
    { type: "Late Project / Assignment Delay Fine", defaultAmt: "300", defaultReason: "Major term project submitted after the final cutoff date." },
    { type: "Classroom Discipline & Misconduct", defaultAmt: "500", defaultReason: "Violation of academic code of conduct in classroom." },
    { type: "Library Book Overdue / Damage", defaultAmt: "250", defaultReason: "Reference book returned damaged or past due date." },
  ];

  const handlePenaltyPresetChange = (pType) => {
    setPenaltyType(pType);
    const found = penaltyPresets.find((p) => p.type === pType);
    if (found) {
      setAmount(found.defaultAmt);
      setReason(found.defaultReason);
    }
  };

  const handleImposePenalty = (e) => {
    e.preventDefault();
    if (!amount || !reason) return;

    const student = studentsRoster.find((s) => s.roll === selectedStudentRoll) || {
      name: "Student",
      course: selectedCourse,
      sem: selectedSemester,
    };

    const newFine = {
      id: `FIN-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentRoll: selectedStudentRoll,
      studentName: student.name,
      course: `${student.course} ${student.sem}`,
      type: penaltyType,
      amount: Number(amount),
      reason: reason,
      imposedBy: "Dr. Anjali Sharma (HOD / Faculty)",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Pending Collection",
    };

    setImposedFines([newFine, ...imposedFines]);

    // Update global fee details for student if matching current student
    if (feeDetails && feeDetails.feeBreakup) {
      feeDetails.feeBreakup.push({
        head: `${penaltyType} (${student.name})`,
        amount: Number(amount),
        sem: selectedSemester,
        category: "Penalties & Late Fines",
      });
      feeDetails.totalFees += Number(amount);
      feeDetails.totalPending += Number(amount);

      window.dispatchEvent(
        new CustomEvent("feeDataUpdated", {
          detail: {
            action: "FACULTY_FINE_LEVIED",
            fine: newFine,
          },
        })
      );
    }

    setSuccessMsg(`Done Fine of Rs.${Number(amount).toLocaleString("en-IN")} successfully imposed on ${student.name} (${selectedStudentRoll}). Debited to fee ledger!`);
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  const handleWaiveFine = (id) => {
    setImposedFines(prev => prev.filter(f => f.id !== id));
    setSuccessMsg("Done Penalty record revoked/waived by Faculty Authority.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-6"
    >
      {/* ── Top Header ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-200 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Faculty Discipline & Fine Authority
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Penalty & Fine Imposition Desk
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Impose Attendance Shortage Condonation (&lt;75%), Lab Equipment Breakage, and Academic Delay fines on specific students.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 p-3 rounded-2xl shrink-0">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold text-rose-800 tracking-wider">Active Fines Issued</p>
            <p className="text-xl font-black text-slate-900 leading-tight">{imposedFines.length} Records</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Main Layout: Impose Form (Left) & Audit Registry (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Penalty Imposition */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" /> Impose New Fine / Penalty
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Penalty will be debited to student's accounts ledger and shown at Cash Desk & Exam Form.
              </p>
            </div>

            <form onSubmit={handleImposePenalty} className="space-y-3.5 text-xs">
              {/* Select Student from Roster */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Target Student *</label>
                <select
                  value={selectedStudentRoll}
                  onChange={(e) => setSelectedStudentRoll(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 outline-none focus:border-rose-500"
                >
                  {studentsRoster.map((st) => (
                    <option key={st.roll} value={st.roll}>
                      {st.name} ({st.roll}) - {st.course} {st.sem} - Attendance: {st.attendance}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Penalty Category / Type */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Penalty Violation Type *</label>
                <select
                  value={penaltyType}
                  onChange={(e) => handlePenaltyPresetChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 outline-none focus:border-rose-500"
                >
                  {penaltyPresets.map((p) => (
                    <option key={p.type} value={p.type}>
                      {p.type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Penalty Amount */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Fine Amount (Rs.) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-rose-500"
                />
              </div>

              {/* Reason / Incident Description */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Reason / Incident Note *</label>
                <textarea
                  rows="2"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for penalty..."
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-slate-900 font-semibold outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Action Policy */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Action Policy</label>
                <select
                  value={actionOption}
                  onChange={(e) => setActionOption(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-slate-800 text-xs"
                >
                  <option value="Add to Fee Ledger & Hold Admit Card">Add to Student Fee Ledger & Withhold Admit Card</option>
                  <option value="Direct Cash Clearance at Department">Direct Cash Clearance at Department</option>
                  <option value="Disciplinary Warning with Fine">Disciplinary Warning with Fine</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                Impose Penalty (Rs.{amount ? Number(amount).toLocaleString("en-IN") : 0}) on Student
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Fines Registry */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-600" /> Faculty Imposed Penalties Registry
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Real-time log of disciplinary, attendance shortage, and lab breakage fines.
                </p>
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                {imposedFines.length} Issued
              </span>
            </div>

            <div className="max-h-[580px] overflow-y-auto pr-1.5 space-y-3 scrollbar-thin">
              {imposedFines.map((fine) => (
                <div
                  key={fine.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-rose-300 transition-all space-y-2.5 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-rose-700">{fine.id}</span>
                        <h4 className="text-sm font-black text-slate-900">{fine.studentName} ({fine.studentRoll})</h4>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {fine.course}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-rose-900 mt-1">{fine.type}</p>
                      <p className="text-[11px] text-slate-500 italic mt-0.5">"{fine.reason}"</p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-base font-black text-slate-900 font-mono">
                        Rs.{fine.amount.toLocaleString("en-IN")}
                      </p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block mt-1 ${
                        fine.status.includes("Paid") ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {fine.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                    <span className="text-slate-500 font-medium">
                      By: <strong className="text-slate-700">{fine.imposedBy}</strong> - Date: {fine.date}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleWaiveFine(fine.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 cursor-pointer"
                      title="Revoke / Waive Fine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

