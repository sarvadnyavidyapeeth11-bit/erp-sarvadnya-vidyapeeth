import React from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bus,
  MapPin,
  Compass,
  PhoneCall,
  IndianRupee,
  Sparkles,
  QrCode,
  Navigation
} from "lucide-react";
import { transportData } from "../../../hooks/studentExtendedData";
import { studentProfile } from "../../../hooks/studentPortalData";

export default function TransportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const routeSubTab = pathParts.length >= 3 && pathParts[1] === "transport" ? pathParts[2] : null;
  const activeTab = routeSubTab || searchParams.get("tab") || "bus-pass";

  const tabs = [
    { id: "bus-pass", label: "Digital Bus Pass", icon: Bus, path: "/student-dashboard/transport/bus-pass" },
    { id: "route", label: "Route & Bus Stops", icon: MapPin, path: "/student-dashboard/transport/route" },
    { id: "tracking", label: "Live Bus Tracking", icon: Compass, path: "/student-dashboard/transport/tracking" },
    { id: "driver", label: "Driver Details", icon: PhoneCall, path: "/student-dashboard/transport/driver" },
    { id: "fees", label: "Transport Fees", icon: IndianRupee, path: "/student-dashboard/transport/fees" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-gray-200 shadow-sm min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" /> Transport Sub-Pages Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Bus Pass & Route Tracking</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
              Pass #{transportData.busPassNo} - {transportData.routeNo} - Bus #{transportData.busNo}
            </p>
          </div>
          <div className="bg-purple-50/70 border border-purple-100 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] uppercase font-extrabold text-purple-700 tracking-wider">Driver Contact</p>
            <p className="text-sm font-black text-slate-900">{transportData.driverPhone}</p>
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

      {/* Dedicated Page Views */}
      {activeTab === "bus-pass" && (
        <div className="max-w-xl mx-auto bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-2xl border border-indigo-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-indigo-800/60 pb-4">
            <div className="flex items-center gap-3">
              <Bus className="w-8 h-8 text-indigo-400" />
              <div>
                <h3 className="text-base font-extrabold">Sarvadnya Vidyapeeth</h3>
                <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold">Official Transport Pass</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold">
              VALID PASS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-indigo-300 text-[10px] block uppercase font-bold">Student Name</span>
              <span className="font-extrabold text-sm text-white">{studentProfile.name || "Student name not available"}</span>
            </div>
            <div>
              <span className="text-indigo-300 text-[10px] block uppercase font-bold">Scholar No</span>
              <span className="font-extrabold text-sm text-white">{studentProfile.scholarNo || studentProfile.rollNumber || "Scholar No not available"}</span>
            </div>
            <div>
              <span className="text-indigo-300 text-[10px] block uppercase font-bold">Assigned Route</span>
              <span className="font-extrabold text-xs text-white">{transportData.routeNo}</span>
            </div>
            <div>
              <span className="text-indigo-300 text-[10px] block uppercase font-bold">Valid Until</span>
              <span className="font-extrabold text-xs text-white">{transportData.validTill}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-indigo-300">Scan at Bus Entrance</p>
              <p className="text-xs font-mono font-bold text-white">{transportData.busPassNo}</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center text-slate-900">
              <QrCode className="w-12 h-12" />
            </div>
          </div>
        </div>
      )}

      {activeTab === "route" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> Route Stops & Scheduled Timings Page
          </h2>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200">
            {transportData.stops.map((stop, idx) => (
              <div key={idx} className="relative flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                <div className="absolute -left-6 top-5 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{stop.stopName}</h4>
                  <p className="text-gray-500">Pick-Up Stop #{idx + 1}</p>
                </div>
                <span className="font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                  {stop.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "tracking" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" /> Dedicated Live GPS Bus Tracking Simulator Page
            </h2>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Status
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-gray-500 block font-semibold">Current Bus Stop</span>
              <span className="text-base font-extrabold text-blue-900">{transportData.liveStatus.currentStop}</span>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="text-gray-500 block font-semibold">Next Approaching Stop</span>
              <span className="text-base font-extrabold text-indigo-900">{transportData.liveStatus.nextStop}</span>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <span className="text-gray-500 block font-semibold">ETA Campus Arrival</span>
              <span className="text-base font-extrabold text-purple-900">{transportData.liveStatus.estimatedArrival} ({transportData.liveStatus.busSpeed})</span>
            </div>
          </div>

          <div className="h-64 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-center p-6 text-white space-y-3 relative overflow-hidden">
            <Navigation className="w-12 h-12 text-indigo-400 animate-bounce" />
            <h3 className="text-lg font-bold">Bus #BR-01-PA-8899 in Motion</h3>
            <p className="text-xs text-slate-400">GPS location refreshed 5 seconds ago.</p>
          </div>
        </div>
      )}

      {activeTab === "driver" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-blue-600" /> Driver & Conductor Details Page
          </h2>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
              SK
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{transportData.driverName}</h3>
              <p className="text-xs text-gray-500">Senior Bus Driver - {transportData.busNo}</p>
              <p className="text-xs font-bold text-blue-700 mt-1">Phone: {transportData.driverPhone}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "fees" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-blue-600" /> Dedicated Transport Fee Ledger Page
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-gray-500 block font-semibold">Annual Bus Fee</span>
              <span className="text-lg font-extrabold text-blue-900">Rs. 14,000 / Year</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-gray-500 block font-semibold">Amount Paid</span>
              <span className="text-lg font-extrabold text-emerald-800">Rs. 14,000</span>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <span className="text-gray-500 block font-semibold">Pending Dues</span>
              <span className="text-lg font-extrabold text-purple-900">Rs. 0 (Cleared)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

