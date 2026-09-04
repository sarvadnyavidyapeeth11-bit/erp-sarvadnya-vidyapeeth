import { isSupabaseConfigured, supabase } from "./supabaseClient";

const backendUrl = (import.meta.env.VITE_ERP_BACKEND_URL || "").replace(/\/$/, "");

const getAccessToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || "";
};

const authedRequest = async (path, options = {}) => {
  if (!isSupabaseConfigured || !supabase) return { success: false, skipped: true };

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { success: false, message: "Admission login session is required." };
  }

  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      message: result.message || "ERP backend request failed.",
    };
  }

  return { success: true, ...result };
};

export const createStudentAuthUser = async (student) => {
  const scholarNo = String(student?.scholarNo || student?.rollNumber || "").trim();
  if (!scholarNo) return { success: false, skipped: true };

  return authedRequest("/api/auth/student", {
    method: "POST",
    body: JSON.stringify({
      scholarNo,
      studentName: student.studentName,
      email: student.email || "",
    }),
  });
};

export const createStaffAuthUser = async ({ name, email, role, password }) => (
  authedRequest("/api/auth/staff", {
    method: "POST",
    body: JSON.stringify({ name, email, role, password }),
  })
);

export const updateStaffAuthPassword = async ({ email, password }) => (
  authedRequest("/api/auth/staff/password", {
    method: "PATCH",
    body: JSON.stringify({ email, password }),
  })
);

export const deleteStaffAuthUser = async ({ email }) => (
  authedRequest("/api/auth/staff", {
    method: "DELETE",
    body: JSON.stringify({ email }),
  })
);
