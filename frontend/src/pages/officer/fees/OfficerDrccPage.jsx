import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  IndianRupee,
  Search,
  ShieldCheck,
  XCircle
} from "lucide-react";
import {
  getDrccApplications,
  getFeeDetailsForStudent,
  processDrccAction
} from "../../../hooks/studentPortalData";
import { openDocumentInNewTab } from "../../../utils/openDocumentInNewTab";

export default function OfficerDrccPage() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [remarks, setRemarks] = useState("BSCC details verified by college fee office.");
  const [notice, setNotice] = useState("");

  const reload = () => setRecords(getDrccApplications());
  const isActionPendingStatus = (status = "") => {
    const text = String(status || "");
    return !text.includes("Fee Payment Pending") && ["Submitted", "Pending", "Verification"].some((word) => text.includes(word));
  };

  useEffect(() => {
    reload();
    window.addEventListener("drccDataUpdated", reload);
    window.addEventListener("feeDataUpdated", reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener("drccDataUpdated", reload);
      window.removeEventListener("feeDataUpdated", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const filtered = records.filter((item) => {
    if (String(item.disbursementTo || item.paymentDestination || "").includes("Student Account")) return false;
    const haystack = [
      item.id,
      item.studentName,
      item.scholarNo,
      item.rollNumber,
      item.applicationNo,
      item.loanId,
      item.sanctionLetterNo,
      item.utrNumber
    ].join(" ").toLowerCase();
    return !searchTerm || haystack.includes(searchTerm.toLowerCase());
  });

  const openAction = (item, action) => {
    const dues = getFeeDetailsForStudent(item.rollNumber).totalPending || 0;
    setSelected(item);
    setModalAction(action);
    setAdjustAmount(action === "approve" ? String(Math.min(Number(item.amountReceived) || 0, dues)) : "0");
    setRemarks(action === "approve"
      ? (Number(item.amountReceived) > 0 ? "BSCC college-account payment verified and adjusted in fee ledger." : "BSCC sanction/application details verified by college.")
      : action === "correction"
      ? "Correction required in BSCC details/documents. Student must resubmit correct proof."
      : "BSCC details/documents rejected by Accounts Desk.");
  };

  const confirmAction = (event) => {
    event.preventDefault();
    if (!selected || !modalAction) return;
    const actionStatus = modalAction === "approve" ? "Approved" : modalAction === "correction" ? "Correction" : "Rejected";
    const result = processDrccAction(selected.id, actionStatus, adjustAmount, remarks);
    if (result?.status?.includes("Completed") || result?.status?.includes("Adjusted")) {
      setNotice(`BSCC ${selected.applicationNo} verified. Rs.${(result.feeAdjustedAmount || 0).toLocaleString("en-IN")} fee adjusted; Rs.${(result.excessScholarshipAmount || 0).toLocaleString("en-IN")} refundable.`);
    } else if (result?.status?.includes("Correction")) {
      setNotice(`BSCC ${selected.applicationNo} sent for correction.`);
    } else {
      setNotice(`BSCC ${selected.applicationNo} rejected.`);
    }
    setModalAction(null);
    setSelected(null);
    reload();
    setTimeout(() => setNotice(""), 5000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" /> Bihar Student Credit Card Desk
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Verify only BSCC amounts received in the college bank account and adjust eligible fee dues.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search student / BSCC reg / loan / UTR" className="bg-transparent outline-none text-xs font-bold w-64" />
        </div>
      </div>

      {notice && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">{notice}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-gray-200">
          <p className="text-slate-500 font-black uppercase">Total BSCC Files</p>
          <p className="text-xl font-black text-slate-900">{records.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <p className="text-amber-700 font-black uppercase">Pending</p>
          <p className="text-xl font-black text-amber-900">{records.filter((r) => isActionPendingStatus(r.status)).length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <p className="text-emerald-700 font-black uppercase">Fee Adjusted</p>
          <p className="text-xl font-black text-emerald-900">Rs.{records.reduce((s, r) => s + (Number(r.feeAdjustedAmount) || 0), 0).toLocaleString("en-IN")}</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
          <p className="text-blue-700 font-black uppercase">Refundable</p>
          <p className="text-xl font-black text-blue-900">Rs.{records.reduce((s, r) => s + (Number(r.excessScholarshipAmount) || 0), 0).toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-xs">
          <thead className="bg-blue-50 text-blue-950 border-b border-blue-100">
            <tr>
              <th className="p-3">BSCC Ref</th>
              <th className="p-3">Student</th>
              <th className="p-3">Sanction / Release</th>
              <th className="p-3">Disbursement</th>
              <th className="p-3">Fee Impact</th>
              <th className="p-3">Documents</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-slate-400 font-bold">No BSCC records found.</td></tr>
            ) : filtered.map((item) => {
              const pending = isActionPendingStatus(item.status);
              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-black text-slate-900">
                    {item.applicationNo}
                    <p className="text-[10px] text-slate-500">{item.id}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-black text-slate-900">{item.studentName}</p>
                    <p className="text-purple-700 font-mono font-bold">{item.scholarNo || item.rollNumber}</p>
                    <p className="text-slate-500">{[item.course, item.semester].filter(Boolean).join(" - ")}</p>
                  </td>
                  <td className="p-3">
                    <p>Loan ID: <strong>{item.loanId || "N/A"}</strong></p>
                    <p>Letter: <strong>{item.sanctionLetterNo || "N/A"}</strong></p>
                    <p>Approved Fee: <strong>Rs.{(item.approvedFeeAmount || 0).toLocaleString("en-IN")}</strong></p>
                    <p>Total: <strong>Rs.{(item.sanctionedTotalAmount || 0).toLocaleString("en-IN")}</strong></p>
                    <p>Year/Sem: <strong>Rs.{(item.sanctionedYearAmount || 0).toLocaleString("en-IN")}</strong></p>
                  </td>
                  <td className="p-3">
                    <p>Received: <strong>Rs.{(item.amountReceived || 0).toLocaleString("en-IN")}</strong></p>
                    <p>To: <strong>{item.disbursementTo}</strong></p>
                    <p className="font-mono text-slate-500">{item.utrNumber || "UTR pending"}</p>
                  </td>
                  <td className="p-3">
                    <p className="text-emerald-700 font-bold">Adjusted Rs.{(item.feeAdjustedAmount || 0).toLocaleString("en-IN")}</p>
                    <p className="text-blue-700 font-bold">Refundable Rs.{(item.excessScholarshipAmount || 0).toLocaleString("en-IN")}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {(item.documents || []).slice(0, 3).map((doc, index) => (
                        <button key={doc.id || index} type="button" onClick={() => openDocumentInNewTab(doc)} className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                          <Eye className="inline w-3 h-3 mr-1" /> {doc.docName || `Doc ${index + 1}`}
                        </button>
                      ))}
                      {(item.documents || []).length > 3 && <span className="px-2 py-1 rounded-lg bg-slate-100 font-bold">+{item.documents.length - 3}</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[10px] ${pending ? "bg-amber-50 text-amber-700 border border-amber-200" : String(item.status).includes("Completed") || String(item.status).includes("Adjusted") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                      {pending ? <Clock className="w-3 h-3" /> : String(item.status).includes("Completed") || String(item.status).includes("Adjusted") ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {pending ? (
                      <div className="inline-flex gap-1">
                        <button onClick={() => openAction(item, "approve")} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-black">Approve</button>
                        <button onClick={() => openAction(item, "correction")} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-black">Correction</button>
                        <button onClick={() => openAction(item, "reject")} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-black">Reject</button>
                      </div>
                    ) : <span className="text-slate-400 font-bold">Completed</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalAction && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <form onSubmit={confirmAction} className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> {modalAction === "approve" ? "Verify BSCC / Adjust Fee" : modalAction === "correction" ? "Request BSCC Correction" : "Reject BSCC Record"}
            </h3>
            <div className="p-3 rounded-xl bg-slate-50 text-xs">
              <p className="font-black">{selected.studentName} - {selected.scholarNo || selected.rollNumber}</p>
              <p>Received Rs.{(selected.amountReceived || 0).toLocaleString("en-IN")} | Due Rs.{(getFeeDetailsForStudent(selected.rollNumber).totalPending || 0).toLocaleString("en-IN")}</p>
              <p>Destination: {selected.disbursementTo || "Payment not received yet"}</p>
            </div>
            {modalAction === "approve" && Number(selected.amountReceived) > 0 && (
              <label className="block text-xs font-black">
                Fee Adjustment Amount
                <input value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value.replace(/[^0-9]/g, ""))} required className="mt-1 w-full p-2.5 rounded-xl border border-gray-300 font-mono" />
              </label>
            )}
            <label className="block text-xs font-black">
              Officer Remarks
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} required rows={3} className="mt-1 w-full p-2.5 rounded-xl border border-gray-300" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setModalAction(null)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold">Cancel</button>
              <button type="submit" className={`px-5 py-2 rounded-xl text-white font-black ${modalAction === "approve" ? "bg-emerald-600" : modalAction === "correction" ? "bg-amber-500" : "bg-rose-600"}`}>
                {modalAction === "approve" ? <IndianRupee className="inline w-4 h-4 mr-1" /> : <XCircle className="inline w-4 h-4 mr-1" />}
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
}
