import React, { useState } from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

interface Project {
  id: number;
  workId: string;
  name: string;
  leadName: string;
  quotationNo: string;
  workStatus: "not-started" | "in-progress" | "completed";
  startDate: string;
  dueDate: string;
  assignedTo: string;
}

export default function StatusTracking() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      workId: "W-001",
      name: "Website Development",
      leadName: "John Smith",
      quotationNo: "Q-1001",
      workStatus: "in-progress",
      startDate: "2024-01-10",
      dueDate: "2024-02-10",
      assignedTo: "Andrea Pirlo",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<Project>({
    id: 0,
    workId: "",
    name: "",
    leadName: "",
    quotationNo: "",
    workStatus: "not-started",
    startDate: "",
    dueDate: "",
    assignedTo: "",
  });

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditProject(project);
      setFormData(project);
    } else {
      setEditProject(null);
      setFormData({
        id: 0,
        workId: "",
        name: "",
        leadName: "",
        quotationNo: "",
        workStatus: "not-started",
        startDate: "",
        dueDate: "",
        assignedTo: "",
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (editProject) {
      // update
      setProjects((prev) =>
        prev.map((p) => (p.id === editProject.id ? { ...formData } : p))
      );
    } else {
      // add new
      setProjects((prev) => [
        ...prev,
        { ...formData, id: prev.length + 1 },
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      setProjects((prev) => prev.filter((p) => p.id !== deleteId));
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const filteredProjects =
    filterStatus === "all"
      ? projects
      : projects.filter((project) => project.workStatus === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Work Status Tracking
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor work progress and payment status
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/50 border border-white/30 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-600"
          >
            <Plus size={16} className="mr-2" /> Add Work
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/20">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Work ID
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Project
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                Name
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Quotation No
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Status
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Timeline
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-800">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-white/20 transition-colors"
                >
                  <td className="px-6 py-4">{project.workId}</td>
                  <td className="px-6 py-4">{project.name}</td>
                  <td className="px-6 py-4">{project.leadName}</td>
                  <td className="px-6 py-4">{project.quotationNo}</td>
                  <td className="px-6 py-4 capitalize">{project.workStatus}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-800 font-medium flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {project.startDate} → {project.dueDate}
                    </p>
                  </td>
                  <td className="px-6 py-4">{project.assignedTo}</td>
                  <td className="px-6 py-4 flex space-x-3">
                    <button
                      onClick={() => handleOpenModal(project)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
     {/* Add/Edit Modal */}
{showModal && (
  <div className="fixed inset-0 bg-black/40 rounded-2xl backdrop-blur-sm flex items-center justify-center animate-fadeIn z-50">
    <div className="bg-white w-[700px] shadow-2xl border border-gray-300">
      
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-white">
          {editProject ? "Edit Work" : "Add Work"}
        </h3>
        <p className="text-xs text-teal-100 mt-1">
          Fill in the details below to continue
        </p>
      </div>

     
     {/* Modal Body */}
<div className="p-6 space-y-4 bg-white">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Work ID</label>
      <input
        type="text"
        placeholder="Enter Work ID"
        value={formData.workId}
        onChange={(e) => setFormData({ ...formData, workId: e.target.value })}
        className="w-full border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
      <input
        type="text"
        placeholder="Enter project name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Name</label>
      <input
        type="text"
        placeholder="Enter lead name"
        value={formData.leadName}
        onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
        className="w-full border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Quotation No</label>
      <input
        type="text"
        placeholder="Enter quotation number"
        value={formData.quotationNo}
        onChange={(e) => setFormData({ ...formData, quotationNo: e.target.value })}
        className="w-full border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
      <input
        type="date"
        value={formData.startDate}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        className="w-full border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
      <input
        type="date"
        value={formData.dueDate}
        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        className="w-full border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
      <select
        value={formData.workStatus}
        onChange={(e) =>
          setFormData({ ...formData, workStatus: e.target.value as Project["workStatus"] })
        }
        className="w-full border border-gray-300 px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
      >
        <option value="not-started">🟠 Not Started</option>
        <option value="in-progress">🔵 In Progress</option>
        <option value="completed">🟢 Completed</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
      <input
        type="text"
        placeholder="Assigned to"
        value={formData.assignedTo}
        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
        className="w-full border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
      />
    </div>
  </div>
</div>

      {/* Modal Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600">
              Are you sure you want to delete this work?
            </p>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
