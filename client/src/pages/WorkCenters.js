import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import WorkCenterModal from '../components/WorkCenterModal';

const WorkCenters = () => {
  const [workCenters, setWorkCenters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/work-centers');
      setWorkCenters(response.data);
    } catch (error) {
      console.error('Error fetching work centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedWorkCenter) {
        await axios.put(`/api/work-centers/${selectedWorkCenter.id}`, formData);
      } else {
        await axios.post('/api/work-centers', formData);
      }
      setIsModalOpen(false);
      setSelectedWorkCenter(null);
      fetchData();
    } catch (error) {
      console.error('Error saving work center:', error);
      alert('Error saving work center');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this work center?')) {
      try {
        await axios.delete(`/api/work-centers/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting work center:', error);
        alert('Error deleting work center');
      }
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Work Centers</h1>
        <button
          onClick={() => {
            setSelectedWorkCenter(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <FiPlus className="mr-2" />
          New Work Center
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Center</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost per Hour</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity (Task/Hr)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workCenters.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No work centers found
                </td>
              </tr>
            ) : (
              workCenters.map((wc) => (
                <tr key={wc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{wc.name}</div>
                    {wc.code && <div className="text-xs text-gray-500">{wc.code}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">${wc.cost?.toFixed(2) || '0.00'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">${wc.cost_per_hour?.toFixed(2) || '0.00'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{wc.capacity || '1.0'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{wc.daily_target || '8.0'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedWorkCenter(wc);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(wc.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <WorkCenterModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWorkCenter(null);
        }}
        workCenter={selectedWorkCenter}
        onSave={handleSave}
      />
    </div>
  );
};

export default WorkCenters;

