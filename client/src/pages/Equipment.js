import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiSettings, FiSearch } from 'react-icons/fi';
import EquipmentModal from '../components/EquipmentModal';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [categories, setCategories] = useState([]);
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState({ department: '', employee: '', category: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchTerm, filterBy]);

  const fetchData = async () => {
    try {
      const [equipmentRes, categoriesRes, teamsRes] = await Promise.all([
        axios.get('/api/equipment'),
        axios.get('/api/equipment-categories'),
        axios.get('/api/maintenance-teams'),
      ]);

      setEquipment(equipmentRes.data);
      setCategories(categoriesRes.data);
      setTeams(teamsRes.data);

      // You might need to create endpoints for departments and users
      try {
        const usersRes = await axios.get('/api/users');
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEquipment = () => {
    let filtered = equipment;

    if (searchTerm) {
      filtered = filtered.filter(
        (eq) =>
          eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eq.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterBy.department) {
      filtered = filtered.filter((eq) => eq.department_id?.toString() === filterBy.department);
    }

    if (filterBy.employee) {
      filtered = filtered.filter((eq) => eq.employee_id?.toString() === filterBy.employee);
    }

    if (filterBy.category) {
      filtered = filtered.filter((eq) => eq.category_id?.toString() === filterBy.category);
    }

    setFilteredEquipment(filtered);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedEquipment) {
        await axios.put(`/api/equipment/${selectedEquipment.id}`, formData);
      } else {
        await axios.post('/api/equipment', formData);
      }
      setIsModalOpen(false);
      setSelectedEquipment(null);
      fetchData();
    } catch (error) {
      console.error('Error saving equipment:', error);
      alert('Error saving equipment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await axios.delete(`/api/equipment/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting equipment:', error);
        alert('Error deleting equipment');
      }
    }
  };

  const handleMaintenanceClick = async (equipment) => {
    // Navigate to maintenance requests filtered by this equipment
    window.location.href = `/maintenance?equipment=${equipment.id}`;
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
        <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
        <button
          onClick={() => {
            setSelectedEquipment(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <FiPlus className="mr-2" />
          New Equipment
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterBy.category}
            onChange={(e) => setFilterBy({ ...filterBy, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={filterBy.department}
            onChange={(e) => setFilterBy({ ...filterBy, department: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {/* Add departments when available */}
          </select>
          <select
            value={filterBy.employee}
            onChange={(e) => setFilterBy({ ...filterBy, employee: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Employees</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maintenance Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEquipment.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No equipment found
                </td>
              </tr>
            ) : (
              filteredEquipment.map((eq) => (
                <tr key={eq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{eq.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{eq.serial_number || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{eq.category_name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{eq.location || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{eq.team_name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMaintenanceClick(eq)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <FiSettings className="mr-1" />
                        Maintenance
                        {eq.open_requests_count > 0 && (
                          <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {eq.open_requests_count}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEquipment(eq);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(eq.id)}
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

      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEquipment(null);
        }}
        equipment={selectedEquipment}
        onSave={handleSave}
        categories={categories}
        teams={teams}
        users={users}
      />
    </div>
  );
};

export default Equipment;

