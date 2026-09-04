import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RotateCcw,
  Users,
  Lock,
  UserCheck,
  Mail,
  Building2,
  Receipt,
  GraduationCap,
} from "lucide-react";
import {
  getStaffAccounts,
  updateStaffPassword,
  createStaffAccount,
  deleteStaffAccount,
  resetStaffDefaults,
} from "../../hooks/authData";
import {
  createStaffAuthUser,
  deleteStaffAuthUser,
  updateStaffAuthPassword,
} from "../../lib/erpBackendApi";

export default function AdminStaffUsersPage() {
  const [accounts, setAccounts] = useState(() => getStaffAccounts());
  const [showPasswordMap, setShowPasswordMap] = useState({});

  // Change Password Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("admission");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [createSaving, setCreateSaving] = useState(false);

  // Reload accounts on update
  useEffect(() => {
    const handleUpdate = () => setAccounts(getStaffAccounts());
    window.addEventListener("erpStaffAccountsUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("erpStaffAccountsUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const toggleShowPassword = (id) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openChangePassword = (account) => {
    setSelectedAccount(account);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match. Please re-check.");
      return;
    }

    setPasswordSaving(true);
    const authRes = await updateStaffAuthPassword({
      email: selectedAccount.email,
      password: newPassword,
    });
    setPasswordSaving(false);
    if (!authRes.success && !authRes.skipped) {
      setPasswordError(authRes.message || "Unable to update Supabase Auth password.");
      return;
    }

    const res = updateStaffPassword(selectedAccount.id, newPassword);
    if (!res.success) {
      setPasswordError(res.message);
      return;
    }

    setPasswordSuccess(res.message);
    setAccounts(getStaffAccounts());
    setTimeout(() => {
      setPasswordModalOpen(false);
    }, 1200);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!newUserPassword || newUserPassword.length < 8) {
      setCreateError("Password must be at least 8 characters long.");
      return;
    }

    setCreateSaving(true);
    const authRes = await createStaffAuthUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      password: newUserPassword,
    });
    setCreateSaving(false);
    if (!authRes.success && !authRes.skipped) {
      setCreateError(authRes.message || "Unable to create staff user in Supabase Auth.");
      return;
    }

    const res = createStaffAccount({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      password: newUserPassword,
    });

    if (!res.success) {
      setCreateError(res.message);
      return;
    }

    setCreateSuccess(res.message);
    setAccounts(getStaffAccounts());
    setTimeout(() => {
      setCreateModalOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("admission");
    }, 1200);
  };

  const handleDeleteAccount = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove staff access for "${name}"?`)) {
      const target = accounts.find((acc) => acc.id === id);
      if (target) {
        const authRes = await deleteStaffAuthUser({ email: target.email });
        if (!authRes.success && !authRes.skipped) {
          alert(authRes.message || "Unable to remove staff user from Supabase Auth.");
          return;
        }
      }
      const res = deleteStaffAccount(id);
      if (!res.success) {
        alert(res.message);
      } else {
        setAccounts(getStaffAccounts());
      }
    }
  };

  const handleResetDefaults = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset all staff logins to system defaults (admin@sarvadnya.erp, admission@sarvadnya.erp, fee@sarvadnya.erp)?"
      )
    ) {
      const nextDefaults = resetStaffDefaults();
      const defaults = getStaffAccounts();
      for (const account of defaults) {
        const authRes = await createStaffAuthUser({
          name: account.name,
          email: account.email,
          role: account.role,
          password: account.password,
        });
        if (!authRes.success && !authRes.skipped) {
          alert(authRes.message || `Unable to reset ${account.email} in Supabase Auth.`);
          break;
        }
      }
      if (nextDefaults.success) {
        setAccounts(defaults);
      }
    }
  };

  const roleBadges = {
    admin: {
      label: "Institutional Admin",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: ShieldCheck,
    },
    admission: {
      label: "Admissions Desk",
      color: "bg-amber-100 text-amber-800 border-amber-200",
      icon: UserPlus,
    },
    fee: {
      label: "Fee Accounts",
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: Receipt,
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <KeyRound className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Staff & User Access Control
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage institutional login credentials, reset passwords, and create staff access for Admin, Admissions, and Fee Desks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            title="Reset to default usernames & password (11111112)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={() => {
              setCreateError("");
              setCreateSuccess("");
              setCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Staff User</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Admin Desks
            </span>
            <span className="text-2xl font-black text-slate-900">
              {accounts.filter((a) => a.role === "admin").length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Admissions Officers
            </span>
            <span className="text-2xl font-black text-slate-900">
              {accounts.filter((a) => a.role === "admission").length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Fee Accounts Staff
            </span>
            <span className="text-2xl font-black text-slate-900">
              {accounts.filter((a) => a.role === "fee").length}
            </span>
          </div>
        </div>
      </div>

      {/* Staff Accounts List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Authorized Staff Credentials Directory
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              These credentials grant access to specific desk portals across the ERP.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
            {accounts.length} Total Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="p-4">Staff Member</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Login Email ID</th>
                <th className="p-4">Current Password</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((acc) => {
                const badge = roleBadges[acc.role] || {
                  label: acc.role,
                  color: "bg-slate-100 text-slate-800 border-slate-200",
                  icon: Users,
                };
                const RoleIcon = badge.icon;
                const isPasswordVisible = showPasswordMap[acc.id];

                return (
                  <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {acc.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{acc.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Created: {acc.createdAt || "2026-09-04"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badge.color}`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 font-mono text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                        <Mail className="w-3.5 h-3.5 text-purple-500" />
                        <span>{acc.email}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="inline-flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-slate-100 px-2.5 py-1 rounded-md text-slate-800 min-w-[85px] text-center border border-slate-200">
                          {isPasswordVisible ? acc.password : "••••••••"}
                        </span>
                        <button
                          onClick={() => toggleShowPassword(acc.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title={isPasswordVisible ? "Hide password" : "Show password"}
                        >
                          {isPasswordVisible ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => openChangePassword(acc)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition-all inline-flex items-center gap-1"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Change Password</span>
                      </button>

                      {!acc.isDefault && (
                        <button
                          onClick={() => handleDeleteAccount(acc.id, acc.name)}
                          className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                          title="Delete staff user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {passwordModalOpen && selectedAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Change Staff Password</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedAccount.name} ({selectedAccount.email})
                  </p>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition-all shadow-md shadow-purple-600/20 disabled:opacity-60"
                  >
                    {passwordSaving ? "Saving..." : "Save New Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create New Staff User Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Add New Staff User</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Create credentials for administrative, admissions, or accounts staff.
                  </p>
                </div>
              </div>

              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{createSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                    Staff Member Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                    Staff Login Email / ID
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. rajesh@sarvadnya.erp"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                    Assigned Desk / Role
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  >
                    <option value="admission">Admissions Desk Officer</option>
                    <option value="fee">Fee Accounts Officer</option>
                    <option value="admin">Institutional Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                    Initial Login Password
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Enter temporary or permanent password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSaving}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition-all shadow-md shadow-purple-600/20 disabled:opacity-60"
                  >
                    {createSaving ? "Creating..." : "Create Staff Account"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
