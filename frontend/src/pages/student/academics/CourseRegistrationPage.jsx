import React, { useState } from "react";
import { BookOpenCheck, CheckCircle2, AlertCircle, Sparkles, Send } from "lucide-react";
import { courseRegistrationData } from "../../../hooks/studentExtendedData";

export default function CourseRegistrationPage() {
  const [selectedElectives, setSelectedElectives] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);

  const toggleElective = (code) => {
    if (selectedElectives.includes(code)) {
      setSelectedElectives(selectedElectives.filter((c) => c !== code));
    } else {
      setSelectedElectives([...selectedElectives, code]);
    }
  };

  const calculateTotalCredits = () => {
    const coreCredits = courseRegistrationData.coreSubjects.reduce((acc, s) => acc + s.credit, 0);
    const electiveCredits = courseRegistrationData.electiveSubjects
      .filter((s) => selectedElectives.includes(s.code))
      .reduce((acc, s) => acc + s.credit, 0);
    return coreCredits + electiveCredits;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setIsRegistered(true);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Upcoming Academic Session
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Course & Subject Registration</h1>
            <p className="text-purple-100 text-xs sm:text-sm mt-1">
              Select Core & Elective subjects for {courseRegistrationData.semester} ({courseRegistrationData.session}).
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-center">
            <p className="text-[10px] uppercase font-bold text-purple-200">Registration Deadline</p>
            <p className="text-sm font-black text-amber-300">{courseRegistrationData.deadline}</p>
          </div>
        </div>
      </div>

      {isRegistered && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Done Course Registration Submitted & Approved by Academic Advisor! (Total {calculateTotalCredits()} Credits)</span>
          </div>
          <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px]">APPROVED</span>
        </div>
      )}

      {/* Credit Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-gray-400 block font-semibold">Semester Target</span>
          <span className="text-base font-extrabold text-purple-900">{courseRegistrationData.semester}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-gray-400 block font-semibold">Total Registered Credits</span>
          <span className="text-base font-extrabold text-emerald-600">{calculateTotalCredits()} / {courseRegistrationData.maxCredits} Credits</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-gray-400 block font-semibold">Status</span>
          <span className={`text-base font-extrabold ${isRegistered ? "text-emerald-700" : "text-amber-600"}`}>
            {isRegistered ? "Registered & Locked" : "Pending Submit"}
          </span>
        </div>
      </div>

      {/* Mandatory Core Subjects */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <BookOpenCheck className="w-5 h-5 text-purple-600" /> 1. Mandatory Core Subjects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {courseRegistrationData.coreSubjects.map((sub) => (
            <div key={sub.code} className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-purple-700 text-xs block">{sub.code}</span>
                <h4 className="font-bold text-gray-900">{sub.name}</h4>
                <p className="text-gray-500 mt-0.5">{sub.type} - {sub.credit} Credits</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                COMPULSORY
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Elective Subjects Selection */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" /> 2. Elective Subject Selection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {courseRegistrationData.electiveSubjects.map((sub) => {
            const isSelected = selectedElectives.includes(sub.code);
            return (
              <div
                key={sub.code}
                onClick={() => !isRegistered && toggleElective(sub.code)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "border-purple-500 bg-purple-50/80 shadow-sm"
                    : "border-gray-200 bg-gray-50/50 hover:border-purple-300"
                }`}
              >
                <div>
                  <span className="font-extrabold text-purple-700 text-xs block">{sub.code} ({sub.type})</span>
                  <h4 className="font-bold text-gray-900">{sub.name}</h4>
                  <p className="text-gray-500 mt-0.5">{sub.credit} Credits</p>
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  disabled={isRegistered}
                  className="w-4 h-4 accent-purple-600"
                />
              </div>
            );
          })}
        </div>
      </div>

      {!isRegistered && (
        <form onSubmit={handleRegister} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-right">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 ml-auto"
          >
            <Send className="w-4 h-4" /> Lock & Submit Course Registration
          </button>
        </form>
      )}
    </div>
  );
}

