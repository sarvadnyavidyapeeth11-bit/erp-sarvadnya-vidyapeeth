import React, { useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  UserCheck,
  FileText,
  Video,
  ClipboardList,
  Calendar,
  Download,
  Play,
  Layers,
  Sparkles,
  Search,
  BookOpenCheck,
  BarChart3
} from "lucide-react";
import { academicsData } from "../../../hooks/studentExtendedData";
import { studentProfile } from "../../../hooks/studentPortalData";
import AcademicCalendarPage from "./AcademicCalendarPage";
import CourseRegistrationPage from "./CourseRegistrationPage";

export default function AcademicsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const routeSubTab = pathParts.length >= 3 && pathParts[1] === "academics" ? pathParts[2] : null;
  const activeTab = routeSubTab || searchParams.get("tab") || "attendance";
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    { id: "attendance", label: "Attendance Record", icon: BarChart3, path: "/student-dashboard/attendance" },
    { id: "timetable", label: "Class Timetable", icon: Calendar, path: "/student-dashboard/timetable" },
    { id: "subjects", label: "Subjects & Faculty", icon: BookOpen, path: "/student-dashboard/academics/subjects" },
    { id: "registration", label: "Course Registration", icon: BookOpenCheck, path: "/student-dashboard/academics/registration" },
    { id: "syllabus", label: "Syllabus & Lesson Plan", icon: Layers, path: "/student-dashboard/academics/syllabus" },
    { id: "study-material", label: "Study Material & Notes", icon: FileText, path: "/student-dashboard/academics/study-material" },
    { id: "lectures", label: "Recorded Lectures & LMS", icon: Video, path: "/student-dashboard/academics/lectures" },
    { id: "assignments", label: "Assignments & Quizzes", icon: ClipboardList, path: "/student-dashboard/academics/assignments" },
    { id: "calendar", label: "Academic Calendar", icon: Calendar, path: "/student-dashboard/academics/calendar" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-gray-200 shadow-sm min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" /> Academics Dedicated Sub-Pages
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Academic Management & Learning</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
              Dedicated URL pages for Course Registration, Subjects, Syllabus, Study Material, LMS & Assignments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-purple-50/70 border border-purple-100 px-4 py-2 rounded-xl text-center">
              <p className="text-[10px] uppercase font-extrabold text-purple-700 tracking-wider">Current Semester</p>
              <p className="text-base font-black text-slate-900">{[studentProfile.semester, studentProfile.course].filter(Boolean).join(" ") || "Not assigned"}</p>
            </div>
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

      {/* Dedicated Page View Rendering */}
      {activeTab === "registration" && <CourseRegistrationPage />}

      {activeTab === "subjects" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search subject or faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-gray-500 font-semibold">
              Showing {academicsData.subjects.length} Enrolled Courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {academicsData.subjects
              .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.faculty.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((subject, idx) => (
                <motion.div
                  key={subject.code}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                        {subject.code}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {subject.credit} Credits
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-800 leading-snug">{subject.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-purple-600" /> {subject.faculty}
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Course Type:</span>
                      <span className="font-semibold text-gray-700">{subject.type}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-bold text-gray-600">
                      <span>Syllabus Covered</span>
                      <span className="text-purple-600">{subject.syllabusStatus}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: subject.syllabusStatus.replace("% Completed", "%") }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mt-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" /> Course Instructors & Faculty List
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {academicsData.facultyList.map((fac) => (
                <div key={fac.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200/80">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {fac.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900">{fac.name}</h4>
                    <p className="text-xs text-purple-700 font-semibold">{fac.designation}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{fac.office} - {fac.email}</p>
                    <span className="inline-block mt-2 text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Office Hours: {fac.availability}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "syllabus" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" /> Dedicated Subject Syllabus & Lesson Tracking Page
          </h2>
          <div className="space-y-4">
            {academicsData.syllabus.map((syl, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    {syl.subject}
                  </span>
                  <h4 className="text-sm font-bold text-gray-800">{syl.unit}</h4>
                  <p className="text-xs text-gray-600">{syl.topics}</p>
                </div>
                <div className="w-full md:w-48 text-right">
                  <div className="flex items-center justify-between text-xs mb-1 font-bold">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-purple-700">{syl.completion}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${syl.completion}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "study-material" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" /> Dedicated Study Materials & Notes Downloads Page
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {academicsData.studyMaterials.map((mat) => (
              <div key={mat.id} className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-purple-300 transition-all flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {mat.subject}
                  </span>
                  <h4 className="text-sm font-bold text-gray-800 leading-snug">{mat.title}</h4>
                  <p className="text-[11px] text-gray-500">{mat.type} - {mat.size} - Uploaded {mat.uploadDate}</p>
                </div>
                <button className="p-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition-all shrink-0">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "lectures" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-600" /> Dedicated LMS Recorded Video Lectures Page
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {academicsData.recordedLectures.map((lec) => (
              <div key={lec.id} className="rounded-xl border border-gray-200 overflow-hidden bg-white group hover:shadow-md transition-all">
                <div className="relative h-40 bg-slate-900 overflow-hidden">
                  <img src={lec.thumbnail} alt={lec.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white pl-0.5" />
                    </button>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                    {lec.duration}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[10px] font-extrabold text-purple-600 uppercase">{lec.subject}</span>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2">{lec.title}</h4>
                  <p className="text-[11px] text-gray-500 pt-2 flex items-center justify-between border-t border-gray-100">
                    <span>{lec.instructor}</span>
                    <span>{lec.date}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "assignments" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-600" /> Dedicated Assignments Submission Page
            </h2>
            <div className="space-y-3">
              {academicsData.assignments.map((asn) => (
                <div key={asn.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        {asn.subject}
                      </span>
                      <span className="text-xs font-bold text-amber-600">{asn.marks}</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">{asn.title}</h4>
                    <p className="text-xs text-gray-500">Due Date: {asn.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      asn.status === "Submitted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {asn.status}
                    </span>
                    {asn.status === "Pending" && (
                      <button className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors">
                        Submit Solution
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "calendar" && <AcademicCalendarPage />}
    </div>
  );
}

