import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { getStudentVerifications } from "../../hooks/adminData";

export default function AdmissionDashboardPage() {
  const [applications, setApplications] = useState(() => getStudentVerifications());

  const reloadData = () => {
    setApplications(getStudentVerifications());
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

  const totalVerified = applications.filter((application) => application.status === "Verified").length;
  const rejectedCount = applications.filter((application) => application.status === "Rejected").length;
  const pendingCount = applications.length - totalVerified - rejectedCount;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-tr from-purple-700 via-indigo-700 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-black tracking-wider uppercase backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" /> Admissions Officer Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Student Enrollment & Verification Desk
          </h1>
          <p className="text-xs sm:text-sm font-medium text-purple-100 leading-relaxed">
            Enroll verified students into Admin-configured academic departments and batches. Verify student profiles, approve/reject documents, and audit real-time student submissions.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/admission-officer-dashboard/roster"
          className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-purple-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 font-mono">{applications.length}</p>
            <p className="text-xs font-bold text-slate-500">Total Applicants</p>
          </div>
        </Link>

        <Link
          to="/admission-officer-dashboard/verification"
          className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 font-mono">{totalVerified}</p>
            <p className="text-xs font-bold text-slate-500">Verified & Approved</p>
          </div>
        </Link>

        <Link
          to="/admission-officer-dashboard/verification"
          className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <AlertCircle className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 font-mono">{pendingCount}</p>
            <p className="text-xs font-bold text-slate-500">Pending Review</p>
          </div>
        </Link>

        <Link
          to="/admission-officer-dashboard/verification"
          className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-rose-300 transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
              <XCircle className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-rose-600 transition-colors" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 font-mono">{rejectedCount}</p>
            <p className="text-xs font-bold text-slate-500">Rejected Applications</p>
          </div>
        </Link>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Enroll Student Card */}
        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Enroll New Student</h3>
              <p className="text-xs font-semibold text-slate-500">Select Department, Course & Batch to admit student.</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Registers the student in the selected approved department, course, and batch with a pending verification status.
          </p>
          <Link
            to="/admission-officer-dashboard/enrollment"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-purple-200 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Enroll New Student Now
          </Link>
        </div>

        {/* Verification Card */}
        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Student Profile & Document Verification</h3>
              <p className="text-xs font-semibold text-slate-500">Accept or Reject applicant profiles & board records.</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Audit applicant marksheets, photo IDs, and board proofs. 1-click <strong>Accept / Approve</strong> or <strong>Reject with notes</strong> synchronizes live with Student Portal.
          </p>
          <Link
            to="/admission-officer-dashboard/verification"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Audit Profiles ({pendingCount} Pending)
          </Link>
        </div>
      </div>
    </div>
  );
}
