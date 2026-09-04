import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  FileCheck,
  Save,
  CheckCircle2,
  X,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";

const mockMarksData = [
  { id: 1, roll: "SV2024BCA001", name: "Aarav Sharma", midTerm: 22, assignment: 9, attendance: 9 },
  { id: 2, roll: "SV2024BCA002", name: "Ananya Roy", midTerm: 24, assignment: 10, attendance: 10 },
  { id: 3, roll: "SV2024BCA003", name: "Ayush Kumar", midTerm: 18, assignment: 8, attendance: 7 },
  { id: 4, roll: "SV2024BCA004", name: "Bhavya Singh", midTerm: 21, assignment: 9, attendance: 8 },
  { id: 5, roll: "SV2024BCA005", name: "Devendra Verma", midTerm: 23, assignment: 10, attendance: 9 },
  { id: 6, roll: "SV2024BCA006", name: "Ishita Gupta", midTerm: 20, assignment: 9, attendance: 9 },
  { id: 7, roll: "SV2024BCA007", name: "Kunal Pandey", midTerm: 15, assignment: 7, attendance: 6 },
  { id: 8, roll: "SV2024BCA008", name: "Meraj Hussain", midTerm: 25, assignment: 10, attendance: 10 },
];

export default function MarksEntryPage() {
  const [selectedCourse, setSelectedCourse] = useState("BCA");
  const [selectedSem, setSelectedSem] = useState("2nd Semester");
  const [selectedSubject, setSelectedSubject] = useState("Digital Electronics");
  const [selectedExamType, setSelectedExamType] = useState("Mid-Term Exam (25 Marks)");
  const [studentsMarks, setStudentsMarks] = useState(mockMarksData);
  const [searchQuery, setSearchQuery] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleMarkChange = (id, field, value) => {
    const numVal = Math.min(Math.max(Number(value) || 0, 0), 25);
    setStudentsMarks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: numVal } : s))
    );
  };

  const handleSaveMarks = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const filteredStudents = studentsMarks.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* ── Page Header Banner ── */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Marks & Grade Entry Module
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Internal Exam Marks Entry
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Enter mid-term, assignment, and internal practical marks for automatic CGPA/Grade sync.
            </p>
          </div>

          <button
            onClick={handleSaveMarks}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save All Marks</span>
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
              <span>Marks updated & synced to student marksheets successfully!</span>
            </div>
            <button onClick={() => setSaveSuccess(false)}>
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter Controls Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" /> Exam & Subject Filters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-bold text-gray-500 block mb-1">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-800 outline-none"
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
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-800 outline-none"
            >
              <option>2nd Semester</option>
              <option>4th Semester</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-500 block mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-800 outline-none"
            >
              <option>Digital Electronics</option>
              <option>Database Management Systems</option>
              <option>C Programming</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-500 block mb-1">Exam Type</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-800 outline-none"
            >
              <option>Mid-Term Exam (25 Marks)</option>
              <option>Assignment / Quiz (10 Marks)</option>
              <option>Attendance Weightage (10 Marks)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between gap-4">
        <span className="text-xs font-bold text-gray-600">
          Showing {filteredStudents.length} Students
        </span>
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or Scholar No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none"
          />
        </div>
      </div>

      {/* ── Marks Entry Roster Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white font-bold">
                <th className="p-3.5">Scholar No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5 text-center">Mid-Term (25)</th>
                <th className="p-3.5 text-center">Assignment (10)</th>
                <th className="p-3.5 text-center">Attendance (10)</th>
                <th className="p-3.5 text-center">Total (45)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((s) => {
                const total = s.midTerm + s.assignment + s.attendance;
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-gray-700">{s.roll}</td>
                    <td className="p-3.5 font-bold text-gray-800">{s.name}</td>

                    <td className="p-3.5 text-center">
                      <input
                        type="number"
                        value={s.midTerm}
                        onChange={(e) => handleMarkChange(s.id, "midTerm", e.target.value)}
                        className="w-16 p-1.5 rounded-lg border border-gray-300 text-center font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </td>

                    <td className="p-3.5 text-center">
                      <input
                        type="number"
                        value={s.assignment}
                        onChange={(e) => handleMarkChange(s.id, "assignment", e.target.value)}
                        className="w-16 p-1.5 rounded-lg border border-gray-300 text-center font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </td>

                    <td className="p-3.5 text-center">
                      <input
                        type="number"
                        value={s.attendance}
                        onChange={(e) => handleMarkChange(s.id, "attendance", e.target.value)}
                        className="w-16 p-1.5 rounded-lg border border-gray-300 text-center font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                        {total} / 45
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
