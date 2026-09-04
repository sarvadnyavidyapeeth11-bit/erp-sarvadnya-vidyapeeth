import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar
} from "lucide-react";
import FeeNavigationHeader from "./FeeNavigationHeader";
import { studentProfile, getFeeDetails } from "../../../hooks/studentPortalData";

export default function FeeTaxCertificatePage() {
  const [details, setDetails] = useState(() => getFeeDetails());

  useEffect(() => {
    const reloadDetails = () => setDetails(getFeeDetails());
    window.addEventListener("feeDataUpdated", reloadDetails);
    window.addEventListener("bankChallansUpdated", reloadDetails);
    window.addEventListener("scholarshipDataUpdated", reloadDetails);
    window.addEventListener("concessionDataUpdated", reloadDetails);
    window.addEventListener("refundDataUpdated", reloadDetails);
    window.addEventListener("storage", reloadDetails);
    return () => {
      window.removeEventListener("feeDataUpdated", reloadDetails);
      window.removeEventListener("bankChallansUpdated", reloadDetails);
      window.removeEventListener("scholarshipDataUpdated", reloadDetails);
      window.removeEventListener("concessionDataUpdated", reloadDetails);
      window.removeEventListener("refundDataUpdated", reloadDetails);
      window.removeEventListener("storage", reloadDetails);
    };
  }, []);

  const parseReceiptDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    const parts = String(value).split(/[\/\-\s]+/).filter(Boolean);
    if (parts.length >= 3) {
      const normalized = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
      return Number.isNaN(normalized.getTime()) ? null : normalized;
    }
    return null;
  };

  const taxCertificates = Object.values((details.receipts || []).reduce((acc, receipt) => {
    const amount = Number(receipt.paidAmount || receipt.amount || receipt.crAmount || 0);
    if (amount <= 0) return acc;
    const paidDate = parseReceiptDate(receipt.receiptDate || receipt.date);
    const year = paidDate?.getFullYear() || new Date().getFullYear();
    const month = paidDate?.getMonth() || 0;
    const startYear = month >= 3 ? year : year - 1;
    const fy = `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
    const existing = acc[fy] || {
      year: fy,
      paidAmount: 0,
      certNo: `TAX-80C-${startYear + 1}-${studentProfile.rollNumber || studentProfile.scholarNo || "STUDENT"}`,
      issueDate: paidDate || null
    };
    existing.paidAmount += amount;
    if (paidDate && (!existing.issueDate || paidDate > existing.issueDate)) existing.issueDate = paidDate;
    acc[fy] = existing;
    return acc;
  }, {})).map((cert) => ({
    ...cert,
    issueDate: cert.issueDate
      ? cert.issueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "Not issued"
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <FeeNavigationHeader
        title="Annual Tuition Fee Tax Certificate (Section 80C)"
        description="Official income tax rebate tuition fee certificate for parent tax filing under IT Act Section 80C."
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Income Tax Certificate Download</h3>
            <p className="text-xs text-slate-500 font-semibold">Valid certificate signed by Accounts Officer & Finance Comptroller</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              disabled={!taxCertificates.length}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-200 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Tax Certificate
            </button>
          </div>
        </div>

        {/* Certificate Display Table */}
        <div className="space-y-3 pt-2">
          {taxCertificates.length ? taxCertificates.map((cert) => (
            <div
              key={cert.certNo}
              className="p-5 rounded-2xl border border-gray-200 bg-slate-50/70 hover:bg-white hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold border border-purple-200">
                  {cert.certNo}
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">{cert.year} Tuition Fee Receipt Summary</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Parent / Guardian: {studentProfile.fatherName}</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6">
                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-black">Eligible Tuition Fee (80C)</p>
                  <p className="text-lg font-black text-emerald-600">Rs.{cert.paidAmount.toLocaleString("en-IN")}</p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold border border-gray-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-purple-600" /> PDF Download
                </button>
              </div>
            </div>
          )) : (
            <div className="p-4 sm:p-6 rounded-2xl border border-dashed border-gray-300 bg-slate-50 text-center">
              <p className="text-sm font-black text-slate-800">No eligible paid receipts found.</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Tax certificate will appear after cleared fee receipts are available in the ledger.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

