import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { weekTimetable, studentProfile } from "../../../hooks/studentPortalData";
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const currentTimetable = (weekTimetable && weekTimetable[selectedDay]) || [];
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Class Time Table</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {studentProfile.course} - {studentProfile.semester} - Section {studentProfile.section} - {studentProfile.session}
        </p>
      </div>

      {/* Session Selectors */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Session</label>
            <select className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer">
              <option>{studentProfile.session || "Not assigned"}</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Academic Session</label>
            <select className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer">
              <option>{studentProfile.academicSession || studentProfile.session || "Not assigned"}</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Day Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1.5 overflow-x-auto pb-1"
      >
        {dayNames.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedDay === day
              ? "bg-purple-600 text-white shadow-md shadow-purple-200"
              : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
          >
            {day}
          </button>
        ))}
      </motion.div>

      {/* Timetable */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 bg-gray-50/60">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            {selectedDay}'s Schedule
          </h2>
        </div>
        {currentTimetable.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No classes scheduled for {selectedDay}.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {currentTimetable.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-4 py-3 hover:bg-purple-50/30 transition-colors"
              >
                {/* Period Number */}
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  P{row.period}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-700">{row.subject}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {row.time}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 hidden sm:flex">
                      <User className="w-3 h-3" />
                      {row.faculty}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {row.room}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}



