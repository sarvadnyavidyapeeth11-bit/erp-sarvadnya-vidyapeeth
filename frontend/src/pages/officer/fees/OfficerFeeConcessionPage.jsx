import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  Percent,
  Plus,
  Search,
  ShieldCheck,
  XCircle
} from "lucide-react";
import {
  getConcessionRequests,
  getConcessionRules,
  processConcessionAction,
  saveConcessionRule
} from "../../../hooks/studentPortalData";

export default function OfficerFeeConcessionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [concessions, setConcessions] = useState(() => getConcessionRequests());
  const [rules, setRules] = useState(() => getConcessionRules());
  const [inspectConcession, setInspectConcession] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [selectedConcession, setSelectedConcession] = useState(null);
  const [sanctionedAmount, setSanctionedAmount] = useState("");
  const [remarksText, setRemarksText] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [rulePercentage, setRulePercentage] = useState("85");
  const [ruleDiscount, setRuleDiscount] = useState("10");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const reloadConcessions = () => setConcessions(getConcessionRequests());
  const reloadRules = () => setRules(getConcessionRules());

  useEffect(() => {
    reloadConcessions();
    reloadRules();
    window.addEventListener("concessionDataUpdated", reloadConcessions);
    window.addEventListener("concessionRulesUpdated", reloadRules);
    window.addEventListener("feeDataUpdated", reloadConcessions);
    window.addEventListener("storage", reloadConcessions);
    return () => {
      window.removeEventListener("concessionDataUpdated", reloadConcessions);
      window.removeEventListener("concessionRulesUpdated", reloadRules);
      window.removeEventListener("feeDataUpdated", reloadConcessions);
      window.removeEventListener("storage", reloadConcessions);
    };
  }, []);

  const showNotification = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(""), 5000);
  };

  const filteredConcessions = useMemo(() => concessions.filter((item) => {
    const statusText = String(item.status || "");
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending" && (statusText.includes("Pending") || statusText.includes("Review"))) ||
      (statusFilter === "Approved" && statusText.includes("Approved")) ||
      (statusFilter === "Rejected" && statusText.includes("Rejected"));
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !query ||
      String(item.studentName || "").toLowerCase().includes(query) ||
      String(item.rollNumber || "").toLowerCase().includes(query) ||
      String(item.id || "").toLowerCase().includes(query) ||
      String(item.type || "").toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  }), [concessions, searchTerm, statusFilter]);

  const pendingCount = concessions.filter((item) => String(item.status || "").includes("Pending") || String(item.status || "").includes("Review")).length;
  const approvedCount = concessions.filter((item) => String(item.status || "").includes("Approved")).length;

  const handleAddRule = (e) => {
    e.preventDefault();
    const rule = saveConcessionRule({
      name: ruleName,
      minClass12Percentage: rulePercentage,
      discountPercent: ruleDiscount,
      status: "Active",
      createdBy: "Fee Officer"
    });
    if (!rule) {
      window.alert("Rule name, 12th minimum percentage aur discount percent required hai.");
      return;
    }
    setRuleName("");
    setRulePercentage("85");
    setRuleDiscount("10");
    reloadRules();
    showNotification("New concession rule student portal me active ho gaya.");
  };

  const handleOpenApprove = (item) => {
    setSelectedConcession(item);
    setModalAction("approve");
    setSanctionedAmount(item.sanctionedAmount || item.amount || 0);
    setRemarksText(`${item.class12Percentage || 0}% 12th merit verified. Concession approved and fee ledger adjusted.`);
  };

  const handleOpenReject = (item) => {
    setSelectedConcession(item);
    setModalAction("reject");
    setRemarksText("12th merit eligibility / marksheet verification failed.");
  };

  const handleConfirmAction = (e) => {
    e.preventDefault();
    if (!selectedConcession || !modalAction) return;

    if (modalAction === "approve") {
      processConcessionAction(
        selectedConcession.id,
        "Approved",
        sanctionedAmount,
        remarksText,
        "Fee Officer"
      );
      showNotification(`Concession ${selectedConcession.id} approved. Rs.${Number(sanctionedAmount).toLocaleString("en-IN")} ledger me adjust hua.`);
    } else {
      processConcessionAction(
        selectedConcession.id,
        "Rejected",
        0,
        remarksText,
        "Fee Officer"
      );
      showNotification(`Concession ${selectedConcession.id} rejected.`);
    }

    setModalAction(null);
    setSelectedConcession(null);
    setInspectConcession(null);
    reloadConcessions();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Percent className="w-6 h-6 text-amber-600" />
            12th Merit Fee Concession Desk
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            12th percentage rules manage karein, student applications verify karein, aur approved amount student ledger me adjust karein.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
            <p className="text-[10px] font-black uppercase text-amber-700">Pending</p>
            <p className="text-lg font-black text-amber-900">{pendingCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <p className="text-[10px] font-black uppercase text-emerald-700">Approved</p>
            <p className="text-lg font-black text-emerald-900">{approvedCount}</p>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-600" />
              Add Concession Rule
            </h3>
            <form onSubmit={handleAddRule} className="space-y-3 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Rule Name</label>
                <input
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="Example: 12th Merit Concession"
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">12th Min %</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={rulePercentage}
                    onChange={(e) => setRulePercentage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ruleDiscount}
                    onChange={(e) => setRuleDiscount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Active Student Rules
            </h3>
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className="p-3 rounded-xl bg-slate-50 border border-gray-200 text-xs">
                  <p className="font-black text-slate-900">{rule.name}</p>
                  <p className="text-[11px] text-slate-500 font-bold">
                    12th {rule.minClass12Percentage}%+ | Discount {rule.discountPercent}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student, roll no, ref id..."
                className="w-full bg-slate-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-gray-200 text-[11px]">
              {["All", "Pending", "Approved", "Rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg font-extrabold cursor-pointer ${
                    statusFilter === status ? "bg-white text-amber-700 shadow-xs" : "text-slate-500"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/80 border-b border-amber-200 text-amber-900 font-black">
                <tr>
                  <th className="py-3 px-4">Ref / Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">12th Details</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredConcessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                      No concession requests found.
                    </td>
                  </tr>
                ) : (
                  filteredConcessions.map((item) => {
                    const statusText = String(item.status || "");
                    const isPending = statusText.includes("Pending") || statusText.includes("Review");
                    const isApproved = statusText.includes("Approved");
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4">
                          <p className="font-black text-slate-900 font-mono">{item.id}</p>
                          <p className="text-[10px] text-slate-500">{item.date}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-black text-slate-900">{item.studentName}</p>
                          <p className="text-[10px] font-mono text-purple-700 font-bold">{item.rollNumber}</p>
                          <p className="text-[10px] text-slate-500">{item.course}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{item.class12Percentage || 0}%</p>
                          <p className="text-[10px] text-slate-500">{item.class12Board || "-"} | {item.class12PassingYear || "-"}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-48">{item.class12School || "-"}</p>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                          Rs.{(item.sanctionedAmount || item.amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setInspectConcession(item)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg cursor-pointer border border-amber-200"
                              title="Inspect"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleOpenApprove(item)}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[10px] flex items-center gap-1 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  onClick={() => handleOpenReject(item)}
                                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-black text-[10px] flex items-center gap-1 cursor-pointer"
                                >
                                  <XCircle className="w-3 h-3" /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {inspectConcession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">Concession Request Details</h3>
                  <p className="text-xs text-slate-500 font-medium">{inspectConcession.id}</p>
                </div>
                <button onClick={() => setInspectConcession(null)} className="text-slate-400 hover:text-slate-600 font-black cursor-pointer">X</button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                  <p className="text-[10px] uppercase font-black text-slate-500">Student</p>
                  <p className="font-black text-slate-900">{inspectConcession.studentName}</p>
                  <p className="font-mono text-purple-700">{inspectConcession.rollNumber}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-[10px] uppercase font-black text-amber-700">12th Percentage</p>
                  <p className="font-mono font-black text-amber-900">{inspectConcession.class12Percentage || 0}%</p>
                  <p className="text-[11px] text-slate-600">{inspectConcession.class12Board || "-"} | {inspectConcession.class12PassingYear || "-"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 col-span-2">
                  <p className="text-[10px] uppercase font-black text-slate-500">School / Marksheet</p>
                  <p className="font-bold text-slate-900">{inspectConcession.class12School || "-"}</p>
                  <p className="font-mono text-[11px] text-slate-600">{inspectConcession.class12Marksheet || "No file"}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 col-span-2">
                  <p className="text-[10px] uppercase font-black text-emerald-700">Requested Concession</p>
                  <p className="font-mono font-black text-emerald-900">Rs.{(inspectConcession.amount || 0).toLocaleString("en-IN")}</p>
                </div>
              </div>
              {inspectConcession.officerRemarks && (
                <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 text-xs text-slate-700 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{inspectConcession.officerRemarks}</span>
                </div>
              )}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => setInspectConcession(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer">Close</button>
                {(String(inspectConcession.status || "").includes("Pending") || String(inspectConcession.status || "").includes("Review")) && (
                  <>
                    <button onClick={() => handleOpenReject(inspectConcession)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs cursor-pointer">Reject</button>
                    <button onClick={() => handleOpenApprove(inspectConcession)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs cursor-pointer">Approve</button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalAction && selectedConcession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {modalAction === "approve" ? "Approve & Adjust Concession" : "Reject Concession Request"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedConcession.id}</p>
                </div>
                <button onClick={() => setModalAction(null)} className="text-slate-400 hover:text-slate-600 font-black cursor-pointer">X</button>
              </div>

              <form onSubmit={handleConfirmAction} className="space-y-3.5 text-xs">
                {modalAction === "approve" && (
                  <div>
                    <label className="block font-extrabold text-slate-700 mb-1">Sanctioned Amount (Rs.)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={sanctionedAmount === 0 ? "" : (sanctionedAmount ?? "")}
                      onChange={(e) => setSanctionedAmount(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Officer Remarks</label>
                  <textarea
                    rows={3}
                    required
                    value={remarksText}
                    onChange={(e) => setRemarksText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button type="button" onClick={() => setModalAction(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer">Cancel</button>
                  <button
                    type="submit"
                    className={`px-5 py-2 text-white rounded-xl font-black flex items-center gap-1.5 cursor-pointer ${
                      modalAction === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {modalAction === "approve" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {modalAction === "approve" ? "Approve & Adjust" : "Reject"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
