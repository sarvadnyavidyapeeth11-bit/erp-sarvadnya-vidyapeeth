import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { feeDetails } from "../hooks/studentPortalData";

/**
 * Master Realtime Synchronization Engine for Sarvadnya ERP
 * Connects all 5 Portals (Admin, Admission, HOD, Fee Officer, Student)
 * to live Supabase WebSockets.
 * Employs event debouncing to handle high concurrent database traffic.
 */

// Event debouncer map to coalesce high-frequency database triggers
const debounceTimers = new Map();

const dispatchDebouncedEvent = (eventName, detail, delayMs = 100) => {
  if (typeof window === "undefined") return;
  if (debounceTimers.has(eventName)) {
    clearTimeout(debounceTimers.get(eventName));
  }
  const timer = setTimeout(() => {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
    debounceTimers.delete(eventName);
  }, delayMs);
  debounceTimers.set(eventName, timer);
};

const setCache = (key, value) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value || []));
  }
};

const getCacheList = (key) => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const normalizeStudent = (row) => ({
  ...(row.profile_data || {}),
  id: row.id,
  studentName: row.student_name || "",
  studentNameHindi: row.student_name_hindi || "",
  fatherName: row.father_name || "",
  motherName: row.mother_name || "",
  dob: row.dob || "",
  gender: row.gender || "",
  bloodGroup: row.blood_group || "",
  category: row.category || "",
  religion: row.religion || "",
  nationality: row.nationality || "",
  abcId: row.abc_id || "",
  aadhar: row.aadhar || "",
  phone: row.phone || "",
  email: row.email || "",
  permanentAddress: row.permanent_address || "",
  permanentCity: row.permanent_city || "",
  permanentState: row.permanent_state || "",
  permanentPincode: row.permanent_pincode || "",
  correspondenceAddress: row.correspondence_address || "",
  department: row.department || "",
  course: row.course || "",
  courseCode: row.course_code || "",
  batch: row.batch || "",
  session: row.session || "",
  semester: row.semester || "",
  section: row.section || "",
  rollNumber: row.roll_number || "",
  scholarNo: row.scholar_no || "",
  enrollmentNo: row.enrollment_no || "",
  loginUsername: row.scholar_no || row.roll_number || "",
  loginPassword: row.scholar_no || row.roll_number || "",
  status: !row.status || row.status === "Pending" ? "Pending Verification" : row.status,
  appliedDate: row.applied_date || "",
  verifiedDate: row.verified_date || "",
  remarks: row.remarks || "",
  documents: row.documents || [],
  photoPreviews: row.photo_previews || {},
});

const normalizeDrccApplication = (row, existing = {}) => ({
  ...existing,
  id: row.id,
  rollNumber: row.roll_number || existing.rollNumber,
  scholarNo: row.scholar_no || existing.scholarNo || row.roll_number || existing.rollNumber,
  enrollmentNo: row.enrollment_no || existing.enrollmentNo,
  studentName: row.student_name || existing.studentName,
  course: row.course || existing.course,
  department: row.department || existing.department,
  semester: row.semester || existing.semester,
  session: row.session || existing.session,
  fatherName: row.father_name || existing.fatherName,
  phone: row.phone || existing.phone,
  email: row.email || existing.email,
  aadhar: row.aadhar || existing.aadhar,
  applicationNo: row.application_no || existing.applicationNo,
  applicationDate: row.application_date || existing.applicationDate,
  drccDistrict: row.drcc_district || existing.drccDistrict,
  drccReference: row.drcc_reference || existing.drccReference,
  loanId: row.loan_id || existing.loanId,
  sanctionLetterNo: row.sanction_letter_no || existing.sanctionLetterNo,
  sanctionDate: row.sanction_date || existing.sanctionDate,
  approvedFeeAmount: Number(row.approved_fee_amount) || existing.approvedFeeAmount || 0,
  sanctionedTotalAmount: Number(row.sanctioned_total_amount) || existing.sanctionedTotalAmount || 0,
  sanctionedYearAmount: Number(row.sanctioned_year_amount) || existing.sanctionedYearAmount || 0,
  amountReceived: Number(row.amount_received) || existing.amountReceived || 0,
  disbursementTo: row.disbursement_to || row.payment_destination || existing.disbursementTo || existing.paymentDestination || "College Account",
  paymentDestination: row.payment_destination || row.disbursement_to || existing.paymentDestination || existing.disbursementTo || "College Account",
  transferMode: row.transfer_mode || existing.transferMode || "NEFT/RTGS",
  utrNumber: row.utr_number || existing.utrNumber,
  paymentDate: row.payment_date || existing.paymentDate,
  bankName: row.bank_name || existing.bankName,
  accountNo: row.account_no || existing.accountNo,
  ifscCode: row.ifsc_code || existing.ifscCode,
  documents: row.documents || existing.documents || [],
  status: row.status || existing.status,
  appliedDate: row.applied_date || existing.appliedDate,
  verifiedDate: row.verified_date || existing.verifiedDate,
  verifiedBy: row.verified_by || existing.verifiedBy,
  feeAdjustedAmount: Number(row.fee_adjusted_amount) || existing.feeAdjustedAmount || 0,
  excessScholarshipAmount: Number(row.excess_scholarship_amount) || existing.excessScholarshipAmount || 0,
  refundableAmount: Number(row.refundable_amount) || existing.refundableAmount || 0,
  officerRemarks: row.remarks || existing.officerRemarks,
});

