import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "universal-cookie";
import { Edit, UserPlus, Plus, Trash2, Search } from "lucide-react";

interface Lead {
  id: number;
  name: string;
  email: string;
  mobile: string;
  company: string;
  leadSource: string;
  projectName: string;
  interestPercentage: number;
}

interface LeadManagementProps {
  setActiveTab: (tab: string) => void;
}

export default function LeadManagement({ setActiveTab }: LeadManagementProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null);
  const cookies = new Cookies();

  const [formData, setFormData] = useState<Omit<Lead, "id">>({
    name: "",
    email: "",
    mobile: "",
    company: "",
    leadSource: "",
    projectName: "",
    interestPercentage: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 5;

  // Assign Technician Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [technicianList, setTechnicianList] = useState<{ id: number; username: string; mobile: string }[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null); // store mobile

  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [technicianSearch, setTechnicianSearch] = useState("");

  const filteredTechnicians = technicianList.filter((tech) =>
    (tech.username || "").toLowerCase().includes(technicianSearch.toLowerCase()) ||
    (tech.mobile || "").includes(technicianSearch)
  );
  // Filter leads safely
  const filteredLeads = leads.filter((lead) => {
    if (!lead) return false;

    const combined = [
      lead.name || "",
      lead.email || "",
      lead.mobile || "",
      lead.projectName || "",
    ].join(" ").toLowerCase();

    return combined.includes((searchQuery || "").toLowerCase());
  });

  const totalPages = Math.max(Math.ceil(filteredLeads.length / leadsPerPage), 1);
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Get Leads API
  const getLeads = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/get-lead-list`,
        { page: 1, searchString: "" },
        { headers: { Authorization: `Bearer ${cookies.get("auth")}` } }
      );
      if (res.data.status === "SUCCESS") setLeads(res.data.data || []);
      else {
        toast.warn(res.data.message);
        setLeads([]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error fetching leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLeads();
  }, []);

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.clientName = "Client name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email.";
    if (!formData.mobile.trim()) newErrors.contact = "Contact is required.";
    if (!formData.projectName.trim()) newErrors.projectName = "Project name is required.";
    if (!formData.leadSource.trim()) newErrors.leadSource = "Lead source is required.";
    if (formData.interestPercentage == null || isNaN(formData.interestPercentage) || formData.interestPercentage < 0 || formData.interestPercentage > 100)
      newErrors.interestedPercent = "Enter a valid percentage (0-100).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create / Update Lead API
  const handleSaveLead = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      let apiUrl = `${import.meta.env.VITE_BACKEND_URL}/create-lead`;
      let payload: any = { ...formData };
      if (editLead) {
        apiUrl = `${import.meta.env.VITE_BACKEND_URL}/update-lead`;
        payload = { ...formData, id: editLead.id };
      }
      const res = await axios.post(apiUrl, payload, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${cookies.get("auth")}` } });
      if (res.data.status === "SUCCESS") {
        toast.success(editLead ? "Lead updated!" : "Lead added!");
        setShowFormModal(false);
        getLeads();
      } else toast.warn(res.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving lead.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Lead API
  const confirmDeleteLead = async () => {
    if (!deleteLead) return;
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/delete-lead`,
        { id: deleteLead.id },
        { headers: { Authorization: `Bearer ${cookies.get("auth")}` } }
      );
      if (res.data.status === "SUCCESS") {
        toast.success("Lead deleted successfully!");
        setShowDeleteModal(false);
        getLeads();
      } else toast.warn(res.data.message);
    } catch {
      toast.error("Error deleting lead.");
    } finally {
      setLoading(false);
    }
  };

  // Assign Technician

  const handleOpenAssignModal = async (lead: Lead) => {
    // Set the current lead and reset other modal states
    setCurrentLead(lead);
    setSelectedTechnicianId(null); // reset selected technician
    setTechnicianSearch("");       // clear search
    setShowAssignModal(true);      // open modal immediately

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/get-user-assign-list`,
        { search: "" },
        { headers: { Authorization: `Bearer ${cookies.get("auth")}` } }
      );

      if (Array.isArray(res.data?.data)) {
        //Ensure IDs are stored
        setTechnicianList(
          res.data.data.map((tech: any) => ({
            id: tech.id,
            username: tech.username,
            mobile: tech.mobile,
          }))
        );
      } else {
        setTechnicianList([]);
        toast.warn(res.data?.message || "No technicians found");
      }
    } catch (error: any) {
      setTechnicianList([]);
      toast.error(error.response?.data?.message || "Error fetching technicians.");
    }
  };



  const handleConfirmAssign = async () => {
    if (!currentLead || !selectedTechnicianId) return;
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/lead-assign`,
        {
          leadId: currentLead.id,
          technicianId: selectedTechnicianId,
        },
        { headers: { Authorization: `Bearer ${cookies.get("auth")}` } }
      );
      if (res.data.status === "SUCCESS") {
        toast.success("Technician assigned successfully!");
        setShowAssignModal(false);
      } else toast.warn(res.data.message);
    } catch {
      toast.error("Error assigning technician.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = () => {
    setFormData({ name: "", email: "", mobile: "", company: "", leadSource: "", projectName: "", interestPercentage: 0 });
    setEditLead(null);
    setShowFormModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setFormData({ ...lead });
    setEditLead(lead);
    setShowFormModal(true);
  };

  const handleDeleteLead = (lead: Lead) => {
    setDeleteLead(lead);
    setShowDeleteModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Lead Management</h2>
          <p className="text-gray-600 mt-1">Create, edit and manage Leads</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          {/* Add Lead */}
          <button
            onClick={handleAddLead}
            className="bg-teal-600 text-white px-6 py-2 rounded-xl hover:bg-teal-700 transition-colors flex items-center space-x-2 font-medium"
          >
            <Plus size={20} />
            <span>Add Lead</span>
          </button>
          {/* Pagination */}
          <div className="flex justify-center items-center space-x-3">
            <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400 shadow-sm transition-all transform hover:scale-105">First</button>
            <span className="px-5 py-2 rounded-lg bg-teal-600 text-white font-semibold shadow-md">{currentPage}</span>
            <p>OF</p>
            <span className="px-5 py-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-300 shadow-sm">{totalPages}</span>
            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400 shadow-sm transition-all transform hover:scale-105">Last</button>
          </div>
        </div>
      </div>

     {/* Responsive Table */}
<div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 overflow-hidden">
  {/* Mobile wrapper for horizontal scroll */}
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y">
      <thead className="bg-white/20 text-lg">
        <tr>
          <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Sr. No</th>
          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Client Name</th>
          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Company</th>
          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Contact</th>
          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Email</th>
          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Project Name</th>
          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Source</th>
          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Interested %</th>
          <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {currentLeads.length > 0 ? (
          currentLeads.map((lead, index) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">{indexOfFirstLead + index + 1}</td>
              <td className="px-6 py-3 cursor-pointer whitespace-nowrap" onClick={() => setActiveTab("follow")}>{lead.name}</td>
              <td className="px-6 py-3 whitespace-nowrap">{lead.company}</td>
              <td className="px-6 py-3 whitespace-nowrap">{lead.mobile}</td>
              <td className="px-6 py-3 whitespace-nowrap">{lead.email}</td>
              <td className="px-6 py-3 whitespace-nowrap">{lead.projectName}</td>
              <td className="px-6 py-3 whitespace-nowrap">{lead.leadSource}</td>
              <td className="px-6 py-3 whitespace-nowrap">{lead.interestPercentage}%</td>
              <td className="px-6 py-3 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <button className="text-teal-600" onClick={() => handleEditLead(lead)}><Edit size={22} /></button>
                  <button className="text-red-600" onClick={() => handleDeleteLead(lead)}><Trash2 size={22} /></button>
                  <button className="text-indigo-600 hover:text-indigo-800" title="Assign" onClick={() => handleOpenAssignModal(lead)}><UserPlus size={22} /></button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={9} className="text-center py-6 text-gray-500">No leads found</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-[700px] shadow-2xl border border-gray-300 rounded-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-white">
                {editLead ? "Edit Lead" : "Add Lead"}
              </h3>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4">
              {/* Row 1: Client Name + Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full border px-3 py-2 rounded-lg ${errors.clientName ? "border-red-500" : ""
                      }`}
                  />
                  {errors.clientName && (
                    <p className="text-red-500 text-sm">{errors.clientName}</p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full border px-3 py-2 rounded-lg ${errors.email ? "border-red-500" : ""
                      }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Contact + Company */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Contact"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    className={`w-full border px-3 py-2 rounded-lg ${errors.contact ? "border-red-500" : ""
                      }`}
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-sm">{errors.contact}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              {/* Row 3: Project Name + Interest % */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                    className={`w-full border px-3 py-2 rounded-lg ${errors.projectName ? "border-red-500" : ""
                      }`}
                  />
                  {errors.projectName && (
                    <p className="text-red-500 text-sm">{errors.projectName}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Interested %"
                    value={formData.interestPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interestPercentage: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }

                    className={`w-full border px-3 py-2 rounded-lg ${errors.interestedPercent ? "border-red-500" : ""
                      }`}
                  />
                  {errors.interestedPercent && (
                    <p className="text-red-500 text-sm">{errors.interestedPercent}</p>
                  )}
                </div>
              </div>

              {/* Row 4: Lead Source */}
              <div>
                <select
                  value={formData.leadSource}
                  onChange={(e) =>
                    setFormData({ ...formData, leadSource: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded-lg ${errors.leadSource ? "border-red-500" : ""
                    }`}
                >
                  <option value="">Select Lead Source</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Other">Other</option>
                </select>
                {errors.leadSource && (
                  <p className="text-red-500 text-sm">{errors.leadSource}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
              <button
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLead}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Delete Modal */}
      {showDeleteModal && deleteLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-[500px] shadow-2xl border border-gray-300 rounded-xl">
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-white">
                Confirm Delete
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-lg">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteLead.name}
                </span>
                ?
              </p>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteLead}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showAssignModal && currentLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[500px] shadow-2xl border border-gray-300 rounded-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Assign Technician</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-white text-xl font-bold hover:text-gray-200"
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-3 border-b">
              <input
                type="text"
                placeholder="Search technician..."
                value={technicianSearch}
                onChange={(e) => setTechnicianSearch(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Body */}
            <div className="p-6 max-h-[300px] overflow-y-auto space-y-2">
              {filteredTechnicians.length > 0 ? (
                filteredTechnicians.map((tech) => (
                  <div
                    key={tech.mobile}
                    className="flex flex-col  p-2 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="technician"
                        value={tech.id}
                        checked={selectedTechnicianId === String(tech.id)}
                        onChange={() => setSelectedTechnicianId(String(tech.id))}
                        className="h-5 w-5"
                      />
                      <div className="font-medium">
                        {tech.username
                          .toLowerCase()
                          .split(" ")
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}{" "}({tech.mobile})
                      </div>

                    </label>

                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No technicians found</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={!selectedTechnicianId}
                onClick={handleConfirmAssign}
                className={`px-5 py-2 rounded-lg text-white font-semibold ${selectedTechnicianId ? "bg-gradient-to-r from-teal-600 to-teal-500 hover:bg-teal-700" : "bg-teal-200 cursor-not-allowed"
                  }`}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
