import React, { useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Utensils,
  FileCheck,
  AlertTriangle,
  IndianRupee,
  Sparkles,
  PhoneCall
} from "lucide-react";
import { hostelData } from "../../../hooks/studentExtendedData";

export default function HostelPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Extract path sub-tab (e.g. /student-dashboard/hostel/mess => mess)
  const pathParts = location.pathname.split("/").filter(Boolean);
  const routeSubTab = pathParts.length >= 3 && pathParts[1] === "hostel" ? pathParts[2] : null;
  const activeTab = routeSubTab || searchParams.get("tab") || "room";

  const [selectedDay, setSelectedDay] = useState("Monday");
  const [newLeave, setNewLeave] = useState({ reason: "", outDate: "", inDate: "", destination: "" });
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  const tabs = [
    { id: "room", label: "Hostel & Room Details", icon: Home, path: "/student-dashboard/hostel/room" },
    { id: "mess", label: "Mess Menu & Food", icon: Utensils, path: "/student-dashboard/hostel/mess" },
    { id: "leave", label: "Leave Pass Request", icon: FileCheck, path: "/student-dashboard/hostel/leave" },
    { id: "complaints", label: "Complaints & Maintenance", icon: AlertTriangle, path: "/student-dashboard/hostel/complaints" },
    { id: "fees", label: "Hostel Fees", icon: IndianRupee, path: "/student-dashboard/hostel/fees" },
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleTabChange = (tab) => {
    navigate(tab.path);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-gray-200 shadow-sm min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" /> Dedicated Hostel Sub-Page Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{hostelData.hostelName}</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
              Room {hostelData.roomNo} - {hostelData.roomType} - Warden: {hostelData.wardenName}
            </p>
          </div>
          <div className="bg-purple-50/70 border border-purple-100 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] uppercase font-extrabold text-purple-700 tracking-wider">Warden Contact</p>
            <p className="text-sm font-black text-slate-900">{hostelData.wardenContact}</p>
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
                onClick={() => handleTabChange(tab)}
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
      {activeTab === "room" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Home className="w-5 h-5 text-amber-600" /> Room Allocation & Facilities Page
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-gray-500 block">Hostel Block</span>
                <span className="text-base font-extrabold text-amber-900">{hostelData.hostelName || "Not assigned"}</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-gray-500 block">Room Number</span>
                <span className="text-base font-extrabold text-amber-900">{hostelData.roomNo}</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-gray-500 block">Room Occupancy</span>
                <span className="text-base font-extrabold text-amber-900">{hostelData.roomType}</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-gray-500 block">Bed & Desk Status</span>
                <span className="text-base font-extrabold text-emerald-700">Assigned (Desk #2)</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <h4 className="text-xs font-bold text-gray-700">Roommates Information</h4>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">`r`n                Roommate records will appear here after hostel allocation is published.`r`n              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-800">Hostel Security & Rules</h2>
            <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
              <li>In-time for hostel gates is strictly <strong>08:30 PM</strong> daily.</li>
              <li>Out-pass is mandatory for overnight stay outside campus.</li>
              <li>Electric heaters and cooking appliances are strictly prohibited.</li>
              <li>Visitors allowed only in Warden Guest Room till 06:00 PM.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "mess" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-600" /> Dedicated Mess Menu & Meal Schedule
              </h2>
              <p className="text-xs text-gray-500">4 Meals Daily: Breakfast, Lunch, Evening Snacks & Dinner</p>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedDay === day
                      ? "bg-amber-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {hostelData.messMenu[selectedDay] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-700">Breakfast (07:30 AM - 09:00 AM)</span>
                <p className="text-xs font-bold text-gray-800">{hostelData.messMenu[selectedDay].breakfast}</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-700">Lunch (12:30 PM - 02:00 PM)</span>
                <p className="text-xs font-bold text-gray-800">{hostelData.messMenu[selectedDay].lunch}</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-700">Snacks (05:00 PM - 06:00 PM)</span>
                <p className="text-xs font-bold text-gray-800">{hostelData.messMenu[selectedDay].snacks}</p>
              </div>
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-700">Dinner (08:00 PM - 09:30 PM)</span>
                <p className="text-xs font-bold text-gray-800">{hostelData.messMenu[selectedDay].dinner}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "leave" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-600" /> Dedicated Hostel Leave Pass Application Page
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setLeaveSubmitted(true);
              }}
              className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs"
            >
              <h3 className="font-bold text-gray-800 text-sm">New Out-Station Pass Request</h3>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Reason for Leave</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Visit / Medical Emergency"
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.outDate}
                    onChange={(e) => setNewLeave({ ...newLeave, outDate: e.target.value })}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.inDate}
                    onChange={(e) => setNewLeave({ ...newLeave, inDate: e.target.value })}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Destination Address</label>
                <input
                  type="text"
                  required
                  placeholder="City / Address"
                  value={newLeave.destination}
                  onChange={(e) => setNewLeave({ ...newLeave, destination: e.target.value })}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
                />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow">
                Submit Leave Application
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-sm">Previous Leave Requests</h3>
              {leaveSubmitted && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  Done Pass submitted! Pending Warden Digital Approval.
                </div>
              )}
              {hostelData.leavePasses.map((lp, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-amber-700 block">{lp.passId}</span>
                    <span className="font-bold text-gray-800">{lp.reason}</span>
                    <p className="text-gray-500 mt-0.5">{lp.outDate} to {lp.inDate} ({lp.destination})</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">{lp.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "complaints" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" /> Dedicated Hostel Complaints & Maintenance Page
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setComplaintSubmitted(true);
                setComplaintText("");
              }}
              className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs"
            >
              <h3 className="font-bold text-gray-800 text-sm">Register Room Issue</h3>
              <textarea
                required
                rows={3}
                placeholder="Describe electrical, plumbing, furniture or cleaning issue..."
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs"
              />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold shadow">
                Submit Maintenance Complaint
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 text-sm">Complaint History</h3>
              {complaintSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  Done Maintenance Ticket Created. Technician will visit within 24 hours.
                </div>
              )}
              {hostelData.complaints.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-800 block">{c.issue}</span>
                    <span className="text-gray-500">{c.category} - Reported: {c.date}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "fees" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-amber-600" /> Dedicated Hostel & Mess Fee Page
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-gray-500 block font-semibold">Annual Hostel Fee</span>
              <span className="text-lg font-extrabold text-amber-900">Rs. 35,000 / Year</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-gray-500 block font-semibold">Paid Hostel Fee</span>
              <span className="text-lg font-extrabold text-emerald-800">Rs. 35,000</span>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-gray-500 block font-semibold">Hostel Dues</span>
              <span className="text-lg font-extrabold text-blue-900">Rs. 0 (Cleared)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



