import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  IndianRupee,
  Send,
  Upload,
  Sparkles,
  Info,
  ShieldCheck,
  Building,
  AlertCircle,
  XCircle,
  ExternalLink
} from "lucide-react";
import FeeNavigationHeader from "./FeeNavigationHeader";
import {
  getFeeDetails,
  getScholarshipApplications,
  studentProfile,
  submitStudentScholarship
} from "../../../hooks/studentPortalData";
import { openDocumentInNewTab } from "../../../utils/openDocumentInNewTab";

const collegeDocs = [
  { name: "Scholarship Bonafide Certificate", desc: "Official institutional bonafide certificate for scholarship portals" },
  { name: "College Fee Structure", desc: "Authenticated itemized annual fee breakdown" },
  { name: "Fee Certificate / Demand Letter", desc: "Formal college fee demand letter on official letterhead" },
  { name: "Enrollment / Admission Certificate", desc: "Valid student enrollment proof with session verification" }
];

const requiredDocs = [
  "Scholarship Portal Sanction / Approval Message",
  "College Account Credit Message Screenshot",
  "UTR / Transaction Bank Reference Proof",
  "Student Government Identity Proof (Aadhaar/ID)"
];

const makeCollegeDoc = (name) => ({
  docName: name,
  savedFile: `${name.replace(/\s+/g, "_")}.html`,
  fileType: "text/html",
  fileUrl: `data:text/html;charset=utf-8,${encodeURIComponent(`
    <html><head><title>${name}</title><style>body{font-family:Arial,sans-serif;padding:40px;line-height:1.6;color:#0f172a}h1{font-size:22px;color:#4338ca}.box{border:2px solid #cbd5e1;padding:24px;border-radius:12px;margin-top:20px;background:#f8fafc}.row{margin-bottom:10px;font-size:14px}b{color:#1e293b}</style></head>
    <body>
      <h1>Sarvadnya Vidyapeeth - ${name}</h1>
      <div class="box">
        <div class="row"><b>Student Name:</b> ${studentProfile.name || "Not available"}</div>
        <div class="row"><b>Scholar No / Roll No:</b> ${studentProfile.scholarNo || studentProfile.rollNumber || "Not available"}</div>
        <div class="row"><b>Enrollment No:</b> ${studentProfile.enrollmentNo || "Not available"}</div>
        <div class="row"><b>Course & Semester:</b> ${studentProfile.course || "Not available"} ${studentProfile.semester || ""}</div>
        <div class="row"><b>Academic Session:</b> ${studentProfile.session || "Not available"}</div>
        <hr style="border:none;border-top:1px dashed #cbd5e1;margin:18px 0;" />
        <p style="margin:0;font-size:13px;color:#64748b;">This college-issued document is generated for official scholarship verification and fee adjustment.</p>
      </div>
    </body></html>`)}`
});

const readFile = (file, docName, onDone) => {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    window.alert("File size 2 MB se kam rakhein.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => onDone({
    id: `${docName.replace(/\s+/g, "-").toUpperCase()}-${Date.now()}`,
    docName,
    savedFile: file.name,
    fileUrl: event.target.result,
    fileType: file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/png"),
    status: "Submitted",
    submittedOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  });
  reader.readAsDataURL(file);
};

