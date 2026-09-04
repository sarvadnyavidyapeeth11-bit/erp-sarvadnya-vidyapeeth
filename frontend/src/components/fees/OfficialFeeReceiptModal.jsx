import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, X, Download, FileText, CheckCircle2 } from "lucide-react";
import { studentProfile,
  generateReceiptNumber } from "../../hooks/studentPortalData";
import { getStudentVerifications } from "../../hooks/adminData";

export function numberToWords(num) {
  if (!num || isNaN(num) || num <= 0) return "Rupees Zero Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n) {
    if (n === 0) return "";
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + inWords(n % 10000000) : "");
  }

  const res = inWords(Math.round(num)).trim();
  return `Rupees ${res} Only`;
}

export default function OfficialFeeReceiptModal({ receipt, student, isOpen, onClose }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !receipt) return null;

  // Retrieve comprehensive student profile from verified repository
  const studentRecords = getStudentVerifications();
  const searchKey = String(student?.scholarNo || student?.rollNumber || receipt?.studentRoll || "").trim();
  const foundRecord = studentRecords.find(
    s => (searchKey && (
           String(s.scholarNo || s.rollNumber || "").toLowerCase() === searchKey.toLowerCase() ||
           String(s.enrollmentNo || "").toLowerCase() === searchKey.toLowerCase()
         )) ||
         (student?.name && String(s.studentName || s.name || "").toLowerCase() === String(student.name).toLowerCase()) ||
         (receipt?.studentName && String(s.studentName || s.name || "").toLowerCase() === String(receipt.studentName).toLowerCase())
  ) || {};

  const stuName = student?.name || receipt.studentName || foundRecord.studentName || foundRecord.name || studentProfile.name || "Enrolled Student";
  const stuFather = student?.fatherName || foundRecord.fatherName || foundRecord.guardianName || studentProfile.fatherName || "N/A";
  const stuScholar = student?.scholarNo || student?.rollNumber || foundRecord.scholarNo || foundRecord.rollNumber || receipt.studentRoll || studentProfile.scholarNo || "N/A";
  const stuEnroll = student?.enrollmentNo || foundRecord.enrollmentNo || studentProfile.enrollmentNo || "N/A";
  
  const institutionName = studentProfile.collegeName || "Sarvadnya Vidyapeeth";
  const campusAddress = [
    studentProfile.collegeAddress,
    studentProfile.collegeCity,
    studentProfile.collegeState,
    studentProfile.collegePincode
  ].filter(Boolean).join(", ") || "Main Campus, Knowledge City, Patna, Bihar - 800001";
  
  const stuBatch = student?.batch || foundRecord.batch || studentProfile.batch || "Regular";
  const stuCourse = foundRecord.course || student?.course || studentProfile.course || "Bachelor Of Computer Application (BCA)";
  const stuBranch = foundRecord.department || student?.department || studentProfile.branch || "Department Of Computer Application";
  const stuSemYear = student?.semester || foundRecord.semester || studentProfile.semester || "Session: 2026-2027";
  
  let recNo = receipt.receiptNo || generateReceiptNumber();
  if (typeof recNo === "string" && recNo.startsWith("REC-") && recNo.length > 15) {
    const lastDigits = recNo.replace(/\D/g, "").slice(-4) || "1001";
    recNo = `REC-26-${lastDigits}`;
  }
  const recDate = receipt.receiptDate || receipt.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const recAmount = Number(receipt.totalRecAmount || receipt.amount || 0);
  const recParticulars = receipt.particulars || "Academic Tuition & Institutional Fees";
  const receiptFeeHeads = Array.isArray(receipt.paidFeeHeads) && receipt.paidFeeHeads.length > 0
    ? receipt.paidFeeHeads
    : Array.isArray(receipt.feeHeads) && receipt.feeHeads.length > 0
    ? receipt.feeHeads
    : [];
  const receiptRows = receiptFeeHeads
    .map((head) => ({
      name: head.name || head.headName || head.particulars || "Fee Head",
      amount: Number(head.amount ?? head.collectAmount ?? head.recAmount ?? 0) || 0
    }))
    .filter((head) => head.amount > 0);
  const recMode = receipt.mode || "Physical Cash Deposit at Counter";
  const isCash = recMode.toLowerCase().includes("cash");
  const utrNo = receipt.utrNo || receipt.voucherNo || (isCash ? "N/A (Cash Counter Collection)" : `TXN-${recNo}`);
  const recRemarks = receipt.remarks || `Academic Fee Collection for ${stuName} (${stuScholar}) | Mode: ${recMode}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-start p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Print Stylesheet for Perfect A4 Output */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 10mm 12mm;
            }
            body {
              background: #ffffff !important;
              color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body * {
              visibility: hidden !important;
            }
            #official-fee-receipt-print-area,
            #official-fee-receipt-print-area * {
              visibility: visible !important;
            }
            #official-fee-receipt-print-area {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              border: 2px solid #000000 !important;
              padding: 16px !important;
              margin: 0 !important;
              box-shadow: none !important;
              background: #ffffff !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}} />

        {/* -- Fixed Floating Top Action Toolbar -- */}
        <div className="w-full max-w-3xl flex items-center justify-between bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 mb-4 shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-xs font-black tracking-wide uppercase text-slate-100">
                Official Computer Generated Fees Receipt
              </p>
              <p className="text-[10px] text-slate-400">
                A4 Portrait Format - Ready to Print & Download
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF (A4)
            </button>

            {/* Prominent Cut / Close Button */}
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer shadow-md transition-all active:scale-95"
              title="Close Receipt (Esc)"
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* -- Modal Document Container (A4 Proportional Preview) -- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-300 relative text-black"
        >
          {/* Printable Receipt Paper Container */}
          <div className="p-4 sm:p-8 bg-white select-text">
            <div 
              id="official-fee-receipt-print-area"
              className="border-2 border-black p-4 sm:p-6 space-y-0 text-[11px] sm:text-xs leading-relaxed font-sans text-black bg-white"
            >
              
              {/* -- Top Header with Logo & Institutional Details -- */}
              <div className="flex flex-col sm:flex-row items-center justify-between pb-3 border-b-2 border-black gap-3 sm:gap-4">
                {/* Official Logo & Integrated Institution Branding */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex items-center justify-center">
                    <img
                      src="/sarvadnya_logo.jpg"
                      alt="Sarvadnya Vidyapeeth Logo"
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/Logo/logo.webp";
                      }}
                    />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h1 className="text-xl sm:text-2xl font-black text-purple-950 uppercase tracking-tight leading-none">
                      Sarvadnya Vidyapeeth
                    </h1>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                      Beur-Betauda Road, Anishabad, Patna (Bihar) - 800002
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-600 leading-tight">
                      <span className="font-bold text-purple-900">Helplines:</span> +91 99553 30733 &nbsp;|&nbsp; <span className="font-bold text-purple-900">Email:</span> info@sarvadnyavidyapeeth.in
                    </p>
                  </div>
                </div>

                {/* Fees Receipt Badge */}
                <div className="text-center sm:text-right shrink-0">
                  <span className="inline-block px-3.5 py-1 bg-slate-900 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-md shadow-xs print:border print:border-black print:text-black print:bg-transparent">
                    FEES RECEIPT
                  </span>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                    Official Student Copy
                  </p>
                </div>
              </div>

              {/* -- Student Metadata Details (3 Columns Exact Match) -- */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b-2 border-black text-[11px] sm:text-xs">
                {/* Col 1 */}
                <div className="space-y-1">
                  <p><span className="font-bold">Scholar No. : </span><span className="font-semibold">{stuScholar}</span></p>
                  <p><span className="font-bold">Name of Student : </span><span className="font-semibold uppercase">{stuName}</span></p>
                  <p><span className="font-bold">Father's Name : </span><span className="font-semibold uppercase">{stuFather}</span></p>
                  <p><span className="font-bold">Course : </span><span className="font-semibold">{stuCourse}</span></p>
                  <p><span className="font-bold">Branch : </span><span className="font-semibold">{stuBranch}</span></p>
                </div>

                {/* Col 2 */}
                <div className="space-y-1 sm:text-center">
                  <p><span className="font-bold">Enrollment No. : </span><span className="font-semibold">{stuEnroll}</span></p>
                </div>

                {/* Col 3 */}
                <div className="space-y-1 sm:text-right">
                  <p><span className="font-bold">Batch : </span><span className="font-semibold">{stuBatch}</span></p>
                  <p><span className="font-bold">Receipt No. : </span><span className="font-semibold">{recNo}</span></p>
                  <p><span className="font-bold">Date : </span><span className="font-semibold">{recDate}</span></p>
                </div>
              </div>

              {/* -- Particulars & Amount Table -- */}
              <div className="border-b-2 border-black">
                <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
                  <thead>
                    <tr className="border-b-2 border-black font-black">
                      <th className="py-2 px-1 text-left w-1/2">Particulars</th>
                      <th className="py-2 px-1 text-center w-1/4">Sem/Year:- {stuSemYear}</th>
                      <th className="py-2 px-1 text-right w-1/4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptRows.length > 0 ? (
                      receiptRows.map((row, index) => (
                        <tr key={`${row.name}-${index}`} className="border-b border-gray-300">
                          <td className="py-3 px-1 font-extrabold uppercase">{row.name}</td>
                          <td className="py-3 px-1 text-center font-bold"></td>
                          <td className="py-3 px-1 text-right font-black font-mono">{row.amount.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-1 font-extrabold uppercase">{recParticulars}</td>
                        <td className="py-3 px-1 text-center font-bold"></td>
                        <td className="py-3 px-1 text-right font-black font-mono">{recAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    {/* Spacer for realistic invoice format */}
                    <tr>
                      <td className="py-6 px-1"></td>
                      <td className="py-6 px-1"></td>
                      <td className="py-6 px-1"></td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-black font-black">
                      <td className="py-2 px-1" colSpan={2}>
                        <span className="font-extrabold float-right pr-4">Total Amount</span>
                      </td>
                      <td className="py-2 px-1 text-right font-black font-mono text-xs sm:text-sm">
                        {recAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* -- Amount in Words & Payment Metadata -- */}
              <div className="py-3 border-b-2 border-black space-y-1.5 text-[11px] sm:text-xs">
                <p className="font-black text-black text-xs sm:text-sm">
                  <span className="font-bold">Amount In Words : </span>{numberToWords(recAmount)}
                </p>
                <p><span className="font-bold">Payment By : </span><span className="font-semibold">{recMode}</span></p>
                <p><span className="font-bold">UTR No.: </span><span className="font-mono font-semibold">{utrNo}</span></p>
                <p><span className="font-bold">Payment Date : </span><span className="font-semibold">{recDate}</span></p>
                <p className="truncate">
                  <span className="font-bold">Remarks: </span>
                  <span className="font-medium">{recRemarks}</span>
                </p>

                <div className="pt-6 pb-2 text-right">
                  <span className="font-black uppercase tracking-wider text-[11px] sm:text-xs">RECEIVER'S SIGN.</span>
                </div>
              </div>

              {/* -- Footer Note -- */}
              <div className="pt-2 text-[10px] sm:text-[11px] font-semibold text-black flex items-center justify-between">
                <p><span className="font-bold">Note: - </span>This is a Computer generated receipt,hence no signature is required.</p>
                <p className="font-mono text-[9px] text-slate-500">A4 Document Ref: {recNo}</p>
              </div>

            </div>
          </div>

          {/* Bottom Footer Actions (Hidden on Print) */}
          <div className="bg-slate-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between no-print">
            <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Accounts Audit Record
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Close Window
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt (A4)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}




