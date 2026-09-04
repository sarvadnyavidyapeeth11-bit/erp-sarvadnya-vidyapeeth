import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { getAcademicSessionForSemester } from "./adminData";
import { readRealtimeList, readRealtimeValue, writeRealtimeList, writeRealtimeValue } from "../lib/erpRealtimeStore";

// Cross-Tab & Cross-Component Real-Time Sync Channel
let erpSyncChannel = null;
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    erpSyncChannel = new BroadcastChannel("sarvadnya_erp_sync_bus");
    erpSyncChannel.onmessage = (event) => {
      if (event?.data?.type && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(event.data.type, { detail: event.data.detail }));
        if (event.data.type !== "feeDataUpdated") {
          emitErpSyncEvent("feeDataUpdated", event.data.detail );
        }
      }
    };
  } catch (e) {
    console.warn("BroadcastChannel initialization skipped:", e);
  }
}

export const emitErpSyncEvent = (eventName, detail = {}) => {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
    if (erpSyncChannel) {
      erpSyncChannel.postMessage({ type: eventName, detail, timestamp: Date.now() });
    }
  } catch (e) {
    console.error("Error emitting ERP sync event:", e);
  }
};


// Student Portal & Financial Operations Engine
// Fully synchronized with Supabase Cloud PostgreSQL DB and realtime cache.
// --- Dynamic Logged-in Student Profile (Pure Database / Real Student Record Driven) ---

export const generateReceiptNumber = () => {
  const ledger = getStudentDetailedLedger();
  const existingCount = ledger.filter(e => Number(e.cr ?? e.crAmount ?? e.amount) > 0).length;
  const counter = 1001 + existingCount;
  const year = new Date().getFullYear().toString().slice(-2);
  return `REC-${year}-${counter}`;
};

export const getActiveStudentProfile = () => {
  if (typeof window !== "undefined") {
    try {
      const activeRoll = sessionStorage.getItem("erp_active_student_roll");
      const parsed = readRealtimeList("erp_admin_verifications", []);
      if (parsed.length > 0) {
          const matched = activeRoll
            ? parsed.find(s => s.scholarNo === activeRoll || s.enrollmentNo === activeRoll || s.loginUsername === activeRoll || s.rollNumber === activeRoll || s.id === activeRoll)
            : null;
          if (matched) {
            const scholarVal = matched.scholarNo || matched.rollNumber || "";
            const rollVal = scholarVal;
            const enrollmentVal = matched.enrollmentNo || matched.enrollmentNumber || "";
            const admissionSession = matched.admissionSession || matched.admission_session || matched.admissionYear || matched.session || "";
            const currentAcademicSession = getAcademicSessionForSemester(admissionSession, matched.semester) || matched.session || "";
            return {
              id: matched.id,
              rollNumber: rollVal,
              universityRollNo: rollVal,
              scholarNo: scholarVal,
              enrollmentNo: enrollmentVal,
              registrationNo: matched.registrationNo || "",
              abcId: matched.abcId,
              name: matched.studentName || "",
              nameHindi: matched.studentNameHindi || "",
              aadharName: matched.aadharName || "",
              email: matched.email,
              phone: matched.phone,
              alternatePhone: "",
              dob: matched.dob,
              placeOfBirth: matched.placeOfBirth || "",
              gender: matched.gender,
              photo: matched.photoPreviews?.studentPhoto || "",
              photoPreviews: matched.photoPreviews || {},
              bloodGroup: matched.bloodGroup,
              category: matched.category,
              religion: matched.religion,
              nationality: matched.nationality || "",
              motherTongue: matched.motherTongue || "",
              maritalStatus: matched.maritalStatus || "",
              aadhar: matched.aadhar,
              samagraId: matched.samagraId || "",
              scholarshipUniqueId: matched.scholarshipUniqueId || matched.scholarshipApplicationId || "",
              drccLoanId: matched.drccLoanId || matched.studentCreditCardId || matched.loanId || "",
              studentCreditCardId: matched.studentCreditCardId || matched.drccLoanId || matched.loanId || "",
              bankName: matched.bankName || "",
              accountHolderName: matched.accountHolderName || matched.branchName || matched.studentName || "",
              accountNo: matched.accountNo || "",
              ifscCode: matched.ifscCode || matched.ifsc || "",
              pwdClass: matched.pwdClass || "",
              pwdType: matched.pwdType || "",
              domicile: matched.domicile || "",
              aadharLinkedMobile: matched.aadharLinkedMobile || "",
              antiRaggingNo: matched.antiRaggingNo || "",
              serviceNo: "",
              verificationStatus: matched.status === "Verified" ? "Approved & Verified by Admissions Desk" : "Pending Admissions Verification",
              facultyRemarks: matched.remarks || "",
              lastSubmittedOn: matched.verifiedDate || matched.appliedDate || "",
              fatherName: matched.fatherName,
              fatherNameHindi: matched.fatherNameHindi || "",
              fatherOccupation: matched.fatherOccupation || "",
              fatherPhone: matched.fatherPhone || "",
              motherName: matched.motherName,
              motherNameHindi: matched.motherNameHindi || "",
              motherOccupation: matched.motherOccupation || "",
              course: matched.courseCode || matched.course || "",
              courseClass: [matched.courseCode || matched.course, matched.semester].filter(Boolean).join(" "),
              department: matched.department || "",
              year: matched.year || "",
              semester: matched.semester || "",
              section: matched.section || "",
              batch: matched.batch || "",
              session: currentAcademicSession,
              academicSession: currentAcademicSession,
              admissionSession,
              permanentAddress: matched.permanentAddress || "",
              permanentCity: matched.permanentCity || "",
              permanentState: matched.permanentState || "",
              permanentPincode: matched.permanentPincode || "",
              correspondenceAddress: matched.correspondenceAddress || "",
              submittedDocuments: matched.documents || []
            };
          }
      }
    } catch (e) {
      console.error(e);
    }
  }
  return {
    id: "",
    rollNumber: "",
    universityRollNo: "",
    enrollmentNo: "",
    scholarNo: "",
    registrationNo: "",
    abcId: "",
    name: "",
    nameHindi: "",
    email: "",
    phone: "",
    gender: "",
    bloodGroup: "",
    category: "",
    course: "",
    department: "",
    semester: "",
    session: "",
    verificationStatus: "Pending Admissions Verification",
    fatherName: "",
    motherName: "",
    permanentAddress: "",
    scholarshipUniqueId: "",
    drccLoanId: "",
    studentCreditCardId: "",
    bankName: "",
    accountHolderName: "",
    accountNo: "",
    ifscCode: "",
    submittedDocuments: []
  };
};

// Dynamic Proxy to guarantee real-time synchronization with active student login session
export const studentProfile = new Proxy({}, {
  get(target, prop) {
    const active = getActiveStudentProfile();
    return active[prop];
  }
});

