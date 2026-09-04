import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
  Award,
  Layers,
  Building2,
  ExternalLink
} from "lucide-react";
import { getCourses, getBatches, getSubjects, getFacultyLeaveRequests, getInternalMarksList, getActiveHODProfile, getAttendanceShortage, matchesActiveHODDepartment } from "../../hooks/academicMasterData";
import { getStudentVerifications } from "../../hooks/adminData";

export const hodProfile = getActiveHODProfile();

export default function HODDashboardPage() {
  const [profile, setProfile] = useState(() => getActiveHODProfile());
  const [courses, setCourses] = useState(() => getCourses());
  const [batches, setBatches] = useState(() => getBatches());
  const [subjects, setSubjects] = useState(() => getSubjects());
  const [students, setStudents] = useState(() => getStudentVerifications());
  const [leaves, setLeaves] = useState(() => getFacultyLeaveRequests());
  const [marksSheets, setMarksSheets] = useState(() => getInternalMarksList());
  const [attendanceShortage, setAttendanceShortage] = useState(() => getAttendanceShortage());

  const reloadData = () => {
    setProfile(getActiveHODProfile());
    setCourses(getCourses());
    setBatches(getBatches());
    setSubjects(getSubjects());
    setStudents(getStudentVerifications());
    setLeaves(getFacultyLeaveRequests());
    setMarksSheets(getInternalMarksList());
    setAttendanceShortage(getAttendanceShortage());
  };

  useEffect(() => {
    window.addEventListener("academicDataUpdated", reloadData);
    window.addEventListener("studentEnrollmentUpdated", reloadData);
    window.addEventListener("facultyLeavesUpdated", reloadData);
    window.addEventListener("attendanceShortageUpdated", reloadData);
    window.addEventListener("internalMarksUpdated", reloadData);
    window.addEventListener("storage", reloadData);
    return () => {
      window.removeEventListener("academicDataUpdated", reloadData);
      window.removeEventListener("studentEnrollmentUpdated", reloadData);
      window.removeEventListener("facultyLeavesUpdated", reloadData);
      window.removeEventListener("attendanceShortageUpdated", reloadData);
      window.removeEventListener("internalMarksUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  const deptCourses = courses.filter((record) => matchesActiveHODDepartment(record, profile));
  const deptBatches = batches.filter((record) => matchesActiveHODDepartment(record, profile));
  const deptSubjects = subjects.filter((record) => matchesActiveHODDepartment(record, profile));
  const deptStudents = students.filter((record) => matchesActiveHODDepartment(record, profile));
  const departmentRolls = new Set(deptStudents.map((student) => student.rollNumber).filter(Boolean));
  const deptShortage = attendanceShortage.filter((row) => departmentRolls.has(row.rollNumber));
  const departmentSubjectCodes = new Set(deptSubjects.map((subject) => subject.code).filter(Boolean));
  const deptMarksSheets = marksSheets.filter((sheet) => departmentSubjectCodes.has(sheet.subjectCode));
  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;
  const lockedMarks = deptMarksSheets.filter((m) => m.status === "Locked & Verified").length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-tr from-purple-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-black tracking-wider uppercase backdrop-blur-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" /> Department Head Control Suite - {profile.deptCode}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {profile.name}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
            {profile.department} - Complete control over faculty workload, class timetable, student attendance compliance, and internal marks locking.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-xs space-y-1.5 shrink-0 z-10">
          <p className="text-[10px] uppercase font-bold text-purple-300">Active Office Cabin</p>
          <p className="font-extrabold text-white">{profile.cabin}</p>
          <p className="text-[11px] text-slate-300 font-mono">Academic Term: {profile.academicYear}</p>
        </div>
      </div>

      {/* 4 Core Department KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/hod-dashboard/allocations"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-purple-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 font-mono">{deptSubjects.length}</p>
            <p className="text-xs font-bold text-slate-500">Department Subjects</p>
          </div>
        </Link>

        <Link
          to="/hod-dashboard/attendance-monitor"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <AlertCircle className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-600 font-mono">{deptShortage.length}</p>
            <p className="text-xs font-bold text-slate-500">Attendance Shortage (&lt;75%)</p>
          </div>
        </Link>

        <Link
          to="/hod-dashboard/leaves"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Clock className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-blue-600 font-mono">{pendingLeaves}</p>
            <p className="text-xs font-bold text-slate-500">Faculty Leave Requests</p>
          </div>
        </Link>

        <Link
          to="/hod-dashboard/marks-verification"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Award className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 font-mono">{lockedMarks} / {deptMarksSheets.length}</p>
            <p className="text-xs font-bold text-slate-500">Internal Marks Locked</p>
          </div>
        </Link>
      </div>

      {/* Executive HOD Responsibility Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module 1 */}
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Faculty & Subject Allocation</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Assign core theory and practical lab subjects to departmental professors and assistant faculty.
            </p>
          </div>
          <Link
            to="/hod-dashboard/allocations"
            className="inline-flex items-center justify-between px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-bold transition-colors"
          >
            <span>Manage Allocations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 2 */}
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Department Timetable & Labs</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Approve lecture hall schedules, computer lab slots, and coordinate weekly academic periods.
            </p>
          </div>
          <Link
            to="/hod-dashboard/timetable"
            className="inline-flex items-center justify-between px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-bold transition-colors"
          >
            <span>Approve Timetable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 3 */}
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Faculty Leave Approval</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Review casual and duty leave requests from faculty and assign substitute teachers for lectures.
            </p>
          </div>
          <Link
            to="/hod-dashboard/leaves"
            className="inline-flex items-center justify-between px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-bold transition-colors"
          >
            <span>Review Leaves</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 4 */}
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Attendance Shortage Monitor</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Track student compliance, identify defaulters below 75% attendance, and dispatch debarment notices.
            </p>
          </div>
          <Link
            to="/hod-dashboard/attendance-monitor"
            className="inline-flex items-center justify-between px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition-colors"
          >
            <span>Audit Attendance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 5 */}
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Internal Marks Verification</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Audit sessional exam marks entered by teachers and lock scorecards for final university submission.
            </p>
          </div>
          <Link
            to="/hod-dashboard/marks-verification"
            className="inline-flex items-center justify-between px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold transition-colors"
          >
            <span>Lock Marks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

