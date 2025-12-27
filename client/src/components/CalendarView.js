import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';

// Props:
// - requests: array of tasks
// - onTaskClick(task)
// - onCreate(date: Date)
const CalendarView = ({ requests, onTaskClick, onCreate }) => {
  const events = (requests || []).map((r) => ({
    id: r.id?.toString(),
    title: r.task_name || r.subject || 'Request',
    start: r.scheduled_date || r.due_date,
    end: r.scheduled_date || r.due_date,
    extendedProps: r,
  })).filter(e => !!e.start);

  return (
    <div className="card p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        nowIndicator={true}
        height="auto"
        events={events}
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          const task = info.event.extendedProps;
          onTaskClick && onTaskClick(task);
        }}
        dateClick={(info) => {
          // Create a preventive request scheduled at clicked slot
          if (onCreate) {
            onCreate(info.date);
          }
        }}
      />
    </div>
  );
};

export default CalendarView;

