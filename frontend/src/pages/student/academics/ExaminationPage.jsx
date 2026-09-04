import React, { useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Award,
  CheckCircle2,
  Printer,
  Sparkles,
  BookOpen,
  Building,
  RotateCcw
} from "lucide-react";
import { examDetailsData } from "../../../hooks/studentExtendedData";
import ExamResultPage from "./ExamResultPage";

export default function ExaminationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const routeSubTab = pathParts.length >= 3 && pathParts[1] === "examination" ? pathParts[2] : null;
  const activeTab = routeSubTab || searchParams.get("tab") || "hall-ticket";

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [revalSubmitted, setRevalSubmitted] = useState(false);

  const tabs = [
    { id: "hall-ticket", label: "Hall Ticket", icon: FileText, path: "/student-dashboard/examination/hall-ticket" },
    { id: "form", label: "Exam Form", icon: CheckCircle2, path: "/student-dashboard/examination/form" },
    { id: "seating", label: "Seating Plan", icon: Building, path: "/student-dashboard/examination/seating" },
    { id: "marks", label: "Internal Marks", icon: BookOpen, path: "/student-dashboard/examination/marks" },
    { id: "results", label: "Results & Grade Card", icon: Award, path: "/student-dashboard/examination/results" },
    { id: "revaluation", label: "Revaluation", icon: RotateCcw, path: "/student-dashboard/examination/revaluation" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-gray-200 shadow-sm min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" /> Examination Sub-Pages Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Exams, Admit Cards & Evaluation</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
              Dedicated URL sub-pages for Admit Cards, Exam Forms, Seating Plans, Internal Marks & Results.
            </p>
          </div>
          <div className="bg-purple-50/70 border border-purple-100 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] uppercase font-extrabold text-purple-700 tracking-wider">Exam Controller Office</p>
            <p className="text-base font-black text-slate-900">{examDetailsData.examForms[0]?.examName || "No upcoming exam assigned"}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none border-t border-gray-100 pt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200 font-black scale-[1.02]"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dedicated Sub-Page Rendering */}
      {activeTab === "hall-ticket" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Official Admit Card / Hall Ticket Page</h2>
              <p className="text-xs text-gray-500">{examDetailsData.examForms[0]?.examName || "No published hall ticket"}</p>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all">
              <Printer className="w-4 h-4" /> Download / Print Hall Ticket
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
            <div>
              <span className="text-gray-400 font-medium block">Student Name</span>
              <span className="font-bold text-gray-800 text-sm">{examDetailsData.hallTicket.studentName}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium block">Scholar No</span>
              <span className="font-bold text-gray-800 text-sm">{examDetailsData.hallTicket.rollNo}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium block">Examination Center</span>
              <span className="font-bold text-gray-800 text-sm">{examDetailsData.hallTicket.examCenter}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 font-bold">
                  <th className="p-3">Date</th>
                  <th className="p-3">Timing</th>
                  <th className="p-3">Paper Code</th>
                  <th className="p-3">Subject Name</th>
                  <th className="p-3">Invigilator Sign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {examDetailsData.hallTicket.dates.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80">
                    <td className="p-3 font-bold text-purple-700">{row.date}</td>
                    <td className="p-3 font-semibold text-gray-600">{row.time}</td>
                    <td className="p-3 font-bold text-gray-800">{row.code}</td>
                    <td className="p-3 font-bold text-gray-900">{row.subject}</td>
                    <td className="p-3 text-gray-400 italic">Pending Exam</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "form" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-200">
                  AKU University Exam Portal
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                  Attendance Eligible (&gt;75%)
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> University End-Term Examination Form & Fee Clearance
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Verify enrolled subject papers, calculate exam registration fee & late submission fines, and generate official Hall Ticket.
              </p>
            </div>
          </div>

          {/* Exam Registration Form Card */}
          <div className="p-5 rounded-2xl border border-purple-200 bg-slate-50/70 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono bg-white p-4 rounded-xl border border-gray-200">
              <div>
                <span className="text-slate-400 text-[10px] font-sans font-bold block uppercase">Examination Program</span>
                <strong className="text-slate-900 text-sm font-sans block">{examDetailsData.examForms[0]?.examName || "Exam not assigned"}</strong>
                <span className="text-purple-700 font-bold">{examDetailsData.hallTicket.examCenter || "Exam center not assigned"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-sans font-bold block uppercase">Submission Deadlines</span>
                <p className="font-sans font-semibold text-slate-800">Without Fine: <strong className="text-emerald-700">{examDetailsData.examForms[0]?.deadline || "Not assigned"}</strong></p>
                <p className="font-sans font-semibold text-slate-800">With Late Fine: <strong className="text-amber-700">Not assigned</strong></p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-sans font-bold block uppercase">Attendance Status</span>
                <p className="text-emerald-700 font-black text-sm">Not available</p>
                <span className="text-[10px] text-slate-500 font-sans">Attendance eligibility will appear after records are published.</span>
              </div>
            </div>

            {/* Registered Exam Subject Papers Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Enrolled Exam Papers & Laboratory Practical Subjects:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {examDetailsData.internalMarks.map((sub, i) => (
                  <div key={i} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-purple-700">{sub.code}</span>
                      <p className="font-bold text-slate-900 leading-tight">{sub.name || sub.subject}</p>
                      <span className="text-[10px] text-slate-400">{sub.type || "Exam paper"}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee & Late Fine Calculation Box */}
            <div className="p-4 rounded-xl bg-purple-950 text-white space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Standard Exam Registration Fee:</span>
                <span>Rs.1,500</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Marksheet & Evaluation Charges:</span>
                <span>Rs.200</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Late Submission Penalty (Submitted within Deadline):</span>
                <span>Rs.0 (Waived)</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Attendance Condonation Fine (&gt;75% Attendance):</span>
                <span>Rs.0 (Eligible)</span>
              </div>
              <div className="pt-2 border-t border-purple-800 flex justify-between items-center text-sm font-black">
                <span className="font-sans text-white uppercase">Total Net Exam Fee Payable:</span>
                <span className="text-emerald-400 text-lg font-bold">Rs.1,700</span>
              </div>
            </div>

            {/* Action Bar */}
            {!formSubmitted ? (
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-500 font-medium">
                  Clicking below registers exam form and generates official verified Hall Ticket.
                </p>
                <button
                  onClick={() => setFormSubmitted(true)}
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Submit Exam Form & Clear Fee (Rs.1,700)
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold space-y-2">
                <p className="text-sm font-black flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Exam Form Registered & Fee Cleared!
                </p>
                <p className="text-emerald-700 font-medium">
                  Exam form submitted. Receipt and admit-card status will appear after accounts verification.
                </p>
                <button
                  onClick={() => navigate("/student-dashboard/examination/hall-ticket")}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-extrabold cursor-pointer"
                >
                  View & Download Hall Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "seating" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-600" /> Dedicated Seating Arrangement Page
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Exam Location Details</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-gray-200 pb-1">
                  <span className="text-gray-500">Exam Hall / Room</span>
                  <span className="font-bold text-gray-900">{examDetailsData.seatingPlan.roomNo}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-1">
                  <span className="text-gray-500">Allocated Bench No</span>
                  <span className="font-bold text-purple-700">{examDetailsData.seatingPlan.benchNo}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-1">
                  <span className="text-gray-500">Reporting Time</span>
                  <span className="font-bold text-emerald-600">{examDetailsData.seatingPlan.reportingTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "marks" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" /> Dedicated Internal & Practical Marks Page
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 font-bold">
                  <th className="p-3">Code</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Internal 1 (20)</th>
                  <th className="p-3">Internal 2 (20)</th>
                  <th className="p-3">Assignment (10)</th>
                  <th className="p-3">Total Internal (50)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {examDetailsData.internalMarks.map((m, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-purple-700">{m.code}</td>
                    <td className="p-3 font-bold text-gray-800">{m.subject}</td>
                    <td className="p-3 font-semibold text-gray-600">{m.internal1}</td>
                    <td className="p-3 font-semibold text-gray-600">{m.internal2}</td>
                    <td className="p-3 font-semibold text-gray-600">{m.assignment}</td>
                    <td className="p-3 font-extrabold text-emerald-700">{m.total} / {m.maxMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "results" && <ExamResultPage />}

      {activeTab === "revaluation" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Revaluation & Supplementary Exam Portal</h2>
              <p className="text-xs text-gray-500">Apply for answer-sheet recount or supplementary test</p>
            </div>
            <button
              onClick={() => setRevalSubmitted(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow"
            >
              + New Revaluation Request
            </button>
          </div>

          {revalSubmitted && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              Done New Revaluation request submitted successfully. Processing fee charged to ledger.
            </div>
          )}

          <div className="space-y-3">
            {examDetailsData.revaluationRequests.map((req, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-purple-700 block">{req.reqId}</span>
                  <span className="font-bold text-gray-800 text-sm">{req.subject} ({req.sem})</span>
                  <p className="text-gray-500 mt-0.5">Applied on: {req.appliedDate} - Fee: {req.feePaid}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">{req.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



