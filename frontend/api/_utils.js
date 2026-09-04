const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceRoleKey) {
    const error = new Error("Supabase service role or URL is not configured on server.");
    error.status = 500;
    throw error;
  }

  return { supabaseUrl: supabaseUrl.replace(/\/$/, ""), serviceRoleKey };
};

export const requestSupabase = async (path, options = {}) => {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();

  const response = await fetch(`${supabaseUrl}${path}`, {
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
    const error = new Error(`${response.status} ${response.statusText}: ${message}`);
    error.status = response.status;
    throw error;
  }
  return data;
};

export const getRequester = async (accessToken) => {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const text = await response.text();
  const user = text ? JSON.parse(text) : null;
  if (!response.ok || !user?.id) {
    const error = new Error("Valid Supabase staff login is required.");
    error.status = 401;
    throw error;
  }
  return user;
};

export const requireRole = async (req, allowedRoles = []) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = String(authHeader).replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    const error = new Error("Missing Supabase session token.");
    error.status = 401;
    throw error;
  }

  const requester = await getRequester(token);
  const profileRows = await requestSupabase(
    `/rest/v1/erp_user_profiles?select=role,status&auth_user_id=eq.${requester.id}&limit=1`
  );
  const profile = profileRows?.[0];
  if (!profile || profile.status !== "active" || !allowedRoles.includes(profile.role)) {
    const error = new Error(`Access restricted to roles: ${allowedRoles.join(", ")}`);
    error.status = 403;
    throw error;
  }
  return { requester, profile };
};

export const findAuthUserByEmail = async (email) => {
  const data = await requestSupabase("/auth/v1/admin/users?per_page=1000");
  return data?.users?.find((user) => user.email?.toLowerCase() === email.toLowerCase()) || null;
};

export const createOrUpdateStudentUser = async ({ scholarNo, studentName, email }) => {
  const cleanScholarNo = String(scholarNo || "").trim();
  if (!/^[A-Za-z0-9_-]{4,32}$/.test(cleanScholarNo)) {
    const error = new Error("Valid Scholar No is required for student login.");
    error.status = 400;
    throw error;
  }

  const authEmail = `${cleanScholarNo.toLowerCase()}@students.sarvadnya.erp`;
  const displayName = String(studentName || "").trim() || `Student ${cleanScholarNo}`;
  const existing = await findAuthUserByEmail(authEmail);
  const metadata = {
    display_name: displayName,
    erp_role: "student",
    student_identifier: cleanScholarNo,
    contact_email: email || null,
  };

  const authUserId = existing
    ? (
        await requestSupabase(`/auth/v1/admin/users/${existing.id}`, {
          method: "PUT",
          body: JSON.stringify({
            email: authEmail,
            password: cleanScholarNo,
            email_confirm: true,
            user_metadata: metadata,
          }),
        })
      ).id
    : (
        await requestSupabase("/auth/v1/admin/users", {
          method: "POST",
          body: JSON.stringify({
            email: authEmail,
            password: cleanScholarNo,
            email_confirm: true,
            user_metadata: metadata,
          }),
        })
      ).id;

  await requestSupabase("/rest/v1/erp_user_profiles?on_conflict=auth_user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      auth_user_id: authUserId,
      email: authEmail,
      role: "student",
      role_name: "Student",
      display_name: displayName,
      student_identifier: cleanScholarNo,
      status: "active",
      updated_at: new Date().toISOString(),
    }),
  });

  return { authUserId, authEmail, scholarNo: cleanScholarNo };
};

const roleNameMap = {
  admin: "Institutional Administrator",
  admission: "Admissions & Enrollment Officer",
  fee: "Accounts & Cash Officer",
  hod: "Head of Department",
  teacher: "Faculty / Staff",
};

export const createOrUpdateStaffUser = async ({ name, email, role, password }) => {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanName = String(name || "").trim();
  const cleanRole = String(role || "").trim().toLowerCase();
  const cleanPassword = String(password || "").trim();

  if (!cleanName) {
    const error = new Error("Staff member name is required.");
    error.status = 400;
    throw error;
  }
  if (!cleanEmail || !cleanEmail.includes("@")) {
    const error = new Error("A valid staff email is required.");
    error.status = 400;
    throw error;
  }
  if (!["admin", "admission", "fee", "hod", "teacher"].includes(cleanRole)) {
    const error = new Error("A valid staff role is required.");
    error.status = 400;
    throw error;
  }
  if (!cleanPassword || cleanPassword.length < 8) {
    const error = new Error("Staff password must be at least 8 characters.");
    error.status = 400;
    throw error;
  }

  const existing = await findAuthUserByEmail(cleanEmail);
  const metadata = {
    display_name: cleanName,
    erp_role: cleanRole,
  };

  const authUserId = existing
    ? (
        await requestSupabase(`/auth/v1/admin/users/${existing.id}`, {
          method: "PUT",
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
            email_confirm: true,
            user_metadata: metadata,
          }),
        })
      ).id
    : (
        await requestSupabase("/auth/v1/admin/users", {
          method: "POST",
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
            email_confirm: true,
            user_metadata: metadata,
          }),
        })
      ).id;

  await requestSupabase("/rest/v1/erp_user_profiles?on_conflict=auth_user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      auth_user_id: authUserId,
      email: cleanEmail,
      role: cleanRole,
      role_name: roleNameMap[cleanRole] || "Staff Member",
      display_name: cleanName,
      student_identifier: null,
      status: "active",
      updated_at: new Date().toISOString(),
    }),
  });

  return {
    id: authUserId,
    email: cleanEmail,
    name: cleanName,
    role: cleanRole,
    roleName: roleNameMap[cleanRole] || "Staff Member",
  };
};

export const updateStaffPassword = async ({ email, password }) => {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "").trim();
  if (!cleanEmail || !cleanPassword || cleanPassword.length < 8) {
    const error = new Error("Valid staff email and minimum 8 character password are required.");
    error.status = 400;
    throw error;
  }

  const existing = await findAuthUserByEmail(cleanEmail);
  if (!existing) {
    const error = new Error("Staff Auth user not found.");
    error.status = 404;
    throw error;
  }

  await requestSupabase(`/auth/v1/admin/users/${existing.id}`, {
    method: "PUT",
    body: JSON.stringify({ password: cleanPassword }),
  });
  return { email: cleanEmail };
};

export const deactivateStaffUser = async ({ email }) => {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) {
    const error = new Error("Staff email is required.");
    error.status = 400;
    throw error;
  }
  if (cleanEmail === "admin@sarvadnya.erp") {
    const error = new Error("Primary admin account cannot be removed.");
    error.status = 400;
    throw error;
  }

  const existing = await findAuthUserByEmail(cleanEmail);
  if (existing) {
    await requestSupabase(`/auth/v1/admin/users/${existing.id}`, { method: "DELETE" });
  }

  await requestSupabase(`/rest/v1/erp_user_profiles?email=eq.${encodeURIComponent(cleanEmail)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      status: "inactive",
      updated_at: new Date().toISOString(),
    }),
  });

  return { email: cleanEmail };
};
