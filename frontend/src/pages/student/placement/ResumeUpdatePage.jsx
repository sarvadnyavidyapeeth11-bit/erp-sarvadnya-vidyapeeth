import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Globe,
  Code,
  Briefcase,
  Save,
  FileCheck,
  X,
  Plus,
  Share2,
  ExternalLink,
} from "lucide-react";
import { studentProfile } from "../../../hooks/studentPortalData";
export default function ResumeUpdatePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [headline, setHeadline] = useState("");
  const [currentResume, setCurrentResume] = useState(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");



  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit. Please select a smaller PDF or DOCX file.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit. Please select a smaller file.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadResume = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setCurrentResume({
            name: selectedFile.name,
            size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
            uploadedDate: new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            status: "Pending Verification",
          });
          setSelectedFile(null);
          setSuccessMsg("Resume Uploaded & Saved Successfully!");
          setTimeout(() => setSuccessMsg(""), 4000);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveDetails = () => {
    setSuccessMsg("Profile & Resume Details Updated Successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* -- Page Header -- */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-purple-900/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Placement Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Update Your Placement Resume
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl">
            Upload your updated PDF/DOCX resume, add technical skills, and manage portfolio links to share with visiting campus recruiters.
          </p>
        </div>
      </div>

      {/* -- Success Toast -- */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* -- Left Column: Upload Resume Box & Active File -- */}
        <div className="lg:col-span-1 space-y-5">
          {/* Active Resume Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
              <FileCheck className="w-4 h-4 text-purple-600" />
              Active Resume
            </h3>

            {currentResume ? (
              <div className="p-4 rounded-xl bg-slate-900 text-white relative overflow-hidden shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 font-bold">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-white">{currentResume.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{currentResume.size}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Uploaded: {currentResume.uploadedDate}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {currentResume.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => alert(`Downloading ${currentResume.name}`)}
                    className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button
                    onClick={() => alert(`Viewing preview for ${currentResume.name}`)}
                    className="py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No active resume found. Please upload one below.
              </div>
            )}
          </div>

          {/* Upload New Resume Box */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-purple-600" />
              Upload New Version
            </h3>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`p-6 rounded-xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center cursor-pointer ${isDragging
                  ? "border-purple-600 bg-purple-50"
                  : selectedFile
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-gray-300 hover:border-purple-400 bg-gray-50/50 hover:bg-purple-50/30"
                }`}
            >
              <input
                type="file"
                id="resumeFileInput"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="resumeFileInput" className="cursor-pointer w-full flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-700 truncate max-w-[200px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - Ready to upload
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-gray-700">
                      Click to browse or drag & drop file
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">PDF or DOCX (Max size: 5MB)</p>
                  </div>
                )}
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4">
                {isUploading && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                <button
                  onClick={handleUploadResume}
                  disabled={isUploading}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isUploading ? "Uploading..." : "Save & Update Resume"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* -- Right Column: Resume Details & Skills -- */}
        <div className="lg:col-span-2 space-y-5">
          {/* Professional Headline */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-purple-600" />
              Professional Headline / Summary
            </h3>
            <textarea
              rows={3}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
              placeholder="Write a short summary highlighting your course, core skills, and career goals..."
            />
          </div>

          {/* Technical Skills */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-purple-600" />
              Technical & Core Skills
            </h3>

            {/* Existing Skill Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a new skill (e.g. Docker, Express.js)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </div>

          {/* Social & Portfolio Links */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              Portfolio & Social Links
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  GitHub Profile URL
                </label>
                <div className="relative">
                  <Share2 className="w-4 h-4 text-slate-800 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Personal Portfolio Website
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveDetails}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Profile Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

