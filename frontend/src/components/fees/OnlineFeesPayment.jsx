import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  Lock,
  Download,
  Printer,
  ShieldCheck,
  QrCode,
  Smartphone,
  Landmark,
  User,
  GraduationCap,
  Calendar,
  BadgeCheck,
  CheckSquare,
  Square,
  Sparkles,
  Percent,
  Layers,
  ArrowRight,
  Filter,
  Calculator
} from "lucide-react";
import {
  studentProfile,
  feeDetails,
  getFeeDetails,
  syncFeeDetails,
  addStudentLedgerEntry,
  generateReceiptNumber
} from "../../hooks/studentPortalData";
import OfficialFeeReceiptModal from "./OfficialFeeReceiptModal";

const DEFAULT_FEE_PRIORITY = 9999;
const normalizeFeePriority = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : DEFAULT_FEE_PRIORITY;
};

const parseFeeOrderDate = (value) => {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? Number.MAX_SAFE_INTEGER : parsed.getTime();
};

const orderFeeHeadsForAdjustment = (heads = []) => (
  heads
    .map((head, index) => ({ ...head, _originalIndex: index }))
    .sort((a, b) => {
      const priorityDiff = normalizeFeePriority(a.priorityOrder ?? a.feePriority ?? a.priority) -
        normalizeFeePriority(b.priorityOrder ?? b.feePriority ?? b.priority);
      if (priorityDiff !== 0) return priorityDiff;
      const dateDiff = parseFeeOrderDate(a.dueDate || a.date) - parseFeeOrderDate(b.dueDate || b.date);
      if (dateDiff !== 0) return dateDiff;
      return a._originalIndex - b._originalIndex;
    })
);

