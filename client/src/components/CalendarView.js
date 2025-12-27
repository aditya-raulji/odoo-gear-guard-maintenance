import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';

const CalendarView = ({ requests, onTaskClick }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getTasksForDate = (date) => {
    return requests.filter((request) => {
      if (!request.scheduled_date) return false;
      const taskDate = new Date(request.scheduled_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const tasks = getTasksForDate(date);
      if (tasks.length > 0) {
        return (
          <div className="mt-1 flex justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  const tasksForSelectedDate = getTasksForDate(selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          className="bg-white rounded-lg shadow-md p-4"
        />
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          Tasks for {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        {tasksForSelectedDate.length === 0 ? (
          <p className="text-gray-500">No tasks scheduled for this date</p>
        ) : (
          <div className="space-y-3">
            {tasksForSelectedDate.map((task) => (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <h4 className="font-medium text-gray-900">{task.task_name}</h4>
                <p className="text-sm text-gray-600">{task.equipment_name || 'No Equipment'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {task.scheduled_date && format(new Date(task.scheduled_date), 'hh:mm a')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;

