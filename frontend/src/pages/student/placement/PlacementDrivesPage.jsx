import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Building2,
  Calendar,
  IndianRupee,
  GraduationCap,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
  Upload,
  Search,
  Filter,
  Check,
  AlertCircle,
  X,
  ExternalLink,
  Award,
  Sparkles,
  MapPin,
} from "lucide-react";
import { studentProfile, placementDrives } from "../../../hooks/studentPortalData";

const extendedDrives = placementDrives;

export default function PlacementDrivesPage() {
  const [appliedDrives, setAppliedDrives] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applySuccessMsg, setApplySuccessMsg] = useState("");

  const handleApply = (driveId) => {
    if (!appliedDrives.includes(driveId)) {
      setAppliedDrives((prev) => [...prev, driveId]);
      const drive = extendedDrives.find((d) => d.id === driveId);
      setApplySuccessMsg(`Successfully applied for ${drive?.company || "Drive"}!`);
      setTimeout(() => setApplySuccessMsg(""), 4000);
    }
  };

  const filteredDrives = extendedDrives.filter((drive) => {
    const matchesSearch =
      drive.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "open") return matchesSearch && drive.status === "Registration Open";
    if (activeTab === "applied") return matchesSearch && appliedDrives.includes(drive.id);
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-10">
      {/* ── Top Header Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-purple-900/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Training & Placement Cell
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Placement Drives
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl">
            Explore upcoming recruitment drives, apply for top corporate roles, and track your active job application statuses.
          </p>
        </div>
      </div>

      {/* ── Key Statistics Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-800">{extendedDrives.length}</p>
            <p className="text-xs text-gray-500 font-medium">Active Drives</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-800">4.5 LPA</p>
            <p className="text-xs text-gray-500 font-medium">Highest Package</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-800">{appliedDrives.length}</p>
            <p className="text-xs text-gray-500 font-medium">Applied Drives</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-800">92%</p>
            <p className="text-xs text-gray-500 font-medium">Placement Rate</p>
          </div>
        </div>
      </div>

      {/* ── Success Toast Message ── */}
      <AnimatePresence>
        {applySuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{applySuccessMsg}</span>
            </div>
            <button onClick={() => setApplySuccessMsg("")} className="hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter Tabs & Search Bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none ${activeTab === "all"
              ? "bg-white text-purple-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            All Drives ({extendedDrives.length})
          </button>
          <button
            onClick={() => setActiveTab("open")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none ${activeTab === "open"
              ? "bg-white text-purple-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Open Drives
          </button>
          <button
            onClick={() => setActiveTab("applied")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none ${activeTab === "applied"
              ? "bg-white text-purple-700 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Applied ({appliedDrives.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
      </div>

      {/* ── Drives Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDrives.map((drive) => {
          const isApplied = appliedDrives.includes(drive.id);
          return (
            <motion.div
              key={drive.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Company & Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-extrabold flex items-center justify-center text-sm shadow">
                      {drive.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800 leading-tight">
                        {drive.company}
                      </h3>
                      <p className="text-xs font-semibold text-purple-700 mt-0.5">{drive.role}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isApplied
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : drive.status === "Registration Open"
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                  >
                    {isApplied ? "Applied" : drive.status}
                  </span>
                </div>

                {/* Details Pills */}
                <div className="grid grid-cols-2 gap-2 my-4 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Package
                    </span>
                    <span className="font-extrabold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                      {drive.package}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Drive Date
                    </span>
                    <span className="font-bold text-gray-700 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {drive.date}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-gray-200/60">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Eligibility
                    </span>
                    <span className="font-medium text-gray-700 mt-0.5 block truncate">
                      {drive.eligibility}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedDrive(drive)}
                  className="flex-1 py-2 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all text-center"
                >
                  View Details
                </button>

                {isApplied ? (
                  <button
                    disabled
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Applied
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(drive.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/20 active:scale-95 text-center"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Drive Detail Modal ── */}
      <AnimatePresence>
        {selectedDrive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedDrive(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-extrabold flex items-center justify-center text-lg shadow">
                  {selectedDrive.company.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-800">{selectedDrive.company}</h2>
                  <p className="text-xs font-bold text-purple-700">{selectedDrive.role}</p>
                </div>
              </div>

              <div className="space-y-3 my-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Package</span>
                    <p className="font-extrabold text-emerald-600">{selectedDrive.package}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Drive Date</span>
                    <p className="font-bold text-gray-700">{selectedDrive.date}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Location</span>
                    <p className="font-bold text-gray-700">{selectedDrive.location || "Main Campus"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Drive Mode</span>
                    <p className="font-bold text-gray-700">{selectedDrive.mode || "On-Campus"}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                    Job Description
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedDrive.description ||
                      "Detailed job responsibilities will be briefed by HR during the pre-placement talk session before the online assessment."}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                    Selection Process
                  </h4>
                  <ul className="space-y-1">
                    {(selectedDrive.process || [
                      "Written Aptitude & Technical Test",
                      "Technical Interview Round",
                      "HR Discussion",
                    ]).map((step, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedDrive(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
                {appliedDrives.includes(selectedDrive.id) ? (
                  <button
                    disabled
                    className="px-5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Applied
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleApply(selectedDrive.id);
                      setSelectedDrive(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/20"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
