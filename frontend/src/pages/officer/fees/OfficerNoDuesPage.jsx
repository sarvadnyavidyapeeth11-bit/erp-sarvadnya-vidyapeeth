import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  FileCheck,
  Search,
  ShieldCheck,
  XCircle
} from "lucide-react";
import { getStudentVerifications } from "../../../hooks/adminData";
import { getStudentNoDues, updateStudentAcademicNoDues } from "../../../hooks/studentPortalData";
import Pagination from "../../../components/common/Pagination";

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

const formatCurrency = (amount = 0) => `Rs.${Number(amount || 0).toLocaleString("en-IN")}`;

export default function OfficerNoDuesPage() {
  const [students, setStudents] = useState(() => getStudentVerifications());
  const [requests, setRequests] = useState(() => getStoredNoDuesRows());
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionFilter, setSessionFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [selectedIds, setSelectedIds] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const reloadData = () => {
    setStudents(getStudentVerifications());
    setRequests(getStoredNoDuesRows());
  };

  useEffect(() => {
    window.addEventListener("studentEnrollmentUpdated", reloadData);
    window.addEventListener("noDuesUpdated", reloadData);
    window.addEventListener("feeDataUpdated", reloadData);
    window.addEventListener("storage", reloadData);
    return () => {
      window.removeEventListener("studentEnrollmentUpdated", reloadData);
      window.removeEventListener("noDuesUpdated", reloadData);
      window.removeEventListener("feeDataUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  const clearances = useMemo(() => {
    const studentByRoll = new Map();
    students.forEach((student) => {
      [student.rollNumber, student.scholarNo].filter(Boolean).forEach((key) => {
        studentByRoll.set(String(key), student);
      });
    });

    return requests
      .filter((request) => request.requestStatus && request.requestStatus !== "Not Requested")
      .map((request) => {
        const student = studentByRoll.get(String(request.rollNumber || request.scholarNo || "")) || {};
        const roll = request.rollNumber || request.scholarNo || student.rollNumber || student.scholarNo || "";
        const dues = getStudentNoDues(roll, request.semester, request.session);
        const approved = dues.requestStatus === "Approved" || dues.academicDepartment === "Cleared";
        return {
          id: request.id || `NOC-${roll}-${request.semester}-${request.session}`,
          rollNumber: roll,
          scholarNo: student.scholarNo || roll,
          enrollmentNo: student.enrollmentNo || "",
          studentName: request.studentName || student.studentName || student.name || "",
          course: request.course || student.courseCode || student.course || "",
          batch: student.batch || "",
          semester: request.semester || student.semester || "",
          session: request.session || student.session || student.academicSession || "",
          requestStatus: dues.requestStatus || request.requestStatus || "Pending",
          requestedDate: dues.requestedDate || request.requestedDate || "",
          accountsCleared: Boolean(dues.accountsCleared || dues.feeCleared),
          feeImposed: Boolean(dues.feeImposed),
          feeAmountDue: Number(dues.feeAmountDue || 0),
          feeAmountPaid: Number(dues.feeAmountPaid || 0),
          approved
        };
      });
  }, [requests, students]);

  const sessionOptions = Array.from(new Set(clearances.map((row) => row.session).filter(Boolean)));
  const semesterOptions = Array.from(new Set(clearances.map((row) => row.semester).filter(Boolean)));

  const filtered = clearances.filter((row) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      String(row.studentName || "").toLowerCase().includes(q) ||
      String(row.rollNumber || "").toLowerCase().includes(q) ||
      String(row.enrollmentNo || "").toLowerCase().includes(q);
    const matchesSession = sessionFilter === "All" || row.session === sessionFilter;
    const matchesSemester = semesterFilter === "All" || row.semester === semesterFilter;
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending" && !row.approved) ||
      (statusFilter === "Approved" && row.approved);
    return matchesSearch && matchesSession && matchesSemester && matchesStatus;
  });

  const pageRows = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const selectableRows = pageRows.filter((row) => !row.approved);
  const allPageSelected = selectableRows.length > 0 && selectableRows.every((row) => selectedIds.includes(row.id));

  const toggleSelection = (id) => {
    setSelectedIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  };

  const togglePageSelection = () => {
    const pageIds = selectableRows.map((row) => row.id);
    setSelectedIds((current) => {
      if (pageIds.every((id) => current.includes(id))) return current.filter((id) => !pageIds.includes(id));
      return Array.from(new Set([...current, ...pageIds]));
    });
  };

  const approveRows = (rows) => {
    if (!rows.length) return;

    rows.forEach((row) => {
      const hasDueOverride = row.feeAmountDue > 0;
      updateStudentAcademicNoDues(row.rollNumber, {
        semester: row.semester,
        session: row.session,
        requestStatus: "Approved",
        accountsCleared: true,
        manualAccountsOverride: hasDueOverride,
        accountsRemarks: hasDueOverride
          ? `Manual Fee Officer NOC clearance with pending due ${formatCurrency(row.feeAmountDue)}.`
          : "Fee Officer verified zero-dues clearance.",
        clearedBy: "Fee Officer",
        clearedDate: new Date().toLocaleDateString("en-GB")
      });
    });

    setSelectedIds([]);
    reloadData();
    setSuccessMsg(`${rows.length} semester/session no-dues request clear ho gaya.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const selectedRows = clearances.filter((row) => selectedIds.includes(row.id) && !row.approved);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-extrabold border border-purple-200">
              Session & Semester Wise
            </span>
            <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              {clearances.filter((row) => row.approved).length} / {clearances.length} Cleared
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Fee Officer No-Dues Clearance Desk
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Student NOC requests ko session aur semester wise verify karke single ya bulk clearance dein.
          </p>
        </div>

        <button
          type="button"
          disabled={selectedRows.length === 0}
          onClick={() => approveRows(selectedRows)}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
            selectedRows.length === 0
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 cursor-pointer"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Clear Selected ({selectedRows.length})
        </button>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, scholar, enrollment..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <select
            value={sessionFilter}
            onChange={(event) => {
              setSessionFilter(event.target.value);
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none"
          >
            <option value="All">All Sessions</option>
            {sessionOptions.map((session) => <option key={session} value={session}>{session}</option>)}
          </select>
          <select
            value={semesterFilter}
            onChange={(event) => {
              setSemesterFilter(event.target.value);
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none"
          >
            <option value="All">All Semesters</option>
            {semesterOptions.map((semester) => <option key={semester} value={semester}>{semester}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none"
          >
            <option value="Pending">Pending Only</option>
            <option value="Approved">Approved Only</option>
            <option value="All">All Status</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={togglePageSelection}
                    disabled={selectableRows.length === 0}
                    className="w-4 h-4 accent-purple-600 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Scholar / Enrollment</th>
                <th className="py-3.5 px-4">Session</th>
                <th className="py-3.5 px-4">Semester</th>
                <th className="py-3.5 px-4">Fee Position</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No No-Dues Requests</p>
                    <p className="text-xs text-slate-400 mt-0.5">Student portal se submitted semester/session requests yahan dikhenge.</p>
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleSelection(row.id)}
                        disabled={row.approved}
                        className="w-4 h-4 accent-purple-600 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-black text-slate-900">{row.studentName || "N/A"}</p>
                      <p className="text-[11px] font-bold text-slate-500">{row.course || "Course N/A"} {row.batch ? `- ${row.batch}` : ""}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-purple-700">{row.scholarNo || row.rollNumber}</p>
                      <p className="font-mono text-[11px] font-bold text-indigo-600">{row.enrollmentNo || "Enrollment N/A"}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-800">{row.session || "N/A"}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{row.semester || "N/A"}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 ${
                        row.feeAmountDue > 0
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : row.feeImposed
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {row.feeAmountDue > 0 ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {row.feeAmountDue > 0 ? `Due ${formatCurrency(row.feeAmountDue)}` : row.feeImposed ? "Zero Due" : "Fee Not Imposed"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 ${
                        row.approved ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {row.approved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {row.approved ? "Cleared" : "Pending"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        disabled={row.approved}
                        onClick={() => approveRows([row])}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                          row.approved
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                        }`}
                      >
                        {row.approved ? "Cleared" : "Clear NOC"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  );
}