export default function FeeScholarshipsPage() {
  const [applications, setApplications] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    amountReceived: "",
    utrNumber: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    bankName: "",
    paymentProof: null
  });
  const [submittedAlert, setSubmittedAlert] = useState(false);
  const feeState = getFeeDetails();
  const profileScholarshipId = String(
    studentProfile.scholarshipUniqueId ||
    studentProfile.scholarshipApplicationId ||
    studentProfile.schemeApplicationNo ||
    ""
  ).trim();

  const reload = () => setApplications(getScholarshipApplications());

  useEffect(() => {
    reload();
    window.addEventListener("scholarshipDataUpdated", reload);
    window.addEventListener("feeDataUpdated", reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener("scholarshipDataUpdated", reload);
      window.removeEventListener("feeDataUpdated", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  useEffect(() => {
    setPaymentForm((prev) => ({
      ...prev,
      bankName: prev.bankName || studentProfile.bankName || ""
    }));
  }, [profileScholarshipId]);

  const identifiers = [
    studentProfile.rollNumber,
    studentProfile.scholarNo,
    studentProfile.enrollmentNo,
    studentProfile.id
  ].filter(Boolean).map(String);

  const mine = useMemo(() => applications.filter((app) => (
    !String(app.disbursementTo || app.paymentDestination || "").includes("Student Account") &&
    (
      identifiers.includes(String(app.rollNumber || "")) ||
      identifiers.includes(String(app.scholarNo || app.enrollmentNo || app.studentId || ""))
    )
  )), [applications]);

  const latest = mine[0] || null;
  const scholarshipStatus = latest?.status || "Not Started";

  const updatePayment = (key, value) => setPaymentForm((prev) => ({ ...prev, [key]: value }));

  const submitPayment = (event) => {
    event.preventDefault();
    if (!profileScholarshipId) {
      window.alert("Pehle My Profile me Scholarship Registration / Application ID save karein.");
      return;
    }
    const amountReceived = Number(paymentForm.amountReceived) || 0;
    if (amountReceived <= 0 || !paymentForm.paymentProof?.fileUrl) {
      window.alert("Amount, UTR/date aur credit message screenshot valid hona chahiye.");
      return;
    }
    const submitted = submitStudentScholarship({
      name: "College Account Scholarship Credit",
      category: studentProfile.category || "General",
      requestedAmount: amountReceived,
      schemeApplicationNo: profileScholarshipId,
      bankName: paymentForm.bankName,
      accountNo: studentProfile.accountNo || "",
      ifscCode: studentProfile.ifscCode || "",
      utrNumber: paymentForm.utrNumber,
      paymentDate: paymentForm.paymentDate,
      transferMode: "NEFT/RTGS",
      disbursementTo: "College Account",
      documents: [paymentForm.paymentProof],
      benefitType: "Scholarship Direct Transfer to College Account",
      officerRemarks: "Scholarship college-account payment submitted for fee adjustment."
    });
    if (!submitted) {
      window.alert(`Amount Rs 1 se Rs ${(feeState.totalPending || 0).toLocaleString("en-IN")} ke beech hona chahiye.`);
      return;
    }
    setSubmittedAlert(true);
    setPaymentForm({
      amountReceived: "",
      utrNumber: "",
      paymentDate: new Date().toISOString().slice(0, 10),
      bankName: studentProfile.bankName || "",
      paymentProof: null
    });
    reload();
    setTimeout(() => setSubmittedAlert(false), 5000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
      <FeeNavigationHeader
        title="Scholarship & Direct Credit Fee Adjustment"
        description="Download authenticated college documents for state/national scholarship portals and submit college-account credit receipts for fee adjustments."
        badge="Scholarship Wing"
      />

      {submittedAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Scholarship credit proof successfully submitted. The Fee Officer will audit and adjust the fee ledger.
          </span>
          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
            Transmitted
          </span>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Scholarship Status</p>
            <p className="text-lg font-black text-slate-900 truncate mt-0.5">{scholarshipStatus}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6 text-rose-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Current Fee Due</p>
            <p className="text-lg font-black text-rose-700 font-mono truncate mt-0.5">
              Rs.{(feeState.totalPending || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => document.getElementById("scholarship-docs")?.scrollIntoView({ behavior: "smooth" })}
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 hover:from-blue-100/80 hover:to-indigo-100/80 border border-blue-200/80 text-left transition-all cursor-pointer shadow-xs flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">College Documents</p>
            <p className="text-sm font-black text-slate-900">Download ({collegeDocs.length}) Forms</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => document.getElementById("scholarship-form")?.scrollIntoView({ behavior: "smooth" })}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 hover:from-emerald-100/80 hover:to-teal-100/80 border border-emerald-200/80 text-left transition-all cursor-pointer shadow-xs flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Credit Fee Adjustment</p>
            <p className="text-sm font-black text-slate-900">Submit Bank Proof</p>
          </div>
        </button>
      </div>

      {/* College Documents & Required Checklist Row */}
      <div id="scholarship-docs" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Downloadable College Docs */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
              <Download className="w-5 h-5 text-blue-600" />
              Download College Issued Documents
            </h3>
            <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Instantly Generated
            </span>
          </div>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            These documents are auto-filled with your verified enrollment data and ready to upload on NSP, State Portal, or Post-Matric portals.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {collegeDocs.map((doc) => (
              <div
                key={doc.name}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="leading-snug">{doc.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 pl-6">{doc.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openDocumentInNewTab(makeCollegeDoc(doc.name))}
                  className="w-full py-2 px-3 rounded-lg bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white font-extrabold text-xs border border-blue-200 group-hover:border-blue-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" /> View & Print Document
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Checklist Requirements */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-purple-600" />
                Required Proofs for Adjustment
              </h3>
              <span className="text-[11px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Checklist
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Ensure you have the following clear proofs ready before submitting your fee adjustment claim:
            </p>
            <div className="space-y-2.5">
              {requiredDocs.map((name) => (
                <div
                  key={name}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs font-bold text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 font-semibold flex items-start gap-2 mt-4">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Only scholarship disbursements directly deposited to the College Bank Account can be adjusted against tuition/hostel fees.</span>
          </div>
        </div>
      </div>

      {/* Main Submission Form & Records Section */}
      <div id="scholarship-form" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
              College Account Credit / Fee Adjustment
            </h3>
            <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Direct Adjustment
            </span>
          </div>

          {/* Student Profile Info Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Student Name</p>
              <p className="font-extrabold text-slate-900 truncate">{studentProfile.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Scholar / Roll</p>
              <p className="font-extrabold text-slate-900 font-mono truncate">{studentProfile.scholarNo || studentProfile.rollNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Course</p>
              <p className="font-extrabold text-slate-900 truncate">{studentProfile.course || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Mobile</p>
              <p className="font-extrabold text-slate-900 font-mono truncate">{studentProfile.phone || "N/A"}</p>
            </div>
          </div>

          <form onSubmit={submitPayment} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-800 mb-1.5">
                Scholarship Application / Registration ID (From Profile) <span className="text-rose-500">*</span>
              </label>
              <input
                required
                readOnly
                value={profileScholarshipId}
                placeholder="Saved in My Profile (e.g. NSP-2025-XXXXX)"
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl font-bold font-mono text-slate-800 focus:outline-none cursor-not-allowed"
              />
              {!profileScholarshipId && (
                <p className="mt-1 text-[11px] font-bold text-rose-600">
                  Please update your Scholarship Registration ID in My Profile first.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  Amount Received / Released (Rs.) <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  value={paymentForm.amountReceived}
                  onChange={(e) => updatePayment("amountReceived", e.target.value)}
                  placeholder="e.g. 45000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold font-mono text-slate-900 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  Payment / Credit Date <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => updatePayment("paymentDate", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold text-slate-900 text-sm transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  UTR / Transaction Bank Ref <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={paymentForm.utrNumber}
                  onChange={(e) => updatePayment("utrNumber", e.target.value)}
                  placeholder="e.g. SBIN192837465"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold font-mono text-slate-900 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  Bank Name (Disbursing Bank)
                </label>
                <input
                  value={paymentForm.bankName}
                  onChange={(e) => updatePayment("bankName", e.target.value)}
                  placeholder="e.g. State Bank of India"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold text-slate-900 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-800 mb-1.5">
                Upload Credit Message / Bank Advice Screenshot <span className="text-rose-500">*</span>
              </label>
              <label className="flex items-center justify-between gap-3 w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 border border-dashed border-slate-300 rounded-xl cursor-pointer transition-all">
                <span className="text-slate-700 font-bold truncate">
                  {paymentForm.paymentProof?.savedFile || "Choose PDF, JPG, PNG (Max 2MB)"}
                </span>
                <Upload className="w-4 h-4 text-purple-600 shrink-0" />
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => readFile(e.target.files?.[0], "Scholarship College Account Credit Message Screenshot", (doc) => updatePayment("paymentProof", doc))}
                  className="hidden"
                />
              </label>
              {paymentForm.paymentProof && (
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => openDocumentInNewTab(paymentForm.paymentProof)}
                    className="text-purple-700 hover:text-purple-900 font-bold inline-flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview Attached Screenshot
                  </button>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    File Attached
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Send className="w-4 h-4" /> Submit Scholarship Credit Proof
            </button>
          </form>
        </div>

        {/* Right Column: History Records */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
              <Award className="w-5 h-5 text-purple-600" />
              My Scholarship Records
            </h3>
            <span className="text-[11px] font-mono font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {mine.length} Records
            </span>
          </div>

          <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
            {mine.length === 0 ? (
              <div className="py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Award className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">No scholarship records submitted yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  When you submit your scholarship credit details, the approval tracking and ledger adjustments will appear here.
                </p>
              </div>
            ) : (
              mine.map((app) => {
                const isApproved = String(app.status || "").includes("Approved") || String(app.status || "").includes("Adjusted");
                const isRejected = String(app.status || "").includes("Rejected");

                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition-all text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-sm">{app.schemeApplicationNo || app.id}</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : isRejected
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {app.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-slate-500">Destination</p>
                        <p className="font-bold text-slate-800">{app.disbursementTo || "College Account"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-slate-500">Amount Received</p>
                        <p className="font-mono font-black text-slate-900">
                          Rs.{(app.requestedAmount || app.sanctionedAmount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-slate-500">Fee Adjusted</p>
                        <p className="font-mono font-black text-emerald-700">
                          Rs.{(app.feeAdjustedAmount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-slate-500">Refundable Excess</p>
                        <p className="font-mono font-black text-blue-700">
                          Rs.{(app.excessScholarshipAmount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-slate-500">Pending Dues</p>
                        <p className="font-mono font-black text-rose-700">
                          Rs.{(feeState.totalPending || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-slate-500">UTR / Ref</p>
                        <p className="font-mono font-bold text-slate-800 truncate">{app.utrNumber || "N/A"}</p>
                      </div>
                    </div>

                    {app.officerRemarks && (
                      <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-[11px] text-purple-900 font-semibold flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>{app.officerRemarks}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
