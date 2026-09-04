import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

// ─── Admin & Admissions Portal Data Store ──────────────────────────────────────────
// Handles Admissions Desk, Student Enrollment, and Comprehensive Profile Verification
// Synchronized with Local Storage and Supabase Cloud Database.

const VERIFICATIONS_KEY = "erp_admin_verifications";
const BATCHES_KEY = "erp_master_batches";
const STUDENT_SEQUENCE_KEY = "erp_student_sequence";

// The UI uses camelCase while the students table uses snake_case columns.
// Only send fields that exist in the database, so a profile edit persists instead
// of appearing only in the browser cache until the next refresh.
const studentColumnMap = {
  studentName: "student_name",
  studentNameHindi: "student_name_hindi",
  fatherName: "father_name",
  motherName: "mother_name",
  dob: "dob",
  gender: "gender",
  bloodGroup: "blood_group",
  category: "category",
  religion: "religion",
  nationality: "nationality",
  abcId: "abc_id",
  aadhar: "aadhar",
  phone: "phone",
  email: "email",
  permanentAddress: "permanent_address",
  permanentCity: "permanent_city",
  permanentState: "permanent_state",
  permanentPincode: "permanent_pincode",
  correspondenceAddress: "correspondence_address",
  department: "department",
  course: "course",
  courseCode: "course_code",
  batch: "batch",
  session: "session",
  semester: "semester",
  section: "section",
  rollNumber: "roll_number",
  scholarNo: "scholar_no",
  enrollmentNo: "enrollment_no",
  status: "status",
  appliedDate: "applied_date",
  verifiedDate: "verified_date",
  remarks: "remarks",
  documents: "documents",
  photoPreviews: "photo_previews",
};

const toStudentDatabaseFields = (fields) => Object.entries(fields || {}).reduce((record, [key, value]) => {
  const column = studentColumnMap[key];
  if (column) record[column] = value;
  return record;
}, {});

const toStudentProfileData = (fields) => Object.entries(fields || {}).reduce((record, [key, value]) => {
  if (!studentColumnMap[key] && key !== "photoPreviews") record[key] = value;
  return record;
}, {});

export const adminProfile = {
  id: "",
  name: "Admin Desk",
  fullName: "Academic Administration",
  email: "",
  phone: "",
  role: "Institutional Administrator",
  designation: "Academic Administration",
  department: "Central Administration",
  campus: "",
};

// Default clean initial student enrollment list (Pure Database Driven)
const defaultVerifications = [];

export const normalizeStudentStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (!normalized || normalized === "pending" || normalized === "pending verification" || normalized === "submitted") {
    return "Pending Verification";
  }
  if (normalized === "verified") return "Verified";
  if (normalized === "rejected") return "Rejected";
  return status;
};

export const isPendingStudentStatus = (status) => normalizeStudentStatus(status) === "Pending Verification";

