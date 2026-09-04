import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Building2
} from "lucide-react";
import {
  getCourses,
  saveCourse,
  deleteCourse,
  getDepartments,
  getCourseDependencies
} from "../../hooks/academicMasterData";
import Pagination from "../../components/common/Pagination";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState(() => getCourses());
  const [departments, setDepartments] = useState(() => getDepartments());
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, deptFilter]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    department: "",
    degreeLevel: "Undergraduate (UG)",
    durationYears: 3,
    totalSemesters: 6,
    annualFee: 0,
    intakeCapacity: 120,
    affiliatedUniversity: "",
    syllabusRevision: "",
    status: "Active"
  });

  const reloadData = () => {
    setCourses(getCourses());
    setDepartments(getDepartments());
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
    if (departments.length === 0) {
      alert("Create a department before adding a course program.");
      return;
    }
    setEditingCourse(null);
    setFormData({
      name: "",
      code: "",
      department: departments[0]?.name || "",
      degreeLevel: "Undergraduate (UG)",
      durationYears: 3,
      totalSemesters: 6,
      annualFee: "",
      intakeCapacity: "",
      affiliatedUniversity: "",
      syllabusRevision: "",
      status: "Active"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setFormData({ ...course });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const course = courses.find((item) => item.id === id);
    const dependencies = getCourseDependencies(course);
    if (dependencies.batches || dependencies.students) {
      alert(`This course is connected to ${dependencies.batches} batch(es) and ${dependencies.students} student(s). Reassign or remove those records first.`);
      return;
    }
    if (window.confirm("Are you sure you want to delete this course program?")) {
      deleteCourse(id);
      showNotification("Course program deleted successfully.");
      reloadData();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert("Please enter Course Name and Code.");
      return;
    }
    const selectedDepartment = departments.find((department) => department.name === formData.department);
    if (!selectedDepartment) {
      alert("Please select a valid host department.");
      return;
    }
    const duplicate = courses.some((course) => (
      course.id !== editingCourse?.id && (
        course.name?.trim().toLowerCase() === formData.name.trim().toLowerCase() ||
        course.code?.trim().toLowerCase() === formData.code.trim().toLowerCase()
      )
    ));
    if (duplicate) {
      alert("A course with this name or code already exists.");
      return;
    }

    saveCourse({
      ...(editingCourse ? { id: editingCourse.id } : {}),
      ...formData,
      departmentCode: selectedDepartment.code,
      annualFee: Number(formData.annualFee),
      durationYears: Number(formData.durationYears),
      totalSemesters: Number(formData.totalSemesters),
      intakeCapacity: Number(formData.intakeCapacity)
    });

    showNotification(editingCourse ? "Course program updated successfully!" : "New Course created successfully!");
    setShowModal(false);
    reloadData();
  };

  const filteredCourses = courses.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (c.name || "").toLowerCase().includes(q) ||
      (c.code || "").toLowerCase().includes(q) ||
      (c.department || "").toLowerCase().includes(q);
    const matchDept = deptFilter === "All" || c.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-black border border-purple-200 uppercase tracking-wider">
              Degree & Programs
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
              {courses.length} Active Courses
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Courses & Degree Programs Management
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Configure approved degrees, duration, approved fee structure, and department mappings.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-purple-200 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Course
        </button>
      </div>

      {/* Success Notification Alert */}
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

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search course name or code..."
            className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-black text-slate-600">Department:</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800">No Degree Programs / Courses Added Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the "Add Degree Program" button above to register your institution's academic courses and degree levels.
            </p>
          </div>
        ) : (
          filteredCourses
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-black text-sm shrink-0">
                  {course.code}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {course.name}
                  </h3>
                  <p className="text-xs font-bold text-purple-700 mt-0.5">
                    {course.degreeLevel} - {course.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(course)}
                  className="p-1.5 hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-lg transition-colors cursor-pointer"
                  title="Edit Course"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Program Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">Duration</p>
                <p className="font-black text-slate-900">{course.durationYears} Years</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
                <p className="text-[10px] font-bold uppercase text-slate-400">Semesters</p>
                <p className="font-black text-slate-900">{course.totalSemesters} Sem</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <p className="text-[10px] font-bold uppercase text-emerald-700">Annual Fee</p>
                <p className="font-black text-emerald-900 font-mono">Rs.{course.annualFee?.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <p className="text-[10px] font-bold uppercase text-blue-700">Seat Intake</p>
                <p className="font-black text-blue-900 font-mono">{course.intakeCapacity} Seats</p>
              </div>
            </div>
          </div>
        )))}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredCourses.length / itemsPerPage) || 1}
        totalItems={filteredCourses.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p) => setCurrentPage(p)}
        onItemsPerPageChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        itemsPerPageOptions={[6, 12, 24]}
      />

      {/* Add / Edit Course Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingCourse ? "Edit Course" : "Add New Course"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-black text-slate-700 mb-1">Course / Degree Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter program name"
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none focus:border-purple-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Course Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="Enter program code"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Degree Level</label>
                    <select
                      value={formData.degreeLevel}
                      onChange={(e) => setFormData({ ...formData, degreeLevel: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none"
                    >
                      <option>Undergraduate (UG)</option>
                      <option>Postgraduate (PG)</option>
                      <option>Diploma</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">Host Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none focus:border-purple-600"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Duration (Yrs)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.durationYears ?? ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setFormData({
                          ...formData,
                          durationYears: val ? Number(val) : "",
                          totalSemesters: val ? Number(val) * 2 : ""
                        });
                      }}
                      placeholder="e.g. 3"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Total Semesters</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.totalSemesters ?? ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setFormData({ ...formData, totalSemesters: val ? Number(val) : "" });
                      }}
                      placeholder="e.g. 6"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Annual Fee (Rs.)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.annualFee === 0 ? "" : (formData.annualFee ?? "")}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setFormData({ ...formData, annualFee: val ? Number(val) : "" });
                      }}
                      placeholder="e.g. 80000"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Seat Intake *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.intakeCapacity === 0 ? "" : (formData.intakeCapacity ?? "")}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setFormData({ ...formData, intakeCapacity: val ? Number(val) : "" });
                      }}
                      placeholder="e.g. 60"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Affiliated University</label>
                    <input
                      type="text"
                      value={formData.affiliatedUniversity || ""}
                      onChange={(e) => setFormData({ ...formData, affiliatedUniversity: e.target.value })}
                      placeholder="Enter affiliated university"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">Syllabus / Regulation</label>
                    <input
                      type="text"
                      value={formData.syllabusRevision || ""}
                      onChange={(e) => setFormData({ ...formData, syllabusRevision: e.target.value })}
                      placeholder="Enter syllabus regulation"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-200 transition-all cursor-pointer"
                  >
                    {editingCourse ? "Save Program" : "Create Program"}
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

