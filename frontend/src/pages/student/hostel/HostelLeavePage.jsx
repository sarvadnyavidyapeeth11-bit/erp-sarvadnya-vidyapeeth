import React, { useState } from "react";
import { FileCheck } from "lucide-react";
import { hostelData } from "../../../hooks/studentExtendedData";

export default function HostelLeavePage() {
  const [newLeave, setNewLeave] = useState({ reason: "", outDate: "", inDate: "", destination: "" });
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <FileCheck className="w-6 h-6" /> Leave Pass Portal
        </h1>
        <p className="text-amber-100 text-xs mt-1">Dedicated Page for Out-Station Pass Request & Warden Verification</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
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
    </div>
  );
}