const getNextStudentSequence = (students) => {
  const highestInRecords = (students || []).reduce((max, student) => {
    const match = String(student.id || "").match(/^APP-\d{4}-(\d+)$/i);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  let storedSequence = 0;
  if (typeof window !== "undefined") {
    storedSequence = Number(localStorage.getItem(STUDENT_SEQUENCE_KEY)) || 0;
  }
  const next = Math.max(highestInRecords, storedSequence) + 1;
  if (typeof window !== "undefined") localStorage.setItem(STUDENT_SEQUENCE_KEY, String(next));
  return next;
};

export const generateEnrollmentNumber = (sessionStr, courseCode, sequenceNumber) => {
  const sessionMatch = String(sessionStr || "").match(/20(\d{2})/);
  const y1 = sessionMatch ? sessionMatch[1] : (sessionStr ? String(sessionStr).slice(2, 4) : "26");
  
  // Extract pure alphabetic course code abbreviation (e.g. "BCA 2026-2029" -> "BCA")
  const rawCode = String(courseCode || "").split(/[\s\-_(]/)[0] || "BCA";
  const cleanCode = rawCode.replace(/[^A-Za-z]/g, "").toUpperCase() || "BCA";
  
  // Start from sequence 121231 (121230 + sequenceNumber)
  const seq = 121230 + (Number(sequenceNumber) || 1);
  return `SV${y1}${cleanCode}${seq}`;
};

export const getSemesterNumber = (semester = "") => {
  const text = String(semester || "").trim().toUpperCase();
  const romanMap = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8 };
  const roman = text.match(/\b(I|II|III|IV|V|VI|VII|VIII)\b/)?.[1];
  if (romanMap[roman]) return romanMap[roman];
  const numeric = text.match(/\d+/)?.[0];
  return numeric ? Number(numeric) : 0;
};

export const shiftAcademicSession = (session = "", offset = 0) => {
  const match = String(session || "").match(/(20\d{2})\s*-\s*(20\d{2})/);
  if (!match || !offset) return session || "";
  const start = Number(match[1]) + offset;
  return `${start}-${start + 1}`;
};

export const getPromotionAcademicSession = (currentSession = "", currentSemester = "", newSemester = "") => {
  const currentNo = getSemesterNumber(currentSemester);
  const nextNo = getSemesterNumber(newSemester);
  if (!currentNo || !nextNo) return currentSession || "";
  if (nextNo > currentNo && nextNo % 2 === 1) return shiftAcademicSession(currentSession, 1);
  if (nextNo < currentNo && currentNo % 2 === 1) return shiftAcademicSession(currentSession, -1);
  return currentSession || "";
};

export const getAcademicSessionForSemester = (baseSession = "", semester = "") => {
  const semesterNo = getSemesterNumber(semester);
  if (!semesterNo) return baseSession || "";
  const offset = Math.floor((semesterNo - 1) / 2);
  return shiftAcademicSession(baseSession, offset);
};

export const normalizeStudentEnrollmentNo = (student, index = 0) => {
  const currentEnroll = String(student.enrollmentNo || "").trim();
  const sessionStr = student.session || student.academicSession || "2026-2027";
  const courseCode = student.courseCode || student.course || "BCA";

  // Match strictly SV + 2 digit year + 2-6 uppercase letters + 121XXX
  if (/^SV\d{2}[A-Z]{2,6}121\d{3,}$/.test(currentEnroll)) {
    return currentEnroll;
  }

  let seq = index + 1;
  const matchId = String(student.id || "").match(/(\d+)$/);
  const matchScholar = String(student.scholarNo || student.rollNumber || "").match(/(\d{2})$/);
  if (matchId) {
    seq = Number(matchId[1]) || seq;
  } else if (matchScholar) {
    seq = Number(matchScholar[1]) || seq;
  }

  return generateEnrollmentNumber(sessionStr, courseCode, seq);
};

export const getStudentVerifications = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(VERIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          let hasMigration = false;
          const normalizedList = parsed.map((student, idx) => {
            const normalizedEnroll = normalizeStudentEnrollmentNo(student, idx);
            const admissionSession = student.admissionSession || student.admission_session || student.admissionYear || student.session || student.academicSession || "";
            const derivedSession = getAcademicSessionForSemester(admissionSession, student.semester);
            if (student.enrollmentNo !== normalizedEnroll) {
              hasMigration = true;
            }
            if (derivedSession && student.session !== derivedSession) {
              hasMigration = true;
            }
            return {
              ...student,
              enrollmentNo: normalizedEnroll,
              admissionSession,
              session: derivedSession || student.session || "",
              academicSession: derivedSession || student.academicSession || student.session || "",
              status: normalizeStudentStatus(student.status)
            };
          });

          if (hasMigration) {
            try {
              localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(normalizedList));
            } catch (err) {
              console.error(err);
            }
          }

          return normalizedList;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  return defaultVerifications;
};

export const getStudentByRoll = (rollNo) => {
  const all = getStudentVerifications();
  return all.find(s => s.rollNumber === rollNo || s.scholarNo === rollNo || s.enrollmentNo === rollNo) || null;
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();
const normalizeSection = (value) => normalizeText(value).replace(/^section\s+/, "");

export const getBatchEnrollmentCount = (batch, students = getStudentVerifications()) => {
  if (!batch) return 0;
  const batchName = normalizeText(batch.batchName);
  const courseCode = normalizeText(batch.courseCode);
  const course = normalizeText(batch.course);
  const session = normalizeText(batch.academicSession || batch.session);
  const section = normalizeSection(batch.section);

  return students.filter((student) => {
    if (normalizeStudentStatus(student.status) === "Rejected") return false;
    const studentBatch = normalizeText(student.batch);
    if (batchName && studentBatch === batchName) return true;

    const sameCourse = courseCode
      ? normalizeText(student.courseCode) === courseCode
      : normalizeText(student.course) === course;
    const sameSession = !session || normalizeText(student.session || student.academicSession) === session;
    const sameSection = !section || normalizeSection(student.section) === section;

    return sameCourse && sameSession && sameSection;
  }).length;
};

export const getBatchesWithEnrollmentCounts = (batches, students = getStudentVerifications()) => (
  (batches || []).map((batch) => ({
    ...batch,
    enrolledCount: getBatchEnrollmentCount(batch, students)
  }))
);

export const synchronizeBatchEnrollmentCounts = (targetBatchName = "", students = getStudentVerifications()) => {
  if (typeof window === "undefined") return [];

  let batches;
  try {
    batches = JSON.parse(localStorage.getItem(BATCHES_KEY) || "[]");
  } catch (e) {
    console.error(e);
    return [];
  }

  if (!Array.isArray(batches) || batches.length === 0) return [];

  const target = normalizeText(targetBatchName);
  const updated = batches.map((batch) => {
    const shouldSync = !target || normalizeText(batch.batchName) === target;
    if (!shouldSync) return batch;
    return {
      ...batch,
      enrolledCount: getBatchEnrollmentCount(batch, students)
    };
  });

  localStorage.setItem(BATCHES_KEY, JSON.stringify(updated));

  if (isSupabaseConfigured && supabase) {
    updated
      .filter((batch) => !target || normalizeText(batch.batchName) === target)
      .forEach((batch) => {
        supabase
          .from("batches")
          .update({ enrolled_count: batch.enrolledCount })
          .eq("id", batch.id)
          .then(({ error }) => {
            if (error) console.warn("Supabase synchronizeBatchEnrollmentCounts error:", error);
          });
      });
  }

  window.dispatchEvent(new CustomEvent("academicDataUpdated", { detail: { type: "batch_enrollment_count", targetBatchName } }));
  return updated;
};

export const saveStudentEnrollment = (enrollmentData) => {
  const current = getStudentVerifications();
  const nextNumber = getNextStudentSequence(current);
  const sessionStr = enrollmentData.session || enrollmentData.academicSession || "";
  const y1 = sessionStr.slice(2, 4);
  const y2 = sessionStr.slice(7, 9) || String(Number(y1) + 1);
  const sessionDigits = `${y1}${y2}`; // "2627"
  const courseCode = String(enrollmentData.courseCode || "").toUpperCase();
  if (!sessionStr || !courseCode || !enrollmentData.batch || !enrollmentData.studentName) return null;

  const appId = `APP-${sessionStr.slice(0, 4)}-${String(nextNumber).padStart(4, "0")}`;
  const genEnroll = generateEnrollmentNumber(sessionStr, courseCode, nextNumber);
  const genScholar = `${sessionDigits}${String(nextNumber).padStart(2, "0")}`; // 6-Digit Scholar Number e.g. 262701
  const genRoll = genScholar;

  const newRecord = {
    id: appId,
    rollNumber: genRoll,
    scholarNo: genScholar,
    enrollmentNo: genEnroll,
    loginUsername: genScholar,
    loginPassword: genScholar,
    status: normalizeStudentStatus(enrollmentData.status),
    appliedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    verifiedDate: "",
    documents: [],
    remarks: "",
    admissionSession: enrollmentData.admissionSession || sessionStr,
    ...enrollmentData
  };

  const updated = [newRecord, ...current];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    supabase.from("students").upsert({
      id: newRecord.id,
      student_name: newRecord.studentName,
      student_name_hindi: newRecord.studentNameHindi,
      father_name: newRecord.fatherName,
      mother_name: newRecord.motherName,
      dob: newRecord.dob || null,
      gender: newRecord.gender,
      blood_group: newRecord.bloodGroup,
      category: newRecord.category,
      religion: newRecord.religion,
      nationality: newRecord.nationality,
      abc_id: newRecord.abcId,
      aadhar: newRecord.aadhar,
      phone: newRecord.phone,
      email: newRecord.email,
      permanent_address: newRecord.permanentAddress,
      permanent_city: newRecord.permanentCity,
      permanent_state: newRecord.permanentState,
      permanent_pincode: newRecord.permanentPincode,
      department: newRecord.department,
      course: newRecord.course,
      course_code: newRecord.courseCode,
      batch: newRecord.batch,
      session: newRecord.session,
      semester: newRecord.semester,
      section: newRecord.section,
      roll_number: newRecord.rollNumber,
      scholar_no: newRecord.scholarNo,
      enrollment_no: newRecord.enrollmentNo,
      status: newRecord.status || "Pending Verification",
      applied_date: newRecord.appliedDate,
      verified_date: newRecord.verifiedDate,
      remarks: newRecord.remarks,
      documents: newRecord.documents || []
    }).then(({ error }) => {
      if (error) console.warn("Supabase saveStudentEnrollment error:", error);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("studentEnrollmentUpdated", { detail: newRecord }));
  }
  synchronizeBatchEnrollmentCounts(newRecord.batch, updated);
  return newRecord;
};

export const updateVerificationStatus = (id, newStatus, remarks = "") => {
  const current = getStudentVerifications();
  const targetStudent = current.find((item) => item.id === id || item.rollNumber === id || item.scholarNo === id);
  const normalizedStatus = normalizeStudentStatus(newStatus);
  const vDate = normalizedStatus === "Verified" ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null;
  const updated = current.map(item => {
    if (item.id === id || item.rollNumber === id || item.scholarNo === id) {
      return {
        ...item,
        status: normalizedStatus,
        verifiedDate: vDate,
        remarks: remarks || item.remarks
      };
    }
    return item;
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    supabase.from("students").update({
      status: normalizedStatus,
      verified_date: vDate,
      remarks: remarks
    }).or(`id.eq.${id},roll_number.eq.${id},scholar_no.eq.${id}`).then(({ error }) => {
      if (error) console.warn("Supabase updateVerificationStatus error:", error);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("studentEnrollmentUpdated", { detail: { id, status: normalizedStatus, remarks } }));
  }
  synchronizeBatchEnrollmentCounts(targetStudent?.batch || "", updated);
  return updated;
};

export const updateStudentProfileFromStudent = (rollNo, updatedFields) => {
  const { scholarNo, enrollmentNo, abcId, aadhar, rollNumber, ...mutableFields } = updatedFields || {};
  const current = getStudentVerifications();
  let updatedStudent = null;
  let foundMatch = false;
  const updated = current.map(item => {
    if (
      item.rollNumber === rollNo ||
      item.scholarNo === rollNo ||
      item.enrollmentNo === rollNo ||
      item.id === rollNo ||
      (item.loginUsername && item.loginUsername === rollNo)
    ) {
      foundMatch = true;
      updatedStudent = {
        ...item,
        ...mutableFields,
        photoPreviews: mutableFields.photoPreviews || item.photoPreviews,
        documents: mutableFields.documents || item.documents,
        status: "Submitted",
        remarks: "Profile updated and submitted by student for Admissions verification."
      };
      return updatedStudent;
    }
    return item;
  });
  const finalRows = foundMatch ? updated : [
    {
      id: rollNo || mutableFields.id || `APP-${Date.now()}`,
      rollNumber: rollNumber || scholarNo || rollNo || "",
      scholarNo: scholarNo || rollNumber || rollNo || "",
      enrollmentNo: enrollmentNo || "",
      abcId: abcId || "",
      aadhar: aadhar || "",
      ...mutableFields,
      photoPreviews: mutableFields.photoPreviews || {},
      documents: mutableFields.documents || [],
      status: "Submitted",
      remarks: "Profile updated and submitted by student for Admissions verification."
    },
    ...current
  ];
  if (!foundMatch) updatedStudent = finalRows[0];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(finalRows));
    } catch (e) {
      console.error(e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    const databaseFields = toStudentDatabaseFields({
      ...mutableFields,
      status: "Submitted",
      remarks: "Profile updated and submitted by student for Admissions verification."
    });
    databaseFields.profile_data = toStudentProfileData(mutableFields);
    supabase.from("students").update({
      ...databaseFields
    }).or(`roll_number.eq.${rollNo},scholar_no.eq.${rollNo},enrollment_no.eq.${rollNo},id.eq.${rollNo}`).then(({ error }) => {
      if (error) console.warn("Supabase updateStudentProfileFromStudent error:", error);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("studentEnrollmentUpdated", { detail: { rollNo, status: "Submitted", student: updatedStudent, action: "profile-submit" } }));
    window.dispatchEvent(new CustomEvent("activeStudentProfileUpdated", { detail: { rollNo, student: updatedStudent } }));
    window.dispatchEvent(new CustomEvent("storage", { detail: { key: VERIFICATIONS_KEY } }));
  }
  synchronizeBatchEnrollmentCounts("", finalRows);
  return finalRows;
};

export const updateStudentMedia = (studentId, photoPreviews) => {
  const current = getStudentVerifications();
  const updated = current.map((item) => (
    item.id === studentId ||
    item.rollNumber === studentId ||
    item.scholarNo === studentId ||
    item.enrollmentNo === studentId ||
    (item.loginUsername && item.loginUsername === studentId)
      ? { ...item, photoPreviews }
      : item
  ));

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    supabase.from("students").update({ photo_previews: photoPreviews })
      .or(`id.eq.${studentId},roll_number.eq.${studentId},scholar_no.eq.${studentId},enrollment_no.eq.${studentId}`)
      .then(({ error }) => {
        if (error) console.warn("Supabase updateStudentMedia error:", error);
      });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("studentEnrollmentUpdated", { detail: { studentId, action: "media-update", photoPreviews } }));
    window.dispatchEvent(new CustomEvent("storage", { detail: { key: VERIFICATIONS_KEY } }));
  }
  return updated;
};

// ── Bulk promote all students in a batch to next semester ──
export const promoteBatchStudents = (batchName, newSemester, newSession = "") => {
  const current = getStudentVerifications();
  const updated = current.map(item => {
    if (item.batch === batchName || item.batch?.toLowerCase() === batchName?.toLowerCase()) {
      const nextSession = newSession || getPromotionAcademicSession(item.session || item.academicSession || item.admissionSession || "", item.semester, newSemester);
      return {
        ...item,
        admissionSession: item.admissionSession || item.session || item.academicSession || "",
        session: nextSession || item.session || "",
        academicSession: nextSession || item.academicSession || item.session || "",
        semester: newSemester
      };
    }
    return item;
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    const updateFields = { semester: newSemester };
    if (newSession) updateFields.session = newSession;
    supabase.from("students").update(updateFields).eq("batch", batchName).then(({ error }) => {
      if (error) console.warn("Supabase promoteBatchStudents error:", error);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("studentEnrollmentUpdated", { detail: { batchName, newSemester, newSession } }));
  }
  return updated;
};

// ── Admin Edit & Delete Student Functions ──
export const updateStudentFromAdmin = (studentId, updatedFields) => {
  const current = getStudentVerifications();
  const updated = current.map(item => {
    if (item.id === studentId || item.rollNumber === studentId || item.scholarNo === studentId) {
      return {
        ...item,
        ...updatedFields
      };
    }
    return item;
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    const databaseFields = toStudentDatabaseFields(updatedFields);
    supabase.from("students").update(databaseFields).or(`id.eq.${studentId},roll_number.eq.${studentId}`).then(({ error }) => {
      if (error) console.warn("Supabase updateStudentFromAdmin error:", error);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("studentEnrollmentUpdated", { detail: { studentId, action: "update" } }));
  }
  synchronizeBatchEnrollmentCounts("", updated);
  return updated;
};

export const deleteStudentFromAdmin = (studentId) => {
  const current = getStudentVerifications();
  const deletedStudent = current.find(item => item.id === studentId || item.rollNumber === studentId || item.scholarNo === studentId);
  const updated = current.filter(item => item.id !== studentId && item.rollNumber !== studentId && item.scholarNo !== studentId);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    supabase.from("students").delete().or(`id.eq.${studentId},roll_number.eq.${studentId}`).then(({ error }) => {
      if (error) console.warn("Supabase deleteStudentFromAdmin error:", error);
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("studentEnrollmentUpdated", { detail: { studentId, action: "delete" } }));
  }
  synchronizeBatchEnrollmentCounts(deletedStudent?.batch || "", updated);
  return updated;
};
