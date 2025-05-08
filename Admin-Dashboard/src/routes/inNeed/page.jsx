import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from "axios";

const Page = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // State for selected item for updating

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/inNeed/all');
      setData(res.data);
    } catch (err) {
      console.log('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/inNeed/${deleteId}`);
      setData(data.filter(item => item.id !== deleteId));
      setShowModal(false);
      setDeleteId(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setDeleteId(null);
    setSelectedItem(null); // Reset selected item when modal is closed
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true); // Show the modal when clicking on the Edit button
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3000/api/inNeed/${selectedItem.id}`, selectedItem);
      setData(data.map(item => (item.id === selectedItem.id ? selectedItem : item))); // Update data in state
      setShowModal(false);
      setSelectedItem(null); // Reset selected item after update
    } catch (error) {
      console.log('Error updating data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f9f6] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">InNeed Items</h1>

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
              {data.length > 0 ? (
                data.map((item) => (
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
      </div>

      {/* Edit/Update Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{selectedItem ? 'Update Item' : 'Delete Confirmation'}</h2>
            
            {/* Update Form */}
            {selectedItem && (
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
                
                {/* Toggle for isApproved */}
                <label className="block text-gray-700">Approved</label>
                <input
                  type="checkbox"
                  checked={selectedItem.isApproved}
                  onChange={() => setSelectedItem({ ...selectedItem, isApproved: !selectedItem.isApproved })}
                  className="mb-4"
                />
                
                {/* Toggle for isDone */}
                <label className="block text-gray-700">Fulfilled</label>
                <input
                  type="checkbox"
                  checked={selectedItem.isDone}
                  onChange={() => setSelectedItem({ ...selectedItem, isDone: !selectedItem.isDone })}
                  className="mb-4"
                />
                
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Update
                  </button>
                </div>
              </div>
            )}

            {/* Delete Confirmation */}
            {!selectedItem && (
              <div>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
