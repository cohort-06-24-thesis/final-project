import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DonationItemsPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalMode, setModalMode] = useState("");

    const [locationFilter, setLocationFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [approvedFilter, setApprovedFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [totalPages, setTotalPages] = useState(0);

    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:3000/api/donationItems/getAllItems");

            const sortedData = res.data.sort((a, b) => a.id - b.id);

            setData(sortedData);
            setTotalPages(Math.ceil(sortedData.length / itemsPerPage));
        } catch (err) {
            console.log("Error fetching donation items:", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get("http://localhost:3000/api/category/getAll");
            setCategories(res.data);
        } catch (err) {
            console.log("Error fetching categories:", err);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, []);

    const confirmDelete = (id) => {
        setDeleteId(id);
        setModalMode("delete");
        setShowModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/api/donationItems/${deleteId}`);
            setData(data.filter((item) => item.id !== deleteId));
            setShowModal(false);
            setDeleteId(null);
            setModalMode("");
        } catch (error) {
            console.log("Error deleting donation item:", error);
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        setDeleteId(null);
        setSelectedItem(null);
        setModalMode("");
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setModalMode("edit");
        setShowModal(true);
    };

    const confirmUpdate = () => {
        // Switch to update confirmation mode
        setModalMode("update-confirm");
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:3000/api/donationItems/${selectedItem.id}`, selectedItem);
            setData(data.map((item) => (item.id === selectedItem.id ? selectedItem : item)));
            setShowModal(false);
            setSelectedItem(null);
            setModalMode("");
        } catch (error) {
            console.log("Error updating donation item:", error);
        }
    };

    const uniqueLocations = [...new Set(data.map((item) => item.location))];
    const statusOptions = ["available", "reserved", "claimed"];

    const filteredData = data.filter(
        (item) =>
            (item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (locationFilter ? item.location === locationFilter : true) &&
            (statusFilter ? item.status === statusFilter : true) &&
            (approvedFilter ? item.isApproved === (approvedFilter === "true") : true) &&
            (categoryFilter ? item.categoryId === parseInt(categoryFilter) : true),
    );

    const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="min-h-screen bg-[#f5f9f6] p-6">
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-6 text-3xl font-bold text-green-700">Donation Items</h1>

                {/* Search and Filters */}
                <div className="mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 md:flex-nowrap">
                        {/* Search Input */}
                        <div className="w-full md:w-1/2 lg:w-3/5">
                            <input
                                type="text"
                                placeholder="Search by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                        </div>

                        {/* All Filters in one line on the right */}
                        <div className="flex w-full flex-nowrap items-center justify-end gap-2 overflow-x-auto md:w-1/2 lg:w-2/5">
                            {/* Category Filter */}
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                                <option value="">Category</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            {/* Location Filter */}
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                                <option value="">Location</option>
                                {uniqueLocations.map((loc) => (
                                    <option
                                        key={loc}
                                        value={loc}
                                    >
                                        {loc}
                                    </option>
                                ))}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                                <option value="">Status</option>
                                {statusOptions.map((status) => (
                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>

                            {/* Reset Filters Button */}
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setLocationFilter("");
                                    setStatusFilter("");
                                    setApprovedFilter("");
                                    setCategoryFilter("");
                                }}
                                className="whitespace-nowrap rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600 transition hover:bg-red-200"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl bg-white shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-green-100 text-green-800">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">Title</th>
                                <th className="px-6 py-4 text-left font-semibold">Description</th>
                                <th className="px-6 py-4 text-left font-semibold">Category</th>
                                <th className="px-6 py-4 text-left font-semibold">Location</th>
                                <th className="px-6 py-4 text-left font-semibold">Status</th>
                                
                                <th className="px-6 py-4 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentItems.length > 0 ? (
                                currentItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition-colors hover:bg-green-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div
                                                    onClick={() => navigate(`/manage-donation-items/${item.id}`)}

                                             className="flex items-center gap-3 cursor-pointer hover:underline">
                                                <img
                                                    src={item.image && item.image.length > 0 ? item.image[0] : "/api/placeholder/40/40"}
                                                    alt={item.title}
                                                    className="h-10 w-10 rounded-md border border-gray-300 object-cover"
                                                />
                                                <span
                                                    className="text-gray-800"
                                                >
                                                    {item.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{item.description}</td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {categories.find((cat) => cat.id === item.categoryId)?.name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{item.location}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    item.status === "available"
                                                        ? "bg-green-100 text-green-700"
                                                        : item.status === "reserved"
                                                          ? "bg-yellow-100 text-yellow-700"
                                                          : "bg-blue-100 text-blue-700"
                                                }`}
                                            >
                                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                            </span>
                                        </td>

                                        <td className="flex items-center gap-3 px-6 py-4">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="rounded-full p-2 text-blue-600 transition hover:bg-blue-100"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(item.id)}
                                                className="rounded-full p-2 text-red-600 transition hover:bg-red-100"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="py-6 text-center text-gray-500"
                                    >
                                        No donation items available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t p-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="rounded bg-green-100 px-3 py-1 text-green-700 disabled:opacity-50"
                    >
                        <FaArrowLeft size={16} />
                    </button>

                    <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentPage(index + 1)}
                                className={`rounded px-3 py-1 ${
                                    currentPage === index + 1 ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="rounded bg-green-100 px-3 py-1 text-green-700 disabled:opacity-50"
                    >
                        <FaArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        {modalMode === "edit" && (
                            <>
                                <h2 className="mb-4 text-xl font-semibold text-gray-800">Edit Donation Item</h2>
                                <div>
                                    <label className="block text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        value={selectedItem.title}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                                        className="mb-4 w-full rounded border p-2"
                                    />
                                    <label className="block text-gray-700">Description</label>
                                    <textarea
                                        value={selectedItem.description}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                                        className="mb-4 w-full rounded border p-2"
                                    />
                                    <label className="block text-gray-700">Category</label>
                                    <select
                                        value={selectedItem.categoryId}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, categoryId: parseInt(e.target.value) })}
                                        className="mb-4 w-full rounded border p-2"
                                    >
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <label className="block text-gray-700">Location</label>
                                    <input
                                        type="text"
                                        value={selectedItem.location}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, location: e.target.value })}
                                        className="mb-4 w-full rounded border p-2"
                                    />

                                    <label className="block text-gray-700">Status</label>
                                    <select
                                        value={selectedItem.status}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, status: e.target.value })}
                                        className="mb-4 w-full rounded border p-2"
                                    >
                                        {statusOptions.map((status) => (
                                            <option
                                                key={status}
                                                value={status}
                                            >
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex justify-end gap-4">
                                        <button
                                            onClick={handleCancel}
                                            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmUpdate}
                                            className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {modalMode === "update-confirm" && (
                            <>
                                <h2 className="mb-4 text-xl font-semibold text-gray-800">Update Confirmation</h2>
                                <div>
                                    <p className="mb-6 text-gray-600">
                                        Are you sure you want to update this donation item? This will apply all changes you've made.
                                    </p>
                                    <div className="flex justify-end gap-4">
                                        <button
                                            onClick={() => setModalMode("edit")} // Go back to edit mode
                                            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                                        >
                                            Confirm Update
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {modalMode === "delete" && (
                            <>
                                <h2 className="mb-4 text-xl font-semibold text-gray-800">Delete Confirmation</h2>
                                <div>
                                    <p className="mb-6 text-gray-600">
                                        Are you sure you want to delete this donation item? This action cannot be undone.
                                    </p>
                                    <div className="flex justify-end gap-4">
                                        <button
                                            onClick={handleCancel}
                                            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonationItemsPage;
