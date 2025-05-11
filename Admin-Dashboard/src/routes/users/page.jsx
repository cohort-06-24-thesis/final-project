import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';

const UserManagementPage = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState('');

  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/user/all');
      const sortedData = res.data.sort((a, b) => a.id.localeCompare(b.id));
      setData(sortedData);
      setTotalPages(Math.ceil(sortedData.length / itemsPerPage));
    } catch (err) {
      console.log('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = (id) => {
    setDeleteId(id);
    setModalMode('delete');
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/user/delete/${deleteId}`);
      setData(data.filter((item) => item.id !== deleteId));
      setShowModal(false);
      setDeleteId(null);
      setModalMode('');
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setDeleteId(null);
    setSelectedItem(null);
    setModalMode('');
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const confirmUpdate = () => {
    setModalMode('update-confirm');
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/api/user/update/${selectedItem.id}`, selectedItem);
      setData(data.map((item) => (item.id === selectedItem.id ? selectedItem : item)));
      setShowModal(false);
      setSelectedItem(null);
      setModalMode('');
    } catch (error) {
      console.log('Error updating data:', error);
    }
  };

  const uniqueRoles = [...new Set(data.map((item) => item.role))];
  const uniqueStatuses = [...new Set(data.map((item) => item.status))];

  const filteredData = data.filter((item) =>
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter ? item.role === roleFilter : true) &&
    (statusFilter ? item.status === statusFilter : true) &&
    (ratingFilter ? item.rating >= parseFloat(ratingFilter) : true)
  );

  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#f5f9f6] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">User Management</h1>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
          />

          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            >
              <option value="">Status</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            >
              <option value="">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setStatusFilter('');
                setRatingFilter('');
              }}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-sm hover:bg-red-200 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl shadow-md bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-100 text-green-800">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-left font-semibold">Role</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Rating</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.profilePic && (
                          <img
                            src={item.profilePic}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-full border border-gray-300"
                          />
                        )}
                        <span className="text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.email}</td>
                    <td className="px-6 py-4 text-gray-700">{item.role}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.rating.toFixed(1)}</td>
                    <td className="px-6 py-4 flex gap-3 items-center">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(item.id)}
                        className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No users available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 flex justify-between items-center border-t">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-green-100 text-green-700 rounded disabled:opacity-50"
          >
            <FaArrowLeft size={16} />
          </button>

          <div className="flex gap-2 items-center">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-green-100 text-green-700 rounded disabled:opacity-50"
          >
            <FaArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            {modalMode === 'edit' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit User</h2>
                <div>
                  <label className="block text-gray-700">Name</label>
                  <input
                    type="text"
                    value={selectedItem.name}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, name: e.target.value })
                    }
                    className="w-full p-2 border rounded mb-4"
                  />
                  <label className="block text-gray-700">Email</label>
                  <input
                    type="email"
                    value={selectedItem.email}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, email: e.target.value })
                    }
                    className="w-full p-2 border rounded mb-4"
                  />
                  <label className="block text-gray-700">Role</label>
                  <select
                    value={selectedItem.role}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, role: e.target.value })
                    }
                    className="w-full p-2 border rounded mb-4"
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                  <label className="block text-gray-700">Status</label>
                  <select
                    value={selectedItem.status}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, status: e.target.value })
                    }
                    className="w imid-full p-2 border rounded mb-4"
                  >
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                  </select>
                  <label className="block text-gray-700">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={selectedItem.rating}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        rating: parseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded mb-4"
                  />
                  <label className="block text-gray-700">Profile Picture URL</label>
                  <input
                    type="text"
                    value={selectedItem.profilePic || ''}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, profilePic: e.target.value })
                    }
                    className="w-full p-2 border rounded mb-4"
                  />
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmUpdate}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'update-confirm' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Update Confirmation
                </h2>
                <div>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to update this user? This will apply all changes
                    you've made.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setModalMode('edit')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      Confirm Update
                    </button>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'delete' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Delete Confirmation
                </h2>
                <div>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this user? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
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

export default UserManagementPage;
