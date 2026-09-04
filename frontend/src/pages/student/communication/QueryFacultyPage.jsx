import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Mail,
  Phone,
  MessageSquare,
  Search,
  Filter,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  BookOpen,
  Sparkles,
  X,
  HelpCircle,
  Award,
  UserPlus,
  Plus,
} from "lucide-react";
import { studentProfile } from "../../../hooks/studentPortalData";

const initialFacultyList = [];
const initialQueries = [];

const gradients = [
  "from-purple-500 to-indigo-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-violet-600 to-purple-800",
];

export default function QueryFacultyPage() {
  const [activeTab, setActiveTab] = useState("directory"); // 'directory' | 'sent'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [faculties, setFaculties] = useState(initialFacultyList);

  // Ask Query Modal State
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [querySubject, setQuerySubject] = useState("");
  const [queryMessage, setQueryMessage] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [queriesList, setQueriesList] = useState(initialQueries);

  // Add Faculty Modal State
  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false);
  const [newFacName, setNewFacName] = useState("");
  const [newFacRole, setNewFacRole] = useState("");
  const [newFacDept, setNewFacDept] = useState("Computer Applications");
  const [newFacEmail, setNewFacEmail] = useState("");
  const [newFacPhone, setNewFacPhone] = useState("");
  const [newFacRoom, setNewFacRoom] = useState("");
  const [newFacSubjects, setNewFacSubjects] = useState("");

  const [successToast, setSuccessToast] = useState("");

  const handleOpenQueryModal = (faculty) => {
    setSelectedFaculty(faculty);
    setQuerySubject("");
    setQueryMessage("");
    setUrgency("Normal");
    setIsQueryModalOpen(true);
  };

  const handleSubmitQuery = (e) => {
    e.preventDefault();
    if (!querySubject.trim() || !queryMessage.trim() || !selectedFaculty) return;

    const newQuery = {
      id: Date.now(),
      facultyName: selectedFaculty.name,
      subject: querySubject,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: "Pending",
      queryText: queryMessage,
      response: null,
      responseDate: null,
    };

    setQueriesList([newQuery, ...queriesList]);
    setIsQueryModalOpen(false);
    setSuccessToast(`Your query has been sent to ${selectedFaculty.name} successfully!`);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  // Add Faculty Submit Handler
  const handleAddFacultySubmit = (e) => {
    e.preventDefault();
    if (!newFacName.trim() || !newFacRole.trim() || !newFacEmail.trim() || !newFacPhone.trim()) return;

    const randomGradient = gradients[faculties.length % gradients.length];
    const subjectsArray = newFacSubjects
      ? newFacSubjects.split(",").map((s) => s.trim()).filter(Boolean)
      : ["General Academic"];

    const newFaculty = {
      id: Date.now(),
      name: newFacName.startsWith("Prof.") || newFacName.startsWith("Dr.") ? newFacName : `Prof. ${newFacName}`,
      role: newFacRole,
      department: newFacDept,
      email: newFacEmail,
      phone: newFacPhone,
      room: newFacRoom || "Sarvadnya Main Faculty Block",
      subjects: subjectsArray,
      availability: "10:00 AM - 04:00 PM",
      avatarColor: randomGradient,
    };

    setFaculties([newFaculty, ...faculties]);
    setIsAddFacultyOpen(false);

    // Reset Form
    setNewFacName("");
    setNewFacRole("");
    setNewFacDept("Computer Applications");
    setNewFacEmail("");
    setNewFacPhone("");
    setNewFacRoom("");
    setNewFacSubjects("");

    setSuccessToast(`Faculty member "${newFaculty.name}" added to directory successfully!`);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  const filteredFaculty = faculties.filter((faculty) => {
    const matchesSearch =
      faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      faculty.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === "All" || faculty.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 pb-10 font-sans">
      {/* -- Page Header -- */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-purple-900/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5" /> Faculty Connect Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Query to Faculty
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
              Connect directly with Sarvadnya Vidyapeeth faculty members. Find official contact numbers, email addresses, & submit academic queries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddFacultyOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2 shadow-md shadow-emerald-950/30 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              + Add Faculty
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "directory"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                }`}
            >
              Faculty Directory ({faculties.length})
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${activeTab === "sent"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                }`}
            >
              My Sent Queries ({queriesList.length})
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast("")} className="p-1 hover:bg-white/20 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -- TAB 1: Faculty Directory -- */}
      {activeTab === "directory" && (
        <div className="space-y-5">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search faculty by name, role, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Computer Applications">Computer Applications</option>
                <option value="Business Administration">Business Administration (BBA)</option>
                <option value="Mathematics & Analytics">Mathematics & Analytics</option>
                <option value="Humanities & Soft Skills">Humanities & Soft Skills</option>
              </select>

              <button
                onClick={() => setIsAddFacultyOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Faculty
              </button>
            </div>
          </div>

          {/* Faculty Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFaculty.map((faculty) => (
              <motion.div
                key={faculty.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                {/* Header Profile Info */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${faculty.avatarColor} text-white flex items-center justify-center text-sm font-extrabold shadow-md shrink-0`}>
                      {faculty.name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.)\s+/, "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{faculty.name}</h3>
                      <p className="text-[11px] font-bold text-purple-700 leading-snug">{faculty.role}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">{faculty.department}</p>
                    </div>
                  </div>

                  {/* -- REQUIRED CONTACT & EMAIL DISPLAY -- */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                    {/* Contact Number */}
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Contact Number</span>
                        <a href={`tel:${faculty.phone}`} className="font-bold text-slate-800 hover:text-purple-600 transition-colors">
                          {faculty.phone}
                        </a>
                      </div>
                    </div>

                    {/* Email ID */}
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Official Email ID</span>
                        <a href={`mailto:${faculty.email}`} className="font-bold text-purple-700 hover:underline truncate block">
                          {faculty.email}
                        </a>
                      </div>
                    </div>

                    {/* Room Office Location */}
                    <div className="flex items-center gap-2.5 text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{faculty.room}</span>
                    </div>
                  </div>

                  {/* Subjects Taught Badges */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Subjects & Specialization
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {faculty.subjects.map((sub, i) => (
                        <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Send Query Button */}
                <button
                  onClick={() => handleOpenQueryModal(faculty)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask Question / Send Query
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* -- TAB 2: My Sent Queries History -- */}
      {activeTab === "sent" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Your Submitted Queries</h2>
            <span className="text-xs text-slate-500 font-medium">Total: {queriesList.length} Queries</span>
          </div>

          <div className="space-y-3">
            {queriesList.map((q) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{q.facultyName}</span>
                    <span className="text-slate-400">-</span>
                    <span className="text-xs text-slate-500 font-medium">{q.date}</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${q.status === "Answered"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                  >
                    {q.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-purple-900 mb-1">Subject: {q.subject}</h4>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{q.queryText}"
                  </p>
                </div>

                {q.response ? (
                  <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-900">
                      <span>Faculty Response ({q.responseDate}):</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">{q.response}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-amber-600 font-medium bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                    <Clock className="w-4 h-4" />
                    Awaiting response from faculty. You will receive an notification update here once answered.
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* -- MODAL 1: ADD FACULTY MODAL -- */}
      <AnimatePresence>
        {isAddFacultyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Add New Faculty Member</h3>
                    <p className="text-[11px] text-emerald-300">Sarvadnya Vidyapeeth Directory</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddFacultyOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleAddFacultySubmit} className="p-5 space-y-3.5">
                {/* Faculty Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Faculty Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter faculty name"
                    value={newFacName}
                    onChange={(e) => setNewFacName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                {/* Role & Department Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Role / Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Assistant Professor / HOD"
                      value={newFacRole}
                      onChange={(e) => setNewFacRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
                    <select
                      value={newFacDept}
                      onChange={(e) => setNewFacDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="Computer Applications">Computer Applications</option>
                      <option value="Business Administration">Business Administration (BBA)</option>
                      <option value="Mathematics & Analytics">Mathematics & Analytics</option>
                      <option value="Humanities & Soft Skills">Humanities & Soft Skills</option>
                    </select>
                  </div>
                </div>

                {/* Contact Number & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter phone number"
                      value={newFacPhone}
                      onChange={(e) => setNewFacPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Official Email ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@sarvadnyavidyapeeth.in"
                      value={newFacEmail}
                      onChange={(e) => setNewFacEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                {/* Room / Office Location */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Room / Office Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 305, Academic Block B"
                    value={newFacRoom}
                    onChange={(e) => setNewFacRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                {/* Subjects Taught */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Subjects Taught (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Java Programming, Data Structures, Software Engineering"
                    value={newFacSubjects}
                    onChange={(e) => setNewFacSubjects(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddFacultyOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    Save & Add Faculty
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -- MODAL 2: QUERY SUBMISSION MODAL -- */}
      <AnimatePresence>
        {isQueryModalOpen && selectedFaculty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    <MessageSquare className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Ask Query to Faculty</h3>
                    <p className="text-[11px] text-purple-300">Sarvadnya Vidyapeeth Student ERP</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQueryModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitQuery} className="p-5 space-y-4">
                {/* Faculty Card Info */}
                <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Recipient Faculty</span>
                    <h4 className="text-xs font-bold text-slate-900">{selectedFaculty.name}</h4>
                    <p className="text-[11px] text-slate-500">{selectedFaculty.role}</p>
                  </div>
                  <div className="text-right text-[11px]">
                    <span className="text-purple-700 font-bold block">{selectedFaculty.phone}</span>
                    <span className="text-slate-500 block truncate max-w-[150px]">{selectedFaculty.email}</span>
                  </div>
                </div>

                {/* Query Subject */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Query Topic / Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Question regarding Assignment 2 / Attendance clarification"
                    value={querySubject}
                    onChange={(e) => setQuerySubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                {/* Urgency Level */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Priority / Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="Important">Important (Exam / Assignment related)</option>
                    <option value="Urgent">Urgent Assistance Needed</option>
                  </select>
                </div>

                {/* Query Message */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Detailed Message / Question <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type your question or query clearly here..."
                    value={queryMessage}
                    onChange={(e) => setQueryMessage(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsQueryModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    Submit Query
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