const findStudentRecordByRoll = (roll = "") => {
  if (typeof window === "undefined" || !roll) return null;
  try {
    const parsed = readRealtimeList("erp_admin_verifications", []);
    if (!Array.isArray(parsed)) return null;
    return parsed.find((student) => (
      student.scholarNo === roll ||
      student.enrollmentNo === roll ||
      student.loginUsername === roll ||
      student.rollNumber === roll ||
      student.id === roll
    )) || null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// --- Dynamic Timetable & Attendance Engine --------------------------------------
export const todayTimetable = [];

export const weekTimetable = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: []
};

export const overallAttendance = {
  percentage: 0,
  totalClasses: 0,
  present: 0,
  attended: 0,
  absent: 0,
  status: "No Attendance Marked",
  requiredTo75: 0,
};

export const notices = [];

export const studentNotifications = [];

const STUDENT_NOTIFICATIONS_KEY = "erp_student_notifications";

const normalizeNotificationRoll = (roll = "") => {
  const value = String(roll || "").trim();
  if (!value) return "";
  const record = findStudentRecordByRoll(value);
  return String(record?.scholarNo || record?.rollNumber || record?.enrollmentNo || record?.id || value);
};

const toNotificationDbRow = (notification = {}) => ({
  id: String(notification.id || `NTF-${Date.now()}`),
  roll_number: String(notification.rollNumber || notification.scholarNo || ""),
  title: notification.title || "",
  message: notification.message || "",
  type: notification.type || "notice",
  route: notification.route || "/student-dashboard",
  is_read: Boolean(notification.read),
  timestamp: notification.timestamp || new Date().toISOString()
});

const persistNotificationsToSupabase = (notifications = []) => {
  if (!isSupabaseConfigured || !supabase) return;
  const rows = notifications
    .filter((notification) => notification?.id && notification?.rollNumber && notification?.title)
    .map(toNotificationDbRow);
  if (rows.length === 0) return;
  supabase
    .from("student_notifications")
    .upsert(rows, { onConflict: "id" })
    .then(({ error }) => {
      if (error) console.warn("Supabase student notification upsert error:", error);
    });
};

const deleteNotificationsFromSupabase = (notificationIds = []) => {
  if (!isSupabaseConfigured || !supabase || notificationIds.length === 0) return;
  supabase
    .from("student_notifications")
    .delete()
    .in("id", notificationIds.map(String))
    .then(({ error }) => {
      if (error) console.warn("Supabase student notification delete error:", error);
    });
};

export const getStudentNotifications = (roll = "") => {
  if (typeof window === "undefined") return [];
  const targetRoll = normalizeNotificationRoll(roll || studentProfile.scholarNo || studentProfile.rollNumber || studentProfile.enrollmentNo || "");
  try {
    const parsed = readRealtimeList(STUDENT_NOTIFICATIONS_KEY, []);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((notification) => !targetRoll || String(notification.rollNumber || "") === targetRoll)
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const saveStudentNotifications = (notifications = []) => {
  if (typeof window === "undefined") return [];
  const next = Array.isArray(notifications) ? notifications : [];
  writeRealtimeList(STUDENT_NOTIFICATIONS_KEY, next);
  persistNotificationsToSupabase(next);
  window.dispatchEvent(new CustomEvent("studentNotificationsUpdated", { detail: { notifications: next } }));
  return next;
};

export const saveCurrentStudentNotifications = (notifications = [], roll = "") => {
  if (typeof window === "undefined") return [];
  const targetRoll = normalizeNotificationRoll(roll || studentProfile.scholarNo || studentProfile.rollNumber || studentProfile.enrollmentNo || "");
  if (!targetRoll) return [];
  let all = [];
  all = readRealtimeList(STUDENT_NOTIFICATIONS_KEY, []);
  const scoped = (Array.isArray(notifications) ? notifications : []).map((notification) => ({
    ...notification,
    rollNumber: targetRoll
  }));
  const scopedIds = new Set(scoped.map((notification) => String(notification.id)));
  const removedIds = all
    .filter((notification) => String(notification.rollNumber || "") === targetRoll && !scopedIds.has(String(notification.id)))
    .map((notification) => notification.id)
    .filter(Boolean);
  deleteNotificationsFromSupabase(removedIds);
  return saveStudentNotifications([
    ...scoped,
    ...all.filter((notification) => String(notification.rollNumber || "") !== targetRoll)
  ]);
};

export const updateStudentNotification = (notificationId, updater) => {
  if (typeof window === "undefined") return [];
  let all = [];
  all = readRealtimeList(STUDENT_NOTIFICATIONS_KEY, []);
  const updated = all.map((notification) => (
    notification.id === notificationId
      ? (typeof updater === "function" ? updater(notification) : { ...notification, ...updater })
      : notification
  ));
  return saveStudentNotifications(updated);
};

export const addStudentNotification = ({
  rollNumber = "",
  title = "",
  message = "",
  type = "notice",
  route = "/student-dashboard",
  id = ""
} = {}) => {
  if (typeof window === "undefined") return null;
  const targetRoll = normalizeNotificationRoll(rollNumber || studentProfile.scholarNo || studentProfile.rollNumber || studentProfile.enrollmentNo || "");
  if (!targetRoll || !title) return null;
  let all = [];
  all = readRealtimeList(STUDENT_NOTIFICATIONS_KEY, []);
  const notification = {
    id: id || `NTF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    rollNumber: targetRoll,
    title,
    message,
    type,
    route,
    timestamp: new Date().toISOString(),
    read: false
  };
  const updated = [notification, ...all.filter((item) => item.id !== notification.id)].slice(0, 200);
  saveStudentNotifications(updated);
  return notification;
};

export const holidays = {};

export const quickLinks = [
  { label: "Exam Result", title: "Exam Result", icon: "Award", path: "/student-dashboard/examination/results" },
  { label: "Fee Receipts", title: "Fee Receipts", icon: "CreditCard", path: "/student-dashboard/fees/receipts" },
  { label: "Attendance", title: "Attendance", icon: "BarChart3", path: "/student-dashboard/attendance" },
  { label: "Pay Fee Online", title: "Pay Fee Online", icon: "CreditCard", path: "/student-dashboard/fees/onlinePay" },
  { label: "Time Table", title: "Time Table", icon: "Calendar", path: "/student-dashboard/timetable" },
  { label: "Notices", title: "Notices", icon: "Bell", path: "/student-dashboard/communication/notices" }
];

export const attendanceData = [];

export const feeReceipts = [];

export const feeDetails = {
  totalFees: 0,
  totalPaid: 0,
  totalPending: 0,
  academicYear: "",
  courseName: "",
  installments: [],
  feeBreakup: [],
  receipts: []
};

// Auto-load current live fee cache
if (typeof window !== "undefined") {
  const stored = readRealtimeValue("erp_fee_details", null);
  if (stored) Object.assign(feeDetails, stored);
}

export const getFeeDetails = () => {
  return getFeeDetailsForStudent();
};

const getLedgerIdentifiers = (roll = "") => {
  const active = getActiveStudentProfile();
  const requested = roll || active.rollNumber || active.scholarNo || "";
  const activeIdentifiers = [
    active.rollNumber,
    active.scholarNo,
    active.enrollmentNo,
    active.id
  ].filter(Boolean);
  let requestedIdentifiers = [requested];
  if (roll && typeof window !== "undefined") {
    try {
      const students = readRealtimeList("erp_admin_verifications", []);
      const matchedStudent = students.find((student) => [
        student.rollNumber,
        student.scholarNo,
        student.enrollmentNo,
        student.id
      ].some((identifier) => String(identifier || "") === String(requested)));
      if (matchedStudent) {
        requestedIdentifiers = [
          matchedStudent.rollNumber,
          matchedStudent.scholarNo,
          matchedStudent.enrollmentNo,
          matchedStudent.id
        ].filter(Boolean);
      }
    } catch (error) {
      console.error("Unable to resolve student ledger identifiers:", error);
    }
  }
  return {
    requested,
    active,
    values: new Set(roll ? requestedIdentifiers : activeIdentifiers)
  };
};

const isFinancialEntryActive = (entry) => !["Rejected", "Cancelled", "Reversed"].includes(entry.status);

const parseFeeDueDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const text = String(value).trim();
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]), 23, 59, 59, 999);
  }
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(23, 59, 59, 999);
  return parsed;
};

export const isFeeDueDateExceeded = (dueDate, now = new Date()) => {
  const parsed = parseFeeDueDate(dueDate);
  if (!parsed) return false;
  return parsed.getTime() < now.getTime();
};

const DEFAULT_FEE_PRIORITY = 9999;
const normalizeFeePriority = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : DEFAULT_FEE_PRIORITY;
};

export const getFeeDetailsForStudent = (roll = "") => {
  const { requested, active, values } = getLedgerIdentifiers(roll);
  const ledger = getStudentDetailedLedger()
    .filter((entry) => values.has(entry.rollNumber) || values.has(entry.studentId))
    .map((entry) => ({
      ...entry,
      session: getLedgerEntrySession(entry)
    }));
  const studentRecord = findStudentRecordByRoll(requested) || active;
  const baseSession =
    studentRecord.admissionSession ||
    studentRecord.admission_session ||
    studentRecord.admissionYear ||
    active.admissionSession ||
    studentRecord.session ||
    studentRecord.academicSession ||
    active.session ||
    active.academicSession ||
    "";
  const activeSession =
    getAcademicSessionForSemester(baseSession, studentRecord.semester || active.semester) ||
    studentRecord.session ||
    studentRecord.academicSession ||
    active.session ||
    active.academicSession ||
    "";
  const normalizeSession = (value) => String(value || "").trim();
  const sessionLedger = activeSession
    ? ledger.filter((entry) => normalizeSession(entry.session) === normalizeSession(activeSession))
    : [];
  const oldSessionLedger = activeSession
    ? ledger.filter((entry) => normalizeSession(entry.session) && normalizeSession(entry.session) !== normalizeSession(activeSession))
    : [];
  const effectiveLedger = sessionLedger;
  const totalFees = effectiveLedger
    .filter(isFinancialEntryActive)
    .reduce((sum, entry) => sum + (Number(entry.dr ?? entry.drAmount) || 0), 0);
  const totalPaid = effectiveLedger
    .filter(isFinancialEntryActive)
    .reduce((sum, entry) => sum + (Number(entry.cr ?? entry.crAmount ?? entry.amount) || 0), 0);
  const previousSessionDues = Math.max(0, oldSessionLedger
    .filter(isFinancialEntryActive)
    .reduce((sum, entry) => sum + (Number(entry.dr ?? entry.drAmount) || 0) - (Number(entry.cr ?? entry.crAmount ?? entry.amount) || 0), 0));
  const details = {
    totalFees,
    totalPaid,
    totalPending: Math.max(0, totalFees - totalPaid),
    previousSessionDues,
    academicYear: activeSession,
    courseName: active.course || "",
    installments: [],
    feeBreakup: effectiveLedger
      .filter((entry) => isFinancialEntryActive(entry) && Number(entry.dr ?? entry.drAmount) > 0)
      .map((entry) => ({
        id: entry.id,
        feeHeadId: entry.feeHeadId || "",
        head: entry.particulars || entry.remarks || "Fee Head",
        category: entry.transactionMode || entry.mode || "Academic Fee",
        amount: Number(entry.dr ?? entry.drAmount) || 0,
        sem: entry.semester || "All",
        session: entry.session || activeSession,
        installment: entry.installment || "",
        date: entry.dueDate || entry.date || "",
        dueDate: entry.dueDate || "",
        priorityOrder: normalizeFeePriority(entry.priorityOrder ?? entry.feePriority ?? entry.priority_order ?? entry.priority),
        feePriority: normalizeFeePriority(entry.priorityOrder ?? entry.feePriority ?? entry.priority_order ?? entry.priority),
        status: isFeeDueDateExceeded(entry.dueDate) ? "Overdue" : (entry.status || "Due"),
        isOverdue: isFeeDueDateExceeded(entry.dueDate)
      })),
    receipts: effectiveLedger
      .filter((entry) => isFinancialEntryActive(entry) && Number(entry.cr ?? entry.crAmount ?? entry.amount) > 0)
      .map((entry) => ({
        receiptNo: entry.receiptNo || entry.voucherNo || entry.id,
        receiptDate: entry.date,
        date: entry.date,
        totalRecAmount: Number(entry.cr ?? entry.crAmount ?? entry.amount) || 0,
        amount: Number(entry.cr ?? entry.crAmount ?? entry.amount) || 0,
        particulars: entry.particulars || entry.remarks || "Fee Payment",
        mode: entry.transactionMode || entry.mode || "Fee Collection",
        isCancelled: entry.status === "Cancelled" ? "Yes" : "No",
        session: entry.session || active.session || ""
      }))
  };

  const isActiveStudent = !roll || requested === active.rollNumber || requested === active.scholarNo;
  if (isActiveStudent) {
    Object.assign(feeDetails, details);
    if (typeof window !== "undefined") {
      writeRealtimeValue("erp_fee_details", details);
    }
  }
  return details;
};

export const syncFeeDetails = (updates, roll = "") => {
  const current = getFeeDetailsForStudent(roll);
  const next = {
    ...current,
    installments: updates?.installments || current.installments,
    receipts: current.receipts
  };
  Object.assign(feeDetails, next);
  if (typeof window !== "undefined") {
    try {
      writeRealtimeValue("erp_fee_details", next);
    } catch (e) {
      console.error("Error saving feeDetails:", e);
    }
    window.dispatchEvent(new CustomEvent("feeDataUpdated", { detail: { feeDetails: next, roll } }));
  }
  return next;
};

// Unified Imposed Fee Heads getter shared across Student Portal and Officer Cash Desk
export const getImposedFeeHeads = (department = "All Departments", semester = "All Semesters") => {
  let stored = [];
  if (typeof window !== "undefined") {
    try {
      stored = readRealtimeList("erp_levied_fee_heads", []);
      if (stored.length === 0) stored = readRealtimeList("fee_heads_directory", []);
    } catch (e) {
      console.error("Error reading erp_levied_fee_heads:", e);
    }
  }

  if (!Array.isArray(stored)) return [];

  return stored.filter(h => {
    if (h.status === "Paused") return false;
    const matchDept =
      !department ||
      department === "All Departments" ||
      h.department === "All Departments" ||
      h.department?.toLowerCase().includes(department.toLowerCase()) ||
      department.toLowerCase().includes(h.department?.toLowerCase() || "");

    const matchSem =
      !semester ||
      semester === "All Semesters" ||
      h.semester === "All Semesters" ||
      h.semester === semester;

    return matchDept && matchSem;
  });
};

// -- Official Detailed Student Financial Ledger Records --
export const getStudentDetailedLedger = () => {
  const defaultEntries = [];

  if (typeof window !== "undefined") {
    try {
      return readRealtimeList("erp_student_ledger_entries", defaultEntries);
    } catch (e) {
      console.error(e);
    }
  }
  return defaultEntries;
};

const findAidApplicationForLedgerEntry = (entry = {}) => {
  const entryId = String(entry.id || entry.receiptNo || "").replace(/^LEDGER-/, "").replace(/^SCH-/, "").replace(/^DRCC-/, "");
  return [...getScholarshipApplications(), ...getDrccApplications()].find((app) => (
    String(app.id || "") === entryId ||
    String(entry.id || "") === `LEDGER-${app.id}` ||
    String(entry.receiptNo || "") === `SCH-${app.id}` ||
    String(entry.receiptNo || "") === `DRCC-${app.id}`
  )) || null;
};

const getLedgerEntrySession = (entry = {}) => {
  if (entry.session) return entry.session;
  const aidApp = findAidApplicationForLedgerEntry(entry);
  if (aidApp?.session || aidApp?.academicYear) return aidApp.session || aidApp.academicYear;
  const student = findStudentRecordByRoll(entry.rollNumber || entry.studentId || "");
  return student?.admissionSession || student?.session || student?.academicSession || "";
};

export const getStudentLedgerEntries = (roll = "") => {
  const { values } = getLedgerIdentifiers(roll);
  const baseEntries = getStudentDetailedLedger()
    .filter((entry) => values.has(entry.rollNumber) || values.has(entry.studentId))
    .map((entry) => ({
      ...entry,
      session: getLedgerEntrySession(entry)
    }));
  let scholarshipExcessRows = [];

  try {
    scholarshipExcessRows = [...getScholarshipApplications(), ...getDrccApplications()]
      .filter((app) => (
        ["Approved", "Adjusted", "Completed", "Payment Received"].some((word) => String(app.status || "").includes(word)) &&
        isCollegeAccountAid(app) &&
        (values.has(app.rollNumber) || values.has(app.scholarNo) || values.has(app.enrollmentNo) || values.has(app.studentId)) &&
        (Number(app.excessScholarshipAmount ?? app.refundableAmount) || 0) > 0
      ))
      .filter((app) => !baseEntries.some((entry) => String(entry.id) === `LEDGER-EXCESS-${app.id}` || String(entry.id) === `LEDGER-${app.id}` && Number(entry.refCr) > 0))
      .map((app) => ({
        id: `LEDGER-EXCESS-${app.id}`,
        rollNumber: app.rollNumber || app.scholarNo,
        studentName: app.studentName,
        course: app.course,
        session: app.session || app.academicYear || "",
        date: app.verifiedDate || app.appliedDate || "",
        dr: 0,
        cr: 0,
        refDr: 0,
        refCr: Number(app.excessScholarshipAmount ?? app.refundableAmount) || 0,
        receiptNo: `SCH-EXCESS-${app.id}`,
        transactionMode: "Scholarship Excess",
        particulars: `${app.name} excess refundable`,
        remarks: `${app.name} sanctioned Rs.${(Number(app.sanctionedAmount) || 0).toLocaleString("en-IN")}; fee adjusted Rs.${(Number(app.feeAdjustedAmount) || 0).toLocaleString("en-IN")}; excess refundable Rs.${(Number(app.excessScholarshipAmount ?? app.refundableAmount) || 0).toLocaleString("en-IN")}`,
        status: "Refundable"
      }));
  } catch (e) {
    scholarshipExcessRows = [];
  }

  return [...baseEntries, ...scholarshipExcessRows];
};

export const addStudentLedgerEntry = (newEntry) => {
  const current = getStudentDetailedLedger();
  const rollNumber = newEntry.rollNumber || studentProfile.rollNumber || studentProfile.scholarNo || "";
  if (!rollNumber) return current;
  const matchedStudent = findStudentRecordByRoll(rollNumber);
  const nextId = current.reduce((max, entry) => {
    const numericId = Number(entry.id);
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
  }, 0) + 1;
  const entryWithId = {
    id: newEntry.id || nextId,
    session: newEntry.session || matchedStudent?.session || studentProfile.session || "",
    refDr: null,
    refCr: null,
    ...newEntry,
    rollNumber,
    studentName: newEntry.studentName || studentProfile.name || "",
    particulars: newEntry.particulars || newEntry.remarks || "Fee Ledger Entry",
    transactionMode: newEntry.transactionMode || newEntry.mode || "Portal",
    crAmount: Number(newEntry.cr ?? newEntry.crAmount ?? newEntry.amount) || 0,
    drAmount: Number(newEntry.dr ?? newEntry.drAmount) || 0
  };

  // Prevent duplicate additions
  const isDuplicate = current.some(
    (item) =>
      String(item.id) === String(entryWithId.id) || (
        item.rollNumber === entryWithId.rollNumber &&
        item.date === entryWithId.date &&
        String(item.feeHeadId || "") === String(entryWithId.feeHeadId || "") &&
        String(item.installment || "") === String(entryWithId.installment || "") &&
        String(item.dueDate || "") === String(entryWithId.dueDate || "") &&
        Number(item.dr ?? item.drAmount) === Number(entryWithId.dr ?? entryWithId.drAmount) &&
        Number(item.cr ?? item.crAmount ?? item.amount) === Number(entryWithId.cr ?? entryWithId.crAmount ?? entryWithId.amount) &&
        (item.particulars || item.remarks) === (entryWithId.particulars || entryWithId.remarks)
      )
  );

  if (isDuplicate) return current;

  const updated = [...current, entryWithId];
  if (typeof window !== "undefined") {
    try {
      writeRealtimeList("erp_student_ledger_entries", updated);
    } catch (e) {
      console.error(e);
    }
    const creditAmount = Number(entryWithId.cr ?? entryWithId.crAmount ?? entryWithId.amount) || 0;
    const debitAmount = Number(entryWithId.dr ?? entryWithId.drAmount) || 0;
    const refundableAmount = Number(entryWithId.refCr) || 0;
    if (creditAmount > 0 || debitAmount > 0 || refundableAmount > 0) {
      addStudentNotification({
        rollNumber,
        title: creditAmount > 0 ? "Fee payment updated" : refundableAmount > 0 ? "Refundable credit updated" : "Fee due updated",
        message: creditAmount > 0
          ? `Rs.${creditAmount.toLocaleString("en-IN")} fee ledger me credited hua. Receipt: ${entryWithId.receiptNo || "N/A"}.`
          : refundableAmount > 0
          ? `Rs.${refundableAmount.toLocaleString("en-IN")} refundable credit ledger me add hua.`
          : `Rs.${debitAmount.toLocaleString("en-IN")} fee due ledger me added hua.`,
        type: "fees",
        route: "/student-dashboard/fees/ledger"
      });
    }
  }
  if (typeof window !== "undefined") {
    const activeDetails = getFeeDetailsForStudent();
    window.dispatchEvent(new CustomEvent("feeDataUpdated", { detail: { entry: entryWithId, feeDetails: activeDetails } }));
  }
  if (isSupabaseConfigured && supabase) {
    const ledgerPayload = {
      id: String(entryWithId.id || newEntry.id || newEntry.receiptNo || `TXN-${Date.now()}`),
      student_id: newEntry.studentId || null,
      roll_number: entryWithId.rollNumber,
      student_name: newEntry.studentName || studentProfile.name || "",
      course: newEntry.course || studentProfile.course || "",
      semester: newEntry.semester || studentProfile.semester || "",
      batch: newEntry.batch || studentProfile.batch || "",
      session: entryWithId.session,
      date: entryWithId.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      date_slash: entryWithId.dateSlash || "",
      particulars: entryWithId.particulars || entryWithId.remarks || "Fee Ledger Entry",
      dr: Number(entryWithId.dr || entryWithId.drAmount || 0),
      cr: Number(entryWithId.cr || entryWithId.crAmount || entryWithId.amount || 0),
      ref_dr: Number(entryWithId.refDr || 0),
      ref_cr: Number(entryWithId.refCr || 0),
      remarks: entryWithId.remarks || "",
      transaction_mode: entryWithId.mode || entryWithId.transactionMode || "Portal",
      receipt_no: entryWithId.receiptNo || entryWithId.voucherNo || null,
      priority_order: normalizeFeePriority(entryWithId.priorityOrder ?? entryWithId.feePriority ?? entryWithId.priority_order ?? entryWithId.priority),
      status: entryWithId.status || "Cleared"
    };
    supabase.from("fee_ledger").upsert(ledgerPayload).then(({ error }) => {
      if (!error) return;
      if (String(error.message || "").includes("priority_order")) {
        const { priority_order: _priorityOrder, ...fallbackPayload } = ledgerPayload;
        supabase.from("fee_ledger").upsert(fallbackPayload).then(({ error: fallbackError }) => {
          if (fallbackError) console.warn("Supabase addStudentLedgerEntry error:", fallbackError);
        });
        return;
      }
      console.warn("Supabase addStudentLedgerEntry error:", error);
    });
  }
  return updated;
};

export const removeStudentLedgerEntriesByFeeHead = (feeHeadId, feeHeadName = "") => {
  if (typeof window === "undefined") return [];
  const current = getStudentDetailedLedger();
  const updated = current.filter((entry) => {
    if (entry.feeHeadId && String(entry.feeHeadId) === String(feeHeadId)) return false;
    if (String(entry.id || "").startsWith(`${feeHeadId}-`)) return false;
    if (
      feeHeadName &&
      String(entry.particulars || "").trim().toLowerCase() === String(feeHeadName).trim().toLowerCase() &&
      (Number(entry.dr) > 0 || Number(entry.drAmount) > 0)
    ) {
      return false;
    }
    return true;
  });

  try {
    writeRealtimeList("erp_student_ledger_entries", updated);
  } catch (e) {
    console.error("Error updating erp_student_ledger_entries on delete:", e);
  }

  // Also remove from erp_levied_fee_heads if present
  try {
    const heads = readRealtimeList("erp_levied_fee_heads", []);
    if (heads.length > 0) {
      const filteredHeads = heads.filter(h => h.id !== feeHeadId && h.name !== feeHeadName);
      writeRealtimeList("erp_levied_fee_heads", filteredHeads);
    }
  } catch (e) {}

  if (isSupabaseConfigured && supabase) {
    if (feeHeadId) {
      supabase.from("fee_heads").delete().eq("id", feeHeadId).then(({ error }) => {
        if (error) console.warn("Supabase fee head delete error:", error);
      });
    }
    if (feeHeadName) {
      supabase.from("fee_ledger").delete().eq("particulars", feeHeadName).eq("cr", 0).then(({ error }) => {
        if (error) console.warn("Supabase fee_ledger debits delete error:", error);
      });
    }
  }

  window.dispatchEvent(new CustomEvent("feeDataUpdated", { detail: { feeHeadId, feeHeadName, action: "delete" } }));
  return updated;
};

// -- Multi-Department No Dues & Faculty Clearance Engine --
const getNoDuesKey = (roll = "", semester = "", session = "") => [
  roll || studentProfile.rollNumber || studentProfile.scholarNo || "",
  semester || studentProfile.semester || "All",
  session || studentProfile.session || studentProfile.academicSession || "All"
].map((part) => String(part || "All").trim()).join("__");

export const getStudentNoDues = (roll = "", semester = "", session = "") => {
  let stored = {};
  const targetRoll = roll || studentProfile.rollNumber || studentProfile.scholarNo || "";
  const targetSemester = semester || studentProfile.semester || "";
  const targetSession = session || studentProfile.session || studentProfile.academicSession || "";
  const targetKey = getNoDuesKey(targetRoll, targetSemester, targetSession);
  if (typeof window !== "undefined") {
    try {
      stored = readRealtimeValue("erp_no_dues_status", {});
    } catch (e) {
      console.error(e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const liveRows = readRealtimeList("erp_student_no_dues", []);
      const live = liveRows.find((row) => (
        String(row.rollNumber || "") === String(targetRoll || "") &&
        String(row.semester || "") === String(targetSemester || "") &&
        String(row.session || "") === String(targetSession || "")
      )) || liveRows.find((row) => row.rollNumber === targetRoll && !semester && !session);
      if (live) stored[targetKey] = live;
    } catch (e) {
      console.error(e);
    }
  }

  const studentClearance = stored[targetKey] || stored[targetRoll] || {
    id: `NOC-${targetRoll || "PENDING"}-${targetSemester || "SEM"}-${targetSession || "SESSION"}`,
    rollNumber: targetRoll,
    studentName: studentProfile.name || "",
    course: studentProfile.course || "",
    semester: targetSemester,
    session: targetSession,
    requestStatus: "Not Requested",
    requestedDate: null,
    attendancePercent: 0,
    assignmentSubmitted: 0,
    assignmentTotal: 0,
    academicRemarks: "Awaiting faculty attendance & assignment verification.",
    facultyApproved: false,
    facultyApprovalDate: null,
    facultyApprovedBy: null,
    libraryApproved: false,
    hostelApproved: false,
    transportApproved: false,
    sportsApproved: false,
    computerLabApproved: false,
    certificateGenerated: false
  };

  // Dynamic Real-Time Fee Clearance:
  const studentFees = getFeeDetailsForStudent(roll);
  const hasFeeImposed = (Number(studentFees.totalFees) || 0) > 0;
  const isFeeFullyPaid = hasFeeImposed && (studentFees.totalPending || 0) === 0;
  studentClearance.feeImposed = hasFeeImposed;
  studentClearance.feeCleared = Boolean(studentClearance.accountsCleared || studentClearance.manualAccountsOverride || isFeeFullyPaid);
  studentClearance.feeAmountDue = studentFees.totalPending || 0;
  studentClearance.feeAmountPaid = studentFees.totalPaid || 0;

  return studentClearance;
};

export const updateStudentAcademicNoDues = (roll, updates) => {
  let stored = {};
  if (typeof window !== "undefined") {
    try {
      stored = readRealtimeValue("erp_no_dues_status", {});
    } catch (e) {
      console.error(e);
    }
  }

  const semester = updates?.semester || studentProfile.semester || "";
  const session = updates?.session || studentProfile.session || studentProfile.academicSession || "";
  const key = getNoDuesKey(roll, semester, session);
  const existing = getStudentNoDues(roll, semester, session);
  const updated = { ...existing, ...updates };
  stored[key] = updated;

  if (typeof window !== "undefined") {
    try {
      writeRealtimeValue("erp_no_dues_status", stored);
      const liveRows = readRealtimeList("erp_student_no_dues", []);
      const nextRows = [updated, ...liveRows.filter((row) => getNoDuesKey(row.rollNumber, row.semester, row.session) !== key)];
      writeRealtimeList("erp_student_no_dues", nextRows);
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new CustomEvent("noDuesUpdated", { detail: { roll, updated } }));
    window.dispatchEvent(new CustomEvent("feeDataUpdated", { detail: { updated } }));
    addStudentNotification({
      rollNumber: roll,
      title: "No-Dues status updated",
      message: updated.feeCleared ? "Fee no-dues clear ho gaya." : "No-dues status update hua. Pending dues/checklist review karein.",
      type: "notice",
      route: "/student-dashboard/fees/no-dues"
    });
  }

  if (isSupabaseConfigured && supabase) {
    supabase.from("student_no_dues").upsert({
      roll_number: updated.rollNumber || roll,
      student_name: updated.studentName || studentProfile.name || "",
      course: updated.course || studentProfile.course || "",
      semester: updated.semester || semester || "",
      session: updated.session || session || "",
      request_status: updated.requestStatus || "Pending",
      requested_date: updated.requestedDate || null,
      accounts_cleared: Boolean(updated.accountsCleared),
      faculty_approved: Boolean(updated.facultyApproved),
      library_cleared: Boolean(updated.libraryApproved),
      lab_cleared: updated.labClearance === "Cleared",
      project_approved: updated.projectClearance === "Approved",
      final_status: updated.academicDepartment || "Pending",
      issued_date: updated.clearedDate || null,
    }, { onConflict: "roll_number,semester,session" }).then(({ error }) => {
      if (error) console.warn("Supabase no-dues update error:", error);
    });
  }

  return updated;
};

export const submitStudentNoDuesRequest = ({ semester = "", session = "", purpose = "Semester NOC" } = {}) => {
  const roll = studentProfile.rollNumber || studentProfile.scholarNo || "";
  if (!roll || !semester || !session) return null;
  const existing = getStudentNoDues(roll, semester, session);
  const studentFees = getFeeDetailsForStudent(roll);
  const requested = updateStudentAcademicNoDues(roll, {
    ...existing,
    id: existing.id || `NOC-${roll}-${semester}-${session}`,
    rollNumber: roll,
    studentName: studentProfile.name || "",
    course: studentProfile.course || "",
    semester,
    session,
    purpose,
    requestStatus: "Pending",
    requestedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    accountsCleared: (Number(studentFees.totalFees) || 0) > 0 && (Number(studentFees.totalPending) || 0) === 0,
    feeAmountDue: studentFees.totalPending || 0,
    feeAmountPaid: studentFees.totalPaid || 0,
    certificateGenerated: false
  });
  addStudentNotification({
    rollNumber: roll,
    title: "No-Dues request submitted",
    message: `${semester} ${session} ke liye NOC request submit ho gaya. Fee Officer/HOD approval ke baad certificate milega.`,
    type: "notice",
    route: "/student-dashboard/fees/no-dues"
  });
  return requested;
};

// -- Shared Bank Challans Verification Store & Sync --
const defaultChallans = [];

export const getBankChallans = () => {
  return readRealtimeList("erp_bank_challans", defaultChallans);
};

export const submitStudentBankChallan = (challanData) => {
  const all = getBankChallans();
  const rollNumber = challanData.rollNumber || studentProfile.rollNumber || studentProfile.scholarNo || "";
  const amount = Number(challanData.amount) || 0;
  const pendingAmount = getFeeDetailsForStudent(rollNumber).totalPending;
  if (!rollNumber || amount <= 0 || amount > pendingAmount || !challanData.journalNo || !challanData.bankName || !challanData.branch || !challanData.paymentDate || !challanData.slipFile) return null;
  const matchedStudent = findStudentRecordByRoll(rollNumber);
  const newChallan = {
    id: challanData.id || `CHL-${Date.now()}`,
    studentName: challanData.studentName || studentProfile.name || "",
    rollNumber,
    course: challanData.course || studentProfile.course || "",
    amount,
    bankName: challanData.bankName || "",
    branch: challanData.branch || "",
    journalNo: challanData.journalNo || "",
    session: challanData.session || matchedStudent?.session || studentProfile.session || "",
    paymentDate: challanData.paymentDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    submittedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    particulars: challanData.particulars || "",
    status: "Pending Verification",
    mode: challanData.mode || "Bank Cash Challan",
    slipFile: challanData.slipFile || "",
    decisionRemarks: "Awaiting cashier verification against bank scroll",
    verifiedBy: null,
    verifiedDate: null
  };

  const updated = [newChallan, ...all.filter(c => c.id !== newChallan.id)];
  if (typeof window !== "undefined") {
    try {
      writeRealtimeList("erp_bank_challans", updated);
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new CustomEvent("bankChallansUpdated", { detail: { newChallan, all: updated } }));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("bank_challans").upsert({
      id: newChallan.id,
      roll_number: newChallan.rollNumber,
      student_name: newChallan.studentName,
      course: newChallan.course,
      semester: studentProfile.semester || "",
      challan_number: newChallan.id,
      journal_number: newChallan.journalNo,
      deposit_date: newChallan.paymentDate,
      bank_name: newChallan.bankName,
      branch_name: newChallan.branch,
      amount: newChallan.amount,
      fee_heads: [],
      slip_document: newChallan.slipFile,
      status: newChallan.status,
      remarks: newChallan.decisionRemarks,
      verified_by: newChallan.verifiedBy,
      verified_date: newChallan.verifiedDate
    }).then(({ error }) => {
      if (error) console.warn("Supabase submitStudentBankChallan error:", error);
    });
  }
  return newChallan;
};

export const processChallanVerification = (challanId, actionStatus, remarks, officerName = "Accounts Officer") => {
  const all = getBankChallans();
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  
  let targetChallan = null;
  const updated = all.map(c => {
    if (c.id === challanId) {
      targetChallan = {
        ...c,
        status: actionStatus,
        decisionRemarks: remarks || (actionStatus === "Approved" ? "Bank scroll verified & fee ledger credited" : "Bank record mismatch"),
        verifiedBy: officerName,
        verifiedDate: dateStr
      };
      return targetChallan;
    }
    return c;
  });

  if (typeof window !== "undefined") {
    try {
      writeRealtimeList("erp_bank_challans", updated);
    } catch (e) {
      console.error(e);
    }
  }
  if (isSupabaseConfigured && supabase && targetChallan) {
    supabase.from("bank_challans").update({
      status: targetChallan.status,
      remarks: targetChallan.decisionRemarks,
      verified_by: targetChallan.verifiedBy,
      verified_date: targetChallan.verifiedDate
    }).eq("id", challanId).then(({ error }) => {
      if (error) console.warn("Supabase processChallanVerification error:", error);
    });
  }

  // If approved for student, credit the fee passbook!
  if (actionStatus === "Approved" && targetChallan) {
    const receiptNo = `REC-${targetChallan.id.replace("CHL-", "BNK-")}`;
    addStudentLedgerEntry({
      id: `LEDGER-${targetChallan.id}`,
      rollNumber: targetChallan.rollNumber,
      studentName: targetChallan.studentName,
      course: targetChallan.course,
      session: targetChallan.session || findStudentRecordByRoll(targetChallan.rollNumber)?.session || "",
      date: dateStr,
      dateSlash: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
      dr: 0,
      cr: targetChallan.amount,
      receiptNo,
      transactionMode: `${targetChallan.bankName} Bank Challan`,
      particulars: `Bank Challan Approved: ${targetChallan.particulars || targetChallan.journalNo}`,
      remarks: `Journal: ${targetChallan.journalNo}`,
      status: "Cleared"
    });
  }

  window.dispatchEvent(new CustomEvent("bankChallansUpdated", { detail: { targetChallan, all: updated } }));
  return targetChallan;
};

// -- Shared Scholarship Applications Store & Real-Time Sync --
const defaultScholarships = [];

const isStudentAccountAid = (item = {}) => (
  String(item.disbursementTo || item.paymentDestination || "").toLowerCase().includes("student account")
);

const isCollegeAccountAid = (item = {}) => !isStudentAccountAid(item);

const cleanAidId = (value = "") => String(value || "").trim().toUpperCase();

const getProfileScholarshipId = () => cleanAidId(
  studentProfile.scholarshipUniqueId ||
  studentProfile.scholarshipApplicationId ||
  studentProfile.schemeApplicationNo
);

const getProfileDrccId = () => cleanAidId(
  studentProfile.drccLoanId ||
  studentProfile.studentCreditCardId ||
  studentProfile.loanId
);

const isProfileBoundAidId = (submittedId = "", profileId = "") => {
  const submitted = cleanAidId(submittedId);
  const stored = cleanAidId(profileId);
  return Boolean(submitted && stored && submitted === stored);
};

const getStoredStudentProfiles = () => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = readRealtimeList("erp_admin_verifications", []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

const mergeScholarshipWithStudentProfile = (application) => {
  const profiles = getStoredStudentProfiles();
  const identifiers = [
    application.scholarNo,
    application.rollNumber,
    application.enrollmentNo,
    application.studentId
  ].filter(Boolean).map(String);
  const profile = profiles.find((student) => identifiers.some((id) => [
    student.scholarNo,
    student.rollNumber,
    student.enrollmentNo,
    student.id,
    student.loginUsername
  ].filter(Boolean).map(String).includes(id)));

  const isSettledAid = ["Approved", "Adjusted", "Completed", "Payment Received"].some((word) => String(application.status || "").includes(word));
  const approvedSanction = isSettledAid ? Number(application.sanctionedAmount || application.amountReceived || application.sanctionedYearAmount) || 0 : 0;
  const ledgerCredit = getStudentDetailedLedger().find((entry) => String(entry.id) === `LEDGER-${application.id}`);
  const feeAdjustedAmount = Number(application.feeAdjustedAmount) || Number(ledgerCredit?.cr ?? ledgerCredit?.crAmount ?? ledgerCredit?.amount) || 0;
  const excessScholarshipAmount = isStudentAccountAid(application)
    ? 0
    : (Number(application.excessScholarshipAmount ?? application.refundableAmount) || Math.max(0, approvedSanction - feeAdjustedAmount));

  const computedApplication = {
    ...application,
    feeAdjustedAmount,
    excessScholarshipAmount,
    refundableAmount: Number(application.refundableAmount) || excessScholarshipAmount
  };

  if (!profile) return computedApplication;

  const profileAdmissionSession = profile.admissionSession || profile.admission_session || profile.admissionYear || computedApplication.session || profile.session || "";
  const profileCurrentSession = getAcademicSessionForSemester(profileAdmissionSession, profile.semester || computedApplication.semester) || profile.session || computedApplication.session || computedApplication.academicYear || "";

  return {
    ...computedApplication,
    studentName: profile.studentName || profile.name || computedApplication.studentName,
    scholarNo: profile.scholarNo || computedApplication.scholarNo || computedApplication.rollNumber,
    rollNumber: computedApplication.rollNumber || profile.scholarNo || profile.rollNumber,
    enrollmentNo: profile.enrollmentNo || computedApplication.enrollmentNo || "",
    course: profile.course || profile.courseCode || computedApplication.course || "",
    department: profile.department || computedApplication.department || "",
    semester: profile.semester || computedApplication.semester || "",
    session: computedApplication.session || computedApplication.academicYear || profileCurrentSession,
    section: profile.section || computedApplication.section || "",
    fatherName: profile.fatherName || computedApplication.fatherName || "",
    phone: profile.phone || computedApplication.phone || "",
    email: profile.email || computedApplication.email || "",
    aadhar: profile.aadhar || computedApplication.aadhar || "",
    profileCategory: profile.category || computedApplication.profileCategory || "",
    studentDocuments: profile.documents || computedApplication.studentDocuments || []
  };
};

export const getScholarshipApplications = () => {
  return readRealtimeList("erp_scholarship_applications", defaultScholarships).map(mergeScholarshipWithStudentProfile);
};

export const getScholarshipExcessForStudent = (roll = "", session = "") => {
  const { values } = getLedgerIdentifiers(roll || studentProfile.rollNumber || studentProfile.scholarNo || "");
  const targetSession = session || studentProfile.session || studentProfile.academicSession || "";
  const approvedScholarships = [...getScholarshipApplications(), ...getDrccApplications()].filter((app) => (
    ["Approved", "Adjusted", "Completed", "Payment Received"].some((word) => String(app.status || "").includes(word)) &&
    isCollegeAccountAid(app) &&
    (values.has(app.rollNumber) || values.has(app.scholarNo) || values.has(app.enrollmentNo) || values.has(app.studentId)) &&
    (!targetSession || String(app.session || app.academicYear || "") === String(targetSession))
  ));
  const totalExcess = approvedScholarships.reduce((sum, app) => sum + (Number(app.excessScholarshipAmount ?? app.refundableAmount) || 0), 0);
  const paidRefunds = getRefundRequests()
    .filter((request) => (
      String(request.status || "").includes("Approved") &&
      (values.has(request.rollNumber) || values.has(request.scholarNo) || values.has(request.studentId)) &&
      (!targetSession || String(request.session || "") === String(targetSession))
    ))
    .reduce((sum, request) => sum + (Number(request.amount) || 0), 0);

  return Math.max(0, totalExcess - paidRefunds);
};

export const submitStudentScholarship = (data) => {
  const all = getScholarshipApplications();
  const rollNumber = data.rollNumber || studentProfile.scholarNo || studentProfile.rollNumber || "";
  const requestedAmount = Number(data.requestedAmount) || 0;
  const disbursementTo = data.disbursementTo || "College Account";
  const profileScholarshipId = getProfileScholarshipId();
  const submittedScholarshipId = data.schemeApplicationNo || profileScholarshipId;
  const pendingAmount = getFeeDetailsForStudent(rollNumber).totalPending;
  if (!isProfileBoundAidId(submittedScholarshipId, profileScholarshipId)) return null;
  if (isStudentAccountAid({ disbursementTo })) return null;
  if (!rollNumber || requestedAmount <= 0 || (isCollegeAccountAid({ disbursementTo }) && requestedAmount > pendingAmount)) return null;
  const feeDetailsForRoll = getFeeDetailsForStudent(rollNumber);
  const documents = Array.isArray(data.documents) ? data.documents : [];
  const newApp = {
    id: `SCH-${Date.now()}`,
    studentName: data.studentName || studentProfile.name || "",
    scholarNo: data.scholarNo || studentProfile.scholarNo || rollNumber,
    rollNumber,
    enrollmentNo: data.enrollmentNo || studentProfile.enrollmentNo || "",
    course: data.course || studentProfile.course || "",
    department: data.department || studentProfile.department || "",
    semester: data.semester || studentProfile.semester || "",
    session: data.session || studentProfile.session || studentProfile.academicSession || "",
    section: data.section || studentProfile.section || "",
    fatherName: data.fatherName || studentProfile.fatherName || "",
    phone: data.phone || studentProfile.phone || "",
    email: data.email || studentProfile.email || "",
    aadhar: data.aadhar || studentProfile.aadhar || "",
    profileCategory: data.profileCategory || studentProfile.category || "",
    name: data.name || "Institutional Merit & Welfare Scholarship",
    category: data.category || "General",
    familyIncome: data.familyIncome || "",
    annualIncome: `Rs.${Number(data.familyIncome || 0).toLocaleString("en-IN")}`,
    academicCgpa: data.academicCgpa || "0.00",
    schemeApplicationNo: submittedScholarshipId,
    incomeCertificateNo: data.incomeCertificateNo || "",
    incomeCertificateDate: data.incomeCertificateDate || "",
    casteCertificateNo: data.casteCertificateNo || "",
    domicileCertificateNo: data.domicileCertificateNo || "",
    bankName: data.bankName || "",
    accountNo: data.accountNo || "",
    ifscCode: data.ifscCode || "",
    transferMode: data.transferMode || "NEFT/RTGS",
    utrNumber: data.utrNumber || "",
    paymentDate: data.paymentDate || new Date().toISOString().slice(0, 10),
    disbursementTo,
    paymentDestination: disbursementTo,
    paymentStatus: "College Account Pending Verification",
    documents,
    sanctionedAmount: 0,
    requestedAmount,
    status: "Pending Verification",
    academicYear: data.academicYear || studentProfile.academicSession || feeDetailsForRoll.academicYear || "",
    appliedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    verifiedDate: null,
    benefitType: data.benefitType || "Tuition Fee Concession Credit",
    officerRemarks: data.officerRemarks || "Application submitted - Awaiting Finance Audit Officer review",
    verifiedBy: null
  };

  const updated = [newApp, ...all.filter(s => s.id !== newApp.id)];
  if (typeof window !== "undefined") {
    try {
      writeRealtimeList("erp_scholarship_applications", updated);
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new CustomEvent("scholarshipDataUpdated", { detail: { newApp, all: updated } }));
    addStudentNotification({
      rollNumber,
      title: "Scholarship submitted",
      message: `${newApp.name} college-account verification ke liye submit ho gaya.`,
      type: "fees",
      route: "/student-dashboard/fees/scholarships"
    });
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("scholarship_applications").upsert({
      id: newApp.id,
      roll_number: newApp.rollNumber,
      scholar_no: newApp.scholarNo,
      enrollment_no: newApp.enrollmentNo,
      student_name: newApp.studentName,
      course: newApp.course,
      department: newApp.department,
      semester: studentProfile.semester || "",
      session: newApp.session,
      section: newApp.section,
      father_name: newApp.fatherName,
      phone: newApp.phone,
      email: newApp.email,
      aadhar: newApp.aadhar,
      scheme_name: newApp.name,
      scheme_application_no: newApp.schemeApplicationNo,
      category: newApp.category,
      family_income: Number(newApp.familyIncome) || 0,
      academic_cgpa: newApp.academicCgpa,
      income_certificate_no: newApp.incomeCertificateNo,
      income_certificate_date: newApp.incomeCertificateDate,
      caste_certificate_no: newApp.casteCertificateNo,
      domicile_certificate_no: newApp.domicileCertificateNo,
      bank_name: newApp.bankName,
      account_no: newApp.accountNo,
      ifsc_code: newApp.ifscCode,
      disbursement_to: newApp.disbursementTo,
      payment_destination: newApp.paymentDestination,
      payment_status: newApp.paymentStatus,
      transfer_mode: newApp.transferMode,
      utr_number: newApp.utrNumber,
      payment_date: newApp.paymentDate,
      documents: newApp.documents,
      applied_amount: newApp.requestedAmount,
      sanctioned_amount: newApp.sanctionedAmount,
      fee_adjusted_amount: newApp.feeAdjustedAmount || 0,
      excess_scholarship_amount: newApp.excessScholarshipAmount || 0,
      refundable_amount: newApp.refundableAmount || 0,
      status: newApp.status,
      applied_date: newApp.appliedDate,
      sanctioned_date: newApp.verifiedDate,
      benefit_type: newApp.benefitType,
      verified_by: newApp.verifiedBy,
      remarks: newApp.officerRemarks
    }).then(({ error }) => {
      if (error) console.warn("Supabase submitStudentScholarship error:", error);
    });
  }
  return newApp;
};

export const processScholarshipAction = (id, actionStatus, sanctionedAmt = 0, remarks = "", officerName = "Scholarship Officer") => {
  const all = getScholarshipApplications();
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  let target = null;

  const updated = all.map(s => {
    if (s.id === id) {
      if (isStudentAccountAid(s)) {
        target = s;
        return s;
      }
      const approvedSanction = actionStatus === "Approved" ? (Number(sanctionedAmt) || s.requestedAmount) : 0;
      const currentPending = getFeeDetailsForStudent(s.rollNumber).totalPending;
      const adjustedFeeAmount = actionStatus === "Approved" ? Math.min(approvedSanction, currentPending) : 0;
      const excessScholarshipAmount = actionStatus === "Approved" ? Math.max(0, approvedSanction - adjustedFeeAmount) : 0;
      target = {
        ...s,
        status: actionStatus,
        sanctionedAmount: approvedSanction,
        feeAdjustedAmount: adjustedFeeAmount,
        excessScholarshipAmount,
        refundableAmount: excessScholarshipAmount,
        officerRemarks: remarks || (actionStatus === "Approved"
          ? "Scholarship amount received in college account and adjusted in fee ledger."
          : "Criteria not met"),
        verifiedDate: dateStr,
        verifiedBy: officerName
      };
      return target;
    }
    return s;
  });

  if (typeof window !== "undefined") {
    try {
      writeRealtimeList("erp_scholarship_applications", updated);
    } catch (e) {
      console.error(e);
    }
  }
  if (isSupabaseConfigured && supabase && target) {
    supabase.from("scholarship_applications").update({
      sanctioned_amount: target.sanctionedAmount,
      fee_adjusted_amount: target.feeAdjustedAmount || 0,
      excess_scholarship_amount: target.excessScholarshipAmount || 0,
      refundable_amount: target.refundableAmount || 0,
      status: target.status,
      sanctioned_date: target.verifiedDate,
      verified_by: target.verifiedBy,
      remarks: target.officerRemarks
    }).eq("id", id).then(({ error }) => {
      if (error) console.warn("Supabase processScholarshipAction error:", error);
    });
  }

  // If approved as Fee Concession / Ledger Credit for student:
  if (actionStatus === "Approved" && target && target.sanctionedAmount > 0 && isCollegeAccountAid(target)) {
    const creditAmount = Number(target.feeAdjustedAmount) || Math.min(target.sanctionedAmount, getFeeDetailsForStudent(target.rollNumber).totalPending);
    if (creditAmount > 0 || target.excessScholarshipAmount > 0) {
    addStudentLedgerEntry({
      id: `LEDGER-${target.id}`,
      rollNumber: target.rollNumber,
      studentName: target.studentName,
      course: target.course,
      session: target.session || target.academicYear || "",
      date: dateStr,
      dr: 0,
      cr: creditAmount,
      refDr: 0,
      refCr: Number(target.excessScholarshipAmount) || 0,
      receiptNo: `SCH-${target.id}`,
      transactionMode: "Scholarship Credit",
      particulars: `${target.name} fee adjusted`,
      remarks: target.excessScholarshipAmount > 0
        ? `${target.officerRemarks} | Sanctioned Rs.${target.sanctionedAmount.toLocaleString("en-IN")}, adjusted Rs.${creditAmount.toLocaleString("en-IN")}, excess/refundable Rs.${target.excessScholarshipAmount.toLocaleString("en-IN")}`
        : target.officerRemarks,
      status: "Cleared"
    });
    }
  }

  window.dispatchEvent(new CustomEvent("scholarshipDataUpdated", { detail: { target, all: updated } }));
  if (target) {
    addStudentNotification({
      rollNumber: target.rollNumber || target.scholarNo,
      title: actionStatus === "Approved" ? "Scholarship approved" : "Scholarship rejected",
      message: actionStatus === "Approved"
        ? `${target.name} approved. Rs.${(Number(target.feeAdjustedAmount) || 0).toLocaleString("en-IN")} fee me adjust hua.`
        : `${target.name} rejected. Remarks: ${target.officerRemarks || "Check scholarship desk remarks."}`,
      type: "fees",
      route: "/student-dashboard/fees/scholarships"
    });
  }
  return target;
};

// -- Shared Fee Concessions Store & Real-Time Sync --
// Shared DRCC / Bihar Student Credit Card Store & Real-Time Sync
const defaultDrccApplications = [];

const buildDrccSupabasePayload = (application = {}) => ({
  id: application.id,
  roll_number: application.rollNumber || application.scholarNo || "",
  scholar_no: application.scholarNo || application.rollNumber || "",
  enrollment_no: application.enrollmentNo || "",
  student_name: application.studentName || "",
  course: application.course || "",
  department: application.department || "",
  semester: application.semester || "",
  session: application.session || "",
  father_name: application.fatherName || "",
  phone: application.phone || "",
  email: application.email || "",
  aadhar: application.aadhar || "",
  application_no: application.applicationNo || "",
  application_date: application.applicationDate || "",
  drcc_district: application.drccDistrict || "",
  drcc_reference: application.drccReference || "",
  loan_id: application.loanId || "",
  sanction_letter_no: application.sanctionLetterNo || "",
  sanction_date: application.sanctionDate || "",
  approved_fee_amount: Number(application.approvedFeeAmount) || 0,
  sanctioned_total_amount: Number(application.sanctionedTotalAmount) || 0,
  sanctioned_year_amount: Number(application.sanctionedYearAmount) || 0,
  amount_received: Number(application.amountReceived) || 0,
  disbursement_to: application.disbursementTo || "College Account",
  payment_destination: application.paymentDestination || application.disbursementTo || "College Account",
  transfer_mode: application.transferMode || "NEFT/RTGS",
  utr_number: application.utrNumber || "",
  payment_date: application.paymentDate || application.applicationDate || "",
  bank_name: application.bankName || "",
  account_no: application.accountNo || "",
  ifsc_code: application.ifscCode || "",
  documents: Array.isArray(application.documents) ? application.documents : [],
  status: application.status || "BSCC Disbursement Submitted",
  applied_date: application.appliedDate || "",
  verified_date: application.verifiedDate || "",
  verified_by: application.verifiedBy || "",
  fee_adjusted_amount: Number(application.feeAdjustedAmount) || 0,
  excess_scholarship_amount: Number(application.excessScholarshipAmount) || 0,
  refundable_amount: Number(application.refundableAmount) || 0,
  remarks: application.officerRemarks || application.remarks || ""
});

const upsertDrccApplicationToSupabase = (application) => {
  if (!isSupabaseConfigured || !supabase || !application?.id || !application?.applicationNo) return;
  supabase.from("drcc_applications").upsert(
    buildDrccSupabasePayload(application),
    { onConflict: "id" }
  ).then(({ error }) => {
    if (error) console.warn("Supabase DRCC application upsert error:", error);
  });
};

export const getDrccApplications = () => {
  return readRealtimeList("erp_drcc_applications", defaultDrccApplications).map(mergeScholarshipWithStudentProfile);
};

export const submitStudentDrccApplication = (data = {}) => {
  const all = getDrccApplications();
  const rollNumber = data.rollNumber || studentProfile.rollNumber || studentProfile.scholarNo || "";
  const amountReceived = Number(data.amountReceived) || 0;
  const stage = data.stage || "disbursement";
  const profileDrccId = getProfileDrccId();
  const submittedDrccId = data.loanId || data.applicationNo || profileDrccId;
  if (stage === "disbursement" && isStudentAccountAid({ disbursementTo: data.disbursementTo })) return null;
  const existing = all.find((item) => (
    String(item.applicationNo || "") === String(data.applicationNo || "") ||
    String(item.loanId || "") === String(submittedDrccId || "") ||
    String(item.id || "") === String(data.id || "")
  )) || {};
  if (!isProfileBoundAidId(submittedDrccId, profileDrccId)) return null;
  if (!rollNumber || !data.applicationNo) return null;
  if (stage === "sanction" && !data.sanctionLetterNo) return null;
  if (stage === "disbursement" && amountReceived <= 0) return null;

  const feeState = getFeeDetailsForStudent(rollNumber);
  const status = stage === "application"
    ? "BSCC Application Submitted"
    : stage === "sanction"
    ? "BSCC Sanction Submitted"
    : "BSCC Disbursement Submitted";
  const newApp = {
    ...existing,
    id: data.id || existing.id || `BSCC-${Date.now()}`,
    studentName: data.studentName || studentProfile.name || "",
    scholarNo: data.scholarNo || studentProfile.scholarNo || rollNumber,
    rollNumber,
    enrollmentNo: data.enrollmentNo || studentProfile.enrollmentNo || "",
    course: data.course || studentProfile.course || "",
    department: data.department || studentProfile.department || "",
    semester: data.semester || studentProfile.semester || "",
    session: data.session || studentProfile.session || studentProfile.academicSession || "",
    fatherName: data.fatherName || studentProfile.fatherName || "",
    phone: data.phone || studentProfile.phone || "",
    email: data.email || studentProfile.email || "",
    aadhar: data.aadhar || studentProfile.aadhar || "",
    applicationNo: submittedDrccId || data.applicationNo || existing.applicationNo || "",
    applicationDate: data.applicationDate || existing.applicationDate || "",
    drccDistrict: data.drccDistrict || existing.drccDistrict || "",
    drccReference: data.drccReference || existing.drccReference || "",
    loanId: submittedDrccId || existing.loanId || "",
    sanctionLetterNo: data.sanctionLetterNo || existing.sanctionLetterNo || "",
    sanctionDate: data.sanctionDate || existing.sanctionDate || "",
    approvedFeeAmount: Number(data.approvedFeeAmount) || existing.approvedFeeAmount || 0,
    sanctionedTotalAmount: Number(data.sanctionedTotalAmount) || existing.sanctionedTotalAmount || amountReceived,
    sanctionedYearAmount: Number(data.sanctionedYearAmount) || existing.sanctionedYearAmount || amountReceived,
    amountReceived: amountReceived || existing.amountReceived || 0,
    disbursementTo: data.disbursementTo || existing.disbursementTo || "College Account",
    paymentDestination: data.disbursementTo || existing.paymentDestination || existing.disbursementTo || "College Account",
    transferMode: data.transferMode || existing.transferMode || "NEFT/RTGS",
    utrNumber: data.utrNumber || existing.utrNumber || "",
    paymentDate: data.paymentDate || existing.paymentDate || new Date().toISOString().slice(0, 10),
    bankName: data.bankName || existing.bankName || "",
    accountNo: data.accountNo || existing.accountNo || "",
    ifscCode: data.ifscCode || existing.ifscCode || "",
    documents: [...(existing.documents || []), ...(Array.isArray(data.documents) ? data.documents : [])],
    status,
    appliedDate: existing.appliedDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    verifiedDate: null,
    verifiedBy: null,
    feeAdjustedAmount: existing.feeAdjustedAmount || 0,
    excessScholarshipAmount: existing.excessScholarshipAmount || 0,
    refundableAmount: existing.refundableAmount || 0,
    officerRemarks: data.officerRemarks || `DRCC disbursement submitted. Current fee due Rs.${(feeState.totalPending || 0).toLocaleString("en-IN")}.`
  };

  const updated = [newApp, ...all.filter((item) => item.id !== newApp.id && String(item.applicationNo || "") !== String(newApp.applicationNo || ""))];
  if (typeof window !== "undefined") {
    try {
      writeRealtimeList("erp_drcc_applications", updated);
    } catch (e) {
      console.error(e);
    }
    emitErpSyncEvent("drccDataUpdated", { newApp, all: updated });
    addStudentNotification({
      rollNumber,
      title: "BSCC college credit submitted",
      message: `Rs.${(Number(newApp.amountReceived) || 0).toLocaleString("en-IN")} BSCC college-account credit verification ke liye submit hua.`,
      type: "fees",
      route: "/student-dashboard/fees/drcc"
    });
  }
  upsertDrccApplicationToSupabase(newApp);
  return newApp;
};

export const processDrccAction = (id, actionStatus, adjustAmt = 0, remarks = "", officerName = "DRCC Accounts Officer") => {
  const all = getDrccApplications();
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  let target = null;

  const updated = all.map((app) => {
    if (app.id !== id) return app;
    if (isStudentAccountAid(app)) {
      target = app;
      return app;
    }
    const receivedAmount = Number(app.amountReceived) || Number(app.sanctionedYearAmount) || 0;
    const currentDue = getFeeDetailsForStudent(app.rollNumber).totalPending;
    const feeAdjustedAmount = actionStatus === "Approved" ? Math.min(Number(adjustAmt) || receivedAmount, currentDue) : 0;
    const excessScholarshipAmount = actionStatus === "Approved" ? Math.max(0, receivedAmount - feeAdjustedAmount) : 0;
    const nextStatus = actionStatus === "Approved"
      ? (receivedAmount > 0
        ? "College Payment Received - Fee Adjusted"
        : "College Verification Completed")
      : actionStatus === "Correction"
      ? "Correction Required"
      : "Rejected";
    target = {
      ...app,
      status: nextStatus,
      feeAdjustedAmount,
      excessScholarshipAmount,
      refundableAmount: excessScholarshipAmount,
      verifiedDate: dateStr,
      verifiedBy: officerName,
      officerRemarks: remarks || (actionStatus === "Approved"
        ? "BSCC college-account payment verified and adjusted in fee ledger."
        : "BSCC document/payment proof mismatch.")
    };
    return target;
  });

  if (typeof window !== "undefined") {
    try {
      writeRealtimeList("erp_drcc_applications", updated);
    } catch (e) {
      console.error(e);
    }
  }
  if (target) upsertDrccApplicationToSupabase(target);

  if (actionStatus === "Approved" && target && isCollegeAccountAid(target) && (target.feeAdjustedAmount > 0 || target.excessScholarshipAmount > 0)) {
    addStudentLedgerEntry({
      id: `LEDGER-${target.id}`,
      rollNumber: target.rollNumber,
      studentName: target.studentName,
      course: target.course,
      session: target.session || "",
      date: dateStr,
      dr: 0,
      cr: target.feeAdjustedAmount,
      refDr: 0,
      refCr: target.excessScholarshipAmount,
      receiptNo: `DRCC-${target.id}`,
      transactionMode: "DRCC Credit",
      particulars: `DRCC ${target.disbursementTo} disbursement adjusted`,
      remarks: `${target.officerRemarks} | Received Rs.${target.amountReceived.toLocaleString("en-IN")}, fee adjusted Rs.${target.feeAdjustedAmount.toLocaleString("en-IN")}, excess/refundable Rs.${target.excessScholarshipAmount.toLocaleString("en-IN")}`,
      status: "Cleared"
    });
  }

  emitErpSyncEvent("drccDataUpdated", { target, all: updated });
  if (target) {
    addStudentNotification({
      rollNumber: target.rollNumber || target.scholarNo,
      title: target.status === "Rejected" ? "BSCC credit rejected" : target.status === "Correction Required" ? "BSCC correction required" : "BSCC fee adjusted",
      message: target.status === "Rejected"
        ? `BSCC record rejected. Remarks: ${target.officerRemarks || "Check BSCC desk remarks."}`
        : target.status === "Correction Required"
        ? `BSCC record correction required. Remarks: ${target.officerRemarks || "Check BSCC desk remarks."}`
        : `Rs.${(Number(target.feeAdjustedAmount) || 0).toLocaleString("en-IN")} BSCC amount fee ledger me adjust hua.`,
      type: "fees",
      route: "/student-dashboard/fees/drcc"
    });
  }
  return target;
};

const defaultConcessions = [];
const defaultConcessionRules = [
  {
    id: "RULE-12TH-MERIT-85",
    name: "12th Merit Concession",
    minClass12Percentage: 85,
    discountPercent: 10,
    status: "Active",
    createdBy: "System Default"
  }
];

export const getConcessionRules = () => {
  const rules = readRealtimeList("erp_concession_rules", []);
  if (rules.length > 0) return rules;
  writeRealtimeList("erp_concession_rules", defaultConcessionRules);
  return defaultConcessionRules;
};

export const saveConcessionRule = (data = {}) => {
  const name = String(data.name || "").trim();
  const minClass12Percentage = Number(data.minClass12Percentage) || 0;
  const discountPercent = Number(data.discountPercent) || 0;
  if (!name || minClass12Percentage <= 0 || discountPercent <= 0) return null;
  const rule = {
    id: data.id || `RULE-${Date.now()}`,
    name,
    minClass12Percentage,
    discountPercent,
    status: data.status || "Active",
    createdBy: data.createdBy || "Fee Officer"
  };
  const updated = [rule, ...getConcessionRules().filter((item) => item.id !== rule.id)];
  if (typeof window !== "undefined") {
    try {
      writeRealtimeList("erp_concession_rules", updated);
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new CustomEvent("concessionRulesUpdated", { detail: { rule, all: updated } }));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("fee_concession_rules").upsert({
      id: rule.id,
      name: rule.name,
      min_class_12_percentage: rule.minClass12Percentage,
      discount_percent: rule.discountPercent,
      status: rule.status,
      created_by: rule.createdBy
    }).then(({ error }) => {
      if (error) console.warn("Supabase saveConcessionRule error:", error);
    });
  }
  return rule;
};

export const getConcessionRequests = () => {
  return readRealtimeList("erp_concession_requests", defaultConcessions);
};

export const submitStudentConcession = (data) => {
  const all = getConcessionRequests();
  const rollNumber = data.rollNumber || studentProfile.rollNumber || studentProfile.scholarNo || "";
  const amount = Number(data.amount) || 0;
  const pendingAmount = getFeeDetailsForStudent(rollNumber).totalPending;
  const class12Percentage = Number(data.class12Percentage) || 0;
  const rule = getConcessionRules().find((item) => item.id === data.ruleId && item.status === "Active");
  if (!rollNumber || !rule || class12Percentage < Number(rule.minClass12Percentage || 0) || amount <= 0 || amount > pendingAmount) return null;
  const feeDetailsForRoll = getFeeDetailsForStudent(rollNumber);
  const newTicket = {
    id: `CNC-${Date.now()}`,
    studentName: data.studentName || studentProfile.name || "",
    rollNumber,
    course: data.course || studentProfile.course || "",
    type: rule.name,
    ruleId: rule.id,
    categoryTag: "12TH MERIT CONCESSION",
    class12Board: data.class12Board || "",
    class12School: data.class12School || "",
    class12PassingYear: data.class12PassingYear || "",
    class12Percentage,
    class12Marksheet: data.class12Marksheet || "",
    amount,
    sanctionedAmount: 0,
    status: "Pending Verification",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    verifiedDate: null,
    reason: data.reason || `12th percentage ${class12Percentage}% meets ${rule.minClass12Percentage}% merit rule.`,
    officerRemarks: "Appeal received - Queued for Finance Committee review",
    verifiedBy: null
  };

  const updated = [newTicket, ...all.filter(c => c.id !== newTicket.id)];
  if (typeof window !== "undefined") {
    try {
      writeRealtimeList("erp_concession_requests", updated);
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new CustomEvent("concessionDataUpdated", { detail: { newTicket, all: updated } }));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("fee_concessions").upsert({
      id: newTicket.id,
      roll_number: newTicket.rollNumber,
      student_name: newTicket.studentName,
      course: newTicket.course,
      semester: studentProfile.semester || "",
      category: newTicket.type,
      rule_id: newTicket.ruleId,
      discount_percent: Number(rule.discountPercent) || 0,
      original_fee: Number(feeDetailsForRoll.totalFees) || newTicket.amount,
      discount_amount: newTicket.amount,
      final_fee: Math.max(0, (Number(feeDetailsForRoll.totalFees) || 0) - newTicket.amount),
      class_12_board: newTicket.class12Board,
      class_12_school: newTicket.class12School,
      class_12_passing_year: newTicket.class12PassingYear,
      class_12_percentage: newTicket.class12Percentage,
      class_12_marksheet: newTicket.class12Marksheet,
      status: newTicket.status,
      applied_date: newTicket.date,
      approved_date: newTicket.verifiedDate,
      approved_by: newTicket.verifiedBy,
      remarks: newTicket.officerRemarks
    }).then(({ error }) => {
      if (error) console.warn("Supabase submitStudentConcession error:", error);
    });
  }
  return newTicket;
};

export const processConcessionAction = (id, actionStatus, sanctionedAmt = 0, remarks = "", officerName = "Accounts Officer") => {
  const all = getConcessionRequests();
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  let target = null;

  const updated = all.map(c => {
    if (c.id === id) {
      target = {
        ...c,
        status: actionStatus,
        sanctionedAmount: actionStatus === "Approved" ? (Number(sanctionedAmt) || c.amount) : 0,
        officerRemarks: remarks || (actionStatus === "Approved" ? "Concession approved & fee bill adjusted" : "Concession appeal rejected"),
        verifiedDate: dateStr,
        verifiedBy: officerName
      };
      return target;
    }
    return c;
  });

  if (typeof window !== "undefined") {
    try {
      writeRealtimeList("erp_concession_requests", updated);
    } catch (e) {
      console.error(e);
    }
  }
  if (isSupabaseConfigured && supabase && target) {
    supabase.from("fee_concessions").update({
      discount_amount: target.sanctionedAmount,
      status: target.status,
      approved_date: target.verifiedDate,
      approved_by: target.verifiedBy,
      remarks: target.officerRemarks
    }).eq("id", id).then(({ error }) => {
      if (error) console.warn("Supabase processConcessionAction error:", error);
    });
  }

  // If approved for student, credit the waiver!
  if (actionStatus === "Approved" && target && target.sanctionedAmount > 0) {
    const creditAmount = Math.min(target.sanctionedAmount, getFeeDetailsForStudent(target.rollNumber).totalPending);
    if (creditAmount > 0) {
    addStudentLedgerEntry({
      id: `LEDGER-${target.id}`,
      rollNumber: target.rollNumber,
      studentName: target.studentName,
      course: target.course,
      date: dateStr,
      dr: 0,
      cr: creditAmount,
      receiptNo: `CNC-${target.id}`,
      transactionMode: "Fee Concession",
      particulars: `${target.type} approved`,
      remarks: target.officerRemarks,
      status: "Cleared"
    });
    }
  }

  window.dispatchEvent(new CustomEvent("concessionDataUpdated", { detail: { target, all: updated } }));
  return target;
};

// -- Shared Fee Refund Requests Store & Real-Time Sync --
const defaultRefunds = [];

export const getRefundRequests = () => {
  return readRealtimeList("erp_refund_requests", defaultRefunds);
};

export const submitStudentRefund = (data) => {
  const all = getRefundRequests();
  const rollNumber = data.rollNumber || studentProfile.rollNumber || studentProfile.scholarNo || "";
  const amount = Number(data.amount) || 0;
  const financials = getFeeDetailsForStudent(rollNumber);
  const ledgerExcess = Math.max(0, financials.totalPaid - financials.totalFees);
  const claimSession = data.session || studentProfile.session || studentProfile.academicSession || financials.academicYear || "";
  const scholarshipExcess = getScholarshipExcessForStudent(rollNumber, claimSession);
  const availableRefund = Math.max(ledgerExcess, scholarshipExcess);
  if (!rollNumber || amount <= 0 || amount > availableRefund) return null;
  const newClaim = {
    ticketId: `RFD-${Date.now()}`,
    studentName: data.studentName || studentProfile.name || "",
    rollNumber,
    course: data.course || studentProfile.course || "",
    session: claimSession,
    category: data.category || "",
    reason: data.reason || "",
    amount,
    status: "Pending Verification",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    verifiedDate: null,
    bankName: data.bankName || "",
    accountHolderName: data.accountHolderName || "",
    accountNo: data.accountNo || "",
    ifsc: data.ifsc || "",
    utrNumber: null,
    officerRemarks: "Claim submitted - Under cashier audit review",
    verifiedBy: null
  };

  const updated = [newClaim, ...all.filter(r => r.ticketId !== newClaim.ticketId)];
  if (typeof window !== "undefined") {
    try {
      writeRealtimeList("erp_refund_requests", updated);
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new CustomEvent("refundDataUpdated", { detail: { newClaim, all: updated } }));
    addStudentNotification({
      rollNumber,
      title: "Refund claim submitted",
      message: `Rs.${amount.toLocaleString("en-IN")} refund claim Accounts Desk review ke liye submit hua.`,
      type: "fees",
      route: "/student-dashboard/fees/refunds"
    });
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("fee_refunds").upsert({
      id: newClaim.ticketId,
      roll_number: newClaim.rollNumber,
      student_name: newClaim.studentName,
      course: newClaim.course,
      semester: studentProfile.semester || "",
      session: newClaim.session,
      refund_reason: newClaim.reason || newClaim.category,
      claim_amount: newClaim.amount,
      approved_amount: 0,
      status: newClaim.status,
      applied_date: newClaim.date,
      approved_date: newClaim.verifiedDate,
      account_holder_name: newClaim.accountHolderName,
      bank_name: newClaim.bankName,
      bank_account: newClaim.accountNo,
      ifsc_code: newClaim.ifsc,
      utr_number: newClaim.utrNumber,
      remarks: newClaim.officerRemarks
    }).then(({ error }) => {
      if (error) console.warn("Supabase submitStudentRefund error:", error);
    });
  }
  return newClaim;
};

export const processRefundAction = (ticketId, actionStatus, refundAmt = 0, utrNo = "", remarks = "", officerName = "Accounts Officer", bankDetails = {}) => {
  const all = getRefundRequests();
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const original = all.find((request) => request.ticketId === ticketId);
  if (actionStatus === "Approved" && !String(utrNo || "").trim()) return original || null;
  const financials = getFeeDetailsForStudent(original?.rollNumber || "");
  const ledgerExcess = Math.max(0, financials.totalPaid - financials.totalFees);
  const refundSession = original?.session || financials.academicYear || "";
  const scholarshipExcess = getScholarshipExcessForStudent(original?.rollNumber || "", refundSession);
  const refundableAmount = Math.max(ledgerExcess, scholarshipExcess);
  const requestedRefund = Number(refundAmt) || Number(original?.amount) || 0;
  const effectiveStatus = actionStatus === "Approved" && requestedRefund > refundableAmount ? "Rejected" : actionStatus;
  let target = null;

  const updated = all.map(r => {
    if (r.ticketId === ticketId) {
      target = {
        ...r,
        status: effectiveStatus,
        amount: effectiveStatus === "Approved" ? requestedRefund : r.amount,
        utrNumber: effectiveStatus === "Approved" ? utrNo : null,
        officerRemarks: effectiveStatus === "Rejected" && actionStatus === "Approved"
          ? `Refund blocked: only Rs.${refundableAmount.toLocaleString("en-IN")} excess credit is available.`
          : (remarks || (effectiveStatus === "Approved" ? "Refund processed and bank transfer completed" : "Claim rejected by audit")),
        verifiedDate: dateStr,
        verifiedBy: officerName,
        bankName: effectiveStatus === "Approved" ? (bankDetails.bankName || r.bankName || "") : r.bankName,
        accountHolderName: effectiveStatus === "Approved" ? (bankDetails.accountHolderName || r.accountHolderName || "") : r.accountHolderName,
        accountNo: effectiveStatus === "Approved" ? (bankDetails.accountNo || r.accountNo || "") : r.accountNo,
        ifsc: effectiveStatus === "Approved" ? (bankDetails.ifsc || r.ifsc || "") : r.ifsc
      };
      return target;
    }
    return r;
  });

  if (typeof window !== "undefined") {
    try {
      writeRealtimeList("erp_refund_requests", updated);
    } catch (e) {
      console.error(e);
    }
  }
  if (isSupabaseConfigured && supabase && target) {
    supabase.from("fee_refunds").update({
      approved_amount: target.amount,
      status: target.status,
      approved_date: target.verifiedDate,
      account_holder_name: target.accountHolderName,
      bank_name: target.bankName,
      bank_account: target.accountNo,
      ifsc_code: target.ifsc,
      utr_number: target.utrNumber,
      remarks: target.officerRemarks
    }).eq("id", ticketId).then(({ error }) => {
      if (error) console.warn("Supabase processRefundAction error:", error);
    });
  }

  if (target?.status === "Approved" && target.amount > 0) {
    addStudentLedgerEntry({
      id: `LEDGER-${target.ticketId}`,
      rollNumber: target.rollNumber,
      studentName: target.studentName,
      course: target.course,
      date: dateStr,
      dr: 0,
      cr: -target.amount,
      receiptNo: target.utrNumber,
      transactionMode: "Refund Payout",
      particulars: `${target.category || "Fee Refund"} processed`,
      remarks: target.officerRemarks,
      status: "Cleared"
    });
  }

  window.dispatchEvent(new CustomEvent("refundDataUpdated", { detail: { target, all: updated } }));
  if (target) {
    addStudentNotification({
      rollNumber: target.rollNumber,
      title: target.status === "Approved" ? "Refund approved" : "Refund rejected",
      message: target.status === "Approved"
        ? `Rs.${(Number(target.amount) || 0).toLocaleString("en-IN")} refund processed. UTR: ${target.utrNumber || "N/A"}.`
        : `Refund rejected. Remarks: ${target.officerRemarks || "Check refund desk remarks."}`,
      type: "fees",
      route: "/student-dashboard/fees/refunds"
    });
  }
  return target;
};

export const placementDrives = [];

export const academicEvents = [];
export const facultyQueryData = [];
export const libraryLedger = [];
export const libraryRules = [];
export const examResults = [];

export const examSchedule = [];

