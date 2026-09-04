import React, { useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileUp,
  Award,
  Building2,
  Sparkles,
  Code,
  Video
} from "lucide-react";
import PlacementDrivesPage from "./PlacementDrivesPage";
import ResumeUpdatePage from "./ResumeUpdatePage";

export default function PlacementCareerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const routeSubTab = pathParts.length >= 3 && pathParts[1] === "placement" ? pathParts[2] : null;
  const activeTab = routeSubTab || searchParams.get("tab") || "drives";
  const [atsScore] = useState(82);

  const tabs = [
    { id: "drives", label: "Campus Drives & Companies", icon: Building2, path: "/student-dashboard/placement/drives" },
    { id: "resume", label: "Resume Builder & AI Review", icon: FileUp, path: "/student-dashboard/placement/resume" },
    { id: "internships", label: "Internships & Applications", icon: Briefcase, path: "/student-dashboard/placement/internships" },
    { id: "tests", label: "Aptitude & Coding Tests", icon: Code, path: "/student-dashboard/placement/tests" },
    { id: "interviews", label: "Mock Interviews & Schedule", icon: Video, path: "/student-dashboard/placement/interviews" },
    { id: "offers", label: "Placement Offers & Letters", icon: Award, path: "/student-dashboard/placement/offers" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-gray-200 shadow-sm min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" /> Training & Placement Cell (T&P)
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Placement & Career Guidance</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
              Dedicated URL pages for Campus Drives, Resume Builder, Coding Tests & Mock Interviews.
            </p>
          </div>
          <div className="bg-purple-50/70 border border-purple-100 px-4 py-2 rounded-xl border text-center">
            <p className="text-[10px] uppercase font-extrabold text-purple-700 tracking-wider">Your AI ATS Score</p>
            <p className="text-xl font-black text-emerald-600">{atsScore} / 100</p>
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

      {/* Tab Renderers */}
      {activeTab === "drives" && <PlacementDrivesPage />}

      {activeTab === "resume" && <ResumeUpdatePage />}

      {activeTab === "internships" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" /> Dedicated Internships & Active Applications Page
          </h2>
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600">
            Internship applications will appear here after placement cell publication.
          </div>
        </div>
      )}

      {activeTab === "tests" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-600" /> Dedicated Aptitude & Online Coding Test Page
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2 text-xs">
              <span className="text-[10px] font-extrabold text-purple-800 uppercase px-2 py-0.5 rounded bg-purple-100">
                Active Assessment
              </span>
              <h3 className="font-bold text-gray-900 text-sm">No aptitude test published</h3>
              <p className="text-gray-600">60 Questions - 90 Minutes Time Limit</p>
              <button className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold shadow hover:bg-purple-700">
                Start Test Now
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "interviews" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-600" /> Dedicated Mock Interviews Page
          </h2>
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
            <div>
              <span className="font-extrabold text-purple-700 text-sm block">No interview scheduled</span>
              <p className="text-gray-600">Interview schedules will appear here after placement cell publication.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold shadow">
              Join Video Room
            </button>
          </div>
        </div>
      )}

      {activeTab === "offers" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" /> Dedicated Placement Offers Page
          </h2>
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between text-xs">
            <div>
              <span className="font-extrabold text-emerald-800 text-sm block">No placement offer published</span>
              <p className="text-gray-600">Offer letters will appear here after placement cell verification.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold shadow">
              Download Offer Letter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}





