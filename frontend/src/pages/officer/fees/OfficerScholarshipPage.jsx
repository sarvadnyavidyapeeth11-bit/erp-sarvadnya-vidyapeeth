import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Eye,
  FileText,
  ArrowLeftRight
} from "lucide-react";
import {
  getScholarshipApplications,
  processScholarshipAction,
  studentProfile,
  feeDetails
} from "../../../hooks/studentPortalData";
import { useDragToScroll } from "../../../hooks/useDragToScroll";
import { openDocumentInNewTab } from "../../../utils/openDocumentInNewTab";

export default function OfficerScholarshipPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { ref: tableContainerRef, scrollLeftBy, scrollRightBy, events: dragEvents } = useDragToScroll();

  const [scholarships, setScholarships] = useState(() => getScholarshipApplications());

  // Inspect & Document Details Modal State
  const [inspectApp, setInspectApp] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Action Modal State
  const [modalAction, setModalAction] = useState(null); // "approve" | "reject"
  const [selectedApp, setSelectedApp] = useState(null);
  const [sanctionedAmount, setSanctionedAmount] = useState("");
  const [remarksText, setRemarksText] = useState("");
  const [officerName, setOfficerName] = useState("Scholarship Nodal Officer");

  const isActionPendingStatus = (status = "") => {
    const text = String(status || "");
    return !text.includes("Fee Payment Pending") && (text.includes("Pending") || text.includes("Review"));
  };

  const reloadScholarships = () => {
    setScholarships(getScholarshipApplications());
  };

  useEffect(() => {
    reloadScholarships();
    window.addEventListener("scholarshipDataUpdated", reloadScholarships);
    window.addEventListener("feeDataUpdated", reloadScholarships);
    window.addEventListener("storage", reloadScholarships);
    return () => {
      window.removeEventListener("scholarshipDataUpdated", reloadScholarships);
      window.removeEventListener("feeDataUpdated", reloadScholarships);
      window.removeEventListener("storage", reloadScholarships);
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

  const handleOpenApprove = (app) => {
    setSelectedApp(app);
    setModalAction("approve");
    setSanctionedAmount(app.sanctionedAmount || app.requestedAmount || 0);
    setRemarksText("Scholarship amount received in college account and adjusted in fee ledger.");
  };

  const handleOpenReject = (app) => {
    setSelectedApp(app);
    setModalAction("reject");
    setRemarksText("Income certificate / eligibility criteria not verified by revenue authority.");
  };

  const handleConfirmAction = (e) => {
    e.preventDefault();
    if (!selectedApp || !modalAction) return;

    if (modalAction === "approve") {
      const result = processScholarshipAction(
        selectedApp.id,
        "Approved",
        sanctionedAmount,
        remarksText,
        officerName
      );
      const adjusted = Number(result?.feeAdjustedAmount) || 0;
      const excess = Number(result?.excessScholarshipAmount) || 0;
      showNotification(
        excess > 0
          ? `OK Scholarship ${selectedApp.id} Approved! Rs. ${adjusted.toLocaleString("en-IN")} adjusted in fee ledger; Rs. ${excess.toLocaleString("en-IN")} marked excess/refundable.`
          : `OK Scholarship ${selectedApp.id} Approved! Rs. ${adjusted.toLocaleString("en-IN")} adjusted in student fee ledger.`
      );
    } else {
      processScholarshipAction(
        selectedApp.id,
        "Rejected",
        0,
        remarksText,
        officerName
      );
      showNotification(`X Scholarship ${selectedApp.id} Rejected. Reason communicated to student.`);
    }

    setModalAction(null);
    setSelectedApp(null);
    if (inspectApp && inspectApp.id === selectedApp.id) {
      setInspectApp(null);
    }
    reloadScholarships();
  };

  const isImageDoc = (doc = {}) => (
    String(doc.fileType || "").startsWith("image/") ||
    String(doc.savedFile || doc.file || "").match(/\.(png|jpe?g|webp)$/i)
  );

  const filteredScholarships = scholarships.filter((item) => {
    if (String(item.disbursementTo || item.paymentDestination || "").includes("Student Account")) return false;
    const sName = String(item.studentName || "");
    const sRoll = String(item.scholarNo || item.rollNumber || "");
    const sId = String(item.id || "");
    const sType = String(item.name || "");
    const statusText = String(item.status || "");

    const matchSearch =
      !searchTerm ||
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sRoll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending" && isActionPendingStatus(statusText)) ||
      (statusFilter === "Approved" && (statusText.includes("Approved") || statusText.includes("Verified"))) ||
      (statusFilter === "Rejected" && statusText.includes("Rejected"));

    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredScholarships.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredScholarships.slice(startIndex, startIndex + itemsPerPage);

  const pendingCount = scholarships.filter((s) => isActionPendingStatus(s.status)).length;
  const approvedCount = scholarships.filter((s) => String(s.status || "").includes("Approved") || String(s.status || "").includes("Verified")).length;

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
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-200">
              State Welfare & Nodal Desk
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time Student Sync
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            Scholarships & DRCC Schemes Verification Desk
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Verify Bihar Student Credit Card (DRCC Loan), Bihar Post-Matric Welfare (PMS), NSP, and Institutional Merit Waivers.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-center">
            <p className="text-[10px] font-black uppercase text-purple-700">Pending Review</p>
            <p className="text-lg font-black text-purple-900">{pendingCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <p className="text-[10px] font-black uppercase text-emerald-700">Sanctioned</p>
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
            placeholder="Search by Scholar No, Student Name, Ref ID..."
            className="w-full bg-slate-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
          {/* Status Filter Buttons */}
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

      {/* -- Active Table with Full Left-Right Scrolling -- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Horizontal Scroll Hint for Mobile/Tablet */}
        <div className="px-4 py-1.5 bg-slate-100/70 border-b border-gray-200 text-[11px] text-slate-500 flex items-center justify-between font-medium">
          <span className="flex items-center gap-1">
            <ArrowLeftRight className="w-3 h-3 text-purple-600" />
            Tip: Use mouse cursor to drag & scroll (Left to Right) or mouse wheel to view all columns
          </span>
          <span className="font-bold text-purple-700">{filteredScholarships.length} Applications</span>
        </div>

        <div
          ref={tableContainerRef}
          {...dragEvents}
          className="overflow-x-auto select-none scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-slate-100 active:cursor-grabbing"
        >
          <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-purple-50/80 border-b border-purple-200 text-purple-900 font-black">
                <th className="py-3 px-4 w-36">Ref ID / Date</th>
                <th className="py-3 px-4 w-52">Student Details</th>
                <th className="py-3 px-4 w-60">Scheme Name & Category</th>
                <th className="py-3 px-4 w-44">Income & Academic</th>
                <th className="py-3 px-4 text-right w-36">Sanction Amt (Rs.)</th>
                <th className="py-3 px-4 text-center w-40">Status</th>
                <th className="py-3 px-4 w-52">Officer Audit Remarks</th>
                <th className="py-3 px-4 text-center w-36 sticky right-0 bg-purple-50/95 backdrop-blur-xs shadow-xs">
                  Inspect & Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-semibold">
                    No scholarship records found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const rowStatus = String(item.status || "");
                  const isPending = isActionPendingStatus(rowStatus);
                  const isApproved = rowStatus.includes("Approved") || rowStatus.includes("Verified");
                  const amountVal = item.sanctionedAmount || item.requestedAmount || 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-black text-slate-900 font-mono">{item.id}</p>
                        <p className="text-[10px] text-slate-500">{item.appliedDate}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-black text-slate-900">{item.studentName}</p>
                        <p className="text-[10px] font-mono text-purple-700 font-bold">{item.scholarNo || item.rollNumber}</p>
                        <p className="text-[10px] text-slate-500">{[item.course, item.semester].filter(Boolean).join(" - ")}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-black border border-purple-200">
                          {item.category}
                        </span>
                        {item.schemeApplicationNo && (
                          <p className="mt-1 text-[10px] text-slate-500 font-mono">App: {item.schemeApplicationNo}</p>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px]">
                        <p className="text-slate-700 font-semibold">Income: <strong>{item.annualIncome}</strong></p>
                        <p className="text-purple-700 font-bold">CGPA: {item.academicCgpa}</p>
                        <p className="text-slate-500 font-semibold">Docs: {(item.documents || []).length} submitted</p>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          Rs. {amountVal.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Single Line Status Badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Approved - {item.verifiedDate || "Sanctioned"}
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 shrink-0" /> Pending Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black whitespace-nowrap">
                            <XCircle className="w-3.5 h-3.5 shrink-0" /> Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px]">
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
                          {/* Inspect Full Submission & Document */}
                          <button
                            onClick={() => setInspectApp(item)}
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg cursor-pointer border border-purple-200 transition-all"
                            title="Inspect Student Details & Uploaded Documents"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleOpenApprove(item)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[10px] flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Approve
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
            Showing <strong className="text-gray-800">{filteredScholarships.length === 0 ? 0 : startIndex + 1}</strong> to{" "}
            <strong className="text-gray-800">{Math.min(filteredScholarships.length, startIndex + itemsPerPage)}</strong> of{" "}
            <strong className="text-gray-800">{filteredScholarships.length}</strong> records
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

      {/* -- Rich Student Details & Uploaded Documents Inspection Modal -- */}
      <AnimatePresence>
        {inspectApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Student Application & Uploaded Proofs</h3>
                    <p className="text-xs text-slate-500 font-medium">Ref ID: {inspectApp.id} - Applied: {inspectApp.appliedDate}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectApp(null)}
                  className="text-slate-400 hover:text-slate-600 font-black text-lg p-1 cursor-pointer"
                >
                  X
                </button>
              </div>

              {/* Student Identity Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black">Student Name:</span>
                  <p className="font-black text-slate-900 text-sm">{inspectApp.studentName}</p>
                  <p className="text-purple-700 font-mono font-bold">Scholar No: {inspectApp.scholarNo || inspectApp.rollNumber}</p>
                  <p className="text-slate-500 font-mono text-[10px]">Enrollment: {inspectApp.enrollmentNo || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black">Enrolled Course:</span>
                  <p className="font-bold text-slate-800">{inspectApp.course}</p>
                  <p className="text-slate-500">Session: {inspectApp.session || inspectApp.academicYear || "N/A"}</p>
                  <p className="text-slate-500">{[inspectApp.semester, inspectApp.section ? `Sec ${inspectApp.section}` : ""].filter(Boolean).join(" - ")}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black">Category / Income:</span>
                  <p className="font-bold text-slate-900">{inspectApp.category}</p>
                  <p className="text-emerald-700 font-bold">{inspectApp.annualIncome} / yr</p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black">Contact:</span>
                  <p className="font-bold text-slate-800">{inspectApp.phone || "N/A"}</p>
                  <p className="text-slate-500 truncate">{inspectApp.email || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black">Aadhaar / Profile Category:</span>
                  <p className="font-mono font-bold text-slate-800">{inspectApp.aadhar || "N/A"}</p>
                  <p className="text-slate-500">{inspectApp.profileCategory || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black">Parent / Guardian:</span>
                  <p className="font-bold text-slate-800">{inspectApp.fatherName || "N/A"}</p>
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-2 text-xs">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" /> Scheme & Benefit Particulars
                </h4>
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-1.5">
                  <p className="font-extrabold text-purple-950">{inspectApp.name}</p>
                  <p className="text-slate-600 text-[11px]">{inspectApp.benefitType}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-purple-200 text-[11px]">
                    <span>Requested Amount: <strong>Rs. {(inspectApp.requestedAmount || 0).toLocaleString("en-IN")}</strong></span>
                    <span>Sanctioned Amount: <strong>Rs. {(inspectApp.sanctionedAmount || 0).toLocaleString("en-IN")}</strong></span>
                    <span>Destination: <strong>{inspectApp.disbursementTo || inspectApp.paymentDestination || "College Account"}</strong></span>
                    <span>Fee Adjusted: <strong className="text-emerald-700">Rs. {(inspectApp.feeAdjustedAmount || 0).toLocaleString("en-IN")}</strong></span>
                    <span>Excess / Refundable: <strong className="text-blue-700">Rs. {(inspectApp.excessScholarshipAmount || 0).toLocaleString("en-IN")}</strong></span>
                    <span>Academic CGPA: <strong className="text-purple-700 font-mono">{inspectApp.academicCgpa}</strong></span>
                    <span>Application No: <strong className="font-mono">{inspectApp.schemeApplicationNo || "N/A"}</strong></span>
                    <span>Income Cert: <strong className="font-mono">{inspectApp.incomeCertificateNo || "N/A"}</strong></span>
                    <span>Income Cert Date: <strong>{inspectApp.incomeCertificateDate || "N/A"}</strong></span>
                    <span>Caste Cert: <strong className="font-mono">{inspectApp.casteCertificateNo || "N/A"}</strong></span>
                    <span>Domicile Cert: <strong className="font-mono">{inspectApp.domicileCertificateNo || "N/A"}</strong></span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-blue-700 uppercase font-black">Bank Name</span>
                  <p className="font-bold text-slate-900">{inspectApp.bankName || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 uppercase font-black">Account No</span>
                  <p className="font-mono font-bold text-slate-900">{inspectApp.accountNo || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 uppercase font-black">IFSC</span>
                  <p className="font-mono font-bold text-slate-900">{inspectApp.ifscCode || "N/A"}</p>
                </div>
              </div>

              {/* Uploaded Documents Preview Box */}
              <div className="space-y-2 text-xs">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" /> Uploaded Verification Certificates & Stamped Proofs
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {((inspectApp.documents || []).length > 0 ? inspectApp.documents : (inspectApp.studentDocuments || [])).length === 0 ? (
                    <div className="sm:col-span-2 p-4 bg-slate-50 rounded-xl border border-dashed border-gray-300 text-center text-slate-500 font-bold">
                      No supporting documents attached.
                    </div>
                  ) : (
                    ((inspectApp.documents || []).length > 0 ? inspectApp.documents : (inspectApp.studentDocuments || [])).map((doc, index) => (
                      <div key={doc.id || index} className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-[11px] truncate">{doc.docName || doc.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono truncate">{doc.savedFile || doc.file}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openDocumentInNewTab(doc)}
                          disabled={!doc.fileUrl}
                          className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 rounded-lg border border-purple-200 font-bold text-[10px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          View
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Direct Actions Toolbar */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setInspectApp(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Close
                </button>

                {String(inspectApp.status || "").includes("Pending") && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReject(inspectApp)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <XCircle className="w-4 h-4" /> Reject Application
                    </button>
                    <button
                      onClick={() => handleOpenApprove(inspectApp)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-200"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Sanction & Credit Fee
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-5 space-y-4 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">{previewDoc.docName || previewDoc.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{previewDoc.savedFile || previewDoc.file}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Close
                </button>
              </div>
              <div className="h-[70vh] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
                {isImageDoc(previewDoc) ? (
                  <img src={previewDoc.fileUrl} alt={previewDoc.docName || "Document"} className="max-w-full max-h-full object-contain" />
                ) : (
                  <iframe src={previewDoc.fileUrl} title={previewDoc.docName || "Document"} className="w-full h-full bg-white" />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -- Approve Modal -- */}
      <AnimatePresence>
        {modalAction === "approve" && selectedApp && (
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
                    <h3 className="text-base font-black text-slate-900">Approve & Sanction Scholarship</h3>
                    <p className="text-xs text-slate-500 font-medium">Ref: {selectedApp.id}</p>
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
                  <p className="font-black text-slate-900">{selectedApp.studentName}</p>
                  <p className="text-purple-700">{selectedApp.scholarNo || selectedApp.rollNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Scheme:</span>
                  <p className="font-black text-slate-900 truncate">{selectedApp.name}</p>
                  <p className="text-emerald-700">Course: {selectedApp.course}</p>
                </div>
              </div>

              <form onSubmit={handleConfirmAction} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Sanctioned Scholarship Credit Amount (Rs.):
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={sanctionedAmount === 0 ? "" : (sanctionedAmount ?? "")}
                    onChange={(e) => setSanctionedAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter sanctioned amount..."
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-mono font-bold text-slate-900 text-sm outline-none focus:border-emerald-500"
                  />
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
                    <CheckCircle2 className="w-4 h-4" /> Confirm Sanction & Credit Rs. {Number(sanctionedAmount).toLocaleString("en-IN")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -- Reject Modal -- */}
      <AnimatePresence>
        {modalAction === "reject" && selectedApp && (
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
                    <h3 className="text-base font-black text-slate-900">Reject Scholarship Application</h3>
                    <p className="text-xs text-slate-500 font-medium">Ref: {selectedApp.id}</p>
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



