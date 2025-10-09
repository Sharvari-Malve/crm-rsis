import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "universal-cookie";
import { Edit, Plus, Search, Upload, Eye, Trash2 } from "lucide-react";

interface Lead {
  id: number;
  clientName: string;
  projectName: string;
  followUpDate?: string; 
  remark?: string;
  mode?: "Call" | "Email" | "WhatsApp" | "Other";
  nextFollowUpDate?: string;
  followUpBy?: string;
  status?: "Pending" | "Approved" | "Rejected" | "Other";
  phone?: string;
  email?: string;
  quotationFile?: string | File | null;
}

export default function FollowUpManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const cookies = new Cookies();

  // Pagination & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 5;

  const filteredLeads = leads.filter((lead) =>
    [lead.clientName, lead.projectName, lead.email, lead.phone].join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(Math.ceil(filteredLeads.length / leadsPerPage), 1);
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLead, setUploadLead] = useState<Lead | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<Partial<Lead>>({
    id: undefined,
    clientName: "",
    projectName: "",
    nextFollowUpDate: "",
    followUpBy: "",
    remark: "",
    mode: "Call",
    status: "Pending",
    quotationFile: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Lead, "id" | "quotationFile">, string>>>({});

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  const getLeads = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-follow-up-list`, {
        params: {
          page: 1,
          limit: 10,
          search: "",
        },
        headers: {
          Authorization: `Bearer ${cookies.get("auth")}`,
        },
      });

      if (res.data.status === "SUCCESS") {
        const followUps = res.data.data.followUps || [];
        // Map backend fields to frontend Lead interface
        const mappedLeads: Lead[] = followUps.map((f: any) => ({
          id: f.id,
          clientName: f.clientName || "",
          projectName: f.projectName || "",
          followUpBy: f.followUpByName || "",
          followUpDate: f.followUpDate || "",
          nextFollowUpDate: f.nextFollowUp || "",
          remark: f.remark || "",
          mode: f.mode || "Call",
          status: f.status || "Pending",
          phone: f.phone || "",
          email: f.email || "",
          quotationFile: f.quotationFile || null,
        }));
        setLeads(mappedLeads);
      } else {
        toast.warn(res.data.message);
        setLeads([]);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error fetching leads");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    getLeads();
  }, []);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    // Required fields (for follow-up entry)
    if (!formData.nextFollowUpDate) newErrors.nextFollowUpDate = "Next Follow-Up Date is required";
    if (!formData.followUpBy || !String(formData.followUpBy).trim()) newErrors.followUpBy = "Follow-Up By is required";
    if (!formData.mode) newErrors.mode = "Mode is required";
    if (!formData.status) newErrors.status = "Status is required";
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };



  const handleSaveLead = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      let apiUrl = `${import.meta.env.VITE_BACKEND_URL}/add-follow-up`;
      const payload: any = {
        ...formData,
      };

      // If there's a file attached, use FormData
      if (editLead) {
        apiUrl = `${import.meta.env.VITE_BACKEND_URL}/update-follow-up`;
        payload.id = editLead.id;
      }

      let res;
      if (formData.quotationFile instanceof File) {
        const fd = new FormData();
        Object.keys(payload).forEach((k) => fd.append(k, (payload as any)[k]));
        fd.append("quotationFile", formData.quotationFile as File);
        res = await axios.post(apiUrl, fd, {
          headers: { Authorization: `Bearer ${cookies.get("auth")}` },
        });
      } else {
        res = await axios.post(apiUrl, payload, {
          headers: { Authorization: `Bearer ${cookies.get("auth")}` },
        });
      }

      if (res.data.status === "SUCCESS") {
        toast.success(editLead ? "Lead updated!" : "Lead added!");
        setShowFormModal(false);
        setEditLead(null);
        getLeads();
      } else {
        toast.warn(res.data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error saving lead");
    } finally {
      setLoading(false);
    }
  };


  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setUploadFile(e.target.files[0]);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile || !uploadLead) return;
    try {
      setLoading(true);
      const form = new FormData();
      form.append("id", uploadLead.id.toString());
      form.append("quotationFile", uploadFile);

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/upload-quotation`, form, {
        headers: {
          Authorization: `Bearer ${cookies.get("auth")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.status === "SUCCESS") {
        toast.success("File uploaded successfully!");
      } else {
        toast.warn(res.data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error uploading file");
    } finally {
      setUploadLead(null);
      setUploadFile(null);
      setShowUploadModal(false);
      getLeads();
      setLoading(false);
    }
  };

  // Handlers
  const handleAddLead = () => {
    setFormData({
      id: undefined,
      clientName: "",
      projectName: "",
      nextFollowUpDate: "",
      followUpBy: "",
      remark: "",
      mode: "Call",
      status: "Pending",
      quotationFile: null,
    });
    setEditLead(null);
    setErrors({});
    setShowFormModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    // populate the simpler follow-up form
    setFormData({
      id: lead.id,
      clientName: lead.clientName,
      projectName: lead.projectName,
      nextFollowUpDate: lead.nextFollowUpDate || "",
      followUpBy: lead.followUpBy || "",
      remark: lead.remark || "",
      mode: lead.mode || "Call",
      status: lead.status || "Pending",
      quotationFile: lead.quotationFile || null,
    });
    setEditLead(lead);
    setErrors({});
    setShowFormModal(true);
  };

  // Delete handling
  const confirmDelete = (lead: Lead) => {
    setDeleteTarget(lead);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/delete-follow-up`, { id: deleteTarget.id }, {
        headers: { Authorization: `Bearer ${cookies.get("auth")}` },
      });
      if (res.data?.status === "SUCCESS") {
        toast.success("Follow-up deleted");
        setLeads((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      } else {
        toast.warn(res.data?.message || "Could not delete");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting follow-up");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // determine header left values
  const headerLead = editLead || (currentLeads.length ? currentLeads[0] : null);

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Follow Up Management</h2>
          <p className="text-gray-600 mt-1">{headerLead ? `${headerLead.clientName} • ${headerLead.projectName}` : 'All Leads'}</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search FollowUps..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <button
            onClick={handleAddLead}
            className="bg-teal-600 text-white px-6 py-2 rounded-xl hover:bg-teal-700 transition-colors flex items-center space-x-2 font-medium"
          >
            <Plus size={20} /> <span>Add Follow-Up</span>
          </button>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-3 mt-3">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400"
            >
              First
            </button>
            <span className="px-5 py-2 rounded-lg bg-teal-600 text-white font-semibold">{currentPage}</span>
            <p>OF</p>
            <span className="px-5 py-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-300">{totalPages}</span>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 overflow-hidden">
        {/* Desktop table (md and up) */}
        <div className="hidden md:block w-full overflow-x-auto scrollbar-hide max-h-[400px]">
          <table className="w-full min-w-[900px]">
          <thead className="bg-white/20 sticky top-0">
            <tr>
              <th className="px-2 py-3">Sr. No</th>
              <th className="px-6 py-3">Follow Update</th>
              <th className="px-6 py-3">Next Follow Up</th>
              <th className="px-6 py-3">Follow Up By</th>
              <th className="px-6 py-3">Remark</th>
              <th className="px-6 py-3">Mode</th>
              <th className="px-6 py-3">Quotation</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y text-center">
            {currentLeads.map((lead, index) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">{indexOfFirstLead + index + 1}</td>
                <td className="px-6 py-3">{lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString('en-GB') : '-'}</td>
                <td className="px-6 py-3">{lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString('en-GB') : '-'}</td>
                <td className="px-6 py-3">{lead.followUpBy || '-'}</td>
                <td className="px-6 py-3">{lead.remark || '-'}</td>
                <td className="px-6 py-3">{lead.mode || '-'}</td>
                <td className="px-6 py-3">
                  {lead.quotationFile ? (
                    <button
                      onClick={() => {
                        if (typeof lead.quotationFile === 'string') {
                          window.open(lead.quotationFile, '_blank');
                        } else {
                          const url = URL.createObjectURL(lead.quotationFile as File);
                          window.open(url, '_blank');
                        }
                      }}
                      className="text-blue-600"
                    >
                      <Eye size={18} />
                    </button>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-3">{lead.status}</td>
                <td className="px-6 py-3 flex items-center justify-center space-x-2">
                  <button onClick={() => handleEditLead(lead)} className="text-green-600" title="Edit">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => { setUploadLead(lead); setShowUploadModal(true); }} className="text-teal-600" title="Upload Quotation">
                    <Upload size={18} />
                  </button>
                  <button onClick={() => confirmDelete(lead)} className="text-red-600" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {currentLeads.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500">
                  No follow-ups found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden p-4 space-y-3">
          {currentLeads.map((lead, index) => (
            <div key={lead.id} className="bg-white rounded-lg p-3 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">{indexOfFirstLead + index + 1}. {lead.clientName} • {lead.projectName}</div>
                  <div className="text-xs text-gray-500 mt-1">Next: {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString('en-GB') : '-'}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleEditLead(lead)} className="text-green-600"><Edit size={16} /></button>
                  <button onClick={() => { setUploadLead(lead); setShowUploadModal(true); }} className="text-teal-600"><Upload size={16} /></button>
                  <button onClick={() => confirmDelete(lead)} className="text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <div>Follow Up By: {lead.followUpBy || '-'}</div>
                <div>Mode: {lead.mode || '-'}</div>
                <div>Remark: {lead.remark || '-'}</div>
                <div>Status: {lead.status || '-'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] shadow-2xl border border-gray-300 rounded-xl flex flex-col">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-white">{editLead ? "Edit Follow-Up" : "Add Follow-Up"}</h3>
            </div>

            {/* Form Container with fixed height and scroll */}
            <div className="p-6 grid grid-cols-1 gap-4 overflow-y-auto flex-1">
              {/* Next Follow-Up Date */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Next Follow Up Date</label>
                <input
                  type="date"
                  value={formData.nextFollowUpDate || ""}
                  onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.nextFollowUpDate ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-sm min-h-[1.25rem]">{errors.nextFollowUpDate || ""}</p>
              </div>

              {/* Follow Up By */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Follow Up By</label>
                <input
                  type="text"
                  placeholder="Follow Up By"
                  value={formData.followUpBy || ""}
                  onChange={(e) => setFormData({ ...formData, followUpBy: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.followUpBy ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-sm min-h-[1.25rem]">{errors.followUpBy || ""}</p>
              </div>

              {/* Remark */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Remark</label>
                <textarea
                  rows={3}
                  placeholder="Remark"
                  value={formData.remark || ""}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg`}
                />
              </div>

              {/* Mode */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Mode</label>
                <select
                  value={formData.mode || "Call"}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.mode ? "border-red-500" : ""}`}
                >
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-red-500 text-sm min-h-[1.25rem]">{errors.mode || ""}</p>
              </div>

              {/* Upload Quotation */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Upload Quotation</label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setFormData({ ...formData, quotationFile: e.target.files[0] });
                  }}
                  className="w-full"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Status</label>
                <select
                  value={formData.status || "Pending"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.status ? "border-red-500" : ""}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-red-500 text-sm min-h-[1.25rem]">{errors.status || ""}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
              <button onClick={() => setShowFormModal(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                Cancel
              </button>
              <button onClick={handleSaveLead} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md shadow-2xl border border-gray-300 rounded-xl p-6">
            <h3 className="text-lg font-semibold">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mt-2">Are you sure you want to delete follow-up for <strong>{deleteTarget.clientName}</strong>?</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete</button>
            </div>
          </div>
        </div>
      )}


      {/* Upload Modal */}
      {showUploadModal && uploadLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md shadow-2xl border border-gray-300 rounded-xl">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-white">Upload Quotation</h3>
            </div>
            <div className="p-6 space-y-4">
              <input type="file" onChange={handleFileUpload} className="w-full" />
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                Cancel
              </button>
              <button onClick={handleUploadSubmit} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="loader border-t-4 border-teal-600 w-12 h-12 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
