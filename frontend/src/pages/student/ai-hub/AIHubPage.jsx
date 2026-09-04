import React, { useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Bot,
  BrainCircuit,
  FileText,
  HelpCircle,
  BarChart3,
  Compass,
  Send,
  Zap
} from "lucide-react";
import { aiHubData } from "../../../hooks/studentExtendedData";

export default function AIHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const routeSubTab = pathParts.length >= 3 && pathParts[1] === "ai-hub" ? pathParts[2] : null;
  const activeTab = routeSubTab || searchParams.get("tab") || "planner";

  const [doubtInput, setDoubtInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "ai", text: "Hello. I am your AI Academic Tutor & Assistant. Ask any academic doubt from your enrolled subjects." }
  ]);

  const tabs = [
    { id: "planner", label: "AI Study Planner", icon: BrainCircuit, path: "/student-dashboard/ai-hub/planner" },
    { id: "doubt-solver", label: "AI Doubt Solver", icon: Bot, path: "/student-dashboard/ai-hub/doubt-solver" },
    { id: "notes-summary", label: "AI Notes Summary", icon: FileText, path: "/student-dashboard/ai-hub/notes-summary" },
    { id: "quiz-generator", label: "AI Quiz Generator", icon: HelpCircle, path: "/student-dashboard/ai-hub/quiz-generator" },
    { id: "performance", label: "AI Performance Analysis", icon: BarChart3, path: "/student-dashboard/ai-hub/performance" },
    { id: "career-guidance", label: "AI Career Guidance", icon: Compass, path: "/student-dashboard/ai-hub/career-guidance" },
  ];

  const handleAskDoubt = (e) => {
    e.preventDefault();
    if (!doubtInput.trim()) return;
    const userMsg = doubtInput;
    setChatHistory((prev) => [
      ...prev,
      { sender: "user", text: userMsg },
      { sender: "ai", text: `AI Explanation for "${userMsg}":\nGreat query! In computer science, this topic involves key algorithms and data structure optimization. Always structure your solution using modular functions and handle edge cases.` }
    ]);
    setDoubtInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-gray-200 shadow-sm min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" /> Next-Gen AI Sub-Pages Hub
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">AI Academic Suite & Doubt Engine</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
              Dedicated URL pages for AI Study Planner, 24/7 Doubt Resolver, Notes Summarizer & Quiz Engine.
            </p>
          </div>
          <div className="bg-purple-50/70 border border-purple-100 px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] uppercase font-extrabold text-purple-700 tracking-wider">AI Model Status</p>
            <p className="text-xs font-black text-emerald-700 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Active & Optimized
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

      {/* Dedicated Page View Rendering */}
      {activeTab === "planner" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-600" /> Dedicated AI Smart Daily Study Schedule Page
            </h2>
            <button className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow hover:bg-purple-700">
              Regenerate AI Schedule
            </button>
          </div>

          <div className="space-y-3">
            {aiHubData.studyPlan.map((plan, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-purple-700 block">{plan.time}</span>
                  <span className="font-bold text-gray-900 text-sm">{plan.topic}</span>
                </div>
                <span className={`px-3 py-1 rounded-full font-bold ${
                  plan.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
                }`}>
                  {plan.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "doubt-solver" && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-900 to-slate-900 text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold">Dedicated AI Doubt Assistant Page</h3>
              <p className="text-[10px] text-purple-300">Trained on syllabus textbooks & exam questions</p>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs whitespace-pre-line shadow-sm ${
                    msg.sender === "user"
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAskDoubt} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask any academic doubt or programming concept..."
              value={doubtInput}
              onChange={(e) => setDoubtInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button type="submit" className="p-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {activeTab === "notes-summary" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" /> Dedicated AI Notes Summarizer Page
          </h2>
          <div className="space-y-4">
            {aiHubData.savedSummaries.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-gray-200 bg-gray-50 space-y-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  AI Summary
                </span>
                <h3 className="text-base font-bold text-gray-900">{item.topic}</h3>
                <p className="text-xs text-gray-700 leading-relaxed">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "quiz-generator" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4 max-w-xl mx-auto text-center">
          <HelpCircle className="w-12 h-12 text-purple-600 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">Dedicated AI Quiz Generator Page</h2>
          <p className="text-xs text-gray-600">Select any subject and generate a personalized 10-question practice test with instant evaluation.</p>
          <button className="px-6 py-3 rounded-xl bg-purple-600 text-white text-xs font-bold shadow hover:bg-purple-700 transition-all">
            + Generate AI Quiz for Data Structures
          </button>
        </div>
      )}

      {activeTab === "performance" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" /> Dedicated AI Performance Analysis Page
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <span className="text-gray-500 block font-semibold">Predicted End-Sem SGPA</span>
              <span className="text-2xl font-extrabold text-purple-900">8.6 / 10.0</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-gray-500 block font-semibold">Strongest Subject</span>
              <span className="text-base font-extrabold text-emerald-800">Web Technologies (92%)</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-gray-500 block font-semibold">Area of Focus</span>
              <span className="text-base font-extrabold text-amber-900">Operating Systems</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "career-guidance" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-600" /> Dedicated AI Career Guidance Page
          </h2>
          <div className="p-5 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 space-y-2 text-xs">
            <h4 className="text-sm font-bold text-gray-900">Recommended Career Track: Full Stack Software Engineer</h4>
            <p className="text-gray-600">Performance analysis will appear after academic records are available.</p>
          </div>
        </div>
      )}
    </div>
  );
}

