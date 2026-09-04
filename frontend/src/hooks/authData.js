import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import { getStudentVerifications } from "./adminData";

const STAFF_ACCOUNTS_KEY = "erp_staff_accounts";
const USER_PROFILE_TABLE = "erp_user_profiles";
const defaultStaffPassword = import.meta.env.VITE_DEFAULT_STAFF_PASSWORD || "ChangeThisStaffPassword123";
const localAuthFallbackEnabled =
  !isSupabaseConfigured || import.meta.env.VITE_ALLOW_LOCAL_AUTH_FALLBACK === "true";

export const DEFAULT_STAFF_ACCOUNTS = [
  {
    id: "staff-admin-01",
    name: "Central Academic Administrator",
    email: "admin@sarvadnya.erp",
    role: "admin",
    roleName: "Institutional Administrator",
    password: defaultStaffPassword,
    createdAt: "2026-09-04",
    isDefault: true,
  },
  {
    id: "staff-admission-01",
    name: "Admissions Desk Officer",
    email: "admission@sarvadnya.erp",
    role: "admission",
    roleName: "Admissions & Enrollment Officer",
    password: defaultStaffPassword,
    createdAt: "2026-09-04",
    isDefault: true,
  },
  {
    id: "staff-fee-01",
    name: "Fee Accounts Officer",
    email: "fee@sarvadnya.erp",
    role: "fee",
    roleName: "Accounts & Cash Officer",
    password: defaultStaffPassword,
    createdAt: "2026-09-04",
    isDefault: true,
  },
];

export const getStaffAccounts = () => {
  if (typeof window === "undefined") return DEFAULT_STAFF_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STAFF_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(DEFAULT_STAFF_ACCOUNTS));
      return DEFAULT_STAFF_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(DEFAULT_STAFF_ACCOUNTS));
    return DEFAULT_STAFF_ACCOUNTS;
  } catch (err) {
    console.error("Error reading staff accounts:", err);
    return DEFAULT_STAFF_ACCOUNTS;
  }
};

export const saveStaffAccounts = (accounts) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(accounts));
    window.dispatchEvent(new CustomEvent("erpStaffAccountsUpdated", { detail: accounts }));
  } catch (err) {
    console.error("Error saving staff accounts:", err);
  }
};

const normalizeStaffEmail = (identifier) => {
  const clean = String(identifier || "").trim().toLowerCase();
  if (!clean) return "";
  return clean.includes("@") ? clean : `${clean}@sarvadnya.erp`;
};

export const studentLoginEmailFromIdentifier = (identifier) => {
  const clean = String(identifier || "").trim().toLowerCase();
  if (!clean) return "";
  return clean.includes("@") ? clean : `${clean}@students.sarvadnya.erp`;
};

const profileToAccount = (profile, user, fallbackRole = "") => ({
  id: profile?.id || user?.id || "",
  authUserId: user?.id || profile?.auth_user_id || "",
  name: profile?.display_name || user?.user_metadata?.display_name || user?.email || "ERP User",
  email: profile?.email || user?.email || "",
  role: profile?.role || user?.user_metadata?.erp_role || fallbackRole,
  roleName: profile?.role_name || "",
  studentIdentifier: profile?.student_identifier || "",
});

const getCurrentUserProfile = async (user) => {
  const { data, error } = await supabase
    .from(USER_PROFILE_TABLE)
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return { profile: data || null, error };
};

const authenticateStaffLocally = (email, password, requiredRole) => {
  const accounts = getStaffAccounts();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPass = String(password || "").trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, message: "Please enter both Email ID and Password." };
  }

  const matched = accounts.find(
    (acc) =>
      acc.email.toLowerCase() === cleanEmail ||
      acc.email.toLowerCase().split("@")[0] === cleanEmail
  );

  if (!matched) {
    return { success: false, message: "Account not found with this login ID." };
  }

  if (matched.password !== cleanPass) {
    return { success: false, message: "Incorrect password. Please verify and try again." };
  }

  if (requiredRole && matched.role !== requiredRole && matched.role !== "admin") {
    return {
      success: false,
      message: `Unauthorized access: This account does not have ${requiredRole} permissions.`,
    };
  }

  return { success: true, account: matched, source: "local" };
};

export const authenticateStaff = async (email, password, requiredRole) => {
  const cleanEmail = normalizeStaffEmail(email);
  const cleanPass = String(password || "").trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, message: "Please enter both Email ID and Password." };
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPass,
    });

    if (error || !data?.user) {
      return {
        success: false,
        message: error?.message || "Unable to sign in with Supabase Auth.",
      };
    }

    const { profile, error: profileError } = await getCurrentUserProfile(data.user);
    if (profileError || !profile) {
      await supabase.auth.signOut();
      return {
        success: false,
        message:
          "Login succeeded, but ERP role profile is missing. Add this user in erp_user_profiles.",
      };
    }

    const account = profileToAccount(profile, data.user, requiredRole);
    if (requiredRole && account.role !== requiredRole && account.role !== "admin") {
      await supabase.auth.signOut();
      return {
        success: false,
        message: `Unauthorized access: This account does not have ${requiredRole} permissions.`,
      };
    }

    return { success: true, account, source: "supabase" };
  }

  if (localAuthFallbackEnabled) {
    return authenticateStaffLocally(cleanEmail, cleanPass, requiredRole);
  }

  return {
    success: false,
    message: "Live Supabase Auth is required. Local fallback is disabled.",
  };
};

