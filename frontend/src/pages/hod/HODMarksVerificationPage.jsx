import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Lock,
  Search,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Printer,
  FileCheck
} from "lucide-react";
import { getInternalMarksList, lockInternalMarksSheet, getSubjects, getActiveHODProfile, matchesActiveHODDepartment } from "../../hooks/academicMasterData";
import Pagination from "../../components/common/Pagination";

export default function HODMarksVerificationPage() {
  const loadDepartmentMarks = () => {
    const subjectCodes = new Set(getSubjects()
      .filter((subject) => matchesActiveHODDepartment(subject, getActiveHODProfile()))
      .map((subject) => subject.code));
    return getInternalMarksList().filter((sheet) => subjectCodes.has(sheet.subjectCode));
  };
  const [marksSheets, setMarksSheets] = useState(loadDepartmentMarks);
  const [successMsg, setSuccessMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  const reloadMarks = () => {
    setMarksSheets(loadDepartmentMarks());
  };

  useEffect(() => {
    window.addEventListener("academicDataUpdated", reloadMarks);
    window.addEventListener("internalMarksUpdated", reloadMarks);
    window.addEventListener("storage", reloadMarks);
    return () => {
      window.removeEventListener("academicDataUpdated", reloadMarks);
      window.removeEventListener("internalMarksUpdated", reloadMarks);
      window.removeEventListener("storage", reloadMarks);
    };
  }, []);

  const handleLockMarks = (id, subjectCode) => {
    lockInternalMarksSheet(id, subjectCode);
    setSuccessMsg(`Internal Marks for ${subjectCode} locked and confirmed by HOD for University submission!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
              Exam & Sessional Marks Controller
            </span>
            <span className="px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
              {marksSheets.length} Subject Scorecards
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Internal & Sessional Marks Locking
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Audit mid-term internal marks submitted by teachers, verify evaluation fairness, and lock scorecards.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print Marks Dossier</span>
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

      {/* Marks Scorecard List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {marksSheets.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800">No Internal Marks Sheets Generated Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Database-submitted subject scorecards will appear here for HOD verification.
            </p>
          </div>
        ) : (
          marksSheets
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((sheet) => {

          return (
            <div
              key={sheet.id}
              className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-mono font-bold text-xs border border-purple-200">
                    {sheet.subjectCode}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    isLocked ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  } inline-flex items-center gap-1.5`}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {sheet.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-snug">{sheet.subjectName}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{sheet.batch}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-3 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Evaluated</span>
                  <p className="font-extrabold text-slate-900">{sheet.evaluatedStudents} / {sheet.totalStudents}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Max Marks</span>
                  <p className="font-extrabold text-slate-900">{sheet.maxMarks}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Class Avg</span>
                  <p className="font-extrabold text-emerald-700 font-mono">{sheet.averageMarks}</p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  {sheet.facultyName}
                </span>

                {isLocked ? (
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-xl border border-emerald-200 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Locked for University
                  </span>
                ) : (
                  <button
                    onClick={() => handleLockMarks(sheet.id, sheet.subjectCode)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Audit & Lock Marks
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(marksSheets.length / itemsPerPage) || 1}
        totalItems={marksSheets.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p) => setCurrentPage(p)}
        onItemsPerPageChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        itemsPerPageOptions={[4, 8, 16]}
      />
    </div>
  );
}
