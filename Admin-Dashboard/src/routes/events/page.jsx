import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';

const EventPage = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState('');

  const [locationFilter, setLocationFilter] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/event/getAllEvents');
      console.log("hiiiiiii",res.data.data)
      const sortedData = res.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
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
      await axios.delete(`http://localhost:3000/api/event/${deleteId}`);
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
    setModalMode('update-confirm');
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/api/event/${selectedItem.id}`, selectedItem);
      setData(data.map(item => (item.id === selectedItem.id ? selectedItem : item)));
      setShowModal(false);
      setSelectedItem(null);
      setModalMode('');
    } catch (error) {
      console.log('Error updating data:', error);
    }
  };

  const uniqueLocations = [...new Set(data.map(item => item.location))];
  const uniqueStatuses = ['upcoming', 'ongoing', 'completed'];

  const filteredData = data
    .filter((item) =>
      (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (locationFilter ? item.location === locationFilter : true) &&
      (approvedFilter ? item.isApproved === (approvedFilter === 'true') : true) &&
      (statusFilter ? item.status === statusFilter : true)
    );

  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f5f9f6] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Events</h1>

        {/* Search and Filters */}
        <div className="mb-6 flex items-center justify-between gap-6">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
          />

          <div className="flex items-center gap-3">
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            >
              <option value=""> Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('');
                setApprovedFilter('');
                setStatusFilter('');
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
                <th className="px-6 py-4 text-left font-semibold">Date</th>
                <th className="px-6 py-4 text-left font-semibold">Location</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Approved</th>
                <th className="px-6 py-4 text-left font-semibold">Participators</th>
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
                          src={item.images && item.images[0] ? item.images[0] : 'https://via.placeholder.com/40'}
                          alt={item.title}
                          className="w-10 h-10 object-cover rounded-md border border-gray-300"
                        />
                        <span className="text-gray-800">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.description}</td>
                    <td className="px-6 py-4 text-gray-700">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-700">{item.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        item.status === 'ongoing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {item.isApproved ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.participators}</td>
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
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    No events available.
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
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Event</h2>
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
                  <label className="block text-gray-700">Date</label>
                  <input
                    type="date"
                    value={new Date(selectedItem.date).toISOString().split('T')[0]}
                    onChange={(e) => setSelectedItem({ ...selectedItem, date: new Date(e.target.value) })}
                    className="w-full p-2 border rounded mb-4"
                  />
                  <label className="block text-gray-700">Location</label>
                  <input
                    type="text"
                    value={selectedItem.location}
                    onChange={(e) => setSelectedItem({ ...selectedItem, location: e.target.value })}
                    className="w-full p-2 border rounded mb-4"
                  />
                  <label className="block text-gray-700">Status</label>
                  <select
                    value={selectedItem.status}
                    onChange={(e) => setSelectedItem({ ...selectedItem, status: e.target.value })}
                    className="w-full p-2 border rounded mb-4"
                  >
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                  <label className="block text-gray-700">Participators</label>
                  <input
                    type="text"
                    value={selectedItem.participators}
                    onChange={(e) => setSelectedItem({ ...selectedItem, participators: e.target.value })}
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
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Confirmation</h2>
                <div>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to update this event? This will apply all changes you've made.
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
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Delete Confirmation</h2>
                <div>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this event? This action cannot be undone.
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

export default EventPage;