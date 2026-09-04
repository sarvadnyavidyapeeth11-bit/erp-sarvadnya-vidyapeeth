import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Tag,
  Award,
  BookOpen,
  Info,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { studentProfile, holidays } from "../../../hooks/studentPortalData";

const academicEvents = [];

export default function AcademicCalendarPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthHolidays = holidays[monthKey] || [];
  const holidayDates = monthHolidays.map((h) => h.date);
  const gazettedDates = monthHolidays.filter((h) => h.type === "gazetted").map((h) => h.date);

  // Academic event days for this month
  const eventDays = academicEvents
    .filter((e) => e.monthKey === monthKey)
    .map((e) => e.day);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const filteredEvents = academicEvents.filter((item) => {
    if (selectedCategory === "All") return true;
    return item.category === selectedCategory;
  });

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="space-y-6 pb-10">
      {/* -- Header -- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-1">
            <CalendarDays className="w-3.5 h-3.5" />`r`n            {studentProfile.collegeName || "Institution"} • Academic Session {studentProfile.session || "Not assigned"}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Calendar & Key Dates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Semester milestones, examination schedules, gazetted holidays & campus activities.
          </p>
        </div>
      </div>

      {/* -- Grid: Interactive Calendar & Event Schedule -- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Mini Calendar View */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-600" />
              {monthName} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-[10px] font-bold text-slate-400 uppercase py-1">
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;

              const isGazetted = gazettedDates.includes(day);
              const isHoliday = !isGazetted && holidayDates.includes(day);
              const isSunday = new Date(year, month, day).getDay() === 0;
              const isEvent = eventDays.includes(day);
              const today = new Date();
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

              return (
                <div
                  key={day}
                  title={
                    isGazetted ? "Gazetted Holiday" :
                    isHoliday ? "Holiday" :
                    isEvent ? "Academic Event" :
                    isSunday ? "Sunday" : ""
                  }
                  className={`relative py-2 text-xs font-semibold rounded-lg transition-colors text-center ${
                    isToday
                      ? "bg-purple-600 text-white font-extrabold ring-2 ring-purple-300"
                      : isGazetted
                        ? "bg-red-600 text-white font-extrabold"
                        : isHoliday
                          ? "bg-orange-100 text-orange-700 font-extrabold"
                          : isSunday
                            ? "bg-slate-100 text-slate-400"
                            : isEvent
                              ? "bg-indigo-50 text-indigo-700 font-bold"
                              : "text-slate-700 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  {day}
                  {/* Gazetted badge */}
                  {isGazetted && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-800 text-white text-[7px] font-black flex items-center justify-center leading-none">G</span>
                  )}
                  {/* Event dot */}
                  {isEvent && !isGazetted && !isHoliday && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500"></span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Legend</p>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-red-600 flex items-center justify-center text-white text-[7px] font-black">G</span>
              <span className="font-semibold text-slate-700">Gazetted Holiday</span>
              <span className="text-slate-400">(Govt. declared)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-orange-100 border border-orange-300"></span>
              <span className="font-semibold text-slate-700">College Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-indigo-50 border border-indigo-200 relative flex items-end justify-center pb-0.5">
                <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
              </span>
              <span className="font-semibold text-slate-700">Academic Event / Exam</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-purple-600"></span>
              <span className="font-semibold text-slate-700">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-slate-100 border border-slate-200"></span>
              <span className="font-semibold text-slate-700">Sunday / Teaching Day</span>
            </div>
          </div>
        </motion.div>

        {/* Right 2 Cols: Milestone Events & Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Category Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["All", "Academic", "Examination", "Holiday", "Event"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {cat} Events
              </button>
            ))}
          </div>

          {/* Events List */}
          <div className="space-y-3">
            {filteredEvents.map((evt) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${evt.badgeColor}`}
                    >
                      {evt.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {evt.date}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">{evt.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{evt.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


