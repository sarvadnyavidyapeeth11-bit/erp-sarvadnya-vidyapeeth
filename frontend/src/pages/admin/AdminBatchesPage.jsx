import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  GraduationCap,
  DoorOpen,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw
} from "lucide-react";
import {
  getBatches,
  saveBatch,
  deleteBatch,
  getCourses,
  getDepartments,
  getBatchDependencies
} from "../../hooks/academicMasterData";
import {
  getBatchEnrollmentCount,
  getBatchesWithEnrollmentCounts,
  getStudentVerifications,
  getPromotionAcademicSession,
  getSemesterNumber,
  promoteBatchStudents
} from "../../hooks/adminData";
import { getFeeDetailsForStudent } from "../../hooks/studentPortalData";
import Pagination from "../../components/common/Pagination";

const semesterProgression = {
  "I SEM": "II SEM",
  "II SEM": "III SEM",
  "III SEM": "IV SEM",
  "IV SEM": "V SEM",
  "V SEM": "VI SEM",
  "VI SEM": "VII SEM",
  "VII SEM": "VIII SEM",
  "VIII SEM": "Graduated (Alumni)",
  "1st Sem": "2nd Sem",
  "2nd Sem": "3rd Sem",
  "3rd Sem": "4th Sem",
  "4th Sem": "5th Sem",
  "5th Sem": "6th Sem",
};

