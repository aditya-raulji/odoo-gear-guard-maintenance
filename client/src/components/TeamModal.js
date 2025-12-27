import React, { useState, useEffect } from 'react';

const TeamModal = ({ isOpen, onClose, team, onSave, users }) => {
  const [formData, setFormData] = useState({
    name: '',
    company_id: 1,
    member_ids: [],
  });

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        company_id: team.company_id || 1,
        member_ids: team.members?.map((m) => m.id) || [],
      });
    } else {
      setFormData({
        name: '',
        company_id: 1,
        member_ids: [],
      });
    }
  }, [team, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (userId) => {
    setFormData((prev) => {
      const memberIds = [...prev.member_ids];
      const index = memberIds.indexOf(userId);
      if (index > -1) {
        memberIds.splice(index, 1);
      } else {
        memberIds.push(userId);
      }
      return { ...prev, member_ids: memberIds };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Team</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select
              name="company_id"
              value={formData.company_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">My Company (Our Company)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Members *</label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
              {users?.length === 0 ? (
                <p className="text-gray-500 text-sm">No users available</p>
              ) : (
                users?.map((user) => (
                  <label key={user.id} className="flex items-center space-x-2 py-2">
                    <input
                      type="checkbox"
                      checked={formData.member_ids.includes(user.id)}
                      onChange={() => handleMemberChange(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{user.name}</span>
                  </label>
                ))
              )}
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

export default TeamModal;

