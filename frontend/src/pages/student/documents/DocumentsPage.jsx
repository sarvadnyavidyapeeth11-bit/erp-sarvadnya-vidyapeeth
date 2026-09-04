import React, { useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  ShieldCheck,
  Upload,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Lock
} from "lucide-react";
import { documentsData } from "../../../hooks/studentExtendedData";

export default function DocumentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const routeSubTab = pathParts.length >= 3 && pathParts[1] === "documents" ? pathParts[2] : null;
  const activeTab = routeSubTab || searchParams.get("tab") || "uploaded";

  const tabs = [
    { id: "uploaded", label: "Uploaded & Verified Docs", icon: FileText, path: "/student-dashboard/documents/uploaded" },
    { id: "certificates", label: "Download Official Certificates", icon: Download, path: "/student-dashboard/documents/certificates" },
    { id: "digilocker", label: "DigiLocker Integration", icon: ShieldCheck, path: "/student-dashboard/documents/digilocker" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-gray-200 shadow-sm min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" /> Documents Sub-Pages Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Student Document Management</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
              Dedicated URL pages for Bonafide, Character & No Dues certificates, uploaded papers & DigiLocker.
            </p>
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

      {/* Tab View Rendering */}
      {activeTab === "uploaded" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600" /> Dedicated Uploaded & Verified Documents Page
            </h2>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow hover:bg-cyan-700">
              <Upload className="w-4 h-4" /> Upload New Document
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentsData.uploaded.map((doc, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{doc.name}</h4>
                  <p className="text-gray-500 mt-0.5">{doc.type} - Uploaded {doc.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                  <button className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-cyan-600">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "certificates" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-600" /> Dedicated Certificate Generator Page (Bonafide, Character, No Dues)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {documentsData.certificatesAvailable.map((cert, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-gray-200 bg-gradient-to-br from-cyan-50/50 to-teal-50/50 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200">
                    Auto Generated
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-2">{cert.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{cert.desc}</p>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-colors shadow flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Generate & Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "digilocker" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900">Dedicated DigiLocker Sync Page</h3>
              <p className="text-xs text-gray-600">Account: <strong>{documentsData.digiLocker.linkedAccount}</strong></p>
              <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Done {documentsData.digiLocker.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

