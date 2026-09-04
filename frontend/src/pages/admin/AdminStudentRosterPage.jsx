import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  GraduationCap,
  Building2,
  Calendar,
  Eye,
  FileText,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Download,
  Printer
} from "lucide-react";
import { Link } from "react-router-dom";
import { getStudentVerifications, isPendingStudentStatus } from "../../hooks/adminData";
import { getCourses } from "../../hooks/academicMasterData";
import Pagination from "../../components/common/Pagination";

export default function AdminStudentRosterPage() {
  const [students, setStudents] = useState(() => getStudentVerifications());
  const [courses, setCourses] = useState(() => getCourses());

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const reloadData = () => {
    setStudents(getStudentVerifications());
    setCourses(getCourses());
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCourse, selectedStatus]);

  useEffect(() => {
    window.addEventListener("studentEnrollmentUpdated", reloadData);
    window.addEventListener("academicDataUpdated", reloadData);
    window.addEventListener("storage", reloadData);
    return () => {
      window.removeEventListener("studentEnrollmentUpdated", reloadData);
      window.removeEventListener("academicDataUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.rollNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone || "").includes(searchTerm);

    const matchesCourse = selectedCourse === "All" || s.course === selectedCourse;
    const matchesStatus = selectedStatus === "All" || s.status === selectedStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const verifiedCount = students.filter((s) => s.status === "Verified").length;
  const pendingCount = students.filter((s) => isPendingStudentStatus(s.status)).length;
  const rejectedCount = students.filter((s) => s.status === "Rejected").length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-tr from-purple-700 via-indigo-700 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-black tracking-wider uppercase backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" /> Master Student Directory & Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Institutional Student Roster
          </h1>
          <p className="text-xs sm:text-sm font-medium text-purple-100 leading-relaxed">
            Centralized read-only registry of all enrolled students from the Admission Cell across degree courses & batches.
          </p>
        </div>

        <Link
          to="/admission-officer-dashboard"
          className="relative z-10 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-purple-900 hover:bg-purple-50 text-xs font-black shadow-lg transition-all active:scale-95 shrink-0"
        >
          <GraduationCap className="w-4 h-4 text-purple-600" />
          <span>Open Admission Cell Desk</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Total Enrolled</p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">{students.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Students
          </p>
          <p className="text-2xl font-black text-emerald-600 font-mono mt-1">{verifiedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <p className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Verification Pending
          </p>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">{pendingCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> Clarification / Rejected
          </p>
          <p className="text-2xl font-black text-rose-600 font-mono mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, Scholar No, email, mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="All">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.name}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending Verification">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gray-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">Student Particulars</th>
                <th className="py-3.5 px-4">Scholar No / App ID</th>
                <th className="py-3.5 px-4">Course & Batch</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Admission Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-bold">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-500" />
                    No students match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((student) => {
                  const isVerified = student.status === "Verified";
                  const isRejected = student.status === "Rejected";

                  return (
                    <tr key={student.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {(student.studentName || "ST").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900">{student.studentName}</p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              S/O {student.fatherName || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 font-bold border border-purple-200">
                          {student.scholarNo || student.id}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{student.course || "Not assigned"}</p>
                        <p className="text-[11px] text-slate-500">{[student.batch, student.semester].filter(Boolean).join(" - ") || "Not available"}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-700">{student.phone || "N/A"}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[160px]">
                          {student.email || "N/A"}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        {isVerified ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : isRejected ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-200 inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> In Review
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
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
          totalPages={Math.ceil(filteredStudents.length / itemsPerPage) || 1}
          totalItems={filteredStudents.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
          itemsPerPageOptions={[6, 12, 24, 50]}
        />
      </div>

      {/* ── Student Profile Details Modal ── */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-sm">
                    {(selectedStudent.studentName || "ST").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{selectedStudent.studentName}</h3>
                    <p className="text-[11px] font-mono text-purple-700 font-bold">
                      Scholar No: {selectedStudent.scholarNo || selectedStudent.id}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black cursor-pointer"
                >
                  Close Close
                </button>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-gray-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Father's Name:</span>
                  <p className="font-extrabold text-slate-900">{selectedStudent.fatherName || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mother's Name:</span>
                  <p className="font-extrabold text-slate-900">{selectedStudent.motherName || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Course & Dept:</span>
                  <p className="font-extrabold text-slate-900">{selectedStudent.course} ({selectedStudent.department || "Academic"})</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Batch & Semester:</span>
                  <p className="font-extrabold text-slate-900">{selectedStudent.batch} - {selectedStudent.semester || "I SEM"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number:</span>
                  <p className="font-extrabold text-slate-900">{selectedStudent.phone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Email Address:</span>
                  <p className="font-extrabold text-slate-900">{selectedStudent.email || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth / Gender:</span>
                  <p className="font-extrabold text-slate-900">{selectedStudent.dob} - {selectedStudent.gender}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Aadhaar UID:</span>
                  <p className="font-mono font-bold text-purple-700">{selectedStudent.aadhar || "XXXX-XXXX-XXXX"}</p>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase">Admission Verification:</span>
                  <p className="font-black text-purple-950">
                    {selectedStudent.status === "Verified" ? "Verified & Confirmed" : "Admission Cell Review In Progress"}
                  </p>
                </div>

                <Link
                  to="/admission-officer-dashboard"
                  className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
                >
                  Manage in Admission Cell to
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

