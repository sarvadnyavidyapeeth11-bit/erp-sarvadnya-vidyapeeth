import React, { useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Bell,
  UserCheck,
  HelpCircle,
  Send,
  Sparkles,
  LifeBuoy
} from "lucide-react";
import { communicationData } from "../../../hooks/studentExtendedData";
import NoticesPage from "./NoticesPage";
import QueryFacultyPage from "./QueryFacultyPage";

export default function CommunicationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const routeSubTab = pathParts.length >= 3 && pathParts[1] === "communication" ? pathParts[2] : null;
  const activeTab = routeSubTab || searchParams.get("tab") || "notices";

  const [mentorMessages, setMentorMessages] = useState(communicationData.mentorChat.messages);
  const [msgInput, setMsgInput] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const tabs = [
    { id: "notices", label: "Notice Board", icon: Bell, path: "/student-dashboard/communication/notices" },
    { id: "faculty", label: "Chat with Faculty", icon: MessageSquare, path: "/student-dashboard/communication/faculty" },
    { id: "mentor", label: "Chat with Mentor", icon: UserCheck, path: "/student-dashboard/communication/mentor" },
    { id: "helpdesk", label: "Help Desk & Grievances", icon: LifeBuoy, path: "/student-dashboard/communication/helpdesk" },
    { id: "feedback", label: "Feedback & Suggestions", icon: HelpCircle, path: "/student-dashboard/communication/feedback" },
  ];

  const handleSendMentorMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    setMentorMessages([
      ...mentorMessages,
      { sender: "student", text: msgInput, time: "Just Now" }
    ]);
    setMsgInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-gray-200 shadow-sm min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" /> Communication Sub-Pages Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Announcements & Mentorship</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
              Dedicated URL pages for Notice Board, Faculty Queries, Mentor Chat & Help Desk.
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
      {activeTab === "notices" && <NoticesPage />}

      {activeTab === "faculty" && <QueryFacultyPage />}

      {activeTab === "mentor" && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              PK
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{communicationData.mentorChat.mentorName}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold">Your Assigned Academic Mentor - Online</p>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {mentorMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-xs shadow-sm ${
                    msg.sender === "student"
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[9px] block mt-1 ${msg.sender === "student" ? "text-purple-200 text-right" : "text-gray-400"}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMentorMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type message to your mentor..."
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button type="submit" className="p-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {activeTab === "helpdesk" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-teal-600" /> Dedicated Help Desk & Grievances Page
          </h2>
          <div className="space-y-3">
            {communicationData.helpdeskTickets.map((tk) => (
              <div key={tk.ticketId} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-teal-700 block">{tk.ticketId}</span>
                  <span className="font-bold text-gray-800 text-sm">{tk.subject}</span>
                  <p className="text-gray-500 mt-0.5">Category: {tk.category} - Date: {tk.date}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">{tk.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "feedback" && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-600" /> Dedicated Institutional Feedback Page
          </h2>
          {feedbackSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
              Done Thank you for your feedback! It has been submitted anonymously to campus administration.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFeedbackSubmitted(true);
              }}
              className="space-y-3 text-xs"
            >
              <textarea
                required
                rows={4}
                placeholder="Share feedback regarding teaching, facilities, library or campus infrastructure..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold shadow hover:bg-teal-700">
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

