import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiBarChart2 } from 'react-icons/fi';

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [groupBy, setGroupBy] = useState('team');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [groupBy]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/dashboard/reports?group_by=${groupBy}`);
      // Coerce numeric strings to numbers and normalize group name
      const normalized = (response.data || []).map((r) => ({
        group_name: r.group_name || 'N/A',
        request_count: Number(r.request_count) || 0,
        completed_count: Number(r.completed_count) || 0,
        open_count: Number(r.open_count) || 0,
      }));
      setReportData(normalized);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Totals (ensure numbers, no leading zero strings)
  const totalRequests = reportData.reduce((sum, item) => sum + item.request_count, 0);
  const totalCompleted = reportData.reduce((sum, item) => sum + item.completed_count, 0);
  const totalOpen = reportData.reduce((sum, item) => sum + item.open_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setGroupBy('team')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              groupBy === 'team' ? 'bg-white shadow border border-gray-200' : 'text-gray-600'
            }`}
          >
            Team
          </button>
          <button
            onClick={() => setGroupBy('category')}
            className={`ml-1 px-4 py-2 rounded-md text-sm font-medium ${
              groupBy === 'category' ? 'bg-white shadow border border-gray-200' : 'text-gray-600'
            }`}
          >
            Equipment Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Total Requests</h3>
            <FiBarChart2 className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-600">{totalRequests}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
            <FiBarChart2 className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600">{totalCompleted}</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Open Requests</h3>
            <FiBarChart2 className="text-yellow-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{totalOpen}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Requests by {groupBy === 'team' ? 'Team' : 'Equipment Category'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {groupBy === 'team' ? 'Team Name' : 'Category Name'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Requests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                reportData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.group_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.request_count || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600 font-medium">{item.completed_count || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-yellow-600 font-medium">{item.open_count || 0}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

