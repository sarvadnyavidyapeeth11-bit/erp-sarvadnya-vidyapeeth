import React, { useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  KeyRound,
  ShieldAlert,
  Bell,
  SunMoon,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { studentProfile } from "../../../hooks/studentPortalData";

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pathParts = location.pathname.split("").filter(Boolean);
  const routeSubTab = pathParts.length >= 3 && pathParts[1] === "settings" ? pathParts[2] : null;
  const activeTab = routeSubTab || searchParams.get("tab") || "profile";

  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("English");

  const tabs = [
    { id: "profile", label: "Profile Settings", icon: User, path: "/student-dashboard/settings/profile" },
    { id: "password", label: "Password & Security", icon: KeyRound, path: "/student-dashboard/settings/password" },
    { id: "2fa", label: "Two-Factor Auth (2FA)", icon: ShieldAlert, path: "/student-dashboard/settings/2fa" },
    { id: "notifications", label: "Notification Preferences", icon: Bell, path: "/student-dashboard/settings/notifications" },
    { id: "theme", label: "Language & Theme", icon: SunMoon, path: "/student-dashboard/settings/theme" },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 border border-gray-200 shadow-sm min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" /> Settings Sub-Pages Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Student Settings & Security</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-0.5">
              Dedicated URL pages for Profile, Passwords, 2FA Security, Notification Alerts & Theme.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none border-t border-slate-700/60 pt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings updated successfully!
        </div>
      )}

      {/* Dedicated Page View Rendering */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6 max-w-2xl">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" /> Dedicated Profile Settings Page
          </h2>
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" defaultValue={studentProfile.name} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                <input type="email" defaultValue={studentProfile.email} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Number</label>
                <input type="text" defaultValue={studentProfile.phone} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
              </div>
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold shadow hover:bg-purple-700">
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {activeTab === "password" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6 max-w-xl">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-purple-600" /> Dedicated Password Reset Page
          </h2>
          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Current Password</label>
              <input type="password" required placeholder="--------" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">New Password</label>
              <input type="password" required placeholder="--------" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl" />
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold shadow hover:bg-purple-700">
              Update Password
            </button>
          </form>
        </div>
      )}

      {activeTab === "2fa" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6 max-w-xl">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-600" /> Dedicated Two-Factor Authentication Page
          </h2>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
            <div>
              <h4 className="font-bold text-gray-900">OTP via Registered Mobile / Authenticator App</h4>
              <p className="text-gray-500 mt-0.5">Require an extra security code upon login.</p>
            </div>
            <button
              onClick={() => setTfaEnabled(!tfaEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tfaEnabled ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tfaEnabled ? "Done 2FA Enabled" : "Enable 2FA"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4 max-w-xl">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" /> Dedicated Notification Preferences Page
          </h2>
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 font-semibold cursor-pointer">
              <span>SMS Alerts for Fee Due & Exam Results</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-600" />
            </label>
          </div>
        </div>
      )}

      {(activeTab === "theme" || activeTab === "language-theme") && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6 max-w-xl text-xs">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <SunMoon className="w-5 h-5 text-purple-600" /> Dedicated Language & Theme Page
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Preferred Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                <option value="English">English</option>
                <option value="Hindi">Hindi (>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Portal Theme Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-3 rounded-xl border font-bold text-center ${
                    theme === "light" ? "border-purple-600 bg-purple-50 text-purple-700" : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                >
                  Light Mode
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-3 rounded-xl border font-bold text-center ${
                    theme === "dark" ? "border-purple-600 bg-slate-900 text-white" : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                >
                  Dark Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

