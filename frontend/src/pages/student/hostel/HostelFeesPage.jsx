import React from "react";
import { IndianRupee } from "lucide-react";

export default function HostelFeesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <IndianRupee className="w-6 h-6" /> Hostel & Mess Fee Ledger
        </h1>
        <p className="text-amber-100 text-xs mt-1">Dedicated Page for Annual Residence Fee Breakdown & Payment History</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-gray-500 block font-semibold">Annual Hostel Fee</span>
            <span className="text-lg font-extrabold text-amber-900">Rs. 35,000 / Year</span>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-gray-500 block font-semibold">Paid Hostel Fee</span>
            <span className="text-lg font-extrabold text-emerald-800">Rs. 35,000</span>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-gray-500 block font-semibold">Hostel Dues</span>
            <span className="text-lg font-extrabold text-blue-900">Rs. 0 (Cleared)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

