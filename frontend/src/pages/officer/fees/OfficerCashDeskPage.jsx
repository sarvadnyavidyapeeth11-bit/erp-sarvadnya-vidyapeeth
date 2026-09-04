import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  CheckCircle2,
  IndianRupee,
  Printer,
  CheckSquare,
  Square,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Receipt,
  Search,
  CreditCard,
  QrCode,
  Smartphone,
  Building,
  User,
  HelpCircle,
  FileCheck,
  GraduationCap,
  School,
  Calendar,
  Filter,
  Check,
  ArrowRight,
  Clock,
  Layers,
  AlertCircle,
  TrendingDown,
  CheckCircle,
  CreditCardIcon,
  ChevronDown,
  Percent,
  Calculator
} from "lucide-react";
import { getFeeDetailsForStudent } from "../../../hooks/studentPortalData";
import { addPayment, getPayments, getStudents, initERP } from "../../../hooks/erpData";
import { addStudentLedgerEntry,
  generateReceiptNumber } from "../../../hooks/studentPortalData";
import OfficialFeeReceiptModal from "../../../components/fees/OfficialFeeReceiptModal";
import DailyReconciliationModal from "../../../components/fees/DailyReconciliationModal";

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

export default function OfficerCashDeskPage() {
  const [studentsList, setStudentsList] = useState([]);
  
  // Multi-Filter Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Selected Student State
  const [selectedStudentRoll, setSelectedStudentRoll] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentFather, setStudentFather] = useState("");
  const [studentEnrollmentNo, setStudentEnrollmentNo] = useState("");
  const [studentCourse, setStudentCourse] = useState("");
  const [studentSem, setStudentSem] = useState("");
  const [studentSection, setStudentSection] = useState("");
  const [studentDepartment, setStudentDepartment] = useState("");
  const [studentSession, setStudentSession] = useState("");
  const [studentBatch, setStudentBatch] = useState("");
  const [studentTotalFee, setStudentTotalFee] = useState(0);
  const [studentPaidFee, setStudentPaidFee] = useState(0);

  // Collection Modes
  const [collectionMode, setCollectionMode] = useState("Physical Cash Deposit at Counter");

  // POS Card Swipe Details
  const [posMachineId, setPosMachineId] = useState("");
  const [cardRrnCode, setCardRrnCode] = useState("");
  const [cardLast4, setCardLast4] = useState("");

  // Dynamic UPI QR Code Details
  const [upiUtrNo, setUpiUtrNo] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Payable Fee Heads Structure
  const [feeHeads, setFeeHeads] = useState([]);
  const [customTotalInput, setCustomTotalInput] = useState("");

  // Late Fine Penalty & Concession Controls
  const [addLateFine, setAddLateFine] = useState(false);
  const [lateFineAmount, setLateFineAmount] = useState("");
  const [applyConcession, setApplyConcession] = useState(false);
  const [concessionAmount, setConcessionAmount] = useState("");

  const [collectionSuccess, setCollectionSuccess] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);

  // Build payable rows from this student's posted database ledger debits
  const buildStudentFeeHeads = (stu) => {
    const details = getFeeDetailsForStudent(stu.rollNumber);
    let remainingCredit = Number(details.totalPaid) || 0;

    return orderFeeHeadsForAdjustment(details.feeBreakup || []).map((head) => {
      const originalAmount = Number(head.amount) || 0;
      const appliedCredit = Math.min(remainingCredit, originalAmount);
      remainingCredit -= appliedCredit;
      const dueAmount = Math.max(0, originalAmount - appliedCredit);
      const isPaid = dueAmount === 0;

      return {
        id: head.id || `${head.head}-${head.date || ""}`,
        name: head.head || "Fee Head",
        category: head.category || "Academic Fee",
        priorityOrder: normalizeFeePriority(head.priorityOrder ?? head.feePriority ?? head.priority),
        dueAmount,
        collectAmount: dueAmount,
        originalAmount,
        dueDate: head.date || head.dueDate || "",
        isPaid,
        isOverdue: dueAmount > 0 && Boolean(head.isOverdue),
        selected: dueAmount > 0
      };
    });
  };

  const loadData = () => {
    initERP();
    const erpList = getStudents();
    
    const merged = erpList.map((s) => {
      const dept = s.department || "";
      const courseClean = s.course || "";
      const semFormatted = s.semester || "";
      const details = getFeeDetailsForStudent(s.rollNumber);
      const tot = Number(details.totalFees) || Number(s.totalFees) || 0;
      const paid = Number(details.totalPaid) || Number(s.paidFees) || 0;

      return {
        rollNumber: s.rollNumber,
        name: s.name,
        course: courseClean,
        courseCode: s.courseCode || "",
        courseName: s.courseName || s.course || "",
        department: dept,
        semester: semFormatted,
        section: s.section || "",
        session: s.session || "",
        batch: s.batch || "",
        totalFees: tot,
        paidFees: paid
      };
    });

    setStudentsList(merged);

    if (merged.length > 0) {
      const active = merged.find(s => s.rollNumber === selectedStudentRoll) || merged[0];
      const details = getFeeDetailsForStudent(active.rollNumber);
      const tot = Number(details.totalFees) || Number(active.totalFees) || 0;
      const paid = Number(details.totalPaid) || Number(active.paidFees) || 0;
      setSelectedStudentRoll(active.rollNumber);
      setStudentName(active.name);
      setStudentCourse(active.course);
      setStudentDepartment(active.department);
      setStudentSession(active.session);
      setStudentBatch(active.batch);
      setStudentSem(active.semester);
      setStudentSection(active.section);
      setStudentTotalFee(tot);
      setStudentPaidFee(paid);
      const builtHeads = buildStudentFeeHeads(active);
      setFeeHeads(builtHeads);
      const totalDue = builtHeads.filter(h => !h.isPaid).reduce((sum, h) => sum + h.dueAmount, 0);
      setCustomTotalInput(String(totalDue));
    } else {
      setSelectedStudentRoll("");
      setStudentName("");
      setStudentCourse("");
      setStudentDepartment("");
      setStudentSession("");
      setStudentBatch("");
      setStudentSem("");
      setStudentSection("");
      setStudentTotalFee(0);
      setStudentPaidFee(0);
      setFeeHeads([]);
      setCustomTotalInput("");
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("feeDataUpdated", loadData);
    window.addEventListener("studentEnrollmentUpdated", loadData);
    window.addEventListener("storage", loadData);
    return () => {
      window.removeEventListener("feeDataUpdated", loadData);
      window.removeEventListener("studentEnrollmentUpdated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  // Handle student selection from dropdown or search
  const handleSelectStudent = (roll) => {
    setSelectedStudentRoll(roll);
    const stu = studentsList.find(s => s.rollNumber === roll);
    if (stu) {
      const details = getFeeDetailsForStudent(stu.rollNumber);
      const tot = Number(details.totalFees) || Number(stu.totalFees) || 0;
      const paid = Number(details.totalPaid) || Number(stu.paidFees) || 0;
      setStudentName(stu.name);
      setStudentFather(stu.fatherName || stu.guardianName || "");
      setStudentEnrollmentNo(stu.enrollmentNo || "");
      setStudentCourse(stu.course);
      setStudentDepartment(stu.department);
      setStudentSession(stu.session);
      setStudentBatch(stu.batch);
      setStudentSem(stu.semester);
      setStudentSection(stu.section);
      setStudentTotalFee(tot);
      setStudentPaidFee(paid);
      const builtHeads = buildStudentFeeHeads(stu);
      setFeeHeads(builtHeads);
      const totalDue = builtHeads.filter(h => !h.isPaid).reduce((sum, h) => sum + h.dueAmount, 0);
      setCustomTotalInput(String(totalDue));
      setCollectionSuccess(false);
      setShowSearchDropdown(false);
    }
  };

  // Instant Search Handler
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setShowSearchDropdown(true);

    if (!val.trim()) return;

    const exactMatch = studentsList.find(
      s => String(s.rollNumber || "").toLowerCase() === val.trim().toLowerCase() ||
           String(s.name || "").toLowerCase() === val.trim().toLowerCase()
    );
    if (exactMatch) {
      handleSelectStudent(exactMatch.rollNumber);
      return;
    }

    const matches = studentsList.filter(
      s => String(s.rollNumber || "").toLowerCase().includes(val.toLowerCase()) ||
           String(s.name || "").toLowerCase().includes(val.toLowerCase())
    );
    if (matches.length === 1) {
      handleSelectStudent(matches[0].rollNumber);
    }
  };

  // Filtered Students list based on Department and Search Term
  const filteredStudents = useMemo(() => {
    return studentsList.filter((s) => {
      const matchSearch =
        !searchQuery ||
        String(s.rollNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(s.course || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchDept =
        filterDepartment === "All" ||
        String(s.department || "").toLowerCase().includes(filterDepartment.toLowerCase()) ||
        String(s.course || "").toLowerCase().includes(filterDepartment.toLowerCase());

      return matchSearch && matchDept;
    });
  }, [studentsList, searchQuery, filterDepartment]);

  // Exact net pending dues calculated from fee heads
  const pendingDues = useMemo(() => {
    const fromHeads = feeHeads.filter(h => !h.isPaid).reduce((sum, h) => sum + (Number(h.dueAmount) || 0), 0);
    return Math.max(fromHeads, Math.max(0, studentTotalFee - studentPaidFee));
  }, [feeHeads, studentTotalFee, studentPaidFee]);

  // Toggle selection of a single head
  const toggleHeadSelection = (headId) => {
    setFeeHeads(prev => {
      const updated = prev.map(h => {
        if (h.id === headId && !h.isPaid) {
          const nextSelected = !h.selected;
          return {
            ...h,
            selected: nextSelected,
            collectAmount: nextSelected ? (h.collectAmount > 0 ? h.collectAmount : h.dueAmount) : 0
          };
        }
        return h;
      });
      const newSum = updated.filter(h => h.selected && !h.isPaid).reduce((sum, h) => sum + (h.collectAmount || 0), 0);
      setCustomTotalInput(String(newSum));
      return updated;
    });
  };

  // Individual fee head collect amount change
  const handleHeadCollectAmountChange = (headId, val) => {
    const num = Math.max(0, Number(val) || 0);
    setFeeHeads(prev => {
      const updated = prev.map(h => {
        if (h.id === headId && !h.isPaid) {
          const capped = Math.min(h.dueAmount, num);
          return { ...h, collectAmount: capped, selected: capped > 0 };
        }
        return h;
      });
      const newSum = updated.filter(h => h.selected && !h.isPaid).reduce((sum, h) => sum + (h.collectAmount || 0), 0);
      setCustomTotalInput(String(newSum));
      return updated;
    });
  };

  // Select all pending heads
  const selectAllPending = (val) => {
    setFeeHeads(prev => {
      const updated = prev.map(h => (!h.isPaid ? { ...h, selected: val, collectAmount: val ? h.dueAmount : 0 } : h));
      const newSum = updated.filter(h => h.selected && !h.isPaid).reduce((sum, h) => sum + (h.collectAmount || 0), 0);
      setCustomTotalInput(String(newSum));
      return updated;
    });
  };

  // Distribute total custom amount across pending heads
  const distributeAmountAcrossHeads = (targetAmount) => {
    setCustomTotalInput(String(targetAmount));
    if (targetAmount === "" || targetAmount === null) {
      setFeeHeads(prev => prev.map(h => (!h.isPaid ? { ...h, selected: false, collectAmount: 0 } : h)));
      return;
    }
    let remaining = Math.max(0, Number(targetAmount) || 0);
    setFeeHeads((prev) =>
      prev.map((head) => {
        if (head.isPaid || head.dueAmount <= 0) return head;
        const allocated = Math.min(remaining, head.dueAmount);
        remaining -= allocated;
        return {
          ...head,
          selected: allocated > 0,
          collectAmount: allocated
        };
      })
    );
  };

  const selectedFeeSum = feeHeads
    .filter(h => h.selected && !h.isPaid)
    .reduce((sub, h) => sub + (Number(h.collectAmount) > 0 ? Number(h.collectAmount) : Number(h.dueAmount)), 0);

  const fineValue = addLateFine ? Number(lateFineAmount) || 0 : 0;
  const concessionValue = applyConcession ? Number(concessionAmount) || 0 : 0;
  const netPayable = Math.max(0, selectedFeeSum + fineValue - concessionValue);

  const handleProcessCollection = (e) => {
    e.preventDefault();
    if (applyConcession) {
      alert("Use Fee Concession approval page for waivers. Approved concessions are posted to the student ledger automatically.");
      return;
    }
    if (collectionMode.includes("POS Card") && (!posMachineId.trim() || !cardRrnCode.trim())) {
      alert("Enter actual POS terminal ID and RRN/approval code before posting the receipt.");
      return;
    }
    if (collectionMode.includes("UPI QR") && !upiUtrNo.trim()) {
      alert("Enter actual UPI UTR/reference number before posting the receipt.");
      return;
    }
    if (netPayable <= 0) {
      alert("Please enter or select a valid payment amount to collect.");
      return;
    }

    const receiptNoStr = generateReceiptNumber();
    const paidFeeHeads = feeHeads
      .filter(h => h.selected && !h.isPaid && (h.collectAmount ?? h.dueAmount) > 0)
      .map(h => ({
        name: h.name || "Fee Head",
        amount: Number(h.collectAmount ?? h.dueAmount) || 0,
        priorityOrder: h.priorityOrder
      }));
    const selectedParticulars = paidFeeHeads.map(h => `${h.name} (Rs. ${h.amount.toLocaleString("en-IN")})`);

    let fullRemarks = `Fee Collection: ${selectedParticulars.length > 0 ? selectedParticulars.join(", ") : `Payment of Rs. ${netPayable.toLocaleString("en-IN")}`}`;
    if (collectionMode.includes("POS Card")) {
      fullRemarks += ` [POS: ${posMachineId} | RRN: ${cardRrnCode} | Card: ****${cardLast4}]`;
    } else if (collectionMode.includes("UPI QR")) {
      fullRemarks += ` [UPI UTR: ${upiUtrNo}]`;
    }
    if (addLateFine) fullRemarks += ` [Incl. Late Fine Rs. ${fineValue}]`;
    if (applyConcession) fullRemarks += ` [Waiver Discount -Rs. ${concessionValue}]`;

    if (fineValue > 0) {
      addStudentLedgerEntry({
        id: `FINE-${receiptNoStr}`,
        rollNumber: selectedStudentRoll,
        studentName,
        course: studentCourse,
        semester: studentSem || "All",
        batch: studentBatch,
        session: studentSession,
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        dateSlash: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
        dr: fineValue,
        cr: 0,
        transactionMode: "Offline Cash Desk",
        particulars: "Late Payment Fine",
        remarks: `Fine added during receipt ${receiptNoStr}`,
        installment: "All",
        status: "Posted"
      });
    }

    const newReceipt = {
      receiptNo: receiptNoStr,
      receiptDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      totalRecAmount: netPayable,
      amount: netPayable,
      particulars: fullRemarks,
      feeHeads: paidFeeHeads,
      paidFeeHeads,
      mode: collectionMode,
      isCancelled: "No",
      session: studentSession,
      status: "Paid",
      studentName,
      studentRoll: selectedStudentRoll
    };

    // Add to ERP payments
    addPayment({
      id: receiptNoStr,
      receiptNo: receiptNoStr,
      rollNumber: selectedStudentRoll,
      studentName,
      course: studentCourse,
      amount: netPayable,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      method: collectionMode,
      remarks: fullRemarks,
      session: studentSession,
      status: "Paid"
    });

    // Add Credit to Student Ledger
    addStudentLedgerEntry({
      id: receiptNoStr,
      receiptNo: receiptNoStr,
      rollNumber: selectedStudentRoll,
      studentName,
      course: studentCourse,
      semester: studentSem || "All",
      batch: studentBatch,
      session: studentSession,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      dateSlash: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
      dr: 0,
      cr: netPayable,
      transactionMode: collectionMode,
      particulars: fullRemarks,
      remarks: `Paid at Counter - Receipt: ${receiptNoStr}`,
      installment: "All",
      status: "Cleared"
    });

    setGeneratedReceipt(newReceipt);
    setCollectionSuccess(true);
    loadData();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* -- Header Banner -- */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
              Official Cash Counter
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-200">
              Partial & Custom Payment Supported
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-600" /> Offline Accounts Cash Desk Terminal
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Collect full or partial fees (20%, 40%, 50%, or custom manual amounts) with immediate receipt generation and ledger synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowReconciliationModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Daily Cash Reconciliation Audit</span>
          </button>
          
          <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider">Terminal Status</p>
              <p className="text-sm font-black text-slate-900 leading-tight">Live Connected</p>
            </div>
          </div>
        </div>
      </div>

      {/* -- 1. Real-Time Student Search by Scholar No / Name -- */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-600" /> Real-Time Student Lookup (Search Scholar No or Name)
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Type a Scholar No or student name to load dues instantly.
            </p>
          </div>

          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 self-start sm:self-auto">
            {filteredStudents.length} Students Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Real-time Text Search Box */}
          {/* Quick Real-Time Instant Search by Scholar No / Scholar No / Name / Enrollment */}
          <div className="relative">
            <label className="block text-[10px] font-black uppercase text-purple-900 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-purple-600" /> Search by Scholar No. (Scholar No.) / Name:
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border-2 border-purple-300 px-3 py-2 rounded-xl text-xs focus-within:border-purple-600 focus-within:bg-white shadow-2xs transition-all">
              <Search className="w-4 h-4 text-purple-600 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Type Scholar No. (e.g. 101001), Name or Enrollment No..."
                className="bg-transparent outline-none font-black text-slate-900 w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setShowSearchDropdown(false); }}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                >
                  X
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSearchDropdown && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-purple-200 shadow-xl max-h-56 overflow-y-auto p-1.5 space-y-1 scrollbar-thin"
                >
                  {filteredStudents.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 font-bold">
                      No matching students found for "{searchQuery}"
                    </div>
                  ) : (
                    filteredStudents.map((st) => {
                      const stPending = Math.max(0, st.totalFees - st.paidFees);
                      const isSelected = selectedStudentRoll === st.rollNumber;
                      return (
                        <button
                          key={st.rollNumber}
                          type="button"
                          onClick={() => handleSelectStudent(st.rollNumber)}
                          className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-purple-600 text-white shadow-xs"
                              : "hover:bg-purple-50 text-slate-800"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="font-black text-xs truncate leading-tight">
                              {st.name} <span className={isSelected ? "text-purple-200 font-mono text-[10px]" : "text-purple-700 font-mono text-[10px]"}>[Scholar No: {st.scholarNo || st.rollNumber}{st.enrollmentNo ? ` | Enrollment No: ${st.enrollmentNo}` : ""}]</span>
                            </p>
                            <p className={`text-[10px] font-medium truncate ${isSelected ? "text-purple-100" : "text-slate-500"}`}>
                              {st.course} {st.department ? `(${st.department})` : ""}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : stPending > 0
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}>
                              {stPending > 0 ? `Rs. ${stPending.toLocaleString("en-IN")} Due` : "All Paid (0 Due)"}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Department Filter Dropdown */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-600 mb-1 flex items-center gap-1">
              <School className="w-3 h-3 text-purple-600" /> Filter by Department:
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-purple-500 focus:bg-white"
            >
              <option value="All">All Departments</option>
              {Array.from(new Set(studentsList.map((student) => student.department).filter(Boolean))).map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Student Selector Dropdown */}
        <div>
          <label className="block text-[10px] font-black uppercase text-purple-900 mb-1">
            Or Choose from Loaded Roster:
          </label>
          <select
            value={selectedStudentRoll}
            onChange={(e) => handleSelectStudent(e.target.value)}
            className="w-full p-2.5 bg-purple-50/60 border border-purple-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-400"
          >
            {filteredStudents.map((s) => {
              const dues = Math.max(0, s.totalFees - s.paidFees);
              const hasFeeImposed = (Number(s.totalFees) || 0) > 0;
              return (
                <option key={s.rollNumber} value={s.rollNumber}>
                  Scholar No: {s.scholarNo || s.rollNumber} - {s.name} ({s.course}){s.enrollmentNo ? ` [Enrollment No: ${s.enrollmentNo}]` : ""} [{!hasFeeImposed ? "Fee Not Imposed" : dues === 0 ? "ALL PAID (0 Due)" : `Remaining Dues: Rs. ${dues.toLocaleString("en-IN")}`}]
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* -- 2. Selected Student Dues Summary Card -- */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-purple-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 border border-purple-300/40 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
              {studentName ? studentName.charAt(0) : "S"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">{studentName || "Select Student"}</h2>
                {selectedStudentRoll && (
                  <span className="px-2.5 py-0.5 bg-purple-500/30 text-purple-200 border border-purple-400/50 rounded-full text-[11px] font-mono font-black">
                    Scholar No: {selectedStudentRoll}
                  </span>
                )}
                {studentsList.find(s => s.rollNumber === selectedStudentRoll)?.enrollmentNo && (
                  <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/50 rounded-full text-[11px] font-mono font-black">
                    Enrollment No: {studentsList.find(s => s.rollNumber === selectedStudentRoll)?.enrollmentNo}
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-200 font-medium">
                {[studentCourse, studentDepartment].filter(Boolean).join(" - ") || "No student selected"}
              </p>
            </div>
          </div>

          {/* Dues Breakdown Pills */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <p className="text-[9px] uppercase font-black text-purple-200">Total Imposed</p>
              <p className="text-sm sm:text-base font-black font-mono mt-0.5">Rs. {studentTotalFee.toLocaleString("en-IN")}</p>
            </div>

            <div className="bg-emerald-500/20 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-emerald-400/30 text-center">
              <p className="text-[9px] uppercase font-black text-emerald-300 flex items-center justify-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" /> Settled / Paid
              </p>
              <p className="text-sm sm:text-base font-black text-emerald-400 font-mono mt-0.5">Rs. {studentPaidFee.toLocaleString("en-IN")}</p>
            </div>

            <div className={`backdrop-blur-xs px-4 py-2.5 rounded-xl border text-center ${
              studentTotalFee > 0 && pendingDues === 0 ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                : "bg-rose-500/25 border-rose-400/40 text-rose-300"
            }`}>
              <p className="text-[9px] uppercase font-black flex items-center justify-center gap-1">
                {studentTotalFee > 0 && pendingDues === 0 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {studentTotalFee <= 0 ? "Fee Not Imposed" : pendingDues === 0 ? "No Dues Status" : "Net Balance Due"}
              </p>
              <p className="text-sm sm:text-base font-black font-mono mt-0.5">
                {studentTotalFee <= 0 ? "No fee assigned" : pendingDues === 0 ? "0 (All Clear)" : `Rs. ${pendingDues.toLocaleString("en-IN")}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* -- 3. Success Notification & Cashier Receipt -- */}
      {collectionSuccess && generatedReceipt && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Payment Collected & Official Receipt Issued!
            </p>
            <span className="font-mono font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
              {generatedReceipt.receiptNo}
            </span>
          </div>
          <p className="text-emerald-700 font-medium leading-relaxed">
            Net Amount <strong>Rs. {generatedReceipt.amount.toLocaleString("en-IN")}</strong> collected via {collectionMode} for <strong>{studentName}</strong> (Scholar No: {selectedStudentRoll}). All fee ledgers updated in real-time!
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" /> Print Cashier Receipt
            </button>
            <button
              type="button"
              onClick={() => setCollectionSuccess(false)}
              className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-extrabold cursor-pointer"
            >
              Collect Another Fee
            </button>
          </div>
        </div>
      )}

      {/* -- 4. Main Collection Desk Form -- */}
      <form onSubmit={handleProcessCollection} className="space-y-6 text-xs">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-xs">
          {/* Payment Channel / Mode Selector */}
          <div>
            <label className="block font-extrabold text-slate-700 mb-1.5 text-xs">
              Select Counter Collection Channel / Mode *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {[
                { id: "Physical Cash Deposit at Counter", label: "Physical Cash", icon: Landmark },
                { id: "POS Card Swipe Machine (Debit/Credit)", label: "POS Card Swipe", icon: CreditCard },
                { id: "Counter Dynamic UPI QR Scan (GPay/PhonePe/Paytm)", label: "Dynamic UPI QR", icon: QrCode },
                { id: "Demand Draft (DD) / Bank Cheque", label: "DD / Cheque", icon: Receipt },
              ].map((mode) => {
                const IconComp = mode.icon;
                const isSelected = collectionMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setCollectionMode(mode.id)}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-gray-200 hover:bg-slate-100"
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span className="truncate">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional POS Card Machine Inputs */}
          {collectionMode.includes("POS Card") && (
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
              <p className="font-black text-purple-900 text-xs flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" /> Offline POS Machine Transaction Verification
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">POS Machine Terminal ID</label>
                  <input
                    type="text"
                    required
                    value={posMachineId}
                    onChange={(e) => setPosMachineId(e.target.value)}
                    className="w-full p-2 bg-white border border-purple-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">POS RRN / Approval Code</label>
                  <input
                    type="text"
                    required
                    value={cardRrnCode}
                    onChange={(e) => setCardRrnCode(e.target.value)}
                    className="w-full p-2 bg-white border border-purple-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Card Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value)}
                    className="w-full p-2 bg-white border border-purple-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Conditional Dynamic UPI QR Scan Controls */}
          {collectionMode.includes("UPI QR") && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="font-black text-emerald-900 text-xs flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600" /> Counter Dynamic UPI QR Code Payment
                </p>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" /> Display Dynamic QR Code on Counter Screen
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">UPI Transaction Reference / UTR Number</label>
                <input
                  type="text"
                  required
                  value={upiUtrNo}
                  onChange={(e) => setUpiUtrNo(e.target.value)}
                  placeholder="Enter bank UTR/reference"
                  className="w-full p-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          )}

          {/* -- Manual Collection Amount / Part Payment Box -- */}
          <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-slate-50 rounded-2xl border border-purple-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xs">
                    Manual Collection Amount / Part Payment
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Type any custom manual amount to collect, or adjust individual fee heads directly below.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectAllPending(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                >
                  Select Full Dues
                </button>
                <button
                  type="button"
                  onClick={() => selectAllPending(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Clear Amount
                </button>
              </div>
            </div>

            {/* Manual Custom Amount Input */}
            <div className="pt-1">
              <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl border-2 border-purple-300 focus-within:border-purple-600 shadow-2xs">
                <span className="font-bold text-slate-600 text-xs shrink-0">Enter Custom Collection Amount (Rs.):</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customTotalInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    distributeAmountAcrossHeads(raw);
                  }}
                  placeholder={`e.g. 5000 (Max: Rs. ${pendingDues.toLocaleString("en-IN")})`}
                  className="w-full bg-transparent outline-none font-mono font-black text-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* -- 5. PAYABLE FEE HEADS LIST -- */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-black text-slate-900 flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4 text-purple-600" /> Assigned Fee Charges & Particulars
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Select fee heads or edit individual collection amounts below.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectAllPending(true)}
                  className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Select All Pending
                </button>
                <button
                  type="button"
                  onClick={() => selectAllPending(false)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* If 100% Fees are Paid */}
            {studentTotalFee > 0 && pendingDues === 0 && (
              <div className="p-6 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold space-y-1 shadow-2xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                <p className="text-base font-black">All Fees Fully Paid & Settled!</p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {studentName} ({selectedStudentRoll}) has Rs. 0 remaining dues. Exam NOC & Clearance is fully unlocked.
                </p>
              </div>
            )}

            {/* Fee Heads List with Direct Manual Amount Input per Head */}
            <div className="space-y-2.5">
              {feeHeads.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs font-bold text-slate-500">
                  {studentTotalFee <= 0
                    ? "Fee is not imposed for this student yet."
                    : "No pending fee heads found for this student."}
                </div>
              ) : (
                feeHeads.map((head) => {
                  const headPaid = head.isPaid;
                  const headChosen = head.selected && !headPaid;

                  return (
                    <div
                      key={head.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        headPaid
                          ? "bg-emerald-50/60 border-emerald-200 cursor-default opacity-85"
                          : headChosen
                          ? "bg-purple-50 border-purple-400 shadow-2xs ring-1 ring-purple-300"
                          : "bg-slate-50 border-gray-200 opacity-70 hover:opacity-100 hover:bg-slate-100"
                      }`}
                    >
                      <div 
                        onClick={() => !headPaid && toggleHeadSelection(head.id)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                      >
                        <div className="shrink-0">
                          {headPaid ? (
                            <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : headChosen ? (
                            <div className="w-5 h-5 rounded bg-purple-600 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white" />
                          )}
                        </div>

                        <div className="truncate min-w-0">
                          <p className={`font-black text-xs truncate leading-tight ${headPaid ? "text-slate-600 line-through" : "text-slate-900"}`}>
                            {head.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                            Category: {head.category} {head.dueDate ? `| Due Date: ${head.dueDate}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-200/40">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] text-slate-400 font-bold">Due Amount</p>
                          <p className="font-mono font-bold text-xs text-slate-700">
                            Rs. {head.dueAmount.toLocaleString("en-IN")}
                          </p>
                        </div>

                        {/* Editable Collect Amount */}
                        <div>
                          <p className="text-[10px] text-purple-900 font-bold mb-0.5">Collect (Rs.)</p>
                          <input
                            type="text"
                            inputMode="numeric"
                            disabled={headPaid}
                            value={headPaid ? 0 : (head.selected ? (head.collectAmount !== undefined ? head.collectAmount : head.dueAmount) : 0)}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              handleHeadCollectAmountChange(head.id, raw);
                            }}
                            className="w-24 px-2 py-1 bg-white border border-purple-300 rounded-lg text-right font-mono font-black text-slate-900 text-xs outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100"
                          />
                        </div>

                        <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${
                          headPaid
                            ? "text-emerald-800 bg-emerald-100"
                            : headChosen
                            ? "text-purple-800 bg-purple-100"
                            : "text-rose-700 bg-rose-50"
                        }`}>
                          {headPaid ? "Paid & Cleared" : headChosen ? "Selected" : "Due Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Late Fine & Concession Adjustments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Add Late Payment Penalty */}
            <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Apply Late Payment Fine:
                </span>
                <input
                  type="checkbox"
                  checked={addLateFine}
                  onChange={(e) => setAddLateFine(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 cursor-pointer"
                />
              </div>
              {addLateFine && (
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={lateFineAmount === 0 ? "" : (lateFineAmount ?? "")}
                    onChange={(e) => setLateFineAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter fine amount (Rs.)..."
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold text-slate-900 text-xs outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              )}
            </div>

            {/* Total Payable Box */}
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col justify-between">
              <p className="text-[10px] uppercase font-black text-purple-700">Total Net Collection Amount</p>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs text-slate-600 font-bold">Payable Now:</span>
                <span className="text-xl font-black text-purple-950 font-mono">
                  Rs. {netPayable.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Collection Button */}
          <button
            type="submit"
            disabled={netPayable <= 0}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-xs shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            {netPayable > 0
              ? `Collect Payment (Rs. ${netPayable.toLocaleString("en-IN")}) & Issue Official Receipt`
              : "Select Fee Heads or Enter Amount to Collect"}
          </button>
        </div>
      </form>

      {/* Dynamic UPI QR Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100"
            >
              <h3 className="text-base font-black text-slate-900">Scan Counter Dynamic UPI QR</h3>
              <p className="text-xs text-slate-500 font-medium">
                Scan to pay <strong>Rs. {netPayable.toLocaleString("en-IN")}</strong> for {studentName} ({selectedStudentRoll})
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 inline-block">
                <QrCode className="w-36 h-36 text-slate-800 mx-auto" />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">UPI ID: sarvadnya.erp@sbi</p>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs cursor-pointer"
              >
                Close QR Screen
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Fee Receipt Modal for Printing */}
      {showPrintModal && generatedReceipt && (
        <OfficialFeeReceiptModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          receipt={generatedReceipt}
          student={{
            name: studentName,
            fatherName: studentFather,
            rollNumber: selectedStudentRoll,
            scholarNo: selectedStudentRoll,
            enrollmentNo: studentEnrollmentNo,
            course: studentCourse,
            department: studentDepartment,
            session: studentSession,
            batch: studentBatch
          }}
        />
      )}

      {/* Daily Cash Reconciliation Modal */}
      {showReconciliationModal && (
        <DailyReconciliationModal
          isOpen={showReconciliationModal}
          onClose={() => setShowReconciliationModal(false)}
        />
      )}
    </motion.div>
  );
}
