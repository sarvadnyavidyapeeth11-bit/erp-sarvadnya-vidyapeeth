import React, { useState } from "react";
import { BookCopy } from "lucide-react";

export default function LibraryLedgerPage() {
  return (
    <div className="space-y-5">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <BookCopy className="w-6 h-6 text-purple-600" />
          <h1 className="text-xl font-bold text-slate-800">Library Circulation Ledger</h1>
        </div>
        <p className="text-xs text-slate-500">
          History of borrowed books, active loans, reservation queue & due dates.
        </p>

        <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs font-medium border border-slate-100">
          No current active book borrowings found for your Scholar No.
        </div>
      </div>
    </div>
  );
}
