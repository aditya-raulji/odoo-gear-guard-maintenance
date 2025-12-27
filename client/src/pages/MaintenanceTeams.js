import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import TeamModal from '../components/TeamModal';

const MaintenanceTeams = () => {
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, usersRes] = await Promise.all([
        axios.get('/api/maintenance-teams'),
        axios.get('/api/users').catch(() => ({ data: [] })),
      ]);

      setTeams(teamsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedTeam) {
        await axios.put(`/api/maintenance-teams/${selectedTeam.id}`, formData);
      } else {
        await axios.post('/api/maintenance-teams', formData);
      }
      setIsModalOpen(false);
      setSelectedTeam(null);
      fetchData();
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Error saving team');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await axios.delete(`/api/maintenance-teams/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting team:', error);
        alert('Error deleting team');
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
        <h1 className="text-3xl font-bold text-gray-900">View Teams</h1>
        <button
          onClick={() => {
            setSelectedTeam(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <FiPlus className="mr-2" />
          New Team
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Members</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teams.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No teams found
                </td>
              </tr>
            ) : (
              teams.map((team) => (
                <tr
                  key={team.id}
                  onClick={() => {
                    setSelectedTeam(team);
                    setIsModalOpen(true);
                  }}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{team.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {team.members?.map((m) => m.name).join(', ') || 'No members'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{team.company_name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTeam(team);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(team.id);
                        }}
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

      <TeamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
        onSave={handleSave}
        users={users}
      />
    </div>
  );
};

export default MaintenanceTeams;

