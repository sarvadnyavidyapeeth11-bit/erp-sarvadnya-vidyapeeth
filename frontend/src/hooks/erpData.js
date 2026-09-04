import { getStudentVerifications, saveStudentEnrollment, updateStudentFromAdmin } from "./adminData";
import { getStudentDetailedLedger, addStudentLedgerEntry,
  generateReceiptNumber, getFeeDetailsForStudent } from "./studentPortalData";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

// Student ERP - Live Data Layer & Unified Bridge
const STUDENTS_KEY = "erp_students";
const PAYMENTS_KEY = "erp_payments";

// Clean Pure State
const seedStudents = [];
const seedPayments = [];

// --- Initialise ------------------------------------------------------------
export function initERP() {
  // Pure live state - no mock seed injection
}

// --- Student CRUD (Synced with Admin Registry & Supabase) ----
export function getStudents() {
  const verifiedList = getStudentVerifications();
  if (Array.isArray(verifiedList)) {
    return verifiedList.map((s) => {
      const scholarVal = s.scholarNo || s.rollNumber || "";
      const rollVal = scholarVal; // Scholar No and Scholar No are identical
      const enrollmentVal = s.enrollmentNo || s.enrollmentNumber || "";
      const financials = getFeeDetailsForStudent(rollVal || enrollmentVal);
      return {
        id: s.id || `STU-${scholarVal}`,
        rollNumber: rollVal,
        scholarNo: scholarVal,
        enrollmentNo: enrollmentVal,
        name: s.studentName || s.name || "Enrolled Student",
        fatherName: s.fatherName || s.guardianName || "",
        motherName: s.motherName || "",
        email: s.email || "",
        phone: s.phone || "",
        dob: s.dob || "",
        gender: s.gender || "Male",
        course: s.courseCode || s.course || "",
        courseCode: s.courseCode || "",
        courseName: s.course || "",
        department: s.department || "",
        year: s.year || "1st Year",
        semester: s.semester || "I SEM",
        section: s.section || "A",
        batch: s.batch || "",
        session: s.session || "",
        address: s.permanentAddress || "",
        guardianName: s.fatherName || "",
        guardianPhone: s.fatherPhone || "",
        admissionDate: s.verifiedDate || s.appliedDate || new Date().toISOString().split("T")[0],
        status: s.status === "Verified" ? "Active" : (s.status || "Active"),
        totalFees: financials.totalFees,
        paidFees: financials.totalPaid,
        photo: s.photo || "",
      };
    });
  }

  return [];
}

export function getStudentById(id) {
  return getStudents().find((s) => s.id === id || s.scholarNo === id || s.rollNumber === id || s.enrollmentNo === id);
}

export function getStudentByRoll(roll) {
  return getStudents().find((s) => s.scholarNo === roll || s.rollNumber === roll || s.enrollmentNo === roll);
}

export function addStudent(student) {
  const students = getStudents();
  const newId = student.id || ("STU" + String(students.length + 1).padStart(3, "0"));
  const entry = { ...student, id: newId, studentName: student.name };
  
  saveStudentEnrollment(entry);

  if (typeof window !== "undefined") {
    try {
      const updated = [entry, ...students.filter(s => s.id !== newId)];
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new CustomEvent("studentEnrollmentUpdated", { detail: { entry } }));
  }
  return entry;
}

export function updateStudent(id, updates) {
  const students = getStudents();
  const idx = students.findIndex((s) => s.id === id || s.rollNumber === id);
  if (idx === -1) return null;
  
  const updatedStudent = { ...students[idx], ...updates, studentName: updates.name || students[idx].name };
  students[idx] = updatedStudent;

  updateStudentFromAdmin(students[idx].id || students[idx].rollNumber, {
    ...updates,
    studentName: updates.name || students[idx].name
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new CustomEvent("studentEnrollmentUpdated", { detail: { updatedStudent } }));
    window.dispatchEvent(new CustomEvent("feeDataUpdated", { detail: { updatedStudent } }));
  }
  return updatedStudent;
}

export function deleteStudent(id) {
  const students = getStudents().filter((s) => s.id !== id && s.rollNumber !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new CustomEvent("studentEnrollmentUpdated", { detail: { id } }));
  }
}

// --- Payment CRUD (Synced with Fee Ledger & Supabase) --------
export function getPayments() {
  const ledger = getStudentDetailedLedger();
  if (Array.isArray(ledger) && ledger.length > 0) {
    return ledger
      .filter((entry) => Number(entry.cr ?? entry.crAmount ?? entry.amount) > 0)
      .map((entry) => ({
      id: entry.id || entry.voucherNo || entry.receiptNo,
      studentId: entry.studentId || `STU-${entry.rollNumber}`,
      rollNumber: entry.rollNumber,
      studentName: entry.studentName || "Student",
      amount: Number(entry.cr ?? entry.crAmount ?? entry.amount ?? entry.totalRecAmount) || 0,
      date: entry.date || entry.receiptDate || new Date().toLocaleDateString("en-GB"),
      method: entry.transactionMode || entry.mode || "Cash / Gateway",
      status: entry.status || "Paid",
      receiptNo: entry.voucherNo || entry.receiptNo || entry.id,
      session: entry.session || "",
      remarks: entry.particulars || entry.remarks || "Fee Collection Receipt",
    }));
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(PAYMENTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }

  return [];
}

export function getPaymentsByStudent(studentId) {
  return getPayments().filter((p) => p.studentId === studentId || p.rollNumber === studentId);
}

export function addPayment(payment) {
  const payments = getPayments();
  const newId = payment.id || ("PAY" + String(payments.length + 1).padStart(3, "0"));
  const receiptNo = payment.receiptNo || generateReceiptNumber();
  
  const entry = {
    ...payment,
    id: newId,
    receiptNo,
    voucherNo: receiptNo,
    crAmount: payment.amount,
    date: payment.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    particulars: payment.remarks || "Fee Collection Receipt",
    mode: payment.method || "Cash Deposit"
  };

  // Add into student ledger
  addStudentLedgerEntry(entry);

  if (typeof window !== "undefined") {
    try {
      const updated = [entry, ...payments];
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  return entry;
}

// --- Statistics (Pure Live Aggregation) ----------------------
export function getStats() {
  const students = getStudents();
  const payments = getPayments();

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "Active" || s.status === "Verified").length;
  const totalFees = students.reduce((sum, s) => sum + (Number(s.totalFees) || 0), 0);
  const collectedFees = students.reduce((sum, s) => sum + (Number(s.paidFees) || 0), 0);
  const pendingFees = Math.max(0, totalFees - collectedFees);

  const feeImposedStudents = students.filter((s) => (Number(s.totalFees) || 0) > 0);
  const paidStudents = feeImposedStudents.filter((s) => (Number(s.paidFees) || 0) >= (Number(s.totalFees) || 0)).length;
  const pendingStudents = feeImposedStudents.filter((s) => (Number(s.paidFees) || 0) < (Number(s.totalFees) || 0) && (Number(s.paidFees) || 0) > 0).length;
  const unpaidStudents = feeImposedStudents.filter((s) => (Number(s.paidFees) || 0) === 0).length;

  const bcaStudents = students.filter((s) => String(s.course).toUpperCase().includes("BCA")).length;
  const bbaStudents = students.filter((s) => String(s.course).toUpperCase().includes("BBA")).length;

  const totalTransactions = payments.length;

  return {
    totalStudents,
    activeStudents,
    totalFees,
    collectedFees,
    pendingFees,
    paidStudents,
    pendingStudents,
    unpaidStudents,
    bcaStudents,
    bbaStudents,
    totalTransactions,
  };
}

