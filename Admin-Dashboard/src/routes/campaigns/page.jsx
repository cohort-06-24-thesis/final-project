import React, { useEffect, useState, useMemo } from 'react';
import { FaEdit, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';


const CampaignDonationsTable = () => {
  const [campaignsData, setCampaignsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [modalMode, setModalMode] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // New state for status filter
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchCampaigns = async () => {
    try {
      setErrorMessage('');
      const res = await axios.get('http://localhost:3000/api/campaignDonation');
      const sortedData = res.data.sort((a, b) => a.id - b.id);
      setCampaignsData(sortedData);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setErrorMessage('Failed to fetch campaigns. Please try again.');
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Reset currentPage when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, approvedFilter, statusFilter]);

  const filteredCampaigns = useMemo(() => {
    return campaignsData.filter((campaign) =>
      (campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (approvedFilter ? campaign.isApproved === (approvedFilter === 'true') : true) &&
      (statusFilter ? campaign.status === statusFilter : true)
    );
  }, [campaignsData, searchTerm, approvedFilter, statusFilter]);

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const currentCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const confirmDelete = (id) => {
    setDeleteId(id);
    setModalMode('delete');
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      setErrorMessage('');
      await axios.delete(`http://localhost:3000/api/campaignDonation/${deleteId}`);
      setCampaignsData(campaignsData.filter((campaign) => campaign.id !== deleteId));
      setShowModal(false);
      setDeleteId(null);
      setModalMode('');
      if (currentCampaigns.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setErrorMessage('Failed to delete campaign. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setDeleteId(null);
    setSelectedCampaign(null);
    setModalMode('');
    setErrorMessage('');
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign({ ...campaign });
    setModalMode('edit');
    setShowModal(true);
  };

  const confirmUpdate = () => {
    if (selectedCampaign) {
      setModalMode('update-confirm');
    }
  };

  const handleUpdate = async () => {
    try {
      if (!selectedCampaign) return;
      setErrorMessage('');
      await axios.put(
        `http://localhost:3000/api/campaignDonation/${selectedCampaign.id}`,
        selectedCampaign
      );
      setCampaignsData(
        campaignsData.map((campaign) =>
          campaign.id === selectedCampaign.id ? selectedCampaign : campaign
        )
      );
      setShowModal(false);
      setSelectedCampaign(null);
      setModalMode('');
    } catch (error) {
      console.error('Error updating campaign:', error);
      setErrorMessage('Failed to update campaign. Please try again.');
    }
  };

  const formatDateForInput = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-[#f5f9f6] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Campaign Donations</h1>

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
            aria-label="Search campaigns"
          />

          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={approvedFilter}
              onChange={(e) => setApprovedFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
              aria-label="Filter by approval status"
            >
              <option value="">All Approval</option>
              <option value="true">Approved</option>
              <option value="false">Not Approved</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setApprovedFilter('');
                setStatusFilter('');
              }}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-sm hover:bg-red-200 transition"
              aria-label="Reset filters"
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
                <th className="px-6 py-4 text-left font-semibold">Progress</th>
                <th className="px-6 py-4 text-left font-semibold">Goal</th>
                <th className="px-6 py-4 text-left font-semibold">Raised</th>
                <th className="px-6 py-4 text-left font-semibold">Start Date</th>
                <th className="px-6 py-4 text-left font-semibold">End Date</th>
                <th className="px-6 py-4 text-left font-semibold">Approved</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentCampaigns.length > 0 ? (
                currentCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {campaign.images && campaign.images.length > 0 && (
                          <img
                            src={campaign.images[0]}
                            alt={campaign.title}
                            className="w-10 h-10 object-cover rounded-md border border-gray-300"
                          />
                        )}
                        <span className="text-gray-800">{campaign.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {campaign.description.substring(0, 50)}...
                    </td>
                    <td className="px-6 py-4 text-gray-700">{campaign.progress}%</td>
                    <td className="px-6 py-4 text-gray-700">${campaign.goal}</td>
                    <td className="px-6 py-4 text-gray-700">${campaign.totalRaised}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.isApproved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {campaign.isApproved ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'active'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-3 items-center">
                      <button
                        onClick={() => handleEdit(campaign)}
                        className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                        aria-label={`Edit campaign ${campaign.title}`}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(campaign.id)}
                        className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                        aria-label={`Delete campaign ${campaign.title}`}
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-6 text-gray-500">
                    No campaigns available.
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
            aria-label="Previous page"
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
                aria-label={`Page ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-green-100 text-green-700 rounded disabled:opacity-50"
            aria-label="Next page"
          >
            <FaArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            {modalMode === 'edit' && selectedCampaign && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Campaign</h2>
                <div>
                  <label className="block text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={selectedCampaign.title || ''}
                    onChange={(e) =>
                      setSelectedCampaign({ ...selectedCampaign, title: e.target.value })
                    }
                    className="w-full p-2 border rounded mb-4"
                    aria-label="Campaign title"
                  />
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    value={selectedCampaign.description || ''}
                    onChange={(e) =>
                      setSelectedCampaign({
                        ...selectedCampaign,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded mb-4"
                    aria-label="Campaign description"
                  />
                  <label className="block text-gray-700 mb-2">Goal</label>
                  <input
                    type="number"
                    value={selectedCampaign.goal || 0}
                    onChange={(e) =>
                      setSelectedCampaign({
                        ...selectedCampaign,
                        goal: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border rounded mb-4"
                    aria-label="Campaign goal"
                  />
                  <label className="block text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formatDateForInput(selectedCampaign.startDate)}
                    onChange={(e) =>
                      setSelectedCampaign({
                        ...selectedCampaign,
                        startDate: new Date(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded mb-4"
                    aria-label="Campaign start date"
                  />
                  <label className="block text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formatDateForInput(selectedCampaign.endDate)}
                    onChange={(e) =>
                      setSelectedCampaign({
                        ...selectedCampaign,
                        endDate: new Date(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded mb-4"
                    aria-label="Campaign end date"
                  />
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="isApproved"
                      checked={selectedCampaign.isApproved || false}
                      onChange={() =>
                        setSelectedCampaign({
                          ...selectedCampaign,
                          isApproved: !selectedCampaign.isApproved,
                        })
                      }
                      className="mr-2"
                      aria-label="Approve campaign"
                    />
                    <label htmlFor="isApproved" className="text-gray-700">
                      Approved
                    </label>
                  </div>
                  <label className="block text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedCampaign.status || 'active'}
                    onChange={(e) =>
                      setSelectedCampaign({
                        ...selectedCampaign,
                        status: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded mb-4"
                    aria-label="Campaign status"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                      aria-label="Cancel edit"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmUpdate}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                      aria-label="Save changes"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'update-confirm' && selectedCampaign && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Update Confirmation
                </h2>
                <div>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to update this campaign? This will apply all changes
                    you've made.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setModalMode('edit')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                      aria-label="Back to edit"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                      aria-label="Confirm update"
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
                    Are you sure you want to delete this campaign? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                      aria-label="Cancel delete"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                      aria-label="Confirm delete"
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

export default CampaignDonationsTable;