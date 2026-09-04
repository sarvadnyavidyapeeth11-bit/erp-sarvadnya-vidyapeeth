import React, { useState } from "react";
import { Scale, BookOpen } from "lucide-react";
export default function LibraryRulesPage() {
  return (
    <div className="space-y-5">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Scale className="w-6 h-6 text-purple-600" />
          <h1 className="text-xl font-bold text-slate-800">Library Rules & Code of Conduct</h1>
        </div>
        <p className="text-xs text-slate-500">
          General regulations for borrowing, reading room discipline, and overdue policy.
        </p>

        <ul className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <li>- Maximum 3 books can be issued at a time for up to 14 days.</li>
          <li>- Overdue fine of Rs.5/day per book applies for delayed returns.</li>
          <li>- Maintain silence in the reading room at all times.</li>
        </ul>
      </div>
    </div>
  );
}

