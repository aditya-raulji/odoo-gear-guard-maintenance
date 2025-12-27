import React, { useState, useEffect } from 'react';

const WorkCenterModal = ({ isOpen, onClose, workCenter, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    company_id: 1,
    cost: 0,
    cost_per_hour: 0,
    capacity: 1.0,
    daily_target: 8.0,
    work_rate: 1.0,
  });

  useEffect(() => {
    if (workCenter) {
      setFormData({
        name: workCenter.name || '',
        code: workCenter.code || '',
        company_id: workCenter.company_id || 1,
        cost: workCenter.cost || 0,
        cost_per_hour: workCenter.cost_per_hour || 0,
        capacity: workCenter.capacity || 1.0,
        daily_target: workCenter.daily_target || 8.0,
        work_rate: workCenter.work_rate || 1.0,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        company_id: 1,
        cost: 0,
        cost_per_hour: 0,
        capacity: 1.0,
        daily_target: 8.0,
        work_rate: 1.0,
      });
    }
  }, [workCenter, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const hourlyRate = formData.work_rate > 0 ? formData.cost_per_hour / formData.work_rate : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Work Center</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Center Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Hour</label>
              <input
                type="number"
                name="cost_per_hour"
                value={formData.cost_per_hour}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Task/Hr)</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Target</label>
              <input
                type="number"
                name="daily_target"
                value={formData.daily_target}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Rate</label>
              <input
                type="number"
                name="work_rate"
                value={formData.work_rate}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (Read-only)</label>
              <input
                type="text"
                value={hourlyRate.toFixed(2)}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkCenterModal;

