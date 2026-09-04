import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Percent,
  Send,
  Upload,
  XCircle,
  IndianRupee,
  ShieldCheck,
  Building,
  Info,
  Layers,
  AlertCircle,
  GraduationCap
} from "lucide-react";
import FeeNavigationHeader from "./FeeNavigationHeader";
import {
  studentProfile,
  getFeeDetails,
  getConcessionRequests,
  getConcessionRules,
  submitStudentConcession
} from "../../../hooks/studentPortalData";

export default function FeeConcessionPage() {
  const [concessionSubmitted, setConcessionSubmitted] = useState(false);
  const [rules, setRules] = useState(() => getConcessionRules().filter((rule) => rule.status === "Active"));
  const [selectedRuleId, setSelectedRuleId] = useState(() => rules[0]?.id || "");
  const [class12Board, setClass12Board] = useState("");
  const [class12School, setClass12School] = useState("");
  const [class12PassingYear, setClass12PassingYear] = useState("");
  const [class12Percentage, setClass12Percentage] = useState("");
  const [marksheetFileName, setMarksheetFileName] = useState("");
  const [filterTab, setFilterTab] = useState("All");
  const [requestsList, setRequestsList] = useState([]);

  const selectedRule = useMemo(
    () => rules.find((rule) => rule.id === selectedRuleId) || rules[0],
    [rules, selectedRuleId]
  );
  const pendingFee = getFeeDetails().totalPending || 0;
  const estimatedConcession = selectedRule
    ? Math.min(pendingFee, Math.round((pendingFee * (Number(selectedRule.discountPercent) || 0)) / 100))
    : 0;

  const loadConcessions = () => {
    const all = getConcessionRequests();
    const mine = all.filter((c) => (
      c.rollNumber === studentProfile.rollNumber || c.rollNumber === studentProfile.scholarNo
    ));
    setRequestsList(mine);
  };

  const loadRules = () => {
    const activeRules = getConcessionRules().filter((rule) => rule.status === "Active");
    setRules(activeRules);
    setSelectedRuleId((current) => current || activeRules[0]?.id || "");
  };

  useEffect(() => {
    loadConcessions();
    loadRules();
    window.addEventListener("concessionDataUpdated", loadConcessions);
    window.addEventListener("concessionRulesUpdated", loadRules);
    window.addEventListener("feeDataUpdated", loadConcessions);
    window.addEventListener("storage", loadConcessions);
    return () => {
      window.removeEventListener("concessionDataUpdated", loadConcessions);
      window.removeEventListener("concessionRulesUpdated", loadRules);
      window.removeEventListener("feeDataUpdated", loadConcessions);
      window.removeEventListener("storage", loadConcessions);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRule) {
      window.alert("Abhi koi active concession rule available nahi hai.");
      return;
    }
    if (Number(class12Percentage) < Number(selectedRule.minClass12Percentage)) {
      window.alert(`${selectedRule.name} ke liye 12th me minimum ${selectedRule.minClass12Percentage}% required hai.`);
      return;
    }
    if (!estimatedConcession || estimatedConcession <= 0) {
      window.alert("Pending fee zero hai, concession adjust karne ke liye amount available nahi hai.");
      return;
    }

    const submitted = submitStudentConcession({
      ruleId: selectedRule.id,
      amount: estimatedConcession,
      class12Board,
      class12School,
      class12PassingYear,
      class12Percentage,
      class12Marksheet: marksheetFileName,
      reason: `12th Merit: ${class12Percentage}% in ${class12Board}, ${class12PassingYear}`
    });

    if (!submitted) {
      window.alert("Concession submit nahi hua. 12th percentage, active rule aur pending fee verify karein.");
      return;
    }

    setConcessionSubmitted(true);
    setClass12Board("");
    setClass12School("");
    setClass12PassingYear("");
    setClass12Percentage("");
    setMarksheetFileName("");
    loadConcessions();
    setTimeout(() => setConcessionSubmitted(false), 5000);
  };

  const filteredRequests = requestsList.filter((item) => {
    if (filterTab === "Pending") return String(item.status || "").includes("Pending") || String(item.status || "").includes("Review");
    if (filterTab === "Approved") return String(item.status || "").includes("Approved");
    return true;
  });

  const pendingCount = requestsList.filter(r => String(r.status || "").includes("Pending") || String(r.status || "").includes("Review")).length;
  const approvedCount = requestsList.filter(r => String(r.status || "").includes("Approved")).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <FeeNavigationHeader
        title="12th Merit Scholarship & Fee Concession"
        description="Apply for merit-based institutional fee concessions based on your Class 12th academic percentage, verified board marksheet, and approved concession policy."
        badge="Merit Concession Cell"
      />

      {concessionSubmitted && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Concession application successfully submitted. The Fee Officer will verify your marksheet and credit the concession to your ledger.
          </span>
          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
            Pending Audit
          </span>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <Percent className="w-6 h-6 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Active Merit Scheme</p>
            <p className="text-lg font-black text-slate-900 truncate mt-0.5">{selectedRule?.name || "Merit Policy"}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6 text-rose-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Current Pending Fee</p>
            <p className="text-lg font-black text-rose-700 font-mono truncate mt-0.5">
              Rs.{pendingFee.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Estimated Concession</p>
            <p className="text-lg font-black text-emerald-700 font-mono truncate mt-0.5">
              Rs.{estimatedConcession.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Audit Pipeline</p>
            <p className="text-lg font-black text-amber-700 font-mono truncate mt-0.5">{pendingCount} Pending</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
              <Percent className="w-5 h-5 text-purple-600" />
              Apply for Merit Concession
            </h3>
            <span className="text-[11px] font-extrabold uppercase text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              12th Merit Scheme
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-800 mb-1.5">
                Applicable Concession Rule <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedRuleId}
                onChange={(e) => setSelectedRuleId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold text-slate-900 text-sm transition-all"
              >
                {rules.map((rule) => (
                  <option key={rule.id} value={rule.id}>
                    {rule.name} - ({rule.minClass12Percentage}% and above) - {rule.discountPercent}% Discount
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  12th Board / Council <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="e.g. CBSE / BSEB / ICSE"
                  value={class12Board}
                  onChange={(e) => setClass12Board(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold text-slate-900 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  12th Passing Year <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="e.g. 2024"
                  value={class12PassingYear}
                  onChange={(e) => setClass12PassingYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-mono font-bold text-slate-900 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-800 mb-1.5">
                12th School / College Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                placeholder="e.g. St. Xavier's Senior Secondary School"
                value={class12School}
                onChange={(e) => setClass12School(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-bold text-slate-900 text-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  12th Marks Percentage (%) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  placeholder="e.g. 88.5"
                  value={class12Percentage}
                  onChange={(e) => setClass12Percentage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl font-mono font-black text-slate-900 text-sm transition-all"
                />
                <p className="mt-1 text-[11px] font-extrabold text-purple-700">
                  Required: {selectedRule?.minClass12Percentage || 85}% and above
                </p>
              </div>

              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  12th Marksheet Proof <span className="text-rose-500">*</span>
                </label>
                <label className="flex items-center justify-between gap-3 w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-dashed border-slate-300 rounded-xl cursor-pointer transition-all">
                  <span className="text-slate-700 font-bold truncate">
                    {marksheetFileName || "Upload Marksheet (PDF / JPG)"}
                  </span>
                  <Upload className="w-4 h-4 text-purple-600 shrink-0" />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    className="hidden"
                    onChange={(e) => setMarksheetFileName(e.target.files?.[0]?.name || "")}
                  />
                </label>
                {marksheetFileName && (
                  <p className="mt-1 text-[11px] font-extrabold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {marksheetFileName}
                  </p>
                )}
              </div>
            </div>

            {/* Live Calculation Box */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <p className="text-[10px] uppercase font-extrabold text-slate-500">Current Pending Fee</p>
                <p className="font-mono font-black text-slate-900 text-sm mt-0.5">Rs.{pendingFee.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-extrabold text-emerald-700">Estimated Concession</p>
                <p className="font-mono font-black text-emerald-700 text-sm mt-0.5">Rs.{estimatedConcession.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Send className="w-4 h-4" /> Submit Concession Request
            </button>
          </form>
        </div>

        {/* Right Status Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
                <Award className="w-5 h-5 text-purple-600" />
                My Concession Requests
              </h3>
              <label className="w-full sm:w-48">
                <span className="sr-only">Filter concession requests</span>
                <select
                  value={filterTab}
                  onChange={(event) => setFilterTab(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-800 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="All">All ({requestsList.length})</option>
                  <option value="Pending">Pending ({pendingCount})</option>
                  <option value="Approved">Approved ({approvedCount})</option>
                </select>
              </label>
            </div>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-semibold text-xs space-y-1">
                  <p>No concession requests found in this filter.</p>
                </div>
              ) : (
                filteredRequests.map((item) => {
                  const isApproved = String(item.status || "").includes("Approved");
                  const isPending = String(item.status || "").includes("Pending") || String(item.status || "").includes("Review");

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition-all text-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-purple-700 text-sm">{item.id}</span>
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Adjusted
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> Pending Audit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                      </div>

                      <p className="font-black text-slate-900 leading-snug">{item.type}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                        <span>12th Marks: <strong className="font-bold font-mono">{item.class12Percentage || "-"}%</strong></span>
                        <span>Passing Year: <strong className="font-bold font-mono">{item.class12PassingYear || "-"}</strong></span>
                        <span className="col-span-2">Board: <strong className="font-bold">{item.class12Board || "-"}</strong></span>
                      </div>

                      {item.officerRemarks && (
                        <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-[11px] text-purple-950 font-semibold flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span>{item.officerRemarks}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-mono font-semibold">
                        <span>Concession: <strong className="text-emerald-700 font-black">Rs.{(item.amount || 0).toLocaleString("en-IN")}</strong></span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Criteria Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xs space-y-3 text-xs">
            <h4 className="font-black flex items-center gap-2 text-emerald-400 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-400" /> Merit Concession Policy Guidelines
            </h4>
            <ul className="space-y-2 text-slate-300 text-xs leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>Marksheet is verified against board records before concession credit is finalized.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>Concession amount is deducted directly from outstanding tuition fees in the student ledger.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
