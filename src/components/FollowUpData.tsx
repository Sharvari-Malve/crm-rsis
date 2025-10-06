import React, { useState } from 'react';
import { Eye, Edit, Plus, Phone, Mail, MessageSquare, Search, Upload } from 'lucide-react';

interface Lead {
  id: number;
  clientName: string;
  projectName: string;
  followUpDate: string;
  remarks: 'Call' | 'Email' | 'WhatsApp';
  nextFollowUp: string;
  followUpBy: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  phone: string;
  email: string;
  quotationFile?: File; 
}

export default function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 1,
      clientName: 'John Doe',
      projectName: 'Website Redesign',
      followUpDate: '2024-01-15',
      remarks: 'Call',
      nextFollowUp: '2024-01-20',
      followUpBy: 'Riya Sharma',
      status: 'Pending',
      phone: '+911234567890',
      email: 'john@example.com',
    },
    {
      id: 2,
      clientName: 'Sarah Khan',
      projectName: 'Mobile App Development',
      followUpDate: '2024-01-18',
      remarks: 'Email',
      nextFollowUp: '2024-01-25',
      followUpBy: 'Sharvari Malve',
      status: 'Approved',
      phone: '+919876543210',
      email: 'sarah@example.com',
    },
  ]);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLead, setUploadLead] = useState<Lead | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Lead, 'id'>, string>>>({});

  const [formData, setFormData] = useState<Omit<Lead, 'id'>>({
    clientName: '',
    projectName: '',
    followUpDate: '',
    remarks: 'Call',
    nextFollowUp: '',
    followUpBy: '',
    status: 'Pending',
    phone: '',
    email: '',
  });

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 5;

  const filteredLeads = leads.filter((lead) =>
    [lead.clientName, lead.email, lead.projectName].join(" ")
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

  // Add Lead
  const handleAddLead = () => {
    setFormData({
      clientName: '',
      projectName: '',
      followUpDate: '',
      remarks: 'Call',
      nextFollowUp: '',
      followUpBy: '',
      status: 'Pending',
      phone: '',
      email: '',
    });
    setEditLead(null);
    setErrors({});
    setShowFormModal(true);
  };

  // Edit Lead
  const handleEditLead = (lead: Lead) => {
    setFormData({
      clientName: lead.clientName,
      projectName: lead.projectName,
      followUpDate: lead.followUpDate,
      remarks: lead.remarks,
      nextFollowUp: lead.nextFollowUp,
      followUpBy: lead.followUpBy,
      status: lead.status,
      phone: lead.phone,
      email: lead.email,
    });
    setEditLead(lead);
    setErrors({});
    setShowFormModal(true);
  };

  // Save Lead
  const handleSaveLead = () => {
    const newErrors: typeof errors = {};

    if (!formData.clientName.trim()) newErrors.clientName = "Client name is required";
    if (!formData.projectName.trim()) newErrors.projectName = "Project name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.followUpBy.trim()) newErrors.followUpBy = "Follow-up by is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (editLead) {
      setLeads(leads.map((l) => (l.id === editLead.id ? { ...editLead, ...formData } : l)));
    } else {
      const newLead: Lead = { id: leads.length + 1, ...formData };
      setLeads([...leads, newLead]);
    }
    setShowFormModal(false);
  };

  // Upload File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = () => {
    if (uploadFile && uploadLead) {
      setLeads(
        leads.map((l) =>
          l.id === uploadLead.id ? { ...l, quotationFile: uploadFile } : l
        )
      );
      setUploadFile(null);
      setUploadLead(null);
      setShowUploadModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Follow Up Management</h2>
          <p className="text-gray-600 mt-1">Create, edit and manage Follow Up Data</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
          {/* Search */}
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
            className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors flex items-center space-x-2 font-medium"
          >
            <Plus size={20} />
            <span>Add Follow-Up</span>
          </button>


          {/* Pagination */}
          <div className="flex justify-center items-center space-x-3">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400 shadow-sm transition-all transform hover:scale-105"
            >
              First
            </button>

            {/* Current Page */}
            <span className="px-5 py-2 rounded-lg bg-teal-600 text-white font-semibold shadow-md">
              {currentPage}
            </span>
            <p>OF</p>
            {/* Last Page */}
            <span className="px-5 py-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-300 shadow-sm">
              {totalPages}
            </span>

            {/* Last Page Button */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400 shadow-sm transition-all transform hover:scale-105"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 overflow-hidden max-h-[400px] overflow-y-auto scrollbar-hide">
          <table className="w-full min-w-[900px]">
            <thead className="bg-white/20  sticky top-0">
              <tr>
                <th className="px-2 py-3 text-left font-semibold text-gray-700">Sr. No</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Client Name</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Project Name</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Follow-up Date</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Next Follow-up</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Follow-up By</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Contact</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((lead, index) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">{index + 1}</td>
                  <td className="px-6 py-3">{lead.clientName}</td>
                  <td className="px-6 py-3">{lead.projectName}</td>
                  <td className="px-6 py-3">{lead.followUpDate}</td>
                  <td className="px-6 py-3">{lead.nextFollowUp}</td>
                  <td className="px-6 py-3">{lead.followUpBy}</td>
                  <td className="px-6 py-3">
                    {lead.remarks === 'Call' && (
                      <a href={`tel:${lead.phone}`} className="flex items-center text-blue-600 hover:underline">
                        <Phone size={16} className="mr-1" /> Call
                      </a>
                    )}
                    {lead.remarks === 'Email' && (
                      <a href={`mailto:${lead.email}`} className="flex items-center text-green-600 hover:underline">
                        <Mail size={16} className="mr-1" /> Email
                      </a>
                    )}
                    {lead.remarks === 'WhatsApp' && (
                      <a
                        href={`https://wa.me/${lead.phone.replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-green-500 hover:underline"
                      >
                        <MessageSquare size={16} className="mr-1" /> WhatsApp
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {lead.status === 'Pending' && <span className="text-yellow-600 font-medium">Pending</span>}
                    {lead.status === 'Approved' && <span className="text-green-600 font-medium">Approved</span>}
                    {lead.status === 'Rejected' && <span className="text-red-600 font-medium">Rejected</span>}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-2">
                      <button className="text-green-600 hover:text-green-800" onClick={() => handleEditLead(lead)}>
                        <Edit size={22} />
                      </button>

                      {lead.status === 'Approved' && (
                        <>
                          {/* Eye icon to view uploaded file */}
                          {lead.quotationFile && (
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              title="View Quotation"
                              onClick={() => {
                                const url = URL.createObjectURL(lead.quotationFile!);
                                window.open(url, "_blank");
                              }}
                            >
                              <Eye size={22} />
                            </button>
                          )}

                          {/* <button
                            className="text-purple-600 hover:text-purple-800"
                            title="Generate Quotation"
                          >
                            <FileText size={22} />
                          </button> */}

                          <button
                            className="text-pink-600 hover:text-pink-800"
                            title="Upload Quotation"
                            onClick={() => {
                              setUploadLead(lead);
                              setShowUploadModal(true);
                              setUploadFile(null);
                            }}
                          >
                            <Upload size={22} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-fadeIn z-50">
          <div className="bg-white rounded-none w-[600px] shadow-2xl border border-gray-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-white">
                {editLead ? "Edit Follow-Up" : "Add Follow-Up"}
              </h3>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className={`w-full border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.clientName ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className={`w-full border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.projectName ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.projectName && <p className="text-red-500 text-xs mt-1">{errors.projectName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.email ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <select
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value as Lead["remarks"] })}
                    className="w-full border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="" disabled>Select Contact Method</option>
                    {formData.phone && <option value="Call">Call</option>}
                    {formData.phone && <option value="WhatsApp">WhatsApp</option>}
                    {formData.email && <option value="Email">Email</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead["status"] })}
                    className="w-full border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up By</label>
                <input
                  type="text"
                  value={formData.followUpBy}
                  onChange={(e) => setFormData({ ...formData, followUpBy: e.target.value })}
                  className={`w-full border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${errors.followUpBy ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.followUpBy && <p className="text-red-500 text-xs mt-1">{errors.followUpBy}</p>}
              </div>
            </div>


            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLead}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Upload Modal */}
      {showUploadModal && uploadLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-fadeIn z-50">
          <div className="bg-white rounded-xl w-[500px] shadow-2xl border border-gray-300">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-lg font-bold text-white">
                {uploadFile ? "Upload Quotation" : "View Quotation"} for {uploadLead.clientName}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Show file input only if uploading */}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="border-2 border-dashed border-gray-400 px-3 py-2 mx-20 w-60 h-40 flex items-center justify-center"
              />

              {uploadFile && (
                <div className="mt-2 text-gray-800">
                  Selected File: <span className="font-medium">{uploadFile.name}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadLead(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
              >
                Cancel
              </button>
              {uploadFile && (
                <button
                  onClick={handleUploadSubmit}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm"
                >
                  Upload
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
