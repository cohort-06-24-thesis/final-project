import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchUserDetails = async (userId) => {
    if (!userId || userDetails[userId]) return;

    try {
      const res = await axios.get(`http://localhost:3000/api/user/get/${userId}`);
      setUserDetails((prev) => ({
        ...prev,
        [userId]: res.data,
      }));
    } catch (err) {
      console.error(`Failed to fetch user data for ID ${userId}`, err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/payment/all');
      setPayments(response.data);

      // Fetch user details for each unique userId
      const uniqueUserIds = [...new Set(response.data.map(p => p.userId))];
      await Promise.all(uniqueUserIds.map(fetchUserDetails));

      setError(null);
    } catch (err) {
      setError('Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => {
                const user = userDetails[payment.userId];
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user?.profilePic && (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profilePic}
                            alt={user.name}
                          />
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payment.CampaignDonation?.title || 'Unknown Campaign'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        TND {parseFloat(payment.amount).toFixed(2)}
                      </div>
                    </td>
                  
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;

