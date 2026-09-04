import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import FeeReceiptsPage from "./FeeReceiptsPage";
import FeePaymentPage from "./FeePaymentPage";
import FeeLedgerPage from "./FeeLedgerPage";
import FeeScholarshipsPage from "./FeeScholarshipsPage";
import FeeDrccPage from "./FeeDrccPage";
import FeeRefundsPage from "./FeeRefundsPage";
import FeeNoDuesPage from "./FeeNoDuesPage";
import FeeChallanPage from "./FeeChallanPage";
import FeeConcessionPage from "./FeeConcessionPage";
import { getFeeDetails } from "../../../hooks/studentPortalData";

export default function FeeDetailsPage() {
  getFeeDetails();
  return (
    <Routes>
      <Route index element={<Navigate to="receipts" replace />} />
      <Route path="receipts" element={<FeeReceiptsPage />} />
      <Route path="onlinePay" element={<FeePaymentPage />} />
      <Route path="pay" element={<FeePaymentPage />} />
      <Route path="installments" element={<Navigate to="/student-dashboard/fees/onlinePay" replace />} />
      <Route path="structure" element={<Navigate to="/student-dashboard/fees/onlinePay" replace />} />
      <Route path="ledger" element={<FeeLedgerPage />} />
      <Route path="scholarships" element={<FeeScholarshipsPage />} />
      <Route path="drcc" element={<FeeDrccPage />} />
      <Route path="refunds" element={<FeeRefundsPage />} />
      <Route path="no-dues" element={<FeeNoDuesPage />} />
      <Route path="challan" element={<FeeChallanPage />} />
      <Route path="concessions" element={<FeeConcessionPage />} />
      <Route path="*" element={<Navigate to="receipts" replace />} />
    </Routes>
  );
}
