import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, FileText, CheckCircle2, Calendar } from "lucide-react";
import { examResults, examSchedule, studentProfile } from "../../../hooks/studentPortalData";
export default function ExamResultPage() {
  const [activeTab, setActiveTab] = useState("results");
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Examination Portal</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {studentProfile.course} - {studentProfile.semester} - Scholar No: {studentProfile.scholarNo || studentProfile.rollNumber}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("results")}
          className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 ${activeTab === "results"
            ? "border-purple-600 text-purple-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
          Exam Results
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 ${activeTab === "schedule"
            ? "border-purple-600 text-purple-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
          Upcoming Exam Schedule
        </button>
      </div>

      {activeTab === "results" ? (
        <div className="space-y-5">
          {examResults.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-800">No Examination Results Published Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                End-term examination scorecards and SGPA/CGPA grades will appear here once verified and locked by the Examination Cell.
              </p>
            </div>
          ) : (
            examResults.map((result, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Semester Summary Header */}
                <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-gray-800">{result.semester}</h2>
                    <p className="text-[11px] text-gray-500">Session: {result.session}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">SGPA</span>
                      <span className="text-base font-extrabold text-purple-600">{result.sgpa}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">CGPA</span>
                      <span className="text-base font-extrabold text-indigo-600">{result.cgpa}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      {result.status}
                    </span>
                  </div>
                </div>

                {/* Marks Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-white">
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase">Subject</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase hidden sm:table-cell">Code</th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase">Internal (30)</th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase">External (70)</th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase">Total</th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.subjects.map((sub) => (
                        <tr key={sub.code} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 text-xs font-semibold text-gray-700">{sub.name}</td>
                          <td className="px-4 py-2.5 hidden sm:table-cell">
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{sub.code}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs text-gray-600">{sub.internal}</td>
                          <td className="px-4 py-2.5 text-center text-xs text-gray-600">{sub.external}</td>
                          <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-800">{sub.total}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100">
                              {sub.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50/60">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              University End-Term Date Sheet
            </h2>
          </div>
          <div className="overflow-x-auto">
            {examSchedule.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-800">No Exam Schedule Released</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upcoming mid-term and end-term date sheets will appear here once scheduled by the University Exam Controller.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase">Date & Day</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase">Subject</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase">Timing</th>
                  </tr>
                </thead>
                <tbody>
                  {examSchedule.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-purple-50/30">
                      <td className="px-4 py-3 text-xs font-bold text-gray-700">
                        {item.date} <span className="text-gray-400 font-normal">({item.day})</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-purple-700">{item.subject}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