const buildFeeDetails = (ledgerRows, students) => {
  const activeRoll = typeof window !== "undefined" ? sessionStorage.getItem("erp_active_student_roll") : "";
  const activeStudent = activeRoll
    ? students.find((s) => [s.rollNumber, s.scholarNo, s.enrollmentNo, s.id].includes(activeRoll))
    : null;
  const roll = activeStudent?.rollNumber || activeStudent?.scholarNo || "";
  const studentLedger = roll ? ledgerRows.filter((entry) => entry.rollNumber === roll) : [];
  const totalFees = studentLedger.reduce((sum, entry) => sum + (Number(entry.dr) || 0), 0);
  const totalPaid = studentLedger
    .filter((entry) => entry.status !== "Rejected" && entry.status !== "Cancelled")
    .reduce((sum, entry) => sum + (Number(entry.cr) || 0), 0);

  return {
    totalFees,
    totalPaid,
    totalPending: Math.max(0, totalFees - totalPaid),
    academicYear: activeStudent?.session || "",
    courseName: activeStudent?.course || activeStudent?.courseCode || "",
    installments: [],
    feeBreakup: studentLedger
      .filter((entry) => Number(entry.dr) > 0)
      .map((entry) => ({
        head: entry.particulars,
        amount: Number(entry.dr) || 0,
        category: entry.transactionMode || "Academic Fee",
        sem: entry.semester || activeStudent?.semester || "",
      })),
    receipts: studentLedger
      .filter((entry) => Number(entry.cr) > 0)
      .map((entry) => ({
        receiptNo: entry.receiptNo || entry.id,
        receiptDate: entry.date,
        date: entry.date,
        totalRecAmount: Number(entry.cr) || 0,
        amount: Number(entry.cr) || 0,
        particulars: entry.particulars,
        mode: entry.transactionMode || "Fee Collection",
        isCancelled: entry.status === "Cancelled" ? "Yes" : "No",
        session: entry.session,
      })),
  };
};

