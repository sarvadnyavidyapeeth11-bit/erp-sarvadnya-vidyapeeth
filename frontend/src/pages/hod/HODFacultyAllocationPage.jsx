import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  UserCheck,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
  Edit2,
  Trash2
} from "lucide-react";
import { getSubjects, saveSubject, deleteSubject, getCourses, getBatches, getActiveHODProfile, matchesActiveHODDepartment } from "../../hooks/academicMasterData";
import Pagination from "../../components/common/Pagination";

export default function HODFacultyAllocationPage() {
  const [subjects, setSubjects] = useState(() => getSubjects());
  const [courses, setCourses] = useState(() => getCourses());
  const [batches, setBatches] = useState(() => getBatches());
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, semesterFilter]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    shortName: "",
    courseCode: "",
    semester: "",
    type: "Core Theory",
    credits: 4,
    totalLectures: 45,
    assignedFacultyName: "",
    department: ""
  });

  const reloadData = () => {
    setSubjects(getSubjects());
    setCourses(getCourses());
    setBatches(getBatches());
  };

  useEffect(() => {
    window.addEventListener("academicDataUpdated", reloadData);
    window.addEventListener("storage", reloadData);
    return () => {
      window.removeEventListener("academicDataUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleOpenAdd = () => {
    const activeProfile = getActiveHODProfile();
    const firstCourse = getCourses().find((course) => matchesActiveHODDepartment(course, activeProfile));
    if (!firstCourse) {
      alert("No Admin-created course is connected to this HOD department.");
      return;
    }
    setEditingSubject(null);
    setFormData({
      code: "",
      name: "",
      shortName: "",
      courseCode: firstCourse.code,
      semester: "",
      type: "Core Theory",
      credits: 4,
      totalLectures: 45,
      assignedFacultyName: "",
      department: firstCourse.department
    });
    setShowModal(true);
  };

  const handleOpenEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({ ...subject });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this subject allocation?")) {
      deleteSubject(id);
      showNotification("Subject allocation removed successfully.");
      reloadData();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.courseCode || !formData.department) {
      alert("Please enter subject details and select a connected course.");
      return;
    }

    saveSubject({
      ...(editingSubject ? { id: editingSubject.id } : {}),
      ...formData,
      credits: Number(formData.credits),
      totalLectures: Number(formData.totalLectures)
    });

    showNotification(editingSubject ? "Subject allocation updated!" : "New Subject allocated successfully!");
    setShowModal(false);
    reloadData();
  };

  const activeProfile = getActiveHODProfile();
  const departmentCourses = courses.filter((course) => matchesActiveHODDepartment(course, activeProfile));
  const filteredSubjects = subjects.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (s.name || "").toLowerCase().includes(q) ||
      (s.code || "").toLowerCase().includes(q) ||
      (s.assignedFacultyName || "").toLowerCase().includes(q);
    const matchSem = semesterFilter === "All" || s.semester === semesterFilter;
    return matchesActiveHODDepartment(s, activeProfile) && matchSearch && matchSem;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-extrabold border border-purple-200">
              Department Workload Management
            </span>
            <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              {filteredSubjects.length} Active Allocations
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Faculty & Subject Workload Allocation
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Allocate departmental theory courses, practical programming labs, and lecture credits to faculty members.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-purple-200 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Allocate New Subject</span>
        </button>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject code, name, or faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
        >
          <option value="All">All Semesters</option>
          <option value="I SEM">I SEM</option>
          <option value="II SEM">II SEM</option>
          <option value="III SEM">III SEM</option>
          <option value="IV SEM">IV SEM</option>
          <option value="V SEM">V SEM</option>
          <option value="VI SEM">VI SEM</option>
        </select>
      </div>

      {/* Subject Allocations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((sub) => (
          <div
            key={sub.id}
            className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-200">
                  {sub.code} - {sub.semester}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(sub)}
                    className="p-1 hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 leading-snug">{sub.name}</h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{sub.type} - {sub.credits} Credits</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-gray-100 space-y-1 text-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Professor</p>
              <p className="font-extrabold text-purple-950 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
                {sub.assignedFacultyName || "Unassigned"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredSubjects.length / itemsPerPage) || 1}
        totalItems={filteredSubjects.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p) => setCurrentPage(p)}
        onItemsPerPageChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        itemsPerPageOptions={[6, 12, 24]}
      />

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  {editingSubject ? "Edit Subject Allocation" : "Allocate Subject to Faculty"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admin-created Course *</label>
                  <select
                    required
                    value={formData.courseCode}
                    onChange={(e) => {
                      const course = departmentCourses.find((item) => item.code === e.target.value);
                      setFormData({ ...formData, courseCode: e.target.value, department: course?.department || "" });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none"
                  >
                    <option value="">Select course</option>
                    {departmentCourses.map((course) => <option key={course.id} value={course.code}>{course.name} ({course.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter subject name"
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="Enter subject code"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Semester</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none"
                    >
                      <option>I SEM</option>
                      <option>II SEM</option>
                      <option>III SEM</option>
                      <option>IV SEM</option>
                      <option>V SEM</option>
                      <option>VI SEM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign Faculty / Professor *</label>
                  <input
                    type="text"
                    value={formData.assignedFacultyName}
                    onChange={(e) => setFormData({ ...formData, assignedFacultyName: e.target.value })}
                    className="w-full p-2.5 bg-purple-50 border border-purple-200 rounded-xl font-bold text-purple-900 outline-none"
                    placeholder="Faculty name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none"
                    >
                      <option>Core Theory</option>
                      <option>Practical Lab</option>
                      <option>Department Elective</option>
                      <option>Project Work / Viva</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Total Credits</label>
                    <input
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md transition-all mt-2 cursor-pointer"
                >
                  {editingSubject ? "Save Subject Allocation" : "Assign Faculty to Subject"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

