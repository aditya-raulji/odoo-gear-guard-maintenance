import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiCalendar, FiList } from 'react-icons/fi';
import TaskModal from '../components/TaskModal';
import CalendarView from '../components/CalendarView';

const MaintenanceRequests = () => {
  const [searchParams] = useSearchParams();
  const equipmentFilter = searchParams.get('equipment');
  const taskId = searchParams.get('task');
  
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState('kanban'); // kanban, calendar, list
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [workCenterList, setWorkCenterList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [equipmentFilter]);

  useEffect(() => {
    if (taskId) {
      // Fetch and open the specific task
      axios.get(`/api/maintenance-requests/${taskId}`).then((res) => {
        setSelectedTask(res.data);
        setIsModalOpen(true);
      }).catch(console.error);
    }
  }, [taskId]);

  const fetchData = async () => {
    try {
      const requestsUrl = equipmentFilter 
        ? `/api/maintenance-requests?equipment_id=${equipmentFilter}`
        : '/api/maintenance-requests';
      
      const [requestsRes, equipmentRes, teamsRes, workCentersRes] = await Promise.all([
        axios.get(requestsUrl),
        axios.get('/api/equipment'),
        axios.get('/api/maintenance-teams'),
        axios.get('/api/work-centers'),
      ]);

      setRequests(requestsRes.data);
      setEquipmentList(equipmentRes.data);
      setTeamList(teamsRes.data);
      setWorkCenterList(workCentersRes.data);

      // Fetch users (you might need to create a users endpoint)
      try {
        const usersRes = await axios.get('/api/users');
        setUserList(usersRes.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStage = destination.droppableId;

    try {
      const task = requests.find((r) => r.id.toString() === draggableId);
      if (!task) return;

      await axios.put(`/api/maintenance-requests/${draggableId}`, {
        ...task,
        stage: newStage,
      });

      // Update local state
      setRequests((prev) =>
        prev.map((r) => (r.id.toString() === draggableId ? { ...r, stage: newStage } : r))
      );
    } catch (error) {
      console.error('Error updating task stage:', error);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedTask) {
        await axios.put(`/api/maintenance-requests/${selectedTask.id}`, formData);
      } else {
        await axios.post('/api/maintenance-requests', formData);
      }
      setIsModalOpen(false);
      setSelectedTask(null);
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task');
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const stages = ['New', 'In Progress', 'Repaired', 'Scrap'];

  const getStageColor = (stage) => {
    switch (stage) {
      case 'New':
        return 'bg-blue-50 border-blue-200';
      case 'In Progress':
        return 'bg-yellow-50 border-yellow-200';
      case 'Repaired':
        return 'bg-green-50 border-green-200';
      case 'Scrap':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getRequestsByStage = (stage) => {
    return requests.filter((r) => r.stage === stage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (view === 'calendar') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('kanban')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiList className="inline mr-2" />
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiList className="inline mr-2" />
              List
            </button>
            <button
              onClick={() => {
                setSelectedTask(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FiPlus className="mr-2" />
              New Request
            </button>
          </div>
        </div>
        <CalendarView requests={requests.filter((r) => r.type === 'Preventive')} onTaskClick={handleTaskClick} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('calendar')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FiCalendar className="mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FiList className="mr-2" />
            List
          </button>
          <button
            onClick={() => {
              setSelectedTask(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FiPlus className="mr-2" />
            New Request
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stages.map((stage) => (
              <Droppable key={stage} droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`${getStageColor(stage)} rounded-lg p-4 border-2 ${
                      snapshot.isDraggingOver ? 'border-blue-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{stage}</h3>
                      <span className="bg-white px-2 py-1 rounded-full text-sm font-medium">
                        {getRequestsByStage(stage).length}
                      </span>
                    </div>
                    <div className="space-y-3 min-h-[200px]">
                      {getRequestsByStage(stage).map((request, index) => (
                        <Draggable
                          key={request.id}
                          draggableId={request.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleTaskClick(request)}
                              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                                request.is_overdue ? 'border-l-4 border-red-500' : ''
                              } ${snapshot.isDragging ? 'shadow-xl' : ''}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{request.task_name}</h4>
                                {request.is_overdue && (
                                  <span className="text-red-500 text-xs font-semibold">OVERDUE</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{request.equipment_name || 'No Equipment'}</p>
                              {request.assigned_to_name && (
                                <div className="flex items-center mt-2">
                                  <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium mr-2">
                                    {request.assigned_to_name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-xs text-gray-600">{request.assigned_to_name}</span>
                                </div>
                              )}
                              {request.due_date && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Due: {new Date(request.due_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr
                  key={request.id}
                  onClick={() => handleTaskClick(request)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.task_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.equipment_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.is_overdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {request.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.assigned_to_name || 'Unassigned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleSave}
        equipmentList={equipmentList}
        teamList={teamList}
        userList={userList}
        workCenterList={workCenterList}
      />
    </div>
  );
};

export default MaintenanceRequests;