const refreshAcademicCache = async () => {
  const [departments, courses, batches, subjects, attendance, leaves, marks, timetable, timetableApprovals] = await Promise.all([
    supabase.from("departments").select("*").order("created_at", { ascending: false }),
    supabase.from("courses").select("*").order("created_at", { ascending: false }),
    supabase.from("batches").select("*").order("created_at", { ascending: false }),
    supabase.from("faculty_allocations").select("*").order("created_at", { ascending: false }),
    supabase.from("attendance_shortage").select("*").order("created_at", { ascending: false }),
    supabase.from("faculty_leaves").select("*").order("created_at", { ascending: false }),
    supabase.from("internal_marks").select("*").order("created_at", { ascending: false }),
    supabase.from("timetable_entries").select("*").order("day_name", { ascending: true }),
    supabase.from("timetable_approvals").select("*").order("updated_at", { ascending: false }),
  ]);

  if (!departments.error) setCache("erp_master_departments", departments.data.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    hodName: d.hod_name,
    hodEmail: d.hod_email,
    hodPhone: d.hod_phone,
    buildingBlock: d.building_block,
    establishedYear: d.established_year,
    description: d.description,
    status: d.status,
  })));
  if (!courses.error) setCache("erp_master_courses", courses.data.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    department: c.department,
    departmentCode: c.department_code,
    degreeLevel: c.degree_level,
    durationYears: c.duration_years,
    totalSemesters: c.total_semesters,
    annualFee: Number(c.annual_fee) || 0,
    intakeCapacity: c.intake_capacity,
    affiliatedUniversity: c.affiliated_university,
    syllabusRevision: c.syllabus_revision,
    status: c.status,
  })));
  if (!batches.error) setCache("erp_master_batches", batches.data.map((b) => ({
    id: b.id,
    batchName: b.batch_name,
    course: b.course,
    courseCode: b.course_code,
    department: b.department,
    academicSession: b.academic_session,
    currentSemester: b.current_semester,
    year: b.year,
    section: b.section,
    classCoordinator: b.class_coordinator,
    classroom: b.classroom,
    capacity: b.capacity,
    enrolledCount: b.enrolled_count,
    status: b.status,
  })));
  if (!subjects.error) setCache("erp_master_subjects", subjects.data.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    shortName: s.short_name,
    courseCode: s.course_code,
    semester: s.semester,
    type: s.type,
    credits: s.credits,
    totalLectures: s.total_lectures,
    assignedFacultyName: s.assigned_faculty_name,
    department: s.department,
  })));
  if (!attendance.error) setCache("erp_attendance_shortage", attendance.data.map((a) => ({
    id: a.id,
    rollNumber: a.roll_number,
    studentName: a.student_name,
    course: a.course,
    batch: a.batch,
    semester: a.semester,
    totalLecturesHeld: Number(a.total_lectures_held) || 0,
    lecturesAttended: Number(a.lectures_attended) || 0,
    percentage: Number(a.percentage) || 0,
    status: a.status,
    parentPhone: a.parent_phone,
    warningSent: Boolean(a.warning_sent),
  })));
  if (!leaves.error) setCache("erp_faculty_leaves", leaves.data.map((leave) => ({
    id: leave.id,
    facultyName: leave.faculty_name,
    designation: leave.designation,
    leaveType: leave.leave_type,
    fromDate: leave.from_date,
    toDate: leave.to_date,
    totalDays: Number(leave.total_days) || 0,
    reason: leave.reason,
    substituteAssigned: leave.substitute_assigned,
    status: leave.status,
    appliedOn: leave.applied_on,
  })));
  if (!marks.error) setCache("erp_internal_marks_sheets", marks.data.map((sheet) => ({
    id: sheet.id,
    subjectCode: sheet.subject_code,
    subjectName: sheet.subject_name,
    facultyName: sheet.faculty_name,
    batch: sheet.batch,
    totalStudents: Number(sheet.total_students) || 0,
    evaluatedStudents: Number(sheet.evaluated_students) || 0,
    maxMarks: Number(sheet.max_marks) || 0,
    averageMarks: Number(sheet.average_marks) || 0,
    status: sheet.status,
    lockedOn: sheet.locked_on,
  })));
  if (!timetable.error) setCache("erp_timetable_entries", timetable.data.map((entry) => ({
    id: entry.id,
    department: entry.department,
    courseCode: entry.course_code,
    batch: entry.batch,
    semester: entry.semester,
    day: entry.day_name,
    startTime: entry.start_time,
    endTime: entry.end_time,
    subjectCode: entry.subject_code,
    subjectName: entry.subject_name,
    facultyName: entry.faculty_name,
    room: entry.room,
    type: entry.class_type,
    status: entry.status,
  })));
  if (!timetableApprovals.error) setCache("erp_timetable_approvals", timetableApprovals.data.map((approval) => ({
    id: approval.id,
    department: approval.department,
    batch: approval.batch,
    isApproved: Boolean(approval.is_approved),
    approvedOn: approval.approved_on,
    approvedBy: approval.approved_by,
  })));
};

