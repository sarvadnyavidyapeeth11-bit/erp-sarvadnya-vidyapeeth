import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Search,
  CheckCircle2,
  Building2,
  GraduationCap,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  CreditCard,
  Hash,
  AlertCircle,
  Filter,
  Users,
  Layers,
  Pencil,
  Trash2,
  X
} from "lucide-react";
import {
  getDepartments,
  getCourses,
  getBatches
} from "../../hooks/academicMasterData";
import {
  getBatchEnrollmentCount,
  getStudentVerifications,
  saveStudentEnrollment,
  updateStudentFromAdmin,
  deleteStudentFromAdmin,
  getSemesterNumber
} from "../../hooks/adminData";
import { getFeeDetailsForStudent } from "../../hooks/studentPortalData";
import Pagination from "../../components/common/Pagination";

export default function AdmissionEnrollmentPage() {
  const [departments, setDepartments] = useState(() => getDepartments());
  const [courses, setCourses] = useState(() => getCourses());
  const [batches, setBatches] = useState(() => getBatches());
  const [enrollments, setEnrollments] = useState(() => getStudentVerifications());
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [sessionFilter, setSessionFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, batchFilter, sessionFilter, deptFilter]);

  const [formData, setFormData] = useState({
    studentName: "",
    studentNameHindi: "",
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    category: "",
    religion: "",
    nationality: "",
    abcId: "",
    aadhar: "",
    phone: "",
    email: "",
    permanentAddress: "",
    permanentCity: "",
    permanentState: "",
    permanentPincode: "",
    correspondenceAddress: "",
    department: "",
    course: "",
    courseCode: "",
    batch: "",
    session: "",
    semester: "",
    section: "",
    remarks: ""
  });

  const reloadData = () => {
    setDepartments(getDepartments());
    setCourses(getCourses());
    setBatches(getBatches());
    setEnrollments(getStudentVerifications());
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

  // Compute live unique academic sessions purely from real-time database records
  const liveSessions = Array.from(
    new Set([
      ...batches.map((b) => b.academicSession),
      ...enrollments.map((s) => s.session)
    ].filter(Boolean))
  );

  const dropdownSessionOptions = liveSessions;

  const selectedDepartment = departments.find((department) => department.name === formData.department);
  const coursesForSelectedDepartment = courses.filter((course) => (
    course.department === formData.department || course.departmentCode === selectedDepartment?.code
  ));
  const batchesForSelectedCourse = batches.filter((batch) => (
    batch.courseCode === formData.courseCode || batch.course === formData.course
  ));
  const selectedEditDepartment = departments.find((department) => department.name === editFormData.department);
  const editCoursesForSelectedDepartment = courses.filter((course) => (
    course.department === editFormData.department || course.departmentCode === selectedEditDepartment?.code
  ));
  const editBatchesForSelectedCourse = batches.filter((batch) => (
    batch.courseCode === editFormData.courseCode || batch.course === editFormData.course
  ));

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setEditFormData({
      studentName: student.studentName || student.name || "",
      scholarNo: student.scholarNo || "",
      enrollmentNo: student.enrollmentNo || "",
      fatherName: student.fatherName || "",
      phone: student.phone || "",
      email: student.email || "",
      dob: student.dob || "",
      aadhar: student.aadhar || "",
      abcId: student.abcId || "",
      course: student.course || student.courseClass || "",
      courseCode: student.courseCode || "",
      department: student.department || "",
      batch: student.batch || "",
      session: student.session || "",
      semester: student.semester || "",
      section: student.section || "",
      permanentAddress: student.permanentAddress || "",
      permanentCity: student.permanentCity || "",
      permanentState: student.permanentState || "",
      permanentPincode: student.permanentPincode || ""
    });
  };

  const handleSaveAdminEdit = (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    const selectedBatch = batches.find((batch) => batch.batchName === editFormData.batch);
    if (!selectedBatch) {
      alert("Please select a valid Admin-configured batch.");
      return;
    }
    const fromSemNo = getSemesterNumber(editingStudent.semester);
    const toSemNo = getSemesterNumber(selectedBatch.currentSemester);
    if (toSemNo > fromSemNo && toSemNo % 2 === 1) {
      const due = getFeeDetailsForStudent(editingStudent.rollNumber || editingStudent.scholarNo).totalPending || 0;
      if (due > 0) {
        alert(`Cannot move this student to ${selectedBatch.currentSemester}. Current session fee due Rs.${due.toLocaleString("en-IN")} clear hona zaroori hai.`);
        return;
      }
    }

    const targetId = editingStudent.id || editingStudent.scholarNo || editingStudent.rollNumber;
    updateStudentFromAdmin(targetId, {
      ...editFormData,
      department: selectedBatch.department,
      course: selectedBatch.course,
      courseCode: selectedBatch.courseCode,
      session: selectedBatch.academicSession,
      semester: selectedBatch.currentSemester,
      section: selectedBatch.section
    });
    showNotification(`Updated: Student enrollment for ${editFormData.studentName} updated.`);
    setEditingStudent(null);
    reloadData();
  };

  const handleDeleteStudent = (student) => {
    const studentName = student.studentName || student.name || "Student";
    if (window.confirm(`Are you sure you want to delete student "${studentName}" (Scholar No: ${student.scholarNo || student.rollNumber})?`)) {
      deleteStudentFromAdmin(student.id || student.scholarNo || student.rollNumber);
      showNotification(`Deleted: Student record for ${studentName} deleted successfully.`);
      reloadData();
    }
  };

  const handleEditDepartmentChange = (deptName) => {
    const department = departments.find((item) => item.name === deptName);
    const matchingCourses = courses.filter((course) => (
      course.department === deptName || course.departmentCode === department?.code
    ));
    const selectedCourse = matchingCourses[0] || null;
    const matchingBatches = batches.filter((batch) => (
      batch.courseCode === selectedCourse?.code || batch.course === selectedCourse?.name
    ));
    const selectedBatch = matchingBatches[0] || null;

    setEditFormData((prev) => ({
      ...prev,
      department: deptName,
      course: selectedCourse?.name || "",
      courseCode: selectedCourse?.code || "",
      batch: selectedBatch?.batchName || "",
      session: selectedBatch?.academicSession || "",
      semester: selectedBatch?.currentSemester || "",
      section: selectedBatch?.section || ""
    }));
  };

  const handleEditCourseChange = (courseName) => {
    const selectedCourse = courses.find((course) => course.name === courseName);
    const matchingBatches = batches.filter((batch) => (
      batch.courseCode === selectedCourse?.code || batch.course === selectedCourse?.name
    ));
    const selectedBatch = matchingBatches[0] || null;

    setEditFormData((prev) => ({
      ...prev,
      course: courseName,
      courseCode: selectedCourse?.code || "",
      department: selectedCourse?.department || prev.department,
      batch: selectedBatch?.batchName || "",
      session: selectedBatch?.academicSession || "",
      semester: selectedBatch?.currentSemester || "",
      section: selectedBatch?.section || ""
    }));
  };

  const handleEditBatchChange = (batchName) => {
    const selectedBatch = batches.find((batch) => batch.batchName === batchName);
    setEditFormData((prev) => ({
      ...prev,
      batch: batchName,
      department: selectedBatch?.department || prev.department,
      course: selectedBatch?.course || prev.course,
      courseCode: selectedBatch?.courseCode || prev.courseCode,
      session: selectedBatch?.academicSession || "",
      semester: selectedBatch?.currentSemester || "",
      section: selectedBatch?.section || ""
    }));
  };

  const handleOpenModal = () => {
    const defDept = departments[0]?.name || "";
    const defCourse = courses.find((course) => course.department === defDept) || null;
    const defBatch = batches.find((batch) => (
      batch.courseCode === defCourse?.code || batch.course === defCourse?.name
    )) || null;

    setFormData({
      studentName: "",
      studentNameHindi: "",
      fatherName: "",
      motherName: "",
      dob: "",
      gender: "",
      bloodGroup: "",
      category: "",
      religion: "",
      nationality: "",
      abcId: "",
      aadhar: "",
      phone: "",
      email: "",
      permanentAddress: "",
      permanentCity: "",
      permanentState: "",
      permanentPincode: "",
      correspondenceAddress: "",
      department: defDept,
      course: defCourse?.name || "",
      courseCode: defCourse?.code || "",
      batch: defBatch?.batchName || "",
      session: defBatch?.academicSession || "",
      semester: defBatch?.currentSemester || "",
      section: defBatch?.section || "",
      remarks: ""
    });
    setShowModal(true);
  };

  const handleDepartmentChange = (deptName) => {
    const department = departments.find((item) => item.name === deptName);
    const matchingCourses = courses.filter(c => c.department === deptName || c.departmentCode === department?.code);
    const selCourse = matchingCourses[0] || null;
    const matchingBatches = batches.filter(b => b.courseCode === selCourse?.code || b.course === selCourse?.name);
    const selBatch = matchingBatches[0] || null;

    setFormData(prev => ({
      ...prev,
      department: deptName,
      course: selCourse?.name || "",
      courseCode: selCourse?.code || "",
      batch: selBatch?.batchName || "",
      session: selBatch?.academicSession || "",
      semester: selBatch?.currentSemester || "",
      section: selBatch?.section || ""
    }));
  };

  const handleCourseChange = (courseName) => {
    const selCourse = courses.find(c => c.name === courseName);
    const matchingBatches = batches.filter(b => b.courseCode === selCourse?.code || b.course === selCourse?.name);
    const selBatch = matchingBatches[0] || null;

    setFormData(prev => ({
      ...prev,
      course: courseName,
      courseCode: selCourse?.code || "",
      department: selCourse?.department || prev.department,
      batch: selBatch?.batchName || "",
      session: selBatch?.academicSession || "",
      semester: selBatch?.currentSemester || "",
      section: selBatch?.section || ""
    }));
  };

  const handleBatchChange = (batchName) => {
    const selBatch = batches.find(b => b.batchName === batchName);
    setFormData(prev => ({
      ...prev,
      batch: batchName,
      department: selBatch?.department || prev.department,
      course: selBatch?.course || prev.course,
      courseCode: selBatch?.courseCode || prev.courseCode,
      session: selBatch?.academicSession || "",
      semester: selBatch?.currentSemester || "",
      section: selBatch?.section || ""
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.phone || !formData.aadhar) {
      alert("Please enter Student Name, Phone Number, and Aadhar Number.");
      return;
    }

    const selectedCourse = courses.find((course) => course.name === formData.course && course.code === formData.courseCode);
    const selectedBatch = batches.find((batch) => batch.batchName === formData.batch);
    const validCourse = selectedCourse && (
      selectedCourse.department === formData.department || selectedCourse.departmentCode === selectedDepartment?.code
    );
    const validBatch = selectedBatch && (
      selectedBatch.courseCode === selectedCourse?.code || selectedBatch.course === selectedCourse?.name
    );
    if (!validCourse || !validBatch) {
      alert("Please select a valid Department, Course, and connected Batch before enrolling the student.");
      return;
    }

    const enrolledCount = getBatchEnrollmentCount(selectedBatch, enrollments);
    if (Number(selectedBatch.capacity) > 0 && enrolledCount >= Number(selectedBatch.capacity)) {
      alert(`Batch ${selectedBatch.batchName} is full (${enrolledCount}/${selectedBatch.capacity}).`);
      return;
    }

    const created = saveStudentEnrollment({
      ...formData,
      department: selectedBatch.department || selectedCourse.department,
      course: selectedBatch.course || selectedCourse.name,
      courseCode: selectedBatch.courseCode || selectedCourse.code,
      batch: selectedBatch.batchName,
      session: selectedBatch.academicSession,
      semester: selectedBatch.currentSemester,
      section: selectedBatch.section,
      status: "Pending Verification"
    });

    showNotification(`Success: Student ${created.studentName} Enrolled! 6-Digit Scholar No (Login ID & Pass): ${created.scholarNo} | Enrollment No: ${created.enrollmentNo}`);
    setShowModal(false);
    reloadData();
  };

  const filteredStudents = enrollments.filter(st => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      String(st.studentName || "").toLowerCase().includes(q) ||
      String(st.rollNumber || "").toLowerCase().includes(q) ||
      String(st.batch || "").toLowerCase().includes(q) ||
      String(st.course || "").toLowerCase().includes(q) ||
      String(st.abcId || "").toLowerCase().includes(q) ||
      String(st.aadhar || "").toLowerCase().includes(q) ||
      String(st.department || "").toLowerCase().includes(q);

    const matchBatch = batchFilter === "All" || st.batch === batchFilter;
    const matchDept = deptFilter === "All" || st.department === deptFilter;
    const matchedBatchObj = batches.find(b => b.batchName === st.batch);
    const studentSession = st.session || matchedBatchObj?.academicSession;
    const matchSession = sessionFilter === "All" || studentSession === sessionFilter;

    return matchSearch && matchBatch && matchDept && matchSession;
  });

  const liveActiveDeptsCount = new Set([
    ...departments.map((d) => d.name),
    ...filteredStudents.map((s) => s.department)
  ].filter(Boolean)).size;

  const liveActiveBatchesCount = new Set([
    ...batches.map((b) => b.batchName),
    ...filteredStudents.map((s) => s.batch)
  ].filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-black border border-purple-200 uppercase tracking-wider">
              Admissions Officer Desk
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
              {enrollments.length} Total Enrolled
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Batch-wise & Department-wise Student Enrollment
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Enroll student with Identity Keys (ABC ID, Aadhar, Address, Batch & Session). Real-time data synchronized across all portals.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-purple-200 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Enroll New Student
        </button>
      </div>

      {/* Real-time Dynamic KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Total Enrolled</p>
            <p className="text-lg font-black text-slate-900">{filteredStudents.length}</p>
            {filteredStudents.length !== enrollments.length && (
              <p className="text-[9px] font-bold text-slate-400">of {enrollments.length} Total</p>
            )}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Active Depts</p>
            <p className="text-lg font-black text-slate-900">{liveActiveDeptsCount}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Active Batches</p>
            <p className="text-lg font-black text-slate-900">{liveActiveBatchesCount}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Academic Sessions</p>
            <p className="text-lg font-black text-slate-900">{liveSessions.length}</p>
          </div>
        </div>
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

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student name, Scholar No, ABC ID, Aadhar..."
            className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-black text-slate-600">Dept:</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-black text-slate-600">Batch:</label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
            >
              <option value="All">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.batchName}>
                  {b.batchName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-black text-slate-600">Session:</label>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-purple-600"
            >
              <option value="All">All Sessions</option>
              {dropdownSessionOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enrolled Students Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-200 text-[11px] font-black uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Student & Scholar No</th>
                <th className="py-3.5 px-4">Department & Course</th>
                <th className="py-3.5 px-4">Enrolled Batch & Session</th>
                <th className="py-3.5 px-4">ABC ID & Aadhar No</th>
                <th className="py-3.5 px-4">Address & Contact</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                    No enrolled students found matching the selected batch, session, or search filter.
                  </td>
                </tr>
              ) : (
                filteredStudents
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((st) => {
                    const matchedBatch = batches.find(b => b.batchName === st.batch);
                    const displaySession = st.session || matchedBatch?.academicSession || "";
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-slate-900">{st.studentName || st.name}</p>
                          <p className="font-mono text-[11px] text-purple-700 font-bold mt-0.5">Scholar No: {st.scholarNo || st.rollNumber}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800">{st.course}</p>
                          <p className="text-[11px] text-slate-500">{st.department}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-800 font-black rounded-md border border-purple-200 text-[10px]">
                            {st.batch || "Not Assigned"}
                          </span>
                          <p className="text-[10px] text-slate-500 font-bold mt-1">
                            {st.semester || "I SEM"} - {st.section ? `Sec ${st.section}` : "Sec A"} - Session {displaySession}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <p className="text-indigo-700 font-bold">ABC: {st.abcId}</p>
                          <p className="text-slate-600">UID: {st.aadhar}</p>
                        </td>
                        <td className="py-3.5 px-4 text-[11px]">
                          <p className="text-slate-700 font-semibold truncate max-w-[200px]">{st.permanentAddress || st.address}</p>
                          <p className="text-slate-500 font-bold mt-0.5">{st.phone}</p>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                            st.status === "Verified" ? "bg-emerald-100 text-emerald-800" : st.status === "Rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {st.status === "Verified" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {st.status || "Pending Audit"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(st)}
                              className="px-2.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="Edit Student Enrollment"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(st)}
                              className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-black transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="Delete Student Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredStudents.length / itemsPerPage) || 1}
          totalItems={filteredStudents.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
          itemsPerPageOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Edit Enrolled Student Modal */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col my-auto overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2.5 text-indigo-700">
                  <Pencil className="w-5 h-5 shrink-0" />
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">Edit Student Enrollment Record</h3>
                    <p className="text-[11px] text-slate-500 font-bold">Scholar No: {editingStudent.scholarNo || editingStudent.rollNumber}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form id="enrollmentEditForm" onSubmit={handleSaveAdminEdit} className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-2.5">
                  <p className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> Academic Cohort Allocation
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Target Department *</label>
                      <select
                        required
                        value={editFormData.department || ""}
                        onChange={(e) => handleEditDepartmentChange(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      >
                        <option value="" disabled>Select department</option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.name}>{department.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Degree Course *</label>
                      <select
                        required
                        value={editFormData.course || ""}
                        onChange={(e) => handleEditCourseChange(e.target.value)}
                        disabled={!editFormData.department || editCoursesForSelectedDepartment.length === 0}
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      >
                        <option value="" disabled>{editCoursesForSelectedDepartment.length ? "Select course" : "No course configured"}</option>
                        {editCoursesForSelectedDepartment.map((course) => (
                          <option key={course.id} value={course.name}>{course.name} ({course.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Enrolled Batch *</label>
                      <select
                        required
                        value={editFormData.batch || ""}
                        onChange={(e) => handleEditBatchChange(e.target.value)}
                        disabled={!editFormData.course || editBatchesForSelectedCourse.length === 0}
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      >
                        <option value="" disabled>{editBatchesForSelectedCourse.length ? "Select batch" : "No batch configured"}</option>
                        {editBatchesForSelectedCourse.map((batch) => (
                          <option key={batch.id} value={batch.batchName}>{batch.batchName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Academic Session *</label>
                      <select
                        value={editFormData.session || ""}
                        disabled
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none"
                      >
                        <option value="">Select batch first</option>
                        {editFormData.session && <option value={editFormData.session}>{editFormData.session}</option>}
                      </select>
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Semester</label>
                      <select
                        value={editFormData.semester || ""}
                        disabled
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none"
                      >
                        <option>I SEM</option>
                        <option>II SEM</option>
                        <option>III SEM</option>
                        <option>IV SEM</option>
                        <option>V SEM</option>
                        <option>VI SEM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Section</label>
                      <input
                        type="text"
                        value={editFormData.section || ""}
                        readOnly
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600" /> Student Profile Details
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Student Full Name *</label>
                      <input
                        type="text"
                        required
                        value={editFormData.studentName || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, studentName: e.target.value })}
                        placeholder="Enter student full name"
                        className="w-full p-2 bg-slate-50 border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Father's Name *</label>
                      <input
                        type="text"
                        required
                        value={editFormData.fatherName || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })}
                        placeholder="Enter father's name"
                        className="w-full p-2 bg-slate-50 border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Student Mobile *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={editFormData.phone || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        placeholder="Enter mobile number"
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Student Email</label>
                      <input
                        type="email"
                        value={editFormData.email || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        placeholder="Enter email address"
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Date of Birth</label>
                      <input
                        type="date"
                        value={editFormData.dob || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">Gender</label>
                      <select
                        value={editFormData.gender || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                      >
                        <option value="">-- Select Gender --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">Category</label>
                      <select
                        value={editFormData.category || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                      >
                        <option value="">-- Select Category --</option>
                        <option value="GEN">GEN</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Govt. Academic Bank of Credits (ABC ID) *</label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={editFormData.abcId || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, abcId: e.target.value })}
                        placeholder="Enter ABC ID"
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold font-mono text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Aadhaar Number (UIDAI) *</label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={editFormData.aadhar || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, aadhar: e.target.value })}
                        placeholder="Enter Aadhaar number"
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold font-mono text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-2.5">
                  <p className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" /> Student Residential Address
                  </p>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">Permanent Residential Address *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.permanentAddress || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, permanentAddress: e.target.value })}
                      placeholder="House / Flat No., Street, Landmark, Area"
                      className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">City / District</label>
                      <input
                        type="text"
                        value={editFormData.permanentCity || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, permanentCity: e.target.value })}
                        placeholder="Enter city or district"
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">State</label>
                      <input
                        type="text"
                        value={editFormData.permanentState || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, permanentState: e.target.value })}
                        placeholder="Enter state"
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">Pincode</label>
                      <input
                        type="text"
                        value={editFormData.permanentPincode || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, permanentPincode: e.target.value })}
                        placeholder="Enter pincode"
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="px-5 py-3 border-t border-gray-100 bg-slate-50 shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="enrollmentEditForm"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200 cursor-pointer"
                >
                  Save Student Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enroll Student Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[88vh] flex flex-col my-auto overflow-hidden"
            >
              {/* Sticky Modal Header */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                      Enroll Student (Admissions Desk Registration)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Fill student identity and cohort details to generate Scholar No</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form id="enrollForm" onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
                {/* Academic Allocation Section */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-2.5">
                  <p className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> Academic Cohort Allocation
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Target Department *</label>
                      <select
                        required
                        value={formData.department}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      >
                        <option value="" disabled>Select department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Degree Course *</label>
                      <select
                        required
                        value={formData.course}
                        onChange={(e) => handleCourseChange(e.target.value)}
                        disabled={!formData.department || coursesForSelectedDepartment.length === 0}
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      >
                        <option value="" disabled>{coursesForSelectedDepartment.length ? "Select course" : "No course configured"}</option>
                        {coursesForSelectedDepartment.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Enrolled Batch *</label>
                      <select
                        required
                        value={formData.batch}
                        onChange={(e) => handleBatchChange(e.target.value)}
                        disabled={!formData.course || batchesForSelectedCourse.length === 0}
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      >
                        <option value="" disabled>{batchesForSelectedCourse.length ? "Select batch" : "No batch configured"}</option>
                        {batchesForSelectedCourse.map((b) => (
                          <option key={b.id} value={b.batchName}>
                            {b.batchName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Academic Session *</label>
                      <select
                        value={formData.session}
                        disabled
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      >
                        <option value="">Select batch first</option>
                        {formData.session && <option value={formData.session}>{formData.session}</option>}
                      </select>
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Semester</label>
                      <select
                        value={formData.semester}
                        disabled
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none"
                      >
                        <option>I SEM</option>
                        <option>II SEM</option>
                        <option>III SEM</option>
                        <option>IV SEM</option>
                        <option>V SEM</option>
                        <option>VI SEM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Section</label>
                      <input
                        type="text"
                        value={formData.section}
                        readOnly
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Student Details */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600" /> Student Profile Details
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Student Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.studentName}
                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                        placeholder="Enter student full name"
                        className="w-full p-2 bg-slate-50 border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Father's Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        placeholder="Enter father's name"
                        className="w-full p-2 bg-slate-50 border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Student Mobile *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter mobile number"
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Student Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                      >
                        <option value="">-- Select Gender --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                      >
                        <option value="">-- Select Category --</option>
                        <option value="GEN">GEN</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">
                        Govt. Academic Bank of Credits (ABC ID) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={formData.abcId}
                        onChange={(e) => setFormData({ ...formData, abcId: e.target.value })}
                        placeholder="Enter ABC ID"
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold font-mono text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 mb-1 text-[11px]">
                        Aadhaar Number (UIDAI) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={formData.aadhar}
                        onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
                        placeholder="Enter Aadhaar number"
                        className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold font-mono text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Student Address Details */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-2.5">
                  <p className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" /> Student Residential Address
                  </p>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">Permanent Residential Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.permanentAddress}
                      onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                      placeholder="House / Flat No., Street, Landmark, Area"
                      className="w-full p-2 bg-white border border-gray-300 rounded-xl font-bold text-xs outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">City / District</label>
                      <input
                        type="text"
                        value={formData.permanentCity}
                        onChange={(e) => setFormData({ ...formData, permanentCity: e.target.value })}
                        placeholder="Enter city or district"
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">State</label>
                      <input
                        type="text"
                        value={formData.permanentState}
                        onChange={(e) => setFormData({ ...formData, permanentState: e.target.value })}
                        placeholder="Enter state"
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">Pincode</label>
                      <input
                        type="text"
                        value={formData.permanentPincode}
                        onChange={(e) => setFormData({ ...formData, permanentPincode: e.target.value })}
                        placeholder="Enter pincode"
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Sticky Modal Footer */}
              <div className="px-5 py-3 border-t border-gray-100 bg-slate-50 shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="enrollForm"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-98 text-white font-black text-xs shadow-md shadow-purple-200 transition-all cursor-pointer"
                >
                  Enroll Student & Issue Scholar No
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

