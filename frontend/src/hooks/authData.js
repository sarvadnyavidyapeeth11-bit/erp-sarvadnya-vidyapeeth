// ─── Centralized Staff Authentication & Role Management Store ──────────────────────
// Handles authentication, password updates, and user creation for Admin, Admission, and Fee Desks.
// Persists in Local Storage and syncs across active browser sessions.

const STAFF_ACCOUNTS_KEY = "erp_staff_accounts";

export const DEFAULT_STAFF_ACCOUNTS = [
  {
    id: "staff-admin-01",
    name: "Central Academic Administrator",
    email: "admin@sarvadnya.erp",
    role: "admin",
    roleName: "Institutional Administrator",
    password: "11111112",
    createdAt: "2026-09-04",
    isDefault: true,
  },
  {
    id: "staff-admission-01",
    name: "Admissions Desk Officer",
    email: "admission@sarvadnya.erp",
    role: "admission",
    roleName: "Admissions & Enrollment Officer",
    password: "11111112",
    createdAt: "2026-09-04",
    isDefault: true,
  },
  {
    id: "staff-fee-01",
    name: "Fee Accounts Officer",
    email: "fee@sarvadnya.erp",
    role: "fee",
    roleName: "Accounts & Cash Officer",
    password: "11111112",
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

/**
 * Authenticates a staff member against the stored accounts.
 * @param {string} email
 * @param {string} password
 * @param {string} requiredRole - "admin" | "admission" | "fee"
 * @returns {{ success: boolean, account?: object, message?: string }}
 */
export const authenticateStaff = (email, password, requiredRole) => {
  const accounts = getStaffAccounts();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPass = String(password || "").trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, message: "Please enter both Email ID and Password." };
  }

  const matched = accounts.find(
    (acc) =>
      acc.email.toLowerCase() === cleanEmail ||
      acc.email.toLowerCase().split("@")[0] === cleanEmail // allows entering just "admin" or "admin@sarvadnya.erp"
  );

  if (!matched) {
    return { success: false, message: "Account not found with this login ID." };
  }

  if (matched.password !== cleanPass) {
    return { success: false, message: "Incorrect password. Please verify and try again." };
  }

  if (requiredRole && matched.role !== requiredRole && matched.role !== "admin") {
    // "admin" can also access other desks if needed, but otherwise enforce role
    return {
      success: false,
      message: `Unauthorized access: This account does not have ${requiredRole} permissions.`,
    };
  }

  return { success: true, account: matched };
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

  // Check duplicate email
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
