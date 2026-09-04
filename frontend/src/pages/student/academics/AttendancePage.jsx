import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { attendanceData, overallAttendance, studentProfile } from "../../../hooks/studentPortalData";
export default function AttendancePage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Attendance Status</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {studentProfile.course} - {studentProfile.semester} - Session: {studentProfile.session}
        </p>
      </div>

      {/* Overall Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
      >
        <h2 className="text-sm font-bold text-gray-700 mb-4">Overall Attendance Summary</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Circle */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="7" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={overallAttendance.percentage >= 75 ? "#10b981" : "#ef4444"}
                strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${overallAttendance.percentage * 2.64} ${264 - overallAttendance.percentage * 2.64}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-gray-800">{overallAttendance.percentage}%</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase">Overall</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 flex-1 w-full">
            <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xl font-extrabold text-gray-800">{overallAttendance.totalClasses}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Total Classes</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-xl font-extrabold text-emerald-600">{overallAttendance.attended}</p>
              <p className="text-[9px] font-bold text-emerald-500 uppercase">Present</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100">
              <p className="text-xl font-extrabold text-red-500">{overallAttendance.totalClasses - overallAttendance.attended}</p>
              <p className="text-[9px] font-bold text-red-400 uppercase">Absent</p>
            </div>
          </div>
        </div>
        {overallAttendance.percentage < 75 && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Your attendance is below 75%. You may not be eligible to appear in examinations.
          </div>
        )}
      </motion.div>

      {/* Subject-wise Attendance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-700">Subject-wise Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Code</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Present</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Absent</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Percentage</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((row, i) => (
                <motion.tr
                  key={row.code}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-semibold text-gray-700">{row.subject}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{row.code}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-gray-600">{row.totalClasses}</td>
                  <td className="px-4 py-3 text-center text-xs font-bold text-emerald-600">{row.attended}</td>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-red-500 hidden sm:table-cell">{row.totalClasses - row.attended}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${row.percentage >= 75 ? "bg-emerald-500" : "bg-red-500"}`}
                          style={{ width: `${row.percentage}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-bold min-w-[32px] text-right ${row.percentage >= 75 ? "text-emerald-600" : "text-red-500"}`}>
                        {row.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.percentage >= 75 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

