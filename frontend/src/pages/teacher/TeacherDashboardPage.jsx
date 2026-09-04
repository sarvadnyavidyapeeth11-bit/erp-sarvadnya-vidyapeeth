import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileCheck,
  Building2,
  MapPin,
} from "lucide-react";

export default function TeacherDashboardPage() {
  const teacherInfo = {
    name: "Dr. Anjali Sharma",
    designation: "Associate Professor & HOD",
    department: "Computer Applications",
    id: "TCH202401",
    email: "anjali.sharma@svp.edu.in",
    assignedClasses: [
      { course: "BCA", sem: "2nd Sem", subject: "Digital Electronics", room: "Room 104", time: "11:30 AM", students: 48 },
      { course: "BCA", sem: "4th Sem", subject: "Database Management Systems", room: "Lab 2", time: "01:15 PM", students: 52 },
      { course: "BBA", sem: "2nd Sem", subject: "Business IT & Systems", room: "Room 202", time: "02:15 PM", students: 40 },
    ],
    pendingTasks: [
      { id: 1, title: "Mark Attendance for BCA 2nd Sem (Digital Electronics)", due: "Today", urgent: true },
      { id: 2, title: "Upload Mid-Term Internal Marks (BCA 4th Sem DBMS)", due: "12 Aug 2025", urgent: false },
      { id: 3, title: "Submit Monthly Syllabus Completion Report", due: "15 Aug 2025", urgent: false },
    ],
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* -- Header Welcome Banner -- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-900/40"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Faculty ERP Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {teacherInfo.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              {teacherInfo.designation} - {teacherInfo.department} (ID: {teacherInfo.id})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/teacher-dashboard/attendance"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Mark Today's Attendance</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* -- Key Metrics Cards -- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-800">3</p>
            <p className="text-xs text-gray-500 font-medium">Assigned Courses</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-800">140</p>
            <p className="text-xs text-gray-500 font-medium">Total Students</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-800">88.5%</p>
            <p className="text-xs text-gray-500 font-medium">Avg. Attendance</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-800">12 Days</p>
            <p className="text-xs text-gray-500 font-medium">Leave Balance</p>
          </div>
        </div>
      </div>

      {/* -- Two Column Grid: Today's Classes & Pending Tasks -- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Today's Teaching Schedule
            </h2>
            <Link
              to="/teacher-dashboard/timetable"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View Full Timetable <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {teacherInfo.assignedClasses.map((cls, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-extrabold flex flex-col items-center justify-center text-xs shrink-0">
                    <span>{cls.course}</span>
                    <span className="text-[10px] text-indigo-500">{cls.sem}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">{cls.subject}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {cls.room}</span>
                      <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {cls.students} Students</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 justify-between sm:justify-end">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {cls.time}
                  </span>
                  <Link
                    to="/teacher-dashboard/attendance"
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                  >
                    Take Attendance to
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pending Action Items (1 Col) */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" /> Pending Action Tasks
          </h2>

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
            {teacherInfo.pendingTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border text-xs ${
                  task.urgent ? "bg-amber-50/60 border-amber-200" : "bg-gray-50 border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-gray-800 leading-snug">{task.title}</span>
                  {task.urgent && (
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[9px] font-extrabold uppercase shrink-0">
                      Urgent
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Due: {task.due}</span>
                  <Link
                    to={task.title.includes("Attendance") ? "/teacher-dashboard/attendance" : "/teacher-dashboard/marks"}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Complete to
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

