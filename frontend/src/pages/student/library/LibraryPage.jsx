import React, { useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  BookMarked,
  IndianRupee,
  FileText,
  Scale,
  Sparkles,
  Download
} from "lucide-react";
import LibraryLedgerPage from "./LibraryLedgerPage";
import LibraryRulesPage from "./LibraryRulesPage";

export default function LibraryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const routeSubTab = pathParts.length >= 3 && pathParts[1] === "library" ? pathParts[2] : null;
  const activeTab = routeSubTab || searchParams.get("tab") || "search";
  const [bookSearch, setBookSearch] = useState("");

  const tabs = [
    { id: "search", label: "Search Books & Catalog", icon: Search, path: "/student-dashboard/library/search" },
    { id: "issued", label: "Issued Books & Renewals", icon: BookMarked, path: "/student-dashboard/library/issued" },
    { id: "fines", label: "Library Fines & Dues", icon: IndianRupee, path: "/student-dashboard/library/fines" },
    { id: "pyq", label: "Previous Year Papers (PYQ)", icon: FileText, path: "/student-dashboard/library/pyq" },
    { id: "rules", label: "Library Rules & Policy", icon: Scale, path: "/student-dashboard/library/rules" },
  ];

  const catalogBooks = [
    { title: "Introduction to Algorithms (CLRS)", author: "Thomas H. Cormen", category: "Computer Science", availability: "Available (4 Copies)", location: "Rack CS-04" },
    { title: "Database System Concepts", author: "Silberschatz, Korth", category: "Database", availability: "Available (2 Copies)", location: "Rack DB-02" },
    { title: "Operating System Concepts", author: "Galvin, Gagne", category: "Operating Systems", availability: "Issued Out", location: "Rack OS-01" },
    { title: "React & Node Full Stack Development", author: "Robin Wieruch", category: "Web Tech", availability: "Available (6 Copies)", location: "Rack WT-05" }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-gray-200 shadow-sm min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" /> Library Sub-Pages Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Knowledge Repository & Digital Library</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
              Dedicated URL sub-pages for Catalog Search, Issued Books, Overdue Fines & PYQs.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none border-t border-gray-100 pt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200 font-black scale-[1.02]"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Renderers */}
      {activeTab === "search" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-teal-600" /> Dedicated Book Search & Digital Catalog Page
          </h2>
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by book title, author, subject or ISBN..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalogBooks
              .filter(b => b.title.toLowerCase().includes(bookSearch.toLowerCase()) || b.author.toLowerCase().includes(bookSearch.toLowerCase()))
              .map((b, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold text-teal-700 uppercase block">{b.category}</span>
                    <h4 className="font-bold text-gray-900 text-sm">{b.title}</h4>
                    <p className="text-gray-500 mt-0.5">Author: {b.author} - Location: {b.location}</p>
                    <span className={`inline-block mt-1 font-bold ${b.availability.includes("Available") ? "text-emerald-700" : "text-amber-700"}`}>
                      {b.availability}
                    </span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold shadow hover:bg-teal-700">
                    Reserve
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === "issued" && <LibraryLedgerPage />}

      {activeTab === "fines" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4 max-w-lg mx-auto text-center">
          <IndianRupee className="w-12 h-12 text-teal-600 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">Dedicated Overdue Fine Ledger Page</h2>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            Done No Overdue Fines Outstanding! Your account is in good standing.
          </div>
        </div>
      )}

      {activeTab === "pyq" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" /> Dedicated Previous Year Question Papers (PYQ) Page
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600">
              Previous year papers will appear here after library records are published.
            </div>
          </div>
        </div>
      )}

      {activeTab === "rules" && <LibraryRulesPage />}
    </div>
  );
}