const semesterRegression = {
  "VIII SEM": "VII SEM",
  "VII SEM": "VI SEM",
  "VI SEM": "V SEM",
  "V SEM": "IV SEM",
  "IV SEM": "III SEM",
  "III SEM": "II SEM",
  "II SEM": "I SEM",
  "6th Sem": "5th Sem",
  "5th Sem": "4th Sem",
  "4th Sem": "3rd Sem",
  "3rd Sem": "2nd Sem",
  "2nd Sem": "1st Sem"
};

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState(() => (
    getBatchesWithEnrollmentCounts(getBatches(), getStudentVerifications())
  ));
  const [courses, setCourses] = useState(() => getCourses());
  const [departments, setDepartments] = useState(() => getDepartments());
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, courseFilter]);

  const [formData, setFormData] = useState({
    batchName: "",
    course: "",
    courseCode: "",
    department: "",
    academicSession: "",
    currentSemester: "",
    year: "",
    section: "",
    classCoordinator: "",
    classroom: "",
    capacity: "",
    enrolledCount: 0,
    status: "Active",
    startDate: "",
    expectedEndDate: ""
  });

  const reloadData = () => {
    setBatches(getBatchesWithEnrollmentCounts(getBatches(), getStudentVerifications()));
    setCourses(getCourses());
    setDepartments(getDepartments());
  };

  useEffect(() => {
    window.addEventListener("academicDataUpdated", reloadData);
    window.addEventListener("studentEnrollmentUpdated", reloadData);
    window.addEventListener("storage", reloadData);
    return () => {
      window.removeEventListener("academicDataUpdated", reloadData);
      window.removeEventListener("studentEnrollmentUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const isBlockedOddSemesterPromotion = (fromSem, toSem) => {
    const fromNo = getSemesterNumber(fromSem);
    const toNo = getSemesterNumber(toSem);
    return toNo > fromNo && toNo % 2 === 1;
  };

  const getBatchDueStudents = (batchName) => (
    getStudentVerifications()
      .filter((student) => String(student.batch || "").toLowerCase() === String(batchName || "").toLowerCase())
      .map((student) => ({
        name: student.studentName || student.name || student.scholarNo || student.rollNumber,
        due: getFeeDetailsForStudent(student.rollNumber || student.scholarNo).totalPending || 0
      }))
      .filter((student) => student.due > 0)
  );

  const alertBlockedPromotion = (targetSemester, dueStudents) => {
    const sample = dueStudents.slice(0, 5).map((student) => `${student.name}: Rs.${student.due.toLocaleString("en-IN")}`).join("\n");
    alert(`Cannot promote to ${targetSemester}. Current session fee dues clear hona zaroori hai.\n\nPending students: ${dueStudents.length}\n${sample}`);
  };

  const handleOpenAdd = () => {
    if (courses.length === 0) {
      alert("Create a course program before creating a batch.");
      return;
    }
    const defaultCourse = courses[0];
    const defaultDept = departments.find(d => d.name === defaultCourse.department || d.code === defaultCourse.departmentCode) || departments[0] || {};
    setEditingBatch(null);
    setFormData({
      batchName: "",
      course: defaultCourse.name,
      courseCode: defaultCourse.code,
      department: defaultCourse.department,
      academicSession: "",
      currentSemester: "",
      year: "",
      section: "",
      classCoordinator: defaultDept.hodName || "",
      classroom: defaultDept.buildingBlock || "",
      capacity: defaultCourse.intakeCapacity || "",
      enrolledCount: 0,
      status: "Active",
      startDate: "",
      expectedEndDate: ""
    });
    setShowModal(true);
  };

  const handleOpenEdit = (batch) => {
    setEditingBatch(batch);
    setFormData({ ...batch });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const batch = batches.find((item) => item.id === id);
    const dependencies = getBatchDependencies(batch);
    if (dependencies.students) {
      alert(`This batch is connected to ${dependencies.students} student(s). Move or delete those student records before deleting the batch.`);
      return;
    }
    if (window.confirm("Are you sure you want to delete this batch?")) {
      deleteBatch(id);
      showNotification("Batch deleted successfully.");
      reloadData();
    }
  };

  const handlePromoteBatch = (batch) => {
    const currentSem = batch.currentSemester || "I SEM";
    const nextSem = semesterProgression[currentSem] || "II SEM";
    const nextSession = getPromotionAcademicSession(batch.academicSession, currentSem, nextSem) || batch.academicSession;
    if (isBlockedOddSemesterPromotion(currentSem, nextSem)) {
      const dueStudents = getBatchDueStudents(batch.batchName);
      if (dueStudents.length > 0) {
        alertBlockedPromotion(nextSem, dueStudents);
        return;
      }
    }

    if (window.confirm(`Promote Batch "${batch.batchName}" from ${currentSem} to ${nextSem}?\n\nAcademic Session: ${batch.academicSession || "Not assigned"} -> ${nextSession || "Not assigned"}\n\nAll enrolled students in this batch will be automatically upgraded.`)) {
      saveBatch({
        ...batch,
        academicSession: nextSession,
        currentSemester: nextSem
      });
      promoteBatchStudents(batch.batchName, nextSem, nextSession);
      showNotification(`Batch "${batch.batchName}" promoted to ${nextSem} (${nextSession || "same session"}).`);
      reloadData();
    }
  };

  const handleRevertBatch = (batch) => {
    const currentSem = batch.currentSemester || "II SEM";
    const prevSem = semesterRegression[currentSem];

    if (!prevSem) {
      alert(`Batch "${batch.batchName}" is at ${currentSem} (cannot revert below I SEM).`);
      return;
    }

    const prevSession = getPromotionAcademicSession(batch.academicSession, currentSem, prevSem) || batch.academicSession;

    if (window.confirm(`Warning: REVERT PROMOTION: Are you sure you want to roll back Batch "${batch.batchName}" from ${currentSem} back to ${prevSem}?\n\nAcademic Session: ${batch.academicSession || "Not assigned"} -> ${prevSession || "Not assigned"}\n\nAll enrolled students in this batch will be reverted.`)) {
      saveBatch({
        ...batch,
        academicSession: prevSession,
        currentSemester: prevSem
      });
      promoteBatchStudents(batch.batchName, prevSem, prevSession);
      showNotification(`Batch "${batch.batchName}" reverted to ${prevSem} (${prevSession || "same session"}).`);
      reloadData();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.batchName || !formData.course || !formData.currentSemester) {
      alert("Please provide Batch Name, Course, and Semester.");
      return;
    }
    const selectedCourse = courses.find((course) => course.name === formData.course);
    if (!selectedCourse) {
      alert("Please select a valid course program.");
      return;
    }
    const duplicate = batches.some((batch) => (
      batch.id !== editingBatch?.id &&
      batch.batchName?.trim().toLowerCase() === formData.batchName.trim().toLowerCase()
    ));
    if (duplicate) {
      alert("A batch with this name already exists.");
      return;
    }

    const batchToSave = {
      ...(editingBatch ? { id: editingBatch.id } : {}),
      ...formData,
      course: selectedCourse.name,
      courseCode: selectedCourse.code,
      department: selectedCourse.department,
      capacity: Number(formData.capacity)
    };

    if (
      editingBatch &&
      isBlockedOddSemesterPromotion(editingBatch.currentSemester, batchToSave.currentSemester)
    ) {
      const dueStudents = getBatchDueStudents(editingBatch.batchName);
      if (dueStudents.length > 0) {
        alertBlockedPromotion(batchToSave.currentSemester, dueStudents);
        return;
      }
      batchToSave.academicSession = getPromotionAcademicSession(editingBatch.academicSession, editingBatch.currentSemester, batchToSave.currentSemester) || batchToSave.academicSession;
    }

    saveBatch({
      ...batchToSave,
      enrolledCount: getBatchEnrollmentCount(editingBatch || batchToSave, getStudentVerifications())
    });

    showNotification(editingBatch ? "Batch updated successfully!" : "New Batch created successfully!");
    setShowModal(false);
    reloadData();
  };

  const filteredBatches = batches.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (b.batchName || "").toLowerCase().includes(q) ||
      (b.course || "").toLowerCase().includes(q) ||
      (b.classCoordinator || "").toLowerCase().includes(q);
    const matchCourse = courseFilter === "All" || b.courseCode === courseFilter;
    return matchSearch && matchCourse;
  });
  const sessionOptions = Array.from(new Set(batches.map((batch) => batch.academicSession).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-black border border-purple-200 uppercase tracking-wider">
              Batches & Sections
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
              {batches.length} Active Batches
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Academic Batches & Sections
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Create intake cohorts, assign academic sessions, sections, and classroom allocations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-purple-200 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Batch
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
            placeholder="Search batch, coordinator..."
            className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-black text-slate-600">Course:</label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
          >
            <option value="All">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBatches.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800">No Academic Batches Created Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the "Create Academic Batch" button above to configure sessions, semesters, and class coordinators.
            </p>
          </div>
        ) : (
          filteredBatches
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((batch) => (
          <div
            key={batch.id}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-black text-sm shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {batch.batchName}
                  </h3>
                  <p className="text-xs font-bold text-purple-700 mt-0.5">
                    {batch.currentSemester} - {batch.section} - Session {batch.academicSession}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(batch)}
                  className="p-1.5 hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-lg transition-colors cursor-pointer"
                  title="Edit Batch"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(batch.id)}
                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Delete Batch"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-gray-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-black text-slate-400">
                <span>Class Coordinator</span>
                <span className="text-slate-600 font-bold">{batch.classroom}</span>
              </div>
              <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-purple-600" />
                {batch.classCoordinator}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                <span>{batch.course}</span>
                <span className="font-bold text-purple-700">{batch.enrolledCount} / {batch.capacity} Students Enrolled</span>
              </div>

              {/* Semester Progression & Revert Actions */}
              <div className="pt-2 border-t border-gray-200/70 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Actions:</span>
                <div className="flex items-center gap-1.5">
                  {semesterRegression[batch.currentSemester] && (
                    <button
                      type="button"
                      onClick={() => handleRevertBatch(batch)}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                      title={`Roll back batch to ${semesterRegression[batch.currentSemester]}`}
                    >
                      <RotateCcw className="w-3 h-3 text-amber-700" />
                      <span>Revert ({semesterRegression[batch.currentSemester]})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handlePromoteBatch(batch)}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
                    title="Promote entire batch to next semester"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                    <span>Promote ({semesterProgression[batch.currentSemester] || "Next Sem"})</span>
                    <ArrowRight className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )))}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredBatches.length / itemsPerPage) || 1}
        totalItems={filteredBatches.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p) => setCurrentPage(p)}
        onItemsPerPageChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        itemsPerPageOptions={[6, 12, 24]}
      />

      {/* Add / Edit Batch Modal */}
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
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingBatch ? "Edit Batch" : "Create New Batch"}
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Batch Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.batchName}
                      onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                      placeholder="Enter batch name"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Academic Session *</label>
                    <input
                      type="text"
                      list="batch-academic-sessions"
                      required
                      value={formData.academicSession}
                      onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                      placeholder="Enter academic session"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                    <datalist id="batch-academic-sessions">
                      {sessionOptions.map((session) => (
                        <option key={session} value={session} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">Course Program *</label>
                  <select
                    value={formData.course}
                    onChange={(e) => {
                      const sel = courses.find(c => c.name === e.target.value);
                      const selDept = departments.find(d => d.name === sel?.department || d.code === sel?.departmentCode) || {};
                      setFormData({
                        ...formData,
                        course: e.target.value,
                        courseCode: sel?.code || formData.courseCode,
                        department: sel?.department || formData.department,
                        capacity: sel?.intakeCapacity || formData.capacity || "",
                        classCoordinator: selDept.hodName || formData.classCoordinator,
                        classroom: selDept.buildingBlock || formData.classroom
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Semester</label>
                    <select
                      value={formData.currentSemester}
                      required
                      onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    >
                      <option value="">Select semester</option>
                      <option>I SEM</option>
                      <option>II SEM</option>
                      <option>III SEM</option>
                      <option>IV SEM</option>
                      <option>V SEM</option>
                      <option>VI SEM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Section</label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      placeholder="e.g. Section A"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Capacity</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.capacity === 0 ? "" : (formData.capacity ?? "")}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setFormData({ ...formData, capacity: val ? Number(val) : "" });
                      }}
                      placeholder="e.g. 60"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Class Coordinator</label>
                    <input
                      type="text"
                      value={formData.classCoordinator}
                      onChange={(e) => setFormData({ ...formData, classCoordinator: e.target.value })}
                      placeholder="Enter coordinator name"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Classroom Location</label>
                    <input
                      type="text"
                      value={formData.classroom}
                      onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                      placeholder="e.g. LT-101 (Main Block)"
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
                    {editingBatch ? "Save Batch" : "Create Batch"}
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

