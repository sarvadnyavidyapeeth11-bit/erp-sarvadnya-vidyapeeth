import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

// ─── Unified Master Academic Data Engine ──────────────────────────────
// Stores Departments, Courses, Batches, Subjects, and Faculty Allocations
// Fully persistent with localStorage and synchronized with Supabase Cloud DB.

const DEPARTMENTS_KEY = "erp_master_departments";
const COURSES_KEY = "erp_master_courses";
const BATCHES_KEY = "erp_master_batches";
const SUBJECTS_KEY = "erp_master_subjects";
const ALLOCATIONS_KEY = "erp_master_faculty_allocations";
const ATTENDANCE_SHORTAGE_KEY = "erp_attendance_shortage";
const TIMETABLE_ENTRIES_KEY = "erp_timetable_entries";
const TIMETABLE_APPROVALS_KEY = "erp_timetable_approvals";
const STUDENTS_KEY = "erp_admin_verifications";

// ── 1. Clean Initial Data Arrays (Pure Database Driven) ──
const defaultDepartments = [];
const defaultCourses = [];
const defaultBatches = [];
const defaultSubjects = [];

const normalizeRelation = (value) => String(value || "").trim().toLowerCase();

const readStoredArray = (key) => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const nextMasterId = (items, prefix) => {
  const highest = (items || []).reduce((max, item) => {
    const match = String(item.id || "").match(new RegExp(`^${prefix}(\\d+)$`, "i"));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(3, "0")}`;
};

const notifyStudentUpdate = (type, payload) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("studentEnrollmentUpdated", { detail: { type, payload } }));
  }
};

const persistRelationshipChanges = (key, rows, eventType) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(rows));
  if (key === STUDENTS_KEY) notifyStudentUpdate(eventType, rows);
};

export const getDepartmentDependencies = (department) => {
  const name = normalizeRelation(department?.name);
  const code = normalizeRelation(department?.code);
  const matches = (row) => (
    (name && normalizeRelation(row.department) === name) ||
    (code && normalizeRelation(row.departmentCode) === code)
  );
  return {
    courses: getCourses().filter(matches).length,
    batches: getBatches().filter(matches).length,
    students: readStoredArray(STUDENTS_KEY).filter(matches).length
  };
};

export const getCourseDependencies = (course) => {
  const name = normalizeRelation(course?.name);
  const code = normalizeRelation(course?.code);
  const matches = (row) => (
    (name && normalizeRelation(row.course) === name) ||
    (code && normalizeRelation(row.courseCode) === code)
  );
  return {
    batches: getBatches().filter(matches).length,
    students: readStoredArray(STUDENTS_KEY).filter(matches).length
  };
};

export const getBatchDependencies = (batch) => {
  const name = normalizeRelation(batch?.batchName);
  return {
    students: readStoredArray(STUDENTS_KEY)
      .filter((student) => name && normalizeRelation(student.batch) === name)
      .length
  };
};

export const getAttendanceShortage = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(ATTENDANCE_SHORTAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
};

export const markAttendanceWarning = (id) => {
  const updated = getAttendanceShortage().map((row) =>
    row.id === id ? { ...row, warningSent: true } : row
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(ATTENDANCE_SHORTAGE_KEY, JSON.stringify(updated));
    notifyAcademicUpdate("attendance_warning", { id });
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("attendance_shortage").update({ warning_sent: true }).eq("id", id)
      .then(({ error }) => { if (error) console.warn("Attendance warning update error:", error); });
  }
  return updated;
};

// Helper to broadcast cross-portal update event
const notifyAcademicUpdate = (type, payload) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("academicDataUpdated", { detail: { type, payload } }));
  }
};

// ── Department CRUD ──
const getSessionStartYear = (session = "") => {
  const match = String(session || "").match(/20\d{2}/);
  return match ? Number(match[0]) : 0;
};

const getLatestAcademicSession = (sessions = []) => {
  const uniqueSessions = Array.from(new Set(sessions.filter(Boolean)));
  return uniqueSessions.sort((a, b) => getSessionStartYear(b) - getSessionStartYear(a))[0] || "";
};

const getDepartmentAcademicYear = (department = "", deptCode = "") => {
  const departmentKey = normalizeRelation(department);
  const deptCodeKey = normalizeRelation(deptCode);
  const departmentBatches = getBatches().filter((batch) => {
    const values = [batch.department, batch.departmentCode, batch.courseCode]
      .filter(Boolean)
      .map(normalizeRelation);
    return [departmentKey, deptCodeKey].filter(Boolean).some((value) => values.includes(value));
  });
  const activeBatches = departmentBatches.filter((batch) => normalizeRelation(batch.status || "Active") === "active");
  const sessionSource = activeBatches.length ? activeBatches : departmentBatches;
  return getLatestAcademicSession(sessionSource.map((batch) => batch.academicSession || batch.session));
};

export const getDepartments = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(DEPARTMENTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return defaultDepartments;
};

export const saveDepartment = (dept) => {
  const current = getDepartments();
  const previousDept = dept.id ? current.find((item) => item.id === dept.id) : null;
  let updated;
  let targetDept;
  if (dept.id) {
    targetDept = { ...dept };
    updated = current.map(d => d.id === dept.id ? { ...d, ...dept } : d);
  } else {
    targetDept = {
      ...dept,
      id: nextMasterId(current, "DEPT"),
      status: dept.status || "Active"
    };
    updated = [...current, targetDept];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(updated));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("departments").upsert({
      id: targetDept.id,
      name: targetDept.name,
      code: targetDept.code,
      hod_name: targetDept.hodName,
      hod_email: targetDept.hodEmail,
      hod_phone: targetDept.hodPhone,
      building_block: targetDept.buildingBlock,
      established_year: targetDept.establishedYear,
      description: targetDept.description,
      status: targetDept.status || "Active"
    }).then(({ error }) => {
      if (error) console.warn("Supabase saveDepartment error:", error);
    });
  }

  if (previousDept) {
    const previousName = normalizeRelation(previousDept.name);
    const previousCode = normalizeRelation(previousDept.code);
    const relationChanged = previousName !== normalizeRelation(targetDept.name) || previousCode !== normalizeRelation(targetDept.code);
    if (relationChanged) {
      const updateDepartment = (row) => {
        const matches = normalizeRelation(row.department) === previousName || normalizeRelation(row.departmentCode) === previousCode;
        return matches ? { ...row, department: targetDept.name, departmentCode: targetDept.code } : row;
      };
      const courses = getCourses().map(updateDepartment);
      const batches = getBatches().map(updateDepartment);
      const students = readStoredArray(STUDENTS_KEY).map(updateDepartment);
      persistRelationshipChanges(COURSES_KEY, courses, "department_renamed");
      persistRelationshipChanges(BATCHES_KEY, batches, "department_renamed");
      persistRelationshipChanges(STUDENTS_KEY, students, "department_renamed");

      if (isSupabaseConfigured && supabase) {
        supabase.from("courses").update({ department: targetDept.name }).eq("department", previousDept.name)
          .then(({ error }) => { if (error) console.warn("Department course cascade error:", error); });
        supabase.from("batches").update({ department: targetDept.name }).eq("department", previousDept.name)
          .then(({ error }) => { if (error) console.warn("Department batch cascade error:", error); });
        supabase.from("students").update({ department: targetDept.name }).eq("department", previousDept.name)
          .then(({ error }) => { if (error) console.warn("Department student cascade error:", error); });
      }
    }
  }
  notifyAcademicUpdate("department", updated);
  return updated;
};

export const deleteDepartment = (id) => {
  const departments = getDepartments();
  const target = departments.find((department) => department.id === id);
  const dependencies = getDepartmentDependencies(target);
  if (dependencies.courses || dependencies.batches || dependencies.students) return departments;
  const current = departments.filter(d => d.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(current));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("departments").delete().eq("id", id).then(({ error }) => {
      if (error) console.warn("Supabase deleteDepartment error:", error);
    });
  }
  notifyAcademicUpdate("department", current);
  return current;
};

// ── Courses CRUD ──
export const getCourses = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(COURSES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return defaultCourses;
};

export const saveCourse = (course) => {
  const current = getCourses();
  const previousCourse = course.id ? current.find((item) => item.id === course.id) : null;
  let updated;
  let targetCourse;
  if (course.id) {
    targetCourse = { ...course };
    updated = current.map(c => c.id === course.id ? { ...c, ...course } : c);
  } else {
    targetCourse = {
      ...course,
      id: nextMasterId(current, "CRS"),
      status: course.status || "Active"
    };
    updated = [...current, targetCourse];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(COURSES_KEY, JSON.stringify(updated));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("courses").upsert({
      id: targetCourse.id,
      name: targetCourse.name,
      code: targetCourse.code,
      department: targetCourse.department,
      degree_level: targetCourse.degreeLevel,
      duration_years: targetCourse.durationYears,
      total_semesters: targetCourse.totalSemesters,
      annual_fee: targetCourse.annualFee,
      intake_capacity: targetCourse.intakeCapacity,
      affiliated_university: targetCourse.affiliatedUniversity,
      syllabus_revision: targetCourse.syllabusRevision,
      status: targetCourse.status || "Active"
    }).then(({ error }) => {
      if (error) console.warn("Supabase saveCourse error:", error);
    });
  }

  if (previousCourse) {
    const previousName = normalizeRelation(previousCourse.name);
    const previousCode = normalizeRelation(previousCourse.code);
    const relationChanged = previousName !== normalizeRelation(targetCourse.name) ||
      previousCode !== normalizeRelation(targetCourse.code) ||
      normalizeRelation(previousCourse.department) !== normalizeRelation(targetCourse.department);
    if (relationChanged) {
      const updateCourse = (row) => {
        const matches = normalizeRelation(row.course) === previousName || normalizeRelation(row.courseCode) === previousCode;
        return matches ? {
          ...row,
          course: targetCourse.name,
          courseCode: targetCourse.code,
          department: targetCourse.department
        } : row;
      };
      const batches = getBatches().map(updateCourse);
      const students = readStoredArray(STUDENTS_KEY).map(updateCourse);
      persistRelationshipChanges(BATCHES_KEY, batches, "course_updated");
      persistRelationshipChanges(STUDENTS_KEY, students, "course_updated");

      if (isSupabaseConfigured && supabase) {
        const batchCascade = supabase.from("batches").update({
          course: targetCourse.name,
          course_code: targetCourse.code,
          department: targetCourse.department
        });
        (previousCourse.code
          ? batchCascade.eq("course_code", previousCourse.code)
          : batchCascade.eq("course", previousCourse.name))
          .then(({ error }) => { if (error) console.warn("Course batch cascade error:", error); });

        const studentCascade = supabase.from("students").update({
          course: targetCourse.name,
          course_code: targetCourse.code,
          department: targetCourse.department
        });
        (previousCourse.code
          ? studentCascade.eq("course_code", previousCourse.code)
          : studentCascade.eq("course", previousCourse.name))
          .then(({ error }) => { if (error) console.warn("Course student cascade error:", error); });
      }
    }
  }
  notifyAcademicUpdate("course", updated);
  return updated;
};

export const deleteCourse = (id) => {
  const courses = getCourses();
  const target = courses.find((course) => course.id === id);
  const dependencies = getCourseDependencies(target);
  if (dependencies.batches || dependencies.students) return courses;
  const current = courses.filter(c => c.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(COURSES_KEY, JSON.stringify(current));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("courses").delete().eq("id", id).then(({ error }) => {
      if (error) console.warn("Supabase deleteCourse error:", error);
    });
  }
  notifyAcademicUpdate("course", current);
  return current;
};

// ── Batches CRUD ──
export const getBatches = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(BATCHES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return defaultBatches;
};

export const saveBatch = (batch) => {
  const current = getBatches();
  const previousBatch = batch.id ? current.find((item) => item.id === batch.id) : null;
  let updated;
  let targetBatch;
  if (batch.id) {
    targetBatch = { ...batch };
    updated = current.map(b => b.id === batch.id ? { ...b, ...batch } : b);
  } else {
    targetBatch = {
      ...batch,
      id: nextMasterId(current, "BAT"),
      status: batch.status || "Active"
    };
    updated = [...current, targetBatch];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(BATCHES_KEY, JSON.stringify(updated));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("batches").upsert({
      id: targetBatch.id,
      batch_name: targetBatch.batchName,
      course: targetBatch.course,
      course_code: targetBatch.courseCode,
      department: targetBatch.department,
      academic_session: targetBatch.academicSession,
      current_semester: targetBatch.currentSemester,
      year: targetBatch.year,
      section: targetBatch.section,
      class_coordinator: targetBatch.classCoordinator,
      classroom: targetBatch.classroom,
      capacity: targetBatch.capacity,
      enrolled_count: targetBatch.enrolledCount,
      status: targetBatch.status || "Active"
    }).then(({ error }) => {
      if (error) console.warn("Supabase saveBatch error:", error);
    });
  }

  if (previousBatch) {
    const previousName = normalizeRelation(previousBatch.batchName);
    const students = readStoredArray(STUDENTS_KEY);
    let studentsChanged = false;
    const updatedStudents = students.map((student) => {
      if (normalizeRelation(student.batch) !== previousName) return student;
      studentsChanged = true;
      return {
        ...student,
        admissionSession: student.admissionSession || student.session || student.academicSession || targetBatch.academicSession,
        batch: targetBatch.batchName,
        session: targetBatch.academicSession,
        academicSession: targetBatch.academicSession,
        semester: targetBatch.currentSemester,
        section: targetBatch.section,
        course: targetBatch.course,
        courseCode: targetBatch.courseCode,
        department: targetBatch.department
      };
    });
    if (studentsChanged) {
      persistRelationshipChanges(STUDENTS_KEY, updatedStudents, "batch_updated");
      if (isSupabaseConfigured && supabase) {
        supabase.from("students").update({
          batch: targetBatch.batchName,
          session: targetBatch.academicSession,
          semester: targetBatch.currentSemester,
          section: targetBatch.section,
          course: targetBatch.course,
          course_code: targetBatch.courseCode,
          department: targetBatch.department
        }).eq("batch", previousBatch.batchName)
          .then(({ error }) => { if (error) console.warn("Batch student cascade error:", error); });
      }
    }
  }
  notifyAcademicUpdate("batch", updated);
  return updated;
};

export const deleteBatch = (id) => {
  const batches = getBatches();
  const target = batches.find((batch) => batch.id === id);
  const dependencies = getBatchDependencies(target);
  if (dependencies.students) return batches;
  const current = batches.filter(b => b.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(BATCHES_KEY, JSON.stringify(current));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("batches").delete().eq("id", id).then(({ error }) => {
      if (error) console.warn("Supabase deleteBatch error:", error);
    });
  }
  notifyAcademicUpdate("batch", current);
  return current;
};

// ── Subjects & Faculty Allocation CRUD ──
export const getSubjects = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SUBJECTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return defaultSubjects;
};

export const saveSubject = (subject) => {
  const current = getSubjects();
  let updated;
  let targetSubject;
  if (subject.id) {
    targetSubject = { ...subject };
    updated = current.map(s => s.id === subject.id ? { ...s, ...subject } : s);
  } else {
    targetSubject = {
      ...subject,
      id: `SUB-${Date.now()}`
    };
    updated = [...current, targetSubject];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("faculty_allocations").upsert({
      id: targetSubject.id,
      code: targetSubject.code,
      name: targetSubject.name,
      short_name: targetSubject.shortName,
      course_code: targetSubject.courseCode,
      semester: targetSubject.semester,
      type: targetSubject.type,
      credits: Number(targetSubject.credits) || 0,
      total_lectures: Number(targetSubject.totalLectures) || 0,
      assigned_faculty_name: targetSubject.assignedFacultyName,
      department: targetSubject.department
    }).then(({ error }) => {
      if (error) console.warn("Supabase saveSubject error:", error);
    });
  }
  notifyAcademicUpdate("subject", updated);
  return updated;
};

export const deleteSubject = (id) => {
  const current = getSubjects().filter(s => s.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(current));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("faculty_allocations").delete().eq("id", id).then(({ error }) => {
      if (error) console.warn("Supabase deleteSubject error:", error);
    });
  }
  notifyAcademicUpdate("subject", current);
  return current;
};

export const assignFacultyToSubject = (subjectId, facultyId, facultyName) => {
  const current = getSubjects();
  const updated = current.map(s => {
    if (s.id === subjectId) {
      return {
        ...s,
        assignedFacultyId: facultyId,
        assignedFacultyName: facultyName
      };
    }
    return s;
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(updated));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("faculty_allocations").update({ assigned_faculty_name: facultyName })
      .eq("id", subjectId).then(({ error }) => {
        if (error) console.warn("Supabase assignFacultyToSubject error:", error);
      });
  }
  notifyAcademicUpdate("subject_faculty_assigned", { subjectId, facultyId, facultyName });
  return updated;
};

// ── 2. Faculty Management Store ──
const FACULTY_KEY = "erp_master_faculty";
const defaultFaculty = [];

export const getFacultyMembers = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(FACULTY_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return defaultFaculty;
};

export const saveFacultyMember = (faculty) => {
  const current = getFacultyMembers();
  let updated;
  if (faculty.id) {
    updated = current.map(f => f.id === faculty.id ? { ...f, ...faculty } : f);
  } else {
    const newFaculty = {
      ...faculty,
      id: `FAC0${current.length + 1}`
    };
    updated = [...current, newFaculty];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(FACULTY_KEY, JSON.stringify(updated));
  }
  notifyAcademicUpdate("faculty", updated);
  return updated;
};

// ── 3. Faculty Leaves Store ──
const LEAVES_KEY = "erp_faculty_leaves";
const defaultLeaves = [];

export const getFacultyLeaveRequests = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LEAVES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return defaultLeaves;
};

export const saveFacultyLeaveRequest = (leave) => {
  const current = getFacultyLeaveRequests();
  const newEntry = {
    ...leave,
    id: leave.id || `LEV-${Date.now()}`,
    appliedOn: leave.appliedOn || new Date().toISOString().split("T")[0],
    status: leave.status || "Pending"
  };
  const updated = [newEntry, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(LEAVES_KEY, JSON.stringify(updated));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("faculty_leaves").upsert({
      id: newEntry.id,
      faculty_name: newEntry.facultyName,
      designation: newEntry.designation,
      leave_type: newEntry.leaveType,
      from_date: newEntry.fromDate,
      to_date: newEntry.toDate,
      total_days: Number(newEntry.totalDays) || 0,
      reason: newEntry.reason,
      substitute_assigned: newEntry.substituteAssigned,
      status: newEntry.status,
      applied_on: newEntry.appliedOn
    }).then(({ error }) => {
      if (error) console.warn("Supabase saveFacultyLeaveRequest error:", error);
    });
  }
  notifyAcademicUpdate("faculty_leave", updated);
  return updated;
};

export const updateFacultyLeaveStatus = (id, newStatus) => {
  const current = getFacultyLeaveRequests();
  const updated = current.map(l => l.id === id ? { ...l, status: newStatus } : l);
  if (typeof window !== "undefined") {
    localStorage.setItem(LEAVES_KEY, JSON.stringify(updated));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("faculty_leaves").update({ status: newStatus }).eq("id", id)
      .then(({ error }) => {
        if (error) console.warn("Supabase updateFacultyLeaveStatus error:", error);
      });
  }
  notifyAcademicUpdate("faculty_leave_status", { id, status: newStatus });
  return updated;
};

// ── 4. Internal Marks Lock Store ──
const MARKS_KEY = "erp_internal_marks_sheets";

export const getInternalMarksList = (courseCode = "") => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(MARKS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return [];
};

export const lockInternalMarksSheet = (id, subjectCode) => {
  const current = getInternalMarksList();
  const updated = current.map(m => m.id === id ? {
    ...m,
    status: "Locked & Verified",
    lockedOn: new Date().toLocaleDateString("en-GB")
  } : m);
  if (typeof window !== "undefined") {
    localStorage.setItem(MARKS_KEY, JSON.stringify(updated));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("internal_marks").update({
      status: "Locked & Verified",
      locked_on: new Date().toLocaleDateString("en-GB")
    }).eq("id", id).then(({ error }) => {
      if (error) console.warn("Supabase lockInternalMarksSheet error:", error);
    });
  }
  notifyAcademicUpdate("marks_locked", { id, subjectCode });
  return updated;
};

// ── 5. Timetable Lock State ──
export const getTimetableEntries = (department = "", batch = "") => readStoredArray(TIMETABLE_ENTRIES_KEY)
  .filter((entry) => (!department || entry.department === department) && (!batch || entry.batch === batch));

export const getTimetableApprovalStatus = (batch = "") => {
  const profile = getActiveHODProfile();
  return readStoredArray(TIMETABLE_APPROVALS_KEY).find((approval) => (
    approval.department === profile.department && (approval.batch || "") === (batch || "")
  )) || { isApproved: false, approvedOn: null, department: profile.department, batch };
};

export const setTimetableApprovalStatus = (approved = true, batch = "") => {
  const profile = getActiveHODProfile();
  if (!profile.department) return { isApproved: false, approvedOn: null };
  const current = readStoredArray(TIMETABLE_APPROVALS_KEY);
  const status = {
    id: `TTA-${profile.deptCode || profile.id}-${batch || "ALL"}`,
    department: profile.department,
    batch,
    isApproved: approved,
    approvedOn: approved ? new Date().toISOString().split("T")[0] : null,
    approvedBy: profile.name || ""
  };
  const updated = [status, ...current.filter((item) => item.id !== status.id)];
  if (typeof window !== "undefined") {
    localStorage.setItem(TIMETABLE_APPROVALS_KEY, JSON.stringify(updated));
  }
  if (isSupabaseConfigured && supabase) {
    supabase.from("timetable_approvals").upsert({
      id: status.id,
      department: status.department,
      batch: status.batch,
      is_approved: status.isApproved,
      approved_on: status.approvedOn,
      approved_by: status.approvedBy
    }).then(({ error }) => {
      if (error) console.warn("Supabase timetable approval error:", error);
    });
  }
  notifyAcademicUpdate("timetable_approved", status);
  return status;
};

// ── 6. Dynamic HOD Profile & Session State ──
export const getActiveHODProfile = () => {
  if (typeof window !== "undefined") {
    try {
      const session = localStorage.getItem("erp_active_hod_session");
      if (session) {
        const parsedSession = JSON.parse(session);
        return {
          ...parsedSession,
          academicYear: getDepartmentAcademicYear(parsedSession.department, parsedSession.deptCode) || parsedSession.academicYear || ""
        };
      }
    } catch (e) {}

    const depts = getDepartments();
    if (depts && depts.length > 0) {
      const first = depts[0];
      return {
        id: `HOD-${first.code || "01"}`,
        name: first.hodName || "Head of Department",
        role: "Head of Department (HOD)",
        designation: "Professor & HOD",
        department: first.name || "Department Academic Suite",
        deptCode: first.code || "DEPT",
        cabin: first.buildingBlock || "Academic Block",
        email: first.hodEmail || "hod@sarvadnya.edu.in",
        phone: first.hodPhone || "",
        academicYear: getDepartmentAcademicYear(first.name, first.code)
      };
    }
  }

  return {
    id: "",
    name: "",
    role: "Head of Department (HOD)",
    designation: "Professor & HOD",
    department: "",
    deptCode: "",
    cabin: "",
    email: "",
    phone: "",
    academicYear: ""
  };
};

export const matchesActiveHODDepartment = (record, profile = getActiveHODProfile()) => {
  if (!record || (!profile.department && !profile.deptCode)) return false;
  const values = [record.department, record.departmentCode, record.courseCode]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());
  return [profile.department, profile.deptCode]
    .filter(Boolean)
    .some((value) => values.includes(String(value).trim().toLowerCase()));
};
