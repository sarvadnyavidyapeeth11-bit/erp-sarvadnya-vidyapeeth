import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Save,
  Check,
  X,
  Users,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const mockStudents = [
  { id: 1, roll: "SV2024BCA001", name: "Aarav Sharma", status: "P" },
  { id: 2, roll: "SV2024BCA002", name: "Ananya Roy", status: "P" },
  { id: 3, roll: "SV2024BCA003", name: "Ayush Kumar", status: "A" },
  { id: 4, roll: "SV2024BCA004", name: "Bhavya Singh", status: "P" },
  { id: 5, roll: "SV2024BCA005", name: "Devendra Verma", status: "P" },
  { id: 6, roll: "SV2024BCA006", name: "Ishita Gupta", status: "P" },
  { id: 7, roll: "SV2024BCA007", name: "Kunal Pandey", status: "A" },
  { id: 8, roll: "SV2024BCA008", name: "Meraj Hussain", status: "P" },
  { id: 9, roll: "SV2024BCA009", name: "Neha Kumari", status: "P" },
  { id: 10, roll: "SV2024BCA010", name: "Pooja Mishra", status: "P" },
  { id: 11, roll: "SV2024BCA011", name: "Rahul Deshmukh", status: "P" },
  { id: 12, roll: "SV2024BCA012", name: "Rohan Jha", status: "A" },
];

export default function MarkAttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState("BCA");
  const [selectedSem, setSelectedSem] = useState("2nd Semester");
  const [selectedSubject, setSelectedSubject] = useState("Digital Electronics");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState(mockStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleStatus = (id) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === "P" ? "A" : "P" } : s))
    );
  };

  const markAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: "P" })));
  };

  const markAllAbsent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: "A" })));
  };

  const handleSaveAttendance = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = students.filter((s) => s.status === "P").length;
  const absentCount = students.filter((s) => s.status === "A").length;
  const percentage = Math.round((presentCount / students.length) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* ── Page Header Banner ── */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Class Attendance Tool
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Mark Student Attendance
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Select class parameters, mark attendance, and submit live logs to ERP database.
            </p>
          </div>

          <button
            onClick={handleSaveAttendance}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Submit Attendance Log</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Attendance log submitted successfully for {attendanceDate}!</span>
            </div>
            <button onClick={() => setSaveSuccess(false)}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Selection Parameters Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" /> Class & Subject Selector
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-bold text-gray-500 block mb-1">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option>BCA</option>
              <option>BBA</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-500 block mb-1">Semester</label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option>2nd Semester</option>
              <option>4th Semester</option>
              <option>6th Semester</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-500 block mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option>Digital Electronics</option>
              <option>Database Management Systems</option>
              <option>C Programming</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-500 block mb-1">Attendance Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* ── Summary Stats & Quick Controls Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs">
          <span className="font-extrabold text-gray-700">Total: {students.length}</span>
          <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Present: {presentCount}
          </span>
          <span className="font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
            Absent: {absentCount}
          </span>
          <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
            Ratio: {percentage}%
          </span>
        </div>

        {/* Quick Toggles & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={markAllPresent}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={markAllAbsent}
            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors"
          >
            Mark All Absent
          </button>

          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── Attendance Student Roster Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white font-bold">
                <th className="p-3.5">#</th>
                <th className="p-3.5">Scholar No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5 text-center">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3.5 font-bold text-gray-400">{idx + 1}</td>
                  <td className="p-3.5 font-mono font-bold text-gray-700">{student.roll}</td>
                  <td className="p-3.5 font-bold text-gray-800">{student.name}</td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => toggleStatus(student.id)}
                      className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all shadow-sm active:scale-95 ${
                        student.status === "P"
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                          : "bg-red-500 hover:bg-red-600 text-white shadow-red-200"
                      }`}
                    >
                      {student.status === "P" ? "PRESENT" : "ABSENT"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