const refreshStudentsCache = async () => {
  const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false });
  if (error) {
    console.warn("Supabase students refresh error:", error);
    return [];
  }
  const students = (data || []).map(normalizeStudent);
  setCache("erp_admin_verifications", students);
  return students;
};

const refreshFinancialCache = async () => {
  const [ledger, challans, scholarships, drccApplications, concessions, concessionRules, refunds, feeHeads, noDues] = await Promise.all([
    supabase.from("fee_ledger").select("*").order("created_at", { ascending: false }),
    supabase.from("bank_challans").select("*").order("created_at", { ascending: false }),
    supabase.from("scholarship_applications").select("*").order("created_at", { ascending: false }),
    supabase.from("drcc_applications").select("*").order("created_at", { ascending: false }),
    supabase.from("fee_concessions").select("*").order("created_at", { ascending: false }),
    supabase.from("fee_concession_rules").select("*").order("created_at", { ascending: false }),
    supabase.from("fee_refunds").select("*").order("created_at", { ascending: false }),
    supabase.from("fee_heads").select("*").order("created_at", { ascending: false }),
    supabase.from("student_no_dues").select("*").order("created_at", { ascending: false }),
  ]);
  const students = await refreshStudentsCache();

  if (!ledger.error) {
    const rows = ledger.data.map((l) => ({
      id: l.id,
      studentId: l.student_id,
      rollNumber: l.roll_number,
      studentName: l.student_name,
      course: l.course,
      semester: l.semester,
      batch: l.batch,
      session: l.session,
      date: l.date,
      dateSlash: l.date_slash,
      particulars: l.particulars,
      dr: Number(l.dr) || 0,
      cr: Number(l.cr) || 0,
      crAmount: Number(l.cr) || 0,
      refDr: Number(l.ref_dr) || 0,
      refCr: Number(l.ref_cr) || 0,
      remarks: l.remarks,
      transactionMode: l.transaction_mode,
      mode: l.transaction_mode,
      receiptNo: l.receipt_no,
      voucherNo: l.receipt_no || l.id,
      priorityOrder: Number(l.priority_order) || 9999,
      feePriority: Number(l.priority_order) || 9999,
      status: l.status,
    }));
    setCache("erp_student_ledger_entries", rows);
    if (typeof window !== "undefined") {
      const liveFeeDetails = buildFeeDetails(rows, students);
      Object.assign(feeDetails, liveFeeDetails);
      localStorage.setItem("erp_fee_details", JSON.stringify(liveFeeDetails));
    }
  }
  if (!challans.error) setCache("erp_bank_challans", challans.data.map((c) => ({
    id: c.id,
    rollNumber: c.roll_number,
    studentName: c.student_name,
    course: c.course,
    semester: c.semester,
    challanNumber: c.challan_number,
    journalNo: c.journal_number,
    paymentDate: c.deposit_date,
    depositDate: c.deposit_date,
    submittedDate: c.created_at ? new Date(c.created_at).toLocaleDateString("en-GB") : c.deposit_date,
    bankName: c.bank_name || "State Bank of India",
    branch: c.branch_name,
    branchCode: c.branch_code,
    amount: Number(c.amount) || 0,
    feeHeads: c.fee_heads || [],
    slipFile: c.slip_document,
    status: c.status,
    decisionRemarks: c.remarks,
    verifiedBy: c.verified_by,
    verifiedDate: c.verified_date,
  })));
  if (!scholarships.error) {
    const existingScholarships = getCacheList("erp_scholarship_applications");
    setCache("erp_scholarship_applications", scholarships.data.map((s) => {
      const existing = existingScholarships.find((item) => String(item.id) === String(s.id)) || {};
      return {
        ...existing,
        id: s.id,
        rollNumber: s.roll_number || existing.rollNumber,
        scholarNo: s.scholar_no || existing.scholarNo || s.roll_number || existing.rollNumber,
        studentName: s.student_name || existing.studentName,
        enrollmentNo: s.enrollment_no || existing.enrollmentNo,
        course: s.course || existing.course,
        department: s.department || existing.department,
        semester: s.semester || existing.semester,
        session: s.session || existing.session,
        section: s.section || existing.section,
        name: s.scheme_name || existing.name,
        category: s.category || existing.category,
        familyIncome: s.family_income || existing.familyIncome,
        annualIncome: existing.annualIncome || (s.family_income ? `Rs.${Number(s.family_income).toLocaleString("en-IN")}` : ""),
        academicCgpa: s.academic_cgpa || existing.academicCgpa,
        schemeApplicationNo: s.scheme_application_no || existing.schemeApplicationNo,
        incomeCertificateNo: s.income_certificate_no || existing.incomeCertificateNo,
        incomeCertificateDate: s.income_certificate_date || existing.incomeCertificateDate,
        casteCertificateNo: s.caste_certificate_no || existing.casteCertificateNo,
        domicileCertificateNo: s.domicile_certificate_no || existing.domicileCertificateNo,
        bankName: s.bank_name || existing.bankName,
        accountNo: s.account_no || existing.accountNo,
        ifscCode: s.ifsc_code || existing.ifscCode,
        disbursementTo: s.disbursement_to || s.payment_destination || existing.disbursementTo || existing.paymentDestination || "College Account",
        paymentDestination: s.payment_destination || s.disbursement_to || existing.paymentDestination || existing.disbursementTo || "College Account",
        paymentStatus: s.payment_status || existing.paymentStatus || "",
        transferMode: s.transfer_mode || existing.transferMode || "NEFT/RTGS",
        utrNumber: s.utr_number || existing.utrNumber || "",
        paymentDate: s.payment_date || existing.paymentDate || "",
        documents: s.documents || existing.documents || [],
        studentDocuments: existing.studentDocuments || [],
        requestedAmount: Number(s.applied_amount) || existing.requestedAmount || 0,
        sanctionedAmount: Number(s.sanctioned_amount) || existing.sanctionedAmount || 0,
        feeAdjustedAmount: Number(s.fee_adjusted_amount) || existing.feeAdjustedAmount || 0,
        excessScholarshipAmount: Number(s.excess_scholarship_amount) || existing.excessScholarshipAmount || 0,
        refundableAmount: Number(s.refundable_amount) || existing.refundableAmount || 0,
        status: s.status || existing.status,
        appliedDate: s.applied_date || existing.appliedDate,
        verifiedDate: s.sanctioned_date || existing.verifiedDate,
        benefitType: s.benefit_type || existing.benefitType,
        officerRemarks: s.remarks || existing.officerRemarks,
      };
    }));
  }
  if (!drccApplications.error) {
    const existingDrcc = getCacheList("erp_drcc_applications");
    setCache("erp_drcc_applications", drccApplications.data.map((d) => {
      const existing = existingDrcc.find((item) => (
        String(item.id) === String(d.id) ||
        String(item.applicationNo || "") === String(d.application_no || "")
      )) || {};
      return normalizeDrccApplication(d, existing);
    }));
  }
  if (!concessions.error) setCache("erp_concession_requests", concessions.data.map((c) => ({
    id: c.id,
    rollNumber: c.roll_number,
    studentName: c.student_name,
    course: c.course,
    semester: c.semester,
    type: c.category,
    ruleId: c.rule_id,
    categoryTag: c.category,
    class12Board: c.class_12_board,
    class12School: c.class_12_school,
    class12PassingYear: c.class_12_passing_year,
    class12Percentage: Number(c.class_12_percentage) || 0,
    class12Marksheet: c.class_12_marksheet,
    amount: Number(c.discount_amount) || 0,
    sanctionedAmount: Number(c.discount_amount) || 0,
    status: c.status,
    date: c.applied_date,
    verifiedDate: c.approved_date,
    officerRemarks: c.remarks,
    verifiedBy: c.approved_by,
  })));
  if (!concessionRules.error && concessionRules.data.length > 0) setCache("erp_concession_rules", concessionRules.data.map((r) => ({
    id: r.id,
    name: r.name,
    minClass12Percentage: Number(r.min_class_12_percentage) || 0,
    discountPercent: Number(r.discount_percent) || 0,
    status: r.status || "Active",
    createdBy: r.created_by || "Fee Officer"
  })));
  if (!refunds.error) setCache("erp_refund_requests", refunds.data.map((r) => ({
    ticketId: r.id,
    rollNumber: r.roll_number,
    studentName: r.student_name,
    course: r.course,
    semester: r.semester,
    category: r.refund_reason,
    reason: r.refund_reason,
    amount: Number(r.approved_amount || r.claim_amount) || 0,
    status: r.status,
    date: r.applied_date,
    verifiedDate: r.approved_date,
    accountHolderName: r.account_holder_name,
    bankName: r.bank_name,
    accountNo: r.bank_account,
    ifsc: r.ifsc_code,
    utrNumber: r.utr_number,
    officerRemarks: r.remarks,
  })));
  if (!feeHeads.error) setCache("erp_levied_fee_heads", feeHeads.data.map((h) => ({
    id: h.id,
    name: h.name,
    category: h.category,
    amount: Number(h.amount) || 0,
    department: h.department,
    semester: h.semester,
    section: h.section,
    installment: h.installment,
    targetScope: h.target_scope,
    targetCount: h.target_count,
    totalBilled: Number(h.total_billed) || 0,
    status: h.status,
    isMandatory: h.is_mandatory,
    dueDate: h.due_date,
    priorityOrder: Number(h.priority_order) || 9999,
    feePriority: Number(h.priority_order) || 9999,
  })));
  if (!noDues.error) setCache("erp_student_no_dues", noDues.data.map((n) => ({
    rollNumber: n.roll_number,
    studentName: n.student_name,
    course: n.course,
    semester: n.semester,
    session: n.session,
    requestStatus: n.request_status,
    requestedDate: n.requested_date,
    accountsCleared: Boolean(n.accounts_cleared),
    facultyApproved: Boolean(n.faculty_approved),
    libraryApproved: Boolean(n.library_cleared),
    labClearance: n.lab_cleared ? "Cleared" : "Pending",
    projectClearance: n.project_approved ? "Approved" : "Pending",
    academicDepartment: n.final_status,
    clearedDate: n.issued_date,
  })));
};