export const authenticateStudent = async (identifier, password) => {
  const cleanIdentifier = String(identifier || "").trim();
  const cleanPass = String(password || "").trim();

  if (!cleanIdentifier || !cleanPass) {
    return { success: false, message: "Please enter both Student ID and Password." };
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: studentLoginEmailFromIdentifier(cleanIdentifier),
      password: cleanPass,
    });

    if (error || !data?.user) {
      return {
        success: false,
        message: error?.message || "Invalid student ID or password.",
      };
    }

    const { profile, error: profileError } = await getCurrentUserProfile(data.user);
    if (profileError || !profile || profile.role !== "student") {
      await supabase.auth.signOut();
      return {
        success: false,
        message: "Login succeeded, but this user is not mapped to a student ERP profile.",
      };
    }

    return {
      success: true,
      account: profileToAccount(profile, data.user, "student"),
      source: "supabase",
    };
  }

  if (!localAuthFallbackEnabled) {
    return {
      success: false,
      message: "Live Supabase Auth is required. Local fallback is disabled.",
    };
  }

  const matched = getStudentVerifications().find((student) => (
    student.scholarNo === cleanIdentifier ||
    student.rollNumber === cleanIdentifier ||
    student.enrollmentNo === cleanIdentifier ||
    student.loginUsername === cleanIdentifier
  ));
  const expectedPassword = matched?.loginPassword || matched?.scholarNo;
  if (!matched || !cleanPass || cleanPass !== expectedPassword) {
    return {
      success: false,
      message: "Invalid student ID or password. Use the credentials generated by Admission Desk.",
    };
  }

  return {
    success: true,
    account: {
      id: matched.id || matched.rollNumber || matched.scholarNo,
      name: matched.studentName || "Student",
      email: matched.email || "",
      role: "student",
      studentIdentifier: matched.rollNumber || matched.scholarNo,
    },
    source: "local",
  };
};

export const signOutCurrentUser = async () => {
  if (supabase) {
    await supabase.auth.signOut();
  }
};

export const updateStaffPassword = (accountId, newPassword) => {
  const accounts = getStaffAccounts();
  const cleanPass = String(newPassword || "").trim();
  if (cleanPass.length < 4) {
    return { success: false, message: "Password must be at least 4 characters." };
  }

  const index = accounts.findIndex((acc) => acc.id === accountId);
  if (index === -1) {
    return { success: false, message: "Staff account not found." };
  }

  accounts[index] = {
    ...accounts[index],
    password: cleanPass,
    updatedAt: new Date().toISOString().split("T")[0],
  };

  saveStaffAccounts(accounts);
  return { success: true, message: "Password successfully updated!" };
};

export const createStaffAccount = ({ name, email, role, password }) => {
  const accounts = getStaffAccounts();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPass = String(password || "").trim();
  const cleanName = String(name || "").trim();

  if (!cleanName) {
    return { success: false, message: "Staff member name is required." };
  }
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, message: "A valid email address is required." };
  }
  if (cleanPass.length < 4) {
    return { success: false, message: "Password must be at least 4 characters." };
  }

  if (accounts.some((acc) => acc.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: "An account with this email already exists." };
  }

  const roleNameMap = {
    admin: "Institutional Administrator",
    admission: "Admissions & Enrollment Officer",
    fee: "Fee Accounts Officer",
  };

  const newAccount = {
    id: `staff-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    role: role || "admission",
    roleName: roleNameMap[role] || "Staff Member",
    password: cleanPass,
    createdAt: new Date().toISOString().split("T")[0],
    isDefault: false,
  };

  const updated = [...accounts, newAccount];
  saveStaffAccounts(updated);
  return { success: true, account: newAccount, message: "New staff user created successfully!" };
};

export const deleteStaffAccount = (accountId) => {
  const accounts = getStaffAccounts();
  const account = accounts.find((acc) => acc.id === accountId);

  if (!account) {
    return { success: false, message: "Account not found." };
  }

  if (account.isDefault && account.role === "admin") {
    return { success: false, message: "The primary institutional admin account cannot be deleted." };
  }

  const updated = accounts.filter((acc) => acc.id !== accountId);
  saveStaffAccounts(updated);
  return { success: true, message: "Staff account removed successfully." };
};

export const resetStaffDefaults = () => {
  saveStaffAccounts(DEFAULT_STAFF_ACCOUNTS);
  return { success: true, message: "Staff credentials reset to system defaults." };
};
