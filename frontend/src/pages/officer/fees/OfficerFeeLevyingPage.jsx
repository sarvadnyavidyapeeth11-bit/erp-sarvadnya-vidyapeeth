import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders,
  Plus,
  CheckCircle2,
  Trash2,
  Pencil,
  Users,
  IndianRupee,
  Sparkles,
  Layers,
  Bus,
  BookOpen,
  Calendar,
  Award,
  AlertCircle,
  Tag,
  ToggleLeft,
  ToggleRight,
  Filter,
  Search,
  Building2,
  GraduationCap,
  FileText,
  CheckSquare,
  Square,
  ArrowRight,
  School,
  Clock,
  FolderTree,
  ChevronDown
} from "lucide-react";
import { addStudentLedgerEntry, getStudentDetailedLedger, removeStudentLedgerEntriesByFeeHead } from "../../../hooks/studentPortalData";
import { getStudents, initERP } from "../../../hooks/erpData";
import { getCourses, getDepartments, getBatches, getAttendanceShortage } from "../../../hooks/academicMasterData";
import { supabase, isSupabaseConfigured } from "../../../lib/supabaseClient";

const DEFAULT_FEE_PRIORITY = 9999;
const normalizeFeePriority = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : DEFAULT_FEE_PRIORITY;
};

