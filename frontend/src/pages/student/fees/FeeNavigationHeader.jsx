import React, { useState, useEffect } from "react";
import {
  IndianRupee,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { getFeeDetails } from "../../../hooks/studentPortalData";

export default function FeeNavigationHeader({ title, description, badge }) {
  const [details, setDetails] = useState(() => getFeeDetails());

  useEffect(() => {
    const handleUpdate = () => {
      setDetails(getFeeDetails());
    };
    window.addEventListener("feeDataUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("feeDataUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const pending = Number(details.totalPending) || 0;
  const hasFeeImposed = (Number(details.totalFees) || 0) > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 sm:w-80 h-full bg-gradient-to-l from-purple-50/70 via-indigo-50/40 to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 relative z-10">
        <div className="min-w-0 text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-purple-100/80 text-purple-800 text-[11px] font-extrabold border border-purple-200/80 inline-flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              {badge || "Student Fee Services"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Financial Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            {title || "Fee & Financial Services"}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {description || "Dedicated portal page for student fee management, claims, and clearances."}
          </p>
        </div>

        {/* Real-time Dues Card */}
        <div className="flex items-center justify-center lg:justify-start gap-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white px-4 sm:px-5 py-3.5 rounded-2xl self-stretch sm:self-start lg:self-auto shrink-0 shadow-md shadow-slate-900/10">
          <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center shadow-inner shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-black text-purple-300 tracking-wider">
              {hasFeeImposed ? "Total Pending Dues" : "Fee Status"}
            </p>
            <p className="text-lg sm:text-2xl font-black text-white leading-tight font-mono break-words">
              {hasFeeImposed ? `Rs.${pending.toLocaleString("en-IN")}` : "Not Imposed"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



