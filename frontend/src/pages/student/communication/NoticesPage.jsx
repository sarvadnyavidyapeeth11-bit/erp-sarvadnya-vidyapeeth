import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, Tag, AlertCircle, Info, Sparkles, Filter } from "lucide-react";
import { notices, studentProfile } from "../../../hooks/studentPortalData";

export default function NoticesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredNotices = notices.filter((n) => {
    if (selectedCategory === "All") return true;
    return n.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-1">
            <Bell className="w-3.5 h-3.5" />
            Sarvadnya Vidyapeeth Notice Board
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Official Announcements & Notices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with academic notices, exam circulars, fee deadlines, & campus updates.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", "Examination", "Fees", "Placement", "Academic", "Event", "Library"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filteredNotices.map((notice) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl border p-5 shadow-sm space-y-2 transition-all ${notice.important
                ? "border-amber-300 ring-1 ring-amber-200/60 bg-amber-50/20"
                : "border-slate-200 hover:border-purple-200"
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                  {notice.category}
                </span>
                {notice.important && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Important
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {notice.date}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-800">{notice.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{notice.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
