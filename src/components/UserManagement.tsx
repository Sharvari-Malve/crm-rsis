import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "universal-cookie";
import { Edit, Trash2, Plus, Search } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  mobile: string;
  role:
    | "Manager"
    | "Team Leader"
    | "Tech Head"
    | "CEO"
    | "Director"
    | "Sales Team"
    | "Sales Head"
    | "HR";
  status: "enable" | "disable"; 
}

interface UserManagementProps {
  setActiveTab: (tab: string) => void;
}

export default function UserManagement({ setActiveTab }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const cookies = new Cookies();

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const filteredUsers = users.filter((user) =>
    [user.username, user.email, user.mobile, user.role]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(Math.ceil(filteredUsers.length / usersPerPage), 1);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<Omit<User, "id" | "status">>({
    username: "",
    email: "",
    mobile: "",
    role: "Sales Team",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // GET Users
  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/get-user-list`,
        { page: 1, searchString: "" },
        {
          headers: { Authorization: `Bearer ${cookies.get("auth")}` },
        }
      );

      if (res.data.status === "SUCCESS") {
        const allUsers: User[] = res.data.data || [];
        const currentUserEmail = cookies.get("userEmail");
        const filtered = allUsers.filter((u) => u.email !== currentUserEmail);
        setUsers(filtered);
      } else {
        toast.warn(res.data.message);
        setUsers([]);
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error.response?.data?.message || "Error fetching users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email.";
    if (!formData.mobile.trim()) newErrors.mobile = "Phone is required.";
    else if (!/^[0-9]{10}$/.test(formData.mobile)) newErrors.mobile = "Enter a valid 10-digit mobile.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save User
  const handleSaveUser = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);

      let apiUrl = `${import.meta.env.VITE_BACKEND_URL}/add-user`;
      let payload: any = { ...formData };

      if (!editUser) {
        payload.status = "enable"; // default for new user
      }

      if (editUser) {
        apiUrl = `${import.meta.env.VITE_BACKEND_URL}/update-user`;
        payload.id = editUser.id;
      }

      const res = await axios.post(apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("auth")}`,
        },
      });

      if (res.data.status?.toLowerCase() === "success" || res.data.success) {
        toast.success(editUser ? "User updated!" : "User added!");
      } else {
        toast.warn(res.data.message || "Something went wrong!");
      }
    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error(error.response?.data?.message || "Error saving user.");
    } finally {
      setShowFormModal(false);
      setEditUser(null);
      getUsers();
      setLoading(false);
    }
  };

  // Delete User
  const confirmDeleteUser = async () => {
    if (!deleteUser) return;
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/delete-user`,
        { id: deleteUser.id },
        { headers: { Authorization: `Bearer ${cookies.get("auth")}` } }
      );

      if (res.data.status?.toLowerCase() === "success" || res.data.success) {
        toast.success("User deleted successfully!");
      } else {
        toast.warn(res.data.message || "Delete failed!");
      }
    } catch (error: any) {
      console.error("Delete Error:", error);
      toast.error(error.response?.data?.message || "Error deleting user.");
    } finally {
      setShowDeleteModal(false);
      setDeleteUser(null);
      getUsers();
      setLoading(false);
    }
  };

  // Toggle Status
  const toggleUserStatus = async (user: User) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/toggle-status`,
        { id: user.id, status: user.status === "enable" ? "disable" : "enable" },
        { headers: { Authorization: `Bearer ${cookies.get("auth")}` } }
      );

      if (res.data.status === "SUCCESS") {
        toast.success("User status updated!");
        getUsers();
      } else {
        toast.warn(res.data.message);
      }
    } catch (error) {
      toast.error("Error updating status.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAddUser = () => {
    setFormData({ username: "", email: "", mobile: "", role: "Sales Team" });
    setEditUser(null);
    setErrors({});
    setShowFormModal(true);
  };

  const handleEditUser = (user: User) => {
    setFormData({ username: user.username, email: user.email, mobile: user.mobile, role: user.role });
    setEditUser(user);
    setErrors({});
    setShowFormModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteUser(user);
    setShowDeleteModal(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 w-full">
  {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 w-full">
  {/* Title & Subtitle */}
  <div className="flex flex-col">
    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
      User Management
    </h2>
    <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
      Manage system users and roles
    </p>
  </div>

  {/* Search, Add Button & Pagination */}
  <div className="flex flex-col sm:flex-row md:items-center gap-3 w-full sm:w-auto">
    {/* Search */}
    <div className="relative flex-1 sm:flex-none w-full sm:w-60 md:w-64">
      <Search className="absolute left-3 top-3 text-gray-500" size={18} />
      <input
        type="text"
        placeholder="Search User..."
        value={searchQuery}
        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-xs sm:text-sm md:text-base"
      />
    </div>

    {/* Add User Button */}
    <button
      onClick={handleAddUser}
      className="bg-teal-600 text-white px-3 sm:px-5 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base"
    >
      <Plus size={16} /> <span>Add User</span>
    </button>

    {/* Pagination */}
    <div className="flex flex-wrap sm:flex-nowrap justify-center items-center gap-2 mt-2 sm:mt-0 text-xs sm:text-sm md:text-base">
      <button
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        className="px-2 sm:px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400 shadow-sm transition-all"
      >
        First
      </button>
      <span className="px-3 py-1 rounded-lg bg-teal-600 text-white font-semibold shadow-md">
        {currentPage}
      </span>
      <span>of</span>
      <span className="px-3 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-300 shadow-sm">
        {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-2 sm:px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400 shadow-sm transition-all"
      >
        Last
      </button>
    </div>
  </div>
</div>


  {/* Table */}
  <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 overflow-x-auto">
    <table className="w-full min-w-[600px] md:min-w-full table-auto">
      <thead className="bg-white/20 text-sm sm:text-base md:text-lg">
        <tr>
          <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Sr.No</th>
          <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Username</th>
          <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Email</th>
          <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Phone</th>
          <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Role</th>
          <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y text-sm sm:text-base">
        {currentUsers.map((user, index) => (
          <tr key={user.id} className="hover:bg-gray-50">
            <td className="px-4 sm:px-6 py-3">{indexOfFirstUser + index + 1}</td>
            <td className="px-4 sm:px-6 py-3">{user.username}</td>
            <td className="px-4 sm:px-6 py-3">{user.email}</td>
            <td className="px-4 sm:px-6 py-3">{user.mobile}</td>
            <td className="px-4 sm:px-6 py-3">{user.role}</td>
            <td className="px-4 sm:px-6 py-3 flex items-center space-x-2 sm:space-x-3">
              <button onClick={() => handleEditUser(user)} className="text-teal-600 hover:text-teal-700">
                <Edit size={20} />
              </button>
              <button onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-700">
                <Trash2 size={20} />
              </button>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={user.status === "enable"}
                  onChange={() => toggleUserStatus(user)}
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-teal-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </td>
          </tr>
        ))}
        {currentUsers.length === 0 && (
          <tr>
            <td colSpan={7} className="text-center py-6 text-gray-500 text-sm sm:text-base">
              No users found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Modals (Add/Edit & Delete) */}
  {showFormModal && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md sm:max-w-lg shadow-2xl border border-gray-300 rounded-xl">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 rounded-t-xl">
          <h3 className="text-xl sm:text-2xl font-bold text-white">{editUser ? "Edit User" : "Add User"}</h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <input type="text" placeholder="Name" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className={`w-full border px-3 py-2 rounded-lg ${errors.username ? "border-red-500" : ""}`} />
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full border px-3 py-2 rounded-lg ${errors.email ? "border-red-500" : ""}`} />
          <input type="text" placeholder="Phone" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className={`w-full border px-3 py-2 rounded-lg ${errors.mobile ? "border-red-500" : ""}`} />
          <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as User["role"] })} className="w-full border px-3 py-2 rounded-lg">
            <option value="">-- Select Role --</option>
            <option value="Manager">Manager</option>
            <option value="Team Leader">Team Leader</option>
            <option value="Tech Head">Tech Head</option>
            <option value="CEO">CEO</option>
            <option value="Director">Director</option>
            <option value="Sales Team">Sales Team</option>
            <option value="Sales Head">Sales Head</option>
            <option value="HR">HR</option>
          </select>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
          <button onClick={() => setShowFormModal(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm sm:text-base">Cancel</button>
          <button onClick={handleSaveUser} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-sm sm:text-base">Save</button>
        </div>
      </div>
    </div>
  )}

  {showDeleteModal && deleteUser && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md sm:max-w-lg shadow-2xl border border-gray-300 rounded-xl">
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 rounded-t-xl">
          <h3 className="text-xl sm:text-2xl font-bold text-white">Confirm Delete</h3>
        </div>
        <div className="p-4 sm:p-6">
          <p className="text-gray-700 text-sm sm:text-base">
            Are you sure you want to delete <span className="font-semibold">{deleteUser.username}</span>?
          </p>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
          <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm sm:text-base">Cancel</button>
          <button onClick={confirmDeleteUser} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm sm:text-base">Delete</button>
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
