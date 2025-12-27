import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TaskModal = ({ isOpen, onClose, task, onSave, equipmentList, teamList, userList, workCenterList }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    task_name: '',
    type: 'Corrective',
    subject: '',
    equipment_id: '',
    assigned_by: '',
    assigned_to: '',
    due_date: '',
    scheduled_date: '',
    priority: 'Medium',
    stage: 'New',
    team_id: '',
    work_center_id: '',
    maintenance_type: '',
    duration: '',
    frequency: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        task_name: task.task_name || '',
        type: task.type || 'Corrective',
        subject: task.subject || '',
        equipment_id: task.equipment_id || '',
        assigned_by: task.assigned_by || '',
        assigned_to: task.assigned_to || '',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        // Pre-fill datetime-local value (YYYY-MM-DDTHH:MM)
        scheduled_date: task.scheduled_date
          ? new Date(task.scheduled_date).toISOString().slice(0, 16)
          : '',
        priority: task.priority || 'Medium',
        stage: task.stage || 'New',
        team_id: task.team_id || '',
        work_center_id: task.work_center_id || '',
        maintenance_type: task.maintenance_type || '',
        duration: task.duration || '',
        frequency: task.frequency || '',
      });
    } else {
      setFormData({
        task_name: '',
        type: 'Corrective',
        subject: '',
        equipment_id: '',
        assigned_by: user?.id || '',
        assigned_to: '',
        due_date: '',
        scheduled_date: '',
        priority: 'Medium',
        stage: 'New',
        team_id: '',
        work_center_id: '',
        maintenance_type: '',
        duration: '',
        frequency: '',
      });
    }
  }, [task, isOpen, user]);

  const handleEquipmentChange = async (equipmentId) => {
    setFormData((prev) => ({ ...prev, equipment_id: equipmentId }));

    if (equipmentId) {
      try {
        const response = await axios.get(`/api/equipment/${equipmentId}`);
        const equipment = response.data;

        setFormData((prev) => ({
          ...prev,
          team_id: equipment.maintenance_team_id || prev.team_id,
          maintenance_type: equipment.category_name || prev.maintenance_type,
        }));
      } catch (error) {
        console.error('Error fetching equipment:', error);
      }
    }
  };

  // Compute available assignees based on selected team (or fallback to all users)
  const selectedTeamId = Number(formData.team_id) || null;
  const teamMembers = React.useMemo(() => {
    if (!selectedTeamId) return null;
    const team = teamList?.find((t) => Number(t.id) === selectedTeamId);
    return team?.members || null;
  }, [teamList, selectedTeamId]);

  const availableAssignees = React.useMemo(() => {
    const allUsers = (userList || []).filter((u) => u.id !== user?.id);
    const teamUsers = (teamMembers || []).filter((u) => u.id !== user?.id);
    return teamUsers.length > 0 ? teamUsers : allUsers;
  }, [teamMembers, userList, user]);

  // If team changes and current assigned_to is not valid, clear it
  useEffect(() => {
    if (!formData.assigned_to) return;
    const valid = availableAssignees.some((u) => String(u.id) === String(formData.assigned_to));
    if (!valid) {
      setFormData((prev) => ({ ...prev, assigned_to: '' }));
    }
  }, [availableAssignees]);

  // Auto-select the first available technician when team selection provides options
  useEffect(() => {
    if (formData.assigned_to) return; // don't override user's selection
    if (availableAssignees && availableAssignees.length > 0) {
      setFormData((prev) => ({ ...prev, assigned_to: String(availableAssignees[0].id) }));
    }
  }, [availableAssignees]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const norm = (v) => (v === '' || v === undefined ? null : v);
    const payload = {
      ...formData,
      equipment_id: norm(formData.equipment_id),
      assigned_by: norm(formData.assigned_by),
      assigned_to: norm(formData.assigned_to),
      due_date: norm(formData.due_date),
      scheduled_date: formData.scheduled_date
        ? new Date(formData.scheduled_date).toISOString()
        : null,
      team_id: norm(formData.team_id),
      work_center_id: norm(formData.work_center_id),
      maintenance_type: norm(formData.maintenance_type),
      duration: norm(formData.duration),
      frequency: norm(formData.frequency),
    };
    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Task Activity</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name *
              </label>
              <input
                type="text"
                name="task_name"
                value={formData.task_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Corrective">Corrective</option>
                <option value="Preventive">Preventive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject/Description
              </label>
              <textarea
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned By</label>
              <select
                name="assigned_by"
                value={formData.assigned_by}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select user</option>
                {userList?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select user</option>
                {availableAssignees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time</label>
              <input
                type="datetime-local"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Repaired">Repaired</option>
                <option value="Scrap">Scrap</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
              <select
                name="equipment_id"
                value={formData.equipment_id}
                onChange={(e) => handleEquipmentChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select equipment</option>
                {equipmentList?.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.name} {equipment.serial_number ? `(${equipment.serial_number})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Center</label>
              <select
                name="work_center_id"
                value={formData.work_center_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select work center</option>
                {workCenterList?.map((wc) => (
                  <option key={wc.id} value={wc.id}>
                    {wc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
              <select
                name="maintenance_type"
                value={formData.maintenance_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="Repair">Repair</option>
                <option value="Inspection">Inspection</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                step="0.5"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select frequency</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

