import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
  CreditCard,
  AlertCircle,
  Layers,
  XCircle,
  MessageSquare,
  IndianRupee,
  ShieldCheck,
  Building,
  Info,
  Sparkles
} from "lucide-react";
import FeeNavigationHeader from "./FeeNavigationHeader";
import {
  getActiveStudentProfile,
  getFeeDetails,
  getScholarshipExcessForStudent,
  getRefundRequests,
  submitStudentRefund
} from "../../../hooks/studentPortalData";

export default function FeeRefundsPage() {
  const studentProfile = getActiveStudentProfile();
  const [refundSubmitted, setRefundSubmitted] = useState(false);
  const [refundType, setRefundType] = useState("Duplicate Payment Gateway Deduction");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [txnRefNo, setTxnRefNo] = useState("");
  const [filterTab, setFilterTab] = useState("All");
  const [availableRefund, setAvailableRefund] = useState(0);
  const [refundTickets, setRefundTickets] = useState([]);

  const loadRefunds = () => {
    const all = getRefundRequests();
    const mine = all.filter((r) => (
      r.rollNumber === studentProfile.rollNumber || r.rollNumber === studentProfile.scholarNo
    ));
    setRefundTickets(mine);
    const feeState = getFeeDetails();
    const ledgerExcess = Math.max(0, (feeState.totalPaid || 0) - (feeState.totalFees || 0));
    const scholarshipExcess = getScholarshipExcessForStudent(studentProfile.rollNumber || studentProfile.scholarNo, studentProfile.session || studentProfile.academicSession || "");
    setAvailableRefund(Math.max(ledgerExcess, scholarshipExcess));
  };

  useEffect(() => {
    loadRefunds();
    window.addEventListener("refundDataUpdated", loadRefunds);
    window.addEventListener("feeDataUpdated", loadRefunds);
    window.addEventListener("drccDataUpdated", loadRefunds);
    window.addEventListener("storage", loadRefunds);
    return () => {
      window.removeEventListener("refundDataUpdated", loadRefunds);
      window.removeEventListener("feeDataUpdated", loadRefunds);
      window.removeEventListener("drccDataUpdated", loadRefunds);
      window.removeEventListener("storage", loadRefunds);
    };
  }, []);

  const handleSubmitRefund = (e) => {
    e.preventDefault();
    if (!reason || !amount || !txnRefNo.trim()) {
      window.alert("Please enter Refund Amount, Original Payment Reference / UTR, and Reason.");
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      window.alert("Please enter a valid refund amount greater than 0.");
      return;
    }

    const profileBankName = studentProfile.bankName || "";
    const profileAccountHolderName = studentProfile.accountHolderName || studentProfile.name || "";
    const profileAccountNo = studentProfile.accountNo || "";
    const profileIfsc = studentProfile.ifscCode || studentProfile.ifsc || "";
    if (!profileBankName || !profileAccountHolderName || !profileAccountNo || !profileIfsc) {
      window.alert("Refund payout ke liye My Profile me Bank Name, Account Holder Name, Account Number aur IFSC save karein.");
      return;
    }

    const submitted = submitStudentRefund({
      category: refundType,
      amount: numAmount,
      reason: `${reason} (Txn Ref: ${txnRefNo.trim()})`,
      studentName: studentProfile.name,
      rollNumber: studentProfile.rollNumber || studentProfile.scholarNo,
      course: studentProfile.course,
      session: studentProfile.session || studentProfile.academicSession || "",
      bankName: profileBankName,
      accountHolderName: profileAccountHolderName,
      accountNo: profileAccountNo,
      ifsc: profileIfsc
    });

    if (!submitted) {
      window.alert(`Unable to submit refund claim. Available refundable amount is Rs.${availableRefund.toLocaleString("en-IN")}.`);
      return;
    }

    setRefundSubmitted(true);
    setReason("");
    setAmount("");
    setTxnRefNo("");
    loadRefunds();
  };

  const filteredTickets = refundTickets.filter((ticket) => {
    if (filterTab === "Pending") return ticket.status.includes("Pending") || ticket.status.includes("Review");
    if (filterTab === "Approved") return ticket.status.includes("Approved");
    return true;
  });

  const pendingClaimsCount = refundTickets.filter(r => r.status.includes("Pending") || r.status.includes("Review")).length;
  const approvedClaimsCount = refundTickets.filter(r => r.status.includes("Approved")).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <FeeNavigationHeader
        title="Fee Refunds & Direct Bank Payout Claims"
        description="Apply for duplicate fee payment refunds, excess deposit adjustments, caution security deposit returns, and track NEFT disbursals in real time."
        badge="Accounts Clearance"
      />

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Refundable Balance</p>
            <p className="text-lg font-black text-emerald-700 font-mono truncate mt-0.5">
              Rs.{availableRefund.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Claims Filed</p>
            <p className="text-lg font-black text-slate-900 font-mono truncate mt-0.5">{refundTickets.length} Claims</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">In Audit Review</p>
            <p className="text-lg font-black text-amber-700 font-mono truncate mt-0.5">{pendingClaimsCount} Pending</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Disbursed / Settled</p>
            <p className="text-lg font-black text-blue-700 font-mono truncate mt-0.5">{approvedClaimsCount} Settled</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
              <RotateCcw className="w-5 h-5 text-emerald-600" />
              Apply for Fee Refund Claim
            </h3>
            <span className="text-[11px] font-extrabold uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Direct Bank Disbursal
            </span>
          </div>

          {refundSubmitted ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 sm:p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-center space-y-3.5"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-emerald-950">Refund Claim Successfully Submitted!</h4>
              <p className="text-xs text-emerald-800 font-semibold max-w-md mx-auto leading-relaxed">
                Your refund ticket has been transmitted in real-time to the Accounts Officer Desk. The amount will be disbursed directly via NEFT to your verified bank account upon verification.
              </p>
              <button
                onClick={() => setRefundSubmitted(false)}
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer shadow-xs transition-all"
              >
                File Another Refund Claim
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmitRefund} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-extrabold text-slate-800 mb-1.5">
                    Refund Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={refundType}
                    onChange={(e) => setRefundType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold text-slate-900 text-sm transition-all"
                  >
                    <option value="Duplicate Payment Gateway Deduction">Duplicate Payment Gateway Deduction</option>
                    <option value="Excess Fee Deposit">Excess Fee Deposit</option>
                    <option value="Scholarship / DRCC Excess Refund">Scholarship / DRCC Excess Refund</option>
                    <option value="Caution Security Money Return">Caution Security Money Return</option>
                    <option value="Exam Fee Excess Adjustment">Exam Fee Excess Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-800 mb-1.5">
                    Claim Refund Amount (Rs.) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={availableRefund || undefined}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold font-mono text-slate-900 text-sm transition-all"
                  />
                  <p className="mt-1 text-[11px] font-extrabold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Available Refundable Balance: Rs.{availableRefund.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  Original Payment Reference / UTR / Gateway Order ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPI-REF-992109283 / pay_Nz981203 / SBI-NEFT-88192"
                  value={txnRefNo}
                  onChange={(e) => setTxnRefNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold font-mono text-slate-900 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  Detailed Reason for Refund Appeal <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Please state details regarding duplicate deduction, excess fee deposit, or scholarship adjustment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl text-slate-900 font-semibold text-sm transition-all"
                />
              </div>

              {/* Verified Bank Account Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-purple-600" /> Verified Payout Account (From My Profile)
                  </p>
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Auto-Verified
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Bank Name</label>
                    <p className="font-bold text-slate-900 truncate mt-0.5">
                      {studentProfile.bankName || "Update in My Profile"}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Holder Name</label>
                    <p className="font-bold text-slate-900 truncate mt-0.5">
                      {studentProfile.accountHolderName || studentProfile.name || "Not saved"}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Account No</label>
                    <p className="font-mono font-extrabold text-slate-900 truncate mt-0.5">
                      {studentProfile.accountNo || "Not saved"}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase">IFSC Code</label>
                    <p className="font-mono font-extrabold text-slate-900 truncate mt-0.5">
                      {studentProfile.ifscCode || studentProfile.ifsc || "Not saved"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Send className="w-4 h-4" /> Submit Refund Claim Application
              </button>
            </form>
          )}
        </div>

        {/* Right Status Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-purple-600" />
                Your Refund Claim Tickets
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-black font-mono">
                {refundTickets.length} Total
              </span>
            </div>

            {/* Filter Dropdown */}
            <label className="block">
              <span className="sr-only">Filter refund claim tickets</span>
              <select
                value={filterTab}
                onChange={(event) => setFilterTab(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-800 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="All">All ({refundTickets.length})</option>
                <option value="Pending">Pending ({pendingClaimsCount})</option>
                <option value="Approved">Approved ({approvedClaimsCount})</option>
              </select>
            </label>

            {/* Scrollable Container */}
            <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3">
              {filteredTickets.length === 0 ? (
                <div className="py-10 text-center text-slate-500 font-semibold text-xs space-y-1">
                  <p>No refund tickets in this filter.</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const isApproved = ticket.status.includes("Approved");
                  const isPending = ticket.status.includes("Pending") || ticket.status.includes("Review");

                  return (
                    <div
                      key={ticket.ticketId}
                      className="p-4 rounded-2xl border bg-white border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all text-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-purple-700 text-sm">{ticket.ticketId}</span>
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed - {ticket.verifiedDate || "Settled"}
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5" /> In Audit Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-50 text-rose-800 border border-rose-200 whitespace-nowrap">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                      </div>

                      <p className="font-black text-slate-900 leading-snug">{ticket.reason}</p>

                      {ticket.utrNumber && (
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-950 font-mono font-extrabold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          Bank UTR: {ticket.utrNumber}
                        </div>
                      )}

                      {ticket.officerRemarks && (
                        <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-[11px] text-purple-950 font-semibold flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span>{ticket.officerRemarks}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-mono font-semibold">
                        <span>Refund Amount: <strong className="text-slate-900 font-black">Rs.{ticket.amount.toLocaleString("en-IN")}</strong></span>
                        <span>Date: {ticket.date}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Refund Policy Guidelines */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xs space-y-3 text-xs">
            <h4 className="font-black flex items-center gap-2 text-emerald-400 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-400" /> University Refund Policy Guidelines
            </h4>
            <ul className="space-y-2 text-slate-300 text-xs leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>Duplicate payment transactions are refunded 100% without deductions within 3-5 working days.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>Refund credits are transferred directly via NEFT/RTGS to the student's verified bank account.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>Ensure the Account Holder Name matches institutional records to prevent audit delay.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
