import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Users,
  ShieldCheck,
  Printer,
  ChevronDown,
  ChevronUp,
  Home,
  Award,
  Camera,
  Save,
  Check,
  AlertCircle,
  FileText,
  Upload,
  Eye,
  CreditCard,
  CheckCircle2,
  Info,
  GraduationCap,
  Sparkles,
  XCircle,
  RotateCcw,
  BookOpenCheck,
  Layers,
  HelpCircle,
  Clock,
  Edit,
  Trash2
} from "lucide-react";
import { addStudentNotification, getActiveStudentProfile, studentProfile } from "../../../hooks/studentPortalData";
import { getStudentByRoll, updateStudentProfileFromStudent, updateStudentMedia } from "../../../hooks/adminData";
import { openDocumentInNewTab } from "../../../utils/openDocumentInNewTab";

function FormField({
  labelEn,
  labelHi,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
  options = [],
  colSpan = 1,
  hint = ""
}) {
  const id = `field-${name}`;
  const spanClass =
    colSpan === 2
      ? "sm:col-span-2"
      : colSpan === 3
        ? "sm:col-span-3"
        : colSpan === 4
          ? "sm:col-span-4"
          : "";

  return (
    <div className={spanClass}>
      <label htmlFor={id} className="block mb-1.5">
        <span className="text-[12px] font-bold text-slate-800">
          {labelEn}
          {required && <span className="text-red-600 font-extrabold ml-0.5">*</span>}
        </span>
        {labelHi && labelHi.trim() ? (
          <span className="text-[11px] text-purple-800 font-semibold ml-1.5">
            ({labelHi.trim()})
          </span>
        ) : null}
      </label>

      {type === "select" ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-3 py-2.5 rounded-xl border text-[13px] font-bold outline-none transition-all duration-200 shadow-sm ${disabled
              ? "bg-slate-100 border-gray-300 text-slate-700 cursor-not-allowed"
              : "bg-white border-gray-300 text-slate-900 hover:border-purple-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
            }`}
          style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
        >
          <option value="" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>-- Select Option --</option>
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt} style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={2}
          className={`w-full px-3 py-2.5 rounded-xl border text-[13px] font-bold outline-none transition-all duration-200 resize-none shadow-sm ${disabled
              ? "bg-slate-100 border-gray-300 text-slate-700 cursor-not-allowed"
              : "bg-white border-gray-300 text-slate-900 hover:border-purple-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
            }`}
          style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
        />
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2.5 rounded-xl border text-[13px] font-bold outline-none transition-all duration-200 shadow-sm ${disabled
              ? "bg-slate-100 border-gray-300 text-slate-700 cursor-not-allowed"
              : "bg-white border-gray-300 text-slate-900 hover:border-purple-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
            }`}
          style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
        />
      )}
      {hint && <p className="text-[10px] text-purple-700 mt-1 font-bold">{hint}</p>}
    </div>
  );
}

