import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const ReportTable = () => {
  const [reports, setReports] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsernameById = async (id) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/user/get/${id}`);
      return res.data.name || `User-${id}`;
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      return `User-${id}`;
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/report/findAllReport');
      const sortedReports = res.data.sort((a, b) => a.id - b.id);

      // Get all unique user IDs
      const userIds = new Set();
      sortedReports.forEach((r) => {
        if (r.userId) userIds.add(r.userId);
        if (r.reportedUserId) userIds.add(r.reportedUserId);
      });

      // Fetch usernames in parallel
      const userPromises = [...userIds].map(async (id) => [id, await fetchUsernameById(id)]);
      const userEntries = await Promise.all(userPromises);
      const userMap = Object.fromEntries(userEntries);

      setUserMap(userMap);
      setReports(sortedReports);
      setTotalPages(Math.ceil(sortedReports.length / itemsPerPage));
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const currentItems = reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f5f9f6] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">User Reports</h1>

        <div className="overflow-x-auto rounded-xl shadow-md bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-100 text-green-800">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Reason</th>
                <th className="px-6 py-4 text-left font-semibold">User</th>
                <th className="px-6 py-4 text-left font-semibold">Reported User</th>
                <th className="px-6 py-4 text-left font-semibold">Item ID</th>
                <th className="px-6 py-4 text-left font-semibold">Item Type</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                currentItems.map((report) => (
                  <tr key={report.id} className="hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800">{report.reason}</td>
                    <td className="px-6 py-4 text-gray-700">{userMap[report.userId] || report.userId}</td>
                    <td className="px-6 py-4 text-gray-700">{userMap[report.reportedUserId] || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{report.itemId || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{report.itemType || '-'}</td>
                
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
    </div>
  );
};

export default ReportTable;
