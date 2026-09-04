import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee,
  TrendingUp,
  Building2,
  Clock,
  Search,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Award,
  RotateCcw,
  Percent,
  Receipt,
  Sparkles,
  Users,
  Eye,
  ArrowRight,
  FileCheck
} from "lucide-react";
import {
  feeDetails,
  studentProfile,
  getBankChallans,
  getDrccApplications,
  getScholarshipApplications,
  getConcessionRequests,
  getRefundRequests
} from "../../../hooks/studentPortalData";
import { getStudents, initERP } from "../../../hooks/erpData";

const formatCurrency = (amount = 0) => `Rs. ${(Number(amount) || 0).toLocaleString("en-IN")}`;

export default function OfficerDashboardPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Live Aggregate Financial Metrics
  const [sessionRevenue, setSessionRevenue] = useState(0);
  const [outstandingDues, setOutstandingDues] = useState(0);
  const [pendingChallansCount, setPendingChallansCount] = useState(0);
  const [pendingScholarshipsCount, setPendingScholarshipsCount] = useState(0);
  const [pendingConcessionsCount, setPendingConcessionsCount] = useState(0);
  const [pendingRefundsCount, setPendingRefundsCount] = useState(0);

  const loadData = () => {
    const erpList = getStudents();
    const all = erpList.map((s) => ({
      name: s.name,
      rollNumber: s.rollNumber,
      course: `${s.course} (${s.department || "General"})`,
      totalPending: Math.max(0, (Number(s.totalFees) || 0) - (Number(s.paidFees) || 0)),
      totalPaid: Number(s.paidFees) || 0,
      totalFee: Number(s.totalFees) || 0,
      feeImposed: (Number(s.totalFees) || 0) > 0,
      semester: `${s.semester || "I SEM"}`
    }));

    setStudents(all);

    // Compute live collections & outstanding dues
    const totalPaidSum = all.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
    const totalPendingSum = all.reduce((sum, s) => sum + (s.totalPending || 0), 0);
    setSessionRevenue(totalPaidSum);
    setOutstandingDues(totalPendingSum);

    // Pending queues across financial desks
    const challans = getBankChallans();
    setPendingChallansCount(challans.filter(c => String(c.status || "").includes("Pending") || String(c.status || "").includes("Review")).length);

    const scholarships = getScholarshipApplications();
    const drccApplications = getDrccApplications();
    const isAidDeskPending = (status = "") => {
      const text = String(status || "");
      return (
        text.includes("Pending") ||
        text.includes("Review") ||
        text.includes("Submitted") ||
        text.includes("Verification")
      );
    };
    setPendingScholarshipsCount(
      scholarships.filter(s => !String(s.disbursementTo || s.paymentDestination || "").includes("Student Account") && isAidDeskPending(s.status)).length +
      drccApplications.filter(s => !String(s.disbursementTo || s.paymentDestination || "").includes("Student Account") && isAidDeskPending(s.status)).length
    );

    const concessions = getConcessionRequests();
    setPendingConcessionsCount(concessions.filter(c => String(c.status || "").includes("Pending") || String(c.status || "").includes("Review")).length);

    const refunds = getRefundRequests();
    setPendingRefundsCount(refunds.filter(r => String(r.status || "").includes("Pending") || String(r.status || "").includes("Review")).length);

    // Select active search student
    const found = all.find(
      s => String(s.rollNumber || "").toLowerCase() === searchTerm.toLowerCase() || String(s.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSelectedStudent(found || (all.length > 0 ? all[0] : null));
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("feeDataUpdated", handleUpdate);
    window.addEventListener("scholarshipDataUpdated", handleUpdate);
    window.addEventListener("drccDataUpdated", handleUpdate);
    window.addEventListener("concessionDataUpdated", handleUpdate);
    window.addEventListener("refundDataUpdated", handleUpdate);
    window.addEventListener("bankChallansUpdated", handleUpdate);
    window.addEventListener("studentEnrollmentUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("feeDataUpdated", handleUpdate);
      window.removeEventListener("scholarshipDataUpdated", handleUpdate);
      window.removeEventListener("drccDataUpdated", handleUpdate);
      window.removeEventListener("concessionDataUpdated", handleUpdate);
      window.removeEventListener("refundDataUpdated", handleUpdate);
      window.removeEventListener("bankChallansUpdated", handleUpdate);
      window.removeEventListener("studentEnrollmentUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const found = students.find(
      (s) =>
        String(s.scholarNo || s.rollNumber || "").toLowerCase().includes(term.toLowerCase()) ||
        String(s.enrollmentNo || "").toLowerCase().includes(term.toLowerCase()) ||
        String(s.name || "").toLowerCase().includes(term.toLowerCase())
    );
    if (found) {
      setSelectedStudent(found);
    }
  };

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
              Accounts & Audit Command Center
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time Live Sync
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Financial Dashboard & Master Audit
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Live overview of university fee collections, outstanding student dues, and specialized financial verification desks.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-purple-50/70 border border-purple-100 p-3 rounded-2xl shrink-0">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-xs">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold text-purple-700 tracking-wider">Session Total Collections</p>
            <p className="text-xl font-black text-slate-900 leading-tight">{formatCurrency(sessionRevenue)}</p>
          </div>
        </div>
      </div>

      {/* -- Top KPI Stat Cards -- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Session Collections</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(sessionRevenue)}</p>
          <p className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Live Passbook Reconciled
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Total Outstanding Dues</span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono">{formatCurrency(outstandingDues)}</p>
          <p className="text-[10px] text-slate-500 font-semibold">{students.length} Enrolled Active Students</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Bank Challan Clearance</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700 font-mono">{pendingChallansCount} Pending</p>
          <p className="text-[10px] text-purple-600 font-bold">Offline SBI / PNB slips queue</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Relief & Aid Desks</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono">
            {pendingScholarshipsCount + pendingConcessionsCount} Appeals
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold">Scholarship & Concession queue</p>
        </div>
      </div>

      {/* -- Direct Desk Quick Access Action Tiles -- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scholarships */}
        <div
          onClick={() => navigate("/fee-officer-dashboard/scholarships")}
          className="p-4 bg-white hover:bg-purple-50/50 rounded-2xl border border-gray-200 hover:border-purple-300 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
              <Award className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-200">
              {pendingScholarshipsCount} Pending
            </span>
          </div>
          <h4 className="font-black text-slate-900 text-xs mt-2 group-hover:text-purple-700 flex items-center justify-between">
            Scholarship & DRCC Desk
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Audit NSP, DRCC loan & state aid</p>
        </div>

        {/* Concessions */}
        <div
          onClick={() => navigate("/fee-officer-dashboard/concessions")}
          className="p-4 bg-white hover:bg-amber-50/50 rounded-2xl border border-gray-200 hover:border-amber-300 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
              <Percent className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-200">
              {pendingConcessionsCount} Pending
            </span>
          </div>
          <h4 className="font-black text-slate-900 text-xs mt-2 group-hover:text-amber-700 flex items-center justify-between">
            Fee Concession & Waivers
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Sibling & late penalty appeals</p>
        </div>

        {/* Refunds */}
        <div
          onClick={() => navigate("/fee-officer-dashboard/refunds")}
          className="p-4 bg-white hover:bg-rose-50/50 rounded-2xl border border-gray-200 hover:border-rose-300 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
              <RotateCcw className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-200">
              {pendingRefundsCount} Claims
            </span>
          </div>
          <h4 className="font-black text-slate-900 text-xs mt-2 group-hover:text-rose-700 flex items-center justify-between">
            Refunds & NEFT Payouts
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Double deduction settlement</p>
        </div>

        {/* Master Ledgers */}
        <div
          onClick={() => navigate("/fee-officer-dashboard/ledger")}
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
              {students.length} Ledgers
            </span>
          </div>
          <h4 className="font-black text-slate-900 text-xs mt-2 group-hover:text-emerald-700 flex items-center justify-between">
            Student Master Ledgers
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Audit transaction logs & print</p>
        </div>
      </div>

      {/* -- Live Student Profile & Financial Inspector -- */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600" /> Live Student Profile & Financial Inspector
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Search any student by Scholar No., Name or Enrollment No. in real time
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search Scholar No..."
              className="px-3.5 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-purple-500 font-mono w-64"
            />
          </div>
        </div>

        {/* Student Summary Card */}
        {selectedStudent ? (
          <div className="p-5 rounded-2xl bg-slate-50 border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-sans font-bold">Student Profile</p>
              <p className="font-extrabold text-slate-900 text-sm font-sans mt-0.5">{selectedStudent.name}</p>
              <p className="text-purple-700 font-bold">Scholar No: {selectedStudent.scholarNo || selectedStudent.rollNumber}</p>
              {selectedStudent.enrollmentNo && <p className="text-indigo-600 font-bold text-[10px]">Enrollment: {selectedStudent.enrollmentNo}</p>}
            </div>

            <div>
              <p className="text-slate-500 text-[10px] uppercase font-sans font-bold">Course / Session</p>
              <p className="font-bold text-slate-800 mt-0.5 font-sans">{selectedStudent.course}</p>
              <p className="text-slate-500">{selectedStudent.semester}</p>
            </div>

            <div>
              <p className="text-slate-500 text-[10px] uppercase font-sans font-bold">Approved Total Fee</p>
              <p className={`font-black text-base ${selectedStudent.feeImposed ? "text-emerald-700" : "text-slate-500"}`}>
                {selectedStudent.feeImposed ? formatCurrency(selectedStudent?.totalFee) : "Fee Not Imposed"}
              </p>
              <p className="text-slate-600 font-sans">Paid: {formatCurrency(selectedStudent?.totalPaid)}</p>
            </div>

            <div>
              <p className="text-slate-500 text-[10px] uppercase font-sans font-bold">Pending Dues</p>
              <p className={`font-black text-base ${selectedStudent.feeImposed ? "text-rose-600" : "text-slate-500"}`}>
                {selectedStudent.feeImposed ? formatCurrency(selectedStudent?.totalPending) : "No fee assigned"}
              </p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-sans uppercase ${
                !selectedStudent.feeImposed ? "bg-slate-100 text-slate-700" : selectedStudent.totalPending === 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}>
                {!selectedStudent.feeImposed ? "Fee Not Imposed" : selectedStudent.totalPending === 0 ? "All Dues Cleared" : "Outstanding Dues Pending"}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-medium">No student matched with "{searchTerm}".</p>
        )}
      </div>
    </motion.div>
  );
}


