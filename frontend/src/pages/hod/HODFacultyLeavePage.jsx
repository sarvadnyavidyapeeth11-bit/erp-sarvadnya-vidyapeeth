import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  Calendar,
  AlertCircle,
  User,
  ShieldCheck,
  FileText
} from "lucide-react";
import { getFacultyLeaveRequests, updateFacultyLeaveStatus } from "../../hooks/academicMasterData";
import Pagination from "../../components/common/Pagination";

export default function HODFacultyLeavePage() {
  const [leaves, setLeaves] = useState(() => getFacultyLeaveRequests());
  const [successMsg, setSuccessMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const reloadLeaves = () => {
    setLeaves(getFacultyLeaveRequests());
  };

  useEffect(() => {
    window.addEventListener("academicDataUpdated", reloadLeaves);
    window.addEventListener("facultyLeavesUpdated", reloadLeaves);
    window.addEventListener("storage", reloadLeaves);
    return () => {
      window.removeEventListener("academicDataUpdated", reloadLeaves);
      window.removeEventListener("facultyLeavesUpdated", reloadLeaves);
      window.removeEventListener("storage", reloadLeaves);
    };
  }, []);

  const handleStatusChange = (id, newStatus) => {
    updateFacultyLeaveStatus(id, newStatus);
    setSuccessMsg(`Faculty leave request marked as ${newStatus}!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200">
              HOD Faculty Governance
            </span>
            <span className="px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              {leaves.filter(l => l.status === "Pending").length} Pending Requests
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Faculty Leave Approvals & Substitutes
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Approve or reject departmental faculty leaves and verify substitute lecture assignments.
          </p>
        </div>
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

      {/* Leave Request Cards */}
      <div className="grid grid-cols-1 gap-4">
        {leaves.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800">No Faculty Leave Applications</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All departmental faculty members are currently active on duty. New leave requests will appear here in real-time.
            </p>
          </div>
        ) : (
          leaves
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((leave) => {

          return (
            <div
              key={leave.id}
              className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 font-black text-xs flex items-center justify-center border border-purple-200 shrink-0">
                    {leave.facultyName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">{leave.facultyName}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{leave.designation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {leave.leaveType} - {leave.totalDays} Day(s)
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border inline-flex items-center gap-1.5 ${
                      leave.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : leave.status === "Rejected"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {leave.status}
                  </span>
                </div>
              </div>

              {/* Leave Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Leave Duration:</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{leave.fromDate} to {leave.toDate}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Reason for Leave:</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{leave.reason}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Substitute Teacher Assigned:</span>
                  <p className="font-extrabold text-purple-900 mt-0.5 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                    {leave.substituteAssigned}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {isPending && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleStatusChange(leave.id, "Rejected")}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl border border-rose-200 transition-colors cursor-pointer"
                  >
                    Reject Request
                  </button>

                  <button
                    onClick={() => handleStatusChange(leave.id, "Approved")}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Leave</span>
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(leaves.length / itemsPerPage) || 1}
        totalItems={leaves.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p) => setCurrentPage(p)}
        onItemsPerPageChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        itemsPerPageOptions={[5, 10, 20]}
      />
    </div>
  );
}

