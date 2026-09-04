import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FeeNavigationHeader from "./FeeNavigationHeader";
import OnlineFeesPayment from "../../../components/fees/OnlineFeesPayment";

export default function FeePaymentPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <FeeNavigationHeader
        title="Pay Fee Online (Instant Payment Gateway)"
        description="Secure online fee payment portal supporting UPI, Net Banking, Credit/Debit Cards & EMI with immediate receipt generation."
      />
      <OnlineFeesPayment onBack={() => navigate("/student-dashboard/fees/receipts")} />
    </motion.div>
  );
}
