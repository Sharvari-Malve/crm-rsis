import React, { useState } from "react";
import { Edit, Trash2, Plus, Search } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface NotificationManagementProps {
  setActiveTab: (tab: string) => void;
}

export default function NotificationManagement({ setActiveTab }: NotificationManagementProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New Lead Generated",
      description: "A new lead was generated from the website.",
      date: "2025-09-29",
    },
    {
      id: 2,
      title: "Payment Received",
      description: "Payment received from John Smith.",
      date: "2025-09-28",
    },
  ]);

  // Form Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editNotification, setEditNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState<Omit<Notification, "id">>({
    title: "",
    description: "",
    date: "",
  });

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState<Notification | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 5;

  const filteredNotifications = notifications.filter((n) =>
    [n.title, n.description, n.date].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(Math.ceil(filteredNotifications.length / notificationsPerPage), 1);
  const indexOfLast = currentPage * notificationsPerPage;
  const indexOfFirst = indexOfLast - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Form Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.date.trim()) newErrors.date = "Date is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add/Edit/Delete Handlers
  const handleAddNotification = () => {
    setFormData({ title: "", description: "", date: "" });
    setEditNotification(null);
    setErrors({});
    setShowFormModal(true);
  };

  const handleEditNotification = (notification: Notification) => {
    setFormData({ title: notification.title, description: notification.description, date: notification.date });
    setEditNotification(notification);
    setErrors({});
    setShowFormModal(true);
  };

  const handleSaveNotification = () => {
    if (!validateForm()) return;
    if (editNotification) {
      setNotifications(
        notifications.map((n) => (n.id === editNotification.id ? { ...editNotification, ...formData } : n))
      );
    } else {
      const newNotification: Notification = { id: notifications.length + 1, ...formData };
      setNotifications([...notifications, newNotification]);
    }
    setShowFormModal(false);
  };

  const handleDeleteNotification = (notification: Notification) => {
    setDeleteNotification(notification);
    setShowDeleteModal(true);
  };

  const confirmDeleteNotification = () => {
    if (deleteNotification) {
      setNotifications(notifications.filter((n) => n.id !== deleteNotification.id));
      setDeleteNotification(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notification Management</h2>
          <p className="text-gray-600 mt-1">Create, edit, and manage notifications</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

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
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/20 text-lg sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Sr. No</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Title</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Description</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentNotifications.length > 0 ? (
              currentNotifications.map((n, index) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{indexOfFirst + index + 1}</td>
                  <td className="px-6 py-3">{n.title}</td>
                  <td className="px-6 py-3">{n.description}</td>
                  <td className="px-6 py-3">{n.date}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-2">
                      <button className="text-red-600" onClick={() => handleDeleteNotification(n)}>
                        <Trash2 size={22} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No notifications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Delete Modal */}
      {showDeleteModal && deleteNotification && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-[500px] shadow-2xl border border-gray-300 rounded-xl">
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl font-bold text-white">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-lg">
                Are you sure you want to delete <span className="font-semibold">{deleteNotification.title}</span>?
              </p>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                Cancel
              </button>
              <button onClick={confirmDeleteNotification} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
