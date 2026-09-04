import React from "react";
import { motion } from "framer-motion";
import FeeNavigationHeader from "./FeeNavigationHeader";
import FeeReceiptsSection from "../../../components/fees/FeeReceiptsSection";

export default function FeeReceiptsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <FeeNavigationHeader
        title="Fee Receipts & Payment History"
        description="View, search, print, and download official fee payment receipts with verified transaction authentication."
      />
      <FeeReceiptsSection />
    </motion.div>
  );
}
