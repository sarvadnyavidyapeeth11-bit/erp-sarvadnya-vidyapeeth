import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ERPPortalPage from "./pages/ERPPortalPage";
import StudentLoginPage from "./pages/auth/StudentLoginPage";
import AdminLoginPage from "./pages/auth/AdminLoginPage";
import AdmissionLoginPage from "./pages/auth/AdmissionLoginPage";
import FeeOfficerLoginPage from "./pages/auth/FeeOfficerLoginPage";
import { NotificationProvider } from "./components/common/NotificationContext";
import { initSupabaseRealtimeSync } from "./lib/supabaseSync";
import { supabase } from "./lib/supabaseClient";

// Lazy-load portal dashboards to optimize initial bundle size & concurrent performance
const StudentERPPage = lazy(() => import("./pages/student/StudentERPPage"));
const HODERPPage = lazy(() => import("./pages/hod/HODERPPage"));
const AdminERPPage = lazy(() => import("./pages/admin/AdminERPPage"));
const AdmissionOfficerERPPage = lazy(() => import("./pages/admission/AdmissionOfficerERPPage"));
const FeeOfficerERPPage = lazy(() => import("./pages/officer/FeeOfficerERPPage"));

export default function App() {
  useEffect(() => {
    let unsubscribeRealtime = null;
    let authSubscription = null;
    const refreshRealtimeSync = () => {
      unsubscribeRealtime && unsubscribeRealtime();
      unsubscribeRealtime = initSupabaseRealtimeSync();
    };

    if (typeof window !== "undefined") {
      // Auto-flush legacy mock keys from browser storage
      if (!localStorage.getItem("erp_v5_clean_slate")) {
        localStorage.removeItem("erp_students");
        localStorage.removeItem("erp_payments");
        localStorage.removeItem("erp_admin_verifications");
        localStorage.removeItem("erp_student_ledger_entries");
        localStorage.removeItem("erp_master_departments");
        localStorage.removeItem("erp_master_courses");
        localStorage.removeItem("erp_master_batches");
        localStorage.removeItem("erp_master_subjects");
        localStorage.removeItem("erp_levied_fee_heads");
        localStorage.removeItem("erp_bank_challans");
        localStorage.removeItem("erp_scholarship_applications");
        localStorage.removeItem("erp_drcc_applications");
        localStorage.removeItem("erp_concession_requests");
        localStorage.removeItem("erp_fee_refunds");
        localStorage.removeItem("erp_refund_requests");
        localStorage.removeItem("erp_fee_details");
        localStorage.removeItem("erp_faculty_leaves");
        localStorage.removeItem("erp_internal_marks_sheets");
        localStorage.removeItem("erp_timetable_approval");
        localStorage.setItem("erp_v5_clean_slate", "true");
      }

      const handleWheel = (e) => {
        if (document.activeElement && document.activeElement.type === "number") {
          document.activeElement.blur();
        }
      };
      window.addEventListener("wheel", handleWheel, { passive: true });
      refreshRealtimeSync();
      authSubscription = supabase?.auth?.onAuthStateChange?.(() => {
        refreshRealtimeSync();
      })?.data?.subscription;

      return () => {
        window.removeEventListener("wheel", handleWheel);
        authSubscription?.unsubscribe?.();
        unsubscribeRealtime && unsubscribeRealtime();
      };
    }
    refreshRealtimeSync();
    return () => unsubscribeRealtime && unsubscribeRealtime();
  }, []);
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Suspense fallback={
          <div className="min-h-screen bg-slate-950 text-indigo-400 flex flex-col items-center justify-center font-sans space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold tracking-wide">Loading Campus ERP System...</p>
          </div>
        }>
          <Routes>
            {/* Main ERP Portal Gateway */}
            <Route path="/" element={<ERPPortalPage />} />
            <Route path="/erp" element={<ERPPortalPage />} />

            {/* Login Routes */}
            <Route path="/student" element={<StudentLoginPage />} />
            <Route path="/student-login" element={<StudentLoginPage />} />
            <Route path="/hod" element={<Navigate to="/hod-dashboard" replace />} />
            <Route path="/hod-login" element={<Navigate to="/hod-dashboard" replace />} />
            <Route path="/teacher" element={<Navigate to="/hod-dashboard" replace />} />
            <Route path="/teacher-login" element={<Navigate to="/hod-dashboard" replace />} />
            <Route path="/staff" element={<Navigate to="/hod-dashboard" replace />} />
            <Route path="/staff-login" element={<Navigate to="/hod-dashboard" replace />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admission" element={<AdmissionLoginPage />} />
            <Route path="/admission-login" element={<AdmissionLoginPage />} />
            <Route path="/admission-officer" element={<AdmissionLoginPage />} />
            <Route path="/fee" element={<FeeOfficerLoginPage />} />
            <Route path="/fee-login" element={<FeeOfficerLoginPage />} />
            <Route path="/fee-officer" element={<FeeOfficerLoginPage />} />
            <Route path="/fee-officer-login" element={<FeeOfficerLoginPage />} />
            <Route path="/superadmin" element={<Navigate to="/admin-login" replace />} />
            <Route path="/superadmin-login" element={<Navigate to="/admin-login" replace />} />
            <Route path="/fee-officer-portal" element={<Navigate to="/fee-officer-login" replace />} />

            {/* Role Dashboards */}
            <Route path="/student-dashboard/*" element={<StudentERPPage />} />
            <Route path="/hod-dashboard/*" element={<HODERPPage />} />
            <Route path="/teacher-dashboard/*" element={<Navigate to="/hod-dashboard" replace />} />
            <Route path="/admin-dashboard/*" element={<AdminERPPage />} />
            <Route path="/admission-officer-dashboard/*" element={<AdmissionOfficerERPPage />} />
            <Route path="/superadmin-dashboard/*" element={<Navigate to="/admin-dashboard" replace />} />
            <Route path="/fee-officer-dashboard/*" element={<FeeOfficerERPPage />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </NotificationProvider>
  );
}