export default function OfficerFeeLevyingPage() {
  const [successMsg, setSuccessMsg] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [sessionFilter, setSessionFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFeeHeadId, setEditingFeeHeadId] = useState("");

  // Accordion dropdown expand/collapse state
  const [expandedDepts, setExpandedDepts] = useState({});

  const toggleDeptAccordion = (dept) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [dept]: prev[dept] === undefined ? false : !prev[dept]
    }));
  };

  // -- Form State for Levying / Imposing Fee Head --
  const [headName, setHeadName] = useState("");
  const [category, setCategory] = useState("Tuition & Academic");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priorityOrder, setPriorityOrder] = useState("1");
  const [isMandatory, setIsMandatory] = useState(true);
  
  const [departmentPrograms, setDepartmentPrograms] = useState([]);

  const loadAcademicScope = () => {
    const departments = getDepartments();
    const courses = getCourses();
    const batches = getBatches();
    const derivedPrograms = courses
      .filter((course) => (course.status || "Active") === "Active")
      .map((course) => {
      const directCourseBatches = batches.filter((batch) => (
        batch.courseCode === course.code ||
        batch.course === course.name
      ));
      const courseBatches = directCourseBatches.length > 0 ? directCourseBatches : batches.filter((batch) => (
        batch.departmentCode === course.departmentCode ||
        batch.department === course.department
      ));
      const sections = Array.from(new Set(courseBatches.map((batch) => batch.section).filter(Boolean)));
      return {
        id: course.id || course.code || course.name,
        name: course.name,
        code: course.code,
        department: course.department || departments.find((d) => d.code === course.departmentCode)?.name || "",
        departmentCode: course.departmentCode,
        shortName: course.code || course.name,
        durationYears: Number(course.durationYears) || 0,
        sections
      };
    });
    setDepartmentPrograms(derivedPrograms);
    const currentProgram = derivedPrograms.find((program) => program.id === selectedProgramId);
    if ((!selectedProgramId || !currentProgram) && derivedPrograms[0]) {
      setSelectedProgramId(derivedPrograms[0].id);
      setSelectedDepartment(derivedPrograms[0].department);
      setSelectedSection("All Sections");
    } else if (currentProgram) {
      setSelectedDepartment(currentProgram.department);
      if (selectedSection !== "All Sections" && currentProgram.sections.length > 0 && !currentProgram.sections.includes(selectedSection)) {
        setSelectedSection("All Sections");
      }
    }
  };

  // Hierarchical Target Scope
  const [scopeMode, setScopeMode] = useState("Course"); // "University", "Course", "AttendanceShortage"
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSection, setSelectedSection] = useState("All Sections"); // "All", "Sec A", "Sec B"

  useEffect(() => {
    loadAcademicScope();
    window.addEventListener("academicDataUpdated", loadAcademicScope);
    window.addEventListener("storage", loadAcademicScope);
    return () => {
      window.removeEventListener("academicDataUpdated", loadAcademicScope);
      window.removeEventListener("storage", loadAcademicScope);
    };
  }, [selectedProgramId, selectedSection]);

  // Get active program
  const activeProgram = useMemo(() => {
    return departmentPrograms.find(d => d.id === selectedProgramId) || departmentPrograms[0] || {
      name: "",
      code: "",
      department: "",
      shortName: "",
      durationYears: 0,
      sections: []
    };
  }, [departmentPrograms, selectedProgramId]);

  const handleProgramChange = (programId) => {
    setSelectedProgramId(programId);
    const prog = departmentPrograms.find(d => d.id === programId);
    if (prog) {
      setSelectedDepartment(prog.department);
      setSelectedSection("All Sections");
    }
  };

  // Specific Attendance Shortage Defaulters List (<75%)
  const [shortageStudents, setShortageStudents] = useState(() => {
    return getAttendanceShortage().map((row) => ({
      id: row.id,
      name: row.studentName,
      course: row.course || "",
      roll: row.rollNumber,
      attendance: Number(row.percentage) || 0,
      selected: true
    }));
  });

  const toggleStudentSelection = (id) => {
    setShortageStudents(prev =>
      prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s)
    );
  };

  const selectAllShortage = (selectVal) => {
    setShortageStudents(prev => prev.map(s => ({ ...s, selected: selectVal })));
  };

  // Master Categories
  const masterCategories = [
    "Tuition & Academic",
    "Campus Development & Infra",
    "Computer Lab & Practical",
    "Training & Placement Skills",
    "Central Library & Books",
    "University Examination",
    "Activities, Fest & Symposium",
    "Transport & Bus Service",
    "Hostel & Residence",
    "Admission & Registration",
    "Caution Money / Security Deposit",
    "Other / Custom Charges",
    "Penalties & Late Fines"
  ];

  const inferFeeHeadSession = (head) => {
    if (head.session) return head.session;
    const ledgerSessions = getStudentDetailedLedger()
      .filter((entry) => entry.feeHeadId === head.id || String(entry.id || "").startsWith(`${head.id}-`))
      .map((entry) => entry.session)
      .filter(Boolean);
    const uniqueSessions = Array.from(new Set(ledgerSessions));
    if (uniqueSessions.length === 1) return uniqueSessions[0];
    if (uniqueSessions.length > 1) return "Multiple Sessions";
    return "";
  };

  const normalizeFeeHeadsWithSessions = (heads = []) => (
    heads.map((head) => ({
      ...head,
      session: inferFeeHeadSession(head),
      priorityOrder: normalizeFeePriority(head.priorityOrder ?? head.feePriority ?? head.priority_order ?? head.priority)
    }))
  );

  // Active Imposed Fee Heads Directory
  const [leviedFeeHeads, setLeviedFeeHeads] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("erp_levied_fee_heads");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return normalizeFeeHeadsWithSessions(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const buildTargetStudents = () => {
    const normalizeText = (value) => String(value || "").trim().toLowerCase();
    const normalizeSection = (value) => String(value || "").replace(/section|sec|\s/gi, "").toUpperCase();
    return getStudents().filter((student) => {
      if (scopeMode === "University") return true;
      if (scopeMode === "AttendanceShortage") {
        return shortageStudents.some((row) => row.selected && row.roll === student.rollNumber);
      }
      const studentCourseValues = [
        student.course,
        student.courseCode,
        student.courseName,
        student.courseClass
      ].map(normalizeText).filter(Boolean);
      const activeCourseValues = [
        activeProgram.name,
        activeProgram.code,
        activeProgram.shortName
      ].map(normalizeText).filter(Boolean);
      const programMatch = activeCourseValues.length === 0 ||
        studentCourseValues.some((studentValue) =>
          activeCourseValues.some((activeValue) =>
            studentValue === activeValue ||
            studentValue.includes(activeValue) ||
            activeValue.includes(studentValue)
          )
        );
      const departmentMatch = !selectedDepartment ||
        normalizeText(student.department) === normalizeText(selectedDepartment) ||
        normalizeText(selectedDepartment).includes(normalizeText(student.department));
      const sectionMatch = selectedSection === "All Sections" ||
        normalizeSection(student.section) === normalizeSection(selectedSection);
      return programMatch && departmentMatch && sectionMatch;
    });
  };

  const targetSessionPreview = useMemo(() => {
    const sessions = Array.from(new Set(buildTargetStudents().map((student) => student.session).filter(Boolean)));
    if (sessions.length === 0) return "No matching student session";
    return sessions.length === 1 ? sessions[0] : `${sessions.length} sessions selected`;
  }, [scopeMode, selectedProgramId, selectedDepartment, selectedSection, shortageStudents, departmentPrograms]);

  const handleImposeFee = (e) => {
    e.preventDefault();
    if (!headName || !amount) return;

    const numAmount = Number(amount);
    let computedScopeLabel = "";

    if (scopeMode === "University") {
      computedScopeLabel = "All Enrolled Students (University Wide)";
    } else if (scopeMode === "Course") {
      computedScopeLabel = [activeProgram.name, activeProgram.department, selectedSection].filter(Boolean).join(" - ");
    } else if (scopeMode === "AttendanceShortage") {
      const selectedList = shortageStudents.filter(s => s.selected);
      computedScopeLabel = `Attendance Shortage (<75%) - ${selectedList.length} Students Selected`;
    }

    const targetStudents = buildTargetStudents();
    if (targetStudents.length === 0) {
      alert("No enrolled students match the selected fee scope. Check department, section, or group data.");
      return;
    }
    const targetSessions = Array.from(new Set(targetStudents.map((student) => student.session).filter(Boolean)));
    if (targetSessions.length > 1 && scopeMode !== "AttendanceShortage") {
      alert(`Selected students belong to multiple academic sessions (${targetSessions.join(", ")}). Please impose fee session-wise, one active session at a time.`);
      return;
    }

    const assignedDueDate = dueDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const assignedPriority = normalizeFeePriority(priorityOrder);

    const existingFeeHead = editingFeeHeadId ? leviedFeeHeads.find((head) => head.id === editingFeeHeadId) : null;
    const feeHeadId = existingFeeHead?.id || `FEE-HD-${Date.now()}`;
    const newFeeHead = {
      ...(existingFeeHead || {}),
      id: feeHeadId,
      name: headName,
      category: category,
      amount: numAmount,
      courseId: scopeMode === "University" ? "" : activeProgram.id,
      course: scopeMode === "University" ? "All Courses" : activeProgram.name,
      courseCode: scopeMode === "University" ? "" : activeProgram.code,
      department: scopeMode === "University" ? "All Departments" : selectedDepartment,
      semester: "All",
      session: targetSessions[0] || "",
      section: selectedSection,
      installment: "All",
      targetScope: computedScopeLabel,
      targetCount: targetStudents.length,
      targetRollNumbers: targetStudents.map((student) => student.rollNumber),
      totalBilled: numAmount * targetStudents.length,
      status: "Active",
      isMandatory: isMandatory,
      dueDate: assignedDueDate,
      priorityOrder: assignedPriority,
      feePriority: assignedPriority
    };

    const updated = existingFeeHead
      ? leviedFeeHeads.map((head) => head.id === editingFeeHeadId ? newFeeHead : head)
      : [newFeeHead, ...leviedFeeHeads];
    setLeviedFeeHeads(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("erp_levied_fee_heads", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }

    // -- Real-Time Sync with Student Portal ledger --
    const ledgerDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    if (editingFeeHeadId && typeof window !== "undefined") {
      const existingLedger = getStudentDetailedLedger();
      const withoutEditedHead = existingLedger.filter((entry) => entry.feeHeadId !== editingFeeHeadId);
      localStorage.setItem("erp_student_ledger_entries", JSON.stringify(withoutEditedHead));
    }

    targetStudents.forEach((student) => {
      addStudentLedgerEntry({
        id: `${newFeeHead.id}-${student.rollNumber}`,
        feeHeadId: newFeeHead.id,
        studentId: student.id,
        rollNumber: student.rollNumber,
        studentName: student.name,
        course: student.course,
        semester: "All",
        batch: student.batch,
        session: student.session || "",
        date: ledgerDate,
        dueDate: assignedDueDate,
        dr: numAmount,
        cr: 0,
        particulars: newFeeHead.name,
        remarks: `${newFeeHead.name} imposed by Fee Officer`,
        transactionMode: newFeeHead.category,
        installment: "All",
        priorityOrder: assignedPriority,
        feePriority: assignedPriority,
        status: "Due"
      });
    });

    if (isSupabaseConfigured && supabase) {
      const feeHeadPayload = {
        id: newFeeHead.id,
        name: newFeeHead.name,
        category: newFeeHead.category,
        amount: newFeeHead.amount,
        department: newFeeHead.department,
        semester: "All",
        section: newFeeHead.section,
        installment: "All",
        target_scope: newFeeHead.targetScope,
        target_count: newFeeHead.targetCount,
        total_billed: newFeeHead.totalBilled,
        status: newFeeHead.status,
        is_mandatory: newFeeHead.isMandatory,
        due_date: newFeeHead.dueDate,
        priority_order: newFeeHead.priorityOrder
      };
      supabase.from("fee_heads").upsert(feeHeadPayload).then(({ error }) => {
        if (!error) return;
        if (String(error.message || "").includes("priority_order")) {
          const { priority_order: _priorityOrder, ...fallbackPayload } = feeHeadPayload;
          supabase.from("fee_heads").upsert(fallbackPayload).then(({ error: fallbackError }) => {
            if (fallbackError) console.warn("Supabase fee_heads upsert error:", fallbackError);
          });
          return;
        }
        console.warn("Supabase fee_heads upsert error:", error);
      });
    }

    // Broadcast global synchronization event
    window.dispatchEvent(new CustomEvent("feeDataUpdated", { detail: { newFeeHead, mode: editingFeeHeadId ? "edit" : "create" } }));

    setSuccessMsg(`Fee Head "${headName}" (Rs. ${numAmount.toLocaleString("en-IN")}) ${editingFeeHeadId ? "updated" : "applied"} successfully on [${computedScopeLabel}]!`);
    setTimeout(() => setSuccessMsg(""), 5000);

    // Reset Form
    setHeadName("");
    setAmount("");
    setDueDate("");
    setPriorityOrder("1");
    setEditingFeeHeadId("");
  };

  const handleEdit = (head) => {
    const matchedProgram = departmentPrograms.find((program) => (
      program.id === head.courseId ||
      program.code === head.courseCode ||
      program.name === head.course ||
      program.department === head.department
    ));
    setEditingFeeHeadId(head.id);
    setHeadName(head.name || "");
    setCategory(head.category || "Tuition & Academic");
    setAmount(String(head.amount || ""));
    setDueDate(head.dueDate || "");
    setPriorityOrder(String(normalizeFeePriority(head.priorityOrder ?? head.feePriority ?? head.priority_order ?? head.priority)));
    setScopeMode(head.department === "All Departments" ? "University" : "Course");
    if (matchedProgram) {
      setSelectedProgramId(matchedProgram.id);
      setSelectedDepartment(matchedProgram.department);
    } else {
      setSelectedDepartment(head.department || "");
    }
    setSelectedSection(head.section || "All Sections");
    setIsMandatory(head.isMandatory !== false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingFeeHeadId("");
    setHeadName("");
    setAmount("");
    setDueDate("");
    setPriorityOrder("1");
  };

  const handleToggleStatus = (id) => {
    setLeviedFeeHeads((prev) => {
      const updated = prev.map((h) =>
        h.id === id ? { ...h, status: h.status === "Active" ? "Paused" : "Active" } : h
      );
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("erp_levied_fee_heads", JSON.stringify(updated));
        } catch (e) {}
      }
      if (isSupabaseConfigured && supabase) {
        const target = updated.find((h) => h.id === id);
        if (target) {
          supabase.from("fee_heads").update({ status: target.status }).eq("id", id).then(({ error }) => {
            if (error) console.warn("Supabase fee head status error:", error);
          });
        }
      }
      return updated;
    });
  };

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem("erp_levied_fee_heads");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const normalized = normalizeFeeHeadsWithSessions(parsed);
            setLeviedFeeHeads(normalized);
            localStorage.setItem("erp_levied_fee_heads", JSON.stringify(normalized));
          }
        } else {
          setLeviedFeeHeads([]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener("feeDataUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("feeDataUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleDelete = (id) => {
    const headToDelete = leviedFeeHeads.find((h) => h.id === id);
    const targetName = headToDelete?.name || "Fee Head";
    if (window.confirm(`Are you sure you want to delete "${targetName}"? This will remove this fee head and cancel all imposed charges for students.`)) {
      const updated = leviedFeeHeads.filter((head) => head.id !== id);
      setLeviedFeeHeads(updated);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("erp_levied_fee_heads", JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }

      // Remove ledger debits for this fee head
      removeStudentLedgerEntriesByFeeHead(id, headToDelete?.name);

      if (isSupabaseConfigured && supabase) {
        supabase.from("fee_heads").delete().eq("id", id).then(({ error }) => {
          if (error) console.warn("Supabase fee head delete error:", error);
        });
      }

      setSuccessMsg(`Fee head "${targetName}" has been deleted successfully.`);
      setTimeout(() => setSuccessMsg(""), 3500);
      window.dispatchEvent(new Event("feeDataUpdated"));
    }
  };

  const filteredHeads = leviedFeeHeads.filter((h) => {
    const matchSearch =
      !searchTerm ||
      String(h.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(h.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(h.targetScope || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "All" || h.category === categoryFilter;
    const matchDept =
      deptFilter === "All" ||
      String(h.department || "").toLowerCase().includes(deptFilter.toLowerCase()) ||
      (deptFilter === "University" && (String(h.department || "").includes("All") || String(h.department || "").includes("Common")));
    const headSession = h.session || "Session Missing";
    const matchSession = sessionFilter === "All" || headSession === sessionFilter;
    return matchSearch && matchCategory && matchDept && matchSession;
  });

  // Grouping filtered heads by Department + Academic Session
  const groupedHeads = useMemo(() => {
    const groups = {};
    filteredHeads.forEach((head) => {
      const deptKey = `${head.department || "University-Wide / Common Heads"}|${head.session || "Session Missing"}`;
      if (!groups[deptKey]) {
        groups[deptKey] = [];
      }
      groups[deptKey].push(head);
    });
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => normalizeFeePriority(a.priorityOrder ?? a.feePriority ?? a.priority) -
        normalizeFeePriority(b.priorityOrder ?? b.feePriority ?? b.priority));
    });
    return groups;
  }, [filteredHeads]);

  const totalBilledRevenue = leviedFeeHeads.reduce((sum, h) => sum + (Number(h.totalBilled) || 0), 0);
  const sessionOptions = Array.from(new Set(leviedFeeHeads.map((head) => head.session || "Session Missing"))).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* -- Top Header Banner -- */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-200">
              Accounts Structure & Batch Levying Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Fee Head Applicator & Levying Engine
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Impose Tuition, Lab, Library, Bus, Exam, & Hostel fee heads across Courses, Departments, or University-wide with real-time student ledger synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-purple-50/80 border border-purple-200 p-3 rounded-2xl shrink-0">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-xs">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-extrabold text-purple-700 tracking-wider">Total Active Billed Volume</p>
            <p className="text-xl font-black text-slate-900 leading-tight">Rs. {totalBilledRevenue.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {/* -- Main Layout: Form (Left 5 cols) & Directory Table (Right 7 cols) -- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* -- Left Column: Fee Head Form -- */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" /> Apply & Impose New Fee Head
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Configure fee category, target course/department scope, amount, and due date.
              </p>
            </div>

            <form onSubmit={handleImposeFee} className="space-y-4 text-xs">
              {/* Fee Particular Title */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">
                  Fee Head Particular Title *
                </label>
                <input
                  type="text"
                  required
                  value={headName}
                  onChange={(e) => setHeadName(e.target.value)}
                  placeholder="e.g. Tuition Fee, Exam Fee, Lab Fee"
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              {/* Category & Amount Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Fee Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 outline-none focus:border-purple-500 focus:bg-white text-xs"
                  >
                    {masterCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Fee Amount (Rs.) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Due Date & Payment Adjustment Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" /> Fee Due Date:
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-purple-600" /> Adjustment Priority:
                  </label>
                  <select
                    value={priorityOrder}
                    onChange={(e) => setPriorityOrder(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold text-slate-900 outline-none focus:border-purple-500 focus:bg-white text-xs"
                  >
                    {Array.from({ length: 20 }, (_, index) => index + 1).map((priority) => (
                      <option key={priority} value={priority}>
                        Priority {priority} {priority === 1 ? "(adjust first)" : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] font-bold text-slate-500">
                    Manual payment pe priority 1 pahle adjust hoga, phir 2, 3...
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Academic Session Auto Fetched
                </label>
                <input
                  type="text"
                  readOnly
                  value={targetSessionPreview}
                  className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-black text-emerald-900 outline-none cursor-not-allowed"
                />
                <p className="mt-1 text-[10px] font-bold text-slate-500">
                  Fee ledger me amount selected students ke current academic session par impose hoga.
                </p>
              </div>

              {/* -- Scope Mode Tabs -- */}
              <div className="space-y-2.5 p-3 bg-purple-50/50 rounded-xl border border-purple-200">
                <label className="flex items-center gap-1.5 text-[11px] font-black uppercase text-purple-900">
                  <FolderTree className="w-3.5 h-3.5 text-purple-700" />
                  Target Scope:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setScopeMode("Course")}
                    className={`py-1.5 px-2 rounded-lg font-extrabold text-[10px] transition-all cursor-pointer truncate ${
                      scopeMode === "Course"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-purple-200"
                    }`}
                  >
                    Dept Wise
                  </button>
                  <button
                    type="button"
                    onClick={() => setScopeMode("University")}
                    className={`py-1.5 px-2 rounded-lg font-extrabold text-[10px] transition-all cursor-pointer truncate ${
                      scopeMode === "University"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-purple-200"
                    }`}
                  >
                    All Enrolled
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScopeMode("AttendanceShortage");
                      if (!headName) setHeadName("Attendance Shortage Fine (<75%)");
                      if (!amount) setAmount("1000");
                      setCategory("Penalties & Late Fines");
                    }}
                    className={`py-1.5 px-2 rounded-lg font-extrabold text-[10px] transition-all cursor-pointer truncate ${
                      scopeMode === "AttendanceShortage"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
                    }`}
                  >
                    Shortage (&lt;75%)
                  </button>
                </div>

                {scopeMode === "Course" && (
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        Department / Course Program:
                      </label>
                      <select
                        value={selectedProgramId}
                        onChange={(e) => handleProgramChange(e.target.value)}
                        className="w-full p-2 bg-white border border-purple-300 rounded-lg font-bold text-slate-800 text-xs"
                      >
                        {departmentPrograms.map((prog) => (
                          <option key={prog.id} value={prog.id}>
                            {prog.name} - {prog.department}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Section / Division:</label>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full p-2 bg-white border border-purple-300 rounded-lg font-bold text-slate-800 text-xs"
                      >
                        <option value="All Sections">All Sections</option>
                        {(activeProgram.sections.length ? activeProgram.sections : ["Section A", "Section B"]).map((section) => (
                          <option key={section} value={section}>
                            {section} Only
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {scopeMode === "AttendanceShortage" && (
                  <div className="pt-1 space-y-2 bg-rose-50/50 p-2.5 rounded-xl border border-rose-200">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-black text-rose-900">
                        Students with &lt;75% Attendance ({shortageStudents.filter(s => s.selected).length} Selected):
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => selectAllShortage(true)}
                          className="text-[9px] font-bold text-rose-700 hover:underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => selectAllShortage(false)}
                          className="text-[9px] font-bold text-slate-500 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                      {shortageStudents.map((st) => (
                        <label
                          key={st.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            st.selected ? "bg-white border-rose-300 shadow-2xs" : "bg-white/60 border-gray-200 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={st.selected}
                              onChange={() => toggleStudentSelection(st.id)}
                              className="w-3.5 h-3.5 text-rose-600 rounded cursor-pointer"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate leading-tight">{st.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{st.roll} - {st.course}</p>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black shrink-0">
                            {st.attendance}%
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mandatory Clearance Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-gray-200">
                <div>
                  <p className="font-extrabold text-slate-900">Mandatory for No-Dues Clearance</p>
                  <p className="text-[10px] text-slate-500">Must be paid to generate Exam Hall Ticket & NOC</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMandatory(!isMandatory)}
                  className={`p-1 rounded-full cursor-pointer transition-colors ${
                    isMandatory ? "text-purple-600" : "text-slate-400"
                  }`}
                >
                  {isMandatory ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {editingFeeHeadId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingFeeHeadId ? "Update" : "Impose"} Fee Head ({amount ? `Rs. ${Number(amount).toLocaleString("en-IN")}` : "Rs. 0"})
              </button>
              {editingFeeHeadId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs border border-slate-200 transition-all cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>

        {/* -- Right Column: Master Directory -- */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-purple-600" /> Active Levied Fee Heads Directory
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Active fee heads imposed across departments and courses.
                </p>
              </div>

              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 self-start sm:self-auto">
                {filteredHeads.length} Heads Active
              </span>
            </div>

            {/* Department Filter Dropdown */}
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
              <label className="block text-[10px] font-black uppercase text-purple-900 mb-1 flex items-center gap-1">
                <School className="w-3 h-3 text-purple-600" /> Filter by Department:
              </label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full p-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="All">All Departments (Institute Wide)</option>
                {departmentPrograms.map((program) => (
                  <option key={program.name} value={program.name}>{program.name}</option>
                ))}
                <option value="University">University-Wide Common Heads</option>
              </select>
            </div>

            {/* Search, Session & Category Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-xl w-full sm:w-60 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search fee heads..."
                  className="bg-transparent outline-none font-bold text-slate-800 w-full text-xs"
                />
              </div>

              <div>
                <select
                  value={sessionFilter}
                  onChange={(e) => setSessionFilter(e.target.value)}
                  className="w-full bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl text-[11px] font-black text-emerald-900 outline-none"
                >
                  <option value="All">All Sessions</option>
                  {sessionOptions.map((session) => (
                    <option key={session} value={session}>{session}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 outline-none"
                >
                  <option value="All">All Categories</option>
                  {masterCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department Accordion List */}
            <div className="max-h-[620px] overflow-y-auto pr-1.5 space-y-3.5 scrollbar-thin">
              {Object.keys(groupedHeads).length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-gray-200 text-slate-400 text-xs font-bold">
                  No active fee heads match the selected filters.
                </div>
              ) : (
                Object.entries(groupedHeads).map(([groupKey, headsList]) => {
                  const [deptName, sessionName] = groupKey.split("|");
                  const deptTotalBilled = headsList.reduce((sum, h) => sum + (Number(h.totalBilled) || 0), 0);
                  const isDeptOpen = expandedDepts[groupKey] !== false;

                  return (
                    <div
                      key={groupKey}
                      className="bg-slate-50/80 border border-purple-200 rounded-2xl overflow-hidden shadow-2xs transition-all"
                    >
                      {/* Department Accordion Header */}
                      <button
                        type="button"
                        onClick={() => toggleDeptAccordion(groupKey)}
                        className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-purple-50/80 to-white hover:bg-purple-100/50 cursor-pointer text-left transition-colors border-b border-purple-200/60"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                            <School className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-900 tracking-tight truncate">
                              {deptName}
                            </h4>
                            <p className="text-[10px] text-purple-700 font-bold">
                              {headsList.length} Fee Heads Imposed
                            </p>
                            <p className="text-[10px] text-emerald-700 font-black">
                              Session: {sessionName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs">
                            <span className="text-[9px] uppercase font-extrabold text-slate-400 block leading-tight">
                              Total
                            </span>
                            <span className="text-xs font-black text-purple-900 font-mono">
                              Rs. {deptTotalBilled.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className={`p-1 rounded-lg text-purple-700 bg-purple-100/70 transition-transform duration-200 ${isDeptOpen ? "rotate-180" : ""}`}>
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </button>

                      {/* Fee Heads List inside this Department */}
                      {isDeptOpen && (
                        <div className="p-3 space-y-2">
                          {headsList.map((head) => (
                            <div
                              key={head.id}
                              className="p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 transition-all space-y-2"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <h5 className="text-xs font-black text-slate-900">
                                      {head.name}
                                    </h5>
                                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-black">
                                      {head.category}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black">
                                      Priority {normalizeFeePriority(head.priorityOrder ?? head.feePriority ?? head.priority)}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                                    <Users className="w-3 h-3 text-purple-600" /> Target: <strong className="text-slate-700">{head.targetScope}</strong> {head.dueDate ? `- Due: ${head.dueDate}` : ""}
                                  </p>
                                  <p className="text-[11px] text-emerald-700 font-black mt-0.5 flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3 text-emerald-600" /> Session: {head.session || "Auto per student current session"}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                  <div className="text-left sm:text-right">
                                    <p className="text-sm font-black text-slate-900 font-mono">
                                      Rs. {head.amount.toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-[9px] text-emerald-700 font-bold">
                                      Billed ({head.targetCount}): Rs. {(head.totalBilled || 0).toLocaleString("en-IN")}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(head)}
                                      className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg cursor-pointer transition-colors"
                                      title="Edit Fee Head"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(head.id)}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg cursor-pointer transition-colors"
                                      title="Delete / Revoke Fee Head"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
