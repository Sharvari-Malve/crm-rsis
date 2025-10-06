import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "universal-cookie";
import { Plus, Edit, FileDown, Trash2, Search } from "lucide-react";

interface Payment {
    id: number;
    clientName: string;
    projectName: string;
    paymentMethod: "Cash" | "Bank Transfer" | "Online";
    installmentCount: number;
    paidAmount: number;
    remainingAmount: number;
    givenTo: string;
    totalAmount: number;
    status: "Pending" | "Partially Paid" | " Completed";
    date: string;
}

const Payments: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editPayment, setEditPayment] = useState<Payment | null>(null);
    const [deletePayment, setDeletePayment] = useState<Payment | null>(null);

    const cookies = new Cookies();

    const initialFormData: Omit<Payment, "id"> = {
        clientName: "",
        projectName: "",
        paymentMethod: "Cash",
        installmentCount: "" as any,
        paidAmount: "" as any,
       remainingAmount: "" as any,
        givenTo: "",
        totalAmount: "" as any,
        status: "Pending",
        date: "",
    };

    const [formData, setFormData] = useState<Omit<Payment, "id">>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof typeof initialFormData, string>>>({});

    // Search & Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const paymentsPerPage = 5;

    const filteredPayments = payments.filter((payment) =>
        [payment.clientName, payment.projectName,]
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.max(Math.ceil(filteredPayments.length / paymentsPerPage), 1);
    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // ✅ Get Payments API
    const getPayments = async () => {
        try {
            setLoading(true);
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/get-payment-list`,
                { page: 1, searchString: "" },
                {
                    headers: { Authorization: `Bearer ${cookies.get("auth")}` },
                }
            );
            if (res.data.status === "SUCCESS") {
                setPayments(res.data.payments || []);
            } else {
                toast.warn(res.data.message);
                setPayments([]);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error fetching payments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPayments();
    }, []);

    // ✅ Validation
    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!formData.clientName.trim()) newErrors.clientName = "Client Name is required";
        if (!formData.projectName.trim()) newErrors.projectName = "Project Name is required";
        if (!formData.givenTo.trim()) newErrors.givenTo = "Given To is required";
        if (formData.installmentCount <= 0) newErrors.installmentCount = "Installments must be > 0";
        if (formData.paidAmount < 0) newErrors.paidAmount = "Paid cannot be negative";
        if (formData.remainingAmount < 0) newErrors.remainingAmount = "Remaining cannot be negative";
        if (formData.totalAmount <= 0) newErrors.totalAmount = "Total Amount must be > 0";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ✅ Save Payment (Add / Update)
    const handleSavePayment = async () => {
        if (!validateForm()) return;
        try {
            setLoading(true);
            let apiUrl = `${import.meta.env.VITE_BACKEND_URL}/add-payment`;
            let payload: any = {
                ...formData,
                installmentCount: Number(formData.installmentCount),
                paidAmount: Number(formData.paidAmount),
                remainingCount: Number(formData.remainingAmount),
                totalAmount: Number(formData.totalAmount),
            };
            if (editPayment) {
                apiUrl = `${import.meta.env.VITE_BACKEND_URL}/update-payment`;
                payload = { ...formData, id: editPayment.id };
            }

            const res = await axios.post(apiUrl, payload, {
                headers: { Authorization: `Bearer ${cookies.get("auth")}` },
            });

            if (res.data.status === "SUCCESS") {
                toast.success(editPayment ? "Payment updated!" : "Payment added!");
                setShowModal(false);
                setEditPayment(null);
                getPayments();
            } else {
                toast.warn(res.data.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error saving payment.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Delete Payment
    const handleDelete = async () => {
        if (!deletePayment) return;
        try {
            setLoading(true);
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/delete-payment`,
                { id: deletePayment.id },
                {
                    headers: { Authorization: `Bearer ${cookies.get("auth")}` },
                }
            );
            if (res.data.status === "SUCCESS") {
                toast.success("Payment deleted!");
                setDeletePayment(null);
                getPayments();
            } else {
                toast.warn(res.data.message);
            }
        } catch (error: any) {
            toast.error("Error deleting payment.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (payment: Payment) => {
        setEditPayment(payment);
        setFormData(payment);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
                    <p className="text-gray-600 mt-1">Manage all payments here</p>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search Payment..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={() => { setShowModal(true); setEditPayment(null); setFormData(initialFormData); }}
                        className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
                    >
                        <Plus size={18} /> Add Payment
                    </button>
                    {/* Pagination */}
                    <div className="flex justify-center items-center space-x-3 ">
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
                            <th className="px-4 py-2">Project Name</th>
                            <th className="px-4 py-2">Client Name</th>
                            <th className="px-4 py-2">Method</th>
                            <th className="px-4 py-2">Installments</th>
                            <th className="px-4 py-2">Paid</th>
                            <th className="px-4 py-2">Remaining</th>
                            <th className="px-4 py-2">Given To</th>
                            <th className="px-4 py-2">Amount</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPayments.length > 0 ? currentPayments.map((payment, index) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2">{indexOfFirstPayment + index + 1}</td>
                                <td className="px-4 py-2">{payment.projectName}</td>
                                <td className="px-4 py-2">{payment.clientName}</td>
                                <td className="px-4 py-2">{payment.paymentMethod}</td>
                                <td className="px-4 py-2">{payment.installmentCount}</td>
                                <td className="px-4 py-2">{payment.paidAmount}</td>
                                <td className="px-4 py-2">{payment.remainingAmount}</td>
                                <td className="px-4 py-2">{payment.givenTo}</td>
                                <td className="px-4 py-2">₹{payment.totalAmount}</td>
                                <td className="px-4 py-2 flex gap-2">
                                    <button className="text-teal-600" onClick={() => handleEdit(payment)}><Edit size={20} /></button>
                                    <button className="text-red-600" onClick={() => setDeletePayment(payment)}><Trash2 size={20} /></button>
                                    <button className="text-gray-600" onClick={() => alert("Download logic")}>
                                        <FileDown size={20} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={11} className="text-center py-6 text-gray-500">No payments found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>



            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white w-[700px] shadow-2xl rounded-lg border border-gray-200">
                        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-3 rounded-t-lg">
                            <h3 className="text-xl font-bold text-white">{editPayment ? "Edit Payment" : "Add Payment"}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label>Project Name</label>
                                    <input
                                        type="text"
                                        value={formData.projectName}
                                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                        className={`w-full border px-3 py-2 ${errors.projectName ? "border-red-500" : ""}`}
                                    />
                                    {errors.projectName && <p className="text-red-500 text-xs">{errors.projectName}</p>}
                                </div>

                                <div>
                                    <label>Client Name</label>
                                    <input
                                        type="text"
                                        value={formData.clientName}
                                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                        className={`w-full border px-3 py-2 ${errors.clientName ? "border-red-500" : ""}`}
                                    />
                                    {errors.clientName && <p className="text-red-500 text-xs">{errors.clientName}</p>}
                                </div>

                                <div>
                                    <label>Payment Method</label>
                                    <select
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                                        className="w-full border px-3 py-2"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Online">Online</option>
                                    </select>
                                </div>

                                <div>
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full border px-3 py-2"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Partial">Partial</option>
                                        <option value="Paid">Paid</option>
                                    </select>
                                </div>

                                <div>
                                    <label>Installments</label>
                                    <input
                                        type="number"
                                        value={formData.installmentCount}
                                        onChange={(e) => setFormData({ ...formData, installmentCount: Number(e.target.value) })}
                                        className={`w-full border px-3 py-2 ${errors.installmentCount ? "border-red-500" : ""}`}
                                    />
                                    {errors.installmentCount && <p className="text-red-500 text-xs">{errors.installmentCount}</p>}
                                </div>

                                <div>
                                    <label>Paid Count</label>
                                    <input
                                        type="number"
                                        value={formData.paidAmount}
                                        onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                                        className={`w-full border px-3 py-2 ${errors.paidAmount ? "border-red-500" : ""}`}
                                    />
                                    {errors.paidAmount && <p className="text-red-500 text-xs">{errors.paidAmount}</p>}
                                </div>

                                <div>
                                    <label>Remaining Count</label>
                                    <input
                                        type="number"
                                        value={formData.remainingAmount}
                                        onChange={(e) => setFormData({ ...formData, remainingAmount: Number(e.target.value) })}
                                        className={`w-full border px-3 py-2 ${errors.remainingAmount ? "border-red-500" : ""}`}
                                    />
                                    {errors.remainingAmount && <p className="text-red-500 text-xs">{errors.remainingAmount}</p>}
                                </div>

                                <div>
                                    <label>Given To</label>
                                    <input
                                        type="text"
                                        value={formData.givenTo}
                                        onChange={(e) => setFormData({ ...formData, givenTo: e.target.value })}
                                        className={`w-full border px-3 py-2 ${errors.givenTo ? "border-red-500" : ""}`}
                                    />
                                    {errors.givenTo && <p className="text-red-500 text-xs">{errors.givenTo}</p>}
                                </div>

                                <div>
                                    <label>Total Amount</label>
                                    <input
                                        type="number"
                                        value={formData.totalAmount}
                                        onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                                        className={`w-full border px-3 py-2 ${errors.totalAmount ? "border-red-500" : ""}`}
                                    />
                                    {errors.totalAmount && <p className="text-red-500 text-xs">{errors.totalAmount}</p>}
                                </div>

                                <div>
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full border px-3 py-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                            <button onClick={handleSavePayment} className="px-5 py-2 bg-teal-600 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}


            {/* Delete Modal */}
            {deletePayment && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white w-[500px] shadow-2xl border border-gray-300 rounded-xl">
                        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 rounded-t-xl">
                            <h3 className="text-2xl font-bold text-white">Confirm Delete</h3>
                        </div>
                        <div className="p-6 text-gray-700">
                            Are you sure you want to delete payment #{deletePayment.id} for <strong>{deletePayment.clientName}</strong>?
                        </div>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setDeletePayment(null)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                            <button onClick={handleDelete} className="px-5 py-2 bg-red-600 text-white rounded-lg">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