function ProfileSection({
  icon: Icon,
  titleEn,
  titleHi,
  iconColor = "text-purple-600",
  iconBg = "bg-purple-50",
  children,
  defaultOpen = true,
  id,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-gray-200 hover:bg-slate-100 transition-colors"
        id={id}
        type="button"
      >
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg ${iconBg} border border-gray-200 flex items-center justify-center shadow-sm`}
          >
            <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          </div>
          <div className="text-left min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 break-words">{titleEn}</h3>
            {titleHi && titleHi.trim() ? <p className="text-[10px] text-purple-800 font-bold">{titleHi.trim()}</p> : null}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-600 font-bold" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-600 font-bold" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProfilePage() {
  const [form, setForm] = useState(() => getActiveStudentProfile());
  const [isEditMode, setIsEditMode] = useState(false);
  const [status, setStatus] = useState(() => {
    const active = getActiveStudentProfile();
    const live = getStudentByRoll(active.rollNumber || active.scholarNo);
    if (live?.status === "Verified") return "Approved & Verified by Admissions Desk";
    if (live?.status === "Rejected") return "Rejected - Correction Required";
    if (live?.status === "Submitted" || live?.status === "Pending Verification") return "Submitted for Admissions Verification";
    return "Draft - Edit & Complete Profile";
  });
  const [facultyRemarks, setFacultyRemarks] = useState(() => {
    const active = getActiveStudentProfile();
    const live = getStudentByRoll(active.rollNumber || active.scholarNo);
    return live?.remarks || "";
  });
  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [activeTab, setActiveTab] = useState("personal"); // "personal" | "educational"
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [lastSubmittedTime, setLastSubmittedTime] = useState("");
  const [validationErrorMsg, setValidationErrorMsg] = useState("");

  const syncVerification = () => {
    const activeProfile = getActiveStudentProfile();
    const live = getStudentByRoll(activeProfile.rollNumber || activeProfile.scholarNo || form.rollNumber);
    if (live) {
      setForm((prev) => ({ ...prev, ...activeProfile, ...live, name: live.studentName || activeProfile.name || prev.name }));
      
      const incomingDocs = (live.documents && live.documents.length > 0)
        ? live.documents
        : (activeProfile.submittedDocuments && activeProfile.submittedDocuments.length > 0)
        ? activeProfile.submittedDocuments
        : (studentProfile.submittedDocuments || []);

      setDocList(incomingDocs.map((document, index) => ({
        id: document.id || `${live.id || "DOC"}-${index}`,
        docName: document.name || document.docName || "Document",
        submittedOn: document.submittedOn || live.appliedDate || "Uploaded",
        savedFile: document.file || document.savedFile || `${document.docName || "document"}.pdf`,
        fileUrl: document.fileUrl || "",
        fileType: document.fileType || "application/pdf"
      })));

      setPhotoPreviews((prev) => ({
        studentPhoto: live.photoPreviews?.studentPhoto ?? activeProfile.photoPreviews?.studentPhoto ?? activeProfile.photo ?? prev.studentPhoto ?? null,
        studentSign: live.photoPreviews?.studentSign ?? activeProfile.photoPreviews?.studentSign ?? prev.studentSign ?? null,
        fatherPhoto: live.photoPreviews?.fatherPhoto ?? activeProfile.photoPreviews?.fatherPhoto ?? prev.fatherPhoto ?? null,
        motherPhoto: live.photoPreviews?.motherPhoto ?? activeProfile.photoPreviews?.motherPhoto ?? prev.motherPhoto ?? null,
      }));

      setPhotoSaveStatus((prev) => ({
        studentPhoto: Boolean(live.photoPreviews?.studentPhoto ?? activeProfile.photoPreviews?.studentPhoto ?? activeProfile.photo ?? prev.studentPhoto),
        studentSign: Boolean(live.photoPreviews?.studentSign ?? activeProfile.photoPreviews?.studentSign ?? prev.studentSign),
        fatherPhoto: Boolean(live.photoPreviews?.fatherPhoto ?? activeProfile.photoPreviews?.fatherPhoto ?? prev.fatherPhoto),
        motherPhoto: Boolean(live.photoPreviews?.motherPhoto ?? activeProfile.photoPreviews?.motherPhoto ?? prev.motherPhoto),
      }));

      if (live.status === "Verified") {
        setStatus("Approved & Verified by Admissions Desk");
        setFacultyRemarks(live.remarks || "All original documents & qualifications verified by Admissions Desk.");
      } else if (live.status === "Rejected") {
        setStatus("Rejected - Correction Required");
        setFacultyRemarks(live.remarks || "Discrepancy in submitted records. Please re-upload verified certificates.");
      } else if (live.status === "Submitted" || live.status === "Pending Verification") {
        setStatus("Submitted for Admissions Verification");
        setFacultyRemarks(live.remarks || "Profile submitted. Pending verification audit by Admissions Desk.");
      } else {
        setStatus("Draft - Edit & Complete Profile");
        setFacultyRemarks(live.remarks || "Please fill in and submit your profile for Admissions Verification.");
      }
    }
  };

  useEffect(() => {
    syncVerification();
    window.addEventListener("studentEnrollmentUpdated", syncVerification);
    window.addEventListener("activeStudentProfileUpdated", syncVerification);
    window.addEventListener("storage", syncVerification);
    return () => {
      window.removeEventListener("studentEnrollmentUpdated", syncVerification);
      window.removeEventListener("activeStudentProfileUpdated", syncVerification);
      window.removeEventListener("storage", syncVerification);
    };
  }, []);

  // Document Upload State & Preview Controls
  const [docType, setDocType] = useState("");
  const [docList, setDocList] = useState(() => {
    const active = getActiveStudentProfile();
    const live = getStudentByRoll(active.rollNumber || active.scholarNo);
    const docs = (live?.documents && live.documents.length > 0)
      ? live.documents
      : (active.submittedDocuments && active.submittedDocuments.length > 0)
      ? active.submittedDocuments
      : (studentProfile.submittedDocuments || []);
    return docs.map((document, index) => ({
      id: document.id || `DOC-${index}`,
      docName: document.name || document.docName || "Document",
      submittedOn: document.submittedOn || live?.appliedDate || "Uploaded",
      savedFile: document.file || document.savedFile || `${document.docName || "document"}.pdf`,
      fileUrl: document.fileUrl || "",
      fileType: document.fileType || "application/pdf"
    }));
  });
  const [docSuccessMsg, setDocSuccessMsg] = useState("");
  const [selectedDocFile, setSelectedDocFile] = useState(null);
  const [docFilePreviewUrl, setDocFilePreviewUrl] = useState(null);
  const [viewModalDoc, setViewModalDoc] = useState(null);

  // Photo & Signature Media State
  const [photoPreviews, setPhotoPreviews] = useState(() => {
    const active = getActiveStudentProfile();
    const live = getStudentByRoll(active.rollNumber || active.scholarNo);
    return {
      studentPhoto: live?.photoPreviews?.studentPhoto || active.photoPreviews?.studentPhoto || active.photo || null,
      studentSign: live?.photoPreviews?.studentSign || active.photoPreviews?.studentSign || null,
      fatherPhoto: live?.photoPreviews?.fatherPhoto || active.photoPreviews?.fatherPhoto || null,
      motherPhoto: live?.photoPreviews?.motherPhoto || active.photoPreviews?.motherPhoto || null,
    };
  });

  const [photoSaveStatus, setPhotoSaveStatus] = useState(() => {
    const active = getActiveStudentProfile();
    const live = getStudentByRoll(active.rollNumber || active.scholarNo);
    return {
      studentPhoto: Boolean(live?.photoPreviews?.studentPhoto || active.photoPreviews?.studentPhoto || active.photo),
      studentSign: Boolean(live?.photoPreviews?.studentSign || active.photoPreviews?.studentSign),
      fatherPhoto: Boolean(live?.photoPreviews?.fatherPhoto || active.photoPreviews?.fatherPhoto),
      motherPhoto: Boolean(live?.photoPreviews?.motherPhoto || active.photoPreviews?.motherPhoto),
    };
  });

  const [photoCardFeedback, setPhotoCardFeedback] = useState({
    studentPhoto: "",
    studentSign: "",
    fatherPhoto: "",
    motherPhoto: "",
  });

  const isRenderableFileUrl = (value) => (
    typeof value === "string" &&
    /^(data:|blob:|https?:\/\/)/i.test(value)
  );

  // Verified = Permanently Locked; Submitted = Locked unless student clicks Edit Profile; Draft/Rejected = 100% Editable
  const isVerified = status.includes("Approved") || status.includes("Verified");
  const isSubmitted = status.includes("Submitted");
  const isLocked = isVerified || (isSubmitted && !isEditMode);
  const rawCourseText = String(form.courseCode || form.course || form.courseClass || "");
  const courseAfterName = rawCourseText.includes(" - ") ? rawCourseText.split(" - ").pop() : rawCourseText;
  const headerCourse = (courseAfterName
    .replace(/\b20\d{2}\s*-\s*20\d{2}\b/gi, "")
    .replace(/\b[IVX]+\s*SEM(?:ESTER)?\b/gi, "")
    .trim()
    .split(/\s+/)[0]) || "Degree Course";
  const extractedTerm = (courseAfterName.match(/\b[IVX]+\s*SEM(?:ESTER)?\b/i)?.[0] || "").toUpperCase();
  const headerTerm = form.semester || extractedTerm || form.year || form.session || "Current Session";

  const handlePhotoSelect = (key, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxKb = 1024; // 1 MB strictly
    const fileSizeKb = file.size / 1024;

    if (fileSizeKb > maxKb) {
      setDocSuccessMsg(`File Limit Exceeded: Selected file size (${(fileSizeKb / 1024).toFixed(2)} MB) exceeds the 1 MB limit! Please choose a file under 1 MB.`);
      e.target.value = "";
      setTimeout(() => setDocSuccessMsg(""), 6000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      // Real-time instant preview and state update
      setPhotoPreviews((prev) => ({ ...prev, [key]: base64Data }));
      setPhotoSaveStatus((prev) => ({ ...prev, [key]: false }));

      const img = new Image();
      img.src = base64Data;
      img.onload = () => {
        setPhotoCardFeedback((prev) => ({
          ...prev,
          [key]: `Done File Size: ${fileSizeKb.toFixed(0)} KB (${img.width}x${img.height}px)`,
        }));
      };
      img.onerror = () => {
        setPhotoCardFeedback((prev) => ({ ...prev, [key]: "Done Image loaded" }));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = (key, label) => {
    if (!photoPreviews[key]) return;
    const currentStudent = getStudentByRoll(form.rollNumber || form.scholarNo || form.id) || {};
    const existingMedia = currentStudent.photoPreviews || {};
    const savedPreviews = { ...existingMedia, [key]: photoPreviews[key] };
    
    setPhotoSaveStatus((prev) => ({ ...prev, [key]: true }));
    updateStudentMedia(form.id || form.rollNumber || form.scholarNo || form.enrollmentNo, savedPreviews);
    addStudentNotification({
      rollNumber: form.scholarNo || form.rollNumber || form.enrollmentNo || form.id,
      title: `${label} saved`,
      message: `${label} profile media me successfully save ho gaya.`,
      type: "notice",
      route: "/student-dashboard/profile"
    });
    setPhotoCardFeedback((prev) => ({ ...prev, [key]: `Done ${label} saved successfully.` }));
    setDocSuccessMsg(`Done ${label} uploaded & saved successfully.`);
    setTimeout(() => setDocSuccessMsg(""), 3500);
  };

  const handleDeletePhoto = (key, label) => {
    if (isLocked) return;
    const currentStudent = getStudentByRoll(form.rollNumber || form.scholarNo || form.id) || {};
    const existingMedia = currentStudent.photoPreviews || {};
    const updatedMedia = { ...existingMedia, [key]: null };

    setPhotoPreviews((prev) => ({ ...prev, [key]: null }));
    setPhotoSaveStatus((prev) => ({ ...prev, [key]: false }));
    setPhotoCardFeedback((prev) => ({ ...prev, [key]: "" }));
    updateStudentMedia(form.id || form.rollNumber || form.scholarNo || form.enrollmentNo, updatedMedia);
    addStudentNotification({
      rollNumber: form.scholarNo || form.rollNumber || form.enrollmentNo || form.id,
      title: `${label} deleted`,
      message: `${label} profile media se remove ho gaya.`,
      type: "notice",
      route: "/student-dashboard/profile"
    });
    setDocSuccessMsg(`Done ${label} removed / deleted.`);
    setTimeout(() => setDocSuccessMsg(""), 3500);
  };

  const handleSameAsPermanentToggle = (e) => {
    if (isLocked) return;
    const checked = e.target.checked;
    setSameAsPermanent(checked);
    if (checked) {
      setForm((prev) => ({
        ...prev,
        correspondenceStudentName: prev.name,
        correspondenceAddress: prev.permanentAddress,
        correspondenceCity: prev.permanentCity,
        correspondenceState: prev.permanentState,
        correspondencePincode: prev.permanentPincode,
        correspondenceMobile: "",
      }));
    }
  };

  const handleDocFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileSizeKb = file.size / 1024;

    if (fileSizeKb > 1024) {
      setDocSuccessMsg(`File Limit Exceeded: Selected file size (${(fileSizeKb / 1024).toFixed(2)} MB) exceeds the 1 MB limit! Please choose a PDF / JPG file under 1 MB.`);
      e.target.value = "";
      setTimeout(() => setDocSuccessMsg(""), 6000);
      return;
    }

    setSelectedDocFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDocFilePreviewUrl(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    if (isLocked) return;
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStudentSubmit = (e) => {
    if (e) e.preventDefault();

    // Check mandatory required fields (star fields)
    const requiredFields = [
      { key: "name", label: "Student's Name" },
      { key: "nameHindi", label: "Student's Name (Hindi)" },
      { key: "aadharName", label: "Aadhaar Card Name" },
      { key: "dob", label: "Date of Birth" },
      { key: "gender", label: "Gender" },
      { key: "category", label: "Category" },
      { key: "religion", label: "Religion" },
      { key: "domicile", label: "Domicile State" },
      { key: "aadhar", label: "Aadhaar No." },
      { key: "phone", label: "Student Mobile" },
      { key: "email", label: "Student Email" },
      { key: "fatherName", label: "Father's Name" },
      { key: "fatherNameHindi", label: "Father's Name (Hindi)" },
      { key: "fatherOccupation", label: "Father Occupation" },
      { key: "fatherPhone", label: "Father Mobile" },
      { key: "motherName", label: "Mother's Name" },
      { key: "motherNameHindi", label: "Mother's Name (Hindi)" },
      { key: "permanentAddress", label: "Permanent Address" },
      { key: "permanentCity", label: "Permanent City" },
      { key: "permanentState", label: "Permanent State" },
      { key: "permanentPincode", label: "Permanent Pin Code" },
      { key: "tenthSchool", label: "10th School Name" },
      { key: "tenthBoard", label: "10th Board Name" },
      { key: "tenthYear", label: "10th Passing Year" },
      { key: "tenthRollNo", label: "10th Scholar No" },
      { key: "twelfthSchool", label: "12th School Name" },
      { key: "twelfthBoard", label: "12th Board Name" },
      { key: "twelfthYear", label: "12th Passing Year" },
      { key: "twelfthRollNo", label: "12th Scholar No" },
    ];

    const missing = requiredFields.filter((f) => !form[f.key] || String(form[f.key]).trim() === "");

    if (missing.length > 0) {
      setValidationErrorMsg(
        `Submission Blocked: Mandatory (*) fields are missing!\n\nPlease fill out all required red-asterisk fields (${missing.length} empty):\n- ` +
          missing.map((m) => m.label).join("\n- ")
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setValidationErrorMsg("");
    const nowStr = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    
    const activeStudentId = form.rollNumber || form.scholarNo || form.enrollmentNo || form.id;
    updateStudentProfileFromStudent(activeStudentId, {
      ...form,
      studentName: form.name,
      studentNameHindi: form.nameHindi,
      documents: docList.map(d => ({ name: d.docName, docName: d.docName, file: d.savedFile, savedFile: d.savedFile, status: "Submitted", fileUrl: d.fileUrl, fileType: d.fileType })),
      photoPreviews: photoPreviews
    });
    addStudentNotification({
      rollNumber: activeStudentId,
      title: "Profile submitted",
      message: "Profile Admissions Desk verification ke liye submit ho gaya.",
      type: "notice",
      route: "/student-dashboard/profile"
    });
    setStatus("Submitted for Admissions Verification");
    setFacultyRemarks("Profile updated and submitted by student. Awaiting Admissions Desk audit.");
    setLastSubmittedTime(nowStr);
    setSavedSuccessMsg(`Done Profile & Educational details submitted successfully on ${nowStr}! Sent to Admissions Desk for Verification Audit.`);
    setSubmissionModalOpen(true);
    setTimeout(syncVerification, 0);
    setTimeout(() => setSavedSuccessMsg(""), 6000);
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!docType || isLocked) return;
    if (!selectedDocFile) {
      setDocSuccessMsg("Please choose the actual document file before adding it.");
      return;
    }
    if (!isRenderableFileUrl(docFilePreviewUrl)) {
      setDocSuccessMsg("Please wait a moment, file preview is still loading. Then click Save Document again.");
      return;
    }

    const fileName = selectedDocFile.name;
    const fileUrl = docFilePreviewUrl;
    const fileType = selectedDocFile.type || (fileName.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/png");

    const newDoc = {
      id: Date.now(),
      docName: docType,
      submittedOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-"),
      savedFile: fileName,
      fileUrl: fileUrl,
      fileType: fileType,
      status: "Submitted"
    };

    const updatedDocList = [newDoc, ...docList];
    setDocList(updatedDocList);

    const activeStudentId = form.rollNumber || form.scholarNo || form.enrollmentNo || form.id;
    updateStudentProfileFromStudent(activeStudentId, {
      ...form,
      documents: updatedDocList
    });
    addStudentNotification({
      rollNumber: activeStudentId,
      title: "Document uploaded",
      message: `${docType} document successfully save ho gaya.`,
      type: "notice",
      route: "/student-dashboard/profile"
    });

    setDocSuccessMsg(`Done "${docType}" (${fileName}) saved & added successfully to your document records!`);
    setDocType("");
    setSelectedDocFile(null);
    setDocFilePreviewUrl(null);
    setTimeout(() => setDocSuccessMsg(""), 4500);
  };

  const handleDeleteDocument = (docId) => {
    const target = docList.find((doc) => String(doc.id) === String(docId));
    if (!target) return;
    const confirmed = window.confirm(`Delete "${target.docName}" document?`);
    if (!confirmed) return;

    const updatedDocList = docList.filter((doc) => String(doc.id) !== String(docId));
    setDocList(updatedDocList);

    const activeStudentId = form.rollNumber || form.scholarNo || form.enrollmentNo || form.id;
    updateStudentProfileFromStudent(activeStudentId, {
      ...form,
      documents: updatedDocList
    });
    addStudentNotification({
      rollNumber: activeStudentId,
      title: "Document deleted",
      message: `${target.docName} document profile se remove ho gaya.`,
      type: "notice",
      route: "/student-dashboard/profile"
    });

    setDocSuccessMsg(`Deleted "${target.docName}" from your document records.`);
    setTimeout(() => setDocSuccessMsg(""), 4500);
  };

  return (
    <>
      {/* Web UI Container - Hidden during Print */}
      <div className="space-y-6 pb-12 print:hidden">
      {/* Top Banner Card - White Light Theme */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 text-slate-900 border border-gray-200 shadow-sm min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 border-2 border-purple-200 p-1 flex items-center justify-center overflow-hidden shadow-sm">
              {isRenderableFileUrl(photoPreviews.studentPhoto) ? (
                <img src={photoPreviews.studentPhoto} alt="Student Photo Avatar" className="w-full h-full object-contain rounded-xl" />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white text-xl font-black shadow-inner">
                  {form.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
              )}
            </div>
            {!isLocked && (
              <label className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md transition-all hover:scale-105 active:scale-95" title="Click to Upload Student Photo">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={(e) => handlePhotoSelect("studentPhoto", e)} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                status.includes("Approved") || status.includes("Verified")
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : status.includes("Rejected")
                  ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                <span className="inline-block w-2 h-2 rounded-full bg-current mr-1.5" /> {status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 break-words">{form.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-xs text-slate-600 font-bold">
              <span className="text-purple-950 font-black">{headerCourse}</span>
              <span className="text-slate-300">|</span>
              <span>{headerTerm}</span>
              <span className="text-slate-300">|</span>
              <span>Batch: <strong className="text-slate-800">{form.batch || form.session || "N/A"}</strong></span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1.5 text-xs text-slate-500 font-semibold">
              <span>Enrollment: <strong className="text-slate-800">{form.enrollmentNo}</strong></span>
              <span>Scholar No: <strong className="text-slate-800">{form.scholarNo}</strong></span>
              <span>ABC ID: <strong className="text-slate-800">{form.abcId}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end w-full md:w-auto">
            {!isVerified && (
              <button
                type="button"
                onClick={() => setIsEditMode(prev => !prev)}
                className={`w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  isEditMode
                    ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-md"
                    : "bg-white hover:bg-purple-50 text-purple-900 border-purple-200"
                }`}
              >
                <Edit className="w-4 h-4" /> {isEditMode ? "Lock / View Mode" : "Unlock & Edit Profile"}
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-extrabold border border-purple-200 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Profile
            </button>
          </div>
        </div>
      </div>

      {/* Student Verification Status Banner */}
      {status.includes("Rejected") && facultyRemarks && (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 text-xs space-y-1.5 shadow-md">
          <p className="font-extrabold text-red-800 flex items-center gap-1.5 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" /> Admissions Officer Discrepancy Notes (Action Required)
          </p>
          <div className="p-3 bg-white/80 rounded-xl border border-red-200 font-bold text-red-900 text-xs">
            "{facultyRemarks}"
          </div>
          <p className="text-[11px] text-red-700 font-semibold pt-1">
            Please correct the highlighted profile & document information below and click <strong>"Save & Re-submit Profile for Verification"</strong> to send it back to the Admissions Desk.
          </p>
        </div>
      )}

      {status.includes("Submitted") && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Profile details submitted & currently under audit by the <strong>Admissions Desk</strong>.</span>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg text-[10px]">UNDER VERIFICATION</span>
        </div>
      )}

      {(status.includes("Approved") || status.includes("Verified")) && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Done Profile & Academic records verified and approved by the <strong>Central Admissions Cell</strong>.</span>
          </div>
          <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold rounded-lg text-[10px]">VERIFIED & APPROVED</span>
        </div>
      )}

      {savedSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {savedSuccessMsg}
        </div>
      )}

      {validationErrorMsg && (
        <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs font-bold space-y-2 shadow-lg animate-in fade-in zoom-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-rose-200 pb-2">
            <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Mandatory (*) Fields Required for Profile Submission</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationErrorMsg("")}
              className="text-xs bg-rose-200 hover:bg-rose-300 text-rose-900 font-extrabold px-3 py-1 rounded-xl transition-all cursor-pointer"
            >
              Close Dismiss Alert
            </button>
          </div>
          <p className="text-rose-900 font-semibold leading-relaxed whitespace-pre-wrap">{validationErrorMsg}</p>
        </div>
      )}



      {/* Navigation Tabs Bar */}
      <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`flex-1 w-full py-3.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 text-center leading-snug transition-all shadow-sm ${
            activeTab === "personal"
              ? "bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-md scale-[1.01]"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-200"
          }`}
        >
          <User className="w-4 h-4" /> Personal Details & Document Uploads
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("educational")}
          className={`flex-1 w-full py-3.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 text-center leading-snug transition-all shadow-sm ${
            activeTab === "educational"
              ? "bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-md scale-[1.01]"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-200"
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Educational Details (10th / 12th / Graduation / Diploma / Exam)
        </button>
      </div>

      {/* Main Profile Form Formats */}
      <form onSubmit={handleStudentSubmit} className="space-y-6">
        {activeTab === "personal" && (
          <>
            {/* Personal & Identification Info */}
            <ProfileSection
              icon={User}
              titleEn="Personal & Identification Information"
          titleHi=""
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField labelEn="Student's Name" labelHi="" name="name" value={form.name} onChange={handleChange} disabled hint="(Filled at Enrollment - Read Only)" required />
            <FormField labelEn="Student's Name (Hindi)" labelHi="" name="nameHindi" value={form.nameHindi} onChange={handleChange} disabled={isLocked} required hint="(Use Google Input tool for Hindi)" />
            <FormField labelEn="Student Name (as on Aadhaar Card)" labelHi="" name="aadharName" value={form.aadharName} onChange={handleChange} disabled={isLocked} required />
            
            <FormField labelEn="Enrollment No." labelHi="" name="enrollmentNo" value={form.enrollmentNo} onChange={handleChange} disabled hint="(Institutional Record - Read Only)" />
            <FormField labelEn="Scholar No." labelHi="" name="scholarNo" value={form.scholarNo} onChange={handleChange} disabled hint="(Official Scholar Allocation - Read Only)" />
            <FormField labelEn="ABC ID" labelHi="" name="abcId" value={form.abcId} onChange={handleChange} disabled hint="(Government ABC Registry - Read Only)" />
            
            <FormField labelEn="Class / Course" labelHi="" name="courseClass" value={form.courseClass} onChange={handleChange} disabled hint="(Academic Course Allocation - Read Only)" required />
            <FormField labelEn="Section" labelHi="" name="section" value={form.section} onChange={handleChange} disabled hint="(Class Section Allocation - Read Only)" required />
            <FormField labelEn="Date of Birth" labelHi="  (Calendar Date)" name="dob" value={form.dob} onChange={handleChange} disabled={isLocked} required type="date" />
            
            <FormField labelEn="Place Of Birth" labelHi="" name="placeOfBirth" value={form.placeOfBirth} onChange={handleChange} disabled={isLocked} />
            <FormField labelEn="Blood Group" labelHi="" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} disabled={isLocked} type="select" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
            <FormField labelEn="Mother Tongue" labelHi="" name="motherTongue" value={form.motherTongue} onChange={handleChange} disabled={isLocked} />
            
            <FormField labelEn="Nationality" labelHi="" name="nationality" value={form.nationality} onChange={handleChange} disabled={isLocked} required />
            <FormField labelEn="Religion" labelHi="" name="religion" value={form.religion} onChange={handleChange} disabled={isLocked} required type="select" options={["HINDU", "ISLAM", "SIKH", "CHRISTIAN", "JAIN", "OTHER"]} />
            <FormField labelEn="Gender" labelHi="" name="gender" value={form.gender} onChange={handleChange} disabled={isLocked} required type="select" options={["Male", "Female", "Other"]} />
            
            <FormField labelEn="Marital Status" labelHi="" name="maritalStatus" value={form.maritalStatus} onChange={handleChange} disabled={isLocked} required type="select" options={["Single", "Married"]} />
            <FormField labelEn="Aadhaar No." labelHi="" name="aadhar" value={form.aadhar} onChange={handleChange} disabled hint="(Verified Identity - Read Only)" required />
            <FormField labelEn="Samagra ID" labelHi="" name="samagraId" value={form.samagraId} onChange={handleChange} disabled={isLocked} />

            <FormField labelEn="Student Mobile" labelHi="" name="phone" value={form.phone} onChange={handleChange} disabled hint="(Registered Mobile - Read Only)" required />
            <FormField labelEn="Student Email" labelHi="" name="email" value={form.email} onChange={handleChange} disabled hint="(Registered Email - Read Only)" required type="email" />
            <FormField labelEn="Person With Disability Class" labelHi="" name="pwdClass" value={form.pwdClass} onChange={handleChange} disabled={isLocked} type="select" options={["No", "Yes"]} />
            <FormField labelEn="Type of Disability Class" labelHi="" name="pwdType" value={form.pwdType} onChange={handleChange} disabled={isLocked} />
            <FormField labelEn="Domicile State" labelHi="   (Domicile)" name="domicile" value={form.domicile} onChange={handleChange} disabled={isLocked} type="select" options={["Madhya Pradesh", "Uttar Pradesh", "Bihar", "Rajasthan", "Chhattisgarh", "Maharashtra", "Delhi (NCR)", "Gujarat", "Haryana", "Punjab", "Jharkhand", "Uttarakhand", "West Bengal", "Odisha", "Other State / UT"]} />
            <FormField labelEn="Class / Samvarg (Category)" labelHi="" name="category" value={form.category} onChange={handleChange} disabled={isLocked} required type="select" options={["GEN", "OBC", "SC", "ST", "EWS"]} />

            <FormField labelEn="Aadhaar Linked Mobile No." labelHi="" name="aadharLinkedMobile" value={form.aadharLinkedMobile} onChange={handleChange} disabled={isLocked} />
          </div>
        </ProfileSection>

        {/* Father's Information */}
        <ProfileSection
          icon={Users}
          titleEn="Father's Information"
          titleHi=""
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField labelEn="Father's Name" labelHi="" name="fatherName" value={form.fatherName} onChange={handleChange} disabled={isLocked} required />
            <FormField labelEn="Father's Name (Hindi)" labelHi="" name="fatherNameHindi" value={form.fatherNameHindi} onChange={handleChange} disabled={isLocked} required />
            <FormField labelEn="Occupation" labelHi="" name="fatherOccupation" value={form.fatherOccupation} onChange={handleChange} disabled={isLocked} required />

            <FormField labelEn="Education" labelHi="" name="fatherEducation" value={form.fatherEducation} onChange={handleChange} disabled={isLocked} required />
            <FormField labelEn="Mobile No." labelHi="" name="fatherPhone" value={form.fatherPhone} onChange={handleChange} disabled={isLocked} required />
            <FormField labelEn="Email" labelHi="" name="fatherEmail" value={form.fatherEmail} onChange={handleChange} disabled={isLocked} type="email" />

            <FormField labelEn="Annual Income (Rs.)" labelHi="" name="fatherAnnualIncome" value={form.fatherAnnualIncome} onChange={handleChange} disabled={isLocked} />
          </div>
        </ProfileSection>

        {/* Mother's Information */}
        <ProfileSection
          icon={Users}
          titleEn="Mother's Information"
          titleHi=""
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField labelEn="Mother's Name" labelHi="" name="motherName" value={form.motherName} onChange={handleChange} disabled={isLocked} required />
            <FormField labelEn="Mother's Name (Hindi)" labelHi="" name="motherNameHindi" value={form.motherNameHindi} onChange={handleChange} disabled={isLocked} required />
            <FormField labelEn="Occupation" labelHi="" name="motherOccupation" value={form.motherOccupation} onChange={handleChange} disabled={isLocked} required />

            <FormField labelEn="Education" labelHi="" name="motherEducation" value={form.motherEducation} onChange={handleChange} disabled={isLocked} required />
            <FormField labelEn="Mobile No." labelHi="" name="motherPhone" value={form.motherPhone} onChange={handleChange} disabled={isLocked} required />
            <FormField labelEn="Email" labelHi="" name="motherEmail" value={form.motherEmail} onChange={handleChange} disabled={isLocked} type="email" />

            <FormField labelEn="Annual Income (Rs.)" labelHi="" name="motherAnnualIncome" value={form.motherAnnualIncome} onChange={handleChange} disabled={isLocked} />
          </div>
        </ProfileSection>

        {/* Permanent & Correspondence Address */}
        <ProfileSection
          icon={Home}
          titleEn="Permanent & Local Correspondence Address"
          titleHi=""
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-800 border-b pb-1">Permanent Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField labelEn="Full Address" labelHi="" name="permanentAddress" value={form.permanentAddress} onChange={handleChange} disabled={isLocked} required colSpan={2} />
                <FormField labelEn="City" labelHi="" name="permanentCity" value={form.permanentCity} onChange={handleChange} disabled={isLocked} required />
                <FormField labelEn="State" labelHi="" name="permanentState" value={form.permanentState} onChange={handleChange} disabled={isLocked} required />
                <FormField labelEn="Pin Code" labelHi="" name="permanentPincode" value={form.permanentPincode} onChange={handleChange} disabled={isLocked} />
                <FormField labelEn="STD Code & Phone" labelHi="" name="permanentPhone" value={form.permanentPhone} onChange={handleChange} disabled={isLocked} />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-1">
                <h4 className="text-xs font-bold text-gray-800">Local / Correspondence Address</h4>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={sameAsPermanent}
                    onChange={handleSameAsPermanentToggle}
                    disabled={isLocked}
                    className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  Same as Permanent Address</label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField labelEn="Student Name" labelHi="" name="correspondenceStudentName" value={form.correspondenceStudentName || form.name} onChange={handleChange} disabled={isLocked} required />
                <FormField labelEn="Address" labelHi="" name="correspondenceAddress" value={form.correspondenceAddress} onChange={handleChange} disabled={isLocked} colSpan={2} required />
                <FormField labelEn="City" labelHi="" name="correspondenceCity" value={form.correspondenceCity} onChange={handleChange} disabled={isLocked} required />
                <FormField labelEn="State" labelHi="" name="correspondenceState" value={form.correspondenceState} onChange={handleChange} disabled={isLocked} required />
                <FormField labelEn="Pin Code" labelHi="" name="correspondencePincode" value={form.correspondencePincode} onChange={handleChange} disabled={isLocked} required />
                <FormField labelEn="Student Mobile No." labelHi="" name="correspondenceMobile" value={form.correspondenceMobile} onChange={handleChange} disabled={isLocked} required />
              </div>
            </div>
          </div>
        </ProfileSection>

        {/* Student Bank Details */}
        <ProfileSection
          icon={CreditCard}
          titleEn="Student Bank Account Details"
          titleHi=""
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField labelEn="Bank Name" labelHi="" name="bankName" value={form.bankName} onChange={handleChange} disabled={isLocked} />
            <FormField labelEn="Account Holder Name" labelHi="" name="accountHolderName" value={form.accountHolderName} onChange={handleChange} disabled={isLocked} />
            <FormField labelEn="Account Number" labelHi="" name="accountNo" value={form.accountNo} onChange={handleChange} disabled={isLocked} />
            <FormField labelEn="IFSC Code" labelHi="" name="ifscCode" value={form.ifscCode} onChange={handleChange} disabled={isLocked} />
          </div>
        </ProfileSection>

        <ProfileSection
          icon={Award}
          titleEn="Scholarship & DRCC Unique IDs"
          titleHi=""
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              labelEn="Scholarship Registration / Application ID"
              labelHi=""
              name="scholarshipUniqueId"
              value={form.scholarshipUniqueId || ""}
              onChange={handleChange}
              disabled={isLocked}
              placeholder="PMS / NSP / Scholarship registration ID"
              hint="Scholarship payment form will use only this profile-linked ID."
            />
            <FormField
              labelEn="DRCC Loan / Student Credit Card ID"
              labelHi=""
              name="drccLoanId"
              value={form.drccLoanId || form.studentCreditCardId || ""}
              onChange={handleChange}
              disabled={isLocked}
              placeholder="BSCC / DRCC loan or credit card ID"
              hint="DRCC payment form will auto-fetch this ID from profile."
            />
          </div>
        </ProfileSection>

        {/* Documents Submission & Photo/Signature Uploads */}
        <ProfileSection
          icon={FileText}
          titleEn="Documents Submission & Photo / Signature Uploads"
          titleHi=""
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        >
          <div className="space-y-6">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>Note:</strong> All document and image uploads (PDF / JPG / PNG) have a maximum file size limit of <strong>1 MB (1024 KB)</strong>. Please ensure your files are within 1 MB before uploading.</span>
            </div>

            {!isLocked && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-end gap-3 text-xs">
                <div className="flex-1 w-full">
                  <label className="block font-bold text-gray-700 mb-1">Document Name</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 shadow-sm"
                    style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                  >
                    <option value="" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>-- Select Document /     --</option>
                    
                    <optgroup label="Schooling Marksheets (10th / 12th)" style={{ color: "#581c87", backgroundColor: "#f3e8ff", fontWeight: "800" }}>
                      <option value="HIGH SCHOOL MARKSHEET (10th)" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>HIGH SCHOOL MARKSHEET (10th)</option>
                      <option value="HIGHER SECONDARY MARKSHEET (12th)" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>HIGHER SECONDARY MARKSHEET (12th)</option>
                    </optgroup>

                    <optgroup label="Institutional & Clearance Certificates" style={{ color: "#581c87", backgroundColor: "#f3e8ff", fontWeight: "800" }}>
                      <option value="MIGRATION CERTIFICATE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>MIGRATION CERTIFICATE</option>
                      <option value="TRANSFER CERTIFICATE (TC)" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>TRANSFER CERTIFICATE (TC)</option>
                      <option value="COLLEGE LEAVING CERTIFICATE (CLC)" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>COLLEGE LEAVING CERTIFICATE (CLC)</option>
                      <option value="SCHOOL LEAVING CERTIFICATE (SLC)" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>SCHOOL LEAVING CERTIFICATE (SLC)</option>
                      <option value="CHARACTER CERTIFICATE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>CHARACTER CERTIFICATE</option>
                      <option value="GAP CERTIFICATE (AFFIDAVIT)" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>GAP CERTIFICATE (AFFIDAVIT)</option>
                      <option value="NO DUES CERTIFICATE (NOC)" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>NO DUES CERTIFICATE (NOC)</option>
                    </optgroup>

                    <optgroup label="Government Identity Proofs" style={{ color: "#581c87", backgroundColor: "#f3e8ff", fontWeight: "800" }}>
                      <option value="AADHAR CARD" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>AADHAR CARD</option>
                      <option value="PAN CARD" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>PAN CARD</option>
                      <option value="VOTER ID CARD" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>VOTER ID CARD</option>
                      <option value="PASSPORT" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>PASSPORT</option>
                      <option value="DRIVING LICENSE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>DRIVING LICENSE</option>
                      <option value="SAMAGRA ID PROOF" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>SAMAGRA ID PROOF</option>
                    </optgroup>

                    <optgroup label="Category, Income & Quota Certificates" style={{ color: "#581c87", backgroundColor: "#f3e8ff", fontWeight: "800" }}>
                      <option value="CASTE CERTIFICATE (SC/ST/OBC/NCL)" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>CASTE CERTIFICATE (SC/ST/OBC/NCL)</option>
                      <option value="INCOME CERTIFICATE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>INCOME CERTIFICATE</option>
                      <option value="DOMICILE / RESIDENCE CERTIFICATE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>DOMICILE / RESIDENCE CERTIFICATE</option>
                      <option value="EWS CERTIFICATE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>EWS CERTIFICATE (Economically Weaker Section)</option>
                      <option value="PWD / DISABILITY CERTIFICATE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>PWD / DISABILITY CERTIFICATE</option>
                      <option value="DEFENSE / ARMED FORCES CERTIFICATE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>DEFENSE / ARMED FORCES CERTIFICATE</option>
                      <option value="KASHMIRI MIGRANT CERTIFICATE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>KASHMIRI MIGRANT CERTIFICATE</option>
                    </optgroup>

                    <optgroup label="Entrance Exams & Merit Documents" style={{ color: "#581c87", backgroundColor: "#f3e8ff", fontWeight: "800" }}>
                      <option value="ENTRANCE EXAM ADMIT CARD" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>ENTRANCE EXAM ADMIT CARD (JEE/NEET/CUET/CET)</option>
                      <option value="ENTRANCE EXAM SCORECARD / RANK CARD" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>ENTRANCE EXAM SCORECARD / RANK CARD</option>
                      <option value="PROVISIONAL ALLOTMENT LETTER" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>PROVISIONAL ALLOTMENT LETTER</option>
                    </optgroup>

                    <optgroup label="Higher Education Certificates" style={{ color: "#581c87", backgroundColor: "#f3e8ff", fontWeight: "800" }}>
                      <option value="DIPLOMA DEGREE & MARKSHEET" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>DIPLOMA DEGREE & MARKSHEET</option>
                      <option value="GRADUATION DEGREE CERTIFICATE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>GRADUATION DEGREE CERTIFICATE</option>
                      <option value="GRADUATION ALL SEMESTER MARKSHEETS" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>GRADUATION ALL SEMESTER MARKSHEETS</option>
                      <option value="POST GRADUATION DEGREE CERTIFICATE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>POST GRADUATION DEGREE CERTIFICATE</option>
                      <option value="POST GRADUATION ALL SEMESTER MARKSHEETS" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>POST GRADUATION ALL SEMESTER MARKSHEETS</option>
                    </optgroup>

                    <optgroup label="Medical, Bank & Miscellaneous" style={{ color: "#581c87", backgroundColor: "#f3e8ff", fontWeight: "800" }}>
                      <option value="MEDICAL FITNESS CERTIFICATE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>MEDICAL FITNESS CERTIFICATE</option>
                      <option value="BANK PASSBOOK / CANCELLED CHEQUE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>BANK PASSBOOK / CANCELLED CHEQUE (Scholarship/Refund)</option>
                      <option value="ANTI-RAGGING AFFIDAVIT (STUDENT)" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>ANTI-RAGGING AFFIDAVIT (STUDENT)</option>
                      <option value="ANTI-RAGGING AFFIDAVIT (PARENT)" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>ANTI-RAGGING AFFIDAVIT (PARENT)</option>
                      <option value="SPORTS / NCC / NSS CERTIFICATE" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>SPORTS / NCC / NSS CERTIFICATE</option>
                      <option value="OTHER MISCELLANEOUS UNDERTAKING" style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>OTHER MISCELLANEOUS UNDERTAKING</option>
                    </optgroup>
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="block font-bold text-gray-700 mb-1">Upload File (PDF / JPG)</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleDocFileChange}
                    className="w-full text-xs cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddDocument}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="w-4 h-4" /> Save Document
                </button>
              </div>
            )}

            {/* Instant Pre-Submit File Preview Bar */}
            {selectedDocFile && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <p className="font-bold text-purple-950">Chosen File: {selectedDocFile.name}</p>
                    <p className="text-[10px] text-purple-700 font-medium">Size: {(selectedDocFile.size / 1024).toFixed(1)} KB - Ready to Save</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openDocumentInNewTab({
                    id: "DRAFT-PREVIEW",
                    docName: docType || "Chosen Document Preview",
                    savedFile: selectedDocFile.name,
                    submittedOn: "Just Now (Unsaved Draft)",
                    fileUrl: docFilePreviewUrl,
                    fileType: selectedDocFile.type
                  })}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Eye className="w-3.5 h-3.5" /> Click to Preview File
                </button>
              </div>
            )}

            {docSuccessMsg && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">{docSuccessMsg}</p>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[640px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 font-bold">
                    <th className="p-3">Sr.</th>
                    <th className="p-3">Document Name</th>
                    <th className="p-3">Submitted On</th>
                    <th className="p-3">Saved File</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {docList.map((doc, idx) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-600">{idx + 1}</td>
                      <td className="p-3 font-bold text-gray-900">{doc.docName}</td>
                      <td className="p-3 font-semibold text-gray-600">{doc.submittedOn}</td>
                      <td className="p-3 font-mono text-[11px] text-blue-700 truncate max-w-[200px]">{doc.savedFile}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDocumentInNewTab(doc)}
                          className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded-lg font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> View / Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-2 text-purple-950">
              <h4 className="font-extrabold text-purple-900 text-sm flex items-center gap-1.5">
                <Info className="w-4 h-4 text-purple-600" /> Photograph & Signature Standards Guidelines
              </h4>
              <ul className="space-y-1 text-[11px] list-alpha pl-4 leading-relaxed font-medium">
                <li><strong>A.</strong> Photo uploaded will appear on Marksheets & Degree. Selfies not allowed.</li>
                <li><strong>B.</strong> Colour photo and signature must have white background.</li>
                <li><strong>C.</strong> Both ears visible clearly.</li>
                <li><strong>D.</strong> File upload size: Maximum 1 MB (1024 KB) for PDF, JPG & PNG documents.</li>
                <li><strong>E.</strong> Dimensions: Height 350 PX, Width 300 PX (max).</li>
                <li><strong>F.</strong> Signature dimensions: Height 120 PX, Width 300 PX (max).</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* 1. Student Photo */}
              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-2.5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-gray-800">Student Photo <span className="text-red-500">*</span></span>
                    {photoSaveStatus.studentPhoto && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Done Saved</span>}
                  </div>
                  {/* Live Thumbnail Preview Box */}
                  <div className="w-full h-44 rounded-xl border border-dashed border-purple-300 bg-slate-900/5 flex items-center justify-center overflow-hidden relative group p-1">
                    {isRenderableFileUrl(photoPreviews.studentPhoto) ? (
                      <img src={photoPreviews.studentPhoto} alt="Student Preview" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <div className="text-center p-2 text-gray-400 space-y-1">
                        <Upload className="w-6 h-6 mx-auto text-purple-500" />
                        <p className="text-[10px] font-bold text-gray-600">Student Passport Photo</p>
                        <p className="text-[9px] text-gray-400 font-medium">(Full Aspect Ratio Preview)</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoSelect("studentPhoto", e)}
                    disabled={isLocked}
                    className="text-[11px] w-full font-bold text-slate-900 cursor-pointer"
                  />
                  {photoCardFeedback.studentPhoto && (
                    <p className="text-[10px] font-extrabold text-purple-800 bg-purple-100/80 px-2 py-1 rounded border border-purple-200 truncate">
                      {photoCardFeedback.studentPhoto}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSavePhoto("studentPhoto", "Student Photo")}
                      disabled={!isRenderableFileUrl(photoPreviews.studentPhoto) || isLocked}
                      className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-1 ${
                        photoSaveStatus.studentPhoto
                          ? "bg-emerald-600 text-white"
                          : isRenderableFileUrl(photoPreviews.studentPhoto)
                          ? "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {photoSaveStatus.studentPhoto ? "Saved" : "Save Photo"}
                    </button>
                    {isRenderableFileUrl(photoPreviews.studentPhoto) && (
                      <button
                        type="button"
                        onClick={() => openDocumentInNewTab({ docName: "Student Passport Photo (Full Size)", savedFile: "student_photo.jpg", submittedOn: "Live Upload", fileUrl: photoPreviews.studentPhoto, fileType: "image/jpeg" })}
                        className="p-2 bg-purple-100 text-purple-800 hover:bg-purple-700 hover:text-white rounded-lg font-bold transition-all text-xs flex items-center justify-center shrink-0 cursor-pointer"
                        title="View Full Size"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isRenderableFileUrl(photoPreviews.studentPhoto) && !isLocked && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto("studentPhoto", "Student Photo")}
                        className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-700 hover:text-white rounded-lg font-bold transition-all text-xs flex items-center justify-center shrink-0 cursor-pointer"
                        title="Delete / Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Student Signature */}
              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-2.5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-gray-800">Student Sign <span className="text-red-500">*</span></span>
                    {photoSaveStatus.studentSign && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Done Saved</span>}
                  </div>
                  {/* Live Thumbnail Preview Box */}
                  <div className="w-full h-44 rounded-xl border border-dashed border-purple-300 bg-slate-900/5 flex items-center justify-center overflow-hidden relative group p-1">
                    {isRenderableFileUrl(photoPreviews.studentSign) ? (
                      <img src={photoPreviews.studentSign} alt="Student Sign Preview" className="w-full h-full object-contain rounded-lg p-2" />
                    ) : (
                      <div className="text-center p-2 text-gray-400 space-y-1">
                        <Upload className="w-6 h-6 mx-auto text-purple-500" />
                        <p className="text-[10px] font-bold text-gray-600">Student Signature Specimen</p>
                        <p className="text-[9px] text-gray-400 font-medium">(Full Aspect Ratio Preview)</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoSelect("studentSign", e)}
                    disabled={isLocked}
                    className="text-[11px] w-full font-bold text-slate-900 cursor-pointer"
                  />
                  {photoCardFeedback.studentSign && (
                    <p className="text-[10px] font-extrabold text-purple-800 bg-purple-100/80 px-2 py-1 rounded border border-purple-200 truncate">
                      {photoCardFeedback.studentSign}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSavePhoto("studentSign", "Student Signature")}
                      disabled={!isRenderableFileUrl(photoPreviews.studentSign) || isLocked}
                      className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-1 ${
                        photoSaveStatus.studentSign
                          ? "bg-emerald-600 text-white"
                          : isRenderableFileUrl(photoPreviews.studentSign)
                          ? "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {photoSaveStatus.studentSign ? "Saved" : "Save Sign"}
                    </button>
                    {isRenderableFileUrl(photoPreviews.studentSign) && (
                      <button
                        type="button"
                        onClick={() => openDocumentInNewTab({ docName: "Student Signature Specimen (Full Size)", savedFile: "student_sign.png", submittedOn: "Live Upload", fileUrl: photoPreviews.studentSign, fileType: "image/png" })}
                        className="p-2 bg-purple-100 text-purple-800 hover:bg-purple-700 hover:text-white rounded-lg font-bold transition-all text-xs flex items-center justify-center shrink-0 cursor-pointer"
                        title="View Full Size"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isRenderableFileUrl(photoPreviews.studentSign) && !isLocked && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto("studentSign", "Student Signature")}
                        className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-700 hover:text-white rounded-lg font-bold transition-all text-xs flex items-center justify-center shrink-0 cursor-pointer"
                        title="Delete / Remove Signature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Father Photo */}
              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-2.5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-gray-800">Father Photo <span className="text-gray-400 font-normal text-[10px]">(Optional)</span></span>
                    {photoSaveStatus.fatherPhoto && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Done Saved</span>}
                  </div>
                  {/* Live Thumbnail Preview Box */}
                  <div className="w-full h-44 rounded-xl border border-dashed border-indigo-300 bg-slate-900/5 flex items-center justify-center overflow-hidden relative group p-1">
                    {isRenderableFileUrl(photoPreviews.fatherPhoto) ? (
                      <img src={photoPreviews.fatherPhoto} alt="Father Preview" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <div className="text-center p-2 text-gray-400 space-y-1">
                        <Upload className="w-6 h-6 mx-auto text-indigo-500" />
                        <p className="text-[10px] font-bold text-gray-600">Father Passport Photo</p>
                        <p className="text-[9px] text-gray-400 font-medium">(Full Aspect Ratio Preview)</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoSelect("fatherPhoto", e)}
                    disabled={isLocked}
                    className="text-[11px] w-full font-bold text-slate-900 cursor-pointer"
                  />
                  {photoCardFeedback.fatherPhoto && (
                    <p className="text-[10px] font-extrabold text-indigo-800 bg-indigo-100/80 px-2 py-1 rounded border border-indigo-200 truncate">
                      {photoCardFeedback.fatherPhoto}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSavePhoto("fatherPhoto", "Father Photo")}
                      disabled={!isRenderableFileUrl(photoPreviews.fatherPhoto) || isLocked}
                      className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-1 ${
                        photoSaveStatus.fatherPhoto
                          ? "bg-emerald-600 text-white"
                          : isRenderableFileUrl(photoPreviews.fatherPhoto)
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {photoSaveStatus.fatherPhoto ? "Saved" : "Save Photo"}
                    </button>
                    {isRenderableFileUrl(photoPreviews.fatherPhoto) && (
                      <button
                        type="button"
                        onClick={() => openDocumentInNewTab({ docName: "Father Passport Photo (Full Size)", savedFile: "father_photo.jpg", submittedOn: "Live Upload", fileUrl: photoPreviews.fatherPhoto, fileType: "image/jpeg" })}
                        className="p-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-700 hover:text-white rounded-lg font-bold transition-all text-xs flex items-center justify-center shrink-0 cursor-pointer"
                        title="View Full Size"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isRenderableFileUrl(photoPreviews.fatherPhoto) && !isLocked && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto("fatherPhoto", "Father Photo")}
                        className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-700 hover:text-white rounded-lg font-bold transition-all text-xs flex items-center justify-center shrink-0 cursor-pointer"
                        title="Delete / Remove Father Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Mother Photo */}
              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 space-y-2.5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-gray-800">Mother Photo <span className="text-gray-400 font-normal text-[10px]">(Optional)</span></span>
                    {photoSaveStatus.motherPhoto && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Done Saved</span>}
                  </div>
                  {/* Live Thumbnail Preview Box */}
                  <div className="w-full h-44 rounded-xl border border-dashed border-rose-300 bg-slate-900/5 flex items-center justify-center overflow-hidden relative group p-1">
                    {isRenderableFileUrl(photoPreviews.motherPhoto) ? (
                      <img src={photoPreviews.motherPhoto} alt="Mother Preview" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <div className="text-center p-2 text-gray-400 space-y-1">
                        <Upload className="w-6 h-6 mx-auto text-rose-500" />
                        <p className="text-[10px] font-bold text-gray-600">Mother Passport Photo</p>
                        <p className="text-[9px] text-gray-400 font-medium">(Full Aspect Ratio Preview)</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoSelect("motherPhoto", e)}
                    disabled={isLocked}
                    className="text-[11px] w-full font-bold text-slate-900 cursor-pointer"
                  />
                  {photoCardFeedback.motherPhoto && (
                    <p className="text-[10px] font-extrabold text-rose-800 bg-rose-100/80 px-2 py-1 rounded border border-rose-200 truncate">
                      {photoCardFeedback.motherPhoto}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSavePhoto("motherPhoto", "Mother Photo")}
                      disabled={!isRenderableFileUrl(photoPreviews.motherPhoto) || isLocked}
                      className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-1 ${
                        photoSaveStatus.motherPhoto
                          ? "bg-emerald-600 text-white"
                          : isRenderableFileUrl(photoPreviews.motherPhoto)
                          ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {photoSaveStatus.motherPhoto ? "Saved" : "Save Photo"}
                    </button>
                    {isRenderableFileUrl(photoPreviews.motherPhoto) && (
                      <button
                        type="button"
                        onClick={() => openDocumentInNewTab({ docName: "Mother Passport Photo (Full Size)", savedFile: "mother_photo.jpg", submittedOn: "Live Upload", fileUrl: photoPreviews.motherPhoto, fileType: "image/jpeg" })}
                        className="p-2 bg-rose-100 text-rose-800 hover:bg-rose-700 hover:text-white rounded-lg font-bold transition-all text-xs flex items-center justify-center shrink-0 cursor-pointer"
                        title="View Full Size"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isRenderableFileUrl(photoPreviews.motherPhoto) && !isLocked && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto("motherPhoto", "Mother Photo")}
                        className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-700 hover:text-white rounded-lg font-bold transition-all text-xs flex items-center justify-center shrink-0 cursor-pointer"
                        title="Delete / Remove Mother Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ProfileSection>

        {/* Tab 1 Footer Next Button */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-700 font-bold">
            Done Step 1 Completed: Personal Details, Address, Bank & Documents filled.
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("educational")}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
          >
            Proceed to Educational Details (10th / 12th / Graduation)
          </button>
        </div>
      </>
    )}

    {activeTab === "educational" && (
      <>
        {/* 10th & 12th Educational Details */}
        <ProfileSection
          icon={GraduationCap}
          titleEn="10th & 12th School Educational Details"
          titleHi="10  12   "
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider border-b pb-1">10th School Detail</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField labelEn="10th School Name" labelHi="10   " name="tenthSchool" value={form.tenthSchool} onChange={handleChange} disabled={isLocked} required colSpan={2} />
                <FormField labelEn="10th Board" labelHi="" name="tenthBoard" value={form.tenthBoard} onChange={handleChange} disabled={isLocked} />

                <FormField labelEn="10th Passing Year" labelHi="" name="tenthYear" value={form.tenthYear} onChange={handleChange} disabled={isLocked} required />
                <FormField labelEn="10th Scholar No." labelHi="" name="tenthRollNo" value={form.tenthRollNo} onChange={handleChange} disabled={isLocked} />
                <FormField labelEn="10th Obtained Marks" labelHi="" name="tenthObtainMarks" value={form.tenthObtainMarks} onChange={handleChange} disabled={isLocked} />

                <FormField labelEn="10th Total Marks" labelHi="" name="tenthTotalMarks" value={form.tenthTotalMarks} onChange={handleChange} disabled={isLocked} />
                <FormField labelEn="10th Percentage (%)" labelHi="" name="tenthPercentage" value={form.tenthPercentage} onChange={handleChange} disabled={isLocked} />
                <FormField labelEn="Result Status" labelHi="" name="tenthResultStatus" value={form.tenthResultStatus} onChange={handleChange} disabled={isLocked} />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider border-b pb-1">12th School Detail</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField labelEn="12th School Name" labelHi="12   " name="twelfthSchool" value={form.twelfthSchool} onChange={handleChange} disabled={isLocked} required colSpan={2} />
                <FormField labelEn="12th Board" labelHi="" name="twelfthBoard" value={form.twelfthBoard} onChange={handleChange} disabled={isLocked} />

                <FormField labelEn="12th Passing Year" labelHi="" name="twelfthYear" value={form.twelfthYear} onChange={handleChange} disabled={isLocked} required />
                <FormField labelEn="12th Scholar No." labelHi="" name="twelfthRollNo" value={form.twelfthRollNo} onChange={handleChange} disabled={isLocked} required />
                <FormField labelEn="Stream / Subject" labelHi="" name="twelfthStream" value={form.twelfthStream} onChange={handleChange} disabled={isLocked} required />

                <FormField labelEn="12th Obtained Marks" labelHi="" name="twelfthObtainMarks" value={form.twelfthObtainMarks} onChange={handleChange} disabled={isLocked} />
                <FormField labelEn="12th Total Marks" labelHi="" name="twelfthTotalMarks" value={form.twelfthTotalMarks} onChange={handleChange} disabled={isLocked} required />
                <FormField labelEn="12th Percentage (%)" labelHi="" name="twelfthPercentage" value={form.twelfthPercentage} onChange={handleChange} disabled={isLocked} />

                <FormField labelEn="Center Code" labelHi="" name="twelfthCenterCode" value={form.twelfthCenterCode} onChange={handleChange} disabled={isLocked} />
                <FormField labelEn="Admit Card ID" labelHi="" name="twelfthAdmitCardId" value={form.twelfthAdmitCardId} onChange={handleChange} disabled={isLocked} />
                <FormField labelEn="Result Status" labelHi="" name="twelfthResultStatus" value={form.twelfthResultStatus} onChange={handleChange} disabled={isLocked} />
              </div>
            </div>
          </div>
        </ProfileSection>

        {/* Graduation Detail & 12-Semester SGPA Grid */}
        <ProfileSection
          icon={Award}
          titleEn="Graduation Detail & 8-Semester SGPA Grid (If applying for PG)"
          titleHi="   8   "
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        >
          <div className="space-y-4">
            <p className="text-[11px] font-bold text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-200">
              Note: Select and fill this section only if you have taken admission in Post Graduation (PG).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField labelEn="College Name" labelHi="" name="gradCollege" value={form.gradCollege} onChange={handleChange} disabled={isLocked} colSpan={2} />
              <FormField labelEn="University" name="gradUniversity" value={form.gradUniversity} onChange={handleChange} disabled={isLocked} />
              <FormField labelEn="Passing Year" name="gradYear" value={form.gradYear} onChange={handleChange} disabled={isLocked} />
              <FormField labelEn="Scholar No." name="gradRollNo" value={form.gradRollNo} onChange={handleChange} disabled={isLocked} />
              <FormField labelEn="Course / Stream" name="gradStream" value={form.gradStream} onChange={handleChange} disabled={isLocked} />
              <FormField labelEn="Obtain Marks" name="gradObtainMarks" value={form.gradObtainMarks} onChange={handleChange} disabled={isLocked} />
              <FormField labelEn="Total Marks" name="gradTotalMarks" value={form.gradTotalMarks} onChange={handleChange} disabled={isLocked} />
              <FormField labelEn="% / CGPA" name="gradPercentage" value={form.gradPercentage} onChange={handleChange} disabled={isLocked} />
            </div>

            <h4 className="text-xs font-bold text-gray-800 pt-2 border-b pb-1">Graduation Semester / Year Wise SGPA Detail (8 Semesters)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {(form.gradSgpaGrid || []).map((sem, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-center text-xs space-y-1">
                  <span className="text-[9px] font-bold text-gray-500 block leading-tight">{sem.sem}</span>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={sem.sgpa}
                    onChange={(e) => {
                      const newGrid = [...(form.gradSgpaGrid || [])];
                      newGrid[idx].sgpa = e.target.value;
                      setForm({ ...form, gradSgpaGrid: newGrid });
                    }}
                    className="w-full text-center font-extrabold text-purple-700 bg-white border border-gray-300 rounded p-1 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </ProfileSection>

        {/* Post Graduation Detail */}
        <ProfileSection
          icon={BookOpenCheck}
          titleEn="Post Graduation Detail & 4-Semester SGPA Grid"
          titleHi=""
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField labelEn="College Name" labelHi="" name="pgCollege" value={form.pgCollege} onChange={handleChange} disabled={isLocked} colSpan={2} />
              <FormField labelEn="University" name="pgUniversity" value={form.pgUniversity} onChange={handleChange} disabled={isLocked} />
              <FormField labelEn="Passing Year" name="pgYear" value={form.pgYear} onChange={handleChange} disabled={isLocked} />
              <FormField labelEn="Scholar No." name="pgRollNo" value={form.pgRollNo} onChange={handleChange} disabled={isLocked} />
              <FormField labelEn="Course / Stream" name="pgStream" value={form.pgStream} onChange={handleChange} disabled={isLocked} />
            </div>

            <h4 className="text-xs font-bold text-gray-800 pt-2 border-b pb-1">Post Graduation Semester / Year Wise SGPA Detail</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(form.pgSgpaGrid || []).map((sem, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-center text-xs space-y-1">
                  <span className="text-[9px] font-bold text-gray-500 block leading-tight">{sem.sem}</span>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={sem.sgpa}
                    onChange={(e) => {
                      const newGrid = [...(form.pgSgpaGrid || [])];
                      newGrid[idx].sgpa = e.target.value;
                      setForm({ ...form, pgSgpaGrid: newGrid });
                    }}
                    className="w-full text-center font-extrabold text-purple-700 bg-white border border-gray-300 rounded p-1 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </ProfileSection>

        {/* Diploma Detail */}
        <ProfileSection
          icon={Layers}
          titleEn="Diploma Detail & 6-Semester SGPA Grid"
          titleHi=""
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField labelEn="College Name" labelHi="" name="diplomaCollege" value={form.diplomaCollege} onChange={handleChange} disabled={isLocked} colSpan={2} />
              <FormField labelEn="University / Board" name="diplomaUniversity" value={form.diplomaUniversity} onChange={handleChange} disabled={isLocked} />
              <FormField labelEn="Passing Year" name="diplomaYear" value={form.diplomaYear} onChange={handleChange} disabled={isLocked} />
              <FormField labelEn="Scholar No." name="diplomaRollNo" value={form.diplomaRollNo} onChange={handleChange} disabled={isLocked} />
              <FormField labelEn="Course / Stream" name="diplomaStream" value={form.diplomaStream} onChange={handleChange} disabled={isLocked} />
            </div>

            <h4 className="text-xs font-bold text-gray-800 pt-2 border-b pb-1">Diploma Semester / Year Wise SGPA Detail (6 Semesters)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
              {(form.diplomaSgpaGrid || []).map((sem, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-center text-xs space-y-1">
                  <span className="text-[9px] font-bold text-gray-500 block leading-tight">{sem.sem}</span>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={sem.sgpa}
                    onChange={(e) => {
                      const newGrid = [...(form.diplomaSgpaGrid || [])];
                      newGrid[idx].sgpa = e.target.value;
                      setForm({ ...form, diplomaSgpaGrid: newGrid });
                    }}
                    className="w-full text-center font-extrabold text-teal-700 bg-white border border-gray-300 rounded p-1 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </ProfileSection>

        {/* Qualified Competitive Entrance Exam Details */}
        <ProfileSection
          icon={ShieldCheck}
          titleEn="Qualified Competitive Entrance Exam Details"
          titleHi=""
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField labelEn="Qualified Exam Name" name="qualifiedExamName" value={form.qualifiedExamName} onChange={handleChange} disabled={isLocked} />
            <FormField labelEn="Exam Scholar No." name="qualifiedExamRollNo" value={form.qualifiedExamRollNo} onChange={handleChange} disabled={isLocked} />
            <FormField labelEn="Exam Rank" name="qualifiedExamRank" value={form.qualifiedExamRank} onChange={handleChange} disabled={isLocked} />
            <FormField labelEn="Exam Quota" name="qualifiedExamQuota" value={form.qualifiedExamQuota} onChange={handleChange} disabled={isLocked} />
            <FormField labelEn="Exam Marks" name="qualifiedExamMarks" value={form.qualifiedExamMarks} onChange={handleChange} disabled={isLocked} />
          </div>
        </ProfileSection>

        {/* Tab 2 Footer Back & Submit Buttons */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-1.5 border border-slate-300 transition-all"
          >
            Back to Personal Details
          </button>

          <div className="flex items-center gap-3">
            {isVerified ? (
              <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-300 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified & Approved by Admissions Desk
              </span>
            ) : !isLocked ? (
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" /> Save & Submit Profile for Admissions Verification
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 rounded-xl bg-blue-100 text-blue-800 font-extrabold text-xs flex items-center gap-1.5 border border-blue-300">
                  <Clock className="w-4 h-4 text-blue-600" /> Submitted for Verification
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Edit className="w-4 h-4" /> Edit Details
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    )}
  </form>

      {/* High-Tech Document View & Preview Modal */}
      {viewModalDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4 text-slate-900 border border-slate-200 max-h-[92dvh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" /> {viewModalDoc.docName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  File: <span className="font-mono text-purple-700 font-bold">{viewModalDoc.savedFile}</span> - Submitted: {viewModalDoc.submittedOn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewModalDoc(null)}
                className="p-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close Close
              </button>
            </div>

            {/* Document Viewer Canvas */}
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center min-h-[300px] max-h-[60vh] overflow-auto">
              {viewModalDoc.fileUrl ? (
                viewModalDoc.fileType?.includes("image") || viewModalDoc.savedFile?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <img src={viewModalDoc.fileUrl} alt="Document Preview" className="max-h-[55vh] max-w-full rounded-lg shadow-md border border-slate-300 object-contain" />
                ) : (
                  <iframe src={viewModalDoc.fileUrl} title="PDF Preview" className="w-full h-[55vh] rounded-lg border border-slate-300 bg-white" />
                )
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-purple-200 shadow-md space-y-3 max-w-md w-full">
                  <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center font-black text-2xl shadow-inner">
                    Done
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">{viewModalDoc.docName}</h4>
                  <p className="text-xs font-mono text-purple-700 font-bold">{viewModalDoc.savedFile}</p>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-full inline-block border border-emerald-300">
                    OFFICIAL VERIFIED DOCUMENT RECORD
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-500 font-medium">Document Record ID: #{viewModalDoc.id || "REC-01"}</span>
              <div className="flex items-center gap-2">
                {viewModalDoc.fileUrl && (
                  <a
                    href={viewModalDoc.fileUrl}
                    download={viewModalDoc.savedFile}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                  >
                    Download File
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setViewModalDoc(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Status Confirmation Modal */}
      {submissionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 text-slate-900 border border-purple-200 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center font-black text-3xl shadow-inner border border-purple-200">
              <CheckCircle2 className="w-9 h-9 text-purple-600" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Profile Submitted for Admissions Verification!</h3>
              <p className="text-xs font-bold text-purple-800 bg-purple-100/80 px-3 py-1 rounded-full inline-block border border-purple-300">
                Submitted on: {lastSubmittedTime || new Date().toLocaleDateString("en-GB")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <strong className="text-slate-900">Current Status:</strong>
                    <span className="text-amber-800 font-extrabold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 text-[11px]">
                      Waiting for Admissions Desk Verification
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-bold mt-1">
                    Reviewing Cell: <span className="text-purple-900 font-extrabold">Central Admissions & Registrar Desk</span>
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2.5 space-y-2">
                <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider">Verification Rules:</p>
                <div className="flex items-start gap-2 text-[11px] text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>If Approved:</strong> Your original certificates & records will be verified and permanently locked by Admissions Desk.</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-rose-900 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>If Discrepancy Found:</strong> Admissions Officer remarks will appear, profile will unlock, and you can re-upload & re-submit.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSubmissionModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer active:scale-95"
            >
              Got It / Continue to Student Portal
            </button>
          </div>
        </div>
      )}
    </div>

      {/* Printable Official Profile Summary Sheet (Hidden on web, visible only during window.print()) */}
      <div className="hidden print:block text-slate-900 bg-white p-2 font-sans text-xs space-y-4 leading-normal">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">{form.collegeName || "Institution name not available"}</h1>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Affiliated to {form.universityName || "University not available"}</h2>
            <p className="text-xs font-black text-purple-950 uppercase pt-1 tracking-wider">OFFICIAL STUDENT REGISTRATION & ADMISSION RECORD</p>
            <p className="text-[10px] text-slate-600 font-semibold">
              Printed On: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} - Verification Status: <strong className="text-slate-900 font-extrabold">{status}</strong>
            </p>
          </div>
          <div className="flex items-start gap-3">
            {/* Student Photo Box */}
            <div className="w-24 h-28 border-2 border-slate-900 p-0.5 flex flex-col items-center justify-center bg-slate-50 text-center">
              {photoPreviews.studentPhoto ? (
                <img src={photoPreviews.studentPhoto} alt="Student Photo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-[9px] font-bold text-slate-500">STUDENT PHOTO</span>
              )}
            </div>
            {/* Student Signature Box */}
            <div className="w-24 h-14 border-2 border-slate-900 p-0.5 flex items-center justify-center bg-slate-50 text-center self-end">
              {photoPreviews.studentSign ? (
                <img src={photoPreviews.studentSign} alt="Student Sign" className="w-full h-full object-contain" />
              ) : (
                <span className="text-[9px] font-bold text-slate-500">SIGNATURE</span>
              )}
            </div>
          </div>
        </div>

        {/* Personal Details Table */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-xs uppercase bg-slate-100 p-1.5 border border-slate-300 text-slate-900">Personal & Identification Information</h3>
          <table className="w-full border-collapse border border-slate-300 text-[11px]">
            <tbody>
              <tr>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50 w-1/4">Student Full Name:</td>
                <td className="p-1.5 border border-slate-300 font-extrabold text-slate-900">{form.name} ({form.nameHindi})</td>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50 w-1/4">Aadhaar Name:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.aadharName}</td>
              </tr>
              <tr>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50">Enrollment No:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.enrollmentNo}</td>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50">Scholar No / ABC ID:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.scholarNo} / {form.abcId}</td>
              </tr>
              <tr>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50">Class / Section:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.courseClass} (Section: {form.section})</td>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50">Date of Birth / Place:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.dob} ({form.placeOfBirth || "N/A"})</td>
              </tr>
              <tr>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50">Category / Domicile:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.category} / {form.domicile}</td>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50">Gender / Religion:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.gender} / {form.religion}</td>
              </tr>
              <tr>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50">Mobile / Email:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.phone} / {form.email}</td>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50">Aadhaar No / Samagra:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.aadhar} / {form.samagraId || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Parent Information Table */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-xs uppercase bg-slate-100 p-1.5 border border-slate-300 text-slate-900">Parents Information</h3>
          <table className="w-full border-collapse border border-slate-300 text-[11px]">
            <tbody>
              <tr>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50 w-1/4">Father's Name:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.fatherName} ({form.fatherNameHindi})</td>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50 w-1/4">Father Occupation / Phone:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.fatherOccupation} / {form.fatherPhone}</td>
              </tr>
              <tr>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50">Mother's Name:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.motherName} ({form.motherNameHindi})</td>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50 w-1/4">Mother Occupation / Phone:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.motherOccupation} / {form.motherPhone}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Address Table */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-xs uppercase bg-slate-100 p-1.5 border border-slate-300 text-slate-900">Address Details</h3>
          <table className="w-full border-collapse border border-slate-300 text-[11px]">
            <tbody>
              <tr>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50 w-1/4">Permanent Address:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.permanentAddress}, {form.permanentCity}, {form.permanentState} - {form.permanentPincode}</td>
              </tr>
              <tr>
                <td className="p-1.5 border border-slate-300 font-bold bg-slate-50">Local Address:</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.correspondenceAddress}, {form.correspondenceCity}, {form.correspondenceState} - {form.correspondencePincode}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bank Account Details Table */}
        {form.bankName && (
          <div className="space-y-1">
            <h3 className="font-extrabold text-xs uppercase bg-slate-100 p-1.5 border border-slate-300 text-slate-900">Bank Account Details</h3>
            <table className="w-full border-collapse border border-slate-300 text-[11px]">
              <tbody>
                <tr>
                  <td className="p-1.5 border border-slate-300 font-bold bg-slate-50 w-1/4">Bank Name / Account Holder:</td>
                  <td className="p-1.5 border border-slate-300 font-bold">{form.bankName} / {form.accountHolderName || form.name}</td>
                  <td className="p-1.5 border border-slate-300 font-bold bg-slate-50 w-1/4">Account No / IFSC Code:</td>
                  <td className="p-1.5 border border-slate-300 font-bold">{form.accountNo} / {form.ifscCode}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Schooling Educational Qualifications Table (10th & 12th) */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-xs uppercase bg-slate-100 p-1.5 border border-slate-300 text-slate-900">10th & 12th School Educational Qualifications</h3>
          <table className="w-full border-collapse border border-slate-300 text-[11px]">
            <thead>
              <tr className="bg-slate-50 font-bold text-center">
                <th className="p-1.5 border border-slate-300">Class</th>
                <th className="p-1.5 border border-slate-300 text-left">School Name</th>
                <th className="p-1.5 border border-slate-300">Board</th>
                <th className="p-1.5 border border-slate-300">Passing Year</th>
                <th className="p-1.5 border border-slate-300">Scholar No / Codes</th>
                <th className="p-1.5 border border-slate-300">Obtained / Total</th>
                <th className="p-1.5 border border-slate-300">% / Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center font-medium">
                <td className="p-1.5 border border-slate-300 font-bold">10th High School</td>
                <td className="p-1.5 border border-slate-300 text-left font-bold">{form.tenthSchool}</td>
                <td className="p-1.5 border border-slate-300">{form.tenthBoard}</td>
                <td className="p-1.5 border border-slate-300">{form.tenthYear}</td>
                <td className="p-1.5 border border-slate-300 font-mono text-[10px]">{form.tenthRollNo}</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.tenthObtainMarks} / {form.tenthTotalMarks}</td>
                <td className="p-1.5 border border-slate-300 font-extrabold text-emerald-800">{form.tenthPercentage}% ({form.tenthResultStatus || "PASS"})</td>
              </tr>
              <tr className="text-center font-medium">
                <td className="p-1.5 border border-slate-300 font-bold">12th Intermediate</td>
                <td className="p-1.5 border border-slate-300 text-left font-bold">{form.twelfthSchool} ({form.twelfthStream})</td>
                <td className="p-1.5 border border-slate-300">{form.twelfthBoard}</td>
                <td className="p-1.5 border border-slate-300">{form.twelfthYear}</td>
                <td className="p-1.5 border border-slate-300 font-mono text-[10px]">{form.twelfthRollNo} (Center: {form.twelfthCenterCode})</td>
                <td className="p-1.5 border border-slate-300 font-bold">{form.twelfthObtainMarks} / {form.twelfthTotalMarks}</td>
                <td className="p-1.5 border border-slate-300 font-extrabold text-emerald-800">{form.twelfthPercentage}% ({form.twelfthResultStatus || "PASS"})</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Graduation SGPA Table */}
        {form.gradCollege && (
          <div className="space-y-1">
            <h3 className="font-extrabold text-xs uppercase bg-slate-100 p-1.5 border border-slate-300 text-slate-900">Graduation Qualification & 8-Semester SGPA Grid</h3>
            <p className="text-[10px] font-bold">College Name: {form.gradCollege} | University: {form.gradUniversity} | Stream: {form.gradStream} | Scholar No: {form.gradRollNo} | Year: {form.gradYear} | %: {form.gradPercentage}%</p>
            <table className="w-full border-collapse border border-slate-300 text-[10px] text-center">
              <thead>
                <tr className="bg-slate-50 font-bold">
                  {form.gradSgpaGrid.map((sem, i) => (
                    <th key={i} className="p-1 border border-slate-300">{sem.sem.split(" ")[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {form.gradSgpaGrid.map((sem, i) => (
                    <td key={i} className="p-1 border border-slate-300 font-bold">{sem.sgpa || "-"}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Post Graduation SGPA Table */}
        {form.pgCollege && (
          <div className="space-y-1">
            <h3 className="font-extrabold text-xs uppercase bg-slate-100 p-1.5 border border-slate-300 text-slate-900">Post Graduation Qualification & 4-Semester SGPA Grid</h3>
            <p className="text-[10px] font-bold">College Name: {form.pgCollege} | University: {form.pgUniversity} | Stream: {form.pgStream} | Scholar No: {form.pgRollNo}</p>
            <table className="w-full border-collapse border border-slate-300 text-[10px] text-center">
              <thead>
                <tr className="bg-slate-50 font-bold">
                  {form.pgSgpaGrid.map((sem, i) => (
                    <th key={i} className="p-1 border border-slate-300">{sem.sem.split(" ")[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {form.pgSgpaGrid.map((sem, i) => (
                    <td key={i} className="p-1 border border-slate-300 font-bold">{sem.sgpa || "-"}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Diploma SGPA Table */}
        {form.diplomaCollege && (
          <div className="space-y-1">
            <h3 className="font-extrabold text-xs uppercase bg-slate-100 p-1.5 border border-slate-300 text-slate-900">Diploma Qualification & 6-Semester SGPA Grid</h3>
            <p className="text-[10px] font-bold">College Name: {form.diplomaCollege} | Board/Univ: {form.diplomaUniversity} | Stream: {form.diplomaStream} | Scholar No: {form.diplomaRollNo}</p>
            <table className="w-full border-collapse border border-slate-300 text-[10px] text-center">
              <thead>
                <tr className="bg-slate-50 font-bold">
                  {form.diplomaSgpaGrid.map((sem, i) => (
                    <th key={i} className="p-1 border border-slate-300">{sem.sem.split(" ")[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {form.diplomaSgpaGrid.map((sem, i) => (
                    <td key={i} className="p-1 border border-slate-300 font-bold">{sem.sgpa || "-"}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Qualified Competitive Entrance Exam Details */}
        {form.qualifiedExamName && (
          <div className="space-y-1">
            <h3 className="font-extrabold text-xs uppercase bg-slate-100 p-1.5 border border-slate-300 text-slate-900">Qualified Competitive Entrance Exam Details</h3>
            <table className="w-full border-collapse border border-slate-300 text-[11px]">
              <tbody>
                <tr>
                  <td className="p-1.5 border border-slate-300 font-bold bg-slate-50 w-1/4">Qualified Exam Name:</td>
                  <td className="p-1.5 border border-slate-300 font-bold">{form.qualifiedExamName}</td>
                  <td className="p-1.5 border border-slate-300 font-bold bg-slate-50 w-1/4">Exam Scholar No:</td>
                  <td className="p-1.5 border border-slate-300 font-bold">{form.qualifiedExamRollNo}</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-slate-300 font-bold bg-slate-50">Exam Rank / Quota:</td>
                  <td className="p-1.5 border border-slate-300 font-bold">{form.qualifiedExamRank} (Quota: {form.qualifiedExamQuota})</td>
                  <td className="p-1.5 border border-slate-300 font-bold bg-slate-50">Obtained Marks:</td>
                  <td className="p-1.5 border border-slate-300 font-bold">{form.qualifiedExamMarks}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Document Records Table */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-xs uppercase bg-slate-100 p-1.5 border border-slate-300 text-slate-900">Submitted Document Records ({docList.length})</h3>
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-50 font-bold">
                <th className="p-1 border border-slate-300 w-12 text-center">S.No</th>
                <th className="p-1 border border-slate-300 text-left">Document Name</th>
                <th className="p-1 border border-slate-300 text-left">Filename</th>
                <th className="p-1 border border-slate-300 text-center">Submission Date</th>
              </tr>
            </thead>
            <tbody>
              {docList.map((doc, idx) => (
                <tr key={doc.id || idx}>
                  <td className="p-1 border border-slate-300 text-center font-bold">{idx + 1}</td>
                  <td className="p-1 border border-slate-300 font-bold">{doc.docName}</td>
                  <td className="p-1 border border-slate-300 font-mono text-[9px]">{doc.savedFile}</td>
                  <td className="p-1 border border-slate-300 text-center">{doc.submittedOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Declaration & Signatures */}
        <div className="pt-8 grid grid-cols-3 gap-6 text-center text-[10px]">
          <div className="border-t border-slate-800 pt-1">
            <p className="font-bold">Student Signature</p>
            <p className="text-[9px] text-slate-500">({form.name})</p>
          </div>
          <div className="border-t border-slate-800 pt-1">
            <p className="font-bold">Parent / Guardian Signature</p>
            <p className="text-[9px] text-slate-500">({form.fatherName})</p>
          </div>
          <div className="border-t border-slate-800 pt-1">
            <p className="font-bold">Faculty Advisor / Mentor Sign & Stamp</p>
            <p className="text-[9px] text-slate-500">({form.mentorName})</p>
          </div>
        </div>
      </div>
    </>
  );
}

