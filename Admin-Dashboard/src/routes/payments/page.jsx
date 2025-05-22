import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [teamSupportPayments, setTeamSupportPayments] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
    fetchTeamSupportPayments();
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
      setPayments(response.data || []);

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

  const fetchTeamSupportPayments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/teamSupport/all');
      // Ensure we have an array of payments
      const paymentsData = Array.isArray(response.data.data) ? response.data.data : [];
      setTeamSupportPayments(paymentsData);
    } catch (err) {
      console.error('Error fetching team support payments:', err);
      setTeamSupportPayments([]); // Set empty array on error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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

  const renderPaymentTable = (payments, title) => {
    // Ensure payments is an array
    const paymentsArray = Array.isArray(payments) ? payments : [];
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
          <h2 className="text-lg font-semibold text-green-800">{title}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-green-50">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  User
                </th>
                {title === "Campaign Donations" && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Campaign
                  </th>
                )}
                {title === "Team Support Payments" && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Message
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentsArray.length > 0 ? (
                paymentsArray.map((payment) => {
                  // For team support, use the User from the payment object
                  // For campaign donations, use the userDetails state
                  const user = title === "Team Support Payments" 
                    ? payment.User 
                    : userDetails[payment.userId];

                  return (
                    <tr key={payment.id} className="hover:bg-green-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user?.profilePic ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover border border-green-200"
                              src={user.profilePic}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-700 text-sm">
                                {user?.name?.charAt(0) || '?'}
                              </span>
                            </div>
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
                      {title === "Campaign Donations" && (
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {payment.CampaignDonation?.title || 'Unknown Campaign'}
                          </div>
                        </td>
                      )}
                      {title === "Team Support Payments" && (
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md">
                            {payment.message || 'No message'}
                          </div>
                        </td>
                      )}
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
                })
              ) : (
                <tr>
                  <td colSpan={title === "Team Support Payments" ? 4 : title === "Campaign Donations" ? 5 : 3} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>No payments found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-800">Payments</h1>
        <p className="mt-1 text-sm text-green-600">
          View and manage all payment transactions
        </p>
      </div>
      {renderPaymentTable(payments, "Campaign Donations")}
      {renderPaymentTable(teamSupportPayments, "Team Support Payments")}
    </div>
  );
};

export default PaymentsPage;

