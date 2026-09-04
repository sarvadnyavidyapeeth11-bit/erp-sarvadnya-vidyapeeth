import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  IndianRupee,
  Receipt,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
  CreditCard,
  Building,
  Eye,
  FileText,
  ArrowLeftRight,
  User,
  Landmark
} from "lucide-react";
import {
  getRefundRequests,
  processRefundAction,
  getFeeDetailsForStudent,
  getScholarshipExcessForStudent,
  studentProfile,
  feeDetails
} from "../../../hooks/studentPortalData";
import { useDragToScroll } from "../../../hooks/useDragToScroll";

export default function OfficerRefundsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { ref: tableContainerRef, scrollLeftBy, scrollRightBy, events: dragEvents } = useDragToScroll();

  const [refunds, setRefunds] = useState(() => getRefundRequests());

  // Inspect Modal State
  const [inspectRefund, setInspectRefund] = useState(null);

  // Action Modal State
  const [modalAction, setModalAction] = useState(null); // "approve" | "reject"
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [remarksText, setRemarksText] = useState("");
  const [officerName, setOfficerName] = useState("Senior Cashier / Accounts Officer");
  const [payoutBankName, setPayoutBankName] = useState("");
  const [payoutAccountHolderName, setPayoutAccountHolderName] = useState("");
  const [payoutAccountNo, setPayoutAccountNo] = useState("");
  const [payoutIfsc, setPayoutIfsc] = useState("");

  const reloadRefunds = () => {
    setRefunds(getRefundRequests());
  };

  useEffect(() => {
    reloadRefunds();
    window.addEventListener("refundDataUpdated", reloadRefunds);
    window.addEventListener("feeDataUpdated", reloadRefunds);
    window.addEventListener("storage", reloadRefunds);
    return () => {
      window.removeEventListener("refundDataUpdated", reloadRefunds);
      window.removeEventListener("feeDataUpdated", reloadRefunds);
      window.removeEventListener("storage", reloadRefunds);
    };
  }, []);

  const showNotification = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(""), 5000);
  };

  // Horizontal scroll helper
  const scrollTable = (direction) => {
    if (tableContainerRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      tableContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleOpenApprove = (r) => {
    const financials = getFeeDetailsForStudent(r.rollNumber);
    const ledgerExcess = Math.max(0, financials.totalPaid - financials.totalFees);
    const scholarshipExcess = getScholarshipExcessForStudent(r.rollNumber, r.session || financials.academicYear || "");
    const refundableAmount = Math.max(ledgerExcess, scholarshipExcess);
    if (refundableAmount <= 0) {
      alert("This student has no excess fee credit available for refund.");
      return;
    }
    setSelectedRefund(r);
    setModalAction("approve");
    setRefundAmount(Math.min(Number(r.amount) || 0, refundableAmount));
    setUtrNumber("");
    setRemarksText("Duplicate / excess deduction verified with bank statement - Payout transferred via NEFT.");
    setPayoutBankName(r.bankName || "");
    setPayoutAccountHolderName(r.accountHolderName || r.studentName || "");
    setPayoutAccountNo(r.accountNo || "");
    setPayoutIfsc(r.ifsc || "");
  };

  const handleOpenReject = (r) => {
    setSelectedRefund(r);
    setModalAction("reject");
    setRemarksText("Refund claim invalid / no excess credit found in university merchant settlement report.");
    setPayoutBankName("");
    setPayoutAccountHolderName("");
    setPayoutAccountNo("");
    setPayoutIfsc("");
  };

  const handleConfirmAction = (e) => {
    e.preventDefault();
    if (!selectedRefund || !modalAction) return;

    if (modalAction === "approve") {
      if (!utrNumber.trim()) {
        alert("Enter the actual bank UTR/reference number before approving this refund.");
        return;
      }
      if (!payoutBankName.trim() || !payoutAccountHolderName.trim() || !payoutAccountNo.trim() || !payoutIfsc.trim()) {
        alert("Approve karne se pehle payout bank ki 4 details verify/update karein.");
        return;
      }
      processRefundAction(
        selectedRefund.ticketId,
        "Approved",
        refundAmount,
        utrNumber,
        remarksText,
        officerName,
        {
          bankName: payoutBankName.trim(),
          accountHolderName: payoutAccountHolderName.trim(),
          accountNo: payoutAccountNo.trim(),
          ifsc: payoutIfsc.trim()
        }
      );
      showNotification(`OK Refund Claim ${selectedRefund.ticketId} Processed! Rs. ${Number(refundAmount).toLocaleString("en-IN")} disbursed (UTR: ${utrNumber}).`);
    } else {
      processRefundAction(
        selectedRefund.ticketId,
        "Rejected",
        0,
        "",
        remarksText,
        officerName
      );
      showNotification(`X Refund Claim ${selectedRefund.ticketId} Rejected.`);
    }

    setModalAction(null);
    setSelectedRefund(null);
    if (inspectRefund && inspectRefund.ticketId === selectedRefund.ticketId) {
      setInspectRefund(null);
    }
    reloadRefunds();
  };

  const filteredRefunds = refunds.filter((item) => {
    const sName = String(item.studentName || "");
    const sRoll = String(item.rollNumber || "");
    const sId = String(item.ticketId || "");
    const sCat = String(item.category || "");
    const statusText = String(item.status || "");

    const matchSearch =
      !searchTerm ||
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sRoll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sCat.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending" && (statusText.includes("Pending") || statusText.includes("Review"))) ||
      (statusFilter === "Approved" && statusText.includes("Approved")) ||
      (statusFilter === "Rejected" && statusText.includes("Rejected"));

    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredRefunds.slice(startIndex, startIndex + itemsPerPage);

  const pendingCount = refunds.filter((r) => String(r.status || "").includes("Pending") || String(r.status || "").includes("Review")).length;
  const approvedCount = refunds.filter((r) => String(r.status || "").includes("Approved")).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* -- Top Header Banner -- */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-200">
              Audit Settlement & Bank Payouts
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time Student Sync
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-rose-600" />
            Fee Refund Claims & Bank Payout Settlement Desk
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Audit double gateway transaction deductions, excess fee returns, security caution money payouts, and generate NEFT UTR numbers.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center">
            <p className="text-[10px] font-black uppercase text-rose-700">Pending Claims</p>
            <p className="text-lg font-black text-rose-900">{pendingCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <p className="text-[10px] font-black uppercase text-emerald-700">Refunds Settled</p>
            <p className="text-lg font-black text-emerald-900">{approvedCount}</p>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* -- Search, Filter & Horizontal Scroll Controls Toolbar -- */}
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
            placeholder="Search by Scholar No, Student Name, Ticket ID..."
            className="w-full bg-slate-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:border-rose-500"
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
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Left-to-Right Horizontal Scroll Buttons */}
          <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200 text-xs">
            <span className="text-[10px] font-black text-rose-800 px-1.5 flex items-center gap-1">
              <ArrowLeftRight className="w-3 h-3" /> Scroll Table:
            </span>
            <button
              onClick={() => scrollLeftBy(350)}
              className="p-1.5 bg-white hover:bg-rose-100 text-rose-700 rounded-lg font-bold border border-rose-200 cursor-pointer shadow-xs"
              title="Scroll Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollRightBy(350)}
              className="p-1.5 bg-white hover:bg-rose-100 text-rose-700 rounded-lg font-bold border border-rose-200 cursor-pointer shadow-xs"
              title="Scroll Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* -- Active Table with Full Left-Right Scrolling -- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Horizontal Scroll Hint */}
        <div className="px-4 py-1.5 bg-slate-100/70 border-b border-gray-200 text-[11px] text-slate-500 flex items-center justify-between font-medium">
          <span className="flex items-center gap-1">
            <ArrowLeftRight className="w-3 h-3 text-rose-600" />
            Tip: Use mouse cursor to drag & scroll (Left to Right) or mouse wheel to view all columns
          </span>
          <span className="font-bold text-rose-700">{filteredRefunds.length} Refund Claims</span>
        </div>

        <div
          ref={tableContainerRef}
          {...dragEvents}
          className="overflow-x-auto select-none scrollbar-thin scrollbar-thumb-rose-300 scrollbar-track-slate-100 active:cursor-grabbing"
        >
          <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-rose-50/80 border-b border-rose-200 text-rose-900 font-black">
                <th className="py-3 px-4 w-36">Ticket ID / Date</th>
                <th className="py-3 px-4 w-52">Student Details</th>
                <th className="py-3 px-4 w-60">Category & Claim Details</th>
                <th className="py-3 px-4 w-48">Payout Bank Account</th>
                <th className="py-3 px-4 text-right w-36">Amount (Rs.)</th>
                <th className="py-3 px-4 text-center w-40">Status</th>
                <th className="py-3 px-4 w-52">Officer Remarks / UTR</th>
                <th className="py-3 px-4 text-center w-36 sticky right-0 bg-rose-50/95 backdrop-blur-xs shadow-xs">
                  Inspect & Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-semibold">
                    No refund records found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const rowStatus = String(item.status || "");
                  const isPending = rowStatus.includes("Pending") || rowStatus.includes("Review");
                  const isApproved = rowStatus.includes("Approved");

                  return (
                    <tr key={item.ticketId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-black text-slate-900 font-mono">{item.ticketId}</p>
                        <p className="text-[10px] text-slate-500">{item.date}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-black text-slate-900">{item.studentName}</p>
                        <p className="text-[10px] font-mono text-purple-700 font-bold">{item.rollNumber}</p>
                        <p className="text-[10px] text-slate-500">{item.course}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{item.category}</p>
                        <p className="text-[10px] text-slate-500 leading-snug line-clamp-1">{item.reason}</p>
                      </td>

                      <td className="py-3 px-4 text-[11px] font-mono">
                        <p className="font-bold text-slate-800">{item.bankName || "Bank not saved"}</p>
                        <p className="text-[10px] text-slate-600 font-sans font-bold">{item.accountHolderName || item.studentName || "Holder not saved"}</p>
                        <p className="text-[10px] text-slate-500">{item.accountNo || "A/C not saved"}</p>
                        <p className="text-[9px] text-purple-700">{item.ifsc || "IFSC not saved"}</p>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          Rs. {(item.amount || 0).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Single Line Status Badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Settled - {item.verifiedDate || "Paid"}
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 shrink-0" /> In Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black whitespace-nowrap">
                            <XCircle className="w-3.5 h-3.5 shrink-0" /> Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px]">
                        {item.utrNumber && (
                          <p className="font-mono font-black text-emerald-800 text-[10px] truncate">
                            UTR: {item.utrNumber}
                          </p>
                        )}
                        {item.officerRemarks ? (
                          <span className="flex items-center gap-1 text-purple-900 font-medium truncate">
                            <MessageSquare className="w-3 h-3 text-purple-600 shrink-0" />
                            {item.officerRemarks}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Under review</span>
                        )}
                      </td>

                      {/* Inspect & Actions (Sticky right column) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap sticky right-0 bg-white/95 backdrop-blur-xs shadow-xs">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Inspect Full Claim & Account Details */}
                          <button
                            onClick={() => setInspectRefund(item)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg cursor-pointer border border-rose-200 transition-all"
                            title="Inspect Student Claim & Payout Bank Proof"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleOpenApprove(item)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[10px] flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Payout
                              </button>

                              <button
                                onClick={() => handleOpenReject(item)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-black text-[10px] flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <XCircle className="w-3 h-3" /> Reject
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
            Showing <strong className="text-gray-800">{filteredRefunds.length === 0 ? 0 : startIndex + 1}</strong> to{" "}
            <strong className="text-gray-800">{Math.min(filteredRefunds.length, startIndex + itemsPerPage)}</strong> of{" "}
            <strong className="text-gray-800">{filteredRefunds.length}</strong> records
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
                    ? "bg-rose-600 text-white shadow-xs"
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

      {/* -- Rich Refund Claim & Bank Account Inspection Modal -- */}
      <AnimatePresence>
        {inspectRefund && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Refund Claim & Beneficiary Bank Proof</h3>
                    <p className="text-xs text-slate-500 font-medium">Ticket ID: {inspectRefund.ticketId} - Filed: {inspectRefund.date}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectRefund(null)}
                  className="text-slate-400 hover:text-slate-600 font-black text-lg p-1 cursor-pointer"
                >
                  X
                </button>
              </div>

              {/* Student Identity Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black">Student Name:</span>
                  <p className="font-black text-slate-900 text-sm">{inspectRefund.studentName}</p>
                  <p className="text-purple-700 font-mono font-bold">{inspectRefund.rollNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black">Course:</span>
                  <p className="font-bold text-slate-800">{inspectRefund.course}</p>
                  <p className="text-slate-500">Session: 2024-2027</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black">Claim Amount:</span>
                  <p className="font-black text-rose-700 text-sm">Rs. {inspectRefund.amount.toLocaleString("en-IN")}</p>
                  <p className="text-slate-500 font-bold">{inspectRefund.category}</p>
                </div>
              </div>

              {/* Bank Account Verification Details */}
              <div className="space-y-2 text-xs">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-emerald-600" /> Beneficiary Bank Account for NEFT Payout
                </h4>
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans uppercase font-bold">Bank Name:</span>
                    <p className="font-black text-slate-900">{inspectRefund.bankName || "Not saved"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans uppercase font-bold">Account Holder:</span>
                    <p className="font-black text-slate-900">{inspectRefund.accountHolderName || inspectRefund.studentName || "Not saved"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans uppercase font-bold">Account No:</span>
                    <p className="font-black text-purple-700">{inspectRefund.accountNo || "Not saved"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans uppercase font-bold">IFSC Code:</span>
                    <p className="font-black text-emerald-800">{inspectRefund.ifsc || "Not saved"}</p>
                  </div>
                </div>
              </div>

              {/* Justification & Claim Reason */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-600" /> Claim Justification & Description
                </h4>
                <p className="p-3 rounded-xl bg-slate-50 border border-gray-200 text-slate-800 font-medium leading-relaxed">
                  "{inspectRefund.reason}"
                </p>
              </div>

              {/* Uploaded Documents Preview Box */}
              <div className="space-y-2 text-xs">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" /> Uploaded Bank Passbook & Duplicate Payment Proof
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-rose-600" />
                      <div>
                        <p className="font-bold text-slate-800 text-[11px]">Payment_Gateway_Txn_{inspectRefund.rollNumber}.pdf</p>
                        <p className="text-[9px] text-slate-400">Razorpay / UPI Screenshot - 920 KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Opening Gateway Transaction Proof for ${inspectRefund.studentName}`)}
                      className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 rounded-lg border border-rose-200 font-bold text-[10px] cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Actions Toolbar */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setInspectRefund(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Close
                </button>

                {(String(inspectRefund.status || "").includes("Pending") || String(inspectRefund.status || "").includes("Review")) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReject(inspectRefund)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <XCircle className="w-4 h-4" /> Reject Claim
                    </button>
                    <button
                      onClick={() => handleOpenApprove(inspectRefund)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-200"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve & Disburse Payout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -- Approve Payout Modal -- */}
      <AnimatePresence>
        {modalAction === "approve" && selectedRefund && (
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
                    <h3 className="text-base font-black text-slate-900">Approve & Disburse Refund Payout</h3>
                    <p className="text-xs text-slate-500 font-medium">Ref: {selectedRefund.ticketId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalAction(null)}
                  className="text-slate-400 hover:text-slate-600 font-black cursor-pointer"
                >
                  X
                </button>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-200 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Student:</span>
                  <p className="font-black text-slate-900">{selectedRefund.studentName}</p>
                  <p className="text-purple-700">{selectedRefund.rollNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Bank A/C:</span>
                  <p className="font-black text-slate-900 truncate">{selectedRefund.bankName || "Not saved"} - {selectedRefund.accountNo || "Not saved"}</p>
                  <p className="text-slate-600 font-bold truncate">{selectedRefund.accountHolderName || selectedRefund.studentName || "Holder not saved"}</p>
                  <p className="text-emerald-700">IFSC: {selectedRefund.ifsc || "Not saved"}</p>
                </div>
              </div>

              <form onSubmit={handleConfirmAction} className="space-y-3.5 text-xs">
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-emerald-700" /> Verify / Update Payout Bank Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-extrabold text-slate-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={payoutBankName}
                        onChange={(e) => setPayoutBankName(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-bold text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-extrabold text-slate-700 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        required
                        value={payoutAccountHolderName}
                        onChange={(e) => setPayoutAccountHolderName(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-bold text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-extrabold text-slate-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        required
                        value={payoutAccountNo}
                        onChange={(e) => setPayoutAccountNo(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-extrabold text-slate-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={payoutIfsc}
                        onChange={(e) => setPayoutIfsc(e.target.value.toUpperCase())}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">
                      Refund Payout Amount (Rs.):
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={refundAmount === 0 ? "" : (refundAmount ?? "")}
                      onChange={(e) => setRefundAmount(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="Enter refund amount..."
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-mono font-bold text-slate-900 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">
                      Bank NEFT / UTR Reference No:
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-mono font-bold text-purple-700 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Officer Approval Note / Verification Remarks:
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={remarksText}
                    onChange={(e) => setRemarksText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalAction(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center gap-1.5 shadow-md shadow-emerald-200 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm & Disburse Rs. {Number(refundAmount).toLocaleString("en-IN")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -- Reject Modal -- */}
      <AnimatePresence>
        {modalAction === "reject" && selectedRefund && (
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
                    <h3 className="text-base font-black text-slate-900">Reject Refund Claim</h3>
                    <p className="text-xs text-slate-500 font-medium">Ref: {selectedRefund.ticketId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalAction(null)}
                  className="text-slate-400 hover:text-slate-600 font-black cursor-pointer"
                >
                  X
                </button>
              </div>

              <form onSubmit={handleConfirmAction} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Rejection Reason / Auditor Remarks:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={remarksText}
                    onChange={(e) => setRemarksText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalAction(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black flex items-center gap-1.5 shadow-md shadow-rose-200 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Confirm Rejection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



