import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';

const Page = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState(''); 
  
  const [locationFilter, setLocationFilter] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('');
  const [fulfilledFilter, setFulfilledFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); 
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/inNeed/all');
      
      
      const sortedData = res.data.sort((a, b) => a.id - b.id);
      
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
      await axios.delete(`http://localhost:3000/api/inNeed/${deleteId}`);
      setData(data.filter(item => item.id !== deleteId));
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
    // Switch to update confirmation mode
    setModalMode('update-confirm');
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/api/inNeed/${selectedItem.id}`, selectedItem);
      setData(data.map(item => (item.id === selectedItem.id ? selectedItem : item)));
      setShowModal(false);
      setSelectedItem(null);
      setModalMode('');
    } catch (error) {
      console.log('Error updating data:', error);
    }
  };

  const uniqueLocations = [...new Set(data.map(item => item.location))];

  const filteredData = data
    .filter((item) =>
      (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (locationFilter ? item.location === locationFilter : true) &&
      (approvedFilter ? item.isApproved === (approvedFilter === 'true') : true) &&
      (fulfilledFilter ? item.isDone === (fulfilledFilter === 'true') : true)
    );

  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f5f9f6] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">InNeed Items</h1>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
          />

          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <select
              value={approvedFilter}
              onChange={(e) => setApprovedFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            >
              <option value="">All Approval</option>
              <option value="true">Approved</option>
              <option value="false">Not Approved</option>
            </select>

            <select
              value={fulfilledFilter}
              onChange={(e) => setFulfilledFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            >
              <option value="">All Fulfillment</option>
              <option value="true">Fulfilled</option>
              <option value="false">Not Fulfilled</option>
            </select>

            {/* Reset Filters Button */}
            <button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('');
                setApprovedFilter('');
                setFulfilledFilter('');
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
                <th className="px-6 py-4 text-left font-semibold">Title</th>
                <th className="px-6 py-4 text-left font-semibold">Description</th>
                <th className="px-6 py-4 text-left font-semibold">Location</th>
                <th className="px-6 py-4 text-left font-semibold">Approved</th>
                <th className="px-6 py-4 text-left font-semibold">Fulfilled</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-10 h-10 object-cover rounded-md border border-gray-300"
                        />
                        <span className="text-gray-800">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.description}</td>
                    <td className="px-6 py-4 text-gray-700">{item.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {item.isApproved ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.isDone ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {item.isDone ? 'Yes' : 'No'}
                      </span>
                    </td>
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
                    No data available.
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
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Item</h2>
                <div>
                  <label className="block text-gray-700">Title</label>
                  <input
                    type="text"
                    value={selectedItem.title}
                    onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                    className="w-full p-2 border rounded mb-4"
                  />
                  <label className="block text-gray-700">Description</label>
                  <textarea
                    value={selectedItem.description}
                    onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                    className="w-full p-2 border rounded mb-4"
                  />
                  <label className="block text-gray-700">Location</label>
                  <input
                    type="text"
                    value={selectedItem.location}
                    onChange={(e) => setSelectedItem({ ...selectedItem, location: e.target.value })}
                    className="w-full p-2 border rounded mb-4"
                  />
                  
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="isApproved"
                      checked={selectedItem.isApproved}
                      onChange={() => setSelectedItem({ ...selectedItem, isApproved: !selectedItem.isApproved })}
                      className="mr-2"
                    />
                    <label htmlFor="isApproved" className="text-gray-700">Approved</label>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="isDone"
                      checked={selectedItem.isDone}
                      onChange={() => setSelectedItem({ ...selectedItem, isDone: !selectedItem.isDone })}
                      className="mr-2"
                    />
                    <label htmlFor="isDone" className="text-gray-700">Fulfilled</label>
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmUpdate}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'update-confirm' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Confirmation</h2>
                <div>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to update this item? This will apply all changes you've made.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setModalMode('edit')} // Go back to edit mode
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Confirm Update
                    </button>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'delete' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Delete Confirmation</h2>
                <div>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this item? This action cannot be undone.
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

export default Page;