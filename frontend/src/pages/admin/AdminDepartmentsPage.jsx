import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  GraduationCap,
  Mail,
  MapPin,
  CheckCircle2
} from "lucide-react";
import {
  getDepartments,
  saveDepartment,
  deleteDepartment,
  getCourses,
  getFacultyMembers,
  getDepartmentDependencies
} from "../../hooks/academicMasterData";
import Pagination from "../../components/common/Pagination";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState(() => getDepartments());
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    hodName: "",
    hodEmail: "",
    hodPhone: "",
    buildingBlock: "",
    establishedYear: "",
    description: "",
    status: "Active"
  });

  const reloadData = () => {
    setDepartments(getDepartments());
  };

  useEffect(() => {
    window.addEventListener("academicDataUpdated", reloadData);
    window.addEventListener("storage", reloadData);
    return () => {
      window.removeEventListener("academicDataUpdated", reloadData);
      window.removeEventListener("storage", reloadData);
    };
  }, []);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      name: "",
      code: "",
      hodName: "",
      hodEmail: "",
      hodPhone: "",
      buildingBlock: "",
      establishedYear: new Date().getFullYear(),
      description: "",
      status: "Active"
    });
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({ ...dept });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const department = departments.find((item) => item.id === id);
    const dependencies = getDepartmentDependencies(department);
    if (dependencies.courses || dependencies.batches || dependencies.students) {
      alert(`This department is connected to ${dependencies.courses} course(s), ${dependencies.batches} batch(es), and ${dependencies.students} student(s). Reassign or remove those records first.`);
      return;
    }
    if (window.confirm("Are you sure you want to delete this department?")) {
      deleteDepartment(id);
      showNotification("Department deleted successfully.");
      reloadData();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert("Please provide Department Name and Code.");
      return;
    }
    const duplicate = departments.some((department) => (
      department.id !== editingDept?.id && (
        department.name?.trim().toLowerCase() === formData.name.trim().toLowerCase() ||
        department.code?.trim().toLowerCase() === formData.code.trim().toLowerCase()
      )
    ));
    if (duplicate) {
      alert("A department with this name or code already exists.");
      return;
    }

    saveDepartment({
      ...(editingDept ? { id: editingDept.id } : {}),
      ...formData,
      totalCourses: editingDept?.totalCourses || 0,
      totalFaculty: editingDept?.totalFaculty || 0,
      totalStudents: editingDept?.totalStudents || 0
    });

    showNotification(editingDept ? "Department updated successfully!" : "New Department created successfully!");
    setShowModal(false);
    reloadData();
  };

  const filteredDepartments = departments.filter((d) => {
    const q = (searchTerm || "").toLowerCase();
    return (
      (d.name || "").toLowerCase().includes(q) ||
      (d.code || "").toLowerCase().includes(q) ||
      (d.hodName || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-black border border-purple-200 uppercase tracking-wider">
              Academic Departments
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
              {departments.length} Active Wings
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Departments & Faculty Wings
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Create, update, and manage academic departments and Head of Department (HOD) allocations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-purple-200 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Department
        </button>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search department, code, HOD..."
            className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDepartments.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800">No Academic Departments Added Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the "Create Department" button above to add your institution's departments and assign HODs.
            </p>
          </div>
        ) : (
          filteredDepartments
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((dept) => {
              const allCourses = getCourses();
              const realCoursesCount = allCourses.filter(
                (c) => c.departmentCode === dept.code || c.department === dept.name || (c.departmentCode && dept.code && c.departmentCode.toLowerCase() === dept.code.toLowerCase())
              ).length;
              const allFaculty = getFacultyMembers();
              const realFacultyCount = allFaculty.filter(
                (f) => f.departmentCode === dept.code || f.department === dept.name || (f.department && dept.name && f.department.toLowerCase() === dept.name.toLowerCase())
              ).length;

              const displayCourses = realCoursesCount;
              const displayFaculty = realFacultyCount;

              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-black text-sm shrink-0">
                        {dept.code || "DEP"}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 leading-tight">
                          {dept.name}
                        </h3>
                        <p className="text-xs font-bold text-purple-700 mt-0.5">
                          Est. {dept.establishedYear} - Code: {dept.code}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1.5 hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-lg transition-colors cursor-pointer"
                        title="Edit Department"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Head of Department (HOD)</p>
                      <p className="font-bold text-slate-800">{dept.hodName}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{dept.hodPhone}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Campus Location</p>
                      <p className="font-bold text-slate-800">{dept.buildingBlock}</p>
                      <p className="text-[11px] text-purple-700 font-bold">{displayCourses} Programs - {displayFaculty} Faculty</p>
                    </div>
                  </div>
                </div>
              );
            }))}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredDepartments.length / itemsPerPage) || 1}
        totalItems={filteredDepartments.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p) => setCurrentPage(p)}
        onItemsPerPageChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        itemsPerPageOptions={[6, 12, 24]}
      />

      {/* Create / Edit Department Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  {editingDept ? "Edit Department" : "Create New Department"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter department name"
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Department Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. DCA"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Est. Year</label>
                    <input
                      type="number"
                      value={formData.establishedYear}
                      onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Head of Department (HOD)</label>
                    <input
                      type="text"
                      value={formData.hodName}
                      onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                      placeholder="Enter HOD name"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">HOD Phone</label>
                    <input
                      type="text"
                      value={formData.hodPhone}
                      onChange={(e) => setFormData({ ...formData, hodPhone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Campus Building Location</label>
                  <input
                    type="text"
                    value={formData.buildingBlock}
                    onChange={(e) => setFormData({ ...formData, buildingBlock: e.target.value })}
                    placeholder="Block A - Ramanujan IT Tower"
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl font-extrabold text-slate-900 text-xs outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-200 transition-all cursor-pointer"
                  >
                    {editingDept ? "Save Changes" : "Create Department"}
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

