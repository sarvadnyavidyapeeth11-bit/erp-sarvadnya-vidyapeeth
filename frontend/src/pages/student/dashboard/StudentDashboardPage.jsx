import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  FileText,
  IndianRupee,
  Receipt,
  ShieldCheck,
  User,
  WalletCards,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Building2,
  Calendar,
  Layers,
  Download
} from "lucide-react";
import {
  getActiveStudentProfile,
  getBankChallans,
  getConcessionRequests,
  getDrccApplications,
  getFeeDetails,
  getRefundRequests,
  getScholarshipApplications,
  getStudentLedgerEntries
} from "../../../hooks/studentPortalData";
import { getStudentByRoll } from "../../../hooks/adminData";
import sarvadnyaLogo from "../../../assets/sarvadnya_logo.jpg";

const requestStatus = (items, identifiers) =>
  items
    .filter((item) => identifiers.has(item.rollNumber) || identifiers.has(item.scholarNo))
    .slice(0, 5);

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState(() => getActiveStudentProfile());
  const [verification, setVerification] = useState(null);
  const [fees, setFees] = useState(() => getFeeDetails());
  const [recentLedger, setRecentLedger] = useState([]);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [requests, setRequests] = useState([]);

  const reloadData = () => {
    const activeProfile = getActiveStudentProfile();
    const identifiers = new Set([
      activeProfile.rollNumber,
      activeProfile.scholarNo,
      activeProfile.enrollmentNo,
      activeProfile.id
    ].filter(Boolean));

    setProfile(activeProfile);
    setVerification(getStudentByRoll(activeProfile.rollNumber || activeProfile.scholarNo) || null);

    const feeData = getFeeDetails();
    setFees(feeData);

    // Only Recent 5 Ledger Entries
    const activeSession = activeProfile.session || activeProfile.academicSession || "";
    const ledgerEntries = getStudentLedgerEntries(activeProfile.rollNumber || activeProfile.scholarNo)
      .filter((entry) => !activeSession || entry.session === activeSession);
    setRecentLedger(ledgerEntries.slice().reverse().slice(0, 5));

    // Only Recent 5 Fee Receipts
    const receiptsList = Array.isArray(feeData.receipts) ? feeData.receipts : [];
    setRecentReceipts(receiptsList.slice().reverse().slice(0, 5));

    // Requests queue
    setRequests([
      ...requestStatus(getBankChallans(), identifiers).map((item) => ({ ...item, type: "Bank Challan", key: item.id })),
      ...requestStatus(getDrccApplications(), identifiers).map((item) => ({ ...item, type: "DRCC", key: item.id })),
      ...requestStatus(getScholarshipApplications(), identifiers).map((item) => ({ ...item, type: "Scholarship", key: item.id })),
      ...requestStatus(getRefundRequests(), identifiers).map((item) => ({ ...item, type: "Refund Claim", key: item.ticketId })),
      ...requestStatus(getConcessionRequests(), identifiers).map((item) => ({ ...item, type: "Concession", key: item.id }))
    ].slice(0, 5));
  };

  useEffect(() => {
    reloadData();
    const events = [
      "studentEnrollmentUpdated",
      "feeDataUpdated",
      "bankChallansUpdated",
      "drccDataUpdated",
      "scholarshipDataUpdated",
      "refundDataUpdated",
      "concessionDataUpdated",
      "storage"
    ];
    events.forEach((eventName) => window.addEventListener(eventName, reloadData));
    return () => events.forEach((eventName) => window.removeEventListener(eventName, reloadData));
  }, []);

  const isVerified = verification?.status === "Verified";
  const verifiedBadgeText = isVerified ? "Verified & Approved" : verification?.status || "Draft / Under Review";
  const studentPhotoUrl = profile.photoPreviews?.studentPhoto || profile.photo || "";
  const hasStudentPhoto = typeof studentPhotoUrl === "string" && /^(data:|blob:|https?:\/\/)/i.test(studentPhotoUrl);
  const studentIdNumber = profile.scholarNo || profile.rollNumber || profile.enrollmentNo || "N/A";
  const rawCourseText = String(profile.courseCode || profile.course || profile.courseClass || "");
  const courseAfterName = rawCourseText.includes(" - ") ? rawCourseText.split(" - ").pop() : rawCourseText;
  const headerCourse = (courseAfterName
    .replace(/\b20\d{2}\s*-\s*20\d{2}\b/gi, "")
    .replace(/\b[IVX]+\s*SEM(?:ESTER)?\b/gi, "")
    .trim()
    .split(/\s+/)[0]) || "Degree Course";
  const extractedTerm = (courseAfterName.match(/\b[IVX]+\s*SEM(?:ESTER)?\b/i)?.[0] || "").toUpperCase();
  const headerTerm = profile.semester || extractedTerm || profile.year || profile.session || "Current Session";

  const escapeHtml = (value = "") => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const handleDownloadIdCard = () => {
    const initials = (profile.name || "S").slice(0, 1).toUpperCase();
    const cardHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Student ID Card - ${escapeHtml(profile.name || "Student")}</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap; background: #f1f5f9; font-family: Arial, sans-serif; padding: 24px; }
    .card { width: 280px; min-height: 440px; border: 1px solid #dbe3ef; border-radius: 18px; overflow: hidden; background: white; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14); }
    .top { background: #4f46e5; color: white; padding: 16px; text-align: center; }
    .logo { width: 48px; height: 48px; border-radius: 12px; object-fit: cover; display: block; margin: 0 auto 8px; border: 2px solid rgba(255,255,255,.75); background: white; }
    .top h1 { margin: 0; font-size: 17px; }
    .top p { margin: 4px 0 0; font-size: 11px; font-weight: 700; opacity: 0.9; }
    .body { padding: 18px; }
    .photo { width: 96px; height: 112px; margin: 0 auto 14px; border: 3px solid #e0e7ff; border-radius: 12px; display: grid; place-items: center; overflow: hidden; background: #eef2ff; color: #4338ca; font-size: 30px; font-weight: 900; }
    .photo img { width: 100%; height: 100%; object-fit: cover; }
    .name { text-align: center; font-size: 18px; font-weight: 900; color: #0f172a; margin-bottom: 2px; }
    .course { text-align: center; color: #475569; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid #e2e8f0; padding: 9px 0; font-size: 12px; }
    .label { color: #64748b; font-weight: 800; }
    .value { color: #0f172a; font-weight: 900; text-align: right; }
    .foot { background: #f8fafc; padding: 12px 16px; font-size: 10px; color: #475569; text-align: center; font-weight: 700; }
    .back-title { font-size: 13px; font-weight: 900; color: #0f172a; margin: 0 0 10px; text-align: center; }
    .rules { margin: 0; padding-left: 18px; color: #475569; font-size: 11px; line-height: 1.5; }
    @media print { body { background: white; padding: 0; } .card { box-shadow: none; break-inside: avoid; } }
  </style>
</head>
<body>
  <section class="card">
    <div class="top">
      <img class="logo" src="${sarvadnyaLogo}" alt="Logo" />
      <h1>Sarvadnya Vidyapeeth</h1>
      <p>Student Identity Card</p>
    </div>
    <div class="body">
      <div class="photo">${hasStudentPhoto ? `<img src="${studentPhotoUrl}" alt="Student Photo" />` : escapeHtml(initials)}</div>
      <div class="name">${escapeHtml(profile.name || "Student")}</div>
      <div class="course">${escapeHtml(headerCourse)} ${escapeHtml(headerTerm || "")}</div>
      <div class="row"><span class="label">Scholar No</span><span class="value">${escapeHtml(studentIdNumber)}</span></div>
      <div class="row"><span class="label">Enrollment No</span><span class="value">${escapeHtml(profile.enrollmentNo || "N/A")}</span></div>
      <div class="row"><span class="label">Session</span><span class="value">${escapeHtml(profile.session || profile.academicSession || "N/A")}</span></div>
      <div class="row"><span class="label">Department</span><span class="value">${escapeHtml(profile.department || "N/A")}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${escapeHtml(profile.phone || "N/A")}</span></div>
    </div>
    <div class="foot">Generated from verified ERP student profile data.</div>
  </section>
  <section class="card">
    <div class="top">
      <img class="logo" src="${sarvadnyaLogo}" alt="Logo" />
      <h1>Sarvadnya Vidyapeeth</h1>
      <p>ID Card Back Side</p>
    </div>
    <div class="body">
      <p class="back-title">Instructions</p>
      <ul class="rules">
        <li>This card is property of Sarvadnya Vidyapeeth.</li>
        <li>Student must carry this card inside campus.</li>
        <li>If found, return to college administration office.</li>
        <li>This card is valid only for the printed academic session.</li>
      </ul>
      <div class="row"><span class="label">Verify ID</span><span class="value">${escapeHtml(studentIdNumber)}</span></div>
      <div class="row"><span class="label">Emergency</span><span class="value">${escapeHtml(profile.phone || "N/A")}</span></div>
      <div class="row"><span class="label">Address</span><span class="value">Patna, Bihar</span></div>
    </div>
    <div class="foot">Authorized Signatory<br />Sarvadnya Vidyapeeth</div>
  </section>
</body>
</html>`;
    const blob = new Blob([cardHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `student-id-card-${studentIdNumber}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const hasFeeImposed = (Number(fees.totalFees) || 0) > 0;
  const financialMetrics = useMemo(() => [
    {
      title: "Total Prescribed Fee",
      amount: fees.totalFees,
      icon: FileText,
      bg: "bg-slate-50",
      border: "border-slate-200",
      iconBg: "bg-slate-100 text-slate-700",
      pill: "Institutional Dues"
    },
    {
      title: "Total Paid / Cleared",
      amount: fees.totalPaid,
      icon: CheckCircle2,
      bg: "bg-emerald-50/50",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100 text-emerald-700",
      pill: hasFeeImposed && fees.totalPending === 0 ? "100% Cleared" : "Paid Credit"
    },
    {
      title: "Remaining Dues",
      amount: fees.totalPending,
      icon: IndianRupee,
      bg: !hasFeeImposed ? "bg-slate-50" : fees.totalPending > 0 ? "bg-rose-50/50" : "bg-emerald-50/30",
      border: !hasFeeImposed ? "border-slate-200" : fees.totalPending > 0 ? "border-rose-200" : "border-emerald-200",
      iconBg: !hasFeeImposed ? "bg-slate-100 text-slate-600" : fees.totalPending > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700",
      pill: !hasFeeImposed ? "Fee Not Imposed" : fees.totalPending > 0 ? "Pending Payment" : "All Dues Cleared"
    }
  ], [fees, hasFeeImposed]);

  if (!profile.rollNumber && !profile.scholarNo) {
    return (
      <div className="bg-white rounded-2xl border border-amber-200 p-5 sm:p-8 text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <h1 className="text-lg font-black text-slate-900">No active student profile found</h1>
        <p className="text-xs text-slate-500 mt-1">Please log in or enroll from the Admissions Portal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Student Profile Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-7 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 min-w-0 w-full">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-purple-200 shrink-0 overflow-hidden">
              {hasStudentPhoto ? (
                <img
                  src={studentPhotoUrl}
                  alt={`${profile.name || "Student"} photo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                (profile.name || "S")
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
              )}
            </div>

            <div className="min-w-0 text-center md:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-words">
                  {profile.name}
                </h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold border shadow-2xs flex items-center gap-1 ${
                    isVerified
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {verifiedBadgeText}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-xs text-slate-600 font-bold">
                <span className="text-purple-950 font-black">
                  {headerCourse}
                </span>
                <span className="text-slate-300">|</span>
                <span>{headerTerm}</span>
                <span className="text-slate-300">|</span>
                <span>Batch: <strong className="text-slate-800">{profile.batch || profile.session || "2026-2029"}</strong></span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-500 font-semibold">
                <span>Enrollment: <strong className="text-slate-900 font-bold">{profile.enrollmentNo || "N/A"}</strong></span>
                <span>Scholar No: <strong className="text-slate-900 font-bold">{profile.scholarNo || profile.rollNumber || "N/A"}</strong></span>
                <span>ABC ID: <strong className="text-slate-900 font-bold">{profile.abcId || "N/A"}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0 w-full md:w-auto">
            <Link
              to="/student-dashboard/profile"
              className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-extrabold border border-purple-200 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <User className="w-4 h-4 text-purple-700" />
              My Profile
            </Link>

            {fees.totalPending > 0 && (
              <Link
                to="/student-dashboard/fees/onlinePay"
                className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                Pay Dues Online
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. Student ID Card */}
      <section className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Student ID Card</h2>
              <p className="text-[10px] font-semibold text-slate-500">Auto generated from student profile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadIdCard}
            className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>

        <div className="p-5 flex flex-wrap justify-center gap-5">
          <div className="w-full max-w-[290px] rounded-2xl border border-indigo-100 bg-white text-slate-900 overflow-hidden shadow-md">
            <div className="bg-indigo-700 text-white p-4 text-center">
              <img src={sarvadnyaLogo} alt="Sarvadnya Vidyapeeth Logo" className="w-12 h-12 rounded-xl object-cover mx-auto mb-2 border-2 border-white/80 bg-white" />
              <p className="text-base font-black leading-tight">Sarvadnya Vidyapeeth</p>
              <p className="text-[10px] uppercase font-black text-indigo-100 tracking-wider mt-1">Student Identity Card</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-center">
                <div className="w-28 h-32 rounded-2xl bg-indigo-50 text-indigo-700 border-2 border-indigo-100 shadow-sm flex items-center justify-center font-black text-3xl overflow-hidden">
                  {hasStudentPhoto ? (
                    <img src={studentPhotoUrl} alt={`${profile.name || "Student"} ID photo`} className="w-full h-full object-cover" />
                  ) : (
                    (profile.name || "S").slice(0, 1).toUpperCase()
                  )}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-black leading-tight">{profile.name || "Student Name"}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">{headerCourse} {headerTerm || ""}</p>
                <span className="inline-flex mt-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase">
                    {isVerified ? "Verified" : "Pending"}
                  </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between gap-3 border-t border-slate-100 pt-2">
                  <span className="font-black text-slate-500">Scholar No</span>
                  <span className="font-mono font-black text-right">{studentIdNumber}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-slate-100 pt-2">
                  <span className="font-black text-slate-500">Enrollment</span>
                  <span className="font-mono font-black text-right truncate">{profile.enrollmentNo || "N/A"}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-slate-100 pt-2">
                  <span className="font-black text-slate-500">Session</span>
                  <span className="font-black text-right">{profile.session || profile.academicSession || "N/A"}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-slate-100 pt-2">
                  <span className="font-black text-slate-500">Department</span>
                  <span className="font-black text-right truncate">{profile.department || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[290px] rounded-2xl border border-indigo-100 bg-white text-slate-900 overflow-hidden shadow-md">
            <div className="bg-slate-900 text-white p-4 text-center">
              <img src={sarvadnyaLogo} alt="Sarvadnya Vidyapeeth Logo" className="w-12 h-12 rounded-xl object-cover mx-auto mb-2 border-2 border-white/80 bg-white" />
              <p className="text-base font-black leading-tight">Sarvadnya Vidyapeeth</p>
              <p className="text-[10px] uppercase font-black text-slate-300 tracking-wider mt-1">ID Card Back Side</p>
            </div>

            <div className="p-5 space-y-4 min-h-[300px]">
              <div>
                <p className="text-xs font-black text-slate-900 text-center mb-2">Instructions</p>
                <ul className="list-disc pl-5 space-y-1.5 text-[11px] font-semibold text-slate-600 leading-relaxed">
                  <li>This card is property of Sarvadnya Vidyapeeth.</li>
                  <li>Student must carry this card inside campus.</li>
                  <li>If found, return to college administration office.</li>
                  <li>Valid only for the printed academic session.</li>
                </ul>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between gap-3 border-t border-slate-100 pt-2">
                  <span className="font-black text-slate-500">Verify ID</span>
                  <span className="font-mono font-black text-right">{studentIdNumber}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-slate-100 pt-2">
                  <span className="font-black text-slate-500">Emergency</span>
                  <span className="font-black text-right">{profile.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-slate-100 pt-2">
                  <span className="font-black text-slate-500">Address</span>
                  <span className="font-black text-right">Patna, Bihar</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-4 py-3 text-center text-[10px] text-slate-500 font-black">
              Authorized Signatory
            </div>
          </div>
        </div>
      </section>

      {/* 2. Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {financialMetrics.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border ${card.border} ${card.bg} p-5 shadow-2xs space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shadow-2xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-600 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200/80">
                  {card.pill}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">
                  Rs. {Number(card.amount || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link
          to="/student-dashboard/fees/onlinePay"
          className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all group flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 group-hover:text-purple-700 transition-colors">Pay Fee Online</p>
            <p className="text-[10px] text-slate-500 font-semibold">Gateway Payments</p>
          </div>
        </Link>

        <Link
          to="/student-dashboard/fees/receipts"
          className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all group flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 group-hover:text-purple-700 transition-colors">Fee Receipts</p>
            <p className="text-[10px] text-slate-500 font-semibold">Download Receipts</p>
          </div>
        </Link>

        <Link
          to="/student-dashboard/fees/ledger"
          className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all group flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <WalletCards className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 group-hover:text-purple-700 transition-colors">Student Ledger</p>
            <p className="text-[10px] text-slate-500 font-semibold">Complete Statement</p>
          </div>
        </Link>

        <Link
          to="/student-dashboard/fees/scholarships"
          className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all group flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 group-hover:text-purple-700 transition-colors">Fee Desk Requests</p>
            <p className="text-[10px] text-slate-500 font-semibold">Scholarship & Refunds</p>
          </div>
        </Link>
      </div>

      {/* 4. Main 2 Data Cards: Recent 5 Ledger & Recent 5 Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Recent Ledger Entries (Max 5 with Show More) */}
        <section className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <WalletCards className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Recent Ledger Entries</h2>
                  <p className="text-[10px] font-semibold text-slate-500">Showing last 5 transaction records</p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                Top 5 Records
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {recentLedger.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  No transaction ledger entries recorded yet.
                </div>
              ) : (
                recentLedger.map((entry, index) => {
                  const isCredit = Number(entry.cr || entry.crAmount || 0) > 0;
                  const amount = Number(entry.cr || entry.crAmount || entry.dr || entry.drAmount || 0);

                  return (
                    <div
                      key={entry.id || `ledger-${index}`}
                      className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-extrabold text-slate-800 truncate">{entry.particulars || "Fee Transaction"}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                          <span>{entry.date || "N/A"}</span>
                          <span>•</span>
                          <span className="uppercase text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                            {entry.voucherType || (isCredit ? "Payment" : "Charge")}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <p className={`font-black text-sm ${isCredit ? "text-emerald-700" : "text-slate-900"}`}>
                          {isCredit ? "+" : ""}Rs. {amount.toLocaleString("en-IN")}
                        </p>
                        <span className={`text-[10px] font-bold ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                          {isCredit ? "Credited (Paid)" : "Debit (Fee Dues)"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Show More Redirect Option */}
          <div className="p-3.5 bg-slate-50/80 border-t border-gray-100 text-center">
            <Link
              to="/student-dashboard/fees/ledger"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-black text-purple-700 hover:text-purple-900 transition-colors py-1 px-3 rounded-xl hover:bg-purple-50 cursor-pointer"
            >
              Show More / View Complete Ledger Statement
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Card 2: Recent Fee Receipts (Max 5 with Show More) */}
        <section className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Recent Fee Receipts</h2>
                  <p className="text-[10px] font-semibold text-slate-500">Showing last 5 generated receipts</p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Top 5 Receipts
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {recentReceipts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  No payment receipts generated yet.
                </div>
              ) : (
                recentReceipts.map((receipt, index) => (
                  <div
                    key={receipt.receiptNo || receipt.id || `receipt-${index}`}
                    className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-purple-950 text-xs">{receipt.receiptNo}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          PAID
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                        <span>{receipt.date || "Recent"}</span>
                        <span>•</span>
                        <span>{receipt.mode || "Online / Cash"}</span>
                        <span>•</span>
                        <span>{receipt.session || "Session 2026"}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <p className="font-black text-sm text-slate-900">
                        Rs. {Number(receipt.amount || 0).toLocaleString("en-IN")}
                      </p>
                      <Link
                        to="/student-dashboard/fees/receipts"
                        className="text-[10px] font-bold text-purple-700 hover:underline flex items-center sm:justify-end gap-0.5 cursor-pointer"
                      >
                        Print Receipt <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Show More Redirect Option */}
          <div className="p-3.5 bg-slate-50/80 border-t border-gray-100 text-center">
            <Link
              to="/student-dashboard/fees/receipts"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-black text-purple-700 hover:text-purple-900 transition-colors py-1 px-3 rounded-xl hover:bg-purple-50 cursor-pointer"
            >
              Show More / View All Fee Receipts
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </div>

      {/* 5. Active Desk Requests Tracker */}
      {requests.length > 0 && (
        <section className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <h2 className="text-sm font-black text-slate-900">Recent Student Desk Requests</h2>
            </div>
            <Link
              to="/student-dashboard/fees/scholarships"
              className="text-xs font-extrabold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {requests.map((req) => (
              <div
                key={`${req.type}-${req.key}`}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="font-extrabold text-slate-800">{req.type}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{req.appliedDate || req.date || "Recent"}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                  {req.status || "Pending Review"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
