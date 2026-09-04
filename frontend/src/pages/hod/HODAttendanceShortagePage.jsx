import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  Send,
  Users,
  Printer,
  ShieldAlert,
  Percent,
  Check
} from "lucide-react";
import { getAttendanceShortage, markAttendanceWarning, getCourses, getActiveHODProfile, matchesActiveHODDepartment } from "../../hooks/academicMasterData";
import Pagination from "../../components/common/Pagination";

export default function HODAttendanceShortagePage() {
  const [students, setStudents] = useState(() => getAttendanceShortage());
  const [warningsSent, setWarningsSent] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const reloadStudents = () => {
    setStudents(getAttendanceShortage());
  };

  useEffect(() => {
    window.addEventListener("attendanceShortageUpdated", reloadStudents);
    window.addEventListener("academicDataUpdated", reloadStudents);
    window.addEventListener("storage", reloadStudents);
    return () => {
      window.removeEventListener("attendanceShortageUpdated", reloadStudents);
      window.removeEventListener("academicDataUpdated", reloadStudents);
      window.removeEventListener("storage", reloadStudents);
    };
  }, []);

  const departmentCourseCodes = new Set(
    getCourses()
      .filter((course) => matchesActiveHODDepartment(course, getActiveHODProfile()))
      .map((course) => course.code)
      .filter(Boolean)
  );
  const defaulters = students
    .map((s) => ({ ...s, warningSent: Boolean(s.warningSent || warningsSent[s.id || s.rollNumber]) }))
    .filter((s) => departmentCourseCodes.has(s.course) && Number(s.percentage) < 75);

  const handleSendWarning = (id, studentName) => {
    markAttendanceWarning(id);
    setWarningsSent(prev => ({ ...prev, [id]: true }));
    setSuccessMsg(`Official Attendance Shortage Notice & SMS sent to ${studentName}'s parents!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filtered = defaulters.filter(d =>
    String(d.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(d.rollNumber || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-extrabold border border-rose-200">
              Department Attendance Monitor
            </span>
            <span className="px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              {defaulters.length} Students &lt; 75%
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Attendance Shortage & Defaulters Desk
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Identify students falling short of 75% mandatory university attendance and issue automated parent warnings.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print Shortage List</span>
        </button>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Defaulter Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or Scholar No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <span className="text-xs font-bold text-slate-500 hidden sm:block">Threshold: 75.0% Mandatory</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Scholar No</th>
                <th className="py-3.5 px-4">Class / Sem</th>
                <th className="py-3.5 px-4">Attended / Total</th>
                <th className="py-3.5 px-4">Attendance %</th>
                <th className="py-3.5 px-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No Attendance Shortage Defaulters</p>
                    <p className="text-xs text-slate-400 mt-0.5">All enrolled department students are above the 75% mandatory attendance threshold.</p>
                  </td>
                </tr>
              ) : (
                filtered
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((student) => {
                  const isSevere = student.percentage < 60;
                  return (
                    <tr key={student.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900">{student.studentName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{student.rollNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{student.batch} - {student.semester}</td>
                      <td className="py-3.5 px-4 font-mono">{student.lecturesAttended} / {student.totalLecturesHeld}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                          isSevere
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {student.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {student.warningSent ? (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Notice Dispatched
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendWarning(student.id, student.studentName)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send Parent Notice
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filtered.length / itemsPerPage) || 1}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
          itemsPerPageOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
}

