import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Sparkles } from "lucide-react";

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const teacherSchedule = {
  Monday: [
    { period: 1, time: "09:30 AM - 10:30 AM", course: "BCA 2nd Sem", subject: "Digital Electronics", room: "Room 104", type: "Lecture" },
    { period: 2, time: "10:30 AM - 11:30 AM", course: "BCA 2nd Sem", subject: "Digital Electronics Lab", room: "Hardware Lab", type: "Practical" },
    { period: 3, time: "11:30 AM - 12:30 PM", course: "BCA 2nd Sem", subject: "Digital Electronics Lab", room: "Hardware Lab", type: "Practical" },
    { period: 4, time: "01:15 PM - 02:15 PM", course: "BBA 2nd Sem", subject: "Business IT & Systems", room: "Room 202", type: "Lecture" },
  ],
  Tuesday: [
    { period: 1, time: "09:30 AM - 10:30 AM", course: "BCA 4th Sem", subject: "Database Management Systems", room: "Lab 2", type: "Practical" },
    { period: 2, time: "10:30 AM - 11:30 AM", course: "BCA 4th Sem", subject: "Database Management Systems", room: "Lab 2", type: "Practical" },
    { period: 3, time: "11:30 AM - 12:30 PM", course: "BCA 2nd Sem", subject: "Digital Electronics", room: "Room 104", type: "Lecture" },
  ],
  Wednesday: [
    { period: 1, time: "09:30 AM - 10:30 AM", course: "BBA 2nd Sem", subject: "Business IT & Systems", room: "Room 202", type: "Lecture" },
    { period: 2, time: "10:30 AM - 11:30 AM", course: "BCA 2nd Sem", subject: "Digital Electronics", room: "Room 104", type: "Lecture" },
    { period: 4, time: "01:15 PM - 02:15 PM", course: "BCA 4th Sem", subject: "Database Management Systems", room: "Room 105", type: "Lecture" },
  ],
  Thursday: [
    { period: 1, time: "09:30 AM - 10:30 AM", course: "BCA 2nd Sem", subject: "Digital Electronics", room: "Room 104", type: "Lecture" },
    { period: 3, time: "11:30 AM - 12:30 PM", course: "BCA 4th Sem", subject: "DBMS Tutorial", room: "Room 105", type: "Tutorial" },
    { period: 4, time: "01:15 PM - 02:15 PM", course: "BBA 2nd Sem", subject: "Business IT & Systems", room: "Room 202", type: "Lecture" },
  ],
  Friday: [
    { period: 1, time: "09:30 AM - 10:30 AM", course: "BCA 4th Sem", subject: "Database Management Systems", room: "Room 105", type: "Lecture" },
    { period: 2, time: "10:30 AM - 11:30 AM", course: "BCA 2nd Sem", subject: "Digital Electronics", room: "Room 104", type: "Lecture" },
    { period: 5, time: "02:15 PM - 03:15 PM", course: "Department Meet", subject: "HOD & Faculty Sync", room: "Conference Room", type: "Meeting" },
  ],
  Saturday: [
    { period: 1, time: "09:30 AM - 10:30 AM", course: "Mentorship", subject: "Student Doubt & Counseling", room: "Faculty Room 3", type: "Mentorship" },
    { period: 2, time: "10:30 AM - 11:30 AM", course: "BCA All", subject: "Weekly Department Quiz", room: "Seminar Hall 1", type: "Activity" },
  ],
};

export default function TeacherTimetablePage() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const currentSchedule = teacherSchedule[selectedDay] || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* -- Page Header Banner -- */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Faculty Schedule
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Teacher Teaching Timetable
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Weekly assigned lectures, lab practicals, and department meetings.
          </p>
        </div>
      </div>

      {/* -- Day Tabs -- */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dayNames.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedDay === day
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* -- Timetable Card -- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-5">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-indigo-600" /> {selectedDay}'s Class Schedule
        </h2>

        {currentSchedule.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No lectures or practicals scheduled for {selectedDay}.
          </div>
        ) : (
          <div className="space-y-3">
            {currentSchedule.map((cls, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    P{cls.period}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">{cls.subject}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 inline-flex items-center gap-1.5">
                      <span>{cls.course}</span>
                      <span>-</span>
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{cls.room}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                    {cls.type}
                  </span>
                  <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {cls.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

