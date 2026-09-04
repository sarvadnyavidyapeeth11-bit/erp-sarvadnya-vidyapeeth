import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const loadLocalEnv = () => {
  const envPaths = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../frontend/.env"),
  ];

  for (const envPath of envPaths) {
    if (!existsSync(envPath)) continue;

    const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...valueParts] = trimmed.split("=");
      if (!process.env[key]) {
        process.env[key] = valueParts.join("=").trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }
};

loadLocalEnv();

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const staffPassword = process.env.ERP_STAFF_AUTH_PASSWORD || process.env.ERP_DEFAULT_AUTH_PASSWORD || "";

const users = [
  {
    email: "admin@sarvadnya.erp",
    role: "admin",
    roleName: "Institutional Administrator",
    displayName: "Central Academic Administrator",
    password: staffPassword,
  },
  {
    email: "admission@sarvadnya.erp",
    role: "admission",
    roleName: "Admissions & Enrollment Officer",
    displayName: "Admissions Desk Officer",
    password: staffPassword,
  },
  {
    email: "fee@sarvadnya.erp",
    role: "fee",
    roleName: "Accounts & Cash Officer",
    displayName: "Fee Accounts Officer",
    password: staffPassword,
  },
];

const manualStudentUsers = (process.env.ERP_STUDENT_IDS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .map((studentId) => ({
    email: `${studentId.toLowerCase()}@students.sarvadnya.erp`,
    role: "student",
    roleName: "Student",
    displayName: `Student ${studentId}`,
    studentIdentifier: studentId,
    password: studentId,
  }));

const assertEnv = () => {
  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL.");
  }
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }
  if (!staffPassword || staffPassword.length < 8) {
    throw new Error("Missing ERP_STAFF_AUTH_PASSWORD with minimum 8 characters.");
  }
};

const request = async (path, options = {}) => {
  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.msg || data?.message || text || response.statusText;
    throw new Error(`${response.status} ${response.statusText}: ${message}`);
  }
  return data;
};

const findUserByEmail = async (email) => {
  const data = await request(`/auth/v1/admin/users?per_page=1000`);
  return data?.users?.find((user) => user.email?.toLowerCase() === email.toLowerCase()) || null;
};

const fetchStudentUsersFromDatabase = async () => {
  const data = await request(
    `/rest/v1/students?select=roll_number,scholar_no,enrollment_no,student_name,email,status&order=created_at.desc`
  );

  return (Array.isArray(data) ? data : [])
    .map((student) => {
      const scholarNo = String(student.scholar_no || student.roll_number || "").trim();
      if (!scholarNo) return null;
      return {
        email: `${scholarNo.toLowerCase()}@students.sarvadnya.erp`,
        role: "student",
        roleName: "Student",
        displayName: student.student_name || `Student ${scholarNo}`,
        studentIdentifier: scholarNo,
        password: scholarNo,
      };
    })
    .filter(Boolean);
};

const createOrUpdateAuthUser = async (user) => {
  const existing = await findUserByEmail(user.email);
  if (existing) {
    await request(`/auth/v1/admin/users/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          display_name: user.displayName,
          erp_role: user.role,
          student_identifier: user.studentIdentifier || null,
        },
      }),
    });
    return existing.id;
  }

  const created = await request(`/auth/v1/admin/users`, {
    method: "POST",
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        display_name: user.displayName,
        erp_role: user.role,
        student_identifier: user.studentIdentifier || null,
      },
    }),
  });
  return created.id;
};

const upsertProfile = async (authUserId, user) => {
  await request(`/rest/v1/erp_user_profiles?on_conflict=auth_user_id`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      auth_user_id: authUserId,
      email: user.email,
      role: user.role,
      role_name: user.roleName,
      display_name: user.displayName,
      student_identifier: user.studentIdentifier || null,
      status: "active",
      updated_at: new Date().toISOString(),
    }),
  });
};

const main = async () => {
  assertEnv();
  const dbStudentUsers =
    process.env.ERP_SYNC_STUDENTS_FROM_DB === "false" ? [] : await fetchStudentUsersFromDatabase();
  const studentUsersByEmail = new Map(
    [...dbStudentUsers, ...manualStudentUsers].map((user) => [user.email, user])
  );
  const allUsers = [...users, ...studentUsersByEmail.values()];

  for (const user of allUsers) {
    const authUserId = await createOrUpdateAuthUser(user);
    await upsertProfile(authUserId, user);
    console.log(`OK ${user.email} -> ${user.role}`);
  }

  console.log(`Created/updated ${allUsers.length} ERP Auth users.`);
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
