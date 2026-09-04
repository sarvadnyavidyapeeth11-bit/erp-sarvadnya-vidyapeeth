import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  IndianRupee,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  ArrowLeftRight
} from "lucide-react";
import {
  getBankChallans,
  processChallanVerification
} from "../../../hooks/studentPortalData";
import { useDragToScroll } from "../../../hooks/useDragToScroll";

export default function OfficerChallanVerificationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { ref: tableContainerRef, scrollLeftBy, scrollRightBy, events: dragEvents } = useDragToScroll();

  // Approval Modal State
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [challanToApprove, setChallanToApprove] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState("SBI Bank Branch scroll matched & amount credited to student fee ledger.");

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [challanToReject, setChallanToReject] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("Bank Journal / Scroll No. not found in branch daily report.");

  const [selectedChallanIds, setSelectedChallanIds] = useState([]);
  const [challans, setChallans] = useState(() => getBankChallans());

  const reloadData = () => {
    setChallans(getBankChallans());
  };

  const handleBulkApprove = () => {
    if (selectedChallanIds.length === 0) return;
    selectedChallanIds.forEach((id) => {
      processChallanVerification(id, "Approved", "Bulk verified by Fee Officer", "Accounts Officer");
    });
    showNotification(`Successfully bulk approved ${selectedChallanIds.length} Bank Challans!`);
    setSelectedChallanIds([]);
    reloadData();
  };

  const toggleSelectChallan = (id) => {
    setSelectedChallanIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    reloadData();
    window.addEventListener("bankChallansUpdated", reloadData);
    window.addEventListener("feeDataUpdated", reloadData);
    window.addEventListener("storage", reloadData);
    return () => {
      window.removeEventListener("bankChallansUpdated", reloadData);
      window.removeEventListener("feeDataUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  const showNotification = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(""), 5000);
  };

  const openApproveModal = (challan) => {
    setChallanToApprove(challan);
    setApprovalRemarks("SBI Bank Branch scroll matched & amount credited to student fee ledger.");
    setShowApproveModal(true);
  };

  const confirmApprove = (e) => {
    e.preventDefault();
    if (!challanToApprove) return;

    processChallanVerification(
      challanToApprove.id,
      "Approved",
      approvalRemarks,
      "Accounts Officer"
    );

    showNotification(`OK Challan ${challanToApprove.id} Approved! Rs. ${challanToApprove.amount.toLocaleString("en-IN")} credited to ${challanToApprove.studentName}'s passbook.`);
    setShowApproveModal(false);
    setChallanToApprove(null);
    reloadData();
  };

  const openRejectModal = (challan) => {
    setChallanToReject(challan);
    setRejectionRemarks("Bank Journal / Scroll No. not found in branch daily report.");
    setShowRejectModal(true);
  };

  const confirmReject = (e) => {
    e.preventDefault();
    if (!challanToReject) return;

    processChallanVerification(
      challanToReject.id,
      "Rejected",
      rejectionRemarks,
      "Accounts Officer"
    );

    showNotification(`X Challan ${challanToReject.id} Rejected. Reason communicated to student portal.`);
    setShowRejectModal(false);
    setChallanToReject(null);
    reloadData();
  };

  const filteredChallans = challans.filter((c) => {
    const matchSearch =
      !searchTerm ||
      String(c.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(c.rollNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(c.journalNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(c.id || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending" && String(c.status || "").includes("Pending")) ||
      (statusFilter === "Approved" && String(c.status || "").includes("Approved")) ||
      (statusFilter === "Rejected" && String(c.status || "").includes("Rejected"));

    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredChallans.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedChallans = filteredChallans.slice(startIndex, startIndex + itemsPerPage);

  const pendingCount = challans.filter((c) => String(c.status || "").includes("Pending")).length;
  const approvedSum = challans
    .filter((c) => String(c.status || "").includes("Approved"))
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-200">
              Audit & Clearing Desk
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-200">
              {pendingCount} Pending Verifications
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time Student Sync
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bank Challan & Payment Verification
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Review offline SBI cash/DD deposit slips submitted by students. Approve with audit remarks to clear student fee ledger instantly.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider">Approved Challan Credits</p>
            <p className="text-xl font-black text-slate-900 leading-tight">Rs. {approvedSum.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter, Search & Horizontal Scroll Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Scholar No, Student Name, Journal No..."
            className="w-full bg-slate-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-slate-500">Filter:</span>
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Left-to-Right Horizontal Scroll Buttons */}
          {selectedChallanIds.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bulk Approve Selected ({selectedChallanIds.length})</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-purple-50 p-1 rounded-xl border border-purple-200 text-xs">
            <span className="text-[10px] font-black text-purple-800 px-1.5 flex items-center gap-1">
              <ArrowLeftRight className="w-3 h-3" /> Scroll Table:
            </span>
            <button
              onClick={() => scrollLeftBy(350)}
              className="p-1.5 bg-white hover:bg-purple-100 text-purple-700 rounded-lg font-bold border border-purple-200 cursor-pointer shadow-xs"
              title="Scroll Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollRightBy(350)}
              className="p-1.5 bg-white hover:bg-purple-100 text-purple-700 rounded-lg font-bold border border-purple-200 cursor-pointer shadow-xs"
              title="Scroll Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Challan Verification Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Horizontal Scroll Hint */}
        <div className="px-4 py-1.5 bg-slate-100/70 border-b border-gray-200 text-[11px] text-slate-500 flex items-center justify-between font-medium">
          <span className="flex items-center gap-1">
            <ArrowLeftRight className="w-3 h-3 text-purple-600" />
            Tip: Use mouse cursor to drag & scroll (Left to Right) or mouse wheel to view all columns
          </span>
          <span className="font-bold text-purple-700">{filteredChallans.length} Challans</span>
        </div>

        <div
          ref={tableContainerRef}
          {...dragEvents}
          className="overflow-x-auto select-none scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-slate-100 active:cursor-grabbing"
        >
          <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-purple-50/70 border-b border-purple-200 text-purple-900 font-black">
                <th className="py-3 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedChallans.length > 0 && paginatedChallans.every(c => selectedChallanIds.includes(c.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedChallanIds(paginatedChallans.map(c => c.id));
                      } else {
                        setSelectedChallanIds([]);
                      }
                    }}
                    className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Challan Ref / Date</th>
                <th className="py-3 px-4">Student Details</th>
                <th className="py-3 px-4">Bank & Journal No</th>
                <th className="py-3 px-4">Particulars & Audit Remarks</th>
                <th className="py-3 px-4 text-right">Amount (Rs.)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedChallans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-semibold">
                    No challans found matching the current search criteria.
                  </td>
                </tr>
              ) : (
                paginatedChallans.map((challan) => {
                  const statusText = String(challan.status || "");
                  const isPending = statusText.includes("Pending");
                  const isApproved = statusText.includes("Approved");
                  const isRejected = statusText.includes("Rejected");
                  const isSelected = selectedChallanIds.includes(challan.id);

                  return (
                    <tr key={challan.id} className={`hover:bg-slate-50/60 transition-colors ${isSelected ? "bg-purple-50/40" : ""}`}>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectChallan(challan.id)}
                          className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-black text-slate-900 font-mono">{challan.id}</p>
                        <p className="text-[10px] text-slate-500">{challan.submittedDate}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-black text-slate-900">{challan.studentName}</p>
                        <p className="text-[10px] font-mono text-purple-700 font-bold">{challan.rollNumber}</p>
                        <p className="text-[10px] text-slate-500">{challan.course}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-extrabold text-slate-800">{challan.bankName}</p>
                        <p className="text-[10px] text-slate-500">{challan.branch}</p>
                        <p className="text-[10px] font-mono text-emerald-700 font-bold">JRN: {challan.journalNo}</p>
                        <p className="text-[10px] text-slate-500">Paid: {challan.paymentDate}</p>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-slate-800 truncate">{challan.particulars}</p>
                        {challan.decisionRemarks && (
                          <p className="text-[10px] text-purple-700 font-semibold truncate flex items-center gap-1 mt-0.5">
                            <MessageSquare className="w-3 h-3 text-purple-500 shrink-0" />
                            {challan.decisionRemarks}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          Rs. {challan.amount.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* -- Single Line Status Badge -- */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Approved - {challan.verifiedDate || "Verified"}
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 shrink-0" /> Pending Verification
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black whitespace-nowrap">
                            <XCircle className="w-3.5 h-3.5 shrink-0" /> Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedChallan(challan);
                              setShowProofModal(true);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                            title="View Stamped Slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => openApproveModal(challan)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[11px] flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </button>

                              <button
                                onClick={() => openRejectModal(challan)}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-black text-[11px] flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* -- 10-Item Pagination Bar -- */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-gray-500 font-medium">
            Showing <strong className="text-gray-800">{filteredChallans.length === 0 ? 0 : startIndex + 1}</strong> to{" "}
            <strong className="text-gray-800">{Math.min(filteredChallans.length, startIndex + itemsPerPage)}</strong> of{" "}
            <strong className="text-gray-800">{filteredChallans.length}</strong> challans
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg font-black text-xs cursor-pointer transition-all ${
                  currentPage === pageNum
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-white border border-gray-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* -- Approve Action & Remarks Modal -- */}
      <AnimatePresence>
        {showApproveModal && challanToApprove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Approve Bank Challan Deposit</h3>
                    <p className="text-xs text-slate-500 font-medium">Verify payment and credit student ledger</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-black cursor-pointer"
                >
                  X
                </button>
              </div>

              {/* Student Summary */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-200 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Student:</span>
                  <p className="font-black text-slate-900">{challanToApprove.studentName}</p>
                  <p className="text-purple-700">{challanToApprove.rollNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Amount to Credit:</span>
                  <p className="font-black text-emerald-700 text-base">Rs. {challanToApprove.amount.toLocaleString("en-IN")}</p>
                  <p className="text-slate-500">{challanToApprove.journalNo}</p>
                  <p className="text-slate-500">{challanToApprove.bankName} - {challanToApprove.branch}</p>
                </div>
              </div>

              <form onSubmit={confirmApprove} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Approval Verification Remarks / Note:
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:border-emerald-500"
                    placeholder="Enter approval audit remarks..."
                  />

                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowApproveModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center gap-1.5 shadow-md shadow-emerald-200 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm Approval & Credit Rs. {challanToApprove.amount.toLocaleString("en-IN")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -- Reject Action & Reason Modal -- */}
      <AnimatePresence>
        {showRejectModal && challanToReject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Reject Bank Challan Deposit</h3>
                    <p className="text-xs text-slate-500 font-medium">Specify rejection reason to notify the student</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-black cursor-pointer"
                >
                  X
                </button>
              </div>

              {/* Student Summary */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-200 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Student:</span>
                  <p className="font-black text-slate-900">{challanToReject.studentName}</p>
                  <p className="text-purple-700">{challanToReject.rollNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Challan Amount:</span>
                  <p className="font-black text-rose-700 text-base">Rs. {challanToReject.amount.toLocaleString("en-IN")}</p>
                  <p className="text-slate-500">{challanToReject.journalNo}</p>
                  <p className="text-slate-500">{challanToReject.bankName} - {challanToReject.branch}</p>
                </div>
              </div>

              <form onSubmit={confirmReject} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Rejection Reason / Auditor Remarks:
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={rejectionRemarks}
                    onChange={(e) => setRejectionRemarks(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:border-rose-500"
                    placeholder="Enter rejection reason..."
                  />

                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black flex items-center gap-1.5 shadow-md shadow-rose-200 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Confirm Rejection & Notify Student
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slip Preview Modal */}
      <AnimatePresence>
        {showProofModal && selectedChallan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">Bank Stamped Slip Verification</h3>
                  <p className="text-xs text-purple-700 font-mono font-bold">Challan Ref: {selectedChallan.id}</p>
                </div>
                <button
                  onClick={() => setShowProofModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-black cursor-pointer"
                >
                  X
                </button>
              </div>

              {/* Stamped Challan Mock Slip */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <div>
                    <p className="font-extrabold text-slate-900">{selectedChallan.bankName}</p>
                    <p className="text-[10px] text-slate-500">{selectedChallan.branch}</p>
                  </div>
                  <div className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-black text-[10px]">
                    BANK STAMPED
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-sans font-bold text-[9px] uppercase">Student:</span>
                    <p className="font-black text-slate-900">{selectedChallan.studentName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans font-bold text-[9px] uppercase">Scholar No:</span>
                    <p className="font-black text-purple-700">{selectedChallan.rollNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans font-bold text-[9px] uppercase">Journal No:</span>
                    <p className="font-black text-emerald-700">{selectedChallan.journalNo}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans font-bold text-[9px] uppercase">Amount:</span>
                    <p className="font-black text-slate-900">Rs. {selectedChallan.amount.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {selectedChallan.decisionRemarks && (
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[10px] text-purple-900 space-y-0.5">
                    <p className="font-bold">Officer Remarks:</p>
                    <p>{selectedChallan.decisionRemarks}</p>
                    {selectedChallan.verifiedBy && (
                      <p className="text-[9px] text-purple-600 font-semibold">- {selectedChallan.verifiedBy} ({selectedChallan.verifiedDate})</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" /> Print Deposit Slip
                </button>
                <button
                  onClick={() => setShowProofModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



