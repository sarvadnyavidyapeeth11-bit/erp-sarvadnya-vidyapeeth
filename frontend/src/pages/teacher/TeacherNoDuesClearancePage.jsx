import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  UserCheck,
  FileCheck,
  BookOpen,
  CalendarCheck,
  FileText,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  Eye,
  Building,
  GraduationCap
} from "lucide-react";
import { studentProfile, feeDetails, getStudentNoDues, updateStudentAcademicNoDues } from "../../hooks/studentPortalData";
import { getStudents, initERP } from "../../hooks/erpData";

export default function TeacherNoDuesClearancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCourse, setFilterCourse] = useState("All");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [selectedStudentForReview, setSelectedStudentForReview] = useState(null);

  const [studentClearanceList, setStudentClearanceList] = useState([]);

  const loadData = () => {
    const erpStudents = getStudents();

    const studentList = erpStudents.map((s) => {
      const clearData = getStudentNoDues(s.rollNumber);
      const isFeePaid = Number(s.paidFees) >= Number(s.totalFees);
      return {
        id: s.id,
        name: s.name,
        rollNumber: s.rollNumber,
        course: s.course,
        semester: s.semester ? (s.semester.includes("Sem") ? s.semester : `Semester ${s.semester}`) : "Semester I",
        section: s.section || "A",
        attendancePercent: clearData.attendancePercent || 85.0,
        assignmentSubmitted: clearData.assignmentSubmitted || 6,
        assignmentTotal: 6,
        academicRemarks: clearData.academicRemarks || "Regular in class, lab assignments and project work completed.",
        feeCleared: isFeePaid,
        feeDue: Math.max(0, (Number(s.totalFees) || 85000) - (Number(s.paidFees) || 0)),
        facultyApproved: clearData.facultyApproved || false,
        facultyApprovalDate: clearData.facultyApprovalDate,
        facultyApprovedBy: clearData.facultyApprovedBy
      };
    });

    setStudentClearanceList(studentList);
  };

  useEffect(() => {
    loadData();
    window.addEventListener("noDuesUpdated", loadData);
    window.addEventListener("feeDataUpdated", loadData);
    return () => {
      window.removeEventListener("noDuesUpdated", loadData);
      window.removeEventListener("feeDataUpdated", loadData);
    };
  }, []);

  const handleApproveAcademic = (student) => {
    if (!student.feeCleared) {
      alert(`Cannot forward academic clearance for ${student.name}. Accounts / Fee clearance is still pending (Due: Rs.${student.feeDue.toLocaleString("en-IN")}). Fee must be cleared first!`);
      return;
    }

    const updated = updateStudentAcademicNoDues(student.rollNumber, {
      facultyApproved: true,
      facultyApprovalDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      facultyApprovedBy: "Dr. Anjali Sharma (HOD - Computer Applications)"
    });

    setActionSuccessMsg(`Academic & Attendance Clearance Approved for ${student.name} (${student.rollNumber})! Forwarded for Final NOC generation.`);
    setTimeout(() => setActionSuccessMsg(""), 5000);
    loadData();
    if (selectedStudentForReview?.rollNumber === student.rollNumber) {
      setSelectedStudentForReview(null);
    }
  };

  const handleRevokeAcademic = (student) => {
    updateStudentAcademicNoDues(student.rollNumber, {
      facultyApproved: false,
      facultyApprovalDate: null,
      facultyApprovedBy: null
    });

    setActionSuccessMsg(`Academic clearance put on hold for ${student.name}.`);
    setTimeout(() => setActionSuccessMsg(""), 4000);
    loadData();
  };

  const filteredStudents = studentClearanceList.filter((s) => {
    const matchSearch =
      !searchTerm ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCourse = filterCourse === "All" || s.course.includes(filterCourse);

    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "Approved" && s.facultyApproved) ||
      (filterStatus === "ReadyForReview" && s.feeCleared && !s.facultyApproved) ||
      (filterStatus === "FeePending" && !s.feeCleared);

    return matchSearch && matchCourse && matchStatus;
  });

  const totalEligibleCount = studentClearanceList.filter(s => s.feeCleared).length;
  const facultyApprovedCount = studentClearanceList.filter(s => s.facultyApproved).length;
  const pendingFacultyReviewCount = studentClearanceList.filter(s => s.feeCleared && !s.facultyApproved).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black border border-indigo-200">
              Teacher & HOD Academic Desk
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
              Multi-Stage Clearance Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-indigo-600" /> Student Attendance & Academic No-Dues Desk
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Once student accounts fees are cleared, verify classroom attendance (>=75%) and assignment/lab submissions to forward academic No-Dues clearance.
          </p>
        </div>

        {/* Quick Metric Counters */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
            <p className="text-[10px] font-black uppercase text-amber-700">Awaiting Faculty</p>
            <p className="text-lg font-black text-amber-900">{pendingFacultyReviewCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <p className="text-[10px] font-black uppercase text-emerald-700">Faculty Approved</p>
            <p className="text-lg font-black text-emerald-900">{facultyApprovedCount}</p>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or Scholar No..."
            className="w-full bg-slate-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-500">Course:</span>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold"
            >
              <option value="All">All Courses</option>
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
              <option value="B.Tech">B.Tech</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-500">Status:</span>
            {[
              { id: "All", label: "All Students" },
              { id: "ReadyForReview", label: "Ready For Faculty (Fee Cleared)" },
              { id: "Approved", label: "Approved" },
              { id: "FeePending", label: "Fee Due" }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  filterStatus === st.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Clearance Students Registry Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-gray-200 text-slate-800 font-black">
                <th className="py-3.5 px-4">Student & Class</th>
                <th className="py-3.5 px-4 text-center">Stage 1: Accounts Fee</th>
                <th className="py-3.5 px-4 text-center">Stage 2: Attendance</th>
                <th className="py-3.5 px-4 text-center">Stage 2: Assignments</th>
                <th className="py-3.5 px-4 text-center">Academic NOC Status</th>
                <th className="py-3.5 px-4 text-center">Faculty Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                    No students found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const meetsAttendance = stu.attendancePercent >= 75;
                  const assignmentsDone = stu.assignmentSubmitted >= stu.assignmentTotal;

                  return (
                    <tr key={stu.rollNumber} className="hover:bg-slate-50/70 transition-colors">
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <p className="font-black text-slate-900">{stu.name}</p>
                        <p className="text-[10px] font-mono text-indigo-700 font-bold">{stu.rollNumber}</p>
                        <p className="text-[10px] text-slate-500">{stu.course} - {stu.semester}</p>
                      </td>

                      {/* Stage 1: Accounts Fee Status */}
                      <td className="py-3.5 px-4 text-center">
                        {stu.feeCleared ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Cleared (Rs.0 Due)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black">
                            <XCircle className="w-3.5 h-3.5" /> Due: Rs.{stu.feeDue.toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>

                      {/* Stage 2: Attendance Tracking */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-xs font-black font-mono ${meetsAttendance ? "text-emerald-700" : "text-rose-600"}`}>
                            {stu.attendancePercent}%
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {meetsAttendance ? "Eligible (>=75%)" : "Shortage (<75%)"}
                          </span>
                        </div>
                      </td>

                      {/* Stage 2: Assignments & Records */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xs font-black text-slate-900 font-mono">
                            {stu.assignmentSubmitted} / {stu.assignmentTotal}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {assignmentsDone ? "All Verified" : "Pending Records"}
                          </span>
                        </div>
                      </td>

                      {/* Faculty NOC Status */}
                      <td className="py-3.5 px-4 text-center">
                        {stu.facultyApproved ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Approved & Forwarded
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5">{stu.facultyApprovalDate}</span>
                          </div>
                        ) : stu.feeCleared ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center gap-1 mx-auto w-fit">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Ready for Faculty Sign
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            Waiting for Fee Clearance
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        {stu.facultyApproved ? (
                          <button
                            onClick={() => handleRevokeAcademic(stu)}
                            className="px-3 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Hold / Revert
                          </button>
                        ) : (
                          <button
                            disabled={!stu.feeCleared}
                            onClick={() => handleApproveAcademic(stu)}
                            className={`px-3 py-1.5 rounded-xl font-black text-xs inline-flex items-center gap-1 shadow-xs transition-all ${
                              stu.feeCleared
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95 shadow-indigo-200"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Forward
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
      </div>
    </motion.div>
  );
}


