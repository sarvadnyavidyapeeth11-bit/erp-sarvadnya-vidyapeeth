import React, { useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Calendar,
  Users,
  Trophy,
  Award,
  Download,
  Dumbbell,
  HeartHandshake
} from "lucide-react";
import { activitiesData } from "../../../hooks/studentExtendedData";

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const routeSubTab = pathParts.length >= 3 && pathParts[1] === "activities" ? pathParts[2] : null;
  const activeTab = routeSubTab || searchParams.get("tab") || "events";

  const [enrolledEvents, setEnrolledEvents] = useState([3]);

  const tabs = [
    { id: "events", label: "Campus Events", icon: Calendar, path: "/student-dashboard/activities/events" },
    { id: "clubs", label: "Clubs & Societies", icon: Users, path: "/student-dashboard/activities/clubs" },
    { id: "nss-ncc", label: "NSS & NCC Wing", icon: HeartHandshake, path: "/student-dashboard/activities/nss-ncc" },
    { id: "sports", label: "Sports & Athletics", icon: Dumbbell, path: "/student-dashboard/activities/sports" },
    { id: "competitions", label: "Competitions & Awards", icon: Trophy, path: "/student-dashboard/activities/competitions" },
    { id: "certificates", label: "Activity Certificates", icon: Award, path: "/student-dashboard/activities/certificates" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-gray-200 shadow-sm min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" /> Campus Activities Sub-Pages Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Activities & Student Life</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
              Dedicated URL sub-pages for Events, Clubs, NSS/NCC Wing, Sports & Certificates.
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
      {activeTab === "events" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activitiesData.events.map((ev) => {
            const isEnrolled = enrolledEvents.includes(ev.id);
            return (
              <div key={ev.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                      {ev.category}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">{ev.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mt-2">{ev.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">Venue: {ev.venue}</p>
                </div>
                <button
                  onClick={() => {
                    if (isEnrolled) {
                      setEnrolledEvents(enrolledEvents.filter(id => id !== ev.id));
                    } else {
                      setEnrolledEvents([...enrolledEvents, ev.id]);
                    }
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    isEnrolled
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-rose-600 hover:bg-rose-700 text-white shadow"
                  }`}
                >
                  {isEnrolled ? "Done Registered for Event" : "Register Now"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "clubs" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-600" /> Dedicated Active Student Clubs Page
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {activitiesData.clubs.map((c, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-gray-200 bg-gray-50 space-y-2">
                <h3 className="text-base font-bold text-gray-900">{c.name}</h3>
                <p className="text-xs text-rose-700 font-bold">Your Role: {c.role}</p>
                <p className="text-xs text-gray-500">Faculty Lead: {c.Lead} - {c.members} Active Members</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "nss-ncc" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-rose-600" /> Dedicated NSS & NCC Cadet Wings Page
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase px-2 py-0.5 rounded bg-emerald-100">
                Active Enrolled Member
              </span>
              <h3 className="text-base font-bold text-gray-900">SVP NSS Unit - I (Community Service)</h3>
              <p className="text-xs text-gray-600">Total Volunteered Hours: <strong>112 Hours</strong></p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sports" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-rose-600" /> Dedicated Sports & Athletics Page
          </h2>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
            <p className="text-gray-600">Sports participation records will appear here after publication.</p>
          </div>
        </div>
      )}

      {activeTab === "competitions" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-rose-600" /> Dedicated Competitions & Awards Page
          </h2>
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs">
            <div>
              <span className="font-extrabold text-amber-800 text-sm block">No competition awards published</span>`r`n              <p className="text-gray-600">Awards will appear here after verification.</p>
            </div>
            <Trophy className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      )}

      {activeTab === "certificates" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-rose-600" /> Dedicated Activity Certificate Vault Page
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activitiesData.certificates.map((cert) => (
              <div key={cert.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-extrabold text-rose-700 uppercase block">{cert.category}</span>
                  <h4 className="font-bold text-gray-900">{cert.title}</h4>
                  <p className="text-gray-500 mt-0.5">Issued Date: {cert.date}</p>
                </div>
                <button className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-all shrink-0">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



