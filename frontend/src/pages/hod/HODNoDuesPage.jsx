import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Users,
  GraduationCap,
  Clock,
  Printer
} from "lucide-react";
import { getStudentVerifications } from "../../hooks/adminData";
import { getActiveHODProfile, matchesActiveHODDepartment } from "../../hooks/academicMasterData";
import { getStudentNoDues, updateStudentAcademicNoDues } from "../../hooks/studentPortalData";
import Pagination from "../../components/common/Pagination";

export default function HODNoDuesPage() {
  const [students, setStudents] = useState(() => getStudentVerifications());
  const [searchTerm, setSearchTerm] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const reloadStudents = () => {
    setStudents(getStudentVerifications());
  };

  useEffect(() => {
    window.addEventListener("studentEnrollmentUpdated", reloadStudents);
    window.addEventListener("noDuesUpdated", reloadStudents);
    window.addEventListener("feeDataUpdated", reloadStudents);
    window.addEventListener("storage", reloadStudents);
    return () => {
      window.removeEventListener("studentEnrollmentUpdated", reloadStudents);
      window.removeEventListener("noDuesUpdated", reloadStudents);
      window.removeEventListener("feeDataUpdated", reloadStudents);
      window.removeEventListener("storage", reloadStudents);
    };
  }, []);

  const clearances = students
    .filter((student) => matchesActiveHODDepartment(student, getActiveHODProfile()))
    .flatMap(s => {
      const scholarVal = s.scholarNo || s.rollNumber;
      let requests = [];
      try {
        requests = JSON.parse(localStorage.getItem("erp_student_no_dues") || "[]");
        if (!Array.isArray(requests)) requests = [];
      } catch (error) {
        console.error(error);
      }
      return requests
        .filter((request) => String(request.rollNumber || "") === String(scholarVal || "") && request.requestStatus !== "Not Requested")
        .map((request) => {
          const dues = getStudentNoDues(scholarVal, request.semester, request.session);
          return {
            id: request.id || `NOC-${scholarVal}-${request.semester}-${request.session}`,
            rollNumber: scholarVal,
            scholarNo: scholarVal,
            enrollmentNo: s.enrollmentNo || "",
            studentName: s.studentName,
            course: [s.courseCode || s.course, "UG"].filter(Boolean).join(" "),
            semester: request.semester || s.semester || "",
            session: request.session || s.session || "",
            labClearance: dues.labClearance || "Pending",
            projectClearance: dues.projectClearance || "Pending",
            libraryDepartment: dues.libraryDepartment || "Pending",
            status: dues.academicDepartment === "Cleared" ? "Approved" : "Pending",
            requestStatus: dues.requestStatus || "Pending",
            requestedDate: dues.requestedDate || request.requestedDate || "",
            clearedDate: dues.clearedDate || null
          };
        });
    });

  const handleGrantClearance = (clearance) => {
    updateStudentAcademicNoDues(clearance.scholarNo || clearance.rollNumber, {
      semester: clearance.semester,
      session: clearance.session,
      requestStatus: "Approved",
      academicDepartment: "Cleared",
      labClearance: "Cleared",
      projectClearance: "Approved",
      clearedDate: new Date().toLocaleDateString("en-GB")
    });
    setSuccessMsg(`Academic Department No-Dues Clearance granted to ${clearance.studentName} for ${clearance.semester}!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filtered = clearances.filter(c =>
    String(c.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(c.scholarNo || c.rollNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(c.enrollmentNo || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-extrabold border border-purple-200">
              Department Academic Clearance
            </span>
            <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              {clearances.filter(c => c.status === "Approved").length} / {clearances.length} Cleared
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Departmental No-Dues & NOC Desk
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Verify laboratory equipment returns, seminar report submissions, and grant HOD stage academic NOC.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print Clearance Registry</span>
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

      {/* Clearance Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Scholar No, Name or Enrollment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <span className="text-xs font-bold text-slate-500 hidden sm:block">Step 2: HOD Academic NOC Gate</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Scholar No</th>
                <th className="py-3.5 px-4">Enrollment No</th>
                <th className="py-3.5 px-4">Course & Sem</th>
                <th className="py-3.5 px-4">Lab / Kit Return</th>
                <th className="py-3.5 px-4">Project / Seminar</th>
                <th className="py-3.5 px-4">Clearance Status</th>
                <th className="py-3.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No Clearance Applications</p>
                    <p className="text-xs text-slate-400 mt-0.5">Enrolled department students will appear here for academic no-dues clearance.</p>
                  </td>
                </tr>
              ) : (
                filtered
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((c) => {
                  const isApproved = c.status === "Approved";
                  return (
                    <tr key={c.id} className="hover:bg-purple-50/20 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900">{c.studentName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{c.scholarNo || c.rollNumber}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{c.enrollmentNo || "N/A"}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{c.course} - {c.semester}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.labClearance === "Cleared" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {c.labClearance}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.projectClearance === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {c.projectClearance}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black border inline-flex items-center gap-1.5 ${
                          isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {isApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          {isApproved ? "NOC Approved" : "NOC Pending"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleGrantClearance(c)}
                          disabled={isApproved}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                            isApproved
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                          }`}
                        >
                          {isApproved ? "Approved" : "Grant NOC"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
