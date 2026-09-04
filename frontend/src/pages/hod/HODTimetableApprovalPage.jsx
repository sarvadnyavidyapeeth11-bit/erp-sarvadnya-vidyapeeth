import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  Printer,
  Download,
  Users,
  BookOpen
} from "lucide-react";
import { getTimetableApprovalStatus, setTimetableApprovalStatus, getTimetableEntries, getActiveHODProfile } from "../../hooks/academicMasterData";

export default function HODTimetableApprovalPage() {
  const [entries, setEntries] = useState(() => getTimetableEntries(getActiveHODProfile().department));
  const [approvalStatus, setApprovalStatus] = useState(() => getTimetableApprovalStatus());
  const [successMsg, setSuccessMsg] = useState("");

  const isApproved = approvalStatus.isApproved;

  const reloadData = () => {
    setEntries(getTimetableEntries(getActiveHODProfile().department));
    setApprovalStatus(getTimetableApprovalStatus());
  };

  useEffect(() => {
    window.addEventListener("academicDataUpdated", reloadData);
    window.addEventListener("timetableUpdated", reloadData);
    window.addEventListener("storage", reloadData);
    return () => {
      window.removeEventListener("academicDataUpdated", reloadData);
      window.removeEventListener("timetableUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  const handleApprove = () => {
    const updated = setTimetableApprovalStatus(true);
    setApprovalStatus(updated);
    setSuccessMsg("Department timetable approved and locked by HOD!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Group only timetable rows explicitly stored in the database.
  const timetable = useMemo(() => {
    const grouped = entries.reduce((result, entry) => {
      const day = entry.day || "Unscheduled";
      if (!result[day]) result[day] = [];
      result[day].push({
        time: [entry.startTime, entry.endTime].filter(Boolean).join(" - "),
        subject: [entry.subjectCode, entry.subjectName].filter(Boolean).join(" "),
        faculty: entry.facultyName || "",
        room: entry.room || "",
        type: entry.type || ""
      });
      return result;
    }, {});
    return Object.entries(grouped).map(([day, slots]) => ({ day, slots }));
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-extrabold border border-purple-200">
              HOD Academic Approval Desk
            </span>
            <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              <span className="inline-block w-2 h-2 rounded-full bg-current mr-1.5" />{isApproved ? "HOD Approved & Live" : "Draft In Review"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Department Timetable & Lab Allocation
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Review weekly class schedule, lab rotations, and grant institutional HOD approval.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Schedule</span>
          </button>

          <button
            onClick={handleApprove}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Lock Timetable</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timetable Weekly Grid */}
      <div className="space-y-4">
        {timetable.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800">No Timetable Scheduled Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Timetable entries will appear after they are published to the department timetable database.
            </p>
          </div>
        ) : (
          timetable.map((dayItem) => (
            <div key={dayItem.day} className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-sm font-black text-purple-950 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  {dayItem.day}
                </span>
                <span className="text-[11px] font-bold text-slate-400">{dayItem.slots.length} Academic Slots</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {dayItem.slots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-gray-100 space-y-1 text-xs hover:border-purple-200 transition-colors"
                  >
                    <span className="text-[10px] font-mono font-bold text-purple-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {slot.time}
                    </span>
                    <p className="font-black text-slate-900 leading-tight">{slot.subject}</p>
                    <p className="text-[11px] text-slate-600 font-semibold">{slot.faculty}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-1">
                      <span>{slot.room}</span>
                      <span className="px-1.5 py-0.5 bg-white rounded border border-gray-200 text-purple-700">
                        {slot.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
