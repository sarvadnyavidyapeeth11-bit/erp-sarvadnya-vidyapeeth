import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  GraduationCap,
  Calendar,
  ArrowRight,
  Sparkles,
  Layers,
  Plus,
  UserPlus,
  ShieldCheck,
  IndianRupee,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen
} from "lucide-react";
import {
  getDepartments,
  getCourses,
  getBatches
} from "../../hooks/academicMasterData";
import {
  getStudentVerifications,
  isPendingStudentStatus
} from "../../hooks/adminData";

export default function AdminDashboardPage() {
  const [departments, setDepartments] = useState(() => getDepartments());
  const [courses, setCourses] = useState(() => getCourses());
  const [batches, setBatches] = useState(() => getBatches());
  const [verifications, setVerifications] = useState(() => getStudentVerifications());

  const reloadData = () => {
    setDepartments(getDepartments());
    setCourses(getCourses());
    setBatches(getBatches());
    setVerifications(getStudentVerifications());
  };

  useEffect(() => {
    window.addEventListener("academicDataUpdated", reloadData);
    window.addEventListener("studentEnrollmentUpdated", reloadData);
    window.addEventListener("storage", reloadData);
    return () => {
      window.removeEventListener("academicDataUpdated", reloadData);
      window.removeEventListener("studentEnrollmentUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  const totalStudents = verifications.length;
  const verifiedStudents = verifications.filter((v) => v.status === "Verified").length;
  const pendingVerifications = verifications.filter((v) => isPendingStudentStatus(v.status)).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-tr from-purple-700 via-indigo-700 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-black tracking-wider uppercase backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" /> Central ERP Administration & Master Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Academic, Admission & Financial Control Hub
          </h1>
          <p className="text-xs sm:text-sm font-medium text-purple-100 leading-relaxed">
            Centralized management for Academic Wings, Degree Courses, Admission Cell, Student Verification, and Fee Desk.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid - 5 Integrated Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          to="/admin-dashboard/departments"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-purple-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              <Building2 className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 font-mono">{departments.length}</p>
            <p className="text-xs font-bold text-slate-500">Departments</p>
          </div>
        </Link>

        <Link
          to="/admin-dashboard/courses"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <GraduationCap className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 font-mono">{courses.length}</p>
            <p className="text-xs font-bold text-slate-500">Degree Courses</p>
          </div>
        </Link>

        <Link
          to="/admin-dashboard/batches"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Calendar className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 font-mono">{batches.length}</p>
            <p className="text-xs font-bold text-slate-500">Active Batches</p>
          </div>
        </Link>

        <Link
          to="/admin-dashboard/students"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Users className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 font-mono">{totalStudents}</p>
            <p className="text-xs font-bold text-slate-500">Student Directory</p>
          </div>
        </Link>

        <Link
          to="/admin-dashboard/students"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 font-mono">{verifiedStudents}</p>
            <p className="text-xs font-bold text-slate-500">Verified by Admission</p>
          </div>
        </Link>
      </div>

      {/* -- Interconnected ERP Portals Quick Access Hub -- */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Connected Campus Portals Ecosystem
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time synchronization across Admin Master, Admission Cell, Accounts Fee Desk, Student Portal, and HOD Desk.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All 5 Portals Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Admission Cell Portal */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/50 to-white border border-blue-100 hover:border-blue-300 transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                <UserPlus className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900">Admission Cell Desk</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-snug">
                Student on-boarding, entrance verification, and academic seat allocation.
              </p>
            </div>
            <Link
              to="/admission-officer-dashboard"
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Open Admission Desk</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Fee Officer Portal */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50/50 to-white border border-emerald-100 hover:border-emerald-300 transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                <IndianRupee className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900">Fee Accounts Suite</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-snug">
                Offline cash collection, bank challan review, scholarships & refunds.
              </p>
            </div>
            <Link
              to="/fee-officer-dashboard"
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Open Fee Desk</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Student Portal */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-50/50 to-white border border-purple-100 hover:border-purple-300 transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900">Student Portal View</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-snug">
                Student dashboard, verified profile, and live online fee payments.
              </p>
            </div>
            <Link
              to="/student-dashboard"
              className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>View Student Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* HOD Department Suite */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold shadow-sm">
                <Building2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900">HOD Department Suite</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-snug">
                Faculty allocations, timetable approvals, leaves, and internal marks locking.
              </p>
            </div>
            <Link
              to="/hod-dashboard"
              className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Open HOD Suite</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900">Departments Wing</h4>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Create faculty departments, allocate HODs, and building offices.</p>
          <Link
            to="/admin-dashboard/departments"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
          >
            Manage Departments to
          </Link>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900">Degree Courses</h4>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Set up degree programs, approved duration, and fees.</p>
          <Link
            to="/admin-dashboard/courses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Manage Courses to
          </Link>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900">Academic Batches</h4>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Create intake batches, semester terms, sections, and classroom allocations.</p>
          <Link
            to="/admin-dashboard/batches"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Manage Batches to
          </Link>
        </div>
      </div>
    </div>
  );
}

