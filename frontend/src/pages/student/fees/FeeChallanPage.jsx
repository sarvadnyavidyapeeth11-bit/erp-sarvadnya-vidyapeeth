import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  FileText,
  Landmark,
  MessageSquare,
  Send,
  Upload,
  XCircle,
  IndianRupee,
  ShieldCheck,
  Building,
  Info,
  Layers,
  AlertCircle
} from "lucide-react";
import FeeNavigationHeader from "./FeeNavigationHeader";
import {
  studentProfile,
  getFeeDetails,
  getBankChallans,
  submitStudentBankChallan
} from "../../../hooks/studentPortalData";

export default function FeeChallanPage() {
  const feeState = getFeeDetails();
  const hasFeeImposed = (Number(feeState.totalFees) || 0) > 0;
  const hasPendingDue = (Number(feeState.totalPending) || 0) > 0;
  const [selectedBank, setSelectedBank] = useState("State Bank of India");
  const [amount, setAmount] = useState(feeState.totalPending || 0);
  const [challanSubmitted, setChallanSubmitted] = useState(false);
  const [bankJournalNo, setBankJournalNo] = useState("");
  const [branchName, setBranchName] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [slipFileName, setSlipFileName] = useState("");
  const [myChallans, setMyChallans] = useState([]);
  const amountTouchedRef = useRef(false);

  const loadMyChallans = () => {
    const all = getBankChallans();
    const mine = all.filter((c) => (
      c.rollNumber === studentProfile.rollNumber || c.rollNumber === studentProfile.scholarNo
    ));
    setMyChallans(mine);
    if (!amountTouchedRef.current) setAmount(getFeeDetails().totalPending || 0);
  };

  useEffect(() => {
    loadMyChallans();
    window.addEventListener("bankChallansUpdated", loadMyChallans);
    window.addEventListener("feeDataUpdated", loadMyChallans);
    window.addEventListener("storage", loadMyChallans);
    return () => {
      window.removeEventListener("bankChallansUpdated", loadMyChallans);
      window.removeEventListener("feeDataUpdated", loadMyChallans);
      window.removeEventListener("storage", loadMyChallans);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const pendingAmount = getFeeDetails().totalPending;
    if (!hasFeeImposed) {
      window.alert("Fee Officer ne abhi is academic session/semester ke liye fee impose nahi ki hai.");
      return;
    }
    if (!hasPendingDue) {
      window.alert("Is academic session/semester ke liye koi pending due nahi hai.");
      return;
    }
    const submitted = submitStudentBankChallan({
      bankName: selectedBank,
      branch: branchName,
      journalNo: bankJournalNo,
      amount: Number(amount) || 0,
      paymentDate,
      particulars: "Offline Bank Challan Fee Deposit",
      mode: "Bank Cash Challan",
      slipFile: slipFileName || `Bank_Challan_Deposit_Slip_${studentProfile.scholarNo || studentProfile.rollNumber}.pdf`
    });

    if (!submitted) {
      window.alert(`Bank Name, Branch Name, Journal Number, Payment Date, Slip aur Rs 1 se Rs ${(pendingAmount || 0).toLocaleString("en-IN")} tak amount required hai.`);
      return;
    }

    setChallanSubmitted(true);
    setBankJournalNo("");
    setBranchName("");
    setSlipFileName("");
    amountTouchedRef.current = false;
    loadMyChallans();
    setTimeout(() => setChallanSubmitted(false), 5000);
  };

  const pendingCount = myChallans.filter(c => String(c.status || "").includes("Pending")).length;
  const approvedCount = myChallans.filter(c => String(c.status || "").includes("Approved")).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <FeeNavigationHeader
        title="Offline Bank Challan & Counter Deposit Slip"
        description="Submit stamped bank deposit slips and journal numbers after depositing fee in authorized university bank branches for verification and ledger credit."
        badge="Counter Cash & Challan"
      />

      {challanSubmitted && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Bank Challan successfully submitted. The Fee Officer will audit your bank journal number and slip.
          </span>
          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
            Pending Audit
          </span>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6 text-rose-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Current Fee Due</p>
            <p className="text-lg font-black text-rose-700 font-mono truncate mt-0.5">
              Rs.{(getFeeDetails().totalPending || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <Landmark className="w-6 h-6 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Deposit Mode</p>
            <p className="text-lg font-black text-slate-900 truncate mt-0.5">Bank Cash Challan</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Pending Audit</p>
            <p className="text-lg font-black text-amber-700 font-mono truncate mt-0.5">{pendingCount} Challans</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Verified Challans</p>
            <p className="text-lg font-black text-emerald-700 font-mono truncate mt-0.5">{approvedCount} Approved</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
              <Landmark className="w-5 h-5 text-purple-600" />
              Submit Bank Challan
            </h3>
            <span className="text-[11px] font-extrabold uppercase text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Offline Deposit
            </span>
          </div>

          {!hasFeeImposed && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              Fee Officer ne abhi is academic session/semester ke liye fee impose nahi ki hai. Fee impose hone ke baad challan amount submit hoga.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-800 mb-1.5">
                Amount Deposited (Rs.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                disabled={!hasFeeImposed || !hasPendingDue}
                value={amount}
                onChange={(e) => {
                  amountTouchedRef.current = true;
                  setAmount(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-mono font-black text-slate-900 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-[11px] font-extrabold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Current Pending Due: Rs.{(getFeeDetails().totalPending || 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <label className="block font-extrabold text-slate-800 mb-1.5">
                Bank Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. State Bank of India / Punjab National Bank"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold text-slate-900 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-800 mb-1.5">
                Bank Branch Name / City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Main Branch, Fraser Road, Patna"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold text-slate-900 text-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  Bank Journal No / Scroll No <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JRN-881923"
                  value={bankJournalNo}
                  onChange={(e) => setBankJournalNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-mono font-bold text-slate-900 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  Payment / Deposit Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold text-slate-900 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-800 mb-1.5">
                Upload Stamped Challan Slip <span className="text-rose-500">*</span>
              </label>
              <label className="flex items-center justify-between gap-3 w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 border border-dashed border-slate-300 rounded-xl cursor-pointer transition-all">
                <span className="text-slate-700 font-bold truncate">
                  {slipFileName || "Upload Stamped Challan (PDF / JPG / PNG)"}
                </span>
                <Upload className="w-4 h-4 text-purple-600 shrink-0" />
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  className="hidden"
                  onChange={(e) => setSlipFileName(e.target.files?.[0]?.name || "")}
                />
              </label>
              {slipFileName && (
                <p className="mt-1 text-[11px] font-extrabold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Attached: {slipFileName}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!hasFeeImposed || !hasPendingDue}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" /> Submit Challan for Verification
            </button>
          </form>
        </div>

        {/* Right Table Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-purple-600" />
                My Submitted Bank Challans
              </h3>
              <span className="text-[11px] font-mono font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {myChallans.length} Records
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Challan ID / Date</th>
                    <th className="p-3">Bank & Branch</th>
                    <th className="p-3">Journal No.</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myChallans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500 font-semibold">
                        No offline bank challans submitted yet.
                      </td>
                    </tr>
                  ) : (
                    myChallans.map((c) => {
                      const isApproved = String(c.status || "").includes("Approved");
                      const isPending = String(c.status || "").includes("Pending");

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-mono font-black text-purple-700">
                            {c.id}
                            <p className="text-[10px] text-slate-500 font-sans font-semibold mt-0.5">{c.submittedDate}</p>
                          </td>
                          <td className="p-3 text-slate-900 font-bold">
                            {c.bankName}
                            <p className="text-[10px] text-slate-500 font-normal">{c.branch}</p>
                          </td>
                          <td className="p-3 font-mono font-black text-slate-900">{c.journalNo}</td>
                          <td className="p-3 text-right font-mono font-black text-slate-900">
                            Rs.{(c.amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black">
                                <Clock className="w-3.5 h-3.5" /> Pending Audit
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-black">
                                <XCircle className="w-3.5 h-3.5" /> Rejected
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 text-[11px]">
                            {c.decisionRemarks ? (
                              <span className="flex items-center gap-1 text-purple-900 font-semibold">
                                <MessageSquare className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                {c.decisionRemarks}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Under review</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xs space-y-3 text-xs">
            <h4 className="font-black flex items-center gap-2 text-emerald-400 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-400" /> Offline Bank Deposit Instructions
            </h4>
            <ul className="space-y-2 text-slate-300 text-xs leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>Keep the official bank teller seal and signature legible in your uploaded challan slip.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>Bank Journal Number is verified against daily bank scrolls within 24-48 working hours.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>Once verified, the fee receipt and updated ledger entry will be available in your Student Ledger.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
