import React from "react";
import { Home, UserCheck, Shield } from "lucide-react";
import { hostelData } from "../../../hooks/studentExtendedData";

export default function HostelRoomPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <Home className="w-6 h-6" /> Room Allocation & Facilities
        </h1>
        <p className="text-amber-100 text-xs mt-1">{hostelData.hostelName} - Dedicated Room Details Page</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-800">Assigned Accommodation Details</h2>
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
              <span className="text-gray-500 block">Occupancy</span>
              <span className="text-base font-extrabold text-amber-900">{hostelData.roomType}</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-gray-500 block">Desk Allocation</span>
              <span className="text-base font-extrabold text-emerald-700">{hostelData.roomNo ? "Assigned" : "Not assigned"}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <h4 className="text-xs font-bold text-gray-700">Allocated Roommate Information</h4>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">`r`n                Roommate records will appear here after hostel allocation is published.`r`n              </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-600" /> Room Discipline Rules
          </h2>
          <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
            <li>Gate curfew is strictly <strong>08:30 PM</strong>.</li>
            <li>Cooking appliances & heavy heaters strictly banned.</li>
            <li>Out-station leave pass required for night stays.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}