export default function OnlineFeesPayment({ onBack }) {
  const currentDetails = getFeeDetails();
  const hasFeeImposed = (Number(currentDetails.totalFees) || 0) > 0;
  
  const [selectedHead, setSelectedHead] = useState("All Fee");
  const [remarks, setRemarks] = useState("Online fee payment");
  const [showGateway, setShowGateway] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [paymentReference] = useState(() => {
    const roll = studentProfile.rollNumber || studentProfile.scholarNo || "STUDENT";
    return `PAY-${roll}-${Date.now()}`;
  });

  const buildFeeHeads = () => {
    const details = getFeeDetails();
    let remainingCredit = Number(details.totalPaid) || 0;

    return orderFeeHeadsForAdjustment(details.feeBreakup || []).map((head) => {
      const originalAmount = Number(head.amount) || 0;
      const appliedCredit = Math.min(remainingCredit, originalAmount);
      remainingCredit -= appliedCredit;
      const dueAmount = Math.max(0, originalAmount - appliedCredit);
      const isPaid = dueAmount === 0;

      return {
        id: head.id || `${head.head}-${head.date || ""}`,
        headName: head.head || "Fee Head",
        category: head.category || "Academic",
        priorityOrder: normalizeFeePriority(head.priorityOrder ?? head.feePriority ?? head.priority),
        dueAmount,
        originalAmount,
        recAmount: dueAmount,
        selected: dueAmount > 0,
        isPaid,
        isOverdue: dueAmount > 0 && Boolean(head.isOverdue),
        status: isPaid ? "Paid" : (head.isOverdue ? "Overdue" : "Due")
      };
    });
  };

  const [feeHeads, setFeeHeads] = useState(buildFeeHeads);
  const [customTotalInput, setCustomTotalInput] = useState(() => {
    const initialDue = buildFeeHeads().filter(h => !h.isPaid).reduce((sum, h) => sum + h.dueAmount, 0);
    return initialDue > 0 ? String(initialDue) : "";
  });

  // Listen to global feeDataUpdated & storage
  useEffect(() => {
    const handleSync = () => {
      getFeeDetails();
      const refreshed = buildFeeHeads();
      setFeeHeads(refreshed);
      const remainingDue = refreshed.filter(h => !h.isPaid).reduce((sum, h) => sum + h.dueAmount, 0);
      setCustomTotalInput(remainingDue > 0 ? String(remainingDue) : "");
    };

    window.addEventListener("feeDataUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("refundDataUpdated", handleSync);
    window.addEventListener("concessionDataUpdated", handleSync);
    window.addEventListener("scholarshipDataUpdated", handleSync);
    return () => {
      window.removeEventListener("feeDataUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("refundDataUpdated", handleSync);
      window.removeEventListener("concessionDataUpdated", handleSync);
      window.removeEventListener("scholarshipDataUpdated", handleSync);
    };
  }, []);

  // Single head toggle
  const handleHeadToggle = (id) => {
    setFeeHeads((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id && !item.isPaid) {
          const nextSelected = !item.selected;
          return {
            ...item,
            selected: nextSelected,
            recAmount: nextSelected ? (item.recAmount > 0 ? item.recAmount : item.dueAmount) : 0
          };
        }
        return item;
      });
      const newSum = updated.filter(h => h.selected && !h.isPaid).reduce((sum, h) => sum + (h.recAmount || 0), 0);
      setCustomTotalInput(String(newSum));
      return updated;
    });
  };

  // Quick Select / Clear All
  const handleSelectAll = (selectVal) => {
    setFeeHeads((prev) => {
      const updated = prev.map((item) => (!item.isPaid ? { ...item, selected: selectVal, recAmount: selectVal ? item.dueAmount : 0 } : item));
      const newSum = updated.filter(h => h.selected && !h.isPaid).reduce((sum, h) => sum + (h.recAmount || 0), 0);
      setCustomTotalInput(String(newSum));
      return updated;
    });
  };

  // Distribute manual total amount across heads
  const distributeAmountAcrossHeads = (targetAmount) => {
    const rawAmount = String(targetAmount ?? "").replace(/[^0-9]/g, "");
    if (rawAmount === "") {
      setCustomTotalInput("");
      setFeeHeads(prev => prev.map(h => (!h.isPaid ? { ...h, selected: false, recAmount: 0 } : h)));
      return;
    }

    setFeeHeads((prev) => {
      const pendingTotal = prev.filter((head) => !head.isPaid).reduce((sum, head) => sum + head.dueAmount, 0);
      const cappedAmount = Math.min(Math.max(0, Number(rawAmount) || 0), pendingTotal);
      let remaining = cappedAmount;
      setCustomTotalInput(cappedAmount > 0 ? String(cappedAmount) : "");

      return prev.map((head) => {
        if (head.isPaid || head.dueAmount <= 0) return head;
        const allocated = Math.min(remaining, head.dueAmount);
        remaining -= allocated;
        return {
          ...head,
          selected: allocated > 0,
          recAmount: allocated
        };
      });
    });
  };

  // Filtered Heads based on Fee Head dropdown
  const filteredHeads = feeHeads.filter((item) => {
    return selectedHead === "All Fee" || item.headName === selectedHead;
  });

  const manualPayAmount = Math.max(0, Number(String(customTotalInput || "").replace(/[^0-9]/g, "")) || 0);
  const allocationByHeadId = useMemo(() => {
    let remaining = Math.min(
      manualPayAmount,
      feeHeads.filter((head) => !head.isPaid).reduce((sum, head) => sum + head.dueAmount, 0)
    );

    return feeHeads.reduce((allocation, head) => {
      if (head.isPaid || head.dueAmount <= 0) {
        allocation[head.id] = 0;
        return allocation;
      }
      const allocated = Math.min(remaining, head.dueAmount);
      remaining -= allocated;
      allocation[head.id] = allocated;
      return allocation;
    }, {});
  }, [feeHeads, manualPayAmount]);

  // Calculate dynamic total due amount
  const totalDue = filteredHeads.reduce((acc, curr) => acc + curr.dueAmount, 0);

  // Calculate dynamic total payable amount selected across all due heads
  const totalRec = Object.values(allocationByHeadId).reduce((acc, amount) => acc + amount, 0);
  const selectedCount = feeHeads.filter((h) => (allocationByHeadId[h.id] || 0) > 0).length;

  const handlePaySubmit = () => {
    if (totalRec <= 0) return;
    setShowGateway(true);
  };

  // Payment confirmation & ledger synchronization
  const handleProcessPayment = (e) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);

      const paidAmount = Math.min(totalRec, Number(feeDetails.totalPending) || 0);

      // 1. Calculate updated fee totals
      const totalFees = Number(feeDetails.totalFees) || 0;
      const newPaid = Math.min(totalFees, (feeDetails.totalPaid || 0) + paidAmount);
      const newPending = Math.max(0, totalFees - newPaid);

      // 2. Mark selected feeHeads as Paid & unselect
      setFeeHeads((prev) =>
        prev.map((h) => {
          const paidForHead = allocationByHeadId[h.id] || 0;
          if (paidForHead > 0 && !h.isPaid) {
            const remDue = Math.max(0, h.dueAmount - paidForHead);
            return {
              ...h,
              dueAmount: remDue,
              recAmount: remDue,
              isPaid: remDue === 0,
              selected: false
            };
          }
          return h;
        })
      );

      // 3. Create new official receipt record
      const todayDateStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const todaySlashStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const receiptId = generateReceiptNumber();
      const voucherNo = paymentReference;
      const paidFeeHeads = feeHeads
        .map((head) => ({
          name: head.headName || "Fee Head",
          amount: allocationByHeadId[head.id] || 0,
          priorityOrder: head.priorityOrder
        }))
        .filter((head) => head.amount > 0);
      const receiptParticulars = paidFeeHeads.length > 0
        ? paidFeeHeads.map((head) => `${head.name} (Rs. ${head.amount.toLocaleString("en-IN")})`).join(", ")
        : remarks || `Academic Online Fee Payment (Ref: ${receiptId})`;

      const newReceipt = {
        receiptNo: receiptId,
        receiptDate: todayDateStr,
        date: todayDateStr,
        totalRecAmount: paidAmount,
        amount: paidAmount,
        particulars: receiptParticulars,
        feeHeads: paidFeeHeads,
        paidFeeHeads,
        mode: paymentMethod.toUpperCase() + " Online",
        isCancelled: "No",
        session: feeDetails.academicYear || studentProfile.session || studentProfile.academicSession || "",
      };

      const updatedReceipts = [newReceipt, ...(feeDetails.receipts || [])];
      setLatestReceipt(newReceipt);

      // 4. Append transaction into Student Ledger in localStorage
      addStudentLedgerEntry({
        id: receiptId,
        receiptNo: receiptId,
        rollNumber: studentProfile.rollNumber || studentProfile.scholarNo,
        studentName: studentProfile.name,
        course: studentProfile.course,
        semester: studentProfile.semester || "All",
        session: feeDetails.academicYear || studentProfile.session || studentProfile.academicSession || "",
        date: todayDateStr,
        dateSlash: todaySlashStr,
        dr: 0,
        cr: paidAmount,
        transactionMode: paymentMethod.toUpperCase() + " Online",
        status: "Cleared",
        remarks: `Academic Fee / ${studentProfile.name || "Student"} / Online Payment (Ref: ${voucherNo})`
      });

      // 5. Save & Sync globally
      syncFeeDetails({
        totalPaid: newPaid,
        totalPending: newPending,
        receipts: updatedReceipts
      });
    }, 1200);
  };

  return (
    <div className="space-y-5">
      {/* -- Top Financial Status Cards -- */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <p className="text-slate-500 font-bold uppercase text-[10px]">Total Session Fee Plan</p>
          <p className="text-xl font-black text-slate-900 font-mono">Rs. {(feeDetails.totalFees || 0).toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-slate-400 font-medium">{[studentProfile.course, feeDetails.academicYear || studentProfile.session || studentProfile.academicSession].filter(Boolean).join(" ") || "All Academic Dues"}</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
          <p className="text-emerald-700 font-bold uppercase text-[10px]">Total Paid & Credited</p>
          <p className="text-xl font-black text-emerald-800 font-mono">Rs. {(feeDetails.totalPaid || 0).toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-emerald-600 font-medium">Receipts Reconciled</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs space-y-1">
          <p className="text-rose-700 font-bold uppercase text-[10px]">Outstanding Balance Dues</p>
          <p className="text-xl font-black text-rose-800 font-mono">Rs. {(feeDetails.totalPending || 0).toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-rose-600 font-medium">
            {!hasFeeImposed ? "Fee Not Imposed" : feeDetails.totalPending === 0 ? "All Dues Cleared" : "Balance Due Pending"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-xs space-y-1">
          <p className="text-purple-700 font-bold uppercase text-[10px]">Payable Amount Selected</p>
          <p className="text-xl font-black text-purple-900 font-mono">Rs. {totalRec.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-purple-600 font-medium">
            {selectedCount} Heads Selected
          </p>
        </div>
      </div>

      {/* -- Top Payment Reference & Fee Head Filter Bar -- */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
              Payment Date
            </label>
            <input
              type="text"
              readOnly
              value={new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
              Payment Reference No.
            </label>
            <input
              type="text"
              readOnly
              value={paymentReference}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
              Filter by Fee Head:
            </label>
            <select
              value={selectedHead}
              onChange={(e) => setSelectedHead(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="All Fee">All Fee Particulars</option>
              {feeHeads.map((head) => (
                <option key={head.id} value={head.headName}>
                  {head.headName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* -- Fee Breakup Table -- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-purple-100/70 border-b border-purple-200 text-purple-900 font-extrabold">
                <th className="py-3 px-3 w-12 text-center">Select</th>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4">Fee Head Particular</th>
                <th className="py-3 px-4 text-right">Due Amount (Rs.)</th>
                <th className="py-3 px-4 text-right">Pay Amount (Rs.)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(!hasFeeImposed || (feeDetails.totalPending || 0) === 0) ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-black text-slate-800">
                        {!hasFeeImposed ? "Fee Not Imposed" : (feeDetails.totalPaid || 0) > 0 ? "All Session Fee Dues Cleared" : "No Pending Fee Dues"}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {!hasFeeImposed
                          ? "No active fee heads are currently imposed for this student. Once the Fee Officer posts fees, payable heads will appear here."
                          : (feeDetails.totalPaid || 0) > 0
                          ? "Your tuition, development, and examination fee ledger balance is fully paid up to date with zero remaining balance."
                          : "No active fee heads are currently pending for online payment."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHeads.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      item.isPaid ? "bg-slate-50/80 opacity-75" : "hover:bg-purple-50/30"
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={(allocationByHeadId[item.id] || 0) > 0 && !item.isPaid}
                        disabled={item.isPaid}
                        onChange={() => handleHeadToggle(item.id)}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-500">{index + 1}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{item.headName}</span>
                        {item.isPaid && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                            Cleared
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                      Rs. {item.dueAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-black text-purple-700">
                        Rs. {(allocationByHeadId[item.id] || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                        item.isPaid
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.isOverdue
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {item.isPaid ? "PAID & CLEARED" : item.isOverdue ? "DUE DATE EXCEEDED" : "PENDING DUE"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/90 font-black text-slate-900 border-t border-gray-200">
                <td colSpan={3} className="py-3 px-4 text-right uppercase tracking-wider text-xs font-black text-slate-700">
                  Total Selected Amount to Pay Now:
                </td>
                <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                  Rs. {totalDue.toLocaleString("en-IN")}
                </td>
                <td className="py-3 px-4 text-right font-black text-purple-700 text-sm font-mono">
                  Rs. {totalRec.toLocaleString("en-IN")}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* -- Remarks & Action Bar -- */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs grid grid-cols-1 lg:grid-cols-[minmax(260px,1fr)_auto] gap-4 lg:items-end">
        <div className="w-full">
          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
            Manual Payment Amount
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-[170px] flex flex-nowrap items-center gap-2 rounded-xl border-2 border-purple-300 bg-white px-3 py-2 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500/15">
              <span className="shrink-0 whitespace-nowrap text-xs font-black text-slate-500">Rs</span>
              <input
                type="text"
                inputMode="numeric"
                value={customTotalInput}
                onChange={(e) => distributeAmountAcrossHeads(e.target.value)}
                disabled={!hasFeeImposed || (feeDetails.totalPending || 0) <= 0}
                placeholder={`Max ${(feeDetails.totalPending || 0).toLocaleString("en-IN")}`}
                className="min-w-0 flex-1 bg-transparent text-xs font-black text-slate-900 outline-none font-mono disabled:opacity-50"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                disabled={!hasFeeImposed || (feeDetails.totalPending || 0) <= 0}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-black hover:bg-purple-100 disabled:opacity-50 cursor-pointer"
              >
                Full
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                disabled={totalRec <= 0}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black hover:bg-slate-200 disabled:opacity-50 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto xl:justify-end">
          <button
            onClick={handlePaySubmit}
            disabled={totalRec <= 0}
            className="justify-center px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-200 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4" />
            {totalRec > 0 ? `Proceed to Pay Online (Rs. ${totalRec.toLocaleString("en-IN")})` : "Enter / Select Amount to Pay"}
          </button>
        </div>
      </div>

      {/* -- Online Payment Modal Gateway -- */}
      <AnimatePresence>
        {showGateway && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100"
            >
              {!paymentSuccess ? (
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">256-Bit SSL Payment Gateway</h3>
                        <p className="text-[10px] text-slate-500 font-semibold">University Secure Fee Payment Desk</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowGateway(false)}
                      className="text-slate-400 hover:text-slate-600 font-bold text-sm px-2 py-1"
                    >
                      X
                    </button>
                  </div>

                  <div className="bg-purple-50/70 border border-purple-100 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-black text-purple-700">Amount Payable</p>
                      <p className="text-2xl font-black text-slate-900 font-mono">Rs. {totalRec.toLocaleString("en-IN")}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                      Fee Payment
                    </span>
                  </div>

                  {/* Payment Mode Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                      Select Mode of Payment
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("upi")}
                        className={`p-3 rounded-2xl border text-center font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          paymentMethod === "upi"
                            ? "border-purple-600 bg-purple-50/80 text-purple-900 shadow-xs"
                            : "border-gray-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-purple-600" />
                        UPI / QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-3 rounded-2xl border text-center font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          paymentMethod === "card"
                            ? "border-purple-600 bg-purple-50/80 text-purple-900 shadow-xs"
                            : "border-gray-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("netbanking")}
                        className={`p-3 rounded-2xl border text-center font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          paymentMethod === "netbanking"
                            ? "border-purple-600 bg-purple-50/80 text-purple-900 shadow-xs"
                            : "border-gray-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Landmark className="w-5 h-5 text-purple-600" />
                        Net Banking
                      </button>
                    </div>
                  </div>

                  {paymentMethod === "upi" && (
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 text-center space-y-3">
                      <QrCode className="w-28 h-28 mx-auto text-purple-900 bg-white p-2 rounded-xl border border-purple-200 shadow-xs" />
                      <p className="text-xs font-bold text-purple-900">Scan QR Code using any UPI App (GPay, PhonePe, Paytm)</p>
                      <p className="text-[10px] text-slate-500 font-mono">UPI ID: sarvadnya.erp@sbi</p>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="4532 0150 0000 0000"
                          maxLength={19}
                          className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="12/28"
                            maxLength={5}
                            className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">CVV</label>
                          <input
                            type="password"
                            placeholder="123"
                            maxLength={3}
                            className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono text-center"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "netbanking" && (
                    <div className="space-y-2 text-xs">
                      <label className="block text-slate-700 font-bold mb-1">Select Bank</label>
                      <select className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold">
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Punjab National Bank (PNB)</option>
                        <option>Bank of Baroda</option>
                      </select>
                    </div>
                  )}

                  <button
                    onClick={handleProcessPayment}
                    disabled={processing}
                    className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing 256-Bit Bank Gateway Payment...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Pay Rs. {totalRec.toLocaleString("en-IN")} Securely
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Payment Successful!</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Your fee payment of <strong>Rs. {totalRec.toLocaleString("en-IN")}</strong> has been processed successfully. Your student passbook and fee ledger have been updated in real time.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 font-mono text-xs text-slate-700">
                    Transaction ID: <span className="font-bold">{paymentReference}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowReceiptModal(true)}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-4 h-4" />
                      View Official Receipt
                    </button>
                    <button
                      onClick={() => {
                        setShowGateway(false);
                        setPaymentSuccess(false);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Receipt Modal */}
      {showReceiptModal && latestReceipt && (
        <OfficialFeeReceiptModal
          receipt={latestReceipt}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
}
