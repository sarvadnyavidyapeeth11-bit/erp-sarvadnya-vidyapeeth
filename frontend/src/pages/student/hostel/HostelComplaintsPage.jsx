import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { hostelData } from "../../../hooks/studentExtendedData";

export default function HostelComplaintsPage() {
  const [complaintText, setComplaintText] = useState("");
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" /> Maintenance & Complaint Registration
        </h1>
        <p className="text-amber-100 text-xs mt-1">Dedicated Page for Plumbing, Electrical & Furniture Issues</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
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
    </div>
  );
}

