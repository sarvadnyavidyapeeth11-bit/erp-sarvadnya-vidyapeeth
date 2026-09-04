import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  Filter,
  BookOpen,
  Sparkles,
  Layers
} from "lucide-react";
import { getStudentVerifications } from "../../hooks/adminData";
import { getDepartments, getBatches } from "../../hooks/academicMasterData";

export default function AdmissionRosterPage() {
  const [students, setStudents] = useState(() => getStudentVerifications());
  const [departments, setDepartments] = useState(() => getDepartments());
  const [batches, setBatches] = useState(() => getBatches());
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [sessionFilter, setSessionFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  const reloadData = () => {
    setStudents(getStudentVerifications());
    setDepartments(getDepartments());
    setBatches(getBatches());
  };

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

  // Compute live unique Academic Sessions strictly from real-time database records.
  const liveSessions = Array.from(
    new Set([
      ...batches.map((b) => b.academicSession),
      ...students.map((s) => s.session)
    ].filter(Boolean))
  );

  // Dropdown options for filter (fallback to default array if DB is empty)
  const dropdownSessionOptions = liveSessions;

  const filtered = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      String(s.studentName || "").toLowerCase().includes(q) ||
      String(s.rollNumber || "").toLowerCase().includes(q) ||
      String(s.scholarNo || "").toLowerCase().includes(q) ||
      String(s.phone || "").toLowerCase().includes(q) ||
      String(s.batch || "").toLowerCase().includes(q);

    const matchBatch = batchFilter === "All" || s.batch === batchFilter;
    const matchDept = deptFilter === "All" || s.department === deptFilter;

    const matchedBatchObj = batches.find((b) => b.batchName === s.batch);
    const studentSession = s.session || matchedBatchObj?.academicSession;
    const matchSession = sessionFilter === "All" || studentSession === sessionFilter;

    return matchSearch && matchBatch && matchDept && matchSession;
  });

  // Calculate live dynamic counts based on real-time data & active filters
  const liveActiveDeptsCount = new Set([
    ...departments.map((d) => d.name),
    ...filtered.map((s) => s.department)
  ].filter(Boolean)).size;

  const liveActiveBatchesCount = new Set([
    ...batches.map((b) => b.batchName),
    ...filtered.map((s) => s.batch)
  ].filter(Boolean)).size;

  const liveAcademicSessionsCount = liveSessions.length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-black border border-purple-200 uppercase tracking-wider">
              Enrolled Roster Directory
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
              {students.length} Total Enrolled
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Enrolled Students Roster Directory
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Browse and filter admitted students across live batches, departments, academic sessions, and verification audit.
          </p>
        </div>
      </div>

      {/* Real-time Dynamic KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Total Enrolled</p>
            <p className="text-lg font-black text-slate-900">{filtered.length}</p>
            {filtered.length !== students.length && (
              <p className="text-[9px] font-bold text-slate-400">of {students.length} Total</p>
            )}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Active Depts</p>
            <p className="text-lg font-black text-slate-900">{liveActiveDeptsCount}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Active Batches</p>
            <p className="text-lg font-black text-slate-900">{liveActiveBatchesCount}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Academic Sessions</p>
            <p className="text-lg font-black text-slate-900">{liveAcademicSessionsCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, Scholar No, phone..."
            className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-black text-slate-600">Department:</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-black text-slate-600">Batch:</label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
            >
              <option value="All">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.batchName}>
                  {b.batchName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-black text-slate-600">Session:</label>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
            >
              <option value="All">All Sessions</option>
              {dropdownSessionOptions.map((sess) => (
                <option key={sess} value={sess}>
                  {sess}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-200 text-[11px] font-black uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Student Details</th>
                <th className="py-3.5 px-4">Department & Course</th>
                <th className="py-3.5 px-4">Batch & Session</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Prior Qualifications</th>
                <th className="py-3.5 px-4 text-center">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                    No enrolled students found in roster matching the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((st) => {
                  const matchedBatch = batches.find((b) => b.batchName === st.batch);
                  const displaySession = st.session || matchedBatch?.academicSession || "";
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-extrabold text-slate-900">{st.studentName}</p>
                          <p className="text-[11px] font-mono font-bold text-purple-700">
                            Scholar No: {st.scholarNo || st.rollNumber}
                          </p>
                          <p className="text-[10px] text-slate-400">S/O {st.fatherName}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{st.course || "Not Submitted Yet"}</p>
                        <p className="text-[11px] text-slate-500">{st.department || "Not Submitted Yet"}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-800 font-black rounded-md border border-purple-200 text-[10px]">
                          {st.batch || "Not Submitted Yet"}
                        </span>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                          {st.semester || "I SEM"} - Session {displaySession}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-slate-600 space-y-0.5">
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {st.phone || "Not Submitted Yet"}
                        </p>
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {st.email || "Not Submitted Yet"}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        <p className="font-bold text-slate-800">
                          10th: {st.tenthPercentage ? `${st.tenthPercentage}%` : "Not Submitted Yet"}
                          {st.tenthBoard ? ` (${st.tenthBoard})` : ""}
                        </p>
                        <p className="text-slate-500 font-medium">
                          12th: {st.twelfthPercentage ? `${st.twelfthPercentage}%` : "Not Submitted Yet"}
                          {st.twelfthBoard ? ` (${st.twelfthBoard})` : ""}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                            st.status === "Verified"
                              ? "bg-emerald-100 text-emerald-800"
                              : st.status === "Rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {st.status === "Verified" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : st.status === "Rejected" ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {st.status || "Pending Verification"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

