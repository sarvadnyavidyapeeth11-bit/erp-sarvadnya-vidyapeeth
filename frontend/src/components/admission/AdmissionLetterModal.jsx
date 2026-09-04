import React from "react";
import { Printer, X, CheckCircle2, ShieldCheck, Award, Building2 } from "lucide-react";

/**
 * AdmissionLetterModal Component
 * Renders an official, print-ready Provisional Admission Confirmation Letter
 * with clean A4 print support.
 */
export default function AdmissionLetterModal({ student, onClose }) {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:max-w-none print:w-full print:h-auto print:max-h-none print:shadow-none print:border-none print:rounded-none print:bg-white print:text-black">
        
        {/* Modal Header (Hidden during print) */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Provisional Admission Confirmation Letter</h3>
              <p className="text-xs text-slate-400">Official Institutional Enrollment & Clearance Document</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Letter (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 overflow-y-auto font-serif text-slate-200 print:p-0 print:text-black print:overflow-visible bg-slate-900 print:bg-white">
          
          {/* Official Letterhead */}
          <div className="border-b-2 border-indigo-600 pb-6 mb-8 text-center print:border-black">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Building2 className="w-8 h-8 text-indigo-500 print:text-black" />
              <h1 className="text-2xl font-black tracking-wider text-white print:text-black font-sans uppercase">
                SARVADNYA VIDYAPEETH
              </h1>
            </div>
            <p className="text-xs text-slate-400 print:text-gray-700 font-sans tracking-wide">
              Patna Campus, Bailey Road, Patna, Bihar - 800001 | Affiliated to AKU Patna
            </p>
            <p className="text-[11px] text-slate-500 print:text-gray-600 font-sans mt-1">
              Website: www.sarvadnya.edu.in | Email: admissions@sarvadnya.edu.in | Phone: +91 98000 00001
            </p>
          </div>

          {/* Letter Reference & Date */}
          <div className="flex items-center justify-between text-xs font-sans text-slate-400 print:text-gray-700 mb-8">
            <div>
              <span className="font-semibold text-slate-300 print:text-gray-800">Ref No:</span> {student.scholarNo || student.id || "Not available"}
            </div>
            <div>
              <span className="font-semibold text-slate-300 print:text-gray-800">Date:</span> {todayStr}
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 print:border-black print:bg-gray-100 print:text-black font-sans font-bold text-sm uppercase tracking-wider rounded-lg">
              PROVISIONAL ADMISSION CONFIRMATION LETTER
            </span>
          </div>

          {/* Candidate Salutation */}
          <div className="mb-6 font-sans text-sm text-slate-200 print:text-gray-900 leading-relaxed">
            <p className="font-bold text-white print:text-black mb-1">To,</p>
            <p className="font-bold text-indigo-400 print:text-black text-base">{student.studentName || student.name || "Not available"}</p>
            <p className="text-xs text-slate-400 print:text-gray-700">Father's Name: {student.fatherName || "N/A"}</p>
            <p className="text-xs text-slate-400 print:text-gray-700">Permanent Address: {[student.permanentCity, student.permanentState, student.permanentPincode].filter(Boolean).join(", ") || "Not available"}</p>
          </div>

          {/* Subject Line */}
          <div className="mb-6 font-sans text-sm font-bold text-slate-100 print:text-black border-l-4 border-indigo-500 print:border-black pl-3 py-1 bg-slate-800/40 print:bg-gray-100">
            Subject: Provisional Admission Offer for {student.course || "Not available"} ({student.session || "Not available"})
          </div>

          {/* Body Content */}
          <div className="space-y-4 font-sans text-sm text-slate-300 print:text-gray-800 leading-relaxed mb-8">
            <p>
              Dear Student,
            </p>
            <p>
              We are pleased to inform you that based on your academic credentials and verification of submitted documents, you have been <strong className="text-emerald-400 print:text-black">PROVISIONALLY ADMITTED</strong> to <strong>Sarvadnya Vidyapeeth</strong> for the academic session <strong>{student.session || "Not available"}</strong>.
            </p>

            {/* Student Credentials Table */}
            <div className="my-6 border border-slate-700 print:border-gray-400 rounded-xl overflow-hidden font-sans">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  <tr className="bg-slate-800/50 print:bg-gray-100">
                    <td className="px-4 py-2.5 font-bold text-slate-400 print:text-gray-700 w-1/3">Scholar No</td>
                    <td className="px-4 py-2.5 font-bold text-indigo-400 print:text-black">{student.scholarNo || "Generated on Payment"}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-400 print:text-gray-700">6-Digit Scholar No. *</td>
                    <td className="px-4 py-2.5 font-black text-emerald-400 print:text-black font-mono">{student.scholarNo || "Not available"}</td>
                  </tr>
                  <tr className="bg-slate-800/50 print:bg-gray-100">
                    <td className="px-4 py-2.5 font-bold text-slate-400 print:text-gray-700">Official Enrollment No (SV) *</td>
                    <td className="px-4 py-2.5 font-black text-indigo-400 print:text-black font-mono">{student.enrollmentNo || student.scholarNo || student.id}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-400 print:text-gray-700">Student Portal Login ID</td>
                    <td className="px-4 py-2.5 font-bold text-emerald-400 print:text-black font-mono">{student.scholarNo || student.enrollmentNo}</td>
                  </tr>
                  <tr className="bg-slate-800/50 print:bg-gray-100">
                    <td className="px-4 py-2.5 font-bold text-slate-400 print:text-gray-700">Student Portal Password</td>
                    <td className="px-4 py-2.5 font-bold text-amber-400 print:text-black font-mono">{student.scholarNo || student.enrollmentNo}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-400 print:text-gray-700">Program / Course</td>
                    <td className="px-4 py-2.5 font-bold text-white print:text-black">{student.course} ({student.courseCode})</td>
                  </tr>
                  <tr className="bg-slate-800/50 print:bg-gray-100">
                    <td className="px-4 py-2.5 font-bold text-slate-400 print:text-gray-700">Allotted Department & Batch</td>
                    <td className="px-4 py-2.5 text-slate-200 print:text-gray-900">{student.department} | {student.batch || "Section A"}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-slate-400 print:text-gray-700">Verification Status</td>
                    <td className="px-4 py-2.5 font-bold text-emerald-400 print:text-gray-900 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 print:hidden" />
                      <span>{student.status || "Verified & Approved"}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400 print:text-gray-600">
              * Note: This admission is provisional subject to submission of final original migration certificates, character certificates, and payment of the prescribed semester fee at the Cash Counter.
            </p>
          </div>

          {/* Signature & Seal Block */}
          <div className="pt-12 mt-12 border-t border-slate-800 print:border-gray-400 font-sans flex justify-between items-end">
            <div className="text-center">
              <div className="inline-flex items-center space-x-1 text-emerald-400 print:text-gray-800 text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4 print:hidden" />
                <span>Verified Digitally</span>
              </div>
              <p className="text-[10px] text-slate-500 print:text-gray-600">Admissions Desk Seal</p>
            </div>
            
            <div className="text-right">
              <div className="h-10 text-indigo-400 font-serif italic text-sm mb-1">Dr. S. K. Roy</div>
              <p className="text-xs font-bold text-white print:text-black">Dean of Academic Admissions</p>
              <p className="text-[10px] text-slate-400 print:text-gray-600">Sarvadnya Vidyapeeth, Patna</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
