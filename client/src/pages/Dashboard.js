import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiAlertCircle, FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    overdue_tasks: 0,
    upcoming_tasks: 0,
    completed_tasks: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [filter]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get(`/api/dashboard/tasks${filter ? `?status=${filter}` : ''}`),
      ]);

      setStats(statsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoxClick = (status) => {
    setFilter(status === filter ? null : status);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue) return 'text-red-600 bg-red-50 border-red-200';
    if (status === 'Repaired') return 'text-green-600 bg-green-50 border-green-200';
    if (status === 'In Progress') return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => handleBoxClick('overdue')}
          className={`card p-6 cursor-pointer hover:shadow-lg transition-shadow ${
            filter === 'overdue' ? 'ring-2 ring-red-400' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 font-medium mb-1">Overdue Tasks</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdue_tasks}</p>
            </div>
            <FiAlertCircle className="text-red-600" size={32} />
          </div>
        </div>

        <div
          onClick={() => handleBoxClick('upcoming')}
          className={`card p-6 cursor-pointer hover:shadow-lg transition-shadow ${
            filter === 'upcoming' ? 'ring-2 ring-blue-400' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium mb-1">Upcoming Tasks</p>
              <p className="text-3xl font-bold text-blue-600">{stats.upcoming_tasks}</p>
            </div>
            <FiClock className="text-blue-600" size={32} />
          </div>
        </div>

        <div
          onClick={() => handleBoxClick('completed')}
          className={`card p-6 cursor-pointer hover:shadow-lg transition-shadow ${
            filter === 'completed' ? 'ring-2 ring-green-400' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium mb-1">Completed Tasks</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed_tasks}</p>
            </div>
            <FiCheckCircle className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/60">
          <h2 className="text-xl font-semibold text-gray-900">
            {filter ? `Tasks - ${filter.charAt(0).toUpperCase() + filter.slice(1)}` : 'All Tasks'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/70">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/70">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => navigate(`/maintenance?task=${task.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.task_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{task.equipment_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${task.is_overdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                        {formatDate(task.due_date || task.scheduled_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                          task.stage,
                          task.is_overdue
                        )}`}
                      >
                        {task.is_overdue && '⚠ '}
                        {task.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium mr-2">
                          {task.assigned_to_name
                            ? task.assigned_to_name.charAt(0).toUpperCase()
                            : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-900">{task.assigned_to_name || 'Unassigned'}</div>
                      </div>
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

export default Dashboard;

