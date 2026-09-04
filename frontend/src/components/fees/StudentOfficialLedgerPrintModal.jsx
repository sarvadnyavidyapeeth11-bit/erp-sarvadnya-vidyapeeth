import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Printer, Download, X } from "lucide-react";
import { studentProfile, feeDetails } from "../../hooks/studentPortalData";

export default function StudentOfficialLedgerPrintModal({ isOpen, onClose, ledgerEntries = [], session = "" }) {
  const printRef = useRef(null);

  if (!isOpen) return null;

  // Calculate totals
  const totalDr = ledgerEntries.reduce((acc, curr) => acc + (Number(curr.dr) || 0), 0);
  const totalCr = ledgerEntries.reduce((acc, curr) => acc + (Number(curr.cr) || 0), 0);
  const totalRefDr = ledgerEntries.reduce((acc, curr) => acc + (Number(curr.refDr) || 0), 0);
  const totalRefCr = ledgerEntries.reduce((acc, curr) => acc + (Number(curr.refCr) || 0), 0);
  const balance = totalDr - totalCr;
  const institutionName = studentProfile.collegeName || "Sarvadnya Vidyapeeth";
  const campusAddress = [
    studentProfile.collegeAddress,
    studentProfile.collegeCity,
    studentProfile.collegeState,
    studentProfile.collegePincode
  ].filter(Boolean).join(", ") || "Main Campus, Knowledge City, Patna, Bihar - 800001";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* Container Box */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-gray-300 overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Top Control Bar (Screen only, hidden on print) */}
        <div className="print:hidden p-4 bg-slate-100 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider">
              Official University Ledger
            </span>
            <span className="text-xs text-slate-600 font-bold">
              Session: {session}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print Statement
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-gray-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div
          ref={printRef}
          className="p-6 sm:p-10 bg-white text-black font-sans overflow-y-auto flex-1 text-[13px] leading-normal"
        >
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .printable-ledger-doc, .printable-ledger-doc * {
                visibility: visible;
              }
              .printable-ledger-doc {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 15mm;
              }
            }
          `}</style>

          <div className="printable-ledger-doc space-y-4">
            {/* Header: University Name, Logo & Session */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 shrink-0 bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex items-center justify-center">
                  <img
                    src="/sarvadnya_logo.jpg"
                    alt="Institution Logo"
                    className="w-full h-full object-contain rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/Logo/logo.webp";
                    }}
                  />
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-purple-950 uppercase leading-none">
                    Sarvadnya Vidyapeeth
                  </h1>
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">
                    Beur-Betauda Road, Anishabad, Patna (Bihar) - 800002
                  </p>
                  <p className="text-[10px] font-semibold text-slate-600 leading-tight">
                    <span className="font-bold text-purple-900">Helplines:</span> +91 99553 30733 &nbsp;|&nbsp; <span className="font-bold text-purple-900">Email:</span> info@sarvadnyavidyapeeth.in
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-md print:border print:border-black print:text-black print:bg-transparent">
                  OFFICIAL LEDGER
                </span>
                <p className="text-[10px] font-bold text-slate-600 mt-0.5">
                  Session : {session}
                </p>
              </div>
            </div>

            {/* Student Profile Info Grid */}
            <div className="text-xs text-black space-y-1.5">
              <div className="flex justify-between items-center">
                <p>
                  <span className="font-bold">Student : </span>
                  {studentProfile.name || "Not available"}
                </p>
                <p className="text-right">
                  <span className="font-bold">Class : </span>
                  {studentProfile.courseClass || "Not available"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <p>
                  <span className="font-bold">ERP Scholar No. : </span>
                  {studentProfile.scholarNo || "Not available"}
                </p>
                <p>
                  <span className="font-bold">Gender : </span>
                  {studentProfile.gender || "Not available"}
                </p>
                <p className="sm:text-right">
                  <span className="font-bold">Category : </span>
                  {studentProfile.category || "Not available"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <p>
                  <span className="font-bold">Enrollment No. : </span>
                  {studentProfile.enrollmentNo || "Not available"}
                </p>
                <p>
                  <span className="font-bold">Student Type : </span>
                  Non Hosteler
                </p>
                <p className="sm:text-right">
                  <span className="font-bold">Mobile No : </span>
                  {studentProfile.phone || "Not available"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  <span className="font-bold">Father Name : </span>
                  {studentProfile.fatherName || "Not available"}
                </p>
                <p className="sm:text-right">
                  <span className="font-bold">Mother Name : </span>
                  {studentProfile.motherName || "Not available"}
                </p>
              </div>
            </div>

            <div className="border-b-2 border-black" />

            {/* Ledger Transactions Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-black font-bold text-black">
                  <th className="py-2 px-2 w-28">Date Of Entry</th>
                  <th className="py-2 px-2">Remarks</th>
                  <th className="py-2 px-2 text-right w-32">Dr. Amount</th>
                  <th className="py-2 px-2 text-right w-32">Cr. Amount</th>
                  <th className="py-2 px-2 text-right w-32">Refundable Dr.</th>
                  <th className="py-2 px-2 text-right w-32">Refundable Cr.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ledgerEntries.map((row) => (
                  <tr key={row.id} className="text-black">
                    <td className="py-2 px-2 align-top font-mono text-[11px]">
                      {row.dateSlash || row.date}
                    </td>
                    <td className="py-2 px-2 align-top text-[11px] font-medium leading-snug">
                      {row.remarks}
                    </td>
                    <td className="py-2 px-2 align-top text-right font-mono text-[11px]">
                      {row.dr ? Number(row.dr).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
                    </td>
                    <td className="py-2 px-2 align-top text-right font-mono text-[11px]">
                      {row.cr ? Number(row.cr).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
                    </td>
                    <td className="py-2 px-2 align-top text-right font-mono text-[11px]">
                      {row.refDr ? Number(row.refDr).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
                    </td>
                    <td className="py-2 px-2 align-top text-right font-mono text-[11px]">
                      {row.refCr ? Number(row.refCr).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & Balance Summary */}
            <div className="pt-2">
              <div className="border-t border-black flex justify-end py-1.5 text-xs font-bold font-mono">
                <div className="w-32 text-right px-2">
                  {totalDr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <div className="w-32 text-right px-2">
                  {totalCr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <div className="w-32 text-right px-2">
                  {totalRefDr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <div className="w-32 text-right px-2">
                  {totalRefCr.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex justify-end items-center pt-2">
                <span className="font-bold text-xs mr-16">{totalRefCr > 0 ? "Balance / Refundable" : "Balance"}</span>
                <div className="w-32 text-right px-2 font-bold font-mono text-xs border-b-2 border-black pb-1">
                  {balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  {totalRefCr > 0 && ` / ${totalRefCr.toLocaleString("en-IN", { minimumFractionDigits: 2 })} Cr.`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