export const hydrateSupabaseCaches = async () => {
  if (!isSupabaseConfigured || !supabase) return;
  await Promise.all([refreshAcademicCache(), refreshFinancialCache()]);
  dispatchDebouncedEvent("academicDataUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("studentEnrollmentUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("feeDataUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("bankChallansUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("scholarshipDataUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("drccDataUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("refundDataUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("concessionDataUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("concessionRulesUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("facultyLeavesUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("attendanceShortageUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("internalMarksUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("noDuesUpdated", { source: "supabase-hydrate" }, 0);
  dispatchDebouncedEvent("timetableUpdated", { source: "supabase-hydrate" }, 0);
};

export const initSupabaseRealtimeSync = () => {
  if (!isSupabaseConfigured || !supabase) {
    return () => {};
  }

  console.info("[Sarvadnya ERP] Initializing Master Realtime Multi-Desk Sync Channels...");
  hydrateSupabaseCaches();

  // Channel 1: Academic Master (Departments, Courses, Batches, Allocations)
  const academicChannel = supabase
    .channel("erp_academic_sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "departments" },
      (payload) => {
        console.log("Realtime: Department updated", payload);
        refreshAcademicCache().finally(() => dispatchDebouncedEvent("academicDataUpdated", payload));
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "courses" },
      (payload) => {
        console.log("Realtime: Course updated", payload);
        refreshAcademicCache().finally(() => dispatchDebouncedEvent("academicDataUpdated", payload));
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "batches" },
      (payload) => {
        console.log("Realtime: Batch updated / semester promoted", payload);
        refreshAcademicCache().finally(() => dispatchDebouncedEvent("academicDataUpdated", payload));
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "faculty_allocations" },
      (payload) => {
        console.log("Realtime: Faculty Subject Allocation updated", payload);
        refreshAcademicCache().finally(() => dispatchDebouncedEvent("academicDataUpdated", payload));
      }
    )
    .subscribe();

  // Channel 2: Admissions & Student Registry
  const studentsChannel = supabase
    .channel("erp_students_sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "students" },
      (payload) => {
        console.log("Realtime: Student enrollment / verification updated", payload);
        refreshStudentsCache().finally(() => dispatchDebouncedEvent("studentEnrollmentUpdated", payload));
      }
    )
    .subscribe();

  // Channel 3: Financials (Fee Ledger, Challans, Scholarships, Concessions, Refunds)
  const feeChannel = supabase
    .channel("erp_fee_financials_sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "fee_ledger" },
      (payload) => {
        console.log("Realtime: Fee ledger transaction updated", payload);
        refreshFinancialCache().finally(() => dispatchDebouncedEvent("feeDataUpdated", payload));
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bank_challans" },
      (payload) => {
        console.log("Realtime: Bank challan status updated", payload);
        refreshFinancialCache().finally(() => {
          dispatchDebouncedEvent("bankChallansUpdated", payload);
          dispatchDebouncedEvent("feeDataUpdated", payload);
        });
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "scholarship_applications" },
      (payload) => {
        console.log("Realtime: Scholarship status updated", payload);
        refreshFinancialCache().finally(() => {
          dispatchDebouncedEvent("scholarshipDataUpdated", payload);
          dispatchDebouncedEvent("feeDataUpdated", payload);
        });
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "drcc_applications" },
      (payload) => {
        console.log("Realtime: DRCC / BSCC status updated", payload);
        refreshFinancialCache().finally(() => {
          dispatchDebouncedEvent("drccDataUpdated", payload);
          dispatchDebouncedEvent("feeDataUpdated", payload);
        });
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "fee_concessions" },
      (payload) => {
        console.log("Realtime: Fee Concession updated", payload);
        refreshFinancialCache().finally(() => {
          dispatchDebouncedEvent("concessionDataUpdated", payload);
          dispatchDebouncedEvent("feeDataUpdated", payload);
        });
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "fee_concession_rules" },
      (payload) => {
        console.log("Realtime: Fee Concession Rule updated", payload);
        refreshFinancialCache().finally(() => dispatchDebouncedEvent("concessionRulesUpdated", payload));
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "fee_refunds" },
      (payload) => {
        console.log("Realtime: Fee Refund updated", payload);
        refreshFinancialCache().finally(() => {
          dispatchDebouncedEvent("refundDataUpdated", payload);
          dispatchDebouncedEvent("feeDataUpdated", payload);
        });
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "fee_heads" },
      (payload) => {
        console.log("Realtime: Imposed fee head updated", payload);
        refreshFinancialCache().finally(() => dispatchDebouncedEvent("feeDataUpdated", payload));
      }
    )
    .subscribe();

  // Channel 4: HOD Governance & No Dues
  const hodChannel = supabase
    .channel("erp_hod_governance_sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "faculty_leaves" },
      (payload) => {
        console.log("Realtime: Faculty Leave updated", payload);
        refreshAcademicCache().finally(() => dispatchDebouncedEvent("facultyLeavesUpdated", payload));
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "attendance_shortage" },
      (payload) => {
        console.log("Realtime: Attendance Shortage updated", payload);
        refreshAcademicCache().finally(() => dispatchDebouncedEvent("attendanceShortageUpdated", payload));
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "internal_marks" },
      (payload) => {
        console.log("Realtime: Internal Marks locked/updated", payload);
        refreshAcademicCache().finally(() => dispatchDebouncedEvent("internalMarksUpdated", payload));
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "student_no_dues" },
      (payload) => {
        console.log("Realtime: Student No-Dues Clearance updated", payload);
        refreshFinancialCache().finally(() => dispatchDebouncedEvent("noDuesUpdated", payload));
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "timetable_entries" },
      (payload) => {
        refreshAcademicCache().finally(() => dispatchDebouncedEvent("timetableUpdated", payload));
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "timetable_approvals" },
      (payload) => {
        refreshAcademicCache().finally(() => dispatchDebouncedEvent("timetableUpdated", payload));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(academicChannel);
    supabase.removeChannel(studentsChannel);
    supabase.removeChannel(feeChannel);
    supabase.removeChannel(hodChannel);
  };
};
