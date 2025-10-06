import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "universal-cookie";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface Assign {
  id: number;
  name: string;
  email: string;
  mobile: string;
  projectName: string;
  assigntask: string;
  status: "New" | "Positive";
  source: string;
  lastFollowUp: string;
  assignTo: string;
}

const AssignManagement: React.FC = () => {
  const [assigns, setAssigns] = useState<Assign[]>([]);
  const [loading, setLoading] = useState(false);

  const cookies = new Cookies();

  const initialFormData: Omit<Assign, "id"> = {
   name: "",
    email: "",
    mobile: "",
    projectName: "",
    assigntask: "",
    status: "New",
    source: "",
    lastFollowUp: "",
    assignTo: "",
  };

  const [formData, setFormData] = useState<Omit<Assign, "id">>(initialFormData);
  const [editAssign, setEditAssign] = useState<Assign | null>(null);
  const [deleteAssign, setDeleteAssign] = useState<Assign | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialFormData, string>>>({});

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const assignsPerPage = 5;

  const filteredAssigns = assigns.filter((a) =>
    [a.name, a.email, a.mobile, a.projectName]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(Math.ceil(filteredAssigns.length / assignsPerPage), 1);
  const indexOfLastAssign = currentPage * assignsPerPage;
  const indexOfFirstAssign = indexOfLastAssign - assignsPerPage;
  const currentAssigns = filteredAssigns.slice(indexOfFirstAssign, indexOfLastAssign);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Fetch Assigns from API
  const getAssigns = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/lead-assign-list`,
        { page: 1, searchString: "" },
        {
          headers: { Authorization: `Bearer ${cookies.get("auth")}` },
        });
      if (res.data.status === "SUCCESS") {
        setAssigns(res.data.data || []);
      } else {
        toast.warn(res.data.message);
        setAssigns([]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error fetching assigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAssigns();
  }, []);

  // ✅ Validation
  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "Client name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.mobile.trim()) newErrors.mobile = "mobile is required";
    if (!formData.projectName.trim()) newErrors.projectName = "Project name is required";
    if (!formData.assigntask.trim()) newErrors.assigntask = "Assign task is required";
    if (!formData.assignTo.trim()) newErrors.assignTo = "Assign To is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //  Save Assign (Add / Update)
  const handleSaveAssign = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      let apiUrl = `${import.meta.env.VITE_BACKEND_URL}/lead-assign`;
      let payload: any = { ...formData };

      if (editAssign) {
        apiUrl = `${import.meta.env.VITE_BACKEND_URL}/update-lead-assign`;
        payload = { ...payload, id: editAssign.id };
      }

      const res = await axios.post(apiUrl, payload, {
        headers: { Authorization: `Bearer ${cookies.get("auth")}` },
      });

      if (res.data.status === "SUCCESS") {
        toast.success(editAssign ? "Assign updated!" : "Assign added!");
        setEditAssign(null);
        setFormData(initialFormData);
        setShowModal(false);  
        getAssigns();
      }
      else {
        toast.warn(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving assign.");
    } finally {
      setLoading(false);
    }
  };

  //  Delete Assign
  const handleDelete = async () => {
    if (!deleteAssign) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/delete-lead-assign`,
        { id: deleteAssign.id },
        { headers: { Authorization: `Bearer ${cookies.get("auth")}` } }
      );

      if (res.data.status === "SUCCESS") {
        toast.success("Assign deleted!");
        setDeleteAssign(null);
        getAssigns();
      } else {
        toast.warn(res.data.message);
      }
    } catch (error: any) {
      toast.error("Error deleting assign.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assign: Assign) => {
    setEditAssign(assign);
    setFormData(assign);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Assign Management</h2>
          <p className="text-gray-600 mt-1">Create, edit and manage assigns</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search assigns..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Add Assign */}
          <button
            onClick={() => {
              setFormData(initialFormData);
              setEditAssign(null);
              setShowModal(true);
            }}
            className="bg-teal-600 text-white px-6 py-2 rounded-xl hover:bg-teal-700 transition-colors flex items-center space-x-2 font-medium"
          >
            <Plus size={20} />
            <span>Add Assign</span>
          </button>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-3">
            <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-100 rounded-lg">First</button>
            <span className="px-5 py-2 bg-teal-600 text-white rounded-lg">{currentPage}</span>
            <p>OF</p>
            <span className="px-5 py-2 bg-gray-50 text-gray-700 border rounded-lg">{totalPages}</span>
            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-100 rounded-lg">Last</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/20 text-left">
            <tr>
              <th className="px-4 py-2">Sr.</th>
              <th className="px-4 py-2">Client Name</th>
              <th className="px-4 py-2">mobile</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Project Name</th>
              <th className="px-4 py-2">Assign Task</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAssigns.length > 0 ? currentAssigns.map((assign, index) => (
              <tr key={assign.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{indexOfFirstAssign + index + 1}</td>
                <td className="px-4 py-2">{assign.name}</td>
                <td className="px-4 py-2">{assign.mobile}</td>
                <td className="px-4 py-2">{assign.email}</td>
                <td className="px-4 py-2">{assign.projectName}</td>
                <td className="px-4 py-2">{assign.assigntask}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="text-teal-600" onClick={() => handleEdit(assign)}><Edit size={20} /></button>
                  <button className="text-red-600" onClick={() => setDeleteAssign(assign)}><Trash2 size={20} /></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">No assigns found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-[600px] shadow-2xl rounded-xl border border-gray-300">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-white">{editAssign ? "Edit Assign" : "Add Assign"}</h3>
            </div>
            <div className="p-6 space-y-4 grid grid-cols-1 gap-4">
              <input type="text" placeholder="Client Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={`w-full border px-3 py-2 rounded-lg ${errors.name ? "border-red-500" : ""}`} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={`w-full border px-3 py-2 rounded-lg ${errors.email ? "border-red-500" : ""}`} />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

              <input type="text" placeholder="mobile" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className={`w-full border px-3 py-2 rounded-lg ${errors.mobile ? "border-red-500" : ""}`} />
              {errors.mobile && <p className="text-red-500 text-xs">{errors.mobile}</p>}

              <input type="text" placeholder="Project Name" value={formData.projectName} onChange={e => setFormData({ ...formData, projectName: e.target.value })} className={`w-full border px-3 py-2 rounded-lg ${errors.projectName ? "border-red-500" : ""}`} />
              {errors.projectName && <p className="text-red-500 text-xs">{errors.projectName}</p>}

              <input type="text" placeholder="Assign Task" value={formData.assigntask} onChange={e => setFormData({ ...formData, assigntask: e.target.value })} className={`w-full border px-3 py-2 rounded-lg ${errors.assigntask ? "border-red-500" : ""}`} />
              {errors.assigntask && <p className="text-red-500 text-xs">{errors.assigntask}</p>}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button onClick={() => { setFormData(initialFormData); setEditAssign(null); }} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleSaveAssign} className="px-5 py-2 bg-teal-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteAssign && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-[500px] shadow-2xl border border-gray-300 rounded-xl">
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-white">Confirm Delete</h3>
            </div>
            <div className="p-6 text-gray-700">
              Are you sure you want to delete <strong>{deleteAssign.name}</strong>?
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setDeleteAssign(null)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2 bg-red-600 text-white rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignManagement;
