import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  Eye,
  AlertCircle,
  Sparkles,
  Check,
  X,
  BookOpen,
  MapPin,
  FileWarning,
  CreditCard,
  Building2,
  Users,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Layers,
  Home,
  Award,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import { useDragToScroll } from "../../hooks/useDragToScroll";
import {
  getStudentVerifications,
  updateVerificationStatus,
  deleteStudentFromAdmin,
  updateStudentFromAdmin,
  getSemesterNumber
} from "../../hooks/adminData";
import { getBatches } from "../../hooks/academicMasterData";
import { addStudentNotification, getFeeDetailsForStudent } from "../../hooks/studentPortalData";
import AdmissionLetterModal from "../../components/admission/AdmissionLetterModal";
import { openDocumentInNewTab } from "../../utils/openDocumentInNewTab";

export default function AdmissionVerificationPage() {
  const { ref: tabContainerRef, scrollLeftBy, scrollRightBy, events: tabDragEvents } = useDragToScroll();
  const [applications, setApplications] = useState(() => getStudentVerifications());
  const [batches, setBatches] = useState(() => getBatches());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rejectingStudent, setRejectingStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeModalTab, setActiveModalTab] = useState("personal"); // "personal" | "family_address" | "bank" | "education" | "documents"
  const [viewDocModal, setViewDocModal] = useState(null);
  const [letterModalStudent, setLetterModalStudent] = useState(null);

  const isRenderableFileUrl = (value) => (
    typeof value === "string" &&
    /^(data:|blob:|https?:\/\/)/i.test(value)
  );

  const isImageFile = (doc = {}) => {
    const type = String(doc.fileType || doc.type || "").toLowerCase();
    const name = String(doc.savedFile || doc.file || "").toLowerCase();
    return type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(name);
  };

  const isPdfFile = (doc = {}) => {
    const type = String(doc.fileType || doc.type || "").toLowerCase();
    const name = String(doc.savedFile || doc.file || "").toLowerCase();
    return type.includes("pdf") || name.endsWith(".pdf");
  };

  const renderMediaPreview = (src, alt, className) => (
    isRenderableFileUrl(src)
      ? <img src={src} alt={alt} className={className} />
      : null
  );

  const reloadData = () => {
    setApplications(getStudentVerifications());
    setBatches(getBatches());
  };

  useEffect(() => {
    window.addEventListener("studentEnrollmentUpdated", reloadData);
    window.addEventListener("academicDataUpdated", reloadData);
    window.addEventListener("storage", reloadData);
    return () => {
      window.removeEventListener("studentEnrollmentUpdated", reloadData);
      window.removeEventListener("academicDataUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleVerify = (id, studentName) => {
    const student = applications.find((app) => app.id === id || app.scholarNo === id || app.rollNumber === id) || selectedStudent || {};
    updateVerificationStatus(
      id,
      "Verified",
      "All student profile details, identity proofs, educational marksheets, and documents verified and approved by Admissions Desk."
    );
    addStudentNotification({
      rollNumber: student.scholarNo || student.rollNumber || student.enrollmentNo || id,
      title: "Profile verified",
      message: "Admissions Desk ne aapka student profile approve kar diya.",
      type: "notice",
      route: "/student-dashboard/profile"
    });
    showNotification(`Student ${studentName} profile verified & approved!`);
    if (selectedStudent?.id === id) {
      setSelectedStudent(prev => prev ? { ...prev, status: "Verified", remarks: "All student profile details, identity proofs, educational marksheets, and documents verified and approved by Admissions Desk." } : null);
    }
    reloadData();
  };

  const handleUnverify = (id, studentName) => {
    const student = applications.find((app) => app.id === id || app.scholarNo === id || app.rollNumber === id) || selectedStudent || {};
    const remarks = "Verification reopened by Admissions Desk. Student profile moved back to pending verification queue.";
    updateVerificationStatus(id, "Pending Verification", remarks);
    addStudentNotification({
      rollNumber: student.scholarNo || student.rollNumber || student.enrollmentNo || id,
      title: "Profile verification reopened",
      message: "Admissions Desk ne aapka verified profile wapas pending verification me move kar diya hai.",
      type: "notice",
      route: "/student-dashboard/profile"
    });
    showNotification(`Student ${studentName} profile moved back to pending verification.`);
    if (selectedStudent?.id === id) {
      setSelectedStudent(prev => prev ? { ...prev, status: "Pending Verification", verifiedDate: null, remarks } : null);
    }
    reloadData();
  };

  const openRejectModal = (student) => {
    setRejectingStudent(student);
    setRejectionNotes("");
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectionNotes.trim()) {
      alert("Please provide the rejection notes / discrepancy reason.");
      return;
    }

    updateVerificationStatus(
      rejectingStudent.id,
      "Rejected",
      rejectionNotes.trim()
    );
    addStudentNotification({
      rollNumber: rejectingStudent.scholarNo || rejectingStudent.rollNumber || rejectingStudent.enrollmentNo || rejectingStudent.id,
      title: "Profile rejected",
      message: `Admissions Desk remarks: ${rejectionNotes.trim()}`,
      type: "notice",
      route: "/student-dashboard/profile"
    });

    showNotification(`Profile for ${rejectingStudent.studentName} rejected with notes.`);
    if (selectedStudent?.id === rejectingStudent.id) {
      setSelectedStudent(prev => prev ? { ...prev, status: "Rejected", remarks: rejectionNotes.trim() } : null);
    }
    setRejectingStudent(null);
    reloadData();
  };

  const handleDeleteStudent = (app) => {
    const studentName = app.studentName || app.name || "Student";
    if (window.confirm(`Warning: Are you sure you want to PERMANENTLY DELETE student record "${studentName}" (Scholar No: ${app.scholarNo || app.rollNumber})?\n\nThis action will delete student credentials and profile data.`)) {
      deleteStudentFromAdmin(app.id || app.scholarNo || app.rollNumber);
      showNotification(`Deleted: Student record for ${studentName} deleted successfully.`);
      if (selectedStudent?.id === app.id) {
        setSelectedStudent(null);
      }
      reloadData();
    }
  };

  const handleOpenEditModal = (app) => {
    setEditingStudent(app);
    setEditFormData({
      studentName: app.studentName || app.name || "",
      scholarNo: app.scholarNo || "",
      enrollmentNo: app.enrollmentNo || "",
      fatherName: app.fatherName || "",
      phone: app.phone || "",
      email: app.email || "",
      dob: app.dob || "",
      aadhar: app.aadhar || "",
      abcId: app.abcId || "",
      course: app.course || app.courseClass || "",
      courseCode: app.courseCode || "",
      department: app.department || "",
      batch: app.batch || "",
      session: app.session || "",
      semester: app.semester || "",
      section: app.section || "",
      permanentAddress: app.permanentAddress || "",
      permanentCity: app.permanentCity || "",
      permanentState: app.permanentState || "",
      permanentPincode: app.permanentPincode || ""
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
    const connectedFormData = {
      ...editFormData,
      department: selectedBatch.department,
      course: selectedBatch.course,
      courseCode: selectedBatch.courseCode,
      session: selectedBatch.academicSession,
      semester: selectedBatch.currentSemester,
      section: selectedBatch.section
    };
    updateStudentFromAdmin(targetId, connectedFormData);
    showNotification(`Updated: Student details for ${editFormData.studentName} updated by Admissions Desk.`);
    setEditingStudent(null);
    if (selectedStudent?.id === targetId || selectedStudent?.scholarNo === editingStudent.scholarNo) {
      setSelectedStudent(prev => prev ? { ...prev, ...connectedFormData } : null);
    }
    reloadData();
  };

  const filteredApps = applications.filter((app) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      String(app.studentName || "").toLowerCase().includes(q) ||
      String(app.name || "").toLowerCase().includes(q) ||
      String(app.rollNumber || "").toLowerCase().includes(q) ||
      String(app.scholarNo || "").toLowerCase().includes(q) ||
      String(app.abcId || "").toLowerCase().includes(q) ||
      String(app.aadhar || "").toLowerCase().includes(q) ||
      String(app.batch || "").toLowerCase().includes(q) ||
      String(app.course || "").toLowerCase().includes(q) ||
      String(app.courseClass || "").toLowerCase().includes(q);
    const appStatus = app.status || "Pending Verification";
    const matchStatus =
      statusFilter === "All" ||
      appStatus === statusFilter ||
      (statusFilter === "Pending Verification" && appStatus === "Submitted");
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 uppercase tracking-wider">
              Profile Audit Desk
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-black border border-amber-200">
              {applications.length} Total Applicants
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Profile Verification (Full Audit & Approval)
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Audit comprehensive student profile data matching real-time fields in Student's "My Profile" page.
          </p>
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

        <div className="flex items-center gap-2">
          <label className="text-xs font-black text-slate-600">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
          >
            <option value="All">All Applications</option>
            <option value="Verified">Accepted & Verified</option>
            <option value="Pending Verification">Pending Audit</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black text-sm shrink-0 border border-purple-100">
                  {((app.studentName || app.name || "ST").split(" ").map(n => n[0]).join("")).slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {app.studentName || app.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {[app.courseClass || app.course, app.batch].filter(Boolean).join(" - ") || "Course not assigned"}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                app.status === "Verified" ? "bg-emerald-100 text-emerald-800" : app.status === "Rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
              }`}>
                {app.status === "Verified" ? <CheckCircle2 className="w-3 h-3" /> : app.status === "Rejected" ? <XCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {app.status}
              </span>
            </div>

            {/* Profile ID & Academic Details */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-gray-100 text-xs grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Scholar No</p>
                <p className="font-extrabold text-amber-800 font-mono">{app.scholarNo || app.rollNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">ABC / Aadhar No</p>
                <p className="font-bold text-slate-800 font-mono">{app.abcId || "N/A"} - {app.aadhar || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">10th Academic</p>
                <p className="font-bold text-slate-700">{app.tenthPercentage ? `${app.tenthPercentage}% (${app.tenthBoard || "Board"})` : "Pending Student Submission"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">12th Academic</p>
                <p className="font-bold text-slate-700">{app.twelfthPercentage ? `${app.twelfthPercentage}% (${app.twelfthBoard || "Board"})` : "Pending Student Submission"}</p>
              </div>
            </div>

            {/* Rejection / Officer Remarks */}
            {app.remarks && (
              <div className={`p-2.5 rounded-xl text-[11px] font-medium border ${
                app.status === "Rejected" ? "bg-rose-50 border-rose-200 text-rose-900" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <strong>Officer Remarks:</strong> {app.remarks}
              </div>
            )}

            {/* Documents Checklist Preview */}
            <div className="space-y-1.5 text-xs">
              <p className="text-[10px] uppercase font-black text-slate-400">Submitted Documents & Proofs ({(app.documents || []).length})</p>
              <div className="flex flex-wrap gap-1.5">
                {(app.documents || []).slice(0, 4).map((doc, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md border border-slate-200 inline-flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3 text-slate-400" />
                    {doc.name || doc.docName}
                  </span>
                ))}
                {(app.documents || []).length > 4 && (
                  <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md">
                    +{(app.documents || []).length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Details, Accept, Reject */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedStudent(app);
                  setActiveModalTab("personal");
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Details
              </button>

              {app.status === "Verified" ? (
                <button
                  onClick={() => handleUnverify(app.id, app.studentName || app.name)}
                  className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[3]" /> Unverify
                </button>
              ) : (
                <button
                  onClick={() => handleVerify(app.id, app.studentName || app.name)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Accept
                </button>
              )}

              {app.status !== "Verified" && (
                <button
                  onClick={() => openRejectModal(app)}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" /> {app.status === "Rejected" ? "Update Reject" : "Reject"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reject with Notes Modal */}
      <AnimatePresence>
        {rejectingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 max-h-[88vh] flex flex-col my-auto overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2.5 text-rose-600">
                  <FileWarning className="w-5 h-5 shrink-0" />
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">Reject Profile Verification</h3>
                    <p className="text-[11px] text-slate-500 font-semibold">{rejectingStudent.studentName || rejectingStudent.name} ({rejectingStudent.rollNumber})</p>
                  </div>
                </div>
                <button
                  onClick={() => setRejectingStudent(null)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>

              <form id="rejectForm" onSubmit={handleConfirmReject} className="p-4 sm:p-5 space-y-3 text-xs overflow-y-auto flex-1">
                <div>
                  <label className="block font-black text-slate-700 mb-1 text-[11px]">
                    Discrepancy Notes / Reason for Rejection *
                  </label>
                  <p className="text-[10px] text-slate-500 mb-2">
                    These notes will appear directly on the student's <strong>My Profile</strong> page so they can correct the error and re-submit.
                  </p>
                  <textarea
                    rows={4}
                    required
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="Enter specific discrepancy details (e.g., 12th marksheet percentage mismatch, Aadhar card name mismatch)..."
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-medium text-xs outline-none focus:border-rose-500"
                  />
                </div>
              </form>

              <div className="px-5 py-3 border-t border-gray-100 bg-slate-50 shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingStudent(null)}
                  className="flex-1 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="rejectForm"
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-200 cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Student Details Modal (Admissions Officer Control) */}
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
                  onClick={() => setEditingStudent(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form id="adminEditForm" onSubmit={handleSaveAdminEdit} className="p-5 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.studentName || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, studentName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 text-xs outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Father's Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.fatherName || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 text-xs outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Student Mobile *</label>
                    <input
                      type="tel"
                      required
                      value={editFormData.phone || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 text-xs outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Student Email</label>
                    <input
                      type="email"
                      value={editFormData.email || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 text-xs outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Enrollment No.</label>
                    <input
                      type="text"
                      value={editFormData.enrollmentNo || ""}
                      readOnly
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold font-mono text-slate-900 text-xs outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Scholar No.</label>
                    <input
                      type="text"
                      value={editFormData.scholarNo || ""}
                      readOnly
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold font-mono text-slate-900 text-xs outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Govt. ABC ID</label>
                    <input
                      type="text"
                      value={editFormData.abcId || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, abcId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold font-mono text-slate-900 text-xs outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Aadhaar Number</label>
                    <input
                      type="text"
                      value={editFormData.aadhar || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, aadhar: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold font-mono text-slate-900 text-xs outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Class / Course</label>
                    <input
                      type="text"
                      value={editFormData.course || ""}
                      readOnly
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 text-xs outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-800 mb-1">Enrolled Batch</label>
                    <select
                      required
                      value={editFormData.batch || ""}
                      onChange={(e) => {
                        const batch = batches.find((item) => item.batchName === e.target.value);
                        setEditFormData({
                          ...editFormData,
                          batch: batch?.batchName || "",
                          department: batch?.department || "",
                          course: batch?.course || "",
                          courseCode: batch?.courseCode || "",
                          session: batch?.academicSession || "",
                          semester: batch?.currentSemester || "",
                          section: batch?.section || ""
                        });
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 text-xs outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      <option value="" disabled>Select batch</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.batchName}>
                          {batch.batchName} ({batch.courseCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">Permanent Address</label>
                  <input
                    type="text"
                    value={editFormData.permanentAddress || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, permanentAddress: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 text-xs outline-none focus:border-indigo-600 focus:bg-white"
                  />
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
                  form="adminEditForm"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200 cursor-pointer"
                >
                  Save Student Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comprehensive Full Student Profile Modal - EXACT Real-time My Profile Fields */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col my-auto overflow-hidden"
            >
              {/* Modal Top Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                    {((selectedStudent.studentName || selectedStudent.name || "ST").split(" ").map(n => n[0]).join("")).slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      {selectedStudent.studentName || selectedStudent.name} {selectedStudent.nameHindi ? `(${selectedStudent.nameHindi})` : selectedStudent.studentNameHindi ? `(${selectedStudent.studentNameHindi})` : ""}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold font-mono">
                      Enrollment: {selectedStudent.enrollmentNo || "N/A"} - Scholar No: {selectedStudent.scholarNo || selectedStudent.rollNumber || "N/A"} - ABC ID: {selectedStudent.abcId || "N/A"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Status Banner */}
              <div className={`px-6 py-2.5 border-b flex items-center justify-between text-xs shrink-0 ${
                selectedStudent.status === "Verified"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-900"
                  : selectedStudent.status === "Rejected"
                  ? "bg-rose-50 border-rose-100 text-rose-900"
                  : "bg-amber-50 border-amber-100 text-amber-900"
              }`}>
                <div className="flex items-center gap-2">
                  {selectedStudent.status === "Verified" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : selectedStudent.status === "Rejected" ? <XCircle className="w-4 h-4 text-rose-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                  <span className="font-extrabold">Verification Status: {selectedStudent.status}</span>
                  {selectedStudent.remarks && <span className="text-[11px] text-slate-600 font-medium ml-2">({selectedStudent.remarks})</span>}
                </div>
                <span className="px-2.5 py-0.5 bg-white/80 rounded-full font-black text-[10px] uppercase shadow-xs">
                  {selectedStudent.status}
                </span>
              </div>

              {/* Section Tabs - Scrollable with Drag & Arrow Controls */}
              <div className="relative border-b border-gray-100 bg-slate-50/50 shrink-0 group">
                <button
                  type="button"
                  onClick={() => scrollLeftBy(220)}
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 text-slate-700 hover:bg-slate-50 hover:text-purple-700 flex items-center justify-center cursor-pointer transition-all active:scale-90"
                  title="Scroll Tabs Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                  ref={tabContainerRef}
                  {...tabDragEvents}
                  className="flex items-center gap-2 px-9 pt-3 text-xs overflow-x-auto scroll-smooth whitespace-nowrap select-none no-scrollbar"
                >
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("personal")}
                    className={`pb-2.5 px-3.5 font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      activeModalTab === "personal"
                        ? "border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> 1. Personal & Identity
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("family_address")}
                    className={`pb-2.5 px-3.5 font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      activeModalTab === "family_address"
                        ? "border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> 2. Parents & Addresses
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("bank")}
                    className={`pb-2.5 px-3.5 font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      activeModalTab === "bank"
                        ? "border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> 3. Bank & Entrance Exam
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("education")}
                    className={`pb-2.5 px-3.5 font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      activeModalTab === "education"
                        ? "border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" /> 4. 10th, 12th & Graduation
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("documents")}
                    className={`pb-2.5 px-3.5 font-black border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      activeModalTab === "documents"
                        ? "border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> 5. Documents & Media ({(selectedStudent.documents || []).length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => scrollRightBy(220)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 text-slate-700 hover:bg-slate-50 hover:text-purple-700 flex items-center justify-center cursor-pointer transition-all active:scale-90"
                  title="Scroll Tabs Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                {/* 1. PERSONAL & IDENTIFICATION TAB */}
                {activeModalTab === "personal" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-3">
                      <p className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-purple-600" /> Personal & Identification Information
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1 text-[11px]">
                        <div><p className="text-slate-400 font-bold text-[10px]">Student's Name</p><p className="font-extrabold text-slate-900">{selectedStudent.name || selectedStudent.studentName}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Name in Hindi</p><p className="font-extrabold text-slate-900">{selectedStudent.nameHindi || selectedStudent.studentNameHindi || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Name as on Aadhaar Card</p><p className="font-bold text-slate-800">{selectedStudent.aadharName || "Not Submitted Yet"}</p></div>

                        <div><p className="text-slate-400 font-bold text-[10px]">Enrollment No.</p><p className="font-extrabold text-purple-800 font-mono">{selectedStudent.enrollmentNo || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Scholar No.</p><p className="font-extrabold text-purple-800 font-mono">{selectedStudent.scholarNo || selectedStudent.rollNumber || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">ABC ID</p><p className="font-extrabold text-indigo-700 font-mono">{selectedStudent.abcId || "Not Provided"}</p></div>

                        <div><p className="text-slate-400 font-bold text-[10px]">Class / Course</p><p className="font-bold text-slate-800">{selectedStudent.courseClass || selectedStudent.course || "Not assigned"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Section</p><p className="font-bold text-slate-800">{selectedStudent.section || "Not assigned"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Date of Birth</p><p className="font-bold text-slate-800">{selectedStudent.dob || "Not Provided"}</p></div>

                        <div><p className="text-slate-400 font-bold text-[10px]">Place Of Birth</p><p className="font-bold text-slate-800">{selectedStudent.placeOfBirth || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Blood Group</p><p className="font-bold text-slate-800">{selectedStudent.bloodGroup || "Not Provided"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Mother Tongue</p><p className="font-bold text-slate-800">{selectedStudent.motherTongue || "Not Submitted Yet"}</p></div>

                        <div><p className="text-slate-400 font-bold text-[10px]">Nationality</p><p className="font-bold text-slate-800">{selectedStudent.nationality || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Religion</p><p className="font-bold text-slate-800">{selectedStudent.religion || "Not Provided"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Gender</p><p className="font-bold text-slate-800">{selectedStudent.gender || "Not Provided"}</p></div>

                        <div><p className="text-slate-400 font-bold text-[10px]">Marital Status</p><p className="font-bold text-slate-800">{selectedStudent.maritalStatus || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Aadhaar No.</p><p className="font-extrabold text-indigo-700 font-mono">{selectedStudent.aadhar || "Not Provided"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Samagra ID</p><p className="font-bold text-slate-800">{selectedStudent.samagraId || "N/A"}</p></div>

                        <div><p className="text-slate-400 font-bold text-[10px]">Student Mobile</p><p className="font-bold text-slate-800">{selectedStudent.phone || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Student Email</p><p className="font-bold text-slate-800">{selectedStudent.email || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Category</p><p className="font-bold text-slate-800">{selectedStudent.category || "Not Submitted Yet"}</p></div>

                        <div><p className="text-slate-400 font-bold text-[10px]">PwD Class</p><p className="font-bold text-slate-800">{selectedStudent.pwdClass || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Type of Disability Class</p><p className="font-bold text-slate-800">{selectedStudent.pwdType || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Domicile State</p><p className="font-bold text-slate-800">{selectedStudent.domicile || "Not Submitted Yet"}</p></div>

                        <div><p className="text-slate-400 font-bold text-[10px]">Aadhaar Linked Mobile No.</p><p className="font-bold text-slate-800">{selectedStudent.aadharLinkedMobile || "Not Submitted Yet"}</p></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PARENTS & ADDRESSES TAB */}
                {activeModalTab === "family_address" && (
                  <div className="space-y-4">
                    {/* Father's Information */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-2.5">
                      <p className="text-[10px] font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" /> Father's Information
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                        <div><p className="text-slate-400 font-bold text-[10px]">Father's Name</p><p className="font-extrabold text-slate-900">{selectedStudent.fatherName || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Father's Name in Hindi</p><p className="font-extrabold text-slate-900">{selectedStudent.fatherNameHindi || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Occupation</p><p className="font-bold text-slate-800">{selectedStudent.fatherOccupation || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Education</p><p className="font-bold text-slate-800">{selectedStudent.fatherEducation || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Mobile No.</p><p className="font-bold text-slate-800">{selectedStudent.fatherPhone || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Email</p><p className="font-bold text-slate-800">{selectedStudent.fatherEmail || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Annual Income</p><p className="font-bold text-slate-800">{selectedStudent.fatherAnnualIncome ? `Rs.${selectedStudent.fatherAnnualIncome}` : "N/A"}</p></div>
                      </div>
                    </div>

                    {/* Mother's Information */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-2.5">
                      <p className="text-[10px] font-black uppercase text-rose-800 tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-rose-600" /> Mother's Information
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                        <div><p className="text-slate-400 font-bold text-[10px]">Mother's Name</p><p className="font-extrabold text-slate-900">{selectedStudent.motherName || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Mother's Name in Hindi</p><p className="font-extrabold text-slate-900">{selectedStudent.motherNameHindi || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Occupation</p><p className="font-bold text-slate-800">{selectedStudent.motherOccupation || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Education</p><p className="font-bold text-slate-800">{selectedStudent.motherEducation || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Mobile No.</p><p className="font-bold text-slate-800">{selectedStudent.motherPhone || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Email</p><p className="font-bold text-slate-800">{selectedStudent.motherEmail || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Annual Income</p><p className="font-bold text-slate-800">{selectedStudent.motherAnnualIncome ? `Rs.${selectedStudent.motherAnnualIncome}` : "N/A"}</p></div>
                      </div>
                    </div>

                    {/* Permanent Address */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-2.5">
                      <p className="text-[10px] font-black uppercase text-teal-800 tracking-wider flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-teal-600" /> Permanent Address
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                        <div className="sm:col-span-2"><p className="text-slate-400 font-bold text-[10px]">Full Address</p><p className="font-bold text-slate-800">{selectedStudent.permanentAddress || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">City</p><p className="font-bold text-slate-800">{selectedStudent.permanentCity || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">State</p><p className="font-bold text-slate-800">{selectedStudent.permanentState || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Pin Code</p><p className="font-bold text-slate-800">{selectedStudent.permanentPincode || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">STD Code & Phone</p><p className="font-bold text-slate-800">{selectedStudent.permanentPhone || "N/A"}</p></div>
                      </div>
                    </div>

                    {/* Local / Correspondence Address */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-2.5">
                      <p className="text-[10px] font-black uppercase text-teal-800 tracking-wider flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-teal-600" /> Local / Correspondence Address
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                        <div><p className="text-slate-400 font-bold text-[10px]">Student Name</p><p className="font-bold text-slate-800">{selectedStudent.correspondenceStudentName || selectedStudent.name || selectedStudent.studentName}</p></div>
                        <div className="sm:col-span-2"><p className="text-slate-400 font-bold text-[10px]">Address</p><p className="font-bold text-slate-800">{selectedStudent.correspondenceAddress || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">City</p><p className="font-bold text-slate-800">{selectedStudent.correspondenceCity || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">State</p><p className="font-bold text-slate-800">{selectedStudent.correspondenceState || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Pin Code</p><p className="font-bold text-slate-800">{selectedStudent.correspondencePincode || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Student Mobile No.</p><p className="font-bold text-slate-800">{selectedStudent.correspondenceMobile || "Not Submitted Yet"}</p></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. BANK & ENTRANCE EXAM TAB */}
                {activeModalTab === "bank" && (
                  <div className="space-y-4">
                    {/* Bank Details */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-2.5">
                      <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Student Bank Account Details
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-[11px]">
                        <div><p className="text-slate-400 font-bold text-[10px]">Bank Name</p><p className="font-bold text-slate-800">{selectedStudent.bankName || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Account Holder Name</p><p className="font-bold text-slate-800">{selectedStudent.accountHolderName || selectedStudent.studentName || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Account Number</p><p className="font-bold text-slate-800 font-mono">{selectedStudent.accountNo || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">IFSC Code</p><p className="font-bold text-slate-800 font-mono">{selectedStudent.ifscCode || "N/A"}</p></div>
                      </div>
                    </div>

                    {/* Entrance Exam Details */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-2.5">
                      <p className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Qualified Competitive Entrance Exam Details
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 text-[11px]">
                        <div><p className="text-slate-400 font-bold text-[10px]">Qualified Exam Name</p><p className="font-bold text-slate-800">{selectedStudent.qualifiedExamName || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Exam Scholar No.</p><p className="font-bold text-slate-800 font-mono">{selectedStudent.qualifiedExamRollNo || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Exam Rank</p><p className="font-bold text-slate-800 font-mono">{selectedStudent.qualifiedExamRank || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Exam Quota</p><p className="font-bold text-slate-800">{selectedStudent.qualifiedExamQuota || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Exam Marks</p><p className="font-bold text-slate-800">{selectedStudent.qualifiedExamMarks || "N/A"}</p></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. 10th, 12th, GRADUATION, PG & DIPLOMA TAB */}
                {activeModalTab === "education" && (
                  <div className="space-y-4">
                    {/* 10th School Detail */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> 10th School Detail
                        </p>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-bold rounded-md text-[10px]">
                          {selectedStudent.tenthResultStatus || "Pending"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                        <div className="sm:col-span-2"><p className="text-slate-400 font-bold text-[10px]">10th School Name</p><p className="font-extrabold text-slate-800">{selectedStudent.tenthSchool || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">10th Board</p><p className="font-bold text-slate-800">{selectedStudent.tenthBoard || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">10th Passing Year</p><p className="font-bold text-slate-800">{selectedStudent.tenthYear || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">10th Scholar No.</p><p className="font-bold text-slate-800 font-mono">{selectedStudent.tenthRollNo || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">10th Obtained Marks</p><p className="font-bold text-slate-800">{selectedStudent.tenthObtainMarks || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">10th Total Marks</p><p className="font-bold text-slate-800">{selectedStudent.tenthTotalMarks || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">10th Percentage (%)</p><p className="font-extrabold text-emerald-700 text-sm">{selectedStudent.tenthPercentage ? `${selectedStudent.tenthPercentage}%` : "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Result Status</p><p className="font-bold text-slate-800">{selectedStudent.tenthResultStatus || "Pending"}</p></div>
                      </div>
                    </div>

                    {/* 12th School Detail */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-purple-600" /> 12th School Detail
                        </p>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-bold rounded-md text-[10px]">
                          {selectedStudent.twelfthResultStatus || "Pending"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                        <div className="sm:col-span-2"><p className="text-slate-400 font-bold text-[10px]">12th School Name</p><p className="font-extrabold text-slate-800">{selectedStudent.twelfthSchool || "Not Submitted Yet"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">12th Board</p><p className="font-bold text-slate-800">{selectedStudent.twelfthBoard || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">12th Passing Year</p><p className="font-bold text-slate-800">{selectedStudent.twelfthYear || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">12th Scholar No.</p><p className="font-bold text-slate-800 font-mono">{selectedStudent.twelfthRollNo || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Stream / Subject</p><p className="font-bold text-slate-800">{selectedStudent.twelfthStream || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">12th Obtained Marks</p><p className="font-bold text-slate-800">{selectedStudent.twelfthObtainMarks || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">12th Total Marks</p><p className="font-bold text-slate-800">{selectedStudent.twelfthTotalMarks || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">12th Percentage (%)</p><p className="font-extrabold text-purple-700 text-sm">{selectedStudent.twelfthPercentage ? `${selectedStudent.twelfthPercentage}%` : "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Center Code</p><p className="font-bold text-slate-800">{selectedStudent.twelfthCenterCode || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Admit Card ID</p><p className="font-bold text-slate-800">{selectedStudent.twelfthAdmitCardId || "N/A"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Result Status</p><p className="font-bold text-slate-800">{selectedStudent.twelfthResultStatus || "Pending"}</p></div>
                      </div>
                    </div>

                    {/* Graduation Detail & 8-Semester SGPA Grid */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-indigo-600" /> Graduation Detail & 8-Semester SGPA Grid (If applying for PG)
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-[11px]">
                        <div className="sm:col-span-2"><p className="text-slate-400 font-bold text-[10px]">College Name</p><p className="font-bold text-slate-800">{selectedStudent.gradCollege || "-"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">University</p><p className="font-bold text-slate-800">{selectedStudent.gradUniversity || "-"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Passing Year</p><p className="font-bold text-slate-800">{selectedStudent.gradYear || "-"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Scholar No.</p><p className="font-bold text-slate-800 font-mono">{selectedStudent.gradRollNo || "-"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Course / Stream</p><p className="font-bold text-slate-800">{selectedStudent.gradStream || "-"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Obtain / Total Marks</p><p className="font-bold text-slate-800">{selectedStudent.gradObtainMarks || "0"} / {selectedStudent.gradTotalMarks || "0"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">% / CGPA</p><p className="font-bold text-slate-800">{selectedStudent.gradPercentage || "0.00"}</p></div>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-[10px] font-bold text-slate-600 mb-2">Graduation Semester / Year Wise SGPA Detail (8 Semesters)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">
                          {(selectedStudent.gradSgpaGrid || []).map((sem, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-white border border-gray-200 text-xs">
                              <span className="text-[9px] font-bold text-slate-400 block truncate">{sem.sem?.split(" ")[0] || `Sem ${idx+1}`}</span>
                              <span className="font-extrabold text-purple-700 text-xs">{sem.sgpa || "Not submitted"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Post Graduation Detail & 4-Semester SGPA Grid */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-purple-600" /> Post Graduation Detail & 4-Semester SGPA Grid
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-[11px]">
                        <div className="sm:col-span-2"><p className="text-slate-400 font-bold text-[10px]">College Name</p><p className="font-bold text-slate-800">{selectedStudent.pgCollege || "-"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">University</p><p className="font-bold text-slate-800">{selectedStudent.pgUniversity || "-"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Passing Year</p><p className="font-bold text-slate-800">{selectedStudent.pgYear || "0"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Scholar No.</p><p className="font-bold text-slate-800 font-mono">{selectedStudent.pgRollNo || "-"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Course / Stream</p><p className="font-bold text-slate-800">{selectedStudent.pgStream || "-"}</p></div>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-[10px] font-bold text-slate-600 mb-2">Post Graduation Semester / Year Wise SGPA Detail (4 Semesters)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          {(selectedStudent.pgSgpaGrid || []).map((sem, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-white border border-gray-200 text-xs">
                              <span className="text-[9px] font-bold text-slate-400 block truncate">{sem.sem?.split(" ")[0] || `Sem ${idx+1}`}</span>
                              <span className="font-extrabold text-purple-700 text-xs">{sem.sgpa || "Not submitted"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Diploma Detail & 6-Semester SGPA Grid */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase text-teal-800 tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-teal-600" /> Diploma Detail & 6-Semester SGPA Grid
                        </p>
                        <span className="text-[10px] text-slate-400 font-semibold">(6 Semesters)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-[11px]">
                        <div className="sm:col-span-2"><p className="text-slate-400 font-bold text-[10px]">College Name</p><p className="font-bold text-slate-800">{selectedStudent.diplomaCollege || "-"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">University / Board</p><p className="font-bold text-slate-800">{selectedStudent.diplomaUniversity || "-"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Passing Year</p><p className="font-bold text-slate-800">{selectedStudent.diplomaYear || "-"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Scholar No.</p><p className="font-bold text-slate-800 font-mono">{selectedStudent.diplomaRollNo || "-"}</p></div>
                        <div><p className="text-slate-400 font-bold text-[10px]">Course / Stream</p><p className="font-bold text-slate-800">{selectedStudent.diplomaStream || "-"}</p></div>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-[10px] font-bold text-slate-600 mb-2">Diploma Semester / Year Wise SGPA Detail (6 Semesters)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
                          {(selectedStudent.diplomaSgpaGrid || []).map((sem, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-white border border-gray-200 text-xs">
                              <span className="text-[9px] font-bold text-slate-400 block truncate">{sem.sem?.split(" ")[0] || `Sem ${idx+1}`}</span>
                              <span className="font-extrabold text-teal-700 text-xs">{sem.sgpa || "Not submitted"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. DOCUMENTS & MEDIA TAB */}
                {activeModalTab === "documents" && (
                  <div className="space-y-4">
                    {/* Submitted Documents Checklist Table */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-3">
                      <p className="text-[10px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> Submitted Document Records ({(selectedStudent.documents || []).length})
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-white border-b border-gray-200 text-slate-700 font-black text-[10px] uppercase">
                              <th className="p-2.5">Sr.</th>
                              <th className="p-2.5">Document Name</th>
                              <th className="p-2.5">Saved File</th>
                              <th className="p-2.5 text-center">Status</th>
                              <th className="p-2.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-medium">
                            {(selectedStudent.documents || []).map((doc, idx) => (
                              <tr key={idx} className="hover:bg-white/60">
                                <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                                <td className="p-2.5 font-extrabold text-slate-900">{doc.docName || doc.name}</td>
                                <td className="p-2.5 font-mono text-[11px] text-blue-700 truncate max-w-[200px]">{doc.savedFile || doc.file || "Not uploaded"}</td>
                                <td className="p-2.5 text-center">
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[9px] font-bold">
                                    {doc.status || "Pending"}
                                  </span>
                                </td>
                                <td className="p-2.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => openDocumentInNewTab(doc)}
                                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 rounded-lg font-bold text-[10px] transition-all inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" /> View Document
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Photo & Signature Previews (Matching My Profile 4 Cards) */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-3">
                      <p className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-purple-600" /> Photograph & Signature Uploads (My Profile Media)
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        {/* 1. Student Photo */}
                        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2 flex flex-col items-center justify-between">
                          <p className="font-extrabold text-slate-800 text-[11px]">Student Photo *</p>
                          <div className="w-20 h-24 rounded-lg bg-slate-100 border border-purple-200 flex items-center justify-center overflow-hidden">
                            {renderMediaPreview(selectedStudent.photoPreviews?.studentPhoto, "Student", "w-full h-full object-contain") ? (
                              renderMediaPreview(selectedStudent.photoPreviews?.studentPhoto, "Student", "w-full h-full object-contain")
                            ) : (
                              <User className="w-8 h-8 text-purple-400" />
                            )}
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${isRenderableFileUrl(selectedStudent.photoPreviews?.studentPhoto) ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"}`}>
                            {isRenderableFileUrl(selectedStudent.photoPreviews?.studentPhoto) ? "Uploaded - Pending Verification" : "Not uploaded"}
                          </span>
                        </div>

                        {/* 2. Student Sign */}
                        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2 flex flex-col items-center justify-between">
                          <p className="font-extrabold text-slate-800 text-[11px]">Student Sign *</p>
                          <div className="w-28 h-24 rounded-lg bg-slate-100 border border-purple-200 flex items-center justify-center overflow-hidden p-1">
                            {renderMediaPreview(selectedStudent.photoPreviews?.studentSign, "Sign", "w-full h-full object-contain") ? (
                              renderMediaPreview(selectedStudent.photoPreviews?.studentSign, "Sign", "w-full h-full object-contain")
                            ) : (
                              <p className="font-serif italic text-slate-400 font-bold text-xs">Not uploaded</p>
                            )}
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${isRenderableFileUrl(selectedStudent.photoPreviews?.studentSign) ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"}`}>
                            {isRenderableFileUrl(selectedStudent.photoPreviews?.studentSign) ? "Uploaded - Pending Verification" : "Not uploaded"}
                          </span>
                        </div>

                        {/* 3. Father Photo */}
                        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2 flex flex-col items-center justify-between">
                          <p className="font-extrabold text-slate-800 text-[11px]">Father Photo</p>
                          <div className="w-20 h-24 rounded-lg bg-slate-100 border border-indigo-200 flex items-center justify-center overflow-hidden">
                            {renderMediaPreview(selectedStudent.photoPreviews?.fatherPhoto, "Father", "w-full h-full object-contain") ? (
                              renderMediaPreview(selectedStudent.photoPreviews?.fatherPhoto, "Father", "w-full h-full object-contain")
                            ) : (
                              <Users className="w-7 h-7 text-indigo-400" />
                            )}
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${isRenderableFileUrl(selectedStudent.photoPreviews?.fatherPhoto) ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"}`}>
                            {isRenderableFileUrl(selectedStudent.photoPreviews?.fatherPhoto) ? "Uploaded - Pending Verification" : "Not uploaded"}
                          </span>
                        </div>

                        {/* 4. Mother Photo */}
                        <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2 flex flex-col items-center justify-between">
                          <p className="font-extrabold text-slate-800 text-[11px]">Mother Photo</p>
                          <div className="w-20 h-24 rounded-lg bg-slate-100 border border-rose-200 flex items-center justify-center overflow-hidden">
                            {renderMediaPreview(selectedStudent.photoPreviews?.motherPhoto, "Mother", "w-full h-full object-contain") ? (
                              renderMediaPreview(selectedStudent.photoPreviews?.motherPhoto, "Mother", "w-full h-full object-contain")
                            ) : (
                              <Users className="w-7 h-7 text-rose-400" />
                            )}
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${isRenderableFileUrl(selectedStudent.photoPreviews?.motherPhoto) ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"}`}>
                            {isRenderableFileUrl(selectedStudent.photoPreviews?.motherPhoto) ? "Uploaded - Pending Verification" : "Not uploaded"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="px-6 py-3.5 border-t border-gray-100 bg-slate-50 shrink-0 flex items-center gap-3">
                <button
                  onClick={() => {
                    const stu = selectedStudent;
                    setSelectedStudent(null);
                    setLetterModalStudent(stu);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4" /> Print Admission Letter
                </button>

                {selectedStudent.status === "Verified" ? (
                  <button
                    onClick={() => {
                      handleUnverify(selectedStudent.id, selectedStudent.studentName || selectedStudent.name);
                      setSelectedStudent(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4 stroke-[3]" /> Unverify Profile
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleVerify(selectedStudent.id, selectedStudent.studentName || selectedStudent.name);
                      setSelectedStudent(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Accept & Approve Profile
                  </button>
                )}

                {selectedStudent.status !== "Verified" && (
                  <button
                    onClick={() => {
                      const stu = selectedStudent;
                      setSelectedStudent(null);
                      openRejectModal(stu);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4 stroke-[3]" /> {selectedStudent.status === "Rejected" ? "Update Rejection Notes" : "Reject with Discrepancy Notes"}
                  </button>
                )}

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-black text-xs cursor-pointer shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <X className="w-4 h-4 text-slate-600" /> Close Audit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document View Modal */}
      {viewDocModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  {viewDocModal.docName || viewDocModal.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{viewDocModal.savedFile || viewDocModal.file || "Not uploaded"}</p>
              </div>
              <button
                onClick={() => setViewDocModal(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="h-64 sm:h-80 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-6 space-y-3 overflow-hidden">
              {isRenderableFileUrl(viewDocModal.fileUrl) && isImageFile(viewDocModal) ? (
                <img src={viewDocModal.fileUrl} alt="Document" className="max-h-full max-w-full object-contain rounded-lg" />
              ) : isRenderableFileUrl(viewDocModal.fileUrl) && isPdfFile(viewDocModal) ? (
                <iframe src={viewDocModal.fileUrl} title="Document PDF" className="w-full h-full rounded-lg border border-slate-200 bg-white" />
              ) : isRenderableFileUrl(viewDocModal.fileUrl) ? (
                <iframe src={viewDocModal.fileUrl} title="Document Preview" className="w-full h-full rounded-lg border border-slate-200 bg-white" />
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm">{viewDocModal.docName || viewDocModal.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">Official Document File: {viewDocModal.savedFile || viewDocModal.file || "No file uploaded"}</p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-1">Done File verified under 1 MB limit (Tamper-evident record)</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewDocModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provisional Admission Confirmation Letter Modal */}
      {letterModalStudent && (
        <AdmissionLetterModal
          student={letterModalStudent}
          onClose={() => setLetterModalStudent(null)}
        />
      )}
    </div>
  );
}

