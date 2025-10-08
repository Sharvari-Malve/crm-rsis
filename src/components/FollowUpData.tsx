import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "universal-cookie";
import { Edit, Plus, Search, Upload, Eye } from "lucide-react";

interface Lead {
  id: number;
  clientName: string;
  projectName: string;
  followUpDate: string;
  remarks: "Call" | "Email" | "WhatsApp";
  nextFollowUpDate: string;
  followUpBy: string;
  status: "Pending" | "Approved" | "Rejected";
  phone: string;
  email: string;
  quotationFile?: File;
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
    id: undefined, // add id here
    clientName: "",
    projectName: "",
    followUpDate: "",
    remarks: "Call",
    nextFollowUpDate: "",
    followUpBy: "",
    status: "Pending",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Lead, "id" | "quotationFile">, string>>>({});

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
          remarks: f.remarks || "Call",
          status: f.status || "Pending",
          phone: f.phone || "",
          email: f.email || "",
          quotationFile: f.quotationFile || undefined,
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

    // Required fields
    if (!formData.clientName?.trim()) newErrors.clientName = "Client name is required";
    if (!formData.projectName?.trim()) newErrors.projectName = "Project name is required";
    if (!formData.followUpDate) newErrors.followUpDate = "Follow-Up Date is required";
    if (!formData.nextFollowUpDate) newErrors.nextFollowUpDate = "Next Follow-Up Date is required";
    if (!formData.remarks) newErrors.remarks = "Remarks is required";
    if (!formData.followUpBy?.trim()) newErrors.followUpBy = "Follow-Up By is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone must be 10 digits";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.status) newErrors.status = "Status is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };



  const handleSaveLead = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      let apiUrl = `${import.meta.env.VITE_BACKEND_URL}/add-follow-up`;
      let payload: any = { ...formData };

      if (editLead) {
        apiUrl = `${import.meta.env.VITE_BACKEND_URL}/update-follow-up`;
        payload.id = editLead.id;
      }

      const res = await axios.post(apiUrl, payload, {
        headers: { Authorization: `Bearer ${cookies.get("auth")}` },
      });

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
      followUpDate: "",
      remarks: "Call",
      nextFollowUpDate: "",
      followUpBy: "",
      status: "Pending",
      phone: "",
      email: "",
    });
    setEditLead(null);
    setErrors({});
    setShowFormModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setFormData({ ...lead });
    setEditLead(lead);
    setErrors({});
    setShowFormModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Follow Up Management</h2>
          <p className="text-gray-600 mt-1">Create, edit and manage Follow Up Data</p>
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
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 overflow-hidden max-h-[400px] overflow-y-auto scrollbar-hide">
        <table className="w-full min-w-[900px]">
          <thead className="bg-white/20 sticky top-0">
            <tr>
              <th className="px-2 py-3">Sr. No</th>
              <th className="px-6 py-3">Client Name</th>
              <th className="px-6 py-3">Project Name</th>
              <th className="px-6 py-3">Follow-up Date</th>
              <th className="px-6 py-3">Next Follow-up</th>
              <th className="px-6 py-3">Follow-up By</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-center">
            {currentLeads.map((lead, index) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">{indexOfFirstLead + index + 1}</td>
                <td className="px-6 py-3">{lead.clientName}</td>
                <td className="px-6 py-3">{lead.projectName}</td>
                <td className="px-6 py-3">
                  {new Date(lead.followUpDate).toLocaleDateString("en-GB")}
                </td>
                <td className="px-6 py-3">
                  {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  }) : "-"}
                </td>
                <td className="px-6 py-3">{lead.followUpBy}</td>
                <td className="px-6 py-3">
                  {lead.remarks === "Call" && <a href={`tel:${lead.phone}`}>Call</a>}
                  {lead.remarks === "Email" && <a href={`mailto:${lead.email}`}>Email</a>}
                  {lead.remarks === "WhatsApp" && <a href={`https://wa.me/${lead.phone.replace("+", "")}`} target="_blank">WhatsApp</a>}
                </td>
                <td className="px-6 py-3">{lead.status}</td>
                <td className="px-6 py-3 flex items-center space-x-2">
                  <button onClick={() => handleEditLead(lead)} className="text-green-600">
                    <Edit size={22} />
                  </button>
                  {lead.status === "Approved" && (
                    <>
                      {lead.quotationFile && (
                        <button
                          onClick={() => {
                            const url = URL.createObjectURL(lead.quotationFile!);
                            window.open(url, "_blank");
                          }}
                          className="text-blue-600"
                        >
                          <Eye size={22} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setUploadLead(lead);
                          setShowUploadModal(true);
                        }}
                        className="text-teal-600"
                      >
                        <Upload size={22} />
                      </button>
                    </>
                  )}
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



      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-[600px] max-h-[80vh] shadow-2xl border border-gray-300 rounded-xl flex flex-col">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-white">{editLead ? "Edit Follow-Up" : "Add Follow-Up"}</h3>
            </div>

            {/* Form Container with fixed height and scroll */}
            <div className="p-6 grid grid-cols-2 gap-4 overflow-y-auto flex-1">
              {/* Client Name */}
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="Client Name"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.clientName ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-sm min-h-[1.25rem]">{errors.clientName || ""}</p>
              </div>

              {/* Project Name */}
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.projectName ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-sm min-h-[1.25rem]">{errors.projectName || ""}</p>
              </div>

              {/* Follow-Up Date */}
              <div className="flex flex-col">
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.followUpDate ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-sm min-h-[1.25rem]">{errors.followUpDate || ""}</p>
              </div>

              {/* Next Follow-Up Date */}
              <div className="flex flex-col">
                <input
                  type="date"
                  value={formData.nextFollowUpDate}
                  onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.nextFollowUpDate ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-sm min-h-[1.25rem]">{errors.nextFollowUpDate || ""}</p>
              </div>

              {/* Remarks */}
              <div className="flex flex-col">
                <select
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value as Lead["remarks"] })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.remarks ? "border-red-500" : ""}`}
                >
                  <option value="">Select Remarks</option>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
                <p className="text-red-500 text-sm min-h-[1.25rem]">{errors.remarks || ""}</p>
              </div>

              {/* Follow-up By */}
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="Follow-up By"
                  value={formData.followUpBy}
                  onChange={(e) => setFormData({ ...formData, followUpBy: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.followUpBy ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-sm min-h-[1.25rem]">{errors.followUpBy || ""}</p>
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.phone ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-sm min-h-[1.25rem]">{errors.phone || ""}</p>
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.email ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-sm min-h-[1.25rem]">{errors.email || ""}</p>
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead["status"] })}
                  className={`w-full border px-3 py-2 rounded-lg ${errors.status ? "border-red-500" : ""}`}
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
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


      {/* Upload Modal */}
      {showUploadModal && uploadLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-[500px] shadow-2xl border border-gray-300 rounded-xl">
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
